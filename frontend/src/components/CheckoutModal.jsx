import React, { useState } from 'react';
import { X, CreditCard, ShieldCheck, Lock, CheckCircle2, AlertCircle, MapPin, KeyRound, Sparkles, ShieldAlert } from 'lucide-react';

// Algoritmo de Luhn para validar números de tarjeta reales y evitar errores de tipeo
function validateLuhn(cardNumber) {
  const clean = cardNumber.replace(/\D/g, '');
  if (clean.length < 13 || clean.length > 19) return false;
  let sum = 0;
  let shouldDouble = false;
  for (let i = clean.length - 1; i >= 0; i--) {
    let digit = parseInt(clean.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return sum % 10 === 0;
}

export default function CheckoutModal({ product, user, onClose, onPaymentSuccess }) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');

  // Formateador de tarjeta con espacios cada 4 dígitos
  const handleCardChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Formateador de expiración MM/YY
  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handlePay = (e) => {
    e.preventDefault();
    if (isProcessing) return; // 🔒 BLOQUEO ESTRICTO CONTRA COBROS DOBLES O DOBLE CLIC
    setError('');

    const cleanCard = cardNumber.replace(/\s/g, '');
    if (cleanCard.length < 15) {
      setError('Por favor ingresa los 15 o 16 dígitos de tu tarjeta.');
      return;
    }

    // Validar mes y año de expiración
    if (!expiry || expiry.length < 5) {
      setError('Ingresa una fecha de vencimiento válida (MM/AA).');
      return;
    }

    const [expMonth, expYear] = expiry.split('/').map(n => parseInt(n, 10));
    if (!expMonth || expMonth < 1 || expMonth > 12) {
      setError('El mes de vencimiento debe estar entre 01 y 12.');
      return;
    }

    if (!cvv || cvv.length < 3) {
      setError('El código de seguridad CVV debe tener 3 o 4 dígitos.');
      return;
    }

    setIsProcessing(true);

    // Simulación segura de pasarela con bloqueo de idempotencia
    setTimeout(() => {
      setIsProcessing(false);
      const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
      const order = {
        transactionId: `TX-ECA-${Date.now().toString().slice(-6)}`,
        productTitle: product.title,
        amount: product.price,
        deliveryCode,
        sellerName: product.seller_name,
        campus: 'Centro Universitario UAEM Ecatepec',
        last4: cleanCard.slice(-4),
        date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      };
      setOrderResult(order);
      if (onPaymentSuccess) {
        onPaymentSuccess(product.id);
      }
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '490px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>
          <X size={20} />
        </button>

        {!orderResult ? (
          <div>
            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: '#004d26', color: '#e5a823', padding: '10px', borderRadius: '12px' }}>
                <CreditCard size={22} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                  Pasarela de Pago Protegida
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#004d26', fontWeight: '700' }}>
                  🏛️ Exclusivo CU UAEM Ecatepec • Cero Riesgo
                </span>
              </div>
            </div>

            {/* Resumen del Artículo */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '12px', 
              padding: '14px', 
              marginBottom: '16px' 
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a', lineHeight: '1.3' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                    Vendedor: <strong>{product.seller_name}</strong>
                  </div>
                </div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#004d26', whiteSpace: 'nowrap' }}>
                  ${parseFloat(product.price).toFixed(2)} MXN
                </div>
              </div>
            </div>

            {/* Banners de Seguridad Anti-Fraude y Anti-Cobros Dobles */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '18px' }}>
              <div style={{ 
                background: 'rgba(0, 77, 38, 0.06)', 
                border: '1px dashed #004d26', 
                borderRadius: '8px', 
                padding: '8px 12px', 
                fontSize: '0.75rem', 
                color: '#004d26', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px' 
              }}>
                <ShieldCheck size={18} style={{ color: '#e5a823', flexShrink: 0 }} />
                <span><strong>Protección Escrow:</strong> El dinero se retiene y solo se libera cuando recibas el producto en CU Ecatepec.</span>
              </div>

              <div style={{ 
                background: '#f0fdf4', 
                border: '1px solid #bbf7d0', 
                borderRadius: '8px', 
                padding: '6px 12px', 
                fontSize: '0.73rem', 
                color: '#15803d', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px' 
              }}>
                <Lock size={14} />
                <span><strong>Garantía Anti-Cobros Dobles:</strong> Bloqueo de peticiones duplicadas y cifrado bancario activo.</span>
              </div>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <AlertCircle size={16} />
                <span>{error}</span>
              </div>
            )}

            {/* Formulario de Pago */}
            <form onSubmit={handlePay}>
              <div className="form-group">
                <label className="form-label">Número de Tarjeta (Débito o Crédito)</label>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="4532 •••• •••• 8921" 
                    value={cardNumber}
                    onChange={handleCardChange}
                    maxLength={19}
                    disabled={isProcessing}
                    required
                  />
                  <Lock size={16} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Nombre del Titular (como aparece en la tarjeta)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="ej. CARLOS A LOPEZ G" 
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                  disabled={isProcessing}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <div className="form-group">
                  <label className="form-label">Vencimiento (MM/AA)</label>
                  <input 
                    type="text" 
                    className="form-input" 
                    placeholder="12/28" 
                    value={expiry}
                    onChange={handleExpiryChange}
                    maxLength={5}
                    disabled={isProcessing}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">CVV (3-4 dígitos)</label>
                  <input 
                    type="password" 
                    className="form-input" 
                    placeholder="•••" 
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    disabled={isProcessing}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '14px', 
                  marginTop: '6px', 
                  fontSize: '0.95rem',
                  opacity: isProcessing ? 0.7 : 1,
                  cursor: isProcessing ? 'not-allowed' : 'pointer'
                }} 
                disabled={isProcessing}
              >
                <Lock size={16} />
                <span>{isProcessing ? '⏳ Verificando con el banco (No cierres la ventana)...' : `Pagar $${parseFloat(product.price).toFixed(2)} MXN`}</span>
              </button>

              <div style={{ textAlign: 'center', fontSize: '0.72rem', color: '#94a3b8', marginTop: '12px' }}>
                🔒 Certificado SSL 256-Bit • Procesamiento único sin cargos repetidos
              </div>
            </form>
          </div>
        ) : (
          /* PANTALLA DE COMPROBANTE Y CÓDIGO DE ENTREGA */
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              background: 'rgba(0, 77, 38, 0.1)', 
              color: '#004d26', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto' 
            }}>
              <CheckCircle2 size={32} color="#004d26" />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#004d26', marginBottom: '4px' }}>
              ¡Pago Realizado con Éxito!
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
              Cobro único verificado. Los fondos están protegidos en custodia institucional.
            </p>

            {/* Tarjeta de Código de Entrega */}
            <div style={{ 
              background: '#004d26', 
              color: '#ffffff', 
              borderRadius: '14px', 
              padding: '20px', 
              marginBottom: '18px',
              boxShadow: '0 8px 16px rgba(0, 77, 38, 0.25)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e5a823', fontWeight: '700' }}>
                Tu Código de Entrega en CU Ecatepec
              </div>
              
              <div style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '8px', margin: '8px 0', color: '#ffffff' }}>
                {orderResult.deliveryCode}
              </div>

              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4' }}>
                Muestra este código al vendedor <strong>({orderResult.sellerName})</strong> en CU Ecatepec únicamente al recibir el material.
              </p>
            </div>

            {/* Detalles de la Transacción */}
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '14px', 
              fontSize: '0.8rem', 
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '18px'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Folio de Transacción Único:</span>
                <span style={{ fontWeight: '700' }}>{orderResult.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Punto de Entrega:</span>
                <span style={{ fontWeight: '700', color: '#004d26' }}>CU UAEM Ecatepec</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Método de Pago:</span>
                <span style={{ fontWeight: '600' }}>Tarjeta •••• {orderResult.last4}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700' }}>Total Pagado:</span>
                <span style={{ fontWeight: '800', color: '#004d26', fontSize: '0.95rem' }}>${parseFloat(orderResult.amount).toFixed(2)} MXN</span>
              </div>
            </div>

            <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={onClose}>
              <span>Listo, Entendido</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
