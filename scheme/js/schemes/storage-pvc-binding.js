import { svg, g, text, line } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// STORAGE EXEMPLAR. Layout zones (viewBox 1200x640). The storage grammar is a VERTICAL STACK:
// the consumer on top, the machinery to the side, the disks on a shelf at the bottom. The
// recurring gesture is a descent (the controller reaching down to the disks) and an ascent (the
// mount rising back up into the Pod).
//
// The IDENTITY COLUMN at x=440 is the spine of the card: Pod -> PVC -> PV all share the same
// vertical line, because binding is what turns those three into one chain. Above the PVC it is a
// bare dashed line with NO arrowhead (pod.spec.volumes REFERENCES the claim, it is a relationship,
// not traffic). Below the PVC it is the Bound link, hidden until the bind step, also arrowhead-free
// for the same reason. The MOUNT LANE at x=580 runs parallel to it and is the only route that
// carries traffic upward: the mounted volume rising PV -> PVC -> Pod. It gets its own lane so the
// ascent never retraces the identity column.
//
// The binding controller sits top-right and reaches DOWN to the disk shelf on the scan bus (y=405).
// Forward (controller -> PVC) and return (PVC -> controller) have SEPARATE lanes so the watch and
// the write read as a loop, never a retrace. Cylinders are the PVs: they light, they never pulse.
// Only the Pod pulses. The narration overlay owns the top-left band (x<=380, y<=300), so every
// block except the left-hand disk (whose top is at y=450, well below it) starts at x>=400.
const POD_X = 400, POD_Y = 50, POD_W = 220, POD_H = 115;
const POD_BOTTOM = POD_Y + POD_H;                   // 165

const CTRL_X = 760, CTRL_Y = 120, CTRL_W = 320, CTRL_H = 100;
const CTRL_LEFT = CTRL_X, CTRL_BOTTOM = CTRL_Y + CTRL_H; // 760 / 220
const CTRL_CX = CTRL_X + CTRL_W / 2;                // 920

const PVC_X = 400, PVC_Y = 280, PVC_W = 220, PVC_H = 70;
const PVC_RIGHT = PVC_X + PVC_W, PVC_BOTTOM = PVC_Y + PVC_H; // 620 / 350

const PVCB_X = 690, PVCB_Y = 280, PVCB_W = 200, PVCB_H = 70;
const PVCB_CX = PVCB_X + PVCB_W / 2;                // 790

// The disk shelf. pvSlow is centred on CTRL_CX so the controller can probe it straight down.
const PV_Y = 450, PV_H = 95;
const PV_TOP = PV_Y;                                // 450
const SMALL_CX = 185, MATCH_CX = 510, SLOW_CX = CTRL_CX; // 185 / 510 / 920

const REF_X = 440;      // the identity column: reference line above the PVC, Bound link below it
const MOUNT_X = 580;    // the ascent lane, parallel to the identity column
const BUS_Y = 405;      // the controller reaches the shelf along this horizontal bus
// The disk spec sits INSIDE the cylinder, a line under its name. Above the disk it would land on the
// scan wire dropping into that same disk (the wire enters at the centre, which is where a centred
// label also sits) and the line would strike straight through the text.
const SPEC_Y = PV_Y + 66;
const VERDICT_Y = 567;  // per-disk verdict, filled by setWire
const CHIPS_Y = 585;

const DIM = 0.45;       // a disk the controller has just rejected

// Each static wire and its moving ball share the exact same array, so they cannot drift. Every
// endpoint sits on a block edge, so a ball never travels underneath a box.
const W_PVC_TO_CTRL = [[PVC_RIGHT, 296], [658, 296], [658, 168], [CTRL_LEFT, 168]];
const W_CTRL_TO_PVC = [[CTRL_LEFT, 192], [646, 192], [646, 334], [PVC_RIGHT, 334]];
const W_SCAN_SMALL  = [[CTRL_CX, CTRL_BOTTOM], [CTRL_CX, BUS_Y], [SMALL_CX, BUS_Y], [SMALL_CX, PV_TOP]];
const W_SCAN_MATCH  = [[CTRL_CX, CTRL_BOTTOM], [CTRL_CX, BUS_Y], [MATCH_CX, BUS_Y], [MATCH_CX, PV_TOP]];
const W_SCAN_SLOW   = [[CTRL_CX, CTRL_BOTTOM], [CTRL_CX, PV_TOP]];
const W_CTRL_TO_PVCB = [[PVCB_CX, CTRL_BOTTOM], [PVCB_CX, PVCB_Y]];
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
  const innerBox = box({ x: x + 20, y: y + 40, w: w - 40, h: 52, label: 'app', sublabel: 'writes to /data', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

function specText(cx, txt) {
  return text({ class: 'scheme-label code dim', x: cx, y: SPEC_Y, 'text-anchor': 'middle' }, [txt]);
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
    const pvc    = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-claim', sublabel: 'wants 5Gi, RWO, gp3', cat: 'storage' });
    const pvcB   = box({ x: PVCB_X, y: PVCB_Y, w: PVCB_W, h: PVCB_H, label: 'PVC data-claim-2', sublabel: 'wants 5Gi, RWO, gp3', cat: 'storage' });
    pvcB.style.opacity = '0';

    const pvSmall = cylinder({ x: SMALL_CX - 95, y: PV_Y, w: 190, h: PV_H, label: 'pv-a01', cat: 'storage' });
    const pvMatch = cylinder({ x: MATCH_CX - 110, y: PV_Y, w: 220, h: PV_H, label: 'pv-x73a', cat: 'storage' });
    const pvSlow  = cylinder({ x: SLOW_CX - 90, y: PV_Y, w: 180, h: PV_H, label: 'pv-b22', cat: 'storage' });

    // The identity column. Above the PVC: the Pod references the claim by name. Below it: the Bound
    // link, revealed once the pair exists. Neither carries traffic, so neither has an arrowhead:
    // arrow() always attaches a marker, which would read as a wire missing its ball.
    const refLink = line({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', x1: REF_X, y1: POD_BOTTOM, x2: REF_X, y2: PVC_Y, 'stroke-dasharray': '5 5', fill: 'none' });
    const boundLink = line({ class: 'scheme-arrow scheme-arrow-storage', x1: REF_X, y1: PVC_BOTTOM, x2: REF_X, y2: PV_TOP, fill: 'none' });
    boundLink.style.opacity = '0';

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
    const boundLbl   = text({ class: 'scheme-label code dim', x: REF_X - 25, y: 382, 'text-anchor': 'end' }, [' ']);
    const mountLbl   = text({ class: 'scheme-label code dim', x: 505, y: 210, 'text-anchor': 'middle' }, [' ']);
    const smallLbl   = text({ class: 'scheme-label code dim', x: SMALL_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const matchLbl   = text({ class: 'scheme-label code dim', x: MATCH_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const slowLbl    = text({ class: 'scheme-label code dim', x: SLOW_CX,  y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);

    const pvcChip   = valChip({ x: 90,  y: CHIPS_Y, w: 200, h: 34, name: 'PVC',     value: 'Pending',   cat: 'storage' });
    const pvChip    = valChip({ x: 310, y: CHIPS_Y, w: 200, h: 34, name: 'PV',      value: 'Available', cat: 'storage' });
    const bindChip  = valChip({ x: 530, y: CHIPS_Y, w: 330, h: 34, name: 'binding', value: 'none',      cat: 'storage' });
    const mountChip = valChip({ x: 880, y: CHIPS_Y, w: 200, h: 34, name: 'mount',   value: 'none',      cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the blocks, then the wires and their labels ABOVE them (so a
    // connector that crosses a block stays visible and the text stays legible), then the static
    // disk specs, then the chip strip, then the packet layer so every ball rides above everything.
    [ctrl, pvc, pvcB, appPod.group, pvSmall, pvMatch, pvSlow].forEach(el => root.appendChild(el));
    [refLink, boundLink, wPvcToCtrl, wCtrlToPvc, wScanSmall, wScanMatch, wScanSlow, wMountLow, wMountHigh, wCtrlToPvcB].forEach(el => root.appendChild(el));
    [boundLbl, mountLbl, smallLbl, matchLbl, slowLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(SMALL_CX, '2Gi, gp3'));
    root.appendChild(specText(MATCH_CX, '5Gi, gp3'));
    root.appendChild(specText(SLOW_CX,  '5Gi, standard'));
    [pvcChip, pvChip, bindChip, mountChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, appPod: appPod.group, appBox: appPod.innerBox,
      ctrl, pvc, pvcB, pvSmall, pvMatch, pvSlow,
      boundLink, wCtrlToPvcB,
      pvcChip, pvChip, bindChip, mountChip,
      wires: { bound: boundLbl, mount: mountLbl, small: smallLbl, match: matchLbl, slow: slowLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// Every enter() calls this, so no chip can ever keep a stale value from the previous step.
function setChips(s, { pvc, pv, bind, mount }) {
  setVal(s.refs.pvcChip, pvc);
  setVal(s.refs.pvChip, pv);
  setVal(s.refs.bindChip, bind);
  setVal(s.refs.mountChip, mount);
}

// appBox is listed so its .highlight is cleared every step: without it a highlight set during a
// reduced replay would leak forward, since replay never runs the motion path that would re-clear it.
// The disk opacities and the two late-appearing elements are reset here for the same reason.
function clearHL(s) {
  clearHighlights(s, ['ctrl', 'pvc', 'pvcB', 'pvSmall', 'pvMatch', 'pvSlow', 'appBox',
    'pvcChip', 'pvChip', 'bindChip', 'mountChip'], [s.refs.appPod]);
  s.refs.pvSmall.style.opacity = '1';
  s.refs.pvSlow.style.opacity = '1';
}

const BOUND = 'data-claim <-> pv-x73a';

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
      s.refs.appPod.style.opacity = '0.55';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
    },
  },
  {
    id: 'claim',
    duration: 2000,
    // A packet-less step, but the Pod is the actor (it is trying to start and cannot), so it pulses.
    // No block flash is needed or allowed here.
    narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at least 5Gi, ReadWriteOnce access, and the gp3 StorageClass. Kubelet will not start the Pod while the claim it references has no volume behind it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'none', mount: 'none' });
      s.refs.appPod.style.opacity = '0.55';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePodDim(s.refs.appPod, ctx, 0, { from: 0.55, peak: 0.8 });
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
      s.refs.appPod.style.opacity = '0.55';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.pvc.classList.add('highlight');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); return; }
      // Infra to infra: no pod is involved, so there is no pulse to lead with. The claim rides along.
      const watch = routePacket(s, ctx, W_PVC_TO_CTRL, { cat: 'storage' });
      ridingLabel(s, ctx, '5Gi, RWO, gp3', W_PVC_TO_CTRL);
      lightBoxAt(s.refs.ctrl, ctx, watch.arrivalMs);
    },
  },
  {
    id: 'match',
    duration: 3400,
    narration: 'The controller looks at every Available volume in turn. pv-a01 is only 2Gi, which is under what the claim asks for, and pv-b22 is the standard class rather than gp3. Only pv-x73a satisfies all three conditions, so it is the candidate.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Pending', pv: 'Available', bind: 'candidate pv-x73a', mount: 'none' });
      s.refs.appPod.style.opacity = '0.55';
      s.refs.boundLink.style.opacity = '0';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      setWire(s, 'small', 'too small');
      setWire(s, 'match', 'fits');
      setWire(s, 'slow', 'wrong class');
      if (ctx.reduced) {
        s.refs.pvMatch.classList.add('highlight');
        s.refs.pvSmall.style.opacity = String(DIM);
        s.refs.pvSlow.style.opacity = String(DIM);
        return;
      }
      // Three probes leave the controller together and land at their own pace, because the routes
      // are different lengths and routeDur normalizes speed, not arrival. Each rides a drawn wire.
      const toSmall = routePacket(s, ctx, W_SCAN_SMALL, { cat: 'storage' });
      const toMatch = routePacket(s, ctx, W_SCAN_MATCH, { cat: 'storage' });
      const toSlow  = routePacket(s, ctx, W_SCAN_SLOW,  { cat: 'storage' });
      dimBoxAt(s.refs.pvSmall, ctx, toSmall.arrivalMs);
      dimBoxAt(s.refs.pvSlow, ctx, toSlow.arrivalMs);
      lightBoxAt(s.refs.pvMatch, ctx, toMatch.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Binding is written on both objects. The claim gets a volumeName pointing at pv-x73a, and the volume gets a claimRef pointing back at data-claim. Both turn Bound, and because the volume now names its claim, no other claim can ever take it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', pv: 'Bound', bind: BOUND, mount: 'none' });
      s.refs.appPod.style.opacity = '0.55';
      s.refs.pvcB.style.opacity = '0';
      s.refs.wCtrlToPvcB.style.opacity = '0';
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      s.refs.pvMatch.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setWire(s, 'bound', 'Bound');
      // The Bound link is the static end-state of this step, so it is pinned here, above the guard.
      s.refs.boundLink.style.opacity = '1';
      if (ctx.reduced) return;
      // Two writes leave the controller at once: one down to the claim, one down to the volume.
      const toClaim = routePacket(s, ctx, W_CTRL_TO_PVC, { cat: 'storage' });
      ridingLabel(s, ctx, 'volumeName: pv-x73a', W_CTRL_TO_PVC);
      const toVol = routePacket(s, ctx, W_SCAN_MATCH, { cat: 'storage' });
      ridingLabel(s, ctx, 'claimRef: data-claim', W_SCAN_MATCH);
      // The link is drawn only once both halves of the pair have been written.
      const paired = Math.max(toClaim.arrivalMs, toVol.arrivalMs);
      s.refs.boundLink.style.opacity = '0';
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: paired, fill: 'forwards', easing: 'ease-out' }));
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
      s.refs.pvMatch.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setWire(s, 'bound', 'Bound');
      setWire(s, 'mount', 'kubelet mount');
      s.refs.boundLink.style.opacity = '1';
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
      // at full opacity and then snap BACK to 0.55 the instant the animation became active.
      s.refs.appPod.style.opacity = '0.55';
      // The ball arrives AT the Pod, so the Pod pulses on arrival, not before it.
      ctx.register(s.refs.appPod.animate([{ opacity: 0.55 }, { opacity: 1 }], { duration: 500, delay: hop2.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.appPod, ctx, hop2.arrivalMs);
      lightBoxAt(s.refs.appBox, ctx, hop2.arrivalMs);
    },
  },
  {
    id: 'exclusive',
    duration: 2600,
    narration: 'Binding is one to one and it is permanent. A second claim asking for exactly the same thing finds pv-x73a already carrying a claimRef, so that volume is no longer Available to anyone. The second claim stays Pending until a volume it can have shows up.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pvc: 'Bound', pv: 'Bound', bind: BOUND, mount: 'mounted at /data' });
      s.refs.appPod.style.opacity = '1';
      s.refs.boundLink.style.opacity = '1';
      s.refs.pvcB.style.opacity = '1';
      s.refs.wCtrlToPvcB.style.opacity = '1';
      s.refs.ctrl.classList.add('highlight');
      s.refs.pvMatch.classList.add('highlight');
      s.refs.pvSmall.style.opacity = String(DIM);
      s.refs.pvSlow.style.opacity = String(DIM);
      setWire(s, 'small', 'too small');
      setWire(s, 'slow', 'wrong class');
      setWire(s, 'bound', 'Bound');
      setBoxSublabel(s.refs.pvcB, 'Pending, no volume');
      if (ctx.reduced) { s.refs.pvcB.classList.add('highlight'); return; }
      const deny = routePacket(s, ctx, W_CTRL_TO_PVCB, { cat: 'storage' });
      ridingLabel(s, ctx, 'no volume available', W_CTRL_TO_PVCB);
      lightBoxAt(s.refs.pvcB, ctx, deny.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
