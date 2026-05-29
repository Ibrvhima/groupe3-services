from django.db import models
from apps.users.models import User
from apps.prestataires.models import Prestataire


class Demande(models.Model):
    STATUTS = [
        ('en_attente', 'En attente'),
        ('acceptee', 'Acceptée'),
        ('refusee', 'Refusée'),
        ('en_cours', 'En cours'),
        ('terminee', 'Terminée'),
        ('annulee', 'Annulée'),
    ]

    client = models.ForeignKey(User, on_delete=models.CASCADE, related_name='demandes_client')
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE, related_name='demandes_recues')
    description = models.TextField()
    adresse = models.CharField(max_length=200, blank=True, default='')
    date_souhaitee = models.DateField(null=True, blank=True)
    statut = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_maj = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']
        indexes = [
            models.Index(fields=['statut']),
            models.Index(fields=['client']),
            models.Index(fields=['prestataire']),
        ]

    def __str__(self):
        return f'Demande #{self.pk} — {self.client.nom} → {self.prestataire.user.nom} ({self.statut})'
