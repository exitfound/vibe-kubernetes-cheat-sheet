import { svg, g, text, rect } from '../lib/svg.js';
import { arrowDefs, box, pod, node, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxLabel, setBoxSublabel, setPodSublabel, pulsePod,
  routePacket, routeDur,
  makeInit, clearHighlights, clearWires, BEAT, FADE,
} from '../lib/storage-kit.js';

// Node Volume Attach Limits (viewBox 1200x640). The one CSI failure that happens BEFORE anything is
// bound, attached or mounted: the Pod never gets a node at all. Every node has a hard ceiling on how
// many volumes one CSI driver may have attached to it at once. The ceiling is not a Kubernetes
// setting: the node plugin answers NodeGetInfo with max_volumes_per_node, KUBELET writes that number
// into the node's CSINode object, and the scheduler's NodeVolumeLimits filter is the only thing that
// ever reads it. Run out of slots and the Pod sits in Pending reporting "node(s) exceed max volume
// count" while every node still has spare CPU and spare memory, which is what makes it so hard to
// recognise the first time.
//
// ---- Three points of fact this card had wrong, checked against source ----
// 1. The node-driver-registrar does NOT write CSINode. It runs a registration socket that tells
//    kubelet the driver's name and endpoint, and nothing more. Kubelet itself calls NodeGetInfo
//    (pkg/volume/csi/csi_plugin.go, RegistrationHandler.RegisterPlugin) and hands maxVolumePerNode to
//    the node info manager, which writes spec.drivers[].allocatable.count. The card said registrar.
// 2. NodeVolumeLimits does NOT run on every scheduling attempt. Its PreFilter returns Skip when the
//    Pod has no PVC, no generic ephemeral volume and nothing inline-migratable, which suppresses the
//    Filter phase for that Pod entirely. A storage-free workload costs one volume-list scan.
// 3. What the Filter counts changed in 1.32 (PR 127757, issue 126502). Before that it counted only
//    the volumes of Pods assigned to the node, so deleting a Pod freed its slot instantly and the
//    replacement was scheduled onto a node whose disks were still detaching, landing in
//    ContainerCreating with FailedAttachVolume. Since 1.32 the count is the de-duplicated union of
//    those Pod volumes AND every live VolumeAttachment for the node, so the slot is held until the
//    VolumeAttachment is deleted, which is what "released by a detach, not by a Pod dying" means and
//    why the Pod stays Pending rather than getting placed. A QueueingHint on VolumeAttachment delete
//    requeues it the moment the slot really opens. This card targets 1.35, so it tells the 1.32+
//    story, and the `filter` step names both terms of the sum because `detachlag` is their payoff.
//
// This is the only card in the csi row whose subject is SCHEDULING. Its six siblings all begin with
// a Pod that already has a node, so the whole vocabulary of the section (VolumeAttachment, stage,
// publish, fsGroup, force-detach) is downstream of a decision this card is entirely about.
//
// ---- Composition ----
// Storage grammar is a vertical stack, and this one reads top to bottom as three layers of
// authority: the thing being placed, the thing that decides, and the two records the decision is
// made from.
//   1. Pod web-0, unplaced                                      (the claimant)
//   2. the Scheduler and its NodeVolumeLimits filter            (the decider)
//   3. CSINode, one per node, holding allocatable.count         (the ceiling, as an object)
//   4. three node frames, each an 8-slot attachment strip       (the ceiling, as physical reality)
// Tiers 3 and 4 are deliberately adjacent: the whole mechanism is that a number written in an API
// object has to agree with how many disks are really hanging off a machine, and the card is asking
// the reader to compare the two rows.
//
// LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
// window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
// step, by viewport:
//   1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
//   1100x800  -> 397 / 220     900x650 -> 398 / 375
// So the real worst case is x<=398 and y<=375, and the bound is an L, not a box: above y=375 nothing
// may sit left of 400, below it the full width is free.
//
// That 375 is BOUGHT and it is what pays for the node row being wide. The narrations here used to be
// the longest in the csi row at up to 470 characters, which put the bottom at 498 and left the node
// tier no choice but to squeeze inside 400..800 at 120 units per node. Held under ~300 characters
// they sit at 375, and the node row at y=418 clears the panel by 43, so it can spread to 584 units
// and each node frame gets 176. Overrun ~300 on any step and the widest node goes back under the
// panel. Re-measure after editing narration, not only after moving geometry.
//
// The upper three tiers (Pod, Scheduler, CSINode) all still live inside 400..800 because they sit
// ABOVE y=375 where the L is still closed. Only the node row and the chip strip cross to the left,
// and both are below it. That is the whole reason the report lanes converge instead of running
// straight up: the row underneath is wider than the object it reports into, and the object cannot
// grow to meet it.
//
// CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so CONTENT_W is the only lever on where
// the card sits. It is solved for, not chosen: CONTENT_W 400 puts CONTENT_CX exactly on 600, the
// canvas center. That exactness is forced by the chip strip, which at 976 units is far wider than
// anything above it and is therefore the tier that sets the visual center. On 600 it spans 112..1088
// and the two margins agree.
const LEFT_X = 400;
const CONTENT_W = 400;
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600

// ---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
const POD_H = 110, SCHED_H = 60, CSI_H = 56, NODE_H = 150, CHIP_H = 32;
const G_POD_SCHED = 54, G_SCHED_CSI = 50, G_CSI_NODE = 48, G_NODE_CHIPS = 24;

const STACK_H = POD_H + G_POD_SCHED + SCHED_H + G_SCHED_CSI + CSI_H + G_CSI_NODE + NODE_H + G_NODE_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 32, and the bottom margin matches it

// 226x110 is the storage family Pod, set by storage-csi-attach-mount and kept here so a Pod is the
// same object across the row.
const POD_W = 226;
const POD_X = CONTENT_CX - POD_W / 2;                    // 487
const POD_Y = STACK_TOP;                                 // 32
const POD_BOTTOM = POD_Y + POD_H;                        // 142

// The PVC box inside the Pod, in Pod-local coordinates. pod() puts its own label on the baseline at
// y=16 and its state sublabel on the baseline at y=h-8, so on a 110 tall Pod the free band runs
// 20..93. PVC_H 46 centred in it leaves 14 above and 15 below. It used to sit at 40..86 against a
// sublabel whose glyphs start at 95, so the box was pinned against the floor of the Pod with all the
// slack piled on top of it, which read as the Pod being mis-drawn rather than as a gap.
const PVC_DY = 34, PVC_H = 46;

// Matched to CSI_W (280) so the Scheduler and the CSINode box below it read as one column. The
// sublabel 'NodeVolumeLimits filter' measures about 250 units, so 280 still leaves ~30 units of air.
const SCHED_W = 280;
const SCHED_X = CONTENT_CX - SCHED_W / 2;                // 460, aligned with CSI_X
const SCHED_Y = POD_BOTTOM + G_POD_SCHED;                // 198
const SCHED_BOTTOM = SCHED_Y + SCHED_H;                  // 258

// ONE CSINode box spanning the full node tier rather than three boxes stacked over three columns.
// Three were drawn first and they were identical in every field that matters here, so the row read
// as a repetition the card never uses: the number is the same on all three nodes, and the story is
// about that number against the slots, not about the objects differing. Spanning the whole tier also
// lets all three report lanes converge into one face, which is what the registrar actually does.
//
// CSI_W 280 rather than the full 400 of the tiers above. It is narrowed so the two outer report
// lanes have somewhere to travel: they must rise at x>=400 (see the lane block below) and then run
// IN to a side wall, so every unit the box gives up on each flank is a unit of visible horizontal
// run. At 280 the wall sits at 460 and each run is 60 units. At the old 400 the wall was at 400,
// the run was zero, and the turn would have collapsed onto the rise. The label needs about 150 units
// and the sublabel about 121, so 280 still leaves ~65 units of air on the wider of the two.
const CSI_W = 280;
const CSI_X = CONTENT_CX - CSI_W / 2;                    // 460..740
const CSI_Y = SCHED_BOTTOM + G_SCHED_CSI;                // 302
const CSI_TOP = CSI_Y, CSI_BOTTOM = CSI_Y + CSI_H;       // 302 / 358
const CSI_MID_Y = CSI_Y + CSI_H / 2;                     // 330, where the two side entries land
const CSI_LEFT = CSI_X, CSI_RIGHT = CSI_X + CSI_W;       // 460 / 740

// Three node frames, 176 wide with a 28 unit gap, spanning 584 and centred on CONTENT_CX, so the row
// runs 308..892 and hangs 92 units outside the tiers above it. They were 120 wide packed inside
// CONTENT_W, which made a whole machine the smallest object on a card whose entire subject is what a
// machine can hold: the eye read them as three little widgets under the real diagram. 176 is what the
// overlay allows once the narrations come under ~300 characters, and it is enough for the slot grid
// to be drawn at a size that can actually be counted.
const NODE_W = 220, NODE_GAP = 30;
const NODES_W = NODE_W * 3 + NODE_GAP * 2;               // 720
const NODES_X0 = CONTENT_CX - NODES_W / 2;               // 240
const NODE_Y = CSI_BOTTOM + G_CSI_NODE;                  // 406
const NODE_X = [0, 1, 2].map(i => NODES_X0 + i * (NODE_W + NODE_GAP)); // 240 / 490 / 740
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);         // 350 / 600 / 850, centred on 600

// Each report lane LEAVES its node dead centre of the node's top face, so the three lanes read as
// rising straight out of the three machines rather than out of a point offset inboard. The outer two
// therefore start at the node centres 350 and 850 (previously pulled in to 400 / 800 to keep the left
// lane clear of the narration overlay, whose bottom edge is 375 at 900x650 and whose right edge is
// x>=398: at that one narrow viewport the left lane's rise from y=406 to CSI_MID_Y 330 now clips the
// panel between y=375 and y=330). The node row itself is free of all of this because it starts at
// y=406, below the panel.
const LANE_X = NODE_CX;                                  // 350 / 600 / 850

// The attachment strip, in frame-local coordinates. Eight slots is the diagram's cap, not a real
// driver's. Checked against the node-specific volume limits doc: the DEFAULTS are EBS 39, GCE PD 16,
// Azure Disk 16, but with dynamic limits the real ceiling is per instance type, and the doc gives
// EBS 25 on M5/C5/R5/T3/Z1D and 39 elsewhere, Azure up to 64, and GCE up to 127. An earlier pass
// said 128 for GCE, which is the off-by-one everyone makes. Eight is what can be drawn as countable squares at this width, and the
// mechanism is identical at any number. The grid grew with the frame, 18 to 22 with an 8 unit gap,
// so the gauge still fills its frame instead of floating in the middle of a wider one.
// Everything inside the frame is derived from NODE_W, so widening the node widens its contents
// instead of leaving a bigger empty box around the same small gauge. At 220 the sockets go to 26
// with a 10 unit gap (134 for the row, 43 of margin each side) and the counter to 172 x 30.
const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;
const SLOT_ROW_W = SLOT_COLS * SLOT_W + (SLOT_COLS - 1) * SLOT_GAP;    // 134
const SLOT_X0 = (NODE_W - SLOT_ROW_W) / 2;               // 43
const SLOT_Y0 = 38;                                      // two rows, 38..64 and 74..100
const CNT_X = 24, CNT_Y = 110, CNT_W = NODE_W - 48, CNT_H = 30;        // 172 wide, bottom 140, 10 clear

// ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
// the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
// Measured worst cases, in viewBox units:
//   allocatable.count  117 + '8 per node'         69 = 186
//   Pod web-0           62 + 'Running on node-3' 117 = 179
//   blocked by          69 + 'max volume count'  110 = 179
//   attached            55 + '24 of 24'           55 = 110
// So 232 clears the worst pair with ~22 units between name and value, and matches the width the rest
// of the storage family settled on.
const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);     // 976
const CHIPS_Y = NODE_Y + NODE_H + G_NODE_CHIPS;          // 572
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));   // 112..1088

// The Pod and the Scheduler talk BOTH ways, so each direction gets its own lane rather than a ball
// bouncing back down the arrow it came up. LANE_DX 40 is not cosmetic: the return lane carries a
// riding tag that comes to rest in the corridor between the two blocks, and at the 14 the first pass
// used, that tag (about 96 units wide) printed straight over the outbound lane. At 40 the two lanes
// stand 80 apart and the tag clears the other one with room.
const LANE_DX = 40;
const W_POD_SCHED = [[CONTENT_CX - LANE_DX, POD_BOTTOM], [CONTENT_CX - LANE_DX, SCHED_Y]];
const W_SCHED_POD = [[CONTENT_CX + LANE_DX, SCHED_Y], [CONTENT_CX + LANE_DX, POD_BOTTOM]];

// The filter read runs dead down the spine. It used to be pushed out to 480 to dodge a wire caption
// that sat centred on 700 in the same corridor, so the corridor carried a lane left of centre and a
// line of text right of it and read as neither aligned nor deliberate. The caption is gone (see
// build) and the lane is back on CONTENT_CX, which is also where node-2 reports in from below, so
// the CSINode box now has one vertical axis through it rather than two near-misses.
const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];

// Each node reports its own cap into the shared CSINode box. Three lanes, one shape each, and every
// one of them is a single move or a single 90 degree turn:
//   node-1  rise, then ONE turn right into the LEFT side wall at CSI_MID_Y
//   node-2  straight up the spine into the BOTTOM face, dead centre
//   node-3  rise, then ONE turn left into the RIGHT side wall at CSI_MID_Y
// The outer pair used to take two turns, out of the frame, along a shared mid-corridor line and then
// up into the bottom face. That is a zigzag: three segments to say one thing, and it made the
// corridor between the tiers read as plumbing. Entering the side walls says the same thing with one
// bend and leaves the corridor clean. Same points array feeds the static wire and the ball, so the
// two cannot drift apart.
const W_NODE_CSI = [
  [[LANE_X[0], NODE_Y], [LANE_X[0], CSI_MID_Y], [CSI_LEFT, CSI_MID_Y]],
  [[LANE_X[1], NODE_Y], [LANE_X[1], CSI_BOTTOM]],
  [[LANE_X[2], NODE_Y], [LANE_X[2], CSI_MID_Y], [CSI_RIGHT, CSI_MID_Y]],
];

// ONE duration for all three report balls, so they leave together and LAND together. Their paths are
// not the same length (136 units on the flanks against 48 up the spine), and routeDur is
// length-based, so left to itself the centre ball would arrive first and the object would light
// before two thirds of the report had got there. As it happens both lengths currently fall under the
// PKT_DUR_MIN floor of 700ms and would coincide anyway, which is precisely why this is pinned: that
// is an accident of the present geometry, and the first time a tier moves far enough to push a flank
// past 315 units the three would silently desync. Registered in check-canon's ALLOW_EXPLICIT_DUR.
const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));

// Slot fills. `free` is the empty socket, `used` a volume already attached, `fresh` the one that
// web-0 finally takes, drawn brighter so the last step has a static change and not only a sublabel
// edit. There is deliberately no `detaching` fill: the detach that frees a slot is a transient, and
// giving it a resting colour would invite the reader to look for it in the end state.
const SLOT_FILL = Object.freeze({
  free: 'rgba(255, 255, 255, 0.04)',
  used: 'rgba(94, 202, 148, 0.30)',
  fresh: 'rgba(94, 202, 148, 0.62)',
});
const SLOT_STROKE = 'rgba(94, 202, 148, 0.35)';

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball on this card
// is a routePacket, which is eased, so the default ease-in-out matches and the tag stays glued to the
// ball instead of drifting off it between the endpoints.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out', dy = -14 } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: 0, y: dy, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
  lbl.style.opacity = '0';
  lbl.style.transform = `translate(${points[0][0]}px, ${points[0][1]}px)`;
  s.refs.packetLayer.appendChild(lbl);
  ctx.register(lbl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: Math.max(0, delay - 150), fill: 'forwards', easing: 'ease-out' }));
  ctx.register(animateAlong(lbl, points, { duration: d, delay, easing }));
  ctx.register(lbl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 180, delay: delay + d + 160, fill: 'forwards', easing: 'ease-in' }));
}

// PULSE MODEL: a Pod is ONE unit and blinks as one. The shell and its container box both live in
// `group`, and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its
// targets with querySelectorAll, which matches descendants only and never the element itself, so
// pulsing a bare pod() catches the .scheme-pod-rect child but not the group and the pulse silently
// fires at half strength (symptom in anim-dump: strokeOpacity rows but no filter row).
function podBlock() {
  const shell = pod({
    x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
    label: 'Pod web-0', sublabel: 'not created', containers: 0, cat: 'storage',
  });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({
    x: POD_X + 16, y: POD_Y + PVC_DY, w: POD_W - 32, h: PVC_H,
    label: 'PVC data-web-0', sublabel: 'needs one slot', cat: 'storage',
  });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

// A node frame is its own little instrument: a caption, a strip of attachment sockets, and a counter
// that reads them back as a number. The slots are plain rects rather than box() primitives on
// purpose. They are not blocks that can act, so they must never be able to take .highlight, pulse,
// or receive a packet: they are a gauge, and the only thing they ever do is change fill.
function nodeBlock({ x, label }) {
  const frame = node({ x, y: NODE_Y, w: NODE_W, h: NODE_H, label });
  // node() drops its caption at local y=18, which on a frame this short reads as floating inside the
  // box rather than as titling it. 14 tucks it up against the top edge. Placement only: the uppercase
  // rendering is catalog-wide styling and is left alone.
  const cap = frame.querySelector('.scheme-node-label');
  if (cap) cap.setAttribute('y', 14);

  const slots = [];
  for (let i = 0; i < SLOT_N; i++) {
    const col = i % SLOT_COLS, row = Math.floor(i / SLOT_COLS);
    const r = rect({
      x: SLOT_X0 + col * (SLOT_W + SLOT_GAP),
      y: SLOT_Y0 + row * (SLOT_HGT + SLOT_GAP),
      width: SLOT_W, height: SLOT_HGT, rx: 3,
    });
    r.style.stroke = SLOT_STROKE;
    r.style.strokeWidth = '1';
    r.style.fill = SLOT_FILL.free;
    frame.appendChild(r);
    slots.push(r);
  }

  const counter = box({ x: x + CNT_X, y: NODE_Y + CNT_Y, w: CNT_W, h: CNT_H, label: '0 of 8', cat: 'storage' });
  return { frame, slots, counter };
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
      'aria-label': 'Node volume attach limits. Every node has a hard ceiling on how many volumes one CSI driver may have attached to it at once. The CSI node plugin answers NodeGetInfo with max_volumes_per_node, kubelet writes that number into the node CSINode object as allocatable.count, and the scheduler filter NodeVolumeLimits is the only thing that reads it. Here three nodes each report a ceiling of eight, so the cluster has twenty four attachment slots. As claims are provisioned the nodes walk up to eight of eight and the cluster runs out of slots. Pod web-0 is then created, asks for one volume, and the filter rejects every node, so the Pod sits in Pending reporting that the nodes exceed max volume count even though every node has spare CPU and spare memory. The count covers the volumes of Pods assigned to a node plus every VolumeAttachment still live on it, so a slot is freed only when a detach completes and its VolumeAttachment is deleted, not when a Pod dies. The Pod schedules on the next attempt after one detach finishes on node-3. The levers are fewer volumes per Pod, more nodes, or a node pool whose instance type reports a higher ceiling.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podNew = podBlock();

    const sched = box({
      x: SCHED_X, y: SCHED_Y, w: SCHED_W, h: SCHED_H,
      label: 'Scheduler', sublabel: 'NodeVolumeLimits filter', cat: 'storage',
    });

    const csinode = box({
      x: CSI_X, y: CSI_Y, w: CSI_W, h: CSI_H,
      label: 'CSINode (one per node)', sublabel: 'allocatable.count: 8', cat: 'storage',
    });

    const nodes = ['node-1', 'node-2', 'node-3'].map((label, i) => nodeBlock({ x: NODE_X[i], label }));

    const wPodSched = pathArrow({ points: W_POD_SCHED, dashed: true, dim: true, color: 'storage' });
    const wSchedPod = pathArrow({ points: W_SCHED_POD, dashed: true, dim: true, color: 'storage' });
    const wSchedCsi = pathArrow({ points: W_SCHED_CSI, dashed: true, dim: true, color: 'storage' });
    const wReport = W_NODE_CSI.map(pts => pathArrow({ points: pts, dashed: true, dim: true, color: 'storage' }));

    // No wire caption in the Scheduler-to-CSINode corridor. There used to be one, a dim line of text
    // re-worded on every step, and it was carrying nothing the narration and the chip strip did not
    // already say: it sat off to one side of a lane that was itself off-centre, so the one corridor
    // that should read as a single clean axis had two competing things in it. The corridor is now
    // empty apart from the lane on the spine. `wires` stays as an empty map so the family prologue
    // (clearWires) is still valid if a caption is ever wanted back.

    const capChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'allocatable.count', value: '8 per node', cat: 'storage' });
    const attChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'attached',          value: '4 of 24',    cat: 'storage' });
    const podChip   = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'Pod web-0',         value: 'not created', cat: 'storage' });
    const blockChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'blocked by',        value: 'nothing',     cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frames (which carry their own slot strips), then the counter
    // boxes so they sit above their frame, then the CSINode row and the Scheduler, then the Pod, then
    // every lane above the blocks, then the chip strip, then the packet layer so every ball rides
    // above everything.
    nodes.forEach(n => root.appendChild(n.frame));
    nodes.forEach(n => root.appendChild(n.counter));
    [csinode, sched, podNew.group].forEach(el => root.appendChild(el));
    [wPodSched, wSchedPod, wSchedCsi, ...wReport].forEach(el => root.appendChild(el));
    [capChip, attChip, podChip, blockChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podNew: podNew.group, podBox: podNew.innerBox,
      podShell: podNew.group.querySelector('.scheme-pod'),
      sched, csinode,
      nodes,
      cnt0: nodes[0].counter, cnt1: nodes[1].counter, cnt2: nodes[2].counter,
      wPodSched, wSchedPod, wSchedCsi, wReport,
      capChip, attChip, podChip, blockChip,
      wires: {},
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
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report 'blocked by: max volume count' on the step where the Pod is already running.
// Each name means exactly one thing: 'attached' is slots in use across the whole cluster, never one
// node, and 'blocked by' is the reason web-0 cannot be placed, never the Pod state itself.
function setChips(s, { cap = '8 per node', attached, pod: podVal, blocked }) {
  setChip(s.refs.capChip, cap);
  setChip(s.refs.attChip, attached);
  setChip(s.refs.podChip, podVal);
  setChip(s.refs.blockChip, blocked);
}

// The gauge. `counts` is one entry per node: a number, or a number plus a `fresh` flag marking the
// last filled slot as the one web-0 just took. Every step calls this with all three, for the same
// reason every step writes every chip: a node left unset keeps the previous step's reading, and a
// counter that disagrees with its own slot strip is the one error on this card a reader cannot catch.
function setSlots(s, counts) {
  s.refs.nodes.forEach((n, i) => {
    const spec = counts[i];
    const used = typeof spec === 'number' ? spec : spec.used;
    const fresh = typeof spec === 'number' ? false : Boolean(spec.fresh);
    n.slots.forEach((r, j) => {
      if (j >= used) { r.style.fill = SLOT_FILL.free; return; }
      r.style.fill = (fresh && j === used - 1) ? SLOT_FILL.fresh : SLOT_FILL.used;
    });
    setBoxLabel(n.counter, used + ' of ' + SLOT_N);
  });
}

function clearHL(s) {
  clearHighlights(s, ['sched', 'csinode', 'cnt0', 'cnt1', 'cnt2', 'podBox',
    'capChip', 'attChip', 'podChip', 'blockChip'], [s.refs.podNew]);
}

// One place that pins every mutable opacity and every mutable sublabel, called from every step with
// only the things that step changes. clearHighlights clears classes, not inline styles, so without
// this a step entered out of order would inherit the previous step's opacities: the reduced-motion
// replay path (prev / reset) walks 0..n and would leave the Pod visible on step 1.
//
// The lanes each track the thing they represent. A lane into or out of a Pod that does not exist yet
// points at nothing, so it is pinned to 0 rather than dimmed: unlike a block it leaves no hole when
// it goes. The three report lanes are the exception and stand at full from the first frame, because
// what they carry (a node telling the cluster its own ceiling) is a standing relationship that was
// true long before this card started.
function setStage(s, {
  podOp = 0, podSub = 'not created', pvcSub = 'needs one slot',
  linkPod = 0,        // the Pod to Scheduler request lane
  linkBack = 0,       // the Scheduler to Pod answer lane
  linkRead = 0,       // the Scheduler reading allocatable.count off CSINode
} = {}) {
  s.refs.podNew.style.opacity = String(podOp);
  setPodSublabel(s.refs.podShell, podSub);
  setBoxSublabel(s.refs.podBox, pvcSub);
  s.refs.wPodSched.style.opacity = String(linkPod);
  s.refs.wSchedPod.style.opacity = String(linkBack);
  s.refs.wSchedCsi.style.opacity = String(linkRead);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    // The Pod is absent, not dim. It has not been created yet, and a ghost Pod sitting at the top of
    // the card from the first frame would say the scheduling attempt is already under way, which is
    // the opposite of the setup: right now there is simply a cluster with room in it.
    narration: 'Every node has a hard ceiling on how many volumes one CSI driver may have attached to it at once, and it has nothing to do with CPU or memory. Here three nodes each report a ceiling of eight, so the cluster holds twenty four slots and four are in use. Nothing about this number is on a dashboard.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [2, 1, 1]);
      setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });
    },
  },
  {
    id: 'cap',
    duration: 2800,
    // Where the number comes from, which is the one CSI object the rest of the row never touches.
    // All three report lanes fire together rather than one after another: they are three copies of
    // one mechanism, and walking them in sequence would suggest an ordering that does not exist.
    narration: 'The ceiling is not a Kubernetes setting. The CSI node plugin answers NodeGetInfo with max_volumes_per_node, and kubelet writes that number into the CSINode object for its own node, as allocatable.count. Real drivers report anything from a handful on a small VM to a hundred and twenty seven on GCE.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [2, 1, 1]);
      setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });
      if (ctx.reduced) { s.refs.csinode.classList.add('highlight'); return; }
      // No Pod acts here and no block emits: the node plugins do, and they are drawn as the frames
      // themselves. So the balls leave after BEAT.lead with no preceding pulse, and CSINode lights
      // when the first one lands rather than at step entry.
      //
      // All three share REPORT_DUR so they land on the same frame, which is the point: three nodes
      // reporting one number each, not a staggered relay. The riding label is passed the SAME dur, or
      // it drifts off its own ball mid-flight and only rejoins it at the endpoints.
      W_NODE_CSI.forEach(pts => {
        routePacket(s, ctx, pts, { delay: BEAT.lead, dur: REPORT_DUR, cat: 'storage' });
        ridingLabel(s, ctx, 'cap 8', pts, { delay: BEAT.lead, dur: REPORT_DUR });
      });
      // One arrival instant for all three, so the box lights exactly as the last of them touches it.
      lightBoxAt(s.refs.csinode, ctx, BEAT.lead + REPORT_DUR);
    },
  },
  {
    id: 'fill',
    duration: 2600,
    // Packet-less and Pod-less, and it does not need the sanctioned block flash: the slots filling IS
    // the motion, and it is the only step on the card where the gauge moves on its own.
    narration: 'Now the cluster fills. More Pods with claims are provisioned, more disks attach, and every node walks up to its own ceiling: eight of eight on all three, twenty four of twenty four across the cluster. No alarm fires, because a node sitting exactly at its ceiling is a healthy node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'not created', blocked: 'nothing' });
      s.refs.nodes.forEach(n => n.counter.classList.add('highlight'));
      if (ctx.reduced) return;
      // The newly taken slots fade in one after another, left to right and node by node, so the strip
      // reads as filling rather than as cutting to a full state. Pinned full above the guard first:
      // a cancel mid-fill must land on eight of eight, not on however far the stagger had got.
      // `seq` is a running counter across all three nodes, not a per-node index: the first pass
      // computed the delay from i and the node's own starting count, which double-counted node-1 and
      // pushed the last slot to 2620ms, past this step's 2600ms duration. Auto-advance would then
      // have cut the fill off with the final slot still fading in. 90ms per slot over the 20 slots
      // that actually change lands the last one at 1930ms, well inside the step.
      const prev = [2, 1, 1];
      let seq = 0;
      s.refs.nodes.forEach((n, i) => {
        for (let j = prev[i]; j < SLOT_N; j++, seq++) {
          n.slots[j].style.opacity = '0';
          ctx.register(n.slots[j].animate([{ opacity: 0 }, { opacity: 1 }],
            { duration: 220, delay: 90 * seq, fill: 'forwards', easing: 'ease-out' }));
        }
      });
    },
  },
  {
    id: 'ask',
    duration: 3000,
    narration: 'Now Pod web-0 is created and it asks for one volume of its own. Before the scheduler can score any node it has to filter out the ones that cannot take the Pod at all, and one filter exists purely for this ceiling. It is called NodeVolumeLimits, and it skips Pods that ask for no volumes.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Pending', linkPod: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'Pending', blocked: 'nothing' });
      if (ctx.reduced) { s.refs.sched.classList.add('highlight'); return; }
      // The Pod arriving IS the event, so it fades in first, and then takes the up-arrow ordering:
      // it blinks because it is the actor, and the request leaves once the blink has landed.
      s.refs.podNew.style.opacity = '0';
      ctx.register(s.refs.podNew.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 150, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podNew, ctx, 250);
      const req = routePacket(s, ctx, W_POD_SCHED, { delay: 250 + BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'schedule web-0', W_POD_SCHED, { delay: 250 + BEAT.afterPulse });
      lightBoxAt(s.refs.sched, ctx, req.arrivalMs);
    },
  },
  {
    id: 'filter',
    duration: 3200,
    narration: 'The filter reads allocatable.count out of each CSINode and compares it with what that node already owes: the volumes of the Pods assigned to it, plus every VolumeAttachment still live on it. Eight against a ceiling of eight, so all three are rejected before scoring runs at all.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Pending', linkPod: 1, linkRead: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'Pending', blocked: 'max volume count' });
      // The three counters are what the filter is actually comparing against, so all three are lit
      // for the whole step. This is a read, not a write: nothing on the node tier changes.
      s.refs.nodes.forEach(n => n.counter.classList.add('highlight'));
      // Lit from entry because the Scheduler is where the read comes from, and a ball must never
      // depart from an unlit block or it reads as coming from nowhere.
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) { s.refs.csinode.classList.add('highlight'); return; }
      const rd = routePacket(s, ctx, W_SCHED_CSI, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'read allocatable.count', W_SCHED_CSI, { delay: BEAT.lead });
      lightBoxAt(s.refs.csinode, ctx, rd.arrivalMs);
    },
  },
  {
    id: 'reject',
    duration: 3000,
    // The sentence of the whole card. The answer comes back DOWN its own lane rather than up the
    // request lane, because a FailedScheduling event is a thing the scheduler produces, not the
    // request bouncing.
    narration: 'So web-0 stays Pending, and its event reads zero of three nodes are available, three nodes exceed max volume count. Every one of those nodes has spare CPU and spare memory, which is what makes this hard to recognise: the cluster looks half empty and the Pod will not schedule.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'FailedScheduling', linkPod: 1, linkBack: 1, linkRead: 1 });
      setSlots(s, [8, 8, 8]);
      setChips(s, { attached: '24 of 24', pod: 'FailedScheduling', blocked: 'max volume count' });
      s.refs.sched.classList.add('highlight');
      if (ctx.reduced) return;
      // Down-arrow ordering: infra reaching a Pod, so the ball goes first and the Pod blinks on
      // arrival. The tag rides BELOW the ball (dy positive) because a lane ending at a Pod cannot
      // carry its tag above it: pod() puts the sublabel 8 units above the shell bottom, and a tag at
      // the default -14 would print on top of it for the last beat of the flight.
      const ans = routePacket(s, ctx, W_SCHED_POD, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'exceed max volume count', W_SCHED_POD, { delay: BEAT.lead, dy: 22 });
      pulsePod(s.refs.podNew, ctx, ans.arrivalMs);
    },
  },
  {
    id: 'detachlag',
    duration: 3400,
    // The senior edge, and the reason this is not simply a capacity-planning card. A slot is held by
    // an ATTACHMENT, not by a Pod, so the two are not freed at the same moment.
    narration: 'What clears it is a detach completing. The slot is held by the VolumeAttachment, not by the Pod, so deleting a Pod frees nothing until that object is gone, and a detach takes seconds to tens of seconds. One finishes on node-3, the count drops to seven, and web-0 is placed there at once.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 });
      // node-3 ends back at eight of eight, and the eighth slot is drawn `fresh` so the end state
      // shows WHICH slot web-0 took. The seven of eight in the narration is a transient the motion
      // below plays through, never a resting state: a slot that opens and is taken in the same
      // breath is exactly the race the step is about.
      setSlots(s, [8, 8, { used: 8, fresh: true }]);
      setChips(s, { attached: '24 of 24', pod: 'Running on node-3', blocked: 'nothing' });
      s.refs.nodes[2].counter.classList.add('highlight');
      if (ctx.reduced) return;
      // The transient: the last slot empties, the counter reads seven of eight for a beat, then the
      // slot comes back bright as web-0 takes it and the counter goes back to eight. Everything here
      // only replays what is already pinned above, so a cancel mid-step still lands correctly.
      // Opacity only, never fill. The first pass drove the fill through onfinish handlers, which made
      // the step's END state depend on a callback firing: a seek or an early cancel left the slot
      // showing the transient instead of the pinned `fresh`. Now the fill is set once, statically,
      // above the guard, and the motion just takes the slot away and brings it back. The counter text
      // is the one thing that still rides onfinish, and that self-heals because the next step calls
      // setSlots and rewrites every counter from scratch.
      const slot = s.refs.nodes[2].slots[SLOT_N - 1];
      const cnt = s.refs.nodes[2].counter;
      const free = slot.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: FADE.out, delay: 200, fill: 'forwards', easing: 'ease-in' });
      free.onfinish = () => setBoxLabel(cnt, '7 of ' + SLOT_N);
      ctx.register(free);
      const take = slot.animate([{ opacity: 0.12 }, { opacity: 1 }], { duration: 400, delay: 1600, fill: 'forwards', easing: 'ease-out' });
      take.onfinish = () => setBoxLabel(cnt, SLOT_N + ' of ' + SLOT_N);
      ctx.register(take);
      pulsePod(s.refs.podNew, ctx, 2000);
    },
  },
  {
    id: 'fix',
    duration: 3400,
    // The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash
    // either. The usual argument for flashing something on a packet-less step does not apply to the
    // LAST step, which the reader is meant to sit and read.
    narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest, since a Pod mounting four claims eats four slots wherever it lands. More nodes buys more slots, and an instance type that reports a higher ceiling buys more per node.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { podOp: 1, podSub: 'Running on node-3', pvcSub: 'attached on node-3', linkPod: 1, linkBack: 1, linkRead: 1 });
      setSlots(s, [8, 8, { used: 8, fresh: true }]);
      setChips(s, { attached: '24 of 24', pod: 'Running on node-3', blocked: 'nothing' });
      s.refs.csinode.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
