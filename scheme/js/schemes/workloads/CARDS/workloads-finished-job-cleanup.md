## workloads-finished-job-cleanup

### layout

```
WHAT     A Job that succeeded is still an object, and a TTL clock started at its completion is what
         finally takes it and its Pods away.
LAYOUT   An object stack read top to bottom, and NOT the A / B / C column preset. There is no ladder
         and no flanking chip column here, so A / B / C have nothing to choose between, which is the
         case WL.L-06 counts over this category.
           actors   40..120, API 484..716 centred on CX, ttl-after-finished 908..1140 on WL.R
           Job      176..256, 420..780, the object the whole card is about
           Node     312..464 full width, two Pods 170..550 and 650..1030 at 336..442
           chips    492..610, SIX chips two per row at 532, three rows
         THE API SITS LEFT AND THE CONTROLLER RIGHT, which is the reverse of every other card in
         this section. Both corridors leave the API's bottom face midpoint, and WL.L-07 requires the
         box a trunk leaves to be centred on WL.SPINE_X, so the centre slot is the API's and the
         controller takes the right end of the row. The reading order that produces is also the
         card's argument: the object and where it lives come first, the controller acts on it. SIX
         chips, which no other card in this section carries. The mechanism IS an arithmetic
         comparison over named values, `completionTime` plus `ttlSecondsAfterFinished` against the
         controller's own clock, and three of the six exist so that the comparison and the time skew
         caveat have something to point at. Four chips would have to drop one of the three terms and
         leave the waiting step with nothing to light.
         Two per row at 532, which is the WL.L-05 two-across width and not a number of its own:
         CHIP_GAP is what WL.W leaves after two of them. Three per row at 350.7 is what both
         neighbours draw, so the same six chips there would have read as their strip with more rows.
         The Job is a BLOCK and not a chip value. It is the subject of the sentence, it sits on the
         spine between the API that keeps it and the Pods that belong to it, and it is the thing
         that disappears on the last step, which a chip cannot do.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport:
         `OVERLAY_IDS=workloads-finished-job-cleanup node --test report/overlay.test.mjs`. The Node
         frame is the block the panel binds: its top-left corner is at x=60, so the panel bottom has
         to stay above 312. Deepest on step 0 at 1100x800, which leaves 42.61 units of clearance,
         shallowest at 1600x1000, a swing of 101.98 units on one step. That clearance is the whole
         budget for a prose edit on this card.
SIZES    The chip strip is 532 wide against a longest name of `spec.ttlSecondsAfterFinished` and a
         longest value of `Complete · delete issued`. Together they take 358.3 of the 508 a chip
         leaves between its 12 unit insets, and the worst reading is 1600x1000 rather than the
         narrowest viewport, so `extents.mjs` is asked for all three before a string here grows. The
         actor row is the family width 232 on both boxes, so the two actors read as one row: the
         API label is one word over a sublabel of `keeps the objects`, 107 at its widest, and the
         controller carries `kube-controller-manager`, which measures 144.8 at its widest, inside
         the 208 a 232 box leaves between its 12 unit insets. Both readings are at 1280x860, which
         is the widest viewport for this row and not for the chip strip above it. The controller is
         right-aligned on WL.R where the chip strip also ends.
         The Pods are 380 wide with a 100 gap, so the pair spans 170..1030 and centres on CX. The
         frame keeps the WL.L-02 full width, so the content bbox centres on CX by construction.
LANES    Two corridors on ONE spine at WL.SPINE_X, and they are not the same shape.
         `connA` (120 to 176) carries the delete DOWN onto the Job and nothing travels the other way
         on this card, so it is a single lane with one arrowhead.
         `connDown` / `connUp` (256 to 312) is the exemplar's pair: the exit report rides up on
         `finished` and the cascade rides down on `cascade`, and exactly one direction is visible
         per step through the card-local `corridor()` factory, so no step can leave both on.
         Both corridors are 56 units, well under the 314 where routeDur stops clamping, so every
         ball on them costs the 700ms floor and crawls at 0.080 u/ms against the catalog median
         `pace.mjs` prints. That is the house reading of a short lane (M-13) and not this card
         alone: three other cards run a ball over exactly 56 units, and the vertical budget between
         the panel bottom at 269 and the chip strip at 492 has no room to lengthen either corridor.
         The cascade ends on the Node FRAME face and never on a Pod inside it (WL.A-03). Both Pods
         then pulse at that one arrival, which says one delete propagating rather than two deletes
         addressed separately. A bus tapping each Pod is what the sibling cards with a Pod fan draw,
         and here it would have pierced the frame.
         Top row: REQ_Y carries the delete out to the API and RESP_Y carries the watch event back to
         the controller (WL.A-01). The API is on the LEFT here, so the request runs right to left.
         Both ride, so both are arrows and neither is a relation.
         `pods()` pins both Pods AND `connDown` from one helper, because a cascade lane that
         outlives its Pods lands an arrowhead in an empty Node frame.
MOTION   3600 / 3900 / 2900 / 3400 / 3600 against SPEC spans of 1500 / 1500 / 0 / 2300 / 3000, which
         is the `span` column of `deadair.mjs` and not its `spanR`. The live WAAPI reading is 2060 /
         2060 / 0 / 2860 / 3000, and that is the single number `timing.mjs` prints under a column of
         the same name, so the two tools compared side by side show a drift that is not there. M-19
         holds on both.
         Every step reads between 9.97 and 10.65 ms per character, which sits on the catalog median
         `timing.mjs` prints, and that median is what the durations were sized against rather than
         the motion alone.
         Step 1 is an up-arrow: both Pods blink at 0 and the exit report leaves at BEAT.afterPulse.
         Step 2 is a self-initiated send from the API and waits BEAT.lead.
         Step 3 `waiting` has NO motion at all, and that is the step rather than a gap in it: a TTL
         is a mechanism whose middle is waiting, and M-27 gives a packet-less pod-less step its beat
         as `.highlight` alone. What lights is the three values the controller is comparing. It is
         100 percent still and sits near the top of the `deadair.mjs` stillness ranking. That is the
         criterion the tool itself declines to call a finding: the finding is a step high on
         stillness AND hurried on pace, and this one reads at 10.18 ms per character, dead on the
         median. Its narration is the shortest on the card at 285 characters, and the material a
         longer one would carry sits on `watch` instead, which has a ball under it, precisely to
         keep the still hold off the top of that ranking.
         Step 5 is a down-arrow: the ball lands on the frame, both Pods blink, and the dissolve
         hangs one BEAT.afterPulse behind the blink (M-08).
         Three steps wind a chip back and turn it over on an arrival: the completion stamp and what
         it implies on `finished`, the Job status on `expire`, and the status plus the Pod count on
         `cascade`. `controller clock` never does, on any step, and all three steps where that reads
         as a FORM-E finding are carried in `test/fixtures/carried.mjs` with the argument: the clock
         is the premise a step acts ON, and binding it to an arrival would draw a wall clock that
         advances because a packet landed.
         `controller clock` holds at 12:02:11 through `cascade` rather than ticking to 12:02:12. The
         cascade is the same delete reaching the dependents, not a later event, so a second chip
         movement there would be a change nothing narrates and `report/arrival.test.mjs`
         R2-STEP read it as an uncued one.
         The Pods stay at full opacity from step 1 through step 4 and are never drawn at
         OPACITY.terminated. The phase vocabulary reads `terminated` as gone from the API or
         finished, and a finished Pod that is still a full object is exactly what this card exists
         to say, so dimming them for four of the six steps would have argued against the sentence
         and left the picture nearly empty while it did.
         No Pod is drawn dim, so `pulsePodDim` is called nowhere. The five `dim: true` literals here
         are the A-18 stroke weight on the three corridors and the two top-row arrows, which is not
         a state. Every pulse fires on a Pod at full opacity, and the one pulse with a fade beside
         it is step 5, where the exemplar's finding applies: a fade carrying `fill: both` composites
         over the whole delay window and would swallow the opacity half of pulsePodDim anyway.
CONTENT  The feature is Stable since Kubernetes v1.23, read off the page banner, so the card names
         no gate and no version.
         The timer sentence is the page verbatim in substance: `The timer starts once the status
         condition of the Job changes to show that the Job is either Complete or Failed`. `not when
         it was created` is the clause that separates this from every reader's first guess and it is
         what step 3 opens on.
         What the controller actually reads is the finished CONDITION and not the field the card
         draws: `jobFinishTime` in `pkg/controller/ttlafterfinished` returns the
         `LastTransitionTime` of the Complete or Failed condition. `status.completionTime` is the
         chip because on a Complete Job the same status update stamps both, and because a Failed Job
         has no such stamp at all: `The completion time is set when the job finishes successfully,
         and only then` (Job API reference). That is why every sentence measures from when the Job
         FINISHES and none of them says the controller reads that field.
         `0` and unset are the Job page rather than the TTL page: `If the field is set to 0, the Job
         will be eligible to be automatically deleted immediately after it finishes. If the field is
         unset, this Job will not be cleaned up by the TTL controller after it finishes.` `an unset
         field keeps the Job forever` is rejected for the desc: a Job a CronJob created is pruned by
         `successfulJobsHistoryLimit` whatever this field says, which `workloads-cronjob` draws and
         step 1 of this card names, so what an unset field buys is that THIS controller never
         touches the Job. `0 removes it` is rejected the way the `deleted at` chip is, because both
         pages say eligible: `If this field is set to zero, the Job becomes eligible to be deleted
         immediately after it finishes` (Job API reference). The cascade wording is `it will delete
         it cascadingly, that is to say it will delete its dependent objects together with it`, so
         the card says cascading and names ownerReferences as what makes both Pods dependents, and
         stops there.
         The skew caveat is the page's own Time skew section: the controller `uses timestamps stored
         in the Kubernetes jobs to determine whether the TTL has expired or not`, the feature `is
         sensitive to time skew in your cluster, which may cause the control plane to clean up Job
         objects at the wrong time`, and `the difference should be very small`. Step 4 carries all
         three clauses, because the comparison is the step that makes them true. Step 1 says
         `Finishing removes nothing` and not `Nothing removes them`, because these are terminated
         Pods and PodGC deletes terminated Pods oldest first once the cluster holds more than
         `terminated-pod-gc-threshold` of them, which `workloads-pod-garbage-collection` owns. The
         objects stay `by default` and not `on purpose`: the Job page argues the other way,
         `Finished Jobs are usually no longer needed in the system. Keeping them around in the
         system will put pressure on the API server.`
         Step 2 says a running Job is one the controller `passes over` and not one that is
         `invisible to it`. `needsCleanup` reads every Job the informer delivers and answers
         `j.Spec.TTLSecondsAfterFinished != nil && jobutil.IsJobFinished(j)`, so an unfinished Job
         is seen and skipped rather than filtered out before it arrives. That same line is what
         makes `leave it unset and this controller never touches the Job at all` exact.
         The job controller is not drawn and no sentence names it. Step 1 rides the exit report from
         the Pods up to the Job block as causality, and the narration says the condition `becomes`
         Complete rather than crediting an actor the picture does not carry.
         `ttl-after-finished` on the controller box is the `--controllers` name the
         kube-controller-manager reference lists, `ttl-after-finished-controller`, with the suffix
         dropped because the sublabel already says which process runs it. It is on by default there:
         the flag lists it under All controllers, and the Disabled-by-default line names only
         `bootstrap-signer-controller`, `selinux-warning-controller` and `token-cleaner-controller`.
         The sublabel `kube-controller-manager` is the house form (`PodGC`, `PV binding
         controller`).
NAMING   The chip is `eligible for removal` and not `deleted at`. The page says a Job `becomes
         eligible for cascading removal` once the TTL expires, which is a threshold and not a
         promise, and naming it `deleted at` would contradict the skew clause the same card makes.
         Its idle value is `not finished` rather than `none`, because a running Job has no
         eligibility at all and `none` would read as a field that is empty.
         `controller clock` and `status.completionTime` are two chips on purpose. They are the two
         readings the skew caveat is about, one stored in the object and one owned by the process,
         and folding them into an elapsed counter would delete the distinction the caveat needs.
SCOPE    `completions`, `parallelism`, `backoffLimit` and how a batch reaches Complete are
         `workloads-job-parallelism`. This card starts at a Job that has already finished, and its
         first step draws that arrival rather than the run.
         `successfulJobsHistoryLimit` and `failedJobsHistoryLimit` are `workloads-cronjob`. They are
         a COUNT-based prune the CronJob controller runs over the Jobs it created, where this is a
         CLOCK-based delete a different controller runs over any finished Job. The contrast is one
         clause at the end of step 1 and the CronJob side is not taught here.
         PodGC and `terminated-pod-gc-threshold` are `workloads-pod-garbage-collection`, in
         pods-lifecycle. That is a different controller with a different trigger, a count of
         terminated Pods cluster-wide rather than an owner cascade, and none of it is drawn: the
         `pods owned` chip and step 5 say the Pods go because their owner went.
         `ownerReferences`, the dependent walk and finalizers are `cluster-cascading-deletion`. The
         cascade is NAMED and its arrow is drawn, and the mechanism behind it is not.
NOT A DEFECT
         All three findings this card leaves standing are carried with their reason in
         `test/fixtures/carried.mjs`, which is where a ruling belongs: a record cannot suppress a
         report row and a comment cannot be checked for staleness.
         R4 on `cascade`, the Job sending its ball while dark. The sender DIES in the step it sends
         from, and that is the one shape R4 has no cue for. Both of its fixes are ruled out by an
         ASSERTED check, which is the half the report row cannot see: `lit` plus
         an `unlight` on the fade (S-18) does close R4, measured, 41 rows to 40 catalog-wide, and
         then reddens `render/reduced.test.mjs` on HIGHLIGHT, because the static path never runs the
         flow and so never takes the key back. `lit` WITHOUT the unlight is what S-18 forbids and
         `unit/spec-steps.test.mjs` asserts at zero. The mid-chain shape needs an earlier arrival,
         and the only delete that could land here already lands in `expire`, so re-drawing it would
         be a ball for traffic this step does not narrate (M-10).
         The four R2-ENTRY rows on `watch` are the frozen-sample artefact. `finished` winds the four
         chips back and turns them over in an `F.set` bound to the exit report landing, so a sample
         taken at t=0 sees the rewind and not the set and attributes the change to the next step.
         R2-STEP, settled against settled, does not list this card at all.
         The `watch` clockChip row on `report/chip-beat.test.mjs` FORM-B is the third reading of the
         same clock, carried on the argument the two FORM-E entries beside it carry: the clock is
         the premise a step acts on, not something a packet produces.
```
