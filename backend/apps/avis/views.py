from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Avis
from .serializers import AvisSerializer
from apps.demandes.models import Demande


class AvisViewSet(viewsets.ModelViewSet):
    serializer_class   = AvisSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        prestataire_id = self.request.query_params.get('prestataire')
        if prestataire_id:
            return Avis.objects.filter(prestataire__id=prestataire_id).order_by('-date')
        return Avis.objects.filter(client=self.request.user).order_by('-date')

    def perform_create(self, serializer):
        demande = serializer.validated_data['demande']

        if demande.statut != 'terminee':
            raise ValidationError('La demande doit être terminée pour laisser un avis.')
        if demande.client != self.request.user:
            raise ValidationError('Vous ne pouvez pas noter cette demande.')
        if Avis.objects.filter(demande=demande).exists():
            raise ValidationError('Vous avez déjà laissé un avis pour cette demande.')

        serializer.save(
            client=self.request.user,
            prestataire=demande.prestataire
        )