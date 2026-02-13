# Pizza Service - Frontend React

Site web moderne de pizzeria développé avec React et Vite.

## 🚀 Démarrage rapide

### Prérequis
- Node.js (version 16 ou supérieure)
- npm ou yarn

### Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

3. Ouvrir votre navigateur sur : **http://localhost:3000**

## 📁 Structure du projet

```
public/
├── src/
│   ├── components/     # Composants réutilisables (Header, Footer, Cart)
│   ├── pages/          # Pages de l'application (Home, Menu, Login, FindUs)
│   ├── context/         # Context React (CartContext)
│   ├── data/           # Données statiques (menuData.js)
│   └── App.jsx         # Composant principal
├── index.html          # Point d'entrée HTML
└── package.json        # Dépendances et scripts
```

## 🎨 Pages disponibles

- **/** - Page d'accueil
- **/menu** - Menu de la pizzeria
- **/find-us** - Informations de contact et localisation
- **/login** - Connexion et inscription (mode démo)

## 🛠️ Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Construire pour la production
- `npm run preview` - Prévisualiser la version de production

## 📝 Notes

- Le site fonctionne actuellement en mode **frontend uniquement**
- Les formulaires de connexion/inscription sont en mode démo (simulation)
- Les données du menu sont statiques (fichier `menuData.js`)
- Pour une version complète avec backend, il faudra intégrer une API

## 🎯 Fonctionnalités

- ✅ Design moderne et responsive
- ✅ Menu interactif avec catégories
- ✅ Panier d'achat (localStorage)
- ✅ Formulaire de contact/localisation
- ✅ Formulaire de connexion/inscription (mode démo)

## 📦 Technologies utilisées

- React 18
- React Router DOM
- Vite
- Lucide React (icônes)
- CSS3
