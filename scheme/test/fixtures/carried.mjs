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
  R4: {
    file: 'report/arrival.test.mjs',
    where: '<step index> <block label, first 28 chars>',
    note: 'the MIRROR of R3: a block a ball departs from that is cued neither at entry nor by an earlier arrival',
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
  { axis: 'R2-ENTRY', card: 'network-nodeport-loadbalancer', where: ['4', 'loadBalancer'],
    why: 'not a change on client-hit: the address is written by the F.set on the provisioning arrival '
      + 'of lb-provision, which lights the chip there, and a frame frozen at t=0 of lb-provision reads '
      + 'the rewind value none. R2-STEP, off the settled step, reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-loadbalancer-bare-metal', where: ['2', 'loadBalancer'],
    why: 'not a change on l2: the address is written by the F.set on the controller write arrival of '
      + 'pool, which lights the chip there, and a frame frozen at t=0 of pool reads the rewind value '
      + 'pending. R2-STEP, off the settled step, reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['2', 'GatewayClass Accepted'],
    why: 'written and lit by the F.set STATUS_MS into platform, when the class is taken, and a frame '
      + 'frozen at t=0 of platform reads the rewind value none. R2-STEP, off the settled step, reports '
      + 'nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['2', 'listener allowedRoutes'],
    why: 'written and lit on the Gateway reveal arrival of platform, whose frame frozen at t=0 reads the '
      + 'rewind value none. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['3', 'HTTPRoute Accepted'],
    why: 'written and lit STATUS_MS after the route reveal of rejected, whose frame frozen at t=0 reads '
      + 'the rewind value none. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['4', 'listener allowedRoutes'],
    why: 'written and lit on the edit beat of admitted, whose frame frozen at t=0 reads the rewind '
      + 'value from: Same. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['4', 'HTTPRoute Accepted'],
    why: 'written and lit STATUS_MS after the edit beat of admitted, whose frame frozen at t=0 reads '
      + 'the rewind value. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['4', 'HTTPRoute ResolvedRefs'],
    why: 'written and lit on the last beat of admitted, whose frame frozen at t=0 reads the rewind '
      + 'value none. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-api', where: ['6', 'HTTPRoute ResolvedRefs'],
    why: 'written and lit STATUS_MS after the ReferenceGrant reveal of grant, whose frame frozen at t=0 reads the '
      + 'rewind value. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['2', 'request'],
    why: 'written and lit by the F.set on the request arrival of header-canary, whose frame frozen at t=0 '
      + 'reads the rewind value, against the rewind value none of one-backend. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['2', 'matched rule'],
    why: 'written and lit by the F.set on the request arrival of header-canary, whose frame frozen at t=0 '
      + 'reads the rewind value, against the rewind value none of one-backend. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['3', 'request'],
    why: 'written and lit by the F.set on the first request arrival of weights, whose frame frozen at t=0 '
      + 'reads the rewind value of header-canary. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['3', 'matched rule'],
    why: 'written and lit by the F.set on the first request arrival of weights, whose frame frozen at t=0 '
      + 'reads the rewind value of header-canary. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['4', 'request'],
    why: 'not a change on invalid: the value is the one weights settles on, and the frame frozen at t=0 of '
      + 'weights reads its rewind value instead. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['4', 'matched rule'],
    why: 'not a change on invalid: the value is the one weights settles on, and the frame frozen at t=0 of '
      + 'weights reads its rewind value instead. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-gateway-traffic-splitting', where: ['4', 'default rule weights'],
    why: 'not a change on invalid: 90 + 10 = 100 is what weights settles on as its bar stops, and the '
      + 'frame frozen at t=0 of weights reads its rewind value 1 (default). R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['3', 'Host'],
    why: 'not a change on match-web: the value is written by the F.set on the request arrival of entry, '
      + 'which lights the chip there, and a frame frozen at t=0 of entry reads the rewind value none. '
      + 'R2-STEP, off the settled step, reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['3', 'path'],
    why: 'not a change on match-web: written and lit on the request arrival of entry, whose frame '
      + 'frozen at t=0 reads the rewind value none. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['3', 'TLS'],
    why: 'not a change on match-web: written and lit on the request arrival of entry, whose frame '
      + 'frozen at t=0 reads the rewind value none. R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['4', 'served by'],
    why: 'the cue lands on the branch arrival of match-web, and t=0 of match-api reads its rewind value. '
      + 'R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['5', 'path'],
    why: 'the cue lands on the request arrival of match-api, and t=0 of no-match reads its rewind value. '
      + 'R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-ingress-routing', where: ['5', 'served by'],
    why: 'the cue lands on the branch arrival of match-api, and t=0 of no-match reads its rewind value. '
      + 'R2-STEP reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['3', 'Pod labels'],
    why: 'not the mid-step class: a restoration to app=web, carried with its reason on R2-STEP' },
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['4', 'Pod Ready'],
    why: 'a restoration to True, carried with its reason on R2-STEP' },
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['4', 'serving'],
    why: 'a restoration to the healthy endpoint, carried with its reason on R2-STEP' },
  { axis: 'R2-ENTRY', card: 'network-proxy-rule-resync', where: ['3', 'endpoint changes'],
    why: 'the price of the P-03 repair, and the trade is the right way round. The count turns over '
      + 'INSIDE step 2, where a `rewind` holds it at `none yet` and an `F.set` bound to the arrival '
      + 'of the EndpointSlice update writes `100 in one window`, with an `F.light` on the same '
      + 'arrival so the reader sees the value land under its own cue. This axis reads both frames '
      + 'frozen at t=0, so it never sees that turnover and attributes it to step 3, which does not '
      + 'light the chip because that step is about the cost of a floor of 0s and not about how many '
      + 'changes arrived. R2-STEP, settled against settled, holds this card on neither list. DO NOT '
      + 'close this by lighting the change count on step 3.' },
  { axis: 'R2-ENTRY', card: 'network-proxy-rule-resync', where: ['4', 'kernel updates'],
    why: 'the same construction one chip along: the update count turns over inside step 3 on the '
      + 'arrival of the write, under an `F.light` fired at that same arrival, which is why the axis '
      + 'itself marks this row CUE LANDS LATER rather than uncued. Frozen at t=0 the change is read '
      + 'a step late. R2-STEP does not list this card.' },
  { axis: 'R2-ENTRY', card: 'network-proxy-rule-resync', where: ['5', 'kernel updates'],
    why: 'the second reading of the same chip and the same idiom: it turns over inside step 4 on the '
      + 'write arrival, from 100 one-per-change updates to about 5 of 20 endpoints each, which is '
      + 'the whole sentence of that step. Frozen at t=0 it is attributed to step 5, which does not '
      + 'light it because that step is about the staleness window and not about the count. DO NOT '
      + 'close this by lighting the update count on step 5.' },
  { axis: 'R2-ENTRY', card: 'network-proxy-rule-resync', where: ['6', 'rules vs API server'],
    why: 'the lag turns over inside step 5 on the arrival that draws the window bracket, with an '
      + '`F.light` on the same arrival, which is why the axis marks this row CUE LANDS LATER. '
      + 'Frozen at t=0 it is read a step late, on the syncPeriod step. R2-STEP does not list it.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['2', 'ct state'],
    why: 'the miss turns over INSIDE `send`, at the arrival of the first packet in netfilter: a '
      + 'flow is not known to be unmatched until the packet is there to be matched. Every value '
      + 'on this card is written on a packet arrival or a ladder rung through `rewind` plus an '
      + '`F.set`, with an `F.light` on the same beat, so nothing is already true when a step '
      + 'opens. This axis reads both of its frames frozen at t=0, where the rewind is in force '
      + 'and no `at()` callback has fired, so it reads every turnover one step late. R2-STEP, '
      + 'settled against settled and the reading the canon asks for, holds this card on neither '
      + 'its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['2', 'rule walk'],
    why: 'the pending walk turns over on the same `send` arrival and under the same `F.light`, '
      + 'which is why the axis marks this row CUE LANDS LATER rather than uncued. Every value on '
      + 'this card is written on a packet arrival or a ladder rung through `rewind` plus an '
      + '`F.set`, with an `F.light` on the same beat, so nothing is already true when a step '
      + 'opens. This axis reads both of its frames frozen at t=0, where the rewind is in force '
      + 'and no `at()` callback has fired, so it reads every turnover one step late. R2-STEP, '
      + 'settled against settled and the reading the canon asks for, holds this card on neither '
      + 'its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['3', 'rule walk'],
    why: 'the walk turns over INSIDE `walk`, on the third rung at 1200ms, under an `F.light` fired '
      + 'at that same 1200ms. Frozen at t=0 it is read on `insert`, which does not light the chip '
      + 'because the walk does not happen again there. DO NOT close this by lighting `rule walk` '
      + 'on `insert`: that says the rules were read a second time, which the card exists to deny. '
      + 'Every value on this card is written on a packet arrival or a ladder rung through '
      + '`rewind` plus an `F.set`, with an `F.light` on the same beat, so nothing is already true '
      + 'when a step opens. This axis reads both of its frames frozen at t=0, where the rewind is '
      + 'in force and no `at()` callback has fired, so it reads every turnover one step late. '
      + 'R2-STEP, settled against settled and the reading the canon asks for, holds this card on '
      + 'neither its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['3', 'backend'],
    why: 'the pick turns over on the same third rung and under the same `F.light`. It cannot be '
      + 'stated any earlier: before the ladder is read there is no backend to name. Every value '
      + 'on this card is written on a packet arrival or a ladder rung through `rewind` plus an '
      + '`F.set`, with an `F.light` on the same beat, so nothing is already true when a step '
      + 'opens. This axis reads both of its frames frozen at t=0, where the rewind is in force '
      + 'and no `at()` callback has fired, so it reads every turnover one step late. R2-STEP, '
      + 'settled against settled and the reading the canon asks for, holds this card on neither '
      + 'its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['4', 'original'],
    why: 'the entry does not exist until conntrack writes it, which is the sentence of `insert`. '
      + 'Both rows are written at the reveal of the record group, 500ms in, under an `F.light` on '
      + 'the same beat, and the group stands at `OPACITY.pending` with blank rows until then. '
      + 'Frozen at t=0 the fill is read on `reply`. Every value on this card is written on a '
      + 'packet arrival or a ladder rung through `rewind` plus an `F.set`, with an `F.light` on '
      + 'the same beat, so nothing is already true when a step opens. This axis reads both of its '
      + 'frames frozen at t=0, where the rewind is in force and no `at()` callback has fired, so '
      + 'it reads every turnover one step late. R2-STEP, settled against settled and the reading '
      + 'the canon asks for, holds this card on neither its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['4', 'reply'],
    why: 'the second row of the same record, written on the same reveal beat and under the same '
      + '`F.light`, which is why the axis marks this row CUE LANDS LATER. Every value on this '
      + 'card is written on a packet arrival or a ladder rung through `rewind` plus an `F.set`, '
      + 'with an `F.light` on the same beat, so nothing is already true when a step opens. This '
      + 'axis reads both of its frames frozen at t=0, where the rewind is in force and no `at()` '
      + 'callback has fired, so it reads every turnover one step late. R2-STEP, settled against '
      + 'settled and the reading the canon asks for, holds this card on neither its queue nor its '
      + 'carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['4', 'ct state'],
    why: 'NEW is what the write MAKES true, so it lands on the reveal beat with the two rows, '
      + 'under the same `F.light`. The axis marks this row CUE LANDS LATER. Every value on this '
      + 'card is written on a packet arrival or a ladder rung through `rewind` plus an `F.set`, '
      + 'with an `F.light` on the same beat, so nothing is already true when a step opens. This '
      + 'axis reads both of its frames frozen at t=0, where the rewind is in force and no `at()` '
      + 'callback has fired, so it reads every turnover one step late. R2-STEP, settled against '
      + 'settled and the reading the canon asks for, holds this card on neither its queue nor its '
      + 'carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['4', 'table'],
    why: 'the table holds one entry only once the entry has been written, so this value lands on '
      + 'the same reveal beat and under the same `F.light` as the two rows it counts. Every value '
      + 'on this card is written on a packet arrival or a ladder rung through `rewind` plus an '
      + '`F.set`, with an `F.light` on the same beat, so nothing is already true when a step '
      + 'opens. This axis reads both of its frames frozen at t=0, where the rewind is in force '
      + 'and no `at()` callback has fired, so it reads every turnover one step late. R2-STEP, '
      + 'settled against settled and the reading the canon asks for, holds this card on neither '
      + 'its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['5', 'ct state'],
    why: 'ESTABLISHED is what SEEING the reply makes true, so it lands at the arrival of the reply '
      + 'packet in netfilter and not at the step opening. Frozen at t=0 it is read on `fastpath`, '
      + 'which does not light it because that step is about the cost of a later packet and not '
      + 'about the state. Every value on this card is written on a packet arrival or a ladder '
      + 'rung through `rewind` plus an `F.set`, with an `F.light` on the same beat, so nothing is '
      + 'already true when a step opens. This axis reads both of its frames frozen at t=0, where '
      + 'the rewind is in force and no `at()` callback has fired, so it reads every turnover one '
      + 'step late. R2-STEP, settled against settled and the reading the canon asks for, holds '
      + 'this card on neither its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-conntrack-nat', where: ['5', 'rule walk'],
    why: 'the return path reads no rule at all, which is the sentence of `reply`, and the chip '
      + 'says so at the arrival of the reply packet under the same `F.light`. The axis marks this '
      + 'row CUE LANDS LATER. Every value on this card is written on a packet arrival or a ladder '
      + 'rung through `rewind` plus an `F.set`, with an `F.light` on the same beat, so nothing is '
      + 'already true when a step opens. This axis reads both of its frames frozen at t=0, where '
      + 'the rewind is in force and no `at()` callback has fired, so it reads every turnover one '
      + 'step late. R2-STEP, settled against settled and the reading the canon asks for, holds '
      + 'this card on neither its queue nor its carried list.' },
  { axis: 'R2-ENTRY', card: 'network-ipam-pod-cidr', where: ['3', 'node.spec.podCIDR'],
    why: 'the three slice chips share one name, so this key stands for the two rows the axis reads '
      + 'late. All three turn over INSIDE step 2, where a `rewind` holds them at `pending` and an '
      + '`F.set` bound to the centre allocation arrival writes the three /24s, while `lit` on that '
      + 'step carries all three chips so every value lands under its own cue. Frozen at t=0 the '
      + 'change is attributed to step 3, which lights slice1 alone because that step is about Node-1 '
      + 'and the Pod scheduled to it. R2-STEP, settled against settled, does not list this card. DO '
      + 'NOT close this by lighting the Node-2 and Node-3 slices on the Node-1 step.' },
  { axis: 'R2-ENTRY', card: 'network-service-cidr', where: ['4', 'IPAddress'],
    why: 'the IPAddress object does not exist until the write lands, so step 3 `write` holds the '
      + 'chip at opacity 0 with a blank value through its `rewind` and turns both over on the store '
      + 'arrival at 700ms, an `F.anim` reveal and an `F.set`, with the chip in that step `lit` list '
      + 'from 0ms so the value appears under its own cue. Frozen at t=0 the axis reads the wound '
      + 'back blank and attributes the change to step 4 `extend`, which does not light it because '
      + 'that step is about a second range and not about the object already written. R2-STEP, '
      + 'settled against settled, lists this card on neither of its lists. DO NOT close this by '
      + 'lighting the IPAddress chip on `extend`, which cues a value that step never moves.' },
  { axis: 'R2-ENTRY', card: 'network-dualstack', where: ['3', 'Pod IP v6'],
    why: 'the price of the P-03 repair, and the trade is the right way round. The v6 address turns '
      + 'over INSIDE step 2, where a `rewind` holds the cell at `none` and an `F.set` bound to the '
      + 'drop out of the config band writes fd00::1:5 at 700ms, with the cell in that step `lit` '
      + 'list from 0ms so the value lands under its own cue. Frozen at t=0 the axis never sees that '
      + 'turnover and attributes it to step 3, which does not light the cell because that step is '
      + 'about the SERVICE getting a second ClusterIP and not about the Pod address. Before the '
      + 'rewind the cell read fd00::1:5 from 0ms while the ball carrying it was still 700ms out, '
      + 'which is a defect a viewer can see and which stood on the FORM-B queue of '
      + 'report/chip-beat.test.mjs. R2-STEP, settled against settled, holds this card on neither '
      + 'list. DO NOT close this by lighting Pod IP v6 on `service-two-clusterips`.' },
  { axis: 'R2-ENTRY', card: 'network-pod-egress-snat', where: ['5', 'conntrack'],
    why: 'the value is CARRIED from the end of step 4 `reply`, where it is the news and is lit: a '
      + '`rewind` holds the chip at `entry matched` while the reply crosses and an `F.set` on the '
      + 'return arrival writes `translation reversed` at 918ms under the `lights` that cue the rule '
      + 'box. Frozen at t=0 the axis reads that wound back value and attributes the change to step 5 '
      + '`deliver`, which only holds it. Cueing it again on `deliver` would say the reversal happens '
      + 'twice, once at the boundary and once in the Pod. DO NOT close this by naming ctChip in the '
      + '`lit` list of `deliver`.' },
  { axis: 'R2-ENTRY', card: 'network-pod-to-pod-same-node', where: ['2', 'datapath'],
    why: 'the first reading of the same idiom, on the one step of the card that moves no packet. '
      + '`onlink` rewinds the chip to `one subnet` and an `F.set` at `duration - SETTLE`, 1500ms of '
      + '2500, writes `dst on-link` under an `F.light` on the same beat, which is the conclusion the '
      + 'step reaches rather than the state it opens in. That beat is also what keeps the step off '
      + 'the `deadair.mjs` queue: cued at `BEAT.afterPulse` instead it is swallowed by the 900ms Pod '
      + 'pulse and the step stands still for 68 percent of its length. Frozen at t=0 the axis reads '
      + 'the wound back value and attributes the change to step 2, which is that same step seen from '
      + 'its entry. DO NOT close this by naming pathChip in the `lit` list of `onlink`, which points '
      + 'the eye at a conclusion the step has not reached yet.' },
  { axis: 'R2-ENTRY', card: 'network-pod-to-pod-same-node', where: ['3', 'datapath'],
    why: 'the datapath chip turns over INSIDE step 2 `arp`, where a `rewind` holds it at `dst '
      + 'on-link` and an `F.set` bound to the request arrival inside cni0 writes `ARP who-has .6` at '
      + '1500ms, under an `F.light` fired at that same arrival so the value lands with its own cue. '
      + 'Frozen at t=0 the axis reads the wound back value and attributes the change to step 3 '
      + '`forward`, which itself rewinds the chip and lights it on the bridge arrival. The '
      + 'alternative is the FORM-B reading, lit from entry and pointing at a value the step has not '
      + 'written for 1500ms, which is worse. DO NOT close this by naming pathChip in the `lit` list '
      + 'of either step.' },
  { axis: 'R2-ENTRY', card: 'network-pod-to-pod-same-node', where: ['4', 'datapath'],
    why: 'the same construction one step along: step 3 `forward` rewinds the chip to `ARP who-has '
      + '.6` and an `F.set` at the `hop1` arrival writes `L2 bridge` at 1500ms with an `F.light` on '
      + 'the same arrival, which is the moment the switching decision is taken. Step 4 `no-nat` '
      + 'holds that settled value and lights the src, dst and NAT chips instead, because the closing '
      + 'claim is about the addresses and not about the datapath. DO NOT close this by cueing a '
      + 'value `no-nat` never moves.' },
  { axis: 'R2-ENTRY', card: 'cluster-cpu-throttling', where: ['2', 'cpu.weight'],
    why: 'the axis samples both steps frozen at t=0, where `rewind` has rolled cpu.weight back and '
      + 'the `F.set` has not landed, so the turnover shows up one step late, at `quota`. R2-STEP, '
      + 'settled against settled, is the reading the rule asks for and this card is on neither of '
      + 'its lists. DO NOT close this row by lighting cpu.weight on `quota`, which points the eye '
      + 'at the one chip that step does not touch.' },
  { axis: 'R2-ENTRY', card: 'workloads-statefulset-update-strategy', where: ['5', 'partition'],
    why: 'the same frozen-sample class as `cluster-cpu-throttling`: the axis reads both steps at t=0, where `rewind` has rolled the value back and the `F.set` carrying the cue has not landed. '
      + 'The row labels itself CUE LANDS LATER, and the cue it cannot see is the `chipsCued` write '
      + 'on the patch arrival of this same step. R2-STEP, settled against settled, is the reading '
      + 'the rule asks for and this card is on none of its rows.' },
  { axis: 'R2-ENTRY', card: 'workloads-statefulset-update-strategy', where: ['6', 'partition'],
    why: 'the same frozen-sample class as `cluster-cpu-throttling`: the axis reads both steps at t=0, where `rewind` has rolled the value back and the `F.set` carrying the cue has not landed. '
      + 'partition really turns 2 to 0 on `max-unavailable` and is cued there, so frozen it shows '
      + 'up one step late, on `ondelete`, which does not touch it. DO NOT close this row by lighting '
      + 'partition on `ondelete`: that points the eye at a chip that step leaves alone.' },
  { axis: 'R2-ENTRY', card: 'workloads-statefulset-update-strategy', where: ['6', 'maxUnavailable'],
    why: 'the same frozen-sample class as `cluster-cpu-throttling`: the axis reads both steps at t=0, where `rewind` has rolled the value back and the `F.set` carrying the cue has not landed. '
      + 'maxUnavailable really turns 1 to 2 on `max-unavailable` and is cued there, so the same '
      + 'one-step lag lands it on `ondelete`. The two rows are one event read late.' },

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

  { axis: 'R2-ENTRY', card: 'workloads-force-deletion', where: ['2', 'containers running'],
    why: 'the frozen-sampling artefact this axis documents. The value turns over on `silent`, at the '
      + 'end of the fade that severs the acknowledgement channel, through an `F.set` bound to that '
      + 'beat, and the chip is lit in the same call. Read at t=0 the change is first seen one step '
      + 'later, on `terminating`, where the chip is legitimately not lit because that step is about '
      + 'the record rather than about the containers.' },
  { axis: 'R2-ENTRY', card: 'workloads-force-deletion', where: ['5', 'ETCD record'],
    why: 'the same artefact one step further on: `force` turns the record over on the arrival of the '
      + 'ball that drops the object, with the chip lit in that same `F.set`, and `split` winds it '
      + 'back and rewrites it at BEAT.lead. Frozen at t=0 both steps read the wound-back string, so '
      + 'the change is attributed to `split`, where the cue has already been shown and cleared.' },
  { axis: 'R2-ENTRY', card: 'workloads-force-deletion', where: ['2', 'focus'],
    why: 'CUE LANDS LATER, and later is the point. `focus` reads the beat the step is named for, so '
      + 'it turns over and lights at the arrival that earns it, never at entry: on `silent` that is '
      + 'the end of the fade that severs the channel. A cue at entry would glow over `none`, the '
      + 'value the previous step left, and glow a second time when the value actually moved. Only a '
      + 'block that SENDS a ball is lit at entry on this card, which M-18a owes it.' },
  { axis: 'R2-ENTRY', card: 'workloads-force-deletion', where: ['5', 'identity web-0'],
    why: 'the same rule on `force`: the identity is free only once the ball has dropped the object, '
      + 'so the chip turns over and lights on that arrival. Cued at entry it would say free while '
      + 'the object is still drawn in the slot, which is the one thing this step exists to separate.' },
  { axis: 'R2-ENTRY', card: 'workloads-force-deletion', where: ['5', 'focus'],
    why: 'the same rule as `2 focus`, one step on. `focus` is bound to the arrival on every step '
      + 'that has one, and doing it to this chip and not its neighbours is what P-04 refuses.' },

  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['3', 'order issued'],
    why: 'CUE LANDS LATER, and later is the point. An order is issued when its ball leaves the '
      + 'Deployment, BEAT.lead into the step, and the chip turns over on the create arrival with the '
      + 'tile that carries the order lit at departure. Frozen at t=0 both frames read the wound-back '
      + '`none yet`, and the axis attributes the move to the step after. R2-STEP, which reads the '
      + 'settled frame, prints nothing for this card.' },
  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['4', 'order issued'],
    why: 'the same rule one step on: the second order is released by the Ready blink and its chip '
      + 'turns over on the terminate arrival, so the frozen frame reads the wound-back first order.' },
  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['4', 'serving'],
    why: 'the count moves TWICE on this step and neither move is at entry: to two on the Ready blink, '
      + 'to one when web-a1 has faded out, FADE.out past the terminate arrival. Chips on a step are '
      + 'bound to their beats or none of them are (P-04), so this row cannot be closed alone.' },
  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['5', '.spec.strategy.type'],
    why: 'the field turns over on the beat the first Recreate order LEAVES under it, BEAT.lead into '
      + 'the step, and is cued by that same F.set. Cued at entry it would stand on the wound-back '
      + '`RollingUpdate` for 800ms, which is the cue-before-the-change P-05 refuses. The settled '
      + 'reading carries the highlight and R2-STEP prints nothing here.' },
  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['5', 'order issued'],
    why: 'the same rule as `3 order issued`: the order is on the terminate arrival, not at entry.' },
  { axis: 'R2-ENTRY', card: 'workloads-deployment-strategy', where: ['5', 'serving'],
    why: 'the count drops to zero FADE.out past the terminate arrival, when web-a1 has gone and the '
      + 'void mark rises in its slot, because a Pod still fading is not yet removed and the outage the '
      + 'chip states begins when the removal has succeeded.' },

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

  { axis: 'R2-ENTRY', card: 'workloads-ephemeral-containers', where: ['3', 'spec.ephemeralContainers'],
    why: 'the value is a static write (`S-13`) and the cue rides the ball, which is what `lights:` '
      + 'on the route entry does. This axis reads both frames frozen at t=0, before that ball has '
      + 'landed, so it sees a moved value and no highlight. R2-STEP, settled against settled, is '
      + 'the reading the canon asks for and this card is not on its queue. DO NOT close it by '
      + 'lighting the chip at entry: that would say the API had appended the entry before the '
      + 'PATCH carrying it arrived.' },
  { axis: 'R2-ENTRY', card: 'workloads-ephemeral-containers', where: ['3', 'targetContainerName'],
    why: 'the same PATCH that appends the entry carries targetContainerName, so the chip moves on '
      + 'the same ball as `3 spec.ephemeralContainers` and is cued by the same `lights:` list at '
      + 'the door. DO NOT light it at entry: the field is set by the write that has not landed yet.' },
  { axis: 'R2-ENTRY', card: 'workloads-ephemeral-containers', where: ['5', 'status.ephemeralContainerStatuses'],
    why: 'the same shape as `3 spec.ephemeralContainers` on this card, one hop lower: the status '
      + 'is written statically and cued by `lights:` on the spine route, so the frozen t=0 frame '
      + 'reads the value without the highlight that arrives with the ball.' },

  { axis: 'R2-ENTRY', card: 'workloads-termination-order', where: ['2', 'stop order'],
    why: 'the value is a static write (`S-13`) and the cue rides the ball, which is what `lights:` '
      + 'on the route entry does. This axis reads both frames frozen at t=0, before that ball has '
      + 'landed, so it sees a moved value and no highlight. R2-STEP, settled against settled, is '
      + 'the reading the canon asks for and this row is not on its queue. DO NOT close it by '
      + 'lighting the chip at entry: that would say the container had taken the stop signal before '
      + 'the ball carrying it arrived.' },
  { axis: 'R2-ENTRY', card: 'workloads-termination-order', where: ['4', 'stop order'],
    why: 'the same shape as `2 stop order` on this card: a static write cued by `lights:` on the '
      + 'ball that carries the signal, read here before that ball has landed.' },
  { axis: 'R2-ENTRY', card: 'workloads-termination-order', where: ['5', 'stop order'],
    why: 'the same shape as `2 stop order` on this card: a static write cued by `lights:` on the '
      + 'ball that carries the signal, read here before that ball has landed.' },
  { axis: 'R2-ENTRY', card: 'workloads-termination-order', where: ['6', 'stop order'],
    why: 'the same shape as `2 stop order` on this card: a static write cued by `lights:` on the '
      + 'ball that carries the signal, read here before that ball has landed.' },
  { axis: 'R2-ENTRY', card: 'workloads-termination-order', where: ['4', 'gate'],
    why: 'the gate opens BECAUSE the runtime reports that the last regular container has exited, so '
      + 'the chip is cued by `lights:` on that report and by nothing else. Lighting it at entry '
      + 'would say the gate was already open when the step began, which is the one thing the step '
      + 'exists to show happening.' },

  { axis: 'R2-ENTRY', card: 'workloads-cronjob', where: ['2', 'last event'],
    why: 'the frozen-sample artefact, and all five rows on this card are one instance of it. Every '
      + 'value of `last event` is written by the step that EARNS it, in an F.set bound to that '
      + 'step beat and carrying the chip in its own lit list, so the reader sees the Event land '
      + 'under its own cue. Read at t=0 the rewind has run and no F.set has, so each move is '
      + 'attributed to the step AFTER the one that made it. This row is the `create` turnover to '
      + '`created backup-28394400`, written at the create arrival at 2455ms and attributed to '
      + '`forbid`. R2-STEP, settled against settled and the reading the canon asks for, lists this '
      + 'card on neither its queue nor its carried list. DO NOT close it by lighting the chip at '
      + 'entry: that posts the Event before the Job it announces exists.' },
  { axis: 'R2-ENTRY', card: 'workloads-cronjob', where: ['3', 'last event'],
    why: 'the same artefact as `2 last event` on this card, one step on: `forbid` turns the chip '
      + 'over to `JobAlreadyActive · 12:05 skipped` in the F.set bound to its own reason mark '
      + 'revealing at BEAT.lead, with the chip in that F.set lit list, and the frozen sample sees '
      + 'the move first on `next`.' },
  { axis: 'R2-ENTRY', card: 'workloads-cronjob', where: ['4', 'last event'],
    why: 'the same artefact as `2 last event` on this card: `next` turns the chip over to '
      + '`created backup-28394420` on the THIRD create arrival at 2661ms, the last of the three '
      + 'the step draws, which is what a chip named `last event` promises, and the frozen sample '
      + 'sees the move first on `history`.' },
  { axis: 'R2-ENTRY', card: 'workloads-cronjob', where: ['5', 'last event'],
    why: 'the same artefact as `2 last event` on this card: `history` turns the chip over to '
      + '`deleted backup-28394400` when the pruned mark reveals, after the delete ball has landed '
      + 'and the run has faded, and the frozen sample sees the move first on `missed`.' },
  { axis: 'R2-ENTRY', card: 'workloads-cronjob', where: ['6', 'last event'],
    why: 'the same artefact as `2 last event` on this card, and the one row the tool marks NO CUE '
      + 'IN STEP rather than CUE LANDS LATER, because `suspend` deliberately has no turnover to '
      + 'defer. `missed` writes `missed 12:25 · past deadline` at its own mark reveal with the '
      + 'chip lit there, and `suspend` holds that same value: the suspend branch of syncCronJob '
      + 'logs and returns with no recorder call, so a suspended tick is the one decline on this '
      + 'card that records no Event at all and the last Event is still the 12:25 miss. The card '
      + 'record states that under CONTENT. DO NOT light the chip on `suspend`: writing a state '
      + 'onto an Event chip is P-02, and cueing a value that did not move is P-09a.' },

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

  { axis: 'R2-ENTRY', card: 'workloads-pod-lifecycle-phases', where: ['3', 'status.phase'],
    why: 'the price of the P-03 FORM-B repair, and the trade is the right way round. status.phase '
      + 'turns over on `running`, step 2, where a `rewind` holds it at Pending and an `F.set` bound '
      + 'to the ball reaching the Running box writes it at 700ms, with the chip in that step lit '
      + 'list so the cue is on screen from 0ms and the reader sees the value land under it. This '
      + 'axis reads both frames frozen at t=0, so it never sees that turnover and attributes the '
      + 'change to `crashloop`, step 3, where the chip is correctly not lit because the whole point '
      + 'of that step is that the phase does NOT move. Before the repair the value stood 700ms '
      + 'ahead of its own ball on the P-03 FORM-B queue. R2-STEP, settled against settled and the '
      + 'reading the canon asks for, holds this card on neither its queue nor its carried list. '
      + 'DO NOT close this by lighting status.phase on `crashloop`, which points the eye at the one '
      + 'chip that step exists to leave alone.' },
  { axis: 'R2-ENTRY', card: 'workloads-pod-lifecycle-phases', where: ['5', 'restartCount'],
    why: 'the same repair one register down. restartCount turns over on `recover`, step 4, where a '
      + '`rewind` holds it at 4 and an `F.set` bound to the Kubelet ball writes 5 at 700ms, with '
      + 'the chip in that step lit list. Frozen at t=0 the change is first seen on `terminal`, step '
      + '5, where it is not lit because that step is about the phase reaching Succeeded and the '
      + 'restart count is settled. DO NOT close it by lighting restartCount on `terminal`.' },
  { axis: 'R2-ENTRY', card: 'workloads-graceful-shutdown', where: ['3', 'endpoint 10.244.1.7'],
    why: 'the same shape. The endpoint turns over on `deregister`, step 2, where a `rewind` holds '
      + 'it at ready=true and an `F.set` bound to the slice ball landing on kube-proxy writes '
      + 'terminating at 1500ms, with the chip in that step lit list. Frozen at t=0 the change is '
      + 'first seen on `prestop`, step 3, where it is correctly not lit: that step is about the '
      + 'Node side and the endpoint is already settled. DO NOT close it by lighting the endpoint '
      + 'on `prestop`.' },
  { axis: 'R2-ENTRY', card: 'workloads-graceful-shutdown', where: ['4', 'grace window'],
    why: 'the same shape one step down. The window turns over on `prestop`, step 3, where a '
      + '`rewind` holds it at 30s left and an `F.set` bound to the in-flight request landing on '
      + 'the frame writes 25s left at 3000ms, with the chip in that step lit list. Frozen at t=0 '
      + 'the change is first seen on `sigterm`, step 4, where the window holds its value and is '
      + 'not lit because the step is about the signal, not the timer.' },

  { axis: 'R2-ENTRY', card: 'workloads-pod-garbage-collection', where: ['2', 'terminated Pods'],
    why: 'the value the step OPENS from, not a value it produces. `rewind` rolls the count to 12501 '
      + 'so the reader sees the cluster standing over the threshold before the delete leaves, and '
      + 'the frozen t=0 sample reads that roll-back as an uncued change. Lighting it at entry would '
      + 'glow over the number the step is about to replace and glow a second time when the delete '
      + 'lands, which is the beat the F.set already owns.' },

  { axis: 'R2-ENTRY', card: 'workloads-pod-garbage-collection', where: ['3', 'terminated Pods'],
    why: 'the other half of the same t=0 artefact. The turnover to 12500 happens inside `threshold` '
      + 'at the ball arrival, in an `F.set` that carries the chip in its own lit list and names it '
      + 'in `reducedLit` for the static path. Frozen at t=0 the change therefore shows up one step '
      + 'late, on `beyond`, which does not light it because that step is about the three rules that '
      + 'never read the count. R2-STEP, settled against settled, does not list this card.' },

  { axis: 'R2-ENTRY', card: 'workloads-finished-job-cleanup', where: ['2', 'status.completionTime'],
    why: 'the frozen-sample artefact, and all four rows on this card are one instance of it. '
      + '`finished` rewinds the four chips to the pre-completion reading and turns them over in an '
      + '`F.set` bound to the exit report landing on the Job, with every one of them in that step '
      + 'lit list. Sampled at t=0 the rewind has run and the F.set has not, so the change is '
      + 'attributed to the NEXT step, `watch`, which does not light them because it is about the '
      + 'controller picking the Job up rather than about the Job finishing. R2-STEP, settled '
      + 'against settled, does not list this card at all.' },
  { axis: 'R2-ENTRY', card: 'workloads-finished-job-cleanup', where: ['2', 'eligible for removal'],
    why: 'the same frozen-sample artefact as `2 status.completionTime` on this card, on the value '
      + 'the completion stamp implies.' },
  { axis: 'R2-ENTRY', card: 'workloads-finished-job-cleanup', where: ['2', 'job status'],
    why: 'the same frozen-sample artefact as `2 status.completionTime` on this card, on the Job '
      + 'condition the exit report produces.' },
  { axis: 'R2-ENTRY', card: 'workloads-finished-job-cleanup', where: ['2', 'pods owned'],
    why: 'the same frozen-sample artefact as `2 status.completionTime` on this card, on the Pod '
      + 'count that turns over with it.' },

  { axis: 'R2-ENTRY', card: 'workloads-daemonset', where: ['2', 'desiredNumberScheduled'],
    why: 'the frozen-sample artefact. `match` winds the counter back to 0 and raises it to 3 in an '
      + 'F.set bound to the Node-list arrival, with the chip in that step lit list throughout, so '
      + 'the reader sees it move under its own cue. Read at t=0 the change is attributed to the '
      + 'NEXT step, `place`, which is about the three creates and never touches desired. R2-STEP, '
      + 'settled against settled, does not list this card at all.' },
  { axis: 'R2-ENTRY', card: 'workloads-daemonset', where: ['3', 'currentNumberScheduled'],
    why: 'the same t=0 artefact one step on. `place` winds both Pod counters back to 0 and steps '
      + 'them up on the three create arrivals, both chips lit for the whole step, so the count '
      + 'climbs alongside the Pods appearing. Frozen at t=0 the change shows up on `node-join`, '
      + 'which is the step that deliberately moves no counter at all.' },
  { axis: 'R2-ENTRY', card: 'workloads-daemonset', where: ['3', 'numberReady'],
    why: 'the other half of the `place` artefact above, on the same step and the same three create '
      + 'arrivals. DO NOT close either row by lighting a counter on `node-join`: the whole point of '
      + 'that step is that a Node joined and NOTHING was scheduled, so a cue on a Pod count there '
      + 'would point the eye at the one thing the step is saying did not happen.' },
  { axis: 'R2-ENTRY', card: 'workloads-daemonset', where: ['5', 'desiredNumberScheduled'],
    why: 'the same artefact at the other end of the card. `label` winds all three counters back to '
      + 'the three-Node cluster it inherits and raises desired to 4 in an F.set bound to the watch '
      + 'arrival, with the chip lit throughout. Frozen at t=0 the change is attributed to `update`, '
      + 'which is about the rollout strategy and leaves the Node count alone.' },
  { axis: 'R2-ENTRY', card: 'workloads-daemonset', where: ['5', 'currentNumberScheduled'],
    why: 'the other half of the `label` artefact, raised by the F.set bound to the create arrival '
      + 'rather than to the watch. DO NOT close either row by lighting a counter on `update`, which '
      + 'points the eye at two chips that step leaves alone: what `update` moves is numberReady, '
      + 'and that one is stated at 3 there and reports nothing.' },

  { axis: 'R2-ENTRY', card: 'workloads-statefulset-ordered-rollout', where: ['2', 'web-0'],
    why: 'the frozen-sample artefact, and it is THE PRICE OF A REAL FIX. `ordinal-0` winds web-0 '
      + 'back to `not created` and turns it over to `Ready` on the create arrival at 2136ms, with '
      + 'the chip in that step lit list throughout. Without the rewind the chip reads `Ready` from '
      + '0ms while its column still holds a pending Pod, for the whole 2136ms, which is a defect a '
      + 'viewer can see. Frozen at t=0 the axis therefore attributes the change to `gate`, which is '
      + 'about the policy and not about web-0. R2-STEP, settled against settled, lists this card on '
      + 'neither of its lists.' },
  { axis: 'R2-ENTRY', card: 'workloads-statefulset-ordered-rollout', where: ['4', 'web-1'],
    why: 'the same trade one ordinal on, on the same construction: `ordinal-1` winds web-1 back to '
      + '`next in line`, which is what `gate` left, and turns it over on ordinal 1s create arrival '
      + 'at 1500ms, so the change lands on `ordinal-2` when both samples are frozen. DO NOT close '
      + 'either row by dropping the rewind, which puts a Ready ordinal on screen before its Pod '
      + 'exists.' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['2', 'query'],
    why: 'the frozen-sample artefact, on every row of this card. Each step winds its chips back in '
      + '`rewind` and turns them over with an `F.set` on the arrival that produces them, `q` for the '
      + 'query row and `a` for the record rows, lighting them in the same beat. Frozen at t=0 the '
      + 'turnover is invisible in the step that makes it and is attributed to the NEXT step, whose '
      + 'settled frame is then read for the cue, which is why these rows print NO CUE IN STEP. The '
      + 'turnover of `query` belongs to step 1, lit on the query arrival. R2-STEP lists nothing. '
      + 'DO NOT close it by dropping the rewind: every row would read its answer before the lookup '
      + 'is drawn' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['2', 'A web-0'],
    why: 'step 1 turns the row to pending on the query arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['2', 'A web-1'],
    why: 'step 1 turns the row to pending on the query arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['2', 'A web-2'],
    why: 'step 1 turns the row to pending on the query arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['3', 'A web-0'],
    why: 'step 2 `answer` writes the address on the answer arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['3', 'A web-1'],
    why: 'step 2 `answer` writes the address on the answer arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['3', 'A web-2'],
    why: 'step 2 `answer` writes the address on the answer arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['5', 'A web-2'],
    why: 'step 4 `not-ready` writes `not ready, left out` on its answer arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['6', 'query'],
    why: 'step 5 `pod-name` writes the Pod name on its query arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['6', 'A web-1'],
    why: 'step 5 `pod-name` writes `not asked` on its answer arrival and lights it there, as `query` above' },
  { axis: 'R2-ENTRY', card: 'network-headless-service', where: ['6', 'A web-2'],
    why: 'step 5 `pod-name` writes `not asked` on its answer arrival and lights it there, as `query` above' },

  // network-dns-autoscaling turns every one of these over MID-step, on the arrival of the ball that
  // produced it, and lights it there through `lit`. A frozen entry sample therefore first sees the
  // new value on the step AFTER the one that wrote it, where the cue has legitimately already been
  // shown and cleared. R2-STEP, the axis that answers the canon question, reports none of them.
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['2', 'nodes'],
    why: 'step 1 `poll` writes 16 on the counts arrival and lights `nodes` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['2', 'cores'],
    why: 'step 1 `poll` writes 128 on the counts arrival and lights `cores` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['3', 'key'],
    why: 'step 2 `params` writes `linear` on the ConfigMap arrival and lights `key` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['3', 'preventSinglePointFailure'],
    why: 'step 2 `params` writes `true` on the ConfigMap arrival and lights the chip there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['3', 'includeUnschedulableNodes'],
    why: 'step 2 `params` writes `true` on the ConfigMap arrival and lights the chip there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['3', 'min'],
    why: 'step 2 `params` writes `1 by default` on the ConfigMap arrival and lights `min` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['5', 'replicas'],
    why: 'step 4 `floor` writes 2 on the scale-write arrival and lights `replicas` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['6', 'nodes'],
    why: 'step 5 `grow` writes 48 on the counts arrival and lights `nodes` there' },
  { axis: 'R2-ENTRY', card: 'network-dns-autoscaling', where: ['6', 'cores'],
    why: 'step 5 `grow` writes 1536 on the counts arrival and lights `cores` there' },

  // ---------------------------------------------------------------------------------------
  // R3. One entry. A block that receives a ball must be dark when the step opens, and the
  // exemption the rule already grants (a block that ACTS FIRST) does not reach a block lit
  // for three steps running.
  // ---------------------------------------------------------------------------------------
  { axis: 'R3', card: 'cluster-scheduler-decision', where: ['5', 'Node-4'],
    why: 'Node-4 is lit on `score`, on `bind` and on `placed`, and dropping it for the 1500ms of '
      + 'the two hops reads as the winner being un-chosen. The arrival still has a receiver: the '
      + 'Kubelet lights on its own hop.' },

  // Two more, one shape. A bar on this card is a boundary a policy raised, and it is the SUBJECT of
  // every step it is drawn on rather than a block that receives anything: it is lit identically on
  // all four of those steps. R3 sees only the two where a route happens to END at it.
  ...['2', '5'].map(step => ({ axis: 'R3', card: 'network-policy', where: [step, '.scheme-box'],
    why: 'the bar is drawn on exactly the four steps the Pod it belongs to is isolated on, and lit '
      + 'on all four of them, including `allow` and `both-ends` where a packet passes through it '
      + 'and nothing lands. Going dark on the two steps where a packet DIES in it would dim the '
      + 'subject at the one moment it acts. The bar carries no label, which is why this row names '
      + 'it by selector: a string inside it would sit where the road runs.' })),

  // Three more of that shape, one card down. A door on the egress boundary is the thing the step is
  // ABOUT on every step it is drawn on, and the ball that reaches it is refused rather than served.
  ...['2', '3', '4'].map(step => ({ axis: 'R3', card: 'network-dns-egress-policy', where: [step, '.scheme-box'],
    why: 'the shut door is lit from entry on the three steps it refuses a query on, because it '
      + 'exists from the moment a policy selects the Pod and the ball demonstrates what it does '
      + 'rather than revealing that it is there. Lighting it on arrival would credit the query with '
      + 'raising the boundary that stops it. The door carries no label, which is why this row names '
      + 'it by selector: a string inside it would sit where the road runs.' })),

  // ---------------------------------------------------------------------------------------
  // R4. The catalog queue is 40 rows deep and unworked, so an entry here is not a card opting
  // out of it: it says the two shapes R4 names were both tried on this step and both are ruled
  // out by a check that is ASSERTED, which the report row cannot see.
  // ---------------------------------------------------------------------------------------
  { axis: 'R4', card: 'workloads-finished-job-cleanup', where: ['5', 'Job pi'],
    why: 'the sender DIES in the step it sends from, which is the one shape R4 has no cue for. '
      + 'Neither of its two fixes survives an asserted check. Putting jobEl in `lit` and taking the '
      + 'key back in the fade onfinish (S-18) closes R4 and was measured doing it, 41 rows to 40 '
      + 'catalog-wide, but the static path never runs the flow and so never unlights: '
      + 'render/reduced.test.mjs then reports HIGHLIGHT played=false reduced=true on the Job box '
      + 'and goes red. Putting it in `lit` WITHOUT the unlight is what S-18 itself forbids, and '
      + 'unit/spec-steps.test.mjs asserts that at zero. The mid-chain shape is not available '
      + 'either: the delete already lands on the Job in `expire`, and drawing it again here would '
      + 'be a second ball for traffic this step does not narrate (M-10). What the step lights '
      + 'instead is the two values the cascade produces.' },

  { axis: 'R4', card: 'network-hostnetwork-hostport', where: ['1', 'Node eth0'],
    why: 'the ball this step opens with is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y and never crosses the border, so the NIC 25 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `F.light` on the `inb` arrival at 700ms with the onward hop leaving at 800ms, one BEAT.afterHop later, which is the separation every chained hop in the catalogue uses. R4 reads a frame frozen at t=0 and its own header names this class. The other shape was measured: `eth` in `lit` closes both rows, 42 back to 40 catalog-wide, with no R3 row and a green render, and it costs the only arrival beat the step has, because a box already lit at entry does not light again when the ball lands on the Node. The exemplar draws the same shape, `network-nodeport-loadbalancer client-hit` lights np1 on the frame arrival, and escapes R4 only because a chip is not a block it judges.' },
  { axis: 'R4', card: 'network-loadbalancer-direct-to-pods', where: ['4', 'Cloud LoadBalancer'],
    why: 'the balancer is MID-CHAIN on `replace` and is cued as one: the register ball from the controller lands on the bottom face of the target ladder that hangs flush under the balancer, `lights: [\'lb\']` lights the balancer on that arrival, and the health check leaves it one BEAT.afterHop later. R4 matches an earlier arrival by where the ball stops, and the ladder is a chain, not the box, so it sees no arrival on the balancer. The other shape, `lb` in `lit`, would say the balancer acts first on a step the EndpointSlice opens. `register` draws the same arrival and escapes R4 only because no ball leaves the balancer there.' },
  { axis: 'R4', card: 'network-hostnetwork-hostport', where: ['3', 'Node eth0'],
    why: 'the ball this step opens with is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y and never crosses the border, so the NIC 25 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `F.light` on the `inb` arrival at 700ms with the onward hop leaving at 800ms, one BEAT.afterHop later, which is the separation every chained hop in the catalogue uses. R4 reads a frame frozen at t=0 and its own header names this class. The other shape was measured: `eth` in `lit` closes both rows, 42 back to 40 catalog-wide, with no R3 row and a green render, and it costs the only arrival beat the step has, because a box already lit at entry does not light again when the ball lands on the Node. The exemplar draws the same shape, `network-nodeport-loadbalancer client-hit` lights np1 on the frame arrival, and escapes R4 only because a chip is not a block it judges.' },

  { axis: 'R4', card: 'network-pod-localhost', where: ['4', 'eth0'],
    why: 'the same class as the `network-hostnetwork-hostport` rows above, one layer in. The inbound '
      + 'ball stops on the Pod SHELL face, which is where every endpoint on this catalog sits '
      + '(`NET.A-01`), and `lights: [\'eth0\']` cues the interface inside the shell on that '
      + 'arrival, '
      + 'so R4 matches no ball landing on the eth0 box itself. The delivery up to the app leaves one '
      + 'BEAT.afterHop later, the separation every chained hop in the catalogue uses, so the cue is '
      + 'registered before the departure it is judged against. The other shape, `eth0` in `lit`, '
      + 'says the interface is already the subject on a step the outside client opens, and it costs '
      + 'the step the one arrival beat it has: a box lit at entry does not light again when the ball '
      + 'lands.' },

  // The same class as the two `network-hostnetwork-hostport` rows above, on all six steps of one
  // card: a watch ball delivered to a Node frame under NET.A-02 lights the sender inside it, and
  // R4 cannot see a cue carried by a ball that lands on the frame instead of on the block.
  ...['1', '2', '3', '4', '6'].map(step => ({
    axis: 'R4', card: 'network-dns-pod-policy', where: [step, 'resolvConf file'],
    why: 'the watch ball is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y=260 on x=600 and never crosses the border, so the file box standing 40 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `lights` on the watch arrival at 1500ms with the file hop leaving at 1600ms, one BEAT.afterHop later. The other shape is measured and rejected: `hostFile` in `lit` closes the row, and it lights a block inside the frame 1500ms before the ball that addresses it gets there, which reads as the file answering a request nobody has sent yet. The picture wins over the row, and R4 reads a frame frozen at t=0 where no arrival cue exists yet.' })),
  { axis: 'R4', card: 'network-dns-pod-policy', where: ['5', 'Kubelet'],
    why: 'dnsPolicy None reads no file, so the Kubelet is the sender of the only hop after the watch ball, and it is cued exactly as the file box is on the other five steps: `lights` on the watch arrival at 1500ms, with the CRI hop leaving at 1600ms. The watch ball stops on the Node frame face (NET.A-02) and lands on no block, so R4 sees no arrival to credit. `kubelet` in `lit` closes the row and lights the Kubelet from 0ms, while the ball carrying the Pod spec to it is still falling.' },

  // ---------------------------------------------------------------------------------------
  // FORM-B. The queue is hundreds of rows deep and ranked by lead, so an entry here says the
  // ranking put a row high and a person read it and kept it.
  // ---------------------------------------------------------------------------------------
  { axis: 'FORM-B', card: 'network-dns-coredns', where: ['fall-through', 'cacheChip'],
    why: 'the miss is true the moment the step opens. The query reached cache in the PREVIOUS step, '
      + 'and a lookup that finds nothing is decided where the request already stands. What the ball '
      + 'of THIS step carries is the fall to the kubernetes plugin, so binding the chip to that '
      + 'arrival would say cache had not answered until the request had already left it.' },
  { axis: 'FORM-B', card: 'network-dns-coredns', where: ['fall-through', 'fwdChip'],
    why: 'the chip is a caption for the leg drawn down to forward, and that leg stands on the canvas '
      + 'from idle carrying no ball ever (`NET.A-03`). `outside zone only` states what the leg is '
      + 'FOR, which no arrival on this card produces.' },
  { axis: 'FORM-B', card: 'network-dns-coredns', where: ['answer', 'cacheChip'],
    why: 'cache holds the answer before this step opens: the climb of the previous step is what '
      + 'stores it, and that step binds the value to its own arrival. `answers within TTL` is the '
      + 'steady state the card closes on, while the ball here carries the answer OUT to the client.' },
  { axis: 'FORM-B', card: 'workloads-deployment-rollback', where: ['roll', 'condChip'],
    why: 'condChip is the Deployment own status condition, and Progressing=True is what makes the '
      + 'controller SEND the create rather than something the create produces: the template hash '
      + 'changed, no ReplicaSet carries it, and the rollout is under way before anything departs. '
      + 'The same shape as `cluster-leader-election renew v1`. This card holds no other chip back, '
      + 'because the list the create really moves is DRAWN: the register row and its connector rise '
      + 'on the arrival, which is the binding a chip would have carried.' },
  { axis: 'FORM-B', card: 'workloads-deployment-rollback', where: ['reuse', 'condChip'],
    why: 'The rollback the PREVIOUS step applies is what puts the Deployment back to '
      + 'Progressing=True, and that is why the three scale writes leave at all. No ball of this '
      + 'step produces it. What the arrival earns is the register: the whole list turns over and '
      + 'three connectors swap on the `up` beat, which is the renumber this step is about.' },
  { axis: 'FORM-B', card: 'workloads-deployment-rollback', where: ['prune', 'condChip'],
    why: 'Progressing=True with reason NewReplicaSetAvailable is the complete state the PREVIOUS '
      + 'step reaches, and it is the documented precondition of the cleanup rather than its '
      + 'result: the cleanup only starts once a Deployment reaches a complete state, so the '
      + 'condition is what lets this step happen at all. Binding it to the delete arrival would '
      + 'say a rollout completes because its oldest revision was pruned. What the arrival does '
      + 'earn is the row leaving the register with the object it named.' },
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
  { axis: 'FORM-B', card: 'workloads-graceful-shutdown', where: ['expiry', 'graceChip'],
    why: 'the window reading 0s · expired at entry is the PREMISE of the step, not something the '
      + 'ball produces: the timer reaching 0 is what makes the Kubelet send SIGKILL, so the kill '
      + 'ball leaving at BEAT.lead and landing at 1500ms is the consequence of the value already '
      + 'on screen. Binding the chip to that arrival would draw the kill causing the expiry.' },
  // workloads-controller-kinds, ten rows and one ruling. The card states all three chips at
  // step ENTRY and lights whichever ones changed, so every changed value stands for the
  // BEAT.lead 1500ms before the first ball lands. Its record carries the same reading.
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['replicas', 'identityChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether a replica has an identity. The whole strip turns over from none '
      + 'yet at once here, because this is the step where a kind is picked for the first time.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['replicas', 'countChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides what sets the count. spec.replicas is a field the reader writes on the '
      + 'Deployment, and it is true before the ReplicaSet this step draws exists at all.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['replicas', 'endChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether the work ends. A Deployment never ending is a property of the '
      + 'kind, not of the Pod the step creates.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['identity', 'identityChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether a replica has an identity. This is the step that ASKS the '
      + 'question, so the answer standing under it while the ball runs is the point of the beat.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['nodes', 'identityChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether a replica has an identity. The value winds back to none, '
      + 'interchangeable because the kind in focus changed, and a DaemonSet Pod carrying no '
      + 'identity is true before that Pod is placed.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['nodes', 'countChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides what sets the count. A DaemonSet carrying no replica number is a fact '
      + 'about the kind, and the step draws one Pod where the answer names the whole matching '
      + 'Node set.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['ends', 'countChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides what sets the count. spec.parallelism is a field on the Job, true from '
      + 'the moment the Job exists rather than from the moment its Pod does.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['ends', 'endChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether the work ends. This is the step that ASKS the question, and a '
      + 'Job stopping at completions is what the reader is shown, not what the one Pod leaving '
      + 'the Job box does.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['schedule', 'countChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides what sets the count. About one Job per tick is the schedule speaking, '
      + 'and the ball this step sends IS that tick, so the chip states the rule it then obeys.' },
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['schedule', 'endChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether the work ends. A CronJob ending once per tick is a property of '
      + 'the schedule, and it holds whether or not this particular tick has fired yet.' },

  // ---------------------------------------------------------------------------------------
  // FORM-E. Twenty six entries, twenty six findings, nothing unread: that is the state that let
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
  { axis: 'FORM-E', card: 'network-nodeport-loadbalancer', where: ['lb-provision', 'typeChip'],
    why: '`type LoadBalancer` is the REQUEST this step opens with, and the one ball of the step is '
      + 'the cloud-controller-manager provisioning the balancer in answer to it: the arrival does '
      + 'not produce the type, the type is why the ball leaves. Its neighbour `status.loadBalancer` '
      + 'waits because the address is published only once that balancer exists, which the narration '
      + 'calls asynchronous. Binding the type to the arrival would draw the controller acting on a '
      + 'Service that was still NodePort.' },
  { axis: 'FORM-E', card: 'network-client-ip-preservation', where: ['arrive', 'lSrc'],
    why: 'the left packet is what the CLIENT sent, and the address it put on its own packet is true '
      + 'before the packet moves: no arrival on this step produces it. Its neighbour `client IP` '
      + 'waits precisely because that chip states what the EDGE has observed, which is what the '
      + 'arrival produces. Winding `src` back would draw a request leaving the client carrying no '
      + 'source address at all, which is the one thing this step exists to say it does carry.' },
  { axis: 'FORM-E', card: 'network-client-ip-preservation', where: ['passthrough', 'modeChip'],
    why: '`TCP passthrough` is the CONFIGURATION the step opens with, and the one ball of the step '
      + 'is the preamble the edge prepends BECAUSE of it: the arrival does not produce the mode, the '
      + 'mode is why there is a preamble to send at all. Its two neighbours wait because both are '
      + 'what the backend receives, the preamble row and what the app reads out of it. Binding the '
      + 'mode to that arrival would draw an edge still terminating HTTP while it sends a raw stream.' },
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
      + 'Service, so it is true from the start. What the policy CAUSES waits for a beat: each rule '
      + 'set flips when its kube-proxy writes it (300) and the result waits for the local legs '
      + '(2900). The cross-node legs already stand dimmed at entry, because they are in no rule '
      + 'set under Local, so binding the chip alone would leave it reading Cluster over a picture '
      + 'that is already the Local one.' },
  { axis: 'FORM-E', card: 'network-external-traffic-policy', where: ['local', 'modeChip'],
    why: 'externalTrafficPolicy Local is the FIELD the operator sets, and it is the premise of the '
      + 'step: both connections are drawn under it, so it is true before either ball leaves. What the '
      + 'policy CAUSES waits for a beat, `client src IP` on the served connection landing on Node-1 '
      + 'and the three shares on the dropped one landing on Node-3. Binding the policy to an arrival '
      + 'would draw the first connection served locally while the chip still reads Cluster.' },
  { axis: 'FORM-E', card: 'network-external-traffic-policy', where: ['local', 'hcChip'],
    why: 'healthCheckNodePort is allocated by the API server in the same write that sets the policy '
      + 'to Local on a LoadBalancer Service (the Source IP tutorial: `You should immediately see the '
      + 'service.spec.healthCheckNodePort field allocated`), so no ball of this step produces it. '
      + 'The narration says so: the field is allocated, and the balancer has not acted on it yet.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['match', 'focusChip'],
    why: 'focusChip is named `focus` and every step of this card writes it as a caption of what that '
      + 'step is DOING, not as object state. Here it reads `list Nodes, match the selector`, which '
      + 'is the action the step opens with rather than anything the answer produces. What the Node '
      + 'list actually earns is desiredNumberScheduled, and that is the one chip this step holds '
      + 'back and turns over on the arrival at 1500ms.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['place', 'focusChip'],
    why: 'The same argument as `match focusChip` above, on the same card. Here the caption states '
      + 'the controller RULE the narration states in words, one Pod per matching Node, which is '
      + 'true before any create is issued. What the three creates earn is currentChip and '
      + 'readyChip, and those are exactly the two the step steps up one arrival at a time.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['label', 'focusChip'],
    why: 'The same argument again. `a label makes a Node eligible` is the RULE the step exists to '
      + 'demonstrate, and the label itself is on the frame from 0ms: the roster caption on Node-4 '
      + 'cross-fades to logging=enabled before the controller has watched anything. What the two '
      + 'arrivals earn are the three counters, desiredNumberScheduled on the watch and the two Pod '
      + 'counts on the create, and all three are held back to their own beat.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['update', 'focusChip'],
    why: 'The same argument as `match focusChip` above, on the same card. Here it names the strategy '
      + 'the DaemonSet object already carries, RollingUpdate with maxUnavailable=1, which is a field '
      + 'set before any Pod is deleted rather than a value the rollout produces. What the arrival '
      + 'earns is numberReady, and that is the one chip this step holds back.' },
  { axis: 'FORM-E', card: 'workloads-daemonset', where: ['node-removed', 'focusChip'],
    why: 'The same argument again, on the last step of the same card. Node-2 being gone is the '
      + 'PREMISE the API reports and the reason the delete goes out at all, so it stands before '
      + 'anything departs. What the two arrivals earn are the three counters, which this step steps '
      + 'up on the watch and on the delete.' },
  { axis: 'FORM-E', card: 'workloads-finished-job-cleanup', where: ['finished', 'clockChip'],
    why: 'clockChip is the controller reading `now`, and 12:00:31 is the instant the containers '
      + 'exit, which this step draws as the two Pod pulses at 0ms. The ball is the exit REPORT '
      + 'travelling from the Node up to the Job, and what it earns is the three chips this step '
      + 'already holds back, the completion stamp, the eligibility it implies and the Job status. '
      + 'Binding the clock to that arrival would say the wall clock advances because a report '
      + 'landed.' },
  { axis: 'FORM-E', card: 'workloads-finished-job-cleanup', where: ['expire', 'clockChip'],
    why: 'The clock passing 12:02:11 is the PREMISE of this step and the reason the ball leaves at '
      + 'all: the controller compares its own clock against the stored stamp and only then issues '
      + 'the delete. Winding it back would draw a controller that deletes first and reaches the '
      + 'deadline afterwards, which inverts the one comparison the card is about. What the arrival '
      + 'earns is statusChip, and that is the chip this step holds back.' },
  { axis: 'FORM-E', card: 'network-proxy-rule-resync', where: ['immediate', 'floorChip'],
    why: 'minSyncPeriod is a CONFIGURATION FIELD the operator set before anything happened, and the '
      + 'step opens on it in words: `With minSyncPeriod set to 0s kube-proxy resyncs immediately`. '
      + 'The 0s is the premise the whole step reasons from, not something the write produces, and '
      + 'the write is its consequence. What the arrival earns on this step is updateChip, the count '
      + 'of kernel updates that setting costs, and that is the chip this step holds back. Winding '
      + 'the floor back would draw a card whose configuration changes when a rule is written.' },
  { axis: 'FORM-E', card: 'network-proxy-rule-resync', where: ['batched', 'floorChip'],
    why: 'The mirror of `immediate floorChip` and the same argument: the default 1s floor is the '
      + 'premise this step reasons from, and its narration opens on it. updateChip is the outcome '
      + 'the write earns and is what this step defers.' },
  { axis: 'FORM-E', card: 'network-pod-egress-snat', where: ['reply', 'srcChip'],
    why: 'The reply is a packet the SERVER sent, so its source is 1.1.1.1 from the moment it leaves '
      + 'the Internet box, which is where this step opens. No arrival on this step produces it: the '
      + 'one ball crosses back to the Node carrying that source the whole way. Its two neighbours '
      + 'wait for a beat because both are what the arrival EARNS, the destination being rewritten '
      + 'back and the entry being reversed, and that split is the sentence the step makes. Binding '
      + 'this one to the arrival would claim the server address appears when the reply reaches the '
      + 'Node rather than when the server chose it.' },
  { axis: 'FORM-E', card: 'network-pod-egress-snat', where: ['reply', 'ruleChip'],
    why: 'The narration of this step is `the reply walks no rule at all`, so `none, conntrack only` '
      + 'is the premise the step reasons from and is true for its whole length rather than at a '
      + 'moment inside it. The card has the deferral technique and applies it to the two chips the '
      + 'arrival does earn. Deferring this one would leave the step reading MASQUERADE for its '
      + 'first 700ms, which is the claim the step exists to deny.' },
  { axis: 'FORM-E', card: 'network-mtu-overhead', where: ['path', 'wireChip'],
    why: 'The size of the frame is settled where the frame is BUILT, inside Pod A, so 1500 B is '
      + 'true from the moment the step opens and the 100 over half of it is a comparison against '
      + 'the limit the first line of the narration states. Its two neighbours wait for a beat '
      + 'because both are what the refusal EARNS: the ICMP exists only once the hop has dropped the '
      + 'datagram, and the Node estimate moves only once that reply lands on the Node. That split IS '
      + 'the sentence of the step, a frame that was always this size meeting a limit nobody on the '
      + 'Node knew about. Deferring this one to the arrival would say the hop decided how big the '
      + 'frame was, and would leave the strip reading 114 B from the previous ping while the bar on '
      + 'the third measure row is already drawn at full length under it.' },
  { axis: 'FORM-B', card: 'workloads-finished-job-cleanup', where: ['watch', 'clockChip'],
    why: 'The third and last reading of the same clock on this card, and the same argument the two '
      + 'FORM-E entries above carry. '
      + '12:00:44 is simply where the wall clock stands while the controller watches, 13 seconds '
      + 'past the completion stamp and well short of the deadline, which is the point the step '
      + 'makes: nothing is due yet. The ball is the watch EVENT going out to the controller, and '
      + 'what it earns is ctrlEl lighting on arrival. Binding the clock to that arrival would say '
      + 'time advances because a watch event landed, and it would also make the one chip that must '
      + 'move independently of the traffic look like traffic.' },
  // network-cni-invocation, three rows and one ruling. CNI op is a STEP-SCOPED label naming the
  // operation in flight, not the result of a hop, so it is stated at entry on every step that
  // changes which operation the picture is about.
  { axis: 'FORM-B', card: 'network-cni-invocation', where: ['sandbox', 'opChip'],
    why: 'CNI op names the operation in flight, and on this step the answer is that there is none: '
      + 'not called yet is TRUE from the moment the step opens, because the whole point of the '
      + 'sandbox step is that the plugin list has not run. Neither ball carries it. RunPodSandbox '
      + 'goes Kubelet to runtime and create netns goes runtime to sandbox, and what those arrivals '
      + 'earn is the runtime lighting and the Pod pulsing. The two chips that ARE results on this '
      + 'card, the address on delegate and ADD ok on result, both wait for their arrivals through '
      + 'a rewind and an F.set, and neither is on this queue.' },
  { axis: 'FORM-B', card: 'network-cni-invocation', where: ['exec', 'opChip'],
    why: 'ADD is the operation this step NAMES rather than one its ball produces: the runtime sets '
      + 'CNI_COMMAND=ADD before it execs anything, which is what the narration says in words, so '
      + 'the value is true at the departure and not at the arrival. What the exec ball earns is the '
      + 'bridge row it lands on. Binding the chip to that arrival would say the plugin decided '
      + 'which operation it was being run for.' },
  { axis: 'FORM-B', card: 'network-cni-invocation', where: ['join', 'opChip'],
    why: 'DEL on delete is a P-02 conditional rather than an operation in flight, and the qualifier '
      + 'is what keeps the frame legal under T-35: a reader seeing only this frame cannot conclude '
      + 'DEL has run. The one ball here is the Kubelet starting the app containers into the '
      + 'namespace that is already wired, which has nothing to do with delete, so there is no '
      + 'arrival to bind it to. Carrying ADD ok forward instead leaves the canvas silent about the '
      + 'half of the step that narrates DEL.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['encap', 'outerChip'],
    why: 'the wrap is made inside cni1 on Node-1 BEFORE the one ball of this step departs, so the '
      + 'outer header exists at the moment the step opens. The single F.route IS the wrapped packet '
      + 'crossing the underlay, and its 1244ms arrival is that packet reaching Node-2, which is a '
      + 'different event: what it earns is cni2 lighting. Binding the outer slot to it would say '
      + 'Node-2 wrote the header it is receiving. The narration is in that order too, wraps first '
      + 'and crosses the underlay last.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['encap', 'encapChip'],
    why: 'VXLAN/UDP 8472 is the same premise read from the other side: the encapsulation is chosen '
      + 'and applied by cni1 before the ball leaves, and the packet on the underlay lane is already '
      + 'the encapsulated one. The arrival on cni2 is the wrapped packet landing, not the wrap '
      + 'being decided. inner src/dst is the chip this step deliberately leaves uncued, because it '
      + 'reports the one thing the wrap does not touch.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['decap', 'outerChip'],
    why: 'stripped is the state this step OPENS in. The underlay crossing finished on the previous '
      + 'step, so the kernel of Node-2 strips the outer headers on receipt and the one ball drawn '
      + 'here is the bare inner frame already on its veth hop into Pod B. That 700ms arrival earns '
      + 'the Pod B pulse, and binding the outer slot to it would say Pod B did the stripping.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['decap', 'encapChip'],
    why: 'encap returning to none is the same receipt event as stripped beside it, true before the '
      + 'frame starts moving: the packet on the veth carries no encapsulation, which is exactly why '
      + 'it can be bridged into a Pod. The alternative is to hold VXLAN/UDP 8472 on screen while '
      + 'the frame the canvas is drawing has no such header.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['routed', 'modeChip'],
    why: 'routed · BGP is the PREMISE of the closing step and not a result inside it: the step '
      + 'opens by naming a different plugin, and all five flow entries are drawn under that premise '
      + 'from t=0. The 1500ms first arrival is Pod A frame reaching cni1 over the veth, and what it '
      + 'earns is cni1 lighting. Bound to that beat the strip would say a veth hop chose the '
      + 'dataplane mode, and the two steps before it would have been running in an unnamed one.' },
  { axis: 'FORM-B', card: 'network-pod-to-pod-cross-node', where: ['routed', 'outerChip'],
    why: 'none here reports that no wrap is EVER made on this path, which is true of the frame from '
      + 'its first millisecond rather than at any arrival. It is cued because it is a different '
      + 'fact from the stripped before it, an absence by construction against an absence after a '
      + 'removal, and that distinction is the whole reason the step exists. No single hop of the '
      + 'three earns it, since it holds equally on all of them.' },
  { axis: 'FORM-B', card: 'network-mtu-overhead', where: ['small', 'wireChip'],
    why: '114 B is the SIZE OF THE FRAME the step sends, which is settled when Pod A builds it and '
      + 'not by anything the ball reaches. The four arrivals of this step earn the underlay hop '
      + 'lighting and the two Pod pulses, and binding the size to one of them would say the hop '
      + 'decided how big the ping was. The bar drawn on the third measure row is the same premise '
      + 'in the picture, and it is revealed at the departure for the same reason.' },
  { axis: 'FORM-B', card: 'network-mtu-overhead', where: ['blackhole', 'icmpChip'],
    why: 'filtered is the PREMISE the step opens with, a firewall that drops ICMP, and this step '
      + 'draws no arrival at all: the two balls are the frame and its retransmission going out, and '
      + 'the return lane is deliberately empty. There is nothing for the value to wait for, and '
      + 'waiting is exactly what the step is about.' },
  { axis: 'FORM-B', card: 'network-mtu-overhead', where: ['blackhole', 'pmtuChip'],
    why: '1500 · stale follows from the filtering in the same instant and from no event on the '
      + 'canvas: the estimate is stale precisely BECAUSE nothing arrives to correct it. The card '
      + 'has no beat to bind it to, which is the finding and the subject at once.' },
  { axis: 'FORM-B', card: 'network-mtu-overhead', where: ['clamp', 'icmpChip'],
    why: 'not needed is what the clamp MEANS, so it is true the moment the step opens and is the '
      + 'reason the step exists: the fix works without the reply the two steps before it waited for. '
      + 'Neither arrival could earn it, since both are the clamped frame travelling and arriving is '
      + 'not what makes an ICMP unnecessary. It is cued because filtered to not needed is a real '
      + 'move and the step that makes it is this one.' },
  { axis: 'FORM-B', card: 'network-mtu-overhead', where: ['clamp', 'wireChip'],
    why: 'the clamp is a rule already standing on the path when the step opens, so the segment is '
      + 'built at 1400 from its first millisecond. The two arrivals here are the frame reaching the '
      + 'hop and then Pod B, and what they earn is the hop lighting and Pod B pulsing: the frame '
      + 'does not become 1400 bytes by arriving anywhere.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['no-match', 'labelsChip'],
    why: 'every failure step opens on a STATE the call runs into (T-21): nothing on the canvas '
      + 'relabels the Pod, so app=web-v2 is true before the client dials. The ball reaching the '
      + 'Service edge earns the Service lighting, not the labels.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['no-match', 'servingChip'],
    why: 'the empty serving set follows from the mismatch in the same instant, before any call. The '
      + 'ball ending at the Service edge shows the consequence and cannot be what empties the slice.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['not-ready', 'readyChip'],
    why: 'the failing readiness is the premise of the step, standing before the call. Readiness '
      + 'gating itself is animated by network-endpointslice-reconcile, which this card cedes it to.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['wrong-port', 'listenChip'],
    why: 'the container listens on 8080 before the client dials: a state, not an arrival. The ball '
      + 'reaching the Pod edge unanswered is the consequence the chip explains.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['named-port', 'servingChip'],
    why: 'the slice resolves the named port when the Service is written, not when a call lands, so '
      + '10.244.2.7:8080 is true from the first millisecond. The delivered tag rides that value.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['named-port', 'targetChip'],
    why: 'targetPort http is the Service spec the step opens on. No arrival writes a spec field.' },

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
    why: 'a raw TCP stream carries no HTTP header, so the row empties on BOTH packets because this '
      + 'mode HAS none rather than because anything cleared it. The news of the step is the '
      + 'preamble row, what the app reads and the mode, and all three are lit' },
  { axis: 'R2-STEP', card: 'network-client-ip-preservation', where: ['5', 'client IP'],
    why: 'the address is recovered on the xff step and recovered again here, by a different '
      + 'mechanism. `trusted hop only` is the caveat the forge step adds, and this step is not '
      + 'about trust, so the value returns to the steady reading the card has already given. A cue '
      + 'would say the preamble recovered an address the header had lost. The two rows that DID '
      + 'change, the preamble and what the app reads, are the ones lit' },
  { axis: 'R2-STEP', card: 'network-service-debugging', where: ['3', 'Pod labels'],
    why: 'the labels go BACK to the healthy app=web once the no-match aside is over. The news of '
      + 'not-ready is the Ready chip turning False, and that chip is lit. A cue here would say the '
      + 'labels broke again' },
  { axis: 'R2-STEP', card: 'network-service-debugging', where: ['4', 'Pod Ready'],
    why: 'the Pod is Ready again, a restoration. wrong-port is diagnosed by WHICH ROW lights: the '
      + 'port row is lit and the slice row stays dark, and lighting this chip would light both rows' },
  { axis: 'R2-STEP', card: 'network-service-debugging', where: ['4', 'serving'],
    why: 'same restoration, the endpoint the healthy step served' },

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
  { axis: 'CENTRE-LOW', card: 'network-dns-coredns', where: [],
    why: 'the block that balances this card is the one the rule cannot count. CENTRE-LOW reads only '
      + 'what sits BELOW the panel bottom of one viewport, 143 at 1600x1000, and the API server '
      + 'block stands at 60..140 in the band the panel leaves free on the right (`L-01`), which is '
      + 'where the card puts it on purpose: it carries the composition out to x=1130 and closed the '
      + 'CENTRE finding this card used to hold. The five blocks the rule does see span 70..852. At '
      + 'the narrower viewports the panel is deeper still, 171.42 and 204.97, so the block stays '
      + 'above the line on every one of them and no reading of this metric can ever include it. '
      + 'Dropping it under 143 to be counted re-opens the empty top band it was added to fill.' },
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
  { axis: 'CENTRE', card: 'network-loadbalancer-direct-to-pods', where: [],
    why: 'the chip strip reads off centre because `L-17` pools the two nodePort chips under the Pods, '
      + '134..366 and 834..1066, with the two readouts in the top right corner, 780..1120, so the pool '
      + 'spans 134..1120 on centre 627. The drawn extent measures 80..1120 on centre 600: the two Node '
      + 'frames mirror about the spine on x 600. The readouts stand top right because it is the one '
      + 'corner the narration panel leaves free, and mirroring them top left would put them under it.' },
  { axis: 'CENTRE', card: 'network-external-traffic-policy', where: [],
    why: 'the chip strip reads 94..1088 on centre 591 because `L-17` pools the three share chips '
      + 'under the Pods, 94..664, with the Service strip. The strip itself is four 232 chips at a 16 '
      + 'gap across 112..1088, centred on 600 by construction, and the Node row spans 80..1120. The '
      + 'share chips sit under Pods that stand on two Nodes of three because Node-3 runs none, which '
      + 'is the subject: a share chip on Node-3 would be a readout for a Pod that does not exist.' },
  { axis: 'CENTRE-LOW', card: 'network-external-traffic-policy', where: [],
    why: 'the six blocks below the panel are the three Pods and their inner boxes, 94..664 on centre '
      + '379, since frames and chips are not counted. Two Pods on Node-1, one on Node-2 and none on '
      + 'Node-3 is the uneven spread the card exists to price, and centring the Pods means moving one '
      + 'onto Node-3, which removes both the drop and the imbalance. The drawn extent is 80..1120.' },
  { axis: 'CENTRE', card: 'network-gateway-api', where: [],
    why: 'the chip strip is the condition column, 424..900 on centre 662, each chip on the row of the '
      + 'object that reports it, 28 left of the ladder at 928..1160, with the ReferenceGrant centred '
      + 'under it. The drawn extent 40..1160 is centred on 600 and so is the proxy Pod on the rail. A '
      + 'column centred on 600 would start at 362, behind the panel wall at every height it occupies, '
      + 'and a bottom strip would lose the row alignment that ties a condition to its object' },
  { axis: 'CENTRE', card: 'network-gateway-traffic-splitting', where: [],
    why: 'the chip column spans 564..924 on centre 744 because it stands in the gap between two '
      + 'Service frames of unequal width, 40..484 for three Pods and 1004..1160 for one, and the drawn '
      + 'extent 40..1160 is centred on 600. Moving the column to 600 puts it over the web-v1 frame, '
      + 'and equalising the frames means drawing web-v2 with Pods it does not have or web-v1 with '
      + 'fewer, which removes the 3 against 1 the split is argued against.' },
  { axis: 'CENTRE', card: 'network-headless-service', where: [],
    why: 'the chip strip is the answer COLUMN, 760..1160 on centre 960, standing beside the discovery '
      + 'column at 444..676 with its rows level with the EndpointSlice and CoreDNS, and the drawn extent '
      + '60..1160 is centred on 610. A column centred on 600 would start at 400, on top of the '
      + 'discovery column the answer is derived from, and splitting it breaks the one set of records the '
      + 'card is about.' },
  { axis: 'CENTRE', card: 'network-externalname', where: [],
    why: 'the report reads the three chips as one strip spanning 454..1140 on centre 797, and they '
      + 'are two placements rather than a strip: the SNI and cert pair stands under the host it '
      + 'describes, and the endpoint row is a field inside the slice frame. Centring them on 600 '
      + 'breaks both bindings, which is the whole reading of the card.' },
  { axis: 'CENTRE-LOW', card: 'network-ipam-pod-cidr', where: [],
    why: 'the four blocks below the overlay span 130..700 on centre 415, and the rule cannot see '
      + 'Node frames, so what it measures is the two Pods. Those sit in Node-1 and Node-2 because '
      + 'the narration names those two Nodes: moving either Pod to Node-3, reordering the Nodes or '
      + 'inventing a third Pod each makes the card say something different. The composition itself '
      + 'is centred, three equal frames spanning 80..1120 under a control-plane column on their '
      + 'common centre line, and `L-17` is why the rule cannot close.' },
  { axis: 'CENTRE', card: 'network-service-cidr', where: [],
    why: 'the chip column spans 700..1140 on centre 920. It is a COLUMN by design and the lever no '
      + 'sibling here carries: centring it on 600 means either a strip across the width, which is '
      + 'the house reading this card exists to leave, or moving the range stack into the middle and '
      + 'putting the ladder over the allocation flow. There is no room to slide it either, since a '
      + '440 wide strip centred on 600 runs 380..820 at CHIP_Y0 510 and that band already holds '
      + 'Service web at 304..536 and the ETCD cylinder at 130..270.' },
  { axis: 'CENTRE-LOW', card: 'network-service-cidr', where: [],
    why: 'the three blocks the rule sees below the panel span 130..536 on centre 333: the ETCD '
      + 'cylinder 130..270, the API block 304..536 and Service web 304..536. The store stands left '
      + 'because that is the face the write leaves from without a corner budget, and the two actor '
      + 'blocks share one centre line because that is what makes the claim and the answer verticals. '
      + 'The rule counts neither the chain nor the chips, which are the parts that balance those '
      + 'three, and the drawn bodies span 130..1140 on centre 635. `L-17`.' },
  { axis: 'CENTRE', card: 'network-service-terminating-endpoints', where: [],
    why: 'the three chips read as a strip spanning 74..366 on centre 220, and they are the ROWS of '
      + 'the slice frame and take its column. Centring them means moving the slice off the line '
      + 'kube-proxy reads it on, or stretching the rows past their own frame. The ruler under them '
      + 'spans 60..1140 and centres on 600.' },
  { axis: 'CENTRE', card: 'network-service-types', where: [],
    why: 'the chip column spans 908..1140 on centre 1024, and it is a column beside the stack on '
      + 'purpose, reading the Service fields next to the layers they describe. Centring it puts it '
      + 'on the spine, and a bottom strip has no room because the Node frame reaches 624.' },
  { axis: 'OCCLUDED', card: 'cluster-resource-quota', where: ['ReplicaSet web'],
    why: 'the ReplicaSet box starts at 340 and the panel reaches 396.55 at 1100x800 and 377.76 at '
      + '1280x860, so its left BORDER is behind the panel on the two smaller viewports, by 56.55 '
      + 'and 37.76 of a 232 box. The cost is visible rather than numerical and no TEXT is lost, '
      + 'both its strings being centred on 456 and inking 411.2 at the earliest. Held open because '
      + 'centring the pair exactly is the requirement and the panel is the thing in the way: `RS_X` '
      + 'is `600 - 28 - 232` and there is no term in it to move, so closing it means giving up '
      + 'either the exact centre or the family 232.' },
  { axis: 'CENTRE', card: 'workloads-crashloopbackoff', where: [],
    why: 'the chip strip the metric pools is the four value chips alone, in the left column '
      + '98..540, because the instrument beside them is naked rects and not `.scheme-chip`. '
      + 'The old ladder of chain rows at 660..1140 used to pull the pooled strip onto 600, and the '
      + 'card was no better centred for it. The content bbox itself centres: the frame spans '
      + '98..1102 on WL.CX by construction and the instrument 580..1102 balances the column. Closing it means a chip strip '
      + 'straddling 600 under a panel that reaches 396.55, which is the 79-collision shape '
      + '`WL.L-05` refuses.' },
  { axis: 'CENTRE', card: 'workloads-pod-startup-conditions', where: [],
    why: 'an artefact of what the metric can SEE: `L-17` drops frames and chips, and this card '
      + 'draws its staircase and its rail as `.scheme-chip`, so the two blocks that span 60..1140 '
      + 'and centre the picture on 600 are invisible to it. What is left to measure is the Pod, the '
      + 'two actor boxes and the frame. Closing it means widening the frame back over 1080 of empty '
      + 'band, which `L-16` refuses.' },
  { axis: 'CENTRE', card: 'workloads-replicaset', where: [],
    why: 'the pooled strip is the three value chips alone and the RIGHT column is the only place '
      + 'they fit, so its centre is the column centre by construction. Three things pin them '
      + 'there: the left column at this y is under the panel, which measures x<=396.55 and '
      + 'y<=329.20 at 1100x800, a bottom strip has nowhere to go because the two ownership bands '
      + 'own 344..618 of a 624 canvas, and a strip straddling 600 would be crossed by the trunk, '
      + 'which runs down x=600 from 120 to the bus at 372 through exactly the band the chips '
      + 'occupy. The content bbox itself centres and is not reported.' },
  { axis: 'CENTRE', card: 'workloads-force-deletion', where: [],
    why: 'the pooled strip is the four value chips alone, and they are a COLUMN in `LAYOUT.B.chips` '
      + 'at 60..540, so its centre is the column centre by construction. The card carries no ladder '
      + 'in the right column to pool against it: the right band holds the record slot, whose bottom '
      + 'at 280 is above the chips and which `L-17` counts as content rather than as strip. Closing '
      + 'it means a bottom strip, and `WL.L-05` measures four values of this length two across at '
      + '532 wide against strings that overflow it, which is the 79 collisions. The content bbox '
      + 'itself centres on 600 and is not reported.' },
  { axis: 'CENTRE', card: 'workloads-cronjob', where: [],
    why: 'the probe counts four Job slots and the CronJob box, which span 60..827 on centre 444, '
      + 'and is blind to the three strips that centre the picture: the axis, the seven slot cells '
      + 'and the chip strip each span 60..1140 on 600 with margins of 60 and 60. `L-17` drops the '
      + 'chips, and the axis and the cells are `P.raw` with no painted class because a 2 unit rule '
      + 'is not a block. Only four of the seven ticks produce a run, and they are the first four '
      + 'because a schedule reads left to right and what goes wrong comes after what works. '
      + 'Closing it means either reordering the row, which puts the prune before the fourth '
      + 'success, or drawing the four empty cells as `P.box`, which draws four ticks that produced '
      + 'nothing as four components that exist.' },
  { axis: 'CENTRE-LOW', card: 'workloads-cronjob', where: [],
    why: 'the same eight blocks as the CENTRE row on this card, 60..827 on centre 444, because '
      + 'everything this card draws stands below the panel and there is no second population to '
      + 'measure. The trade that would close it is priced on the CENTRE row.' },
  { axis: 'CENTRE-LOW', card: 'workloads-pod-resize', where: [],
    why: 'the composition leans right because the API sits on WL.SPINE_X and kubectl is therefore '
      + 'to its RIGHT, which is the reversal `LAYOUT` argues and measures: kubectl on the left '
      + 'leaves the API at 708..940 and the drop into the frame then needs a jog to reach the frame '
      + 'top face midpoint at 600. What the metric reads is the consequence, 5 blocks spanning '
      + '390..1140 on centre 765, and the band x 60..484 between the panel and the frame stands '
      + 'empty on every step. Two routes were costed and both MOVE the hole rather than close it. '
      + 'Putting kubectl on the left at 196..428 centres the actor row on 456 and leans the row the '
      + 'other way while the verdict pair at 840..1140 is then the only thing on the right. Pulling '
      + 'the chip strip up into the 424 x 114 band at 60..484 / 280..394 fits on width, the longest '
      + 'row measuring 82.7 of name plus 282.5 of value, and empties the 548..624 strip instead, '
      + 'against a CHIPS_Y 548 that four sibling cards carry as LAYOUT.C.strip.two. CENTRE-LOW also '
      + 'judges against the panel bottom of ONE viewport, 177.44 at 1600x1000, and the blind-spot '
      + 'block below says so itself: at the worst-of-three bottom, 279.51, the finding drops.' },
  { axis: 'CENTRE-LOW', card: 'workloads-statefulset-update-strategy', where: [],
    why: 'the 4 blocks below the panel are the two Pod slots and their inner boxes and nothing '
      + 'else, spanning 60..360 on centre 210 against a want of ~600. The right half of that band '
      + 'holds a chain and a chip strip and CENTRE-LOW counts neither, so the metric is reading '
      + 'half the picture. Closing it means moving the window to the middle, which puts the content '
      + 'bbox centre at 800 and opens a CENTRE finding instead, on the rule with the wider reach: '
      + 'CENTRE reads 0 findings on this card today because the actor row carries the bbox out to '
      + 'WL.R. Trading a clean CENTRE for a clean CENTRE-LOW is the L-16 case exactly. The record '
      + 'carries the same argument under OPEN.' },
  // CENTRE fires TWICE on this card, on the pooled strip and on the content bbox, and `where: []`
  // gives both rows one key, so carriedMap keeps one reason and it has to answer both.
  { axis: 'CENTRE', card: 'network-pod-ip-and-veth', where: [],
    why: 'both rows are the same column read from two sides. The chip strip the metric pools IS a '
      + 'column, at 60..360 on centre 210, and the column is the composition rather than a '
      + 'placement: a wide strip would run straight through the namespace boundary at x=760 that '
      + 'the whole card is built on, and would read as four independent readouts where these four '
      + 'are facts about ONE object, so closing that row means taking the strip 5 of the other 6 '
      + 'cards in this section take. The CONTENT lean, 420..1140 on centre 780, is what is left '
      + 'once `L-17` drops those same chips. Measured with them, the card spans 60..1140 and '
      + 'centres on 600 exactly, with margins of 60 and 60. The diagram sits right of x=420 '
      + 'because the panel measures 396.55 wide and `L-03` allows nothing left of that line above '
      + 'the panel bottom, so the only way to drag the bbox back to 600 is to put blocks in the '
      + 'gutter the column already fills.' },
  { axis: 'CENTRE-LOW', card: 'network-pod-ip-and-veth', where: [],
    why: 'the same six blocks as the CENTRE content row, 450..1110 on centre 780, with the frame '
      + 'wall left out and the chip column still uncounted. CENTRE-LOW also judges against the '
      + 'panel bottom of ONE viewport, 143 at 1600x1000, and this card measures 204.97 at 1100x800, '
      + 'which is the blind spot the block below this one states about itself.' },

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
  { axis: 'A-05', card: 'network-ebpf-dataplane', where: ['[[672,312],[796,312],[796,442],[920,442]]'],
    why: 'TO_PODY, the ALTERNATIVE backend of the map lookup. network/CARDS/network-ebpf-dataplane.md: '
      + '"TO_PODY carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the '
      + 'map lookup picked one of two, and the card says so in words. N destinations, N wires." '
      + 'NET.A-03.' },
  { axis: 'A-05', card: 'network-headless-service', where: ['[[176,372],[176,596],[1044,596],[1044,544]]'],
    why: 'TO_POD[2], the leg to web-2. network/CARDS/network-headless-service.md: "TO_POD[2], the '
      + 'lane to web-2, rides nothing. N destinations get N wires so the reader can see the client picked '
      + 'one of three." '
      + 'NET.A-03, and the record two cards down names this one as the precedent for the nodeport '
      + 'fan.' },
  { axis: 'A-05', card: 'network-nodeport-loadbalancer', where: ['[[536,216],[536,320]]'],
    why: 'TO_N2. network/CARDS/network-nodeport-loadbalancer.md: "The balancer legs `TO_N2` and '
      + '`TO_N3` carry no ball. The balancer targets the node port on EVERY Node, so all three legs '
      + 'exist for the reader to see that it picked Node-1 among drawn alternatives." NET.A-03. '
      + 'Node-2 is still reached by a ridden lane, the direct one, which is not this leg.' },
  { axis: 'A-05', card: 'network-nodeport-loadbalancer', where: ['[[652,146],[970,146],[970,320]]'],
    why: 'TO_N3, the other half of the same pair and the same record entry. Which of the three legs '
      + 'a step takes is the arbitrary part, and drawing only the taken one would make the '
      + 'arbitrary look like the only. NET.A-03.' },
  { axis: 'A-05', card: 'network-traffic-distribution', where: ['[[588,320],[700,320],[700,236],[740,236]]'],
    why: 'FAN_A2. network/CARDS/network-traffic-distribution.md: "FAN_A2 carries no ball on its step. It '
      + 'is the endpoint the traffic distribution did NOT pick, and the point of the card is that '
      + 'the choice was made '
      + 'among the drawn candidates rather than forced." NET.A-03.' },
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
