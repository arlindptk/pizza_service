<?php
/**
 * API pour l'authentification et l'inscription
 */

require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

try {
    switch ($method) {
        case 'POST':
            if ($action === 'register') {
                // Inscription
                $data = json_decode(file_get_contents('php://input'), true);
                
                // Validation
                $errors = [];
                if (empty($data['identifiant'])) {
                    $errors['identifiant'] = 'L\'identifiant est requis';
                }
                if (empty($data['password'])) {
                    $errors['password'] = 'Le mot de passe est requis';
                }
                if (empty($data['nom'])) {
                    $errors['nom'] = 'Le nom est requis';
                }
                if (empty($data['prenom'])) {
                    $errors['prenom'] = 'Le prénom est requis';
                }
                if (empty($data['codePostal'])) {
                    $errors['codePostal'] = 'Le code postal est requis';
                }
                if (empty($data['localite'])) {
                    $errors['localite'] = 'La localité est requise';
                }
                
                if (!empty($errors)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'errors' => $errors
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                // Vérifier si l'identifiant existe déjà
                $existing = Database::query(
                    "SELECT id FROM client WHERE identifiant = ?",
                    [$data['identifiant']]
                )->fetch();
                
                if ($existing) {
                    http_response_code(409);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Cet identifiant est déjà utilisé'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                // Vérifier la localité
                $localite = Database::query(
                    "SELECT id FROM localite WHERE code_postal = ? AND nom = ?",
                    [$data['codePostal'], $data['localite']]
                )->fetch();
                
                if (!$localite) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Localité non valide pour ce code postal'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                // Créer le client
                $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
                
                Database::query(
                    "INSERT INTO client (identifiant, password, nom, prenom, numero, rue, code_postal, localite, adresse_email, telephone, personne_contact, remarque) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $data['identifiant'],
                        $passwordHash,
                        $data['nom'],
                        $data['prenom'],
                        $data['numero'] ?? null,
                        $data['rue'] ?? null,
                        $data['codePostal'],
                        $data['localite'],
                        $data['adresseEmail'] ?? null,
                        $data['telephone'] ?? null,
                        $data['personneContact'] ?? null,
                        $data['remarque'] ?? null
                    ]
                );
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscription réussie'
                ], JSON_UNESCAPED_UNICODE);
                
            } elseif ($action === 'login') {
                // Connexion
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (empty($data['identifiant']) || empty($data['password'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant et mot de passe requis'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $client = Database::query(
                    "SELECT id, identifiant, password, nom, prenom FROM client WHERE identifiant = ? AND actif = 1",
                    [$data['identifiant']]
                )->fetch();
                
                if (!$client || !password_verify($data['password'], $client['password'])) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant ou mot de passe incorrect'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                // Ne pas renvoyer le mot de passe
                unset($client['password']);
                
                echo json_encode([
                    'success' => true,
                    'user' => $client
                ], JSON_UNESCAPED_UNICODE);
                
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Action non valide'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        case 'GET':
            if ($action === 'localites') {
                // Récupérer les localités par code postal
                $codePostal = $_GET['code_postal'] ?? '';
                
                if (empty($codePostal)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Code postal requis'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $localites = Database::query(
                    "SELECT nom FROM localite WHERE code_postal = ? AND actif = 1 ORDER BY nom",
                    [$codePostal]
                )->fetchAll(PDO::FETCH_COLUMN);
                
                echo json_encode([
                    'success' => true,
                    'data' => $localites
                ], JSON_UNESCAPED_UNICODE);
            } else {
                http_response_code(400);
                echo json_encode([
                    'success' => false,
                    'error' => 'Action non valide'
                ], JSON_UNESCAPED_UNICODE);
            }
            break;
            
        default:
            http_response_code(405);
            echo json_encode([
                'success' => false,
                'error' => 'Méthode non autorisée'
            ], JSON_UNESCAPED_UNICODE);
    }
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erreur serveur',
        'message' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
