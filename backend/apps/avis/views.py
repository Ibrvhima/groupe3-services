from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from .models import Avis
from .serializers import AvisSerializer
from apps.demandes.models import Demande


class AvisViewSet(viewsets.ModelViewSet):
    serializer_class = AvisSerializer
    permission_classes = [IsAuthenticated]
    queryset = Avis.objects.all()  # Ajout du queryset par défaut

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            # Les clients voient leurs propres avis
            return Avis.objects.filter(client=user)
        elif user.role == 'prestataire':
            # Les prestataires voient les avis qu'ils ont reçus
            return Avis.objects.filter(prestataire__user=user)
        elif user.role == 'admin':
            # Les admins voient tous les avis
            return Avis.objects.all()
        return Avis.objects.none()
        user = self.request.user
        if user.role == 'client':
            # Les clients voient leurs propres avis
            return Avis.objects.filter(client=user)
        elif user.role == 'prestataire':
            # Les prestataires voient les avis qu'ils ont reçus
            return Avis.objects.filter(prestataire__user=user)
        elif user.role == 'admin':
            # Les admins voient tous les avis
            return Avis.objects.all()
        return Avis.objects.none()

    def perform_create(self, serializer):
        # Associer automatiquement le client connecté
        serializer.save(client=self.request.user)

    @action(detail=False, methods=['post'], url_path='donner-avis')
    def donner_avis(self, request):
        """Permet à un client de donner un avis pour une demande terminée"""
        demande_id = request.data.get('demande_id')
        note = request.data.get('note')
        commentaire = request.data.get('commentaire', '')

        if not demande_id or not note:
            return Response(
                {'error': 'demande_id et note sont requis'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            demande = Demande.objects.get(id=demande_id, client=request.user)
        except Demande.DoesNotExist:
            return Response(
                {'error': 'Demande non trouvée ou vous n\'êtes pas le propriétaire'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Vérifier que la demande est terminée
        if demande.statut != 'terminee':
            return Response(
                {'error': 'Vous ne pouvez donner un avis que pour une demande terminée'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Vérifier qu'un avis n'existe pas déjà
        if Avis.objects.filter(demande=demande).exists():
            return Response(
                {'error': 'Un avis existe déjà pour cette demande'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Créer l'avis
        avis = Avis.objects.create(
            demande=demande,
            client=request.user,
            prestataire=demande.prestataire,
            note=note,
            commentaire=commentaire
        )

        serializer = self.get_serializer(avis)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
