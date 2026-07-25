// check-geometry.mjs: geometry lint in viewBox units over every step. Reports THROUGH, DIAGONAL,
// OFFEDGE, CENTRE and CENTRE-LOW. Not in the gate yet, see scheme/CLAUDE.md (Dev tools).
// node check-geometry.mjs <id> [<id> ...]
import { launch, setInspect, stepCount, DEFAULT_BASE } from './_shared.mjs';

const TOL = 6;          // units of slack on a midpoint or a centre
const EDGE_TOL = 2;     // how close a point must be to a face to count as "on" it
// Deliberate lane-pair offsets used to be whitelisted numerically. The twin rule below covers the
// same case structurally, so the list is gone: keeping it hid unpaired endpoints at those values.
// Two lanes on ONE face at mirrored offsets (+d and -d) are a deliberate pair, whatever d is.
// Pooled across all steps, since a pair whose halves live in different steps is still a pair.
const TWIN_TOL = 2;
const FACE_FRAC = 0.18;

const ids = process.argv.slice(2);
if (!ids.length) { console.error('usage: node check-geometry.mjs <id> [<id> ...]'); process.exit(1); }

const browser = await launch();
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await page.addInitScript(setInspect, 'expose');

const probe = () => {
  const svg = document.querySelector('dialog.scheme-dialog svg.diagram');
  if (!svg) return null;

  // getBBox() is in the element's own user space and primitives are translated groups, so map
  // every bbox through the element-to-root matrix or the check compares two coordinate systems.
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
    // Every M starts a NEW polyline. Reading `d` as one flat number list fabricates a segment
    // between subpaths, and those phantoms were the whole DIAGONAL report (and can fake THROUGH).
    let subpaths = [];
    if (el.tagName.toLowerCase() === 'line') {
      subpaths = [[[+el.getAttribute('x1'), +el.getAttribute('y1')], [+el.getAttribute('x2'), +el.getAttribute('y2')]]];
    } else {
      const d = el.getAttribute('d') || '';
      if (/[QqCcSsTtAa]/.test(d)) continue;         // curved: no straight-segment claim to make
      const toks = d.match(/[MmLlHhVvZz]|-?\d+(?:\.\d+)?/g) || [];
      let cmd = null, cur = null, x = 0, y = 0, start = null;
      for (let i = 0; i < toks.length;) {
        if (/^[MmLlHhVvZz]$/.test(toks[i])) {
          cmd = toks[i++];
          if (/[Zz]/.test(cmd) && cur && start) { cur.push([start[0], start[1]]); }
          continue;
        }
        if (!cmd) break;                        // `d` starting with a number: nothing to claim
        const rel = cmd === cmd.toLowerCase();
        if (/[Hh]/.test(cmd))      { x = rel ? x + (+toks[i++]) : +toks[i++]; }
        else if (/[Vv]/.test(cmd)) { y = rel ? y + (+toks[i++]) : +toks[i++]; }
        else {
          const nx = +toks[i++], ny = +toks[i++];
          x = rel ? x + nx : nx; y = rel ? y + ny : ny;
        }
        if (/[Mm]/.test(cmd)) { cur = [[x, y]]; subpaths.push(cur); start = [x, y]; cmd = rel ? 'l' : 'L'; }
        else if (cur) { cur.push([x, y]); }
      }
    }
    const lm = rootCTM.inverse().multiply(el.getScreenCTM());
    for (const sp of subpaths) {
      if (sp.length < 2) continue;
      lanes.push(sp.map(([px, py]) => {
        const p = svg.createSVGPoint(); p.x = px; p.y = py;
        const q = p.matrixTransform(lm);
        return [Math.round(q.x * 100) / 100, Math.round(q.y * 100) / 100];
      }));
    }
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
  // The overlay's REAL extent in viewBox units: the blanket safe-zone is a catalog worst case, so
  // a card reserving the whole gutter is judged against its own. Same mapping as overlay-measure.
  let overlay = null;
  const ov = document.querySelector('.narration-overlay');
  if (ov) {
    const sb = svg.getBoundingClientRect();
    const ob = ov.getBoundingClientRect();
    const vb = svg.viewBox.baseVal;
    const scale = Math.min(sb.width / vb.width, sb.height / vb.height);   // xMidYMid meet
    const offX = sb.left + (sb.width - vb.width * scale) / 2;
    const offY = sb.top + (sb.height - vb.height * scale) / 2;
    overlay = { right: (ob.right - offX) / scale + vb.x, bottom: (ob.bottom - offY) / scale + vb.y };
  }

  return { blocks, lanes, content: [cx0, cx1], chips: [px0, px1], overlay };
};

// Does segment (a,b) pass through the interior of rect r? Endpoints resting on a
// face do not count, only a genuine crossing of the inside.
function crosses(a, b, r, tol) {
  const x0 = r.x + tol, x1 = r.x + r.w - tol, y0 = r.y + tol, y1 = r.y + r.h - tol;
  if (x1 <= x0 || y1 <= y0) return false;
  // A segment ENDING inside a block is an arrival, not a crossing: storage lanes routinely
  // terminate on a container inside a Pod shell.
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
  // Pooled across every step: face endpoints (twin rule), distinct blocks (CENTRE-LOW) and the
  // worst overlay extent. A block that only appears mid-story still has to sit where it belongs.
  const faceHits = new Map();
  const blockSeen = new Map();
  let ovRight = 0, ovBottom = 0;
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
      // Endpoint-on-edge accumulation. Judged after every step has been walked, so a
      // lane pair split across steps is still recognised as a pair.
      for (const p of [pts[0], pts[pts.length - 1]]) {
        for (const r of data.blocks) {
          const mx = r.x + r.w / 2, my = r.y + r.h / 2;
          const onV = (Math.abs(p[0] - r.x) < EDGE_TOL || Math.abs(p[0] - (r.x + r.w)) < EDGE_TOL) && p[1] > r.y - EDGE_TOL && p[1] < r.y + r.h + EDGE_TOL;
          const onH = (Math.abs(p[1] - r.y) < EDGE_TOL || Math.abs(p[1] - (r.y + r.h)) < EDGE_TOL) && p[0] > r.x - EDGE_TOL && p[0] < r.x + r.w + EDGE_TOL;
          // Face key is the block's geometry, not its index: the blocks array is rebuilt
          // per step and its order is not stable.
          const gk = `${r.x.toFixed(0)},${r.y.toFixed(0)},${r.w.toFixed(0)},${r.h.toFixed(0)}`;
          const push = (face, off, axis) => {
            const k = `${gk}:${face}`;
            if (!faceHits.has(k)) faceHits.set(k, []);
            faceHits.get(k).push({ off, p, r, axis });
          };
          if (onV) push(Math.abs(p[0] - r.x) < EDGE_TOL ? 'left' : 'right', p[1] - my, 'v');
          if (onH) push(Math.abs(p[1] - r.y) < EDGE_TOL ? 'top' : 'bottom', p[0] - mx, 'h');
        }
      }
    }
    for (const b of data.blocks) blockSeen.set(`${b.x.toFixed(0)},${b.y.toFixed(0)},${b.w.toFixed(0)},${b.h.toFixed(0)}`, b);
    if (data.overlay) {
      ovRight = Math.max(ovRight, data.overlay.right);
      ovBottom = Math.max(ovBottom, data.overlay.bottom);
    }
    span[0] = Math.min(span[0], data.content[0]); span[1] = Math.max(span[1], data.content[1]);
    strip[0] = Math.min(strip[0], data.chips[0]); strip[1] = Math.max(strip[1], data.chips[1]);
  }

  // OFFEDGE verdicts: an endpoint is a defect only if it is alone on its face. A
  // mirrored sibling (+d against -d) means the two are a deliberate lane pair.
  for (const hits of faceHits.values()) {
    for (const h of hits) {
      const off = Math.abs(h.off);
      if (off <= TOL) continue;
      const face = h.axis === 'v' ? h.r.h : h.r.w;
      if (off / face <= FACE_FRAC) continue;
      if (hits.some(o => o !== h && Math.abs(o.off + h.off) <= TWIN_TOL)) continue;
      const r = h.r;
      const mid = h.axis === 'v' ? (r.y + r.h / 2) : (r.x + r.w / 2);
      const key = `OFFEDGE ${h.p} ${r.label} ${h.axis}`;
      if (seen.has(key)) continue;
      seen.add(key);
      const where = h.axis === 'v' ? `side edge` : `top/bottom edge`;
      const axisName = h.axis === 'v' ? 'y' : 'x';
      issues.push(`  OFFEDGE   endpoint (${h.p}) alone on "${r.label}" ${where}, ${off.toFixed(0)} off its midpoint ${axisName}=${mid.toFixed(0)} (${(100 * off / face).toFixed(0)}% of a ${face.toFixed(0)} face)`);
    }
  }

  // CENTRE verdicts.
  const cc = (span[0] + span[1]) / 2;
  const pc = (strip[0] + strip[1]) / 2;
  const ovNote = ovBottom ? ` [overlay covers x<=${ovRight.toFixed(0)}, y<=${ovBottom.toFixed(0)}]` : '';
  if (Math.abs(pc - 600) > TOL) issues.push(`  CENTRE    chip strip spans ${strip[0].toFixed(0)}..${strip[1].toFixed(0)}, centre ${pc.toFixed(0)} (want 600)`);
  if (Math.abs(cc - 600) > 40) issues.push(`  CENTRE    content spans ${span[0].toFixed(0)}..${span[1].toFixed(0)}, centre ${cc.toFixed(0)} (want ~600, margins ${span[0].toFixed(0)} / ${(1200 - span[1]).toFixed(0)})${ovNote}`);

  // CENTRE-LOW: content entirely BELOW the overlay has the full width free, so a gutter there is
  // not the safe-zone paying for itself. Separates reserving the band as an L from as a rectangle.
  if (ovBottom) {
    const low = [...blockSeen.values()].filter(b => b.y >= ovBottom && !b.isFrame);
    if (low.length >= 2) {
      const lo = Math.min(...low.map(b => b.x)), hi = Math.max(...low.map(b => b.x + b.w));
      const lc = (lo + hi) / 2;
      if (hi - lo >= 200 && Math.abs(lc - 600) > 40) {
        issues.push(`  CENTRE-LOW ${low.length} blocks below the overlay span ${lo.toFixed(0)}..${hi.toFixed(0)}, centre ${lc.toFixed(0)} (want ~600, full width is free there)`);
      }
    }
  }

  if (issues.length) { bad++; console.log(`\n${id}  ${issues.length} issue(s)`); issues.forEach(l => console.log(l)); }
  else console.log(`\n${id}  clean`);
}

await browser.close();
process.exit(bad ? 1 : 0);
