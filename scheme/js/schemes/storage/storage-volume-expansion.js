import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, podShell, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setChip, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, makeRidingLabel } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volume-expansion


const CX = 600;
const TIER = 162;

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H;                              // 160

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_BOTTOM = PVC_Y + PVC_H, PVC_MID = PVC_Y + PVC_H / 2, PVC_RIGHT = PVC_X + PVC_W; // 304 / 270 / 720

const DISK_W = 230, DISK_H = 86, DISK_Y = 389;
const DISK_TOP = DISK_Y, DISK_MID = DISK_Y + DISK_H / 2;       // 389 / 432
const DISK_LEFT = CX - DISK_W / 2, DISK_RIGHT = CX + DISK_W / 2;  // 485 / 715

// One actor footprint for all four, and the left column is the exact mirror of the right about CX.
const ACT_W = 220, ACT_H = 72;
const ACT_R_X = 850, ACT_R_CX = ACT_R_X + ACT_W / 2;           // 850 / 960
const ACT_L_X = 1200 - ACT_R_X - ACT_W, ACT_L_RIGHT = ACT_L_X + ACT_W;  // 130 / 350
const SLOT_A_Y = POD_Y + POD_H / 2 - ACT_H / 2;                // 72, centered on the Pod tier
const SLOT_A_BOTTOM = SLOT_A_Y + ACT_H;                        // 144
const BOTTOM_ACT_Y = DISK_MID - ACT_H / 2;                     // 396

const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;
const VERDICT_LBL_X = PVC_X - 16, VERDICT_LBL_Y = PVC_MID + 4; // 464 / 274, anchored end
// cylinder() draws its own name on the baseline h/2+5, so the capacity line goes 14 below it.
const CAP_LBL_Y = DISK_Y + DISK_H / 2 + 5 + 14;                // 451
const CHIP_Y = 545, CHIP_H = 34;                               // strip ends at 579

// Each lane and its ball share one points array. Every endpoint sits on a block edge, and every lane
// is either a straight run or a single right angle. Nothing turns twice.
const W_MOUNT_LOW  = [[CX, DISK_TOP], [CX, PVC_BOTTOM]];       // disk -> claim, upward
const W_MOUNT_HIGH = [[CX, PVC_Y], [CX, POD_BOTTOM]];          // claim -> Pod, upward
// Slot A to the claim: one turn, landing dead center on the claim's right edge.
const W_TO_PVC = [[ACT_R_CX, SLOT_A_BOTTOM], [ACT_R_CX, PVC_MID], [PVC_RIGHT, PVC_MID]];
// The two phases, straight in from opposite sides at the disk's own midline.
const W_CTRL_EXP = [[ACT_R_X, DISK_MID], [DISK_RIGHT, DISK_MID]];
const W_NODE_EXP = [[ACT_L_RIGHT, DISK_MID], [DISK_LEFT, DISK_MID]];

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock() {
  const shell = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'df reads the mount', containers: 0, role: 'storage' });
  const innerBox = box({ x: POD_X + 20, y: POD_Y + (POD_H - 52) / 2, w: POD_W - 40, h: 52, label: 'app', sublabel: 'writes to /data', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// Every lane in this card is a ROUTE: something travels all of them, so they are all dashed, all
// carry a head, and all are built from the same points array as their ball.
function lane(points) {
  return pathArrow({ points, dashed: true, dim: true, role: 'storage' });
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
      'aria-label': 'Growing a volume while the Pod keeps running is a two phase operation. You raise the storage request on the claim, and the API server accepts that edit only because the StorageClass behind it has allowVolumeExpansion set to true. Then the external-resizer calls ControllerExpandVolume and the backend grows the real block device, which is phase one. Then Kubelet calls NodeExpandVolume on the Node where the Pod runs and the filesystem grows to fill the bigger device, which is phase two. Only after both does the extra space appear inside the container, with no restart. Going the other way is refused: a request below the size already provisioned is rejected.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const web = podBlock();
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'requests 5Gi', role: 'storage' });
    // Slot A holds whoever acts on the claim this step. The two never share a step, so they share the
    // slot and the lane out of it.
    const kubectl = box({ x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'kubectl patch', sublabel: 'raises the request', role: 'storage' });
    const klass = box({ x: ACT_R_X, y: SLOT_A_Y, w: ACT_W, h: ACT_H, label: 'StorageClass gp3', sublabel: 'allowVolumeExpansion', role: 'storage' });
    const resizer = box({ x: ACT_R_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'External-resizer', sublabel: 'ControllerExpandVolume', role: 'storage' });
    const kubelet = box({ x: ACT_L_X, y: BOTTOM_ACT_Y, w: ACT_W, h: ACT_H, label: 'Kubelet', sublabel: 'NodeExpandVolume', role: 'storage' });
    const disk = cylinder({ x: DISK_LEFT, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'PV data-vol', role: 'storage' });
    [kubectl, klass, resizer, kubelet].forEach(el => { el.style.opacity = '0'; });

    const lMountLow = lane(W_MOUNT_LOW);
    const lMountHigh = lane(W_MOUNT_HIGH);
    const lToPvc = lane(W_TO_PVC);
    const lCtrlExp = lane(W_CTRL_EXP);
    const lNodeExp = lane(W_NODE_EXP);
    [lToPvc, lCtrlExp, lNodeExp].forEach(el => { el.style.opacity = '0'; });

    const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start' }, [' ']);
    const verdictLbl = text({ class: 'scheme-label code dim', x: VERDICT_LBL_X, y: VERDICT_LBL_Y, 'text-anchor': 'end' }, [' ']);
    const capLbl = text({ class: 'scheme-label code dim', x: CX, y: CAP_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const CHIP_W = 252, CHIP_GAP = 24;
    const chipX = i => (1200 - (CHIP_W * 4 + CHIP_GAP * 3)) / 2 + i * (CHIP_W + CHIP_GAP);  // 60 / 336 / 612 / 888
    const reqChip = valChip({ x: chipX(0), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'requests', value: '5Gi', role: 'storage' });
    const diskChip = valChip({ x: chipX(1), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'real disk', value: '5Gi', role: 'storage' });
    const fsChip = valChip({ x: chipX(2), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'filesystem', value: '5Gi', role: 'storage' });
    const seesChip = valChip({ x: chipX(3), y: CHIP_Y, w: CHIP_W, h: CHIP_H, name: 'Pod sees', value: '5Gi', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [pvc, kubectl, klass, resizer, kubelet, disk].forEach(el => root.appendChild(el));
    [lMountLow, lMountHigh, lToPvc, lCtrlExp, lNodeExp].forEach(el => root.appendChild(el));
    [mountLbl, verdictLbl, capLbl].forEach(el => root.appendChild(el));
    root.appendChild(web.group);
    [reqChip, diskChip, fsChip, seesChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, web: web.group, app: web.innerBox,
      pvc, kubectl, klass, resizer, kubelet, disk,
      lMountLow, lMountHigh, lToPvc, lCtrlExp, lNodeExp,
      reqChip, diskChip, fsChip, seesChip,
      wires: { mount: mountLbl, verdict: verdictLbl, cap: capLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChips(s, { req, disk, fs, sees }) {
  setChip(s.refs.reqChip, req);
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.fsChip, fs);
  setChip(s.refs.seesChip, sees);
}

// Every step pins EVERY opacity that any step can change, so a step can never inherit a stale one and
// a cancel mid-flight always lands on this step's own end state.
function setStage(s, { kubectl, klass, resizer, kubelet, toPvc, ctrlExp, nodeExp }) {
  s.refs.kubectl.style.opacity = String(kubectl);
  s.refs.klass.style.opacity = String(klass);
  s.refs.resizer.style.opacity = String(resizer);
  s.refs.kubelet.style.opacity = String(kubelet);
  s.refs.lToPvc.style.opacity = String(toPvc);
  s.refs.lCtrlExp.style.opacity = String(ctrlExp);
  s.refs.lNodeExp.style.opacity = String(nodeExp);
}

// app is listed so its .highlight is cleared every step: without it a highlight set during a reduced
// replay would leak forward, since replay never runs the motion path that would re-clear it.
function clearHL(s) {
  clearHighlights(s, ['pvc', 'kubectl', 'klass', 'resizer', 'kubelet', 'disk', 'app',
    'reqChip', 'diskChip', 'fsChip', 'seesChip'], [s.refs.web]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '5Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 5Gi');
      setStage(s, { kubectl: 0, klass: 0, resizer: 0, kubelet: 0, toPvc: 0, ctrlExp: 0, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 5Gi');
    },
  },
  {
    id: 'edit',
    duration: 3200,
    narration: 'You raise spec.resources.requests.storage on the claim from 5Gi to 20Gi. That single field is the only thing anybody changes by hand in this whole card. The request now says 20Gi and nothing physical has moved: the device and the filesystem are both still 5Gi.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 20Gi');
      setStage(s, { kubectl: 1, klass: 0, resizer: 0, kubelet: 0, toPvc: 1, ctrlExp: 0, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 5Gi');
      setWire(s, 'verdict', 'request raised, nothing moved');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      // Kubectl sends the ball, so only kubectl is lit at entry and the claim waits for it to land.
      s.refs.pvc.classList.remove('highlight');
      const edit = routePacket(s, ctx, W_TO_PVC, { role: 'storage' });
      ridingLabel(s, ctx, 'requests: 20Gi', W_TO_PVC);
      lightBoxAt(s.refs.pvc, ctx, edit.arrivalMs);
    },
  },
  {
    id: 'gate',
    duration: 3200,
    narration: 'That edit was accepted only because of one field on the StorageClass the claim was provisioned from: allowVolumeExpansion is true. The check runs at admission, on the API server, so with the flag false or absent the edit itself is rejected and no resizer ever hears about it. The gate is on the way in, not further down.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '5Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'requests 20Gi');
      setStage(s, { kubectl: 0, klass: 1, resizer: 0, kubelet: 0, toPvc: 1, ctrlExp: 0, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 5Gi');
      setWire(s, 'verdict', 'expansion allowed');
      s.refs.klass.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.pvc.classList.remove('highlight');
      const gate = routePacket(s, ctx, W_TO_PVC, { role: 'storage' });
      ridingLabel(s, ctx, 'allowVolumeExpansion: true', W_TO_PVC);
      lightBoxAt(s.refs.pvc, ctx, gate.arrivalMs);
    },
  },
  {
    id: 'controller-expand',
    duration: 3200,
    narration: 'Phase one runs on the control plane side. The external-resizer sees the accepted request and calls ControllerExpandVolume on the driver, which tells the backend to grow the real block device from 5Gi to 20Gi. The device is now bigger and the PV capacity follows it. The filesystem sitting on that device has no idea and is still 5Gi.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '5Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'FileSystemResizePending');
      setStage(s, { kubectl: 0, klass: 0, resizer: 1, kubelet: 0, toPvc: 0, ctrlExp: 1, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 20Gi');
      setWire(s, 'verdict', 'device grown, fs pending');
      s.refs.resizer.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      // The resizer sends the ball, so the disk earns its light when the call lands on it.
      s.refs.disk.classList.remove('highlight');
      const exp = routePacket(s, ctx, W_CTRL_EXP, { role: 'storage' });
      ridingLabel(s, ctx, 'ControllerExpandVolume', W_CTRL_EXP);
      lightBoxAt(s.refs.disk, ctx, exp.arrivalMs);
    },
  },
  {
    id: 'node-expand',
    duration: 3200,
    narration: 'Phase two runs on the Node. Kubelet calls NodeExpandVolume, which grows the filesystem on the mounted device until it fills the larger disk. This half can only happen where the Pod actually is, because a filesystem is only growable where it is mounted. A raw block volume has no filesystem at all, so it skips this phase entirely.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '5Gi' });
      setBoxSublabel(s.refs.pvc, 'filesystem resized');
      setStage(s, { kubectl: 0, klass: 0, resizer: 0, kubelet: 1, toPvc: 0, ctrlExp: 0, nodeExp: 1 });
      setWire(s, 'cap', 'capacity 20Gi');
      setWire(s, 'verdict', 'filesystem grown');
      s.refs.kubelet.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.disk.classList.remove('highlight');
      const exp = routePacket(s, ctx, W_NODE_EXP, { role: 'storage' });
      ridingLabel(s, ctx, 'NodeExpandVolume', W_NODE_EXP);
      lightBoxAt(s.refs.disk, ctx, exp.arrivalMs);
    },
  },
  {
    id: 'pod-sees',
    duration: 3400,
    narration: 'Only now does the space reach the workload. The device grew, then the filesystem grew, and the extra room shows up inside the running container with no restart, so df in web-0 finally reads 20Gi. The order is the whole point: a filesystem can never grow past the device underneath it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '20Gi' });
      setBoxSublabel(s.refs.pvc, 'Bound, 20Gi');
      setStage(s, { kubectl: 0, klass: 0, resizer: 0, kubelet: 0, toPvc: 0, ctrlExp: 0, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 20Gi');
      setWire(s, 'mount', 'now 20Gi at /data');
      setWire(s, 'verdict', 'Bound, 20Gi');
      s.refs.disk.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.app.classList.add('highlight');
      if (ctx.reduced) return;
      // The new room rises the same axis the volume always did: disk to claim, claim to Pod.
      s.refs.pvc.classList.remove('highlight');
      s.refs.app.classList.remove('highlight');
      const hop1 = routePacket(s, ctx, W_MOUNT_LOW, { role: 'storage' });
      lightBoxAt(s.refs.pvc, ctx, hop1.arrivalMs);
      const hop2 = routePacket(s, ctx, W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, 'now 20Gi', W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.app, ctx, hop2.arrivalMs);
      pulsePod(s.refs.web, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'no-shrink',
    duration: 3200,
    narration: 'Growing works, going back does not. Ask for less than the volume already has and the API refuses the edit, because there is no safe general way to shrink a filesystem with live data on it. Walking a request back down while an expansion is still pending is a different thing: that cancels a grow that has not happened, it does not make any volume smaller.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { req: '20Gi', disk: '20Gi', fs: '20Gi', sees: '20Gi' });
      setBoxSublabel(s.refs.pvc, 'shrink refused');
      setStage(s, { kubectl: 1, klass: 0, resizer: 0, kubelet: 0, toPvc: 1, ctrlExp: 0, nodeExp: 0 });
      setWire(s, 'cap', 'capacity 20Gi');
      setWire(s, 'verdict', 'request stays 20Gi');
      s.refs.kubectl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      s.refs.pvc.classList.remove('highlight');
      const shrink = routePacket(s, ctx, W_TO_PVC, { role: 'storage' });
      ridingLabel(s, ctx, 'requests: 5Gi rejected', W_TO_PVC);
      lightBoxAt(s.refs.pvc, ctx, shrink.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
