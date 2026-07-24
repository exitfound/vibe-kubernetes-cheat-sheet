import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, node, cylinder, pathArrow, chainList, setChainActive, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setPodSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// Detach on Node Failure (viewBox 1200x640). A node goes NotReady and its kubelet falls silent. The
// old Pod cannot be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet:
// detaching while the old Pod might still be writing means two nodes writing one filesystem. The
// stall is a chain of timeouts, walked one rung at a time on the ladder, and the out-of-service
// taint is the operator escape hatch that asserts the node is dead and skips the whole chain.
//
// ---- What this card owns, against storage-multi-attach-error ----
// Both cards end with one RWO disk moving from one node to another, so the boundary has to be held
// deliberately or the pair reads as one card shown twice (it did, until this pass). The difference
// is not the outcome, it is what is being waited on. There, node-1 is HEALTHY and the volume is
// legitimately held by a Pod that is legitimately still running: an ordering problem, fixed by
// ordering (Recreate). Here nothing is contending for the volume at all. The wait is on DOUBT,
// because a silent kubelet cannot confirm its Pod stopped writing. So this card owns the
// pod-eviction and force-detach clocks, the roughly six minutes, the argument that two writers
// corrupt one filesystem, and the out-of-service taint. None of those appear on the other card.
//
// ---- Layout ----
// Storage grammar is a vertical stack, and this card runs TWO of them side by side, because the
// whole story is one disk moving between two nodes. node-1 and node-2 are equal columns, the shared
// RWO disk sits on the shelf between and below them, and the timeout ladder plus the escape hatch
// form one band across the bottom. The two columns are deliberately IDENTICAL in width: the only
// thing that differs between them is which one is answering, so anything else that differed would
// read as a difference the card is not about.
//
// ---- Horizontal composition ----
// Every tier shares ONE center, CONTENT_CX, rather than hand-typed margins. LEFT_X is pinned by the
// narration overlay, which is HTML laid over the SVG, so the NARROWER the window the MORE viewBox
// units it eats. Measured right edge / bottom edge for THIS card, worst step (the escape step, which
// carries the longest narration), by viewport:
//   1920x1080 -> 203 / 161    1440x900 -> 319 / 203    1280x800 -> 358 / 236
//   1100x800  -> 397 / 255     900x650 -> 398 / 436
// So the real worst case is x<=398 and y<=436. LEFT_X 400 has about 2 units of slack and cannot move
// left at all, and BAND_Y 448 clears the 436 bottom by 12. Do not re-derive either from a single
// wide-window screenshot, and note that a narration longer than the ones below invalidates both.
//
// CONTENT_CX = LEFT_X + (2*NODE_W + NODE_GAP)/2, and LEFT_X cannot move, so the node tier width is
// the ONLY lever on where the diagram sits. It is solved for, not chosen: 2*188 + 24 = 400 puts
// CONTENT_CX exactly on 600, the canvas center. NODE_W then sets POD_W (NODE_W - 2*NODE_PAD = 168),
// and the floor under POD_W is the widest string inside a Pod: the sublabel 'marked for deletion',
// which is a .scheme-pod-sublabel at 10px JetBrains Mono. That class measures 6.03 viewBox units per
// character (measured with document.fonts.ready awaited, or you get the fallback monospace, which is
// about 20 percent narrower and will flatter you), so the sublabel is 114.6 units and POD_W 152
// keeps ~19 units of air either side. Note the rate is per class: 11px chip text and dim code
// labels are 6.89, and 12px box labels are Space Grotesk and proportional, so they vary by string.
//
// That exactness matters because of the bottom band. The node tier is 400 wide and is symmetric
// about CONTENT_CX wherever it sits, so on its own it would look fine anywhere. The chip strip does
// not: at 662 units it is more than half again the width of the node tier, so it is the tier that
// actually sets the visual center of the card. The previous layout ran the nodes at 430..1140 and
// the chips at 430..1142, which put the whole card 186 units right of the canvas center with a dead
// left third. Pulling everything onto 600 makes the strip 269..931 and both readings agree.
//
// The ladder and the escape box share the chip strip's outer edges (LAD_X == CHIP_X[0] and the
// escape box right edge == the strip right edge) so the bottom band reads as one block rather than
// three floating objects.
const LEFT_X = 400;

// The node frames are as wide as the tier allows (192) with a tight 16 gap, so the pair reads as two
// substantial machines rather than two thin columns, while 2*192 + 16 still sums to 400 and keeps
// CONTENT_CX on the canvas centre. They are also shorter (160): the Pod inside was too tall against
// the rest of the storage family, so it drops to the family two-column size (104 tall, App box 44)
// and the frame shrinks to hug it, which also makes the frame read as wider. The disk below is 190
// wide, wider than the 16 gap, so it still bridges both columns as one shared volume.
const NODE_Y = 48, NODE_H = 160;
const NODE_W = 192, NODE_GAP = 16, NODE_PAD = 12;
const A_X = LEFT_X;                                      // node-1 frame
const B_X = A_X + NODE_W + NODE_GAP;                     // 608, node-2 frame
const CONTENT_CX = A_X + (NODE_W * 2 + NODE_GAP) / 2;    // 600: canvas center, every tier uses it
const NODE_BOTTOM = NODE_Y + NODE_H;                     // 208, where the attach lanes terminate

const POD_Y = 76, POD_W = NODE_W - NODE_PAD * 2, POD_H = 104;   // 168 wide, family two-column height
const POD_BOTTOM = POD_Y + POD_H;                        // 180
const A_CX = A_X + NODE_W / 2;                           // 496, node-1 centre
const B_CX = B_X + NODE_W / 2;                           // 704, and (496 + 704) / 2 == CONTENT_CX

// One disk, centered on the spine, deliberately wider than the corridor between the columns so it
// reads as shared by both rather than as belonging to the gap.
const DK_W = 190, DK_H = 104, DK_Y = 282;
const DK_X = CONTENT_CX - DK_W / 2;                      // 505
const DK_TOP = DK_Y;                                     // 282
const DK_LBL_Y = 410;

// Bottom band. CHIP_W is one width for all three chips rather than three hand-picked ones. valChip
// anchors the name 12 from the left and the value 12 from the right, so a chip needs
// name + value + 24 plus a readable gap. Rendered worst cases, measured in the browser rather than
// estimated from a per-character rate (the rate under-reads on strings full of wide glyphs):
//   node-1   41 + 'NotReady, tainted'  117 = 158
//   volume   41 + 'attached to node-1' 124 = 165
//   new Pod  48 + 'ContainerCreating'  117 = 165
// So 210 clears the worst pair with 21 units between name and value, which is the floor for the two
// halves still reading as separate fields.
const CHIP_W = 210, CHIP_GAP = 16, CHIP_COUNT = 3, CHIP_H = 32;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 662
const BAND_LEFT = CONTENT_CX - CHIPS_W / 2;              // 269
const BAND_RIGHT = CONTENT_CX + CHIPS_W / 2;             // 931
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) => BAND_LEFT + i * (CHIP_W + CHIP_GAP));
const CHIPS_Y = 598;

// The ladder rows carry the longest strings on the card, and they are the one place a per-character
// estimate is not good enough: the rungs are full of wide glyphs (the separator, the tilde, the
// digits), so the longest rung renders 338 units where 6.0 units per character predicts 307. Measure
// them. chainList insets its text 10 from the row edge, so LAD_W 380 leaves 32 units of margin on
// the worst rung. At the old 350 that rung cleared the row border by 2 units and read as text
// jammed against the frame.
const LAD_X = BAND_LEFT, LAD_Y = 448, LAD_W = 380, LAD_ROW = 38, LAD_GAP = 9;
const LAD_BOTTOM = LAD_Y + LAD_ROW * 3 + LAD_GAP * 2;    // 580
// ESC_W shrinks to 230 to buy the ladder that extra width back: the widest string inside the box is
// the sublabel at 175 units, so 230 still leaves ~27 either side, and the gap between the ladder
// right edge (649) and the box left edge (701) stays at 52.
const ESC_W = 230, ESC_H = 72;
const ESC_X = BAND_RIGHT - ESC_W;                        // 701
const ESC_Y = LAD_Y + (LAD_BOTTOM - LAD_Y - ESC_H) / 2;  // 478, vertically centered on the ladder
const ESC_CX = ESC_X + ESC_W / 2;                        // 816
const ESC_TOP = ESC_Y;

// A Pod that EXISTS is drawn at full strength and blinks with the ordinary pulsePod, exactly as the
// rest of the storage family does (see storage-multi-attach-error): a dim 'unknown' state pulsed with
// pulsePodDim stacks an opacity swing on top of the blink and reads as a faster, busier pulse than the
// same beat elsewhere in the catalog. The old Pod being unconfirmed is carried by its sublabel and its
// chip, not by a faded opacity. The only opacity a Pod takes here is GONE, once it is assumed dead or
// deleted, and a GONE Pod never pulses. GONE is the catalog value for gone/unhealthy.
const GONE = 0.35;     // OPACITY.dim

// Each attach lane leaves the disk top LANE either side of the spine and rises to the BOTTOM EDGE of
// its node frame, at the frame's exact horizontal centre (A_CX / B_CX), so the two are exact mirrors
// about CONTENT_CX and every endpoint is a face midpoint. The lanes stop at NODE_BOTTOM rather than
// running on up into the Pod: the disk attaches to a NODE, and the Pod is what runs once the node has
// the volume, not the thing the attachment terminates on. CORRIDOR_Y is the clear strip between the
// node frames (bottom 238) and the disk (top 282). Every array below is shared by the static wire and
// the ball that rides it, so the two cannot drift apart.
const LANE = 22, CORRIDOR_Y = 260;
const W_ATTACH_A = [[CONTENT_CX - LANE, DK_TOP], [CONTENT_CX - LANE, CORRIDOR_Y], [A_CX, CORRIDOR_Y], [A_CX, NODE_BOTTOM]];
const W_ATTACH_B = [[CONTENT_CX + LANE, DK_TOP], [CONTENT_CX + LANE, CORRIDOR_Y], [B_CX, CORRIDOR_Y], [B_CX, NODE_BOTTOM]];
// The taint lane rises out of the top of the escape box and turns LEFT into the right flank of the
// disk, at the disk's vertical midpoint. It deliberately does not approach the disk from underneath:
// that route has to cross y 410, where the disk caption sits centered on the spine, and a caption up
// to 20 characters wide reaches x 663, so the lane would draw a dashed line straight through the
// last word of its own label. Coming in side-on also keeps the whole lane clear of the ladder, which
// ends at x 649, and of the node frames, which bottom out at y 238 and end at x 800, 16 units left
// of the lane.
const DK_RIGHT = DK_X + DK_W, DK_MID_Y = DK_Y + DK_H / 2;   // 695 / 334
const W_TAINT = [[ESC_CX, ESC_TOP], [ESC_CX, DK_MID_Y], [DK_RIGHT, DK_MID_Y]];

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Both balls on this
// card are routePackets, which are eased, so the default ease-in-out matches and the tag stays
// glued to the ball instead of drifting off it between the endpoints and the midpoint.
//
// `dy` exists so a tag can be nudged off the ball where a default -14 would collide with fixed text.
// The attach lane now ends at the node frame bottom, below the Pod, so its tag rides the default 14
// above the ball and comes to rest in the clear strip inside the node between the Pod bottom and the
// frame bottom, clear of the Pod sublabel.
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

// PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the App box inside it both
// live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together. The
// wrapping g is not optional: pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
// Nothing here ever puts .highlight on the App box either: a Pod must not be left holding a lit
// rectangle once its pulse has decayed.
function podBlock({ x, label, sublabel }) {
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 14, y: POD_Y + 30, w: POD_W - 28, h: 44, label: 'App', sublabel: 'writes PV-web', cat: 'storage' });
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
      'aria-label': 'Detach on node failure: when a node goes NotReady and its kubelet is silent, Kubernetes will not detach the volume immediately, because the old Pod cannot be confirmed dead and detaching while it might still write would let two nodes write one filesystem, so it waits out the pod-eviction timeout and then the roughly six minute force-detach before attaching the disk on a new node, a deliberate safety property rather than a bug, and the non-graceful node shutdown out-of-service taint is the operator escape hatch that asserts the node is truly dead and skips the wait',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    // node() puts its own label at coordinates RELATIVE to the frame group. An earlier pass hand
    // rolled these frames out of box() and appended an absolutely positioned caption into the
    // translated group, so 'node-1' rendered at 874 (on top of the other column's App box) and
    // 'node-2' at 1614, past the right edge of the viewBox and therefore invisible. Use the
    // primitive: it cannot be got wrong.
    const nodeA = node({ x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' });
    const nodeB = node({ x: B_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-2' });

    const oldPod = podBlock({ x: A_X + NODE_PAD, label: 'Pod web-0 (old)', sublabel: 'Running' });
    const newPod = podBlock({ x: B_X + NODE_PAD, label: 'Pod web-0 (new)', sublabel: 'Pending' });
    newPod.group.style.opacity = '0';

    const disk = cylinder({ x: DK_X, y: DK_Y, w: DK_W, h: DK_H, label: 'PV-web RWO', cat: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as storage-volume-model does.
    const diskLabel = disk.querySelector('.scheme-cylinder-label');
    if (diskLabel) diskLabel.setAttribute('y', 61);

    const escape = box({
      x: ESC_X, y: ESC_Y, w: ESC_W, h: ESC_H,
      label: 'Out-of-service Taint', sublabel: 'operator asserts node is dead', cat: 'storage',
    });

    const chain = chainList({
      x: LAD_X, y: LAD_Y, w: LAD_W, rowH: LAD_ROW, gap: LAD_GAP,
      items: [
        '1. pod-eviction timeout  ·  mark old Pod deleted',
        '2. force-detach timeout  ·  ~6 min, then rip attach',
        '3. attach on node-2  ·  new Pod finally starts',
      ],
      cat: 'storage',
    });

    // Both node-disk lanes are built identically, so the mirrored pair reads as the same relationship
    // on either side, differing only in which node currently holds the volume. Each is a real arrow in
    // the FULL storage colour (dim: false), not the muted dim variant, so the left lane to node-1 does
    // not read as a lesser arrow than the right one: they are one colour. wAttachA is shown from the
    // first frame (the volume starts on node-1) and only its OPACITY drops on force-detach as the
    // attachment is severed. wAttachB starts hidden and is drawn in when the volume moves to node-2.
    const wAttachA = pathArrow({ points: W_ATTACH_A, dashed: true, dim: false, color: 'storage' });
    const wAttachB = pathArrow({ points: W_ATTACH_B, dashed: true, dim: false, color: 'storage' });
    const wTaint   = pathArrow({ points: W_TAINT, dashed: true, dim: true, color: 'storage' });
    wAttachB.style.opacity = '0';
    wTaint.style.opacity = '0';

    const diskLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: DK_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const nodeChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'node-1',  value: 'Ready',              cat: 'storage' });
    const diskChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'volume',  value: 'attached to node-1', cat: 'storage' });
    const podChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'new Pod', value: 'not created',        cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node frames, then the disk and the escape box, then the Pods so
    // they sit above their own frame, then the lanes and the disk caption, then the bottom band
    // (chips + ladder), then the packet layer so every ball rides above everything. The ladder and
    // the packet lanes do not overlap at all (the lanes live above y 478, the ladder below y 448),
    // so the ladder needs no exemption from the packet layer.
    [nodeA, nodeB, disk, escape, oldPod.group, newPod.group].forEach(el => root.appendChild(el));
    [wAttachA, wAttachB, wTaint].forEach(el => root.appendChild(el));
    root.appendChild(diskLbl);
    [nodeChip, diskChip, podChip].forEach(c => root.appendChild(c));
    root.appendChild(chain);
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, chain, nodeA, nodeB,
      oldPod: oldPod.group, oldBox: oldPod.innerBox, oldShell: oldPod.group.querySelector('.scheme-pod'),
      newPod: newPod.group, newBox: newPod.innerBox, newShell: newPod.group.querySelector('.scheme-pod'),
      disk, escape, wAttachA, wAttachB, wTaint,
      nodeChip, diskChip, podChip,
      wires: { disk: diskLbl },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

// A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
// still holds the previous step's text at call time (clearHL clears the class, not the text) and
// steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which on a card
// built entirely out of state transitions is how the volume chip comes to read 'force-detached' on
// the step that is explaining why nothing has been detached yet.
function setChips(s, { nodeA, volume, newPod }) {
  setChip(s.refs.nodeChip, nodeA);
  setChip(s.refs.diskChip, volume);
  setChip(s.refs.podChip, newPod);
}

// Both Pods carry a sublabel that tracks their state, and like the chips it is written on EVERY
// step: a Pod still reading 'Running' three steps after its node went silent is a lie the reader
// has no way to catch.
function setPods(s, { oldSub, newSub }) {
  setPodSublabel(s.refs.oldShell, oldSub);
  setPodSublabel(s.refs.newShell, newSub);
}

function clearHL(s) {
  clearHighlights(s, ['disk', 'escape', 'oldBox', 'newBox',
    'nodeChip', 'diskChip', 'podChip'], [s.refs.oldPod, s.refs.newPod]);
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A healthy pair of nodes. node-1 is Ready, its Pod runs, and the ReadWriteOnce disk PV-web is attached there. The Pod may be writing to that disk at any instant, and everything about the safety story below turns on that one fact.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'Ready', volume: 'attached to node-1', newPod: 'not created' });
      setPods(s, { oldSub: 'Running', newSub: 'Pending' });
      s.refs.nodeA.style.opacity = '1';
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '0';
      s.refs.wAttachA.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      s.refs.disk.classList.add('highlight');
    },
  },
  {
    id: 'notready',
    duration: 2600,
    narration: 'node-1 stops answering. Its kubelet goes silent, the node is marked NotReady, and a replacement Pod is scheduled onto node-2. But there is no word from node-1 about whether the old Pod actually stopped. It might be dead. It might be a network blip with the Pod still writing.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady', volume: 'attached to node-1', newPod: 'Pending' });
      setPods(s, { oldSub: 'status unknown', newSub: 'Pending' });
      // Both node FRAMES and both Pods stay at full strength. node-1 being unreachable and its Pod
      // being unconfirmed are carried by the chip and the Pod sublabels, not by a faded opacity: a Pod
      // that might still be running is a Pod that exists, and the family draws an existing Pod at full.
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      s.refs.wAttachA.style.opacity = '1';
      s.refs.wAttachB.style.opacity = '0';
      s.refs.wTaint.style.opacity = '0';
      if (ctx.reduced) return;
      // The new Pod being scheduled IS the event, so it fades in. The old Pod stays put: nothing has
      // happened to it yet, only to its node.
      s.refs.newPod.style.opacity = '0';
      ctx.register(s.refs.newPod.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: 200, fill: 'forwards', easing: 'ease-out' }));
    },
  },
  {
    id: 'refuse',
    duration: 2800,
    narration: 'So Kubernetes refuses to detach the disk. Notice what it is not waiting on: no other Pod holds the volume and nothing is contending for it. It is waiting on doubt. Pull PV-web off node-1 while the old Pod might still be writing and two nodes write one filesystem, which corrupts it. Refusing is the safe answer to a question that cannot be answered.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady', volume: 'held on node-1', newPod: 'ContainerCreating' });
      setPods(s, { oldSub: 'may still write', newSub: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'do not detach yet');
      if (ctx.reduced) return;
      // The old Pod is the reason nothing may move, so it is the one that blinks, with the ordinary
      // smooth pulsePod like every other Pod in the section.
      pulsePod(s.refs.oldPod, ctx, 0);
    },
  },
  {
    id: 'evict',
    duration: 2600,
    narration: 'The clocks start. First the pod-eviction timeout: once node-1 has been NotReady long enough, the old Pod is marked for deletion. On a reachable node that would delete the Pod cleanly and release the volume. On an unreachable node the deletion cannot be confirmed, so the disk is still held.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 0);
      setChips(s, { nodeA: 'NotReady', volume: 'held on node-1', newPod: 'ContainerCreating' });
      setPods(s, { oldSub: 'marked for deletion', newSub: 'ContainerCreating' });
      s.refs.oldPod.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'still held');
      if (ctx.reduced) return;
      // The OLD Pod is what this timeout acts on, so the old Pod is what blinks, again with the
      // ordinary pulsePod. An earlier pass pulsed the new Pod here, pointing at the wrong node.
      pulsePod(s.refs.oldPod, ctx, 0);
    },
  },
  {
    id: 'forcedetach',
    duration: 2800,
    narration: 'Then the force-detach timeout, roughly six minutes after the node went unreachable. At that point Kubernetes gives up waiting for node-1 and rips the attachment away, on the assumption that after this long the old Pod cannot still be running. Only now is the disk free.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 1);
      setChips(s, { nodeA: 'NotReady', volume: 'force-detached', newPod: 'ContainerCreating' });
      setPods(s, { oldSub: 'assumed gone', newSub: 'ContainerCreating' });
      // The old Pod is now assumed dead and the standing attachment to node-1 is severed, so both
      // drop to GONE. Pinned here, above the guard, so a cancel mid-fade still lands on the right
      // value: the animation below only eases into what is already set.
      s.refs.oldPod.style.opacity = GONE;
      s.refs.wAttachA.style.opacity = GONE;
      s.refs.newPod.style.opacity = '1';
      s.refs.disk.classList.add('highlight');
      setWire(s, 'disk', 'force-detach');
      if (ctx.reduced) return;
      // The old Pod fades from full to GONE: it existed until now and is only now assumed dead.
      s.refs.oldPod.style.opacity = '1';
      ctx.register(s.refs.oldPod.animate([{ opacity: 1 }, { opacity: GONE }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      s.refs.wAttachA.style.opacity = '1';
      ctx.register(s.refs.wAttachA.animate([{ opacity: 1 }, { opacity: GONE }], { duration: FADE.out, fill: 'forwards', easing: 'ease-in' }));
      // The disk does NOT flash here. It is a static receiver of the detach, shown by its highlight
      // above plus the sublabel and the volume chip flipping to force-detached. The severing is
      // carried by the two fades (old Pod and the node-1 attachment lane), which is event enough.
    },
  },
  {
    id: 'attachb',
    duration: 3400,
    narration: 'With PV-web detached, the controller attaches it to node-2, kubelet mounts it, and the new Pod finally starts. Nothing in that sequence was slow. The entire outage was the safety margin: six minutes of deliberate doubt about a node that could not be asked.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChainActive(s.refs.chain, 2);
      setChips(s, { nodeA: 'NotReady', volume: 'attached to node-2', newPod: 'Running' });
      setPods(s, { oldSub: 'assumed gone', newSub: 'Running' });
      s.refs.oldPod.style.opacity = GONE;
      s.refs.wAttachA.style.opacity = GONE;
      s.refs.wAttachB.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      // The disk is the SOURCE of the attach hop, so it is lit from step entry: a ball must never
      // leave an unlit block. node-2 is the destination and lights on ARRIVAL, carried by the Pod
      // blink below rather than a static highlight at entry.
      s.refs.disk.classList.add('highlight');
      if (ctx.reduced) return;
      // Infra reaching a Pod, so this takes the down-arrow ordering: the lane draws itself in, the
      // ball leaves after BEAT.lead so the new attachment registers before anything moves on it, and
      // the Pod blinks on ARRIVAL rather than at step entry. The Pod is already at full strength, so
      // the arrival is carried by the ordinary pulsePod alone: it is the disk showing up that starts
      // the container.
      s.refs.wAttachB.style.opacity = '0';
      ctx.register(s.refs.wAttachB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      const a = routePacket(s, ctx, W_ATTACH_B, { delay: BEAT.lead, cat: 'storage' });
      // The lane now ends at the node frame bottom, so the tag rides ABOVE the ball and comes to rest
      // in the clear strip inside node-2 between the Pod bottom and the frame bottom.
      ridingLabel(s, ctx, 'attach to node-2', W_ATTACH_B, { delay: BEAT.lead });
      pulsePod(s.refs.newPod, ctx, a.arrivalMs);
    },
  },
  {
    id: 'escape',
    duration: 3200,
    narration: 'If an operator knows the node is really dead, waiting six minutes is wasted downtime. Non-graceful node shutdown is the escape hatch: tainting the node out-of-service tells Kubernetes to stop assuming the Pod might live, so it deletes the Pod and detaches the volume at once. The safety wait exists for uncertainty, and the taint is how you remove the uncertainty by hand.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The ladder is deliberately left with NO active rung. This step is not the next rung, it is
      // the path that skips the ladder, and lighting rung 3 here would say the opposite.
      setChainActive(s.refs.chain, -1);
      setChips(s, { nodeA: 'NotReady, tainted', volume: 'detached at once', newPod: 'Running' });
      setPods(s, { oldSub: 'deleted by taint', newSub: 'Running' });
      s.refs.oldPod.style.opacity = GONE;
      s.refs.wAttachA.style.opacity = GONE;
      s.refs.wAttachB.style.opacity = '1';
      s.refs.wTaint.style.opacity = '1';
      s.refs.newPod.style.opacity = '1';
      s.refs.escape.classList.add('highlight');
      setWire(s, 'disk', 'skip the wait');
      if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }
      s.refs.wTaint.style.opacity = '0';
      ctx.register(s.refs.wTaint.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, fill: 'forwards', easing: 'ease-out' }));
      // No Pod acts here: the operator does. So there is no pulse, the ball leaves after BEAT.lead so
      // the lit escape box registers as the source, and the disk lights on arrival rather than at
      // step entry. A block flash is not used on this, the closing step, which should come to rest.
      const t = routePacket(s, ctx, W_TAINT, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'out-of-service', W_TAINT, { delay: BEAT.lead });
      lightBoxAt(s.refs.disk, ctx, t.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
