import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { translations } from '../translations';

const CartDrawer = ({ currentLang, user, onOpenAuth }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [cart, setCart] = useState([]);
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('success');

  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  // Cargar carrito inicialmente
  useEffect(() => {
    loadCart();
    
    // Escuchar el evento personalizado de actualización
    const handleCartUpdate = (e) => {
      loadCart();
      if (e?.detail?.open === true) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
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
    const isAuth = user?.isAuthenticated || window.isAuthenticated || false;
    if (!isAuth) {
      setMessage(t('loginRequiredToCheckout'));
      setMessageType('auth-required');
      if (onOpenAuth) {
        setTimeout(() => {
          onOpenAuth();
        }, 300);
      }
      return;
    }

    const finalAddress = shippingAddress.trim() || 'Entrega Directa (Demostración en Vivo Academia)';

    setLoading(true);
    setMessage(null);

    const checkoutData = {
      shipping_address: finalAddress,
      items: cart.map(item => {
        const prodId = item.databaseId || (typeof item.id === 'number' ? item.id : 323);
        const rawPrice = typeof item.price === 'number' ? item.price : parseFloat(String(item.price).replace('$', '')) || 19.99;
        return {
          product: prodId,
          quantity: item.quantity,
          price: rawPrice,
          custom_image: item.custom_image || item.image || '',
          custom_model: item.custom_model || item.name || ''
        };
      })
    };

    try {
      const response = await fetch('/api/checkout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': document.cookie.match(/csrftoken=([^;]+)/)?.[1] || window.csrfToken || ''
        },
        body: JSON.stringify(checkoutData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("🚀 ¡Pedido enviado con éxito! Se ha notificado por correo.");
        setMessageType("success");
        localStorage.removeItem('cart');
        setCart([]);
        setShippingAddress('');
        window.dispatchEvent(new CustomEvent('cart-count-updated'));
        setTimeout(() => {
          setIsOpen(false);
          setMessage(null);
        }, 3000);
      } else {
        throw new Error(data.detail || JSON.stringify(data));
      }
    } catch (err) {
      setMessage(`Error al enviar pedido: ${err.message}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Botón flotante o disparador del carrito (se muestra en la navbar de Django) */}
      <button className="cart-badge-trigger" onClick={() => setIsOpen(true)}>
        <span>🛒 {t('navCart')}</span>
        <span className="cart-count">{totalItems()}</span>
      </button>

      {/* Portalar backdrop y cajón lateral a document.body para escapar del contexto de capas (stacking context) del header */}
      {ReactDOM.createPortal(
        <>
          {/* Backdrop */}
          {isOpen && (
            <div className="cart-drawer-backdrop" onClick={() => setIsOpen(false)}></div>
          )}

          {/* Cajón lateral */}
          <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
            <div className="cart-header">
              <h3 style={{ margin: 0, fontSize: '20px', color: '#00f2fe' }}>{t('cartTitle')}</h3>
              <button className="cart-close-btn" onClick={() => setIsOpen(false)}>×</button>
            </div>

            <div className="cart-items">
              {message && (
                <div style={{ 
                  padding: '14px', 
                  background: messageType === 'success' ? 'rgba(16, 185, 129, 0.15)' : messageType === 'auth-required' ? 'rgba(234, 179, 8, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                  border: `1px solid ${messageType === 'success' ? '#10b981' : messageType === 'auth-required' ? '#eab308' : '#ef4444'}`,
                  borderRadius: '10px',
                  color: messageType === 'success' ? '#10b981' : messageType === 'auth-required' ? '#fde047' : '#ef4444',
                  fontSize: '13px',
                  fontWeight: '600',
                  textAlign: 'center',
                  marginBottom: '15px'
                }}>
                  <div>{message}</div>
                  {messageType === 'auth-required' && (
                    <button
                      className="btn-primary"
                      style={{ marginTop: '10px', width: '100%', padding: '8px', fontSize: '13px', borderRadius: '8px' }}
                      onClick={() => {
                        setIsOpen(false);
                        if (onOpenAuth) onOpenAuth();
                      }}
                    >
                      {t('loginToContinueBtn')}
                    </button>
                  )}
                </div>
              )}

              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: '#6b7280' }}>
                  <p style={{ fontSize: '40px', marginBottom: '10px' }}>🛒</p>
                  <p>{t('emptyCartTitle')}</p>
                  <p style={{ fontSize: '12px', marginTop: '5px' }}>{t('emptyCartSubtitle')}</p>
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
                  <span>{t('total')}:</span>
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
                  {loading ? 'Procesando...' : t('checkoutBtn')}
                </button>
              </div>
            )}
          </div>
        </>,
        document.body
      )}
    </>
  );
};

export default CartDrawer;
