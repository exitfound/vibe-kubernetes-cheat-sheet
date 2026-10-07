import { P, F, defineCard, BEAT, FADE, OPACITY, chipStrip } from './storage-kit.js';
import { g, rect } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-csi-capacity-tracking.md

// Two Nodes along the top, right of the panel wall, and along the bottom the pipeline the card is
// about: the Scheduler reads, the API server holds the capacity objects, the CSI controller writes.
const BOX_W = 232, BOX_H = 80;                                               // NET.L-01
const POD_W = 232, POD_H = 104, APP_W = 192, APP_H = 44, APP_DY = 26;

// The catalog 34 label band over the Pod. The floor is this card's exception, see NODE_FOOT.
const NODE_Y = 29, NODE_HEAD = 34, NODE_W = 350, NODE_GAP = 30;
const NODE_X = [430, 430 + NODE_W + NODE_GAP];
const NODE_CX = NODE_X.map(x => x + NODE_W / 2);
const POD_Y = NODE_Y + NODE_HEAD;
const POOL_W = 168, POOL_H = 84, POOL_Y = POD_Y + POD_H + 16;
// Deliberate 40 foot, not the catalog 12: a tag over a ball landing on the frame floor stays inside.
const NODE_FOOT = 40, NODE_H = POOL_Y + POOL_H + NODE_FOOT - NODE_Y;
const NODE_BOTTOM = NODE_Y + NODE_H;

// The bottom row sits under the deepest panel reading, so the Scheduler may start at x 60.
const ROW_Y = 400, ROW_MY = ROW_Y + BOX_H / 2;
const SCHED_X = 60, SCHED_CX = SCHED_X + BOX_W / 2;
const LANE_DX = 12;                                    // the two lanes into one Node face (L-12)
const CTRL_CX = NODE_CX[1] + LANE_DX, CTRL_X = CTRL_CX - BOX_W / 2;

// One gauge row per CSIStorageCapacity object at 6 units per Gi, the claim drawn as a threshold
// across both. The frame is symmetric about ROW_MY, where the write and the read meet its faces.
const API_X = 360, API_W = 460, API_Y = 370, API_H = 140;
const GAUGE_X = 450, GI = 6, GAUGE_W = 50 * GI, BAR_H = 16;
const ROW1_Y = 414, ROW2_Y = 450;
const REQ_X = GAUGE_X + 20 * GI;                                             // the 20Gi claim
const CHIPS = chipStrip(), CHIPS_Y = 560;

// Two corridors under the Node row, deep enough that a tag over its ball clears the frame floor.
const CTRL_RUN_Y = 336, SCHED_RUN_Y = (NODE_BOTTOM + API_Y) / 2;
const W_SEL = NODE_CX.map(cx => [[SCHED_CX, ROW_Y], [SCHED_CX, SCHED_RUN_Y], [cx - LANE_DX, SCHED_RUN_Y], [cx - LANE_DX, NODE_BOTTOM]]);
const W_CV = [
  [[CTRL_CX, ROW_Y], [CTRL_CX, CTRL_RUN_Y], [NODE_CX[0] + LANE_DX, CTRL_RUN_Y], [NODE_CX[0] + LANE_DX, NODE_BOTTOM]],
  [[CTRL_CX, ROW_Y], [CTRL_CX, NODE_BOTTOM]],
];
const W_WRITE = [[CTRL_X, ROW_MY], [API_X + API_W, ROW_MY]];                  // controller to API server
const W_READ = [[API_X, ROW_MY], [SCHED_X + BOX_W, ROW_MY]];                  // API server to Scheduler

// ONE raw part per gauge row: no part kind emits a bare rect. Track and fill share the row group, so
// one opacity key reveals or dims the whole object.
const TRACK_FILL = 'rgba(255, 255, 255, 0.04)', TRACK_STROKE = 'rgba(94, 202, 148, 0.35)';
const BAR_FILL = 'rgba(94, 202, 148, 0.6)';
const gaugeRow = (y, gi) => () => {
  const grp = g({});
  const track = rect({ x: GAUGE_X, y, width: GAUGE_W, height: BAR_H, rx: 3 });
  track.style.fill = TRACK_FILL; track.style.stroke = TRACK_STROKE; track.style.strokeWidth = '1';
  const bar = rect({ x: GAUGE_X, y, width: gi * GI, height: BAR_H, rx: 3 });
  bar.style.fill = BAR_FILL;
  grp.appendChild(track); grp.appendChild(bar);
  return grp;
};

const pod = (key, innerKey, i) => P.pod({
  key, innerKey, x: NODE_CX[i] - POD_W / 2, y: POD_Y, w: POD_W, h: POD_H,
  label: 'Pod app-0', sublabel: 'needs 20Gi', containers: 0, opacity: 0,
  inner: { dx: (POD_W - APP_W) / 2, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'local volume' },
});
const pool = (key, i, label) => P.cylinder({
  key, x: NODE_CX[i] - POOL_W / 2, y: POOL_Y, w: POOL_W, h: POOL_H, label, labelY: POOL_H / 2 + 10,
});
const lane = (key, points) => P.lane({ key, points, dashed: true, dim: true, opacity: 0 });
const tag = (key, x, y, text, anchor = 'start') => P.tag({ key, x, y, text, anchor, opacity: 0 });

// Z-order is the list order: frames, blocks, disks and Pods, the gauges, lanes and captions, chips.
export const SCENE = {
  'aria-label': 'CSI storage capacity tracking. Without it the Scheduler picks Node-1 with no view of its free space, the CSI controller then fails to create a 20Gi volume in a pool with 5Gi free, and scheduling starts over and can pick Node-1 again. With capacity tracking on, the external-provisioner in the CSI controller publishes one CSIStorageCapacity object per StorageClass and topology segment to the API server, 5Gi for Node-1 and 50Gi for Node-2, and because storageCapacity is true on the CSIDriver the Scheduler checks the claim against them in its filter phase, so Node-1 is filtered out and the volume and the Pod land on Node-2.',
  parts: [
    P.defs(),
    P.node({ key: 'node1', x: NODE_X[0], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.node({ key: 'node2', x: NODE_X[1], y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-2' }),
    P.node({ x: API_X, y: API_Y, w: API_W, h: API_H, label: 'API server' }),
    P.tag({ x: API_X + API_W - 12, y: API_Y + 18, anchor: 'end', text: 'CSIStorageCapacity' }),
    P.box({ key: 'sched', x: SCHED_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'Scheduler', sublabel: 'filter, then score' }),
    P.box({ key: 'ctrl', x: CTRL_X, y: ROW_Y, w: BOX_W, h: BOX_H, label: 'CSI controller', sublabel: 'external-provisioner' }),
    pool('pool1', 0, 'Pool 5Gi free'),
    pool('pool2', 1, 'Pool 50Gi free'),
    pod('podA', 'appA', 0),
    pod('podB', 'appB', 1),
    P.raw({ key: 'row1', make: gaugeRow(ROW1_Y, 5), opacity: 0 }),
    P.raw({ key: 'row2', make: gaugeRow(ROW2_Y, 50), opacity: 0 }),
    tag('lab1', API_X + 20, ROW1_Y + 12, 'node-1'),
    tag('lab2', API_X + 20, ROW2_Y + 12, 'node-2'),
    tag('val1', GAUGE_X + 5 * GI + 8, ROW1_Y + 12, '5Gi'),
    tag('val2', GAUGE_X + GAUGE_W + 8, ROW2_Y + 12, '50Gi'),
    P.relation({ key: 'reqLine', points: [[REQ_X, ROW1_Y - 10], [REQ_X, ROW2_Y + BAR_H + 10]], dash: '4 4', opacity: 0 }),
    tag('reqTag', REQ_X, ROW2_Y + BAR_H + 26, 'claim 20Gi', 'middle'),
    // The volume the Pod mounts lives in this pool: an identity spine, no ball rides it (STO.A-01).
    P.relation({ key: 'volLink', points: [[NODE_CX[1], POD_Y + POD_H], [NODE_CX[1], POOL_Y]], dash: '5 5', opacity: 0 }),
    lane('sel1', W_SEL[0]),
    lane('sel2', W_SEL[1]),
    lane('cv1', W_CV[0]),
    lane('cv2', W_CV[1]),
    lane('write', W_WRITE),
    lane('read', W_READ),
    P.wire({ key: 'api', x: API_X + API_W / 2, y: ROW_MY + 4 }),
    P.chip({ key: 'podChip', x: CHIPS.x(0), y: CHIPS_Y, w: CHIPS.w, h: 34, name: 'Pod', value: 'Pending' }),
    P.chip({ key: 'selChip', x: CHIPS.x(1), y: CHIPS_Y, w: CHIPS.w, h: 34, name: 'selected-node', value: 'none' }),
    P.chip({ key: 'capChip', x: CHIPS.x(2), y: CHIPS_Y, w: CHIPS.w, h: 34, name: 'capacity objects', value: 'none' }),
    P.chip({ key: 'resChip', x: CHIPS.x(3), y: CHIPS_Y, w: CHIPS.w, h: 34, name: 'result', value: 'unscheduled' }),
    P.packets(),
  ],
  reset: {
    keys: ['sched', 'ctrl', 'node1', 'node2', 'pool1', 'pool2', 'appA', 'appB',
      'podChip', 'selChip', 'capChip', 'resChip'],
    pods: ['podA', 'podB'],
  },
};

// Every step states every chip (P-01). A chip a ball earns is wound back in `rewind` and turns over
// on that ball's arrival (P-03).
const chips = (pod, sel, cap, res) => ({ podChip: pod, selChip: sel, capChip: cap, resChip: res });

// STO.S-01 as a field: every element born or removed mid-story, and every lane, on every step.
const LANES = ['sel1', 'sel2', 'cv1', 'cv2', 'write', 'read'];
const LEDGER = ['row1', 'row2', 'lab1', 'lab2', 'val1', 'val2'];
const stage = ({ lanes = [], ledger = 0, req = 0, podA = 0, podB = 0, n1 = 1, vol = 0 } = {}) => ({
  ...Object.fromEntries(LANES.map(k => [k, lanes.includes(k) ? 1 : 0])),
  ...Object.fromEntries(LEDGER.map(k => [k, ledger])),
  row1: ledger && n1 < 1 ? n1 : ledger, lab1: ledger && n1 < 1 ? n1 : ledger, val1: ledger && n1 < 1 ? n1 : ledger,
  reqLine: req, reqTag: req, podA, podB, node1: n1, pool1: n1, volLink: vol,
});

const fadeIn = (target, at, to) => F.fade({ target, from: 0, to, dur: FADE.in, at, fill: 'both', easing: 'ease-out' });
const dimAt = (target, at) => F.fade({ target, from: 1, to: OPACITY.notready, dur: FADE.in, at, fill: 'both', easing: 'ease-out' });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chipsCued: chips('Pending', 'none', 'none', 'unscheduled'),
    opacity: stage(),
  },
  {
    id: 'blind-pick',
    duration: 3800,
    narration: 'Without capacity tracking the Scheduler judges Nodes on CPU, memory, affinity and the rest, but not on free storage, and Node-1 wins. It records Node-1 as the selected Node on the claim and waits for a volume there. Only 5Gi is free in the Node-1 pool, but nothing tells the Scheduler that.',
    chipsCued: chips('Pending', 'node-1', 'none', 'waiting for volume'),
    wires: { api: 'no capacity objects yet' },
    opacity: stage({ lanes: ['sel1'], podA: OPACITY.pending }),
    lit: ['sched'],
    rewind: { chips: { selChip: 'none', resChip: 'unscheduled' } },
    // The choice travels from the Scheduler into Node-1, and the Pod appears there, waiting.
    flow: [
      F.route({ points: W_SEL[0], delay: BEAT.lead, name: 'sel', tag: { text: 'selected-node: node-1' } }),
      fadeIn('podA', 'sel', OPACITY.pending),
      F.set({ at: 'sel', chipsCued: { selChip: 'node-1', resChip: 'waiting for volume' } }),
    ],
  },
  {
    id: 'blind-fail',
    duration: 3800,
    narration: 'The CSI controller tries to create the 20Gi volume on Node-1 and fails, because the pool there has 5Gi. The selected Node is dropped and scheduling starts over, and with the same inputs it can land on Node-1 again. The Pod stays Pending.',
    chipsCued: chips('Pending', 'none', 'none', 'provision fails'),
    wires: { api: 'no capacity objects yet' },
    opacity: stage({ lanes: ['cv1'] }),
    lit: ['ctrl'],
    rewind: { opacity: { podA: OPACITY.pending }, chips: { selChip: 'node-1', resChip: 'waiting for volume' } },
    flow: [
      F.route({ points: W_CV[0], delay: BEAT.lead, name: 'cv', tag: { text: 'CreateVolume 20Gi' } }),
      F.light({ targets: ['pool1'], at: 'cv' }),
      // The Pod never ran, so the dim pulse with an opacity lift, or the blink is invisible. Then the
      // selected Node is dropped and the Pod leaves Node-1, pulse first (M-08).
      F.pulse({ pod: 'podA', dim: true, at: 'cv', from: OPACITY.pending, peak: 0.9 }),
      F.fade({ target: 'podA', from: OPACITY.pending, to: 0, dur: FADE.out, at: 'cv', plus: BEAT.afterPulse, fill: 'forwards', easing: 'ease-out' }),
      F.set({ at: 'cv', chipsCued: { selChip: 'none', resChip: 'provision fails' } }),
    ],
  },
  {
    id: 'publish',
    duration: 3000,
    narration: 'Turn on capacity tracking. The external-provisioner in the CSI controller, started with --enable-capacity, asks the driver for the free space in each topology segment and publishes one CSIStorageCapacity object per StorageClass and segment: 5Gi for Node-1, 50Gi for Node-2.',
    chipsCued: chips('Pending', 'none', '2 published', 'rescheduling'),
    opacity: stage({ lanes: ['write'], ledger: 1 }),
    lit: ['ctrl'],
    rewind: { opacity: stage({ lanes: ['write'] }), chips: { capChip: 'none' } },
    // The objects appear in the API server when the write lands, both on one beat.
    flow: [
      F.route({ points: W_WRITE, delay: BEAT.lead, name: 'pub' }),
      ...LEDGER.map(k => fadeIn(k, 'pub', 1)),
      F.set({ at: 'pub', chipsCued: { capChip: '2 published' } }),
    ],
  },
  {
    id: 'filter',
    duration: 3800,
    narration: 'The Scheduler uses those objects because storageCapacity is true on the CSIDriver and the class binds WaitForFirstConsumer. Its filter phase checks the 20Gi claim against them, and 20Gi does not fit in 5Gi, so Node-1 is filtered out before scoring and Node-2 is the only candidate.',
    chipsCued: chips('Pending', 'none', '2 published', 'node-1 filtered out'),
    opacity: stage({ lanes: ['read'], ledger: 1, req: 1, n1: OPACITY.notready }),
    rewind: { opacity: stage({ lanes: ['read'], ledger: 1 }), chips: { resChip: 'rescheduling' } },
    // The claim line comes up first, the read carries both rows to the Scheduler, and Node-1 dims on arrival.
    flow: [
      fadeIn('reqLine', 0, 1),
      fadeIn('reqTag', 0, 1),
      F.route({ points: W_READ, delay: BEAT.lead, name: 'read' }),
      F.light({ targets: ['sched'], at: 'read' }),
      ...['node1', 'pool1', 'row1', 'lab1', 'val1'].map(k => dimAt(k, 'read')),
      F.set({ at: 'read', chipsCued: { resChip: 'node-1 filtered out' } }),
    ],
  },
  {
    id: 'success',
    duration: 5600,
    narration: 'The Scheduler records Node-2 as the selected Node, the CSI controller creates the volume in the Node-2 pool, the claim binds, and the Pod starts there. It finds room on the first try because the Scheduler looked before it picked, though capacity that changes after it was published can still force a retry.',
    chipsCued: chips('Running on node-2', 'node-2', '2 published', 'provisioned'),
    opacity: stage({ lanes: ['sel2', 'cv2'], ledger: 1, req: 1, n1: OPACITY.notready, podB: 1, vol: 1 }),
    lit: ['sched', 'ctrl'],
    rewind: {
      opacity: { podB: 0, cv2: 0, volLink: 0 },
      chips: { podChip: 'Pending', selChip: 'none', resChip: 'node-1 filtered out' },
    },
    // Scheduler into Node-2, then the controller provisions there and the Pod starts on that arrival.
    flow: [
      F.route({ points: W_SEL[1], delay: BEAT.lead, name: 'sel', tag: { text: 'selected-node: node-2' } }),
      fadeIn('podB', 'sel', OPACITY.pending),
      F.set({ at: 'sel', chipsCued: { selChip: 'node-2' } }),
      fadeIn('cv2', 'sel', 1),
      F.route({ points: W_CV[1], at: 'sel', plus: BEAT.lead, name: 'cv', tag: { text: 'CreateVolume 20Gi' } }),
      F.light({ targets: ['pool2'], at: 'cv' }),
      F.fade({ target: 'podB', from: OPACITY.pending, to: 1, dur: FADE.in, at: 'cv', fill: 'forwards', easing: 'ease-out' }),
      F.pulse({ pod: 'podB', at: 'cv' }),
      fadeIn('volLink', 'cv', 1),
      F.set({ at: 'cv', chipsCued: { podChip: 'Running on node-2', resChip: 'provisioned' } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
