import Database from 'better-sqlite3';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const currentDirectory = path.dirname(fileURLToPath(import.meta.url));
const databasePath = path.join(currentDirectory, 'database', 'zanahub.db');

const db = new Database(databasePath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL DEFAULT 'free'
      CHECK (plan IN ('free', 'pro')),
    status TEXT NOT NULL DEFAULT 'active'
      CHECK (status IN ('active', 'expired', 'cancelled', 'pending')),
    starts_at TEXT,
    expires_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS payments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    subscription_id INTEGER,
    amount_tzs INTEGER NOT NULL CHECK (amount_tzs > 0),
    currency TEXT NOT NULL DEFAULT 'TZS',
    provider TEXT,
    provider_reference TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'verified', 'failed', 'refunded')),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    verified_at TEXT,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (subscription_id) REFERENCES subscriptions(id)
  );

  CREATE INDEX IF NOT EXISTS idx_subscriptions_user
    ON subscriptions(user_id);

  CREATE INDEX IF NOT EXISTS idx_payments_user
    ON payments(user_id);
`);
// Add Google account support without deleting existing users.
const userColumns = db.pragma('table_info(users)');

if (!userColumns.some((column) => column.name === 'google_sub')) {
  db.exec('ALTER TABLE users ADD COLUMN google_sub TEXT');
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_sub
  ON users(google_sub)
`);
console.log('ZanaHub database initialized successfully.');

export default db;
