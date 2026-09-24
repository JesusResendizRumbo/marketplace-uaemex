import React from 'react';
import { ShieldCheck, GraduationCap, ArrowRight } from 'lucide-react';

export default function Hero({ onExploreClick, onOpenPublish, totalProducts = 24 }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-content">
          <div>
            <div className="hero-badge">
              <ShieldCheck size={16} />
              <span>Exclusivo para la Comunidad del Centro Universitario UAEM Ecatepec</span>
            </div>
            
            <h2 className="hero-title">
              PotroTrade <br />
              <span>CU UAEM Ecatepec</span>
            </h2>

            <p className="hero-subtitle">
              Compra y vende material académico, calculadoras, libros de derecho e informática y uniformes con <strong>Pago Seguro con Tarjeta Web</strong> y puntos de entrega dentro del plantel Ecatepec.
            </p>

            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button className="btn btn-gold" onClick={onExploreClick}>
                <span>Explorar Catálogo Ecatepec</span>
                <ArrowRight size={18} />
              </button>
              <button 
                className="btn" 
                style={{ background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: '1px solid rgba(255,255,255,0.3)' }}
                onClick={onOpenPublish}
              >
                <span>Vender Material Académico</span>
              </button>
            </div>
          </div>

          <div className="hero-stats">
            <div className="stat-card">
              <div className="stat-number">6</div>
              <div className="stat-label">Carreras Ecatepec</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">💳</div>
              <div className="stat-label">Pago Web Protegido</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">100%</div>
              <div className="stat-label">Comunidad Verificada</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
