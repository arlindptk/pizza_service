import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  useEffect(() => {
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -150px 0px',
      }
    );

    reveals.forEach((reveal) => observer.observe(reveal));

    return () => {
      reveals.forEach((reveal) => observer.unobserve(reveal));
    };
  }, []);

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero">
        <video className="hero-video" autoPlay muted loop playsInline>
          <source src="/videos/video1.mp4" type="video/mp4" />
        </video>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <p className="hero-brand">PIZZA SERVICE <span className="hero-brand-gold">NAMUR</span></p>
          <h1 className="hero-title">
            <span className="hero-title-line">L'Art de la Pizza</span>
          </h1>
          <div className="hero-buttons">
            <Link to="/menu" className="btn btn-primary">
              Découvrir la Carte
            </Link>
            <Link to="/find-us" className="btn btn-secondary">
              Nous Trouver
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <div className="container">
          <h2 className="section-title">Pourquoi nous choisir ?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">👨‍🍳</div>
              <h3>Maîtrise Napolitaine</h3>
              <p>Des pizzaiolos formés en Italie qui perpétuent les traditions napolitaines avec passion et expertise.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🌿</div>
              <h3>Ingrédients Frais</h3>
              <p>Nous sélectionnons uniquement les meilleurs ingrédients locaux et importés d'Italie.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🔥</div>
              <h3>Four à Bois</h3>
              <p>Nos pizzas sont cuites dans un authentique four à bois pour une saveur incomparable.</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🚚</div>
              <h3>Livraison Rapide</h3>
              <p>Commandez en ligne et recevez votre pizza chaude en moins de 30 minutes.</p>
            </div>
          </div>
          <p className="features-tagline">Plus grand choix de pizzas de la région</p>
          <p className="features-tagline-sub">Entreprise familiale</p>
        </div>
      </section>

      {/* Online Order Section 2 */}
      <section className="online-order-section-2">
        <div className="container">
          <div className="order-card-2 reveal">
            <div className="order-content-2">
              <p className="order-text-2">
                Simplifiez-vous la vie, commandez en ligne et recevez <strong>5% de réduction</strong> sur vos plats
              </p>
              <Link to="/login" className="order-link-2">
                Commandez ici
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Pizzas Section */}
      <section className="popular-pizzas">
        <div className="container">
          <div className="section-header reveal">
            <h2 className="section-title">Notre Carte Sélectionnée</h2>
            <p className="text-zinc-500 italic text-sm mt-2">Des classiques revisités avec audace et finesse.</p>
          </div>
          <div className="pizzas-preview">
            <div className="pizza-preview-card reveal">
              <div className="pizza-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80" 
                  alt="Alba"
                  className="pizza-image"
                />
              </div>
              <div className="pizza-content">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-xl font-serif">Alba</h3>
                  <span style={{color: 'var(--accent-gold)'}} className="font-light">21€</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">Tomate, fromage, chips de parme, roquette, parmesan, tomates cerises, burrata, crème de pistache, pistache.</p>
              </div>
            </div>
            <div className="pizza-preview-card reveal">
              <div className="pizza-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1541745537411-b8046dc6d66c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Trim"
                  className="pizza-image"
                />
              </div>
              <div className="pizza-content">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-xl font-serif">Trim</h3>
                  <span style={{color: 'var(--accent-gold)'}} className="font-light">18,50€</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">Crème de pistache, mozzarella, jambon, bufala, pistache, roquette.</p>
              </div>
            </div>
            <div className="pizza-preview-card reveal">
              <div className="pizza-image-wrapper">
                <img 
                  src="https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                  alt="Pepper"
                  className="pizza-image"
                />
              </div>
              <div className="pizza-content">
                <div className="flex justify-between items-baseline mb-2">
                  <h3 className="text-xl font-serif">Pepper</h3>
                  <span style={{color: 'var(--accent-gold)'}} className="font-light">15€</span>
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">Sauce poivre, fromage, oignons, tomate fraîche, blanc de poulet, haché de bœuf.</p>
              </div>
            </div>
          </div>
          <div className="section-cta reveal">
            <Link to="/menu" className="btn btn-primary">
              Consulter le menu complet
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Prêt à déguster ?</h2>
          <p>Commandez maintenant et profitez de nos délicieuses pizzas artisanales</p>
          <Link to="/menu" className="btn btn-white">Commander Maintenant</Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
