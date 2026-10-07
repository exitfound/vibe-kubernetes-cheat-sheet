// "New since your last visit". A copy lives in scheme/js/lib/fresh.js, and the hub reads its storage.
// Storage maps key to firstSeenMs. The first visit records everything as 0, a baseline that is never
// new. A later arrival reads NEW for FRESH_DAYS until opened or copied. Departed keys drop on load.

export const FRESH_DAYS = 14;
const DAY_MS = 864e5;

export function readSeen(storageKey) {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return v && typeof v === 'object' ? v : null;
  } catch (_) {
    return null;
  }
}

export const isFreshStamp = (stamp, now = Date.now()) => stamp > 0 && now - stamp < FRESH_DAYS * DAY_MS;

export function trackFresh(storageKey, keys) {
  const seen = readSeen(storageKey);
  const now = Date.now();
  const map = {};
  for (const k of keys) map[k] = !seen ? 0 : (k in seen ? seen[k] : now);
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(map)); } catch (_) {} };
  save();
  return {
    isNew: (k) => isFreshStamp(map[k], now),
    clear: (k) => { if (map[k] > 0) { map[k] = 0; save(); } },
  };
}

// A short stable key for a long string (a whole command), so the map stays small.
export function hashKey(s) {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
  return (h >>> 0).toString(36);
}
