<?php
/**
 * API Statut pizzeria (ouvert/fermé)
 * Table : infos (id=1, actif: 0=fermé, 1=ouvert)
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

try {
    switch ($method) {
        case 'GET':
            try {
                $row = Database::query("SELECT actif FROM infos WHERE id = 1")->fetch();
                $actif = $row ? (int)$row['actif'] : 2;
                if ($actif > 2 || $actif < 0) $actif = 2;
            } catch (PDOException $e) {
                $actif = 2;
            }
            $hours = require __DIR__ . '/../config/hours.php';
            $ouvert = ($actif === 2) ? $hours['open'] : ($actif === 1);
            echo json_encode([
                'success' => true,
                'actif' => $actif,
                'ouvert' => $ouvert,
                'mode' => $actif === 2 ? 'auto' : 'manual'
            ], JSON_UNESCAPED_UNICODE);
            break;

        case 'POST':
            $data = json_decode(file_get_contents('php://input'), true);
            $actif = isset($data['actif']) ? (int)$data['actif'] : null;
            if ($actif === null && isset($data['toggle'])) {
                $row = Database::query("SELECT actif FROM infos WHERE id = 1")->fetch();
                $actif = $row && (int)$row['actif'] === 1 ? 0 : 1;
            }
            if ($actif !== 0 && $actif !== 1 && $actif !== 2) {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Valeur invalide (0, 1 ou 2)'], JSON_UNESCAPED_UNICODE);
                exit;
            }
            Database::query("INSERT INTO infos (id, actif) VALUES (1, ?) ON DUPLICATE KEY UPDATE actif = ?", [$actif, $actif]);
            echo json_encode([
                'success' => true,
                'actif' => $actif,
                'ouvert' => $actif === 1,
                'message' => $actif === 2 ? 'Mode automatique (horaires)' : ($actif ? 'Pizzeria ouverte' : 'Pizzeria fermée')
            ], JSON_UNESCAPED_UNICODE);
            break;

        default:
            http_response_code(405);
            echo json_encode(['success' => false, 'error' => 'Méthode non autorisée'], JSON_UNESCAPED_UNICODE);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur base de données',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
