import os
from datetime import date
from decimal import Decimal

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction

from ...models import Pedido


DEMO_USERNAME = "cliente.demo"
DEMO_PASSWORD = "Lab15-Cliente-demo!"


class Command(BaseCommand):
    help = "Crea el cliente local de demostración y dos pedidos ficticios."

    @transaction.atomic
    def handle(self, *args, **options):
        if not settings.DEBUG:
            raise CommandError("El usuario de demostración requiere DJANGO_DEBUG=1.")

        users = get_user_model().objects
        password = os.environ.get("LAB15_DEMO_PASSWORD", DEMO_PASSWORD)
        usuario = users.filter(username=DEMO_USERNAME).first()
        if usuario is None:
            usuario = users.create_user(username=DEMO_USERNAME, password=password)
        elif (
            not usuario.is_active
            or usuario.is_staff
            or usuario.is_superuser
            or not usuario.check_password(password)
        ):
            raise CommandError("El usuario de demostración existe con otros permisos o credenciales.")

        datos = (
            ("PED-1042", date(2026, 11, 18), Pedido.Estado.ENTREGADO, Decimal("149.90")),
            ("PED-1051", date(2026, 11, 21), Pedido.Estado.PREPARACION, Decimal("89.00")),
        )
        for codigo, fecha, estado, total in datos:
            Pedido.objects.update_or_create(
                codigo=codigo,
                cliente=usuario,
                defaults={"fecha": fecha, "estado": estado, "total": total},
            )

        self.stdout.write(self.style.SUCCESS(f"Cliente {DEMO_USERNAME} y 2 pedidos listos."))
