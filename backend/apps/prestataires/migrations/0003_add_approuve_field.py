from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prestataires', '0002_prestataire_prestataire_disponi_65d904_idx_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='prestataire',
            name='approuve',
            field=models.BooleanField(default=False),
        ),
    ]
