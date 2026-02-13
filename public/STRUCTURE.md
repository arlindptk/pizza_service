# Structure du Projet

## Organisation des fichiers

```
public/
├── src/
│   ├── components/          # Composants réutilisables
│   │   └── layout/          # Composants de mise en page
│   │       ├── Header/      # En-tête du site
│   │       │   ├── Header.jsx
│   │       │   ├── Header.css
│   │       │   └── index.js
│   │       ├── Footer/      # Pied de page
│   │       │   ├── Footer.jsx
│   │       │   ├── Footer.css
│   │       │   └── index.js
│   │       └── Cart/        # Panier d'achat
│   │           ├── Cart.jsx
│   │           ├── Cart.css
│   │           └── index.js
│   │
│   ├── pages/               # Pages de l'application
│   │   ├── Home/            # Page d'accueil
│   │   │   ├── Home.jsx
│   │   │   ├── Home.css
│   │   │   └── index.js
│   │   ├── Menu/            # Page menu
│   │   │   ├── Menu.jsx
│   │   │   ├── Menu.css
│   │   │   └── index.js
│   │   ├── FindUs/          # Page "Où nous trouver"
│   │   │   ├── FindUs.jsx
│   │   │   ├── FindUs.css
│   │   │   └── index.js
│   │   └── Login/           # Page connexion/inscription
│   │       ├── Login.jsx
│   │       ├── Login.css
│   │       └── index.js
│   │
│   ├── context/             # Contextes React
│   │   └── CartContext.jsx  # Contexte du panier
│   │
│   ├── data/                # Données statiques
│   │   └── menuData.js      # Données du menu
│   │
│   ├── styles/              # Styles globaux
│   │   ├── index.css        # Styles de base et variables CSS
│   │   └── App.css          # Styles de l'application
│   │
│   ├── App.jsx              # Composant racine
│   └── main.jsx             # Point d'entrée
│
├── index.html               # Fichier HTML principal
├── package.json             # Dépendances npm
├── vite.config.js           # Configuration Vite
└── README.md                # Documentation du projet
```

## Principes d'organisation

### 1. Composants (`components/`)
- **Layout** : Composants de structure (Header, Footer, Cart)
- Chaque composant a son propre dossier avec :
  - Le fichier JSX du composant
  - Le fichier CSS associé
  - Un fichier `index.js` pour faciliter les imports

### 2. Pages (`pages/`)
- Chaque page a son propre dossier avec :
  - Le fichier JSX de la page
  - Le fichier CSS associé
  - Un fichier `index.js` pour faciliter les imports

### 3. Styles (`styles/`)
- Styles globaux centralisés
- Variables CSS définies dans `index.css`
- Styles spécifiques à l'application dans `App.css`

### 4. Context (`context/`)
- Contextes React pour la gestion d'état globale
- Actuellement : `CartContext` pour le panier

### 5. Data (`data/`)
- Données statiques et constantes
- Actuellement : `menuData.js` avec les données du menu

## Imports simplifiés

Grâce aux fichiers `index.js`, les imports sont simplifiés :

```javascript
// Au lieu de :
import Header from './components/layout/Header/Header';

// On peut écrire :
import Header from './components/layout/Header';
```

## Avantages de cette structure

1. **Organisation claire** : Chaque composant/page a son propre dossier
2. **Maintenabilité** : Facile de trouver et modifier un fichier
3. **Scalabilité** : Structure prête pour l'ajout de nouveaux composants
4. **Séparation des préoccupations** : Styles, composants et données sont séparés
5. **Imports simplifiés** : Utilisation de fichiers `index.js`
