import { P, F, defineCard, chipStrip, BEAT, OPACITY, FADE, makeRidingLabel } from './storage-kit.js';
import { rect, line } from '../../lib/svg.js';
// Design notes for this card: ./CARDS/storage-ephemeral-storage-eviction.md


// Top row right of the panel: the Pod, then the Kubelet on the Pod centre line (the SIZES line).
const POD_X = 484, POD_Y = 80, POD_W = 232, POD_H = 104;                  // 484..716 / 80..184
const POD_R = POD_X + POD_W, POD_CX = POD_X + POD_W / 2, POD_CY = POD_Y + POD_H / 2;
const APP_DX = 20, APP_DY = 34, APP_W = 192, APP_H = 44;
const KUBE_W = 232, KUBE_H = 80, KUBE_X = 884, KUBE_Y = POD_CY - KUBE_H / 2;   // 884..1116 / 92..172
const KUBE_CX = KUBE_X + KUBE_W / 2, KUBE_B = KUBE_Y + KUBE_H;

// The gauge: where web-a's bytes land on Node-1, full width below the panel (measured in the record).
const G_X = 120, G_W = 960, G_Y = 300, G_H = 168;                        // 120..1080 / 300..468
const ROW_H = 36, ROW_A_Y = G_Y + 36, ROW_B_Y = ROW_A_Y + ROW_H + 16;    // 336 / 388
const ROW_B_BOTTOM = ROW_B_Y + ROW_H;                                    // 424
const LABEL_X = G_X + 16;

// ONE linear scale for both rows, 0 to 1.25Gi, so a length IS a quantity.
const SCALE_X = 320, SCALE_W = 720, SCALE_MI = 1280;
const px = (mi) => (mi * SCALE_W) / SCALE_MI;
const xOf = (mi) => SCALE_X + px(mi);
const REQUEST_MI = 512, LIMIT_MI = 1024;
const WR_MI = 300, LOG_MI = 400, ED_MI = 400;                             // container 700, Pod 1100
const X_REQ = xOf(REQUEST_MI), X_LIM = xOf(LIMIT_MI);                       // 608 / 896

// Segment n of a row starts where the ones before it end: writable, log, then the emptyDir.
const SEG_MI = [WR_MI, LOG_MI, ED_MI];
const segX = (n) => xOf(SEG_MI.slice(0, n).reduce((a, b) => a + b, 0));
const segW = (n) => px(SEG_MI[n]);
const A_END = segX(2), B_END = segX(3);                                   // 713.75 / 938.75

// Each lane and its ball share one array. The scan pair is mirrored on both faces (L-12).
const LANE_DY = 12;
const W_WRITE = [[POD_CX, POD_Y + POD_H], [POD_CX, G_Y]];
const W_SCAN = [[KUBE_CX - LANE_DY, KUBE_B], [KUBE_CX - LANE_DY, G_Y]];
const W_BACK = [[KUBE_CX + LANE_DY, G_Y], [KUBE_CX + LANE_DY, KUBE_B]];
const W_EVICT = [[KUBE_X, POD_CY], [POD_R, POD_CY]];

const CHIP_Y = G_Y + G_H + 24, CHIP_H = 34;                              // 492
const CH = chipStrip({ w: (G_W - 3 * 16) / 4, gap: 16, count: 4 });         // 228: the strip spans the gauge, 120..1080

// Every ball rides routeDur, as on storage-emptydir, and each tag shows from departure and lives
// exactly as long as its ball (M-30a), outside its lane and clear of both faces at rest (the record).
const tagFn = makeRidingLabel({ role: 'storage', inMs: 200, outMs: 200, hold: 0 });
const WRITE_TAG = { dx: 40, dy: 16, fn: tagFn };
const SCAN_TAG = { dx: -40, dy: 16, fn: tagFn };
const BACK_TAG = { dx: 40, dy: 16, fn: tagFn };
const EVICT_TAG = { dx: -36, dy: -26, fn: tagFn };

// Presentation shades of the jade tint, not lifecycle states: a byte count is not a phase.
const INK = Object.freeze({
  frame: 'rgba(94, 202, 148, 0.35)',
  track: 'rgba(94, 202, 148, 0.22)',
  seg: ['rgba(94, 202, 148, 0.55)', 'rgba(94, 202, 148, 0.34)', 'rgba(94, 202, 148, 0.16)'],
  edge: 'rgba(94, 202, 148, 0.8)',
});
const bare = (x, y, w, h, fill, stroke, dash) => {
  const r = rect({ x, y, width: w, height: h, rx: 4, ry: 4 });
  r.style.fill = fill;
  r.style.stroke = stroke;
  r.style.strokeWidth = '1.2';
  if (dash) r.style.strokeDasharray = dash;
  return r;
};
// A segment is a bare rect whose inline width IS the value: box() would label it and centre on it.
const seg = (key, rowY, n) => P.raw({
  key,
  make: () => bare(segX(n), rowY, segW(n), ROW_H, INK.seg[n], INK.edge, n === 2 ? '4 3' : null),
});
const track = (rowY, end) => P.raw({ make: () => bare(SCALE_X, rowY, end - SCALE_X, ROW_H, 'rgba(255, 255, 255, 0.03)', INK.track) });
// The limit is the one line the whole card is read against, so it is drawn at full jade rather
// than at the 0.45 a relation sinks to. One segment, no caps.
const limitLine = () => {
  const l = line({ x1: X_LIM, y1: ROW_A_Y - 8, x2: X_LIM, y2: ROW_B_BOTTOM + 8 });
  l.style.stroke = 'var(--storage-color)';
  l.style.strokeWidth = '1.4';
  l.style.strokeDasharray = '5 4';
  return l;
};
// The request tick is solid: a dashed relation over 14 units shows one dash at 0.45 and vanishes.
const requestTick = () => {
  const l = line({ x1: X_REQ, y1: ROW_B_BOTTOM + 2, x2: X_REQ, y2: ROW_B_BOTTOM + 14 });
  l.style.stroke = 'var(--storage-color)';
  l.style.strokeWidth = '1.4';
  return l;
};
const SEG_KEYS = { a0: [ROW_A_Y, 0], a1: [ROW_A_Y, 1], b0: [ROW_B_Y, 0], b1: [ROW_B_Y, 1], b2: [ROW_B_Y, 2] };
const SUB = 'scheme-box-sublabel';

// Z-order (bottom -> top): the gauge and its marks, the Pods and the Kubelet, the lanes, the chip
// strip, then the packet layer.
export const SCENE = {
  'aria-label': 'Ephemeral storage limit: Pod web-a on Node-1 requests 512Mi and is limited to 1Gi of local ephemeral storage. Its app writes 300Mi to its writable layer, 400Mi of log and 400Mi into a disk emptyDir, and a gauge drawn to scale shows the container sum of 700Mi inside the limit and the Pod sum of 1100Mi over it. The Kubelet reads the measured usage on its eviction loop, finds the Pod total over the 1Gi sum of container limits and evicts the whole Pod, which ends Failed with reason Evicted while Node-1 still has disk to spare. The Pod is not restarted in place, and its ReplicaSet creates web-b, which starts from zero.',
  parts: [
    P.defs(),
    P.raw({ make: () => bare(G_X, G_Y, G_W, G_H, 'rgba(255, 255, 255, 0.02)', INK.frame) }),
    P.tag({ key: 'titleA', cls: SUB, x: LABEL_X, y: G_Y + 22, anchor: 'start', text: 'Node-1 local storage used by Pod web-a' }),
    P.tag({ key: 'titleB', cls: SUB, x: LABEL_X, y: G_Y + 22, anchor: 'start', text: 'Node-1 local storage used by Pod web-b', opacity: 0 }),
    P.tag({ cls: 'scheme-box-label', x: LABEL_X, y: ROW_A_Y + 15, anchor: 'start', text: 'Container app' }),
    P.tag({ cls: SUB, x: LABEL_X, y: ROW_A_Y + 30, anchor: 'start', text: 'writable layer + log' }),
    P.tag({ key: 'rowA', cls: 'scheme-box-label', x: LABEL_X, y: ROW_B_Y + 15, anchor: 'start', text: 'Pod web-a' }),
    P.tag({ key: 'rowB', cls: 'scheme-box-label', x: LABEL_X, y: ROW_B_Y + 15, anchor: 'start', text: 'Pod web-b', opacity: 0 }),
    P.tag({ cls: SUB, x: LABEL_X, y: ROW_B_Y + 30, anchor: 'start', text: '+ emptyDir /scratch' }),
    track(ROW_A_Y, SCALE_X + SCALE_W),
    track(ROW_B_Y, SCALE_X + SCALE_W),
    ...Object.entries(SEG_KEYS).map(([k, [y, n]]) => seg(k, y, n)),
    P.tag({ key: 'lbl0', cls: SUB, x: segX(0) + segW(0) / 2, y: ROW_B_Y + ROW_H / 2 + 4, text: 'writable 300Mi' }),
    P.tag({ key: 'lbl1', cls: SUB, x: segX(1) + segW(1) / 2, y: ROW_B_Y + ROW_H / 2 + 4, text: 'log 400Mi' }),
    P.tag({ key: 'lbl2', cls: SUB, x: segX(2) + segW(2) / 2, y: ROW_B_Y + ROW_H / 2 + 4, text: 'emptyDir 400Mi' }),
    P.tag({ key: 'verdictA', cls: SUB, x: A_END + 10, y: ROW_A_Y + ROW_H / 2 + 4, anchor: 'start', text: '700Mi, within' }),
    P.tag({ key: 'verdictB', cls: SUB, x: B_END + 10, y: ROW_B_Y + ROW_H / 2 + 4, anchor: 'start', text: '1100Mi, over' }),
    // The limit is one line through both rows, the request a tick under them, each at its true value.
    P.raw({ make: limitLine }),
    P.raw({ make: requestTick }),
    P.tag({ cls: SUB, x: X_LIM, y: ROW_B_BOTTOM + 28, text: 'limit 1Gi' }),
    P.tag({ key: 'reqCap', cls: SUB, x: X_REQ, y: ROW_B_BOTTOM + 28, text: 'request 512Mi' }),
    P.pod({
      key: 'podA', innerKey: 'appA', x: POD_X, y: POD_Y, w: POD_W, h: POD_H,
      label: 'Pod web-a', sublabel: '', containers: 0,
      inner: { dx: APP_DX, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'request 512Mi, limit 1Gi' },
    }),
    P.pod({
      key: 'podB', innerKey: 'appB', x: POD_X, y: POD_Y, w: POD_W, h: POD_H, opacity: 0,
      label: 'Pod web-b', sublabel: '', containers: 0,
      inner: { dx: APP_DX, dy: APP_DY, w: APP_W, h: APP_H, label: 'app', sublabel: 'request 512Mi, limit 1Gi' },
    }),
    P.box({ key: 'kubelet', x: KUBE_X, y: KUBE_Y, w: KUBE_W, h: KUBE_H, label: 'Kubelet', sublabel: 'eviction manager' }),
    P.lane({ key: 'wLane', points: W_WRITE, dashed: true, dim: true }),
    P.lane({ key: 'eLane', points: W_EVICT, dashed: true, dim: true }),
    P.lane({ points: W_SCAN, dashed: true, dim: true }),
    P.lane({ points: W_BACK, dashed: true, dim: true }),
    P.chip({ key: 'reqChip', x: CH.x(0), y: CHIP_Y, w: CH.w, h: CHIP_H, name: 'request', value: '512Mi' }),
    P.chip({ key: 'useChip', x: CH.x(1), y: CHIP_Y, w: CH.w, h: CHIP_H, name: 'usage', value: '0' }),
    P.chip({ key: 'podChip', x: CH.x(2), y: CHIP_Y, w: CH.w, h: CHIP_H, name: 'Pod web-a', value: 'Running' }),
    P.chip({ key: 'diskChip', x: CH.x(3), y: CHIP_Y, w: CH.w, h: CHIP_H, name: 'Node-1', value: 'no DiskPressure' }),
    P.packets(),
  ],
  reset: {
    keys: ['kubelet', 'appA', 'appB', 'reqChip', 'useChip', 'podChip', 'diskChip'],
    pods: ['podA', 'podB'],
  },
};

// STO.S-01 and A-16 as one factory: the two lanes into the Pod slot live only while a Pod is there.
const stage = ({ a = 1, b = 0, fill = 0, verdict = 0 } = {}) => {
  const lane = a === 1 || b === 1 ? 1 : 0;
  return {
    podA: a, podB: b, wLane: lane, eLane: lane,
    titleA: b === 1 ? 0 : 1, rowA: b === 1 ? 0 : 1, titleB: b, rowB: b,
    lbl0: fill >= 1 ? 1 : 0, lbl1: fill >= 2 ? 1 : 0, lbl2: fill >= 3 ? 1 : 0,
    verdictA: verdict, verdictB: verdict,
  };
};

// No field writes an inline width or a tag fill, so every step paints the gauge whole.
const WIDTH = { a0: segW(0), a1: segW(1), b0: segW(0), b1: segW(1), b2: segW(2) };
const paint = ({ fill = 0, reqLit = false } = {}) => (s) => {
  const on = { a0: fill >= 1, b0: fill >= 1, a1: fill >= 2, b1: fill >= 2, b2: fill >= 3 };
  for (const k of Object.keys(WIDTH)) s.refs[k].style.width = `${on[k] ? WIDTH[k] : 0}px`;
  s.refs.reqCap.style.fill = reqLit ? 'var(--storage-color)' : '';
};
// A segment grows as the ball that carries its bytes lands, from nothing to its drawn value.
const grow = (keys, when) => keys.map(target => F.anim({
  target, at: when,
  keyframes: [{ width: '0px' }, { width: `${WIDTH[target]}px` }],
  options: { duration: 500, fill: 'both', easing: 'ease-out' },
}));
const drain = (keys) => keys.map(target => F.anim({
  target, delay: 0,
  keyframes: [{ width: `${WIDTH[target]}px` }, { width: '0px' }],
  options: { duration: FADE.out, fill: 'both', easing: 'ease-in' },
}));

// The request reads `reserved` from the step that places the Pod onward, since it stays reserved.
const chips = (use, pod, req = '512Mi reserved') => ({ reqChip: req, useChip: use, podChip: pod, diskChip: 'no DiskPressure' });
const FULL = '1100Mi on disk';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chips('0', 'Running', '512Mi'),
    opacity: stage(),
    enter: paint(),
  },
  {
    id: 'request',
    duration: 2600,
    narration: 'Pod web-a has one container, app, with requests.ephemeral-storage 512Mi and limits.ephemeral-storage 1Gi. The request is what placement counts: web-a runs on Node-1 because 512Mi of its allocatable local storage was not yet requested. A request reserves room and caps nothing.',
    chips: chips('0', 'Running'),
    opacity: stage(),
    rewind: { chips: { reqChip: '512Mi' } },
    enter: paint({ reqLit: true }),
    flow: [
      F.pulse({ pod: 'podA' }),
      F.set({ delay: BEAT.afterPulse, chips: { reqChip: '512Mi reserved' }, lights: ['reqChip'] }),
    ],
  },
  {
    id: 'write',
    duration: 4400,
    narration: 'The app writes three kinds of bytes to Node-1 local storage: temp files go to its writable layer, stdout to its log file, and /scratch is an emptyDir on disk. All three count for the Pod, but only the writable layer and the log count for the container. The limit refuses no write.',
    chips: chips(FULL, 'Running'),
    opacity: stage({ fill: 3 }),
    rewind: { chips: { useChip: '0' } },
    enter: paint({ fill: 3 }),
    // The Pod blinks as one, app included, and its first ball leaves after the blink (STO.C-02). Each
    // landing grows its segment in every row it counts in, so the emptyDir alone grows the Pod row.
    flow: [
      F.pulse({ pod: 'podA' }),
      F.route({ points: W_WRITE, delay: BEAT.afterPulse, name: 'w1' }),
      F.tag({ text: 'temp files', points: W_WRITE, delay: BEAT.afterPulse, ...WRITE_TAG }),
      ...grow(['a0', 'b0'], 'w1'),
      F.reveal({ target: 'lbl0', at: 'w1' }),
      F.set({ at: 'w1', chips: { useChip: '300Mi on disk' }, lights: ['useChip'] }),
      F.route({ points: W_WRITE, after: 'w1', name: 'w2' }),
      F.tag({ text: 'stdout', points: W_WRITE, after: 'w1', ...WRITE_TAG }),
      ...grow(['a1', 'b1'], 'w2'),
      F.reveal({ target: 'lbl1', at: 'w2' }),
      F.set({ at: 'w2', chips: { useChip: '700Mi on disk' } }),
      F.route({ points: W_WRITE, after: 'w2', name: 'w3' }),
      F.tag({ text: '/scratch', points: W_WRITE, after: 'w2', ...WRITE_TAG }),
      ...grow(['b2'], 'w3'),
      F.reveal({ target: 'lbl2', at: 'w3' }),
      F.set({ at: 'w3', chips: { useChip: FULL } }),
    ],
  },
  {
    id: 'scan',
    duration: 3600,
    narration: 'The Kubelet never sees a write happen. Every 10 seconds its eviction loop reads the usage it last measured, by periodic directory scans, or for an emptyDir by project quotas where that beta gate, user namespaces and filesystem quotas are all enabled. Pod web-a comes back at 1100Mi.',
    chips: chips('1100Mi measured', 'Running'),
    opacity: stage({ fill: 3 }),
    lit: ['kubelet'],
    rewind: { chips: { useChip: FULL } },
    enter: paint({ fill: 3 }),
    flow: [
      F.route({ points: W_SCAN, delay: BEAT.lead, name: 'scan' }),
      F.tag({ text: 'read usage', points: W_SCAN, delay: BEAT.lead, ...SCAN_TAG }),
      F.route({ points: W_BACK, after: 'scan', name: 'back' }),
      F.tag({ text: '1100Mi', points: W_BACK, after: 'scan', ...BACK_TAG }),
      F.set({ at: 'back', chips: { useChip: '1100Mi measured' }, lights: ['useChip'] }),
    ],
  },
  {
    id: 'compare',
    duration: 3500,
    narration: 'Two sums meet the same 1Gi line. The container counts its writable layer and log, 700Mi, inside its own limit. The Pod adds the emptyDir: 1100Mi against the 1Gi sum of its container limits, and that one is over. The Kubelet checks any emptyDir sizeLimit first, then this Pod total, then each container.',
    chips: chips('1100Mi, over 1Gi', 'Running'),
    opacity: stage({ fill: 3, verdict: 1 }),
    lit: ['kubelet'],
    rewind: { chips: { useChip: '1100Mi measured' } },
    enter: paint({ fill: 3 }),
    flow: [
      F.reveal({ target: 'verdictA', delay: 300 }),
      F.reveal({ target: 'verdictB', delay: 1500, name: 'over' }),
      F.set({ at: 'over', chips: { useChip: '1100Mi, over 1Gi' }, lights: ['useChip'] }),
    ],
  },
  {
    id: 'evict',
    duration: 3800,
    narration: 'The Kubelet evicts the whole Pod, not one container. It kills web-a with a 1 second grace period, whatever its spec asks, and sets phase Failed with reason Evicted and the message Pod ephemeral local storage usage exceeds the total limit of containers 1Gi. Node-1 was never short of disk.',
    chips: chips('1100Mi, over 1Gi', 'Failed, Evicted'),
    opacity: stage({ a: OPACITY.terminated, fill: 3, verdict: 1 }),
    lit: ['kubelet'],
    rewind: { chips: { podChip: 'Running' } },
    enter: paint({ fill: 3 }),
    // The Kubelet sends, the Pod blinks as the kill lands and then goes, its two lanes with it.
    flow: [
      F.route({ points: W_EVICT, delay: BEAT.lead, name: 'kill' }),
      F.tag({ text: 'evict', points: W_EVICT, delay: BEAT.lead, ...EVICT_TAG }),
      F.set({ at: 'kill', chips: { podChip: 'Failed, Evicted' }, lights: ['podChip'] }),
      F.pulse({ pod: 'podA', at: 'kill' }),
      F.fade({ target: 'podA', to: OPACITY.terminated, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse }),
      F.fade({ target: 'wLane', to: 0, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse }),
      F.fade({ target: 'eLane', to: 0, dur: FADE.out, at: 'kill', plus: BEAT.afterPulse }),
    ],
  },
  {
    id: 'replace',
    duration: 3500,
    narration: 'Nothing restarts web-a in place, unlike a container killed at its memory limit. It stays Failed, and its ReplicaSet creates a new Pod, web-b, which starts from zero and can land on Node-1 again. A Node that runs short of disk is a separate path, node-pressure eviction.',
    chips: chips('0, web-b', 'Failed, Evicted'),
    opacity: stage({ a: 0, b: 1 }),
    rewind: { chips: { useChip: '1100Mi, over 1Gi' } },
    enter: paint(),
    // web-a leaves the slot as the gauge empties, then web-b arrives in it with its two lanes. The
    // Pod chip holds `Failed, Evicted` from `evict` and takes no cue: nothing changed (P-09a).
    flow: [
      F.fade({ target: 'podA', from: OPACITY.terminated, to: 0, dur: FADE.out }),
      ...['lbl0', 'lbl1', 'lbl2', 'verdictA', 'verdictB', 'titleA', 'rowA'].map(target => F.fade({ target, to: 0, dur: FADE.out })),
      ...drain(['a0', 'a1', 'b0', 'b1', 'b2']),
      ...['podB', 'wLane', 'eLane', 'titleB', 'rowB'].map(target => F.fade({
        target, from: 0, to: 1, dur: FADE.in, delay: FADE.out, easing: 'ease-out',
      })),
      F.set({ delay: FADE.out, chips: { useChip: '0, web-b' }, lights: ['useChip'] }),
      F.pulse({ pod: 'podB', delay: FADE.out + FADE.in }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
