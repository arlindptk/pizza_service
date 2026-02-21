-- Table client pour les commandes téléphone
-- Exécuter si la table n'existe pas déjà

USE pizza_service_namur;

CREATE TABLE IF NOT EXISTS client (
    num INT AUTO_INCREMENT PRIMARY KEY,
    tel1 VARCHAR(20) NOT NULL DEFAULT '',
    nom VARCHAR(100) DEFAULT '',
    prenom VARCHAR(100) DEFAULT '',
    ad1 VARCHAR(255) DEFAULT '',
    ad2 VARCHAR(255) DEFAULT '',
    cp VARCHAR(10) DEFAULT '',
    ville VARCHAR(100) DEFAULT '',
    fidel INT DEFAULT 0,
    comm TEXT DEFAULT NULL,
    email VARCHAR(255) DEFAULT ''
);

CREATE INDEX IF NOT EXISTS idx_client_tel1 ON client(tel1);
