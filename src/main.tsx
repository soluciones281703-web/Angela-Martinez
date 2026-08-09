import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Prevent harmless WebSocket HMR disconnect errors from triggering the dev overlay
window.addEventListener('unhandledrejection', (event) => {
  const reasonMsg = event.reason?.message || String(event.reason || '');
  if (reasonMsg.includes('WebSocket') || reasonMsg.includes('vite')) {
    event.preventDefault();
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

