<?php
/**
 * API Admin - Commandes en attente, accepter, refuser
 * Tables : facture_online, surfeur, facture_online_ligne
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'orders') {
                // Commandes en attente : expediee=0, login non vide
                $stmt = Database::query(
                    "SELECT fo.id, fo.date, fo.heure, fo.login, fo.numero, fo.livraison, fo.paiement,
                            s.nom, s.prenom, s.adresse, s.rem, s.cp, s.localite, s.mail, s.numero as surf_numero
                     FROM facture_online fo
                     LEFT JOIN surfeur s ON s.login = fo.login AND fo.login NOT LIKE 'tel_%'
                     WHERE fo.expediee = 0 AND fo.login != ''
                     ORDER BY fo.date DESC, fo.heure DESC"
                );
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($orders as &$o) {
                    $tel = !empty($o['numero']) ? $o['numero'] : ($o['surf_numero'] ?? '');
                    $o['telephone'] = preg_replace('/\D/', '', $tel);
                    if (strpos($o['login'] ?? '', 'tel_') === 0 && (empty($o['nom']) && empty($o['prenom']))) {
                        $o['nom'] = 'Client tél.';
                        $o['prenom'] = '';
                    }
                    unset($o['surf_numero']);

                    // Lignes de la commande
                    $lignes = Database::query(
                        "SELECT ref, nom, qte, gratos, ttc, tot, total, tva FROM facture_online_ligne WHERE id_facture = ?",
                        [$o['id']]
                    )->fetchAll(PDO::FETCH_ASSOC);
                    $o['lignes'] = $lignes;

                    // Total
                    $o['total_commande'] = array_sum(array_column($lignes, 'tot'));
                }

                echo json_encode([
                    'success' => true,
                    'data' => $orders,
                    'count' => count($orders)
                ], JSON_UNESCAPED_UNICODE);
            } elseif ($action === 'ventes') {
                $date = $_GET['date'] ?? date('Y-m-d');
                $stmt = Database::query(
                    "SELECT fo.id, fo.date, fo.heure, fo.login, fo.numero, fo.livraison, fo.paiement,
                            s.nom, s.prenom, s.adresse, s.rem, s.cp, s.localite, s.mail, s.numero as surf_numero
                     FROM facture_online fo
                     LEFT JOIN surfeur s ON s.login = fo.login AND fo.login NOT LIKE 'tel_%'
                     WHERE fo.expediee = 1 AND fo.date = ? AND fo.login != ''
                     ORDER BY fo.heure ASC",
                    [$date]
                );
                $orders = $stmt->fetchAll(PDO::FETCH_ASSOC);

                foreach ($orders as &$o) {
                    $tel = !empty($o['numero']) ? $o['numero'] : ($o['surf_numero'] ?? '');
                    $o['telephone'] = preg_replace('/\D/', '', $tel);
                    if (strpos($o['login'] ?? '', 'tel_') === 0 && (empty($o['nom']) && empty($o['prenom']))) {
                        $telDigits = substr($o['login'], 4);
                        try {
                            $clients = Database::query("SELECT num, tel1, nom, prenom, ad1, ad2, cp, ville FROM client")->fetchAll(PDO::FETCH_ASSOC);
                            foreach ($clients as $c) {
                                $cTel = preg_replace('/\D/', '', $c['tel1'] ?? '');
                                if ($cTel === $telDigits || substr($cTel, -strlen($telDigits)) === $telDigits) {
                                    $o['nom'] = $c['nom'] ?? 'Client tél.';
                                    $o['prenom'] = $c['prenom'] ?? '';
                                    $o['adresse'] = trim(($c['ad1'] ?? '') . ' ' . ($c['ad2'] ?? ''));
                                    $o['cp'] = $c['cp'] ?? '';
                                    $o['localite'] = $c['ville'] ?? '';
                                    break;
                                }
                            }
                        } catch (PDOException $e) {}
                        if (empty($o['nom'])) $o['nom'] = 'Client tél.';
                        if (empty($o['prenom'])) $o['prenom'] = '';
                    }
                    unset($o['surf_numero']);

                    $lignes = Database::query(
                        "SELECT ref, nom, qte, gratos, ttc, tot, total, tva FROM facture_online_ligne WHERE id_facture = ?",
                        [$o['id']]
                    )->fetchAll(PDO::FETCH_ASSOC);
                    $o['lignes'] = $lignes;
                    $o['total_commande'] = array_sum(array_column($lignes, 'tot'));
                }

                echo json_encode([
                    'success' => true,
                    'data' => $orders,
                    'date' => $date
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Action non valide'], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            if ($action === 'accept') {
                $data = json_decode(file_get_contents('php://input'), true);
                $id = (int)($data['id'] ?? $_POST['id'] ?? 0);
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID commande requis'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                Database::query("UPDATE facture_online SET expediee = 1 WHERE id = ?", [$id]);
                echo json_encode(['success' => true, 'message' => 'Commande acceptée'], JSON_UNESCAPED_UNICODE);

            } elseif ($action === 'refuse') {
                $data = json_decode(file_get_contents('php://input'), true);
                $id = (int)($data['id'] ?? $_POST['id'] ?? 0);
                if (!$id) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'ID commande requis'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                Database::query("UPDATE facture_online SET expediee = 2 WHERE id = ?", [$id]);
                echo json_encode(['success' => true, 'message' => 'Commande refusée'], JSON_UNESCAPED_UNICODE);

            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Action non valide'], JSON_UNESCAPED_UNICODE);
            }
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
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
