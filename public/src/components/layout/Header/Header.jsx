import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { cart, total, setShowCart } = useCart();

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
            Commander en ligne
          </Link>
        </nav>

        <button 
          className="cart-button"
          onClick={() => setShowCart(true)}
          aria-label="Ouvrir le panier"
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
