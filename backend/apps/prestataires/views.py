from rest_framework import viewsets, permissions, filters
from .models import Categorie, Prestataire
from .serializers import CategorieSerializer, PrestataireSerializer, PrestataireWriteSerializer


class CategorieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Categorie.objects.all()
    serializer_class   = CategorieSerializer
    permission_classes = [permissions.AllowAny]


class PrestataireViewSet(viewsets.ModelViewSet):
    queryset        = Prestataire.objects.filter(
                        user__is_active=True
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