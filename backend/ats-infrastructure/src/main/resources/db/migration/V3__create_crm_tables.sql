-- CRM / ATS — Candidats et clients (Phase 2)

CREATE TABLE candidates (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    first_name  VARCHAR(100) NOT NULL COMMENT 'prénom',
    last_name   VARCHAR(100) NOT NULL COMMENT 'nom',
    email       VARCHAR(255) NOT NULL,
    phone       VARCHAR(50),
    cv_path     VARCHAR(500) COMMENT 'chemin ou URL du CV',
    skills      JSON         COMMENT 'compétences (liste JSON pour matching IA futur)',
    status      VARCHAR(50)  NOT NULL DEFAULT 'NEW',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_candidates_email (email),
    INDEX idx_candidates_status (status),
    INDEX idx_candidates_last_name (last_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE clients (
    id               BIGINT       NOT NULL AUTO_INCREMENT,
    company_name     VARCHAR(255) NOT NULL COMMENT 'nom_entreprise',
    primary_contact  VARCHAR(255) NOT NULL COMMENT 'contact_principal',
    email            VARCHAR(255) NOT NULL,
    phone            VARCHAR(50),
    industry         VARCHAR(100) COMMENT 'secteur_activité',
    created_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_clients_email (email),
    INDEX idx_clients_company_name (company_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Données de démo pour validation
INSERT INTO candidates (first_name, last_name, email, phone, cv_path, skills, status) VALUES
    ('Marie', 'Lefebvre', 'marie.lefebvre@email.com', '+33601020304', '/storage/cv/marie-lefebvre.pdf',
     '["Java", "Spring Boot", "Angular", "Kubernetes"]', 'AVAILABLE'),
    ('Thomas', 'Petit', 'thomas.petit@email.com', '+33605060708', NULL,
     '["Python", "Data Engineering", "Spark", "AWS"]', 'IN_PROCESS'),
    ('Nadia', 'Benali', 'nadia.benali@email.com', '+33609101112', '/storage/cv/nadia-benali.pdf',
     '["DevOps", "Terraform", "Azure", "CI/CD"]', 'NEW');

INSERT INTO clients (company_name, primary_contact, email, phone, industry) VALUES
    ('TechVision SA', 'Jean Dupont', 'contact@techvision.fr', '+33142345678', 'Finance'),
    ('InnoSoft Group', 'Claire Moreau', 'c.moreau@innosoft.com', '+33198765432', 'Industrie'),
    ('Digital Wave', 'Marc Leroy', 'marc.leroy@digitalwave.io', '+33255667788', 'Retail');
