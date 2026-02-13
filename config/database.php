<?php
/**
 * Configuration de la base de données
 * PHP 8.4.0
 */

return [
    'host' => 'localhost',
    'port' => 3306,
    'database' => 'pizza_service_namur',
    'username' => 'root',
    'password' => '',
    'charset' => 'utf8mb4',
    'options' => [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]
];
