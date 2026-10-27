import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2, Save, RotateCcw, Printer, GraduationCap } from 'lucide-react';
import './GPACalculator.css';

const STORAGE_KEY = 'zanahub_gpa_calculator_v1';

const defaultSubjects = [
  { id: 1, name: 'Mathematics', credits: 1, grade: 'A' },
  { id: 2, name: 'English', credits: 1, grade: 'B' },
  { id: 3, name: 'Science', credits: 1, grade: 'A' },
];

const defaultScale = [
  { grade: 'A', points: 5 },
  { grade: 'B', points: 4 },
  { grade: 'C', points: 3 },
  { grade: 'D', points: 2 },
  { grade: 'E', points: 1 },
  { grade: 'F', points: 0 },
];

function loadSavedData() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        subjects: Array.isArray(parsed.subjects) ? parsed.subjects : defaultSubjects,
        scale: Array.isArray(parsed.scale) && parsed.scale.length ? parsed.scale : defaultScale,
        studentName: parsed.studentName || '',
        institution: parsed.institution || '',
      };
    }
  } catch {
    // Start with a fresh calculator if saved data cannot be read.
  }

  return {
    subjects: defaultSubjects,
    scale: defaultScale,
    studentName: '',
    institution: '',
  };
}

export default function GPACalculator({ onBack }) {
  const [initial] = useState(loadSavedData);
  const [subjects, setSubjects] = useState(initial.subjects);
  const [scale, setScale] = useState(initial.scale);
  const [studentName, setStudentName] = useState(initial.studentName);
  const [institution, setInstitution] = useState(initial.institution);
  const [notice, setNotice] = useState('');

  const gradePoints = useMemo(
    () => Object.fromEntries(scale.map((item) => [item.grade, Number(item.points) || 0])),
    [scale]
  );

  const totalCredits = subjects.reduce(
    (sum, subject) => sum + Math.max(0, Number(subject.credits) || 0),
    0
  );

  const totalPoints = subjects.reduce(
    (sum, subject) =>
      sum +
      (gradePoints[subject.grade] ?? 0) *
        Math.max(0, Number(subject.credits) || 0),
    0
  );

  const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;

  useEffect(() => {
    if (!notice) return undefined;
    const timer = setTimeout(() => setNotice(''), 3500);
    return () => clearTimeout(timer);
  }, [notice]);

  function updateSubject(id, key, value) {
    setSubjects((current) =>
      current.map((subject) =>
        subject.id === id ? { ...subject, [key]: value } : subject
      )
    );
  }

  function addSubject() {
    setSubjects((current) => [
      ...current,
      {
        id: Date.now() + Math.floor(Math.random() * 1000),
        name: '',
        credits: 1,
        grade: scale[0]?.grade || 'A',
      },
    ]);
  }

  function updateScale(index, key, value) {
    setScale((current) =>
      current.map((item, i) =>
        i === index
          ? { ...item, [key]: key === 'points' ? value : value.toUpperCase() }
          : item
      )
    );
  }

  function addGrade() {
    setScale((current) => [
      ...current,
      { grade: `G${current.length + 1}`, points: 0 },
    ]);
  }

  function saveResults() {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ subjects, scale, studentName, institution })
      );
      setNotice('GPA results saved on this device.');
    } catch {
      setNotice('Could not save. Check your browser storage settings.');
    }
  }

  function resetCalculator() {
    if (!window.confirm('Reset all subjects and restore the default grading scale?')) return;
    setSubjects([]);
    setScale(defaultScale);
    setStudentName('');
    setInstitution('');
    localStorage.removeItem(STORAGE_KEY);
    setNotice('Calculator reset.');
  }

  function printReport() {
    window.print();
  }

  return (
    <main className="gpa-page">
      <div className="gpa-top-actions">
        <button className="gpa-back-button" onClick={onBack}>
          <ArrowLeft size={18} /> Back to tools
        </button>
        <span className="gpa-local-label">Saved locally on this device</span>
      </div>

      <header className="gpa-hero">
        <div className="gpa-hero-icon"><GraduationCap size={30} /></div>
        <div>
          <p className="gpa-eyebrow">EDUCATION TOOLS</p>
          <h1>GPA Calculator</h1>
          <p>Calculate your grade point average using your institution’s grading scale.</p>
        </div>
      </header>

      <section className="gpa-summary-grid">
        <article className="gpa-summary-card gpa-highlight">
          <span>Calculated GPA</span>
          <strong>{gpa.toFixed(2)}</strong>
          <small>Out of {Math.max(0, ...scale.map((item) => Number(item.points) || 0)).toFixed(2)}</small>
        </article>
        <article className="gpa-summary-card">
          <span>Subjects</span>
          <strong>{subjects.length}</strong>
          <small>Entered subjects</small>
        </article>
        <article className="gpa-summary-card">
          <span>Total credits</span>
          <strong>{totalCredits.toFixed(1)}</strong>
          <small>Weighted by credits</small>
        </article>
      </section>

      <section className="gpa-panel">
        <h2>Student details</h2>
        <div className="gpa-two-columns">
          <label>
            Student name (optional)
            <input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Enter your name" />
          </label>
          <label>
            School or institution (optional)
            <input value={institution} onChange={(e) => setInstitution(e.target.value)} placeholder="Enter institution name" />
          </label>
        </div>
      </section>

      <section className="gpa-panel">
        <div className="gpa-section-heading">
          <div>
            <h2>Subjects and grades</h2>
            <p>Enter each subject’s credit units and the grade you received.</p>
          </div>
          <button className="gpa-primary-button" onClick={addSubject}><Plus size={17} /> Add subject</button>
        </div>

        <div className="gpa-table-wrap">
          <table className="gpa-table">
            <thead>
              <tr><th>Subject</th><th>Credits</th><th>Grade</th><th>Grade points</th><th></th></tr>
            </thead>
            <tbody>
              {subjects.map((subject) => (
                <tr key={subject.id}>
                  <td>
                    <input
                      aria-label="Subject name"
                      value={subject.name}
                      onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                      placeholder="Subject name"
                    />
                  </td>
                  <td>
                    <input
                      aria-label="Credit units"
                      type="number"
                      min="0"
                      step="0.5"
                      value={subject.credits}
                      onChange={(e) => updateSubject(subject.id, 'credits', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      aria-label="Grade"
                      value={subject.grade}
                      onChange={(e) => updateSubject(subject.id, 'grade', e.target.value)}
                    >
                      {scale.map((item, index) => (
                        <option key={`${item.grade}-${index}`} value={item.grade}>{item.grade}</option>
                      ))}
                    </select>
                  </td>
                  <td className="gpa-points-cell">{(gradePoints[subject.grade] ?? 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="gpa-icon-button"
                      aria-label={`Remove ${subject.name || 'subject'}`}
                      onClick={() => setSubjects((current) => current.filter((item) => item.id !== subject.id))}
                    ><Trash2 size={17} /></button>
                  </td>
                </tr>
              ))}
              {subjects.length === 0 && (
                <tr><td colSpan="5" className="gpa-empty">No subjects yet. Select “Add subject” to begin.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <p className="gpa-formula-note">GPA is calculated as the sum of (grade points × credits), divided by total credits.</p>
      </section>

      <section className="gpa-panel">
        <div className="gpa-section-heading">
          <div>
            <h2>Grading scale</h2>
            <p>Adjust these values to match your school or university.</p>
          </div>
          <button className="gpa-secondary-button" onClick={addGrade}><Plus size={16} /> Add grade</button>
        </div>

        <div className="gpa-scale-grid">
          {scale.map((item, index) => (
            <div className="gpa-scale-item" key={`${item.grade}-${index}`}>
              <label>
                Grade
                <input value={item.grade} onChange={(e) => updateScale(index, 'grade', e.target.value)} maxLength="5" />
              </label>
              <label>
                Points
                <input type="number" min="0" step="0.1" value={item.points} onChange={(e) => updateScale(index, 'points', e.target.value)} />
              </label>
              <button
                className="gpa-icon-button"
                aria-label={`Remove grade ${item.grade}`}
                onClick={() => setScale((current) => current.filter((_, i) => i !== index))}
              ><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
        <p className="gpa-formula-note">This is a customizable example scale, not an official grading standard. Check your institution’s rules.</p>
      </section>

      <div className="gpa-footer-actions">
        <button className="gpa-primary-button" onClick={saveResults}><Save size={17} /> Save results</button>
        <button className="gpa-secondary-button" onClick={printReport}><Printer size={17} /> Print report</button>
        <button className="gpa-reset-button" onClick={resetCalculator}><RotateCcw size={17} /> Reset</button>
      </div>

      {notice && <div className="gpa-notice" role="status">{notice}</div>}
      <p className="gpa-storage-note">Saved data stays in this browser on this device. It is not synced across devices.</p>
    </main>
  );
}
