import React from 'react';
import { MapPin, Star, Sparkles, RefreshCw, CheckCircle2, Bookmark } from 'lucide-react';

const CONDITION_LABELS = {
  new: 'Nuevo',
  like_new: 'Como nuevo',
  good: 'Buen estado',
  acceptable: 'Con detalles',
};

export default function ProductCard({ product, onSelectProduct }) {
  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80';

  const isSold = product.status === 'sold';
  const isReserved = product.status === 'reserved';

  return (
    <div 
      className="product-card" 
      onClick={() => onSelectProduct(product)}
      style={{
        opacity: isSold ? 0.85 : 1,
        border: isSold ? '1px dashed #cbd5e1' : undefined,
      }}
    >
      <div className="product-img-wrapper" style={{ filter: isSold ? 'grayscale(35%)' : 'none' }}>
        <img src={imageUrl} alt={product.title} className="product-img" loading="lazy" />
        
        {isSold && (
          <div className="product-badge" style={{ background: '#dc2626', top: '8px', right: '8px', left: 'auto', fontWeight: '800' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <CheckCircle2 size={11} /> Vendido
            </span>
          </div>
        )}

        {!isSold && isReserved && (
          <div className="product-badge" style={{ background: '#d97706', top: '8px', right: '8px', left: 'auto', fontWeight: '800' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Bookmark size={11} /> Apartado
            </span>
          </div>
        )}

        {product.is_exchangeable && (
          <div className="product-badge" style={{ background: '#0284c7' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <RefreshCw size={12} /> Acepta Intercambio
            </span>
          </div>
        )}

        <div className="product-badge-condition">
          {CONDITION_LABELS[product.condition] || 'Buen estado'}
        </div>
      </div>

      <div className="product-body">
        <div className="product-category">{product.category_name || 'Material Universitario'}</div>
        <h3 className="product-title" style={{ color: isSold ? '#64748b' : '#0f172a' }}>
          {product.title}
        </h3>
        
        <div className="product-location">
          <MapPin size={14} style={{ color: '#004d26', flexShrink: 0 }} />
          <span>{product.faculty_name || 'Campus Central'}</span>
        </div>

        <div className="product-footer">
          <div className="product-price" style={{ color: isSold ? '#64748b' : '#004d26' }}>
            {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)}` : 'Donación / $0'}
            {isSold && (
              <span style={{ fontSize: '0.68rem', fontWeight: '700', color: '#dc2626', marginLeft: '6px' }}>
                (Efectivo)
              </span>
            )}
          </div>

          <div className="seller-meta">
            <Star size={14} className="star-icon" fill="#e5a823" />
            <span>{parseFloat(product.seller_rating || 5.0).toFixed(1)}</span>
            <span style={{ color: '#94a3b8', fontSize: '0.72rem' }}>({product.seller_reviews || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
}
