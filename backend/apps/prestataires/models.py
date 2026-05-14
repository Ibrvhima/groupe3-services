from django.db import models
from apps.users.models import User


class Categorie(models.Model):
    nom         = models.CharField(max_length=100, unique=True)
    icone       = models.CharField(max_length=50)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.nom


class Prestataire(models.Model):
    STATUTS = [
        ('en_attente', 'En attente'),
        ('approuve',   'Approuvé'),
        ('rejete',     'Rejeté'),
    ]

    user          = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profil')
    categorie     = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)
    description   = models.TextField()
    quartier      = models.CharField(max_length=100)
    telephone     = models.CharField(max_length=20)
    disponible    = models.BooleanField(default=True)
    note_moyenne  = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    badge_verifie = models.BooleanField(default=False)
    statut        = models.CharField(max_length=20, choices=STATUTS, default='en_attente')
    created_at    = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.nom} — {self.categorie}'
    STATUTS = [
        ('en_attente', 'En attente'),
        ('approuve',   'Approuvé'),
        ('rejete',     'Rejeté'),
    ]

    user          = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profil')
    categorie     = models.ForeignKey(Categorie, on_delete=models.SET_NULL, null=True)
    description   = models.TextField()
    quartier      = models.CharField(max_length=100)
    telephone     = models.CharField(max_length=20)
    photo         = models.ImageField(upload_to='photos/prestataires/', null=True, blank=True)
    disponible    = models.BooleanField(default=True)
    approuve      = models.BooleanField(default=False)
    note_moyenne  = models.DecimalField(max_digits=3, decimal_places=2, default=0.00)
    badge_verifie = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['disponible']),
            models.Index(fields=['-note_moyenne']),
            models.Index(fields=['quartier']),
        ]

    def __str__(self):
        return f'{self.user.nom} — {self.categorie}'