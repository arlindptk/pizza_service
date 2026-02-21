import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingBag, LogOut } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { useCart } from '../../../context/CartContext';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const { cart, total, setShowCart, clearCart } = useCart();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''}`}>
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">PIZZA SERVICE <span className="gold-text">NAMUR</span></span>
        </Link>

        <nav className={`nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Accueil
          </Link>
          <Link 
            to="/menu" 
            className={`nav-link ${isActive('/menu') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Menu
          </Link>
          <Link 
            to="/find-us" 
            className={`nav-link ${isActive('/find-us') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Nous Trouver
          </Link>
          <Link 
            to="/login" 
            className={`nav-link ${isActive('/login') ? 'active' : ''}`}
            onClick={() => setIsMobileMenuOpen(false)}
          >
            {isAuthenticated ? `Bonjour ${user?.prenom || ''}` : 'Commander en ligne'}
          </Link>
        </nav>

        {isAuthenticated && (
          <button 
            className="header-logout-btn"
            onClick={() => { logout(); clearCart(); setShowCart(false); setIsMobileMenuOpen(false); }}
            aria-label="Déconnexion"
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        )}

        <button 
          className="cart-button"
          onClick={() => {
            if (isAuthenticated) {
              setShowCart(true);
            } else {
              navigate('/login', { state: { from: 'cart', message: 'Connectez-vous pour accéder au panier' } });
            }
          }}
          aria-label="Ouvrir le panier"
          title={isAuthenticated ? 'Voir le panier' : 'Connectez-vous pour commander'}
        >
          <ShoppingBag size={18} />
          <span className="cart-count">{cart.length}</span>
          <span className="cart-total-text">• {total.toFixed(2)}€</span>
        </button>

        <button 
          className="mobile-menu-toggle"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>
    </header>
  );
};

export default Header;
