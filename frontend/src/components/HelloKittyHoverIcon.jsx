import React from 'react';
import './HelloKittyHoverIcon.css';

export default function HelloKittyHoverIcon({ 
  size = '36px', 
  className = '', 
  style = {}, 
  onClick, 
  onMouseEnter,
  onMouseLeave,
  title = "" 
}) {
  return (
    <div 
      className={`hello-kitty-hover-container ${className}`}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      {...(title ? { title } : {})}
      style={{
        width: size,
        height: size,
        ...style
      }}
    >
      {/* Estado 1: Rosario / Cordón de Hello Kitty Transparente Original */}
      <img 
        src="/static/assets/icons/hello-kitty-lanyard.png" 
        alt="Rosario Hello Kitty" 
        className="hk-icon-state hk-icon-charm" 
      />
      {/* Estado 2: Móvil Completo con Rosario Galáctico */}
      <img 
        src="/static/assets/icons/hello-kitty-mobile.png" 
        alt="Móvil con Rosario Hello Kitty" 
        className="hk-icon-state hk-icon-mobile" 
      />
    </div>
  );
}

