import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('prestataires', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Demande',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('description', models.TextField()),
                ('adresse', models.CharField(max_length=200)),
                ('date_souhaitee', models.DateField(blank=True, null=True)),
                ('statut', models.CharField(
                    choices=[
                        ('en_attente', 'En attente'),
                        ('acceptee',   'Acceptée'),
                        ('refusee',    'Refusée'),
                        ('en_cours',   'En cours'),
                        ('terminee',   'Terminée'),
                        ('annulee',    'Annulée'),
                    ],
                    default='en_attente',
                    max_length=20,
                )),
                ('date_creation', models.DateTimeField(auto_now_add=True)),
                ('date_maj', models.DateTimeField(auto_now=True)),
                ('client', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='demandes_client',
                    to=settings.AUTH_USER_MODEL,
                )),
                ('prestataire', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='demandes_recues',
                    to='prestataires.prestataire',
                )),
            ],
        ),
    ]
