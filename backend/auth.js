import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { OAuth2Client } from 'google-auth-library';
import { randomBytes } from 'node:crypto';

const googleClient = new OAuth2Client();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many authentication attempts. Please try again later.',
  },
});

function createToken(userId) {
  const secret = process.env.AUTH_JWT_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error('AUTH_JWT_SECRET must contain at least 32 characters.');
  }

  return jwt.sign(
    { sub: String(userId) },
    secret,
    { expiresIn: '7d', issuer: 'zanahub-api', audience: 'zanahub-app' },
  );
}

function requireAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Please log in to access your account.',
    });
  }

  try {
    const payload = jwt.verify(token, process.env.AUTH_JWT_SECRET, {
      issuer: 'zanahub-api',
      audience: 'zanahub-app',
    });

    req.userId = Number(payload.sub);

    if (!Number.isSafeInteger(req.userId) || req.userId < 1) {
      return res.status(401).json({ error: 'Invalid authentication token.' });
    }

    next();
  } catch {
    return res.status(401).json({
      error: 'Your login session is invalid or expired. Please log in again.',
    });
  }
}

export function registerAuthRoutes(app, db) {
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { name, email, password } = req.body || {};

      if (
        typeof name !== 'string' ||
        typeof email !== 'string' ||
        typeof password !== 'string'
      ) {
        return res.status(400).json({
          error: 'Please provide your name, email, and password.',
        });
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

      if (cleanName.length < 2 || cleanName.length > 80) {
        return res.status(400).json({
          error: 'Your name must contain between 2 and 80 characters.',
        });
      }

      if (
        cleanEmail.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)
      ) {
        return res.status(400).json({
          error: 'Please enter a valid email address.',
        });
      }

      if (password.length < 8 || password.length > 128) {
        return res.status(400).json({
          error: 'Your password must contain between 8 and 128 characters.',
        });
      }

      const existing = db.prepare(
        'SELECT id FROM users WHERE email = ?',
      ).get(cleanEmail);

      if (existing) {
        return res.status(409).json({
          error: 'An account with this email already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const createAccount = db.transaction(() => {
        const result = db.prepare(`
          INSERT INTO users (name, email, password_hash)
          VALUES (?, ?, ?)
        `).run(cleanName, cleanEmail, passwordHash);

        const userId = Number(result.lastInsertRowid);

        db.prepare(`
          INSERT INTO subscriptions (user_id, plan, status)
          VALUES (?, 'free', 'active')
        `).run(userId);

        return userId;
      });

      const userId = createAccount();
      const token = createToken(userId);

      return res.status(201).json({
        message: 'Your ZanaHub account has been created.',
        token,
        user: {
          id: userId,
          name: cleanName,
          email: cleanEmail,
          plan: 'free',
        },
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({
          error: 'An account with this email already exists.',
        });
      }

      console.error('Registration failed:', error.message);

      return res.status(500).json({
        error: 'We could not create your account. Please try again.',
      });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body || {};

      if (
        typeof email !== 'string' ||
        typeof password !== 'string' ||
        email.length > 254 ||
        password.length > 128
      ) {
        return res.status(400).json({
          error: 'Please provide a valid email and password.',
        });
      }

      const user = db.prepare(`
        SELECT id, name, email, password_hash
        FROM users
        WHERE email = ?
      `).get(email.trim().toLowerCase());

      const passwordMatches = user
        ? await bcrypt.compare(password, user.password_hash)
        : false;

      if (!user || !passwordMatches) {
        return res.status(401).json({
          error: 'Invalid email or password.',
        });
      }

      const token = createToken(user.id);

      return res.json({
        message: 'Login successful.',
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error('Login failed:', error.message);

      return res.status(500).json({
        error: 'We could not log you in. Please try again.',
      });
    }
  });
  // Sign in with Google.
  app.post('/api/auth/google', authLimiter, async (req, res) => {
    try {
      const { credential } = req.body || {};

      if (
        typeof credential !== 'string' ||
        credential.length === 0 ||
        credential.length > 10000
      ) {
        return res.status(400).json({
          error: 'A valid Google credential is required.',
        });
      }

      const clientId = process.env.GOOGLE_CLIENT_ID;

      if (!clientId) {
        console.error('GOOGLE_CLIENT_ID is not configured.');

        return res.status(500).json({
          error: 'Google Sign-In is not configured yet.',
        });
      }

      const ticket = await googleClient.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });

      const googleUser = ticket.getPayload();

      if (
        !googleUser ||
        !googleUser.sub ||
        !googleUser.email ||
        googleUser.email_verified !== true
      ) {
        return res.status(401).json({
          error: 'Google could not verify your account.',
        });
      }

      const googleSub = googleUser.sub;
      const email = googleUser.email.trim().toLowerCase();
      const name = (
        typeof googleUser.name === 'string' && googleUser.name.trim()
          ? googleUser.name.trim()
          : email.split('@')[0]
      ).slice(0, 80);

      const existingByGoogle = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE google_sub = ?
      `).get(googleSub);

      let userId;

      if (existingByGoogle) {
        userId = existingByGoogle.id;
      } else {
        const existingByEmail = db.prepare(`
          SELECT id, name, email, google_sub
          FROM users
          WHERE email = ?
        `).get(email);

                if (existingByEmail) {
          if (existingByEmail.google_sub !== googleSub) {
            return res.status(409).json({
              error:
                'An account with this email already exists. Please sign in using your existing method first.',
            });
          }

          userId = existingByEmail.id;
        } else {
          const randomPassword = randomBytes(32).toString('hex');
          const passwordHash = await bcrypt.hash(randomPassword, 12);

          const createGoogleAccount = db.transaction(() => {
            const result = db.prepare(`
              INSERT INTO users (name, email, password_hash, google_sub)
              VALUES (?, ?, ?, ?)
            `).run(name, email, passwordHash, googleSub);

            const newUserId = Number(result.lastInsertRowid);

            db.prepare(`
              INSERT INTO subscriptions (user_id, plan, status)
              VALUES (?, 'free', 'active')
            `).run(newUserId);

            return newUserId;
          });

          userId = createGoogleAccount();
        }
      }

      const user = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE id = ?
      `).get(userId);

      const token = createToken(userId);

      return res.json({
        message: 'Google sign-in successful.',
        token,
        user,
      });
    } catch (error) {
      if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
        return res.status(409).json({
          error: 'This Google account is already registered.',
        });
      }

      console.error('Google sign-in failed:', error.message);

      return res.status(401).json({
        error: 'Google sign-in failed. Please try again.',
      });
    }
  });
  app.get('/api/auth/me', requireAuth, (req, res) => {
    try {
      const user = db.prepare(`
        SELECT id, name, email, created_at
        FROM users
        WHERE id = ?
      `).get(req.userId);

      if (!user) {
        return res.status(404).json({ error: 'Account not found.' });
      }

      const subscription = db.prepare(`
        SELECT plan, status, starts_at, expires_at
        FROM subscriptions
        WHERE user_id = ?
        ORDER BY id DESC
        LIMIT 1
      `).get(req.userId);

            const now = Date.now();

      const hasActivePro = Boolean(
        subscription &&
        subscription.plan === 'pro' &&
        subscription.status === 'active' &&
        subscription.expires_at &&
        Date.parse(subscription.expires_at) > now &&
        (!subscription.starts_at ||
          Date.parse(subscription.starts_at) <= now)
      );

      return res.json({
        user,
        subscription: {
          plan: hasActivePro ? 'pro' : 'free',
          status: 'active',
          expiresAt: hasActivePro ? subscription.expires_at : null,
        },
      });
    } catch (error) {
      console.error('Account lookup failed:', error.message);

      return res.status(500).json({
        error: 'We could not retrieve your account.',
      });
    }
  });

  console.log('ZanaHub authentication routes registered.');
}
