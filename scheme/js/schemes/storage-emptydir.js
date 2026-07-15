import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setCylinderLabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT,
} from '../lib/storage-kit.js';

// emptyDir Lifecycle. Storage grammar as a VERTICAL STACK, but the whole thing lives INSIDE one
// node boundary, because that is the point of an emptyDir: it is born on the node, lives on the node
// disk, and dies when the Pod leaves the node. The Pod (two containers) sits at the top of the node,
// the emptyDir disk sits on the shelf below it, and the IDENTITY COLUMN at x=760 (bare dashed, no
// arrowhead) marks that the directory is owned by this one Pod.
//
// The heart of the card is one rule: an emptyDir SURVIVES a container crash but NOT a Pod deletion.
// Two later steps cover the mediums, medium Memory (a tmpfs that counts against the memory limit and
// can OOM-kill the Pod) and sizeLimit (exceeding it evicts the Pod). Only the Pod containers pulse.
// The disk is infrastructure: it lights, it never pulses. The overlay owns x<=380 & y<=300.
const NODE_X = 420, NODE_Y = 45, NODE_W = 720, NODE_H = 490;

const POD_X = 480, POD_Y = 95, POD_W = 560, POD_H = 150;

const APP_X = 520, APP_Y = 140, APP_W = 230, APP_H = 90;
const APP_CX = APP_X + APP_W / 2, APP_BOTTOM = APP_Y + APP_H;    // 635 / 230

const SIDE_X = 770, SIDE_Y = 140, SIDE_W = 230, SIDE_H = 90;
const SIDE_CX = SIDE_X + SIDE_W / 2, SIDE_BOTTOM = SIDE_Y + SIDE_H; // 885 / 230

const ED_X = 650, ED_Y = 380, ED_W = 220, ED_H = 110;
const ED_TOP = ED_Y, ED_CX = ED_X + ED_W / 2;                   // 380 / 760

const SPINE_X = 760;
const CHIPS_Y = 588;

// Each static wire and its ball share one array. The write descends to the emptyDir, the mounts rise
// back into the containers on their own lanes.
const W_WRITE      = [[APP_CX, APP_BOTTOM], [APP_CX, 300], [720, 300], [720, ED_TOP]];
const W_MOUNT_APP  = [[700, ED_TOP], [700, 320], [APP_CX, 320], [APP_CX, APP_BOTTOM]];
const W_MOUNT_SIDE = [[820, ED_TOP], [820, 320], [SIDE_CX, 320], [SIDE_CX, SIDE_BOTTOM]];

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

function containerBlock({ x, y, w, h, label, sublabel }) {
  const b = box({ x, y, w, h, label, sublabel, cat: 'storage' });
  const wrap = g({});
  wrap.appendChild(b);
  return { wrap, box: b };
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
      'aria-label': 'emptyDir lifecycle: an emptyDir is created empty when the Pod is assigned to a node, lives on that node disk, and is shared by every container in the Pod. It survives a container crash but is deleted forever when the Pod is removed from the node. With medium Memory it is backed by tmpfs that counts against the memory limit, and a sizeLimit that is exceeded gets the Pod evicted.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nd = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-a' });

    const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod build-1', sublabel: 'volumes: scratch (emptyDir)', containers: 0, cat: 'storage' });
    const shellRect = shell.querySelector('.scheme-pod-rect');
    if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
    const app  = containerBlock({ x: APP_X, y: APP_Y, w: APP_W, h: APP_H, label: 'app', sublabel: 'writes /cache' });
    const side = containerBlock({ x: SIDE_X, y: SIDE_Y, w: SIDE_W, h: SIDE_H, label: 'worker', sublabel: 'reads /cache' });
    const podGroup = g({});
    [shell, app.wrap, side.wrap].forEach(el => podGroup.appendChild(el));

    const ed = cylinder({ x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', cat: 'storage' });
    ed.style.opacity = '0';

    const spine = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: SPINE_X, y1: POD_Y + POD_H, x2: SPINE_X, y2: ED_TOP, 'stroke-dasharray': '5 5', fill: 'none' });

    const wWrite     = pathArrow({ points: W_WRITE,      dashed: true, dim: true, color: 'storage' });
    const wMountApp  = pathArrow({ points: W_MOUNT_APP,  dashed: true, dim: true, color: 'storage' });
    const wMountSide = pathArrow({ points: W_MOUNT_SIDE, dashed: true, dim: true, color: 'storage' });

    const diskLbl = text({ class: 'scheme-label code dim', x: ED_CX, y: 520, 'text-anchor': 'middle' }, ['on the node disk']);

    const edChip     = valChip({ x: 90,  y: CHIPS_Y, w: 300, h: 34, name: 'emptyDir', value: 'not created', cat: 'storage' });
    const mediumChip = valChip({ x: 410, y: CHIPS_Y, w: 280, h: 34, name: 'medium',   value: 'node disk',   cat: 'storage' });
    const limitChip  = valChip({ x: 710, y: CHIPS_Y, w: 350, h: 34, name: 'sizeLimit', value: 'none',       cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node, then blocks, then spine and wires and the disk label above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    root.appendChild(nd);
    [podGroup, ed].forEach(el => root.appendChild(el));
    [spine, wWrite, wMountApp, wMountSide, diskLbl].forEach(el => root.appendChild(el));
    [edChip, mediumChip, limitChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podGroup, appC: app.wrap, appBox: app.box, sideC: side.wrap, sideBox: side.box,
      ed, spine,
      edChip, mediumChip, limitChip,
      wires: {},
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { ed, medium, limit }) {
  setVal(s.refs.edChip, ed);
  setVal(s.refs.mediumChip, medium);
  setVal(s.refs.limitChip, limit);
}

function clearHL(s) {
  clearHighlights(s, ['appBox', 'sideBox', 'ed', 'edChip', 'mediumChip', 'limitChip'],
    [s.refs.pod, s.refs.appC, s.refs.sideC]);
  s.refs.pod.style.opacity = '1';
  s.refs.appC.style.opacity = '1';
  s.refs.sideC.style.opacity = '1';
  setCylinderLabel(s.refs.ed, 'emptyDir');
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'An emptyDir is the simplest volume. It is created empty when the Pod is assigned to a node, it lives on that node disk, and every container in the Pod shares it. It exists only as long as the Pod stays on that node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'not created', medium: 'node disk', limit: 'none' });
      s.refs.ed.style.opacity = '0';
    },
  },
  {
    id: 'create',
    duration: 2400,
    narration: 'The moment the scheduler places the Pod on node-a, kubelet creates an empty directory for it on the node disk. There is nothing to provision and nothing to bind, the directory simply appears, owned by this one Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty on node disk', medium: 'node disk', limit: 'none' });
      s.refs.ed.classList.add('highlight');
      // The directory exists by the end of the step, so full opacity is the static end-state.
      s.refs.ed.style.opacity = '1';
      if (ctx.reduced) return;
      // The Pod was just assigned to the node, so the Pod pulses, and the empty directory materializes.
      s.refs.ed.style.opacity = '0';
      ctx.register(s.refs.ed.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
  {
    id: 'shared',
    duration: 3800,
    narration: 'Every container in the Pod mounts the same emptyDir, so it is a shared scratch space. The app writes a chunk under /cache and the worker reads it straight back. It is the classic way two containers in one Pod hand work to each other.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'shared scratch', medium: 'node disk', limit: 'none' });
      s.refs.ed.style.opacity = '1';
      s.refs.ed.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.appC, ctx, 0);
      const write = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write /cache', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, write.arrivalMs);
      const read = routePacket(s, ctx, W_MOUNT_SIDE, { delay: write.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'read /cache', W_MOUNT_SIDE, { delay: write.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.sideC, ctx, read.arrivalMs);
    },
  },
  {
    id: 'survives',
    duration: 3400,
    narration: 'The directory is tied to the Pod, not to a container. When the app container crashes and restarts, the emptyDir and everything in it is still there, because it lives on the node disk and the Pod never left the node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'intact after crash', medium: 'node disk', limit: 'none' });
      s.refs.ed.style.opacity = '1';
      s.refs.ed.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.appC.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.appC.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 400, delay: 700, fill: 'forwards', easing: 'ease-out' }));
      const reread = routePacket(s, ctx, W_MOUNT_APP, { delay: 1200, cat: 'storage' });
      ridingLabel(s, ctx, 'still here', W_MOUNT_APP, { delay: 1200 });
      pulsePod(s.refs.appC, ctx, reread.arrivalMs);
    },
  },
  {
    id: 'dies',
    duration: 2600,
    narration: 'When the Pod is removed from the node the emptyDir is deleted forever, with no way to get it back. A container crash it survives, a Pod deletion it does not. That single rule is the whole lifecycle of an emptyDir.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'deleted forever', medium: 'node disk', limit: 'none' });
      s.refs.pod.style.opacity = '0.25';
      s.refs.ed.style.opacity = '0.25';
      if (ctx.reduced) return;
      s.refs.pod.style.opacity = '1';
      s.refs.ed.style.opacity = '1';
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 700, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.ed.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 700, delay: 450, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'memory',
    duration: 3000,
    narration: 'Set medium to Memory and the same emptyDir is backed by a tmpfs instead of the node disk. Reads and writes are fast, but every byte counts against the container memory limit, and filling it can get the Pod OOM-killed the way a heap leak would.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'backed by RAM', medium: 'Memory, counts vs mem limit', limit: 'caps tmpfs size' });
      s.refs.ed.style.opacity = '1';
      setCylinderLabel(s.refs.ed, 'emptyDir tmpfs');
      s.refs.ed.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.appC, ctx, 0);
      const write = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'held in RAM', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, write.arrivalMs);
    },
  },
  {
    id: 'sizelimit',
    duration: 3600,
    narration: 'A sizeLimit caps how large the emptyDir may grow. Write past the limit and kubelet evicts the Pod off the node rather than let it fill the disk. Whether it is memory or disk, an unbounded emptyDir is a way to lose the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'over limit', medium: 'node disk', limit: '512Mi exceeded, evicted' });
      s.refs.ed.style.opacity = '1';
      s.refs.ed.classList.add('highlight');
      // The Pod is evicted by the end of the step, so terminal opacity is the static end-state.
      s.refs.pod.style.opacity = '0.25';
      if (ctx.reduced) return;
      s.refs.pod.style.opacity = '1';
      pulsePod(s.refs.appC, ctx, 0);
      const write = routePacket(s, ctx, W_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'over 512Mi', W_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, write.arrivalMs);
      // Once the write pushes past the cap, kubelet evicts the Pod: it fades to terminal.
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 600, delay: write.arrivalMs + 200, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
