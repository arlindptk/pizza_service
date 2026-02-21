<?php
/**
 * Remplit la base de données avec les catégories et la carte
 * Appeler une fois : http://localhost:8000/api/seed.php
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $db = Database::getInstance();
    
    // 1. Localités (zones de livraison Namur) - nécessaires pour l'inscription
    $localites = [
        [5000, 'Beez'], [5000, 'Namur'], [5000, 'Salzinnes'],
        [5001, 'Belgrade'], [5002, 'Saint-Servais'], [5003, 'Saint-Marc'], [5004, 'Bouge'],
        [5020, 'Champion'], [5020, 'Daussoulx'], [5020, 'Flawinne'], [5020, 'Malonne'],
        [5020, 'Suarlee'], [5020, 'Temploux'], [5020, 'Vedrin'],
        [5021, 'Boninne'], [5022, 'Cognelee'],
        [5080, 'Emines'], [5080, 'Rhisnes'], [5080, 'Villers-les-Heest'], [5080, 'Warisoulx'],
        [5100, 'Dave'], [5100, 'Jambes'], [5100, 'Nannine'], [5100, 'Wierde'], [5100, 'Wepion'],
        [5101, 'Erpent'], [5150, 'Floriffoux'], [5150, 'Franiere'],
        [5310, 'Waret-La-Chaussee'], [5380, 'Marchovelette'],
    ];
    
    $locCount = $db->query("SELECT COUNT(*) FROM localite")->fetchColumn();
    if ($locCount == 0) {
        $stmtLoc = $db->prepare("INSERT INTO localite (cp_localite, nom_localite) VALUES (?, ?)");
        foreach ($localites as $loc) {
            $stmtLoc->execute($loc);
        }
    }
    
    // 2. Catégories
    $categories = [
        ['PIZ', 'Pizzas'],
        ['PAT', 'Pâtes'],
        ['ENF', 'Enfants'],
        ['SAL', 'Salade'],
        ['DES', 'Dessert'],
        ['BOI', 'Boissons'],
        ['OPT', 'Suppléments'],
    ];
    
    $catCount = $db->query("SELECT COUNT(*) FROM cat")->fetchColumn();
    if ($catCount == 0) {
        $stmtCat = $db->prepare("INSERT INTO cat (cat, nom) VALUES (?, ?)");
        foreach ($categories as $c) {
            $stmtCat->execute($c);
        }
    }
    
    // 3. Vérifier si la carte a déjà des données
    $count = $db->query("SELECT COUNT(*) FROM carte")->fetchColumn();
    $locTotal = $db->query("SELECT COUNT(*) FROM localite")->fetchColumn();
    if ($count > 0) {
        echo json_encode([
            'success' => true,
            'message' => 'Base OK. Carte: ' . $count . ' articles. Localités: ' . $locTotal . ' (zones de livraison).',
            'localités' => (int)$locTotal,
            'categories' => count($categories)
        ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }
    
    // 4. Carte - exécuter le fichier SQL
    $sqlFile = __DIR__ . '/../database/carte_complete.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception('Fichier database/carte_complete.sql introuvable');
    }
    
    $sql = file_get_contents($sqlFile);
    $sql = preg_replace('/USE\s+\w+;?/i', '', $sql);
    $sql = preg_replace('/--[^\n]*/m', '', $sql);
    $statements = array_filter(array_map('trim', explode(';', $sql)));
    
    $inserted = 0;
    foreach ($statements as $stmt) {
        if (stripos($stmt, 'INSERT INTO') === 0) {
            $db->exec($stmt);
            $inserted++;
        }
    }
    
    echo json_encode([
        'success' => true,
        'message' => 'Base de données remplie avec succès.',
        'localités' => $locCount > 0 ? $locCount : count($localites),
        'categories' => count($categories),
        'articles_insérés' => $inserted
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
        'trace' => $e->getTraceAsString()
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
}