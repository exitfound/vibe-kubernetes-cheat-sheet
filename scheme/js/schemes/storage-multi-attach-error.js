import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur, flashChips,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Multi-Attach Error (viewBox 1200x640). Two nodes side by side. An RWO disk can be attached to ONE
// node at a time. The old Pod lives on node-a with a VolumeAttachment that says attached: true, and a
// new Pod is scheduled onto node-b (a rolling update made it before the old one died, or node-a went
// unreachable). The attach and detach controller cannot write a second attachment for the same RWO
// volume, so the new Pod hangs in ContainerCreating with "Multi-Attach error for volume". It clears
// only when the old attachment is removed, which for an unreachable node waits out the ~6 minute
// force-detach timeout. The disk sits on the shelf at the bottom. The narration overlay owns
// x<=380 & y<=300, so both nodes start at x>=430 and the controller top is at y>=430.
const NA_X = 430, NA_Y = 60, NA_W = 330, NA_H = 250;
const NB_X = 800, NB_Y = 60, NB_W = 350, NB_H = 250;

const OLD_X = 456, OLD_Y = 98, OLD_W = 278, OLD_H = 98;
const VAA_X = 456, VAA_Y = 222, VAA_W = 278, VAA_H = 64;
const VAA_CX = VAA_X + VAA_W / 2, VAA_BOTTOM = VAA_Y + VAA_H;  // 595 / 286

const NEW_X = 826, NEW_Y = 98, NEW_W = 298, NEW_H = 98;
const NEW_CX = NEW_X + NEW_W / 2;                              // 975
const VAB_X = 826, VAB_Y = 222, VAB_W = 298, VAB_H = 64;
const VAB_LEFT = VAB_X, VAB_CX = VAB_X + VAB_W / 2, VAB_BOTTOM = VAB_Y + VAB_H; // 826 / 975 / 286

const DK_X = 680, DK_Y = 418, DK_W = 200, DK_H = 120;
const DK_TOP = DK_Y;                                           // 418

const C_X = 60, C_Y = 430, C_W = 260, C_H = 84;
const C_RIGHT = C_X + C_W;                                     // 320
const CHIPS_Y = 590;

const W_ATTACH_A = [[720, DK_TOP], [720, 300], [VAA_CX, 300], [VAA_CX, VAA_BOTTOM]];
const W_ATTACH_B = [[840, DK_TOP], [840, 300], [VAB_CX, 300], [VAB_CX, VAB_BOTTOM]];
const W_CTRL_VB  = [[190, C_Y], [190, 340], [810, 340], [810, 252], [VAB_LEFT, 252]];

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
  const innerBox = box({ x: x + 24, y: y + 40, w: w - 48, h: 42, label: 'app', sublabel: 'uses vol-1', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function frameBox(x, y, w, h, label) {
  const b = box({ x, y, w, h, label: '', sublabel: '', cat: 'storage' });
  b.querySelector('.scheme-box-rect').style.fill = 'none';
  b.appendChild(text({ class: 'scheme-label dim', x: x + 14, y: y + 22, 'text-anchor': 'start' }, [label]));
  return b;
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
      'aria-label': 'Multi-Attach error: an RWO volume is attached to node-a and a new Pod is scheduled onto node-b before the old attachment is gone, so the attach controller cannot attach the same volume twice and the new Pod hangs in ContainerCreating with a Multi-Attach error until the old VolumeAttachment is removed, which for an unreachable node waits out the roughly six minute force-detach timeout, and a Deployment using RWO storage with a rolling update hits this on every rollout while Recreate avoids it',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const naFrame = frameBox(NA_X, NA_Y, NA_W, NA_H, 'node-a');
    const nbFrame = frameBox(NB_X, NB_Y, NB_W, NB_H, 'node-b');

    const oldPod = podBlock({ x: OLD_X, y: OLD_Y, w: OLD_W, h: OLD_H, label: 'Pod web-0 (old)', sublabel: 'Running' });
    const vaA = box({ x: VAA_X, y: VAA_Y, w: VAA_W, h: VAA_H, label: 'VolumeAttachment va-a', sublabel: 'node-a, attached: true', cat: 'storage' });
    const newPod = podBlock({ x: NEW_X, y: NEW_Y, w: NEW_W, h: NEW_H, label: 'Pod web-0 (new)', sublabel: 'ContainerCreating' });
    newPod.group.style.opacity = '0';
    const vaB = box({ x: VAB_X, y: VAB_Y, w: VAB_W, h: VAB_H, label: 'VolumeAttachment va-b', sublabel: 'wanted', cat: 'storage' });
    vaB.style.opacity = '0';

    const ctrl = box({ x: C_X, y: C_Y, w: C_W, h: C_H, label: 'attach/detach controller', sublabel: 'RWO: one node at a time', cat: 'storage' });
    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'vol-1 RWO', cat: 'storage' });

    // va-a RECORDS that the disk is attached to node-a. It is a standing relationship, not a live
    // hop (no ball ever rides it), so it is an arrowhead-free dashed path: an arrow here would read as
    // traffic that never arrives. It dims together with va-a once the attachment is torn down.
    const wAttachA = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', d: 'M ' + W_ATTACH_A.map((p, i) => (i ? 'L ' : '') + p[0] + ' ' + p[1]).join(' '), fill: 'none' });
    const wAttachB = pathArrow({ points: W_ATTACH_B, dashed: true, dim: true, color: 'storage' });
    const wCtrlVb  = pathArrow({ points: W_CTRL_VB, dashed: true, dim: true, color: 'storage' });
    wAttachB.style.opacity = '0';
    wCtrlVb.style.opacity = '0';

    const errLbl = text({ class: 'scheme-label code dim', x: NEW_CX, y: 214, 'text-anchor': 'middle' }, [' ']);
    const ctrlLbl = text({ class: 'scheme-label code dim', x: 500, y: 356, 'text-anchor': 'middle' }, [' ']);

    const modeChip = valChip({ x: 60,  y: CHIPS_Y, w: 300, h: 32, name: 'access mode', value: 'ReadWriteOnce', cat: 'storage' });
    const vaChip   = valChip({ x: 384, y: CHIPS_Y, w: 340, h: 32, name: 'va-a', value: 'attached to node-a', cat: 'storage' });
    const podChip  = valChip({ x: 748, y: CHIPS_Y, w: 340, h: 32, name: 'new Pod', value: 'not scheduled', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order: node frames behind, then blocks, then wires + labels, then chips, then the packet layer.
    [naFrame, nbFrame].forEach(el => root.appendChild(el));
    [ctrl, disk, oldPod.group, vaA, newPod.group, vaB].forEach(el => root.appendChild(el));
    [wAttachA, wAttachB, wCtrlVb].forEach(el => root.appendChild(el));
    [errLbl, ctrlLbl].forEach(el => root.appendChild(el));
    [modeChip, vaChip, podChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, oldPod: oldPod.group, oldBox: oldPod.innerBox, vaA,
      newPod: newPod.group, newBox: newPod.innerBox, vaB, ctrl, disk, wAttachA, wAttachB, wCtrlVb,
      modeChip, vaChip, podChip,
      wires: { err: errLbl, ctrl: ctrlLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode, va, pod }) {
  setVal(s.refs.modeChip, mode);
  setVal(s.refs.vaChip, va);
  setVal(s.refs.podChip, pod);
}

function clearHL(s) {
  clearHighlights(s, ['vaA', 'vaB', 'ctrl', 'disk', 'oldBox', 'newBox',
    'modeChip', 'vaChip', 'podChip'], [s.refs.oldPod, s.refs.newPod]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The disk vol-1 is ReadWriteOnce, so it may be attached to only one node at a time. Right now it is attached to node-a, where the old Pod runs happily. Its VolumeAttachment records node-a and attached true. Everything is fine while nothing moves.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-a', pod: 'not scheduled' });
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '0';
      s.refs.vaB.style.opacity = '0';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wCtrlVb.style.opacity = '0';
      s.refs.vaA.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
    },
  },
  {
    id: 'reschedule',
    duration: 2600,
    // The new Pod is the actor arriving, so it pulses as it comes up dim on node-b.
    narration: 'Now the Pod moves. A rolling update creates a replacement on node-b before the old one is fully gone, or node-a stops answering and the Pod is rescheduled. Either way a new Pod appears on node-b and it wants the same volume vol-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-a', pod: 'scheduled on node-b' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.vaB.style.opacity = '0';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wCtrlVb.style.opacity = '0';
      s.refs.vaA.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      // The new Pod is present on node-b by the end of this step, still not running.
      s.refs.newPod.style.opacity = '0.5';
      if (ctx.reduced) return;
      s.refs.newPod.style.opacity = '0';
      ctx.register(s.refs.newPod.animate([{ opacity: 0 }, { opacity: 0.5 }], { duration: 500, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      pulsePodDim(s.refs.newPod, ctx, 300, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'wantattach',
    duration: 2800,
    narration: 'The attach and detach controller does its job and tries to attach vol-1 to node-b, which means writing a second VolumeAttachment. But the volume is RWO and the first attachment still exists, so a second one cannot be satisfied while the first is live.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-a', pod: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.newPod.style.opacity = '0.5';
      s.refs.vaA.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      setBoxSublabel(s.refs.vaB, 'wanted, blocked');
      setWire(s, 'ctrl', 'attach to node-b');
      // The wanted attachment object is on screen by the end of this step, still blocked.
      s.refs.vaB.style.opacity = '1';
      s.refs.wCtrlVb.style.opacity = '1';
      if (ctx.reduced) { s.refs.vaB.classList.add('highlight'); return; }
      const c = routePacket(s, ctx, W_CTRL_VB, { cat: 'storage' });
      ridingLabel(s, ctx, 'attach node-b', W_CTRL_VB);
      lightBoxAt(s.refs.vaB, ctx, c.arrivalMs);
    },
  },
  {
    id: 'error',
    duration: 2600,
    // The stuck Pod is the actor, so it pulses. No block flash on a Pod step.
    narration: 'So the new Pod hangs. Its events show Multi-Attach error for volume vol-1, already used by another node. The container never starts because kubelet will not mount a disk that is not attached to its node, and the attach is refused while node-a still holds it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-a', pod: 'Multi-Attach error' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.newPod.style.opacity = '0.5';
      s.refs.vaB.style.opacity = '1';
      s.refs.wCtrlVb.style.opacity = '1';
      s.refs.vaA.classList.add('highlight');
      s.refs.vaB.classList.add('highlight');
      setBoxSublabel(s.refs.vaB, 'wanted, blocked');
      setWire(s, 'err', 'Multi-Attach error');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.newPod, ctx, 0, { from: 0.5, peak: 0.85 });
    },
  },
  {
    id: 'wait',
    duration: 2800,
    narration: 'What clears it is the old attachment going away. If node-a shut down cleanly its Pod is deleted and the attachment with it. If node-a is merely unreachable, Kubernetes will not assume the Pod is dead, so it waits out the force-detach timeout, roughly six minutes, before ripping the attachment away. The new Pod stays stuck for that whole window.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'force-detach in ~6 min', pod: 'Multi-Attach error' });
      s.refs.oldPod.style.opacity = '0.5';
      s.refs.newPod.style.opacity = '0.5';
      s.refs.vaB.style.opacity = '1';
      s.refs.wCtrlVb.style.opacity = '1';
      s.refs.vaA.classList.add('highlight');
      setBoxSublabel(s.refs.vaA, 'node-a, held ~6 min');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.newPod, ctx, 0, { from: 0.5, peak: 0.8 });
    },
  },
  {
    id: 'clear',
    duration: 3200,
    narration: 'Once the old VolumeAttachment is removed, the disk detaches from node-a and the controller finally attaches it to node-b. kubelet mounts it, and the new Pod starts. The delay was never the mount, it was waiting to be sure the old node had let go.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-b', pod: 'Running' });
      setBoxSublabel(s.refs.vaB, 'node-b, attached: true');
      // The old attachment is gone and the old Pod with it. The new Pod runs.
      s.refs.oldPod.style.opacity = '0.25';
      s.refs.vaA.style.opacity = '0.25';
      s.refs.wAttachA.style.opacity = '0.25';
      s.refs.vaB.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '1';
      s.refs.wCtrlVb.style.opacity = '0';
      s.refs.newPod.style.opacity = '1';
      s.refs.vaB.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) { s.refs.newBox.classList.add('highlight'); return; }
      const a = routePacket(s, ctx, W_ATTACH_B, { cat: 'storage' });
      ridingLabel(s, ctx, 'attach node-b', W_ATTACH_B);
      s.refs.newPod.style.opacity = '0.5';
      ctx.register(s.refs.newPod.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: a.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.newPod, ctx, a.arrivalMs);
      lightBoxAt(s.refs.newBox, ctx, a.arrivalMs);
    },
  },
  {
    id: 'fix',
    duration: 2600,
    // Conceptual close: no packet and no Pod acting. It is packet-less and pod-less, so the contended
    // disk gives one sanctioned block flash as the lesson lands, keeping the frame from reading frozen.
    narration: 'This is why a Deployment with RWO storage and a RollingUpdate strategy stalls on every rollout: the new Pod is created before the old one dies, so for a moment both want the same one-node volume. Switching that Deployment to the Recreate strategy removes the old Pod first, and the disk is free before the new Pod needs it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', va: 'attached to node-b', pod: 'Running' });
      setBoxSublabel(s.refs.vaB, 'node-b, attached: true');
      s.refs.oldPod.style.opacity = '0.25';
      s.refs.vaA.style.opacity = '0.25';
      s.refs.wAttachA.style.opacity = '0.25';
      s.refs.vaB.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.vaB.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      setWire(s, 'ctrl', 'use Recreate, not RollingUpdate');
      flashChips(s, ctx, ['disk'], 200);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
