import React from 'react';
import { X, MapPin, Star, MessageSquare, ShieldCheck, Tag, Calendar, CreditCard } from 'lucide-react';

const CONDITION_LABELS = {
  new: 'Nuevo (Sellado)',
  like_new: 'Como nuevo (Sin marcas ni rayones)',
  good: 'Buen estado (Uso regular universitario)',
  acceptable: 'Con detalles estéticos',
};

export default function ProductModal({ product, onClose, onStartChat, onStartCheckout }) {
  if (!product) return null;

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '24px' }}>
          {/* Imagen */}
          <div>
            <div style={{ borderRadius: '12px', overflow: 'hidden', height: '280px', backgroundColor: '#e2e8f0' }}>
              <img src={imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
              <span className="product-badge-condition" style={{ position: 'static' }}>
                {CONDITION_LABELS[product.condition] || 'Buen estado'}
              </span>
              {product.is_exchangeable && (
                <span className="product-badge" style={{ position: 'static', background: '#0284c7' }}>
                  Acepta Intercambio
                </span>
              )}
            </div>
          </div>

          {/* Información */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#004d26', textTransform: 'uppercase' }}>
              {product.category_name || 'Material de Estudio'}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '4px 0 12px 0', color: '#0f172a' }}>
              {product.title}
            </h2>

            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: '#004d26', marginBottom: '16px' }}>
              {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)} MXN` : '¡Gratis / Donación!'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <MapPin size={16} style={{ color: '#004d26' }} />
                <span><strong>Punto de Entrega:</strong> {product.faculty_name} ({product.campus_zone})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <ShieldCheck size={16} style={{ color: '#e5a823' }} />
                <span>Vendedor Universitario Verificado</span>
              </div>
            </div>

            {/* Perfil del Vendedor */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div>
                <div style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>{product.seller_name}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{product.seller_career || 'Estudiante UAEMex'}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <Star size={14} fill="#e5a823" color="#e5a823" />
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{parseFloat(product.seller_rating || 5.0).toFixed(1)}</span>
              </div>
            </div>

            {/* Acciones de Compra y Contacto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              <button 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                onClick={() => onStartCheckout(product)}
              >
                <CreditCard size={18} />
                <span>Pagar con Tarjeta (Pago Protegido)</span>
              </button>

              <button 
                className="btn btn-secondary" 
                style={{ width: '100%', padding: '10px' }}
                onClick={() => onStartChat(product)}
              >
                <MessageSquare size={16} />
                <span>Contactar / Acordar Entrega en CU Ecatepec</span>
              </button>
            </div>
          </div>
        </div>

        {/* Descripción Detallada */}
        <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: '700', marginBottom: '8px' }}>Descripción del Artículo</h4>
          <p style={{ fontSize: '0.9rem', color: '#475569', lineHeight: '1.6' }}>
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
