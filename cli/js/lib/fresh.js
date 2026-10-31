// "New since your last visit", shared by /cli/, /diagrams/ and the hub. Storage maps key to firstSeenMs:
// the first visit records 0, a baseline never new. A later key reads NEW for FRESH_DAYS until opened or
// copied, departed keys drop. A diagram key is `id@revision`, so an edited card reads NEW again.

const FRESH_DAYS = 14;

// The older names of the /diagrams/ map, read once into `kube-how:diagram-seen:v2` and then removed.
export const DIAGRAM_SEEN_LEGACY = ['kube-how:diagram-seen:v1', 'kube-how:scheme-seen:v1'];
const DAY_MS = 864e5;

function parseSeen(storageKey) {
  try {
    const v = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return v && typeof v === 'object' ? v : null;
  } catch (_) {
    return null;
  }
}

// The map under its current key, else the first `legacy` key's map with each key renamed through
// `carry` (old key to new): an unchanged item keeps its stamp, a changed one reads NEW.
export function readSeen(storageKey, legacy = [], carry = {}) {
  const seen = parseSeen(storageKey);
  if (seen) return seen;
  for (const old of legacy) {
    const v = parseSeen(old);
    if (v) return Object.fromEntries(Object.entries(v).map(([k, st]) => [carry[k] ?? k, st]));
  }
  return null;
}

export const isFreshStamp = (stamp, now = Date.now()) => stamp > 0 && now - stamp < FRESH_DAYS * DAY_MS;

// The stored stamp of a key, or undefined if never seen. An `id@revision` key falls back to its bare
// id, the form stored before revisions existed, so the switch to revisions marks nothing new.
export function stampOf(seen, k) {
  if (k in seen) return seen[k];
  const at = k.indexOf('@');
  return at > 0 ? seen[k.slice(0, at)] : undefined;
}

export function trackFresh(storageKey, keys, legacy = [], carry = {}) {
  const seen = readSeen(storageKey, legacy, carry);
  const now = Date.now();
  const map = {};
  for (const k of keys) map[k] = !seen ? 0 : (stampOf(seen, k) ?? now);
  const save = () => { try { localStorage.setItem(storageKey, JSON.stringify(map)); } catch (_) {} };
  save();
  for (const old of legacy) { try { localStorage.removeItem(old); } catch (_) {} }
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
