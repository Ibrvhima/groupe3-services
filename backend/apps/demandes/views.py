from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import Demande
from .serializers import DemandeSerializer


class DemandeViewSet(viewsets.ModelViewSet):
    serializer_class   = DemandeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'client':
            return Demande.objects.filter(client=user).order_by('-date_creation')
        elif user.role == 'prestataire':
            return Demande.objects.filter(prestataire__user=user).order_by('-date_creation')
        return Demande.objects.none()

    def perform_create(self, serializer):
        if self.request.user.role != 'client':
            raise permissions.PermissionDenied('Seul un client peut créer une demande.')
        serializer.save(client=self.request.user)

    @action(detail=True, methods=['patch'])
    def changer_statut(self, request, pk=None):
        demande = self.get_object()
        nouveau = request.data.get('statut')
        user    = request.user

        if user.role == 'client':
            if nouveau == 'annulee' and demande.statut == 'en_attente':
                demande.statut = nouveau
                demande.save()
                return Response(DemandeSerializer(demande).data)
            return Response(
                {'error': 'Action non autorisée.'},
                status=status.HTTP_403_FORBIDDEN
            )
        elif user.role == 'prestataire':
            if nouveau in ['acceptee', 'terminee', 'annulee']:
                demande.statut = nouveau
                demande.save()
                return Response(DemandeSerializer(demande).data)
            return Response(
                {'error': 'Statut invalide.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response(
            {'error': 'Action non autorisée.'},
            status=status.HTTP_403_FORBIDDEN
        )