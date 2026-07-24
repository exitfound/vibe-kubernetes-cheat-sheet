import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT,
} from '../lib/storage-kit.js';

// Ephemeral vs Persistent, the side-by-side card. One Pod on top mounts two volumes, and the whole
// scheme is a SYMMETRIC STACK centred on the canvas spine (SPINE_X = 600, the viewBox centre): the
// Pod straddles the spine, and each volume hangs an even distance left and right of it. LEFT is
// ephemeral (an emptyDir owned by the node), RIGHT is persistent (a PVC bound to a PV whose disk is
// a separate object, tied by a dim dashed identity link, Bound, no arrowhead).
//
// Each column carries TWO straight vertical lanes so every direction has its own arrow: an OUTER
// write lane (Pod down to the volume, the ball descends) and an INNER remount lane (volume up to the
// Pod, the ball rises). The Pod writes to both, is deleted, and is rescheduled onto another node. The
// emptyDir comes back empty (it was tied to the old node) while the PVC reattaches the very same disk
// with the data intact. Only the Pod pulses. Disks and the claim box are infrastructure: they light.
//
// Because the diagram is centred on the canvas, the Pod's left shell edge passes under the top-left
// narration overlay (right edge ~410, bottom max ~223). Nothing essential is hidden: the pod() label
// and the app box are centre-anchored at the spine, so they stay clear, and every volume sits below
// y=306, well under the overlay. The three state chips are fitted to the Pod width, evenly spaced.
const SPINE_X = 600;

const POD_W = 620, POD_H = 124, POD_X = SPINE_X - POD_W / 2, POD_Y = 66; // 290..910
const POD_BOTTOM = POD_Y + POD_H;                                        // 190

const COL_D = 160;                     // each column sits COL_D from the spine, symmetric
const LEFT_CX = SPINE_X - COL_D;       // 440, emptyDir column
const RIGHT_CX = SPINE_X + COL_D;      // 760, PVC/PV column

const BLOCK_Y = 306;                   // shared top of emptyDir and PVC, so both write arrows match

const ED_W = 200, ED_H = 172, ED_X = LEFT_CX - ED_W / 2, ED_Y = BLOCK_Y; // 340..540, 306..478
const ED_TOP = ED_Y, ED_CX = LEFT_CX;

const PVC_W = 200, PVC_H = 64, PVC_X = RIGHT_CX - PVC_W / 2, PVC_Y = BLOCK_Y; // 660..860, 306..370
const PVC_TOP = PVC_Y, PVC_BOTTOM = PVC_Y + PVC_H, PVC_CX = RIGHT_CX;         // 306 / 370 / 760

const PV_W = 200, PV_H = 120, PV_X = RIGHT_CX - PV_W / 2, PV_Y = 420; // 660..860, 420..540
const PV_TOP = PV_Y, PV_CX = RIGHT_CX;

const DIV_X = SPINE_X;
const CHIPS_Y = 576;

// Two lanes per column, offset LANE either side of the column centre. Writes ride the OUTER lane
// down, remounts ride the INNER lane back up, so a wire and its ball never share a direction.
const LANE = 16;
const W_L_WRITE = [[LEFT_CX - LANE, POD_BOTTOM], [LEFT_CX - LANE, ED_TOP]];       // Pod -> emptyDir
const W_L_MOUNT = [[LEFT_CX + LANE, ED_TOP], [LEFT_CX + LANE, POD_BOTTOM]];       // emptyDir -> Pod
const W_R_WRITE = [[RIGHT_CX + LANE, POD_BOTTOM], [RIGHT_CX + LANE, PVC_TOP]];    // Pod -> PVC
const W_R_MOUNT = [[RIGHT_CX - LANE, PVC_TOP], [RIGHT_CX - LANE, POD_BOTTOM]];    // PVC -> Pod

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
  // Raise the Pod sublabel a couple pixels off its default baseline so it sits tighter under the box.
  const sub = shell.querySelector('.scheme-pod-sublabel');
  if (sub) sub.setAttribute('y', h - 12);
  const innerBox = box({ x: x + 24, y: y + (h - 60) / 2, w: w - 48, h: 60, label: 'App', sublabel: 'mounts /scratch and /data', cat: 'storage' });
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
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC Data', sublabel: 'bound', cat: 'storage' });
    const pv  = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-x73a', cat: 'storage' });

    // Central ephemeral | persistent split, and the dim dashed Bound link tying the claim to its PV.
    const divider = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: DIV_X, y1: 206, x2: DIV_X, y2: 548, 'stroke-dasharray': '4 6', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: PV_CX, y1: PVC_BOTTOM, x2: PV_CX, y2: PV_TOP, 'stroke-dasharray': '4 6', fill: 'none' });

    // Four straight arrows: a write (down) and a remount (up) lane per column.
    const wLWrite = pathArrow({ points: W_L_WRITE, dashed: true, dim: true, color: 'storage' });
    const wLMount = pathArrow({ points: W_L_MOUNT, dashed: true, dim: true, color: 'storage' });
    const wRWrite = pathArrow({ points: W_R_WRITE, dashed: true, dim: true, color: 'storage' });
    const wRMount = pathArrow({ points: W_R_MOUNT, dashed: true, dim: true, color: 'storage' });

    // Three state chips fitted under the Pod (290..910), evenly spaced, no text overlap.
    const edChip  = valChip({ x: 290, y: CHIPS_Y, w: 196, h: 34, name: 'emptyDir', value: 'empty',     cat: 'storage' });
    const pvcChip = valChip({ x: 502, y: CHIPS_Y, w: 196, h: 34, name: 'PVC',      value: 'Bound',     cat: 'storage' });
    const podChip = valChip({ x: 714, y: CHIPS_Y, w: 196, h: 34, name: 'Pod',      value: 'on node-a', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then divider and bound link and the four arrows above them,
    // then the chip strip, then the packet layer so every ball rides above everything.
    [podB.group, ed, pvc, pv].forEach(el => root.appendChild(el));
    [divider, boundLink, wLWrite, wLMount, wRWrite, wRMount].forEach(el => root.appendChild(el));
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

// Sets each chip and statically highlights the ones whose value CHANGES on this step (highlight,
// never flash). clearHL wipes the highlight class but not the text, and steps replay in order, so
// comparing against the chip's current text is a deterministic per-step diff. Mirrors the
// volume-model card and the shared chip convention: a status chip that changes is lit for the step.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
function setChips(s, { ed, pvc, pod }) {
  setChip(s.refs.edChip, ed);
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.podChip, pod);
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
      const wl = routePacket(s, ctx, W_L_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'log line', W_L_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, wl.arrivalMs);
      const wr = routePacket(s, ctx, W_R_WRITE, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'db row', W_R_WRITE, { delay: BEAT.afterPulse });
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
      // The PV keeps its data, so it stays lit. The Pod and its emptyDir are gone by the end, both
      // fading to the same terminal shade.
      s.refs.pv.classList.add('highlight');
      s.refs.pod.style.opacity = '0.25';
      s.refs.ed.style.opacity = '0.25';
      if (ctx.reduced) return;
      s.refs.pod.style.opacity = '1';
      s.refs.ed.style.opacity = '1';
      ctx.register(s.refs.pod.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 650, fill: 'forwards', easing: 'ease-in' }));
      ctx.register(s.refs.ed.animate([{ opacity: 1 }, { opacity: 0.25 }], { duration: 650, delay: 250, fill: 'forwards', easing: 'ease-in' }));
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
      // All three volumes are attached from the start of the step, so they light at entry. Then the
      // two mount balls ride up their INNER lanes (volume to Pod), and the Pod pulses on arrival. The
      // left mount carries nothing, the right mount carries the surviving row.
      s.refs.ed.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) return;
      const ml = routePacket(s, ctx, W_L_MOUNT, { cat: 'storage' });
      ridingLabel(s, ctx, 'empty', W_L_MOUNT);
      const mr = routePacket(s, ctx, W_R_MOUNT, { cat: 'storage' });
      ridingLabel(s, ctx, 'db row intact', W_R_MOUNT);
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
      // Verdict is a plain recap: only the Pod pulses, no block stays lit.
      if (ctx.reduced) return;
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
