from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied, ValidationError
from django.shortcuts import get_object_or_404

from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from apps.demandes.models import Demande
from apps.notifications.models import Notification


class ConversationViewSet(viewsets.GenericViewSet):
    permission_classes = [permissions.IsAuthenticated]
    serializer_class   = ConversationSerializer

    def get_queryset(self):
        from django.db.models import Q
        user = self.request.user
        return Conversation.objects.filter(Q(client=user) | Q(prestataire=user))

    def list(self, request):
        qs = self.get_queryset().select_related('client', 'prestataire', 'demande').prefetch_related('messages')
        return Response(self.get_serializer(qs, many=True).data)

    def retrieve(self, request, pk=None):
        conv = get_object_or_404(self.get_queryset(), pk=pk)
        return Response(self.get_serializer(conv).data)

    @action(detail=False, methods=['post'], url_path='ouvrir')
    def ouvrir(self, request):
        demande_id = request.data.get('demande_id')
        if not demande_id:
            raise ValidationError({'demande_id': 'Ce champ est requis.'})

        demande = get_object_or_404(Demande, pk=demande_id)

        user = request.user
        prestataire_user = demande.prestataire.user
        if user != demande.client and user != prestataire_user:
            raise PermissionDenied("Vous n'êtes pas autorisé à accéder à cette conversation.")

        conv, _ = Conversation.objects.get_or_create(
            demande=demande,
            defaults={
                'client':      demande.client,
                'prestataire': prestataire_user,
            }
        )
        return Response(self.get_serializer(conv).data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['get'], url_path='messages')
    def messages(self, request, pk=None):
        conv = get_object_or_404(self.get_queryset(), pk=pk)
        msgs = conv.messages.select_related('expediteur').all()
        msgs.filter(lu=False).exclude(expediteur=request.user).update(lu=True)
        return Response(MessageSerializer(msgs, many=True).data)

    @action(detail=True, methods=['post'], url_path='messages/envoyer')
    def envoyer_message(self, request, pk=None):
        conv = get_object_or_404(self.get_queryset(), pk=pk)

        contenu = request.data.get('contenu', '').strip()
        if not contenu:
            raise ValidationError({'contenu': 'Le message ne peut pas être vide.'})

        msg = Message.objects.create(
            conversation=conv,
            expediteur=request.user,
            contenu=contenu,
        )

        destinataire = conv.prestataire if request.user == conv.client else conv.client
        Notification.objects.create(
            user=destinataire,
            titre=f"Nouveau message de {request.user.prenom} {request.user.nom}",
            message=contenu[:100],
        )

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
