import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// STORAGE card. Layout is a CENTERED vertical spine (viewBox 1200x640). The identity column
// Pod -> PVC -> PV-x73a shares one line down the canvas center (CX=600), because binding is what
// fuses those three into one chain. The spine is a SINGLE dead-center lane, the mount ascent, drawn
// with arrowheads (the volume rising PV -> PVC -> Pod). It is the only vertical the tops of the Pod
// and the center cylinder touch: the headless relationship lines were dropped so the center reads
// as one clean arrowed axis rather than a crowded pair.
//
// The disk shelf holds three PVs spread SYMMETRICALLY around the spine. The binding controller sits
// at the right, its vertical center aligned with the PVC so the watch and the bind write are
// STRAIGHT horizontal hops, no zigzag. Crucially the controller scans the shelf FROM BELOW: the
// probe EXITS the controller from its right side (centered), wraps down its outer edge (clear of
// PV-b22), runs a bus under the whole shelf, and rises into each cylinder BOTTOM with a generous gap
// before the turn. That keeps every probe off the cylinder tops. The second claim of the exclusive
// step sits above the controller, denied by a short straight hop up. Cylinders are the PVs: they
// light, they never pulse. Only the Pod pulses. The narration overlay owns the top-left band
// (x<=380, y<=300), clear of every block.
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

const DIM = 0.45;       // a disk the controller has just rejected

// Each static wire and its moving ball share the exact same array, so they cannot drift. Every
// endpoint sits on a block edge, so a ball never travels underneath a box. The watch and the bind
// write are single straight horizontal hops off the PVC. The scan EXITS the controller's right side
// (centered), turns down its outer edge, turns left along the bus, then rises into each cylinder.
const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight
const W_CTRL_TO_PVC = [[CTRL_LEFT, PVC_MID + LANE], [PVC_RIGHT, PVC_MID + LANE]];   // bind write, straight
const W_SCAN_SMALL  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SMALL_CX, BUS_Y], [SMALL_CX, PV_BOTTOM]];
const W_SCAN_MATCH  = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [MATCH_CX, BUS_Y], [MATCH_CX, PV_BOTTOM]];
const W_SCAN_SLOW   = [[CTRL_RIGHT, CTRL_MID], [DROP_X, CTRL_MID], [DROP_X, BUS_Y], [SLOW_CX, BUS_Y], [SLOW_CX, PV_BOTTOM]];
const W_CTRL_TO_PVCB = [[PVCB_CX, CTRL_Y], [PVCB_CX, PVCB_BOTTOM]];   // deny, straight up
const W_MOUNT_LOW   = [[MOUNT_X, PV_TOP], [MOUNT_X, PVC_BOTTOM]];   // PV -> PVC, upward
const W_MOUNT_HIGH  = [[MOUNT_X, PVC_Y], [MOUNT_X, POD_BOTTOM]];    // PVC -> Pod, upward

// Lights an infrastructure block ON PACKET ARRIVAL rather than at step entry, via a zero-effect
// animation whose onfinish sets the class. Under reduced motion it applies immediately so the
// static end-state stays correct. This is how a box receives a packet without pulsing.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Dims a rejected disk on arrival of the probe that rejected it, for the same reason.
function dimBoxAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(DIM); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: DIM }], { duration: 400, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. It lives in the packet layer but is not a .scheme-packet, so the
// tools do not count it as one. dur omitted => routeDur(points), matching a ball that also omits it.
// Pass easing:'linear' for a straight segmentPacket hop, or the tag drifts off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  // Pin the tag at the route start. Without this it sits at the SVG origin until animateAlong's
  // delay elapses, and its fade-in (which leads the travel by 150ms) plays in the top-left corner.
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock({ x, y, w, h, label, sublabel }) {
  const shell = pod({ x, y, w, h, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: y + (h - 52) / 2, w: w - 40, h: 52, label: 'App', sublabel: 'writes to /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// A disk is a cylinder plus its spec line, wrapped in a g so dimming a rejected volume fades the
// spec WITH it (the name already rides inside the cylinder). The cylinder is returned separately
// because .highlight must sit on the .scheme-cylinder element itself, not on the wrapper.
function diskBlock(cx, w, label, spec) {
  const cyl = cylinder({ x: cx - w / 2, y: PV_Y, w, h: PV_H, label, cat: 'storage' });
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
      'aria-label': 'PersistentVolumeClaim to PersistentVolume binding: a claim states the capacity, access mode and class it needs, the binding controller scans the available volumes and rejects the ones that do not fit, pairs the claim with the one that does by writing the link both ways, and only then can kubelet mount the volume into the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const appPod = podBlock({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'volumes: data-claim' });
    const ctrl   = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'PV binding controller', sublabel: 'kube-controller-manager', cat: 'storage' });
    const pvc    = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, RWO, local-ssd', cat: 'storage' });
    const pvcB   = box({ x: PVCB_X, y: PVCB_Y, w: PVCB_W, h: PVCB_H, label: 'PVC data-claim-2', sublabel: 'wants 5Gi, RWO, local-ssd', cat: 'storage' });
    pvcB.style.opacity = '0';

    // Each disk states all THREE things the claim is matched on (capacity, access mode, class), so a
    // viewer can verify the verdict the match step narrates instead of taking it on trust. Access
    // mode is identical on all three on purpose: the two rejections must turn on size and class only.
    const pvA = diskBlock(SMALL_CX, 200, 'PV-a01', '2Gi, RWO, local-ssd');
    const pvX = diskBlock(MATCH_CX, 230, 'PV-x73a', '5Gi, RWO, local-ssd');
    const pvB = diskBlock(SLOW_CX, 200, 'PV-b22', '5Gi, RWO, local-hdd');
    const pvSmall = pvA.group, pvMatch = pvX.group, pvSlow = pvB.group;
    const pvMatchCyl = pvX.cyl;   // .highlight rides the cylinder itself, the wrapper only carries opacity

    const wPvcToCtrl = pathArrow({ points: W_PVC_TO_CTRL, dashed: true, dim: true, color: 'storage' });
    const wCtrlToPvc = pathArrow({ points: W_CTRL_TO_PVC, dashed: true, dim: true, color: 'storage' });
    const wScanSmall = pathArrow({ points: W_SCAN_SMALL, dashed: true, dim: true, color: 'storage' });
    const wScanMatch = pathArrow({ points: W_SCAN_MATCH, dashed: true, dim: true, color: 'storage' });
    const wScanSlow  = pathArrow({ points: W_SCAN_SLOW,  dashed: true, dim: true, color: 'storage' });
    const wMountLow  = pathArrow({ points: W_MOUNT_LOW,  dashed: true, dim: true, color: 'storage' });
    const wMountHigh = pathArrow({ points: W_MOUNT_HIGH, dashed: true, dim: true, color: 'storage' });
    const wCtrlToPvcB = pathArrow({ points: W_CTRL_TO_PVCB, dashed: true, dim: true, color: 'storage' });
    wCtrlToPvcB.style.opacity = '0';

    // Wire labels: blank at build, filled per step by setWire, cleared by clearWires.
    const mountLbl   = text({ class: 'scheme-label code dim', x: MOUNT_X + 16, y: 200, 'text-anchor': 'start' }, [' ']);
    const smallLbl   = text({ class: 'scheme-label code dim', x: SMALL_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const matchLbl   = text({ class: 'scheme-label code dim', x: MATCH_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const slowLbl    = text({ class: 'scheme-label code dim', x: SLOW_CX,  y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);

    const pvcChip   = valChip({ x: 105, y: CHIPS_Y, w: 200, h: 34, name: 'PVC',     value: 'Pending',   cat: 'storage' });
    // Named for the ONE volume it tracks. A bare 'PV' would be a lie from the bind step on, since
    // PV-a01 and PV-b22 stay Available after PV-x73a goes Bound.
    const pvChip    = valChip({ x: 325, y: CHIPS_Y, w: 200, h: 34, name: 'PV-x73a', value: 'Available', cat: 'storage' });
    const bindChip  = valChip({ x: 545, y: CHIPS_Y, w: 330, h: 34, name: 'binding', value: 'none',      cat: 'storage' });
    const mountChip = valChip({ x: 895, y: CHIPS_Y, w: 200, h: 34, name: 'mount',   value: 'none',      cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the blocks, then the wires and their labels ABOVE them (so a
    // connector that crosses a block stays visible and the text stays legible), then the static
    // disk specs, then the chip strip, then the packet layer so every ball rides above everything.
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

// Every enter() calls this, so no chip can ever keep a stale value from the previous step. A chip
// whose value CHANGED this step also lights (static highlight, never a flash): valueText still holds
// the previous step's text at call time (clearHL clears the highlight class, not the text), and steps
// are always entered in order (gotoStep rebuilds then replays 0..target), so the diff is deterministic.
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

// appBox is listed so its .highlight is cleared every step: without it a highlight set during a
// reduced replay would leak forward, since replay never runs the motion path that would re-clear it.
// The disk opacities and the two late-appearing elements are reset here for the same reason.
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
    narration: 'The Pod asks for a volume by naming a claim, data-claim, and that claim is still Pending. Three PersistentVolumes exist in the cluster and none of them is spoken for yet. Until the claim is bound to one of them, the Pod cannot start.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = '0.5';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
    },
  },
  {
    id: 'claim',
    duration: 2000,
    // Deliberately motionless, and it must STAY that way. The claim is a statement of need, nothing
    // acts in this step: the Pod does not pulse (it is the subject being blocked, not an actor) and
    // the PVC takes a static .highlight only. A block flash would be canon-legal here (packet-less
    // and pod-less) but was tried and rejected: it reads as the PVC doing something when it is not.
    narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the local-ssd StorageClass. The scheduler will not place the Pod while the claim it references is still unbound.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = '0.5';
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
      s.refs.appPod.style.opacity = '0.5';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); return; }
      // Infra to infra: no pod is involved, so there is no pulse to lead with. The claim rides along.
      const watch = routePacket(s, ctx, W_PVC_TO_CTRL, { cat: 'storage' });
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
      s.refs.appPod.style.opacity = '0.5';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'small', 'too small');
      setWire(s, 'match', '5Gi, RWO, local-ssd OK');
      setWire(s, 'slow', 'wrong class');
      if (ctx.reduced) {
        s.refs.pvMatchCyl.classList.add('highlight');
        s.refs.pvSmall.style.opacity = String(DIM);
        s.refs.pvSlow.style.opacity = String(DIM);
        return;
      }
      // All three probes leave the controller TOGETHER: the scan is one sweep of the shelf, not a
      // queue, and the simultaneous fan-out is the whole read of this step. They land at their own
      // pace (1222 / 1933 / 2600 ms for slow / match / small) because routeDur normalizes speed and
      // the routes are very different lengths. Do not stagger them to make the verdicts resolve in
      // narration order: that was tried and it turns one sweep into three separate errands.
      const toSmall = routePacket(s, ctx, W_SCAN_SMALL, { cat: 'storage' });
      const toMatch = routePacket(s, ctx, W_SCAN_MATCH, { cat: 'storage' });
      const toSlow  = routePacket(s, ctx, W_SCAN_SLOW,  { cat: 'storage' });
      dimBoxAt(s.refs.pvSmall, ctx, toSmall.arrivalMs);
      dimBoxAt(s.refs.pvSlow, ctx, toSlow.arrivalMs);
      lightBoxAt(s.refs.pvMatchCyl, ctx, toMatch.arrivalMs);
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
      s.refs.appPod.style.opacity = '0.5';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pvMatchCyl.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      if (ctx.reduced) return;
      // Two writes leave the controller at once: one down to the claim, one down to the volume.
      routePacket(s, ctx, W_CTRL_TO_PVC, { cat: 'storage' });
      ridingLabel(s, ctx, 'volumeName: PV-x73a', W_CTRL_TO_PVC);
      routePacket(s, ctx, W_SCAN_MATCH, { cat: 'storage' });
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
      s.refs.pvc.classList.add('highlight');
      s.refs.pvMatchCyl.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setWire(s, 'mount', 'kubelet mount');
      // The Pod is running by the end of this step, so full opacity is the static end-state.
      s.refs.appPod.style.opacity = '1';
      if (ctx.reduced) { s.refs.appBox.classList.add('highlight'); return; }
      // The ascent: the volume rises PV -> PVC -> Pod. The ball enters the claim at its bottom edge
      // and re-emerges at its top edge, because the claim is what the mount is resolved THROUGH.
      const hop1 = routePacket(s, ctx, W_MOUNT_LOW, { cat: 'storage' });
      const hop2 = routePacket(s, ctx, W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, '/data', W_MOUNT_HIGH, { delay: hop1.arrivalMs + BEAT.afterHop });
      // The Pod stays dim until the volume actually reaches it, so the motion path re-dims it and
      // the animation carries it back to the 1 pinned above. Without the re-dim the pod would sit
      // at full opacity and then snap BACK to 0.5 the instant the animation became active.
      s.refs.appPod.style.opacity = '0.5';
      // The ball arrives AT the Pod, so the Pod pulses on arrival, not before it.
      ctx.register(s.refs.appPod.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: hop2.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
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
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setBoxSublabel(s.refs.pvcB, 'Pending, no volume');
      if (ctx.reduced) { s.refs.pvcB.classList.add('highlight'); return; }
      const deny = routePacket(s, ctx, W_CTRL_TO_PVCB, { cat: 'storage' });
      ridingLabel(s, ctx, 'no volume available', W_CTRL_TO_PVCB);
      lightBoxAt(s.refs.pvcB, ctx, deny.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
