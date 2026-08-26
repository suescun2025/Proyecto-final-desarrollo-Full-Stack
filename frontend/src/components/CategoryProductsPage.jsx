import React, { useState, useMemo } from 'react';
import { translations } from '../translations';

const CATEGORY_CONFIGS = {
  phones: {
    title: 'Teléfonos & Smartphones',
    subtitle: 'Explora nuestra selección exclusiva de teléfonos smartphones de las mejores marcas.',
    icon: '📱',
    bgImage: '/static/assets/backgrounds/phones-rotated-bg.jpg',
    matchCategories: ['Teléfonos', 'telefonos', 'Smartphones', 'smartphones']
  },
  computers: {
    title: 'Computadoras y Tablets',
    subtitle: 'Laptops de alta gama, ordenadores y tablets para trabajo, estudio y rendimiento profesional.',
    icon: '💻',
    bgImage: '/static/assets/backgrounds/computers-user-bg.png',
    matchCategories: ['Ordenadores', 'ordenadores', 'Tablets', 'tablets', 'Laptops', 'laptops']
  },
  accessories: {
    title: 'Accesorios Tecnológicos',
    subtitle: 'Cargadores GaN, cables reforzados de nylon trenzado, hubs USB-C, fundas, protectores y audio.',
    icon: '🎧',
    bgImage: '/static/assets/backgrounds/accessories-bg.png',
    matchCategories: [
      'Cargadores', 'cargadores', 
      'Cables', 'cables', 
      'Fundas y Estuches', 'fundas', 
      'Protectores de Pantalla', 'protectores', 
      'Hubs y Adaptadores', 'hubs', 
      'Audio y Soportes', 'audio-varios'
    ]
  }
};

const CategoryProductsPage = ({ 
  category = 'phones', 
  products = [], 
  onNavigate, 
  onAddToCart, 
  onSelectProduct, 
  currentLang = 'es', 
  t 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const config = CATEGORY_CONFIGS[category] || CATEGORY_CONFIGS.phones;

  // Filtrado estricto por categoría de base de datos y búsqueda
  const filteredProducts = useMemo(() => {
    if (!products || !Array.isArray(products)) return [];

    let list = products.filter(p => {
      if (!p) return false;
      const catName = (p.category_name || '').toLowerCase();
      const catSlug = (p.category_slug || '').toLowerCase();
      return config.matchCategories.some(valid => 
        catName === valid.toLowerCase() || catSlug === valid.toLowerCase()
      );
    });

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(p => 
        (p.name || '').toLowerCase().includes(q) || 
        (p.description || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [products, config, searchQuery]);

  const targetCardId = {
    phones: 'banner-card-telefonos',
    computers: 'banner-card-computadoras',
    accessories: 'banner-card-accesorios'
  }[category] || 'banner-card-telefonos';

  return (
    <div className="category-dedicated-page animate-fade-in" style={{ minHeight: '100vh', padding: '120px 20px 80px 20px', maxWidth: '1280px', margin: '0 auto' }}>
      
      {/* Botón de retorno al inicio (Icono circular con sola flecha) */}
      <div style={{ marginBottom: '30px' }}>
        <button 
          onClick={() => {
            if (onNavigate) onNavigate('home', '/#catalog-section', targetCardId);
          }}
          className="btn-secondary"
          title="Volver al Inicio"
          aria-label="Volver al Inicio"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '46px',
            height: '46px',
            borderRadius: '50%',
            borderColor: 'rgba(0, 242, 254, 0.4)',
            color: '#00f2fe',
            fontWeight: '700',
            cursor: 'pointer',
            fontSize: '20px',
            backdropFilter: 'blur(10px)',
            background: 'rgba(15, 23, 42, 0.7)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.4), 0 0 15px rgba(0, 242, 254, 0.2)'
          }}
        >
          <span>←</span>
        </button>
      </div>

      {/* Banner / Header Dedicado de la Página */}
      <div 
        className="glass-panel" 
        style={{
          borderRadius: '28px',
          padding: '48px 32px',
          marginBottom: '40px',
          backgroundImage: `linear-gradient(to right, rgba(5, 8, 18, 0.45) 0%, rgba(5, 8, 18, 0.2) 50%, rgba(5, 8, 18, 0.45) 100%), url("${config.bgImage}")`,
          backgroundSize: '100% 100%',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          boxShadow: '0 25px 60px rgba(0, 0, 0, 0.7), 0 0 40px rgba(0, 242, 254, 0.15)',
          textAlign: 'center'
        }}
      >
        <h1 
          style={{ 
            margin: '0 0 16px 0', 
            fontSize: 'clamp(42px, 6vw, 72px)',
            fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', cursive",
            fontWeight: '400',
            letterSpacing: 'normal',
            lineHeight: '1.2',
            backgroundImage: "url('/static/oil-paint-texture.jpg')",
            backgroundSize: '160% 160%',
            backgroundPosition: '85% 15%',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline-block',
            WebkitTextStroke: '0.7px #ffffff',
            filter: 'brightness(1.2) drop-shadow(0 4px 12px rgba(0,0,0,0.9))'
          }}
        >
          {config.title}
        </h1>
        
        <p style={{ color: '#ffffff', fontSize: '17px', fontWeight: '500', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6', textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)' }}>
          {config.subtitle}
        </p>

        {/* Buscador Integrado */}
        <div style={{ maxWidth: '520px', margin: '30px auto 0 auto', position: 'relative' }}>
          <input 
            type="text"
            placeholder={t ? t('searchPlaceholder') : "🔍 Buscar productos por nombre o modelo..."}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '14px 22px',
              borderRadius: '50px',
              border: '1px solid rgba(0, 242, 254, 0.4)',
              background: 'rgba(15, 23, 42, 0.85)',
              color: '#f8fafc',
              fontSize: '15px',
              outline: 'none',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box',
              boxShadow: '0 8px 25px rgba(0,0,0,0.4)'
            }}
          />
        </div>
      </div>

      {/* Parrilla de Productos */}
      {filteredProducts.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '60px 20px', borderRadius: '20px' }}>
          <span style={{ fontSize: '48px' }}>📦</span>
          <h3 style={{ color: '#f8fafc', margin: '15px 0 5px 0' }}>No hay productos disponibles en esta categoría</h3>
          <p style={{ color: '#94a3b8' }}>Pronto añadiremos más catálogo a esta sección.</p>
        </div>
      ) : (
        <div 
          className="grid-products" 
          style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', 
            gap: '28px' 
          }}
        >
          {filteredProducts.map((product) => (
            <div 
              key={product.id}
              className="product-card-premium glass-card animate-scale-up"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                if (onSelectProduct) onSelectProduct(product);
              }}
            >
              <div className="product-image-container">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="product-image-img" />
                ) : (
                  <div className="product-image-placeholder">
                    <span style={{ fontSize: '40px' }}>📦</span>
                  </div>
                )}
                <span className="product-cat-badge">
                  {translations[currentLang]?.categories?.[product.category_name] || product.category_name}
                </span>
              </div>
              
              <div className="product-card-body">
                <div>
                  <h4 className="product-title-text" style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px', color: '#ffffff' }}>
                    {translations[currentLang]?.productNames?.[product.name] || product.name}
                  </h4>
                  <p className="product-desc-text" style={{ fontSize: '13px', color: '#94a3b8', lineHeight: '1.4' }}>
                    {translations[currentLang]?.productDescs?.[product.name] || product.description}
                  </p>
                </div>

                <div className="product-card-footer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: '12px', marginTop: '16px' }}>
                  <div className="product-price-tag" style={{ textAlign: 'center', fontSize: '20px', fontWeight: '800', color: '#00f2fe' }}>
                    {parseFloat(product.price || 0).toFixed(2)} €
                  </div>
                  <button 
                    className="btn-add-cart-mini"
                    style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (onAddToCart) {
                        onAddToCart(product);
                      } else {
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
                        window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));
                      }
                    }}
                  >
                    <span>🛒</span>
                    <span>{t ? t('addToCart') : 'Añadir al Carrito'}</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryProductsPage;
