from django.db import models
from apps.users.models import User
from apps.demandes.models import Demande


class Conversation(models.Model):
    demande     = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='conversation')
    client      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_client')
    prestataire = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations_prestataire')
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Conv #{self.pk} — {self.client.nom} / {self.prestataire.nom}'


class Message(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    expediteur   = models.ForeignKey(User, on_delete=models.CASCADE, related_name='messages_envoyes')
    contenu      = models.TextField()
    date_envoi   = models.DateTimeField(auto_now_add=True)
    lu           = models.BooleanField(default=False)

    class Meta:
        ordering = ['date_envoi']
        indexes  = [
            models.Index(fields=['conversation', 'date_envoi']),
        ]

    def __str__(self):
        return f'Msg de {self.expediteur.nom} ({self.date_envoi:%d/%m %H:%M})'
