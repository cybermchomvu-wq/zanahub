import { useMemo, useState } from 'react';
import './ProfitCalculator.css';

const money = (value) =>
  new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);

export default function ProfitCalculator({ onBack }) {
  const [costPrice, setCostPrice] = useState('5000');
  const [sellingPrice, setSellingPrice] = useState('8000');
  const [quantity, setQuantity] = useState('10');
  const [extraExpenses, setExtraExpenses] = useState('0');

  const results = useMemo(() => {
    const cost = Math.max(0, Number(costPrice) || 0);
    const selling = Math.max(0, Number(sellingPrice) || 0);
    const qty = Math.max(0, Math.floor(Number(quantity) || 0));
    const extras = Math.max(0, Number(extraExpenses) || 0);

    const revenue = selling * qty;
    const productCost = cost * qty;
    const expenses = productCost + extras;
    const profit = revenue - expenses;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const markup = productCost > 0 ? (profit / productCost) * 100 : 0;

    return {
      revenue,
      productCost,
      expenses,
      profit,
      margin,
      markup,
      profitPerItem: selling - cost,
      quantity: qty,
    };
  }, [costPrice, sellingPrice, quantity, extraExpenses]);

  const updateNumber = (setter, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) setter(value);
  };

  const reset = () => {
    setCostPrice('0');
    setSellingPrice('0');
    setQuantity('1');
    setExtraExpenses('0');
  };

  return (
    <main className="profit-calculator">
      <header className="profit-header">
        <div>
          <div className="profit-eyebrow">ZANAHUB • BUSINESS TOOLS</div>
          <h1>Profit Calculator</h1>
          <p>Calculate your revenue, expenses, and business profit.</p>
        </div>
        {onBack && (
          <button className="profit-back" onClick={onBack}>
            ← Back to tools
          </button>
        )}
      </header>

      <section className="profit-summary">
        <div className="profit-main-result">
          <span>Net profit / loss</span>
          <strong className={results.profit < 0 ? 'loss-text' : ''}>
            {money(results.profit)}
          </strong>
          <small>
            {results.profit > 0
              ? 'Your business is making a profit.'
              : results.profit < 0
                ? 'Your expenses exceed your revenue.'
                : 'Your business is breaking even.'}
          </small>
        </div>

        <div className="profit-stat">
          <span>Total revenue</span>
          <strong>{money(results.revenue)}</strong>
        </div>

        <div className="profit-stat">
          <span>Total expenses</span>
          <strong>{money(results.expenses)}</strong>
        </div>
      </section>

      <section className="profit-content">
        <div className="profit-panel">
          <div className="profit-panel-heading">
            <div>
              <h2>Product details</h2>
              <p>Enter your prices and sales information.</p>
            </div>
            <button className="profit-reset" onClick={reset}>Reset</button>
          </div>

          <label className="profit-field">
            <span>Cost price per item (TZS)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={costPrice}
              onChange={(e) => updateNumber(setCostPrice, e.target.value)}
              placeholder="e.g. 5000"
            />
          </label>

          <label className="profit-field">
            <span>Selling price per item (TZS)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={sellingPrice}
              onChange={(e) => updateNumber(setSellingPrice, e.target.value)}
              placeholder="e.g. 8000"
            />
          </label>

          <label className="profit-field">
            <span>Quantity sold</span>
            <input
              type="number"
              min="0"
              step="1"
              value={quantity}
              onChange={(e) => updateNumber(setQuantity, e.target.value)}
              placeholder="e.g. 10"
            />
          </label>

          <label className="profit-field">
            <span>Additional expenses (TZS)</span>
            <input
              type="number"
              min="0"
              step="any"
              value={extraExpenses}
              onChange={(e) => updateNumber(setExtraExpenses, e.target.value)}
              placeholder="Transport, packaging, etc."
            />
          </label>

          <div className="profit-hint">
            💡 Additional expenses are included once in the total, not per item.
          </div>
        </div>

        <div className="profit-panel">
          <h2>Profit breakdown</h2>
          <p className="profit-subtitle">Your calculated business results.</p>

          <div className="profit-row">
            <span>Profit per item before extra expenses</span>
            <strong>{money(results.profitPerItem)}</strong>
          </div>

          <div className="profit-row">
            <span>Product purchase cost</span>
            <strong>{money(results.productCost)}</strong>
          </div>

          <div className="profit-row">
            <span>Additional expenses</span>
            <strong>{money(Math.max(0, Number(extraExpenses) || 0))}</strong>
          </div>

          <div className="profit-row">
            <span>Profit margin</span>
            <strong>{results.margin.toFixed(2)}%</strong>
          </div>

          <div className="profit-row">
            <span>Markup on product cost</span>
            <strong>{results.markup.toFixed(2)}%</strong>
          </div>

          <div className="profit-formula">
            <strong>How it is calculated</strong>
            <p>Revenue = selling price × quantity sold</p>
            <p>Net profit = revenue − all expenses</p>
            <p>Profit margin = net profit ÷ revenue × 100</p>
          </div>
        </div>
      </section>
    </main>
  );
}
