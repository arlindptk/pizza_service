import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
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

const VentesDuJour = () => {
  const { getAdminAuthHeaders } = useAdminAuth();
  const [ventes, setVentes] = useState([]);
  const [date, setDate] = useState(formatDate(new Date()));
  const [loading, setLoading] = useState(true);
  const [filterTelephone, setFilterTelephone] = useState('');
  const [filterNom, setFilterNom] = useState('');
  const [inputTel, setInputTel] = useState('');
  const [inputNom, setInputNom] = useState('');
  const [orderConfirmed, setOrderConfirmed] = useState(null);

  const exportFactureExcel = async (id) => {
    try {
      const url = `${API_ENDPOINTS.ADMIN}?action=export_facture&id=${id}`;
      const r = await fetch(url, { headers: getAdminAuthHeaders() });
    if (!r.ok) {
      alert('Erreur lors de l\'export.');
      return;
    }
    const blob = await r.blob();
    const disposition = r.headers.get('Content-Disposition');
    const filename = (disposition && disposition.match(/filename="?([^";\n]+)"?/)?.[1]) || `facture_${id}.csv`;
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  } catch (e) {
    alert('Erreur lors de l\'export.');
  }
  };

  const VenteCard = ({ order }) => (
    <div className="vente-card">
      <div className="vente-card-header">
        <span className="vente-card-badge">Commande acceptée</span>
        <button
          type="button"
          className="vente-card-export-btn"
          onClick={() => exportFactureExcel(order.id)}
          title="Exporter la facture en Excel"
        >
          <FileSpreadsheet size={18} />
          Exporter Excel
        </button>
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

  const fetchVentes = useCallback(async () => {
    setLoading(true);
    try {
      let url = `${API_ENDPOINTS.ADMIN}?action=ventes&date=${encodeURIComponent(date)}`;
      if (filterTelephone.trim()) url += `&telephone=${encodeURIComponent(filterTelephone.trim())}`;
      if (filterNom.trim()) url += `&nom=${encodeURIComponent(filterNom.trim())}`;
      const r = await fetch(url, { headers: getAdminAuthHeaders() });
      const j = await r.json();
      if (j.success) {
        setVentes(j.data || []);
      }
    } catch (e) {
      setVentes([]);
    } finally {
      setLoading(false);
    }
  }, [date, filterTelephone, filterNom]);

  useEffect(() => {
    fetchVentes();
  }, [fetchVentes]);

  const handleRechercher = () => {
    setFilterTelephone(inputTel.trim());
    setFilterNom(inputNom.trim());
  };

  const handleReset = () => {
    setInputTel('');
    setInputNom('');
    setFilterTelephone('');
    setFilterNom('');
  };

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
          LISTE DES COMMANDES {dateDisplay}
        </h1>

        <div className="ventes-filters">
          <div className="ventes-filter-row">
            <label className="ventes-filter-label">Date</label>
            <input
              type="date"
              className="ventes-filter-input"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div className="ventes-filter-row">
            <label className="ventes-filter-label">Téléphone</label>
            <input
              type="text"
              className="ventes-filter-input"
              placeholder="Ex: 0471 23 45 67"
              value={inputTel}
              onChange={(e) => setInputTel(e.target.value)}
            />
          </div>
          <div className="ventes-filter-row">
            <label className="ventes-filter-label">Nom</label>
            <input
              type="text"
              className="ventes-filter-input"
              placeholder="Nom ou prénom du client"
              value={inputNom}
              onChange={(e) => setInputNom(e.target.value)}
            />
          </div>
          <div className="ventes-filter-actions">
            <button type="button" className="ventes-filter-btn" onClick={handleRechercher}>
              Rechercher
            </button>
            <button type="button" className="ventes-filter-btn ventes-filter-btn-reset" onClick={handleReset}>
              Réinitialiser
            </button>
          </div>
        </div>

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
