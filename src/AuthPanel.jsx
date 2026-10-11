import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Eye, EyeOff, ShieldCheck, ArrowRight } from 'lucide-react';
import GoogleSignIn from './GoogleSignIn';

const API_BASE = (
  import.meta.env.VITE_API_URL || 'https://zanahub-api.onrender.com'
).replace(/\/$/, '');

export default function AuthPanel() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function closePanel() {
    if (loading) return;
    setOpen(false);
    setError('');
    setSuccess('');
  }

  function changeMode(nextMode) {
    setMode(nextMode);
    setError('');
    setSuccess('');
    setPassword('');
    setConfirmPassword('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();

    if (mode === 'register' && name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    if (password.length < 8 || password.length > 128) {
      setError('Your password must contain between 8 and 128 characters.');
      return;
    }

    if (mode === 'register' && password !== confirmPassword) {
      setError('Your passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        mode === 'register' ? '/api/auth/register' : '/api/auth/login';

      const payload =
        mode === 'register'
          ? { name: name.trim(), email: cleanEmail, password }
          : { email: cleanEmail, password };

      const response = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Authentication failed. Please try again.');
      }

      if (!data.token || !data.user) {
        throw new Error('The server returned an invalid login response.');
      }

      localStorage.setItem('zanahub_token', data.token);
      localStorage.setItem('zanahub_user', JSON.stringify(data.user));

      setSuccess(
        mode === 'register'
          ? 'Your account has been created!'
          : 'You have signed in successfully!'
      );

      window.dispatchEvent(new Event('zanahub-auth-changed'));
      setPassword('');
      setConfirmPassword('');

      window.setTimeout(() => {
        setOpen(false);
        setSuccess('');
      }, 700);
    } catch (err) {
      setError(err.message || 'Unable to connect. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="auth-open-button"
        onClick={() => {
          setOpen(true);
          setError('');
          setSuccess('');
        }}
      >
        Sign in <ArrowRight size={16} />
      </button>

      {open && createPortal(
        <div
          className="auth-overlay"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePanel();
          }}
        >
          <section
            className="auth-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="auth-title"
          >
            <button
              type="button"
              className="auth-close-button"
              aria-label="Close sign-in window"
              onClick={closePanel}
              disabled={loading}
            >
              <X size={21} />
            </button>

            <div className="auth-brand-mark">Z</div>

            <p className="auth-eyebrow">WELCOME TO ZANAHUB</p>

            <h2 id="auth-title">
              {mode === 'register' ? 'Create your account' : 'Welcome back'}
            </h2>

            <p className="auth-subtitle">
              {mode === 'register'
                ? 'Create your free account and explore your workspace.'
                : 'Sign in to access your personal workspace.'}
            </p>

            {error && (
              <div className="auth-message auth-error" role="alert">
                {error}
              </div>
            )}

            {success && (
              <div className="auth-message auth-success" role="status">
                {success}
              </div>
            )}

            <form className="auth-form" onSubmit={handleSubmit}>
              {mode === 'register' && (
                <label>
                  Full name
                  <input
                    type="text"
                    autoComplete="name"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    minLength={2}
                    maxLength={80}
                    required
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  maxLength={254}
                  required
                />
              </label>

              <label>
                Password
                <span className="auth-password-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete={
                      mode === 'register' ? 'new-password' : 'current-password'
                    }
                    placeholder={
                      mode === 'register'
                        ? 'At least 8 characters'
                        : 'Enter your password'
                    }
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                  />

                  <button
                    type="button"
                    className="auth-eye-button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              {mode === 'register' && (
                <label>
                  Confirm password
                  <input
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter your password again"
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    minLength={8}
                    maxLength={128}
                    required
                  />
                </label>
              )}

              <button
                type="submit"
                className="auth-submit-button"
                disabled={loading}
              >
                {loading
                  ? 'Please wait…'
                  : mode === 'register'
                    ? 'Create free account'
                    : 'Sign in'}
              </button>
            </form>

            <div className="auth-switch">
              {mode === 'register'
                ? 'Already have an account?'
                : "Don't have an account?"}{' '}
              <button
                type="button"
                onClick={() =>
                  changeMode(mode === 'register' ? 'login' : 'register')
                }
                disabled={loading}
              >
                {mode === 'register' ? 'Sign in' : 'Create account'}
              </button>
            </div>

            <div className="auth-divider">
              <span>OR CONTINUE WITH</span>
            </div>

            <div className="auth-google-wrap">
              <GoogleSignIn />
            </div>

            <p className="auth-security-note">
              <ShieldCheck size={15} />
              Your password is securely handled by ZanaHub's server.
            </p>
          </section>
        </div>,
        document.body
      )}
    </>
  );
}
