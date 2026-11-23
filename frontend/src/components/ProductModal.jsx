import React from 'react';
import { 
  X, 
  MapPin, 
  Star, 
  MessageSquare, 
  ShieldCheck, 
  CreditCard, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  DollarSign, 
  RotateCcw, 
  Bookmark, 
  AlertTriangle 
} from 'lucide-react';

const CONDITION_LABELS = {
  new: 'Nuevo (Sellado)',
  like_new: 'Como nuevo (Sin marcas ni rayones)',
  good: 'Buen estado (Uso regular universitario)',
  acceptable: 'Con detalles estéticos',
};

export default function ProductModal({ 
  product, 
  user, 
  onClose, 
  onStartChat, 
  onStartCheckout, 
  onEditProduct, 
  onDeleteProduct,
  onUpdateStatus 
}) {
  if (!product) return null;

  const isOwnProduct = Boolean(
    user && (
      (product.seller_id && user.id === product.seller_id) ||
      (product.user_id && user.id === product.user_id) ||
      (product.seller_email && user.email && product.seller_email.trim().toLowerCase() === user.email.trim().toLowerCase())
    )
  );

  const isSold = product.status === 'sold';
  const isReserved = product.status === 'reserved';

  const imageUrl = product.images && product.images.length > 0 
    ? product.images[0] 
    : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '680px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {/* Imagen y Badges */}
          <div>
            <div style={{ 
              borderRadius: '12px', 
              overflow: 'hidden', 
              height: '240px', 
              backgroundColor: '#e2e8f0',
              position: 'relative',
              filter: isSold ? 'grayscale(35%)' : 'none',
              opacity: isSold ? 0.88 : 1
            }}>
              <img src={imageUrl} alt={product.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              
              {isSold && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#dc2626',
                  color: '#ffffff',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={13} /> Vendido en Efectivo
                </div>
              )}

              {!isSold && isReserved && (
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: '#d97706',
                  color: '#ffffff',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: '800',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <Bookmark size={13} /> Apartado
                </div>
              )}
            </div>
            
            <div style={{ marginTop: '16px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
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

            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isSold ? '#64748b' : '#004d26', marginBottom: '16px' }}>
              {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)} MXN` : '¡Gratis / Donación!'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px', fontSize: '0.85rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <MapPin size={16} style={{ color: '#004d26' }} />
                <span><strong>Punto de Entrega:</strong> {product.faculty_name} ({product.campus_zone || 'CU Ecatepec'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <ShieldCheck size={16} style={{ color: '#e5a823' }} />
                <span>Vendedor Universitario Verificado</span>
              </div>
            </div>

            {/* Perfil del Vendedor */}
            <div style={{ 
              background: isOwnProduct ? '#f0fdf4' : '#f8fafc', 
              border: isOwnProduct ? '1.5px solid #004d26' : '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '12px 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '18px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem', color: '#0f172a' }}>
                    {product.seller_name || 'Vendedor Universitario'}
                  </span>
                  {isOwnProduct && (
                    <span style={{ fontSize: '0.68rem', background: '#004d26', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      Tu publicación
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                  🎓 {product.seller_career || 'Estudiante CU Ecatepec'}
                </div>
                {product.seller_email && (
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', marginTop: '2px' }}>
                    ✉️ {product.seller_email}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: '#ffffff', padding: '4px 8px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
                <Star size={14} fill="#e5a823" color="#e5a823" />
                <span style={{ fontWeight: '700', fontSize: '0.85rem' }}>{parseFloat(product.seller_rating || 5.0).toFixed(1)}</span>
              </div>
            </div>

            {/* Acciones de Venta, Compra, Estado y Contacto */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: 'auto' }}>
              {isOwnProduct ? (
                <>
                  {/* Vista y Acciones para el DUEÑO de la Publicación */}
                  {isSold ? (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '10px',
                      padding: '12px 14px',
                      color: '#065f46',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '800', fontSize: '0.92rem' }}>
                        <CheckCircle2 size={18} color="#059669" />
                        <span>¡Vendido por Efectivo! (Entrega en CU Ecatepec)</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.78rem', color: '#047857', lineHeight: '1.4' }}>
                        Has marcado este artículo como vendido y entregado en mano. La publicación está liberada y cerrada en el catálogo activo.
                      </p>
                    </div>
                  ) : isReserved ? (
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                      <span><strong>Publicación Apartada:</strong> En trato o esperando encuentro en CU Ecatepec.</span>
                    </div>
                  ) : null}

                  {/* Botón principal: Marcar como Vendido por Efectivo o Reactivar */}
                  {isSold ? (
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ width: '100%', padding: '11px', fontSize: '0.9rem', gap: '8px', fontWeight: '700', border: '1.5px solid #cbd5e1' }}
                      onClick={() => {
                        if (window.confirm(`¿Deseas volver a marcar "${product.title}" como DISPONIBLE en el catálogo de CU Ecatepec?`)) {
                          if (onUpdateStatus) onUpdateStatus(product.id, 'available');
                        }
                      }}
                    >
                      <RotateCcw size={17} />
                      <span>Reactivar Publicación (Volver a Disponible)</span>
                    </button>
                  ) : (
                    <>
                      <button 
                        type="button"
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          padding: '13px', 
                          fontSize: '0.94rem', 
                          gap: '8px', 
                          background: '#059669', 
                          color: '#ffffff', 
                          border: 'none', 
                          fontWeight: '800',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                        onClick={() => {
                          if (window.confirm(`¿Confirmas que ya entregaste "${product.title}" y recibiste el pago en efectivo en CU Ecatepec?\n\nLa publicación se marcará como VENDIDA y se liberará del catálogo activo.`)) {
                            if (onUpdateStatus) onUpdateStatus(product.id, 'sold');
                          }
                        }}
                      >
                        <DollarSign size={19} />
                        <span>Marcar como Vendido por Efectivo (Liberar)</span>
                      </button>

                      {/* Botón secundario: Apartar / Desapartar */}
                      {isReserved ? (
                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '9px', fontSize: '0.84rem', gap: '6px', color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}
                          onClick={() => {
                            if (onUpdateStatus) onUpdateStatus(product.id, 'available');
                          }}
                        >
                          <RotateCcw size={15} />
                          <span>Quitar Apartado (Volver a Disponible)</span>
                        </button>
                      ) : (
                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          style={{ width: '100%', padding: '9px', fontSize: '0.84rem', gap: '6px', color: '#475569', borderColor: '#e2e8f0' }}
                          onClick={() => {
                            if (window.confirm(`¿Deseas marcar "${product.title}" como APARTADO mientras concretas la entrega con tu comprador?`)) {
                              if (onUpdateStatus) onUpdateStatus(product.id, 'reserved');
                            }
                          }}
                        >
                          <Bookmark size={15} />
                          <span>Marcar como Apartado (Trato en Proceso)</span>
                        </button>
                      )}
                    </>
                  )}

                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '11px', fontSize: '0.9rem', gap: '8px', color: '#004d26', fontWeight: '700' }}
                    onClick={() => onStartChat(product)}
                  >
                    <MessageSquare size={17} />
                    <span>Ver Mensajes de Compradores (Chat)</span>
                  </button>

                  <button 
                    type="button"
                    className="btn btn-primary" 
                    style={{ width: '100%', padding: '11px', fontSize: '0.9rem', gap: '8px' }}
                    onClick={() => onEditProduct(product)}
                  >
                    <Edit3 size={17} />
                    <span>Editar Información o Foto</span>
                  </button>

                  <button 
                    type="button"
                    className="btn" 
                    style={{ 
                      background: '#fef2f2', 
                      color: '#dc2626', 
                      border: '1.5px solid #fecaca', 
                      width: '100%', 
                      padding: '10px', 
                      fontSize: '0.88rem', 
                      fontWeight: '700',
                      gap: '8px',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    onClick={() => {
                      if (window.confirm(`¿Deseas eliminar definitivamente "${product.title}" del catálogo de CU Ecatepec?`)) {
                        onDeleteProduct(product.id);
                      }
                    }}
                  >
                    <Trash2 size={16} />
                    <span>Eliminar Publicación</span>
                  </button>
                </>
              ) : (
                <>
                  {/* Vista para COMPRADORES (No dueños) */}
                  {isSold ? (
                    <div style={{
                      background: '#fef2f2',
                      border: '1.5px solid #fecaca',
                      borderRadius: '10px',
                      padding: '14px',
                      textAlign: 'center',
                      color: '#991b1b',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '800', fontSize: '0.92rem' }}>
                        <CheckCircle2 size={18} color="#dc2626" />
                        <span>Artículo Vendido en Efectivo</span>
                      </div>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#b91c1c' }}>
                        Este artículo ya fue entregado y pagado en mano en CU Ecatepec. Ya no está disponible para compra.
                      </p>
                    </div>
                  ) : isReserved ? (
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      fontSize: '0.8rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <AlertTriangle size={16} color="#d97706" style={{ flexShrink: 0 }} />
                      <span><strong>Artículo Apartado:</strong> El vendedor tiene un trato en proceso con otro estudiante. Aún puedes mandarle mensaje por si se libera.</span>
                    </div>
                  ) : null}

                  {!isSold && (
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}
                      onClick={() => onStartCheckout(product)}
                    >
                      <CreditCard size={18} />
                      <span>Pagar con Tarjeta (Pago Protegido)</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '10px' }}
                    onClick={() => onStartChat(product)}
                  >
                    <MessageSquare size={16} />
                    <span>{isSold ? 'Preguntar al vendedor si tiene otro similar' : 'Contactar / Acordar Entrega en Efectivo en CU Ecatepec'}</span>
                  </button>
                </>
              )}
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
