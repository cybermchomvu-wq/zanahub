import rateLimit from 'express-rate-limit';

const workspaceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 120,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Too many workspace requests. Please try again later.' },
});

function validId(value) {
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

function cleanText(value, maxLength) {
  if (typeof value !== 'string') return null;

  const result = value.trim();
  if (result.length > maxLength) return null;

  return result;
}

export function registerWorkspaceRoutes(app, db, requireAuth) {
  const protect = [workspaceLimiter, requireAuth];

  // Load only the signed-in user's projects and notes.
  app.get('/api/workspace', ...protect, async (req, res) => {
    try {
      const [projects, notes] = await Promise.all([
        db.query(
          `SELECT id, name, description, color, created_at, updated_at
           FROM workspace_projects
           WHERE user_id = $1
           ORDER BY updated_at DESC`,
          [req.userId],
        ),
        db.query(
          `SELECT id, project_id, title, content, created_at, updated_at
           FROM workspace_notes
           WHERE user_id = $1
           ORDER BY updated_at DESC`,
          [req.userId],
        ),
      ]);

      return res.json({ projects: projects.rows, notes: notes.rows });
    } catch (error) {
      console.error('Workspace loading failed:', error.message);
      return res.status(500).json({ error: 'Could not load your workspace.' });
    }
  });

  // Create a project.
  app.post('/api/workspace/projects', ...protect, async (req, res) => {
    const name = cleanText(req.body?.name, 80);
    const description = cleanText(req.body?.description ?? '', 300);
    const color = cleanText(req.body?.color ?? 'violet', 20);

    if (!name || name.length < 2 || description === null || color === null) {
      return res.status(400).json({ error: 'Please provide valid project details.' });
    }

    try {
      const result = await db.query(
        `INSERT INTO workspace_projects (user_id, name, description, color)
         VALUES ($1, $2, $3, $4)
         RETURNING id, name, description, color, created_at, updated_at`,
        [req.userId, name, description, color],
      );

      return res.status(201).json({ project: result.rows[0] });
    } catch (error) {
      console.error('Project creation failed:', error.message);
      return res.status(500).json({ error: 'Could not create the project.' });
    }
  });

  // Update a project owned by the signed-in user.
  app.patch('/api/workspace/projects/:id', ...protect, async (req, res) => {
    const id = validId(req.params.id);
    const name = cleanText(req.body?.name, 80);
    const description = cleanText(req.body?.description ?? '', 300);
    const color = cleanText(req.body?.color ?? 'violet', 20);

    if (!id || !name || name.length < 2 || description === null || color === null) {
      return res.status(400).json({ error: 'Please provide valid project details.' });
    }

    try {
      const result = await db.query(
        `UPDATE workspace_projects
         SET name = $1, description = $2, color = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND user_id = $5
         RETURNING id, name, description, color, created_at, updated_at`,
        [name, description, color, id, req.userId],
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      return res.json({ project: result.rows[0] });
    } catch (error) {
      console.error('Project update failed:', error.message);
      return res.status(500).json({ error: 'Could not update the project.' });
    }
  });

  // Delete only a project owned by the signed-in user.
  app.delete('/api/workspace/projects/:id', ...protect, async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid project identifier.' });

    try {
      const result = await db.query(
        `DELETE FROM workspace_projects
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, req.userId],
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Project not found.' });
      }

      return res.json({ message: 'Project deleted.' });
    } catch (error) {
      console.error('Project deletion failed:', error.message);
      return res.status(500).json({ error: 'Could not delete the project.' });
    }
  });

  // Create a personal note, optionally inside one of the user's projects.
  app.post('/api/workspace/notes', ...protect, async (req, res) => {
    const title = cleanText(req.body?.title, 120);
    const content = cleanText(req.body?.content ?? '', 20000);
    const projectId = req.body?.projectId == null || req.body?.projectId === ''
      ? null
      : validId(req.body.projectId);

    if (!title || title.length < 1 || content === null ||
        (req.body?.projectId != null && req.body.projectId !== '' && !projectId)) {
      return res.status(400).json({ error: 'Please provide valid note details.' });
    }

    try {
      if (projectId) {
        const owned = await db.query(
          'SELECT id FROM workspace_projects WHERE id = $1 AND user_id = $2',
          [projectId, req.userId],
        );

        if (!owned.rowCount) {
          return res.status(404).json({ error: 'Project not found.' });
        }
      }

      const result = await db.query(
        `INSERT INTO workspace_notes (user_id, project_id, title, content)
         VALUES ($1, $2, $3, $4)
         RETURNING id, project_id, title, content, created_at, updated_at`,
        [req.userId, projectId, title, content],
      );

      return res.status(201).json({ note: result.rows[0] });
    } catch (error) {
      console.error('Note creation failed:', error.message);
      return res.status(500).json({ error: 'Could not create the note.' });
    }
  });

  // Update a personal note.
  app.patch('/api/workspace/notes/:id', ...protect, async (req, res) => {
    const id = validId(req.params.id);
    const title = cleanText(req.body?.title, 120);
    const content = cleanText(req.body?.content ?? '', 20000);
    const projectId = req.body?.projectId == null || req.body.projectId === ''
      ? null
      : validId(req.body.projectId);

    if (!id || !title || title.length < 1 || content === null ||
        (req.body?.projectId != null && req.body.projectId !== '' && !projectId)) {
      return res.status(400).json({ error: 'Please provide valid note details.' });
    }

    try {
      if (projectId) {
        const owned = await db.query(
          'SELECT id FROM workspace_projects WHERE id = $1 AND user_id = $2',
          [projectId, req.userId],
        );

        if (!owned.rowCount) {
          return res.status(404).json({ error: 'Project not found.' });
        }
      }

      const result = await db.query(
        `UPDATE workspace_notes
         SET title = $1, content = $2, project_id = $3,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $4 AND user_id = $5
         RETURNING id, project_id, title, content, created_at, updated_at`,
        [title, content, projectId, id, req.userId],
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Note not found.' });
      }

      return res.json({ note: result.rows[0] });
    } catch (error) {
      console.error('Note update failed:', error.message);
      return res.status(500).json({ error: 'Could not update the note.' });
    }
  });

  // Delete only a note owned by the signed-in user.
  app.delete('/api/workspace/notes/:id', ...protect, async (req, res) => {
    const id = validId(req.params.id);
    if (!id) return res.status(400).json({ error: 'Invalid note identifier.' });

    try {
      const result = await db.query(
        `DELETE FROM workspace_notes
         WHERE id = $1 AND user_id = $2
         RETURNING id`,
        [id, req.userId],
      );

      if (!result.rowCount) {
        return res.status(404).json({ error: 'Note not found.' });
      }

      return res.json({ message: 'Note deleted.' });
    } catch (error) {
      console.error('Note deletion failed:', error.message);
      return res.status(500).json({ error: 'Could not delete the note.' });
    }
  });

  console.log('ZanaHub Workspace routes registered.');
}
