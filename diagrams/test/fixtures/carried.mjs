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
  // R2-ENTRY: what report/arrival.test.mjs cannot clear itself, a value that changed outside the
  // previous step's own cue: a restoration, a rewind read at t=0, or background state.
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['3', 'Pod labels'],
    why: 'not the mid-step class: a restoration to app=web, carried with its reason on R2-STEP' },
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['4', 'Pod Ready'],
    why: 'a restoration to True, carried with its reason on R2-STEP' },
  { axis: 'R2-ENTRY', card: 'network-service-debugging', where: ['4', 'serving'],
    why: 'a restoration to the healthy endpoint, carried with its reason on R2-STEP' },

  { axis: 'R2-ENTRY', card: 'cluster-oom-kill', where: ['3', 'container state'],
    why: 'the mirror of `R2-STEP cluster-oom-kill 3 container state`: containerStatuses[].state is '
      + 'STILL Running, and the suffix `not yet observed` explains an unchanged fact. The turnover '
      + 'the reader must catch is on the observe step, where the chip IS lit.' },

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

  { axis: 'R2-ENTRY', card: 'workloads-pod-garbage-collection', where: ['2', 'terminated Pods'],
    why: 'the value the step OPENS from, not a value it produces. `rewind` rolls the count to 12501 '
      + 'so the reader sees the cluster standing over the threshold before the delete leaves, and '
      + 'the frozen t=0 sample reads that roll-back as an uncued change. Lighting it at entry would '
      + 'glow over the number the step is about to replace and glow a second time when the delete '
      + 'lands, which is the beat the F.set already owns.' },

  // More network cards in the rewind class. A key names the chip as drawn, covering same-named chips on that step.
  { axis: 'R2-ENTRY', card: 'network-client-ip-preservation', where: ['5', 'X-Forwarded-For'],
    why: 'the step 4 frame is the rewind of `forge`, which turns rXff over on `out`. Settled '
      + 'against settled this is the R2-STEP row already carried: a raw stream has no header, '
      + 'and nothing cleared one' },
  { axis: 'R2-ENTRY', card: 'network-netfilter-path', where: ['4', 'hook'],
    why: 'step 4 `out` winds the chip back to FORWARD, the box the `fork` hop delivered the packet '
      + 'to and the one lit at entry, and writes `FORWARD, POSTROUTING` on the `toPo` arrival, whose '
      + '`lights` cue it. A frame frozen at t=0 reads the rewind value, and settled against settled '
      + 'R2-STEP reports nothing. DO NOT light the chip at entry: the cue would be spent before the '
      + 'turnover it announces' },

  { axis: 'R2-ENTRY', card: 'storage-pv-reservation', where: ['4', 'claimRef'],
    why: 'step 4 `named-only` is the counterfactual, so its `rewind` puts the claimRef back to none, the '
      + 'state it starts from once the administrator has only cleared it, and a cued F.set turns it to '
      + 'app/scratch when the controller write lands. A frame frozen at t=0 reads the rewind value with '
      + 'no cue yet. R2-STEP reports nothing. DO NOT close it by lighting the chip at entry: the rival '
      + 'would own the volume before the controller had written it' },

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
  ...['2', '5'].map(step => ({ axis: 'R3', card: 'network-policy', where: [step, '.diagram-box'],
    why: 'the bar is drawn on exactly the four steps the Pod it belongs to is isolated on, and lit '
      + 'on all four of them, including `allow` and `both-ends` where a packet passes through it '
      + 'and nothing lands. Going dark on the two steps where a packet DIES in it would dim the '
      + 'subject at the one moment it acts. The bar carries no label, which is why this row names '
      + 'it by selector: a string inside it would sit where the road runs.' })),

  // A door on the egress boundary is what each step is about, and the ball reaching it is refused.
  ...['2', '3', '4'].map(step => ({ axis: 'R3', card: 'network-dns-egress-policy', where: [step, '.diagram-box'],
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
  // The sender is a container inside the Pod, and STO.C-02 keeps a container dark in a pulsing Pod.
  ...[['2', 'seed'], ['4', 'app']].map(([step, row]) => ({
    axis: 'R4', card: 'storage-volume-model', where: [step, row],
    why: 'the sender is a container box inside Pod web-0, and the cue is the Pod pulse at 0ms with the '
      + 'ball leaving at BEAT.afterPulse, the shape R4 leaves to the pulse when a ball leaves the Pod '
      + 'shell. It cannot see it here because the mount lane starts on the container box, which is '
      + 'where the mount is. The box in `lit` closes the row and is the defect STO.C-02 forbids: a '
      + 'container lit inside a pulsing Pod outlives the blink and reads as a second highlight' })),
  { axis: 'R4', card: 'storage-fsgroup-ownership', where: ['2', 'securityContext'],
    why: 'the sender is Pod app-0, cued by the Pod pulse at 0ms with the read ball leaving at '
      + 'BEAT.afterPulse, as on the denied and writes steps. The lane starts on the Pod bottom face, '
      + '8 units under the securityContext box, so R4 reads that inner box as the sender. `secBox` in '
      + '`lit` closes the row and is the defect STO.C-02 forbids: an inner box lit inside a pulsing '
      + 'Pod outlives the blink and reads as a second highlight' },
  { axis: 'R4', card: 'storage-pvc-clone', where: ['3', 'Source volume'],
    why: 'the source is lit by an `F.light` on `call`, the beat '
      + 'the CreateVolume call lands on the backend frame and the new disk starts to materialise, and '
      + 'its copy ball leaves REVEAL_MS later, so the sender is lit 500ms before the ball. R4 reads a '
      + 'frame frozen at t=0. No ball lands on the source, and `srcDisk` in `lit` would light it '
      + 'from 0ms, before the call that asks for the copy has left the fit test' },

  // The sending row does not exist at step entry: it is the entry the plugin makes on this step.
  ...[['2', '.../globalmount'], ['3', '.../uid-a/.../mount'], ['5', '.../globalmount']].map(([step, row]) => ({
    axis: 'R4', card: 'storage-mount-propagation', where: [step, row],
    why: 'the row is the mount entry Pod csi-node makes on this step, a row inside the Pod table. The '
      + 'cue is the Pod pulse at 0ms, the row fades from pending to full at BEAT.afterPulse and the '
      + 'repeat leaves one BEAT.afterHop after that fade. R4 cannot credit the pulse because the lane '
      + 'starts on the row, which is where the entry is. Lighting the row is what STO.C-02 forbids: a '
      + 'row lit inside a pulsing Pod outlives the blink, and in `lit` it would light an entry the step '
      + 'opens without and the narration has not made yet.' })),
  { axis: 'R4', card: 'storage-volumeattachment', where: ['5', 'Kubelet'],
    why: 'the network-hostnetwork-hostport class: the gate ball stops on the Node FRAME right face, '
      + 'level with Kubelet (the frame clause of L-11), so no ball lands on the Kubelet box itself. '
      + 'The mid-chain shape is what the step runs, `F.light` on the `gate` arrival at 1571ms with the '
      + 'mount leaving one BEAT.afterHop later. `kube` in `lit` would light it from 0ms, before the '
      + 'gate that frees it, and hide the moment it stops waiting' },
  { axis: 'R4', card: 'storage-pv-reservation', where: ['1', 'PV controller'],
    why: 'the controller is MID-CHAIN on `reserve` and is cued as one: it acts on the patch, so an '
      + '`F.light` lights it on the patch arrival at the PV and its Available write leaves one '
      + 'BEAT.afterHop later. No ball lands on the controller itself, so R4 finds no earlier arrival. '
      + '`ctrl` in `lit` would light the controller from 0ms, while the administrator is still the one '
      + 'acting and nothing has changed for it to react to' },
  { axis: 'R4', card: 'storage-generic-ephemeral-volume', where: ['5', 'External-provisioner'],
    why: 'the storage-pv-reservation class: the provisioner is MID-CHAIN on `gc`, lit by `lights` on the '
      + 'GC ball that lands on the claim, and DeleteVolume leaves once that claim has faded, so the PV is '
      + 'Released. No ball lands on the provisioner, so R4 finds no earlier arrival. `prov` in `lit` '
      + 'would light it from 0ms, while the Pod is still being deleted and nothing has changed for it' },
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
      + 'controller SEND the create rather than something the create produces: the template '
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
      + 'ball produces: the timer reaching 0 is what makes the runtime send SIGKILL, so the kill '
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
  { axis: 'FORM-B', card: 'workloads-controller-kinds', where: ['ends', 'identityChip'],
    why: 'the three chips are a READOUT of whichever kind is in focus and not a value any ball on '
      + 'this card produces: no packet here carries a number, every hop is one controller '
      + 'creating another object. Binding them to an arrival would say that a Pod being created '
      + 'is what decides whether a replica has an identity. An Indexed Job giving each Pod a '
      + 'completion index is a field on the Job, true before its Pod exists.' },
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
      + 'Job ending Complete or Failed is what the reader is shown, not what the one Pod leaving '
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
  ...['scheduled', 'containers-ready'].map(step => ({ axis: 'FORM-B', card: 'workloads-pod-startup-conditions', where: [step, 'timeChip'],
    why: 'the chip is the lastTransitionTime of the one tread this step flips, and that tread is '
      + 'taken and lit at entry beside it. The condition is stamped where it is written, before the '
      + 'ball that reports it leaves, so binding the chip alone to the arrival would split the stamp '
      + 'from the rung it dates (P-04)' })),
  ...[
    ['policy', 'focusChip', 'names the field the step reads, Pod-level and defaulting to Always'],
    ['exit-zero', 'focusChip', 'states the restart rule for exit 0'],
    ['exit-nonzero', 'focusChip', 'states the restart rule for a non-zero exit'],
    ['backoff', 'focusChip', 'states the per-container backoff rule'],
    ['backoff', 'pod3Chip', 'is counterfactual: it states what does NOT happen to the Never Pod, which no arrival can earn'],
  ].map(([step, chip, what]) => ({ axis: 'FORM-B', card: 'workloads-pod-restart-policy', where: [step, chip],
    why: 'the chip ' + what + '. It is true before any ball, the daemonset focus caption convention, '
      + 'and the status PATCH that follows reports a decision already made' })),
  ...[
    ['exit-zero', 'pod1Chip'], ['exit-zero', 'pod2Chip'], ['exit-zero', 'pod3Chip'],
    ['exit-nonzero', 'pod2Chip'], ['exit-nonzero', 'pod3Chip'],
    ['backoff', 'pod1Chip'], ['backoff', 'pod2Chip'],
  ].map(([step, chip]) => ({ axis: 'FORM-B', card: 'workloads-pod-restart-policy', where: [step, chip],
    why: 'the result is earned by the IN-PLACE exit, the reacting Pods pulsing at REACT_MS 400, which no '
      + 'ball carries. The 1900ms the queue ranks is the status PATCH that leaves AFTER the Kubelet '
      + 'decided, so the real lead is 400ms, inside the entry beat P-06 allows. The chips of the '
      + 'reacting Pods move together on every step, so deferring one alone would be the P-04 split' })),
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
      + 'wait for a beat because both are Pod-object state written on this step, nominatedNodeName '
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
  { axis: 'FORM-E', card: 'cluster-image-container-gc', where: ['max-age', 'maxAgeChip'],
    why: '`168h here` is the CONFIGURATION the step opens with, and the one ball of the step is the '
      + 'delete the age rule sends BECAUSE of it, the shape of `network-client-ip-preservation '
      + 'passthrough modeChip`. Its neighbours usageChip and countChip wait because both are what '
      + 'that delete produces. Binding the setting to the arrival would draw the Kubelet deleting '
      + 'fluentd under a rule the chip still reads as off.' },
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
      + 'set before any Pod is deleted rather than a value the rollout produces. What the two '
      + 'arrivals earn is numberReady, down to 3 on the delete and back to 4 on the create, and '
      + 'focusChip stands as the premise.' },
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
  { axis: 'FORM-E', card: 'workloads-pod-startup-conditions', where: ['initialized', 'timeChip'],
    why: 'the chip is the lastTransitionTime of the ONE tread this step flips, Initialized, taken '
      + 'and lit at entry beside it, so the stamp and its rung are one fact (P-04, the FORM-B row '
      + 'above). What the PATCH landing on the API earns is the endpoint: the sandbox PATCH carried '
      + 'no Pod IP, which reaches status on the first sync after a container starts.' },
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
  { axis: 'CENTRE', card: 'storage-detach-on-node-failure', where: [],
    why: 'an artefact of what the metric can SEE (L-17): the ladder 60..440 and the chip strip '
      + '478..1140 are `.diagram-chip`, so the measured content is the Node pair, the disk and the '
      + 'kubectl actor right of Node-2, 400..1080. With the ladder and strip the card spans '
      + '60..1140 on 600. kubectl sits there because its lane must reach the Node-1 top face over '
      + 'both frames without crossing a block or a lane, and the panel and the frames leave no '
      + 'other seat. The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-reclaim-policy', where: [],
    why: 'the chip strip half only. The 2x2 chip grid stands under its two columns, 400..880 on 640: '
      + 'each chip reports the stack directly above it, and centring the strip on 600 stands every '
      + 'chip 40 off its column so the grid stops reading down a stack. The columns are the catalog '
      + '232 from the panel wall at 400 with the family 16 between them, which is the narrowest '
      + 'the stack can be. The record carries the same argument under DEVIATES L-13' },
  { axis: 'CENTRE', card: 'workloads-graceful-shutdown', where: [],
    why: 'the chip strip half only. The endpoint and grace-window chips report the endpoint track and '
      + 'stand under it, 192..536, while the Node track owns the right half. A strip on 600 crosses '
      + 'the fork and the in-flight lane between the two tracks, and the card is the fork. DO NOT '
      + 'close it by re-centring the strip.' },
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
      + 'what sits BELOW the panel bottom of one viewport, 184 at 1600x1000, and the API server '
      + 'block stands at 60..140 in the band the panel leaves free on the right (`L-01`), which is '
      + 'where the card puts it on purpose: it carries the composition out to x=1130 and closed the '
      + 'CENTRE finding this card used to hold. The five blocks the rule does see span 70..852. At '
      + 'the narrower viewports the panel is deeper still, 184.65 and 198.87, so the block stays '
      + 'above the line on every one of them and no reading of this metric can ever include it. '
      + 'Dropping it under 184 to be counted re-opens the empty top band it was added to fill.' },
  { axis: 'CENTRE-LOW', card: 'cluster-cascading-deletion', where: [],
    why: 'the same lean as the CENTRE row on this card, with the frame walls left out. CENTRE-LOW '
      + 'judges against the panel bottom of ONE viewport, 184 at 1600x1000, and at the '
      + 'worst-of-three bottom, 204, the finding stands too.' },
  { axis: 'CENTRE', card: 'cluster-object-create-path', where: [],
    why: 'the client hanging off the right of a composition centred on the frames. DO NOT close it '
      + 'by re-centring: that drags the frames off 600, which is what keeps the Node lane one '
      + 'straight segment. Widening the client to the 232 the API carries is the other route and it '
      + 'is refused on measurement: the band outside the wall is 150 units, the viewBox width '
      + 'available is 1200 at 1280x860 and below, and +90 shrinks the whole card by 7% there.' },
  { axis: 'CENTRE-LOW', card: 'cluster-node-allocatable', where: [],
    why: 'a reading of the panel, not of the composition: at 1600x1000 the scaled panel ends at 220, '
      + 'above the Scheduler top, so the rule counts the Scheduler with the blocks below and reads '
      + '152..1140 on 646. At the worst-of-three bottom, 265, the Scheduler stays above the line and '
      + 'the finding drops. The card is laid out as it stands and nothing moves for the metric.' },
  { axis: 'CENTRE-LOW', card: 'cluster-object-create-path', where: [],
    why: 'the same complaint as the CENTRE row on this card with the frame walls left out. '
      + 'CENTRE-LOW judges against the panel bottom of ONE viewport, 166 at 1600x1000, and the '
      + 'worst-of-three bottom is the same 166, so the finding stands on every viewport.' },
  { axis: 'CENTRE', card: 'storage-ephemeral-storage-eviction', where: [],
    why: 'the rule counts the two top-row blocks, the Pod 484..716 and the Kubelet 884..1116, and not '
      + 'the gauge, which is bare rects (P.raw) and spans 120..1080 on centre 600 with the chip strip '
      + 'at 112..1088. The top row stands right of the panel because the panel reaches x<=360 down to '
      + '184 at 1100x800 and the row sits at 80..184, so neither block can start left of 420: the '
      + 'furthest left the pair can go still centres on about 770. Drawing the gauge as a box would '
      + 'label and centre it as one block and lose the to-scale segments the card is built on.' },
  { axis: 'CENTRE', card: 'storage-volume-model', where: [],
    why: 'two rows, one ruling. The Pod spec ladder 32..392 is a P.chain, so the rule reads it as a '
      + 'chip strip centred on 212, and the content row leaves both it and the timeline row labels '
      + 'at x 40 uncounted, reading 200..1168 on 684. The whole ink spans 32..1168 on centre 600. The '
      + 'Pod stands right of the panel because its top row sits at 104..184 while the panel reaches '
      + 'x<=360 down to 123 at 1100x800. The record carries the same argument under OPEN' },
  { axis: 'CENTRE-LOW', card: 'storage-volume-model', where: [],
    why: 'the same lean as the CENTRE row on this card: the timeline bars start at 200 because the '
      + 'row labels own 40..190, and the labels are tags the rule does not count' },
  { axis: 'CENTRE', card: 'storage-pv-lifecycle-phases', where: [],
    why: 'two rows, one ruling. The rule counts neither chips nor frames, so it reads the content as '
      + '400..1179 on 790 and the chip column as a strip on 196. The column is the PV object, its '
      + 'fields stacked bottom left where the full width is free below the panel, and with it the ink '
      + 'spans 80..1179 on 630. The row cannot centre on 600 instead: the controller band spans exactly '
      + 'the row, and a band at 231..969 would stand under the panel at 1100x800 (x<=360 above y 164). '
      + 'The record carries the same argument under OPEN' },
  { axis: 'CENTRE', card: 'storage-where-volume-data-lives', where: [],
    why: 'two rows, one ruling. The rule counts neither the Node frame nor the chips as ink, so it '
      + 'reads 410..1170 on centre 790. The ledger column 60..380 is the second axis of the card and '
      + 'owns the left under the panel on purpose: the whole ink, ledger included, spans 60..1170 on '
      + 'centre 615. Moving the tiers left puts the Pod and the frame label under the panel at '
      + '1100x800 (x<=360 above y 144), and centring the ledger as a strip puts it under the Pod. The '
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
      + 'the disks, 170..1030, and the row cannot go under the frame, which ends 47 units above the canvas floor. The record carries '
      + 'the same argument under DEVIATES L-13' },
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
      + 'column centred on 600 would start at 362, left of the L-03 line at 420 above the panel bottom, '
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
  { axis: 'OCCLUDED', card: 'cluster-server-side-apply', where: ['kubectl'],
    why: 'the author ruled the three top-row actors onto the family 232 with the 60 unit gaps the '
      + 'arrow pairs need, so the row is 816 wide, right-aligned on 1140 and starting at 324. The '
      + 'panel reaches 360.03 at 1100x800, where its text sits on the 11px floor, and 321.29 above '
      + 'it, so the left 36 units of kubectl stand behind it at 1100x800 and nothing at 1280x860 '
      + 'or wider. Both strings stay clear, the sublabel `apply --server-side` inks from 381.7. '
      + 'Closing it means narrower boxes or 20 unit gaps, which is what the row had before.' },
  { axis: 'OCCLUDED', card: 'cluster-pod-sandbox-cri', where: ['Kubelet'],
    why: 'the same ruling as `cluster-server-side-apply`: three family 232 actors with 60 unit gaps, '
      + 'right-aligned on 1140, so the Kubelet starts at 324 against a panel reaching 360.03 at '
      + '1100x800 and 321.29 from 1280x860 up. No text is lost, `Kubelet` inks from 417.3 and `CRI '
      + 'client` from 409.3 at 1100x800. Closing it means the 180 / 210 / 180 boxes the row had '
      + 'before, built leftwards off the 404 wall.' },
  // The card sits on the canvas centre by design, so the csi-node table top is behind the panel on every viewport.
  ...[['.../kubelet/plugins', '52'], ['.../kubelet/pods', '33'], ['Pod csi-node', '23']]
    .map(([block, pct]) => ({
      axis: 'OCCLUDED', card: 'storage-mount-propagation', where: [block],
      why: `${pct} percent behind the panel at its worst, on the author ruling that the frame and the `
        + 'chip grid centre on 600 even where the panel covers them. The 740 frame then starts at 230, '
        + 'and a frame kept clear of the panel (x 420..1160) is the rejected alternative. At 1100x800 '
        + 'the panel cuts about half of every csi-node row string, and from 1280x860 up it still takes '
        + 'the first 18 percent of `.../kubelet/plugins`, the P of `Pod csi-node` and the whole frame '
        + 'label `Node-1`. The two covered rows are the Bidirectional binds that step 2 names in full '
        + 'in its own narration.',
    })),
  { axis: 'CENTRE', card: 'workloads-crashloopbackoff', where: [],
    why: 'the chip strip the metric pools is the four value chips alone, in the left column '
      + '98..540, because the instrument beside them is naked rects and not `.diagram-chip`. '
      + 'The content bbox itself centres: the frame spans 98..1102 on WL.CX by construction and the '
      + 'instrument 580..1102 balances the column. Closing it means a chip strip '
      + 'straddling 600 under a panel that reaches 360.03, which is the 79-collision shape '
      + '`WL.L-05` refuses.' },
  { axis: 'CENTRE', card: 'workloads-pod-startup-conditions', where: [],
    why: 'an artefact of what the metric can SEE: `L-17` drops frames and chips, and this card '
      + 'draws its staircase and its rail as `.diagram-chip`, so the two blocks that span 60..1140 '
      + 'and centre the picture on 600 are invisible to it. What is left to measure is the Pod, the '
      + 'two actor boxes and the frame. Closing it means widening the frame back over 1080 of empty '
      + 'band, which `L-16` refuses.' },
  { axis: 'CENTRE', card: 'workloads-replicaset', where: [],
    why: 'the pooled strip is the three value chips alone and the RIGHT column is the only place '
      + 'they fit, so its centre is the column centre by construction. Three things pin them '
      + 'there: the left column at this y is under the panel, which measures x<=360.03 and '
      + 'y<=244.88 at 1100x800, a bottom strip has nowhere to go because the two ownership bands '
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
      + 'judges against the panel bottom of ONE viewport, 184.10 at 1600x1000, and at the '
      + 'worst-of-three bottom, 204.39, the finding stands too.' },
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
      + 'because the panel measures 360.03 wide and `L-03` allows nothing left of that line above '
      + 'the panel bottom, so the only way to drag the bbox back to 600 is to put blocks in the '
      + 'gutter the column already fills.' },
  { axis: 'CENTRE-LOW', card: 'network-pod-ip-and-veth', where: [],
    why: 'the same six blocks as the CENTRE content row, 450..1110 on centre 780, with the frame '
      + 'wall left out and the chip column still uncounted. CENTRE-LOW also judges against the '
      + 'panel bottom of ONE viewport, 148 at 1600x1000, and its deepest of the three, 164.95 at '
      + '1280x860, does not change the verdict.' },

  { axis: 'CENTRE', card: 'workloads-probes', where: [],
    why: 'the card record OPEN: the chip strip spans 140..450 and centring it on 600 puts it at '
      + '445..755, across the three probe lanes at 528 / 600 / 672 that run from 120 to 464, which '
      + 'L-10 forbids. A full-width strip is four across at 270 a cell, which WL.L-05 refuses. The '
      + 'content bbox is 140..1060 and centres on 600 exactly' },
  { axis: 'OCCLUDED', card: 'workloads-env-before-pid-1', where: ['ConfigMap app-config'],
    why: 'the card record OPEN: the source row starts at 254 so the spine lands on 600 with straight '
      + 'legs. Held to the L-03 floor of 420 the row midpoint is 766 and the card leans 166 right of '
      + 'WL.CX. The box is 48% under the panel at 1100x800 and 31% from 1280x860 up, its label '
      + 'cut 47% and 17%. The panel already scales with the diagram (L-05a), so what is left to '
      + 'close it is the 420 row and its lean' },

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
