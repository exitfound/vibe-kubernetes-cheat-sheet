import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Where the Bytes Land (viewBox 1200x640). The literal path chain on ONE node, drawn as a stack with
// the disk on the shelf at the bottom (storage grammar) and the Pods on top. The single attached
// block device is mounted ONCE at a global staging path, and that one staged filesystem is then
// bind-mounted into each Pod private directory, which surfaces as /data in the container. Two Pods
// share one staged device through two SEPARATE bind mounts: the fan out of the global staging mount
// is the whole point. Mount rises (device -> staging -> bind -> Pod); a write descends the same
// chain. The narration overlay owns x<=380 & y<=300, so every block sits at x>=420.
const L_CX = 560, R_CX = 880;

const PODA_X = 430, PODB_X = 750, POD_Y = 58, POD_W = 260, POD_H = 110;
const POD_BOTTOM = POD_Y + POD_H;                              // 168

const BINDA_X = 420, BINDB_X = 740, BIND_Y = 214, BIND_W = 280, BIND_H = 74;
const BIND_TOP = BIND_Y, BIND_BOTTOM = BIND_Y + BIND_H;       // 214 / 288

const STG_X = 550, STG_Y = 352, STG_W = 340, STG_H = 78;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H, STG_CX = STG_X + STG_W / 2; // 352 / 430 / 720

const DEV_X = 630, DEV_Y = 490, DEV_W = 180, DEV_H = 100;
const DEV_CX = DEV_X + DEV_W / 2, DEV_TOP = DEV_Y;            // 720 / 490
const CHIPS_Y = 604;

// Ascent wires (mount rising). Each static wire and its ball share one array so they cannot drift.
const W_DEV_STG = [[DEV_CX, DEV_TOP], [DEV_CX, STG_BOTTOM]];
const W_STG_A   = [[700, STG_TOP], [700, 320], [L_CX, 320], [L_CX, BIND_BOTTOM]];
const W_STG_B   = [[740, STG_TOP], [740, 320], [R_CX, 320], [R_CX, BIND_BOTTOM]];
const W_A_POD   = [[L_CX, BIND_TOP], [L_CX, POD_BOTTOM]];
const W_B_POD   = [[R_CX, BIND_TOP], [R_CX, POD_BOTTOM]];
// Descent path for a write, riding the same drawn lines in the other direction (a different step, so
// the two directions never coexist and need no separate lane).
const W_POD_A   = [[L_CX, POD_BOTTOM], [L_CX, BIND_TOP]];
const W_A_STG   = [[L_CX, BIND_BOTTOM], [L_CX, 320], [700, 320], [700, STG_TOP]];
const W_STG_DEV = [[DEV_CX, STG_BOTTOM], [DEV_CX, DEV_TOP]];

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
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay, fill: 'forwards', easing: 'ease-out' }));
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

function podBlock({ x, y, w, h, label }) {
  const shell = pod({ x, y, w, h, label, sublabel: 'container', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 26, y: y + 42, w: w - 52, h: 46, label: '/data', sublabel: 'mount point', cat: 'storage' });
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
      'aria-label': 'Where the bytes land: one attached block device is mounted once at a global staging path on the node, and that single staged filesystem is bind-mounted into each Pod private directory, surfacing as slash data in the container, so two Pods on one node share the same disk through two separate bind mounts, and a write to slash data descends bind, staging, device',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podA = podBlock({ x: PODA_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod A' });
    const podB = podBlock({ x: PODB_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod B' });
    podB.group.style.opacity = '0';

    const bindA = box({ x: BINDA_X, y: BIND_Y, w: BIND_W, h: BIND_H, label: 'Pod A bind mount', sublabel: '/pods/uid-a/volumes/vol-1', cat: 'storage' });
    const bindB = box({ x: BINDB_X, y: BIND_Y, w: BIND_W, h: BIND_H, label: 'Pod B bind mount', sublabel: '/pods/uid-b/volumes/vol-1', cat: 'storage' });
    bindB.style.opacity = '0';

    const stg = box({ x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'global staging mount', sublabel: '/plugins/.../csi/vol-1/globalmount', cat: 'storage' });
    const dev = cylinder({ x: DEV_X, y: DEV_Y, w: DEV_W, h: DEV_H, label: 'nvme1n1', cat: 'storage' });

    const wDevStg = pathArrow({ points: W_DEV_STG, dashed: true, dim: true, color: 'storage' });
    const wStgA   = pathArrow({ points: W_STG_A, dashed: true, dim: true, color: 'storage' });
    const wStgB   = pathArrow({ points: W_STG_B, dashed: true, dim: true, color: 'storage' });
    const wAPod   = pathArrow({ points: W_A_POD, dashed: true, dim: true, color: 'storage' });
    const wBPod   = pathArrow({ points: W_B_POD, dashed: true, dim: true, color: 'storage' });
    wStgB.style.opacity = '0';
    wBPod.style.opacity = '0';

    const devLbl = text({ class: 'scheme-label code dim', x: DEV_CX + 18, y: 462, 'text-anchor': 'start' }, [' ']);
    const stgLbl = text({ class: 'scheme-label code dim', x: 470, y: 330, 'text-anchor': 'middle' }, [' ']);

    const devChip  = valChip({ x: 60,  y: CHIPS_Y, w: 280, h: 30, name: 'device', value: 'nvme1n1', cat: 'storage' });
    const stgChip  = valChip({ x: 360, y: CHIPS_Y, w: 300, h: 30, name: 'staging', value: 'none', cat: 'storage' });
    const bindChip = valChip({ x: 684, y: CHIPS_Y, w: 320, h: 30, name: 'bind mounts', value: 'none', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: blocks, then wires + labels above them, then chips, then the packet layer on top.
    [stg, dev, bindA, bindB, podA.group, podB.group].forEach(el => root.appendChild(el));
    [wDevStg, wStgA, wStgB, wAPod, wBPod].forEach(el => root.appendChild(el));
    [devLbl, stgLbl].forEach(el => root.appendChild(el));
    [devChip, stgChip, bindChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podA: podA.group, podABox: podA.innerBox, podB: podB.group, podBBox: podB.innerBox,
      bindA, bindB, stg, dev, wStgB, wBPod,
      devChip, stgChip, bindChip,
      wires: { dev: devLbl, stg: stgLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { dev, stg, bind }) {
  setVal(s.refs.devChip, dev);
  setVal(s.refs.stgChip, stg);
  setVal(s.refs.bindChip, bind);
}

function clearHL(s) {
  clearHighlights(s, ['bindA', 'bindB', 'stg', 'dev', 'podABox', 'podBBox',
    'devChip', 'stgChip', 'bindChip'], [s.refs.podA, s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod writes to /data and expects the bytes to reach a disk. On the node that path is not one hop, it is a short chain of mounts. Start at the bottom: one real block device, /dev/nvme1n1, attached to this node and holding the filesystem.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'nvme1n1', stg: 'none', bind: 'none' });
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.bindB.style.opacity = '0';
      s.refs.wStgB.style.opacity = '0';
      s.refs.wBPod.style.opacity = '0';
    },
  },
  {
    id: 'stage',
    duration: 2600,
    narration: 'The device is mounted exactly once, at a global staging path under the kubelet plugins directory. This is the only place the filesystem itself is mounted on the node. Everything above this point is not another mount of the disk, it is a view onto this one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'nvme1n1', stg: 'mounted once', bind: 'none' });
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.bindB.style.opacity = '0';
      s.refs.wStgB.style.opacity = '0';
      s.refs.wBPod.style.opacity = '0';
      s.refs.dev.classList.add('highlight');
      setWire(s, 'dev', 'NodeStage');
      if (ctx.reduced) { s.refs.stg.classList.add('highlight'); return; }
      const m = routePacket(s, ctx, W_DEV_STG, { cat: 'storage' });
      ridingLabel(s, ctx, 'mount fs', W_DEV_STG);
      lightBoxAt(s.refs.stg, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'NodePublish does not touch the disk again. It bind-mounts the staged directory into a directory that belongs to Pod A alone, under /var/lib/kubelet/pods and the Pod uid. A bind mount is a second doorway onto the exact same files, not a copy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'nvme1n1', stg: 'mounted once', bind: 'Pod A' });
      s.refs.podA.style.opacity = '0.5';
      s.refs.podB.style.opacity = '0';
      s.refs.bindB.style.opacity = '0';
      s.refs.wStgB.style.opacity = '0';
      s.refs.wBPod.style.opacity = '0';
      s.refs.stg.classList.add('highlight');
      setWire(s, 'stg', 'bind mount');
      if (ctx.reduced) { s.refs.bindA.classList.add('highlight'); return; }
      const b = routePacket(s, ctx, W_STG_A, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_A);
      lightBoxAt(s.refs.bindA, ctx, b.arrivalMs);
    },
  },
  {
    id: 'surface',
    duration: 3000,
    narration: 'That per-Pod directory is what the container runtime maps to /data inside Pod A. From the container it looks like a plain folder. Underneath, it is a bind mount of a bind mount of one staged device. Pod A can now read and write.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'nvme1n1', stg: 'mounted once', bind: 'Pod A' });
      s.refs.podB.style.opacity = '0';
      s.refs.bindB.style.opacity = '0';
      s.refs.wStgB.style.opacity = '0';
      s.refs.wBPod.style.opacity = '0';
      s.refs.bindA.classList.add('highlight');
      s.refs.podA.style.opacity = '1';
      if (ctx.reduced) { s.refs.podABox.classList.add('highlight'); return; }
      const p = routePacket(s, ctx, W_A_POD, { cat: 'storage' });
      ridingLabel(s, ctx, '/data', W_A_POD);
      s.refs.podA.style.opacity = '0.5';
      ctx.register(s.refs.podA.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: p.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podA, ctx, p.arrivalMs);
      lightBoxAt(s.refs.podABox, ctx, p.arrivalMs);
    },
  },
  {
    id: 'second',
    duration: 3400,
    narration: 'A second Pod on the same node gets its own directory and its own bind mount off the same global staging path. The disk is not attached twice and not staged twice. Two Pods, two bind mounts, one device underneath. That is how a single disk is shared across Pods on a node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'nvme1n1', stg: 'mounted once', bind: 'Pod A + Pod B' });
      s.refs.podA.style.opacity = '1';
      s.refs.stg.classList.add('highlight');
      s.refs.bindA.classList.add('highlight');
      // Pod B, its bind box and wires exist by the end of this step.
      s.refs.podB.style.opacity = '1';
      s.refs.bindB.style.opacity = '1';
      s.refs.wStgB.style.opacity = '1';
      s.refs.wBPod.style.opacity = '1';
      if (ctx.reduced) { s.refs.bindB.classList.add('highlight'); s.refs.podBBox.classList.add('highlight'); return; }
      revealAt(s.refs.bindB, ctx, 0);
      const b = routePacket(s, ctx, W_STG_B, { cat: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_B);
      lightBoxAt(s.refs.bindB, ctx, b.arrivalMs);
      const p = routePacket(s, ctx, W_B_POD, { delay: b.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, '/data', W_B_POD, { delay: b.arrivalMs + BEAT.afterHop });
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: Math.max(0, b.arrivalMs), fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, p.arrivalMs);
      lightBoxAt(s.refs.podBBox, ctx, p.arrivalMs);
    },
  },
  {
    id: 'write',
    duration: 4100,
    narration: 'Follow a write the other way. Pod A writes to /data, and the bytes pass down through its bind mount, into the global staging mount, and onto the device. No copy is made at any hop. All the mounts are windows onto the same blocks on the same disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { dev: 'writing', stg: 'mounted once', bind: 'Pod A + Pod B' });
      s.refs.podA.style.opacity = '1';
      s.refs.podB.style.opacity = '1';
      s.refs.bindB.style.opacity = '1';
      s.refs.wStgB.style.opacity = '1';
      s.refs.wBPod.style.opacity = '1';
      s.refs.podABox.classList.add('highlight');
      if (ctx.reduced) { s.refs.dev.classList.add('highlight'); return; }
      // Pod A is the writer, so it pulses first and the write leaves at BEAT.afterPulse, matching the
      // pod-sourced descent in storage-fsgroup-ownership rather than starting the ball cold.
      pulsePod(s.refs.podA, ctx, 0);
      const h1 = routePacket(s, ctx, W_POD_A, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write', W_POD_A, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.bindA, ctx, h1.arrivalMs);
      const h2 = routePacket(s, ctx, W_A_STG, { delay: h1.arrivalMs + BEAT.afterHop, cat: 'storage' });
      lightBoxAt(s.refs.stg, ctx, h2.arrivalMs);
      const h3 = routePacket(s, ctx, W_STG_DEV, { delay: h2.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'bytes land', W_STG_DEV, { delay: h2.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.dev, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
