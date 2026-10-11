import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import jwt from 'jsonwebtoken';
import { GoogleGenAI } from '@google/genai';
import { InferenceClient } from '@huggingface/inference';
import db from './database.js';
import { registerAuthRoutes } from './auth.js';
import { registerPaymentRoutes } from './payments.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json({ limit: '1mb' }));

registerAuthRoutes(app, db);
registerPaymentRoutes(app, db);

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


async function requirePro(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Please sign in to access ZanaHub Pro.',
    });
  }

  let userId;

  try {
    const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET, {
      issuer: 'zanahub-api',
      audience: 'zanahub-app',
    });

    userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(401).json({
        error: 'Your login session is invalid. Please sign in again.',
      });
    }
  } catch {
    return res.status(401).json({
      error: 'Your login session is invalid or expired. Please sign in again.',
    });
  }

  try {
    const result = await db.query(`
      SELECT plan, status, starts_at, expires_at
      FROM subscriptions
      WHERE user_id = $1
      ORDER BY id DESC
      LIMIT 1
    `, [userId]);

    const subscription = result.rows[0];
    const now = Date.now();

    const startsAt = subscription?.starts_at
      ? new Date(subscription.starts_at).getTime()
      : null;

    const expiresAt = subscription?.expires_at
      ? new Date(subscription.expires_at).getTime()
      : null;

    const activePro = Boolean(
      subscription &&
      subscription.plan === 'pro' &&
      subscription.status === 'active' &&
      expiresAt !== null &&
      Number.isFinite(expiresAt) &&
      expiresAt > now &&
      (startsAt === null ||
        (Number.isFinite(startsAt) && startsAt <= now))
    );

    if (!activePro) {
      return res.status(403).json({
        error: 'This AI tool requires an active ZanaHub Pro subscription.',
        code: 'PRO_REQUIRED',
      });
    }

    req.userId = userId;
    return next();
  } catch (error) {
    console.error('Pro access verification failed:', error.message);

    return res.status(500).json({
      error: 'Could not verify your subscription. Please try again.',
    });
  }
}

app.post('/api/ai/write', aiLimiter, requirePro, async (req, res) => {
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


app.post('/api/ai/image', imageLimiter, requirePro, async (req, res) => {
  try {
    if (!process.env.HF_TOKEN) {
      return res.status(503).json({
        error: 'Hugging Face is not configured. Check the backend environment.',
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

    const client = new InferenceClient(process.env.HF_TOKEN);

    const imageBlob = await client.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      provider: 'auto',
      inputs: `${prompt.trim()}. Compose the image in ${aspectRatio} aspect ratio.`,
      parameters: {
        num_inference_steps: 4,
      },
    });

    const imageBuffer = Buffer.from(await imageBlob.arrayBuffer());
    const mimeType = imageBlob.type || 'image/jpeg';

    res.json({
      image: imageBuffer.toString('base64'),
      mimeType,
      text: 'Image generated with Hugging Face.',
    });
  } catch (error) {
    console.error('Hugging Face image generation failed:', error.message);

    res.status(502).json({
      error: 'Image generation failed. Check the Hugging Face model access, available credits, and provider limits.',
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
