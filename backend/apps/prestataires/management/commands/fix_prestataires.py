"""
Commande Django pour diagnostiquer et corriger les prestataires invisibles.

Usage sur Render (Shell) :
    python manage.py fix_prestataires          ← affiche le diagnostic
    python manage.py fix_prestataires --fix    ← active tous les prestataires approuvés
"""

from django.core.management.base import BaseCommand
from apps.prestataires.models import Prestataire


class Command(BaseCommand):
    help = 'Diagnostique et corrige les prestataires non visibles côté client'

    def add_arguments(self, parser):
        parser.add_argument(
            '--fix',
            action='store_true',
            help='Active la disponibilité pour tous les prestataires approuvés',
        )

    def handle(self, *args, **options):
        self.stdout.write('\n=== TOUS LES PRESTATAIRES ===\n')

        tous = Prestataire.objects.select_related('user', 'categorie').order_by('id')

        if not tous.exists():
            self.stdout.write(self.style.WARNING('Aucun prestataire en base.'))
            return

        for p in tous:
            visible  = p.user.is_active and p.approuve and p.disponible
            statut   = self.style.SUCCESS('VISIBLE') if visible else self.style.ERROR('INVISIBLE')
            categorie = p.categorie.nom if p.categorie else '(sans catégorie)'

            self.stdout.write(
                f'[{statut}] ID={p.id} | {p.user.nom} {p.user.prenom} | {categorie} | '
                f'approuve={p.approuve} | disponible={p.disponible} | '
                f'is_active={p.user.is_active} | statut={p.statut}'
            )

        if options['fix']:
            self.stdout.write('\n=== CORRECTION ===\n')
            # Active la disponibilité pour tous les prestataires approuvés
            corriges = Prestataire.objects.filter(
                approuve=True,
                disponible=False,
                user__is_active=True,
            )
            n = corriges.count()
            if n == 0:
                self.stdout.write(self.style.WARNING(
                    'Aucun prestataire approuvé avec disponible=False trouvé.'))
            else:
                corriges.update(disponible=True)
                self.stdout.write(self.style.SUCCESS(
                    f'{n} prestataire(s) mis à jour : disponible=True'))

            # Aussi corriger les prestataires avec statut='approuve' mais approuve=False
            desync = Prestataire.objects.filter(statut='approuve', approuve=False)
            nd = desync.count()
            if nd > 0:
                desync.update(approuve=True, disponible=True)
                self.stdout.write(self.style.SUCCESS(
                    f'{nd} prestataire(s) désynchronisés corrigés (statut=approuve mais approuve=False)'))

            self.stdout.write('\n=== RÉSULTAT FINAL ===\n')
            for p in Prestataire.objects.select_related('user', 'categorie').order_by('id'):
                visible = p.user.is_active and p.approuve and p.disponible
                statut  = self.style.SUCCESS('VISIBLE') if visible else self.style.ERROR('INVISIBLE')
                self.stdout.write(
                    f'[{statut}] {p.user.nom} {p.user.prenom} | '
                    f'approuve={p.approuve} | disponible={p.disponible}')
