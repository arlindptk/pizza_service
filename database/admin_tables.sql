-- Tables pour la page admin et les commandes en ligne
-- Exécuter uniquement si les tables n'existent pas déjà

USE pizza_service_namur;

-- Table infos : statut ouverture (actif = 1 ouvert, 0 fermé, 2 = automatique horaires)
CREATE TABLE IF NOT EXISTS infos (
    id INT PRIMARY KEY DEFAULT 1,
    actif TINYINT NOT NULL DEFAULT 2,
    CONSTRAINT chk_actif CHECK (actif IN (0, 1, 2))
);
INSERT IGNORE INTO infos (id, actif) VALUES (1, 2);

-- Table facture_online : commandes passées en ligne
-- expediee: 0 = en attente, 1 = acceptée, 2 = refusée
CREATE TABLE IF NOT EXISTS facture_online (
    id INT AUTO_INCREMENT PRIMARY KEY,
    date DATE NOT NULL,
    heure TIME NOT NULL,
    login VARCHAR(100) NOT NULL,
    numero VARCHAR(20) DEFAULT NULL,
    expediee TINYINT NOT NULL DEFAULT 0,
    livraison VARCHAR(20) DEFAULT NULL,
    paiement VARCHAR(50) DEFAULT 'cash',
    remarque TEXT DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table facture_online_ligne : lignes de commande
CREATE TABLE IF NOT EXISTS facture_online_ligne (
    id INT AUTO_INCREMENT PRIMARY KEY,
    id_facture INT NOT NULL,
    ref VARCHAR(50) DEFAULT NULL,
    nom VARCHAR(255) NOT NULL,
    qte INT NOT NULL DEFAULT 1,
    gratos INT DEFAULT 0,
    ttc DECIMAL(10,2) NOT NULL DEFAULT 0,
    tot DECIMAL(10,2) NOT NULL DEFAULT 0,
    total DECIMAL(10,2) DEFAULT NULL,
    tva DECIMAL(5,2) DEFAULT NULL,
    FOREIGN KEY (id_facture) REFERENCES facture_online(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_facture_expediee ON facture_online(expediee);
CREATE INDEX IF NOT EXISTS idx_facture_login ON facture_online(login);
CREATE INDEX IF NOT EXISTS idx_ligne_facture ON facture_online_ligne(id_facture);
