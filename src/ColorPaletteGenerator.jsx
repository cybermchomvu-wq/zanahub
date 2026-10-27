import { useState } from 'react';
import {
  ArrowLeft,
  Palette,
  Lock,
  Unlock,
  Copy,
  Check,
  Shuffle,
  Sparkles,
  Clipboard,
} from 'lucide-react';
import './ColorPaletteGenerator.css';

const INITIAL_COLORS = ['#7C3AED', '#4F46E5', '#0891B2', '#10B981', '#F59E0B'];

function randomColor() {
  return '#' + Math.floor(Math.random() * 16777216)
    .toString(16)
    .padStart(6, '0')
    .toUpperCase();
}

function readableText(hex) {
  const value = hex.replace('#', '');
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 145 ? '#111827' : '#FFFFFF';
}

export default function ColorPaletteGenerator({ onBack }) {
  const [colors, setColors] = useState(INITIAL_COLORS);
  const [locked, setLocked] = useState([false, false, false, false, false]);
  const [copied, setCopied] = useState('');

  function generatePalette() {
    setColors(current =>
      current.map((color, index) =>
        locked[index] ? color : randomColor()
      )
    );
    setCopied('');
  }

  function updateColor(index, value) {
    setColors(current =>
      current.map((color, i) => i === index ? value.toUpperCase() : color)
    );
    setCopied('');
  }

  function toggleLock(index) {
    setLocked(current =>
      current.map((value, i) => i === index ? !value : value)
    );
  }

  async function copyText(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      window.setTimeout(() => setCopied(''), 1800);
    } catch {
      setCopied('error');
      window.setTimeout(() => setCopied(''), 2500);
    }
  }

  const paletteText = colors.join(', ');

  return (
    <main className="palette-page">
      <button type="button" className="palette-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to tools
      </button>

      <header className="palette-header">
        <div className="palette-logo">
          <Palette size={29} />
        </div>
        <div>
          <span className="palette-eyebrow">ZANAHUB DESIGN STUDIO</span>
          <h1>Color Palette Generator</h1>
          <p>Create beautiful color combinations for websites, logos, and designs.</p>
        </div>
      </header>

      <section className="palette-toolbar">
        <div>
          <h2><Sparkles size={19} /> Your color palette</h2>
          <p>Generate colors, lock your favorites, and customize each shade.</p>
        </div>

        <button
          type="button"
          className="palette-generate"
          onClick={generatePalette}
        >
          <Shuffle size={17} />
          Generate palette
        </button>
      </section>

      <section className="palette-swatches" aria-label="Generated color palette">
        {colors.map((color, index) => (
          <article className="palette-swatch" key={index}>
            <div
              className="palette-color-preview"
              style={{ backgroundColor: color, color: readableText(color) }}
            >
              <span className="palette-color-number">{String(index + 1).padStart(2, '0')}</span>

              <button
                type="button"
                className="palette-lock"
                style={{ color: readableText(color) }}
                onClick={() => toggleLock(index)}
                aria-label={locked[index] ? `Unlock color ${index + 1}` : `Lock color ${index + 1}`}
                title={locked[index] ? 'Unlock color' : 'Lock color'}
              >
                {locked[index] ? <Lock size={17} /> : <Unlock size={17} />}
              </button>

              <button
                type="button"
                className="palette-big-copy"
                style={{ color: readableText(color) }}
                onClick={() => copyText(color, `color-${index}`)}
                aria-label={`Copy ${color}`}
                title="Copy HEX code"
              >
                {copied === `color-${index}` ? <Check size={22} /> : <Copy size={22} />}
              </button>
            </div>

            <div className="palette-color-info">
              <label htmlFor={`palette-hex-${index}`}>HEX COLOR</label>
              <div className="palette-hex-row">
                <input
                  id={`palette-hex-${index}`}
                  value={color}
                  onChange={event => {
                    const value = event.target.value;
                    if (/^#[0-9a-fA-F]{6}$/.test(value)) {
                      updateColor(index, value);
                    } else if (value.length <= 7) {
                      setColors(current =>
                        current.map((c, i) => i === index ? value.toUpperCase() : c)
                      );
                    }
                  }}
                  onBlur={() => {
                    if (!/^#[0-9a-fA-F]{6}$/.test(colors[index])) {
                      updateColor(index, INITIAL_COLORS[index]);
                    }
                  }}
                  maxLength={7}
                  spellCheck={false}
                  aria-label={`HEX code for color ${index + 1}`}
                />
                <input
                  type="color"
                  className="palette-color-picker"
                  value={/^#[0-9a-fA-F]{6}$/.test(color) ? color : INITIAL_COLORS[index]}
                  onChange={event => updateColor(index, event.target.value)}
                  aria-label={`Choose color ${index + 1}`}
                />
              </div>

              <button
                type="button"
                className="palette-copy-code"
                onClick={() => copyText(color, `color-${index}`)}
              >
                {copied === `color-${index}` ? <Check size={14} /> : <Copy size={14} />}
                {copied === `color-${index}` ? 'Copied!' : 'Copy HEX'}
              </button>
            </div>
          </article>
        ))}
      </section>

      <section className="palette-preview-section">
        <div className="palette-section-heading">
          <div>
            <h2>Live design preview</h2>
            <p>See how your palette could look in a real interface.</p>
          </div>
        </div>

        <div className="palette-mockup">
          <div
            className="palette-mockup-banner"
            style={{ background: `linear-gradient(120deg, ${colors[0]}, ${colors[1]})` }}
          >
            <span>YOUR BRAND</span>
            <h3>Make something beautiful.</h3>
            <p>Great design starts with great colors.</p>
            <button
              type="button"
              style={{ backgroundColor: colors[4], color: readableText(colors[4]) }}
            >
              Explore more
            </button>
          </div>

          <div className="palette-mockup-cards">
            {colors.slice(0, 3).map((color, index) => (
              <div className="palette-mini-card" key={index}>
                <div style={{ backgroundColor: color }} />
                <span>Color {index + 1}</span>
                <strong>{color}</strong>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="palette-export">
        <div>
          <h2><Clipboard size={19} /> Export your palette</h2>
          <p>Copy all five HEX codes to use in your next project.</p>
          <code>{paletteText}</code>
        </div>
        <button
          type="button"
          className="palette-export-button"
          onClick={() => copyText(paletteText, 'all')}
        >
          {copied === 'all' ? <Check size={17} /> : <Copy size={17} />}
          {copied === 'all' ? 'Copied all!' : 'Copy all colors'}
        </button>
      </section>

      {copied === 'error' && (
        <p className="palette-copy-error" role="status">
          Copy failed. Check your browser permissions and try again.
        </p>
      )}

      <p className="palette-disclaimer">
        Tip: Lock colors you like before generating a new palette. Locked colors stay unchanged.
      </p>
    </main>
  );
}
