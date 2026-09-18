import { P, F, defineCard, spread, WL, LAYOUT, BEAT, FADE, OPACITY } from './workloads-kit.js';

// Design notes for this card: ./CARDS/workloads-deployment-rollback.md

// TWO REGISTERS of one set, drawn one above the other so the reader can see they disagree: the
// ReplicaSets that EXIST, in creation order, and the list kubectl rollout history PRINTS, in
// revision order. The connectors between them are parallel until the rollback, and then they braid.
// Panel worst case measured on the `reuse` narration, the longest here at 323 characters.
const PANEL_B = 230;

// The owner, alone on the actor row. WL.L-07 needs the trunk to leave a face midpoint, so the box
// is centred on WL.SPINE_X. Its SUBLABEL carries the live .spec.template and turns over per step.
const DEP_W = 232, DEP_X = WL.CX - DEP_W / 2;            // 484..716, the family object width

// The delivery band: one rail under the owner and four taps down to the objects. Every write this
// card draws lands on a ReplicaSet, so the rail feeds the SHELF and never the register below it.
const RAIL_Y = PANEL_B + 42;                             // 272
const SLOT_N = 4;
const RS_W = 246, RS_Y = 330, RS_H = 72;                 // 330..402
// Fixed tile width, derived gap: spread, not strip. 60 / 338 / 616 / 894 on a gap of 32.
const SLOT = spread({ from: WL.L, to: WL.R, count: SLOT_N, w: RS_W });
const SLOT_CX = i => SLOT.x(i) + RS_W / 2;               // 183 / 461 / 739 / 1017

// The register: what `kubectl rollout history` prints, one narrow cell per live revision. A cell is
// centred on its SLOT centre, so while the two orders agree every connector is a plain vertical and
// the reader has nothing to follow. It is 150 against the object's 246 and 42 against its 72, which
// is what keeps a row of the list from reading as a second shelf.
const REG_W = 150, REG_Y = 528, REG_H = 42;              // 528..570
const REG_CX = i => SLOT_CX(i);                          // 183 / 461 / 739 / 1017
const REG_X = i => REG_CX(i) - REG_W / 2;                // 108 / 386 / 664 / 942
// The caption sits 12 above the register, in the gap between the two descents that reach the cells
// beside it: 68.4 clear each side while the orders agree, 50.4 and 86.4 after the braid.
const CAP_Y = REG_Y - 12;                                // 516

const TRUNK = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, RAIL_Y]];
const BUS = [[SLOT_CX(0), RAIL_Y], [SLOT_CX(3), RAIL_Y]];
const TAP = i => [[SLOT_CX(i), RAIL_Y], [SLOT_CX(i), RS_Y]];
// The same points feed the drawn lanes and the ball (A-02): a route is the trunk, the bus as far
// as this slot, and its tap, so no ball crosses canvas the card has not drawn.
const LANE = i => [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, RAIL_Y], [SLOT_CX(i), RAIL_Y], [SLOT_CX(i), RS_Y]];

// The one ASCENDING route on the card, and the only traffic that does not leave the owner: `undo`
// READS the template a ReplicaSet froze and patches it into the Deployment. It shares no corridor
// with the delivery grammar: it rises in the free band between the narration panel and the owner,
// and enters that box on its LEFT face midpoint, where nothing else on the card arrives. A-03 asks
// for a lane of its own and WL.LANE_DY is not enough of one here, which the record LANES block
// measures. Drawn on `undo` alone, or its head would point at the Deployment with nothing riding it.
const READ_X = 425;              // 28.5 clear of the widest panel, 59 of DEP_X, 175 of the trunk
const READ_CY = WL.TOP_Y + WL.BOX_H / 2;                 // 80, the owner's left face midpoint
const READ = [[READ_X, RS_Y], [READ_X, READ_CY], [DEP_X, READ_CY]];

// A connector joins a register CELL to the ReplicaSet carrying that revision annotation. It is a
// relation and never a lane: nothing travels it, reading a list is not traffic (A-06).

// A row under its own object is a PLAIN VERTICAL on the shared centre, the baseline the rollback
// later breaks. The three it leaves run sideways, and L-09 forbids a diagonal, so each is an elbow
// through `mid`. A CROSSING STEPS OFF CENTRE AT BOTH ENDS AND IN OPPOSITE DIRECTIONS: out to the
// LEFT of the object it leaves, in to the RIGHT of the row it reaches. That is the whole reason the
// two descents of a braided column never sit on one line, which the record LANES block proves is
// unreachable with both ends centred. The two numbers differ because the faces do, 246 against 150.
const DX_OUT = -24, DX_IN = 18;                          // 9.8% of an object, 12% of a cell
const CONN = [
  { cell: 0, slot: 0 },
  { cell: 1, slot: 1 },
  { cell: 2, slot: 2 },
  { cell: 3, slot: 3 },
  { cell: 1, slot: 2, mid: 462 },
  { cell: 2, slot: 3, mid: 486 },
  { cell: 3, slot: 1, mid: 438 },
];
const connKey = c => `k${c.cell + 1}${c.slot + 1}`;
const connPts = (c) => {
  const cross = c.mid !== undefined;
  const top = [SLOT_CX(c.slot) + (cross ? DX_OUT : 0), RS_Y + RS_H];
  const bot = [REG_CX(c.cell) + (cross ? DX_IN : 0), REG_Y];
  return cross ? [top, [top[0], c.mid], [bot[0], c.mid], bot] : [top, bot];
};

// Chips as a bottom strip, two across at 532 (WL.L-05). The card carries no ladder and no flanking
// column, so it reads LAYOUT.C for that width alone, the way finished-job-cleanup does.
const CHIP_W = LAYOUT.C.strip.two, CHIP_GAP = 16;
const CHIP_X = i => WL.L + i * (CHIP_W + CHIP_GAP);      // 60 / 608
const CHIP_Y = 590;                                      // 590..624

// The trunk and the bus CARRY every ball, so they are lanes and not relations, and a lane always
// takes the arrowhead pathArrow attaches. tune drops it: one head per run belongs on the tap.
const busPath = (key, points) => P.lane({
  key, points, dim: true, dashed: true, role: 'cluster',
  tune: (el) => el.removeAttribute('marker-end'),
});

// A ReplicaSet is NAMED by its pod-template-hash, which is what kubectl get rs prints and the whole
// reason a rollback can find it again. The revision number is nowhere on the object here: it lives
// in the register, because that is where it lives in the API too, as an annotation.
const BORN = [
  { name: 'web-7bd5', image: 'app:v1.0' },
  { name: 'web-5f2j', image: 'app:v1.4' },
  { name: 'web-6b8d', image: 'app:v2.0' },
  { name: 'web-9f2k', image: 'app:v3.0' },
];

// The one string that qualifies the limit, stated on the chip every step restates.
const LIMIT = '2 on this Deployment, 10 by default';
// The complete-state marker, which is what the cleanup on `prune` waits for and not Available.
const COMPLETE = 'Progressing=True · NewReplicaSetAvailable';

// Keys are POSITIONS and never revision numbers, because the numbers move and the positions do not:
// the object in slot 2 is annotated revision 5 by the time the card ends.
const slotKey = i => 'slot' + (i + 1);
const rsKey = i => 'rs' + (i + 1);
const regKey = i => 'reg' + (i + 1);
// cell:slot to connector key, so a history row states its own line rather than rebuilding the key.
const CONN_BY = Object.fromEntries(CONN.map(c => [c.cell + ':' + c.slot, connKey(c)]));

// Z-order: the lanes, the connectors, the wire labels and the chips first, then the packet layer,
// then the shelf and the owner above the ball.
export const SCENE = {
  // The label states the TWO orders and the crossing between them, because that is what the picture
  // draws and no other surface can say it. It also states the limit as 2 on this Deployment against
  // 10 by default, because no other surface can qualify the number.
  'aria-label': 'Deployment rollback and revision history, drawn as two registers of one set: a row of ReplicaSets named by their pod-template-hash in creation order, and under it the list kubectl rollout history prints in revision order, joined by one connector per live revision. A bad rollout adds revision 4, an undo to revision 2 copies that stored template back into the Deployment, and the matching ReplicaSet is reused and annotated revision 5 instead of a new one being created, so the connectors cross and the newest revision points at an object created long before it. The controller then deletes the oldest ReplicaSet to get back under revisionHistoryLimit, 2 on this Deployment and 10 by default, and revision 1 leaves the list with the object',
  parts: [
    P.defs(),
    busPath('trunk', TRUNK),
    busPath('bus', BUS),
    ...[0, 1, 2, 3].map(i => P.lane({ key: 'tap' + (i + 1), points: TAP(i), dim: true, dashed: true, role: 'cluster' })),
    // The read, drawn as ONE polyline rather than the three the delivery path takes: only `undo`
    // rides it, so its single arrowhead belongs where it ends, on the Deployment it patches.
    P.lane({ key: 'read', points: READ, dim: true, dashed: true, role: 'cluster' }),
    // Seven connectors drawn, three or four alive per step. Every one is a pairing the card actually
    // reaches, so none is decoration: the four vertical ones hold while the orders agree, and the
    // three slanted ones are what the rollback leaves behind.
    ...CONN.map(c => P.relation({ key: connKey(c), points: connPts(c), role: 'cluster' })),
    // The controller action the ball on this step IS, set off the trunk so it crosses no lane.
    P.wire({ key: 'act', x: WL.SPINE_X + 16, y: 208, anchor: 'start' }),
    // A deleted ReplicaSet needs a POSITIVE mark: at OPACITY.terminated the slot alone reads as
    // dim rather than as gone, and this wire is the only full-strength thing left under it.
    P.wire({ key: 'gone', x: REG_CX(0), y: REG_Y + REG_H / 2 + 4 }),
    P.chip({ key: 'limitChip', x: CHIP_X(0), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'revisionHistoryLimit', value: LIMIT }),
    P.chip({ key: 'condChip', x: CHIP_X(1), y: CHIP_Y, w: CHIP_W, h: WL.CHIP_H, name: 'condition', value: 'Available=True' }),
    P.packets(),
    // Everything below is appended AFTER the packet layer, so the ball runs under it.
    // The shelf axis, named for what it actually orders. `older` and `newer` are refused here: they
    // read as revision order, which is the one thing this row is not.
    P.tag({ x: SLOT.x(0) + 52, y: RAIL_Y + 4, text: 'created first' }),
    P.tag({ x: SLOT.x(3) + RS_W - 52, y: RAIL_Y + 4, text: 'created last' }),
    // The register names the command that prints it, so the bottom row is a thing a reader types
    // rather than a second shelf.
    P.tag({ x: WL.CX, y: CAP_Y, text: 'kubectl rollout history' }),
    ...BORN.map((b, i) => P.group({
      key: slotKey(i),
      parts: [P.box({ key: rsKey(i), x: SLOT.x(i), y: RS_Y, w: RS_W, h: RS_H, label: b.name, sublabel: 'replicas 0 · ' + b.image, role: 'cluster' })],
    })),
    ...[0, 1, 2, 3].map(i => P.box({ key: regKey(i), x: REG_X(i), y: REG_Y, w: REG_W, h: REG_H, label: 'Revision ' + (i + 1), role: 'cluster' })),
    P.box({ key: 'dep', x: DEP_X, y: WL.TOP_Y, w: DEP_W, h: WL.BOX_H, label: 'Deployment web', sublabel: 'template app:v2.0 · hash 6b8d', role: 'cluster' }),
  ],
  reset: {
    keys: ['dep', 'rs1', 'rs2', 'rs3', 'rs4', 'reg1', 'reg2', 'reg3', 'reg4', 'limitChip', 'condChip'],
    pods: [],
  },
};

// A tap and a connector stay at 1 while their object is merely idle, and follow it only BELOW
// `notready`, where the sink is gone rather than quiet (A-13, A-14). The record's LANES block
// carries the reading that forced the threshold.
const laneOp = op => (op < OPACITY.notready ? op : 1);

// ONE writer for the whole board, because the two registers and the connectors between them are a
// single fact per step and stating them apart is how they come to disagree. `slots` is what EXISTS,
// in creation order. `rows` is what the history PRINTS, in revision order, one entry per cell or
// null where the list is shorter than four. `read` is the one step that runs a ball UPWARD, and it
// goes through here for the same reason: an `opacity` field written beside the spread is eaten by it.
const board = (depTpl, slots, rows, read) => {
  const labels = {}, sublabels = { dep: depTpl }, opacity = { read: read ? 1 : 0 };
  slots.forEach((st, i) => {
    labels[rsKey(i)] = BORN[i].name;
    sublabels[rsKey(i)] = (st.sub || 'replicas ' + st.replicas) + ' · ' + BORN[i].image;
    opacity[slotKey(i)] = st.op;
    opacity['tap' + (i + 1)] = laneOp(st.op);
  });
  for (const c of CONN) opacity[connKey(c)] = 0;
  rows.forEach((row, i) => {
    opacity[regKey(i)] = row ? 1 : 0;
    if (!row) return;
    labels[regKey(i)] = 'Revision ' + row.rev;
    opacity[CONN_BY[i + ':' + row.slot]] = laneOp(slots[row.slot].op);
  });
  return { labels, sublabels, opacity };
};

// The states a ReplicaSet is ever in, so a step names a phase rather than a bare number.
const ABSENT = { op: 0, replicas: 0 };                   // not created yet
const KEPT = { op: OPACITY.notready, replicas: 0 };      // alive, scaled to zero, kept for rollback
// The rollback TARGET, on the one step where the Deployment carries its template and nothing has
// been scaled yet. It stands at FULL strength although it runs no Pod: a highlight on a dimmed
// block is two cues arguing, and this object plus the Deployment above it are the pair the step
// exists to have compared. What says it is not serving is `replicas 0` printed on it.
const SELECTED = { op: 1, replicas: 0 };
const SERVING = { op: 1, replicas: 3 };
const SURGED = { op: 1, replicas: 1 };                   // the one surge Pod the default dials allow
const STALLED = { op: OPACITY.notready, replicas: 1 };   // scaled up, never Ready, making no progress
// `sub` replaces the replica count outright: a deleted object has no count, and `replicas 0`
// beside it would say it is still one of the ReplicaSets the limit is counting.
const DELETED = { op: OPACITY.terminated, replicas: 0, sub: 'deleted' };
const ZEROED = { op: OPACITY.notready, replicas: 0 };

// The history, one entry per cell, ascending. `slot` is the POSITION of the object that carries the
// number, which is the whole subject: after the rollback they stop lining up.
const r = (rev, slot) => ({ rev, slot });
const HIST_BEFORE = [r(1, 0), r(2, 1), r(3, 2), null];
const HIST_ROLLED = [r(1, 0), r(2, 1), r(3, 2), r(4, 3)];
const HIST_AFTER = [r(1, 0), r(3, 2), r(4, 3), r(5, 1)];
const HIST_PRUNED = [null, r(3, 2), r(4, 3), r(5, 1)];

const TPL_V2 = 'template app:v2.0 · hash 6b8d';
const TPL_V3 = 'template app:v3.0 · hash 9f2k';
const TPL_V14 = 'template app:v1.4 · hash 5f2j';
// Stated twice on `prune`, in the static block and on the delete arrival, so it has one home.
const GONE = 'revision 1 unreachable';

export const STEPS_SPEC = [
  {
    id: 'idle',
    duration: 1500,
    chips: { limitChip: LIMIT, condChip: 'Available=True' },
    ...board(TPL_V2, [KEPT, KEPT, SERVING, ABSENT], HIST_BEFORE),
  },
  {
    id: 'roll',
    duration: 2800,
    narration: 'A revision is not a snapshot the Deployment keeps, it is one of these ReplicaSets. You run kubectl set image, the template hash changes, and no ReplicaSet carries that hash, so the controller creates one and annotates it revision 4. A fourth row joins rollout history, pointing at the object that carries the number.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=True' },
    wires: { act: 'create ReplicaSet · annotate revision 4' },
    ...board(TPL_V3, [KEPT, KEPT, SERVING, SURGED], HIST_ROLLED),
    lit: ['dep', 'condChip'],
    // The new ReplicaSet does not exist until the create lands, so its slot and its history row wind
    // back to absent and RISE on that arrival. Its tap is NOT wound back: it carries the ball.
    rewind: { opacity: { slot4: 0, reg4: 0, k44: 0 } },
    flow: [
      F.route({ points: LANE(3), name: 'create', lights: ['rs4', 'reg4'] }),
      // The row joins the list when the object exists, not when the write leaves.
      F.fade({ target: 'slot4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'reg4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k44', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'bad',
    duration: 2700,
    narration: 'Revision 4 is broken. Its ReplicaSet never reaches its Ready count, so the rollout makes no progress, and once progressDeadlineSeconds has elapsed the Deployment reports Progressing=False with the reason ProgressDeadlineExceeded. The ReplicaSet holding app:v2.0 is still the one serving.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=False · ProgressDeadlineExceeded' },
    ...board(TPL_V3, [KEPT, KEPT, SERVING, STALLED], HIST_ROLLED),
    // A highlight names an object AND the row that names it, because the pair is one fact. The one
    // still serving is called by its hash in the narration, so the cue and the sentence agree.
    lit: ['condChip', 'rs3', 'reg3'],
    // NOTHING travels here: no write leaves the Deployment, the deadline simply lapses. The static
    // block carries the stalled shade, so the animated path winds the slot back and dims it in place.
    // The tap and the connector do not fall with it: the ReplicaSet stalls, the lane into it and the
    // row that names it do not stop existing.
    rewind: { opacity: { slot4: 1 } },
    flow: [
      F.fade({ target: 'slot4', from: 1, to: OPACITY.notready, dur: FADE.out, delay: 600, fill: 'both', easing: 'ease-in' }),
    ],
  },
  {
    id: 'undo',
    duration: 3200,
    narration: 'Running kubectl rollout undo steps back one revision by default, and --to-revision names any revision still in the list. Here it takes revision 2, which copies the template that ReplicaSet froze back into .spec.template. Nothing is created or deleted, and the history has not moved yet.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=False · ProgressDeadlineExceeded' },
    wires: { act: 'rollout undo · patch .spec.template' },
    ...board(TPL_V14, [KEPT, SELECTED, SERVING, STALLED], HIST_ROLLED, true),
    // The OBJECT acts here and the Deployment receives, which is the one beat on this card that runs
    // that way round. It is lit at entry with the history row that names it, because --to-revision
    // names the number and because a ball may not leave a block that is dark (M-18a). The slot also
    // stands at full strength: the pair a reader compares is the frozen hash and the template above
    // it, and a highlight on a dimmed block is two cues arguing.
    lit: ['rs2', 'reg2'],
    // The template is app:v3.0 until the read lands, so the Deployment sublabel is wound back and
    // restated on the arrival. Written in the static block alone it would stand copied before the
    // ball that copies it leaves.
    rewind: { sublabels: { dep: TPL_V3 } },
    flow: [
      // BEAT.lead, the M-18 wait for a block that acts first. It also puts the flight under the
      // sentence that narrates it: the first clause is the command and the second is this ball.
      F.route({ points: READ, name: 'read', delay: BEAT.lead, lights: ['dep'] }),
      F.set({ at: 'read', sublabels: { dep: TPL_V14 } }),
    ],
  },
  {
    id: 'reuse',
    duration: 3600,
    narration: 'The restored hash matches a ReplicaSet already on the shelf, so no fifth one is made. The controller annotates that object revision 5, scales it up and the two newer ones to zero. Revision 2 leaves the list, revision 5 joins the end, and the connectors cross: the newest revision points at an object created long before it.',
    chips: { limitChip: LIMIT, condChip: 'Progressing=True' },
    wires: { act: 'scale writes · annotate revision 5' },
    ...board(TPL_V14, [KEPT, SERVING, ZEROED, ZEROED], HIST_AFTER),
    lit: ['dep', 'condChip'],
    // Every slot and the whole register wind back to what `undo` left, so the renumber LANDS rather
    // than standing done before its own ball leaves. No tap and no connector is wound back: all
    // three lanes carry a ball and a lane carrying a ball is visible for the whole flight (A-15).
    rewind: {
      // slot 2 is NOT wound back: `undo` already left it bright, and dropping it to a dim shade at
      // step entry only to raise it again 776ms later is a blink at the step boundary.
      opacity: {
        slot3: 1,
        k22: 1, k33: 1, k44: 1, k23: 0, k34: 0, k42: 0,
      },
      labels: { reg2: 'Revision 2', reg3: 'Revision 3', reg4: 'Revision 4' },
      sublabels: { rs2: 'replicas 0 · app:v1.4', rs3: 'replicas 3 · app:v2.0', rs4: 'replicas 1 · app:v3.0' },
    },
    flow: [
      // Three scale writes drawn as one act, because the rollback is one act on this card. They
      // are NOT one controller sync, which the CONTENT block rejects: see the ruling before editing.
      // EVERY arrival marks its receiver, dim or not: a ball landing on an unmarked block draws a
      // write with no target. The two that settle dim keep the mark, which is what `lights` does on
      // both paths, so the reduced state and the played state agree by construction.
      F.route({ points: LANE(1), name: 'up', lights: ['rs2', 'reg4'] }),
      // Each object is marked WITH ITS ROW, and the row is the one it carries AFTER the renumber
      // that lands on this same beat: web-6b8d is revision 3, which the re-sorted list puts in
      // cell 2, and web-9f2k is revision 4, now in cell 3.
      F.route({ points: LANE(2), name: 'zero3', lights: ['rs3', 'reg2'] }),
      F.route({ points: LANE(3), name: 'zero4', lights: ['rs4', 'reg3'] }),
      // THE RENUMBER IS ONE BEAT. The annotation write that makes the object revision 5 is the same
      // write that scales it up, so the whole register turns over on that one arrival and the three
      // connectors swap together. Split across the three arrivals it reads as the list shuffling.
      F.set({ at: 'up', sublabels: { rs2: 'replicas 3 · app:v1.4' }, labels: { reg2: 'Revision 3', reg3: 'Revision 4', reg4: 'Revision 5' } }),
      F.set({ at: 'zero3', sublabels: { rs3: 'replicas 0 · app:v2.0' } }),
      F.set({ at: 'zero4', sublabels: { rs4: 'replicas 0 · app:v3.0' } }),
      // What hands over is the SERVING count and not the shade: slot 2 already stands bright from
      // `undo`, and the exchange a reader watches is `replicas 0 -> replicas 3` against slot 3
      // falling the other way, both on the 776ms beat.
      F.fade({ target: 'slot3', from: 1, to: OPACITY.notready, dur: FADE.out, at: 'zero3', fill: 'both', easing: 'ease-in' }),
      // The three verticals go out and the three slants come in on the same beat as the renumber,
      // so the braid is one event and not a fade of six independent lines.
      F.fade({ target: 'k22', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k33', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k44', from: 1, to: 0, dur: FADE.out, at: 'up', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k23', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k34', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
      F.fade({ target: 'k42', from: 0, to: 1, dur: FADE.in, at: 'up', fill: 'both', easing: 'ease-out' }),
    ],
  },
  {
    id: 'prune',
    duration: 2800,
    narration: 'Three old ReplicaSets now sit at zero, one more than revisionHistoryLimit allows. It is 2 on this Deployment and 10 by default, and once the rollout completes the controller deletes the oldest. The object goes and its row leaves the list with it, so revision 1 can no longer be reached.',
    chips: { limitChip: LIMIT, condChip: COMPLETE },
    wires: { act: 'delete the oldest ReplicaSet', gone: GONE },
    ...board(TPL_V14, [DELETED, SERVING, ZEROED, ZEROED], HIST_PRUNED),
    lit: ['dep', 'limitChip', 'condChip'],
    // The object, its row, its connector, its tap and both marks of the delete wind back to the step
    // before, so nothing on screen calls it deleted until the ball that deletes it lands (A-14).
    rewind: {
      opacity: { slot1: OPACITY.notready, tap1: 1, reg1: 1, k11: 1 },
      sublabels: { rs1: 'replicas 0 · app:v1.0' },
      wires: { gone: '' },
    },
    flow: [
      // The delete marks its receiver the way every other arrival on this card does, and the mark
      // STAYS: the object is what the step is about, and 0.12 with no cue on it reads as a block
      // that quietly went away rather than one that was deleted.
      F.route({ points: LANE(0), name: 'del', lights: ['rs1'] }),
      F.set({ at: 'del', sublabels: { rs1: 'deleted · app:v1.0' }, wires: { gone: GONE } }),
      F.fade({ target: 'slot1', from: OPACITY.notready, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'tap1', from: 1, to: OPACITY.terminated, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      // The row and its connector go with the object, which is what `takes its revision with it`
      // means: a history entry is not a record the Deployment keeps, it is the object being there.
      F.fade({ target: 'reg1', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
      F.fade({ target: 'k11', from: 1, to: 0, dur: FADE.out, at: 'del', fill: 'both', easing: 'ease-in' }),
    ],
  },
];

export const init = defineCard(SCENE, STEPS_SPEC, { posterFirst: true });
