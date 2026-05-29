from pathlib import Path
from datetime import timedelta
from decouple import config

BASE_DIR = Path(__file__).resolve().parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG      = config('DEBUG', default=False, cast=bool)

# En production, lister les domaines autorisés via la variable d'env ALLOWED_HOSTS
ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='*').split(',')

INSTALLED_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Third-party
    'rest_framework',
    'corsheaders',
    'channels',
    # Local
    'apps.users',
    'apps.prestataires',
    'apps.demandes',
    'apps.avis',
    'apps.notifications',
    'apps.devis',
    'apps.chat',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',       # doit être avant CommonMiddleware
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
]

ROOT_URLCONF        = 'config.urls'
WSGI_APPLICATION    = 'config.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

# ── Base de données ────────────────────────────────────────────────────────────
DATABASES = {
    'default': {
        'ENGINE':       'django.db.backends.mysql',
        'NAME':         config('DB_NAME'),
        'USER':         config('DB_USER'),
        'PASSWORD':     config('DB_PASSWORD'),
        'HOST':         config('DB_HOST', default='localhost'),
        'PORT':         config('DB_PORT', default='3306'),
        # Réutilise les connexions pendant 60 s → évite une reconnexion par requête
        'CONN_MAX_AGE': 60,
        'OPTIONS':      {'charset': 'utf8mb4'},
    }
}

AUTH_USER_MODEL = 'users.User'

# ── Cache Redis — partagé entre tous les workers (nécessaire pour le throttling) ─
CACHES = {
    'default': {
        'BACKEND': 'django_redis.cache.RedisCache',
        'LOCATION': f"redis://{config('REDIS_HOST', default='redis')}:6379/1",
        'OPTIONS':  {'CLIENT_CLASS': 'django_redis.client.DefaultClient'},
        'TIMEOUT':  300,   # 5 minutes par défaut
    }
}

# ── Django REST Framework ──────────────────────────────────────────────────────
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    # 20 résultats par page pour éviter des payloads trop lourds
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 20,
    # ── Rate limiting (protection force brute) ─────────────────────────────────
    'DEFAULT_THROTTLE_CLASSES': [
        'rest_framework.throttling.ScopedRateThrottle',
    ],
    'DEFAULT_THROTTLE_RATES': {
        'login':          '5/minute',    # 5 tentatives de connexion par minute par IP
        'register':       '3/minute',    # 3 inscriptions par minute par IP
        'password_reset': '3/minute',    # 3 demandes de reset par minute par IP
    },
}

# ── JWT ────────────────────────────────────────────────────────────────────────
SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME':  timedelta(days=1),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=7),
}

# ── CORS ───────────────────────────────────────────────────────────────────────
# En dev : autoriser tout ; en prod, définir CORS_ALLOWED_ORIGINS dans .env
if DEBUG:
    CORS_ALLOW_ALL_ORIGINS = True
else:
    CORS_ALLOWED_ORIGINS = config(
        'CORS_ALLOWED_ORIGINS',
        default='http://localhost:4200'
    ).split(',')

# ── Fichiers statiques et médias ───────────────────────────────────────────────
STATIC_URL  = '/static/'
MEDIA_URL   = '/media/'
MEDIA_ROOT  = BASE_DIR / 'media'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ── Channels / WebSocket ───────────────────────────────────────────────────────
ASGI_APPLICATION = 'config.asgi.application'

CHANNEL_LAYERS = {
    'default': {
        'BACKEND': 'channels_redis.core.RedisChannelLayer',
        'CONFIG': {
            'hosts': [(config('REDIS_HOST', default='redis'), 6379)],
        },
    }
}

# ── Email — Resend ─────────────────────────────────────────────────────────────
# Créer un compte sur resend.com, générer une clé API et la mettre dans .env
RESEND_API_KEY = config('RESEND_API_KEY', default='')
EMAIL_FROM     = config('EMAIL_FROM', default='DoraKa <onboarding@resend.dev>')
FRONTEND_URL   = config('FRONTEND_URL', default='http://localhost:4200')
