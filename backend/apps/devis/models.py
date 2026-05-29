from django.db import models
from apps.demandes.models import Demande


class Devis(models.Model):
    STATUTS = [
        ('en_attente', 'En attente'),
        ('accepte', 'Accepté'),
        ('refuse', 'Refusé'),
    ]

    demande = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='devis')
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField()
    delai = models.CharField(max_length=100)
    statut = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    date_creation = models.DateTimeField(auto_now_add=True)
    date_maj = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date_creation']

    def __str__(self):
        return f'Devis #{self.pk} — {self.demande} ({self.statut})'
