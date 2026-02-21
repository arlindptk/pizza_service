import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAdminAuth } from '../../context/AdminAuthContext';
import './AdminLogin.css';

const AdminLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAdminAuth();
  const [identifiant, setIdentifiant] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!identifiant || !password) {
      setError('Identifiant et mot de passe requis');
      return;
    }
    setLoading(true);
    try {
      const r = await fetch(`${API_ENDPOINTS.AUTH}?action=admin_login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifiant, password }),
      });
      const j = await r.json();
      if (j.success && j.admin) {
        login(j.user);
        navigate(from, { replace: true });
      } else {
        setError(j.error || 'Connexion refusée');
      }
    } catch (e) {
      setError('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <div className="admin-login-box">
        <h1>Admin</h1>
        <p className="admin-login-subtitle">Pizza Service Namur</p>
        <form onSubmit={handleSubmit} className="admin-login-form">
          <label>
            <span>Identifiant</span>
            <input
              type="text"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              autoComplete="username"
              autoFocus
              disabled={loading}
            />
          </label>
          <label>
            <span>Mot de passe</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              disabled={loading}
            />
          </label>
          {error && <p className="admin-login-error">{error}</p>}
          <button type="submit" disabled={loading} className="admin-login-btn">
            <LogIn size={18} />
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>
        <a href="/" className="admin-login-back">← Retour au site</a>
      </div>
    </div>
  );
};

export default AdminLogin;
