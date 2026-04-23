from rest_framework import viewsets, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Categorie, Prestataire
from .serializers import CategorieSerializer, PrestataireSerializer, PrestataireWriteSerializer


class CategorieViewSet(viewsets.ReadOnlyModelViewSet):
    queryset           = Categorie.objects.all()
    serializer_class   = CategorieSerializer
    permission_classes = [permissions.AllowAny]


class PrestataireViewSet(viewsets.ModelViewSet):
    queryset = Prestataire.objects.filter(
                    user__is_active=True
               ).select_related('user', 'categorie')
    filter_backends    = [filters.SearchFilter, filters.OrderingFilter]
    search_fields      = ['user__nom', 'user__prenom', 'quartier', 'description']
    ordering_fields    = ['note_moyenne', 'created_at']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PrestataireWriteSerializer
        return PrestataireSerializer

    def get_queryset(self):
        qs         = super().get_queryset()
        categorie  = self.request.query_params.get('categorie')
        quartier   = self.request.query_params.get('quartier')
        disponible = self.request.query_params.get('disponible')

        if categorie:
            # Accepte soit un ID soit un nom
            if categorie.isdigit():
                qs = qs.filter(categorie__id=categorie)
            else:
                qs = qs.filter(categorie__nom__icontains=categorie)

        if quartier:
            qs = qs.filter(quartier__icontains=quartier)

        if disponible is not None:
            qs = qs.filter(disponible=disponible.lower() == 'true')

        return qs

    def perform_create(self, serializer):
        # Empêche un user d'avoir 2 profils prestataire
        if Prestataire.objects.filter(user=self.request.user).exists():
            raise PermissionDenied("Vous avez déjà un profil prestataire.")
        serializer.save(user=self.request.user)

    def perform_update(self, serializer):
        # Seul le propriétaire peut modifier son profil
        if serializer.instance.user != self.request.user:
            raise PermissionDenied("Vous ne pouvez modifier que votre propre profil.")
        serializer.save()

    def perform_destroy(self, instance):
        # Seul le propriétaire peut supprimer son profil
        if instance.user != self.request.user:
            raise PermissionDenied("Vous ne pouvez supprimer que votre propre profil.")
        instance.delete()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def mon_profil(self, request):
        """
        GET /api/prestataires/prestataires/mon_profil/
        Retourne le profil du prestataire connecté
        """
        try:
            prestataire = Prestataire.objects.get(user=request.user)
            serializer  = PrestataireSerializer(prestataire)
            return Response(serializer.data)
        except Prestataire.DoesNotExist:
            return Response(
                {"detail": "Vous n'avez pas encore de profil prestataire."},
                status=404
            )