import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// VolumeAttachment (viewBox 1200x640).
//
// The point of the card is WHO owns the attach. Not the Pod, not kubelet: the attach and detach
// controller inside kube-controller-manager writes a VolumeAttachment, the external-attacher watches
// it and calls ControllerPublishVolume, and on success stamps status.attached true back onto the same
// object. Kubelet is blocked on that one field the whole time. Deleting the object is what triggers
// detach. So the composition puts the whole control-plane chain in ONE column and the node in the
// other: every arrow that crosses between them is a read or a write of the object, which is exactly
// the relationship the card is about.
//
// ---- Horizontal composition ----
// The narration overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units
// it eats. Measured right edge / bottom edge for THIS card, worst step, by viewport:
//   1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
//   1100x800  -> 397 / 205     900x650 -> 398 / 344
// So the real worst case is x<=398 and y<=344: a rectangle over the TOP-LEFT quadrant only. A
// narration longer than the ones below invalidates these numbers and they have to be measured again.
//
// That is an L-shaped usable area, and the previous pass read it as a box instead: it pinned the
// diagram to x>=400 AND kept it centred on the canvas, which forced BAND_W to 400 and left the two
// columns 176 wide, squeezed into the middle third of a 1200 unit canvas under a 980 unit chip
// strip. The card looked like it was rationing space it had plenty of. This pass uses the L:
//
//   TOP BAND     y 24..420, x 400..1140. Everything the overlay forbids lives here, and it now runs
//                flush to the right content edge instead of stopping at 800. That buys 340 units,
//                which go into the blocks (176 -> 232 wide) and the corridor between the two columns
//                (48 -> 208), so the card is roomier BOTH inside the boxes and between them.
//   BOTTOM LEFT  x 60..400, y >344. Free, and empty in the previous pass. The disk moves into it.
//   CHIP STRIP   the full content band 60..1140, so the widest tier is also the canvas-centred one.
//
// Moving the disk out from under the columns is not only a space fix. The disk is REMOTE storage that
// has to be attached to a node, and drawing it directly beneath node-1 quietly said it was already
// local to it. Off in its own corner, with a long ControllerPublish call reaching across the whole
// card to get to it, the picture says what the narration says.
//
// ---- Block size ----
// BOX_W / BOX_H are storage-csi-architecture's block size, which is the size the catalog reads as a
// "server" box: its Kube-apiserver, CSI controller driver and Cloud storage API are all SIDE_W 232,
// and its rows run 68 to 76 tall. Matching it is what makes this card sit in the same family rather
// than looking like a different diagram set, and it is a SIZE match only: the spacing between the
// blocks is this card's own and is not touched by it.
//
// It also clears the widest string inside a right-column box comfortably, the sublabel
// 'watches VolumeAttachment'. That is a .scheme-box-sublabel at 10px JetBrains Mono, which measures
// 6.03 viewBox units per character, so the sublabel is 144.7 units and BOX_W 232 leaves 43.6 units
// of air either side of it, against 15.6 before this pass.
//
// The rate is PER CLASS, and mixing them is how this comment was wrong on its first pass. There is
// no single units-per-character for the card: 10px mono sublabels are 6.03, 11px mono chip text and
// dim code labels are 6.89, and 12px Space Grotesk box labels are proportional (6.0 to 6.7 depending
// on the letters). Measure the class you are actually sizing, and await document.fonts.ready first
// or you will measure the fallback monospace, which is about 20 percent narrower than the webfont.
const M = 60;
const CONTENT_L = M, CONTENT_R = 1200 - M;               // 60 / 1140
const CX = (CONTENT_L + CONTENT_R) / 2;                  // 600, the canvas centre by construction

// Every solid block on the card is ONE size, storage-csi-architecture's.
const BOX_W = 232, BOX_H = 76;

// LEFT_X is the overlay wall: 398 measured, 400 taken, and it cannot move left. The node frame hangs
// off it, and the control-plane column is right-ALIGNED to CONTENT_R rather than sized to fill, so
// the top band and the chip strip share a right edge while the blocks stay at BOX_W.
const LEFT_X = 400;
const NODE_W = 300;
const COL_L_X = LEFT_X;                                  // 400..700, the node frame
const COL_L_CX = COL_L_X + NODE_W / 2;                   // 550
const COL_R_X = CONTENT_R - BOX_W;                       // 908..1140, the control-plane column
const COL_R_CX = COL_R_X + BOX_W / 2;                    // 1024
const CORRIDOR_X = (COL_L_X + NODE_W + COL_R_X) / 2;     // 804: the one lane that crosses the columns

// ---- The node column ----
// node-1 is drawn as a real node() frame rather than left implicit, because "this disk is on THAT
// node" is the whole claim the VolumeAttachment makes, and a card about it with no node on screen
// makes the reader supply the most important half. Pod on top, kubelet at the bottom, and the gap
// between them is where the mount lane runs.
//
// The Pod is 226x110, the catalog Pod size (storage-csi-attach-mount uses it for both of its Pods),
// up from 148x118. A Pod is a shell around an inner box, so it is the one block that does not take
// BOX_H. Kubelet takes BOX_H, but its WIDTH follows the Pod rather than BOX_W: the two are stacked
// on the same centre line, so at 232 against 226 their edges missed by 3 units a side, which reads
// as a rendering slip rather than as two different sizes. Six units is invisible between columns and
// glaring within one, so the node column aligns to itself and the control column keeps BOX_W.
const NODE_Y = 24, NODE_H = 396;                         // 24..420
const POD_W = 226, POD_H = 110;
const POD_X = COL_L_CX - POD_W / 2;                      // 437
const POD_Y = 64;
const POD_BOTTOM = POD_Y + POD_H;                        // 174
const POD_PAD = 24, POD_INNER_Y = 40, POD_INNER_H = 46;  // the App box, same insets as attach-mount
const KUBE_W = POD_W, KUBE_H = BOX_H;
const KUBE_X = COL_L_CX - KUBE_W / 2;                    // 437, flush with the Pod above it
const KUBE_Y = 324;
const KUBE_TOP = KUBE_Y, KUBE_BOTTOM = KUBE_Y + KUBE_H;  // 324 / 400, 20 clear of the frame bottom
const KUBE_RIGHT = KUBE_X + KUBE_W;                      // 663
const KUBE_CY = KUBE_Y + KUBE_H / 2;                     // 362

// ---- The control-plane column ----
// Read top to bottom it is the causal order: the controller decides, the object records, the attacher
// acts. Every hop inside this column is therefore a straight vertical run and nothing crosses. Its
// bottom edge is pinned to the node frame's, so the two columns are one band and the lane that
// leaves the attacher for the disk clears BOTH of them at the same height.
//
// All three are BOX_H, and the ROW GAP is solved rather than typed: three equal blocks are spread
// across the node frame's exact vertical span, top edge on its top edge and bottom edge on its
// bottom edge, which leaves 84 units between rows. Nothing here is hand-placed, so changing BOX_H
// or the frame height re-solves the column instead of stranding one row.
const ROWS = 3;
const ROW_GAP = (NODE_H - ROWS * BOX_H) / (ROWS - 1);    // 84
const ROW_Y = i => NODE_Y + i * (BOX_H + ROW_GAP);       // 24 / 184 / 344
const ADC_Y = ROW_Y(0);
const ADC_BOTTOM = ADC_Y + BOX_H;                        // 100
const VA_Y = ROW_Y(1);
const VA_TOP = VA_Y, VA_BOTTOM = VA_Y + BOX_H;           // 184 / 260
const VA_CY = VA_Y + BOX_H / 2;                          // 222
const ATT_Y = ROW_Y(2);
const ATT_TOP = ATT_Y, ATT_BOTTOM = ATT_Y + BOX_H;       // 420, level with the node frame bottom

// ---- The disk, bottom left ----
// Sits in the quadrant the overlay leaves free (x<400 needs y>344). DISK_Y 400 clears that by 56, and
// the caption above it at 386 clears it by 42. It is 200x114 rather than 152x96: it is now the only
// object on its side of the card, so it carries that side on its own.
const DISK_W = 200, DISK_H = 114;
const DISK_X = 130;
const DISK_Y = 400;
const DISK_TOP = DISK_Y, DISK_BOTTOM = DISK_Y + DISK_H;  // 400 / 514
const DISK_CX = DISK_X + DISK_W / 2;                     // 230
const DISK_RIGHT = DISK_X + DISK_W;                      // 330
const DISK_CY = DISK_Y + DISK_H / 2;                     // 457
// The caption goes ABOVE the disk, not below it. Below is where the ControllerPublish lane runs, and
// under that is the chip strip: there is no room for a text line between them that is not sitting on
// one or the other. Above, the whole strip from the overlay floor to the disk cap is empty.
const DISK_LBL_Y = DISK_TOP - 14;                        // 386

// ONE width for all four chips, and the strip spans exactly the DIAGRAM, not the content band.
// Those are not the same span on this card and that is the whole point: the blocks run from the
// disk's left edge to the control column's right edge, while the content band starts 70 units
// further left at the page margin. Hanging the strip off the margin left it poking out under the
// empty bottom-left corner on one side and sitting flush on the other, which read as a strip that
// had slipped rather than as a deliberate full-width tier. Both edges are real block edges now, so
// the strip cannot drift if either column moves.
//
// valChip anchors the name 12 from the left and the value 12 from the right, so a chip needs
// name + value + 24 plus a readable gap. Measured worst cases, in viewBox units. Chip text is
// .scheme-chip-text at 11px JetBrains Mono, which measures 6.89 per character (monospace, so the
// rate has zero variance):
//   status.attached  103.4 + 'no object' 62.0 + 24 inset = 189.4   <- the binding one
//   VolumeAttachment 110.3 + 'deleted'   48.2 + 24 inset = 182.5
//   disk on node-1    96.5 + 'yes'       20.7 + 24 inset = 141.2
//   kubelet           48.2 + 'released'  55.1 + 24 inset = 127.3
// Narrowing the strip narrows the chips, so this is the number that had to be re-checked: CHIP_W
// falls out at 240.5, which still clears the binding pair with 51 units between name and value. It
// is the floor that matters, not the exact value: below ~190 the longest name and value would touch.
const CHIPS_Y = 592, CHIP_H = 34;                        // 592..626, 14 clear of the viewBox
const CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_L = DISK_X, CHIPS_R = CONTENT_R;             // 130 / 1140, the diagram's own extent
const CHIPS_W = CHIPS_R - CHIPS_L;                                      // 1010
const CHIP_W = (CHIPS_W - CHIP_GAP * (CHIP_COUNT - 1)) / CHIP_COUNT;    // 240.5
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CHIPS_L + i * (CHIP_W + CHIP_GAP));                    // 130 / 386.5 / 643 / 899.5, last ends 1140

// Each direction of the VolumeAttachment conversation gets its OWN lane, offset LANE around the
// column centre, so the status write never rides the arrow the watch came down. Every array below is
// shared by the static pathArrow and the ball that rides it, so the wire and the packet cannot drift.
// The wider column lets LANE grow 26 -> 40, which is what makes the watch and the status write read
// as two lanes at a glance rather than as one thick one.
const LANE = 40;
const W_WRITE   = [[COL_R_CX, ADC_BOTTOM], [COL_R_CX, VA_TOP]];              // controller creates it
const W_WATCH   = [[COL_R_CX - LANE, VA_BOTTOM], [COL_R_CX - LANE, ATT_TOP]];// attacher reads it
const W_STATUS  = [[COL_R_CX + LANE, ATT_TOP], [COL_R_CX + LANE, VA_BOTTOM]];// attacher writes back
// The publish call runs the whole width of the card, which is the point: the attacher is talking to a
// storage backend that is nowhere near the node. Its horizontal leg is hung BELOW the disk rather
// than above it, because above it there is no room: the disk cap is at 400 and both columns end at
// 420, so a lane between them would be drawn through the node frame. A ridingLabel sits 14 above its
// ball, so 'ControllerUnpublish' rides at 532 on this leg, 18 clear of the disk face and 60 clear of
// the chip strip. Derived from DISK_BOTTOM, so the lane follows the disk if the disk moves.
const PUBLISH_JOG_Y = DISK_BOTTOM + 32;                  // 546
const W_PUBLISH = [[COL_R_CX, ATT_BOTTOM], [COL_R_CX, PUBLISH_JOG_Y], [DISK_CX, PUBLISH_JOG_Y], [DISK_CX, DISK_BOTTOM]];
// The result surfacing on the node leaves the disk's right face and climbs into kubelet from below,
// so the two lanes touching the disk use different faces and their riding tags never share a strip.
const W_ONNODE  = [[DISK_RIGHT, DISK_CY], [COL_L_CX, DISK_CY], [COL_L_CX, KUBE_BOTTOM]];
// The only lane that crosses the corridor: the object gating the node. It leaves the VolumeAttachment
// at its vertical middle, runs down the corridor at CORRIDOR_X, and enters kubelet from the right,
// while W_ONNODE enters from below. Nothing else uses the corridor, so this route crosses no other
// wire anywhere on the card, and neither does any other lane: the card has zero wire crossings.
const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [KUBE_RIGHT, KUBE_CY]];
const W_MOUNT   = [[COL_L_CX, KUBE_TOP], [COL_L_CX, POD_BOTTOM]];

// The disk stays on canvas after the detach because it still exists in the backend, it is just no
// longer on this node, so it dims rather than leaving. That is a STATE, not a placeholder, which is
// why it is the one dim left on this card: the Pod used to sit at 0.5 for five of the seven steps as a
// stand-in for "not started yet", and a block held at half strength next to full-strength neighbours
// reads as a rendering fault rather than as a state. The Pod is now simply present, and it leaves the
// canvas entirely on the step where the narration says it is gone.
const DISK_DIM = 0.3;
// The same dim, for the same reason, on the VolumeAttachment box: on the steps where the object does
// not exist (before the controller writes it, and after it is deleted) the box stays drawn as a slot
// rather than vanishing. At full strength it would contradict the narration, and at zero it left a
// block-sized hole in the middle of the control column. Dim is the third answer: the reader sees
// where the object goes, reads 'not created yet' under it, and watches it come up to full on write.
const VA_PLACEHOLDER = 0.45;
// How long a born-mid-story construction takes to materialise, and how long it takes to leave. It runs
// before the ball is sent (BEAT.lead is 800), so nothing is ever aimed at a block that is not there.
const LAND_MS = 500;

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// The mirror of lightBoxAt for everything that arrives or leaves rather than lighting: a construction
// materialising, the Pod going away, the disk coming off the node. Under ctx.reduced it snaps to `to`,
// which is what keeps a prev/reset replay landing on the correct static state.
function fadeTo(el, ctx, from, to, delay = 0, dur = LAND_MS) {
  if (!el) return;
  if (ctx.reduced) { el.style.opacity = String(to); return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: to }], { duration: dur, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball here is a
// routePacket, which is eased, so the default ease-in-out matches and the tag stays glued to it. Pass
// a `dur` here only if the ball it rides was given the same explicit `dur`, or the two desync.
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

// PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the App box inside it both
// live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for exactly
// as long as its ball is in flight, and nothing is left lit afterwards: no .highlight is ever put on
// the App box. The wrapping g is not optional. pulsePod finds its targets with querySelectorAll,
// which matches descendants only and never the element itself, so pulsing a bare pod() would catch
// its .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength
// (the anim-dump symptom is strokeOpacity rows with no filter row).
function podBlock() {
  const shell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod web-0', sublabel: 'needs vol-1', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + POD_PAD, y: POD_Y + POD_INNER_Y, w: POD_W - POD_PAD * 2, h: POD_INNER_H, label: 'App', sublabel: 'wants /data', cat: 'storage' });
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
      'aria-label': 'The VolumeAttachment object. The attach and detach controller inside kube-controller-manager, not kubelet, decides a volume must be attached to a node and writes a VolumeAttachment naming the volume and the node with status.attached false. The external-attacher watches those objects, calls ControllerPublishVolume on the driver, and on success writes status.attached true back onto the same object. Kubelet is blocked on that one field and mounts only once it reads true. Because the object, not the Pod, is the cluster record of the attach, deleting it is what triggers ControllerUnpublishVolume and the detach.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // Block LABELS are title-capitalized: every word of the name takes a capital, except that a
    // HYPHENATED name capitalizes only its first segment, since it is one identifier rather than a
    // phrase (External-attacher is the name of one binary). Bare identifiers keep their real casing:
    // va-7f, web-0, vol-1, and node-1, which .scheme-node-label uppercases to NODE-1 in CSS. That
    // uppercase form is catalog-wide and every node frame in every card carries it, so it is left
    // alone here: a card-local override would make this the one node that is titled differently.
    // Sublabels and narration stay lowercase prose, so kubelet is Kubelet on the box and kubelet in
    // a sentence.
    const nodeBox = node({ x: COL_L_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' });
    const appPod = podBlock();
    const kube = box({ x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'gated on attach', cat: 'storage' });

    const adc = box({ x: COL_R_X, y: ADC_Y, w: BOX_W, h: BOX_H, label: 'Attach/Detach Controller', sublabel: 'kube-controller-manager', cat: 'storage' });
    const va  = box({ x: COL_R_X, y: VA_Y,  w: BOX_W, h: BOX_H, label: 'VolumeAttachment va-7f', sublabel: 'not created yet', cat: 'storage' });
    const att = box({ x: COL_R_X, y: ATT_Y, w: BOX_W, h: BOX_H, label: 'External-attacher', sublabel: 'watches VolumeAttachment', cat: 'storage' });

    const disk = cylinder({ x: DISK_X, y: DISK_Y, w: DISK_W, h: DISK_H, label: 'vol-1', cat: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is
    // not part of the visible front face. Re-centre on the face, as storage-volume-model does. Derived
    // from DISK_H rather than typed as a literal 58, so it follows the disk if the disk is resized.
    const diskLabel = disk.querySelector('.scheme-cylinder-label');
    if (diskLabel) diskLabel.setAttribute('y', DISK_H / 2 + 10);

    const mkWire = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });
    // The four lanes that BELONG TO the VolumeAttachment: written by the controller, read by the
    // attacher, written back by the attacher, and read by kubelet. They live and die with the object
    // (see setBorn), because a lane into an object that does not exist is a lane to nowhere.
    const wWrite = mkWire(W_WRITE), wWatch = mkWire(W_WATCH);
    const wStatus = mkWire(W_STATUS), wGate = mkWire(W_GATE);
    // Lanes between blocks that stand for the whole card, so they are always drawn.
    const wPublish = mkWire(W_PUBLISH), wOnNode = mkWire(W_ONNODE);
    // The mount lane is the exception: it is the lane INTO the Pod, so it belongs to the Pod and is
    // pinned by the same flag (see setBorn). When the Pod leaves on the detach step the arrow that
    // fed it has nothing left to point at, and an arrowhead aimed at empty canvas reads as traffic
    // to a block the reader has simply failed to spot.
    const wMount = mkWire(W_MOUNT);
    const vaLanes = [wWrite, wWatch, wStatus, wGate];
    const wires = [...vaLanes, wPublish, wOnNode, wMount];

    // BORN MID-STORY, but the SLOT is drawn the whole time. The VolumeAttachment does not exist until
    // the controller writes it on step 3, and the whole card turns on that, so the object cannot be at
    // full strength in the opening frame while the narration says "no such object exists". Removing it
    // outright is worse though: it leaves a block-sized hole in the middle of the control column, which
    // reads as a rendering fault rather than as an absence. So the box is drawn at VA_PLACEHOLDER, the
    // same dim the disk uses for "exists but not here", with the sublabel saying 'not created yet'.
    //
    // Its four LANES are the part that genuinely goes away: an arrow into an object that does not
    // exist is an arrow to nowhere, and unlike the box it leaves no hole when it is gone. So the two
    // are pinned separately, and the write step brings them up together.
    va.style.opacity = String(VA_PLACEHOLDER);
    vaLanes.forEach(el => { el.style.opacity = '0'; });

    // Only two static wire captions, and both sit where there is measured room for them. The write
    // caption is anchored 12 right of the W_WRITE lane, in the gap between the controller and the
    // object, so it has 1140 - 1002 = 138 units, 20 characters at 6.89. The disk caption is centred
    // on the disk in the empty strip above it: its longest string is 35 characters, 241 units, which
    // centred on DISK_CX spans 110..350 and so clears both the left margin and the node frame.
    // Everything else the traffic needs to say is carried by a ridingLabel instead: the inter-row gaps
    // in the control column cannot hold a static caption without it landing on a lane arrowhead.
    const writeLbl = text({ class: 'scheme-label code dim', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, 'text-anchor': 'start' }, [' ']);
    const diskLbl  = text({ class: 'scheme-label code dim', x: DISK_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const vaChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'VolumeAttachment', value: 'none',      cat: 'storage' });
    const attrChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'status.attached', value: 'no object', cat: 'storage' });
    const diskChip = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk on node-1',  value: 'no',        cat: 'storage' });
    const kubeChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'kubelet',         value: 'blocked',   cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frame, then the control-plane boxes and the disk, then the
    // Pod and kubelet so they sit above their node, then the lanes and their captions above the
    // blocks, then the chip strip, then the packet layer so every ball rides above everything.
    [nodeBox, adc, va, att, disk, appPod.group, kube].forEach(el => root.appendChild(el));
    wires.forEach(el => root.appendChild(el));
    [writeLbl, diskLbl].forEach(el => root.appendChild(el));
    [vaChip, attrChip, diskChip, kubeChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      appPod: appPod.group, appBox: appPod.innerBox,
      kube, adc, va, att, disk, vaLanes, mountLane: wMount,
      vaChip, attrChip, diskChip, kubeChip,
      wires: { write: writeLbl, disk: diskLbl },
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
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which on a card
// whose whole subject is one object changing state is the fastest way to tell the reader a lie: the
// strip has to be readable as the object's current record on any step you pause on.
function setChips(s, { va, attached, disk, kubelet }) {
  setChip(s.refs.vaChip, va);
  setChip(s.refs.attrChip, attached);
  setChip(s.refs.diskChip, disk);
  setChip(s.refs.kubeChip, kubelet);
}

// Every step pins the visibility of everything born mid-story, exactly as setChips pins every chip, so
// a step can never silently inherit a block or a lane from the one before it. The object and its four
// lanes share ONE flag because they are one construction, and the Pod carries its own because it is
// present from the first frame and leaves on the last.
function setBorn(s, { object = VA_PLACEHOLDER, lanes = 0, pod = 1 } = {}) {
  s.refs.va.style.opacity = String(object);
  s.refs.vaLanes.forEach(w => { w.style.opacity = String(lanes); });
  s.refs.appPod.style.opacity = String(pod);
  s.refs.mountLane.style.opacity = String(pod);
}

function clearHL(s) {
  clearHighlights(s, ['adc', 'va', 'att', 'kube', 'disk', 'appBox',
    'vaChip', 'attrChip', 'diskChip', 'kubeChip'], [s.refs.appPod]);
  s.refs.disk.style.opacity = '1';
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Pod web-0 is scheduled onto node-1 and needs the disk vol-1. Before kubelet can mount anything the disk has to be attached to that node, and Kubernetes keeps that fact in an object of its own. Right now no such object exists, so kubelet is going nowhere.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', attached: 'no object', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      setWire(s, 'disk', 'not attached to any node');
      // The Pod is scheduled and waiting, which the narration states outright, so it is present at
      // full strength. Only the object is missing, and it is genuinely absent rather than greyed out.
      setBorn(s, { object: VA_PLACEHOLDER, lanes: 0, pod: 1 });
    },
  },
  {
    id: 'decide',
    duration: 2200,
    // NO pulse here, and that is deliberate. The Pod used to blink on this step, on the grounds that
    // it is the reason an attach is needed. But this is the step the poster auto-plays into, about a
    // second after the card opens, so the blink landed on a frame the reader had only just started
    // looking at and read as a flicker in the render rather than as a beat. The step is also not
    // ABOUT the Pod: the narration is about who owns the decision, and the owner is the controller.
    // So it is now a packet-less, pod-less step where the subject registers by lighting and staying
    // lit, exactly as storage-csi-architecture's 'core' and 'controller' steps do. No block flash
    // either, for the same reason that card gives: a set of boxes to be read, not a beat to notice.
    narration: 'It is not kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a node with a volume that is not attached there, and takes ownership of making it happen.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'none', attached: 'no object', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'not created yet');
      setWire(s, 'disk', 'not attached to any node');
      setBorn(s, { object: VA_PLACEHOLDER, lanes: 0, pod: 1 });
      s.refs.adc.classList.add('highlight');
    },
  },
  {
    id: 'write',
    duration: 2600,
    narration: 'The controller writes a VolumeAttachment. It names the volume and the node, and it starts with status.attached set to false. This object is now the single cluster record that vol-1 is meant to live on node-1. Nothing physical has happened yet.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'false', disk: 'no', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: false');
      setWire(s, 'write', 'create');
      setWire(s, 'disk', 'not attached to any node');
      // The object exists by the END of this step, so visible is the static end-state.
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.adc.classList.add('highlight');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      // The object and all four of its lanes materialise as ONE construction, and finish before the
      // write is sent (LAND_MS 500 against BEAT.lead 800), so no arrowhead is ever aimed at nothing.
      fadeTo(s.refs.va, ctx, VA_PLACEHOLDER, 1);
      s.refs.vaLanes.forEach(w => fadeTo(w, ctx, 0, 1));
      const w = routePacket(s, ctx, W_WRITE, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'vol-1 on node-1', W_WRITE, { delay: BEAT.lead });
      lightBoxAt(s.refs.va, ctx, w.arrivalMs);
    },
  },
  {
    id: 'attach',
    // Three chained hops, and the middle one now crosses the whole card: routeDur is length-based, so
    // the 952-unit publish call runs 2116ms on its own and anim-dump puts the step span at 4276 (the
    // last hop lands at 3716, and its ripple and fade-out run on past that). The duration went
    // 3400 -> 4800 with the layout, not as a taste change: below 4276 the auto-advance cuts the call
    // off before it reaches the disk. 4800 keeps 524ms of headroom.
    duration: 4800,
    narration: 'The external-attacher watches VolumeAttachment objects. It picks this one up, calls ControllerPublishVolume on the driver, and the driver asks the storage backend to attach vol-1 to node-1. The device is physically on the node now, and kubelet still will not touch it, because the object still says false.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The chip strip is the whole point of this step: the disk IS on node-1 and status.attached is
      // STILL false. Reading those two chips side by side is the card in one line.
      setChips(s, { va: 'va-7f', attached: 'false', disk: 'yes', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: false');
      setWire(s, 'disk', 'attached to node-1');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.va.classList.add('highlight');
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); s.refs.disk.classList.add('highlight'); s.refs.kube.classList.add('highlight'); return; }
      // Three chained hops, each leaving BEAT.afterHop after the previous one lands: the attacher
      // reads the object, calls the driver, and the disk surfaces on node-1. No Pod is involved in
      // any of them, so nothing pulses, the blocks light on arrival.
      const watch = routePacket(s, ctx, W_WATCH, { cat: 'storage' });
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      const call = routePacket(s, ctx, W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerPublish', W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.disk, ctx, call.arrivalMs);
      const land = routePacket(s, ctx, W_ONNODE, { delay: call.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'vol-1 on node-1', W_ONNODE, { delay: call.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.kube, ctx, land.arrivalMs);
    },
  },
  {
    id: 'status',
    duration: 2600,
    narration: 'When the backend confirms the attach, the attacher writes status.attached true back onto the same VolumeAttachment. That one field is the signal everything downstream waits for. The object did not move and nothing was recreated, one field changed.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'true', disk: 'yes', kubelet: 'blocked' });
      setBoxSublabel(s.refs.va, 'node-1, attached: true');
      setWire(s, 'disk', 'attached to node-1');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.att.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) { s.refs.va.classList.add('highlight'); return; }
      // The status write goes up its OWN lane, offset LANE the other side of the column centre from
      // the watch it answers, so it never reads as the watch bouncing back.
      const st = routePacket(s, ctx, W_STATUS, { cat: 'storage' });
      ridingLabel(s, ctx, 'attached: true', W_STATUS);
      lightBoxAt(s.refs.va, ctx, st.arrivalMs);
    },
  },
  {
    id: 'mount',
    duration: 3200,
    narration: 'Kubelet has been blocked this whole time, watching that one field. The moment status.attached reads true it stops waiting, mounts the disk into the Pod at /data, and the Pod starts. The VolumeAttachment gated the mount.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'va-7f', attached: 'true', disk: 'yes', kubelet: 'mounted' });
      setBoxSublabel(s.refs.va, 'node-1, attached: true');
      setWire(s, 'disk', 'attached to node-1, mounted at /data');
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.va.classList.add('highlight');
      s.refs.disk.classList.add('highlight');
      s.refs.kube.classList.add('highlight');
      if (ctx.reduced) return;
      const gate = routePacket(s, ctx, W_GATE, { cat: 'storage' });
      ridingLabel(s, ctx, 'attached: true', W_GATE);
      lightBoxAt(s.refs.kube, ctx, gate.arrivalMs);
      // Infra reaching a Pod, so it takes the down-arrow ordering: the ball flies first and the Pod
      // blinks on its arrival. The Pod is already at full strength, so the mount landing is signalled
      // by the pulse alone rather than by an opacity ramp out of a dim placeholder. The App box inside
      // is never given a .highlight, here or at step entry: the blink is the whole signal and it has
      // to end when the ball does.
      const mount = routePacket(s, ctx, W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop });
      pulsePod(s.refs.appPod, ctx, mount.arrivalMs);
    },
  },
  {
    id: 'detach',
    // Four beats (Pod leaves, attacher reads the deletion, object leaves with its lanes, disk comes
    // off), and the unpublish call is the same full-width route as the attach step, so anim-dump puts
    // the span at 4276 against 2860 before the layout change. 4600 keeps 324ms of headroom.
    duration: 4600,
    narration: 'Because the object is the record, deleting it is what tears the attach down. Once the Pod is gone the controller removes the VolumeAttachment, the attacher sees it disappear, calls ControllerUnpublishVolume, and the backend detaches vol-1 from node-1. No object, no attach.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { va: 'deleted', attached: 'gone', disk: 'no', kubelet: 'released' });
      setBoxSublabel(s.refs.va, 'deleted, detach follows');
      setWire(s, 'disk', 'detached from node-1');
      // The end-state of the card is the mirror of its opening frame: no Pod, no object, no lanes into
      // the object, and the disk off the node. Pinned statically here so a reduced replay or a cancel
      // mid-step lands on the torn-down state rather than the lit one.
      setBorn(s, { object: VA_PLACEHOLDER, lanes: 0, pod: 0 });
      s.refs.disk.style.opacity = String(DISK_DIM);
      if (ctx.reduced) { s.refs.att.classList.add('highlight'); return; }
      // Played in the causal order the narration gives. The Pod goes first, which is what frees the
      // volume. Then the attacher reads the deletion, and the object leaves WITH its four lanes, the
      // same construction that arrived together on step 3. Then the unpublish call reaches the disk.
      setBorn(s, { object: 1, lanes: 1, pod: 1 });
      s.refs.disk.style.opacity = '1';
      s.refs.va.classList.add('highlight');
      fadeTo(s.refs.appPod, ctx, 1, 0);
      fadeTo(s.refs.mountLane, ctx, 1, 0);
      const watch = routePacket(s, ctx, W_WATCH, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'va-7f deleted', W_WATCH, { delay: BEAT.lead });
      lightBoxAt(s.refs.att, ctx, watch.arrivalMs);
      fadeTo(s.refs.va, ctx, 1, VA_PLACEHOLDER, watch.arrivalMs);
      s.refs.vaLanes.forEach(w => fadeTo(w, ctx, 1, 0, watch.arrivalMs));
      const call = routePacket(s, ctx, W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'ControllerUnpublish', W_PUBLISH, { delay: watch.arrivalMs + BEAT.afterHop });
      fadeTo(s.refs.disk, ctx, 1, DISK_DIM, call.arrivalMs, 400);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
