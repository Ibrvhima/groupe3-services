# DouraKa

Application web de mise en relation entre clients et prestataires de services en Guinée.

## Stack technique
- **Frontend** : Angular 17+ (Nginx)
- **Backend** : Django REST Framework (Python 3.11)
- **Base de données** : MySQL 8.4
- **Cache** : Redis 7
- **Déploiement** : Docker + Docker Compose

---

## Prérequis

Avant de commencer, assure-toi d'avoir installé sur ta machine :

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (inclut Docker et Docker Compose)
- [Git](https://git-scm.com/downloads)

---

## Installation et lancement

### 1. Cloner le projet

```bash
git clone https://github.com/Ibrvhima/groupe3-services.git
cd groupe3-services
```

### 2. Créer le fichier d'environnement

Crée un fichier `.env` à la racine du projet avec ce contenu :

```env
SECRET_KEY=douraka-secret-key-change-in-prod
DEBUG=True
DB_NAME=douraka_db
DB_USER=douraka
DB_PASSWORD=[votre mot de pass MySql]
DB_HOST=db
DB_PORT=3306
ALLOWED_HOSTS=*
```

### 3. Lancer le projet

```bash
docker-compose up --build
```

La première fois, Docker va télécharger les images et construire le projet (5 à 10 minutes selon ta connexion). Les fois suivantes, utilise simplement :

```bash
docker-compose up
```

### 4. Accéder à la plateforme

Une fois les conteneurs démarrés, ouvre ton navigateur :

| Service | URL |
|---------|-----|
| Application | http://localhost:4200 |
| API Backend | http://localhost:4200/api/ |

---

## Tester la plateforme

### Compte Admin (tableau de bord)
Un compte administrateur est créé automatiquement au démarrage :

| Champ | Valeur |
|-------|--------|
| Email | `admin@douraka.com` |
| Mot de passe | `Admin@123` |

### Créer un compte Client
1. Va sur http://localhost:4200
2. Clique sur **S'inscrire**
3. Choisis le rôle **Client**
4. Remplis le formulaire et connecte-toi

### Créer un compte Prestataire
1. Va sur http://localhost:4200
2. Clique sur **S'inscrire**
3. Choisis le rôle **Prestataire**
4. Remplis tes informations professionnelles (catégorie, quartier, description)
5. Ton compte sera **en attente d'approbation** par l'admin

### Flux complet à tester
1. L'admin approuve le prestataire depuis le tableau de bord
2. Le client recherche un prestataire et envoie une demande
3. Le prestataire accepte la demande et envoie un devis
4. Le client accepte le devis
5. Le prestataire marque la mission comme terminée
6. Le client laisse un avis et une note

---

## Arrêter le projet

```bash
docker-compose down
```

Pour tout arrêter et supprimer les données (repart de zéro) :

```bash
docker-compose down -v
```

---

## Structure du projet

```
groupe3-services/
├── backend/          → API Django REST Framework
├── frontend/         → Application Angular
├── docker/           → Configuration Nginx
├── docker-compose.yml
└── .env              → Variables d'environnement (à créer)
```

---

## Équipe — Groupe 3
Ibrahima Diallo, Boubacar Cherif, Mamadou Djouldé
