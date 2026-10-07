import { P, F, defineCard, midX, strip, spread, ladder, shade, CLU, BEAT, FADE, REVEAL_MS } from './cluster-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/cluster-image-container-gc.md

// Two stores on one disk, not a sequence: an image bar carved per image, and a roster of dead containers under it.
// The panel nearly touches the Node frame top, so no narration may pass 360 characters.
const M = CLU.M;
const CONTENT_L = M, CONTENT_R = 1200 - M;
const CX = midX(CONTENT_L, CONTENT_R);

const BOX_W = CLU.BOX_W, BOX_H = CLU.BOX_H;
const TOP_Y = CLU.TOP_Y, TOP_BOTTOM = TOP_Y + BOX_H;
const TOP_CY = midX(TOP_Y, TOP_BOTTOM);
// The Kubelet is centred on the Node, so its delete lane is a straight drop.
const KUBE_X = CX - BOX_W / 2, KUBE_R = KUBE_X + BOX_W;
// cAdvisor takes stats on its left face and sends them from its top face, so neither lane needs a second turn.
const CAD_X = CONTENT_R - BOX_W;
const CAD_Y = 160, CAD_BOTTOM = CAD_Y + BOX_H;
const CAD_CX = midX(CAD_X, CONTENT_R);
const CAD_CY = midX(CAD_Y, CAD_BOTTOM);

const NODE_X = CONTENT_L, NODE_W = CONTENT_R - CONTENT_L;
// Not a CLU.L-01 frame: it holds no Pod.
const NODE_Y = 316, NODE_H = 216;

// Mirrored about the Node top face midpoint, the deliberate pair L-12 reads.
const FACE_DX = CLU.LANE_DY;
const OUT_X = CX - FACE_DX, IN_X = CX + FACE_DX;

// One turn at most, every leg orthogonal.
const DISK_TO_CADVISOR = [[IN_X, NODE_Y], [IN_X, CAD_CY], [CAD_X, CAD_CY]];
const CADVISOR_TO_KUBELET = [[CAD_CX, CAD_Y], [CAD_CX, TOP_CY], [KUBE_R, TOP_CY]];
const KUBELET_TO_DISK = [[OUT_X, TOP_BOTTOM], [OUT_X, NODE_Y]];

// Centred over the horizontal leg it labels, 10 clear of it.
const WIRE_STATS_X = midX(IN_X, CAD_X), WIRE_STATS_Y = CAD_CY - 10;
// Anchored end, left of the drop: the stats riser owns everything right of it.
const WIRE_DEL_X = OUT_X - 12, WIRE_DEL_Y = 285;

// The image filesystem as a ruler, 10 units per percent: the last segment's right edge is the usage reading.
const TRACK_X = 100, TRACK_W = 1000, TRACK_R = TRACK_X + TRACK_W;      // 100..1100
const pct = (p) => TRACK_X + p * (TRACK_W / 100);
// Measured clear of the Node frame label glyph box.
const CAP_Y = NODE_Y + 38;  // the caption and threshold row
const MARK_Y = NODE_Y + 44, MARK_H = 12, MARK_W = 3;  // standing on the bar top edge
const BAR_Y = NODE_Y + 56, BAR_H = 56;
const LOW = 80, HIGH = 85;

// Fixed width, derived gap.
const SLOT_W = 155, SLOT_H = 56;
const SLOT_Y = NODE_Y + 148;
const SLOT = spread({ from: TRACK_X, to: TRACK_R, count: 6, w: SLOT_W });
const CNT_CAP_Y = NODE_Y + 140;

// Chips as a bottom strip, three per row.
const CHIP_H = CLU.CHIP_H, CHIP_GAP = 14, CHIP_VGAP = 8, CHIP_COLS = 3;
const CHIPS_Y = NODE_Y + NODE_H + 14;
const CHIP_COL = strip({ from: CONTENT_L, to: CONTENT_R, count: CHIP_COLS, gap: CHIP_GAP });
const CHIP_W = CHIP_COL.w;
const CHIP_ROW = ladder({ y: CHIPS_Y, rowH: CHIP_H, gap: CHIP_VGAP });
// The strip is a grid: the index wraps across the columns and steps down every third.
const CHIP_X = i => CHIP_COL.x(i % CHIP_COLS);
const CHIP_Y = i => CHIP_ROW(Math.floor(i / CHIP_COLS));

// Presentation shades, not lifecycle phases. Copied cluster tint channels, since a presentation attribute cannot resolve a token.
const DISK = Object.freeze({
  track:  'rgba(255, 255, 255, 0.04)',
  stroke: 'rgba(125, 134, 255, 0.35)',
  mark:   'rgba(192, 176, 255, 0.9)',
});

// One image to scale on the ruler, newest to oldest left to right, so the sweep eats from the right.
const IMAGES = [
  { key: 'segNginx',   label: 'nginx:1.27',    age: 'last used 12m', from: 0,  to: 31 },
  { key: 'segRedis',   label: 'redis:7.2',     age: 'last used 6h',  from: 31, to: 58 },
  { key: 'segFluentd', label: 'fluentd:v1.17', age: 'last used 9d',  from: 58, to: 78 },
  { key: 'segEnvoy',   label: 'envoy:v1.31',   age: 'last used 41d', from: 78, to: 89 },
];
const segment = ({ key, label, age, from, to }) =>
  P.box({ key, x: pct(from), y: BAR_Y, w: pct(to) - pct(from), h: BAR_H, rx: 0, label, sublabel: age });

// The last Pod is deleted while its container is still on disk, the case MinAge governs on its own.
const DEAD = [
  { key: 'dead0', label: 'Pod api-0', sublabel: 'dead · 41m' },
  { key: 'dead1', label: 'Pod api-0', sublabel: 'dead · 26m' },
  { key: 'dead2', label: 'Pod api-0', sublabel: 'dead · 4m' },
  { key: 'dead3', label: 'Pod web-0', sublabel: 'dead · 33m' },
  { key: 'dead4', label: 'Pod web-0', sublabel: 'dead · 11m' },
  { key: 'dead5', label: 'Pod job-1', sublabel: 'owner gone · 18m' },
];
const slot = ({ key, label, sublabel }, i) =>
  P.box({ key, x: SLOT.x(i), y: SLOT_Y, w: SLOT_W, h: SLOT_H, label, sublabel });

// A bare rect: a P.box would carry a label the ruler must not have. P.raw is the one way to a naked rect.
const bare = (attrs, style) => P.raw({
  make: () => { const r = rect(attrs); Object.assign(r.style, style); return r; },
});

// Append order is z-order: lanes and labels, chips, the Node frame and its contents, packets, then the actors.
export const SCENE = {
  'aria-label': 'Node disk garbage collection: cAdvisor measuring the image filesystem for the image manager inside the Kubelet, the image store swept above HighThresholdPercent in the order the images were last used, imageMaximumGCAge taking an image nothing has used for long enough whatever the disk reads, and a row of dead containers held to MinAge, MaxPerPodContainer and MaxContainers',
  parts: [
    P.defs(),
    P.lane({ points: DISK_TO_CADVISOR, dim: true, dashed: true }),
    P.lane({ points: CADVISOR_TO_KUBELET, dim: true, dashed: true }),
    P.lane({ points: KUBELET_TO_DISK, dim: true, dashed: true }),
    P.wire({ key: 'stats', x: WIRE_STATS_X, y: WIRE_STATS_Y }),
    P.wire({ key: 'del', x: WIRE_DEL_X, y: WIRE_DEL_Y, anchor: 'end' }),
    P.chip({ key: 'usageChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: CHIP_H, name: 'imagefs usage',      value: 'not measured' }),
    P.chip({ key: 'countChip',  x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: CHIP_H, name: 'images on disk',     value: '4' }),
    P.chip({ key: 'maxAgeChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: CHIP_H, name: 'imageMaximumGCAge',  value: '168h here · 0s by default' }),
    P.chip({ key: 'minAgeChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: CHIP_H, name: 'MinAge',             value: 'the floor · 0 disables' }),
    P.chip({ key: 'perPodChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: CHIP_H, name: 'MaxPerPodContainer', value: '2 here · under 0 disables' }),
    P.chip({ key: 'maxChip',    x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: CHIP_H, name: 'MaxContainers',      value: 'all Pods · under 0 disables' }),
    P.node({ key: 'nodeEl', x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' }),
    P.tag({ x: TRACK_X, y: CAP_Y, anchor: 'start', text: 'image store · imagefs' }),
    P.tag({ x: pct(LOW) - 4, y: CAP_Y, anchor: 'end', text: 'LowThresholdPercent 80' }),
    P.tag({ x: pct(HIGH) + 4, y: CAP_Y, anchor: 'start', text: 'HighThresholdPercent 85' }),
    bare({ x: TRACK_X, y: BAR_Y, width: TRACK_W, height: BAR_H, rx: 4, ry: 4 },
      { fill: DISK.track, stroke: DISK.stroke, strokeWidth: '1.2' }),
    // One group so a single reveal brings the disk up, while each image keeps its own key.
    P.group({ key: 'imgStore', parts: IMAGES.map(segment) }),
    bare({ x: pct(LOW) - MARK_W / 2, y: MARK_Y, width: MARK_W, height: MARK_H }, { fill: DISK.mark }),
    bare({ x: pct(HIGH) - MARK_W / 2, y: MARK_Y, width: MARK_W, height: MARK_H }, { fill: DISK.mark }),
    P.tag({ x: TRACK_X, y: CNT_CAP_Y, anchor: 'start', text: 'container store · dead containers' }),
    P.group({ key: 'cntStore', parts: DEAD.map(slot) }),
    P.packets(),
    // Actors last, so a ball passes behind their labels.
    P.box({ key: 'kubelet',  x: KUBE_X, y: TOP_Y, w: BOX_W, h: BOX_H, label: 'Kubelet',  sublabel: 'image manager' }),
    P.box({ key: 'cadvisor', x: CAD_X,  y: CAD_Y, w: BOX_W, h: BOX_H, label: 'cAdvisor', sublabel: 'filesystem usage stats' }),
  ],
  reset: {
    keys: [
      'kubelet', 'cadvisor',
      ...IMAGES.map(i => i.key), ...DEAD.map(d => d.key),
      'usageChip', 'countChip', 'maxAgeChip', 'minAgeChip', 'perPodChip', 'maxChip',
    ],
  },
};

// One list for both stores, so a step cannot pin all but one.
const ON_DISK = [...IMAGES.map(i => i.key), ...DEAD.map(d => d.key)];
const STORES = ['imgStore', 'cntStore'];
// Both stores stand at full from the poster on, and each later state carries the deletions so far.
const STANDING = { ...shade(STORES, 1), ...shade(ON_DISK, 1) };
const SWEPT = { ...STANDING, segEnvoy: 0 };
const AGED = { ...SWEPT, segFluentd: 0 };
const TRIMMED = { ...AGED, dead0: 0, dead5: 0 };

// Every step writes every chip, so the bar and the counts never disagree.
const MAX_AGE = '168h here · 0s by default';
const MIN_AGE = 'the floor · 0 disables';
const PER_POD = '2 here · under 0 disables';
const MAX_ALL = 'all Pods · under 0 disables';
const DIALS = { maxAgeChip: MAX_AGE, minAgeChip: MIN_AGE, perPodChip: PER_POD, maxChip: MAX_ALL };
const UNREAD = { usageChip: 'not measured', countChip: '4', ...DIALS };
const MEASURED = { usageChip: '89 percent', countChip: '4', ...DIALS };
const AFTER_SWEEP = { usageChip: '78 percent', countChip: '3', ...DIALS };
const AFTER_AGE = { usageChip: '58 percent', countChip: '2', ...DIALS };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: UNREAD,
    opacity: STANDING,
  },
  {
    id: 'stores',
    duration: 3000,
    narration: 'One Node fills its own disk from two directions, and the Kubelet counts the two stores separately. Container images pile up in the image store, dead containers pile up beside them, and each store has its own clock: unused images are collected every five minutes and unused containers every minute.',
    chips: UNREAD,
    opacity: STANDING,
    lit: ['kubelet'],
    // The two stores light one after the other, image side first.
    flow: [
      F.light({ targets: IMAGES.map(i => i.key), delay: BEAT.lead }),
      F.light({ targets: DEAD.map(d => d.key), delay: BEAT.lead + REVEAL_MS }),
    ],
  },
  {
    id: 'watch',
    duration: 3400,
    narration: 'The image manager inside the Kubelet does not measure the disk itself. It takes filesystem usage from cAdvisor and holds that reading against HighThresholdPercent, which is imageGCHighThresholdPercent in the Kubelet configuration and 85 percent by default. At 89 percent this Node is over the mark.',
    chips: MEASURED,
    wires: { stats: 'imagefs usage 89 percent' },
    opacity: STANDING,
    lit: ['usageChip'],
    // Both hold what cAdvisor has reported, so both fill on the beat the reading lands (T-30).
    rewind: { chips: { usageChip: 'not measured' }, wires: { stats: '' } },
    flow: [
      F.route({ points: DISK_TO_CADVISOR, delay: BEAT.lead, name: 'stats', lights: ['cadvisor'] }),
      F.set({ at: 'stats', wires: { stats: 'imagefs usage 89 percent' } }),
      F.route({ points: CADVISOR_TO_KUBELET, after: 'stats', name: 'report', lights: ['kubelet'] }),
      F.set({ at: 'report', chips: { usageChip: '89 percent' } }),
    ],
  },
  {
    id: 'sweep',
    duration: 3300,
    narration: 'Above the high mark the Kubelet deletes images in the order they were last used, oldest first, and it stops as soon as usage is back at LowThresholdPercent, which is imageGCLowThresholdPercent and 80 by default. The 41 day envoy:v1.31 goes, usage lands on 78, and fluentd:v1.17 survives a sweep it was next in line for.',
    chips: AFTER_SWEEP,
    wires: { del: 'delete · oldest last used first' },
    opacity: SWEPT,
    lit: ['kubelet', 'usageChip', 'countChip'],
    // Counts and segment hold until the delete lands, the opacity wind-back keeps the pin and the fade from fighting.
    rewind: { chips: { usageChip: '89 percent', countChip: '4' }, opacity: { segEnvoy: 1 } },
    flow: [
      F.route({ points: KUBELET_TO_DISK, delay: BEAT.lead, name: 'del' }),
      F.fade({ target: 'segEnvoy', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'forwards' }),
      F.set({ at: 'del', chips: { usageChip: '78 percent', countChip: '3' } }),
    ],
  },
  {
    id: 'max-age',
    duration: 3300,
    narration: 'A second rule ignores the disk entirely: imageMaximumGCAge deletes an image that has gone unused for longer than that, whatever the usage reads. Set to 168h here, it takes fluentd:v1.17 at nine days even though 78 percent is already under the low mark. That tracked age does not survive a Kubelet restart, which starts the wait again.',
    chips: AFTER_AGE,
    wires: { del: 'delete · unused past imageMaximumGCAge' },
    opacity: AGED,
    lit: ['kubelet', 'usageChip', 'countChip', 'maxAgeChip'],
    // segEnvoy is not wound back: it died on the step before.
    rewind: { chips: { usageChip: '78 percent', countChip: '3' }, opacity: { segFluentd: 1 } },
    flow: [
      F.route({ points: KUBELET_TO_DISK, delay: BEAT.lead, name: 'del' }),
      F.fade({ target: 'segFluentd', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'forwards' }),
      F.set({ at: 'del', chips: { usageChip: '58 percent', countChip: '2' } }),
    ],
  },
  {
    id: 'containers',
    duration: 3400,
    narration: 'Dead containers are a separate budget on three dials. MinAge is the floor below which nothing is collected, MaxPerPodContainer caps what one Pod keeps, and MaxContainers caps the total and lowers the per Pod cap to fit. Pod api-0 holds three against a cap of two here, so its oldest goes, and the container whose Pod is gone goes once it passes MinAge.',
    chips: AFTER_AGE,
    wires: { del: 'delete · over the per Pod cap, and one orphan' },
    opacity: TRIMMED,
    lit: ['kubelet', 'minAgeChip', 'perPodChip', 'maxChip'],
    // Without this rewind the pin empties both slots on entry and the fades pop them back mid-step.
    rewind: { opacity: { dead0: 1, dead5: 1 } },
    flow: [
      F.route({ points: KUBELET_TO_DISK, delay: BEAT.lead, name: 'del' }),
      F.fade({ target: 'dead0', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'forwards' }),
      F.fade({ target: 'dead5', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'forwards' }),
    ],
  },
  {
    id: 'handoff',
    duration: 2900,
    narration: 'All of this is the Kubelet reclaiming Node resources before it has to touch a running Pod. Once a disk signal like imagefs.available crosses its own eviction threshold, reclaiming is no longer enough on its own and the Kubelet starts failing Pods, which is where the Node-pressure Eviction card picks the story up.',
    chips: AFTER_AGE,
    opacity: TRIMMED,
    // No ball and no Pod: the step names no new traffic (M-27).
    lit: ['kubelet'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
