#!/bin/sh
echo "Waiting for MySQL..."
while ! nc -z db 3306; do
  sleep 1
done
echo "MySQL is ready!"
python manage.py migrate
# Crée le dossier media si absent (nécessaire pour les uploads de photos)
mkdir -p /app/media/photos/prestataires
python manage.py seed
gunicorn config.wsgi:application --bind 0.0.0.0:8000 --workers 4 --timeout 60
