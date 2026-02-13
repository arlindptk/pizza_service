-- ============================================
-- Base de données: pizza_service_namur
-- Version: 1.0
-- PHP: 8.4.0
-- ============================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- ============================================
-- Table: cat (Catégories)
-- ============================================
CREATE TABLE IF NOT EXISTS `cat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `ordre` int(11) DEFAULT 0,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_actif` (`actif`),
  KEY `idx_ordre` (`ordre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: carte (Produits/Menu)
-- ============================================
CREATE TABLE IF NOT EXISTS `carte` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cat_id` int(11) NOT NULL,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `prix` decimal(10,2) NOT NULL DEFAULT 0.00,
  `image` varchar(255) DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `ordre` int(11) DEFAULT 0,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cat_id` (`cat_id`),
  KEY `idx_actif` (`actif`),
  CONSTRAINT `fk_carte_cat` FOREIGN KEY (`cat_id`) REFERENCES `cat` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: client (Clients)
-- ============================================
CREATE TABLE IF NOT EXISTS `client` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `identifiant` varchar(100) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `prenom` varchar(100) NOT NULL,
  `numero` varchar(20) DEFAULT NULL,
  `rue` varchar(255) DEFAULT NULL,
  `code_postal` varchar(10) DEFAULT NULL,
  `localite` varchar(100) DEFAULT NULL,
  `adresse_email` varchar(255) DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `personne_contact` varchar(255) DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_identifiant` (`identifiant`),
  KEY `idx_email` (`adresse_email`),
  KEY `idx_code_postal` (`code_postal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: localite (Localités)
-- ============================================
CREATE TABLE IF NOT EXISTS `localite` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code_postal` varchar(10) NOT NULL,
  `nom` varchar(100) NOT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_code_postal` (`code_postal`),
  KEY `idx_nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: promo (Promotions)
-- ============================================
CREATE TABLE IF NOT EXISTS `promo` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `reduction` decimal(10,2) DEFAULT 0.00,
  `pourcentage` decimal(5,2) DEFAULT 0.00,
  `code` varchar(50) DEFAULT NULL,
  `date_debut` date DEFAULT NULL,
  `date_fin` date DEFAULT NULL,
  `actif` tinyint(1) DEFAULT 1,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_code` (`code`),
  KEY `idx_dates` (`date_debut`, `date_fin`),
  KEY `idx_actif` (`actif`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: facture (Factures)
-- ============================================
CREATE TABLE IF NOT EXISTS `facture` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `numero` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  `montant_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `montant_ht` decimal(10,2) DEFAULT 0.00,
  `tva` decimal(10,2) DEFAULT 0.00,
  `statut` enum('en_attente','payee','annulee') DEFAULT 'en_attente',
  `type` enum('sur_place','a_emporter','livraison') DEFAULT 'sur_place',
  `adresse_livraison` text DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_numero` (`numero`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_date` (`date`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `fk_facture_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: facture_online (Factures en ligne)
-- ============================================
CREATE TABLE IF NOT EXISTS `facture_online` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `client_id` int(11) DEFAULT NULL,
  `numero` varchar(50) NOT NULL,
  `date` datetime NOT NULL,
  `montant_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `montant_ht` decimal(10,2) DEFAULT 0.00,
  `tva` decimal(10,2) DEFAULT 0.00,
  `statut` enum('en_attente','payee','annulee','en_preparation','livree') DEFAULT 'en_attente',
  `type_livraison` enum('sur_place','a_emporter','livraison') DEFAULT 'livraison',
  `adresse_livraison` text DEFAULT NULL,
  `telephone` varchar(20) DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_numero` (`numero`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_date` (`date`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `fk_facture_online_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: facture_online_ligne (Lignes de facture en ligne)
-- ============================================
CREATE TABLE IF NOT EXISTS `facture_online_ligne` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_online_id` int(11) NOT NULL,
  `carte_id` int(11) DEFAULT NULL,
  `nom_produit` varchar(255) NOT NULL,
  `quantite` int(11) NOT NULL DEFAULT 1,
  `prix_unitaire` decimal(10,2) NOT NULL,
  `prix_total` decimal(10,2) NOT NULL,
  `remarque` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_facture_online_id` (`facture_online_id`),
  KEY `idx_carte_id` (`carte_id`),
  CONSTRAINT `fk_facture_online_ligne_facture` FOREIGN KEY (`facture_online_id`) REFERENCES `facture_online` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_facture_online_ligne_carte` FOREIGN KEY (`carte_id`) REFERENCES `carte` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: ligne_2015 (Lignes de facture 2015)
-- ============================================
CREATE TABLE IF NOT EXISTS `ligne_2015` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_id` int(11) DEFAULT NULL,
  `carte_id` int(11) DEFAULT NULL,
  `nom_produit` varchar(255) DEFAULT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) DEFAULT 0.00,
  `prix_total` decimal(10,2) DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_facture_id` (`facture_id`),
  KEY `idx_carte_id` (`carte_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: facture_2015 (Factures 2015)
-- ============================================
CREATE TABLE IF NOT EXISTS `facture_2015` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `montant_total` decimal(10,2) DEFAULT 0.00,
  `client_nom` varchar(255) DEFAULT NULL,
  `statut` varchar(50) DEFAULT NULL,
  `remarque` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_numero` (`numero`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: facture_del_2015 (Factures supprimées 2015)
-- ============================================
CREATE TABLE IF NOT EXISTS `facture_del_2015` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `montant_total` decimal(10,2) DEFAULT 0.00,
  `client_nom` varchar(255) DEFAULT NULL,
  `date_suppression` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remarque` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_numero` (`numero`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: ligne_del_2015 (Lignes de facture supprimées 2015)
-- ============================================
CREATE TABLE IF NOT EXISTS `ligne_del_2015` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `facture_id` int(11) DEFAULT NULL,
  `carte_id` int(11) DEFAULT NULL,
  `nom_produit` varchar(255) DEFAULT NULL,
  `quantite` int(11) DEFAULT 1,
  `prix_unitaire` decimal(10,2) DEFAULT 0.00,
  `prix_total` decimal(10,2) DEFAULT 0.00,
  `date` date DEFAULT NULL,
  `date_suppression` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `remarque` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_facture_id` (`facture_id`),
  KEY `idx_date` (`date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: compteur (Compteurs)
-- ============================================
CREATE TABLE IF NOT EXISTS `compteur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nom` varchar(100) NOT NULL,
  `valeur` int(11) DEFAULT 0,
  `description` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_nom` (`nom`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: infos (Informations générales)
-- ============================================
CREATE TABLE IF NOT EXISTS `infos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `cle` varchar(100) NOT NULL,
  `valeur` text DEFAULT NULL,
  `type` varchar(50) DEFAULT 'texte',
  `description` text DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_cle` (`cle`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: bon (Bons de commande)
-- ============================================
CREATE TABLE IF NOT EXISTS `bon` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `numero` varchar(50) NOT NULL,
  `client_id` int(11) DEFAULT NULL,
  `date` datetime NOT NULL,
  `montant_total` decimal(10,2) NOT NULL DEFAULT 0.00,
  `statut` enum('en_attente','valide','annule') DEFAULT 'en_attente',
  `type` enum('sur_place','a_emporter','livraison') DEFAULT 'sur_place',
  `remarque` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_numero` (`numero`),
  KEY `idx_client_id` (`client_id`),
  KEY `idx_date` (`date`),
  KEY `idx_statut` (`statut`),
  CONSTRAINT `fk_bon_client` FOREIGN KEY (`client_id`) REFERENCES `client` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Table: surfeur (Visiteurs/Sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS `surfeur` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `ip` varchar(45) DEFAULT NULL,
  `user_agent` text DEFAULT NULL,
  `page` varchar(255) DEFAULT NULL,
  `date_visite` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `duree` int(11) DEFAULT NULL COMMENT 'Durée en secondes',
  `referer` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_ip` (`ip`),
  KEY `idx_date_visite` (`date_visite`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Données initiales
-- ============================================

-- Insertion des catégories
INSERT INTO `cat` (`nom`, `description`, `ordre`, `actif`) VALUES
('Pizzas', 'Nos pizzas artisanales', 1, 1),
('Pâtes', 'Pâtes fraîches', 2, 1),
('Enfants', 'Menu enfants', 3, 1),
('Salade', 'Salades fraîches', 4, 1),
('Dessert', 'Desserts maison', 5, 1),
('Boisson', 'Boissons', 6, 1),
('Options', 'Options supplémentaires', 7, 1);

-- Insertion des localités de livraison
INSERT INTO `localite` (`code_postal`, `nom`, `actif`) VALUES
('5000', 'Namur', 1),
('5000', 'Beez', 1),
('5000', 'Salzinnes', 1),
('5001', 'Belgrade', 1),
('5002', 'Saint-Servais', 1),
('5003', 'Saint-Marc', 1),
('5004', 'Bouge', 1),
('5020', 'Champion', 1),
('5020', 'Daussoulx', 1),
('5020', 'Flawinne', 1),
('5020', 'Malonne', 1),
('5020', 'Suarlee', 1),
('5020', 'Temploux', 1),
('5020', 'Vedrin', 1),
('5021', 'Boninne', 1),
('5022', 'Cognelee', 1),
('5080', 'Emines', 1),
('5080', 'Rhisnes', 1),
('5080', 'Villers-les-Heest', 1),
('5080', 'Warisoulx', 1),
('5100', 'Dave', 1),
('5100', 'Jambes', 1),
('5100', 'Nannine', 1),
('5100', 'Wierde', 1),
('5100', 'Wepion', 1),
('5101', 'Erpent', 1),
('5150', 'Floriffoux', 1),
('5150', 'Franiere', 1),
('5310', 'Waret-La-Chaussee', 1),
('5380', 'Marchovelette', 1);

-- Insertion des informations générales
INSERT INTO `infos` (`cle`, `valeur`, `type`, `description`) VALUES
('nom_restaurant', 'Pizza Service Namur', 'texte', 'Nom du restaurant'),
('adresse', 'Chaussée de Louvain, 454', 'texte', 'Adresse du restaurant'),
('code_postal', '5004', 'texte', 'Code postal'),
('ville', 'Bouge', 'texte', 'Ville'),
('telephone', '081 739 330', 'texte', 'Numéro de téléphone'),
('email', 'contact@pizzaservicenamur.be', 'texte', 'Adresse email'),
('horaires_lundi', '17h30 - 22h', 'texte', 'Horaires du lundi'),
('horaires_mardi', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du mardi'),
('horaires_mercredi', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du mercredi'),
('horaires_jeudi', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du jeudi'),
('horaires_vendredi', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du vendredi'),
('horaires_samedi', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du samedi'),
('horaires_dimanche', '11h - 14h | 17h30 - 22h', 'texte', 'Horaires du dimanche');

-- Insertion des compteurs
INSERT INTO `compteur` (`nom`, `valeur`, `description`) VALUES
('facture_online', 0, 'Compteur pour les numéros de facture en ligne'),
('facture', 0, 'Compteur pour les numéros de facture'),
('bon', 0, 'Compteur pour les numéros de bon');

COMMIT;
