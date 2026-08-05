import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, node, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setBoxSublabel, setPodSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel, revealAt, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-multi-attach-error


const LEFT_X = 400;

const NODE_H = 156, BAND_H = 76, VA_H = 76, DK_H = 86, CHIP_H = 34;
const G_NODE_BAND = 56, G_BAND_VA = 56, G_VA_DK = 48, G_DK_CHIPS = 22;

const STACK_H = NODE_H + G_NODE_BAND + BAND_H + G_BAND_VA + VA_H + G_VA_DK + DK_H + G_DK_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 18, and the bottom margin matches it

const NODE_W = 180, NODE_GAP = 40, NODE_PAD = 16;
const NODE_Y = STACK_TOP;                                // 18
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 174
const NODE_A_X = LEFT_X;                                 // 400
const NODE_B_X = LEFT_X + NODE_W + NODE_GAP;             // 620
const CONTENT_W = NODE_W * 2 + NODE_GAP;                 // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600: canvas center, every tier uses it
const CX_A = NODE_A_X + NODE_W / 2;                      // 490
const CX_B = NODE_B_X + NODE_W / 2;                      // 710, and (490 + 710) / 2 == CONTENT_CX

const POD_W = NODE_W - NODE_PAD * 2;                     // 148
const POD_Y = NODE_Y + 28, POD_H = 102;                  // 46
const POD_BOTTOM = POD_Y + POD_H;                        // 148, 26 clear of the node floor
const POD_A_X = NODE_A_X + NODE_PAD;                     // 416
const POD_B_X = NODE_B_X + NODE_PAD;                     // 636

const APP_DY = 30, APP_H = 44;

const BAND_W = 300;
const BAND_X = CONTENT_CX - BAND_W / 2;                  // 450..750
const BAND_Y = NODE_BOTTOM + G_NODE_BAND;                // 227
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 227 / 303
const BAND_MID_Y = BAND_Y + BAND_H / 2;                  // 265: where both output lanes leave
const BAND_LEFT = BAND_X, BAND_RIGHT = BAND_X + BAND_W;  // 450 / 750

const VA_W = 232;                                        // storage family box width, from csi-architecture
const VA_Y = BAND_BOTTOM + G_BAND_VA;                    // 359
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + VA_H;            // 359 / 435
const VA_A_CX = 420;
const VA_B_CX = 2 * CONTENT_CX - VA_A_CX;                // 780, so the pair centers on CONTENT_CX
const VA_A_X = VA_A_CX - VA_W / 2;                       // 304..536
const VA_B_X = VA_B_CX - VA_W / 2;                       // 664..896

const DK_W = 240;
const DK_Y = VA_BOTTOM + G_VA_DK;                        // 483
const DK_X = CONTENT_CX - DK_W / 2;                      // 480
const DK_TOP = DK_Y;                                     // 483
const DK_SIDE_Y = DK_Y + DK_H / 2;                       // 526
const DK_LEFT = DK_X, DK_RIGHT = DK_X + DK_W;            // 480 / 720

const BAND_LBL_Y = 337;
const CHIPS_Y = DK_Y + DK_H + G_DK_CHIPS;                // 588

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / new Pod / blocked by
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

const NODE_BAND_TURN_Y = (NODE_BOTTOM + BAND_TOP) / 2;             // 199
const W_NODE_BAND = [[CX_B, NODE_BOTTOM], [CX_B, NODE_BAND_TURN_Y], [CONTENT_CX, NODE_BAND_TURN_Y], [CONTENT_CX, BAND_TOP]];
const W_BAND_VA_A = [[BAND_LEFT, BAND_MID_Y], [VA_A_CX, BAND_MID_Y], [VA_A_CX, VA_TOP]];
const W_BAND_VA_B = [[BAND_RIGHT, BAND_MID_Y], [VA_B_CX, BAND_MID_Y], [VA_B_CX, VA_TOP]];
const W_VAA_DISK  = [[VA_A_CX, VA_BOTTOM], [VA_A_CX, DK_SIDE_Y], [DK_LEFT, DK_SIDE_Y]];
const W_VAB_DISK  = [[VA_B_CX, VA_BOTTOM], [VA_B_CX, DK_SIDE_Y], [DK_RIGHT, DK_SIDE_Y]];

// The catalog value for a Pod that has been deleted or evicted. It is the only opacity a Pod takes
// on this card: a Pod that merely has not started yet is drawn at full strength, because it exists.

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, label, sublabel }) {
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 14, y: POD_Y + APP_DY, w: POD_W - 28, h: APP_H, label: 'app', sublabel: 'uses PV-web', role: 'storage' });
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
      'aria-label': 'A Multi-Attach error. The ReadWriteOnce volume PV-web is attached to Node-1 through the VolumeAttachment va-1, and the Pod there is using it. A replacement Pod is scheduled onto Node-2, so the attach and detach controller tries to write a second VolumeAttachment for the same volume, which ReadWriteOnce forbids. The request stops at the controller, the new Pod hangs in ContainerCreating reporting a Multi-Attach error, and nothing changes until the first attachment is removed. Node-1 stays healthy throughout: the volume is held by a Pod that is still running, and the rollout is waiting for the new Pod to become ready before it deletes that old Pod, so the two sides wait on each other. Once the old Pod is deleted va-1 is removed, the disk detaches from Node-1, the controller attaches it to Node-2, and the new Pod starts. A Deployment on ReadWriteOnce storage hits this whenever the replacement Pod lands on another Node, because the new Pod is created before the old one is deleted, and switching that Deployment to the Recreate strategy avoids it.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' });
    [nodeA, nodeB].forEach(n => {
      const l = n.querySelector('.scheme-node-label');
      if (l) l.setAttribute('y', 14);
    });

    const podOld = podBlock({ x: POD_A_X, label: 'Pod web-0 old', sublabel: 'Running' });
    const podNew = podBlock({ x: POD_B_X, label: 'Pod web-0 new', sublabel: 'ContainerCreating' });

    const ctrl = box({
      x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Attach/Detach controller', sublabel: 'RWO: one node at a time', role: 'storage',
    });

    const vaA = box({ x: VA_A_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-1', sublabel: 'node-1, attached: true', role: 'storage' });
    const vaB = box({ x: VA_B_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-2', sublabel: 'wanted, not written', role: 'storage' });

    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV-web RWO', role: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as the rest of storage does.
    const dl = disk.querySelector('.scheme-cylinder-label');
    if (dl) dl.setAttribute('y', DK_H / 2 + 10);

    const wNodeBand = pathArrow({ points: W_NODE_BAND, dashed: true, dim: true, role: 'storage' });
    const wBandVaA  = pathArrow({ points: W_BAND_VA_A, dashed: true, dim: true, role: 'storage' });
    const wBandVaB  = pathArrow({ points: W_BAND_VA_B, dashed: true, dim: true, role: 'storage' });
    const wVaADisk  = pathArrow({ points: W_VAA_DISK,  dashed: true, dim: true, role: 'storage' });
    const wVaBDisk  = pathArrow({ points: W_VAB_DISK,  dashed: true, dim: true, role: 'storage' });

    const bandLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: BAND_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const modeChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'accessModes', value: 'ReadWriteOnce', role: 'storage' });
    const attChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'attached to', value: 'node-1',        role: 'storage' });
    const podChip   = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'new Pod',     value: 'not scheduled', role: 'storage' });
    const blockChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'blocked by',  value: 'nothing',       role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [nodeA, nodeB, ctrl, vaA, vaB, disk, podOld.group, podNew.group].forEach(el => root.appendChild(el));
    [wNodeBand, wBandVaA, wBandVaB, wVaADisk, wVaBDisk].forEach(el => root.appendChild(el));
    root.appendChild(bandLbl);
    [modeChip, attChip, podChip, blockChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      nodeA, nodeB,
      podOld: podOld.group, oldApp: podOld.innerBox,
      podNew: podNew.group, newApp: podNew.innerBox,
      ctrl, vaA, vaB, disk,
      wNodeBand, wBandVaA, wBandVaB, wVaADisk, wVaBDisk,
      modeChip, attChip, podChip, blockChip,
      wires: { band: bandLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode = 'ReadWriteOnce', attached, newPod, blocked }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.attChip, attached);
  setChip(s.refs.podChip, newPod);
  setChip(s.refs.blockChip, blocked);
}

function setStage(s, {
  nodeBOp = 0,      // node-2 and everything in it: the second claimant does not exist yet
  oldOp = 1, oldSub = 'Running',
  newOp = 0, newSub = 'ContainerCreating',
  vaAOp = 1, vaASub = 'node-1, attached: true',
  // OPACITY.pending is va-2 as a WANT, not an object: the controller refuses before writing, so no
  // va-2 exists through the blocked stretch. A ghost, not a hole, and full only when it is written.
  vaBOp = 0, vaBSub = 'wanted, not written',
  linkA = 1,        // the column-a lanes: controller to va-1, and va-1 down to the disk
  linkB = 0,        // the column-b lanes: only drawn once a ball actually rides them
  linkNew = 0,      // the node-2 request lane: hidden until node-2 exists
} = {}) {
  s.refs.nodeB.style.opacity = String(nodeBOp);
  s.refs.podOld.style.opacity = String(oldOp);
  setPodSublabel(s.refs.podOld, oldSub);
  s.refs.podNew.style.opacity = String(newOp);
  setPodSublabel(s.refs.podNew, newSub);
  s.refs.vaA.style.opacity = String(vaAOp);
  setBoxSublabel(s.refs.vaA, vaASub);
  s.refs.vaB.style.opacity = String(vaBOp);
  setBoxSublabel(s.refs.vaB, vaBSub);
  s.refs.wBandVaA.style.opacity = String(linkA);
  s.refs.wVaADisk.style.opacity = String(linkA);
  s.refs.wBandVaB.style.opacity = String(linkB);
  s.refs.wVaBDisk.style.opacity = String(linkB);
  s.refs.wNodeBand.style.opacity = String(linkNew);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['ctrl', 'vaA', 'vaB', 'disk', 'oldApp', 'newApp',
    'modeChip', 'attChip', 'podChip', 'blockChip'], [s.refs.podOld, s.refs.podNew]);
  clearWires(s);
}

// The mirror of lightBoxAt, and it takes its empty keyframe list for the same reason: a timer that
// names a property costs its target a composited layer for the wait. Reasoning is in scheme-kit.js.
function unlightAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.classList.remove('highlight'); return; }
  const a = el.animate([], { duration: 1, delay });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setStage(s, {});
      setChips(s, { attached: 'node-1', newPod: 'not scheduled', blocked: 'nothing' });
    },
  },
  {
    id: 'reschedule',
    duration: 2600,
    narration: 'Now the Pod moves. A rolling update stands the replacement up on Node-2 while the old one is still running, which is exactly what RollingUpdate is designed to do. Node-1 stays healthy throughout. A second Pod now exists on the other Node, and it wants the same volume.',
    enter(s, ctx) {
      resetStep(s);
      setStage(s, { nodeBOp: 1, newOp: 1 });
      setChips(s, { attached: 'node-1', newPod: 'scheduled on node-2', blocked: 'nothing' });
      if (ctx.reduced) return;
      // The node frame and the Pod arrive together as one event, because that is what scheduling onto
      // a second node looks like: the claimant appears, frame and contents at once.
      s.refs.nodeB.style.opacity = '0';
      s.refs.podNew.style.opacity = '0';
      const rise = el => ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      rise(s.refs.nodeB);
      rise(s.refs.podNew);
      pulsePod(s.refs.podNew, ctx, 300);
    },
  },
  {
    id: 'wantattach',
    duration: 3200,
    narration: 'The attach and detach controller tries to attach the volume to Node-2, which means writing a second VolumeAttachment. The request reaches the controller and stops. PV-web is ReadWriteOnce and the first attachment is still live, so the refusal comes before anything is written and va-2 stays a want rather than an object.',
    enter(s, ctx) {
      resetStep(s);
      setStage(s, { nodeBOp: 1, newOp: 1, linkNew: 1, vaBOp: OPACITY.pending });
      setChips(s, { attached: 'node-1', newPod: 'ContainerCreating', blocked: 'va-1 on node-1' });
      setWire(s, 'band', 'RWO: cannot attach twice');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); return; }
      // The request lane is drawn for the first time on this step, so it eases in rather than popping
      // into place, and it finishes arriving before the ball that rides it departs.
      s.refs.wNodeBand.style.opacity = '0';
      ctx.register(s.refs.wNodeBand.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      // Up-arrow ordering: the Pod blinks first because it is the actor, the request leaves once the
      // blink has landed, and the controller lights when the ball reaches it.
      pulsePod(s.refs.podNew, ctx, 0);
      const req = routePacket(s, ctx, W_NODE_BAND, { delay: BEAT.afterPulse, role: 'storage' });
      ridingLabel(s, ctx, 'attach node-2', W_NODE_BAND, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ctrl, ctx, req.arrivalMs);
      // The WANT appears at the placeholder shade as the refusal lands, and is never lit: nothing
      // was granted. NOT the kit revealAt, which lands on full.
      s.refs.vaB.style.opacity = '0';
      ctx.register(s.refs.vaB.animate([{ opacity: 0 }, { opacity: OPACITY.pending }],
        { duration: FADE.in, delay: req.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'error',
    duration: 2600,
    // The stuck Pod is the actor, so it pulses and nothing else moves. va-1 lights because it is the
    // blocker: the reader should be looking at the OLD attachment while reading this sentence.
    narration: 'So the new Pod hangs. Its events read Multi-Attach error for volume PV-web, already used by the old Pod on Node-1. The container never starts, because Kubelet will not mount a disk that is not attached to the Node it runs on, and the attach is refused.',
    enter(s, ctx) {
      resetStep(s);
      setStage(s, { nodeBOp: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending });
      setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'va-1 on node-1' });
      setWire(s, 'band', 'first attachment still live');
      s.refs.vaA.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.podNew, ctx, 0);
    },
  },
  {
    id: 'wait',
    duration: 2800,
    narration: 'What clears it is the old attachment going away, and nothing else will. The controller will not delete va-1 while the old Pod runs, and the rollout will not delete that Pod until the new one is ready. Each side waits on the other, which is why this reads as a hang.',
    enter(s) {
      resetStep(s);
      setStage(s, {
        nodeBOp: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending,
        vaASub: 'node-1, still held',
      });
      setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'old Pod running' });
      setWire(s, 'band', 'each side waits for the other');
      s.refs.vaA.classList.add('highlight');
    },
  },
  {
    id: 'detach',
    duration: 3400,
    narration: 'Nothing inside the rollout can break the deadlock, so it takes a hand from outside: the old Pod is deleted. The controller removes va-1, the volume detaches, and for a moment it belongs to nobody. On a healthy Node this takes seconds, because Node-1 can be asked to unmount and it answers.',
    enter(s, ctx) {
      resetStep(s);
      // Static end state: va-1 and its lanes are gone, the old Pod with them, the disk is free.
      setStage(s, {
        nodeBOp: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
        newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: OPACITY.pending,
        vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
      });
      setChips(s, { attached: 'nothing', newPod: 'Multi-Attach error', blocked: 'nothing' });
      setWire(s, 'band', 'delete va-1, then detach');
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      s.refs.vaA.style.opacity = '1';
      s.refs.wBandVaA.style.opacity = '1';
      s.refs.wVaADisk.style.opacity = '1';
      s.refs.podOld.style.opacity = '1';
      const del = routePacket(s, ctx, W_BAND_VA_A, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'delete va-1', W_BAND_VA_A, { delay: BEAT.lead });
      lightBoxAt(s.refs.vaA, ctx, del.arrivalMs);
      const det = routePacket(s, ctx, W_VAA_DISK, { delay: del.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'detach', W_VAA_DISK, { delay: del.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, det.arrivalMs);
      const fade = (elx, to) => ctx.register(elx.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.out, delay: det.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
      fade(s.refs.vaA, OPACITY.terminated);
      fade(s.refs.wBandVaA, OPACITY.terminated);
      fade(s.refs.wVaADisk, OPACITY.terminated);
      fade(s.refs.podOld, OPACITY.terminated);
      unlightAt(s.refs.vaA, ctx, det.arrivalMs + FADE.out);
    },
  },
  {
    id: 'attach',
    duration: 3800,
    narration: 'With the volume free the controller writes va-2, the driver attaches the disk to Node-2, Kubelet mounts it, and the new Pod starts. None of that was slow. The whole stall went on waiting for the old Pod to be deleted, not on any storage operation.',
    enter(s, ctx) {
      resetStep(s);
      setStage(s, {
        nodeBOp: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
        newOp: 1, newSub: 'Running', linkNew: 1,
        vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
        vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
      });
      setChips(s, { attached: 'node-2', newPod: 'Running', blocked: 'nothing' });
      setWire(s, 'band', 'now attach to node-2');
      // Lit from entry for the same reason as the step before: the controller is where the write
      // comes from, so it cannot be dark while a ball is leaving it.
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) { s.refs.vaB.classList.add('highlight'); s.refs.disk.classList.add('highlight'); return; }
      const wr = routePacket(s, ctx, W_BAND_VA_B, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'write va-2', W_BAND_VA_B, { delay: BEAT.lead });
      // This is the step that actually creates va-2, so it rises from the want to the object as the
      // write lands rather than being at full strength before the ball has left.
      revealAt(s.refs.vaB, ctx, wr.arrivalMs, OPACITY.pending);
      lightBoxAt(s.refs.vaB, ctx, wr.arrivalMs);
      const att = routePacket(s, ctx, W_VAB_DISK, { delay: wr.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'attach', W_VAB_DISK, { delay: wr.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, att.arrivalMs);
      pulsePod(s.refs.podNew, ctx, att.arrivalMs + BEAT.afterHop);
    },
  },
  {
    id: 'fix',
    duration: 3400,
    narration: 'This is why a Deployment on ReadWriteOnce storage stalls whenever the replacement Pod lands on another Node. RollingUpdate creates the new Pod before deleting the old one, so both want one single-node volume and the new one is refused. Set it to Recreate, which deletes the old Pod before making the new one, the way a StatefulSet handles an ordinal.',
    enter(s) {
      resetStep(s);
      setStage(s, {
        nodeBOp: 1, oldOp: OPACITY.terminated, oldSub: 'deleted',
        newOp: 1, newSub: 'Running', linkNew: 1,
        vaAOp: OPACITY.terminated, vaASub: 'deleted', linkA: OPACITY.terminated,
        vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
      });
      setChips(s, { attached: 'node-2', newPod: 'Running', blocked: 'nothing' });
      setWire(s, 'band', 'Recreate, not RollingUpdate');
      s.refs.vaB.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
