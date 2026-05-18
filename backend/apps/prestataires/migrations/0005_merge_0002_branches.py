from django.db import migrations


class Migration(migrations.Migration):
    """Fusionne les deux branches 0002 créées en parallèle."""

    dependencies = [
        ('prestataires', '0004_add_photo_field'),
        ('prestataires', '0002_prestataire_statut'),
    ]

    operations = []
