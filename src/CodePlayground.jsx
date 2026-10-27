import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Code2,
  Play,
  RotateCcw,
  Trash2,
  Monitor,
  Smartphone,
  CheckCircle2,
} from 'lucide-react';
import './CodePlayground.css';

const starterHTML = `<main class="card">
  <h1>Hello, ZanaHub! 🚀</h1>
  <p>Your code is running successfully.</p>
  <button id="helloButton">Click me</button>
  <p id="message"></p>
</main>`;

const starterCSS = `body {
  font-family: system-ui, sans-serif;
  background: #f0f4ff;
  color: #172554;
  padding: 30px;
}

.card {
  max-width: 520px;
  margin: 30px auto;
  padding: 28px;
  background: white;
  border-radius: 18px;
  box-shadow: 0 12px 35px #17255418;
}

h1 {
  color: #6366f1;
}

button {
  padding: 12px 18px;
  border: 0;
  border-radius: 10px;
  background: #6366f1;
  color: white;
  cursor: pointer;
}`;

const starterJS = `document.getElementById('helloButton')
  .addEventListener('click', () => {
    document.getElementById('message').textContent =
      'Great! Your JavaScript works.';
  });`;

export default function CodePlayground({ onBack }) {
  const [html, setHtml] = useState(starterHTML);
  const [css, setCss] = useState(starterCSS);
  const [js, setJs] = useState(starterJS);
  const [previewCode, setPreviewCode] = useState('');
  const [device, setDevice] = useState('desktop');
  const [message, setMessage] = useState('Ready to run your code');
  const [runCount, setRunCount] = useState(0);
  const frameRef = useRef(null);

  const buildPreview = () => {
    const safeCSS = css.replace(/<\/style/gi, '<\\/style');
    const safeJS = js.replace(/<\/script/gi, '<\\/script');

    return `<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<style>
${safeCSS}
</style>
</head>
<body>
${html}
<script>
(() => {
  const originalLog = console.log;
  console.log = (...args) => {
    try {
      parent.postMessage({
        source: 'zanahub-playground',
        type: 'log',
        text: args.map(v => {
          try {
            return typeof v === 'string' ? v : JSON.stringify(v);
          } catch {
            return String(v);
          }
        }).join(' ')
      }, '*');
    } catch {}
    originalLog(...args);
  };

  window.addEventListener('error', event => {
    parent.postMessage({
      source: 'zanahub-playground',
      type: 'error',
      text: event.message || 'JavaScript error'
    }, '*');
  });

  try {
    ${safeJS}
  } catch (error) {
    parent.postMessage({
      source: 'zanahub-playground',
      type: 'error',
      text: error.message || 'JavaScript error'
    }, '*');
  }
})();
<\/script>
</body>
</html>`;
  };

  const runCode = () => {
    setPreviewCode(buildPreview());
    setMessage('Code executed');
    setRunCount(count => count + 1);
  };

  useEffect(() => {
    runCode();
    // Run the starter example once when the component opens.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleMessage = event => {
      if (event.source !== frameRef.current?.contentWindow) return;
      if (event.data?.source !== 'zanahub-playground') return;

      if (event.data.type === 'error') {
        setMessage(`Error: ${event.data.text}`);
      } else if (event.data.type === 'log') {
        setMessage(`Console: ${event.data.text}`);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const resetCode = () => {
    setHtml(starterHTML);
    setCss(starterCSS);
    setJs(starterJS);
    setMessage('Example restored — press Run');
  };

  const clearCode = () => {
    setHtml('');
    setCss('');
    setJs('');
    setMessage('Editors cleared — press Run to update preview');
  };

  return (
    <section className="cp-page">
      <header className="cp-header">
        <button className="cp-back" onClick={onBack} type="button">
          <ArrowLeft size={18} /> Back to tools
        </button>

        <div className="cp-title">
          <span className="cp-title-icon"><Code2 size={22} /></span>
          <div>
            <h1>Code Playground</h1>
            <p>Write HTML, CSS and JavaScript with a live preview.</p>
          </div>
        </div>

        <div className="cp-actions">
          <button className="cp-secondary" onClick={resetCode} type="button">
            <RotateCcw size={16} /> Reset
          </button>
          <button className="cp-secondary" onClick={clearCode} type="button">
            <Trash2 size={16} /> Clear
          </button>
          <button className="cp-run" onClick={runCode} type="button">
            <Play size={16} fill="currentColor" /> Run
          </button>
        </div>
      </header>

      <div className="cp-status" aria-live="polite">
        <span><CheckCircle2 size={15} /> {message}</span>
        <span>Run #{runCount}</span>
      </div>

      <div className="cp-workspace">
        <div className="cp-editors">
          <label className="cp-editor">
            <span className="cp-editor-heading">
              <span className="cp-dot cp-html-dot" /> HTML
            </span>
            <textarea
              aria-label="HTML code"
              spellCheck="false"
              value={html}
              onChange={event => setHtml(event.target.value)}
              placeholder="Write your HTML here..."
            />
          </label>

          <label className="cp-editor">
            <span className="cp-editor-heading">
              <span className="cp-dot cp-css-dot" /> CSS
            </span>
            <textarea
              aria-label="CSS code"
              spellCheck="false"
              value={css}
              onChange={event => setCss(event.target.value)}
              placeholder="Write your CSS here..."
            />
          </label>

          <label className="cp-editor">
            <span className="cp-editor-heading">
              <span className="cp-dot cp-js-dot" /> JavaScript
            </span>
            <textarea
              aria-label="JavaScript code"
              spellCheck="false"
              value={js}
              onChange={event => setJs(event.target.value)}
              placeholder="Write your JavaScript here..."
            />
          </label>
        </div>

        <div className="cp-preview-panel">
          <div className="cp-preview-heading">
            <strong><Monitor size={16} /> Live Preview</strong>
            <div className="cp-device-buttons">
              <button
                type="button"
                className={device === 'desktop' ? 'selected' : ''}
                onClick={() => setDevice('desktop')}
                aria-label="Desktop preview"
                title="Desktop preview"
              >
                <Monitor size={16} />
              </button>
              <button
                type="button"
                className={device === 'mobile' ? 'selected' : ''}
                onClick={() => setDevice('mobile')}
                aria-label="Mobile preview"
                title="Mobile preview"
              >
                <Smartphone size={16} />
              </button>
            </div>
          </div>

          <div className="cp-preview-canvas">
            <iframe
              ref={frameRef}
              key={runCount}
              title="Code output preview"
              srcDoc={previewCode}
              sandbox="allow-scripts"
              className={device === 'mobile' ? 'cp-frame cp-mobile' : 'cp-frame'}
            />
          </div>

          <p className="cp-preview-note">
            <CheckCircle2 size={14} />
            Preview runs in an isolated sandbox. Press Run after editing.
          </p>
        </div>
      </div>
    </section>
  );
}
