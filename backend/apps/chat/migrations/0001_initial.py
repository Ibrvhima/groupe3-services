from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        ('demandes', '0001_initial'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='Conversation',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('client', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_client', to=settings.AUTH_USER_MODEL)),
                ('demande', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='conversation', to='demandes.demande')),
                ('prestataire', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='conversations_prestataire', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='Message',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('contenu', models.TextField()),
                ('date_envoi', models.DateTimeField(auto_now_add=True)),
                ('lu', models.BooleanField(default=False)),
                ('conversation', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages', to='chat.conversation')),
                ('expediteur', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='messages_envoyes', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'ordering': ['date_envoi'],
                'indexes': [
                    models.Index(fields=['conversation', 'date_envoi'], name='chat_messag_convers_idx'),
                ],
            },
        ),
    ]
