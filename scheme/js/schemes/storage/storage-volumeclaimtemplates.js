import { P, F, defineCard, STO, chipStrip, laneOf, setPodSublabel, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS.md#storage-volumeclaimtemplates


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
// Family CHIP_W 232 at the family gap, four across, centred on CX: 112..1088.
const CHIPS = chipStrip();

// Straight axis runs. Every array is shared by the static lane and its ball, and the arrowheads
// point at the RECEIVER: the mint into the claim top, the disk into the claim, the claim into the Pod.
const trunkSeg = i => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, ROW_CY[i] - PVC_H / 2]];
const bindPts = i => [[PV_X, ROW_CY[i]], [PVC_RIGHT, ROW_CY[i]]];     // pv -> PVC (into claim right edge)
const mountPts = i => [[PVC_X, ROW_CY[i]], [POD_RIGHT, ROW_CY[i]]];   // PVC -> Pod (into Pod right edge)

// Each run is held BOTH in its ordinal array and under a scalar key: the dumps name these elements
// trunkW[n] / bindW[n] / mountW[n], and the opacity field resolves one element per key. The tune
// runs before the scalar key lands, so the array keeps the naming.
const trunkLane = i => P.lane({
  key: `trunk${i}`, points: trunkSeg(i), dashed: true, dim: true, opacity: 0,
  tune: (el, refs) => { refs.trunkW = [...(refs.trunkW || []), el]; },
});
const bindLane = i => P.lane({
  key: `bind${i}`, points: bindPts(i), dashed: true, dim: true,
  tune: (el, refs) => { refs.bindW = [...(refs.bindW || []), el]; },
});
const mountLane = i => P.lane({
  key: `mount${i}`, points: mountPts(i), dashed: true, dim: true,
  tune: (el, refs) => { refs.mountW = [...(refs.mountW || []), el]; },
});

// The container box sits on the Pod centre line (h/2), balanced between the name on top and the
// mount-path sublabel at the bottom, rather than pushed down against the sublabel.
const podBlock = i => P.pod({
  key: `p${i}`, innerKey: `b${i}`, x: POD_X, y: ROW_CY[i] - POD_H / 2, w: POD_W, h: POD_H,
  label: `web-${i}`, sublabel: 'mounts /data', containers: 0,
  inner: { dx: 16, dy: POD_H / 2 - 21, w: POD_W - 32, h: 42, label: 'app', sublabel: 'read/write' },
});

// Z-order (bottom -> top): blocks, then the lanes and mint spine and captions above them, then the
// chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'StatefulSet volumeClaimTemplates: unlike a Deployment which hands every replica the one shared claim, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated rebinds the very same disk, the claims are retained when a Pod is removed, and scaling down leaves them behind',
  parts: [
    P.defs(),
    P.box({ key: 'src', x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'StatefulSet web', sublabel: 'replicas: 3, volumeClaimTemplates: data' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, derived from the height.
    ...ROW_CY.map((cy, i) => P.cylinder({ key: `d${i}`, x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `pv-web-${i}`, labelY: PV_H / 2 + 10 })),
    // A placeholder until the template mints it, never a hole.
    ...ROW_CY.map((cy, i) => P.box({ key: `v${i}`, x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'not created yet', opacity: OPACITY.pending })),
    ...ROW_CY.map((_, i) => podBlock(i)),
    ...ROW_CY.map((_, i) => trunkLane(i)),
    ...ROW_CY.map((_, i) => bindLane(i)),
    ...ROW_CY.map((_, i) => mountLane(i)),
    // Per-row annotation, parked in the free space to the right of the disk (the L-shaped safe zone),
    // filled only on the rebind and scale steps.
    ...ROW_CY.map((cy, i) => P.wire({ key: `n${i}`, x: PV_RIGHT + 20, y: cy + 5, anchor: 'start' })),
    P.chip({ key: 'replChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'replicas', value: '3' }),
    P.chip({ key: 'pvcChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'PVCs', value: 'none yet' }),
    P.chip({ key: 'nameChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'naming', value: 'data-web-N' }),
    P.chip({ key: 'retChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'on delete', value: 'retained' }),
    P.packets(),
  ],
  reset: {
    keys: ['src', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2', 'b0', 'b1', 'b2', 'replChip', 'pvcChip', 'nameChip', 'retChip'],
    pods: ['p0', 'p1', 'p2'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report a stale claim count on the step that just changed it.
const chips = (repl, pvcs, naming, ret) => ({ replChip: repl, pvcChip: pvcs, nameChip: naming, retChip: ret });

const PEND = OPACITY.pending;

// STO.S-01 as a field: every claim born mid-story, every Pod removed by one, and every lane, is
// pinned on EVERY step. A lane is only as present as its fainter end, so a bind lane follows its
// claim and a mount lane takes the MIN, or a mount arrow lands on a ghost Pod.
const stage = ({ pods = [1, 1, 1], claims = [PEND, PEND, PEND], mint = false } = {}) => ({
  p0: pods[0], p1: pods[1], p2: pods[2],
  v0: claims[0], v1: claims[1], v2: claims[2],
  bind0: claims[0], bind1: claims[1], bind2: claims[2],
  mount0: laneOf(claims[0], pods[0]), mount1: laneOf(claims[1], pods[1]), mount2: laneOf(claims[2], pods[2]),
  trunk0: mint ? 1 : 0, trunk1: mint ? 1 : 0, trunk2: mint ? 1 : 0,
});

// The Pod sublabel is its resting mount path everywhere except the rebind, so it is stated on every
// step: forward steps mutate one scene, so the rebind text would otherwise leak into a later step.
const MOUNTED = { p0: 'mounts /data', p1: 'mounts /data', p2: 'mounts /data' };
const claimLabels = labels => ({ v0: labels[0], v1: labels[1], v2: labels[2] });
const BOUND = ['Bound', 'Bound', 'Bound'];

// This card's riding tag sits 16 above the ball rather than the family 14, and the mint tag rides
// clear of the vertical spine it follows.
const TAG_DY = -16;
const MINT_DY = -22, MINT_DX = 44;

// A row mounts down-arrow: the ball crosses the bind lane from the disk into the claim, then the
// mount lane up into the Pod. The Pod is already present at full opacity, so the mount only pulses
// it and lights its container when the ball lands: no opacity ramp, which is what used to make the
// Pods flicker step to step. The two cues stand where the hand-written calls stood, after the tag.
const mountRow = (i, { delay, tag = null }) => [
  F.route({ points: bindPts(i), delay, name: `lo${i}` }),
  F.route({ points: mountPts(i), after: `lo${i}`, name: `hi${i}` }),
  ...(tag ? [F.tag({ text: tag, points: mountPts(i), after: `lo${i}`, dy: TAG_DY })] : []),
  F.light({ targets: [`v${i}`], at: `lo${i}` }),
  F.pulse({ pod: `p${i}`, at: `hi${i}` }),
  F.light({ targets: [`b${i}`], at: `hi${i}` }),
];

// The rebind is deliberately slower than the FADE tokens, with a real HOLD at the ghost, so the
// delete and the recreate read as two distinct beats rather than one quick blink.
const GONE = OPACITY.terminated, OUT = 850, HOLD = 550, IN = 800;
const REBORN = OUT + HOLD;

// The recreate beat is a fade whose COMPLETION renames the Pod sublabel, and `unlight` is the only
// onfinish F.fade carries. F.run at delay 0 calls its body inline and registers no timer of its own,
// so the fade is created exactly where the hand-written one stood and the motion record is unchanged.
const recreate = F.run({
  fn: (s, ctx) => {
    const a = s.refs.p1.animate([{ opacity: GONE }, { opacity: 1 }], { duration: IN, delay: REBORN, fill: 'forwards', easing: 'ease-out' });
    a.onfinish = () => setPodSublabel(s.refs.p1, 'recreated');
    ctx.register(a);
  },
});

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('3', 'none yet', 'data-web-N', 'retained'),
    sublabels: claimLabels(['not created yet', 'not created yet', 'not created yet']),
    podSublabels: MOUNTED,
    opacity: stage(),
  },
  {
    id: 'mint',
    duration: 3900,
    narration: 'For each ordinal the template stamps out one claim, and the name is not random. It is the template name joined to the Pod name: data-web-0, data-web-1, data-web-2. Three separate PVC objects now exist, each asking for its own 1Gi of gp3.',
    chipsCued: chips('3', '3 minted', 'data-web-N', 'retained'),
    sublabels: claimLabels(['Pending', 'Pending', 'Pending']),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1], mint: true }),
    // The source box is where every mint departs from, so it is lit at step entry. The claims are
    // receivers and earn their highlight on arrival.
    lit: ['src'],
    // The claims are minted DURING the step, so the animated path winds them back to the placeholder
    // shade and each reveal brings one up. The static field above is where the step ends.
    rewind: { opacity: stage({ mint: true }) },
    // The name relays straight down the spine, materialising each claim in turn: data-web-0, then
    // -1, then -2, exactly as the narration lists them. Each hop starts once the one above lands, and
    // the claim comes up WITH its two lanes: both have it at one end, so they are exactly as present
    // as it is, before the mint lands and after.
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: trunkSeg(i), ...(i === 0 ? { delay: BEAT.lead } : { after: `m${i - 1}` }), name: `m${i}` }),
      F.tag({ text: `data-web-${i}`, points: trunkSeg(i), ...(i === 0 ? { delay: BEAT.lead } : { after: `m${i - 1}` }), dy: MINT_DY, dx: MINT_DX }),
      F.reveal({ target: `v${i}`, at: `m${i}`, from: PEND }),
      F.reveal({ target: `bind${i}`, at: `m${i}`, from: PEND }),
      F.reveal({ target: `mount${i}`, at: `m${i}`, from: PEND }),
      F.light({ targets: [`v${i}`], at: `m${i}` }),
    ]),
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Each claim is bound to its own PersistentVolume, so ordinal 0 gets pv-web-0 and never touches ordinal 1. The claim is the durable name the workload holds, and the disk behind it is what stores the bytes. Nothing is shared between the ordinals.',
    chipsCued: chips('3', '3 bound', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1] }),
    // The disks are where the bind ball departs, so they light at entry. Each claim is the receiver,
    // so it lights only once its ball lands, not at step entry.
    lit: ['d0', 'd1', 'd2'],
    // Each disk binds to its claim, straight along the bind lane. The three binds are independent
    // and simultaneous, so they leave together on one beat rather than a stagger.
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: bindPts(i), delay: BEAT.lead, name: `b${i}` }),
      F.tag({ text: 'bound', points: bindPts(i), delay: BEAT.lead, dy: TAG_DY }),
      F.light({ targets: [`v${i}`], at: `b${i}` }),
    ]),
  },
  {
    id: 'mount',
    duration: 3800,
    narration: 'Now each Pod starts and mounts the volume behind its own claim. Replica web-0 reads and writes data-web-0 alone, web-1 reads data-web-1, and so on. The bind is exclusive, so no two Pods ever land on the same disk.',
    chipsCued: chips('3', '3 in use', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1] }),
    // The disks are the source of the read, so they light at entry. Each claim and container light
    // only as the mount ball reaches them.
    lit: ['d0', 'd1', 'd2'],
    flow: ROW_CY.flatMap((_, i) => mountRow(i, { delay: BEAT.lead })),
  },
  {
    id: 'rebind',
    duration: 4900,
    narration: 'Delete web-1 and the StatefulSet recreates it, perhaps on another Node. The claim data-web-1 is not deleted with the Pod, it stays Bound to pv-web-1. Because the new Pod derives the exact same claim name from its ordinal, it rebinds the very same disk and sees the very same data.',
    // The naming chip holds the PATTERN, which does not change here. Retention is already on the
    // `on delete` chip: a chip must not answer a question it was not asked.
    chipsCued: chips('3', '3 in use', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    // The Pod keeps its ordinal name web-1 (that is the whole point: same name rebinds the same
    // disk), so the lifecycle is narrated in the SUBLABEL instead. Final resting state: recreated.
    podSublabels: { ...MOUNTED, p1: 'recreated' },
    opacity: stage({ claims: [1, 1, 1] }),
    wires: { n1: 'same name, same disk' },
    lit: ['d0', 'd1', 'd2'],
    // The animated path opens on the Pod about to be deleted, and the recreate above winds it back.
    rewind: { podSublabels: { p1: 'deleted' } },
    flow: [
      F.fade({ target: 'p1', from: 1, to: GONE, dur: OUT, fill: 'forwards', easing: 'ease-in' }),
      recreate,
      ...mountRow(1, { delay: REBORN + IN, tag: 'data-web-1 rebound' }),
    ],
  },
  {
    id: 'scale',
    duration: 3000,
    narration: 'Scale web down to two and Pod web-2 is removed, but claim data-web-2 is left behind on purpose. The default retention keeps it, so its disk is not reclaimed and its data is safe. Scale back up and web-2 reattaches the same claim, which is also why a forgotten scale-down silently leaks disks.',
    // `on delete` holds the POLICY, and the policy has not changed: it is still the default retain.
    // The leak this step is about is carried by the PVC count and by the idle claim sublabel.
    chipsCued: chips('2', '3 (1 idle)', 'data-web-N', 'retained'),
    sublabels: claimLabels(['Bound', 'Bound', 'kept, no Pod']),
    podSublabels: MOUNTED,
    // web-2 leaves, but data-web-2 and pv-web-2 stay put: the claim is the thing that persists. The
    // ghost opacity is pinned statically so a mid-step cancel and reduced motion land on it too.
    opacity: { ...stage({ claims: [1, 1, 1] }), p2: OPACITY.terminated },
    wires: { n2: 'retained' },
    lit: ['d0', 'd1', 'v2', 'd2'],
    rewind: { opacity: { p2: 1 } },
    flow: [
      F.fade({ target: 'p2', from: 1, to: OPACITY.terminated, dur: FADE.out, delay: BEAT.afterHop, fill: 'forwards', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
