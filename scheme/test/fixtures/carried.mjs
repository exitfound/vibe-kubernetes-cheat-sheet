// The one store of report findings a person has read, ruled on and kept. Every entry needs a `why`
// (present tense, S-48), stays printed as CARRIED, and goes stale when it matches nothing.
// `node fixtures/carried.mjs [axis]` prints it. No module-level imports: gate fixtures pull it in.

// Each axis, the file that reads it and what `where` holds. `gate` names the mandatory test that
// also reads it, where a key that cannot match lets a finding through.
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

const ENTRIES = [

  // R2-ENTRY: mostly the frozen-sample class, where a value turned over mid-step first shows one step late.
  { axis: 'R2-ENTRY', card: 'network-nodeport-loadbalancer', where: ['4', 'loadBalancer'],
    why: 'not a change on client-hit: the address is written by the F.set on the provisioning arrival '
      + 'of lb-provision, which lights the chip there, and a frame frozen at t=0 of lb-provision reads '
      + 'the rewind value none. R2-STEP, off the settled step, reports nothing' },
  { axis: 'R2-ENTRY', card: 'network-loadbalancer-without-cloud', where: ['2', 'loadBalancer'],
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

  // Both Follower log chips are drawn `log/commit`, so one key per step covers l2 and l3.
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

  // Cluster, the frozen-sample class. Do not light the chip on the keyed step, nothing happens to it there.
  ...[
    ['cluster-node-registration', '3', 'metadata.name', 'step 2 `register` writes Node-1 on the `post` arrival'],
    ['cluster-node-registration', '4', 'status.addresses', 'step 3 `status` writes the InternalIP on the `put` arrival'],
    ['cluster-node-registration', '4', 'status.capacity', 'step 3 `status` writes the capacity on the `put` arrival, with the addresses'],
    ['cluster-node-registration', '4', 'status.nodeInfo', 'step 3 `status` writes the nodeInfo on the `put` arrival, with the addresses'],
    ['cluster-node-registration', '6', 'Ready', 'step 5 `ready` writes True · KubeletReady on the `ok` arrival'],
    ['cluster-node-registration', '6', 'Taint', 'step 5 `ready` clears the not-ready taint on the `ok` arrival, with Ready'],
    ['cluster-node-conditions', '3', 'MemoryPressure', 'step 2 `pressure` writes True with its taint on the `taint` arrival'],
    ['cluster-node-conditions', '3', 'DiskPressure', 'step 2 `pressure` writes True with its taint on the `taint` arrival'],
    ['cluster-node-conditions', '3', 'PIDPressure', 'step 2 `pressure` writes True with its taint on the `taint` arrival'],
    ['cluster-node-conditions', '3', 'NetworkUnavailable', 'step 2 `pressure` writes True with its taint on the `taint` arrival'],
    ['cluster-node-conditions', '4', 'effect on Pods', 'step 3 `not-ready` writes the eviction clause on the `taint` arrival'],
    ['cluster-node-conditions', '5', 'Ready', 'step 4 `unreachable` writes Unknown · unreachable on the `taint` arrival'],
    ['cluster-taints-tolerations', '2', 'Node-1 taints', 'step 1 `taint` writes NoSchedule on the `patch` arrival, the pair `cluster-node-failure 5 Taint` calls identical'],
    ['cluster-taints-tolerations', '2', 'effect in force', 'step 1 `taint` writes NoSchedule on the `patch` arrival, with the taint'],
    ['cluster-image-container-gc', '5', 'imagefs usage', 'step 4 `max-age` writes 58 percent on the `del` arrival'],
    ['cluster-image-container-gc', '5', 'images on disk', 'step 4 `max-age` writes 2 on the `del` arrival, with the usage'],
    ['cluster-node-restart', '5', 'Node condition', 'step 4 `recreate` writes Ready on the `start` arrival'],
    ['cluster-node-restart', '5', 'Taint', 'step 4 `recreate` clears the not-ready taint on the `start` arrival, with the condition'],
    ['cluster-pod-cgroup-hierarchy', '6', 'cpu.weight', 'step 5 `leaf` writes 35 on the `write` arrival'],
    ['cluster-node-drain', '2', 'spec.unschedulable', 'step 1 `cordon` writes true · SchedulingDisabled on the `acked` arrival'],
    ['cluster-node-pressure-eviction', '3', 'MemoryPressure', 'step 2 `condition` writes True on the `patch` arrival'],
    ['cluster-pod-sandbox-cri', '2', 'sandbox id', 'step 1 `sandbox` writes pause-7f3a on the `run` arrival, where the sandbox appears'],
    ['cluster-pod-sandbox-cri', '3', 'Pod IP', 'step 2 `cni` writes 10.244.1.5 on the `conf` arrival'],
    ['cluster-scheduler-decision', '2', 'queued pod', 'step 1 `queue` writes the Pod on the `watch` arrival, where it enters the queue'],
    ['cluster-list-watch-informers', '3', 'resourceVersion', 'step 2 `list` writes 842 on the `toCache` arrival, where the set lands in the Indexer'],
    ['cluster-list-watch-informers', '3', 'cache size', 'step 2 `list` writes 3 on the `toCache` arrival, with resourceVersion'],
  ].map(([card, step, chip, where]) => ({ axis: 'R2-ENTRY', card, where: [step, chip],
    why: `${where}, the chip lit from that step's entry (P-06). Frozen at t=0 the change first shows one step later.` })),
  { axis: 'R2-ENTRY', card: 'cluster-oom-kill', where: ['3', 'container state'],
    why: 'the mirror of `R2-STEP cluster-oom-kill 3 container state`: containerStatuses[].state is '
      + 'STILL Running, and the suffix `not yet observed` explains an unchanged fact. The turnover '
      + 'the reader must catch is on the observe step, where the chip IS lit.' },

  { axis: 'R2-ENTRY', card: 'workloads-ephemeral-containers', where: ['6', 'status.ephemeralContainerStatuses'],
    why: 'not a change on `inside`: step 5 `starts` winds the status back to none in `rewind` and '
      + 'writes Running with an F.set on the spine arrival (`write`), cued there by `lights:`, so a '
      + 'frame frozen at t=0 of `starts` reads none and the turnover is first seen one step later. '
      + 'DO NOT close it by dropping the rewind: the status would report a container the picture '
      + 'has not drawn yet.' },

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
      + 'to the ball reaching the Running box writes it at 1500ms, with the chip in that step lit '
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
      + '`rewind` holds it at 4 and an `F.set` bound to the Kubelet ball writes 5 at 1500ms, with '
      + 'the chip in that step lit list. Frozen at t=0 the change is first seen on `terminal`, step '
      + '5, where it is not lit because that step is about the phase reaching Succeeded and the '
      + 'restart count is settled. DO NOT close it by lighting restartCount on `terminal`.' },
  ...[['4', '`remove-one`, step 3, where a `rewind` holds it at 2 entries and the `F.set` that cues '
      + 'gateB on the write arrival writes 1 entry at 1500ms', '`one-way`, step 4'],
    ['6', '`remove-last`, step 5, where a `rewind` holds it at 1 entry and the `F.set` that cues '
      + 'gateA on the write arrival writes empty at 1500ms', '`queued`, step 6']].map(([step, where, next]) => (
    { axis: 'R2-ENTRY', card: 'workloads-pod-scheduling-gates', where: [step, 'spec.schedulingGates'],
      why: 'the price of the P-03 FORM-B repair. spec.schedulingGates turns over on ' + where + ', '
        + 'with the chip in that step lit list from 0ms. Frozen at t=0 the change is first seen on '
        + next + ', where the chip is correctly not lit: that step moves no entry. R2-STEP, settled '
        + 'against settled, does not list it. DO NOT close it by lighting the count on ' + next + '.' })),
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

  // Turned over mid-step on the arrival that produced it, so a frozen sample sees it one step late.
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

  // Rewound and turned over mid-step, cued on the arrival where the fact happens (P-03).
  ...[
    ['3', 'rewrite', 'step 2 `agent` writes `none, NOTRACK` on the dataplane arrival `in` and lights it there'],
    ['3', 'conntrack', 'step 2 `agent` writes `no entry` on the dataplane arrival `in` and lights it there'],
    ['3', 'cache', 'step 2 `agent` writes `empty` on the agent arrival `local` and lights it there'],
    ['3', 'upstream', 'step 2 `agent` writes `not asked yet` on the agent arrival `local` and lights it there'],
    ['4', 'rewrite', 'step 3 `miss` writes `DNAT to CoreDNS` on the dataplane arrival `up` and lights it there'],
    ['4', 'upstream', 'step 3 `miss` writes `TCP to CoreDNS` on the dataplane arrival `up` and lights it there'],
    ['4', 'conntrack', 'step 3 `miss` writes `TCP, removed on close` on the dataplane arrival `up` and lights it there'],
    ['4', 'cache', 'step 3 `miss` writes `miss, stored` on the agent arrival `store` and lights it there'],
    ['5', 'rewrite', 'step 4 `hit` writes `none, NOTRACK` on the dataplane arrival `in` and lights it there'],
    ['5', 'conntrack', 'step 4 `hit` writes `no entry` on the dataplane arrival `in` and lights it there'],
    ['5', 'cache', 'step 4 `hit` writes `hit, 30s max` on the agent arrival `local` and lights it there'],
    ['5', 'upstream', 'step 4 `hit` writes `not asked` on the agent arrival `local` and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'network-nodelocal-dnscache', where: [step, chip], why })),

  // Rewound to the previous Pod and turned over on the watch arrival.
  ...[
    ['2', 'dnsPolicy', 'step 1 `clusterfirst` writes ClusterFirst on the watch arrival and lights it there'],
    ['3', 'dnsPolicy', 'step 2 `default` writes Default on the watch arrival and lights it there'],
    ['4', 'dnsPolicy', 'step 3 `hostnet` writes ClusterFirst on the watch arrival and lights it there'],
    ['4', 'hostNetwork', 'step 3 `hostnet` writes true on the watch arrival and lights it there'],
    ['5', 'dnsPolicy', 'step 4 `withhostnet` writes ClusterFirstWithHostNet on the watch arrival and lights it there'],
    ['6', 'dnsPolicy', 'step 5 `none` writes None on the watch arrival and lights it there'],
    ['6', 'hostNetwork', 'step 5 `none` writes false on the watch arrival and lights it there'],
    ['6', 'dnsConfig.nameservers', 'step 5 `none` writes 192.0.2.1 on the watch arrival and lights it there'],
    ['6', 'dnsConfig.searches', 'step 5 `none` writes `svc.cluster.local lab.test` on the watch arrival and lights it there'],
    ['6', 'dnsConfig.options', 'step 5 `none` writes `ndots:2 edns0` on the watch arrival and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'network-dns-pod-policy', where: [step, chip], why })),

  // More network cards in the rewind class. A key names the chip as drawn, covering same-named chips on that step.
  ...[
    ['network-flat-pod-network', '3', 'NAT', 'step 2 `no-nat` writes `none, src 10.244.1.5` with a cued F.set on its `hop` arrival. `same-node` carries the value in unchanged, so it earns no cue here (P-05)'],
    ['network-flat-pod-network', '3', 'reachability', 'step 2 `no-nat` writes `cross-Node direct` cued on `hop`, and that is the value `same-node` winds back to before turning it over, cued, on its own `hop`'],
    ['network-flat-pod-network', '4', 'reachability', '`same-node` writes `same-Node direct` cued on its `hop` arrival, and `node-agent` winds back to that value before turning it over, cued, on its own `hop`'],
    ['network-flat-pod-network', '5', 'NAT', 'step 4 `node-agent` clears the value to `none` with a cued F.set on its `hop` arrival, after winding it back to `none, src 10.244.1.5`. `cni` only holds it'],
    ['network-pod-ip-and-veth', '3', 'Pod IP', 'step 2 `address` winds the chip back to `allocated` and writes 10.244.1.5/24 at 800ms with the eth0 sublabel, the chip lit in `lit`: one result of one beat (P-03, P-04). `through` only holds it'],
    ['network-service-clusterip', '3', 'DNAT', 'step 2 `program` winds the chip back to none and writes the rules after the watch arrival, with an F.light on dnatChip there. `send` only holds them'],
    ['network-service-clusterip', '6', 'conntrack', 'both frames are rewind values: `reply` holds `flow pinned` until its h1 arrival, and `balance` holds `reverse NAT` until its send arrival, where an F.light cues `two flows`'],
    ['network-service-clusterip', '7', 'DNAT', 'step 6 `balance` winds the chip back to .2.7 and writes .3.9 on its send arrival, cued by an F.light there. `balance-reply` only holds it'],
    ['network-service-clusterip', '7', 'conntrack', 'both frames are rewind values: `balance` holds `reverse NAT` until send, and `balance-reply` holds `two flows` until its h1 arrival, where an F.light cues `reverse NAT`'],
    ['network-service-clusterip', '7', 'backend', 'step 6 `balance` winds the chip back to 10.244.2.7 and writes 10.244.3.9 on its send arrival, cued by an F.light there. `balance-reply` only holds it'],
    ['network-service-and-endpointslice', '3', 'endpoint', 'all three rows: step 2 `reconcile` winds them back to (empty) and writes them on the `write` arrival, with an F.light on all three there. `readiness` winds ep2 back to ready=true for its own turnover on `upd`'],
    ['network-service-and-endpointslice', '4', 'endpoint', 'step 3 `readiness` winds ep2 back to ready=true and writes ready=false on the `upd` arrival, with an F.light on ep2 there. `consume` only holds it'],
    ['network-service-terminating-endpoints', '4', 'condition', 'both rows: step 3 `delete` winds the conditions back to the steady values and turns ready and terminating over at 450ms with an F.light on both. `reprogram` only holds them'],
    ['network-internal-traffic-policy', '3', 'Node-1 rules', 'step 2 `local` winds both rule chips back to both agents and turns them over at RULES_MS 300 with an F.light, the kube-proxy beat that writes them. `no-local-backend` only holds this one'],
    ['network-internal-traffic-policy', '3', 'Node-2 rules', 'both frames are rewind values: `local` holds both agents until its 300ms turnover, and `no-local-backend` holds agent-2 until its own 300ms turnover to drop, cued there'],
    ['network-externalname', '3', 'SNI · Host', 'step 2 `connect` winds the chip back to none and writes api.default.svc on the `hello` arrival, whose `lights` cue the chip. `mismatch` only holds it'],
    ['network-externalname', '4', 'cert', 'step 3 `mismatch` winds the chip back to none and writes api.partner.example on the `cert` arrival, whose `lights` cue the chip. `slice` only holds it'],
    ['network-external-traffic-policy', '2', 'share', 'all three shares: step 1 `cluster` winds them back to none and writes 33% on the `hop` arrival, whose `lights` cue all three. `cluster-snat` only holds them'],
    ['network-external-traffic-policy', '2', 'client src IP', 'step 1 `cluster` winds the chip back to none and writes `lost (SNAT)` on the `hop` arrival, whose `lights` cue it. `cluster-snat` only holds it'],
    ['network-external-traffic-policy', '2', 'extra hop', 'step 1 `cluster` winds the chip back to none and writes yes on the `hop` arrival, cued there, and `cluster-snat` winds back to that yes before its own cued turnover on `toN1`'],
    ['network-external-traffic-policy', '3', 'extra hop', 'step 2 `cluster-snat` winds the chip back to yes and writes no on the `toN1` arrival, whose `lights` cue it. `local` only holds it'],
    ['network-external-traffic-policy', '4', 'share', 'both 17% shares: step 3 `local` winds them back to 33% and writes 17% on the `drop` arrival, whose `lights` cue them. `healthcheck` only holds them'],
    ['network-external-traffic-policy', '4', 'client src IP', 'step 3 `local` winds the chip back to `lost (SNAT)` and writes preserved on the `toN1` arrival, whose `lights` cue it. `healthcheck` only holds it'],
    ['network-loadbalancer-straight-to-pods', '2', 'path through Nodes', 'step 1 `nodeports` winds the chip back to none and writes 2 on the `hop` arrival, whose `lights` cue it. `register` only holds it'],
    ['network-loadbalancer-straight-to-pods', '4', 'path through Nodes', 'step 3 `direct` winds the chip back to 2 and writes 1 on the `toN1` arrival, whose `lights` cue it. `replace` only holds it'],
    ['network-client-ip-preservation', '3', 'src', 'step 2 `terminate` winds rSrc back to none and writes 10.244.0.9 on the `out` arrival, the chip lit in `lit`. `xff` only holds it'],
    ['network-client-ip-preservation', '4', 'app reads', 'step 3 `xff` winds the chip back to socket and writes header on the `out` arrival, the chip lit in `lit`. `forge` only holds it'],
    ['network-client-ip-preservation', '5', 'X-Forwarded-For', 'the step 4 frame is the rewind of `forge`, which turns rXff over on `out`. Settled against settled this is the R2-STEP row already carried: a raw stream has no header, and nothing cleared one'],
    ['network-client-ip-preservation', '5', 'client IP', 'both frames are rewind values: `forge` holds recovered until `out`, and `passthrough` holds `trusted hop only` until its own `out`. Settled against settled this is the R2-STEP row already carried: the value returns to the steady reading, uncued on purpose'],
  ].map(([card, step, chip, why]) => ({ axis: 'R2-ENTRY', card, where: [step, chip], why })),
  { axis: 'R2-ENTRY', card: 'network-netfilter-path', where: ['4', 'hook'],
    why: 'step 4 `out` winds the chip back to FORWARD, the box the `fork` hop delivered the packet '
      + 'to and the one lit at entry, and writes `FORWARD, POSTROUTING` on the `toPo` arrival, whose '
      + '`lights` cue it. A frame frozen at t=0 reads the rewind value, and settled against settled '
      + 'R2-STEP reports nothing. DO NOT light the chip at entry: the cue would be spent before the '
      + 'turnover it announces' },
  // The rewind class from here down: written through `chips`, wound back in `rewind`, turned over by a cued F.set.
  ...[
    ['2', 'app.conf from', 'step 1 `read` writes base layer on the read arrival and lights it there'],
    ['3', 'upperdir', 'step 2 `create` writes cache on the create arrival and lights it there'],
    ['4', 'app.conf from', 'step 3 `copyup` writes upperdir on the copy-up arrival and lights it there'],
    ['4', 'upperdir', 'step 3 `copyup` writes `cache, app.conf` on the copy-up arrival and lights it there'],
    ['5', 'upperdir', 'step 4 `whiteout` writes `cache, app.conf, whiteout` on the whiteout arrival and lights it there'],
    ['6', '/data', 'step 5 `volume` writes db on the volume arrival and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-container-filesystem', where: [step, chip], why })),
  ...[
    ['2', 'emptyDir', 'step 1 `create` writes on Node-1 when the directory fade lands and lights it there'],
    ['2', '/cache', 'step 1 `create` writes empty when the directory fade lands and lights it there'],
    ['3', '/cache', 'step 2 `share` writes part-1 on the write arrival and lights it there'],
    ['5', 'Pod', 'step 4 `drain` writes `web-a evicted` as the Pod fades and lights it there'],
    ['5', 'emptyDir', 'step 4 `drain` writes deleted as the directory fades and lights it there'],
    ['5', '/cache', 'step 4 `drain` writes gone as the directory fades and lights it there'],
    ['6', 'Pod', 'step 5 `replace` writes `web-b, Node-2` when the Pod fade lands and lights it there'],
    ['6', '/cache', 'step 5 `replace` writes empty when the new directory fade lands and lights it there'],
    ['6', 'app restarts', 'step 5 `replace` writes 0 when the web-b fade lands and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-emptydir', where: [step, chip], why })),
  ...[
    ['2', 'request', 'step 1 `request` writes `512Mi reserved` after the Pod blink and lights it there'],
    ['3', 'usage', 'step 2 `write` writes `1100Mi on disk` on the third write arrival, after 300Mi and 700Mi'],
    ['4', 'usage', 'step 3 `scan` writes `1100Mi measured` on the reply arrival and lights it there'],
    ['5', 'usage', 'step 4 `compare` writes `1100Mi, over 1Gi` as the Pod row verdict lands and lights it there'],
    ['6', 'Pod web-a', 'step 5 `evict` writes `Failed, Evicted` on the evict arrival and lights it there. `replace` holds the value and cues nothing, since nothing changed (P-09a)'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-ephemeral-storage-eviction', where: [step, chip], why })),
  ...[
    ['2', 'Node-1', 'step 1 `check` writes `dir exists` on the check arrival and lights it there'],
    ['3', 'Node-1', 'step 2 `bind` writes `at /cache` on the bind arrival and lights it there'],
    ['4', 'Node-1', 'step 3 `write` writes `cache.db` on the write arrival and lights it there'],
    ['5', 'Node-1', 'step 4 `uncounted` writes `cache.db 8Gi` on the write arrival and lights it there'],
    ['6', 'Node-1', 'step 5 `delete` writes `cache.db kept` on the StopContainer arrival and lights it there'],
    ['6', 'counted', 'step 5 `delete` writes `Pod gone` on the StopContainer arrival and lights it there'],
    ['7', 'Node-2', 'step 6 `elsewhere` writes `FailedMount` on the Node-2 check arrival and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-hostpath', where: [step, chip], why })),
  ...[
    ['2', '..data target', 'step 1 `project` writes `v1 dir` on the write arrival and lights it there'],
    ['2', 'version dirs', 'step 1 `project` writes `1` on the write arrival and lights it there'],
    ['3', 'version dirs', 'step 2 `stage` writes `2` on the write arrival and lights it there'],
    ['3', 'app reads', 'step 2 `stage` writes `app.conf v1` on the read arrival and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-configmap-secret-mount', where: [step, chip], why })),
  ...[
    ['2', 'dir holds', 'step 1 `inject` writes `ca.crt, namespace` on the two write arrivals and lights it there'],
    ['3', 'dir holds', 'step 2 `request` writes `ca.crt, namespace, token` on the token write arrival and lights it there'],
    ['3', 'token file', 'step 2 `request` writes `token 1, until min 60` on the token write arrival and lights it there'],
    ['4', 'app uses', 'step 3 `read` writes `token 1` on the token read arrival and lights it there'],
    ['5', 'token file', 'step 4 `refresh` writes `token 2, until min 108` on the write arrival and lights it there'],
    ['5', 'app uses', 'step 4 `refresh` writes `token 2` on the re-read arrival and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-projected-volume', where: [step, chip], why })),
  { axis: 'R2-ENTRY', card: 'storage-dynamic-provisioning', where: ['4', 'disk'],
    why: 'the same class: step 3 `createvolume` winds disk back to none in `rewind` and turns it to '
      + 'the volume id with a cued F.set when the CreateVolume answer comes back (`back`), so a frame '
      + 'frozen at t=0 of createvolume reads the rewind value and the turnover is first seen at step 4. '
      + 'R2-STEP reports nothing. DO NOT close it by dropping the rewind: the id would stand on the '
      + 'strip before the cloud has created the disk' },
  ...[
    ['2', 'status.phase', 'step 1 `bind` winds it back to Available'],
    ['2', 'claimRef', 'step 1 `bind` winds it back to none'],
    ['3', 'status.phase', 'step 2 `release` winds it back to Bound'],
    ['3', 'claimRef', 'step 2 `release` winds it back to default/data'],
  ].map(([step, chip, how]) => ({ axis: 'R2-ENTRY', card: 'storage-pv-lifecycle-phases', where: [step, chip],
    why: how + ' in `rewind` and turns it over with a cued F.set when the controller write lands, so '
      + 'a frame frozen at t=0 reads the rewind value and the turnover is first seen one step later. '
      + 'R2-STEP reports nothing. DO NOT close it by dropping the rewind: the phase would stand on '
      + 'the column before the controller has written it' })),
  ...[
    ['2', 'claimRef', 'step 1 `reserve` winds it back to app/data in `rewind` and turns it to app/restore'],
    ['2', 'claimRef.uid', 'step 1 `reserve` winds it back to `of app/data` in `rewind` and turns it to `none`'],
    ['2', 'status.phase', 'step 1 `reserve` winds it back to Released in `rewind` and turns it to Available'],
  ].map(([step, chip, how]) => ({ axis: 'R2-ENTRY', card: 'storage-pv-reservation', where: [step, chip],
    why: how + ' with a cued F.set when the patch or the controller write lands, so a frame frozen at '
      + 't=0 reads the rewind value and the turnover is first seen one step later. R2-STEP reports '
      + 'nothing. DO NOT close it by dropping the rewind: the reservation would stand on the PV before '
      + 'the administrator has patched it' })),
  { axis: 'R2-ENTRY', card: 'storage-pv-reservation', where: ['4', 'claimRef'],
    why: 'step 4 `named-only` is the counterfactual, so its `rewind` puts the claimRef back to none, the '
      + 'state it starts from once the administrator has only cleared it, and a cued F.set turns it to '
      + 'app/scratch when the controller write lands. A frame frozen at t=0 reads the rewind value with '
      + 'no cue yet. R2-STEP reports nothing. DO NOT close it by lighting the chip at entry: the rival '
      + 'would own the volume before the controller had written it' },
  ...[
    ['5', 'PV del', 'step 4 `delete-branch` winds it back to Released in `rewind` and turns it to removed'],
    ['5', 'vol-aaa', 'step 4 `delete-branch` winds it back to holds data in `rewind` and turns it to deleted'],
    ['7', 'PV new', 'step 6 `new-claim` winds it back to none in `rewind` and turns it to Bound'],
    ['7', 'vol-ccc', 'step 6 `new-claim` winds it back to none in `rewind` and turns it to new, empty'],
  ].map(([step, chip, how]) => ({ axis: 'R2-ENTRY', card: 'storage-reclaim-policy', where: [step, chip],
    why: how + ' with a cued F.set on the arrival of the ball that earns it, so a frame frozen at t=0 '
      + 'reads the rewind value and the turnover is first seen one step later. R2-STEP reports '
      + 'nothing. DO NOT close it by dropping the rewind: the value would stand on the strip before '
      + 'the call that produces it has landed' })),
  ...[
    ['5', 'PVC', 'step 4 `bind` writes Bound when the volumeName write reaches the claim (`toClaim`) and lights it there'],
    ['5', 'PV x73a', 'step 4 `bind` writes Bound when the claimRef write reaches the volume (`toVolume`) and lights it there'],
    ['5', 'binding', 'step 4 `bind` writes the pair on the volumeName arrival (`toClaim`), the second write, when it exists on both objects, and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-pvc-binding', where: [step, chip], why })),
  ...[
    ['2', 'used on', 'step 1 `rwo-first` writes Node-1 when the app-1 attach lands on the block disk (`a1Att`) and lights it there'],
    ['3', 'sharing', 'step 2 `rwo-samenode` writes app-1, app-2 when the app-2 attach lands (`a2Att`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-access-modes', where: [step, chip], why })),
  ...[
    ['2', 'PVC', 'step 1 `mint` writes Pending when the ownerReference ball reaches the claim (`own`) and lights it there'],
    ['3', 'backing', 'step 2 `provision` writes real disk, fast-ssd when CreateVolume reaches the disk (`create`) and lights it there'],
    ['4', 'PVC', 'step 3 `mount` writes Bound when the volume reaches the claim (`low`) and lights it there'],
    ['4', 'Pod', 'step 3 `mount` writes Running when the mount reaches the Pod (`high`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-generic-ephemeral-volume', where: [step, chip], why })),
  ...[
    ['3', 'readyToUse', 'step 2 `request` writes false when the bind ball reaches the content (`bind`) and lights it there'],
    ['4', 'readyToUse', 'step 3 `cut` writes true when CreateSnapshot reaches the pool (`call`) and lights it there'],
    ['4', 'shared blocks', 'step 3 `cut` writes 6 of 6 when CreateSnapshot reaches the pool (`call`) and lights it there'],
    ['4', 'stored', 'step 3 `cut` writes same pool when CreateSnapshot reaches the pool (`call`) and lights it there'],
    ['5', 'shared blocks', 'step 4 `diverge` writes 5 of 6 when the old C v2 reaches the snapshot row (`keep`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-volume-snapshot', where: [step, chip], why })),
  ...[
    ['3', 'mkfs ran on', 'step 2 `format` writes web-0 disk when the ball reaches Format (`fmt`) and lights it there'],
    ['5', 'web-0 sees', 'step 4 `publish-dir` writes directory /data when the ball reaches Pod web-0 (`pub`) and lights it there'],
    ['5', 'fsGroup, subPath', 'step 4 `publish-dir` writes on web-0 on the same arrival at Pod web-0 (`pub`) and lights it there'],
    ['6', 'db-0 sees', 'step 5 `publish-device` writes device /dev/xvda when the ball reaches Pod db-0 (`dev`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-filesystem-vs-block', where: [step, chip], why })),
  { axis: 'R2-ENTRY', card: 'storage-csi-capacity-tracking', where: ['4', 'capacity objects'],
    why: 'the same class: step 3 `publish` winds the chip back to none in `rewind` and turns it to '
      + '2 published with a cued F.set when the write lands in the API server (`pub`), so a frame '
      + 'frozen at t=0 reads the rewind value and the turnover is first seen at step 4. R2-STEP '
      + 'reports nothing. DO NOT close it by dropping the rewind: the chip would count objects '
      + 'before the write that creates them' },
  { axis: 'R2-ENTRY', card: 'storage-csi-capacity-tracking', where: ['3', 'selected-node'],
    why: 'the same class: step 2 `blind-fail` winds the chip back to node-1 in `rewind` and turns it '
      + 'to none with a cued F.set when CreateVolume fails in the Node-1 pool (`cv`), the Pod leaving '
      + 'Node-1 on the same arrival, so a frame frozen at t=0 reads the rewind value and the turnover '
      + 'is first seen at step 3. R2-STEP reports nothing. DO NOT close it by dropping the rewind: '
      + 'the chip would drop the Node before the provision that fails on it' },
  { axis: 'R2-ENTRY', card: 'storage-volume-binding-mode', where: ['2', 'PVC'],
    why: 'the same class: step 1 `imm-provision` winds the claim chip back to Pending in `rewind` and '
      + 'turns it to Bound with a cued F.set when CreateVolume reaches the zone-a disk (`prov`), so a '
      + 'frame frozen at t=0 reads the rewind value and the turnover is first seen at step 2. R2-STEP '
      + 'reports nothing. DO NOT close it by dropping the rewind: the claim would read Bound before '
      + 'the disk it is bound to exists' },
  { axis: 'R2-ENTRY', card: 'storage-pvc-protection', where: ['6', 'consumers'],
    why: 'the same class: step 5 `pod-gone` winds consumers back to `1 Pod` in `rewind` and turns it '
      + 'to `0 Pods` with a cued F.set when the Pod fade finishes (`gone`), so a frame frozen at t=0 '
      + 'of pod-gone reads the rewind value and the turnover is first seen at step 6. R2-STEP reports '
      + 'nothing. DO NOT close it by dropping the rewind: the chip would read 0 Pods over a Pod still '
      + 'standing at full strength' },
  ...[
    ['2', 'PVCs', 'step 1 `mint` winds the counter back to `none yet` and steps it to `3 minted` one claim arrival at a time'],
    ['3', 'PVCs', 'step 2 `bind` winds it back to `3 minted` and turns it to `3 bound` on the last bind arrival'],
    ['4', 'PVCs', 'step 3 `mount` winds it back to `3 bound` and turns it to `3 in use` on the last Pod mount arrival'],
  ].map(([step, chip, how]) => ({ axis: 'R2-ENTRY', card: 'storage-volumeclaimtemplates', where: [step, chip],
    why: how + ', each a cued F.set, so a frame frozen at t=0 reads the rewind value and the turnover '
      + 'is first seen one step later, where nothing moves the counter. R2-STEP reports nothing, and '
      + 'a real-time settled-dump shows the chip lit on the step that turns it. DO NOT close it by '
      + 'dropping the rewind: the counter would count claims and mounts before their balls land' })),
  // The rewind class seen from the other side: `unlightRewound` reads the old value dark at entry.
  ...[
    ['storage-pvc-binding', '4', 'binding', 'step 3 `match` writes `candidate PV x73a` on the match arrival, cued there and dark until then'],
    ['storage-access-modes', '2', 'sharing', 'step 1 `rwo-first` writes `app-1` on the attach arrival, cued there and dark until then'],
    ['storage-csi-capacity-tracking', '2', 'selected-node', 'step 1 `blind-pick` writes `node-1` on the pick arrival, cued there and dark until then'],
    ['storage-csi-capacity-tracking', '2', 'result', 'step 1 `blind-pick` writes `waiting for volume` on the pick arrival, cued there and dark until then'],
    ['storage-csi-capacity-tracking', '5', 'result', 'step 4 `filter` writes `node-1 filtered out` on the filter arrival, cued there and dark until then'],
    ['storage-multi-attach-error', '6', 'attached to', 'step 5 `detach` writes `nothing` on the detach arrival, cued there and dark until then'],
    ['workloads-poststart-prestop-hooks', '3', 'postStart hook', 'step 2 `start` writes `running (exec)` on the hook arrival, cued there and dark until then'],
    ['workloads-poststart-prestop-hooks', '5', 'preStop hook', 'step 4 `delete` writes `running (sync)` on the hook arrival, cued there and dark until then'],
  ].map(([card, step, chip, why]) => ({ axis: 'R2-ENTRY', card, where: [step, chip], why })),
  ...[
    ['4', '/data', 'step 3 `chown` writes `root:2000 g+s` as the walk crosses the row and lights it there'],
    ['4', 'app.log', 'step 3 `chown` writes `root:2000` as the walk crosses the row and lights it there'],
    ['4', '... 4.2M more', 'step 3 `chown` writes `root:2000` as the walk crosses the row and lights it there'],
    ['4', 'owner', 'step 3 `chown` writes `root:2000 g+s` with the cued F.set on the `walk` arrival, after the last row'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-fsgroup-ownership', where: [step, chip], why })),
  ...[
    ['3', 'llm:v1 on Node', 'step 2 `pull` writes pulled on the pull arrival (`pull`) and lights it there'],
    ['4', '/models', 'step 3 `mount` writes read-only on the mount arrival (`mount`) and lights it there'],
    ['5', 'app container', 'step 4 `start` writes running on the start arrival (`start`), with the Pod blink, and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-image-volume', where: [step, chip], why })),
  ...[
    ['3', 'file zone', 'step 2 `write` writes east on the write arrival (`write`) and lights it there'],
    ['4', 'env ZONE', 'step 3 `start` writes east on the env arrival (`env`), with the Pod blink, and lights it there'],
    ['6', 'file zone', 'step 5 `rewrite` writes west on the write arrival (`write`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-downward-api-volume', where: [step, chip], why })),
  ...[
    ['3', 'VolumeAttachment', 'step 2 `write` writes va-7f on the controller write arrival (`write`) and lights it there'],
    ['3', 'status.attached', 'step 2 `write` writes false on the controller write arrival (`write`) and lights it there'],
    ['4', 'disk on Node-1', 'step 3 `attach` writes yes when the attach lands on the Node (`land`) and lights it there'],
    ['5', 'status.attached', 'step 4 `status` writes true on the attacher status write arrival (`status`) and lights it there'],
    ['6', 'Kubelet', 'step 5 `mount` writes mounted when the mount lands in the Pod (`mount`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-volumeattachment', where: [step, chip], why })),
  ...[
    ['6', 'blocked by', 'step 5 `detach` writes nothing when the detach reaches the disk (`det`) and lights it there'],
    ['7', 'attached to', 'step 6 `attach` writes Node-2 when the attach reaches the disk (`att`) and lights it there'],
    ['7', 'new Pod', 'step 6 `attach` writes Running one hop after the attach, with the new Pod blink, and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-multi-attach-error', where: [step, chip], why })),
  // The frozen entry of `ifpossible` reads its own rewind, Enabled.
  ...[
    ['5', 'recursiveReadOnly', 'step 4 `enabled` writes Enabled once the recreated Pod starts (`start`) and lights it there with an F.light'],
    ['5', 'status', 'step 4 `enabled` writes Enabled once the recreated Pod starts (`start`) and lights it there with an F.light'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-recursive-readonly', where: [step, chip], why })),
  ...[
    ['3', 'attached', 'step 2 `fill` writes `24 of 24` at FILL_END, the instant the last slot lands, and lights it there'],
    ['7', 'Pod web-0', 'step 6 `detachlag` writes `Running on node-3` at PLACE_MS, the placement beat the new Pod blinks on, and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-volume-attach-limits', where: [step, chip], why })),
  ...[
    ['3', 'nvme1n1 on host', 'step 2 `shared` writes `1 entry` when the staging entry lands in the host table (`rep`) and lights it there'],
    ['4', 'nvme1n1 on host', 'step 3 `bind` writes `2 entries` when the bind entry lands in the host table (`rep`) and lights it there'],
  ].map(([step, chip, why]) => ({ axis: 'R2-ENTRY', card: 'storage-mount-propagation', where: [step, chip], why })),

  // Workloads, the rewind class.
  ...[
    ['workloads-pod-pending-init-states', '5', 'RESTARTS', 'step 4 `initializing` winds RESTARTS back to `3 (20s ago)` and writes 0 on the create arrival (`create`), lit from entry'],
    ['workloads-pod-startup-conditions', '3', 'Service endpoints', 'step 2 `sandbox` winds the endpoint back to empty and writes it on the sandbox arrival (`create`), lit from entry'],
    ['workloads-image-pull-registry-auth', '5', 'layers cached', 'step 4 `pull` winds the count back to `2 of 4` and writes `4 of 4` when the 200 with the layers is back (`layers`), lit from entry'],
    ['workloads-crashloopbackoff', '3', 'container state', 'step 2 `backoff-named` winds the state back to `Running (restarted)` and writes Waiting on the exit report arrival (`exit`), lit from entry'],
    ['workloads-crashloopbackoff', '3', 'reason', 'step 2 `backoff-named` winds the reason back to none and writes CrashLoopBackOff on the exit report arrival (`exit`), lit from entry'],
    ['workloads-probes', '3', 'startupProbe', 'step 2 `gate-opens` winds startupProbe back to `probing 4/30` and writes `passed (retired)` on the pass arrival (`pass`), lit from entry'],
    ['workloads-probes', '5', 'readinessProbe', 'step 4 `readiness-fails` winds readinessProbe back to `passing 1/1` and writes `failed 3/3` on the report arrival (`report`), lit from entry'],
    ['workloads-probes', '6', 'livenessProbe', 'step 5 `liveness-fails` winds livenessProbe back to passing and writes `failed 3/3` on the kill beat, lit from entry'],
    ['workloads-container-restarts-laststate', '4', 'restartCount', 'step 3 `restart` winds restartCount back to 1 and writes 2 on the status write arrival (`write`), lit from entry'],
    ['workloads-pod-resize', '3', 'spec.containers[].resources', 'step 2 `patch` winds the spec back to 700m and writes 800m on the PATCH arrival, lit from entry'],
    ['workloads-pod-resize', '6', 'status.containerStatuses[].resources', 'step 5 `apply` winds the status back to 700m and writes 800m on the actuation arrival (`apply`), lit from entry'],
    ['workloads-pod-resize', '6', 'Pod resize condition', 'step 5 `apply` winds the condition back to PodResizeInProgress and writes the settled reading on the actuation arrival (`apply`), lit from entry'],
    ['workloads-poststart-prestop-hooks', '4', 'postStart hook', 'step 3 `settled` winds the hook back to `running (exec)` and turns it to `exit 0` with chipsCued in an F.set on the ack arrival, cued there'],
    ['workloads-poststart-prestop-hooks', '4', 'container state', 'step 3 `settled` winds the state back to Waiting and turns it to Running with chipsCued in an F.set on the ack arrival, cued there'],
    ['workloads-ephemeral-containers', '4', 'spec.ephemeralContainers', 'step 3 `third-door` winds the list back to empty and writes `1 · debugger-8xzrl` on the PATCH arrival (`patch`), cued there by the `lights:` list of that route'],
    ['workloads-ephemeral-containers', '4', 'targetContainerName', 'step 3 `third-door` winds the target back to unset and writes app on the same PATCH arrival (`patch`), cued there by the same `lights:` list'],
  ].map(([card, step, chip, how]) => ({ axis: 'R2-ENTRY', card, where: [step, chip],
    why: how + ', so a frame frozen at t=0 reads the rewind value and the turnover is first seen one '
      + 'step later. DO NOT close it by dropping the rewind: the chip would state its value before '
      + 'the ball that earns it lands' })),
  // In a `chips` category `lit` names the step subject, so a background probe state changes uncued (P-09).
  { axis: 'R2-ENTRY', card: 'workloads-probes', where: ['3', 'livenessProbe'],
    why: 'two changes read as one by the frozen sample. `held` to `running` is step 2 `gate-opens`, '
      + 'wound back and written lit on the pass arrival. `running` to `passing` is step 3 `ready`, '
      + 'background state on the step whose subject is readiness, and the card record keeps it uncued: '
      + 'lighting it points the reader at the wrong chip' },
  { axis: 'R2-ENTRY', card: 'workloads-probes', where: ['6', 'readinessProbe'],
    why: 'step 5 `liveness-fails` writes `reset` on the kill beat together with the lit liveness and '
      + 'restart chips, and keeps readinessProbe dark: the subject of that step is the kill, and the '
      + 'card record rules that a probe reset beside it is background state. Lighting it would put '
      + 'four lit chips of four on a step that is about one probe' },

  // R3: a block lit for three steps running is outside the acts-first exemption.
  { axis: 'R3', card: 'cluster-scheduler-decision', where: ['5', 'Node-4'],
    why: 'Node-4 is lit on `score`, on `bind` and on `placed`, and dropping it for the 1500ms of '
      + 'the two hops reads as the winner being un-chosen. The arrival still has a receiver: the '
      + 'Kubelet lights on its own hop.' },

  // A bar here is the subject of every step it is drawn on, not a receiving block.
  ...['2', '5'].map(step => ({ axis: 'R3', card: 'network-policy', where: [step, '.scheme-box'],
    why: 'the bar is drawn on exactly the four steps the Pod it belongs to is isolated on, and lit '
      + 'on all four of them, including `allow` and `both-ends` where a packet passes through it '
      + 'and nothing lands. Going dark on the two steps where a packet DIES in it would dim the '
      + 'subject at the one moment it acts. The bar carries no label, which is why this row names '
      + 'it by selector: a string inside it would sit where the road runs.' })),

  // A door on the egress boundary is what each step is about, and the ball reaching it is refused.
  ...['2', '3', '4'].map(step => ({ axis: 'R3', card: 'network-dns-egress-policy', where: [step, '.scheme-box'],
    why: 'the shut door is lit from entry on the three steps it refuses a query on, because it '
      + 'exists from the moment a policy selects the Pod and the ball demonstrates what it does '
      + 'rather than revealing that it is there. Lighting it on arrival would credit the query with '
      + 'raising the boundary that stops it. The door carries no label, which is why this row names '
      + 'it by selector: a string inside it would sit where the road runs.' })),

  // R4: both shapes R4 names were tried on this step and an asserted check rules them out.
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
    why: 'the ball this step opens with is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y and never crosses the border, so the NIC 34 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `F.light` on the `inb` arrival at 700ms with the onward hop leaving at 800ms, one BEAT.afterHop later, which is the separation every chained hop in the catalogue uses. R4 reads a frame frozen at t=0 and its own header names this class. The other shape was measured: `eth` in `lit` closes both rows, 42 back to 40 catalog-wide, with no R3 row and a green render, and it costs the only arrival beat the step has, because a box already lit at entry does not light again when the ball lands on the Node. The exemplar draws the same shape, `network-nodeport-loadbalancer client-hit` lights np1 on the frame arrival, and escapes R4 only because a chip is not a block it judges.' },
  { axis: 'R4', card: 'storage-volume-snapshot', where: ['4', 'C'],
    why: 'the mid-chain shape, read by position: the write ball of `diverge` stops ON the pool frame '
      + 'top face level with live block C, never on C itself, because the write is addressed to the '
      + 'volume in the pool. C is named in that hop `lights`, so it lights on the write arrival and '
      + 'the keep ball leaves `after` it, one BEAT.afterHop later. R4 finds an earlier arrival only '
      + 'on the block the ball touches, and this one touches the frame' },
  { axis: 'R4', card: 'storage-pvc-clone', where: ['3', 'Source volume'],
    why: 'the source is lit by an `F.light` on `call`, the beat '
      + 'the CreateVolume call lands on the backend frame and the new disk starts to materialise, and '
      + 'its copy ball leaves REVEAL_MS later, so the sender is lit 500ms before the ball. R4 reads a '
      + 'frame frozen at t=0. No ball lands on the source, and `srcDisk` in `lit` would light it '
      + 'from 0ms, before the call that asks for the copy has left the fit test' },
  { axis: 'R2-ENTRY', card: 'storage-pvc-clone', where: ['5', 'phase'],
    why: 'the documented blind spot, the `cluster-server-side-apply` idiom: `bound` winds the clone '
      + 'phase back to Pending below the guard and turns it to Bound on the relation fade through an '
      + '`F.set`, so a frame frozen at t=0 first sees Bound on `independent`. It IS cued, on `bound`. '
      + 'DO NOT light it on `independent`, where the only thing that happens is the source going' },
  // The sending row does not exist at step entry: it is the entry the plugin makes on this step.
  ...[['2', '.../globalmount'], ['3', '.../uid-a/.../mount'], ['5', '.../globalmount']].map(([step, row]) => ({
    axis: 'R4', card: 'storage-mount-propagation', where: [step, row],
    why: 'the row is the mount entry Pod csi-node makes on this step: the Pod blinks, the row fades '
      + 'from pending to full with `lights` on that fade at 1300ms, and the repeat leaves one '
      + 'BEAT.afterHop later. R4 credits only a ball arriving, and no ball makes a mount entry. The '
      + 'row in `lit` would light an entry that the step opens without and the narration has not '
      + 'made yet, which is the one thing this card is careful to show in order.' })),
  { axis: 'R4', card: 'storage-volumeattachment', where: ['5', 'Kubelet'],
    why: 'the network-hostnetwork-hostport class: the gate ball stops on the Node FRAME right face, '
      + 'level with Kubelet (the frame clause of L-11), so no ball lands on the Kubelet box itself. '
      + 'The mid-chain shape is what the step runs, `F.light` on the `gate` arrival at 769ms with the '
      + 'mount leaving one BEAT.afterHop later. `kube` in `lit` would light it from 0ms, before the '
      + 'gate that frees it, and hide the moment it stops waiting' },
  { axis: 'R4', card: 'storage-pv-reservation', where: ['1', 'PV controller'],
    why: 'the controller is MID-CHAIN on `reserve` and is cued as one: it acts on the patch, so an '
      + '`F.light` lights it on the patch arrival at the PV and its Available write leaves one '
      + 'BEAT.afterHop later. No ball lands on the controller itself, so R4 finds no earlier arrival. '
      + '`ctrl` in `lit` would light the controller from 0ms, while the administrator is still the one '
      + 'acting and nothing has changed for it to react to' },
  { axis: 'R4', card: 'network-loadbalancer-straight-to-pods', where: ['4', 'Cloud LoadBalancer'],
    why: 'the balancer is MID-CHAIN on `replace` and is cued as one: the register ball from the controller lands on the bottom face of the target ladder that hangs flush under the balancer, `lights: [\'lb\']` lights the balancer on that arrival, and the health check leaves it one BEAT.afterHop later. R4 matches an earlier arrival by where the ball stops, and the ladder is a chain, not the box, so it sees no arrival on the balancer. The other shape, `lb` in `lit`, would say the balancer acts first on a step the EndpointSlice opens. `register` draws the same arrival and escapes R4 only because no ball leaves the balancer there.' },
  { axis: 'R4', card: 'network-hostnetwork-hostport', where: ['3', 'Node eth0'],
    why: 'the ball this step opens with is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y and never crosses the border, so the NIC 34 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `F.light` on the `inb` arrival at 700ms with the onward hop leaving at 800ms, one BEAT.afterHop later, which is the separation every chained hop in the catalogue uses. R4 reads a frame frozen at t=0 and its own header names this class. The other shape was measured: `eth` in `lit` closes both rows, 42 back to 40 catalog-wide, with no R3 row and a green render, and it costs the only arrival beat the step has, because a box already lit at entry does not light again when the ball lands on the Node. The exemplar draws the same shape, `network-nodeport-loadbalancer client-hit` lights np1 on the frame arrival, and escapes R4 only because a chip is not a block it judges.' },

  { axis: 'R4', card: 'network-containers-share-localhost', where: ['4', 'eth0'],
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

  // A watch ball delivered to a Node frame lights the sender inside it (NET.A-02), which R4 cannot see.
  ...['1', '2', '3', '4', '6'].map(step => ({
    axis: 'R4', card: 'network-dns-pod-policy', where: [step, 'resolvConf file'],
    why: 'the watch ball is delivered TO the Node (NET.A-02): it stops on the frame top face midpoint at NODE_Y=260 on x=600 and never crosses the border, so the file box standing 40 units inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `lights` on the watch arrival at 1500ms with the file hop leaving at 1600ms, one BEAT.afterHop later. The other shape is measured and rejected: `hostFile` in `lit` closes the row, and it lights a block inside the frame 1500ms before the ball that addresses it gets there, which reads as the file answering a request nobody has sent yet. The picture wins over the row, and R4 reads a frame frozen at t=0 where no arrival cue exists yet.' })),
  { axis: 'R4', card: 'network-dns-pod-policy', where: ['5', 'Kubelet'],
    why: 'dnsPolicy None reads no file, so the Kubelet is the sender of the only hop after the watch ball, and it is cued exactly as the file box is on the other five steps: `lights` on the watch arrival at 1500ms, with the CRI hop leaving at 1600ms. The watch ball stops on the Node frame face (NET.A-02) and lands on no block, so R4 sees no arrival to credit. `kubelet` in `lit` closes the row and lights the Kubelet from 0ms, while the ball carrying the Pod spec to it is still falling.' },
  { axis: 'R4', card: 'storage-csi-ephemeral-volume', where: ['6', 'Kubelet'],
    why: 'the Pod deleted ball is delivered TO the Node: it stops on the frame left face midpoint at 420,336 and never crosses the border, so the Kubelet standing inside receives no arrival R4 can see. The mid-chain shape is what the step runs, `lights` on that arrival at 2300ms with the unpublish leaving at 3900ms, once the Pod has faded. `kubelet` in `lit` closes the row and lights the Kubelet from 0ms, while the ball carrying the deletion to it is still in the funnel, the same shape network-dns-pod-policy carries on its step 5.' },
  // app.conf answers an open, so its cue is an F.light on an earlier beat, invisible at t=0.
  { axis: 'R4', card: 'storage-configmap-secret-mount', where: ['2', 'app.conf'],
    why: 'the app.conf row is lit by the `F.light` on the v2 write arrival at 4150ms and its read leaves at 4950ms, the BEAT.lead 800 separation M-18 asks for. No ball ever lands on the row, so R4 finds no earlier arrival. `confRow` in `lit` would light the entry from 0ms, before the watch and the v2 write the read waits on.' },
  { axis: 'R4', card: 'storage-configmap-secret-mount', where: ['3', 'app.conf'],
    why: 'the app.conf row is lit by the `F.light` on the rename beat at 2800ms, the moment ..data and so app.conf start resolving to v2, and its read leaves at 4700ms. No ball ever lands on the row, so R4 finds no earlier arrival. `confRow` in `lit` would light the entry beside a still lit Kubelet from 0ms, before the ..data_tmp link it depends on exists.' },

  { axis: 'R4', card: 'workloads-container-restarts-laststate', where: ['6', 'Kubelet'],
    why: 'the Kubelet is MID-CHAIN on `logs` and is cued as one: `F.light` on the `ask` arrival lights '
      + 'it at 1500ms and the readlog hop leaves one BEAT.afterHop later. R4 reads a frame frozen at '
      + 't=0 and credits only a ball landing on the box, so it cannot see the F.light. `kubelet` in '
      + '`lit` would light it before the request that sets it working has arrived' },
  { axis: 'R4', card: 'workloads-pod-scheduling-gates', where: ['6', 'example.com/bar'],
    why: 'the ball re-emerges at the far face of the gate assembly (A-19): the sender is the Pod, '
      + 'which pulses first, and the gate it passes is the removed ghost at OPACITY.terminated. '
      + 'Lighting the gate would say the entry the previous step removed is back in the list' },

  // FORM-B: rows the lead ranking put high that a person read and kept.
  { axis: 'FORM-B', card: 'storage-downward-api-volume', where: ['relabel', 'objChip'],
    why: 'the chip is the value on the Pod OBJECT, and the relabel IS the step entry: the zone row '
      + 'turns to west and lights at entry beside it. The ball that follows carries that new value '
      + 'from the object to Kubelet, so it is the sender of the chip value, never the arrival that '
      + 'earns it. The file and env chips are the ones a ball earns, and both wait for it.' },
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
  { axis: 'FORM-B', card: 'cluster-list-watch-informers', where: ['watch', 'watchChip'],
    why: 'the INFORMER opens the watch, so `open · chunked HTTP` is true the moment it issues the '
      + 'GET, and the one ball of the step is the stream the API sends DOWN that open connection. '
      + 'The ball rides the open watch rather than opening it, so binding the chip to its arrival '
      + 'would draw the stream arriving on a connection the picture still calls closed.' },
  { axis: 'FORM-B', card: 'cluster-scheduler-decision', where: ['bind', 'winnerChip'],
    why: '`Node-4 · 92` is the verdict of the scoring the PREVIOUS step drew, and the verdict is '
      + 'what SENDS the first ball of this step, the Binding POST to the API. It stands before the '
      + 'ball departs rather than after anything lands, the shape of `cluster-leader-election '
      + 'renew v1`. Binding it to the POST arrival would draw the Scheduler posting a Binding for '
      + 'a Node it had not yet picked.' },
  { axis: 'FORM-B', card: 'cluster-static-pods', where: ['manifest', 'fileChip'],
    why: 'the file is earned by the fileBox REVEAL, which starts at 0 beside the chip, and the one '
      + 'ball of the step is the Kubelet READING that file, which leaves at REVEAL_MS once it is on '
      + 'disk. The lead the queue ranks is measured to that read, which the file is the source of, '
      + 'not its result. `edit-file fileChip` on FORM-E is the same shape on the same chip.' },
  { axis: 'FORM-B', card: 'cluster-static-pods', where: ['drain', 'mirrorChip'],
    why: 'the chip restates what the step wire states at entry, `kubectl drain Node-1 · mirror Pods '
      + 'are skipped`: the drain policy is known before any ball moves, and P-04 keeps chip and wire '
      + 'together. Deferring the chip alone would split one fact across two places' },
  { axis: 'FORM-B', card: 'workloads-graceful-shutdown', where: ['expiry', 'graceChip'],
    why: 'the window reading 0s · expired at entry is the PREMISE of the step, not something the '
      + 'ball produces: the timer reaching 0 is what makes the Kubelet send SIGKILL, so the kill '
      + 'ball leaving at BEAT.lead and landing at 1500ms is the consequence of the value already '
      + 'on screen. Binding the chip to that arrival would draw the kill causing the expiry.' },
  // All three chips are stated at entry and the changed ones lit, standing for BEAT.lead before the first ball.
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

  // Captions and premises: no ball carries them, so there is no arrival to wait for (P-06).
  { axis: 'FORM-B', card: 'workloads-probes', where: ['startup-gating', 'startupChip'],
    why: '`probing 4/30` is the state the whole step names, true for its whole length: the probe ball '
      + 'is one period of it, and no arrival earns `probing`. The verdicts the card does earn, on '
      + 'every later step, wait for the report that carries them' },
  ...['statusChip', 'restartChip', 'ageChip', 'holdChip'].map(chip => ({ axis: 'FORM-B', card: 'workloads-pod-pending-init-states', where: ['init-failing', chip],
    why: 'the step opens after a time skip, on a loop already live: init-1 is lit and reads '
      + 'CrashLoopBackOff at entry, so the four row cells agree with the box from the first frame. '
      + 'The one ball is the Pod REPORTING upward and produces none of them, and AGE is the clock of '
      + 'the Pod. Winding them back would draw a crash loop under a row still reading Init:0/2' })),
  ...['scheduled', 'initialized', 'containers-ready'].map(step => ({ axis: 'FORM-B', card: 'workloads-pod-startup-conditions', where: [step, 'timeChip'],
    why: 'the chip is the lastTransitionTime of the one tread this step flips, and that tread is '
      + 'taken and lit at entry beside it. The condition is stamped where it is written, before the '
      + 'ball that reports it leaves, so binding the chip alone to the arrival would split the stamp '
      + 'from the rung it dates (P-04)' })),
  ...[
    ['policy', 'focusChip', 'names the field the step reads, Pod-level and defaulting to Always'],
    ['exit-zero', 'focusChip', 'states the restart rule for exit 0'],
    ['exit-nonzero', 'focusChip', 'states the restart rule for a non-zero exit'],
    ['backoff', 'focusChip', 'states the shared backoff rule'],
    ['backoff', 'pod3Chip', 'is counterfactual: it states what does NOT happen to the Never Pod, which no arrival can earn'],
  ].map(([step, chip, what]) => ({ axis: 'FORM-B', card: 'workloads-pod-restart-policy', where: [step, chip],
    why: 'the chip ' + what + '. It is true before any ball, the daemonset focus caption convention, '
      + 'and the status PATCH that follows reports a decision already made' })),
  ...[
    ['exit-zero', 'pod1Chip'], ['exit-zero', 'pod2Chip'], ['exit-zero', 'pod3Chip'],
    ['exit-nonzero', 'pod2Chip'], ['exit-nonzero', 'pod3Chip'],
    ['backoff', 'pod1Chip'], ['backoff', 'pod2Chip'],
  ].map(([step, chip]) => ({ axis: 'FORM-B', card: 'workloads-pod-restart-policy', where: [step, chip],
    why: 'the result is earned by the IN-PLACE exit, all three Pods pulsing at REACT_MS 400, which no '
      + 'ball carries. The 1900ms the queue ranks is the status PATCH that leaves AFTER the Kubelet '
      + 'decided, so the real lead is 400ms, inside the entry beat P-06 allows. The three Pod chips '
      + 'move together on every step, so deferring one alone would be the P-04 split' })),
  ...['schedule', 'cgroups', 'tiers'].map(step => ({ axis: 'FORM-B', card: 'workloads-pod-qos-classes', where: [step, 'focusChip'],
    why: 'a caption of the rule the step states, not object state: the record keeps the order on the '
      + 'sublabels and holds the focus chip and the qosClass chips uncued together (P-09a, P-04)' })),
  { axis: 'FORM-B', card: 'workloads-daemonset', where: ['node-join', 'focusChip'],
    why: 'the same caption convention as the five FORM-E daemonset focus rulings: the step moves no '
      + 'counter on purpose, and the caption states its premise, Node-4 joining without the label, '
      + 'which no arrival produces' },
  { axis: 'FORM-B', card: 'workloads-pod-scheduling-gates', where: ['queued', 'metricChip'],
    why: 'the card record rules it: the metric is the ONE reading this step turns over and it is the '
      + 'answer the narration gives at entry, the enqueue following from step 5 emptying the list. '
      + 'The ball draws the Pod reaching the queue and does not move the count, so winding it back '
      + 'would count the Pod as gated for the opening beat of the step that says it joined active' },
  { axis: 'FORM-B', card: 'workloads-replicaset', where: ['converge', 'actChip'],
    why: 'the ReplicaSet acts first: it is lit at entry and its DELETE leaves at 0ms, so `delete -1` '
      + 'names the decision being sent rather than the result of an arrival (P-06, M-18a)' },

  // FORM-E: ../unit/chip-beat-e.test.mjs asserts on this set, so a stale entry turns the gate red.
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
  { axis: 'FORM-E', card: 'cluster-node-failure', where: ['evict', 'leaseChip'],
    why: '`over 350s · Expired` is a CLOCK, the age of a Lease nobody has renewed, and it grows '
      + 'whether or not anything travels. The DELETE this step sends does not produce it: the age '
      + 'passing 50s plus 300s is the expiry the step opens on, and it is why the toleration has '
      + 'run out and the DELETE leaves at all. Its neighbour evictChip waits because `Terminating` '
      + 'is what that DELETE writes, and until it lands the timer reads `0s · Expired`, which this '
      + 'clock agrees with. Binding the age to that arrival would say a deletion reaching the Node '
      + 'is what aged the Lease.' },
  { axis: 'FORM-E', card: 'cluster-static-pods', where: ['edit-file', 'fileChip'],
    why: 'fileChip is the manifest file on disk, and the file is the SOURCE of the first ball here, '
      + 'the spec segment running from fileBox to the Kubelet. The edit therefore has to be on '
      + 'screen before the ball leaves, not after it lands. Step 1 is the same shape and reads '
      + 'correctly: the chip takes the new filename at entry and the segment leaves REVEAL_MS '
      + 'later.' },
  // `last op` names the CRI call the step sends. The result chips wait for the arrival.
  ...[
    ['sandbox', 'RunPodSandbox', 'sandbox id and status wait for the `run` arrival, where the sandbox appears on the Node'],
    ['cni', 'CNI ADD', 'Pod IP, status and the shell sublabel wait for `conf`, where the netns config lands on the sandbox'],
    ['image', 'PullImage', 'status waits for the PullImage call to land on the runtime'],
    ['create', 'CreateContainer', 'status waits for `create`, where the container lands dim inside the sandbox'],
    ['start', 'StartContainer', 'status and the app sublabel wait for `start`, where the container brightens'],
  ].map(([step, call, neighbours]) => ({ axis: 'FORM-E', card: 'cluster-pod-sandbox-cri', where: [step, 'lastOpChip'],
    why: `\`${call}\` is the call this step SENDS, and the call is what puts the first ball on the `
      + 'wire, so it is true before anything departs rather than after anything lands, the shape of '
      + `\`cluster-leader-election renew v1\`. What the arrival earns is the result: ${neighbours}. `
      + 'Binding the call name to its own arrival would draw the Kubelet calling nothing for 700ms.' })),
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
      + 'back and turns over on the arrival at 2300ms.' },
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
      + 'anything departs. What the watch arrival earns are the three counters, which this step '
      + 'drops together on it.' },
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
  { axis: 'FORM-E', card: 'workloads-pod-pending-init-states', where: ['init-running', 'nodeChip'],
    why: 'the Scheduler BINDS the Pod before the Kubelet ball leaves, and no bind ball is drawn: '
      + 'the step opens on `A Node is chosen, the Node column fills in, and the Kubelet takes over`, '
      + 'and the Node-1 frame and its corridor come up to full strength at entry. The holder stands '
      + 'beside it as `the Kubelet, starting init 1`, the same bind read from the Node side, and '
      + 'winding NODE back would draw a full Node-1 frame under a <none> cell. What the Kubelet ball '
      + 'earns is containerStatuses, the STATUS counter, `running init 1`, the box readings and the '
      + 'Pod line, and those wait for it.' },
  // The fixed container already runs at step entry.
  ...['stateChip', 'reasonChip', 'restartChip'].map(chip => ({ axis: 'FORM-E', card: 'workloads-crashloopbackoff', where: ['reset', chip],
    why: 'the new container running stably is the PREMISE of the step: the Pod blinks and lifts to '
      + 'full strength at 0ms, and the state, the cleared reason and the counter that moved with the '
      + 'new container all describe it from the first frame. The one ball is the healthy report '
      + 'going to Kubelet, and what it earns is the backoff reset, which is the chip this step holds '
      + 'back to its arrival, where the ghost bar rises. Winding these back would draw a Pod at full '
      + 'strength still reading Waiting in CrashLoopBackOff.' })),
  // The runtime is lit at entry and acts first, reporting a change that already happened.
  ...[
    ['migrate-schema', 'waitDbChip', 'wait-for-db has exited 0'],
    ['sidecar-start', 'migrateChip', 'migrate-schema has exited 0'],
    ['main-start', 'sidecarChip', 'the sidecar has reported Started and runs on'],
  ].map(([step, chip, what]) => ({ axis: 'FORM-E', card: 'workloads-init-containers-and-sidecars', where: [step, chip],
    why: what + ' when the step opens, which the narration states first: the runtime is lit at '
      + 'entry because it is the one acting, and the ball it sends up the answer lane REPORTS that '
      + 'change to Kubelet rather than producing it. What the chain earns is the next container, '
      + 'and that chip waits for the create landing on its box. Winding this one back would draw '
      + 'a runtime reporting a change the chip says has not happened.' })),
  // The Kubelet reaches the lastTransitionTime verdict on its own, at entry.
  { axis: 'FORM-E', card: 'workloads-pod-startup-conditions', where: ['ready', 'timeChip'],
    why: 'the chip is the lastTransitionTime of the ONE tread this step flips, Ready, and the '
      + 'Kubelet computes that verdict on its own: it is lit at entry and its PATCH waits BEAT.lead. '
      + 'The tread is taken and lit at entry, so the stamp and its rung are one fact, and binding '
      + 'the chip alone to the arrival would split it from the rung it dates (P-04). What the PATCH '
      + 'landing on the API earns is the endpoint turning ready=true and the Pod line turning to '
      + 'serving, and both wait for it.' },
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
    why: 'The narration of this step is `The reply walks no masquerade rule at all`, so `no nat rule '
      + 'walked` is the premise the step reasons from and is true for its whole length rather than '
      + 'at a moment inside it. The card has the deferral technique and applies it to the two chips '
      + 'the arrival does earn. Deferring this one would leave the step reading MASQUERADE for its '
      + 'first 700ms, which is the claim the step exists to deny.' },
  { axis: 'FORM-E', card: 'network-pod-egress-snat', where: ['masquerade', 'srcChip'],
    why: 'MASQUERADE rewrites the source inside the rule box, where the packet already stands when '
      + 'the step opens. Both balls of the step leave AFTER the rewrite: the store ball carries the '
      + 'translated flow to conntrack, and the out ball carries the rewritten source on its tag. '
      + 'Neither produces it. ctChip waits because the entry exists only once the store ball lands, '
      + 'and `none` beside a rewritten source is the order the narration states: rewrite, then store.' },
  { axis: 'FORM-E', card: 'network-pod-egress-snat', where: ['masquerade', 'ruleChip'],
    why: 'The walk ended on MASQUERADE in the rule box before this step opens, the fall-through the '
      + 'previous step narrates, and the rewrite beside it is that rule acting. No arrival on this '
      + 'step produces the match. ctChip is the one value an arrival earns here, and it waits for '
      + 'the store ball.' },
  // The policy is applied before the call leaves, so the rule chip is the step premise.
  ...[
    ['isolate', 'inChip', 'The NetworkPolicy that selects db-1 and allows nothing is the premise of the step: '
      + 'selecting the Pod raises the boundary before the call leaves web-1, and the bar is drawn from '
      + 'entry for the same reason. No arrival writes a rule. vChip waits because the drop is what '
      + 'the ball earns, and `in flight` beside `allows nothing` contradicts nothing while it travels.'],
    ['allow', 'inChip', 'The ingress rule is written into the policy before the call is sent, which is the '
      + 'order the narration states: the policy gains a rule, then the same call passes. No arrival '
      + 'writes a rule. vChip waits for db-1 to take the call, and `in flight` beside `from role=web` '
      + 'is the moment before that answer.'],
    ['both-ends', 'egChip', 'The second policy and its egress rule are the premise the step opens on: it '
      + 'selects web-1, and the boundary on the way out stands before the call leaves. No arrival '
      + 'writes a rule. vChip waits for the call to clear both boundaries and land on db-1, and reads '
      + '`in flight` until then.'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-E', card: 'network-policy', where: [step, chip], why })),
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
  // CNI op is a step-scoped label for the operation in flight, stated at entry.
  { axis: 'FORM-B', card: 'network-wiring-pod-via-cni', where: ['sandbox', 'opChip'],
    why: 'CNI op names the operation in flight, and on this step the answer is that there is none: '
      + 'not called yet is TRUE from the moment the step opens, because the whole point of the '
      + 'sandbox step is that the plugin list has not run. Neither ball carries it. RunPodSandbox '
      + 'goes Kubelet to runtime and create netns goes runtime to sandbox, and what those arrivals '
      + 'earn is the runtime lighting and the Pod pulsing. The two chips that ARE results on this '
      + 'card, the address on delegate and ADD ok on result, both wait for their arrivals through '
      + 'a rewind and an F.set, and neither is on this queue.' },
  { axis: 'FORM-B', card: 'network-wiring-pod-via-cni', where: ['exec', 'opChip'],
    why: 'ADD is the operation this step NAMES rather than one its ball produces: the runtime sets '
      + 'CNI_COMMAND=ADD before it execs anything, which is what the narration says in words, so '
      + 'the value is true at the departure and not at the arrival. What the exec ball earns is the '
      + 'bridge row it lands on. Binding the chip to that arrival would say the plugin decided '
      + 'which operation it was being run for.' },
  { axis: 'FORM-B', card: 'network-wiring-pod-via-cni', where: ['join', 'opChip'],
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
      + 'gating itself is animated by network-service-and-endpointslice, which this card cedes it to.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['wrong-port', 'listenChip'],
    why: 'the container listens on 8080 before the client dials: a state, not an arrival. The ball '
      + 'reaching the Pod edge unanswered is the consequence the chip explains.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['named-port', 'servingChip'],
    why: 'the slice resolves the named port when the Service is written, not when a call lands, so '
      + '10.244.2.7:8080 is true from the first millisecond. The delivered tag rides that value.' },
  { axis: 'FORM-B', card: 'network-service-debugging', where: ['named-port', 'targetChip'],
    why: 'targetPort http is the Service spec the step opens on. No arrival writes a spec field.' },

  // Every chip is a Service field, true before any packet.
  ...[
    ['clusterip', 'typeChip', 'type ClusterIP is the spec field written when the Service is created, before the client dials the VIP'],
    ['clusterip', 'ciChip', 'the clusterIP is allocated when the Service is created, so 10.96.0.20 exists before the client dials it. The vip arrival earns the Service rules lighting'],
    ['nodeport', 'typeChip', 'type NodePort is the spec field the step opens on. No arrival writes a spec field'],
    ['nodeport', 'npChip', 'nodePort 31000 is allocated when the type is written, before any client can dial NodeIP:31000'],
    ['loadbalancer', 'typeChip', 'type LoadBalancer is the spec field the step opens on. No arrival writes a spec field'],
    ['loadbalancer', 'lbChip', 'the LB address is status.loadBalancer.ingress, published once the balancer is provisioned and so before a client can dial 203.0.113.7'],
    ['externalname', 'typeChip', 'type ExternalName is the spec field the step opens on. No arrival writes a spec field'],
    ['externalname', 'ciChip', 'an ExternalName Service has no clusterIP by construction. An absence in the spec, which no arrival makes'],
    ['externalname', 'npChip', 'an ExternalName Service has no nodePort by construction. An absence in the spec, which no arrival makes'],
    ['externalname', 'lbChip', 'an ExternalName Service has no balancer address by construction. An absence in the spec, which no arrival makes'],
    ['headless', 'typeChip', 'a headless Service is type ClusterIP in its spec, the field the step opens on. No arrival writes it'],
    ['headless', 'ciChip', 'clusterIP: None is the spec the step opens on and names, which no arrival writes'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-service-types', where: [step, chip], why })),
  // The rule chips stand beside a verdict that waits for its arrival, so they are FORM-E.
  ...[
    ['implementer', 'inChip', 'with no plugin implementing NetworkPolicy no boundary is ever raised, an absence true from the first millisecond. The two calls only demonstrate it'],
    ['implementer', 'egChip', 'the same absence on the way out of web-1: nothing programs a boundary, so none exists at any moment of the step'],
    ['implementer', 'vChip', '`nothing enforced` is the absence the step opens on, not the outcome of either call: both calls are served exactly because nothing was ever enforced'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-policy', where: [step, chip], why })),
  // The mode is operator config. The arrivals earn the router entry.
  ...[
    ['l2', 'modeChip', 'L2 (ARP) is the L2Advertisement the operator configured, the premise the step opens with. No arrival picks a mode'],
    ['l2', 'spk1', 'the hash election runs before the ARP reply, and spk1 SENDS that reply, lit before it leaves (M-18a). The router sublabel is what the arrival earns, and it waits'],
    ['failover', 'spk1', 'Node-1 has failed when the step opens, its frame dimmed from entry. No ball carries a failure'],
    ['failover', 'spk2', 'memberlist re-election comes first, then spk2 sends the gratuitous ARP as the lit sender. The router entry is what the arrival earns, and it waits'],
    ['bgp', 'modeChip', 'BGP (ECMP) is configuration, the premise the narration opens on. No arrival picks a mode'],
    ['bgp', 'spk1', 'an UPDATE travels only over a session that is already up, so the session is true before the ball leaves. The arrivals earn the router ECMP entry, which waits for u3'],
    ['bgp', 'spk2', 'the same as spk1: the session stands before its UPDATE leaves'],
    ['bgp', 'spk3', 'the same as spk1: the session stands before its UPDATE leaves'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-loadbalancer-without-cloud', where: [step, chip], why })),
  // All eight come from the Pod spec and setup, made before the client dials.
  ...['nsChip', 'ipChip', 'vethChip', 'portChip'].map(chip => ({ axis: 'FORM-B', card: 'network-hostnetwork-hostport', where: ['hostnetwork', chip],
    why: 'follows from `hostNetwork: true` in the Pod spec, set before the Pod started. The request travels under it and does not produce it' })),
  ...['nsChip', 'ipChip', 'vethChip', 'portChip'].map(chip => ({ axis: 'FORM-B', card: 'network-hostnetwork-hostport', where: ['hostport', chip],
    why: 'the Pod keeps its own namespace, and portmap installed the :8080 mapping at Pod setup, before anyone dials. The request travels under it and does not produce it' })),
  // Values the rules are programmed with, standing before the client sends.
  { axis: 'FORM-B', card: 'network-traffic-distribution', where: ['topology', 'modeChip'],
    why: 'the zone filter is set when kube-proxy programs the rules: the zone-b dim and the lit '
      + 'kube-proxy stand from entry, before the client pulses. Binding the chip to the arrival would '
      + 'name the old setting over a picture whose zone is already dimmed' },
  { axis: 'FORM-B', card: 'network-traffic-distribution', where: ['topology', 'pinChip'],
    why: 'sessionAffinity back to None is a spec value, staged one lever at a time, and no connection '
      + 'writes it' },
  { axis: 'FORM-B', card: 'network-traffic-distribution', where: ['fallback', 'modeChip'],
    why: 'the zone-a endpoints are not ready before the step opens, so kube-proxy has already written '
      + 'every ready endpoint into its rules (zone-a dim from entry). The fallback is decided when the '
      + 'rules are programmed, not when the connection lands' },
  // The ball leaves the place that already made the value (P-06).
  ...[
    ['dnat', 'hookChip', 'the packet stands in PREROUTING when the step opens, delivered there on `enter`, and the nat table runs inside it. The ball leaves the hook'],
    ['dnat', 'dstChip', 'the rewrite is made inside PREROUTING, where the packet stands at entry, and the ball leaves carrying the new dst on its tag. Binding the chip to the arrival would put the strip behind the tag on its own ball'],
    ['dnat', 'ctChip', 'conntrack stores the translation where the rewrite is made, inside PREROUTING at entry, beside the dst it records'],
    ['fork', 'hookChip', 'the hook a step opens at is the box the previous arrival delivered the packet to: `rt` lit on the dnat `hop`. The ball here leaves the decision'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-netfilter-path', where: [step, chip], why })),
  // P-06.
  ...[
    ['localhost', 'pathChip', 'the path is fixed by the address the app dials, 127.0.0.1, before the ball leaves. A caption for the road this step rides, and the arrivals earn the lo and sidecar lights'],
    ['external', 'pathChip', '10.244.1.5 lives only on eth0, so the interface is fixed by the destination before the client sends. The arrival lights eth0 itself'],
    ['external', 'bindChip', 'the app made that bind on `bind`, step 1. The call arriving shows what the bind means and cannot be what makes it'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-containers-share-localhost', where: [step, chip], why })),
  // Step-scoped labels, the same reading as network-wiring-pod-via-cni `CNI op`.
  ...[
    ['through', 'pathChip', '`veth, no lookup` states what a veth pair IS, a point to point link, which holds for every packet from the first millisecond. The arrival earns the peer lighting'],
    ['port', 'hostChip', 'enslaving the host end to cni0 is CNI ADD configuration made before the card opens, so the port takes no address before any frame. The 700ms hop earns cni0 lighting'],
    ['port', 'pathChip', 'the road this step frame rides, a caption for the step rather than the result of its one 700ms hop'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-pod-ip-and-veth', where: [step, chip], why })),
  // Decisions made inside the box the packet already stands in (NET.A-01).
  ...[
    ['service', 'dstChip', 'the packet reached nat on `stations`, and the rewrite is made inside the box it stands in. The ball emerges already rewritten, and its arrival earns `route`'],
    ['service', 'verdictChip', 'the Service-range verdict is the same nat decision as the rewrite beside it, made where the packet already stands at entry'],
    ['podcidr', 'verdictChip', 'the route lookup ran when the packet reached `route` at the end of `service`, and the ball here leaves it. `default` binds its own verdict to the arrival on route, so the card is consistent'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-packet-classification', where: [step, chip], why })),
  // One dataplane decision made where the packet already stands.
  ...[
    ['dnat', 'dnatChip', 'the packet reached the dataplane on `send`, which picks the backend and rewrites the destination before the rewritten packet leaves. The ball carries the address the chip names'],
    ['dnat', 'ctChip', 'the conntrack entry is recorded in the same dataplane decision, before the rewritten packet leaves for Pod X'],
    ['dnat', 'backChip', 'the chosen backend is that same decision. The arrival at Pod X earns its pulse, not the choice'],
  ].map(([step, chip, why]) => ({ axis: 'FORM-B', card: 'network-service-clusterip', where: [step, chip], why })),
  { axis: 'FORM-B', card: 'network-pod-egress-snat', where: ['rule', 'ruleChip'],
    why: 'the walk verdict is decided when `send` lands on the rule box in step 1. The one ball of this '
      + 'step is the exempt road NOT taken (T-35), which cannot earn the verdict' },

  // R2-STEP: the chip text changed while the fact did not, so a cue would announce a non-change.
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

  // In a `chips` category `lit` names the step subject (P-09).
  ...[
    ['3', 'livenessProbe', 'livenessProbe reaching `passing` on the step whose subject is readiness'],
    ['5', 'startupProbe', 'startupProbe going to `reset` on the step whose subject is the kill'],
    ['5', 'readinessProbe', 'readinessProbe going to `reset` on the step whose subject is the kill'],
    ['6', 'livenessProbe', 'livenessProbe recovering on the step whose subject is the fresh container'],
    ['6', 'readinessProbe', 'readinessProbe recovering on the step whose subject is the fresh container'],
  ].map(([step, chip, what]) => ({ axis: 'R2-STEP', card: 'workloads-probes', where: [step, chip],
    why: what + '. The card record keeps it dark: lighting it closes the row by pointing the reader '
      + 'at the wrong chip, and lighting every changed chip on a liveness step is the same as '
      + 'lighting none' })),
  { axis: 'R2-STEP', card: 'workloads-replicaset', where: ['5', 'ownerReferences'],
    why: 'the owner was set on `adopt`, and the string returns from the action to the standing '
      + 'field. Same fact, so a cue would announce a write that did not happen' },

  // CENTRE, CENTRE-LOW and OCCLUDED: L-16 cases where satisfying the rule makes the picture worse.
  { axis: 'CENTRE', card: 'cluster-cascading-deletion', where: [],
    why: 'the identical two numbers `cluster-object-create-path` reports for the identical reason, '
      + 'because the two cards share one grid: the client hangs off the right of a composition '
      + 'centred on the frames. Re-centring drags the frames off 600, which is what keeps the Node '
      + 'pair two straight verticals. The finding also stands against an OCCLUDED one that would '
      + 'score the kubectl block 100% under the panel, and the trade is the point: a composition '
      + 'leaning 70 units off centre costs a reader less than an actor block the panel deletes on '
      + 'six steps of eight.' },
  { axis: 'CENTRE-LOW', card: 'storage-reclaim-policy', where: [],
    why: 'the stack starts at the panel wall (both columns and the provisioner span 400..880, pinned '
      + 'there by the claim row inside the panel band), and the one block beside it below the panel '
      + 'is the StorageClass, 120..352, left of the provisioner it feeds. A single side block cannot '
      + 'centre this band from either side: on the right it reads 400..1160 on 780 and reopens the '
      + 'content half of CENTRE, while on the left it balances the Administrator above it and the '
      + 'pooled bbox reads 120..1160 on 640, so that half closes and this row is the one left. The '
      + 'record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-reclaim-policy', where: [],
    why: 'the chip strip half only. The 2x2 chip grid stands under its two columns, 400..880 on 640: '
      + 'each chip reports the stack directly above it, and centring the strip on 600 stands every '
      + 'chip 40 off its column so the grid stops reading down a stack. The columns are the catalog '
      + '232 from the panel wall at 400 with the family 16 between them, which is the narrowest '
      + 'the stack can be. The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-dynamic-provisioning', where: [],
    why: 'the blocks read 400..904 on 652, 12 past L-13. Every block is the catalog 232, and the claim '
      + 'row sits inside the panel band so LEFT_X 400 cannot move. The only width left to give is the '
      + '40 elbow channel: at 16 the centre reaches 640, but the elbow stubs shrink to 8 with the '
      + 'arrowheads on the turns and the class reference between claim and StorageClass is one dash '
      + 'long. The record carries the same argument under OPEN' },
  { axis: 'CENTRE-LOW', card: 'storage-dynamic-provisioning', where: [],
    why: 'the same lean as the CENTRE row on this card: the three blocks below the panel are the '
      + 'machinery column and the cylinder, 400..904 on 652, and the reason is the same 40 channel' },
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
      + 'straight segment. Widening the client to the 232 the API carries is the other route and it '
      + 'is refused on measurement: the band outside the wall is 150 units, the viewBox width '
      + 'available is 1200 at 1280x860 and below, and +90 shrinks the whole card by 7% there.' },
  { axis: 'CENTRE-LOW', card: 'cluster-object-create-path', where: [],
    why: 'the same complaint as the CENTRE row on this card with the frame walls left out. '
      + 'CENTRE-LOW judges against the panel bottom of ONE viewport, 143 at 1600x1000, and the '
      + 'blind-spot block below says so itself: at the worst-of-three bottom, 230, the finding '
      + 'drops.' },
  { axis: 'CENTRE', card: 'storage-ephemeral-storage-eviction', where: [],
    why: 'the rule counts the two top-row blocks, the Pod 484..716 and the Kubelet 884..1116, and not '
      + 'the gauge, which is bare rects (P.raw) and spans 120..1080 on centre 600 with the chip strip '
      + 'at 112..1088. The top row stands right of the panel because the panel reaches x<=397 down to '
      + '205 at 1100x800 and the row sits at 80..184, so neither block can start left of 420: the '
      + 'furthest left the pair can go still centres on about 770. Drawing the gauge as a box would '
      + 'label and centre it as one block and lose the to-scale segments the card is built on.' },
  { axis: 'CENTRE', card: 'storage-volume-model', where: [],
    why: 'two rows, one ruling. The Pod spec ladder 32..392 is a P.chain, so the rule reads it as a '
      + 'chip strip centred on 212, and the content row leaves both it and the timeline row labels '
      + 'at x 40 uncounted, reading 200..1168 on 684. The whole ink spans 32..1168 on centre 600. The '
      + 'Pod stands right of the panel because its top row sits at 104..184 while the panel reaches '
      + 'x<=397 down to 180 at 1100x800. The record carries the same argument under OPEN' },
  { axis: 'CENTRE-LOW', card: 'storage-volume-model', where: [],
    why: 'the same lean as the CENTRE row on this card: the timeline bars start at 200 because the '
      + 'row labels own 40..190, and the labels are tags the rule does not count' },
  { axis: 'CENTRE', card: 'storage-pv-lifecycle-phases', where: [],
    why: 'two rows, one ruling. The rule counts neither chips nor frames, so it reads the content as '
      + '400..1179 on 790 and the chip column as a strip on 210. The column is the PV object, its '
      + 'fields stacked bottom left where the full width is free below the panel, and with it the ink '
      + 'spans 80..1179 on 630. The row cannot centre on 600 instead: the controller band spans exactly '
      + 'the row, and a band at 231..969 would stand under the panel at 1100x800 (x<=397 above y 205). '
      + 'The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-where-volume-data-lives', where: [],
    why: 'two rows, one ruling. The rule counts neither the Node frame nor the chips as ink, so it '
      + 'reads 410..1170 on centre 790. The ledger column 60..380 is the second axis of the card and '
      + 'owns the left under the panel on purpose: the whole ink, ledger included, spans 60..1170 on '
      + 'centre 615. Moving the tiers left puts the Pod and the frame label under the panel at '
      + '1100x800 (x<=397 above y 205), and centring the ledger as a strip puts it under the Pod. The '
      + 'record carries the same argument under OPEN' },
  { axis: 'CENTRE-LOW', card: 'storage-pv-lifecycle-phases', where: [],
    why: 'the same blocks as the CENTRE content row, 400..1179, with the chip column that balances '
      + 'them uncounted: the rule reads chips as a strip, not as ink. With the column, the band below '
      + 'the panel spans 80..1179 on 630. The CENTRE ruling above carries why the row itself cannot '
      + 'move onto 600' },
  { axis: 'CENTRE-LOW', card: 'storage-where-volume-data-lives', where: [],
    why: 'the same six blocks as the CENTRE content row, 450..1085, with the ledger column that '
      + 'balances them uncounted because it is chips' },
  { axis: 'CENTRE', card: 'storage-filesystem-vs-block', where: [],
    why: 'the chip row runs along the top of the Node frame, exactly as wide as it, 300..1160 on '
      + 'centre 730, because the chips report on what happens inside that frame. The drawn extent, '
      + 'disks included, spans 40..1160 on centre 600. Centring the row on 600 puts its left end over '
      + 'the disk corridor and under the narration panel at 1100x800 (x<=397 above y 205), and the '
      + 'row cannot go under the frame, which ends 47 units above the canvas floor. The record carries '
      + 'the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-default-storageclass', where: [],
    why: 'the class catalog 772..1068 is a P.chain, so the rule reads it as a chip strip centred on '
      + '920. It is no strip: it is the list the admission plugin reads, standing right of that box '
      + 'on its mid height, and it carries no chip. The blocks span 88..1112 on centre 600. Centring '
      + 'the chain on 600 puts it on top of the admission box, and moving it under the claims row '
      + 'takes it away from the plugin that reads it. The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-pv-reservation', where: [],
    why: 'the six chips are two columns of fields, three under PV pv-data at 484..716 and three under '
      + 'PVC app/restore at 860..1092, so each value stands under the object it belongs to and a row '
      + 'reads across as the two halves of the reservation. The rule reads them as one strip on 788. '
      + 'The blocks span 124..1092 on centre 608. Centring the grid on 600 lifts every chip off its '
      + 'object, and moving the pair left onto 600 leaves no room for the administrator lane into '
      + 'the PV. The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'network-loadbalancer-straight-to-pods', where: [],
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
  { axis: 'OCCLUDED', card: 'cluster-server-side-apply', where: ['kubectl'],
    why: 'the author ruled the three top-row actors onto the family 232 with the 60 unit gaps the '
      + 'arrow pairs need, so the row is 816 wide, right-aligned on 1140 and starting at 324. The '
      + 'panel reaches 396.55 at 1100x800 and 377.76 at 1280x860, so the left 73 and 54 units of '
      + 'kubectl stand behind it there and nothing at 1600x1000. The label `kubectl` stays clear, '
      + 'the sublabel `apply --server-side` inks from 381.7 at 1100x800 and loses its first 15 '
      + 'units. Closing it means narrower boxes or 20 unit gaps, which is what the row had before.' },
  { axis: 'OCCLUDED', card: 'cluster-pod-sandbox-cri', where: ['Kubelet'],
    why: 'the same ruling as `cluster-server-side-apply`: three family 232 actors with 60 unit gaps, '
      + 'right-aligned on 1140, so the Kubelet starts at 324 against a panel reaching 396.55 at '
      + '1100x800 and 377.76 at 1280x860. No text is lost, `Kubelet` inks from 417.3 and `CRI '
      + 'client` from 409.3 at 1100x800. Closing it means the 180 / 210 / 180 boxes the row had '
      + 'before, built leftwards off the 404 wall.' },
  // The card sits on the canvas centre by design, so the csi-node table top is behind the panel on smaller viewports.
  ...[['.../kubelet/plugins', '73'], ['.../kubelet/pods', '73'], ['Pod csi-node', '40']]
    .map(([block, pct]) => ({
      axis: 'OCCLUDED', card: 'storage-mount-propagation', where: [block],
      why: `${pct} percent behind the panel at its worst, on the author ruling that the frame and the `
        + 'chip grid centre on 600 even where the panel covers them. The 740 frame then starts at 230, '
        + 'and a frame kept clear of the panel (x 420..1160) is the rejected alternative. Every string '
        + 'is readable at 1600x1000, and the two covered rows are the Bidirectional binds that step 2 '
        + 'names in full in its own narration.',
    })),
  { axis: 'OCCLUDED', card: 'storage-access-modes', where: ['Pod app-1'],
    why: 'the node row spans 306..894 so it stands flush over the driver band, a choice the author '
      + 'made over the row at x=400 that cleared the panel and centred on 647. Pod app-1 then spans '
      + '340.8..468.8 and is 44 percent behind the panel at 1100x800 and less at 1280x860, TEXT '
      + 'included: part of its label and its container sit under the panel there. At 1600x1000 the '
      + 'panel ends at 290.8 and nothing is covered.' },
  { axis: 'OCCLUDED', card: 'storage-access-modes', where: ['ctr'],
    why: 'the container box inside Pod app-1, 42 percent behind the panel at 1100x800, for the same '
      + 'reason and on the same author ruling as the Pod around it.' },
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
  // CENTRE fires twice here with one key, so one reason answers both.
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

  { axis: 'CENTRE', card: 'workloads-probes', where: [],
    why: 'the card record OPEN: the chip strip spans 140..450 and centring it on 600 puts it at '
      + '445..755, across the three probe lanes at 528 / 600 / 672 that run from 120 to 464, which '
      + 'L-10 forbids. A full-width strip is four across at 270 a cell, which WL.L-05 refuses. The '
      + 'content bbox is 140..1060 and centres on 600 exactly' },
  { axis: 'OCCLUDED', card: 'workloads-env-before-pid-1', where: ['ConfigMap app-config'],
    why: 'the card record OPEN: the source row starts at 254 so the spine lands on 600 with straight '
      + 'legs. Held to the L-03 floor of 420 the row midpoint is 766 and the card leans 166 right of '
      + 'WL.CX. The label is cut 61% at 1280x860 and 75% at 1100x800, and the lever that would close '
      + 'it is clamping the panel height in CSS, which is catalog-wide (L-05a)' },

  // A-05: a fan leg nothing rides is correct (NET.A-03). ../unit/lane-shared.test.mjs asserts on this set.
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
  { axis: 'A-05', card: 'network-traffic-distribution', where: ['[[588,320],[700,320],[700,229],[740,229]]'],
    why: 'FAN_A2. network/CARDS/network-traffic-distribution.md: "FAN_A2 carries no ball on its step. It '
      + 'is the endpoint the traffic distribution did NOT pick, and the point of the card is that '
      + 'the choice was made '
      + 'among the drawn candidates rather than forced." NET.A-03.' },
  { axis: 'A-05', card: 'storage-reclaim-policy', where: ['[[764,350],[764,390]]'],
    why: 'W_RET_WIPE, and the card says so at the declaration: "drawn, never travelled: that is '
      + 'Retain". The whole subject of the card is that the Retain column HAS the lane the Delete '
      + 'column uses and never sends anything down it, so removing the arrowhead would remove the '
      + 'comparison.' },
  { axis: 'A-05', card: 'storage-detach-on-node-failure', where: ['[[578,282],[578,260],[496,260],[496,192]]'],
    why: 'W_ATTACH_A, and the record answers this exact question with a NO: "W_ATTACH_A is reported '
      + 'as a lane nobody rides, and converting it to a relationPath is DECLINED: sinking one half '
      + 'of a deliberately symmetric pair makes the left lane the lesser arrow, which is the thing '
      + 'this card goes out of its way not to do." The card says which half is live through '
      + 'OPACITY instead.' },

  // SIMULTANEOUS and LIT-NOT-WRITTEN are empty: both queues reached zero.
];

// Byte for byte the key consuming files build from a finding.
export const carryKey = (card, where = []) => [card, ...where].join(' ');

const known = (axis) => {
  if (!Object.hasOwn(AXES, axis)) {
    throw new Error(`carried.mjs knows no axis '${axis}'. Add it to AXES with the file that reads ` +
      'it and the shape of its `where`, or fix the caller.');
  }
  return axis;
};

export const carriedFor = (axis) => ENTRIES.filter(e => e.axis === known(axis));

// Built fresh per call, so a caller mutating the map cannot reach the store.
export const carriedMap = (axis) =>
  new Map(carriedFor(axis).map(e => [carryKey(e.card, e.where), e.why]));

// Carried keys the walk did not produce: the card moved under the ruling.
export const staleKeys = (axis, seen) => {
  const live = seen instanceof Set ? seen : new Set(seen);
  return carriedFor(axis).map(e => carryKey(e.card, e.where)).filter(k => !live.has(k));
};

// Shape problems as lines (reports print, gates assert empty). The floor is presence, not length:
// a back-reference to the entry above is a legitimate reason.
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

// Print the whole axis roster, not only matched entries, so stale ones show beside their reason.
export const SHOW_ALL = process.env.CARRIED === '1';

// `held` is `{ key, why, line? }` (line replaces the key when present), `stale` from staleKeys.
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
