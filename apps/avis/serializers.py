from rest_framework import serializers
from .models import Avis


class AvisSerializer(serializers.ModelSerializer):
    """
    Serializer pour la LECTURE d'un avis.
    Affiche des infos lisibles (nom du client, note, commentaire...).
    """
    client_nom      = serializers.CharField(source='client.nom', read_only=True)
    client_prenom   = serializers.CharField(source='client.prenom', read_only=True)
    prestataire_nom = serializers.CharField(source='prestataire.user.nom', read_only=True)

    class Meta:
        model  = Avis
        fields = [
            'id',
            'demande',
            'client_nom',
            'client_prenom',
            'prestataire_nom',
            'note',
            'commentaire',
            'date',
        ]
        read_only_fields = ['id', 'date']


class AvisWriteSerializer(serializers.ModelSerializer):
    """
    Serializer pour la CRÉATION d'un avis.
    Le client envoie uniquement : demande, note, commentaire.
    client et prestataire sont remplis automatiquement côté serveur.
    """
    class Meta:
        model  = Avis
        fields = ['demande', 'note', 'commentaire']

    def validate_note(self, value):
        if value < 1 or value > 5:
            raise serializers.ValidationError("La note doit être entre 1 et 5.")
        return value

    def validate_demande(self, value):
        request = self.context.get('request')

        # Vérification 1 : la demande doit être terminée
        if value.statut != 'terminee':
            raise serializers.ValidationError(
                "Vous ne pouvez noter qu'une demande terminée."
            )

        # Vérification 2 : le client connecté doit être celui de la demande
        if request and value.client != request.user:
            raise serializers.ValidationError(
                "Vous ne pouvez noter que vos propres demandes."
            )

        # Vérification 3 : pas déjà noté
        if hasattr(value, 'avis'):
            raise serializers.ValidationError(
                "Vous avez déjà laissé un avis pour cette demande."
            )

        return value