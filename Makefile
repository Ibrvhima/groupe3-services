COMPOSE = docker compose

# docker
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

# backend django
bash-backend:
	$(COMPOSE) exec backend bash

migrate:
	$(COMPOSE) exec backend python manage.py migrate

makemigrations:
	$(COMPOSE) exec backend python manage.py makemigrations

createsuperuser:
	$(COMPOSE) exec backend python manage.py createsuperuser

test:
	$(COMPOSE) exec backend python manage.py test --settings=config.settings_test

seed:
	$(COMPOSE) exec backend python manage.py seed

# frontend angular
bash-frontend:
	$(COMPOSE) exec frontend sh

# base de données mysql
db-shell:
	$(COMPOSE) exec db mysql -u douraka -p douraka_db

# nettoyage
clean:
	$(COMPOSE) down -v
	docker system prune -f

rebuild:
	$(COMPOSE) down
	$(COMPOSE) build --no-cache
	$(COMPOSE) up -d
