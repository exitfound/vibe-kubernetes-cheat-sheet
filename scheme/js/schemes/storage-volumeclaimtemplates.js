import { svg, g, text } from '../lib/svg.js';
import { arrowDefs, box, pod, cylinder, pathArrow } from '../lib/primitives.js';
import { valChip, setVal, setBoxSublabel, setPodSublabel, pulsePod, routePacket, makeInit, clearHighlights, clearWires, setWire, BEAT, FADE, lightBoxAt, makeRidingLabel } from '../lib/storage-kit.js';
// Design notes for this card: scheme/docs/CARDS.md#storage-volumeclaimtemplates


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

// A claim materialises when the mint that creates it lands, so no arrowhead is ever aimed at nothing.
const LAND_MS = 500;
function revealAt(el, ctx, delay = 0, from = 0) {
  if (!el) return;
  if (ctx.reduced || delay <= 0) { el.style.opacity = '1'; return; }
  el.style.opacity = String(from);
  ctx.register(el.animate([{ opacity: from }, { opacity: 1 }], { duration: LAND_MS, delay, fill: 'forwards', easing: 'ease-out' }));
}

// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.
const ridingLabel = makeRidingLabel({ role: 'storage', dy: -16 });

function podBlock({ cy, label }) {
  const y = cy - POD_H / 2;
  const shell = pod({ x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, role: 'storage' });
  const shellRect = shell.querySelector('.scheme-pod-rect');
  if (shellRect) shellRect.style.fill = 'rgba(255, 255, 255, 0.03)';
  // The container box sits on the Pod centre line (h/2), balanced between the name on top and the
  // mount-path sublabel at the bottom, rather than pushed down against the sublabel.
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
      'aria-label': 'StatefulSet volumeClaimTemplates: unlike a Deployment which hands every replica the one shared claim, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated rebinds the very same disk, the claims are retained when a Pod is removed, and scaling down leaves them behind',
      'data-style': 'outline',
    });
    root.appendChild(arrowDefs());

    const src = box({
      x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H,
      label: 'StatefulSet Web', sublabel: 'replicas: 3, volumeClaimTemplate: data', role: 'storage',
    });

    const pods = ROW_CY.map((cy, i) => podBlock({ cy, label: `web-${i}` }));
    const pvcs = ROW_CY.map((cy, i) => {
      const b = box({ x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'not created yet', role: 'storage' });
      b.style.opacity = '0.4';   // a placeholder until the template mints it, never a hole
      return b;
    });
    const pvs = ROW_CY.map((cy, i) => {
      const c = cylinder({ x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `pv-web-${i}`, role: 'storage' });
      // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
      // is not part of the visible front face. Re-centre on the face, derived from the height.
      const l = c.querySelector('.scheme-cylinder-label');
      if (l) l.setAttribute('y', PV_H / 2 + 10);
      return c;
    });

    const trunkW = ROW_CY.map((_, i) => lane(trunkSeg(i)));
    trunkW.forEach(w => { w.style.opacity = '0'; });
    const bindW = ROW_CY.map((_, i) => lane(bindPts(i)));
    const mountW = ROW_CY.map((_, i) => lane(mountPts(i)));

    // Per-row annotation, parked in the free space to the right of the disk (the L-shaped safe zone),
    // filled only on the rebind and scale steps.
    const nameLbls = ROW_CY.map(cy => text({ class: 'scheme-label code dim', x: PV_RIGHT + 20, y: cy + 5, 'text-anchor': 'start' }, [' ']));

    const CHIP_W = 232, CHIP_GAP = 16;
    const CHIPS_W = CHIP_W * 4 + CHIP_GAP * 3;                  // 976
    const CHIPS_X = CX - CHIPS_W / 2;                           // 112, so the strip centres on CX
    const chipX = i => CHIPS_X + i * (CHIP_W + CHIP_GAP);
    const replChip = valChip({ x: chipX(0), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'replicas',  value: '3',          role: 'storage' });
    const pvcChip  = valChip({ x: chipX(1), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'PVCs',      value: 'none yet',   role: 'storage' });
    const nameChip = valChip({ x: chipX(2), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'naming',    value: 'data-web-N', role: 'storage' });
    const retChip  = valChip({ x: chipX(3), y: CHIPS_Y, w: CHIP_W, h: 34, name: 'on delete', value: 'retained',   role: 'storage' });

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

const POD_PRESENT = 1;
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

function mountRow(s, ctx, i, { delay = 0, tag = null } = {}) {
  const low = routePacket(s, ctx, bindPts(i), { delay, role: 'storage' });
  const high = routePacket(s, ctx, mountPts(i), { delay: low.arrivalMs + BEAT.afterHop, role: 'storage' });
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
        const mint = routePacket(s, ctx, trunkSeg(i), { delay: at, role: 'storage' });
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
        const b = routePacket(s, ctx, bindPts(i), { delay: BEAT.lead, role: 'storage' });
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
