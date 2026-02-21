import React, { useState, useEffect } from 'react';
import { Pizza, Utensils, Baby, Salad, Dessert, Coffee, Settings, Plus } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Menu.css';

const Menu = () => {
  const { isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const [menuData, setMenuData] = useState({});
  const categories = Object.keys(menuData);
  const [activeTab, setActiveTab] = useState(categories[0] || 'Pizzas');
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
            const { MENU_DATA } = await import('../../data/menuData');
            setMenuData(MENU_DATA);
          } else {
            setMenuData(result.data);
            setError(null);
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

  // Mettre à jour activeTab quand les catégories sont chargées
  React.useEffect(() => {
    if (categories.length > 0 && !categories.includes(activeTab)) {
      setActiveTab(categories[0]);
    }
  }, [categories.join(',')]);

  const PIZZA_SIZES = [
    { label: '30cm', supplement: 0 },
    { label: '40cm', supplement: 1.5 },
  ];

  const [pizzaSizeModal, setPizzaSizeModal] = useState(null); // { item, idx } ou null

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'Pizzas':
        return <Pizza size={16} />;
      case 'Pâtes':
        return <Utensils size={16} />;
      case 'Enfants':
        return <Baby size={16} />;
      case 'Salade':
      case 'Salades':
        return <Salad size={16} />;
      case 'Dessert':
      case 'Desserts':
        return <Dessert size={16} />;
      case 'Boisson':
      case 'Boissons':
        return <Coffee size={16} />;
      case 'Options':
      case 'Suppléments':
        return <Settings size={16} />;
      default:
        return null;
    }
  };

  const handleAddPizza = (item, idx) => {
    setPizzaSizeModal({ item, idx });
  };

  const handleConfirmPizzaSize = (size) => {
    if (!pizzaSizeModal) return;
    const { item, idx } = pizzaSizeModal;
    const finalPrice = item.price + size.supplement;
    addToCart({
      ...item,
      id: `pizza-${item.id || idx}-${Date.now()}`,
      price: finalPrice,
      size: size.label,
      basePrice: item.price,
    });
    setPizzaSizeModal(null);
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
          <div style={{ textAlign: 'center', padding: '1rem', color: 'var(--accent-gold)', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        {!loading && menuData[activeTab] && menuData[activeTab].length > 0 && (
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
                {isAuthenticated && (
                  <button
                    className="menu-item-add-btn"
                    onClick={() => activeTab === 'Pizzas' ? handleAddPizza(item, idx) : addToCart({ ...item, id: (item.id || idx) + '-' + Date.now() })}
                    title="Ajouter au panier"
                  >
                    <Plus size={18} />
                    Ajouter
                  </button>
                )}
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
              {[
                { name: 'Suppl. Brocoli', price: 2 },
                { name: 'Suppl. Bolo', price: 2 },
                { name: 'Pâte Fine', price: 0 },
                { name: 'Ail / Piment', price: 0 },
              ].map((opt, i) => (
                isAuthenticated ? (
                  <button
                    key={i}
                    className="menu-option-item"
                    onClick={() => addToCart({ ...opt, id: `opt-${i}-${Date.now()}`, desc: '' })}
                    title="Ajouter au panier"
                  >
                    <span>{opt.name}</span>
                    <b>{opt.price > 0 ? `${opt.price.toFixed(2)}€` : 'Offert'}</b>
                  </button>
                ) : (
                  <div key={i} className="menu-option-item menu-option-item-disabled">
                    <span>{opt.name}</span>
                    <b>{opt.price > 0 ? `${opt.price.toFixed(2)}€` : 'Offert'}</b>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {/* Modal choix taille pizza */}
        {pizzaSizeModal && (
          <div className="pizza-size-overlay" onClick={() => setPizzaSizeModal(null)}>
            <div className="pizza-size-modal" onClick={(e) => e.stopPropagation()}>
              <h4>Choisir la taille</h4>
              <p className="pizza-size-modal-name">{pizzaSizeModal.item.name}</p>
              <div className="pizza-size-options">
                {PIZZA_SIZES.map((size) => (
                  <button
                    key={size.label}
                    className="pizza-size-option"
                    onClick={() => handleConfirmPizzaSize(size)}
                  >
                    <span>{size.label}</span>
                    <span>
                      {(pizzaSizeModal.item.price + size.supplement).toFixed(2)}€
                      {size.supplement > 0 && <small> (+{size.supplement.toFixed(2)}€)</small>}
                    </span>
                  </button>
                ))}
              </div>
              <button className="pizza-size-cancel" onClick={() => setPizzaSizeModal(null)}>
                Annuler
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Menu;
