<?php
/**
 * API pour récupérer le menu
 * Adapté au schéma : cat (id, cat, nom), carte (num, cat, souscat, nom, descr, ttc, tva, visible, stock)
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

try {
    // Récupérer les catégories (table cat : id, cat, nom)
    $categories = Database::query("SELECT id, cat, nom FROM cat ORDER BY id")->fetchAll();
    
    if (empty($categories)) {
        echo json_encode([
            'success' => true,
            'data' => [],
            'debug' => ['message' => 'Aucune catégorie dans la base, exécutez http://localhost:8000/api/seed.php']
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // Récupérer les produits par catégorie (carte.cat = cat.cat)
    $menu = [];
    foreach ($categories as $category) {
        $products = Database::query(
            "SELECT num, nom, descr, ttc FROM carte WHERE cat = ? AND visible = 1 AND stock = 1 ORDER BY num",
            [$category['cat']]
        )->fetchAll();
        
        $menu[$category['nom']] = array_map(function($product) {
            return [
                'id' => (int)$product['num'],
                'name' => $product['nom'],
                'desc' => $product['descr'] ?? '',
                'price' => (float)$product['ttc']
            ];
        }, $products);
    }
    
    echo json_encode([
        'success' => true,
        'data' => $menu,
        'debug' => [
            'categories_count' => count($categories),
            'categories' => array_column($categories, 'nom')
        ]
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur de base de données',
        'message' => $e->getMessage(),
        'code' => $e->getCode()
    ], JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de la récupération du menu',
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine()
    ], JSON_UNESCAPED_UNICODE);
}
