# =========================
# VARIABLES
# =========================

COMPOSE=docker compose

BACKEND_SERVICE=backend
FRONTEND_SERVICE=frontend
DB_SERVICE=db

# =========================
# BUILD / SETUP
# =========================

build:
	$(COMPOSE) build

up:
	$(COMPOSE) up -d

down:
	$(COMPOSE) down

restart:
	$(COMPOSE) down && $(COMPOSE) up -d --build

logs:
	$(COMPOSE) logs -f

# =========================
# BACKEND DJANGO
# =========================

bash-backend:
	$(COMPOSE) exec $(BACKEND_SERVICE) bash

migrate:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py migrate

makemigrations:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py makemigrations

createsuperuser:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py createsuperuser

collectstatic:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py collectstatic --noinput

test-backend:
	$(COMPOSE) exec $(BACKEND_SERVICE) python manage.py test

# =========================
# FRONTEND ANGULAR
# =========================

bash-frontend:
	$(COMPOSE) exec $(FRONTEND_SERVICE) sh

install-frontend:
	$(COMPOSE) exec $(FRONTEND_SERVICE) npm install

build-frontend:
	$(COMPOSE) exec $(FRONTEND_SERVICE) npm run build

serve-frontend:
	$(COMPOSE) exec $(FRONTEND_SERVICE) ng serve --host 0.0.0.0

# =========================
# DATABASE
# =========================

db-shell:
	$(COMPOSE) exec $(DB_SERVICE) psql -U postgres

# =========================
# UTILITAIRES
# =========================

clean:
	$(COMPOSE) down -v
	docker system prune -f

rebuild:
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d