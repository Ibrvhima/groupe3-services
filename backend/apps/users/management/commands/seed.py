from django.core.management.base import BaseCommand
from apps.users.models import User
from apps.prestataires.models import Categorie


CATEGORIES = [
    ('Plombier',      '🔧'),
    ('Électricien',   '⚡'),
    ('Mécanicien',    '🔩'),
    ('Maçon',         '🏗️'),
    ('Peintre',       '🎨'),
    ('Menuisier',     '🪚'),
    ('Climatisation', '❄️'),
    ('Jardinier',     '🌿'),
    ('Informaticien', '💻'),
    ('Couturier',     '🧵'),
]


class Command(BaseCommand):
    help = 'Initialise la base : admin + catégories de base'

    def handle(self, *args, **kwargs):
        self._creer_admin()
        self._creer_categories()

    def _creer_admin(self):
        if User.objects.filter(email='admin@douraka.com').exists():
            self.stdout.write('  ✓ Admin déjà présent.')
            return

        User.objects.create_superuser(
            email='admin@douraka.com',
            password='Admin@123',
            nom='Admin',
            prenom='DouraKa',
            telephone='000000000',   # champ requis sur le modèle
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(
            '  ✓ Admin créé — admin@douraka.com / Admin@123'
        ))

    def _creer_categories(self):
        created = 0
        for nom, icone in CATEGORIES:
            _, was_created = Categorie.objects.get_or_create(
                nom=nom,
                defaults={'icone': icone},
            )
            if was_created:
                created += 1

        if created:
            self.stdout.write(self.style.SUCCESS(
                f'  ✓ {created} catégorie(s) créée(s).'
            ))
        else:
            self.stdout.write('  ✓ Catégories déjà présentes.')
