from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient

from apps.devis.models import Devis
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
    cat, _ = Categorie.objects.get_or_create(nom='Électricien', defaults={'icone': '⚡'})
    return Prestataire.objects.create(
        user=user, categorie=cat,
        description='Électricien qualifié', quartier='Ratoma',
        telephone='622000002', disponible=True, approuve=True,
    )


def make_demande(client, prestataire, statut='en_attente'):
    return Demande.objects.create(
        client=client,
        prestataire=prestataire,
        description='Installation prise électrique',
        adresse='Ratoma centre',
        statut=statut,
    )


# tests

class DevisCreationTest(TestCase):
    def setUp(self):
        self.api          = APIClient()
        self.client_user  = make_user('client@test.com', role='client')
        self.prest_user   = make_user('prest@test.com',  role='prestataire')
        self.prestataire  = make_prestataire(self.prest_user)
        self.demande      = make_demande(self.client_user, self.prestataire)

    def _creer_devis(self):
        return self.api.post('/api/devis/', {
            'demande':     self.demande.id,
            'montant':     '50000',
            'description': 'Installation complète',
            'delai':       '2 jours',
        })

    def test_prestataire_peut_creer_devis(self):
        self.api.force_authenticate(user=self.prest_user)
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)
        self.assertEqual(res.data['statut'], 'en_attente')

    def test_client_ne_peut_pas_creer_devis(self):
        self.api.force_authenticate(user=self.client_user)
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)

    def test_non_authentifie_rejete(self):
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_devis_deuxieme_impossible(self):
        """Un devis en attente existe déjà → refus."""
        self.api.force_authenticate(user=self.prest_user)
        self._creer_devis()
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_demande_non_en_attente_bloquee(self):
        """Impossible d'envoyer un devis si la demande est déjà en cours."""
        self.api.force_authenticate(user=self.prest_user)
        self.demande.statut = 'en_cours'
        self.demande.save()
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_400_BAD_REQUEST)

    def test_autre_prestataire_ne_peut_pas_envoyer_devis(self):
        autre_prest_user = make_user('autre@test.com', role='prestataire', nom='Autre')
        make_prestataire(autre_prest_user)
        self.api.force_authenticate(user=autre_prest_user)
        res = self._creer_devis()
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)


class DevisWorkflowTest(TestCase):
    def setUp(self):
        self.api         = APIClient()
        self.client_user = make_user('client@test.com', role='client')
        self.prest_user  = make_user('prest@test.com',  role='prestataire')
        self.prestataire = make_prestataire(self.prest_user)
        self.demande     = make_demande(self.client_user, self.prestataire)

        # Crée un devis prêt à être traité
        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post('/api/devis/', {
            'demande':     self.demande.id,
            'montant':     '75000',
            'description': 'Réparation complète',
            'delai':       '3 jours',
        })
        self.devis_id = res.data['id']

    def test_client_accepte_devis(self):
        self.api.force_authenticate(user=self.client_user)
        res = self.api.post(f'/api/devis/{self.devis_id}/accepter/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'accepte')

        # La demande doit passer en cours
        self.demande.refresh_from_db()
        self.assertEqual(self.demande.statut, 'en_cours')

    def test_client_refuse_devis(self):
        self.api.force_authenticate(user=self.client_user)
        res = self.api.post(f'/api/devis/{self.devis_id}/refuser/')
        self.assertEqual(res.status_code, status.HTTP_200_OK)
        self.assertEqual(res.data['statut'], 'refuse')

    def test_prestataire_peut_rerenvoyer_devis_apres_refus(self):
        """Après refus, le prestataire peut soumettre un nouveau devis."""
        self.api.force_authenticate(user=self.client_user)
        self.api.post(f'/api/devis/{self.devis_id}/refuser/')

        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post('/api/devis/', {
            'demande':     self.demande.id,
            'montant':     '60000',
            'description': 'Nouvelle offre révisée',
            'delai':       '1 jour',
        })
        self.assertEqual(res.status_code, status.HTTP_201_CREATED)

    def test_prestataire_ne_peut_pas_accepter_son_propre_devis(self):
        self.api.force_authenticate(user=self.prest_user)
        res = self.api.post(f'/api/devis/{self.devis_id}/accepter/')
        self.assertEqual(res.status_code, status.HTTP_403_FORBIDDEN)
