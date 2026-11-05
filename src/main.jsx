import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import './index.css';
import App from './App.jsx';
import AuthPanel from './AuthPanel.jsx';
import NativeWelcome from './NativeWelcome.jsx';

function hasSavedSession() {
  try {
    const token = localStorage.getItem('zanahub_token');
    const user = JSON.parse(localStorage.getItem('zanahub_user') || 'null');
    return Boolean(token && user && user.id);
  } catch {
    return false;
  }
}

function AppStartup() {
  const isNative = Capacitor.isNativePlatform();
  const [showWelcome, setShowWelcome] = useState(isNative);
  const [authenticated, setAuthenticated] = useState(
    () => !isNative || hasSavedSession()
  );

  useEffect(() => {
    if (!isNative) return undefined;

    const timer = window.setTimeout(() => {
      setShowWelcome(false);
    }, 5000);

    return () => window.clearTimeout(timer);
  }, [isNative]);

  useEffect(() => {
    if (!isNative) return undefined;

    function syncAuthentication() {
      setAuthenticated(hasSavedSession());
    }

    window.addEventListener('zanahub-auth-changed', syncAuthentication);
    return () => {
      window.removeEventListener('zanahub-auth-changed', syncAuthentication);
    };
  }, [isNative]);

  if (isNative && showWelcome) {
    return <NativeWelcome />;
  }

  if (isNative && !authenticated) {
    return <AuthPanel standalone />;
  }

  return <App />;
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppStartup />
  </StrictMode>,
);
