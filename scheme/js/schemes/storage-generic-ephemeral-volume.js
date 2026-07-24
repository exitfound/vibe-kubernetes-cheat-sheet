import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Generic Ephemeral Volumes. An inline volumeClaimTemplate written directly on the Pod under
// ephemeral. It gets a real PVC, a real StorageClass, real dynamic provisioning and a real CSI mount,
// so unlike emptyDir it can be large, of a specific class, and even snapshotted. But its lifetime is
// the Pod: the PVC carries an ownerReference back to the Pod and is garbage-collected when the Pod
// dies. This card is the bridge between the ephemeral world and the persistent machinery, so the
// identity column is the Pod owning its PVC owning its PV, and the last gesture is that whole column
// collapsing when the Pod goes away.
//
// ---- Horizontal composition ----
// The identity column runs straight down the canvas centre line (Pod, PVC, PV, all on CX = 600) and
// the two machinery blocks flank it symmetrically: the StorageClass the claim names on the left, the
// provisioner that acts on it on the right, both on the claim row and equidistant from it. Content
// spans 120..1080, margins 120 a side. The earlier pass ran 430..1090, centre 760.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 143
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 149
// Worst case x <= 397 and y <= 183. Only the Pod sits inside that y band, and at 450..750 it clears
// the overlay on x while staying centred on CX. The claim row (y 208) and everything below it clear
// the overlay entirely. A longer narration than the ones below would invalidate this measurement.
//
// PULSE MODEL: only the Pod pulses, and it is a wrapping g. The claim, the class, the provisioner and
// the disk are infrastructure: they light via .highlight on packet arrival and never pulse. The one
// sanctioned block blink is on the owner step, which carries no packet and no Pod pulse.
//
// WIRES: three parallel axes share the centre corridor, and each means one thing. The RELATIONSHIP
// links sit on CX itself and carry no arrowhead, because ownership is not traffic. The MOUNT lanes sit
// at CX + LANE and run upward. The GARBAGE-COLLECTION lanes sit at CX - LANE and run downward. The
// earlier pass drew the mount lanes directly on top of the ownership and Bound links (same endpoints,
// same axis, four wires stacked in two positions) and then sent the GC balls back down those same
// lanes, so one lane was doing three contradictory jobs at once.
const CX = 600;

const POD_W = 300, POD_H = 116, POD_Y = 36;
const POD_X = CX - POD_W / 2, POD_BOTTOM = POD_Y + POD_H;               // 450 / 152

const ROW_Y = 208, ROW_H = 72, ROW_BOTTOM = ROW_Y + ROW_H;              // 280
const ROW_MY = ROW_Y + ROW_H / 2;                                       // 244
const CLAIM_W = 280, SIDE_W = 280, SIDE_SPREAD = 340;
const SC_CX = CX - SIDE_SPREAD, PROV_CX = CX + SIDE_SPREAD;             // 260 / 940

const PV_W = 200, PV_H = 110, PV_Y = 356;
const PV_TOP = PV_Y, PV_MY = PV_Y + PV_H / 2;                           // 356 / 411

const CAPTION_Y = 500;
const CHIPS_Y = 548;

// The mount lanes and the GC lanes flank the relationship column, one axis each. 12 is the family
// value for a narrow single-column lane pair.
const LANE = 12;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint, or one of the two LANE twins around the column axis.
const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];
const W_CREATE     = [[PROV_CX, ROW_BOTTOM], [PROV_CX, PV_MY], [CX + PV_W / 2, PV_MY]];
const W_MOUNT_LOW  = [[CX + LANE, PV_TOP], [CX + LANE, ROW_BOTTOM]];
const W_MOUNT_HIGH = [[CX + LANE, ROW_Y], [CX + LANE, POD_BOTTOM]];
const W_GC_HIGH    = [[CX - LANE, POD_BOTTOM], [CX - LANE, ROW_Y]];
const W_GC_LOW     = [[CX - LANE, ROW_BOTTOM], [CX - LANE, PV_TOP]];

// Lights an infrastructure block ON PACKET ARRIVAL rather than at step entry, via a zero-effect
// animation whose onfinish sets the class. Under reduced motion it applies immediately so the static
// end-state stays correct. This is how a box receives a packet without pulsing.
function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// An object materialises when the call that creates it lands, so no arrowhead is ever aimed at
// nothing. LAND_MS is shorter than BEAT.lead for the same reason.
const LAND_MS = 500;
function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

const GONE = 0.1;
function vanishAt(el, ctx, delay = 0, to = GONE) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); return; }
  ctx.register(el.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.out, delay, fill: 'forwards', easing: 'ease-in' }));
}

// The sole sanctioned block blink, for a step that carries no packet and no Pod pulse and would
// otherwise read as a frozen frame. Never used on a value chip.
function flashBox(el, ctx, delay = 0) {
  if (!el || ctx.reduced) return;
  ctx.register(el.animate(
    [{ filter: 'brightness(1)' }, { filter: 'brightness(1.55)' }, { filter: 'brightness(1)' }],
    { duration: 600, delay, easing: 'ease-out' }));
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out' } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: -14, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: 'ephemeral: volumeClaimTemplate', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 30, y: POD_Y + 42, w: POD_W - 60, h: 44, label: 'app', sublabel: 'writes /scratch', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });

// A relationship, not traffic, so a bare path with no marker: an arrowhead with no ball reads as
// traffic that never runs.
function relLink(d, { dashed = true } = {}) {
  const cls = 'scheme-arrow scheme-arrow-storage' + (dashed ? ' scheme-arrow-dashed scheme-arrow-dim' : '');
  const attrs = { class: cls, d, fill: 'none' };
  if (dashed) attrs['stroke-dasharray'] = '5 5';
  return path(attrs);
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
      'aria-label': 'Generic ephemeral volumes: an inline volumeClaimTemplate on the Pod under ephemeral mints a real PVC with dynamic provisioning and a real CSI mount, so unlike emptyDir it can be large and of a specific class and even snapshotted, but the PVC carries an ownerReference to the Pod and is garbage-collected the moment the Pod is deleted, so its lifetime is exactly the lifetime of the Pod',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podB = podBlock();

    const pvc = box({ x: CX - CLAIM_W / 2, y: ROW_Y, w: CLAIM_W, h: ROW_H, label: 'PVC app-0-scratch', sublabel: 'owned by Pod', cat: 'storage' });
    pvc.style.opacity = '0';
    const sc = box({ x: SC_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'StorageClass fast-ssd', sublabel: 'ebs.csi.aws.com', cat: 'storage' });
    const prov = box({ x: PROV_CX - SIDE_W / 2, y: ROW_Y, w: SIDE_W, h: ROW_H, label: 'external-provisioner', sublabel: 'CSI controller sidecar', cat: 'storage' });

    const pv = cylinder({ x: CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'pv-e91c', cat: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is
    // not part of the visible front face. Re-centre on the face, derived from the height.
    const pvLbl = pv.querySelector('.scheme-cylinder-label');
    if (pvLbl) pvLbl.setAttribute('y', PV_H / 2 + 10);
    pv.style.opacity = '0';

    // The relationship column, on CX itself: ownership above, Bound below. Neither carries traffic.
    const ownerLink = relLink(`M ${CX} ${POD_BOTTOM} L ${CX} ${ROW_Y}`);
    ownerLink.style.opacity = '0';
    const boundLink = relLink(`M ${CX} ${ROW_BOTTOM} L ${CX} ${PV_TOP}`, { dashed: false });
    boundLink.style.opacity = '0';
    // The claim names its class: face midpoint to face midpoint, no arrowhead.
    const classRef = relLink(`M ${CX - CLAIM_W / 2} ${ROW_MY} L ${SC_CX + SIDE_W / 2} ${ROW_MY}`);
    classRef.style.opacity = '0';

    const wClaimProv = lane(W_CLAIM_PROV);
    const wCreate = lane(W_CREATE);
    const wMountLow = lane(W_MOUNT_LOW);
    const wMountHigh = lane(W_MOUNT_HIGH);
    const wGcHigh = lane(W_GC_HIGH);
    const wGcLow = lane(W_GC_LOW);
    [wClaimProv, wCreate, wMountLow, wMountHigh, wGcHigh, wGcLow].forEach(w => { w.style.opacity = '0'; });

    const ownerLbl = text({ class: 'scheme-label code dim', x: CX + 40, y: 186, 'text-anchor': 'start' }, [' ']);
    const mountLbl = text({ class: 'scheme-label code dim', x: CX, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']);

    // CHIP_W 232 is the storage family default. Worst case here is 'backing' + 'mounted at /scratch'
    // at 26 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 26 * 6.89 + 24
    // of padding is 203 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const podChip  = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',      value: 'Pending',      cat: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC',      value: 'none',         cat: 'storage' });
    const backChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'backing',  value: 'CSI dynamic',  cat: 'storage' });
    const lifeChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'lifetime', value: 'tied to Pod',  cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks and the disk, then the relationship links and lanes and their
    // captions above them, then the chip strip, then the packet layer so every ball rides above
    // everything.
    [podB.group, pvc, sc, prov, pv].forEach(el => root.appendChild(el));
    [ownerLink, boundLink, classRef, wClaimProv, wCreate, wMountLow, wMountHigh, wGcHigh, wGcLow, ownerLbl, mountLbl].forEach(el => root.appendChild(el));
    [podChip, pvcChip, backChip, lifeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, podB: podB.group, podBox: podB.innerBox, pvc, sc, prov, pv,
      ownerLink, boundLink, classRef,
      wClaimProv, wCreate, wMountLow, wMountHigh, wGcHigh, wGcLow,
      podChip, pvcChip, backChip, lifeChip,
      wires: { owner: ownerLbl, mount: mountLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
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
const POD_DIM = 0.55;

// Pins the visibility of EVERY element born or removed mid-story, and of every lane, exactly as
// setChips pins every chip. A lane into an object that does not exist points at nothing, so lanes are
// pinned to 0 rather than left at whatever the previous step happened to set.
const LANES = ['wClaimProv', 'wCreate', 'wMountLow', 'wMountHigh', 'wGcHigh', 'wGcLow'];
function setStage(s, { podOn = POD_DIM, claim = 0, disk = 0, owner = 0, bound = 0, cls = 0, lanes = [] } = {}) {
  s.refs.podB.style.opacity = String(podOn);
  s.refs.pvc.style.opacity = String(claim);
  s.refs.pv.style.opacity = String(disk);
  s.refs.ownerLink.style.opacity = String(owner);
  s.refs.boundLink.style.opacity = String(bound);
  s.refs.classRef.style.opacity = String(cls);
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
    narration: 'A Pod carries an inline volumeClaimTemplate under a field named ephemeral. It reads like a throwaway scratch volume, the same slot where emptyDir would go, but everything below this Pod is about to become real storage machinery rather than a folder on the node.',
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
    narration: 'When the Pod is created a real PVC is minted from that inline template, named after the Pod and the volume: app-0-scratch. It is a genuine PersistentVolumeClaim object, and it carries an ownerReference pointing straight back at the Pod that spawned it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'app-0-scratch', back: 'CSI dynamic', life: 'tied to Pod' });
      setStage(s, { claim: 1, owner: 1, cls: 1 });
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      if (ctx.reduced) return;
      setStage(s, { claim: 0, owner: 0, cls: 1 });
      revealAt(s.refs.pvc, ctx, 0);
      // The ownership link only means anything once the claim exists, so it draws in after it lands.
      ctx.register(s.refs.ownerLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: LAND_MS, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'provision',
    duration: 4200,
    narration: 'The claim names a real StorageClass, so the provisioner treats it like any other and calls CreateVolume for a fresh disk of the size and class asked for. This is what emptyDir cannot do: the volume can be large, on fast SSD, on any driver, and it can be snapshotted.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Pending', pvc: 'provisioning', back: 'real disk, fast-ssd', life: 'tied to Pod' });
      setStage(s, { claim: 1, disk: 1, owner: 1, bound: 1, cls: 1, lanes: ['wClaimProv', 'wCreate'] });
      setWire(s, 'owner', 'ownerReference');
      // The claim is where the ball departs from, so it is lit at step entry. The class it names is
      // read here too. The provisioner and the disk are receivers and earn their highlights on arrival.
      s.refs.pvc.classList.add('highlight');
      s.refs.sc.classList.add('highlight');
      if (ctx.reduced) { s.refs.prov.classList.add('highlight'); s.refs.pv.classList.add('highlight'); return; }
      setStage(s, { claim: 1, disk: 0, owner: 1, bound: 0, cls: 1, lanes: ['wClaimProv', 'wCreate'] });
      const claim = routePacket(s, ctx, W_CLAIM_PROV, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'storageClassName: fast-ssd', W_CLAIM_PROV, { delay: BEAT.lead });
      lightBoxAt(s.refs.prov, ctx, claim.arrivalMs);
      const create = routePacket(s, ctx, W_CREATE, { delay: claim.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', W_CREATE, { delay: claim.arrivalMs + BEAT.afterHop });
      revealAt(s.refs.pv, ctx, create.arrivalMs);
      lightBoxAt(s.refs.pv, ctx, create.arrivalMs);
      ctx.register(s.refs.boundLink.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: create.arrivalMs + LAND_MS, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'mount',
    duration: 4200,
    narration: 'The CSI driver attaches the disk to the node and mounts it at /scratch inside the container, exactly as it would for any ordinary PVC. The Pod starts and writes to a real, dynamically provisioned volume. Nothing about this path is a shortcut.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'tied to Pod' });
      setStage(s, { podOn: 1, claim: 1, disk: 1, owner: 1, bound: 1, cls: 1, lanes: ['wMountLow', 'wMountHigh'] });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pv.classList.add('highlight');
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference');
      setWire(s, 'mount', 'attach and mount');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      setStage(s, { podOn: POD_DIM, claim: 1, disk: 1, owner: 1, bound: 1, cls: 1, lanes: ['wMountLow', 'wMountHigh'] });
      // Down-arrow into the Pod, so the balls lead and the pulse lands on the second one arriving.
      const low = routePacket(s, ctx, W_MOUNT_LOW, { delay: BEAT.lead, cat: 'storage' });
      const high = routePacket(s, ctx, W_MOUNT_HIGH, { delay: low.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, '/scratch', W_MOUNT_HIGH, { delay: low.arrivalMs + BEAT.afterHop });
      ctx.register(s.refs.podB.animate([{ opacity: POD_DIM }, { opacity: 1 }], { duration: FADE.in, delay: high.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, high.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, high.arrivalMs);
    },
  },
  {
    id: 'owner',
    duration: 2800,
    narration: 'The ownerReference is what makes this ephemeral. A normal PVC outlives the Pods that use it, but this one belongs to the Pod, the way a container belongs to it. There is no separate object to forget about and no manual cleanup to remember.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Running', pvc: 'Bound', back: 'mounted at /scratch', life: 'owned by Pod' });
      setStage(s, { podOn: 1, claim: 1, disk: 1, owner: 1, bound: 1, cls: 1 });
      setBoxSublabel(s.refs.pvc, 'Bound');
      s.refs.pvc.classList.add('highlight');
      setWire(s, 'owner', 'ownerReference: Pod app-0');
      // No packet and no Pod pulse on this step, so the sanctioned block blink lands on the owned
      // claim, which is what the step is about. Never on the lifetime chip: value chips never blink.
      flashBox(s.refs.pvc, ctx, BEAT.afterHop);
    },
  },
  {
    id: 'gc',
    duration: 4600,
    narration: 'Delete the Pod and the ownerReference does the rest. Garbage collection removes the PVC, which releases the volume, and the disk is reclaimed. The scratch data existed for exactly as long as the Pod did, which is the whole point of a generic ephemeral volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { pod: 'Deleted', pvc: 'garbage-collected', back: 'reclaimed', life: 'ended with Pod' });
      setStage(s, { podOn: GONE, claim: GONE, disk: GONE, owner: 1, bound: 1, cls: 0, lanes: ['wGcHigh', 'wGcLow'] });
      setBoxSublabel(s.refs.pvc, 'Bound');
      setWire(s, 'owner', 'cascade delete');
      if (ctx.reduced) return;
      setStage(s, { podOn: 1, claim: 1, disk: 1, owner: 1, bound: 1, cls: 0, lanes: ['wGcHigh', 'wGcLow'] });
      // The Pod goes first, then the cascade walks down the column: the claim next, then the disk.
      ctx.register(s.refs.podB.animate([{ opacity: 1 }, { opacity: GONE }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      const gcHigh = routePacket(s, ctx, W_GC_HIGH, { delay: FADE.out + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'ownerReference GC', W_GC_HIGH, { delay: FADE.out + BEAT.afterHop });
      vanishAt(s.refs.pvc, ctx, gcHigh.arrivalMs);
      const gcLow = routePacket(s, ctx, W_GC_LOW, { delay: gcHigh.arrivalMs + BEAT.afterHop, cat: 'storage' });
      vanishAt(s.refs.pv, ctx, gcLow.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
