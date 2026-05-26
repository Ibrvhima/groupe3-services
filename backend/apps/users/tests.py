from datetime import timedelta

from django.test import TestCase
from django.utils import timezone
from rest_framework import status
from rest_framework.test import APIClient

from apps.prestataires.models import Categorie
from apps.users.models import PasswordResetToken, User


def make_client(email='client@test.com', **kwargs):
    return User.objects.create_user(
        email=email, password='TestPass123',
        nom=kwargs.get('nom', 'Diallo'), prenom=kwargs.get('prenom', 'Ibrahima'),
        telephone='622000000', role='client',
    )


class RegisterViewTest(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.url = '/api/users/register/'

    def test_register_client(self):
        res = self.api.post(self.url, {
            'email': 'client@test.com', 'password': 'Pass1234!',
            'nom': 'Diallo', 'prenom': 'Ibrahima',
            'telephone': '622123456', 'role': 'client',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)
        self.assertIn('refresh', res.data)
        self.assertEqual(res.data['user']['role'], 'client')

    def test_register_prestataire(self):
        cat = Categorie.objects.create(nom='Plombier', icone='🔧')
        res = self.api.post(self.url, {
            'email': 'prest@test.com', 'password': 'Pass1234!',
            'nom': 'Camara', 'prenom': 'Moussa',
            'telephone': '622654321', 'role': 'prestataire',
            'categorie_id': cat.id, 'quartier': 'Kaloum',
            'description': 'Plombier professionnel',
        })
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['user']['role'], 'prestataire')

    def test_register_prestataire_sans_categorie(self):
        res = self.api.post(self.url, {
            'email': 'prest2@test.com', 'password': 'Pass1234!',
            'nom': 'Bah', 'prenom': 'Fatoumata',
            'telephone': '622111111', 'role': 'prestataire',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('categorie_id', res.data)

    def test_register_email_duplique(self):
        make_client('existe@test.com')
        res = self.api.post(self.url, {
            'email': 'existe@test.com', 'password': 'Pass1234!',
            'nom': 'Autre', 'prenom': 'User',
            'telephone': '622000001', 'role': 'client',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class LoginViewTest(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.url = '/api/users/login/'
        self.user = make_client()

    def test_login_valide(self):
        res = self.api.post(self.url, {'email': 'client@test.com', 'password': 'TestPass123'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertIn('access', res.data)

    def test_login_mauvais_mot_de_passe(self):
        res = self.api.post(self.url, {'email': 'client@test.com', 'password': 'wrong'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_email_inexistant(self):
        res = self.api.post(self.url, {'email': 'nobody@test.com', 'password': 'pass'})
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)


class MeViewTest(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.user = make_client()

    def test_me_authentifie(self):
        self.api.force_authenticate(user=self.user)
        res = self.api.get('/api/users/me/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['email'], 'client@test.com')

    def test_me_non_authentifie(self):
        res = self.api.get('/api/users/me/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)


class PasswordResetTest(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.user = make_client('reset@test.com')

    def test_token_is_valid(self):
        token = PasswordResetToken.objects.create(user=self.user)
        self.assertTrue(token.is_valid)

    def test_token_expire(self):
        token = PasswordResetToken.objects.create(user=self.user)
        token.expires_at = timezone.now() - timedelta(hours=2)
        token.save()
        self.assertFalse(token.is_valid)

    def test_token_deja_utilise(self):
        token = PasswordResetToken.objects.create(user=self.user)
        token.used = True
        token.save()
        self.assertFalse(token.is_valid)

    def test_flux_complet(self):
        # Étape 1 : demande de reset → réponse générique (token jamais dans la réponse)
        res = self.api.post('/api/users/password-reset/', {'email': 'reset@test.com'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertNotIn('token', res.data)   # sécurité : token absent de la réponse HTTP

        # Le token est en base — le lire comme le ferait un vrai email
        token_str = str(PasswordResetToken.objects.get(user=self.user).token)

        # Étape 2 : confirmation avec le token
        res2 = self.api.post('/api/users/password-reset/confirm/', {
            'token': token_str, 'password': 'NouveauPass456',
        })
        self.assertEqual(res2.status_code, status.HTTP_200_OK)

        # Étape 3 : login avec le nouveau mot de passe
        res3 = self.api.post('/api/users/login/', {
            'email': 'reset@test.com', 'password': 'NouveauPass456',
        })
        self.assertEqual(res3.status_code, status.HTTP_200_OK)

    def test_email_inexistant_repond_200(self):
        # Anti-énumération : même réponse que pour un email valide
        res = self.api.post('/api/users/password-reset/', {'email': 'nobody@test.com'})
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertNotIn('token', res.data)

    def test_token_trop_court_mot_de_passe(self):
        token = PasswordResetToken.objects.create(user=self.user)
        res = self.api.post('/api/users/password-reset/confirm/', {
            'token': str(token.token), 'password': 'court',
        })
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)
