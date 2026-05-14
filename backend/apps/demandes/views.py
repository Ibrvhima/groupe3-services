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
        print(f"DEBUG: User={user}, Role={user.role}, Authenticated={user.is_authenticated}")
        
        if user.role == 'client':
            qs = Demande.objects.filter(client=user).order_by('-date_creation')
            print(f"DEBUG: Client {user.id} - Demandes: {qs.count()}")
            return qs
        elif user.role == 'prestataire':
            qs = Demande.objects.filter(prestataire__user=user).order_by('-date_creation')
            print(f"DEBUG: Prestataire {user.id} - Demandes: {qs.count()}")
            return qs
        
        print(f"DEBUG: Unknown role - returning none()")
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