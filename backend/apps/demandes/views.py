from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.exceptions import ValidationError, PermissionDenied
from rest_framework.response import Response
from .models import Demande
from .serializers import DemandeSerializer, DemandeCreateSerializer
from apps.notifications.models import Notification


def _notifier(user, titre, message):
    Notification.objects.create(user=user, titre=titre, message=message)


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
        demande = serializer.save(client=user)

        # Notifier le prestataire qu'il a reçu une nouvelle demande
        _notifier(
            demande.prestataire.user,
            "Nouvelle demande reçue",
            f"{user.nom} {user.prenom} vous a envoyé une demande de service.",
        )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Retourne les compteurs par statut pour l'utilisateur connecté."""
        qs = self.get_queryset()
        return Response({
            'en_attente': qs.filter(statut='en_attente').count(),
            'acceptees':  qs.filter(statut__in=['acceptee', 'en_cours']).count(),
            'terminees':  qs.filter(statut='terminee').count(),
            'total':      qs.count(),
        })

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
        demande = self.get_object()
        if request.user.role != 'prestataire':
            raise PermissionDenied("Action réservée aux prestataires.")
        if demande.statut not in ['en_attente']:
            raise ValidationError(f"Impossible : statut actuel '{demande.statut}'.")
        # Bloquer si le client a refusé le devis
        if hasattr(demande, 'devis') and demande.devis.statut == 'refuse':
            raise ValidationError(
                "Le client a refusé votre devis. Vous ne pouvez pas accepter cette demande."
            )
        demande.statut = 'acceptee'
        demande.save()

        # Notifier le client
        _notifier(
            demande.client,
            "Demande acceptée",
            f"{request.user.nom} {request.user.prenom} a accepté votre demande.",
        )
        return Response(DemandeSerializer(demande).data)

    @action(detail=True, methods=['post'])
    def refuser(self, request, pk=None):
        demande = self.get_object()
        if request.user.role != 'prestataire':
            raise PermissionDenied("Action réservée aux prestataires.")
        if demande.statut not in ['en_attente']:
            raise ValidationError(f"Impossible : statut actuel '{demande.statut}'.")
        demande.statut = 'refusee'
        demande.save()

        # Notifier le client
        _notifier(
            demande.client,
            "Demande refusée",
            f"{request.user.nom} {request.user.prenom} n'est pas disponible pour votre demande.",
        )
        return Response(DemandeSerializer(demande).data)

    @action(detail=True, methods=['post'])
    def terminer(self, request, pk=None):
        demande = self.get_object()
        if request.user.role != 'prestataire':
            raise PermissionDenied("Action réservée aux prestataires.")
        if demande.statut not in ['acceptee', 'en_cours']:
            raise ValidationError(f"Impossible : statut actuel '{demande.statut}'.")
        demande.statut = 'terminee'
        demande.save()

        # Notifier le client
        _notifier(
            demande.client,
            "Prestation terminée",
            f"{request.user.nom} {request.user.prenom} a marqué la prestation comme terminée. "
            f"N'oubliez pas de laisser un avis !",
        )
        return Response(DemandeSerializer(demande).data)

    @action(detail=True, methods=['post'])
    def annuler(self, request, pk=None):
        demande = self.get_object()
        if request.user.role == 'client':
            if demande.client != request.user:
                raise PermissionDenied()
        elif request.user.role == 'prestataire':
            if demande.prestataire.user != request.user:
                raise PermissionDenied()
        else:
            raise PermissionDenied()
        if demande.statut not in ['en_attente', 'acceptee']:
            raise ValidationError(f"Impossible d'annuler une demande au statut '{demande.statut}'.")
        demande.statut = 'annulee'
        demande.save()
        return Response(DemandeSerializer(demande).data)
