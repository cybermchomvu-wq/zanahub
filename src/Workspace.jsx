import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FolderKanban, FileText, Clock3, Plus, Search, Trash2, Pencil,
  X, ArrowUpRight, FolderOpen, StickyNote, BriefcaseBusiness,
  GraduationCap, Palette, UserRound, LoaderCircle, RefreshCw,
} from 'lucide-react';
import './Workspace.css';

const API_BASE = (
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV
    ? `${window.location.protocol}//${window.location.hostname}:3001`
    : 'https://zanahub-api.onrender.com')
).replace(/\/$/, '');

const categories = [
  'School Assignments',
  'Business Documents',
  'Social Media Designs',
  'Personal Projects',
  'Job Applications',
  'Other',
];

const emptyProject = {
  name: '',
  description: '',
  color: 'violet',
};

const emptyNote = {
  title: '',
  content: '',
  projectId: '',
};

function formatDate(value) {
  if (!value) return 'Recently';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Recently';

  return new Intl.DateTimeFormat(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export default function Workspace({ currentUser }) {
  const [section, setSection] = useState('Overview');
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [noteForm, setNoteForm] = useState(emptyNote);
  const [saving, setSaving] = useState(false);

  const token = () => localStorage.getItem('zanahub_token');

  const request = useCallback(async (path, options = {}) => {
    const authToken = token();
    if (!authToken) throw new Error('Please sign in to use your workspace.');

    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${authToken}`,
        ...options.headers,
      },
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || 'Something went wrong. Please try again.');
    }
    return data;
  }, []);

  const loadWorkspace = useCallback(async () => {
    if (!token()) {
      setLoading(false);
      setError('Sign in to access your personal workspace.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = await request('/api/workspace');
      setProjects(data.projects || []);
      setNotes(data.notes || []);
    } catch (err) {
      setError(err.message || 'Could not load your workspace.');
    } finally {
      setLoading(false);
    }
  }, [request]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const recentItems = useMemo(() => [
    ...projects.map((item) => ({
      ...item,
      kind: 'Project',
      date: item.updated_at,
    })),
    ...notes.map((item) => ({
      ...item,
      kind: 'Note',
      date: item.updated_at,
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6), [projects, notes]);

  const filteredProjects = projects.filter((project) =>
    `${project.name} ${project.description}`.toLowerCase().includes(search.toLowerCase())
  );

  const filteredNotes = notes.filter((note) =>
    `${note.title} ${note.content}`.toLowerCase().includes(search.toLowerCase())
  );

  function openProject(project = null) {
    setProjectForm(project ? {
      name: project.name,
      description: project.description || '',
      color: project.color || 'violet',
    } : emptyProject);
    setModal({ type: 'project', item: project });
  }

  function openNote(note = null) {
    setNoteForm(note ? {
      title: note.title,
      content: note.content || '',
      projectId: note.project_id ? String(note.project_id) : '',
    } : emptyNote);
    setModal({ type: 'note', item: note });
  }

  async function saveProject(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const editing = modal.item;
      const path = editing
        ? `/api/workspace/projects/${editing.id}`
        : '/api/workspace/projects';

      await request(path, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(projectForm),
      });

      setModal(null);
      await loadWorkspace();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function saveNote(event) {
    event.preventDefault();
    setSaving(true);
    setError('');

    try {
      const editing = modal.item;
      const path = editing
        ? `/api/workspace/notes/${editing.id}`
        : '/api/workspace/notes';

      await request(path, {
        method: editing ? 'PATCH' : 'POST',
        body: JSON.stringify(noteForm),
      });

      setModal(null);
      await loadWorkspace();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function deleteItem(type, item) {
    if (!window.confirm(`Delete "${item.name || item.title}"? This cannot be undone.`)) {
      return;
    }

    try {
      await request(`/api/workspace/${type}/${item.id}`, { method: 'DELETE' });
      await loadWorkspace();
    } catch (err) {
      setError(err.message);
    }
  }

  const navItems = [
    { label: 'Overview', icon: FolderKanban },
    { label: 'My Projects', icon: FolderOpen },
    { label: 'My Notes', icon: StickyNote },
    { label: 'Recent Activity', icon: Clock3 },
    { label: 'My Files', icon: FileText },
  ];

  const categoryIcon = (name) => {
    if (name === 'School Assignments') return GraduationCap;
    if (name === 'Business Documents') return BriefcaseBusiness;
    if (name === 'Social Media Designs') return Palette;
    return FolderKanban;
  };

  if (!currentUser) {
    return (
      <div className="workspace-page">
        <div className="workspace-empty-state">
          <div className="workspace-empty-icon"><UserRound size={28} /></div>
          <h2>Your personal workspace</h2>
          <p>Sign in to create projects, keep notes and organize your work.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="workspace-heading">
        <div>
          <div className="workspace-eyebrow">YOUR PERSONAL SPACE</div>
          <h1>My Workspace</h1>
          <p>Keep your projects, notes and ideas organized in one place.</p>
        </div>
        <div className="workspace-heading-actions">
          <button className="workspace-refresh" onClick={loadWorkspace} title="Refresh">
            <RefreshCw size={16} />
          </button>
          <button className="workspace-primary" onClick={() => openProject()}>
            <Plus size={17} /> New project
          </button>
        </div>
      </div>

      <div className="workspace-layout">
        <aside className="workspace-nav">
          <span className="workspace-nav-label">WORKSPACE</span>
          {navItems.map(({ label, icon: Icon }) => (
            <button
              key={label}
              className={`workspace-nav-item ${section === label ? 'active' : ''}`}
              onClick={() => { setSection(label); setSearch(''); }}
            >
              <Icon size={17} />
              <span>{label}</span>
              {label === 'My Projects' && <small>{projects.length}</small>}
              {label === 'My Notes' && <small>{notes.length}</small>}
            </button>
          ))}

          <div className="workspace-nav-divider" />
          <span className="workspace-nav-label">QUICK CREATE</span>
          <button className="workspace-quick-create" onClick={() => openProject()}>
            <Plus size={16} /> Create a project
          </button>
          <button className="workspace-quick-create" onClick={() => openNote()}>
            <Plus size={16} /> Write a note
          </button>
        </aside>

        <main className="workspace-main">
          {error && (
            <div className="workspace-alert">
              <span>{error}</span>
              <button onClick={() => setError('')} aria-label="Dismiss"><X size={16} /></button>
            </div>
          )}

          {loading ? (
            <div className="workspace-loading">
              <LoaderCircle size={25} className="workspace-spinner" />
              <span>Loading your workspace...</span>
            </div>
          ) : (
            <>
              {section === 'Overview' && (
                <>
                  <div className="workspace-welcome-card">
                    <div>
                      <span>WELCOME BACK</span>
                      <h2>{currentUser.name ? `Hello, ${currentUser.name.split(' ')[0]}` : 'Welcome back'}</h2>
                      <p>Your ideas deserve a place to grow. What are you working on today?</p>
                    </div>
                    <div className="workspace-welcome-art"><FolderKanban size={58} /></div>
                  </div>

                  <div className="workspace-stats">
                    <button onClick={() => setSection('My Projects')} className="workspace-stat-card">
                      <span className="workspace-stat-icon purple"><FolderKanban size={19} /></span>
                      <span><strong>{projects.length}</strong><small>Total projects</small></span>
                      <ArrowUpRight size={16} />
                    </button>
                    <button onClick={() => setSection('My Notes')} className="workspace-stat-card">
                      <span className="workspace-stat-icon blue"><StickyNote size={19} /></span>
                      <span><strong>{notes.length}</strong><small>Saved notes</small></span>
                      <ArrowUpRight size={16} />
                    </button>
                    <div className="workspace-stat-card workspace-stat-static">
                      <span className="workspace-stat-icon green"><Clock3 size={19} /></span>
                      <span><strong>{recentItems.length}</strong><small>Recent items</small></span>
                    </div>
                  </div>

                  <div className="workspace-section-heading">
                    <div><h3>Recent activity</h3><p>Your latest workspace updates</p></div>
                    <button onClick={() => setSection('Recent Activity')}>View all <ArrowUpRight size={14} /></button>
                  </div>
                  <RecentList items={recentItems} onOpenProject={openProject} onOpenNote={openNote} />

                  <div className="workspace-section-heading workspace-project-heading">
                    <div><h3>Your projects</h3><p>Pick up where you left off</p></div>
                    <button onClick={() => setSection('My Projects')}>View all <ArrowUpRight size={14} /></button>
                  </div>
                  <ProjectGrid
                    projects={projects.slice(0, 3)}
                    categoryIcon={categoryIcon}
                    onEdit={openProject}
                    onDelete={(item) => deleteItem('projects', item)}
                  />
                </>
              )}

              {section === 'My Projects' && (
                <>
                  <div className="workspace-section-heading">
                    <div><h3>My Projects</h3><p>Organize your work into projects.</p></div>
                    <button className="workspace-primary" onClick={() => openProject()}><Plus size={16} /> New project</button>
                  </div>
                  <SearchBox value={search} onChange={setSearch} placeholder="Search your projects..." />
                  <ProjectGrid
                    projects={filteredProjects}
                    categoryIcon={categoryIcon}
                    onEdit={openProject}
                    onDelete={(item) => deleteItem('projects', item)}
                  />
                </>
              )}

              {section === 'My Notes' && (
                <>
                  <div className="workspace-section-heading">
                    <div><h3>My Notes</h3><p>Keep useful thoughts and information close.</p></div>
                    <button className="workspace-primary" onClick={() => openNote()}><Plus size={16} /> New note</button>
                  </div>
                  <SearchBox value={search} onChange={setSearch} placeholder="Search your notes..." />
                  <div className="workspace-note-grid">
                    {filteredNotes.map((note) => (
                      <article className="workspace-note-card" key={note.id}>
                        <div className="workspace-note-top"><StickyNote size={17} /><span>{formatDate(note.updated_at)}</span></div>
                        <h4>{note.title}</h4>
                        <p>{note.content || 'No note content yet.'}</p>
                        <div className="workspace-card-actions">
                          <button onClick={() => openNote(note)}><Pencil size={14} /> Edit</button>
                          <button className="danger" onClick={() => deleteItem('notes', note)}><Trash2 size={14} /> Delete</button>
                        </div>
                      </article>
                    ))}
                    {filteredNotes.length === 0 && <EmptyState title="No notes found" text="Create a note to keep your ideas in one place." />}
                  </div>
                </>
              )}

              {section === 'Recent Activity' && (
                <>
                  <div className="workspace-section-heading">
                    <div><h3>Recent Activity</h3><p>Your latest projects and notes.</p></div>
                  </div>
                  <RecentList items={recentItems} onOpenProject={openProject} onOpenNote={openNote} />
                  {recentItems.length === 0 && <EmptyState title="Nothing here yet" text="Your recent work will appear here." />}
                </>
              )}

              {section === 'My Files' && (
                <div className="workspace-files-placeholder">
                  <div className="workspace-empty-icon"><FileText size={27} /></div>
                  <h3>Your files will live here</h3>
                  <p>Cloud file storage is coming in a later update. For now, you can organize projects and save notes in your workspace.</p>
                  <button className="workspace-primary" onClick={() => setSection('My Projects')}>Explore projects <ArrowUpRight size={15} /></button>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {modal && (
        <div className="workspace-modal-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !saving) setModal(null);
        }}>
          <form className="workspace-modal" onSubmit={modal.type === 'project' ? saveProject : saveNote}>
            <div className="workspace-modal-heading">
              <div>
                <span>{modal.item ? 'EDIT YOUR WORK' : 'ADD SOMETHING NEW'}</span>
                <h2>{modal.type === 'project' ? (modal.item ? 'Edit project' : 'Create a project') : (modal.item ? 'Edit note' : 'Write a note')}</h2>
              </div>
              <button type="button" onClick={() => setModal(null)} disabled={saving}><X size={19} /></button>
            </div>

            {modal.type === 'project' ? (
              <>
                <label>Project name<input autoFocus required minLength={2} maxLength={80} value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} placeholder="e.g. School website" /></label>
                <label>Category<select value={projectForm.color} onChange={(e) => setProjectForm({ ...projectForm, color: e.target.value })}>
                  <option value="violet">Personal project</option>
                  <option value="blue">School assignment</option>
                  <option value="green">Business</option>
                  <option value="pink">Creative work</option>
                </select></label>
                <label>Description<textarea maxLength={300} rows={3} value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} placeholder="What is this project about?" /></label>
              </>
            ) : (
              <>
                <label>Note title<input autoFocus required maxLength={120} value={noteForm.title} onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })} placeholder="Give your note a title" /></label>
                <label>Save in project<select value={noteForm.projectId} onChange={(e) => setNoteForm({ ...noteForm, projectId: e.target.value })}>
                  <option value="">No project</option>
                  {projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}
                </select></label>
                <label>Your note<textarea required maxLength={20000} rows={7} value={noteForm.content} onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })} placeholder="Write your thoughts here..." /></label>
              </>
            )}

            <div className="workspace-modal-actions">
              <button type="button" className="workspace-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button type="submit" className="workspace-primary" disabled={saving}>
                {saving ? <LoaderCircle size={16} className="workspace-spinner" /> : <Plus size={16} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function SearchBox({ value, onChange, placeholder }) {
  return (
    <div className="workspace-search">
      <Search size={17} />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </div>
  );
}

function ProjectGrid({ projects, categoryIcon, onEdit, onDelete }) {
  if (!projects.length) {
    return <EmptyState title="No projects yet" text="Create your first project to start organizing your work." />;
  }

  return (
    <div className="workspace-project-grid">
      {projects.map((project) => {
        const Icon = categoryIcon(project.name);
        return (
          <article className="workspace-project-card" key={project.id}>
            <div className="workspace-project-card-top">
              <span className={`workspace-project-icon ${project.color || 'violet'}`}><Icon size={20} /></span>
              <div className="workspace-card-actions">
                <button title="Edit project" onClick={() => onEdit(project)}><Pencil size={14} /></button>
                <button title="Delete project" className="danger" onClick={() => onDelete(project)}><Trash2 size={14} /></button>
              </div>
            </div>
            <h4>{project.name}</h4>
            <p>{project.description || 'No description added.'}</p>
            <div className="workspace-project-date"><Clock3 size={13} /> Updated {formatDate(project.updated_at)}</div>
          </article>
        );
      })}
    </div>
  );
}

function RecentList({ items, onOpenProject, onOpenNote }) {
  if (!items.length) {
    return <EmptyState title="Your workspace is ready" text="Create a project or write a note and your recent activity will appear here." />;
  }

  return (
    <div className="workspace-activity-list">
      {items.map((item) => (
        <button
          className="workspace-activity-item"
          key={`${item.kind}-${item.id}`}
          onClick={() => item.kind === 'Project' ? onOpenProject(item) : onOpenNote(item)}
        >
          <span className={`workspace-activity-icon ${item.kind === 'Project' ? 'purple' : 'blue'}`}>
            {item.kind === 'Project' ? <FolderKanban size={17} /> : <StickyNote size={17} />}
          </span>
          <span className="workspace-activity-info"><strong>{item.name || item.title}</strong><small>{item.kind}</small></span>
          <time>{formatDate(item.date)}</time>
          <ArrowUpRight size={15} />
        </button>
      ))}
    </div>
  );
}

function EmptyState({ title, text }) {
  return (
    <div className="workspace-empty-inline">
      <FolderOpen size={25} />
      <strong>{title}</strong>
      <p>{text}</p>
    </div>
  );
}
