import { svg, g, text, path } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow, animateAlong } from '../lib/primitives.js';
import {
  valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, routeDur,
  makeInit, clearHighlights, clearWires, setWire, BEAT, FADE,
} from '../lib/storage-kit.js';

// StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, bound, retained
// and rebound. The layout is THREE HORIZONTAL ORDINAL ROWS, one per replica, each a straight triad
//
//        Pod web-N  ->  PVC data-web-N  <-  pv-web-N
//        (consumer)        (the claim)       (the disk)
//
// The claim is the subject of the card, so it sits in the CENTRE of every row on the canvas spine
// x=CX, with its consumer Pod flanking it on the left and its backing disk flanking it on the right,
// mirrored about the spine. The three claims stack into one central column, and the StatefulSet mints
// them straight DOWN that column. Every connector is a straight axis run (vertical mint, horizontal
// mount and bind), so no ball ever travels a bent corridor, and the whole picture is symmetric by
// construction: COL centres are POD_CX, CX, PV_CX = CX - FLANK, CX, CX + FLANK.
//
// ---- Why this shape ----
// The earlier layout stacked one column PER ORDINAL and fanned the mints in through bent side
// corridors, so three claims sat side by side and the mint routes entered each claim from the corner.
// Turning each ordinal on its side makes the claim the centred hub of its own row, the mint a single
// vertical spine, and the mount / bind pure horizontal runs. Identity (Pod, claim and disk are one
// object under one name data-web-N) is now read ACROSS a row rather than DOWN a column, and it is
// carried by the shared name in the three block labels plus the row alignment.
//
// ---- Narration overlay ----
// Measured (tools/overlay-measure.mjs) the overlay covers only the top-left band: right edge ~291,
// bottom ~143 in viewBox units for these narrations. The source box spans x 430..770 (all clear of
// the x<=397 band) and the first Pod row starts at y=209, below the overlay. A much longer narration
// than the ones below would invalidate this.
//
// PULSE MODEL: only the Pods pulse, and each is a wrapping g so pulsePod reaches both the shell and
// the inner box. The PVCs, the disks and the source box are infrastructure: they light via .highlight
// on packet arrival (lightBoxAt) and never pulse.
//
// OPACITY: the three replica Pods are declared from the start, so they sit at FULL opacity the whole
// way through and never dim between steps. Mounting is shown by the pulse plus the container lighting,
// not by fading a Pod up from a dim resting state (that up-and-down flicker on every step read as
// noise). The ONLY Pods that fade are the ones genuinely removed: web-1 blinks out and back on the
// rebind step, and web-2 fades to a ghost on scale-down. A fade here always means a Pod left.
//
// WIRES: the central mint spine drops straight down x=CX, relaying the deterministic name into each
// claim in turn (data-web-0, then -1, then -2). The two horizontal lanes per row point INWARD toward
// the consumer: the bind lane carries the disk to the claim (pv -> PVC), the mount lane carries the
// claim up into the Pod (PVC -> Pod). Every static wire and its ball share ONE points array so they
// cannot drift, and every endpoint is a block edge midpoint.
const CX = 600;

const SRC_W = 340, SRC_H = 64, SRC_X = CX - SRC_W / 2, SRC_Y = 52;   // 430..770
const SRC_BOTTOM = SRC_Y + SRC_H;                                   // 116

// The three ordinal rows. Row centres are the y midline of every block in the row, so mount and bind
// lanes run dead level and the mint spine segments sit in the gaps between the stacked claims.
const ROW_CY = [245, 385, 525];

const POD_W = 150, POD_H = 100;
const PVC_W = 200, PVC_H = 56;
const PV_W = 150, PV_H = 76;

// Flank offset: Pod centre and disk centre are mirror images about the spine, so the row is symmetric.
const FLANK = 295;
const POD_CX = CX - FLANK, PV_CX = CX + FLANK;                      // 305 / 895
const POD_X = POD_CX - POD_W / 2, POD_RIGHT = POD_X + POD_W;        // 230 / 380
const PVC_X = CX - PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;            // 500 / 700
const PV_X = PV_CX - PV_W / 2, PV_RIGHT = PV_X + PV_W;              // 820 / 970

const CHIPS_Y = 600;

// Straight axis runs. Every array is shared by the static pathArrow and its ball, and the arrowheads
// point at the RECEIVER: the mint into the claim top, the disk into the claim, the claim into the Pod.
const trunkSeg = i => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, ROW_CY[i] - PVC_H / 2]];
const bindPts = i => [[PV_X, ROW_CY[i]], [PVC_RIGHT, ROW_CY[i]]];     // pv -> PVC (into claim right edge)
const mountPts = i => [[PVC_X, ROW_CY[i]], [POD_RIGHT, ROW_CY[i]]];   // PVC -> Pod (into Pod right edge)

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

// A claim materialises when the mint that creates it lands, so no arrowhead is ever aimed at nothing.
const LAND_MS = 500;
function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// A tag that rides ALONG with the ball on the same path, timing and easing, so the packet visibly
// carries what the step narrates. Balls are routePacket (eased), so the label defaults to the same
// ease-in-out and the same routeDur, or it would drift off the ball mid-flight. dx nudges the tag off
// the vertical mint spine so the name does not print straight over the dashed line.
function ridingLabel(s, ctx, txt, points, { delay = 0, dur = null, easing = 'ease-in-out', dy = -16, dx = 0 } = {}) {
  if (ctx.reduced) return;
  const d = dur == null ? routeDur(points) : dur;
  const lbl = text({ class: 'scheme-box-sublabel', x: dx, y: dy, 'text-anchor': 'middle', 'data-cat': 'storage' }, [txt]);
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
function podBlock({ cy, label }) {
  const y = cy - POD_H / 2;
  // A full Pod window like the rest of the storage cards: the ordinal name on top, a real container
  // box (label plus what it does to the volume) in the middle, and the mount path as the Pod sublabel
  // at the bottom. The shell fill is knocked back so the inner container reads as nested inside it.
  const shell = pod({ x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, cat: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // The container box sits on the Pod centre line (h/2), balanced between the name on top and the
  // mount-path sublabel at the bottom, rather than pushed down against the sublabel.
  const innerBox = box({ x: POD_X + 16, y: cy - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'read/write', cat: 'storage' });
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
      'aria-label': 'StatefulSet volumeClaimTemplates: unlike a Deployment which hands every replica the one shared claim, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated rebinds the very same disk, the claims are retained when a Pod is removed, and scaling down leaves them behind',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const src = box({
      x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H,
      label: 'StatefulSet Web', sublabel: 'replicas: 3, volumeClaimTemplate: data', cat: 'storage',
    });

    const pods = ROW_CY.map((cy, i) => podBlock({ cy, label: `web-${i}` }));
    const pvcs = ROW_CY.map((cy, i) => {
      const b = box({ x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'not created yet', cat: 'storage' });
      b.style.opacity = '0.4';   // a placeholder until the template mints it, never a hole
      return b;
    });
    const pvs = ROW_CY.map((cy, i) => {
      const c = cylinder({ x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `pv-web-${i}`, cat: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', PV_H / 2 + 10);
      return c;
    });

    // Straight connectors. The mint spine drops down the centre through the stacked claims. The bind
    // and mount lanes run level into each claim and Pod. Lanes are permanent dim structure, the mint
    // spine appears once the template stamps.
    const trunkW = ROW_CY.map((_, i) => lane(trunkSeg(i)));
    trunkW.forEach(w => { w.style.opacity = '0'; });
    const bindW = ROW_CY.map((_, i) => lane(bindPts(i)));
    const mountW = ROW_CY.map((_, i) => lane(mountPts(i)));

    // Per-row annotation, parked in the free space to the right of the disk (the L-shaped safe zone),
    // filled only on the rebind and scale steps.
    const nameLbls = ROW_CY.map(cy => text({ class: 'scheme-label code dim', x: PV_RIGHT + 20, y: cy + 5, 'text-anchor': 'start' }, [' ']));

    // CHIP_W 232 is the storage family default. Worst case here is 'on delete' + 'kept, leaks' at 20
    // characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 20 * 6.89 + 24 of
    // padding is 162 against the 232 available.
    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const replChip = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'replicas',  value: '3',          cat: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVCs',      value: 'none yet',   cat: 'storage' });
    const nameChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'naming',    value: 'data-web-N', cat: 'storage' });
    const retChip  = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'on delete', value: 'retained',   cat: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the lanes and mint spine and captions above them, then the
    // chip strip, then the packet layer so every ball rides above everything.
    [src, ...pvs, ...pvcs, ...pods.map(p => p.group)].forEach(el => root.appendChild(el));
    [...trunkW, ...bindW, ...mountW, ...nameLbls].forEach(el => root.appendChild(el));
    [replChip, pvcChip, nameChip, retChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, src,
      p0: pods[0].group, p1: pods[1].group, p2: pods[2].group,
      b0: pods[0].innerBox, b1: pods[1].innerBox, b2: pods[2].innerBox,
      v0: pvcs[0], v1: pvcs[1], v2: pvcs[2],
      d0: pvs[0], d1: pvs[1], d2: pvs[2],
      trunkW, bindW, mountW,
      replChip, pvcChip, nameChip, retChip,
      wires: { n0: nameLbls[0], n1: nameLbls[1], n2: nameLbls[2] },
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
// card comes to report a stale claim count on the step that just changed it.
function setChips(s, { repl, pvcs, naming, ret }) {
  setChip(s.refs.replChip, repl);
  setChip(s.refs.pvcChip, pvcs);
  setChip(s.refs.nameChip, naming);
  setChip(s.refs.retChip, ret);
}

// Pins the visibility of EVERY element that is born or removed mid-story, exactly as setChips pins
// every chip, so a step can never silently inherit a claim or a Pod from the step before it. The
// Pods rest at full opacity (see the OPACITY note in the header): only a genuine delete fades one.
const POD_PRESENT = 1;
// A claim that has not been minted yet is drawn at CLAIM_PLACEHOLDER rather than hidden: removing it
// leaves a claim-sized hole in the row that reads as a rendering fault, and it leaves the mount
// arrowhead aimed at nothing for the whole flight.
const CLAIM_PLACEHOLDER = 0.4;
function setStage(s, { pods = [POD_PRESENT, POD_PRESENT, POD_PRESENT], claims = [CLAIM_PLACEHOLDER, CLAIM_PLACEHOLDER, CLAIM_PLACEHOLDER], mint = false } = {}) {
  [s.refs.p0, s.refs.p1, s.refs.p2].forEach((p, i) => { p.style.opacity = String(pods[i]); });
  [s.refs.v0, s.refs.v1, s.refs.v2].forEach((v, i) => { v.style.opacity = String(claims[i]); });
  s.refs.trunkW.forEach(w => { w.style.opacity = mint ? '1' : '0'; });
}

function clearHL(s) {
  clearHighlights(s, ['src', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2', 'b0', 'b1', 'b2',
    'replChip', 'pvcChip', 'nameChip', 'retChip'], [s.refs.p0, s.refs.p1, s.refs.p2]);
  // Reset every Pod sublabel to its resting mount path so the rebind step's 'deleted' / 'recreated'
  // text cannot leak into a later step (forward steps mutate one scene, they do not rebuild).
  [s.refs.p0, s.refs.p1, s.refs.p2].forEach(p => setPodSublabel(p, 'mounts /data'));
}

// One row mounting its own disk: the ball crosses the bind lane from the disk into the claim, then the
// mount lane from the claim up into the Pod, and the Pod pulses when the mount actually reaches it.
// Down-arrow ordering, so the ball leads and the pulse lands on arrival, never at step entry.
function mountRow(s, ctx, i, { delay = 0, tag = null } = {}) {
  const low = routePacket(s, ctx, bindPts(i), { delay, cat: 'storage' });
  const high = routePacket(s, ctx, mountPts(i), { delay: low.arrivalMs + BEAT.afterHop, cat: 'storage' });
  if (tag) ridingLabel(s, ctx, tag, mountPts(i), { delay: low.arrivalMs + BEAT.afterHop });
  lightBoxAt(s.refs[`v${i}`], ctx, low.arrivalMs);
  // The Pod is already present at full opacity, so the mount only pulses it and lights its container
  // when the ball lands. No opacity ramp, which is what used to make the Pods flicker step to step.
  pulsePod(s.refs[`p${i}`], ctx, high.arrivalMs);
  lightBoxAt(s.refs[`b${i}`], ctx, high.arrivalMs);
  return high.arrivalMs;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    narration: 'A StatefulSet named web wants three replicas, and it carries a volumeClaimTemplate called data. A Deployment would hand every one of its replicas the single same claim, so all three would fight over one disk. A StatefulSet does the opposite, and the template is how.',
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: 'none yet', naming: 'data-web-N', ret: 'retained' });
      setStage(s);
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => setBoxSublabel(v, 'not created yet'));
    },
  },
  {
    id: 'mint',
    duration: 3900,
    narration: 'For each ordinal the template stamps out one claim, and the name is not random. It is the template name joined to the Pod name: data-web-0, data-web-1, data-web-2. Three separate PVC objects now exist, each asking for its own 1Gi of gp3.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 minted', naming: 'data-web-N', ret: 'retained' });
      setStage(s, { claims: [1, 1, 1], mint: true });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => setBoxSublabel(v, 'Pending'));
      // The source box is where every mint departs from, so it is lit at step entry. The claims are
      // receivers and earn their highlight on arrival.
      s.refs.src.classList.add('highlight');
      if (ctx.reduced) {
        [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight'));
        return;
      }
      setStage(s, { mint: true });
      // The name relays straight down the spine, materialising each claim in turn: data-web-0, then
      // -1, then -2, exactly as the narration lists them. Each hop starts once the one above lands.
      let at = BEAT.lead;
      ROW_CY.forEach((_, i) => {
        const mint = routePacket(s, ctx, trunkSeg(i), { delay: at, cat: 'storage' });
        ridingLabel(s, ctx, `data-web-${i}`, trunkSeg(i), { delay: at, dy: -22, dx: 44 });
        revealAt(s.refs[`v${i}`], ctx, mint.arrivalMs, CLAIM_PLACEHOLDER);
        lightBoxAt(s.refs[`v${i}`], ctx, mint.arrivalMs);
        at = mint.arrivalMs + BEAT.afterHop;
      });
    },
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Each claim is bound to its own PersistentVolume, so ordinal 0 gets pv-web-0 and never touches ordinal 1. The claim is the durable name the workload holds, and the disk behind it is what stores the bytes. Nothing is shared between the ordinals.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 bound', naming: 'data-web-N', ret: 'retained' });
      setStage(s, { claims: [1, 1, 1] });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => setBoxSublabel(v, 'Bound'));
      // The disks are where the bind ball departs, so they light at entry. Each claim is the receiver,
      // so it lights only once its ball lands (below), not at step entry.
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      if (ctx.reduced) { [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight')); return; }
      // Each disk binds to its claim, straight along the bind lane. The three binds are independent
      // and simultaneous, so they leave together on one beat rather than a stagger.
      ROW_CY.forEach((_, i) => {
        const b = routePacket(s, ctx, bindPts(i), { delay: BEAT.lead, cat: 'storage' });
        ridingLabel(s, ctx, 'bound', bindPts(i), { delay: BEAT.lead });
        lightBoxAt(s.refs[`v${i}`], ctx, b.arrivalMs);
      });
    },
  },
  {
    id: 'mount',
    duration: 3800,
    narration: 'Now each Pod starts and mounts the volume behind its own claim. web-0 reads and writes data-web-0 alone, web-1 reads data-web-1, and so on. The bind is exclusive, so no two Pods ever land on the same disk.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 in use', naming: 'data-web-N', ret: 'retained' });
      setStage(s, { pods: [1, 1, 1], claims: [1, 1, 1] });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => setBoxSublabel(v, 'Bound'));
      // The disks are the source of the read, so they light at entry. Each claim and container light
      // only as the mount ball reaches them (mountRow uses lightBoxAt on arrival).
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      if (ctx.reduced) {
        [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight'));
        [s.refs.b0, s.refs.b1, s.refs.b2].forEach(b => b.classList.add('highlight'));
        return;
      }
      ROW_CY.forEach((_, i) => mountRow(s, ctx, i, { delay: BEAT.lead }));
    },
  },
  {
    id: 'rebind',
    duration: 4900,
    narration: 'Delete web-1 and the StatefulSet recreates it, perhaps on another node. The claim data-web-1 is not deleted with the Pod, it stays Bound to pv-web-1. Because the new Pod derives the exact same claim name from its ordinal, it rebinds the very same disk and sees the very same data.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', pvcs: '3 in use', naming: 'data-web-1 kept', ret: 'retained' });
      setStage(s, { pods: [1, 1, 1], claims: [1, 1, 1] });
      [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => setBoxSublabel(v, 'Bound'));
      [s.refs.d0, s.refs.d1, s.refs.d2].forEach(d => d.classList.add('highlight'));
      setWire(s, 'n1', 'same name, same disk');
      // The Pod keeps its ordinal name web-1 (that is the whole point: same name rebinds the same
      // disk), so the lifecycle is narrated in the SUBLABEL instead. Final resting state: recreated.
      setPodSublabel(s.refs.p1, 'recreated');
      if (ctx.reduced) { s.refs.v1.classList.add('highlight'); s.refs.b1.classList.add('highlight'); return; }
      // web-1 is deleted, then recreated. Deliberately slower than the FADE tokens, with a real HOLD
      // at the ghost, so the delete and the recreate read as two distinct beats and not one quick
      // blink: it fades out reading 'deleted', stays gone for a moment, then fades back reading
      // 'recreated'. The claim and its disk stay at full opacity throughout: not being deleted is the
      // whole point of the step.
      const GONE = 0.15, OUT = 850, HOLD = 550, IN = 800;
      setPodSublabel(s.refs.p1, 'deleted');
      ctx.register(s.refs.p1.animate([{ opacity: 1 }, { opacity: GONE }], { duration: OUT, fill: 'forwards', easing: 'ease-in' }));
      const reborn = OUT + HOLD;
      const fadeIn = s.refs.p1.animate([{ opacity: GONE }, { opacity: 1 }], { duration: IN, delay: reborn, fill: 'forwards', easing: 'ease-out' });
      fadeIn.onfinish = () => setPodSublabel(s.refs.p1, 'recreated');
      ctx.register(fadeIn);
      mountRow(s, ctx, 1, { delay: reborn + IN, tag: 'data-web-1 rebound' });
    },
  },
  {
    id: 'scale',
    duration: 3000,
    narration: 'Scale web down to two and Pod web-2 is removed, but claim data-web-2 is left behind on purpose. The default retention keeps it, so its disk is not reclaimed and its data is safe. Scale back up and web-2 reattaches the same claim, which is also why a forgotten scale-down silently leaks disks.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', pvcs: '3 (1 idle)', naming: 'data-web-N', ret: 'kept, leaks' });
      setStage(s, { pods: [1, 1, 1], claims: [1, 1, 1] });
      setBoxSublabel(s.refs.v0, 'Bound');
      setBoxSublabel(s.refs.v1, 'Bound');
      setBoxSublabel(s.refs.v2, 'kept, no Pod');
      s.refs.d0.classList.add('highlight');
      s.refs.d1.classList.add('highlight');
      s.refs.v2.classList.add('highlight');
      s.refs.d2.classList.add('highlight');
      setWire(s, 'n2', 'retained');
      // web-2 leaves, but data-web-2 and pv-web-2 stay put: the claim is the thing that persists. The
      // ghost opacity is pinned statically so a mid-step cancel and reduced motion land on it too.
      s.refs.p2.style.opacity = '0.12';
      if (ctx.reduced) return;
      s.refs.p2.style.opacity = '1';
      ctx.register(s.refs.p2.animate([{ opacity: 1 }, { opacity: 0.12 }], { duration: FADE.out, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-in' }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
