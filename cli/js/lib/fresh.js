// "New since your last visit", shared by /cli/, /diagrams/ and the hub. Storage maps key to firstSeenMs:
// the first visit records 0, a baseline never new. A later key reads NEW for FRESH_DAYS until opened or
// copied, departed keys drop. A diagram key is `id@revision`, so an edited card reads NEW again.

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

// The stored stamp of a key, or undefined if never seen. An `id@revision` key falls back to its bare
// id, the form stored before revisions existed, so the switch to revisions marks nothing new.
export function stampOf(seen, k) {
  if (k in seen) return seen[k];
  const at = k.indexOf('@');
  return at > 0 ? seen[k.slice(0, at)] : undefined;
}

export function trackFresh(storageKey, keys) {
  const seen = readSeen(storageKey);
  const now = Date.now();
  const map = {};
  for (const k of keys) map[k] = !seen ? 0 : (stampOf(seen, k) ?? now);
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
