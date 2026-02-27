-- Sessions pour sécurisation API (admin + utilisateur)
-- Exécuter après admin_tables.sql : mysql -u root -p pizza_service_namur < database/migration_sessions.sql

USE pizza_service_namur;

CREATE TABLE IF NOT EXISTS admin_session (
    token VARCHAR(64) PRIMARY KEY,
    admin_login VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    INDEX idx_expires (expires_at)
);

CREATE TABLE IF NOT EXISTS user_session (
    token VARCHAR(64) PRIMARY KEY,
    login VARCHAR(100) NOT NULL,
    expires_at DATETIME NOT NULL,
    INDEX idx_expires (expires_at)
);
