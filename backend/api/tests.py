from datetime import date, timedelta
from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import override_settings
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from rest_framework_simplejwt.tokens import AccessToken

from .models import Pedido


@override_settings(
    CORS_ALLOW_ALL_ORIGINS=False,
    CORS_ALLOWED_ORIGINS=["http://127.0.0.1:5173"],
)
class AuthApiTests(APITestCase):
    password = "CompraLocal-15!"

    @classmethod
    def setUpTestData(cls):
        users = get_user_model().objects
        cls.cliente = users.create_user(username="cliente", password=cls.password)
        otro = users.create_user(username="otro-cliente", password=cls.password)
        Pedido.objects.create(
            cliente=cls.cliente,
            codigo="PED-PROPIO",
            fecha=date(2026, 11, 18),
            estado=Pedido.Estado.ENTREGADO,
            total=Decimal("149.90"),
        )
        Pedido.objects.create(
            cliente=otro,
            codigo="PED-AJENO",
            fecha=date(2026, 11, 19),
            estado=Pedido.Estado.PREPARACION,
            total=Decimal("81.00"),
        )

    def login(self, password=None):
        return self.client.post(
            reverse("token_obtain_pair"),
            {"username": self.cliente.get_username(), "password": password or self.password},
            format="json",
        )

    def get_privado(self, token):
        return self.client.get(reverse("privado"), HTTP_AUTHORIZATION=f"Bearer {token}")

    def refresh(self, token):
        return self.client.post(reverse("token_refresh"), {"refresh": token}, format="json")

    def test_publico_permite_solicitud_anonima(self):
        response = self.client.get(reverse("publico"))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json(), {"mensaje": "acceso publico"})

    def test_privado_exige_bearer_y_evita_cache(self):
        response = self.client.get(reverse("privado"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertTrue(response["WWW-Authenticate"].startswith("Bearer"))
        self.assertIn("no-store", response["Cache-Control"])

    def test_credenciales_validas_emiten_access_y_refresh(self):
        response = self.login()
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(set(response.json()), {"access", "refresh"})
        self.assertIn("no-store", response["Cache-Control"])

    def test_clave_incorrecta_no_emite_tokens(self):
        response = self.login(password="clave-incorrecta")
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertNotIn("access", response.json())
        self.assertNotIn("refresh", response.json())

    def test_privado_devuelve_solo_los_pedidos_del_usuario(self):
        response = self.get_privado(self.login().json()["access"])
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()["usuario"], "cliente")
        self.assertEqual(
            response.json()["pedidos"],
            [
                {
                    "codigo": "PED-PROPIO",
                    "fecha": "2026-11-18",
                    "estado": "Entregado",
                    "total": "149.90",
                }
            ],
        )

    def test_refresh_no_es_un_token_de_acceso(self):
        response = self.get_privado(self.login().json()["refresh"])
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_access_expirado_es_rechazado(self):
        token = AccessToken.for_user(self.cliente)
        token.set_exp(lifetime=timedelta(seconds=-2))
        response = self.get_privado(str(token))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.json()["code"], "token_not_valid")

    def test_renovacion_rota_e_invalida_el_refresh_anterior(self):
        original = self.login().json()["refresh"]
        response = self.refresh(original)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotEqual(response.json()["refresh"], original)
        self.assertEqual(self.get_privado(response.json()["access"]).status_code, status.HTTP_200_OK)
        self.assertEqual(self.refresh(original).status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cierre_revoca_refresh_y_access_vence_por_su_cuenta(self):
        tokens = self.login().json()
        response = self.client.post(
            reverse("token_logout"), {"refresh": tokens["refresh"]}, format="json"
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(self.refresh(tokens["refresh"]).status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(self.get_privado(tokens["access"]).status_code, status.HTTP_200_OK)

    def test_preflight_cors_permite_authorization_del_frontend(self):
        response = self.client.options(
            reverse("privado"),
            HTTP_ORIGIN="http://127.0.0.1:5173",
            HTTP_ACCESS_CONTROL_REQUEST_METHOD="GET",
            HTTP_ACCESS_CONTROL_REQUEST_HEADERS="authorization",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response["Access-Control-Allow-Origin"], "http://127.0.0.1:5173")
        self.assertIn("authorization", response["Access-Control-Allow-Headers"])

    def test_cors_omite_permiso_para_origen_no_configurado(self):
        response = self.client.get(reverse("publico"), HTTP_ORIGIN="http://127.0.0.1:5100")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("Access-Control-Allow-Origin", response)
