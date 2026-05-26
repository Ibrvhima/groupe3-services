from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.demandes.models import Demande
from apps.prestataires.models import Categorie, Prestataire
from apps.users.models import User


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
        description='Plombier pro', quartier='Kaloum',
        telephone='622000001', disponible=True, approuve=True,
    )


class DemandeWorkflowTest(TestCase):
    def setUp(self):
        self.api = APIClient()
        self.client_user = make_user('client@test.com', role='client')
        self.prest_user = make_user('prest@test.com', role='prestataire')
        self.prestataire = make_prestataire(self.prest_user)

    def _creer_demande(self):
        self.api.force_authenticate(user=self.client_user)
        return self.api.post('/api/demandes/', {
            'prestataire': self.prestataire.id,
            'description': "Réparation fuite d'eau",
            'adresse': 'Kaloum centre',
        })

    def test_client_creer_demande(self):
        res = self._creer_demande()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        # DemandeCreateSerializer ne retourne pas statut → on vérifie en base
        self.assertEqual(Demande.objects.count(), 1)
        self.assertEqual(Demande.objects.first().statut, 'en_attente')

    def test_prestataire_ne_peut_pas_creer_demande(self):
        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post('/api/demandes/', {
            'prestataire': self.prestataire.id,
            'description': 'Test',
        })
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_authentifie_refuse(self):
        res = self.api.get('/api/demandes/')
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_prestataire_accepte_demande(self):
        self._creer_demande()
        demande = Demande.objects.first()

        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post(f'/api/demandes/{demande.id}/accepter/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'acceptee')

    def test_prestataire_refuse_demande(self):
        self._creer_demande()
        demande = Demande.objects.first()

        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post(f'/api/demandes/{demande.id}/refuser/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'refusee')

    def test_workflow_complet_en_attente_acceptee_terminee(self):
        self._creer_demande()
        demande = Demande.objects.first()

        self.api.force_authenticate(user=self.prest_user)
        self.api.post(f'/api/demandes/{demande.id}/accepter/')

        res = self.api.post(f'/api/demandes/{demande.id}/terminer/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'terminee')

    def test_ne_peut_pas_terminer_demande_en_attente(self):
        self._creer_demande()
        demande = Demande.objects.first()

        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post(f'/api/demandes/{demande.id}/terminer/')
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_client_voit_seulement_ses_demandes(self):
        self._creer_demande()

        autre_client = make_user('other@test.com', role='client', nom='Autre')
        self.api.force_authenticate(user=autre_client)
        res = self.api.get('/api/demandes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 0)

    def test_prestataire_voit_demandes_qui_lui_sont_adressees(self):
        self._creer_demande()

        self.api.force_authenticate(user=self.prest_user)
        res = self.api.get('/api/demandes/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['count'], 1)

    def test_annuler_demande_en_attente(self):
        self._creer_demande()
        demande = Demande.objects.first()

        self.api.force_authenticate(user=self.client_user)
        res = self.api.post(f'/api/demandes/{demande.id}/annuler/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'annulee')
