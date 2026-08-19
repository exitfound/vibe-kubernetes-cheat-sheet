#!/usr/bin/env node
// poster-lint.mjs: the mechanical half of the poster canon, read off the source in milliseconds.
// It cannot tell you whether a poster is GOOD. It tells you whether it breaks a rule that has a
// literal shape: a token that will not resolve, an arrowhead, a packet dot frozen on a wire, a
// flat drawing with no subject, a canvas left mostly empty, or a missing record note.
//
// EVERY THRESHOLD IS CALIBRATED against the shipped 108 rather than guessed. The first cut used
// round numbers and reported 260 findings, which is a backlog rather than a lint. It reports about
// 30 today, and each one is worth opening the montage for.
//
//   node .claude/skills/card-poster/tools/poster-lint.mjs [<card-id> ...]   (default: all 108)
//   node .claude/skills/card-poster/tools/poster-lint.mjs --category=storage
//
// The judgement half is montage.mjs plus your eyes. Rules cited by id live in scheme/CANON.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = new URL('../../../../', import.meta.url).pathname;
const SCHEMES = join(ROOT, 'scheme/js/schemes');
const args = process.argv.slice(2);
const flags = Object.fromEntries(args.filter(a => a.startsWith('--')).map(a => {
  const [k, v = 'true'] = a.slice(2).split('='); return [k, v];
}));
const wanted = args.filter(a => !a.startsWith('--'));

// The 11 posters whose whole sentence IS a direction, so a chevron is earned rather than tolerated
// (R-08a). Anything outside this list carrying a triangle is a finding.
const CHEVRON_OK = new Set([
  'workloads-rolling-update', 'workloads-graceful-shutdown', 'workloads-restart-policy',
  'workloads-crashloopbackoff', 'workloads-statefulset-ordered-startup', 'workloads-pvc-stickiness',
  'workloads-deployment-rollback', 'workloads-cronjob',
  'storage-volume-attach-limits', 'storage-volumeclaimtemplates', 'storage-pvc-retention-policy',
]);

const posters = new Map();      // id -> { cat, svg }
for (const cat of readdirSync(SCHEMES)) {
  const file = join(SCHEMES, cat, 'posters.js');
  if (!existsSync(file)) continue;
  const src = readFileSync(file, 'utf8');
  const re = /'([\w-]+)':\s*`([\s\S]*?)`,?\n/g;
  let m;
  while ((m = re.exec(src))) posters.set(m[1], { cat, svg: m[2] });
}

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

let findings = 0;
for (const id of ids) {
  const entry = posters.get(id);
  if (!entry) { console.log(`${id}: NO POSTER (D-06 says the bijection is exact)`); findings++; continue; }
  const { cat, svg } = entry;
  const out = [];
  const say = (rule, msg) => out.push(`  ${rule.padEnd(7)} ${msg}`);

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

  // R-04: what will not resolve, and what carries a second camera.
  if (svg.includes('var(--')) say('R-04', 'uses var(--token): an SVG presentation attribute does not resolve it');
  if (/<svg\b/.test(svg)) say('R-04', 'nests its own <svg>: the poster is a FRAGMENT, the grid owns the camera');
  for (const f of svg.matchAll(/fill="(?!none|currentColor|rgba\()([^"]+)"/g)) say('R-04', `fill="${f[1]}" is neither none, currentColor nor a literal rgba()`);
  for (const s of svg.matchAll(/stroke="(?!currentColor|none)([^"]+)"/g)) say('R-04', `stroke="${s[1]}" is not currentColor`);

  // R-08 / R-08a: direction by composition, not by arrowhead.
  if (/marker-(end|start)=/.test(svg)) say('R-08', 'carries an arrow marker: direction comes from the composition, not from an arrowhead');
  const tri = (svg.match(/<polygon\b/g) || []).length;
  if (tri && !CHEVRON_OK.has(id)) say('R-08a', `carries ${tri} polygon(s): a chevron is earned only when the whole sentence IS a direction`);

  // R-09: a filled dot sitting ON a wire reads as a paused animation.
  for (const c of circles) {
    if (c.r > 5 || !/fill="currentColor"/.test(c.tag)) continue;
    if (lines.some(l => onSegment(c, l))) say('R-09', `a filled r=${c.r} dot sits on a line at (${c.x}, ${c.y}): that reads as a frozen packet`);
  }

  // R-03 / R-07: one thing is brightest. THRESHOLDS ARE MEASURED against the shipped 108, not
  // guessed: 59 posters carry no `fill="currentColor"` at all and weight by line or by fill ramp
  // instead, so the absence of an accent bar is NOT a finding. What is a finding is a FLAT poster:
  // every fill identical and one stroke-width, which means nothing at all stands out.
  const accents = (svg.match(/fill="currentColor"/g) || []).length;
  const fillSet = new Set([...svg.matchAll(/rgba\(255,255,255,([\d.]+)\)/g)].map(m => m[1]));
  const widthSet = new Set([...svg.matchAll(/stroke-width="([\d.]+)"/g)].map(m => m[1]));
  const opacitySet = new Set([...svg.matchAll(/\sopacity="([\d.]+)"/g)].map(m => m[1]));
  if (!accents && fillSet.size <= 1 && widthSet.size <= 1 && !opacitySet.size && shapes > 3) {
    say('R-03', 'FLAT: one fill, one stroke-width, no opacity ramp. Nothing is the subject');
  }
  if (accents > 3) say('R-07', `${accents} elements use fill="currentColor": the accent stops being an accent`);

  // R-02 / R-10: a poster is one sentence, not a small diagram. Measured: the median poster carries
  // 12 primitives and the 90th percentile is 19, so the line sits above the house maximum.
  if (shapes > 20) say('R-02', `${shapes} primitives, against a catalog median of 12: decide the sentence and drop the rest`);

  // Air: the union box against the 320x180 canvas.
  const xs = [...rects.map(r => r.x), ...rects.map(r => r.x + r.w), ...circles.map(c => c.x - c.r), ...circles.map(c => c.x + c.r), ...lines.flatMap(l => [l.x1, l.x2])];
  const ys = [...rects.map(r => r.y), ...rects.map(r => r.y + r.h), ...circles.map(c => c.y - c.r), ...circles.map(c => c.y + c.r), ...lines.flatMap(l => [l.y1, l.y2])];
  // Measured over the shipped 108: the median drawing covers 51% of the canvas and the 5th
  // percentile is 21%, so the line sits at the bottom of the real distribution rather than at a
  // number that would flag half the catalog.
  if (xs.length && ys.length) {
    const bx = [Math.min(...xs), Math.max(...xs)], by = [Math.min(...ys), Math.max(...ys)];
    const cover = ((bx[1] - bx[0]) * (by[1] - by[0])) / (320 * 180);
    if (cover < 0.22) say('R-06', `the drawing covers ${(cover * 100).toFixed(0)}% of the canvas (median is 51%): x ${bx[0]}..${bx[1]}, y ${by[0]}..${by[1]}, and dead air reads as a mistake`);
  }

  // R-12: the note that explains the choice.
  const md = join(SCHEMES, cat, 'CARDS.md');
  if (existsSync(md)) {
    const section = (readFileSync(md, 'utf8').split(`\n## ${id}\n`)[1] || '').split('\n## ')[0];
    if (!section) say('R-12', `no "## ${id}" section in ${cat}/CARDS.md`);
    else if (!section.includes('### poster')) say('R-12', 'the record has no "### poster" subsection explaining the choice');
  }

  if (out.length) {
    console.log(`\n${id}  (${cat}, ${shapes} primitives)`);
    console.log(out.join('\n'));
    findings += out.length;
  }
}

console.log(`\n${ids.length} poster(s) read, ${findings} mechanical finding(s).`);
console.log('A clean run says nothing about whether the poster is any good: that is montage.mjs and your eyes.');
