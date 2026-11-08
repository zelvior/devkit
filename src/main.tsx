import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register PWA Service Worker
if ('serviceWorker' in navigator && !import.meta.env.DEV) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        // Successfully registered
      })
      .catch((err) => {
        // Silently handle if disabled in dev iframe
        console.debug('ServiceWorker registration skipped or unsupported in iframe:', err);
      });
  });
}

createRoot(document.getElementById('root')!).render(<App />);
