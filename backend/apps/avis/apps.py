from django.apps import AppConfig

class Config(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.avis'

    def ready(self):
        # Connecte les signaux au démarrage de Django
        import apps.avis.signal
