from rest_framework import serializers
from .models import Demande
from apps.users.serializers import UserSerializer
from apps.prestataires.serializers import PrestataireSerializer


class DemandeSerializer(serializers.ModelSerializer):
    client_info = UserSerializer(source='client', read_only=True)
    prestataire_info = PrestataireSerializer(source='prestataire', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)
    has_avis = serializers.SerializerMethodField()
    has_devis = serializers.SerializerMethodField()
    # import circulaire évité : données du devis calculées ici
    devis = serializers.SerializerMethodField()

    def get_has_avis(self, obj):
        return hasattr(obj, 'avis')

    def get_has_devis(self, obj):
        return hasattr(obj, 'devis')

    def get_devis(self, obj):
        if not hasattr(obj, 'devis'):
            return None
        d = obj.devis
        return {
            'id': d.id,
            'montant': str(d.montant),
            'description': d.description,
            'delai': d.delai,
            'statut': d.statut,
            'statut_display': d.get_statut_display(),
            'date_creation': d.date_creation.isoformat(),
        }

    class Meta:
        model = Demande
        fields = [
            'id', 'client', 'client_info', 'prestataire', 'prestataire_info',
            'titre', 'description', 'adresse', 'urgence', 'date_souhaitee',
            'statut', 'statut_display',
            'has_avis', 'has_devis', 'devis', 'date_creation', 'date_maj',
        ]
        read_only_fields = ['client', 'statut', 'date_creation', 'date_maj']


class DemandeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Demande
        fields = ['prestataire', 'titre', 'description', 'adresse', 'urgence', 'date_souhaitee']
