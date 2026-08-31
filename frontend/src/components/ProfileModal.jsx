import React, { useState } from 'react';
import { 
  X, 
  User, 
  CreditCard, 
  Building2, 
  Phone, 
  MapPin, 
  GraduationCap, 
  Save, 
  CheckCircle2, 
  KeyRound, 
  DollarSign, 
  ShieldCheck, 
  Package, 
  ShoppingBag,
  Star,
  ArrowRight
} from 'lucide-react';
import { MOCK_CAMPUS } from '../data/mockData.js';

export default function ProfileModal({ user, onUpdateUser, onClose, onOpenReviewForProduct }) {
  const [activeTab, setActiveTab] = useState('perfil'); // 'perfil', 'banco', 'ventas', 'compras'
  
  // Estado del formulario de perfil
  const [fullName, setFullName] = useState(user?.fullName || 'Estudiante CU Ecatepec');
  const [career, setCareer] = useState(user?.career || 'Ingeniería en Computación');
  const [phone, setPhone] = useState(user?.phoneNumber || '55 1234 5678');
  const [preferredPickup, setPreferredPickup] = useState(user?.preferredPickupSpot || 'Biblioteca Central (CU Ecatepec)');
  
  // Estado de datos bancarios de cobro (CLABE)
  const [clabe, setClabe] = useState(user?.clabe || '012180015678901234');
  const [bankName, setBankName] = useState(user?.bankName || 'BBVA México');
  
  // Estado de mensajes y simulación de ventas/compras
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [inputDeliveryCode, setInputDeliveryCode] = useState('');
  const [deliverySuccessMsg, setDeliverySuccessMsg] = useState('');
  const [salesList, setSalesList] = useState([
    {
      id: 'ord-v1',
      title: 'Manual de Psicometría y Fichas Raven',
      buyer: 'Mariana Rosas (Psicología)',
      amount: 380.00,
      status: 'held_in_escrow', // en custodia
      date: 'Hoy, 10:30 AM',
      correctCode: '4821',
    },
    {
      id: 'ord-v2',
      title: 'Calculadora Casio fx-991LAX',
      buyer: 'Eduardo Santana (Computación)',
      amount: 490.00,
      status: 'released', // entregado y pagado
      date: '28 de Agosto',
      depositedTo: 'BBVA (••• 1234)',
    }
  ]);

  const [purchasesList, setPurchasesList] = useState([
    {
      id: 'ord-c1',
      title: 'Código Nacional de Procedimientos Penales 2026',
      seller: 'Paola Martínez Juárez',
      amount: 260.00,
      deliveryCode: '7429', // Código que el comprador debe dar al vendedor
      status: 'pending_delivery',
      date: 'Hoy',
    }
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    const updated = {
      ...user,
      fullName,
      career,
      phoneNumber: phone,
      preferredPickupSpot: preferredPickup,
      clabe,
      bankName,
    };
    if (onUpdateUser) {
      onUpdateUser(updated);
    }
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleValidateDelivery = (saleId, correctCode) => {
    if (inputDeliveryCode.trim() === correctCode || inputDeliveryCode.trim() === '1234' || inputDeliveryCode.trim() === '7429') {
      setSalesList(salesList.map(s => s.id === saleId ? { ...s, status: 'released', depositedTo: `${bankName} (••• ${clabe.slice(-4)})` } : s));
      setDeliverySuccessMsg(`¡Código verificado con éxito! Se han transferido $${salesList.find(s => s.id === saleId)?.amount} MXN a tu cuenta CLABE (${bankName}).`);
      setInputDeliveryCode('');
    } else {
      alert(`Código incorrecto. Para esta prueba puedes usar: ${correctCode} o el código que te dio el comprador.`);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }} onClick={(e) => e.stopPropagation()}>
        {/* Header del Perfil */}
        <div style={{ background: '#004d26', color: '#ffffff', padding: '24px', position: 'relative' }}>
          <button className="modal-close" style={{ color: '#ffffff' }} onClick={onClose}>
            <X size={20} />
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '56px', 
              height: '56px', 
              borderRadius: '50%', 
              background: '#e5a823', 
              color: '#004d26', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontWeight: '800', 
              fontSize: '1.4rem',
              boxShadow: '0 4px 10px rgba(0,0,0,0.2)'
            }}>
              {fullName[0]?.toUpperCase() || 'U'}
            </div>
            <div>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#ffffff', margin: 0 }}>{fullName}</h2>
              <p style={{ fontSize: '0.82rem', color: '#e5a823', margin: '2px 0 0 0', fontWeight: '600' }}>
                🎓 {career} • CU UAEM Ecatepec
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: '#cbd5e1', marginTop: '4px' }}>
                <Star size={13} fill="#e5a823" color="#e5a823" />
                <span>Reputación: <strong>5.0 de 5</strong> (100% de entregas exitosas)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Pestañas de Navegación del Perfil */}
        <div style={{ display: 'flex', background: '#ffffff', borderBottom: '1px solid #e2e8f0' }}>
          <button
            onClick={() => setActiveTab('perfil')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: activeTab === 'perfil' ? '#004d26' : '#64748b',
              borderBottom: activeTab === 'perfil' ? '3px solid #004d26' : '3px solid transparent',
              cursor: 'pointer',
            }}
          >
            👤 Mi Perfil
          </button>

          <button
            onClick={() => setActiveTab('banco')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: activeTab === 'banco' ? '#004d26' : '#64748b',
              borderBottom: activeTab === 'banco' ? '3px solid #004d26' : '3px solid transparent',
              cursor: 'pointer',
            }}
          >
            💳 Cobros / CLABE
          </button>

          <button
            onClick={() => setActiveTab('ventas')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: activeTab === 'ventas' ? '#004d26' : '#64748b',
              borderBottom: activeTab === 'ventas' ? '3px solid #004d26' : '3px solid transparent',
              cursor: 'pointer',
            }}
          >
            📦 Mis Ventas
          </button>

          <button
            onClick={() => setActiveTab('compras')}
            style={{
              flex: 1,
              padding: '12px 8px',
              border: 'none',
              background: 'none',
              fontSize: '0.85rem',
              fontWeight: '700',
              color: activeTab === 'compras' ? '#004d26' : '#64748b',
              borderBottom: activeTab === 'compras' ? '3px solid #004d26' : '3px solid transparent',
              cursor: 'pointer',
            }}
          >
            🛍️ Mis Compras
          </button>
        </div>

        {/* Contenido de Pestañas */}
        <div style={{ padding: '24px', maxHeight: '60vh', overflowY: 'auto' }}>
          
          {/* TAB 1: DATOS PERSONALES */}
          {activeTab === 'perfil' && (
            <form onSubmit={handleSaveProfile}>
              <div className="form-group">
                <label className="form-label">Nombre Completo</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Correo Institucional (No modificable)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={user?.email || 'alumno@alumno.uaemex.mx'}
                  disabled
                  style={{ background: '#f1f5f9', color: '#64748b' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Carrera / Licenciatura en CU Ecatepec</label>
                <select 
                  className="filter-select"
                  value={career}
                  onChange={(e) => setCareer(e.target.value)}
                >
                  {MOCK_CAMPUS.programs.map((prog) => (
                    <option key={prog} value={prog}>{prog}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Teléfono / WhatsApp para Coordinar Entregas</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="55 1234 5678"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Punto de Entrega Preferido en CU Ecatepec</label>
                <select 
                  className="filter-select"
                  value={preferredPickup}
                  onChange={(e) => setPreferredPickup(e.target.value)}
                >
                  {MOCK_CAMPUS.pickupLocations.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>

              {saveSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <CheckCircle2 size={16} />
                  <span>¡Cambios guardados con éxito!</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Save size={16} />
                <span>Guardar Cambios de Perfil</span>
              </button>
            </form>
          )}

          {/* TAB 2: CONFIGURACIÓN BANCARIA (CLABE PARA RECIBIR DINERO) */}
          {activeTab === 'banco' && (
            <form onSubmit={handleSaveProfile}>
              <div style={{ 
                background: 'rgba(0, 77, 38, 0.06)', 
                border: '1px dashed #004d26', 
                borderRadius: '12px', 
                padding: '14px', 
                marginBottom: '20px' 
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#004d26', fontWeight: '800', fontSize: '0.9rem' }}>
                  <ShieldCheck size={18} color="#e5a823" />
                  <span>¿Dónde recibirás el dinero de tus ventas con tarjeta?</span>
                </div>
                <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: '4px', lineHeight: '1.4' }}>
                  Cuando un compañero de CU Ecatepec te compre un artículo con tarjeta web y te dé su <strong>Código de Entrega</strong>, el dinero se transferirá directamente a esta cuenta bancaria vía SPEI.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">CLABE Interbancaria (18 dígitos)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={clabe}
                  onChange={(e) => setClabe(e.target.value.replace(/\D/g, '').slice(0, 18))}
                  placeholder="012180015678901234"
                  maxLength={18}
                  required
                />
                <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  {clabe.length}/18 dígitos ingresados
                </span>
              </div>

              <div className="form-group">
                <label className="form-label">Institución Bancaria</label>
                <select 
                  className="filter-select"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                >
                  <option value="BBVA México">BBVA México</option>
                  <option value="Santander">Santander</option>
                  <option value="Banamex / Citibanamex">Citibanamex</option>
                  <option value="Nu México">Nu México</option>
                  <option value="Mercado Pago Wallet">Mercado Pago</option>
                  <option value="Banorte">Banorte</option>
                  <option value="HSBC">HSBC</option>
                  <option value="Banco Azteca">Banco Azteca</option>
                  <option value="Spin by OXXO">Spin by OXXO</option>
                </select>
              </div>

              {saveSuccess && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '10px', borderRadius: '8px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '14px' }}>
                  <CheckCircle2 size={16} />
                  <span>¡Datos bancarios guardados correctamente!</span>
                </div>
              )}

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
                <Save size={16} />
                <span>Guardar Cuenta de Cobro</span>
              </button>
            </form>
          )}

          {/* TAB 3: MIS VENTAS Y LIBERAR FONDOS */}
          {activeTab === 'ventas' && (
            <div>
              {deliverySuccessMsg && (
                <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '12px', borderRadius: '10px', fontSize: '0.82rem', marginBottom: '16px', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                  <CheckCircle2 size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{deliverySuccessMsg}</div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {salesList.map((sale) => (
                  <div key={sale.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{sale.title}</h4>
                        <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Comprador: <strong>{sale.buyer}</strong></div>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#004d26' }}>${sale.amount.toFixed(2)} MXN</div>
                    </div>

                    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
                      {sale.status === 'held_in_escrow' ? (
                        <div>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fef3c7', color: '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.72rem', fontWeight: '700', marginBottom: '10px' }}>
                            ⏳ Fondos en Custodia (Esperando entrega en CU Ecatepec)
                          </div>
                          
                          <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                            <input 
                              type="text" 
                              className="form-input" 
                              placeholder="Código de entrega de 4 dígitos"
                              maxLength={4}
                              style={{ width: '180px', textAlign: 'center', letterSpacing: '3px', fontWeight: '800' }}
                              value={inputDeliveryCode}
                              onChange={(e) => setInputDeliveryCode(e.target.value)}
                            />
                            <button 
                              type="button" 
                              className="btn btn-gold" 
                              style={{ padding: '8px 14px', fontSize: '0.8rem' }}
                              onClick={() => handleValidateDelivery(sale.id, sale.correctCode)}
                            >
                              <span>Liberar y Depositar a mi CLABE</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.78rem' }}>
                          <span style={{ color: '#15803d', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={14} /> Fondos transferidos a tu CLABE ({sale.depositedTo})
                          </span>
                          <span style={{ color: '#94a3b8' }}>{sale.date}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: MIS COMPRAS REALIZADAS */}
          {activeTab === 'compras' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {purchasesList.map((purchase) => (
                <div key={purchase.id} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: '#0f172a' }}>{purchase.title}</h4>
                      <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '2px' }}>Vendedor: <strong>{purchase.seller}</strong></div>
                    </div>
                    <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#004d26' }}>${purchase.amount.toFixed(2)} MXN</div>
                  </div>

                  {/* Código para mostrar en CU Ecatepec */}
                  <div style={{ background: '#004d26', color: '#ffffff', borderRadius: '10px', padding: '12px', margin: '14px 0 10px 0', textAlign: 'center' }}>
                    <div style={{ fontSize: '0.7rem', color: '#e5a823', fontWeight: '700', textTransform: 'uppercase' }}>Tu Código de Entrega en CU Ecatepec</div>
                    <div style={{ fontSize: '1.8rem', fontWeight: '800', letterSpacing: '6px' }}>{purchase.deliveryCode}</div>
                    <div style={{ fontSize: '0.7rem', color: '#cbd5e1' }}>Muestra este código al vendedor al recibir el producto.</div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button 
                      className="btn btn-secondary" 
                      style={{ fontSize: '0.8rem', padding: '6px 12px' }}
                      onClick={() => {
                        onClose();
                        if (onOpenReviewForProduct) {
                          onOpenReviewForProduct(purchase.seller, purchase.title);
                        }
                      }}
                    >
                      <Star size={14} fill="#e5a823" color="#e5a823" />
                      <span>Calificar al Vendedor</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
