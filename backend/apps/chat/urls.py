from django.urls import path
from .views import ConversationViewSet

conv = ConversationViewSet.as_view

urlpatterns = [
    path('chat/conversations/',                            conv({'get': 'list'})),
    path('chat/conversations/ouvrir/',                     conv({'post': 'ouvrir'})),
    path('chat/conversations/<int:pk>/',                   conv({'get': 'retrieve'})),
    path('chat/conversations/<int:pk>/messages/',          conv({'get': 'messages'})),
    path('chat/conversations/<int:pk>/messages/envoyer/',  conv({'post': 'envoyer_message'})),
]
