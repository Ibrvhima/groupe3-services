from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register('demandes', views.DemandeViewSet, basename='demande')

urlpatterns = [
    path('', include(router.urls)),
]