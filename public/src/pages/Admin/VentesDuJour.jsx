import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import AdminHeader from './AdminHeader';
import './VentesDuJour.css';

const formatDate = (d) => {
  if (!d) return '-';
  const date = new Date(d);
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
};

const formatHeure = (h) => {
  if (!h) return '-';
  const s = String(h);
  if (s.length >= 8) return s.substring(0, 8);
  if (s.length >= 5) return s.substring(0, 5);
  return s;
};

const formatTel = (tel) => {
  if (!tel) return '';
  const digits = String(tel).replace(/\D/g, '');
  if (digits.length >= 9) return `+32${digits.slice(-9)}`;
  return tel;
};

const VenteCard = ({ order }) => (
  <div className="vente-card">
    <div className="vente-card-header">
      <span className="vente-card-badge">Commande acceptée</span>
    </div>
    <p className="vente-card-heure">
      Heure: {formatHeure(order.heure)} - {formatTel(order.telephone || order.numero)}
    </p>
    <p className="vente-card-client">
      {order.prenom || order.nom ? (
        <>
          {order.prenom} {order.nom}
          {(order.adresse || order.cp || order.localite) && (
            <> - {order.adresse || ''}{order.adresse && (order.cp || order.localite) ? ' - ' : ''}{order.cp ? `B-${order.cp} ` : ''}{order.localite || ''}</>
          )}
        </>
      ) : (
        <>Client tél. - {formatTel(order.telephone || order.numero)}</>
      )}
    </p>
    <ul className="vente-card-lignes">
      {order.lignes?.map((l, i) => (
        <li key={i}>
          - {l.qte} x {l.nom} = {(parseFloat(l.tot) || 0).toFixed(2)}
        </li>
      ))}
    </ul>
    <p className="vente-card-total">
      Total: {(order.total_commande || 0).toFixed(2)} €
    </p>
  </div>
);

const VentesDuJour = () => {
  const [ventes, setVentes] = useState([]);
  const [date, setDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(true);

  const fetchVentes = useCallback(async () => {
    try {
      const r = await fetch(`${API_ENDPOINTS.ADMIN}?action=ventes&date=${date}`);
      const j = await r.json();
      if (j.success) {
        setVentes(j.data || []);
      }
    } catch (e) {
      setVentes([]);
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    fetchVentes();
  }, [fetchVentes]);

  const [yyyy, mm, dd] = date.split('-');
  const dateDisplay = `${dd}-${mm}-${yyyy}`;

  return (
    <div className="admin-page ventes-page">
      <AdminHeader />
      <main className="admin-main">
        <Link to="/admin" className="ventes-back">
          <ArrowLeft size={18} />
          retour
        </Link>

        <h1 className="ventes-title">
          LISTE DES COMMANDES DU JOUR {dateDisplay} (retour)
        </h1>

        {loading ? (
          <p className="admin-loading">Chargement…</p>
        ) : ventes.length === 0 ? (
          <p className="admin-empty">Aucune commande acceptée pour cette date</p>
        ) : (
          <div className="ventes-list">
            {ventes.map((o) => (
              <VenteCard key={o.id} order={o} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default VentesDuJour;
