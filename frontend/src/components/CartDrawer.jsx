import React, { useState, useEffect } from 'react';

const CartDrawer = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  // Cargar carrito inicialmente
  useEffect(() => {
    loadCart();
    
    // Escuchar el evento personalizado de actualización
    const handleCartUpdate = () => {
      loadCart();
      setIsOpen(true); // Abrir el carrito cuando se añada un producto
    };
    
    window.addEventListener('cart-updated', handleCartUpdate);
    return () => {
      window.removeEventListener('cart-updated', handleCartUpdate);
    };
  }, []);

  const loadCart = () => {
    const savedCart = JSON.parse(localStorage.getItem('cart')) || [];
    setCart(savedCart);
  };

  const updateQuantity = (productId, newQty) => {
    if (newQty < 1) return;
    let updatedCart = cart.map(item => 
      item.id === productId ? { ...item, quantity: newQty } : item
    );
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    // Disparar evento para otros componentes que lo requieran
    window.dispatchEvent(new CustomEvent('cart-count-updated'));
  };

  const removeItem = (productId) => {
    let updatedCart = cart.filter(item => item.id !== productId);
    setCart(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new CustomEvent('cart-count-updated'));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  const totalItems = () => {
    return cart.reduce((count, item) => count + item.quantity, 0);
  };

  const handleCheckout = async () => {
    // Comprobar si el usuario está autenticado
    const isAuthenticated = window.isAuthenticated === true;
    
    if (!isAuthenticated) {
      setMessage("Debes iniciar sesión para finalizar tu pedido.");
      setMessageType("error");
      setTimeout(() => {
        // Redirigir al inicio de sesión
        window.location.href = `/admin/login/?next=${window.location.pathname}`;
      }, 2000);
      return;
    }

    if (!shippingAddress.trim()) {
      setMessage("Por favor, introduce una dirección de envío.");
      setMessageType("error");
      return;
    }

    setLoading(true);
    setMessage(null);

    const checkoutData = {
      shipping_address: shippingAddress,
      items: cart.map(item => ({
        product: item.id,
        quantity: item.quantity
      }))
    };

    try {
      const response = await fetch('/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': window.csrfToken || '' // Token CSRF proveído por la plantilla de Django
        },
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("¡Pedido realizado con éxito! Redirigiendo a tus pedidos...");
        setMessageType("success");
        localStorage.removeItem('cart');
        setCart([]);
        setShippingAddress('');
        window.dispatchEvent(new CustomEvent('cart-count-updated'));
        setTimeout(() => {
          window.location.href = '/orders/';
        }, 2000);
      } else {
        throw new Error(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setMessage(`Error en el checkout: ${err.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante o disparador del carrito (se muestra en la navbar de Django) */}
      <button className="cart-badge-trigger" onClick={() => setIsOpen(true)}>
        <span>🛒 Carrito</span>
        <span className="cart-count">{totalItems()}</span>
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div className="cart-drawer-backdrop" onClick={() => setIsOpen(false)}></div>
      )}

      {/* Cajón lateral */}
      <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
        <div className="cart-header">
          <h3 style={{ margin: 0, fontSize: '20px', color: '#00f2fe' }}>Tu Carrito</h3>
          <button className="cart-close-btn" onClick={() => setIsOpen(false)}>×</button>
        </div>

        <div className="cart-items">
          {message && (
            <div style={{ 
              padding: '12px', 
              background: messageType === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              border: `1px solid ${messageType === 'success' ? '#10b981' : '#ef4444'}`,
              borderRadius: '6px',
              color: messageType === 'success' ? '#10b981' : '#ef4444',
              fontSize: '14px',
              textAlign: 'center'
            }}>
              {message}
            </div>
          )}

          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
              <p style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</p>
              <p>El carrito está vacío</p>
              <p style={{ fontSize: '12px', marginTop: '5px' }}>Usa el asistente de compatibilidad para agregar productos.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="cart-item">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="cart-item-image" />
                ) : (
                  <div className="cart-item-image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0b0f19', color: '#6b7280', fontSize: '20px' }}>📦</div>
                )}
                <div className="cart-item-details">
                  <div className="cart-item-title">{item.name}</div>
                  <div className="cart-item-price">{item.price} €</div>
                  
                  <div className="cart-qty-control">
                    <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span style={{ fontSize: '14px', fontWeight: 'bold' }}>{item.quantity}</span>
                    <button className="cart-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="cart-item-remove" onClick={() => removeItem(item.id)}>🗑️</button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="cart-footer">
            <div className="cart-total-row">
              <span>Total:</span>
              <span className="cart-total-price">{calculateTotal()} €</span>
            </div>

            {/* Dirección de Envío */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '13px', color: '#9ca3af', marginBottom: '6px', fontWeight: '500' }}>
                Dirección de Envío:
              </label>
              <textarea 
                className="glass-panel"
                style={{ width: '100%', padding: '10px', height: '60px', borderRadius: '8px', color: '#f3f4f6', background: 'rgba(0,0,0,0.2)', resize: 'none', border: '1px solid var(--border-color)', boxSizing: 'border-box', outline: 'none', fontFamily: 'var(--font-sans)', fontSize: '13px' }}
                placeholder="Introduce tu dirección exacta..."
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                disabled={loading}
              ></textarea>
            </div>

            <button 
              className="btn-primary cart-checkout-btn"
              onClick={handleCheckout}
              disabled={loading}
            >
              {loading ? 'Procesando...' : 'Finalizar Pedido'}
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
