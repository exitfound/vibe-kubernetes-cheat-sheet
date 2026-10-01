import { P, F, defineCard, STO, chipStrip, setPodSublabel, makeRidingLabel, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volumeclaimtemplates.md


// The claim is the subject, so it sits in the CENTRE of every ordinal row on this spine, with its Pod
// and its disk mirrored about it at CX -/+ FLANK. The mint spine drops straight down the same line.
const CX = 600;

// 80 tall (NET.L-01), 280 wide rather than 232: the sublabel `replicas: 3, volumeClaimTemplates: data`
// inks 239.3, wider than the catalog block itself, so the box takes it plus 20 a side.
const SRC_W = 280, SRC_H = 80, SRC_X = CX - SRC_W / 2, SRC_Y = 52;   // 460..740
const SRC_BOTTOM = SRC_Y + SRC_H;                                   // 132

// The three ordinal rows, each centre the y midline of every block in its row, so mount and bind lanes
// run level. Row 0 is set by the panel (its Pod label clears 205 at 1100x800), row 2 holds, pitch 134.
const ROW_CY = [261, 395, 529];

// The catalog sizes (NET.L-01): the claim is an actor block, 232 by 80, and the Pod 232 by 104 around
// a 192 by 44 app box 26 under the Pod label. The disk is a cylinder, not an actor block, and keeps 150.
const POD_W = 232, POD_H = 104;
const APP_W = 192, APP_H = 44, APP_DY = 26;
const PVC_W = 232, PVC_H = 80;
const PV_W = 150, PV_H = 76;

// Flank offset: Pod centre and disk centre are mirror images about the spine, so the row is symmetric.
const FLANK = 295;
const POD_CX = CX - FLANK, PV_CX = CX + FLANK;                      // 305 / 895
const POD_X = POD_CX - POD_W / 2, POD_RIGHT = POD_X + POD_W;        // 189 / 421
const PVC_X = CX - PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;            // 484 / 716
const PV_X = PV_CX - PV_W / 2, PV_RIGHT = PV_X + PV_W;              // 820 / 970

const CHIPS_Y = 600;
// Family CHIP_W 232 at the family gap, four across, centred on CX: 112..1088.
const CHIPS = chipStrip();

// Straight axis runs, ONE array per row built once so the lane and the ball that rides it are the
// same array (A-02). Arrowheads land on the RECEIVER: the claim top, the claim, then the Pod.
const TRUNK = ROW_CY.map((cy, i) => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, cy - PVC_H / 2]]);
const BIND = ROW_CY.map(cy => [[PV_X, cy], [PVC_RIGHT, cy]]);     // pv -> PVC (into claim right edge)
const MOUNT = ROW_CY.map(cy => [[PVC_X, cy], [POD_RIGHT, cy]]);   // PVC -> Pod (into Pod right edge)

// One lane per row in each of the three families, held under its own ordinal key, which is what the
// `opacity` field and the flow address.
const trunkLane = i => P.lane({ key: `trunk${i}`, points: TRUNK[i], dashed: true, dim: true });
const bindLane = i => P.lane({ key: `bind${i}`, points: BIND[i], dashed: true, dim: true });
const mountLane = i => P.lane({ key: `mount${i}`, points: MOUNT[i], dashed: true, dim: true });

// The app box sits 26 under the Pod top, between the name above it and the mount-path sublabel below.
const podBlock = i => P.pod({
  key: `p${i}`, innerKey: `b${i}`, x: POD_X, y: ROW_CY[i] - POD_H / 2, w: POD_W, h: POD_H,
  label: `web-${i}`, sublabel: 'mounts /data', containers: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'read/write' },
});

// Z-order (bottom -> top): blocks, then the lanes and mint spine and captions above them, then the
// chip strip, then the packet layer so every ball rides above everything.
export const SCENE = {
  'aria-label': 'StatefulSet volumeClaimTemplates: unlike Deployment replicas, which all share any claim their template names, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated mounts the very same claim and disk, the claim outlives the Pod, and by default scaling down leaves the claims behind',
  parts: [
    P.defs(),
    P.box({ key: 'src', x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'StatefulSet web', sublabel: 'replicas: 3, volumeClaimTemplates: data' }),
    // The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
    // is not part of the visible front face. Re-centre on the face, derived from the height.
    ...ROW_CY.map((cy, i) => P.cylinder({ key: `d${i}`, x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `PV web-${i}`, labelY: PV_H / 2 + 10 })),
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
    P.chip({ key: 'retChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIPS.w, h: STO.CHIP_H, name: 'on scale-down', value: 'retained' }),
    P.packets(),
  ],
  reset: {
    keys: ['src', 'v0', 'v1', 'v2', 'd0', 'd1', 'd2', 'replChip', 'pvcChip', 'nameChip', 'retChip'],
    pods: ['p0', 'p1', 'p2'],
  },
};

// Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
// card comes to report a stale claim count on the step that just changed it.
const chips = (repl, pvcs, naming, ret) => ({ replChip: repl, pvcChip: pvcs, nameChip: naming, retChip: ret });

const PEND = OPACITY.pending;

// STO.S-01 as a field: every claim, every Pod and every lane is pinned on EVERY step. A lane stands at
// full while its claim or Pod is a dim placeholder (the sublabel says not yet), and leaves with its Pod.
const lane = o => (o === PEND ? 1 : o);
const stage = ({ pods = [1, 1, 1], claims = [PEND, PEND, PEND] } = {}) => ({
  p0: pods[0], p1: pods[1], p2: pods[2],
  v0: claims[0], v1: claims[1], v2: claims[2],
  bind0: 1, bind1: 1, bind2: 1,
  mount0: lane(pods[0]), mount1: lane(pods[1]), mount2: lane(pods[2]),
  trunk0: 1, trunk1: 1, trunk2: 1,
});

// The Pod sublabel is its resting mount path everywhere except the rebind, so it is stated on every
// step: forward steps mutate one scene, so the rebind text would otherwise leak into a later step.
const MOUNTED = { p0: 'mounts /data', p1: 'mounts /data', p2: 'mounts /data' };
const UNBORN = { p0: 'not created yet', p1: 'not created yet', p2: 'not created yet' };
const NO_PODS = [PEND, PEND, PEND];
const claimLabels = labels => ({ v0: labels[0], v1: labels[1], v2: labels[2] });
const BOUND = ['Bound', 'Bound', 'Bound'];

// The riding tag sits ABOVE the row, not on it: the row hops are 63 and 104 long against a tag of up
// to 128, so on the row midline a claim or Pod face prints through the glyphs at both ends.
const TAG_DY = -(POD_H / 2) - 6;      // -58: 3 clear of the Pod top, the tallest block of a row

// Every tag lives exactly as long as its ball (M-30a): in before departure, out as the ball lands.
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });

// The mint tag rides clear of the vertical spine it follows, and clear of the CLAIMS too: a trunk hop
// is shorter than the claim it leaves, so a tag beside the spine sits inside that claim while it waits
// and fades in. Right of the claim column instead (9 clear of its edge for the 61 wide name), and
// 16 BELOW the ball so it starts under the source box rather than across its right wall.
const MINT_DY = 16, MINT_DX = PVC_W / 2 + 40;

// A row mounts in two hops: the ball crosses the bind lane from disk into claim, then the mount lane
// into the Pod, which blinks as one unit on arrival and lights nothing inside it (STO.C-02).
const mountRow = (i, { delay, tag = null }) => [
  F.route({ points: BIND[i], delay, name: `lo${i}` }),
  F.route({ points: MOUNT[i], after: `lo${i}`, name: `hi${i}` }),
  ...(tag ? [F.tag({ text: tag, points: MOUNT[i], after: `lo${i}`, dy: TAG_DY, fn: tagFn })] : []),
  F.light({ targets: [`v${i}`], at: `lo${i}` }),
  F.pulse({ pod: `p${i}`, at: `hi${i}` }),
];

// The rebind is slower than the FADE tokens, with a real HOLD at the ghost, so delete and recreate
// read as two beats. The Pod blinks first and fades from GO, once the blink is spent (M-08).
const GONE = OPACITY.terminated, GO = BEAT.afterPulse, OUT = 850, HOLD = 550, IN = 800;
const REBORN = GO + OUT + HOLD;

// The recreate beat is a fade whose COMPLETION renames the Pod sublabel, and `unlight` is the only
// onfinish F.fade carries, so it goes through F.run at delay 0, which runs its body inline.
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
    podSublabels: UNBORN,
    opacity: stage({ pods: NO_PODS }),
  },
  {
    id: 'mint',
    duration: 5300,
    narration: 'One ordinal at a time, the StatefulSet creates the claim and then its Pod. The claim name is not random: it is the template name joined to the Pod name, data-web-0, data-web-1, data-web-2. Under the default OrderedReady policy, web-1 waits until web-0 is Running and Ready.',
    chipsCued: chips('3', '3 minted', 'data-web-N', 'retained'),
    sublabels: claimLabels(['Pending', 'Pending', 'Pending']),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1] }),
    // The source box is where every mint departs from, so it is lit at step entry. The claims are
    // receivers and earn their highlight on arrival.
    lit: ['src'],
    // Claims and Pods are created DURING the step, so the animated path winds both back to the
    // placeholder shade, the counter and the phase lines with them: nothing created yet (P-03, P-04).
    rewind: {
      opacity: stage({ pods: NO_PODS }),
      chips: { pvcChip: 'none yet' },
      sublabels: claimLabels(['not created yet', 'not created yet', 'not created yet']),
      podSublabels: UNBORN,
    },
    // One ordinal at a time: the name relays down the spine into its claim, the Pod of that row is
    // created right after, and the next mint leaves only once that Pod has appeared (OrderedReady).
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: TRUNK[i], ...(i === 0 ? { delay: BEAT.lead } : { after: `r${i - 1}` }), name: `m${i}` }),
      F.tag({ text: `data-web-${i}`, points: TRUNK[i], ...(i === 0 ? { delay: BEAT.lead } : { after: `r${i - 1}` }), dy: MINT_DY, dx: MINT_DX, fn: tagFn }),
      F.reveal({ target: `v${i}`, at: `m${i}`, from: PEND }),
      F.light({ targets: [`v${i}`], at: `m${i}` }),
      // The counter steps one per arrival (1500, 2900, 4300) rather than reading 3 minted over two
      // claims that are still placeholders, and each claim takes its Pending line as it appears.
      F.set({ at: `m${i}`, chipsCued: { pvcChip: `${i + 1} minted` }, sublabels: { [`v${i}`]: 'Pending' } }),
      // The Pod appears as a whole a beat after its claim, and nothing inside it lights (STO.C-02).
      F.reveal({ target: `p${i}`, at: `m${i}`, plus: BEAT.afterHop, from: PEND, name: `r${i}` }),
      F.set({ at: `m${i}`, plus: BEAT.afterHop, podSublabels: { [`p${i}`]: 'mounts /data' } }),
    ]),
  },
  {
    id: 'bind',
    duration: 2800,
    narration: 'Each claim is bound to its own PersistentVolume, so ordinal 0 gets PV web-0 and never touches ordinal 1. Drawn as one phase here, by default each ordinal binds and mounts before the next is created. The claim is the durable name, the disk behind it stores the bytes.',
    chipsCued: chips('3', '3 bound', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1] }),
    // The disks are where the bind ball departs, so they light at entry. Each claim is the receiver,
    // so it lights, turns Bound and moves the counter only once its ball lands (P-03).
    lit: ['d0', 'd1', 'd2'],
    rewind: { chips: { pvcChip: '3 minted' }, sublabels: claimLabels(['Pending', 'Pending', 'Pending']) },
    // Each disk binds to its claim, straight along the bind lane. The three binds are independent
    // and simultaneous, so they leave together on one beat rather than a stagger.
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: BIND[i], delay: BEAT.lead, name: `b${i}` }),
      F.tag({ text: 'bound', points: BIND[i], delay: BEAT.lead, dy: TAG_DY, fn: tagFn }),
      F.light({ targets: [`v${i}`], at: `b${i}` }),
      F.set({ at: `b${i}`, sublabels: { [`v${i}`]: 'Bound' }, ...(i === 2 ? { chipsCued: { pvcChip: '3 bound' } } : {}) }),
    ]),
  },
  {
    id: 'mount',
    duration: 3800,
    narration: 'Each Pod starts and mounts the volume behind its own claim. Replica web-0 reads and writes data-web-0, web-1 data-web-1, and so on. Each replica names a different claim and a claim binds exactly one PV, so no two replicas share a disk.',
    chipsCued: chips('3', '3 in use', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    podSublabels: MOUNTED,
    opacity: stage({ claims: [1, 1, 1] }),
    // The disks are the source of the read, so they light at entry. Each claim lights as the ball
    // reaches it, and the counter reads in use only once the three Pods have mounted.
    lit: ['d0', 'd1', 'd2'],
    rewind: { chips: { pvcChip: '3 bound' } },
    flow: [
      ...ROW_CY.flatMap((_, i) => mountRow(i, { delay: BEAT.lead })),
      F.set({ at: 'hi2', chipsCued: { pvcChip: '3 in use' } }),
    ],
  },
  {
    id: 'rebind',
    duration: 5700,
    narration: 'Delete web-1 and the StatefulSet recreates it, possibly on another Node that can reach PV web-1. The claim data-web-1 is not deleted with the Pod and stays Bound to PV web-1. The new Pod derives the same claim name from its ordinal, so it mounts the very same disk and data.',
    // The naming chip holds the PATTERN, which does not change here. Retention is already on the
    // `on scale-down` chip: a chip must not answer a question it was not asked.
    chipsCued: chips('3', '3 in use', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    // The Pod keeps its ordinal name web-1 (that is the whole point: same name mounts the same
    // disk), so the lifecycle is narrated in the SUBLABEL instead. Final resting state: recreated.
    podSublabels: { ...MOUNTED, p1: 'recreated' },
    opacity: stage({ claims: [1, 1, 1] }),
    wires: { n1: 'same name, same disk' },
    // Only row 1 acts: its disk is the sender of the rebind ball, rows 0 and 2 stand unlit.
    lit: ['d1'],
    // The animated path opens on the Pod about to be deleted, and the recreate above winds it back.
    // The wire is about the remount, so it waits for the ball that leaves the disk.
    rewind: { podSublabels: { p1: 'deleted' }, wires: { n1: '' } },
    flow: [
      F.pulse({ pod: 'p1' }),
      F.fade({ target: 'p1', from: 1, to: GONE, dur: OUT, delay: GO, fill: 'forwards', easing: 'ease-in' }),
      // The mount lane leaves with its Pod and comes back with it, rather than standing at full
      // strength over the 550ms ghost hold.
      F.fade({ target: 'mount1', from: 1, to: GONE, dur: OUT, delay: GO, fill: 'forwards', easing: 'ease-in' }),
      recreate,
      F.fade({ target: 'mount1', from: GONE, to: 1, dur: IN, delay: REBORN, fill: 'forwards', easing: 'ease-out' }),
      ...mountRow(1, { delay: REBORN + IN, tag: 'data-web-1 again' }),
      F.set({ delay: REBORN + IN, wires: { n1: 'same name, same disk' } }),
    ],
  },
  {
    id: 'scale',
    duration: 3000,
    narration: 'Scale web down to two and Pod web-2 is removed, but claim data-web-2 stays Bound with its data. That is the default retention policy, Retain, which the StatefulSet PVC Retention card covers. Scale back up and web-2 reuses the same claim, but a scale-down nobody cleans up leaves disks behind.',
    // `on scale-down` holds the POLICY, and the policy has not changed: it is still the default Retain.
    // The leak this step is about is carried by the PVC count and by the idle claim sublabel.
    chipsCued: chips('2', '3 (1 idle)', 'data-web-N', 'retained'),
    sublabels: claimLabels(['Bound', 'Bound', 'kept, no Pod']),
    podSublabels: MOUNTED,
    // web-2 leaves, but data-web-2 and PV web-2 stay put: the claim is the thing that persists. The
    // ghost goes THROUGH stage(), so mount2 dims with its Pod.
    opacity: stage({ claims: [1, 1, 1], pods: [1, 1, GONE] }),
    // Beside the disk, so not `retained`: that reads as the PV reclaimPolicy, a different field.
    wires: { n2: 'kept with its claim' },
    // The claim reads idle, lights, and the counter counts it, only once its Pod has gone.
    rewind: { opacity: { p2: 1, mount2: 1 }, chips: { pvcChip: '3 in use' }, sublabels: { v2: 'Bound' }, wires: { n2: '' } },
    // The removed Pod blinks at full first and goes at afterPulse, so the blink is over before the
    // shade moves and the two are not one event (M-08). Its mount lane leaves with it.
    flow: [
      F.pulse({ pod: 'p2' }),
      ...['p2', 'mount2'].map(target => F.fade({
        target, from: 1, to: GONE, dur: FADE.out, delay: BEAT.afterPulse, fill: 'forwards', easing: 'ease-in',
      })),
      F.set({ delay: BEAT.afterPulse + FADE.out, chipsCued: { pvcChip: '3 (1 idle)' }, sublabels: { v2: 'kept, no Pod' }, wires: { n2: 'kept with its claim' } }),
      F.light({ targets: ['v2', 'd2'], delay: BEAT.afterPulse + FADE.out }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
