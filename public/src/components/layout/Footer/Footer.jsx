import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h3 className="footer-logo">
            PIZZA SERVICE <span className="gold-text">NAMUR</span>
          </h3>
          <p className="footer-description">
            Des pizzas artisanales préparées avec passion et des ingrédients frais de qualité.
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Navigation</h4>
          <ul className="footer-links">
            <li><Link to="/">Accueil</Link></li>
            <li><Link to="/menu">Menu</Link></li>
            <li><Link to="/find-us">Nous Trouver</Link></li>
          </ul>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Horaires</h4>
          <ul className="footer-hours">
            <li>Lundi: 17h30 - 22h</li>
            <li>Mardi: 11h - 14h | 17h30 - 22h</li>
            <li>Mercredi: 11h - 14h | 17h30 - 22h</li>
            <li>Jeudi: 11h - 14h | 17h30 - 22h</li>
            <li>Vendredi: 11h - 14h | 17h30 - 22h</li>
            <li>Samedi: 11h - 14h | 17h30 - 22h</li>
            <li>Dimanche: 11h - 14h | 17h30 - 22h</li>
          </ul>
          <p className="footer-note">
            Afin de mieux vous servir, la pizzéria est désormais ouverte 7j/7 ! 
            Aussi le midi et les jours fériés !
          </p>
        </div>

        <div className="footer-section">
          <h4 className="footer-title">Contact</h4>
          <ul className="footer-contact">
            <li>📞 081 739 330</li>
            <li>📍 Chaussée de Louvain, 454<br />B-5004 Bouge</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>&copy; 2026 Pizza Service Namur. Tous droits réservés.</p>
      </div>
    </footer>
  );
};

export default Footer;
