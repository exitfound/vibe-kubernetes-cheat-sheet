## cluster-pod-priority-preemption

### layout

```
WHAT     PostFilter: when filtering leaves no feasible Node, the Scheduler preempts a lower-priority
         victim and binds the pending Pod into its slot.
LAYOUT   Layout C on cluster-node-drain's shape. The API is centred on the Node frame at CX so the
         one lane down is a straight drop, and the Scheduler sits to its RIGHT, RIGHT-ALIGNED to the
         content edge at `CONTENT_R - BOX_W` = 908..1140.
         WHY that edge and not a fixed gap from the API. It was `API_R + TOP_GAP` = 772..1004, which
         left its right face 136 units short of the three right edges standing directly under it:
         the ladder, the chip strip and the Node frame all end on 1140. The alignment is not a new
         construction here, cluster-node-pressure-eviction writes the same formula for the same
         232-wide box and lands on the same 908..1140. It COSTS the match with cluster-static-pods
         and cluster-graceful-node-shutdown, which both hold a right-hand top box at 772..1004 over
         a 56 unit gap: this card does not read at their two numbers, and that is the trade.
         The 192 unit gap it opens is a pacing GAIN rather than a cost. The top hop runs 0.274 u/ms
         over 192 units, above the catalogue's median ball (`pace.mjs` prints it and ranks this
         one), with cluster-cpu-throttling and
         cluster-oom-kill on that length, against the 0.080 u/ms a 56 unit hop runs at. Both
         readings are floor-bound on the 700ms PKT_DUR_MIN, so the DURATION does not
         move (M-13).
         The wire label rides with it: centred at WIRE_X 812 rather than 744, its widest string
         measures 631..993 at 1100x800 and clears the panel right edge 396.5 by 234.5, up from 144.
         WHY NOT put the Scheduler on the left. That slot is
         196..428 against a panel measured at x<=396.55, and cluster-node-drain records its own
         `kubectl` at 86 percent under the panel there, which is the finding this same mirror
         closes. Right of the API is the only side with room, and cluster-static-pods and
         cluster-graceful-node-shutdown already read the top row that way at the same two numbers.
         WHY NOT centre the top ROW on CX instead of the API. A pair of 232 boxes centred as a pair
         puts neither box on 600, so the drop leaves a face midpoint that is not over the frame
         midpoint and the lane needs a jog. The jog is what this layout exists to avoid.
         Chips two across, 532 wide: four across was 258 and six of the eight strings collided,
         including `Pod NEW · pri` against `2e9 (system-cluster-critical)`.
PANEL    x<=396.55 at 1100x800 step 0, bottom 279.51 at 1100x800 step 4, shallowest 177.44 at
         1600x1000 step 0. Frame top 380 clears the deepest bottom by 100.49. The `delete` step is
         ONE LINE deeper than every other step at the two WIDER viewports: 194.89 at 1600x1000 and
         235.17 at 1280x860, against 177.44 and 213.92 on the rest. Two characters did it, the
         `reserved but not guaranteed` rewording taking that narration from 357 to 359 and tipping a
         wrap boundary. At 1100x800 nothing moved, which is why checking the DEEPEST viewport alone
         missed it: a prose edit has to be re-measured on all three. Neither number is near
         anything. The frame top is 380 and the deepest panel is 279.51.
SIZES    Both top boxes are CLU.BOX_W 232, and the Node band is the CLU.L-01 family: NODE_H 152,
         POD_H 106, POD_Y = NODE_Y + 34, inner dy 28 h 52. Slack measured after fonts.ready at
         1600x1000: API 232 against `PriorityClass + delete + bind` at 174.9, Scheduler 232 against
         `filter + score + preempt` at 144.7.
         WHY NOT derive the Scheduler's width from a centring rule. It was 2 * (CX - 420) = 360, the
         widest top box in the category against a next-widest 320, and the inversion that produced
         is the reason it is gone: the 360 box held the 144.7 string while the 300 box beside it
         held the 174.9 one. Width follows the string, never a centring constraint.
LANES    ONE TOP LANE, `SCHED_X -> API_R` on TOP_CY 80, the box centre line, where 13 of the 21
         cluster cards draw the PAIR that WL.A-01 describes. No step on this card names anything
         travelling back from the API, so the back half was a `P.relation` carrying no arrowhead and
         no ball. Four cluster cards RIDE their answer lane (`kubelet-reconcile-loop`, `node-drain`,
         `pod-sandbox-cri`, `static-pods`, two steps each) and earn the pair; this one did not, and
         over the old 56 unit gap the two dashes read as one double stub rather than two directions.
         cluster-node-pressure-eviction and cluster-node-allocatable already draw a single top lane
         on TOP_CY, so the shape has two cards behind it.
         WHY NOT keep the relation now that the gap is 192 and there is room to read it. Room is not
         the test, A-06 is: a lane is a relationship only if the card has something to say about it,
         and here the thing it would say (the API answers) is already on the API sublabel. Drawing
         it cost one painted element, which is why `render/palette.test.mjs` went 1896 to 1895.
         ONE DROP LANE, `[[600,120],[600,380]]`, API bottom midpoint to Node frame top midpoint, 260
         units, the same array cluster-node-drain rides. It ends ON the frame and never enters it,
         so which Pod reacts comes from the pulse. The frame is on screen for the whole card, so the
         lane never has to be pinned to a Pod's presence and A-13 cannot bite on it.
         The Scheduler never reaches a Node. It writes to the API and the Node acts on what it
         reads, which is why the one lane leaves the API and not the Scheduler.
         WHY NOT two lanes, one per actor, over a shared drop. It was two, and they were not
         shared: the Scheduler's `[[600,120],[600,416],[234,416],[234,438]]` and the API's
         `[[990,120],[990,140],[600,140],[600,416],[234,416],[234,438]]` coincided from (600,140)
         onward, 664 units drawn twice, ending in two `marker-end` arrowheads stacked on one pixel.
         Both ran a bus 12 units inside the frame's own top edge and doglegged 366 units to a single
         Pod, which is the qos-classes bus grammar without the three-Pod fan that earns it. The
         reader saw the API's ball merge onto the Scheduler's spine and read the DELETE as the
         Scheduler's write, which is exactly what the sentence above says never happens.
MOTION   Durations are aligned PER STEP TYPE to the measured cluster averages, which is not the
         same thing as a reading pace. 2400 / 2400 / 2600 / 2800 /
         2800, a band of 6.70 to 7.84 ms per character, at the hurried end of the catalogue.
         THE AVERAGES IT IS ALIGNED TO are the cluster still average, the cluster moving average and
         the mean dead tail, split by whether the step MOVES because those two populations sit
         hundreds of ms apart. `report/baselines.test.mjs` section 3 prints them per category and is
         where they are re-read: a copy of them here goes stale the next time any cluster card
         lands. `spec` and `attempt` take 2400 against the still average. `preempt` takes 2600,
         which is its span of 1700 plus a 900 tail against the mean tail.
         `delete` and `bind` KEEP 2800 and are the one place the average points the other way. Their
         span is 2400 and the mean tail would put them at 3405, so at a 400 tail they sit well under
         what the category runs at, and 2400 is a floor rather than a choice: two 700ms
         hops that M-13 clamps at the floor, plus the 900ms pulse on the arrival. Aligning them TO
         the average would make the card slower, which is the opposite of the ask.
         DEVIATION, and it is deliberate: at 6.70 to 6.86 the three re-paced steps read faster than
         cluster-server-side-apply's record says a reader can manage, `a reader cannot finish 350
         characters in 2600ms`, and that card holds itself to the slower reading. It is a judgement
         about reading, not a rule, and no check stands behind either side. Do not re-open it from
         the sibling record alone.
         WHY NOT the catalog median pace. At 10.16 to 10.64 this card sits near the TOP of its own
         category on three separate readings at once: median step 3800, whole run 20200ms, and a
         still picture of 64.4 percent of that run. `report/baselines.test.mjs` section 3 carries
         the category yardstick for the first two and `deadair.mjs` for the third, and the exact
         places move whenever the category grows. Three top-of-category readings out of three is
         the finding, not any one of the places.
         The cards this one is BUILT from read at half that: cluster-node-drain runs 396 and
         393 characters at 5.05 and 4.83, cluster-node-pressure-eviction at 5.22, cluster-oom-kill
         at 5.90. A CATALOG median is dominated by the other three categories, and taking it here
         puts this card a third slower than every neighbour it is read beside.
         WHERE IT LANDS: whole run 14500ms, in the short half of its own category. The still
         picture is 55.2 percent of that run, above the category, and it is the one reading the
         pacing does not bring inside.
         THE NUMBER THAT DID NOT COME DOWN, and it is the one a viewer actually feels: the longest
         CONTINUOUS motionless stretch. Poster 1500 plus `spec` plus `attempt`, all three drawing
         nothing that moves, is 6300ms before the first thing stirs, still among
         the longest in the category behind admission-chain 9084 and resource-quota 7140.
         It is structural rather than slack, which is why timing alone cannot close it: `spec` and
         `attempt` both happen INSIDE a box, admission resolving a field and the filter emptying a
         list, so neither has anything to send and M-10 forbids inventing a ball to fill the time.
         What would close it is not a duration, and it is written up as its own OPEN below.
         WHAT MADE IT VISIBLE, and no rule can see it: frames at 0, half span and 95 percent of
         steps 0, 1 and 2 are IDENTICAL, 0 pixels different, on all three viewports. That was 1500
         + 3600 + 3650 = 8750ms of a completely frozen picture between opening the card and the
         first thing that moves. Zero-motion steps are ordinary here, 11 of the 21 cluster cards
         have one, but nowhere else do two consecutive ones run at 3600 and 3650: the longest
         single one in the category is 3900 and the next 3400. It is 1500 + 2700 + 2700 = 6900 now.
         DO NOT close a pace finding by cutting narration. The band is a character budget only in
         the panel sense (`L-08`); 29 false absolutes in this project came from trimming qualifiers
         to fit one. Not a character of prose moved for this.
         Step `preempt` carries NO ball. Victim selection reads the Scheduler's own cached node
         state and nothing crosses a wire until the DELETE on the next step, so a packet there is
         decoration M-10 forbids. ONE pulse instead, on Pod A at BEAT.lead 800, span 1700.
         WHY NOT blink the PAIR at priority 100, Pod C first and Pod A second, which it did. Four
         readings killed it. The pulse is already committed on this card: step 4 marks the Pod being
         deleted and step 5 the Pod being bound, both meaning `this is the one`, and step 3 hung the
         same cue on the Pod its own sentence excludes (`Pod C is also 100 but unneeded`). The order
         inverted the sentence, which names Pod A first and Pod C second. The frame contradicted the
         chip: `s03-50` differed from `s03-0` by 21366 pixels and every one of them was Pod C, the
         brightest object on the canvas, while the chip under it read `Pod A · priority 100` and the
         wire read `Victim set: {Pod A}`. And it was not a SCAN either, because the sentence names
         three Pods and two blinked: the rule was neither `blink what is named` nor `blink what is
         chosen`. Pod C and Pod B stay in the prose, where their job is to be counter-examples, and
         a counter-example does not earn the weight of the choice.
         WHY NOT blink all three in slot order and land on Pod A. Four pulses of 900ms on a step
         whose point is a verdict, and it would give Pod B, which the sentence says the greedy order
         never reaches, a motion cue of its own.
         WHY NOT keep a ball on that step by routing the scan through the API. Nothing is asked of
         the API during victim selection, so the ball would draw a call that is not made.
         Ball speeds: the 192 unit top hop runs 0.274 u/ms and the 260 unit drop 0.371, both
         floor-bound on the 700ms PKT_DUR_MIN (M-13). Two cards share the hop length and
         cluster-node-drain shares the drop, so both are the house reading rather than this card.
         CHIP BEATS on the last two steps, `rewind` plus an `F.set` at the arrival, the shape
         cluster-node-drain uses. Measured in a real playthrough: on `delete` the chips read
         `preempt mode` and `Pod A · priority 100` at 66 and 509ms, `sched attempt` turns over at
         909 (the DELETE landing on the API at 700) and `victim` at 1720 (the drop landing on the
         Node at 1500, the same beat as the pulse and the fade). On `bind` both `sched attempt` and
         `focus` turn over on the API arrival, because the binding write and the cleared hint are
         one API operation.
         WHY NOT defer all three chips per step. `focus` on `delete` and `victim` on `bind` are the
         PREMISE of their step rather than something an arrival produces, and both are registered in
         E_CARRIED (`test/fixtures/chip-beat.mjs`) with that reason: `focus` names what the DELETE
         step DOES and is true the moment the Scheduler forms the request, and Pod A is already gone
         when `bind` opens, which the `pod1: 0` pin beside it draws. Deferring either would make the
         step nameless for its first 700ms or redraw a Pod the card has said exited.
         NOTE the frames CANNOT show any of this: a seek never fires the `onfinish` an `F.set`
         hangs on, and `gotoStep` takes the reduced path where `rewind` does not run (M-35, T-30).
         Prev and reset therefore show the settled values, as they do on cluster-node-drain.
CONTENT  Rung 2 reads `2. attempt ·  filter · NoFit on every node` and names no phase the step it
         lights excludes. `2. attempt · Filter + Score · NoFit on every node` is rejected: the
         narration beside it says every Node fails
         Filter, and Score never runs when Filter empties the list, which is precisely why PostFilter
         is reached at all. The shipped string is 8 characters
         shorter, so nothing about the column width moves. Score is not lost from the canvas: it stays
         on the Scheduler sublabel, which is the plugin ROSTER rather than a claim about this step.
CONTENT  The `bind` step described NODE-PRESSURE EVICTION, which it names only to disown, and got
         it wrong twice in one clause. It read `where Kubelet evicts over-request Pods first,
         BestEffort leading, and priority only orders the queue`. QoS class is not a comparator in
         that ranking at all: `pkg/kubelet/eviction/helpers.go` sorts with
         `orderedBy(exceedMemoryRequests(stats), priority, memory(stats))` and says so in words,
         `It ranks by whether or not the pod usage exceeds its requests, then by priority, and
         finally by memory usage above requests`. So BestEffort does not lead, and Priority is the
         SECOND of three keys deciding who goes rather than something that only orders a queue. It
         reads `where Kubelet ranks by over-request first, then Priority, then how far over the
         request each sits` now, 3 characters shorter.
         The clause said `covered separately`, so it was pointing at cluster-node-pressure-eviction
         while contradicting it: that card states the same three keys correctly and adds `QoS class
         does not decide that order, it only estimates it`. A cross-reference that misdescribes the
         card it references is what makes this the most expensive wording on the card.
         https://kubernetes.io/docs/concepts/scheduling-eviction/node-pressure-eviction/
CONTENT  `nominatedNodeName` is `reserved but not guaranteed`, not `a hint, not a reservation`. The
         conclusion never moved and neither did the rest of the sentence: a higher priority Pod can
         still take the Node. What was wrong is that the card denied the word its own cited source
         uses. The reference reads `This field helps the scheduler track resources RESERVED for Pod
         P`, and in the same section `if the scheduler preempts Pods on Node N, but then a higher
         priority Pod than Pod P arrives, the scheduler may give Node N to the new higher priority
         Pod. In such a case, scheduler clears nominatedNodeName of Pod P`. Both halves are true at
         once, which is what `reserved but not guaranteed` carries and what a flat denial did not.
         DO NOT restore the binary. A reader who follows the card's own sources link lands on the
         word `reserved` and concludes the card was wrong about the mechanism.
         https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/
CONTENT  The `preempt` step named the traversal backwards. It read `lowest tried first`, and the
         whole sentence is about the scan, so that reads as the scan order.
         `pkg/scheduler/framework/plugins/defaultpreemption/default_preemption.go` removes every
         potential victim and then hands reprieves back: `Sort potentialVictims by descending
         importance, which ensures reprieve of higher importance victims first`. The OUTCOME is what
         the card always said, the lowest priority Pods stay preempted, but the walk starts at the
         most important one. It reads `the more important ones reprieved first` now, 21 characters
         longer, and `duration` went 3650 to 3850 at the time to hold the pace. The whole card was
         re-paced twice afterwards and that step now runs 2600 at 6.86 ms per character (MOTION). The
         panel did not move on either pass: deepest stays 279.51 at 1100x800, on the `delete` step.
         The same file confirms the two claims either side of it, so neither changed:
         `SelectVictimsOnNode finds the minimum set of pods that should be preempted` for the
         smallest victim set, and `We first try to reprieve the PDB violating victims` for
         `victim choice prefers PDB-friendly sets`.
NAMING   The plugin-phase names on the canvas are LOWERCASE, and the Scheduler sublabel was the one
         string out of line, `filter + Score + Preempt` capitalising two of the three words it wrote
         `filter` in. It is `filter + score + preempt`. T-09 is the rule, a block LABEL is a heading
         and takes a capital while everything else on the canvas is body text, and a sublabel is body
         text. The sibling that walks the same scheduling cycle confirms the case rather than the
         rule alone: cluster-scheduler-decision draws `2. filter` and `3. score` as rungs and
         `queue, filter, score, bind` in its aria-label. Neither word is in `terms.json`, so no
         dictionary entry rescues a capital.
         WHY NOT close the drift the other way and capitalise both sides. System A in
         `render/inline.test.mjs` judges the FIRST TOKEN only, so `Filter + Score + Preempt` puts
         `Filter` first, `isIdentifier` rejects it (it matches none of the six shapes, the
         initial-capital-then-capital one included) and the dictionary does not carry it, so the
         sublabel scores DOWN and the gate goes red. That same test is BLIND to the rung either way,
         because its first token is `2.` and a token holding a digit is an identifier: the rung was
         found by reading it against its own narration, not by a check. The narration keeps its
         capitals (`Filter plugins drop every Node`), which is prose, outside System A, and what the
         exemplar does too.
NOTE     Slot 0 is the victim it preempts (Pod A) and the slot Pod NEW is bound into, which is why
         everything sent down addresses it. Same one-slot-two-identities shape cluster-resource-quota
         uses for its refused block.
NOTE     THE CARD LIVES IN CLUSTER AND WAS BUILT IN WORKLOADS, so the old id still resolves through
         SCHEME_ALIASES. The kit import carries CLUSTER_TINT, the chips and packets take role
         'cluster', and the four Pods keep role 'workloads' with the family violet override every
         Cluster card with a Pod carries, so the resting stroke matches the pulse base.
         WL is a Workloads-kit export and does not exist on cluster-kit, so the X grammar reads off
         cluster's own names: the magnitudes from `CLU` and the ladder band from `LAYOUT.C.ladder`,
         which is where LAD_X 660 and LAD_W 480 come from.
         DO NOT read the Node band as workloads geometry any more. It was NODE_H 128 / POD_H 82 /
         inner dy 24 h 46, byte-identical to workloads-pod-qos-classes, which is where the whole
         band was copied from and where its bus grammar came with it. It is the CLU.L-01 family now, the
         same numbers cluster-node-drain and cluster-static-pods carry.
DO NOT   Draw Pod A at 0 on the delete step. A Pod inside its terminationGracePeriodSeconds is the
         most present thing on the diagram, not an absence, and the victim chip on that same step
         reads `Pod A · Terminating` while the narration spends two sentences on the grace period it
         is serving. It holds OPACITY.terminating and keeps its slot, and leaves it on the BIND step,
         where the narration says it has exited and its capacity has returned to the Node.
DO NOT   Say preemption runs NO PDB CHECK. It runs one, twice: once choosing the victim set and once
         ranking candidate nodes (`pkg/scheduler/framework/preemption/preemption.go` threads `pdbs`
         into `SelectVictimsOnNode` and scores with `minNumPDBViolatingScoreFunc`). The reference is
         explicit: "Kubernetes supports PDB when preempting Pods, but respecting PDB is best effort.
         The scheduler tries to find victims whose PDB are not violated by preemption, but if no such
         victims are found, preemption will still happen". The ladder rung, the focus chip and the
         `desc` all read `no PDB check` while the delete narration on this same card already said
         `victim choice prefers PDB-friendly sets`, and that internal contradiction is what found it.
         The distinction the card reaches for is real and stays: preemption is a plain DELETE and not
         the Eviction API, so the budget is honoured BEST EFFORT rather than enforced. Rung 4 and the
         focus chip both read `standard DELETE · PDB best effort` now, and the `desc` says `not an
         eviction, so a PodDisruptionBudget is honoured best effort, not enforced`. That desc is 462
         characters, so there are 8 left before D-04 fails.
         https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/
DO NOT   Call it the PriorityClass admission plugin, and do not say a raw spec.priority is refused by
         VALIDATION. Both were on the spec step. The plugin is named `Priority`
         (`plugin/pkg/admission/priority/admission.go` sets `PluginName = "Priority"`, and the
         reference lists "Priority, Type: Mutating and Validating"); `PriorityClass` is the API object
         it reads. It is that plugin and not API validation that refuses the field, and only when the
         supplied value DIFFERS from the one it computed: `if pod.Spec.Priority != nil &&
         *pod.Spec.Priority != priority`. The conclusion the step draws is unaffected, so it stays
         word for word: PriorityClass is the only route.
         The WIRE deliberately still reads `PriorityClass admission`, and it is not the same defect:
         it names the admission stage by the field it acts on and never calls that the plugin name.
         DO NOT rewrite it to `Priority admission plugin`. It was, and T-09 in
         `render/inline.test.mjs` went red: a wire is a `scheme-label`, System A wants body text
         lowercase, and `Priority` alone is neither an identifier by its shape nor a dictionary name,
         so it scores DOWN. `PriorityClass` passes because `^[A-Z][a-z]+[A-Z]` reads it as an
         identifier. Lowercasing it to `priority admission plugin` would pass and would print the
         plugin name wrong, so the wire keeps the field.
         https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
NOT A DEFECT
         The two off-card actors in `bind` are deliberate. `The controller owning Pod A puts a
         replacement elsewhere or queues it` and `where Kubelet ranks by over-request first` both
         describe events explicitly OFF this card: a replacement placed elsewhere, and a mechanism
         the sentence itself marks as covered separately. Neither points the reader at a box that
         should be on the diagram. Do not file these again.
         Nor is `NoFit on all nodes`, the wire `filter all nodes`, the rung `NoFit on every node` or
         `scans the running Pods on each Node` a defect against the ONE drawn frame. The frame is
         labelled `Node-1`, a numbered member of a set the way cluster-node-failure draws Node-1 and
         Node-2, and preemption only starts once no Node fits, so a card that said `NoFit on Node-1`
         would state the smaller fact that does not produce the behaviour. The card follows the one
         Node the victim sits on, which is what the aria-label's `on a full Node` says.
OPEN     The band x 60..484 above the frame is empty on every step once the panel clears it, about
         424 by 200 units at 1600x1000 where the panel bottom measures 177.44.
         It is the LAYOUT, not this card. Measured over the seven cluster cards that take
         Layout C and draw a Node frame (`pod-priority-preemption`, `oom-kill`, `cpu-throttling`,
         `static-pods`, `node-drain`, `node-allocatable`, `node-failure`): every one of them has
         ZERO drawn parts in the band left of x=660 between y=190 and its own frame top. Closing it
         here alone would make this card the one member of seven that differs.
         Layout A, the arrangement that WOULD fill it, does not fit, and the arithmetic is hard.
         The ladder is five rungs at ROW_H 32 and ROW_GAP 10, so 200 units tall. It has to start
         below the worst panel bottom, 279.51 at 1100x800, which puts it at roughly 290..490 against
         a frame top of 380. The frame cannot move down to make room: 380 + 152 leaves 532, the chip
         strip takes 548..624, and the canvas is 640, so there are 16 units of floor and nothing
         spare. That is exactly the test L-08a names, pick the first of A / B / C that fits, and C
         is the first that does.
         No machine reports the band. CENTRE counts `node()` frames, so the full-width frame carries
         the content bbox to centre 600 and passes, and CENTRE-LOW excludes frames, so it never
         judges this card at all (L-17). Closing it means stretching the top row back across the
         panel column or widening a frame, which is the move L-16 forbids, so it stays open.
OPEN     The card is motionless for its first 6300ms and no duration can fix it. Poster 1500 plus
         `spec` 2400 plus `attempt` 2400, none of the three drawing anything that moves, is among
         the longest in the category behind admission-chain 9084 and resource-quota 7140, and well
         over what a card ordinarily opens with. The re-pacing lever is spent: `delete` and `bind`
         already sit at a 400ms tail against a category mean several times that, and their span of
         2400 is a floor.
         WHAT WOULD CLOSE IT: a ball on `attempt`, Scheduler to API, along the lane that already
         carries the DELETE and the bind. It needs no new geometry and no new string, one `F.top`,
         the same call steps 4 and 5 make. The traffic is already claimed by the card in two places,
         the narration (`so Pod NEW is recorded Unschedulable`) and the wire (`filter all nodes ·
         NoFit · Event FailedScheduling`), so it is literal under M-10 rather than decoration.
         WHY IT IS STILL OPEN: it adds motion the card has never had, and the request it came out of
         was a timing alignment. It also moves what `attempt` LIGHTS, because a ball landing on the
         API has to light the API, and today that step lights the Scheduler alone. That is a
         choreography decision, not a duration, and it needs saying out loud before it is drawn.
         WHY NOT do the same on `spec`. `Pod NEW arrives at the API` names traffic with no SENDER on
         this canvas: there is no kubectl and no controller box, and the Scheduler is not who sends
         it. A ball would have to start from nowhere, which is the arrow-into-nothing family.
```

### before `opacity: { ...STANDING, pod1: OPACITY.terminating },`

```
DO NOT pin Pod A to 0 and animate it 1 -> 0 on the eviction packet arriving. The victim chip on that
same step reads 'Pod A · Terminating' and the narration spends two sentences on the grace period it
is serving: a Pod inside its terminationGracePeriodSeconds is the most present thing on the diagram,
not an absence. It holds OPACITY.terminating and keeps its slot, and leaves the slot on the BIND
step, where the narration says it has exited and its capacity has returned to the Node.
```


### poster

```
Sentence: rank decides who stays, and the lowest rank pays for the newcomer.

Columns on ONE baseline, where HEIGHT IS RANK. The Node frame holds a descending staircase of
92 / 72 / 52, step 20, the 52 dimmed, dashed and struck through, and the pending Pod stands OUTSIDE
the frame at 122 carrying the one accent bar at 0.9 near its top. The two survivors carry the same
bar at 0.3. One short dashed leg runs between the two OUTER edges, the frame's right face at x=232
and the newcomer's left face at x=252, admission rather than traffic, so it takes no arrowhead.

The leg is deliberately not drawn into the struck slot, which is where it started. It says the
mechanism more accurately from the frame edge: a Pod is bound to a NODE, never into some other Pod's
rectangle, and the X already names who paid for the room without a line having to point at it. It
sits on y=90, the canvas centre and also the centre of the ink, so the one horizontal in the drawing
reads as a spine rather than as a low tie between two bottoms.

The two OUTER blocks are one size and share one centre: both are 122 tall spanning y 29..151, so
y=90 is the middle of each of them, the middle of the ink and the middle of the canvas at once, and
the leg is the line all three agree on. The staircase was carried up by 8 to 92 / 72 / 52 when the
frame grew, keeping the floor at 8 and the headroom at 22 rather than letting the frame go loose at
the top. The step stays 20, so the ramp reads as it did.

WHY NOT hug the bottom, baseline 158 against a top margin of 36: it drops the staircase into the
lower half with the newcomer alone up top.

WHAT EQUAL OUTER BLOCKS COST, and it is small. A newcomer OVERTOPPING the frame is the stronger
form of the argument that its height cannot be read as resource size: a thing taller than its own
container is not a quantity that fits inside it. Equal heights weaken it without killing it, because
a Pod as tall as the ENTIRE Node is still not a resource reading, and the newcomer is still the
tallest of the four columns by 30 against the tallest occupant. Do not close the gap further: at
parity with the 92 the rank sentence goes.

The staircase is what says priority: three boxes of different sizes is a set, a monotonic ramp is a
RANKING, and nothing else in the picture has to name the number. The newcomer overtopping the frame
ITSELF is the second half of the same argument, and it is the reason height cannot be read as
resource size: a thing taller than its own container is not a quantity that fits inside it. The
misread is real enough to be worth the deviation, because the victim slot is 44 against a newcomer
of 122 and a size reading makes that nonsense.

REPLACES a top box plus a dashed leg plus a row of three, closed on three counts and not to be
rebuilt. It carried NO `fill="currentColor"` at all: the weight was a fill ramp of 0.16 / 0.13 /
0.07 / 0.03, which at the 200px the grid renders is four near-identical greys, so the record's claim
that the brightest fill was on the arriving Pod was not what a reader saw. `poster-lint` was silent
because a missing accent bar is deliberately not a finding there, some posters weighting by fill.
Its silhouette also matched `cluster-scheduler-decision`, which stands immediately to its LEFT in
the grid: object on top, vertical dashed leg, row of three below, and of the two it was the one
without an accent. And it left a quarter of the canvas dead, the bands x 20..120 and x 200..300
above y=92 being empty outright. Deepest of the three: the picture said admission plus delete and
never said the word priority, since the arriving Pod was the same size and shape as the three below.

DEVIATION, deliberate: this is gauge-column GEOMETRY used for rank, where the family in use across
the catalog means a proportion being consumed and builds an inner fill rising inside a fixed column.
There is no inner fill here and the columns are not the same height, because the quantity being
drawn is an ordering rather than a fraction.
```
