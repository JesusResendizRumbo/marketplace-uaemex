import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowLeft } from 'lucide-react';
import { api } from '../services/api.js';

export default function AuthModal({ initialMode = 'login', onClose, onAuthSuccess }) {
  const [mode, setMode] = useState(initialMode); // 'login', 'register', 'otp', 'forgot', 'reset'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [simulatedOtp, setSimulatedOtp] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith('@alumno.uaemex.mx') && !normalized.endsWith('@profesor.uaemex.mx') && !normalized.endsWith('@uaemex.mx')) {
      setError('Debes ingresar un correo institucional válido (@alumno.uaemex.mx o @profesor.uaemex.mx).');
      return;
    }

    setLoading(true);
    const res = await api.register({ email: normalized, password, fullName });
    setLoading(false);

    if (res.success) {
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
      }
      setMode('otp');
    } else {
      setError(res.error || 'Error al registrar la cuenta.');
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.verifyOTP(email, otp);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Código OTP inválido.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.login(email, password);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Credenciales inválidas.');
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.forgotPassword(email);
    setLoading(false);

    if (res.success) {
      if (res.simulatedOtp) {
        setSimulatedOtp(res.simulatedOtp);
      }
      setSuccessMsg('Te hemos enviado un código de recuperación a tu correo.');
      setMode('reset');
    } else {
      setError(res.error || 'No se pudo procesar la solicitud.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.resetPassword(email, otp, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('¡Contraseña cambiada con éxito! Ya puedes iniciar sesión con tu nueva contraseña.');
      setMode('login');
    } else {
      setError(res.error || 'Código OTP inválido o expirado.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {/* Encabezado */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ 
            width: '48px', 
            height: '48px', 
            background: 'rgba(0, 77, 38, 0.1)', 
            color: '#004d26', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            <ShieldCheck size={26} />
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Registro Institucional'}
            {mode === 'otp' && 'Verificación de Cuenta'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
            {mode === 'reset' && 'Nueva Contraseña'}
          </h2>
          <p style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            {mode === 'otp' ? `Ingresa el código enviado a ${email}` : 
             mode === 'forgot' ? 'Ingresa tu correo institucional @alumno.uaemex.mx' :
             mode === 'reset' ? 'Ingresa el código OTP y tu nueva contraseña' :
             'Acceso exclusivo para CU UAEM Ecatepec'}
          </p>
        </div>

        {error && (
          <div style={{ 
            background: '#fef2f2', 
            border: '1px solid #fecaca', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#b91c1c', 
            fontSize: '0.82rem',
            marginBottom: '16px' 
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div style={{ 
            background: '#f0fdf4', 
            border: '1px solid #bbf7d0', 
            borderRadius: '8px', 
            padding: '10px 14px', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px', 
            color: '#15803d', 
            fontSize: '0.82rem',
            marginBottom: '16px' 
          }}>
            <CheckCircle2 size={16} style={{ flexShrink: 0 }} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* MODO 1: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label className="form-label">Correo Institucional</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="ej. estudiante@alumno.uaemex.mx" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0 }}>Contraseña</label>
                <button 
                  type="button" 
                  onClick={() => { setMode('forgot'); setError(''); setSuccessMsg(''); }} 
                  style={{ background: 'none', border: 'none', color: '#004d26', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}
                >
                  ¿Olvidaste tu contraseña?
                </button>
              </div>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              ¿Aún no tienes cuenta?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('register'); setError(''); setSuccessMsg(''); }} 
                style={{ background: 'none', border: 'none', color: '#004d26', fontWeight: '700', cursor: 'pointer' }}
              >
                Regístrate gratis
              </button>
            </div>
          </form>
        )}

        {/* MODO 2: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Correo Institucional Registrado</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="ej. tu.nombre@alumno.uaemex.mx" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Te enviaremos un código OTP de 6 dígitos para crear una nueva clave.
              </span>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Enviando código...' : 'Enviar Código de Recuperación'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(''); }} 
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.82rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} /> Volver a Iniciar Sesión
              </button>
            </div>
          </form>
        )}

        {/* MODO 3: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            {simulatedOtp && (
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '8px', borderRadius: '8px', marginBottom: '14px', textAlign: 'center', fontSize: '0.8rem', color: '#854d0e' }}>
                💡 Código de prueba para desarrollo: <strong>{simulatedOtp}</strong>
              </div>
            )}

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label">Código OTP de 6 dígitos</label>
              <input 
                type="text" 
                className="form-input" 
                maxLength={6} 
                placeholder="654321" 
                style={{ textAlign: 'center', fontSize: '1.4rem', letterSpacing: '6px', fontWeight: '800', width: '200px', margin: '0 auto' }}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña (Mínimo 8 caracteres)</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="NuevaContraseña123!" 
                minLength={8}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Guardando...' : 'Cambiar Contraseña'}</span>
            </button>
          </form>
        )}

        {/* MODO 4: REGISTRO */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Carlos Alberto López García" 
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Correo Universitario (@alumno.uaemex.mx)</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="tunombre@alumno.uaemex.mx" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Contraseña (Mínimo 8 caracteres)</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
                minLength={8}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Generando código...' : 'Crear Cuenta y Validar OTP'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              ¿Ya tienes cuenta?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(''); }} 
                style={{ background: 'none', border: 'none', color: '#004d26', fontWeight: '700', cursor: 'pointer' }}
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* MODO 5: OTP REGISTRO */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            {simulatedOtp && (
              <div style={{ background: '#fefce8', border: '1px solid #fef08a', padding: '10px', borderRadius: '8px', marginBottom: '16px', textAlign: 'center', fontSize: '0.82rem', color: '#854d0e' }}>
                💡 Código de prueba para desarrollo: <strong>{simulatedOtp}</strong>
              </div>
            )}

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label">Código numérico de 6 dígitos</label>
              <input 
                type="text" 
                className="form-input" 
                maxLength={6} 
                placeholder="123456" 
                style={{ textAlign: 'center', fontSize: '1.6rem', letterSpacing: '6px', fontWeight: '800', width: '220px', margin: '0 auto' }}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px' }} disabled={loading}>
              <span>{loading ? 'Verificando...' : 'Confirmar y Entrar'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
