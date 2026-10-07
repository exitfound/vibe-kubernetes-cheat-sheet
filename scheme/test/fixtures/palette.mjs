// What a painted element resolves to and how a walk files it, shared by the palette gate and the
// palette-steps report (a test file cannot import another without re-registering its tests).
// Blind to whether a colour is the right hue.

// A palette slot, not the card's category (C-01): a workloads card paints its kubelet box 'cluster'.
export const ROLES = ['cluster', 'workloads', 'network', 'storage'];

// What getComputedStyle returns for a paint that resolved to nothing.
export const UNPAINTED_RE = /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/;

// 'unknown' (role outside ROLES), 'unpainted' (role set, nothing resolved), 'painted' with the C-03 tuple key.
// The category comes off the card id, which makes keys comparable across cards.
export function classify(id, row) {
  if (!ROLES.includes(row.role)) return { verdict: 'unknown' };
  const colour = row.paintProp === 'fill' ? row.fill : row.stroke;
  if (!colour || colour === 'none' || UNPAINTED_RE.test(colour)) return { verdict: 'unpainted', colour };
  return {
    verdict: 'painted',
    colour,
    key: `${id.split('-')[0]}|${row.cls}|${row.role}|${row.state}|${row.paintProp}`,
  };
}

// Class -> the descendant carrying the paint. `.scheme-arrow` guards dim lanes painting like live ones.
export const PAINTED = [
  ['.scheme-pod', '.scheme-pod-rect'],
  ['.scheme-box', '.scheme-box-rect'],
  ['.scheme-chip', '.scheme-chip-rect'],
  ['.scheme-cylinder', '.scheme-cylinder-body'],
  ['.scheme-packet', null],
  ['.scheme-ripple', null],
  ['.scheme-arrow', null],
];

// Runs in the page, serialised across CDP: no free variables.
export function probePaint(painted) {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const [sel, childSel] of painted) {
    for (const el of svg.querySelectorAll(`${sel}[data-role]`)) {
      const paint = childSel ? el.querySelector(childSel) : el;
      if (!paint) continue;
      const cs = getComputedStyle(paint);
      // `.highlight` and `scheme-arrow-dim` are in the key because lit and dim are meant to differ.
      const state = ['highlight', 'scheme-arrow-dim']
        .filter(c => el.classList.contains(c)).join('+') || 'rest';
      out.push({
        cls: sel.slice(1),
        role: el.getAttribute('data-role'),
        state,
        stroke: cs.stroke,
        fill: cs.fill,
        paintProp: sel === '.scheme-packet' ? 'fill' : 'stroke',
      });
    }
  }
  return out;
}
