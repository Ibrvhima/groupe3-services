from rest_framework import serializers
from .models import Conversation, Message
from apps.users.models import User


class UserMinimalSerializer(serializers.ModelSerializer):
    class Meta:
        model  = User
        fields = ['id', 'nom', 'prenom', 'photo']


class MessageSerializer(serializers.ModelSerializer):
    expediteur = UserMinimalSerializer(read_only=True)

    class Meta:
        model  = Message
        fields = ['id', 'conversation', 'expediteur', 'contenu', 'date_envoi', 'lu']
        read_only_fields = ['id', 'expediteur', 'date_envoi', 'lu']


class ConversationSerializer(serializers.ModelSerializer):
    client           = UserMinimalSerializer(read_only=True)
    prestataire      = UserMinimalSerializer(read_only=True)
    dernier_message  = serializers.SerializerMethodField()
    non_lus          = serializers.SerializerMethodField()

    class Meta:
        model  = Conversation
        fields = ['id', 'demande', 'client', 'prestataire', 'created_at', 'dernier_message', 'non_lus']

    def get_dernier_message(self, obj):
        msg = obj.messages.last()
        if msg:
            return {
                'contenu':    msg.contenu,
                'date_envoi': msg.date_envoi,
                'expediteur': msg.expediteur.nom,
            }
        return None

    def get_non_lus(self, obj):
        user = self.context['request'].user
        return obj.messages.filter(lu=False).exclude(expediteur=user).count()
