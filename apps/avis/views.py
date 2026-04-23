from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Avis
from .serializers import AvisSerializer, AvisWriteSerializer


class AvisViewSet(viewsets.ModelViewSet):
    queryset           = Avis.objects.all().select_related('client', 'prestataire__user', 'demande')
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action == 'create':
            return AvisWriteSerializer
        return AvisSerializer

    def get_queryset(self):
        qs              = super().get_queryset()
        prestataire_id  = self.request.query_params.get('prestataire')
        client_id       = self.request.query_params.get('client')

        if prestataire_id:
            qs = qs.filter(prestataire__id=prestataire_id)

        if client_id:
            qs = qs.filter(client__id=client_id)

        return qs

    def perform_create(self, serializer):
        """
        Le client et le prestataire sont remplis automatiquement.
        Le client = user connecté.
        Le prestataire = celui de la demande.
        """
        demande = serializer.validated_data['demande']
        
        # SÉCURITÉ : Vérifier que le user connecté est bien le client de la demande
        if demande.client != self.request.user:
            raise PermissionDenied("Vous ne pouvez noter que vos propres demandes.")
        
        serializer.save(
            client      = self.request.user,
            prestataire = demande.prestataire
        )

    def perform_update(self, serializer):
        # Seul le client auteur peut modifier son avis
        if serializer.instance.client != self.request.user:
            raise PermissionDenied("Vous ne pouvez modifier que vos propres avis.")
        serializer.save()

    def perform_destroy(self, instance):
        # Seul le client auteur peut supprimer son avis
        if instance.client != self.request.user:
            raise PermissionDenied("Vous ne pouvez supprimer que vos propres avis.")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mes_avis(self, request):
        """
        GET /api/avis/avis/mes_avis/
        Retourne tous les avis laissés par le client connecté.
        """
        avis       = Avis.objects.filter(client=request.user).select_related('client', 'prestataire__user', 'demande')
        serializer = AvisSerializer(avis, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def avis_recus(self, request):
        """
        GET /api/avis/avis/avis_recus/
        Retourne tous les avis reçus par le prestataire connecté.
        """
        avis       = Avis.objects.filter(prestataire__user=request.user).select_related('client', 'prestataire__user', 'demande')
        serializer = AvisSerializer(avis, many=True)
        return Response(serializer.data)