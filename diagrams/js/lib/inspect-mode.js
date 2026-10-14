// `?inspect=1|grid|expose` or the `diagram:inspect` localStorage key. Apart from lib/inspector.js so
// app.js can ask on every load and fetch the inspector itself only when the answer is yes.
export function inspectMode() {
  try {
    const qs = new URLSearchParams(location.search);
    const v = qs.get('inspect');
    if (v === '1' || v === 'grid') return 'grid';
    if (v === 'expose') return 'expose';
  } catch (_) {}
  try {
    const v = localStorage.getItem('diagram:inspect');
    if (v === '1' || v === 'grid') return 'grid';
    if (v === 'expose') return 'expose';
  } catch (_) {}
  return false;
}

export function isInspectActive() {
  return inspectMode() !== false;
}
