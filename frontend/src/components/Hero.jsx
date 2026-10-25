import React from 'react';
import { ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, onOpenPublish, totalProducts = 24 }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div className="hero-text-block">
            <div className="hero-badge">
              <ShieldCheck size={15} />
              <span>Exclusivo CU UAEM Ecatepec</span>
            </div>
            
            <h2 className="hero-title">
              PotroTrade <br />
              <span>CU UAEM Ecatepec</span>
            </h2>

            <p className="hero-subtitle">
              Compra y vende libros, calculadoras y uniformes con <strong>Pago Seguro con Tarjeta</strong> y entregas dentro del plantel.
            </p>

            <div className="hero-actions">
              <button className="btn btn-gold btn-hero-explore" onClick={onExploreClick}>
                <span>Explorar Catálogo</span>
                <ArrowRight size={17} />
              </button>
              <button 
                className="btn btn-hero-sell" 
                onClick={onOpenPublish}
              >
                <span>Vender Material</span>
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">6</div>
              <div className="stat-label">Carreras</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">💳</div>
              <div className="stat-label">Pago Seguro</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">CU Ecatepec</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
