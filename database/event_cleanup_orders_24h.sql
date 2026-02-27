-- Événement MySQL : supprime automatiquement les commandes de plus de 24 h (toutes les heures)
-- Prérequis : SET GLOBAL event_scheduler = ON; (une fois sur le serveur MySQL)
-- Exécuter : mysql -u root -p pizza_service_namur < database/event_cleanup_orders_24h.sql

USE pizza_service_namur;

DROP EVENT IF EXISTS cleanup_orders_24h;

DELIMITER $$
CREATE EVENT cleanup_orders_24h
ON SCHEDULE EVERY 1 HOUR
DO
BEGIN
  DELETE fol FROM facture_online_ligne fol
  LEFT JOIN facture_online fo ON fo.id = fol.id_facture
  WHERE fo.id IS NULL;
  DELETE fol FROM facture_online_ligne fol
  INNER JOIN facture_online fo ON fo.id = fol.id_facture
  WHERE TIMESTAMP(fo.date, fo.heure) < NOW() - INTERVAL 24 HOUR;
  DELETE FROM facture_online
  WHERE TIMESTAMP(date, heure) < NOW() - INTERVAL 24 HOUR;
  DELETE FROM facture_2015
  WHERE TIMESTAMP(date_facture_2015, heure_facture_2015) < NOW() - INTERVAL 24 HOUR;
END$$
DELIMITER ;
