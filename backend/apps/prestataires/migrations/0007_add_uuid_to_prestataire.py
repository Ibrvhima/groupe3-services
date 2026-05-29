import uuid
from django.db import migrations, models


def generate_uuids(apps, schema_editor):
    Prestataire = apps.get_model('prestataires', 'Prestataire')
    for p in Prestataire.objects.all():
        p.uuid = uuid.uuid4()
        p.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('prestataires', '0006_prestataire_statut'),
    ]

    operations = [
        # Étape 1 : ajouter la colonne nullable sans contrainte unique
        migrations.AddField(
            model_name='prestataire',
            name='uuid',
            field=models.UUIDField(null=True, blank=True, editable=False),
        ),
        # Étape 2 : remplir chaque ligne avec un UUID distinct
        migrations.RunPython(generate_uuids, migrations.RunPython.noop),
        # Étape 3 : rendre le champ non-nullable et unique
        migrations.AlterField(
            model_name='prestataire',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, editable=False, unique=True),
        ),
    ]
