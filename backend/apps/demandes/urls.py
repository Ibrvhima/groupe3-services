from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import DemandeViewSet

router = DefaultRouter()
router.register('demandes', DemandeViewSet, basename='demande')

urlpatterns = [
    path('', include(router.urls)),
]
