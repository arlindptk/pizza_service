<?php
/**
 * API statut d'ouverture - inscription/connexion autorisées uniquement aux heures d'ouverture
 */

require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$hours = require __DIR__ . '/../config/hours.php';

echo json_encode([
    'success' => true,
    'open' => $hours['open'],
    'message' => $hours['open']
        ? null
        : 'Inscription et connexion disponibles uniquement pendant les heures d\'ouverture.',
], JSON_UNESCAPED_UNICODE);
