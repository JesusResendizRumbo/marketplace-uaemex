import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import ProductCard from './components/ProductCard.jsx';
import ProductModal from './components/ProductModal.jsx';
import LostFoundSection from './components/LostFoundSection.jsx';
import PublishModal from './components/PublishModal.jsx';
import AuthModal from './components/AuthModal.jsx';
import ChatModal from './components/ChatModal.jsx';
import CheckoutModal from './components/CheckoutModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import ReviewModal from './components/ReviewModal.jsx';
import ReportModal from './components/ReportModal.jsx';
import { api } from './services/api.js';
import { 
  MOCK_FACULTIES, 
  MOCK_CATEGORIES, 
  MOCK_PRODUCTS, 
  MOCK_LOST_ITEMS 
} from './data/mockData.js';
import { 
  BookOpen, 
  FlaskConical, 
  Cpu, 
  Shirt, 
  Stethoscope, 
  Home, 
  Package, 
  SlidersHorizontal, 
  Search,
  Sparkles,
  ShoppingBag,
  HeartHandshake,
  PlusCircle
} from 'lucide-react';

const ICON_MAP = {
  BookOpen,
  FlaskConical,
  Cpu,
  Shirt,
  Stethoscope,
  Home,
  Package,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('catalog'); // 'catalog' o 'lost-found'
  const [products, setProducts] = useState(() => {
    try {
      const saved = localStorage.getItem('potrotrade_products');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) 
        ? parsed.filter(p => !p.id?.startsWith('prod-eca-') && !p.id?.startsWith('mock-'))
        : [];
    } catch {
      return [];
    }
  });
  const [categories, setCategories] = useState(MOCK_CATEGORIES);
  const [faculties, setFaculties] = useState(MOCK_FACULTIES);
  const [lostItems, setLostItems] = useState(() => {
    try {
      const saved = localStorage.getItem('potrotrade_lost_items');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      return Array.isArray(parsed) 
        ? parsed.filter(i => !i.id?.startsWith('lost-eca-') && !i.id?.startsWith('mock-'))
        : [];
    } catch {
      return [];
    }
  });
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('uaemex_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Modales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isPublishOpen, setIsPublishOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportModalInitialType, setReportModalInitialType] = useState('lost');
  const [authModalMode, setAuthModalMode] = useState(null); // null, 'login', 'register'
  const [activeChatProduct, setActiveChatProduct] = useState(null);
  const [checkoutProduct, setCheckoutProduct] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [reviewModalData, setReviewModalData] = useState(null);

  // Carga inicial y sincronización con el servidor
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [prods, cats, facs, lost] = await Promise.all([
          api.getProducts(),
          api.getCategories(),
          api.getFaculties(),
          api.getLostItems(),
        ]);
        if (cats && Array.isArray(cats) && cats.length > 0) setCategories(cats);
        if (facs && Array.isArray(facs) && facs.length > 0) setFaculties(facs);

        // Sincronizar productos reales del servidor con publicaciones locales guardadas
        let localProds = [];
        try {
          const saved = localStorage.getItem('potrotrade_products');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              localProds = parsed.filter(p => !p.id?.startsWith('prod-eca-') && !p.id?.startsWith('mock-'));
            }
          }
        } catch {}

        const serverProds = Array.isArray(prods) ? prods.filter(p => !p.id?.startsWith('prod-eca-') && !p.id?.startsWith('mock-')) : [];
        const combinedProdsMap = new Map();
        serverProds.forEach(p => combinedProdsMap.set(p.id, p));
        localProds.forEach(p => {
          if (!combinedProdsMap.has(p.id)) combinedProdsMap.set(p.id, p);
        });
        const finalProds = Array.from(combinedProdsMap.values());
        setProducts(finalProds);
        localStorage.setItem('potrotrade_products', JSON.stringify(finalProds));

        // Sincronizar reportes de objetos perdidos
        let localLost = [];
        try {
          const saved = localStorage.getItem('potrotrade_lost_items');
          if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed)) {
              localLost = parsed.filter(i => !i.id?.startsWith('lost-eca-') && !i.id?.startsWith('mock-'));
            }
          }
        } catch {}

        const serverLost = Array.isArray(lost) ? lost.filter(i => !i.id?.startsWith('lost-eca-') && !i.id?.startsWith('mock-')) : [];
        const combinedLostMap = new Map();
        serverLost.forEach(i => combinedLostMap.set(i.id, i));
        localLost.forEach(i => {
          if (!combinedLostMap.has(i.id)) combinedLostMap.set(i.id, i);
        });
        const finalLost = Array.from(combinedLostMap.values());
        setLostItems(finalLost);
        localStorage.setItem('potrotrade_lost_items', JSON.stringify(finalLost));
      } catch (err) {
        console.warn('Conectando con backend...', err.message);
      }
    }
    loadInitialData();
  }, []);

  // Filtrar productos
  const filteredProducts = products.filter(p => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const matchTitle = p.title.toLowerCase().includes(q);
      const matchDesc = p.description.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc) return false;
    }
    if (selectedCategory && p.category_id !== selectedCategory) return false;
    if (selectedFaculty && p.faculty_name !== selectedFaculty) return false;
    if (selectedCondition && p.condition !== selectedCondition) return false;
    if (maxPrice && parseFloat(p.price) > parseFloat(maxPrice)) return false;
    return true;
  });

  const handlePublish = (product, isEdit = false) => {
    setProducts(prev => {
      let updated;
      if (isEdit) {
        updated = prev.map(p => p.id === product.id ? product : p);
      } else {
        updated = [product, ...prev.filter(p => p.id !== product.id)];
      }
      try {
        localStorage.setItem('potrotrade_products', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error guardando publicación en localStorage:', err);
      }
      return updated;
    });
    setEditingProduct(null);
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(null);
    setEditingProduct(product);
    setIsPublishOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.deleteProduct(productId);
    } catch (err) {
      console.warn('Error eliminando publicación en Supabase:', err);
    }
    setProducts(prev => {
      const updated = prev.filter(p => p.id !== productId);
      try {
        localStorage.setItem('potrotrade_products', JSON.stringify(updated));
      } catch (err) {
        console.warn('Error actualizando localStorage tras borrar:', err);
      }
      return updated;
    });
    setSelectedProduct(null);
  };

  const handleStartChat = (product) => {
    setSelectedProduct(null);
    setActiveChatProduct(product);
  };

  const handleStartCheckout = (product) => {
    setSelectedProduct(null);
    setCheckoutProduct(product);
  };

  const handleOpenReportModal = (type = 'lost') => {
    if (!user) {
      setAuthModalMode('login');
      return;
    }
    setReportModalInitialType(type);
    setIsReportOpen(true);
  };

  const handleContactReporter = (item) => {
    setActiveChatProduct({
      isLostItem: true,
      id: item.id,
      title: item.title,
      type: item.type,
      seller_name: item.reporter_name || 'Compañero Universitario',
      seller_email: item.reporter_email,
      faculty_name: item.faculty_name || 'CU UAEM Ecatepec',
      location_details: item.location_details,
      event_date: item.event_date
    });
  };

  const handleResolveLostItem = async (itemId) => {
    const token = localStorage.getItem('uaemex_token') || user?.token;
    try {
      if (token) {
        await api.resolveLostItem(itemId, token);
      }
    } catch (err) {
      console.warn('Error resolviendo objeto en backend:', err.message);
    }
    setLostItems(prev => {
      const updated = prev.map(item => item.id === itemId ? { ...item, status: 'resolved' } : item);
      try {
        localStorage.setItem('potrotrade_lost_items', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  return (
    <div>
      {/* Barra de Navegación */}
      <Navbar 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        onOpenAuth={(mode) => setAuthModalMode(mode)}
        onOpenPublish={() => {
          if (!user) {
            setAuthModalMode('login');
          } else {
            setIsPublishOpen(true);
          }
        }}
        onLogout={() => {
          localStorage.removeItem('uaemex_user');
          setUser(null);
        }}
        onOpenChat={() => setActiveChatProduct(products[0])}
        onOpenProfile={() => setIsProfileOpen(true)}
      />

      {/* Hero Institucional */}
      <Hero 
        totalProducts={products.length}
        onExploreClick={() => {
          setActiveTab('catalog');
          document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenPublish={() => {
          if (!user) setAuthModalMode('login');
          else setIsPublishOpen(true);
        }}
      />

      {/* Contenido Principal */}
      <main className="container" id="main-content" style={{ paddingBottom: '60px' }}>
        {/* Selector de Pestañas */}
        <div className="tabs-nav">
          <button 
            className={`tab-btn ${activeTab === 'catalog' ? 'active' : ''}`}
            onClick={() => setActiveTab('catalog')}
          >
            <ShoppingBag size={18} />
            <span>Catálogo de Artículos ({filteredProducts.length})</span>
          </button>

          <button 
            className={`tab-btn ${activeTab === 'lost-found' ? 'active' : ''}`}
            onClick={() => setActiveTab('lost-found')}
          >
            <HeartHandshake size={18} />
            <span>Objetos Perdidos UAEMex ({lostItems.length})</span>
          </button>
        </div>

        {/* VISTA 1: CATÁLOGO DE PRODUCTOS */}
        {activeTab === 'catalog' && (
          <div className="marketplace-layout">
            {/* Barra lateral de filtros */}
            <aside className="filters-sidebar">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', color: '#004d26' }}>
                <SlidersHorizontal size={20} />
                <h3 style={{ fontSize: '1.05rem', fontWeight: '800' }}>Filtros de Búsqueda</h3>
              </div>

              {/* Filtro por Carrera */}
              <div className="filter-group">
                <label className="filter-title">Carrera</label>
                <select 
                  className="filter-select"
                  value={selectedFaculty}
                  onChange={(e) => setSelectedFaculty(e.target.value)}
                >
                  <option value="">Todas las carreras</option>
                  {(faculties.length > 0 ? faculties : MOCK_FACULTIES).map(f => (
                    <option key={f.id} value={f.name}>{f.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Categoría (Lista Desplegable) */}
              <div className="filter-group">
                <label className="filter-title">Categoría</label>
                <select 
                  className="filter-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">Todas las categorías</option>
                  {(categories.length > 0 ? categories : MOCK_CATEGORIES).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro por Estado */}
              <div className="filter-group">
                <label className="filter-title">Condición</label>
                <select 
                  className="filter-select"
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                >
                  <option value="">Cualquier condición</option>
                  <option value="new">Nuevo (Sellado)</option>
                  <option value="like_new">Como nuevo</option>
                  <option value="good">Buen estado</option>
                  <option value="acceptable">Con detalles</option>
                </select>
              </div>

              {/* Filtro por Precio Máximo */}
              <div className="filter-group">
                <label className="filter-title">Precio Máximo ($ MXN)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="ej. 500" 
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                />
              </div>

              {(selectedCategory || selectedFaculty || selectedCondition || maxPrice || searchQuery) && (
                <button 
                  className="btn btn-secondary" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '8px' }}
                  onClick={() => {
                    setSelectedCategory('');
                    setSelectedFaculty('');
                    setSelectedCondition('');
                    setMaxPrice('');
                    setSearchQuery('');
                  }}
                >
                  Limpiar Filtros
                </button>
              )}
            </aside>

            {/* Grid de Productos */}
            <section>
              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
                  <ShoppingBag size={52} style={{ color: '#004d26', margin: '0 auto 16px auto', opacity: 0.85 }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Aún no hay publicaciones en el catálogo</h3>
                  <p style={{ fontSize: '0.88rem', color: '#64748b', marginTop: '8px', maxWidth: '440px', margin: '8px auto 20px auto', lineHeight: '1.5' }}>
                    Sé el primero de tu carrera en poner a la venta un libro, calculadora, bata o material universitario para la comunidad de CU Ecatepec.
                  </p>
                  <button 
                    className="btn btn-primary"
                    style={{ padding: '10px 22px', fontSize: '0.9rem', display: 'inline-flex', alignItems: 'center', gap: '8px', margin: '0 auto' }}
                    onClick={() => {
                      if (!user) setAuthModalMode('login');
                      else setIsPublishOpen(true);
                    }}
                  >
                    <PlusCircle size={18} />
                    <span>Publicar el Primer Artículo</span>
                  </button>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                  <Search size={40} style={{ color: '#94a3b8', margin: '0 auto 12px auto' }} />
                  <h3 style={{ fontSize: '1.2rem', fontWeight: '700', color: '#0f172a' }}>No encontramos artículos con esos filtros</h3>
                  <p style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '6px' }}>Intenta seleccionar otra facultad o restablecer los criterios de búsqueda.</p>
                </div>
              ) : (
                <div className="products-grid">
                  {filteredProducts.map(p => (
                    <ProductCard 
                      key={p.id} 
                      product={p} 
                      onSelectProduct={(prod) => setSelectedProduct(prod)} 
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* VISTA 2: OBJETOS PERDIDOS */}
        {activeTab === 'lost-found' && (
          <LostFoundSection 
            lostItems={lostItems}
            user={user}
            onOpenReportModal={handleOpenReportModal}
            onContactReporter={handleContactReporter}
            onResolveItem={handleResolveLostItem}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: '#00361a', color: '#cbd5e1', padding: '36px 0', borderTop: '4px solid #e5a823' }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>PotroTrade • CU UAEM Ecatepec</div>
            <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>Plataforma oficial de comercio universitario para la comunidad de CU Ecatepec.</p>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#cbd5e1', textAlign: 'right' }}>
            Patria, Ciencia y Trabajo • Ecatepec de Morelos, Estado de México
          </div>
        </div>
      </footer>

      {/* Modales */}
      {selectedProduct && (
        <ProductModal 
          product={selectedProduct} 
          user={user}
          onClose={() => setSelectedProduct(null)} 
          onStartChat={handleStartChat}
          onStartCheckout={handleStartCheckout}
          onEditProduct={handleEditProduct}
          onDeleteProduct={handleDeleteProduct}
        />
      )}

      {checkoutProduct && (
        <CheckoutModal 
          product={checkoutProduct}
          user={user}
          onClose={() => setCheckoutProduct(null)}
          onPaymentSuccess={(productId) => {
            setProducts(products.map(p => p.id === productId ? { ...p, status: 'reserved' } : p));
          }}
        />
      )}

      {isPublishOpen && (
        <PublishModal 
          categories={categories}
          faculties={faculties}
          user={user}
          editingProduct={editingProduct}
          onClose={() => {
            setIsPublishOpen(false);
            setEditingProduct(null);
          }}
          onPublish={handlePublish}
        />
      )}

      {authModalMode && (
        <AuthModal 
          initialMode={authModalMode}
          onClose={() => setAuthModalMode(null)}
          onAuthSuccess={(userData) => {
            localStorage.setItem('uaemex_user', JSON.stringify(userData));
            setUser(userData);
          }}
        />
      )}

      {activeChatProduct && (
        <ChatModal 
          activeChatProduct={activeChatProduct}
          user={user}
          onClose={() => setActiveChatProduct(null)}
        />
      )}

      {isProfileOpen && (
        <ProfileModal 
          user={user}
          onUpdateUser={(updated) => {
            localStorage.setItem('uaemex_user', JSON.stringify(updated));
            setUser(updated);
            // Sincronizar publicaciones del usuario con su nombre y carrera actualizados
            setProducts(prev => prev.map(p => {
              if (p.seller_id === updated.id || p.seller_email === updated.email || p.seller_name === user?.fullName) {
                return {
                  ...p,
                  seller_name: updated.fullName,
                  seller_career: updated.career,
                  seller_phone: updated.phoneNumber,
                };
              }
              return p;
            }));
          }}
          onClose={() => setIsProfileOpen(false)}
          onOpenReviewForProduct={(sellerName, productTitle) => {
            setReviewModalData({ sellerName, productTitle });
          }}
        />
      )}

      {reviewModalData && (
        <ReviewModal 
          sellerName={reviewModalData.sellerName}
          productTitle={reviewModalData.productTitle}
          onClose={() => setReviewModalData(null)}
          onSubmitReview={(review) => {
            console.log('Reseña guardada:', review);
          }}
        />
      )}

      {isReportOpen && (
        <ReportModal 
          initialType={reportModalInitialType}
          faculties={faculties}
          user={user}
          onClose={() => setIsReportOpen(false)}
          onReportCreated={(newReport) => {
            setLostItems(prev => {
              const updated = [newReport, ...prev.filter(i => i.id !== newReport.id)];
              try {
                localStorage.setItem('potrotrade_lost_items', JSON.stringify(updated));
              } catch (err) {
                console.warn('Error guardando reporte en localStorage:', err);
              }
              return updated;
            });
          }}
        />
      )}
    </div>
  );
}
