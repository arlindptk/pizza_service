import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { useAuth } from '../../context/AuthContext';
import './Login.css';

// Zones de livraison autorisées (fallback si API indisponible)
const DELIVERY_ZONES = {
  '5000': ['Beez', 'Namur', 'Salzinnes'],
  '5001': ['Belgrade'],
  '5002': ['Saint-Servais'],
  '5003': ['Saint-Marc'],
  '5004': ['Bouge'],
  '5020': ['Champion', 'Daussoulx', 'Flawinne', 'Malonne', 'Suarlee', 'Temploux', 'Vedrin'],
  '5021': ['Boninne'],
  '5022': ['Cognelee'],
  '5080': ['Emines', 'Rhisnes', 'Villers-les-Heest', 'Warisoulx'],
  '5100': ['Dave', 'Jambes', 'Nannine', 'Wierde', 'Wepion'],
  '5101': ['Erpent'],
  '5150': ['Floriffoux', 'Franiere'],
  '5310': ['Waret-La-Chaussee'],
  '5380': ['Marchovelette'],
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login: authLogin } = useAuth();
  const [step, setStep] = useState('initial'); // 'initial', 'login', 'postal', 'register', 'forgot'
  const redirectMessage = location.state?.message;
  const [isOpen, setIsOpen] = useState(null); // null = loading, true/false = horaires
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [localites, setLocalites] = useState([]);
  const [loginData, setLoginData] = useState({
    identifiant: '',
    password: '',
  });
  const [postalData, setPostalData] = useState({
    codePostal: '',
  });
  const [forgotEmail, setForgotEmail] = useState('');
  const [registerData, setRegisterData] = useState({
    identifiant: '',
    password: '',
    nom: '',
    prenom: '',
    numero: '',
    rue: '',
    localite: '',
    codePostal: '',
    adresseEmail: '',
    telephone: '',
    personneContact: '',
    remarque: '',
  });

  // Vérifier les horaires d'ouverture
  useEffect(() => {
    const fetchHours = async () => {
      try {
        const res = await fetch(API_ENDPOINTS.HOURS);
        const data = await res.json();
        setIsOpen(data.open ?? true);
      } catch {
        setIsOpen(true); // En cas d'erreur, autoriser l'accès
      }
    };
    fetchHours();
  }, []);

  // Charger les localités depuis l'API (base de données) selon le code postal affiché :
  // - à l'étape "inscription", utiliser le code postal du formulaire d'inscription
  // - à l'étape "code postal", utiliser le code postal de l'étape
  useEffect(() => {
    const codePostal = (step === 'register' ? registerData.codePostal : postalData.codePostal)?.trim?.() || '';
    if (codePostal.length !== 4) {
      setLocalites([]);
      return;
    }
    const fetchLocalites = async () => {
      try {
        const response = await fetch(
          `${API_ENDPOINTS.AUTH}?action=localites&code_postal=${encodeURIComponent(codePostal)}`
        );
        const result = await response.json();
        if (result.success && Array.isArray(result.data) && result.data.length > 0) {
          setLocalites(result.data);
        } else {
          setLocalites(DELIVERY_ZONES[codePostal] || []);
        }
      } catch (err) {
        console.error('Erreur API localités:', err);
        setLocalites(DELIVERY_ZONES[codePostal] || []);
      }
    };
    fetchLocalites();
  }, [step, registerData.codePostal, postalData.codePostal]);

  const handleLoginChange = (e) => {
    setLoginData({
      ...loginData,
      [e.target.name]: e.target.value,
    });
    // Effacer les messages d'erreur et de succès lors de la saisie
    if (errors.general) setErrors({});
    if (successMessage) setSuccessMessage('');
  };

  const handlePostalChange = (e) => {
    setPostalData({
      ...postalData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegisterChange = (e) => {
    const { name, value } = e.target;
    setRegisterData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'codePostal') next.localite = '';
      return next;
    });
    if (errors[name]) {
      const newErrors = { ...errors };
      delete newErrors[name];
      setErrors(newErrors);
    }
    if (errors.general) setErrors({});
    if (successMessage) setSuccessMessage('');
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.identifiant.trim() || !loginData.password) {
      setErrors({ general: 'Veuillez remplir tous les champs' });
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}?action=login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
      });

      const result = await response.json();

      if (result.success) {
        authLogin(result.user, result.token);
        setSuccessMessage(`Bienvenue ${result.user.prenom} ${result.user.nom} ! Redirection...`);
        setErrors({});
        setLoginData({ identifiant: '', password: '' });
        setTimeout(() => {
          navigate('/menu');
          setSuccessMessage('');
        }, 1000);
      } else {
        setErrors({ general: result.error || 'Erreur de connexion' });
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setErrors({ general: 'Erreur de connexion au serveur. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      setErrors({ email: 'Veuillez entrer votre adresse email' });
      return;
    }
    setLoading(true);
    setErrors({});
    setSuccessMessage('');
    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}?action=forgot_password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim() }),
      });
      const result = await response.json();
      if (result.success) {
        setSuccessMessage(result.message || 'Vérifiez votre boîte email.');
        setForgotEmail('');
      } else {
        setErrors({ general: result.error || 'Une erreur est survenue' });
      }
    } catch (err) {
      setErrors({ general: 'Erreur de connexion au serveur.' });
    } finally {
      setLoading(false);
    }
  };

  const validatePostalCode = (codePostal) => {
    return DELIVERY_ZONES.hasOwnProperty(codePostal);
  };

  const handlePostalSubmit = async (e) => {
    e.preventDefault();
    const codePostal = postalData.codePostal.trim();
    if (codePostal.length !== 4) {
      setErrors({ postal: 'Veuillez entrer un code postal de 4 chiffres' });
      return;
    }
    if (validatePostalCode(codePostal)) {
      setErrors({});
      setRegisterData((prev) => ({ ...prev, codePostal }));
      setStep('register');
      return;
    }
    setErrors({ postal: 'Vérification du code postal…' });
    try {
      const response = await fetch(
        `${API_ENDPOINTS.AUTH}?action=localites&code_postal=${encodeURIComponent(codePostal)}`
      );
      const result = await response.json();
      if (result.success && Array.isArray(result.data) && result.data.length > 0) {
        setErrors({});
        setRegisterData((prev) => ({ ...prev, codePostal }));
        setStep('register');
      } else {
        setErrors({ postal: 'Malheureusement, nous ne desservons pas cette zone' });
      }
    } catch {
      setErrors({ postal: 'Malheureusement, nous ne desservons pas cette zone' });
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Code postal : 4 chiffres et au moins une localité connue (API ou fallback)
    const cp = (registerData.codePostal || '').trim();
    if (cp.length !== 4) {
      newErrors.codePostal = 'Code postal non valide (4 chiffres)';
    } else {
      const localitesList = localites.length > 0 ? localites : (DELIVERY_ZONES[cp] || []);
      if (localitesList.length === 0) {
        newErrors.codePostal = 'Aucune localité pour ce code postal. Vérifiez le code ou contactez-nous.';
      }
    }

    // Vérifier que la localité est sélectionnée
    if (!registerData.localite) {
      newErrors.localite = 'Veuillez sélectionner une localité';
    }

    // Vérifier que la localité correspond au code postal
    if (cp && registerData.localite) {
      const localitesList = localites.length > 0 ? localites : (DELIVERY_ZONES[cp] || []);
      if (localitesList.length > 0 && !localitesList.includes(registerData.localite)) {
        newErrors.localite = 'Localité non valide pour ce code postal';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`${API_ENDPOINTS.AUTH}?action=register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(registerData),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage('Inscription réussie ! Vous pouvez maintenant vous connecter.');
        setErrors({});
        // Réinitialiser le formulaire après un court délai
        setTimeout(() => {
          setStep('initial');
          setRegisterData({
            identifiant: '',
            password: '',
            nom: '',
            prenom: '',
            numero: '',
            rue: '',
            localite: '',
            codePostal: '',
            adresseEmail: '',
            telephone: '',
            personneContact: '',
            remarque: '',
          });
          setSuccessMessage('');
        }, 3000);
      } else {
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setErrors({ general: result.error || 'Erreur lors de l\'inscription' });
        }
        setSuccessMessage('');
      }
    } catch (err) {
      console.error('Erreur API:', err);
      setErrors({ general: 'Erreur de connexion au serveur. Veuillez réessayer.' });
    } finally {
      setLoading(false);
    }
  };

  // Chargement des horaires
  if (isOpen === null) {
    return (
      <div className="login-page">
        <div className="login-container">
          <div className="login-card">
            <p className="login-loading">Vérification des horaires...</p>
          </div>
        </div>
      </div>
    );
  }

  // Fermé : afficher le message d'indisponibilité
  if (isOpen === false) {
    return (
      <div className="login-page">
        <div className="login-container">
          <Link to="/" className="login-back-link">
            <ArrowLeft size={20} />
            Retour à l'accueil
          </Link>
          <div className="login-card login-closed-card">
            <Clock size={48} className="login-closed-icon" />
            <h2>Hors horaires d'ouverture</h2>
            <p>L'inscription et la connexion sont disponibles uniquement pendant nos heures d'ouverture.</p>
            <p className="login-closed-hint">Consultez nos horaires sur la page « Nous Trouver ».</p>
            <Link to="/find-us" className="login-btn">Voir nos horaires</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>

        {redirectMessage && (
          <div className="login-redirect-banner">
            <AlertCircle size={16} />
            {redirectMessage}
          </div>
        )}

        {step === 'forgot' && (
          <div className="login-card">
            <div className="login-section-header">
              <h2>Mot de passe oublié</h2>
              <p>Entrez l'adresse email associée à votre compte. Vous recevrez un nouveau mot de passe par email.</p>
            </div>
            <form className="login-form" onSubmit={handleForgotSubmit}>
              <div className="form-group">
                <label htmlFor="forgot-email">Adresse email *</label>
                <input
                  type="email"
                  id="forgot-email"
                  value={forgotEmail}
                  onChange={(e) => { setForgotEmail(e.target.value); if (errors.email) setErrors({}); }}
                  placeholder="votre@email.com"
                  className={errors.email ? 'input-error' : ''}
                  required
                />
                {errors.email && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {errors.email}
                  </div>
                )}
              </div>
              {successMessage && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  {successMessage}
                </div>
              )}
              {errors.general && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Envoi en cours...' : 'Envoyer le nouveau mot de passe'}
              </button>
              <button
                type="button"
                className="login-btn-secondary"
                onClick={() => { setStep('initial'); setForgotEmail(''); setErrors({}); setSuccessMessage(''); }}
              >
                Retour
              </button>
            </form>
          </div>
        )}

        {step === 'initial' && (
          <>
            {/* Section Déjà enregistré */}
            <div className="login-card">
              <div className="login-section-header">
                <h2>Déjà enregistré ?</h2>
                <p>Si vous êtes déjà enregistré afin de pouvoir passer commande en ligne, indiquez votre identifiant et mot de passe</p>
              </div>
              <form className="login-form" onSubmit={handleLoginSubmit}>
                <div className="form-group">
                  <label htmlFor="identifiant-initial">
                    Identifiant *
                  </label>
                  <input
                    type="text"
                    id="identifiant-initial"
                    name="identifiant"
                    value={loginData.identifiant}
                    onChange={handleLoginChange}
                    required
                    placeholder="Votre identifiant"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="password-initial">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="password-initial"
                    name="password"
                    value={loginData.password}
                    onChange={handleLoginChange}
                    required
                    placeholder="Votre mot de passe"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <div className="form-group">
                  <button
                    type="button"
                    className="forgot-password"
                    onClick={() => { setStep('forgot'); setErrors({}); setSuccessMessage(''); }}
                  >
                    Mot de passe perdu ?
                  </button>
                </div>
                {successMessage && step === 'initial' && (
                  <div className="success-message">
                    <CheckCircle size={16} />
                    {successMessage}
                  </div>
                )}
                {errors.general && (
                  <div className="error-message">
                    <AlertCircle size={16} />
                    {errors.general}
                  </div>
                )}
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>
            </div>

            {/* Section Pas encore enregistré */}
            <div className="login-card">
              <div className="login-section-header">
                <h2>Vous n'êtes pas encore enregistré ?</h2>
                <p>Afin de vérifier si vous êtes situé dans la zone de livraison et vous inscrire, indiquez votre code postal</p>
              </div>
              <form className="login-form" onSubmit={handlePostalSubmit}>
                <div className="form-group">
                  <label htmlFor="codePostal">
                    Votre code postal *
                  </label>
                  <input
                    type="text"
                    id="codePostal"
                    name="codePostal"
                    value={postalData.codePostal}
                    onChange={handlePostalChange}
                    required
                    placeholder="Ex: 5000"
                    pattern="[0-9]{4}"
                    maxLength="4"
                    className={errors.postal ? 'input-error' : ''}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  {errors.postal && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.postal}
                    </div>
                  )}
                  {errors.general && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.general}
                    </div>
                  )}
                </div>
                <button type="submit" className="login-btn" disabled={loading}>
                  {loading ? 'Inscription...' : 'Vérifier et s\'inscrire'}
                </button>
              </form>
            </div>
          </>
        )}

        {step === 'login' && (
          <div className="login-card">
            <div className="login-section-header">
              <h2>Déjà enregistré ?</h2>
              <p>Si vous êtes déjà enregistré afin de pouvoir passer commande en ligne, indiquez votre identifiant et mot de passe</p>
            </div>
            <form className="login-form" onSubmit={handleLoginSubmit}>
              <div className="form-group">
                <label htmlFor="identifiant">
                  Identifiant *
                </label>
                <input
                  type="text"
                  id="identifiant"
                  name="identifiant"
                  value={loginData.identifiant}
                  onChange={handleLoginChange}
                  required
                  placeholder="Votre identifiant"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">
                  Mot de passe *
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  required
                  placeholder="Votre mot de passe"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
              <div className="form-group">
                <button
                  type="button"
                  className="forgot-password"
                  onClick={() => { setStep('forgot'); setErrors({}); setSuccessMessage(''); }}
                >
                  Mot de passe perdu ?
                </button>
              </div>
              <button type="submit" className="login-btn">
                Se connecter
              </button>
              <button 
                type="button" 
                className="login-btn-secondary"
                onClick={() => setStep('initial')}
              >
                Retour
              </button>
            </form>
          </div>
        )}

        {step === 'register' && (
          <div className="login-card">
            <div className="login-section-header">
              <h2>Enregistrez-vous ?</h2>
              <p>Pour nous permettre de vous servir au mieux, veuillez compléter de manière précise le formulaire ci-dessous (* champs obligatoires)</p>
            </div>
            <form className="login-form register-form" onSubmit={handleRegisterSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="register-identifiant">
                    Identifiant *
                  </label>
                  <input
                    type="text"
                    id="register-identifiant"
                    name="identifiant"
                    value={registerData.identifiant}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Votre identifiant"
                    className={errors.identifiant ? 'input-error' : ''}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  {errors.identifiant && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.identifiant}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="register-password">
                    Mot de passe *
                  </label>
                  <input
                    type="password"
                    id="register-password"
                    name="password"
                    value={registerData.password}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Votre mot de passe"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nom">
                    Nom *
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    value={registerData.nom}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Votre nom"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="prenom">
                    Prénom *
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    value={registerData.prenom}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Votre prénom"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="numero">
                    Numéro *
                  </label>
                  <input
                    type="text"
                    id="numero"
                    name="numero"
                    value={registerData.numero}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Ex: 454"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
                <div className="form-group form-group-wide">
                  <label htmlFor="rue">
                    Rue *
                  </label>
                  <input
                    type="text"
                    id="rue"
                    name="rue"
                    value={registerData.rue}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Ex: Chaussée de Louvain"
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group form-group-wide">
                  <label htmlFor="localite">
                    Localité *
                  </label>
                  <select
                    id="localite"
                    name="localite"
                    value={registerData.localite}
                    onChange={handleRegisterChange}
                    required
                    className={errors.localite ? 'input-error' : ''}
                    disabled={!registerData.codePostal || (localites.length === 0 && !DELIVERY_ZONES[registerData.codePostal])}
                  >
                    <option value="">Sélectionnez une localité</option>
                    {(localites.length > 0 ? localites : (registerData.codePostal && DELIVERY_ZONES[registerData.codePostal] ? DELIVERY_ZONES[registerData.codePostal] : [])).map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  {errors.localite && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.localite}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label htmlFor="register-codePostal">
                    Code postal *
                  </label>
                  <input
                    type="text"
                    id="register-codePostal"
                    name="codePostal"
                    value={registerData.codePostal}
                    onChange={handleRegisterChange}
                    required
                    placeholder="5000"
                    pattern="[0-9]{4}"
                    maxLength="4"
                    className={errors.codePostal ? 'input-error' : ''}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  {registerData.codePostal && (localites.length > 0 || DELIVERY_ZONES[registerData.codePostal]) && (
                    <span className="form-hint">
                      {registerData.codePostal} - {(localites.length > 0 ? localites : DELIVERY_ZONES[registerData.codePostal]).join(', ')}
                    </span>
                  )}
                  {errors.codePostal && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.codePostal}
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="adresseEmail">
                  Adresse email *
                </label>
                <input
                  type="email"
                  id="adresseEmail"
                  name="adresseEmail"
                  value={registerData.adresseEmail}
                  onChange={handleRegisterChange}
                  required
                  placeholder="votre@email.com"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="telephone">
                  Téléphone accessible *
                </label>
                  <input
                    type="tel"
                    id="telephone"
                    name="telephone"
                    value={registerData.telephone}
                    onChange={handleRegisterChange}
                    required
                    placeholder="Ex: 081739330"
                    pattern="[0-9]+"
                    className={errors.telephone ? 'input-error' : ''}
                    autoCapitalize="off"
                    autoCorrect="off"
                  />
                  <span className="form-hint">(chiffres uniquement, sans espace)</span>
                  {errors.telephone && (
                    <div className="error-message">
                      <AlertCircle size={16} />
                      {errors.telephone}
                    </div>
                  )}
              </div>

              <div className="form-group">
                <label htmlFor="personneContact">
                  Si société, personne à contacter
                </label>
                <input
                  type="text"
                  id="personneContact"
                  name="personneContact"
                  value={registerData.personneContact}
                  onChange={handleRegisterChange}
                  placeholder="Nom de la personne"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>

              <div className="form-group">
                <label htmlFor="remarque">
                  Remarque
                </label>
                <textarea
                  id="remarque"
                  name="remarque"
                  value={registerData.remarque}
                  onChange={handleRegisterChange}
                  placeholder="ex.: porte, sonnette sans nom,..."
                  rows="3"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>

              {successMessage && step === 'register' && (
                <div className="success-message">
                  <CheckCircle size={16} />
                  {successMessage}
                </div>
              )}
              {errors.general && (
                <div className="error-message">
                  <AlertCircle size={16} />
                  {errors.general}
                </div>
              )}
              <button type="submit" className="login-btn" disabled={loading}>
                {loading ? 'Inscription...' : 'Vérifier et s\'inscrire'}
              </button>
              <button 
                type="button" 
                className="login-btn-secondary"
                onClick={() => setStep('initial')}
              >
                Retour
              </button>
            </form>
          </div>
        )}

        <div className="login-promo-banner">
          <p>🎉 Profitez de <strong>5% de réduction</strong> sur tous vos plats après connexion !</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
