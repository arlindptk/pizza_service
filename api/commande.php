<?php
/**
 * API Enregistrement d'une commande en ligne
 * Crée facture_online + facture_online_ligne à partir du panier
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];

if ($method !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Méthode non autorisée'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['login']) || empty($data['items']) || !is_array($data['items'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Login et articles requis'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $login = $data['login'];
    $items = $data['items'];
    $livraison = $data['livraison'] ?? '';
    $paiement = $data['paiement'] ?? 'cash';
    $remarque = $data['remarque'] ?? '';

    // Récupérer le client (surfeur)
    $surf = Database::query("SELECT id, nom, prenom, adresse, numero, mail FROM surfeur WHERE login = ?", [$login])->fetch();
    if (!$surf) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Utilisateur non trouvé'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $db = Database::getInstance();
    $db->beginTransaction();

    $date = date('Y-m-d');
    $heure = date('H:i:s');

    Database::query(
        "INSERT INTO facture_online (date, heure, login, numero, expediee, livraison, paiement) VALUES (?, ?, ?, ?, 0, ?, ?)",
        [$date, $heure, $login, $surf['numero'] ?? '', $livraison, $paiement]
    );
    $idFacture = (int)$db->lastInsertId();

    foreach ($items as $item) {
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
        'message' => 'Commande enregistrée',
        'id_facture' => $idFacture
    ], JSON_UNESCAPED_UNICODE);

} catch (PDOException $e) {
    if (isset($db) && $db->inTransaction()) {
        $db->rollBack();
    }
    http_response_code(500);
    $msg = $e->getMessage();
    if (strpos($msg, "doesn't exist") !== false) {
        $msg .= ' — Exécutez database/admin_tables.sql pour créer les tables.';
    }
    echo json_encode([
        'success' => false,
        'error' => 'Erreur lors de l\'enregistrement',
        'message' => $msg
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
