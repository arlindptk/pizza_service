<?php
/**
 * API pour récupérer le menu
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

try {
    // Récupérer les catégories
    $categories = Database::query("SELECT * FROM cat WHERE actif = 1 ORDER BY ordre, id")->fetchAll();
    
    if (empty($categories)) {
        http_response_code(404);
        echo json_encode([
            'success' => false,
            'error' => 'Aucune catégorie trouvée',
            'message' => 'Veuillez d\'abord insérer des catégories dans la table cat'
        ], JSON_UNESCAPED_UNICODE);
        exit;
    }
    
    // Récupérer les produits par catégorie
    $menu = [];
    foreach ($categories as $category) {
        $products = Database::query(
            "SELECT * FROM carte WHERE cat_id = ? AND actif = 1 ORDER BY ordre, id",
            [$category['id']]
        )->fetchAll();
        
        $menu[$category['nom']] = array_map(function($product) {
            return [
                'id' => $product['id'],
                'name' => $product['nom'],
                'desc' => $product['description'] ?? '',
                'price' => (float)$product['prix']
            ];
        }, $products);
    }
    
    // Si aucune donnée dans carte, retourner quand même les catégories vides
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
