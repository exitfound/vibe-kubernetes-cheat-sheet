import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-projected-volume


const POD_X = 330, POD_Y = 56, POD_W = 640, POD_H = 120;  // 330..970, over the projected directory
const POD_BOTTOM = POD_Y + POD_H;                         // 176
const POD_CX = POD_X + POD_W / 2;                         // 650

// The source objects are not part of the Pod, so the column sits out to its left rather than under
// it. That is also what puts the low content on the canvas centre: 230..970 straddles 600.
const SRC_X = 230, SRC_W = 220, SRC_RIGHT = SRC_X + SRC_W; // 230..450, left source column
const SRC_CX = SRC_X + SRC_W / 2;                          // 340, the metadata drop lane
const SRC_H = 54;
const DOWN_Y = 264, CM_Y = 336, SEC_Y = 408, TOK_Y = 480;  // downwardAPI first: the drop crosses nothing
const midOf = y => y + SRC_H / 2;                          // 291 / 363 / 435 / 507

const DIR_X = 630, DIR_Y = 225, DIR_W = 340, DIR_H = 333;  // 630..970, 225..558
const DIR_CX = DIR_X + DIR_W / 2;                          // 800, the read lane
const ROW_X = 660, ROW_W = 280, ROW_H = 44;
const R_LBL_Y = 269, R_CFG_Y = 341, R_PWD_Y = 413, R_TOK_Y = 485; // row mids == source mids

const CHIPS_Y = 594;
const CHIP_W = 320, CHIP_GAP = 20, CHIP_COUNT = 3;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 1000
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => 600 - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

const W_DOWN = [[SRC_RIGHT, midOf(DOWN_Y)], [ROW_X, midOf(DOWN_Y)]];
const W_CM   = [[SRC_RIGHT, midOf(CM_Y)],   [ROW_X, midOf(CM_Y)]];
const W_SEC  = [[SRC_RIGHT, midOf(SEC_Y)],  [ROW_X, midOf(SEC_Y)]];
const W_TOK  = [[SRC_RIGHT, midOf(TOK_Y)],  [ROW_X, midOf(TOK_Y)]];
// Both Pod lanes leave its bottom edge as a mirrored pair either side of the Pod centre and then
// step out to the column they address, rather than landing out at the Pod corners.
const POD_LANE = 100;
const META_ELBOW_Y = 232, READ_ELBOW_Y = 200;   // the metadata elbow clears the panel floor (181)
const W_POD_META = [[POD_CX - POD_LANE, POD_BOTTOM], [POD_CX - POD_LANE, META_ELBOW_Y], [SRC_CX, META_ELBOW_Y], [SRC_CX, DOWN_Y]];
const W_READ = [[DIR_CX, DIR_Y], [DIR_CX, READ_ELBOW_Y], [POD_CX + POD_LANE, READ_ELBOW_Y], [POD_CX + POD_LANE, POD_BOTTOM]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + (w - 260) / 2, y: y + 34, w: 260, h: 56, label: 'app', sublabel: 'reads /var/run/secrets', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function fileRow(y, label) {
  return box({ x: ROW_X, y, w: ROW_W, h: ROW_H, label, sublabel: '', role: 'storage' });
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
      'aria-label': 'Projected volumes: one directory is assembled from several sources at once, a ConfigMap, a Secret, the downwardAPI carrying Pod metadata, and a serviceAccountToken. The token source is short-lived and audience-bound, and Kubelet rotates it in place before it expires, unlike the old forever-valid Secret-based token.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'projected volume' });

    // Column order top to bottom: downwardAPI first (the metadata drop from the Pod bottom lands on
    // its top edge without crossing anything), then the plain sources, the token source last.
    const srcDown = box({ x: SRC_X, y: DOWN_Y, w: SRC_W, h: SRC_H, label: 'downwardAPI', sublabel: 'Pod labels, name', role: 'storage' });
    const srcCM   = box({ x: SRC_X, y: CM_Y,   w: SRC_W, h: SRC_H, label: 'ConfigMap', sublabel: 'key: config.yaml', role: 'storage' });
    const srcSec  = box({ x: SRC_X, y: SEC_Y,  w: SRC_W, h: SRC_H, label: 'Secret', sublabel: 'key: password', role: 'storage' });
    const srcTok  = box({ x: SRC_X, y: TOK_Y,  w: SRC_W, h: SRC_H, label: 'serviceAccountToken', sublabel: 'audience-bound', role: 'storage' });

    const dirBox = box({ x: DIR_X, y: DIR_Y, w: DIR_W, h: DIR_H, label: '', sublabel: '', role: 'storage' });
    dirBox.querySelector('.scheme-box-rect').style.fill = 'rgba(255, 255, 255, 0.02)';
    const dirLbl = text({ class: 'scheme-label code', x: DIR_CX, y: DIR_Y + 27, 'text-anchor': 'middle' }, ['/var/run/secrets (projected)']);

    const rowLbl = fileRow(R_LBL_Y, 'labels');
    const rowCfg = fileRow(R_CFG_Y, 'config.yaml');
    const rowPwd = fileRow(R_PWD_Y, 'password');
    const rowTok = fileRow(R_TOK_Y, 'token');

    const wCm   = pathArrow({ points: W_CM,   dashed: true, dim: true, role: 'storage' });
    const wSec  = pathArrow({ points: W_SEC,  dashed: true, dim: true, role: 'storage' });
    const wDown = pathArrow({ points: W_DOWN, dashed: true, dim: true, role: 'storage' });
    const wTok  = pathArrow({ points: W_TOK,  dashed: true, dim: true, role: 'storage' });
    const wPodMeta = pathArrow({ points: W_POD_META, dashed: true, dim: true, role: 'storage' });
    const wRead = pathArrow({ points: W_READ, dashed: true, dim: true, role: 'storage' });

    const clockLbl = text({ class: 'scheme-label code dim', x: DIR_CX, y: 580, 'text-anchor': 'middle' }, [' ']);

    // Uniform chip strip: three chips of one size on one 20 unit pitch, centred on the canvas, so the
    // 1000 unit strip runs 100..1100.
    const srcChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'sources', value: '4 into one dir', role: 'storage' });
    const tokChip  = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'SA token', value: 'audience-bound', role: 'storage' });
    const expChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'expiry', value: 'short-lived', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): dir container, then blocks and file rows, then wires and labels above
    // them, then the chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(dirBox);
    [podB.group, srcDown, srcCM, srcSec, srcTok, rowLbl, rowCfg, rowPwd, rowTok].forEach(el => root.appendChild(el));
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
    narration: 'Four sources feed this one directory at once: a ConfigMap, a Secret, the downwardAPI and a serviceAccountToken. Kubelet gathers them and lays each out as a file, so the app opens files and never has to call the API for any of it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: '4 into one dir', tok: 'audience-bound', exp: 'short-lived' });
      // The four sources are the actors of this step: they light at entry, their balls depart.
      ['srcDown', 'srcCM', 'srcSec', 'srcTok'].forEach(k => s.refs[k].classList.add('highlight'));
      if (ctx.reduced) {
        s.refs.dir.classList.add('highlight');
        ['rowCfg', 'rowPwd', 'rowLbl', 'rowTok'].forEach(k => s.refs[k].classList.add('highlight'));
        return;
      }
      // The fan-in: four sources land at once, each on its own lane, each lighting its file row.
      // The dir lights WITH them, not at entry. It is a container rather than a destination (a box()
      // playing the part node() plays elsewhere, which is why check-arrival R3 judges it at all), but
      // pre-lighting it still announced the delivery a full second before any of it landed.
      const c = routePacket(s, ctx, W_CM,   { role: 'storage' }); lightBoxAt(s.refs.rowCfg, ctx, c.arrivalMs);
      lightBoxAt(s.refs.dir, ctx, c.arrivalMs);
      const p = routePacket(s, ctx, W_SEC,  { role: 'storage' }); lightBoxAt(s.refs.rowPwd, ctx, p.arrivalMs);
      const d = routePacket(s, ctx, W_DOWN, { role: 'storage' }); lightBoxAt(s.refs.rowLbl, ctx, d.arrivalMs);
      const t = routePacket(s, ctx, W_TOK,  { role: 'storage' }); lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
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
      s.refs.srcChip.classList.add('highlight');
      s.refs.srcCM.classList.add('highlight');
      s.refs.srcSec.classList.add('highlight');
      if (ctx.reduced) { s.refs.rowCfg.classList.add('highlight'); s.refs.rowPwd.classList.add('highlight'); return; }
      const c = routePacket(s, ctx, W_CM, { role: 'storage' });
      ridingLabel(s, ctx, 'config.yaml', W_CM);
      lightBoxAt(s.refs.rowCfg, ctx, c.arrivalMs);
      const p = routePacket(s, ctx, W_SEC, { role: 'storage' });
      ridingLabel(s, ctx, 'password', W_SEC);
      lightBoxAt(s.refs.rowPwd, ctx, p.arrivalMs);
    },
  },
  {
    id: 'downward',
    duration: 3400,
    narration: 'The downwardAPI projects facts about the Pod itself. Its labels, its name, its namespace, even a resource limit, are written out as files, computed by Kubelet from the Pod object rather than fetched from anywhere.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'downwardAPI: Pod metadata', tok: 'audience-bound', exp: 'short-lived' });
      s.refs.srcChip.classList.add('highlight');
      if (ctx.reduced) { s.refs.srcDown.classList.add('highlight'); s.refs.rowLbl.classList.add('highlight'); return; }
      // The Pod is the source of its own metadata, so the Pod pulses first, then its metadata flows
      // down to downwardAPI and on into the labels file. downwardAPI is mid-chain here, unlike on
      // the assemble step where it sends, so it lights on the metadata landing.
      pulsePod(s.refs.pod, ctx, 0);
      const meta = routePacket(s, ctx, W_POD_META, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'labels, name', W_POD_META, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.srcDown, ctx, meta.arrivalMs);
      const d = routePacket(s, ctx, W_DOWN, { delay: meta.arrivalMs + BEAT.afterHop, role: 'storage' });
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
      // The chip tracks WHICH source is in play, the way the two steps before it do. It used to snap
      // back to the standing value here and stay there, so it changed with no cue on the one step
      // that introduces the token source, and then never moved again.
      setChips(s, { src: 'serviceAccountToken', tok: 'bound to audience', exp: 'short-lived' });
      s.refs.srcChip.classList.add('highlight');
      s.refs.tokChip.classList.add('highlight');
      s.refs.srcTok.classList.add('highlight');
      if (ctx.reduced) { s.refs.rowTok.classList.add('highlight'); return; }
      const t = routePacket(s, ctx, W_TOK, { role: 'storage' });
      ridingLabel(s, ctx, 'signed token', W_TOK);
      lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
    },
  },
  {
    id: 'rotate',
    duration: 2800,
    narration: 'Because the token is short-lived, Kubelet refreshes it in place well before it expires, rewriting the same token file with a new one. The app just keeps reading the file and always finds a valid token, with no restart.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { src: 'serviceAccountToken', tok: 'rotated in place', exp: 'refreshed before expiry' });
      s.refs.expChip.classList.add('highlight');
      s.refs.tokChip.classList.add('highlight');
      s.refs.srcTok.classList.add('highlight');
      setWire(s, 'clock', 'kubelet rewrites token before it expires');
      if (ctx.reduced) { s.refs.rowTok.classList.add('highlight'); return; }
      const t = routePacket(s, ctx, W_TOK, { role: 'storage' });
      lightBoxAt(s.refs.rowTok, ctx, t.arrivalMs);
      ridingLabel(s, ctx, 'fresh token', W_TOK);
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
      setChips(s, { src: 'serviceAccountToken', tok: 'rotated, scoped', exp: 'legacy token never expired' });
      s.refs.expChip.classList.add('highlight');
      s.refs.tokChip.classList.add('highlight');
      s.refs.rowTok.classList.add('highlight');
      if (ctx.reduced) return;
      // The app reads the current, rotated token straight out of the dir.
      const r = routePacket(s, ctx, W_READ, { role: 'storage' });
      ridingLabel(s, ctx, 'valid token', W_READ);
      pulsePod(s.refs.pod, ctx, r.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
