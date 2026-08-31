import React from 'react';
import { MapPin, Star, Sparkles, RefreshCw } from 'lucide-react';

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

  return (
    <div className="product-card" onClick={() => onSelectProduct(product)}>
      <div className="product-img-wrapper">
        <img src={imageUrl} alt={product.title} className="product-img" loading="lazy" />
        
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
        <h3 className="product-title">{product.title}</h3>
        
        <div className="product-location">
          <MapPin size={14} style={{ color: '#004d26', flexShrink: 0 }} />
          <span>{product.faculty_name || 'Campus Central'}</span>
        </div>

        <div className="product-footer">
          <div className="product-price">
            {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)}` : 'Donación / $0'}
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
