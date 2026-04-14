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
        fields = '__all__'


class PrestataireWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Prestataire
        fields = ['categorie', 'description', 'quartier', 'telephone', 'disponible']