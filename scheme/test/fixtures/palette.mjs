// palette.mjs: what a painted element resolves to, and how a walk files it. One reader for the two
// files that ask, `render/palette.test.mjs` (the gate, one frame per card) and
// `report/palette-steps.test.mjs` (the census, every step of every card).
//
// ===========================================================================================
// WHY IT HAD TO MOVE OUT OF THE TEST FILE
// ===========================================================================================
// The accounting used to live in `render/palette.test.mjs`, which exported `ROLES`, `UNPAINTED_RE`
// and `foldRows` with a comment saying the report test used them "rather than a second private copy
// of it". It could not: importing a `*.test.mjs` REGISTERS ITS TESTS in the importing run, so the
// report would have re-run the whole gate file to borrow a regex. So the report carried the second
// private copy after all: its own `ROLES` array, its own inlined transparent-black regex and its own
// `fold`, and the comment asserting they were shared was the only thing keeping anyone from
// noticing. Three copies of one judgement, and the two that mattered agreed by luck.
//
// A shared reader belongs in fixtures/, which is the same shape the other four subject fixtures
// already have (chip-beat, chip-unwritten, lane-traffic, ripple-double): the gate and the report
// import the reader, and neither imports the other.
//
// ===========================================================================================
// WHAT IT IS BLIND TO
// ===========================================================================================
//   - Whether a colour is the RIGHT one. `classify` says a tuple resolved to SOME colour; deciding
//     that two cards disagree about it is the caller's tuple map (SPREAD), and deciding a colour is
//     the wrong hue is nobody's, because no rule states a hue per role in a form a test can read.
//   - How a row was collected. Both callers read the rendered frame; this only judges a row.

// The four real palette slots. `role` is a palette slot and NOT the card's category (`C-01`): a
// workloads card writes role 'cluster' on its kubelet box on purpose.
export const ROLES = ['cluster', 'workloads', 'network', 'storage'];

// Transparent black, which is what `getComputedStyle` hands back for an element whose paint
// resolved to nothing at all: a role that named no colour, rather than a colour that is subtle.
export const UNPAINTED_RE = /^rgba\(\s*0,\s*0,\s*0,\s*0\s*\)$/;

// One rendered row, judged. Three verdicts and they are exhaustive:
//   'unknown'    the element carries a role outside ROLES, so nothing could have painted it
//   'unpainted'  a role IS set and the paint resolved to nothing (`UNPAINTED` is the only axis that
//                sees a role which resolved no colour)
//   'painted'    it resolved, and `key` is the tuple `C-03` holds to one colour catalog-wide
//
// The category comes off the card ID rather than the element, which is what makes the key comparable
// across cards: `cluster-node-drain` files under `cluster` whatever role its boxes carry.
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

// Element class -> the descendant that actually carries the paint (null = the element itself).
// `.scheme-arrow` is in the list as a regression guard: leaving arrows out of it is what made
// `dim: true` painting like a live lane invisible to every check.
export const PAINTED = [
  ['.scheme-pod', '.scheme-pod-rect'],
  ['.scheme-box', '.scheme-box-rect'],
  ['.scheme-chip', '.scheme-chip-rect'],
  ['.scheme-cylinder', '.scheme-cylinder-body'],
  ['.scheme-packet', null],
  ['.scheme-ripple', null],
  ['.scheme-arrow', null],
];

// Runs IN THE PAGE. Every painted element carrying a data-role, with the colour it resolves to.
// No free variables: it is serialised across the CDP boundary, so it can close over nothing.
export function probePaint(painted) {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;
  const out = [];
  for (const [sel, childSel] of painted) {
    for (const el of svg.querySelectorAll(`${sel}[data-role]`)) {
      const paint = childSel ? el.querySelector(childSel) : el;
      if (!paint) continue;
      const cs = getComputedStyle(paint);
      // State matters. `.highlight` repaints to the bright stop, so a lit chip and a resting one
      // legitimately differ, and `scheme-arrow-dim` is a weight rather than a variant: a dim lane
      // and a live one of the same role are MEANT to differ. Without both in the key the check
      // would report its own blindness as a card defect.
      const state = ['highlight', 'scheme-arrow-dim']
        .filter(c => el.classList.contains(c)).join('+') || 'rest';
      out.push({
        cls: sel.slice(1),
        role: el.getAttribute('data-role'),
        state,
        stroke: cs.stroke,
        fill: cs.fill,
        // A packet paints with fill, everything else with stroke.
        paintProp: sel === '.scheme-packet' ? 'fill' : 'stroke',
      });
    }
  }
  return out;
}
