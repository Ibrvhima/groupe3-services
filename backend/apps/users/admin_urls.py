from django.urls import path
from .views import (
    StatsView,
    AdminPrestataireListView,
    AdminPrestataireUpdateView,
    AdminClientListView,
    AdminUserDeleteView,
    AdminDemandeListView,
)

urlpatterns = [
    # Statistiques globales du tableau de bord
    path('stats/',                        StatsView.as_view(),                  name='admin-stats'),

    # Gestion des prestataires
    path('prestataires/',                 AdminPrestataireListView.as_view(),   name='admin-prestataires-list'),
    path('prestataires/<int:pk>/',        AdminPrestataireUpdateView.as_view(), name='admin-prestataires-update'),

    # Gestion des clients
    path('clients/',                      AdminClientListView.as_view(),        name='admin-clients-list'),

    # Suppression d'un compte (client ou prestataire)
    path('users/<int:pk>/',               AdminUserDeleteView.as_view(),        name='admin-user-delete'),

    # Liste de toutes les demandes
    path('demandes/',                     AdminDemandeListView.as_view(),       name='admin-demandes-list'),
]
