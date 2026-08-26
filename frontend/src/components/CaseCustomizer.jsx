import React, { useState, useEffect, useRef } from 'react';
import HelloKittyHoverIcon from './HelloKittyHoverIcon';
import { translations } from '../translations';


const PRESET_PATTERNS = [
  { id: 'eiffel-tower', name: 'Torre Eiffel (París)', url: 'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?w=800&auto=format&fit=crop&q=80' },
  { id: 'starry-night', name: 'La Noche Estrellada (Van Gogh)', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80' },
  { id: 'klimt-kiss', name: 'El Beso (Klimt)', url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800&auto=format&fit=crop&q=80' },
  { id: 'northern-lights', name: 'Auroras Boreales', url: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=800&auto=format&fit=crop&q=80' },
  { id: 'alpine-lake', name: 'Lago Alpino', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&auto=format&fit=crop&q=80' },
  { id: 'cosmic-fluid', name: 'Fluido Cósmico', url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&auto=format&fit=crop&q=80' },
  { id: 'sakura-blossoms', name: 'Flores de Cerezo (Sakura)', url: 'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=800&auto=format&fit=crop&q=80' },
  { id: 'tropical-sunset', name: 'Playa al Atardecer', url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&auto=format&fit=crop&q=80' },
  { id: 'nyc-skyline', name: 'Skyline de Nueva York', url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=800&auto=format&fit=crop&q=80' },
  { id: 'milky-way', name: 'Vía Láctea Real', url: 'https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?w=800&auto=format&fit=crop&q=80' },
  { id: 'louvre-paris', name: 'Pirámide del Louvre (París)', url: 'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=800&auto=format&fit=crop&q=80' },
  { id: 'autumn-forest', name: 'Bosque de Otoño', url: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&auto=format&fit=crop&q=80' },
  { id: 'gold-marble', name: 'Mármol Fluido de Oro', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80' },
  { id: 'tokyo-street', name: 'Neón en Tokio', url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80' },
];

const ARTWORKS = [
  { id: 'mona_lisa', name: 'La Mona Lisa', author: 'Leonardo da Vinci', filename: 'mona_lisa.jpg' },
  { id: 'starry_night', name: 'La Noche Estrellada', author: 'Vincent van Gogh', filename: 'starry_night.jpg' },
  { id: 'the_scream', name: 'El Grito', author: 'Edvard Munch', filename: 'the_scream.jpg' },
  { id: 'the_kiss', name: 'El Beso', author: 'Gustav Klimt', filename: 'the_kiss.jpg' },
  { id: 'girl_pearl_earring', name: 'La Joven de la Perla', author: 'Johannes Vermeer', filename: 'girl_pearl_earring.jpg' },
  { id: 'persistence_memory', name: 'La Persistencia de la Memoria', author: 'Salvador Dalí', filename: 'persistence_memory.jpg' },
  { id: 'great_wave', name: 'La Gran Ola', author: 'Hokusai', filename: 'great_wave.jpg' },
  { id: 'las_meninas', name: 'Las Meninas', author: 'Diego Velázquez', filename: 'las_meninas.jpg' },
  { id: 'las_senas', name: 'La Santa Cena', author: 'Leonardo da Vinci', filename: 'las_senas.jpg' },
  { id: 'birth_venus', name: 'El Nacimiento de Venus', author: 'Sandro Botticelli', filename: 'birth_venus.jpg' }
];

const CaseCustomizer = ({ onNavigate, currentLang, user }) => {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  // Detección de Rol Administrador / Staff
  const isAdmin = user?.isStaff || window.isStaff || (user?.username === 'admin');

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [imageUrl, setImageUrl] = useState(PRESET_PATTERNS[0].url);
  const [urlInput, setUrlInput] = useState('');
  const [customProduct, setCustomProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef(null);
  const [rainKey, setRainKey] = useState(0);

  // Estados de Ajuste Fino y Enfoque de Imagen (Opción 1 + Opción 3)
  const [fitMode, setFitMode] = useState('contain'); // 'contain' (auto-fit + blur) o 'cover'
  const [zoom, setZoom] = useState(100); // 50% a 200%
  const [offsetX, setOffsetX] = useState(0); // -100px a 100px
  const [offsetY, setOffsetY] = useState(0); // -100px a 100px
  const [rotation, setRotation] = useState(0); // 0, 90, 180, 270 grados

  const handleResetAdjustments = () => {
    setFitMode('contain');
    setZoom(100);
    setOffsetX(0);
    setOffsetY(0);
    setRotation(0);
  };

  const handleRotateLeft = () => {
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const handleRotateRight = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  // Estados del Gestor de Modelos de Dispositivos (Paso 1)
  const [customModels, setCustomModels] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_custom_admin_models') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [modelOutOfStockMap, setModelOutOfStockMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_model_out_of_stock') || '{}');
    } catch (e) {
      return {};
    }
  });

  const [modelBrandTab, setModelBrandTab] = useState('all');
  const [showAddModelForm, setShowAddModelForm] = useState(false);
  const [newModelForm, setNewModelForm] = useState({ name: '', brand: 'Apple', image: '' });
  const newModelFileInputRef = useRef(null);

  // Estados del Gestor de Carcasas para Administrador (Paso 3)
  const [customDesigns, setCustomDesigns] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_custom_admin_designs') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [outOfStockMap, setOutOfStockMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_case_out_of_stock') || '{}');
    } catch (e) {
      return {};
    }
  });

  const [adminTab, setAdminTab] = useState('all'); // 'all', 'art', 'custom', 'out_of_stock'
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCaseForm, setNewCaseForm] = useState({ name: '', category: 'custom', url: '' });
  const newCaseFileInputRef = useRef(null);

  // Estado de Publicación Rápida desde Paso 2
  const [showQuickPublishForm, setShowQuickPublishForm] = useState(false);
  const [quickPublishForm, setQuickPublishForm] = useState({ name: '', category: 'custom' });
  const [quickPublishSuccess, setQuickPublishSuccess] = useState(false);

  const handleQuickPublish = (e) => {
    e.preventDefault();
    if (!imageUrl || !quickPublishForm.name.trim()) return;

    const newDesign = {
      id: `custom_${Date.now()}`,
      name: quickPublishForm.name.trim(),
      url: imageUrl,
      category: quickPublishForm.category,
      isUserAdded: true
    };

    const updatedDesigns = [newDesign, ...customDesigns];
    setCustomDesigns(updatedDesigns);
    localStorage.setItem('techmatch_custom_admin_designs', JSON.stringify(updatedDesigns));

    setQuickPublishSuccess(true);
    setShowQuickPublishForm(false);
    setQuickPublishForm({ name: '', category: 'custom' });

    setTimeout(() => {
      setQuickPublishSuccess(false);
    }, 4000);
  };

  // Funciones de gestión de stock de modelos de dispositivos (Paso 1)
  const toggleModelStockStatus = (modelKey) => {
    setModelOutOfStockMap(prev => {
      const updated = { ...prev, [modelKey]: !prev[modelKey] };
      localStorage.setItem('techmatch_model_out_of_stock', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveNewModel = (e) => {
    e.preventDefault();
    if (!newModelForm.name.trim()) return;

    const newModelItem = {
      id: `model_${Date.now()}`,
      brand_name: newModelForm.brand.trim() || 'Apple',
      name: newModelForm.name.trim(),
      image: newModelForm.image.trim() || null,
      isUserAdded: true
    };

    const updatedCustom = [newModelItem, ...customModels];
    setCustomModels(updatedCustom);
    localStorage.setItem('techmatch_custom_admin_models', JSON.stringify(updatedCustom));

    setSelectedModel(`${newModelItem.brand_name} ${newModelItem.name}`);
    setNewModelForm({ name: '', brand: 'Apple', image: '' });
    setShowAddModelForm(false);
  };

  const handleDeleteModel = (modelId) => {
    const updatedCustom = customModels.filter(m => m.id !== modelId);
    setCustomModels(updatedCustom);
    localStorage.setItem('techmatch_custom_admin_models', JSON.stringify(updatedCustom));
  };

  const handleNewModelFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNewModelForm(prev => ({ ...prev, image: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Guardar modificaciones en localStorage para persistencia
  const toggleStockStatus = (designId) => {
    setOutOfStockMap(prev => {
      const updated = { ...prev, [designId]: !prev[designId] };
      localStorage.setItem('techmatch_case_out_of_stock', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveNewCase = (e) => {
    e.preventDefault();
    if (!newCaseForm.name.trim() || !newCaseForm.url.trim()) return;

    const newDesign = {
      id: `custom_${Date.now()}`,
      name: newCaseForm.name.trim(),
      url: newCaseForm.url.trim(),
      category: newCaseForm.category,
      isUserAdded: true
    };

    const updatedDesigns = [newDesign, ...customDesigns];
    setCustomDesigns(updatedDesigns);
    localStorage.setItem('techmatch_custom_admin_designs', JSON.stringify(updatedDesigns));

    // Seleccionar automáticamente la nueva carcasa
    setImageUrl(newDesign.url);
    setNewCaseForm({ name: '', category: 'custom', url: '' });
    setShowAddForm(false);
  };

  const handleDeleteDesign = (designId) => {
    const updatedDesigns = customDesigns.filter(d => d.id !== designId);
    setCustomDesigns(updatedDesigns);
    localStorage.setItem('techmatch_custom_admin_designs', JSON.stringify(updatedDesigns));
  };

  const handleNewCaseFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNewCaseForm(prev => ({ ...prev, url: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Catálogo completo de dispositivos (API + Personalizados)
  const allModels = [
    ...models.map(m => ({
      id: `api_${m.id}`,
      key: `${m.brand_name} ${m.name}`,
      brand_name: m.brand_name,
      name: m.name,
      image: m.image || null,
      isBuiltIn: true
    })),
    ...customModels.map(cm => ({
      id: cm.id,
      key: `${cm.brand_name} ${cm.name}`,
      brand_name: cm.brand_name,
      name: cm.name,
      image: cm.image || null,
      isUserAdded: true
    }))
  ];

  const availableBrands = Array.from(new Set(allModels.map(m => m.brand_name))).filter(Boolean);

  // Catálogo completo unificado
  const combinedCatalog = [
    ...PRESET_PATTERNS.map(p => ({
      id: p.id,
      name: translations[activeLang]?.patternNames?.[p.name] || p.name,
      url: p.url,
      category: 'custom',
      isBuiltIn: true
    })),
    ...ARTWORKS.map(a => ({
      id: `art_${a.id}`,
      name: `${a.name} (${a.author})`,
      url: `/static/assets/art/${a.filename}`,
      category: 'art',
      isBuiltIn: true
    })),
    ...customDesigns.map(c => ({
      id: c.id,
      name: c.name,
      url: c.url,
      category: c.category || 'custom',
      isUserAdded: true
    }))
  ];

  // Elementos visibles según rol y pestaña seleccionada
  const displayedItems = combinedCatalog.filter(item => {
    const isOutOfStock = !!outOfStockMap[item.id];
    
    if (!isAdmin) {
      // Para usuarios normales, mostrar solo items disponibles
      return !isOutOfStock;
    }

    // Para Administradores, filtrar según la pestaña activa
    if (adminTab === 'art') return item.category === 'art';
    if (adminTab === 'custom') return item.category === 'custom';
    if (adminTab === 'out_of_stock') return isOutOfStock;
    return true; // 'all'
  });

  // Cargar el producto semilla del backend y la lista de modelos de dispositivos reales
  useEffect(() => {
    fetch('/api/products/')
      .then(res => res.json())
      .then(data => {
        const prod = data.find(p => p.name === "Carcasa Personalizada con Diseño Web/Google");
        if (prod) {
          setCustomProduct(prod);
        }
      })
      .catch(err => console.error("Error al buscar producto semilla de carcasa:", err));

    fetch('/api/models/')
      .then(res => res.json())
      .then(data => {
        setModels(data);
        if (data.length > 0) {
          setSelectedModel(`${data[0].brand_name} ${data[0].name}`);
        }
      })
      .catch(err => console.error("Error al cargar modelos de dispositivos reales:", err));
  }, []);

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (urlInput.trim()) {
      setImageUrl(urlInput.trim());
      setSuccess(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target.result);
        setSuccess(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handlePresetSelect = (url) => {
    setImageUrl(url);
    setSuccess(false);
  };

  const handleAddToCart = () => {
    if (!customProduct) {
      alert("Cargando información del catálogo, por favor intenta en un momento.");
      return;
    }

    setAdding(true);

    // Generar un ID local único para el carrito para evitar colisiones si añaden múltiples diseños
    const cartItemId = `custom-case-${selectedModel.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}`;

    const cartItem = {
      id: cartItemId,
      databaseId: customProduct.id, // ID real para relacionar la FK en base de datos
      name: `Carcasa Personalizada (${selectedModel})`,
      price: customProduct.price || 19.99,
      image: imageUrl, // Imagen del diseño cargado en el preview
      quantity: 1,
      custom_image: imageUrl,
      custom_model: selectedModel
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    // Despachar evento para notificar al CartDrawer y abrir el carrito
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));

    setTimeout(() => {
      setAdding(false);
      setSuccess(true);
    }, 800);
  };

  return (
    <div className="wizard-container glass-panel animate-fade-in" id="customizer-section" style={{ margin: '40px auto 80px auto' }}>
      <div className="wizard-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '20px', padding: '0 10px', position: 'relative' }}>
        
        {/* ICONO IZQUIERDO: Estrella 3D */}
        <div className="star-glitch-container" style={{ flexShrink: 0, position: 'relative', marginLeft: '100px' }}>
          <a 
            href={isAdmin ? "#step-2-customizer" : "/universe/"} 
            onClick={(e) => {
              e.preventDefault();
              if (isAdmin) {
                const el = document.getElementById('step-2-customizer') || document.getElementById('step-3-customizer');
                if (el) {
                  const yOffset = -120;
                  const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
                  window.scrollTo({ top: y, behavior: 'smooth' });
                } else {
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }
              } else {
                if (onNavigate) {
                  onNavigate('universe', '/universe/');
                } else {
                  window.history.pushState({}, '', '/universe/');
                  window.dispatchEvent(new PopStateEvent('popstate'));
                }
              }
            }} 
            className="star-glitch-link"
          >
            <div className="star-img-wrapper" style={{ position: 'relative' }}>
              <img 
                src="/static/assets/icons/logo-star-universe.png?v=2" 
                alt="Estudio Creativo de TechMatch" 
                className="star-universe-nav-btn-large" 
                style={{ height: '140px', width: '140px', objectFit: 'contain' }}
              />
            </div>

            <div className="star-hover-glitch-msg" style={{ left: '0', transform: 'translateX(0)' }}>
              <span className="artistic-glitch-text" data-text={isAdmin ? "Gestor de carcasas Y diseños" : t('exclusiveGalleryBadge')}>
                {isAdmin ? "Gestor de carcasas Y diseños" : t('exclusiveGalleryBadge')}
              </span>
            </div>
          </a>
        </div>

        {/* CENTRO: Textos del título con textura real del material azul */}
        <div style={{ flex: 1, textAlign: 'center' }}>
          <h1 
            className="customizer-title-main" 
            style={{ 
              margin: '0 0 4px 0', 
              fontSize: 'clamp(56px, 7vw, 84px)',
              fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive",
              fontWeight: '400',
              color: '#0063b5',
              backgroundImage: "url('/static/blue-flower-texture.jpg')",
              backgroundSize: '140px auto',
              backgroundPosition: 'center',
              backgroundRepeat: 'repeat',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'inline-block',
              WebkitTextStroke: '1.4px #0063b5',
              filter: 'drop-shadow(0 0 1px #000000) drop-shadow(0 4px 16px rgba(0, 85, 170, 0.7)) drop-shadow(0 2px 10px rgba(0, 0, 0, 0.95))'
            }}
          >
            {t('customizerTitleMain')}
          </h1>
          {/* Contenedor de Lluvia de Estrellas Fugaces Re-activable al Pulsar en "Personaliza tu carcasa" */}
          <div className="shooting-stars-container" key={`shooting-rain-customizer-${rainKey}`}>
            {Array.from({ length: 30 }).map((_, i) => {
              const delay = `${(Math.random() * 0.75).toFixed(2)}s`;
              const duration = `${(1.1 + Math.random() * 0.6).toFixed(2)}s`;
              const top = `${(Math.random() * 70 - 15).toFixed(0)}%`;
              const left = `${(25 + Math.random() * 75).toFixed(0)}%`;
              const scale = (0.6 + Math.random() * 0.8).toFixed(2);
              const color = Math.random() > 0.4 ? 'rgba(0, 242, 254, 1)' : 'rgba(255, 105, 180, 1)';
              return (
                <div 
                  key={`star-customizer-${rainKey}-${i}`} 
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

          <div 
            style={{ 
              margin: '0 0 10px 0', 
              display: 'flex', 
              justifyContent: 'center', 
              width: '100%',
              cursor: 'pointer',
              transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.35s ease'
            }}
            onClick={() => setRainKey(prev => prev + 1)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.08)';
              e.currentTarget.style.filter = 'drop-shadow(0 0 16px rgba(0, 242, 254, 0.6))';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.filter = 'none';
            }}
            title="✨ ¡Haz clic para activar la lluvia de estrellas fugaces!"
          >
            <svg 
              viewBox="0 0 750 95" 
              style={{ 
                width: '100%', 
                maxWidth: '820px', 
                height: 'auto', 
                overflow: 'visible',
                display: 'block',
                margin: '0 auto',
                filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))',
                cursor: 'pointer'
              }}
            >
              <defs>
                <pattern id="oilPaintPattern" patternUnits="userSpaceOnUse" width="750" height="95">
                  <image 
                    href="/static/oil-paint-texture.jpg" 
                    x="20" 
                    y="-90" 
                    width="750" 
                    height="360" 
                    preserveAspectRatio="xMidYMid slice" 
                  />
                </pattern>
              </defs>
              <text 
                x="50%" 
                y="68" 
                textAnchor="middle" 
                fill="url(#oilPaintPattern)" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                paintOrder="stroke fill"
                strokeLinejoin="round"
                style={{
                  fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive",
                  fontSize: '66px',
                  fontWeight: '800',
                  letterSpacing: '1.5px',
                  cursor: 'pointer'
                }}
              >
                {t('customizerSubtitleSub')}
              </text>
            </svg>
          </div>
          <p style={{ margin: '0 auto', maxWidth: '650px', fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('customizerDesc')}
          </p>
        </div>

        {/* ICONO DERECHO: Cordón Hello Kitty al mismo tamaño */}
        <div className="star-glitch-container" style={{ flexShrink: 0, position: 'relative' }}>
          <a 
            href="/accesorios/" 
            onClick={(e) => {
              e.preventDefault();
              if (onNavigate) {
                onNavigate('accesorios', '/accesorios/');
              } else {
                window.history.pushState({}, '', '/accesorios/');
                window.dispatchEvent(new PopStateEvent('popstate'));
              }
              window.scrollTo(0, 0);
              document.documentElement.scrollTop = 0;
            }} 
            className="star-glitch-link"
          >
            <div className="star-img-wrapper" style={{ position: 'relative' }}>
              <HelloKittyHoverIcon size="200px" className="star-universe-nav-btn-large" />
            </div>





            <div className="star-hover-glitch-msg" style={{ right: '0', left: 'auto', transform: 'translateX(0)', border: '1.5px solid rgba(255, 105, 180, 0.5)' }}>
              <span className="artistic-glitch-text" data-text={t('techMatchAccessoriesBadge')}>
                {t('techMatchAccessoriesBadge')}
              </span>
            </div>
          </a>
        </div>

      </div>

      <div className="customizer-grid">
        
        {/* PANEL IZQUIERDO: CONTROLES */}
        <div className="customizer-controls">

          {/* PASO 1: MODELO & GESTOR DE DISPOSITIVOS ADMIN */}
          <div className="customizer-step" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
              <h4 className="step-title" style={{ margin: 0 }}>
                {isAdmin ? (t('adminDeviceManagerTitle') || "1. Gestión de Modelos y Stock de Equipos 📱") : t('chooseModel')}
              </h4>
              {isAdmin && (
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: 'rgba(0, 242, 254, 0.15)', 
                  color: '#00f2fe', 
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  👑 Panel Admin
                </span>
              )}
            </div>

            {/* MODO COMPRADOR NORMAL */}
            {!isAdmin ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
                {allModels.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Cargando dispositivos de la web...</p>
                ) : (
                  <div className="search-bar-container glass-panel" style={{ margin: 0, height: '44px', padding: '0 15px', display: 'flex', alignItems: 'center', flex: '1 1 320px', maxWidth: '320px' }}>
                    <span style={{ color: 'var(--text-muted)', fontSize: '14px', marginRight: '8px' }}>📱</span>
                    <select 
                      className="search-input"
                      style={{ 
                        background: 'transparent', 
                        border: 'none', 
                        color: '#fff', 
                        outline: 'none', 
                        width: '100%', 
                        fontFamily: 'var(--font-sans)', 
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                    >
                      {allModels
                        .filter(m => !modelOutOfStockMap[m.key])
                        .map(m => (
                          <option key={m.id} value={m.key} style={{ background: '#0b0f19', color: '#fff' }}>
                            {m.brand_name} - {m.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              /* MODO ADMINISTRADOR (PANEL DE CONTROL DE MODELOS) */
              <div style={{ 
                background: 'rgba(11, 15, 25, 0.85)', 
                border: '1px solid rgba(0, 242, 254, 0.3)', 
                borderRadius: '12px', 
                padding: '12px', 
                marginBottom: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: showAddModelForm ? '12px' : '10px' }}>
                  {/* Pestañas de Marcas */}
                  <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setModelBrandTab('all')}
                      style={{
                        padding: '4px 8px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: modelBrandTab === 'all' ? '#00f2fe' : 'rgba(255,255,255,0.1)',
                        background: modelBrandTab === 'all' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: modelBrandTab === 'all' ? '#00f2fe' : '#aaa',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Todas ({allModels.length})
                    </button>
                    {availableBrands.map(b => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setModelBrandTab(b)}
                        style={{
                          padding: '4px 8px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          border: '1px solid',
                          borderColor: modelBrandTab === b ? '#00f2fe' : 'rgba(255,255,255,0.1)',
                          background: modelBrandTab === b ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.03)',
                          color: modelBrandTab === b ? '#00f2fe' : '#aaa',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        {b} ({allModels.filter(m => m.brand_name === b).length})
                      </button>
                    ))}
                  </div>

                  {/* Botón Añadir Nuevo Modelo */}
                  <button
                    type="button"
                    onClick={() => setShowAddModelForm(!showAddModelForm)}
                    style={{
                      padding: '5px 10px',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '6px',
                      border: 'none',
                      background: showAddModelForm ? 'rgba(239, 68, 68, 0.85)' : 'linear-gradient(135deg, #00f2fe, #4facfe)',
                      color: showAddModelForm ? '#fff' : '#000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}
                  >
                    {showAddModelForm ? '✖ Cancelar' : '➕ Añadir Modelo'}
                  </button>
                </div>

                {/* FORMULARIO EXPANDIBLE DE ALTA DE DISPOSITIVO */}
                {showAddModelForm && (
                  <form 
                    onSubmit={handleSaveNewModel}
                    style={{ 
                      marginTop: '10px', 
                      paddingTop: '10px', 
                      borderTop: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: '12px', color: '#00f2fe', fontWeight: '700' }}>
                      📱 Incluir Nuevo Teléfono / Tablet
                    </h5>

                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <input 
                        type="text"
                        placeholder="Nombre del modelo (ej. iPhone 16 Pro Max)"
                        value={newModelForm.name}
                        onChange={e => setNewModelForm({ ...newModelForm, name: e.target.value })}
                        required
                        style={{
                          flex: '1 1 180px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none'
                        }}
                      />
                      <input 
                        type="text"
                        placeholder="Marca (ej. Apple, Samsung, Xiaomi)"
                        value={newModelForm.brand}
                        onChange={e => setNewModelForm({ ...newModelForm, brand: e.target.value })}
                        required
                        style={{
                          width: '130px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none'
                        }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="text"
                        placeholder="URL de foto/silueta del dispositivo (opcional)"
                        value={newModelForm.image}
                        onChange={e => setNewModelForm({ ...newModelForm, image: e.target.value })}
                        style={{
                          flex: '1 1 200px',
                          padding: '6px 10px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none'
                        }}
                      />
                      <input 
                        type="file"
                        ref={newModelFileInputRef}
                        accept="image/*"
                        onChange={handleNewModelFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => newModelFileInputRef.current?.click()}
                        style={{
                          padding: '6px 10px',
                          fontSize: '11px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📁 Foto Dispositivo
                      </button>
                    </div>

                    {newModelForm.image && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>Vista previa teléfono:</span>
                        <img src={newModelForm.image} alt="Device Preview" style={{ width: '35px', height: '35px', objectFit: 'contain', borderRadius: '4px', border: '1px solid #00f2fe' }} />
                      </div>
                    )}

                    <button
                      type="submit"
                      style={{
                        padding: '7px 14px',
                        fontSize: '11px',
                        fontWeight: '700',
                        borderRadius: '6px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        alignSelf: 'flex-start'
                      }}
                    >
                      ✓ Guardar Modelo en Tienda
                    </button>
                  </form>
                )}

                {/* LISTA / GRID DE MODELOS DE DISPOSITIVOS PARA ADMIN */}
                <div style={{ 
                  display: 'flex', 
                  flexWrap: 'wrap', 
                  gap: '6px', 
                  maxHeight: '180px', 
                  overflowY: 'auto', 
                  marginTop: '8px',
                  paddingRight: '4px'
                }}>
                  {allModels
                    .filter(m => modelBrandTab === 'all' || m.brand_name === modelBrandTab)
                    .map(m => {
                      const isOutOfStock = !!modelOutOfStockMap[m.key];
                      const isSelected = selectedModel === m.key;

                      return (
                        <div 
                          key={m.id}
                          onClick={() => setSelectedModel(m.key)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '11px',
                            background: isSelected ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.04)',
                            border: isSelected ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)',
                            color: isOutOfStock ? '#888' : '#fff',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            cursor: 'pointer',
                            textDecoration: isOutOfStock ? 'line-through' : 'none'
                          }}
                        >
                          {m.image ? (
                            <img src={m.image} alt={m.name} style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '2px' }} />
                          ) : (
                            <span>📱</span>
                          )}
                          
                          <span style={{ fontWeight: '600' }}>{m.brand_name} - {m.name}</span>

                          {/* Toggle Stock */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleModelStockStatus(m.key);
                            }}
                            title={isOutOfStock ? "Marcar como Disponible" : "Marcar como Agotado"}
                            style={{
                              width: '18px',
                              height: '18px',
                              borderRadius: '3px',
                              border: 'none',
                              background: isOutOfStock ? '#ef4444' : '#10b981',
                              color: '#fff',
                              fontSize: '9px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0,
                              marginLeft: '2px'
                            }}
                          >
                            {isOutOfStock ? '🔴' : '🟢'}
                          </button>

                          {/* Eliminar si fue añadido por admin */}
                          {m.isUserAdded && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteModel(m.id);
                              }}
                              title="Eliminar este modelo"
                              style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '3px',
                                border: 'none',
                                background: 'rgba(239, 68, 68, 0.8)',
                                color: '#fff',
                                fontSize: '9px',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: 0
                              }}
                            >
                              🗑️
                            </button>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}
          </div>

          {/* PASO 2: SELECCIONAR IMAGEN & PUBLICACIÓN RÁPIDA DE ADMIN */}
          <div id="step-2-customizer" className="customizer-step" style={{ position: 'relative' }}>
            <h4 className="step-title" style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
              {t('uploadTexture')}
              <span className="tooltip-trigger">
                ⓘ
              </span>
            </h4>

            {/* AVISO EXPLICATIVO PARA ADMINISTRADOR */}
            {isAdmin && (
              <div style={{
                background: 'rgba(0, 242, 254, 0.08)',
                border: '1px solid rgba(0, 242, 254, 0.3)',
                borderRadius: '8px',
                padding: '8px 12px',
                marginBottom: '12px',
                fontSize: '11.5px',
                color: '#00f2fe',
                lineHeight: '1.4'
              }}>
                💡 <strong>Modo Administrador:</strong> Carga cualquier imagen de la web o de tu ordenador. Si te gusta cómo luce en la carcasa 3D, ¡puedes convertirla en un producto publicado para tus clientes con 1 clic!
              </div>
            )}
            
            {/* Input URL */}
            <form onSubmit={handleUrlSubmit} style={{ display: 'flex', gap: '10px', marginBottom: '12px', position: 'relative' }}>
              <div className="search-bar-container glass-panel" style={{ flex: 1, margin: 0, height: '44px', padding: '0 15px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>🔗</span>
                <input 
                  type="text" 
                  placeholder={t('imageUrlPlaceholder')} 
                  className="search-input"
                  style={{ fontSize: '13px' }}
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-secondary" style={{ padding: '0 18px', height: '44px', fontSize: '13px' }}>
                {t('loadBtn')}
              </button>
            </form>

            {/* Subir Archivo Local */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              accept="image/*" 
              style={{ display: 'none' }}
            />
            <button 
              className="btn-secondary" 
              style={{ width: '100%', height: '44px', display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', fontSize: '13px', borderColor: 'rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
              onClick={triggerFileSelect}
            >
              <span>📤</span> {t('uploadLocalImgBtn')}
            </button>

            {/* PANEL DE AJUSTE FINO & ENFOQUE DE IMAGEN (OPCIÓN 1 + OPCIÓN 3) */}
            {imageUrl && (
              <div className="image-adjust-panel">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h5 style={{ margin: 0, fontSize: '12.5px', color: '#00f2fe', fontWeight: '700' }}>
                    {t('adjustControlsTitle')}
                  </h5>
                  <button
                    type="button"
                    onClick={handleResetAdjustments}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: '1px solid rgba(255, 255, 255, 0.2)',
                      color: '#cbd5e1',
                      borderRadius: '6px',
                      padding: '3px 8px',
                      fontSize: '11px',
                      cursor: 'pointer'
                    }}
                  >
                    {t('resetAdjustmentsBtn')}
                  </button>
                </div>

                {/* Modo de Encuadre */}
                <div style={{ marginBottom: '10px' }}>
                  <label className="adjust-slider-label" style={{ marginBottom: '4px' }}>
                    <span>{t('fitModeLabel')}</span>
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => setFitMode('contain')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: fitMode === 'contain' ? '#00f2fe' : 'rgba(255,255,255,0.15)',
                        background: fitMode === 'contain' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: fitMode === 'contain' ? '#00f2fe' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {t('fitContain')}
                    </button>
                    <button
                      type="button"
                      onClick={() => setFitMode('cover')}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: fitMode === 'cover' ? '#00f2fe' : 'rgba(255,255,255,0.15)',
                        background: fitMode === 'cover' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: fitMode === 'cover' ? '#00f2fe' : '#94a3b8',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      {t('fitCover')}
                    </button>
                  </div>
                </div>

                {/* Botones de Rotación / Girar 90° */}
                <div style={{ marginBottom: '10px' }}>
                  <div className="adjust-slider-label" style={{ marginBottom: '4px' }}>
                    <span>🔄 {t('rotateLabel')}</span>
                    <span className="adjust-slider-val">{rotation}°</span>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={handleRotateLeft}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      {t('rotateLeftBtn')}
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateRight}
                      style={{
                        flex: 1,
                        padding: '6px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255, 255, 255, 0.15)',
                        background: 'rgba(255, 255, 255, 0.04)',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      {t('rotateRightBtn')}
                    </button>
                  </div>
                </div>

                {/* Slider Zoom */}
                <div className="adjust-slider-group" style={{ marginBottom: '8px' }}>
                  <div className="adjust-slider-label">
                    <span>🔍 {t('zoomLabel')}</span>
                    <span className="adjust-slider-val">{zoom}%</span>
                  </div>
                  <input
                    type="range"
                    min="50"
                    max="200"
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="adjust-slider-input"
                  />
                </div>

                {/* Slider Posición Horizontal (X) */}
                <div className="adjust-slider-group" style={{ marginBottom: '8px' }}>
                  <div className="adjust-slider-label">
                    <span>↔️ {t('positionXLabel')}</span>
                    <span className="adjust-slider-val">{offsetX}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={offsetX}
                    onChange={(e) => setOffsetX(Number(e.target.value))}
                    className="adjust-slider-input"
                  />
                </div>

                {/* Slider Posición Vertical (Y) */}
                <div className="adjust-slider-group">
                  <div className="adjust-slider-label">
                    <span>↕️ {t('positionYLabel')}</span>
                    <span className="adjust-slider-val">{offsetY}px</span>
                  </div>
                  <input
                    type="range"
                    min="-100"
                    max="100"
                    value={offsetY}
                    onChange={(e) => setOffsetY(Number(e.target.value))}
                    className="adjust-slider-input"
                  />
                </div>
              </div>
            )}

            {/* BOTÓN Y PANEL DE PUBLICACIÓN RÁPIDA DE ADMIN (CUANDO HAY UNA IMAGEN CARGADA) */}
            {isAdmin && imageUrl && (
              <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button
                  type="button"
                  onClick={() => setShowQuickPublishForm(!showQuickPublishForm)}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    fontSize: '12px',
                    fontWeight: '700',
                    borderRadius: '8px',
                    border: 'none',
                    background: showQuickPublishForm ? 'rgba(239, 68, 68, 0.85)' : 'linear-gradient(135deg, #00f2fe, #ff007f)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 15px rgba(0, 242, 254, 0.25)'
                  }}
                >
                  {showQuickPublishForm ? '✖ Cancelar Publicación' : '⭐ Convertir en Producto de la Tienda (Paso 3)'}
                </button>

                {showQuickPublishForm && (
                  <form 
                    onSubmit={handleQuickPublish}
                    style={{ 
                      marginTop: '10px', 
                      padding: '10px', 
                      background: 'rgba(11, 15, 25, 0.9)', 
                      border: '1px solid rgba(0, 242, 254, 0.35)', 
                      borderRadius: '8px', 
                      display: 'flex', 
                      flexDirection: 'column', 
                      gap: '8px' 
                    }}
                  >
                    <h5 style={{ margin: 0, fontSize: '12px', color: '#00f2fe', fontWeight: '700' }}>
                      ✨ Publicar Imagen Actual como Producto
                    </h5>

                    <input 
                      type="text" 
                      placeholder="Nombre del diseño (ej. Mármol Dorado Imperial)" 
                      value={quickPublishForm.name} 
                      onChange={e => setQuickPublishForm({ ...quickPublishForm, name: e.target.value })} 
                      required 
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '12px', 
                        borderRadius: '6px', 
                        background: 'rgba(0,0,0,0.5)', 
                        border: '1px solid rgba(0, 242, 254, 0.3)', 
                        color: '#fff', 
                        outline: 'none' 
                      }} 
                    />

                    <select 
                      value={quickPublishForm.category} 
                      onChange={e => setQuickPublishForm({ ...quickPublishForm, category: e.target.value })} 
                      style={{ 
                        padding: '6px 10px', 
                        fontSize: '12px', 
                        borderRadius: '6px', 
                        background: '#0b0f19', 
                        border: '1px solid rgba(0, 242, 254, 0.3)', 
                        color: '#fff', 
                        outline: 'none',
                        cursor: 'pointer'
                      }} 
                    >
                      <option value="custom">Personalización Estándar</option>
                      <option value="art">Galería de Arte Exclusiva</option>
                    </select>

                    <button 
                      type="submit" 
                      style={{ 
                        padding: '7px 14px', 
                        fontSize: '11px', 
                        fontWeight: '700', 
                        borderRadius: '6px', 
                        background: 'linear-gradient(135deg, #10b981, #059669)', 
                        color: '#fff', 
                        border: 'none', 
                        cursor: 'pointer', 
                        alignSelf: 'flex-start' 
                      }} 
                    >
                      ✓ Publicar e Incluir en el Catálogo
                    </button>
                  </form>
                )}

                {quickPublishSuccess && (
                  <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#10b981', fontWeight: '600', textAlign: 'center' }}>
                    ✅ ¡Diseño publicado e incluido en la tienda exitosamente! Se encuentra disponible en el Paso 3.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* PASO 3: DISEÑOS PRESELECCIONADOS & GESTOR DE ADMIN */}
          <div id="step-3-customizer" className="customizer-step" style={{ position: 'relative' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
              <h4 className="step-title" style={{ margin: 0 }}>
                {t('curatedPatternsTitle')}
              </h4>
              {isAdmin && (
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: 'rgba(0, 242, 254, 0.15)', 
                  color: '#00f2fe', 
                  border: '1px solid rgba(0, 242, 254, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  👑 Panel Admin
                </span>
              )}
            </div>

            {/* BARRA DE HERRAMIENTAS Y CONTROL EXCLUSIVA PARA ADMINISTRADOR */}
            {isAdmin && (
              <div style={{ 
                background: 'rgba(11, 15, 25, 0.85)', 
                border: '1px solid rgba(0, 242, 254, 0.3)', 
                borderRadius: '12px', 
                padding: '12px', 
                marginBottom: '15px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: showAddForm ? '12px' : '0' }}>
                  {/* Pestañas de Filtro */}
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => setAdminTab('all')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: adminTab === 'all' ? '#00f2fe' : 'rgba(255,255,255,0.1)',
                        background: adminTab === 'all' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: adminTab === 'all' ? '#00f2fe' : '#aaa',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      Todos ({combinedCatalog.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('art')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: adminTab === 'art' ? '#ff007f' : 'rgba(255,255,255,0.1)',
                        background: adminTab === 'art' ? 'rgba(255, 0, 127, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: adminTab === 'art' ? '#ff007f' : '#aaa',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🎨 Arte ({combinedCatalog.filter(i => i.category === 'art').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('custom')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: adminTab === 'custom' ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                        background: adminTab === 'custom' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: adminTab === 'custom' ? '#60a5fa' : '#aaa',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      📷 Personalizados ({combinedCatalog.filter(i => i.category === 'custom').length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setAdminTab('out_of_stock')}
                      style={{
                        padding: '5px 10px',
                        fontSize: '11px',
                        borderRadius: '6px',
                        border: '1px solid',
                        borderColor: adminTab === 'out_of_stock' ? '#ef4444' : 'rgba(255,255,255,0.1)',
                        background: adminTab === 'out_of_stock' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255,255,255,0.03)',
                        color: adminTab === 'out_of_stock' ? '#ef4444' : '#aaa',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      🔴 Agotados ({Object.values(outOfStockMap).filter(Boolean).length})
                    </button>
                  </div>

                  {/* Botón Añadir Nueva Carcasa */}
                  <button
                    type="button"
                    onClick={() => setShowAddForm(!showAddForm)}
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      fontWeight: '700',
                      borderRadius: '8px',
                      border: 'none',
                      background: showAddForm ? 'rgba(239, 68, 68, 0.85)' : 'linear-gradient(135deg, #00f2fe, #4facfe)',
                      color: showAddForm ? '#fff' : '#000',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}
                  >
                    {showAddForm ? '✖ Cancelar' : '➕ Añadir Nueva Carcasa'}
                  </button>
                </div>

                {/* FORMULARIO EXPANDIBLE HACIA ABAJO PARA AÑADIR NUEVO DISEÑO */}
                {showAddForm && (
                  <form 
                    onSubmit={handleSaveNewCase}
                    style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid rgba(255,255,255,0.12)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, fontSize: '13px', color: '#00f2fe', fontWeight: '700' }}>
                        ✨ Incluir Nuevo Diseño en la Web
                      </h5>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                      <input 
                        type="text"
                        placeholder="Nombre o título de la carcasa (ej. Galaxia Neón)"
                        value={newCaseForm.name}
                        onChange={e => setNewCaseForm({ ...newCaseForm, name: e.target.value })}
                        required
                        style={{
                          flex: '1 1 220px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none'
                        }}
                      />
                      <select
                        value={newCaseForm.category}
                        onChange={e => setNewCaseForm({ ...newCaseForm, category: e.target.value })}
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: '#0b0f19',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        <option value="custom">Personalización Estándar</option>
                        <option value="art">Galería de Arte Exclusiva</option>
                      </select>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <input 
                        type="text"
                        placeholder="Pega la URL de la imagen (o sube archivo local a la derecha)"
                        value={newCaseForm.url}
                        onChange={e => setNewCaseForm({ ...newCaseForm, url: e.target.value })}
                        style={{
                          flex: '1 1 250px',
                          padding: '8px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(0,0,0,0.5)',
                          border: '1px solid rgba(0, 242, 254, 0.3)',
                          color: '#fff',
                          outline: 'none'
                        }}
                      />
                      <input 
                        type="file"
                        ref={newCaseFileInputRef}
                        accept="image/*"
                        onChange={handleNewCaseFileUpload}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        onClick={() => newCaseFileInputRef.current?.click()}
                        style={{
                          padding: '8px 12px',
                          fontSize: '12px',
                          borderRadius: '6px',
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.2)',
                          color: '#fff',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📁 Cargar Imagen Local
                      </button>
                    </div>

                    {newCaseForm.url && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: '#aaa' }}>Previsualización:</span>
                        <img src={newCaseForm.url} alt="Preview" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #00f2fe' }} />
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                      <button
                        type="submit"
                        style={{
                          padding: '8px 16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          borderRadius: '6px',
                          background: 'linear-gradient(135deg, #10b981, #059669)',
                          color: '#fff',
                          border: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ Guardar e Incluir en Catálogo
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* CUADRÍCULA DE MINIATURAS (GRID RECTANGULAR) */}
            <div className="curated-patterns-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(75px, 1fr))', gap: '10px' }}>
              {displayedItems.map(item => {
                const isOutOfStock = !!outOfStockMap[item.id];
                const isActive = imageUrl === item.url;

                return (
                  <div 
                    key={item.id} 
                    style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: isActive ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.1)' }}
                  >
                    <button 
                      type="button"
                      className={`pattern-thumb-btn ${isActive ? 'active' : ''}`}
                      onClick={() => handlePresetSelect(item.url)}
                      title={item.name}
                      style={{ 
                        width: '100%',
                        height: '75px',
                        backgroundImage: `url(${item.url})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: isOutOfStock ? 'grayscale(90%) opacity(0.35)' : 'none',
                        position: 'relative',
                        border: 'none',
                        display: 'block'
                      }}
                    />

                    {/* Etiqueta de Categoría */}
                    <span style={{
                      position: 'absolute',
                      top: '3px',
                      left: '3px',
                      fontSize: '8px',
                      fontWeight: 'bold',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      background: item.category === 'art' ? 'rgba(255, 0, 127, 0.9)' : 'rgba(0, 242, 254, 0.9)',
                      color: '#fff',
                      pointerEvents: 'none',
                      zIndex: 2
                    }}>
                      {item.category === 'art' ? 'Arte' : 'Pers'}
                    </span>

                    {/* Overlay si está Agotado */}
                    {isOutOfStock && (
                      <div style={{
                        position: 'absolute',
                        inset: 0,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0, 0, 0, 0.7)',
                        pointerEvents: 'none',
                        zIndex: 2
                      }}>
                        <span style={{ fontSize: '9px', fontWeight: 'bold', color: '#ff4d4d', textTransform: 'uppercase', textAlign: 'center', padding: '0 2px' }}>
                          Agotado
                        </span>
                      </div>
                    )}

                    {/* CONTROLES RÁPIDOS PARA ADMIN */}
                    {isAdmin && (
                      <div style={{
                        position: 'absolute',
                        bottom: '2px',
                        right: '2px',
                        display: 'flex',
                        gap: '3px',
                        zIndex: 4
                      }}>
                        {/* Toggle Disponible / Agotado */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStockStatus(item.id);
                          }}
                          title={isOutOfStock ? "Marcar como Disponible" : "Marcar como Agotado"}
                          style={{
                            width: '20px',
                            height: '20px',
                            borderRadius: '4px',
                            border: 'none',
                            background: isOutOfStock ? '#ef4444' : '#10b981',
                            color: '#fff',
                            fontSize: '10px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: 0
                          }}
                        >
                          {isOutOfStock ? '🔴' : '🟢'}
                        </button>

                        {/* Eliminar si fue añadido por admin */}
                        {item.isUserAdded && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteDesign(item.id);
                            }}
                            title="Eliminar esta carcasa"
                            style={{
                              width: '20px',
                              height: '20px',
                              borderRadius: '4px',
                              border: 'none',
                              background: 'rgba(239, 68, 68, 0.9)',
                              color: '#fff',
                              fontSize: '10px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              padding: 0
                            }}
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ACCIÓN: AÑADIR AL CARRITO (Oculto para Administrador) */}
          {(!user || !user.isStaff) && (
            <div style={{ marginTop: '35px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <div>
                  <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Precio Unitario:</span>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>
                    {customProduct ? `${customProduct.price} €` : '19.99 €'}
                  </div>
                </div>
                <span className="product-stock-status available" style={{ margin: 0, padding: '4px 10px', fontSize: '12px' }}>
                  ✓ Diseño Listo
                </span>
              </div>

              <button 
                className="btn-primary" 
                style={{ width: '100%', height: '48px', justifyContent: 'center', gap: '8px' }}
                onClick={handleAddToCart}
                disabled={adding}
              >
                <span>{adding ? 'Procesando...' : success ? '¡Añadida con éxito! 🛒' : `🎨 ${t('addCustomCaseToCart')}`}</span>
              </button>

              {success && (
                <p style={{ margin: '10px 0 0 0', fontSize: '12px', color: 'var(--color-success)', textAlign: 'center', fontWeight: '500' }}>
                  ¡Carcasa personalizada agregada! Abre tu carrito para finalizar el pedido.
                </p>
              )}
            </div>
          )}
        </div>

        {/* PANEL DERECHO: PREVISUALIZADOR 3D CSS */}
        <div className="customizer-preview-panel">
          <div className="preview-studio">
            
            {/* Base reflectante */}
            <div className="mockup-studio-base">
              <div className="studio-neon-ring"></div>
            </div>

            {/* Estructura del teléfono */}
            <div className="phone-frame-container">
              
              {/* Botones Laterales */}
              <div className="phone-side-button button-left-vol-up"></div>
              <div className="phone-side-button button-left-vol-down"></div>
              <div className="phone-side-button button-right-power"></div>

              {/* Marco de Teléfono */}
              <div className="phone-outer-frame">
                
                {/* Dynamic Island / Muesca superior */}
                <div className="phone-screen-notch">
                  <div className="notch-camera"></div>
                  <div className="notch-sensor"></div>
                </div>

                {/* Fondo Personalizado del Teléfono */}
                <div className="phone-back-plate">
                  {/* Capa de fondo ambiental difuminado para fotos panorámicas o recortadas */}
                  {imageUrl && (
                    <div 
                      className="phone-back-plate-blur"
                      style={{ 
                        backgroundImage: `url(${imageUrl})`,
                        transform: `scale(1.15) rotate(${rotation}deg)`
                      }}
                    />
                  )}
                  {/* Capa principal de la imagen con ajuste, rotación y transformaciones */}
                  {imageUrl && (
                    <div 
                      className={`phone-back-plate-image fit-${fitMode}`}
                      style={{ 
                        backgroundImage: `url(${imageUrl})`,
                        transform: `scale(${zoom / 100}) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`
                      }}
                    />
                  )}
                  {/* Patrón de carbono de respaldo */}
                  {!imageUrl && <div className="phone-carbon-pattern"></div>}
                </div>

                {/* Módulo de Cámara Híbrido Premium */}
                <div className="phone-camera-bump">
                  <div className="camera-lens lens-1">
                    <div className="lens-glass"></div>
                  </div>
                  <div className="camera-lens lens-2">
                    <div className="lens-glass"></div>
                  </div>
                  <div className="camera-lens lens-3">
                    <div className="lens-glass"></div>
                  </div>
                  <div className="camera-sensor flash"></div>
                  <div className="camera-sensor lidar"></div>
                </div>

                {/* Carcasa Transparente MagSafe Protectora (Capa Superior) */}
                <div className="phone-case-cover">
                  {/* Anillo de Alineación MagSafe Premium */}
                  <div className="case-magsafe-ring">
                    <div className="magsafe-magnet-circle"></div>
                    <div className="magsafe-alignment-bar"></div>
                  </div>

                  {/* Reflejos de cristal */}
                  <div className="case-glare-overlay"></div>
                  
                  {/* Borde doble / Bisel de silicona de la carcasa */}
                  <div className="case-bumper-bezel"></div>
                </div>

              </div>
            </div>
            
            <div className="preview-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <span>Vista previa: {selectedModel} en Carcasa Transparente MagSafe</span>
              {allModels.find(m => m.key === selectedModel)?.image && (
                <span style={{ fontSize: '11px', color: '#00f2fe', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                  <img src={allModels.find(m => m.key === selectedModel).image} alt={selectedModel} style={{ width: '18px', height: '18px', objectFit: 'contain', borderRadius: '2px' }} />
                  Foto oficial del dispositivo
                </span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CaseCustomizer;
