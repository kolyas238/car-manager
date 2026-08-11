import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import 'normalize.css'; // до наших стилей — он выравнивает дефолты браузеров
import './styles/global.scss';
import App from './App.jsx';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);