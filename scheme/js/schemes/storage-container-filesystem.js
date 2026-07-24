import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Container Filesystem Layers. Storage grammar as a VERTICAL STACK centered on the canvas: the
// Container (consumer) on top, its overlay layers stacked directly beneath it, and the real volume
// disk on the shelf at the bottom, centered under the stack so the whole column is symmetric on 600.
//
// The teaching contrast: the container root filesystem is read-only image layers (lowerdir) with
// ONE thin writable layer (upperdir) on top, combined by overlayfs. A write copies up into the
// writable layer, never into the image, and that writable layer is DISCARDED when the container is
// removed. A mounted volume is a hole punched through the overlay straight to real storage,
// bypassing the writable layer, so it survives. The bypass is drawn literally: the volume wire
// leaves the Container SIDE and zigzags in right angles around the stack down to the disk.
//
// The writable layer does not exist until its step, so its copy-up wire does not either: the layer
// and the wire fade in together, are discarded together, and return together for the fresh
// container. Only the Container (a Pod-like consumer) pulses. The layer boxes and the disk are
// infrastructure: they light, they never pulse. The narration overlay owns x<=380 & y<=300, so
// blocks start right of it.
const POD_X = 440, POD_Y = 48, POD_W = 320, POD_H = 140;
const POD_BOTTOM = POD_Y + POD_H;                     // 188
const POD_CX = POD_X + POD_W / 2;                     // 600
const POD_RIGHT = POD_X + POD_W;                      // 760

const STK_X = 460, STK_W = 280;                       // stack centred on 600
const WR_Y = 234, WR_H = 48;                          // writable layer (upperdir)
const L3_Y = 292, L2_Y = 346, L1_Y = 400, LH = 44;    // read-only image layers, bottom 444

const VOL_W = 220, VOL_X = POD_CX - VOL_W / 2;        // 490, centred under the stack
const VOL_Y = 482, VOL_H = 96;                        // 482..578
const VOL_MY = VOL_Y + VOL_H / 2;                     // 530
const VOL_RIGHT = VOL_X + VOL_W;                      // 710

const BYPASS_X = 820;                                 // the volume wire descends right of the stack
const EXIT_Y = 130;                                   // where it leaves the Container side
const CHIPS_Y = 596;

// Each static wire and its ball share one array. The copy-up write descends onto the writable
// layer. The volume write leaves the Container SIDE and zigzags in right angles around the whole
// stack down to the disk: the literal picture of bypassing every overlay layer.
const W_COPYUP = [[POD_CX, POD_BOTTOM], [POD_CX, WR_Y]];
const W_VOL    = [[POD_RIGHT, EXIT_Y], [BYPASS_X, EXIT_Y], [BYPASS_X, VOL_MY], [VOL_RIGHT, VOL_MY]];

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

// The Container shell lives alone in shellWrap so the pulse (which queries .scheme-pod and
// .scheme-box descendants) reaches ONLY the shell, never the inner Process box. The Process box is
// an internal part: it only ever takes a static .highlight, never a pulse.
function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: y + 46, w: w - 48, h: 60, label: 'Process', sublabel: 'sees one tree at /', cat: 'storage' });
  const shellWrap = g({});
  shellWrap.appendChild(shell);
  const group = g({});
  group.appendChild(shellWrap);
  group.appendChild(innerBox);
  return { group, shellWrap, innerBox };
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

    const ctr = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Container', sublabel: 'Root Filesystem' });

    const writable = box({ x: STK_X, y: WR_Y, w: STK_W, h: WR_H, label: 'writable layer', sublabel: 'upperdir, starts empty', cat: 'storage' });
    writable.style.opacity = '0';
    const l3 = box({ x: STK_X, y: L3_Y, w: STK_W, h: LH, label: 'image layer: app', sublabel: 'read-only', cat: 'storage' });
    const l2 = box({ x: STK_X, y: L2_Y, w: STK_W, h: LH, label: 'image layer: deps', sublabel: 'read-only', cat: 'storage' });
    const l1 = box({ x: STK_X, y: L1_Y, w: STK_W, h: LH, label: 'image layer: base', sublabel: 'read-only', cat: 'storage' });

    const volume = cylinder({ x: VOL_X, y: VOL_Y, w: VOL_W, h: VOL_H, label: 'Volume', cat: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap
    // ellipse is not part of the visible front face. Re-center on the face (below the cap):
    // face spans 2*ry..h, so the baseline sits at its middle plus half the font x-height.
    const volLbl = volume.querySelector('.scheme-cylinder-label');
    if (volLbl) volLbl.setAttribute('y', 60);

    // The copy-up wire targets the writable layer, which does not exist yet, so it is born hidden
    // and only ever shows while the layer itself is on screen.
    const wCopyup = pathArrow({ points: W_COPYUP, dashed: true, dim: true, color: 'storage' });
    wCopyup.style.opacity = '0';
    const wVol    = pathArrow({ points: W_VOL,    dashed: true, dim: true, color: 'storage' });

    const mountLbl = text({ class: 'scheme-label code dim', x: BYPASS_X + 14, y: 346, 'text-anchor': 'start' }, [' ']);

    // The writable layer is not on screen yet at build time, so the chip starts honest: only the
    // read-only image layers exist until the writable step adds the RW top.
    // One uniform chip size, and the strip (3x320 + 2x20 = 1000) is centered on x=600, the axis of
    // the whole column above, so the bottom row is symmetric with the diagram.
    const fsChip      = valChip({ x: 100, y: CHIPS_Y, w: 320, h: 34, name: 'root fs', value: 'read-only image layers', cat: 'storage' });
    const writeChip   = valChip({ x: 440, y: CHIPS_Y, w: 320, h: 34, name: 'last write', value: 'none',   cat: 'storage' });
    const persistChip = valChip({ x: 780, y: CHIPS_Y, w: 320, h: 34, name: 'persists', value: 'no, in writable', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then wires and the mount label above them, then the chip
    // strip, then the packet layer so every ball rides above everything.
    [ctr.group, l1, l2, l3, writable, volume].forEach(el => root.appendChild(el));
    [wCopyup, wVol, mountLbl].forEach(el => root.appendChild(el));
    [fsChip, writeChip, persistChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, ctr: ctr.group, ctrShell: ctr.shellWrap, ctrBox: ctr.innerBox,
      writable, l3, l2, l1, volume, wCopyup,
      fsChip, writeChip, persistChip,
      wires: { mount: mountLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Sets each chip and statically highlights the ones whose value CHANGES on this step (the standard
// set by the volume-model anchor): a chip that changes glows for the step, one that stays does not.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { fs, write, persist }) {
  setChip(s.refs.fsChip, fs);
  setChip(s.refs.writeChip, write);
  setChip(s.refs.persistChip, persist);
}

function clearHL(s) {
  clearHighlights(s, ['writable', 'l3', 'l2', 'l1', 'volume', 'ctrBox', 'fsChip', 'writeChip', 'persistChip'],
    [s.refs.ctrShell]);
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
      // The writable layer is hidden on the poster, so the chip must not claim an RW top yet.
      setChips(s, { fs: 'read-only image layers', write: 'none', persist: 'no, in writable' });
      s.refs.writable.style.opacity = '0';
      s.refs.wCopyup.style.opacity = '0';
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
      s.refs.wCopyup.style.opacity = '0';
      s.refs.l3.classList.add('highlight');
      s.refs.l2.classList.add('highlight');
      s.refs.l1.classList.add('highlight');
      if (ctx.reduced) return;
      // The container starts and assembles its root from the image layers, so the shell pulses.
      pulsePod(s.refs.ctrShell, ctx, 0);
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
      // The writable layer and its copy-up wire are present by the end of the step, so full opacity
      // is the static end-state. They fade in together: no layer, no wire.
      s.refs.writable.style.opacity = '1';
      s.refs.wCopyup.style.opacity = '1';
      if (ctx.reduced) return;
      s.refs.writable.style.opacity = '0';
      s.refs.wCopyup.style.opacity = '0';
      ctx.register(s.refs.writable.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.wCopyup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
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
      s.refs.wCopyup.style.opacity = '1';
      // The process writes and the writable layer receives: both light at step entry (step-static,
      // per the family standard), and the shell pulse fires in the same beat.
      s.refs.ctrBox.classList.add('highlight');
      s.refs.writable.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.ctrShell, ctx, 0);
      routePacket(s, ctx, W_COPYUP, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'copy-up', W_COPYUP, { delay: BEAT.afterPulse });
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
      // The writable layer is discarded and its copy-up wire goes with it: no layer, no wire.
      // The Container block itself stays at full strength, the story is the vanishing layer.
      s.refs.writable.style.opacity = '0';
      s.refs.wCopyup.style.opacity = '0';
      if (ctx.reduced) return;
      s.refs.writable.style.opacity = '1';
      s.refs.wCopyup.style.opacity = '1';
      ctx.register(s.refs.writable.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.wCopyup.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 500, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'volume',
    duration: 3000,
    narration: 'The container comes back and gets a brand new empty writable layer, everything the old one held is gone. A mounted volume is a hole punched through the overlay straight to real storage: a write under /data skips the writable layer entirely and lands on the volume, so it survives the container being replaced. Persist anything you care about on a volume, never on the root filesystem.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { fs: 'RO image + RW top', write: '/data on volume', persist: 'yes, on volume' });
      // A fresh container is running again, so a fresh EMPTY writable layer and its copy-up wire
      // fade back in together: the reappearing layer is the restart made visible, not the old
      // layer returning (its contents are gone, the sublabel still reads starts empty).
      s.refs.writable.style.opacity = '1';
      s.refs.wCopyup.style.opacity = '1';
      setWire(s, 'mount', 'mounted at /data');
      // The process writes and the volume receives: both light at step entry (step-static, per
      // the family standard), and the shell pulse fires in the same beat.
      s.refs.ctrBox.classList.add('highlight');
      s.refs.volume.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.writable.style.opacity = '0';
      s.refs.wCopyup.style.opacity = '0';
      ctx.register(s.refs.writable.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
      ctx.register(s.refs.wCopyup.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' }));
      // The fresh container then writes to /data, which bypasses the overlay and lands on the disk.
      pulsePod(s.refs.ctrShell, ctx, 0);
      routePacket(s, ctx, W_VOL, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write /data', W_VOL, { delay: BEAT.afterPulse });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
