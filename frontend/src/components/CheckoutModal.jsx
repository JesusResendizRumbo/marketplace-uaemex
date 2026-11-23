import React, { useState } from 'react';
import { 
  X, 
  CreditCard, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Copy, 
  Check, 
  DollarSign, 
  Building, 
  Calendar, 
  Clock 
} from 'lucide-react';

// Algoritmo de Luhn para validar tarjetas reales
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

export default function CheckoutModal({ product, user, onClose, onPaymentSuccess, initialMethod = 'card' }) {
  // Modalidades: 'card' (Tarjeta), 'transfer' (Transferencia SPEI), 'cash' (Efectivo en mano)
  const [method, setMethod] = useState(initialMethod === 'transfer' ? 'transfer' : (initialMethod === 'cash' ? 'cash' : 'card'));
  
  // Estado para Tarjeta
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.fullName || '');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  
  // Estado para Transferencia SPEI
  const [copiedClabe, setCopiedClabe] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');

  // Estado para Efectivo en CU Ecatepec
  const [pickupSpot, setPickupSpot] = useState('Biblioteca Central (CU Ecatepec)');
  const [preferredSchedule, setPreferredSchedule] = useState('Turno Matutino (10:00 - 13:00 hrs)');

  // Estados generales
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderResult, setOrderResult] = useState(null);
  const [error, setError] = useState('');

  const speiClabe = '012 180 00123456789 5';
  const speiReference = `PT-${(product.id || 'ECA99').slice(0, 8).toUpperCase()}`;

  const handleCopy = (text, type) => {
    navigator.clipboard.writeText(text.replace(/\s/g, ''));
    if (type === 'clabe') {
      setCopiedClabe(true);
      setTimeout(() => setCopiedClabe(false), 2000);
    } else {
      setCopiedRef(true);
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleCardChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 3) {
      setExpiry(`${value.slice(0, 2)}/${value.slice(2)}`);
    } else {
      setExpiry(value);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setError('');

    // Validación según la modalidad elegida
    if (method === 'card') {
      const cleanCard = cardNumber.replace(/\s/g, '');
      if (cleanCard.length < 15) {
        setError('Por favor ingresa los 15 o 16 dígitos de tu tarjeta bancaria.');
        return;
      }
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
    }

    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();
      
      let methodLabel = 'Tarjeta Bancaria (Pago Protegido)';
      let details = `Tarjeta terminación •••• ${cardNumber.replace(/\s/g, '').slice(-4) || '8921'}`;

      if (method === 'transfer') {
        methodLabel = 'Transferencia Interbancaria SPEI (En Custodia)';
        details = `Folio / Rastreo SPEI: ${trackingNumber || 'SPEI-CU-VERIFICADO'}`;
      } else if (method === 'cash') {
        methodLabel = 'Efectivo contra Entrega en CU Ecatepec';
        details = `Punto de Encuentro: ${pickupSpot} • ${preferredSchedule}`;
      }

      const order = {
        transactionId: `TX-ECA-${Date.now().toString().slice(-6)}`,
        productTitle: product.title,
        amount: product.price,
        deliveryCode,
        sellerName: product.seller_name,
        campus: 'Centro Universitario UAEM Ecatepec',
        methodLabel,
        details,
        date: new Date().toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' }),
      };

      setOrderResult(order);
      if (onPaymentSuccess) {
        onPaymentSuccess(product.id, method);
      }
    }, 1200);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px', padding: '24px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={isProcessing}>
          <X size={20} />
        </button>

        {!orderResult ? (
          <div>
            {/* Encabezado */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <div style={{ background: '#004d26', color: '#e5a823', padding: '10px', borderRadius: '12px' }}>
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a', margin: 0 }}>
                  Modalidades de Pago • CU Ecatepec
                </h2>
                <span style={{ fontSize: '0.75rem', color: '#004d26', fontWeight: '700' }}>
                  🏛️ Exclusivo Comunidad Universitaria • Pago Protegido o en Mano
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
                  <div style={{ fontSize: '0.9rem', fontWeight: '800', color: '#0f172a', lineHeight: '1.3' }}>
                    {product.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '3px' }}>
                    Vendedor: <strong>{product.seller_name}</strong>
                  </div>
                </div>
                <div style={{ fontSize: '1.35rem', fontWeight: '800', color: '#004d26', whiteSpace: 'nowrap' }}>
                  ${parseFloat(product.price).toFixed(2)} MXN
                </div>
              </div>
            </div>

            {/* Selector de Modalidades de Pago */}
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: '1fr 1fr 1fr', 
              gap: '6px', 
              background: '#f1f5f9', 
              padding: '4px', 
              borderRadius: '10px', 
              marginBottom: '18px' 
            }}>
              <button
                type="button"
                onClick={() => { setMethod('card'); setError(''); }}
                style={{
                  padding: '9px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: method === 'card' ? '#004d26' : 'transparent',
                  color: method === 'card' ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <CreditCard size={16} />
                <span>Tarjeta</span>
              </button>

              <button
                type="button"
                onClick={() => { setMethod('transfer'); setError(''); }}
                style={{
                  padding: '9px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: method === 'transfer' ? '#004d26' : 'transparent',
                  color: method === 'transfer' ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <Building size={16} />
                <span>Transferencia</span>
              </button>

              <button
                type="button"
                onClick={() => { setMethod('cash'); setError(''); }}
                style={{
                  padding: '9px 4px',
                  borderRadius: '8px',
                  border: 'none',
                  background: method === 'cash' ? '#004d26' : 'transparent',
                  color: method === 'cash' ? '#ffffff' : '#475569',
                  fontSize: '0.78rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'all 0.15s ease'
                }}
              >
                <DollarSign size={16} />
                <span>Efectivo</span>
              </button>
            </div>

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '10px', borderRadius: '8px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                <AlertCircle size={16} style={{ flexShrink: 0 }} />
                <span>{error}</span>
              </div>
            )}

            {/* FORMULARIO SEGÚN LA MODALIDAD SELECCIONADA */}
            <form onSubmit={handleSubmit}>
              {/* MODALIDAD 1: TARJETA BANCARIA */}
              {method === 'card' && (
                <div>
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '8px 12px', 
                    fontSize: '0.75rem', 
                    color: '#15803d', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px',
                    marginBottom: '14px'
                  }}>
                    <Lock size={14} />
                    <span><strong>Pago Protegido:</strong> Tu dinero queda en custodia hasta que recibas el artículo en CU Ecatepec.</span>
                  </div>

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
                    <label className="form-label">Nombre del Titular</label>
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
                      <label className="form-label">CVV (3 dígitos)</label>
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
                </div>
              )}

              {/* MODALIDAD 2: TRANSFERENCIA SPEI */}
              {method === 'transfer' && (
                <div>
                  <div style={{ 
                    background: '#f0fdf4', 
                    border: '1px solid #bbf7d0', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    fontSize: '0.78rem', 
                    color: '#166534', 
                    marginBottom: '14px'
                  }}>
                    🏛️ <strong>Transferencia SPEI Universitaria:</strong> Realiza tu pago desde tu app bancaria (BBVA, Nu, Banorte, Santander, etc.). Tu dinero queda resguardado en custodia hasta que recibas el producto en CU Ecatepec.
                  </div>

                  <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '14px', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Banco Destino:</span>
                      <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>BBVA México / STP UAEMex</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Beneficiario:</span>
                      <strong style={{ fontSize: '0.82rem', color: '#004d26' }}>PotroTrade Custodia CU Ecatepec</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>CLABE Interbancaria:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontSize: '0.82rem', fontWeight: '800', color: '#0f172a' }}>{speiClabe}</code>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(speiClabe, 'clabe')}
                          style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedClabe ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                          <span>{copiedClabe ? 'Copiada' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Concepto / Referencia:</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <code style={{ fontSize: '0.82rem', fontWeight: '800', color: '#004d26' }}>{speiReference}</code>
                        <button 
                          type="button" 
                          onClick={() => handleCopy(speiReference, 'ref')}
                          style={{ background: '#e2e8f0', border: 'none', borderRadius: '4px', padding: '3px 6px', fontSize: '0.7rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                        >
                          {copiedRef ? <Check size={12} color="#15803d" /> : <Copy size={12} />}
                          <span>{copiedRef ? 'Copiado' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Número de Rastreo / Clave de Rastreo (Opcional)</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="ej. 202611234567890 o Folio de tu app" 
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              )}

              {/* MODALIDAD 3: EFECTIVO EN MANO */}
              {method === 'cash' && (
                <div>
                  <div style={{ 
                    background: '#fefce8', 
                    border: '1px solid #fef08a', 
                    borderRadius: '8px', 
                    padding: '10px 12px', 
                    fontSize: '0.78rem', 
                    color: '#854d0e', 
                    marginBottom: '14px'
                  }}>
                    🤝 <strong>Trato Directo en Efectivo:</strong> Aparta el artículo y acuerda encontrarte con tu compañero en un punto seguro dentro de <strong>CU Ecatepec</strong> para pagarle en mano al recibir el producto.
                  </div>

                  <div className="form-group">
                    <label className="form-label">Punto de Encuentro en CU Ecatepec</label>
                    <select 
                      className="form-select"
                      value={pickupSpot}
                      onChange={(e) => setPickupSpot(e.target.value)}
                      disabled={isProcessing}
                    >
                      <option value="Biblioteca Central (CU Ecatepec)">Biblioteca Central (Planta Baja)</option>
                      <option value="Cafetería Principal CU Ecatepec">Cafetería Principal</option>
                      <option value="Explanada de Rectoría / Entrada">Explanada Principal / Entrada</option>
                      <option value="Edificio A (Laboratorios de Computación)">Edificio A (Ingeniería y Computación)</option>
                      <option value="Edificio B (Salones de Clase)">Edificio B (Aulas)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Horario sugerido para el encuentro</label>
                    <select 
                      className="form-select"
                      value={preferredSchedule}
                      onChange={(e) => setPreferredSchedule(e.target.value)}
                      disabled={isProcessing}
                    >
                      <option value="Turno Matutino (10:00 - 13:00 hrs)">Turno Matutino (10:00 - 13:00 hrs)</option>
                      <option value="Turno Intermedio (13:00 - 15:00 hrs)">Turno Intermedio (13:00 - 15:00 hrs)</option>
                      <option value="Turno Vespertino (15:00 - 18:00 hrs)">Turno Vespertino (15:00 - 18:00 hrs)</option>
                    </select>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ 
                  width: '100%', 
                  padding: '13px', 
                  fontSize: '0.96rem', 
                  fontWeight: '800', 
                  marginTop: '10px' 
                }}
                disabled={isProcessing}
              >
                {isProcessing ? 'Procesando transacción...' : (
                  method === 'card' 
                    ? `Pagar $${parseFloat(product.price).toFixed(2)} MXN con Tarjeta`
                    : method === 'transfer'
                    ? `Confirmar Transferencia de $${parseFloat(product.price).toFixed(2)} MXN`
                    : `Apartar Artículo y Acordar Pago en Efectivo`
                )}
              </button>
            </form>
          </div>
        ) : (
          /* PANTALLA DE COMPROBANTE Y CONFIRMACIÓN */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{ 
              width: '60px', 
              height: '60px', 
              borderRadius: '50%', 
              background: '#ecfdf5', 
              border: '2px solid #86efac', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              margin: '0 auto 16px auto' 
            }}>
              <CheckCircle2 size={32} color="#004d26" />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: '800', color: '#004d26', marginBottom: '4px' }}>
              {method === 'cash' ? '¡Artículo Apartado con Éxito!' : '¡Pago Registrado con Éxito!'}
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '18px' }}>
              {method === 'cash' 
                ? 'Acude al punto de encuentro en CU Ecatepec para pagar en mano al vendedor.'
                : 'Fondos universitarios en custodia segura para tu entrega.'}
            </p>

            {/* Código de Entrega */}
            <div style={{ 
              background: '#004d26', 
              color: '#ffffff', 
              borderRadius: '14px', 
              padding: '20px', 
              marginBottom: '18px',
              boxShadow: '0 8px 16px rgba(0, 77, 38, 0.25)'
            }}>
              <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: '#e5a823', fontWeight: '700' }}>
                Código de Cita y Entrega en CU Ecatepec
              </div>
              
              <div style={{ fontSize: '2.4rem', fontWeight: '800', letterSpacing: '8px', margin: '8px 0', color: '#ffffff' }}>
                {orderResult.deliveryCode}
              </div>

              <p style={{ fontSize: '0.75rem', color: '#cbd5e1', lineHeight: '1.4', margin: 0 }}>
                Muestra este código al vendedor <strong>({orderResult.sellerName})</strong> en CU Ecatepec al momento del intercambio.
              </p>
            </div>

            {/* Resumen */}
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
                <span style={{ color: '#64748b' }}>Folio Oficial:</span>
                <span style={{ fontWeight: '700' }}>{orderResult.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Modalidad Elegida:</span>
                <span style={{ fontWeight: '700', color: '#004d26' }}>{orderResult.methodLabel}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#64748b' }}>Detalles:</span>
                <span style={{ fontWeight: '600' }}>{orderResult.details}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', paddingTop: '6px', marginTop: '4px' }}>
                <span style={{ fontWeight: '700' }}>Total:</span>
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
