import { useState } from 'react';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Eye,
  UserRound,
  GraduationCap,
  BriefcaseBusiness,
  Wrench,
} from 'lucide-react';
import './CVBuilder.css';

const emptyEducation = {
  school: '',
  qualification: '',
  start: '',
  end: '',
  details: '',
};

const emptyExperience = {
  company: '',
  role: '',
  start: '',
  end: '',
  details: '',
};

export default function CVBuilder({ onBack }) {
  const [template, setTemplate] = useState('classic');
  const [form, setForm] = useState({
    name: '',
    title: '',
    email: '',
    phone: '',
    location: '',
    summary: '',
    skills: '',
    languages: '',
    certificates: '',
    education: [{ ...emptyEducation }],
    experience: [{ ...emptyExperience }],
  });

  function updateField(field, value) {
    setForm((previous) => ({ ...previous, [field]: value }));
  }

  function updateItem(section, index, field, value) {
    setForm((previous) => ({
      ...previous,
      [section]: previous[section].map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  }

  function addItem(section, emptyItem) {
    setForm((previous) => ({
      ...previous,
      [section]: [...previous[section], { ...emptyItem }],
    }));
  }

  function removeItem(section, index) {
    setForm((previous) => ({
      ...previous,
      [section]: previous[section].filter((_, i) => i !== index),
    }));
  }

  function downloadPDF() {
    if (!form.name.trim()) {
      window.alert('Please enter your full name before downloading your CV.');
      return;
    }

    window.print();
  }

  const skills = form.skills.split(',').map((item) => item.trim()).filter(Boolean);
  const languages = form.languages.split(',').map((item) => item.trim()).filter(Boolean);
  const certificates = form.certificates.split('\n').map((item) => item.trim()).filter(Boolean);

  return (
    <div className="cv-builder">
      <header className="cv-topbar">
        <button className="cv-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to tools
        </button>

        <div>
          <h1>CV Builder</h1>
          <p>Create a professional CV for your next opportunity.</p>
        </div>

        <button className="cv-download" onClick={downloadPDF}>
          <Download size={18} /> Download PDF
        </button>
      </header>

      <div className="cv-workspace">
        <section className="cv-editor">
          <div className="cv-section-heading">
            <UserRound size={19} />
            <div>
              <h2>Personal information</h2>
              <p>Introduce yourself to employers.</p>
            </div>
          </div>

          <div className="cv-form-grid">
            <label>
              Full name *
              <input
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                placeholder="e.g. Amina Joseph"
              />
            </label>

            <label>
              Professional title
              <input
                value={form.title}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder="e.g. Software Developer"
              />
            </label>

            <label>
              Email address
              <input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="amina@example.com"
              />
            </label>

            <label>
              Phone number
              <input
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="+255..."
              />
            </label>

            <label className="cv-full-width">
              Location
              <input
                value={form.location}
                onChange={(e) => updateField('location', e.target.value)}
                placeholder="e.g. Dar es Salaam, Tanzania"
              />
            </label>

            <label className="cv-full-width">
              Professional summary
              <textarea
                rows="4"
                value={form.summary}
                onChange={(e) => updateField('summary', e.target.value)}
                placeholder="Briefly describe your experience, strengths, and career goals."
              />
            </label>
          </div>

          <div className="cv-section-heading">
            <GraduationCap size={20} />
            <div>
              <h2>Education</h2>
              <p>Add your academic qualifications.</p>
            </div>
          </div>

          {form.education.map((item, index) => (
            <div className="cv-entry" key={`education-${index}`}>
              <div className="cv-entry-heading">
                <strong>Education {index + 1}</strong>
                {form.education.length > 1 && (
                  <button
                    className="cv-remove"
                    onClick={() => removeItem('education', index)}
                    aria-label="Remove education"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <label>
                School or institution
                <input
                  value={item.school}
                  onChange={(e) => updateItem('education', index, 'school', e.target.value)}
                  placeholder="School, college, or university"
                />
              </label>

              <label>
                Qualification
                <input
                  value={item.qualification}
                  onChange={(e) => updateItem('education', index, 'qualification', e.target.value)}
                  placeholder="e.g. Diploma in Business"
                />
              </label>

              <div className="cv-form-grid">
                <label>
                  Start year
                  <input
                    value={item.start}
                    onChange={(e) => updateItem('education', index, 'start', e.target.value)}
                    placeholder="2022"
                  />
                </label>
                <label>
                  End year
                  <input
                    value={item.end}
                    onChange={(e) => updateItem('education', index, 'end', e.target.value)}
                    placeholder="2025 or Present"
                  />
                </label>
              </div>

              <label>
                Additional details
                <textarea
                  rows="2"
                  value={item.details}
                  onChange={(e) => updateItem('education', index, 'details', e.target.value)}
                  placeholder="Relevant subjects, achievements, or results"
                />
              </label>
            </div>
          ))}

          <button className="cv-add" onClick={() => addItem('education', emptyEducation)}>
            <Plus size={17} /> Add education
          </button>

          <div className="cv-section-heading">
            <BriefcaseBusiness size={20} />
            <div>
              <h2>Work experience</h2>
              <p>Include employment, internships, or relevant experience.</p>
            </div>
          </div>

          {form.experience.map((item, index) => (
            <div className="cv-entry" key={`experience-${index}`}>
              <div className="cv-entry-heading">
                <strong>Experience {index + 1}</strong>
                {form.experience.length > 1 && (
                  <button
                    className="cv-remove"
                    onClick={() => removeItem('experience', index)}
                    aria-label="Remove experience"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <label>
                Job title
                <input
                  value={item.role}
                  onChange={(e) => updateItem('experience', index, 'role', e.target.value)}
                  placeholder="e.g. Sales Assistant"
                />
              </label>

              <label>
                Company or organization
                <input
                  value={item.company}
                  onChange={(e) => updateItem('experience', index, 'company', e.target.value)}
                  placeholder="Organization name"
                />
              </label>

              <div className="cv-form-grid">
                <label>
                  Start date
                  <input
                    value={item.start}
                    onChange={(e) => updateItem('experience', index, 'start', e.target.value)}
                    placeholder="Jan 2024"
                  />
                </label>
                <label>
                  End date
                  <input
                    value={item.end}
                    onChange={(e) => updateItem('experience', index, 'end', e.target.value)}
                    placeholder="Present"
                  />
                </label>
              </div>

              <label>
                Responsibilities and achievements
                <textarea
                  rows="3"
                  value={item.details}
                  onChange={(e) => updateItem('experience', index, 'details', e.target.value)}
                  placeholder="Describe what you did and what you achieved."
                />
              </label>
            </div>
          ))}

          <button className="cv-add" onClick={() => addItem('experience', emptyExperience)}>
            <Plus size={17} /> Add experience
          </button>

          <div className="cv-section-heading">
            <Wrench size={20} />
            <div>
              <h2>Skills and additional information</h2>
              <p>Highlight what makes you a strong candidate.</p>
            </div>
          </div>

          <label>
            Skills
            <textarea
              rows="3"
              value={form.skills}
              onChange={(e) => updateField('skills', e.target.value)}
              placeholder="Communication, Microsoft Excel, teamwork (separate with commas)"
            />
          </label>

          <label>
            Languages
            <input
              value={form.languages}
              onChange={(e) => updateField('languages', e.target.value)}
              placeholder="Swahili, English"
            />
          </label>

          <label>
            Certificates
            <textarea
              rows="3"
              value={form.certificates}
              onChange={(e) => updateField('certificates', e.target.value)}
              placeholder={'One certificate per line'}
            />
          </label>
        </section>

        <section className="cv-preview-panel">
          <div className="cv-preview-toolbar">
            <div>
              <Eye size={18} />
              <strong>Live preview</strong>
            </div>

            <select
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              aria-label="Choose CV template"
            >
              <option value="classic">Classic — Professional</option>
              <option value="modern">Modern — Stylish</option>
              <option value="corporate">Corporate Blue</option>
              <option value="executive">Executive Black</option>
              <option value="creative">Creative Purple</option>
              <option value="green">Fresh Green</option>
              <option value="warm">Warm Minimal</option>
              <option value="ats">ATS Friendly</option>
            </select>
          </div>

          <article className={`cv-paper cv-template-${template}`}>
            <div className="cv-paper-header">
              <h1>{form.name || 'Your Full Name'}</h1>
              {form.title && <h2>{form.title}</h2>}
              <div className="cv-contact">
                {[form.email, form.phone, form.location].filter(Boolean).join('  •  ') ||
                  'Email • Phone • Location'}
              </div>
            </div>

            {form.summary && (
              <section className="cv-paper-section">
                <h3>PROFESSIONAL SUMMARY</h3>
                <p className="cv-preserve-lines">{form.summary}</p>
              </section>
            )}

            {form.experience.some((item) => item.role || item.company || item.details) && (
              <section className="cv-paper-section">
                <h3>WORK EXPERIENCE</h3>
                {form.experience
                  .filter((item) => item.role || item.company || item.details)
                  .map((item, index) => (
                    <div className="cv-paper-entry" key={index}>
                      <div className="cv-paper-entry-title">
                        <strong>{item.role || item.company}</strong>
                        <span>{[item.start, item.end].filter(Boolean).join(' – ')}</span>
                      </div>
                      {item.role && item.company && <div className="cv-paper-subtitle">{item.company}</div>}
                      {item.details && <p className="cv-preserve-lines">{item.details}</p>}
                    </div>
                  ))}
              </section>
            )}

            {form.education.some((item) => item.school || item.qualification || item.details) && (
              <section className="cv-paper-section">
                <h3>EDUCATION</h3>
                {form.education
                  .filter((item) => item.school || item.qualification || item.details)
                  .map((item, index) => (
                    <div className="cv-paper-entry" key={index}>
                      <div className="cv-paper-entry-title">
                        <strong>{item.qualification || item.school}</strong>
                        <span>{[item.start, item.end].filter(Boolean).join(' – ')}</span>
                      </div>
                      {item.qualification && item.school && <div className="cv-paper-subtitle">{item.school}</div>}
                      {item.details && <p className="cv-preserve-lines">{item.details}</p>}
                    </div>
                  ))}
              </section>
            )}

            {skills.length > 0 && (
              <section className="cv-paper-section">
                <h3>SKILLS</h3>
                <p>{skills.join(' • ')}</p>
              </section>
            )}

            {languages.length > 0 && (
              <section className="cv-paper-section">
                <h3>LANGUAGES</h3>
                <p>{languages.join(' • ')}</p>
              </section>
            )}

            {certificates.length > 0 && (
              <section className="cv-paper-section">
                <h3>CERTIFICATES</h3>
                <ul>
                  {certificates.map((certificate, index) => (
                    <li key={index}>{certificate}</li>
                  ))}
                </ul>
              </section>
            )}
          </article>

          <p className="cv-preview-hint">
            Your information updates here as you type. Choose Download PDF to print or save your CV.
          </p>
        </section>
      </div>
    </div>
  );
}
