## workloads-pod-scheduling-gates

### layout

```
WHAT     Two named entries in spec.schedulingGates standing between a Pod and the scheduling
         queue, the one direction they can be edited in, and the emptying of the list as the
         only trigger that lets the Scheduler see the Pod at all.
LAYOUT   A THRESHOLD, and it takes no A / B / C preset: with neither a ladder nor a flanking chip
         column there is nothing for the presets to choose between, which is the sixth card in
         this category on that footing (WL.L-06). The subject is one line a Pod is on the wrong
         side of, so the canvas is TWO tiers and not the three or more every other card in this
         section carries. `kin.mjs --id` is where that count is read, per card and fresh.
           writer   API 460..740 at 40..120, centred on WL.SPINE_X (WL.L-07)
           floor    ONE band at 340..420, holding all four of the other bodies at h 80:
                    Pod 60..300, gateA 420..600, gateB 600..780, Scheduler 900..1140
           chips    two rows of two, 532 wide, 60..592 and 608..1140, at 500..534 and 542..576
         ONE Y AND ONE HEIGHT FOR THE WHOLE FLOOR is what buys the composition: every face
         midpoint lands on 380, so the route is a single horizontal line with no jog anywhere,
         and `kin.mjs` reads two content bands rather than four. A Pod taller than its neighbours
         would read as a different rank and would move its own face off the line.
         The four bodies span WL.L..WL.R exactly, so the content bbox centres on WL.CX by
         construction and report/geometry-soft prints no CENTRE, CENTRE-LOW or OCCLUDED row for
         this card at all. RUN_W, the drawn half of the route, is the same 120 on both sides and
         is what the gate assembly is centred by rather than being told to centre.
         The two gates TOUCH at 600. They are one list, and a gap between them would read as two
         independent objects with a route running between them.
         THE POD IS BARE: no Node frame, no inner box and no container glyph. Nothing about this
         Pod has been placed, scheduled or started, so an inner container box would draw a thing
         that does not exist. It is the only bare Pod in this section: five of the eight draw a
         Node frame, and of the two that draw a Pod without one, this is the only one whose Pod
         carries no inner box. The pod() container glyph is NOT reached for either: no card in
         the catalog uses `containers` above 0, and a card alone on a dead glyph is a worse
         distinction than one taken from what the subject actually lacks.
PANEL    Worst 396.55 wide by 254.66 deep, at 1100x800 on the poster frame. Per viewport, right
         edge then bottom band: 290.77 / 142.56..177.44 at 1600x1000, 377.76 / 171.42..213.92 at
         1280x860, 396.55 / 180.12..254.66 at 1100x800. The swing on one step is 77.22 units.
         It pins the FLOOR, because the Pod starts at x=60 and L-03 allows that only below the
         card's own panel bottom: 340 stands 85.34 clear of the deepest reading. It pins nothing
         else, because the gate assembly and the writer both sit right of 420 and are free of it.
         Kept in the header comment and in no constant, since nothing derives from it (L-07).
         Re-read on demand with
         `OVERLAY_IDS=workloads-pod-scheduling-gates node --test report/overlay.test.mjs`.
SIZES    Measured at 1100x800, the deepest and narrowest of the set.
         A gate is 180 wide against `example.com/foo` at 103.1 and `holds the Pod` at 79.8, so the
         tightest cell keeps 38.45 either side. `removed from the list` is the widest string a gate
         takes at 128.8 and leaves 25.6 inside gateB, the tightest clearance on the card.
         The Pod is 240 against `no Node assigned` at 98.2, the queue 240 against
         `filters and scores from here` at 171.8, the writer 280 against
         `writes the gates at admission` at 177.9.
         The chips are 532 rather than the 350.7 of a three-across strip: `PodScheduled` inks 73.6
         against a `False · SchedulingGated` pill of 141.1, and `scheduler_pending_pods` 135
         against `queue="gated"` at 79.8, so the tightest name-to-pill gap is 293 where chipfit
         asks for 4. Four across is refused outright by WL.L-05.
         The widest wire label is `POST Pod test-pod · a gate can be set only here` at 288.3,
         centred on WL.CX, so it inks 455.8..744.2 and stands 59.3 clear of the panel column.
LANES    FOUR lanes and no relation. Two writes drop from the writer onto the two gates, and the
         route runs in TWO pieces with the gate assembly between them.
         The drops leave the writer's bottom face at 510 and 690, an L-12 mirrored pair about its
         midpoint at +-90, which is the gate half-width, so each lands on a gate TOP face midpoint
         with no turn in either leg. They are built ONCE each and the drawn lane and every ball on
         them index the same array (A-02): a factory called per use makes two arrays that are only
         equal, which is what `unit/lane-shared.test.mjs` names.
         NOTHING IS DRAWN ACROSS THE GATE ASSEMBLY. A ball entering it fades at one face and
         re-emerges at the far one (A-19), which is the reason the route is two lanes rather than
         one: a single lane from the Pod to the queue would cross two blocks it does not terminate
         on (L-10), and drawing it would say the route is open while both gates stand.
         THE ROUTE LANES TAKE THE SHADE OF THE ACTOR AT THEIR FAR END, the Pod and the queue, and
         never of the gate in the middle. A gate is what stands ON the route rather than an end of
         it, and A-15 outranks A-13 on any step that rides one: laneOut is at OPACITY.notready
         while the queue is out of this path and at 1 on the step the ball crosses it.
         A WRITE LANE DIMS WITH THE ENTRY IT ADDRESSED. Once a gate is at OPACITY.terminated its
         drop goes with it (A-13, A-14), or a full strength arrow is left pointing into a ghost.
         The fade holds opacity 1 backwards through its own delay, so the lane is lit for the
         whole flight of the ball that kills it.
         Lengths: the two drops are 220 units and the two route pieces 120. Both are floor-bound
         on the 700ms PKT_DUR_MIN, as most of the catalog's balls are, and they run at 0.314 and
         0.171 u/ms. Where those two speeds rank, the share of the catalog that is floor-bound and
         how many cards run each length are `card-review/tools/pace.mjs`, their one home, which is
         why no figure for any of the three is copied here.
MOTION   Six beats, one of them deliberately without a packet.
         Step 1 is two writes on the two drops, the second at BEAT.lead rather than overlapping
         the first: two entries written one after the other, and at 300 the step stood still for
         71 percent of its own duration, well past the catalog figure `card-review/tools/
         deadair.mjs` prints. At BEAT.lead it is 56 percent, inside the band the five moving steps
         hold, which runs 31 to 58.
         Steps 2 and 6 are the Pod acting, so it blinks FIRST and the ball leaves at
         BEAT.afterPulse (M-15). Step 2 rides the first route piece alone and ARRIVES AT THE GATE,
         which is the card in one frame. Step 6 rides both pieces, chained through `after`, and
         only there does laneOut come up to 1.
         STEP 2 RIDES A BALL ON A STEP THAT NAMES NOTHING TRAVELLING, which is the A-06 reading
         and it is taken deliberately. The ball is the Pod reaching the line and stopping, and it
         is the only drawing of the block itself: laneIn as a relation instead leaves the step a
         pulse and a highlight, and `deadair.mjs` then reads it at 100 percent still against the
         58 it reads now, which puts two of the six steps fully static on a card whose other one
         already sits near the top of the `deadair.mjs` ranking. It also breaks the pair it makes
         with step 6, where the same ball on the same lane goes through.
         STEPS 3 AND 5 CUE THE ENTRY THE WRITE LANDS ON, then fade it a BEAT.lead later. It is the
         same arrival step 1 draws for the two entries it creates, so one write lane onto one target
         reads the same way whichever direction the list is moving.
         THE BEAT BETWEEN THE CUE AND THE FADE IS WHAT MAKES THE CUE EXIST. Both at the arrival, the
         highlight and the removal ran from the same 700ms frame, so the entry was never lit while
         it was still there and the step drew a removal nothing had pointed at first.
         THE CUE IS AN `F.set`, NOT `lights`, AND THE FADE CARRIES `unlight`. Both halves are forced
         and each is enforced by a different check. `lights` is collected by `flowLights` onto the
         static path, where `flow` never runs to take it back, and prev then settles on a marked
         ghost: `render/reduced.test.mjs` HIGHLIGHT fails on the two steps by name. Dropping
         `unlight` leaves the class on a block that no longer exists and `spec-steps/S-18` fails.
         With both, the settled highlight set is `apiEl` and `gatesChip` on either path, which is
         what it was before the cue existed. `storage-pvc-retention-policy` carries the same pair
         for the same reason and is the card to read beside this one.
         Spec spans against durations: 1500/3400, 1500/3600, 2200/3400, 0/3000, 2200/3200,
         2300/3800. Those are the `deadair.mjs` span column, the lower bound with no ripple and no
         packet fade, and the percentages above are computed off it. M-19 is judged on the live
         reading `timing.mjs` prints, which is 560ms longer on the three steps a ripple closes and
         equal on the two the gate fade closes. The tightest live margin is 940ms, on the last step.
         Reading pace runs 10.00 to 12.40 ms per character, so every step sits at or under the
         catalog rate. That figure, its population and where a step ranks against it are
         `report/baselines.test.mjs` and `card-review/tools/timing.mjs`, and are not copied here.
         THE CHIP THAT MOVED IS CUED IN THE STEP IT MOVES: workloads is bound to `chips` and not
         `chipsCued` (P-09), so the cue is a name in `lit` rather than an automatic one, on
         gatesChip for steps 3 and 5 and on metricChip for step 6.
CONTENT  Claims read against the k8sVersion the catalog entry states, 1.35.
         THE LAST STEP CLEARS NEITHER READING, and this is the one counter-intuitive fact on the
         card. `queued` keeps STATUS `SchedulingGated` and PodScheduled `False · SchedulingGated`,
         the same pair the five steps before it carry, because the condition is written ONCE at
         creation and a spec removal cannot reach it. `applySchedulingGatedCondition` is called
         from `PrepareForCreate` and from nowhere else, and `PrepareForUpdate` opens with
         `newPod.Status = oldPod.Status`, so the PATCH that empties the list leaves the condition
         standing. The Scheduler overwrites it only from `handleSchedulingFailure`, which writes
         reason `Unschedulable`, or on a successful bind. The STATUS column follows the CONDITION
         and not the spec: `printPod` sets it to `SchedulingGated` for any Pod whose PodScheduled
         condition carries that reason. So `statusChip: 'Pending'` and a bare `condChip: 'False'`
         on this step are both REJECTED: they are what a reader sees one beat LATER, once an
         attempt has finished, and the step is explicitly the beat before that.
         https://github.com/kubernetes/kubernetes/blob/release-1.35/pkg/registry/core/pod/strategy.go
         https://github.com/kubernetes/kubernetes/blob/release-1.35/pkg/printers/internalversion/printers.go
CONTENT  ONE reading turns over on `queued` and it is the metric, which is why `lit` names
         `metricChip` alone. Three cued chips is rejected by the ruling above: two of the three no
         longer move at all.
         Both label values are the reference's own, and the metric is STABLE with a `queue` label:
         "'active' means number of pods in activeQ ... 'gated' is the number of unschedulable pods
         that the scheduler never attempted to schedule because they are gated". That sentence is
         also what licenses `held` to say no Node is filtered or scored, and what separates gated
         from unschedulable, whose own value means "attempted to schedule and failed".
         https://kubernetes.io/docs/reference/instrumentation/metrics/
CONTENT  THE CARD DRAWS GATE NAMES AND ASSERTS NO JSON SHAPE, deliberately, because the two
         upstream pages disagree and neither can be quoted without contradicting the other. The
         concept page says the field "contains a list of strings", while Pod v1 types it a
         `PodSchedulingGate array` with `patch strategy: merge on key name`, and the concept page
         then prints `[{"name":"example.com/foo"},{"name":"example.com/bar"}]` in its own jsonpath
         output. A sentence about the shape has to pick a side, so the card carries none.
         `example.com/foo`, `example.com/bar` and `Pod test-pod` are that example's own names.
CONTENT  THE API DOES NOT REMOVE A GATE, it accepts or refuses the removal. The `aria-label` read
         "the API removes them in any order and can never add one back", which contradicted
         `remove-one` ("The component that owns example.com/bar patches it out of the list") and
         that same step's API sublabel `accepts the removal`, two strings against one. It now
         reads "each is removed by the component that owns it and the API accepts removals in any
         order but never an addition". The docs put the removal on the client throughout: "By
         specifying/removing a Pod's .spec.schedulingGates, you can control when a Pod is ready to
         be considered for scheduling", and Pod v1 says the field can "be removed only afterwards"
         without ever naming the server as the remover.
CONTENT  `created` writes `POST Pod test-pod`, not `POST pod`: T-07 capitalises Pod always and
         T-11a draws a named object as its type plus its own lowercase name, which is the form the
         Pod block on the floor already carries. The claim itself is the page verbatim, "This
         field can be initialized only when a Pod is created (either by the client, or mutated
         during admission)", which is what `a gate can be set only here` compresses. The banner
         "Feature state: Stable since Kubernetes v1.30" is verbatim from the same page, and so is
         every word of `one-way`: "each schedulingGate can be removed in arbitrary order, but
         addition of a new scheduling gate is disallowed".
         https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/
NAMING   The gate names are `example.com/foo` and `example.com/bar`, the two the upstream page
         prints in its own example, and the card draws gate NAMES and never asserts the JSON shape
         of the field: the concept page calls it a list of strings while the API reference types it
         as a `PodSchedulingGate array` whose entries carry a required `name`.
         The two actors take the labels the catalog already uses, `API` on 31 other cards and
         `Scheduler` on 10, rather than the binary names: `kube-apiserver` collides with the
         `Kube-apiserver` of storage-csi-architecture and T-13 reports the pair. The queue box is
         sublabelled `active queue`, because what the gates keep the Pod out of is the queue and
         not the component.
SCOPE    The decision itself is cluster-scheduler-decision, and the last step hands off to it by
         name: filter, score, bind is that card and none of it is drawn here.
         Unschedulable is cluster-pod-priority-preemption. This card names it once, in the step
         that separates it from gated, and draws no Node for it to fail on.
         What the Scheduler sets aside once it does look is workloads-effective-pod-requests.
         The condition ladder is workloads-pod-startup-conditions. PodScheduled is one chip here
         and the only condition on the card, because this Pod never reaches the second rung.
         The STATUS column as a column to be read across is workloads-pod-pending-init-states, whose five
         values all sit at or after Pending. SchedulingGated is the value BEFORE its first, and
         this card draws it as one reading among four rather than as a table.
OPEN     THE BAND BETWEEN THE WRITER AND THE FLOOR CARRIES THE TWO DROPS AND NOTHING ELSE.
         120..340 is 220 units deep, and right of the panel column it is empty from x=740 to
         x=1140 on every step and every viewport.
         It stays open on three measurements. The depth is what the drops are made of: at a floor
         of 300 they measure 180 units and at 380 they measure 260, and 220 already sits at
         0.314 u/ms, above the catalog figure `pace.mjs` prints, so shortening it slows the only
         two lanes on this card that run above that figure. Every ball here is floor-bound on
         PKT_DUR_MIN, so a shorter drop buys no time and only costs speed. Raising the floor is
         capped anyway by the panel, which reaches 254.66 and leaves 85.34. And nothing honest
         stands there: the subject has one writer, one Pod, two entries and one queue, and every
         one of them is already on the canvas, so a block in that band would be the T-21 defect
         from the other side.
         What the wide viewport adds to it is the house constraint scheme/CLAUDE.md states rather
         than a fault of this card: the Pod reaches x=60, so the geometry is pinned to the deepest
         panel and the hundred-odd units the panel vacates at 1600x1000 stand empty.
         The one static beat, `one-way`, stands still for 100 percent of its 3000ms, which
         `deadair.mjs` ranks near the top of the catalog. It is the only step of the card whose
         content is that nothing travels, and the alternative is a shorter duration: at 2600 it
         reads at 9.09 ms per character, faster than the catalog rate, and therefore a step nobody
         finishes.
         THREE CHIP READINGS STAND ON SCREEN BEFORE THE BALL THAT PRODUCES THEM LANDS, at 700ms on
         the two removal steps and at 1500ms on the last, which is the FORM-B queue
         `report/chip-beat.test.mjs` prints. They stay on it. The shape that closes a FORM-B row is
         a `rewind` plus an `F.set` bound to the arrival, and here that trade runs the wrong way:
         the metric is the ONE reading step 6 turns over and it IS the answer its narration gives,
         so winding it back would count the Pod under queue gated for the opening beat of a step
         whose panel has just said it joined the active queue. On the two removal steps the value and its cue arrive
         together at entry, which is the shape `P-06` puts inside the rules, and the same file
         carries a ruling on `cluster-etcd-raft` saying the rewind is bought at the price of a
         defect a viewer can actually see.
         THE GATE SUBLABEL TURNS OVER AT ENTRY TOO, and on the same argument. On steps 3 and 5 the
         gate reads `removed from the list` for the 700ms before the write lands on it, while the
         box is still at full strength, so the sublabel and the chip say the same thing at the same
         moment and the fade is the one cue that arrives late. Splitting them would put the panel
         and the picture out of step for the opening beat, which is the trade the chip ruling above
         already refuses.
```

### poster

```
The list must reach zero before the Pod moves, and an entry that comes off never comes back.
A CHAIN OF STAGES, taken on the sequence axis: ONE gate list drawn in three moments left to right,
2 live entries, then 1, then 0, with the Pod standing past the empty one. The frames are identical
on purpose, which is the family's own named failure mode taken deliberately: the three are not three
different things in a pipeline, they are the SAME field at three times, so varying the glyph per
stage would say the list becomes something else instead of shrinking. What ramps is the CONTENT.
A REMOVED ENTRY LEAVES ITS SLOT BEHIND, dashed at 0.03 and opacity 0.45 where a live entry is a
solid 0.10 pill. That is the one-way rule drawn rather than asserted: the ghost slots say a place
that is spent, not a place something can be put back into, and it keeps the third frame from being
an empty box the reader has to interpret. The removed one in the middle frame is the SECOND entry,
which is the order the card itself removes them in, bar before foo.
THE ACCENT IS THE POD, a 34 by 10 bar at 0.9 inside a block with the heavier stroke, and the three
live entries carry the same bar at 0.3, which is R-07 read straight. The Pod is deliberately shorter
than the three frames and drawn with stroke 2 so it does not read as a fourth stage of the same list.
REJECTED, with the reason each time.
THE WALL, which is what this poster was until 2026-08-31. It said only BLOCKED and it said nothing
about the list, which is the whole subject of the card: the leaves were a barrier, not a field with
a count in it, and no still of a closed gate can carry "any order, never an addition, queued when
empty". It was also the family workloads-init-containers-and-sidecars already owns three positions
away in this same grid, so R-05 was being paid for by rhythm alone.
HELD OBJECT was the runner-up and would have said the hold cleanly, but it draws ONE list in ONE
moment, so the emptying is inferred from a struck row rather than seen, and it puts the accent on
the object while the sentence the card asks for is about the list.
Nested containment, a Pod outside a wide queue frame with the leaves on its edge: the same wall
inverted, and it splits the accent between the Pod and the live leaf.
A THIRD FRAME WITH NO SLOTS AT ALL, truly empty. At 200px it reads as an unfinished box rather than
as an emptied list, and it breaks the rhyme that makes the three frames one object.
Any readout, chip or status text past the last frame. The card proves in its own CONTENT block that
the reported state does NOT flip when the last gate comes off, because applySchedulingGatedCondition
is reached only from PrepareForCreate and PrepareForUpdate copies the old status wholesale, so a
still that showed a changed reading would contradict the card it fronts. The Pod here is a block
with an accent, not a state.
A faithful miniature is not in reach anyway (R-10): the card is an API over a floor with two drop
lanes, four chips and a Scheduler box, and the poster carries no writer, no drops, no chips, no
labels and no queue.
```
