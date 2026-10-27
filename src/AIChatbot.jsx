import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  Bot,
  Check,
  Copy,
  MessageCircle,
  Plus,
  Send,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import './AIChatbot.css';

const API_URL =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;


function renderMessageContent(content, onCopyCode, copiedCodeId) {
  const parts = content.split(/(```[^\n]*\n[\s\S]*?```)/g);

  return parts.map((part, index) => {
    const match = part.match(/^```([^\n`]*)\n([\s\S]*?)```$/);

    if (!match) {
      return part ? (
        <span className="chatbot-text-segment" key={`text-${index}`}>
          {part}
        </span>
      ) : null;
    }

    const language = match[1].trim() || 'code';
    const code = match[2].replace(/\n$/, '');
    const codeId = `${index}-${code.length}`;

    return (
      <section className="chatbot-code-block" key={`code-${index}`}>
        <div className="chatbot-code-header">
          <span className="chatbot-code-language">{language}</span>
          <button
            type="button"
            className="chatbot-code-copy"
            onClick={() => onCopyCode(code, codeId)}
            aria-label="Copy code"
          >
            {copiedCodeId === codeId ? (
              <><Check size={14} /> Copied!</>
            ) : (
              <><Copy size={14} /> Copy code</>
            )}
          </button>
        </div>
        <pre className="chatbot-code-pre">
          <code>{code}</code>
        </pre>
      </section>
    );
  });
}

const initialMessage = {
  role: 'assistant',
  content:
    "Hey! I'm ZanaHub AI. 👋 Ask me anything, or tell me what you'd like help with.",
};

export default function AIChatbot({ onBack }) {
  const [messages, setMessages] = useState([initialMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [copiedCodeId, setCopiedCodeId] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function sendMessage(event) {
    event?.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    if (text.length > 5000) {
      setError('Please keep each message under 5,000 characters.');
      return;
    }

    const history = messages
      .filter((message) => message.role === 'user' || message.role === 'assistant')
      .map(({ role, content }) => ({ role, content }));

    const updatedMessages = [...history, { role: 'user', content: text }];

    setMessages(updatedMessages);
    setInput('');
    setError('');
    setLoading(true);

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${API_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: updatedMessages }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'The chatbot could not respond.');
      }

      if (typeof data.text !== 'string' || !data.text.trim()) {
        throw new Error('The chatbot returned an empty response. Please try again.');
      }

      setMessages((current) => [
        ...current,
        { role: 'assistant', content: data.text.trim() },
      ]);
    } catch (err) {
      setError(
        err.name === 'AbortError'
          ? 'The request took too long. Please try again.'
          : err.message || 'Unable to reach ZanaHub AI. Please try again.',
      );
    } finally {
      window.clearTimeout(timeoutId);
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function startNewChat() {
    setMessages([initialMessage]);
    setInput('');
    setError('');
    setCopiedIndex(null);
    inputRef.current?.focus();
  }

  async function copyMessage(content, index) {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedIndex(index);
      window.setTimeout(() => setCopiedIndex(null), 1800);
    } catch {
      setError('Could not copy the message. Please select and copy it manually.');
    }
  }


  async function copyCode(code, codeId) {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCodeId(codeId);
      window.setTimeout(() => setCopiedCodeId(null), 1800);
    } catch {
      setError('Could not copy the code. Please select and copy it manually.');
    }
  }

  return (
    <section className="chatbot-page">
      <header className="chatbot-header">
        <button
          type="button"
          className="chatbot-icon-button"
          onClick={onBack}
          aria-label="Back to tools"
          title="Back to tools"
        >
          <ArrowLeft size={20} />
        </button>

        <div className="chatbot-brand-icon">
          <Bot size={25} />
        </div>

        <div className="chatbot-heading">
          <h1>ZanaHub AI</h1>
          <span><i /> AI assistant</span>
        </div>

        <button
          type="button"
          className="chatbot-new-button"
          onClick={startNewChat}
          title="Start a new conversation"
        >
          <Plus size={17} />
          <span>New chat</span>
        </button>
      </header>

      <div className="chatbot-content">
        <div className="chatbot-welcome">
          <div className="chatbot-welcome-icon">
            <Sparkles size={27} />
          </div>
          <h2>Your ideas start here.</h2>
          <p>Ask questions, learn something new, write, plan, or solve a problem.</p>
        </div>

        <div className="chatbot-messages" aria-live="polite">
          {messages.map((message, index) => (
            <article
              className={`chatbot-message ${message.role === 'user' ? 'user-message' : 'assistant-message'}`}
              key={`${index}-${message.role}`}
            >
              <div className="chatbot-avatar">
                {message.role === 'user' ? <User size={18} /> : <Bot size={19} />}
              </div>

              <div className="chatbot-message-body">
                <div className="chatbot-message-label">
                  {message.role === 'user' ? 'You' : 'ZanaHub AI'}
                </div>
                <div className="chatbot-message-text">
                  {renderMessageContent(message.content, copyCode, copiedCodeId)}
                </div>

                {message.role === 'assistant' && index > 0 && (
                  <button
                    type="button"
                    className="chatbot-copy-button"
                    onClick={() => copyMessage(message.content, index)}
                    aria-label="Copy response"
                  >
                    {copiedIndex === index ? <Check size={14} /> : <Copy size={14} />}
                    {copiedIndex === index ? 'Copied' : 'Copy'}
                  </button>
                )}
              </div>
            </article>
          ))}

          {loading && (
            <div className="chatbot-message assistant-message">
              <div className="chatbot-avatar"><Bot size={19} /></div>
              <div className="chatbot-message-body">
                <div className="chatbot-message-label">ZanaHub AI</div>
                <div className="chatbot-typing" aria-label="AI is thinking">
                  <span />
                  <span />
                  <span />
                  <small>Thinking...</small>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="chatbot-error" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => setError('')}>Dismiss</button>
          </div>
        )}

        <div className="chatbot-composer-wrap">
          <form className="chatbot-composer" onSubmit={sendMessage}>
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
              placeholder="Message ZanaHub AI..."
              rows={1}
              maxLength={5000}
              disabled={loading}
              aria-label="Your message"
            />

            <button
              type="submit"
              className="chatbot-send-button"
              disabled={loading || !input.trim()}
              aria-label="Send message"
              title="Send message"
            >
              <Send size={19} />
            </button>
          </form>

          <p className="chatbot-hint">
            <MessageCircle size={13} />
            Enter to send · Shift + Enter for a new line
          </p>
          <p className="chatbot-disclaimer">
            AI can make mistakes. Check important information.
          </p>
        </div>
      </div>
    </section>
  );
}
