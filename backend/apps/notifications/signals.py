from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.demandes.models import Demande
from .models import Notification


# Mapping statut → message pour chaque acteur concerné
MESSAGES_CLIENT = {
    'acceptee':  ('Demande acceptée',    'Votre demande a été acceptée par le prestataire. Il vous contactera bientôt.'),
    'refusee':   ('Demande refusée',     'Votre demande a été refusée par le prestataire.'),
    'terminee':  ('Prestation terminée', 'La prestation est terminée. N\'oubliez pas de laisser un avis !'),
    'annulee':   ('Demande annulée',     'Votre demande a été annulée.'),
}

MESSAGES_PRESTATAIRE = {
    'en_attente': ('Nouvelle demande',  'Vous avez reçu une nouvelle demande de service.'),
    'annulee':    ('Demande annulée',   'Un client a annulé sa demande.'),
}


@receiver(post_save, sender=Demande)
def notifier_changement_statut(sender, instance, created, **kwargs):
    """
    Crée automatiquement une notification à chaque changement de statut d'une demande.
    - Nouvelle demande (created=True) → notifie le prestataire
    - Changement de statut → notifie le client et/ou le prestataire selon le statut
    """
    statut = instance.statut

    if created:
        # Nouvelle demande : on notifie uniquement le prestataire
        titre, message = MESSAGES_PRESTATAIRE['en_attente']
        Notification.objects.create(
            user    = instance.prestataire.user,
            titre   = titre,
            message = f'{instance.client.nom} {instance.client.prenom} : {message}',
        )
        return

    # Changement de statut : notifie le client si pertinent
    if statut in MESSAGES_CLIENT:
        titre, message = MESSAGES_CLIENT[statut]
        Notification.objects.create(
            user    = instance.client,
            titre   = titre,
            message = message,
        )

    # Notifie le prestataire si le client annule
    if statut == 'annulee' and statut in MESSAGES_PRESTATAIRE:
        titre, message = MESSAGES_PRESTATAIRE['annulee']
        Notification.objects.create(
            user    = instance.prestataire.user,
            titre   = titre,
            message = f'{instance.client.nom} {instance.client.prenom} : {message}',
        )
