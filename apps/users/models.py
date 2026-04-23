from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.db import models


class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('L\'email est obligatoire')
        email = self.normalize_email(email)
        user  = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'admin')
        return self.create_user(email, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    ROLES = [
        ('client',       'Client'),
        ('prestataire',  'Prestataire'),
        ('admin',        'Admin'),
    ]

    email      = models.EmailField(unique=True)
    nom        = models.CharField(max_length=100)
    prenom     = models.CharField(max_length=100)
    telephone  = models.CharField(max_length=20)
    role       = models.CharField(max_length=20, choices=ROLES, default='client')
    photo      = models.ImageField(upload_to='users/', null=True, blank=True)
    is_active  = models.BooleanField(default=True)
    is_staff   = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    objects = UserManager()

    USERNAME_FIELD  = 'email'
    REQUIRED_FIELDS = ['nom', 'prenom', 'telephone', 'role']

    def __str__(self):
        return f'{self.nom} {self.prenom} ({self.role})'