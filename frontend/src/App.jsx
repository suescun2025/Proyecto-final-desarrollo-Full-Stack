import React, { useState, useEffect } from 'react';
import CompatibilityAssistant from './components/CompatibilityAssistant';
import CaseCustomizer from './components/CaseCustomizer';
import ArtStudioGame from './components/ArtStudioGame';
import CartDrawer from './components/CartDrawer';
import ProductDetailsModal from './components/ProductDetailsModal';
import AdminDashboard from './components/AdminDashboard';
import LanguageSelector from './components/LanguageSelector';
import AccessoriesPage from './components/AccessoriesPage';
import MyOrdersPage from './components/MyOrdersPage';
import CategoryBanners from './components/CategoryBanners';
import CategoryProductsPage from './components/CategoryProductsPage';
import { translations } from './translations';

function App() {
  // Estado de Idioma (i18n: 'es', 'en', 'de')
  const [currentLang, setCurrentLang] = useState(() => localStorage.getItem('techmatch_lang') || 'es');

  const handleSetLanguage = (lang) => {
    setCurrentLang(lang);
    localStorage.setItem('techmatch_lang', lang);
  };

  const t = (key) => {
    return translations[currentLang]?.[key] || translations['es']?.[key] || key;
  };

  // Estado de Navegación / Vistas
  const [view, setView] = useState('home'); // 'home', 'orders', 'admin'
  const [user, setUser] = useState({
    isAuthenticated: window.isAuthenticated || false,
    isStaff: window.isStaff || false,
    username: window.username || ''
  });
  
  // Estado del catálogo
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales y estados globales
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login', 'register'
  const [authForm, setAuthForm] = useState({ username: '', password: '', email: '' });
  const [authError, setAuthError] = useState(null);
  
  // Historial de pedidos del cliente
  const [clientOrders, setClientOrders] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [catalogLoading, setCatalogLoading] = useState(false);

  // Router de rutas nativas o refresco de páginas
  useEffect(() => {
    const handleLocation = () => {
      const path = window.location.pathname;
      if (path === '/orders/') {
        if (window.isAuthenticated) {
          setView('orders');
        } else {
          setView('home');
          window.history.pushState({}, '', '/');
        }
      } else if (path === '/universe/') {
        setView('universe');
      } else if (path === '/accesorios/' || path === '/accesorios') {
        setView('accesorios');
      } else if (path === '/admin-dashboard/' || path === '/admin-dashboard') {
        if (window.isAuthenticated && window.isStaff) {
          setView('admin');
        } else {
          setView('home');
          window.history.pushState({}, '', '/');
        }
      } else {
        setView('home');
      }
    };
    
    handleLocation();
    window.addEventListener('popstate', handleLocation);
    return () => window.removeEventListener('popstate', handleLocation);
  }, []);

  // Carga inicial del catálogo
  useEffect(() => {
    fetchCatalog();
    fetchCategories();
  }, []);

  // Recarga pedidos de cliente al cambiar a la vista de pedidos
  useEffect(() => {
    if (view === 'orders') {
      fetchClientOrders();
    }
  }, [view]);

  const fetchCatalog = async () => {
    setCatalogLoading(true);
    try {
      // Usar endpoint genérico
      const res = await fetch('/api/products/');
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
        setFilteredProducts(data);
      }
    } catch (err) {
      console.error('Error al cargar catálogo', err);
    } finally {
      setCatalogLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories/');
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchClientOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/orders/');
      if (res.ok) {
        const data = await res.json();
        setClientOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrado de productos en tiempo real
  useEffect(() => {
    let result = products;
    
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category === parseInt(selectedCategory));
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) || 
        p.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredProducts(result);
  }, [selectedCategory, searchQuery, products]);

  const navigateTo = (newView, urlPath, targetElementId = null) => {
    setView(newView);
    window.history.pushState({}, '', urlPath);

    if (targetElementId) {
      setTimeout(() => {
        const el = document.getElementById(targetElementId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else {
          window.scrollTo(0, 0);
          document.documentElement.scrollTop = 0;
          document.body.scrollTop = 0;
        }
      }, 60);
    } else {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }
  };

  const handleCustomizerClick = (e) => {
    e.preventDefault();
    if (view !== 'home') {
      setView('home');
      window.history.pushState({}, '', '/#customizer-section');
      setTimeout(() => {
        const el = document.getElementById('customizer-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
        }
      }, 120);
    } else {
      window.history.pushState({}, '', '/#customizer-section');
      const el = document.getElementById('customizer-section');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const handleLogout = async (e) => {
    if (e) e.preventDefault();
    
    // 1. Notificar al servidor Django para invalidar la cookie de sesión
    try {
      const csrfToken = document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || '';
      await fetch('/api/auth/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        }
      });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }

    // 2. Limpiar estado de React y ventana global, y redirigir a la página principal
    window.isAuthenticated = false;
    window.isStaff = false;
    window.username = '';
    setUser({ isAuthenticated: false, isStaff: false, username: '' });
    setView('home');
    window.history.pushState({}, '', '/');
    localStorage.removeItem('cart');
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: false } }));
  };

  const [resetStep, setResetStep] = useState('request'); // 'request' | 'confirm'
  const [resetEmailOrUsername, setResetEmailOrUsername] = useState('');
  const [resetCodeInput, setResetCodeInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [resetMessage, setResetMessage] = useState(null);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setLoading(true);
    
    const url = authMode === 'login' ? '/api/auth/login/' : '/api/auth/register/';
    
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        },
        body: JSON.stringify(authForm)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        window.isAuthenticated = true;
        window.isStaff = data.is_staff;
        window.username = data.username;
        
        setUser({
          isAuthenticated: true,
          isStaff: data.is_staff,
          username: data.username
        });
        
        setShowAuthModal(false);
        setAuthForm({ username: '', password: '', email: '' });
        
        if (!data.is_staff && view === 'admin') {
          setView('home');
          window.history.pushState({}, '', '/');
        }
        
        fetchCatalog();
        if (view === 'orders') fetchClientOrders();
      } else {
        setAuthError(data.detail || 'Ocurrió un error en el servidor.');
      }
    } catch (err) {
      setAuthError('Error de red. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset-request/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || '' },
        body: JSON.stringify({ email_or_username: resetEmailOrUsername })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage(data.detail);
        if (data.demo_code) setResetCodeInput(data.demo_code);
        setResetStep('confirm');
      } else {
        setAuthError(data.detail || 'Error al solicitar el código.');
      }
    } catch (err) {
      setAuthError('Error de red al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setResetMessage(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/password-reset-confirm/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || '' },
        body: JSON.stringify({ code: resetCodeInput, new_password: newPasswordInput })
      });
      const data = await res.json();
      if (res.ok) {
        setResetMessage(t('resetSuccessMsg'));
        window.isAuthenticated = true;
        window.isStaff = data.is_staff;
        window.username = data.username;
        setUser({ isAuthenticated: true, isStaff: data.is_staff, username: data.username });
        setTimeout(() => {
          setShowAuthModal(false);
          setAuthMode('login');
          setResetStep('request');
          setResetMessage(null);
        }, 1800);
      } else {
        setAuthError(data.detail || 'Código inválido o contraseña débil.');
      }
    } catch (err) {
      setAuthError('Error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartDirect = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        databaseId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // Disparar evento para abrir el carrito
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));
  };

  const [navStarSparkle, setNavStarSparkle] = useState(false);
  const [universeRainKey, setUniverseRainKey] = useState(0);

  const handleNavStarMouseEnter = () => {
    if (view === 'accesorios') {
      setNavStarSparkle(false);
      setTimeout(() => {
        setNavStarSparkle(true);
      }, 15);
    }
  };

  const handleUniverseStarMouseEnter = () => {
    setUniverseRainKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Navegación SPA de Alta Gama */}
      <header className="navbar-premium glass-panel sticky-header">
        <div className="navbar-content">
          <div className="logo-section" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Estrella TechMatch */}
            <div className="logo-icon-tooltip-container">
              <img 
                src="/static/assets/icons/logo-star-isolated-black.png?v=2" 
                alt="TechMatch Logo" 
                className="logo-star-img" 
              />
            </div>

            {/* Nombre de Marca - Cromo Líquido 3D Cursiva Fluida */}
            <div style={{ display: 'flex', alignItems: 'center', marginLeft: '4px' }}>
              <img 
                src="/static/assets/icons/techmatch-liquid-logo.png?v=13" 
                alt="TechMatch Logo" 
                className="logo-liquid-img"
                style={{ height: '76px', width: 'auto', objectFit: 'contain', filter: 'drop-shadow(0 3px 16px rgba(0, 242, 254, 0.55))' }}
              />
            </div>
          </div>
          
          <nav className="nav-navigation">
            <span className={`nav-item ${view === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home', '/')}>{t('navHome')}</span>
            <a href="#customizer-section" className="nav-item" onClick={handleCustomizerClick} style={{ textDecoration: 'none' }}>{t('navCustomCase')}</a>
            <span className={`nav-item ${view === 'accesorios' ? 'active' : ''}`} onClick={() => navigateTo('accesorios', '/accesorios/')}>{t('navAccessories')}</span>

            {user.isAuthenticated ? (
              <>
                <span className={`nav-item ${view === 'orders' ? 'active' : ''}`} onClick={() => navigateTo('orders', '/orders/')}>{t('navMyOrders')}</span>
                {user.isStaff && (
                  <span className={`nav-item staff-badge ${view === 'admin' ? 'active' : ''}`} onClick={() => navigateTo('admin', '/admin-dashboard/')}>{t('navAdminPanel')}</span>
                )}
                
                <div className="user-profile-badge">
                  <span className="profile-dot"></span>
                  <span className="profile-name">Hola, <strong>{user.username}</strong></span>
                </div>
                <button type="button" className="logout-btn" onClick={handleLogout}>Salir</button>
              </>
            ) : (
              <>
                <button className="btn-secondary" style={{ padding: '6px 14px', fontSize: '13px' }} onClick={() => { setAuthMode('login'); setShowAuthModal(true); }}>{t('navSignIn')}</button>
                <button className="btn-primary" style={{ padding: '7px 14px', fontSize: '13px' }} onClick={() => { setAuthMode('register'); setShowAuthModal(true); }}>{t('navRegister')}</button>
              </>
            )}

            {/* Carrito de Compras en React */}
            <div id="react-cart-container">
              <CartDrawer 
                currentLang={currentLang} 
                user={user} 
                onOpenAuth={() => { setAuthMode('login'); setShowAuthModal(true); }} 
              />
            </div>
          </nav>
        </div>
      </header>

      {/* RENDER DE VISTAS */}
      <main className="main-content-layout">
        
        {/* VISTA: HOME */}
        {view === 'home' && (
          <>
            {/* Hero Section */}
            <section className="hero-section">
              <div className="hero-glow"></div>
              <div className="hero-content">
                <span className="hero-tag animate-pulseGlow">{t('heroBadge')}</span>
                <h1 className="hero-title glitch-hero-wrapper">
                  <span className="glitch-line-top" data-text={`${t('heroTitlePart1')} ${t('heroTitleHighlight')}`}>
                    {t('heroTitlePart1')} {t('heroTitleHighlight')}
                  </span>
                  <br />
                  <span className="glitch-line-bottom" data-text={t('heroTitlePart2')}>
                    {t('heroTitlePart2')}
                  </span>
                </h1>
                <p className="hero-subtitle">
                  {t('heroSubtitle')}
                </p>
                <div style={{ display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                  {user && user.isStaff ? (
                    <>
                      <a href="#assistant-section" className="btn-primary">
                        <span>📦 {t('btnAdminOrders')}</span>
                      </a>
                      <a href="#customizer-section" className="btn-primary" style={{ background: 'var(--gradient-accent)', border: 'none', boxShadow: 'var(--gradient-glow)' }}>
                        <span>🎨 {t('btnAdminCases')}</span>
                      </a>
                    </>
                  ) : (
                    <>
                      <a href="#assistant-section" className="btn-primary">
                        <span>🔍 {t('btnCompatibility')}</span>
                      </a>
                      <a href="#customizer-section" className="btn-primary" style={{ background: 'var(--gradient-accent)', border: 'none', boxShadow: 'var(--gradient-glow)' }}>
                        <span>🎨 {t('btnDesignCase')}</span>
                      </a>
                      <a href="#catalog-section" className="btn-secondary">
                        <span>📦 {t('btnCatalog')}</span>
                      </a>
                    </>
                  )}
                </div>
              </div>
            </section>

            {/* Ventajas Certificadas */}
            <section className="features-grid-section" style={{ maxWidth: '1200px', margin: '-45px auto 60px auto', padding: '0 20px', position: 'relative', zIndex: '5' }}>
              <div className="techmatch-grid font-font-combo-1">
                
                {/* Tarjeta 1: Cero Errores */}
                <div className="techmatch-card">
                  <div className="card-bg" style={{ backgroundImage: "url('/static/assets/backgrounds/card1.avif')" }}></div>
                  <div className="card-icon-wrap">
                    <img src="/static/assets/icons/shield_glass_3d.png" alt="Icono Escudo Glassmorphism 3D" className="icon-3d-img" />
                  </div>
                  <div className="card-body">
                    <h3>{t('feature1Title')}</h3>
                    <p>{t('feature1Desc')}</p>
                  </div>
                </div>

                {/* Tarjeta 2: Componentes Premium */}
                <div className="techmatch-card">
                  <div className="card-bg" style={{ backgroundImage: "url('/static/assets/backgrounds/card2.avif')" }}></div>
                  <div className="card-icon-wrap">
                    <img src="/static/assets/icons/plug_glass_3d.png" alt="Icono Conector Glassmorphism 3D" className="icon-3d-img" />
                  </div>
                  <div className="card-body">
                    <h3>{t('feature2Title')}</h3>
                    <p>{t('feature2Desc')}</p>
                  </div>
                </div>

                {/* Tarjeta 3: Carga Rápida */}
                <div className="techmatch-card">
                  <div className="card-bg" style={{ backgroundImage: "url('/static/assets/backgrounds/card3.avif')" }}></div>
                  <div className="card-icon-wrap">
                    <img src="/static/assets/icons/lightning_glass_3d.png" alt="Icono Rayo Glassmorphism 3D" className="icon-3d-img" />
                  </div>
                  <div className="card-body">
                    <h3>{t('feature3Title')}</h3>
                    <p>{t('feature3Desc')}</p>
                  </div>
                </div>

              </div>
            </section>

            {/* Asistente de Compatibilidad (Clientes) vs Sistema de Pedidos (Administrador) */}
            <section id="assistant-section" style={{ maxWidth: '1200px', margin: '0 auto 80px auto', padding: '0 20px' }}>
              {user && user.isStaff ? (
                <div className="glass-panel" style={{ borderRadius: '20px', padding: '30px', border: '1px solid rgba(0, 242, 254, 0.35)', boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5)', background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)' }}>
                  <AdminDashboard currentLang={currentLang} />
                </div>
              ) : (
                <CompatibilityAssistant onViewProductDetail={setSelectedProduct} t={t} currentLang={currentLang} />
              )}
            </section>

            {/* Personalizador de Carcasa Interactivo */}
            <div id="customizer-section">
              <CaseCustomizer onNavigate={navigateTo} t={t} currentLang={currentLang} user={user} />
            </div>

            {/* Banners Rectangulares por Categoría (Solo visible para Clientes y Usuarios No Autenticados) */}
            {(!user || !user.isStaff) && (
              <CategoryBanners 
                products={products}
                onSelectCategory={setSelectedCategory}
                onSelectProduct={setSelectedProduct}
                onAddToCart={handleAddToCartDirect}
                onNavigate={navigateTo}
                currentLang={currentLang}
                t={t}
              />
            )}
          </>
        )}

        {/* VISTA DEDICADA E INDEPENDIENTE: MIS PEDIDOS (CLIENTE) */}
        {view === 'orders' && (
          <MyOrdersPage 
            currentLang={currentLang}
            translations={translations}
            navigateTo={navigateTo}
          />
        )}

        {/* VISTA: UNIVERSO (GALERÍA DE ARTE Y ESTUDIO CREATIVO) */}
        {view === 'universe' && (
          <div className="universe-container" style={{ padding: '60px 20px', maxWidth: '1240px', margin: '0 auto', textAlign: 'center', position: 'relative' }}>
            {/* Contenedor de Lluvia de Estrellas Fugaces Re-activable por Hover en la Estrella */}
            <div className="shooting-stars-container" key={`universe-rain-${universeRainKey}`}>
              {Array.from({ length: 30 }).map((_, i) => {
                const delay = `${(Math.random() * 0.75).toFixed(2)}s`;
                const duration = `${(1.1 + Math.random() * 0.6).toFixed(2)}s`;
                const top = `${(Math.random() * 70 - 15).toFixed(0)}%`;
                const left = `${(25 + Math.random() * 75).toFixed(0)}%`;
                const scale = (0.6 + Math.random() * 0.8).toFixed(2);
                const color = Math.random() > 0.4 ? 'rgba(0, 242, 254, 1)' : 'rgba(255, 105, 180, 1)';
                return (
                  <div 
                    key={`star-${universeRainKey}-${i}`} 
                    className="shooting-star-wrapper" 
                    style={{
                      top,
                      left,
                      transform: `scale(${scale})`,
                      zIndex: 999
                    }}
                  >
                    <div 
                      className="shooting-star" 
                      style={{
                        animationDelay: delay,
                        animationDuration: duration,
                        background: `linear-gradient(90deg, ${color}, rgba(0, 242, 254, 0))`,
                        filter: `drop-shadow(0 0 12px ${color}) drop-shadow(0 0 20px rgba(0, 242, 254, 0.8))`
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <div className="universe-glow-effect"></div>
            
            {/* Estrella Cósmica 3D Galería de Arte con Borde Sombreado Morado Galáctico */}
            <div 
              className="universe-star-wrapper" 
              style={{ margin: '0 auto 15px auto', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
              onMouseEnter={handleUniverseStarMouseEnter}
            >
              <img 
                src="/static/assets/icons/logo-star-universe.png?v=2" 
                alt="TechMatch Estrella 3D Universo" 
                className="accessories-cosmic-star-img universe-star-img-large" 
              />
            </div>

            <h1 className="rainbow-script-title" style={{ textAlign: 'center', marginBottom: '10px' }}>
              Estudio Creativo de TechMatch
            </h1>
            
            <p className="universe-subtitle" style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '650px', margin: '0 auto 25px auto', lineHeight: '1.6', fontFamily: 'var(--font-sans)', textAlign: 'center' }}>
              ¿Sabías que existen imágenes que forman parte de las más ricas y famosas del mundo? Te presentamos algunas para que puedas elegir con la certeza de que será la imagen perfecta.
            </p>

            {/* Componente del Estudio de Arte y Juego de Ruleta */}
            <ArtStudioGame currentLang={currentLang} user={user} />

            <div style={{ marginTop: '40px', marginBottom: '80px', position: 'relative', zIndex: 100 }}>
              <button 
                className="btn-primary" 
                style={{ 
                  background: 'rgba(255, 255, 255, 0.08)', 
                  border: '1px solid rgba(255, 255, 255, 0.2)', 
                  boxShadow: '0 4px 20px rgba(0,0,0,0.4)', 
                  margin: '0 auto', 
                  display: 'inline-flex', 
                  cursor: 'pointer', 
                  zIndex: 101, 
                  position: 'relative' 
                }}
                onClick={() => {
                  navigateTo('home', '/');
                }}
              >
                <span>🚀 Volver al Inicio</span>
              </button>
            </div>
          </div>
        )}

        {/* VISTA: ACCESORIOS */}
        {view === 'accesorios' && (
          <AccessoriesPage navigateTo={navigateTo} currentLang={currentLang} user={user} />
        )}

        {/* VISTAS DEDICADAS A PÁGINA COMPLETA: TELÉFONOS, COMPUTADORAS Y ACCESORIOS TECH */}
        {view === 'phones' && (
          <CategoryProductsPage 
            category="phones"
            products={products}
            onNavigate={navigateTo}
            onAddToCart={handleAddToCartDirect}
            onSelectProduct={setSelectedProduct}
            currentLang={currentLang}
            t={t}
          />
        )}

        {view === 'computers' && (
          <CategoryProductsPage 
            category="computers"
            products={products}
            onNavigate={navigateTo}
            onAddToCart={handleAddToCartDirect}
            onSelectProduct={setSelectedProduct}
            currentLang={currentLang}
            t={t}
          />
        )}

        {view === 'tech-accessories' && (
          <CategoryProductsPage 
            category="accessories"
            products={products}
            onNavigate={navigateTo}
            onAddToCart={handleAddToCartDirect}
            onSelectProduct={setSelectedProduct}
            currentLang={currentLang}
            t={t}
          />
        )}

        {/* VISTA: DASHBOARD ADMINISTRACIÓN (PANEL DE CONTROL DE PEDIDOS Y CATÁLOGO) */}
        {view === 'admin' && (
          user && user.isStaff ? (
            <AdminDashboard initialTab="orders" currentLang={currentLang} />
          ) : (
            <div className="glass-panel" style={{ maxWidth: '700px', margin: '60px auto', padding: '40px 30px', textAlign: 'center', borderRadius: '20px', border: '1px solid rgba(239, 68, 68, 0.4)' }}>
              <h2 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '24px' }}>⚠️ Acceso Restringido</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '25px', fontSize: '15px' }}>
                Esta sección está reservada exclusivamente para usuarios administradores.
              </p>
              <button className="btn-primary" style={{ margin: '0 auto' }} onClick={() => navigateTo('home', '/')}>
                🚀 Volver a la Página Principal
              </button>
            </div>
          )
        )}
      </main>

      {/* FOOTER PREMIUM */}
      <footer className="footer-premium">
        <div className="footer-content" style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
          <div>
            <span style={{ fontSize: '20px', fontWeight: 'bold', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ TechMatch</span>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', margin: '5px 0 0 0' }}>{t('footerSlogan')}</p>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
            {t('footerRights')}
          </p>
          <div>
            <LanguageSelector currentLang={currentLang} setLanguage={handleSetLanguage} />
          </div>
        </div>
      </footer>

      {/* MODAL DETALLES DEL PRODUCTO */}
      {selectedProduct && (
        <ProductDetailsModal 
          product={selectedProduct} 
          onClose={() => setSelectedProduct(null)} 
          onAddToCart={handleAddToCartDirect} 
          currentLang={currentLang}
        />
      )}

      {/* MODAL DE INGRESO / REGISTRO / RECUPERACIÓN */}
      {showAuthModal && (
        <div className="modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="modal-container glass-panel animate-scale-up" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowAuthModal(false)}>&times;</button>

            {/* MODO: RECUPERAR CONTRASEÑA */}
            {authMode === 'forgot' ? (
              <div>
                <h2 style={{ fontSize: '24px', textAlign: 'center', margin: '0 0 10px 0', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {t('forgotPasswordTitle')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', textAlign: 'center', marginBottom: '20px' }}>
                  {t('forgotPasswordSubtitle')}
                </p>

                {authError && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>
                    ⚠️ {authError}
                  </div>
                )}

                {resetMessage && (
                  <div style={{ padding: '10px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: '6px', color: 'var(--color-success)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>
                    ✅ {resetMessage}
                  </div>
                )}

                {resetStep === 'request' ? (
                  <form onSubmit={handleResetRequest}>
                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label">{t('emailOrUsernameLabel')}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="ejemplo@email.com o usuario"
                        value={resetEmailOrUsername}
                        onChange={e => setResetEmailOrUsername(e.target.value)}
                        required 
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '44px' }} disabled={loading}>
                      {loading ? '...' : t('sendResetCodeBtn')}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetConfirm}>
                    <div style={{ marginBottom: '15px' }}>
                      <label className="form-label">{t('resetCodeLabel')}</label>
                      <input 
                        type="text" 
                        className="form-input" 
                        placeholder="123456"
                        value={resetCodeInput}
                        onChange={e => setResetCodeInput(e.target.value)}
                        required 
                      />
                    </div>

                    <div style={{ marginBottom: '20px' }}>
                      <label className="form-label">{t('newPasswordLabel')}</label>
                      <input 
                        type="password" 
                        className="form-input" 
                        value={newPasswordInput}
                        onChange={e => setNewPasswordInput(e.target.value)}
                        required 
                      />
                    </div>

                    <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '44px' }} disabled={loading}>
                      {loading ? '...' : t('submitNewPasswordBtn')}
                    </button>
                  </form>
                )}

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px' }}>
                  <strong 
                    style={{ color: 'var(--color-accent)', cursor: 'pointer' }} 
                    onClick={() => { setAuthMode('login'); setAuthError(null); setResetMessage(null); }}
                  >
                    ← {t('backToLogin')}
                  </strong>
                </div>
              </div>
            ) : (
              /* MODO: LOGIN Y REGISTRO */
              <div>
                <h2 style={{ fontSize: '24px', textAlign: 'center', margin: '0 0 10px 0', fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {authMode === 'login' ? t('loginTitle') : t('registerTitle')}
                </h2>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', marginBottom: '25px' }}>
                  {authMode === 'login' 
                    ? t('loginSubtitle') 
                    : t('registerSubtitle')}
                </p>

                {authError && (
                  <div style={{ padding: '10px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: '6px', color: 'var(--color-error)', fontSize: '13px', marginBottom: '15px', textAlign: 'center', fontWeight: '500' }}>
                    ⚠️ {authError}
                  </div>
                )}

                <form onSubmit={handleAuthSubmit}>
                  <div style={{ marginBottom: '15px' }}>
                    <label className="form-label">{t('usernameLabel')}</label>
                    <input 
                      type="text" 
                      className="form-input" 
                      value={authForm.username}
                      onChange={e => setAuthForm({ ...authForm, username: e.target.value })}
                      required 
                    />
                  </div>

                  {authMode === 'register' && (
                    <div style={{ marginBottom: '15px' }}>
                      <label className="form-label">{t('emailLabel')}</label>
                      <input 
                        type="email" 
                        className="form-input" 
                        value={authForm.email}
                        onChange={e => setAuthForm({ ...authForm, email: e.target.value })}
                      />
                    </div>
                  )}

                  <div style={{ marginBottom: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <label className="form-label" style={{ margin: 0 }}>{t('passwordLabel')}</label>
                      {authMode === 'login' && (
                        <span 
                          style={{ fontSize: '12px', color: 'var(--color-accent)', cursor: 'pointer', fontWeight: '500' }}
                          onClick={() => { setAuthMode('forgot'); setResetStep('request'); setAuthError(null); setResetMessage(null); }}
                        >
                          {t('forgotPasswordLink')}
                        </span>
                      )}
                    </div>
                    <input 
                      type="password" 
                      className="form-input" 
                      value={authForm.password}
                      onChange={e => setAuthForm({ ...authForm, password: e.target.value })}
                      required 
                    />
                  </div>

                  <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', height: '44px', marginTop: '10px' }} disabled={loading}>
                    {loading ? '...' : authMode === 'login' ? t('submitLogin') : t('submitRegister')}
                  </button>
                </form>

                <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {authMode === 'login' ? (
                    <span>{t('noAccountText')} <strong style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => { setAuthMode('register'); setAuthError(null); }}>{t('toggleToRegister')}</strong></span>
                  ) : (
                    <span>{t('hasAccountText')} <strong style={{ color: 'var(--color-accent)', cursor: 'pointer' }} onClick={() => { setAuthMode('login'); setAuthError(null); }}>{t('toggleToLogin')}</strong></span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
