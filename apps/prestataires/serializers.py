from rest_framework import serializers
from .models import Categorie, Prestataire
from apps.users.serializers import UserSerializer


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Categorie
        fields = ['id', 'nom', 'icone', 'description']


class PrestataireSerializer(serializers.ModelSerializer):
    user      = UserSerializer(read_only=True)
    categorie = CategorieSerializer(read_only=True)

    nombre_avis       = serializers.SerializerMethodField()
    a_geolocalisation = serializers.SerializerMethodField()
    note_etoiles      = serializers.SerializerMethodField()

    note_moyenne  = serializers.DecimalField(
                        max_digits=4,
                        decimal_places=2,
                        read_only=True
                    )
    badge_verifie = serializers.BooleanField(read_only=True)

    class Meta:
        model  = Prestataire
        fields = [
            'id',
            'user', 'categorie',
            'description', 'quartier', 'telephone', 'photo',
            'latitude', 'longitude', 'a_geolocalisation',
            'disponible', 'badge_verifie',
            'note_moyenne', 'note_etoiles', 'nombre_avis',
            'created_at', 'updated_at',
        ]

    def get_nombre_avis(self, obj):
        return obj.nombre_avis

    def get_a_geolocalisation(self, obj):
        return obj.a_geolocalisation

    def get_note_etoiles(self, obj):
        return obj.get_note_etoiles()


class PrestataireWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Prestataire
        fields = [
            'categorie',
            'description',
            'quartier',
            'telephone',
            'photo',
            'disponible',
            'latitude',
            'longitude',
        ]

    def validate_telephone(self, value):
        if not value:
            raise serializers.ValidationError(
                "Le numéro de téléphone est obligatoire."
            )
        return value

    def validate(self, data):
        lat = data.get('latitude')
        lng = data.get('longitude')
        if lat is not None and lng is None:
            raise serializers.ValidationError(
                "Si vous fournissez une latitude, "
                "la longitude est aussi obligatoire."
            )
        if lng is not None and lat is None:
            raise serializers.ValidationError(
                "Si vous fournissez une longitude, "
                "la latitude est aussi obligatoire."
            )
        return data