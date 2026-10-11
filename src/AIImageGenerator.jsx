import { useState } from 'react';
import {
  ArrowLeft,
  Download,
  ImagePlus,
  LoaderCircle,
  Sparkles,
  WandSparkles,
  X,
} from 'lucide-react';
import './AIImageGenerator.css';

const styles = [
  'Realistic',
  'Anime',
  'Digital Art',
  '3D Render',
  'Watercolor',
  'Futuristic',
];

const ratios = [
  { label: 'Square', value: '1:1', symbol: '□' },
  { label: 'Landscape', value: '16:9', symbol: '▭' },
  { label: 'Portrait', value: '9:16', symbol: '▯' },
  { label: 'Classic', value: '4:3', symbol: '▱' },
  { label: 'Tall', value: '3:4', symbol: '▯' },
];

const examples = [
  'A futuristic African city at sunset, glowing lights and flying cars',
  'A majestic lion standing on a rocky hill in the Serengeti',
  'A magical purple galaxy with stars and colourful nebulae',
];

export default function AIImageGenerator({ onBack }) {
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('Realistic');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [image, setImage] = useState('');
  const [imageMimeType, setImageMimeType] = useState('image/png');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  const [imageDescription, setImageDescription] = useState('');

  async function generateImage(event) {
    event.preventDefault();

    if (!prompt.trim()) {
      setError('Please describe the image you want to create.');
      return;
    }

    if (prompt.trim().length > 1000) {
      setError('Keep your image description under 1,000 characters.');
      return;
    }

    setGenerating(true);
    setError('');
    setImage('');

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`}/api/ai/image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zanahub_token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: `${style} style. ${prompt.trim()}`,
          aspectRatio,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'Image generation failed. Please try again.',
        );
      }

      if (!data.image) {
        throw new Error('No image was returned. Please try again.');
      }

      setImageMimeType(data.mimeType || 'image/png');
      setImage(`data:${data.mimeType || 'image/png'};base64,${data.image}`);
      setImageDescription(prompt.trim());
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the AI server. Make sure the backend is running.',
      );
    } finally {
      setGenerating(false);
    }
  }

  function downloadImage() {
    if (!image) return;

    const link = document.createElement('a');
    link.href = image;
    link.download = `zanahub-ai-image.${imageMimeType.split('/')[1] || 'png'}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function clearImage() {
    setImage('');
    setError('');
    setImageDescription('');
  }

  return (
    <section className="ai-image-page">
      <button className="ai-image-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to tools
      </button>

      <div className="ai-image-heading">
        <div className="ai-image-heading-icon">
          <WandSparkles size={27} />
        </div>
        <div>
          <div className="ai-image-eyebrow">
            <Sparkles size={13} /> POWERED BY AI
          </div>
          <h1>AI Image Generator</h1>
          <p>Turn your imagination into something you can see.</p>
        </div>
      </div>

      <div className="ai-image-layout">
        <form className="ai-image-panel" onSubmit={generateImage}>
          <div className="ai-image-section-title">
            <ImagePlus size={19} />
            <h2>Describe your vision</h2>
          </div>

          <label className="ai-image-label" htmlFor="image-prompt">
            What would you like to create?
          </label>

          <textarea
            id="image-prompt"
            className="ai-image-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder="Describe your image in detail. For example: A futuristic Zanzibar waterfront at sunset, glowing purple lights, cinematic atmosphere..."
            maxLength={1000}
            rows={6}
            disabled={generating}
          />

          <div className="ai-image-prompt-footer">
            <span>Be descriptive for better results</span>
            <span>{prompt.length}/1000</span>
          </div>

          <div className="ai-image-examples">
            <span className="ai-image-label">Need inspiration?</span>
            {examples.map((example) => (
              <button
                type="button"
                key={example}
                className="ai-image-example"
                onClick={() => setPrompt(example)}
                disabled={generating}
              >
                <Sparkles size={13} />
                {example}
              </button>
            ))}
          </div>

          <div className="ai-image-divider" />

          <label className="ai-image-label">Choose an art style</label>
          <div className="ai-image-styles">
            {styles.map((item) => (
              <button
                key={item}
                type="button"
                className={`ai-image-style ${style === item ? 'selected' : ''}`}
                onClick={() => setStyle(item)}
                disabled={generating}
                aria-pressed={style === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="ai-image-divider" />

          <label className="ai-image-label">Image proportions</label>
          <div className="ai-image-ratios">
            {ratios.map((ratio) => (
              <button
                type="button"
                key={ratio.value}
                className={`ai-image-ratio ${
                  aspectRatio === ratio.value ? 'selected' : ''
                }`}
                onClick={() => setAspectRatio(ratio.value)}
                disabled={generating}
                aria-pressed={aspectRatio === ratio.value}
              >
                <span className="ai-image-ratio-symbol">{ratio.symbol}</span>
                <span>{ratio.label}</span>
              </button>
            ))}
          </div>

          {error && (
            <div className="ai-image-error" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="ai-image-generate"
            disabled={generating || !prompt.trim()}
          >
            {generating ? (
              <>
                <LoaderCircle size={19} className="ai-image-spinner" />
                Creating your image...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Generate Image
              </>
            )}
          </button>

          <p className="ai-image-note">
            Image generation may use paid API credits.
          </p>
        </form>

        <div className="ai-image-preview-panel">
          <div className="ai-image-preview-header">
            <div>
              <h2>Your creation</h2>
              <p>Your generated image will appear here.</p>
            </div>
            {image && (
              <button
                className="ai-image-clear"
                type="button"
                onClick={clearImage}
                aria-label="Clear generated image"
                title="Clear image"
              >
                <X size={18} />
              </button>
            )}
          </div>

          <div
            className={`ai-image-canvas ${
              image ? 'has-image' : ''
            } ratio-${aspectRatio.replace(':', '-')}`}
          >
            {image ? (
              <img
                src={image}
                alt={imageDescription || 'AI-generated artwork'}
                className="ai-image-result"
              />
            ) : generating ? (
              <div className="ai-image-loading">
                <div className="ai-image-loading-icon">
                  <LoaderCircle size={37} className="ai-image-spinner" />
                </div>
                <h3>Bringing your idea to life</h3>
                <p>This can take a little while. Keep this page open.</p>
                <div className="ai-image-loading-bar">
                  <span />
                </div>
              </div>
            ) : (
              <div className="ai-image-empty">
                <div className="ai-image-empty-art">
                  <div className="ai-image-empty-orbit orbit-a" />
                  <div className="ai-image-empty-orbit orbit-b" />
                  <Sparkles size={45} />
                </div>
                <h3>Your next masterpiece starts here</h3>
                <p>
                  Write a prompt, select your preferred style, and generate
                  your first image.
                </p>
              </div>
            )}
          </div>

          {image && (
            <div className="ai-image-result-footer">
              <div className="ai-image-result-info">
                <span className="ai-image-result-dot" />
                <div>
                  <strong>Image generated</strong>
                  <p>{style} · {aspectRatio}</p>
                </div>
              </div>
              <button
                type="button"
                className="ai-image-download"
                onClick={downloadImage}
              >
                <Download size={17} />
                Download
              </button>
            </div>
          )}

          <div className="ai-image-preview-footnote">
            <Sparkles size={14} />
            Created with ZanaHub AI
          </div>
        </div>
      </div>
    </section>
  );
}
