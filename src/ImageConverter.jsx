import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Upload, Image as ImageIcon, Download, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import './ImageConverter.css';

export default function ImageConverter({ onBack }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [format, setFormat] = useState('image/png');
  const [quality, setQuality] = useState(90);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [converting, setConverting] = useState(false);
  const inputRef = useRef(null);
  const imageRef = useRef(null);
  const resultUrlRef = useRef(null);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (resultUrlRef.current) URL.revokeObjectURL(resultUrlRef.current);
    };
  }, [preview]);

  function selectFile(selected) {
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    setError('');
    setFile(selected);
    setPreview(URL.createObjectURL(selected));

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    setResult(null);
  }

  function convertImage() {
    if (!file || !imageRef.current) {
      setError('Please select an image first.');
      return;
    }

    setConverting(true);
    setError('');

    try {
      const image = imageRef.current;
      const canvas = document.createElement('canvas');

      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');

      if (!context) {
        throw new Error('Your browser could not process this image.');
      }

      // JPEG does not support transparency, so use a white background.
      if (format === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      canvas.toBlob(
        (blob) => {
          setConverting(false);

          if (!blob) {
            setError('Conversion failed. Try another image or format.');
            return;
          }

          // Some browsers may not support a requested output format.
          if (format !== 'image/png' && blob.type !== format) {
            setError('This browser does not support that output format. Try PNG.');
            return;
          }

          if (resultUrlRef.current) {
            URL.revokeObjectURL(resultUrlRef.current);
          }

          const url = URL.createObjectURL(blob);
          resultUrlRef.current = url;

          const extension = format === 'image/jpeg'
            ? 'jpg'
            : format === 'image/webp'
              ? 'webp'
              : 'png';

          setResult({
            url,
            size: blob.size,
            name: `${file.name.replace(/\.[^.]+$/, '')}.${extension}`,
            type: format,
          });
        },
        format,
        format === 'image/png' ? undefined : quality / 100
      );
    } catch (err) {
      setConverting(false);
      setError(err.message || 'Something went wrong during conversion.');
    }
  }

  function formatSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  function reset() {
    setFile(null);
    setPreview('');
    setResult(null);
    setError('');

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = null;
    }

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className="converter-page">
      <button className="converter-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div className="converter-heading">
        <div className="converter-heading-icon">
          <ImageIcon size={28} />
        </div>
        <div>
          <h1>Image Converter</h1>
          <p>Convert images into the format you need.</p>
        </div>
      </div>

      <div className="converter-layout">
        <section className="converter-panel">
          <h2>1. Choose an image</h2>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => selectFile(event.target.files?.[0])}
          />

          {!preview ? (
            <button
              className="converter-upload"
              onClick={() => inputRef.current?.click()}
            >
              <Upload size={32} />
              <strong>Click to upload an image</strong>
              <span>PNG, JPG, WebP and other browser-supported images</span>
            </button>
          ) : (
            <div className="converter-preview">
              <img
                ref={imageRef}
                src={preview}
                alt="Selected image preview"
                onLoad={() => setError('')}
              />
              <div className="converter-file-info">
                <span>{file?.name}</span>
                <span>{formatSize(file?.size || 0)}</span>
              </div>
              <button
                className="converter-secondary"
                onClick={() => inputRef.current?.click()}
              >
                Choose another image
              </button>
            </div>
          )}

          <h2 className="converter-section-title">2. Select output format</h2>

          <div className="converter-formats">
            {[
              { value: 'image/png', label: 'PNG', description: 'Best for transparency' },
              { value: 'image/jpeg', label: 'JPG', description: 'Great for photos' },
              { value: 'image/webp', label: 'WebP', description: 'Modern web images' },
            ].map((item) => (
              <button
                key={item.value}
                className={`converter-format ${format === item.value ? 'selected' : ''}`}
                onClick={() => {
                  setFormat(item.value);
                  setResult(null);
                  setError('');
                }}
              >
                <strong>{item.label}</strong>
                <span>{item.description}</span>
              </button>
            ))}
          </div>

          {format !== 'image/png' && (
            <div className="converter-quality">
              <label htmlFor="converter-quality">
                Image quality <strong>{quality}%</strong>
              </label>
              <input
                id="converter-quality"
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(event) => setQuality(Number(event.target.value))}
              />
              <p>Higher quality usually produces a larger file.</p>
            </div>
          )}

          {error && (
            <div className="converter-error">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <button
            className="converter-primary"
            onClick={convertImage}
            disabled={!file || converting}
          >
            {converting ? (
              <><RefreshCw size={18} className="converter-spin" /> Converting...</>
            ) : (
              <><RefreshCw size={18} /> Convert Image</>
            )}
          </button>
        </section>

        <section className="converter-panel converter-result-panel">
          <h2>3. Your converted image</h2>

          {!result ? (
            <div className="converter-empty">
              <ImageIcon size={48} />
              <strong>Your result will appear here</strong>
              <p>Choose an image and convert it to see the result.</p>
            </div>
          ) : (
            <div className="converter-success">
              <div className="converter-success-label">
                <CheckCircle size={19} /> Conversion complete
              </div>

              <img src={result.url} alt="Converted result" />

              <div className="converter-result-info">
                <span>File name</span>
                <strong>{result.name}</strong>
                <span>Output size</span>
                <strong>{formatSize(result.size)}</strong>
                <span>Format</span>
                <strong>{result.type.replace('image/', '').toUpperCase()}</strong>
              </div>

              <a
                className="converter-primary converter-download"
                href={result.url}
                download={result.name}
              >
                <Download size={18} /> Download Converted Image
              </a>

              <button className="converter-secondary" onClick={reset}>
                Convert another image
              </button>
            </div>
          )}

          <div className="converter-privacy">
            🔒 Your image is processed in your browser. It is not uploaded to our server.
          </div>
        </section>
      </div>
    </div>
  );
}
