import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Where the Bytes Land (viewBox 1200x640). The literal mount chain on ONE node, drawn in the storage
// vertical-stack grammar: the disk on the shelf at the bottom, the global staging mount above it, the
// per-Pod bind mounts above that, the Pods on top. The single attached block device is mounted
// exactly ONCE at a global staging path, and that one staged filesystem is then bind-mounted into
// each Pod private directory, which surfaces as /data in the container. Two Pods share one staged
// device through two SEPARATE bind mounts: that fan out is the whole point of the card. A mount
// rises (device, staging, bind, Pod), then a write descends that same chain, along the same lines
// turned around, because it is the same mounts being traversed the other way and not a second path.
//
// ---- Horizontal composition ----
// Every tier (Pods, bind mounts, staging, disk, chip strip) is symmetric about ONE derived centre,
// CONTENT_CX, instead of carrying hand-typed margins. The card this replaces had TWO centres and
// neither was 600: the block stack was symmetric about 720 (shoved right to clear the narration
// overlay) while the chip strip ran 60..1004 for a centre of 532. Combined bbox 60..1020, so 60
// units of margin on the left against 180 on the right, with a dead band down the right edge.
//
// LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
// window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
// step, by viewport:
//   1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
//   1100x800  -> 397 / 205     900x650 -> 398 / 344
// So the real worst case is x<=398 and y<=344. LEFT_X 400 has about 2 units of slack and cannot move
// left at all. The y reading never has to be cleared on its own, because the x reading already does
// the work: every block on this card starts at x=400 or further right, so nothing lands under the
// overlay at any height. That is what lets the stack be centred vertically for free. A narration
// longer than the ones below invalidates these numbers and they have to be measured again.
//
// CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so the two-column width is the only
// lever on where the diagram sits. It is solved for, not chosen: 2*COL_W + COL_GAP = 400 puts
// CONTENT_CX exactly on 600, the canvas centre.
//
// COL_W is in turn floored by the longest string any block carries, and on THIS card that is a
// filesystem path, because showing the real paths is the point of the diagram. Measured in viewBox
// units in the browser (never estimated), scheme-box-sublabel runs 5.9 units per character:
//   '/pods/uid-a/volumes/vol-1'          147.5   -> the bind boxes, and the binding constraint
//   '/plugins/.../csi/vol-1/globalmount' 200.6   -> the staging box, which is 400 wide, so free
//   'mount point'                         64.9   -> the container box inside a Pod, 152 wide
// COL_W 180 leaves 16 units of air either side of the bind path. That is also why this card has NO
// enclosing node() frame even though everything on it lives on one node: a frame needs 16 units of
// padding per side, which would drag COL_W down to 164 and force the bind path to be abbreviated.
// The narration says "on the node" for free, the path string cannot be bought back.
const LEFT_X = 400;
const COL_W = 180, COL_GAP = 40;
const CONTENT_W = COL_W * 2 + COL_GAP;                   // 400
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 600, the canvas centre, shared by every tier

const L_X = LEFT_X;                                      // 400, the Pod A column
const R_X = LEFT_X + COL_W + COL_GAP;                    // 620, the Pod B column
const L_CX = L_X + COL_W / 2;                            // 490
const R_CX = R_X + COL_W / 2;                            // 710, and (490 + 710) / 2 == CONTENT_CX

// ---- Vertical composition ----
// Every corridor between two tiers is 60 units, so every hop is the same length and therefore the
// same 700ms (routeDur floors short paths at HOP_MS), which keeps the chain reading as one steady
// walk rather than a set of unequal jumps.
//
// The stack is CHAINED off one origin rather than carrying five hand-typed tier positions, so the
// whole thing can be centred by moving a single number. It was previously typed out tier by tier
// starting at 44, which put the content at 44..622 in a 640 canvas: 44 units of air above it against
// 18 below, so the diagram sat visibly low and the chip strip nearly touched the bottom edge.
// STACK_TOP is now solved for instead of chosen, and every tier below follows from it.
const CORRIDOR = 60;                                     // the gap between two tiers, uniform
const POD_H = 116, BIND_H = 64, STG_H = 64, DEV_H = 88;
const DISK_LBL_GAP = 32;                                 // disk bottom to chip strip
const CHIP_H = 34;
// Total ink height, top of the Pods to the bottom of the chip strip.
const STACK_H = POD_H + CORRIDOR + BIND_H + CORRIDOR + STG_H + CORRIDOR + DEV_H + DISK_LBL_GAP + CHIP_H;
const STACK_TOP = (640 - STACK_H) / 2;                   // 31, so the margin is 31 above and below

const POD_Y = STACK_TOP;                                 // 31
const POD_BOTTOM = POD_Y + POD_H;                        // 147
const BIND_Y = POD_BOTTOM + CORRIDOR;                    // 207
const BIND_TOP = BIND_Y, BIND_BOTTOM = BIND_Y + BIND_H;  // 207 / 271
const STG_Y = BIND_BOTTOM + CORRIDOR;                    // 331
const STG_TOP = STG_Y, STG_BOTTOM = STG_Y + STG_H;       // 331 / 395
const DEV_W = 180;
const DEV_X = CONTENT_CX - DEV_W / 2;                    // 510
const DEV_Y = STG_BOTTOM + CORRIDOR, DEV_TOP = DEV_Y;    // 455
const DEV_BOTTOM = DEV_Y + DEV_H;                        // 543

// Corridor captions sit at the vertical middle of their corridor. The disk caption goes UNDER the
// cylinder, in the 32 units between the disk and the chip strip, the same slot storage-volume-mode
// uses for its disk labels.
const LBL_POD_Y = POD_BOTTOM + 36;                       // 183, corridor 147..207
const LBL_BIND_Y = BIND_BOTTOM + 36;                     // 307, corridor 271..331
const LBL_DISK_Y = DEV_BOTTOM + 20;                      // 563, corridor 543..575
const CHIPS_Y = DEV_BOTTOM + DISK_LBL_GAP;               // 575

// ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
// the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
// scheme-chip-text measures 6.88 units per character; worst cases, in viewBox units:
//   bind mounts   75.7 + 'Pod A and Pod B' 103.2 = 178.9
//   device        41.3 + '/dev/nvme1n1'     82.6 = 123.9
//   disk mounted  82.6 + 'not yet'          48.2 = 130.8
//   data copies   75.7 + 'none'             27.5 = 103.2
// So 232 clears the worst pair with ~29 units between name and value.
const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));               // 112 .. 1088

// ---- Lanes ----
// EVERY corridor runs dead on the centre line of the blocks it connects, and a corridor never shows
// more than one arrow at a time. When the write descends, the mount arrow that was there is replaced
// in place by an arrow pointing the other way, and the ball rides that. So across the whole card a
// given corridor is one single line that happens to point up while the chain is being built and down
// while the write is followed, which is both what the reader sees and what actually happens: there
// is no second path down, it is the same mount being traversed in the other direction.
//
// Getting here took two wrong turns worth recording. First version gave each direction its own lane,
// mount at -12 and write at +12 either side of centre. That balances only on the final step, the one
// step where a descent lane is visible at all: on the four mount steps before it every arrow on the
// card sat 12 units left of its own block with nothing on the right, so the whole diagram read as
// skewed. Second version centred only the corridors that never carry a descent, which was worse,
// because Pod A and Pod B are drawn as mirror columns and that left one centred and the other not.
//
// The up and down arrays below are therefore the SAME two points in reverse order, which is what
// flips the arrowhead, and the pair is crossfaded by flipAt() so it reads as a rotation rather than
// as one line being swapped for another. Each array is shared by the static pathArrow and the ball
// that rides it, so the wire and the packet cannot drift apart.
//
// Caption clearance: the innermost lanes are the two column centres, 490 and 710, so a corridor
// caption centred on CONTENT_CX has 110 units of clear space either side. Holding 8 units off the
// nearest lane gives a caption half-width of 102, and at 6.88 units per character (scheme-label
// code) that is a ceiling of 29 characters. Overrun it and the first and last letters sit on a lane.
const lane = (cx, y1, y2) => [[cx, y1], [cx, y2]];

const W_DEV_UP    = lane(CONTENT_CX, DEV_TOP, STG_BOTTOM);       // NodeStage: the one real mount
const W_STG_A_UP  = lane(L_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod A
const W_STG_B_UP  = lane(R_CX, STG_TOP, BIND_BOTTOM);            // NodePublish: bind into Pod B
const W_A_POD_UP  = lane(L_CX, BIND_TOP, POD_BOTTOM);            // runtime maps it to /data
const W_B_POD_UP  = lane(R_CX, BIND_TOP, POD_BOTTOM);
// The write: the same three corridors, reversed. Column B never carries one, so it has no pair.
const W_POD_A_DN  = lane(L_CX, POD_BOTTOM, BIND_TOP);
const W_A_STG_DN  = lane(L_CX, BIND_BOTTOM, STG_TOP);
const W_STG_DEV_DN = lane(CONTENT_CX, STG_BOTTOM, DEV_TOP);

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// Fade an element in at `delay` while leaving the caller free to pin opacity 1 statically above the
// ctx.reduced guard. Used for the Pod B column, which is a fact the card introduces partway through
// rather than structure it starts with. A corridor changing direction uses flipAt instead.
function revealAt(el, ctx, delay = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = '0';
  ctx.register(el.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides with the ball on the same path, timing AND easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball on this
// card is a routePacket, which is eased, so the default ease-in-out matches and the tag stays glued
// to the ball instead of drifting off it between the endpoints and the midpoint.
//
// `dy` puts the tag on the TRAILING side of the ball: above it on a descent, below it on an ascent.
// The tag is never over the destination block that way, only over the source it has already left,
// and the overlap that remains happens at the start of flight while the tag is still fading in.
// With a fixed -14 the mount tags parked inside the destination Pod for the 340ms they take to fade,
// right on top of the Pod sublabel and exactly where the eye is at arrival.
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
const RIDE_UP = { dy: 18 };      // trailing side of an ascending ball

// PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the container box inside it
// both live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for
// exactly as long as its ball is in flight. What a Pod must NOT have is a lingering state: no
// .highlight is ever put on the container box, here or at step entry, so nothing stays lit once the
// pulse has decayed. The card this replaces lit podABox on arrival and again statically on the write
// step, which left the /data box outlined long after the ball was gone and made the blink read as a
// state change rather than an event.
//
// The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength
// (symptom in anim-dump: strokeOpacity rows but no filter row).
function podBlock({ x, label }) {
  const shell = pod({ x, y: POD_Y, w: COL_W, h: POD_H, label, sublabel: 'uses vol-1 at /data', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 14, y: POD_Y + 40, w: COL_W - 28, h: 50, label: '/data', sublabel: 'mount point', cat: 'storage' });
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
      'aria-label': 'Where the bytes land. One attached block device is mounted exactly once on the node, at a global staging path under the kubelet plugins directory. That single staged filesystem is then bind-mounted into a directory that belongs to one Pod alone, under the kubelet pods directory and the Pod uid, and the container runtime maps that directory to slash data inside the container. A second Pod on the same node gets its own directory and its own bind mount off the same staging path, so two Pods share one disk through two separate bind mounts with no second attach and no second filesystem mount. A write to slash data descends the same chain, through the bind mount into the staging mount and onto the device, with no copy made at any hop.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const podA = podBlock({ x: L_X, label: 'Pod A' });
    const podB = podBlock({ x: R_X, label: 'Pod B' });

    const bindA = box({ x: L_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod A Bind Mount', sublabel: '/pods/uid-a/volumes/vol-1', cat: 'storage' });
    const bindB = box({ x: R_X, y: BIND_Y, w: COL_W, h: BIND_H, label: 'Pod B Bind Mount', sublabel: '/pods/uid-b/volumes/vol-1', cat: 'storage' });

    const stg = box({
      x: LEFT_X, y: STG_Y, w: CONTENT_W, h: STG_H,
      label: 'Global Staging Mount', sublabel: '/plugins/.../csi/vol-1/globalmount', cat: 'storage',
    });
    const dev = cylinder({ x: DEV_X, y: DEV_Y, w: DEV_W, h: DEV_H, label: '/dev/nvme1n1', cat: 'storage' });
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, as storage-volume-model does:
    // the default for h=88 is 49, and +5 lands it on the middle of the body.
    {
      const l = dev.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', DEV_H / 2 + 10);
    }

    // Column L and the spine carry the chain from the first step, because that chain IS the diagram
    // and the reader should see its shape immediately. Pod B is held back and faded in when the card
    // first claims it: that is a new fact, not standing structure. The three write arrows are built
    // here too but start hidden, because each one is the reversed twin of a mount arrow already on
    // the canvas and only ever replaces it, never joins it.
    const mk = points => pathArrow({ points, dashed: true, dim: true, color: 'storage' });
    const wDevUp   = mk(W_DEV_UP);
    const wStgAUp  = mk(W_STG_A_UP);
    const wAPodUp  = mk(W_A_POD_UP);
    const wStgBUp  = mk(W_STG_B_UP);
    const wBPodUp  = mk(W_B_POD_UP);
    const wPodADn  = mk(W_POD_A_DN);
    const wAStgDn  = mk(W_A_STG_DN);
    const wStgDevDn = mk(W_STG_DEV_DN);
    const laterWires = [wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn];
    laterWires.forEach(w => { w.style.opacity = '0'; });
    [podB.group, bindB].forEach(el => { el.style.opacity = '0'; });

    const podLbl  = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_POD_Y,  'text-anchor': 'middle' }, [' ']);
    const bindLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_BIND_Y, 'text-anchor': 'middle' }, [' ']);
    const diskLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: LBL_DISK_Y, 'text-anchor': 'middle' }, [' ']);

    const devChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'device',       value: '/dev/nvme1n1', cat: 'storage' });
    const mountChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'disk mounted', value: 'not yet',      cat: 'storage' });
    const bindChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'bind mounts',  value: 'none',         cat: 'storage' });
    const copyChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'data copies',  value: 'none',         cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the disk and the staging band, then the bind boxes, then the Pods,
    // then the lanes and their captions above the blocks, then the chip strip, then the packet layer
    // so every ball rides above everything.
    [dev, stg, bindA, bindB, podA.group, podB.group].forEach(el => root.appendChild(el));
    [wDevUp, wStgAUp, wAPodUp, wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn].forEach(el => root.appendChild(el));
    [podLbl, bindLbl, diskLbl].forEach(el => root.appendChild(el));
    [devChip, mountChip, bindChip, copyChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podA: podA.group, podB: podB.group,
      ctrA: podA.innerBox, ctrB: podB.innerBox,
      bindA, bindB, stg, dev,
      wDevUp, wStgAUp, wAPodUp, wStgBUp, wBPodUp, wPodADn, wAStgDn, wStgDevDn,
      devChip, mountChip, bindChip, copyChip,
      wires: { pod: podLbl, bind: bindLbl, disk: diskLbl },
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
// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report 'bind mounts: none' on the step that just made one. Two of the four never
// change on purpose: the device is the fixed bottom of the chain, and 'data copies: none' holding
// at none from the first step to the last is the claim the whole card is making.
function setChips(s, { device, mounted, binds, copies }) {
  setChip(s.refs.devChip, device);
  setChip(s.refs.mountChip, mounted);
  setChip(s.refs.bindChip, binds);
  setChip(s.refs.copyChip, copies);
}

function clearHL(s) {
  clearHighlights(s, ['bindA', 'bindB', 'stg', 'dev',
    'devChip', 'mountChip', 'bindChip', 'copyChip'], [s.refs.podA, s.refs.podB]);
}

// Pin the per-step visibility of everything the card reveals over time. Called from every enter()
// above the ctx.reduced guard so a prev/reset replay lands on the right skeleton, and so a mid-step
// cancel cannot leave a lane stranded at the opacity some earlier animation was driving it toward.
function setStage(s, { podB = 0, binds = 0, descent = 0, podA = 1 }) {
  s.refs.podA.style.opacity = String(podA);
  s.refs.podB.style.opacity = String(podB);
  s.refs.bindB.style.opacity = String(binds);
  s.refs.wStgBUp.style.opacity = String(binds);
  s.refs.wBPodUp.style.opacity = String(binds);
  // The three reversible corridors hold ONE arrow at a time: while the chain is being built it points
  // up, and on the write step the same line points down instead. Mount and write are mutually
  // exclusive here rather than independently toggled, which is the whole point of the pairing.
  const mount = descent ? '0' : '1';
  [s.refs.wDevUp, s.refs.wStgAUp, s.refs.wAPodUp].forEach(w => { w.style.opacity = mount; });
  [s.refs.wPodADn, s.refs.wAStgDn, s.refs.wStgDevDn].forEach(w => { w.style.opacity = String(descent); });
}

// Turn one corridor around in place: its mount arrow fades out and its write arrow fades in over the
// same 300ms on the same centre line, so the eye reads one arrow rotating rather than a swap. Called
// just before the ball that uses the corridor sets off, so the line always points where the ball is
// about to go. Under ctx.reduced it snaps, which keeps the static end-state honest.
function flipAt(upEl, dnEl, ctx, delay = 0) {
  if (!upEl || !dnEl) return;
  if (ctx.reduced || delay <= 0) { upEl.style.opacity = '0'; dnEl.style.opacity = '1'; return; }
  upEl.style.opacity = '1';
  dnEl.style.opacity = '0';
  ctx.register(upEl.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, delay, fill: 'forwards', easing: 'ease-in' }));
  ctx.register(dnEl.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 300, delay, fill: 'forwards', easing: 'ease-out' }));
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A Pod writes to /data and expects the bytes to reach a disk. On the node that path is not one hop, it is a short chain of mounts. Start at the bottom: one real block device, /dev/nvme1n1, attached to this node and holding the filesystem.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'not yet', binds: 'none', copies: 'none' });
      setStage(s, { podA: 0.5 });
      setWire(s, 'disk', 'attached to node-1');
    },
  },
  {
    id: 'stage',
    duration: 2600,
    narration: 'The device is mounted exactly once, at a global staging path under the kubelet plugins directory. This is the only place the filesystem itself is mounted on the node. Everything above this point is not another mount of the disk, it is a view onto this one.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'none', copies: 'none' });
      setStage(s, { podA: 0.5 });
      setWire(s, 'disk', 'mounted once, here');
      s.refs.dev.classList.add('highlight');
      if (ctx.reduced) { s.refs.stg.classList.add('highlight'); return; }
      // No Pod is involved in NodeStage, so nothing pulses: the ball leaves after BEAT.lead so the
      // lit device registers as the source before it departs, and the staging mount lights on arrival.
      const m = routePacket(s, ctx, W_DEV_UP, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'NodeStage', W_DEV_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.stg, ctx, m.arrivalMs);
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'NodePublish does not touch the disk again. It bind-mounts the staged directory into a directory that belongs to Pod A alone, under /var/lib/kubelet/pods and the Pod uid. A bind mount is a second doorway onto the exact same files, not a copy.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A', copies: 'none' });
      setStage(s, { podA: 0.5 });
      setWire(s, 'bind', 'NodePublish: bind mount');
      setWire(s, 'disk', 'still mounted once');
      s.refs.stg.classList.add('highlight');
      if (ctx.reduced) { s.refs.bindA.classList.add('highlight'); return; }
      const b = routePacket(s, ctx, W_STG_A_UP, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_A_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.bindA, ctx, b.arrivalMs);
    },
  },
  {
    id: 'surface',
    duration: 3000,
    narration: 'That per-Pod directory is what the container runtime maps to /data inside Pod A. From the container it looks like a plain folder. Underneath, it is a bind mount of a bind mount of one staged device. Pod A can now read and write.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A', copies: 'none' });
      setStage(s, {});                                  // Pod A comes up to full opacity here
      setWire(s, 'pod', 'the runtime maps it');
      s.refs.bindA.classList.add('highlight');
      if (ctx.reduced) return;
      // Infrastructure reaching a Pod, so the down-arrow ordering: the ball flies first and Pod A
      // pulses on its arrival. Pod A is dim until the volume actually surfaces inside it, so it is
      // driven back to 0.5 and faded up on arrival, in step with the pulse.
      const p = routePacket(s, ctx, W_A_POD_UP, { cat: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_A_POD_UP, RIDE_UP);
      s.refs.podA.style.opacity = '0.5';
      ctx.register(s.refs.podA.animate([{ opacity: 0.5 }, { opacity: 1 }], { duration: 500, delay: p.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podA, ctx, p.arrivalMs);
    },
  },
  {
    id: 'second',
    duration: 3600,
    narration: 'A second Pod on the same node gets its own directory and its own bind mount off the same global staging path. The disk is not attached twice and not staged twice. Two Pods, two bind mounts, one device underneath. That is how a single disk is shared across Pods on a node.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A and Pod B', copies: 'none' });
      setStage(s, { podB: 1, binds: 1 });
      setWire(s, 'bind', 'a second bind mount');
      setWire(s, 'disk', 'still mounted once');
      s.refs.stg.classList.add('highlight');
      s.refs.bindA.classList.add('highlight');
      if (ctx.reduced) { s.refs.bindB.classList.add('highlight'); return; }
      // The Pod B column materializes as the chain claims it: its lanes and bind box first, then the
      // Pod itself once the bind mount has landed under it.
      [s.refs.wStgBUp, s.refs.wBPodUp, s.refs.bindB].forEach(el => revealAt(el, ctx, 1));
      const b = routePacket(s, ctx, W_STG_B_UP, { delay: BEAT.lead, cat: 'storage' });
      ridingLabel(s, ctx, 'bind', W_STG_B_UP, { delay: BEAT.lead, ...RIDE_UP });
      lightBoxAt(s.refs.bindB, ctx, b.arrivalMs);
      const p = routePacket(s, ctx, W_B_POD_UP, { delay: b.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'mount /data', W_B_POD_UP, { delay: b.arrivalMs + BEAT.afterHop, ...RIDE_UP });
      s.refs.podB.style.opacity = '0';
      ctx.register(s.refs.podB.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 500, delay: b.arrivalMs, fill: 'forwards', easing: 'ease-out' }));
      pulsePod(s.refs.podB, ctx, p.arrivalMs);
    },
  },
  {
    id: 'write',
    duration: 4400,
    narration: 'Follow a write the other way. Pod A writes to /data, and the bytes pass down through its bind mount, into the global staging mount, and onto the device. No copy is made at any hop. All the mounts are windows onto the same blocks on the same disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { device: '/dev/nvme1n1', mounted: 'once', binds: 'Pod A and Pod B', copies: 'none' });
      setStage(s, { podB: 1, binds: 1, descent: 1 });
      setWire(s, 'pod', 'same files, no copy');
      setWire(s, 'disk', 'the bytes land here');
      // The static end-state of this step is the whole chain lit, because by the time the write has
      // finished the ball has arrived at each of the three blocks in turn. Lighting only the device
      // here would make a prev/reset replay show a different ending than a forward play.
      if (ctx.reduced) {
        [s.refs.bindA, s.refs.stg, s.refs.dev].forEach(el => el.classList.add('highlight'));
        return;
      }
      // Pod A is the writer, so the up-arrow ordering applies at the top of the chain: the Pod blinks
      // first and the write leaves at BEAT.afterPulse. Each hop then chains off the previous hop's
      // real arrival time rather than a hard-coded delay, and each corridor turns around just before
      // its ball uses it, so the chain visibly reverses one link at a time ahead of the write rather
      // than flipping all three at once on step entry.
      pulsePod(s.refs.podA, ctx, 0);
      flipAt(s.refs.wAPodUp, s.refs.wPodADn, ctx, 1);
      const h1 = routePacket(s, ctx, W_POD_A_DN, { delay: BEAT.afterPulse, cat: 'storage' });
      ridingLabel(s, ctx, 'write', W_POD_A_DN, { delay: BEAT.afterPulse });
      lightBoxAt(s.refs.bindA, ctx, h1.arrivalMs);

      flipAt(s.refs.wStgAUp, s.refs.wAStgDn, ctx, h1.arrivalMs);
      const h2 = routePacket(s, ctx, W_A_STG_DN, { delay: h1.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'same blocks', W_A_STG_DN, { delay: h1.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.stg, ctx, h2.arrivalMs);

      flipAt(s.refs.wDevUp, s.refs.wStgDevDn, ctx, h2.arrivalMs);
      const h3 = routePacket(s, ctx, W_STG_DEV_DN, { delay: h2.arrivalMs + BEAT.afterHop, cat: 'storage' });
      ridingLabel(s, ctx, 'bytes land', W_STG_DEV_DN, { delay: h2.arrivalMs + BEAT.afterHop });
      lightBoxAt(s.refs.dev, ctx, h3.arrivalMs);
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
