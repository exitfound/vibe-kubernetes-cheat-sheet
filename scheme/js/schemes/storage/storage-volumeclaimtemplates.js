import { P, F, defineCard, STO, chipStrip, setPodSublabel, BEAT, FADE, OPACITY } from './storage-kit.js';
// Design notes for this card: ./CARDS/storage-volumeclaimtemplates.md


// The claim is the subject, so it sits on this spine in every ordinal row, its Pod and its disk
// mirrored about it at CX -/+ FLANK. The mint spine drops down the same line.
const CX = 600;

// The catalog actor block (NET.L-01). The replica count lives in the replicas chip, not the sublabel.
const SRC_W = 232, SRC_H = 80, SRC_X = CX - SRC_W / 2, SRC_Y = 52;
const SRC_BOTTOM = SRC_Y + SRC_H;

// Each row centre is the y midline of every block in it, so mount and bind lanes run level.
// Row 0 is set by the panel.
const ROW_CY = [261, 395, 529];

// The catalog sizes (NET.L-01). The disk is a cylinder, not an actor block, and keeps its own width.
const POD_W = 232, POD_H = 104;
const APP_W = 192, APP_H = 44, APP_DY = 26;
const PVC_W = 232, PVC_H = 80;
const PV_W = 150, PV_H = 76;

// Pod and disk centres mirror about the spine.
const FLANK = 295;
const POD_CX = CX - FLANK, PV_CX = CX + FLANK;
const POD_X = POD_CX - POD_W / 2, POD_RIGHT = POD_X + POD_W;
const PVC_X = CX - PVC_W / 2, PVC_RIGHT = PVC_X + PVC_W;
const PV_X = PV_CX - PV_W / 2, PV_RIGHT = PV_X + PV_W;

const CHIPS_Y = 600;
const CHIPS = chipStrip();

// One array per row, shared by the lane and the ball that rides it (A-02). Arrowheads land on the receiver.
const TRUNK = ROW_CY.map((cy, i) => [[CX, i === 0 ? SRC_BOTTOM : ROW_CY[i - 1] + PVC_H / 2], [CX, cy - PVC_H / 2]]);
const BIND = ROW_CY.map(cy => [[PV_X, cy], [PVC_RIGHT, cy]]);     // pv -> PVC
const MOUNT = ROW_CY.map(cy => [[PVC_X, cy], [POD_RIGHT, cy]]);   // PVC -> Pod

// One lane per row in each family, under its own ordinal key for opacity and flow.
const trunkLane = i => P.lane({ key: `trunk${i}`, points: TRUNK[i], dashed: true, dim: true });
const bindLane = i => P.lane({ key: `bind${i}`, points: BIND[i], dashed: true, dim: true });
const mountLane = i => P.lane({ key: `mount${i}`, points: MOUNT[i], dashed: true, dim: true });

const podBlock = i => P.pod({
  key: `p${i}`, innerKey: `b${i}`, x: POD_X, y: ROW_CY[i] - POD_H / 2, w: POD_W, h: POD_H,
  label: `web-${i}`, sublabel: 'mounts /data', containers: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'read/write' },
});

// Z-order: blocks, then lanes, the mint spine and captions, then the chip strip, then packets.
export const SCENE = {
  'aria-label': 'StatefulSet volumeClaimTemplates: unlike Deployment replicas, which all share any claim their template names, a StatefulSet mints one PersistentVolumeClaim per ordinal with a deterministic name derived from the Pod identity, so a Pod that is deleted and recreated mounts the very same claim and disk, the claim outlives the Pod, and by default scaling down leaves the claims behind',
  parts: [
    P.defs(),
    P.box({ key: 'src', x: SRC_X, y: SRC_Y, w: SRC_W, h: SRC_H, label: 'StatefulSet web', sublabel: 'volumeClaimTemplates: data' }),
    // Re-centre the label on the visible front face, not the raw bbox with its top cap.
    ...ROW_CY.map((cy, i) => P.cylinder({ key: `d${i}`, x: PV_X, y: cy - PV_H / 2, w: PV_W, h: PV_H, label: `PV web-${i}`, labelY: PV_H / 2 + 10 })),
    // A placeholder until the template mints it, never a hole.
    ...ROW_CY.map((cy, i) => P.box({ key: `v${i}`, x: PVC_X, y: cy - PVC_H / 2, w: PVC_W, h: PVC_H, label: `PVC data-web-${i}`, sublabel: 'not created yet', opacity: OPACITY.pending })),
    ...ROW_CY.map((_, i) => podBlock(i)),
    ...ROW_CY.map((_, i) => trunkLane(i)),
    ...ROW_CY.map((_, i) => bindLane(i)),
    ...ROW_CY.map((_, i) => mountLane(i)),
    // Per-row annotation right of the disk, filled only on the rebind and scale steps.
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

// Every step writes EVERY chip, or a chip keeps a stale value from the previous step.
const chips = (repl, pvcs, naming, ret) => ({ replChip: repl, pvcChip: pvcs, nameChip: naming, retChip: ret });

const PEND = OPACITY.pending;

// Every claim, Pod and lane is pinned on EVERY step (STO.S-01). A lane stands at full beside a dim
// placeholder and leaves with its Pod.
const lane = o => (o === PEND ? 1 : o);
const stage = ({ pods = [1, 1, 1], claims = [PEND, PEND, PEND] } = {}) => ({
  p0: pods[0], p1: pods[1], p2: pods[2],
  v0: claims[0], v1: claims[1], v2: claims[2],
  bind0: 1, bind1: 1, bind2: 1,
  mount0: lane(pods[0]), mount1: lane(pods[1]), mount2: lane(pods[2]),
  trunk0: 1, trunk1: 1, trunk2: 1,
});

// The Pod sublabel is stated on every step, or the rebind text would leak into a later step.
const MOUNTED = { p0: 'mounts /data', p1: 'mounts /data', p2: 'mounts /data' };
const UNBORN = { p0: 'not created yet', p1: 'not created yet', p2: 'not created yet' };
const NO_PODS = [PEND, PEND, PEND];
const claimLabels = labels => ({ v0: labels[0], v1: labels[1], v2: labels[2] });
const BOUND = ['Bound', 'Bound', 'Bound'];

// The riding tag sits ABOVE the row: on the row midline a claim or Pod face prints through it.
const TAG_DY = -(POD_H / 2) - 6;      // clear of the Pod top, the tallest block of a row

// The mint tag rides right of the claim column and below the ball, clear of the spine and of the claim
// it leaves.
const MINT_DY = 16, MINT_DX = PVC_W / 2 + 40;

// A row mounts in two hops, disk to claim then claim to Pod, which blinks whole on arrival (STO.C-02).
const mountRow = (i, { delay, tag = null }) => [
  F.route({ points: BIND[i], delay, name: `lo${i}` }),
  F.route({ points: MOUNT[i], after: `lo${i}`, name: `hi${i}` }),
  ...(tag ? [F.tag({ text: tag, points: MOUNT[i], after: `lo${i}`, dy: TAG_DY })] : []),
  F.light({ targets: [`v${i}`], at: `lo${i}` }),
  F.pulse({ pod: `p${i}`, at: `hi${i}` }),
];

// The rebind is slower than the FADE tokens, with a real HOLD at the ghost, so delete and recreate read
// as two beats. The Pod blinks first and fades from GO (M-08).
const GONE = OPACITY.terminated, GO = BEAT.afterPulse, OUT = 850, HOLD = 550, IN = 800;
const REBORN = GO + OUT + HOLD;

// The fade's COMPLETION renames the Pod sublabel, and F.fade carries no such onfinish, so F.run.
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
    // The source is lit at entry, the claims earn their highlight on arrival.
    lit: ['src'],
    // Claims and Pods are created DURING the step, so rewind returns them to the placeholder shade (P-03, P-04).
    rewind: {
      opacity: stage({ pods: NO_PODS }),
      chips: { pvcChip: 'none yet' },
      sublabels: claimLabels(['not created yet', 'not created yet', 'not created yet']),
      podSublabels: UNBORN,
    },
    // One ordinal at a time: the next mint leaves only once the previous Pod appears (OrderedReady).
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: TRUNK[i], ...(i === 0 ? { delay: BEAT.lead } : { after: `r${i - 1}` }), name: `m${i}` }),
      F.tag({ text: `data-web-${i}`, points: TRUNK[i], ...(i === 0 ? { delay: BEAT.lead } : { after: `r${i - 1}` }), dy: MINT_DY, dx: MINT_DX }),
      F.reveal({ target: `v${i}`, at: `m${i}`, from: PEND }),
      F.light({ targets: [`v${i}`], at: `m${i}` }),
      // The counter steps one per arrival, and each claim takes its Pending line as it appears.
      F.set({ at: `m${i}`, chipsCued: { pvcChip: `${i + 1} minted` }, sublabels: { [`v${i}`]: 'Pending' } }),
      // The Pod appears whole a beat after its claim, nothing inside it lights (STO.C-02).
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
    // The disks light at entry. Each claim lights, turns Bound and moves the counter on its own arrival (P-03).
    lit: ['d0', 'd1', 'd2'],
    rewind: { chips: { pvcChip: '3 minted' }, sublabels: claimLabels(['Pending', 'Pending', 'Pending']) },
    // The three binds are independent, so they leave together on one beat.
    flow: ROW_CY.flatMap((_, i) => [
      F.route({ points: BIND[i], delay: BEAT.lead, name: `b${i}`, tag: { text: 'bound', dy: TAG_DY } }),
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
    // The disks light at entry. The counter reads in use only once all three Pods have mounted.
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
    // The naming chip holds the PATTERN, which does not change here.
    chipsCued: chips('3', '3 in use', 'data-web-N', 'retained'),
    sublabels: claimLabels(BOUND),
    // The Pod keeps its ordinal name web-1, so the lifecycle is narrated in the sublabel.
    podSublabels: { ...MOUNTED, p1: 'recreated' },
    opacity: stage({ claims: [1, 1, 1] }),
    wires: { n1: 'same name, same disk' },
    // Only row 1 acts: its disk sends the rebind ball.
    lit: ['d1'],
    // The animated path opens on the Pod about to be deleted. The wire waits for the remount ball.
    rewind: { podSublabels: { p1: 'deleted' }, wires: { n1: '' } },
    flow: [
      F.pulse({ pod: 'p1' }),
      F.fade({ target: 'p1', from: 1, to: GONE, dur: OUT, delay: GO, fill: 'forwards', easing: 'ease-in' }),
      // The mount lane leaves with its Pod and comes back with it.
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
    // on scale-down holds the POLICY, unchanged. The leak is carried by the PVC count and the idle sublabel.
    chipsCued: chips('2', '3 (1 idle)', 'data-web-N', 'retained'),
    sublabels: claimLabels(['Bound', 'Bound', 'kept, no Pod']),
    podSublabels: MOUNTED,
    // The claim and PV persist. The ghost goes through stage(), so mount2 dims with its Pod.
    opacity: stage({ claims: [1, 1, 1], pods: [1, 1, GONE] }),
    // Not retained: beside the disk that reads as the PV reclaimPolicy.
    wires: { n2: 'kept with its claim' },
    // The claim reads idle and the counter counts it only once its Pod has gone.
    rewind: { opacity: { p2: 1, mount2: 1 }, chips: { pvcChip: '3 in use' }, sublabels: { v2: 'Bound' }, wires: { n2: '' } },
    // The removed Pod blinks at full and only then goes (M-08), its mount lane with it.
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
