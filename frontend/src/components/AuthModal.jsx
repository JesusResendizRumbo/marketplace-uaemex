import React, { useState } from 'react';
import { X, ShieldCheck, Mail, Lock, User, KeyRound, AlertCircle, CheckCircle2, ArrowLeft, RefreshCw } from 'lucide-react';
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
  const [resending, setResending] = useState(false);

  // Registro: Envía los datos al backend y despacha el correo OTP real
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    const normalized = email.trim().toLowerCase();
    if (!normalized.endsWith('@alumno.uaemex.mx') && !normalized.endsWith('@profesor.uaemex.mx') && !normalized.endsWith('@uaemex.mx')) {
      setError('Debes ingresar tu correo institucional (@alumno.uaemex.mx o @profesor.uaemex.mx).');
      return;
    }

    setLoading(true);
    const res = await api.register({ email: normalized, password, fullName });
    setLoading(false);

    if (res.success) {
      setSuccessMsg(`Te hemos enviado un código de seguridad de 6 dígitos a tu correo: ${normalized}`);
      setMode('otp');
    } else {
      setError(res.error || 'Error al registrar la cuenta.');
    }
  };

  // Verificación OTP: Valida el código que el alumno recibió en su bandeja
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (otp.trim().length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código de verificación.');
      return;
    }

    setLoading(true);
    const res = await api.verifyOTP(email.trim().toLowerCase(), otp.trim());
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else {
      setError(res.error || 'Código OTP incorrecto o expirado.');
    }
  };

  // Reenviar código OTP
  const handleResendOtp = async () => {
    setError('');
    setResending(true);
    const res = await api.register({ email: email.trim().toLowerCase(), password: 'DUMMY_RESEND_PASSWORD_123', fullName });
    setResending(false);
    if (res.success) {
      setSuccessMsg('¡Nuevo código enviado a tu correo institucional!');
    } else {
      setError(res.error || 'No se pudo reenviar el código.');
    }
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const res = await api.login(email.trim().toLowerCase(), password);
    setLoading(false);

    if (res.success) {
      onAuthSuccess(res.user);
      onClose();
    } else if (res.requiresVerification) {
      setError('Tu cuenta requiere verificación por código OTP.');
      setMode('otp');
    } else {
      setError(res.error || 'Credenciales inválidas.');
    }
  };

  // Recuperar contraseña
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.forgotPassword(email.trim().toLowerCase());
    setLoading(false);

    if (res.success) {
      setSuccessMsg('Te hemos enviado un código de recuperación a tu correo institucional.');
      setMode('reset');
    } else {
      setError(res.error || 'No se pudo procesar la solicitud.');
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await api.resetPassword(email.trim().toLowerCase(), otp.trim(), newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMsg('¡Contraseña restablecida exitosamente! Ya puedes iniciar sesión.');
      setMode('login');
    } else {
      setError(res.error || 'Código OTP incorrecto o expirado.');
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
            width: '52px', 
            height: '52px', 
            background: 'rgba(0, 77, 38, 0.1)', 
            color: '#004d26', 
            borderRadius: '50%', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 12px auto'
          }}>
            {mode === 'otp' ? <KeyRound size={28} /> : <ShieldCheck size={28} />}
          </div>
          <h2 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
            {mode === 'login' && 'Iniciar Sesión'}
            {mode === 'register' && 'Registro Institucional UAEMex'}
            {mode === 'otp' && 'Verificación de Correo'}
            {mode === 'forgot' && 'Recuperar Contraseña'}
            {mode === 'reset' && 'Nueva Contraseña'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#64748b', marginTop: '4px' }}>
            {mode === 'otp' ? (
              <span>Código enviado a: <strong style={{ color: '#004d26' }}>{email}</strong></span>
            ) : (
              'Acceso exclusivo para Centro Universitario UAEM Ecatepec'
            )}
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

        {/* 🟢 MODO 1: LOGIN */}
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

        {/* 🟢 MODO 2: REGISTRO (DESPACHA EL OTP AL CORREO) */}
        {mode === 'register' && (
          <form onSubmit={handleRegister}>
            <div className="form-group">
              <label className="form-label">Nombre Completo</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="ej. Jesús Reséndiz Rumbo" 
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
              <span style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                Te enviaremos un código de seguridad de 6 dígitos a este correo institucional.
              </span>
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
              <span>{loading ? 'Enviando código a tu correo...' : 'Enviar Código de Verificación'}</span>
            </button>

            <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#64748b' }}>
              ¿Ya tienes cuenta?{' '}
              <button 
                type="button" 
                onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} 
                style={{ background: 'none', border: 'none', color: '#004d26', fontWeight: '700', cursor: 'pointer' }}
              >
                Inicia sesión aquí
              </button>
            </div>
          </form>
        )}

        {/* 🟢 MODO 3: VERIFICACIÓN OTP REAL */}
        {mode === 'otp' && (
          <form onSubmit={handleVerifyOtp}>
            <div style={{ 
              background: '#f8fafc', 
              border: '1px solid #e2e8f0', 
              borderRadius: '10px', 
              padding: '14px', 
              marginBottom: '18px',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.85rem', color: '#334155', lineHeight: '1.4' }}>
                Abre tu correo institucional <strong>{email}</strong> y escribe el código numérico de 6 dígitos que te enviamos.
              </div>
            </div>

            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label" style={{ fontWeight: '700' }}>Código OTP de 6 dígitos</label>
              <input 
                type="text" 
                className="form-input" 
                maxLength={6} 
                placeholder="123456" 
                style={{ textAlign: 'center', fontSize: '1.8rem', letterSpacing: '8px', fontWeight: '800', width: '220px', margin: '0 auto', color: '#004d26' }}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                autoFocus
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }} disabled={loading}>
              <span>{loading ? 'Verificando con el servidor...' : 'Verificar y Entrar'}</span>
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '18px' }}>
              <button 
                type="button" 
                onClick={() => { setMode('register'); setError(''); }} 
                style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <ArrowLeft size={14} /> Cambiar correo
              </button>

              <button 
                type="button" 
                onClick={handleResendOtp}
                disabled={resending}
                style={{ background: 'none', border: 'none', color: '#004d26', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
              >
                <RefreshCw size={14} className={resending ? 'animate-spin' : ''} /> {resending ? 'Reenviando...' : 'Reenviar código'}
              </button>
            </div>
          </form>
        )}

        {/* 🟢 MODO 4: FORGOT PASSWORD */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword}>
            <div className="form-group">
              <label className="form-label">Correo Institucional Registrado</label>
              <input 
                type="email" 
                className="form-input" 
                placeholder="tunombre@alumno.uaemex.mx" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
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

        {/* 🟢 MODO 5: RESET PASSWORD */}
        {mode === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group" style={{ textAlign: 'center' }}>
              <label className="form-label">Código OTP recibido en tu correo</label>
              <input 
                type="text" 
                className="form-input" 
                maxLength={6} 
                placeholder="123456" 
                style={{ textAlign: 'center', fontSize: '1.5rem', letterSpacing: '6px', fontWeight: '800', width: '200px', margin: '0 auto' }}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Nueva Contraseña (Mínimo 8 caracteres)</label>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••" 
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
      </div>
    </div>
  );
}
