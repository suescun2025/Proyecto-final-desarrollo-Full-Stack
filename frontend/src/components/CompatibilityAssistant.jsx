import React, { useState, useEffect } from 'react';

const CompatibilityAssistant = () => {
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
    try {
      const response = await fetch('/api/brands/');
      if (!response.ok) throw new Error('Error al cargar las marcas');
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
    try {
      const response = await fetch(`/api/models/?brand_id=${brand.id}`);
      if (!response.ok) throw new Error('Error al cargar los modelos');
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
    try {
      const response = await fetch(`/api/products/?model_id=${model.id}`);
      if (!response.ok) throw new Error('Error al cargar los productos compatibles');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = (product) => {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingItemIndex = cart.findIndex(item => item.id === product.id);

    if (existingItemIndex > -1) {
      cart[existingItemIndex].quantity += 1;
    } else {
      cart.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: 1
      });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    // Disparar evento global para actualizar el componente CartDrawer
    window.dispatchEvent(new CustomEvent('cart-updated'));
  };

  const resetAssistant = () => {
    setSelectedBrand(null);
    setSelectedModel(null);
    setProducts([]);
    setStep(1);
  };

  return (
    <div className="wizard-container glass-panel animate-fade-in">
      <h2 style={{ textAlign: 'center', marginBottom: '10px', fontSize: '28px', color: '#00f2fe' }}>
        Asistente de Compatibilidad Inteligente
      </h2>
      <p style={{ textAlign: 'center', color: '#9ca3af', marginBottom: '30px' }}>
        Encuentra el accesorio perfecto y compatible para tus dispositivos en 3 simples pasos.
      </p>

      {/* Indicadores de Paso */}
      <div className="wizard-steps">
        <div className={`step-indicator ${step >= 1 ? 'active' : ''}`}>
          <div className="step-number">1</div>
          <span>Marca</span>
        </div>
        <div style={{ color: '#6b7280', fontSize: '18px' }}>➔</div>
        <div className={`step-indicator ${step >= 2 ? 'active' : ''}`}>
          <div className="step-number">2</div>
          <span>Modelo</span>
        </div>
        <div style={{ color: '#6b7280', fontSize: '18px' }}>➔</div>
        <div className={`step-indicator ${step >= 3 ? 'active' : ''}`}>
          <div className="step-number">3</div>
          <span>Compatibles</span>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#00f2fe' }}>
          <div className="animate-spin" style={{ display: 'inline-block', width: '30px', height: '30px', border: '3px solid rgba(0,242,254,0.3)', borderTopColor: '#00f2fe', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
          <p style={{ marginTop: '10px' }}>Cargando datos...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {error && (
        <div style={{ padding: '20px', background: 'rgba(239, 68, 110, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', marginBottom: '20px', textAlign: 'center' }}>
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* PASO 1: Selección de Marca */}
          {step === 1 && (
            <div className="animate-fade-in">
              <h3 style={{ fontSize: '20px', marginBottom: '15px' }}>Selecciona la marca de tu dispositivo</h3>
              {brands.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No hay marcas cargadas en el sistema actualmente.</p>
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
                          <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          brand.name.substring(0, 2).toUpperCase()
                        )}
                      </div>
                      <div style={{ fontWeight: '600' }}>{brand.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 2: Selección de Modelo */}
          {step === 2 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={{ fontSize: '20px' }}>Selecciona el modelo de tu {selectedBrand?.name}</h3>
                <button className="btn-secondary" onClick={() => setStep(1)}>Atrás</button>
              </div>
              {models.length === 0 ? (
                <p style={{ color: '#6b7280' }}>No hay modelos disponibles para esta marca.</p>
              ) : (
                <div className="grid-models">
                  {models.map(model => (
                    <div 
                      key={model.id} 
                      className="model-card glass-card"
                      onClick={() => handleModelSelect(model)}
                    >
                      <div style={{ fontWeight: '500' }}>{model.name}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PASO 3: Listado de Productos Compatibles */}
          {step === 3 && (
            <div className="animate-fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <div>
                  <h3 style={{ fontSize: '22px', color: '#00f2fe', margin: 0 }}>
                    Accesorios para: {selectedBrand?.name} {selectedModel?.name}
                  </h3>
                  <p style={{ color: '#9ca3af', fontSize: '14px', marginTop: '5px' }}>
                    Productos 100% compatibles y garantizados
                  </p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button className="btn-secondary" onClick={() => setStep(2)}>Atrás</button>
                  <button className="btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.4)', color: '#ef4444' }} onClick={resetAssistant}>Reiniciar</button>
                </div>
              </div>

              {products.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: '#9ca3af', fontSize: '18px' }}>No se encontraron accesorios compatibles listados en este momento.</p>
                  <p style={{ color: '#6b7280', fontSize: '14px', marginTop: '10px' }}>Prueba con otro dispositivo o vuelve a consultar más tarde.</p>
                </div>
              ) : (
                <div className="grid-products">
                  {products.map(product => (
                    <div key={product.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
                      <div style={{ height: '200px', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContext: 'center', position: 'relative' }}>
                        {product.image ? (
                          <img src={product.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#6b7280', background: 'var(--bg-secondary)' }}>
                            <span style={{ fontSize: '40px' }}>📦</span>
                            <span style={{ fontSize: '12px', marginTop: '5px' }}>Sin imagen disponible</span>
                          </div>
                        )}
                        <span style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', padding: '3px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                          {product.category_name}
                        </span>
                      </div>
                      
                      <div style={{ padding: '20px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', fontWeight: '600', color: '#f3f4f6', lineHeight: '1.4' }}>{product.name}</h4>
                          <p style={{ fontSize: '13px', color: '#9ca3af', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0 0 15px 0' }}>{product.description}</p>
                          
                          {/* Ficha técnica simplificada */}
                          {Object.keys(product.specifications).length > 0 && (
                            <div style={{ background: 'rgba(0,0,0,0.15)', padding: '10px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px' }}>
                              {Object.entries(product.specifications).slice(0, 3).map(([key, val]) => (
                                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', margin: '2px 0' }}>
                                  <span style={{ color: '#6b7280', textTransform: 'capitalize' }}>{key}:</span>
                                  <span style={{ color: '#9ca3af', fontWeight: '500' }}>{val}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#00f2fe' }}>
                              {product.price} €
                            </span>
                            <span style={{ fontSize: '12px', color: product.stock > 0 ? '#10b981' : '#ef4444' }}>
                              {product.stock > 0 ? `Stock: ${product.stock}` : 'Agotado'}
                            </span>
                          </div>
                          
                          <button 
                            className="btn-primary" 
                            style={{ width: '100%', justifyContent: 'center' }}
                            onClick={() => addToCart(product)}
                            disabled={product.stock <= 0}
                          >
                            <span>🛒</span>
                            <span>{product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CompatibilityAssistant;
