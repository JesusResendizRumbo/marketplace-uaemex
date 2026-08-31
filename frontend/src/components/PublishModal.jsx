import React, { useState } from 'react';
import { X, Upload, DollarSign, Tag, MapPin, Sparkles } from 'lucide-react';

export default function PublishModal({ categories, faculties, onClose, onPublish }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    categoryId: categories[0]?.id || '',
    facultyId: faculties[0]?.id || '',
    condition: 'good',
    isExchangeable: false,
    imageUrl: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return;

    const newProduct = {
      id: `prod-${Date.now()}`,
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      condition: formData.condition,
      status: 'available',
      is_exchangeable: formData.isExchangeable,
      category_id: formData.categoryId,
      category_name: categories.find(c => c.id === formData.categoryId)?.name || 'Material de Estudio',
      faculty_name: faculties.find(f => f.id === formData.facultyId)?.name || 'Facultad de Ingeniería',
      campus_zone: faculties.find(f => f.id === formData.facultyId)?.campus_zone || 'CU',
      images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
      seller_name: 'Tú (Usuario UAEMex)',
      seller_career: 'Estudiante',
      seller_rating: 5.0,
      seller_reviews: 0,
      views_count: 1,
      created_at: new Date().toISOString(),
    };

    onPublish(newProduct);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ background: '#004d26', color: '#e5a823', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Publicar un Artículo</h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>Ofrece tu material académico a la comunidad universitaria</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título del Artículo *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ej. Bata blanca de laboratorio talla M" 
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Categoría *</label>
              <select 
                className="filter-select"
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              >
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Precio (MXN) *</label>
              <input 
                type="number" 
                className="form-input" 
                placeholder="0 = Donación" 
                min="0"
                step="5"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label">Facultad / Campus de Entrega *</label>
              <select 
                className="filter-select"
                value={formData.facultyId}
                onChange={(e) => setFormData({ ...formData, facultyId: e.target.value })}
              >
                {faculties.map(f => (
                  <option key={f.id} value={f.id}>{f.name} ({f.campus_zone})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Estado Físico *</label>
              <select 
                className="filter-select"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="new">Nuevo / Sin usar</option>
                <option value="like_new">Como nuevo</option>
                <option value="good">Buen estado</option>
                <option value="acceptable">Con detalles estéticos</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL de Imagen del Producto</label>
            <input 
              type="url" 
              className="form-input" 
              placeholder="https://images.unsplash.com/... (O déjalo vacío para usar imagen por defecto)"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Descripción Detallada *</label>
            <textarea 
              className="form-textarea" 
              rows="3" 
              placeholder="Describe el estado del material, semestre en que se usa, etc."
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            ></textarea>
          </div>

          <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input 
              type="checkbox" 
              id="exchange" 
              checked={formData.isExchangeable}
              onChange={(e) => setFormData({ ...formData, isExchangeable: e.target.checked })}
              style={{ accentColor: '#004d26', width: '16px', height: '16px' }}
            />
            <label htmlFor="exchange" style={{ fontSize: '0.85rem', color: '#475569', cursor: 'pointer' }}>
              Acepto intercambio por otro material académico de valor equivalente
            </label>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>
            <span>Publicar en el Catálogo UAEMex</span>
          </button>
        </form>
      </div>
    </div>
  );
}
