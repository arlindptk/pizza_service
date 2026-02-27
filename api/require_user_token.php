<?php
/**
 * Récupère le login utilisateur depuis le token Bearer (user_session).
 * À utiliser dans commande.php pour lier la commande à l'utilisateur connecté.
 */

require_once __DIR__ . '/../config/db.php';

function get_login_from_user_token() {
    $authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/^\s*Bearer\s+([A-Za-z0-9]+)\s*$/', $authHeader, $m)) {
        return null;
    }
    $token = $m[1];
    try {
        $row = Database::query(
            "SELECT login FROM user_session WHERE token = ? AND expires_at > NOW()",
            [$token]
        )->fetch(PDO::FETCH_ASSOC);
        if ($row) {
            if (random_int(1, 100) === 1) {
                Database::query("DELETE FROM user_session WHERE expires_at <= NOW()");
            }
            return $row['login'];
        }
    } catch (PDOException $e) {}
    return null;
}
