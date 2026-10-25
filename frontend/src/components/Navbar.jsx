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
            <ShoppingBag size={22} />
          </div>
          <div className="brand-text">
            <h1>PotroTrade</h1>
            <span>CU Ecatepec</span>
          </div>
        </div>

        {/* Search Desktop */}
        <div className="nav-search nav-search-desktop">
          <Search size={18} className="nav-search-icon" />
          <input 
            type="text" 
            placeholder="Buscar libros, calculadoras, batas, códigos..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Actions */}
        <div className="nav-actions">
          {user ? (
            <>
              <button className="btn btn-primary btn-publish-nav" onClick={onOpenPublish} title="Vender Artículo">
                <PlusCircle size={18} />
                <span className="btn-text-desktop">Vender Artículo</span>
                <span className="btn-text-mobile">Vender</span>
              </button>

              <button className="btn btn-secondary btn-icon-nav" onClick={onOpenChat} title="Mis Mensajes">
                <MessageSquare size={18} />
              </button>

              <button 
                onClick={onOpenProfile} 
                className="btn btn-secondary btn-profile-nav"
                title="Mi Perfil y Cobros"
              >
                <div className="profile-avatar-pill">
                  {user.fullName ? user.fullName[0].toUpperCase() : 'U'}
                </div>
                <span className="profile-text-desktop">Mi Perfil</span>
              </button>

              <button className="btn btn-secondary btn-icon-nav btn-logout-nav" onClick={onLogout} title="Cerrar Sesión">
                <LogOut size={16} />
              </button>
            </>
          ) : (
            <>
              <button className="btn btn-secondary btn-login-nav" onClick={() => onOpenAuth('login')}>
                <User size={17} />
                <span>Entrar</span>
              </button>
              <button className="btn btn-primary btn-register-nav" onClick={() => onOpenAuth('register')}>
                <span className="btn-text-desktop">Registrarse (@uaemex)</span>
                <span className="btn-text-mobile">Registro</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className="nav-search-mobile">
        <div className="mobile-search-wrapper">
          <Search size={17} className="mobile-search-icon" />
          <input 
            type="text" 
            placeholder="Buscar libros, calculadoras, uniformes..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="mobile-search-clear" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
      </div>
    </header>
  );
}
