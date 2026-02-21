-- Autoriser actif=2 (mode automatique / horaires) dans la table infos
-- Exécuter si la table infos existe déjà avec actif IN (0, 1)
-- MySQL 8.0+ : DROP CHECK / DROP CONSTRAINT

USE pizza_service_namur;

-- Supprimer l'ancienne contrainte (si erreur, ignorer)
ALTER TABLE infos DROP CHECK chk_actif;
-- Ou : ALTER TABLE infos DROP CONSTRAINT chk_actif;

ALTER TABLE infos ADD CONSTRAINT chk_actif CHECK (actif IN (0, 1, 2));
UPDATE infos SET actif = 2 WHERE id = 1;
