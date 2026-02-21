<?php
/**
 * Statut d'ouverture effectif : priorité au statut admin (actif) sur les horaires
 * Si la table infos existe, actif (admin) détermine ouvert/fermé
 * Sinon, on utilise les horaires de config/hours.php
 */
require_once __DIR__ . '/db.php';
$hours = require __DIR__ . '/hours.php';

try {
    $row = Database::query("SELECT actif FROM infos WHERE id = 1")->fetch();
    if ($row !== false) {
        $actif = (int)$row['actif'];
        // actif=2 = mode automatique (horaires), actif 0/1 = priorité admin
        if ($actif === 2) {
            return ['open' => $hours['open'], 'timezone' => $hours['timezone'] ?? 'Europe/Brussels'];
        }
        return ['open' => $actif === 1, 'timezone' => $hours['timezone'] ?? 'Europe/Brussels'];
    }
} catch (PDOException $e) {
    // Table infos absente → utiliser les horaires
}
return ['open' => $hours['open'], 'timezone' => $hours['timezone'] ?? 'Europe/Brussels'];
