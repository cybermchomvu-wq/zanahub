import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Upload,
  X,
  FileImage,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import './ImageCompressor.css';

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function ImageCompressor({ onBack }) {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [compressedUrl, setCompressedUrl] = useState('');
  const [compressedSize, setCompressedSize] = useState(0);
  const [quality, setQuality] = useState(75);
  const [format, setFormat] = useState('image/webp');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const inputRef = useRef(null);
  const outputUrlRef = useRef('');

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);
    };
  }, [originalUrl]);

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    if (!selectedFile.type.startsWith('image/')) {
      setError('Please select a valid image file.');
      return;
    }

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(selectedFile.type)) {
      setError('Please choose a JPEG, PNG, WebP, or GIF image.');
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      setError('Please choose an image smaller than 25 MB.');
      return;
    }

    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);

    outputUrlRef.current = '';
    setCompressedUrl('');
    setCompressedSize(0);
    setSuccess('');
    setError('');
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
  }

  async function compressImage() {
    if (!file || !originalUrl) {
      setError('Upload an image first.');
      return;
    }

    setProcessing(true);
    setError('');
    setSuccess('');

    try {
      const image = new window.Image();

      await new Promise((resolve, reject) => {
        image.onload = resolve;
        image.onerror = () => reject(new Error('Could not read this image.'));
        image.src = originalUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = image.naturalWidth;
      canvas.height = image.naturalHeight;

      const context = canvas.getContext('2d');

      if (!context) throw new Error('Your browser could not process this image.');

      if (format === 'image/jpeg') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }

      context.drawImage(image, 0, 0);

      const outputBlob = await new Promise((resolve, reject) => {
        canvas.toBlob(
          (blob) => {
            if (blob) resolve(blob);
            else reject(new Error('Compression failed. Try another format.'));
          },
          format,
          quality / 100,
        );
      });

      if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);

      const newUrl = URL.createObjectURL(outputBlob);
      outputUrlRef.current = newUrl;

      setCompressedUrl(newUrl);
      setCompressedSize(outputBlob.size);

      if (outputBlob.size < file.size) {
        const reduction = Math.round((1 - outputBlob.size / file.size) * 100);
        setSuccess(`Image compressed successfully! File size reduced by ${reduction}%.`);
      } else {
        setSuccess('Image converted successfully. The new file is larger, so try another format or quality setting.');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong while compressing the image.');
    } finally {
      setProcessing(false);
    }
  }

  function downloadImage() {
    if (!compressedUrl || !file) return;

    const extension = format === 'image/jpeg' ? 'jpg' : format === 'image/png' ? 'png' : 'webp';
    const baseName = file.name.replace(/\.[^/.]+$/, '');

    const link = document.createElement('a');
    link.href = compressedUrl;
    link.download = `${baseName}-zanahub.${extension}`;
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function resetTool() {
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    if (outputUrlRef.current) URL.revokeObjectURL(outputUrlRef.current);

    outputUrlRef.current = '';
    setFile(null);
    setOriginalUrl('');
    setCompressedUrl('');
    setCompressedSize(0);
    setQuality(75);
    setFormat('image/webp');
    setError('');
    setSuccess('');

    if (inputRef.current) inputRef.current.value = '';
  }

  const reduction = file && compressedSize
    ? Math.round((1 - compressedSize / file.size) * 100)
    : 0;

  return (
    <section className="compressor-page">
      <button className="compressor-back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to all tools
      </button>

      <div className="compressor-heading">
        <div className="compressor-heading-icon">
          <ImageIcon size={27} />
        </div>
        <div>
          <div className="compressor-eyebrow">IMAGE TOOLS</div>
          <h1>Image Compressor</h1>
          <p>Reduce image file sizes directly in your browser.</p>
        </div>
      </div>

      <div className="compressor-layout">
        <div className="compressor-panel">
          <div className="compressor-panel-title">
            <FileImage size={18} />
            <h2>Your image</h2>
          </div>

          {!file ? (
            <button
              className="compressor-dropzone"
              onClick={() => inputRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                selectFile(event.dataTransfer.files[0]);
              }}
            >
              <span className="compressor-upload-icon">
                <Upload size={25} />
              </span>
              <strong>Click to upload an image</strong>
              <span>or drag and drop your file here</span>
              <small>JPEG, PNG, WebP or GIF · Maximum 25 MB</small>
            </button>
          ) : (
            <div className="compressor-preview">
              <button
                className="compressor-remove"
                onClick={resetTool}
                aria-label="Remove image"
              >
                <X size={17} />
              </button>
              <img src={originalUrl} alt="Original image preview" />
              <div className="compressor-file-details">
                <strong>{file.name}</strong>
                <span>{formatBytes(file.size)} · {file.type.split('/')[1].toUpperCase()}</span>
              </div>
            </div>
          )}

          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            hidden
            onChange={(event) => selectFile(event.target.files[0])}
          />

          <div className="compressor-settings">
            <label htmlFor="output-format">Output format</label>
            <select
              id="output-format"
              value={format}
              onChange={(event) => {
                setFormat(event.target.value);
                setCompressedUrl('');
                setCompressedSize(0);
                setSuccess('');
              }}
            >
              <option value="image/webp">WebP — usually smaller files</option>
              <option value="image/jpeg">JPEG — photographs</option>
              <option value="image/png">PNG — graphics</option>
            </select>

            <div className="compressor-quality-label">
              <label htmlFor="image-quality">Image quality</label>
              <strong>{quality}%</strong>
            </div>

            <input
              id="image-quality"
              className="compressor-range"
              type="range"
              min="10"
              max="100"
              value={quality}
              onChange={(event) => {
                setQuality(Number(event.target.value));
                setCompressedUrl('');
                setCompressedSize(0);
                setSuccess('');
              }}
            />

            <div className="compressor-range-labels">
              <span>Smaller file</span>
              <span>Higher quality</span>
            </div>

            {format === 'image/png' && (
              <p className="compressor-hint">
                PNG does not use this quality slider in your browser. Try WebP for smaller files.
              </p>
            )}

            <button
              className="compressor-run"
              disabled={!file || processing}
              onClick={compressImage}
            >
              {processing ? (
                <><RefreshCw size={17} className="compressor-spinner" /> Processing image...</>
              ) : (
                <><ImageIcon size={17} /> Compress image</>
              )}
            </button>

            {error && <div className="compressor-message compressor-error">{error}</div>}
            {success && <div className="compressor-message compressor-success">{success}</div>}
          </div>
        </div>

        <div className="compressor-panel compressor-results">
          <div className="compressor-panel-title">
            <CheckCircle2 size={18} />
            <h2>Compression results</h2>
          </div>

          {!compressedUrl ? (
            <div className="compressor-empty-result">
              <div className="compressor-empty-icon">
                <FileImage size={29} />
              </div>
              <strong>Your result will appear here</strong>
              <p>Upload an image and select Compress image to get started.</p>
            </div>
          ) : (
            <>
              <div className="compressor-result-preview">
                <img src={compressedUrl} alt="Compressed image preview" />
              </div>

              <div className="compressor-size-comparison">
                <div>
                  <span>Original size</span>
                  <strong>{formatBytes(file.size)}</strong>
                </div>
                <div>
                  <span>New size</span>
                  <strong>{formatBytes(compressedSize)}</strong>
                </div>
              </div>

              <div className="compressor-saving">
                <span>{reduction > 0 ? 'Space saved' : 'Size change'}</span>
                <strong>{Math.abs(reduction)}% {reduction < 0 ? 'larger' : 'smaller'}</strong>
              </div>

              <button className="compressor-download" onClick={downloadImage}>
                <Download size={18} /> Download compressed image
              </button>
            </>
          )}
        </div>
      </div>

      <div className="compressor-privacy">
        <CheckCircle2 size={18} />
        <div>
          <strong>Your images stay on your device</strong>
          <p>Image processing happens in your browser. Your image is not uploaded to a server.</p>
        </div>
      </div>
    </section>
  );
}
