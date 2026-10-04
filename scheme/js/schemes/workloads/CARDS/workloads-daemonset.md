## workloads-daemonset

### layout

```
WHAT     A four-Node roster where each frame states the labels it carries, so the three that match
         the Pod template nodeSelector hold a Pod and the one that does not stands empty.
LAYOUT   No `LAYOUT` preset. A / B / C choose which column holds a ladder and which the chips, and
         this card carries no ladder: it reads `WL.COL_L` and `WL.COL_R` directly and puts a chip in
         BOTH, two rows deep.
           actors the `workloads-replicaset` pair, 232 wide: API 484..716 centred on `WL.CX`,
                  DaemonSet 908..1140 right-aligned on `WL.R`, wire label centred at 812
           chips  60..540 and 660..1140, 2 rows x 34 with an 8 gap, 275..309 and 317..351
           rules  two standing captions on y=400, centred on 300 and 900, one per chip column
           nodes  four frames on the canvas floor, 484..624, 252 wide at 60 / 336 / 612 / 888
         The API is the CENTRED box and the controller sits to its right, which is the reverse of
         the exemplar pair and the only arrangement that gives a straight trunk: the lane into the
         Node band leaves the API (`A-09`), `WL.L-07` wants the box it leaves centred on the spine,
         and the narration panel holds the top-left corner, so the DaemonSet has nowhere to go but
         the right. The request therefore travels right to left on `REQ_Y` and the answer back on
         `RESP_Y`.
         The 2x2 board is what opens the 540..660 corridor (`WL.L-07`), and the corridor is the only
         room a trunk has once chips sit on both sides of the canvas. A full-width strip of two
         would close it: `LAYOUT.C.strip.two` puts its gap at 592..608, sixteen units, and the trunk
         would thread a slot instead of a corridor.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-daemonset node
         --test report/overlay.test.mjs`. Deepest at 1100x800 and TWO steps reach it, `place` at 350
         characters and `update` at 329. `PANEL_B` 255 and the chip board at 275 are derived from
         that reading, and the swing across the viewport set is 94.66, measured on `update`. `place`
         is the longest narration on the card and is 20.3 clear of the board, so the pair is the
         ceiling: a further line on either one lands on the chips.
SIZES    A chip is a full column, 480 wide, because `desiredNumberScheduled` inks 135 units at
         1100x800 and the value sits at the far end. The roster caption is measured at the same
         viewport: `logging=enabled` 92 and `no logging label` 98.2, right-anchored 12 inside the
         frame, against a `Node-N` label of 40.1 at the left corner. That leaves 95.9 units clear on
         Node-1 and 89.7 on Node-4, and both captions share the node label baseline, so the roster
         costs the Node band no height at all.
LANES    Trunk STRAIGHT down from the API bottom midpoint at x=600, which is `WL.SPINE_X`, into a
         bus at NODE_Y-42 with ONE TAP PER NODE, each ending on that frame's own top face midpoint
         at y=484 and never on the Pod 28 units inside it (`WL.A-03`). The trunk leaves the API and
         not the DaemonSet because the write that lands on a Node is the API doing it (`A-09`). The
         bus is 42 above the frames and not 24: a tap that turns 24 above its arrowhead has no
         straight run left to read as a drop, and the elbow and the head merge into one point.
         `LANES` is built ONCE, one array per Node, and the `P.lane` and every `F.route` index it,
         so the drawn wire and the ball are the same array (A-02 SHARED). All 6 routes read it and
         none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh array per call leaves
         the lane and the ball two equal copies, which come apart on the first geometry edit.
         Taps 0 and 3 are 778 units and taps 1 and 2 are 502, all four at the canon 0.450 u/ms. A
         lane into a Node that is not a destination is pinned to 0: lane 3 until Node-4 is labelled,
         lane 1 once Node-2 leaves. Node-4 spends two steps in the cluster with no tap at all, which
         is the point of the step that puts it there.
MOTION   Spans, spec: match 2060, place 3429, node-join 2060, label 4929, update 3429, node-removed
         2816. `place` and `label` are the two long ones and both are lane length: 778 units is
         1729ms of glide, and every step that reaches a Node pays it after a 700ms top hop and
         `BEAT.afterHop`. The top hop is 192 units across, the gap the replicaset pair leaves
         between its two boxes.
         `NODE_JOIN_DELAY` 200 is the only literal delay on the card. Node-4 and its caption fade in
         over 200 to 800ms and the watch leaves at 800, so the frame is whole the instant the report
         about it departs and 700ms before that report lands. On `label` the caption cross-fade runs
         first at `FADE.out`, and the watch is delayed behind it, so the label is on the frame
         before the controller reacts to it. Both Pod counters climb PER ARRIVAL, not at step entry.
         The narration is `creates one Pod per matching Node` and the card draws three separate
         creates, so the count climbing alongside the three Pods appearing IS the step. The `chips:`
         block states the END value, 3, and `rewind` winds both counters back to 0 for the animated
         path only, which is the form `report/chip-beat.test.mjs` section 4 calls invisible to
         `render/reduced.test.mjs`: both paths land on 3. The visible sequence is 0, 2, 3 and NOT 0,
         1, 2, 3. Two of the three taps are 502 units against the third's 778, so those two land in
         the same millisecond and the `1` is overwritten in the instant it is written. In full: 502
         units of lane arrive at 1916ms twice over, 778 units at 2529ms once. The rank each landing
         writes is a literal, and NOTHING in the suite can see it: swapping two ranks leaves every
         check green. Opening the mid-count frame is the only guard there is. The three calls sit in
         NODE order, 0 then 1 then 2. Live, the last writer by millisecond wins, so any call order
         ends on 3: the real-time frame at 3073ms and `tools/settled-dump.mjs` both read 3 on both
         counters, the value `chips` states, so the static and the played path agree.
         `settledChips` in `fixtures/spec.mjs` applies the F.sets in the order they FIRE, by delay
         and then by flow order, which is how the runtime applies them, so neither
         `report/chip-beat.test.mjs` section 4 nor `unit/spec-steps.test.mjs` reads this step as a
         divergence. Neither counter is read from
         step entry. The step says the controller creates a Pod on each matching Node, and the Pods
         do not fade in until their creates land 1.9 to 2.5s later, so a counter reading `3` at
         entry contradicts the narration it accompanies. `numberReady` is the worse half.
CONTENT  Read against k8s 1.35. `desiredNumberScheduled` is `the total number of nodes that should
         be running the daemon pod`, so with a `nodeSelector` it counts the MATCHING Nodes and not
         the cluster, which is the whole card. `numberReady` is `the number of nodes that should be
         running the daemon pod and have one or more of the daemon pod running with a Ready
         Condition`: an INTEGER, so `update` states 3 and never a progress string like `3 / 4
         updating`, which is a value that field never holds under a label that promises it does.
         `currentNumberScheduled` stays 4 on `update` because the drawn Pod is the RECREATED one at
         the not-ready shade, not an absent one: that field counts Nodes running at least one daemon
         Pod, and `numberReady` is the one the rollout moves.
         `place` and `label` COMPRESS creation and readiness into one beat: each create writes
         `currentChip` and `readyChip` in the same millisecond, at 1916ms twice and 2529ms once on
         `place` and at the single create on `label`. Read strictly against the field definition
         above, that instant is early, because an accepted create is not a container with a Ready
         Condition. It stands, for three reasons that are properties of THIS card. The value each
         step settles on is right: nothing on this card draws a readinessProbe, and upstream is `the
         existence of the readiness probe in the spec means that the Pod will start without
         receiving any traffic and only start receiving traffic after the probe starts succeeding`,
         so a fluentd Pod with none is Ready as soon as its container runs. The card already draws
         the difference where it is the SUBJECT, at `OPACITY.notready` on `update`, which makes one
         grammar across the card: full strength is a Ready Pod and the dim shade is a Pod that is
         not. And the strict alternative costs a BEAT rather than a value, which is a motion change
         and not a wording one: an `F.set` at `create0` plus about 500 would land the ready count at
         roughly 3029ms against a span of 3429 and a duration of 4200, with `label` taking the same
         shape at 5429 against 5700. What `place` owes instead is the DEFINITION in prose, `A Node
         counts in numberReady once its Pod reports Ready`, so the reader holds the field before
         `update` pulls the two counts apart. Dropping that sentence puts the compression back with
         nothing standing behind it.
         `place` says the Pod is `pinned to its own Node by nodeAffinity`, not that the Kubelet
         places it: upstream is `the DaemonSet controller creates a Pod for each eligible node and
         adds the spec.affinity.nodeAffinity field of the Pod to match the target host`, and `after
         the Pod is created, the default scheduler typically takes over`. Crediting the local
         Kubelet with placement is rejected for that reason, and the scheduler is not drawn.
         `exactly one Pod per Node` is qualified in the same breath by `only a non-zero maxSurge
         during a rollout ever puts a second there` (`T-19`).
         `.spec.updateStrategy.rollingUpdate.maxSurge` defaults to 0 and `maxUnavailable` to 1, and
         RollingUpdate is the default strategy.
         `a drain never evicts DaemonSet Pods` is upstream `regardless it will not delete any daemon
         set-managed pods`, which is why `node-removed` credits the Node object going and not a
         drain.
         The `desc` opens on the case the card does NOT draw, `with no nodeSelector or affinity it
         runs one Pod on every eligible Node`, because upstream is `if you do not specify either,
         then the DaemonSet controller will create Pods on all nodes` and a desc written only around
         this card's selector states a special case as the mechanism. Both qualifiers are load
         bearing and neither is trimmable to fit the band (`T-20`). `either` is the two fields, so
         `with no nodeSelector` alone reads as if an affinity did not also narrow the set. And
         `every Node` unqualified is a `T-19` absolute whose counter-case is a Node carrying a taint
         the daemon Pod does not tolerate: upstream scopes it as `all eligible nodes`, which is the
         word the desc takes, and the mechanism behind it stays with `cluster-taints-tolerations`.
         The `desc` also carries `updateStrategy`, `RollingUpdate`, `maxUnavailable` and `OnDelete`
         for a reason no other card can discharge. Search filters on title plus desc plus category
         (`D-15`), the `desc` is the only prose outside the dialog, and this card is the catalogue's
         only treatment of `.spec.updateStrategy` (see SCOPE), so a `desc` silent on them leaves the
         longest narration on the card unreachable by anyone looking for it. The `aria-label` names
         the rollout for the same reason, since it describes the WHOLE drawing (`T-28`) and a label
         stopping at add and remove leaves `update` unspoken for the one reader who has nothing but
         the label.
NAMING   The selector is `logging=enabled` and the agent is `fluentd`, so the one Node that gets no
         Pod is a Node an operator has not opted into log collection, which is a label a step can
         then add. A selector nobody can change (an OS label, an architecture) would make the fourth
         frame permanent scenery and cost the card its fourth step.
         `no logging label` states the absence rather than drawing nothing, because an empty frame
         with no caption reads as a frame that failed to render.
SCOPE    Node ELIGIBILITY here is `nodeSelector` and nothing else. `cluster-taints-tolerations` owns
         taints, the three effects, how a toleration matches a key and an effect, and
         `tolerationSeconds`. No taint is drawn on any of the four Node frames and no narration
         names one.
         A Node joining and turning Ready is one sentence of `node-join`. The Kubelet registering
         the object, the not-ready taint that keeps ordinary Pods off and the Lease are
         `cluster-node-registration`.
         `node-removed` is the boundary to state carefully, and the step is named for the event that
         actually fires it. `cluster-node-drain` owns the cordon, the Eviction API and the PDB. What
         removes the Pod here is the NODE OBJECT going, upstream `as nodes are removed from the
         cluster, those Pods are garbage collected`, which is why the wire reads `Node-2 removed ·
         delete its Pod · no reschedule` and never `evicted`. A drain is named in one clause of the
         narration for the single purpose of saying it would NOT have done this, which is
         `cluster-node-drain`'s own `desc` sentence.
         The fixed replica count this card contrasts itself against is `workloads-replicaset`.
         `place` and `node-removed` each name it in one clause and neither draws a ReplicaSet.
         `.spec.updateStrategy` on `update` is the DaemonSet's OWN field, not the `.spec.strategy`
         of `workloads-deployment-strategy` and not the window of `workloads-rolling-update`. No
         card in the catalogue draws it, so RollingUpdate, `maxUnavailable=1` and OnDelete stay here
         as one narration and are ceded to nobody.
DO NOT   Light a `node()` frame to say a Node is eligible. `diagrams.css` carries `.highlight` for
         pods, boxes, cylinders and chips and for nothing else, so a frame named in `lit` renders no
         difference and the state is carried by nothing. Eligibility on this card is a drawn caption
         and a drawn tap, both of which a reader can see.
NOT A DEFECT
         The bus still runs above Node-2 after Node-2 leaves. Lanes 0, 2 and 3 share the trunk
         and the bus, and the segment over the empty slot is Node-1 being reached past it. What goes
         with the Node is its own tap, its Pod, its roster caption and the frame, all four in one
         `fleet(...)` row so no step can separate them (`A-13`, `A-14`).
         `node-removed` is the one step whose Node-bound ball is NOT preceded by a request from the
         DaemonSet. `label` draws watch, then req, then the create, because the controller asks for
         that Pod. Here the Pod is garbage collected when the Node object goes, which no box on this
         card owns, so the delete leaves the API on the watch it just delivered and the DaemonSet is
         credited with nothing but learning the count. Adding a `req` hop would say the DaemonSet
         issued a delete the narration goes out of its way not to attribute to it.
```
