from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from .models import Demande
from .serializers import DemandeSerializer, DemandeCreateSerializer


class DemandeViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'create':
            return DemandeCreateSerializer
        return DemandeSerializer

    def get_queryset(self):
        user = self.request.user
        if user.role == 'prestataire':
            return Demande.objects.filter(
                prestataire__user=user
            ).select_related('client', 'prestataire__user', 'prestataire__categorie').order_by('-date_creation')
        return Demande.objects.filter(
            client=user
        ).select_related('prestataire__user', 'prestataire__categorie').order_by('-date_creation')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role != 'client':
            raise PermissionDenied("Seuls les clients peuvent créer des demandes.")
        serializer.save(client=user)

    def _changer_statut(self, request, nouveau_statut, statuts_autorises, role_requis=None):
        demande = self.get_object()
        if role_requis and request.user.role != role_requis:
            raise PermissionDenied(f"Action réservée aux {role_requis}s.")
        if demande.statut not in statuts_autorises:
            raise ValidationError(f"Impossible : statut actuel '{demande.statut}'.")
        demande.statut = nouveau_statut
        demande.save()
        return Response(DemandeSerializer(demande).data)

    @action(detail=True, methods=['post'])
    def accepter(self, request, pk=None):
        return self._changer_statut(request, 'acceptee', ['en_attente'], 'prestataire')

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        return self._changer_statut(request, 'refusee', ['en_attente'], 'prestataire')

    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        return self._changer_statut(request, 'terminee', ['acceptee', 'en_cours'], 'prestataire')

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        demande = self.get_object()
        if request.user.role == 'client' and demande.client != request.user:
            raise PermissionDenied()
        if demande.statut not in ['en_attente', 'acceptee']:
            raise ValidationError(f"Impossible d'annuler une demande au statut '{demande.statut}'.")
        demande.statut = 'annulee'
        demande.save()
        return Response(DemandeSerializer(demande).data)
