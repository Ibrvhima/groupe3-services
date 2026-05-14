from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prestataires', '0003_add_approuve_field'),
    ]

    operations = [
        migrations.AddField(
            model_name='prestataire',
            name='photo',
            field=models.ImageField(blank=True, null=True, upload_to='photos/prestataires/'),
        ),
    ]
