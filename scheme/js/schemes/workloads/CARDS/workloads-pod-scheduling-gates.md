## workloads-pod-scheduling-gates

### layout

```
WHAT     Two named entries in spec.schedulingGates standing between a Pod and the scheduling queue,
         the one direction they can be edited in, and the emptying of the list as the only trigger
         that lets the Scheduler see the Pod at all.
LAYOUT   A THRESHOLD, and it takes no A / B / C preset: with neither a ladder nor a flanking chip
         column there is nothing for the presets to choose between, which is the sixth card in this
         category on that footing (WL.L-06). The subject is one line a Pod is on the wrong side of,
         so the canvas is TWO tiers and not the three or more every other card in this section
         carries. `kin.mjs --id` is where that count is read, per card and fresh.
           actors   API 484..716 at 40..120, the family actor width, centred on WL.SPINE_X
                    (WL.L-07), and the Controller 908..1140 on the same row, ending on WL.R with
                    a 192 gap to the API
           floor    ONE band at 340..420, holding all four of the other bodies at h 80:
                    Pod 60..300, gateA 420..600, gateB 600..780, Scheduler 900..1140
           chips    two rows of two, 532 wide, 60..592 and 608..1140, at 500..534 and 542..576
         ONE Y AND ONE HEIGHT FOR THE WHOLE FLOOR is what buys the composition: every face midpoint
         lands on 380, so the route is a single horizontal line with no jog anywhere, and `kin.mjs`
         reads two content bands rather than four. A Pod taller than its neighbours would read as a
         different rank and would move its own face off the line.
         The four bodies span WL.L..WL.R exactly, so the content bbox centres on WL.CX by
         construction and report/geometry-soft prints no CENTRE, CENTRE-LOW or OCCLUDED row for this
         card at all. RUN_W, the drawn half of the route, is the same 120 on both sides and is what
         the gate assembly is centred by rather than being told to centre.
         The two gates TOUCH at 600. They are one list, and a gap between them would read as two
         independent objects with a route running between them.
         THE CONTROLLER IS ON THE CANVAS BECAUSE THE NARRATION NAMES IT ON THREE STEPS: the
         component that owns example.com/bar, the client that posts the Pod, the one that tries to
         add a gate back. Without it the PATCH balls left the API, so the picture said the API
         removes a gate while the API sublabel on the same step said `accepts the removal`, one
         drawing against two strings (T-21 from the other side). It sits right of the API rather
         than left because 420 is the leftmost an actor may start (WL.L-02) and the API already
         holds the centre the drops need. One box and not two: the docs never say the two gates have
         two owners, and the sublabel names which entry it is done with on each step.
         THE POD IS BARE: no Node frame, no inner box and no container glyph. Nothing about this Pod
         has been placed, scheduled or started, so an inner container box would draw a thing that
         does not exist. It is the only bare Pod in this section: five of the eight draw a Node
         frame, and of the two that draw a Pod without one, this is the only one whose Pod carries
         no inner box. The pod() container glyph is NOT reached for either: no card in the catalog
         uses `containers` above 0, and a card alone on a dead glyph is a worse distinction than one
         taken from what the subject actually lacks.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-pod-scheduling-gates node --test report/overlay.test.mjs`. Deepest
         at 1100x800 on the poster frame, shallowest at 1600x1000, and the swing on one step is
         77.22 units.
         It pins the FLOOR, because the Pod starts at x=60 and L-03 allows that only below the
         card's own panel bottom: 340 stands 85.34 clear of the deepest reading. It pins nothing
         else, because the gate assembly and the writer both sit right of 420 and are free of it.
         Kept in the header comment and in no constant, since nothing derives from it (`L-07`).
SIZES    Measured at 1100x800, the deepest and narrowest of the set.
         A gate is 180 wide against `example.com/foo` at 103.1 and `holds the Pod` at 79.8, so the
         tightest cell keeps 38.45 either side. `removed from the list` is the widest string a gate
         takes at 128.8 and leaves 25.6 inside gateB, the tightest clearance on the card.
         The Pod is 240 against `no Node assigned` at 98.2, the queue 240 against `filters and
         scores from here` at 171.8, the API 232 against `writes the gates at admission` at
         177.9, which leaves 27 either side.
         The chips are 532 rather than the 350.7 of a three-across strip: `PodScheduled` inks 73.6
         against a `False · SchedulingGated` pill of 141.1, and `scheduler_pending_pods` 135 against
         `queue="gated"` at 79.8, so the tightest name-to-pill gap is 293 where chipfit asks for 4.
         Four across is refused outright by WL.L-05.
         The widest wire label is `POST Pod test-pod · a gate can be set only here` at 288.3,
         centred on WL.CX, so it inks 455.8..744.2 and stands 59.3 clear of the panel column and
         163.8 clear of the Controller. It is the one string on the card wider than the actor box
         under it, and it clears the row it labels vertically rather than horizontally.
         The Controller is 232 against `tries to put example.com/bar back` at 202.5, its widest
         sublabel, which leaves 14.75 either side, the tightest box on the actor row. `POSTs the
         Pod, two gates on it` is 184.
LANES    SIX lanes and no relation. The top-row pair (WL.A-01) runs between the Controller and the
         API: the request leftward on 68 from 908 to 716, the answer back on 92, and the answer is
         ridden on ONE step, the refusal, which is the only thing the API ever sends back here
         (A-06). Two writes drop from the API onto the two gates, and the route runs in TWO pieces
         with the gate assembly between them.
         Every write is a CHAIN: the request lands on the API, which lights on arrival, and the drop
         leaves `after` it (BEAT.afterHop). The Controller is the sender on four steps and is lit at
         entry. The API is a receiver on all four and is never in `lit`.
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
         it, and A-15 outranks A-13 on any step that rides one: laneOut is at OPACITY.notready while
         the queue is out of this path and at 1 on the step the ball crosses it.
         A WRITE LANE DIMS WITH THE ENTRY IT ADDRESSED. Once a gate is at OPACITY.terminated its
         drop goes with it (A-13, A-14), or a full strength arrow is left pointing into a ghost. The
         fade holds opacity 1 backwards through its own delay, so the lane is lit for the whole
         flight of the ball that kills it.
         Lengths: the two drops are 220 units, the two route pieces and the two top hops 120. All
         are floor-bound on the 700ms PKT_DUR_MIN, as most of the catalog's balls are, and they run
         at 0.314 and 0.171 u/ms. Where those two speeds rank, the share of the catalog that is
         floor-bound and how many cards run each length are `card-review/tools/pace.mjs`, their one
         home, which is why no figure for any of the three is copied here.
MOTION   Six beats, every one of them carrying a packet.
         Step 1 is the POST up to the API, then two writes on the two drops, the second at BEAT.lead
         after the first rather than overlapping it: two entries written one after the other. The
         step stands still for 45 percent of its 4200, inside the band the six steps hold, which
         runs 25 to 58 (`card-review/tools/deadair.mjs`).
         Step 4 is the one round trip: the addition goes up on the request lane, the refusal comes
         back on the answer lane, and nothing drops. The Controller is what makes the refusal
         drawable as traffic the narration names (`M-10`). Without it the step is static, 3000ms
         with no motion at all.
         Steps 2 and 6 are the Pod acting, so it blinks FIRST and the ball leaves at BEAT.afterPulse
         (M-15). Step 2 rides the first route piece alone and ARRIVES AT THE GATE, which is the card
         in one frame. Step 6 rides both pieces, chained through `after`, and only there does
         laneOut come up to 1.
         STEP 2 RIDES A BALL ON A STEP THAT NAMES NOTHING TRAVELLING, which is the A-06 reading and
         it is taken deliberately. The ball is the Pod reaching the line and stopping, and it is the
         only drawing of the block itself: laneIn as a relation instead leaves the step a pulse and
         a highlight, and `deadair.mjs` then reads it at 100 percent still against the 58 it reads
         now, which puts two of the six steps fully static on a card whose other one already sits
         near the top of the `deadair.mjs` ranking. It also breaks the pair it makes with step 6,
         where the same ball on the same lane goes through.
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
         Spec spans against durations: 2300/4200, 1500/3600, 3000/4200, 1500/3000, 3000/4000,
         2300/3800. Those are the `deadair.mjs` span column, the lower bound with no ripple and no
         packet fade, and the percentages above are computed off it. M-19 is judged on the live
         reading `timing.mjs` prints: 2860, 2060, 3000, 2060, 3000, 2860. The tightest live margin
         is 940ms, on the two steps that ride one hop and on the last.
         Reading pace runs 10.34 to 15.50 ms per character, so every step sits at or under the
         catalog rate. That figure, its population and where a step ranks against it are
         `report/baselines.test.mjs` and `card-review/tools/timing.mjs`, and are not copied here.
         THE CHIP THAT MOVED IS CUED IN THE STEP IT MOVES: workloads is bound to `chips` and not
         `chipsCued` (P-09), so the cue is a name in `lit` rather than an automatic one, on
         gatesChip for steps 3 and 5 and on metricChip for step 6.
         ON STEPS 3 AND 5 THE COUNT TURNS OVER WHEN THE WRITE LANDS ON THE ENTRY, at 1500, in the
         same `F.set` that cues the entry, and the entry's own sublabel turns over with it: the
         PATCH is what removes the entry, so `2 entries` / `holds the Pod` stand until it lands and
         `1 entry` / `removed from the list` from then on (`empty` on step 5). `rewind` holds the
         previous values and gatesChip is lit from entry, so no writer is swapped. Turned over at
         entry, the count read one entry fewer for 1500ms while the ball that removes it was still
         travelling and the gate still stood at full strength.
CONTENT  Claims read against the k8sVersion the catalog entry states, 1.35.
         THE LAST STEP CLEARS NEITHER READING, and this is the one counter-intuitive fact on the
         card. `queued` keeps STATUS `SchedulingGated` and PodScheduled `False · SchedulingGated`,
         the same pair the five steps before it carry, because the condition is written ONCE at
         creation and a spec removal cannot reach it. `applySchedulingGatedCondition` is called from
         `PrepareForCreate` and from nowhere else, and `PrepareForUpdate` opens with `newPod.Status
         = oldPod.Status`, so the PATCH that empties the list leaves the condition standing. The
         Scheduler overwrites it only from `handleSchedulingFailure`, which writes reason
         `Unschedulable`, or on a successful bind. The STATUS column follows the CONDITION and not
         the spec: `printPod` sets it to `SchedulingGated` for any Pod whose PodScheduled condition
         carries that reason. So `statusChip: 'Pending'` and a bare `condChip: 'False'` on this step
         are both REJECTED: they are what a reader sees one beat LATER, once an attempt has
         finished, and the step is explicitly the beat before that.
         https://github.com/kubernetes/kubernetes/blob/release-1.35/pkg/registry/core/pod/strategy.go
         https://github.com/kubernetes/kubernetes/blob/release-1.35/pkg/printers/internalversion/printers.go
         ONE reading turns over on `queued` and it is the metric, which is why `lit` names
         `metricChip` alone. Three cued chips is rejected by the ruling above: two of the three no
         longer move at all.
         Both label values are the reference's own, and the metric is STABLE with a `queue` label:
         "'active' means number of pods in activeQ ... 'gated' is the number of unschedulable pods
         that the scheduler never attempted to schedule because they are gated". That sentence is
         also what licenses `held` to say no Node is filtered or scored, and what separates gated
         from unschedulable, whose own value means "attempted to schedule and failed".
         https://kubernetes.io/docs/reference/instrumentation/metrics/ THE CARD DRAWS GATE NAMES AND
         ASSERTS NO JSON SHAPE, deliberately, because the two upstream pages disagree and neither
         can be quoted without contradicting the other. The concept page says the field "contains a
         list of strings", while Pod v1 types it a `PodSchedulingGate array` with `patch strategy:
         merge on key name`, and the concept page then prints
         `[{"name":"example.com/foo"},{"name":"example.com/bar"}]` in its own jsonpath output. A
         sentence about the shape has to pick a side, so the card carries none.
         `example.com/foo`, `example.com/bar` and `Pod test-pod` are that example's own names. THE
         API DOES NOT REMOVE A GATE, it accepts or refuses the removal. The `aria-label` reads "a
         controller that owns them patches each one out and the API accepts removals in any order
         but never an addition". "the API removes them in any order and can never add one back" is
         REJECTED: it contradicts `remove-one` ("The component that owns example.com/bar patches it
         out of the list") and that same step's API sublabel `accepts the removal`, two strings
         against one, and the picture says the same: every PATCH ball leaves the Controller box. The
         docs put the removal on the client throughout: "By specifying/removing a Pod's
         .spec.schedulingGates, you can control when a Pod is ready to be considered for
         scheduling", and Pod v1 says the field can "be removed only afterwards" without ever naming
         the server as the remover. `created` writes `POST Pod test-pod`, not `POST pod`: T-07
         capitalises Pod always and T-11a draws a named object as its type plus its own lowercase
         name, which is the form the Pod block on the floor already carries. The claim itself is the
         page verbatim, "This field can be initialized only when a Pod is created (either by the
         client, or mutated during admission)", which is what `a gate can be set only here`
         compresses. The banner "Feature state: Stable since Kubernetes v1.30" is verbatim from the
         same page, and so is every word of `one-way`: "each schedulingGate can be removed in
         arbitrary order, but addition of a new scheduling gate is disallowed".
         https://kubernetes.io/docs/concepts/scheduling-eviction/pod-scheduling-readiness/ THE
         CONTROLLER IS THE KEP'S OWN ACTOR. The concept page never names the remover, only "the
         client" for the POST and "mutated during admission" for the other way in. The KEP says
         "each gate entry can be removed by external integrators when certain criteria is met" and
         expects "additional update/patch requests to mutate the scheduling gates, by external
         controllers". That is every Controller sublabel: `POSTs the Pod, two gates on it` is the
         client of the concept page, `its criteria are not met yet` is the KEP's "certain criteria",
         `done with example.com/bar` and `done with example.com/foo` are the two removals, `tries to
         put example.com/bar back` is the addition the page disallows, and `nothing left to remove`
         is the empty list. `Gate owner` and any product name are rejected: the docs use no owner
         noun, and a product would make one integrator the mechanism. Read against 1.35 on the two
         pages and the KEP the catalog entry cites.
         https://github.com/kubernetes/enhancements/tree/master/keps/sig-scheduling/3521-pod-scheduling-readiness
NAMING   The gate names are `example.com/foo` and `example.com/bar`, the two the upstream page
         prints in its own example, and the card draws gate NAMES and never asserts the JSON shape
         of the field: the concept page calls it a list of strings while the API reference types it
         as a `PodSchedulingGate array` whose entries carry a required `name`.
         The two actors take the labels the catalog already uses, `API` on 31 other cards and
         `Scheduler` on 10, rather than the binary names: `kube-apiserver` collides with the
         `Kube-apiserver` of storage-csi-architecture and T-13 reports the pair. The queue box is
         sublabelled `active queue`, because what the gates keep the Pod out of is the queue and not
         the component.
         The third actor is `Controller` and not `Gate owner` or a product name: the docs say "the
         client" for the POST and leave the remover unnamed, and the narration says "the component
         that owns example.com/bar". A controller is the one thing that is all three, and it is the
         label the catalog already uses for a thing that patches Pods it does not run. The sublabel
         does the naming per step: `owns the gates` at idle, `POSTs the Pod, two gates on it`, `its
         criteria are not met yet`, `done with example.com/bar`, `tries to put example.com/bar
         back`, `done with example.com/foo`, `nothing left to remove`.
SCOPE    The decision itself is cluster-scheduler-decision, and the last step hands off to it by
         name: filter, score, bind is that card and none of it is drawn here.
         Unschedulable is cluster-pod-priority-preemption. This card names it once, in the step that
         separates it from gated, and draws no Node for it to fail on.
         What the Scheduler sets aside once it does look is workloads-effective-pod-requests.
         The condition ladder is workloads-pod-startup-conditions. PodScheduled is one chip here and
         the only condition on the card, because this Pod never reaches the second rung.
         The STATUS column as a column to be read across is workloads-pod-pending-init-states, whose
         five values all sit at or after Pending. SchedulingGated is the value BEFORE its first, and
         this card draws it as one reading among four rather than as a table.
OPEN     THE BAND BETWEEN THE WRITER AND THE FLOOR CARRIES THE TWO DROPS AND NOTHING ELSE.
         120..340 is 220 units deep, and right of the panel column it is empty from x=716 to x=1140
         on every step and every viewport. The Controller above it fills the actor row to `WL.R`, so
         the band reads as the gap under a full row rather than as a hole beside a lone box.
         It stays open on three measurements. The depth is what the drops are made of: at a floor of
         300 they measure 180 units and at 380 they measure 260, and 220 already sits at 0.314 u/ms,
         above the catalog figure `pace.mjs` prints, so shortening it slows the only two lanes on
         this card that run above that figure. Every ball here is floor-bound on PKT_DUR_MIN, so a
         shorter drop buys no time and only costs speed. Raising the floor is capped anyway by the
         panel, which reaches 254.66 and leaves 85.34. And nothing honest stands there: the subject
         has one writer, one Pod, two entries and one queue, and every one of them is already on the
         canvas, so a block in that band would be the T-21 defect from the other side.
         What the wide viewport adds to it is the house constraint scheme/CLAUDE.md states rather
         than a fault of this card: the Pod reaches x=60, so the geometry is pinned to the deepest
         panel and the hundred-odd units the panel vacates at 1600x1000 stand empty.
         THE METRIC STANDS ON SCREEN 1500ms BEFORE THE BALL OF STEP 6 LANDS, which is the one FORM-B
         row `report/chip-beat.test.mjs` prints for this card, carried in `test/fixtures/carried.mjs`.
         The metric is the ONE reading step 6 turns over and it IS the answer its narration gives at
         entry, the enqueue following from step 5 emptying the list, and the ball draws the Pod
         reaching the queue rather than moving the count. Winding it back would count the Pod under
         queue gated for the opening beat of a step whose panel has just said it joined active.
```
