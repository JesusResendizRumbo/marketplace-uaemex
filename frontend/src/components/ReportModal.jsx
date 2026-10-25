import React, { useState, useRef } from 'react';
import { X, Search, MapPin, Calendar, AlertCircle, CheckCircle2, ShieldCheck, Tag, Camera, Trash2 } from 'lucide-react';
import { MOCK_FACULTIES } from '../data/mockData.js';
import { api } from '../services/api.js';

export default function ReportModal({ faculties, user, initialType = 'lost', onClose, onReportCreated }) {
  const safeFaculties = (faculties && faculties.length > 0) ? faculties : MOCK_FACULTIES;
  const fileInputRef = useRef(null);

  const [type, setType] = useState(initialType || 'lost'); // 'lost' o 'found'
  const [formData, setFormData] = useState({
    title: '',
    facultyId: safeFaculties[0]?.id || 'eca-1',
    locationDetails: '',
    eventDate: new Date().toISOString().split('T')[0],
    description: '',
    imageUrl: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Compresión automática en canvas
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen (JPG, PNG, WebP).');
        return resolve(null);
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const maxDim = 900;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDim) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            }
          } else {
            if (height > maxDim) {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.78);
          resolve(compressedBase64);
        };
        img.onerror = () => reject(new Error('No se pudo procesar la imagen'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Error leyendo archivo'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsProcessingImage(true);
      const base64 = await compressImageFile(file);
      if (base64) {
        setImagePreview(base64);
        setFormData(prev => ({ ...prev, imageUrl: base64 }));
      }
    } catch (err) {
      console.error('Error procesando imagen:', err);
    } finally {
      setIsProcessingImage(false);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, imageUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.locationDetails || !formData.description) return;

    const selectedFaculty = safeFaculties.find(f => f.id === formData.facultyId) || safeFaculties[0];
    const reporterName = user?.fullName || user?.full_name || (user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Estudiante CU Ecatepec');
    const reporterEmail = user?.email || '';

    const payload = {
      title: formData.title,
      description: formData.description,
      location_details: formData.locationDetails,
      event_date: formData.eventDate,
      type,
      status: 'open',
      faculty_name: selectedFaculty.name,
      reporter_name: reporterName,
      reporter_email: reporterEmail,
      images: formData.imageUrl ? [formData.imageUrl] : [],
    };

    setSubmitting(true);
    let createdReport = null;

    try {
      const res = await api.createLostItem(payload);
      if (res && res.success && res.data) {
        createdReport = res.data;
      }
    } catch (err) {
      console.warn('Conexión con Supabase no disponible, guardando reporte localmente:', err);
    }
    setSubmitting(false);

    if (!createdReport) {
      createdReport = {
        id: `lost-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        location_details: formData.locationDetails,
        event_date: formData.eventDate,
        type,
        status: 'open',
        faculty_id: selectedFaculty.id,
        faculty_name: selectedFaculty.name,
        reporter_name: reporterName,
        reporter_email: reporterEmail,
        created_at: new Date().toISOString(),
      };
    } else {
      createdReport.reporter_name = createdReport.reporter_name || reporterName;
      createdReport.faculty_name = createdReport.faculty_name || selectedFaculty.name;
    }

    onReportCreated(createdReport);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '560px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={submitting}>
          <X size={20} />
        </button>

        {/* Encabezado */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#004d26', color: '#e5a823', padding: '8px', borderRadius: '10px' }}>
            <Search size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              Publicar Reporte de Objeto
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              Módulo solidario de ayuda para la comunidad de CU UAEM Ecatepec
            </p>
          </div>
        </div>

        {/* Banner de Identidad del Reportante */}
        <div style={{ 
          background: '#f8fafc', 
          border: '1px solid #e2e8f0', 
          borderRadius: '10px', 
          padding: '10px 14px', 
          marginBottom: '18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ 
              width: '34px', 
              height: '34px', 
              borderRadius: '50%', 
              background: '#004d26', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}>
              {(user?.fullName || user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                {user?.fullName || user?.full_name || 'Estudiante CU Ecatepec'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {user?.career || 'CU Ecatepec'} • {user?.email}
              </div>
            </div>
          </div>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: '700', 
            background: '#dcfce7', 
            color: '#15803d', 
            padding: '3px 8px', 
            borderRadius: '6px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={12} /> Alumno Verificado
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Selector de Tipo */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700' }}>Tipo de Reporte *</label>
            <select
              className="filter-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ marginBottom: '10px', fontWeight: '700', padding: '10px 12px' }}
            >
              <option value="lost">🔴 Objeto Extraviado / Perdido (Pido apoyo para recuperarlo)</option>
              <option value="found">🟢 Objeto Encontrado (Lo encontré en campus y busco a su dueño)</option>
            </select>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setType('lost')}
                style={{
                  padding: '12px 10px',
                  borderRadius: '10px',
                  border: type === 'lost' ? '2px solid #dc2626' : '1px solid #cbd5e1',
                  background: type === 'lost' ? '#fef2f2' : '#ffffff',
                  color: type === 'lost' ? '#b91c1c' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <AlertCircle size={18} color={type === 'lost' ? '#b91c1c' : '#94a3b8'} />
                <span>Objeto Extraviado</span>
              </button>

              <button
                type="button"
                onClick={() => setType('found')}
                style={{
                  padding: '12px 10px',
                  borderRadius: '10px',
                  border: type === 'found' ? '2px solid #004d26' : '1px solid #cbd5e1',
                  background: type === 'found' ? '#f0fdf4' : '#ffffff',
                  color: type === 'found' ? '#166534' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                <CheckCircle2 size={18} color={type === 'found' ? '#166534' : '#94a3b8'} />
                <span>Objeto Encontrado</span>
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="form-group">
            <label className="form-label">¿Qué objeto es? *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder={type === 'lost' ? "ej. Credencial UAEMex de Derecho o Calculadora Casio fx-991" : "ej. Bata de laboratorio blanca o Mochila negra con llavero"} 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Carrera o Área */}
            <div className="form-group">
              <label className="form-label">Carrera / Área en Campus *</label>
              <select 
                className="filter-select"
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              >
                {safeFaculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Fecha */}
            <div className="form-group">
              <label className="form-label">Fecha del Hallazgo / Extravío *</label>
              <input 
                type="date" 
                className="form-input" 
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              />
            </div>
          </div>

          {/* Lugar exacto */}
          <div className="form-group">
            <label className="form-label">Lugar Exacto dentro de CU Ecatepec *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ej. Jardineras del Edificio A, Aula 204 o Cafetería de Alumnos" 
              required
              value={formData.locationDetails}
              onChange={(e) => setFormData({ ...formData, locationDetails: e.target.value })}
            />
          </div>

          {/* Descripción */}
          <div className="form-group">
            <label className="form-label">Descripción Detallada y Puntos de Contacto *</label>
            <textarea 
              className="form-textarea" 
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          {/* Foto opcional del objeto */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Foto del Objeto (Opcional)</span>
              {imagePreview && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                  <CheckCircle2 size={13} /> Foto adjunta ✓
                </span>
              )}
            </label>

            <input 
              type="file" 
              ref={fileInputRef} 
              accept="image/*" 
              style={{ display: 'none' }} 
              onChange={handleFileChange}
            />

            {!imagePreview ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: '1.5px dashed #cbd5e1',
                  borderRadius: '10px',
                  padding: '16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <Camera size={20} style={{ color: '#004d26' }} />
                <span style={{ fontSize: '0.84rem', color: '#334155', fontWeight: '600' }}>
                  {isProcessingImage ? 'Procesando foto...' : '📷 Tomar foto con el celular o adjuntar imagen'}
                </span>
              </div>
            ) : (
              <div style={{
                border: '1px solid #86efac',
                borderRadius: '10px',
                padding: '10px',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Foto objeto" 
                  style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '6px' }} 
                />
                <div style={{ flex: 1, fontSize: '0.8rem', color: '#166534', fontWeight: '600' }}>
                  Foto lista para el reporte
                </div>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ fontSize: '0.75rem', padding: '4px 8px', color: '#dc2626', background: '#fee2e2', border: 'none' }}
                  onClick={handleRemoveImage}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            )}
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={submitting}
          >
            <span>
              {submitting 
                ? 'Registrando Reporte...' 
                : type === 'lost' 
                ? 'Publicar Búsqueda de Objeto Extraviado' 
                : 'Publicar Objeto Encontrado para Devolver'}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
