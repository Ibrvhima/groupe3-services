from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RegisterSerializer, UserSerializer
from .models import User, PasswordResetToken
from apps.prestataires.models import Prestataire, Categorie
from apps.prestataires.serializers import (
    AdminPrestataireSerializer,
    AdminPrestataireUpdateSerializer,
)


class IsAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'admin'


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'register'

    def create(self, request, *args, **kwargs):
        from django.db import transaction

        if request.data.get('role') == 'prestataire':
            categorie_id = request.data.get('categorie_id')
            if not categorie_id:
                return Response(
                    {'categorie_id': ['Ce champ est requis pour un prestataire.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            try:
                categorie = Categorie.objects.get(id=categorie_id)
            except Categorie.DoesNotExist:
                return Response(
                    {'categorie_id': ['Catégorie introuvable.']},
                    status=status.HTTP_400_BAD_REQUEST,
                )
        else:
            categorie = None

        with transaction.atomic():
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            user = serializer.save()

            if user.role == 'prestataire':
                Prestataire.objects.create(
                    user=user,
                    categorie=categorie,
                    quartier=request.data.get('quartier', ''),
                    description=request.data.get('description', ''),
                    telephone=request.data.get('telephone_pro', user.telephone),
                    disponible=True,
                )

        tokens = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(tokens.access_token),
            'refresh': str(tokens),
        })


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'login'

    def post(self, request):
        from django.contrib.auth import authenticate

        email = request.data.get('email', '')
        password = request.data.get('password', '')
        user = authenticate(request, username=email, password=password)

        if not user:
            return Response({'detail': 'Email ou mot de passe incorrect.'}, status=400)

        tokens = RefreshToken.for_user(user)
        return Response({
            'access': str(tokens.access_token),
            'refresh': str(tokens),
            'user': UserSerializer(user).data,
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class StatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.demandes.models import Demande
        from django.db.models import Count, Q

        user_agg = User.objects.aggregate(
            total=Count('id'),
            clients=Count('id', filter=Q(role='client')),
            prestataires=Count('id', filter=Q(role='prestataire')),
        )
        prest_agg = Prestataire.objects.aggregate(
            total=Count('id'),
            disponibles=Count('id', filter=Q(disponible=True)),
            verifies=Count('id', filter=Q(badge_verifie=True)),
        )
        dem_agg = Demande.objects.aggregate(
            total=Count('id'),
            en_attente=Count('id', filter=Q(statut='en_attente')),
            acceptees=Count('id', filter=Q(statut='acceptee')),
            terminees=Count('id', filter=Q(statut='terminee')),
            annulees=Count('id', filter=Q(statut='annulee')),
        )

        return Response({
            'users': user_agg,
            'prestataires': prest_agg,
            'demandes': dem_agg,
            'categories': Categorie.objects.count(),
        })


class AdminPrestataireListView(generics.ListAPIView):
    serializer_class = AdminPrestataireSerializer
    permission_classes = [IsAdmin]
    pagination_class = None

    def get_queryset(self):
        qs = (
            Prestataire.objects
            .select_related('user', 'categorie')
            .order_by('-user__created_at')
        )
        approuve = self.request.query_params.get('approuve')
        if approuve is not None:
            qs = qs.filter(approuve=(approuve.lower() == 'true'))
        return qs


class AdminPrestataireUpdateView(generics.UpdateAPIView):
    serializer_class = AdminPrestataireUpdateSerializer
    permission_classes = [IsAdmin]
    queryset = Prestataire.objects.all()
    http_method_names = ['patch']

    def patch(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(AdminPrestataireSerializer(instance).data)


class AdminClientListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]
    pagination_class = None

    def get_queryset(self):
        return User.objects.filter(role='client').order_by('-created_at')


class AdminUserDeleteView(generics.DestroyAPIView):
    permission_classes = [IsAdmin]
    queryset = User.objects.all()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()
        if user.id == request.user.id:
            return Response(
                {'detail': 'Vous ne pouvez pas supprimer votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class PasswordResetRequestView(APIView):
    permission_classes = [permissions.AllowAny]
    throttle_scope = 'password_reset'

    REPONSE_GENERIQUE = {
        'detail': 'Si cet email est enregistré, un lien de réinitialisation a été envoyé.'
    }

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user = User.objects.get(email=email)
            token = PasswordResetToken.objects.create(user=user)
            self._envoyer_email(email, str(token.token))
        except User.DoesNotExist:
            pass

        return Response(self.REPONSE_GENERIQUE)

    def _envoyer_email(self, to_email: str, token: str) -> None:
        from django.conf import settings
        import resend

        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:4200')
        reset_url = f"{frontend_url}/auth/reset-password?token={token}"
        api_key = getattr(settings, 'RESEND_API_KEY', '')

        if not api_key:
            print(f"[PASSWORD RESET - DEV] {to_email} -> {reset_url}")
            return

        resend.api_key = api_key
        resend.Emails.send({
            "from": getattr(settings, 'EMAIL_FROM', 'DoraKa <onboarding@resend.dev>'),
            "to": [to_email],
            "subject": "Réinitialisation de votre mot de passe DoraKa",
            "html": self._html_reset(reset_url),
        })

    @staticmethod
    def _html_reset(reset_url: str) -> str:
        return f"""
        <div style="font-family:Arial,sans-serif;max-width:520px;margin:0 auto;
                    padding:32px 24px;background:#f8fafc;border-radius:16px;">
          <div style="text-align:center;margin-bottom:24px;">
            <span style="font-size:24px;font-weight:800;color:#1d4ed8;">DouraKa</span>
          </div>
          <div style="background:#ffffff;border-radius:12px;padding:28px;border:1px solid #e2e8f0;">
            <h2 style="color:#1e293b;font-size:18px;margin:0 0 12px;">
              Réinitialisation de mot de passe
            </h2>
            <p style="color:#475569;font-size:14px;line-height:1.6;margin:0 0 24px;">
              Vous avez demandé à réinitialiser votre mot de passe.
              Ce lien expire dans <strong>1 heure</strong>.
            </p>
            <div style="text-align:center;margin-bottom:24px;">
              <a href="{reset_url}"
                 style="display:inline-block;background:#2563eb;color:#ffffff;
                        padding:13px 32px;border-radius:8px;font-size:15px;
                        font-weight:600;text-decoration:none;">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin:0;">
              Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
            </p>
          </div>
          <p style="color:#cbd5e1;font-size:11px;text-align:center;margin-top:20px;">
            © DouraKa — Conakry, Guinée
          </p>
        </div>
        """


class PasswordResetConfirmView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_value = request.data.get('token', '')
        new_password = request.data.get('password', '')

        if not new_password or len(new_password) < 8:
            return Response(
                {'detail': 'Le mot de passe doit contenir au moins 8 caractères.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            reset_token = PasswordResetToken.objects.select_related('user').get(token=token_value)
        except PasswordResetToken.DoesNotExist:
            return Response({'detail': 'Token invalide.'}, status=status.HTTP_400_BAD_REQUEST)

        if not reset_token.is_valid:
            return Response(
                {'detail': 'Token expiré ou déjà utilisé.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        reset_token.user.set_password(new_password)
        reset_token.user.save()
        reset_token.used = True
        reset_token.save()
        return Response({'detail': 'Mot de passe mis à jour avec succès.'})


class AdminDemandeListView(generics.ListAPIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.demandes.models import Demande
        from apps.demandes.serializers import DemandeSerializer

        qs = (
            Demande.objects
            .select_related('client', 'prestataire__user', 'prestataire__categorie')
            .order_by('-date_creation')
        )
        statut = request.query_params.get('statut')
        if statut:
            qs = qs.filter(statut=statut)

        return Response(DemandeSerializer(qs[:50], many=True).data)
