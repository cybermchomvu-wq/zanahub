import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  ArrowDownUp,
  RefreshCw,
  TrendingUp,
  Clock3,
  CircleDollarSign,
  AlertCircle,
} from 'lucide-react';
import './CurrencyExchange.css';

const API = 'https://api.exchangerate.fun/latest?base=';

const CURRENCIES = [
  ['TZS', 'Tanzanian Shilling', '🇹🇿'],
  ['USD', 'US Dollar', '🇺🇸'],
  ['EUR', 'Euro', '🇪🇺'],
  ['GBP', 'British Pound', '🇬🇧'],
  ['KES', 'Kenyan Shilling', '🇰🇪'],
  ['UGX', 'Ugandan Shilling', '🇺🇬'],
  ['RWF', 'Rwandan Franc', '🇷🇼'],
  ['ZAR', 'South African Rand', '🇿🇦'],
  ['NGN', 'Nigerian Naira', '🇳🇬'],
  ['GHS', 'Ghanaian Cedi', '🇬🇭'],
  ['ETB', 'Ethiopian Birr', '🇪🇹'],
  ['EGP', 'Egyptian Pound', '🇪🇬'],
  ['AED', 'UAE Dirham', '🇦🇪'],
  ['SAR', 'Saudi Riyal', '🇸🇦'],
  ['INR', 'Indian Rupee', '🇮🇳'],
  ['CNY', 'Chinese Yuan', '🇨🇳'],
  ['JPY', 'Japanese Yen', '🇯🇵'],
  ['AUD', 'Australian Dollar', '🇦🇺'],
  ['CAD', 'Canadian Dollar', '🇨🇦'],
  ['CHF', 'Swiss Franc', '🇨🇭'],
  ['SGD', 'Singapore Dollar', '🇸🇬'],
  ['HKD', 'Hong Kong Dollar', '🇭🇰'],
  ['BRL', 'Brazilian Real', '🇧🇷'],
  ['PKR', 'Pakistani Rupee', '🇵🇰'],
  ['NGN', 'Nigerian Naira', '🇳🇬'],
  ['KRW', 'South Korean Won', '🇰🇷'],
  ['THB', 'Thai Baht', '🇹🇭'],
  ['TRY', 'Turkish Lira', '🇹🇷'],
  ['SEK', 'Swedish Krona', '🇸🇪'],
  ['NZD', 'New Zealand Dollar', '🇳🇿'],
];

const currencyInfo = (code) =>
  CURRENCIES.find(([currency]) => currency === code) ||
  [code, code, '🌐'];

function formatAmount(amount, currency) {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      maximumFractionDigits: 4,
    }).format(amount);
  } catch {
    return `${amount.toLocaleString()} ${currency}`;
  }
}

export default function CurrencyExchange({ onBack }) {
  const [amount, setAmount] = useState('1');
  const [from, setFrom] = useState('USD');
  const [to, setTo] = useState('TZS');
  const [rates, setRates] = useState({});
  const [rateDate, setRateDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState('');

  const loadRates = useCallback(async (base, force = false) => {
    const cacheKey = `zanahub-fx-${base}`;

    if (!force) {
      try {
        const cached = JSON.parse(localStorage.getItem(cacheKey) || 'null');
        if (
          cached &&
          cached.rates &&
          cached.savedAt &&
          Date.now() - cached.savedAt < 60 * 60 * 1000
        ) {
          setRates(cached.rates);
          setRateDate(cached.date || '');
          setLastUpdated(new Date(cached.savedAt).toLocaleString());
          setError('');
          return;
        }
      } catch {
        // Ignore an invalid local cache and fetch fresh data.
      }
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`${API}${encodeURIComponent(base)}`);

      if (!response.ok) {
        throw new Error(`Exchange-rate service returned ${response.status}.`);
      }

      const data = await response.json();

      if (!data.rates || typeof data.rates !== 'object') {
        throw new Error('The exchange-rate service returned an unexpected response.');
      }

      const normalizedRates = {};
      for (const [code, value] of Object.entries(data.rates)) {
        const rate = Number(value);
        if (Number.isFinite(rate) && rate > 0) {
          normalizedRates[code.toUpperCase()] = rate;
        }
      }

      normalizedRates[base] = 1;

      if (!Object.keys(normalizedRates).length) {
        throw new Error('No exchange rates were returned.');
      }

      const savedAt = Date.now();
      setRates(normalizedRates);
      setRateDate(data.date || '');
      setLastUpdated(new Date(savedAt).toLocaleString());

      try {
        localStorage.setItem(
          cacheKey,
          JSON.stringify({
            rates: normalizedRates,
            date: data.date || '',
            savedAt,
          }),
        );
      } catch {
        // Conversion can still work if browser storage is unavailable.
      }
    } catch (err) {
      setError(
        err.message ||
          'Could not load exchange rates. Check your internet connection.',
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRates(from);
  }, [from, loadRates]);

  const fromRate = from === to ? 1 : Number(rates[to]);
  const numericAmount = Number(amount);
  const validAmount = amount.trim() !== '' &&
    Number.isFinite(numericAmount) && numericAmount >= 0;
  const converted = validAmount && Number.isFinite(fromRate)
    ? numericAmount * fromRate
    : null;

  function swapCurrencies() {
    setFrom(to);
    setTo(from);
  }

  return (
    <section className="fx-page">
      <header className="fx-header">
        <button className="fx-back" type="button" onClick={onBack}>
          <ArrowLeft size={18} />
          Back to tools
        </button>

        <div className="fx-title">
          <div className="fx-title-icon">
            <CircleDollarSign size={25} />
          </div>
          <div>
            <h1>Currency Exchange</h1>
            <p>Convert money between currencies around the world.</p>
          </div>
        </div>

        <button
          type="button"
          className="fx-refresh"
          onClick={() => loadRates(from, true)}
          disabled={loading}
        >
          <RefreshCw size={16} className={loading ? 'fx-spinning' : ''} />
          Refresh rates
        </button>
      </header>

      <div className="fx-main-grid">
        <main className="fx-converter-card">
          <div className="fx-section-heading">
            <span className="fx-section-icon"><ArrowDownUp size={18} /></span>
            <div>
              <h2>Currency converter</h2>
              <p>Choose currencies and enter an amount.</p>
            </div>
          </div>

          <label className="fx-amount-label" htmlFor="fx-amount">
            Amount to convert
          </label>
          <input
            id="fx-amount"
            className="fx-amount-input"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="Enter an amount"
          />

          <div className="fx-currency-row">
            <label className="fx-currency-field">
              <span>From</span>
              <div className="fx-currency-select-wrap">
                <span className="fx-flag">{currencyInfo(from)[2]}</span>
                <select value={from} onChange={(event) => setFrom(event.target.value)}>
                  {[...CURRENCIES]
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([code, name]) => (
                      <option key={code} value={code}>{code} — {name}</option>
                    ))}
                </select>
              </div>
            </label>

            <button
              className="fx-swap-button"
              type="button"
              onClick={swapCurrencies}
              title="Swap currencies"
              aria-label="Swap currencies"
            >
              <ArrowDownUp size={19} />
            </button>

            <label className="fx-currency-field">
              <span>To</span>
              <div className="fx-currency-select-wrap">
                <span className="fx-flag">{currencyInfo(to)[2]}</span>
                <select value={to} onChange={(event) => setTo(event.target.value)}>
                  {[...CURRENCIES]
                    .sort((a, b) => a[0].localeCompare(b[0]))
                    .map(([code, name]) => (
                      <option key={code} value={code}>{code} — {name}</option>
                    ))}
                </select>
              </div>
            </label>
          </div>

          {error && (
            <div className="fx-error" role="alert">
              <AlertCircle size={17} />
              <span>{error}</span>
              <button type="button" onClick={() => loadRates(from, true)}>
                Retry
              </button>
            </div>
          )}

          <div className="fx-result">
            <span className="fx-result-label">CONVERTED AMOUNT</span>

            {loading && !rates[to] && from !== to ? (
              <p className="fx-result-number fx-loading-text">Loading exchange rate...</p>
            ) : converted !== null && (from === to || Number.isFinite(fromRate)) ? (
              <>
                <p className="fx-result-number">{formatAmount(converted, to)}</p>
                <p className="fx-result-description">
                  {formatAmount(numericAmount, from)} equals
                </p>
              </>
            ) : (
              <p className="fx-result-number">Rate unavailable</p>
            )}

            {from === to && (
              <p className="fx-result-description">Both currencies are the same.</p>
            )}
          </div>

          <div className="fx-rate-info">
            <TrendingUp size={17} />
            <div>
              <strong>Exchange rate</strong>
              <p>
                {fromRate > 0 && Number.isFinite(fromRate)
                  ? `1 ${from} = ${fromRate.toLocaleString('en', {
                      maximumFractionDigits: 6,
                    })} ${to}`
                  : 'Waiting for exchange rate'}
              </p>
            </div>
          </div>
        </main>

        <aside className="fx-info-column">
          <div className="fx-info-card">
            <div className="fx-info-icon"><Clock3 size={21} /></div>
            <h3>Exchange rate information</h3>
            <p>Rates are retrieved online and cached locally for up to one hour.</p>
            <div className="fx-info-divider" />
            <span className="fx-small-label">RATE DATA DATE</span>
            <strong>{rateDate || 'Not available yet'}</strong>
            <span className="fx-small-label">LAST FETCHED</span>
            <strong>{lastUpdated || 'Waiting for rates'}</strong>
            <span className="fx-status">
              <i className={error ? 'fx-status-error' : ''} />
              {error ? 'Rate unavailable' : loading ? 'Updating rates' : 'Exchange converter'}
            </span>
          </div>

          <div className="fx-info-card fx-popular-card">
            <h3>Popular currencies</h3>
            <p>Quickly select a common currency pair.</p>
            {[
              ['USD', 'TZS'],
              ['EUR', 'TZS'],
              ['GBP', 'TZS'],
              ['KES', 'TZS'],
              ['USD', 'EUR'],
              ['USD', 'GBP'],
            ].map(([base, quote]) => (
              <button
                type="button"
                className="fx-popular-pair"
                key={`${base}-${quote}`}
                onClick={() => {
                  setFrom(base);
                  setTo(quote);
                }}
              >
                <span>{currencyInfo(base)[2]} {base}</span>
                <ArrowDownUp size={14} />
                <span>{currencyInfo(quote)[2]} {quote}</span>
              </button>
            ))}
          </div>
        </aside>
      </div>

      <p className="fx-disclaimer">
        Exchange rates are indicative reference rates, not guaranteed bank or
        money-transfer prices. Fees and provider rates may differ.
      </p>

      <p className="fx-attribution">
        Exchange-rate data provided by{' '}
        <a href="https://www.exchangerate.fun/docs/" target="_blank" rel="noreferrer">
          ExchangeRate.fun
        </a>.
      </p>
    </section>
  );
}
