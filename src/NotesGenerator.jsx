import { useEffect, useState } from 'react';
import {
  ArrowLeft, Sparkles, Save, Trash2, Printer, Copy,
  Check, BookOpen, Download, FolderOpen, Plus, X
} from 'lucide-react';
import './NotesGenerator.css';

const STORAGE_KEY = 'zanahub_saved_study_notes_v1';
const API_URL = import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

const levels = [
  'Primary school',
  'Secondary school',
  'Advanced secondary school',
  'College',
  'University',
  'General learning',
];

const formats = [
  { value: 'balanced', label: 'Balanced notes' },
  { value: 'detailed', label: 'Detailed notes' },
  { value: 'quick', label: 'Quick revision' },
];

function readSavedNotes() {
  try {
    const value = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export default function NotesGenerator({ onBack }) {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('Secondary school');
  const [format, setFormat] = useState('balanced');
  const [extra, setExtra] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [savedNotes, setSavedNotes] = useState(readSavedNotes);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3000);
    return () => clearTimeout(timer);
  }, [notice]);

  async function generateNotes(event) {
    event.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setError('Enter both a subject and a topic first.');
      return;
    }

    setLoading(true);
    setError('');
    setNotice('');
    setNotes('');

    const styleInstructions = {
      balanced: 'Create clear, well-organized notes with enough detail to understand the topic.',
      detailed: 'Create thorough study notes with explanations, important terminology, worked examples where appropriate, and useful connections between ideas.',
      quick: 'Create concise revision notes focused on the most important facts, formulas, definitions, and ideas.',
    };

    const prompt = [
      'Create educational study notes for a student.',
      `Subject: ${subject.trim()}`,
      `Topic: ${topic.trim()}`,
      `Education level: ${level}`,
      styleInstructions[format],
      extra.trim() ? `Additional requirements: ${extra.trim()}` : '',
      '',
      'Use a clear title and meaningful headings.',
      'Include key definitions, important points, and examples where appropriate.',
      'Explain ideas at the specified education level using clear language.',
      'Finish with a section called "Revision Questions" containing 5 questions and a section called "Answer Key" with concise answers.',
      'Do not invent quotations, citations, or claims of official curriculum alignment. If a detail is uncertain, state that clearly.',
      'Return plain text with readable headings and numbered or bulleted lists.',
    ].filter(Boolean).join('\n');

    try {
      const response = await fetch(`${API_URL}/api/ai/write`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('zanahub_token') || ''}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, task: 'write' }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Could not generate study notes.');
      }
      setNotes(data.text || '');
      if (!data.text) setError('The AI returned empty notes. Please try again.');
    } catch (err) {
      setError(err.message || 'Could not connect to the AI server.');
    } finally {
      setLoading(false);
    }
  }

  function saveCurrentNotes() {
    if (!notes.trim()) {
      setError('Generate or write some notes before saving.');
      return;
    }

    const entry = {
      id: Date.now(),
      subject: subject.trim() || 'Untitled subject',
      topic: topic.trim() || 'Untitled topic',
      level,
      format,
      content: notes,
      updatedAt: new Date().toISOString(),
    };

    const updated = [entry, ...savedNotes];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedNotes(updated);
      setNotice('Your study notes have been saved on this device.');
      setError('');
    } catch {
      setError('Could not save notes. Your browser storage may be full.');
    }
  }

  function openSavedNote(entry) {
    setSubject(entry.subject === 'Untitled subject' ? '' : entry.subject);
    setTopic(entry.topic === 'Untitled topic' ? '' : entry.topic);
    setLevel(entry.level || 'Secondary school');
    setFormat(entry.format || 'balanced');
    setNotes(entry.content || '');
    setError('');
    setNotice('Saved notes opened.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function deleteSavedNote(id) {
    if (!window.confirm('Delete these saved notes?')) return;
    const updated = savedNotes.filter((entry) => entry.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setSavedNotes(updated);
      setNotice('Saved notes deleted.');
    } catch {
      setError('Could not update saved notes.');
    }
  }

  async function copyNotes() {
    try {
      await navigator.clipboard.writeText(notes);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      setError('Copy failed. You can select the notes and copy them manually.');
    }
  }

  function downloadNotes() {
    if (!notes.trim()) {
      setError('Generate or write some notes before downloading.');
      return;
    }
    const blob = new Blob([`${subject || 'Study Notes'}\n${topic || ''}\n\n${notes}`], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${(topic || 'study-notes').replace(/[^a-z0-9-_]/gi, '-').toLowerCase()}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  }

  function clearEditor() {
    setNotes('');
    setError('');
    setNotice('');
    setCopied(false);
  }

  return (
    <main className="notesgen-page">
      <button type="button" className="notesgen-back" onClick={onBack}>
        <ArrowLeft size={18} /> Back to tools
      </button>

      <header className="notesgen-hero">
        <div className="notesgen-hero-icon"><BookOpen size={30} /></div>
        <div>
          <p className="notesgen-eyebrow">ZANAHUB EDUCATION</p>
          <h1>Notes Generator</h1>
          <p>Turn any study topic into clear notes and revision questions.</p>
        </div>
      </header>

      <div className="notesgen-layout">
        <section className="notesgen-panel notesgen-form-panel">
          <div className="notesgen-panel-title">
            <div>
              <h2>Create study notes</h2>
              <p>Choose your topic and how you want to study it.</p>
            </div>
            <Sparkles size={21} />
          </div>

          <form onSubmit={generateNotes}>
            <label className="notesgen-label">
              Subject
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Biology, History, Mathematics"
                maxLength={100}
              />
            </label>

            <label className="notesgen-label">
              Topic or chapter
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Photosynthesis"
                maxLength={160}
              />
            </label>

            <label className="notesgen-label">
              Education level
              <select value={level} onChange={(e) => setLevel(e.target.value)}>
                {levels.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>

            <fieldset className="notesgen-format-fieldset">
              <legend>Note style</legend>
              <div className="notesgen-format-options">
                {formats.map((item) => (
                  <button
                    type="button"
                    key={item.value}
                    className={`notesgen-format-option ${format === item.value ? 'selected' : ''}`}
                    onClick={() => setFormat(item.value)}
                    aria-pressed={format === item.value}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="notesgen-label">
              Extra instructions <span>(optional)</span>
              <textarea
                value={extra}
                onChange={(e) => setExtra(e.target.value)}
                placeholder="e.g. Include formulas, examples, or important dates."
                rows={3}
                maxLength={500}
              />
            </label>

            <button className="notesgen-generate" type="submit" disabled={loading}>
              {loading ? <span className="notesgen-spinner" /> : <Sparkles size={18} />}
              {loading ? 'Generating notes…' : 'Generate study notes'}
            </button>
            <p className="notesgen-hint">AI-generated notes may contain mistakes. Check important facts against your textbooks and teacher’s guidance.</p>
          </form>
        </section>

        <section className="notesgen-panel notesgen-result-panel">
          <div className="notesgen-panel-title">
            <div>
              <h2>Your study notes</h2>
              <p>Edit the generated content before saving or printing.</p>
            </div>
            <button className="notesgen-small-button" type="button" onClick={clearEditor} disabled={!notes}>
              <X size={15} /> Clear
            </button>
          </div>

          {error && <div className="notesgen-error" role="alert">{error}</div>}

          <div className="notesgen-result-meta">
            {subject.trim() || 'Your subject'} {topic.trim() ? `· ${topic.trim()}` : ''}
          </div>

          <textarea
            className="notesgen-editor"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Your generated notes will appear here. You can also type or paste your own notes."
            rows={23}
            aria-label="Editable study notes"
          />

          <div className="notesgen-result-actions">
            <button type="button" onClick={saveCurrentNotes} disabled={!notes.trim()}>
              <Save size={16} /> Save
            </button>
            <button type="button" onClick={copyNotes} disabled={!notes.trim()}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button type="button" onClick={downloadNotes} disabled={!notes.trim()}>
              <Download size={16} /> Download
            </button>
            <button type="button" onClick={() => window.print()} disabled={!notes.trim()}>
              <Printer size={16} /> Print / PDF
            </button>
          </div>
        </section>
      </div>

      <section className="notesgen-panel notesgen-saved-panel">
        <div className="notesgen-panel-title">
          <div>
            <h2><FolderOpen size={19} /> Saved notes</h2>
            <p>Reopen notes you saved in this browser.</p>
          </div>
          <span className="notesgen-saved-count">{savedNotes.length}</span>
        </div>

        {savedNotes.length === 0 ? (
          <div className="notesgen-empty">
            <BookOpen size={24} />
            <p>No saved notes yet. Generate notes and select Save.</p>
          </div>
        ) : (
          <div className="notesgen-saved-list">
            {savedNotes.map((entry) => (
              <article className="notesgen-saved-item" key={entry.id}>
                <div className="notesgen-saved-item-icon"><BookOpen size={18} /></div>
                <div className="notesgen-saved-info">
                  <strong>{entry.topic}</strong>
                  <span>{entry.subject} · {entry.level || 'Study notes'}</span>
                  <small>{entry.updatedAt ? new Date(entry.updatedAt).toLocaleString() : ''}</small>
                </div>
                <button type="button" className="notesgen-open-button" onClick={() => openSavedNote(entry)}>Open</button>
                <button type="button" className="notesgen-delete-button" aria-label={`Delete ${entry.topic}`} onClick={() => deleteSavedNote(entry.id)}><Trash2 size={17} /></button>
              </article>
            ))}
          </div>
        )}
      </section>

      {notice && <div className="notesgen-notice" role="status">{notice}</div>}
      <p className="notesgen-storage-note">Notes are stored in this browser on this device. They are not synced to other devices.</p>
    </main>
  );
}
