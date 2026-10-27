import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { GoogleGenAI } from '@google/genai';
import { InferenceClient } from '@huggingface/inference';
import db from './database.js';
import { registerAuthRoutes } from './auth.js';
import { registerMediaRoutes } from './media.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
}));

app.use(express.json({ limit: '1mb' }));

registerAuthRoutes(app, db);
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


app.post('/api/ai/image', imageLimiter, async (req, res) => {
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
