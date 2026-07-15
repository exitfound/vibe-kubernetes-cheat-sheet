import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Container Filesystem Layers. Storage grammar as a VERTICAL STACK: the container (consumer) on
// top, its overlay layers stacked in the middle, and a real volume disk on the shelf to the right.
//
// The teaching contrast: the container root filesystem is read-only image layers (lowerdir) with
// ONE thin writable layer (upperdir) on top, combined by overlayfs. A write copies up into the
// writable layer, never into the image, and that writable layer is DISCARDED when the container is
// removed. A mounted volume is a hole punched through the overlay straight to real storage,
// bypassing the writable layer, so it survives. The card sets the two writes side by side: the
// copy-up that vanishes and the volume write that persists.
//
// Only the container (a Pod-like consumer) pulses. The layer boxes and the disk are infrastructure:
// they light, they never pulse. The narration overlay owns x<=380 & y<=300, so blocks start right of it.
const POD_X = 440, POD_Y = 55, POD_W = 320, POD_H = 150;
const POD_BOTTOM = POD_Y + POD_H;                     // 205
const POD_CX = POD_X + POD_W / 2;                     // 600

const STK_X = 460, STK_W = 280;                       // stack centred on 600
const WR_Y = 270, WR_H = 52;                          // writable layer (upperdir)
const L3_Y = 336, L2_Y = 396, L1_Y = 456, LH = 48;    // read-only image layers
const STK_BOTTOM = L1_Y + LH;                         // 504

const VOL_X = 870, VOL_Y = 400, VOL_W = 200, VOL_H = 115;
const VOL_LEFT = VOL_X, VOL_MY = VOL_Y + 57;          // 870 / 457
const CHIPS_Y = 588;

// Each static wire and its ball share one array. The copy-up write descends onto the writable
// layer, the volume write bypasses the whole stack down the right side to the disk.
const W_COPYUP = [[POD_CX, POD_BOTTOM], [POD_CX, WR_Y]];
const W_VOL    = [[700, POD_BOTTOM], [820, POD_BOTTOM], [820, VOL_MY], [VOL_LEFT, VOL_MY]];

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

// A pod shell plus an inner box wrapped in a g, so pulsePod reaches both.
function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 46, w: w - 48, h: 60, label: 'process', sublabel: 'sees one tree at /', cat: 'storage' });
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
      'aria-label': 'Container filesystem layers: a container root filesystem is read-only image layers stacked by overlayfs with one thin writable layer on top. A write copies the file up into the writable layer rather than changing the image, and that writable layer is discarded when the container is removed, which is why data written outside a volume vanishes. A mounted volume bypasses the overlay and writes straight to real storage.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const ctr = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'container', sublabel: 'root filesystem' });

    const writable = box({ x: STK_X, y: WR_Y, w: STK_W, h: WR_H, label: 'writable layer', sublabel: 'upperdir, starts empty', cat: 'storage' });
    writable.style.opacity = '0';
    const l3 = box({ x: STK_X, y: L3_Y, w: STK_W, h: LH, label: 'image layer: app', sublabel: 'read-only', cat: 'storage' });
    const l2 = box({ x: STK_X, y: L2_Y, w: STK_W, h: LH, label: 'image layer: deps', sublabel: 'read-only', cat: 'storage' });
    const l1 = box({ x: STK_X, y: L1_Y, w: STK_W, h: LH, label: 'image layer: base', sublabel: 'read-only', cat: 'storage' });

    const overlayLbl = text({ class: 'scheme-label code dim', x: POD_CX, y: 258, 'text-anchor': 'middle' }, ['overlayfs merges these into /']);

    const volume = cylinder({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'volume', cat: 'storage' });

    const wCopyup = pathArrow({ points: W_COPYUP, dashed: true, dim: true, color: 'storage' });
    const wVol    = pathArrow({ points: W_VOL,    dashed: true, dim: true, color: 'storage' });

    const mountLbl = text({ class: 'scheme-label code dim', x: 830, y: 195, 'text-anchor': 'start' }, [' ']);

    const fsChip      = valChip({ x: 100, y: CHIPS_Y, w: 360, h: 34, name: 'root fs', value: 'overlay: RO image + RW top', cat: 'storage' });
    const writeChip   = valChip({ x: 480, y: CHIPS_Y, w: 280, h: 34, name: 'last write', value: 'none',   cat: 'storage' });
    const persistChip = valChip({ x: 780, y: CHIPS_Y, w: 300, h: 34, name: 'persists', value: 'no, in writable', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then wires and the mount label above them, then the chip
    // strip, then the packet layer so every ball rides above everything.
    [ctr.group, l1, l2, l3, writable, volume].forEach(el => root.appendChild(el));
    [wCopyup, wVol, overlayLbl, mountLbl].forEach(el => root.appendChild(el));
    [fsChip, writeChip, persistChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ctr: ctr.group, ctrBox: ctr.innerBox,
      writable, l3, l2, l1, volume,
      fsChip, writeChip, persistChip,
      wires: { mount: mountLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { fs, write, persist }) {
  setVal(s.refs.fsChip, fs);
  setVal(s.refs.writeChip, write);
  setVal(s.refs.persistChip, persist);
}

function clearHL(s) {
  clearHighlights(s, ['writable', 'l3', 'l2', 'l1', 'volume', 'ctrBox', 'fsChip', 'writeChip', 'persistChip'],
    [s.refs.ctr]);
  s.refs.ctr.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A container root filesystem is not one disk. It is a stack of read-only image layers with a single thin writable layer on top, combined by overlayfs into the one tree the process sees at slash. A separate volume can be mounted into that tree as well.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'overlay: RO image + RW top', write: 'none', persist: 'no, in writable' });
      s.refs.writable.style.opacity = '0';
    },
  },
  {
    id: 'layers',
    duration: 2200,
    narration: 'The image layers are read-only. They come straight from the image and are shared between every container built on it, so nothing a container does can change them. This is the lower half of the overlay.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'read-only image layers', write: 'none', persist: 'no, in writable' });
      s.refs.writable.style.opacity = '0';
      s.refs.l3.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      if (ctx.reduced) return;
      // The container starts and assembles its root from the image layers, so the container pulses.
      pulsePod(s.refs.ctr, ctx, 0);
    },
  },
  {
    id: 'writable',
    duration: 2200,
    narration: 'On top sits one thin writable layer, the upperdir. Every file the container creates or changes at runtime lands here, and it starts empty. Nothing else in the root filesystem can be written to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'RO image + RW top', write: 'none', persist: 'no, in writable' });
      s.refs.writable.classList.add('highlight');
      // The writable layer is present by the end of the step, so full opacity is the static end-state.
      s.refs.writable.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.writable.style.opacity = '0';
      ctx.register(s.refs.writable.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'copyup',
    duration: 2800,
    narration: 'A write to a path that lives in an image layer does not touch the image. overlayfs copies the file up into the writable layer first, then applies the change there. The read-only layer underneath is left exactly as it was.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'RO image + RW top', write: '/app/config', persist: 'no, in writable' });
      s.refs.writable.style.opacity = '1';
      if (ctx.reduced) { s.refs.writable.classList.add('highlight'); return; }
      // Container (Pod) to writable layer (infra) is an up-arrow: the container pulses first, the
      // copy-up write descends at BEAT.afterPulse, and the writable layer lights on arrival.
      pulsePod(s.refs.ctr, ctx, 0);
      const w = routePacket(s, ctx, W_COPYUP, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'copy-up', W_COPYUP, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.writable, ctx, w.arrivalMs);
    },
  },
  {
    id: 'discard',
    duration: 2600,
    narration: 'When the container is removed, its writable layer is thrown away with it. That is why anything written to the root filesystem, such as logs, temp files or a scratch database, is gone the moment the container restarts. The image layers remain, empty of your changes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'RO image + RW top', write: 'discarded', persist: 'no, in writable' });
      // The container is being removed and its writable layer discarded, so those are the end-state.
      s.refs.ctr.style.opacity = '0.3';
      s.refs.writable.style.opacity = '0';
      if (ctx.reduced) return;
      s.refs.ctr.style.opacity = '1';
      s.refs.writable.style.opacity = '1';
      ctx.register(s.refs.ctr.animate([{ opacity: 1 }, { opacity: 0.3 }], { duration: 600, delay: 300, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.writable.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'volume',
    duration: 3000,
    narration: 'A mounted volume is a hole punched through the overlay straight to real storage. A write under /data skips the writable layer entirely and lands on the volume, so it survives the container being replaced. Persist anything you care about on a volume, never on the root filesystem.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'RO image + RW top', write: '/data on volume', persist: 'yes, on volume' });
      s.refs.writable.style.opacity = '1';
      setWire(s, 'mount', 'mounted at /data');
      if (ctx.reduced) { s.refs.volume.classList.add('highlight'); return; }
      // A fresh container writes to /data, which bypasses the writable layer and lands on the disk.
      pulsePod(s.refs.ctr, ctx, 0);
      const v = routePacket(s, ctx, W_VOL, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write /data', W_VOL, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.volume, ctx, v.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
