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

// Unregister Service Workers during development to prevent Vite caching errors
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (let registration of registrations) {
      registration.unregister();
      console.log('[ServiceWorker] Unregistered existing service worker to fix white screen bug.');
    }
  });
}
