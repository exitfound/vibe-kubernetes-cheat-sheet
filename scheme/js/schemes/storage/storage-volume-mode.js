import { g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, node, pathArrow, podShell } from '../../lib/primitives.js';
import { valChip, setChip, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel, wrapPod, diagramRoot } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volume-mode


const LEFT_X = 400;

const NODE_Y = 55, NODE_H = 186;
const NODE_PAD = 16;
const POD_Y = 82, POD_W = 164, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const POD_GAP = 40;

const NODE_X = LEFT_X;
const NODE_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;       // 400
const CONTENT_CX = NODE_X + NODE_W / 2;                  // 600: canvas center, and every tier uses it

const P1_X = NODE_X + NODE_PAD;                          // 416, the Filesystem column
const P2_X = P1_X + POD_W + POD_GAP;                     // 620, the Block column
const FS_CX = P1_X + POD_W / 2;                          // 498
const BLK_CX = P2_X + POD_W / 2;                         // 702, and (498 + 702) / 2 == CONTENT_CX

const BAND_X = LEFT_X, BAND_Y = 305, BAND_W = NODE_W, BAND_H = 70;
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 305 / 375
const BAND_LBL_Y = 408;

const PV_Y = 442, PV_H = 96, PV_W = 176;
const PV_TOP = PV_Y;                                     // 442
const DISK_LBL_Y = 566;
const CHIPS_Y = 590;

const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // volumeMode / node does / container / fsGroup
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

const LANE = 12;
const laneDown = (cx, y1, y2) => [[cx - LANE, y1], [cx - LANE, y2]];
const laneUp   = (cx, y1, y2) => [[cx + LANE, y1], [cx + LANE, y2]];

const W_FS_ASK   = laneDown(FS_CX, POD_BOTTOM, BAND_TOP);     // Pod states what it wants
const W_FS_PUB   = laneUp(FS_CX, BAND_TOP, POD_BOTTOM);       // node service hands it back
const W_FS_STAGE = laneDown(FS_CX, BAND_BOTTOM, PV_TOP);      // stage: mkfs then mount
const W_FS_DEV   = laneUp(FS_CX, PV_TOP, BAND_BOTTOM);        // the disk answers
const W_BLK_ASK   = laneDown(BLK_CX, POD_BOTTOM, BAND_TOP);
const W_BLK_PUB   = laneUp(BLK_CX, BAND_TOP, POD_BOTTOM);
const W_BLK_STAGE = laneDown(BLK_CX, BAND_BOTTOM, PV_TOP);
const W_BLK_DEV   = laneUp(BLK_CX, PV_TOP, BAND_BOTTOM);

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, label, sublabel, ctr, ctrSub }) {
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 14, y: POD_Y + 44, w: POD_W - 28, h: 52, label: ctr, sublabel: ctrSub, role: 'storage' });
  return wrapPod(shell, innerBox);
}

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = diagramRoot({ 'aria-label': 'volumeMode decides what a Pod is handed. Under Filesystem, the default, the CSI node service formats the device with mkfs if it has no filesystem yet, mounts it, and the container finds an ordinary directory at the mountPath given under volumeMounts, where file permissions and the fsGroup ownership walk apply. Under Block nothing is formatted and nothing is mounted: the raw device is published into the container at the devicePath given under volumeDevices, and every filesystem level feature stops applying. The field is immutable and must match on the PersistentVolume and the claim.' });
    root.appendChild(arrowDefs());

    const nodeBox = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });

    const podFs = podBlock({
      x: P1_X, label: 'Pod web-0', sublabel: 'volumeMode: Filesystem',
      ctr: 'app', ctrSub: 'volumeMounts',
    });
    const podBlk = podBlock({
      x: P2_X, label: 'Pod db-0', sublabel: 'volumeMode: Block',
      ctr: 'DB', ctrSub: 'volumeDevices',
    });

    const band = box({
      x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Kubelet and CSI Node Service', sublabel: 'stages the volume, then publishes it', role: 'storage',
    });

    // Two identical disks. The label carries the size so the card never has to claim in prose that
    // they are the same: the reader can see it.
    const pvFs  = cylinder({ x: FS_CX - PV_W / 2,  y: PV_Y, w: PV_W, h: PV_H, label: 'PV-web 20Gi', role: 'storage' });
    const pvBlk = cylinder({ x: BLK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-db 20Gi',  role: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as storage-volume-model does.
    [pvFs, pvBlk].forEach(cyl => {
      const l = cyl.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', 58);
    });

    const wires = [W_FS_ASK, W_FS_PUB, W_FS_STAGE, W_FS_DEV, W_BLK_ASK, W_BLK_PUB, W_BLK_STAGE, W_BLK_DEV]
      .map(points => pathArrow({ points, dashed: true, dim: true, role: 'storage' }));

    const fsLbl   = text({ class: 'scheme-label code dim', x: FS_CX,  y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const blkLbl  = text({ class: 'scheme-label code dim', x: BLK_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const bandLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: BAND_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const modeChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'volumeMode', value: 'Filesystem',  role: 'storage' });
    const nodeChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'node does',  value: 'nothing yet', role: 'storage' });
    const ctrChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'container',  value: 'nothing yet', role: 'storage' });
    const fsgChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'fsGroup',    value: 'applied',     role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [nodeBox, band, pvFs, pvBlk, podFs.group, podBlk.group].forEach(el => root.appendChild(el));
    wires.forEach(el => root.appendChild(el));
    [fsLbl, blkLbl, bandLbl].forEach(el => root.appendChild(el));
    [modeChip, nodeChip, ctrChip, fsgChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podFs: podFs.group, podBlk: podBlk.group,
      ctrFs: podFs.innerBox, ctrBlk: podBlk.innerBox,
      band, pvFs, pvBlk,
      modeChip, nodeChip, ctrChip, fsgChip,
      wires: { fs: fsLbl, blk: blkLbl, band: bandLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to display 'mkfs then mount' on the step that is explaining that Block never formats.
function setChips(s, { mode, nodeDoes, container, fsgroup }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.nodeChip, nodeDoes);
  setChip(s.refs.ctrChip, container);
  setChip(s.refs.fsgChip, fsgroup);
}

function resetStep(s) {
  s.refs.packetLayer.replaceChildren();
  clearHighlights(s, ['band', 'pvFs', 'pvBlk', 'ctrFs', 'ctrBlk',
    'modeChip', 'nodeChip', 'ctrChip', 'fsgChip'], [s.refs.podFs, s.refs.podBlk]);
  clearWires(s);
}

// The Pod states what it wants: the Pod blinks first (it is the actor), then the request drops to
// the node service, which lights on arrival. Returns the arrival time so the next hop can chain.
function askDown(s, ctx, { podEl, points, tag, lead = 0 }) {
  pulsePod(podEl, ctx, lead);
  const pkt = routePacket(s, ctx, points, { delay: lead + BEAT.afterPulse, role: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead + BEAT.afterPulse });
  lightBoxAt(s.refs.band, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

// The node service acts on the disk. No Pod is involved, so nothing pulses: the ball leaves after
// BEAT.lead so the lit band registers before it departs, and the disk lights on arrival.
function actOnDisk(s, ctx, { points, tag, disk, lead = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay: lead, role: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead });
  lightBoxAt(disk, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

function publishUp(s, ctx, { podEl, points, tag, lead = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay: lead, role: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead });
  pulsePod(podEl, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      resetStep(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'applied' });
    },
  },
  {
    id: 'fs-claim',
    duration: 2900,
    narration: 'Pod web-0 takes the default. A volumeMode of Filesystem is what you get whenever the field is absent, and it is what almost every workload wants. The Pod consumes the volume under volumeMounts, naming a mountPath, and what it expects to find at that path is a directory.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'applied' });
      setWire(s, 'fs', 'no filesystem yet');
      if (ctx.reduced) { s.refs.band.classList.add('highlight'); return; }
      askDown(s, ctx, { podEl: s.refs.podFs, points: W_FS_ASK, tag: 'wants a path' });
    },
  },
  {
    id: 'fs-format',
    duration: 2900,
    narration: 'Before anything can be mounted the CSI node service stages the volume. If the device carries no filesystem yet, this is where mkfs runs and creates one, ext4 unless the StorageClass asks for something else. It happens once, on first use, and a disk that already holds data is left alone.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'mkfs then mount', container: 'nothing yet', fsgroup: 'applied' });
      setWire(s, 'fs', 'ext4 created');
      setWire(s, 'band', 'stage: mkfs then mount');
      s.refs.band.classList.add('highlight');
      if (ctx.reduced) { s.refs.pvFs.classList.add('highlight'); return; }
      const staged = actOnDisk(s, ctx, { points: W_FS_STAGE, tag: 'mkfs ext4', disk: s.refs.pvFs });
      // The disk hands the formatted device back, as the block branch beside it already draws.
      // Without it the fs branch stages onto the disk and mounts a device it never received.
      actOnDisk(s, ctx, { points: W_FS_DEV, tag: 'ext4 device', disk: s.refs.band, lead: staged + BEAT.afterHop });
    },
  },
  {
    id: 'fs-mount',
    duration: 3400,
    narration: 'Now the staged filesystem is mounted into the container at /data, and inside the container that is an ordinary directory. Files, directory permissions and the fsGroup ownership walk all apply here, because there is a filesystem for Kubernetes to apply them to.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'mounted on node', container: 'directory /data', fsgroup: 'applied' });
      setWire(s, 'fs', 'ext4');
      setWire(s, 'band', 'mount into the Pod');
      s.refs.band.classList.add('highlight');
      s.refs.pvFs.classList.add('highlight');
      if (ctx.reduced) return;
      publishUp(s, ctx, { podEl: s.refs.podFs, points: W_FS_PUB, tag: 'mount at /data' });
    },
  },
  {
    id: 'block-claim',
    duration: 2900,
    narration: 'Pod db-0 asks for an identical disk with volumeMode set to Block. Nothing about the storage request changed: same size, same class, same backend. What changed is that the Pod consumes it under volumeDevices with a devicePath, instead of volumeMounts with a mountPath.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'Block', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'not applied' });
      setWire(s, 'blk', 'raw, unformatted');
      if (ctx.reduced) { s.refs.band.classList.add('highlight'); return; }
      askDown(s, ctx, { podEl: s.refs.podBlk, points: W_BLK_ASK, tag: 'wants the device' });
    },
  },
  {
    id: 'block-publish',
    duration: 4200,
    narration: 'No mkfs and no mount. The node service publishes the device itself into the container, so the disk arrives exactly as the backend handed it over, unformatted and untouched. The container finds a raw block device at /dev/xvda, and everything above the first byte is now its own business.',
    enter(s, ctx) {
      resetStep(s);
      setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not applied' });
      setWire(s, 'blk', 'raw, unformatted');
      setWire(s, 'band', 'publish the device');
      s.refs.pvBlk.classList.add('highlight');
      // The band receives the device before it publishes it, and actOnDisk below already lights it
      // on that arrival. Lighting it here too made the arrival invisible.
      if (ctx.reduced) { s.refs.band.classList.add('highlight'); return; }
      // Two chained hops: the untouched device rises from the disk to the node service, which passes
      // it straight on into the container without doing anything to it.
      const up = actOnDisk(s, ctx, { points: W_BLK_DEV, tag: 'device as is', disk: s.refs.band });
      publishUp(s, ctx, {
        podEl: s.refs.podBlk, points: W_BLK_PUB,
        tag: 'at /dev/xvda', lead: up + BEAT.afterHop,
      });
    },
  },
  {
    id: 'trade',
    duration: 3800,
    narration: 'That is the trade. A database that manages its own layout gets the device with no filesystem in the way, and in exchange every filesystem level feature stops working: fsGroup has no ownership to walk, subPath has no paths to choose from, and file permissions have no files. The volumeMode field is also immutable once the claim exists, and a claim asking for Block will never bind to a volume offering Filesystem, so this is a decision you make when you create the claim.',
    enter(s) {
      resetStep(s);
      setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not applied' });
      setWire(s, 'fs', 'ext4');
      setWire(s, 'blk', 'raw, unformatted');
      setWire(s, 'band', 'set once, must match');
      s.refs.pvFs.classList.add('highlight');
      s.refs.pvBlk.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
