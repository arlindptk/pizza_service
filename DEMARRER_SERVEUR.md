# Guide de démarrage du serveur PHP

## ⚠️ Important

Les URLs comme `http://localhost:8000/api/test.php` doivent être ouvertes dans un **navigateur web**, pas dans PowerShell !

## 🚀 Démarrage du serveur PHP

### Option 1 : Dans PowerShell (recommandé)

```powershell
cd C:\Users\jango\Desktop\Pizza_service
php -S localhost:8000
```

Le serveur démarrera et affichera :
```
PHP 8.4.0 Development Server (http://localhost:8000) started
```

**⚠️ Laissez ce terminal ouvert !** Le serveur doit rester actif.

### Option 2 : En arrière-plan (si vous avez besoin du terminal)

Dans un nouveau terminal PowerShell :
```powershell
cd C:\Users\jango\Desktop\Pizza_service
Start-Process php -ArgumentList "-S","localhost:8000" -WindowStyle Hidden
```

## 🌐 Tester l'API dans le navigateur

Une fois le serveur démarré, ouvrez votre **navigateur web** et allez sur :

1. **Test de connexion** :
   ```
   http://localhost:8000/api/test.php
   ```

2. **Débogage complet** :
   ```
   http://localhost:8000/api/debug.php
   ```

3. **API Menu** :
   ```
   http://localhost:8000/api/menu.php
   ```

## 📋 Vérifications

### ✅ Le serveur PHP fonctionne si :
- Vous voyez du JSON dans le navigateur
- Pas d'erreur 404 ou 500
- Le terminal affiche les requêtes

### ❌ Si ça ne fonctionne pas :

1. **Vérifier que PHP est installé** :
   ```powershell
   php -v
   ```
   Doit afficher : `PHP 8.4.0` (ou similaire)

2. **Vérifier que le port 8000 est libre** :
   ```powershell
   netstat -an | findstr :8000
   ```
   Si quelque chose est déjà sur le port 8000, utilisez un autre port :
   ```powershell
   php -S localhost:8080
   ```
   Et mettez à jour l'URL dans le navigateur.

3. **Vérifier que vous êtes dans le bon dossier** :
   ```powershell
   pwd
   ```
   Doit afficher : `C:\Users\jango\Desktop\Pizza_service`

## 🔄 Arrêter le serveur

Dans le terminal où le serveur tourne, appuyez sur :
```
Ctrl + C
```

## 📝 Commandes utiles

```powershell
# Vérifier la version PHP
php -v

# Vérifier les extensions PHP
php -m

# Vérifier que PDO MySQL est disponible
php -m | findstr pdo_mysql
```
