import React, { useState, useEffect } from 'react';
import { Pizza, Utensils, Baby, Salad, Dessert, Coffee, Settings } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import './Menu.css';

const Menu = () => {
  const [activeTab, setActiveTab] = useState('Pizzas');
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Chargement du menu depuis:', API_ENDPOINTS.MENU);
        const response = await fetch(API_ENDPOINTS.MENU);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        console.log('Réponse API:', result);
        
        if (result.success) {
          if (Object.keys(result.data).length === 0) {
            console.warn('Menu vide depuis l\'API, utilisation des données statiques');
            const { MENU_DATA } = await import('../../data/menuData');
            setMenuData(MENU_DATA);
            setError('Menu vide dans la base de données. Utilisation des données par défaut.');
          } else {
            setMenuData(result.data);
          }
        } else {
          throw new Error(result.error || result.message || 'Erreur inconnue');
        }
      } catch (err) {
        console.error('Erreur API:', err);
        setError(`Impossible de charger le menu depuis l'API: ${err.message}`);
        // Fallback sur les données statiques
        try {
          const { MENU_DATA } = await import('../../data/menuData');
          setMenuData(MENU_DATA);
        } catch (fallbackErr) {
          console.error('Erreur fallback:', fallbackErr);
          setError('Erreur critique: impossible de charger les données');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMenu();
  }, []);

  const categories = Object.keys(menuData);

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pizzas':
        return <Pizza size={16} />;
      case 'Pâtes':
        return <Utensils size={16} />;
      case 'Enfants':
        return <Baby size={16} />;
      case 'Salade':
        return <Salad size={16} />;
      case 'Dessert':
        return <Dessert size={16} />;
      case 'Boisson':
        return <Coffee size={16} />;
      case 'Options':
        return <Settings size={16} />;
      default:
        return null;
    }
  };

  return (
    <div className="menu-page-new">
      {/* Onglets Catégories */}
      <div className="menu-tabs-container">
        <div className="menu-tabs">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveTab(cat)}
              className={`menu-tab ${activeTab === cat ? 'active' : ''}`}
            >
              {getCategoryIcon(cat)}
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Menu Tableau */}
      <main className="menu-main-content">
        <div className="menu-content-header">
          <h2 className="menu-section-title">{activeTab}</h2>
          <span className="menu-items-count">
            {menuData[activeTab] ? menuData[activeTab].length : 0} articles
          </span>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-gray)' }}>
            Chargement du menu...
          </div>
        )}

        {error && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--accent-gold)' }}>
            {error}
          </div>
        )}

        {!loading && !error && menuData[activeTab] && (
          <div className="menu-items-grid">
            {menuData[activeTab].map((item, idx) => (
            <div
              key={idx}
              className="menu-item-card"
            >
              <div className="menu-item-content">
                <div className="menu-item-number">
                  {(idx + 1).toString().padStart(2, '0')}
                </div>
                <div className="menu-item-info">
                  <h3 className="menu-item-name">{item.name}</h3>
                  <p className="menu-item-desc">{item.desc}</p>
                </div>
              </div>

              <div className="menu-item-footer">
                <span className="menu-item-price">{item.price.toFixed(2)}€</span>
              </div>
            </div>
          ))}
          </div>
        )}

        {/* Options supplémentaires - seulement pour les Pizzas */}
        {activeTab === 'Pizzas' && (
          <div className="menu-options">
            <h4 className="menu-options-title">Options supplémentaires</h4>
            <div className="menu-options-grid">
              <div className="menu-option-item">
                <span>Suppl. Brocoli</span>
                <b>2.00€</b>
              </div>
              <div className="menu-option-item">
                <span>Suppl. Bolo</span>
                <b>2.00€</b>
              </div>
              <div className="menu-option-item">
                <span>Pâte Fine</span>
                <b>Offert</b>
              </div>
              <div className="menu-option-item">
                <span>Ail / Piment</span>
                <b>Offert</b>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Menu;
