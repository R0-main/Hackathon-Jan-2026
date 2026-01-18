import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { I18nProvider } from './i18n.tsx'
import './index.css'
import App from './App.tsx'

// Keep backend alive by pinging every 5 minutes
const BACKEND_URL = import.meta.env.VITE_API_URL || 'https://hackathon-jan-2026-backend.onrender.com';
const keepBackendAlive = () => {
  fetch(`${BACKEND_URL}/api/hello`).catch(() => {});
};
keepBackendAlive();
setInterval(keepBackendAlive, 5 * 60 * 1000);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <App />
    </I18nProvider>
  </StrictMode>,
)
