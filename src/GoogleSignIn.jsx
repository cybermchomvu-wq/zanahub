import { useEffect, useRef, useState } from 'react';

const API_BASE =
  `${window.location.protocol}//${window.location.hostname}:3001`;

export default function GoogleSignIn() {
  const buttonRef = useRef(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function handleGoogleCredential(response) {
      if (cancelled || !response?.credential) return;

      setError('');
      setLoading(true);

      try {
        const result = await fetch(`${API_BASE}/api/auth/google`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ credential: response.credential }),
        });

        const data = await result.json();

        if (!result.ok) {
          throw new Error(data.error || 'Google sign-in failed.');
        }

        if (!data.token || !data.user) {
          throw new Error('The server returned an invalid login response.');
        }

        localStorage.setItem('zanahub_token', data.token);
        localStorage.setItem('zanahub_user', JSON.stringify(data.user));

        window.dispatchEvent(new Event('zanahub-auth-changed'));
      } catch (err) {
        setError(
          err.message || 'Unable to sign in. Please try again.',
        );
      } finally {
        setLoading(false);
      }
    }

    function renderGoogleButton() {
      if (
        cancelled ||
        !buttonRef.current ||
        !window.google?.accounts?.id
      ) {
        return false;
      }

      const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

      if (!clientId) {
        setError('Google Client ID is missing from the frontend .env file.');
        return true;
      }

      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredential,
      });

      buttonRef.current.replaceChildren();

      window.google.accounts.id.renderButton(buttonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'signin_with',
        shape: 'pill',
        width: 240,
      });

      return true;
    }

    function loadGoogleScript() {
      if (renderGoogleButton()) return;

      let script = document.querySelector(
        'script[data-zanahub-google="true"]',
      );

      if (!script) {
        script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        script.dataset.zanahubGoogle = 'true';

        script.onerror = () => {
          if (!cancelled) {
            setError('Could not load Google Sign-In. Check your internet connection.');
          }
        };

        document.head.appendChild(script);
      }

      timer = window.setInterval(() => {
        if (renderGoogleButton()) {
          window.clearInterval(timer);
        }
      }, 200);

      window.setTimeout(() => {
        if (!cancelled && !window.google?.accounts?.id) {
          setError('Google Sign-In is taking too long to load. Please refresh.');
        }
      }, 15000);
    }

    loadGoogleScript();

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  return (
    <div className="google-signin">
      <div ref={buttonRef} />

      {loading && (
        <p className="google-signin-message">Signing you in…</p>
      )}

      {error && (
        <p className="google-signin-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
