# Scheme card design notes: workloads

The per-card design record for `js/schemes/workloads/`. It answers what the code cannot: why a
number is what it is, which alternative was measured and failed, and what must not be "fixed".
The constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note below records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`unit/docs.test.mjs` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `unit/docs.test.mjs` verifies every anchor still occurs in its card, so **an anchor is DATA:
never reword one** (`S-38`).
``### note (anchor dropped: ...)`` is a note whose target line is not unique in the file.

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM varies per card
and per viewport inside the band `L-04` states, and it moves NON-MONOTONICALLY (`L-02`, `L-04`,
`L-05`). So a `PANEL_B` in a card is a measurement, not a convention. Re-measure after any
prose change with `npm run report` from `scheme/test/`, which prints the real extent per card,
per step, over the three viewports: several cards here carry a hard character ceiling and
nothing in `npm test` enforces one (`L-08`).

---

## workloads-container-env-injection

### layout

```
WHAT     The three sources a container environment is assembled from, the moment it is handed to
         PID 1, and why editing the source afterwards moves nothing.
LAYOUT   B, which WL.L-04 calls the common case.
         PANEL_B 280, the short column under the panel and the tall one in the free band.
           chips  left  60..540 (LAYOUT.B.chips), 4 x 34, gap 8 -> 300..460
           ladder right 660..1140 (LAYOUT.B.ladder), 5 rows -> 150..350
           node   full width, 496..624, Pod 370..830 at 518..614
         WL.L-06 picks B because A needs a panel bottom of 262 or less under WL.L-03 and this card
         measures 279.51: a 5-row ladder in the left band would end on 480 and leave 16 to the
         Node frame, and the 4-chip column that goes there instead ends on 460 and leaves 36.
PANEL    The deepest reading is the POSTER frame, which previews step 1 text (D-14), and step 1 is
         the longest narration on the card. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-container-env-injection node --test report/overlay.test.mjs`.
SIZES    The inner container box is 300 x 44 and NOT 52, for the reason workloads-probes does not
         hit: this card writes the Pod sublabel per step, pod() puts it on the baseline h - 8, and
         its ink reaches about 595, so a box ending on 600 is struck through.
LANES    The top row carries the WL.A-01 pair and both halves ride: the Kubelet asks on REQ_Y and
         the API answers on RESP_Y. The corridor at WL.SPINE_X carries exactly ONE ball on the
         whole card, the CreateContainer call on `create`, and that scarcity is the argument.
         It stands in its resting DOWN direction on all six steps. On the last step that is the
         point: the update arrives at the Kubelet and the empty corridor under it is what the
         reader is meant to see.
MOTION   Step 1 has no packet and no Pod, so its beat is a static highlight alone (M-27).
         Step 2 is the only two-hop step: ask, then answer at BEAT.afterHop.
         Steps 3 and 5 are self-initiated by the API and wait BEAT.lead.
         Step 4 is a down-arrow: the ball lands, THEN the Pod blinks and lifts (M-16), which is
         the single opacity change on the card and the moment the container exists.
CONTENT  Every claim on this card is a quoted upstream sentence rather than a derivation.
         The ConfigMap page states that the kubelet uses the data from the ConfigMap when it
         LAUNCHES the container, and that ConfigMaps consumed as environment variables are not
         updated automatically and require a Pod restart.
         The container-environment page states that the Service variables cover the Services that
         existed WHEN THE CONTAINER WAS CREATED, which is the ordering trap step 3 is about.
         The downward API page states that metadata.labels and metadata.annotations as a WHOLE are
         available only as volume files and never as variables, and that after a resize the
         downwardAPI volume updates while the variables do not unless the container restarts.
         That last sentence is why step 5 can name a resize without drawing one.
NAMING   The fourth chip is the OBJECT and the three above it are VARIABLES, which is the whole
         comparison: on the last step the object chip changes and lights while the three variables
         are deliberately left unlit, because that they did not move is the sentence.
SCOPE    Files are not this card. storage-configmap-secret-mount owns the atomic ..data flip and
         the sync period, and storage-projected-volume owns the assembled mount. The contrast is
         one clause of step 5 and no volume is drawn.
         The resize itself is workloads-pod-resize. It is named once, as the second case of the
         same freeze, and no resize plays.
         The Secret is read on step 2 and never opened: workloads-pod-image-pull owns registry
         credentials and no card in this catalogue draws Secret encoding.
```

### poster

```
Two blocks side by side and ONE dashed wire between them with a break in the middle. The left block
is the source and its top value carries the house accent at 0.9, the right block is the copy inside
the container and all three of its values sit at 0.3. The left half of the wire is 0.75 and the
right half 0.28, so the ramp carries the direction and no arrowhead is needed (R-08).
The first draft ran the wire as two dashed segments BELOW the two blocks. At 200px each segment
paired with the block above it and read as an underline, so the one sentence the poster exists for
was gone. Moving it to the block midline at y 92, with a 28 unit void between 146 and 174, is what
makes the break read as a break.
The two-block form is the closest in this section to workloads-pod-qos-classes, which is three
blocks over a baseline whose weight ramps. The wire is what separates the two at thumbnail size.
```

---

## workloads-container-states

### layout

```
WHAT     Kubelet writes containerStatuses[]; the card reads state, lastState and restartCount
         off one container to show which field holds the cause of death.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 6 rows
           node   full width, NODE_H 140 on the canvas floor 624
         Layout A does not fit: the six-row ladder is 6*32 + 5*10 = 242 against a left band under
         the panel of 250..464 = 214, twenty-eight short.
LANES    One spine at WL.SPINE_X into the Pod's TOP MIDPOINT. The Pod is centred in the frame,
         so the spine reaches it rather than stopping on the frame edge above it.
```

### before `id: 'read',`

```
read, exitcodes and describe are the three mute steps of this card, 6700ms in which the picture
does not move and nothing animates, which is what M-27 asks of a packet-less pod-less step. The
actor of all three is a value chip (state, lastState, restartCount), and a value chip is lit rather
than flashed (M-26). No block on the card is the subject of any of the three sentences.

None of the three lists the Kubelet box in lit. It wrote the record on crash and on restart and
does nothing on these three, and flashing it three times running would say it acts, on the only
steps where it does not. podGroup is out of describe for the neighbouring reason: a brightness
flash on the Pod reuses this card's own sign for the container changing state (crash and restart
both pulse it) on a step where nothing changed.

So the three stay separated by the outlined chips and the lit chain row alone. One and the same
block flashing three times running would not have changed that.
```

### poster

```
Two container records stacked, the live one solid at 0.09 with a filled dot, the one below dashed
and dimmed with an X. The sentence is that the SECOND record still exists: the dead instance is
drawn, not erased, because the whole card is about lastState surviving the restart.
The text lines inside each are drawn as bare rules at different lengths and opacities, so the two
read as records rather than as two Pods.
```

---

## workloads-crashloopbackoff

### layout

```
WHAT     Kubelet holding a restart off between attempts, the backoff doubling to its cap.
LAYOUT   B (chips left, ladder right). panel bottom 205 measured, 225 reserved, deliberately
         conservative.
LANES    Spine from the top row to POD_Y. It does not end on the Node frame's top edge, which
         sits 22 units above the Pod and reads as a lane pointing at a frame rather than at a
         container.
WIRE LABELS
         The lower label is anchored start at SPINE_X + 14 and hangs off the side. Centred on
         WL.SPINE_X the lane strikes it through on every step that sets it.
CONTENT  The FIRST restart is immediate and only the ones after it wait, which the `first-crash`
         narration says ("Kubelet restarts it immediately the first time"), so the `aria-label` says
         it too rather than promising a delay before EACH restart.
         restartCount reads 8 on `reset`, not 7. `cap` leaves it at 7 with the container Waiting, and
         `reset` narrates a NEW container running stably, so the counter has to have moved with it,
         and the step lights it for the same reason the other three chips it changes are lit.
CONTENT  The 300s ceiling is a per-node DEFAULT, not a constant, and `cap` says so in five words
         ("a per-node default since 1.35"). KubeletCrashLoopBackOffMax is beta and enabled by
         default at this card's declared 1.35: "With the feature gate KubeletCrashLoopBackOffMax
         enabled, you can reconfigure the maximum delay between container start retries from the
         default of 300s (5 minutes). This configuration is set per node using kubelet
         configuration." The step read "clamped at the 300s ceiling and stays there", which is a
         version-scoped default stated as a property of Kubernetes.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  The `desc` says "a 5 minute ceiling" flat and rung 5 says "delay clamped at the 300s
         ceiling", and both stand as written. Neither is FALSE: 300s is the default and the only
         value a default cluster ever uses. The desc sits at 433 of a hard 400..470 band with three
         sentences already carrying more load than a version-scoped qualifier is worth, and a rung
         is bounded by its column. The nuance belongs on the one step whose whole subject is the
         ceiling, and `cap` carries it.
         The 10s base, the doubling, the 300s value, the 10 minute reset and the immediate first
         restart in the `aria-label` are the raw doc verbatim. Do not "correct" any of them.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];`

```
The DOWN lane carries no ball on `backoff-named`, `doubling` and `cap`, and that absence IS the
content: those are the steps where Kubelet is HOLDING THE RESTART OFF, which each narration says
in words, and the restart it is holding is exactly what would travel down. The crash goes UP and
is animated on `first-crash` and `reset`.

A down-ball on any of the three would assert the restart happened on the step whose subject is
that it has not. The other lane in the catalog whose emptiness is the lesson is `W_RET_WIPE` on
storage-reclaim-policy.
```

### poster

```
A near-closed circle with a filled arrowhead where it would close, wrapped around a container
carrying an X. The gap in the circle is the point: the loop does not complete, it waits. That gap
is why the arrowhead is here at all, since a closed ring would have said direction by itself.
No timings, no ladder, no chips: the poster says LOOP and BROKEN and nothing else.
```

---

## workloads-cronjob

### layout

```
WHAT     A schedule firing Jobs, with ticks that are skipped by concurrencyPolicy or missed
         during downtime staying visibly dark.
LAYOUT   C (bottom strip). panel bottom 330.
           ladder 660..1140, 6 rows
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row on CX
           ticks  left band under the panel, one chip per 5-minute tick
         Neither column beside the panel fits: the left band is 350..464 = 114, against a 242
         ladder and a 202 chip column.
         Chips two per row, which the WL brief prefers, is three rows (118 tall) and leaves the
         Node frame 64 units where the Pod alone is 106. Three per row is 350.67, the floor, and
         the widest value here needs 304.
         The ticks are not at x=830: there they run straight through the pipeline ladder.
         POD_PAD is 80, not the family 24. With the frame at 404 a pad of 24 draws the first Job
         slot over the frame's own NODE-1 label. The row still centres on CX by construction.
LANES    Trunk from the CronJob box at TOP1_CX straight down (no jog, there is no left column to
         clear) into a bus at NODE_Y-8, tapping only the two Job slots that ever receive a create.
         `LANES` is built ONCE, one array per tapped slot, and the `P.lane` and every `F.route`
         index it, so the wire and the ball are the same array (A-02 SHARED). All 3 routes read it
         and none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh array per call
         leaves the lane and the ball two equal copies, free to drift on the first geometry edit.
CONTENT  The `create` step says a repeated create for one tick COLLIDES ON THE NAME, not that a tick
         "can only ever produce one Job". The deterministic suffix is what makes the retry idempotent,
         and the `missed` step four rows down says the controller is not exactly-once and may rarely
         create two Jobs or none, so the unqualified form contradicted the card's own later step.
CONTENT  A Forbid skip is NOT a run cancelled. `forbid` read "the controller skips the new tick
         entirely and records the Event JobAlreadyActive, it does not queue the run for later",
         which teaches the opposite of the doc: "Forbid: The CronJob does not allow concurrent runs
         ... Also note that when the previous Job run finishes, .spec.startingDeadlineSeconds is
         still taken into account and may result in a new Job run." and "when using
         concurrencyPolicy: Forbid, long-running Jobs may cause scheduled times to be skipped, but a
         new Job can be created once the previous Job completes." The controller writes no
         status.lastScheduleTime on a Forbid skip, so the missed time stays unmet and can still start
         inside the deadline. The step now ends "but once the previous run finishes that skipped tick
         can still start if it is inside startingDeadlineSeconds". `JobAlreadyActive` was verified in
         the controller itself and is correct.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
CONTENT  The 100-missed-schedules check and startingDeadlineSeconds are NOT alternatives. `missed`
         read "With no deadline set the controller instead refuses to schedule once it finds more
         than 100 missed start times", and the `desc` read "within startingDeadlineSeconds, or, with
         no deadline, until 100 ticks pile up". The "instead" and the "or" made them mutually
         exclusive. The doc: "For every CronJob, the CronJob Controller checks how many schedules it
         missed in the duration from its last scheduled time until now. If there are more than 100
         missed schedules, then it does not start the Job and logs the error." The check runs
         UNCONDITIONALLY, and the deadline only narrows the window it counts over: "if the
         startingDeadlineSeconds field is set (not nil), the controller counts how many missed Jobs
         occurred from the value of startingDeadlineSeconds until now rather than from the last
         scheduled time until now." The step now opens that sentence with "Whether or not a deadline
         is set", which is the whole repair: the falsehood was the EXCLUSIVITY, not the rule. The
         `desc` reads "bounded both by startingDeadlineSeconds and by a ceiling of 100 missed ticks",
         at the same 460 characters as before.
         The narrowing itself is deliberately NOT in the card, and that is a PANEL decision recorded
         under BUDGET below rather than an editorial one.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
CONTENT  "refuses to schedule" past 100 misses stands exactly as written, and the two words are
         load bearing. kubernetes.io says the controller "does not start the Job and logs the
         error", and the controller read on six branches from release-1.24 to master emits a
         TooManyMissedTimes Event and creates the Job anyway. So the DOCS PAGE is the stale party
         here, and which of the two a card follows is a product decision, not a defect to close.
         The wording above changes the framing of that clause and not its claim.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
BUDGET   Both repaired steps were sized by OPENING THE FRAME at 1100x800. A first `missed` that also
         explained the narrowing ran to 611 characters and covered the `Node-1` label 100%, clipping
         backup-28394400 with it. A first `forbid` that named startingDeadlineSeconds ran to 547 and
         buried the `schedule ticks · every 5 min` caption, which the ORIGINAL string cleared by 1.6
         units: this card sits one line off its caption on both these steps and has done all along.
         The shipped strings are 486 (`forbid`, was 483) and 504 (`missed`, was 511), both on the
         same line count as before, and `npm run report` has the card SHALLOWER than it found it,
         329.20 against 378.90 at 1100x800. Ceilings: about 490 for `forbid` and about 510 for
         `missed`, and the line boundary is between 486 and 497 characters, measured.
         Nothing in `npm test` or `npm run report` sees a covered caption, so re-open the frame.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
```

### before `id: 'suspend',`

```
The beat is the static highlight on the CronJob box, which is both the object spec.suspend is set on
and the actor that stops creating Jobs. The frame is otherwise all but identical to the step before
it, and the wire label is what separates them.
The same block as forbid and missed on purpose: all three mute steps are one controller deciding
not to create, and a different block per step would claim three different actors.
F.flash stays off all three. It animates filter brightness 1 to 1.55 to 1 on the block group,
which M-04 calls a pulse and M-01 forbids on infrastructure, and its 600ms equals the whole span
of each step, so no still frame can tell it from the highlight it replaced.
```

### poster

```
A clock on the left, a dashed leg with a chevron, and a Job frame on the right holding one filled
run. Direction is the sentence (the clock CAUSES the Job), so the chevron is earned here where most
posters do without one.
The four tick dots make the circle a clock rather than a node, at four marks instead of twelve: at
200px, twelve would read as noise.
```

---

## workloads-daemonset

### layout

```
WHAT     One Pod per matching Node, across four Node frames, with a Node joining and a Node
         leaving.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 5 rows = 200
           nodes  four frames on the canvas floor, 484..624
         Layout A fits on paper and is not used: the five-row ladder is 200 against a 214 band,
         which leaves about 14 units between the ladder's bottom and the Node row for the bus. The
         mirror leaves 74.
LANES    Trunk from TOP1's bottom midpoint, stepping to WL.SPINE_X at y=140, into a bus at
         NODE_Y-24 with ONE TAP PER POD. Each step routes its ball down the tap of the Pod that
         actually reacts, and the create step fires three, one per matching Node. `LANES` is built
         ONCE, one array per Pod, and the `P.lane` and every `F.route` index it, so the drawn wire
         and the ball are the same array (A-02 SHARED). All 6 routes read it and none is carried.
         Do not rebuild it as a `LANE(i)` factory: a fresh array per call leaves the lane and the
         ball two equal copies, which come apart on the first geometry edit.
         A lane into a Node not in the cluster is pinned to 0: lane 3 until Node-4 joins, lane 1
         once Node-2 leaves.
         ONE lane for the whole card lands on Node-1's top edge on EVERY step, including the step
         that adds a Pod to Node-4 and the step that deletes the Pod on Node-2, which is what the
         tap per Pod is for. A straight trunk at x=530 cuts through the chip column 60..540.
```

### poster

```
One Pod per node across the cluster: three nodes each hold a single Pod, the dashed node
on the right is joining (the + marker) with its Pod still forming. The uniform 1:1
pod-to-node mapping is the DaemonSet signature.
```

### before `const create = (i, rank) => [`

```
Both counters climb PER ARRIVAL, not at step entry. The narration is `creates one Pod on each` and
the card draws three separate creates, so the count climbing alongside the three Pods appearing IS
the step. The `chips:` block states `0`, which is the entry state the last paragraph demands, and the
`3` is written by the `F.set` inside each create. `flow` runs on the ANIMATED path only, so a
reduced replay of this step ends with both counters still reading 0. Chip text is not one of the
four axes `render/reduced.test.mjs` compares (only WIRE-TEXT is), so nothing in the suite sees it.

The visible sequence is 0, 2, 3 and NOT 0, 1, 2, 3. Two of the three taps sit 138 units off the
spine against the third's 414, so those two land in the same millisecond and the `1` is overwritten
in the instant it is written. In full: 594 units of lane arrive at 1320ms twice over, 870 units at
1933ms once. That was equally true of the accumulator this replaced, which hid it.
The rank each landing writes is a literal, and NOTHING in the suite can see it: swapping two ranks
leaves every check green. Opening the mid-count frame is the only guard there is.

Neither counter is read from step entry. The step says the controller sees three matching Nodes
and ZERO Pods, and the Pods do not fade in until their creates land about 2s later, so a counter
reading `3` at entry contradicts the narration it accompanies. `numberReady` is the worse half.
```

---

## workloads-deployment-rollback

### layout

```
WHAT     A bad rollout stalls past progressDeadlineSeconds and is undone, with RS-v1 never
         scaled down.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 160 tall
           ladder 660..1140, 6 rows = 242
           row    FOUR slots, 4 x 234 at centres 201 / 467 / 733 / 999, Pods web-a1..d4
         Layout A is out: the 242 ladder does not fit the 250..464 band; the 160 chip column
         does.
         FOUR slots and not three. Every step pins RS-v1 at 3 / 3 and the wedged step says RS-v1
         keeps ALL THREE v1.0 Pods serving, so the three v1 Pods must be drawn at once. With three
         slots the broken v2 stands in one of their places and the row shows two survivors against
         a chip saying three. The fourth slot carries the whole v2 story alone: it appears on the
         rollout, crash-loops, wedges, and is DELETED by the undo rather than converted back into
         a v1, which is what the undo step narrates.
LANES    ONE lane, because only the surging Pod ever receives a ball: trunk from TOP1's bottom
         midpoint, step to WL.SPINE_X at y=140 to clear the chip column, bus at NODE_Y-24, tap
         into web-d4 at centre 999.
MOTION   Steps 1, 2 and 4 run 3700 / 2900 / 3700, sized to the four-slot route.
```

### poster

```
Revision history with a rollback: rev 1 (good) and rev 3 (restored copy of rev 1) carry the
same version bar, rev 2 (bad) is dimmed and struck out, and a solid counter-clockwise undo
arc sweeps from the current revision back over the bad one to the good revision.
```

### before `const slots = (...vs) => ({`

```
LANES    The one lane ends on web-d4 and on nothing else, so its shade is that slot's shade (A-13)
         and it leaves when the slot empties (A-14). `slots()` pins both from one argument, which is
         why no step can state them apart. Measured with `effectiveOpacity`, after against before:
         `stable` 0 against 1, `rollout` 1 against 1, `bad` 0.40 against 1, `stuck` 0.40 against 1,
         `undo` 0 against 1, `restored` 0 against 1. The Deployment box, the source end, is 1 on all
         six steps, so min(source, sink) IS web-d4. `bad` was the loudest of the six: nothing travels
         on that step at all, so the lane was the only full-strength thing left pointing at a Pod at
         OPACITY.notready.
         The lane is not held at 1 on `stable` and `restored` to keep the two halves of the picture
         joined. On both steps the fourth slot is EMPTY, so the lane would end in blank canvas
         inside the Node frame, which is the case A-14 calls a rendering fault rather than a dim
         relationship. The frames at 1600x1000 and 1100x800 read better without it: three v1 Pods
         and no dangling arrowhead, and the trunk arriving with the surge is a beat the card did
         not have.
         It IS at 1 for the 2700ms of `rollout` before web-d4 appears, pointing at an empty slot.
         It is carrying the create ball over that whole window, and A-15 outranks A-14 while a ball
         is in flight. `workloads-replicaset` step `converge` is the same trade, taken the same way:
         its rewind brings the bus tail and tap3 back for the flight that deletes the Pod.
MOTION   `bad` and `undo` fade the lane on the SAME beat as the Pod, same duration and easing (800
         and 2700, FADE.out), and both rewind it so it is on screen for the whole flight (A-15). Both
         spans stay 1500 and 3600 against durations 2900 and 3700, so no duration moved.
```

### before `rewind: { opacity: { pod4: 0 } },`

```
The surge Pod winds back to absent and rises over FADE.in on the arrival of the create ball, with
the pulse on the same beat. DO NOT draw it in the static block at t=0: the ball lands 2700ms later,
so the arrival announces something already on screen.

The chips did NOT have to move with it, and that is worth writing down because the sibling card
`workloads-rolling-update` needed exactly that on the same repair. Nothing here counts live Pods:
`rs2Chip` reads `0 / 1`, which is Ready 0 of desired 1 and is TRUE of a Pod that has not appeared
yet, and `rs1Chip` reads `3 / 3` over the three v1 Pods, which never leave. On rolling-update the
same step states `4 Pods alive`, which is false until the fourth is drawn.
```

### before `F.pulse({ pod: 'pod4' }),`

```
`bad` carries NO packet, and that is the content: the sentence is that the readinessProbe NEVER
passes, so no Ready report ever leaves the Pod. It crash-loops in place, pulses, and settles to
OPACITY.notready a beat later. A-06 decides this: a lane earns a ball when a step names something
travelling, and this step names a report that does not happen.

It fires NO route and `apiserver` is out of `lit`: nothing arrives there, and `stuck` next door
lights no actor at all. DO NOT give it a route named `status` whose points array is SPINE,
byte-identical to the `surge` CREATE route of the step before it: that draws a probe failure the
step reports UPWARD as the controller sending something DOWN into the Pod (A-03).

There is no return lane. Mirroring SPINE at the card's lane delta means moving the shared endpoint
on web-d4's top face to make the pair L-12 allows, which retimes the `rollout` and `undo` routes as
well (A-11), and it would draw traffic the step says never leaves.
```

---

## workloads-effective-pod-request

### layout

```
WHAT     Four containers with four cpu requests, and the one number the Scheduler and the Kubelet
         both read off them, which is neither their sum nor the largest of them alone.
LAYOUT   B, on the four-container Node family workloads-init-containers-and-sidecars solved.
         PANEL_B 255, the short column under the panel and the tall one in the free band.
           chips  left  60..540 (LAYOUT.B.chips), 4 x 34, gap 8 -> 275..435
           ladder right 660..1140 (LAYOUT.B.ladder), 5 rows -> 160..360
           node   full width, 484..624 at NODE_H 140, Pod 186..1014 at 501..607
         WL.L-06 picks B and not A because the Node here is 140 and not 128: A would need
         254.66 + 20 + 200 + 20 + 140 = 634.66 against the 630 ceiling of WL.L-03.
PANEL    The deepest reading is step 2 at 1100x800, 254.66, and the chip column starts at 275, so
         20 units stand clear. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-effective-pod-request node --test report/overlay.test.mjs`.
SIZES    The four container boxes are derived, not typed: strip() fixes the 16 unit gap across the
         shell inside a 10 pad, so four of them leave 190 each. The longest sublabel is
         `always cpu 200m` at 17 characters, about 117 units against that 190.
LANES    One corridor at WL.SPINE_X and no pair, because nothing on this card ever travels UP from
         the Pod: the Pod is read, never heard from. It carries a ball on the last step only.
         The top row carries the WL.A-01 pair and both halves ride on `overhead`.
         The corridor stands on all six steps. It is the only lane on the card and it points at the
         Pod the whole time, which is what the card is measuring.
MOTION   Steps 2 and 3 are the arithmetic and carry no packet and no Pod, so their beat is a
         static highlight alone (M-27), on the container boxes the operation is taken over plus
         the chip it lands in. That the lit set CHANGES between them is the whole comparison.
         The last step is a down-arrow and its pulse is NOT dim: pulsePodDim fills opacity forward
         to OPACITY.pending and this step ends at full, which reduced.test.mjs reports as five
         OPACITY-INHERITED mismatches on the Pod and its four boxes.
CONTENT  The formula is quoted rather than derived. The sidecar-containers page states that the
         effective init request is the HIGHEST of any resource over all init containers, that a
         resource with no limit anywhere counts as the highest limit, and that the Pod effective
         request is the sum of pod overhead and the HIGHER of the non-init sum and that init
         maximum. It also states that scheduling is done on effective requests, so an init
         container can reserve what it does not use for the life of the Pod, and that the Linux
         Pod cgroup is sized from the same number.
         Pod overhead comes from RuntimeClass.overhead.podFixed and is stable since 1.24.
         The numbers on the card are chosen so the two branches DISAGREE: max 800 against sum 600,
         so the init branch wins and the naive 1700 is wrong twice over.
NAMING   The sidecar box says `always cpu 200m` and not `init cpu 200m`, because its slot is
         the init array and its accounting is the app side, and that split is step 3.
SCOPE    The ordering of init containers is workloads-init-containers-and-sidecars, which owns the
         exit-0 gate and the Started flag. Nothing here plays a start.
         Allocatable and what is left of the Node is cluster-node-allocatable. This card produces
         a number and never compares it to a capacity.
         The cgroup tree and the CFS quota are cluster-pod-cgroup-hierarchy and
         cluster-cpu-throttling. The Kubelet sizing the Pod cgroup is one clause of step 5.
         The QoS class is workloads-pod-qos-classes. The effective tier covers init, sidecar and
         app alike, which is true and is deliberately not drawn: it needs a second comparison.
         No autoscaler appears anywhere, the same clause workloads-pod-resize carries.
```

### poster

```
Two columns on one baseline. The left is four stacked segments at 0.3, heights in the ratio of the
four cpu requests, and it is the naive sum. The right is a single block carrying the house accent
at 0.9 and it is shorter, which is the whole sentence: the number reserved is smaller than the
number added up. The shared baseline is what makes the two heights comparable, and it is the only
reason no label is needed.
No arrowhead and no packet dot: the comparison is the composition (R-08, R-09).
The left stack is the closest form in this section to workloads-pod-image-pull, which is also four
stacked bars. They differ on proportion and on ground: image-pull is four EQUAL bars 180 wide under
a cloud, this is four UNEQUAL segments 100 wide standing on a baseline beside a rival column.
```

---

## workloads-force-deletion

### layout

```
WHAT     A force-delete drops the Pod object without Kubelet acknowledgement, so on a partitioned
         Node the container keeps running beside its replacement.
LAYOUT   B (chips left, ladder right). PANEL_B 280.
           chips  60..540, bottom at 460
           nodes  TWO frames, 60..580 and 620..1140, NODE_H 134, Pods centred on 320 and 880
         NODE_H is 134 rather than 140 to open the 15 unit corridor between the chip column's
         bottom at 460 and the frames.
LANES    ONE trunk serving both frames, which the mirrored Pod centres are what allow: it leaves
         the API box's bottom midpoint (both node-band actions here are control-plane actions
         issued through the API), steps to WL.SPINE_X at y=140, drops to a bus at NODE_Y-15 and
         taps left and right. Both routes use NODE1_LANE / NODE2_LANE, the arrays the wires are
         built from.
         No ball carries a literal points array of its own: such a pair follows no drawn wire, and
         one of them left the content band entirely at x=1198. A lane down x=810 goes through the
         pipeline ladder rows.
CONTENT  Read against the `k8sVersion` the entry carries.
         `status.phase stays Running` on the `stuck` step, against the Pod lifecycle page saying
         `If a node dies or is disconnected from the rest of the cluster, Kubernetes applies a
         policy for setting the phase of all Pods on the lost node to Failed`. The two do not meet,
         because that policy is `podgc` and BOTH of its paths are shut on the state this card draws.
         `gcOrphaned` reaches only Pods bound to a Node that no longer exists, and this Node object
         is still there, unreachable rather than deleted. `gcTerminating` needs two conditions and
         has only one: `!nodeutil.IsNodeReady(node)` holds, and
         `taints.TaintKeyExists(node.Spec.Taints, v1.TaintNodeOutOfService)` does not, because
         nothing has applied `node.kubernetes.io/out-of-service`. `gcUnscheduledTerminating` takes
         only an empty `NodeName`. So `markFailedAndDeletePodWithCondition`, the one writer of
         `newStatus.Phase = v1.PodFailed`, is never reached and the Pod keeps the last phase its
         Kubelet reported.
         The card already names the escape rather than hiding it: `delete the Node object so its
         Pods are garbage-collected cleanly` on the `risk` step IS `gcOrphaned`, stated as the safe
         route. The doc sentence describes what happens once an operator takes that route or taints
         the Node out of service, and this card is the interval BEFORE either.
         The card's own cited task page is the loose one and must not be copied from: it says the
         Pods `enter the Terminating or Unknown state`, which mixes the kubectl display with the
         phase. `Unknown` is rejected as the chip value for the same reason.
```

---

### before `rewind: { opacity: { podOld: OPACITY.terminated, connector: OPACITY.terminated } },`

```
The RISE is the step, so it has to be MOTION: Pod A must not reach OPACITY.notready in the static
block at t=0 while Pod B fades in at 1942, which puts the picture two sentences ahead of the words:
the narration recreates Pod B first and only then says Pod A may still be running. Pod A and its
lane wind back to the shade `force` left and rise at `recreate` + FADE.in, the end of Pod B's own
fade-in, so Pod B is fully on screen before Pod A comes back.

The delay is `plus: FADE.in` rather than a literal: the beat is the end of the fade above it, not a
number. The step closes at 3142 against a duration of 3500.
```

### poster

```
Two Node frames, the left dashed and dimmed to 0.6 with its Pod at 0.5, the right solid, and a
lightning bolt struck between them. The bolt is the force, and it sits BETWEEN the two rather than
on either: the API is what gives up, not the Node and not the Pod.
The left Pod is still drawn, at half strength, because it is exactly the thing that has not gone
away. Deleting it would draw the outcome the card says does NOT happen on its own.
```

---

## workloads-graceful-shutdown

### layout

```
WHAT     The termination sequence from deletionTimestamp through preStop and SIGTERM to the
         grace period expiring.
LAYOUT   C (bottom strip). panel bottom 280.
           ladder 660..1140 at y=140, 6 rows
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row centred
           node   394..528, Pod 20 below its top edge
         A column beside the panel does not fit: the left band is 300..464 = 164 against a 202 chip
         column.
         The ladder is not at 412 with NODE_H 116: the frame's top border then runs 5 units above
         the Pod's, which reads as a rendering slip rather than as a frame.
LANES    TOP2 (the API) midpoint -> WL.SPINE_X at y=140 -> the Pod's top midpoint. The return lane
         is its reverse.
         It leaves the API and not TOP1, kubectl: the termination order is what the API sets in
         motion once it has stamped deletionTimestamp, and on the last step the report climbs back
         to whichever box `lightBoxAt` lights.
         The connector does not end at x=320 inside the Node frame, where it points at blank canvas
         50 units left of the Pod.
MOTION   Leaving from the API rather than from kubectl costs 311ms per ball; both steps that ride
         it have the headroom.
CONTENT  SIGTERM and SIGKILL have DIFFERENT targets. `sigkill` must NOT read "the runtime sends
         SIGKILL, which the kernel delivers unconditionally to PID 1", which is the SIGTERM
         targeting rule applied to the wrong signal. The doc: "When the
         grace period expires, if there is still any container running in the Pod, the kubelet
         triggers forcible shutdown. The container runtime sends SIGKILL to any processes still
         running in any container in the Pod." SIGTERM goes to process 1 of each container, SIGKILL
         to every remaining process in every container, and the difference is practical: a process
         tree whose PID 1 already exited is still reaped. The step reads "to every process still
         running in any container of the Pod, not just to PID 1", which also makes rung 4 (SIGTERM,
         "signal PID 1") the deliberate contrast rather than a repetition.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  SIGTERM is the runtime DEFAULT, not a rule. `sigterm` must NOT read "asks the runtime to
         send SIGTERM to PID 1". The doc: "Many container runtimes respect the STOPSIGNAL value defined in the
         container image and, if different, send the container image configured STOPSIGNAL instead of
         TERM." and "If no stop signal is defined in the image, the default signal of the container
         runtime (SIGTERM for both containerd and CRI-O) would be used to kill the container." The
         step reads "the stop signal to PID 1, SIGTERM unless the image defines a different
         STOPSIGNAL". The ACTOR and the ordering are right as they stand.
         `sigChip` carries the literal value `SIGTERM` and the ladder rung reads "SIGTERM · signal
         PID 1", and both stay. A chip VALUE is width-bound (`P-07`, measured against the box by
         `render/chipfit.test.mjs`) and a rung is bounded by its column, so neither can hold the
         qualifier. SIGTERM is the concrete case this card DRAWS, the narration beside it says it
         is the default rather than the rule, and that is the right division of labour.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  The `desc` says "SIGKILL is the last resort, used only if the container outlives that
         shared timer", and the doc adds "If the preStop hook is still running after the grace
         period expires, the kubelet requests a small, one-off grace period extension of 2
         seconds". The desc stands. "Only if" states a NECESSARY condition, which the extension
         does not falsify: the container still has to outlive the timer. The extension is
         preStop-specific and this card's scenario has preStop completing at step 3, so the card
         never reaches it, and the desc has 27 characters of a hard 470 band to spend on a case it
         does not draw.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
NAMING   The fourth chip is named `kubectl shows`, not `pod status`. Its values are Running,
         Terminating and deleted, and the `delete` step says in words that deletionTimestamp is what
         makes KUBECTL report Terminating "while status.phase itself stays Running", so a chip named
         for the phase and carrying what kubectl prints contradicted its own step (`P-02`).
         storage-pvc-protection already carries a `kubectl shows` chip for the same split.
```

### poster

```
Three Pod frames left to right at 0.05, 0.04 at 0.72 and 0.02 dashed at 0.42, joined by two short
legs, the first solid and the second dashed. One sentence: shutdown is a fade, not a cut.
The two chevrons are the only arrowheads and they carry the passage of the grace period, which the
fill ramp alone would leave ambiguous about direction. The inner container box fades with its frame
so the pair reads as one thing going out.
```

---

## workloads-hooks

### layout

```
WHAT     postStart and preStop running through the CRI, with Kubelet asking and the runtime
         doing the work.
LAYOUT   C (bottom strip), the tightest card in the category. panel bottom 379, deepest in Workloads
         after the pod-* cards.
           ladder 660..1140 at y=140
           chips  full-width strip, THREE per row at 350.67, two rows
           node   394..528, Pod 20 below its top edge
         Nothing fits beside the panel: the left band is 399..464 = 65.
         Chips two per row is three rows, leaving the Node frame 64 units where the Pod alone is
         106. Three per row is 350.67 and the widest value needs 269.
LANES    Spine from TOP2's bottom midpoint to WL.SPINE_X at y=140, ending on the Pod's top
         midpoint rather than on the frame edge.
         The ExecSync ack runs TOP2_X -> TOP1_X + TOP1_W at RESP_Y, which is the drawn return
         arrow.
         The spine leaves TOP2 and not TOP1, Kubelet. Kubelet is a CRI CLIENT and never touches a
         container: the runtime execs the hook and delivers the signal, which all three riding
         steps say in their own wire label (`CRI ExecSync · postStart · Exit 0`, `CRI ExecSync ·
         preStop · Sync`, `CRI StopContainer · SIGTERM · ACK`). Cost 311ms per ball, all three
         have the headroom.
         The ack does not ride `segmentPacket from [580,95] to [540,95]`: both x values sit INSIDE
         the Kubelet box (420..640), so the ball slides across the box instead of down the arrow.
MOTION   Ask, deliver, return, in that order, on all three CRI steps.
CONTENT  Two absolutes the card's own words cancel, both restored rather than deleted.
         On `created` the postStart chip reads `fires with ENTRYPOINT`, not `declared`: the hook
         fires the moment the container is created, concurrently and with no ordering guarantee,
         which the `declared` and `poststart` narrations and rung 3 all say, so leaving the hook
         `declared` while the ENTRYPOINT is `starting (PID 1)` put an order on the race.
         Rung 6 and the grace chip both carry `if alive`, because the escalation is conditional in
         the narration ("If the process is still alive when it reaches 0").
```

### before `const ack = (after) => F.segment({ from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], after });`

```
The ack rides at the spine ball's arrival plus a beat, never before it. Span 3280 against
durations of 3800, 3800 and 4000, measured off `getAnimations()`. Ordering it this way makes the steps
SHORTER, not longer, because the Pod pulse moves earlier.

The ack never goes second. There it reports `ExecSync` complete before the hook has been exec-ed
and `StopContainer` complete before SIGTERM has reached the process: the answer arrives before the
thing it is answering.

The top row never animates alone on `poststart` either. That draws Kubelet asking and the runtime
answering while nothing reaches the container the handler runs inside. It rides the spine like the
other two.
```

### poster

```
A container with a circled dot on each side, joined by dashed legs: two slots, one before and one
after, and the container between them. The symmetry IS the sentence, so both circles are identical
and neither is brightened.
The circles are drawn twice, an outline and a filled core, so they read as sockets rather than as
packets frozen on a wire.
```

---

## workloads-init-containers-and-sidecars

### layout

```
WHAT     Init containers running to completion in order, then a native sidecar starting and
         staying up alongside the app.
LAYOUT   B (chips left, ladder right). PANEL_B 255.
           chips  60..540, 4 x 34 + 3 x 8 = 160
           ladder 660..1140, 5 rows = 200
           node   on the floor, one 828-wide Pod centred in it
         Layout A is out: the 200 ladder against a 275..464 band of 189. Eleven short.
LANES    Spine stepping to WL.SPINE_X at y=140 (clearing the chip column) and landing on the
         Pod's own top midpoint.
MOTION   Three steps share one shape: the runtime reports an exit on the answer lane, the Kubelet
         calls StartContainer back, and the create lands on the node. All three light `runtime` on
         the ARRIVAL of that hop, at 1500ms, and not in the static `lit` list at t=0, so the three
         read alike and the box is a receiver on all three (A-06).
```

### poster

```
Four boxes in one Pod frame at 0.4, 0.6, 0.8 and 1.0, joined by three short connectors whose
opacity ramps with them. The ramp IS the ordering, and it is the only thing on the poster: no
labels, no arrowheads, no Node.
The last box is wider than the other three, which is what separates "the app" from "the three that
ran before it" without needing a different fill.
```

---

## workloads-job-parallelism

### layout

```
WHAT     Three workers running in parallel, one failing and being replaced, until completions
         is reached.
LAYOUT   C (bottom strip). panel bottom 280.
           ladder 660..1140 at y=140
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row centred
           node   three worker Pods, row starting at x=84
         A chip column does not fit: 202 tall against a left band of 164. The widest value needs
         258, so three per row at 350.67 clears it.
         POD_TOP_PAD is 24. At a smaller pad the frame's own NODE-1 label is drawn inside
         worker-1's shell.
LANES    Trunk TOP1 midpoint -> WL.SPINE_X at y=140 -> bus at NODE_Y-12, tapping all three Pods.
         Each step fires one ball per lane through the card-local `fan`. The middle Pod centres
         exactly on WL.SPINE_X, so its lane skips the bus point rather than drawing a zero-length
         segment. `LANES` is built ONCE, one array per worker, and the `P.lane` and the `F.route`
         inside `fan` both index it, so the wire and the ball are the same array (A-02 SHARED). All
         6 routes read it and none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh
         array per call leaves two equal copies free to drift on the first geometry edit.
         Measured: taps 0 and 2 sit 366 units off the spine, so their lanes run 726 units and land
         at 1613ms, tying for last; tap 1 runs the bare 360 units and lands at 800ms. That tie is
         why the counting chip hangs off `create0` rather than off whichever ball arrives last.
MOTION   3500 / 2600 / 3500 / 2200, sized to the routes. The two steps that fire the three creates
         run 3500, the longest ball taking 1613ms on its own lane after the top hop and its beat.
         The two that carry no down-balls at all are shorter:
         `partial` at 2600 over a span of 2060 (see its own note), `complete` at 2200 over a span
         of 900, which is the three exit pulses and nothing else.
```

### before `'1. spec     ·  parallelism=3, completions=5'`

```
CONTENT  `completions` is 5, not 6, and the number is forced by the wave count the card DRAWS.
         Six completions with parallelism 3 and one failure needs SEVEN Pod runs and therefore
         three waves: wave 1 yields 2 successes (unit-3 fails), wave 2 is the unit-3 retry plus
         units 4 and 5 and takes the count to 5, and unit 6 then runs alone. This card draws two
         waves, so it is a five-completion Job and the chip said 6.
CONTENT  What the mismatch cost: `succChip` walked 2 to 6 on `complete`, a delta of FOUR, against
         THREE sublabels reading `done · exit 0`, and `unit-4` was written once on `retry` and
         never resolved because `pod1Box` then read `unit-6 done`. At 5 the delta is 3, one per
         sublabel, and each slot finishes the unit it started: 4, 5 and the unit-3 retry.
         Keeping 6 and stepping the count through `complete` (2 -> 5 on the exit pulses, then a
         create for unit 6, then its exit) is honest but turns the shortest step on the card into
         a three-beat sequence: 2200 -> about 4500, against the span of 900 the MOTION block
         prices `complete` at.
NOTE     The poster's six cells are not a count of completions. It draws done-over-running, which
         is the sentence, and R-02 keeps a poster from being a small diagram.
```

### poster

```
Six identical cells in two rows: the top three carry a tick, the bottom three a progress bar at 0.5.
Completed over running, and the counting is the whole sentence.
Every cell is the same size and fill on purpose. A Job's workers are interchangeable, so making any
one of them distinct would contradict the card.
```

---

## workloads-pod-image-pull

### layout

```
WHAT     Kubelet pulling an image from a registry, through imagePullPolicy and the backoff that
         follows a failure.
LAYOUT   C (bottom strip). panel bottom 379.
           ladder 660..1140 starting at 176
           chips  two across, 532 wide, at y 548 and 590
           actors Kubelet 420..780 centred on CX; Registry narrower at 840..1100
         Chips four across is 258 wide, and "container state" runs into
         "Waiting · ContainerCreating".
         The Registry is the narrow box because the cloud path wraps it. The cloud is one
         hand-drawn path with its own centre at (685, 85), placed by transform at CLOUD_SCALE
         1.05 rather than redrawn. Straddling BOTH actor boxes reads as a rendering fault.
         The ladder starts at 176, not 150, because the scaled cloud reaches y 157.
LANES    From Kubelet's bottom midpoint down the corridor LEFT of the ladder, ending on the Pod at
         y 430 rather than on the Node frame edge above it.
```

### poster

```
A registry cloud with a padlock over a four-layer stack, and two dashed pulls of DIFFERENT lengths
ending in dots of different sizes. The unequal lengths are the point: the two pulls do not fetch the
same amount, because layers already on the Node are skipped.
The layer stack ramps 1.0 down to 0.4 so it reads as depth rather than as four equal things. The
padlock is small and unlabelled: auth is a condition on the pull, not the subject.
```

---

## workloads-pod-phase-machine

### layout

```
WHAT     The Pod phase state machine, Pending through Running to Succeeded or Failed.
LAYOUT   C, and the tightest card in the whole catalog: the panel measures 397 x 504, more than
         three quarters of the canvas height on the left, leaving 136 units full width beneath it.
           ladder 660..1140
           chips  status.phase alone in the left column 60..540 at y 506
           node   546..624; Pod 552..616; container 574..610
         A pipeline at 420..1140 with status.phase as a full-width strip is out: the lane then runs
         straight down through six ladder rows AND through the chip.
         A Node bottom edge at 640 falls on the viewBox edge and does not draw.
         Pod and container are shorter than the family default deliberately. There is no more
         room. A longer narration on any step invalidates that measurement: re-measure.
LANES    Down x = SPINE_X (560), clear of both the ladder and the status chip, ending on the Pod.
CONTENT  Pending is what a WAITING container forces, and one container starting is not enough to
         leave it. `schedule` must NOT read "The status.phase field is still Pending until at least
         one container has started", a necessary condition stated as the whole rule. The doc gives
         Running as "The Pod has been bound to a node, and all of the containers have been created.
         At least one container is still running, or is in the process of starting or restarting",
         and `getPhase` in `pkg/kubelet/kubelet_pods.go` evaluates `case waiting > 0: return
         v1.PodPending` BEFORE `case running > 0 && unknown == 0: return v1.PodRunning`, so on a
         multi-container Pod one container running does not move the phase. The step reads "stays
         Pending while any container is still waiting", 7 characters SHORTER than the sentence it
         must not say, which is the direction the catalog's tightest panel wants. The `desc` and the
         `running` step carry the same reading.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
CONTENT  `capped at 300s` on `crashloop` carries `by default`, for the reason recorded in full on
         workloads-crashloopbackoff: KubeletCrashLoopBackOffMax is beta and on by default at 1.35,
         which makes the ceiling a per-node default. 11 characters, on step 3. The two prose repairs
         on this card sit on steps 1 and 3, and step 5 (`terminal`) is untouched, which matters
         because step 5 at 1100x800 IS the catalog's deepest panel, 503.13 against the 90..504 band
         L-04 records. Do not spend step 5.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `const stage = (podGroup, placed = true) => ({`

```
LANES    The lane ENDS on the Pod, so it carries the Pod's shade rather than a shade of its own
         (A-13), and `stage()` states the pair once. Measured with `effectiveOpacity` at both ends:
         `schedule` 0.55, `crashloop` 0.40, `terminal` 0.12 and `admit` 0.55, each the shade of the
         Pod it lands on, against the 1 a lane holding its own shade would sit at. Kubelet, the
         source end, is 1 on all six steps, so min(source, sink) IS the Pod. The lane takes that
         shade on every step, so the Node frame is the only value `placed` still decides.
         `admit` is the one step where the Pod is not placed, so the frame AROUND it is pinned to
         OPACITY.pending with it. Neither the frame nor the lane stands at 1 there: that step's
         wire label reads `spec.nodeName not set`, so a full-strength pair says the Pod is on
         Node-1 while the words say no Node has it.
         The container sublabel on `admit` reads `no node yet · no container`, which is C-14's
         remedy: a block that does not exist yet dims AND says so. 26 characters at 6.03 units
         each is 157 of the 300 the container box is wide.
MOTION   The lane fades WITH the Pod, same delay, same duration, same easing, on all four steps that
         move the phase, which is what P-04 asks for and why the pair is stated once rather than one
         step at a time. `phaseFade` returns the pair. `fill: both` holds both at `from` through the
         400 delay, so the lane is at 0.39 when the ball lands at 960 on `terminal` and at 0.40 when
         it lands on `crashloop`: visible for the whole flight (A-15), and never brighter than its
         own sink.
         Pinning the lane to the settled shade with no fade is out. The static block runs at t=0, so
         the lane would snap to 0.12 while the Pod is still at 1 and a ball is in the air, which
         inverts the mismatch instead of closing it. Leaving it at 1 and citing A-15 is out too:
         A-15 asks the lane to be VISIBLE under its ball, not to be full strength, and 0.30 at the
         arrival is visible in the rendered frame at 1600x1000 and at 1100x800.
```

### poster

```
A state row on top, Pending to Running to the Succeeded/Failed fork, with Running at 0.20, by far
the brightest thing on the canvas. Below it the Pod it describes, joined by one dashed drop. The
sentence is that a single FIELD tracks the Pod, so the row and the Pod are two views of one thing.
The fork carries a tick and a cross, the only two glyphs, and the failed branch is dashed at 0.55
so the pair reads as one taken outcome and one alternative rather than as two events.
```

---

## workloads-pod-qos-classes

### layout

```
WHAT     Three Pods classified Guaranteed, Burstable and BestEffort, and which two the Kubelet
         evicts under Node pressure.
LAYOUT   C (bottom strip).
           ladder 660..1140
           chips  two across at 548 and 590
           node   404..532, three Pods, row at NODE_Y + 34
PANEL    The swing between the three viewports is the second widest in the catalog, so a reading
         taken at 1600x1000 alone is worthless here: every clearance below is against the 1100x800
         number. All three are printed on demand by
         `OVERLAY_IDS=workloads-pod-qos-classes node --test report/overlay.test.mjs`.
SIZES    The bus at 390 is 11.1 clear of the deepest panel (378.90 on `tiers` at 1100x800) and 40
         clear of the ladder floor. THAT 11.1 IS THE PROSE BUDGET: one more wrapped line on the
         deepest step is 24.85 units and puts the panel through the bus, so a narration here can
         only grow if the bus moves first. Moving the bus costs nothing in time: LANE(i) splits the
         same vertical between trunk and tap, so lengths stay 684 / 318 / 684 at the 0.450 canon.
LANES    Trunk down x = CX to a bus at NODE_Y - 14 = 390, ABOVE the frame, one tap per Pod
         crossing the frame border. One ball per tap, each Pod pulsing on ITS OWN ball landing
         rather than on a single shared arrival: the outer lanes are longer and that is the point.
         The top row carries ONE lane and not the WL.A-01 pair, recorded at ANSWER_Y below.
         The bus stands ABOVE the frame. At NODE_Y + 12 = 416 it falls inside the node() label band
         L-23 measures at NODE_Y+6.8..NODE_Y+21.4: it clears the label horizontally by 117 units
         and still reads as a second frame border, same dash, same hue, 12 units under the real
         one. Above the frame costs 40 units of free band, which only a trimmed narration leaves:
         a panel reaching 403.74 against NODE_Y of 404 is a clearance of 0.26, and the 49.69 units
         the two trimmed narrations are worth are what open the room.
         Lowering the bus INSIDE the frame instead does not work. The band is NODE_Y..POD_Y, 34
         units, and an arrowhead is about 10 to 13 of them, so a bus clear of the label band at 430
         leaves an 8 unit tap that is all head and no shaft. Growing the Node frame to buy the room
         does not work either: the free band is 354.05..624 and the frame plus the chip strip
         already spend 204 of it, with 16 left to the canvas floor at 640.
CONTENT  Claims read against the k8sVersion in `cards.js`.
         The uncapped Pods on `cgroups` are BOTH A AND B, so the sentence names both. Pod B is
         Burstable with requests only, which the classify step says in words ("requests only, no
         limits") and its own sublabel repeats (`req only · 500m / 256Mi`), so naming Pod A alone
         made a true sentence read as a property of BestEffort.
         `tiers` says Pod C is "evicted last, ranked by Priority, if system daemons overrun what
         the Node reserved for them", and its sublabel reads `Guaranteed · evicted last`.
         "is reached only by the kernel OOMKiller" and the sublabel `Guaranteed · survives` are
         both rejected: node-pressure-eviction says "Guaranteed pods and Burstable pods where the
         usage is less than requests are evicted last, based on their Priority", and that where
         system processes overrun their reservation "the kubelet must choose to evict one of these
         pods to preserve node stability ... it will choose to evict pods of lowest Priority
         first". A Guaranteed Pod under its request IS reachable by the kubelet, last in line.
         The sublabels now read `evicted 1st` / `evicted 2nd` / `evicted last`, one scale.
         `schedule` says "The resource fit looks only at requests". "Scheduling looks only at
         requests" is rejected: scheduling also filters on nodeSelector, affinity, taints and
         topology spread, so the absolute is false of scheduling and true only of the resource
         fit, which is the half the step is about.
         `cgroups` carries "with node-critical Pods on -997 whatever their class". Without it
         "BestEffort gets 1000" is an absolute with a live counter-case: `pkg/kubelet/qos/policy.go`
         returns guaranteedOOMScoreAdj for a node-critical Pod before it ever reads the QoS class.
         The Burstable clamp is `3..999`, not `2..999`: the floor is the literal
         `1000 + guaranteedOOMScoreAdj` and guaranteedOOMScoreAdj is -997. Secondary write-ups
         stating a floor of 2 are rejected against that source.
         `classify` keeps "set once at creation and never changes for the rest of the Pod life".
         In-place Pod resize is GA at this release and does NOT weaken it: a resize that would
         land the Pod in a different QoS class is rejected by admission.
         `spec` states the Guaranteed rule without the docs' "both greater than zero" and without
         the Pod-level resources variant. Both are real conditions and neither changes which class
         any of the three drawn Pods gets, and the step is already 322 characters against a wall
         SIZES puts at zero further lines.
BUDGET   `cgroups` and `tiers` are the two steps the reading pace binds, and both are sized from
         BOTH ends, characters out and duration up, which is what puts them at 4000 and 4200. The
         still time on the pair leaves a duration room here where a sentence has none, and SIZES
         above is the hard wall on the sentence. Reading pace per step, still time and the rank
         against the catalog are printed by `card-review/tools/timing.mjs` and `deadair.mjs`.
NAMING   No drawn string names the Scheduler, because no box is the Scheduler. The chip and the
         ladder row said "scheduler" while the actor row holds Kubelet and API only, which sent
         the reader hunting for a third box. The narration keeps the impersonal "Scheduling looks
         only at requests", which names a process rather than pointing at a block.
         Drawing the Scheduler as a third actor box to earn the word back does not fit. Kubelet is
         pinned at 420..780 by WL.L-07 because the trunk leaves its face midpoint, which leaves
         840..1140 for the rest: split with the house 60 gap that is two boxes of 120, against an
         API sublabel `admission · qosClass · binding` that measures 184 wide on its own.
```

### before `const ALL_PENDING = { pod1: OPACITY.pending, pod2: OPACITY.pending, pod3: OPACITY.pending, ...wiring(OPACITY.pending) };`

```
LANES    The three Pods rest at OPACITY.pending on `idle`, `spec` and `classify` and only reach 1
         on `schedule`, each on the arrival of its OWN fan ball. They do not sit at 1 from the
         poster on, three frames before the step that places them: `schedule` would then fan three
         balls into an outcome already drawn. C-06 is the shade for declared and not working yet,
         which is exactly an object with no spec.nodeName.
         The wiring (trunk, bus, the three taps) is pinned WITH the Pod row, in `wiring`, because
         a tap is as faint as the Pod it points at (A-13). With the Pods dimmed and the taps left
         at 1 the three arrowheads were the brightest thing in the Node band, pointing into
         nothing that had arrived. Measured on the rendered frame at both viewports.
         Drawing the three Pods OUTSIDE the Node frame until they are bound has no band to go in:
         layout C puts the deepest panel bottom at 354.05, the frame at 404..532 and the chip strip
         at 548..624, so the free height between panel and floor is 269.95, the frame plus strip
         spend 204 of it, and the 66 that are left are the bus corridor. Born at 0 and revealed on
         `schedule` fails on the other side: `classify` writes all three qosClass values onto the
         Pod inner boxes and pulses all three Pods, so hidden Pods leave that step drawing nothing
         at all. C-14 also forbids cutting an absent block, and these are not absent: they are in
         etcd, which is what ladder row 0 says.
MOTION   `classify` pulses with `dim: true`. A 900ms brightness pulse on a Pod sitting at 0.55 is
         not seen without the opacity lift `pulsePodDim` adds (M-07).
```

### before `const EVICTED = {`

```
LANES    QoS eviction: BestEffort and Burstable (A, B) are evicted and dim together by the same
         amount, Guaranteed (C) survives at full opacity. The final state is pinned inline for
         cancel-safety.
         tap1 and tap2 sink WITH their Pods, to OPACITY.terminating, because a lane is as faint as
         the Pod it points at (A-13). Each is pinned at 1 in the static block and only fades at
         its own ball arrival, so A-15 still holds and the lane is lit for the whole flight.
         The trunk and the bus stay at 1: they still feed tap3, and C survives.
         Neither tap is held at 1 to the end of the step. The balls land at 1520 and 2327 and fade
         200ms later, so the last 1700ms of such a hold draws two full-strength arrowheads into two
         ghosts at 0.25, which is the same defect the ALL_PENDING note above records for the
         unplaced Pods.
MOTION   No chip carries a cue on this step. The three qosClass values are unchanged since
         `classify`, so lighting one would cue a change that did not happen (P-09a), and lighting
         Pod A alone while the narration evicts both A and B is worse than lighting neither (P-04).
         The order is carried by the sublabels and the focus chip.
```

### poster

```
Three Pods with a resources bar each: none, one bar, two matched bars, over a baseline whose weight
ramps dashed to 2px. The bars ARE the R-07 house accent, a currentColor rect inside the block it
belongs to, and the baseline carries the ranking, so the order is unmistakable at 200px.
A third ramp, a row of dots under the baseline, was cut: it said what the baseline already said,
and it pushed the poster to 6 currentColor fills against a lint ceiling of 3 measured over the
shipped set. With it gone the accent is an accent again and the primitive count drops 12 to 9.
The class names are not written. The whole idea is that the class is DERIVED from what the Pod asked
for, so drawing the request and letting the ranking follow is the poster stating the mechanism.
```

---

## workloads-pod-resize

### layout

```
COLOUR   Eleven parts carry role: 'cluster': kubectl, the API, the Kubelet, both verdict boxes, the
         two top arrows, both spine legs and the two verdict relations. The kit binds role
         'workloads', so a card here writes a role ONLY to draw the control plane acting on a Pod,
         and all 19 siblings do it (3 to 10 sites each). Without them this was the only workloads
         card painting its actors in the category blue, which render/palette.test.mjs caught as a
         30th category+class+role+state combination: no workloads card had ever drawn a
         workloads-role arrow. The Pod, the Node frame and the chip strip stay workloads blue.
         The two VERDICT boxes are the one judgement call. They are Pod status conditions, which
         argues workloads, and they are the Kubelet's own output drawn in the Kubelet's band, which
         argues cluster. Taken as cluster, with the band winning over the field.
WHAT     CPU and memory changed on a Pod that stays up: the patch through the resize subresource,
         the Kubelet allocating it or raising PodResizePending, and the new limit landing on the
         container that never stopped running.
LAYOUT   Three tiers on one spine at x=600, plus the chip strip. The API is centred on CX so both
         legs of the write are straight drops, Api.bottom to Kubelet.top and Kubelet.bottom to the
         Node frame, which puts kubectl to its RIGHT and reverses the top row. That is the same
         trade cluster-static-pods makes and it is made here for the same reason: kubectl on the
         left leaves the API at 708..940, and the drop into the frame then needs a jog to reach the
         frame top face midpoint at 600.
         The two verdict boxes hang off the Kubelet right face and fill the 840..1140 band that the
         spine leaves empty in the middle tier. That band is LAYOUT.C.ladder, where a C card usually
         puts its pipeline, and the branch takes it instead: the decision with three outcomes is what
         this card is about, and a ladder would restate the six narrations a second time in the one
         place the picture has to argue something.
         WL.L-02 asks for an actor row centred on CX and this row is not: API 484..716 and kubectl
         772..1004 centre on 744. The reversal above is the reason and it is deliberate. The half of
         WL.L-02 that binds is the left edge, and 484 clears the 420 floor by 64. WL.L-07 holds
         exactly: the box the trunk leaves is the API, and it is centred on WL.SPINE_X.
         A six-row ladder in the 660..1140 middle band, which is what LAYOUT.C puts there, would
         fit: six narrated steps need six rows, 242 units at WL.ROW_H 32 and WL.ROW_GAP 10, against
         a band between the top row at 120 and the frame at 394 of 274, so 16 units stand at each
         end. It is declined because the verdict pair needs the same band and says something the
         narration cannot: that the Kubelet decision has three outcomes and only one of them
         continues down the spine.
SIZES    Node frame 134 / 106 / 20 (NODE_H / POD_H / POD_Y - NODE_Y), taken from
         workloads-graceful-shutdown, which is the only workloads frame built around a 106 tall Pod.
         There is no catalog-wide family (L-23) and the cluster 152 / 106 / 34 the card was born on
         does not travel, so NODE_Y is 394 rather than 380: that is what keeps the Pod on the
         414..520 band the panel budget, both spine legs and the actuate label were measured
         against, and it moves only the frame around it. Frame 394..528, Pod 414..520, so 20 of
         label padding above and 8 of floor below.
         The Pod is 420 wide against the 460 of workloads-graceful-shutdown, and its inner container
         box is 280 x 64 centred on CX, so the two pods-lifecycle cards on this frame family do not
         draw the same shell.
         The verdict pair is 300 x 64 right-aligned on CONTENT_R, level with the right chip column
         and the frame edge. It straddles KUBE_CY at 186..250 and 266..330, which is what lets both
         relations leave one face at the mirrored offsets L-12 reads as a deliberate pair.
         Four chips across the bottom strip at 258 units each do not hold their values. The longest
         is `cpu NotRequired · memory RestartContainer`, 41 characters at the 6.89 units per
         character `.scheme-chip-text` rate, so 282.5 units of value alone against a 258 unit chip.
         Two across at 532 is LAYOUT.C.strip.two, and CHIPS_Y is the literal 548 that
         workloads-pod-qos-classes, workloads-restart-policy, workloads-pod-image-pull and
         workloads-pvc-stickiness all carry, so the second row ends on the 624 canvas floor.
LANES    Five, and only three of them ever carry a ball. The top pair straddles the row centre by
         LANE_DY, the patch out at y=68 and the answer back at y=92. The spine is two P.lane drops
         on CX, each carrying a ball on the one step that narrates it, and the lower one stops on
         the FRAME rather than on the Pod shell: it is addressed to the Node.
         The two verdicts are P.relation and NOT lanes. Nothing rides them on any step, so under
         A-05 they take no arrowhead, and A-06 is what decides it: no step names anything travelling
         to Deferred or to Infeasible, because a condition is raised in place and does not arrive.
MOTION   Two deferred turnovers. `patch` holds the spec chip at the old reading for the flight of
         the write and turns it over on arrival, because the desired value does not exist until the
         PATCH lands. `apply` holds the status chip, the condition chip and the cgroup sublabel
         together until the actuation lands: pinning them at entry puts cpu.max 80000 100000 on a
         container the same frame still calls unresized. `admit` is the third, and it lifts the
         verdict pair from OPACITY.notready to full on the watch arrival rather than at entry, so
         the branch appears when the Kubelet has something to decide about.
         `policy` registers no animation at all. It is a spec field being read, so nothing travels
         and nothing pulses, and M-27 names that the shape such a step takes.
WIRE LABELS
         Four slots. `top` sits at 744 above the row, because the spine owns everything under it.
         `spec` and `branch` share ONE row at y=173, anchored start at 612 and at 840. They are two
         labels rather than one only because the longest `spec` string ends short of 840: measured
         at 1100x800 it runs 612..771.5, so 68.5 units stand between them and the slot is capped at
         about 37 characters.
         `actuate` is anchored start at 612 at y=354, which is NOT the midpoint of the 298..394 gap.
         Its string measures 343.6 units and runs 612..955.6, overlapping the Infeasible box in x,
         and at the midpoint 346 the glyph box opens 1 unit under that box. It is derived off the
         box instead, INF_Y + BR_H + 24, which leaves 24 units under the verdicts and 40 above the
         frame.
         The `spec` slot takes no longer string: past about 37 characters it closes that 68.5 unit
         gap and the two stop reading as separate labels on one row.
CONTENT  Verified against the resize task page, which carries the whole mechanism. In-place resize
         is `FEATURE STATE: Kubernetes v1.35 [stable] (enabled by default)`, which is the k8sVersion
         this catalogue is dated to, so the card states it as stable rather than as a gate.
         `--subresource resize` needs a kubectl client of v1.32.0 or later, which the page notes
         twice, and older clients report `invalid subresource`. The two limitations the card spends
         characters on are the page verbatim: `Only CPU and memory resources can be resized` and
         `Resource requests and limits cannot be entirely removed once set`.
         The condition pair is the page's own vocabulary. PodResizePending is what the Kubelet
         raises when it `cannot immediately grant the request`, with `Infeasible` for a resize that
         is `impossible on the current node` and `Deferred` for one that `might become feasible
         later`. PodResizeInProgress is the other half: `the Kubelet has accepted the resize and
         allocated resources, but the changes are still being applied`, which is why the `apply`
         narration opens on the allocation and not on the patch.
         The retry order is the page's list, in its order: higher PriorityClass first, then
         Guaranteed before Burstable at equal Priority, then longest in Deferred. The card carries
         all three because dropping the tail leaves the first clause reading as the whole rule.
CONTENT  `UpdateContainerResources` is a real CRI rpc and is not invented for the wire label. It is
         declared in cri-api `pkg/apis/runtime/v1/api.proto` as
           // UpdateContainerResources updates ContainerConfig of the container synchronously.
           rpc UpdateContainerResources(UpdateContainerResourcesRequest) returns (...)
         and the Kubelet reaches it from `doPodResizeAction` through `updateContainerResources` in
         `pkg/kubelet/kuberuntime/kuberuntime_manager.go`, which is the in-place path and not the
         create path. The RUNTIME is what touches the cgroup, which is why the narration says the
         Kubelet drives it rather than that the Kubelet writes the file.
CONTENT  The card plays a CPU-only resize, and that is a choice the picture forces. resizePolicy on
         this Pod is `cpu NotRequired · memory RestartContainer`, and the page says a change to both
         resources at once restarts the container, so a patch moving cpu AND memory would make the
         `apply` step narrate a restart while its own wire label claims the limit was rewritten on
         the live container. With cpu alone the two agree: cpu.max moves from 70000 100000 to
         80000 100000, restartCount stays 0, and the memory half of the policy is stated in words on
         the `policy` step, which is where it belongs.
         The cpu.max arithmetic is the sibling card's, not restated here: a 800m limit against the
         default 100ms period is 80000 100000, the same spelling cluster-cpu-throttling uses.
CONTENT  The QoS clause is the pod-qos page verbatim: `The QoS class is determined when the Pod is
         created and remains unchanged for the lifetime of the Pod. If you later attempt an in-place
         resize that would result in a different QoS class, the resize is rejected by admission.`
         That is why the `qos` step refuses the patch AT THE API and not at the Kubelet, and it is a
         different refusal from Infeasible, which is a Kubelet verdict on a resize that was admitted.
         The step says so, or the card would draw two rejections that look like one.
CONTENT  UNVERIFIED, and nothing on the card asserts it: the HTTP status and error shape an
         admission refusal of a QoS-changing resize returns. The pages say `rejected by admission`
         and stop, so the wire label says `resize refused at admission` and names no code.
CONTENT  `allocatedResources` stays off the chips. The page marks
         `status.containerStatuses[*].allocatedResources` Advanced and says to focus on
         `status.containerStatuses[*].resources` for monitoring and validation, and a fifth chip
         would need a third strip row, which ends at 666 on a 640 canvas.
         The `resources` field is not "fixed" to read immutable on the strength of the Pod v1
         reference saying `Compute Resources required by this container. Cannot be updated.` That
         line is stale against the resize subresource, and the task page is the authority the card
         follows: the same reference documents `resizePolicy` and the two conditions on the same
         page.
BUDGET   The panel reaches y<=279.51 at 1100x800, on `apply` at 353 characters, against a frame top
         at 394, so 114.49 units stand clear. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-pod-resize node --test report/overlay.test.mjs`.
         The bottom is QUANTIZED by the line height, so it steps rather than slides: 353 characters
         reads 279.51 while 352 read 254.66, one whole line for one character. Budget in lines, not
         in characters, and re-measure after ANY prose edit. The ceiling is roughly 490 characters,
         which is four more lines, and it is a property of the FRAME at 394 rather than of the
         current text. The frame moved down 14 units with the category change and that buys no
         extra line, because a line is 24.85.
NAMING   The two resource chips carry their FULL field paths, `spec.containers[].resources` and
         `status.containerStatuses[].resources`, and not a short form. They are the desired and the
         actual, and the gap between them for three steps is the card. A short name on either half
         breaks the symmetry that lets the pair be read against each other in one glance, and both
         fit: the longer name measures 248 units against a 532 unit chip whose longest value is
         141.1.
         The `admit` step shows PodResizePending while `apply` two steps later resizes the container
         successfully. That is a counterfactual on the canvas, and T-35 is why the `branch` slot
         carries `if the Kubelet cannot allocate it now` above the pair: the caption is what signs
         the alternative, and `apply` opens with `Once the Kubelet allocates it` so the two steps
         join rather than contradict.
SCOPE    Six things this card names and deliberately leaves to a sibling.
         The QoS CLASS is a constraint here and one line of it, never a derivation:
         `workloads-pod-qos-classes` owns which requests and limits produce which class.
         The CFS quota, the period, throttling and cpu.stat are `cluster-cpu-throttling`. cpu.max
         appears here as ONE reading on the container box that moves when the resize lands, so the
         reader sees the change reach the kernel, and no step explains what a quota does.
         The OOM killer is `cluster-oom-kill`. The best-effort clause on lowering a memory limit is
         stated in words on the `apply` step and NO kill is drawn: the page says the resize is
         skipped, which is the opposite of a kill, and drawing one would contradict the sibling.
         Capacity and Allocatable arithmetic is `cluster-node-allocatable`. Infeasible names the
         Node not fitting the request and stops there.
         The container restart machinery is `workloads-container-states` and
         `workloads-restart-policy`. RestartContainer is named as a policy value and the card never
         plays a restart.
         The container RUNTIME is named by the `apply` step and drawn by neither that step nor any
         other, which breaks T-21 on purpose. A runtime block would need a fourth box in a middle
         tier already holding the Kubelet and both verdicts, and the CRI stack is
         `cluster-pod-sandbox-cri`, which draws it. The rpc name carries the fact instead.
SCOPE    No autoscaler appears anywhere on this card. This catalogue covers upstream core and has no
         VPA, HPA, Cluster Autoscaler or KEDA card, so a resize here is something a human or a
         controller outside the picture asked for, and the card never says who.
```

### poster

```
Sentence: the numbers on a running container change without the container being replaced.

Ghost zone to solid zone, taken deliberately because the sentence is a THEN and a NOW rather than a
structure. No other workloads poster is on that family. Left of a dashed vertical rule at x=160 the
old way: two 96 x 48 Pod outlines at fill 0.03, dashed, stroke opacity 0.5, staggered 20 units
apart and separated by 32 units of nothing at y 74..106. Two shells with a gap between them is
delete-and-recreate, and the gap is the window in which the workload does not exist. Right of the
rule ONE 114 x 128 solid Pod at fill 0.08 on stroke-width 2, carrying the single 0.9 accent bar:
one Pod, one container, and only the number moved. The accent bar is 82 wide against the 60 of the
faint bars in the ghosts, because the resize this card plays raises cpu from 700m to 800m.

STAYS DISTINCT FROM its pods-lifecycle neighbours, read on the actual-size and 3x montage against
workloads-pod-phase-machine, workloads-container-states, workloads-crashloopbackoff and
workloads-graceful-shutdown rather than on the source. The nearest of the four is
workloads-container-states, which pairs a solid box with a dashed one the same way: it is two WIDE
landscape boxes stacked and joined by a vertical tie, with rules inside them and an X. The
silhouette separates them. Here the solid block is PORTRAIT, 114 x 128 against two landscape
96 x 48 ghosts, so it holds 2.8 times the area of one ghost and 1.4 times the area of both, the
left half of the canvas has nothing spanning the vertical band that the right half fills, and the
only line on the canvas is a full-height vertical rule, which no other workloads poster carries.
workloads-graceful-shutdown also ends on a dashed shell, but it is a ROW of three boxes of equal
size joined by arrows, and nothing on this poster points at anything.

Ghost bars sit at 0.16 rather than the 0.3 R-07 names for a loser, the same reading
cluster-static-pods gives its mirrored block, because a 0.3 bar inside an outline held at 0.5 is
brighter than the outline that contains it. They earn their place rather than decorate: at 200px a
bare dashed rectangle is a box, and a box with a faint bar in it is the same Pod the solid block is.

REJECTED, both for R-05 and both horizontal-bar compositions. One container block with an old dim
bar overrun by a new bright one, and two stacked spec-versus-status tracks: either would sit in this
grid beside workloads-container-states, two stacked tracks with rules in them, and read as a second
variation on one idea. Neither says the thing this card is for, which
is not that a number grew but that no second Pod was needed to grow it.
```

---

## workloads-pod-startup-conditions

### layout

```
WHAT     The five lifecycle conditions a Pod climbs before it is Ready, who writes each one, and
         what status.phase does while they climb.
LAYOUT   Instrument panel, and NOT the A / B / C column preset this category defaults to. The
         subject is one readout that climbs, so the canvas is four stacked bands read top to
         bottom rather than two columns read left to right:
           actors     40..120, Kubelet 420..780 centred on CX, API 840..1140
           readings   160..236, two chips in the RIGHT column 660..1140 only
           Node       300..900 by 270..428, Pod 370..830 at 302..410
           staircase  440..572, five treads of 216 x 44 stepping 216 right and 22 up
           phase rail 592..626 full width, split once at 708
         THE BAND ORDER IS FORCED and not chosen. The corridor from the Kubelet has to reach the
         Pod down the 540..660 column (WL.L-07) and the staircase spans the full width, so a
         staircase above the Pod would be crossed by that lane (L-10). The Node band is therefore
         the first thing under the panel and the instrument is on the floor, which is the reverse
         of the other six cards in this section.
         TWO chips and not four. status.phase is the rail and the next condition still False is the
         position on the staircase, so both left the chip column: a value drawn as an instrument
         and restated in a chip is two elements saying one thing. What is left is the two readings
         no instrument carries, and they sit under the API box that owns them.
         Their band is the only use L-03 allows for the height above the panel bottom: the full
         height is free right of x=420, the corridor owns 540..660, so a block there is either the
         right column or nothing. 160..236 centres the pair in the 120..270 gap.
         The Node frame is 600 wide and NOT the WL.L-02 full width. It holds one Pod and no second
         object, so the full width drew 310 units of empty band either side of it; 70 either side
         of the Pod is the padding the frame actually needs. The cost is a CENTRE reading of 720
         against the 600 +-40 band, taken with the staircase and the rail dropped as chips (L-17).
         Its top midpoint is 600, which is what lets the corridor land on the frame face (L-11).
         The treads TOUCH at their vertical edges and rise half their own height, so the profile
         is a stair. Gaps would make it a row of five boxes at five different heights.
         The rail splits at 708, which is TREAD_X(3) and not a number of its own, so the boundary
         between Pending and Running stands under the tread whose container start moves it.
         The A / B / C preset is out. As five conditions in a P.chain in the left column, four
         chips in the right and the Node on the floor it measures green on every rule and shares
         its composition SIGNATURE with four of the seven cards in this section (box2 pod1 node1
         chip4 chain1 raw0, bands 40/496/518), so a reader with the narration covered cannot tell
         it from workloads-container-env-injection. Two things it cannot say either: setChainActive
         lights ONE row, so the climb never accumulates on screen, and status.phase is one chip
         among four rather than the second track the whole card is about.
         A `spec.readinessGates` block feeding the last tread as a visible second input has nowhere
         to stand. Every place it fits is inside the Node frame or under the rail, and a lane to it
         from the API crosses the whole Node band. The conjunction is that tread's second line.
SIZES    A tread is 216 x 44, and 216 is WL.W / 5, so the staircase spans L..R exactly and the
         content bbox centres on CX by construction.
         Measured at 1100x800: the longest first line is 153.4 (PodReadyToStartContainers) and the
         longest second line 177.9 (kube-scheduler · nodeName set, and kubelet · AND
         readinessGates), so the tightest cell keeps 19 units either side.
         The two baselines are box()'s own optical centres, h/2 - 3.22 and h/2 + 12.78: a two-line
         cell has the problem box() already measured over every height from 38.75 to 81.38.
         The chips are the category column 660..1140 at WL.CHIP_H, 34 with an 8 gap, so the pair
         stands 40 clear of the actor row and 34 clear of the Node frame.
         The Pod is 108 tall because pod() fixes BOTH its text baselines: the label at 16 and the
         sublabel at h - 8, so the only way to buy air around the inner box is the shell height.
         Measured at 1100x800 with the inner box 300 x 48 at 332..380: the label ink is
         305.7..321.7 and the sublabel ink 392.2..404.5, so the box stands 10.3 under the label
         and 12.2 over the sublabel. At POD_H 96 those two gaps were 10.3 and 4.2.
         The 3.7 over the label ink and the 5.5 under the sublabel ink are pod() itself and are
         the same on every card in the catalog.
PANEL    The deepest reading is step 0 at 1100x800, x<=396.55 by y<=254.66. The Node frame starts
         at 270, so 15.34 units stand clear of it, and 396.55 ties the catalog-wide L-02 worst and
         stands 0.45 off the 397 ceiling. So any prose edit on this card is re-measured rather than
         reasoned about, and what prints the extent per viewport is
         `OVERLAY_IDS=workloads-pod-startup-conditions node --test report/overlay.test.mjs`.
LANES    Down the corridor at WL.SPINE_X from the Kubelet bottom midpoint to the NODE frame top
         midpoint at 270. SPINE_UP is its reverse, so the Kubelet action and the Pod report cannot
         drift apart. Length 150, which is UNDER the PKT_DUR_MIN floor, so a route costs 700ms
         rather than the 333 its length alone would buy.
         A lane between the actor row and the Node band ends on the FRAME face, in both
         directions, never on the Pod inside it: the endpoint on POD_Y that 20 workloads cards
         still carry is the retired form. It is also why the frame is centred on WL.SPINE_X, since
         a face midpoint is what L-11 asks for.
         Top row: REQ_Y carries the status PATCH out to the API, RESP_Y carries the watch event
         back to the Kubelet (WL.A-01). Both ride, so both are arrows and neither is a relation.
         Nothing rides into the staircase or the rail. They are a readout of what the top row
         wrote, and a lane into either would claim the Kubelet talks to its own instrument.
         The last step carries the corridor in its resting DOWN direction and no ball rides it,
         because the only traffic that step names is the top-row PATCH. Pointing it up would aim
         an arrowhead at the Kubelet on the one step nothing travels to the Kubelet.
MOTION   Step 1 is the only self-initiated send from the API and waits BEAT.lead.
         Step 2 is a down-arrow: the ball lands, THEN the Pod blinks and lifts (M-16).
         Steps 3 and 4 are up-arrows: the Pod blinks first and the report leaves at
         BEAT.afterPulse (M-15), and step 4 hangs its fade one beat behind the blink (M-08).
         Two opacity lifts and both are events: notready to pending when the sandbox exists,
         pending to full when every container is ready.
         The staircase fills as a PREFIX and never as one lit rung: climb(n) holds every tread
         already taken at full weight and the rest at OPACITY.notready, so a reader landing on
         step 3 can see two rungs behind it and two ahead. Only the tread this step flips is lit.
         The rail is lit on step 4 ALONE, the one step of the climb that moves status.phase. A
         segment lit on every step would say the opposite of the card.
         `dim: true` is declared on step 3 ALONE, which is the one pulse with no F.fade beside
         it. A fade carrying `fill: both` composites over the whole delay window and is created
         after the pulse, so on steps 2 and 4 the opacity half of pulsePodDim never renders: the
         brightness half still fires, so the blink survives, and the exemplar reserves `dim` the
         same way (workloads-probes: dim on its two fade-free steps, plain pulse on its three).
         Spans measure 2060 / 2060 / 2860 / 2860 / 2400 against durations 2400 / 2600 / 3100 /
         3200 / 3000. The corridor is 150 units and every route on it sits on the PKT_DUR_MIN
         floor, so moving it again changes no span until it passes 315 units.
         The Pod pulse on the last step hangs off the PATCH arrival, which lands on the API at
         the top of the canvas while the Pod sits on the floor. The beat is the Pod's own state
         change and not an arrival at the Pod, so the only ring on screen is the API's.
CONTENT  PodReadyToStartContainersCondition is Alpha 1.28, Beta and on by default 1.29 through
         1.36, Stable 1.37, read off the feature-gates reference. The card is pinned at 1.35, so
         the narration says beta and on by default and names 1.37 as the lock, never stable now.
         The order PodScheduled, PodReadyToStartContainers, Initialized, ContainersReady, Ready is
         the page order, and the page states two facts the card turns on: the Kubelet starts
         pulling images only after PodReadyToStartContainers is True, and Initialized is True
         BEFORE sandbox creation on a Pod that declares no init container.
NAMING   A tread's second line is a READING and not a field: it names who writes that condition
         and what makes it flip, so P-02 holds without it claiming to be API. The writer is the
         identifier form (`kubelet`, `kube-scheduler`) because System A calls a sublabel body text
         (T-09). The last tread states a rule rather than an event, because Ready is a conjunction.
SCOPE    The container runtime and the CNI plugin are named by the sandbox step and drawn by
         neither it nor any other, which breaks T-21 on purpose. The CRI stack is
         cluster-pod-sandbox-cri and the plumbing is network-cni-invocation, and both draw it in
         full. The room argument is NOT the binding one and is not made here: the actor row has
         no third slot under WL.L-02 and WL.L-07, and since the frame narrowed to 600 the bands
         either side of the Pod are 70 wide, which fits nothing. The cession is what decides it
         and the room argument no longer even contradicts it.
         The Scheduler is named by the first step and drawn as the sender of the watch event
         rather than as an actor of its own, which nine other workloads cards also do.
         status.phase is one rail and one line here, never a derivation:
         workloads-pod-phase-machine owns the phase machine and already states that phase is
         deliberately coarse. This card is the detail that sentence promises.
         The EndpointSlice mechanism is network-endpointslice-reconcile. The Pod IP joining is one
         chip value on the last step and no controller is drawn.
         Probe semantics are workloads-probes. readinessProbe is named once, as the thing that
         makes a container ready, and no probe period or threshold appears.
```

### poster

```
Five treads climbing left to right, the first four filled on a ramp and each carrying the house
accent bar, the fifth drawn dashed and empty. The rise plus the ramp carry the direction, so there
is no arrowhead (R-08), and the one tread that differs in FORM rather than in brightness is the
sentence: the climb has a position and the last rung is not taken.
The three siblings in this section are already a three-block comparison (qos), a stack of four
horizontal layer bars (image-pull) and a row of four boxes (init-containers), so a five-row list
would collide with the second of them. It would also be a literal copy of this card's own left
column, which R-10 refuses.
The brightest accent sits on tread FOUR and not on tread five, because five is about the absence
of a fill and giving it the winner bar would say the opposite of the poster.
```

---

## workloads-pod-startup-failures

### layout

```
WHAT     The five values the STATUS column takes before Running, and which component is still
         holding the Pod at each of them.
LAYOUT   B. PANEL_B 255, the short column under the panel and the tall one in the free band.
           chips  left  60..540 (LAYOUT.B.chips), 4 x 34, gap 8 -> 275..435
           ladder right 660..1140 (LAYOUT.B.ladder), 5 rows -> 150..350
           node   full width, 496..624, Pod 370..830 at 518..614
PANEL    The deepest reading is step 5 at 1100x800, 254.66, and the chip column starts at 275, so
         20 units stand clear. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-pod-startup-failures node --test report/overlay.test.mjs`.
LANES    A-10, and it is the reason this card has two lanes rather than one. TWO actors reach the
         same Pod, so both are drawn over a SHARED DROP at WL.SPINE_X rather than one of them
         being chosen: the Scheduler drops straight from its bottom midpoint, and the Kubelet
         jogs left along DROP_Y 140 and joins the same column. Below 140 the two coincide, which
         is what the rule intends and is not a duplicate lane.
         DROP_Y is 140 and the ladder starts at 150, so the jog clears the first rung by 10.
         The top row is a RELATION and not the WL.A-01 pair: the Scheduler and the Kubelet never
         talk to each other on this card, and nothing rides it, so it carries no arrowhead (A-05).
MOTION   Step 1 has no packet and no Pod, so its beat is a static highlight alone (M-27): the
         Scheduler lights because it is the answer to the step, not because anything arrives.
         Steps 2, 4 and 5 are down-arrows on the Kubelet lane, step 3 is the one up-arrow, the
         Pod reporting a failure, and it blinks first at BEAT.afterPulse (M-15).
         Step 5 pulses WITHOUT dim, because pulsePodDim fills opacity forward to OPACITY.pending
         and that step ends at full.
         Step 3 measured a 3111ms span against a 3000ms duration, so the duration is 3300 and the
         motion is untouched (M-19).
CONTENT  Every value on this card is taken from the status table on the debug-init-containers
         page: Init:N/M is M init containers with N completed, Init:Error is one that failed to
         execute, Init:CrashLoopBackOff is one that failed repeatedly, Pending is a Pod that has
         not begun executing init containers, and PodInitializing is one that has finished them.
         Three values that a first draft carried were CUT because no upstream page owns them:
         InvalidImageName, ErrImageNeverPull and CreateContainerConfigError. The images page does
         not name the first two and nothing names the third, and a card built on recalled strings
         is exactly what T-26 refuses.
NAMING   The fourth chip is `who is holding it` and it is the thesis: the other three chips are
         the literal kubectl row, and this one is what the row is FOR.
SCOPE    ImagePullBackOff is workloads-pod-image-pull and is deliberately not a rung here, even
         though it belongs to the same column: that card owns the pull and its backoff.
         The restart backoff itself is workloads-crashloopbackoff. Step 3 names it in one clause
         and plays no doubling.
         The readiness half is workloads-pod-startup-conditions, and the last step hands off to it
         by name rather than teaching it: READY at 0/1 against a finished STATUS is that card.
         Pod phase is workloads-pod-phase-machine. This card reads the kubectl STATUS column,
         which is not status.phase, and the two differ on exactly the Init: values.
```

### poster

```
Two frames of one size, the left EMPTY and dim at 0.5, the right holding one token, and no wire
between them. The token is a small rounded block with the house accent inside it at 0.9, so the
brightest thing on the poster is the Pod being held rather than either frame.
It shares the two-frame composition with workloads-container-env-injection in this same section,
which was known when the form was chosen. Three things separate them at 200px: that poster fills
BOTH frames with three value bars each, this one leaves the left frame empty; that one is joined
by a dashed wire with a break, this one has no connector at all; that one compares two copies of
the same thing, this one shows one object in one of two places.
```

---

## workloads-probes

### layout

```
WHAT     startupProbe, readinessProbe and livenessProbe against one container, and what each
         failure does to the EndpointSlice.
LAYOUT   A, and THE WORKLOADS EXEMPLAR. New workloads cards copy this shape.
         PANEL_B 255, both columns starting on one line at BAND_Y = PANEL_B + 21 = 276.
           ladder left  60..540 (LAYOUT.A.ladder)
           chips  right 660..1140 (LAYOUT.A.chips), 5 x 34, gap 8
           node   full width, 496..624
         The ladder is not in the RIGHT column with the chips as a five-across bottom strip: at
         205 wide three chip names overlap their values ("EndpointSlice" against
         "10.244.1.5 ready=false" by 60 units), and the whole left band under the panel is left
         empty.
LANES    Down the corridor between the two columns at WL.SPINE_X, ending on the Pod top midpoint
         at y 518, not on the Node frame edge. SPINE_UP is its reverse, so the report hop and the
         probe hop cannot drift apart.
```

### poster

```
Three dashed legs into one container, and the three circles at their far ends are empty, half filled
and solid. Three probes, one target, and the fill ramp is the only difference between them.
They are deliberately NOT labelled and NOT ordered top to bottom by importance: the card is about
three independent questions on their own periods, so a numbered stack would be the wrong sentence.
```

---

## workloads-pvc-stickiness

### layout

```
WHAT     A StatefulSet Pod rescheduled to another Node, keeping its identity and its PVC, with
         the same disk detached and reattached.
LAYOUT   C (bottom strip), and the card with the worst chip damage in the catalog (11 collisions
         before the relayout). panel bottom 330.
           ladder 660..1140
           chips  two across at 548 and 590
           nodes  TWO frames narrowed to 440 each, 60..500 and 700..1140
           PV     in the GAP BETWEEN THE FRAMES, centred on CX at 530..670 x 412..512
         The PV is not in the top row, where it overlaps the Api box outright (850..990 against
         700..920). Between the frames it is also what the card is about, one disk moving between
         Nodes.
LANES    Control: one trunk from TOP2_CX with a jog into the corridor at y=140, a bus SPLIT into a
         left and a right half so each can be hidden with its own tap, and one tap per Node
         landing on that Node's Pod.
         Storage: PV_LANE from the PV's right face to web-0 on Node-2, and PV_MOUNT_A mirroring it
         on the left as the mount web-0 already holds on Node-1. No ball rides PV_MOUNT_A, so it
         carries no arrowhead.
         The trunk leaves TOP2_CX and not TOP1_CX: both the eviction and the binding are API writes
         taking effect on a Node, and the StatefulSet only ever POSTs to the API on the top row.
         The storage lane is its own array and not NODE2_LANE reversed, which would be a control
         route wearing the storage colour.
         No ball carries a literal points array: one such pair ran out to x=1198, off the content
         band entirely, matching no wire on the card.
         The `lanes` helper pins each lane to 0 while the Pod it addresses is not on that Node,
         per the project rule that an absent block dims but its lanes disappear. Without it the
         CSI lane claims the volume is attached to Node-2 on the idle step, contradicting the
         narration.
MOTION   `evict` 2700, `bind` 3200, sized for the trunk leaving TOP2.
```

### before `const lanes = (toA, toB, alive = false) => ({`

```
LANES    `nodeA` is pinned here, not per step, because it CHANGES: Node-1 is at 1 on the idle frame
         and at OPACITY.notready from `evict` on. It has to appear in all five opacity maps: absent
         from them it never leaves full strength, while `pvChip` reads `on lost Node-1` on three
         steps and `reattach` calls that Node unreachable. The card's own POSTER draws the left Node
         at 0.5, dashed, with an X across its Pod, so a Node at full strength contradicts it.
         `alive` defaults to FALSE, which is the reading that keeps this file honest: the Node is
         lost on four of the five steps, so the exception is the idle frame and only it passes the
         flag. It is also what keeps `evict`s opacity line byte-identical to the anchor below it.
         The shade is notready and not OPACITY.terminating. The Node object is not deleted on any
         step of this card, and `reattach` says the volume is force-detached BECAUSE the Node is
         unreachable, which is notready: alive but not serving and not observed (C-07).
```

### before `chain: 0,`

```
Row 0 (`1. running`) is the steady state the idle frame draws, so the poster lights it and the four
narrated steps take rows 1 to 4. The card opens on `chain: 0`. DO NOT open it on `chain: -1` and
then jump to row 1: that leaves row 0 lit by no step at all, five rows against four steps that walk
them.

Both conventions exist in this category and neither is wrong on its own. Eight cards open on
`chain: 0` (their step 0 IS the first state) and nine open on `chain: -1` (their step 1 takes row
0). What is not allowed is mixing them. S-09 is untouched either way:
its machine half asserts step 0 carries no narration, no flow, no motion and no rewind.
```

### poster

```
Two Node frames with the disk drawn BETWEEN them rather than inside either, the left Node crossed
out and dimmed, the right one solid with a filled Pod. The disk sitting outside both frames is the
whole sentence: it belongs to the Pod identity, not to a machine.
The lane to the dead Node is dimmed to 0.4 and the lane to the live one carries the chevron. That
asymmetry is the only direction on the poster, and it is what says the volume FOLLOWED.
```

---

## workloads-replicaset

### layout

```
WHAT     A ReplicaSet self-healing a lost Pod, adopting an orphan, and losing one to an
         ownerReference change.
LAYOUT   B (chips left, ladder right), the columns SWAPPED because the panel reaches 305.
           chips  left  60..540 from y 325, 4 values
           ladder right 660..1140 from y 150, 6 rows
           node   full width, 500..624, FOUR slots
         Pods are 78 high rather than the family 106. The six-row ladder and the chip column both
         have to clear the panel, and 78 is what is left.
LANES    Trunk from the ReplicaSet box's bottom midpoint (420..780, centred on CX) down between
         the columns, a bus at NODE_Y + 12, and one tap per slot. Four slots means four different
         addressees across the story: self-heal targets web-b2, adopt / converge / orphan all
         target web-d4, and the ownership step addresses all three live Pods with one ball each.
```

### before `F.fade({ target: 'pod4', from: 0, to: OPACITY.notready, dur: FADE.in, delay: 0, fill: 'both', easing: 'ease-out' }),`

```
ADOPTION IS A CHANGE OF OWNER, NOT A BIRTH, and the step is two beats because of it. The orphan
appears on its own at OPACITY.notready with the sublabel `owner: none`, which is the shade for
alive but outside this path and the text the idle frame already carries. Only then does the RS see
a selector match, PATCH the ownerReference, and the ball land: the Pod rises to 1 and its sublabel
turns over to `adopted · owner: rs` on the same beat.

The rewind winds pod4 back to 0 and its sublabel back to `owner: none`, and the fade runs
0 -> OPACITY.notready at delay 0. DO NOT rewind pod4 to 0 and fade it 0 -> 1 at 2622: that is byte
for byte the grammar `self-heal` uses for a genuine CREATE, over a narration whose third sentence
reads `The Pod was already running, adoption only restamps its owner`.

The PATCH waits FADE.in + BEAT.afterHop, the same idiom `self-heal` uses to put a node-band
event before the control-plane reaction it causes. The RS cannot match a selector against a Pod
that is not on screen yet. That two-beat shape is what puts the duration at 4400 rather than 3700:
the orphan appears at 600, the PATCH lands at 1400, the ball at 3322 and its pulse closes at 4222.

The bus tail and tap3 do not wind back with the Pod. LANE(3) runs along both, so the ball would
fly its last two legs over blank canvas.
```

### poster

```
A ReplicaSet on top owns three Pods below through ownerReference links (dashed). The
third Pod is dashed and faint: it just died and is being recreated, the controller
self-healing the count back to three.
```

---

## workloads-restart-policy

### layout

```
WHAT     restartPolicy Always, OnFailure and Never against the same exit, enforced in place by
         the Kubelet.
LAYOUT   C (bottom strip). panel bottom 355.
           ladder 660..1140
           chips  two across at 548 and 590
           actors Kubelet FIRST at 420..780 centred on CX, Api second
         Kubelet comes first because it is the node-facing actor and the line down to the Node has
         to leave a box midpoint inside the corridor. With the two swapped, `bounce()` would send
         its first hop OUT of the Api while its own comment has Kubelet watching the Api and the
         spec hopping back.
         Chips four across is 258 wide, and five strings collide, including "Pod B · OnFailure"
         against "Waiting (backoff)".
LANES    None down to the Node. restartPolicy is enforced in place and every packet is a top-row
         hop, so the vertical line is a RELATIONSHIP: it lands on the Node frame's top midpoint
         and carries NO ARROWHEAD, per the rule that a wire with no ball must not wear one.
CONTENT  Rung 1 reads `Pod-level default Always, container may override`, not `all containers`. The
         policy step cancels the absolute twice in its own narration: it covers every main container
         "that does not set its own", and since 1.35 ContainerRestartRules lets an individual
         container carry a restartPolicy that overrides the Pod one.
CONTENT  The first restart is IMMEDIATE and only the ones after it back off. Two sites must NOT say
         otherwise: the `desc` must not end "every restart still waits out the same backoff", and the
         `backoff` step must not open "Every restart, whether driven by Always or by OnFailure, goes
         through the same exponential backoff". Both are false for restart one. The doc: "Initial
         crash: Kubernetes attempts an immediate restart based on the Pod restartPolicy. Repeated
         crashes: After the initial crash Kubernetes applies an exponential backoff delay for
         subsequent restarts." The `desc` ends "the shared backoff only starts after the first
         restart" and the step opens "The first restart is immediate, and every restart after it
         ... waits out the same exponential backoff". Rung 4 and the sibling
         workloads-crashloopbackoff `aria-label` carry the same reading, so either wrong sentence
         contradicts both.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  An init container does not override the Pod value BY BEING an init container. The `policy`
         step must NOT gloss the override as "the native sidecar pattern, on by default since 1.29
         and GA in 1.33", which hangs the SidecarContainers version history on a capability wider
         than it. The doc: "The restartPolicy for a Pod applies to app containers in the Pod and to
         regular init containers." and "Sidecar containers ignore the Pod-level restartPolicy
         field: in Kubernetes, a sidecar is defined as an entry inside initContainers that has its
         container-level restartPolicy set to Always." Under ContainerRestartRules, 1.35 beta and
         on by default, a REGULAR init container may carry Never or OnFailure, and the doc's own
         worked example is a Pod with restartPolicy Always whose init container carries Never. The
         regular init container rides the sentence that already says what the Pod value covers
         ("every main and regular init container that does not set its own"), and the sidecar keeps a
         sentence of its own with its own dates.
CONTENT  `capped at 300s` carries `by default`. KubeletCrashLoopBackOffMax is beta and enabled by
         default at this card's declared 1.35, which makes the ceiling a per-node default rather
         than a constant: "you can reconfigure the maximum delay between container start retries
         from the default of 300s (5 minutes). This configuration is set per node using kubelet
         configuration." Nothing there was false, so the repair is two words and no more.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
BUDGET   Folding it in rather than adding a sixth sentence is a PANEL decision, and it was measured
         by OPENING THE FRAME at 1100x800, not by a rule. A first repair ran this step to 597
         characters and the `Node-1` frame label came back 32% covered, struck through by the panel
         bottom. Nothing reports that: OCCLUDED scores occluded AREA and a 4 unit strip off a 140
         unit frame is under its bar, and `npm run report` only prints the card extent, which stayed
         inside the 90..504 band the whole time. The shipped form is 567 characters, 7 UNDER the 574
         the step carried before this repair, and the frame label is clear. Treat 574 as the ceiling
         for this step and re-open the frame after any prose edit, because one line here is about a
         quarter of the gap to the Node frame.
         Two probes disagree on the absolute number by roughly 20 units at the same nominal
         viewport: a browser driven by hand read this step at 398.1 before and 375.0 after, where
         `npm run report` puts the whole card at 378.90 before and 354.05 after. Both agree on the
         SIGN and on the one line of difference, which is what the decision turned on. Prefer
         `npm run report` for a recorded number, and the opened frame for a verdict.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### poster

```
Three identical Pods, and only their exit differs: a solid loop with an arrowhead, a dashed loop
with an arrowhead, and a straight 3px terminator. Always, OnFailure, Never, said with three
different marks and no words.
The two arrowheads are earned because a loop with no head does not say which way it goes, and the
difference between the two loops is the DASH, which is the conditional.
```


---

## workloads-rolling-update

### layout

```
WHAT     A Deployment rolling v1 to v2 under maxSurge=1 and maxUnavailable, one surge and one
         drain per cycle.
LAYOUT   A. PANEL_B 205, the shallowest in the category, so both columns fit under it.
           ladder left  60..540 from BAND_Y 226
           chips  right 660..1140 from the same line
           node   full width, 490..624, FOUR slots at 4 x 234, centres 201 / 467 / 733 / 999
           actor  Deployment 420..780, centred on CX
         FOUR slots and not three. maxSurge=1 means the rollout is transiently one Pod ABOVE
         .spec.replicas, which the surge step says in words and counts in its chip as "4 Pods
         alive", so three slots make the drawing contradict the card's own subject.
         The fourth slot is where the surge lands; each drain then frees a slot the next v2 takes,
         and the row ends with its LEFTMOST slot empty because the surge capacity is given back.
LANES    Trunk leaving the API at 990 and stepping into the corridor. No slot centre lands on CX,
         so EVERY tap is a jog and none collapses to a straight drop.
MOTION   A cycle is TWO events, a surge and a drain, which is what takes second-cycle to 6200 and
         third-cycle to 6800.
WIRE LABELS
         The wire label sits above the actor row. At TOP_BOTTOM + 26, below it, it overlaps the
         first ladder row.
NAMING   Pods are named web-a1..web-d4 rather than by ordinal. An ordinal implies an age order the
         drawing never establishes, while the narration says the controller picks the oldest.
```


### before `F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),`

```
MOTION   `surge` drew the fourth Pod in the static block at t=0 and landed its create ball on it at
         3400: measured with the spec timeline, patch arrives 700, the route leaves at 800 and lands
         at 3400, so the create stood 3400ms ahead of its own motion. The Pod now winds back to 0 and
         rises over FADE.in on the arrival, pulse on the same beat. Span stays 4300 of 4500, so no
         duration moved (A-11, M-19).
         Two chips move with it, and only for the reason the sibling card records as NOT needed:
         `progressChip` reads `surged +1 · 4 Pods alive`, which is false while three Pods are
         drawn, and `v2Chip` goes `0 / 0` to `0 / 1`. They take DIFFERENT beats, because they are
         different facts: RS-v2 wants one replica when the scale PATCH lands (700, which is what the
         wire label of this step says), and four Pods are alive when the fourth is on screen (3400).
         Both are bound, never one of them: both are named in `lit`, so binding one promotes its
         neighbour into FORM-E of the chip-beat rule (P-04) and `unit/chip-beat-e.test.mjs` goes
         red. That is the same trap the three counters of `probe-and-drain` are bound against.
         The `slots()` sublabel needs no beat. `pod4Box` reads `v2.0 · starting` from t=0, but it is
         INSIDE the Pod group, so it is invisible for exactly as long as the Pod is.
```

### before `chain: [2, 3],`

```
The ladder ran ONE OFF the steps that walk it. Six rows against six narrated steps looks like a
1:1 map and is not: `probe-and-drain` does rows 2 AND 3 (`The new Pod becomes Ready` then `maxUnavailable
=1 allows scaling RS-v1 from 3 down to 2`), and both remaining cycles are row 4, `repeat`. It used
to set 2 for the pair, 3 for the second cycle and 4 for the third, so the draining step lit `probe`,
the step opening `Same dance again` lit `drain`, and row 4 was never reached at all.

The map now is: spec 0, surge 1, probe-and-drain [2, 3], second-cycle 4, third-cycle 4, converged 5.
Every row is lit by at least one step and no step lights a row it does not narrate. A list is what
`chain` takes for exactly this: a step that is genuinely two rungs.
```

### before `chips: { v1Chip: '3 / 3', v2Chip: '0 / 1', progressChip: 'surged +1 · 4 Pods alive' },`

```
THE COUNT HAS TO MATCH THE ROW. `probe-and-drain` stated `3 Pods alive` at t=0 while its own rewind
held FOUR Pods at opacity 1.0 for 2860ms, and `v1Chip` read `2 / 2` over three live v1 Pods. The
same shape ran on the second cycle (2160ms) and the third (2700ms), where the surge really does put
four Pods on screen mid-step: that is maxSurge=1, the card's own subject, and the chip denied it.

All three counters now wind back to what the previous step settled and step through the cycle on
the beats that earn them:
  probe-and-drain  v2Chip 0/1 -> 1/1 at BEAT.afterPulse (the probe passing is what unlocks the
                   scale-down), then v1Chip 3/3 -> 2/2 and the rollout chip on the drain arrival.
  second, third    v2Chip and the rollout chip take `4 Pods alive` on the CREATE arrival and settle
                   back to three on the DRAIN arrival, so the surge is on screen exactly while it
                   is true.

All three are bound and never a subset of them. `v2Chip` is named in `lit` on all three steps, so
binding its neighbours alone promotes it into FORM-E of the chip-beat rule (P-04), which
`unit/chip-beat-e.test.mjs` fails on. With all three bound the gate is green.
```

### poster

```
Two columns of three, the accent bars ramping 1.0 / 0.7 / 0.4 on the left and the exact mirror on
the right, with one dashed leg and a chevron between them. The mirrored ramp IS the rollout: the
same three slots, the weight moved from top to bottom.
Nothing is added and nothing is removed between the two columns, which is what says a rolling update
replaces in place rather than building a second set beside the first.
```

---

## workloads-statefulset-ordered-startup

### layout

```
WHAT     Ordinals 0, 1 and 2 created in order, each waiting on the previous becoming Ready, and
         registering with the headless Service.
LAYOUT   A. PANEL_B 255.
           ladder left  60..540 from BAND_Y 276
           chips  right 660..1140 from the same line
           node   full width, 496..624, three ordinal slots
           actors StatefulSet 420..780 centred on CX; headless Service hanging UNDER the Api at
                  840..1140 x 152..232, joined by a vertical arrow between the face midpoints,
                  its wire label below it
         The Service is not in the actor row: at 840..1060 against an Api at 700..920 the two
         boxes overlap by 80 units, and so do their wire labels.
LANES    Trunk, a bus at NODE_Y + 12, one tap per ordinal. `ordinals` pins each tap to the SAME
         opacity as the Pod it lands on and splits the bus at the centre slot (busL with ordinal
         0, busR with ordinal 2), so no lane points into a slot whose Pod does not exist yet: on
         idle all three ordinals are 0 and the Node frame is empty. A step turns its own tap on at
         entry, and the ball that rides it is what materializes that Pod.
```

### poster

```
Three Pods each over its own disk, ramping 0.10 / 0.06 / 0.03 with the third dashed, and two
chevrons between them. Ordinal 0 is ready, 1 is coming up, 2 has not started: the ramp is the
ordering and the chevrons are what stop it reading as three states of one Pod.
The whole group is mirrored with a scale(-1,1) so the READY end sits on the right, against the
narration panel's corner rather than under it.
```
