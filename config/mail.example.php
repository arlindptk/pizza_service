<?php
/**
 * Copiez ce fichier en mail.php et modifiez vos identifiants SMTP.
 * mail.php est ignoré par git (ne pas commiter vos mots de passe).
 */
return [
    'smtp_host'     => 'sandbox.smtp.mailtrap.io',
    'smtp_port'     => 2525,
    'smtp_secure'   => 'tls',
    'smtp_username' => 'votre_username',
    'smtp_password' => 'votre_password',
    'from_email'    => 'noreply@pizzaservice.be',
    'from_name'     => 'Pizza Service Namur',
    'reply_to'      => 'contact@pizzaservice.be',
];
