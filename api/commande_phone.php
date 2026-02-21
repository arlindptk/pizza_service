<?php
/**
 * API Commande téléphone - crée facture_online à partir du client
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['items']) || !is_array($data['items'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Articles requis'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $tel = preg_replace('/\D/', '', $data['tel'] ?? '');
    if (strlen($tel) < 10) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Téléphone client requis'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $tel = substr($tel, -10);

    $login = 'tel_' . $tel;
    $numero = $tel;
    $livraison = $data['livraison'] ?? '';
    $paiement = $data['paiement'] ?? 'cash';

    $db = Database::getInstance();
    $db->beginTransaction();

    $date = date('Y-m-d');
    $heure = date('H:i:s');

    Database::query(
        "INSERT INTO facture_online (date, heure, login, numero, expediee, livraison, paiement) VALUES (?, ?, ?, ?, 0, ?, ?)",
        [$date, $heure, $login, $numero, $livraison, $paiement]
    );
    $idFacture = (int)$db->lastInsertId();

    foreach ($data['items'] as $item) {
        $nom = $item['name'] ?? $item['nom'] ?? 'Article';
        $qte = max(1, (int)($item['qte'] ?? 1));
        $ttc = (float)($item['price'] ?? $item['ttc'] ?? 0);
        $tot = round($qte * $ttc, 2);
        $ref = $item['id'] ?? $item['ref'] ?? '';

        Database::query(
            "INSERT INTO facture_online_ligne (id_facture, ref, nom, qte, gratos, ttc, tot, total, tva) VALUES (?, ?, ?, ?, 0, ?, ?, ?, 6)",
            [$idFacture, $ref, $nom, $qte, $ttc, $tot, $tot]
        );
    }

    $db->commit();

    echo json_encode([
        'success' => true,
        'message' => 'Commande téléphone enregistrée',
        'id_facture' => $idFacture
    ], JSON_UNESCAPED_UNICODE);

} catch (Exception $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de l\'enregistrement',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
