from rest_framework import serializers
from .models import Avis


class AvisSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.nom', read_only=True)
    client_prenom = serializers.CharField(source='client.prenom', read_only=True)

    class Meta:
        model = Avis
        fields = '__all__'
        read_only_fields = ['client', 'prestataire', 'date']
