## workloads-statefulset-update-strategy

### layout

```
WHAT     A change to the Pod template becomes a new revision, and RollingUpdate carries it down the
         ordinals from the largest to the smallest, one Pod at a time, until either the set is done
         or a partition line stops the walk.
LAYOUT   No LAYOUT preset. A / B / C choose which column holds a ladder and which the chips, and
         this card carries a WORKLIST in one column and an instrument in the other, with the chips
         as a full-width strip under both.
           actors  StatefulSet web 484..716 centred on WL.SPINE_X, API 908..1140, the 232 wide
                   PAIR `workloads-statefulset-ordered-rollout` and the exemplar draw
           bus     257, one segment from the trunk west to the window, one tap per slot
           window  two Pod slots, 140 wide on a pitch of 160, at 60..200 and 220..360, 333..429,
                   CENTRED on the chain: both bands share the midline 381
           chain   660..1140, four rows of WL.ROW_H on WL.ROW_GAP, 296..466, with the one gap the
                   partition rule falls in opened from 10 to 22
           chips   556..590, three across at 350.67 spanning WL.L..WL.R
         The four ordinals are chain ROWS and not columns, and that is the whole composition
         argument. `workloads-statefulset-ordered-rollout` gives each ordinal a column because each
         one owns a disk and needs vertical room under it. Nothing here is owned per ordinal: what
         this card tracks is which ordinals carry the update revision and how far down the walk is
         allowed to go, which is an ORDER with a cursor and a stop, and a list with an active row
         and a rule through it is that. It is the only `chain` in `workloads/controllers`.
         6 numbered steps plus the idle frame the poster shows.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-statefulset-update-strategy node --test report/overlay.test.mjs`.
         Deepest on step 0 at 1100x800, shallowest on step 2 at 1600x1000, a swing of 69.82 on step
         0. `PANEL_B` 230 is derived from the deepest reading and it pins BAND_Y at 251, which the
         bus at 257 is the first thing to use. 251 to the 590 the chip strip ends on leaves 339
         units for a 6 unit drop to the bus, the 170 unit chain from 296 and the 34 unit chip row.
         The chain is the tallest thing in the band and it is what a longer narration costs. The
         window hangs off the chain rather than off BAND_Y, so a deeper panel moves both together.
SIZES    An empty slot rests at OPACITY.terminating and not at OPACITY.pending. The shade exists so
         no arrowhead points at blank canvas (M-24), and at 0.55 an empty slot sat close enough to a
         full one that the window read as two Pods on every step, which is the one thing a
         maxUnavailable budget must not say. 0.25 is the deepest shade that still gives the tap
         something to land on: OPACITY.terminated at 0.12 leaves an arrowhead on a ghost. The
         mechanism is unchanged, `F.fade` to a token at the house `FADE.out` on the default ease-in,
         which is what every sibling in the section does.
         A chain row carries the house ladder idiom, `name . clause` with SINGLE spaces around the
         separator, because SVG collapses a run of whitespace and the padded columns
         `cluster-node-allocatable` types in its source never reach the screen. Measured at 1100x800
         the rows ink 269.9 to 312.9 in a row 480 wide, which is the fill the cluster ladders carry.
         `web-3` alone measures 30.7 and leaves a row 94 percent empty bar. Every clause is true on
         EVERY step. A chain row cannot carry state, so no clause names a field the card only sets
         halfway through: `web-1 . below partition 2` is REJECTED for being false on the three steps
         before the partition is patched.
         The Pod slots carry NO label. `setBoxLabel` reads `.scheme-box-label` and a Pod paints its
         name into `.scheme-pod-label`, which no field writes, so the ordinal in hand is a per-step
         wire UNDER the slot instead. It goes under and not over because a caption on SLOT_Y - 12 at
         the slot centre lands on the tap that drops into it.
         The inner box carries `app` and nothing else. DO NOT put a revision in it as a sublabel:
         the slots stand at OPACITY.terminating on four steps of seven, so `rev 3` written into them
         says rev 3 on the idle frame before rev 3 exists, and again on `ondelete` after rev 4 has
         been recorded.
         The partition caption inks 536.3..603.7 at 1100x800 and 532.1..607.9 at 1600x1000, so at
         its widest it clears the chain at 660 by 52.1 and sits 8.6 above the rule at 381. The rule
         starts at 532 rather than at the chain edge so the caption has canvas to stand on: a
         caption inside the chain column lands on a row. 532 is the caption's own left ink edge at
         its widest, so the rule opens under the `p` of partition and runs nowhere the caption does
         not. DO NOT start it further west: at 480 the 52 units of line standing clear of the word
         read as a lane with no origin.
         The rows carry the house ladder PITCH, WL.ROW_H on WL.ROW_GAP, so the four read as one
         list. DO NOT give it a pitch of its own: 36 on 18 draws four separate bars. The one
         exception is the gap the partition rule falls in, opened to 22: a dashed line inside a 10
         unit gap reads as a row border rather than as a cut through the set. `chainList` lays every
         row on one pitch, so the split is a `tune` pushing the two rows below the rule down by the
         12 unit difference, and not a second chain: a step addresses a chain by row INDEX and a
         second one would need a second key and a second `chain:` field.
         The window is CENTRED on the chain, both bands on the midline 381, which is also where the
         partition rule runs. Top-aligned to a list of four rows the two slots read as the first two
         of them, which is the one thing the pair must not say: it is a budget and not a prefix. The
         caption `unavailable at once` inks 144.5..275.5 at 1600x1000, its widest, against taps at
         130 and 290, so it clears each by 14.5 and still inks between them.
LANES    Trunk down WL.SPINE_X into a single bus running west, one tap per slot, and the partition
         rule, which is not a lane at all.
         The trunk and the bus are LANES with the marker taken off, the `workloads-replicaset` form:
         they carry every ball (A-06), so they take the route weight, and `tune` drops only the
         head, which belongs on the tap that lands on a Pod (A-05).
         The partition is a plain relation at `dash: '4 4'`, the
         `workloads-statefulset-ordered-rollout` gate weight. Nothing rides it because nothing
         travels a boundary, and it is born at opacity 0 because the field is 0 until the step that
         patches it. A-13 IS OVERRULED, and it is the one override here. No line is ever pinned to a
         slot: the window stands empty on four steps of seven, so pinning each tap to its sink would
         wash the delivery path out on most of the card. Bodies keep the lifecycle vocabulary, lines
         do not. The relation wash is a WEIGHT and the pin was a STATE, and dropping the second does
         not touch the first. No lane ever lands on the chain. A lit row is a STATE, the ordinal now
         carrying the update revision, and not a destination: an arrowhead into a worklist would
         draw the controller delivering a Pod into a list.
MOTION   Every update step is two hops: the request across the top row, then the replacement down
         the trunk into a slot. The Pod fades in and pulses on the create arrival, and the chain row
         and the progress wire turn over on the same arrival, because they are one event.
         WHICH LANE A HOP TAKES IS DECIDED BY THE ACTOR IN ITS OWN SENTENCE, and the card holds one
         rule with no exception. A CONTROLLER ACTION rides the request lane, controller to API: the
         controller stores the template, records rev 4, and deletes and recreates a Pod. A USER EDIT
         rides the answer lane, API to controller, because you talk to the API and the controller
         reads the result off its watch. Five steps carry an incoming edit and every one of them
         draws it that way: `revision`, `partition`, `max-unavailable` and `ondelete` for a spec
         edit, `one-at-a-time` for a Pod turning Running and Ready.
         DO NOT put a user PATCH on the request lane. `partition` and `max-unavailable` drew `patch
         partition 2` leaving the box, which says the controller patched its own spec, and it
         contradicted `revision` on the same card, where the same kind of edit arrives. The box does
         double duty, captioned `StatefulSet web` for the object and behaving as the controller, so
         the lane is the only thing that says which of the two is acting.
         An INCOMING hop is labelled as what arrives and not as what follows. `partition` reads
         `watch: partition 2`, the `workloads-rolling-update` form (`watch: RS-v2 Ready 0 to 1`).
         Where a step has an incoming hop AND an outgoing one the wire labels the OUTGOING one,
         because that is the traffic the card is about, and the narration carries the arrival:
         `revision` opens `Your edit to spec.template reaches the controller off its watch`, and
         `max-unavailable` opens with the patch it is made of. DO NOT leave an incoming hop with no
         sentence anywhere: unlabelled under a wire that credits the other hop, it reads as the API
         sending what the label names.
         `one-at-a-time` rides the ANSWER lane first. web-3 turning Running and Ready is what
         releases the predecessor and the controller learns it off its watch, so the API is the
         sender cued at entry and the controller lights on arrival, before anything is asked for.
         `max-unavailable` fires BOTH routes at one delay AND one duration, `PAIR_DUR`, the longer
         lane's own `routeDur`. That is what the field buys: the pair leaves together and lands
         together. At the canon speed the two lengths (683 into slot 0 and 523 into slot 1) put the
         arrivals 356ms apart, and two Pods landing a third of a second apart draws the
         one-at-a-time default the step exists to replace. DO NOT excuse that 356 as the two lengths
         rather than a stagger: the eye reads arrival ORDER and not path length, so the excuse is
         true of the source and false of the picture. The explicit `dur` is the M-12 exemption and
         is registered in `render/motion.test.mjs` PACING at `speed: 1`, one deviating ball on one
         step, the shape `workloads-job-parallelism` already carries for the same reason. The
         shorter ball glides at 0.345 u/ms against the canon 0.450, so it is the SLOWER of the two
         and nothing on the card moves faster than canon, which is why the clamp allowance stays 0.
         `partition` and `ondelete` stand still for 2000 and 2200ms, 59 and 61 percent of their
         steps, each a single short hop under a full narration. `deadair.mjs` and `timing.mjs` hold
         the catalog figures and this block does not repeat them: read against those two, both sit
         mid-table on stillness and ABOVE the median on ms per character, which is the pair that
         says the hold is buying reading time rather than slack.
         `revision` is the step that did NOT clear that bar, and the fix was its motion. It ran one
         hop, stood still for 79 percent of itself and read at the catalog pace, which is the shape
         M-19a names. DO NOT answer that with `duration`. It carries TWO hops now, in the order its
         own sentence puts them: the edit reaches the controller off its watch, then the controller
         writes the ControllerRevision back. That is 1340ms of hold on 56 percent, against a catalog
         median hold this record does not restate.
         `partition` closes the window on the patch arrival. The line landing is what stops the
         walk, so the last Pod in hand goes with it, and the step ends with nothing held.
         `one-at-a-time` winds `name0` back to EMPTY and not to `web-3`. The slot back-fills to OFF
         for the whole delay window, so a caption naming a Pod under a ghost says the budget is
         holding one it is not, for 3118 of 4200ms. The window is a budget slot and who stood in it
         last step is not what it reports.
         FOUR CHIP VALUES CHANGE ON THIS CARD AND ALL FOUR ARE CUED, never a subset (P-04):
         partition on `partition` and again on `max-unavailable`, maxUnavailable on
         `max-unavailable`, and updateStrategy on `ondelete`. Each is a change of FACT and not of
         text (P-09a), so each lights on the beat that earns it. It takes BOTH halves and neither
         alone is enough: `chipsCued` inside the `F.set` carries the animated path, where `rewind`
         has put the old value back and `setChip` finds a diff, and `reducedLit` carries the static
         one, where the entry write already holds the new value and `setChip` finds nothing. DO NOT
         move the chip from `chips` to `chipsCued` at the step's top level instead: `rewind` writes
         through `setVal`, which leaves the class on, so the cue would stand from t=0 over the OLD
         value.
CONTENT  Read against the `k8sVersion` the catalog entry states, on the two pages `sources` cites.
         The order is quoted whole: `it will proceed in the same order as Pod termination (from the
         largest ordinal to the smallest), updating each Pod one at a time`. `largest-first` says
         `largest-first` carries the order clause verbatim in substance and then says what it means
         on this canvas, `the walk opens at web-3 and never at web-0`, because nothing here draws a
         termination and the reader needs the consequence rather than the comparison.
         The gate is the full condition: `The Kubernetes control plane waits until an updated Pod is
         Running and Ready prior to updating its predecessor`, and minReadySeconds is the refinement
         the page states next, `the control plane additionally waits that amount of time after the
         Pod turns ready`. `once its readinessProbe passes` is rejected for the same sentence: it
         names one mechanism for a state a Pod also reaches with no probe defined at all.
         The partition sentence is the page verbatim in substance: `all Pods with an ordinal that is
         greater than or equal to the partition will be updated` and `All Pods with an ordinal that
         is less than the partition will not be updated, and, even if they are deleted, they will be
         recreated at the previous version`. The closing clause is the page's own list of uses,
         `stage an update, roll out a canary, or perform a phased roll out`.
         The `partition` chip reads 0 and never `not set`. `SetDefaults_StatefulSet` in
         `pkg/apis/apps/v1/defaults.go` writes `ptr.To[int32](0)` into an empty `Partition`, so 0 is
         the value a reader gets back off the object rather than an absence, and the same function
         writes 1 into an empty `MaxUnavailable`. The docs state the maxUnavailable default and say
         nothing about the partition one, which is why the source is what the number rests on.
         maxUnavailable is stated with its stage because the stage is load-bearing on a field this
         new: `{{< feature-state for_k8s_version="v1.35" state="beta" >}}` on the page. `This field
         cannot be 0` and `The default setting is 1` are the page as well, and `defaults.go:122`
         writes `ptr.To(intstr.FromInt32(1))`, so the two agree.
         THE PAGE NOTE ON THE DEFAULT IS WRONG AND THE CARD DOES NOT FOLLOW IT. `statefulset.md` at
         release-1.35 still reads `The maxUnavailable field is in Beta stage and it is enabled by
         default`, and the feature-gates reference, which is the per-patch table, carries FOUR rows:
         `false / Alpha / 1.24 / 1.34`, `true / Beta / 1.35.0 / 1.35.3`, `false / Beta / 1.35.4 /
         1.36`, `true / Beta / 1.37 / -`. The 1.35.4 flip demotes the gate to off by default to fix
         a Parallel pod management regression (k/k 137926, upstream KEP 961) and the note did not
         follow it. A reader on any current 1.35.x has the gate OFF, so the narration says `a
         regression turned its gate off by default in 1.35.4` and not `enabled by default`. DO NOT
         close this back to the page: the gate table is versioned per patch and the prose note is
         not.
         The `Recreate` strategy is NOT drawn and not narrated, and at the 1.35 this card states it
         does not exist at all: release-1.35 `statefulset.md` reads `There are two possible values:`
         and the word `Recreate` appears in it zero times. Its `StatefulSetRecreateStrategy` gate is
         Alpha `fromVersion: 1.37`. That is what makes `ondelete`'s `The other strategy` TRUE rather
         than merely defensible. DO NOT restate this as a live Alpha gate the card declines to draw:
         it is a version the card does not claim.
         `revisionHistoryLimit` and forced rollback are named nowhere: both are the revision page
         rather than the update path, and neither has anything on this canvas to land on.
         `ondelete` narrates `a further edit to spec.template still records rev 4` and NOT that the
         type change records it. `getPatch` in `pkg/controller/statefulset/stateful_set_utils.go`
         builds the revision patch from `spec.template` alone, so switching
         `.spec.updateStrategy.type` produces an identical patch, the new revision compares equal
         and `CreateControllerRevision` is never reached. The wire, the `on rev 4: none of 4`
         progress string and the hop are all correct as drawn: what was wrong was the CAUSE the
         sentence gave them. DO NOT credit a revision to a strategy change.
         `rev 3` and `rev 4` are ControllerRevision revision NUMBERS, which is what the page calls
         them: `Assigns an incremental revision number`. The object name is not drawn, because a
         real one is a hash suffix that says nothing at this size.
SCOPE    The creation order, the OrderedReady gate and what a scale-down does are
         `workloads-statefulset-ordered-rollout`, which this card takes only the ordinal vocabulary
         from. That card owns `podManagementPolicy`, the per-ordinal claim and the reverse order.
         `maxSurge` and the Deployment `maxUnavailable` are `workloads-rolling-update`. They are a
         DIFFERENT field on a different controller: a StatefulSet has no surge, because a second Pod
         at the same ordinal cannot exist.
         The DaemonSet `.spec.updateStrategy`, which carries the same two type names and a
         maxUnavailable of its own, stays one phrase in `workloads-daemonset`.
         Where the ordinals RUN is not the subject, so no `node()` frame is drawn: a frame around
         the window would say the two slots share a Node, which nothing here promises.
         A template that never turns Running and Ready stalls this walk the way it stalls the
         creation gate, and what force deletion costs is `workloads-force-deletion`.
NOT A DEFECT
         Every top-row hop runs 192 units and takes the PKT_DUR_MIN floor of 700, moving at
         0.274 u/ms. That is the catalog MEDIAN and 18 other cards run the same length, so it is the
         house reading of M-13 and not this card slowing down.
         `partition` narrates that a Pod under the line comes back at the previous revision, and the
         picture does not show it: the window is empty on that step by construction. The step draws
         the walk STOPPING, which is its primary claim, and drawing a recreate below the line would
         need a fifth slot for a Pod the card never otherwise holds.
OPEN     CENTRE-LOW: the 4 blocks below the panel span 60..360, centre 210, against a want of ~600,
         measured at 1600x1000 where the panel bottom reads 160. Left open under L-16, and filed as
         CARRIED against the CENTRE-LOW axis in `test/fixtures/carried.mjs` so the report prints the
         reason instead of queueing the row.
         The blocks below the panel are the two Pod slots and their inner boxes and nothing else,
         because the right half of that band is a chain and a chip strip, and CENTRE-LOW counts
         neither. Closing it means moving the window to the middle, which puts the content bbox
         centre at 800 and opens a CENTRE finding instead, on the rule that has the wider reach:
         CENTRE reads 0 findings today because the actor row carries the bbox out to WL.R.
         Trading a clean CENTRE for a clean CENTRE-LOW is the L-16 case exactly.
```
