from django.urls import path

from . import views


urlpatterns = [
    path("publico", views.publico, name="publico"),
    path("privado", views.privado, name="privado"),
]
