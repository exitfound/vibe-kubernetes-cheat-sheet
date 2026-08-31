// carried.mjs: the one home for a REPORT FINDING SOMEBODY HAS READ, RULED ON AND KEPT.
//
// The files under ../report/ print findings for a human to rule on and fail on nothing. Until this
// file existed they had no way to record that a row had been LOOKED AT, so the ruling was written
// into the card record instead, as a `NOT A DEFECT` block saying "report/arrival.test.mjs prints
// this card on R2-ENTRY and here is why that print is fine". A record is the wrong reader: the file
// that prints the row cannot open it, so the row came back unmarked on every review and was argued
// again from nothing. Five report files had already grown a private table of their own against
// exactly that (R2_STEP_CARRIED, E_CARRIED, A05_CARRIED, RIPPLE_CARRIED, CHIP_CARRIED). This file is
// those five tables plus the axes that had none, in one place and one shape.
//
// ===========================================================================================
// WHAT AN ENTRY IS, AND WHAT IT IS NOT
// ===========================================================================================
// An entry is a DECISION with a measurement behind it: a person opened the card, read the row the
// report printed, and decided the picture is right and the row stands. It is never a way to make a
// queue shorter. Three properties follow, and all three are enforced rather than asked for:
//
//   A REASON IS MANDATORY. `why` is prose, present tense, saying what IS true of the card (`S-48`).
//     An entry with no reason is refused by the shape check every consuming file runs.
//   A CARRIED ROW STAYS VISIBLE. The consuming file prints it, marked CARRIED and with the reason
//     attached, and counts it apart from the rows still to work. Nothing here hides anything: the
//     whole point is to say "this was ruled on", which is a louder statement than silence.
//   A SUPPRESSION THAT MATCHES NOTHING IS ITSELF A FINDING. A rule that stopped firing means the
//     card moved under the ruling, so the reason may now be false. Every consuming file computes
//     its own stale set and prints it, and the four axes that also have a gate assert on it.
//
// ===========================================================================================
// THE SHAPE
// ===========================================================================================
// One entry per FINDING, never per card:
//
//   { axis: 'R2-ENTRY', card: 'cluster-node-failure', where: ['5', 'Taint'], why: '...' }
//
// `axis` is the rule the finding belongs to, one of AXES below. `card` is a catalogued card id.
// `where` is whatever that axis needs to pin the exact row, and its shape is written down once per
// axis in AXES. The match key is `[card, ...where].join(' ')`, which is byte for byte the key the
// five private tables already used, so a consuming file compares a key it builds itself against a
// key this file builds and neither has to know the other exists.
//
// ===========================================================================================
// WHAT THIS FILE IS BLIND TO
// ===========================================================================================
//   - WHETHER A REASON IS TRUE. It is prose. Only its presence is machine-checkable, and a wrong
//     reason reads exactly like a right one. That is the same limit ../unit/chip-beat-e.test.mjs
//     records for the table it inherited.
//   - WHETHER A FINDING DESERVES CARRYING. Nothing here ranks. An axis with half its queue carried
//     looks the same as one with two entries, which is why every consuming file prints both counts.
//   - AN AXIS NO REPORT FILE CONSUMES. Adding a row to AXES does not make anything read it. The
//     `file` column names the reader, and an axis whose reader was deleted goes quiet, not red.
//
// ===========================================================================================
// PRINTING THE LIST ON DEMAND
// ===========================================================================================
// `node fixtures/carried.mjs` prints every entry grouped by axis, and `node fixtures/carried.mjs
// R2-ENTRY` prints one axis. Inside a report run, `CARRIED=1 npm run report` makes every consuming
// file print its WHOLE axis roster rather than only the entries that matched this walk, so an entry
// that has gone stale shows up beside the reason it still claims.
//
// IT IMPORTS NOTHING AT MODULE LEVEL, on purpose. Ten files read this store, four of them fixtures
// the mandatory gate pulls in, so a static import here lands in every one of their graphs. The one
// thing it needs, the catalog, is loaded inside the command-line block below and nowhere else.

// The axes an entry may belong to, and for each one the file that reads it and what `where` holds.
// `gate` names the mandatory test that ALSO reads this axis, where there is one: those four keys
// are load bearing beyond the report, because a key that cannot match is a finding the gate lets
// through. An axis with no `gate` is report-only and a bad key there only fails to suppress.
export const AXES = {
  'FRAME-FACE': {
    file: 'report/frame-face.test.mjs',
    where: '<lane ref key> <node frame ref key>',
    note: 'a lane from the actor row that crosses the Node frame face and ends on a Pod inside it',
  },
  'R2-ENTRY': {
    file: 'report/arrival.test.mjs',
    where: '<step index> <chip name as drawn>',
    note: 'a changed chip value with no .highlight, both frames read frozen at t=0',
  },
  'R2-STEP': {
    file: 'report/arrival.test.mjs',
    where: '<step index> <chip name as drawn>',
    note: 'the same rule off the SETTLED step, which is the reading the canon asks for',
  },
  R3: {
    file: 'report/arrival.test.mjs',
    where: '<step index> <block label, first 28 chars>',
    note: 'a block already lit when the step opens and receiving a packet in it',
  },
  'FORM-B': {
    file: 'report/chip-beat.test.mjs',
    where: '<step id> <chip ref key>',
    note: 'a chip whose value is on screen and lit before the ball that earns it lands',
  },
  'FORM-E': {
    file: 'fixtures/chip-beat.mjs',
    gate: 'unit/chip-beat-e.test.mjs',
    where: '<step id> <chip ref key>',
    note: 'FORM-B where another chip on the SAME step does wait for its beat',
  },
  CENTRE: {
    file: 'report/geometry-soft.test.mjs',
    where: '(nothing: one finding per card)',
    note: 'the pooled content bbox does not centre on x=600',
  },
  'CENTRE-LOW': {
    file: 'report/geometry-soft.test.mjs',
    where: '(nothing: one finding per card)',
    note: 'the blocks below the narration panel do not centre on x=600',
  },
  OCCLUDED: {
    file: 'report/geometry-soft.test.mjs',
    where: '<block label, first 28 chars>',
    note: 'a block sits substantially under the narration panel',
  },
  'A-05': {
    file: 'report/lane-traffic.test.mjs',
    gate: 'unit/lane-shared.test.mjs',
    where: '<lane points, JSON with no spaces>',
    note: 'a drawn lane with an arrowhead that nothing ever rides',
  },
  SIMULTANEOUS: {
    file: 'report/ripple-double.test.mjs',
    gate: 'unit/ripple-single.test.mjs',
    where: '<step id> <x>,<y>',
    note: 'two arrival rings starting on one point in the same millisecond',
  },
  'LIT-NOT-WRITTEN': {
    file: 'report/chip-unwritten.test.mjs',
    gate: 'unit/chip-written.test.mjs',
    where: '<chip ref key>',
    note: 'a chip a step points at and no step writes',
  },
};

// -------------------------------------------------------------------------------------------
// THE ENTRIES. Grouped by axis for reading, in one flat list so nothing can be filed twice.
// -------------------------------------------------------------------------------------------
const ENTRIES = [

  // ---------------------------------------------------------------------------------------
  // R2-ENTRY. Almost every entry below is ONE class, and the axis announces it in its own
  // header: it compares two frames frozen at t=0, so a value a card turns over MID-step is
  // first seen at the step AFTER it, where the cue has legitimately already been shown and
  // cleared. R2-STEP is the axis that answers the canon question, and none of these cards is
  // on its queue. Each entry still carries the card-specific half, which is where the cue
  // actually lands and what closing the row would cost.
  // ---------------------------------------------------------------------------------------
  { axis: 'R2-ENTRY', card: 'cluster-cpu-throttling', where: ['2', 'cpu.weight'],
    why: 'the axis samples both steps frozen at t=0, where `rewind` has rolled cpu.weight back and '
      + 'the `F.set` has not landed, so the turnover shows up one step late, at `quota`. R2-STEP, '
      + 'settled against settled, is the reading the rule asks for and this card is on neither of '
      + 'its lists. DO NOT close this row by lighting cpu.weight on `quota`, which points the eye '
      + 'at the one chip that step does not touch.' },

  { axis: 'R2-ENTRY', card: 'cluster-kubelet-reconcile-loop', where: ['2', 'Pod'],
    why: 'the tool artefact: the axis samples at t=0 and compares against t=0 of the previous step, '
      + 'so a mid-step turnover is attributed to the NEXT step, where the chip is not highlighted '
      + 'because that step is not about it. The three rows this card carries are all that shape.' },
  { axis: 'R2-ENTRY', card: 'cluster-kubelet-reconcile-loop', where: ['2', 'desired'],
    why: 'the same mid-step turnover as `2 Pod` on this card, read off the same frozen frame.' },
  { axis: 'R2-ENTRY', card: 'cluster-kubelet-reconcile-loop', where: ['3', 'last CRI op'],
    why: 'the same mid-step turnover as `2 Pod` on this card, one step further on.' },

  { axis: 'R2-ENTRY', card: 'cluster-leader-election', where: ['2', 'holderIdentity'],
    why: 'the artefact the axis documents in its own header: it compares two frames frozen at t=0, '
      + 'so a value turned over MID-step is first seen at the step AFTER it, where the cue has '
      + 'legitimately already been shown and cleared. `cluster-server-side-apply` carries the '
      + 'identical row for the identical idiom, and R2-STEP, the axis that answers the canon '
      + 'question, does not hold this card.' },

  { axis: 'R2-ENTRY', card: 'cluster-node-allocatable', where: ['2', 'status.capacity.memory'],
    why: 'the documented blind spot: a chip written on arrival through at() looks like it changed '
      + 'on the NEXT step, unlit. This change is cued where it happens, on `capacity`.' },
  { axis: 'R2-ENTRY', card: 'cluster-node-allocatable', where: ['5', 'status.allocatable.memory'],
    why: 'the same blind spot as `2 status.capacity.memory` on this card. The change is cued where '
      + 'it happens, on `allocatable`.' },

  { axis: 'R2-ENTRY', card: 'cluster-node-failure', where: ['5', 'Taint'],
    why: 'the rewind costs this row and the frozen sampling is why: wound back, the value first '
      + 'APPEARS at a t=0 reading on `evict`, where these two chips are not in `lit`. In real '
      + 'playback it appears at 2118ms on `taint-applied`, where they ARE lit. The sibling '
      + '`cluster-taints-tolerations` prints the identical pair on its own taint step for the '
      + 'identical construction. DO NOT close the row by dropping the rewind: that trades a frozen '
      + 'reading artefact for a real one, because the chips would then read their end value from '
      + 'the moment the step opens and the ball would land on a taint the picture already showed.' },
  { axis: 'R2-ENTRY', card: 'cluster-node-failure', where: ['5', 'Toleration'],
    why: 'the other half of the pair `5 Taint` on this card carries, wound back and turned over on '
      + 'the same arrival.' },

  // cluster-etcd-raft, two entries covering FOUR rows. Both Follower log chips are drawn `log/commit`,
  // and this axis keys on the chip NAME, so one key per step catches l2 and l3 together. Each reason
  // rules on both, and neither entry can be split further without changing the key shape.
  { axis: 'R2-ENTRY', card: 'cluster-etcd-raft', where: ['4', 'log/commit'],
    why: 'l2 and l3 both draw `log/commit`, so this one key holds the pair. The turnover is on '
      + '`replicate`, step 3, where each chip is written to `9 / 8` by an F.set bound to its own '
      + 'AppendEntries arrival, MEASURED at 700ms on l2 (the 60 unit E1 to E2 segment, floor-clamped) '
      + 'and 1564ms on l3 (the 704 unit arc). Both chips are in that step `lit` list, so the cue is '
      + 'on screen there from 0ms and the reader sees the value land under it. This axis reads both '
      + 'of its samples frozen at t=0, so it never sees either turnover and attributes the change to '
      + '`quorum`, step 4, where the two chips are correctly not lit because that step is about the '
      + 'Leader advancing its own commit index. R2-STEP, settled against settled and the reading the '
      + 'canon actually asks for, holds this card on neither its queue nor its carried list, before '
      + 'or after the `apply` repair. DO NOT close this by lighting l2 and l3 on `quorum`, which '
      + 'points the eye at the two chips that step does not touch.' },
  { axis: 'R2-ENTRY', card: 'cluster-etcd-raft', where: ['6', 'log/commit'],
    why: 'the same pair one step on, and the same key for the same reason: the turnover is on '
      + '`apply`, step 5, where each chip is written to `9 / 9` by an F.set bound to its own '
      + 'heartbeat arrival, MEASURED at 700ms on l2 and 1564ms on l3 over the same two lanes '
      + '`replicate` uses, with both chips in that step `lit` list. Frozen at t=0 the change is first '
      + 'seen on `quorum-lost`, step 6, where they are not lit because that step is about the Leader '
      + 'losing quorum. THIS ROW IS THE PRICE OF A REAL FIX AND THE TRADE IS THE RIGHT WAY ROUND: '
      + 'before that `rewind` and its two F.set, `apply` stood on the FORM-B queue of '
      + 'report/chip-beat.test.mjs with both chips reading `9 / 9` and lit from step entry while the '
      + 'packets carrying the commit index were still 700ms and 1564ms out, so the picture answered '
      + 'before the ball arrived. `cluster-node-failure 5 Taint` above rules the identical trade on '
      + 'the identical construction: dropping a rewind to clear a row here swaps a frozen-sample '
      + 'artefact for a defect a viewer can actually see. R2-STEP holds this card on neither list.' },

  { axis: 'R2-ENTRY', card: 'cluster-resource-quota', where: ['5', 'last admission'],
    why: 'on the `quota` step the cue is on screen before the value it announces: `lit` puts '
      + '.highlight on the two chips at entry while `rewind` has just set them back to what the '
      + 'previous step left, so `last admission` reads the old string under a highlight until '
      + '2000ms and the frozen sample first sees the new one on `persist`. That is the shape `P-03` '
      + 'asks for (pin the end value, wind it back, turn it over on the ball) meeting a cue with no '
      + 'beat of its own: an `F.set` can carry `lit`, but `flowLights` derives only a `lights` '
      + 'list, so a deferred cue would light nothing on the reduced, prev and reset paths.' },

  { axis: 'R2-ENTRY', card: 'cluster-server-side-apply', where: ['2', 'last apply'],
    why: 'the documented blind spot: the axis samples chips at t=0 and compares against t=0 of the '
      + 'PREVIOUS step, so a chip rolled back below the guard and turned over through at() looks '
      + 'like an uncued change on the NEXT step. All five rows this card carries are that shape and '
      + 'every one IS cued, on the step where it happens. DO NOT fix them by lighting a chip on a '
      + 'step where nothing happens.' },
  { axis: 'R2-ENTRY', card: 'cluster-server-side-apply', where: ['4', 'metadata.managedFields'],
    why: 'the same rolled-back-and-turned-over idiom as `2 last apply` on this card.' },
  { axis: 'R2-ENTRY', card: 'cluster-server-side-apply', where: ['6', 'last apply'],
    why: 'the same rolled-back-and-turned-over idiom as `2 last apply` on this card, on the '
      + '`versus-merge` coda.' },
  { axis: 'R2-ENTRY', card: 'cluster-server-side-apply', where: ['6', 'metadata.managedFields'],
    why: 'the same idiom as `2 last apply`, the second of the three chips the coda restates.' },
  { axis: 'R2-ENTRY', card: 'cluster-server-side-apply', where: ['6', 'last conflict'],
    why: 'the same idiom as `2 last apply`, the third of the three chips the coda restates.' },

  { axis: 'R2-ENTRY', card: 'cluster-static-pods', where: ['3', 'static Pod'],
    why: '`static Pod` is written on arrival on `kubelet-starts` and on `edit-file`, the two steps '
      + 'that carry its highlight, so a frozen sample first sees each change on the step after it. '
      + 'DO NOT light the chip on `mirror`, where nothing happens to the container.' },
  { axis: 'R2-ENTRY', card: 'cluster-static-pods', where: ['6', 'static Pod'],
    why: 'the second half of the pair `3 static Pod` carries: the value written on arrival during '
      + '`edit-file` is first seen frozen on `drain`. DO NOT light the chip on `drain`, where '
      + 'nothing happens to the container.' },

  { axis: 'R2-ENTRY', card: 'workloads-env-before-pid-1', where: ['4', 'DB_HOST'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },
  { axis: 'R2-ENTRY', card: 'workloads-env-before-pid-1', where: ['4', 'MY_POD_IP'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },
  { axis: 'R2-ENTRY', card: 'workloads-env-before-pid-1', where: ['4', 'WEB_SERVICE_HOST'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },
  { axis: 'R2-STEP', card: 'workloads-env-before-pid-1', where: ['4', 'DB_HOST'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },
  { axis: 'R2-STEP', card: 'workloads-env-before-pid-1', where: ['4', 'MY_POD_IP'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },
  { axis: 'R2-STEP', card: 'workloads-env-before-pid-1', where: ['4', 'WEB_SERVICE_HOST'],
    why: 'the three variables are ONE set and the card draws them as one: they sit in a `P.group` '
      + 'whose opacity lifts from OPACITY.notready to 1 on the arrival of the single ball that '
      + 'crosses the CreateContainer line, so the change is cued and the cue is the whole strip '
      + 'lifting at once. A per-chip .highlight would say three things arrived separately, which '
      + 'is the opposite of the mechanism the step narrates, and P-09 binds workloads to `chips` '
      + 'rather than `chipsCued`.' },

  { axis: 'R2-STEP', card: 'workloads-pod-pending-init-states', where: ['2', 'AGE'],
    why: 'AGE is a CLOCK, not an event. It moves on every step because time passes, which is the '
      + 'one thing this card needs it for: the jump from 50s to 4m10s is what separates a normal '
      + 'Init:0/2 from a stalled one. It is lit on step 3 alone, the only step whose narration is '
      + 'about it. Lighting it on 2, 4 and 5 as well would put a highlight on four of the five '
      + 'steps and say AGE is what changed, when what changed is STATUS and the component holding '
      + 'the Pod. The other route, freezing the value so it only ever changes where it is cued, '
      + 'was considered and refused: it draws a stopped clock across three steps in which the Pod '
      + 'visibly progresses, which is a worse picture bought with a greener report.' },
  { axis: 'R2-STEP', card: 'workloads-pod-pending-init-states', where: ['4', 'AGE'],
    why: 'same clock' },
  { axis: 'R2-STEP', card: 'workloads-pod-pending-init-states', where: ['5', 'AGE'],
    why: 'same clock' },

  { axis: 'R2-ENTRY', card: 'workloads-pod-pending-init-states', where: ['2', 'AGE'],
    why: 'the same clock the R2-STEP row above rules on, read at the frozen sample. AGE ticks '
      + 'because time passes and it is lit on step 3 alone, the one step whose narration is about '
      + 'it. DO NOT close this by lighting AGE on 2, 4 and 5, which puts a cue on four of the five '
      + 'steps and points the eye at the one cell those steps are not about.' },
  { axis: 'R2-ENTRY', card: 'workloads-pod-pending-init-states', where: ['4', 'AGE'],
    why: 'same clock' },
  { axis: 'R2-ENTRY', card: 'workloads-pod-pending-init-states', where: ['5', 'AGE'],
    why: 'same clock' },

  // ---------------------------------------------------------------------------------------
  // R3. One entry. A block that receives a ball must be dark when the step opens, and the
  // exemption the rule already grants (a block that ACTS FIRST) does not reach a block lit
  // for three steps running.
  // ---------------------------------------------------------------------------------------
  { axis: 'R3', card: 'cluster-scheduler-decision', where: ['5', 'Node-4'],
    why: 'Node-4 is lit on `score`, on `bind` and on `placed`, and dropping it for the 1500ms of '
      + 'the two hops reads as the winner being un-chosen. The arrival still has a receiver: the '
      + 'Kubelet lights on its own hop.' },

  // ---------------------------------------------------------------------------------------
  // FORM-B. The queue is hundreds of rows deep and ranked by lead, so an entry here says the
  // ranking put a row high and a person read it and kept it.
  // ---------------------------------------------------------------------------------------
  { axis: 'FORM-B', card: 'cluster-cpu-throttling', where: ['observe', 'statChip'],
    why: 'the cpu.stat chip reads 100 of 100 and is lit before the ball lands, and the value is '
      + 'TRUE before the scrape, which is the payoff the step exists for: cAdvisor reads a kernel '
      + 'counter that climbed while nobody was looking, so binding the chip to the arrival would '
      + 'say the reading created the number. Its lead sits in the mildest band this queue has, '
      + 'which the lead-band block above counts live.' },
  { axis: 'FORM-B', card: 'cluster-etcd-raft', where: ['quorum', 'l1'],
    why: 'the one ball of this step leaves the Leader rather than reaching it. It rides E1_TO_API, '
      + '180 units from the Leader left face at x 440 to the API right edge at x 260, floor-clamped '
      + 'to 700ms, and it DEPARTS at BEAT.lead 800ms, which is 800ms AFTER this chip turns over. '
      + 'The 1500ms the queue ranks is the arrival at the far end of that outbound route, so the '
      + 'chip leads the departure it causes rather than trailing an arrival that earns it. What '
      + 'earns commitIndex 9 is the two acks, and the card draws both of them on beats one step '
      + 'earlier, at 1500ms and 3068ms on replicate. Binding l1 to 1500ms here would say the API '
      + 'receiving the report is what advanced the Leader commit index, which reverses the '
      + 'narration: a majority persisted, THEREFORE the entry commits and a durable report goes '
      + 'out. The receiver of that ball is the API box, and it does wait, lighting at 1500ms.' },
  { axis: 'FORM-B', card: 'cluster-etcd-raft', where: ['quorum', 'quorumChip'],
    why: 'the other half of the pair `quorum l1` carries, on the same outbound ball and the same '
      + 'measured beat: chips at 0ms, departure at BEAT.lead 800ms, arrival at the API at 1500ms. '
      + 'The verdict `2 of 3 ✓ at ack 1` is read off the acks counter beside it, which the previous '
      + 'step stepped up on each ack arrival, so this chip states the threshold that has already '
      + 'been crossed and is the precondition of the report leaving. Cueing l1 on the departure and '
      + 'this one on the arrival, or the reverse, is the split P-04 calls worse than doing '
      + 'neither: the two are one verdict read together.' },

  // ---------------------------------------------------------------------------------------
  // FORM-E. Nineteen entries, nineteen findings, nothing unread: that is the state that let
  // FORM-E out of the report and into `npm test`, and each one is the measurement that put a
  // finding here. ../unit/chip-beat-e.test.mjs asserts on this set, so an entry that stops
  // matching turns the GATE red rather than printing a note.
  // ---------------------------------------------------------------------------------------
  { axis: 'FORM-E', card: 'cluster-pod-priority-preemption', where: ['delete', 'focusChip'],
    why: '`standard DELETE · PDB best effort` names what this step DOES, and it is true the moment '
      + 'the Scheduler forms the request: no arrival on this step produces it. Its two neighbours '
      + 'wait for a beat because both are Pod-object state the DELETE produces, nominatedNodeName '
      + 'at the API and Terminating on the Node. The focus chip is NOT uniformly at entry on this '
      + 'card, and the split is the point: on the bind step it IS deferred, because '
      + '`nominatedNodeName cleared` is an outcome the API writes when the binding lands rather '
      + 'than a name for the step. Binding this one to an arrival would leave the delete step '
      + 'nameless for its first 700ms.' },
  { axis: 'FORM-E', card: 'cluster-pod-priority-preemption', where: ['bind', 'victimChip'],
    why: 'Pod A left during the terminationGracePeriodSeconds the PREVIOUS step narrates, so `Pod A '
      + '· gone` is true when this step opens and the `pod1: 0` opacity pin beside it draws the '
      + 'same fact. No ball of this step produces it: the bind travels to Node-1 and places Pod '
      + 'NEW. Its two neighbours wait because the API writes both on the binding itself. Winding '
      + 'this one back would redraw a Pod the card has already said exited.' },
  { axis: 'FORM-E', card: 'cluster-node-pressure-eviction', where: ['relieve', 'memChip'],
    why: 'memory.available is a cAdvisor reading of the Node, and the one ball of this step is the '
      + 'PATCH carrying MemoryPressure=False to the API, which does not produce it: the memory '
      + 'freed first and is WHY the PATCH goes out. The card says so itself on step 1, where the '
      + 'same chip drops 4Gi to 500Mi at entry over a flow that is empty. Binding it to that '
      + 'arrival would claim a local stat moves when the API is told.' },
  { axis: 'FORM-E', card: 'cluster-oom-kill', where: ['observe', 'memChip'],
    why: 'memory.current is a cgroup file the kernel emptied when it SIGKILLed the processes one '
      + 'step earlier, and the ball of this step runs the OTHER way, PLEG relist from the kernel to '
      + 'Kubelet. The rewind next door is right for terminationChip because that is what the '
      + 'Kubelet KNOWS, and wrong here for the same reason: it would say memory frees when the '
      + 'Kubelet is told. Entry is the earliest honest beat this step has.' },
  { axis: 'FORM-E', card: 'cluster-leader-election', where: ['renew', 'v1'],
    why: 'The role suffix reports what mgr-1 is DOING, and the reconciling is what SENDS the first '
      + 'ball of the step, the CAS-PUT carrying a fresh renewTime. It is on screen before anything '
      + 'departs rather than after anything lands, the same shape as `cluster-static-pods '
      + 'edit-file fileChip`. What the arrival earns is renewChip, which is the Lease RECORD and '
      + 'moves when the write lands, and that is the one chip this step holds back.' },
  { axis: 'FORM-E', card: 'cluster-leader-election', where: ['renew', 'v2'],
    why: 'See `renew v1`: polling is what sends the standby GET, so the suffix stands before the '
      + 'ball leaves. Binding it to the answer would say a standby starts polling because its own '
      + 'poll came back.' },
  { axis: 'FORM-E', card: 'cluster-leader-election', where: ['renew', 'v3'],
    why: 'See `renew v2`: the second standby runs the identical poll and its chip moves with it, or '
      + 'P-04 splits one fact across two chips.' },
  { axis: 'FORM-E', card: 'cluster-static-pods', where: ['edit-file', 'fileChip'],
    why: 'fileChip is the manifest file on disk, and the file is the SOURCE of the first ball here, '
      + 'the spec segment running from fileBox to the Kubelet. The edit therefore has to be on '
      + 'screen before the ball leaves, not after it lands. Step 1 is the same shape and reads '
      + 'correctly: the chip takes the new filename at entry and the segment leaves REVEAL_MS '
      + 'later.' },
  { axis: 'FORM-E', card: 'cluster-taints-tolerations', where: ['prefer', 'taintsChip'],
    why: 'The rewrite of spec.taints is the PREMISE of the step and its opening sentence, true '
      + 'before the Scheduler forms the binding this step sends: no arrival here produces it, and '
      + 'the ball that does arrive carries Pod web-2 to Node-1. The frame header spells the same '
      + 'taint at entry on the same beat, so binding the chip alone would leave it reading '
      + 'NoSchedule under a header already reading PreferNoSchedule. Step 1 is the same shape and '
      + 'is read the same way, both taint chips light at entry there. What the arrival earns is '
      + 'web2Chip, the chip this step defers.' },
  { axis: 'FORM-E', card: 'cluster-taints-tolerations', where: ['prefer', 'effectChip'],
    why: 'See `prefer taintsChip`: effect in force reports that same rewrite one field narrower, '
      + 'and the two move together or P-04 splits one fact across two chips.' },
  { axis: 'FORM-E', card: 'cluster-taints-tolerations', where: ['noexecute', 'taintsChip'],
    why: 'The second taint is what SENDS the first ball of the step, the DELETE the '
      + 'taint-eviction-controller issues, so it is on screen before anything departs rather than '
      + 'after anything lands. Binding it to that arrival would say the taint appears because the '
      + 'controller acted. web2Chip is what the arrival earns and it is the one chip this step '
      + 'holds back.' },
  { axis: 'FORM-E', card: 'cluster-taints-tolerations', where: ['noexecute', 'effectChip'],
    why: 'See `noexecute taintsChip`: effect in force reports the same added taint and moves with '
      + 'it.' },
  { axis: 'FORM-E', card: 'network-dns-records', where: ['a-record', 'qChip'],
    why: 'qChip is the QUESTION, which the client holds before it sends anything, so it is the '
      + 'premise of the step and not a value an arrival produces. The card already says the name a '
      + 'second time at entry: `asking()` writes the four FQDN segment boxes and LIGHTS them in the '
      + 'static block, so binding the chip alone would leave it blank while the band beside it '
      + 'spells the same name.' },
  { axis: 'FORM-E', card: 'network-dns-records', where: ['srv-record', 'qChip'],
    why: 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.' },
  { axis: 'FORM-E', card: 'network-dns-records', where: ['headless-record', 'qChip'],
    why: 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.' },
  { axis: 'FORM-E', card: 'network-dns-records', where: ['pod-record', 'qChip'],
    why: 'See `a-record qChip`: the question is the premise, and the FQDN band states it at entry.' },
  { axis: 'FORM-E', card: 'network-internal-traffic-policy', where: ['local', 'policyChip'],
    why: 'internalTrafficPolicy is a FIELD OF THE SERVICE that the operator set before anything is '
      + 'dialed, and the card record says so in as many words: the policy is a property of the '
      + 'Service, so it is true from the start, while the scope, the hop and the result are '
      + 'outcomes of a call. Those three are exactly what this step now waits on, at kube-proxy '
      + '(1500) and at the local Pod (2300). The rest of the entry frame is written from the same '
      + 'premise: the two endpoint notes read in scope and out of scope and the remote Pod is '
      + 'already dimmed, so binding the chip alone would leave it reading Cluster over a picture '
      + 'that is already the Local one.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['place', 'focusChip'],
    why: 'focusChip is named `focus` and every one of the five steps writes it as a caption of what '
      + 'that step is about, not as object state. Here it states the controller RULE the narration '
      + 'states in words, one Pod per matching Node, which is true before any create is issued. '
      + 'What the three creates actually earn is currentChip and readyChip, and those are exactly '
      + 'the two the step already steps up one arrival at a time.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['node-join', 'focusChip'],
    why: 'The same argument as `place focusChip` above, on the same card: `focus` is the caption of '
      + 'what the step is about and not object state. Node-4 joining is the PREMISE of the step, on '
      + 'screen before anything is watched or created, and what the arrivals earn is the three '
      + 'counters, which this step now steps up on the watch and on the create.' },

  // ---------------------------------------------------------------------------------------
  // R2-STEP. All seven are ONE class: the chip TEXT changed while the FACT it reports did not,
  // so a cue would announce a change that did not happen. Anything outside this set is work.
  // ---------------------------------------------------------------------------------------
  { axis: 'R2-STEP', card: 'cluster-list-watch-informers', where: ['6', 'resourceVersion'],
    why: 'the 410 aside is over and the three chips go BACK to the steady state step 4 left (843, '
      + 'open streaming, 4). A cue would say they moved on' },
  { axis: 'R2-STEP', card: 'cluster-list-watch-informers', where: ['6', 'watch'],
    why: 'same restoration' },
  { axis: 'R2-STEP', card: 'cluster-list-watch-informers', where: ['6', 'cache size'],
    why: 'same restoration' },
  { axis: 'R2-STEP', card: 'cluster-static-pods', where: ['5', 'mirror Pod'],
    why: 'the mirror was deleted and recreated INSIDE the previous step (present, gone, back), so '
      + 'this reading is the steady name returning. The news of this step is the Pod restarting, '
      + 'and that chip is lit' },
  { axis: 'R2-STEP', card: 'cluster-oom-kill', where: ['3', 'container state'],
    why: 'containerStatuses[].state is STILL Running: the suffix `not yet observed` explains an '
      + 'unchanged fact, and the turnover the reader must catch is on the observe step, where the '
      + 'chip IS lit' },
  { axis: 'R2-STEP', card: 'network-client-ip-preservation', where: ['5', 'X-Forwarded-For'],
    why: 'raw TCP carries no headers, so the header panel empties because this mode has none. The '
      + 'news is the mode, the reader and the recovered address, all three lit' },
  { axis: 'R2-STEP', card: 'network-client-ip-preservation', where: ['5', 'Forwarded'],
    why: 'same, the other header of the pair' },

  // ---------------------------------------------------------------------------------------
  // CENTRE, CENTRE-LOW and OCCLUDED. These are the `L-16` population: the rule can only be
  // satisfied by making the picture worse, and each entry carries the measurement that says
  // so. They stay printed, because a soft geometry finding that goes quiet is exactly how a
  // real regression on the same card would look.
  // ---------------------------------------------------------------------------------------
  { axis: 'CENTRE', card: 'cluster-cascading-deletion', where: [],
    why: 'the identical two numbers `cluster-object-create-path` reports for the identical reason, '
      + 'because the two cards share one grid: the client hangs off the right of a composition '
      + 'centred on the frames. Re-centring drags the frames off 600, which is what keeps the Node '
      + 'pair two straight verticals. The finding also stands against an OCCLUDED one that would '
      + 'score the kubectl block 100% under the panel, and the trade is the point: a composition '
      + 'leaning 70 units off centre costs a reader less than an actor block the panel deletes on '
      + 'six steps of eight.' },
  { axis: 'CENTRE-LOW', card: 'cluster-cascading-deletion', where: [],
    why: 'the same lean as the CENTRE row on this card, with the frame walls left out. CENTRE-LOW '
      + 'judges against the panel bottom of ONE viewport, 177 at 1600x1000, and the blind-spot '
      + 'block below says so itself: at the worst-of-three bottom, 255, the finding drops.' },
  { axis: 'CENTRE', card: 'cluster-object-create-path', where: [],
    why: 'the client hanging off the right of a composition centred on the frames. DO NOT close it '
      + 'by re-centring: that drags the frames off 600, which is what keeps the Node lane one '
      + 'straight segment. Widening the client to the 220 the API carries is the other route and it '
      + 'is refused on measurement: the band outside the wall is 150 units, the viewBox width '
      + 'available is 1200 at 1280x860 and below, and +90 shrinks the whole card by 7% there.' },
  { axis: 'CENTRE-LOW', card: 'cluster-object-create-path', where: [],
    why: 'the same complaint as the CENTRE row on this card with the frame walls left out. '
      + 'CENTRE-LOW judges against the panel bottom of ONE viewport, 143 at 1600x1000, and the '
      + 'blind-spot block below says so itself: at the worst-of-three bottom, 230, the finding '
      + 'drops.' },
  { axis: 'OCCLUDED', card: 'cluster-resource-quota', where: ['ReplicaSet web'],
    why: 'the ReplicaSet box starts at 340 and the panel reaches 396.55 at 1100x800 and 377.76 at '
      + '1280x860, so its left BORDER is behind the panel on the two smaller viewports, by 56.55 '
      + 'and 37.76 of a 232 box. The cost is visible rather than numerical and no TEXT is lost, '
      + 'both its strings being centred on 456 and inking 411.2 at the earliest. Held open because '
      + 'centring the pair exactly is the requirement and the panel is the thing in the way: `RS_X` '
      + 'is `600 - 28 - 232` and there is no term in it to move, so closing it means giving up '
      + 'either the exact centre or the family 232.' },
  { axis: 'CENTRE', card: 'workloads-pod-startup-conditions', where: [],
    why: 'an artefact of what the metric can SEE: `L-17` drops frames and chips, and this card '
      + 'draws its staircase and its rail as `.scheme-chip`, so the two blocks that span 60..1140 '
      + 'and centre the picture on 600 are invisible to it. What is left to measure is the Pod, the '
      + 'two actor boxes and the frame. Closing it means widening the frame back over 1080 of empty '
      + 'band, which `L-16` refuses.' },

  // ---------------------------------------------------------------------------------------
  // A-05. NET.A-03 says a fan leg nothing rides is correct, so most of this set is that.
  // ../unit/lane-shared.test.mjs asserts on it: a lane here that stops being reported turns
  // the gate red.
  // ---------------------------------------------------------------------------------------
  { axis: 'A-05', card: 'storage-volume-mode', where: ['[[690,375],[690,442]]'],
    why: 'W_BLK_STAGE, and the record answers this with a NO: block mode has NO staging step, no '
      + 'mkfs and no mount, which is the entire contrast the card is built on, so the lane exists '
      + 'to be visibly empty beside the fs branch that uses its twin. Measured 2026-08-17: a dim '
      + 'storage lane renders at stroke-opacity 1 WITH a marker while .scheme-arrow-relation pins '
      + '0.45 and drops it, so either repair sinks ONE lane of a mirrored pair on a card whose '
      + 'whole claim is that the two columns are identical and only the field differs. The ruling '
      + 'was in storage/CARDS.md as NOT A DEFECT before this table existed and was simply never '
      + 'imported into it.' },
  { axis: 'A-05', card: 'network-ebpf-dataplane', where: ['[[660,312],[790,312],[790,442],[920,442]]'],
    why: 'TO_PODY, the ALTERNATIVE backend of the map lookup. network/CARDS.md under this card: '
      + '"TO_PODY carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the '
      + 'map lookup picked one of two, and the card says so in words. N destinations, N wires." '
      + 'NET.A-03.' },
  { axis: 'A-05', card: 'network-headless-service', where: ['[[290,485],[355,485],[355,520],[820,520],[820,472],[880,472]]'],
    why: 'TO_W2, the third leg of the data fan. network/CARDS.md: "TO_W2 in the data fan rides '
      + 'nothing. N destinations get N wires so the reader can see the client picked one of three." '
      + 'NET.A-03, and the record two cards down names this one as the precedent for the nodeport '
      + 'fan.' },
  { axis: 'A-05', card: 'network-nodeport-loadbalancer', where: ['[[600,230],[600,320]]'],
    why: 'TO_N2. network/CARDS.md: "TO_N2 and TO_N3 carry no ball on a given step. A NodePort opens '
      + 'the SAME port on EVERY Node, which is the card whole first claim, so all three lanes have '
      + 'to exist for the reader to see that any Node would have served the request." NET.A-03.' },
  { axis: 'A-05', card: 'network-nodeport-loadbalancer', where: ['[[600,230],[600,286],[970,286],[970,320]]'],
    why: 'TO_N3, the other half of the same pair and the same record entry. Which of the three legs '
      + 'a step takes is the arbitrary part, and drawing only the taken one would make the '
      + 'arbitrary look like the only. NET.A-03.' },
  { axis: 'A-05', card: 'network-traffic-distribution', where: ['[[630,320],[700,320],[700,236],[820,236]]'],
    why: 'FAN_A2. network/CARDS.md: "FAN_A2 carries no ball on its step. It is the endpoint the '
      + 'traffic distribution did NOT pick, and the point of the card is that the choice was made '
      + 'among the drawn candidates rather than forced." NET.A-03.' },
  { axis: 'A-05', card: 'network-model', where: ['[[990,172],[990,280]]'],
    why: 'CNI_CONNECTOR, and this one is NOT a fan leg. network/CARDS.md: "CNI_CONNECTOR IS '
      + 'animated, with the repeating MARCH dash offset rather than a ball: this card vocabulary '
      + 'for this is what implements the model. No packet rides it because nothing DISCRETE '
      + 'travels, the plugin is not sending a message, it is the thing that makes the flat space '
      + 'exist." An F.anim on the dash offset is motion this file does not read as traffic, and '
      + 'should not.' },
  { axis: 'A-05', card: 'storage-reclaim-policy', where: ['[[712,336],[712,390]]'],
    why: 'W_RET_WIPE, and the card says so at the declaration: "drawn, never travelled: that is '
      + 'Retain". The whole subject of the card is that the Retain column HAS the lane the Delete '
      + 'column uses and never sends anything down it, so removing the arrowhead would remove the '
      + 'comparison.' },
  { axis: 'A-05', card: 'storage-volume-detach-on-node-loss', where: ['[[578,282],[578,260],[496,260],[496,208]]'],
    why: 'W_ATTACH_A, and the record answers this exact question with a NO: "W_ATTACH_A is reported '
      + 'as a lane nobody rides, and converting it to a relationPath is DECLINED: sinking one half '
      + 'of a deliberately symmetric pair makes the left lane the lesser arrow, which is the thing '
      + 'this card goes out of its way not to do." The card says which half is live through '
      + 'OPACITY instead.' },

  // ---------------------------------------------------------------------------------------
  // SIMULTANEOUS and LIT-NOT-WRITTEN are EMPTY, and both read correctly that way: their queues
  // reached zero, which is what promoted each rule into `npm test`. Nothing is reported, so
  // nothing is carried.
  // ---------------------------------------------------------------------------------------
];

// The match key. `[card, ...where].join(' ')` is byte for byte what the five private tables used,
// so a consuming file builds its key from the finding and compares strings with no knowledge of
// this file beyond the axis name.
export const carryKey = (card, where = []) => [card, ...where].join(' ');

const known = (axis) => {
  if (!Object.hasOwn(AXES, axis)) {
    throw new Error(`carried.mjs knows no axis '${axis}'. Add it to AXES with the file that reads ` +
      'it and the shape of its `where`, or fix the caller.');
  }
  return axis;
};

// Every entry filed under one axis, in declaration order.
export const carriedFor = (axis) => ENTRIES.filter(e => e.axis === known(axis));

// The drop-in for a private table: `Map<key, why>`. Built fresh per call, so a caller that mutates
// what it gets back cannot reach the store.
export const carriedMap = (axis) =>
  new Map(carriedFor(axis).map(e => [carryKey(e.card, e.where), e.why]));

// THE STALE GUARD. `seen` is every key the walk actually produced for this axis, and what comes
// back is every carried key it did not. A ruling that matches no finding is a lie the store tells:
// the card moved and the reason still claims it. Report-only axes print this, and the four axes
// with a `gate` column assert on it.
export const staleKeys = (axis, seen) => {
  const live = seen instanceof Set ? seen : new Set(seen);
  return carriedFor(axis).map(e => carryKey(e.card, e.where)).filter(k => !live.has(k));
};

// The shape check every consuming file runs, returned as lines rather than thrown: a report file
// prints them and a gate file asserts the array is empty. `ids` is the catalogued card ids, so a
// ruling naming a card that no longer exists is caught here rather than by going quietly stale.
//
// THE FLOOR IS PRESENCE, NOT LENGTH, and that is deliberate. ../unit/chip-beat-e.test.mjs asks for
// more than 20 characters on the FORM-E table it gates, which every FORM-E entry clears. The store
// as a whole cannot: a back-reference to the entry above it is a legitimate reason, and the
// shortest in the store is `same restoration` at 16 characters, three R2-STEP siblings sharing one
// argument. Counting characters would only push a writer into padding.
export function shapeProblems(axis, ids = null) {
  const bad = [];
  for (const e of carriedFor(axis)) {
    const key = carryKey(e.card, e.where);
    if (typeof e.why !== 'string' || !e.why.trim()) {
      bad.push(`carried['${key}'] carries no reason. A carried finding is a decision somebody ` +
        'measured, and without the reason it is only a shorter queue');
    }
    if (ids && !ids.has(e.card)) {
      bad.push(`carried['${key}'] names '${e.card}', which is not a catalogued card id`);
    }
  }
  return bad;
}

// `CARRIED=1` makes a consuming file print its WHOLE axis roster instead of only the entries this
// walk matched, so a stale entry shows up beside the reason it still claims.
export const SHOW_ALL = process.env.CARRIED === '1';

// The block every consuming file prints for its axis, so one shape reaches every report. `held` is
// the matched entries as `{ key, why }`, optionally with the `line` that file writes for a live
// finding: where there is one it stands in for the key, because the sentence says more than the
// key does. `stale` is what staleKeys returned, and `pad` is the leading whitespace that file
// indents its findings by.
export function carriedBlock(axis, held, stale, pad = '   ') {
  const out = [];
  const rows = SHOW_ALL
    ? carriedFor(axis).map(e => {
      const key = carryKey(e.card, e.where);
      const hit = held.find(h => h.key === key);
      return { key, why: e.why, line: hit && hit.line, matched: !!hit };
    })
    : held.map(h => ({ ...h, matched: true }));
  for (const r of rows) {
    out.push(`${pad}CARRIED  ${r.line || r.key}${r.matched ? '' : '   [NO LIVE FINDING THIS RUN]'}`);
    out.push(`${pad}   WHY ${r.why}`);
  }
  if (stale.length) {
    out.push(`${pad}carried entries no longer reported (stale, remove them or re-read the card): ` +
      stale.join(' | '));
  }
  return out;
}

// `node fixtures/carried.mjs [axis]`: the store as text, on demand and with no walk behind it.
// Named entry point rather than a test, because there is no finding here to print, only rulings.
if (process.argv[1] && process.argv[1].endsWith('carried.mjs')) {
  const want = process.argv[2];
  const { cards } = await import('./catalog.mjs');
  const ids = new Set((await cards()).map(c => c.id));
  const axes = want ? [known(want)] : Object.keys(AXES);
  const lines = [];
  lines.push('===== the carried store =====');
  lines.push(`  ${ENTRIES.length} ruling(s) over ${Object.keys(AXES).length} axis(es)`);
  for (const axis of axes) {
    const meta = AXES[axis];
    const rows = carriedFor(axis);
    lines.push('');
    lines.push(`${axis}  ${rows.length} ruling(s), read by ${meta.file}` +
      (meta.gate ? ` and asserted by ${meta.gate}` : ''));
    lines.push(`  key: <card id> ${meta.where}`);
    lines.push(`  ${meta.note}`);
    for (const e of rows) {
      lines.push(`  ${carryKey(e.card, e.where)}`);
      lines.push(`     WHY ${e.why}`);
    }
    const bad = shapeProblems(axis, ids);
    for (const b of bad) lines.push(`  BROKEN  ${b}`);
  }
  lines.push('===== end of store =====');
  console.log(lines.join('\n'));
}
