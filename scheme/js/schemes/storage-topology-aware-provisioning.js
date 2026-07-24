import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on the
// shelf below it. volumeBindingMode: Immediate provisions the disk the instant the claim exists, in
// whatever zone the provisioner happens to pick, and the scheduler then places the Pod independently,
// so the two can land in different zones and the Pod hangs forever because a zonal disk cannot be
// attached across zones. WaitForFirstConsumer inverts the order: the scheduler picks the node first,
// and only then is the volume provisioned in that same topology.
//
// ---- Horizontal composition ----
// The two zones are mirrored about the canvas centre, so the picture is symmetric and neither zone
// reads as the important one: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX = 600, derived from the
// node width and the gap rather than typed. Content spans 140..1060, margins 140 a side. The earlier
// pass ran the nodes at 400..720 and 820..1140, which put the pair centre at 770 and left 400 units
// of dead canvas on the left against 60 on the right.
//
// The StorageClass and the claim sit stacked on the centre line above the zones, both centred on CX,
// because the whole card is about ONE claim and ONE class being resolved into ONE of two zones.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
//   1920x900  right 102  bottom 183
//   1600x1000 right 291  bottom 143
//   1280x900  right 378  bottom 173
//   1100x900  right 397  bottom 149
// Worst case x <= 397 and y <= 183. The StorageClass (y 36) and the claim (y 136) both sit inside
// that y band, so both start at x >= 400. Everything from the node row down (y >= 236) clears the
// overlay entirely. A longer narration than the ones below would invalidate this measurement.
//
// PULSE MODEL: only the Pod pulses, and it is a wrapping g. The zone frames, the class, the claim and
// the disks are infrastructure: they light via .highlight and never pulse. On the failure step the Pod
// never went Ready, so it stays dim and takes pulsePodDim with an opacity lift, or the blink is
// invisible against the 0.55 it sits at.
//
// WIRES: the provisioning route leaves the StorageClass from its RIGHT edge midpoint, wraps down the
// outer margin clear of both zones, runs a bus UNDER the whole disk shelf and rises into the chosen
// disk through its BOTTOM. That keeps it out of every block and lets one route shape serve either
// zone. The doomed cross-zone reach uses its own corridor in the gap between the node frames and the
// shelf, and it is a bare dashed relationship with NO arrowhead because no traffic ever crosses it.
const CX = 600;

const SC_X = 400, SC_Y = 36, SC_W = 400, SC_H = 64;
const SC_RIGHT = SC_X + SC_W, SC_MY = SC_Y + SC_H / 2, SC_BOTTOM = SC_Y + SC_H;   // 800 / 68 / 100

const PVC_W = 260, PVC_H = 60, PVC_Y = 136;
const PVC_X = CX - PVC_W / 2, PVC_BOTTOM = PVC_Y + PVC_H;                          // 470 / 196

// NODE_H hugs the Pod rather than framing canvas. At 180 the frames stood 88 units taller than the
// Pod they hold, and zone-a, which holds nothing at all in the WaitForFirstConsumer path, read as a
// large empty box rather than as an empty zone.
const NODE_W = 430, NODE_GAP = 60, NODE_Y = 236, NODE_H = 140;
const NODE_BOTTOM = NODE_Y + NODE_H;                                               // 376
const SPREAD = (NODE_W + NODE_GAP) / 2;                                            // 245
const NODE_CX = [CX - SPREAD, CX + SPREAD];                                        // 355 / 845
const NODE_X = NODE_CX.map(cx => cx - NODE_W / 2);                                 // 140 / 630

const POD_W = 160, POD_H = 92;
const POD_Y = NODE_Y + (NODE_H - POD_H) / 2, POD_BOTTOM = POD_Y + POD_H;           // 260 / 352

const DISK_W = 190, DISK_H = 90, DISK_Y = 444;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;                            // 444 / 534
const DISK_MY = DISK_Y + DISK_H / 2;                                               // 489

const CROSS_Y = (NODE_BOTTOM + DISK_TOP) / 2;      // 410, centred in the gap it crosses
const PROV_BUS_Y = 560;                            // under the shelf, clear of the chip strip
const PROV_WRAP_X = 1120;                          // outer margin, right of node-2 (ends 1060)
const CAPTION_Y = DISK_TOP - 14;
const CHIPS_Y = 588;

// The mount lane and the cross-zone reach both leave the Pod bottom, so they are offset either side
// of the Pod centre line. 12 is the family value for a narrow single-column lane pair.
const LANE = 12;

// Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
// a block edge midpoint.
// Both provisioning routes leave the StorageClass through its RIGHT edge midpoint and wrap down the
// same outer margin, because a left wrap would run the lane and its ball straight through the
// narration overlay. From there they differ, and each takes the shortest path that crosses nothing:
// zone-b is reached by turning in at the shelf midline and entering its disk through the near SIDE,
// while zone-a has to continue below the shelf and rise into its disk from underneath, since a
// horizontal run at the midline would have been drawn through the zone-b disk on the way.
const W_PROV_B = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, DISK_MY]];
const W_PROV_A = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, PROV_BUS_Y], [NODE_CX[0], PROV_BUS_Y], [NODE_CX[0], DISK_BOTTOM]];
const wProv = i => (i === 0 ? W_PROV_A : W_PROV_B);
const W_MOUNT_B = [[NODE_CX[1] - LANE, DISK_TOP], [NODE_CX[1] - LANE, POD_BOTTOM]];
// The doomed reach: the Pod in zone-b would have to cross into zone-a for its disk.
const W_CROSS = [[NODE_CX[1] + LANE, POD_BOTTOM], [NODE_CX[1] + LANE, CROSS_Y], [NODE_CX[0], CROSS_Y], [NODE_CX[0], DISK_TOP]];

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

// A disk materialises when the CreateVolume that makes it lands, so no arrowhead is ever aimed at
// nothing. LAND_MS is shorter than BEAT.lead for the same reason.
const LAND_MS = 500;
// PLACEHOLDER is the dim a disk is drawn at while the provisioning lane already points AT it but it
// has not been created yet. Hiding it outright aims the arrowhead at blank canvas for the whole flight.
const PLACEHOLDER = 0.4;
function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
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
  const x = NODE_CX[1] - POD_W / 2;
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod app-0', sublabel: ' ', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 20, y: POD_Y + 40, w: POD_W - 40, h: 34, label: 'app', cat: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'Topology-aware provisioning with WaitForFirstConsumer: under Immediate binding a zonal disk is provisioned as soon as the claim exists and the scheduler may then place the Pod in a different zone where the disk cannot be attached, leaving the Pod stuck forever, while WaitForFirstConsumer defers binding until the Pod is scheduled so the volume is created in the Pod topology',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const sc  = box({ x: SC_X, y: SC_Y, w: SC_W, h: SC_H, label: 'StorageClass gp3', sublabel: 'volumeBindingMode: Immediate', cat: 'storage' });
    const pvc = box({ x: PVC_X, y: PVC_Y, w: PVC_W, h: PVC_H, label: 'PVC data-0', sublabel: 'Pending', cat: 'storage' });

    const nodes = NODE_X.map((x, i) => node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label: `node-${i + 1}` }));
    // node() carries no sublabel, so the zone is its own dim caption. It shares the frame HEADER line
    // with the node label, right-anchored: centred under it at NODE_Y + 24 it landed on the top edge of
    // the Pod the frame holds, since NODE_H now hugs the Pod.
    const zoneLbls = NODE_X.map((x, i) => text({ class: 'scheme-label code dim', x: x + NODE_W - 12, y: NODE_Y + 18, 'text-anchor': 'end' }, [i === 0 ? 'zone-a' : 'zone-b']));

    const disks = NODE_CX.map((cx, i) => {
      const c = cylinder({ x: cx - DISK_W / 2, y: DISK_Y, w: DISK_W, h: DISK_H, label: i === 0 ? 'disk zone-a' : 'disk zone-b', cat: 'storage' });
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
    const classRef = path({
      class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage',
      d: `M ${CX} ${SC_BOTTOM} L ${CX} ${PVC_Y}`, 'stroke-dasharray': '5 5', fill: 'none',
    });

    const wProvA = lane(wProv(0));
    const wProvB = lane(wProv(1));
    const wMountB = lane(W_MOUNT_B);
    // The doomed cross-zone reach carries no ball ever, so it has no arrowhead.
    const crossLink = lane(W_CROSS);
    crossLink.removeAttribute('marker-end');
    // Lanes are pinned per step by setStage. Left permanently visible, the zone-a provisioning lane
    // was still drawn during the zone-b provisioning step, pointing into a disk that does not exist
    // on that path.
    [wProvA, wProvB, wMountB, crossLink].forEach(w => { w.style.opacity = '0'; });

    const failLbl = text({ class: 'scheme-label code dim', x: CX, y: CROSS_Y - 12, 'text-anchor': 'middle' }, [' ']);
    const zoneCaps = NODE_CX.map(cx => text({ class: 'scheme-label code dim', x: cx, y: CAPTION_Y, 'text-anchor': 'middle' }, [' ']));

    // CHIP_W 232 is the storage family default. Worst case here is 'mode' + 'WaitForFirstConsumer' at
    // 24 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 24 * 6.89 + 24 of
    // padding is 189 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const modeChip = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'mode',  value: 'Immediate', cat: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVC',   value: 'Pending',   cat: 'storage' });
    const podChip  = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'Pod',   value: 'Pending',   cat: 'storage' });
    const zoneChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'zones', value: 'unset',     cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the zone frames, then the class and claim and disks, then the Pod so it
    // sits above its node, then the lanes and their captions, then the chip strip, then the packet
    // layer so every ball rides above everything.
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

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a card
// comes to display the old binding mode on the step that just changed it.
function setChips(s, { mode, pvc, pod, zones }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.pvcChip, pvc);
  setChip(s.refs.podChip, pod);
  setChip(s.refs.zoneChip, zones);
}

// The Pod is dim until it actually reaches Running: it is scheduled long before it can mount.
const POD_DIM = 0.55;

// Pins the visibility of EVERY element that is born mid-story, exactly as setChips pins every chip,
// so a step can never silently inherit a disk or a Pod from the step before it.
function setStage(s, { diskA = 0, diskB = 0, podOn = 0, cross = 0, mode = 'Immediate', pvcState = 'Pending', lanes = [] } = {}) {
  s.refs.diskA.style.opacity = String(diskA);
  s.refs.diskB.style.opacity = String(diskB);
  s.refs.podB.style.opacity = String(podOn);
  s.refs.crossLink.style.opacity = String(cross);
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
    narration: 'A claim asks for a disk from a StorageClass whose volumeBindingMode is Immediate. There are two zones, each a node with its own zonal disk. A zonal disk can only ever be attached to a node in its own zone, and that single fact is the whole story here.',
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
    // 4400, not 3600: the provisioning route wraps the outer margin and runs the full width of the
    // shelf bus before rising into zone-a, which anim-dump puts at a 3960ms span.
    duration: 4400,
    narration: 'With Immediate the volume is provisioned the moment the claim appears, long before any Pod is scheduled. The provisioner has no Pod to guide it, so it just picks a zone. Here it lands in zone-a, and the claim is Bound to a disk that now physically lives on node-1.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'Pending', zones: 'disk in zone-a' });
      setStage(s, { diskA: 1, pvcState: 'Bound', lanes: ['wProvA'] });
      // The class is where the ball departs from, so it is lit at step entry. The disk is the receiver
      // and earns its highlight on arrival.
      s.refs.sc.classList.add('highlight');
      s.refs.diskA.classList.add('highlight');
      setWire(s, 'za', 'provisioned here');
      if (ctx.reduced) return;
      setStage(s, { diskA: PLACEHOLDER, pvcState: 'Bound', lanes: ['wProvA'] });
      const pts = wProv(0);
      const prov = routePacket(s, ctx, pts, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', pts, { delay: BEAT.lead });
      revealAt(s.refs.diskA, ctx, prov.arrivalMs, PLACEHOLDER);
    },
  },
  {
    id: 'imm-schedule',
    duration: 3000,
    narration: 'Only now does the scheduler place the Pod, and it knows nothing about where the disk went. Free capacity, taints and affinity push it onto node-2 in zone-b. The Pod and its disk are now in different zones, and neither component ever agreed to check.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'node-2 zone-b', zones: 'disk a, Pod b' });
      setStage(s, { diskA: 1, podOn: POD_DIM, pvcState: 'Bound' });
      s.refs.diskA.classList.add('highlight');
      s.refs.nodeB.classList.add('highlight');
      setWire(s, 'za', 'disk is here');
      setWire(s, 'zb', 'Pod is here');
      if (ctx.reduced) return;
      // The Pod is placed, not yet running, so it arrives at its dim resting opacity.
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: POD_DIM }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'imm-fail',
    duration: 3200,
    narration: 'The Pod on node-2 needs its disk, but the disk is in zone-a and cannot be attached across the zone boundary. There is no fix from here: the Pod sits in ContainerCreating forever, and the disk sits stranded in the wrong zone. This is the single most common multi-zone storage bug.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Immediate', pvc: 'Bound', pod: 'stuck forever', zones: 'zone mismatch' });
      setStage(s, { diskA: 1, podOn: POD_DIM, cross: 1, pvcState: 'Bound' });
      s.refs.diskA.classList.add('highlight');
      setWire(s, 'fail', 'cannot attach across zones');
      if (ctx.reduced) return;
      // The Pod is the actor, trying and failing to mount, so it blinks. It never went Ready, so it
      // stays dim and needs the dim variant with an opacity lift or the blink is invisible.
      pulsePodDim(s.refs.podB, ctx, BEAT.lead, { from: POD_DIM, peak: 0.95 });
    },
  },
  {
    id: 'wffc-schedule',
    duration: 3200,
    narration: 'Set volumeBindingMode to WaitForFirstConsumer and start over. Binding is now deferred, so the claim stays Pending on purpose while no disk exists yet. The scheduler runs first and places the Pod on node-2 in zone-b, and its choice is recorded on the claim.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Pending, waiting', pod: 'node-2 zone-b', zones: 'Pod zone-b' });
      setStage(s, { podOn: POD_DIM, mode: 'WaitForFirstConsumer', pvcState: 'Pending' });
      s.refs.sc.classList.add('highlight');
      s.refs.nodeB.classList.add('highlight');
      setWire(s, 'zb', 'Pod placed first');
      if (ctx.reduced) return;
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: POD_DIM }], { duration: FADE.in, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'wffc-provision',
    // 5800, not 4400: this step provisions, materialises the disk and then mounts it, and the pulse on
    // arrival adds PULSE_POD.ms on top, which anim-dump puts at a 5473ms span. At 4400 the auto-advance
    // cut the mount off before the Pod ever blinked, so the card under-showed exactly what it narrates.
    duration: 5800,
    narration: 'Now that the Pod has a node, the provisioner knows exactly which zone to build in. The volume is created in zone-b, bound to the claim, and attached to node-2 right above it. The Pod mounts it and starts, because the order was reversed so the disk could follow the Pod.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'WaitForFirstConsumer', pvc: 'Bound', pod: 'Running', zones: 'both zone-b' });
      setStage(s, { diskB: 1, podOn: 1, mode: 'WaitForFirstConsumer', pvcState: 'Bound', lanes: ['wProvB', 'wMountB'] });
      s.refs.sc.classList.add('highlight');
      s.refs.nodeB.classList.add('highlight');
      s.refs.diskB.classList.add('highlight');
      setWire(s, 'zb', 'provisioned in topology');
      if (ctx.reduced) { s.refs.podBox.classList.add('highlight'); return; }
      setStage(s, { diskB: PLACEHOLDER, podOn: POD_DIM, mode: 'WaitForFirstConsumer', pvcState: 'Bound', lanes: ['wProvB', 'wMountB'] });
      const provPts = wProv(1);
      const prov = routePacket(s, ctx, provPts, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'CreateVolume', provPts, { delay: BEAT.lead });
      revealAt(s.refs.diskB, ctx, prov.arrivalMs, PLACEHOLDER);
      // Down-arrow into the Pod, so the ball leads and the pulse lands on its arrival.
      const mountAt = prov.arrivalMs + LAND_MS + BEAT.afterHop;
      const mount = routePacket(s, ctx, W_MOUNT_B, { delay: mountAt, cat: 'storage' });
      ridingLabel(s, ctx, 'attach and mount', W_MOUNT_B, { delay: mountAt });
      ctx.register(s.refs.podB.animate([{ opacity: POD_DIM }, { opacity: 1 }], { duration: FADE.in, delay: mount.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, mount.arrivalMs);
      lightBoxAt(s.refs.podBox, ctx, mount.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
