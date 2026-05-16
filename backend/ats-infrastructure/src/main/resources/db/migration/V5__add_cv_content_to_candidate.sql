-- Texte brut extrait des CV (PDF / texte) via Tika ; résumé synthétique issu du parsing IA
ALTER TABLE candidates
    ADD COLUMN cv_content LONGTEXT NULL COMMENT 'texte brut extrait du CV'
        AFTER cv_path,
    ADD COLUMN profile_summary TEXT NULL COMMENT 'résumé profil (IA)'
        AFTER cv_content;
