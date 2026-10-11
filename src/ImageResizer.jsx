import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Upload,
  Lock,
  Unlock,
  RefreshCw,
  CheckCircle2,
  LoaderCircle,
  Maximize2,
} from 'lucide-react';
import './ImageResizer.css';

const MAX_FILE_SIZE = 25 * 1024 * 1024;

export default function ImageResizer({ onBack }) {
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const resultUrlRef = useRef('');

  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState('');
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const [originalWidth, setOriginalWidth] = useState(0);
  const [originalHeight, setOriginalHeight] = useState(0);
  const [keepRatio, setKeepRatio] = useState(true);
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(90);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [resultSize, setResultSize] = useState(0);

  useEffect(() => {
    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, [imageUrl]);

  function clearResult() {
    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
    }
    setResultUrl('');
    setResultSize(0);
    setNotice('');
  }

  function loadFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please choose a valid image file.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('This image is larger than 25 MB. Please choose a smaller file.');
      return;
    }

    const url = URL.createObjectURL(selectedFile);
    const image = new window.Image();

    image.onload = () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);

      setFile(selectedFile);
      setImageUrl(url);
      setOriginalWidth(image.naturalWidth);
      setOriginalHeight(image.naturalHeight);
      setWidth(image.naturalWidth);
      setHeight(image.naturalHeight);
      setFormat(
        selectedFile.type === 'image/jpeg' ||
        selectedFile.type === 'image/webp'
          ? selectedFile.type
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

  function changeWidth(value) {
    const next = Math.max(1, Math.min(12000, Number(value) || 1));
    setWidth(next);

    if (keepRatio && originalWidth > 0) {
      setHeight(Math.max(1, Math.round(next * originalHeight / originalWidth)));
    }

    clearResult();
  }

  function changeHeight(value) {
    const next = Math.max(1, Math.min(12000, Number(value) || 1));
    setHeight(next);

    if (keepRatio && originalHeight > 0) {
      setWidth(Math.max(1, Math.round(next * originalWidth / originalHeight)));
    }

    clearResult();
  }

  function toggleRatio() {
    if (!keepRatio && originalWidth > 0 && originalHeight > 0) {
      setHeight(Math.max(1, Math.round(width * originalHeight / originalWidth)));
    }
    setKeepRatio((previous) => !previous);
  }

  async function resizeImage() {
    if (!file || !imageRef.current) {
      setError('Upload an image first.');
      return;
    }

    if (width < 1 || height < 1 || width > 12000 || height > 12000) {
      setError('Width and height must be between 1 and 12,000 pixels.');
      return;
    }

    if (width * height > 40000000) {
      setError('The output dimensions are too large. Use 40 megapixels or fewer.');
      return;
    }

    setBusy(true);
    setError('');
    setNotice('');

    try {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext('2d');

      if (!context) throw new Error('Canvas is unavailable.');

      if (format === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
      }

      context.drawImage(imageRef.current, 0, 0, width, height);

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
      setResultSize(blob.size);
      setNotice('Your image has been resized successfully!');
    } catch (err) {
      console.error(err);
      setError('Could not resize this image. Please try another file or format.');
    } finally {
      setBusy(false);
    }
  }

  function resetTool() {
    clearResult();

    if (imageUrl) URL.revokeObjectURL(imageUrl);

    setFile(null);
    setImageUrl('');
    setWidth(0);
    setHeight(0);
    setOriginalWidth(0);
    setOriginalHeight(0);
    setError('');

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

  return (
    <section className="resizer-tool">
      <button className="resizer-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to all tools
      </button>

      <div className="resizer-heading">
        <div className="resizer-heading-icon">
          <Maximize2 size={27} />
        </div>
        <div>
          <h1>Image Resizer</h1>
          <p>Resize images to the dimensions you need.</p>
        </div>
      </div>

      <div className="resizer-privacy">
        <CheckCircle2 size={18} />
        Your images stay on your device. Processing happens in your browser.
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        hidden
        onChange={(event) => {
          loadFile(event.target.files?.[0]);
          event.target.value = '';
        }}
      />

      {!file ? (
        <button
          className="resizer-upload"
          onClick={() => inputRef.current?.click()}
        >
          <Upload size={32} />
          <strong>Upload an image</strong>
          <span>Choose JPG, PNG, WebP or another supported image</span>
          <span className="resizer-upload-small">Maximum file size: 25 MB</span>
        </button>
      ) : (
        <>
          <div className="resizer-workspace">
            <div className="resizer-preview">
              <div className="resizer-preview-header">
                <span>IMAGE PREVIEW</span>
                <button onClick={() => inputRef.current?.click()}>
                  <RefreshCw size={14} /> Change image
                </button>
              </div>

              <div className="resizer-image-frame">
                <img
                  ref={imageRef}
                  src={imageUrl}
                  alt="Image to resize"
                />
              </div>

              <div className="resizer-image-meta">
                <span>{file.name}</span>
                <strong>{formatSize(file.size)}</strong>
              </div>
              <div className="resizer-original">
                Original: {originalWidth} × {originalHeight} px
              </div>
            </div>

            <div className="resizer-settings">
              <h2>Resize settings</h2>
              <p className="resizer-settings-subtitle">
                Enter your desired output dimensions.
              </p>

              <div className="resizer-dimensions">
                <label>
                  Width (px)
                  <input
                    type="number"
                    min="1"
                    max="12000"
                    value={width}
                    onChange={(event) => changeWidth(event.target.value)}
                  />
                </label>

                <span className="resizer-x">×</span>

                <label>
                  Height (px)
                  <input
                    type="number"
                    min="1"
                    max="12000"
                    value={height}
                    onChange={(event) => changeHeight(event.target.value)}
                  />
                </label>
              </div>

              <button
                className={`resizer-ratio ${keepRatio ? 'ratio-active' : ''}`}
                onClick={toggleRatio}
              >
                {keepRatio ? <Lock size={16} /> : <Unlock size={16} />}
                {keepRatio ? 'Keep proportions' : 'Free dimensions'}
              </button>

              <div className="resizer-field">
                <label htmlFor="resizer-format">Output format</label>
                <select
                  id="resizer-format"
                  value={format}
                  onChange={(event) => {
                    setFormat(event.target.value);
                    clearResult();
                  }}
                >
                  <option value="image/png">PNG</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WebP</option>
                </select>
              </div>

              {format !== 'image/png' && (
                <div className="resizer-quality">
                  <div>
                    <label htmlFor="resizer-quality">Image quality</label>
                    <strong>{quality}%</strong>
                  </div>
                  <input
                    id="resizer-quality"
                    type="range"
                    min="10"
                    max="100"
                    value={quality}
                    onChange={(event) => {
                      setQuality(Number(event.target.value));
                      clearResult();
                    }}
                  />
                </div>
              )}

              <div className="resizer-output-info">
                <ImageIcon size={17} />
                <span>
                  Output dimensions: <strong>{width} × {height} px</strong>
                </span>
              </div>

              <button
                className="resizer-run"
                onClick={resizeImage}
                disabled={busy}
              >
                {busy ? (
                  <>
                    <LoaderCircle className="resizer-spinner" size={18} />
                    Resizing image...
                  </>
                ) : (
                  <>
                    <Maximize2 size={18} /> Resize image
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {error && <div className="resizer-error">{error}</div>}
      {notice && <div className="resizer-success">{notice}</div>}

      {resultUrl && (
        <div className="resizer-result">
          <div className="resizer-result-icon">
            <CheckCircle2 size={25} />
          </div>
          <div className="resizer-result-info">
            <strong>resized-image.{extension}</strong>
            <span>{width} × {height} px · {formatSize(resultSize)}</span>
          </div>
          <a
            className="resizer-download"
            href={resultUrl}
            download={`zanahub-resized.${extension}`}
          >
            <Download size={18} /> Download
          </a>
        </div>
      )}

      {file && (
        <button className="resizer-reset" onClick={resetTool}>
          Start over
        </button>
      )}
    </section>
  );
}
