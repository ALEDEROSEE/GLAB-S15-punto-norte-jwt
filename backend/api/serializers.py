from rest_framework import serializers

from .models import Pedido


class PedidoSerializer(serializers.ModelSerializer):
    estado = serializers.CharField(source="get_estado_display", read_only=True)

    class Meta:
        model = Pedido
        fields = ("codigo", "fecha", "estado", "total")
