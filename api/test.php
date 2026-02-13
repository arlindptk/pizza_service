<?php
/**
 * API de test de connexion à la base de données
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

try {
    // Test de connexion
    Database::query("SELECT 1");
    
    // Lister les tables
    $tables = Database::query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    
    echo json_encode([
        'success' => true,
        'message' => 'Connexion à la base de données réussie',
        'database' => 'pizza_service_namur',
        'tables' => $tables,
        'php_version' => PHP_VERSION
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion à la base de données',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
