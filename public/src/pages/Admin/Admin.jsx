import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Check, X } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import AdminHeader from './AdminHeader';
import ClientPhone from './ClientPhone';
import './Admin.css';

const REFRESH_INTERVAL = 15000; // 15 secondes

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
};

const formatHeure = (h) => {
  if (!h) return '-';
  const s = String(h);
  if (s.length >= 5) return s.substring(0, 5);
  return s;
};

const OrderCard = ({ order, onAccept, onRefuse, loading }) => (
  <div className="admin-order-card">
    <div className="admin-order-header">
      <span className="admin-order-id">#{order.id}</span>
      <span className="admin-order-date">{formatDate(order.date)} {formatHeure(order.heure)}</span>
    </div>
    <div className="admin-order-infos">
      <p><strong>{order.prenom} {order.nom}</strong></p>
      <p>Tél: {order.telephone || order.numero || '-'}</p>
      <p>{order.adresse || '-'}</p>
      {order.rem && <p className="admin-order-rem">{order.rem}</p>}
      <p>{order.cp} {order.localite}</p>
      <p>Email: {order.mail || '-'}</p>
      <p>Livraison souhaitée: {order.livraison || '-'}</p>
      <p>Paiement: {order.paiement || 'cash'}</p>
    </div>
    <div className="admin-order-lignes">
      <h4>Articles</h4>
      {order.lignes?.map((l, i) => (
        <div key={i} className="admin-order-ligne">
          {l.qte} x {l.nom} = {(parseFloat(l.tot) || 0).toFixed(2)} €
        </div>
      ))}
    </div>
    <div className="admin-order-total">
      Total: <strong>{(order.total_commande || 0).toFixed(2)} €</strong>
    </div>
    <div className="admin-order-actions">
      <button
        className="admin-btn admin-btn-accept"
        onClick={() => onAccept(order.id)}
        disabled={loading}
        title="Accepter la commande"
      >
        <Check size={18} />
        Accepter
      </button>
      <button
        className="admin-btn admin-btn-refuse"
        onClick={() => onRefuse(order.id)}
        disabled={loading}
        title="Refuser la commande"
      >
        <X size={18} />
        Refuser
      </button>
    </div>
  </div>
);

const Admin = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [error, setError] = useState(null);
  const audioRef = useRef(null);
  const prevCountRef = useRef(0);
  const hasPlayedRef = useRef(false);

  const fetchOrders = useCallback(async () => {
    try {
      const r = await fetch(`${API_ENDPOINTS.ADMIN}?action=orders`);
      const json = await r.json();
      if (json.success) {
        setOrders(json.data || []);
        setError(null);
        return json.count || 0;
      }
      setError(json.error || 'Erreur chargement');
      return 0;
    } catch (e) {
      setError('Impossible de charger les commandes');
      return 0;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // En quittant l'admin : repasser en mode automatique (horaires)
  useEffect(() => {
    const setModeAuto = () => {
      fetch(API_ENDPOINTS.ACTIF, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actif: 2 }),
        keepalive: true,
      });
    };
    const onBeforeUnload = () => setModeAuto();
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', onBeforeUnload);
      setModeAuto();
    };
  }, []);

  // Auto-refresh 15 secondes
  useEffect(() => {
    const id = setInterval(fetchOrders, REFRESH_INTERVAL);
    return () => clearInterval(id);
  }, [fetchOrders]);

  // Son quand commandes en attente
  useEffect(() => {
    const count = orders.length;
    if (count > 0 && count > prevCountRef.current && !hasPlayedRef.current) {
      hasPlayedRef.current = true;
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.value = 880;
        gain.gain.value = 0.15;
        osc.start();
        osc.stop(ctx.currentTime + 0.2);
      } catch (_) {}
    }
    prevCountRef.current = count;
    if (count === 0) hasPlayedRef.current = false;
  }, [orders.length]);

  const handleAccept = async (id) => {
    setActionLoading(id);
    try {
      const r = await fetch(`${API_ENDPOINTS.ADMIN}?action=accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await r.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert(json.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefuse = async (id) => {
    if (!window.confirm('Refuser cette commande ?')) return;
    setActionLoading(id);
    try {
      const r = await fetch(`${API_ENDPOINTS.ADMIN}?action=refuse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await r.json();
      if (json.success) {
        setOrders((prev) => prev.filter((o) => o.id !== id));
      } else {
        alert(json.error || 'Erreur');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setActionLoading(null);
    }
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchOrders();
  };

  return (
    <div className="admin-page">
      <AdminHeader />
      <main className="admin-main">
        {/* Section A - Commandes en ligne */}
        <section className="admin-section admin-section-online">
          <div className="admin-section-header">
            <h2>Commandes en attente = {orders.length}</h2>
            <button
              className="admin-refresh-btn"
              onClick={handleRefresh}
              disabled={loading}
              title="Rafraîchir"
            >
              <RefreshCw size={18} className={loading ? 'spin' : ''} />
              Rafraîchir
            </button>
          </div>

          {error && <p className="admin-error">{error}</p>}
          {loading && orders.length === 0 ? (
            <p className="admin-loading">Chargement des commandes…</p>
          ) : orders.length === 0 ? (
            <p className="admin-empty">Aucune commande en attente</p>
          ) : (
            <div className="admin-orders-grid">
              {orders.map((o) => (
                <OrderCard
                  key={o.id}
                  order={o}
                  onAccept={handleAccept}
                  onRefuse={handleRefuse}
                  loading={actionLoading === o.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Section B - Commandes téléphone */}
        <section className="admin-section admin-section-phone">
          <h2>Commandes téléphone</h2>
          <ClientPhone />
        </section>
      </main>
    </div>
  );
};

export default Admin;
