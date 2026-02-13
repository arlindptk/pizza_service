<?php
/**
 * Classe de connexion à la base de données
 * PHP 8.4.0
 */

require_once __DIR__ . '/database.php';

class Database {
    private static ?PDO $instance = null;
    private static array $config;

    private function __construct() {}

    public static function getInstance(): PDO {
        if (self::$instance === null) {
            self::$config = require __DIR__ . '/database.php';
            
            $dsn = sprintf(
                'mysql:host=%s;port=%d;dbname=%s;charset=%s',
                self::$config['host'],
                self::$config['port'],
                self::$config['database'],
                self::$config['charset']
            );

            try {
                self::$instance = new PDO(
                    $dsn,
                    self::$config['username'],
                    self::$config['password'],
                    self::$config['options']
                );
            } catch (PDOException $e) {
                error_log('Erreur de connexion à la base de données: ' . $e->getMessage());
                throw new Exception('Impossible de se connecter à la base de données');
            }
        }

        return self::$instance;
    }

    public static function query(string $sql, array $params = []): PDOStatement {
        $db = self::getInstance();
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    }
}
