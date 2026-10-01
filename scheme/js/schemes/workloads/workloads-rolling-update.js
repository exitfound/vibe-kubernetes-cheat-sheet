import { P, F, defineCard, laneY, midX, strip, WL, LAYOUT, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-rolling-update.md

// TWO OWNER REGIONS side by side and no A / B / C preset: the presets choose which house column
// holds a ladder and which holds a chip column, and this card carries neither. WL.COL_L and
// WL.COL_R each hold one ReplicaSet, drawn as a region, so which owner a Pod belongs to is the box
// it stands in and the rollout is a fleet crossing from one box to the other.
// Panel x<=397, y<=205.

// The actor PAIR, in the arrangement and at the 232 of `workloads-replicaset`. The API is the box
// the trunk LEAVES (A-09: the Deployment writes .spec.replicas and what appears in a column is that
// write taking effect), so the API is the one centred on CX, which is what WL.L-07 asks of it: the
// trunk then runs straight down the 540..660 corridor with no jog. The Deployment takes the right
// edge on WL.R, where the chip strip below also ends.
const API_W = 232, API_X = WL.CX - API_W / 2;            // 484..716, centred on CX for the trunk
const DEP_W = 232, DEP_X = WL.R - DEP_W;                 // 908..1140
const TOP_CY = WL.TOP_Y + WL.BOX_H / 2;
const { out: REQ_Y, back: RESP_Y } = laneY(TOP_CY, WL.LANE_DY);
const WIRE_X = midX(API_X + API_W, DEP_X);               // 812

// The two owner regions. Each is a fill-less dashed boundary over one house column, holding its own
// per-step header and the three slots that ReplicaSet can fill. NOT a node() frame: where these
// Pods run is not this card's subject, a frame around a column would say the split is by Node, and
// two frames carrying one Node name between them is a claim the rollout does not make, because the
// replacement is scheduled afresh and may land anywhere.
const REG_Y = 270, REG_H = 266;                          // 270..536, clear of the 205 panel by 65
const CAP_Y = 286;                                       // the header, inside the region top
// The region keeps the house column, because the chip strip below and the Deployment box above end
// on the same 60 and 1140 and a region past them would be the one edge on the card that is not
// flush. The clearance is bought INSIDE instead: the slots are inset by REG_PAD, so no Pod border
// stands on a region border. At 0 the outer two of each three did, and two dashed rules on one x
// read as one heavier rule rather than as a box holding a Pod.
const REG_PAD = 18;
const CAP_CX = [WL.COL_L.x + WL.COL_L.w / 2, WL.COL_R.x + WL.COL_R.w / 2];   // 300 / 900

// The two owner columns, three slots each, on the house column grammar (WL.L-02). Six slots and
// never four: a Pod does not change version in place, so a v1 slot is never reused by a v2 Pod.
const SLOT_N = 3, SLOT_GAP = 12;
const COL_L = strip({ from: WL.COL_L.x + REG_PAD, to: WL.COL_L.x + WL.COL_L.w - REG_PAD, count: SLOT_N, gap: SLOT_GAP });
const COL_R = strip({ from: WL.COL_R.x + REG_PAD, to: WL.COL_R.x + WL.COL_R.w - REG_PAD, count: SLOT_N, gap: SLOT_GAP });
const POD_W = COL_L.w;                                   // 140, the padded column by three at gap 12
const SLOTS = [0, 1, 2];
const POD_XS = [...SLOTS.map(i => COL_L.x(i)), ...SLOTS.map(i => COL_R.x(i))];
const POD_CX = (i) => POD_XS[i] + POD_W / 2;             // 148 / 300 / 452  ·  748 / 900 / 1052
const POD_Y = 430, POD_H = 88;                           // 430..518, REG_PAD clear of the floor too
const POD_INNER = { dx: 24, w: POD_W - 48, dy: 26, h: 48 };

// The fleet line and the two dials. The dials were one 123 character standing tag, the widest
// string the card ever drew: as chips they are a name and a value each, which is what they are.
// A chip here may never carry a COUNT, because the six slots and the three captions already draw
// every count this card states, and two homes for one number is two places for it to be wrong.
const FLEET_Y = 556;
const CHIP_W = LAYOUT.C.strip.two, CHIP_GAP = 16;        // 532, two across (WL.L-05)
const CHIP_X = (i) => WL.L + i * (CHIP_W + CHIP_GAP);    // 60 / 608
const CHIP_Y = 574;                                      // 574..608, against the 640 floor

// The trunk leaves the API bottom midpoint, which IS CX, so it drops straight into the 540..660
// corridor between the two regions and every write visibly crosses from the actor row into one
// owner or the other. A start point is a TIMING decision (routeDur is length-based), so moving it
// is A-11.
const BUS_Y = 330;
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, BUS_Y]];
// The bus is SPLIT at the trunk and at every slot centre, six segments, so each one dies with the
// LAST Pod it still serves: a segment stands between the trunk and every slot beyond it, so its
// shade is the max of those and not of the one it ends on. Unsplit the bar runs 148..1052 and
// stands with a dangling end on every step where the far slots are empty, which is most of them.
const SEG = (a, b) => [[POD_CX(a), BUS_Y], [POD_CX(b), BUS_Y]];
const BUS_PATH = {
  busL1: [[WL.CX, BUS_Y], [POD_CX(2), BUS_Y]], busL2: SEG(2, 1), busL3: SEG(1, 0),
  busR1: [[WL.CX, BUS_Y], [POD_CX(3), BUS_Y]], busR2: SEG(3, 4), busR3: SEG(4, 5),
};
// Which slots each segment stands between the trunk and. Read by `slots()` and by nothing else.
const SEG_SERVES = {
  busL1: [2, 1, 0], busL2: [1, 0], busL3: [0],
  busR1: [3, 4, 5], busR2: [4, 5], busR3: [5],
};
const DROP = (i) => [[POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
const LANE = (i) => [...TRUNK, [POD_CX(i), BUS_Y], [POD_CX(i), POD_Y]];
// SIX drops, one per slot, because every slot is now addressed: each RS-v2 slot takes a create ball
// and each RS-v1 slot takes a delete ball. An arrowhead nothing rides is A-05 and
// `unit/lane-shared.test.mjs` reddens on it, so a seventh drop would have to earn a seventh ball.
const DROP_KEY = (i) => `drop${i + 1}`;

// A trunk or bus segment CARRIES the ball on every animated step, so it is a LANE and not a
// relation (A-06), and `tune` drops the marker because the arrowhead belongs on the drop that lands
// on a Pod (A-05). `relationPath` would paint at stroke-opacity 0.45 and read half-dark beside the
// drops and the actor arrows, which do not.
const trunkPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// An owner region is a naked dashed rect. No part kind builds a fill-less boundary, and `node()`
// would draw a Node, which is the block T-21 has nothing to say about and this card refuses.
// P.raw bypasses the kit binding, so the paint is written by hand and carries no role. The RS-v2
// region is keyed because it is not drawn on `idle`: a box around a ReplicaSet the caption says is
// not created yet is the picture contradicting its own words.
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

// Random suffixes, as a Deployment really gives them: an ordinal implies an age order the drawing
// never establishes, and this card does not name which Pod the controller picks.
const POD_NAMES = ['web-a1', 'web-b2', 'web-c3', 'web-d4', 'web-e5', 'web-f6'];
// The version is baked per slot and never moves, because a Pod cannot change version: the state
// word is what a step writes into the inner box.
const POD_IMAGE = (i) => (i < SLOT_N ? 'app v1.0' : 'app v2.0');
// A build-time sublabel is not decoration: `box()` appends the sublabel <text> only when the string
// is non-empty, and `setBoxSublabel` is a silent no-op against a box that has none. Built with '',
// every state word this card writes would land nowhere and both paths would be wrong identically.
const POD_STATE0 = (i) => (i < SLOT_N ? 'Ready' : 'starting');

// Z-order: the regions are boundaries and go under everything, then the lanes and the captions,
// then the packet layer, then the Pods, the totals and the actor row above the ball.
export const SCENE = {
  'aria-label': 'Deployment rolling update: ReplicaSet RS-v1 owns three Pods in the left region and the right region holds the three slots RS-v2 fills, maxSurge 1 lets the fleet run up to 4 Pods while a new Pod starts, and maxUnavailable 0 holds every old Pod until its replacement is Ready, one at a time until the whole fleet has crossed to RS-v2',
  parts: [
    P.defs(),
    region('regV1', WL.COL_L.x, WL.COL_L.w),
    region('regV2', WL.COL_R.x, WL.COL_R.w),
    P.arrow({ x1: DEP_X, y1: REQ_Y, x2: API_X + API_W, y2: REQ_Y, dim: true, dashed: true, role: 'cluster' }),
    // The answer lane carries a real ball on `ready`: the Deployment watches RS-v2 and the Ready
    // count is what reaches it, so this is an arrow and not a relationship (A-06).
    P.arrow({ x1: API_X + API_W, y1: RESP_Y, x2: DEP_X, y2: RESP_Y, dim: true, dashed: true, role: 'cluster' }),
    // WL.A-02: the top-row wire label sits ABOVE the actor row, never below it.
    P.wire({ key: 'req', x: WIRE_X, y: WL.TOP_Y - 12 }),
    // The owner headers, each inside the region it names. They carry the replica and Ready counts,
    // which is what the two dial chips below may not repeat.
    P.wire({ key: 'v1Cap', x: CAP_CX[0], y: CAP_Y }),
    P.wire({ key: 'v2Cap', x: CAP_CX[1], y: CAP_Y }),
    trunkPath('trunk', TRUNK),
    ...Object.entries(BUS_PATH).map(([key, points]) => trunkPath(key, points)),
    ...POD_XS.map((_, i) => P.lane({
      key: DROP_KEY(i), points: DROP(i), dim: true, dashed: true, role: 'cluster',
    })),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
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

// A slot's occupancy, its state word and the feed above it are ONE fact, so one helper writes all
// three (A-16). `null` is an empty slot: no Pod, no state word, and neither the drop nor the bus
// run above it is drawn, because an arrow into nothing reads as a fault (A-14).
// A FEED IS ONLY EVER 0 OR 1. It follows whether the slot is occupied and never the SHADE of what
// stands in it: a lane at a lifecycle shade reads as a half-drawn line rather than as a state, and
// this card holds every dashed run at one strength on every step.
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
  // Both regions, on every step, so none of the seven inherits one by luck. RS-v2 does not exist on
  // `idle` alone, which overrides this one value rather than the whole map.
  opacity.regV1 = 1;
  opacity.regV2 = 1;
  return { opacity, sublabels };
};
const READY = { s: 'Ready' }, START = { s: 'starting' };
const GOING = { s: 'terminating', op: OPACITY.terminating };
// A slot whose Pod has finished going. It is `null` in every way that shows, and it still writes
// the word, because the animated path wrote `terminating` into that box on its way out and the
// static path has to leave the same string behind (S-16, the BLOCK-TEXT axis) even though nothing
// on either path can be seen.
const LEFT = { s: 'terminating', op: 0 };

// THE FEED INTO A SLOT ABOUT TO BE FILLED OPENS ON THE WRITE, not at step entry, and CLOSE is its
// mirror on the slot a step empties. The settled value is what `slots()` pins above the guard, so
// A-15 is met and the reduced path draws both outright. Written out per slot rather than derived,
// because a segment serves everything beyond it and only the step knows what is still standing.
const OPEN = { 3: ['busR1', 'drop4'], 4: ['busR2', 'drop5'], 5: ['busR3', 'drop6'] };
const CLOSE = { 0: ['busL3', 'drop1'], 1: ['busL2', 'drop2'], 2: ['busL1', 'drop3'] };

// The owner headers and the fleet totals, written once so a step and the rewind that winds it back
// cannot state two different strings for one moment.
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
// A terminating Pod is drawn and is not counted: the card reads `live` as what the ReplicaSets
// still hold, which is why the drain step says 3 over four drawn bodies.
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
// The two dials, identical on every step. They are the LAW the 25% defaults resolve to at replicas
// 3 and not a reading of this rollout, so no step moves them and none may.
const DIALS = { surgeChip: '1 · 25% of 3 rounds up', unavailChip: '0 · 25% of 3 rounds down' };

// The write the Deployment sends the API, identical on the four steps that send one. The
// Deployment is lit at step entry, so its ball leads by BEAT.lead rather than leaving a dark box.
const patchApi = (name) => F.top({
  from: DEP_X, to: API_X + API_W, y: REQ_Y, delay: BEAT.lead, name, lights: ['apiserver'],
});

// The two compressed cycles. Each is the whole trio in ONE step: the scale-up write, the create
// ball into the RS-v2 slot, and then the delete ball into the RS-v1 slot a beat after the new Pod
// reports Ready, which is maxUnavailable 0 drawn. The cycle spread over `surge`, `ready` and
// `drain` is what licenses the compression: what these two repeat is the SLIDE, not the mechanism.
const cycle = ({ slot, gone, caps }) => [
  patchApi('patch'),
  F.set({ at: 'patch', wires: { v2Cap: caps.starting } }),
  ...OPEN[slot].map(target => F.reveal({ target, at: 'patch' })),
  F.route({ points: LANE(slot), after: 'patch', name: 'create' }),
  F.fade({ target: `pod${slot + 1}`, from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
  F.pulse({ pod: `pod${slot + 1}`, at: 'create' }),
  F.set({ at: 'create', wires: { fleetCap: caps.surged } }),
  // The new Pod is Ready, so the Deployment may scale RS-v1 down: the count turns here and the
  // delete leaves one hop later. Nothing goes before this beat, which is maxUnavailable 0 itself.
  F.set({
    at: 'create',
    plus: BEAT.afterPulse,
    sublabels: { [`pod${slot + 1}Box`]: READY.s },
    wires: { v1Cap: caps.v1, v2Cap: caps.ready },
  }),
  F.route({ points: LANE(gone), at: 'create', plus: BEAT.afterPulse + BEAT.afterHop, name: 'delete' }),
  F.pulse({ pod: `pod${gone + 1}`, at: 'delete' }),
  F.set({ at: 'delete', sublabels: { [`pod${gone + 1}Box`]: GOING.s }, wires: { fleetCap: caps.drained } }),
  F.fade({ target: `pod${gone + 1}`, from: 1, to: 0, dur: FADE.out, at: 'delete', fill: 'both', easing: 'ease-in' }),
  ...CLOSE[gone].map(target => F.fade({
    target, from: 1, to: 0, dur: FADE.out, at: 'delete', fill: 'both', easing: 'ease-in',
  })),
];

// The resting fleet, taken once because `idle` overrides ONE key of it: spreading `slots()` and
// then writing a bare `opacity:` after it replaces the whole map and every slot goes to undefined.
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
    // The second ReplicaSet is what this step CREATES, so its region AND its header arrive with the
    // write that creates it. A caption reading `replicas 0` beside no box is the same contradiction
    // as a box around an object the caption calls not created yet, in the mirror.
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
    // The animated path says the new Pod arrived by PULSING it, which no `lights` list can name,
    // so the static path has to say it with the inner box instead.
    reducedLit: ['pod4Box'],
    // The new Pod winds back to absent and rises on the create arrival: drawn at entry it would
    // stand its whole route ahead of its own ball. Its feed does not wind back, because `F.reveal`
    // already opens it on the write.
    rewind: {
      opacity: { pod4: 0 },
      wires: { v2Cap: V2.zero, fleetCap: FLEET.patched },
    },
    flow: [
      patchApi('patch'),
      // RS-v2 wants one replica the moment the scale write lands, which is the wire label of this
      // step. What it has READY is a different beat and belongs to the next step.
      F.set({ at: 'patch', wires: { v2Cap: V2.one } }),
      ...OPEN[3].map(target => F.reveal({ target, at: 'patch' })),
      F.route({ points: LANE(3), after: 'patch', name: 'create' }),
      F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'pod4', at: 'create' }),
      // Four Pods are alive when the fourth is on screen, not before it.
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
      // The Pod blinks FIRST and the watch event leaves after it: the probe passing is the cause
      // and the count reaching the Deployment is the effect.
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
    // The drained Pod comes back to full for the animated path and dims on the ball's arrival. Its
    // feed does not move at all: a lane is 0 or 1 here and the Pod is still standing there.
    rewind: {
      opacity: { pod1: 1 },
      sublabels: { pod1Box: READY.s },
      wires: { v1Cap: V1.full, fleetCap: FLEET.serving },
    },
    flow: [
      patchApi('patch'),
      F.set({ at: 'patch', wires: { v1Cap: V1.two } }),
      F.route({ points: LANE(0), after: 'patch', name: 'drain' }),
      F.pulse({ pod: 'pod1', at: 'drain' }),
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
    // The step opens on what `drain` left standing: the first old Pod at its terminating shade with
    // its feed still drawn, and the second one alive with its own. Both leave inside this step,
    // which is why the settled picture has an empty left slot pair.
    rewind: {
      opacity: { pod1: OPACITY.terminating, pod2: 1, pod5: 0, busL2: 1, busL3: 1, drop1: 1, drop2: 1 },
      sublabels: { pod1Box: GOING.s, pod2Box: READY.s, pod5Box: START.s },
      wires: { v1Cap: V1.two, v2Cap: V2.ready, fleetCap: FLEET.drained },
    },
    flow: [
      // The Pod the previous step left terminating finishes going, under the lead of the next
      // write, and its feed goes with it: the left region empties one slot at a time.
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
    // The fleet has crossed: the RS-v1 region is empty and RS-v2 holds all three.
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
      // Complete is stated only once the last old Pod is off the canvas: a Deployment is not
      // complete while an old Pod is still running, and the fade is that Pod still running.
      F.set({ at: 'delete', plus: FADE.out, wires: { fleetCap: FLEET.complete } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
