import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminHeader.css';

const AdminHeader = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout } = useAdminAuth();
  const [ouvert, setOuvert] = useState(true);
  const [modeAuto, setModeAuto] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_ENDPOINTS.ACTIF}`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setOuvert(j.ouvert);
          setModeAuto(j.mode === 'auto');
        }
      })
      .catch(() => {});
  }, []);

  const toggleStatut = () => {
    setLoading(true);
    fetch(`${API_ENDPOINTS.ACTIF}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toggle: true }),
    })
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          setOuvert(j.ouvert);
          setModeAuto(j.mode === 'auto');
        }
      })
      .finally(() => setLoading(false));
  };

  return (
    <header className="admin-header">
      <div className="admin-header-container">
        <Link to="/" className="admin-logo">
          PIZZA SERVICE <span className="admin-logo-gold">NAMUR</span>
        </Link>

        <div className="admin-status">
          <span className={`admin-status-badge ${modeAuto ? 'auto' : ''} ${ouvert ? 'ouvert' : 'ferme'}`}>
            {modeAuto ? `Automatique (${ouvert ? 'Ouverte' : 'Fermée'})` : (ouvert ? 'Ouverte' : 'Fermée')}
          </span>
          <button
            className="admin-status-btn"
            onClick={toggleStatut}
            disabled={loading}
            title={ouvert ? 'Fermer la pizzeria' : 'Ouvrir la pizzeria'}
          >
            {loading ? '…' : ouvert ? 'Fermer' : 'Ouvrir'}
          </button>
        </div>

        <nav className="admin-nav">
          <Link to="/admin" className={`admin-nav-link ${location.pathname === '/admin' ? 'active' : ''}`}>Admin</Link>
          <Link to="/admin/ventes" className={`admin-nav-link ${location.pathname === '/admin/ventes' ? 'active' : ''}`}>Ventes</Link>
          <Link to="/menu" className="admin-nav-link">Carte</Link>
          <Link to="/" className="admin-nav-link">Accueil</Link>
          <button
            className="admin-nav-logout"
            onClick={() => { logout(); navigate('/admin/login'); }}
            title="Déconnexion"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </nav>
      </div>
    </header>
  );
};

export default AdminHeader;
