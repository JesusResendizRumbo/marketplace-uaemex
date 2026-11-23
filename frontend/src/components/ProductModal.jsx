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
  AlertTriangle,
  Building
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
                  <CheckCircle2 size={13} /> Vendido
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

            {/* Aviso de Modalidades Aceptadas */}
            <div style={{ 
              marginTop: '12px', 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '8px', 
              padding: '8px 10px', 
              fontSize: '0.72rem', 
              color: '#475569',
              lineHeight: '1.4'
            }}>
              💳 <strong>Modalidades de Pago:</strong> Efectivo en mano en CU Ecatepec o Transferencia / Tarjeta bancaria (Custodia Protegida).
            </div>
          </div>

          {/* Información */}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#004d26', textTransform: 'uppercase' }}>
              {product.category_name || 'Material de Estudio'}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', margin: '4px 0 10px 0', color: '#0f172a' }}>
              {product.title}
            </h2>

            <div style={{ fontSize: '1.8rem', fontWeight: '800', color: isSold ? '#64748b' : '#004d26', marginBottom: '14px' }}>
              {product.price > 0 ? `$${parseFloat(product.price).toFixed(2)} MXN` : '¡Gratis / Donación!'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px', fontSize: '0.82rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <MapPin size={15} style={{ color: '#004d26' }} />
                <span><strong>Punto de Entrega:</strong> {product.faculty_name} ({product.campus_zone || 'CU Ecatepec'})</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569' }}>
                <ShieldCheck size={15} style={{ color: '#e5a823' }} />
                <span>Vendedor Universitario Verificado</span>
              </div>
            </div>

            {/* Perfil del Vendedor */}
            <div style={{ 
              background: isOwnProduct ? '#f0fdf4' : '#f8fafc', 
              border: isOwnProduct ? '1.5px solid #004d26' : '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '10px 14px', 
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '16px'
            }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.88rem', color: '#0f172a' }}>
                    {product.seller_name || 'Vendedor Universitario'}
                  </span>
                  {isOwnProduct && (
                    <span style={{ fontSize: '0.68rem', background: '#004d26', color: '#ffffff', padding: '2px 6px', borderRadius: '4px', fontWeight: '700' }}>
                      Tu publicación
                    </span>
                  )}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '2px' }}>
                  🎓 {product.seller_career || 'Estudiante CU Ecatepec'}
                </div>
                {product.seller_email && (
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '2px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto' }}>
              {isOwnProduct ? (
                <>
                  {/* Vista para el DUEÑO de la Publicación */}
                  {isSold ? (
                    <div style={{
                      background: '#ecfdf5',
                      border: '1.5px solid #10b981',
                      borderRadius: '10px',
                      padding: '10px 12px',
                      color: '#065f46',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#059669" />
                        <span>¡Publicación Vendida y Liberada!</span>
                      </div>
                      <p style={{ margin: 0, fontSize: '0.76rem', color: '#047857', lineHeight: '1.3' }}>
                        Marcaste este artículo como entregado y cobrado. Está retirado del catálogo activo.
                      </p>
                    </div>
                  ) : isReserved ? (
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0 }} />
                      <span><strong>Publicación Apartada:</strong> Trato en curso o entrega pactada en CU Ecatepec.</span>
                    </div>
                  ) : null}

                  {isSold ? (
                    <button 
                      type="button"
                      className="btn btn-secondary" 
                      style={{ width: '100%', padding: '10px', fontSize: '0.88rem', gap: '6px', fontWeight: '700', border: '1.5px solid #cbd5e1' }}
                      onClick={() => {
                        if (window.confirm(`¿Deseas volver a marcar "${product.title}" como DISPONIBLE en el catálogo de CU Ecatepec?`)) {
                          if (onUpdateStatus) onUpdateStatus(product.id, 'available');
                        }
                      }}
                    >
                      <RotateCcw size={16} />
                      <span>Reactivar Publicación (Volver a Disponible)</span>
                    </button>
                  ) : (
                    <>
                      {/* Opciones de Liberación para el Vendedor */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <button 
                          type="button"
                          className="btn" 
                          style={{ 
                            padding: '10px 8px', 
                            fontSize: '0.82rem', 
                            gap: '6px', 
                            background: '#059669', 
                            color: '#ffffff', 
                            border: 'none', 
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                          }}
                          onClick={() => {
                            if (window.confirm(`¿Confirmas que ya entregaste "${product.title}" y recibiste el pago en EFECTIVO en CU Ecatepec?\n\nSe liberará la publicación como vendida.`)) {
                              if (onUpdateStatus) onUpdateStatus(product.id, 'sold');
                            }
                          }}
                        >
                          <DollarSign size={16} />
                          <span>Vendido por Efectivo</span>
                        </button>

                        <button 
                          type="button"
                          className="btn" 
                          style={{ 
                            padding: '10px 8px', 
                            fontSize: '0.82rem', 
                            gap: '6px', 
                            background: '#004d26', 
                            color: '#ffffff', 
                            border: 'none', 
                            fontWeight: '700',
                            borderRadius: '8px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 6px rgba(0, 77, 38, 0.2)'
                          }}
                          onClick={() => {
                            if (window.confirm(`¿Confirmas que ya entregaste "${product.title}" y recibiste el pago por TRANSFERENCIA / TARJETA?\n\nSe liberará la publicación como vendida.`)) {
                              if (onUpdateStatus) onUpdateStatus(product.id, 'sold');
                            }
                          }}
                        >
                          <Building size={15} />
                          <span>Vendido Transferencia</span>
                        </button>
                      </div>

                      {/* Apartar o Probar Pasarela */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        {isReserved ? (
                          <button 
                            type="button"
                            className="btn btn-secondary" 
                            style={{ padding: '8px', fontSize: '0.78rem', gap: '4px', color: '#b45309', borderColor: '#fde68a', background: '#fffbeb' }}
                            onClick={() => {
                              if (onUpdateStatus) onUpdateStatus(product.id, 'available');
                            }}
                          >
                            <RotateCcw size={14} />
                            <span>Quitar Apartado</span>
                          </button>
                        ) : (
                          <button 
                            type="button"
                            className="btn btn-secondary" 
                            style={{ padding: '8px', fontSize: '0.78rem', gap: '4px', color: '#475569', borderColor: '#e2e8f0' }}
                            onClick={() => {
                              if (window.confirm(`¿Deseas marcar "${product.title}" como APARTADO?`)) {
                                if (onUpdateStatus) onUpdateStatus(product.id, 'reserved');
                              }
                            }}
                          >
                            <Bookmark size={14} />
                            <span>Apartar Artículo</span>
                          </button>
                        )}

                        <button 
                          type="button"
                          className="btn btn-secondary" 
                          style={{ padding: '8px', fontSize: '0.78rem', gap: '4px', color: '#004d26', borderColor: '#bbf7d0', background: '#f0fdf4', fontWeight: '700' }}
                          onClick={() => onStartCheckout(product)}
                          title="Prueba cómo ven tus compradores las opciones de pago con tarjeta, transferencia SPEI y efectivo"
                        >
                          <CreditCard size={14} />
                          <span>Ver Pasarela de Pago</span>
                        </button>
                      </div>
                    </>
                  )}

                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '10px', fontSize: '0.88rem', gap: '6px', color: '#004d26', fontWeight: '700' }}
                    onClick={() => onStartChat(product)}
                  >
                    <MessageSquare size={16} />
                    <span>Ver Mensajes de Compradores (Chat)</span>
                  </button>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button 
                      type="button"
                      className="btn btn-primary" 
                      style={{ padding: '9px', fontSize: '0.84rem', gap: '6px' }}
                      onClick={() => onEditProduct(product)}
                    >
                      <Edit3 size={15} />
                      <span>Editar</span>
                    </button>

                    <button 
                      type="button"
                      className="btn" 
                      style={{ 
                        background: '#fef2f2', 
                        color: '#dc2626', 
                        border: '1px solid #fecaca', 
                        padding: '9px', 
                        fontSize: '0.84rem', 
                        fontWeight: '700',
                        gap: '6px',
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
                      <Trash2 size={15} />
                      <span>Eliminar</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* Vista para COMPRADORES (No dueños) */}
                  {isSold ? (
                    <div style={{
                      background: '#fef2f2',
                      border: '1.5px solid #fecaca',
                      borderRadius: '10px',
                      padding: '12px',
                      textAlign: 'center',
                      color: '#991b1b',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontWeight: '800', fontSize: '0.9rem' }}>
                        <CheckCircle2 size={16} color="#dc2626" />
                        <span>Artículo Vendido en CU Ecatepec</span>
                      </div>
                      <p style={{ margin: '3px 0 0 0', fontSize: '0.78rem', color: '#b91c1c' }}>
                        Este artículo ya fue entregado a otro estudiante y no está disponible.
                      </p>
                    </div>
                  ) : isReserved ? (
                    <div style={{
                      background: '#fffbeb',
                      border: '1.5px solid #fde68a',
                      borderRadius: '10px',
                      padding: '8px 12px',
                      fontSize: '0.78rem',
                      color: '#92400e',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <AlertTriangle size={15} color="#d97706" style={{ flexShrink: 0 }} />
                      <span><strong>Artículo Apartado:</strong> Trato en proceso. Aún puedes contactarlo por si se libera.</span>
                    </div>
                  ) : null}

                  {!isSold && (
                    <>
                      {/* MODALIDAD 1: Tarjeta o Transferencia SPEI */}
                      <button 
                        type="button"
                        className="btn btn-primary" 
                        style={{ 
                          width: '100%', 
                          padding: '11px', 
                          fontSize: '0.92rem', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px' 
                        }}
                        onClick={() => onStartCheckout(product, 'transfer')}
                      >
                        <CreditCard size={17} />
                        <span>Pagar con Tarjeta o Transferencia SPEI (Protegido)</span>
                      </button>

                      {/* MODALIDAD 2: Efectivo en CU Ecatepec */}
                      <button 
                        type="button"
                        className="btn" 
                        style={{ 
                          width: '100%', 
                          padding: '11px', 
                          fontSize: '0.92rem', 
                          background: '#059669', 
                          color: '#ffffff', 
                          border: 'none', 
                          borderRadius: '8px', 
                          fontWeight: '800', 
                          cursor: 'pointer',
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          gap: '8px',
                          boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                        }}
                        onClick={() => onStartCheckout(product, 'cash')}
                      >
                        <DollarSign size={17} />
                        <span>Pagar en Efectivo (Contra Entrega en CU Ecatepec)</span>
                      </button>
                    </>
                  )}

                  <button 
                    type="button"
                    className="btn btn-secondary" 
                    style={{ width: '100%', padding: '10px', fontSize: '0.86rem' }}
                    onClick={() => onStartChat(product)}
                  >
                    <MessageSquare size={15} />
                    <span>{isSold ? 'Preguntar si tiene otro artículo similar' : 'Contactar al Vendedor por Chat'}</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Descripción Detallada */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
          <h4 style={{ fontSize: '0.92rem', fontWeight: '700', marginBottom: '6px' }}>Descripción del Artículo</h4>
          <p style={{ fontSize: '0.88rem', color: '#475569', lineHeight: '1.5' }}>
            {product.description}
          </p>
        </div>
      </div>
    </div>
  );
}
