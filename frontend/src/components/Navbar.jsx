import React from 'react';
import { ShoppingBag, Search, PlusCircle, User, LogOut, MessageSquare } from 'lucide-react';

export default function Navbar({ 
  searchQuery, 
  setSearchQuery, 
  user, 
  onOpenAuth, 
  onOpenPublish, 
  onLogout,
  onOpenChat,
  onOpenProfile
}) {
  return (
    <header className="navbar">
      <div className="container nav-container">
        {/* Brand */}
        <div className="brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <div className="brand-icon">
            <ShoppingBag size={24} />
          </div>
          <div className="brand-text">
            <h1>PotroTrade</h1>
            <span>CU UAEM Ecatepec</span>
          </div>
        </div>

        {/* Search */}
        <div className="nav-search">
          <Search size={18} className="nav-search-icon" />
          <input 
            type="text" 
            placeholder="Buscar libros, calculadoras, batas, uniformes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <button className="btn btn-primary" onClick={onOpenPublish}>
                <PlusCircle size={18} />
                <span>Vender Artículo</span>
              </button>

              <button className="btn btn-secondary" onClick={onOpenChat} title="Mis Mensajes">
                <MessageSquare size={18} />
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: '6px' }}>
                <button 
                  onClick={onOpenProfile} 
                  className="btn btn-secondary"
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '20px' }}
                  title="Mi Perfil y Cobros"
                >
                  <div style={{ 
                    background: '#004d26', 
                    color: '#e5a823', 
                    width: '26px', 
                    height: '26px', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '0.8rem'
                  }}>
                    {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#004d26' }}>Mi Perfil / Cobros</span>
                </button>

                <button className="btn btn-secondary" style={{ padding: '8px' }} onClick={onLogout} title="Cerrar Sesión">
                  <LogOut size={16} />
                </button>
              </div>
            </>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={() => onOpenAuth('login')}>
                <User size={18} />
                <span>Ingresar</span>
              </button>
              <button className="btn btn-primary" onClick={() => onOpenAuth('register')}>
                <span>Registrarse (@uaemex)</span>
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
