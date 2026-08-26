import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

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

const ArtStudioGame = ({ currentLang, user }) => {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  // Detección de Rol Administrador
  const isAdmin = user?.isStaff || window.isStaff || (user?.username === 'admin');

  const [models, setModels] = useState([]);
  const [selectedModel, setSelectedModel] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [customProduct, setCustomProduct] = useState(null);
  const [adding, setAdding] = useState(false);
  const [success, setSuccess] = useState(false);

  // Estados de Ajuste Fino y Enfoque de Imagen (Galería de Arte)
  const [fitMode, setFitMode] = useState('contain'); // 'contain' u 'cover'
  const [zoom, setZoom] = useState(100);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [rotation, setRotation] = useState(0);

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

  // Estados del Gestor de Galería de Arte para Administrador
  const [customArtworks, setCustomArtworks] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_custom_artworks') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [artworkOutOfStockMap, setArtworkOutOfStockMap] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_artwork_out_of_stock') || '{}');
    } catch (e) {
      return {};
    }
  });

  const [showAddArtForm, setShowAddArtForm] = useState(false);
  const [newArtForm, setNewArtForm] = useState({ name: '', author: '', image: '' });
  const newArtFileInputRef = React.useRef(null);

  // Catálogo completo de obras (Obras invaluables integradas + Creadas por Admin)
  const allArtworks = [
    ...ARTWORKS.map(a => ({
      id: a.id,
      name: a.name,
      author: a.author,
      url: `/static/assets/art/${a.filename}`,
      isBuiltIn: true
    })),
    ...customArtworks.map(ca => ({
      id: ca.id,
      name: ca.name,
      author: ca.author,
      url: ca.url,
      isUserAdded: true
    }))
  ];

  // Obras visibles según rol y disponibilidad de stock
  const displayedArtworks = allArtworks.filter(a => {
    if (!isAdmin) {
      return !artworkOutOfStockMap[a.id];
    }
    return true;
  });

  // Asegurar que activeIdx no quede fuera de rango
  useEffect(() => {
    if (activeIdx >= displayedArtworks.length && displayedArtworks.length > 0) {
      setActiveIdx(0);
    }
  }, [displayedArtworks.length, activeIdx]);

  // Handlers para administración de obras
  const toggleArtworkStockStatus = (artworkId) => {
    setArtworkOutOfStockMap(prev => {
      const updated = { ...prev, [artworkId]: !prev[artworkId] };
      localStorage.setItem('techmatch_artwork_out_of_stock', JSON.stringify(updated));
      return updated;
    });
  };

  const handleSaveNewArtwork = (e) => {
    e.preventDefault();
    if (!newArtForm.name.trim() || !newArtForm.image.trim()) return;

    const newArtItem = {
      id: `art_${Date.now()}`,
      name: newArtForm.name.trim(),
      author: newArtForm.author.trim() || 'Artista Exclusivo',
      url: newArtForm.image.trim(),
      isUserAdded: true
    };

    const updatedCustom = [newArtItem, ...customArtworks];
    setCustomArtworks(updatedCustom);
    localStorage.setItem('techmatch_custom_artworks', JSON.stringify(updatedCustom));

    setNewArtForm({ name: '', author: '', image: '' });
    setShowAddArtForm(false);
    setActiveIdx(0);
  };

  const handleDeleteArtwork = (artworkId) => {
    const updatedCustom = customArtworks.filter(a => a.id !== artworkId);
    setCustomArtworks(updatedCustom);
    localStorage.setItem('techmatch_custom_artworks', JSON.stringify(updatedCustom));
  };

  const handleNewArtFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        setNewArtForm(prev => ({ ...prev, image: evt.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Cargar datos dinámicos de la API de Django
  useEffect(() => {
    fetch('/api/products/')
      .then(res => res.json())
      .then(data => {
        const prod = data.find(p => p.name.includes("Personalizada"));
        if (prod) setCustomProduct(prod);
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
      .catch(err => console.error("Error al cargar modelos de dispositivos:", err));
  }, []);

  const selectRandomArtwork = () => {
    if (isSpinning || displayedArtworks.length === 0) return;
    setIsSpinning(true);
    setSuccess(false);

    let speed = 80;
    let count = 0;
    const maxSteps = 22;

    const interval = setInterval(() => {
      setActiveIdx(prev => (prev + 1) % displayedArtworks.length);
      count++;

      if (count >= maxSteps) {
        clearInterval(interval);
        const finalIdx = Math.floor(Math.random() * displayedArtworks.length);
        setActiveIdx(finalIdx);
        setIsSpinning(false);
      }
    }, speed);
  };

  const handleAddToCart = () => {
    const artwork = displayedArtworks[activeIdx] || displayedArtworks[0];
    if (!artwork) return;

    const imageUrl = artwork.url;

    setAdding(true);

    const cartItemId = `art-case-${selectedModel.replace(/\s+/g, '-').toLowerCase()}-${artwork.id}-${Date.now()}`;

    const cartItem = {
      id: cartItemId,
      databaseId: customProduct ? customProduct.id : 1,
      name: `Funda de Arte (${artwork.name} - ${selectedModel})`,
      price: customProduct ? customProduct.price : 19.99,
      image: imageUrl,
      quantity: 1,
      custom_image: imageUrl,
      custom_model: selectedModel
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(cartItem);
    localStorage.setItem('cart', JSON.stringify(cart));

    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));

    setTimeout(() => {
      setAdding(false);
      setSuccess(true);
    }, 800);
  };

  const getVisibleArtworks = () => {
    const total = displayedArtworks.length;
    if (total === 0) return { prevIdx: 0, activeIdx: 0, nextIdx: 0 };
    const prevIdx = (activeIdx - 1 + total) % total;
    const nextIdx = (activeIdx + 1) % total;
    return { prevIdx, activeIdx, nextIdx };
  };

  const { prevIdx, nextIdx } = getVisibleArtworks();

  const currentArtwork = displayedArtworks[activeIdx] || displayedArtworks[0];

  return (
    <div id="art-studio-game-section" className="creative-studio-wrapper" style={{ padding: '0 20px 80px 20px' }}>
      
      {/* PANEL IZQUIERDO: JUEGO INTERACTIVO DE RULETA */}
      <div className="glass-panel" style={{ padding: '40px 30px', borderRadius: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {/* TÍTULO SUPERIOR: Minijuego Creativo en 2 líneas, tamaño más pequeño (~42px), manteniendo tipografía Neaments y textura azul */}
        <h1 
          className="customizer-title-main" 
          style={{ 
            textAlign: 'center', 
            fontSize: 'clamp(32px, 4.5vw, 44px)', 
            lineHeight: '1.15', 
            margin: '0 0 10px 0',
            fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive"
          }}
        >
          Minijuego
          <br />
          Creativo
        </h1>

        {/* SUBTÍTULO: Ruleta del Arte Cósmico en tamaño más grande (SVG maxWidth 780px / 70px) */}
        <div style={{ margin: '0 0 16px 0', display: 'flex', justifyContent: 'center', width: '100%' }}>
          <svg 
            viewBox="0 0 750 95" 
            style={{ 
              width: '100%', 
              maxWidth: '780px', 
              height: 'auto', 
              overflow: 'visible',
              display: 'block',
              margin: '0 auto',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.8))'
            }}
          >
            <defs>
              <pattern id="oilPaintPatternRuleta" patternUnits="userSpaceOnUse" width="750" height="95">
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
              fill="url(#oilPaintPatternRuleta)" 
              stroke="#ffffff" 
              strokeWidth="1.5" 
              paintOrder="stroke fill"
              strokeLinejoin="round"
              style={{
                fontFamily: "'Neaments', 'Kaushan Script', 'Satisfy', 'Great Vibes', 'Alex Brush', cursive",
                fontSize: '70px',
                fontWeight: '800',
                letterSpacing: '1.5px'
              }}
            >
              Ruleta del Arte Cósmico
            </text>
          </svg>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: '0 0 20px 0', textAlign: 'center', maxWidth: '500px' }}>
          Gira la ruleta y selecciona una de las obras de arte más famosas e invaluables del mundo para personalizar tu funda en un clic.
        </p>

        {/* BARRA DE HERRAMIENTAS Y CONTROL EXCLUSIVA PARA ADMINISTRADOR EN LA GALERÍA DE ARTE */}
        {isAdmin && (
          <div style={{ 
            width: '100%', 
            background: 'rgba(11, 15, 25, 0.85)', 
            border: '1px solid rgba(0, 242, 254, 0.3)', 
            borderRadius: '16px', 
            padding: '16px', 
            marginBottom: '25px',
            boxShadow: '0 4px 25px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ 
                  fontSize: '11px', 
                  fontWeight: '700', 
                  padding: '3px 8px', 
                  borderRadius: '12px', 
                  background: 'rgba(0, 242, 254, 0.15)', 
                  color: '#00f2fe', 
                  border: '1px solid rgba(0, 242, 254, 0.4)' 
                }}>
                  👑 Panel Admin - Galería de Arte
                </span>
                <span style={{ fontSize: '12px', color: '#aaa' }}>Total: {allArtworks.length} Obras</span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddArtForm(!showAddArtForm)}
                style={{
                  padding: '7px 14px',
                  fontSize: '12px',
                  fontWeight: '700',
                  borderRadius: '8px',
                  border: 'none',
                  background: showAddArtForm ? 'rgba(239, 68, 68, 0.85)' : 'linear-gradient(135deg, #00f2fe, #ff007f)',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px'
                }}
              >
                {showAddArtForm ? '✖ Cancelar' : '➕ Añadir Nueva Obra de Arte'}
              </button>
            </div>

            {/* FORMULARIO EXPANDIBLE HACIA ABAJO PARA AÑADIR NUEVA PINTURA/OBRA DE ARTE */}
            {showAddArtForm && (
              <form 
                onSubmit={handleSaveNewArtwork}
                style={{ 
                  marginTop: '12px', 
                  paddingTop: '12px', 
                  borderTop: '1px solid rgba(255,255,255,0.12)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}
              >
                <h5 style={{ margin: 0, fontSize: '13px', color: '#00f2fe', fontWeight: '700' }}>
                  🎨 Incluir Nueva Obra en la Galería de Arte
                </h5>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  <input 
                    type="text"
                    placeholder="Título de la obra (ej. El Jardín de las Delicias)"
                    value={newArtForm.name}
                    onChange={e => setNewArtForm({ ...newArtForm, name: e.target.value })}
                    required
                    style={{
                      flex: '1 1 200px',
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
                    type="text"
                    placeholder="Autor (ej. El Bosco)"
                    value={newArtForm.author}
                    onChange={e => setNewArtForm({ ...newArtForm, author: e.target.value })}
                    style={{
                      width: '160px',
                      padding: '8px 12px',
                      fontSize: '12px',
                      borderRadius: '6px',
                      background: 'rgba(0,0,0,0.5)',
                      border: '1px solid rgba(0, 242, 254, 0.3)',
                      color: '#fff',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <input 
                    type="text"
                    placeholder="Pega la URL de la imagen de la obra (o sube archivo local)"
                    value={newArtForm.image}
                    onChange={e => setNewArtForm({ ...newArtForm, image: e.target.value })}
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
                    ref={newArtFileInputRef}
                    accept="image/*"
                    onChange={handleNewArtFileUpload}
                    style={{ display: 'none' }}
                  />
                  <button
                    type="button"
                    onClick={() => newArtFileInputRef.current?.click()}
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
                    📁 Foto de la Obra
                  </button>
                </div>

                {newArtForm.image && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '11px', color: '#aaa' }}>Vista previa obra:</span>
                    <img src={newArtForm.image} alt="Preview" style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '6px', border: '1.5px solid #00f2fe' }} />
                  </div>
                )}

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
                    cursor: 'pointer',
                    alignSelf: 'flex-start'
                  }}
                >
                  ✓ Guardar Obra e Incluir en la Galería
                </button>
              </form>
            )}
          </div>
        )}

        {/* CONTENEDOR DEL CARRUSEL DE CARTAS */}
        <div className="art-cards-container" style={{ width: '100%' }}>
          {displayedArtworks.map((art, idx) => {
            let cardClass = 'art-card-item inactive';
            if (idx === activeIdx) {
              cardClass = 'art-card-item active';
            } else if (idx === prevIdx || idx === nextIdx) {
              cardClass = 'art-card-item';
            } else {
              return null;
            }

            if (isSpinning) {
              cardClass += ' spinning';
            }

            const isOutOfStock = !!artworkOutOfStockMap[art.id];

            return (
              <div
                key={art.id}
                className={cardClass}
                style={{
                  backgroundImage: `url(${art.url})`,
                  transition: isSpinning ? 'none' : 'all 0.5s ease',
                  filter: isOutOfStock ? 'grayscale(90%) opacity(0.4)' : 'none',
                  position: 'relative'
                }}
              >
                <div className="art-card-content">
                  <h3 className="art-card-title">{art.name}</h3>
                  <p className="art-card-author">{art.author}</p>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTÓN GIRAR AL AZAR */}
        <button
          className="btn-primary"
          style={{
            background: 'var(--gradient-accent)',
            border: 'none',
            boxShadow: 'var(--gradient-glow)',
            marginTop: '20px',
            marginBottom: '20px',
            padding: '12px 28px',
            fontSize: '15px'
          }}
          onClick={selectRandomArtwork}
          disabled={isSpinning || displayedArtworks.length === 0}
        >
          <span>🎲 {isSpinning ? 'Girando la Colección...' : 'Elegir Arte al Azar'}</span>
        </button>

        {/* PANEL DE AJUSTE FINO & ENFOQUE DE IMAGEN (DEBAJO DE RULETA AL AZAR Y ARRIBA DE GALERÍA DIRECTA) */}
        {currentArtwork && (
          <div className="image-adjust-panel" style={{ width: '100%', maxWidth: '600px', marginBottom: '25px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h5 style={{ margin: 0, fontSize: '12.5px', color: '#00f2fe', fontWeight: '700' }}>
                🎨 Ajuste Fino & Enfoque de Imagen
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
                ↺ Restablecer Ajustes
              </button>
            </div>

            {/* Modo de Encuadre */}
            <div style={{ marginBottom: '10px' }}>
              <label className="adjust-slider-label" style={{ marginBottom: '4px' }}>
                <span>Encuadre:</span>
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
                  🔲 Completa (Auto-Fit + Fondo)
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
                  🖼️ Rellenar Carcasa
                </button>
              </div>
            </div>

            {/* Botones de Rotación / Girar 90° */}
            <div style={{ marginBottom: '10px' }}>
              <div className="adjust-slider-label" style={{ marginBottom: '4px' }}>
                <span>🔄 Orientación / Girar:</span>
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
                  ↺ 90° Izq.
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
                  ↻ 90° Der.
                </button>
              </div>
            </div>

            {/* Slider Zoom */}
            <div className="adjust-slider-group" style={{ marginBottom: '8px' }}>
              <div className="adjust-slider-label">
                <span>🔍 Zoom:</span>
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
                <span>↔️ Posición Horizontal:</span>
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
            <div className="adjust-slider-group" style={{ marginBottom: '0px' }}>
              <div className="adjust-slider-label">
                <span>↕️ Posición Vertical:</span>
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

        {/* GALERÍA DE SELECCIÓN MANUAL DE ARTE */}
        <div className="art-gallery-container">
          <div className="art-gallery-title-wrapper">
            <span className="accent-tag" style={{ fontSize: '10px' }}>Selección Directa</span>
            <h4 style={{ color: '#fff', fontSize: '15px', margin: '5px 0 0 0' }}>Elige tu Obra de Arte Favorita</h4>
          </div>
          <div className="art-gallery-grid">
            {displayedArtworks.map((art, idx) => {
              const isOutOfStock = !!artworkOutOfStockMap[art.id];

              return (
                <div
                  key={art.id}
                  className={`art-gallery-thumb-card ${idx === activeIdx ? 'active' : ''}`}
                  style={{
                    backgroundImage: `url(${art.url})`,
                    position: 'relative',
                    filter: isOutOfStock ? 'grayscale(90%) opacity(0.4)' : 'none'
                  }}
                  onClick={() => {
                    if (!isSpinning) {
                      setActiveIdx(idx);
                      setSuccess(false);
                    }
                  }}
                >
                  <div className="art-gallery-thumb-info">
                    <p className="art-gallery-thumb-title">{art.name}</p>
                  </div>

                  {/* CONTROLES DE ADMIN EN MINIATURA */}
                  {isAdmin && (
                    <div style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      display: 'flex',
                      gap: '3px',
                      zIndex: 10
                    }}>
                      {/* Toggle Stock */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleArtworkStockStatus(art.id);
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

                      {/* Borrar si fue agregada por el admin */}
                      {art.isUserAdded && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteArtwork(art.id);
                          }}
                          title="Eliminar obra"
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
      </div>

      {/* PANEL DERECHO: PREVISUALIZADOR 3D FLOTANTE INTERACTIVO */}
      <div 
        className="customizer-preview-panel phone-mockup-outer" 
        style={{ 
          width: '100%',
          position: 'sticky',
          top: '90px',
          zIndex: 20
        }}
      >
        <span className="accent-tag" style={{ marginBottom: '15px' }}>Vista Previa en Vivo</span>
        
        <div className="preview-studio" style={{ width: '100%' }}>
          
          {/* Base reflectante de neón */}
          <div className="mockup-studio-base">
            <div className="studio-neon-ring"></div>
          </div>

          {/* Estructura 3D del Teléfono Móvil */}
          <div className="phone-frame-container">
            
            {/* Botones Laterales Metálicos */}
            <div className="phone-side-button button-left-vol-up"></div>
            <div className="phone-side-button button-left-vol-down"></div>
            <div className="phone-side-button button-right-power"></div>

            {/* Marco del Teléfono */}
            <div className="phone-outer-frame">
              
              {/* Dynamic Island / Muesca superior */}
              <div className="phone-screen-notch">
                <div className="notch-camera"></div>
                <div className="notch-sensor"></div>
              </div>

              {/* Placa Trasera con Obra de Arte y Transformaciones */}
              <div className="phone-back-plate">
                {/* Capa de fondo ambiental difuminado para encuadre contain */}
                {currentArtwork && (
                  <div 
                    className="phone-back-plate-blur"
                    style={{ 
                      backgroundImage: `url(${currentArtwork.url})`,
                      transform: `scale(1.15) rotate(${rotation}deg)`
                    }}
                  />
                )}
                {/* Capa principal con ajuste, rotación, zoom y traslación */}
                {currentArtwork && (
                  <div 
                    className={`phone-back-plate-image fit-${fitMode}`}
                    style={{ 
                      backgroundImage: `url(${currentArtwork.url})`,
                      transform: `scale(${zoom / 100}) translate(${offsetX}px, ${offsetY}px) rotate(${rotation}deg)`
                    }}
                  />
                )}
                {!currentArtwork && <div className="phone-carbon-pattern"></div>}
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
                
                {/* Bisel de silicona de la carcasa */}
                <div className="case-bumper-bezel"></div>
              </div>

            </div>
          </div>
          
          <div className="preview-label" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', margin: '20px 0 15px 0' }}>
            <h3 style={{ color: '#fff', fontSize: '18px', margin: '0 0 5px 0' }}>
              {currentArtwork ? currentArtwork.name : 'Cargando Obra...'}
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
              Diseño por: {currentArtwork ? currentArtwork.author : ''}
            </p>
          </div>
        </div>

        <div style={{ width: '100%', textAlign: 'center' }}>
          {/* Selector de Dispositivo */}
          <div style={{ marginBottom: '20px', textAlign: 'left' }}>
            <label style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px', display: 'block', fontWeight: '600' }}>
              Modelo de Dispositivo:
            </label>
            <div className="search-bar-container glass-panel" style={{ margin: 0, height: '44px', padding: '0 15px', display: 'flex', alignItems: 'center' }}>
              <span style={{ fontSize: '14px', marginRight: '8px' }}>📱</span>
              <select
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
                {models.map(m => (
                  <option key={m.id} value={`${m.brand_name} ${m.name}`} style={{ background: '#111', color: '#fff' }}>
                    {m.brand_name} - {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Botón Comprar */}
          <button
            className="btn-primary"
            style={{
              width: '100%',
              justifyContent: 'center',
              padding: '12px 0',
              fontSize: '14px',
              border: success ? '1px solid #10b981' : 'none',
              background: success ? 'rgba(16, 185, 129, 0.1)' : 'var(--gradient-accent)',
              boxShadow: success ? 'none' : 'var(--gradient-glow)'
            }}
            onClick={handleAddToCart}
            disabled={adding || isSpinning}
          >
            <span>{adding ? 'Cargando Arte...' : success ? '✓ ¡Funda Añadida!' : '🎨 Cargar a Mi Funda y Comprar'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default ArtStudioGame;
