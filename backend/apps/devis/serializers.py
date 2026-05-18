from rest_framework import serializers
from .models import Devis
from apps.demandes.serializers import DemandeSerializer


class DevisSerializer(serializers.ModelSerializer):
    demande_info   = DemandeSerializer(source='demande', read_only=True)
    statut_display = serializers.CharField(source='get_statut_display', read_only=True)

    class Meta:
        model  = Devis
        fields = [
            'id', 'demande', 'demande_info', 'montant', 'description',
            'delai', 'statut', 'statut_display', 'date_creation', 'date_maj',
        ]
        read_only_fields = ['statut', 'date_creation', 'date_maj']


class DevisCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model      = Devis
        fields     = ['demande', 'montant', 'description', 'delai']
        # Désactive le UniqueValidator auto sur 'demande' (OneToOneField) :
        # perform_create gère déjà la suppression d'un devis refusé avant la création.
        validators = []
