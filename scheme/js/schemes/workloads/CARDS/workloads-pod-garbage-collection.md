## workloads-pod-garbage-collection

### layout

```
WHAT     A Pod that has finished is still an OBJECT, and PodGC is the controller that decides when
         it stops being one: one rule counts terminated Pods against a configured threshold, and
         three more take a Pod whose delete nobody is left to acknowledge.
LAYOUT   FOUR RULES OF ONE CONTROLLER, and the row of Pods is the cast those rules act on rather
         than a population standing for a quantity. Layout C, because the rules take the right
         column and the readings are a bottom strip.
           actors  API 484..716 centred on WL.SPINE_X and PodGC 908..1140 right-aligned on WL.R,
                   both on WL.TOP_Y, both 232 wide
           rules   the P.chain at LAYOUT.C.ladder, 660..1140, four rows 200..358
           objects four Pods 252 x 72 at y 496, spanning WL.L..WL.R exactly at a 24 gap, each
                   holding a state block 228 x 40 at dx 12 / dy 24, so 520..560 inside the shell
           chips   two across at 532 (LAYOUT.C.strip.two), 590..624
         The API is the CENTRED box and PodGC the flanking one, which inverts the usual reading and
         is what the subject wants: the objects live in the API, so the write that reaches the store
         leaves the API (A-09, the `workloads-force-deletion` model) and WL.L-07 then requires the
         API to be the box the trunk leaves.
         The four Pods carry NO count between them. Pod web-1 reads `Succeeded, one of many`
         precisely so the row cannot be read as the 12501 the chip states: an element sized or
         counted against the threshold is the instrument failure `workloads-force-deletion` records
         under NAMING, and four boxes against 12500 is that failure with a bigger ratio.
         NO node() frame anywhere, which is 1 of the 11 cards in this section (kin.mjs `noframe`,
         where only `workloads-pod-lifecycle-phases` shares it). Nothing here is RUNNING: these are
         records in the API, and a Node frame would draw the half of the garbage-collection page
         that `cluster-image-container-gc` declares as its own. The cost is that three of the four
         rules are defined by a NODE state the picture cannot show, which is why each of those Pods
         carries that state as its sublabel and each rule row names it again.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-pod-garbage-collection node --test report/overlay.test.mjs`. Deepest
         on `threshold` at 1100x800, the longest narration at 372 characters. `PANEL_B` is derived
         from that reading, and it pins BUS_Y at 440, the only y on this card that has to clear it:
         the bus runs to x=186 and the Pod row starts at x=60, so both are left of the 420 of `L-03`
         and both are below the panel by position, 185 and 241 units of clearance. The band the
         panel vacates at the widest viewport, x 60..540 by y 250..600, stands empty, and that is
         the constraint `scheme/CLAUDE.md` states rather than a defect of this card.
SIZES    Pod 252 wide is derived, not chosen: four across WL.W at a 24 gap is the only spacing that
         lands the row on WL.L..WL.R exactly and puts the bus midpoint on WL.SPINE_X.
         The state block is buildPod's own `inner` and NOT a `part.tune`: the box lands inside the
         `g` carrying the Pod id, so it fades with the Pod and `pulsePod` reaches it whole (M-03),
         and the field costs this category no seventh hook row.
         Splitting the state at the comma it was already written with is what bought the room. The
         longest half is now `Node out-of-service` at 114.6 units against a 228 box, 56.7 clear at
         each wall, where the joined string measured 196.3 with 27.8 clear as a floating sublabel.
         It stays a 10px `.scheme-box-sublabel`, the same class and size it had as a Pod sublabel,
         so the measurement is comparable rather than re-based. The word above it is the 12px label
         slot and the longest of those is `terminating` at 68.9.
         40 tall and not 34: `box()` puts a label at `h/2 - 3.22` and a sublabel at `h/2 + 12.78`,
         so a pair needs the height, and 40 sits inside the 38.75..81.38 band that offset was
         measured over. It leaves 8 clear under the Pod label and 8 over the Pod floor.
         The chips are TWO across and not three: a live count beside the configured number it is
         compared against IS the reading, and a third chip would have been a slot looking for a
         value. At 532 the widest pair, `terminated-pod-gc-threshold` at 165.6 against `12500` at
         30.7, leaves 311 units between name and value.
LANES    ONE trunk, a bus SPLIT into four segments, and one tap per Pod, nine lanes in all.
           TRUNK   API bottom midpoint 600 down to BUS_Y 440. It carries every ball, so it is a
                   lane and not a relation, and `tune` drops its marker: one head per run belongs on
                   the tap that reaches the Pod, which is the `workloads-pod-qos-classes` idiom.
           SEG 1-4 186..462, 462..600, 600..738, 738..1014, split at every Pod centre AND at the
                   trunk. The split is the whole point: a single bus would have to hold one shade
                   for four Pods that die on four different steps.
           TAP 1-4 BUS_Y down to the Pod top face midpoint at 496. These carry the arrowheads.
         `LANE(i)` builds the route from the same numbers the three lanes are drawn from (A-02), so
         no ball crosses canvas the card has not drawn (A-01).
MOTION   The shade rule is one card-local `stage()` factory returning the whole `opacity` field
         (A-16), and the two halves of it are NOT the same rule.
           a TAP takes its Pod's shade whole, because its far end IS that Pod and a lane is the min
           of its two ends (A-13)
           a SEGMENT is a CHANNEL, open while any Pod downstream of it is still there and gone only
           when the last of them has. Shading a segment by its nearest Pod instead fades the run
           that is still carrying balls to a live Pod one step early, which is the arrow-into-nothing
           defect rebuilt one layer down.
         A deleted Pod goes to OPACITY.terminated rather than to 0. C-09 reads `gone from the API`,
         which is literally what this card deletes, and a hole where a Pod was reads as a rendering
         fault (C-14). The taps and segments therefore land on 0.12 with it and A-14 does not apply:
         nothing here VANISHES.
         Every fade is animated from LIVE below the guard with its end value pinned above it (A-15),
         so a lane is at full weight for the whole flight of the ball it carries and only then goes.
         Reading pace per step, ms per character: remains 9.22, threshold 12.59, beyond 10.56,
         orphan 12.46, unscheduled 11.82, out-of-service 12.46, against a catalog median of 10.11.
         Every ball on the trunk runs at the canon 0.450 units per ms and none is floor-bound. The
         two top-row hops sit on the 700ms floor at 192 units, which 13 other cards also run.
         `remains` stands still for the whole of its 2700 and carries no `flow` at all. It is a
         packet-less, pod-less beat, so M-27 gives it `.highlight` alone and F.flash is explicitly
         not a second option. A ball here would be traffic no step names (`M-10`), and the Pod blink
         belongs to the arrival rather than to this step, which the paragraph below states.
         The blink belongs to the ARRIVAL, on every step that has one. `threshold` and `orphan` both
         send a write down to a Pod, so both pulse it at `at: 'gc'` and fade it at `plus:
         BEAT.afterPulse` behind the pulse, which is M-16 for a down-arrow and M-08 for a Pod that
         pulses and fades in one step. `threshold` carried its blink one step EARLIER, on `remains`,
         where nothing had reached the Pod yet: a Pod that blinks before anything arrives teaches
         the reader that the blink is not the write, and the two steps then disagreed about what a
         blink means.
         `threshold` runs 5000 and not 4200 because of that move. The pulse plus the fade behind it
         put the span at 4856, and M-19 raises the duration to cover the motion rather than cutting
         the motion to fit. Three steps turn a Pod state over at an arrival, and a string written by
         the animated path alone shows the ORIGINAL value on prev and on reset while the narration
         names the phase PodGC just wrote (T-30). Stating all four on every step is the `P-01`
         discipline applied to a field that has no machine of its own: the turnover is `ST()` above
         the guard and `rewind: born(i)` below it, and the steps AFTER the turnover restate the new
         value so a forward replay cannot lose it either. `ST()` returns BOTH writers, `labels` and
         `sublabels`, and is spread into the step rather than assigned to one field, because the
         state block is one thing said in two slots: the word the Pod is in, and the reason beside
         it. Splitting them at the comma the string already carried is what let the text move inside
         a box without shrinking: neither half is a new sentence, and `terminating` stays lower case
         because it is what kubectl prints in STATUS and not a phase name. The factory takes an
         ARRAY of four Pod shades rather than a stage name because the four Pods do not share a
         lifecycle: each one is live on the step that names it and gone after it, and there is no
         sequence of named stages that four independent two-state objects collapse into. Everything
         else in the field is derived from that array, which is what stops a tap or a segment from
         disagreeing with the Pod it ends on. Writing the eleven keys out per step is how the
         catalog came to draw a full-strength arrow out of a Pod that was a ghost (A-13).
CONTENT  Read against the `k8sVersion` the entry carries, and against `pkg/controller/podgc`.
         `gc()` runs `gcTerminated` ONLY under `if gcc.terminatedPodThreshold > 0`, which is the
         `set the flag to 0 or less and this rule is off` clause, and it then runs `gcTerminating`,
         `gcOrphaned` and `gcUnscheduledTerminating` unconditionally, which is `the other three
         rules never look at the count`.
         `gcTerminated` computes `deleteCount := terminatedPodCount - threshold` and deletes exactly
         that many, sorted `byEvictionAndCreationTimestamp`. So the count lands ON the threshold and
         not under it, which is why the narration spends the clause and why the two chips read 12500
         and 12500 after the sweep. `until it is back under` was the wrong sentence and the chips
         would have contradicted it.
         All four paths reach `markFailedAndDeletePodWithCondition`, which patches the phase to
         Failed only `if pod.Status.Phase != PodSucceeded && != PodFailed`. That is the doc's `mark
         them as failed if they are in a non-terminal phase`, and it is why Pod web-1 takes no PATCH
         on its wire label and the other three do.
         The `condition` argument is non-nil on `gcOrphaned` ALONE, a `DisruptionTarget` with reason
         `DeletionByPodGC`, so `this is the only one of the four that gets that condition` is a
         claim about the source and not a hedge. The disruptions page states the same reason string
         and calls the condition stable since 1.31.
         Stage: PodGC is ordinary controller behaviour and stands behind no feature gate, so no step
         claims a version for it. The only version claim on the card is the 12500 default.
NAMING   `Pod web-1` through `Pod web-4` are four DIFFERENT objects, not four instances of one, so
         they take four names rather than the `Pod A` / `Pod B` instance labels
         `workloads-force-deletion` needs for a replacement carrying its predecessor's identity. A
         rule row states the CONDITION PodGC tests and a Pod sublabel states THAT object's state, so
         the two never carry one string: `orphan, its Node object deleted` against `Running, Node
         object deleted`. Collapsing them into one wording makes the rule list a legend for the row
         rather than the controller's own list of rules.
         `terminating` and not `Terminating`: it is `isPodTerminating`, a `deletionTimestamp` that
         is set, and the capitalised form is the kubectl display column that
         `workloads-force-deletion` rejects for the same reason.
SCOPE    ownerReferences, the dependent walk and finalizers are `cluster-cascading-deletion`, which
         is a DIFFERENT controller: nothing here is deleted because its owner was.
         The NODE half of the same upstream page, unused images and dead containers on disk, is
         `cluster-image-container-gc`, whose own SCOPE declares itself that half and nothing else.
         How a Node goes quiet, the Lease, taint-based eviction and how long a Pod waits are
         `cluster-node-failure`. Here the Node object is already gone or already carries the taint.
         Why a Pod hangs in Terminating and what `--force` does to it is `workloads-force-deletion`,
         whose CONTENT proves all three of these rules are SHUT on the state that card draws.
         Detaching a volume on `node.kubernetes.io/out-of-service` is
         `storage-volume-detach-on-node-loss`. Here the taint is read only as a condition for
         removing the Pod object.
NOTE     Three of the six narrations name a Node that is not on the canvas: a Node object that has
         been deleted, no Node at all, and a Node someone has tainted. T-21 asks that a named ACTOR
         be drawn, and none of these acts: each is a CONDITION on the Pod, and two of them are the
         absence of the thing. Drawing a Node to satisfy the row would draw the opposite of what two
         of the three rules say.
DO NOT   Do not shade a bus segment by the nearest Pod. See MOTION: it is green under every check
         and fades a run that is still carrying a ball.
OPEN     `unscheduled` and `out-of-service` take no pulse, and after that move it is no longer a
         rule the card keeps. Both write a phase patch at the arrival: their wire labels read `PATCH
         status - Failed - then DELETE` and their `F.set` turns the state block over to Failed,
         which is the same two-write shape `orphan` blinks for. Their Pods stand at LIVE when the
         ball lands, not at HELD, so a pulse would be seen. The card therefore blinks on two of the
         four arrivals that carry a patch and not on the other two.
         Left open rather than closed in passing. The fix is one `F.pulse` and one `plus:
         BEAT.afterPulse` per step plus the two durations that would then have to rise, and the
         request that moved the first blink named Pod web-1 alone.
```

---
