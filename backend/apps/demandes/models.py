from django.db import models
from apps.users.models import User
from apps.prestataires.models import Prestataire


class Demande(models.Model):
    STATUTS = [
        ('en_attente', 'En attente'),
        ('acceptee',   'Acceptée'),
        ('terminee',   'Terminée'),
        ('annulee',    'Annulée'),
    ]

    client            = models.ForeignKey(User, related_name='demandes_client', on_delete=models.CASCADE)
    prestataire       = models.ForeignKey(Prestataire, related_name='demandes', on_delete=models.CASCADE)
    description       = models.TextField()
    statut            = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    date_creation     = models.DateTimeField(auto_now_add=True)
    date_intervention = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'Demande #{self.id} — {self.statut}'