#!/usr/bin/env node
// poster-lint.mjs: the mechanical half of the poster canon (R-02 to R-12), read off the posters.js source.
// usage: node .claude/skills/card-poster/tools/poster-lint.mjs [<card-id> ...] [--category=<cat>] [--calibrate]
// Thresholds are snapped to the REFERENCE set, so re-run --calibrate after changing one. Whether a poster is good is montage.mjs.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../../', import.meta.url).pathname;
const SCHEMES = join(ROOT, 'scheme/js/schemes');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const wanted = args.filter(a => !a.startsWith('--'));

// Allowlist for R-08a: exactly the posters that draw a chevron, so every exemption traces back to a picture.
const CHEVRON_OK = new Set([
  'workloads-pod-restart-policy',            // two filled path triangles, on the two restart arcs
  'workloads-pod-startup-conditions',        // one polygon
  'network-external-traffic-policy',           // two open polyline chevrons, where the external feed lands on each entry Node
]);

// A chevron is told by size and symmetry, not by tag: a three-point polyline with two short near-equal legs, or a path
// closing (`Z`) on three points or fewer filled with `currentColor` (cylinders close too, but fill a literal rgba).
const CHEV_LEG = 15;      // units, well above any real chevron leg
const CHEV_RATIO = 1.3;   // a chevron is symmetric. A short elbow is not

// The categories every threshold is snapped to: add one rebuilt to that standard and re-run `--calibrate`.
const REFERENCE = new Set(['workloads', 'cluster']);

// INK: brightness multiplies the fill alpha (`currentColor` is 1), the element's opacity/fill-opacity and those of
// every enclosing `<g>`, so the walk keeps a stack of open groups.
const attrOf = (tag, name) => {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
};
const alphaOf = fill => {
  if (!fill || fill === 'none') return null;
  if (fill === 'currentColor') return 1;
  const m = fill.match(/rgba\(255,\s*255,\s*255,\s*([\d.]+)\)/);
  return m ? +m[1] : null;
};
function inks(svg) {
  const out = [];
  const stack = [{ fill: null, op: 1, fo: 1 }];
  for (const m of svg.matchAll(/<(\/?)(g|rect|circle|ellipse|path|line|polyline|polygon)\b([^>]*)>/g)) {
    const [, close, tag, rest] = m;
    if (tag === 'g') {
      if (close) { if (stack.length > 1) stack.pop(); continue; }
      if (/\/$/.test(rest)) continue;                       // a self-closing <g/> opens nothing
      const top = stack[stack.length - 1];
      stack.push({
        fill: attrOf(rest, 'fill') ?? top.fill,
        op: top.op * (+attrOf(rest, 'opacity') || 1),
        fo: top.fo * (+attrOf(rest, 'fill-opacity') || 1),
      });
      continue;
    }
    if (close) continue;
    const top = stack[stack.length - 1];
    const a = alphaOf(attrOf(rest, 'fill') ?? top.fill);
    if (a === null) continue;                               // stroked outline, no fill to measure
    const op = attrOf(rest, 'opacity') !== null ? +attrOf(rest, 'opacity') : 1;
    const fo = attrOf(rest, 'fill-opacity') !== null ? +attrOf(rest, 'fill-opacity') : 1;
    const ink = a * op * top.op * fo * top.fo;
    if (ink > 0) out.push(ink);
  }
  return out;
}

// Floor on the brightest mark, snapped under the reference set by `--calibrate`.
const INK_FLOOR = 0.55;

// Ceiling on primitives, snapped above the reference set by `--calibrate`.
const PRIM_CEILING = 20;

// Floor on the drawing's union box as a fraction of the 320x180 canvas.
const COVER_FLOOR = 0.22;
function coverOf({ rects, circles, lines }) {
  const xs = [...rects.map(r => r.x), ...rects.map(r => r.x + r.w), ...circles.map(c => c.x - c.r), ...circles.map(c => c.x + c.r), ...lines.flatMap(l => [l.x1, l.x2])];
  const ys = [...rects.map(r => r.y), ...rects.map(r => r.y + r.h), ...circles.map(c => c.y - c.r), ...circles.map(c => c.y + c.r), ...lines.flatMap(l => [l.y1, l.y2])];
  if (!xs.length || !ys.length) return null;
  const bx = [Math.min(...xs), Math.max(...xs)], by = [Math.min(...ys), Math.max(...ys)];
  return { cover: ((bx[1] - bx[0]) * (by[1] - by[0])) / (320 * 180), bx, by };
}

// The geometry every check below reads, parsed once per poster.
function geomOf(svg) {
  const rects = [...svg.matchAll(/<rect\b[^>]*>/g)].map(t => t[0]).map(tag => ({
    tag,
    x: +(tag.match(/\sx="([-\d.]+)"/) || [0, 0])[1], y: +(tag.match(/\sy="([-\d.]+)"/) || [0, 0])[1],
    w: +(tag.match(/width="([\d.]+)"/) || [0, 0])[1], h: +(tag.match(/height="([\d.]+)"/) || [0, 0])[1],
  }));
  const circles = [...svg.matchAll(/<circle\b[^>]*>/g)].map(t => t[0]).map(tag => ({
    tag,
    x: +(tag.match(/cx="([\d.]+)"/) || [0, 0])[1], y: +(tag.match(/cy="([\d.]+)"/) || [0, 0])[1],
    r: +(tag.match(/\br="([\d.]+)"/) || [0, 0])[1],
  }));
  const lines = [...svg.matchAll(/<line\b[^>]*>/g)].map(t => t[0]).map(tag => ({
    x1: +(tag.match(/x1="([\d.]+)"/) || [0, 0])[1], y1: +(tag.match(/y1="([\d.]+)"/) || [0, 0])[1],
    x2: +(tag.match(/x2="([\d.]+)"/) || [0, 0])[1], y2: +(tag.match(/y2="([\d.]+)"/) || [0, 0])[1],
  }));
  const shapes = (svg.match(/<(rect|circle|line|path|polygon|ellipse|polyline)\b/g) || []).length;
  return { rects, circles, lines, shapes };
}

const pointsOf = s => {
  const n = s.trim().split(/[\s,]+/).map(Number);
  const p = [];
  for (let i = 0; i < n.length; i += 2) p.push([n[i], n[i + 1]]);
  return p;
};
const legsOf = p => p.slice(1).map((q, i) => Math.hypot(q[0] - p[i][0], q[1] - p[i][1]));

function chevrons(svg) {
  const found = [];
  for (const m of svg.matchAll(/<polygon\b[^>]*>/g)) found.push('polygon');
  for (const m of svg.matchAll(/<polyline\b[^>]*\spoints="([^"]+)"[^>]*>/g)) {
    const p = pointsOf(m[1]);
    if (p.length !== 3) continue;
    const [a, b] = legsOf(p);
    if (a <= CHEV_LEG && b <= CHEV_LEG && Math.max(a, b) / Math.min(a, b) <= CHEV_RATIO) {
      found.push('polyline chevron');
    }
  }
  for (const m of svg.matchAll(/<path\b[^>]*>/g)) {
    if (!/fill="currentColor"/.test(m[0])) continue;
    const d = (m[0].match(/\sd="([^"]+)"/) || [])[1] || '';
    if (!/[Zz]\s*$/.test(d.trim())) continue;
    if ((d.match(/-?[\d.]+/g) || []).length / 2 <= 3) found.push('filled path triangle');
  }
  return found;
}

const posters = new Map();      // id -> { cat, svg }
for (const cat of readdirSync(SCHEMES)) {
  const file = join(SCHEMES, cat, 'posters.js');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  const re = /'([\w-]+)':\s*`([\s\S]*?)`,?\n/g;
  let m;
  while ((m = re.exec(src))) {
    // R-12 reads the line above the entry: the poster note is the comment directly over it.
    const above = src.slice(0, m.index).replace(/\s+$/, '').split('\n').pop();
    posters.set(m[1], { cat, svg: m[2], noted: /^\s*\/\//.test(above) });
  }
}

// R-05: a coarse silhouette signature (block arrangement and count), so a reader scrolling the grid
// is told when the same shape shows twice in a row.
const gridOrder = () => {
  const out = [];
  for (const cat of readdirSync(SCHEMES)) {
    const file = join(SCHEMES, cat, 'cards.js');
    if (!existsSync(file)) continue;
    const src = readFileSync(file, 'utf8');
    // SUBCATEGORIES is an ORDER, and the grid groups by it, so catalog order is subs x CARDS order.
    const subsBlock = (src.match(/export const SUBCATEGORIES = \[([\s\S]*?)\n\];/) || [, ''])[1];
    const subs = [...subsBlock.matchAll(/key:\s*'([\w-]+)'/g)].map(m => m[1]);
    const cards = [...src.matchAll(/id:\s*'([\w-]+)'[\s\S]{0,800}?subcategory:\s*'([\w-]+)'/g)]
      .map(m => ({ id: m[1], sub: m[2], cat }));
    for (const sub of subs) for (const c of cards) if (c.sub === sub) out.push(c);
  }
  return out;
};

function signature(svg) {
  const { rects, circles } = geomOf(svg);
  const blocks = rects.filter(r => r.w >= 40 && r.h >= 25);
  const band = rects.some(r => r.w >= 190 && r.h <= 45);
  const nested = blocks.some(a => blocks.some(b => a !== b
    && a.x >= b.x - 1 && a.y >= b.y - 1 && a.x + a.w <= b.x + b.w + 1 && a.y + a.h <= b.y + b.h + 1));
  // A cylinder is two arcs and an ellipse, not a ring, or every storage poster signs alike.
  const ring = circles.some(c => c.r >= 12) || (/\bA\s/.test(svg) && !/<ellipse\b/.test(svg));
  const widest = a => a.reduce((best, v) => Math.max(best, a.filter(u => Math.abs(u - v) <= 16).length), 0);
  const row = widest(blocks.map(b => b.y + b.h / 2));
  const col = widest(blocks.map(b => b.x + b.w / 2));
  let arrangement = 'scatter';
  if (ring) arrangement = 'ring';
  else if (nested) arrangement = 'nested';
  else if (band) arrangement = 'band';
  else if (row >= 3 && row >= col) arrangement = 'row';
  else if (col >= 3) arrangement = 'column';
  else if (blocks.length === 2) arrangement = 'pair';
  const size = blocks.length <= 2 ? '2-' : blocks.length <= 4 ? '3-4' : '5+';
  return `${arrangement}/${size}`;
}

const ORDER = gridOrder();
const SIG = new Map();
for (const { id } of ORDER) if (posters.has(id)) SIG.set(id, signature(posters.get(id).svg));
// Neighbours within the same section only: a heading between two posters breaks the repeat.
const neighboursOf = id => {
  const i = ORDER.findIndex(c => c.id === id);
  if (i < 0) return [];
  return [ORDER[i - 1], ORDER[i + 1]].filter(n => n && n.sub === ORDER[i].sub);
};

const ids = wanted.length ? wanted
  : flags.category ? [...posters.keys()].filter(i => posters.get(i).cat === flags.category)
  : [...posters.keys()];

const onSegment = (p, l) => {
  const dx = l.x2 - l.x1, dy = l.y2 - l.y1;
  const len2 = dx * dx + dy * dy;
  if (!len2) return false;
  const t = ((p.x - l.x1) * dx + (p.y - l.y1) * dy) / len2;
  if (t < 0.08 || t > 0.92) return false;                 // an endpoint dot is a terminal, not a packet
  const px = l.x1 + t * dx, py = l.y1 + t * dy;
  return Math.hypot(p.x - px, p.y - py) <= 3;
};

// --calibrate: print each metric over the reference set and over the rest, and how many posters each threshold flags on each side.
if (flags.calibrate) {
  const pct = (a, q) => { const t = [...a].sort((x, y) => x - y); return t[Math.min(t.length - 1, Math.floor(q * t.length))]; };
  const rows = [...posters].map(([id, { cat, svg }]) => {
    const g = geomOf(svg);
    const ink = inks(svg);
    return {
      id, cat, ref: REFERENCE.has(cat),
      maxInk: ink.length ? Math.max(...ink) : 0,
      prims: g.shapes,
      cover: coverOf(g)?.cover ?? 0,
    };
  });
  const metrics = [
    ['maxInk', r => r.maxInk, v => v < INK_FLOOR, `R-03b  below ${INK_FLOOR}`],
    ['prims', r => r.prims, v => v > PRIM_CEILING, `R-02   above ${PRIM_CEILING}`],
    ['cover', r => r.cover, v => v < COVER_FLOOR, `R-06   below ${COVER_FLOOR}`],
  ];
  const ref = rows.filter(r => r.ref), rest = rows.filter(r => !r.ref);
  console.log(`reference: ${[...REFERENCE].join(' + ')}, ${ref.length} posters. Everything else: ${rest.length}.\n`);
  for (const [name, of, fails, label] of metrics) {
    const dist = set => [0.05, 0.5, 0.9].map(q => pct(set.map(of), q)).map(v => (+v).toFixed(2)).join('  ');
    console.log(`${name.padEnd(8)} p05/med/p90   reference ${dist(ref)}   rest ${dist(rest)}`);
    console.log(`${''.padEnd(8)} ${label.padEnd(22)} flags ${ref.filter(r => fails(of(r))).length}/${ref.length} of the reference, ${rest.filter(r => fails(of(r))).length}/${rest.length} of the rest`);
    const hits = ref.filter(r => fails(of(r))).map(r => `${r.id} (${(+of(r)).toFixed(2)})`);
    if (hits.length) console.log(`${''.padEnd(8)} reference posters it flags: ${hits.join(', ')}`);
    console.log('');
  }
  console.log('Per category, brightest mark in the drawing:');
  for (const cat of [...new Set(rows.map(r => r.cat))].sort()) {
    const c = rows.filter(r => r.cat === cat);
    console.log(`  ${cat.padEnd(10)} ${c.length} posters, median ${(+pct(c.map(r => r.maxInk), 0.5)).toFixed(2)}, ${c.filter(r => r.maxInk < INK_FLOOR).length} under the ink floor${REFERENCE.has(cat) ? '   <- reference' : ''}`);
  }
  process.exit(0);
}

let findings = 0;
for (const id of ids) {
  const entry = posters.get(id);
  if (!entry) { console.log(`${id}: NO POSTER (D-06 says the bijection is exact)`); findings++; continue; }
  const { cat, svg } = entry;
  const out = [];
  const say = (rule, msg) => out.push(`  ${rule.padEnd(7)} ${msg}`);

  const { rects, circles, lines, shapes } = geomOf(svg);

  // R-04: what will not resolve, and what carries a second camera.
  if (svg.includes('var(--')) say('R-04', 'uses var(--token): an SVG presentation attribute does not resolve it');
  if (/<svg\b/.test(svg)) say('R-04', 'nests its own <svg>: the poster is a FRAGMENT, the grid owns the camera');
  for (const f of svg.matchAll(/fill="(?!none|currentColor|rgba\()([^"]+)"/g)) say('R-04', `fill="${f[1]}" is neither none, currentColor nor a literal rgba()`);
  for (const s of svg.matchAll(/stroke="(?!currentColor|none)([^"]+)"/g)) say('R-04', `stroke="${s[1]}" is not currentColor`);

  // R-08 / R-08a: direction by composition, not by arrowhead.
  if (/marker-(end|start)=/.test(svg)) say('R-08', 'carries an arrow marker: direction comes from the composition, not from an arrowhead');
  const tri = chevrons(svg);
  if (tri.length && !CHEVRON_OK.has(id)) say('R-08a', `carries ${tri.length} chevron(s) (${[...new Set(tri)].join(', ')}): a chevron is earned only when the whole sentence IS a direction`);

  // R-09: a filled dot sitting ON a wire reads as a paused animation.
  for (const c of circles) {
    if (c.r > 5 || !/fill="currentColor"/.test(c.tag)) continue;
    if (lines.some(l => onSegment(c, l))) say('R-09', `a filled r=${c.r} dot sits on a line at (${c.x}, ${c.y}): that reads as a frozen packet`);
  }

  // R-03b: a floor on the BRIGHTEST mark, whichever it is (accent bar, heavy stroke, solid form), because a poster
  // satisfying every other rule still reads as nothing on the grid when nothing in it is bright.
  const ink = inks(svg);
  const maxInk = ink.length ? Math.max(...ink) : 0;
  if (shapes > 3 && maxInk < INK_FLOOR) {
    say('R-03b', `the brightest mark in the drawing is ${maxInk.toFixed(2)} (reference floor ${INK_FLOOR}, reference median 0.90): at 200px on a dark card nothing in this poster is the subject`);
  }

  // R-05: the same silhouette twice in a row.
  const mySig = SIG.get(id);
  for (const nb of neighboursOf(id)) {
    if (mySig && SIG.get(nb.id) === mySig) {
      say('R-05', `its neighbour on the grid, ${nb.id}, has the same silhouette (${mySig}): a reader scrolling the section sees one shape twice. Differentiate the rhythm or pick another family`);
    }
  }

  // R-03 / R-07: one thing is brightest. R-03 catches the FLAT poster the ink floor misses: one fill, one stroke-width.
  const accents = (svg.match(/fill="currentColor"/g) || []).length;
  const fillSet = new Set([...svg.matchAll(/rgba\(255,255,255,([\d.]+)\)/g)].map(m => m[1]));
  const widthSet = new Set([...svg.matchAll(/stroke-width="([\d.]+)"/g)].map(m => m[1]));
  const opacitySet = new Set([...svg.matchAll(/\sopacity="([\d.]+)"/g)].map(m => m[1]));
  if (!accents && fillSet.size <= 1 && widthSet.size <= 1 && !opacitySet.size && shapes > 3) {
    say('R-03', 'FLAT: one fill, one stroke-width, no opacity ramp. Nothing is the subject');
  }
  // R-07 is about the shape of the accent set, not its size: one winner over losers on one low bar.
  // A ramp, where the losers climb through several values, breaks it.
  const accentTiers = new Set(
    svg.split('\n').filter(l => l.includes('fill="currentColor"'))
      .map(l => (l.match(/opacity="([\d.]+)"/) || [, '1'])[1]),
  );
  if (accentTiers.size >= 3) {
    say('R-07', `accent bars run ${accentTiers.size} opacity tiers (${[...accentTiers].join(' ')}): a ramp, not an accent. One winner, the losers on one low bar`);
  }

  // R-02 / R-10: a poster is one sentence, not a small diagram.
  if (shapes > PRIM_CEILING) say('R-02', `${shapes} primitives, against a reference median of 11: decide the sentence and drop the rest`);

  // Air: the union box against the 320x180 canvas.
  const air = coverOf({ rects, circles, lines });
  if (air && air.cover < COVER_FLOOR) {
    say('R-06', `the drawing covers ${(air.cover * 100).toFixed(0)}% of the canvas (reference median is 54%): x ${air.bx[0]}..${air.bx[1]}, y ${air.by[0]}..${air.by[1]}, and dead air reads as a mistake`);
  }

  // R-12: the poster note is the comment directly above the entry in posters.js, never a record block (`S-51`).
  if (!entry.noted) say('R-12', `no comment above this poster in ${cat}/posters.js saying what its composition is`);

  if (out.length) {
    console.log(`\n${id}  (${cat}, ${shapes} primitives)`);
    console.log(out.join('\n'));
    findings += out.length;
  }
}

console.log(`\n${ids.length} poster(s) read, ${findings} mechanical finding(s).`);
console.log('A clean run says nothing about whether the poster is any good: that is montage.mjs and your eyes.');
