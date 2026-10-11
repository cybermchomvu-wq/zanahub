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
    {
      expiresIn: '7d',
      issuer: 'zanahub-api',
      audience: 'zanahub-app',
    },
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
      return res.status(401).json({
        error: 'Invalid authentication token.',
      });
    }

    return next();
  } catch {
    return res.status(401).json({
      error: 'Your login session is invalid or expired. Please log in again.',
    });
  }
}

function isUniqueViolation(error) {
  return error?.code === '23505';
}

export function registerAuthRoutes(app, db) {
  // Register a new account and create its free subscription atomically.
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

      const existing = await db.query(
        'SELECT id FROM users WHERE email = $1',
        [cleanEmail],
      );

      if (existing.rowCount > 0) {
        return res.status(409).json({
          error: 'An account with this email already exists.',
        });
      }

      const passwordHash = await bcrypt.hash(password, 12);

      const userId = await db.transaction(async (client) => {
        const result = await client.query(
          `INSERT INTO users (name, email, password_hash)
           VALUES ($1, $2, $3)
           RETURNING id`,
          [cleanName, cleanEmail, passwordHash],
        );

        const id = Number(result.rows[0].id);

        await client.query(
          `INSERT INTO subscriptions (user_id, plan, status)
           VALUES ($1, 'free', 'active')`,
          [id],
        );

        return id;
      });

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
      if (isUniqueViolation(error)) {
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

  // Sign in with email and password.
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

      const result = await db.query(
        `SELECT id, name, email, password_hash
         FROM users
         WHERE email = $1`,
        [email.trim().toLowerCase()],
      );

      const user = result.rows[0];

      const passwordMatches = user
        ? await bcrypt.compare(password, user.password_hash)
        : false;

      if (!user || !passwordMatches) {
        return res.status(401).json({
          error: 'Invalid email or password.',
        });
      }

      const userId = Number(user.id);
      const token = createToken(userId);

      return res.json({
        message: 'Login successful.',
        token,
        user: {
          id: userId,
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
        return res.status(503).json({
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

      const existingByGoogle = await db.query(
        `SELECT id, name, email
         FROM users
         WHERE google_sub = $1`,
        [googleSub],
      );

      let userId;

      if (existingByGoogle.rowCount > 0) {
        userId = Number(existingByGoogle.rows[0].id);
      } else {
        const existingByEmail = await db.query(
          `SELECT id, google_sub
           FROM users
           WHERE email = $1`,
          [email],
        );

        if (existingByEmail.rowCount > 0) {
          const existing = existingByEmail.rows[0];

          if (existing.google_sub !== googleSub) {
            return res.status(409).json({
              error:
                'An account with this email already exists. Please sign in using your existing method first.',
            });
          }

          userId = Number(existing.id);
        } else {
          const randomPassword = randomBytes(32).toString('hex');
          const passwordHash = await bcrypt.hash(randomPassword, 12);

          userId = await db.transaction(async (client) => {
            const result = await client.query(
              `INSERT INTO users
                 (name, email, password_hash, google_sub)
               VALUES ($1, $2, $3, $4)
               RETURNING id`,
              [name, email, passwordHash, googleSub],
            );

            const id = Number(result.rows[0].id);

            await client.query(
              `INSERT INTO subscriptions (user_id, plan, status)
               VALUES ($1, 'free', 'active')`,
              [id],
            );

            return id;
          });
        }
      }

      const userResult = await db.query(
        `SELECT id, name, email
         FROM users
         WHERE id = $1`,
        [userId],
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({
          error: 'Account not found.',
        });
      }

      const user = {
        ...userResult.rows[0],
        id: Number(userResult.rows[0].id),
      };

      const token = createToken(userId);

      return res.json({
        message: 'Google sign-in successful.',
        token,
        user,
      });
    } catch (error) {
      if (isUniqueViolation(error)) {
        return res.status(409).json({
          error: 'This Google account or email is already registered.',
        });
      }

      console.error('Google sign-in failed:', error.message);

      return res.status(401).json({
        error: 'Google sign-in failed. Please try again.',
      });
    }
  });

  // Return the signed-in user's account and current subscription.
  app.get('/api/auth/me', requireAuth, async (req, res) => {
    try {
      const userResult = await db.query(
        `SELECT id, name, email, created_at
         FROM users
         WHERE id = $1`,
        [req.userId],
      );

      if (userResult.rowCount === 0) {
        return res.status(404).json({
          error: 'Account not found.',
        });
      }

      const subscriptionResult = await db.query(
        `SELECT plan, status, starts_at, expires_at
         FROM subscriptions
         WHERE user_id = $1
         ORDER BY id DESC
         LIMIT 1`,
        [req.userId],
      );

      const subscription = subscriptionResult.rows[0];
      const now = Date.now();

      const startsAt = subscription?.starts_at
        ? new Date(subscription.starts_at).getTime()
        : null;

      const expiresAt = subscription?.expires_at
        ? new Date(subscription.expires_at).getTime()
        : null;

      const hasActivePro = Boolean(
        subscription &&
        subscription.plan === 'pro' &&
        subscription.status === 'active' &&
        expiresAt !== null &&
        Number.isFinite(expiresAt) &&
        expiresAt > now &&
        (
          startsAt === null ||
          (Number.isFinite(startsAt) && startsAt <= now)
        ),
      );

      const user = {
        ...userResult.rows[0],
        id: Number(userResult.rows[0].id),
      };

      return res.json({
        user,
        subscription: {
          plan: hasActivePro ? 'pro' : 'free',
          status: subscription?.status || 'active',
          expiresAt: hasActivePro
            ? subscription.expires_at
            : null,
        },
      });
    } catch (error) {
      console.error('Account lookup failed:', error.message);

      return res.status(500).json({
        error: 'We could not retrieve your account.',
      });
    }
  });

  console.log('ZanaHub PostgreSQL authentication routes registered.');
}
