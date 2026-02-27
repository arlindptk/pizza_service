-- Suppression des commandes (facture_online, facture_2015) et de leurs lignes de plus de 24 h
-- Exécution manuelle : mysql -u root -p pizza_service_namur < database/cleanup_orders_24h.sql

USE pizza_service_namur;

-- facture_online : lignes orphelines
DELETE fol FROM facture_online_ligne fol
LEFT JOIN facture_online fo ON fo.id = fol.id_facture
WHERE fo.id IS NULL;

-- facture_online : lignes puis commandes de plus de 24 h
DELETE fol FROM facture_online_ligne fol
INNER JOIN facture_online fo ON fo.id = fol.id_facture
WHERE TIMESTAMP(fo.date, fo.heure) < NOW() - INTERVAL 24 HOUR;
DELETE FROM facture_online
WHERE TIMESTAMP(date, heure) < NOW() - INTERVAL 24 HOUR;

-- facture_2015 : commandes de plus de 24 h
DELETE FROM facture_2015
WHERE TIMESTAMP(date_facture_2015, heure_facture_2015) < NOW() - INTERVAL 24 HOUR;
