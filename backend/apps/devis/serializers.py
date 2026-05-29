from rest_framework import serializers
from .models import Devis
from apps.demandes.models import Demande
from apps.demandes.serializers import DemandeSerializer


class DevisSerializer(serializers.ModelSerializer):
    demande_info = DemandeSerializer(source='demande', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model = Devis
        fields = [
            'id', 'demande', 'demande_info', 'montant', 'description',
            'delai', 'statut', 'statut_display', 'date_creation', 'date_maj',
        ]
        read_only_fields = ['statut', 'date_creation', 'date_maj']


class DevisCreateSerializer(serializers.ModelSerializer):
    # Déclaration explicite pour contourner le UniqueValidator automatique de DRF
    # sur les OneToOneField. La suppression du devis refusé se fait dans perform_create.
    demande = serializers.PrimaryKeyRelatedField(queryset=Demande.objects.all())

    class Meta:
        model = Devis
        fields = ['demande', 'montant', 'description', 'delai']
        validators = []
