import { P, F, defineCard, midX, WL, BEAT, FADE, REVEAL_MS } from './workloads-kit.js';
import { rect } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-effective-pod-requests.md

// An INSTRUMENT, not an actor row over a Node floor: cpu up the page against one Pod life across
// it, so max and sum are one operation read over two differently shaped windows. The chart is a
// MOSAIC with no notch in it: every cell under the reserve level is either a container or the room
// the reservation holds idle. Panel measured at x<=396.55, y<=254.66 (worst of 1600/1280/1100), and
// every drawn string sits right of x=420 or below y=305, so the deepest panel stands 50 clear.

// The chart takes 900 of the 1080 the category gives it, centred on WL.CX, and the reader row is
// right-aligned to the same edge: at full width the four cells are 80 percent empty ink.
const CH_L = 150, CH_R = 1050, CH_W = CH_R - CH_L;       // 150..1050, centred on WL.CX

// Two control-plane readers of one number, EQUAL at the 232 the family gives an actor. The pair
// stands RIGHT OF THE PANEL rather than mirrored across WL.CX: two 232 boxes centred on the spine
// would start at 368 at any gap, behind the 396.55 panel wall (L-03). The row starts on 420 and
// its own centre is 682. WL.L-07 protects a corridor this card does not draw. The 60 gap is what
// the standing relation between the two is DRAWN in, and a shorter one reads as a hyphen.
const TOP_W = 232, TOP_GAP = 60;
const TOP1_X = 420, TOP2_X = TOP1_X + TOP_W + TOP_GAP;                      // 420..652 / 712..944
const SCHED_CX = TOP1_X + TOP_W / 2, KUBELET_CX = TOP2_X + TOP_W / 2;       // 536 / 828
const TOP_CX = midX(TOP1_X, TOP2_X + TOP_W);                                // 682, the pair centre
// They read ONE number, which is what step 6 says in words, so the tie between them is a standing
// RELATIONSHIP and not an exchange: no arrowhead, no ball, true on every step (A-06).
const REL_Y = WL.TOP_Y + WL.BOX_H / 2;                                      // 80, both side faces

// The requests the card is written around. Every height below is derived from them, so the drawing
// and the arithmetic cannot disagree, and the four are chosen so no two derived numbers collide:
// held is init_max - run_sum, which at sum 600 would have drawn the sidecar's own height.
const REQ = Object.freeze({ initA: 800, initB: 300, sidecar: 200, app: 450, overhead: 250 });
const INIT_MAX = Math.max(REQ.initA, REQ.initB);                    // 800m
const RUN_SUM = REQ.sidecar + REQ.app;                              // 650m
const NAIVE = REQ.initA + REQ.initB + RUN_SUM;                      // 1750m
const RESERVED = REQ.overhead + Math.max(INIT_MAX, RUN_SUM);        // 1050m
const HELD = RESERVED - (REQ.overhead + RUN_SUM);                   // 150m

// The reserve level is the anchor, not cpu zero: 306 is where the deepest narration stops, so the
// chart hangs off it and the axis falls where the scale puts it. 0.26 is the largest scale whose
// five requests are all whole units, and it keeps the shortest bar at 52 against the 38.75 floor
// box() is proven down to.
const SCALE = 0.26;
const CPU = (m) => m * SCALE;
const RESERVE_Y = 306;                                   // the reserve level, and the chart ceiling
const BASE_Y = RESERVE_Y + CPU(RESERVED);                // 579, cpu zero and the time axis
const DATUM = BASE_Y - CPU(REQ.overhead);                // 514, the floor the containers stand on
const RUN_TOP = DATUM - CPU(RUN_SUM);                    // 345, the run window envelope

// Time, left to right. The init phase is given a third of the width and the run phase the rest:
// the init containers are seconds and the run phase is the life of the Pod.
const T_A = 330, T_B = 450;
const INIT_CX = midX(CH_L, T_B), RUN_CX = midX(T_B, CH_R);          // 300 / 750

const barY = (m) => DATUM - CPU(m);
// 3.5, not the 1.4 a box stroke draws: a graduation lands ON a bar top where it caps one, and at
// box-stroke weight it is read as that bar's own edge instead of as a level.
const MARK_H = 3.5;

// The one readout, ABOVE the actor row on the WL.A-02 constant. The lanes stand 292 apart and no
// readout fits between them, and below the row a wire lands on a lane. Up here it is centred on the
// pair's own axis and clears the panel on every viewport: the longest string inks 296 wide, so it
// runs 534..830 against a wall at 396.55.
const READ_X = TOP_CX, READ_Y = WL.TOP_Y - 12;           // 682 / 28

// Presentation shades for the instrument, not lifecycle phases: a graduation has no phase. Channel
// list is the workloads tint (91, 184, 255), copied because a presentation attribute cannot
// resolve a token.
const RULE = Object.freeze({
  axis: 'rgba(255, 255, 255, 0.16)',
  mark: 'rgba(91, 184, 255, 0.9)',
});

// A graduation is a naked rect: box() here would be scored as a block by the geometry probe and as
// a body by CENTRE, and a 3.5 unit rule is neither.
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

// The list order IS the append order, so it is the z-order: the two lanes and the axis first, then
// the bars and the instrument over them, then the labels and the packet layer, and the two readers
// absolutely last so a ball passes behind them rather than over their labels.
export const SCENE = {
  'aria-label': 'Effective Pod request drawn as cpu over one Pod lifetime: regular init containers run one at a time so the init phase counts its tallest single container plus any sidecar declared before it, the sidecar and the app run together so theirs are summed, and the Pod is reserved the higher of the two standing on its RuntimeClass overhead, for the whole life',
  parts: [
    P.defs(),
    // Both carry the reservation up to a reader on the last step, which is what earns the
    // arrowhead (A-05). Nothing ever travels down, so there is no lane pair.
    P.arrow({ key: 'laneSched', ...LANE_SCHED, opacity: 0, dim: true, dashed: true, role: 'cluster' }),
    P.arrow({ key: 'laneKubelet', ...LANE_KUBELET, opacity: 0, dim: true, dashed: true, role: 'cluster' }),
    P.raw({
      make: () => {
        const r = rect({ x: CH_L, y: BASE_Y, width: CH_W, height: 1.5 });
        r.style.fill = RULE.axis;
        return r;
      },
    }),
    // The floor everything stands on, the full chart width because it is charged for the whole life.
    P.box({ key: 'ovhBand', x: CH_L, y: DATUM, w: CH_W, h: CPU(REQ.overhead), label: 'RuntimeClass overhead.podFixed', sublabel: `cpu ${REQ.overhead}m` }),
    // Two init windows end to end, then one run window carrying both non-init containers stacked,
    // which is the whole difference between a max and a sum. Both init tiles run the full height of
    // the init envelope, because the 800m is reserved for the whole phase whichever container is
    // holding it, and the two requests are told apart by their labels.
    P.box({ key: 'barInitA', x: CH_L, y: barY(REQ.initA), w: T_A - CH_L, h: CPU(REQ.initA), label: 'init-a', sublabel: `init · cpu ${REQ.initA}m` }),
    P.box({ key: 'barInitB', x: T_A, y: RESERVE_Y, w: T_B - T_A, h: DATUM - RESERVE_Y, label: 'init-b', sublabel: `init · cpu ${REQ.initB}m` }),
    P.box({ key: 'barSidecar', x: T_B, y: barY(REQ.sidecar), w: CH_R - T_B, h: CPU(REQ.sidecar), label: 'sidecar', sublabel: `always · cpu ${REQ.sidecar}m` }),
    P.box({ key: 'barApp', x: T_B, y: RUN_TOP, w: CH_R - T_B, h: CPU(REQ.app), label: 'app', sublabel: `app · cpu ${REQ.app}m` }),
    // The room the reservation holds over the run window and nothing still running asks for. It is a
    // TILE like every other cell, not a dashed ghost, so the last thing to arrive does not arrive as
    // a different species. It stays a naked rect wearing the box CLASS rather than a box: a real
    // box() is a block, and the two lanes leaving the reserve level would then be scored as arrivals
    // landing 245 off its face midpoint (OFFEDGE). The two colours come from the dialog's own tint
    // tokens, which a bare rect inherits, so nothing is hand-copied here.
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
    // Standing captions, true on every step, which is what a per-step wire cannot be. They say WHY
    // one window is a max and the other a sum, so they carry the whole argument of the card.
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

// ONE palette. Every block stands at full weight on every step, and a step says what it is about by
// LIGHTING it, never by shading the rest down: a card that walks a reader through three levels of
// grey has three palettes, not one. The opacity field therefore carries only ink that does not
// exist yet, and it moves 0 to 1 with nothing in between (C-04). A-16 still holds: the two lanes
// and the readers they reach are one key.
const stage = ({ lanes, initMark, reserveMark, held }) => ({
  laneSched: lanes, laneKubelet: lanes,
  initMark, reserveMark, heldBar: held,
});

const HIDDEN = { lanes: 0, initMark: 0, reserveMark: 0, held: 0 };
const INIT_READ = { ...HIDDEN, initMark: 1 };
const RESERVED_ST = { ...INIT_READ, reserveMark: 1, lanes: 1 };
const HELD_ST = { ...RESERVED_ST, held: 1 };

// The readout is the instrument reading itself, one line, replaced per step rather than a column of
// chips restating the heights the bars already draw.
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
    // The two init tiles light one after the other because they run one after the other. The sidecar
    // and the app light TOGETHER, which is the fact the rest of the card is built on. No static
    // `lit` here: a list would land all four at step entry and eat the stagger, and flowLights
    // derives the reduced path from these targets anyway.
    flow: [
      F.light({ targets: ['barInitA'], delay: BEAT.lead }),
      F.light({ targets: ['barInitB'], delay: BEAT.lead + 350 }),
      F.light({ targets: ['barSidecar', 'barApp'], delay: BEAT.lead + 700 }),
    ],
  },
  {
    id: 'overhead',
    // 318 characters at 3000 is 9.43 ms per character, beside the catalog median of 10.04: at 2600
    // it read at 8.18, rank 97 of 618, the most hurried step of this card by a margin.
    duration: 3000,
    narration: 'Everything the containers ask for stands on a floor. A Pod that names a RuntimeClass declaring overhead.podFixed carries that fixed amount for itself, 250m of cpu here for a sandboxed runtime. It pays for the sandbox rather than for anything a container asked for, and a Pod on the default runtime has no floor at all.',
    wires: { readout: READ.overhead, heldLbl: READ.none },
    opacity: stage(HIDDEN),
    flow: [F.light({ targets: ['ovhBand'], delay: BEAT.lead })],
  },
  {
    id: 'init-max',
    // 311 characters at 3000 is 9.65 ms per character.
    duration: 3000,
    narration: 'Regular init containers run strictly one at a time, so at no instant do two of them hold cpu together. The effective init request is therefore the highest single one, 800m, not the 1100m they add up to, and the phase holds that 800m whichever of the two is running, which is why init-b stands as tall as init-a.',
    wires: { readout: READ.init, heldLbl: READ.none },
    opacity: stage(INIT_READ),
    // The pair lights first and the level lands on top of it, so the rule reads as the answer to the
    // two tiles rather than as one more edge arriving with them.
    flow: [
      F.light({ targets: ['barInitA', 'barInitB'], delay: BEAT.lead }),
      F.reveal({ target: 'initMark', delay: BEAT.lead + 300 }),
    ],
  },
  {
    id: 'run-sum',
    // The one step with no packet and no reveal, so the whole hold is reading time: 335 characters
    // at 3200 is 9.55 ms per character, beside the catalog median of 10.04.
    duration: 3200,
    narration: 'The sidecar and the app overlap for the rest of the Pod, so their requests add up: 200m plus 450m is 650m. Being an init container with restartPolicy=Always, the sidecar is weighed in the init maximum too, where 800m wins. Declared before init-a it would run beside it and lift that maximum to 1000m: array order is part of the number.',
    wires: { readout: READ.run, heldLbl: READ.none },
    // Identical to the step before it: this beat adds no element, it only reads two that are drawn.
    opacity: stage(INIT_READ),
    // No packet and no new ink: the run envelope is the top edge of the run column itself, so a rule
    // drawn on it would be a level nothing can see. The beat is the pair lighting together, on the
    // same delay their two tiles took on step 1, and the readout that names what they add to (M-27).
    flow: [F.light({ targets: ['barSidecar', 'barApp'], delay: BEAT.lead })],
  },
  {
    id: 'reserve',
    // 312 characters at 3000 is 9.62 ms per character.
    duration: 3000,
    narration: 'A Pod is charged for the tallest instant of its life, so the higher of the two envelopes wins and that is the 800m init phase, not the 650m run phase. Standing on the 250m floor it comes to 1050m, and the line runs the whole width because the reservation lasts the whole life. Limits follow the same max and sum.',
    wires: { readout: READ.reserved, heldLbl: READ.none },
    opacity: stage(RESERVED_ST),
    // The init envelope carries across the run window, and only then are the two readers wired to
    // it: a lane drawn before the number exists points its arrowhead at blank canvas (M-24).
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
    // The caption names a band that is still 2.4s away, so the animated path blanks it and the
    // turnover below lands it with the band. prev and reset keep the static text (T-30).
    rewind: { wires: { heldLbl: ' ' } },
    // Neither reader is lit at entry: each one lights when the number addressed to it lands (A-06).
    flow: [
      F.segment({ ...LANE_SCHED, delay: BEAT.lead, name: 'bin', lights: ['sched'] }),
      F.segment({ ...LANE_KUBELET, after: 'bin', name: 'size', lights: ['kubelet'] }),
      F.reveal({ target: 'heldBar', after: 'size', name: 'gap' }),
      F.set({ at: 'gap', wires: { heldLbl: HELD_TEXT } }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
