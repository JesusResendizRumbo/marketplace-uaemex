import React, { useState } from 'react';
import { X, MessageSquare, ArrowRight, Clock, User, ShoppingBag, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function MessagesInboxModal({ 
  user, 
  userMessages = [], 
  products = [], 
  onClose, 
  onOpenConversation,
  onRefreshMessages,
  loading = false
}) {
  const [activeTab, setActiveTab] = useState('selling'); // 'selling' (recibidos) o 'buying' (enviados)

  const myEmail = user?.email?.toLowerCase() || '';

  // Agrupar mensajes en conversaciones únicas por product_id y el otro interlocutor
  const groupConversations = () => {
    const map = new Map();

    userMessages.forEach(msg => {
      const senderIsMe = msg.sender_email?.toLowerCase() === myEmail;
      const partnerEmail = senderIsMe ? msg.receiver_email : msg.sender_email;
      const partnerName = senderIsMe 
        ? (msg.receiver_name || 'Compañero Universitario') 
        : (msg.sender_name || 'Compañero Universitario');

      const isSelling = msg.receiver_email?.toLowerCase() === myEmail;
      const key = `${msg.product_id}_${partnerEmail || 'general'}`;

      if (!map.has(key)) {
        // Encontrar datos del producto en el catálogo si están disponibles
        const prod = products.find(p => p.id === msg.product_id);

        map.set(key, {
          key,
          productId: msg.product_id,
          product: prod || {
            id: msg.product_id,
            title: prod?.title || 'Artículo de CU Ecatepec',
            price: prod?.price || 'Acordar',
            images: prod?.images || [],
            seller_name: prod?.seller_name || msg.receiver_name,
            seller_email: prod?.seller_email || msg.receiver_email,
            faculty_name: prod?.faculty_name || 'CU UAEM Ecatepec',
          },
          partnerEmail,
          partnerName,
          lastMessage: msg.content,
          lastMessageTime: msg.created_at,
          unreadCount: 0,
          isSelling,
        });
      }

      const convo = map.get(key);
      // Actualizar último mensaje si es más reciente
      if (new Date(msg.created_at) > new Date(convo.lastMessageTime)) {
        convo.lastMessage = msg.content;
        convo.lastMessageTime = msg.created_at;
      }
      // Contar no leídos que van dirigidos a mí
      if (msg.receiver_email?.toLowerCase() === myEmail && !msg.is_read) {
        convo.unreadCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => new Date(b.lastMessageTime) - new Date(a.lastMessageTime));
  };

  const allConversations = groupConversations();
  const sellingConversations = allConversations.filter(c => c.isSelling);
  const buyingConversations = allConversations.filter(c => !c.isSelling);

  const displayedList = activeTab === 'selling' ? sellingConversations : buyingConversations;
  const totalSellingUnread = sellingConversations.reduce((acc, c) => acc + c.unreadCount, 0);
  const totalBuyingUnread = buyingConversations.reduce((acc, c) => acc + c.unreadCount, 0);

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Ahora mismo';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} h`;
    if (diffDays === 1) return 'Ayer';
    return date.toLocaleDateString([], { day: '2-digit', month: 'short' });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '580px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', maxHeight: '85vh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ background: '#004d26', color: '#ffffff', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '8px', borderRadius: '10px', display: 'flex' }}>
              <MessageSquare size={20} color="#e5a823" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '800', margin: 0, color: '#ffffff' }}>
                Mis Mensajes y Conversaciones
              </h2>
              <span style={{ fontSize: '0.75rem', color: '#d1fae5' }}>
                Centro Universitario UAEM Ecatepec
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button 
              onClick={onRefreshMessages} 
              className="btn btn-secondary" 
              style={{ padding: '6px 10px', fontSize: '0.75rem', background: 'rgba(255,255,255,0.15)', color: '#ffffff', border: 'none' }}
              title="Actualizar mensajes"
              disabled={loading}
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <button className="modal-close" style={{ color: '#ffffff', position: 'static' }} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Pestañas: Mensajes recibidos en mis ventas vs mensajes que envié */}
        <div style={{ display: 'flex', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '6px 12px', gap: '8px' }}>
          <button
            onClick={() => setActiveTab('selling')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === 'selling' ? '#ffffff' : 'transparent',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: activeTab === 'selling' ? '#004d26' : '#64748b',
              boxShadow: activeTab === 'selling' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Mis Ventas (Compradores)</span>
            {totalSellingUnread > 0 && (
              <span style={{ 
                background: '#dc2626', 
                color: '#ffffff', 
                fontSize: '0.68rem', 
                fontWeight: '800', 
                padding: '2px 7px', 
                borderRadius: '12px' 
              }}>
                {totalSellingUnread}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('buying')}
            style={{
              flex: 1,
              padding: '10px 12px',
              border: 'none',
              background: activeTab === 'buying' ? '#ffffff' : 'transparent',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '0.85rem',
              color: activeTab === 'buying' ? '#004d26' : '#64748b',
              boxShadow: activeTab === 'buying' ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <span>Mis Consultas (Vendedores)</span>
            {totalBuyingUnread > 0 && (
              <span style={{ 
                background: '#004d26', 
                color: '#ffffff', 
                fontSize: '0.68rem', 
                fontWeight: '800', 
                padding: '2px 7px', 
                borderRadius: '12px' 
              }}>
                {totalBuyingUnread}
              </span>
            )}
          </button>
        </div>

        {/* Lista de Conversaciones */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px', background: '#f1f5f9' }}>
          {displayedList.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '48px 20px', background: '#ffffff', borderRadius: '14px', border: '1px dashed #cbd5e1', margin: 'auto 0' }}>
              <ShoppingBag size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#0f172a' }}>
                {activeTab === 'selling' ? 'No tienes mensajes de compradores aún' : 'No has iniciado ninguna conversación'}
              </h3>
              <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '6px', maxWidth: '340px', margin: '6px auto 0 auto', lineHeight: '1.5' }}>
                {activeTab === 'selling' 
                  ? 'Cuando otro estudiante de CU Ecatepec te pregunte por un libro, calculadora o artículo publicado, aparecerá aquí.' 
                  : 'Explora el catálogo y da clic en "Contactar / Acordar Entrega" para escribirle al vendedor.'}
              </p>
            </div>
          ) : (
            displayedList.map(convo => {
              const hasUnread = convo.unreadCount > 0;
              return (
                <div
                  key={convo.key}
                  onClick={() => onOpenConversation(convo.product)}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    padding: '14px 16px',
                    border: hasUnread ? '1.5px solid #004d26' : '1px solid #e2e8f0',
                    boxShadow: hasUnread ? '0 3px 8px rgba(0, 77, 38, 0.08)' : '0 1px 3px rgba(0,0,0,0.03)',
                    cursor: 'pointer',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                >
                  {/* Avatar con Inicial */}
                  <div style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    background: hasUnread ? '#004d26' : '#e2e8f0',
                    color: hasUnread ? '#ffffff' : '#475569',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '800',
                    fontSize: '1.1rem',
                    flexShrink: 0,
                  }}>
                    {convo.partnerName ? convo.partnerName[0].toUpperCase() : 'U'}
                  </div>

                  {/* Información Central */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                      <span style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.92rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {convo.partnerName}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <Clock size={11} /> {formatTime(convo.lastMessageTime)}
                      </span>
                    </div>

                    {/* Título del Producto */}
                    <div style={{ fontSize: '0.78rem', color: '#004d26', fontWeight: '700', marginBottom: '3px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      📦 {convo.product.title} {convo.product.price ? `• $${convo.product.price} MXN` : ''}
                    </div>

                    {/* Último Mensaje */}
                    <p style={{
                      fontSize: '0.82rem',
                      color: hasUnread ? '#0f172a' : '#64748b',
                      fontWeight: hasUnread ? '700' : '400',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {convo.lastMessage}
                    </p>
                  </div>

                  {/* Badge de No Leído o Flecha */}
                  <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {hasUnread ? (
                      <span style={{
                        background: '#dc2626',
                        color: '#ffffff',
                        fontSize: '0.72rem',
                        fontWeight: '800',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                      }}>
                        🔴 Nuevo
                      </span>
                    ) : (
                      <ArrowRight size={18} color="#94a3b8" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
