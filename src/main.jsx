import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'normalize.css';
import './styles/global.scss';
import App from './App.jsx';

// PWA: регистрируем service worker только в веб-версии (http/https),
// в Electron (file://) он не нужен и не поддерживается
if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .catch((error) => console.error('SW не зарегистрировался:', error));
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);