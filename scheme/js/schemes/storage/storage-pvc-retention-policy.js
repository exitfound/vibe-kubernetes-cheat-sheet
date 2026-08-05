import { svg, g, text } from '../../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel, laneOf, OPACITY } from './storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-pvc-retention-policy


const CX = 600;

const SRC_W = 340, SRC_H = 64, SRC_X = CX - SRC_W / 2, SRC_Y = 52;   // 430..770
const SRC_BOTTOM = SRC_Y + SRC_H;                                   // 116

// The three ordinal rows. Row centres are the y midline of every block in the row, so the ownership
// and reclaim runs stay dead level and the spine segments sit in the gaps between the stacked claims.
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

// Straight axis runs, every array shared by the static wire and the ball that rides it, arrowheads at
// the RECEIVER: the governance into each claim top, the reclaim into the claim then into the disk.
const spineSeg = i => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, ROW_CY[i] - PVC_H / 2]];
const ownPts = i => [[POD_RIGHT, ROW_CY[i]], [PVC_X, ROW_CY[i]]];        // Pod -> claim
const reclaimPts = i => [[PVC_RIGHT, ROW_CY[i]], [PV_X, ROW_CY[i]]];     // claim -> disk

// Fades a claim, disk or lane away exactly when the reclaim that removes it reaches it.
// It also takes back the highlight the ball left on the block: a reclaimed block cannot still be
// the thing the step points at.
function vanishAt(el, ctx, delay = 0, to = OPACITY.terminated) {
  if (!el) return;
  const dark = () => el.classList.remove('highlight');
  if (ctx.reduced || delay <= 0) { el.style.opacity = String(to); dark(); return; }
  const a = el.animate([{ opacity: 1 }, { opacity: to }], { duration: FADE.out, delay, fill: 'forwards', easing: 'ease-in' });
  a.onfinish = dark;
  ctx.register(a);
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage', dy: -16 });

function podBlock({ cy, label }) {
  const y = cy - POD_H / 2;
  const shell = pod({ x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  const innerBox = box({ x: POD_X + 16, y: cy - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'read/write', role: 'storage' });
  const group = g({});
  group.appendChild(shell);
  group.appendChild(innerBox);
  return { group, innerBox };
}

const lane = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });

class Scene {
  constructor(host) { this.host = host; this.refs = {}; this.build(); }

  build() {
    this.host.replaceChildren();
    this.refs = {};
    const root = svg({
      class: 'diagram',
      viewBox: '0 0 1200 640',
      preserveAspectRatio: 'xMidYMid meet',
      'aria-label': 'StatefulSet persistentVolumeClaimRetentionPolicy: two independent knobs, whenScaled for what happens to a claim when a replica is scaled away and whenDeleted for when the whole StatefulSet is removed, each set to Retain or Delete, where Retain leaves the disk in place and silently leaks storage and Delete reclaims it',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const src = box({
      x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H,
      label: 'StatefulSet web', sublabel: 'persistentVolumeClaimRetentionPolicy', role: 'storage',
    });

    const pods = ROW_CY.map((cy, i) => podBlock({ cy, label: `web-${i}` }));
    const pvcs = ROW_CY.map((cy, i) => box({ x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'Bound', role: 'storage' }));
    const pvs = ROW_CY.map((cy, i) => {
      const c = cylinder({ x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `pv-web-${i}`, role: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', PV_H / 2 + 10);
      return c;
    });

    // The central governance spine (hidden until the policy step, exactly like the sibling's mint
    // trunk), and the two horizontal lanes per row that carry the reclaim ball. All dashed, arrowed.
    const spineW = ROW_CY.map((_, i) => lane(spineSeg(i)));
    spineW.forEach(w => { w.style.opacity = '0'; });
    const ownW = ROW_CY.map((_, i) => lane(ownPts(i)));
    const reclaimW = ROW_CY.map((_, i) => lane(reclaimPts(i)));

    // Per-row verdict, parked in the free space to the right of the disk (the L-shaped safe zone),
    // filled per step with retained / reclaimed.
    const verdictLbls = ROW_CY.map(cy => text({ class: 'scheme-label code dim', x: PV_RIGHT + 20, y: cy + 5, 'text-anchor': 'start' }, [' ']));

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const replChip = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'replicas',    value: '3',      role: 'storage' });
    const wsChip   = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'whenScaled',  value: 'Retain', role: 'storage' });
    const wdChip   = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'whenDeleted', value: 'Retain', role: 'storage' });
    const diskChip = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'disks',       value: '3 kept', role: 'storage' });

    const packetLayer = g({ id: 'packetLayer' });

    // Z-order (bottom -> top): blocks, then the spine and lanes and verdict captions above them, then
    // the chip strip, then the packet layer so every ball rides above everything.
    [src, ...pvs, ...pvcs, ...pods.map(p => p.group)].forEach(el => root.appendChild(el));
    [...spineW, ...ownW, ...reclaimW, ...verdictLbls].forEach(el => root.appendChild(el));
    [replChip, wsChip, wdChip, diskChip].forEach(c => root.appendChild(c));
    root.appendChild(packetLayer);

    this.host.appendChild(root);
    this.refs = {
      svg: root, src,
      p0: pods[0].group, p1: pods[1].group, p2: pods[2].group,
      v0: pvcs[0], v1: pvcs[1], v2: pvcs[2],
      d0: pvs[0], d1: pvs[1], d2: pvs[2],
      spineW, ownW, reclaimW,
      replChip, wsChip, wdChip, diskChip,
      wires: { g0: verdictLbls[0], g1: verdictLbls[1], g2: verdictLbls[2] },
      packetLayer,
    };
  }

  reset() { this.build(); }
}

function setChip(chip, val) {
  const changed = chip && chip.valueText && chip.valueText.textContent !== String(val);
  setVal(chip, val);
  if (changed) chip.classList.add('highlight');
}

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report the old knob setting on the step that just changed it.
function setChips(s, { repl, ws, wd, disks }) {
  setChip(s.refs.replChip, repl);
  setChip(s.refs.wsChip, ws);
  setChip(s.refs.wdChip, wd);
  setChip(s.refs.diskChip, disks);
}

// A lane is only as present as the fainter of the two things it joins, so it takes the min of its
// endpoints. Deriving it from one end alone is how an ownership lane came to leave a Pod that is a
// ghost at 0.12 and arrive at its claim on full strength.

function setStage(s, { pods = [1, 1, 1], claims = [1, 1, 1], disks = [1, 1, 1], govern = false } = {}) {
  [s.refs.p0, s.refs.p1, s.refs.p2].forEach((p, i) => { p.style.opacity = String(pods[i]); });
  [s.refs.v0, s.refs.v1, s.refs.v2].forEach((v, i) => { v.style.opacity = String(claims[i]); });
  [s.refs.d0, s.refs.d1, s.refs.d2].forEach((d, i) => { d.style.opacity = String(disks[i]); });
  s.refs.ownW.forEach((o, i) => { o.style.opacity = laneOf(pods[i], claims[i]); });
  s.refs.reclaimW.forEach((r, i) => { r.style.opacity = laneOf(claims[i], disks[i]); });
  // The policy box is drawn on every step, so the governance tap only follows its claim.
  s.refs.spineW.forEach((t, i) => { t.style.opacity = govern ? String(claims[i]) : '0'; });
}

function setClaimLabels(s, labels) {
  [s.refs.v0, s.refs.v1, s.refs.v2].forEach((v, i) => setBoxSublabel(v, labels[i]));
}

function clearHL(s) {
  clearHighlights(s, ['src', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2',
    'replChip', 'wsChip', 'wdChip', 'diskChip'], [s.refs.p0, s.refs.p1, s.refs.p2]);
}

const BOUND = ['Bound', 'Bound', 'Bound'];

// A Pod being removed: it pulses once (the last thing it does), then fades to a ghost. The pulse is
// the only Pod motion on the card and marks the removal. Returns when the Pod has fully faded.
function removePod(s, ctx, i, { delay = 0 } = {}) {
  pulsePod(s.refs[`p${i}`], ctx, delay);
  const fadeAt = delay + BEAT.afterPulse;
  // The ownership lane leaves this Pod, so it fades on the same beat: the claim it points at survives
  // the removal, the ownership does not.
  [s.refs[`p${i}`], s.refs.ownW[i]].forEach(el => ctx.register(
    el.animate([{ opacity: 1 }, { opacity: OPACITY.terminated }], { duration: FADE.out, delay: fadeAt, fill: 'forwards', easing: 'ease-in' })));
  return fadeAt + FADE.out;
}

// How long a reclaimed block stays lit after the ball lands on it, before it fades: long enough to
// read the highlight, so the ball visibly REACHES the block before it is taken.
const LIGHT_HOLD = 260;

function reclaimRow(s, ctx, i, { delay = 0, tag = null } = {}) {
  const h1 = routePacket(s, ctx, ownPts(i), { delay, role: 'storage' });
  if (tag) ridingLabel(s, ctx, tag, ownPts(i), { delay });
  lightBoxAt(s.refs[`v${i}`], ctx, h1.arrivalMs);
  vanishAt(s.refs[`v${i}`], ctx, h1.arrivalMs + LIGHT_HOLD);
  vanishAt(s.refs.ownW[i], ctx, h1.arrivalMs + LIGHT_HOLD);
  const h2 = routePacket(s, ctx, reclaimPts(i), { delay: h1.arrivalMs + BEAT.afterHop, role: 'storage' });
  lightBoxAt(s.refs[`d${i}`], ctx, h2.arrivalMs);
  vanishAt(s.refs[`d${i}`], ctx, h2.arrivalMs + LIGHT_HOLD);
  vanishAt(s.refs.reclaimW[i], ctx, h2.arrivalMs + LIGHT_HOLD);
  return h2.arrivalMs + LIGHT_HOLD + FADE.out;
}

const STEPS = [
  {
    id: 'idle',
    duration: 1500,
    enter(s) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', ws: 'Retain', wd: 'Retain', disks: '3 kept' });
      setStage(s);
      setClaimLabels(s, BOUND);
    },
  },
  {
    id: 'policy',
    duration: 3900,
    narration: 'One policy governs all three claims. It has two independent knobs: whenScaled decides the fate of a claim when its replica is scaled away, and whenDeleted decides it when the entire StatefulSet is deleted. Each is set to Retain or Delete on its own.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '3', ws: 'Retain', wd: 'Retain', disks: '3 kept' });
      setStage(s, { govern: true });
      setClaimLabels(s, BOUND);
      // The policy is the source of the governance signal, so it lights at step entry.
      s.refs.src.classList.add('highlight');
      if (ctx.reduced) {
        [s.refs.v0, s.refs.v1, s.refs.v2].forEach(v => v.classList.add('highlight'));
        return;
      }
      // The one policy reaches every claim: a governance ball cascades down the spine and each claim
      // lights as it lands, exactly as the sibling mints each claim down the same spine.
      let at = BEAT.lead;
      ROW_CY.forEach((_, i) => {
        const gov = routePacket(s, ctx, spineSeg(i), { delay: at, role: 'storage' });
        lightBoxAt(s.refs[`v${i}`], ctx, gov.arrivalMs);
        at = gov.arrivalMs + BEAT.afterHop;
      });
    },
  },
  {
    id: 'scaled-retain',
    duration: 3000,
    narration: 'Scale down to two with whenScaled set to Retain. Pod web-2 is removed, but claim data-web-2 stays and pv-web-2 keeps its data. This is what an unset field gives you and it is safe, yet every scale-down that is never cleaned up leaves a disk behind that still costs money.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', ws: 'Retain', wd: 'Retain', disks: '3 kept, 1 leaks' });
      setStage(s, { pods: [1, 1, OPACITY.terminated] });
      setClaimLabels(s, ['Bound', 'Bound', 'kept, no Pod']);
      setWire(s, 'g2', 'retained');
      if (ctx.reduced) return;
      // web-2 is scaled away, the claim and disk simply stay behind. The only motion is the Pod fade.
      setStage(s, { pods: [1, 1, 1] });
      removePod(s, ctx, 2, { delay: BEAT.afterHop });
    },
  },
  {
    id: 'scaled-delete',
    duration: 4600,
    narration: 'Flip whenScaled to Delete and scale down again. Now removing web-2 also removes claim data-web-2, and its disk is reclaimed by the storage backend. No orphan is left behind, which is what most people actually want, at the cost of that data being gone for good.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '2', ws: 'Delete', wd: 'Retain', disks: '2 kept' });
      setStage(s, { pods: [1, 1, OPACITY.terminated], claims: [1, 1, OPACITY.terminated], disks: [1, 1, OPACITY.terminated] });
      setClaimLabels(s, BOUND);
      setWire(s, 'g2', 'reclaimed');
      if (ctx.reduced) return;
      // web-2 pulses and is scaled away, then whenScaled=Delete sweeps its claim and disk in one run.
      setStage(s, { pods: [1, 1, 1], claims: [1, 1, 1], disks: [1, 1, 1] });
      const gone = removePod(s, ctx, 2, { delay: BEAT.afterHop });
      reclaimRow(s, ctx, 2, { delay: gone + BEAT.afterHop, tag: 'delete data-web-2' });
    },
  },
  {
    id: 'deleted-retain',
    duration: 3000,
    narration: 'Now consider deleting the whole StatefulSet with whenDeleted set to Retain. All three Pods vanish, but every claim and every disk is left standing. The data outlives the workload, which is exactly what you want before a risky upgrade or a rename.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '0', ws: 'Delete', wd: 'Retain', disks: '3 kept' });
      setStage(s, { pods: [OPACITY.terminated, OPACITY.terminated, OPACITY.terminated] });
      setClaimLabels(s, ['kept, no owner', 'kept, no owner', 'kept, no owner']);
      ROW_CY.forEach((_, i) => setWire(s, `g${i}`, 'retained'));
      if (ctx.reduced) return;
      // The three Pods go together, on one beat: the StatefulSet was deleted once, not three times.
      setStage(s, { pods: [1, 1, 1] });
      ROW_CY.forEach((_, i) => removePod(s, ctx, i, { delay: BEAT.afterHop }));
    },
  },
  {
    id: 'deleted-delete',
    duration: 4600,
    narration: 'With whenDeleted set to Delete, removing the StatefulSet garbage-collects all three claims and every disk goes with them. This is the clean teardown, and the reason Retain on both knobs is the conservative default: deleting data is irreversible, so Kubernetes will not do it unless you ask.',
    enter(s, ctx) {
      s.refs.packetLayer.replaceChildren();
      clearHL(s);
      clearWires(s);
      setChips(s, { repl: '0', ws: 'Delete', wd: 'Delete', disks: '0 kept' });
      setStage(s, { pods: [OPACITY.terminated, OPACITY.terminated, OPACITY.terminated], claims: [OPACITY.terminated, OPACITY.terminated, OPACITY.terminated], disks: [OPACITY.terminated, OPACITY.terminated, OPACITY.terminated] });
      setClaimLabels(s, BOUND);
      ROW_CY.forEach((_, i) => setWire(s, `g${i}`, 'reclaimed'));
      if (ctx.reduced) return;
      // The whole set pulses and is deleted (all Pods on one beat), then whenDeleted=Delete sweeps
      // every row together once the Pods are gone.
      setStage(s, { pods: [1, 1, 1], claims: [1, 1, 1], disks: [1, 1, 1] });
      const gone = removePod(s, ctx, 0, { delay: BEAT.afterHop });
      removePod(s, ctx, 1, { delay: BEAT.afterHop });
      removePod(s, ctx, 2, { delay: BEAT.afterHop });
      ROW_CY.forEach((_, i) => reclaimRow(s, ctx, i, { delay: gone + BEAT.afterHop }));
    },
  },
];

export const init = makeInit(Scene, STEPS, { posterFirst: true });
