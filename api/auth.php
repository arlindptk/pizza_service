<?php
/**
 * API pour l'authentification et l'inscription
 * Adapté aux tables : surfeur (login, password...), localite (cp_localite, nom_localite)
 */

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/cors.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? '';

$hours = require __DIR__ . '/../config/open_status.php';
$closedMessage = 'Inscription et connexion disponibles uniquement pendant les heures d\'ouverture. Consultez nos horaires sur la page « Nous Trouver ».';

try {
    switch ($method) {
        case 'POST':
            if ($action === 'register') {
                if (!$hours['open']) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => $closedMessage], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                // Inscription -> table surfeur
                $data = json_decode(file_get_contents('php://input'), true);
                
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
                
                // Vérifier si le login existe déjà (table surfeur)
                $existing = Database::query(
                    "SELECT id FROM surfeur WHERE login = ?",
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
                
                // Vérifier la localité (cp_localite, nom_localite)
                $localite = Database::query(
                    "SELECT id_localite FROM localite WHERE cp_localite = ? AND nom_localite = ?",
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
                
                // Créer l'utilisateur dans surfeur
                $passwordHash = password_hash($data['password'], PASSWORD_DEFAULT);
                $adresse = trim(($data['numero'] ?? '') . ' ' . ($data['rue'] ?? ''));
                if (empty($adresse)) {
                    $adresse = ($data['rue'] ?? '');
                }
                
                Database::query(
                    "INSERT INTO surfeur (login, password, nom, prenom, adresse, cp, localite, mail, numero, contact, rem) 
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    [
                        $data['identifiant'],
                        $passwordHash,
                        $data['nom'],
                        $data['prenom'],
                        $adresse ?: '',
                        $data['codePostal'],
                        $data['localite'],
                        $data['adresseEmail'] ?? '',
                        $data['telephone'] ?? '',
                        $data['personneContact'] ?? '',
                        $data['remarque'] ?? ''
                    ]
                );
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Inscription réussie'
                ], JSON_UNESCAPED_UNICODE);
                
            } elseif ($action === 'login') {
                if (!$hours['open']) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => $closedMessage], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                // Connexion -> table surfeur
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (empty($data['identifiant']) || empty($data['password'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant et mot de passe requis'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $user = Database::query(
                    "SELECT id, login, password, nom, prenom FROM surfeur WHERE login = ?",
                    [$data['identifiant']]
                )->fetch();
                
                if (!$user || !password_verify($data['password'], $user['password'])) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant ou mot de passe incorrect'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                unset($user['password']);
                // Aligner les clés attendues par le frontend (identifiant, nom, prenom)
                $user['identifiant'] = $user['login'];
                unset($user['login']);
                
                echo json_encode([
                    'success' => true,
                    'user' => $user
                ], JSON_UNESCAPED_UNICODE);
                
            } elseif ($action === 'admin_login') {
                // Connexion admin (sans vérification des horaires)
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (empty($data['identifiant']) || empty($data['password'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant et mot de passe requis'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $user = Database::query(
                    "SELECT id, login, password, nom, prenom FROM surfeur WHERE login = ?",
                    [$data['identifiant']]
                )->fetch();
                
                if (!$user || !password_verify($data['password'], $user['password'])) {
                    http_response_code(401);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Identifiant ou mot de passe incorrect'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $adminConfig = require __DIR__ . '/../config/admin.php';
                $admins = $adminConfig['admins'] ?? [];
                if (!in_array($user['login'], $admins, true)) {
                    http_response_code(403);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Accès réservé aux administrateurs'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                unset($user['password']);
                $user['identifiant'] = $user['login'];
                unset($user['login']);
                
                echo json_encode([
                    'success' => true,
                    'user' => $user,
                    'admin' => true
                ], JSON_UNESCAPED_UNICODE);
                
            } elseif ($action === 'forgot_password') {
                if (!$hours['open']) {
                    http_response_code(403);
                    echo json_encode(['success' => false, 'error' => $closedMessage], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                // Mot de passe oublié : recherche par email, génération nouveau mdp, envoi par email
                $data = json_decode(file_get_contents('php://input'), true);
                
                if (empty($data['email'])) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'error' => 'Adresse email requise'
                    ], JSON_UNESCAPED_UNICODE);
                    exit;
                }
                
                $user = Database::query(
                    "SELECT id, login, mail, nom, prenom FROM surfeur WHERE mail = ?",
                    [trim($data['email'])]
                )->fetch();
                
                // Toujours retourner le même message (sécurité : éviter énumération d'emails)
                $response = [
                    'success' => true,
                    'message' => 'Si un compte existe avec cette adresse email, vous recevrez un nouveau mot de passe.'
                ];
                
                if ($user && !empty($user['mail'])) {
                    $chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
                    $newPassword = '';
                    for ($i = 0; $i < 8; $i++) {
                        $newPassword .= $chars[random_int(0, strlen($chars) - 1)];
                    }
                    
                    $passwordHash = password_hash($newPassword, PASSWORD_DEFAULT);
                    Database::query("UPDATE surfeur SET password = ? WHERE id = ?", [$passwordHash, $user['id']]);
                    
                    $mailFile = __DIR__ . '/../config/mail.php';
                    $mailConfig = require (file_exists($mailFile) ? $mailFile : __DIR__ . '/../config/mail.example.php');
                    $body = "Bonjour " . ($user['prenom'] ?? $user['nom']) . ",\n\n"
                        . "Vous avez demandé la récupération de votre mot de passe.\n\n"
                        . "Identifiant : " . $user['login'] . "\n"
                        . "Nouveau mot de passe : " . $newPassword . "\n\n"
                        . "Connectez-vous avec ces identifiants puis modifiez votre mot de passe si vous le souhaitez.\n\n"
                        . "— Pizza Service Namur";
                    
                    $sent = false;
                    if (!empty($mailConfig['smtp_username']) && !empty($mailConfig['smtp_password'])) {
                        $mail = new PHPMailer(true);
                        try {
                            $mail->CharSet = 'UTF-8';
                            $mail->isSMTP();
                            $mail->Host       = $mailConfig['smtp_host'];
                            $mail->SMTPAuth   = true;
                            $mail->Username   = $mailConfig['smtp_username'];
                            $mail->Password   = $mailConfig['smtp_password'];
                            $mail->SMTPSecure = $mailConfig['smtp_secure'];
                            $mail->Port       = $mailConfig['smtp_port'];
                            $mail->setFrom($mailConfig['from_email'], $mailConfig['from_name']);
                            $mail->addAddress($user['mail']);
                            $mail->addReplyTo($mailConfig['reply_to']);
                            $mail->Subject = 'Pizza Service Namur - Récupération de mot de passe';
                            $mail->Body    = $body;
                            $mail->send();
                            $sent = true;
                        } catch (Exception $e) {
                            error_log('Email mot de passe oublié: ' . $mail->ErrorInfo);
                        }
                    } else {
                        $headers = "From: " . $mailConfig['from_email'] . "\r\nReply-To: " . $mailConfig['reply_to'] . "\r\nContent-Type: text/plain; charset=UTF-8\r\n";
                        $sent = @mail($user['mail'], 'Pizza Service Namur - Récupération de mot de passe', $body, $headers);
                    }
                }
                
                echo json_encode($response, JSON_UNESCAPED_UNICODE);
                
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
                    "SELECT nom_localite FROM localite WHERE cp_localite = ? ORDER BY nom_localite",
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
