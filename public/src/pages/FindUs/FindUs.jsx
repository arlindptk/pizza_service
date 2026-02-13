import React from 'react';
import './FindUs.css';

const FindUs = () => {
  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="container">
          <h1>Où nous trouver</h1>
          <p className="hero-description">
            Venez nous rendre visite à notre pizzeria
          </p>
        </div>
      </div>

      <div className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Info */}
            <div className="contact-info">
              <h2>Informations de Contact</h2>
              <div className="info-item">
                <div className="info-icon">📍</div>
                <div>
                  <h3>Adresse</h3>
                  <p>Chaussée de Louvain, 454<br />B-5004 Bouge</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">📞</div>
                <div>
                  <h3>Téléphone</h3>
                  <p>081 739 330</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon">🕐</div>
                <div>
                  <h3>Horaires</h3>
                  <p>
                    Lundi: 17h30 - 22h<br />
                    Mardi: 11h - 14h | 17h30 - 22h<br />
                    Mercredi: 11h - 14h | 17h30 - 22h<br />
                    Jeudi: 11h - 14h | 17h30 - 22h<br />
                    Vendredi: 11h - 14h | 17h30 - 22h<br />
                    Samedi: 11h - 14h | 17h30 - 22h<br />
                    Dimanche: 11h - 14h | 17h30 - 22h
                  </p>
                </div>
              </div>
            </div>

            {/* Map Section */}
            <div className="map-section">
              <h2>Notre Localisation</h2>
              <div className="map-container">
                <iframe
                  src={`https://www.google.com/maps?q=Chaussée+de+Louvain+454,+5004+Bouge,+Belgium&output=embed`}
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Localisation Pizza Service Namur"
                ></iframe>
                <p className="map-address">
                  Chaussée de Louvain, 454, B-5004 Bouge
                </p>
                <a 
                  href="https://www.google.com/maps/search/?api=1&query=Chaussée+de+Louvain+454+Bouge" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  Ouvrir dans Google Maps
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FindUs;
