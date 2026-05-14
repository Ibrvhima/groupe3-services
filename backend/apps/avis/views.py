from rest_framework import viewsets, permissions
from rest_framework.exceptions import ValidationError
from .models import Avis
from .serializers import AvisSerializer
from apps.demandes.models import Demande


class AvisViewSet(viewsets.ModelViewSet):
    serializer_class = AvisSerializer

    def get_permissions(self):
        # Lecture publique, écriture authentifiée
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        prestataire_id = self.request.query_params.get('prestataire')
        if prestataire_id:
            return Avis.objects.filter(prestataire__id=prestataire_id).select_related('client').order_by('-date')
        # Sans filtre : retourne les avis du client connecté
        if self.request.user.is_authenticated:
            return Avis.objects.filter(client=self.request.user).order_by('-date')
        return Avis.objects.none()

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