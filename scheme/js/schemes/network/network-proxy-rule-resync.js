import { P, F, defineCard, ladder, strip, BEAT, FADE } from './network-kit.js';
import { g, rect, line, text } from '../../lib/svg.js';

// Design notes for this card: ./CARDS/network-proxy-rule-resync.md


// Nothing on this card is measured off the content edges any more: the two blocks take the chip
// strip walls and the instrument is pinned right of the panel, which is the L-shaped safe zone
// (L-01).

// Narration panel measured at right <= 396.55 and bottom 180.12..229.82 at 1100x800, deepest on the
// poster frame. The top band and the instrument start at x >= 420, so no panel depth reaches either,
// and the kernel, the one block left of 420, starts at 322 with 92 clear under the deepest bottom.
const TOP_Y = 40, TOP_H = 80, TOP_BOTTOM = TOP_Y + TOP_H;    // 40..120
// NET.L-01: an actor block is 232 unless a measured string says otherwise, and nothing here does.
// MEASURED at 1100x800, the widest reading: the label inks 139.9 and the sublabel 116.6, so 232
// leaves 46 a side. The box centres on the INSTRUMENT and not on the canvas, so the update it sends
// falls straight down instead of jogging across the gap.
const BOX_W = 232;

// The chip grid comes first because the two blocks hang off its edges: the instrument takes its
// right wall from the strip and the kernel takes its left, so the card lines up on one column pair.
const CHIP_H = 34, CHIP_GAP = 12, CHIP_VGAP = 8;
const CHIP_TOP = 548, CHIP_L = 60, CHIP_R = 1140;

// The instrument: one box whose BODY is a clock, pinned at x 420 so the panel can never occlude it.
// It is a DIAL and not a room: the clock spans 440..1104 of its 720. 234 deep is the FLOOR, set by
// the window bracket stack above the comb, and the record carries that arithmetic.
const LOOP_X = 420, LOOP_W = CHIP_R - LOOP_X;                // 420..1140, right wall on the chips
const LOOP_Y = 250, LOOP_H = 244;                            // 250..494
const LOOP_CX = LOOP_X + LOOP_W / 2;                         // 780
const LOOP_CY = LOOP_Y + LOOP_H / 2;                         // 372, the left face the write leaves
const SLICE_CX = LOOP_CX;                                    // 780
const SLICE_X = SLICE_CX - BOX_W / 2;                        // 664..896

// The kernel stands BESIDE the instrument, in the column the panel vacates, and its face midpoint is
// the instrument face midpoint, which is what makes the write lane one straight horizontal segment.
// A receiver carrying two short strings, so it takes a 232 block (NET.L-01), and the chip strip left
// edge rather than the content edge, so it shares a column wall with the readout under it.
const KERN_X = CHIP_L, KERN_W = BOX_W;                       // 60..292
const KERN_H = 80;
const KERN_CY = LOOP_CY;                                     // 372, both faces on one line
const KERN_Y = KERN_CY - KERN_H / 2;                         // 332..412
const KERN_R = KERN_X + KERN_W;                              // 292

// Inside the instrument. AXIS_Y is the clock line: changes stand above it, kernel writes below it,
// and both sides share one x, so a write sits under the change that caused it.
// 388 and not the box centre 372. Pinning the axis to the centre read well on the lane and printed
// the bracket caption on the SAME baseline as the box label, two titles on one row. 388 is the floor
// the top band sets: label 276, caption 296, bracket 310, comb 328.
const AXIS_Y = 388;
// The axis starts at 512, not at the box wall, because the two standing side captions live to its
// left and a caption over the comb would print through a hundred tick marks. 512 and not 560,
// because 560 keeps 77 units of clear where the rule needs far less: the captions ink 440..482.9 at
// 1100x800, so 512 still leaves 29 clear and gives the other 48 to the comb.
const AXIS_L = 512, AXIS_R = 1104;
// 5 bursts of 20 is 100 ticks, the two numbers the narration states and the only quantities drawn.
const BURSTS = 5, PER_BURST = 20;
const BURST_W = 88, BURST_GAP = 18;                          // 5*88 + 4*18 = 512, so 512..1024
const BURST_X = (i) => AXIS_L + i * (BURST_W + BURST_GAP);
const TICK_X = (i, j) => BURST_X(i) + j * (BURST_W / (PER_BURST - 1));
// Each burst is resynced at its own right edge, which is where its window closes.
const SYNC_X = (i) => BURST_X(i) + BURST_W;
const CHANGE_TOP = 328, SYNC_BOT = 450;                      // the two sides, 60 above and 62 below
// The clock beats: a short mark under the axis at every resync point, standing on every step. They
// are what the idle frame has to show, and a sparse write landing ON one is the aggregation.
const BEAT_BOT = AXIS_Y + 14;                                // 402
// The syncPeriod resync stands 52 right of the last burst, so the space above it is visibly empty.
const PERIOD_X = 1076;
const LAG_Y = 310;                                           // the window bracket, over the first burst
const LAG_CX = BURST_X(0) + BURST_W / 2;                     // 598, where its caption centres
// The two side captions, left of the axis and vertically centred on the band each one names.
const SIDE_X = 440, CHANGE_LABEL_Y = 361, WRITE_LABEL_Y = 423;

// Six chips as a three by two grid: this card is about state, and its state is two counters, two
// periods, what is watched and how far behind the kernel is. The strip pulls in off the content
// edges and closes its gaps, 60..1140 at 12 against 40..1160 at 20, so the three read as one row
// rather than three bars spanning the card. 352 is the FLOOR: `render/chipfit.test.mjs` fails the
// watch chip at 338.67 by 6, and the record carries that reading.
const CHIP_COL = strip({ from: CHIP_L, to: CHIP_R, count: 3, gap: CHIP_GAP });        // w 352
const CHIP_ROW = ladder({ y: CHIP_TOP, rowH: CHIP_H, gap: CHIP_VGAP });              // 548 / 590
const CHIP_X = (i) => CHIP_COL.x(i % 3);
const CHIP_Y = (i) => CHIP_ROW(Math.floor(i / 3));

// The watch update falls into the loop, the write leaves its bottom and turns left into the kernel.
// Both jog once in the gap between the blocks they join, and every endpoint is a face midpoint
// (L-11). WRITE runs 430 units against the old 216: the kernel moved out from under the instrument
// into the column beside it, so the write now crosses the card instead of dropping 26 units.
const WATCH = [[SLICE_CX, TOP_BOTTOM], [SLICE_CX, LOOP_Y]];
const WRITE = [[LOOP_X, LOOP_CY], [KERN_R, KERN_CY]];

// Presentation shades for the instrument, not lifecycle phases. Channel list is the network tint
// (79, 229, 255), copied because a presentation attribute cannot resolve a token.
const RULE = Object.freeze({
  axis:   'rgba(79, 229, 255, 0.55)',
  change: 'rgba(79, 229, 255, 0.42)',
  write:  'rgba(79, 229, 255, 0.75)',
  span:   'rgba(158, 234, 247, 0.70)',
});

const stroke = (el, colour, width) => {
  el.style.stroke = colour;
  el.style.strokeWidth = String(width);
  return el;
};

// Every change tick, in five bursts of twenty. One group, because the steps move all hundred of
// them together and a per-tick ref would be a computed key the spec reader cannot see.
function changeSide() {
  const grp = g({ class: 'rs-change' });
  for (let i = 0; i < BURSTS; i++) {
    for (let j = 0; j < PER_BURST; j++) {
      grp.appendChild(stroke(line({ x1: TICK_X(i, j), y1: AXIS_Y - 2, x2: TICK_X(i, j), y2: CHANGE_TOP }), RULE.change, 1.2));
    }
  }
  return grp;
}

// The write side at minSyncPeriod 0s: one kernel update under every single change.
function writeDense() {
  const grp = g({ class: 'rs-dense' });
  for (let i = 0; i < BURSTS; i++) {
    for (let j = 0; j < PER_BURST; j++) {
      grp.appendChild(stroke(line({ x1: TICK_X(i, j), y1: AXIS_Y + 2, x2: TICK_X(i, j), y2: SYNC_BOT }), RULE.write, 1.2));
    }
  }
  return grp;
}

// The write side at the default floor: one update per burst, five in all, drawn heavier because
// each one carries twenty endpoints.
function writeSparse() {
  const grp = g({ class: 'rs-sparse' });
  for (let i = 0; i < BURSTS; i++) {
    grp.appendChild(stroke(line({ x1: SYNC_X(i), y1: AXIS_Y + 2, x2: SYNC_X(i), y2: SYNC_BOT }), RULE.write, 3.4));
  }
  return grp;
}

// The window a change waits out: from the first change of the first burst to the resync that
// carries it, bracketed above the change side so it never crosses a tick.
function lagSpan() {
  const grp = g({ class: 'rs-lag' });
  grp.appendChild(stroke(line({ x1: BURST_X(0), y1: LAG_Y, x2: SYNC_X(0), y2: LAG_Y }), RULE.span, 1.6));
  grp.appendChild(stroke(line({ x1: BURST_X(0), y1: LAG_Y, x2: BURST_X(0), y2: LAG_Y + 12 }), RULE.span, 1.6));
  grp.appendChild(stroke(line({ x1: SYNC_X(0), y1: LAG_Y, x2: SYNC_X(0), y2: LAG_Y + 12 }), RULE.span, 1.6));
  return grp;
}

// The clock beats, always visible: five marks under the axis, one per resync point.
function axisBeats() {
  const grp = g({ class: 'rs-beats' });
  for (let i = 0; i < BURSTS; i++) {
    grp.appendChild(stroke(line({ x1: SYNC_X(i), y1: AXIS_Y, x2: SYNC_X(i), y2: BEAT_BOT }), RULE.axis, 1.4));
  }
  return grp;
}

// The syncPeriod resync: the one write on the card with no change standing above it.
function periodTick() {
  const grp = g({ class: 'rs-period' });
  const t = stroke(line({ x1: PERIOD_X, y1: AXIS_Y + 2, x2: PERIOD_X, y2: SYNC_BOT }), RULE.write, 3.4);
  t.style.strokeDasharray = '6 4';
  grp.appendChild(t);
  return grp;
}

// The instrument. A box because a lane has to land on its faces, a clock because that is the whole
// subject: no part kind emits an axis with ticks, hence the one raw on this card.
function syncLoop() {
  const grp = g({ class: 'scheme-box', 'data-role': 'network' });
  grp.appendChild(rect({ class: 'scheme-box-rect', x: LOOP_X, y: LOOP_Y, width: LOOP_W, height: LOOP_H, rx: 6 }));
  grp.appendChild(text({ class: 'scheme-box-label', x: LOOP_CX, y: LOOP_Y + 26, 'text-anchor': 'middle' }, ['kube-proxy sync loop']));
  grp.appendChild(stroke(line({ x1: AXIS_L, y1: AXIS_Y, x2: AXIS_R, y2: AXIS_Y }), RULE.axis, 1.6));
  grp.appendChild(axisBeats());
  grp.appendChild(changeSide());
  grp.appendChild(writeDense());
  grp.appendChild(writeSparse());
  grp.appendChild(lagSpan());
  grp.appendChild(periodTick());
  return grp;
}

// Z-order is the list order: the two relationships and the two lanes first, then the blocks, then
// the captions and chips, then the packet layer on top.
export const SCENE = {
  'aria-label': 'The kube-proxy sync loop drawn as a clock: an EndpointSlice update arrives when a Pod is deleted, one hundred endpoint changes stack up on the change side of the axis, and the write side below it shows one hundred separate kernel updates at minSyncPeriod 0s against about five updates of twenty endpoints each at the default 1s floor, with the window a single change waits bracketed over the first burst and a syncPeriod resync standing alone with no change above it',
  parts: [
    P.defs(),
    P.lane({ points: WATCH, dashed: true, dim: true }),
    P.lane({ points: WRITE, dashed: true, dim: true }),
    P.box({
      key: 'slice', x: SLICE_X, y: TOP_Y, w: BOX_W, h: TOP_H,
      label: 'EndpointSlice web-x9f2', sublabel: '100 endpoints ready',
    }),
    // One raw, one tune. The tune files five LITERAL ref keys so every step can move a side of the
    // clock by opacity: a computed key would be invisible to unit/spec-steps.test.mjs.
    P.raw({
      key: 'loop',
      make: () => syncLoop(),
      tune: (el, refs) => {
        refs.changeSide = el.querySelector('.rs-change');
        refs.writeDense = el.querySelector('.rs-dense');
        refs.writeSparse = el.querySelector('.rs-sparse');
        refs.lagSpan = el.querySelector('.rs-lag');
        refs.periodTick = el.querySelector('.rs-period');
      },
    }),
    P.box({
      key: 'kernel', x: KERN_X, y: KERN_Y, w: KERN_W, h: KERN_H,
      label: 'Node kernel', sublabel: 'iptables rules for Service web',
    }),
    // Standing captions, true on every step, so the picture says what each side of the axis is.
    P.tag({ x: SIDE_X, y: CHANGE_LABEL_Y, anchor: 'start', text: 'changes' }),
    P.tag({ x: SIDE_X, y: WRITE_LABEL_Y, anchor: 'start', text: 'resyncs' }),
    // -14 and +19 are measured clearances at 1100x800, not offsets: the lag caption inks 14 above
    // the bracket line it names, and the state line rides 19 under the write bars with the box wall
    // 13 under its own baseline.
    P.wire({ key: 'lag', x: LAG_CX, y: LAG_Y - 14 }),
    P.wire({ key: 'state', x: LOOP_CX, y: SYNC_BOT + 19 }),
    P.chip({ key: 'watchChip',  x: CHIP_X(0), y: CHIP_Y(0), w: CHIP_COL.w, h: CHIP_H, name: 'kube-proxy watches', value: 'none' }),
    P.chip({ key: 'changeChip', x: CHIP_X(1), y: CHIP_Y(1), w: CHIP_COL.w, h: CHIP_H, name: 'endpoint changes',   value: 'none' }),
    P.chip({ key: 'floorChip',  x: CHIP_X(2), y: CHIP_Y(2), w: CHIP_COL.w, h: CHIP_H, name: 'minSyncPeriod',      value: 'none' }),
    P.chip({ key: 'updateChip', x: CHIP_X(3), y: CHIP_Y(3), w: CHIP_COL.w, h: CHIP_H, name: 'kernel updates',     value: 'none' }),
    P.chip({ key: 'lagChip',    x: CHIP_X(4), y: CHIP_Y(4), w: CHIP_COL.w, h: CHIP_H, name: 'rules vs API server', value: 'none' }),
    P.chip({ key: 'periodChip', x: CHIP_X(5), y: CHIP_Y(5), w: CHIP_COL.w, h: CHIP_H, name: 'syncPeriod',         value: 'none' }),
    P.packets(),
  ],
  // No Pod on this card and therefore no inner box in `keys`: the deleted Pod reaches kube-proxy
  // only as a change to the slice, which is step 1 in words, and drawing it argued the opposite.
  reset: {
    keys: ['slice', 'loop', 'kernel',
      'watchChip', 'changeChip', 'floorChip', 'updateChip', 'lagChip', 'periodChip'],
    pods: [],
  },
};

// A-16: one factory owns the whole opacity field, so a side of the clock is never set in two places.
const clock = ({ change = 0, dense = 0, sparse = 0, lag = 0, period = 0 }) => ({
  changeSide: change, writeDense: dense, writeSparse: sparse,
  lagSpan: lag, periodTick: period,
});

// T-09: a chip value is body text and opens lowercase, which is why this reads `all` and not
// `Services, EndpointSlices`. The two kind names keep their capitals because they are API kinds.
const WATCHED = 'all Services, EndpointSlices';
const CLEANUP = 're-sync and cleanup';
const DEFAULT_FLOOR = '1s, the default';
// P-01: every step states every chip, so these are the six read as one row.
const chips = (change, floor, update, lag) => ({
  watchChip: WATCHED, changeChip: change, floorChip: floor,
  updateChip: update, lagChip: lag, periodChip: CLEANUP,
});

const FADE_IN = { keyframes: [{ opacity: 0 }, { opacity: 1 }], options: { duration: FADE.in, fill: 'forwards', easing: 'ease-out' } };
const FADE_OUT = { keyframes: [{ opacity: 1 }, { opacity: 0 }], options: { duration: FADE.out, fill: 'forwards', easing: 'ease-in' } };

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: chips('none yet', DEFAULT_FLOOR, 'none yet', 'in sync'),
    sublabels: { slice: '100 endpoints ready', kernel: 'iptables rules for Service web' },
    opacity: clock({}),
  },
  {
    id: 'watch',
    duration: 4200,
    narration: 'A Pod that dies reaches this loop only as one change to the EndpointSlice that listed its endpoint. The change rewrites nothing by itself: it marks the rules stale and asks for a resync, and the resync is what touches the kernel. How soon that resync runs is a question about the floor between them rather than about the change.',
    chips: chips('none yet', DEFAULT_FLOOR, 'none yet', 'in sync'),
    sublabels: { slice: '100 endpoints ready', kernel: 'iptables rules for Service web' },
    opacity: clock({}),
    // M-18a: the slice is the block that ACTS, so it is lit before its own ball leaves it.
    lit: ['slice', 'watchChip'],
    flow: [
      F.route({ points: WATCH, delay: BEAT.lead, lights: ['loop'] }),
    ],
  },
  {
    id: 'burst',
    duration: 3900,
    narration: 'Delete the Deployment behind this Service and all 100 of its Pods go. The slice loses 100 endpoints, so 100 separate changes reach kube-proxy inside a very short window, and every one of them on its own is a reason to rewrite the rules in the kernel.',
    chips: chips('100 in one window', DEFAULT_FLOOR, 'none yet', 'in sync'),
    sublabels: { slice: '0 endpoints ready', kernel: 'iptables rules for Service web' },
    opacity: clock({ change: 1 }),
    lit: ['slice'],
    // P-03: the count and the comb both WAIT for the update that carries them, so the static end
    // state has them standing and the animated path winds both back and lands them on the arrival.
    rewind: { opacity: { changeSide: 0 }, chips: { changeChip: 'none yet' } },
    flow: [
      F.route({ points: WATCH, delay: BEAT.lead, name: 'w', lights: ['loop'] }),
      F.tag({ text: '100 endpoints removed', points: WATCH, delay: BEAT.lead }),
      F.anim({ target: 'changeSide', ...FADE_IN, at: 'w' }),
      F.set({ at: 'w', chips: { changeChip: '100 in one window' } }),
      F.light({ targets: ['changeChip'], at: 'w' }),
    ],
  },
  {
    id: 'immediate',
    duration: 4000,
    narration: 'With minSyncPeriod set to 0s kube-proxy resyncs immediately on every Service or EndpointSlice change. Those 100 deletions come out as 100 separate updates, removing the endpoints from the rules one at a time. That is a great deal of redundant work whenever many things change in a small period.',
    chips: chips('100 in one window', '0s, no floor', '100, one per change', 'in sync'),
    sublabels: { slice: '0 endpoints ready', kernel: 'rewritten 100 times' },
    wires: { state: 'one update per change' },
    opacity: clock({ change: 1, dense: 1 }),
    // floorChip is the step PREMISE and stands lit from entry. updateChip is its RESULT and waits.
    lit: ['loop', 'floorChip'],
    rewind: { opacity: { writeDense: 0 }, chips: { updateChip: 'none yet' } },
    flow: [
      F.anim({ target: 'writeDense', ...FADE_IN, delay: 200 }),
      F.route({ points: WRITE, delay: BEAT.lead, name: 'p', lights: ['kernel'] }),
      F.set({ at: 'p', chips: { updateChip: '100, one per change' } }),
      F.light({ targets: ['updateChip'], at: 'p' }),
    ],
  },
  {
    id: 'batched',
    duration: 4800,
    narration: 'The floor is minSyncPeriod, and it is a floor rather than a delay: at the default 1s no resync starts sooner than a second after the last one, so the changes waiting behind it are aggregated. The same 100 deletions might come out as about 5 updates of 20 endpoints each, cheaper in CPU, and the full set of changes lands faster.',
    chips: chips('100 in one window', DEFAULT_FLOOR, 'about 5, 20 endpoints each', 'in sync'),
    sublabels: { slice: '0 endpoints ready', kernel: 'rewritten 5 times' },
    wires: { state: 'one update per burst' },
    opacity: clock({ change: 1, sparse: 1 }),
    lit: ['loop', 'floorChip'],
    rewind: { opacity: { writeDense: 1, writeSparse: 0 }, chips: { updateChip: '100, one per change' } },
    flow: [
      F.anim({ target: 'writeDense', ...FADE_OUT }),
      F.anim({ target: 'writeSparse', ...FADE_IN, delay: FADE.out }),
      F.route({ points: WRITE, delay: BEAT.lead + FADE.out, name: 'p', lights: ['kernel'] }),
      F.set({ at: 'p', chips: { updateChip: 'about 5, 20 endpoints each' } }),
      F.light({ targets: ['updateChip'], at: 'p' }),
    ],
  },
  {
    id: 'window',
    duration: 4000,
    narration: 'The floor is paid for in staleness. A change that arrives just after a resync waits for the next one, up to a full minSyncPeriod, and until then the rules still carry an endpoint the API server has already dropped. A larger floor aggregates more work and widens that window.',
    chips: chips('100 in one window', DEFAULT_FLOOR, 'about 5, 20 endpoints each', 'up to 1s behind'),
    sublabels: { slice: '0 endpoints ready', kernel: 'rewritten 5 times' },
    wires: { lag: 'up to minSyncPeriod', state: 'one update per burst' },
    opacity: clock({ change: 1, sparse: 1, lag: 1 }),
    lit: ['slice'],
    rewind: { opacity: { lagSpan: 0 }, chips: { lagChip: 'in sync' } },
    flow: [
      F.route({ points: WATCH, delay: BEAT.lead, name: 'w', lights: ['loop'] }),
      F.anim({ target: 'lagSpan', ...FADE_IN, at: 'w' }),
      F.set({ at: 'w', chips: { lagChip: 'up to 1s behind' } }),
      F.light({ targets: ['lagChip'], at: 'w' }),
    ],
  },
  {
    id: 'period',
    duration: 3500,
    narration: 'The other clock is syncPeriod, and it is not tied to any individual change. It drives the re-synchronizing and cleanup that runs whether or not anything moved, which is how kube-proxy notices that its rules have been changed by something other than itself.',
    // The change count does NOT move here: nothing new arrived, and the burst it names still happened.
    chips: chips('100 in one window', DEFAULT_FLOOR, 'about 5, 20 endpoints each', 'in sync'),
    sublabels: { slice: '0 endpoints ready', kernel: 'swept on syncPeriod' },
    wires: { state: 'a resync with nothing above it' },
    opacity: clock({ change: 1, sparse: 1, period: 1 }),
    lit: ['loop', 'periodChip'],
    rewind: { opacity: { periodTick: 0 }, chips: { lagChip: 'up to 1s behind' } },
    flow: [
      F.anim({ target: 'periodTick', ...FADE_IN, delay: 200 }),
      F.route({ points: WRITE, delay: BEAT.lead, name: 'p', lights: ['kernel'] }),
      F.set({ at: 'p', chips: { lagChip: 'in sync' } }),
      F.light({ targets: ['lagChip'], at: 'p' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
