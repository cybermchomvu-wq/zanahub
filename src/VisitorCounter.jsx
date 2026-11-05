import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';

const API_BASE =
  import.meta.env.VITE_API_URL ||
  `${window.location.protocol}//${window.location.hostname}:3001`;

function createVisitorId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;

  const hex = Array.from(bytes, (byte) =>
    byte.toString(16).padStart(2, '0')
  ).join('');

  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20, 32),
  ].join('-');
}

function getOrCreateVisitorId() {
  const key = 'zanahub_visitor_id';

  try {
    let visitorId = window.localStorage.getItem(key);

    if (!visitorId || !/^[a-f0-9-]{36}$/i.test(visitorId)) {
      visitorId = createVisitorId();
      window.localStorage.setItem(key, visitorId);
    }

    return visitorId;
  } catch {
    // If storage is disabled, this visit can still be registered,
    // but the browser identity cannot persist between visits.
    return createVisitorId();
  }
}

export default function VisitorCounter() {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function registerVisit() {
      try {
        const visitorId = getOrCreateVisitorId();

        const response = await fetch(`${API_BASE}/api/visitors/visit`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ visitorId }),
          signal: controller.signal,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Could not register visit.');
        }

        if (Number.isSafeInteger(data.count) && data.count >= 0) {
          setCount(data.count);
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          console.error('Could not load ZanaHub visitor count:', error);
        }
      }
    }

    registerVisit();

    return () => controller.abort();
  }, []);

  return (
    <div className="stat-item visitor-counter" aria-live="polite">
      <div className="stat-icon stat-violet">
        <Users size={19} />
      </div>
      <div>
        <strong>{count === null ? '—' : count.toLocaleString()}</strong>
        <span>Unique Visitors</span>
      </div>
    </div>
  );
}
