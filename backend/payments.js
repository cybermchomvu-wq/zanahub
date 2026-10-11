import jwt from 'jsonwebtoken';
import rateLimit from 'express-rate-limit';

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
    return next();
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
    async (req, res) => {
      try {
        const result = await db.query(
          `SELECT id, name, email
           FROM users
           WHERE id = $1`,
          [req.userId],
        );

        if (result.rowCount === 0) {
          return res.status(404).json({
            error: 'Account not found.',
          });
        }

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

        // Keep payments disabled until gateway requests, callbacks, and
        // signature verification have been implemented and tested.
        return res.status(503).json({
          error: 'The payment gateway integration is not enabled yet. No payment was started.',
          amount: 1000,
          currency: 'TZS',
        });
      } catch (error) {
        console.error('Checkout lookup failed:', error.message);

        return res.status(500).json({
          error: 'Could not prepare checkout. No payment was started.',
        });
      }
    },
  );

  app.get(
    '/api/payments/history',
    requirePaymentAuth,
    async (req, res) => {
      try {
        const result = await db.query(
          `SELECT
             id,
             amount_tzs AS amount,
             currency,
             provider,
             provider_reference AS reference,
             status,
             created_at AS "createdAt",
             verified_at AS "verifiedAt"
           FROM payments
           WHERE user_id = $1
           ORDER BY id DESC
           LIMIT 50`,
          [req.userId],
        );

        return res.json({
          payments: result.rows.map((payment) => ({
            ...payment,
            id: Number(payment.id),
            amount: Number(payment.amount),
          })),
        });
      } catch (error) {
        console.error('Payment history lookup failed:', error.message);

        return res.status(500).json({
          error: 'Could not retrieve payment history.',
        });
      }
    },
  );

  console.log('ZanaHub PostgreSQL payment routes registered.');
}
