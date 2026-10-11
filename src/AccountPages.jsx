import { useState } from 'react';
import { ArrowLeft, ArrowUpRight, Crown } from 'lucide-react';

export function AccountDashboard({
  currentUser,
  accountDetails,
  subscription,
  loading,
  error,
  onBack,
  onUpgrade,
}) {
  const account = accountDetails || currentUser || {};
  const isPro = subscription?.plan === 'pro';

  const joined = account.created_at
    ? new Date(account.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Not available';

  return (
    <section className="account-dashboard">
      <button className="dashboard-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to tools
      </button>

      <div className="dashboard-heading">
        <span className="dashboard-eyebrow">ZANAHUB ACCOUNT</span>
        <h1>My Workspace</h1>
        <p>Manage your account and membership.</p>
      </div>

      <div className="account-profile-card">
        <div className="account-profile-avatar">
          {(account.name || account.email || 'U').charAt(0).toUpperCase()}
        </div>
        <div className="account-profile-copy">
          <h2>{account.name || 'ZanaHub user'}</h2>
          <p>{account.email || 'Email unavailable'}</p>
        </div>
        <span className={`plan-pill ${isPro ? 'plan-pill-pro' : ''}`}>
          {loading ? 'Checking…' : `${isPro ? 'Pro' : 'Free'} Plan`}
        </span>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="dashboard-info-grid">
        <article className="dashboard-info-card">
          <span className="dashboard-card-label">CURRENT PLAN</span>
          <h3>{loading ? 'Checking…' : isPro ? 'ZanaHub Pro' : 'Free'}</h3>
          <p>
            {isPro
              ? 'Your account has an active Pro subscription.'
              : 'You are currently using the Free plan.'}
          </p>
        </article>

        <article className="dashboard-info-card">
          <span className="dashboard-card-label">MEMBER SINCE</span>
          <h3>{joined}</h3>
          <p>Your account creation date.</p>
        </article>
      </div>

      {isPro && subscription?.expiresAt && (
        <p className="subscription-date">
          Subscription expires:{' '}
          {new Date(subscription.expiresAt).toLocaleDateString()}
        </p>
      )}

      <div className="dashboard-upgrade-card">
        <div className="dashboard-upgrade-icon"><Crown size={25} /></div>
        <div>
          <h2>{isPro ? 'Welcome to ZanaHub Pro!' : 'Unlock more with Pro'}</h2>
          <p>
            {isPro
              ? 'Your membership is verified by the server.'
              : 'Explore premium tools for TSh 1,000 per month.'}
          </p>
        </div>
        {!isPro && (
          <button onClick={onUpgrade}>
            Explore Pro <ArrowUpRight size={16} />
          </button>
        )}
      </div>
    </section>
  );
}

export function ProDashboard({ subscription, loading, error, onBack }) {
  const isPro = subscription?.plan === 'pro';
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutMessage, setCheckoutMessage] = useState('');
  const [phone, setPhone] = useState('');

  async function startProCheckout() {
    const token = localStorage.getItem('zanahub_token');
    const enteredPhone = phone.trim().replace(/[()\s-]/g, '');
    let normalizedPhone = enteredPhone;

    if (normalizedPhone.startsWith('0')) {
      normalizedPhone = `+255${normalizedPhone.slice(1)}`;
    } else if (normalizedPhone.startsWith('255')) {
      normalizedPhone = `+${normalizedPhone}`;
    } else if (/^[67]\d{8}$/.test(normalizedPhone)) {
      normalizedPhone = `+255${normalizedPhone}`;
    }

    if (!/^\+255[67]\d{8}$/.test(normalizedPhone)) {
      setCheckoutMessage(
        'Enter a valid Tanzanian mobile number, for example 0712 345 678.'
      );
      return;
    }

    if (!token) {
      setCheckoutMessage('Please sign in before starting checkout.');
      return;
    }

    setCheckoutLoading(true);
    setCheckoutMessage('');

    try {
      const apiBase =
        `${window.location.protocol}//${window.location.hostname}:3001`;

      const response = await fetch(`${apiBase}/api/payments/checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phone: normalizedPhone }),      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Checkout is currently unavailable.');
      }

      setCheckoutMessage(
        'Checkout request received. Follow the provider instructions to continue.'
      );
    } catch (checkoutError) {
      setCheckoutMessage(
        checkoutError.message || 'Could not connect to the payment service.'
      );
    } finally {
      setCheckoutLoading(false);
    }
  }

  return (
    <section className="account-dashboard">
      <button className="dashboard-back" onClick={onBack}>
        <ArrowLeft size={16} /> Back to tools
      </button>

      <div className="pro-hero-card">
        <div className="dashboard-eyebrow"><Crown size={15} /> ZANAHUB PRO</div>
        <h1>{isPro ? 'You are on Pro.' : 'More possibilities. Less limits.'}</h1>
        <p>Get more from your all-in-one digital toolbox.</p>

        <div className="pro-price">
          TSh 1,000 <span>/ month</span>
        </div>

        <p className="pro-status-line">
          {loading
            ? 'Checking your membership…'
            : isPro
              ? 'Your account has an active Pro subscription.'
              : 'Your current plan is Free.'}
        </p>
      </div>

      {error && <p className="dashboard-error">{error}</p>}

      <div className="dashboard-info-grid">
        <article className="dashboard-info-card">
          <span className="dashboard-card-label">YOUR PLAN</span>
          <h3>{loading ? 'Checking…' : isPro ? 'Pro' : 'Free'}</h3>
          <p>Your plan is checked against the ZanaHub backend.</p>
        </article>

        <article className="dashboard-info-card">
          <span className="dashboard-card-label">PAYMENT STATUS</span>
          <h3>{isPro ? 'Active' : 'Not subscribed'}</h3>
          <p>
            {isPro
              ? 'Your active membership was confirmed by the server.'
              : 'Checkout is not active yet. No payment has been taken.'}
          </p>
        </article>
      </div>

      {!isPro && (
        <div className="checkout-notice">
          <strong>Secure payments are being prepared.</strong>
          <p>
            Pro costs TSh 1,000 per month. Premium will only activate after
            the payment provider confirms your payment on our server.
            Checkout is currently disabled, and this button will not charge you.
          </p>
          <label className="checkout-phone-label" htmlFor="pro-checkout-phone">
            Tanzanian mobile number
          </label>
          <input
            id="pro-checkout-phone"
            className="checkout-phone-input"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder="0712 345 678 or +255 712 345 678"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            aria-describedby="checkout-phone-help"
          />
          <small id="checkout-phone-help" className="checkout-phone-help">
            Used to prepare mobile-money checkout. Card details, if supported,
            are entered only on Selcom's hosted page.
          </small>
          <button
            type="button"
            className="checkout-start-button"
            onClick={startProCheckout}
            disabled={checkoutLoading || loading}
          >
            {checkoutLoading ? 'Checking checkout…' : 'Start Pro checkout'}
          </button>
          {checkoutMessage && (
            <p className="checkout-response" role="status" aria-live="polite">
              {checkoutMessage}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
