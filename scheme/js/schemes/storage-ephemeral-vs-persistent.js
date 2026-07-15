import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT,
} from '../lib/storage-kit.js';

// Ephemeral vs Persistent, the side-by-side card. Two parallel columns share one Pod on top, so the
// divergence is visible in a single frame. LEFT column is ephemeral: an emptyDir that belongs to the
// node. RIGHT column is persistent: a PVC bound to a PV whose disk is a separate object. A vertical
// divider at x=780 splits them.
//
// The Pod writes to both, is deleted, and is rescheduled onto another node. The emptyDir comes back
// empty (it was tied to the old node) while the PVC reattaches the very same disk with the data
// intact. Only the Pod pulses. Disks and the claim box are infrastructure: they light, never pulse.
// The identity column on the right (bare dashed, no arrowhead) is the Bound link PVC to PV. The
// narration overlay owns x<=380 & y<=300, so every block starts to the right of it.
const POD_X = 430, POD_Y = 50, POD_W = 700, POD_H = 140;
const POD_BOTTOM = POD_Y + POD_H;                     // 190

const ED_X = 460, ED_Y = 400, ED_W = 210, ED_H = 110;
const ED_TOP = ED_Y, ED_CX = ED_X + ED_W / 2;         // 400 / 565

const PVC_X = 895, PVC_Y = 280, PVC_W = 210, PVC_H = 64;
const PVC_TOP = PVC_Y, PVC_BOTTOM = PVC_Y + PVC_H, PVC_CX = PVC_X + PVC_W / 2; // 280 / 344 / 1000

const PV_X = 895, PV_Y = 430, PV_W = 210, PV_H = 105;
const PV_TOP = PV_Y, PV_CX = PV_X + PV_W / 2;          // 430 / 1000

const DIV_X = 780;
const CHIPS_Y = 588;

// Each static wire and its ball share one array. Writes descend, mounts rise, on their own lanes.
const W_WRITE_L = [[585, POD_BOTTOM], [585, 270], [540, 270], [540, ED_TOP]];
const W_MOUNT_L = [[590, ED_TOP], [590, 250], [615, 250], [615, POD_BOTTOM]];
const W_WRITE_R = [[945, POD_BOTTOM], [945, 262], [990, 262], [990, PVC_TOP]];
const W_MOUNT_R = [[1010, PVC_TOP], [1010, 250], [955, 250], [955, POD_BOTTOM]];

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
  const innerBox = box({ x: x + 24, y: y + 46, w: w - 48, h: 60, label: 'app', sublabel: 'mounts /scratch and /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
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
      'aria-label': 'Ephemeral versus persistent storage: one Pod mounts both an emptyDir and a PersistentVolumeClaim and writes to each. When the Pod is deleted and rescheduled onto another node, the emptyDir comes back empty because it was tied to the old node, while the claim reattaches the very same disk with the data intact.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'volumes: scratch, data' });

    const ed  = cylinder({ x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', cat: 'storage' });
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data', sublabel: 'Bound', cat: 'storage' });
    const pv  = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-x73a', cat: 'storage' });

    const divider = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DIV_X, y1: 210, x2: DIV_X, y2: 560, 'stroke-dasharray': '4 6', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: PV_CX, y1: PVC_BOTTOM, x2: PV_CX, y2: PV_TOP, fill: 'none' });

    const headL = text({ class: 'scheme-label code dim', x: ED_CX, y: 236, 'text-anchor': 'middle' }, ['ephemeral: node-local']);
    const headR = text({ class: 'scheme-label code dim', x: PVC_CX, y: 236, 'text-anchor': 'middle' }, ['persistent: PVC to PV']);

    const wWriteL = pathArrow({ points: W_WRITE_L, dashed: true, dim: true, color: 'storage' });
    const wMountL = pathArrow({ points: W_MOUNT_L, dashed: true, dim: true, color: 'storage' });
    const wWriteR = pathArrow({ points: W_WRITE_R, dashed: true, dim: true, color: 'storage' });
    const wMountR = pathArrow({ points: W_MOUNT_R, dashed: true, dim: true, color: 'storage' });

    const edChip  = valChip({ x: 100, y: CHIPS_Y, w: 300, h: 34, name: 'emptyDir', value: 'empty', cat: 'storage' });
    const pvcChip = valChip({ x: 420, y: CHIPS_Y, w: 360, h: 34, name: 'PVC',      value: 'Bound', cat: 'storage' });
    const podChip = valChip({ x: 800, y: CHIPS_Y, w: 290, h: 34, name: 'Pod',      value: 'on node-a', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then divider and bound link and wires and headers above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    [podB.group, ed, pvc, pv].forEach(el => root.appendChild(el));
    [divider, boundLink, wWriteL, wMountL, wWriteR, wMountR, headL, headR].forEach(el => root.appendChild(el));
    [edChip, pvcChip, podChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, pod: podB.group, podBox: podB.innerBox,
      ed, pvc, pv,
      edChip, pvcChip, podChip,
      wires: {},
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { ed, pvc, pod }) {
  setVal(s.refs.edChip, ed);
  setVal(s.refs.pvcChip, pvc);
  setVal(s.refs.podChip, pod);
}

function clearHL(s) {
  clearHighlights(s, ['ed', 'pvc', 'pv', 'podBox', 'edChip', 'pvcChip', 'podChip'], [s.refs.pod]);
  s.refs.pod.style.opacity = '1';
  s.refs.ed.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'This Pod mounts two volumes at once. A scratch space at /scratch backed by an emptyDir, and a data directory at /data backed by a PersistentVolumeClaim. One is ephemeral, one is persistent, and the difference only shows when the Pod moves.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty', pvc: 'Bound', pod: 'on node-a' });
    },
  },
  {
    id: 'write',
    duration: 2800,
    narration: 'The app writes to both. A log line goes into the emptyDir on the node, and a database row goes through the claim onto the PersistentVolume. Right now both look the same, each holds the byte it was given.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'log written', pvc: 'row written', pod: 'on node-a' });
      if (ctx.reduced) { s.refs.ed.classList.add('highlight'); s.refs.pvc.classList.add('highlight'); s.refs.pv.classList.add('highlight'); return; }
      // Pod to both disks: an up-arrow, so the Pod pulses first and both writes descend at afterPulse.
      pulsePod(s.refs.pod, ctx, 0);
      const wl = routePacket(s, ctx, W_WRITE_L, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'log line', W_WRITE_L, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, wl.arrivalMs);
      const wr = routePacket(s, ctx, W_WRITE_R, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'db row', W_WRITE_R, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.pvc, ctx, wr.arrivalMs);
      lightBoxAt(s.refs.pv, ctx, wr.arrivalMs);
    },
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'The Pod is deleted off node-a. Its emptyDir was part of the node, so it is wiped with the Pod. The PersistentVolume is a separate object with its own disk, so it simply detaches and keeps every byte.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'wiped', pvc: 'detached, kept', pod: 'deleted' });
      // The PV keeps its data, so it stays lit. The Pod and its emptyDir are gone by the end.
      s.refs.pv.classList.add('highlight');
      s.refs.pod.style.opacity = '0.25';
      s.refs.ed.style.opacity = '0.3';
      if (ctx.reduced) return;
      s.refs.pod.style.opacity = '1';
      s.refs.ed.style.opacity = '1';
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 650, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.ed.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 650, delay: 250, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'reschedule',
    duration: 2400,
    narration: 'The controller recreates the Pod, and the scheduler places it on node-b. This is where the two volumes stop looking alike, because one is tied to a node it is no longer on and the other is tied to nothing but the claim.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty again', pvc: 'reattaching', pod: 'on node-b' });
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) return;
      // The Pod comes up fresh on node-b.
      s.refs.pod.style.opacity = '0.3';
      ctx.register(s.refs.pod.animate([{ opacity: 0.3 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.pod, ctx, 550);
    },
  },
  {
    id: 'diverge',
    duration: 2800,
    narration: 'The emptyDir comes back empty. It is a brand new directory on node-b and knows nothing about node-a. The claim reattaches the very same PersistentVolume, so /data still has the database row. Same Pod spec, two completely different outcomes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty', pvc: 'reattached, intact', pod: 'on node-b' });
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      // Both remount (disk to Pod, a down-arrow): the ball leaves first and the Pod pulses on
      // arrival. The left mount carries nothing, the right mount carries the surviving row.
      const ml = routePacket(s, ctx, W_MOUNT_L, { cat: 'storage' });
      ridingLabel(s, ctx, 'empty', W_MOUNT_L);
      const mr = routePacket(s, ctx, W_MOUNT_R, { cat: 'storage' });
      ridingLabel(s, ctx, 'db row intact', W_MOUNT_R);
      lightBoxAt(s.refs.pvc, ctx, mr.arrivalMs);
      pulsePod(s.refs.pod, ctx, Math.max(ml.arrivalMs, mr.arrivalMs));
    },
  },
  {
    id: 'verdict',
    duration: 2200,
    narration: 'That is the whole distinction. Ephemeral storage is scratch that resets whenever the Pod is rescheduled, persistent storage follows the claim across nodes and restarts. Put throwaway data in an emptyDir and anything you must not lose behind a PVC.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'resets on move', pvc: 'follows the claim', pod: 'on node-b' });
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
