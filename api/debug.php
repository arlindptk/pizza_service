<?php
/**
 * API de débogage pour vérifier la configuration
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$debug = [
    'php_version' => PHP_VERSION,
    'pdo_available' => extension_loaded('pdo'),
    'pdo_mysql_available' => extension_loaded('pdo_mysql'),
    'config_file_exists' => file_exists(__DIR__ . '/../config/database.php'),
    'db_class_exists' => class_exists('Database'),
];

try {
    $config = require __DIR__ . '/../config/database.php';
    $debug['config'] = [
        'host' => $config['host'],
        'port' => $config['port'],
        'database' => $config['database'],
        'username' => $config['username'],
        'password_set' => !empty($config['password']),
    ];
    
    Database::getInstance(); // Test de connexion
    $debug['connection'] = 'success';
    
    // Test des tables
    $tables = Database::query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
    $debug['tables'] = $tables;
    $debug['tables_count'] = count($tables);
    
    // Test cat
    if (in_array('cat', $tables)) {
        $catCount = Database::query("SELECT COUNT(*) as count FROM cat")->fetch()['count'];
        $debug['cat_count'] = $catCount;
        
        if ($catCount > 0) {
            $cats = Database::query("SELECT id, nom FROM cat LIMIT 5")->fetchAll();
            $debug['cat_samples'] = $cats;
        }
    }
    
    // Test carte
    if (in_array('carte', $tables)) {
        $carteCount = Database::query("SELECT COUNT(*) as count FROM carte")->fetch()['count'];
        $debug['carte_count'] = $carteCount;
        
        if ($carteCount > 0) {
            $cartes = Database::query("SELECT id, nom, cat_id, prix FROM carte LIMIT 5")->fetchAll();
            $debug['carte_samples'] = $cartes;
        }
    }
    
    echo json_encode([
        'success' => true,
        'debug' => $debug
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    $debug['connection'] = 'failed';
    $debug['pdo_error'] = [
        'message' => $e->getMessage(),
        'code' => $e->getCode(),
    ];
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de connexion',
        'debug' => $debug
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    $debug['error'] = [
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
    ];
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur générale',
        'debug' => $debug
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}
