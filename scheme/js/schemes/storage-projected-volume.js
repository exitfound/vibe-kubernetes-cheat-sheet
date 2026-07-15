import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Projected Volumes. One directory assembled from several sources at once. The consumer Pod is
// top-right, the four sources are a column on the left, and the projected directory sits in the
// middle with one file row per source. The gesture is a FAN-IN: four lanes converge on the one dir.
//
// The card leads to the serviceAccountToken source, the one that matters. Unlike the old forever
// valid Secret-based token, a projected token is short-lived and audience-bound, and kubelet ROTATES
// it in place before it expires, rewriting the same file with a fresh token and no restart. The
// rotation is the beat the card builds to.
//
// Only the Pod pulses (it is the source of downwardAPI metadata and the reader of the token). Sources
// and file rows are infrastructure: they light. The narration overlay owns x<=380 & y<=300, so every
// block starts to the right of it.
const POD_X = 760, POD_Y = 55, POD_W = 340, POD_H = 140;
const POD_BOTTOM = POD_Y + POD_H;                     // 195

const SRC_X = 400, SRC_W = 200, SRC_RIGHT = 600;      // left source column
const CM_Y = 250, SEC_Y = 316, DOWN_Y = 382, TOK_Y = 448, SRC_H = 54;
const DOWN_MY = DOWN_Y + 27;                          // 409

const DIR_X = 650, DIR_Y = 245, DIR_W = 300, DIR_H = 255;
const ROW_X = 680, ROW_W = 240, ROW_H = 40;
const R_CFG_Y = 300, R_PWD_Y = 350, R_LBL_Y = 400, R_TOK_Y = 450;

const CHIPS_Y = 590;

// Each static wire and its ball share one array. The four source lanes fan into the file rows, the
// Pod feeds downwardAPI its own metadata, and the app reads a file back out.
const W_CM   = [[SRC_RIGHT, CM_Y + 27],  [ROW_X, R_CFG_Y + 20]];
const W_SEC  = [[SRC_RIGHT, SEC_Y + 27], [ROW_X, R_PWD_Y + 20]];
const W_DOWN = [[SRC_RIGHT, DOWN_MY],    [ROW_X, R_LBL_Y + 20]];
const W_TOK  = [[SRC_RIGHT, TOK_Y + 27], [ROW_X, R_TOK_Y + 20]];
const W_POD_META = [[830, POD_BOTTOM], [830, 235], [630, 235], [630, DOWN_MY], [SRC_RIGHT, DOWN_MY]];
const W_READ = [[900, R_CFG_Y], [900, 225], [955, 225], [955, POD_BOTTOM]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 46, w: w - 48, h: 58, label: 'app', sublabel: 'reads /var/run/secrets', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function fileRow(y, label) {
  return box({ x: ROW_X, y, w: ROW_W, h: ROW_H, label, sublabel: '', cat: 'storage' });
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Projected volumes: one directory is assembled from several sources at once, a ConfigMap, a Secret, the downwardAPI carrying Pod metadata, and a serviceAccountToken. The token source is short-lived and audience-bound, and kubelet rotates it in place before it expires, unlike the old forever-valid Secret-based token.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'projected volume' });

    const srcCM   = box({ x: SRC_X, y: CM_Y,   w: SRC_W, h: SRC_H, label: 'ConfigMap', sublabel: 'key: config.yaml', cat: 'storage' });
    const srcSec  = box({ x: SRC_X, y: SEC_Y,  w: SRC_W, h: SRC_H, label: 'Secret', sublabel: 'key: password', cat: 'storage' });
    const srcDown = box({ x: SRC_X, y: DOWN_Y, w: SRC_W, h: SRC_H, label: 'downwardAPI', sublabel: 'Pod labels, name', cat: 'storage' });
    const srcTok  = box({ x: SRC_X, y: TOK_Y,  w: SRC_W, h: SRC_H, label: 'serviceAccountToken', sublabel: 'audience-bound', cat: 'storage' });

    const dirBox = box({ x: DIR_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '', sublabel: '', cat: 'storage' });
    dirBox.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)';
    const dirLbl = text({ class: 'scheme-label code dim', x: DIR_X + 12, y: 270, 'text-anchor': 'start' }, ['/var/run/secrets (projected)']);

    const rowCfg = fileRow(R_CFG_Y, 'config.yaml');
    const rowPwd = fileRow(R_PWD_Y, 'password');
    const rowLbl = fileRow(R_LBL_Y, 'labels');
    const rowTok = fileRow(R_TOK_Y, 'token');

    const wCm   = pathArrow({ points: W_CM,   dashed: true, dim: true, color: 'storage' });
    const wSec  = pathArrow({ points: W_SEC,  dashed: true, dim: true, color: 'storage' });
    const wDown = pathArrow({ points: W_DOWN, dashed: true, dim: true, color: 'storage' });
    const wTok  = pathArrow({ points: W_TOK,  dashed: true, dim: true, color: 'storage' });
    const wPodMeta = pathArrow({ points: W_POD_META, dashed: true, dim: true, color: 'storage' });
    const wRead = pathArrow({ points: W_READ, dashed: true, dim: true, color: 'storage' });

    const clockLbl = text({ class: 'scheme-label code dim', x: 800, y: 526, 'text-anchor': 'middle' }, [' ']);

    const srcChip  = valChip({ x: 90,  y: CHIPS_Y, w: 320, h: 34, name: 'sources', value: '4 into one dir', cat: 'storage' });
    const tokChip  = valChip({ x: 430, y: CHIPS_Y, w: 360, h: 34, name: 'SA token', value: 'audience-bound', cat: 'storage' });
    const expChip  = valChip({ x: 810, y: CHIPS_Y, w: 280, h: 34, name: 'expiry', value: 'short-lived', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): dir container, then blocks and file rows, then wires and labels above
    // them, then the chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(dirBox);
    [podB.group, srcCM, srcSec, srcDown, srcTok, rowCfg, rowPwd, rowLbl, rowTok].forEach(el => root.appendChild(el));
    [wCm, wSec, wDown, wTok, wPodMeta, wRead, dirLbl, clockLbl].forEach(el => root.appendChild(el));
    [srcChip, tokChip, expChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podB.group, podBox: podB.innerBox,
      srcCM, srcSec, srcDown, srcTok, dir: dirBox, rowCfg, rowPwd, rowLbl, rowTok,
      srcChip, tokChip, expChip,
      wires: { clock: clockLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { src, tok, exp }) {
  setVal(s.refs.srcChip, src);
  setVal(s.refs.tokChip, tok);
  setVal(s.refs.expChip, exp);
}

function clearHL(s) {
  clearHighlights(s, ['srcCM', 'srcSec', 'srcDown', 'srcTok', 'dir', 'rowCfg', 'rowPwd', 'rowLbl', 'rowTok', 'podBox',
    'srcChip', 'tokChip', 'expChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A projected volume presents several sources as one directory. Under /var/run/secrets the app sees a handful of ordinary files, but each one is filled from a different Kubernetes source, assembled by kubelet into a single mount.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'audience-bound', exp: 'short-lived' });
    },
  },
  {
    id: 'assemble',
    duration: 2800,
    narration: 'Four sources feed this one directory at once: a ConfigMap, a Secret, the downwardAPI and a serviceAccountToken. kubelet gathers them and lays each out as a file, so the app opens files and never has to call the API for any of it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'audience-bound', exp: 'short-lived' });
      s.refs.dir.classList.add('highlight');
      if (ctx.reduced) {
        ['rowCfg', 'rowPwd', 'rowLbl', 'rowTok'].forEach(k => s.refs[k].classList.add('highlight'));
        return;
      }
      // The fan-in: four sources land at once, each on its own lane, each lighting its file row.
      const c = routePacket(s, ctx, W_CM,   { cat: 'storage' }); lightBoxAt(s.refs.rowCfg, ctx, c.arrivalMs);
      const p = routePacket(s, ctx, W_SEC,  { cat: 'storage' }); lightBoxAt(s.refs.rowPwd, ctx, p.arrivalMs);
      const d = routePacket(s, ctx, W_DOWN, { cat: 'storage' }); lightBoxAt(s.refs.rowLbl, ctx, d.arrivalMs);
      const t = routePacket(s, ctx, W_TOK,  { cat: 'storage' }); lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
    },
  },
  {
    id: 'sources',
    duration: 2400,
    narration: 'The ConfigMap and the Secret contribute the plain material. A config key lands as config.yaml and a secret key lands as password, exactly as they would from a standalone volume, just sharing one directory here.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'ConfigMap + Secret', tok: 'audience-bound', exp: 'short-lived' });
      s.refs.srcCM.classList.add('highlight');
      s.refs.srcSec.classList.add('highlight');
      if (ctx.reduced) { s.refs.rowCfg.classList.add('highlight'); s.refs.rowPwd.classList.add('highlight'); return; }
      const c = routePacket(s, ctx, W_CM, { cat: 'storage' });
      ridingLabel(s, ctx, 'config.yaml', W_CM);
      lightBoxAt(s.refs.rowCfg, ctx, c.arrivalMs);
      const p = routePacket(s, ctx, W_SEC, { cat: 'storage' });
      ridingLabel(s, ctx, 'password', W_SEC);
      lightBoxAt(s.refs.rowPwd, ctx, p.arrivalMs);
    },
  },
  {
    id: 'downward',
    duration: 3400,
    narration: 'The downwardAPI projects facts about the Pod itself. Its labels, its name, its namespace, even a resource limit, are written out as files, computed by kubelet from the Pod object rather than fetched from anywhere.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'downwardAPI: Pod metadata', tok: 'audience-bound', exp: 'short-lived' });
      s.refs.srcDown.classList.add('highlight');
      if (ctx.reduced) { s.refs.rowLbl.classList.add('highlight'); return; }
      // The Pod is the source of its own metadata, so the Pod pulses first, then its metadata flows
      // down to downwardAPI and on into the labels file.
      pulsePod(s.refs.pod, ctx, 0);
      const meta = routePacket(s, ctx, W_POD_META, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'labels, name', W_POD_META, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.srcDown, ctx, meta.arrivalMs);
      const d = routePacket(s, ctx, W_DOWN, { delay: meta.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.rowLbl, ctx, d.arrivalMs);
    },
  },
  {
    id: 'token',
    duration: 2400,
    narration: 'The serviceAccountToken source writes a bearer token the Pod uses to call the API. It is short-lived and bound to a specific audience, so a token minted for one service cannot be replayed against another.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'bound to audience', exp: 'short-lived' });
      s.refs.srcTok.classList.add('highlight');
      if (ctx.reduced) { s.refs.rowTok.classList.add('highlight'); return; }
      const t = routePacket(s, ctx, W_TOK, { cat: 'storage' });
      ridingLabel(s, ctx, 'signed token', W_TOK);
      lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
    },
  },
  {
    id: 'rotate',
    duration: 2800,
    narration: 'Because the token is short-lived, kubelet refreshes it in place well before it expires, rewriting the same token file with a new one. The app just keeps reading the file and always finds a valid token, with no restart.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'rotated in place', exp: 'refreshed before expiry' });
      s.refs.srcTok.classList.add('highlight');
      s.refs.rowTok.classList.add('highlight');
      setWire(s, 'clock', 'kubelet rewrites token before it expires');
      if (ctx.reduced) return;
      const t = routePacket(s, ctx, W_TOK, { cat: 'storage' });
      ridingLabel(s, ctx, 'fresh token', W_TOK);
      lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
    },
  },
  {
    id: 'contrast',
    duration: 2600,
    narration: 'This is the whole reason to use the projected token over the old style. A legacy Secret-based service account token never expired and stayed valid forever if leaked, while a projected token rotates, expires, and is scoped to an audience.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'rotated, scoped', exp: 'legacy token never expired' });
      s.refs.rowTok.classList.add('highlight');
      if (ctx.reduced) return;
      // The app reads the current, rotated token straight out of the dir.
      const r = routePacket(s, ctx, W_READ, { cat: 'storage' });
      ridingLabel(s, ctx, 'valid token', W_READ);
      pulsePod(s.refs.pod, ctx, r.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
