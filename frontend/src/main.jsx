if (import.meta.env.PROD) {
  window.console.log = () => {};
  window.console.info = () => {};
  window.console.debug = () => {};
}

import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Register Service Worker for caching and offline support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((reg) => {
        console.log('[ServiceWorker] Registration successful with scope: ', reg.scope);
      })
      .catch((err) => {
        console.warn('[ServiceWorker] Registration failed: ', err);
      });
  });
}
