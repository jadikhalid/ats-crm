-- Initialisation MySQL locale (complémentaire à Flyway côté application)
CREATE DATABASE IF NOT EXISTS esn_ats
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON esn_ats.* TO 'ats_user'@'%';
FLUSH PRIVILEGES;
