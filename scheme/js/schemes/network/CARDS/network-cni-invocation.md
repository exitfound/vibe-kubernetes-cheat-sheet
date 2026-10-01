## network-cni-invocation

### layout

```
WHAT     A protocol card: who calls whom to wire a Pod. The Kubelet asks the CRI runtime for a sandbox,
         the runtime runs a LIST of CNI plugin binaries in order, and one of them delegates addressing
         to an IPAM plugin of its own.
LAYOUT   The CNI container holds a vertical dashed trunk tapping each plugin row, aligned so its TOP
         tap is at the runtime row and its BOTTOM tap at the sandbox row, which keeps the exec and
         result arrows dead straight with no mid-run jog. Two taps, one per plugin in the list, at
         ROW_Y 288 and PAUSE_Y 436, so CHAIN_GAP derives as (436-288)-40 = 108 and the two rows stand
         at 268..308 and 416..456. ONE VERTICAL CENTRE LINE runs the whole container: the frame spans
         820..1140 on CNI_CX 980, the rows derive as 854..1106 off that centre with 34 clear of
         either wall, and the delegate derives off the rows at 874..1086 with a symmetric DLG_INSET
         of 20 a side. Nothing in the container is typed at an x of its own. The delegate sits in the
         108 gap at y 340..384, clearing the bridge row above and the portmap row below by 32 apiece,
         40 clear of the trunk at x 834 and 54 clear of the container wall. Its 20 inset is a
         NESTING rather than an indent, and its stub hangs off the BRIDGE ROW and not off the trunk,
         which is the claim the picture makes: host-local is named inside the bridge config, not
         listed beside it. A 40 indent flush to the row right edge states the same thing more loudly
         and is rejected, because it puts three elements on three different centres inside one frame.
         The whole diagram is lifted by RAISE 64, about 10 percent of the viewBox height, and every y
         is written against that lift rather than typed twice. The container BOTTOM is the sandbox
         bottom, CNI_BOT 494, so the two deepest blocks on the card end on one horizontal line and
         the height derives as 250, running 244..494. The top stays at 244, where the frame label
         sits, which leaves 24 above the first row against 38 under the last: the rows hang off the
         tap heights and cannot move without bending the ADD and result arrows, so the asymmetry is
         forced and the label is what fills the shallower end. Both chips hang on ONE baseline,
         `CHIP_Y` 506, which is 12 under the sandbox AND 12 under the container, because those two
         end on one line. The strip then spans CONTENT_L..CONTENT_R and centres on 600, which is the
         claim
         the comment above them makes. Twelve under EACH block instead stands them 24 apart, a gap
         small enough to read as a failed alignment rather than as two tiers.
PANEL    Deepest at 1100x800 on the POSTER frame, which previews step 1's text (`D-14`):
         `OVERLAY_IDS=network-cni-invocation node --test report/overlay.test.mjs` from `scheme/test/`.
         Measured 204.97 deep and 396.55 wide there, against 142.56 / 290.77 at 1600x1000 and
         171.42 / 377.76 at 1280x860, a bottom swing of 79.86 units across the set. The Kubelet is the
         one block left of the panel edge, x 60..292, and it opens at y=248, which leaves 43.03 units
         of clearance. RAISE moves it, so raising the diagram further spends that margin. The right
         edge sits 0.45 under the `L-02` ceiling of 397, a value this card shares with
         `cluster-architecture`.
SIZES    Both actor boxes take the `NET.L-01` default 232 at the standard height 80, so the Kubelet
         and the CRI read as one row rather than as two unrelated blocks. That width is what fixes
         the rest of the left half: RUN_GAP 110 is the MEASURED ink of the `RunPodSandbox` label,
         89.6 at 1600x1000, plus 10.2 a side, so the CRI derives at 402..634 and the sandbox rides
         CRI_CX to 398..638, which keeps the netns drop on its top-face midpoint. The width is what
         the gap forbids rather than what it prefers: two 232 boxes sharing this row leave 72 for a
         label that inks 89.6.
         The delegate is 212 wide, CHAIN_W 252 less DLG_INSET 20 a side. That is the third
         `NET.L-01` clause rather than a miss of the 232 default: it is a block sized BY the row it
         hangs under, not an actor standing in an actor row.
LANES    Two treatments, both drawn in the category cyan rgb(79, 229, 255). The six calls a ball rides
         as a lane part (RunPodSandbox, create netns, the ADD exec, the delegate stub, the eth0 result
         and the join L) are ROUTES: dashed, because each is a call rather than a standing link, dim
         for weight only (`NET.A-04`), and each carrying the network arrowhead
         at its destination. The delegate stub takes that same treatment rather than a third one of
         its own, and its lower endpoint sits on the delegate top-face midpoint at x 980 (`L-11`),
         which is the container centre line the rows and the frame already stand on.
         The spine is SPLIT between the two treatments, because it makes two claims. Its trunk,
         SPINE_X from the first tap to the second, is a ROUTE: the chain ball rides it on the `chain`
         step, so it draws at FULL stroke-opacity and with no arrowhead, a line at rest stating no
         direction and the ball carrying it instead (`A-05`). Neither `P.lane` nor `P.arrow` draws
         that, since `pathArrow` attaches a marker unconditionally, so the trunk is a hand-built
         `path` in the `network-model` rail classes and is this card's one `P.raw`. The two taps, the
         stubs from the trunk into each plugin row, stay one `P.relation`: nothing rides them on any
         step, they only say the two rows hang off one list, so they keep stroke-opacity 0.45 and take
         no arrowhead either. That 0.45 is the whole separation between relation and route, since
         every line on the card carries the same hue. Every lane drawn is ridden on some step.
MOTION   Six of the seven hops sit on the `routeDur` floor of 700ms, because `PKT_DUR_MIN` clamps
         anything under about 315 units: the delegate stub is 32, the netns drop 50, the RunPodSandbox
         hop 110, the trunk 148, the eth0 result 196 and the ADD exec 200. Travel therefore does not
         size those steps and reading does, so moving any of them inside that band is not a timing
         change. The `join` L is the ONE that is not: at 330 units it runs 733ms at 0.450 units per
         ms, which is the canon `PKT_SPEED` exactly and among the fastest balls `pace.mjs` ranks, so
         it is the one ball on this card travelling at the speed the rest only approach. Moving the
         sandbox or
         the Kubelet IS a timing change for that step and for no other.
         Two steps hold their writes for the ball. `delegate` keeps `ipChip` at `pending` through
         `rewind` and one `F.set` writes the address on the stub arrival. `result` keeps the Pod
         sublabel, the `result` wire label and `opChip` in `rewind` and writes all three together on
         the sandbox arrival, where the Pod also pulses: they are one result of one call (`P-03`,
         `P-04`). MEASURED on the settled frame after real-time play, `result` closes with the Pod
         reading `eth0: 10.244.1.5`, the wire reading `eth0 up` and `CNI op` reading `ADD ok`. A
         deterministic WAAPI seek shows none of the three, because an `F.set` is a callback and not an
         animation, so the mid-step and end-step seek frames both hold the `rewind` form.
         host-local is the RECEIVER of the delegate hop, so it is absent from `lit` and lights on the
         arrival through `lights` instead, while the bridge row it departs is lit by `chain: 0` before
         the ball leaves it (`M-18a`).
WIRE LABELS
         Five, for six ridden lanes. The four centred ones are DERIVED off the leg they name, through
         `labelX`, rather than typed: 347, 734, 736 and 287 are outputs and not inputs. That is what
         keeps each on the MIDPOINT of its own lane so none of them leans toward the block it leaves,
         and a typed x sits six units into the gap it is meant to centre in as soon as the lane
         under it moves. `join` names the horizontal leg only, `JOIN_LEG`,
         because the L has no single midpoint. `run` is the one the rule is load-bearing for: it
         hangs in the RUN_GAP 110 between the Kubelet right face at 292 and the CRI left face at 402
         and inks 89.6 units at 1600x1000, its widest reading, leaving exactly 10.2 a side. That
         clearance is the SOURCE of RUN_GAP rather than a consequence of it, so the gap cannot be
         spent on a wider box. `netns` is the one
         `anchor: 'start'` label and it stands 24 right of its lane rather than 12, because the ball
         rides x 518 at r 5 under a 6px drop shadow, which reaches 530.4 at 1100x800 and would graze a
         label started 12 out. The delegate stub is the one ridden lane carrying NO label: its payload
         is the address, the address is written on the `Pod IP` chip at that same arrival, so the frame
         is not silent about what rode, and a sixth label would have to stand inside the 32 units the
         stub spans.
CONTENT  Claims read against k8s 1.35 and the three cited sources, each of which still carries what
         it is cited for: the CNI SPEC at `main` (spec 1.1.0), the kubernetes.io Network Plugins
         page and the CNI plugins reference at cni.dev.
         The drawn conflist rests on the plugin reference and NOT on the kubernetes.io example. That
         example is a two-entry `plugins` list, but its main plugin is `calico`, so it warrants the
         SHAPE, a main plugin followed by `portmap`, and never `bridge` as the member drawn. `bridge`
         is warranted by its own page, where `"ipam"` is a `(dictionary, required)` and the standard
         example nests `{"type": "host-local"}` inside it, which is the reference pairing this card
         draws. `portmap` standing second is its own page: `You should use this plugin as part of a
         network configuration list`, a chained plugin that runs after a main one, which is also the
         warrant for step 4 saying it adds to what bridge produced.
         The nesting itself, host-local hanging off the bridge ROW rather than standing beside it in
         the list, is the spec and not an example: `It is however the responsibility of the CNI
         plugin, rather than the runtime, to invoke the IPAM plugin at the proper moment in its
         execution`, with the IPAM plugin returning the address `to the main plugin to apply`.
         `the range for this Node` is warranted by host-local itself, which `allocates IPv4 and IPv6
         addresses out of a specified address range` and `stores the state locally on the host
         filesystem`, so its range is per Node by construction. The `usePodCidr` value in the
         kubernetes.io example is REJECTED as the warrant for that phrase: the host-local page has no
         such parameter, and usePodCidr is resolved by the main plugin around it rather than by
         host-local. Citing it here would license a host-local claim with another plugin feature.
         `CNI_IFNAME=eth0` on step 2 splits the same way. `CNI_IFNAME` is spec, `Name of the interface
         to create inside the container`, while `eth0` is the value the runtime chooses: containerd
         carries an `eth` prefix and rejects a result naming anything else. Stating it as what arrives
         on a Kubernetes Node is what the card does, and generalising it to a spec constant is
         rejected.
         The `pause` inner box takes the sublabel `netns owner`. `eth0` is rejected there because a
         static sublabel stands from the poster frame onward, so it has the picture saying the
         interface exists before any plugin has run, against step 1 (`holds loopback only and no Pod
         IP`) and against the step 5 payoff that brings eth0 up. A sublabel that FLIPS to `eth0` on
         the result arrival is rejected in turn: the Pod sublabel already turns over to
         `eth0: 10.244.1.5` on that same beat, and two strings in one box stack saying eth0 is one
         too many. `netns owner` is what pause owns before, during and after the call, it is what
         step 1 calls it in words, and it is the string the other two network cards drawing a pause
         box already carry (`T-13`, `network-pod-ip-and-veth` and `network-namespaces`).
         eth0 therefore reaches the canvas once as a standing value, in the Pod sublabel, plus once
         as the transient `eth0 up` wire label. 10.244.1.5 carries twice, in the `Pod IP` chip and
         in the Pod sublabel.
         The desc says the runtime hands `every one after the first` the previous result. `every
         one` is rejected: the spec is explicit that the field `must not be set for the first _add_
         in a chain`, and `If this is the first plugin in the list, no previous result is provided`,
         so the unqualified form is false of plugin 1. The clause is paid for by trimming `runs each
         plugin as an executable` to `runs each as an executable` rather than by dropping it
         (`T-20`), which leaves the desc at 467 of the 470 ceiling. That budget is spent: a further
         claim needs characters found elsewhere in the sentence.
         `The plugin chain that follows runs inside that one RunPodSandbox call` on step 1. `All the
         wiring that follows` is rejected on two counts: it is a `T-19` absolute, and the wiring that
         follows includes step 6's DEL, which runs under StopPodSandbox and not under this call. The
         shipped form also points at an element the canvas labels in those exact words. The nesting
         itself holds: the CRI RuntimeService declares no networking RPC at all, and StopPodSandbox
         is specified to reclaim `network resources (e.g., IP addresses) allocated to the sandbox`,
         which is the contract half. containerd calls `setupPodNetwork` inside `RunPodSandbox`, which
         is implementation and is named as such.
         `The one the chain made` on step 5. `The one it made` is rejected as ambiguous, since the
         nearest subject is `the last plugin` and the reading it invites, that portmap created eth0,
         is false. The chain returning the LAST plugin result rather than a merge is correct as
         written: the runtime `must store the result returned by the final plugin`.
         `CNI op` carrying `DEL on delete` on the join step STANDS. It reads as a `P-02` conditional
         rather than an operation, and the alternatives are both worse: `ADD ok` carried forward
         leaves the canvas silent about the half of step 6 that narrates DEL, and a bare `DEL` claims
         an operation that is not in flight. The `on delete` qualifier is what makes the frame legal
         under `T-35`, since a reader seeing only the frame cannot conclude DEL has run.
         Naming StopPodSandbox in the join narration is considered and declined: the sentence is
         already true without it, and join reads at 9.85 ms per character against a catalog median of
         10.36, so the characters would buy accuracy the step does not lack and spend pace it does.
         `/etc/cni/net.d` is spoken on the exec step and drawn nowhere. It is a config path rather
         than a value, so it takes no chip and no tag: an element saying what the narration already
         says better would be one more thing on the canvas. The env split on that same step is
         verbatim spec: `CNI_COMMAND`, `CNI_NETNS` and `CNI_IFNAME` are parameters passed `via OS
         environment variables` while the runtime `supplies configuration via stdin`.
SCOPE    This card owns the INVOCATION: who calls whom, the Kubelet and CRI and CNI boundary, the
         ordered plugin list and the delegation inside it, what the result structure carries, and DEL
         on delete. What a veth pair IS, which end sits in which namespace, where the address lives
         and what the host end attaches to belong to `network-pod-ip-and-veth`, and the veth and the
         address appear here only as things the call produces, named in one line on the result step.
         The CRI lifecycle around this call, RunPodSandbox through StartContainer, belongs to
         `cluster-pod-sandbox-cri`, which compresses this whole card into a single step: the `sandbox`
         and `join` steps are bookends that say where the call sits, not a second telling of it.
NOTE     The container label is `CNI plugin chain` and not `CNI plugin`, which two other cards
         already carry, one of them with the sublabel `veth + IPAM` (`cluster-pod-sandbox-cri` and
         `network-model`). The list here holds two plugins, so the singular
         would be wrong as well as colliding (`T-13`).
WHY NOT  A leg carrying the result back to the `cri` box. Every orthogonal route for one fails on
         measurement: x 820..834 is 14 units of CNI-container interior, so the result would be drawn
         leaving the plugin while still inside the plugin, y 288 is the ADD lane's own row, where a
         return reads as the call bouncing (`A-03`), and anything routed below the trunk crosses the
         `Pod IP` chip band at y 506..536 and then the sandbox at x 398..638. The result lands in the
         sandbox instead, which is the card's title, and no step claims a handoff back.
DO NOT   Shift the boxes a centring rule CAN see to make a number go green. That decentres the picture
         a reader actually looks at. CENTRE-LOW reads clean here because the panel is deep enough that
         the plugin container counts as below it, not because anything was moved for the metric.
NOT A DEFECT
         `report:packet-path` lists the trunk hop as `off any drawn path`, because the trunk is this
         card's `P.raw` and that queue asks against drawn lane KINDS. That axis has no entry in
         `test/fixtures/carried.mjs`, which is why the ruling stands here. The three `opChip`
         rows `report:chip-beat` prints, on `sandbox`, `exec` and `join`, are ruled on where the
         file that prints them can read it, as three `FORM-B` entries in that store. The two chip
         changes that ARE results, the address on `delegate` and `ADD ok` on `result`, wait for
         their arrivals and are in neither queue. A further reading, that `exec` and `chain` light the
         plugin row their ball is travelling TO at step entry while `delegate` lights its receiver on
         the arrival, is also correct: `chain: N` is a step CURSOR on all 29 cards that draw a
         `P.chain`, never an arrival cue, and `lights` resolves through `s.refs[k]`, which no chain row
         carries. There is no declarative way to cue a row on an arrival.
OPEN     `exec`, `delegate` and `chain` stand still for 1700, 1700 and 1900ms, 71 to 73 percent of
         their span against a catalog median of 42 (`deadair.mjs`), and `chain` is unhurried as well at
         11.56 ms per character against a median of 10.36, which is the shape `M-19a` names as a
         finding. Both roads out are shut. Every hop already sits on the 700ms `PKT_DUR_MIN` floor
         because no lane here runs past 315 units, so the motion lengthens only by moving lanes the
         composition fixes, and `chain` already carries the shortest narration on the card at 225
         characters. `M-19a` forbids closing it on `duration` alone.
```
