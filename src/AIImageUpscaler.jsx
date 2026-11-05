import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Upload,
  Sparkles,
  CheckCircle2,
  LoaderCircle,
  RefreshCw,
  Maximize2,
  ShieldCheck,
} from 'lucide-react';
import './AIImageUpscaler.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_OUTPUT_PIXELS = 16_000_000;

export default function AIImageUpscaler({ onBack }) {
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const originalUrlRef = useRef('');
  const resultUrlRef = useRef('');

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [originalDimensions, setOriginalDimensions] = useState(null);
  const [resultDimensions, setResultDimensions] = useState(null);
  const [scale, setScale] = useState(2);
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(92);
  const [resultSize, setResultSize] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [previewMode, setPreviewMode] = useState('result');

  useEffect(() => {
    return () => {
      if (originalUrlRef.current) URL.revokeObjectURL(originalUrlRef.current);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, []);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
    }

    setResultUrl('');
    setResultDimensions(null);
    setResultSize(0);
    setNotice('');
    setPreviewMode('result');
  }

  function loadFile(selectedFile) {
    if (!selectedFile) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Please choose a JPG, PNG or WebP image.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('The image is larger than 20 MB. Please choose a smaller image.');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const image = new window.Image();

    image.onload = () => {
      if (originalUrlRef.current) {
        URL.revokeObjectURL(originalUrlRef.current);
      }

      originalUrlRef.current = url;

      setFile(selectedFile);
      setImageUrl(url);
      setOriginalDimensions({
        width: image.naturalWidth,
        height: image.naturalHeight,
      });

      setFormat(
        selectedFile.type === 'image/jpeg'
          ? 'image/jpeg'
          : selectedFile.type === 'image/webp'
            ? 'image/webp'
            : 'image/png'
      );

      setError('');
      clearResult();
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError('This image could not be opened. Try another image.');
    };

    image.src = url;
  }

  async function upscaleImage() {
    if (!file || !imageRef.current || !originalDimensions) {
      setError('Upload an image first.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const sourceWidth = originalDimensions.width;
      const sourceHeight = originalDimensions.height;

      let outputWidth = Math.round(sourceWidth * scale);
      let outputHeight = Math.round(sourceHeight * scale);

      const requestedPixels = outputWidth * outputHeight;
      let limited = false;

      if (requestedPixels > MAX_OUTPUT_PIXELS) {
        const reduction = Math.sqrt(MAX_OUTPUT_PIXELS / requestedPixels);

        outputWidth = Math.max(1, Math.floor(outputWidth * reduction));
        outputHeight = Math.max(1, Math.floor(outputHeight * reduction));
        limited = true;
      }

      const canvas = document.createElement('canvas');
      canvas.width = outputWidth;
      canvas.height = outputHeight;

      const context = canvas.getContext('2d', {
        alpha: format !== 'image/jpeg',
      });

      if (!context) {
        throw new Error('Your browser could not start image processing.');
      }

      context.imageSmoothingEnabled = true;
      context.imageSmoothingQuality = 'high';

      if (format === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, outputWidth, outputHeight);
      }

      context.drawImage(
        imageRef.current,
        0,
        0,
        outputWidth,
        outputHeight
      );

      const blob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (output) => {
            if (output) resolve(output);
            else reject(new Error('Image export failed.'));
          },
          format,
          quality / 100
        );
      });

      clearResult();

      const url = URL.createObjectURL(blob);
      resultUrlRef.current = url;

      setResultUrl(url);
      setResultDimensions({
        width: outputWidth,
        height: outputHeight,
      });
      setResultSize(blob.size);
      setPreviewMode('result');

      setNotice(
        limited
          ? 'Upscaling complete. Output was limited to 16 megapixels to protect browser performance.'
          : `${scale}× enlargement completed successfully!`
      );
    } catch (err) {
      console.error('Image upscaling error:', err);
      setError(err.message || 'Could not upscale this image. Try another file.');
    } finally {
      setBusy(false);
    }
  }

  function resetTool() {
    clearResult();

    if (originalUrlRef.current) {
      URL.revokeObjectURL(originalUrlRef.current);
      originalUrlRef.current = '';
    }

    setFile(null);
    setImageUrl('');
    setOriginalDimensions(null);
    setError('');
    setNotice('');

    if (inputRef.current) inputRef.current.value = '';
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  const extension = format === 'image/jpeg'
    ? 'jpg'
    : format === 'image/webp'
      ? 'webp'
      : 'png';

  const previewUrl = previewMode === 'result' && resultUrl
    ? resultUrl
    : imageUrl;

  const previewDimensions = previewMode === 'result' && resultDimensions
    ? resultDimensions
    : originalDimensions;

  return (
    <section className="upscaler-tool">
      <button className="upscaler-back" onClick={onBack}>
        <ArrowLeft size={18} />
        Back to all tools
      </button>

      <div className="upscaler-heading">
        <div className="upscaler-heading-icon">
          <Maximize2 size={27} />
        </div>
        <div>
          <h1>AI Image Upscaler</h1>
          <p>Enlarge images and improve their displayed clarity.</p>
        </div>
      </div>

      <div className="upscaler-privacy">
        <ShieldCheck size={19} />
        <div>
          <strong>Private processing. No API charges.</strong>
          <span>Your image is processed directly in your browser.</span>
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        hidden
        onChange={(event) => loadFile(event.target.files?.[0])}
      />

      {!file ? (
        <button
          className="upscaler-upload"
          onClick={() => inputRef.current?.click()}
        >
          <div className="upscaler-upload-icon">
            <Upload size={30} />
          </div>
          <strong>Upload an image</strong>
          <span>Choose a JPG, PNG or WebP image from your device.</span>
          <span className="upscaler-upload-small">
            Maximum file size: 20 MB
          </span>
        </button>
      ) : (
        <div className="upscaler-workspace">
          <div className="upscaler-preview">
            <div className="upscaler-preview-header">
              <span>IMAGE PREVIEW</span>
              <button onClick={() => inputRef.current?.click()}>
                <Upload size={14} />
                Change image
              </button>
            </div>

            <div className="upscaler-image-frame">
              <img
                ref={imageRef}
                src={imageUrl}
                alt="Original image"
                className="upscaler-source-image"
              />

              {previewUrl && (
                <img
                  src={previewUrl}
                  alt={previewMode === 'result' ? 'Upscaled result' : 'Original preview'}
                />
              )}
            </div>

            {resultUrl && (
              <div className="upscaler-preview-toggle">
                <button
                  className={previewMode === 'original' ? 'active' : ''}
                  onClick={() => setPreviewMode('original')}
                >
                  Original
                </button>
                <button
                  className={previewMode === 'result' ? 'active' : ''}
                  onClick={() => setPreviewMode('result')}
                >
                  Upscaled
                </button>
              </div>
            )}

            <div className="upscaler-image-meta">
              <span>{file.name}</span>
              <strong>{formatSize(file.size)}</strong>
            </div>

            {previewDimensions && (
              <div className="upscaler-dimensions-info">
                {previewDimensions.width.toLocaleString()} ×{' '}
                {previewDimensions.height.toLocaleString()} pixels
              </div>
            )}
          </div>

          <div className="upscaler-settings">
            <h2>Upscaling settings</h2>
            <p className="upscaler-settings-subtitle">
              Choose how much larger you want your image to become.
            </p>

            <div className="upscaler-scale-options">
              {[2, 4].map((value) => (
                <button
                  key={value}
                  className={scale === value ? 'selected' : ''}
                  onClick={() => {
                    setScale(value);
                    clearResult();
                  }}
                  disabled={busy}
                >
                  <Maximize2 size={20} />
                  <strong>{value}×</strong>
                  <span>{value} times larger</span>
                </button>
              ))}
            </div>

            <label className="upscaler-field">
              Output format
              <select
                value={format}
                onChange={(event) => {
                  setFormat(event.target.value);
                  clearResult();
                }}
                disabled={busy}
              >
                <option value="image/png">PNG</option>
                <option value="image/jpeg">JPG</option>
                <option value="image/webp">WebP</option>
              </select>
            </label>

            <label className="upscaler-field">
              Output quality: {quality}%
              <input
                type="range"
                min="60"
                max="100"
                value={quality}
                onChange={(event) => {
                  setQuality(Number(event.target.value));
                  clearResult();
                }}
                disabled={busy || format === 'image/png'}
              />
            </label>

            <div className="upscaler-info-box">
              <Sparkles size={17} />
              <span>
                High-quality browser interpolation enlarges pixels smoothly.
                It cannot reconstruct missing details like a true AI model.
              </span>
            </div>

            <button
              className="upscaler-process"
              onClick={upscaleImage}
              disabled={busy}
            >
              {busy ? (
                <>
                  <LoaderCircle size={18} className="upscaler-spin" />
                  Processing image...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Upscale image {scale}×
                </>
              )}
            </button>

            {resultUrl && (
              <a
                className="upscaler-download"
                href={resultUrl}
                download={`zanahub-upscaled.${extension}`}
              >
                <Download size={18} />
                Download upscaled image
              </a>
            )}

            {resultUrl && (
              <div className="upscaler-result-info">
                <CheckCircle2 size={17} />
                <div>
                  <strong>
                    {resultDimensions.width.toLocaleString()} ×{' '}
                    {resultDimensions.height.toLocaleString()} pixels
                  </strong>
                  <span>Output size: {formatSize(resultSize)}</span>
                </div>
              </div>
            )}

            <button
              className="upscaler-reset"
              onClick={resetTool}
              disabled={busy}
            >
              <RefreshCw size={15} />
              Start with another image
            </button>
          </div>
        </div>
      )}

      {error && <div className="upscaler-error">{error}</div>}
      {notice && <div className="upscaler-notice">{notice}</div>}
    </section>
  );
}
