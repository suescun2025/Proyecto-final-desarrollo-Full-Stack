import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

const CompatibilityAssistant = ({ onViewProductDetail, currentLang }) => {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  const [step, setStep] = useState(1);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedModel, setSelectedModel] = useState(null);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar marcas al montar el componente
  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/brands/');
      if (!response.ok) throw new Error('Error al cargar las marcas de dispositivos.');
      const data = await response.json();
      setBrands(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleBrandSelect = async (brand) => {
    setSelectedBrand(brand);
    setSelectedModel(null);
    setProducts([]);
    setStep(2);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/models/?brand_id=${brand.id}`);
      if (!response.ok) throw new Error('Error al cargar los modelos de esta marca.');
      const data = await response.json();
      setModels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModelSelect = async (model) => {
    setSelectedModel(model);
    setStep(3);
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/products/?model_id=${model.id}`);
      if (!response.ok) throw new Error('Error al cargar los accesorios compatibles.');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product, e) => {
    e.stopPropagation(); // Evitar abrir el modal al añadir al carrito
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
    // Disparar evento global para actualizar el componente CartDrawer
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));
  };

  const resetAssistant = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setProducts([]);
    setStep(1);
  };

  return (
    <div className="wizard-container compatibility-assistant-container glass-panel animate-fade-in">
      <div className="wizard-header">
        <h2 className="white-blue-script-title" style={{ fontSize: '42px', margin: '0 0 2px 0' }}>{t('assistantTitle')}</h2>
        <p style={{ marginTop: '10px' }}>{t('assistantSubtitle')}</p>
      </div>

      {/* Indicadores de Paso */}
      <div className="wizard-steps-container">
        <div className={`step-indicator ${step >= 1 ? 'active' : ''}`} onClick={() => step > 1 && setStep(1)}>
          <div className="step-number">1</div>
          <div className="step-desc">
            <span className="step-label">{t('step1Label')}</span>
            <span className="step-title">{t('step1Title')}</span>
          </div>
        </div>
        <div className="step-line-divider"></div>
        <div className={`step-indicator ${step >= 2 ? 'active' : ''}`} onClick={() => step > 2 && setStep(2)}>
          <div className="step-number">2</div>
          <div className="step-desc">
            <span className="step-label">{t('step2Label')}</span>
            <span className="step-title">{t('step2Title')}</span>
          </div>
        </div>
        <div className="step-line-divider"></div>
        <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <div className="step-desc">
            <span className="step-label">{t('step3Label')}</span>
            <span className="step-title">{t('step3Title')}</span>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loader-container">
          <div className="spinner"></div>
          <p>Cargando datos técnicos...</p>
        </div>
      )}

      {error && (
        <div className="error-alert">
          <span>⚠️</span> {error}
        </div>
      )}

      {!loading && !error && (
        <div className="wizard-step-content">
          {/* PASO 1: Selección de Marca */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 className="step-instruction">{t('selectBrandInstruction')}</h3>
              {brands.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>No hay marcas cargadas en el sistema actualmente.</p>
              ) : (
                <div className="grid-brands">
                  {brands.map(brand => (
                    <div 
                      key={brand.id} 
                      className="brand-card glass-card"
                      onClick={() => handleBrandSelect(brand)}
                    >
                      <div className="brand-logo-placeholder">
                        {brand.logo ? (
                          <img src={brand.logo} alt={brand.name} className="brand-logo-img" />
                        ) : (
                          <img 
                            src={`/assets/brands/${brand.name.toLowerCase()}.png`} 
                            alt={brand.name} 
                            className="brand-logo-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.parentElement.innerText = brand.name.substring(0, 2).toUpperCase();
                            }}
                          />
                        )}
                      </div>
                      <div className="brand-name-label">{brand.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Selección de Modelo */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 className="step-instruction" style={{ margin: 0 }}>{t('selectModelInstruction')} ({selectedBrand?.name})</h3>
                <button className="btn-secondary" onClick={() => setStep(1)}>{t('backBtn')}</button>
              </div>
              {models.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                  <p>No hay modelos cargados para {selectedBrand?.name}.</p>
                  <button className="btn-secondary" style={{ marginTop: '10px' }} onClick={() => setStep(1)}>{t('changeBrandBtn')}</button>
                </div>
              ) : (
                <div className="grid-models">
                  {models.map(model => (
                    <div 
                      key={model.id} 
                      className="model-card glass-card"
                      onClick={() => handleModelSelect(model)}
                    >
                      {model.image ? (
                        <img 
                          src={model.image} 
                          alt={model.name} 
                          style={{ 
                            width: '52px', 
                            height: '52px', 
                            objectFit: 'cover', 
                            borderRadius: '10px', 
                            marginBottom: '8px',
                            border: '1px solid rgba(0, 240, 255, 0.35)',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)'
                          }} 
                        />
                      ) : (
                        <span className="device-icon">📱</span>
                      )}
                      <div style={{ fontWeight: '600', fontSize: '15px' }}>{model.name}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>Ver accesorios</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Listado de Productos Compatibles */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                  <h3 className="step-instruction" style={{ margin: 0 }}>
                    Accesorios 100% Compatibles con {selectedBrand?.name} {selectedModel?.name}
                  </h3>
                  <p style={{ color: 'var(--color-success)', fontSize: '13px', margin: '4px 0 0 0', fontWeight: '500' }}>
                    ✓ Certificado de compatibilidad garantizado para tu dispositivo
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>Atrás</button>
                  <button className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: 'var(--color-error)' }} onClick={resetAssistant}>Reiniciar</button>
                </div>
              </div>

              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: 'rgba(0,0,0,0.15)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                  <span style={{ fontSize: '50px' }}>🔍</span>
                  <h4 style={{ margin: '15px 0 5px 0', fontSize: '18px' }}>Sin resultados disponibles</h4>
                  <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto', fontSize: '14px' }}>No hay accesorios registrados en el sistema para este modelo específico en este momento.</p>
                  <button className="btn-secondary" style={{ marginTop: '20px' }} onClick={resetAssistant}>Elegir otro dispositivo</button>
                </div>
              ) : (
                <div className="grid-products">
                  {products.map(product => (
                    <div 
                      key={product.id} 
                      className="product-card-premium glass-card"
                      onClick={() => onViewProductDetail(product)}
                    >
                      <div className="product-image-container">
                        {product.image ? (
                          <img src={product.image} alt={product.name} className="product-image-img" />
                        ) : (
                          <div className="product-image-placeholder">
                            <span>📦</span>
                          </div>
                        )}
                        <span className="product-cat-badge">
                          {translations[activeLang]?.categories?.[product.category_name] || product.category_name}
                        </span>
                      </div>
                      
                      <div className="product-card-body">
                        <div>
                          <h4 className="product-title-text">
                            {translations[activeLang]?.productNames?.[product.name] || product.name}
                          </h4>
                          <p className="product-desc-text">
                            {translations[activeLang]?.productDescriptions?.[product.description] || product.description}
                          </p>
                          
                          {/* Ficha técnica simplificada */}
                          {product.specifications && Object.keys(product.specifications).length > 0 && (
                            <div className="product-specs-preview">
                              {Object.entries(product.specifications).slice(0, 2).map(([key, val]) => (
                                <div key={key} className="spec-preview-row">
                                  <span className="spec-preview-key">
                                    {translations[activeLang]?.specsLabel?.[key] || key}:
                                  </span>
                                  <span className="spec-preview-val">
                                    {translations[activeLang]?.specsValue?.[val] || val}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div style={{ marginTop: '15px' }}>
                          <div className="product-price-stock-row">
                            <span className="product-price-text">
                              {product.price} €
                            </span>
                            <span className={`product-stock-status ${product.stock > 0 ? 'available' : 'outofstock'}`}>
                              {product.stock > 0 ? t('inStock') : t('outOfStock')}
                            </span>
                          </div>
                          
                          <button 
                            className="btn-primary" 
                            style={{ width: '100%', justifyContent: 'center', height: '40px', marginTop: '10px' }}
                            onClick={(e) => addToCart(product, e)}
                            disabled={product.stock <= 0}
                          >
                            <span>🛒 {t('addToCart')}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompatibilityAssistant;
