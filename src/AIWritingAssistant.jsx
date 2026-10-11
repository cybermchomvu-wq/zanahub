import { useState } from 'react';
import { ArrowLeft, Sparkles, Copy, Check, LoaderCircle } from 'lucide-react';
import './AIWritingAssistant.css';

const tasks = [
  { id: 'write', label: 'Write', description: 'Create something new' },
  { id: 'improve', label: 'Improve', description: 'Polish your writing' },
  { id: 'summarize', label: 'Summarize', description: 'Make text shorter' },
  { id: 'translate', label: 'Translate', description: 'English ↔ Swahili' },
];

export default function AIWritingAssistant({ onBack }) {
  const [task, setTask] = useState('write');
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleGenerate(event) {
    event.preventDefault();

    if (!prompt.trim()) {
      setError('Please enter some text or instructions first.');
      return;
    }

    setLoading(true);
    setError('');
    setResult('');
    setCopied(false);

    try {
      const response = await fetch('${import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`}/api/ai/write', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zanahub_token') || ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: prompt.trim(), task }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The AI request failed.');
      }

      setResult(data.text || 'The AI returned an empty response.');
    } catch (err) {
      setError(
        err.message ||
        'Could not connect to the AI server. Check that your backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. Please select the result and copy it manually.');
    }
  }

  return (
    <main className="ai-writing-page">
      <button className="ai-back-button" onClick={onBack}>
        <ArrowLeft size={18} /> Back to tools
      </button>

      <header className="ai-writing-header">
        <div className="ai-writing-icon">
          <Sparkles size={28} />
        </div>
        <div>
          <p className="ai-eyebrow">ZANAHUB AI STUDIO</p>
          <h1>AI Writing Assistant</h1>
          <p>Turn your ideas into clear, useful content.</p>
        </div>
      </header>

      <section className="ai-writing-panel">
        <h2>What would you like to do?</h2>

        <div className="ai-task-grid">
          {tasks.map((item) => (
            <button
              type="button"
              key={item.id}
              className={`ai-task-card ${task === item.id ? 'selected' : ''}`}
              onClick={() => {
                setTask(item.id);
                setError('');
              }}
              aria-pressed={task === item.id}
            >
              <span>{item.label}</span>
              <small>{item.description}</small>
            </button>
          ))}
        </div>

        <form onSubmit={handleGenerate}>
          <label htmlFor="ai-prompt">
            {task === 'improve'
              ? 'Text to improve'
              : task === 'summarize'
                ? 'Text to summarize'
                : task === 'translate'
                  ? 'Text to translate'
                  : 'Tell the AI what to write'}
          </label>

          <textarea
            id="ai-prompt"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={
              task === 'write'
                ? 'Example: Write a professional business introduction...'
                : task === 'improve'
                  ? 'Paste your text here...'
                  : task === 'summarize'
                    ? 'Paste the text you want shortened...'
                    : 'Enter English or Swahili text and specify the target language...'
            }
            maxLength={5000}
            rows={7}
          />

          <div className="ai-input-footer">
            <small>{prompt.length}/5000 characters</small>
            <button
              className="ai-generate-button"
              type="submit"
              disabled={loading || !prompt.trim()}
            >
              {loading ? (
                <>
                  <LoaderCircle className="ai-spinner" size={18} />
                  Thinking...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Generate with AI
                </>
              )}
            </button>
          </div>
        </form>

        {error && (
          <div className="ai-error" role="alert">
            {error}
          </div>
        )}

        {loading && (
          <p className="ai-loading-note">
            ZanaHub AI is working on your request...
          </p>
        )}

        {result && (
          <section className="ai-result-panel">
            <div className="ai-result-heading">
              <h2>Your result</h2>
              <button
                type="button"
                className="ai-copy-button"
                onClick={handleCopy}
              >
                {copied ? <Check size={16} /> : <Copy size={16} />}
                {copied ? 'Copied!' : 'Copy text'}
              </button>
            </div>
            <div className="ai-result-text">{result}</div>
          </section>
        )}
      </section>

      <p className="ai-privacy-note">
        AI-generated content can contain mistakes. Review important information
        before using it.
      </p>
    </main>
  );
}
