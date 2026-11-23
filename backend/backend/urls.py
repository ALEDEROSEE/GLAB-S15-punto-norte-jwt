from django.contrib import admin
from django.urls import include, path
from django.views.decorators.cache import never_cache
from rest_framework_simplejwt.views import (
    TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api-auth/", include("rest_framework.urls")),
    path("api/token/", never_cache(TokenObtainPairView.as_view()), name="token_obtain_pair"),
    path("api/token/refresh/", never_cache(TokenRefreshView.as_view()), name="token_refresh"),
    path("api/token/logout/", never_cache(TokenBlacklistView.as_view()), name="token_logout"),
    path("api/", include("api.urls")),
]
