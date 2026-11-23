from django.conf import settings
from django.db import models


class Pedido(models.Model):
    class Estado(models.TextChoices):
        ENTREGADO = "entregado", "Entregado"
        PREPARACION = "preparacion", "En preparación"

    cliente = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    codigo = models.CharField(max_length=20, unique=True)
    fecha = models.DateField()
    estado = models.CharField(max_length=20, choices=Estado.choices)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        ordering = ["fecha", "codigo"]
