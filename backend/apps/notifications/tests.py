from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.notifications.models import Notification
from apps.users.models import User


# ── Helpers ──────────────────────────────────────────────────────────────────

def make_user(email, role='client', nom='Test', prenom='User'):
    return User.objects.create_user(
        email=email, password='TestPass123',
        nom=nom, prenom=prenom,
        telephone='622000000', role=role,
    )


def make_notif(user, titre='Titre', message='Contenu', lu=False):
    return Notification.objects.create(user=user, titre=titre, message=message, lu=lu)


# ── Tests ─────────────────────────────────────────────────────────────────────

class NotificationListTest(TestCase):
    def setUp(self):
        self.api  = APIClient()
        self.user = make_user('user@test.com')

    def test_liste_vide_au_depart(self):
        self.api.force_authenticate(user=self.user)
        res = self.api.get('/api/notifications/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_liste_ses_notifications(self):
        make_notif(self.user, titre='Devis reçu')
        make_notif(self.user, titre='Message reçu')

        self.api.force_authenticate(user=self.user)
        res = self.api.get('/api/notifications/')
        self.assertEqual(len(res.data), 2)

    def test_ne_voit_pas_les_notifications_des_autres(self):
        autre = make_user('autre@test.com', nom='Autre')
        make_notif(autre, titre='Notification privée')

        self.api.force_authenticate(user=self.user)
        res = self.api.get('/api/notifications/')
        self.assertEqual(len(res.data), 0)

    def test_non_authentifie_rejete(self):
        res = self.api.get('/api/notifications/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class MarquerLueTest(TestCase):
    def setUp(self):
        self.api   = APIClient()
        self.user  = make_user('user@test.com')
        self.notif = make_notif(self.user, titre='Test', lu=False)
        self.api.force_authenticate(user=self.user)

    def test_marquer_une_notification_lue(self):
        res = self.api.post(f'/api/notifications/{self.notif.id}/lire/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.notif.refresh_from_db()
        self.assertTrue(self.notif.lu)

    def test_marquer_toutes_lues(self):
        make_notif(self.user, titre='Autre 1')
        make_notif(self.user, titre='Autre 2')

        res = self.api.post('/api/notifications/lire/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)

        non_lues = Notification.objects.filter(user=self.user, lu=False).count()
        self.assertEqual(non_lues, 0)

    def test_ne_peut_pas_marquer_notification_dun_autre(self):
        autre = make_user('autre@test.com', nom='Autre')
        notif_autre = make_notif(autre, titre='Privée')

        res = self.api.post(f'/api/notifications/{notif_autre.id}/lire/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
