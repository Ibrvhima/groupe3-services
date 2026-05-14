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
    queryset           = User.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

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


class LoginView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        from rest_framework_simplejwt.tokens import RefreshToken
        from django.contrib.auth import authenticate

        email    = request.data.get('email', '')
        password = request.data.get('password', '')
        user     = authenticate(request, username=email, password=password)
        if not user:
            return Response({'detail': 'Email ou mot de passe incorrect.'}, status=400)
        tokens = RefreshToken.for_user(user)
        return Response({
            'access':  str(tokens.access_token),
            'refresh': str(tokens),
            'user':    UserSerializer(user).data,
        })


class MeView(generics.RetrieveUpdateAPIView):
    serializer_class   = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user


class StatsView(APIView):
    permission_classes = [IsAdmin]

    def get(self, request):
        from apps.demandes.models import Demande
        from django.db.models import Count, Q

        # Une seule requête agrégée par table au lieu de N requêtes séparées
        user_agg = User.objects.aggregate(
            total        = Count('id'),
            clients      = Count('id', filter=Q(role='client')),
            prestataires = Count('id', filter=Q(role='prestataire')),
        )
        prest_agg = Prestataire.objects.aggregate(
            total      = Count('id'),
            disponibles = Count('id', filter=Q(disponible=True)),
            verifies   = Count('id', filter=Q(badge_verifie=True)),
        )
        dem_agg = Demande.objects.aggregate(
            total      = Count('id'),
            en_attente = Count('id', filter=Q(statut='en_attente')),
            acceptees  = Count('id', filter=Q(statut='acceptee')),
            terminees  = Count('id', filter=Q(statut='terminee')),
            annulees   = Count('id', filter=Q(statut='annulee')),
        )

        return Response({
            'users':        user_agg,
            'prestataires': prest_agg,
            'demandes':     dem_agg,
            'categories':   Categorie.objects.count(),
        })


# ── Gestion des prestataires ──────────────────────────────────────────────────

class AdminPrestataireListView(generics.ListAPIView):
    """
    GET /api/admin/prestataires/
    Retourne tous les prestataires avec leurs infos utilisateur et catégorie.
    Réservé à l'admin. Pagination désactivée pour récupérer la liste complète.
    """
    serializer_class   = AdminPrestataireSerializer
    permission_classes = [IsAdmin]
    pagination_class   = None   # tableau direct, pas de {count, results}

    def get_queryset(self):
        # select_related évite les requêtes N+1 sur user et categorie
        return (
            Prestataire.objects
            .select_related('user', 'categorie')
            .order_by('-user__created_at')   # plus récents en premier
        )


class AdminPrestataireUpdateView(generics.UpdateAPIView):
    """
    PATCH /api/admin/prestataires/<id>/
    Permet à l'admin de vérifier le badge ou de désactiver un prestataire.
    Seuls les champs badge_verifie et disponible sont modifiables.
    """
    serializer_class   = AdminPrestataireUpdateSerializer
    permission_classes = [IsAdmin]
    queryset           = Prestataire.objects.all()
    http_method_names  = ['patch']   # interdit PUT complet

    def patch(self, request, *args, **kwargs):
        # partial=True pour n'envoyer que les champs à modifier
        instance   = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        # Retourne la vue complète pour que le frontend puisse se mettre à jour
        return Response(AdminPrestataireSerializer(instance).data)


# ── Gestion des clients ───────────────────────────────────────────────────────

class AdminClientListView(generics.ListAPIView):
    """
    GET /api/admin/clients/
    Retourne tous les utilisateurs ayant le rôle 'client'.
    Réservé à l'admin. Pagination désactivée pour récupérer la liste complète.
    """
    serializer_class   = UserSerializer
    permission_classes = [IsAdmin]
    pagination_class   = None   # tableau direct, pas de {count, results}

    def get_queryset(self):
        return User.objects.filter(role='client').order_by('-created_at')


# ── Suppression de compte ─────────────────────────────────────────────────────

class AdminUserDeleteView(generics.DestroyAPIView):
    """
    DELETE /api/admin/users/<id>/
    Supprime définitivement un compte utilisateur (client ou prestataire).
    L'admin ne peut pas se supprimer lui-même.
    Réservé à l'admin.
    """
    permission_classes = [IsAdmin]
    queryset           = User.objects.all()

    def destroy(self, request, *args, **kwargs):
        user = self.get_object()

        # Empêche l'admin de se supprimer lui-même par erreur
        if user.id == request.user.id:
            return Response(
                {'detail': 'Vous ne pouvez pas supprimer votre propre compte.'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# ── Réinitialisation de mot de passe ─────────────────────────────────────────

class PasswordResetRequestView(APIView):
    """
    POST /api/users/password-reset/
    Corps : { "email": "..." }
    Crée un token de réinitialisation et le retourne (pas d'email en MVP).
    En production, envoyer un email avec le lien contenant le token.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        email = request.data.get('email', '').strip()
        try:
            user  = User.objects.get(email=email)
            token = PasswordResetToken.objects.create(user=user)
            # En production : envoyer l'email ici
            # Pour le MVP, on retourne le token directement
            return Response({'token': str(token.token)})
        except User.DoesNotExist:
            # On répond toujours 200 pour ne pas révéler si l'email existe
            return Response({'token': None})


class PasswordResetConfirmView(APIView):
    """
    POST /api/users/password-reset/confirm/
    Corps : { "token": "uuid...", "password": "nouveau_mdp" }
    Valide le token et met à jour le mot de passe.
    """
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        token_value   = request.data.get('token', '')
        new_password  = request.data.get('password', '')

        if not new_password or len(new_password) < 6:
            return Response(
                {'detail': 'Le mot de passe doit contenir au moins 6 caractères.'},
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


# ── Liste des demandes pour l'admin ──────────────────────────────────────────

class AdminDemandeListView(generics.ListAPIView):
    """
    GET /api/admin/demandes/
    Retourne toutes les demandes avec les infos client et prestataire.
    Filtre optionnel : ?statut=en_attente
    """
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

        # Pagination manuelle : 50 demandes max pour l'admin
        serializer = DemandeSerializer(qs[:50], many=True)
        return Response(serializer.data)
