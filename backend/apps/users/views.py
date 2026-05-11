from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.response import Response
from .serializers import RegisterSerializer, UserSerializer
from .models import User
from apps.prestataires.models import Prestataire, Categorie


class RegisterView(generics.CreateAPIView):
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user   = serializer.save()

        if user.role == 'prestataire':
            categorie_id = request.data.get('categorie_id')
            quartier     = request.data.get('quartier', '')
            description  = request.data.get('description', '')
            telephone    = request.data.get('telephone_pro', user.telephone)

            categorie = None
            if categorie_id:
                try:
                    categorie = Categorie.objects.get(id=categorie_id)
                except Categorie.DoesNotExist:
                    pass

            Prestataire.objects.create(
                user        = user,
                categorie   = categorie,
                quartier    = quartier,
                description = description,
                telephone   = telephone,
                disponible  = True,
            )

        tokens = RefreshToken.for_user(user)
        return Response({
            'user':    UserSerializer(user).data,
            'access':  str(tokens.access_token),
            'refresh': str(tokens),
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class AdminStatsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        if request.user.role != 'admin':
            return Response({'error': 'Accès refusé'}, status=403)

        from django.utils import timezone
        from apps.demandes.models import Demande
        debut_mois = timezone.now().replace(day=1, hour=0, minute=0, second=0)

        stats = {
            'nb_utilisateurs':  User.objects.count(),
            'nb_prestataires':  Prestataire.objects.count(),
            'nb_demandes_mois': Demande.objects.filter(date_creation__gte=debut_mois).count(),
            'nb_signalements':  0,
            'derniers_prestataires': list(
                Prestataire.objects.select_related('user', 'categorie')
                .order_by('-created_at')[:5]
                .values('id', 'user__nom', 'user__prenom', 'categorie__nom', 'quartier', 'disponible')
            ),
            'dernieres_demandes': list(
                Demande.objects.select_related('client', 'prestataire__user')
                .order_by('-date_creation')[:5]
                .values('id', 'client__nom', 'prestataire__user__nom', 'statut', 'date_creation')
            ),
        }
        return Response(stats)