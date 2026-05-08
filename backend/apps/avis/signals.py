from django.db.models.signals import post_save
from django.dispatch import receiver
from django.db.models import Avg
from .models import Avis


@receiver(post_save, sender=Avis)
def update_note_moyenne(sender, instance, **kwargs):
    p = instance.prestataire
    moyenne = Avis.objects.filter(prestataire=p).aggregate(Avg('note'))['note__avg']
    p.note_moyenne = round(moyenne, 2)
    p.save()