import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, cylinder, node, pathArrow, chainList, setChainActive, podShell } from '../../lib/primitives.js';
import { valChip, setVal, setChip, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, relationPath, BEAT, lightBoxAt, makeRidingLabel, revealAt } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-csi-attach-mount


const M = 60, GUTTER = 48;
const COL_W = (1200 - 2 * M - GUTTER) / 2;               // 516: solved, see above

const LAD_X = M, LAD_W = COL_W, LAD_Y = 388, LAD_ROW = 40, LAD_GAP = 10;

// ---- left column: the controller side, under the narration panel's floor (230 on this card) ----
// Controller side left, Node side right is the division the four calls are about.
const CTRL_W = 252, CTRL_H = 64;
const CTRL_X = M, CTRL_Y = 268;                          // 60..312 / 268..332
const CTRL_RIGHT = CTRL_X + CTRL_W;                      // 312
const CTRL_CY = CTRL_Y + CTRL_H / 2;                     // 300

// ---- right column: node-1 and the two blocks above it ----
const NF_X = M + COL_W + GUTTER, NF_Y = 192, NF_W = COL_W, NF_H = 388;   // 624..1140 / 192..580
const NODE_PAD = 16;
const NODE_CX = NF_X + NF_W / 2;                          // 882: every tier below is symmetric on this
const IN_X = NF_X + NODE_PAD, IN_W = NF_W - NODE_PAD * 2; // 640 / 484: the usable inner width

const DISK_W = 150;
const DISK_X = IN_X + IN_W - DISK_W;                      // 974: right-aligned to the node inner edge
const DISK_CX = DISK_X + DISK_W / 2;                      // 1049, shared by the cloud disk and the device
const CDISK_Y = 44, CDISK_H = 104;
const CDISK_BOTTOM = CDISK_Y + CDISK_H;                   // 148
const CDISK_FACE_CY = CDISK_Y + CDISK_H / 2;              // 96

const DEV_Y = 212, DEV_H = 92;
const DEV_TOP = DEV_Y, DEV_BOTTOM = DEV_Y + DEV_H;        // 212 / 304

// The node plugin sits under the controller, left-aligned in the node, so the reader can see that the
// two node calls are run by a different process than the two controller calls above it.
const ND_X = IN_X, ND_Y = 220, ND_W = 250, ND_H = 58;

const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;        // 350 / 408

const POD_W = 226;
const POD_GAP = IN_W - 2 * POD_W;                         // 32
const POD_Y = 454, POD_H = 110;
const PODA_X = IN_X, PODB_X = IN_X + POD_W + POD_GAP;     // 640 / 898
const PODA_CX = PODA_X + POD_W / 2, PODB_CX = PODB_X + POD_W / 2;  // 753 / 1011, midpoint 882 = NODE_CX

const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = 2 * COL_W + GUTTER;                       // 1080: exactly the content width
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;   // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => M + i * (CHIP_W + CHIP_GAP));

const STG_LBL_Y = 434;

const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap
// The staging mount takes two lanes on its top face: the node driver owns it and the staged device
// feeds it. They are a mirrored pair about the face midpoint rather than one lane out on its own.
const OWNS_X = ND_X + ND_W / 2;                           // 765
const STAGE_IN_X = 2 * NODE_CX - OWNS_X;                  // 999
// CreateVolume crosses from the controller column to the cloud disk in the free band above the Node
// frame, turning up out of the panel's reach first.
const CREATE_TURN_X = 520;

const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_FACE_CY]];
const W_ATTACH  = [[DISK_CX, CDISK_BOTTOM], [DISK_CX, DEV_TOP]];
const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TOP]];
const W_PUB_A   = [[PODA_CX, STG_BOTTOM], [PODA_CX, POD_Y]];
const W_PUB_B   = [[PODB_CX, STG_BOTTOM], [PODB_CX, POD_Y]];
const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;


// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

function podBlock({ x, label }) {
  const shell = podShell({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'private bind mount', containers: 0, role: 'storage' });
  const innerBox = box({ x: x + 24, y: POD_Y + 40, w: POD_W - 48, h: 46, label: 'app', sublabel: '/data writable', role: 'storage' });
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
      'aria-label': 'The CSI attach and mount chain: four gRPC calls take a volume from nowhere to a writable path. CreateVolume makes the disk in the cloud backend, ControllerPublishVolume attaches it to the Node as a raw block device, NodeStageVolume formats it if needed and mounts it once at a global staging path, and NodePublishVolume bind-mounts that one staged filesystem into each Pod, which is how two Pods on one Node share a single attached disk.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. CreateVolume  ·  the disk now exists',
        '2. ControllerPublishVolume  ·  attached to the node',
        '3. NodeStageVolume  ·  formatted, mounted once',
        '4. NodePublishVolume  ·  bind-mounted into the Pod',
      ],
      role: 'storage',
    });

    const ctrl  = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher + provisioner', role: 'storage' });
    const cdisk = cylinder({ x: DISK_X, y: CDISK_Y, w: DISK_W, h: CDISK_H, label: 'Cloud Disk vol-1', role: 'storage' });
    const dev   = cylinder({ x: DISK_X, y: DEV_Y, w: DISK_W, h: DEV_H, label: '/dev/nvme1n1', role: 'storage' });
    const nd    = box({ x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI node driver', sublabel: 'node plugin', role: 'storage' });
    const stg   = box({ x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'Global staging mount', sublabel: '.../csi/vol-1/globalmount', role: 'storage' });
    const podA  = podBlock({ x: PODA_X, label: 'Pod A' });
    const podB  = podBlock({ x: PODB_X, label: 'Pod B' });

    const nodeFrame = node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'Node-1' });

    const wCreate = pathArrow({ points: W_CREATE, dashed: true, dim: true, role: 'storage' });
    const wAttach = pathArrow({ points: W_ATTACH, dashed: true, dim: true, role: 'storage' });
    const wStage  = pathArrow({ points: W_STAGE, dashed: true, dim: true, role: 'storage' });
    const wPubA   = pathArrow({ points: W_PUB_A, dashed: true, dim: true, role: 'storage' });
    const wPubB   = pathArrow({ points: W_PUB_B, dashed: true, dim: true, role: 'storage' });
    const wOwns   = relationPath({ d: W_OWNS, role: 'storage', dash: '5 5' });

    [dev, wAttach, wStage, podA.group, wPubA, podB.group, wPubB].forEach(el => { el.style.opacity = '0'; });

    const stgLbl = text({ class: 'scheme-label code dim', x: NODE_CX, y: STG_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const diskChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk',           value: 'none', role: 'storage' });
    const devChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device on node', value: 'none', role: 'storage' });
    const stageChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'staging mount',  value: 'none', role: 'storage' });
    const bindChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts',    value: 'none', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    root.appendChild(nodeFrame);
    [ctrl, cdisk, dev, nd, stg, podA.group, podB.group].forEach(el => root.appendChild(el));
    [wOwns, wCreate, wAttach, wStage, wPubA, wPubB].forEach(el => root.appendChild(el));
    root.appendChild(stgLbl);
    [diskChip, devChip, stageChip, bindChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);
    root.appendChild(chain);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, ctrl, cdisk, dev, nd, stg,
      podA: podA.group, podABox: podA.innerBox, podB: podB.group, podBBox: podB.innerBox,
      wAttach, wStage, wPubA, wPubB,
      diskChip, devChip, stageChip, bindChip,
      wires: { stage: stgLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how this
// card once showed a staging mount on the step that was explaining the disk did not exist yet.
function setChips(s, { disk, device, staging, binds }) {
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.devChip, device);
  setChip(s.refs.stageChip, staging);
  setChip(s.refs.bindChip, binds);
}

function setBorn(s, { device = 0, podA = 0, podB = 0 } = {}) {
  [[s.refs.dev, device], [s.refs.wAttach, device], [s.refs.wStage, device],
    [s.refs.podA, podA], [s.refs.wPubA, podA],
    [s.refs.podB, podB], [s.refs.wPubB, podB]].forEach(([el, v]) => { el.style.opacity = String(v); });
}

function clearHL(s) {
  clearHighlights(s, ['ctrl', 'cdisk', 'dev', 'nd', 'stg', 'podABox', 'podBBox',
    'diskChip', 'devChip', 'stageChip', 'bindChip'], [s.refs.podA, s.refs.podB]);
}

function call(s, ctx, { points, tag, target, delay = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay, role: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay });
  if (target) lightBoxAt(target, ctx, pkt.arrivalMs);
  return pkt;
}

function publishInto(s, ctx, { podEl, lane, points, tag }) {
  revealAt(podEl, ctx, 0);
  revealAt(lane, ctx, 0);
  const delay = BEAT.lead;
  const pkt = routePacket(s, ctx, points, { delay, role: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay });
  pulsePod(podEl, ctx, pkt.arrivalMs);
  return pkt;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { disk: 'none', device: 'none', staging: 'none', binds: 'none' });
      setBorn(s, {});
    },
  },
  {
    id: 'create',
    duration: 3400,
    narration: 'CreateVolume runs first, on the controller side. The provisioner asks the driver to carve a real disk out of the cloud backend. When it returns, a disk called vol-1 exists somewhere in the provider, but it is not near any Node yet and nothing can read a byte of it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { disk: 'vol-1 in the cloud', device: 'none', staging: 'none', binds: 'none' });
      setBorn(s, {});
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) { s.refs.cdisk.classList.add('highlight'); return; }
      call(s, ctx, { points: W_CREATE, tag: 'CreateVolume', target: s.refs.cdisk });
    },
  },
  {
    id: 'attach',
    duration: 2800,
    narration: 'ControllerPublishVolume runs next, still on the controller side. The external-attacher asks the driver to attach vol-1 to the Node the Pod was scheduled on. This is a cloud operation: the disk shows up on the Node as a raw block device, here /dev/nvme1n1. It is still unformatted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { disk: 'attached to node-1', device: '/dev/nvme1n1', staging: 'none', binds: 'none' });
      // The device exists on the node by the END of this step, so visible is the static end-state and
      // the fade below only stages how it gets there.
      setBorn(s, { device: 1 });
      s.refs.ctrl.classList.add('highlight');
      s.refs.cdisk.classList.add('highlight');
      if (ctx.reduced) { s.refs.dev.classList.add('highlight'); return; }
      revealAt(s.refs.dev, ctx, 0);
      revealAt(s.refs.wAttach, ctx, 0);
      revealAt(s.refs.wStage, ctx, 0);
      call(s, ctx, { points: W_ATTACH, tag: 'ControllerPublish', target: s.refs.dev });
    },
  },
  {
    id: 'stage',
    duration: 3000,
    narration: 'NodeStageVolume is the first Node call. The node plugin formats the raw device if needed and mounts it once, at a global staging path under the Kubelet directory. This happens a single time per Node no matter how many Pods will use the volume, which is the whole reason stage and publish are two calls, not one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { disk: 'attached to node-1', device: '/dev/nvme1n1', staging: 'mounted once', binds: 'none' });
      setBorn(s, { device: 1 });
      s.refs.dev.classList.add('highlight');
      s.refs.nd.classList.add('highlight');
      setWire(s, 'stage', 'mount once per node');
      if (ctx.reduced) { s.refs.stg.classList.add('highlight'); return; }
      call(s, ctx, { points: W_STAGE, tag: 'NodeStage', target: s.refs.stg });
    },
  },
  {
    id: 'publish',
    duration: 3200,
    narration: 'NodePublishVolume is the last call, once per Pod. It does not re-mount the disk. It bind-mounts the already staged filesystem into this Pod private directory, which surfaces as /data inside the container. Only now does Pod A start and begin writing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { disk: 'attached to node-1', device: '/dev/nvme1n1', staging: 'mounted once', binds: '1 (Pod A)' });
      // Pod A starts on this step, so it and its lane are present by the end of it.
      setBorn(s, { device: 1, podA: 1 });
      // The node plugin runs this call too, so it stays lit alongside the mount it is bind-mounting.
      s.refs.nd.classList.add('highlight');
      s.refs.stg.classList.add('highlight');
      setWire(s, 'stage', 'bind-mount, no remount');
      if (ctx.reduced) return;
      publishInto(s, ctx, { podEl: s.refs.podA, lane: s.refs.wPubA, points: W_PUB_A, tag: 'NodePublish' });
    },
  },
  {
    id: 'share',
    duration: 3200,
    narration: 'A second Pod lands on the same Node and asks for the same volume. The disk is already attached and already staged, so those two calls are skipped entirely. Only one more NodePublishVolume runs, a second bind-mount off the same global staging path. That is how several Pods on one Node share a single attached disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 3);
      setChips(s, { disk: 'attached to node-1', device: '/dev/nvme1n1', staging: 'mounted once', binds: '2 (Pod A + Pod B)' });
      // Pod A stays exactly as step 4 left it. Pod B lands on this step, so it and its lane are present
      // by the end of it, and Pod A is re-pinned rather than inherited.
      setBorn(s, { device: 1, podA: 1, podB: 1 });
      s.refs.nd.classList.add('highlight');
      s.refs.stg.classList.add('highlight');
      setWire(s, 'stage', 'one mount, two bind mounts');
      if (ctx.reduced) return;
      // Pod B lands on the node with its lane, then the second bind-mount reaches it and it pulses.
      publishInto(s, ctx, { podEl: s.refs.podB, lane: s.refs.wPubB, points: W_PUB_B, tag: 'NodePublish again' });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
