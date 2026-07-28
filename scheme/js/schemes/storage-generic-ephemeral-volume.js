import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY, revealAt } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-generic-ephemeral-volume


const CX = 600;

// 226 x 110 is the storage family Pod (storage-csi-attach-mount sets it). This card was drawing a
// 300 x 116 one, which made the Pod the heaviest object on a card whose subject is what hangs below it.
const POD_W = 226, POD_H = 110, POD_Y = 36;
const POD_X = CX - POD_W / 2, POD_BOTTOM = POD_Y + POD_H;               // 487 / 146

const ROW_Y = 212, ROW_H = 72, ROW_BOTTOM = ROW_Y + ROW_H;              // 284
const ROW_MY = ROW_Y + ROW_H / 2;                                       // 248
const CLAIM_W = 280, SIDE_W = 280, SIDE_SPREAD = 340;
const SC_CX = CX - SIDE_SPREAD, PROV_CX = CX + SIDE_SPREAD;             // 260 / 940

const PV_W = 200, PV_H = 110, PV_Y = 350;
const PV_TOP = PV_Y, PV_MY = PV_Y + PV_H / 2;                           // 350 / 405

const CAPTION_Y = 500;
const CHIPS_Y = 570;              // 34 above the canvas floor, equal to the top margin

const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];
const W_CREATE     = [[PROV_CX, ROW_BOTTOM], [PROV_CX, PV_MY], [CX + PV_W / 2, PV_MY]];
const W_DOWN_HIGH  = [[CX, POD_BOTTOM], [CX, ROW_Y]];
const W_DOWN_LOW   = [[CX, ROW_BOTTOM], [CX, PV_TOP]];
const W_UP_HIGH    = [[CX, ROW_Y], [CX, POD_BOTTOM]];
const W_UP_LOW     = [[CX, PV_TOP], [CX, ROW_BOTTOM]];

function vanishAt(el, ctx, delay = 0, to = OPACITY.terminated) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.out, delay, fill: 'forwards', easing: 'ease-in' }));
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // Centred in the band the pod primitive leaves free between its label (baseline 16) and its
  // sublabel (baseline h - 8).
  const innerBox = box({ x: POD_X + 24, y: POD_Y + 33, w: POD_W - 48, h: 44, label: 'app', sublabel: 'writes /scratch', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral mints a real PVC with dynamic provisioning and a real CSI mount, so unlike emptyDir it can be large and of a specific class and even snapshotted, but the PVC carries an ownerReference to the Pod and is garbage-collected the moment the Pod is deleted, so its lifetime is exactly the lifetime of the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock();

    const pvc = box({ x: CX - CLAIM_W / 2, y: ROW_Y, w: CLAIM_W, h: ROW_H, label: 'PVC app-0-scratch', sublabel: 'owned by Pod', role: 'storage' });
    pvc.style.opacity = '0';
    const sc = box({ x: SC_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'StorageClass fast-ssd', sublabel: 'ebs.csi.aws.com', role: 'storage' });
    const prov = box({ x: PROV_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'External-provisioner', sublabel: 'driver: ebs.csi.aws.com', role: 'storage' });

    const pv = cylinder({ x: CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-e91c', role: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is
    // not part of the visible front face. Re-centre on the face, derived from the height.
    const pvLbl = pv.querySelector('.scheme-cylinder-label');
    if (pvLbl) pvLbl.setAttribute('y', PV_H / 2 + 10);
    pv.style.opacity = '0';

    const wClaimProv = lane(W_CLAIM_PROV);
    const wCreate = lane(W_CREATE);
    const wDownHigh = lane(W_DOWN_HIGH);
    const wDownLow = lane(W_DOWN_LOW);
    const wUpHigh = lane(W_UP_HIGH);
    const wUpLow = lane(W_UP_LOW);
    [wClaimProv, wCreate, wDownHigh, wDownLow, wUpHigh, wUpLow].forEach(w => { w.style.opacity = '0'; });

    const ownerLbl = text({ class: 'scheme-label code dim', x: CX + 36, y: 184, 'text-anchor': 'start' }, [' ']);
    const mountLbl = text({ class: 'scheme-label code dim', x: CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const podChip  = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',      value: 'Pending',      role: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC',      value: 'none',         role: 'storage' });
    const backChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'backing',  value: 'CSI dynamic',  role: 'storage' });
    const lifeChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'lifetime', value: 'tied to Pod',  role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [podB.group, pvc, sc, prov, pv].forEach(el => root.appendChild(el));
    [wClaimProv, wCreate, wDownHigh, wDownLow, wUpHigh, wUpLow, ownerLbl, mountLbl].forEach(el => root.appendChild(el));
    [podChip, pvcChip, backChip, lifeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podB: podB.group, podBox: podB.innerBox, pvc, sc, prov, pv,
      wClaimProv, wCreate, wDownHigh, wDownLow, wUpHigh, wUpLow,
      podChip, pvcChip, backChip, lifeChip,
      wires: { owner: ownerLbl, mount: mountLbl },
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

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to report a mounted volume on the step that is still explaining the claim does not exist yet.
function setChips(s, { pod, pvc, back, life }) {
  setChip(s.refs.podChip, pod);
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.backChip, back);
  setChip(s.refs.lifeChip, life);
}

// The Pod is dim until it actually reaches Running.

const LANES = ['wClaimProv', 'wCreate', 'wDownHigh', 'wDownLow', 'wUpHigh', 'wUpLow'];
function setStage(s, { podOn = OPACITY.pending, claim = OPACITY.pending, disk = 0, lanes = [] } = {}) {
  s.refs.podB.style.opacity = String(podOn);
  s.refs.pvc.style.opacity = String(claim);
  s.refs.pv.style.opacity = String(disk);
  LANES.forEach(k => { s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0'; });
}

function clearHL(s) {
  clearHighlights(s, ['pvc', 'sc', 'prov', 'pv', 'podBox',
    'podChip', 'pvcChip', 'backChip', 'lifeChip'], [s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod carries an inline volumeClaimTemplate under a field named ephemeral. It reads like a throwaway scratch volume, the same slot where emptyDir would go, but everything below this Pod is about to become real storage machinery rather than a folder on the Node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'none', back: 'CSI dynamic', life: 'tied to Pod' });
      setStage(s);
      setBoxSublabel(s.refs.pvc, 'owned by Pod');
    },
  },
  {
    id: 'mint',
    duration: 3000,
    narration: 'When the Pod is created, that inline template becomes a real PVC, in the same namespace and named after the Pod and the volume with a hyphen between them: app-0-scratch. It carries an ownerReference straight back at the Pod that spawned it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'Pending', back: 'CSI dynamic', life: 'tied to Pod' });
      setStage(s, { claim: 1, lanes: ['wDownHigh'] });
      // The claim is the RECEIVER here, so it earns its highlight on arrival, not at entry. The
      // reduced path applies it directly, which is the same end state without the motion.
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); return; }
      setStage(s, { lanes: ['wDownHigh'] });
      const own = routePacket(s, ctx, W_DOWN_HIGH, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'ownerReference', W_DOWN_HIGH, { delay: BEAT.lead });
      revealAt(s.refs.pvc, ctx, own.arrivalMs, OPACITY.pending);
      lightBoxAt(s.refs.pvc, ctx, own.arrivalMs);
    },
  },
  {
    id: 'provision',
    duration: 4200,
    narration: 'The claim names a real StorageClass, so the provisioner treats it like any other and calls CreateVolume for a fresh disk of the size and class asked for. This is what emptyDir cannot do: the volume can be large, on fast SSD, on any driver, and it can be snapshotted, cloned or resized.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'Pending', back: 'real disk, fast-ssd', life: 'tied to Pod' });
      setStage(s, { claim: 1, disk: 1, lanes: ['wClaimProv', 'wCreate'] });
      setWire(s, 'owner', 'ownerReference');
      // The claim is where the ball departs from, so it is lit at step entry. The class it names is
      // read here too. The provisioner and the disk are receivers and earn their highlights on arrival.
      s.refs.pvc.classList.add('highlight');
      s.refs.sc.classList.add('highlight');
      if (ctx.reduced) { s.refs.prov.classList.add('highlight'); s.refs.pv.classList.add('highlight'); return; }
      setStage(s, { claim: 1, disk: OPACITY.pending, lanes: ['wClaimProv', 'wCreate'] });
      const claim = routePacket(s, ctx, W_CLAIM_PROV, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'storageClassName: fast-ssd', W_CLAIM_PROV, { delay: BEAT.lead });
      lightBoxAt(s.refs.prov, ctx, claim.arrivalMs);
      const create = routePacket(s, ctx, W_CREATE, { delay: claim.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CREATE, { delay: claim.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.pv, ctx, create.arrivalMs, OPACITY.pending);
      lightBoxAt(s.refs.pv, ctx, create.arrivalMs);
    },
  },
  {
    id: 'mount',
    duration: 4200,
    narration: 'The volume is attached and mounted at /scratch inside the container over CSI, exactly as it would be for any ordinary PVC. The Pod starts and writes to a real, dynamically provisioned volume. Nothing about this path is a shortcut.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'tied to Pod' });
      setStage(s, { podOn: 1, claim: 1, disk: 1, lanes: ['wUpLow', 'wUpHigh'] });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pv.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      setWire(s, 'mount', 'attach and mount');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      setStage(s, { podOn: OPACITY.pending, claim: 1, disk: 1, lanes: ['wUpLow', 'wUpHigh'] });
      // Down-arrow into the Pod, so the balls lead and the pulse lands on the second one arriving.
      const low = routePacket(s, ctx, W_UP_LOW, { delay: BEAT.lead, role: 'storage' });
      const high = routePacket(s, ctx, W_UP_HIGH, { delay: low.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, '/scratch', W_UP_HIGH, { delay: low.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.podB.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: FADE.in, delay: high.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, high.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, high.arrivalMs);
    },
  },
  {
    id: 'owner',
    duration: 3000,
    narration: 'The ownerReference is what makes this ephemeral. A normal PVC outlives the Pods that use it, but this one belongs to the Pod, the way a container belongs to it. It also means anyone who can create a Pod can create a claim indirectly, without the right to create one directly.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'owned by Pod' });
      setStage(s, { podOn: 1, claim: 1, disk: 1 });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference: Pod app-0');
      // The owned claim holds its highlight and the card rests on it. No blink: see the PULSE MODEL
      // note at the top of the file.
    },
  },
  {
    id: 'gc',
    duration: 4200,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, and since the default reclaim policy is Delete, the volume goes with it. The scratch data lived exactly as long as the Pod did. A class set to Retain would leave the disk behind instead.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Deleted', pvc: 'deleted by GC', back: 'reclaimed', life: 'ended with Pod' });
      // Nothing is left pointing at anything: the lanes go out behind the cascade they carried, so the
      // closing frame is the collapsed column and nothing else.
      setStage(s, { podOn: OPACITY.terminated, claim: OPACITY.terminated, disk: OPACITY.terminated });
      setBoxSublabel(s.refs.pvc, 'Bound');
      setWire(s, 'owner', 'cascade delete');
      if (ctx.reduced) return;
      setStage(s, { podOn: 1, claim: 1, disk: 1, lanes: ['wDownHigh', 'wDownLow'] });
      // The Pod goes first, then the cascade walks down the column: the claim next, then the disk.
      ctx.register(s.refs.podB.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      const gcHigh = routePacket(s, ctx, W_DOWN_HIGH, { delay: FADE.out + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'ownerReference GC', W_DOWN_HIGH, { delay: FADE.out + BEAT.afterHop });
      // Each lane goes out behind the cascade it carried, so nothing is left pointing at a ghost.
      vanishAt(s.refs.pvc, ctx, gcHigh.arrivalMs);
      vanishAt(s.refs.wDownHigh, ctx, gcHigh.arrivalMs, 0);
      const gcLow = routePacket(s, ctx, W_DOWN_LOW, { delay: gcHigh.arrivalMs + BEAT.afterHop, role: 'storage' });
      vanishAt(s.refs.pv, ctx, gcLow.arrivalMs);
      vanishAt(s.refs.wDownLow, ctx, gcLow.arrivalMs, 0);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
