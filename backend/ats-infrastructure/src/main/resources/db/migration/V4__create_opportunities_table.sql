-- Opportunités (besoins clients / AO) — préparation matching IA

CREATE TABLE opportunities (
    id               BIGINT           NOT NULL AUTO_INCREMENT,
    title            VARCHAR(255)     NOT NULL COMMENT 'titre',
    description      TEXT             NOT NULL COMMENT 'description / fiche de poste',
    profile_sought   TEXT             NOT NULL COMMENT 'profil_recherché',
    status           VARCHAR(20)      NOT NULL COMMENT 'OPEN, WON, LOST',
    budget           DECIMAL(14, 2)   COMMENT 'budget projet / TJM indicative',
    client_id        BIGINT           NOT NULL,
    created_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    CONSTRAINT fk_opportunities_client FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE RESTRICT,
    INDEX idx_opportunities_client_id (client_id),
    INDEX idx_opportunities_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de démo (clients id 1, 2, 3 issus des inserts V3)
INSERT INTO opportunities (title, description, profile_sought, status, budget, client_id)
SELECT
    'Développeur Fullstack Java',
    'Conception et développement d''applications métiers (Java/Spring). Fiche type : développement API REST, Front Angular intégré, environnement agile.',
    'Java 17+, Spring Boot 3, Angular 17+, SQL, tests JUnit, expérience ESN 3+ ans.',
    'OPEN',
    650.00,
    id
FROM clients
WHERE company_name = 'TechVision SA'
LIMIT 1;

INSERT INTO opportunities (title, description, profile_sought, status, budget, client_id)
SELECT
    'Product Owner Mobile',
    'Pilotage backlog produit app mobile retail. Rédaction user stories, priorisation sprint, liaison avec équipes métier.',
    'PO certifié ou équivalent, expérience produit mobile (iOS/Android), retail un plus.',
    'OPEN',
    580.00,
    id
FROM clients
WHERE company_name = 'InnoSoft Group'
LIMIT 1;

INSERT INTO opportunities (title, description, profile_sought, status, budget, client_id)
SELECT
    'DevOps Azure',
    'Industrialisation pipelines CI/CD, infrastructure as code Azure, monitoring et Fiabilité.',
    'Azure DevOps / GitHub Actions, Terraform/Bicep, AKS ou App Service, culture DevSecOps.',
    'OPEN',
    720.00,
    id
FROM clients
WHERE company_name = 'Digital Wave'
LIMIT 1;
