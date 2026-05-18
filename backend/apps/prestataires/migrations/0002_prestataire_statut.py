from django.db import migrations


class Migration(migrations.Migration):
    # Champ 'statut' supprimé du modèle — migration rendue no-op
    dependencies = [
        ('prestataires', '0001_initial'),
    ]

    operations = []
