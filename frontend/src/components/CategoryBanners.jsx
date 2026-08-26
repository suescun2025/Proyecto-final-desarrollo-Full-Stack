import React, { useState } from 'react';
import { translations } from '../translations';

const CategoryBanners = ({ products, onSelectCategory, onSelectProduct, onAddToCart, onNavigate, currentLang = 'es', t }) => {
  const handleBannerClick = (bannerKey) => {
    if (bannerKey === 'accesorios') {
      if (onNavigate) {
        onNavigate('tech-accessories', '/accesorios/');
      } else {
        window.location.href = '/accesorios/';
      }
      return;
    }

    if (bannerKey === 'telefonos') {
      if (onNavigate) {
        onNavigate('phones', '/telefonos/');
      } else {
        window.location.href = '/telefonos/';
      }
      return;
    }

    if (bannerKey === 'computadoras') {
      if (onNavigate) {
        onNavigate('computers', '/computadoras/');
      } else {
        window.location.href = '/computadoras/';
      }
      return;
    }
  };

  return (
    <section id="catalog-section" className="category-banners-section" style={{ marginTop: '75px' }}>
      <div className="section-header-banners" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <h2 
          className="section-title-neon artistic-heading-title"
          style={{ 
            margin: '0 0 14px 0', 
            fontSize: 'clamp(56px, 7.5vw, 84px)',
            fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive",
            fontWeight: '400',
            letterSpacing: 'normal',
            lineHeight: '1.2',
            backgroundImage: "url('/static/oil-paint-texture.jpg')",
            backgroundSize: '160% 160%',
            backgroundPosition: '85% 15%',
            backgroundRepeat: 'no-repeat',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            color: 'transparent',
            display: 'inline-block',
            WebkitTextStroke: '0.7px #ffffff',
            filter: 'brightness(1.2) saturate(1.2) drop-shadow(0 0 1px #000000) drop-shadow(0 2px 8px rgba(0, 0, 0, 0.95))'
          }}
        >
          {t('bannerSectionTitle') || 'Nuestros Productos'}
        </h2>
        <p className="section-subtitle-neon" style={{ margin: '4px auto 0 auto', maxWidth: '680px' }}>
          {t('bannerSectionSubtitle') || 'Selecciona el dispositivo que deseas encontrar.'}
        </p>
      </div>

      <div className="category-banners-grid">
        
        {/* BANNERS RECTANGULARES PANORÁMICOS (ALTURA DOBLE 380px) */}
        
        {/* BANNER 1: TELÉFONOS */}
        <div 
          id="banner-card-telefonos"
          className="category-banner-card banner-phones banner-double-height"
          style={{ backgroundImage: "url('/static/assets/backgrounds/phones-rotated-bg.jpg')" }}
          onClick={() => handleBannerClick('telefonos')}
          role="button"
          tabIndex={0}
        >
          <div className="banner-bg-overlay"></div>
          <div className="banner-glow-effect"></div>
          
          <div className="banner-content">
            <div className="banner-badge">📱 Smart Devices</div>
            <h3 className="banner-title">{t('bannerPhonesTitle') || 'Teléfonos & Smartphones'}</h3>
            <p className="banner-desc">
              {t('bannerPhonesDesc') || 'Smartphones, fundas de protección de alto impacto, cristales templados y repuestos para las marcas más reconocidas.'}
            </p>

            {/* Feature Pills */}
            <div className="banner-pills-list">
              <span className="banner-pill-tag">📱 Fundas MagSafe & Antigolpes</span>
              <span className="banner-pill-tag">💎 Protectores de Pantalla 9H</span>
              <span className="banner-pill-tag">⚡ Repuestos & Accesorios</span>
            </div>

            <div className="banner-cta">
              <span>{t('bannerPhonesCta') || 'Explorar Teléfonos'}</span>
              <span className="arrow-icon">→</span>
            </div>
          </div>
        </div>

        {/* BANNER 2: COMPUTADORAS Y TABLETS */}
        <div 
          id="banner-card-computadoras"
          className="category-banner-card banner-computers banner-double-height"
          style={{ backgroundImage: "url('/static/assets/backgrounds/computers-user-bg.png')" }}
          onClick={() => handleBannerClick('computadoras')}
          role="button"
          tabIndex={0}
        >
          <div className="banner-bg-overlay"></div>
          <div className="banner-glow-effect"></div>
          
          <div className="banner-content">
            <div className="banner-badge">💻 Laptops & iPads</div>
            <h3 className="banner-title">{t('bannerComputersTitle') || 'Computadoras y Tablets'}</h3>
            <p className="banner-desc">
              {t('bannerComputersDesc') || 'Laptops, tablets, hubs multipuerto USB-C, soportes ergonómicos de aluminio y cargadores de alta potencia GaN.'}
            </p>

            {/* Feature Pills */}
            <div className="banner-pills-list">
              <span className="banner-pill-tag">💻 Soportes Ergonómicos de Aluminio</span>
              <span className="banner-pill-tag">🔌 Hubs Multipuerto 4K & USB-C</span>
              <span className="banner-pill-tag">⚡ Cargadores GaN 65W - 140W</span>
            </div>

            <div className="banner-cta">
              <span>{t('bannerComputersCta') || 'Ver Computadoras y Tablets'}</span>
              <span className="arrow-icon">→</span>
            </div>
          </div>


        </div>

        {/* BANNER 3: ACCESORIOS */}
        <div 
          id="banner-card-accesorios"
          className="category-banner-card banner-accessories banner-double-height"
          style={{ backgroundImage: "url('/static/assets/backgrounds/accessories-bg.png')" }}
          onClick={() => handleBannerClick('accesorios')}
          role="button"
          tabIndex={0}
        >
          <div className="banner-bg-overlay"></div>
          <div className="banner-glow-effect"></div>
          
          <div className="banner-content">
            <div className="banner-badge">🎧 Periféricos & Carga</div>
            <h3 className="banner-title">{t('bannerAccessoriesTitle') || 'Accesorios'}</h3>
            <p className="banner-desc">
              {t('bannerAccessoriesDesc') || 'Cargadores ultra rápidos GaN, cables reforzados de nylon trenzado, auriculares premium y adaptadores universales.'}
            </p>

            {/* Feature Pills */}
            <div className="banner-pills-list">
              <span className="banner-pill-tag">🎧 Auriculares & Audio Premium</span>
              <span className="banner-pill-tag">⚡ Cargadores Inalámbricos Qi2</span>
              <span className="banner-pill-tag">🔗 Cables Trenzados Reforzados</span>
            </div>

            <div className="banner-cta">
              <span>{t('bannerAccessoriesCta') || 'Explorar Accesorios'}</span>
              <span className="arrow-icon">→</span>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default CategoryBanners;
