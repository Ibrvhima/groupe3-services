from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.db.models import Avg
from .models import Avis


@receiver(post_save, sender=Avis)
def update_note_apres_ajout(sender, instance, **kwargs):
    """
    Déclenché automatiquement après chaque création/modification d'un avis.
    Recalcule la note moyenne du prestataire.
    """
    recalculer_note(instance.prestataire)


@receiver(post_delete, sender=Avis)
def update_note_apres_suppression(sender, instance, **kwargs):
    """
    Déclenché automatiquement après la suppression d'un avis.
    Recalcule la note moyenne du prestataire.
    """
    recalculer_note(instance.prestataire)


def recalculer_note(prestataire):
    """
    Calcule la moyenne de tous les avis du prestataire
    et met à jour son champ note_moyenne.
    """
    moyenne = Avis.objects.filter(
                prestataire=prestataire
              ).aggregate(Avg('note'))['note__avg']

    # Si aucun avis, la moyenne est None → on met 0.00
    prestataire.note_moyenne = round(moyenne, 2) if moyenne else 0.00
    prestataire.save()