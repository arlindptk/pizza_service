<?php
/**
 * API statut d'ouverture - inscription/connexion autorisées uniquement aux heures d'ouverture
 */

require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$status = require __DIR__ . '/../config/open_status.php';

echo json_encode([
    'success' => true,
    'open' => $status['open'],
    'message' => $status['open']
        ? null
        : 'Inscription et connexion disponibles uniquement pendant les heures d\'ouverture.',
], JSON_UNESCAPED_UNICODE);
