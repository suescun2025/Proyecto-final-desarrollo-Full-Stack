import React, { useState, useEffect } from 'react';
import { translations } from '../translations';

const AdminDashboard = ({ initialTab = 'orders', currentLang }) => {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  const [activeTab, setActiveTab] = useState(initialTab); // 'stats', 'products', 'orders'
  const [orderFilter, setOrderFilter] = useState('ALL'); // 'ALL', 'PENDING', 'SHIPPED', 'CANCELLED'
  const [isCompactView, setIsCompactView] = useState(true); // Vista compacta de 1 línea por defecto
  const [selectedOrderIds, setSelectedOrderIds] = useState([]); // Array de IDs de pedidos seleccionados
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [models, setModels] = useState([]);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  
  // Estados para formularios
  const [editingProduct, setEditingProduct] = useState(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [productFormData, setProductFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    compatible_devices: [],
    specifications: {}
  });
  
  // Campos dinámicos para especificaciones técnicas
  const [newSpecKey, setNewSpecKey] = useState('');
  const [newSpecVal, setNewSpecVal] = useState('');

  useEffect(() => {
    fetchStats();
    fetchCategories();
    fetchModels();
    fetchOrders();

    // Auto-sondeo periódico en segundo plano (cada 5 segundos) para sincronizar nuevos pedidos automáticamente
    const interval = setInterval(() => {
      fetchOrders(true);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeTab === 'stats') fetchStats();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats/');
      if (!res.ok) throw new Error('Error al cargar estadísticas.');
      const data = await res.json();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/products/');
      if (!res.ok) throw new Error('Error al cargar productos.');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const res = await fetch(`/api/admin/orders/?_t=${Date.now()}`, {
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (!res.ok) throw new Error('Error al cargar pedidos.');
      const data = await res.json();
      setOrders(data);
    } catch (err) {
      if (!isSilent) setError(err.message);
    } finally {
      if (!isSilent) setLoading(false);
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

  const fetchModels = async () => {
    try {
      const res = await fetch('/api/models/');
      if (res.ok) {
        const data = await res.json();
        setModels(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const showNotification = (msg, type = 'success') => {
    if (type === 'success') {
      setSuccessMsg(msg);
      setTimeout(() => setSuccessMsg(null), 4000);
    } else {
      setError(msg);
      setTimeout(() => setError(null), 5000);
    }
  };

  // Manejo de Selección Múltiple y Acciones Masivas
  const handleToggleSelectOrder = (orderId) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) ? prev.filter(id => id !== orderId) : [...prev, orderId]
    );
  };

  const handleToggleSelectAllOrders = (visibleOrders) => {
    const visibleIds = visibleOrders.map(o => o.id);
    const allSelected = visibleIds.every(id => selectedOrderIds.includes(id));

    if (allSelected) {
      setSelectedOrderIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedOrderIds(prev => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleBulkCancelOrders = async () => {
    if (selectedOrderIds.length === 0) return;

    const reasonOptions = [
      "1. Stock Agotado / Producto fuera de catálogo",
      "2. Dirección de Envío No Disponible / Cobertura Limitada",
      "3. Solicitud Directa del Cliente",
      "4. Otro motivo de logística"
    ];
    const selection = window.prompt(
      `CANCELAR ${selectedOrderIds.length} PEDIDOS SELECCIONADOS\n\nSelecciona o escribe el motivo de la cancelación:\n${reasonOptions.join('\n')}\n\nEscribe el motivo:`,
      "1. Stock Agotado / Producto fuera de catálogo"
    );

    if (selection === null || selection.trim() === '') return;

    const reason = selection.trim();
    let successCount = 0;

    for (const orderId of selectedOrderIds) {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
          },
          body: JSON.stringify({ status: 'CANCELLED', cancellation_reason: reason })
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error(`Error cancelando pedido #${orderId}:`, err);
      }
    }

    showNotification(`❌ ${successCount} pedidos cancelados con éxito y stock restituido.`, 'success');
    setSelectedOrderIds([]);
    fetchOrders();
  };

  const handleBulkDeleteOrders = async () => {
    if (selectedOrderIds.length === 0) return;
    if (!window.confirm(`¿Seguro que deseas ELIMINAR PERMANENTEMENTE los ${selectedOrderIds.length} pedidos seleccionados?`)) return;

    let successCount = 0;
    for (const orderId of selectedOrderIds) {
      try {
        const res = await fetch(`/api/admin/orders/${orderId}/`, {
          method: 'DELETE',
          headers: {
            'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
          }
        });
        if (res.ok) successCount++;
      } catch (err) {
        console.error(`Error eliminando pedido #${orderId}:`, err);
      }
    }

    showNotification(`🗑️ ${successCount} pedidos eliminados permanentemente.`, 'success');
    setSelectedOrderIds([]);
    fetchOrders();
  };

  // Manejo de órdenes individuales
  const handleUpdateOrderStatus = async (orderId, newStatus, reason = '') => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        },
        body: JSON.stringify({ status: newStatus, cancellation_reason: reason })
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo actualizar el estado.');
      }
      
      if (newStatus === 'CANCELLED') {
        showNotification(`❌ Pedido #${orderId} cancelado. El stock fue restituido automáticamente.`, 'success');
      } else if (newStatus === 'SHIPPED') {
        showNotification(`🚚 Pedido #${orderId} marcado como ENVIADO y correo enviado al cliente.`, 'success');
      } else {
        showNotification(`Estado del pedido #${orderId} actualizado.`, 'success');
      }
      fetchOrders();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleCancelOrderWithReason = (orderId) => {
    const reasonOptions = [
      "1. Stock Agotado / Producto fuera de catálogo",
      "2. Dirección de Envío No Disponible / Cobertura Limitada",
      "3. Solicitud Directa del Cliente",
      "4. Otro motivo de logística"
    ];
    const selection = window.prompt(
      `CANCELAR PEDIDO #${orderId}\n\nSelecciona o escribe el motivo de la cancelación:\n${reasonOptions.join('\n')}\n\nEscribe el motivo o número:`,
      "1. Stock Agotado / Producto fuera de catálogo"
    );

    if (selection !== null && selection.trim() !== '') {
      handleUpdateOrderStatus(orderId, 'CANCELLED', selection.trim());
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este pedido permanentemente?')) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo eliminar el pedido.');
      }
      showNotification('Pedido eliminado.');
      fetchOrders();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  // Manejo de productos
  const handleOpenCreateForm = () => {
    setEditingProduct(null);
    setProductFormData({
      name: '',
      description: '',
      price: '',
      stock: '',
      category: categories[0]?.id || '',
      compatible_devices: [],
      specifications: {}
    });
    setNewSpecKey('');
    setNewSpecVal('');
    setShowProductForm(true);
  };

  const handleOpenEditForm = (product) => {
    setEditingProduct(product);
    setProductFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: product.category,
      compatible_devices: product.compatible_devices.map(d => d.id),
      specifications: product.specifications || {}
    });
    setNewSpecKey('');
    setNewSpecVal('');
    setShowProductForm(true);
  };

  const handleAddSpecification = () => {
    if (!newSpecKey.trim() || !newSpecVal.trim()) return;
    setProductFormData({
      ...productFormData,
      specifications: {
        ...productFormData.specifications,
        [newSpecKey.trim().toLowerCase()]: newSpecVal.trim()
      }
    });
    setNewSpecKey('');
    setNewSpecVal('');
  };

  const handleRemoveSpecification = (key) => {
    const specs = { ...productFormData.specifications };
    delete specs[key];
    setProductFormData({ ...productFormData, specifications: specs });
  };

  const handleToggleDevice = (deviceId) => {
    const current = [...productFormData.compatible_devices];
    const index = current.indexOf(deviceId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(deviceId);
    }
    setProductFormData({ ...productFormData, compatible_devices: current });
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const url = editingProduct 
      ? `/api/admin/products/${editingProduct.id}/` 
      : '/api/admin/products/';
    const method = editingProduct ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        },
        body: JSON.stringify(productFormData)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Error al guardar el producto.');

      showNotification(editingProduct ? 'Producto actualizado correctamente.' : 'Producto creado correctamente.');
      setShowProductForm(false);
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('¿Seguro que deseas eliminar este producto?')) return;
    try {
      const res = await fetch(`/api/admin/products/${productId}/`, {
        method: 'DELETE',
        headers: {
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        }
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.detail || 'No se pudo eliminar el producto.');
      }
      showNotification('Producto eliminado.');
      fetchProducts();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  return (
    <div className="admin-container animate-fade-in" style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* Cabecera del Panel - Nuevo Logo 'Centro de Pedidos de TechMatch' */}
      <div style={{ textAlign: 'center', marginBottom: '35px', borderBottom: '1px solid rgba(0, 102, 255, 0.25)', paddingBottom: '25px', position: 'relative' }}>
        <h1 
          style={{ 
            fontSize: 'clamp(36px, 5vw, 56px)', 
            margin: 0, 
            fontFamily: "'Satisfy', 'Great Vibes', 'Alex Brush', 'Caveat', cursive",
            fontWeight: '700',
            background: 'linear-gradient(135deg, #0088ff 0%, #0055ff 50%, #00d2ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 4px 18px rgba(0, 102, 255, 0.65))',
            letterSpacing: '1px'
          }}
        >
          {t('adminPanelTitle')}
        </h1>
      </div>

      {/* Alertas */}
      {successMsg && (
        <div className="animate-fade-in" style={{ padding: '12px 20px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--color-success)', borderRadius: '8px', color: 'var(--color-success)', marginBottom: '20px', fontWeight: '500' }}>
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="animate-fade-in" style={{ padding: '12px 20px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--color-error)', borderRadius: '8px', color: 'var(--color-error)', marginBottom: '20px', fontWeight: '500' }}>
          ⚠️ {error}
        </div>
      )}

      {/* CENTRO DE CONTROL DE PEDIDOS DE CLIENTES */}
      <div className="animate-fade-in">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
            <h3 style={{ margin: 0, fontSize: '20px', color: '#fff' }}>{t('adminOrdersControlTitle')}</h3>
            
            {/* Acciones Masivas y Filtros */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
              
              {/* Botones de Acción Masiva Superior */}
              {selectedOrderIds.length > 0 && (
                <div style={{ display: 'flex', gap: '8px', background: 'rgba(239, 68, 68, 0.15)', padding: '6px 14px', borderRadius: '25px', border: '1px solid rgba(239, 68, 68, 0.4)', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: '#ffffff', fontWeight: '800' }}>
                    {selectedOrderIds.length} {t('adminMarked')}
                  </span>
                  <button
                    onClick={handleBulkCancelOrders}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: '15px',
                      background: 'rgba(239, 68, 68, 0.85)',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '700',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(239, 68, 68, 0.4)'
                    }}
                    title="Cancelar todos los pedidos seleccionados con motivo y restituir stock"
                  >
                    {t('adminCancelSelected')}
                  </button>
                  <button
                    onClick={handleBulkDeleteOrders}
                    style={{
                      padding: '5px 12px',
                      fontSize: '12px',
                      borderRadius: '15px',
                      background: '#7f1d1d',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                    title="Eliminar de golpe los pedidos seleccionados"
                  >
                    {t('adminDeleteSelected')}
                  </button>
                </div>
              )}

              {/* Filtros por Estado */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  onClick={() => setOrderFilter('ALL')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: orderFilter === 'ALL' ? '2px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)',
                    background: orderFilter === 'ALL' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: orderFilter === 'ALL' ? '#ffffff' : '#94a3b8',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('adminFilterAll')} ({orders.length})
                </button>
                <button
                  onClick={() => setOrderFilter('PENDING')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: orderFilter === 'PENDING' ? '2px solid #00f2fe' : '1px solid rgba(0,242,254,0.3)',
                    background: orderFilter === 'PENDING' ? 'rgba(0, 242, 254, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: '#00f2fe',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('adminFilterPending')} ({orders.filter(o => o.status === 'PENDING').length})
                </button>
                <button
                  onClick={() => setOrderFilter('SHIPPED')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: orderFilter === 'SHIPPED' ? '2px solid #10b981' : '1px solid rgba(16,185,129,0.3)',
                    background: orderFilter === 'SHIPPED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: '#10b981',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('adminFilterShipped')} ({orders.filter(o => o.status === 'SHIPPED').length})
                </button>
                <button
                  onClick={() => setOrderFilter('CANCELLED')}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: orderFilter === 'CANCELLED' ? '2px solid #ef4444' : '1px solid rgba(239,68,68,0.3)',
                    background: orderFilter === 'CANCELLED' ? 'rgba(239, 68, 68, 0.2)' : 'rgba(15, 23, 42, 0.6)',
                    color: '#ef4444',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  {t('adminFilterCancelled')} ({orders.filter(o => o.status === 'CANCELLED').length})
                </button>

                {/* Botón Selector de Modo de Vista (1 Línea vs Detallada) */}
                <button
                  type="button"
                  onClick={() => setIsCompactView(!isCompactView)}
                  style={{
                    padding: '6px 14px',
                    fontSize: '12px',
                    borderRadius: '20px',
                    border: '1px solid rgba(0, 242, 254, 0.4)',
                    background: isCompactView ? 'linear-gradient(135deg, rgba(0, 242, 254, 0.25), rgba(168, 85, 247, 0.25))' : 'rgba(15, 23, 42, 0.6)',
                    color: '#00f2fe',
                    fontWeight: '700',
                    cursor: 'pointer',
                    marginLeft: 'auto'
                  }}
                >
                  {isCompactView ? t('adminViewCompact') : t('adminViewDetailed')}
                </button>
              </div>

            </div>
          </div>

          <div className="table-responsive glass-panel" style={{ borderRadius: '16px', overflowX: 'auto', maxHeight: '680px', overflowY: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr style={{ background: '#1e293b', position: 'sticky', top: 0, zIndex: 10 }}>
                  <th style={{ width: '45px', textAlign: 'center' }}>
                    <input 
                      type="checkbox"
                      checked={
                        orders.filter(o => orderFilter === 'ALL' || o.status === orderFilter).length > 0 &&
                        orders
                          .filter(o => orderFilter === 'ALL' || o.status === orderFilter)
                          .every(o => selectedOrderIds.includes(o.id))
                      }
                      onChange={() => handleToggleSelectAllOrders(orders.filter(o => orderFilter === 'ALL' || o.status === orderFilter))}
                      style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: '#00f2fe' }}
                      title="Seleccionar o Deseleccionar Todos los Pedidos"
                    />
                  </th>
                  <th>{t('adminTableIdItems')}</th>
                  <th>{t('adminTableCustomer')}</th>
                  <th>{t('adminTableDate')}</th>
                  <th>{t('adminTableShippingAddress')}</th>
                  <th>{t('adminTableTotal')}</th>
                  <th>{t('adminTableStatus')}</th>
                  <th style={{ textAlign: 'center' }}>{t('adminTableActions')}</th>
                </tr>
              </thead>
              <tbody>
                {orders.filter(o => orderFilter === 'ALL' || o.status === orderFilter).length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '30px' }}>
                      {t('adminNoOrders')}
                    </td>
                  </tr>
                ) : (
                  orders
                    .filter(o => orderFilter === 'ALL' || o.status === orderFilter)
                    .map(o => (
                      <tr key={o.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)', background: selectedOrderIds.includes(o.id) ? 'rgba(0, 242, 254, 0.08)' : 'transparent' }}>
                        
                        {/* Checkbox de Selección Individual */}
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: isCompactView ? '8px 6px' : '18px 6px' }}>
                          <input 
                            type="checkbox"
                            checked={selectedOrderIds.includes(o.id)}
                            onChange={() => handleToggleSelectOrder(o.id)}
                            style={{ cursor: 'pointer', width: '17px', height: '17px', accentColor: '#00f2fe' }}
                          />
                        </td>
                        
                        {/* ID & Productos */}
                        <td style={{ verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', minWidth: '260px' }}>
                          {isCompactView ? (
                            /* MODO COMPACTO DE 1 LÍNEA */
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '13px', fontWeight: '800', color: '#00f2fe', whiteSpace: 'nowrap' }}>
                                #{o.id}
                              </span>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                {o.items?.map(it => (
                                  <div key={it.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', background: 'rgba(15, 23, 42, 0.75)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.08)', fontSize: '11px' }}>
                                    {it.product_image ? (
                                      <img src={it.product_image} alt={it.product_name} style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : it.custom_image ? (
                                      <img src={it.custom_image} alt="Diseño" style={{ width: '20px', height: '20px', objectFit: 'cover', borderRadius: '4px' }} />
                                    ) : (
                                      <span style={{ fontSize: '11px' }}>📦</span>
                                    )}
                                    <span style={{ fontWeight: '600', color: '#fff', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                      {it.product_name}
                                    </span>
                                    <span style={{ color: '#94a3b8' }}>x{it.quantity}</span>
                                    {it.custom_model && <span style={{ color: '#00f2fe', fontSize: '10px' }}>({it.custom_model})</span>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          ) : (
                            /* MODO DETALLADO */
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                <span style={{ fontSize: '15px', fontWeight: '800', color: '#00f2fe' }}>{t('adminOrderNumber')}{o.id}</span>
                              </div>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                {o.items?.map(it => (
                                  <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.6)', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    {it.product_image ? (
                                      <img src={it.product_image} alt={it.product_name} style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.3)' }} />
                                    ) : it.custom_image ? (
                                      <img src={it.custom_image} alt="Diseño" style={{ width: '36px', height: '36px', objectFit: 'cover', borderRadius: '6px', border: '1px solid #a855f7' }} />
                                    ) : (
                                      <div style={{ width: '36px', height: '36px', background: '#0f172a', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>📦</div>
                                    )}
                                    <div>
                                      <div style={{ fontSize: '12px', fontWeight: '700', color: '#ffffff' }}>{it.product_name}</div>
                                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>x{it.quantity} • {parseFloat(it.price).toFixed(2)} €</div>
                                      {it.custom_model && <div style={{ fontSize: '11px', color: '#00f2fe' }}>📱 {it.custom_model}</div>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </td>

                        {/* Cliente */}
                        <td style={{ verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', fontWeight: '600', fontSize: isCompactView ? '12px' : '13px', whiteSpace: 'nowrap' }}>
                          👤 {o.user_username || t('adminDefaultCustomer')}
                        </td>

                        {/* Fecha */}
                        <td style={{ fontSize: isCompactView ? '11.5px' : '13px', color: '#94a3b8', verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', whiteSpace: 'nowrap' }}>
                          {new Date(o.created_at).toLocaleString(activeLang === 'en' ? 'en-US' : activeLang === 'de' ? 'de-DE' : 'es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </td>

                        {/* Dirección */}
                        <td style={{ fontSize: isCompactView ? '11.5px' : '13px', maxWidth: isCompactView ? '160px' : '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', color: '#cbd5e1' }} title={o.shipping_address}>
                          📍 {o.shipping_address || t('adminStandardDelivery')}
                        </td>

                        {/* Total */}
                        <td style={{ fontWeight: '800', color: '#00f2fe', fontSize: isCompactView ? '13px' : '15px', verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', whiteSpace: 'nowrap' }}>
                          {parseFloat(o.total).toFixed(2)} €
                        </td>

                        {/* Estado */}
                        <td style={{ verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px', whiteSpace: 'nowrap' }}>
                          {o.status === 'SHIPPED' ? (
                            <span style={{ padding: '3px 8px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#10b981', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>
                              {t('adminStatusShipped')}
                            </span>
                          ) : o.status === 'DELIVERED' ? (
                            <span style={{ padding: '3px 8px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', border: '1px solid #a855f7', color: '#a855f7', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>
                              {t('adminStatusDelivered')}
                            </span>
                          ) : o.status === 'CANCELLED' ? (
                            <span style={{ padding: '3px 8px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.15)', border: '1px solid #ef4444', color: '#ef4444', fontSize: '11px', fontWeight: '700', display: 'inline-block' }} title={o.cancellation_reason ? `Motivo: ${o.cancellation_reason}` : ''}>
                              {t('adminStatusCancelled')}
                            </span>
                          ) : (
                            <span style={{ padding: '3px 8px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '11px', fontWeight: '700', display: 'inline-block' }}>
                              {t('adminStatusPending')}
                            </span>
                          )}
                        </td>

                        {/* Acciones */}
                        <td style={{ textAlign: 'center', verticalAlign: 'middle', padding: isCompactView ? '8px 10px' : '16px 10px' }}>
                          <div style={{ display: 'flex', gap: '6px', alignItems: 'center', justifyContent: 'center' }}>
                            <select 
                              className="form-input" 
                              style={{ padding: '3px 6px', fontSize: '11px', width: isCompactView ? '100px' : '130px', margin: 0 }}
                              value={o.status}
                              onChange={(e) => {
                                if (e.target.value === 'CANCELLED') {
                                  handleCancelOrderWithReason(o.id);
                                } else {
                                  handleUpdateOrderStatus(o.id, e.target.value);
                                }
                              }}
                            >
                              <option value="PENDING">{t('adminOptionPending')}</option>
                              <option value="SHIPPED">{t('adminOptionShipped')}</option>
                              <option value="DELIVERED">{t('adminOptionDelivered')}</option>
                              <option value="CANCELLED">{t('adminOptionCancelled')}</option>
                            </select>

                            {o.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateOrderStatus(o.id, 'SHIPPED')}
                                style={{
                                  padding: '3px 7px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  borderRadius: '5px',
                                  background: '#10b981',
                                  color: '#0b0f19',
                                  border: 'none',
                                  cursor: 'pointer'
                                }}
                                title="Marcar como Enviado"
                              >
                                🚚
                              </button>
                            )}

                            {o.status !== 'CANCELLED' && (
                              <button 
                                onClick={() => handleCancelOrderWithReason(o.id)}
                                style={{
                                  padding: '3px 7px',
                                  fontSize: '11px',
                                  fontWeight: '700',
                                  borderRadius: '5px',
                                  background: 'rgba(239, 68, 68, 0.15)',
                                  color: '#ef4444',
                                  border: '1px solid rgba(239, 68, 68, 0.6)',
                                  cursor: 'pointer'
                                }}
                                title="Cancelar Pedido con Motivo"
                              >
                                ❌
                              </button>
                            )}

                            <button 
                              onClick={() => handleDeleteOrder(o.id)}
                              style={{
                                padding: '3px 7px',
                                fontSize: '11px',
                                borderRadius: '5px',
                                background: 'transparent',
                                color: '#94a3b8',
                                border: '1px solid rgba(255,255,255,0.15)',
                                cursor: 'pointer'
                              }}
                              title="Eliminar Pedido Definitivamente"
                            >
                              🗑️
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                )}
              </tbody>
            </table>
          </div>
        </div>
    </div>
  );
};

export default AdminDashboard;
