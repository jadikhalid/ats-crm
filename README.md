# ESN ATS/CRM

Plateforme interne **ATS** (Applicant Tracking System) et **CRM** pour ESN, destinée aux équipes **Sales** et **RH** : sourcing candidats, matching IA, gestion des opportunités, clients et candidatures.

Monorepo : backend Java (architecture hexagonale), frontend Angular, base MySQL locale via Docker.

## Fonctionnalités

| Domaine | Description |
|---------|-------------|
| **CRM** | Comptes clients, contacts, opportunités commerciales |
| **Candidats** | Profils, compétences, import CV |
| **Matching IA** | Rapprochement besoin ↔ profil avec score explicable |
| **RFP / AO** | Parsing d'appels d'offres, réponses assistées |
| **Sourcing** | Campagnes et enrichissement de profils |
| **Sécurité** | RBAC, audit trail, auth JWT (dev) ou Microsoft Entra ID (prod) |

## Stack technique

| Couche | Technologies |
|--------|--------------|
| Backend | Java 21, Spring Boot 3.4, Maven multi-modules |
| Frontend | Angular 19, MSAL (Entra ID) |
| Base de données | MySQL 8, Flyway |
| IA | OpenAI, Anthropic Claude |
| Cloud (cible) | Azure (Container Apps, MySQL, Blob, Key Vault, Entra ID) |

## Structure du dépôt

```
/
├── backend/              # Maven : ats-common, ats-domain, ats-application, ats-infrastructure, ats-api
├── frontend/             # SPA Angular (features lazy-loaded)
├── infra/
│   ├── mysql/init/       # Scripts d'initialisation Docker
│   └── azure/            # IaC Azure (à venir)
├── docs/                 # ADR et documentation complémentaire
├── docker-compose.yml    # MySQL local
├── .env.example          # Variables d'environnement
└── architecture_plan.md  # Plan d'architecture détaillé
```

### Modules backend

| Module | Rôle |
|--------|------|
| `ats-common` | Exceptions, utilitaires, constantes |
| `ats-domain` | Entités, value objects, ports |
| `ats-application` | Cas d'usage, orchestration |
| `ats-infrastructure` | JPA, Flyway, clients IA, adapters |
| `ats-api` | REST, sécurité, configuration Spring Boot |

## Prérequis

- **JDK 21** et **Maven 3.9+**
- **Node.js 20 LTS** et **npm 10+**
- **Docker** et **Docker Compose**

## Démarrage local

### 1. Base de données

```bash
docker compose up -d
```

MySQL est exposé sur le port **3307** (mapping `3307:3306`).

### 2. Variables d'environnement

```bash
cp .env.example .env
```

Adaptez au minimum `DB_PORT=3307` si vous utilisez Docker Compose. Ne commitez jamais de clés API réelles (`OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, etc.).

### 3. Backend

```bash
cd backend
mvn -pl ats-api -am spring-boot:run -Dspring-boot.run.profiles=dev
```

### 4. Frontend

```bash
cd frontend
npm install
npm start
```

## URLs locales

| Service | URL |
|---------|-----|
| API REST | http://localhost:8080/api |
| Swagger UI | http://localhost:8080/api/swagger-ui.html |
| Interface Angular | http://localhost:4200 |

## Authentification

| Environnement | Mode | Configuration |
|---------------|------|---------------|
| Développement | JWT local | `SECURITY_AUTH_MODE=jwt-local` (défaut dans `.env.example`) |
| Production / Azure | Entra ID | `SECURITY_AUTH_MODE=oauth2-resource-server`, `SPRING_PROFILES_ACTIVE=prod` ou `azure` |

Les rôles applicatifs incluent notamment `ROLE_AGENT`, `ROLE_CLIENT` et `ROLE_ADMIN`. Le frontend bascule entre login JWT (dev) et SSO Microsoft (MSAL) selon l'environnement.

## Commandes utiles

```bash
# Compiler tout le backend
cd backend && mvn compile

# Build production frontend
cd frontend && npm run build:prod

# Tests backend
cd backend && mvn test

# Tests frontend
cd frontend && npm test
```

## Conventions

- API REST : `/api/v1/{resource}` (pluriel, kebab-case)
- Migrations Flyway : `V{n}__description_snake.sql` — ne jamais modifier une migration déjà appliquée
- Commits : [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`)
- Branches : `main`, `develop`, `feature/*`, `fix/*`

## Documentation

Le fichier [`architecture_plan.md`](architecture_plan.md) décrit la vision produit, l'architecture hexagonale, la roadmap par phases, les décisions d'architecture (ADR) et les conventions de développement.

## Licence

Projet interne — usage privé ESN.
