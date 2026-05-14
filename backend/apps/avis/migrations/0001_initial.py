import django.core.validators
import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('demandes', '0001_initial'),
        ('prestataires', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Avis',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('note', models.PositiveSmallIntegerField(validators=[
                    django.core.validators.MinValueValidator(1),
                    django.core.validators.MaxValueValidator(5),
                ])),
                ('commentaire', models.TextField()),
                ('date', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to=settings.AUTH_USER_MODEL,
                )),
                ('demande', models.OneToOneField(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='demandes.demande',
                )),
                ('prestataire', models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    to='prestataires.prestataire',
                )),
            ],
        ),
    ]
