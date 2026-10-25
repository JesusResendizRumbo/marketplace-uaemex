import React, { useState } from 'react';
import { X, Search, MapPin, Calendar, AlertCircle, CheckCircle2, ShieldCheck, Tag } from 'lucide-react';
import { MOCK_FACULTIES } from '../data/mockData.js';
import { api } from '../services/api.js';

export default function ReportModal({ faculties, user, onClose, onReportCreated }) {
  const safeFaculties = (faculties && faculties.length > 0) ? faculties : MOCK_FACULTIES;

  const [type, setType] = useState('found'); // 'found' o 'lost'
  const [formData, setFormData] = useState({
    title: '',
    facultyId: safeFaculties[0]?.id || 'eca-1',
    locationDetails: '',
    eventDate: new Date().toISOString().split('T')[0],
    description: '',
  });

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.locationDetails || !formData.description) return;

    const selectedFaculty = safeFaculties.find(f => f.id === formData.facultyId) || safeFaculties[0];
    const reporterName = user?.fullName || user?.full_name || (user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Estudiante CU Ecatepec');
    const reporterEmail = user?.email || '';

    const payload = {
      title: formData.title,
      description: formData.description,
      locationDetails: formData.locationDetails,
      eventDate: formData.eventDate,
      type,
      facultyId: selectedFaculty.id,
      images: [],
    };

    setSubmitting(true);
    let createdReport = null;

    try {
      const token = localStorage.getItem('uaemex_token') || user?.token;
      if (token) {
        const res = await api.createLostItem(payload, token);
        if (res && res.success && res.data) {
          createdReport = res.data;
        }
      }
    } catch (err) {
      console.warn('Conexión con backend no disponible, guardando reporte localmente:', err);
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
            <label className="form-label">Tipo de Reporte *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setType('found')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: type === 'found' ? '2px solid #004d26' : '1px solid #e2e8f0',
                  background: type === 'found' ? 'rgba(0, 77, 38, 0.08)' : '#ffffff',
                  color: type === 'found' ? '#004d26' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <CheckCircle2 size={16} /> Objeto Encontrado
              </button>

              <button
                type="button"
                onClick={() => setType('lost')}
                style={{
                  padding: '10px',
                  borderRadius: '10px',
                  border: type === 'lost' ? '2px solid #dc2626' : '1px solid #e2e8f0',
                  background: type === 'lost' ? 'rgba(220, 38, 38, 0.08)' : '#ffffff',
                  color: type === 'lost' ? '#dc2626' : '#64748b',
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <AlertCircle size={16} /> Objeto Extraviado
              </button>
            </div>
          </div>

          {/* Título */}
          <div className="form-group">
            <label className="form-label">¿Qué objeto es? *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ej. Credencial UAEMex de Derecho o Calculadora Casio fx-991" 
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
              rows="3" 
              placeholder="Describe color, marcas particulares, o si se dejó con vigilancia/biblioteca para reclamarlo."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', padding: '12px' }}
            disabled={submitting}
          >
            <span>{submitting ? 'Registrando Reporte...' : 'Publicar Reporte en el Tablón de CU Ecatepec'}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
