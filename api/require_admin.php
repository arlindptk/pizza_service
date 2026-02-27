<?php
/**
 * Vérifie que la requête est authentifiée en tant qu'admin (token Bearer).
 * À inclure en début des scripts API réservés à l'admin.
 * En cas d'échec : 401 JSON et exit.
 */

require_once __DIR__ . '/../config/db.php';

$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
if (!preg_match('/^\s*Bearer\s+([A-Za-z0-9]+)\s*$/', $authHeader, $m)) {
    http_response_code(401);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Authentification admin requise'], JSON_UNESCAPED_UNICODE);
    exit;
}
$token = $m[1];

try {
    $row = Database::query(
        "SELECT admin_login FROM admin_session WHERE token = ? AND expires_at > NOW()",
        [$token]
    )->fetch(PDO::FETCH_ASSOC);
    if (!$row) {
        http_response_code(401);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => false, 'error' => 'Session admin expirée ou invalide'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    // Nettoyer les sessions expirées (une fois sur X requêtes pour ne pas surcharger)
    if (random_int(1, 50) === 1) {
        Database::query("DELETE FROM admin_session WHERE expires_at <= NOW()");
    }
} catch (PDOException $e) {
    http_response_code(500);
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode(['success' => false, 'error' => 'Erreur serveur'], JSON_UNESCAPED_UNICODE);
    exit;
}
