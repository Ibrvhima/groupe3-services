from rest_framework import serializers
from .models import Avis


class AvisSerializer(serializers.ModelSerializer):
    client_nom = serializers.CharField(source='client.get_full_name', read_only=True)
    prestataire_nom = serializers.CharField(source='prestataire.nom_complet', read_only=True)
    demande_id = serializers.IntegerField(source='demande.id', read_only=True)

    class Meta:
        model = Avis
        fields = [
            'id', 'demande_id', 'client', 'client_nom', 'prestataire',
            'prestataire_nom', 'note', 'commentaire', 'date_creation'
        ]
        read_only_fields = ['client', 'date_creation']

    def validate(self, data):
        # Vérifier que l'utilisateur connecté est bien le client de la demande
        request = self.context.get('request')
        if request and hasattr(request, 'user'):
            user = request.user
            demande = data.get('demande')
            if demande and demande.client != user:
                raise serializers.ValidationError("Vous ne pouvez donner un avis que pour vos propres demandes.")

        # Vérifier que la demande est terminée
        demande = data.get('demande')
        if demande and demande.statut != 'terminee':
            raise serializers.ValidationError("Vous ne pouvez donner un avis que pour une demande terminée.")

        # Vérifier qu'un avis n'existe pas déjà pour cette demande
        if demande and Avis.objects.filter(demande=demande).exists():
            raise serializers.ValidationError("Un avis existe déjà pour cette demande.")

        return data
