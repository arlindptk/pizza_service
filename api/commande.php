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
    require_once __DIR__ . '/require_user_token.php';
    $login = get_login_from_user_token();
    if ($login === null) {
        http_response_code(401);
        echo json_encode(['success' => false, 'error' => 'Authentification requise. Connectez-vous pour commander.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    $data = json_decode(file_get_contents('php://input'), true);
    if (empty($data['items']) || !is_array($data['items'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Articles requis'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $items = $data['items'];
    if (count($items) > 100) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Trop d\'articles'], JSON_UNESCAPED_UNICODE);
        exit;
    }
    $livraison = mb_substr(trim($data['livraison'] ?? ''), 0, 20);
    $paiement = in_array($data['paiement'] ?? '', ['cash', 'bancontact', 'visa'], true) ? $data['paiement'] : 'cash';
    $supplement = isset($data['supplement']) ? (float) $data['supplement'] : 0;

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
        $nom = mb_substr(trim($item['name'] ?? $item['nom'] ?? 'Article'), 0, 255);
        $qte = max(1, min(99, (int)($item['qte'] ?? 1)));
        $ttc = (float)($item['price'] ?? $item['ttc'] ?? 0);
        if ($ttc < 0) $ttc = 0;
        $tot = round($qte * $ttc, 2);
        $ref = mb_substr(trim($item['id'] ?? $item['ref'] ?? ''), 0, 50);

        Database::query(
            "INSERT INTO facture_online_ligne (id_facture, ref, nom, qte, gratos, ttc, tot, total, tva) VALUES (?, ?, ?, ?, 0, ?, ?, ?, 6)",
            [$idFacture, $ref, $nom, $qte, $ttc, $tot, $tot]
        );
    }

    if ($supplement > 0) {
        Database::query(
            "INSERT INTO facture_online_ligne (id_facture, ref, nom, qte, gratos, ttc, tot, total, tva) VALUES (?, '', ?, 1, 0, ?, ?, ?, 6)",
            [$idFacture, 'Supplément paiement carte', $supplement, $supplement]
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
