import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
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
  const [step, setStep] = useState('initial'); // 'initial', 'login', 'postal', 'register'
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

  // Charger les localités depuis l'API quand le code postal change
  useEffect(() => {
    const fetchLocalites = async () => {
      if (postalData.codePostal && postalData.codePostal.length === 4) {
        try {
          const response = await fetch(
            `${API_ENDPOINTS.AUTH}?action=localites&code_postal=${postalData.codePostal}`
          );
          const result = await response.json();
          
          if (result.success && result.data.length > 0) {
            setLocalites(result.data);
          } else {
            // Fallback sur les données statiques
            setLocalites(DELIVERY_ZONES[postalData.codePostal] || []);
          }
        } catch (err) {
          console.error('Erreur API localités:', err);
          // Fallback sur les données statiques
          setLocalites(DELIVERY_ZONES[postalData.codePostal] || []);
        }
      } else {
        setLocalites([]);
      }
    };

    fetchLocalites();
  }, [postalData.codePostal]);

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
    setRegisterData({
      ...registerData,
      [e.target.name]: e.target.value,
    });
    // Effacer les messages d'erreur lors de la saisie
    if (errors[e.target.name]) {
      const newErrors = { ...errors };
      delete newErrors[e.target.name];
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
        // Connexion réussie
        setSuccessMessage(`Bienvenue ${result.user.prenom} ${result.user.nom} ! Connexion réussie.`);
        setErrors({});
        // Réinitialiser le formulaire
        setLoginData({ identifiant: '', password: '' });
        // Ici vous pourriez stocker les infos utilisateur dans un contexte/state global
        // et rediriger vers une page de commande
        // Masquer le message après 5 secondes
        setTimeout(() => {
          setSuccessMessage('');
        }, 5000);
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

  const validatePostalCode = (codePostal) => {
    return DELIVERY_ZONES.hasOwnProperty(codePostal);
  };

  const handlePostalSubmit = (e) => {
    e.preventDefault();
    const codePostal = postalData.codePostal.trim();
    
    if (!validatePostalCode(codePostal)) {
      setErrors({ postal: 'Malheureusement, nous ne desservons pas cette zone' });
      return;
    }

    setErrors({});
    setRegisterData(prev => ({ ...prev, codePostal }));
    setStep('register');
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    // Vérifier que le code postal est valide
    if (!validatePostalCode(registerData.codePostal)) {
      newErrors.codePostal = 'Code postal non valide';
    }

    // Vérifier que la localité est sélectionnée
    if (!registerData.localite) {
      newErrors.localite = 'Veuillez sélectionner une localité';
    }

    // Vérifier que la localité correspond au code postal
    if (registerData.codePostal && registerData.localite) {
      const localitesList = localites.length > 0 ? localites : (DELIVERY_ZONES[registerData.codePostal] || []);
      if (!localitesList.includes(registerData.localite)) {
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

  return (
    <div className="login-page">
      <div className="login-container">
        <Link to="/" className="login-back-link">
          <ArrowLeft size={20} />
          Retour à l'accueil
        </Link>

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
                  <Link to="#" className="forgot-password">
                    Mot de passe perdu ?
                  </Link>
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
                <Link to="#" className="forgot-password">
                  Mot de passe perdu ?
                </Link>
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
