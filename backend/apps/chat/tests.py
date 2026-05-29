from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.chat.models import Conversation, Message
from apps.demandes.models import Demande
from apps.prestataires.models import Categorie, Prestataire
from apps.users.models import User


# helpers

def make_user(email, role='client', nom='Test', prenom='User'):
    return User.objects.create_user(
        email=email, password='TestPass123',
        nom=nom, prenom=prenom,
        telephone='622000000', role=role,
    )


def make_prestataire(user):
    cat, _ = Categorie.objects.get_or_create(nom='Plombier', defaults={'icone': '🔧'})
    return Prestataire.objects.create(
        user=user, categorie=cat,
        description='Plombier', quartier='Kaloum',
        telephone='622000001', disponible=True, approuve=True,
    )


def make_demande(client, prestataire):
    return Demande.objects.create(
        client=client,
        prestataire=prestataire,
        description='Réparation fuite',
        adresse='Kaloum',
        statut='en_cours',
    )


# tests

class ConversationOuvrirTest(TestCase):
    """Ouverture et accès aux conversations via REST."""

    def setUp(self):
        self.api          = APIClient()
        self.client_user  = make_user('client@test.com', role='client')
        self.prest_user   = make_user('prest@test.com',  role='prestataire')
        self.prestataire  = make_prestataire(self.prest_user)
        self.demande      = make_demande(self.client_user, self.prestataire)

    def test_client_peut_ouvrir_conversation(self):
        self.api.force_authenticate(user=self.client_user)
        res = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('id', res.data)

    def test_ouvrir_deux_fois_retourne_la_meme_conversation(self):
        """Idempotent : ouvrir deux fois la même demande → même conversation."""
        self.api.force_authenticate(user=self.client_user)
        res1 = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        res2 = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.assertEqual(res1.data['id'], res2.data['id'])
        self.assertEqual(Conversation.objects.count(), 1)

    def test_prestataire_peut_ouvrir_conversation(self):
        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.assertEqual(res.status_code, status.HTTP_200_OK)

    def test_tiers_ne_peut_pas_ouvrir_conversation(self):
        """Un utilisateur non lié à la demande est refusé."""
        tiers = make_user('tiers@test.com', role='client', nom='Tiers')
        self.api.force_authenticate(user=tiers)
        res = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_authentifie_rejete(self):
        res = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_liste_conversations_vide_au_depart(self):
        self.api.force_authenticate(user=self.client_user)
        res = self.api.get('/api/chat/conversations/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_liste_conversations_apres_ouverture(self):
        self.api.force_authenticate(user=self.client_user)
        self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        res = self.api.get('/api/chat/conversations/')
        self.assertEqual(len(res.data), 1)


class MessageTest(TestCase):
    """Envoi et lecture de messages via REST."""

    def setUp(self):
        self.api         = APIClient()
        self.client_user = make_user('client@test.com', role='client')
        self.prest_user  = make_user('prest@test.com',  role='prestataire')
        self.prestataire = make_prestataire(self.prest_user)
        self.demande     = make_demande(self.client_user, self.prestataire)

        # Crée la conversation une seule fois pour tous les tests
        self.api.force_authenticate(user=self.client_user)
        res = self.api.post('/api/chat/conversations/ouvrir/', {'demande_id': self.demande.id})
        self.conv_id = res.data['id']

    def test_messages_vides_au_depart(self):
        res = self.api.get(f'/api/chat/conversations/{self.conv_id}/messages/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(len(res.data), 0)

    def test_envoyer_message(self):
        res = self.api.post(
            f'/api/chat/conversations/{self.conv_id}/messages/envoyer/',
            {'contenu': 'Bonjour, êtes-vous disponible ?'},
        )
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['contenu'], 'Bonjour, êtes-vous disponible ?')
        self.assertEqual(res.data['expediteur']['id'], self.client_user.id)

    def test_message_vide_rejete(self):
        res = self.api.post(
            f'/api/chat/conversations/{self.conv_id}/messages/envoyer/',
            {'contenu': '   '},
        )
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_messages_marques_lus_a_la_lecture(self):
        """Quand le prestataire lit, les messages du client sont marqués lus."""
        # Le client envoie un message
        self.api.post(
            f'/api/chat/conversations/{self.conv_id}/messages/envoyer/',
            {'contenu': 'Message de test'},
        )

        # Le prestataire consulte les messages
        self.api.force_authenticate(user=self.prest_user)
        self.api.get(f'/api/chat/conversations/{self.conv_id}/messages/')

        msg = Message.objects.first()
        self.assertTrue(msg.lu)

    def test_tiers_ne_peut_pas_lire_messages(self):
        tiers = make_user('tiers@test.com', role='client', nom='Tiers')
        self.api.force_authenticate(user=tiers)
        res = self.api.get(f'/api/chat/conversations/{self.conv_id}/messages/')
        self.assertEqual(res.status_code, status.HTTP_404_NOT_FOUND)
