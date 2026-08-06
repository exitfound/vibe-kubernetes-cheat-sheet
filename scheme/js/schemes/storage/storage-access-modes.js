import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, podShell, cylinder, node, pathArrow } from '../../lib/primitives.js';
import { valChip, setChip, pulsePod, pulsePodDim, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, OPACITY, wrapPod, diagramRoot } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-access-modes


const LEFT_X = 400;                                      // leftmost the NODE ROW may go, all viewports

const POD_Y = 82, POD_W = 128, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const NODE_PAD = 16;                                     // node border to the Pod inside it
const POD_GAP = 16;                                      // between the two Pods on node-1
const NODE_GAP = 30;                                     // between the two nodes
const NODE_Y = 55, NODE_H = 186;

const NODE_1_X = LEFT_X;
const NODE_1_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;     // 304
const NODE_2_X = NODE_1_X + NODE_1_W + NODE_GAP;         // 734
const NODE_2_W = NODE_PAD * 2 + POD_W;                   // 160

const CONTENT_W = NODE_1_W + NODE_GAP + NODE_2_W;        // 494
const RIGHT_END = LEFT_X + CONTENT_W;                    // 894

// The node row sits in the panel's y band, so it starts at 400 and centres on 647. Everything BELOW
// the panel floor centres on the CANVAS instead: the band takes the width it gains on the left.
const CANVAS_CX = 600;

const P1_X = NODE_1_X + NODE_PAD;                        // 416, node-1 first Pod
const P2_X = P1_X + POD_W + POD_GAP;                     // 560, node-1 second Pod
const P3_X = NODE_2_X + NODE_PAD;                        // 750, node-2 only Pod
const P1_CX = P1_X + POD_W / 2, P2_CX = P2_X + POD_W / 2, P3_CX = P3_X + POD_W / 2;

const DRV_X = 2 * CANVAS_CX - RIGHT_END, DRV_Y = 305;    // 306, mirroring the right edge about CX
const DRV_W = RIGHT_END - DRV_X, DRV_H = 70;             // 588
const DRV_TOP = DRV_Y, DRV_BOTTOM = DRV_Y + DRV_H;       // 305 / 375
const DRV_CX = CANVAS_CX;                                // 600 by construction

// The two disks sit symmetrically about the driver band, each roughly under the node that uses it.
const PV_Y = 450, PV_H = 100, PV_TOP = PV_Y;             // 450
const PV_W = 215;
const PV_SPREAD = 148;                                   // half-distance between the two disk centers
const BLOCK_CX = DRV_CX - PV_SPREAD;                     // 452
const NFS_CX = DRV_CX + PV_SPREAD;                       // 748
const SPEC_GAP = 14;
const SPEC_Y = PV_Y + PV_H / 2 + 5 + SPEC_GAP;           // 519
const VERDICT_Y = 566;
const CHIPS_Y = 585;

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / sharing / enforced by
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CANVAS_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));


// Each Pod drops onto a shared bus and the three enter the band on its centre line: dropping
// straight down lands three arrows across the band's face, because the two rows have different centres.
const BUS_Y = 260;                                       // clear of the panel bottom (230) and the band
const podReq = cx => [[cx, POD_BOTTOM], [cx, BUS_Y], [DRV_CX, BUS_Y], [DRV_CX, DRV_TOP]];
const W_P1_DRV = podReq(P1_CX);
const W_P2_DRV = podReq(P2_CX);
const W_P3_DRV = podReq(P3_CX);
// driver -> disk, the ball re-emerging at the disk column. The three shared-filesystem attaches fan
// out INSIDE the PV-nfs column, not off the band, so every lane leaves on a face midpoint.
const W_DRV_BLOCK = [[BLOCK_CX, DRV_BOTTOM], [BLOCK_CX, PV_TOP]];
const NFS_LANE = 16;
const NFS_FAN_Y = (DRV_BOTTOM + PV_TOP) / 2 - 20;        // 392, above the driver caption at 408
const nfsAttach = dx => [[NFS_CX, DRV_BOTTOM], [NFS_CX, NFS_FAN_Y], [NFS_CX + dx, NFS_FAN_Y], [NFS_CX + dx, PV_TOP]];
const W_DRV_NFS_1 = nfsAttach(-NFS_LANE);   // app-1 on node-1
const W_DRV_NFS_2 = [[NFS_CX, DRV_BOTTOM], [NFS_CX, PV_TOP]];   // app-2 on node-1
const W_DRV_NFS_3 = nfsAttach(NFS_LANE);    // app-3 on node-2

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock({ x, label }) {
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, role: 'storage' });
  // Inset 14 rather than 20: at this POD_W the old inset left the sublabel close to the box sides.
  // 'read/write' is 59 units wide against a 100-wide box, so it keeps ~20 units of air either side.
  const innerBox = box({ x: x + 14, y: POD_Y + 46, w: POD_W - 28, h: 52, label: 'ctr', sublabel: 'read/write', role: 'storage' });
  return wrapPod(shell, innerBox);
}

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'Access modes decide who can mount a volume at once: ReadWriteOnce attaches a volume to a single Node, so two Pods on that same Node can both use it but a Pod on another Node cannot, ReadWriteOncePod narrows that to one single Pod, and ReadWriteMany needs a shared filesystem because a plain block disk cannot be attached to many Nodes at all. The access mode is mostly a request that the CSI driver has to honour rather than a rule Kubernetes enforces on its own, the one exception being ReadWriteOncePod.' });
    root.appendChild(arrowDefs());

    const nodeA = node({ x: NODE_1_X, y: NODE_Y, w: NODE_1_W, h: NODE_H, label: 'Node-1' });
    const nodeB = node({ x: NODE_2_X, y: NODE_Y, w: NODE_2_W, h: NODE_H, label: 'Node-2' });

    const podA1 = podBlock({ x: P1_X, label: 'Pod app-1' });
    const podA2 = podBlock({ x: P2_X, label: 'Pod app-2' });
    const podB1 = podBlock({ x: P3_X, label: 'Pod app-3' });

    const driver = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI driver and attach controller', sublabel: 'grants or refuses each attach', role: 'storage' });

    const pvBlock = cylinder({ x: BLOCK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-block', role: 'storage' });
    const pvNfs   = cylinder({ x: NFS_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-nfs', role: 'storage' });

    const wA1 = pathArrow({ points: W_P1_DRV, dashed: true, dim: true, role: 'storage' });
    const wA2 = pathArrow({ points: W_P2_DRV, dashed: true, dim: true, role: 'storage' });
    const wB1 = pathArrow({ points: W_P3_DRV, dashed: true, dim: true, role: 'storage' });
    const wBlock = pathArrow({ points: W_DRV_BLOCK, dashed: true, dim: true, role: 'storage' });
    const wNfs1 = pathArrow({ points: W_DRV_NFS_1, dashed: true, dim: true, role: 'storage' });
    const wNfs2 = pathArrow({ points: W_DRV_NFS_2, dashed: true, dim: true, role: 'storage' });
    const wNfs3 = pathArrow({ points: W_DRV_NFS_3, dashed: true, dim: true, role: 'storage' });

    const blockLbl = text({ class: 'scheme-label code dim', x: BLOCK_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const nfsLbl   = text({ class: 'scheme-label code dim', x: NFS_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    // Centered on the driver band it captions, rather than the hand-typed 725 it used to sit at.
    const drvLbl   = text({ class: 'scheme-label code dim', x: DRV_X + DRV_W / 2, y: 408, 'text-anchor': 'middle' }, [' ']);

    const modeChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'accessModes', value: 'ReadWriteOnce', role: 'storage' });
    const attachChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'attached to', value: 'none', role: 'storage' });
    const shareChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'sharing', value: 'none', role: 'storage' });
    const driverChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'enforced by', value: 'CSI driver', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [nodeA, nodeB, driver, pvBlock, pvNfs, podA1.group, podA2.group, podB1.group].forEach(el => root.appendChild(el));
    [wA1, wA2, wB1, wBlock, wNfs1, wNfs2, wNfs3].forEach(el => root.appendChild(el));
    [blockLbl, nfsLbl, drvLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(BLOCK_CX, 'block disk, single attach'));
    root.appendChild(specText(NFS_CX, 'shared filesystem'));
    [modeChip, attachChip, shareChip, driverChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podA1: podA1.group, podA2: podA2.group, podB1: podB1.group,
      appA1: podA1.innerBox, appA2: podA2.innerBox, appB1: podB1.innerBox,
      driver, pvBlock, pvNfs,
      modeChip, attachChip, shareChip, driverChip,
      wires: { block: blockLbl, nfs: nfsLbl, drv: drvLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { mode, attach, share, enforcer = 'CSI driver' }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.attachChip, attach);
  setChip(s.refs.shareChip, share);
  setChip(s.refs.driverChip, enforcer);
}

function setPods(s, { a1, a2, b1 }) {
  s.refs.podA1.style.opacity = String(a1);
  s.refs.podA2.style.opacity = String(a2);
  s.refs.podB1.style.opacity = String(b1);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['driver', 'pvBlock', 'pvNfs', 'appA1', 'appA2', 'appB1',
    'modeChip', 'attachChip', 'shareChip', 'driverChip'], [s.refs.podA1, s.refs.podA2, s.refs.podB1]);
  clearWires(s);
}

// One attach that succeeds: the Pod blinks first (it is the actor), the request rises to the driver,
// then the granted attach drops to the disk. Both the driver and the disk light on arrival.
function grantMount(s, ctx, { podEl, reqPts, attachPts, tag, disk, lead = 0 }) {
  pulsePod(podEl, ctx, lead);
  const req = routePacket(s, ctx, reqPts, { delay: lead + BEAT.afterPulse, role: 'storage' });
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  const att = routePacket(s, ctx, attachPts, { delay: req.arrivalMs + BEAT.afterHop, role: 'storage' });
  ridingLabel(s, ctx, tag, attachPts, { delay: req.arrivalMs + BEAT.afterHop });
  lightBoxAt(disk, ctx, att.arrivalMs);
  return att.arrivalMs;
}

function denyMount(s, ctx, { podEl, reqPts, tag, lead = 0 }) {
  if (podEl) pulsePodDim(podEl, ctx, lead, { from: OPACITY.pending, peak: 0.95 });
  const delay = podEl ? lead + BEAT.afterPulse : lead;
  const req = routePacket(s, ctx, reqPts, { delay, role: 'storage' });
  ridingLabel(s, ctx, tag, reqPts, { delay });
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  return req.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'none', share: 'none' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // idle: nobody is refused anything yet
    },
  },
  {
    id: 'rwo-first',
    duration: 3100,
    narration: 'Pod app-1 mounts the volume. ReadWriteOnce attaches the disk to one Node, Node-1, and lets a Pod there read and write it. So far this looks exactly like a per-Pod lock, but that is not what ReadWriteOnce actually means.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // app-2 and app-3 are healthy, just not shown mounting
      setWire(s, 'block', 'attached: node-1');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, attachPts: W_DRV_BLOCK, tag: 'mount rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-samenode',
    duration: 3100,
    narration: 'Pod app-2 sits on the same Node and it can mount the volume too. ReadWriteOnce is per Node, not per Pod. Once the disk is attached to Node-1, any number of Pods scheduled onto Node-1 can share it.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1, app-2' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // app-3 is not refused until the next step
      setWire(s, 'block', 'attached: node-1');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, attachPts: W_DRV_BLOCK, tag: 'shares rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-othernode',
    duration: 2600,
    narration: 'Pod app-3 lives on Node-2 and asks for the same volume. This one is refused. The disk is already attached to Node-1, and a block disk can be attached to only one Node at a time, so app-3 gets a Multi-Attach error and never starts.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1, app-2' });
      setPods(s, { a1: 1, a2: 1, b1: OPACITY.pending });        // app-3 refused: Multi-Attach
      setWire(s, 'block', 'attached: node-1');
      setWire(s, 'drv', 'held by node-1');
      s.refs.pvBlock.classList.add('highlight');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, tag: 'Multi-Attach denied' });
    },
  },
  {
    id: 'rwop',
    duration: 2600,
    narration: 'ReadWriteOncePod is the strict one. Now even app-2 on the same Node is refused, because the volume is bound to a single Pod and nothing else. It is also the one mode Kubernetes enforces itself rather than leaving to the driver, and it is what you reach for when two Pods writing the same files would corrupt each other.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteOncePod', attach: 'node-1', share: 'app-1 only', enforcer: 'Kubernetes' });
      setPods(s, { a1: 1, a2: OPACITY.pending, b1: OPACITY.pending });      // RWOP refuses everyone but app-1
      setWire(s, 'block', 'held by app-1');
      setWire(s, 'drv', 'one Pod only');
      s.refs.pvBlock.classList.add('highlight');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, tag: 'RWOP refused' });
    },
  },
  {
    id: 'rwx-block',
    duration: 2600,
    narration: 'ReadWriteMany asks for the volume on many Nodes at once. On the block disk that request cannot be honoured at all: a raw block device simply cannot attach to more than one Node. Kubernetes will accept the access mode on the object, but the driver is where it fails.',
    enter(s, ctx) {
      resetStep(s);
      // attach is 'none', not 'node-1': the narration says this request cannot be honoured at all, so
      // leaving the previous step's node-1 in the chip would have the strip contradict the sentence.
      setChips(s, { mode: 'ReadWriteMany', attach: 'none', share: 'none' });
      setPods(s, { a1: OPACITY.pending, a2: OPACITY.pending, b1: OPACITY.pending });    // RWX on a block disk: nobody gets it
      setWire(s, 'block', 'RWX unsupported');
      setWire(s, 'drv', 'block disk, no RWX');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      // BOTH nodes ask, because asking from many nodes at once is what ReadWriteMany means and what
      // this disk cannot do. A single request could not show the thing the step is about.
      denyMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, tag: 'RWX unsupported' });
      denyMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, tag: 'RWX unsupported', lead: 220 });
    },
  },
  {
    id: 'rwx-nfs',
    duration: 3800,
    narration: 'Point the claim at a shared filesystem instead, PV-nfs on NFS or CephFS, and ReadWriteMany works. The driver attaches it to both Nodes, and all three Pods mount it at once, on either Node, with nobody refused. The mode was always allowed by Kubernetes, what changed is a backend that can deliver it.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'ReadWriteMany', attach: 'node-1, node-2', share: 'app-1, app-2, app-3' });
      // Every Pod is at full opacity here: ReadWriteMany on a shared filesystem excludes nobody, so
      // there is no Pod left in the not-holding-it state that OPACITY.pending exists to mark.
      setPods(s, { a1: 1, a2: 1, b1: 1 });
      setWire(s, 'nfs', 'attached: both nodes');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvNfs.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, attachPts: W_DRV_NFS_1, tag: 'mount rwx', disk: s.refs.pvNfs });
      grantMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, attachPts: W_DRV_NFS_2, tag: 'mount rwx', disk: s.refs.pvNfs, lead: 200 });
      grantMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, attachPts: W_DRV_NFS_3, tag: 'mount rwx', disk: s.refs.pvNfs, lead: 400 });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
