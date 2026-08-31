import React, { useState } from 'react';
import { X, Star, Sparkles, CheckCircle2, MessageSquare, ThumbsUp } from 'lucide-react';

const QUICK_TAGS = [
  '⭐ 100% Recomendado',
  '⏱️ Muy puntual en la entrega',
  '📦 Producto tal como en las fotos',
  '🤝 Excelente trato y comunicación',
  '🎓 Confiable en CU Ecatepec',
];

export default function ReviewModal({ sellerName, productTitle, onClose, onSubmitReview }) {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [selectedTags, setSelectedTags] = useState(['⭐ 100% Recomendado']);
  const [comment, setComment] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalReview = {
      rating,
      comment: `${selectedTags.join(', ')}. ${comment}`.trim(),
      date: new Date().toISOString(),
    };
    if (onSubmitReview) {
      onSubmitReview(finalReview);
    }
    setSubmitted(true);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!submitted ? (
          <div>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                background: 'rgba(229, 168, 35, 0.15)', 
                color: '#e5a823', 
                borderRadius: '50%', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                margin: '0 auto 12px auto' 
              }}>
                <Sparkles size={24} />
              </div>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                Calificar al Vendedor
              </h2>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                ¿Cómo fue tu experiencia de compra con <strong>{sellerName || 'el compañero'}</strong> en CU Ecatepec?
              </p>
              {productTitle && (
                <div style={{ fontSize: '0.75rem', color: '#004d26', fontWeight: '700', marginTop: '6px' }}>
                  📦 {productTitle}
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit}>
              {/* Selector de Estrellas */}
              <div style={{ textAlign: 'center', margin: '20px 0' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', transition: 'transform 0.15s' }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star 
                        size={32} 
                        fill={(hoverRating || rating) >= star ? '#e5a823' : '#e2e8f0'} 
                        color={(hoverRating || rating) >= star ? '#e5a823' : '#cbd5e1'} 
                      />
                    </button>
                  ))}
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#004d26', marginTop: '8px' }}>
                  {rating === 5 && '¡Excelente Vendedor! (5/5)'}
                  {rating === 4 && 'Muy Bueno (4/5)'}
                  {rating === 3 && 'Aceptable (3/5)'}
                  {rating === 2 && 'Regular (2/5)'}
                  {rating === 1 && 'Mala Experiencia (1/5)'}
                </div>
              </div>

              {/* Etiquetas Rápidas */}
              <div style={{ marginBottom: '18px' }}>
                <label className="form-label">Aspectos destacados</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {QUICK_TAGS.map((tag) => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <button
                        type="button"
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        style={{
                          background: isSelected ? '#004d26' : '#f1f5f9',
                          color: isSelected ? '#ffffff' : '#334155',
                          border: isSelected ? '1px solid #004d26' : '1px solid #e2e8f0',
                          padding: '6px 12px',
                          borderRadius: '16px',
                          fontSize: '0.75rem',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.15s'
                        }}
                      >
                        {tag}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Comentario */}
              <div className="form-group">
                <label className="form-label">Comentario u opinión para la comunidad</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="ej. Todo en orden, nos vimos en la biblioteca de CU Ecatepec y el libro estaba impecable..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                <span>Publicar Calificación</span>
              </button>
            </form>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <CheckCircle2 size={48} color="#004d26" style={{ margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '1.2rem', fontWeight: '800', color: '#004d26' }}>
              ¡Calificación Registrada!
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
              Gracias por ayudar a mantener una comunidad confiable y segura en CU UAEM Ecatepec.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
