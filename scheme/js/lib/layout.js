// The DERIVED half of a card header. A MEASURED input stays in the card that measured it (L-07):
// these take such numbers, never hold them.

// Mirrored offsets, which is what L-12 reads as a deliberate pair and not two stray endpoints.
export const laneY = (centre, dy) => ({ out: centre - dy, back: centre + dy });

// One rowH and gap feeding a ladder AND the chip column beside it keeps the two on one rhythm.
export const ladder = ({ y = 0, rowH, gap }) => (i) => y + i * (rowH + gap);

export const midX = (a, b) => (a + b) / 2;

// The confusable pair, and the only reason either needs a name: strip fixes the GAP and derives
// width, spread fixes the WIDTH and derives gap. Both span from..to exactly.
export function strip({ from, to, count, gap }) {
  const w = count > 0 ? (to - from - gap * (count - 1)) / count : 0;
  return { w, gap, x: (i) => from + i * (w + gap) };
}
export function spread({ from, to, count, w }) {
  const gap = count > 1 ? (to - from - w * count) / (count - 1) : 0;
  return { w, gap, x: (i) => from + i * (w + gap) };
}

// One value over a NAMED SET, the shape the `opacity` field takes. laneOf stays at the call site:
// A-13 pairs two ENDS, and a key list has one.
export const shade = (keys, value) => Object.fromEntries(keys.map(k => [k, value]));
