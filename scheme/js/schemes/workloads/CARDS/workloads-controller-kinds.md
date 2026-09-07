## workloads-controller-kinds

### layout

```
WHAT     Six controller kinds over one row of Pods, in two owner tiers, with three questions reading
         out whichever kind is in focus.
LAYOUT   No A / B / C preset. The card carries neither a ladder nor a chip column flanking a spine,
         so it has nothing for the three presets to choose between, and neither does it take a
         WL.L-05 bottom strip: the chips stay a COLUMN and the column is centred instead.
           caption three questions that pick one, baseline 26, centred on WL.CX
           chips   420..780, 3 x 34 + 2 x 8 = 118 tall, opening on WL.TOP_Y
           owners  two boxes only, over columns 0 and 3, 224..280
           kinds   four boxes, 386..450
           Pods    four, at the FULL column width, 550..624, bottom on the 624 floor the
                   category draws its Node rows to
         The four columns come out of spread(60..1140, count 4, w 240), so the gap is 40, the board
         spans the full WL width and it centres on WL.CX by construction. A Pod takes the whole 240
         of its column rather than a narrower tile inside it, so a column reads as one stack of
         three: owner, kind, Pod.
         The chip column is 360 rather than the 480 of WL.COL_R, and that narrowing is the whole
         reason it can be CENTRED: at 480 a column centred on WL.CX would start at x=360 and stand
         under the panel, and at 360 its left wall is exactly the 420 L-03 allows. Its centre is
         600, so the CENTRE rule is met rather than carried.
         Only two of the four columns carry an owner, and the 300..900 the two of them leave empty
         is where the standing caption sits: the gap IS the sentence the caption states.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-controller-kinds
         node --test report/overlay.test.mjs`. Deepest on step 2 at 1100x800, shallowest at
         1600x1000. OWNER_Y 224 stands 43.88 clear of the deepest reading and `L-03` holds for the
         two boxes that start at x=60. It is the shallowest panel in the section, and that is the
         depth showing in the geometry: an L1 card names rather than teaches.
SIZES    A Pod is 240 x 74 and its held-value block 216 x 42, inset 12 and dropped 24, which leaves
         8 clear under the block and 10 between it and the Pod label. The block carries the same two
         halves `workloads-pod-garbage-collection` gives its phase readout, for the same reason: a
         Pod holding nothing reads as an empty rectangle, and this is the one thing each of these
         four holds. The floor is the DaemonSet Pod's `One per matching Node`, measured 137.8 as a
         12px scheme-box-label, which leaves 39.1 clear at each wall of the 216.
         The block LABEL is a heading and takes a capital while its second line stays body text,
         which is System A (T-09). The six findings that check carries open are literal API names
         where a capital would print something that does not exist, and a prose heading is not one
         of them.
         The chip column is 360 wide, 336 of it usable once valChip insets its two strings by 12.
         The tightest pair is `replica identity` against `ordinal, web-0 stays web-0`, measured
         110.3 and 179.2, which leaves 46.5 against the MIN_GAP of 4 that `render/chipfit.test.mjs`
         holds it to. 360 is therefore the narrowing the centring needs and not the narrowest the
         strings allow.
         The caption over the column measures 199.8 and centres on WL.CX inside the column, 10.6
         clear of the first chip.
LANES    Six two-point verticals, one per owned relationship. Each is built ONCE in LANES and the
         P.arrow and the F.segment index the same two point objects, so the drawn wire and the ball
         are one array (A-02 SHARED). Every lane carries a ball on the step that names it, so no
         arrowhead stands over traffic that does not exist (A-05).
         There is NO lane from an owner box to a Pod, and that absence carries the content: a
         CronJob reaches a Pod through a Job and a Deployment through a ReplicaSet.
         106 units on the owner hop, 100 on the Pod hop, both under the routeDur floor, so every
         ball runs 700ms. Six other cards run the same 100, so it is the house reading (M-13). The
         board is ONE opacity field and nothing states a lane shade of its own (A-16). `live` names
         the blocks in focus, everything else takes OPACITY.notready, and every lane then reads
         min(source, sink) off the two ends it joins (A-13), so a lane can never outshine the box it
         leaves. `schedule` is the step that needs it: CronJob, Job and its Pod are all live, so
         laneCron and laneJob both stand at 1, while on `ends` the Job alone acts and laneCron drops
         to the shade the dark CronJob above it holds.
MOTION   2400 / 3800 / 3000 / 3000 / 3000 / 3800 against spans of 1800 / 3200 / 2400 / 2400 / 2400 /
         3200, which is 600ms of stillness on every step, near the least still end of the catalog
         (`card-review/tools/deadair.mjs` prints the ranking).
         `kinds` carries no packet. Its beat is the four Pods blinking left to right 200ms apart,
         which is the row every one of the six ends at and the only thing that step claims.
CONTENT  Read against the k8sVersion in cards.js. `spec.parallelism` is what the `ends` step reads
         under `what sets the count`, not `spec.completions`. The API reference calls parallelism
         `the maximum desired number of pods the job should run at any given time` and completions
         `the desired number of successfully finished pods`, so completions answers the OTHER
         question and the endChip beside it already states it as `yes, at completions`. Naming
         completions in both chips makes one step answer one question twice.
         `about one per tick` is the qualifier the CronJob step cannot drop. Upstream: `A CronJob
         creates a Job object approximately once per execution time of its schedule. The scheduling
         is approximate because there are certain circumstances where two Jobs might be created, or
         no Job might be created.` An unqualified `one Job per tick` contradicts
         `workloads-cronjob`, which narrates `a CronJob is not exactly-once and may rarely create
         two Jobs or none for a tick`. The mechanism behind it stays that card, this one carries
         only the word that keeps the claim true.
         The `endChip` on that same step reads `no, only each Job ends` and NOT `yes, once per
         tick`. The rejected value breaks the card's own NAMING rule, because it answers `what sets
         the count` under a chip named `does the work end`, and it restates the unqualified count the
         same step denies twice, in the narration and in the `countChip` beside it. What
         the chip has to answer is the END question, and the answer is two-sided: each Job it
         creates finishes, upstream `the Job in turn is responsible for the management of the Pods`,
         while the CronJob itself keeps evaluating its schedule, which is the same `no` the three
         controller steps above give for their own reason. Length is what settles the wording: the
         chip is 360 wide and the name takes 17 characters of it, so `each Job does, the CronJob
         does not` at 35 characters is REJECTED on the rendered frame, where its value touches the
         name with no gap at 1100x800. 22 characters leaves the gap the `countChip` row has.
         The four held-value blocks are each an upstream sentence: a ReplicaSet Pod is born from
         `generateName` and its replicas are fungible, a StatefulSet Pod takes `$(statefulset
         name)-$(ordinal)` and `the identity sticks to the Pod, regardless of which node it is
         (re)scheduled on`, a DaemonSet carries no `spec.replicas` and places Pods on nodes matching
         a selector or on all nodes when none is set, and a Job Pod template takes only `Never` or
         `OnFailure`, so a Pod that succeeded is not restarted.
         `Deployment replaces the legacy ReplicationController` in the `desc` is upstream calling
         ReplicationController a `Legacy API ... Superseded by the Deployment and ReplicaSet APIs`.
BUDGET   235 characters is the ceiling on a narration here, measured on step 3. At 256 that step
         wraps one more line at 1100x800 and the panel bottom goes to 204.97, which leaves OWNER_Y
         19.03 of clearance instead of 43.88. Spend a longer sentence only after re-measuring
         (L-08).
NAMING   The three chips ARE the three questions, and each value is the answer for the kind in
         focus, so a chip still means what its name says on every step (P-02).
SCOPE    This card NAMES the six kinds and teaches none of them. The reconcile loop,
         ownerReferences, adoption and release are `workloads-replicaset`. maxSurge, maxUnavailable
         and the rollout window are `workloads-rolling-update`, and the revision history is
         `workloads-deployment-rollback`. OrderedReady and the ordinal gate are
         `workloads-statefulset-ordered-rollout`. Tolerations and a Node joining or leaving are
         `workloads-daemonset`. completions, parallelism and backoffLimit are
         `workloads-job-parallelism`. concurrencyPolicy, the history limits and a missed tick are
         `workloads-cronjob`. No autoscaler appears anywhere, which `workloads-pod-resize` carries
         as a catalogue-wide SCOPE. A step that starts explaining a field has left L1.
NOTE     All three chips turn over at step ENTRY and stand for the BEAT.lead 1500ms before the first
         ball lands, which puts ten rows into the FORM-B queue of `report/chip-beat.test.mjs`. All
         ten are filed in `test/fixtures/carried.mjs` under axis FORM-B, one entry per row, which is
         where a ruled-on report finding lives: the file that prints the row cannot open this
         record. They are the ordinary case P-06 admits, and it is what the chips ARE here: a
         readout of the kind in focus, not a value any ball on this card produces. Holding them back
         to an arrival would say a Pod being created is what decides whether a replica has an
         identity. ReplicationController is named ONCE, in the `desc`, and never on the canvas.
         Upstream files it as the legacy API a Deployment replaces, so it is a fact about Deployment
         rather than a seventh kind, and a seventh box costs the reader the one thing this card is
         for, telling six names apart. Automatic Cleanup for Finished Jobs is the eighth child of
         the upstream index and is left out for the same reason: ttlSecondsAfterFinished is a field
         on a Job, not a kind anybody picks between. `nodes` names the Node set, and the Node is on
         the canvas as the label of the DaemonSet Pod's held-value block, `One per matching Node`,
         rather than as a frame (T-21). Upstream runs a DaemonSet across every Node OR across a
         subset, so `matching` is the qualifier the sentence cannot drop.
WHY NOT  No node() frame, which is the lever no sibling in this section drops. One frame would claim
         a DaemonSet has one Node, and three would reproduce `workloads-daemonset`, whose four
         frames own that picture. The subject is which API kind to write, and no Node acts in it. No
         P.chain, which all seven siblings carry. A chain row is a stage in a sequence and these six
         kinds are alternatives rather than stages, so a ladder of them would argue that a reader
         passes through each in turn.
OPEN     The band right of the chip column, 780..1140 above y=224, carries nothing, and so does
         420..780 between the column bottom at 158 and the owner row. Column 0 of the board starts
         at x=60 and L-03 will not let the board rise above this card's 180.12 panel bottom, so
         nothing on the board can move up into either gap. Widening the chip column back towards
         WL.R fills the right one and costs the centring, which is the trade L-16 describes: the
         rule and the picture pull opposite ways and the picture wins.
```
