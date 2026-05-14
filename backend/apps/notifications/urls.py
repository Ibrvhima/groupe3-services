from django.urls import path
from .views import NotificationListView, marquer_toutes_lues, marquer_lue

urlpatterns = [
    # Liste des notifications de l'utilisateur connecté
    path('notifications/',              NotificationListView.as_view(), name='notifications-list'),

    # Marquer toutes les notifications comme lues
    path('notifications/lire/',         marquer_toutes_lues,            name='notifications-lire-toutes'),

    # Marquer une notification spécifique comme lue
    path('notifications/<int:pk>/lire/', marquer_lue,                   name='notification-lire'),
]
