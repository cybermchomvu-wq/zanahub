import { useState } from 'react';
import { ArrowLeft, Download, Palette, Type, Shapes, Image as ImageIcon } from 'lucide-react';
import './LogoMaker.css';

const symbols = [
  {
    "name": "Business 1",
    "category": "Business",
    "glyph": "🏢"
  },
  {
    "name": "Business 2",
    "category": "Business",
    "glyph": "💼"
  },
  {
    "name": "Business 3",
    "category": "Business",
    "glyph": "📊"
  },
  {
    "name": "Business 4",
    "category": "Business",
    "glyph": "🏦"
  },
  {
    "name": "Business 5",
    "category": "Business",
    "glyph": "🤝"
  },
  {
    "name": "Business 6",
    "category": "Business",
    "glyph": "📈"
  },
  {
    "name": "Business 7",
    "category": "Business",
    "glyph": "🗂️"
  },
  {
    "name": "Business 8",
    "category": "Business",
    "glyph": "🏭"
  },
  {
    "name": "Business 9",
    "category": "Business",
    "glyph": "🧾"
  },
  {
    "name": "Business 10",
    "category": "Business",
    "glyph": "💹"
  },
  {
    "name": "Business 11",
    "category": "Business",
    "glyph": "🏬"
  },
  {
    "name": "Business 12",
    "category": "Business",
    "glyph": "🖇️"
  },
  {
    "name": "Business 13",
    "category": "Business",
    "glyph": "📁"
  },
  {
    "name": "Technology 1",
    "category": "Technology",
    "glyph": "💻"
  },
  {
    "name": "Technology 2",
    "category": "Technology",
    "glyph": "🖥️"
  },
  {
    "name": "Technology 3",
    "category": "Technology",
    "glyph": "📱"
  },
  {
    "name": "Technology 4",
    "category": "Technology",
    "glyph": "⚙️"
  },
  {
    "name": "Technology 5",
    "category": "Technology",
    "glyph": "🤖"
  },
  {
    "name": "Technology 6",
    "category": "Technology",
    "glyph": "🧠"
  },
  {
    "name": "Technology 7",
    "category": "Technology",
    "glyph": "💡"
  },
  {
    "name": "Technology 8",
    "category": "Technology",
    "glyph": "🔌"
  },
  {
    "name": "Technology 9",
    "category": "Technology",
    "glyph": "🛜"
  },
  {
    "name": "Technology 10",
    "category": "Technology",
    "glyph": "⌨️"
  },
  {
    "name": "Technology 11",
    "category": "Technology",
    "glyph": "🖱️"
  },
  {
    "name": "Technology 12",
    "category": "Technology",
    "glyph": "🔋"
  },
  {
    "name": "Technology 13",
    "category": "Technology",
    "glyph": "🛰️"
  },
  {
    "name": "Luxury 1",
    "category": "Luxury",
    "glyph": "👑"
  },
  {
    "name": "Luxury 2",
    "category": "Luxury",
    "glyph": "💎"
  },
  {
    "name": "Luxury 3",
    "category": "Luxury",
    "glyph": "🏆"
  },
  {
    "name": "Luxury 4",
    "category": "Luxury",
    "glyph": "✨"
  },
  {
    "name": "Luxury 5",
    "category": "Luxury",
    "glyph": "♛"
  },
  {
    "name": "Luxury 6",
    "category": "Luxury",
    "glyph": "🔱"
  },
  {
    "name": "Luxury 7",
    "category": "Luxury",
    "glyph": "💠"
  },
  {
    "name": "Luxury 8",
    "category": "Luxury",
    "glyph": "🌟"
  },
  {
    "name": "Luxury 9",
    "category": "Luxury",
    "glyph": "🪙"
  },
  {
    "name": "Luxury 10",
    "category": "Luxury",
    "glyph": "🥇"
  },
  {
    "name": "Luxury 11",
    "category": "Luxury",
    "glyph": "🦚"
  },
  {
    "name": "Luxury 12",
    "category": "Luxury",
    "glyph": "🏵️"
  },
  {
    "name": "Nature 1",
    "category": "Nature",
    "glyph": "🌿"
  },
  {
    "name": "Nature 2",
    "category": "Nature",
    "glyph": "🌳"
  },
  {
    "name": "Nature 3",
    "category": "Nature",
    "glyph": "🌱"
  },
  {
    "name": "Nature 4",
    "category": "Nature",
    "glyph": "🌻"
  },
  {
    "name": "Nature 5",
    "category": "Nature",
    "glyph": "🌸"
  },
  {
    "name": "Nature 6",
    "category": "Nature",
    "glyph": "🍃"
  },
  {
    "name": "Nature 7",
    "category": "Nature",
    "glyph": "🌞"
  },
  {
    "name": "Nature 8",
    "category": "Nature",
    "glyph": "🌙"
  },
  {
    "name": "Nature 9",
    "category": "Nature",
    "glyph": "⛰️"
  },
  {
    "name": "Nature 10",
    "category": "Nature",
    "glyph": "🌊"
  },
  {
    "name": "Nature 11",
    "category": "Nature",
    "glyph": "🌵"
  },
  {
    "name": "Nature 12",
    "category": "Nature",
    "glyph": "🍀"
  },
  {
    "name": "Nature 13",
    "category": "Nature",
    "glyph": "🌼"
  },
  {
    "name": "Food 1",
    "category": "Food",
    "glyph": "☕"
  },
  {
    "name": "Food 2",
    "category": "Food",
    "glyph": "🍕"
  },
  {
    "name": "Food 3",
    "category": "Food",
    "glyph": "🍔"
  },
  {
    "name": "Food 4",
    "category": "Food",
    "glyph": "🍰"
  },
  {
    "name": "Food 5",
    "category": "Food",
    "glyph": "🧁"
  },
  {
    "name": "Food 6",
    "category": "Food",
    "glyph": "🍓"
  },
  {
    "name": "Food 7",
    "category": "Food",
    "glyph": "🍇"
  },
  {
    "name": "Food 8",
    "category": "Food",
    "glyph": "🥑"
  },
  {
    "name": "Food 9",
    "category": "Food",
    "glyph": "🍜"
  },
  {
    "name": "Food 10",
    "category": "Food",
    "glyph": "🍩"
  },
  {
    "name": "Food 11",
    "category": "Food",
    "glyph": "🍽️"
  },
  {
    "name": "Food 12",
    "category": "Food",
    "glyph": "🥐"
  },
  {
    "name": "Food 13",
    "category": "Food",
    "glyph": "🍵"
  },
  {
    "name": "Fashion 1",
    "category": "Fashion",
    "glyph": "👗"
  },
  {
    "name": "Fashion 2",
    "category": "Fashion",
    "glyph": "👠"
  },
  {
    "name": "Fashion 3",
    "category": "Fashion",
    "glyph": "👜"
  },
  {
    "name": "Fashion 4",
    "category": "Fashion",
    "glyph": "👑"
  },
  {
    "name": "Fashion 5",
    "category": "Fashion",
    "glyph": "💄"
  },
  {
    "name": "Fashion 6",
    "category": "Fashion",
    "glyph": "🦋"
  },
  {
    "name": "Fashion 7",
    "category": "Fashion",
    "glyph": "🌹"
  },
  {
    "name": "Fashion 8",
    "category": "Fashion",
    "glyph": "💅"
  },
  {
    "name": "Fashion 9",
    "category": "Fashion",
    "glyph": "👒"
  },
  {
    "name": "Fashion 10",
    "category": "Fashion",
    "glyph": "🕶️"
  },
  {
    "name": "Fashion 11",
    "category": "Fashion",
    "glyph": "💍"
  },
  {
    "name": "Fashion 12",
    "category": "Fashion",
    "glyph": "🪡"
  },
  {
    "name": "Sports 1",
    "category": "Sports",
    "glyph": "⚽"
  },
  {
    "name": "Sports 2",
    "category": "Sports",
    "glyph": "🏀"
  },
  {
    "name": "Sports 3",
    "category": "Sports",
    "glyph": "🏈"
  },
  {
    "name": "Sports 4",
    "category": "Sports",
    "glyph": "🎾"
  },
  {
    "name": "Sports 5",
    "category": "Sports",
    "glyph": "🏐"
  },
  {
    "name": "Sports 6",
    "category": "Sports",
    "glyph": "🏓"
  },
  {
    "name": "Sports 7",
    "category": "Sports",
    "glyph": "🥊"
  },
  {
    "name": "Sports 8",
    "category": "Sports",
    "glyph": "🏋️"
  },
  {
    "name": "Sports 9",
    "category": "Sports",
    "glyph": "🏅"
  },
  {
    "name": "Sports 10",
    "category": "Sports",
    "glyph": "🏁"
  },
  {
    "name": "Sports 11",
    "category": "Sports",
    "glyph": "🎯"
  },
  {
    "name": "Sports 12",
    "category": "Sports",
    "glyph": "🏆"
  },
  {
    "name": "Sports 13",
    "category": "Sports",
    "glyph": "🚴"
  },
  {
    "name": "Education 1",
    "category": "Education",
    "glyph": "📚"
  },
  {
    "name": "Education 2",
    "category": "Education",
    "glyph": "🎓"
  },
  {
    "name": "Education 3",
    "category": "Education",
    "glyph": "✏️"
  },
  {
    "name": "Education 4",
    "category": "Education",
    "glyph": "📝"
  },
  {
    "name": "Education 5",
    "category": "Education",
    "glyph": "🔬"
  },
  {
    "name": "Education 6",
    "category": "Education",
    "glyph": "🔭"
  },
  {
    "name": "Education 7",
    "category": "Education",
    "glyph": "🧪"
  },
  {
    "name": "Education 8",
    "category": "Education",
    "glyph": "📐"
  },
  {
    "name": "Education 9",
    "category": "Education",
    "glyph": "🧮"
  },
  {
    "name": "Education 10",
    "category": "Education",
    "glyph": "📖"
  },
  {
    "name": "Education 11",
    "category": "Education",
    "glyph": "🧑‍🎓"
  },
  {
    "name": "Education 12",
    "category": "Education",
    "glyph": "💡"
  },
  {
    "name": "Travel 1",
    "category": "Travel",
    "glyph": "✈️"
  },
  {
    "name": "Travel 2",
    "category": "Travel",
    "glyph": "🚀"
  },
  {
    "name": "Travel 3",
    "category": "Travel",
    "glyph": "🚗"
  },
  {
    "name": "Travel 4",
    "category": "Travel",
    "glyph": "🚲"
  },
  {
    "name": "Travel 5",
    "category": "Travel",
    "glyph": "🚢"
  },
  {
    "name": "Travel 6",
    "category": "Travel",
    "glyph": "🗺️"
  },
  {
    "name": "Travel 7",
    "category": "Travel",
    "glyph": "🧭"
  },
  {
    "name": "Travel 8",
    "category": "Travel",
    "glyph": "🏕️"
  },
  {
    "name": "Travel 9",
    "category": "Travel",
    "glyph": "🏝️"
  },
  {
    "name": "Travel 10",
    "category": "Travel",
    "glyph": "🏔️"
  },
  {
    "name": "Travel 11",
    "category": "Travel",
    "glyph": "🌍"
  },
  {
    "name": "Travel 12",
    "category": "Travel",
    "glyph": "🚁"
  },
  {
    "name": "Security 1",
    "category": "Security",
    "glyph": "🛡️"
  },
  {
    "name": "Security 2",
    "category": "Security",
    "glyph": "🔒"
  },
  {
    "name": "Security 3",
    "category": "Security",
    "glyph": "🔑"
  },
  {
    "name": "Security 4",
    "category": "Security",
    "glyph": "🔐"
  },
  {
    "name": "Security 5",
    "category": "Security",
    "glyph": "⚔️"
  },
  {
    "name": "Security 6",
    "category": "Security",
    "glyph": "🦅"
  },
  {
    "name": "Security 7",
    "category": "Security",
    "glyph": "🛡️"
  },
  {
    "name": "Security 8",
    "category": "Security",
    "glyph": "🚨"
  },
  {
    "name": "Security 9",
    "category": "Security",
    "glyph": "🕵️"
  },
  {
    "name": "Security 10",
    "category": "Security",
    "glyph": "🧿"
  },
  {
    "name": "Security 11",
    "category": "Security",
    "glyph": "🏰"
  },
  {
    "name": "Security 12",
    "category": "Security",
    "glyph": "⚖️"
  },
  {
    "name": "Creative 1",
    "category": "Creative",
    "glyph": "🎨"
  },
  {
    "name": "Creative 2",
    "category": "Creative",
    "glyph": "🎬"
  },
  {
    "name": "Creative 3",
    "category": "Creative",
    "glyph": "📷"
  },
  {
    "name": "Creative 4",
    "category": "Creative",
    "glyph": "🎭"
  },
  {
    "name": "Creative 5",
    "category": "Creative",
    "glyph": "🎵"
  },
  {
    "name": "Creative 6",
    "category": "Creative",
    "glyph": "🎤"
  },
  {
    "name": "Creative 7",
    "category": "Creative",
    "glyph": "🎧"
  },
  {
    "name": "Creative 8",
    "category": "Creative",
    "glyph": "🖌️"
  },
  {
    "name": "Creative 9",
    "category": "Creative",
    "glyph": "🪄"
  },
  {
    "name": "Creative 10",
    "category": "Creative",
    "glyph": "✂️"
  },
  {
    "name": "Creative 11",
    "category": "Creative",
    "glyph": "🧩"
  },
  {
    "name": "Creative 12",
    "category": "Creative",
    "glyph": "🖼️"
  },
  {
    "name": "Creative 13",
    "category": "Creative",
    "glyph": "🎹"
  },
  {
    "name": "Community 1",
    "category": "Community",
    "glyph": "❤️"
  },
  {
    "name": "Community 2",
    "category": "Community",
    "glyph": "🫶"
  },
  {
    "name": "Community 3",
    "category": "Community",
    "glyph": "👥"
  },
  {
    "name": "Community 4",
    "category": "Community",
    "glyph": "🤝"
  },
  {
    "name": "Community 5",
    "category": "Community",
    "glyph": "💬"
  },
  {
    "name": "Community 6",
    "category": "Community",
    "glyph": "🌈"
  },
  {
    "name": "Community 7",
    "category": "Community",
    "glyph": "🕊️"
  },
  {
    "name": "Community 8",
    "category": "Community",
    "glyph": "🏡"
  },
  {
    "name": "Community 9",
    "category": "Community",
    "glyph": "🌟"
  },
  {
    "name": "Community 10",
    "category": "Community",
    "glyph": "👐"
  },
  {
    "name": "Community 11",
    "category": "Community",
    "glyph": "💞"
  },
  {
    "name": "Community 12",
    "category": "Community",
    "glyph": "😊"
  }
];

export default function LogoMaker({ onBack }) {
  const [brand, setBrand] = useState('YOUR BRAND');
  const [tagline, setTagline] = useState('MAKE IT MEMORABLE');
  const [symbol, setSymbol] = useState(0);
  const [symbolSearch, setSymbolSearch] = useState('');
  const [symbolCategory, setSymbolCategory] = useState('All');
  const [layout, setLayout] = useState('stacked');
  const [primary, setPrimary] = useState('#7C3AED');
  const [accent, setAccent] = useState('#F59E0B');
  const [background, setBackground] = useState('#FFFFFF');
  const [textColor, setTextColor] = useState('#171717');
  const [showTagline, setShowTagline] = useState(true);

  const safeBrand = brand.trim() || 'YOUR BRAND';
  const safeTagline = tagline.trim();

  function createSvg() {
    const horizontal = layout === 'horizontal';
    const iconX = horizontal ? 26 : 150;
    const iconY = horizontal ? 50 : 24;
    const iconSize = horizontal ? 62 : 72;
    const brandY = horizontal ? 72 : 135;
    const taglineY = horizontal ? 94 : 163;
    const textX = horizontal ? 105 : 186;
    const anchor = horizontal ? 'start' : 'middle';
    const brandSize = Math.max(15, Math.min(brand.length > 18 ? 21 : 29, 360 / Math.max(brand.length, 1) * 1.6));

    return `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="220" viewBox="0 0 600 220">
      <rect width="600" height="220" rx="18" fill="${background}"/>
      <g transform="translate(${iconX} ${iconY}) scale(${iconSize / 100})">
        <path d="${symbols[symbol].path}" fill="${primary}"/>
        <path d="M50 28 L69 50 L50 72 L31 50 Z" fill="${accent}"/>
      </g>
      <text x="${textX}" y="${brandY}" fill="${textColor}" font-family="Arial, Helvetica, sans-serif" font-size="${brandSize}" font-weight="800" text-anchor="${anchor}" letter-spacing="1">${escapeXml(safeBrand)}</text>
      ${showTagline && safeTagline ? `<text x="${textX}" y="${taglineY}" fill="${primary}" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="600" text-anchor="${anchor}" letter-spacing="2">${escapeXml(safeTagline)}</text>` : ''}
    </svg>`;
  }

  function escapeXml(value) {
    return value.replace(/[<>&'"]/g, (char) => ({
      '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;',
    })[char]);
  }

  function downloadSvg() {
    const blob = new Blob([createSvg()], { type: 'image/svg+xml;charset=utf-8' });
    saveBlob(blob, `${fileName()}.svg`);
  }

  function downloadPng() {
    const svgBlob = new Blob([createSvg()], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 440;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = background;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => {
        if (blob) saveBlob(blob, `${fileName()}.png`);
      }, 'image/png');
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      alert('Could not create the PNG. Please try downloading SVG instead.');
    };

    image.src = url;
  }

  function fileName() {
    return (brand.trim() || 'zanahub-logo')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') || 'zanahub-logo';
  }

  function saveBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <div className="logo-maker">
      <div className="logo-maker-heading">
        <button className="lm-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <div>
          <span className="lm-eyebrow">GRAPHIC DESIGN STUDIO</span>
          <h1>Logo Maker <span>✦</span></h1>
          <p>Build a memorable identity for your brand.</p>
        </div>
      </div>

      <div className="lm-workspace">
        <section className="lm-controls">
          <div className="lm-section-title"><Type size={18} /> Brand details</div>

          <label className="lm-label">
            Brand name
            <input value={brand} maxLength={35} onChange={(e) => setBrand(e.target.value)} placeholder="Your brand name" />
          </label>

          <label className="lm-label">
            Tagline
            <input value={tagline} maxLength={45} onChange={(e) => setTagline(e.target.value)} placeholder="Your brand slogan" />
          </label>

          <label className="lm-checkbox">
            <input type="checkbox" checked={showTagline} onChange={(e) => setShowTagline(e.target.checked)} />
            Show tagline
          </label>

          <div className="lm-divider" />

          <div className="lm-section-title"><Shapes size={18} /> Logo symbol</div>
          <input
            className="lm-symbol-search"
            value={symbolSearch}
            onChange={(e) => setSymbolSearch(e.target.value)}
            placeholder="Search symbols..."
            aria-label="Search logo symbols"
          />
          <select
            className="lm-symbol-category"
            value={symbolCategory}
            onChange={(e) => setSymbolCategory(e.target.value)}
            aria-label="Filter symbol category"
          >
            {['All', ...new Set(symbols.map((item) => item.category))].map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <p className="lm-symbol-count">
            {symbols.filter((item) =>
              (symbolCategory === 'All' || item.category === symbolCategory) &&
              item.name.toLowerCase().includes(symbolSearch.toLowerCase())
            ).length} symbols available
          </p>
          <div className="lm-symbols">
            {symbols.map((item, index) => ({ item, index })).filter(({ item }) =>
              (symbolCategory === 'All' || item.category === symbolCategory) &&
              item.name.toLowerCase().includes(symbolSearch.toLowerCase())
            ).map(({ item, index }) => (
              <button
                key={item.name}
                className={`lm-symbol ${symbol === index ? 'selected' : ''}`}
                onClick={() => setSymbol(index)}
                title={item.name}
                aria-label={item.name}
              >
                <svg viewBox="0 0 100 100" aria-hidden="true">
                  <text
                    x="50"
                    y="55"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="58"
                  >
                    {item.glyph}
                  </text>
                </svg>
                <span>{item.glyph} {item.name}</span>
              </button>
            ))}
          </div>

          <div className="lm-divider" />

          <div className="lm-section-title"><Palette size={18} /> Colors</div>
          <label className="lm-color-row">
            <span>Primary</span>
            <input type="color" value={primary} onChange={(e) => setPrimary(e.target.value)} />
            <code>{primary.toUpperCase()}</code>
          </label>
          <label className="lm-color-row">
            <span>Accent</span>
            <input type="color" value={accent} onChange={(e) => setAccent(e.target.value)} />
            <code>{accent.toUpperCase()}</code>
          </label>
          <label className="lm-color-row">
            <span>Background</span>
            <input type="color" value={background} onChange={(e) => setBackground(e.target.value)} />
            <code>{background.toUpperCase()}</code>
          </label>
          <label className="lm-color-row">
            <span>Text</span>
            <input type="color" value={textColor} onChange={(e) => setTextColor(e.target.value)} />
            <code>{textColor.toUpperCase()}</code>
          </label>

          <div className="lm-divider" />

          <div className="lm-section-title"><ImageIcon size={18} /> Layout</div>
          <div className="lm-layouts">
            <button className={layout === 'stacked' ? 'selected' : ''} onClick={() => setLayout('stacked')}>
              <span className="lm-stacked-icon">◆<small>BRAND</small></span>
              Stacked
            </button>
            <button className={layout === 'horizontal' ? 'selected' : ''} onClick={() => setLayout('horizontal')}>
              <span className="lm-horizontal-icon">◆<small>BRAND</small></span>
              Horizontal
            </button>
          </div>
        </section>

        <section className="lm-preview-panel">
          <div className="lm-preview-header">
            <div>
              <span className="lm-eyebrow">LIVE PREVIEW</span>
              <h2>Your logo</h2>
            </div>
            <span className="lm-live-dot">● Live</span>
          </div>

          <div className="lm-canvas">
            <div className="lm-logo-preview" style={{ background }}>
              <svg viewBox="0 0 600 220" role="img" aria-label={`${safeBrand} logo preview`}>
                <g transform={`translate(${layout === 'horizontal' ? 26 : 150} ${layout === 'horizontal' ? 50 : 24}) scale(${(layout === 'horizontal' ? 62 : 72) / 100})`}>
                  <text
                    x="50"
                    y="52"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="68"
                  >
                    {symbols[symbol].glyph}
                  </text>
                </g>
                <text
                  x={layout === 'horizontal' ? 105 : 186}
                  y={layout === 'horizontal' ? 72 : 135}
                  fill={textColor}
                  fontFamily="Arial, Helvetica, sans-serif"
                  fontSize={Math.max(15, Math.min(brand.length > 18 ? 21 : 29, 360 / Math.max(brand.length, 1) * 1.6))}
                  fontWeight="800"
                  textAnchor={layout === 'horizontal' ? 'start' : 'middle'}
                  letterSpacing="1"
                >
                  {safeBrand}
                </text>
                {showTagline && safeTagline && (
                  <text
                    x={layout === 'horizontal' ? 105 : 186}
                    y={layout === 'horizontal' ? 94 : 163}
                    fill={primary}
                    fontFamily="Arial, Helvetica, sans-serif"
                    fontSize="12"
                    fontWeight="600"
                    textAnchor={layout === 'horizontal' ? 'start' : 'middle'}
                    letterSpacing="2"
                  >
                    {safeTagline}
                  </text>
                )}
              </svg>
            </div>
          </div>

          <div className="lm-preview-note">Your design updates automatically as you edit.</div>

          <div className="lm-downloads">
            <button className="lm-download-primary" onClick={downloadPng}>
              <Download size={18} /> Download PNG
            </button>
            <button className="lm-download-secondary" onClick={downloadSvg}>
              <Download size={18} /> Download SVG
            </button>
          </div>

          <div className="lm-tip">
            <span>✦</span>
            <div><strong>Design tip</strong><p>Keep your logo simple and choose colors that fit your brand's personality.</p></div>
          </div>
        </section>
      </div>
    </div>
  );
}
