import React from 'react'
import ReactDOM from 'react-dom/client'
import CompatibilityAssistant from './components/CompatibilityAssistant'
import CartDrawer from './components/CartDrawer'
import './index.css'

const assistantRoot = document.getElementById('react-compatibility-assistant')
if (assistantRoot) {
  ReactDOM.createRoot(assistantRoot).render(
    <React.StrictMode>
      <CompatibilityAssistant />
    </React.StrictMode>
  )
}

const cartRoot = document.getElementById('react-cart-container')
if (cartRoot) {
  ReactDOM.createRoot(cartRoot).render(
    <React.StrictMode>
      <CartDrawer />
    </React.StrictMode>
  )
}

