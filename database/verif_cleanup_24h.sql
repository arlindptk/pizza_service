-- Vérification du nettoyage 24 h (ne supprime rien, affiche seulement)
-- Exécuter dans phpMyAdmin (onglet SQL) ou : mysql -u root -p pizza_service_namur < database/verif_cleanup_24h.sql

USE pizza_service_namur;

-- 1) AVANT nettoyage : combien de commandes/lignes ont plus de 24 h ?
SELECT 'Commandes (facture_online) de plus de 24 h' AS verification,
       COUNT(*) AS nombre
FROM facture_online
WHERE TIMESTAMP(date, heure) < NOW() - INTERVAL 24 HOUR;

SELECT 'Lignes (facture_online_ligne) liées à des commandes > 24 h' AS verification,
       COUNT(*) AS nombre
FROM facture_online_ligne fol
INNER JOIN facture_online fo ON fo.id = fol.id_facture
WHERE TIMESTAMP(fo.date, fo.heure) < NOW() - INTERVAL 24 HOUR;

SELECT 'Lignes orphelines (facture déjà supprimée)' AS verification,
       COUNT(*) AS nombre
FROM facture_online_ligne fol
LEFT JOIN facture_online fo ON fo.id = fol.id_facture
WHERE fo.id IS NULL;

SELECT 'Commandes (facture_2015) de plus de 24 h' AS verification,
       COUNT(*) AS nombre
FROM facture_2015
WHERE TIMESTAMP(date_facture_2015, heure_facture_2015) < NOW() - INTERVAL 24 HOUR;

-- 2) APRÈS nettoyage : ces 4 requêtes doivent retourner 0
-- (Relancer ce fichier après avoir exécuté cleanup_orders_24h.sql pour vérifier.)
