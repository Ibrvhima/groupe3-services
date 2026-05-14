from rest_framework import serializers
from .models import Demande
from apps.users.serializers import UserSerializer
from apps.prestataires.serializers import PrestataireSerializer


class DemandeSerializer(serializers.ModelSerializer):
    client_info      = UserSerializer(source='client', read_only=True)
    prestataire_info = PrestataireSerializer(source='prestataire', read_only=True)
    statut_display   = serializers.CharField(source='get_statut_display', read_only=True)
    # True si le client a déjà laissé un avis pour cette demande
    has_avis         = serializers.SerializerMethodField()

    def get_has_avis(self, obj):
        return hasattr(obj, 'avis')

    class Meta:
        model  = Demande
        fields = [
            'id', 'client', 'client_info', 'prestataire', 'prestataire_info',
            'description', 'adresse', 'date_souhaitee', 'statut', 'statut_display',
            'has_avis', 'date_creation', 'date_maj',
        ]
        read_only_fields = ['client', 'statut', 'date_creation', 'date_maj']


class DemandeCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Demande
        fields = ['prestataire', 'description', 'adresse', 'date_souhaitee']
