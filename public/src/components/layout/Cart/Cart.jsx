import React, { useState } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { API_ENDPOINTS } from '../../../config/api';
import './Cart.css';

/** Réduction membre : 5 % sur chaque plat pour les utilisateurs connectés */
const REDUCTION_MEMBRE = 0.95;
/** Supplément paiement carte si total < 20 € */
const SUPPLEMENT_BANCONTACT = 0.3;
const SUPPLEMENT_VISA = 0.5;
const SEUIL_SUPPLEMENT = 20;

const Cart = () => {
  const { cart, removeFromCart, total, showCart, setShowCart, clearCart } = useCart();
  const { user, isAuthenticated, getAuthHeaders, logout } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [paiement, setPaiement] = useState('cash');
  const [heureLivraison, setHeureLivraison] = useState('');
  const [timeError, setTimeError] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null); // { totalFinal }

  /** Heure minimale (maintenant) pour le champ "heure de livraison" */
  const getMinTime = () => {
    const d = new Date();
    const h = d.getHours();
    const m = d.getMinutes();
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };

  const isHeureInPast = (heureStr) => {
    if (!heureStr || !heureStr.match(/^\d{1,2}:\d{2}$/)) return false;
    const now = new Date();
    const [h, m] = heureStr.split(':').map(Number);
    const desired = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, m, 0, 0);
    return desired <= now;
  };

  const priceDisplay = (price) => (isAuthenticated ? Math.round(price * REDUCTION_MEMBRE * 100) / 100 : price);
  const totalDisplay = isAuthenticated ? Math.round(total * REDUCTION_MEMBRE * 100) / 100 : total;
  const priceToSend = (price) => (isAuthenticated ? Math.round(price * REDUCTION_MEMBRE * 100) / 100 : price);

  const supplement = (() => {
    if (paiement === 'bancontact' && totalDisplay < SEUIL_SUPPLEMENT) return SUPPLEMENT_BANCONTACT;
    if (paiement === 'visa' && totalDisplay < SEUIL_SUPPLEMENT) return SUPPLEMENT_VISA;
    return 0;
  })();
  const totalFinal = Math.round((totalDisplay + supplement) * 100) / 100;

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
          {isAuthenticated && cart.length > 0 && (
            <p className="cart-promo-badge">Réduction membre 5% appliquée sur chaque plat</p>
          )}
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
                    <p className="cart-item-price">
                      {isAuthenticated ? (
                        <>
                          <span className="cart-item-price-before">{item.price.toFixed(2)}€</span>
                          <span>{priceDisplay(item.price).toFixed(2)}€</span>
                        </>
                      ) : (
                        <span>{item.price.toFixed(2)}€</span>
                      )}
                    </p>
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
          {!orderConfirmed && cart.length > 0 && (
            <>
              <div className="cart-form-block">
                <label className="cart-form-label">Paiement – Heure désirée de livraison *</label>
                <div className="cart-form-row">
                  <select
                    className="cart-form-select"
                    value={paiement}
                    onChange={(e) => setPaiement(e.target.value)}
                    aria-label="Mode de paiement"
                  >
                    <option value="cash">Cash</option>
                    <option value="bancontact">Bancontact</option>
                    <option value="visa">Visa</option>
                  </select>
                  <input
                    type="time"
                    className="cart-form-input"
                    value={heureLivraison}
                    min={getMinTime()}
                    onChange={(e) => {
                      setHeureLivraison(e.target.value);
                      setTimeError('');
                    }}
                    required
                    aria-label="Heure désirée de livraison"
                    aria-invalid={!!timeError}
                  />
                </div>
                {timeError && <p className="cart-form-error">{timeError}</p>}
                {paiement === 'bancontact' && totalDisplay < SEUIL_SUPPLEMENT && (
                  <p className="cart-form-warning">
                    Veuillez noter qu'un supplément de {SUPPLEMENT_BANCONTACT.toFixed(2)} EUR est ajouté à votre commande pour le paiement BANCONTACT &lt; 20€.
                  </p>
                )}
                {paiement === 'visa' && totalDisplay < SEUIL_SUPPLEMENT && (
                  <p className="cart-form-warning">
                    Veuillez noter qu'un supplément de {SUPPLEMENT_VISA.toFixed(2)} EUR est ajouté à votre commande pour le paiement VISA &lt; 20€.
                  </p>
                )}
              </div>
              {isAuthenticated && cart.length > 0 && (
                <div className="cart-total-before">
                  <span>Sous-total</span>
                  <span>{total.toFixed(2)}€</span>
                </div>
              )}
              {supplement > 0 && (
                <div className="cart-total-supplement">
                  <span>Supplément paiement carte</span>
                  <span>{supplement.toFixed(2)}€</span>
                </div>
              )}
              <div className="cart-total">
                <span>Total</span>
                <span className="cart-total-price">{totalFinal.toFixed(2)}€</span>
              </div>
              <button
                disabled={cart.length === 0 || submitting || !heureLivraison.trim()}
                className="cart-validate-btn"
                onClick={async () => {
                  if (!user?.identifiant) {
                    alert('Connectez-vous pour commander.');
                    return;
                  }
                  if (!heureLivraison.trim()) {
                    alert('Veuillez indiquer l\'heure désirée de livraison.');
                    return;
                  }
                  if (isHeureInPast(heureLivraison.trim())) {
                    setTimeError('L\'heure souhaitée doit être ultérieure à l\'heure actuelle.');
                    return;
                  }
                  setTimeError('');
                  setSubmitting(true);
                  try {
const r = await fetch(API_ENDPOINTS.COMMANDE, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
                  body: JSON.stringify({
                        items: cart.map((i) => ({ id: i.id, name: i.name, price: priceToSend(i.price), qte: 1 })),
                        livraison: heureLivraison.trim(),
                        paiement,
                        supplement: supplement > 0 ? supplement : undefined,
                      }),
                    });
                    const json = await r.json();
                    if (json.success) {
                      setOrderConfirmed({ totalFinal });
                    } else {
                      if (r.status === 401) {
                        logout();
                        setShowCart(false);
                        alert('Session expirée. Veuillez vous reconnecter pour commander.');
                        return;
                      }
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
            </>
          )}
          {orderConfirmed && (
            <div className="cart-confirmation">
              <p className="cart-confirmation-total">
                Le montant total de votre commande est de <strong>{orderConfirmed.totalFinal.toFixed(2)} EUR</strong>. Merci et d'avance, bon appétit !
              </p>
              <p className="cart-confirmation-disclaimer">
                La livraison de votre commande à l'heure désirée n'est pas garantie et ne donne en aucun cas droit au remboursement de votre commande si celle-ci n'est pas respectée.
              </p>
              <button
                type="button"
                className="cart-confirmation-accept"
                onClick={() => {
                  clearCart();
                  setShowCart(false);
                  setOrderConfirmed(null);
                  setPaiement('cash');
                  setHeureLivraison('');
                }}
              >
                Cliquez ici pour terminer et accepter ces conditions de vente
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
