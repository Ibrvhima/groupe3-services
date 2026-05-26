import os

# Fournit des valeurs minimales à decouple avant d'importer settings.py
os.environ.setdefault('SECRET_KEY', 'test-only-not-for-production')
os.environ.setdefault('DEBUG', 'True')
os.environ.setdefault('DB_NAME', 'test')
os.environ.setdefault('DB_USER', 'test')
os.environ.setdefault('DB_PASSWORD', 'test')
os.environ.setdefault('DB_HOST', 'localhost')

from config.settings import *  # noqa

# SQLite en mémoire : rapide, aucune dépendance externe
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': ':memory:',
    }
}

# MD5 à la place de bcrypt → tests ~10x plus rapides
PASSWORD_HASHERS = [
    'django.contrib.auth.hashers.MD5PasswordHasher',
]

# Channel layer en mémoire → pas besoin de Redis pour les tests
CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels.layers.InMemoryChannelLayer',
    }
}
