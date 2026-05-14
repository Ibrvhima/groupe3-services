from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.prestataires.models import Prestataire
from apps.demandes.models import Demande


class Avis(models.Model):
    demande     = models.OneToOneField(Demande, related_name='avis', on_delete=models.CASCADE)
    client      = models.ForeignKey(User, related_name='avis_donnes', on_delete=models.CASCADE)
    prestataire = models.ForeignKey(Prestataire, related_name='avis_recus', on_delete=models.CASCADE)
    note        = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    commentaire = models.TextField(blank=True, null=True)
    date_creation = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Avis'
        verbose_name_plural = 'Avis'
        ordering = ['-date_creation']

    def __str__(self):
        return f'Avis de {self.client} pour {self.prestataire} - Note: {self.note}/5'
