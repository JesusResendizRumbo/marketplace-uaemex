import React, { useState, useEffect, useRef } from 'react';
import { X, Send, ShieldCheck, Lock, User, RefreshCw, MessageSquare, ArrowLeft, CheckCircle2, DollarSign, RotateCcw } from 'lucide-react';
import { api } from '../services/api.js';

export default function ChatModal({ activeChatProduct, user, onClose, onOpenAuth, onBackToInbox, onUpdateProductStatus }) {
  const isLostItem = activeChatProduct?.isLostItem;
  const isLost = activeChatProduct?.type === 'lost';
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Cargar mensajes reales de Supabase en vivo
  const loadMessages = async () => {
    if (!activeChatProduct?.id) return;
    try {
      const data = await api.getMessages(activeChatProduct.id);
      if (Array.isArray(data)) {
        setMessages(data);
        // Marcar como leídos los mensajes que van dirigidos a este usuario
        if (user?.email) {
          const myEmail = user.email.toLowerCase();
          const unreadForMe = data.filter(m => !m.is_read && m.receiver_email?.toLowerCase() === myEmail);
          unreadForMe.forEach(m => api.markMessageAsRead(m.id));
        }
      }
    } catch (err) {
      console.warn('Error cargando mensajes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;
    loadMessages();
    // Sondeo en vivo cada 3 segundos para recibir respuestas de otros alumnos en tiempo real
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [activeChatProduct?.id, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Si el usuario no ha iniciado sesión, bloquear y exigir registro institucional
  if (!user) {
    return (
      <div className="modal-overlay" onClick={onClose}>
        <div 
          className="modal-content" 
          style={{ maxWidth: '440px', padding: '28px', textAlign: 'center' }} 
          onClick={(e) => e.stopPropagation()}
        >
          <div style={{ 
            width: '60px', 
            height: '60px', 
            borderRadius: '50%', 
            background: 'rgba(0, 77, 38, 0.1)', 
            color: '#004d26', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            margin: '0 auto 16px auto' 
          }}>
            <Lock size={30} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', marginBottom: '8px' }}>
            Inicia sesión para contactar
          </h3>

          <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: '1.5', marginBottom: '24px' }}>
            Por la seguridad de la comunidad de <strong>CU Ecatepec</strong>, solo los alumnos y egresados verificados con correo institucional (<strong>@alumno, @egresado o @uaemex.mx</strong>) pueden enviar y recibir mensajes para acordar entregas.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              className="btn btn-primary" 
              style={{ width: '100%', padding: '12px' }}
              onClick={() => {
                onClose();
                if (onOpenAuth) onOpenAuth('login');
              }}
            >
              <User size={18} />
              <span>Iniciar Sesión / Registrarse</span>
            </button>

            <button 
              className="btn btn-secondary" 
              style={{ width: '100%', padding: '10px' }}
              onClick={onClose}
            >
              Volver al Catálogo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Determinar si el usuario actual es el vendedor del artículo
  const isSeller = Boolean(
    user?.email && (
      (activeChatProduct?.seller_email && activeChatProduct.seller_email.toLowerCase() === user.email.toLowerCase()) ||
      (activeChatProduct?.user_id && activeChatProduct.user_id === user.id) ||
      (activeChatProduct?.seller_id && activeChatProduct.seller_id === user.id)
    )
  );

  // Resolver quién es el interlocutor (la otra persona con la que hablo)
  let resolvedPartnerEmail = activeChatProduct?.partnerEmail || '';
  let resolvedPartnerName = activeChatProduct?.partnerName || '';

  if (!resolvedPartnerEmail && messages.length > 0 && user?.email) {
    const myEmail = user.email.toLowerCase();
    const otherMsg = messages.find(m => m.sender_email && m.sender_email.toLowerCase() !== myEmail);
    if (otherMsg) {
      resolvedPartnerEmail = otherMsg.sender_email;
      resolvedPartnerName = otherMsg.sender_name;
    }
  }

  if (!resolvedPartnerEmail) {
    if (isSeller) {
      resolvedPartnerEmail = '';
      resolvedPartnerName = 'Comprador Interesado';
    } else {
      resolvedPartnerEmail = activeChatProduct?.seller_email || activeChatProduct?.reporter_email || '';
      resolvedPartnerName = activeChatProduct?.seller_name || activeChatProduct?.reporter_name || (isLostItem ? 'Reportante' : 'Vendedor Universitario');
    }
  }

  const partnerName = resolvedPartnerName || (isSeller ? 'Comprador Interesado' : 'Vendedor Universitario');

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const text = inputMessage.trim();
    setInputMessage('');
    setSending(true);

    const targetRecipientEmail = resolvedPartnerEmail || (isSeller ? '' : (activeChatProduct?.seller_email || ''));
    const targetRecipientName = partnerName;

    const payload = {
      product_id: activeChatProduct.id,
      product_title: activeChatProduct.title || 'Artículo de CU Ecatepec',
      sender_email: user.email,
      sender_name: user.fullName || user.email.split('@')[0].replace('.', ' '),
      receiver_email: targetRecipientEmail,
      receiver_name: targetRecipientName,
      content: text,
    };

    // Mensaje optimista local
    const tempMsg = {
      id: `temp-${Date.now()}`,
      product_id: activeChatProduct.id,
      sender_email: user.email,
      sender_name: user.fullName || 'Tú',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    try {
      await api.sendMessage(payload);
      // Recargar desde Supabase para confirmar ID y fecha exacta
      await loadMessages();
    } catch (err) {
      console.warn('Error enviando mensaje:', err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '540px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '560px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header del Chat */}
        <div style={{ background: '#004d26', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {onBackToInbox && (
              <button 
                onClick={onBackToInbox}
                style={{ 
                  background: 'rgba(255,255,255,0.15)', 
                  border: 'none', 
                  color: '#ffffff', 
                  cursor: 'pointer', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                }}
                title="Volver a la bandeja de mensajes"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  width: '10px', 
                  height: '10px', 
                  borderRadius: '50%', 
                  background: '#4ade80', 
                  display: 'inline-block',
                  boxShadow: '0 0 6px #4ade80' 
                }}></span>
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>
                  {partnerName}
                </h3>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#fef08a', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <ShieldCheck size={14} color="#e5a823" />
                <span>{isSeller ? (resolvedPartnerEmail || 'Compañero CU UAEM Ecatepec') : (activeChatProduct?.faculty_name || 'Comunidad CU UAEM Ecatepec')}</span>
              </div>
            </div>
          </div>
          <button className="modal-close" style={{ color: '#ffffff', position: 'static' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Banner de Producto o Reporte Vinculado */}
        {activeChatProduct && (
          <div style={{ background: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
              {isLostItem ? (isLost ? '🔴 Extraviado: ' : '🟢 Encontrado: ') : '📦 '}
              {activeChatProduct.title}
            </span>
            <span style={{ fontWeight: '800', color: '#004d26', fontSize: '0.8rem' }}>
              {isLostItem ? (activeChatProduct.location_details || 'CU Ecatepec') : `$${activeChatProduct.price} MXN`}
            </span>
          </div>
        )}

        {/* Barra de Acción Rápida: Vendido por Efectivo para el Vendedor */}
        {isSeller && !isLostItem && activeChatProduct && (
          <div style={{ 
            background: activeChatProduct.status === 'sold' ? '#ecfdf5' : '#f0fdf4', 
            borderBottom: '1px solid #bbf7d0', 
            padding: '8px 16px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            fontSize: '0.78rem',
            gap: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#166534' }}>
              <CheckCircle2 size={15} color="#059669" />
              <span>
                {activeChatProduct.status === 'sold' 
                  ? 'Venta en efectivo concretada (Producto liberado).' 
                  : '¿Acordaron el pago en efectivo en CU Ecatepec?'}
              </span>
            </div>
            {activeChatProduct.status === 'sold' ? (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('¿Deseas reactivar este producto como DISPONIBLE en el catálogo?')) {
                    if (onUpdateProductStatus) onUpdateProductStatus(activeChatProduct.id, 'available');
                  }
                }}
                style={{
                  background: '#ffffff',
                  color: '#166534',
                  border: '1px solid #bbf7d0',
                  padding: '3px 9px',
                  borderRadius: '6px',
                  fontSize: '0.72rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <RotateCcw size={12} />
                <span>Reactivar</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={async () => {
                  if (window.confirm(`¿Confirmas que ya entregaste "${activeChatProduct.title}" y recibiste el pago en efectivo en CU Ecatepec?\n\nSe marcará como VENDIDO y liberado.`)) {
                    if (onUpdateProductStatus) {
                      await onUpdateProductStatus(activeChatProduct.id, 'sold');
                    }
                    const closeMsg = {
                      product_id: activeChatProduct.id,
                      product_title: activeChatProduct.title || 'Artículo de CU Ecatepec',
                      sender_email: user.email,
                      sender_name: user.fullName || user.email.split('@')[0].replace('.', ' '),
                      receiver_email: resolvedPartnerEmail || '',
                      receiver_name: partnerName,
                      content: '🤝 ¡Trato cerrado! He marcado el artículo como entregado y pagado en efectivo en CU Ecatepec. ¡Muchas gracias!',
                    };
                    try {
                      await api.sendMessage(closeMsg);
                      loadMessages();
                    } catch (err) {
                      console.warn('Error enviando mensaje de cierre:', err);
                    }
                  }
                }}
                style={{
                  background: '#059669',
                  color: '#ffffff',
                  border: 'none',
                  padding: '5px 11px',
                  borderRadius: '6px',
                  fontSize: '0.74rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  boxShadow: '0 2px 4px rgba(5, 150, 105, 0.2)'
                }}
              >
                <DollarSign size={13} />
                <span>Marcar Vendido por Efectivo</span>
              </button>
            )}
          </div>
        )}

        {/* Mensajes en Vivo */}
        <div style={{ flex: 1, padding: '16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', background: '#f1f5f9' }}>
          {loading && messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#64748b', fontSize: '0.85rem' }}>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 8px auto', color: '#004d26' }} />
              Conectando con el chat en vivo de CU Ecatepec...
            </div>
          ) : messages.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #cbd5e1', margin: 'auto 0' }}>
              <MessageSquare size={36} style={{ color: '#004d26', margin: '0 auto 10px auto', opacity: 0.8 }} />
              <div style={{ fontWeight: '700', color: '#0f172a', fontSize: '0.95rem' }}>Aún no hay mensajes en esta conversación</div>
              <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', maxWidth: '320px', margin: '4px auto 0 auto' }}>
                Escribe un mensaje para acordar la hora y punto de entrega dentro de las instalaciones de CU Ecatepec.
              </p>
            </div>
          ) : (
            messages.map(msg => {
              const isMe = (msg.sender_email && user?.email && msg.sender_email.toLowerCase() === user.email.toLowerCase()) || 
                           (msg.sender_id && user?.id === msg.sender_id) || 
                           (msg.sender_name && user?.fullName && msg.sender_name === user.fullName);
              
              const timeDisplay = msg.created_at 
                ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : 'Ahora';

              return (
                <div 
                  key={msg.id} 
                  style={{ 
                    alignSelf: isMe ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    background: isMe ? '#004d26' : '#ffffff',
                    color: isMe ? '#ffffff' : '#0f172a',
                    padding: '10px 14px',
                    borderRadius: isMe ? '16px 16px 3px 16px' : '16px 16px 16px 3px',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                    border: isMe ? 'none' : '1px solid #e2e8f0',
                  }}
                >
                  {!isMe && (
                    <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#004d26', marginBottom: '2px' }}>
                      {msg.sender_name || partnerName}
                    </div>
                  )}
                  <div style={{ fontSize: '0.88rem', lineHeight: '1.4', wordBreak: 'break-word' }}>
                    {msg.content || msg.text}
                  </div>
                  <div style={{ 
                    fontSize: '0.65rem', 
                    textAlign: 'right', 
                    marginTop: '4px', 
                    color: isMe ? '#d1fae5' : '#94a3b8' 
                  }}>
                    {timeDisplay}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Formulario de envío de mensaje real */}
        <form onSubmit={handleSend} style={{ padding: '12px 16px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Escribe un mensaje para acordar la entrega..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={sending}
            style={{ borderRadius: '24px', padding: '10px 16px' }}
          />
          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ borderRadius: '50%', width: '42px', height: '42px', padding: 0, flexShrink: 0 }}
            disabled={sending || !inputMessage.trim()}
          >
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
