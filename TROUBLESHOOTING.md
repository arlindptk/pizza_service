# Guide de dépannage - API Menu

## Problème : "Impossible de charger le menu depuis l'API"

### Étapes de diagnostic

#### 1. Vérifier que le serveur PHP est démarré

```bash
# Dans le dossier Pizza_service
php -S localhost:8000
```

#### 2. Tester la connexion à la base de données

Ouvrir dans le navigateur :
```
http://localhost:8000/api/test.php
```

Résultat attendu : JSON avec `"success": true` et la liste des tables.

#### 3. Vérifier la configuration de la base de données

Ouvrir dans le navigateur :
```
http://localhost:8000/api/debug.php
```

Cela affichera :
- La version PHP
- Les extensions disponibles
- La configuration de connexion
- Les tables présentes
- Le nombre d'enregistrements dans `cat` et `carte`

#### 4. Vérifier que les données existent dans la base

Connectez-vous à phpMyAdmin et vérifiez :

```sql
-- Vérifier les catégories
SELECT * FROM cat;

-- Vérifier les produits
SELECT * FROM carte;

-- Si les tables sont vides, exécuter :
-- database/insert_sample_data.sql
```

#### 5. Tester l'API menu directement

Ouvrir dans le navigateur :
```
http://localhost:8000/api/menu.php
```

Résultat attendu : JSON avec `"success": true` et un objet `data` contenant le menu.

#### 6. Vérifier la console du navigateur

Dans le navigateur (F12), onglet Console, vérifier :
- Les erreurs CORS
- Les erreurs de réseau
- Les messages de débogage

#### 7. Vérifier la configuration de l'API dans le frontend

Dans `public/src/config/api.js`, vérifier que :
```javascript
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
```

Si vous utilisez un autre port, créer un fichier `.env` dans `public/` :
```
VITE_API_URL=http://localhost:8000/api
```

### Solutions courantes

#### Problème : Base de données vide

**Solution** : Exécuter le script d'insertion de données de test
```sql
-- Dans phpMyAdmin, sélectionner la base pizza_service_namur
-- Exécuter le contenu de database/insert_sample_data.sql
```

#### Problème : Erreur de connexion à la base de données

**Solution** : Vérifier `config/database.php`
- Vérifier que le nom de la base est correct : `pizza_service_namur`
- Vérifier l'utilisateur et le mot de passe MySQL
- Vérifier que MySQL est démarré (WAMP/XAMPP)

#### Problème : CORS

**Solution** : Vérifier que `api/cors.php` est bien inclus dans tous les fichiers API

#### Problème : Tables n'existent pas

**Solution** : Importer le fichier SQL complet
```sql
-- Dans phpMyAdmin
-- Sélectionner la base pizza_service_namur
-- Importer database/pizza_service_namur.sql
```

### Commandes utiles

```bash
# Démarrer le serveur PHP
cd C:\Users\jango\Desktop\Pizza_service
php -S localhost:8000

# Dans un autre terminal, démarrer React
cd public
npm run dev
```

### Vérification finale

1. ✅ Serveur PHP démarré sur `http://localhost:8000`
2. ✅ Base de données `pizza_service_namur` créée
3. ✅ Tables créées (vérifier avec `api/test.php`)
4. ✅ Données insérées (vérifier avec `api/debug.php`)
5. ✅ API menu fonctionne (`api/menu.php` retourne du JSON)
6. ✅ Frontend React démarré sur `http://localhost:3000`
7. ✅ Pas d'erreurs CORS dans la console

Si toutes ces étapes sont OK, le menu devrait se charger correctement !
