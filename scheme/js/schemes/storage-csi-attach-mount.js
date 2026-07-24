import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, node, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur, makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Attach and Mount Chain (viewBox 1200x640). THE LADDER CARD. The four gRPC calls that stand between
// a bound claim and a writable /data are a numbered ladder down the LEFT (chainList, one rung lit per
// step), and the RIGHT is the topology those calls act on: the CSI controller and the cloud disk up
// top, outside any node, then node-1 below holding the node plugin, the attached block device, the ONE
// global staging mount, and the two Pods that share it. The descent is literal: CreateVolume makes the
// disk, ControllerPublishVolume moves it into the node as a device, NodeStageVolume mounts it once at
// the global path, NodePublishVolume bind-mounts that one staged filesystem into each Pod. Stage is
// once per node, publish is once per Pod, which is exactly how two Pods on one node share one disk.
//
// ---- Horizontal composition ----
// Two columns of EQUAL width sharing one centre. The canvas centre is 600 and both margins are M=60,
// with a gutter G=48 between the columns, so 2*M + 2*COL_W + G = 1200 solves to COL_W = 516. That is
// not a chosen number: it is what makes the ladder (60..576) and the node column (624..1140) mirror
// each other about 600. An earlier pass hand-typed LAD_W 508 / NF_W 560, which put the content bbox at
// 60..1178 with its centre at 619, visibly shoved right. Change M or G and COL_W has to be re-solved.
//
// Every tier inside the node column is symmetric about NODE_CX = 882 (= NF_X + NF_W/2), never about a
// hand-typed margin: the two Pods sit at 753 and 1011, whose midpoint is 882, and the staging band and
// the node driver both hang off the same NODE_PAD. The chip strip is the one tier that spans the WHOLE
// content width (60..1140) rather than one column, so it reads as a rail under both columns and its
// own centre is 600, agreeing with the composition centre rather than fighting it.
//
// ---- Narration overlay (MEASURED for this card, 2026-07-21) ----
// The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it eats.
// Measured right edge / bottom edge, worst step, by viewport:
//   1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
//   1100x800  -> 397 / 230     900x650 -> 398 / 375
// So the real worst case is x<=398 AND y<=375, well inside the blanket x<=380 & y<=300 rule on x but
// PAST it on y, because this card carries some of the longest narration in the catalog. The ladder is
// what this pins: LAD_Y 388 clears the measured 375 by 13 units and cannot move up. Lengthening any
// narration string invalidates these numbers and they have to be measured again.
//
// ---- Text widths (MEASURED, not estimated) ----
// getBoundingClientRect in the browser, mapped back into viewBox units. Both the chip text and the
// dim code labels are 11px JetBrains Mono, so one number sizes the chip strip and the band caption:
//   .scheme-chip-text      6.89 u/char  ('attached to node-1' = 124.0 over 18 chars)
//   .scheme-label code dim 6.89 u/char  ('one mount, two bind mounts' = 179.2 over 26 chars)
// It is monospace, so that rate has zero variance and one sample is enough. Longer strings measure
// slightly under (the ladder rows run 6.54 to 6.62) only because of the narrow separator glyph.
//
// YOU MUST AWAIT document.fonts.ready BEFORE MEASURING. A first pass recorded 5.54 u/char here, from
// which it derived a 42-character ceiling and 46 units of caption clearance. Both were wrong: that
// pass sampled before the webfont finished loading and measured the fallback monospace, which is
// ~20 percent narrower than JetBrains Mono. Nothing overflowed, because the captions in use are
// short, but a later edit trusting a 42-character ceiling would have run a caption onto a lane.
// Do not eyeball these off a screenshot either.
const M = 60, GUTTER = 48;
const COL_W = (1200 - 2 * M - GUTTER) / 2;               // 516: solved, see above

// ---- left column: the four-call ladder ----
// The widest rung renders at 271.5 units plus the primitive's 10 unit text inset, so 282 of ink in a
// 516 wide rung. The extra width is deliberate: the rungs read as a stacked bar chart of the chain,
// and shrinking them to the text would break the column mirror the whole layout is built on.
const LAD_X = M, LAD_W = COL_W, LAD_Y = 388, LAD_ROW = 40, LAD_GAP = 10;

// ---- right column: node-1 and the two blocks above it ----
const NF_X = M + COL_W + GUTTER, NF_Y = 192, NF_W = COL_W, NF_H = 388;   // 624..1140 / 192..580
const NODE_PAD = 16;
const NODE_CX = NF_X + NF_W / 2;                          // 882: every tier below is symmetric on this
const IN_X = NF_X + NODE_PAD, IN_W = NF_W - NODE_PAD * 2; // 640 / 484: the usable inner width

// The controller and the cloud disk sit ABOVE the node frame because neither lives on a node: the
// first two calls are cluster-scope. They align with the node column so the descent reads as one
// vertical story, the controller over the node plugin, the cloud disk over the device it becomes.
//
// The disk is declared FIRST and the controller is hung off its face centre, because CreateVolume has
// to read as ONE straight horizontal run. These used to be the other way round with CTRL_Y typed as a
// literal 52, which put the controller centre at 84 against a disk face at 96: a 12 unit mismatch, too
// small to look deliberate and too large to look level, so the lane had to jog through two corners to
// cover it. Deriving CTRL_Y from CDISK_FACE_CY makes the run straight by construction, and keeps it
// straight if either block is ever resized.
const DISK_W = 150;
const DISK_X = IN_X + IN_W - DISK_W;                      // 974: right-aligned to the node inner edge
const DISK_CX = DISK_X + DISK_W / 2;                      // 1049, shared by the cloud disk and the device
const CDISK_Y = 44, CDISK_H = 104;
const CDISK_BOTTOM = CDISK_Y + CDISK_H;                   // 148
const CDISK_FACE_CY = CDISK_Y + CDISK_H / 2;              // 96

const CTRL_W = 252, CTRL_H = 64;
const CTRL_X = IN_X, CTRL_RIGHT = CTRL_X + CTRL_W;        // 640 / 892
const CTRL_CY = CDISK_FACE_CY;                            // 96: level with the disk face, by construction
const CTRL_Y = CTRL_CY - CTRL_H / 2;                      // 64

const DEV_Y = 212, DEV_H = 92;
const DEV_TOP = DEV_Y, DEV_BOTTOM = DEV_Y + DEV_H;        // 212 / 304

// The node plugin sits under the controller, left-aligned in the node, so the reader can see that the
// two node calls are run by a different process than the two controller calls above it.
const ND_X = IN_X, ND_Y = 220, ND_W = 250, ND_H = 58;

// The staging mount is a FULL-WIDTH band, not a centred box, for a reason the card is about: it is one
// mount serving every Pod on the node, so it has to physically span all of them. It also gives the
// device drop somewhere to land anywhere along its top edge.
const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;        // 350 / 408

// 2*POD_W + POD_GAP = IN_W = 484. POD_W 226 leaves POD_GAP 32. The widest string inside a Pod is the
// sublabel 'private bind mount' at a measured 99.7 units, so the width is set by the tier maths, not by
// the text, and there are ~63 units of air either side of the longest label.
const POD_W = 226;
const POD_GAP = IN_W - 2 * POD_W;                         // 32
const POD_Y = 454, POD_H = 110;
const PODA_X = IN_X, PODB_X = IN_X + POD_W + POD_GAP;     // 640 / 898
const PODA_CX = PODA_X + POD_W / 2, PODB_CX = PODB_X + POD_W / 2;  // 753 / 1011, midpoint 882 = NODE_CX

// ---- bottom rail: four chips, one per call ----
// Four calls, four facts, so each chip is the visible outcome of one rung of the ladder and a chip can
// never mean something its name does not say. The strip spans the full content width, so
// 4*CHIP_W + 3*CHIP_GAP = 1080 with CHIP_GAP 16 solves CHIP_W to 258. Worst name+value pair at the
// measured 6.89 u/char is 'bind mounts' (75.8) + '2 (Pod A + Pod B)' (117.1) + the primitive's 24
// units of inset = 216.9, so 258 leaves 41 units of air between name and value at the tightest step.
const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = 2 * COL_W + GUTTER;                       // 1080: exactly the content width
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;   // 258
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => M + i * (CHIP_W + CHIP_GAP));

// The band caption sits in the corridor between the staging band and the Pods, centred on NODE_CX. The
// nearest obstacles are the two publish lanes at 753 and 1011, so the clear width is 258 units. Keeping
// 12 units off each arrowhead leaves 234, which at the measured 6.89 u/char is a hard ceiling of 33
// characters. The longest caption in use is 26 characters (179.2 units, 27 units of clearance either
// side). Overrun the ceiling and the first and last letters sit on a lane arrowhead.
const STG_LBL_Y = 434;

// The one remaining elbowed lane turns at the MIDPOINT of the gap it crosses, so the corner is centred
// in its own corridor and stays centred if either block moves. It was hand-typed as 327 until this
// pass, which is exactly the drift the header warns about: it happened to be right, but nothing tied it
// to the blocks it sits between, so changing DEV_H would have stranded the elbow mid-gap with no test
// and no screenshot catching it.
const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap

// Every wire below is shared by the static pathArrow and the ball that rides it, so the drawn lane and
// the packet cannot drift apart. All four calls in the chain get a lane and a ball, and no lane carries
// return traffic, so no lane needs an offset twin: this card is one-way all the way down.
// Each lane also leaves its source from the CENTRE of an edge, never off to one side.
//
// CreateVolume is a single straight segment: controller right edge to disk left edge, both at y=96.
const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [DISK_X, CDISK_FACE_CY]];
const W_ATTACH  = [[DISK_CX, CDISK_BOTTOM], [DISK_CX, DEV_TOP]];
// The stage lane elbows in to NODE_CX before it drops, so the device visibly arrives at the MIDDLE of
// the band rather than at the corner under itself: the staging mount belongs to the whole node, not to
// the column the device happens to sit in. It also makes the run 217 units instead of a 46 unit stub.
const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [NODE_CX, STAGE_ELBOW_Y], [NODE_CX, STG_TOP]];
const W_PUB_A   = [[PODA_CX, STG_BOTTOM], [PODA_CX, POD_Y]];
const W_PUB_B   = [[PODB_CX, STG_BOTTOM], [PODB_CX, POD_Y]];
// Ownership, not traffic: the node plugin is what performs both node calls, so it owns the staging
// mount below it. No ball ever rides this, so it deliberately has NO arrowhead (a bare dashed path
// rather than a pathArrow), because an arrowhead with no ball reads as traffic that never runs.
const W_OWNS = `M ${ND_X + ND_W / 2} ${ND_Y + ND_H} L ${ND_X + ND_W / 2} ${STG_TOP}`;

// How long a newborn construction takes to materialise. It runs BEFORE the ball leaves (BEAT.lead is
// 800), so the block and its lanes are fully present and at full strength by the time anything is sent
// down them, which is the whole point: the reader never sees a lane with no block on the end of it.
const LAND_MS = 500;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fade an element in to `to` at `delay`. Under ctx.reduced it snaps, which is what keeps the static
// end-state of a prev/reset replay correct. It never snaps otherwise, not even at delay 0, because a
// zero-delay reveal here is a real beat (Pod B landing on the node) and not a shortcut.
function revealAt(el, ctx, delay = 0, to = 1, dur = 500) {
  if (!el) return;
  if (ctx.reduced) { el.style.opacity = String(to); return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: to }], { duration: dur, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides with the ball on the same points, duration AND easing, so the ball visibly carries
// the call name it is making. Not a .scheme-packet, so the tools do not count it. Every ball on this
// card is a routePacket, which is eased, so the default ease-in-out matches and the tag stays glued to
// the ball. Pass a linear easing here and it would drift off a linear hop mid-flight.
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

// PULSE MODEL: the Pod is ONE unit and blinks as one. The shell and the container box both live in
// `group`, and `group` is what pulsePod gets, so the whole Pod lights for exactly as long as its ball
// is in flight and nothing is left lit afterwards. The container box NEVER takes a .highlight: an
// earlier pass called lightBoxAt on it at packet arrival, which left /data outlined for the rest of the
// step after the blink had decayed, so the Pod read as permanently mid-event.
// The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
function podBlock({ x, label }) {
  // The sublabel names what NodePublishVolume actually creates for this Pod, a per-Pod bind mount off
  // the shared staging path. It deliberately does not repeat '/data', which the container box below
  // already carries: two labels saying the same path made the Pod read as one fact printed twice.
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'private bind mount', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 24, y: POD_Y + 40, w: POD_W - 48, h: 46, label: 'App', sublabel: '/data writable', cat: 'storage' });
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
      'aria-label': 'The CSI attach and mount chain: four gRPC calls take a volume from nowhere to a writable path. CreateVolume makes the disk in the cloud backend, ControllerPublishVolume attaches it to the node as a raw block device, NodeStageVolume formats it if needed and mounts it once at a global staging path, and NodePublishVolume bind-mounts that one staged filesystem into each Pod, which is how two Pods on one node share a single attached disk.',
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
      cat: 'storage',
    });

    // Block LABELS are title-capitalized: every word of the name takes a capital. Two labels are
    // deliberately exempt because capitalizing them would make them WRONG rather than merely styled.
    // The device is a literal kernel path, and there is no /dev/Nvme1n1 on any machine. node-1 is a
    // hostname, and the node primitive uppercases its own label in CSS anyway, so editing that string
    // would be a no-op that only looked like a change. Identifiers inside a name (vol-1) keep their
    // real casing for the same reason. Sublabels stay lowercase prose.
    const ctrl  = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI Controller', sublabel: 'attacher + provisioner', cat: 'storage' });
    const cdisk = cylinder({ x: DISK_X, y: CDISK_Y, w: DISK_W, h: CDISK_H, label: 'Cloud Disk vol-1', cat: 'storage' });
    const dev   = cylinder({ x: DISK_X, y: DEV_Y, w: DISK_W, h: DEV_H, label: '/dev/nvme1n1', cat: 'storage' });
    const nd    = box({ x: ND_X, y: ND_Y, w: ND_W, h: ND_H, label: 'CSI Node Driver', sublabel: 'node plugin', cat: 'storage' });
    const stg   = box({ x: STG_X, y: STG_Y, w: STG_W, h: STG_H, label: 'Global Staging Mount', sublabel: '.../csi/vol-1/globalmount', cat: 'storage' });
    const podA  = podBlock({ x: PODA_X, label: 'Pod A' });
    const podB  = podBlock({ x: PODB_X, label: 'Pod B' });

    // The node primitive carries its own label at a position RELATIVE to the frame group. Appending a
    // text with an ABSOLUTE x into a translated group is what hid this label off-canvas before: the
    // group already carries translate(624,192), so an x of 640 renders at 1264, past the 1200 viewBox,
    // and the outer svg clips it. Let the primitive place it.
    const nodeFrame = node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'node-1' });

    const wCreate = pathArrow({ points: W_CREATE, dashed: true, dim: true, color: 'storage' });
    const wAttach = pathArrow({ points: W_ATTACH, dashed: true, dim: true, color: 'storage' });
    const wStage  = pathArrow({ points: W_STAGE, dashed: true, dim: true, color: 'storage' });
    const wPubA   = pathArrow({ points: W_PUB_A, dashed: true, dim: true, color: 'storage' });
    const wPubB   = pathArrow({ points: W_PUB_B, dashed: true, dim: true, color: 'storage' });
    const wOwns   = path({ class: 'scheme-arrow scheme-arrow-dashed scheme-arrow-dim scheme-arrow-storage', d: W_OWNS, fill: 'none', 'stroke-dasharray': '5 5' });

    // A BLOCK AND ITS LANES ARE ONE CONSTRUCTION AND APPEAR TOGETHER.
    // Only the standing topology (controller, cloud disk, node driver, staging mount, and the ownership
    // spine between the last two) is drawn from the first frame. Everything that is BORN mid-story is
    // hidden here and revealed as a unit on the step that creates it:
    //   step 2  the device, with the lane that attaches it and the lane that stages off it
    //   step 4  Pod A, with its bind-mount lane
    //   step 5  Pod B, with its bind-mount lane
    // The previous pass hid only the blocks and left all four lanes drawn from frame one, so the card
    // opened on an arrowhead pointing into empty canvas above the device and two more pointing at Pods
    // that did not exist, then popped a cylinder in underneath the arrows already aimed at it. An
    // arrow to nothing reads as traffic that never runs, and it also gave away the punchline (that one
    // staged mount serves many Pods) three steps before the narration gets there.
    [dev, wAttach, wStage, podA.group, wPubA, podB.group, wPubB].forEach(el => { el.style.opacity = '0'; });

    const stgLbl = text({ class: 'scheme-label code dim', x: NODE_CX, y: STG_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const diskChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk',           value: 'none', cat: 'storage' });
    const devChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device on node', value: 'none', cat: 'storage' });
    const stageChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'staging mount',  value: 'none', cat: 'storage' });
    const bindChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts',    value: 'none', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frame behind everything it contains, then the blocks, then the
    // lanes and the band caption above them, then the chip rail, then the packet layer so every ball
    // rides on top. The ladder goes last of all: it is the reader's index into the story and its lit
    // rung must stay crisp even when a ball is passing (nothing overlaps it, but the intent is stated).
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

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
// holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
// always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how this
// card once showed a staging mount on the step that was explaining the disk did not exist yet.
function setChips(s, { disk, device, staging, binds }) {
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.devChip, device);
  setChip(s.refs.stageChip, staging);
  setChip(s.refs.bindChip, binds);
}

// Every step pins the visibility of EVERY born-mid-story element, exactly as setChips pins every chip,
// so a step can never silently inherit a block or a lane from the step before it. A block and its lanes
// share one flag on purpose: they are one construction and there is no legal state where a lane is
// visible and the block on the end of it is not.
function setBorn(s, { device = 0, podA = 0, podB = 0 } = {}) {
  [[s.refs.dev, device], [s.refs.wAttach, device], [s.refs.wStage, device],
    [s.refs.podA, podA], [s.refs.wPubA, podA],
    [s.refs.podB, podB], [s.refs.wPubB, podB]].forEach(([el, v]) => { el.style.opacity = String(v); });
}

function clearHL(s) {
  clearHighlights(s, ['ctrl', 'cdisk', 'dev', 'nd', 'stg', 'podABox', 'podBBox',
    'diskChip', 'devChip', 'stageChip', 'bindChip'], [s.refs.podA, s.refs.podB]);
}

// One infra-to-infra call: the source block is already lit at step entry, so the ball leaves after
// BEAT.lead to let that registration land, and the destination lights on arrival. Returns arrivalMs so
// anything that follows chains off real geometry instead of a hard-coded delay.
function call(s, ctx, { points, tag, target, delay = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay, cat: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay });
  if (target) lightBoxAt(target, ctx, pkt.arrivalMs);
  return pkt;
}

// Reveal a Pod together with its own bind-mount lane, then run NodePublishVolume into it. This is infra
// reaching a Pod, so it takes the down-arrow ordering: the ball flies first and the Pod pulses on its
// ARRIVAL, never before.
//
// The Pod arrives at FULL strength and simply pulses when the mount lands. It used to fade in at 0.5
// and ramp to 1 on arrival, on the theory that a Pod with no volume yet is a Pod that has not started.
// In practice that read as a rendering fault rather than as a state: Pod A sat visibly greyed out for
// the first three steps next to blocks at full strength, so it looked broken, not pending. A Pod that
// is not there yet is now simply not drawn, which says the same thing without dimming anything.
function publishInto(s, ctx, { podEl, lane, points, tag }) {
  revealAt(podEl, ctx, 0, 1, LAND_MS);
  revealAt(lane, ctx, 0, 1, LAND_MS);
  const delay = BEAT.lead;
  const pkt = routePacket(s, ctx, points, { delay, cat: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay });
  pulsePod(podEl, ctx, pkt.arrivalMs);
  return pkt;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Between a bound claim and a container that can write to /data stand four gRPC calls. Two are controller calls that happen once in the cluster, two are node calls that happen on the machine where the Pod lands. Nothing is mounted until all four have run in order.',
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
    duration: 2800,
    narration: 'CreateVolume runs first, on the controller side. The provisioner asks the driver to carve a real disk out of the cloud backend. When it returns, a disk called vol-1 exists somewhere in the provider, but it is not near any node yet and nothing can read a byte of it.',
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
    narration: 'ControllerPublishVolume runs next, still on the controller side. The external-attacher asks the driver to attach vol-1 to the node the Pod was scheduled on. This is a cloud operation: the disk shows up on the node as a raw block device, here /dev/nvme1n1. It is still unformatted.',
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
      // The device and BOTH of its lanes materialise as one construction, and finish materialising
      // before the call is sent (LAND_MS 500 against BEAT.lead 800), so the reader never sees an
      // arrowhead aimed at a block that is not there yet.
      revealAt(s.refs.dev, ctx, 0, 1, LAND_MS);
      revealAt(s.refs.wAttach, ctx, 0, 1, LAND_MS);
      revealAt(s.refs.wStage, ctx, 0, 1, LAND_MS);
      call(s, ctx, { points: W_ATTACH, tag: 'ControllerPublish', target: s.refs.dev });
    },
  },
  {
    id: 'stage',
    duration: 3000,
    narration: 'NodeStageVolume is the first node call. The node plugin formats the raw device if needed and mounts it once, at a global staging path under the kubelet directory. This happens a single time per node no matter how many Pods will use the volume, which is the whole reason stage and publish are two calls, not one.',
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
    narration: 'A second Pod lands on the same node and asks for the same volume. The disk is already attached and already staged, so those two calls are skipped entirely. Only one more NodePublishVolume runs, a second bind-mount off the same global staging path. That is how several Pods on one node share a single attached disk.',
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
