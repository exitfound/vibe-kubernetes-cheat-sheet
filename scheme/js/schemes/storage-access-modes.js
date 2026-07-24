import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, node, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, pulsePodDim, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// Layout (viewBox 1200x640). Storage grammar: consumers on top, machinery in the middle, disks on a
// shelf at the bottom. Here the top row is TWO worker nodes, each carrying Pods, because the whole
// point of access modes is which node (and which Pod) may hold the volume at the same time. The CSI
// driver sits as a full-width band under the nodes, since every attach is mediated by it and the
// driver is what actually honours (or refuses) the requested mode. The disks are two PVs on the
// bottom shelf: a block disk that can only do single-attach, and a shared filesystem that can do many.
//
// Every mount is a DESCENT through the driver: Pod -> driver (attach request), then driver -> disk
// (the attach). A ball that enters the driver at the Pod column and re-emerges at the disk column is
// the rewrite-inside-a-box idiom: the driver is where the decision is made. A refused attach stops AT
// the driver and never reaches a disk. Only Pods pulse. The driver and the disks light, never pulse.
//
// ---- Horizontal composition, derived rather than hand-placed ----
// Every tier (node row, driver band, disk shelf, chip strip) shares ONE center, CONTENT_CX, instead
// of each carrying its own hand-typed margins. That shared center is NOT the canvas center, and it
// cannot be: the narration overlay permanently occupies the top left, and the node row sits inside
// its vertical band.
//
// Do not "improve" this by measuring the overlay at your own window size and sliding LEFT_X leftward.
// The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats.
// Measured right edge / bottom edge by viewport, this card, worst step:
//   1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
//   1100x800  -> 397 / 230     900x650 -> 398 / 375
// So the real worst case is x<=398 and y<=375, NOT the 380/342 an earlier pass wrote here from a
// too-narrow sample. LEFT_X 400 therefore has about 2px of slack, not 20: it cannot move left at all,
// and the driver band (bottom 375) is only just clear of the overlay at the smallest window too.
// A left edge picked from a single wide-window measurement looks centered on the machine it was tuned
// on and slides under the overlay on a laptop.
const LEFT_X = 400;                                      // leftmost the NODE ROW may go, all viewports

// Pod and node sizes drive everything else: the node row width is DERIVED from what it has to hold,
// and the driver band and disk shelf follow that. Nothing here is a hand-typed x.
//
// POD_W is what decides whether the whole diagram can look centered, because CONTENT_CX works out to
// LEFT_X + (3*POD_W + 102)/2 and LEFT_X is pinned by the overlay. At the old POD_W 156 the center
// landed on 692 against a canvas center of 600, which read as a visible shift to the right. POD_W is
// in turn bound by the WIDEST TEXT INSIDE A POD: the container sublabel used to be 'reads and writes',
// which renders 94 units wide and put a hard floor of ~146 under POD_W. Shortening it to 'read/write'
// (59 units) is what buys the room, so do not lengthen that string back without re-deriving all this.
// At POD_W 112 the Pods came out narrower than they are tall and read as squeezed, so they are 128
// here: that is the widest the row can go while the whole diagram still reads as centered (every
// extra unit of POD_W costs 1.5 units of rightward shift, since three Pods sit in the row).
const POD_Y = 82, POD_W = 128, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const NODE_PAD = 16;                                     // node border to the Pod inside it
const POD_GAP = 16;                                      // between the two Pods on node-1
const NODE_GAP = 30;                                     // between the two nodes
const NODE_Y = 55, NODE_H = 186;

const NODE_1_X = LEFT_X;
const NODE_1_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;     // 304
const NODE_2_X = NODE_1_X + NODE_1_W + NODE_GAP;         // 734
const NODE_2_W = NODE_PAD * 2 + POD_W;                   // 160

const CONTENT_W = NODE_1_W + NODE_GAP + NODE_2_W;        // 494
const RIGHT_END = LEFT_X + CONTENT_W;                    // 894
const CONTENT_CX = LEFT_X + CONTENT_W / 2;               // 647: the one center every tier uses

const P1_X = NODE_1_X + NODE_PAD;                        // 416, node-1 first Pod
const P2_X = P1_X + POD_W + POD_GAP;                     // 560, node-1 second Pod
const P3_X = NODE_2_X + NODE_PAD;                        // 750, node-2 only Pod
const P1_CX = P1_X + POD_W / 2, P2_CX = P2_X + POD_W / 2, P3_CX = P3_X + POD_W / 2;

const DRV_X = LEFT_X, DRV_Y = 305, DRV_W = CONTENT_W, DRV_H = 70;
const DRV_TOP = DRV_Y, DRV_BOTTOM = DRV_Y + DRV_H;       // 305 / 375

// The two disks sit symmetrically about CONTENT_CX, each roughly under the node that uses it.
const PV_Y = 450, PV_H = 100, PV_TOP = PV_Y;             // 450
const PV_W = 215;
const PV_SPREAD = 148;                                   // half-distance between the two disk centers
const BLOCK_CX = CONTENT_CX - PV_SPREAD;                 // 544
const NFS_CX = CONTENT_CX + PV_SPREAD;                   // 840
// cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that, the same
// gap storage-pvc-binding uses. It used to be a flat PV_Y+66, which against a 100-tall cylinder left
// only 11px between two baselines whose text is 11px tall: the two lines visually touched.
const SPEC_GAP = 14;
const SPEC_Y = PV_Y + PV_H / 2 + 5 + SPEC_GAP;           // 519
const VERDICT_Y = 566;
const CHIPS_Y = 585;

// ONE width for all four chips, rather than four hand-picked widths. valChip anchors the name at 12
// from the left and the value at 12 from the right, so the width a chip needs is name + value + 24
// plus a readable gap between the two. Measured worst cases, in viewBox units:
//   accessModes 76 + ReadWriteOncePod 110 = 186   <- the binding one, and neither string can shorten
//   attached to 76 + 'node-1, node-2'    96 = 172
//   sharing     48 + 'app-1, app-2, app-3' 131 = 179
//   enforced by 76 + 'CSI driver'         69 = 145
// So 232 clears the worst pair with ~22 units between name and value. That is also why the multi-value
// chips read as comma lists: 'node-1 and node-2' and 'app-1, app-2 and app-3' were wide enough to force
// a wider uniform chip, and the strip is already more than twice the width of the diagram it captions.
const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // accessModes / attached to / sharing / enforced by
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

// A Pod the access mode REFUSES. Dim means denied, not "has not mounted yet": a Pod that simply has
// not been shown mounting is a perfectly healthy Pod and must look like one. Dimming those too made
// the resting state of the card (the poster auto-plays step 1, so that is what you stare at on open)
// show two of three Pods greyed out for no reason a viewer could name, and it conflated app-2, which
// mounts fine one step later, with app-3, which is genuinely refused.
// Who currently HOLDS the volume is carried by the ball, the lit disk and the sharing chip instead.
const DIM = 0.75;

// Attach request hops: Pod -> driver band.
const W_P1_DRV = [[P1_CX, POD_BOTTOM], [P1_CX, DRV_TOP]];
const W_P2_DRV = [[P2_CX, POD_BOTTOM], [P2_CX, DRV_TOP]];
const W_P3_DRV = [[P3_CX, POD_BOTTOM], [P3_CX, DRV_TOP]];
// Attach hops: driver -> disk. The ball re-emerges from the driver at the disk column.
const W_DRV_BLOCK = [[BLOCK_CX, DRV_BOTTOM], [BLOCK_CX, PV_TOP]];
// The shared filesystem is reached on THREE lanes, one per mounting Pod, and all three are drawn.
// There used to be a single wire down NFS_CX with balls flying at NFS_CX +/- 7, so no ball actually
// rode the drawn line: they skimmed 7px either side of it. Three lanes rather than two because
// ReadWriteMany excludes nobody: app-2 sits on the same node as app-1 and can mount it just as well,
// and leaving it out made the step look like RWX still rations access somehow.
const NFS_LANE = 16;
const W_DRV_NFS_1 = [[NFS_CX - NFS_LANE, DRV_BOTTOM], [NFS_CX - NFS_LANE, PV_TOP]];  // app-1 on node-1
const W_DRV_NFS_2 = [[NFS_CX, DRV_BOTTOM], [NFS_CX, PV_TOP]];                        // app-2 on node-1
const W_DRV_NFS_3 = [[NFS_CX + NFS_LANE, DRV_BOTTOM], [NFS_CX + NFS_LANE, PV_TOP]];  // app-3 on node-2

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. easing:'linear' for a
// straight segmentPacket hop, default (eased) for a routePacket which is what every hop here is.
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

// A Pod is a shell plus an inner box, wrapped in a g so pulsePod reaches BOTH. querySelectorAll
// matches descendants only, so pulsing a bare pod() would fire at half strength.
function podBlock({ x, label }) {
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // Inset 14 rather than 20: at this POD_W the old inset left the sublabel close to the box sides.
  // 'read/write' is 59 units wide against a 100-wide box, so it keeps ~20 units of air either side.
  const innerBox = box({ x: x + 14, y: POD_Y + 46, w: POD_W - 28, h: 52, label: 'ctr', sublabel: 'read/write', cat: 'storage' });
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
      'aria-label': 'Access modes decide who can mount a volume at once: ReadWriteOnce attaches a volume to a single node, so two Pods on that same node can both use it but a Pod on another node cannot, ReadWriteOncePod narrows that to one single Pod, and ReadWriteMany needs a shared filesystem because a plain block disk cannot be attached to many nodes at all. The access mode is mostly a request that the CSI driver has to honour rather than a rule Kubernetes enforces on its own, the one exception being ReadWriteOncePod.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeA = node({ x: NODE_1_X, y: NODE_Y, w: NODE_1_W, h: NODE_H, label: 'node-1' });
    const nodeB = node({ x: NODE_2_X, y: NODE_Y, w: NODE_2_W, h: NODE_H, label: 'node-2' });

    const podA1 = podBlock({ x: P1_X, label: 'Pod app-1' });
    const podA2 = podBlock({ x: P2_X, label: 'Pod app-2' });
    const podB1 = podBlock({ x: P3_X, label: 'Pod app-3' });

    const driver = box({ x: DRV_X, y: DRV_Y, w: DRV_W, h: DRV_H, label: 'CSI driver and attach controller', sublabel: 'grants or refuses each attach', cat: 'storage' });

    const pvBlock = cylinder({ x: BLOCK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-block', cat: 'storage' });
    const pvNfs   = cylinder({ x: NFS_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-nfs', cat: 'storage' });

    const wA1 = pathArrow({ points: W_P1_DRV, dashed: true, dim: true, color: 'storage' });
    const wA2 = pathArrow({ points: W_P2_DRV, dashed: true, dim: true, color: 'storage' });
    const wB1 = pathArrow({ points: W_P3_DRV, dashed: true, dim: true, color: 'storage' });
    const wBlock = pathArrow({ points: W_DRV_BLOCK, dashed: true, dim: true, color: 'storage' });
    const wNfs1 = pathArrow({ points: W_DRV_NFS_1, dashed: true, dim: true, color: 'storage' });
    const wNfs2 = pathArrow({ points: W_DRV_NFS_2, dashed: true, dim: true, color: 'storage' });
    const wNfs3 = pathArrow({ points: W_DRV_NFS_3, dashed: true, dim: true, color: 'storage' });

    const blockLbl = text({ class: 'scheme-label code dim', x: BLOCK_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    const nfsLbl   = text({ class: 'scheme-label code dim', x: NFS_CX, y: VERDICT_Y, 'text-anchor': 'middle' }, [' ']);
    // Centered on the driver band it captions, rather than the hand-typed 725 it used to sit at.
    const drvLbl   = text({ class: 'scheme-label code dim', x: DRV_X + DRV_W / 2, y: 408, 'text-anchor': 'middle' }, [' ']);

    const modeChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'accessModes', value: 'ReadWriteOnce', cat: 'storage' });
    const attachChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'attached to', value: 'none', cat: 'storage' });
    const shareChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'sharing', value: 'none', cat: 'storage' });
    const driverChip = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'enforced by', value: 'CSI driver', cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): node containers, then the driver band and disks, then the Pods so they
    // sit above their node, then the wires and their labels above the blocks, then the chip strip,
    // then the packet layer so every ball rides above everything.
    [nodeA, nodeB, driver, pvBlock, pvNfs, podA1.group, podA2.group, podB1.group].forEach(el => root.appendChild(el));
    [wA1, wA2, wB1, wBlock, wNfs1, wNfs2, wNfs3].forEach(el => root.appendChild(el));
    [blockLbl, nfsLbl, drvLbl].forEach(el => root.appendChild(el));
    root.appendChild(specText(BLOCK_CX, 'block disk, single attach'));
    root.appendChild(specText(NFS_CX, 'shared filesystem'));
    [modeChip, attachChip, shareChip, driverChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podA1: podA1.group, podA2: podA2.group, podB1: podB1.group,
      appA1: podA1.innerBox, appA2: podA2.innerBox, appB1: podB1.innerBox,
      driver, pvBlock, pvNfs,
      modeChip, attachChip, shareChip, driverChip,
      wires: { block: blockLbl, nfs: nfsLbl, drv: drvLbl },
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
// enforcer is a real value, not a constant caption: every mode here is honoured by the driver EXCEPT
// ReadWriteOncePod, which Kubernetes itself enforces. The chip used to be hardcoded to 'CSI driver',
// which made it both dead weight and wrong on the one step where it mattered.
// 'sharing' answers exactly one question: which Pods hold the volume right now. It used to double as
// a refusal report ('node-2 refused', 'block cannot span nodes'), which put a refusal in the chip on
// the very step where a ball flies out of a refused Pod, so the chip read as a caption for that ball.
// Refusal reasons belong on the driver wire label, which already carries them.
function setChips(s, { mode, attach, share, enforcer = 'CSI driver' }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.attachChip, attach);
  setChip(s.refs.shareChip, share);
  setChip(s.refs.driverChip, enforcer);
}

function setPods(s, { a1, a2, b1 }) {
  s.refs.podA1.style.opacity = String(a1);
  s.refs.podA2.style.opacity = String(a2);
  s.refs.podB1.style.opacity = String(b1);
}

function clearHL(s) {
  clearHighlights(s, ['driver', 'pvBlock', 'pvNfs', 'appA1', 'appA2', 'appB1',
    'modeChip', 'attachChip', 'shareChip', 'driverChip'], [s.refs.podA1, s.refs.podA2, s.refs.podB1]);
}

// One attach that succeeds: the Pod blinks first (it is the actor), the request rises to the driver,
// then the granted attach drops to the disk. Both the driver and the disk light on arrival.
function grantMount(s, ctx, { podEl, reqPts, attachPts, tag, disk, lead = 0 }) {
  pulsePod(podEl, ctx, lead);
  const req = routePacket(s, ctx, reqPts, { delay: lead + BEAT.afterPulse, cat: 'storage' });
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  const att = routePacket(s, ctx, attachPts, { delay: req.arrivalMs + BEAT.afterHop, cat: 'storage' });
  ridingLabel(s, ctx, tag, attachPts, { delay: req.arrivalMs + BEAT.afterHop });
  lightBoxAt(disk, ctx, att.arrivalMs);
  return att.arrivalMs;
}

// A refused attach: the request reaches the gate and stops there. No disk lights.
// The Pod blinks FIRST, exactly as in grantMount. It is the actor either way, and without the blink
// the narration names a Pod that is never seen doing anything: the ball just materialised out of a
// dim block. Refused Pods stay dim, so the blink has to be the dim variant with an opacity lift or it
// is invisible against the 0.55 they sit at.
function denyMount(s, ctx, { podEl, reqPts, tag, lead = 0 }) {
  if (podEl) pulsePodDim(podEl, ctx, lead, { from: DIM, peak: 0.95 });
  const delay = podEl ? lead + BEAT.afterPulse : lead;
  const req = routePacket(s, ctx, reqPts, { delay, cat: 'storage' });
  ridingLabel(s, ctx, tag, reqPts, { delay });
  lightBoxAt(s.refs.driver, ctx, req.arrivalMs);
  return req.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'The block disk PV-block offers ReadWriteOnce. Three Pods want it: two on node-1 and one on node-2. The access mode is what decides how many of them can mount it at the same time, and every attach has to pass through the CSI driver.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'none', share: 'none' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // idle: nobody is refused anything yet
    },
  },
  {
    id: 'rwo-first',
    duration: 3100,
    narration: 'Pod app-1 mounts the volume. ReadWriteOnce attaches the disk to one node, node-1, and lets a Pod there read and write it. So far this looks exactly like a per-Pod lock, but that is not what ReadWriteOnce actually means.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // app-2 and app-3 are healthy, just not shown mounting
      setWire(s, 'block', 'attached: node-1');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, attachPts: W_DRV_BLOCK, tag: 'mount rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-samenode',
    duration: 3100,
    narration: 'Pod app-2 sits on the same node and it can mount the volume too. ReadWriteOnce is per node, not per Pod. Once the disk is attached to node-1, any number of Pods scheduled onto node-1 can share it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1, app-2' });
      setPods(s, { a1: 1, a2: 1, b1: 1 });          // app-3 is not refused until the next step
      setWire(s, 'block', 'attached: node-1');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvBlock.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, attachPts: W_DRV_BLOCK, tag: 'shares rw', disk: s.refs.pvBlock });
    },
  },
  {
    id: 'rwo-othernode',
    duration: 2600,
    narration: 'Pod app-3 lives on node-2 and asks for the same volume. This one is refused. The disk is already attached to node-1, and a block disk can be attached to only one node at a time, so app-3 gets a Multi-Attach error and never starts.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOnce', attach: 'node-1', share: 'app-1, app-2' });
      setPods(s, { a1: 1, a2: 1, b1: DIM });        // app-3 refused: Multi-Attach
      setWire(s, 'block', 'attached: node-1');
      setWire(s, 'drv', 'held by node-1');
      // The disk stays lit: it is still attached to node-1 and still in use by app-1 and app-2. It is
      // the REASON app-3 is refused, so leaving it unlit contradicted both the wire label and the
      // narration, which say in so many words that the disk is already attached.
      s.refs.pvBlock.classList.add('highlight');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, tag: 'Multi-Attach denied' });
    },
  },
  {
    id: 'rwop',
    duration: 2600,
    narration: 'ReadWriteOncePod is the strict one. Now even app-2 on the same node is refused, because the volume is bound to a single Pod and nothing else. It is also the one mode Kubernetes enforces itself rather than leaving to the driver, and it is what you reach for when two Pods writing the same files would corrupt each other.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteOncePod', attach: 'node-1', share: 'app-1 only', enforcer: 'Kubernetes' });
      setPods(s, { a1: 1, a2: DIM, b1: DIM });      // RWOP refuses everyone but app-1
      setWire(s, 'block', 'held by app-1');
      setWire(s, 'drv', 'one Pod only');
      s.refs.pvBlock.classList.add('highlight');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      denyMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, tag: 'RWOP refused' });
    },
  },
  {
    id: 'rwx-block',
    duration: 2600,
    narration: 'ReadWriteMany asks for the volume on many nodes at once. On the block disk that request cannot be honoured at all: a raw block device simply cannot attach to more than one node. Kubernetes will accept the access mode on the object, but the driver is where it fails.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // attach is 'none', not 'node-1': the narration says this request cannot be honoured at all, so
      // leaving the previous step's node-1 in the chip would have the strip contradict the sentence.
      setChips(s, { mode: 'ReadWriteMany', attach: 'none', share: 'none' });
      setPods(s, { a1: DIM, a2: DIM, b1: DIM });    // RWX on a block disk: nobody gets it
      setWire(s, 'block', 'RWX unsupported');
      setWire(s, 'drv', 'block disk, no RWX');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); return; }
      // BOTH nodes ask, because asking from many nodes at once is what ReadWriteMany means and what
      // this disk cannot do. A single request could not show the thing the step is about.
      denyMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, tag: 'RWX unsupported' });
      denyMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, tag: 'RWX unsupported', lead: 220 });
    },
  },
  {
    id: 'rwx-nfs',
    duration: 3800,
    narration: 'Point the claim at a shared filesystem instead, PV-nfs on NFS or CephFS, and ReadWriteMany works. The driver attaches it to both nodes, and all three Pods mount it at once, on either node, with nobody refused. The mode was always allowed by Kubernetes, what changed is a backend that can deliver it.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'ReadWriteMany', attach: 'node-1, node-2', share: 'app-1, app-2, app-3' });
      // Every Pod is at full opacity here: ReadWriteMany on a shared filesystem excludes nobody, so
      // there is no Pod left in the not-holding-it state that DIM exists to mark.
      setPods(s, { a1: 1, a2: 1, b1: 1 });
      setWire(s, 'nfs', 'attached: both nodes');
      if (ctx.reduced) { s.refs.driver.classList.add('highlight'); s.refs.pvNfs.classList.add('highlight'); return; }
      grantMount(s, ctx, { podEl: s.refs.podA1, reqPts: W_P1_DRV, attachPts: W_DRV_NFS_1, tag: 'mount rwx', disk: s.refs.pvNfs });
      grantMount(s, ctx, { podEl: s.refs.podA2, reqPts: W_P2_DRV, attachPts: W_DRV_NFS_2, tag: 'mount rwx', disk: s.refs.pvNfs, lead: 200 });
      grantMount(s, ctx, { podEl: s.refs.podB1, reqPts: W_P3_DRV, attachPts: W_DRV_NFS_3, tag: 'mount rwx', disk: s.refs.pvNfs, lead: 400 });
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
