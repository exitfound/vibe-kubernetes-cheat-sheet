import { P, F, defineCard, ladder, laneY, midX, WL, LAYOUT, FADE, BEAT } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-finished-job-cleanup.md

// An object stack read top to bottom, not the A / B / C column preset: no ladder, no chip column.

// Band 1: the API on WL.CX because both corridors leave its bottom face midpoint (WL.L-07), so the
// controller takes the right end of the row.
const API_W = 232, API_X = WL.CX - API_W / 2;  // centred on CX for the spine
const CTRL_W = 232, CTRL_X = WL.R - CTRL_W;  // right edge on the chip strip
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_X + API_W, CTRL_X);
const WIRE_Y = WL.TOP_Y - 12;  // above the actor row, off the spine

// Band 2: the Job is the subject, so it is a block on the spine, not a chip value.
const JOB_W = 232, JOB_X = WL.CX - JOB_W / 2;
const JOB_Y = 176, JOB_H = 80;

// Band 3: a full-width Node, so the content bbox centres on CX (WL.L-02).
const NODE_Y = 312;
const POD_W = 380, POD_H = 106, POD_GAP = 100;
const NODE_H = 34 + POD_H + 12;
const POD_Y = NODE_Y + 34;
const POD_XS = [WL.CX - POD_GAP / 2 - POD_W, WL.CX + POD_GAP / 2];
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 28, h: 52 };
const POD_NAMES = ['Pod pi-9k4x2', 'Pod pi-t7m1c'];

// Band 4: six chips two across (WL.L-05). The gap is what the canon width leaves.
const CHIP_W = LAYOUT.C.strip.two;
const CHIP_GAP = WL.W - CHIP_W * 2;
const CHIP_VGAP = 8;
const CHIPS_TOP = 492;
const CHIP_ROW = ladder({ y: CHIPS_TOP, rowH: WL.CHIP_H, gap: CHIP_VGAP });
const CHIP_X = (i) => WL.L + (i % 2) * (CHIP_W + CHIP_GAP);
const CHIP_Y = (i) => CHIP_ROW(Math.floor(i / 2));

// The upper corridor carries only the delete, so it is one lane. The lower runs both ways, so it is
// a pair with exactly one direction visible per step.
const SPINE_A = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, JOB_Y]];
const SPINE_B = [[WL.SPINE_X, JOB_Y + JOB_H], [WL.SPINE_X, NODE_Y]];
const SPINE_B_UP = [...SPINE_B].reverse();

const WATCH = { from: API_X + API_W, to: CTRL_X, y: RESP_Y };
const DELETE = { from: CTRL_X, to: API_X + API_W, y: REQ_Y };

// List order is z-order: top lanes, wire label and chips, corridors and packets, then Node, Pods, Job, actors.
export const SCENE = {
  'aria-label': 'Automatic cleanup for finished Jobs: a Job that has completed and its two Pods stay in the API as records, and the ttl-after-finished controller inside kube-controller-manager deletes the Job once ttlSecondsAfterFinished has elapsed since the completion stamp, taking the Pods with it through their ownerReferences',
  parts: [
    P.defs(),
    // The API sits left here, so the request runs right to left.
    P.arrow({ x1: CTRL_X, y1: REQ_Y, x2: API_X + API_W, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ x1: API_X + API_W, y1: RESP_Y, x2: CTRL_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WIRE_Y }),
    P.chip({ key: 'ttlChip', x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_W, h: WL.CHIP_H, name: 'spec.ttlSecondsAfterFinished', value: '100' }),
    P.chip({ key: 'compChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_W, h: WL.CHIP_H, name: 'status.completionTime', value: 'none' }),
    P.chip({ key: 'eligChip', x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_W, h: WL.CHIP_H, name: 'eligible for removal', value: 'not finished' }),
    P.chip({ key: 'clockChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_W, h: WL.CHIP_H, name: 'controller clock', value: '12:00:00' }),
    P.chip({ key: 'statusChip', x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_W, h: WL.CHIP_H, name: 'job status', value: 'Running · 2 active' }),
    P.chip({ key: 'podsChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_W, h: WL.CHIP_H, name: 'pods owned', value: '2 Running' }),
    P.lane({ key: 'connA', points: SPINE_A, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connDown', points: SPINE_B, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'connUp', points: SPINE_B_UP, dim: true, dashed: true, role: 'cluster', opacity: 0 }),
    P.packets(),
    // After the packet layer, so the ball runs under the frame, the Pods and the blocks.
    P.node({ key: 'nodeEl', x: WL.L, y: NODE_Y, w: WL.W, h: NODE_H, label: 'Node-1' }),
    ...[0, 1].map(i => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: POD_XS[i], y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: 'running', containers: 0,
      inner: { ...POD_INNER, label: 'app', sublabel: 'computing' },
    })),
    P.box({ key: 'jobEl', x: JOB_X, y: JOB_Y, w: JOB_W, h: JOB_H, label: 'Job pi', sublabel: 'batch/v1 · owns both Pods', role: 'cluster' }),
    P.box({ key: 'apiEl', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'keeps the objects', role: 'cluster' }),
    P.box({ key: 'ctrlEl', x: CTRL_X, y: WL.TOP_Y, w: CTRL_W, h: WL.BOX_H, label: 'ttl-after-finished', sublabel: 'kube-controller-manager', role: 'cluster' }),
  ],
  reset: {
    keys: ['apiEl', 'ctrlEl', 'jobEl', 'ttlChip', 'compChip', 'eligChip', 'clockChip', 'statusChip', 'podsChip', 'pod1Box', 'pod2Box'],
    pods: ['pod1', 'pod2'],
  },
};

const STAMP = '12:00:31', DUE = '12:02:11', DONE = 'Complete · 2 succeeded', KEPT = '2 Succeeded';

// The corridor pair as FIELDS, so no step can leave both directions on or neither.
const corridor = (dir) => ({ connDown: dir === 'up' ? 0 : 1, connUp: dir === 'up' ? 1 : 0 });
// One helper pins the Pods and their lane: a cascade that outlives its Pods would point into an empty frame.
const pods = (v) => ({ pod1: v, pod2: v, connDown: v });

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { ttlChip: '100', compChip: 'none', eligChip: 'not finished', clockChip: '12:00:00', statusChip: 'Running · 2 active', podsChip: '2 Running' },
    sublabels: { pod1Box: 'computing', pod2Box: 'computing' },
    podSublabels: { pod1: 'running', pod2: 'running' },
    opacity: { pod1: 1, pod2: 1, jobEl: 1, connA: 1, ...corridor('down') },
  },
  {
    id: 'finished',
    duration: 3600,
    narration: 'Both Pods exit 0, so the Job condition becomes Complete and .status.completionTime is stamped at that instant. Finishing removes nothing. The Job object and both Pods stay in the API by default, so kubectl logs and kubectl describe still answer after the run is over. A CronJob prunes its own finished Jobs by count, a bare Job like this one has no such limit.',
    chips: { ttlChip: '100', compChip: STAMP, eligChip: DUE, clockChip: STAMP, statusChip: DONE, podsChip: KEPT },
    sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' },
    podSublabels: { pod1: 'Succeeded · object kept', pod2: 'Succeeded · object kept' },
    opacity: { pod1: 1, pod2: 1, jobEl: 1, connA: 1, ...corridor('up') },
    lit: ['compChip', 'eligChip', 'clockChip', 'statusChip', 'podsChip'],
    // The stamp turns over when the exit report lands, the instant the card is measured from.
    rewind: { chips: { compChip: 'none', eligChip: 'not finished', statusChip: 'Running · 2 active', podsChip: '2 Running' } },
    flow: [
      F.pulse({ pod: 'pod1' }),
      F.pulse({ pod: 'pod2' }),
      F.route({ points: SPINE_B_UP, delay: BEAT.afterPulse, name: 'exit', lights: ['jobEl'] }),
      F.set({ at: 'exit', chips: { compChip: STAMP, eligChip: DUE, statusChip: DONE, podsChip: KEPT } }),
    ],
  },
  {
    id: 'watch',
    duration: 3900,
    narration: 'The ttl-after-finished controller inside kube-controller-manager watches Jobs, and it only looks at ones that have already finished. This Job now reports Complete, so it is picked up. A Job that is still running is one it passes over whatever the spec says. Set the field to 0 and a Job is eligible the moment it finishes, and leave it unset and this controller never touches the Job at all.',
    chips: { ttlChip: '100', compChip: STAMP, eligChip: DUE, clockChip: '12:00:44', statusChip: DONE, podsChip: KEPT },
    wires: { req: 'watch · Jobs with Complete or Failed' },
    sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' },
    podSublabels: { pod1: 'Succeeded · object kept', pod2: 'Succeeded · object kept' },
    opacity: { pod1: 1, pod2: 1, jobEl: 1, connA: 1, ...corridor('down') },
    // The API sources the watch, lit from entry. The controller receives it and lights on arrival.
    lit: ['apiEl', 'jobEl', 'clockChip'],
    flow: [
      // Self-initiated by the API, so it waits BEAT.lead.
      F.top({ ...WATCH, delay: BEAT.lead, lights: ['ctrlEl'] }),
    ],
  },
  {
    id: 'waiting',
    duration: 2900,
    narration: 'The timer starts when the Job finishes, not when it was created. With ttlSecondsAfterFinished at 100, the Job becomes eligible for removal 100 seconds after the completion stamp of 12:00:31, which is 12:02:11. It is 12:01:04 now, 33 of those seconds have gone, and nothing happens yet.',
    chips: { ttlChip: '100', compChip: STAMP, eligChip: DUE, clockChip: '12:01:04', statusChip: DONE, podsChip: KEPT },
    sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' },
    podSublabels: { pod1: 'Succeeded · object kept', pod2: 'Succeeded · object kept' },
    opacity: { pod1: 1, pod2: 1, jobEl: 1, connA: 1, ...corridor('down') },
    // M-27: a packet-less, pod-less step carries its beat with .highlight alone.
    lit: ['ctrlEl', 'ttlChip', 'compChip', 'eligChip', 'clockChip'],
  },
  {
    id: 'expire',
    duration: 3400,
    narration: 'At 12:02:11 the controller compares its own clock against the timestamp stored in the Job, finds the TTL expired and deletes the Job through the API. That comparison is why the TTL is not a hard guarantee: the difference should be very small, but clock skew in the cluster can make the control plane clean a Job up at the wrong time.',
    chips: { ttlChip: '100', compChip: STAMP, eligChip: DUE, clockChip: DUE, statusChip: 'Complete · delete issued', podsChip: KEPT },
    wires: { req: 'delete jobs/pi · cascading' },
    sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' },
    podSublabels: { pod1: 'Succeeded · object kept', pod2: 'Succeeded · object kept' },
    opacity: { pod1: 1, pod2: 1, jobEl: 1, connA: 1, ...corridor('down') },
    lit: ['ctrlEl', 'clockChip', 'statusChip'],
    // The clock reading is the premise, at entry. The status is what the delete produces.
    rewind: { chips: { statusChip: DONE } },
    flow: [
      // Self-initiated, so the ball waits BEAT.lead.
      F.top({ ...DELETE, delay: BEAT.lead, name: 'del', lights: ['apiEl'] }),
      F.route({ points: SPINE_A, after: 'del', name: 'apply', lights: ['jobEl'] }),
      F.set({ at: 'apply', chips: { statusChip: 'Complete · delete issued' } }),
    ],
  },
  {
    id: 'cascade',
    duration: 3600,
    narration: 'The delete is cascading, which means the dependent objects go with it. Both Pods carry an ownerReference back to Job pi, so removing the Job removes them too and the run finally leaves kubectl get pods. Neither Pod was counted or aged on its own here. They go because their owner went, and the Node is left with nothing of this run on it.',
    chips: { ttlChip: '100', compChip: STAMP, eligChip: DUE, clockChip: DUE, statusChip: 'deleted', podsChip: '0' },
    sublabels: { pod1Box: 'exit 0', pod2Box: 'exit 0' },
    podSublabels: { pod1: 'Succeeded · object kept', pod2: 'Succeeded · object kept' },
    // A-14: the Job goes, so both lanes that end on it go to 0, not to a dim shade.
    opacity: { ...pods(0), jobEl: 0, connA: 0, connUp: 0 },
    // No entry highlight on the Job: S-18 gives a lit key back when it fades to 0, which the static
    // path cannot express, so the two paths would disagree.
    lit: ['statusChip', 'podsChip'],
    rewind: { chips: { statusChip: 'Complete · delete issued', podsChip: KEPT } },
    flow: [
      // Down-arrow: the ball lands on the Node frame face, then both Pods blink and dissolve.
      F.route({ points: SPINE_B, delay: BEAT.lead, name: 'casc' }),
      F.set({ at: 'casc', chips: { statusChip: 'deleted', podsChip: '0' } }),
      F.pulse({ pod: 'pod1', at: 'casc' }),
      F.pulse({ pod: 'pod2', at: 'casc' }),
      // M-08: blink first, the dissolve one beat later.
      F.fade({ target: 'pod1', from: 1, to: 0, dur: FADE.out, at: 'casc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'pod2', from: 1, to: 0, dur: FADE.out, at: 'casc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'connDown', from: 1, to: 0, dur: FADE.out, at: 'casc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'jobEl', from: 1, to: 0, dur: FADE.out, at: 'casc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'connA', from: 1, to: 0, dur: FADE.out, at: 'casc', plus: BEAT.afterPulse, fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
