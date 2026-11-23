from django.views.decorators.cache import never_cache
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import Pedido
from .serializers import PedidoSerializer


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def publico(request):
    return Response({"mensaje": "acceso publico"})


@never_cache
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def privado(request):
    pedidos = Pedido.objects.filter(cliente=request.user)
    return Response(
        {
            "mensaje": "acceso privado",
            "usuario": request.user.get_username(),
            "pedidos": PedidoSerializer(pedidos, many=True).data,
        }
    )
