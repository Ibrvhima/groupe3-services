from rest_framework import serializers
from .models import Categorie, Prestataire
from apps.users.serializers import UserSerializer


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = '__all__'


class PrestataireSerializer(serializers.ModelSerializer):
    user        = UserSerializer(read_only=True)
    categorie   = CategorieSerializer(read_only=True)
    photo       = serializers.SerializerMethodField()
    nombre_avis = serializers.SerializerMethodField()

    def get_photo(self, obj):
        if not obj.photo:
            return None
        return obj.photo.url

    def get_nombre_avis(self, obj):
        return obj.avis_set.count()

    class Meta:
        model = Prestataire
        fields = [
            'id', 'uuid', 'user', 'categorie', 'description', 'quartier',
            'telephone', 'photo', 'disponible', 'approuve',
            'note_moyenne', 'nombre_avis', 'badge_verifie', 'statut', 'created_at',
        ]


class PrestataireWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestataire
        fields = ['categorie', 'description', 'quartier', 'telephone', 'disponible', 'photo']


class AdminPrestataireSerializer(serializers.ModelSerializer):
    user      = UserSerializer(read_only=True)
    categorie = CategorieSerializer(read_only=True)

    class Meta:
        model = Prestataire
        fields = [
            'id', 'uuid', 'user', 'categorie', 'quartier', 'telephone',
            'description', 'photo', 'disponible', 'approuve', 'badge_verifie',
            'note_moyenne', 'statut', 'created_at',
        ]


class AdminPrestataireUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prestataire
        fields = ['badge_verifie', 'disponible', 'approuve', 'statut']
