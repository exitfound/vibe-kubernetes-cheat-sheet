import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, node, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod,
  routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// The consequence card for storage-access-modes: its ReadWriteOnce step ends with a Pod on the wrong
// node getting refused, and this card is the whole life of that refusal. An RWO volume may be
// attached to ONE node at a time. The old Pod holds it on node-1 through a VolumeAttachment that
// says attached true, a rolling update creates the replacement on node-2 before the old one is gone,
// the attach and detach controller cannot write a second attachment for the same volume, and the new
// Pod hangs in ContainerCreating with "Multi-Attach error for volume".
//
// ---- What this card deliberately does NOT cover ----
// node-1 is HEALTHY on this card from the first frame to the last, and that is the whole boundary
// between this card and storage-volume-detach-on-node-loss. Here nothing is uncertain and nothing is
// broken: the volume is legitimately held by a Pod that is legitimately still running, and the only
// reason the new Pod waits is that its own rollout strategy created it before deleting the old one.
// It is an ORDERING problem with an ordering fix (Recreate). The unreachable-node case, the
// pod-eviction and force-detach clocks, the roughly six minutes, and the argument about two writers
// corrupting one filesystem all belong to the detach-on-node-loss card and are deliberately not
// re-told here. An earlier pass told both stories on both cards, in nearly the same sentences, and
// the pair read as one card shown twice. If a timeout shows up in this file again, it has drifted.
//
// ---- Composition (viewBox 1200x640) ----
// Storage grammar is a vertical stack, and this card runs FOUR tiers because the story is a chain of
// four objects and each one has to be visible as its own thing:
//   1. two node frames, each holding one Pod            (the two claimants)
//   2. the attach and detach controller, one 300 wide box on the spine      (the decider)
//   3. the two VolumeAttachment objects, one per node, spread wide          (what it writes)
//   4. the disk on the bottom shelf                                         (what is contended)
// The card is a MIRRORED PAIR about CONTENT_CX: for every box on the left there is one of identical
// size at the identical offset on the right, and the two attach lanes are mirror images. So the only
// thing that ever differs between the left and the right half is state, never geometry. That is the
// point of the card, and it is why the tiers narrow and widen symmetrically rather than in a
// straight column: node row 400 wide, controller 300, the VolumeAttachment fork 592, the contended
// disk 240. Widest in the middle of the stack, narrowest at the decider, which is the shape of the
// sentence: one component, two records, one disk.
//
// Every tier shares ONE derived center, CONTENT_CX, rather than carrying hand-typed margins.
// LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
// window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
// step, by viewport:
//   1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
//   1100x800  -> 397 / 205     900x650 -> 398 / 344
// So the real worst case is x<=398 and y<=344, and it is an L: above y=344 nothing may sit left of
// 400, below it the full width is free. The two upper tiers (node row, controller) therefore start
// at LEFT_X or inside it, while the VolumeAttachment row at y=359 hangs 96 units further left on
// each side because it is clear of the overlay's bottom edge.
//
// That headroom is BOUGHT, and it is the reason the row can spread at all. The overlay grows one
// ~31 unit line at a time at 900x650, and the narrations here used to run to 383 characters, which
// put the bottom at 406 and buried the left VolumeAttachment. Everything below is held under ~290
// characters. Measured per step, eight of the nine sit on the 313 line and only `idle` wraps one
// line further, to 344, which is what sets the number above. So the clearance over the VA row is
// 16 units, not the 47 an earlier revision of this comment claimed: it is still positive, but it is
// ONE line of narration, and trimming `idle` by a few words is what would buy the margin back.
// Re-measure after editing narration, not just after moving geometry, and measure the poster step
// too: it carries step one's text and is the step that binds here.
//
// CONTENT_CX = LEFT_X + CONTENT_W/2 and LEFT_X cannot move, so CONTENT_W is the only lever on where
// the diagram sits. It is solved for, not chosen: CONTENT_W 400 puts CONTENT_CX exactly on 600, the
// canvas center. That exactness matters because of the chip strip, which at 976 units is far wider
// than the diagram above it and is therefore the tier that sets the visual center of the card. On
// 600 it spans 112..1088, so the left and right margins agree at 112. Widen CONTENT_W and the strip
// slides right while every other tier still looks internally symmetric, which is the failure mode
// that shipped in the sibling cards.
//
// The previous version of this card had the controller alone in the bottom LEFT corner at x=60 with
// the nodes and the disk up and to the right, which left a large dead region through the middle and
// put content under the narration overlay. It also drew the node captions by appending an
// absolutely positioned text INTO a translated group, so the node-2 caption rendered at x=1614 and
// was clipped away entirely. Both are gone: node() places its own caption in group-local
// coordinates, and every tier is derived from CONTENT_CX.
const LEFT_X = 400;

// ---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
// The tiers used to be typed out one y at a time and sat 44..628, which left the top of the card
// looser than the bottom and, worse, gave the node row only 30 units of air above the controller
// while the three lower tiers were packed at 52. That reads as a flat, crowded bottom half under a
// floating top one. Heights and gaps are declared once now, summed, and the leftover space is split
// evenly, so the nodes sit higher, the controller drops, and every corridor below it opens up.
// Block sizes follow storage-csi-architecture, which sets the storage family's box at 232 x 76 (its
// SIDE_W is 232 and its sidecar row is 76 tall). Both the controller and the two VolumeAttachments
// take that 76, and the VolumeAttachments take the 232 exactly. The controller is the one exception
// on width and it is forced, not chosen: 'Attach/Detach Controller' renders about 252 units, so a
// 232 box would clip its own label. It keeps 300, which leaves ~24 units of air.
const NODE_H = 156, BAND_H = 76, VA_H = 76, DK_H = 86, CHIP_H = 34;
const G_NODE_BAND = 56, G_BAND_VA = 56, G_VA_DK = 48, G_DK_CHIPS = 22;

const STACK_H = NODE_H + G_NODE_BAND + BAND_H + G_BAND_VA + VA_H + G_VA_DK + DK_H + G_DK_CHIPS + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 18, and the bottom margin matches it

const NODE_W = 180, NODE_GAP = 40, NODE_PAD = 16;
const NODE_Y = STACK_TOP;                                // 18
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 174
const NODE_A_X = LEFT_X;                                 // 400
const NODE_B_X = LEFT_X + NODE_W + NODE_GAP;             // 620
const CONTENT_W = NODE_W * 2 + NODE_GAP;                 // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600: canvas center, every tier uses it
const CX_A = NODE_A_X + NODE_W / 2;                      // 490
const CX_B = NODE_B_X + NODE_W / 2;                      // 710, and (490 + 710) / 2 == CONTENT_CX

// NODE_W is floored by the widest string inside a column, which is now the Pod sublabel
// 'Multi-Attach error' at about 113 units: NODE_W 180 leaves ~17 units of air either side of it.
// It used to be floored by the VolumeAttachment strings instead, but those boxes no longer live in
// a node's column, so they set their own width and stopped dictating this one.
const POD_W = NODE_W - NODE_PAD * 2;                     // 148
const POD_Y = NODE_Y + 28, POD_H = 102;                  // 46
const POD_BOTTOM = POD_Y + POD_H;                        // 148, 26 clear of the node floor
const POD_A_X = NODE_A_X + NODE_PAD;                     // 416
const POD_B_X = NODE_B_X + NODE_PAD;                     // 636

// The App box inside a Pod, in Pod-local coordinates. pod() draws its own label on the baseline at
// y=16 and its state sublabel on the baseline at y=h-8, so the free band inside a 102 tall Pod runs
// 20..84. APP_H 44 centered in it leaves 10 units under the Pod label and 13 above the sublabel.
// This is not cosmetic: the App box used to be 40..86 against a sublabel whose glyphs start at 87,
// so 'Running' and 'ContainerCreating' collided with the box edge on both Pods.
const APP_DY = 30, APP_H = 44;

// The controller is 300 wide rather than spanning the node columns at 400. That is not a style
// choice, it is what makes the fan below possible. Its two output lanes now leave its SIDE WALLS at
// mid-height and step outward before dropping, so the narrower the controller, the more room those
// lanes have to travel before they hit the hard left limit at x=398 (the narration overlay). At 400
// wide the left lane would have had to start travelling left from x=400 itself and would have run
// straight under the panel. At 300 it starts at 450 and has 30 units of clear step-out.
const BAND_W = 300;
const BAND_X = CONTENT_CX - BAND_W / 2;                  // 450..750
const BAND_Y = NODE_BOTTOM + G_NODE_BAND;                // 227
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 227 / 303
const BAND_MID_Y = BAND_Y + BAND_H / 2;                  // 265: where both output lanes leave
const BAND_LEFT = BAND_X, BAND_RIGHT = BAND_X + BAND_W;  // 450 / 750

// The VolumeAttachment row is the widest tier in the diagram, and deliberately so: it is the only
// place where the two claimants are separate objects rather than two halves of one band, so the eye
// should read it as a fork. The pair used to stand 60 apart directly under their node columns, which
// left the whole lower half looking vertically compressed. Now they sit 190 apart, hanging 65 units
// outside the node columns on each side.
//
// VA_CX 420 / 780 is a HARD FLOOR on the left, not a preference. Each lane drops vertically from
// BAND_MID_Y 265 down to VA_TOP 359, and that whole descent happens above the narration overlay's
// bottom edge (measured at 344 at 900x650), so the lane must stay right of the overlay's right edge
// at 398. 420 keeps 22 units of clearance. Push the pair further apart and the left lane goes under
// the panel, which is the one thing on this tier that cannot be fixed by moving anything else.
//
// The BOXES themselves are free to hang much further out than their lanes, because at VA_TOP 359
// they are already below the overlay: at 232 wide the left one spans 304..536, reaching 94 units
// past the limit that binds its own lane. That asymmetry between where a lane may go and where a
// box may go is the whole reason this tier can be the widest in the diagram.
const VA_W = 232;                                        // storage family box width, from csi-architecture
const VA_Y = BAND_BOTTOM + G_BAND_VA;                    // 359
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + VA_H;            // 359 / 435
const VA_A_CX = 420;
const VA_B_CX = 2 * CONTENT_CX - VA_A_CX;                // 780, so the pair centers on CONTENT_CX
const VA_A_X = VA_A_CX - VA_W / 2;                       // 304..536
const VA_B_X = VA_B_CX - VA_W / 2;                       // 664..896

const DK_W = 240;
const DK_Y = VA_BOTTOM + G_VA_DK;                        // 483
const DK_X = CONTENT_CX - DK_W / 2;                      // 480
const DK_TOP = DK_Y;                                     // 483
// Each attach lane drops STRAIGHT DOWN from its VolumeAttachment and makes one 90 degree turn into
// the disk's SIDE WALL. The two Ls face each other across the disk, so the pair reads as two
// claimants closing on one volume from opposite sides, and the middle of the corridor stays free for
// the band caption. A funnel into the top face was tried instead and dropped: it made both lanes
// share a final vertical segment and land one arrowhead on one point, which lost the mirrored pair
// that is the whole shape of the card.
//
// DK_SIDE_Y is the vertical CENTRE of the 86 tall body, so the two attach lanes enter each side wall
// dead centre of the disk rather than up in its top third. The arrowheads land on the side walls at
// x 480 and 720, while the centred 'PV-web RWO' label sits at x 600, so centring the entry height
// does not collide with it. The cap ellipse (483..499) is well clear above.
const DK_SIDE_Y = DK_Y + DK_H / 2;                       // 526
const DK_LEFT = DK_X, DK_RIGHT = DK_X + DK_W;            // 480 / 720

// The band caption sits in the corridor between the controller and the VA row (303..359), centered
// on CONTENT_CX so it runs between the two descending lanes at 420 and 780. That leaves 360 units of
// clear width, and the longest caption here, 'each side waits for the other', measures about 193, so
// it keeps ~83 units clear of each lane. Overrun 360 and the caption sits on an arrowhead.
const BAND_LBL_Y = 337;
const CHIPS_Y = DK_Y + DK_H + G_DK_CHIPS;                // 588

// ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
// the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
// Measured worst cases, in viewBox units:
//   blocked by   63 + 'force-detach ~6 min'  119 = 206
//   new Pod      44 + 'Multi-Attach error'   113 = 181
//   accessModes  69 + 'ReadWriteOnce'         82 = 175
//   attached to  69 + 'node-1'                38 = 131
// So 232 clears the worst pair with ~26 units between name and value, and matches the width the rest
// of the storage family settled on.
const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / new Pod / blocked by
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));


// Every array below feeds BOTH the static pathArrow and the ball that rides it, so a wire and its
// packet cannot drift apart. There are five lanes and every one of them carries a ball in some step,
// which is why every one of them is drawn with an arrowhead. Traffic is NOT mirrored even though the
// boxes are: only the new Pod ever asks for anything, so only column B has a request lane. An arrow
// drawn under the old Pod would be an arrowhead pointing at a request that is never made.
//
// That request lane starts at the NODE frame, not at the Pod inside it. The attach and detach
// controller acts on nodes: what it is being asked for is an attachment to node-2, and the Pod is
// only the reason the ask exists. Starting the lane at the Pod drew the Pod talking to the
// controller directly, which is not what happens and read as one box overlapping another.
//
// The controller's two output lanes leave its SIDE WALLS at exactly mid-height (BAND_MID_Y), step
// outward, and then drop into the TOP EDGE of their VolumeAttachment at exactly its centre. Every
// endpoint on those two lanes is therefore a face midpoint rather than a hand-picked offset, so the
// pair cannot drift out of symmetry when the controller or the row is resized. They used to drop
// straight out of the controller's underside at x 420 and 780, which read as two lines threaded
// through a slab instead of as two outputs of one component.
//
// Below the row, each lane leaves its VolumeAttachment at the bottom face centre, drops straight
// down, and turns once into the near side wall of the disk.
// The request lane leaves node-2 at its own column centre (710) and steps IN to enter the controller
// at the top face centre (600). It used to be a bare vertical at 710, which met the controller 40
// units short of its centre and so read as a line stopping on a random point of an edge rather than
// as an arrival. Turning on the midline of the corridor makes the endpoint a face midpoint, like
// every other endpoint on this card.
const NODE_BAND_TURN_Y = (NODE_BOTTOM + BAND_TOP) / 2;             // 199
const W_NODE_BAND = [[CX_B, NODE_BOTTOM], [CX_B, NODE_BAND_TURN_Y], [CONTENT_CX, NODE_BAND_TURN_Y], [CONTENT_CX, BAND_TOP]];
const W_BAND_VA_A = [[BAND_LEFT, BAND_MID_Y], [VA_A_CX, BAND_MID_Y], [VA_A_CX, VA_TOP]];
const W_BAND_VA_B = [[BAND_RIGHT, BAND_MID_Y], [VA_B_CX, BAND_MID_Y], [VA_B_CX, VA_TOP]];
const W_VAA_DISK  = [[VA_A_CX, VA_BOTTOM], [VA_A_CX, DK_SIDE_Y], [DK_LEFT, DK_SIDE_Y]];
const W_VAB_DISK  = [[VA_B_CX, VA_BOTTOM], [VA_B_CX, DK_SIDE_Y], [DK_RIGHT, DK_SIDE_Y]];

// The catalog value for a Pod that has been deleted or evicted. It is the only opacity a Pod takes
// on this card: a Pod that merely has not started yet is drawn at full strength, because it exists.
const GONE = 0.35;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball on this
// card is a routePacket, which is eased, so the default ease-in-out matches and the tag stays glued
// to the ball instead of drifting off it between the endpoints.
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

// PULSE MODEL: a Pod is ONE unit and blinks as one. The shell and its container box both live in
// `group`, and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its
// targets with querySelectorAll, which matches descendants only and never the element itself, so
// pulsing a bare pod() catches the .scheme-pod-rect child but not the group and the pulse silently
// fires at half strength (symptom in anim-dump: strokeOpacity rows but no filter row). No .highlight
// is ever put on the container box either, so a Pod never keeps a lit outline after its blink decays.
function podBlock({ x, label, sublabel }) {
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 14, y: POD_Y + APP_DY, w: POD_W - 28, h: APP_H, label: 'App', sublabel: 'uses PV-web', cat: 'storage' });
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
      'aria-label': 'A Multi-Attach error. The ReadWriteOnce volume PV-web is attached to node-1 through the VolumeAttachment va-1, and the Pod there is using it. A replacement Pod is scheduled onto node-2, so the attach and detach controller tries to write a second VolumeAttachment for the same volume, which ReadWriteOnce forbids. The request stops at the controller, the new Pod hangs in ContainerCreating reporting a Multi-Attach error, and nothing changes until the first attachment is removed. node-1 stays healthy throughout: the volume is held by a Pod that is still running, and the rollout is waiting for the new Pod to become ready before it deletes that old Pod, so the two sides wait on each other. Once the old Pod is deleted va-1 is removed, the disk detaches from node-1, the controller attaches it to node-2, and the new Pod starts. A Deployment on ReadWriteOnce storage hits this on every rolling update, because the new Pod is created before the old one is deleted, and switching that Deployment to the Recreate strategy avoids it.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // node() places its caption in GROUP-LOCAL coordinates (x 12, y 18 inside its own translate).
    // The old hand-rolled frame in this card appended a caption with an ABSOLUTE x into the
    // translated group, so the caption was displaced by the translate a second time and node-2 landed
    // at x=1614, outside the 1200-wide viewBox and clipped away. Use the primitive.
    const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' });
    const nodeB = node({ x: NODE_B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' });
    // node() drops its caption at local y=18, which on a frame this tall reads as floating inside the
    // box rather than as titling it. 14 tucks it up against the top edge. Placement only: the
    // uppercase rendering is catalog-wide styling and is left alone.
    [nodeA, nodeB].forEach(n => {
      const l = n.querySelector('.scheme-node-label');
      if (l) l.setAttribute('y', 14);
    });

    const podOld = podBlock({ x: POD_A_X, label: 'Pod web-0 old', sublabel: 'Running' });
    const podNew = podBlock({ x: POD_B_X, label: 'Pod web-0 new', sublabel: 'ContainerCreating' });

    const ctrl = box({
      x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Attach/Detach Controller', sublabel: 'RWO: one node at a time', cat: 'storage',
    });

    const vaA = box({ x: VA_A_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-1', sublabel: 'node-1, attached: true', cat: 'storage' });
    const vaB = box({ x: VA_B_X, y: VA_Y, w: VA_W, h: VA_H, label: 'VolumeAttachment va-2', sublabel: 'wanted, blocked', cat: 'storage' });

    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV-web RWO', cat: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as the rest of storage does.
    const dl = disk.querySelector('.scheme-cylinder-label');
    if (dl) dl.setAttribute('y', DK_H / 2 + 10);

    const wNodeBand = pathArrow({ points: W_NODE_BAND, dashed: true, dim: true, color: 'storage' });
    const wBandVaA  = pathArrow({ points: W_BAND_VA_A, dashed: true, dim: true, color: 'storage' });
    const wBandVaB  = pathArrow({ points: W_BAND_VA_B, dashed: true, dim: true, color: 'storage' });
    const wVaADisk  = pathArrow({ points: W_VAA_DISK,  dashed: true, dim: true, color: 'storage' });
    const wVaBDisk  = pathArrow({ points: W_VAB_DISK,  dashed: true, dim: true, color: 'storage' });

    const bandLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: BAND_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const modeChip  = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'accessModes', value: 'ReadWriteOnce', cat: 'storage' });
    const attChip   = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'attached to', value: 'node-1',        cat: 'storage' });
    const podChip   = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'new Pod',     value: 'not scheduled', cat: 'storage' });
    const blockChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'blocked by',  value: 'nothing',       cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frames, then the band, the VA row and the disk, then the Pods
    // so they sit above their node frame, then the lanes and their captions above the blocks, then
    // the chip strip, then the packet layer so every ball rides above everything.
    [nodeA, nodeB, ctrl, vaA, vaB, disk, podOld.group, podNew.group].forEach(el => root.appendChild(el));
    [wNodeBand, wBandVaA, wBandVaB, wVaADisk, wVaBDisk].forEach(el => root.appendChild(el));
    root.appendChild(bandLbl);
    [modeChip, attChip, podChip, blockChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      nodeA, nodeB,
      podOld: podOld.group, oldApp: podOld.innerBox,
      podNew: podNew.group, newApp: podNew.innerBox,
      ctrl, vaA, vaB, disk,
      wNodeBand, wBandVaA, wBandVaB, wVaADisk, wVaBDisk,
      modeChip, attChip, podChip, blockChip,
      wires: { band: bandLbl },
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
// card comes to report 'blocked by: force-detach' on the step where the volume is already mounted.
// Each name means exactly one thing: 'attached to' is where the disk is right now, never where it is
// wanted, and 'blocked by' is the reason the new Pod cannot start, never the Pod state itself.
function setChips(s, { mode = 'ReadWriteOnce', attached, newPod, blocked }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.attChip, attached);
  setChip(s.refs.podChip, newPod);
  setChip(s.refs.blockChip, blocked);
}

// One place that pins every mutable opacity and every mutable sublabel, called from every step with
// only the things that step changes. clearHighlights clears classes, not inline styles, so without
// this a step entered out of order would inherit the previous step's opacities: the reduced-motion
// replay path (prev / reset) walks 0..n and would leave the old Pod faded on step 1.
//
// The new Pod no longer has a dim 'booting' state. It used to sit at 0.55 from the moment it was
// scheduled until the very last step and pulse through pulsePodDim, which stacks an opacity swing on
// top of the standard blink: the result read as a faster, busier pulse than the same beat elsewhere
// in the catalog, even though the timing was the identical 900ms. A Pod that exists is drawn at full
// strength and blinks with the ordinary pulsePod. The only opacity a Pod carries on this card now is
// GONE, for the old one after it is deleted, which is the one fade the catalog does sanction.
function setStage(s, {
  nodeBOp = 0,      // node-2 and everything in it: the second claimant does not exist yet
  oldOp = 1, oldSub = 'Running',
  newOp = 0, newSub = 'ContainerCreating',
  vaAOp = 1, vaASub = 'node-1, attached: true',
  vaBOp = 0, vaBSub = 'wanted, blocked',
  linkA = 1,        // the column-a lanes: controller to va-1, and va-1 down to the disk
  linkB = 0,        // the column-b lanes: only drawn once a ball actually rides them
  linkNew = 0,      // the node-2 request lane: hidden until node-2 exists
} = {}) {
  s.refs.nodeB.style.opacity = String(nodeBOp);
  s.refs.podOld.style.opacity = String(oldOp);
  setPodSublabel(s.refs.podOld, oldSub);
  s.refs.podNew.style.opacity = String(newOp);
  setPodSublabel(s.refs.podNew, newSub);
  s.refs.vaA.style.opacity = String(vaAOp);
  setBoxSublabel(s.refs.vaA, vaASub);
  s.refs.vaB.style.opacity = String(vaBOp);
  setBoxSublabel(s.refs.vaB, vaBSub);
  s.refs.wBandVaA.style.opacity = String(linkA);
  s.refs.wVaADisk.style.opacity = String(linkA);
  s.refs.wBandVaB.style.opacity = String(linkB);
  s.refs.wVaBDisk.style.opacity = String(linkB);
  s.refs.wNodeBand.style.opacity = String(linkNew);
}

function clearHL(s) {
  clearHighlights(s, ['ctrl', 'vaA', 'vaB', 'disk', 'oldApp', 'newApp',
    'modeChip', 'attChip', 'podChip', 'blockChip'], [s.refs.podOld, s.refs.podNew]);
}

// Drop a highlight at `delay`, used on blocks that fade out mid-step. A block that is on its way to
// 0.25 must not still be wearing a lit border when it gets there: the highlight says 'this is the
// thing acting right now', and a deleted object is the opposite of that. Pairs with the fade so the
// two land together.
function unlightAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.classList.remove('highlight'); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => el.classList.remove('highlight');
  ctx.register(a);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    // node-2 is absent, not empty. An empty frame sitting there from the first frame says the second
    // node is already part of the picture and merely unused, which is the opposite of the setup: at
    // this point there is one node, one Pod, one attachment, and no contention at all.
    narration: 'PV-web is ReadWriteOnce, so it may be attached to one node at a time and no more. Right now it is attached to node-1, recorded by the VolumeAttachment va-1, and the Pod there reads and writes it quite happily. Nothing about this is a problem until the Pod has to move.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {});
      setChips(s, { attached: 'node-1', newPod: 'not scheduled', blocked: 'nothing' });
    },
  },
  {
    id: 'reschedule',
    duration: 2600,
    // The OLD Pod deliberately stays at full opacity here and through step 4: the entire problem is
    // that the old side is still very much alive and still holding the attachment. Fading it early
    // would say the opposite.
    narration: 'Now the Pod moves. A rolling update stands the replacement up on node-2 while the old one is still running, which is exactly what RollingUpdate is designed to do. node-1 stays healthy throughout. A second Pod now exists on the other node, and it wants the same volume.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The request lane stays OFF here. On this step node-2 has only just been given a Pod and has
      // asked for nothing yet, so an arrow from it into the controller would draw a request one full
      // step before it is made. It arrives on the next step, together with the ball that rides it,
      // which is the catalog rule: a lane appears when it first carries traffic.
      setStage(s, { nodeBOp: 1, newOp: 1 });
      setChips(s, { attached: 'node-1', newPod: 'scheduled on node-2', blocked: 'nothing' });
      if (ctx.reduced) return;
      // The node frame and the Pod arrive together as one event, because that is what scheduling onto
      // a second node looks like: the claimant appears, frame and contents at once.
      s.refs.nodeB.style.opacity = '0';
      s.refs.podNew.style.opacity = '0';
      const rise = el => ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
      rise(s.refs.nodeB);
      rise(s.refs.podNew);
      pulsePod(s.refs.podNew, ctx, 300);
    },
  },
  {
    id: 'wantattach',
    duration: 3200,
    // THE REFUSAL, and the reason this card exists. The idiom (shared with storage-access-modes) is
    // a ball that travels to the deciding block and STOPS there. Nothing continues past the
    // controller, va-2 never lights, and no lane is drawn under va-2 at all: the object is wanted,
    // not wired up. A ball carrying on to va-2 would show the attach succeeding.
    narration: 'The attach and detach controller tries to attach the volume to node-2, which means writing a second VolumeAttachment. The request reaches the controller and stops. PV-web is ReadWriteOnce and the first attachment is still live, so a second cannot be satisfied.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { nodeBOp: 1, newOp: 1, linkNew: 1, vaBOp: 1 });
      setChips(s, { attached: 'node-1', newPod: 'ContainerCreating', blocked: 'va-1 on node-1' });
      setWire(s, 'band', 'RWO: cannot attach twice');
      if (ctx.reduced) { s.refs.ctrl.classList.add('highlight'); return; }
      // The request lane is drawn for the first time on this step, so it eases in rather than popping
      // into place, and it finishes arriving before the ball that rides it departs.
      s.refs.wNodeBand.style.opacity = '0';
      ctx.register(s.refs.wNodeBand.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      // Up-arrow ordering: the Pod blinks first because it is the actor, the request leaves once the
      // blink has landed, and the controller lights when the ball reaches it.
      pulsePod(s.refs.podNew, ctx, 0);
      const req = routePacket(s, ctx, W_NODE_BAND, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'attach node-2', W_NODE_BAND, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.ctrl, ctx, req.arrivalMs);
      // va-2 materializes as the refused request lands: the object gets created, it just never
      // becomes an attachment. It is never lit, because nothing was granted.
      s.refs.vaB.style.opacity = '0';
      ctx.register(s.refs.vaB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: req.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'error',
    duration: 2600,
    // The stuck Pod is the actor, so it pulses and nothing else moves. va-1 lights because it is the
    // blocker: the reader should be looking at the OLD attachment while reading this sentence.
    narration: 'So the new Pod hangs. Its events read Multi-Attach error for volume PV-web, already used by another node. The container never starts, because kubelet will not mount a disk that is not attached to the node it runs on, and the attach is refused.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, { nodeBOp: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: 1 });
      setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'va-1 on node-1' });
      setWire(s, 'band', 'first attachment still live');
      s.refs.vaA.classList.add('highlight');
      if (ctx.reduced) return;
      pulsePod(s.refs.podNew, ctx, 0);
    },
  },
  {
    id: 'wait',
    duration: 2800,
    // Nothing moves on this step, and that is deliberate rather than an oversight: the subject is a
    // deadlock in which neither side does anything at all. The block flash that the canon allows on
    // a packet-less step was tried here on va-1 and removed, because a blinking attachment reads as
    // activity and this is the one step whose whole content is that there is none. The state is
    // carried by the lit va-1, its sublabel and the blocked-by chip.
    //
    // This step used to spend its whole beat on the roughly six minute force-detach for an
    // unreachable node, which is the subject of the detach-on-node-loss card and was told there in
    // nearly the same words. What actually blocks a HEALTHY rollout is the circular wait below, and
    // that belongs to this card alone.
    narration: 'What clears it is the old attachment going away, and nothing else will. The controller will not delete va-1 while the old Pod runs, and the rollout will not delete that Pod until the new one is ready. Each side waits on the other, which is why this reads as a hang.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {
        nodeBOp: 1, newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: 1,
        vaASub: 'node-1, still held',
      });
      // 'old Pod running' rather than 'old Pod still running': the chip strip budget is name + value
      // + 24 inside CHIP_W 232, and the longer string measures about 131 units against a 69 unit
      // name, which leaves 8 units between the two halves and reads as one run-on field.
      setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'old Pod running' });
      setWire(s, 'band', 'each side waits for the other');
      s.refs.vaA.classList.add('highlight');
    },
  },
  {
    id: 'detach',
    duration: 3400,
    narration: 'The rollout breaks the deadlock the only way it can, by deleting the old Pod. The controller removes va-1, the volume detaches, and for a moment it belongs to nobody. On a healthy node this takes seconds, because node-1 can be asked to unmount and it answers.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // Static end state: va-1 and its lanes are gone, the old Pod with them, the disk is free.
      setStage(s, {
        nodeBOp: 1, oldOp: GONE, oldSub: 'deleted',
        newOp: 1, newSub: 'Multi-Attach error', linkNew: 1, vaBOp: 1,
        vaAOp: 0.25, vaASub: 'deleted', linkA: 0.25,
      });
      setChips(s, { attached: 'nothing', newPod: 'Multi-Attach error', blocked: 'nothing' });
      setWire(s, 'band', 'delete va-1, then detach');
      // The controller self-initiates, with no preceding pulse or hop, so it is lit from step entry
      // and the first ball leaves after BEAT.lead: a ball must never depart from an unlit block, or
      // it reads as coming from nowhere. It keeps that highlight to the end of the step, because
      // unlike va-1 it does not go anywhere.
      s.refs.ctrl.classList.add('highlight');
      // The disk is a RECEIVER on this step, so it must not be lit here. Lighting it above the guard
      // put its border on from the first frame, and the detach ball then spent its whole flight
      // travelling towards a block that already looked like it had been reached. Only the reduced
      // path lights it statically, because that path has no ball to arrive: in the animated path
      // lightBoxAt below turns it on at det.arrivalMs. Same rule as storage-volumeattachment.
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      // va-1 lights when the delete reaches it, so it too is lit as the detach departs from it in
      // turn, and gives the highlight up once it has finished fading: a deleted object must not be
      // left wearing the border that means 'acting right now'.
      s.refs.vaA.style.opacity = '1';
      s.refs.wBandVaA.style.opacity = '1';
      s.refs.wVaADisk.style.opacity = '1';
      s.refs.podOld.style.opacity = '1';
      const del = routePacket(s, ctx, W_BAND_VA_A, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'delete va-1', W_BAND_VA_A, { delay: BEAT.lead });
      lightBoxAt(s.refs.vaA, ctx, del.arrivalMs);
      const det = routePacket(s, ctx, W_VAA_DISK, { delay: del.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'detach', W_VAA_DISK, { delay: del.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, det.arrivalMs);
      const fade = (elx, to) => ctx.register(elx.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.out, delay: det.arrivalMs, fill: 'forwards', easing: 'ease-in' }));
      fade(s.refs.vaA, 0.25);
      fade(s.refs.wBandVaA, 0.25);
      fade(s.refs.wVaADisk, 0.25);
      fade(s.refs.podOld, GONE);
      unlightAt(s.refs.vaA, ctx, det.arrivalMs + FADE.out);
    },
  },
  {
    id: 'attach',
    duration: 3800,
    narration: 'With the volume free the controller writes va-2, the driver attaches the disk to node-2, kubelet mounts it, and the new Pod starts. None of that was slow. The whole stall went on waiting for the old Pod to be deleted, not on any storage operation.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {
        nodeBOp: 1, oldOp: GONE, oldSub: 'deleted',
        newOp: 1, newSub: 'Running', linkNew: 1,
        vaAOp: 0.25, vaASub: 'deleted', linkA: 0.25,
        vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
      });
      setChips(s, { attached: 'node-2', newPod: 'Running', blocked: 'nothing' });
      setWire(s, 'band', 'now attach to node-2');
      // Lit from entry for the same reason as the step before: the controller is where the write
      // comes from, so it cannot be dark while a ball is leaving it.
      s.refs.ctrl.classList.add('highlight');
      // va-2 and the disk are both RECEIVERS here, in that order, so neither may be lit at step
      // entry: the write has to reach va-2 before it lights, and the attach has to reach the disk
      // before it does. Statically lit only on the reduced path, which has no balls to wait for.
      if (ctx.reduced) { s.refs.vaB.classList.add('highlight'); s.refs.disk.classList.add('highlight'); return; }
      const wr = routePacket(s, ctx, W_BAND_VA_B, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'write va-2', W_BAND_VA_B, { delay: BEAT.lead });
      lightBoxAt(s.refs.vaB, ctx, wr.arrivalMs);
      const att = routePacket(s, ctx, W_VAB_DISK, { delay: wr.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'attach', W_VAB_DISK, { delay: wr.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, att.arrivalMs);
      // The kubelet mount is not drawn as a hop: it is the subject of the CSI cards, and a lane from
      // the centered disk back up into the right-hand column would cut across the VA row and the
      // controller. What the reader needs here is the consequence, so the Pod blinks one beat after
      // the attach lands.
      pulsePod(s.refs.podNew, ctx, att.arrivalMs + BEAT.afterHop);
    },
  },
  {
    id: 'fix',
    duration: 3400,
    // The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash
    // either. The usual argument for flashing something on a packet-less step (so the frame does not
    // read as frozen) does not apply to the LAST step, which the reader is meant to sit and read.
    narration: 'This is why a Deployment on ReadWriteOnce storage stalls on every rollout. RollingUpdate creates the new Pod before deleting the old one, so both want one single-node volume and the new one is refused. Set it to Recreate, as a StatefulSet already does.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setStage(s, {
        nodeBOp: 1, oldOp: GONE, oldSub: 'deleted',
        newOp: 1, newSub: 'Running', linkNew: 1,
        vaAOp: 0.25, vaASub: 'deleted', linkA: 0.25,
        vaBOp: 1, vaBSub: 'node-2, attached: true', linkB: 1,
      });
      setChips(s, { attached: 'node-2', newPod: 'Running', blocked: 'nothing' });
      setWire(s, 'band', 'Recreate, not RollingUpdate');
      s.refs.vaB.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
