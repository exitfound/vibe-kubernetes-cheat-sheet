import { P, F, defineCard, midX, WL, BEAT, FADE, REVEAL_MS } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-effective-pod-requests.md

// An instrument, not an actor row: cpu up the page against one Pod life across it, so max and sum
// are one operation read over two windows. Every cell under the reserve level is a container or held room.
const CH_L = 150, CH_R = 1050, CH_W = CH_R - CH_L;       // centred on WL.CX

// The pair stands right of the panel: centred on the spine it would start behind the panel wall (L-03).
// The gap is what the standing relation is drawn in, and a shorter one reads as a hyphen.
const TOP_W = 232, TOP_GAP = 60;
const TOP1_X = 420, TOP2_X = TOP1_X + TOP_W + TOP_GAP;
const SCHED_CX = TOP1_X + TOP_W / 2, KUBELET_CX = TOP2_X + TOP_W / 2;
const TOP_CX = midX(TOP1_X, TOP2_X + TOP_W);
// They read one number, so the tie is a standing relation, not an exchange (A-06).
const REL_Y = WL.TOP_Y + WL.BOX_H / 2;

// Every height is derived from these, and they are chosen so no two derived numbers collide.
const REQ = Object.freeze({ initA: 800, initB: 300, sidecar: 200, app: 450, overhead: 250 });
const INIT_MAX = Math.max(REQ.initA, REQ.initB);
const RUN_SUM = REQ.sidecar + REQ.app;
const NAIVE = REQ.initA + REQ.initB + RUN_SUM;
const RESERVED = REQ.overhead + Math.max(INIT_MAX, RUN_SUM);
const HELD = RESERVED - (REQ.overhead + RUN_SUM);

// The chart hangs off the reserve level, below the deepest narration. SCALE keeps every request a
// whole number of units and the shortest bar above box()'s floor.
const SCALE = 0.26;
const CPU = (m) => m * SCALE;
const RESERVE_Y = 306;                                   // the reserve level, and the chart ceiling
const BASE_Y = RESERVE_Y + CPU(RESERVED);                // cpu zero and the time axis
const DATUM = BASE_Y - CPU(REQ.overhead);                // the floor the containers stand on
const RUN_TOP = DATUM - CPU(RUN_SUM);                    // the run window envelope

// The init containers are seconds and the run phase is the life of the Pod.
const T_A = 330, T_B = 450;
const INIT_CX = midX(CH_L, T_B), RUN_CX = midX(T_B, CH_R);

const barY = (m) => DATUM - CPU(m);
// Heavier than a box stroke, or a graduation on a bar top reads as that bar's own edge.
const MARK_H = 3.5;

// Above the actor row (WL.A-02): no readout fits between the lanes, and below the row it lands on one.
const READ_X = TOP_CX, READ_Y = WL.TOP_Y - 12;

// Presentation shades, not lifecycle phases. mark is the workloads tint, copied because a style
// value here cannot resolve a token.
const RULE = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  mark: 'rgba(91, 184, 255, 0.9)',
});

// A naked rect: a rule this thin is not a block.
const graduation = ({ key, x, w, y }) => P.raw({
  key,
  opacity: 0,
  make: () => {
    const r = rect({ x, y: y - MARK_H / 2, width: w, height: MARK_H });
    r.style.fill = RULE.mark;
    return r;
  },
});

const LANE_SCHED = { from: [SCHED_CX, RESERVE_Y], to: [SCHED_CX, WL.TOP_BOTTOM] };
const LANE_KUBELET = { from: [KUBELET_CX, RESERVE_Y], to: [KUBELET_CX, WL.TOP_BOTTOM] };

// The list order is the z-order: the two readers go last.
export const SCENE = {
  'aria-label': 'Effective Pod request drawn as cpu over one Pod lifetime: regular init containers run one at a time so the init phase counts its tallest single container plus any sidecar declared before it, the sidecar and the app run together so theirs are summed, and the Pod is reserved the higher of the two standing on its RuntimeClass overhead, for the whole life',
  parts: [
    P.defs(),
    // A ball rides up on the last step, which earns the arrowhead (A-05). Nothing travels down.
    P.arrow({ key: 'laneSched', ...LANE_SCHED, opacity: 0, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'laneKubelet', ...LANE_KUBELET, opacity: 0, dim: true, dashed: true, role: 'cluster' }),
    P.raw({
      make: () => {
        const r = rect({ x: CH_L, y: BASE_Y, width: CH_W, height: 1.5 });
        r.style.fill = RULE.axis;
        return r;
      },
    }),
    // Full chart width: overhead is charged for the whole life.
    P.box({ key: 'ovhBand', x: CH_L, y: DATUM, w: CH_W, h: CPU(REQ.overhead), label: 'RuntimeClass overhead.podFixed', sublabel: `cpu ${REQ.overhead}m` }),
    // Both init tiles run the full init envelope height: the max is reserved for the whole phase.
    P.box({ key: 'barInitA', x: CH_L, y: barY(REQ.initA), w: T_A - CH_L, h: CPU(REQ.initA), label: 'init-a', sublabel: `init · cpu ${REQ.initA}m` }),
    P.box({ key: 'barInitB', x: T_A, y: RESERVE_Y, w: T_B - T_A, h: DATUM - RESERVE_Y, label: 'init-b', sublabel: `init · cpu ${REQ.initB}m` }),
    P.box({ key: 'barSidecar', x: T_B, y: barY(REQ.sidecar), w: CH_R - T_B, h: CPU(REQ.sidecar), label: 'sidecar', sublabel: `always · cpu ${REQ.sidecar}m` }),
    P.box({ key: 'barApp', x: T_B, y: RUN_TOP, w: CH_R - T_B, h: CPU(REQ.app), label: 'app', sublabel: `app · cpu ${REQ.app}m` }),
    // Held room, drawn as a tile. A naked rect wearing the box class, not a box(), so the lanes
    // leaving the reserve level are not scored as arrivals on it (OFFEDGE).
    P.raw({
      key: 'heldBar',
      opacity: 0,
      make: () => {
        const r = rect({ class: 'scheme-box-rect', x: T_B, y: RESERVE_Y, width: CH_R - T_B, height: RUN_TOP - RESERVE_Y, rx: 6, ry: 6 });
        r.style.fill = 'var(--tint-fill)';
        r.style.stroke = 'rgb(var(--tint-base-rgb))';
        return r;
      },
    }),
    graduation({ key: 'initMark', x: CH_L, w: T_B - CH_L, y: RESERVE_Y }),
    graduation({ key: 'reserveMark', x: T_B, w: CH_R - T_B, y: RESERVE_Y }),
    P.wire({ key: 'readout', x: READ_X, y: READ_Y }),
    P.wire({ key: 'heldLbl', x: RUN_CX, y: midX(RESERVE_Y, RUN_TOP) + 4 }),
    // Standing captions: why one window is a max and the other a sum.
    P.tag({ x: INIT_CX, y: BASE_Y + 18, text: 'init phase · one container at a time' }),
    P.tag({ x: RUN_CX, y: BASE_Y + 18, text: 'run phase · sidecar and app together' }),
    P.packets(),
    P.relation({ points: [[TOP1_X + TOP_W, REL_Y], [TOP2_X, REL_Y]], role: 'cluster' }),
    P.box({ key: 'sched', x: TOP1_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Scheduler', sublabel: 'bins on this request', role: 'cluster' }),
    P.box({ key: 'kubelet', x: TOP2_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'sizes the Pod cgroup', role: 'cluster' }),
  ],
  reset: {
    keys: ['sched', 'kubelet', 'ovhBand', 'barInitA', 'barInitB', 'barSidecar', 'barApp'],
    pods: [],
  },
};

// A step says what it is about by lighting, never by shading the rest down, so opacity only
// carries ink that does not exist yet, 0 or 1 (C-04, A-16).
const stage = ({ lanes, initMark, reserveMark, held }) => ({
  laneSched: lanes, laneKubelet: lanes,
  initMark, reserveMark, heldBar: held,
});

const HIDDEN = { lanes: 0, initMark: 0, reserveMark: 0, held: 0 };
const INIT_READ = { ...HIDDEN, initMark: 1 };
const RESERVED_ST = { ...INIT_READ, reserveMark: 1, lanes: 1 };
const HELD_ST = { ...RESERVED_ST, held: 1 };

// One readout line per step, instead of chips restating the heights the bars draw.
const READ = Object.freeze({
  none: ' ',
  naive: `four cpu requests · add up to ${NAIVE}m`,
  overhead: 'pod overhead · the floor, not a container',
  init: `effective init request · max ${INIT_MAX}m`,
  run: `effective non-init request · sum ${RUN_SUM}m`,
  reserved: `effective Pod request · ${REQ.overhead}m + ${INIT_MAX}m = ${RESERVED}m`,
  held: `reserved ${RESERVED}m · held for the Pod lifetime`,
});
const HELD_TEXT = `${HELD}m asked for by nothing that is still running`;

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    wires: { readout: READ.none, heldLbl: READ.none },
    opacity: stage(HIDDEN),
  },
  {
    id: 'profile',
    duration: 3400,
    narration: 'Read this as one Pod life, left to right, with cpu up the page. First init-a runs on its own, then init-b runs on its own, and then the sidecar and the app run together for the rest of the Pod. Four containers, four cpu requests, and adding all four up gives 1750m, which is the one number this Pod is never charged.',
    wires: { readout: READ.naive, heldLbl: READ.none },
    opacity: stage(HIDDEN),
    // Init tiles light one after the other, sidecar and app together. No static `lit`: it would
    // land all four at entry and eat the stagger.
    flow: [
      F.light({ targets: ['barInitA'], delay: BEAT.lead }),
      F.light({ targets: ['barInitB'], delay: BEAT.lead + 350 }),
      F.light({ targets: ['barSidecar', 'barApp'], delay: BEAT.lead + 700 }),
    ],
  },
  {
    id: 'overhead',
    duration: 3000,
    narration: 'Everything the containers ask for stands on a floor. A Pod that names a RuntimeClass declaring overhead.podFixed carries that fixed amount for itself, 250m of cpu here for a sandboxed runtime. It pays for the sandbox rather than for anything a container asked for, and a Pod on the default runtime has no floor at all.',
    wires: { readout: READ.overhead, heldLbl: READ.none },
    opacity: stage(HIDDEN),
    flow: [F.light({ targets: ['ovhBand'], delay: BEAT.lead })],
  },
  {
    id: 'init-max',
    duration: 3000,
    narration: 'Regular init containers run strictly one at a time, so at no instant do two of them hold cpu together. The effective init request is therefore the highest single one, 800m, not the 1100m they add up to, and the phase holds that 800m whichever of the two is running, which is why init-b stands as tall as init-a.',
    wires: { readout: READ.init, heldLbl: READ.none },
    opacity: stage(INIT_READ),
    // The level lands after the pair, so it reads as the answer to the two tiles.
    flow: [
      F.light({ targets: ['barInitA', 'barInitB'], delay: BEAT.lead }),
      F.reveal({ target: 'initMark', delay: BEAT.lead + 300 }),
    ],
  },
  {
    id: 'run-sum',
    duration: 3200,
    narration: 'The sidecar and the app overlap for the rest of the Pod, so their requests add up: 200m plus 450m is 650m. Being an init container with restartPolicy=Always, the sidecar is weighed in the init maximum too, where 800m wins. Declared before init-a it would run beside it and lift that maximum to 1000m: array order is part of the number.',
    wires: { readout: READ.run, heldLbl: READ.none },
    opacity: stage(INIT_READ),
    // No rule here: the run envelope is the top edge of the run column itself (M-27).
    flow: [F.light({ targets: ['barSidecar', 'barApp'], delay: BEAT.lead })],
  },
  {
    id: 'reserve',
    duration: 3000,
    narration: 'A Pod is charged for the tallest instant of its life, so the higher of the two envelopes wins and that is the 800m init phase, not the 650m run phase. Standing on the 250m floor it comes to 1050m, and the line runs the whole width because the reservation lasts the whole life. Limits follow the same max and sum.',
    wires: { readout: READ.reserved, heldLbl: READ.none },
    opacity: stage(RESERVED_ST),
    // The lanes appear only after the level exists (M-24).
    flow: [
      F.light({ targets: ['barInitA'], delay: BEAT.lead }),
      F.reveal({ target: 'reserveMark', delay: BEAT.lead }),
      F.fade({ target: 'laneSched', from: 0, to: 1, dur: FADE.in, delay: BEAT.lead + REVEAL_MS }),
      F.fade({ target: 'laneKubelet', from: 0, to: 1, dur: FADE.in, delay: BEAT.lead + REVEAL_MS }),
    ],
  },
  {
    id: 'held',
    duration: 3600,
    narration: 'The Scheduler bins the Pod on 1050m and the Kubelet sizes the Linux Pod cgroup from the same number. By the start of the run phase init-a is finished, and for that whole phase 150m of what was reserved is asked for by nothing that is still running. Memory is counted the same way, and a Pod that sets pod-level spec.resources replaces this number with its own.',
    wires: { readout: READ.held, heldLbl: HELD_TEXT },
    opacity: stage(HELD_ST),
    // The caption lands with its band, so the animated path blanks it first (T-30).
    rewind: { wires: { heldLbl: ' ' } },
    // Each reader lights when its number lands (A-06).
    flow: [
      F.segment({ ...LANE_SCHED, delay: BEAT.lead, name: 'bin', lights: ['sched'] }),
      F.segment({ ...LANE_KUBELET, after: 'bin', name: 'size', lights: ['kubelet'] }),
      F.reveal({ target: 'heldBar', after: 'size', name: 'gap' }),
      F.set({ at: 'gap', wires: { heldLbl: HELD_TEXT } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
