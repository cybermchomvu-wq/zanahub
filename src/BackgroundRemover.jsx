import { useEffect, useRef, useState } from 'react';
import {
  removeBackground,
  getBrowserCapabilities,
} from '@bg0/browser';
import {
  ArrowLeft,
  Download,
  Image as ImageIcon,
  Upload,
  X,
  Sparkles,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import './BackgroundRemover.css';

const MAX_FILE_SIZE = 20 * 1024 * 1024;

export default function BackgroundRemover({ onBack }) {
  const [file, setFile] = useState(null);
  const [originalUrl, setOriginalUrl] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState('');
  const [quality, setQuality] = useState('quality');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [capabilities, setCapabilities] = useState(null);

  const inputRef = useRef(null);
  const controllerRef = useRef(null);
  const resultUrlRef = useRef('');

  useEffect(() => {
    try {
      setCapabilities(getBrowserCapabilities());
    } catch {
      setCapabilities({ webgpu: false, wasm: false });
    }

    return () => {
      controllerRef.current?.abort();

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }
    };
  }, []);

  useEffect(() => {
    return () => {
      if (originalUrl) URL.revokeObjectURL(originalUrl);
    };
  }, [originalUrl]);

  function selectFile(selectedFile) {
    if (!selectedFile) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(selectedFile.type)) {
      setError('Please choose a JPG, PNG or WebP image.');
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError('Please choose an image smaller than 20 MB.');
      return;
    }

    controllerRef.current?.abort();

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
    }

    setResultUrl('');
    setFile(selectedFile);
    setOriginalUrl(URL.createObjectURL(selectedFile));
    setProgress(0);
    setProgressMessage('');
    setError('');
    setSuccess('');
  }

  async function processImage() {
    if (!file) {
      setError('Upload an image first.');
      return;
    }

    if (capabilities && !capabilities.webgpu && !capabilities.wasm) {
      setError('Your browser does not support the processing features required by this tool. Try an updated version of Chrome, Edge or Firefox.');
      return;
    }

    const controller = new AbortController();
    controllerRef.current = controller;

    setProcessing(true);
    setProgress(0);
    setProgressMessage('Preparing your image...');
    setError('');
    setSuccess('');

    try {
      const result = await removeBackground(file, {
        quality,
        signal: controller.signal,
        onProgress: (update) => {
          const percentage = Math.round(update.progress * 100);
          setProgress(percentage);
          setProgressMessage(update.message);
        },
      });

      if (controller.signal.aborted) return;

      if (!(result.blob instanceof Blob) || result.blob.size === 0) {
        throw new Error('The AI returned an empty image. Please try again.');
      }

      const outputUrl = URL.createObjectURL(result.blob);

      if (resultUrlRef.current) {
        URL.revokeObjectURL(resultUrlRef.current);
      }

      resultUrlRef.current = outputUrl;
      setResultUrl(outputUrl);
      setProgress(100);
      setProgressMessage('Background removed successfully!');
      setSuccess(
        `Background removed! Processed in ${(result.durationMs / 1000).toFixed(1)} seconds.`
      );
    } catch (err) {
      if (err.name === 'AbortError') return;

      setError(
        err.message || 'Background removal failed. Please try another image.'
      );
      setProgressMessage('');
    } finally {
      if (controllerRef.current === controller) {
        controllerRef.current = null;
        setProcessing(false);
      }
    }
  }

  function cancelProcessing() {
    controllerRef.current?.abort();
    controllerRef.current = null;
    setProcessing(false);
    setProgressMessage('Processing cancelled.');
  }

  function downloadImage() {
    if (!resultUrl || !file) return;

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const link = document.createElement('a');

    link.href = resultUrl;
    link.download = `${baseName}-no-background.png`;

    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  function resetTool() {
    controllerRef.current?.abort();
    controllerRef.current = null;

    if (resultUrlRef.current) {
      URL.revokeObjectURL(resultUrlRef.current);
      resultUrlRef.current = '';
    }

    setFile(null);
    setOriginalUrl('');
    setResultUrl('');
    setProcessing(false);
    setProgress(0);
    setProgressMessage('');
    setError('');
    setSuccess('');

    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <section className="bg-remover-page">
      <button className="bg-remover-back" onClick={onBack}>
        <ArrowLeft size={17} />
        Back to all tools
      </button>

      <div className="bg-remover-heading">
        <div className="bg-remover-heading-icon">
          <Sparkles size={27} />
        </div>

        <div>
          <div className="bg-remover-eyebrow">AI IMAGE TOOLS</div>
          <h1>Background Remover</h1>
          <p>Remove image backgrounds and create transparent PNGs with AI.</p>
        </div>
      </div>

      <div className="bg-remover-privacy">
        <ShieldCheck size={17} />
        <span>
          Your image is processed locally in your browser. It is not uploaded
          to a ZanaHub processing server.
        </span>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        hidden
        onChange={(event) => selectFile(event.target.files?.[0])}
      />

      {!file ? (
        <button
          className="bg-remover-dropzone"
          onClick={() => inputRef.current?.click()}
          onDragOver={(event) => event.preventDefault()}
          onDrop={(event) => {
            event.preventDefault();
            selectFile(event.dataTransfer.files?.[0]);
          }}
        >
          <span className="bg-remover-upload-icon">
            <Upload size={27} />
          </span>
          <strong>Upload your image</strong>
          <span>Click here or drag and drop an image</span>
          <small>JPG, PNG or WebP · Maximum 20 MB</small>
        </button>
      ) : (
        <>
          <div className="bg-remover-workspace">
            <div className="bg-remover-panel">
              <div className="bg-remover-panel-heading">
                <ImageIcon size={17} />
                <h2>Original image</h2>
                <button
                  className="bg-remover-icon-button"
                  onClick={resetTool}
                  aria-label="Remove image"
                  title="Remove image"
                >
                  <X size={17} />
                </button>
              </div>

              <div className="bg-remover-preview">
                <img src={originalUrl} alt="Original uploaded image" />
              </div>

              <div className="bg-remover-file-info">
                <strong>{file.name}</strong>
                <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
              </div>
            </div>

            <div className="bg-remover-panel">
              <div className="bg-remover-panel-heading">
                <Sparkles size={17} />
                <h2>Transparent result</h2>
              </div>

              <div className="bg-remover-preview bg-remover-transparent">
                {resultUrl ? (
                  <img src={resultUrl} alt="Image with background removed" />
                ) : (
                  <div className="bg-remover-empty">
                    <ImageIcon size={36} />
                    <span>Your result will appear here</span>
                  </div>
                )}
              </div>

              <div className="bg-remover-file-info">
                <strong>{resultUrl ? 'PNG image ready' : 'Waiting for processing'}</strong>
                <span>{resultUrl ? 'Transparent background' : 'Not processed yet'}</span>
              </div>
            </div>
          </div>

          <div className="bg-remover-controls">
            <div className="bg-remover-quality">
              <label htmlFor="bg-remover-quality">Processing quality</label>
              <select
                id="bg-remover-quality"
                value={quality}
                disabled={processing}
                onChange={(event) => setQuality(event.target.value)}
              >
                <option value="fast">Fast</option>
                <option value="quality">High quality</option>
              </select>
            </div>

            <button
              className="bg-remover-primary"
              onClick={processImage}
              disabled={processing}
            >
              {processing ? (
                <>
                  <RefreshCw size={17} className="bg-remover-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={17} />
                  {resultUrl ? 'Process again' : 'Remove background'}
                </>
              )}
            </button>

            {resultUrl && (
              <button
                className="bg-remover-download"
                onClick={downloadImage}
              >
                <Download size={17} />
                Download PNG
              </button>
            )}

            {processing && (
              <button
                className="bg-remover-cancel"
                onClick={cancelProcessing}
              >
                Cancel
              </button>
            )}
          </div>
        </>
      )}

      {processing && (
        <div className="bg-remover-progress">
          <div className="bg-remover-progress-top">
            <span>{progressMessage || 'Processing image...'}</span>
            <strong>{Math.round(progress)}%</strong>
          </div>
          <div className="bg-remover-progress-track">
            <div
              className="bg-remover-progress-fill"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <small>
            The first run may take longer while the AI model downloads.
          </small>
        </div>
      )}

      {success && (
        <div className="bg-remover-message bg-remover-success">
          <CheckCircle2 size={17} />
          {success}
        </div>
      )}

      {error && (
        <div className="bg-remover-message bg-remover-error">
          {error}
        </div>
      )}

      {!capabilities && (
        <p className="bg-remover-note">Checking browser compatibility...</p>
      )}

      {capabilities && !capabilities.webgpu && capabilities.wasm && (
        <p className="bg-remover-note">
          WebGPU is unavailable. The tool will try the WASM processing engine.
        </p>
      )}
    </section>
  );
}
