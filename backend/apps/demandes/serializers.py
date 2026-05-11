from rest_framework import serializers
from .models import Demande


class DemandeSerializer(serializers.ModelSerializer):
<<<<<<< HEAD
    client_nom         = serializers.CharField(source='client.nom', read_only=True)
    client_prenom      = serializers.CharField(source='client.prenom', read_only=True)
    prestataire_nom    = serializers.CharField(source='prestataire.user.nom', read_only=True)
    prestataire_prenom = serializers.CharField(source='prestataire.user.prenom', read_only=True)
=======
    client_nom        = serializers.CharField(source='client.nom', read_only=True)
    client_prenom     = serializers.CharField(source='client.prenom', read_only=True)
    prestataire_nom   = serializers.CharField(source='prestataire.user.nom', read_only=True)
    prestataire_prenom= serializers.CharField(source='prestataire.user.prenom', read_only=True)
>>>>>>> f72c6cedaaa266be3a952f81ac6b29704f270e2a

    class Meta:
        model  = Demande
        fields = '__all__'
        read_only_fields = ['client', 'statut', 'date_creation']