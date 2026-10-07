import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { UserProvider } from './context/UserContext';
import { ToastProvider } from './context/ToastContext';
import { wakeServer } from './services/api';
import './styles/base.css';
import './styles/components.css';
import './styles/layout.css';
import './styles/pages.css';

/*
 * Provider tree (Context API):
 *   ToastProvider  → notifications anywhere in the app
 *   AuthProvider   → who is logged in (JWT session)
 *   UserProvider   → that user's health profile & metrics
 *   (DietProvider is mounted inside AppLayout for the signed-in pages)
 */
wakeServer();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <UserProvider>
            <App />
          </UserProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  </StrictMode>
);
