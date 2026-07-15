import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, retained and
// rebound. The storage grammar is a vertical stack, here repeated three times side by side, one
// column per ordinal. In each column a Pod sits on top, its PVC in the middle, its backing PV on the
// disk shelf at the bottom. The vertical line joining the three is the IDENTITY COLUMN: it is what
// makes Pod, claim and disk one object with one name. Above the PVC it is a bare dashed reference
// (pod.spec names the claim), below it the Bound link, both arrowhead-free because they carry no
// traffic. The StatefulSet and its template sit across the top and MINT one PVC per ordinal down a
// bus, the only routes that carry a ball. The deterministic name data-web-N is what lets a deleted
// Pod rebind the very same disk. The narration overlay owns x<=380 & y<=300, so every block is x>=430.
const SS_X = 430, SS_Y = 36, SS_W = 300, SS_H = 68;
const SS_CX = SS_X + SS_W / 2;                    // 580

const TPL_X = 762, TPL_Y = 36, TPL_W = 320, TPL_H = 68;
const TPL_CX = TPL_X + TPL_W / 2, TPL_BOTTOM = TPL_Y + TPL_H; // 922 / 104

const C0 = 490, C1 = 720, C2 = 950;              // ordinal column centres
const COLS = [C0, C1, C2];

const POD_W = 120, POD_H = 88, POD_Y = 182, POD_BOTTOM = POD_Y + POD_H; // 270
const PVC_W = 176, PVC_H = 62, PVC_Y = 316, PVC_BOTTOM = PVC_Y + PVC_H; // 378
const PV_W = 150, PV_H = 92, PV_Y = 452, PV_TOP = PV_Y;                 // 452

const BUS_Y = 250;      // the mint bus: template drops down to it, then along to each column
const MINT_EX = 60;     // enter each PVC to the right of the Pod above it, clearing the Pod
const CHIPS_Y = 588;

// Each static wire and its ball share one array, so they cannot drift. Every endpoint is a block edge.
function wMint(c) { return [[TPL_CX, TPL_BOTTOM], [TPL_CX, BUS_Y], [c + MINT_EX, BUS_Y], [c + MINT_EX, PVC_Y]]; }
function wMount(c) { return [[c, PV_TOP], [c, PVC_BOTTOM]]; }   // ascent PV -> PVC, up the identity column

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 450, delay, fill: 'forwards', easing: 'ease-out' }));
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
  const innerBox = box({ x: x + 16, y: POD_Y + 40, w: POD_W - 32, h: 38, label: 'app', cat: 'storage' });
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
      'aria-label': 'StatefulSet volumeClaimTemplates: unlike a Deployment which hands every replica the one shared claim, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated rebinds the very same disk, the claims are retained when a Pod is removed, and scaling down leaves them behind',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ss  = box({ x: SS_X, y: SS_Y, w: SS_W, h: SS_H, label: 'StatefulSet web', sublabel: 'replicas: 3', cat: 'storage' });
    const tpl = box({ x: TPL_X, y: TPL_Y, w: TPL_W, h: TPL_H, label: 'volumeClaimTemplate: data', sublabel: '1Gi, RWO, gp3', cat: 'storage' });

    const pods = COLS.map((c, i) => podBlock({ c, label: `web-${i}` }));
    const pvcs = COLS.map((c, i) => {
      const b = box({ x: c - PVC_W / 2, y: PVC_Y, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'Pending', cat: 'storage' });
      b.style.opacity = '0';    // does not exist until the template mints it
      return b;
    });
    const pvs = COLS.map((c, i) => cylinder({ x: c - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: `pv-web-${i}`, cat: 'storage' }));

    // Identity columns. Reference line pod -> pvc (dashed, no arrowhead) and Bound link pvc -> pv,
    // hidden until each pair binds. Neither carries traffic, so neither carries a marker.
    const refLinks = COLS.map(c => line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: c, y1: POD_BOTTOM, x2: c, y2: PVC_Y, 'stroke-dasharray': '5 5', fill: 'none' }));
    const boundLinks = COLS.map(c => {
      const l = line({ class: 'scheme-arrow scheme-arrow-storage', x1: c, y1: PVC_BOTTOM, x2: c, y2: PV_TOP, fill: 'none' });
      l.style.opacity = '0';
      return l;
    });

    const mintWires = COLS.map(c => pathArrow({ points: wMint(c), dashed: true, dim: true, color: 'storage' }));
    const mountWires = COLS.map(c => pathArrow({ points: wMount(c), dashed: true, dim: true, color: 'storage' }));

    const nameLbls = COLS.map(c => text({ class: 'scheme-label code dim', x: c, y: 300, 'text-anchor': 'middle' }, [' ']));

    const replChip = valChip({ x: 120, y: CHIPS_Y, w: 210, h: 34, name: 'replicas', value: '3', cat: 'storage' });
    const pvcChip  = valChip({ x: 350, y: CHIPS_Y, w: 250, h: 34, name: 'PVCs', value: 'none yet', cat: 'storage' });
    const nameChip = valChip({ x: 620, y: CHIPS_Y, w: 250, h: 34, name: 'naming', value: 'data-web-N', cat: 'storage' });
    const retChip  = valChip({ x: 890, y: CHIPS_Y, w: 200, h: 34, name: 'on delete', value: 'retained', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires + labels above them, then chips, then the packet layer on top.
    [ss, tpl, ...pvs, ...pvcs, ...pods.map(p => p.group)].forEach(el => root.appendChild(el));
    [...refLinks, ...boundLinks, ...mintWires, ...mountWires, ...nameLbls].forEach(el => root.appendChild(el));
    [replChip, pvcChip, nameChip, retChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ss, tpl,
      p0: pods[0].group, p1: pods[1].group, p2: pods[2].group,
      b0: pods[0].innerBox, b1: pods[1].innerBox, b2: pods[2].innerBox,
      v0: pvcs[0], v1: pvcs[1], v2: pvcs[2],
      d0: pvs[0], d1: pvs[1], d2: pvs[2],
      bl0: boundLinks[0], bl1: boundLinks[1], bl2: boundLinks[2],
      replChip, pvcChip, nameChip, retChip,
      wires: { n0: nameLbls[0], n1: nameLbls[1], n2: nameLbls[2] },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { repl, pvcs, naming, ret }) {
  setVal(s.refs.replChip, repl);
  setVal(s.refs.pvcChip, pvcs);
  setVal(s.refs.nameChip, naming);
  setVal(s.refs.retChip, ret);
}

function clearHL(s) {
  clearHighlights(s, ['ss', 'tpl', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2', 'b0', 'b1', 'b2',
    'replChip', 'pvcChip', 'nameChip', 'retChip'], [s.refs.p0, s.refs.p1, s.refs.p2]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A StatefulSet named web wants three replicas, and it carries a volumeClaimTemplate called data. A Deployment would hand every one of its replicas the single same claim, so all three would fight over one disk. A StatefulSet does the opposite, and the template is how.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: 'none yet', naming: 'data-web-N', ret: 'retained' });
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.5'; });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '0'; });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '0'; });
    },
  },
  {
    id: 'mint',
    duration: 3200,
    narration: 'For each ordinal the template stamps out one claim, and the name is not random. It is the template name joined to the Pod name: data-web-0, data-web-1, data-web-2. Three separate PVC objects now exist, each asking for its own 1Gi of gp3.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 minted', naming: 'data-web-N', ret: 'retained' });
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.5'; });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '0'; });
      s.refs.tpl.classList.add('highlight');
      setWire(s, 'n0', 'data-web-0');
      setWire(s, 'n1', 'data-web-1');
      setWire(s, 'n2', 'data-web-2');
      if (ctx.reduced) {
        [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight'));
        return;
      }
      const vrefs = [s.refs.v0, s.refs.v1, s.refs.v2];
      COLS.forEach((c, i) => {
        vrefs[i].style.opacity = '0';
        const mint = routePacket(s, ctx, wMint(c), { cat: 'storage' });
        ridingLabel(s, ctx, `data-web-${i}`, wMint(c));
        revealAt(vrefs[i], ctx, mint.arrivalMs);
        lightBoxAt(vrefs[i], ctx, mint.arrivalMs);
      });
    },
  },
  {
    id: 'bind',
    duration: 2600,
    narration: 'Each claim is bound to its own PersistentVolume, so ordinal 0 gets pv-web-0 and never touches ordinal 1. The claim is the durable name the workload holds, and the disk behind it is what stores the bytes. Nothing is shared between the ordinals.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 bound', naming: 'data-web-N', ret: 'retained' });
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.5'; });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; v.classList.add('highlight'); });
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      COLS.forEach((c, i) => { setBoxSublabel(s.refs[`v${i}`], 'Bound'); });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '1'; });
      if (ctx.reduced) return;
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '0'; });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach((b, i) => {
        ctx.register(b.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 460, delay: 150 + i * 120, fill: 'forwards', easing: 'ease-out' }));
      });
    },
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Now each Pod starts and mounts the volume behind its own claim. web-0 reads and writes data-web-0 alone, web-1 reads data-web-1, and so on. The bind is exclusive, so no two Pods ever land on the same disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 in use', naming: 'data-web-N', ret: 'retained' });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; });
      COLS.forEach((c, i) => { setBoxSublabel(s.refs[`v${i}`], 'Bound'); });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '1'; });
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight'));
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '1'; });
      if (ctx.reduced) { [s.refs.b0, s.refs.b1, s.refs.b2].forEach(b => b.classList.add('highlight')); return; }
      [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => { p.style.opacity = '0.5'; });
      const prefs = [s.refs.p0, s.refs.p1, s.refs.p2];
      const brefs = [s.refs.b0, s.refs.b1, s.refs.b2];
      COLS.forEach((c, i) => {
        const hop = routePacket(s, ctx, wMount(c), { cat: 'storage' });
        ctx.register(prefs[i].animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 460, delay: hop.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
        pulsePod(prefs[i], ctx, hop.arrivalMs);
        lightBoxAt(brefs[i], ctx, hop.arrivalMs);
      });
    },
  },
  {
    id: 'rebind',
    duration: 3200,
    narration: 'Delete web-1 and the StatefulSet recreates it, perhaps on another node. The claim data-web-1 is not deleted with the Pod, it stays Bound to pv-web-1. Because the new Pod derives the exact same claim name from its ordinal, it rebinds the very same disk and sees the very same data.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 in use', naming: 'data-web-1 kept', ret: 'retained' });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; });
      COLS.forEach((c, i) => { setBoxSublabel(s.refs[`v${i}`], 'Bound'); });
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '1'; });
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      s.refs.v1.classList.add('highlight');
      s.refs.p0.style.opacity = '1';
      s.refs.p2.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      if (ctx.reduced) { s.refs.b1.classList.add('highlight'); return; }
      // web-1 is deleted (fade out), then recreated (fade in), and rebinds the same claim and disk.
      s.refs.p1.style.opacity = '1';
      ctx.register(s.refs.p1.animate([{ opacity: 1 }, { opacity: 0.15 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.p1.animate([{ opacity: 0.15 }, { opacity: 0.5 }], { duration: 400, delay: 700, fill: 'forwards', easing: 'ease-out' }));
      const hop = routePacket(s, ctx, wMount(C1), { delay: 1200, cat: 'storage' });
      ridingLabel(s, ctx, 'data-web-1 rebound', wMount(C1), { delay: 1200 });
      ctx.register(s.refs.p1.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 420, delay: hop.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.p1, ctx, hop.arrivalMs);
      lightBoxAt(s.refs.b1, ctx, hop.arrivalMs);
    },
  },
  {
    id: 'scale',
    duration: 3000,
    narration: 'Scale web down to two and Pod web-2 is removed, but claim data-web-2 is left behind on purpose. The default retention keeps it, so its disk is not reclaimed and its data is safe. Scale back up and web-2 reattaches the same claim, which is also why a forgotten scale-down silently leaks disks.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', pvcs: '3 (1 idle)', naming: 'data-web-N', ret: 'kept, leaks' });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => { v.style.opacity = '1'; });
      setBoxSublabel(s.refs.v0, 'Bound');
      setBoxSublabel(s.refs.v1, 'Bound');
      setBoxSublabel(s.refs.v2, 'kept, no Pod');
      [s.refs.bl0, s.refs.bl1, s.refs.bl2].forEach(b => { b.style.opacity = '1'; });
      s.refs.d0.classList.add('highlight');
      s.refs.d1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.p0.style.opacity = '1';
      s.refs.p1.style.opacity = '1';
      s.refs.p2.style.opacity = '1';
      if (ctx.reduced) { s.refs.p2.style.opacity = '0.12'; return; }
      // web-2 leaves, but data-web-2 and pv-web-2 stay put: the claim is the thing that persists.
      ctx.register(s.refs.p2.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: 700, delay: 250, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
