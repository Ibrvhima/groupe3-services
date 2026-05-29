from rest_framework import viewsets, permissions, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from .models import Categorie, Prestataire
from .serializers import CategorieSerializer, PrestataireSerializer, PrestataireWriteSerializer
from apps.users.views import IsAdmin


class CategorieViewSet(viewsets.ModelViewSet):
    queryset = Categorie.objects.all().order_by('nom')
    serializer_class = CategorieSerializer
    pagination_class = None

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [IsAdmin()]


class PrestataireViewSet(viewsets.ModelViewSet):
    queryset = (
        Prestataire.objects
        .filter(user__is_active=True, approuve=True, disponible=True)
        .select_related('user', 'categorie')
        .order_by('-note_moyenne', '-id')
    )
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__nom', 'user__prenom', 'quartier', 'description']
    ordering_fields = ['note_moyenne', 'created_at']
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    lookup_field = 'uuid'

    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return PrestataireWriteSerializer
        return PrestataireSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        categorie = self.request.query_params.get('categorie')
        quartier = self.request.query_params.get('quartier')
        if categorie:
            qs = qs.filter(categorie__id=categorie)
        if quartier:
            qs = qs.filter(quartier__icontains=quartier)
        return qs

    def get_object(self):
        # pour les modifications, on cherche sans le filtre approuve=True
        # et on s'assure que le prestataire ne peut modifier que son propre profil
        if self.action in ['partial_update', 'update']:
            obj = get_object_or_404(
                Prestataire.objects.select_related('user', 'categorie'),
                uuid=self.kwargs['uuid'],
                user=self.request.user,
            )
            self.check_object_permissions(self.request, obj)
            return obj
        return super().get_object()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = PrestataireWriteSerializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(PrestataireSerializer(instance).data)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def me(self, request):
        try:
            profil = (
                Prestataire.objects
                .select_related('user', 'categorie')
                .get(user=request.user)
            )
            return Response(PrestataireSerializer(profil).data)
        except Prestataire.DoesNotExist:
            return Response(
                {'detail': 'Profil prestataire introuvable.'},
                status=status.HTTP_404_NOT_FOUND
            )
