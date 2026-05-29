from django.db import transaction
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from .models import Devis
from .serializers import DevisSerializer, DevisCreateSerializer
from apps.demandes.models import Demande
from apps.notifications.models import Notification


def _notifier(user, titre, message):
    Notification.objects.create(user=user, titre=titre, message=message)


class DevisViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    http_method_names  = ['get', 'post', 'head', 'options']

    def get_serializer_class(self):
        if self.action == 'create':
            return DevisCreateSerializer
        return DevisSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(DevisSerializer(serializer.instance).data, status=status.HTTP_201_CREATED)

    def get_queryset(self):
        user = self.request.user
        if user.role == 'prestataire':
            return Devis.objects.filter(
                demande__prestataire__user=user
            ).select_related('demande__client', 'demande__prestataire__user')
        return Devis.objects.filter(
            demande__client=user
        ).select_related('demande__client', 'demande__prestataire__user')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'prestataire':
            raise PermissionDenied("Seuls les prestataires peuvent créer un devis.")

        demande = serializer.validated_data['demande']

        if demande.prestataire.user != user:
            raise PermissionDenied("Vous n'êtes pas le prestataire de cette demande.")

        if demande.statut != 'en_attente':
            raise ValidationError(
                f"Impossible de créer un devis pour une demande au statut '{demande.statut}'."
            )

        with transaction.atomic():
            if hasattr(demande, 'devis'):
                if demande.devis.statut == 'refuse':
                    demande.devis.delete()
                else:
                    raise ValidationError("Un devis est déjà en cours pour cette demande.")
            devis = serializer.save()

        _notifier(
            demande.client,
            "Nouveau devis reçu",
            f"{user.nom} {user.prenom} vous a envoyé un devis de "
            f"{devis.montant} GNF pour votre demande."
        )

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        devis = self.get_object()

        if request.user.role != 'client':
            raise PermissionDenied("Seuls les clients peuvent accepter un devis.")
        if devis.demande.client != request.user:
            raise PermissionDenied()
        if devis.statut != 'en_attente':
            raise ValidationError(f"Devis déjà '{devis.statut}'.")

        devis.statut = 'accepte'
        devis.save()
        devis.demande.statut = 'en_cours'
        devis.demande.save()

        _notifier(
            devis.demande.prestataire.user,
            "Devis accepté !",
            f"{request.user.nom} {request.user.prenom} a accepté votre devis. "
            f"La prestation est maintenant en cours."
        )
        return Response(DevisSerializer(devis).data)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        devis = self.get_object()

        if request.user.role != 'client':
            raise PermissionDenied("Seuls les clients peuvent refuser un devis.")
        if devis.demande.client != request.user:
            raise PermissionDenied()
        if devis.statut != 'en_attente':
            raise ValidationError(f"Devis déjà '{devis.statut}'.")

        devis.statut = 'refuse'
        devis.save()

        _notifier(
            devis.demande.prestataire.user,
            "Devis refusé",
            f"{request.user.nom} {request.user.prenom} a refusé votre devis. "
            f"Vous pouvez contacter le client pour renégocier."
        )
        return Response(DevisSerializer(devis).data)
