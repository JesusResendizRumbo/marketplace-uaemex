import React, { useState } from 'react';
import { Search, MapPin, Calendar, CheckCircle2, AlertCircle, PlusCircle, MessageSquare, HeartHandshake } from 'lucide-react';

export default function LostFoundSection({ lostItems, user, onOpenReportModal, onContactReporter, onResolveItem }) {
  const [filterType, setFilterType] = useState('all'); // 'all', 'found', 'lost'

  const filteredItems = lostItems.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  return (
    <div>
      {/* Header de la sección */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between', 
        flexWrap: 'wrap', 
        gap: '16px',
        marginBottom: '24px' 
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#004d26' }}>
            🔍 Módulo de Objetos Perdidos y Encontrados
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>
            Reportes comunitarios de artículos extraviados o hallados en los planteles de la UAEMex.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ background: '#e2e8f0', padding: '4px', borderRadius: '8px', display: 'flex', gap: '4px' }}>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.8rem', 
                background: filterType === 'all' ? '#ffffff' : 'transparent',
                color: filterType === 'all' ? '#004d26' : '#64748b',
                boxShadow: filterType === 'all' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setFilterType('all')}
            >
              Todos ({lostItems.length})
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.8rem', 
                background: filterType === 'found' ? '#ffffff' : 'transparent',
                color: filterType === 'found' ? '#004d26' : '#64748b',
                boxShadow: filterType === 'found' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setFilterType('found')}
            >
              🟢 Encontrados
            </button>
            <button 
              className="btn" 
              style={{ 
                padding: '6px 14px', 
                fontSize: '0.8rem', 
                background: filterType === 'lost' ? '#ffffff' : 'transparent',
                color: filterType === 'lost' ? '#dc2626' : '#64748b',
                boxShadow: filterType === 'lost' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
              }}
              onClick={() => setFilterType('lost')}
            >
              🔴 Extraviados
            </button>
          </div>

          <button 
            className="btn btn-primary" 
            onClick={() => onOpenReportModal(filterType === 'lost' ? 'lost' : 'found')}
          >
            <PlusCircle size={16} />
            <span>Publicar Reporte</span>
          </button>
        </div>
      </div>

      {/* Grid de reportes */}
      {lostItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <HeartHandshake size={52} style={{ color: '#004d26', margin: '0 auto 16px auto', opacity: 0.85 }} />
          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>No hay reportes de objetos registrados</h3>
          <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '8px', maxWidth: '440px', margin: '8px auto 20px auto', lineHeight: '1.5' }}>
            ¿Perdiste o encontraste algún artículo dentro de las instalaciones de CU Ecatepec? Crea un reporte para coordinar la entrega comunitaria.
          </p>
          <button 
            className="btn btn-primary" 
            style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
            onClick={() => onOpenReportModal('lost')}
          >
            <PlusCircle size={18} />
            <span>Publicar Primer Reporte</span>
          </button>
        </div>
      ) : filteredItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <Search size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>No hay reportes en esta categoría</h3>
          <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>
            Sé el primero en reportar un objeto extraviado o hallado en las instalaciones de CU Ecatepec.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filteredItems.map(item => {
            const isFound = item.type === 'found';
            const isResolved = item.status === 'resolved';

            return (
              <div 
                key={item.id} 
                style={{ 
                  background: '#ffffff', 
                  border: isResolved ? '1px solid #cbd5e1' : isFound ? '1.5px solid #86efac' : '1.5px solid #fca5a5', 
                  borderRadius: '14px', 
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
                  opacity: isResolved ? 0.85 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <span style={{ 
                    display: 'inline-flex', 
                    alignItems: 'center', 
                    gap: '4px',
                    padding: '4px 10px', 
                    borderRadius: '20px', 
                    fontSize: '0.75rem', 
                    fontWeight: '700',
                    background: isResolved ? '#f1f5f9' : isFound ? 'rgba(0, 77, 38, 0.1)' : 'rgba(220, 38, 38, 0.1)',
                    color: isResolved ? '#64748b' : isFound ? '#004d26' : '#dc2626',
                  }}>
                    {isResolved ? (
                      <>
                        <CheckCircle2 size={14} /> Entregado a su dueño ✓
                      </>
                    ) : isFound ? (
                      <>
                        <CheckCircle2 size={14} /> Objeto Encontrado
                      </>
                    ) : (
                      <>
                        <AlertCircle size={14} /> Objeto Extraviado
                      </>
                    )}
                  </span>

                  <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {item.event_date}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a', marginBottom: '8px' }}>
                  {item.title}
                </h3>

                <p style={{ fontSize: '0.85rem', color: '#475569', lineHeight: '1.5', marginBottom: '16px', flex: 1 }}>
                  {item.description}
                </p>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', fontSize: '0.8rem', color: '#64748b', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <MapPin size={14} style={{ color: '#004d26' }} />
                    <span><strong>Lugar:</strong> {item.location_details}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                    Reportado por: <strong>{item.reporter_name}</strong> ({item.faculty_name})
                  </div>
                </div>

                {/* Acciones de Contacto Inmediato y Entrega */}
                <div style={{ marginTop: '14px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {!isResolved ? (
                    <>
                      <button 
                        className="btn btn-primary"
                        style={{ 
                          width: '100%', 
                          padding: '9px 12px', 
                          fontSize: '0.82rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                        onClick={() => onContactReporter && onContactReporter(item)}
                      >
                        {item.type === 'lost' ? (
                          <>
                            <HeartHandshake size={15} />
                            <span>¡Yo lo encontré! / Contactar al dueño</span>
                          </>
                        ) : (
                          <>
                            <MessageSquare size={15} />
                            <span>¡Es mío! / Contactar a quien lo tiene</span>
                          </>
                        )}
                      </button>

                      <button
                        className="btn btn-secondary"
                        style={{
                          width: '100%',
                          padding: '7px 10px',
                          fontSize: '0.78rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          color: '#004d26',
                          borderColor: '#004d26'
                        }}
                        onClick={() => onResolveItem && onResolveItem(item.id)}
                      >
                        <CheckCircle2 size={14} />
                        <span>Marcar como Entregado / Recuperado</span>
                      </button>
                    </>
                  ) : (
                    <div style={{ 
                      background: '#f0fdf4', 
                      color: '#166534', 
                      padding: '8px 12px', 
                      borderRadius: '8px', 
                      fontSize: '0.78rem', 
                      fontWeight: '700',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}>
                      <CheckCircle2 size={14} />
                      <span>Objeto entregado exitosamente a su dueño</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
