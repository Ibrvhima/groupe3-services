#!/bin/sh
echo "Waiting for MySQL..."
while ! nc -z db 3306; do
  sleep 1
done
echo "MySQL is ready!"
python manage.py migrate
python manage.py collectstatic --noinput
# Crée le dossier media si absent (nécessaire pour les uploads de photos)
mkdir -p /app/media/photos/prestataires
python manage.py seed
# Daphne = serveur ASGI qui supporte HTTP + WebSocket (nécessaire pour Django Channels)
daphne -b 0.0.0.0 -p 8000 config.asgi:application
