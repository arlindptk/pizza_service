<?php
/**
 * API Client - Commandes téléphone
 * Table : client (num, tel1, nom, prenom, ad1, ad2, cp, ville, fidel, comm, email)
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'GET':
            if ($action === 'search') {
                $tel = preg_replace('/\D/', '', $_GET['tel'] ?? '');
                if (strlen($tel) < 3) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Saisissez au moins 3 chiffres'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $clients = Database::query(
                    "SELECT num, tel1, nom, prenom, ad1, ad2, cp, ville, fidel, comm, email FROM client"
                )->fetchAll(PDO::FETCH_ASSOC);
                $client = null;
                foreach ($clients as $c) {
                    $clientTel = preg_replace('/\D/', '', $c['tel1'] ?? '');
                    if ($clientTel === $tel || substr($clientTel, -strlen($tel)) === $tel || strpos($clientTel, $tel) !== false) {
                        $client = $c;
                        $client['numc'] = $client['num'];
                        break;
                    }
                }
                echo json_encode([
                    'success' => true,
                    'found' => $client !== null,
                    'client' => $client
                ], JSON_UNESCAPED_UNICODE);

            } elseif ($action === 'localites') {
                $localites = Database::query(
                    "SELECT cp_localite, nom_localite FROM localite ORDER BY cp_localite, nom_localite"
                )->fetchAll(PDO::FETCH_ASSOC);
                $byCp = [];
                foreach ($localites as $l) {
                    $cp = $l['cp_localite'];
                    if (!isset($byCp[$cp])) $byCp[$cp] = [];
                    $byCp[$cp][] = $l['nom_localite'];
                }
                echo json_encode([
                    'success' => true,
                    'data' => $localites,
                    'byCp' => $byCp
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode(['success' => false, 'error' => 'Action non valide'], JSON_UNESCAPED_UNICODE);
            }
            break;

        case 'POST':
            if ($action === 'save') {
                $data = json_decode(file_get_contents('php://input'), true);
                $tel = preg_replace('/\D/', '', $data['tel1'] ?? $data['numero'] ?? '');
                if (strlen($tel) < 10) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'error' => 'Téléphone requis (10 chiffres)'], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                $tel = substr($tel, -10);

                $num = (int)($data['numc'] ?? $data['num'] ?? 0);
                $nom = trim($data['nom'] ?? '');
                $prenom = trim($data['prenom'] ?? '');
                $ad1 = trim($data['ad1'] ?? '');
                $ad2 = trim($data['ad2'] ?? '');
                $cp = trim($data['cp'] ?? '');
                $ville = trim($data['ville'] ?? $data['localite'] ?? '');
                $fidel = (int)($data['fidel'] ?? 0);
                $comm = trim($data['comm'] ?? '');
                $email = trim($data['email'] ?? $data['mail'] ?? '');

                if ($num > 0) {
                    Database::query(
                        "UPDATE client SET tel1=?, nom=?, prenom=?, ad1=?, ad2=?, cp=?, ville=?, fidel=?, comm=?, email=? WHERE num=?",
                        [$tel, $nom, $prenom, $ad1, $ad2, $cp, $ville, $fidel, $comm, $email, $num]
                    );
                    echo json_encode([
                        'success' => true,
                        'message' => 'Client mis à jour',
                        'numc' => $num
                    ], JSON_UNESCAPED_UNICODE);
                } else {
                    $existing = Database::query("SELECT num FROM client WHERE tel1 = ?", [$tel])->fetch();
                    if (!$existing) {
                        $clientsAll = Database::query("SELECT num, tel1 FROM client")->fetchAll(PDO::FETCH_ASSOC);
                        foreach ($clientsAll as $c) {
                            if (preg_replace('/\D/', '', $c['tel1'] ?? '') === $tel) {
                                $existing = $c;
                                break;
                            }
                        }
                    }
                    if ($existing) {
                        $num = (int)$existing['num'];
                        Database::query(
                            "UPDATE client SET nom=?, prenom=?, ad1=?, ad2=?, cp=?, ville=?, fidel=?, comm=?, email=? WHERE num=?",
                            [$nom, $prenom, $ad1, $ad2, $cp, $ville, $fidel, $comm, $email, $num]
                        );
                    } else {
                        Database::query(
                            "INSERT INTO client (tel1, nom, prenom, ad1, ad2, cp, ville, fidel, comm, email) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                            [$tel, $nom, $prenom, $ad1, $ad2, $cp, $ville, $fidel, $comm, $email]
                        );
                        $num = (int)Database::getInstance()->lastInsertId();
                    }
                    echo json_encode([
                        'success' => true,
                        'message' => 'Client enregistré',
                        'numc' => $num
                    ], JSON_UNESCAPED_UNICODE);
                }
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
    $msg = $e->getMessage();
    if (stripos($msg, "doesn't exist") !== false) {
        $msg .= ' — Vérifiez que la table client existe avec les colonnes: num, tel1, nom, prenom, ad1, ad2, cp, ville, fidel, comm, email';
    }
    echo json_encode([
        'success' => false,
        'error' => 'Erreur base de données',
        'message' => $msg
    ], JSON_UNESCAPED_UNICODE);
}
