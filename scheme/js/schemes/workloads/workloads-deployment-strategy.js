import { P, F, defineCard, strip, WL, FADE, BEAT, OPACITY } from './workloads-kit.js';
import { g, rect, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/workloads-deployment-strategy.md

// TWO STACKED STRATEGY TRACKS and NO `LAYOUT` preset: no ladder and no flanking column for A, B or
// C to place, so the geometry is stated here and the chip strip comes from `strip()` at full width.
// Both answers stand at once, and each track PLAYS both of its orders across two steps, so the
// reader compares straight DOWN one x rather than reading the sequence off a tile.
// Panel x<=397, y<=305. Measured 304.36 at 1100x800 on the poster, which previews `field`, the
// longest narration (D-14).
const PANEL_B = 305;

// The actor row is a single box centred on CX, because WL.L-07 needs the box the trunk leaves to
// put a face midpoint in the 540..660 corridor. 232 is the `workloads-rolling-update` Deployment
// box, the same object on the sibling card, and one owner drawn at two sizes reads as two kinds.
const TOP_W = 232, TOP_X = WL.CX - TOP_W / 2;            // 484..716, centred on CX

// A track reads left to right as TIME: the order on the left is issued first, the one on the right
// after, and the handover window is the span between them. Both tracks run the full width, so the
// content bbox spans WL.L..WL.R and centres on CX by construction.
const TILE_W = 260, TILE_H = 44, CELL_GAP = 60;
const TILE1_X = WL.L;                                    // 60..320
const TILE2_X = WL.R - TILE_W;                           // 880..1140
const WIN_L = TILE1_X + TILE_W + CELL_GAP;               // 380
const WIN_R = TILE2_X - CELL_GAP;                        // 820
const WIN_W = WIN_R - WIN_L;                             // 440
const WIN_CX = WIN_L + WIN_W / 2;                        // 600, the canvas centre

// The Pod pair IS the payload: 440 of Pod against the 260 of the tile that brackets it.
// Ordered per track so the Pod each order acts on sits nearest that order's tile, which makes the
// Recreate track the RollingUpdate track MIRRORED, Pods and tiles together: on both tracks the
// FIRST order is on the left and reaches the left Pod, the SECOND is on the right and reaches the
// right Pod, so one x is one moment on both rows and no lane crosses a Pod to reach its target.
const POD_GAP = 20;
const POD_W = (WIN_W - POD_GAP) / 2;                     // 210
const POD_H = 72;
const POD_XS = [WIN_L, WIN_L + POD_W + POD_GAP];         // 380 / 610
const POD_INNER = { dx: 30, w: POD_W - 60, dy: 22, h: 38 };

// Two bands, 108 apart. Each is one Pod row, with its two order tiles centred on the same midline.
const ROW_A = 366, ROW_B = 474;                          // Pod tops: 366..438 and 474..546
const midY = (rowY) => rowY + POD_H / 2;                 // 402 / 510
const tileY = (rowY) => midY(rowY) - TILE_H / 2;         // 380 / 488
const capY = (rowY) => rowY - 12;                        // 354 / 462

// WL.L-05 three-across, the width the chip strings were sized against.
const CHIPS = strip({ from: WL.L, to: WL.R, count: 3, gap: 14 });   // 350.67 each
const CHIP_Y = 566;                                      // 566..600, 30 clear of the 630 floor

// The trunk drops on CX to the jog and forks BOTH ways: a left bus at 350 in the 320..380 corridor
// between the first tile and the window, a right bus at 850 in the 820..880 corridor between the
// window and the second tile. The left bus carries every FIRST order and the right bus every
// SECOND, each tap landing on the Pod the tile beside it names. The left jog is the one horizontal
// reaching into the panel column and it clears the deepest measured panel by 35.64 (L-03).
const JOG_Y = PANEL_B + 35, BUS_L = 350, BUS_R = 850;     // 340
// SPLIT at track A on both sides. Unsplit, the leg below track A stands with a dangling end on the
// step that empties a slot on track B, which is the A-14 shape: it has to die with the tap it feeds.
const TRUNK = [[WL.CX, WL.TOP_BOTTOM], [WL.CX, JOG_Y]];
const BUS_L_HIGH = [[WL.CX, JOG_Y], [BUS_L, JOG_Y], [BUS_L, midY(ROW_A)]];
const BUS_L_LOW = [[BUS_L, midY(ROW_A)], [BUS_L, midY(ROW_B)]];
const BUS_R_HIGH = [[WL.CX, JOG_Y], [BUS_R, JOG_Y], [BUS_R, midY(ROW_A)]];
const BUS_R_LOW = [[BUS_R, midY(ROW_A)], [BUS_R, midY(ROW_B)]];
const TAP_A1 = [[BUS_L, midY(ROW_A)], [WIN_L, midY(ROW_A)]];
const TAP_A2 = [[BUS_R, midY(ROW_A)], [WIN_R, midY(ROW_A)]];
const TAP_B1 = [[BUS_L, midY(ROW_B)], [WIN_L, midY(ROW_B)]];
const TAP_B2 = [[BUS_R, midY(ROW_B)], [WIN_R, midY(ROW_B)]];
// The ball rides the trunk, one bus and its own tap as one route: 562 for track A and 670 for
// track B on either side, all clear of the 314 where routeDur stops clamping, so no ball is
// floor-bound.
const LANE_A1 = [...TRUNK, ...BUS_L_HIGH.slice(1), [WIN_L, midY(ROW_A)]];
const LANE_A2 = [...TRUNK, ...BUS_R_HIGH.slice(1), [WIN_R, midY(ROW_A)]];
const LANE_B1 = [...TRUNK, ...BUS_L_HIGH.slice(1), ...BUS_L_LOW.slice(1), [WIN_L, midY(ROW_B)]];
const LANE_B2 = [...TRUNK, ...BUS_R_HIGH.slice(1), ...BUS_R_LOW.slice(1), [WIN_R, midY(ROW_B)]];

// The outage is DRAWN. A slot that only loses its Pod reads as a half nobody finished, because a
// missing body is the same ink as one that is not built yet, so the slot Recreate empties gets a
// mark of its own: a hollow the exact size of the Pod it replaces, captioned with what it holds.
// It is the LEFT slot of track B, where web-a1 stood, and not the whole window: web-b2 is still a
// not-created ghost on the right while the mark stands, and the mark dies when that ghost is Ready.
const VOID = Object.freeze({
  stroke: 'rgba(255, 255, 255, 0.34)',
  dash: '8 8',
});
const voidSlot = () => P.raw({
  key: 'gapMark',
  make: () => {
    const el = g({ id: 'gapMark' });
    const r = rect({ x: POD_XS[0], y: ROW_B, width: POD_W, height: POD_H, rx: 10 });
    r.style.fill = 'none';
    r.style.stroke = VOID.stroke;
    r.style.strokeWidth = '1.6';
    r.style.strokeDasharray = VOID.dash;
    el.appendChild(r);
    // A mark with no word is a decoration, so the rule and its caption reveal as one keyed group.
    el.appendChild(text({ class: 'scheme-label code', x: POD_XS[0] + POD_W / 2, y: midY(ROW_B) + 5, 'text-anchor': 'middle' }, ['no Pod serving']));
    el.style.opacity = '0';
    return el;
  },
});

// The trunk and every bus segment CARRY balls, so they are lanes and not relations: a relation is
// held at stroke-opacity 0.45 and would draw the ball's own road at half the strength of the tap it
// feeds. A trunk or bus segment is not the ball's destination, so `tune` drops the marker the lane
// attaches: the arrowhead belongs on the tap that lands on a Pod (A-05, A-07).
const busPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

const ORDER_CREATE = 'Create web-b2';
const ORDER_TERMINATE = 'Terminate web-a1';

// Z-order: the lanes and the captions first, then the packet layer, then the void mark, the tracks
// and the actor row above the ball.
export const SCENE = {
  'aria-label': 'Deployment strategy: .spec.strategy.type takes two values and each issues the same create and the same terminate in the opposite order. RollingUpdate, where the 25% maxSurge default resolves to 1 at this single replica, creates Pod web-b2 first, waits for it to report Ready and only then terminates Pod web-a1, so both Pods are up across the handover window. Recreate terminates web-a1 first, waits for the removal to succeed and only then creates web-b2, so the same window holds no Pod serving at all. Both tracks end with one Pod web-b2 Ready',
  parts: [
    P.defs(),
    busPath('trunk', TRUNK),
    busPath('busLHigh', BUS_L_HIGH),
    busPath('busLLow', BUS_L_LOW),
    busPath('busRHigh', BUS_R_HIGH),
    busPath('busRLow', BUS_R_LOW),
    P.lane({ key: 'tapA1', points: TAP_A1, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'tapA2', points: TAP_A2, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'tapB1', points: TAP_B1, dim: true, dashed: true, role: 'cluster' }),
    P.lane({ key: 'tapB2', points: TAP_B2, dim: true, dashed: true, role: 'cluster' }),
    // A standing caption per track, true on every step: it says WHICH value of the field the row
    // below it draws, which is what lets a reader compare down one x without tracing a lane.
    P.tag({ x: WL.L, y: capY(ROW_A), text: 'RollingUpdate', anchor: 'start' }),
    P.tag({ x: WL.L, y: capY(ROW_B), text: 'Recreate', anchor: 'start' }),
    // One per-step caption over each window, saying what THAT window holds right now.
    P.wire({ key: 'capA', x: WIN_CX, y: capY(ROW_A) }),
    P.wire({ key: 'capB', x: WIN_CX, y: capY(ROW_B) }),
    P.chip({ key: 'strategyChip', x: CHIPS.x(0), y: CHIP_Y, w: CHIPS.w, h: WL.CHIP_H, name: '.spec.strategy.type', value: 'RollingUpdate' }),
    P.chip({ key: 'orderChip', x: CHIPS.x(1), y: CHIP_Y, w: CHIPS.w, h: WL.CHIP_H, name: 'order issued', value: 'none yet' }),
    P.chip({ key: 'servingChip', x: CHIPS.x(2), y: CHIP_Y, w: CHIPS.w, h: WL.CHIP_H, name: 'serving', value: '1, web-a1 on both tracks' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so a ball runs under what it lands on.
    voidSlot(),
    P.box({ key: 'tileA1', x: TILE1_X, y: tileY(ROW_A), w: TILE_W, h: TILE_H, label: ORDER_CREATE, sublabel: 'first' }),
    P.box({ key: 'tileA2', x: TILE2_X, y: tileY(ROW_A), w: TILE_W, h: TILE_H, label: ORDER_TERMINATE, sublabel: 'then' }),
    P.box({ key: 'tileB1', x: TILE1_X, y: tileY(ROW_B), w: TILE_W, h: TILE_H, label: ORDER_TERMINATE, sublabel: 'first' }),
    P.box({ key: 'tileB2', x: TILE2_X, y: tileY(ROW_B), w: TILE_W, h: TILE_H, label: ORDER_CREATE, sublabel: 'then' }),
    P.pod({ key: 'podAnew', id: 'podAnew', shellKey: 'podAnewShell', innerKey: 'podAnewBox', x: POD_XS[0], y: ROW_A, w: POD_W, h: POD_H, label: 'Pod web-b2', sublabel: '', containers: 0, inner: { ...POD_INNER, label: 'app v2.0', sublabel: 'not created' } }),
    P.pod({ key: 'podAold', id: 'podAold', innerKey: 'podAoldBox', x: POD_XS[1], y: ROW_A, w: POD_W, h: POD_H, label: 'Pod web-a1', sublabel: '', containers: 0, inner: { ...POD_INNER, label: 'app v1.0', sublabel: 'Ready' } }),
    P.pod({ key: 'podBold', id: 'podBold', innerKey: 'podBoldBox', x: POD_XS[0], y: ROW_B, w: POD_W, h: POD_H, label: 'Pod web-a1', sublabel: '', containers: 0, inner: { ...POD_INNER, label: 'app v1.0', sublabel: 'Ready' } }),
    P.pod({ key: 'podBnew', id: 'podBnew', shellKey: 'podBnewShell', innerKey: 'podBnewBox', x: POD_XS[1], y: ROW_B, w: POD_W, h: POD_H, label: 'Pod web-b2', sublabel: '', containers: 0, inner: { ...POD_INNER, label: 'app v2.0', sublabel: 'not created' } }),
    P.box({ key: 'deployment', x: TOP_X, y: WL.TOP_Y, w: TOP_W, h: WL.BOX_H, label: 'Deployment web', sublabel: '.spec.replicas 1', role: 'cluster' }),
  ],
  reset: {
    keys: ['deployment', 'tileA1', 'tileA2', 'tileB1', 'tileB2',
      'podAnewShell', 'podBnewShell',
      'podAnewBox', 'podAoldBox', 'podBoldBox', 'podBnewBox',
      'strategyChip', 'orderChip', 'servingChip'],
    pods: ['podAnew', 'podAold', 'podBold', 'podBnew'],
  },
};

const NR = OPACITY.notready;

// A-16: one factory returns the whole opacity field, blocks and lanes together.
// EVERY LANE IS LIT WHOLE OR IT IS GONE, road and tap alike: a segment is `tiles` while anything it
// still reaches EXISTS, and 0 once every sink of it has left (A-14). A Pod that is not created yet
// is not gone, and the Pod itself carries the 0.4 that says so, so no line takes a third shade off
// the block it points at. The working, and what a chained min(source, sink) drew instead, is in the
// record under LANES.
const road = (tiles, ...sinks) => (Math.max(...sinks) > 0 ? tiles : 0);
const stage = ({ tiles, aNew, aOld, bOld, bNew, gap }) => ({
  tileA1: tiles, tileA2: tiles, tileB1: tiles, tileB2: tiles,
  podAnew: aNew, podAold: aOld, podBold: bOld, podBnew: bNew,
  gapMark: gap,
  trunk: tiles,
  busLHigh: road(tiles, aNew, bOld),
  tapA1: road(tiles, aNew),
  busLLow: road(tiles, bOld),
  tapB1: road(tiles, bOld),
  busRHigh: road(tiles, aOld, bNew),
  tapA2: road(tiles, aOld),
  busRLow: road(tiles, bNew),
  tapB2: road(tiles, bNew),
});

// The chip and caption vocabulary, one string per state so no two steps spell one state two ways.
const ORDER = {
  none: 'none yet',
  a1: '1 of 2, create web-b2',
  a2: '2 of 2, terminate web-a1',
  b1: '1 of 2, terminate web-a1',
  b2: '2 of 2, create web-b2',
  both: '2 of 2 on both tracks',
};
// A COUNT ON A TWO TRACK CARD NAMES ITS TRACK. Both readings stand on the canvas at once, so a bare
// `0, nobody` sat under a lit Ready Pod on the other track and read as a contradiction rather than
// as the Recreate window. Every value here says whose count it is, and the two that are true of
// both say that instead. The order chip needs no prefix: its own words name the order, the strategy
// chip beside it names the track, and it will not take one (see the record, SIZES).
const SERVING = {
  old: '1, web-a1 on both tracks',
  aTwo: 'RollingUpdate 2, web-a1 and web-b2',
  aFresh: 'RollingUpdate 1, web-b2',
  bNone: 'Recreate 0, nobody',
  bFresh: 'Recreate 1, web-b2',
  both: '1, web-b2 on both tracks',
};
const CAP = {
  old: 'web-a1 serves alone',
  starting: 'web-b2 starting beside web-a1',
  bothUp: 'both are up across this window',
  done: 'web-b2 serves alone, update done',
  nobody: 'nobody is up across this window',
  cold: 'web-b2 starting, nobody serving yet',
};
// The Pod sublabel vocabulary, shared with `workloads-rolling-update` (READY, START, GOING there).
const POD = { none: 'not created', starting: 'starting', ready: 'Ready', going: 'terminating' };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { strategyChip: 'RollingUpdate', orderChip: ORDER.none, servingChip: SERVING.old },
    // The two window captions stand on the POSTER as well, the way `workloads-rolling-update` states
    // its three: both windows hold web-a1 alone before anything is ordered, so the string step 1
    // shows is already true here, and leaving it out made two labels appear on the turn into step 1.
    wires: { capA: CAP.old, capB: CAP.old },
    sublabels: { podAnewBox: POD.none, podAoldBox: POD.ready, podBoldBox: POD.ready, podBnewBox: POD.none },
    // The structure stands at FULL strength the moment the card opens: the four orders and the road
    // that carries them are true before any step runs, so the poster is the picture step 1 talks
    // about rather than a dimmed draft of it, and nothing brightens on the turn into `field`.
    opacity: stage({ tiles: 1, aNew: NR, aOld: 1, bOld: 1, bNew: NR, gap: 0 }),
  },
  {
    id: 'field',
    // 3100 and not the 4200 it opened with. The step cues once at BEAT.lead and then stands still,
    // so the hold is pure reading time: at 445 characters 4200 read 9.44 ms/char and 3100 reads
    // 6.97, inside the band the catalog gives its long narrations. The working is in the record.
    duration: 3100,
    narration: 'A Deployment replaces its Pods, and .spec.strategy.type decides in which order. The field takes two values and no third, RollingUpdate and Recreate, and a Deployment written with no strategy at all gets RollingUpdate. Both tracks start from the same place: Pod web-a1 on app v1.0 is Ready, and .spec.template has just been changed to v2.0. Each track will issue the same two orders, one create and one terminate, and only their sequence differs.',
    chips: { strategyChip: 'RollingUpdate', orderChip: ORDER.none, servingChip: SERVING.old },
    wires: { capA: CAP.old, capB: CAP.old },
    sublabels: { podAnewBox: POD.none, podAoldBox: POD.ready, podBoldBox: POD.ready, podBnewBox: POD.none },
    opacity: stage({ tiles: 1, aNew: NR, aOld: 1, bOld: 1, bNew: NR, gap: 0 }),
    lit: ['deployment', 'strategyChip'],
    // The four orders are the SAME PAIR twice, so they are cued as ONE beat: what this step says is
    // that both tracks issue one create and one terminate, and a cue walking tile by tile would
    // draw a sequence, which is the next four steps' job and not this one's. The tiles are already
    // at full strength when the card opens, so nothing here brightens either. No ball, because
    // nothing has been ordered yet, and this is the packet-less pod-less step a box cue belongs on.
    flow: [
      F.light({ targets: ['tileA1', 'tileA2', 'tileB1', 'tileB2'], delay: BEAT.lead }),
    ],
  },
  {
    id: 'rollingCreate',
    duration: 4400,
    narration: 'RollingUpdate starts by creating. At .spec.replicas 1 the 25% defaults resolve to maxSurge 1 and maxUnavailable 0, so the controller may run one Pod above the count and may not lose the one it has. Its first order is therefore Create web-b2: the Pod appears on app v2.0 and starts, and web-a1 keeps serving beside it. Nothing is removed until the newcomer reports Ready.',
    chips: { strategyChip: 'RollingUpdate', orderChip: ORDER.a1, servingChip: SERVING.old },
    wires: { capA: CAP.starting, capB: CAP.old },
    sublabels: { podAnewBox: POD.starting, podAoldBox: POD.ready, podBoldBox: POD.ready, podBnewBox: POD.none },
    opacity: stage({ tiles: 1, aNew: 1, aOld: 1, bOld: 1, bNew: NR, gap: 0 }),
    lit: ['deployment'],
    // The tile is the ORDER, so it lights when the ball leaves and not when it lands: the Deployment
    // issues Create web-b2 and the ball carries it to the Pod it names. The tap is already at 1 in
    // the static block, so no rewind is owed for the flight (A-15).
    rewind: {
      opacity: { podAnew: NR },
      sublabels: { podAnewBox: POD.none },
      chips: { orderChip: ORDER.none },
      wires: { capA: CAP.old },
    },
    flow: [
      F.light({ targets: ['tileA1'], delay: BEAT.lead }),
      F.route({ points: LANE_A1, delay: BEAT.lead, name: 'create' }),
      F.fade({ target: 'podAnew', from: NR, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podAnew', at: 'create' }),
      F.set({
        at: 'create',
        sublabels: { podAnewBox: POD.starting },
        chips: { orderChip: ORDER.a1 },
        wires: { capA: CAP.starting },
        lights: ['orderChip'],
      }),
    ],
  },
  {
    id: 'rollingTerminate',
    duration: 5200,
    narration: 'Pod web-b2 reports Ready, and at the default minReadySeconds 0 that readiness alone releases the second order, Terminate web-a1. Across the handover window both Pods were up, which is what buys the update its uptime and is also its bill: for that span two versions answered at the same moment. Pod web-a1 finishes terminating and the track ends where it started, one Pod serving, now on v2.0.',
    chips: { strategyChip: 'RollingUpdate', orderChip: ORDER.a2, servingChip: SERVING.aFresh },
    wires: { capA: CAP.done, capB: CAP.old },
    sublabels: { podAnewBox: POD.ready, podAoldBox: POD.going, podBoldBox: POD.ready, podBnewBox: POD.none },
    opacity: stage({ tiles: 1, aNew: 1, aOld: 0, bOld: 1, bNew: NR, gap: 0 }),
    lit: ['deployment'],
    // Two beats. The Pod reports Ready first, a self-initiated blink after BEAT.lead, and the serving
    // count goes to two on it. The terminate leaves BEAT.afterPulse later, which is the wait for
    // Ready drawn as a gap, lands on web-a1 and takes its TAP down with the Pod (A-14). The right
    // bus does not move: it still reaches web-b2 on track B, and a road is lit whole or it is gone.
    rewind: {
      opacity: { podAold: 1, tapA2: 1 },
      sublabels: { podAnewBox: POD.starting, podAoldBox: POD.ready },
      chips: { orderChip: ORDER.a1, servingChip: SERVING.old },
      wires: { capA: CAP.starting },
    },
    flow: [
      F.pulse({ pod: 'podAnew', delay: BEAT.lead, name: 'ready' }),
      F.set({ at: 'ready', sublabels: { podAnewBox: POD.ready }, chips: { servingChip: SERVING.aTwo }, wires: { capA: CAP.bothUp }, lights: ['servingChip'] }),
      F.light({ targets: ['tileA2'], at: 'ready', plus: BEAT.afterPulse }),
      F.route({ points: LANE_A2, at: 'ready', plus: BEAT.afterPulse, name: 'terminate' }),
      F.set({ at: 'terminate', sublabels: { podAoldBox: POD.going }, chips: { orderChip: ORDER.a2 }, lights: ['orderChip'] }),
      F.pulse({ pod: 'podAold', at: 'terminate' }),
      F.fade({ target: 'podAold', from: 1, to: 0, dur: FADE.out, at: 'terminate', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tapA2', from: 1, to: 0, dur: FADE.out, at: 'terminate', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'terminate', plus: FADE.out, chips: { servingChip: SERVING.aFresh }, wires: { capA: CAP.done }, lights: ['servingChip'] }),
    ],
  },
  {
    id: 'recreateTerminate',
    duration: 5000,
    narration: 'Recreate inverts the sequence. Its first order on an upgrade is Terminate, aimed at every existing Pod, which at .spec.replicas 1 means web-a1 alone and at any larger count means all of them. Pod web-a1 leaves, and the controller now waits: it creates nothing until the removal has succeeded, so the same handover window holds nobody, and that is real downtime.',
    chips: { strategyChip: 'Recreate', orderChip: ORDER.b1, servingChip: SERVING.bNone },
    wires: { capA: CAP.done, capB: CAP.nobody },
    sublabels: { podAnewBox: POD.ready, podAoldBox: POD.going, podBoldBox: POD.going, podBnewBox: POD.none },
    // The RollingUpdate track keeps its settled answer at full strength: both readings stand at
    // once, and the cue rather than the shade says which of the two this step is about.
    opacity: stage({ tiles: 1, aNew: 1, aOld: 0, bOld: 0, bNew: NR, gap: 1 }),
    // `strategyChip` is NOT lit at entry: its value is still the wound-back `RollingUpdate` until the
    // order leaves, and a cue standing before the change is a cue the change cannot use (P-05).
    lit: ['deployment'],
    // The field turns over on the beat the first order LEAVES under it, the Pod leaves the slot on
    // the arrival, and the void mark takes its place FADE.out later, once the removal has succeeded:
    // that gap is what the next step waits on. The tap and the low bus die with the Pod (A-14) and
    // are wound back so they stand for the whole flight (A-15).
    rewind: {
      opacity: { podBold: 1, gapMark: 0, busLLow: 1, tapB1: 1 },
      sublabels: { podBoldBox: POD.ready },
      chips: { strategyChip: 'RollingUpdate', orderChip: ORDER.a2, servingChip: SERVING.aFresh },
      wires: { capB: CAP.old },
    },
    flow: [
      F.set({ delay: BEAT.lead, chips: { strategyChip: 'Recreate' }, lights: ['strategyChip'] }),
      F.light({ targets: ['tileB1'], delay: BEAT.lead }),
      F.route({ points: LANE_B1, delay: BEAT.lead, name: 'terminate' }),
      F.set({ at: 'terminate', sublabels: { podBoldBox: POD.going }, chips: { orderChip: ORDER.b1 }, lights: ['orderChip'] }),
      F.pulse({ pod: 'podBold', at: 'terminate' }),
      F.fade({ target: 'podBold', from: 1, to: 0, dur: FADE.out, at: 'terminate', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tapB1', from: 1, to: 0, dur: FADE.out, at: 'terminate', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'busLLow', from: 1, to: 0, dur: FADE.out, at: 'terminate', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'gapMark', from: 0, to: 1, dur: FADE.in, at: 'terminate', plus: FADE.out, fill: 'both', easing: 'ease-out' }),
      F.set({ at: 'terminate', plus: FADE.out, chips: { servingChip: SERVING.bNone }, wires: { capB: CAP.nobody }, lights: ['servingChip'] }),
    ],
  },
  {
    id: 'recreateCreate',
    duration: 5400,
    narration: 'Only once web-a1 is gone does the second order go out, Create web-b2. The Pod appears on app v2.0 and starts, and the outage lasts until it reports Ready: the removal plus a cold start. What that buys is a clean cut, no moment at which two versions answer together, and the track ends as the other did, one Pod serving on v2.0.',
    chips: { strategyChip: 'Recreate', orderChip: ORDER.b2, servingChip: SERVING.bFresh },
    wires: { capA: CAP.done, capB: CAP.done },
    sublabels: { podAnewBox: POD.ready, podAoldBox: POD.going, podBoldBox: POD.going, podBnewBox: POD.ready },
    opacity: stage({ tiles: 1, aNew: 1, aOld: 0, bOld: 0, bNew: 1, gap: 0 }),
    lit: ['deployment'],
    // The create lands and the Pod rises as starting, with the void still standing beside it: a
    // starting Pod is not a serving one. FADE.out later it reports Ready, blinks, and the void goes
    // with the outage it drew. The right bus and its tap are already at 1 in the static block, so no
    // rewind is owed for the flight (A-15).
    rewind: {
      opacity: { podBnew: NR, gapMark: 1 },
      sublabels: { podBnewBox: POD.none },
      chips: { orderChip: ORDER.b1, servingChip: SERVING.bNone },
      wires: { capB: CAP.nobody },
    },
    flow: [
      F.light({ targets: ['tileB2'], delay: BEAT.lead }),
      F.route({ points: LANE_B2, delay: BEAT.lead, name: 'create' }),
      F.fade({ target: 'podBnew', from: NR, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.pulse({ pod: 'podBnew', at: 'create' }),
      F.set({ at: 'create', sublabels: { podBnewBox: POD.starting }, chips: { orderChip: ORDER.b2 }, wires: { capB: CAP.cold }, lights: ['orderChip'] }),
      F.pulse({ pod: 'podBnew', at: 'create', plus: FADE.out + BEAT.afterPulse, name: 'ready' }),
      F.fade({ target: 'gapMark', from: 1, to: 0, dur: FADE.out, at: 'ready', fill: 'both', easing: 'ease-in' }),
      F.set({ at: 'ready', sublabels: { podBnewBox: POD.ready }, chips: { servingChip: SERVING.bFresh }, wires: { capB: CAP.done }, lights: ['servingChip'] }),
    ],
  },
  {
    id: 'converged',
    duration: 4600,
    narration: 'Both tracks end in the same state, one Pod web-b2 Ready on app v2.0: on an update that completes the field changes the path and not the result. RollingUpdate spent the window with two Pods up and two versions live, Recreate spent it with nobody serving. Pick Recreate when the two versions must never run at once, which is what lets a ReadWriteOnce volume change Nodes, since it attaches to one Node at a time, and keep the default otherwise.',
    chips: { strategyChip: 'RollingUpdate or Recreate', orderChip: ORDER.both, servingChip: SERVING.both },
    wires: { capA: CAP.done, capB: CAP.done },
    sublabels: { podAnewBox: POD.ready, podAoldBox: POD.going, podBoldBox: POD.going, podBnewBox: POD.ready },
    opacity: stage({ tiles: 1, aNew: 1, aOld: 0, bOld: 0, bNew: 1, gap: 0 }),
    // No ball and no Pod event: the two surviving Pods carry the beat with `.highlight` alone
    // (M-27), and every chip states its summary at entry and is cued there, since nothing on this
    // step arrives to cue it later (P-05). A POD IS CUED WHOLE, shell and inner box together, the
    // way `pulsePod` blinks it: the shell alone leaves the app box flat inside a lit frame, and the
    // inner box alone lights a container while the Pod around it stays dark, which is what the
    // reader sees as the wrong object being pointed at.
    lit: ['podAnewShell', 'podAnewBox', 'podBnewShell', 'podBnewBox', 'strategyChip', 'orderChip', 'servingChip'],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
