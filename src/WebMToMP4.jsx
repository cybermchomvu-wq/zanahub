import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Upload,
  Film,
  Download,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function WebMToMP4({ onBack }) {
  const fileRef = useRef(null);
  const requestRef = useRef(null);

  const [file, setFile] = useState(null);
  const [converting, setConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const [outputUrl, setOutputUrl] = useState('');
  const [outputName, setOutputName] = useState('');

  useEffect(() => {
    return () => {
      requestRef.current?.abort();

      if (outputUrl) {
        URL.revokeObjectURL(outputUrl);
      }
    };
  }, [outputUrl]);

  function chooseFile(event) {
    const selected = event.target.files?.[0];
    if (!selected) return;

    setError('');
    setStatus('');
    setProgress(0);

    if (!selected.name.toLowerCase().endsWith('.webm')) {
      setFile(null);
      setError('Please choose a video with the .webm extension.');
      event.target.value = '';
      return;
    }

    if (selected.size > 200 * 1024 * 1024) {
      setFile(null);
      setError('This video exceeds the 200 MB upload limit.');
      event.target.value = '';
      return;
    }

    setFile(selected);

    if (outputUrl) {
      URL.revokeObjectURL(outputUrl);
    }

    setOutputUrl('');
    setOutputName('');
  }

  async function convertVideo() {
    if (!file || converting) return;

    setConverting(true);
    setError('');
    setProgress(0);
    setStatus('Uploading video to your local ZanaHub backend…');

    const formData = new FormData();
    formData.append('video', file);

    const controller = new AbortController();
    requestRef.current = controller;

    try {
      const apiBase = `${window.location.protocol}//${window.location.hostname}:3001`;

      const blob = await new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        xhr.open('POST', `${apiBase}/api/video/convert`);
        xhr.responseType = 'blob';
        xhr.timeout = 30 * 60 * 1000;

        controller.signal.addEventListener('abort', () => xhr.abort(), {
          once: true,
        });

        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const percent = Math.round((event.loaded / event.total) * 35);
            setProgress(Math.min(35, percent));
            setStatus(
              event.loaded < event.total
                ? 'Uploading video…'
                : 'Upload complete. Preparing conversion…'
            );
          }
        };

        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            setProgress(95);
            setStatus('Conversion finished. Preparing your MP4…');
            resolve(xhr.response);
            return;
          }

          if (xhr.response instanceof Blob) {
            xhr.response.text().then((text) => {
              try {
                const data = JSON.parse(text);
                reject(new Error(data.error || 'Video conversion failed.'));
              } catch {
                reject(new Error('Video conversion failed. Please try again.'));
              }
            });
          } else {
            reject(new Error('Video conversion failed. Please try again.'));
          }
        };

        xhr.onerror = () => reject(
          new Error('Could not connect to the ZanaHub backend. Make sure it is running.')
        );

        xhr.ontimeout = () => reject(
          new Error('Conversion took too long. Try a smaller video.')
        );

        xhr.onabort = () => reject(new Error('Conversion cancelled.'));

        xhr.send(formData);
      });

      if (!blob || blob.size === 0) {
        throw new Error('The server returned an empty MP4 file.');
      }

      const url = URL.createObjectURL(blob);
      setOutputUrl(url);

      const baseName = file.name.replace(/\.webm$/i, '') || 'converted-video';
      setOutputName(`${baseName}.mp4`);
      setProgress(100);
      setStatus('Conversion complete! Your MP4 is ready to download.');
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message || 'Conversion failed. Please try again.');
      }
      setStatus('');
    } finally {
      requestRef.current = null;
      setConverting(false);
    }
  }

  const card = {
    background: 'rgba(255,255,255,0.035)',
    border: '1px solid rgba(167,139,250,0.2)',
    borderRadius: 18,
    padding: 24,
  };

  const button = {
    border: 0,
    borderRadius: 12,
    padding: '13px 18px',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    color: '#fff',
    background: 'linear-gradient(135deg, #863bff, #5865f2)',
  };

  return (
    <div style={{
      maxWidth: 900,
      margin: '0 auto',
      padding: '28px 20px 60px',
      color: 'var(--text-primary, #f5f3ff)',
    }}>
      <button
        onClick={onBack}
        disabled={converting}
        style={{
          ...button,
          background: 'rgba(255,255,255,0.07)',
          marginBottom: 24,
        }}
      >
        <ArrowLeft size={18} /> Back to tools
      </button>

      <div style={{ ...card, textAlign: 'center', padding: '34px 24px' }}>
        <div style={{
          width: 68,
          height: 68,
          borderRadius: 20,
          margin: '0 auto 18px',
          display: 'grid',
          placeItems: 'center',
          background: 'linear-gradient(135deg, rgba(134,59,255,.25), rgba(34,211,238,.15))',
          color: '#b69aff',
        }}>
          <Film size={34} />
        </div>

        <div style={{
          color: '#a78bfa',
          fontSize: 12,
          fontWeight: 800,
          letterSpacing: 2,
        }}>
          VIDEO TOOLS
        </div>

        <h1 style={{
          fontSize: 'clamp(26px, 5vw, 38px)',
          margin: '10px 0',
        }}>
          WebM to MP4 Converter
        </h1>

        <p style={{
          color: 'var(--text-secondary, #a5a3b8)',
          lineHeight: 1.7,
          maxWidth: 580,
          margin: '0 auto 28px',
        }}>
          Convert WebM videos using native FFmpeg and Intel hardware
          acceleration when available. Videos are sent to your local
          ZanaHub backend for processing.
        </p>

        <input
          ref={fileRef}
          type="file"
          accept=".webm,video/webm"
          onChange={chooseFile}
          style={{ display: 'none' }}
        />

        <button
          onClick={() => fileRef.current?.click()}
          disabled={converting}
          style={button}
        >
          <Upload size={19} /> Choose WebM video
        </button>

        {file && (
          <div style={{ ...card, textAlign: 'left', marginTop: 24 }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              overflowWrap: 'anywhere',
            }}>
              <Film color="#a78bfa" size={28} />

              <div style={{ flex: 1 }}>
                <strong>{file.name}</strong>

                <div style={{
                  color: 'var(--text-secondary, #a5a3b8)',
                  fontSize: 13,
                  marginTop: 5,
                }}>
                  {(file.size / (1024 * 1024)).toFixed(2)} MB · WEBM
                </div>
              </div>
            </div>

            <button
              onClick={convertVideo}
              disabled={converting}
              style={{
                ...button,
                width: '100%',
                marginTop: 22,
                opacity: converting ? 0.65 : 1,
                cursor: converting ? 'wait' : 'pointer',
              }}
            >
              {converting
                ? <><LoaderCircle size={18} /> Processing…</>
                : <><Film size={18} /> Convert to MP4</>}
            </button>

            {(converting || outputUrl) && (
              <div style={{ marginTop: 20 }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 10,
                  fontSize: 13,
                  marginBottom: 8,
                }}>
                  <span>{status || 'Working…'}</span>
                  <strong>{progress}%</strong>
                </div>

                <div style={{
                  height: 8,
                  borderRadius: 20,
                  background: 'rgba(255,255,255,.1)',
                  overflow: 'hidden',
                }}>
                  <div style={{
                    width: `${progress}%`,
                    height: '100%',
                    borderRadius: 20,
                    background: 'linear-gradient(90deg, #863bff, #22d3ee)',
                    transition: 'width .2s ease',
                  }} />
                </div>

                {converting && (
                  <p style={{
                    color: 'var(--text-secondary, #a5a3b8)',
                    fontSize: 12,
                    lineHeight: 1.6,
                    marginBottom: 0,
                  }}>
                    Upload progress is measured accurately. The conversion
                    phase may take time without changing the percentage.
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {error && (
          <div
            role="alert"
            style={{
              ...card,
              marginTop: 20,
              textAlign: 'left',
              color: '#fca5a5',
            }}
          >
            <AlertCircle
              size={19}
              style={{ verticalAlign: 'middle', marginRight: 8 }}
            />
            {error}
          </div>
        )}

        {outputUrl && (
          <div style={{ ...card, marginTop: 24, textAlign: 'left' }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: 9,
              color: '#86efac',
            }}>
              <CheckCircle2 size={22} /> Your MP4 is ready!
            </h3>

            <video
              src={outputUrl}
              controls
              style={{
                width: '100%',
                maxHeight: 420,
                borderRadius: 12,
                background: '#000',
                margin: '12px 0',
              }}
            />

            <div style={{
              marginBottom: 16,
              overflowWrap: 'anywhere',
            }}>
              {outputName}
            </div>

            <a
              href={outputUrl}
              download={outputName}
              style={{
                ...button,
                textDecoration: 'none',
                width: '100%',
                boxSizing: 'border-box',
              }}
            >
              <Download size={19} /> Download MP4
            </a>
          </div>
        )}

        <div style={{
          marginTop: 26,
          fontSize: 12,
          lineHeight: 1.7,
          color: 'var(--text-secondary, #a5a3b8)',
        }}>
          Maximum file size: 200 MB. Keep this page open until the conversion
          finishes. When running locally, the video is processed by FFmpeg
          on your own computer.
        </div>
      </div>
    </div>
  );
}
