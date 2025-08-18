import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Buffer } from 'buffer';
import App from './App.tsx';
import './index.css';

// Polyfill for Node.js globals in browser environment
if (typeof global === 'undefined') {
  (window as any).global = window;
}

// Buffer polyfill
if (typeof (window as any).Buffer === 'undefined') {
  (window as any).Buffer = Buffer;
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
