from rest_framework import serializers
from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Notification
        fields = ['id', 'titre', 'message', 'lu', 'created_at']
        # user est lu depuis le token JWT, on ne l'expose pas
