import { P, F, defineCard, laneY, midX, strip, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-rolling-update.md

// Two owner regions side by side, one ReplicaSet per house column: the rollout is a fleet crossing
// from the left box to the right one.

// The API is centred on CX so the trunk drops straight down the corridor (WL.L-07, A-09).
const API_W = 232, API_X = WL.CX - API_W / 2;
const DEP_W = 232, DEP_X = WL.R - DEP_W;
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_X + API_W, DEP_X);

// Fill-less dashed boundaries, not node() frames: a replacement may land on any Node.
const REG_Y = 270, REG_H = 266;
const CAP_Y = 286;
// Slots inset by REG_PAD so no Pod border stands on a region border.
const REG_PAD = 18;
const CAP_CX = [WL.COL_L.x + WL.COL_L.w / 2, WL.COL_R.x + WL.COL_R.w / 2];

// Six slots, never four: a Pod does not change version in place (WL.L-02).
const SLOT_N = 3, SLOT_GAP = 12;
const COL_L = strip({ from: WL.COL_L.x + REG_PAD, to: WL.COL_L.x + WL.COL_L.w - REG_PAD, count: SLOT_N, gap: SLOT_GAP });
const COL_R = strip({ from: WL.COL_R.x + REG_PAD, to: WL.COL_R.x + WL.COL_R.w - REG_PAD, count: SLOT_N, gap: SLOT_GAP });
const POD_W = COL_L.w;
const SLOTS = [0, 1, 2];
const POD_XS = [...SLOTS.map(i => COL_L.x(i)), ...SLOTS.map(i => COL_R.x(i))];
const POD_CX = (i) => POD_XS[i] + POD_W / 2;
const POD_Y = 430, POD_H = 88;
const POD_INNER = { dx: 24, w: POD_W - 48, dy: 26, h: 48 };

// A chip never carries a count: the slots and captions already draw every count.
const FLEET_Y = 556;
const CHIP_W = LAYOUT.C.strip.two, CHIP_GAP = 16;  // WL.L-05
const CHIP_X = (i) => WL.L + i * (CHIP_W + CHIP_GAP);
const CHIP_Y = 574;

// The trunk start is a timing decision (routeDur is length-based), so moving it is A-11.
const BUS_Y = 330;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is split per slot so each segment dies with the last Pod it serves (A-14).
const SEG = (a, b) => [[POD_CX(a), BUS_Y], [POD_CX(b), BUS_Y]];
const BUS_PATH = {
  busL1: [[WL.CX, BUS_Y], [POD_CX(2), BUS_Y]], busL2: SEG(2, 1), busL3: SEG(1, 0),
  busR1: [[WL.CX, BUS_Y], [POD_CX(3), BUS_Y]], busR2: SEG(3, 4), busR3: SEG(4, 5),
};
// Which slots each segment stands between the trunk and.
const SEG_SERVES = {
  busL1: [2, 1, 0], busL2: [1, 0], busL3: [0],
  busR1: [3, 4, 5], busR2: [4, 5], busR3: [5],
};
const DROP = (i) => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = (i) => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
// One drop per slot, each carrying a ball (A-05, unit/lane-shared.test.mjs).
const DROP_KEY = (i) => `drop${i + 1}`;

// Trunk and bus carry the ball, so they are lanes (A-06), with the arrowhead only on the drop (A-05).
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// A naked dashed rect painted by hand. RS-v2 is keyed because it is hidden on `idle`.
const region = (key, x, w) => P.raw({
  key,
  make: () => {
    const r = rect({ class: 'scheme-ns-rect', x, y: REG_Y, width: w, height: REG_H, rx: 10 });
    r.style.fill = 'none';
    r.style.stroke = 'var(--workloads-color)';
    r.style.strokeOpacity = '0.35';
    r.style.strokeDasharray = '4 4';
    return r;
  },
});

// Random suffixes: an ordinal would imply an age order the card never establishes.
const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4', 'web-e5', 'web-f6'];
// The version is baked per slot. A step writes the state word into the inner box.
const POD_IMAGE = (i) => (i < SLOT_N ? 'app v1.0' : 'app v2.0');
// Built non-empty: setBoxSublabel is a silent no-op against a box built without a sublabel.
const POD_STATE0 = (i) => (i < SLOT_N ? 'Ready' : 'starting');

// Z-order: regions, lanes and captions, packets, then Pods, totals and the actor row.
export const SCENE = {
  'aria-label': 'Deployment rolling update: ReplicaSet RS-v1 owns three Pods in the left region and the right region holds the three slots RS-v2 fills, maxSurge 1 lets the fleet run up to 4 Pods while a new Pod starts, and maxUnavailable 0 holds every old Pod until its replacement is Ready, one at a time until the whole fleet has crossed to RS-v2',
  parts: [
    P.defs(),
    region('regV1', WL.COL_L.x, WL.COL_L.w),
    region('regV2', WL.COL_R.x, WL.COL_R.w),
    P.arrow({ x1: DEP_X, y1: REQ_Y, x2: API_X + API_W, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane carries a real ball on `ready`, so it is an arrow (A-06).
    P.arrow({ x1: API_X + API_W, y1: RESP_Y, x2: DEP_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits above the actor row.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // Owner headers carry the replica and Ready counts.
    P.wire({ key: 'v1Cap', x: CAP_CX[0], y: CAP_Y }),
    P.wire({ key: 'v2Cap', x: CAP_CX[1], y: CAP_Y }),
    trunkPath('trunk', TRUNK),
    ...Object.entries(BUS_PATH).map(([key, points]) => trunkPath(key, points)),
    ...POD_XS.map((_, i) => P.lane({
      key: DROP_KEY(i), points: DROP(i), dim: true, dashed: true, role: 'cluster',
    })),
    P.packets(),
    // Appended after the packet layer, so the ball runs under it.
    ...POD_XS.map((px, i) => P.pod({
      key: `pod${i + 1}`, id: `pod${i + 1}`, innerKey: `pod${i + 1}Box`,
      x: px, y: POD_Y, w: POD_W, h: POD_H, label: POD_NAMES[i], sublabel: '', containers: 0,
      // No build-time opacity: every step pins all six slots through `slots()`.
      inner: { ...POD_INNER, label: POD_IMAGE(i), sublabel: POD_STATE0(i) },
    })),
    P.wire({ key: 'fleetCap', x: WL.CX, y: FLEET_Y }),
    P.chip({ key: 'surgeChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'maxSurge', value: '1' }),
    P.chip({ key: 'unavailChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'maxUnavailable', value: '0' }),
    P.box({ key: 'apiserver', x: API_X, y: WL.TOP_Y, w: API_W, h: WL.BOX_H, label: 'API', sublabel: 'PUT .spec.replicas · Pod CRUD', role: 'cluster' }),
    P.box({ key: 'controller', x: DEP_X, y: WL.TOP_Y, w: DEP_W, h: WL.BOX_H, label: 'Deployment', sublabel: 'scales RS-v1, RS-v2', role: 'cluster' }),
  ],
  reset: {
    keys: ['controller', 'apiserver', 'surgeChip', 'unavailChip', 'pod1Box', 'pod2Box', 'pod3Box', 'pod4Box', 'pod5Box', 'pod6Box'],
    pods: ['pod1', 'pod2', 'pod3', 'pod4', 'pod5', 'pod6'],
  },
};

// Occupancy, state word and feed are one fact, written by one helper (A-16, A-14).
// A feed is only ever 0 or 1, never a lifecycle shade.
const slots = (...row) => {
  const opacity = {}, sublabels = {};
  const on = row.map(v => (v !== null && (v.op === undefined || v.op > 0) ? 1 : 0));
  row.forEach((v, i) => {
    const n = i + 1;
    opacity[`pod${n}`] = v === null ? 0 : (v.op === undefined ? 1 : v.op);
    opacity[DROP_KEY(i)] = on[i];
    if (v !== null) sublabels[`pod${n}Box`] = v.s;
  });
  for (const [key, serves] of Object.entries(SEG_SERVES)) opacity[key] = serves.some(i => on[i]) ? 1 : 0;
  // RS-v2 is hidden on `idle` by overriding this one value.
  opacity.regV1 = 1;
  opacity.regV2 = 1;
  return { opacity, sublabels };
};
const READY = { s: 'Ready' }, START = { s: 'starting' };
const GOING = { s: 'terminating', op: OPACITY.terminating };
// A finished slot still writes `terminating` so the static path matches the animated one (S-16).
const LEFT = { s: 'terminating', op: 0 };

// The feed into a slot opens on the write, CLOSE is its mirror (A-15).
const OPEN = { 3: ['busR1', 'drop4'], 4: ['busR2', 'drop5'], 5: ['busR3', 'drop6'] };
const CLOSE = { 0: ['busL3', 'drop1'], 1: ['busL2', 'drop2'], 2: ['busL1', 'drop3'] };

// Written once so a step and its rewind cannot disagree.
const V1 = {
  full: 'RS-v1 (old) · v1.0 · replicas 3 · Ready 3',
  two: 'RS-v1 (old) · v1.0 · replicas 2 · Ready 2',
  one: 'RS-v1 (old) · v1.0 · replicas 1 · Ready 1',
  zero: 'RS-v1 (old) · v1.0 · replicas 0 · retained',
};
const V2 = {
  none: 'RS-v2 (new) · not created yet',
  zero: 'RS-v2 (new) · v2.0 · replicas 0 · Ready 0',
  one: 'RS-v2 (new) · v2.0 · replicas 1 · Ready 0',
  ready: 'RS-v2 (new) · v2.0 · replicas 1 · Ready 1',
  twoStarting: 'RS-v2 (new) · v2.0 · replicas 2 · Ready 1',
  two: 'RS-v2 (new) · v2.0 · replicas 2 · Ready 2',
  allStarting: 'RS-v2 (new) · v2.0 · replicas 3 · Ready 2',
  all: 'RS-v2 (new) · v2.0 · replicas 3 · Ready 3',
};
// A terminating Pod is drawn but not counted in `live`.
const FLEET = {
  idle: 'live 3 · available 3 · rollout idle',
  patched: 'live 3 · available 3 · replaced 0 of 3',
  surged: 'live 4 · available 3 · replaced 0 of 3',
  serving: 'live 4 · available 4 · replaced 0 of 3',
  drained: 'live 3 · available 3 · replaced 1 of 3',
  surged2: 'live 4 · available 3 · replaced 1 of 3',
  drained2: 'live 3 · available 3 · replaced 2 of 3',
  surged3: 'live 4 · available 3 · replaced 2 of 3',
  drained3: 'live 3 · available 3 · replaced 3 of 3',
  complete: 'live 3 · available 3 · rollout complete · Available=True',
};
// Constant on every step: what the 25% defaults resolve to at replicas 3.
const DIALS = { surgeChip: '1 · 25% of 3 rounds up', unavailChip: '0 · 25% of 3 rounds down' };

// The Deployment is lit at step entry, so its ball leads by BEAT.lead.
const patchApi = (name) => F.top({
  from: DEP_X, to: API_X + API_W, y: REQ_Y, delay: BEAT.lead, name, lights: ['apiserver'],
});

// One compressed scale-up, create, Ready, delete cycle per step: the earlier steps show the mechanism.
const cycle = ({ slot, gone, caps }) => [
  patchApi('patch'),
  F.set({ at: 'patch', wires: { v2Cap: caps.starting } }),
  ...OPEN[slot].map(target => F.reveal({ target, at: 'patch' })),
  F.route({ points: LANE(slot), after: 'patch', name: 'create' }),
  F.fade({ target: `pod${slot + 1}`, from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${slot + 1}`, at: 'create' }),
  F.set({ at: 'create', wires: { fleetCap: caps.surged } }),
  // Nothing is deleted before the new Pod is Ready: maxUnavailable 0.
  F.set({
    at: 'create',
    plus: BEAT.afterPulse,
    sublabels: { [`pod${slot + 1}Box`]: READY.s },
    wires: { v1Cap: caps.v1, v2Cap: caps.ready },
  }),
  F.route({ points: LANE(gone), at: 'create', plus: BEAT.afterPulse + BEAT.afterHop, name: 'delete', pulse: `pod${gone + 1}` }),
  F.set({ at: 'delete', sublabels: { [`pod${gone + 1}Box`]: GOING.s }, wires: { fleetCap: caps.drained } }),
  F.fade({ target: `pod${gone + 1}`, from: 1, to: 0, dur: FADE.out, at: 'delete', fill: 'both', easing: 'ease-in' }),
  ...CLOSE[gone].map(target => F.fade({
    target, from: 1, to: 0, dur: FADE.out, at: 'delete', fill: 'both', easing: 'ease-in',
  })),
];

// Taken once because `idle` overrides one key of its opacity map.
const IDLE = slots(READY, READY, READY, null, null, null);

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: DIALS,
    wires: { v1Cap: V1.full, v2Cap: V2.none, fleetCap: FLEET.idle },
    ...IDLE,
    opacity: { ...IDLE.opacity, regV2: 0 },
  },
  {
    id: 'spec',
    duration: 2600,
    narration: 'You run kubectl set image deployment/web app=v2.0, which PATCHes .spec.template. The Deployment hashes that template into a new pod-template-hash, so it creates a second ReplicaSet, RS-v2, with replicas 0. RS-v1 still owns all 3 live Pods and nothing has churned yet.',
    chips: DIALS,
    wires: { req: 'create RS-v2 · new pod-template-hash', v1Cap: V1.full, v2Cap: V2.zero, fleetCap: FLEET.patched },
    ...slots(READY, READY, READY, null, null, null),
    lit: ['controller'],
    // The region and header arrive with the write that creates RS-v2.
    rewind: { opacity: { regV2: 0 }, wires: { v2Cap: V2.none, fleetCap: FLEET.idle } },
    flow: [
      patchApi('patch'),
      F.reveal({ target: 'regV2', at: 'patch' }),
      F.set({ at: 'patch', wires: { v2Cap: V2.zero, fleetCap: FLEET.patched } }),
    ],
  },
  {
    id: 'surge',
    duration: 3900,
    narration: 'At .spec.replicas 3 the 25% defaults resolve to maxSurge 1, because a surge percentage rounds up. That spare slot lets the Deployment raise RS-v2 from 0 to 1 through the API before any old Pod leaves, and RS-v2 creates the Pod in its column. The fleet runs to 4.',
    chips: DIALS,
    wires: { req: 'scale RS-v2 replicas: 0 → 1', v1Cap: V1.full, v2Cap: V2.one, fleetCap: FLEET.surged },
    ...slots(READY, READY, READY, START, null, null),
    lit: ['controller'],
    // The animated path pulses the Pod, so the static path lights its inner box.
    reducedLit: ['pod4Box'],
    // The new Pod rises on the create arrival. Its feed opens via F.reveal.
    rewind: {
      opacity: { pod4: 0 },
      wires: { v2Cap: V2.zero, fleetCap: FLEET.patched },
    },
    flow: [
      patchApi('patch'),
      // Ready is the next step: here RS-v2 only wants one replica.
      F.set({ at: 'patch', wires: { v2Cap: V2.one } }),
      ...OPEN[3].map(target => F.reveal({ target, at: 'patch' })),
      F.route({ points: LANE(3), after: 'patch', name: 'create' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'create' }),
      F.set({ at: 'create', wires: { fleetCap: FLEET.surged } }),
    ],
  },
  {
    id: 'ready',
    duration: 3200,
    narration: 'The new Pod passes its readinessProbe and RS-v2 reports Ready 1. At the default minReadySeconds 0 it counts as available at once. With maxUnavailable 0 the Deployment may not touch RS-v1 until a replacement is Ready, which is what keeps 3 Pods serving throughout.',
    chips: DIALS,
    wires: { req: 'watch: RS-v2 Ready 0 → 1', v1Cap: V1.full, v2Cap: V2.ready, fleetCap: FLEET.serving },
    ...slots(READY, READY, READY, READY, null, null),
    lit: ['apiserver'],
    reducedLit: ['pod4Box'],
    rewind: {
      sublabels: { pod4Box: START.s },
      wires: { v2Cap: V2.one, fleetCap: FLEET.surged },
    },
    flow: [
      // The Pod blinks first: the probe passing is the cause, the watch event the effect.
      F.pulse({ pod: 'pod4' }),
      F.set({ delay: BEAT.afterPulse, sublabels: { pod4Box: READY.s }, wires: { v2Cap: V2.ready, fleetCap: FLEET.serving } }),
      F.top({ from: API_X + API_W, to: DEP_X, y: RESP_Y, delay: BEAT.afterPulse, name: 'watch', lights: ['controller'] }),
    ],
  },
  {
    id: 'drain',
    duration: 4500,
    narration: 'Only now does the Deployment scale RS-v1 from 3 to 2 through the API, and RS-v1 deletes one old Pod, which enters graceful termination. Terminating Pods do not count as available, so the 3 that maxUnavailable 0 requires are the 2 old Ready Pods plus the new one.',
    chips: DIALS,
    wires: { req: 'scale RS-v1 replicas: 3 → 2', v1Cap: V1.two, v2Cap: V2.ready, fleetCap: FLEET.drained },
    ...slots(GOING, READY, READY, READY, null, null),
    lit: ['controller'],
    reducedLit: ['pod1Box'],
    // The drained Pod dims on the ball's arrival. Its feed stays: the Pod still stands.
    rewind: {
      opacity: { pod1: 1 },
      sublabels: { pod1Box: READY.s },
      wires: { v1Cap: V1.full, fleetCap: FLEET.serving },
    },
    flow: [
      patchApi('patch'),
      F.set({ at: 'patch', wires: { v1Cap: V1.two } }),
      F.route({ points: LANE(0), after: 'patch', name: 'drain', pulse: 'pod1' }),
      F.fade({ target: 'pod1', from: 1, to: OPACITY.terminating, dur: FADE.out, at: 'drain', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'drain', sublabels: { pod1Box: GOING.s }, wires: { fleetCap: FLEET.drained } }),
    ],
  },
  {
    id: 'repeat',
    duration: 6600,
    narration: 'The same trio runs again for the second replica. RS-v2 goes to 2 and the new Pod starts in the next slot, and only once it reports Ready does RS-v1 drop to 1 and let another old Pod go. The window of live Pods has slid one slot to the right and never narrowed below 3.',
    chips: DIALS,
    wires: { req: 'scale RS-v2 replicas: 1 → 2', v1Cap: V1.one, v2Cap: V2.two, fleetCap: FLEET.drained2 },
    ...slots(LEFT, LEFT, READY, READY, READY, null),
    lit: ['controller'],
    reducedLit: ['pod5Box'],
    // Opens on what `drain` left standing. Both old Pods leave inside this step.
    rewind: {
      opacity: { pod1: OPACITY.terminating, pod2: 1, pod5: 0, busL2: 1, busL3: 1, drop1: 1, drop2: 1 },
      sublabels: { pod1Box: GOING.s, pod2Box: READY.s, pod5Box: START.s },
      wires: { v1Cap: V1.two, v2Cap: V2.ready, fleetCap: FLEET.drained },
    },
    flow: [
      // The Pod left terminating finishes going, and its feed goes with it.
      F.fade({ target: 'pod1', from: OPACITY.terminating, to: 0, dur: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }),
      ...CLOSE[0].map(target => F.fade({
        target, from: 1, to: 0, dur: FADE.out, delay: 0, fill: 'both', easing: 'ease-in',
      })),
      ...cycle({
        slot: 4,
        gone: 1,
        caps: { starting: V2.twoStarting, surged: FLEET.surged2, ready: V2.two, v1: V1.one, drained: FLEET.drained2 },
      }),
    ],
  },
  {
    id: 'converged',
    duration: 6600,
    narration: 'The last replica crosses the same way. RS-v2 reaches 3 Ready and RS-v1 ends at replicas 0, kept up to revisionHistoryLimit so kubectl rollout undo can flip back. With no old Pod running the rollout is complete: Available=True and Progressing NewReplicaSetAvailable.',
    chips: DIALS,
    wires: { req: 'scale RS-v2 replicas: 2 → 3', v1Cap: V1.zero, v2Cap: V2.all, fleetCap: FLEET.complete },
    ...slots(LEFT, LEFT, LEFT, READY, READY, READY),
    lit: ['controller'],
    reducedLit: ['pod6Box'],
    rewind: {
      opacity: { pod3: 1, pod6: 0, busL1: 1, drop3: 1 },
      sublabels: { pod3Box: READY.s, pod6Box: START.s },
      wires: { v1Cap: V1.one, v2Cap: V2.two, fleetCap: FLEET.drained2 },
    },
    flow: [
      ...cycle({
        slot: 5,
        gone: 2,
        caps: { starting: V2.allStarting, surged: FLEET.surged3, ready: V2.all, v1: V1.zero, drained: FLEET.drained3 },
      }),
      // Complete only once the last old Pod is off the canvas.
      F.set({ at: 'delete', plus: FADE.out, wires: { fleetCap: FLEET.complete } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
