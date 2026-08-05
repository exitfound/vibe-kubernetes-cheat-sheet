import { svg, g } from '../../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, pulsePod, routePacket, makeInit, clearHighlights, clearWires, relationPath, BEAT, lightBoxAt, makeRidingLabel, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-ephemeral-vs-persistent


const SPINE_X = 600;

// The Pod tier is the only one inside the narration panel's y band (panel bottom 181 on this card,
// measured over 1600/1280/1100), so it is sized and dropped to keep its area clear of it.
const POD_W = 560, POD_H = 124, POD_X = SPINE_X - POD_W / 2, POD_Y = 90; // 320..880
const POD_BOTTOM = POD_Y + POD_H;                                        // 214

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
const DIV_TOP = POD_BOTTOM + 16, DIV_BOTTOM = 548;   // the divider starts under the Pod, not inside it
const CHIPS_Y = 576, CHIP_W = 196, CHIP_GAP = 16, CHIP_H = 34;
const CHIP_X = i => 600 - (CHIP_W * 3 + CHIP_GAP * 2) / 2 + i * (CHIP_W + CHIP_GAP);   // 290 / 502 / 714

// Two lanes per column, offset LANE either side of the column centre. Writes ride the OUTER lane
// down, remounts ride the INNER lane back up, so a wire and its ball never share a direction.
const LANE = 16;
const W_L_WRITE = [[LEFT_CX - LANE, POD_BOTTOM], [LEFT_CX - LANE, ED_TOP]];       // Pod -> emptyDir
const W_L_MOUNT = [[LEFT_CX + LANE, ED_TOP], [LEFT_CX + LANE, POD_BOTTOM]];       // emptyDir -> Pod
const W_R_WRITE = [[RIGHT_CX + LANE, POD_BOTTOM], [RIGHT_CX + LANE, PVC_TOP]];    // Pod -> PVC
const W_R_MOUNT = [[RIGHT_CX - LANE, PVC_TOP], [RIGHT_CX - LANE, POD_BOTTOM]];    // PVC -> Pod

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // Raise the Pod sublabel a couple pixels off its default baseline so it sits tighter under the box.
  const sub = shell.querySelector('.scheme-pod-sublabel');
  if (sub) sub.setAttribute('y', h - 12);
  const innerBox = box({ x: x + 24, y: y + (h - 60) / 2, w: w - 48, h: 60, label: 'app', sublabel: 'mounts /scratch and /data', role: 'storage' });
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
      'aria-label': 'Ephemeral versus persistent storage: one Pod mounts both an emptyDir and a PersistentVolumeClaim and writes to each. When the Pod is deleted and rescheduled onto another Node, the emptyDir comes back empty because it was tied to the old Node, while the claim reattaches the very same disk with the data intact.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod api-0', sublabel: 'volumes: scratch, data' });

    const ed  = cylinder({ x: ED_X, y: ED_Y, w: ED_W, h: ED_H, label: 'emptyDir', role: 'storage' });
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data', sublabel: 'Bound', role: 'storage' });
    const pv  = cylinder({ x: PV_X, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-x73a', role: 'storage' });

    // Central ephemeral | persistent split, and the dim dashed Bound link tying the claim to its PV.
    const divider = relationPath({ points: [[DIV_X, DIV_TOP], [DIV_X, DIV_BOTTOM]], role: 'storage', dash: '4 6' });
    const boundLink = relationPath({ points: [[PV_CX, PVC_BOTTOM], [PV_CX, PV_TOP]], role: 'storage', dash: '4 6' });

    // Four straight arrows: a write (down) and a remount (up) lane per column.
    const wLWrite = pathArrow({ points: W_L_WRITE, dashed: true, dim: true, role: 'storage' });
    const wLMount = pathArrow({ points: W_L_MOUNT, dashed: true, dim: true, role: 'storage' });
    const wRWrite = pathArrow({ points: W_R_WRITE, dashed: true, dim: true, role: 'storage' });
    const wRMount = pathArrow({ points: W_R_MOUNT, dashed: true, dim: true, role: 'storage' });

    // Three state chips on the card's own strip (290..910), evenly spaced, no text overlap.
    const edChip  = valChip({ x: CHIP_X(0), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'emptyDir', value: 'empty',     role: 'storage' });
    const pvcChip = valChip({ x: CHIP_X(1), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'PVC',      value: 'Bound',     role: 'storage' });
    const podChip = valChip({ x: CHIP_X(2), y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod',      value: 'on Node-1', role: 'storage' });

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
      lanes: [wLWrite, wLMount, wRWrite, wRMount],
      edChip, pvcChip, podChip,
      wires: {},
      packetLayer,
    };
  }

  reset() { this.build(); }
}

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

// Every one of the four lanes has the Pod at one end, so a lane is never more present than the Pod
// is. One helper pins the blocks and their lanes together: pinning them apart is how four mount
// arrows stayed at full strength across a Pod that had just faded to the terminal shade.
function setPresence(s, { pod = 1, ed = 1 } = {}) {
  s.refs.pod.style.opacity = String(pod);
  s.refs.ed.style.opacity = String(ed);
  s.refs.lanes.forEach(el => { el.style.opacity = String(pod); });
}

function clearHL(s) {
  clearHighlights(s, ['ed', 'pvc', 'pv', 'podBox', 'edChip', 'pvcChip', 'podChip'], [s.refs.pod]);
  setPresence(s);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty', pvc: 'Bound', pod: 'on Node-1' });
    },
  },
  {
    id: 'write',
    duration: 2800,
    narration: 'The app writes to both. A log line goes into the emptyDir on the Node, and a database row goes through the claim onto the PersistentVolume. Right now both look the same, each holds the byte it was given.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'log written', pvc: 'row written', pod: 'on Node-1' });
      if (ctx.reduced) { s.refs.ed.classList.add('highlight'); s.refs.pvc.classList.add('highlight'); s.refs.pv.classList.add('highlight'); return; }
      // Pod to both disks: an up-arrow, so the Pod pulses first and both writes descend at afterPulse.
      pulsePod(s.refs.pod, ctx, 0);
      const wl = routePacket(s, ctx, W_L_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'log line', W_L_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ed, ctx, wl.arrivalMs);
      const wr = routePacket(s, ctx, W_R_WRITE, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'db row', W_R_WRITE, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.pvc, ctx, wr.arrivalMs);
      lightBoxAt(s.refs.pv, ctx, wr.arrivalMs);
    },
  },
  {
    id: 'delete',
    duration: 2800,
    narration: 'The Pod is deleted off Node-1. Its emptyDir was part of the Node, so it is wiped with the Pod. The PersistentVolume is a separate object with its own disk, so it simply detaches and keeps every byte.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The chip is the CLAIM, and a claim does not detach: the disk does. What the claim does here is
      // survive the Pod and stay bound, which is the whole contrast with the emptyDir beside it.
      setChips(s, { ed: 'wiped', pvc: 'kept, still Bound', pod: 'deleted' });
      // The PV keeps its data, so it stays lit. The Pod and its emptyDir are gone by the end, both
      // fading to the same terminal shade.
      s.refs.pv.classList.add('highlight');
      setPresence(s, { pod: OPACITY.terminated, ed: OPACITY.terminated });
      if (ctx.reduced) return;
      setPresence(s);
      // The lanes go with the Pod, on the Pod beat: they are the mounts it held.
      [s.refs.pod, ...s.refs.lanes].forEach(el => ctx.register(
        el.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: 650, fill: 'forwards', easing: 'ease-in' })));
      ctx.register(s.refs.ed.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: 650, delay: 250, fill: 'forwards', easing: 'ease-in' }));
    },
  },
  {
    id: 'reschedule',
    duration: 2400,
    narration: 'The controller recreates the Pod, and the scheduler places it on Node-2. This is where the two volumes stop looking alike, because one is tied to a Node it is no longer on and the other is tied to nothing but the claim.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty again', pvc: 'reattaching', pod: 'on Node-2' });
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) return;
      // The Pod comes up fresh on Node-2, and its mount lanes rise with it.
      setPresence(s, { pod: OPACITY.terminated });
      [s.refs.pod, ...s.refs.lanes].forEach(el => ctx.register(
        el.animate([{ opacity: OPACITY.terminated }, { opacity: 1 }], { duration: 500, fill: 'forwards', easing: 'ease-out' })));
      pulsePod(s.refs.pod, ctx, 550);
    },
  },
  {
    id: 'diverge',
    duration: 2800,
    narration: 'The emptyDir comes back empty. It is a brand new directory on Node-2 and knows nothing about Node-1. The claim reattaches the very same PersistentVolume, so /data still has the database row. Same Pod spec, two completely different outcomes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'empty', pvc: 'reattached, intact', pod: 'on Node-2' });
      s.refs.ed.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pv.classList.add('highlight');
      if (ctx.reduced) return;
      const ml = routePacket(s, ctx, W_L_MOUNT, { role: 'storage' });
      ridingLabel(s, ctx, 'empty', W_L_MOUNT);
      const mr = routePacket(s, ctx, W_R_MOUNT, { role: 'storage' });
      ridingLabel(s, ctx, 'db row intact', W_R_MOUNT);
      pulsePod(s.refs.pod, ctx, Math.max(ml.arrivalMs, mr.arrivalMs));
    },
  },
  {
    id: 'verdict',
    duration: 2200,
    narration: 'That is the whole distinction. Ephemeral storage is scratch that resets whenever the Pod is rescheduled, persistent storage follows the claim across Nodes and restarts. Put throwaway data in an emptyDir and anything you must not lose behind a PVC.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { ed: 'resets on move', pvc: 'follows the claim', pod: 'on Node-2' });
      // Verdict is a plain recap: only the Pod pulses, no block stays lit.
      if (ctx.reduced) return;
      pulsePod(s.refs.pod, ctx, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
