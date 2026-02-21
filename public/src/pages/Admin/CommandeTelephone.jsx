import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import AdminHeader from './AdminHeader';
import './CommandeTelephone.css';

const CommandeTelephone = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { client, tel, numc } = location.state || {};
  const [menu, setMenu] = useState({});
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [livraison, setLivraison] = useState('');
  const [paiement, setPaiement] = useState('cash');

  useEffect(() => {
    if (!tel && !client?.tel1) {
      navigate('/admin');
      return;
    }
    fetch(API_ENDPOINTS.MENU)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.data) setMenu(j.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [navigate, tel, client?.tel1]);

  const addItem = (product, category) => {
    setItems((prev) => [...prev, { id: Date.now(), name: product.name, price: product.price, cat: category }]);
  };

  const removeItem = (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const total = items.reduce((s, i) => s + i.price, 0);

  const handleSubmit = async () => {
    if (items.length === 0) {
      alert('Ajoutez au moins un article.');
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch(API_ENDPOINTS.COMMANDE_PHONE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tel: client?.tel1 || tel,
          items: items.map((i) => ({ name: i.name, price: i.price, qte: 1 })),
          livraison,
          paiement,
        }),
      });
      const j = await r.json();
      if (j.success) {
        alert('Commande enregistrée. Elle apparaît dans les commandes en attente.');
        navigate('/admin');
      } else {
        alert(j.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setSubmitting(false);
    }
  };

  const t = client?.tel1 || tel;
  if (!t) return null;

  const categories = Object.entries(menu);

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="admin-main commande-telephone-main">
        <button className="commande-telephone-back" onClick={() => navigate('/admin')}>
          <ArrowLeft size={18} />
          Retour admin
        </button>

        <section className="commande-telephone-client">
          <h2>Client : {client?.prenom} {client?.nom} — {t}</h2>
          {client?.ad1 && <p>{client.ad1} {client.ad2}, {client.cp} {client.ville}</p>}
        </section>

        <div className="commande-telephone-grid">
          <section className="commande-telephone-menu">
            <h3>Menu</h3>
            {loading ? (
              <p className="admin-loading">Chargement du menu…</p>
            ) : (
              <div className="commande-telephone-cats">
                {categories.map(([cat, products]) => (
                  <div key={cat} className="commande-telephone-cat">
                    <h4>{cat}</h4>
                    <ul>
                      {products.map((p, idx) => (
                        <li key={idx}>
                          <button type="button" onClick={() => addItem(p, cat)}>
                            <Plus size={14} />
                            {p.name} — {p.price.toFixed(2)} €
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="commande-telephone-panier">
            <h3>Commande</h3>
            {items.length === 0 ? (
              <p className="admin-empty">Vide</p>
            ) : (
              <ul className="commande-telephone-items">
                {items.map((i) => (
                  <li key={i.id}>
                    <span>{i.name} — {i.price.toFixed(2)} €</span>
                    <button type="button" onClick={() => removeItem(i.id)} aria-label="Retirer">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="commande-telephone-total">
              Total : <strong>{total.toFixed(2)} €</strong>
            </div>
            <label>
              <span>Heure livraison</span>
              <input
                type="text"
                placeholder="ex. 19h30"
                value={livraison}
                onChange={(e) => setLivraison(e.target.value)}
              />
            </label>
            <label>
              <span>Paiement</span>
              <select value={paiement} onChange={(e) => setPaiement(e.target.value)}>
                <option value="cash">Espèces</option>
                <option value="carte">Carte</option>
              </select>
            </label>
            <button
              className="commande-telephone-submit"
              onClick={handleSubmit}
              disabled={items.length === 0 || submitting}
            >
              {submitting ? 'Envoi…' : 'Enregistrer la commande'}
            </button>
          </section>
        </div>
      </main>
    </div>
  );
};

export default CommandeTelephone;
