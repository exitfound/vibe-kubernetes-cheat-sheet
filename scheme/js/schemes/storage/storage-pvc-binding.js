import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, lightBoxAt, at, makeRidingLabel, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-pvc-binding


const CX = 600;                                     // canvas + identity-spine center

const POD_W = 240, POD_H = 104, POD_X = CX - POD_W / 2, POD_Y = 56;
const POD_BOTTOM = POD_Y + POD_H;                   // 160

const PVC_W = 240, PVC_H = 68, PVC_X = CX - PVC_W / 2, PVC_Y = 236;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H; // 720 / 304
const PVC_MID = PVC_Y + PVC_H / 2;                  // 270

// Standard controller box, same footprint as kube-proxy in the networking cards (220 x 72). Its
// vertical center sits on PVC_MID so the watch and bind hops stay straight horizontals.
const CTRL_W = 220, CTRL_H = 72, CTRL_X = 850, CTRL_Y = PVC_MID - CTRL_H / 2;
const CTRL_LEFT = CTRL_X, CTRL_RIGHT = CTRL_X + CTRL_W, CTRL_BOTTOM = CTRL_Y + CTRL_H; // 850 / 1070 / 306
const CTRL_CX = CTRL_X + CTRL_W / 2, CTRL_MID = CTRL_Y + CTRL_H / 2;                    // 960 / 270

// The second claim (exclusive step) sits above the controller, denied by a short straight hop up.
const PVCB_W = 200, PVCB_H = 68, PVCB_X = CTRL_CX - PVCB_W / 2, PVCB_Y = 100;
const PVCB_CX = PVCB_X + PVCB_W / 2, PVCB_BOTTOM = PVCB_Y + PVCB_H; // 990 / 168

// The disk shelf: three PVs spread symmetrically around the spine. The controller scans them from
// BELOW, so their tops carry only the mount lane and their bottoms receive the probe.
const PV_Y = 384, PV_H = 86;
const PV_TOP = PV_Y, PV_BOTTOM = PV_Y + PV_H;       // 384 / 470
const SMALL_CX = 280, MATCH_CX = CX, SLOW_CX = 920; // 280 / 600 / 920

const MOUNT_X = CX;     // the ONE spine lane: the mount ascent, arrowheaded, dead center
const DROP_X = 1120;    // the probe exits the controller's right side and wraps down here, clear of PV-b22
const BUS_Y = 520;      // the scan bus runs BELOW the shelf, a generous gap under the cylinder bottoms
const LANE = 12;        // half-gap between the two horizontal PVC<->controller lanes
const SPEC_Y = PV_Y + 62;   // inside the cylinder, a line under its name
const VERDICT_Y = 544;  // per-disk verdict, below the scan bus
const CHIPS_Y = 572;


const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight
const W_CTRL_TO_PVC = [[CTRL_LEFT, PVC_MID + LANE], [PVC_RIGHT, PVC_MID + LANE]];   // bind write, straight
const W_SCAN_SMALL  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SMALL_CX, BUS_Y], [SMALL_CX, PV_BOTTOM]];
const W_SCAN_MATCH  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [MATCH_CX, BUS_Y], [MATCH_CX, PV_BOTTOM]];
const W_SCAN_SLOW   = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SLOW_CX, BUS_Y], [SLOW_CX, PV_BOTTOM]];
const W_CTRL_TO_PVCB = [[PVCB_CX, CTRL_Y], [PVCB_CX, PVCB_BOTTOM]];   // deny, straight up
const W_MOUNT_LOW   = [[MOUNT_X, PV_TOP], [MOUNT_X, PVC_BOTTOM]];   // PV -> PVC, upward
const W_MOUNT_HIGH  = [[MOUNT_X, PVC_Y], [MOUNT_X, POD_BOTTOM]];    // PVC -> Pod, upward

// Dims a rejected disk on arrival of the probe that rejected it, for the same reason.
function dimBoxAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(OPACITY.notready); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: OPACITY.notready }], { duration: 400, delay, fill: 'forwards', easing: 'ease-out' }));
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage' });

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + (h - 52) / 2, w: w - 40, h: 52, label: 'app', sublabel: 'writes to /data', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function diskBlock(cx, w, label, spec) {
  const cyl = cylinder({ x: cx - w / 2, y: PV_Y, w, h: PV_H, label, role: 'storage' });
  const group = g({});
  group.appendChild(cyl);
  group.appendChild(text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [spec]));
  return { group, cyl };
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
      'aria-label': 'PersistentVolumeClaim to PersistentVolume binding: a claim states the capacity, access mode and class it needs, the binding controller scans the available volumes and rejects the ones that do not fit, pairs the claim with the one that does by writing the link both ways, and only then can Kubelet mount the volume into the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim' });
    const ctrl   = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'PV binding controller', sublabel: 'kube-controller-manager', role: 'storage' });
    const pvc    = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, RWO, local-ssd', role: 'storage' });
    const pvcB   = box({ x: PVCB_X, y: PVCB_Y, w: PVCB_W, h: PVCB_H, label: 'PVC data-claim-2', sublabel: 'wants 5Gi, RWO, local-ssd', role: 'storage' });
    pvcB.style.opacity = '0';

    const pvA = diskBlock(SMALL_CX, 200, 'PV-a01', '2Gi, RWO, local-ssd');
    const pvX = diskBlock(MATCH_CX, 230, 'PV-x73a', '5Gi, RWO, local-ssd');
    const pvB = diskBlock(SLOW_CX, 200, 'PV-b22', '5Gi, RWO, local-hdd');
    const pvSmall = pvA.group, pvMatch = pvX.group, pvSlow = pvB.group;
    const pvMatchCyl = pvX.cyl;   // .highlight rides the cylinder itself, the wrapper only carries opacity

    const wPvcToCtrl = pathArrow({ points: W_PVC_TO_CTRL, dashed: true, dim: true, role: 'storage' });
    const wCtrlToPvc = pathArrow({ points: W_CTRL_TO_PVC, dashed: true, dim: true, role: 'storage' });
    const wScanSmall = pathArrow({ points: W_SCAN_SMALL, dashed: true, dim: true, role: 'storage' });
    const wScanMatch = pathArrow({ points: W_SCAN_MATCH, dashed: true, dim: true, role: 'storage' });
    const wScanSlow  = pathArrow({ points: W_SCAN_SLOW,  dashed: true, dim: true, role: 'storage' });
    const wMountLow  = pathArrow({ points: W_MOUNT_LOW,  dashed: true, dim: true, role: 'storage' });
    const wMountHigh = pathArrow({ points: W_MOUNT_HIGH, dashed: true, dim: true, role: 'storage' });
    const wCtrlToPvcB = pathArrow({ points: W_CTRL_TO_PVCB, dashed: true, dim: true, role: 'storage' });
    wCtrlToPvcB.style.opacity = '0';

    // Wire labels: blank at build, filled per step by setWire, cleared by clearWires.
    const mountLbl   = text({ class: 'scheme-label code dim', x: MOUNT_X + 16, y: 200, 'text-anchor': 'start' }, [' ']);
    const smallLbl   = text({ class: 'scheme-label code dim', x: SMALL_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const matchLbl   = text({ class: 'scheme-label code dim', x: MATCH_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const slowLbl    = text({ class: 'scheme-label code dim', x: SLOW_CX,  y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);

    const pvcChip   = valChip({ x: 105, y: CHIPS_Y, w: 200, h: 34, name: 'PVC',     value: 'Pending',   role: 'storage' });
    // Named for the ONE volume it tracks. A bare 'PV' would be a lie from the bind step on, since
    // PV-a01 and PV-b22 stay Available after PV-x73a goes Bound.
    const pvChip    = valChip({ x: 325, y: CHIPS_Y, w: 200, h: 34, name: 'PV-x73a', value: 'Available', role: 'storage' });
    const bindChip  = valChip({ x: 545, y: CHIPS_Y, w: 330, h: 34, name: 'binding', value: 'none',      role: 'storage' });
    const mountChip = valChip({ x: 895, y: CHIPS_Y, w: 200, h: 34, name: 'mount',   value: 'none',      role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    [ctrl, pvc, pvcB, appPod.group, pvSmall, pvMatch, pvSlow].forEach(el => root.appendChild(el));
    [wPvcToCtrl, wCtrlToPvc, wScanSmall, wScanMatch, wScanSlow, wMountLow, wMountHigh, wCtrlToPvcB].forEach(el => root.appendChild(el));
    [mountLbl, smallLbl, matchLbl, slowLbl].forEach(el => root.appendChild(el));
    [pvcChip, pvChip, bindChip, mountChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, appPod: appPod.group, appBox: appPod.innerBox,
      ctrl, pvc, pvcB, pvSmall, pvMatch, pvSlow, pvMatchCyl,
      wCtrlToPvcB,
      pvcChip, pvChip, bindChip, mountChip,
      wires: { mount: mountLbl, small: smallLbl, match: matchLbl, slow: slowLbl },
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
function setChips(s, { pvc, pv, bind, mount }) {
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.pvChip, pv);
  setChip(s.refs.bindChip, bind);
  setChip(s.refs.mountChip, mount);
}


function clearHL(s) {
  clearHighlights(s, ['ctrl', 'pvc', 'pvcB', 'pvSmall', 'pvMatchCyl', 'pvSlow', 'appBox',
    'pvcChip', 'pvChip', 'bindChip', 'mountChip'], [s.refs.appPod]);
  s.refs.pvSmall.style.opacity = '1';
  s.refs.pvSlow.style.opacity = '1';
}

const BOUND = 'data-claim <-> PV-x73a';

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
    },
  },
  {
    id: 'claim',
    duration: 2000,
    narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the local-ssd StorageClass. The scheduler will not place the Pod while the claim it references is still unbound.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
    },
  },
  {
    id: 'watch',
    duration: 2100,
    narration: 'The binding controller watches every claim in the cluster. It picks this one up because it is Pending, and reads the three things it has to satisfy: capacity, access mode and StorageClass.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); return; }
      // Infra to infra: no pod is involved, so there is no pulse to lead with. The claim rides along.
      const watch = routePacket(s, ctx, W_PVC_TO_CTRL, { role: 'storage' });
      ridingLabel(s, ctx, '5Gi, RWO, local-ssd', W_PVC_TO_CTRL);
      lightBoxAt(s.refs.ctrl, ctx, watch.arrivalMs);
    },
  },
  {
    id: 'match',
    duration: 3400,
    narration: 'The controller checks every Available volume in one sweep. PV-a01 is only 2Gi, which is under what the claim asks for, and PV-b22 is the local-hdd class rather than local-ssd. Only PV-x73a satisfies all three conditions, so it is the candidate.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'candidate PV-x73a', mount: 'none' });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      if (ctx.reduced) {
        s.refs.pvMatchCyl.classList.add('highlight');
        s.refs.pvSmall.style.opacity = String(OPACITY.notready);
        s.refs.pvSlow.style.opacity = String(OPACITY.notready);
        setWire(s, 'small', 'too small');
        setWire(s, 'match', '5Gi, RWO, local-ssd OK');
        setWire(s, 'slow', 'wrong class');
        return;
      }
      // The candidate is a VERDICT of the sweep, so it starts from what the watch step left it at
      // and is named on the same arrival that lights PV-x73a and writes its wire.
      setVal(s.refs.bindChip, 'none');
      const toSmall = routePacket(s, ctx, W_SCAN_SMALL, { role: 'storage' });
      const toMatch = routePacket(s, ctx, W_SCAN_MATCH, { role: 'storage' });
      const toSlow  = routePacket(s, ctx, W_SCAN_SLOW,  { role: 'storage' });
      dimBoxAt(s.refs.pvSmall, ctx, toSmall.arrivalMs);
      dimBoxAt(s.refs.pvSlow, ctx, toSlow.arrivalMs);
      lightBoxAt(s.refs.pvMatchCyl, ctx, toMatch.arrivalMs);
      // Each verdict is written when its OWN probe lands. All three used to be on screen at step
      // entry, so the reader was told which volume wins before the sweep that decides it had run,
      // and the three probes land 1.4s apart because the three lanes are different lengths.
      at(s, ctx, toSmall.arrivalMs, () => setWire(s, 'small', 'too small'));
      at(s, ctx, toMatch.arrivalMs, () => {
        setWire(s, 'match', '5Gi, RWO, local-ssd OK');
        setChip(s.refs.bindChip, 'candidate PV-x73a');
      });
      at(s, ctx, toSlow.arrivalMs,  () => setWire(s, 'slow', 'wrong class'));
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Binding is written on both objects. The claim gets a volumeName pointing at PV-x73a, and the volume gets a claimRef pointing back at data-claim. Both turn Bound, and because the volume now names its claim, no other claim can ever take it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', pv: 'Bound', bind: BOUND, mount: 'none' });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(OPACITY.notready);
      s.refs.pvSlow.style.opacity = String(OPACITY.notready);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); s.refs.pvMatchCyl.classList.add('highlight'); return; }
      // Two writes leave the controller at once: one down to the claim, one down to the volume.
      const pvcPkt = routePacket(s, ctx, W_CTRL_TO_PVC, { role: 'storage' });
      lightBoxAt(s.refs.pvc, ctx, pvcPkt.arrivalMs);
      ridingLabel(s, ctx, 'volumeName: PV-x73a', W_CTRL_TO_PVC);
      const pvMatchCylPkt = routePacket(s, ctx, W_SCAN_MATCH, { role: 'storage' });
      lightBoxAt(s.refs.pvMatchCyl, ctx, pvMatchCylPkt.arrivalMs);
      ridingLabel(s, ctx, 'claimRef: data-claim', W_SCAN_MATCH);
    },
  },
  {
    id: 'mount',
    duration: 3400,
    narration: 'Only now can the volume be used. Kubelet resolves the claim to the volume it is bound to, mounts it at /data inside the container, and the Pod finally starts. The claim is the handle the Pod holds, and the volume behind it is what actually stores the bytes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', pv: 'Bound', bind: BOUND, mount: 'mounted at /data' });
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvMatchCyl.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(OPACITY.notready);
      s.refs.pvSlow.style.opacity = String(OPACITY.notready);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setWire(s, 'mount', 'kubelet mount');
      // The Pod is running by the end of this step, so full opacity is the static end-state.
      s.refs.appPod.style.opacity = '1';
      if (ctx.reduced) { s.refs.pvc.classList.add('highlight'); s.refs.appBox.classList.add('highlight'); return; }
      // The ascent: the volume rises PV -> PVC -> Pod. The ball enters the claim at its bottom edge
      // and re-emerges at its top edge, because the claim is what the mount is resolved THROUGH,
      // which is also why the claim lights on that first arrival rather than at step entry.
      const hop1 = routePacket(s, ctx, W_MOUNT_LOW, { role: 'storage' });
      lightBoxAt(s.refs.pvc, ctx, hop1.arrivalMs);
      const hop2 = routePacket(s, ctx, W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop, role: 'storage' });
      ridingLabel(s, ctx, '/data', W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop });
      s.refs.appPod.style.opacity = String(OPACITY.pending);
      // The ball arrives AT the Pod, so the Pod pulses on arrival, not before it.
      ctx.register(s.refs.appPod.animate([{ opacity: OPACITY.pending }, { opacity: 1 }], { duration: 500, delay: hop2.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.appPod, ctx, hop2.arrivalMs);
      lightBoxAt(s.refs.appBox, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'exclusive',
    duration: 2600,
    narration: 'Binding is one to one and it is permanent. A second claim asking for exactly the same thing finds PV-x73a already carrying a claimRef, so that volume is no longer Available to anyone. These volumes were pre-created by an administrator and the class has no provisioner behind it, so nothing builds a new one. The second claim just stays Pending.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', pv: 'Bound', bind: BOUND, mount: 'mounted at /data' });
      s.refs.appPod.style.opacity = '1';
      s.refs.pvcB.style.opacity = '1';
      s.refs.wCtrlToPvcB.style.opacity = '1';
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvMatchCyl.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(OPACITY.notready);
      s.refs.pvSlow.style.opacity = String(OPACITY.notready);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setBoxSublabel(s.refs.pvcB, 'Pending, no volume');
      if (ctx.reduced) { s.refs.pvcB.classList.add('highlight'); return; }
      const deny = routePacket(s, ctx, W_CTRL_TO_PVCB, { role: 'storage' });
      ridingLabel(s, ctx, 'no volume available', W_CTRL_TO_PVCB);
      lightBoxAt(s.refs.pvcB, ctx, deny.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
