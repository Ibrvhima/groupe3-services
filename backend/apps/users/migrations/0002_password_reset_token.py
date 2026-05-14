from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='PasswordResetToken',
            fields=[
                ('id',         models.BigAutoField(auto_created=True, primary_key=True, serialize=False)),
                ('token',      models.UUIDField(default=uuid.uuid4, unique=True, editable=False)),
                ('expires_at', models.DateTimeField()),
                ('used',       models.BooleanField(default=False)),
                ('user',       models.ForeignKey(
                    on_delete=django.db.models.deletion.CASCADE,
                    related_name='reset_tokens',
                    to='users.user',
                )),
            ],
        ),
    ]
