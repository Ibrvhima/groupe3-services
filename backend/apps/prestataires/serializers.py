from rest_framework import serializers
from .models import Categorie, Prestataire
from apps.users.serializers import UserSerializer


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categorie
        fields = '__all__'


class PrestataireSerializer(serializers.ModelSerializer):
    user      = UserSerializer(read_only=True)
    categorie = CategorieSerializer(read_only=True)

    class Meta:
        model  = Prestataire
        fields = [
            'id', 'user', 'categorie', 'description', 'quartier',
            'telephone', 'photo', 'disponible', 'approuve',
            'note_moyenne', 'badge_verifie', 'created_at',
        ]


class PrestataireWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Prestataire
        # photo inclus pour permettre l'upload depuis le formulaire d'édition
        fields = ['categorie', 'description', 'quartier', 'telephone', 'disponible', 'photo']


# ── Serializers réservés à l'admin ────────────────────────────────────────────

class AdminPrestataireSerializer(serializers.ModelSerializer):
    """Lecture complète d'un prestataire pour l'admin (user + categorie inclus)."""
    user      = UserSerializer(read_only=True)
    categorie = CategorieSerializer(read_only=True)

    class Meta:
        model  = Prestataire
        fields = [
            'id', 'user', 'categorie', 'quartier', 'telephone',
            'description', 'photo', 'disponible', 'approuve', 'badge_verifie',
            'note_moyenne', 'created_at',
        ]


class AdminPrestataireUpdateSerializer(serializers.ModelSerializer):
    """Mise à jour partielle par l'admin : badge et disponibilité uniquement."""

    class Meta:
        model  = Prestataire
        fields = ['badge_verifie', 'disponible', 'approuve']