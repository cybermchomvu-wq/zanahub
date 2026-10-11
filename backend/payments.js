import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';
import { randomBytes } from 'node:crypto';

const checkoutLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: {
    error: 'Too many checkout attempts. Please try again later.',
  },
});

function requirePaymentAuth(req, res, next) {
  const authorization = req.headers.authorization || '';
  const [scheme, token] = authorization.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({
      error: 'Please log in to access payments.',
    });
  }

  try {
    const secret = process.env.AUTH_JWT_SECRET;

    if (!secret || secret.length < 32) {
      return res.status(503).json({
        error: 'Authentication is temporarily unavailable.',
      });
    }

    const payload = jwt.verify(token, secret, {
      issuer: 'zanahub-api',
      audience: 'zanahub-app',
    });

    const userId = Number(payload.sub);

    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(401).json({
        error: 'Invalid authentication token.',
      });
    }

    req.userId = userId;
    next();
  } catch {
    return res.status(401).json({
      error: 'Your login session is invalid or expired. Please log in again.',
    });
  }
}

export function registerPaymentRoutes(app, db) {
  app.post(
    '/api/payments/checkout',
    checkoutLimiter,
    requirePaymentAuth,
    (req, res) => {
      const user = db.prepare(`
        SELECT id, name, email
        FROM users
        WHERE id = ?
      `).get(req.userId);

      if (!user) {
        return res.status(404).json({
          error: 'Account not found.',
        });
      }

      // Validate the phone number on the server, not only in the browser.
      const phone = typeof req.body?.phone === 'string'
        ? req.body.phone.trim()
        : '';

      if (!/^\+255[67]\d{8}$/.test(phone)) {
        return res.status(400).json({
          error: 'Enter a valid Tanzanian mobile number, such as +255712345678.',
        });
      }

      const hasSelcomCredentials = Boolean(
        process.env.SELCOM_BASE_URL &&
        process.env.SELCOM_API_KEY &&
        process.env.SELCOM_API_SECRET &&
        process.env.SELCOM_VENDOR_ID
      );

      if (!hasSelcomCredentials) {
        return res.status(503).json({
          error: 'Premium checkout is not configured yet. No payment was started.',
          amount: 1000,
          currency: 'TZS',
        });
      }

      // Fail closed until the real gateway request and signature verification
      // have been implemented and tested.
      return res.status(503).json({
        error: 'The payment gateway integration is not enabled yet. No payment was started.',
        amount: 1000,
        currency: 'TZS',
      });
    }
  );

  app.get(
    '/api/payments/history',
    requirePaymentAuth,
    (req, res) => {
      try {
        const payments = db.prepare(`
          SELECT
            id,
            amount_tzs AS amount,
            currency,
            provider,
            provider_reference AS reference,
            status,
            created_at AS createdAt,
            verified_at AS verifiedAt
          FROM payments
          WHERE user_id = ?
          ORDER BY id DESC
          LIMIT 50
        `).all(req.userId);

        return res.json({ payments });
      } catch (error) {
        console.error('Payment history lookup failed:', error.message);

        return res.status(500).json({
          error: 'Could not retrieve payment history.',
        });
      }
    }
  );

  console.log('ZanaHub payment routes registered.');
}
