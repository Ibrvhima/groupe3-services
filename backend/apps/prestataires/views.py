from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Categorie, Prestataire
from .serializers import CategorieSerializer, PrestataireSerializer, PrestataireWriteSerializer


class CategorieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Categorie.objects.all()
    serializer_class   = CategorieSerializer
    permission_classes = [permissions.AllowAny]


class PrestataireViewSet(viewsets.ModelViewSet):
    queryset        = Prestataire.objects.filter(
                        user__is_active=True,
                        statut='approuve'
                      ).select_related('user', 'categorie')
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields   = ['user__nom', 'user__prenom', 'quartier', 'description']
    ordering_fields = ['note_moyenne', 'created_at']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PrestataireWriteSerializer
        return PrestataireSerializer

    def get_queryset(self):
        qs        = super().get_queryset()
        categorie = self.request.query_params.get('categorie')
        quartier  = self.request.query_params.get('quartier')
        if categorie:
            qs = qs.filter(categorie__id=categorie)
        if quartier:
            qs = qs.filter(quartier__icontains=quartier)
        return qs

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], url_path='en-attente')
    def en_attente(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)
        prestataires = Prestataire.objects.filter(
            statut='en_attente'
        ).select_related('user', 'categorie')
        serializer = PrestataireSerializer(prestataires, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['patch'], url_path='approuver')
    def approuver(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)
        prestataire = Prestataire.objects.get(pk=pk)
        prestataire.statut = 'approuve'
        prestataire.save()
        return Response({'message': 'Prestataire approuvé avec succès.'})

    @action(detail=True, methods=['patch'], url_path='rejeter')
    def rejeter(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)
        prestataire = Prestataire.objects.get(pk=pk)
        prestataire.statut = 'rejete'
        prestataire.save()
        return Response({'message': 'Prestataire rejeté.'})
    

    # Endpoit pour activer la verfication des prestataires

    @action(detail=True, methods=['patch'], url_path='verifier')
    def verifier(self, request, pk=None):
        if request.user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)
        prestataire = Prestataire.objects.get(pk=pk)
        prestataire.badge_verifie = True
        prestataire.save()
        return Response({'message': 'Prestataire vérifié avec succès.'})