import React from 'react';
import { translations } from '../translations';

const ProductDetailsModal = ({ product, onClose, onAddToCart, currentLang }) => {
  const activeLang = currentLang || localStorage.getItem('techmatch_lang') || 'es';
  const t = (key) => translations[activeLang]?.[key] || translations['es']?.[key] || key;

  const getTranslatedDesc = (description) => {
    return translations[activeLang]?.productDescriptions?.[description] 
      || translations['es']?.productDescriptions?.[description] 
      || description;
  };

  const getTranslatedSpecKey = (key) => {
    return translations[activeLang]?.specsLabel?.[key] 
      || translations['es']?.specsLabel?.[key] 
      || key;
  };

  const getTranslatedSpecVal = (val) => {
    return translations[activeLang]?.specsValue?.[val] 
      || translations['es']?.specsValue?.[val] 
      || val;
  };

  const getTranslatedName = (name) => {
    return translations[activeLang]?.productNames?.[name] 
      || translations['es']?.productNames?.[name] 
      || name;
  };

  const getTranslatedCategory = (catName) => {
    return translations[activeLang]?.categories?.[catName] 
      || translations['es']?.categories?.[catName] 
      || catName;
  };

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-container glass-panel animate-scale-up" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-btn" onClick={onClose}>&times;</button>
        
        <div className="modal-content-grid">
          {/* Imagen del Producto */}
          <div className="modal-image-wrapper">
            {product.image ? (
              <img src={product.image} alt={product.name} className="modal-product-img" />
            ) : (
              <div className="modal-image-placeholder">
                <span style={{ fontSize: '70px' }}>📦</span>
                <span style={{ fontSize: '14px', marginTop: '10px', color: 'var(--text-muted)' }}>{t('noImageAvailable')}</span>
              </div>
            )}
            <span className="modal-category-badge">{getTranslatedCategory(product.category_name)}</span>
          </div>

          {/* Información y especificaciones */}
          <div className="modal-info-column">
            <div>
              <h2 className="modal-product-title">{getTranslatedName(product.name)}</h2>
              
              <div className="modal-price-stock-row">
                <span className="modal-price">{product.price} €</span>
                <span className={`stock-badge ${product.stock > 0 ? 'instock' : 'outstock'}`}>
                  {product.stock > 0 ? t('inStock') : t('outOfStock')}
                </span>
              </div>

              <p className="modal-description">{getTranslatedDesc(product.description)}</p>

              {/* Ficha técnica en tabla */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <>
                  <div className="modal-section-title">{t('specsTitle')}</div>
                  <table className="modal-specs-table">
                    <tbody>
                      {Object.entries(product.specifications).map(([key, val]) => (
                        <tr key={key}>
                          <td className="spec-label">{getTranslatedSpecKey(key)}</td>
                          <td className="spec-value">{getTranslatedSpecVal(val)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </>
              )}

              {/* Dispositivos compatibles */}
              {product.compatible_devices && product.compatible_devices.length > 0 && (
                <>
                  <div className="modal-section-title">{t('compatibleDevices')}</div>
                  <div className="modal-devices-list">
                    {product.compatible_devices.map(device => (
                      <span key={device.id} className="device-tag">
                        📱 {device.brand_name} {device.name}
                      </span>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Acción de compra */}
            <div style={{ marginTop: '30px' }}>
              <button 
                className="btn-primary" 
                style={{ width: '100%', justifyContent: 'center', height: '48px', fontSize: '16px' }}
                onClick={() => {
                  onAddToCart(product);
                  onClose();
                }}
                disabled={product.stock <= 0}
              >
                <span>🛒</span>
                <span>{product.stock > 0 ? t('addToCart') : t('outOfStock')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailsModal;
