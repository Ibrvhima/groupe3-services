from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from apps.users.models import User
from apps.prestataires.models import Prestataire
from apps.demandes.models import Demande


class Avis(models.Model):
    demande     = models.OneToOneField(Demande, on_delete=models.CASCADE, related_name='avis')
    client      = models.ForeignKey(User, on_delete=models.CASCADE)
    prestataire = models.ForeignKey(Prestataire, on_delete=models.CASCADE)
    note        = models.PositiveSmallIntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(5)]
    )
    commentaire = models.TextField()
    date        = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Avis {self.note}/5 par {self.client.nom}'