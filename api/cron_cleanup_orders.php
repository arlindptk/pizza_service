<?php
/**
 * Nettoyage des commandes de plus de 24 h
 * À exécuter par une tâche planifiée (cron / Planificateur de tâches Windows)
 * Usage CLI : php api/cron_cleanup_orders.php
 * Ne pas appeler depuis le web (script désactivé en mode HTTP)
 */

if (php_sapi_name() !== 'cli') {
    http_response_code(403);
    exit('Ce script doit être exécuté en ligne de commande (cron / tâche planifiée).');
}

require_once __DIR__ . '/../config/db.php';

try {
    $stmt = Database::query(
        'DELETE fol FROM facture_online_ligne fol LEFT JOIN facture_online fo ON fo.id = fol.id_facture WHERE fo.id IS NULL'
    );
    $deletedOrphelines = $stmt->rowCount();
    $stmt = Database::query(
        'DELETE fol FROM facture_online_ligne fol INNER JOIN facture_online fo ON fo.id = fol.id_facture WHERE TIMESTAMP(fo.date, fo.heure) < NOW() - INTERVAL 24 HOUR'
    );
    $deletedLignes = $stmt->rowCount();
    $stmt = Database::query('DELETE FROM facture_online WHERE TIMESTAMP(date, heure) < NOW() - INTERVAL 24 HOUR');
    $deletedFactures = $stmt->rowCount();
    $stmt = Database::query('DELETE FROM facture_2015 WHERE TIMESTAMP(date_facture_2015, heure_facture_2015) < NOW() - INTERVAL 24 HOUR');
    $deleted2015 = $stmt->rowCount();
} catch (Throwable $e) {
    fwrite(STDERR, 'Erreur: ' . $e->getMessage() . PHP_EOL);
    exit(1);
}

echo date('Y-m-d H:i:s') . " - Orphelines : $deletedOrphelines, lignes : $deletedLignes, facture_online : $deletedFactures, facture_2015 : $deleted2015 (âge > 24 h)" . PHP_EOL;
exit(0);
