import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// StatefulSet PVC Retention. persistentVolumeClaimRetentionPolicy has two independent knobs,
// whenScaled and whenDeleted, each Retain or Delete. The layout is the storage vertical stack
// repeated per ordinal: Pod on top, its PVC in the middle, its PV on the disk shelf below, joined by
// the identity column. The policy object sits top-right and issues Delete requests DOWN a bus on the
// far right (clear of the Pods) to the claims it is told to remove. Retain leaves the claim and its
// disk in place, which is safe but silently leaks storage. The narration overlay owns x<=380 &
// y<=300, so every block is x>=430.
const SS_X = 430, SS_Y = 40, SS_W = 300, SS_H = 64;

const POLICY_X = 760, POLICY_Y = 40, POLICY_W = 320, POLICY_H = 64;
const POLICY_CX = POLICY_X + POLICY_W / 2, POLICY_BOTTOM = POLICY_Y + POLICY_H; // 920 / 104

const C0 = 490, C1 = 720, C2 = 950;
const COLS = [C0, C1, C2];

const POD_W = 118, POD_H = 86, POD_Y = 168, POD_BOTTOM = POD_Y + POD_H; // 254
const PVC_W = 172, PVC_H = 60, PVC_Y = 312, PVC_BOTTOM = PVC_Y + PVC_H; // 372
const PV_W = 148, PV_H = 90, PV_Y = 450, PV_TOP = PV_Y;                 // 450

const DEL_BUS_Y = 284;   // the delete bus, below the Pods and above the PVCs
const DEL_DESCENT_X = 1050;
const CHIPS_Y = 588;

// The Delete route: policy drops down the far-right lane, runs along the bus, drops into the PVC top.
function wDel(c) { return [[DEL_DESCENT_X, POLICY_BOTTOM], [DEL_DESCENT_X, DEL_BUS_Y], [c, DEL_BUS_Y], [c, PVC_Y]]; }

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fades a claim or disk away exactly when the delete that removes it lands.
function vanishAt(el, ctx, delay = 0, to = 0.1) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: 500, delay, fill: 'forwards', easing: 'ease-in' }));
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

function podBlock({ c, label }) {
  const x = c - POD_W / 2;
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: ' ', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 16, y: POD_Y + 40, w: POD_W - 32, h: 36, label: 'app', cat: 'storage' });
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
      'aria-label': 'StatefulSet persistentVolumeClaimRetentionPolicy: two independent knobs, whenScaled for what happens to a claim when a replica is scaled away and whenDeleted for when the whole StatefulSet is removed, each set to Retain or Delete, where Retain leaves the disk in place and silently leaks storage and Delete reclaims it',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ss     = box({ x: SS_X, y: SS_Y, w: SS_W, h: SS_H, label: 'StatefulSet web', sublabel: 'replicas: 3', cat: 'storage' });
    const policy = box({ x: POLICY_X, y: POLICY_Y, w: POLICY_W, h: POLICY_H, label: 'retentionPolicy', sublabel: 'whenScaled and whenDeleted', cat: 'storage' });

    const pods = COLS.map((c, i) => podBlock({ c, label: `web-${i}` }));
    const pvcs = COLS.map((c, i) => box({ x: c - PVC_W / 2, y: PVC_Y, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'Bound', cat: 'storage' }));
    const pvs  = COLS.map((c, i) => cylinder({ x: c - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: `pv-web-${i}`, cat: 'storage' }));

    const refLinks = COLS.map(c => line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: c, y1: POD_BOTTOM, x2: c, y2: PVC_Y, 'stroke-dasharray': '5 5', fill: 'none' }));
    const boundLinks = COLS.map(c => line({ class: 'scheme-arrow scheme-arrow-storage', x1: c, y1: PVC_BOTTOM, x2: c, y2: PV_TOP, fill: 'none' }));

    const delWires = COLS.map(c => pathArrow({ points: wDel(c), dashed: true, dim: true, color: 'storage' }));

    const verdictLbls = COLS.map(c => text({ class: 'scheme-label code dim', x: c, y: PV_Y - 12, 'text-anchor': 'middle' }, [' ']));

    const replChip = valChip({ x: 110, y: CHIPS_Y, w: 190, h: 34, name: 'replicas', value: '3', cat: 'storage' });
    const wsChip   = valChip({ x: 320, y: CHIPS_Y, w: 270, h: 34, name: 'whenScaled', value: 'Retain', cat: 'storage' });
    const wdChip   = valChip({ x: 610, y: CHIPS_Y, w: 270, h: 34, name: 'whenDeleted', value: 'Retain', cat: 'storage' });
    const diskChip = valChip({ x: 900, y: CHIPS_Y, w: 190, h: 34, name: 'disks', value: '3 kept', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires and their labels above them, then the chip strip, then the packet
    // layer on top so every ball rides above everything.
    [ss, policy, ...pvs, ...pvcs, ...pods.map(p => p.group)].forEach(el => root.appendChild(el));
    [...refLinks, ...boundLinks, ...delWires, ...verdictLbls].forEach(el => root.appendChild(el));
    [replChip, wsChip, wdChip, diskChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ss, policy,
      p0: pods[0].group, p1: pods[1].group, p2: pods[2].group,
      v0: pvcs[0], v1: pvcs[1], v2: pvcs[2],
      d0: pvs[0], d1: pvs[1], d2: pvs[2],
      replChip, wsChip, wdChip, diskChip,
      wires: { g0: verdictLbls[0], g1: verdictLbls[1], g2: verdictLbls[2] },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { repl, ws, wd, disks }) {
  setVal(s.refs.replChip, repl);
  setVal(s.refs.wsChip, ws);
  setVal(s.refs.wdChip, wd);
  setVal(s.refs.diskChip, disks);
}

function clearHL(s) {
  clearHighlights(s, ['ss', 'policy', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2',
    'replChip', 'wsChip', 'wdChip', 'diskChip'], [s.refs.p0, s.refs.p1, s.refs.p2]);
}

function showAll(s) {
  [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '1'; });
  [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; setBoxSublabel(v, 'Bound'); });
  [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => { d.style.opacity = '1'; });
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A StatefulSet with three replicas owns three claims and three disks. What decides whether those disks survive when the workload shrinks or goes away is one field: persistentVolumeClaimRetentionPolicy. Left unset it defaults to Retain on both knobs.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', ws: 'Retain', wd: 'Retain', disks: '3 kept' });
      showAll(s);
    },
  },
  {
    id: 'policy',
    duration: 2400,
    narration: 'The policy has two independent knobs. whenScaled decides the fate of a claim when its replica is scaled away, and whenDeleted decides it when the entire StatefulSet is deleted. Each is set to Retain or Delete on its own, so the two cases can behave differently.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', ws: 'Retain', wd: 'Retain', disks: '3 kept' });
      showAll(s);
      s.refs.policy.classList.add('highlight');
      if (ctx.reduced) return;
      ctx.register(s.refs.policy.animate(
        [{ filter: 'brightness(1)' }, { filter: 'brightness(1.5)' }, { filter: 'brightness(1)' }],
        { duration: 600, delay: 200, easing: 'ease-out' }));
    },
  },
  {
    id: 'scaled-retain',
    duration: 3000,
    narration: 'Scale down to two with whenScaled set to Retain. Pod web-2 is removed, but claim data-web-2 stays and pv-web-2 keeps its data. This is the historical default and it is safe, yet every scale-down that is never cleaned up leaves a disk behind that still costs money.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', ws: 'Retain', wd: 'Retain', disks: '3 kept, 1 leaks' });
      showAll(s);
      setBoxSublabel(s.refs.v2, 'kept, no Pod');
      s.refs.v2.classList.add('highlight');
      s.refs.d2.classList.add('highlight');
      setWire(s, 'g2', 'retained');
      if (ctx.reduced) { s.refs.p2.style.opacity = '0.12'; return; }
      ctx.register(s.refs.p2.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: 650, delay: 250, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'scaled-delete',
    duration: 3200,
    narration: 'Flip whenScaled to Delete and scale down again. Now removing web-2 also removes claim data-web-2, and its disk is reclaimed by the storage backend. No orphan is left behind, which is what most people actually want, at the cost of that data being gone for good.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', ws: 'Delete', wd: 'Retain', disks: '2 kept' });
      s.refs.p0.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      s.refs.p2.style.opacity = '0.12';
      s.refs.v0.style.opacity = '1'; s.refs.v1.style.opacity = '1';
      s.refs.d0.style.opacity = '1'; s.refs.d1.style.opacity = '1';
      s.refs.policy.classList.add('highlight');
      setWire(s, 'g2', 'reclaimed');
      if (ctx.reduced) { s.refs.v2.style.opacity = '0.1'; s.refs.d2.style.opacity = '0.1'; return; }
      s.refs.v2.style.opacity = '1'; s.refs.d2.style.opacity = '1';
      const del = routePacket(s, ctx, wDel(C2), { cat: 'storage' });
      ridingLabel(s, ctx, 'delete data-web-2', wDel(C2));
      vanishAt(s.refs.v2, ctx, del.arrivalMs);
      vanishAt(s.refs.d2, ctx, del.arrivalMs + BEAT.afterHop + 300);
    },
  },
  {
    id: 'deleted-retain',
    duration: 3000,
    narration: 'Now consider deleting the whole StatefulSet with whenDeleted set to Retain. All three Pods vanish, but every claim and every disk is left standing. The data outlives the workload, which is exactly what you want before a risky upgrade or a rename.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '0', ws: 'Delete', wd: 'Retain', disks: '3 kept' });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; setBoxSublabel(v, 'kept, no owner'); v.classList.add('highlight'); });
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => { d.style.opacity = '1'; d.classList.add('highlight'); });
      COLS.forEach((c, i) => setWire(s, `g${i}`, 'retained'));
      s.refs.ss.classList.add('highlight');
      if (ctx.reduced) { [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.12'; }); return; }
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach((p, i) => {
        ctx.register(p.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: 600, delay: 200 + i * 130, fill: 'forwards', easing: 'ease-in' }));
      });
    },
  },
  {
    id: 'deleted-delete',
    duration: 3400,
    narration: 'With whenDeleted set to Delete, removing the StatefulSet garbage-collects all three claims and every disk goes with them. This is the clean teardown, and the reason Retain on both knobs is the conservative default: deleting data is irreversible, so Kubernetes will not do it unless you ask.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '0', ws: 'Delete', wd: 'Delete', disks: '0 kept' });
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.12'; });
      s.refs.policy.classList.add('highlight');
      COLS.forEach((c, i) => setWire(s, `g${i}`, 'reclaimed'));
      if (ctx.reduced) {
        [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '0.1'; });
        [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => { d.style.opacity = '0.1'; });
        return;
      }
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; });
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => { d.style.opacity = '1'; });
      const vrefs = [s.refs.v0, s.refs.v1, s.refs.v2];
      const drefs = [s.refs.d0, s.refs.d1, s.refs.d2];
      COLS.forEach((c, i) => {
        const del = routePacket(s, ctx, wDel(c), { delay: i * 160, cat: 'storage' });
        vanishAt(vrefs[i], ctx, del.arrivalMs);
        vanishAt(drefs[i], ctx, del.arrivalMs + BEAT.afterHop + 250);
      });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
