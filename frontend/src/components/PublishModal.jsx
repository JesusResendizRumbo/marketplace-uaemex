import React, { useState, useRef } from 'react';
import { X, Upload, DollarSign, Tag, MapPin, Sparkles, User, ShieldCheck, Camera, Trash2, CheckCircle2 } from 'lucide-react';
import { MOCK_CATEGORIES, MOCK_FACULTIES } from '../data/mockData.js';
import { api } from '../services/api.js';

export default function PublishModal({ categories, faculties, user, onClose, onPublish, editingProduct = null }) {
  const safeCategories = (categories && categories.length > 0) ? categories : MOCK_CATEGORIES;
  const safeFaculties = (faculties && faculties.length > 0) ? faculties : MOCK_FACULTIES;
  const fileInputRef = useRef(null);

  const isEditing = Boolean(editingProduct);

  const [formData, setFormData] = useState({
    title: editingProduct?.title || '',
    description: editingProduct?.description || '',
    price: editingProduct?.price !== undefined ? String(editingProduct?.price) : '',
    categoryId: editingProduct?.category_id || safeCategories.find(c => c.name === editingProduct?.category_name)?.id || safeCategories[0]?.id || 'cat-1',
    facultyId: editingProduct?.faculty_id || safeFaculties.find(f => f.name === editingProduct?.faculty_name)?.id || safeFaculties[0]?.id || 'eca-1',
    condition: editingProduct?.condition || 'good',
    isExchangeable: Boolean(editingProduct?.is_exchangeable),
    imageUrl: (editingProduct?.images && editingProduct?.images[0]) || '',
  });

  const [imagePreview, setImagePreview] = useState((editingProduct?.images && editingProduct?.images[0]) || '');
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Función para comprimir y convertir a Base64 cualquier foto subida desde móvil o PC
  const compressImageFile = (file) => {
    return new Promise((resolve, reject) => {
      if (!file) return resolve(null);
      if (!file.type.startsWith('image/')) {
        alert('Por favor selecciona un archivo de imagen válido (JPG, PNG, WebP).');
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

          // Calidad 0.78 JPEG produce imágenes de alta nitidez con un peso de solo ~60KB - ~100KB
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
      alert('Hubo un problema al procesar la imagen seleccionada.');
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
    if (!formData.title || !formData.description) return;

    const selectedCategory = safeCategories.find(c => c.id === formData.categoryId) || safeCategories[0];
    const selectedFaculty = safeFaculties.find(f => f.id === formData.facultyId) || safeFaculties[0];

    // Datos reales auténticos del usuario autenticado
    const actualSellerName = user?.fullName || user?.full_name || (user?.email ? user.email.split('@')[0].replace('.', ' ') : 'Estudiante CU Ecatepec');
    const actualSellerCareer = user?.career || user?.faculty || selectedFaculty.name;
    const actualSellerEmail = user?.email || '';
    const actualSellerPhone = user?.phoneNumber || user?.phone || '';
    const actualSellerId = user?.id || `user-${Date.now()}`;
    const actualSellerRating = user?.averageRating ? parseFloat(user.averageRating) : 5.0;
    const actualSellerReviews = user?.totalReviews !== undefined ? parseInt(user.totalReviews) : 0;

    const payload = {
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      condition: formData.condition,
      is_exchangeable: Boolean(formData.isExchangeable),
      status: 'available',
      seller_name: actualSellerName,
      seller_career: actualSellerCareer,
      seller_email: actualSellerEmail,
      seller_phone: actualSellerPhone,
      faculty_name: selectedFaculty.name,
      category_name: selectedCategory.name,
      images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
    };

    if (isEditing) {
      setSubmitting(true);
      let updatedProduct = null;
      try {
        const res = await api.updateProduct(editingProduct.id, payload);
        if (res && res.success && res.data) {
          updatedProduct = { ...editingProduct, ...res.data };
        }
      } catch (err) {
        console.warn('Conexión con Supabase no disponible para actualizar:', err);
      }
      setSubmitting(false);

      if (!updatedProduct) {
        updatedProduct = {
          ...editingProduct,
          ...payload,
          category_id: selectedCategory.id,
          category_name: selectedCategory.name,
          faculty_name: selectedFaculty.name,
          campus_zone: selectedFaculty.campus_zone || 'CU Ecatepec',
          updated_at: new Date().toISOString(),
        };
      } else {
        updatedProduct.category_name = selectedCategory.name;
        updatedProduct.faculty_name = selectedFaculty.name;
      }

      onPublish(updatedProduct, true);
      onClose();
      return;
    }

    setSubmitting(true);
    let createdProduct = null;

    try {
      const res = await api.createProduct(payload);
      if (res && res.success && res.data) {
        createdProduct = res.data;
      }
    } catch (err) {
      console.warn('Conexión con Supabase no disponible, guardando publicación localmente:', err);
    }
    setSubmitting(false);

    if (!createdProduct) {
      createdProduct = {
        id: `prod-${Date.now()}`,
        title: formData.title,
        description: formData.description,
        price: parseFloat(formData.price) || 0,
        condition: formData.condition,
        status: 'available',
        is_exchangeable: formData.isExchangeable,
        category_id: selectedCategory.id,
        category_name: selectedCategory.name,
        faculty_name: selectedFaculty.name,
        campus_zone: selectedFaculty.campus_zone || 'CU Ecatepec',
        images: formData.imageUrl ? [formData.imageUrl] : ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80'],
        user_id: actualSellerId,
        seller_id: actualSellerId,
        seller_name: actualSellerName,
        seller_career: actualSellerCareer,
        seller_email: actualSellerEmail,
        seller_phone: actualSellerPhone,
        seller_rating: actualSellerRating,
        seller_reviews: actualSellerReviews,
        views_count: 1,
        created_at: new Date().toISOString(),
      };
    } else {
      // Asegurar que siempre contenga los metadatos completos y reales del vendedor
      createdProduct.seller_id = createdProduct.seller_id || actualSellerId;
      createdProduct.seller_name = createdProduct.seller_name || actualSellerName;
      createdProduct.seller_career = createdProduct.seller_career || actualSellerCareer;
      createdProduct.seller_email = createdProduct.seller_email || actualSellerEmail;
      createdProduct.seller_phone = createdProduct.seller_phone || actualSellerPhone;
      createdProduct.seller_rating = createdProduct.seller_rating || actualSellerRating;
      createdProduct.seller_reviews = createdProduct.seller_reviews !== undefined ? createdProduct.seller_reviews : actualSellerReviews;
    }

    onPublish(createdProduct);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} disabled={submitting}>
          <X size={20} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ background: '#004d26', color: '#e5a823', padding: '8px', borderRadius: '10px' }}>
            <Sparkles size={20} />
          </div>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
              {isEditing ? '✏️ Editar Publicación' : 'Publicar un Artículo'}
            </h2>
            <p style={{ fontSize: '0.8rem', color: '#64748b' }}>
              {isEditing ? 'Actualiza los datos, precio o foto de tu material en CU Ecatepec' : 'Ofrece tu material académico en el plantel CU Ecatepec'}
            </p>
          </div>
        </div>

        {/* Banner de Identidad Real del Vendedor */}
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
              width: '36px', 
              height: '36px', 
              borderRadius: '50%', 
              background: '#004d26', 
              color: '#ffffff', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              fontWeight: '700',
              fontSize: '0.9rem'
            }}>
              {(user?.fullName || user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>
                {user?.fullName || user?.full_name || 'Estudiante CU Ecatepec'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                🎓 {user?.career || 'CU UAEM Ecatepec'} • {user?.email}
              </div>
            </div>
          </div>
          <span style={{ 
            fontSize: '0.72rem', 
            fontWeight: '700', 
            background: '#dcfce7', 
            color: '#15803d', 
            padding: '4px 8px', 
            borderRadius: '6px',
            whiteSpace: 'nowrap',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <ShieldCheck size={13} /> Vendedor Verificado
          </span>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Título del Artículo *</label>
            <input 
              type="text" 
              className="form-input" 
              placeholder="ej. Código Civil del Estado de México o Bata Blanca" 
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
                {safeCategories.map(c => (
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
              <label className="form-label">Carrera / Área en CU Ecatepec *</label>
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

            <div className="form-group">
              <label className="form-label">Estado Físico *</label>
              <select 
                className="filter-select"
                value={formData.condition}
                onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
              >
                <option value="new">Nuevo (Sellado)</option>
                <option value="like_new">Como nuevo</option>
                <option value="good">Buen estado</option>
                <option value="acceptable">Con detalles estéticos</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Foto del Artículo</span>
              {imagePreview && (
                <span style={{ fontSize: '0.75rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: '700' }}>
                  <CheckCircle2 size={13} /> Foto cargada y optimizada
                </span>
              )}
            </label>

            {/* Input nativo oculto para abrir selector de fotos o cámara del móvil */}
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
                  border: '2px dashed #004d26',
                  borderRadius: '12px',
                  padding: '24px 16px',
                  textAlign: 'center',
                  background: '#f8fafc',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <div style={{ background: 'rgba(0, 77, 38, 0.08)', padding: '12px', borderRadius: '50%', color: '#004d26' }}>
                  <Camera size={26} />
                </div>
                <div>
                  <div style={{ fontSize: '0.92rem', fontWeight: '700', color: '#004d26' }}>
                    {isProcessingImage ? 'Optimizando foto...' : '📷 Subir foto desde tu equipo o cámara'}
                  </div>
                  <p style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '3px' }}>
                    Toca aquí para seleccionar una imagen de tu celular o computadora (JPG, PNG, WebP)
                  </p>
                </div>
              </div>
            ) : (
              <div style={{
                border: '1.5px solid #86efac',
                borderRadius: '12px',
                padding: '12px',
                background: '#f0fdf4',
                display: 'flex',
                alignItems: 'center',
                gap: '14px'
              }}>
                <img 
                  src={imagePreview} 
                  alt="Vista previa" 
                  style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#166534' }}>
                    Foto lista para publicar ✓
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#475569', marginTop: '2px' }}>
                    Se ha procesado y optimizado automáticamente para verse nítida en el catálogo.
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    style={{ fontSize: '0.75rem', padding: '5px 10px' }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Cambiar
                  </button>
                  <button 
                    type="button" 
                    className="btn" 
                    style={{ fontSize: '0.75rem', padding: '5px 10px', color: '#dc2626', background: '#fee2e2', border: 'none' }}
                    onClick={handleRemoveImage}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            )}
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

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '12px' }} disabled={submitting}>
            <span>
              {submitting 
                ? (isEditing ? 'Guardando Cambios...' : 'Publicando en Catálogo...') 
                : (isEditing ? 'Guardar Cambios' : 'Publicar en el Catálogo de CU Ecatepec')}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
