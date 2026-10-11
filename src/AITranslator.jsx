import { useMemo, useState } from 'react';
import {
  ArrowLeftRight,
  Copy,
  Languages,
  LoaderCircle,
  Sparkles,
  Trash2,
  Check,
  AlertCircle,
} from 'lucide-react';
import './AITranslator.css';

const LANGUAGES = [
  { name: 'English', native: 'English', flag: '🇬🇧' },
  { name: 'Swahili', native: 'Kiswahili', flag: '🇹🇿' },
  { name: 'French', native: 'Français', flag: '🇫🇷' },
  { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { name: 'Dutch', native: 'Nederlands', flag: '🇳🇱' },
  { name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { name: 'Chinese (Simplified)', native: '简体中文', flag: '🇨🇳' },
  { name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
  { name: 'Bengali', native: 'বাংলা', flag: '🇧🇩' },
  { name: 'Urdu', native: 'اردو', flag: '🇵🇰' },
  { name: 'Indonesian', native: 'Bahasa Indonesia', flag: '🇮🇩' },
  { name: 'Malay', native: 'Bahasa Melayu', flag: '🇲🇾' },
  { name: 'Thai', native: 'ไทย', flag: '🇹🇭' },
  { name: 'Vietnamese', native: 'Tiếng Việt', flag: '🇻🇳' },
  { name: 'Arabic', native: 'العربية', flag: '🇸🇦' },
  { name: 'Turkish', native: 'Türkçe', flag: '🇹🇷' },
  { name: 'Persian', native: 'فارسی', flag: '🇮🇷' },
  { name: 'Greek', native: 'Ελληνικά', flag: '🇬🇷' },
  { name: 'Hausa', native: 'Hausa', flag: '🌍' },
  { name: 'Yoruba', native: 'Yorùbá', flag: '🌍' },
  { name: 'Igbo', native: 'Asụsụ Igbo', flag: '🌍' },
  { name: 'Amharic', native: 'አማርኛ', flag: '🇪🇹' },
  { name: 'Somali', native: 'Soomaali', flag: '🇸🇴' },
  { name: 'Zulu', native: 'isiZulu', flag: '🇿🇦' },
  { name: 'Afrikaans', native: 'Afrikaans', flag: '🇿🇦' },
];

function LanguagePicker({ label, value, onChange, id }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const selected = LANGUAGES.find((language) => language.name === value);

  const filtered = useMemo(() => {
    const search = query.trim().toLowerCase();

    if (!search) return LANGUAGES;

    return LANGUAGES.filter((language) =>
      `${language.name} ${language.native}`.toLowerCase().includes(search),
    );
  }, [query]);

  return (
    <div className="translator-language">
      <label htmlFor={`${id}-search`}>{label}</label>

      <div className="translator-picker">
        <button
          type="button"
          className="translator-picker-button"
          onClick={() => {
            setOpen(!open);
            setQuery('');
          }}
          aria-expanded={open}
        >
          <span className="translator-language-flag">{selected?.flag}</span>
          <span className="translator-language-name">
            <strong>{selected?.name}</strong>
            <small>{selected?.native}</small>
          </span>
          <span className="translator-picker-chevron">⌄</span>
        </button>

        {open && (
          <div className="translator-picker-menu">
            <input
              id={`${id}-search`}
              type="search"
              autoFocus
              placeholder="Search languages..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              className="translator-language-search"
            />

            <div className="translator-language-options">
              {filtered.map((language) => (
                <button
                  type="button"
                  key={language.name}
                  className={`translator-language-option ${
                    value === language.name ? 'selected' : ''
                  }`}
                  onClick={() => {
                    onChange(language.name);
                    setOpen(false);
                    setQuery('');
                  }}
                >
                  <span>{language.flag}</span>
                  <span>
                    <strong>{language.name}</strong>
                    <small>{language.native}</small>
                  </span>
                  {value === language.name && <Check size={16} />}
                </button>
              ))}

              {filtered.length === 0 && (
                <p className="translator-no-languages">No languages found.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AITranslator({ onBack }) {
  const [sourceLanguage, setSourceLanguage] = useState('English');
  const [targetLanguage, setTargetLanguage] = useState('Swahili');
  const [input, setInput] = useState('');
  const [translation, setTranslation] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  function swapLanguages() {
    setSourceLanguage(targetLanguage);
    setTargetLanguage(sourceLanguage);
    setInput(translation);
    setTranslation(input);
    setError('');
  }

  async function translateText() {
    if (!input.trim()) {
      setError('Enter some text to translate first.');
      return;
    }

    if (input.trim().length > 4000) {
      setError('Please keep your text under 4,000 characters.');
      return;
    }

    if (sourceLanguage === targetLanguage) {
      setError('Choose two different languages to translate between.');
      return;
    }

    setLoading(true);
    setError('');
    setTranslation('');
    setCopied(false);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:3001`}/api/ai/write`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zanahub_token') || ''}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: 'translate',
          prompt:
            `Translate the following text from ${sourceLanguage} to ${targetLanguage}. ` +
            'Preserve its original meaning, tone, and formatting. ' +
            'Return the translation only, without an introduction or explanation.\n\n' +
            `Text to translate:\n${input.trim()}`,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Translation failed. Please try again.');
      }

      if (!data.text) {
        throw new Error('No translation was returned. Please try again.');
      }

      setTranslation(data.text.trim());
    } catch (err) {
      setError(
        err.message ||
          'Could not connect to the AI service. Make sure the ZanaHub backend is running.',
      );
    } finally {
      setLoading(false);
    }
  }

  async function copyTranslation() {
    if (!translation) return;

    try {
      await navigator.clipboard.writeText(translation);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. Please select the translated text and copy it manually.');
    }
  }

  function clearAll() {
    setInput('');
    setTranslation('');
    setError('');
    setCopied(false);
  }

  return (
    <section className="translator-page">
      <button className="translator-back-button" onClick={onBack}>
        <span>←</span> Back to tools
      </button>

      <div className="translator-heading">
        <div className="translator-heading-icon">
          <Languages size={29} />
        </div>

        <div>
          <div className="translator-eyebrow">
            <Sparkles size={14} /> POWERED BY AI
          </div>
          <h1>AI <span>Translator</span></h1>
          <p>Break language barriers and connect with the world.</p>
        </div>
      </div>

      <div className="translator-workspace">
        <div className="translator-language-bar">
          <LanguagePicker
            label="TRANSLATE FROM"
            value={sourceLanguage}
            onChange={setSourceLanguage}
            id="translator-source"
          />

          <button
            type="button"
            className="translator-swap-button"
            onClick={swapLanguages}
            title="Swap languages"
            aria-label="Swap languages"
          >
            <ArrowLeftRight size={20} />
          </button>

          <LanguagePicker
            label="TRANSLATE TO"
            value={targetLanguage}
            onChange={setTargetLanguage}
            id="translator-target"
          />
        </div>

        <div className="translator-panels">
          <div className="translator-panel">
            <div className="translator-panel-heading">
              <span>Your text</span>
              <span className="translator-character-count">
                {input.length}/4000
              </span>
            </div>

            <textarea
              value={input}
              onChange={(event) => {
                setInput(event.target.value);
                setError('');
              }}
              maxLength={4000}
              placeholder="Type or paste the text you want to translate..."
              aria-label="Text to translate"
            />

            <div className="translator-panel-footer">
              <span>{sourceLanguage}</span>
              <button
                type="button"
                className="translator-clear-button"
                onClick={clearAll}
                disabled={!input && !translation}
              >
                <Trash2 size={15} /> Clear
              </button>
            </div>
          </div>

          <div className="translator-panel translator-output-panel">
            <div className="translator-panel-heading">
              <span>Translation</span>
              <span className="translator-output-label">
                {loading ? 'TRANSLATING...' : targetLanguage.toUpperCase()}
              </span>
            </div>

            <div className={`translator-output ${!translation ? 'empty' : ''}`}>
              {loading ? (
                <div className="translator-loading">
                  <LoaderCircle size={28} className="translator-spinner" />
                  <strong>Translating your text...</strong>
                  <span>Our AI is working on it.</span>
                </div>
              ) : translation ? (
                <p>{translation}</p>
              ) : (
                <div className="translator-placeholder">
                  <Languages size={32} />
                  <span>Your translation will appear here.</span>
                </div>
              )}
            </div>

            <div className="translator-panel-footer">
              <span>{targetLanguage}</span>
              <button
                type="button"
                className="translator-clear-button"
                onClick={copyTranslation}
                disabled={!translation}
              >
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="translator-error" role="alert">
            <AlertCircle size={17} />
            <span>{error}</span>
          </div>
        )}

        <button
          type="button"
          className="translator-submit-button"
          onClick={translateText}
          disabled={loading || !input.trim()}
        >
          {loading ? (
            <>
              <LoaderCircle size={19} className="translator-spinner" />
              Translating...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Translate with AI
            </>
          )}
        </button>

        <p className="translator-footer-note">
          <Sparkles size={14} />
          30 languages · AI-powered translation · Copy in one click
        </p>
      </div>
    </section>
  );
}
