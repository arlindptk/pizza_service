import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Save, ShoppingCart } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import './ClientPhone.css';

const ClientPhone = () => {
  const navigate = useNavigate();
  const [telSearch, setTelSearch] = useState('');
  const [client, setClient] = useState(null);
  const [searching, setSearching] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localites, setLocalites] = useState({ byCp: {}, data: [] });

  const [form, setForm] = useState({
    numc: 0,
    tel1: '',
    nom: '',
    prenom: '',
    ad1: '',
    ad2: '',
    cp: '',
    ville: '',
    email: '',
    fidel: 0,
    comm: '',
  });

  useEffect(() => {
    fetch(`${API_ENDPOINTS.CLIENT}?action=localites`)
      .then((r) => r.json())
      .then((j) => {
        if (j.success && j.byCp) setLocalites({ byCp: j.byCp, data: j.data || [] });
      })
      .catch(() => {});
  }, []);

  const handleSearch = async () => {
    const tel = telSearch.replace(/\D/g, '');
    if (tel.length < 3) {
      alert('Saisissez au moins 3 chiffres');
      return;
    }
    setSearching(true);
    setSaved(false);
    try {
      const r = await fetch(`${API_ENDPOINTS.CLIENT}?action=search&tel=${encodeURIComponent(tel)}`);
      const j = await r.json();
      if (j.success) {
        if (j.found && j.client) {
          setClient(j.client);
          setForm({
            numc: j.client.numc,
            tel1: j.client.tel1 || '',
            nom: j.client.nom || '',
            prenom: j.client.prenom || '',
            ad1: j.client.ad1 || '',
            ad2: j.client.ad2 || '',
            cp: j.client.cp || '',
            ville: j.client.ville || '',
            email: j.client.email || '',
            fidel: j.client.fidel || 0,
            comm: j.client.comm || '',
          });
        } else {
          setClient({ numc: 0, tel1: tel });
          setForm({
            numc: 0,
            tel1: tel,
            nom: '',
            prenom: '',
            ad1: '',
            ad2: '',
            cp: '',
            ville: '',
            email: '',
            fidel: 0,
            comm: '',
          });
        }
      } else {
        alert(j.message ? `${j.error}\n\n${j.message}` : (j.error || 'Erreur recherche'));
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const r = await fetch(`${API_ENDPOINTS.CLIENT}?action=save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const j = await r.json();
      if (j.success) {
        setSaved(true);
        setForm((f) => ({ ...f, numc: j.numc }));
      } else {
        alert(j.error || 'Erreur enregistrement');
      }
    } catch (e) {
      alert('Erreur réseau');
    } finally {
      setSaving(false);
    }
  };

  const handleCommander = () => {
    if (!saved && !client?.numc) {
      alert('Enregistrez d\'abord le client.');
      return;
    }
    navigate('/admin/commande-telephone', {
      state: {
        create_facture: 1,
        tel: form.tel1 || client?.tel1,
        numc: form.numc || client?.numc,
        client: { ...form, ...client },
      },
    });
  };

  const cpList = [...new Set(localites.data.map((l) => l.cp_localite))].sort();
  const villesForCp = (form.cp && localites.byCp[form.cp]) ? localites.byCp[form.cp] : [];

  return (
    <div className="client-phone">
      <h3>Recherche client</h3>
      <div className="client-search">
        <input
          type="tel"
          placeholder="Téléphone"
          value={telSearch}
          onChange={(e) => setTelSearch(e.target.value.replace(/\D/g, '').slice(0, 20))}
          maxLength={20}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <button onClick={handleSearch} disabled={searching}>
          <Search size={16} />
          Vérifier
        </button>
      </div>

      {client && (
        <div className="client-form-block">
          {saved ? (
            <div className="client-readonly">
              <p><strong>{form.prenom} {form.nom}</strong></p>
              <p>Tél: {form.tel1}</p>
              <p>{form.ad1} {form.ad2}</p>
              <p>{form.cp} {form.ville}</p>
              <p>Email: {form.email}</p>
              {form.fidel > 0 && <p>Points fidélité: {form.fidel}</p>}
              {form.comm && <p className="client-comm">{form.comm}</p>}
              <button className="client-btn-commander" onClick={handleCommander}>
                <ShoppingCart size={18} />
                Commander
              </button>
              <button
                type="button"
                className="client-btn-edit"
                onClick={() => setSaved(false)}
              >
                Modifier
              </button>
            </div>
          ) : (
            <form
              className="client-form"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <label>
                <span>Téléphone</span>
                <input
                  type="tel"
                  value={form.tel1}
                  onChange={(e) => setForm((f) => ({ ...f, tel1: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  maxLength={10}
                />
              </label>
              <label>
                <span>Nom</span>
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                />
              </label>
              <label>
                <span>Prénom</span>
                <input
                  type="text"
                  value={form.prenom}
                  onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                />
              </label>
              <label>
                <span>Adresse 1</span>
                <input
                  type="text"
                  value={form.ad1}
                  onChange={(e) => setForm((f) => ({ ...f, ad1: e.target.value }))}
                />
              </label>
              <label>
                <span>Adresse 2</span>
                <input
                  type="text"
                  value={form.ad2}
                  onChange={(e) => setForm((f) => ({ ...f, ad2: e.target.value }))}
                />
              </label>
              <label>
                <span>Code postal</span>
                <select
                  value={form.cp}
                  onChange={(e) => setForm((f) => ({ ...f, cp: e.target.value, ville: '' }))}
                >
                  <option value="">—</option>
                  {cpList.map((cp) => (
                    <option key={cp} value={cp}>{cp}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>Localité</span>
                <select
                  value={form.ville}
                  onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                >
                  <option value="">—</option>
                  {villesForCp.map((v) => (
                    <option key={v} value={v}>{v}</option>
                  ))}
                </select>
              </label>
              <label>
                <span>E-mail</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                />
              </label>
              <label>
                <span>Points fidélité</span>
                <input
                  type="number"
                  min="0"
                  value={form.fidel}
                  onChange={(e) => setForm((f) => ({ ...f, fidel: parseInt(e.target.value, 10) || 0 }))}
                />
              </label>
              <label>
                <span>Commentaires</span>
                <textarea
                  value={form.comm}
                  onChange={(e) => setForm((f) => ({ ...f, comm: e.target.value }))}
                  rows={3}
                />
              </label>
              <button type="submit" disabled={saving}>
                <Save size={16} />
                {saving ? 'Enregistrement…' : 'Enregistrer'}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientPhone;
