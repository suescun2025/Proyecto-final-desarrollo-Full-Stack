import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import HelloKittyHoverIcon from './HelloKittyHoverIcon';
import { translations } from '../translations';

const ALL_ACCESSORIES = [
  // --- 36 BOTONES PHONE GRIPS ---
  { id: 1, type: 'grips', name: 'Acuarela Pastel', category: 'arte', categoryLabel: '🎨 Arte', price: '$8.99', image: '/static/assets/icons/grips/new_grip_1.png' },
  { id: 2, type: 'grips', name: 'Graffiti Smiley Verde', category: 'kawaii', categoryLabel: '😊 Kawaii', price: '$8.99', image: '/static/assets/icons/grips/new_grip_2.png' },
  { id: 3, type: 'grips', name: 'Yin Yang Cósmico', category: 'universo', categoryLabel: '🌌 Místico', price: '$9.99', image: '/static/assets/icons/grips/new_grip_3.png' },
  { id: 4, type: 'grips', name: 'Calavera Corazones', category: 'kawaii', categoryLabel: '🎀 Coquette', price: '$9.99', image: '/static/assets/icons/grips/new_grip_4.png' },
  { id: 5, type: 'grips', name: 'Ojo Oculto Místico 3D', category: 'universo', categoryLabel: '👁️ Místico', price: '$10.99', image: '/static/assets/icons/grips/new_grip_5.png' },
  { id: 6, type: 'grips', name: 'Labios Rojos Pop Art', category: 'arte', categoryLabel: '💋 Pop Art', price: '$8.99', image: '/static/assets/icons/grips/new_grip_6.png' },
  { id: 7, type: 'grips', name: 'Flores de Amapola', category: 'paisajes', categoryLabel: '🌸 Floral', price: '$8.99', image: '/static/assets/icons/grips/new_grip_7.png' },
  { id: 8, type: 'grips', name: 'Destellos Rosa Bokeh', category: 'kawaii', categoryLabel: '✨ Glitter', price: '$9.99', image: '/static/assets/icons/grips/new_grip_8.png' },
  { id: 9, type: 'grips', name: 'Balazo Metálico 3D', category: 'arte', categoryLabel: '⛓️ Metal', price: '$10.99', image: '/static/assets/icons/grips/new_grip_9.png' },
  { id: 10, type: 'grips', name: 'Palmeras Atardecer', category: 'paisajes', categoryLabel: '🌅 Atardecer', price: '$9.99', image: '/static/assets/icons/grips/new_grip_10.png' },
  { id: 11, type: 'grips', name: 'Mosaico Confeti', category: 'arte', categoryLabel: '🎨 Mosaico', price: '$8.99', image: '/static/assets/icons/grips/new_grip_11.png' },
  { id: 12, type: 'grips', name: 'Donuts Pattern', category: 'kawaii', categoryLabel: '🍩 Sweet', price: '$9.99', image: '/static/assets/icons/grips/new_grip_12.png' },
  { id: 13, type: 'grips', name: 'Lente de Cámara 3D', category: 'arte', categoryLabel: '📷 Foto 3D', price: '$11.99', image: '/static/assets/icons/grips/new_grip_13.png' },
  { id: 14, type: 'grips', name: 'Calavera Gótica', category: 'arte', categoryLabel: '💀 Gótico', price: '$9.99', image: '/static/assets/icons/grips/new_grip_14.png' },
  { id: 15, type: 'grips', name: 'Luna Llena Realista', category: 'universo', categoryLabel: '🌕 Luna HD', price: '$10.99', image: '/static/assets/icons/grips/new_grip_15.png' },
  { id: 16, type: 'grips', name: 'Mármol Blanco Carrara', category: 'elegante', categoryLabel: '💎 Mármol', price: '$10.99', image: '/static/assets/icons/grips/new_grip_16.png' },
  { id: 17, type: 'grips', name: 'Mármol Negro & Oro', category: 'elegante', categoryLabel: '💎 Elegante', price: '$11.99', image: '/static/assets/icons/grips/new_grip_17.png' },
  { id: 18, type: 'grips', name: 'Unicornio Arcoíris', category: 'kawaii', categoryLabel: '🦄 Kawaii', price: '$9.99', image: '/static/assets/icons/grips/new_grip_18.png' },
  { id: 19, type: 'grips', name: 'Galaxia Acuarela', category: 'universo', categoryLabel: '🌌 Galaxia', price: '$9.99', image: '/static/assets/icons/grips/new_grip_19.png' },
  { id: 20, type: 'grips', name: 'Vórtice Cian 3D', category: 'universo', categoryLabel: '🌀 Vórtice', price: '$10.99', image: '/static/assets/icons/grips/new_grip_20.png' },
  { id: 21, type: 'grips', name: 'Mandala Turquesa', category: 'elegante', categoryLabel: '🔮 Mandala', price: '$9.99', image: '/static/assets/icons/grips/new_grip_21.png' },
  { id: 22, type: 'grips', name: 'Mandala Atardecer', category: 'elegante', categoryLabel: '🌅 Mandala', price: '$9.99', image: '/static/assets/icons/grips/new_grip_22.png' },
  { id: 23, type: 'grips', name: 'Mandala Bosquejo', category: 'elegante', categoryLabel: '✒️ Sketch', price: '$8.99', image: '/static/assets/icons/grips/new_grip_23.png' },
  { id: 24, type: 'grips', name: 'Mandala Menta Pastel', category: 'elegante', categoryLabel: '🌱 Pastel', price: '$8.99', image: '/static/assets/icons/grips/new_grip_24.png' },
  { id: 25, type: 'grips', name: 'Nebulosa Espacial', category: 'universo', categoryLabel: '🌌 Nebulosa', price: '$10.99', image: '/static/assets/icons/grips/new_grip_25.png' },
  { id: 26, type: 'grips', name: 'Altavoz Subwoofer 3D', category: 'arte', categoryLabel: '🔊 Audio 3D', price: '$11.99', image: '/static/assets/icons/grips/new_grip_26.png' },
  { id: 27, type: 'grips', name: 'Huella Arcoíris Art', category: 'arte', categoryLabel: '🌈 Arte', price: '$8.99', image: '/static/assets/icons/grips/new_grip_27.png' },
  { id: 28, type: 'grips', name: 'Geometría Neón Retro', category: 'universo', categoryLabel: '📐 Neón', price: '$9.99', image: '/static/assets/icons/grips/new_grip_28.png' },
  { id: 29, type: 'grips', name: 'Ancla Marina Cian', category: 'marino', categoryLabel: '⚓ Marino', price: '$9.99', image: '/static/assets/icons/grips/new_grip_29.png' },
  { id: 30, type: 'grips', name: 'Olas del Océano Azul', category: 'marino', categoryLabel: '🌊 Océano', price: '$9.99', image: '/static/assets/icons/grips/new_grip_30.png' },
  { id: 31, type: 'grips', name: 'Diamante Azul Facetado', category: 'elegante', categoryLabel: '💎 Diamante', price: '$11.99', image: '/static/assets/icons/grips/new_grip_31.png' },
  { id: 32, type: 'grips', name: 'Gato Psicodélico Neón', category: 'kawaii', categoryLabel: '🐱 Neón Cat', price: '$10.99', image: '/static/assets/icons/grips/new_grip_32.png' },
  { id: 33, type: 'grips', name: 'Labios Piercing Pop', category: 'arte', categoryLabel: '💋 Pop Art', price: '$9.99', image: '/static/assets/icons/grips/new_grip_33.png' },
  { id: 34, type: 'grips', name: 'Rosa Negra Gótica', category: 'arte', categoryLabel: '🌹 Gótico', price: '$9.99', image: '/static/assets/icons/grips/new_grip_34.png' },
  { id: 35, type: 'grips', name: 'Geometría Sagrada Mandala', category: 'elegante', categoryLabel: '📐 Sagrado', price: '$10.99', image: '/static/assets/icons/grips/new_grip_35.png' },
  { id: 36, type: 'grips', name: 'Espiral Galáctica Violeta', category: 'universo', categoryLabel: '🌀 Galaxia', price: '$10.99', image: '/static/assets/icons/grips/new_grip_36.png' },

  // --- 20 COLGANTES / ROSARIOS REALES ---
  { id: 37, type: 'lanyards', name: 'Colgante Marino Pastel', category: 'marino', categoryLabel: '🌊 Marino', price: '$9.99', image: '/static/assets/icons/grips/user_real_1.png' },
  { id: 38, type: 'lanyards', name: 'Rosario Caritas Sonrientes', category: 'kawaii', categoryLabel: '😊 Kawaii', price: '$8.99', image: '/static/assets/icons/grips/user_real_2.png' },
  { id: 39, type: 'lanyards', name: 'Llavero Anime Luguang', category: 'arte', categoryLabel: '🎭 Anime', price: '$11.99', image: '/static/assets/icons/grips/user_real_3.png' },
  { id: 40, type: 'lanyards', name: 'Rosario Rockero Fresita', category: 'arte', categoryLabel: '🎸 Rocker', price: '$10.99', image: '/static/assets/icons/grips/user_real_4.png' },
  { id: 41, type: 'lanyards', name: 'Set Colgantes Frutas de Cristal', category: 'kawaii', categoryLabel: '🍒 Frutal', price: '$12.99', image: '/static/assets/icons/grips/user_real_5.png' },
  { id: 42, type: 'lanyards', name: 'Colgante Mariposas de Plata', category: 'elegante', categoryLabel: '🦋 Plata & Cristal', price: '$13.99', image: '/static/assets/icons/grips/user_real_6.png' },
  { id: 43, type: 'lanyards', name: 'Set Cordones Rosados & Lazos', category: 'kawaii', categoryLabel: '🎀 Coquette', price: '$14.99', image: '/static/assets/icons/grips/user_real_7.png' },
  { id: 44, type: 'lanyards', name: 'Set Colgantes Gatitos de Peluche', category: 'kawaii', categoryLabel: '🐱 Gatitos', price: '$13.99', image: '/static/assets/icons/grips/user_real_8.png' },
  { id: 45, type: 'lanyards', name: 'Colgante Botellita Blueberry', category: 'universo', categoryLabel: '⭐ Blueberry', price: '$9.99', image: '/static/assets/icons/grips/user_real_9.png' },
  { id: 46, type: 'lanyards', name: 'Colgante Ámbar de Lujo', category: 'elegante', categoryLabel: '💎 Lujo Ámbar', price: '$14.99', image: '/static/assets/icons/grips/user_real_10.png' },
  { id: 47, type: 'lanyards', name: 'Colgante Strap Perlas & Mariposa', category: 'elegante', categoryLabel: '🦋 Perlas', price: '$12.99', image: '/static/assets/icons/grips/strap_phone_1.png' },
  { id: 48, type: 'lanyards', name: 'Rosario Coquette Corazones', category: 'kawaii', categoryLabel: '🎀 Coquette', price: '$9.99', image: '/static/assets/icons/grips/strap_phone_2.png' },
  { id: 49, type: 'lanyards', name: 'Set Llavero Estelar Cristal', category: 'universo', categoryLabel: '⭐ Estelar', price: '$11.99', image: '/static/assets/icons/grips/strap_phone_3.png' },
  { id: 50, type: 'lanyards', name: 'Colgante Gothic Heart Silver', category: 'arte', categoryLabel: '🖤 Gótico', price: '$10.99', image: '/static/assets/icons/grips/strap_phone_4.png' },
  { id: 51, type: 'lanyards', name: 'Cordón de Mano Flores Sweet', category: 'kawaii', categoryLabel: '🌸 Sweet', price: '$8.99', image: '/static/assets/icons/grips/strap_phone_5.png' },
  { id: 52, type: 'lanyards', name: 'Set Rosario Perlas Plata Premium', category: 'elegante', categoryLabel: '💎 Plata Premium', price: '$15.99', image: '/static/assets/icons/grips/strap_phone_6.png' },
  { id: 53, type: 'lanyards', name: 'Cordón Ajustable Lazos Rosas', category: 'kawaii', categoryLabel: '🎀 Coquette', price: '$12.99', image: '/static/assets/icons/grips/strap_phone_7.png' },
  { id: 54, type: 'lanyards', name: 'Colgante Peluche Kawaii Cat', category: 'kawaii', categoryLabel: '🐱 Kawaii', price: '$13.99', image: '/static/assets/icons/grips/strap_phone_8.png' },
  { id: 55, type: 'lanyards', name: 'Set Charm Cristal Azul Océano', category: 'marino', categoryLabel: '🌊 Océano', price: '$10.99', image: '/static/assets/icons/grips/strap_phone_9.png' },
  { id: 56, type: 'lanyards', name: 'Rosario Ámbar & Cuarzo Gold', category: 'elegante', categoryLabel: '💎 Cuarzo Gold', price: '$14.99', image: '/static/assets/icons/grips/strap_phone_10.png' },
  { id: 57, type: 'lanyards', name: 'Colgante Pop Mart The Monsters Pink', category: 'kawaii', categoryLabel: '🎀 Coquette', price: '$12.99', image: '/static/assets/icons/grips/user_real_11.png' },
  { id: 58, type: 'lanyards', name: 'Llavero Charm Duo Personajes Retro', category: 'arte', categoryLabel: '🎭 Anime', price: '$9.99', image: '/static/assets/icons/grips/user_real_12.png' },
  { id: 59, type: 'lanyards', name: 'Set Strap Caritas de Gato Acrílico', category: 'kawaii', categoryLabel: '🐱 Gatitos', price: '$11.99', image: '/static/assets/icons/grips/user_real_13.png' },
  { id: 60, type: 'lanyards', name: 'Charm Strap Pikachu & Cadenas Rosas', category: 'kawaii', categoryLabel: '⚡ Anime', price: '$10.99', image: '/static/assets/icons/grips/user_real_14.png' }
];

function AccessoriesPage({ navigateTo, currentLang, user }) {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  const isAdmin = user?.isStaff || window.isStaff || (user?.username === 'admin');

  // Accesorios guardados y eliminados por el administrador
  const [customAccessories, setCustomAccessories] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_custom_accessories') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [deletedIds, setDeletedIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('techmatch_deleted_accessories') || '[]');
    } catch (e) {
      return [];
    }
  });

  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'grips' | 'lanyards'
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [addedItem, setAddedItem] = useState(null);
  const [selectedLanyardModal, setSelectedLanyardModal] = useState(null);

  // Modal para agregar nuevos accesorios (Admin)
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState('grips');
  const [newAccCategory, setNewAccCategory] = useState('kawaii');
  const [newAccPrice, setNewAccPrice] = useState('9.99');
  const [newAccImage, setNewAccImage] = useState('');

  // Accesorios activos (incorporando creados por admin y excluyendo eliminados)
  const activeAccessories = [...customAccessories, ...ALL_ACCESSORIES].filter(item => !deletedIds.includes(item.id));

  const totalCount = activeAccessories.length;
  const gripsCount = activeAccessories.filter(item => item.type === 'grips').length;
  const lanyardsCount = activeAccessories.filter(item => item.type === 'lanyards').length;

  const mainTabs = [
    { id: 'all', label: `✨ Todos (${totalCount} Accesorios)` },
    { id: 'grips', label: `📱 Botones Phone Grips (${gripsCount})` },
    { id: 'lanyards', label: `📿 Colgantes & Rosarios (${lanyardsCount})` }
  ];

  const categories = [
    { id: 'all', label: t('allThemes') },
    { id: 'kawaii', label: t('themeKawaii') },
    { id: 'elegante', label: t('themeElegante') },
    { id: 'arte', label: t('themeArte') },
    { id: 'universo', label: t('themeUniverso') },
    { id: 'paisajes', label: t('themePaisajes') },
    { id: 'marino', label: t('themeMarino') },
  ];

  const filteredAccessories = activeAccessories.filter(item => {
    const matchesTab = activeTab === 'all' || item.type === activeTab;
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesCategory && matchesSearch;
  });

  const handleDeleteAccessory = (id, name) => {
    if (window.confirm(`¿Estás seguro de que deseas quitar "${name}" del catálogo?`)) {
      const updatedDeleted = [...deletedIds, id];
      setDeletedIds(updatedDeleted);
      localStorage.setItem('techmatch_deleted_accessories', JSON.stringify(updatedDeleted));
      setAddedItem(`"${name}" ha sido removido del catálogo`);
      setTimeout(() => setAddedItem(null), 2500);
    }
  };

  const handleResetCatalog = () => {
    if (window.confirm("¿Deseas restablecer el catálogo de accesorios al estado inicial por defecto?")) {
      setDeletedIds([]);
      setCustomAccessories([]);
      localStorage.removeItem('techmatch_deleted_accessories');
      localStorage.removeItem('techmatch_custom_accessories');
      setAddedItem("Catálogo de accesorios restablecido");
      setTimeout(() => setAddedItem(null), 2500);
    }
  };

  const handleAddAccessory = (e) => {
    e.preventDefault();
    if (!newAccName.trim()) {
      alert("Por favor ingresa un nombre para el accesorio.");
      return;
    }
    if (!newAccImage.trim()) {
      alert("Por favor ingresa una URL de imagen o selecciona un archivo.");
      return;
    }

    const newItem = {
      id: `custom-acc-${Date.now()}`,
      type: newAccType,
      name: newAccName.trim(),
      category: newAccCategory,
      categoryLabel: newAccCategory === 'kawaii' ? '🎀 Kawaii' : newAccCategory === 'elegante' ? '💎 Elegante' : newAccCategory === 'arte' ? '🎨 Arte' : '✨ Nuevo',
      price: newAccPrice.startsWith('$') ? newAccPrice.trim() : `$${newAccPrice.trim()}`,
      image: newAccImage.trim()
    };

    const updatedCustom = [newItem, ...customAccessories];
    setCustomAccessories(updatedCustom);
    localStorage.setItem('techmatch_custom_accessories', JSON.stringify(updatedCustom));
    setShowAddModal(false);

    setNewAccName('');
    setNewAccPrice('9.99');
    setNewAccImage('');

    setAddedItem(`✨ ¡"${newItem.name}" publicado con éxito!`);
    setTimeout(() => setAddedItem(null), 2500);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewAccImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const [customProduct, setCustomProduct] = useState(null);

  // Forzar scroll al inicio del todo (0,0) al cargar la página de accesorios
  useEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  useEffect(() => {
    fetch('/api/products/')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const prod = data.find(p => p.name && p.name.includes("Personalizada"));
          if (prod) setCustomProduct(prod);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleAddToCart = (item) => {
    // 1. Obtener carrito actual de localStorage
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // 2. Extraer precio numérico (ej. "$8.99" -> 8.99)
    const numericPrice = typeof item.price === 'string' 
      ? parseFloat(item.price.replace('$', '')) 
      : (item.price || 8.99);

    // 3. Buscar si ya existe en el carrito
    const existingIndex = savedCart.findIndex(cartItem => cartItem.id === item.id || cartItem.name === item.name);
    if (existingIndex > -1) {
      savedCart[existingIndex].quantity += 1;
    } else {
      savedCart.push({
        id: `acc-${item.id}-${Date.now()}`,
        databaseId: customProduct ? customProduct.id : 323,
        name: item.name,
        price: numericPrice,
        image: item.image,
        quantity: 1,
        custom_image: item.image,
        custom_model: item.name
      });
    }

    // 4. Guardar en localStorage
    localStorage.setItem('cart', JSON.stringify(savedCart));

    // 5. Notificar a la aplicación y abrir el CartDrawer
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: { open: true } }));
    window.dispatchEvent(new CustomEvent('cart-count-updated'));

    setCartCount(prev => prev + 1);
    setAddedItem(item.name);
    setTimeout(() => setAddedItem(null), 2500);
  };

  const [rainKey, setRainKey] = useState(0);

  const handleStarMouseEnter = () => {
    setRainKey(prev => prev + 1);
  };

  return (
    <div className="accessories-page-container animate-fade-in" style={{ padding: '40px 20px 100px 20px', maxWidth: '1280px', margin: '0 auto', textAlign: 'center', position: 'relative', minHeight: '80vh', overflowX: 'hidden' }}>
      
      {/* Contenedor de Lluvia de Estrellas Fugaces Re-activable 1-Shot al Pasar el Ratón */}
      <div className="shooting-stars-container" key={`shooting-rain-${rainKey}`}>
        {Array.from({ length: 30 }).map((_, i) => {
          const delay = `${(Math.random() * 0.75).toFixed(2)}s`;
          const duration = `${(1.1 + Math.random() * 0.6).toFixed(2)}s`;
          const top = `${(Math.random() * 70 - 15).toFixed(0)}%`;
          const left = `${(25 + Math.random() * 75).toFixed(0)}%`;
          const scale = (0.6 + Math.random() * 0.8).toFixed(2);
          const color = Math.random() > 0.4 ? 'rgba(0, 242, 254, 1)' : 'rgba(255, 105, 180, 1)';
          return (
            <div 
              key={`star-${rainKey}-${i}`} 
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

      {/* Resplandor de fondo estilo Universo */}
      <div className="universe-glow-effect"></div>
      
      {/* Icono Principal Centrado: Rosario / Colgante Hello Kitty Original */}
      <div 
        className="universe-star-wrapper" 
        style={{ 
          margin: '0 auto 15px auto', 
          display: 'flex', 
          justify: 'center', 
          alignItems: 'center', 
          cursor: 'pointer',
          width: '200px',
          height: '200px',
          position: 'relative',
          zIndex: 10
        }}
      >
        <div 
          className="star-glitch-container" 
          style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
        >
          <div className="star-glitch-link" style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <HelloKittyHoverIcon size="175px" className="star-universe-nav-btn-large" />
          </div>
        </div>
      </div>

      <h1 className="rainbow-script-title" style={{ textAlign: 'center', marginBottom: '8px', fontSize: '82px' }}>
        {t('accessoriesHeroTitle')}
      </h1>
      
      {/* PANEL DE CONTROL DE MERCANCÍA PARA ADMINISTRADOR */}
      {isAdmin && (
        <div style={{
          margin: '20px auto 30px auto',
          padding: '18px 26px',
          maxWidth: '850px',
          background: 'linear-gradient(135deg, rgba(0, 240, 255, 0.15), rgba(255, 105, 180, 0.15))',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '24px',
          boxShadow: '0 8px 32px rgba(0, 240, 255, 0.2)',
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', textAlign: 'left' }}>
            <span style={{ fontSize: '26px' }}>👑</span>
            <div>
              <h4 style={{ margin: 0, color: '#00f0ff', fontSize: '17px', fontWeight: '800' }}>
                {t('adminAccessoryPanelTitle') || "Gestión de Mercancía & Inventario (Panel Admin)"}
              </h4>
              <p style={{ margin: '4px 0 0 0', color: '#a0a5ca', fontSize: '13px' }}>
                Agrega nuevos Phone Grips o Colgantes y elimina mercancía de tu tienda en tiempo real.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowAddModal(true)}
              style={{
                padding: '10px 20px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #00f0ff, #7000ff)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.04)';
                e.currentTarget.style.filter = 'brightness(1.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.filter = 'brightness(1)';
              }}
            >
              {t('adminAddAccessoryBtn') || "➕ Agregar Nuevo Accesorio"}
            </button>

            <button
              onClick={handleResetCatalog}
              style={{
                padding: '10px 16px',
                borderRadius: '16px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#a0a5ca',
                fontWeight: '600',
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
              title="Restablecer accesorios predeterminados"
            >
              {t('adminResetAccessoriesBtn') || "🔄 Restablecer Catálogo"}
            </button>
          </div>
        </div>
      )}

      {/* Espacio en blanco preservado */}
      <div style={{ height: isAdmin ? '10px' : '50px', marginBottom: '30px' }}></div>

      {/* Alerta de item añadido al carrito */}
      {addedItem && (
        <div style={{
          position: 'fixed',
          top: '90px',
          right: '25px',
          zIndex: 9999,
          background: 'linear-gradient(135deg, rgba(255,105,180,0.95), rgba(0,240,255,0.95))',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: '30px',
          boxShadow: '0 10px 30px rgba(0,240,255,0.4)',
          fontWeight: '600',
          fontSize: '14px',
          animation: 'fadeIn 0.3s ease'
        }}>
          ✨ ¡{addedItem} añadido al carrito! ({cartCount})
        </div>
      )}

      {/* PESTAÑAS PRINCIPALES DE NAVEGACIÓN */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '12px',
        marginBottom: '25px',
        flexWrap: 'wrap'
      }}>
        {mainTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              setSelectedCategory('all');
            }}
            style={{
              padding: '12px 24px',
              borderRadius: '25px',
              border: activeTab === tab.id ? '2px solid #00f0ff' : '1px solid rgba(255, 255, 255, 0.15)',
              background: activeTab === tab.id ? 'linear-gradient(135deg, rgba(0, 240, 255, 0.3), rgba(255, 105, 180, 0.3))' : 'rgba(15, 21, 38, 0.6)',
              color: activeTab === tab.id ? '#ffffff' : '#a0a5ca',
              fontSize: '15px',
              fontWeight: '700',
              cursor: 'pointer',
              boxShadow: activeTab === tab.id ? '0 0 20px rgba(0, 240, 255, 0.4)' : 'none',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(10px)'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>



      {/* Grid Unificado de 46 Accesorios (36 Botones + 10 Colgantes) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))',
        gap: '18px',
        marginBottom: '60px'
      }}>
        {filteredAccessories.map(item => (
          <div
            key={item.id}
            className="glass-panel"
            style={{
              background: 'rgba(15, 21, 38, 0.65)',
              backdropFilter: 'blur(16px)',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              padding: '14px 12px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              position: 'relative',
              overflow: 'hidden',
              transition: 'transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease',
              boxShadow: '0 6px 24px 0 rgba(0, 0, 0, 0.25)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(0, 240, 255, 0.35)';
              e.currentTarget.style.borderColor = 'rgba(0, 240, 255, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0) scale(1)';
              e.currentTarget.style.boxShadow = '0 6px 24px 0 rgba(0, 0, 0, 0.25)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.12)';
            }}
          >
            {/* Type Indicator Tag */}
            <span style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              padding: '3px 8px',
              borderRadius: '10px',
              background: item.type === 'grips' ? 'rgba(0, 240, 255, 0.18)' : 'rgba(255, 105, 180, 0.18)',
              border: item.type === 'grips' ? '1px solid rgba(0, 240, 255, 0.35)' : '1px solid rgba(255, 182, 193, 0.35)',
              color: item.type === 'grips' ? '#00f0ff' : '#ffb6c1',
              fontSize: '10px',
              fontWeight: '700'
            }}>
              {item.type === 'grips' ? t('gripTag') : t('lanyardTag')}
            </span>

            {/* Price Badge */}
            <span style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              padding: '3px 8px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
              fontSize: '11px',
              fontWeight: '700'
            }}>
              {item.price}
            </span>

            {/* Product Image Container */}
            <div 
              onClick={() => {
                if (item.type === 'lanyards') {
                  setSelectedLanyardModal(item);
                }
              }}
              style={{
                margin: '24px 0 12px 0',
                width: '100%',
                height: '130px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '12px',
                overflow: 'hidden',
                background: 'rgba(255, 255, 255, 0.03)',
                padding: '6px',
                cursor: item.type === 'lanyards' ? 'pointer' : 'default'
              }}
            >
              <img
                src={item.image}
                alt={translations[activeLang]?.accessoryNames?.[item.name] || item.name}
                onClick={(e) => {
                  if (item.type === 'lanyards') {
                    e.stopPropagation();
                    setSelectedLanyardModal(item);
                  }
                }}
                onMouseEnter={(e) => {
                  if (item.type === 'lanyards') {
                    e.currentTarget.style.transform = 'scale(1.14)';
                    e.currentTarget.style.filter = 'drop-shadow(0 6px 16px rgba(0, 240, 255, 0.6))';
                  }
                }}
                onMouseLeave={(e) => {
                  if (item.type === 'lanyards') {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.filter = 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))';
                  }
                }}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.4))',
                  transition: 'transform 0.3s ease, filter 0.3s ease',
                  cursor: item.type === 'lanyards' ? 'pointer' : 'default'
                }}
                title={item.type === 'lanyards' ? (activeLang === 'es' ? 'Haz clic para ver la imagen en grande' : 'Click to view enlarged image') : ''}
              />
            </div>

            {/* Title */}
            <h3 style={{
              fontSize: '13px',
              fontWeight: '700',
              color: '#ffffff',
              marginBottom: '12px',
              textAlign: 'center',
              lineHeight: '1.3',
              height: '34px',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
              {translations[activeLang]?.accessoryNames?.[item.name] || item.name}
            </h3>

            {/* Add to cart button */}
            <button
              onClick={() => handleAddToCart(item)}
              style={{
                width: '100%',
                padding: '8px 12px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(255, 105, 180, 0.8), rgba(0, 240, 255, 0.8))',
                border: 'none',
                color: '#ffffff',
                fontWeight: '700',
                fontSize: '12px',
                cursor: 'pointer',
                boxShadow: '0 3px 10px rgba(255, 105, 180, 0.3)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.filter = 'brightness(1.15)'}
              onMouseLeave={(e) => e.target.style.filter = 'brightness(1)'}
            >
              🛒 {t('addToCart')}
            </button>

            {/* Delete button (Admin Only) */}
            {isAdmin && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteAccessory(item.id, item.name);
                }}
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '6px 10px',
                  borderRadius: '14px',
                  background: 'rgba(255, 75, 75, 0.25)',
                  border: '1px solid rgba(255, 75, 75, 0.5)',
                  color: '#ff6b6b',
                  fontWeight: '700',
                  fontSize: '11px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.45)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 75, 75, 0.25)'}
                title="Quitar esta mercancía del catálogo público"
              >
                🗑️ Quitar Mercancía
              </button>
            )}
          </div>
        ))}
      </div>

      {/* MODAL PARA AGREGAR NUEVO ACCESORIO (ADMIN) */}
      {showAddModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(8, 12, 24, 0.85)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px'
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div 
            style={{
              background: 'linear-gradient(135deg, rgba(20, 28, 48, 0.95), rgba(10, 14, 26, 0.98))',
              border: '1px solid rgba(0, 240, 255, 0.4)',
              boxShadow: '0 20px 50px rgba(0, 240, 255, 0.3)',
              borderRadius: '24px',
              padding: '30px',
              maxWidth: '500px',
              width: '100%',
              textAlign: 'left',
              position: 'relative',
              color: '#ffffff'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowAddModal(false)}
              style={{
                position: 'absolute',
                top: '18px',
                right: '18px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                color: '#fff',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: 'bold'
              }}
            >
              ✕
            </button>

            <h3 style={{ margin: '0 0 20px 0', fontSize: '20px', color: '#00f0ff', fontWeight: '800' }}>
              ✨ Publicar Nuevo Accesorio
            </h3>

            <form onSubmit={handleAddAccessory} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0a5ca', marginBottom: '6px', fontWeight: '700' }}>
                  Nombre del Accesorio:
                </label>
                <input
                  type="text"
                  value={newAccName}
                  onChange={(e) => setNewAccName(e.target.value)}
                  placeholder="ej. Botón Cyberpunk Glitch"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(0,240,255,0.3)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a0a5ca', marginBottom: '6px', fontWeight: '700' }}>
                    Tipo:
                  </label>
                  <select
                    value={newAccType}
                    onChange={(e) => setNewAccType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(15, 21, 38, 0.9)',
                      border: '1px solid rgba(0,240,255,0.3)',
                      color: '#fff',
                      fontSize: '13px',
                      outline: 'none'
                    }}
                  >
                    <option value="grips">📱 Phone Grip (Botón)</option>
                    <option value="lanyards">📿 Colgante / Rosario</option>
                  </select>
                </div>

                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '12px', color: '#a0a5ca', marginBottom: '6px', fontWeight: '700' }}>
                    Precio ($ USD):
                  </label>
                  <input
                    type="text"
                    value={newAccPrice}
                    onChange={(e) => setNewAccPrice(e.target.value)}
                    placeholder="9.99"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      borderRadius: '12px',
                      background: 'rgba(255,255,255,0.06)',
                      border: '1px solid rgba(0,240,255,0.3)',
                      color: '#fff',
                      fontSize: '14px',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0a5ca', marginBottom: '6px', fontWeight: '700' }}>
                  Temática / Categoría:
                </label>
                <select
                  value={newAccCategory}
                  onChange={(e) => setNewAccCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(15, 21, 38, 0.9)',
                    border: '1px solid rgba(0,240,255,0.3)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                >
                  <option value="kawaii">🎀 Kawaii / Coquette</option>
                  <option value="elegante">💎 Elegante / Mármol</option>
                  <option value="arte">🎨 Arte & Pop</option>
                  <option value="universo">🌌 Universo & Místico</option>
                  <option value="paisajes">🌅 Paisajes & Flora</option>
                  <option value="marino">🌊 Marino & Océano</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', color: '#a0a5ca', marginBottom: '6px', fontWeight: '700' }}>
                  Imagen (URL o Cargar Archivo):
                </label>
                <input
                  type="text"
                  value={newAccImage}
                  onChange={(e) => setNewAccImage(e.target.value)}
                  placeholder="https://... o selecciona un archivo abajo"
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(0,240,255,0.3)',
                    color: '#fff',
                    fontSize: '13px',
                    outline: 'none',
                    marginBottom: '8px'
                  }}
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  style={{ fontSize: '12px', color: '#a0a5ca' }}
                />
              </div>

              {newAccImage && (
                <div style={{ textAlign: 'center', marginTop: '6px' }}>
                  <p style={{ margin: '0 0 6px 0', fontSize: '11px', color: '#a0a5ca' }}>Vista previa:</p>
                  <img 
                    src={newAccImage} 
                    alt="Vista previa" 
                    style={{ height: '70px', objectFit: 'contain', borderRadius: '10px', border: '1px solid rgba(0,240,255,0.4)', padding: '4px', background: 'rgba(255,255,255,0.05)' }} 
                  />
                </div>
              )}

              <button
                type="submit"
                style={{
                  marginTop: '10px',
                  width: '100%',
                  padding: '12px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #00f0ff, #ff69b4)',
                  border: 'none',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '14px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 15px rgba(0, 240, 255, 0.4)',
                  transition: 'transform 0.2s ease'
                }}
              >
                💾 Publicar Accesorio en Tienda
              </button>
            </form>
          </div>
        </div>,
        document.body
      )}

      {/* MODAL LIGHTBOX DE VISTA AMPLIADA PARA COLGANTES (RENDERIZADO VIA PORTAL) */}
      {selectedLanyardModal && createPortal(
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 999999,
            backgroundColor: 'rgba(8, 12, 24, 0.88)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            overflow: 'hidden',
            animation: 'fadeIn 0.2s ease-out'
          }}
          onClick={() => setSelectedLanyardModal(null)}
        >
          <div 
            style={{
              position: 'relative',
              maxWidth: '380px',
              width: '92%',
              maxHeight: '88vh',
              overflowY: 'auto',
              background: 'linear-gradient(135deg, rgba(20, 26, 48, 0.98), rgba(15, 20, 36, 0.99))',
              border: '1.5px solid rgba(255, 105, 180, 0.45)',
              borderRadius: '20px',
              padding: '22px 18px 18px 18px',
              boxShadow: '0 15px 40px rgba(0, 240, 255, 0.35), 0 0 25px rgba(255, 105, 180, 0.25)',
              textAlign: 'center',
              color: '#ffffff',
              animation: 'zoomIn 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón Cerrar (X) */}
            <button
              onClick={() => setSelectedLanyardModal(null)}
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                color: '#ffffff',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 105, 180, 0.7)';
                e.currentTarget.style.transform = 'rotate(90deg)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
                e.currentTarget.style.transform = 'rotate(0deg)';
              }}
            >
              ✕
            </button>

            {/* Tag de Categoría y Tipo */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginBottom: '8px', paddingRight: '24px' }}>
              <span style={{
                padding: '3px 10px',
                borderRadius: '10px',
                background: 'rgba(255, 105, 180, 0.2)',
                border: '1px solid rgba(255, 182, 193, 0.4)',
                color: '#ffb6c1',
                fontSize: '11px',
                fontWeight: '700'
              }}>
                📿 {t('lanyardTag')}
              </span>
              {selectedLanyardModal.categoryLabel && (
                <span style={{
                  padding: '3px 10px',
                  borderRadius: '10px',
                  background: 'rgba(0, 240, 255, 0.15)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  color: '#00f0ff',
                  fontSize: '11px',
                  fontWeight: '700'
                }}>
                  {selectedLanyardModal.categoryLabel}
                </span>
              )}
            </div>

            {/* Imagen Ampliada */}
            <div style={{
              width: '100%',
              height: '210px',
              margin: '6px 0 12px 0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '14px',
              background: 'rgba(255, 255, 255, 0.03)',
              padding: '10px',
              position: 'relative'
            }}>
              <img 
                src={selectedLanyardModal.image} 
                alt={translations[activeLang]?.accessoryNames?.[selectedLanyardModal.name] || selectedLanyardModal.name}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 20px rgba(0,240,255,0.4))'
                }}
              />
            </div>

            {/* Título del Producto */}
            <h2 style={{
              fontSize: '16px',
              fontWeight: '800',
              color: '#ffffff',
              marginBottom: '6px',
              lineHeight: '1.25'
            }}>
              {translations[activeLang]?.accessoryNames?.[selectedLanyardModal.name] || selectedLanyardModal.name}
            </h2>

            {/* Precio */}
            <div style={{
              fontSize: '18px',
              fontWeight: '900',
              color: '#00f0ff',
              marginBottom: '14px',
              textShadow: '0 0 10px rgba(0,240,255,0.5)'
            }}>
              {selectedLanyardModal.price}
            </div>

            {/* Botón Añadir al Carrito dentro del Modal */}
            <button
              onClick={() => {
                handleAddToCart(selectedLanyardModal);
                setSelectedLanyardModal(null);
              }}
              style={{
                width: '100%',
                padding: '11px 16px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, #ff69b4, #00f0ff)',
                border: 'none',
                color: '#ffffff',
                fontWeight: '800',
                fontSize: '14px',
                cursor: 'pointer',
                boxShadow: '0 4px 15px rgba(255, 105, 180, 0.4)',
                transition: 'transform 0.2s ease, filter 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.filter = 'brightness(1.15)';
                e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.filter = 'brightness(1)';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              🛒 {t('addToCart')}
            </button>
          </div>
        </div>,
        document.body
      )}

      {/* Volver al Inicio */}
      <div style={{ marginTop: '20px' }}>
        <button 
          onClick={() => navigateTo('home', '/')}
          className="btn-secondary" 
          style={{ padding: '10px 28px', fontSize: '14px', borderRadius: '25px', borderColor: 'rgba(255,182,193,0.4)', color: '#ffb6c1' }}
        >
          {t('backToHome')}
        </button>
      </div>

    </div>
  );
}

export default AccessoriesPage;
