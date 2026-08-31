import React, { useState } from 'react';
import { X, Send, ShieldCheck, MapPin } from 'lucide-react';

export default function ChatModal({ activeChatProduct, user, onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 'm1',
      sender: 'seller',
      senderName: activeChatProduct?.seller_name || 'Vendedor Universitario',
      text: `¡Hola! Gracias por tu interés en: "${activeChatProduct?.title || 'este artículo'}". ¿En qué horario te gustaría verlo en el campus?`,
      time: 'Hace un momento',
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMsg = {
      id: `m-${Date.now()}`,
      sender: 'user',
      senderName: user?.fullName || 'Tú',
      text: inputMessage.trim(),
      time: 'Ahora',
    };

    setMessages([...messages, newMsg]);
    setInputMessage('');

    // Respuesta simulada automática
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        {
          id: `m-bot-${Date.now()}`,
          sender: 'seller',
          senderName: activeChatProduct?.seller_name || 'Vendedor Universitario',
          text: 'Perfecto, puedo entregártelo mañana en el campus entre clases. ¿Te queda bien en la explanada central?',
          time: 'Ahora',
        }
      ]);
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px', padding: '0', overflow: 'hidden', display: 'flex', flexDirection: 'column', height: '540px' }} onClick={(e) => e.stopPropagation()}>
        {/* Header del Chat */}
        <div style={{ background: '#004d26', color: '#ffffff', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: '#e5a823' }}>
              {activeChatProduct?.seller_name || 'Chat con Vendedor'}
            </h3>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} color="#e5a823" />
              <span>{activeChatProduct?.faculty_name || 'Campus Universitario'}</span>
            </div>
          </div>
          <button className="modal-close" style={{ color: '#ffffff', position: 'static' }} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Banner de Producto Vinculado */}
        {activeChatProduct && (
          <div style={{ background: '#f8fafc', padding: '10px 16px', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem' }}>
            <span style={{ fontWeight: '600', color: '#0f172a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '300px' }}>
              📦 {activeChatProduct.title}
            </span>
            <span style={{ fontWeight: '800', color: '#004d26' }}>
              ${activeChatProduct.price} MXN
            </span>
          </div>
        )}

        {/* Mensajes */}
        <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', background: '#f1f5f9' }}>
          {messages.map(msg => {
            const isMe = msg.sender === 'user';
            return (
              <div 
                key={msg.id} 
                style={{ 
                  alignSelf: isMe ? 'flex-end' : 'flex-start',
                  maxWidth: '80%',
                  background: isMe ? '#004d26' : '#ffffff',
                  color: isMe ? '#ffffff' : '#0f172a',
                  padding: '12px 16px',
                  borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.04)',
                }}
              >
                {!isMe && (
                  <div style={{ fontSize: '0.72rem', fontWeight: '700', color: '#004d26', marginBottom: '2px' }}>
                    {msg.senderName}
                  </div>
                )}
                <div style={{ fontSize: '0.88rem', lineHeight: '1.4' }}>{msg.text}</div>
                <div style={{ fontSize: '0.68rem', textAlign: 'right', marginTop: '4px', opacity: 0.7 }}>
                  {msg.time}
                </div>
              </div>
            );
          })}
        </div>

        {/* Formulario de envío */}
        <form onSubmit={handleSend} style={{ padding: '14px', background: '#ffffff', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '8px' }}>
          <input 
            type="text" 
            className="form-input" 
            placeholder="Escribe un mensaje para acordar punto de entrega..." 
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
          />
          <button type="submit" className="btn btn-primary" style={{ padding: '0 16px' }}>
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
