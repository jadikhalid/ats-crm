# ESN ATS/CRM — Dossier de présentation projet

> **Document de décision** — Synthèse produit, architecture, ressources et planning.  
> Version : mai 2026 · Usage : validation direction et lancement du programme.

---

## Résumé exécutif

### En une phrase

Plateforme interne unifiant **CRM** (clients, opportunités) et **ATS** (candidats, candidatures, sourcing), avec **matching IA explicable** et module **appels d’offres (RFP)**, hébergée sur **Microsoft Azure** et sécurisée par **Entra ID**.

### Pourquoi ce projet ?

| Problème aujourd’hui                          | Apport de la plateforme                                                 |
| --------------------------------------------- | ----------------------------------------------------------------------- |
| Outils dispersés (Excel, emails, ATS partiel) | **Une seule source de vérité** pour Sales et RH                         |
| Proposition de profils lente                  | **Matching IA** : score + justification en quelques secondes            |
| Traçabilité client faible                     | **Portail client** : validation des short-lists en ligne, audit complet |
| Réponses aux AO chronophages                  | **Assistant RFP** : extraction d’exigences + brouillon éditable         |
| Données sensibles peu maîtrisées              | **RBAC, Entra ID, Blob sécurisé, logs IA, conformité RGPD**             |

### Chiffres clés (ordre de grandeur)

| Dimension                              | Estimation                                          |
| -------------------------------------- | --------------------------------------------------- |
| **MVP production** (usage interne ESN) | **3 à 4 mois** · équipe 5–6 personnes               |
| **Produit complet** (vision cible)     | **8 à 11 mois** depuis l’état actuel du code        |
| **Plateforme mature**                  | **10 à 14 mois**                                    |
| **Équipe recommandée**                 | **5 à 7 ETP** équivalent (dont métier et QA)        |
| **Coût cloud** (hors IA)               | **~800 € – 2 500 € / mois** en production           |
| **Coût IA** (variable)                 | **~500 € – 5 000 € / mois** selon volume — à cadrer |

### Recommandation

**Valider le programme en deux temps** : (1) **MVP à 3–4 mois** pour mise en production interne (CRM + candidats + matching + pipeline candidatures + Azure) ; (2) **extension** portail client, RFP, sourcing et pilotage KPI sur **6–8 mois** supplémentaires.  
Le socle technique et une partie du CRM/IA **existent déjà** dans le dépôt : le risque est maîtrisé, le time-to-value est raccourci.

---

## Table des matières

1. [Titre et objectif du produit](#i--titre-et-objectif-du-produit)
2. [Logique métier, parcours utilisateurs et IA](#ii--logique-métier-parcours-utilisateurs-et-ia)
3. [Architecture cible](#iii--architecture-cible)
4. [Ressources et planning](#iv--ressources-et-planning)
5. [Jalons et facteurs de succès](#v--jalons-et-facteurs-de-succès)
6. [Décision attendue](#vi--décision-attendue)

---

# I — Titre et objectif du produit

## Plateforme interne ATS & CRM pour ESN

**Applicant Tracking System (ATS)** et **CRM** destinés aux équipes **Sales** et **RH** d’une ESN (Entreprise de Services du Numérique).

### Capacités cibles

| Domaine         | Description                                                               |
| --------------- | ------------------------------------------------------------------------- |
| **CRM**         | Comptes clients, contacts, opportunités commerciales (besoins / missions) |
| **ATS**         | Vivier candidats, CV, candidatures, pipeline RH                           |
| **Sourcing**    | Campagnes de recherche et enrichissement de profils                       |
| **Matching IA** | Rapprochement besoin ↔ profil avec **score explicable**                   |
| **RFP / AO**    | Parsing d’appels d’offres, réponses assistées par IA                      |
| **Pilotage**    | Tableaux de bord, KPIs, validations manager                               |
| **Sécurité**    | RBAC, audit trail, SSO Microsoft Entra ID                                 |

### Principes directeurs

- **IA assistée, jamais autonome** — toute suggestion est traçable, révisable et validée par un humain.
- **API-first** — un contrat REST pour le front et les intégrations futures.
- **Sécurité by design** — rôles, audit, secrets hors code.
- **Cloud Azure** — alignement avec l’écosystème Microsoft du groupe.

---

# II — Logique métier, parcours utilisateurs et IA

> Parcours décrits pour l’**application complète** (vision cible).  
> Rôles : **Client**, **RH**, **Commercial (Sales)**, **Manager**, **Administrateur**.

## Utilisateur client (entreprise cliente de l’ESN)

Contact chez le client final (achat, manager métier). Il **pilote ses besoins** et **valide les propositions** de l’ESN — sans accès au vivier candidats interne.

| Étape             | Action                                                                                |
| ----------------- | ------------------------------------------------------------------------------------- |
| Connexion         | SSO **Microsoft Entra** → **portail client**                                          |
| Suivi des besoins | Liste des **opportunités / missions** (en cours, pourvues, closes)                    |
| Profils proposés  | Consultation des **short-lists** (anonymisation RGPD), score et justification IA      |
| Validation        | **Accepter**, **refuser** ou **demander une modification** → notifications Sales + RH |
| Appels d’offres   | Dépôt / consultation documents RFP partagés, suivi de la réponse ESN                  |
| Traçabilité       | Historique des échanges et validations — **audit** complet                            |

---

## Responsable RH (recruteur / manager RH)

Gestion du **vivier candidats**, du **pipeline candidatures** et du **sourcing**, en lien avec les commerciaux.

| Étape         | Action                                                                                                   |
| ------------- | -------------------------------------------------------------------------------------------------------- |
| Connexion     | Tableau de bord RH : candidats actifs, candidatures, alertes                                             |
| Sourcing      | Campagnes (critères), **import CV** (PDF/Word) → profil structuré **par IA**, relecture humaine          |
| Vivier        | Enrichissement fiches, recherche avancée (full-text, compétences)                                        |
| Pipeline      | **Kanban** candidatures par opportunité (qualification → proposition client → entretien → offre / refus) |
| Matching      | Scoring **multi-candidats**, historique des scores, proposition short-list                               |
| Collaboration | Contexte CRM, commentaires internes, notifications                                                       |
| Reporting     | Délais, taux de conversion, volume CV — **audit** des actions sensibles                                  |

**Sources IA (RH)** : parsing CV · matching candidat ↔ opportunité · enrichissement profil.

---

## Responsable commercial / Sales manager

Pilotage **portefeuille clients**, **opportunités**, **RFP** et **propositions** vers le client.

| Étape        | Action                                                                                         |
| ------------ | ---------------------------------------------------------------------------------------------- |
| Connexion    | Tableau de bord commercial : opportunités, RFP, relances                                       |
| CRM clients  | Comptes entreprise, **contacts**, association aux opportunités                                 |
| Opportunités | Création besoin/mission, assignation **référent RH**, suivi statuts                            |
| Matching     | Scores IA (unitaire ou batch), constitution **short-list**, envoi au portail client            |
| RFP / AO     | Import PDF → **extraction exigences IA** → brouillon réponse **éditable** → validation manager |
| Sourcing     | Campagnes liées aux besoins urgents                                                            |
| Exports      | Short-lists PDF/Excel pour réunions client                                                     |
| Reporting    | Pipeline, time-to-submit, missions pourvues                                                    |

**Sources IA (Sales)** : matching · analyse RFP · brouillon réponse AO.

---

## Manager (RH ou Sales — rôle transverse)

Responsable d’équipe : **validation**, **pilotage**, **arbitrage** — pas l’opérationnel quotidien complet.

| Étape       | Action                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Connexion   | Tableau de bord manager : KPIs globaux ou par équipe                   |
| Supervision | Opportunités en retard, candidatures bloquées, RFP à valider           |
| Validation  | Brouillons RFP, short-lists exceptionnelles, étapes pipeline sensibles |
| Pilotage    | Fill rate, time-to-submit, volume sourcing, **coûts / usage IA**       |
| Alertes     | Validations en attente, délais, anomalies IA (quota, échec)            |

---

## Administrateur

Fonctionnement, **sécurité** et **paramétrage** pour toute l’ESN.

| Étape        | Action                                                                                |
| ------------ | ------------------------------------------------------------------------------------- |
| Connexion    | Console d’**administration**                                                          |
| Utilisateurs | Comptes, rôles, mapping **groupes Entra ID**                                          |
| Référentiels | Compétences, statuts, secteurs, modèles RFP                                           |
| IA           | Provider par cas d’usage (OpenAI / Azure OpenAI / Claude), limites, **logs et coûts** |
| Données      | Blob CV/RFP, rétention, **audit trail** global, RGPD                                  |
| Exploitation | Monitoring Azure, interventions de support                                            |

---

## Chaîne de valeur — comment les rôles s’enchaînent

```
Commercial crée opportunité + assigne RH
        ↓
RH source / importe CV → pipeline candidatures
        ↓
Matching IA (RH + Sales) → short-list
        ↓
Client valide dans son portail
        ↓
(Si AO) Sales + module RFP → Manager valide → envoi client
        ↓
Admin + Managers pilotent par KPIs et conformité
```

**Connexion commune** : **Microsoft Entra ID** en production — un outil, des parcours adaptés au rôle.

---

# III — Architecture cible

## 1. Objectif technique

Unifier ATS, CRM, RFP et pilotage dans un **modular monolith** hexagonal (Java/Spring) exposé en **API REST**, avec une **SPA Angular** et hébergement **Azure**.

| Principe    | Mise en œuvre                                     |
| ----------- | ------------------------------------------------- |
| IA assistée | Port domaine `AiService` — humain valide toujours |
| API-first   | REST `/api/v1/`, OpenAPI, pagination serveur      |
| Sécurité    | RBAC, audit, Key Vault, Entra ID                  |
| Évolutivité | Bounded contexts métier, scale Azure              |

## 2. Personas et rôles (RBAC)

| Rôle               | Périmètre principal                                            |
| ------------------ | -------------------------------------------------------------- |
| **Client**         | Ses opportunités, short-lists, validations, documents partagés |
| **RH**             | Candidats, CV, candidatures, sourcing, matching, kanban        |
| **Commercial**     | Clients, opportunités, matching, RFP, propositions             |
| **Manager**        | KPIs, validations RFP et étapes sensibles                      |
| **Administrateur** | Utilisateurs, référentiels, IA, audit, plateforme              |

**Auth** : Entra ID (prod) · JWT local (dev uniquement).

## 3. Domaines métier

| Domaine             | Entités clés                              |
| ------------------- | ----------------------------------------- |
| Auth & utilisateurs | User, Role                                |
| CRM — Clients       | Account, Contact                          |
| CRM — Opportunités  | Opportunity                               |
| ATS — Candidats     | Candidate, CandidateSkill, ResumeDocument |
| ATS — Candidatures  | Application                               |
| Matching            | MatchScore, ai_request_log                |
| Sourcing            | SourcingCampaign, SourcingResult          |
| RFP                 | RfpDocument, RfpResponse                  |
| Audit & Reporting   | AuditRevision, agrégations KPI            |

**Relations centrales**

```
Account (client) ──< Opportunity ──< Application >── Candidate
                      │                    │
                      └── MatchScore ──────┘
Opportunity ── RfpDocument ── RfpResponse
SourcingCampaign ──> SourcingResult ──> Candidate
```

## 4. Vue d’ensemble technique

```
[Navigateur]
      ↓
[Angular SPA] ──HTTPS──▶ [Azure Front Door / CDN]
                              ↓
                    [Container Apps / App Service]
                              ↓
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        [API REST]      [Key Vault]    [Blob Storage]
              ↓                          (CV, RFP)
    [Application + Domaine]
              ↓
    ┌─────────┼─────────┐
    ▼         ▼         ▼
 [MySQL]  [OpenAI /    [Entra ID]
          Azure OpenAI /
          Claude]
```

## 5. Stack technique

| Couche   | Technologies                                                            |
| -------- | ----------------------------------------------------------------------- |
| Frontend | Angular 19, standalone, lazy routes, MSAL                               |
| Backend  | Java 21, Spring Boot 3.4, Maven multi-modules                           |
| BDD      | MySQL 8, Flyway, JPA (adapters)                                         |
| Fichiers | Azure Blob Storage                                                      |
| IA       | OpenAI / Azure OpenAI (CV, matching), Claude (RFP longs)                |
| Auth     | Entra ID, OAuth2 Resource Server                                        |
| Ops      | Key Vault, Application Insights, CI/CD (GitHub Actions ou Azure DevOps) |
| Avancé   | Redis (cache), MySQL FULLTEXT ou Elasticsearch (recherche)              |

## 6. Backend hexagonal

```
ats-api → ats-infrastructure → ats-application → ats-domain → ats-common
```

| Module                 | Rôle                                       |
| ---------------------- | ------------------------------------------ |
| **ats-domain**         | Métier + ports — sans dépendance framework |
| **ats-application**    | Cas d’usage, transactions                  |
| **ats-infrastructure** | JPA, Flyway, IA, Blob, Entra               |
| **ats-api**            | REST, sécurité                             |
| **ats-common**         | Exceptions, utilitaires                    |

## 7. Frontend par features

`core/` · `shared/` · `layout/` · `features/` (auth, dashboard, clients, opportunities, candidates, applications, matching, rfp, sourcing, client-portal, admin)

## 8. Intégrations IA

| Cas d’usage   | Provider              | Entrée → Sortie                                          |
| ------------- | --------------------- | -------------------------------------------------------- |
| Parsing CV    | OpenAI / Azure OpenAI | Texte (Tika) → profil JSON                               |
| Matching      | OpenAI / Azure OpenAI | Candidat + opportunité → score 0–100 + forces/faiblesses |
| Analyse RFP   | Claude                | PDF AO → checklist exigences                             |
| Brouillon RFP | OpenAI ou Claude      | Exigences + contexte → sections éditables                |

**Garde-fous** : prompts versionnés · anonymisation · fallback provider · rate limiting · RGPD · **Azure OpenAI** privilégié en prod.

## 9. Sécurité et conformité

| Sujet            | Approche                                 |
| ---------------- | ---------------------------------------- |
| Authentification | Entra ID (OIDC), JWT Bearer              |
| Autorisation     | RBAC : CLIENT, HR, SALES, MANAGER, ADMIN |
| Isolation client | Périmètre strict par compte client       |
| Fichiers         | Blob privé, SAS courte durée             |
| Données          | TLS, chiffrement au repos (MySQL Azure)  |
| Audit            | Tables dédiées + logs applicatifs        |
| Secrets          | Key Vault — jamais dans Git              |

## 10. Décisions d’architecture (ADR)

| #       | Sujet            | Décision                        |
| ------- | ---------------- | ------------------------------- |
| ADR-001 | Auth             | Entra ID prod ; JWT local dev   |
| ADR-002 | Backend          | Hexagonal / ports & adapters    |
| ADR-003 | Topologie        | Modular monolith                |
| ADR-004 | API              | REST versionnée                 |
| ADR-005 | BDD              | MySQL + Flyway                  |
| ADR-006 | Fichiers         | Azure Blob                      |
| ADR-007 | IA CV / matching | OpenAI / Azure OpenAI           |
| ADR-008 | IA RFP           | Claude                          |
| ADR-009 | Recherche        | MySQL FULLTEXT ou Elasticsearch |
| ADR-010 | Déploiement      | Container Apps + Front Door     |

## 11. Synthèse architecture (une phrase)

Une **SPA Angular** sécurisée par **Entra** dialogue avec une **API Spring hexagonale** orchestrant **CRM + ATS + RFP + sourcing** sur **MySQL** et **Blob**, avec **IA traçable et validée par l’humain**, hébergée sur **Azure** et **RBAC** par persona.

---

# IV — Ressources et planning

## 1. Ressources matérielles

### Développement

| Élément  | Besoin                                      |
| -------- | ------------------------------------------- |
| Poste    | 16 Go RAM min. (32 Go recommandé), 4 cœurs+ |
| Stockage | 50 Go libres                                |
| Réseau   | Internet stable (IA, Azure, packages)       |
| Écrans   | 2 écrans recommandés                        |
| Local    | Docker MySQL — pas de serveur on-prem       |

### CI/CD

2 à 4 runners (build Maven + npm + tests).

### Production Azure (ESN interne, centaines d’utilisateurs)

| Composant                           | Sizing indicatif                |
| ----------------------------------- | ------------------------------- |
| API + UI                            | 2–4 vCPU, 4–8 Go RAM / instance |
| MySQL Flexible                      | 2 vCores, 64–128 Go             |
| Blob                                | 100 Go – 1 To                   |
| Redis (option)                      | ~1 Go                           |
| Front Door, Key Vault, App Insights | Selon politique groupe          |

| Budget          | Fourchette                                                             |
| --------------- | ---------------------------------------------------------------------- |
| Cloud (hors IA) | **800 € – 2 500 € / mois** prod · **200 € – 600 € / mois** staging/dev |
| IA (variable)   | **500 € – 5 000 € / mois** — quotas et modèles à cadrer                |

## 2. Ressources logicielles

**Open source (cœur)** : JDK 21, Maven, Node 20, Docker, Git, Spring Boot, Angular, Flyway, MySQL.

**Licences / cloud**

| Service                | Usage                               |
| ---------------------- | ----------------------------------- |
| Microsoft Entra ID     | SSO (souvent via M365)              |
| Azure                  | Hébergement, MySQL, Blob, Key Vault |
| OpenAI / Azure OpenAI  | CV, matching                        |
| Anthropic Claude       | RFP longs                           |
| GitHub ou Azure DevOps | Repo, CI/CD                         |
| Microsoft 365 / Teams  | Notifications                       |
| Figma, SonarQube       | UX, qualité code (recommandé)       |

## 3. Ressources humaines

### Équipe recommandée (produit complet)

| Rôle                         | Charge         |
| ---------------------------- | -------------- |
| Chef de projet / PO          | 30–50 %        |
| Architecte / lead technique  | 25–40 %        |
| Développeur backend Java     | 1–2 ETP        |
| Développeur frontend Angular | 1–2 ETP        |
| DevOps Azure                 | 30–50 %        |
| QA                           | 50–70 %        |
| UX/UI designer               | 20–30 %        |
| Experts métier RH & Sales    | 10–20 % chacun |
| Sécurité / DPO, IT Entra     | Ponctuel       |

**Total : ~5 à 7 ETP équivalent.**

### Équipe minimale

2 full-stack + 0,5 DevOps + 0,5 PO ≈ **3 ETP** → délai **+40 à 60 %**, dette technique plus élevée.

## 4. Scénarios de planning

### État actuel du dépôt

Déjà livré : fondations, auth (JWT + Entra), CRM de base, matching IA, upload CV, UI associée.  
**Reste** : candidatures/kanban, portail client, RFP, sourcing, rôles fins, admin complet, Azure prod, KPIs, notifications.

### Scénario A — MVP production (usage interne)

**3 à 4 mois** · équipe 5–6 personnes

| Phase                      | Durée    |
| -------------------------- | -------- |
| Fin CRM / pagination API   | 2–3 sem. |
| Candidatures + Blob CV     | 3–4 sem. |
| Durcissement IA + audit    | 2 sem.   |
| Azure + CI/CD + Entra prod | 3–4 sem. |
| Recette UAT                | 2–3 sem. |

### Scénario B — Produit complet (vision cible)

**8 à 11 mois** depuis aujourd’hui · équipe 5–7 ETP

Scénario A + RFP + sourcing + portail client + KPIs manager + admin + notifications + exports + RBAC fin + QA/UAT.

### Scénario C — Plateforme mature

**10 à 14 mois** — Scénario B + recherche avancée scale + conformité RGPD formalisée + hypercare 3 mois.

### From scratch (sans code existant)

**12 à 16 mois** · équipe 5–7 personnes.

---

# V — Jalons et facteurs de succès

## Jalons recommandés (scénario B)

| Jalon                     | Cible     | Critère de succès                                  |
| ------------------------- | --------- | -------------------------------------------------- |
| **J1 — Staging Azure**    | Mois 3–4  | RH crée une candidature sur opportunité en staging |
| **J2 — Go-live interne**  | Mois 4–5  | Sales + RH en prod (CRM + matching + pipeline)     |
| **J3 — Portail client**   | Mois 6–7  | Client valide une short-list en ligne              |
| **J4 — RFP**              | Mois 7–8  | Import AO + brouillon validé par manager           |
| **J5 — Pilotage complet** | Mois 9–11 | KPIs, sourcing, admin, notifications               |

## Facteurs qui accélèrent

- Équipe experte Java / Angular / Azure
- Sponsor métier Sales + RH disponible chaque semaine
- Entra et abonnement Azure déjà validés
- Design system posé tôt

## Facteurs qui ralentissent

- Validation sécurité / DPO lente
- Scope qui bouge en cours de route
- Pas de DevOps dédié
- Coûts IA non cadrés
- Intégrations externes non prévues (ERP, LinkedIn, ATS legacy)

## Synthèse ressources

| Dimension        | Ordre de grandeur                                   |
| ---------------- | --------------------------------------------------- |
| Matériel dev     | Postes 16–32 Go RAM                                 |
| Prod Azure       | ~1–3 k€/mois hors IA                                |
| Humain           | 5–7 ETP · MVP 3–4 mois · Complet 8–11 mois          |
| Risque technique | **Réduit** — socle et CRM/IA partiellement en place |

---

# VI — Décision attendue

## Proposition à la direction

| #   | Décision                                             | Effet                                            |
| --- | ---------------------------------------------------- | ------------------------------------------------ |
| 1   | **Valider le programme** ATS/CRM interne             | Alignement Sales + RH sur un outil unique        |
| 2   | **Budgéter le MVP** (3–4 mois, 5–6 ETP)              | Mise en production interne rapide, ROI mesurable |
| 3   | **Nommer un sponsor métier** (Sales + RH)            | Priorisation backlog et recette                  |
| 4   | **Valider Azure + Entra + enveloppe IA**             | Pas de blocage infra en fin de projet            |
| 5   | **Planifier la phase 2** (portail client, RFP, KPIs) | Vision complète sans tout financer d’un coup     |

## Bénéfices attendus

- **Gain de temps** sur proposition de profils et réponses aux AO
- **Traçabilité** client et conformité (audit, RGPD)
- **Image ESN** : outil moderne, IA maîtrisée et explicable
- **Actif durable** : code structuré, évolutif, propriété interne

## Prochaine étape immédiate

1. Validation de ce dossier en comité de direction.
2. Constitution de l’équipe projet et budget Azure/IA.
3. Lancement **Sprint 0** : finalisation MVP (candidatures + déploiement staging).

---

_Document généré pour le projet **ESN ATS/CRM** — dépôt `ats-crm`.  
Références techniques complémentaires : [`architecture_plan.md`](architecture_plan.md)._
