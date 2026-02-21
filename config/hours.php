<?php
/**
 * Horaires d'ouverture - inscription et connexion autorisées uniquement pendant ces créneaux
 * Jour: 0=dimanche, 1=lundi, ... 6=samedi
 * Chaque créneau: [heure_debut, minute_debut, heure_fin, minute_fin]
 */
$tz = new DateTimeZone('Europe/Brussels');
$now = new DateTime('now', $tz);
$day = (int) $now->format('w'); // 0=dim, 1=lun, ...
$currentMinutes = (int) $now->format('G') * 60 + (int) $now->format('i');

$hours = [
    0 => [[11, 0, 14, 0], [17, 30, 22, 0]], // Dimanche
    1 => [[17, 30, 22, 0]],                   // Lundi
    2 => [[11, 0, 14, 0], [17, 30, 22, 0]], // Mardi
    3 => [[11, 0, 14, 0], [17, 30, 22, 0]], // Mercredi
    4 => [[11, 0, 14, 0], [17, 30, 22, 0]], // Jeudi
    5 => [[11, 0, 17, 0], [17, 30, 22, 0]], // Vendredi
    6 => [[11, 0, 14, 0], [17, 30, 22, 0]], // Samedi
];

$isOpen = false;
foreach ($hours[$day] ?? [] as $slot) {
    $start = $slot[0] * 60 + $slot[1];
    $end = $slot[2] * 60 + $slot[3];
    if ($currentMinutes >= $start && $currentMinutes < $end) {
        $isOpen = true;
        break;
    }
}

return ['open' => $isOpen, 'timezone' => 'Europe/Brussels'];
