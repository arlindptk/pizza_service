# Tables Admin - Pizza Service Namur

## Activer le mode automatique (actif=2)

Si la table `infos` existe déjà, exécuter pour autoriser le mode automatique (horaires) :

```bash
mysql -u root -p pizza_service_namur < database/migration_actif_2.sql
```

## Table client (commandes téléphone)

```bash
mysql -u root -p pizza_service_namur < database/client_table.sql
```

## Création des tables

Si les tables `facture_online`, `facture_online_ligne` et `infos` n'existent pas encore, exécutez :

```bash
mysql -u root -p pizza_service_namur < database/admin_tables.sql
```

Ou via phpMyAdmin : importer le fichier `admin_tables.sql`.

## Tables créées

- **infos** : Statut ouverture (actif = 1 ouvert, 0 fermé)
- **facture_online** : Commandes en ligne (expediee: 0=attente, 1=acceptée, 2=refusée)
- **facture_online_ligne** : Lignes de chaque commande
