from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Avis


def _recalculer_note(prestataire):
    # recalcule depuis la base plutôt que de faire une moyenne incrémentale, plus simple et fiable
    moyenne = Avis.objects.filter(prestataire=prestataire).aggregate(Avg('note'))['note__avg']
    prestataire.note_moyenne = round(moyenne, 2) if moyenne is not None else 0.00
    prestataire.save(update_fields=['note_moyenne'])


@receiver(post_save, sender=Avis)
def avis_cree_ou_modifie(sender, instance, **kwargs):
    _recalculer_note(instance.prestataire)


@receiver(post_delete, sender=Avis)
def avis_supprime(sender, instance, **kwargs):
    _recalculer_note(instance.prestataire)
