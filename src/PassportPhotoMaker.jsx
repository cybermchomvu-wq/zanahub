import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Download, ImagePlus, RotateCcw } from 'lucide-react';
import './PassportPhotoMaker.css';

const SIZES = {
  '35 × 45 mm': [413, 531],
  '2 × 2 inches': [600, 600],
  '40 × 50 mm': [472, 591],
  'Custom': [600, 600],
};

export default function PassportPhotoMaker({ onBack }) {
  const [source, setSource] = useState('');
  const [size, setSize] = useState('35 × 45 mm');
  const [width, setWidth] = useState(413);
  const [height, setHeight] = useState(531);
  const [background, setBackground] = useState('#ffffff');
  const [format, setFormat] = useState('image/jpeg');
  const [zoom, setZoom] = useState(1);
  const [offsetX, setOffsetX] = useState(0);
  const [offsetY, setOffsetY] = useState(0);
  const [error, setError] = useState('');
  const canvasRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    if (!source) return;
    const img = new window.Image();
    img.onload = () => {
      imageRef.current = img;
      drawPhoto(img);
    };
    img.onerror = () => setError('Could not load this image. Try another file.');
    img.src = source;
    return () => {
      img.onload = null;
    };
  }, [source]);

  useEffect(() => {
    if (imageRef.current) drawPhoto(imageRef.current);
  }, [size, width, height, background, zoom, offsetX, offsetY]);

  function getDimensions() {
    return size === 'Custom'
      ? [Math.max(50, Math.min(3000, Number(width) || 600)),
         Math.max(50, Math.min(3000, Number(height) || 600))]
      : SIZES[size];
  }

  function drawPhoto(img) {
    const canvas = canvasRef.current;
    if (!canvas || !img) return;

    const [w, h] = getDimensions();
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext('2d');
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, w, h);

    const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * zoom;
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const x = (w - drawW) / 2 + offsetX * w / 100;
    const y = (h - drawH) / 2 + offsetY * h / 100;

    ctx.drawImage(img, x, y, drawW, drawH);
  }

  function uploadImage(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    if (file.size > 20 * 1024 * 1024) {
      setError('Please choose an image smaller than 20 MB.');
      return;
    }

    setError('');
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);

    const reader = new FileReader();
    reader.onload = () => setSource(reader.result);
    reader.readAsDataURL(file);
    event.target.value = '';
  }

  function downloadPhoto() {
    const canvas = canvasRef.current;
    if (!canvas || !imageRef.current) return;

    const mime = format;
    const output = canvas.toDataURL(mime, 0.95);
    const link = document.createElement('a');
    link.href = output;
    link.download = `passport-photo.${mime === 'image/png' ? 'png' : 'jpg'}`;
    link.click();
  }

  function resetAdjustments() {
    setZoom(1);
    setOffsetX(0);
    setOffsetY(0);
    setBackground('#ffffff');
    setSize('35 × 45 mm');
    setWidth(413);
    setHeight(531);
  }

  return (
    <main className="passport-tool">
      <button className="passport-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to tools
      </button>

      <header className="passport-heading">
        <span className="passport-icon"><ImagePlus size={25} /></span>
        <div>
          <h1>Passport Photo Maker</h1>
          <p>Prepare passport and ID-style photos right in your browser.</p>
        </div>
      </header>

      <div className="passport-layout">
        <section className="passport-panel">
          <label className="passport-upload">
            <ImagePlus size={24} />
            <strong>{source ? 'Choose another photo' : 'Upload your photo'}</strong>
            <span>JPG, PNG or WebP · Maximum 20 MB</span>
            <input type="file" accept="image/*" onChange={uploadImage} />
          </label>

          <label className="passport-label" htmlFor="passport-size">Photo size</label>
          <select
            id="passport-size"
            value={size}
            onChange={(e) => {
              const value = e.target.value;
              setSize(value);
              if (value !== 'Custom') {
                setWidth(SIZES[value][0]);
                setHeight(SIZES[value][1]);
              }
            }}
          >
            {Object.keys(SIZES).map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>

          {size === 'Custom' && (
            <div className="passport-dimensions">
              <label>Width (px)
                <input type="number" min="50" max="3000" value={width}
                  onChange={(e) => setWidth(e.target.value)} />
              </label>
              <label>Height (px)
                <input type="number" min="50" max="3000" value={height}
                  onChange={(e) => setHeight(e.target.value)} />
              </label>
            </div>
          )}

          <label className="passport-label" htmlFor="passport-zoom">
            Zoom: {Number(zoom).toFixed(1)}×
          </label>
          <input id="passport-zoom" type="range" min="1" max="3" step="0.1"
            value={zoom} onChange={(e) => setZoom(Number(e.target.value))} />

          <label className="passport-label" htmlFor="passport-x">
            Horizontal position
          </label>
          <input id="passport-x" type="range" min="-40" max="40" value={offsetX}
            onChange={(e) => setOffsetX(Number(e.target.value))} />

          <label className="passport-label" htmlFor="passport-y">
            Vertical position
          </label>
          <input id="passport-y" type="range" min="-40" max="40" value={offsetY}
            onChange={(e) => setOffsetY(Number(e.target.value))} />

          <label className="passport-label" htmlFor="passport-background">
            Background color
          </label>
          <div className="passport-color-row">
            <input id="passport-background" type="color" value={background}
              onChange={(e) => setBackground(e.target.value)} />
            <span>{background.toUpperCase()}</span>
            {['#ffffff', '#d9e8ff', '#e8f5e9', '#d9d9d9'].map((color) => (
              <button key={color} className="passport-swatch"
                style={{ background: color }} title={color}
                onClick={() => setBackground(color)} />
            ))}
          </div>

          <label className="passport-label" htmlFor="passport-format">Download format</label>
          <select id="passport-format" value={format}
            onChange={(e) => setFormat(e.target.value)}>
            <option value="image/jpeg">JPG</option>
            <option value="image/png">PNG</option>
          </select>

          {error && <p className="passport-error">{error}</p>}

          <button className="passport-reset" onClick={resetAdjustments}>
            <RotateCcw size={16} /> Reset adjustments
          </button>
          <button className="passport-download" onClick={downloadPhoto} disabled={!source}>
            <Download size={18} /> Download photo
          </button>
        </section>

        <section className="passport-preview-panel">
          <h2>Photo preview</h2>
          <p>Adjust the framing until your photo looks right.</p>
          <div className="passport-preview">
            {source ? (
              <canvas ref={canvasRef} aria-label="Passport photo preview" />
            ) : (
              <div className="passport-empty">
                <ImagePlus size={42} />
                <span>Your photo will appear here</span>
              </div>
            )}
          </div>
          {source && (
            <p className="passport-output-size">
              Output: {getDimensions()[0]} × {getDimensions()[1]} px
            </p>
          )}
          <div className="passport-note">
            <strong>Important:</strong> Requirements vary by country and document.
            This tool crops and formats photos, but does not automatically remove
            the original background or verify official photo requirements.
            Background colors show through transparent areas only.
          </div>
        </section>
      </div>
    </main>
  );
}
