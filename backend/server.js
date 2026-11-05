import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import db from './database.js';
import { registerAuthRoutes, requireAuth } from './auth.js';
import { registerWorkspaceRoutes } from './workspace.js';
import { registerMediaRoutes } from './media.js';

const app = express();
app.set('trust proxy', 1);
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set([
  'https://zanahub.vercel.app',
  'https://localhost',
  'capacitor://localhost',
  'http://localhost',
  'http://127.0.0.1',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  ...(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
]);

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.has(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Origin not allowed by CORS'));
  },
}));

app.use(express.json({ limit: '1mb' }));

registerAuthRoutes(app, db);
registerWorkspaceRoutes(app, db, requireAuth);
registerMediaRoutes(app);

const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many requests. Please wait a little and try again.',
  },
});

const imageLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Image generation limit reached. Please wait 15 minutes.',
  },
});

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'ZanaHub AI API',
  });
});

const visitorLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Please wait before registering another visit.' },
});

app.post('/api/visitors/visit', visitorLimiter, async (req, res) => {
  try {
    const visitorId = req.body?.visitorId;

    if (
      typeof visitorId !== 'string' ||
      !/^[a-f0-9-]{36}$/i.test(visitorId)
    ) {
      return res.status(400).json({ error: 'Invalid visitor identifier.' });
    }

    await db.query(
      `INSERT INTO unique_visitors (visitor_id)
       VALUES ($1)
       ON CONFLICT (visitor_id)
       DO UPDATE SET last_seen_at = CURRENT_TIMESTAMP`,
      [visitorId],
    );

    const result = await db.query(
      'SELECT COUNT(*)::int AS count FROM unique_visitors',
    );

    return res.json({ count: Number(result.rows[0].count) });
  } catch (error) {
    console.error('Visitor tracking failed:', error.message);
    return res.status(500).json({ error: 'Could not update visitor count.' });
  }
});

app.get('/api/visitors/count', async (_req, res) => {
  try {
    const result = await db.query(
      'SELECT COUNT(*)::int AS count FROM unique_visitors',
    );

    return res.json({ count: Number(result.rows[0].count) });
  } catch (error) {
    console.error('Visitor count lookup failed:', error.message);
    return res.status(500).json({ error: 'Could not load visitor count.' });
  }
});


app.post('/api/ai/write', aiLimiter, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI is not configured yet.',
      });
    }

    const { prompt, task = 'write' } = req.body || {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Please enter some text or instructions.',
      });
    }

    if (prompt.length > 5000) {
      return res.status(400).json({
        error: 'Please keep your request under 5,000 characters.',
      });
    }

    const tasks = {
      write: 'Help the user write clear, useful, original text based on their request.',
      improve: 'Improve the user-provided text for clarity, grammar, and readability while preserving its meaning.',
      summarize: 'Summarize the supplied text, preserving its important points.',
      translate: 'Translate the supplied text between the source and target languages explicitly specified in the user request. Support the requested languages as accurately as possible. Preserve meaning, tone, and formatting. Return only the translation unless the user requests an explanation.',
    };

    if (!Object.hasOwn(tasks, task)) {
      return res.status(400).json({
        error: 'Unsupported task.',
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: `${tasks[task]}\n\nUser request:\n${prompt}`,
      config: {
        maxOutputTokens: 1000,
      },
    });

    const text = response.text;

    if (!text) {
      return res.status(502).json({
        error: 'The AI did not return text. Please try again.',
      });
    }

    res.json({ text });
  } catch (error) {
    console.error('AI request failed:', error.message);

    res.status(502).json({
      error: 'The AI request failed. Check your API key, model availability, and usage limits.',
    });
  }
});


app.post('/api/ai/chat', aiLimiter, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'AI is not configured yet.',
      });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({
        error: 'Send a message to start the conversation.',
      });
    }

    if (messages.length > 30) {
      return res.status(400).json({
        error: 'This conversation is too long. Start a new chat.',
      });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0 &&
        message.content.length <= 5000
    );

    if (!validMessages || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({
        error: 'Please send a valid user message.',
      });
    }

    const conversation = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }],
    }));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: conversation,
      config: {
        systemInstruction:
          'You are ZanaHub AI, a helpful general-purpose assistant. ' +
          'Answer clearly and accurately. Adapt to the user’s language. ' +
          'Use conversation history when relevant. If you are unsure, say so.',
        maxOutputTokens: 1500,
      },
    });

    const text = response.text;

    if (!text) {
      return res.status(502).json({
        error: 'The AI returned an empty response. Please try again.',
      });
    }

    return res.json({ text });
  } catch (error) {
    console.error('AI chat request failed:', error.message);

    return res.status(502).json({
      error: 'The chatbot request failed. Check the AI provider configuration and usage limits.',
    });
  }
});




app.post('/api/ai/math', aiLimiter, async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: 'MathMaster AI is not configured yet.',
      });
    }

    const { messages } = req.body || {};

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 30) {
      return res.status(400).json({
        error: 'Send a valid mathematics question to continue.',
      });
    }

    const validMessages = messages.every(
      (message) =>
        message &&
        ['user', 'assistant'].includes(message.role) &&
        typeof message.content === 'string' &&
        message.content.trim().length > 0 &&
        message.content.length <= 5000
    );

    if (!validMessages || messages[messages.length - 1].role !== 'user') {
      return res.status(400).json({
        error: 'Please send a valid mathematics question.',
      });
    }

    const conversation = messages.map((message) => ({
      role: message.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: message.content.trim() }],
    }));

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
      contents: conversation,
      config: {
        systemInstruction:
          'You are MathMaster, the mathematics specialist inside ZanaHub. ' +
          'Help with mathematics across school, college, university and advanced topics, ' +
          'including arithmetic, algebra, equations, geometry, trigonometry, calculus, ' +
          'statistics, probability, matrices, vectors, number theory, logarithms, ' +
          'sequences, series, complex numbers, and mathematical word problems. ' +
          'Read each question carefully and identify what is being asked. ' +
          'For a solvable problem, give the final answer and show clear, numbered, ' +
          'step-by-step working. Explain the formulas and reasoning used. ' +
          'Check calculations and verify the result when possible. ' +
          'Keep mathematical notation readable in plain text and use LaTeX notation ' +
          'where helpful. Do not invent missing information or silently assume ' +
          'ambiguous values; state any necessary assumptions. If a question is ' +
          'outside mathematics, politely explain that this tool specializes in math. ' +
          'If you are uncertain about a result, say so instead of pretending it is correct. ' +
          'Use the conversation history for relevant follow-up questions. ' +
          'Adapt explanations to the learner and use clear, encouraging language.',
        maxOutputTokens: 3000,
      },
    });

    const text = response.text;

    if (!text) {
      return res.status(502).json({
        error: 'MathMaster could not produce a solution. Please try again.',
      });
    }

    return res.json({ text });
  } catch (error) {
    console.error('MathMaster request failed:', error.message);

    return res.status(502).json({
      error: 'MathMaster could not solve the question. Check the AI provider configuration and usage limits.',
    });
  }
});

app.post('/api/ai/image', imageLimiter, async (req, res) => {
  try {
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID?.trim();
    const apiToken = process.env.CLOUDFLARE_API_TOKEN?.trim();

    if (!accountId || !apiToken) {
      return res.status(503).json({
        error: 'Cloudflare image generation is not configured yet.',
      });
    }

    const { prompt, aspectRatio = '1:1' } = req.body || {};

    if (typeof prompt !== 'string' || !prompt.trim()) {
      return res.status(400).json({
        error: 'Describe the image you want to create.',
      });
    }

    if (prompt.trim().length > 1000) {
      return res.status(400).json({
        error: 'Please keep your image description under 1,000 characters.',
      });
    }

    const allowedRatios = ['1:1', '16:9', '9:16', '4:3', '3:4'];

    if (!allowedRatios.includes(aspectRatio)) {
      return res.status(400).json({
        error: 'Please choose a supported image aspect ratio.',
      });
    }

    const model = '@cf/black-forest-labs/flux-1-schnell';
    const endpoint =
      `https://api.cloudflare.com/client/v4/accounts/${encodeURIComponent(accountId)}/ai/run/${model}`;

    const cloudflareResponse = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: `${prompt.trim()}. Compose the image in ${aspectRatio} aspect ratio.`,
        steps: 4,
      }),
      signal: AbortSignal.timeout(120_000),
    });

    const providerData = await cloudflareResponse.json().catch(() => null);

    if (!cloudflareResponse.ok || providerData?.success === false) {
      const providerMessage = Array.isArray(providerData?.errors)
        ? providerData.errors
            .map((item) => item.message || item.code)
            .filter(Boolean)
            .join('; ')
        : '';

      console.error(
        'Cloudflare image request failed:',
        cloudflareResponse.status,
        providerMessage || cloudflareResponse.statusText,
      );

      if (cloudflareResponse.status === 429) {
        return res.status(429).json({
          error: 'Cloudflare image usage limit or capacity reached. Please try again later.',
        });
      }

      if (cloudflareResponse.status === 403) {
        return res.status(503).json({
          error: 'Cloudflare rejected the request. Check the Workers AI token permissions and account access.',
        });
      }

      return res.status(502).json({
        error: 'Cloudflare could not generate this image. Please try again.',
      });
    }

    const image = providerData?.result?.image;

    if (typeof image !== 'string' || image.length === 0) {
      console.error('Cloudflare returned no image data.');

      return res.status(502).json({
        error: 'Cloudflare returned an empty image. Please try again.',
      });
    }

    return res.json({
      image,
      mimeType: 'image/jpeg',
      text: 'Image generated with Cloudflare Workers AI.',
    });
  } catch (error) {
    const timedOut =
      error.name === 'TimeoutError' || error.name === 'AbortError';

    console.error(
      'Cloudflare Workers AI image generation failed:',
      timedOut ? 'Request timed out.' : error.message,
    );

    return res.status(timedOut ? 504 : 502).json({
      error: timedOut
        ? 'Image generation took too long. Please try again.'
        : 'Image generation failed. Check the Cloudflare configuration and try again.',
    });
  }
});

async function startServer() {
  try {
    await db.initialize();

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`ZanaHub AI API listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Could not start ZanaHub API:', error.message);
    process.exitCode = 1;
    await db.close().catch(() => {});
  }
}

startServer();
