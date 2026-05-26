from django.test import TestCase
from rest_framework.test import APIClient

from apps.avis.models import Avis
from apps.demandes.models import Demande
from apps.prestataires.models import Categorie, Prestataire
from apps.users.models import User


# ── Helpers ──────────────────────────────────────────────────────────────────

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


def make_demande_terminee(client, prestataire):
    """Crée une demande avec statut 'terminee' directement en base."""
    return Demande.objects.create(
        client=client,
        prestataire=prestataire,
        description="Réparation fuite",
        adresse="Kaloum centre",
        statut='terminee',
    )


# ── Tests ─────────────────────────────────────────────────────────────────────

class NoteMoyenneSignalTest(TestCase):
    """Vérifie que note_moyenne est recalculée automatiquement via signal."""

    def setUp(self):
        self.api = APIClient()
        self.client_user = make_user('client@test.com', role='client')
        self.prest_user  = make_user('prest@test.com',  role='prestataire')
        self.prestataire = make_prestataire(self.prest_user)

    def _note(self):
        self.prestataire.refresh_from_db()
        return float(self.prestataire.note_moyenne)

    def test_note_zero_par_defaut(self):
        self.assertEqual(self._note(), 0.0)

    def test_note_mise_a_jour_apres_premier_avis(self):
        demande = make_demande_terminee(self.client_user, self.prestataire)
        Avis.objects.create(
            demande=demande, client=self.client_user,
            prestataire=self.prestataire, note=4, commentaire='Bien',
        )
        self.assertEqual(self._note(), 4.0)

    def test_note_moyenne_de_plusieurs_avis(self):
        # 3 clients, 3 demandes, 3 avis → moyenne (5+3+4)/3 = 4.0
        for i, note in enumerate([5, 3, 4]):
            client  = make_user(f'client{i}@test.com', role='client', nom=f'C{i}')
            demande = make_demande_terminee(client, self.prestataire)
            Avis.objects.create(
                demande=demande, client=client,
                prestataire=self.prestataire, note=note, commentaire='OK',
            )
        self.assertEqual(self._note(), 4.0)

    def test_note_remise_a_zero_apres_suppression(self):
        demande = make_demande_terminee(self.client_user, self.prestataire)
        avis = Avis.objects.create(
            demande=demande, client=self.client_user,
            prestataire=self.prestataire, note=5, commentaire='Parfait',
        )
        self.assertEqual(self._note(), 5.0)

        avis.delete()
        self.assertEqual(self._note(), 0.0)


class AvisAPITest(TestCase):
    """Vérifie les règles métier de l'API /api/avis/."""

    def setUp(self):
        self.api = APIClient()
        self.client_user = make_user('client@test.com', role='client')
        self.prest_user  = make_user('prest@test.com',  role='prestataire')
        self.prestataire = make_prestataire(self.prest_user)
        self.demande     = make_demande_terminee(self.client_user, self.prestataire)
        self.api.force_authenticate(user=self.client_user)

    def test_creer_avis_valide(self):
        res = self.api.post('/api/avis/', {
            'demande': self.demande.id, 'note': 5, 'commentaire': 'Top !',
        })
        self.assertEqual(res.status_code, 201)
        self.prestataire.refresh_from_db()
        self.assertEqual(float(self.prestataire.note_moyenne), 5.0)

    def test_avis_double_interdit(self):
        self.api.post('/api/avis/', {'demande': self.demande.id, 'note': 4, 'commentaire': 'Bien'})
        res = self.api.post('/api/avis/', {'demande': self.demande.id, 'note': 3, 'commentaire': 'Bof'})
        self.assertEqual(res.status_code, 400)

    def test_avis_demande_non_terminee_interdit(self):
        demande_en_cours = Demande.objects.create(
            client=self.client_user, prestataire=self.prestataire,
            description='Autre', adresse='Kaloum', statut='en_attente',
        )
        res = self.api.post('/api/avis/', {
            'demande': demande_en_cours.id, 'note': 5, 'commentaire': 'Test',
        })
        self.assertEqual(res.status_code, 400)

    def test_autre_client_ne_peut_pas_noter(self):
        autre = make_user('autre@test.com', role='client', nom='Autre')
        self.api.force_authenticate(user=autre)
        res = self.api.post('/api/avis/', {
            'demande': self.demande.id, 'note': 2, 'commentaire': 'Pas moi',
        })
        self.assertEqual(res.status_code, 400)
