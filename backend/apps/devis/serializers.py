from rest_framework import serializers
from .models import Devis
from apps.demandes.models import Demande
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
    # On déclare explicitement le champ 'demande' sans UniqueValidator.
    # DRF ajoute automatiquement un UniqueValidator sur les OneToOneField,
    # ce qui bloquerait la re-création après refus (l'ancien devis n'est
    # supprimé que dans perform_create, APRÈS la validation du serializer).
    # perform_create gère lui-même le cas du devis refusé existant.
    demande = serializers.PrimaryKeyRelatedField(queryset=Demande.objects.all())

    class Meta:
        model      = Devis
        fields     = ['demande', 'montant', 'description', 'delai']
        validators = []   # retire aussi les validators au niveau Meta (par précaution)
