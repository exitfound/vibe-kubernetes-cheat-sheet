import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, node, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT,
} from '../lib/storage-kit.js';

// The sibling of storage-access-modes: accessModes and volumeMode are the two spec fields that sit
// side by side on both the PV and the PVC, and this card is the second half of that pair. Where
// access modes answer WHO may hold the volume, volumeMode answers WHAT the workload is handed.
//
// Layout (viewBox 1200x640). Storage grammar is a vertical stack, and this card runs TWO of them
// side by side inside ONE node, because the fork this card is about happens on the node, in kubelet
// and the CSI node service, and not in any control-plane controller. Two Pods on top, the node
// service as a full-width band under them, and the two backing disks on the bottom shelf. The disks
// are deliberately identical (same size, same class, same backend): the only thing that differs
// between the columns is the one field, so anything else that differed would muddy the comparison.
//
// Every hop is a straight vertical run inside a column, and each direction has its OWN lane offset
// LANE around the column center, so a mount rising into a container never re-uses the arrow the
// request came down. Only Pods pulse. The band and the disks light, never pulse.
//
// ---- Horizontal composition ----
// Every tier (node, band, disk shelf, chip strip) shares ONE center, CONTENT_CX, rather than each
// carrying hand-typed margins. LEFT_X is pinned by the narration overlay, which is HTML laid over
// the SVG, so the NARROWER the window the MORE viewBox units it eats. Measured right edge / bottom
// edge for THIS card, worst step, by viewport:
//   1920x1080 -> 203 / 193    1440x900 -> 319 / 242    1280x800 -> 358 / 282
//   1100x800  -> 397 / 304     900x650 -> 398 / 498
// So the real worst case is x<=398 and y<=498. LEFT_X 400 therefore has about 2 units of slack and
// cannot move left at all. The bottom of 498 is what pins the disk shelf too: the left cylinder
// starts at x=410, which clears the overlay by only 12 units at 900x650, so PV_W cannot grow
// leftward either. Do not re-derive any of this from a single wide-window screenshot. A narration
// longer than the ones below invalidates these numbers and they have to be measured again.
//
// CONTENT_CX works out to LEFT_X + NODE_W/2, and LEFT_X cannot move, so NODE_W is the ONLY lever on
// where the whole diagram sits. It is solved for, not chosen: NODE_W 400 puts CONTENT_CX exactly on
// 600, the canvas center.
//
// That exactness matters because of the chip strip. Every tier here is symmetric about CONTENT_CX,
// so at any CONTENT_CX the diagram is internally symmetric and the narrow tiers (node, band, disks)
// look fine wherever they sit. The chip strip does not: at 976 units it is more than twice the
// width of the node above it, so it is the tier that actually sets the visual center of the card.
// An earlier pass ran NODE_W 456 -> CONTENT_CX 628, which left the strip spanning 140..1116, so
// 140 units of margin on the left against 84 on the right. Symmetric about the diagram, visibly
// shoved right on the canvas. Pulling CONTENT_CX to 600 makes the strip 112..1088 and the two
// readings agree, so do not widen NODE_W back without re-checking the strip margins.
//
// POD_W then falls out of NODE_W: 2*POD_W + POD_GAP = NODE_W - 2*NODE_PAD = 368. The floor under
// POD_W is the widest string inside a Pod, the sublabel 'volumeMode: Filesystem', measured at 133
// units, so POD_W 164 keeps ~15 units of air either side of it. POD_GAP takes the remainder.
const LEFT_X = 400;

const NODE_Y = 55, NODE_H = 186;
const NODE_PAD = 16;
const POD_Y = 82, POD_W = 164, POD_H = 126;
const POD_BOTTOM = POD_Y + POD_H;                        // 208
const POD_GAP = 40;

const NODE_X = LEFT_X;
const NODE_W = NODE_PAD * 2 + POD_W * 2 + POD_GAP;       // 400
const CONTENT_CX = NODE_X + NODE_W / 2;                  // 600: canvas center, and every tier uses it

const P1_X = NODE_X + NODE_PAD;                          // 416, the Filesystem column
const P2_X = P1_X + POD_W + POD_GAP;                     // 620, the Block column
const FS_CX = P1_X + POD_W / 2;                          // 498
const BLK_CX = P2_X + POD_W / 2;                         // 702, and (498 + 702) / 2 == CONTENT_CX

const BAND_X = LEFT_X, BAND_Y = 305, BAND_W = NODE_W, BAND_H = 70;
const BAND_TOP = BAND_Y, BAND_BOTTOM = BAND_Y + BAND_H;  // 305 / 375
// The band caption sits between the band and the disk shelf, centered on CONTENT_CX, so it runs
// through the corridor between the two columns. The nearest lanes are the inner ones at 510 and
// 690, which leaves 180 units of clear width, and JetBrains Mono at 11px measures 6.9 units per
// character (measured, not guessed: 'raw, unformatted' renders 110.2 units over 16 characters).
// So a band caption has a hard ceiling of 26 characters. Overrun it and the first and last letters
// sit on a lane arrowhead, which is how two captions shipped before this was written down.
const BAND_LBL_Y = 408;

// The disks are centered under their own column, so every lane in a column is one straight vertical
// run. Column separation is POD_W + POD_GAP = 204, so PV_W has to stay under that or the two disks
// touch. PV_W 176 leaves a 28 unit gap (410..586 and 614..790), enough that they read as two
// objects rather than one wide shelf, and it also keeps the left disk starting at 410, which is the
// same clearance from the narration overlay the wider layout had.
const PV_Y = 442, PV_H = 96, PV_W = 176;
const PV_TOP = PV_Y;                                     // 442
const DISK_LBL_Y = 566;
const CHIPS_Y = 590;

// ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
// the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
// Measured worst cases, in viewBox units:
//   node does  62 + 'no mkfs, no mount'  117 = 179
//   container  62 + 'device /dev/xvda'   110 = 172
//   volumeMode 69 + 'Filesystem'          69 = 138
//   fsGroup    48 + 'not applied'         76 = 124
// So 232 clears the worst pair with ~29 units between name and value.
const CHIP_W = 232;
const CHIP_GAP = 16;
const CHIP_COUNT = 4;                  // volumeMode / node does / container / fsGroup
const CHIPS_W = CHIP_W * CHIP_COUNT + CHIP_GAP * (CHIP_COUNT - 1);   // 976
const CHIP_X = Array.from({ length: CHIP_COUNT }, (_, i) =>
  CONTENT_CX - CHIPS_W / 2 + i * (CHIP_W + CHIP_GAP));

// Each direction of each hop gets its own lane, offset LANE around the column center, so a ball
// never rides an arrow drawn for the opposite direction. Every array below is shared by the static
// pathArrow and the ball that rides it, so the wire and the packet cannot drift apart.
const LANE = 12;
const laneDown = (cx, y1, y2) => [[cx - LANE, y1], [cx - LANE, y2]];
const laneUp   = (cx, y1, y2) => [[cx + LANE, y1], [cx + LANE, y2]];

const W_FS_ASK   = laneDown(FS_CX, POD_BOTTOM, BAND_TOP);     // Pod states what it wants
const W_FS_PUB   = laneUp(FS_CX, BAND_TOP, POD_BOTTOM);       // node service hands it back
const W_FS_STAGE = laneDown(FS_CX, BAND_BOTTOM, PV_TOP);      // stage: mkfs then mount
const W_FS_DEV   = laneUp(FS_CX, PV_TOP, BAND_BOTTOM);        // the disk answers
const W_BLK_ASK   = laneDown(BLK_CX, POD_BOTTOM, BAND_TOP);
const W_BLK_PUB   = laneUp(BLK_CX, BAND_TOP, POD_BOTTOM);
const W_BLK_STAGE = laneDown(BLK_CX, BAND_BOTTOM, PV_TOP);
const W_BLK_DEV   = laneUp(BLK_CX, PV_TOP, BAND_BOTTOM);

function lightBoxAt(boxEl, ctx, delay = 0) {
  if (!boxEl) return;
  if (ctx.reduced || delay <= 0) { boxEl.classList.add('highlight'); return; }
  const a = boxEl.animate([{ opacity: 1 }, { opacity: 1 }], { duration: 1, delay });
  a.onfinish = () => boxEl.classList.add('highlight');
  ctx.register(a);
}

// A tag that rides with the ball on the same path, timing and easing, so the packet visibly carries
// what the step narrates. Not a .scheme-packet, so the tools do not count it. Every ball here is a
// routePacket, which is eased, so the default ease-in-out matches and the tag stays glued to it.
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

// PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the container box inside it
// both live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for
// exactly as long as its ball is in flight. What a Pod must NOT have is a lingering state: no
// .highlight is ever put on the container box, so nothing stays lit once the pulse has decayed.
// (An earlier pass split the shell into its own wrapper to keep the pulse off the container. That
// made the Pod blink around a dead rectangle, which reads as the container being excluded from
// whatever the Pod is doing. The problem was never the pulse, it was the highlight left behind.)
// The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
// descendants only and never the element itself, so pulsing a bare pod() would catch its
// .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
function podBlock({ x, label, sublabel, ctr, ctrSub }) {
  const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel, containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: x + 14, y: POD_Y + 44, w: POD_W - 28, h: 52, label: ctr, sublabel: ctrSub, cat: 'storage' });
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
      'aria-label': 'volumeMode decides what a Pod is handed. Under Filesystem, the default, the CSI node service formats the device with mkfs if it has no filesystem yet, mounts it, and the container finds an ordinary directory at the mountPath given under volumeMounts, where file permissions and the fsGroup ownership walk apply. Under Block nothing is formatted and nothing is mounted: the raw device is published into the container at the devicePath given under volumeDevices, and every filesystem level feature stops applying. The field is immutable and must match on the PersistentVolume and the claim.',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const nodeBox = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'node-1' });

    const podFs = podBlock({
      x: P1_X, label: 'Pod web-0', sublabel: 'volumeMode: Filesystem',
      ctr: 'App', ctrSub: 'volumeMounts',
    });
    const podBlk = podBlock({
      x: P2_X, label: 'Pod db-0', sublabel: 'volumeMode: Block',
      ctr: 'DB', ctrSub: 'volumeDevices',
    });

    const band = box({
      x: BAND_X, y: BAND_Y, w: BAND_W, h: BAND_H,
      label: 'Kubelet and CSI Node Service', sublabel: 'stages the volume, then publishes it', cat: 'storage',
    });

    // Two identical disks. The label carries the size so the card never has to claim in prose that
    // they are the same: the reader can see it.
    const pvFs  = cylinder({ x: FS_CX - PV_W / 2,  y: PV_Y, w: PV_W, h: PV_H, label: 'PV-web 20Gi', cat: 'storage' });
    const pvBlk = cylinder({ x: BLK_CX - PV_W / 2, y: PV_Y, w: PV_W, h: PV_H, label: 'PV-db 20Gi',  cat: 'storage' });
    // The primitive centers the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-center on the face, as storage-volume-model does.
    [pvFs, pvBlk].forEach(cyl => {
      const l = cyl.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', 58);
    });

    const wires = [W_FS_ASK, W_FS_PUB, W_FS_STAGE, W_FS_DEV, W_BLK_ASK, W_BLK_PUB, W_BLK_STAGE, W_BLK_DEV]
      .map(points => pathArrow({ points, dashed: true, dim: true, color: 'storage' }));

    const fsLbl   = text({ class: 'scheme-label code dim', x: FS_CX,  y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const blkLbl  = text({ class: 'scheme-label code dim', x: BLK_CX, y: DISK_LBL_Y, 'text-anchor': 'middle' }, [' ']);
    const bandLbl = text({ class: 'scheme-label code dim', x: CONTENT_CX, y: BAND_LBL_Y, 'text-anchor': 'middle' }, [' ']);

    const modeChip = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'volumeMode', value: 'Filesystem',  cat: 'storage' });
    const nodeChip = valChip({ x: CHIP_X[1], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'node does',  value: 'nothing yet', cat: 'storage' });
    const ctrChip  = valChip({ x: CHIP_X[2], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'container',  value: 'nothing yet', cat: 'storage' });
    const fsgChip  = valChip({ x: CHIP_X[3], y: CHIPS_Y, w: CHIP_W, h: 34, name: 'fsGroup',    value: 'applied',     cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): the node container, then the band and the disks, then the Pods so
    // they sit above their node, then the lanes and their labels above the blocks, then the chip
    // strip, then the packet layer so every ball rides above everything.
    [nodeBox, band, pvFs, pvBlk, podFs.group, podBlk.group].forEach(el => root.appendChild(el));
    wires.forEach(el => root.appendChild(el));
    [fsLbl, blkLbl, bandLbl].forEach(el => root.appendChild(el));
    [modeChip, nodeChip, ctrChip, fsgChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root,
      podFs: podFs.group, podBlk: podBlk.group,
      ctrFs: podFs.innerBox, ctrBlk: podBlk.innerBox,
      band, pvFs, pvBlk,
      modeChip, nodeChip, ctrChip, fsgChip,
      wires: { fs: fsLbl, blk: blkLbl, band: bandLbl },
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
// card comes to display 'mkfs then mount' on the step that is explaining that Block never formats.
function setChips(s, { mode, nodeDoes, container, fsgroup }) {
  setChip(s.refs.modeChip, mode);
  setChip(s.refs.nodeChip, nodeDoes);
  setChip(s.refs.ctrChip, container);
  setChip(s.refs.fsgChip, fsgroup);
}

function clearHL(s) {
  clearHighlights(s, ['band', 'pvFs', 'pvBlk', 'ctrFs', 'ctrBlk',
    'modeChip', 'nodeChip', 'ctrChip', 'fsgChip'], [s.refs.podFs, s.refs.podBlk]);
}

// The Pod states what it wants: the Pod blinks first (it is the actor), then the request drops to
// the node service, which lights on arrival. Returns the arrival time so the next hop can chain.
function askDown(s, ctx, { podEl, points, tag, lead = 0 }) {
  pulsePod(podEl, ctx, lead);
  const pkt = routePacket(s, ctx, points, { delay: lead + BEAT.afterPulse, cat: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead + BEAT.afterPulse });
  lightBoxAt(s.refs.band, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

// The node service acts on the disk. No Pod is involved, so nothing pulses: the ball leaves after
// BEAT.lead so the lit band registers before it departs, and the disk lights on arrival.
function actOnDisk(s, ctx, { points, tag, disk, lead = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay: lead, cat: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead });
  lightBoxAt(disk, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

// The node service hands the volume up into the container. Semantically this is infra reaching a
// Pod, so it takes the down-arrow ordering: the packet flies first and the Pod shell pulses on its
// arrival. The container box is never lit, here or at step entry: see podBlock.
function publishUp(s, ctx, { podEl, points, tag, lead = BEAT.lead }) {
  const pkt = routePacket(s, ctx, points, { delay: lead, cat: 'storage' });
  ridingLabel(s, ctx, tag, points, { delay: lead });
  pulsePod(podEl, ctx, pkt.arrivalMs);
  return pkt.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'Two Pods on one node, two claims for the same 20Gi disk, and a single field telling them apart. volumeMode decides what the workload is actually handed: a formatted directory it can open files in, or the bare block device with nothing on it. Leave the field out and you get Filesystem.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'applied' });
    },
  },
  {
    id: 'fs-claim',
    duration: 2900,
    narration: 'Pod web-0 takes the default. volumeMode Filesystem is what you get whenever the field is absent, and it is what almost every workload wants. The Pod consumes the volume under volumeMounts, naming a mountPath, and what it expects to find at that path is a directory.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'applied' });
      setWire(s, 'fs', 'no filesystem yet');
      if (ctx.reduced) { s.refs.band.classList.add('highlight'); return; }
      askDown(s, ctx, { podEl: s.refs.podFs, points: W_FS_ASK, tag: 'wants a path' });
    },
  },
  {
    id: 'fs-format',
    duration: 2900,
    narration: 'Before anything can be mounted the CSI node service stages the volume. If the device carries no filesystem yet, this is where mkfs runs and creates one, ext4 unless the StorageClass asks for something else. It happens once, on first use, and a disk that already holds data is left alone.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'mkfs then mount', container: 'nothing yet', fsgroup: 'applied' });
      setWire(s, 'fs', 'ext4 created');
      setWire(s, 'band', 'stage: mkfs then mount');
      s.refs.band.classList.add('highlight');
      if (ctx.reduced) { s.refs.pvFs.classList.add('highlight'); return; }
      actOnDisk(s, ctx, { points: W_FS_STAGE, tag: 'mkfs ext4', disk: s.refs.pvFs });
    },
  },
  {
    id: 'fs-mount',
    duration: 3400,
    narration: 'Now the staged filesystem is mounted into the container at /data, and inside the container that is an ordinary directory. Files, directory permissions and the fsGroup ownership walk all apply here, because there is a filesystem for Kubernetes to apply them to.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Filesystem', nodeDoes: 'mounted on node', container: 'directory /data', fsgroup: 'applied' });
      setWire(s, 'fs', 'ext4');
      setWire(s, 'band', 'mount into the Pod');
      s.refs.band.classList.add('highlight');
      s.refs.pvFs.classList.add('highlight');
      if (ctx.reduced) return;
      publishUp(s, ctx, { podEl: s.refs.podFs, points: W_FS_PUB, tag: 'mount at /data' });
    },
  },
  {
    id: 'block-claim',
    duration: 2900,
    narration: 'Pod db-0 asks for the same disk with volumeMode set to Block. Nothing about the storage request changed: same size, same class, same backend. What changed is that the Pod consumes it under volumeDevices with a devicePath, instead of volumeMounts with a mountPath.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Block', nodeDoes: 'nothing yet', container: 'nothing yet', fsgroup: 'not applied' });
      setWire(s, 'blk', 'raw, unformatted');
      if (ctx.reduced) { s.refs.band.classList.add('highlight'); return; }
      askDown(s, ctx, { podEl: s.refs.podBlk, points: W_BLK_ASK, tag: 'wants the device' });
    },
  },
  {
    id: 'block-publish',
    duration: 4200,
    narration: 'No mkfs and no mount. The node service publishes the device itself into the container, so the disk arrives exactly as the backend handed it over, unformatted and untouched. The container finds a raw block device at /dev/xvda, and everything above the first byte is now its own business.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not applied' });
      setWire(s, 'blk', 'raw, unformatted');
      setWire(s, 'band', 'publish the device');
      s.refs.band.classList.add('highlight');
      s.refs.pvBlk.classList.add('highlight');
      if (ctx.reduced) return;
      // Two chained hops: the untouched device rises from the disk to the node service, which passes
      // it straight on into the container without doing anything to it.
      const up = actOnDisk(s, ctx, { points: W_BLK_DEV, tag: 'device as is', disk: s.refs.band });
      publishUp(s, ctx, {
        podEl: s.refs.podBlk, points: W_BLK_PUB,
        tag: 'at /dev/xvda', lead: up + BEAT.afterHop,
      });
    },
  },
  {
    id: 'trade',
    duration: 3800,
    narration: 'That is the trade. A database that manages its own layout gets the device with no filesystem in the way, and in exchange every filesystem level feature stops working: fsGroup has no ownership to walk, subPath has no paths to choose from, and file permissions have no files. volumeMode is also immutable once the claim exists, and a claim asking for Block will never bind to a volume offering Filesystem, so this is a decision you make when you create the claim.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      // The chips still report the Block column, unchanged from the previous step. An earlier pass
      // put 'immutable' in the volumeMode chip, which made the chip contradict its own name: the
      // mode is Block, immutability is a property of the field, not a value it can hold. That fact
      // lives in the narration and the band caption instead.
      setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not applied' });
      setWire(s, 'fs', 'ext4');
      setWire(s, 'blk', 'raw, unformatted');
      setWire(s, 'band', 'set once, must match');
      // The summary step compares the two columns, so BOTH disks light. Static highlight only, and
      // deliberately no motion at all: this is a closing step the reader is meant to sit and read,
      // and the two disks are the comparison, not an event. The usual argument for a flash on a
      // packet-less step (so it does not read as a frozen frame) does not apply to the LAST step,
      // which is supposed to come to rest. A flash here also blinked the disks a beat after the
      // narration had already moved on to fsGroup and subPath, which points at nothing.
      s.refs.pvFs.classList.add('highlight');
      s.refs.pvBlk.classList.add('highlight');
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
