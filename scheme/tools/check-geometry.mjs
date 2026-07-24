// check-geometry.mjs — static geometry lint for a scheme card, in viewBox units.
//
// Catches the defect class that survives every other check because it is invisible
// in source and easy to miss in a frame: a lane drawn THROUGH a block, a slanted
// segment in an orthogonal grammar, a lane that meets a block off its edge
// midpoint, and a composition whose centre is not the canvas centre.
//
// It reads the built SVG (all steps, so lanes that only exist mid-story are seen),
// pulls every .scheme-arrow path plus every block bbox, and reports:
//   THROUGH  a lane segment crosses a block it neither starts nor ends on
//   DIAGONAL a segment that is neither horizontal nor vertical
//   OFFEDGE  a lane endpoint on a block edge but off its midpoint by > TOL
//   CENTRE   content bbox / chip strip centre away from x=600 by > TOL
//
// node check-geometry.mjs <id> [<id> ...]
import { launch, setInspect, stepCount, DEFAULT_BASE } from './_shared.mjs';

const TOL = 6;          // units of slack on a midpoint or a centre
const EDGE_TOL = 2;     // how close a point must be to a face to count as "on" it
// The family's deliberate lane-pair offsets (storage-kit cards use 10/12/16 in narrow
// columns and 40 in wide ones). An endpoint sitting exactly on one of these is a lane
// twin, not a mistake. Anything else is judged as a fraction of the face it meets.
const LANE_OFFSETS = new Set([10, 12, 14, 16, 40]);
const FACE_FRAC = 0.18;

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node check-geometry.mjs <id> [<id> ...]'); process.exit(1); }

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');

const probe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // A block's getBBox() is in ITS OWN user space, but primitives are <g transform=
  // "translate(x,y)">, so a raw bbox is offset from the coordinates the lane arrays
  // are written in. Map every bbox through the element-to-root matrix first, or the
  // whole check silently compares two different coordinate systems.
  const rootCTM = svg.getScreenCTM();
  const toRoot = (el, b) => {
    const m = rootCTM.inverse().multiply(el.getScreenCTM());
    const pt = (x, y) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(m);
      return [q.x, q.y];
    };
    const c = [pt(b.x, b.y), pt(b.x + b.width, b.y), pt(b.x, b.y + b.height), pt(b.x + b.width, b.y + b.height)];
    const xs = c.map(p => p[0]), ys = c.map(p => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  };

  // Blocks: the rects/shapes a lane must not be drawn across. Pods, boxes, cylinders
  // and node frames. Chips and captions are excluded: lanes never route near them.
  const blocks = [];
  // A node frame is a CONTAINER, not an obstacle: lanes are supposed to run inside
  // it to reach the blocks it holds, so it is measured but never counted as crossed.
  for (const sel of ['.scheme-box', '.scheme-pod', '.scheme-cylinder', '.scheme-node']) {
    const isFrame = sel === '.scheme-node';
    for (const el of svg.querySelectorAll(sel)) {
      if (el.closest('#packetLayer')) continue;
      const cs = getComputedStyle(el);
      if (cs.opacity === '0' || cs.display === 'none') continue;
      const b = toRoot(el, el.getBBox());
      const label = (el.querySelector('text') || {}).textContent || sel;
      blocks.push({ label: label.trim().slice(0, 28), x: b.x, y: b.y, w: b.w, h: b.h, isFrame });
    }
  }

  // Lanes: every arrow/relationship path. Parse the M/L polyline out of `d`, or the
  // x1/y1/x2/y2 of a <line>.
  const lanes = [];
  for (const el of svg.querySelectorAll('.scheme-arrow')) {
    if (el.closest('#packetLayer')) continue;
    const cs = getComputedStyle(el);
    if (cs.opacity === '0' || cs.display === 'none') continue;
    let pts = null;
    if (el.tagName.toLowerCase() === 'line') {
      pts = [[+el.getAttribute('x1'), +el.getAttribute('y1')], [+el.getAttribute('x2'), +el.getAttribute('y2')]];
    } else {
      const d = el.getAttribute('d') || '';
      const nums = d.match(/-?\d+(\.\d+)?/g);
      if (!nums || nums.length < 4) continue;
      pts = [];
      for (let i = 0; i + 1 < nums.length; i += 2) pts.push([+nums[i], +nums[i + 1]]);
    }
    const lm = rootCTM.inverse().multiply(el.getScreenCTM());
    pts = pts.map(([x, y]) => {
      const p = svg.createSVGPoint(); p.x = x; p.y = y;
      const q = p.matrixTransform(lm);
      return [Math.round(q.x * 100) / 100, Math.round(q.y * 100) / 100];
    });
    lanes.push(pts);
  }

  // Content bbox: every block, so the composition's own centre can be checked.
  let cx0 = Infinity, cx1 = -Infinity;
  for (const b of blocks) { cx0 = Math.min(cx0, b.x); cx1 = Math.max(cx1, b.x + b.w); }

  // Chip strip extent.
  let px0 = Infinity, px1 = -Infinity;
  for (const el of svg.querySelectorAll('.scheme-chip')) {
    const b = toRoot(el, el.getBBox());
    px0 = Math.min(px0, b.x); px1 = Math.max(px1, b.x + b.w);
  }
  return { blocks, lanes, content: [cx0, cx1], chips: [px0, px1] };
};

// Does segment (a,b) pass through the interior of rect r? Endpoints resting on a
// face do not count, only a genuine crossing of the inside.
function crosses(a, b, r, tol) {
  const x0 = r.x + tol, x1 = r.x + r.w - tol, y0 = r.y + tol, y1 = r.y + r.h - tol;
  if (x1 <= x0 || y1 <= y0) return false;
  // A segment that ENDS inside a block is an arrival into it, not a crossing. Storage
  // lanes routinely terminate on a container inside a Pod shell or a node frame, and
  // counting those as crossings buries the real defects in false positives.
  const inside = p => p[0] > x0 && p[0] < x1 && p[1] > y0 && p[1] < y1;
  if (inside(a) || inside(b)) return false;
  // Axis-aligned segments only need an overlap test against the shrunk rect.
  if (Math.abs(a[0] - b[0]) < 0.01) {                     // vertical
    if (a[0] <= x0 || a[0] >= x1) return false;
    const lo = Math.min(a[1], b[1]), hi = Math.max(a[1], b[1]);
    return lo < y1 && hi > y0;
  }
  if (Math.abs(a[1] - b[1]) < 0.01) {                     // horizontal
    if (a[1] <= y0 || a[1] >= y1) return false;
    const lo = Math.min(a[0], b[0]), hi = Math.max(a[0], b[0]);
    return lo < x1 && hi > x0;
  }
  return false;
}

let bad = 0;
for (const id of ids) {
  await page.goto(`${DEFAULT_BASE}/scheme/#scheme=${id}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('dialog.scheme-dialog svg.diagram', { timeout: 10000 });
  const total = await stepCount(page);

  const seen = new Set();
  const issues = [];
  const span = [Infinity, -Infinity], strip = [Infinity, -Infinity];
  for (let i = 0; i < total; i++) {
    await page.evaluate((n) => window.__schemeCtl.gotoStep(n), i);
    await page.waitForTimeout(50);
    const data = await page.evaluate(probe);
    if (!data) continue;

    for (const pts of data.lanes) {
      for (let k = 0; k + 1 < pts.length; k++) {
        const a = pts[k], b = pts[k + 1];
        const dx = Math.abs(a[0] - b[0]), dy = Math.abs(a[1] - b[1]);
        if (dx > 0.01 && dy > 0.01) {
          const key = `DIAGONAL ${a} -> ${b}`;
          if (!seen.has(key)) { seen.add(key); issues.push(`  DIAGONAL  segment (${a}) -> (${b}) is neither horizontal nor vertical`); }
        }
        for (const r of data.blocks) {
          if (r.isFrame) continue;
          if (!crosses(a, b, r, 3)) continue;
          const key = `THROUGH ${a}-${b} ${r.label}`;
          if (!seen.has(key)) { seen.add(key); issues.push(`  THROUGH   segment (${a}) -> (${b}) crosses block "${r.label}" [${r.x.toFixed(0)}..${(r.x + r.w).toFixed(0)} x ${r.y.toFixed(0)}..${(r.y + r.h).toFixed(0)}]`); }
        }
      }
      // Endpoint-on-edge-midpoint check for the two ends of each lane.
      for (const p of [pts[0], pts[pts.length - 1]]) {
        for (const r of data.blocks) {
          const mx = r.x + r.w / 2, my = r.y + r.h / 2;
          const onV = (Math.abs(p[0] - r.x) < EDGE_TOL || Math.abs(p[0] - (r.x + r.w)) < EDGE_TOL) && p[1] > r.y - EDGE_TOL && p[1] < r.y + r.h + EDGE_TOL;
          const onH = (Math.abs(p[1] - r.y) < EDGE_TOL || Math.abs(p[1] - (r.y + r.h)) < EDGE_TOL) && p[0] > r.x - EDGE_TOL && p[0] < r.x + r.w + EDGE_TOL;
          if (onV) {
            const off = Math.abs(p[1] - my);
            if (off > TOL && !LANE_OFFSETS.has(Math.round(off)) && off / r.h > FACE_FRAC) {
              const key = `OFFEDGE ${p} ${r.label} v`;
              if (!seen.has(key)) { seen.add(key); issues.push(`  OFFEDGE   endpoint (${p}) meets "${r.label}" side edge ${off.toFixed(0)} off its midpoint y=${my.toFixed(0)} (${(100 * off / r.h).toFixed(0)}% of a ${r.h.toFixed(0)} face)`); }
            }
          }
          if (onH) {
            const off = Math.abs(p[0] - mx);
            if (off > TOL && !LANE_OFFSETS.has(Math.round(off)) && off / r.w > FACE_FRAC) {
              const key = `OFFEDGE ${p} ${r.label} h`;
              if (!seen.has(key)) { seen.add(key); issues.push(`  OFFEDGE   endpoint (${p}) meets "${r.label}" top/bottom edge ${off.toFixed(0)} off its midpoint x=${mx.toFixed(0)} (${(100 * off / r.w).toFixed(0)}% of a ${r.w.toFixed(0)} face)`); }
            }
          }
        }
      }
    }
    span[0] = Math.min(span[0], data.content[0]); span[1] = Math.max(span[1], data.content[1]);
    strip[0] = Math.min(strip[0], data.chips[0]); strip[1] = Math.max(strip[1], data.chips[1]);
    if (i === total - 1) {
      data.content = span; data.chips = strip;
      const cc = (data.content[0] + data.content[1]) / 2;
      const pc = (data.chips[0] + data.chips[1]) / 2;
      if (Math.abs(pc - 600) > TOL) issues.push(`  CENTRE    chip strip spans ${data.chips[0].toFixed(0)}..${data.chips[1].toFixed(0)}, centre ${pc.toFixed(0)} (want 600)`);
      if (Math.abs(cc - 600) > 40) issues.push(`  CENTRE    content spans ${data.content[0].toFixed(0)}..${data.content[1].toFixed(0)}, centre ${cc.toFixed(0)} (want ~600, margins ${data.content[0].toFixed(0)} / ${(1200 - data.content[1]).toFixed(0)})`);
    }
  }

  if (issues.length) { bad++; console.log(`\n${id}  ${issues.length} issue(s)`); issues.forEach(l => console.log(l)); }
  else console.log(`\n${id}  clean`);
}

await browser.close();
process.exit(bad ? 1 : 0);
