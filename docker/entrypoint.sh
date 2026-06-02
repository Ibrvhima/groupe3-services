#!/bin/sh
# Attend que MySQL soit prêt — supporte docker-compose (host=db) et Railway (host=variable)
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-3306}"
echo "Waiting for MySQL at ${DB_HOST}:${DB_PORT}..."
while ! nc -z "$DB_HOST" "$DB_PORT"; do
  sleep 1
done
echo "MySQL is ready!"
python manage.py migrate
python manage.py collectstatic --noinput
# Crée le dossier media si absent (nécessaire pour les uploads de photos)
mkdir -p /app/media/photos/prestataires
python manage.py seed
# PORT est injecté automatiquement par Railway ; 8000 en local
exec daphne -b 0.0.0.0 -p "${PORT:-8000}" config.asgi:application
