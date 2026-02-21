import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { API_ENDPOINTS } from '../../../config/api';
import './Cart.css';

const Cart = () => {
  const { cart, removeFromCart, total, showCart, setShowCart, clearCart } = useCart();
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  if (!showCart) return null;

  return (
    <div className="cart-overlay">
      <div className="cart-backdrop" onClick={() => setShowCart(false)}></div>
      <div className="cart-sidebar">
        <div className="cart-header">
          <div className="cart-header-content">
            <ShoppingBag size={20} />
            <h2>Récapitulatif</h2>
          </div>
          <button onClick={() => setShowCart(false)} className="cart-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="cart-content">
          {cart.length === 0 ? (
            <div className="cart-empty">
              <p>Votre panier est vide</p>
            </div>
          ) : (
            <div className="cart-items">
              {cart.map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <p className="cart-item-name">
                      {item.name}
                      {item.size && <span className="cart-item-size"> ({item.size})</span>}
                    </p>
                    <p className="cart-item-price">{item.price.toFixed(2)}€</p>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="cart-item-remove"
                  >
                    <X size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="cart-footer">
          <div className="cart-total">
            <span>Total</span>
            <span className="cart-total-price">{total.toFixed(2)}€</span>
          </div>
          <button
            disabled={cart.length === 0 || submitting}
            className="cart-validate-btn"
            onClick={async () => {
              if (!user?.identifiant) {
                alert('Connectez-vous pour commander.');
                return;
              }
              setSubmitting(true);
              try {
                const r = await fetch(API_ENDPOINTS.COMMANDE, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    login: user.identifiant,
                    items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qte: 1 })),
                    livraison: '',
                    paiement: 'cash',
                  }),
                });
                const json = await r.json();
                if (json.success) {
                  clearCart();
                  setShowCart(false);
                  alert('Commande envoyée ! Elle apparaîtra dans l\'espace admin.');
                } else {
                  const msg = json.message ? `${json.error}\n\nDétail: ${json.message}` : (json.error || 'Erreur lors de l\'envoi de la commande.');
                  alert(msg);
                }
              } catch (e) {
                alert('Erreur réseau. Réessayez.');
              } finally {
                setSubmitting(false);
              }
            }}
          >
            {submitting ? 'Envoi…' : 'Valider la commande'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
