from django.db import models
from apps.users.models import User
from apps.prestataires.models import Prestataire


class Demande(models.Model):
    STATUT_CHOICES = [
        ('en_attente', 'En attente'),
        ('acceptee', 'Acceptée'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
        ('annulee', 'Annulée'),
    ]

    client      = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demandes')
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='demandes_recues')
    titre = models.CharField(max_length=200, default='Sans titre')
    description = models.TextField()
    statut      = models.CharField(max_length=20, choices=STATUT_CHOICES, default='en_attente')
    created_at  = models.DateTimeField(auto_now_add=True)
    updated_at  = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.titre} - {self.client.nom} → {self.prestataire}'
