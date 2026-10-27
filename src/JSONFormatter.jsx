import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Copy, FileCode2, Minimize2, RotateCcw, Sparkles } from 'lucide-react';
import './JSONFormatter.css';

const exampleJSON = `{
  "app": "ZanaHub",
  "version": "1.0.0",
  "features": ["PDF Tools", "Image Tools", "Coding Tools"],
  "settings": {
    "language": "English",
    "currency": "TZS",
    "premium": true
  }
}`;

export default function JSONFormatter({ onBack }) {
  const [input, setInput] = useState(exampleJSON);
  const [output, setOutput] = useState('');
  const [message, setMessage] = useState({
    type: 'info',
    text: 'Paste your JSON or load the example to get started.',
  });

  function processJSON(mode) {
    try {
      const parsed = JSON.parse(input);

      if (mode === 'validate') {
        setOutput(JSON.stringify(parsed, null, 2));
        setMessage({ type: 'success', text: 'Valid JSON! Your data has no syntax errors.' });
        return;
      }

      if (mode === 'minify') {
        setOutput(JSON.stringify(parsed));
        setMessage({ type: 'success', text: 'JSON minified successfully.' });
        return;
      }

      setOutput(JSON.stringify(parsed, null, 2));
      setMessage({ type: 'success', text: 'JSON formatted successfully.' });
    } catch (error) {
      setOutput('');
      const match = error.message.match(/position\s+(\d+)/i);
      const position = match ? ` Near character ${match[1]}.` : '';
      setMessage({
        type: 'error',
        text: `Invalid JSON: ${error.message}.${position}`,
      });
    }
  }

  async function copyOutput() {
    if (!output) {
      setMessage({ type: 'error', text: 'There is no output to copy. Format valid JSON first.' });
      return;
    }

    try {
      await navigator.clipboard.writeText(output);
      setMessage({ type: 'success', text: 'Output copied to clipboard.' });
    } catch {
      setMessage({
        type: 'error',
        text: 'Clipboard access was blocked. Select the output and copy it manually.',
      });
    }
  }

  function clearAll() {
    setInput('');
    setOutput('');
    setMessage({ type: 'info', text: 'Editor cleared. Paste your JSON to begin.' });
  }

  return (
    <section className="json-tool">
      <button className="json-back" onClick={onBack}>
        <ArrowLeft size={17} /> Back to tools
      </button>

      <div className="json-heading">
        <div className="json-heading-icon"><FileCode2 size={28} /></div>
        <div>
          <div className="json-eyebrow"><Sparkles size={13} /> CODING TOOLS</div>
          <h1>JSON Formatter <span>&amp; Validator</span></h1>
          <p>Format, validate, and minify JSON directly in your browser.</p>
        </div>
      </div>

      <div className={`json-message ${message.type}`} role="status">
        {message.type === 'success' && <CheckCircle2 size={17} />}
        <span>{message.text}</span>
      </div>

      <div className="json-actions">
        <button className="json-primary" onClick={() => processJSON('format')}>
          <Sparkles size={16} /> Format JSON
        </button>
        <button onClick={() => processJSON('validate')}>Validate</button>
        <button onClick={() => processJSON('minify')}>
          <Minimize2 size={16} /> Minify
        </button>
        <button onClick={() => setInput(exampleJSON)}>Load example</button>
        <button onClick={clearAll}>
          <RotateCcw size={16} /> Clear
        </button>
      </div>

      <div className="json-editors">
        <div className="json-editor-panel">
          <div className="json-editor-header">
            <span><i className="json-dot input-dot" /> INPUT.JSON</span>
            <span>{input.length} characters</span>
          </div>
          <textarea
            spellCheck="false"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={'Paste JSON here...\n\nExample: {"name":"ZanaHub"}'}
            aria-label="JSON input"
          />
        </div>

        <div className="json-editor-panel">
          <div className="json-editor-header">
            <span><i className="json-dot output-dot" /> OUTPUT.JSON</span>
            <button className="json-copy" onClick={copyOutput}>
              <Copy size={14} /> Copy
            </button>
          </div>
          <textarea
            spellCheck="false"
            value={output}
            readOnly
            placeholder="Your formatted JSON will appear here..."
            aria-label="JSON output"
          />
        </div>
      </div>

      <div className="json-tip">
        <CheckCircle2 size={17} />
        <div>
          <strong>Private by design</strong>
          <p>JSON processing happens in your browser. Your input isn't sent to the ZanaHub server.</p>
        </div>
      </div>
    </section>
  );
}
