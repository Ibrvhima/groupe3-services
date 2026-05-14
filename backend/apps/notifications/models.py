from django.db import models
from apps.users.models import User


class Notification(models.Model):
    # Destinataire de la notification
    user       = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    titre      = models.CharField(max_length=200)
    message    = models.TextField()
    lu         = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        indexes  = [
            models.Index(fields=['user', 'lu']),   # requête fréquente : non lues par user
        ]

    def __str__(self):
        return f'[{self.user.email}] {self.titre}'
