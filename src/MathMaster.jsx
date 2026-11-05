import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Check,
  Copy,
  Lightbulb,
  Plus,
  Send,
  Sparkles,
  User,
} from 'lucide-react';
import './MathMaster.css';

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

const examples = [
  'Solve: 3x + 7 = 25',
  'Find the derivative of x² sin(x)',
  'Evaluate the integral of 2x + 5',
  'Find the probability of getting two heads when tossing two coins',
  'Solve the quadratic equation x² - 5x + 6 = 0',
  'Explain the Pythagorean theorem with an example',
];

export default function MathMaster({ onBack }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(null);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(event) {
    event?.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    if (question.length > 5000) {
      setError('Please keep your question under 5,000 characters.');
      return;
    }

    const updated = [
      ...messages,
      { role: 'user', content: question },
    ];

    setMessages(updated);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/ai/math`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updated.slice(-30),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Could not solve this question.');
      }

      if (!data.text) {
        throw new Error('The AI returned an empty answer. Please try again.');
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.text },
      ]);
    } catch (err) {
      setError(
        err.name === 'TypeError'
          ? 'Unable to connect to MathMaster. Check your internet connection.'
          : err.message,
      );
      setMessages((current) => current.slice(0, -1));
      setInput(question);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewQuestion() {
    setMessages([]);
    setInput('');
    setError('');
    setCopied(null);
    inputRef.current?.focus();
  }

  async function copyAnswer(content, index) {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(index);
      window.setTimeout(() => setCopied(null), 1800);
    } catch {
      setError('Could not copy the answer. Please select and copy it manually.');
    }
  }

  return (
    <main className="mathmaster-page">
      <header className="mathmaster-header">
        <button
          type="button"
          className="mathmaster-back"
          onClick={onBack}
          aria-label="Go back"
        >
          <ArrowLeft size={19} />
        </button>

        <div className="mathmaster-brand-icon">
          <Calculator size={23} />
        </div>

        <div className="mathmaster-heading">
          <h1>MathMaster</h1>
          <span><span className="mathmaster-status-dot" /> AI Mathematics Solver</span>
        </div>

        <button
          type="button"
          className="mathmaster-new-button"
          onClick={startNewQuestion}
          disabled={loading}
        >
          <Plus size={17} />
          <span>New question</span>
        </button>
      </header>

      <section className="mathmaster-content">
        {messages.length === 0 ? (
          <div className="mathmaster-welcome">
            <div className="mathmaster-welcome-icon">
              <Sparkles size={30} />
            </div>

            <span className="mathmaster-eyebrow">YOUR PERSONAL MATH ASSISTANT</span>
            <h2>Let's solve some mathematics.</h2>
            <p>
              From basic arithmetic to advanced calculus, ask a question
              and get a clear explanation with step-by-step working.
            </p>

            <div className="mathmaster-example-heading">
              <Lightbulb size={17} />
              Try an example
            </div>

            <div className="mathmaster-examples">
              {examples.map((example) => (
                <button
                  type="button"
                  key={example}
                  onClick={() => {
                    setInput(example);
                    inputRef.current?.focus();
                  }}
                >
                  {example}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="mathmaster-conversation">
            {messages.map((message, index) => (
              <article
                className={`mathmaster-message ${message.role}`}
                key={`${index}-${message.role}`}
              >
                <div className="mathmaster-avatar">
                  {message.role === 'user' ? (
                    <User size={17} />
                  ) : (
                    <Calculator size={17} />
                  )}
                </div>

                <div className="mathmaster-message-body">
                  <div className="mathmaster-message-label">
                    {message.role === 'user' ? 'You' : 'MathMaster'}
                  </div>

                  <div className="mathmaster-message-text">
                    {message.content}
                  </div>

                  {message.role === 'assistant' && (
                    <button
                      type="button"
                      className="mathmaster-copy-button"
                      onClick={() => copyAnswer(message.content, index)}
                    >
                      {copied === index ? (
                        <><Check size={14} /> Copied</>
                      ) : (
                        <><Copy size={14} /> Copy solution</>
                      )}
                    </button>
                  )}
                </div>
              </article>
            ))}

            {loading && (
              <div className="mathmaster-loading">
                <div className="mathmaster-avatar">
                  <Calculator size={17} />
                </div>
                <div>
                  <strong>MathMaster is solving...</strong>
                  <div className="mathmaster-dots"><i /><i /><i /></div>
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}

        {error && (
          <div className="mathmaster-error" role="alert">
            {error}
          </div>
        )}
      </section>

      <form className="mathmaster-composer" onSubmit={sendMessage}>
        <div className="mathmaster-input-wrap">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Type your mathematics question here..."
            rows={2}
            maxLength={5000}
            disabled={loading}
          />

          <div className="mathmaster-input-footer">
            <span>Ask any mathematics question · Shift + Enter for a new line</span>
            <span>{input.length}/5000</span>
          </div>
        </div>

        <button
          type="submit"
          className="mathmaster-send"
          disabled={!input.trim() || loading}
          aria-label="Send question"
        >
          <Send size={19} />
        </button>
      </form>

      <p className="mathmaster-disclaimer">
        AI-generated solutions can contain mistakes. Check important answers.
      </p>
    </main>
  );
}
