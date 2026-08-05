import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, node, cylinder, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setBoxSublabel, pulsePod, pulsePodDim, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, FADE, lightBoxAt, makeRidingLabel, OPACITY, revealAt, REVEAL_MS } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-topology-aware-provisioning


const CX = 600;

const SC_X = 400, SC_Y = 36, SC_W = 400, SC_H = 64;
const SC_RIGHT = SC_X + SC_W, SC_MY = SC_Y + SC_H / 2, SC_BOTTOM = SC_Y + SC_H;   // 800 / 68 / 100

const PVC_W = 260, PVC_H = 60, PVC_Y = 136;
const PVC_X = CX - PVC_W / 2, PVC_BOTTOM = PVC_Y + PVC_H;                          // 470 / 196

const NODE_W = 430, NODE_GAP = 60, NODE_Y = 236, NODE_H = 140;
const NODE_BOTTOM = NODE_Y + NODE_H;                                               // 376
const SPREAD = (NODE_W + NODE_GAP) / 2;                                            // 245
const NODE_CX = [CX - SPREAD, CX + SPREAD];                                        // 355 / 845
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);                                 // 140 / 630

const POD_W = 160, POD_H = 100;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2;                                       // 256

const DISK_W = 190, DISK_H = 90, DISK_Y = 444;
const DISK_TOP = DISK_Y;                                                           // 444
const DISK_MY = DISK_Y + DISK_H / 2;                                               // 489

const CROSS_Y = (NODE_BOTTOM + DISK_TOP) / 2;      // 410, centred in the gap it crosses
const PROV_WRAP_X = 1120;                          // outer margin, right of node-2 (ends 1060)
const CAPTION_Y = DISK_TOP - 14;
const CHIPS_Y = 588;

const W_PROV_B = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, DISK_MY]];
const W_PROV_A = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[0] + DISK_W / 2, DISK_MY]];
const wProv = i => (i === 0 ? W_PROV_A : W_PROV_B);
const W_MOUNT_B = [[NODE_CX[1], DISK_TOP], [NODE_CX[1], NODE_BOTTOM]];
// The doomed reach: node-2 would have to cross into zone-a for its disk. It leaves the node-2 frame
// bottom centre and enters the zone-a disk through its top centre.
const W_CROSS = [[NODE_CX[1], NODE_BOTTOM], [NODE_CX[1], CROSS_Y], [NODE_CX[0], CROSS_Y], [NODE_CX[0], DISK_TOP]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock() {
  const x = NODE_CX[1] - POD_W / 2;
  const cy = POD_Y + POD_H / 2;
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'mounts /data', containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 16, y: cy - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'read/write', role: 'storage' });
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
      'aria-label': 'Topology-aware provisioning with WaitForFirstConsumer: under Immediate binding a zonal disk is provisioned as soon as the claim exists, and no Node then both fits the Pod and lies in the disk zone, so the Pod stays Pending unschedulable with a volume node affinity conflict, while WaitForFirstConsumer defers binding until the Pod is scheduled so the volume is created in the Pod topology',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sc  = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'volumeBindingMode: Immediate', role: 'storage' });
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-0', sublabel: 'Pending', role: 'storage' });

    const nodes = NODE_X.map((x, i) => node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label: `node-${i + 1}` }));
    const zoneLbls = NODE_X.map((x, i) => text({ class: 'scheme-label code dim', x: x + NODE_W - 12, y: NODE_Y + 18, 'text-anchor': 'end' }, [i === 0 ? 'zone-a' : 'zone-b']));

    const disks = NODE_CX.map((cx, i) => {
      const c = cylinder({ x: cx - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: i === 0 ? 'Disk zone-a' : 'Disk zone-b', role: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', DISK_H / 2 + 10);
      c.style.opacity = '0';    // neither disk exists until it is provisioned
      return c;
    });

    const podB = podBlock();
    podB.group.style.opacity = '0';

    // The claim names its class: a relationship, not traffic, so a bare dashed path with no marker.
    const classRef = relationPath({ points: [[CX, SC_BOTTOM], [CX, PVC_Y]], role: 'storage', dash: '5 5' });

    const wProvA = lane(wProv(0));
    const wProvB = lane(wProv(1));
    const wMountB = lane(W_MOUNT_B);
    // The doomed cross-zone reach: the Pod aims at its stranded disk, entering the zone-a disk dead
    // centre on its top edge. A relationship rather than traffic, since the attach never succeeds.
    const crossLink = relationPath({ points: W_CROSS, role: 'storage' });
    [wProvA, wProvB, wMountB, crossLink].forEach(w => { w.style.opacity = '0'; });

    const failLbl = text({ class: 'scheme-label code dim', x: CX, y: CROSS_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const zoneCaps = NODE_CX.map(cx => text({ class: 'scheme-label code dim', x: cx, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']));

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const modeChip = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'mode',  value: 'Immediate', role: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC',   value: 'Pending',   role: 'storage' });
    const podChip  = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',   value: 'Pending',   role: 'storage' });
    const zoneChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'zones', value: 'unset',     role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [...nodes, ...zoneLbls, sc, pvc, ...disks, podB.group].forEach(el => root.appendChild(el));
    [classRef, wProvA, wProvB, wMountB, crossLink, failLbl, ...zoneCaps].forEach(el => root.appendChild(el));
    [modeChip, pvcChip, podChip, zoneChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, sc, pvc, nodeA: nodes[0], nodeB: nodes[1], diskA: disks[0], diskB: disks[1],
      podB: podB.group, podBox: podB.innerBox, crossLink, wProvA, wProvB, wMountB,
      modeChip, pvcChip, podChip, zoneChip,
      wires: { fail: failLbl, za: zoneCaps[0], zb: zoneCaps[1] },
      packetLayer,
    };
  }

  reset() { this.build(); }
}


// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to display the old binding mode on the step that just changed it.
function setChips(s, { mode, pvc, pod, zones }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.podChip, pod);
  setChip(s.refs.zoneChip, zones);
}

// The Pod is dim until it actually reaches Running: while it is only Pending it sits at this dim rest.
// A node the scheduler filters out for this Pod dims to here, the storage-family filtered value.

// Pins the visibility of EVERY element that is born mid-story, exactly as setChips pins every chip,
// so a step can never silently inherit a disk or a Pod from the step before it.
function setStage(s, { diskA = 0, diskB = 0, podOn = 0, cross = 0, nodeA = 1, nodeB = 1, mode = 'Immediate', pvcState = 'Pending', lanes = [] } = {}) {
  s.refs.diskA.style.opacity = String(diskA);
  s.refs.diskB.style.opacity = String(diskB);
  s.refs.podB.style.opacity = String(podOn);
  s.refs.crossLink.style.opacity = String(cross);
  s.refs.nodeA.style.opacity = String(nodeA);
  s.refs.nodeB.style.opacity = String(nodeB);
  ['wProvA', 'wProvB', 'wMountB'].forEach(k => { s.refs[k].style.opacity = lanes.includes(k) ? '1' : '0'; });
  setBoxSublabel(s.refs.sc, `volumeBindingMode: ${mode}`);
  setBoxSublabel(s.refs.pvc, pvcState);
}

function clearHL(s) {
  clearHighlights(s, ['sc', 'pvc', 'nodeA', 'nodeB', 'diskA', 'diskB', 'podBox',
    'modeChip', 'pvcChip', 'podChip', 'zoneChip'], [s.refs.podB]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Pending', pod: 'Pending', zones: 'unset' });
      setStage(s);
    },
  },
  {
    id: 'imm-provision',
    // 4400, not 3600: the provisioning route wraps the outer margin and runs the shelf midline into
    // the zone-a disk from the right, which anim-dump puts at a 3960ms span (ball plus its ripple).
    duration: 4400,
    narration: 'With Immediate the volume is provisioned the moment the claim appears, long before any Pod is scheduled. With no Pod to guide it, provisioning just picks a zone. Here it lands in zone-a, and the claim is Bound to a disk that now physically lives in zone-a, reachable only by Node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'Pending', zones: 'disk in zone-a' });
      setStage(s, { diskA: 1, pvcState: 'Bound', lanes: ['wProvA'] });
      // The class is where the ball departs from, so it is lit at step entry. The disk is the receiver
      // and earns its highlight only once the CreateVolume ball reaches it, not before.
      s.refs.sc.classList.add('highlight');
      setWire(s, 'za', 'provisioned here');
      if (ctx.reduced) { s.refs.diskA.classList.add('highlight'); return; }
      setStage(s, { diskA: OPACITY.pending, pvcState: 'Bound', lanes: ['wProvA'] });
      const pts = wProv(0);
      const prov = routePacket(s, ctx, pts, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', pts, { delay: BEAT.lead });
      // lightBoxAt is registered before revealAt so the reveal fade owns the disk opacity, and the
      // highlight class lands exactly on the ball's arrival.
      lightBoxAt(s.refs.diskA, ctx, prov.arrivalMs);
      revealAt(s.refs.diskA, ctx, prov.arrivalMs, OPACITY.pending);
    },
  },
  {
    id: 'imm-schedule',
    duration: 3000,
    narration: 'Only now is the Pod created, and it has to be placed around a disk that already lives in zone-a. This Pod fits Node-2 in zone-b on capacity and affinity, but a zone-a disk cannot attach to a Node in zone-b. Volume topology is read during scheduling, so Node-2 is rejected, while Node-1 in zone-a has no room for the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'Pending', zones: 'no node fits' });
      // node-1 is filtered out (no room), node-2 is reachable but wrong zone for the disk. The Pod is
      // admitted to neither, so it stays a Pending Pod hovering at node-2, the only node it fits on cpu.
      setStage(s, { diskA: 1, podOn: OPACITY.pending, cross: 1, nodeA: OPACITY.notready, pvcState: 'Bound' });
      s.refs.diskA.classList.add('highlight');
      setWire(s, 'za', 'disk in zone-a');
      setWire(s, 'fail', 'wrong zone for this disk');
      if (ctx.reduced) return;
      // The Pod is created but never admitted, so it arrives at its dim Pending opacity.
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: OPACITY.pending }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'imm-fail',
    duration: 3200,
    narration: 'No Node satisfies both the Pod and its zone-a disk, so the Pod is never scheduled at all. It stays Pending forever with the event Node(s) had volume node affinity conflict, the disk healthy but unreachable in zone-a. This is the single most common multi-zone storage bug, and its one-line fix is next.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'unschedulable', zones: 'zone-a vs zone-b' });
      setStage(s, { diskA: 1, podOn: OPACITY.pending, cross: 1, nodeA: OPACITY.notready, pvcState: 'Bound' });
      s.refs.diskA.classList.add('highlight');
      setWire(s, 'za', 'healthy but stranded');
      setWire(s, 'fail', 'volume node affinity conflict');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.podB, ctx, BEAT.lead, { from: OPACITY.pending, peak: 0.95 });
    },
  },
  {
    id: 'wffc-schedule',
    duration: 3200,
    narration: 'Set volumeBindingMode to WaitForFirstConsumer and start over. Binding is now deferred, so the claim stays Pending on purpose while no disk exists yet. The Pod is scheduled first and lands on Node-2 in zone-b, and that choice is recorded on the claim.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Pending, waiting', pod: 'node-2 zone-b', zones: 'Pod zone-b' });
      setStage(s, { podOn: OPACITY.pending, mode: 'WaitForFirstConsumer', pvcState: 'Pending' });
      s.refs.sc.classList.add('highlight');
      s.refs.nodeB.classList.add('highlight');
      setWire(s, 'zb', 'Pod placed first');
      if (ctx.reduced) return;
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: OPACITY.pending }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'wffc-provision',
    duration: 5800,
    narration: 'Now that the Pod has a Node, the zone to build in is no longer a guess. The volume is created in zone-b, bound to the claim, and attached to Node-2 right above it. The Pod mounts it and starts, because the order was reversed so the disk could follow the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Bound', pod: 'Running', zones: 'both zone-b' });
      setStage(s, { diskB: 1, podOn: 1, mode: 'WaitForFirstConsumer', pvcState: 'Bound', lanes: ['wProvB', 'wMountB'] });
      s.refs.sc.classList.add('highlight');
      s.refs.nodeB.classList.add('highlight');
      setWire(s, 'zb', 'provisioned in topology');
      if (ctx.reduced) { s.refs.diskB.classList.add('highlight'); s.refs.podBox.classList.add('highlight'); return; }
      setStage(s, { diskB: OPACITY.pending, podOn: OPACITY.pending, mode: 'WaitForFirstConsumer', pvcState: 'Bound', lanes: ['wProvB', 'wMountB'] });
      const provPts = wProv(1);
      const prov = routePacket(s, ctx, provPts, { delay: BEAT.lead, role: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', provPts, { delay: BEAT.lead });
      // The disk earns its highlight on the ball's arrival, not at step entry.
      lightBoxAt(s.refs.diskB, ctx, prov.arrivalMs);
      revealAt(s.refs.diskB, ctx, prov.arrivalMs, OPACITY.pending);
      // Down-arrow into the Pod, so the ball leads and the pulse lands on its arrival.
      const mountAt = prov.arrivalMs + REVEAL_MS + BEAT.afterHop;
      const mount = routePacket(s, ctx, W_MOUNT_B, { delay: mountAt, role: 'storage' });
      ridingLabel(s, ctx, 'attach and mount', W_MOUNT_B, { delay: mountAt });
      ctx.register(s.refs.podB.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: FADE.in, delay: mount.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, mount.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, mount.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
