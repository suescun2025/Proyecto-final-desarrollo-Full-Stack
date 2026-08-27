import React, { useState, useEffect } from 'react';

export default function MyOrdersPage({ currentLang, translations, navigateTo }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [simulatingId, setSimulatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [notificationMsg, setNotificationMsg] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`/api/orders/?_t=${Date.now()}`, {
        headers: { 
          'Accept': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        const activeOrders = data.filter(o => o.status !== 'CANCELLED');
        setOrders(activeOrders);
      }
    } catch (err) {
      console.error("Error al obtener pedidos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Sondeo periódico en segundo plano (cada 5 segundos) para sincronizar en tiempo real cuando cambia el estado
    const interval = setInterval(() => {
      fetchOrders();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Función para cancelar un pedido indicando el motivo
  const handleCancelOrder = async (orderId) => {
    const reason = window.prompt(`¿Deseas cancelar el Pedido #${orderId}?\nPor favor, ingresa el motivo de la cancelación:`, "Cambio de opinión / Selección de modelo incorrecta");
    if (reason === null) return;

    setDeletingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken || document.cookie.match(/csrftoken=([^;]+)/)?.[1] || ''
        },
        body: JSON.stringify({ cancellation_reason: reason })
      });

      if (res.ok) {
        setNotificationMsg(`🚫 El Pedido #${orderId} ha sido cancelado correctamente. Motivo: "${reason}"`);
        await fetchOrders();
        setTimeout(() => setNotificationMsg(null), 5000);
      } else {
        const data = await res.json();
        alert(data.detail || "Error al cancelar el pedido.");
      }
    } catch (err) {
      console.error("Error al cancelar pedido:", err);
      alert("Error de red al cancelar el pedido.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancelLatestOrder = () => {
    if (orders.length > 0) {
      handleCancelOrder(orders[0].id);
    }
  };

  // Función para simular la confirmación de envío en vivo (Demo)
  const handleSimulateShipment = async (orderId) => {
    setSimulatingId(orderId);
    try {
      const res = await fetch(`/api/orders/${orderId}/ship-email-action/?token=demo`, {
        method: 'GET'
      });
      if (res.ok) {
        setNotificationMsg(`📦 ¡El Pedido #${orderId} ha sido marcado como ENVIADO!`);
        await fetchOrders();
        setTimeout(() => setNotificationMsg(null), 5000);
      }
    } catch (err) {
      console.error("Error al simular envío:", err);
    } finally {
      setSimulatingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'CANCELLED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.6)',
            color: '#ef4444',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            ❌ Cancelado
          </span>
        );
      case 'SHIPPED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.6)',
            color: '#10b981',
            fontWeight: '700',
            fontSize: '13px',
            boxShadow: '0 0 15px rgba(16, 185, 129, 0.2)'
          }}>
            <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', boxShadow: '0 0 8px #10b981' }}></span>
            🚚 Enviado / En Camino
          </span>
        );
      case 'DELIVERED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.6)',
            color: '#a855f7',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            ✅ Entregado
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '6px 14px',
            borderRadius: '20px',
            background: 'rgba(0, 242, 254, 0.12)',
            border: '1px solid rgba(0, 242, 254, 0.4)',
            color: '#00f2fe',
            fontWeight: '700',
            fontSize: '13px'
          }}>
            ⏳ Recibido / Pendiente
          </span>
        );
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto 80px auto', padding: '0 20px' }}>
      
      {/* Encabezado de Sección */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h1 style={{ fontSize: '32px', margin: 0, fontWeight: '800', background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            📦 Mis Pedidos
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '6px 0 0 0', fontSize: '15px' }}>
            Consulta el historial, cliente registrado y estado de entrega en tiempo real de tus compras.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Botón Cancelar / Borrar Pedido a la izquierda de Actualizar Lista */}
          <button
            onClick={handleCancelLatestOrder}
            className="btn-secondary"
            style={{
              padding: '8px 18px',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(239, 68, 68, 0.15)',
              borderColor: 'rgba(239, 68, 68, 0.6)',
              color: '#ef4444'
            }}
            disabled={orders.length === 0 || deletingId !== null}
            title="Cancelar y eliminar el pedido más reciente"
          >
            ❌ Cancelar / Borrar Pedido
          </button>

          <button 
            onClick={fetchOrders} 
            className="btn-secondary"
            style={{ padding: '8px 18px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            🔄 Actualizar Lista
          </button>
        </div>
      </div>

      {/* Banner de Notificación en Vivo */}
      {notificationMsg && (
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(0, 242, 254, 0.15) 100%)',
          border: '1px solid #10b981',
          borderRadius: '12px',
          color: '#ffffff',
          fontWeight: '600',
          marginBottom: '25px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          boxShadow: '0 8px 25px rgba(16, 185, 129, 0.25)',
          animation: 'fadeIn 0.4s ease'
        }}>
          <span style={{ fontSize: '24px' }}>🔔</span>
          <div>
            <div style={{ color: '#10b981', fontSize: '12px', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '1px' }}>Notificación de Envío</div>
            <div>{notificationMsg}</div>
          </div>
        </div>
      )}

      {/* Estado de Carga */}
      {loading ? (
        <div className="loader-container" style={{ padding: '80px 0' }}>
          <div className="spinner"></div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '15px' }}>Cargando historial de pedidos...</p>
        </div>
      ) : orders.length === 0 ? (
        /* Estado Vacío cuando la Base de Datos está limpia */
        <div className="glass-panel" style={{ textAlign: 'center', padding: '70px 20px', borderRadius: '16px', border: '1px dashed var(--border-color)' }}>
          <span style={{ fontSize: '56px', display: 'block', marginBottom: '15px' }}>🛒</span>
          <h3 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#fff' }}>No hay ningún pedido registrado</h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '480px', margin: '0 auto 25px auto', fontSize: '14px', lineHeight: '1.6' }}>
            La base de datos está totalmente limpia. Realiza una compra de prueba desde el carrito para comprobar la llegada del e-mail y el seguimiento del pedido.
          </p>
          <button className="btn-primary" onClick={() => navigateTo('home', '/')}>
            <span>🚀 Ir al Catálogo a Comprar</span>
          </button>
        </div>
      ) : (
        /* Lista de Tarjetas de Pedidos */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {orders.map(order => {
            const formattedDate = new Date(order.created_at).toLocaleString('es-ES', {
              day: '2-digit', month: '2-digit', year: 'numeric',
              hour: '2-digit', minute: '2-digit'
            });

            const isPending = order.status === 'PENDING';
            const isShipped = order.status === 'SHIPPED';
            const isDelivered = order.status === 'DELIVERED';

            return (
              <div 
                key={order.id} 
                className="glass-card"
                style={{ 
                  borderRadius: '16px', 
                  padding: '24px', 
                  border: isShipped ? '1px solid rgba(16, 185, 129, 0.4)' : '1px solid rgba(255,255,255,0.1)',
                  boxShadow: isShipped ? '0 10px 30px rgba(16, 185, 129, 0.12)' : 'var(--shadow-card)',
                  transition: 'all 0.3s ease'
                }}
              >
                {/* Header de la Tarjeta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>Pedido #{order.id}</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>• {formattedDate}</span>
                    </div>
                    
                    {/* Información del Cliente */}
                    <div style={{ fontSize: '13px', color: 'var(--color-accent)', marginTop: '4px', fontWeight: '600' }}>
                      👤 Cliente: <strong style={{ color: '#fff' }}>{order.user_username || 'Cliente Demo'}</strong>
                    </div>

                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📍 Dirección de Envío: <strong style={{ color: '#cbd5e1' }}>{order.shipping_address || 'Entrega Estándar'}</strong>
                    </div>

                    {order.cancellation_reason && (
                      <div style={{ fontSize: '13px', color: '#f87171', marginTop: '6px', fontWeight: '600', background: 'rgba(239, 68, 68, 0.1)', padding: '6px 10px', borderRadius: '6px', borderLeft: '3px solid #ef4444' }}>
                        💬 Motivo de cancelación: "{order.cancellation_reason}"
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    {getStatusBadge(order.status)}

                    {/* Botón para Cancelar / Borrar este pedido específico */}
                    <button
                      onClick={() => handleCancelOrder(order.id)}
                      disabled={deletingId === order.id}
                      title="Cancelar y borrar este pedido"
                      style={{
                        background: 'rgba(239, 68, 68, 0.15)',
                        border: '1px solid rgba(239, 68, 68, 0.6)',
                        color: '#ef4444',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      {deletingId === order.id ? '⏳ Cancelando...' : '🗑️ Cancelar Pedido'}
                    </button>

                    {/* Botón de Simulación para Demo Admin */}
                    {isPending && (
                      <button
                        onClick={() => handleSimulateShipment(order.id)}
                        disabled={simulatingId === order.id}
                        title="Simular la confirmación de envío enviada por el administrador"
                        style={{
                          background: 'linear-gradient(135deg, rgba(0, 242, 254, 0.2) 0%, rgba(79, 172, 254, 0.2) 100%)',
                          border: '1px solid var(--color-accent)',
                          color: 'var(--color-accent)',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {simulatingId === order.id ? '⚡ Enviando...' : '⚡ Simular Envío (Admin)'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Línea de Tiempo de Entrega (Timeline visual) */}
                <div style={{ marginBottom: '25px', padding: '16px 20px', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.04)' }}>
                  <div className="tracker-timeline" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
                    
                    {/* Paso 1: Recibido */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#00f2fe', color: '#0b0f19', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 6px auto', boxShadow: '0 0 12px rgba(0, 242, 254, 0.6)' }}>
                        1
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: '#00f2fe' }}>⏳ Recibido</span>
                    </div>

                    {/* Línea 1-2 */}
                    <div style={{ flex: 1, height: '3px', background: isShipped || isDelivered ? '#10b981' : 'rgba(255,255,255,0.1)', margin: '0 10px', borderRadius: '2px', transition: 'all 0.4s ease' }}></div>

                    {/* Paso 2: Enviado */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isShipped || isDelivered ? '#10b981' : 'rgba(255,255,255,0.15)', color: isShipped || isDelivered ? '#0b0f19' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 6px auto', boxShadow: isShipped ? '0 0 15px #10b981' : 'none', transition: 'all 0.4s ease' }}>
                        2
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: isShipped || isDelivered ? '#10b981' : '#64748b' }}>🚚 Enviado</span>
                    </div>

                    {/* Línea 2-3 */}
                    <div style={{ flex: 1, height: '3px', background: isDelivered ? '#a855f7' : 'rgba(255,255,255,0.1)', margin: '0 10px', borderRadius: '2px', transition: 'all 0.4s ease' }}></div>

                    {/* Paso 3: Entregado */}
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: isDelivered ? '#a855f7' : 'rgba(255,255,255,0.15)', color: isDelivered ? '#fff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', margin: '0 auto 6px auto' }}>
                        3
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: '700', color: isDelivered ? '#a855f7' : '#64748b' }}>✅ Entregado</span>
                    </div>

                  </div>
                </div>

                {/* Ítems del Pedido */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  {order.items && order.items.map(item => (
                    <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(15, 23, 42, 0.6)', padding: '12px 16px', borderRadius: '10px', flexWrap: 'wrap', gap: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                        {item.custom_image ? (
                          <img src={item.custom_image} alt={item.product_name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--color-accent)' }} />
                        ) : item.product_image ? (
                          <img src={item.product_image} alt={item.product_name} style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }} />
                        ) : (
                          <div style={{ width: '48px', height: '48px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>📦</div>
                        )}

                        <div>
                          <div style={{ fontWeight: '700', color: '#f8fafc', fontSize: '15px' }}>
                            {item.product_name}
                          </div>
                          {item.custom_model && ['macbook', 'iphone', 'samsung', 'ipad', 'galaxy', 'xiaomi', 'pixel'].some(kw => item.custom_model.toLowerCase().includes(kw)) && (
                            <div style={{ fontSize: '12px', color: '#00f2fe', marginTop: '2px' }}>
                              📱 Modelo: {item.custom_model}
                            </div>
                          )}
                          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            Cantidad: {item.quantity} x {parseFloat(item.price).toFixed(2)} €
                          </div>
                        </div>
                      </div>

                      <div style={{ fontWeight: '800', color: 'var(--color-accent)', fontSize: '16px' }}>
                        {(parseFloat(item.price) * item.quantity).toFixed(2)} €
                      </div>
                    </div>
                  ))}
                </div>

                {/* Footer de la Tarjeta */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                    {isShipped 
                      ? '🚀 Estado: En tránsito hacia tu dirección' 
                      : isDelivered 
                      ? '🎉 Pedido entregado con éxito' 
                      : '⏳ Pedido recibido en el sistema, en preparación de envío'}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)', marginRight: '10px' }}>Total Pagado:</span>
                    <span style={{ fontSize: '20px', fontWeight: '800', color: '#00f2fe' }}>{parseFloat(order.total).toFixed(2)} €</span>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
