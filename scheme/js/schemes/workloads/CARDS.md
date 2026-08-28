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

## workloads-container-states

### layout

```
WHAT     Kubelet writes containerStatuses[]; the card reads state, lastState and restartCount
         off one container to show which field holds the cause of death.
LAYOUT   B (chips left, ladder right). PANEL_B 230.
           chips  60..540, 4 x 34 + 3 x 8 = 160 tall
           ladder 660..1140, 6 rows
           node   full width, NODE_H 140 on the canvas floor 624
LANES    One spine at WL.SPINE_X into the Pod's TOP MIDPOINT. The Pod is centred in the frame,
         so the spine reaches it rather than stopping on the frame edge above it.
WHY NOT  Layout A: the six-row ladder is 6*32 + 5*10 = 242 and the left band under the panel is
         250..464 = 214. Twenty-eight short.
NOTE     CENTRE passes without a full-width bottom strip because chainList rows carry
         .scheme-chip, so the strip the rule measures is chips + ladder = 60..1140.
```

### before `id: 'read',`

```
read, exitcodes and describe are the three mute steps of this card, 6700ms in which the picture
does not move and nothing animates, which is what M-27 asks of a packet-less pod-less step. The
actor of all three is a value chip (state, lastState, restartCount), and a value chip is lit rather
than flashed (M-26). No block on the card is the subject of any of the three sentences.

WHY NOT the Kubelet box. It wrote the record on crash and on restart and does nothing on these
three, which is why none of them lists it in lit. Flashing it three times running would say it
acts, on the only steps where it does not.
WHY NOT podGroup on describe. A brightness flash on the Pod reuses this card's own sign for the
container changing state (crash and restart both pulse it) on a step where nothing changed.

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
LANES    Spine from the top row to POD_Y.
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
DO NOT   End the spine on the Node frame's top edge. It sits 22 units above the Pod and reads as
         a lane pointing at a frame rather than at a container.
DO NOT   Centre the lower wire label on WL.SPINE_X. The lane strikes it through on every step
         that sets it. It hangs off the side, anchor start at SPINE_X + 14.
NOT A DEFECT
         The `desc` still says "a 5 minute ceiling" flat and rung 5 still says "delay clamped at the
         300s ceiling". Both were left as they are, deliberately. Neither is FALSE: 300s is the
         default and the only value a default cluster ever uses. The desc sits at 433 of a hard
         400..470 band with three sentences already carrying more load than a version-scoped
         qualifier is worth, and a rung is bounded by its column. The nuance belongs on the one step
         whose whole subject is the ceiling, and `cap` carries it.
NOT A DEFECT
         The 10s base, the doubling, the 300s value, the 10 minute reset and the immediate first
         restart in the `aria-label` were all re-read against the raw doc and are verbatim it. Do
         not "correct" any of them.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `id: 'doubling',`

```
Kubelet only waits between attempts, nothing travels and the Pod is untouched.
The climbing backoff shows via the ladder filling and the static chip highlight
(no chip pulse).
```

### before `const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];`

```
The DOWN lane carries no ball on `backoff-named`, `doubling` and `cap`, and that absence IS the
content: those are the steps where Kubelet is HOLDING THE RESTART OFF, which each narration says
in words, and the restart it is holding is exactly what would travel down. The crash goes UP and
is animated on `first-crash` and `reset`.

DO NOT add a down-ball to close an "arrowhead nobody rides" finding. It would assert the restart
happened on the step whose subject is that it has not. The other lane in the catalog whose
emptiness is the lesson is `W_RET_WIPE` on storage-reclaim-policy.
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
LANES    Trunk from the CronJob box at TOP1_CX straight down (no jog, there is no left column to
         clear) into a bus at NODE_Y-8, tapping only the two Job slots that ever receive a create.
         `LANES` is built ONCE, one array per tapped slot, and the `P.lane` and every `F.route`
         index it, so the wire and the ball are the same array (A-02 SHARED). All 3 routes read it
         and none is carried. Do not rebuild it as a `LANE(i)` factory: a fresh array per call
         leaves the lane and the ball two equal copies, free to drift on the first geometry edit.
WHY NOT  Either column beside the panel: the left band is 350..464 = 114, against a 242 ladder
         and a 202 chip column.
WHY NOT  Chips two per row, which the WL brief prefers: 5 chips is then three rows (118 tall) and
         leaves the Node frame 64 units where the Pod alone is 106. Three per row is 350.67, the
         floor, and the widest value here needs 304.
WHY NOT  Ticks at x=830: they run straight through the pipeline ladder.
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
NOTE     POD_PAD is 80, not the family 24. With the frame at 404 a pad of 24 draws the first Job
         slot over the frame's own NODE-1 label. The row still centres on CX by construction.
NOT A DEFECT
         "refuses to schedule" past 100 misses stays exactly as written, and the two words are load
         bearing. kubernetes.io says the controller "does not start the Job and logs the error", and
         the controller read on six branches from release-1.24 to master emits a TooManyMissedTimes
         Event and creates the Job anyway. So the DOCS PAGE is the stale party here, and which of the
         two a card follows is a product decision, not a defect to close. The C2 repair above was
         written so it changes the framing of that clause and not its claim.
         https://kubernetes.io/docs/concepts/workloads/controllers/cron-jobs/
```

### before `P.tag({ x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, text: 'schedule ticks · every 5 min' })`

```
The caption is centred over the tick strip by derivation (TICK_X + TICK_SPAN / 2), never by a
literal, so it follows if the strip moves.
```

### before `const ticks = (...lit) => lit.map(i => TICK_KEYS[i]);`

```
Light the schedule ticks at which a Job actually fired (cumulative). Ticks skipped by
concurrencyPolicy or missed during downtime stay dark, so the gaps in the ladder are real.
Newly-lit ticks auto-pulse via the Timeline delta, drawing the eye to the fresh run.
```

### before `id: 'forbid',`

```
No connector packet: nothing reaches the node because creation is skipped.
The tick is skipped in place, nothing travels: the policy consulted and the
recorded event show via the static highlight only (no chip pulse).

The beat is the static highlight on the CronJob box (M-27): the step registers no animation at all.
The controller is what reads concurrencyPolicy and decides to skip, so it is the actor of the
sentence. The policy chip is the value that decision is about and is lit beside it (M-26).
```

### before `id: 'missed',`

```
No connector packet: the missed tick produces no Job.
Nothing is created for the missed tick: the recorded miss shows via the
static highlight only (no chip pulse).

The beat is the static highlight on the CronJob box: on recovery the controller is the thing
weighing every missed start against startingDeadlineSeconds. Not the 12:25 rung, which stays dark on
purpose and would read as the tick firing if it lit, and not the event chip (M-26).
```

### before `id: 'suspend',`

```
The beat is the static highlight on the CronJob box, which is both the object spec.suspend is set on
and the actor that stops creating Jobs. The frame is otherwise all but identical to the step before
it, and the wire label is what separates them.
The same block as forbid and missed on purpose: all three mute steps are one controller deciding
not to create, and a different block per step would claim three different actors.
DO NOT put F.flash back on any of the three. It animates filter brightness 1 to 1.55 to 1 on the
block group, which M-04 calls a pulse and M-01 forbids on infrastructure, and its 600ms equals the
whole span of each step, so no still frame can tell it from the highlight it replaced.
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
LANES    Trunk from TOP1's bottom midpoint, stepping to WL.SPINE_X at y=140, into a bus at
         NODE_Y-24 with ONE TAP PER POD. Each step routes its ball down the tap of the Pod that
         actually reacts, and the create step fires three, one per matching Node. `LANES` is built
         ONCE, one array per Pod, and the `P.lane` and every `F.route` index it, so the drawn wire
         and the ball are the same array (A-02 SHARED). All 6 routes read it and none is carried.
         Do not rebuild it as a `LANE(i)` factory: a fresh array per call leaves the lane and the
         ball two equal copies, which come apart on the first geometry edit.
         A lane into a Node not in the cluster is pinned to 0: lane 3 until Node-4 joins, lane 1
         once Node-2 leaves.
WHY NOT  Layout A: the five-row ladder is 200 against a 214 band, which fits, but leaves about 14
         units between the ladder's bottom and the Node row for the bus. The mirror leaves 74.
WHY NOT  One lane for the card: it lands on Node-1's top edge on EVERY step, including the step
         that adds a Pod to Node-4 and the step that deletes the Pod on Node-2.
WHY NOT  A straight trunk at x=530: it cuts through the chip column 60..540.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
One node at a time: the update travels controller -> Api -> Node-1 down the
dashed connector, and only when it arrives does Node-1 react. pod1 pulses as its
Pod is recreated on the new version, while the rest keep serving. Mirrors the
surge step of workloads-rolling-update (ball first, pulse on arrival).
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
the step. The `chips:` block states `0`, which is the entry state the DO NOT below demands, and the
`3` is written by the `F.set` inside each create. `flow` runs on the ANIMATED path only, so a
reduced replay of this step ends with both counters still reading 0. Chip text is not one of the
four axes `render/reduced.test.mjs` compares (only WIRE-TEXT is), so nothing in the suite sees it.

The visible sequence is 0, 2, 3 and NOT 0, 1, 2, 3. Two of the three taps sit 138 units off the
spine against the third's 414, so those two land in the same millisecond and the `1` is overwritten
in the instant it is written. In full: 594 units of lane arrive at 1320ms twice over, 870 units at
1933ms once. That was equally true of the accumulator this replaced, which hid it.
The rank each landing writes is a literal, and NOTHING in the suite can see it: swapping two ranks
leaves every check green. Opening the mid-count frame is the only guard there is.

DO NOT read either counter from step entry. The step says the controller sees three matching Nodes
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
LANES    ONE lane, because only the surging Pod ever receives a ball: trunk from TOP1's bottom
         midpoint, step to WL.SPINE_X at y=140 to clear the chip column, bus at NODE_Y-24, tap
         into web-d4 at centre 999.
MOTION   Steps 1, 2 and 4 run 3700 / 2900 / 3700, sized to the four-slot route.
WHY NOT  Layout A: the 242 ladder does not fit the 250..464 band; the 160 chip column does.
WHY NOT  Three slots. Every step pins RS-v1 at 3 / 3 and the wedged step says RS-v1 keeps ALL
         THREE v1.0 Pods serving, so the three v1 Pods must be drawn at once. With three slots the
         broken v2 stands in one of their places and the row shows two survivors against a chip
         saying three. The fourth slot carries the whole v2 story alone: it appears on the
         rollout, crash-loops, wedges, and is DELETED by the undo rather than converted back into
         a v1, which is what the undo step narrates.
DO NOT   Draw taps into the other slots. An arrowhead on a lane no ball rides is forbidden by the
         canon.
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
MOTION   `bad` and `undo` fade the lane on the SAME beat as the Pod, same duration and easing (800
         and 2700, FADE.out), and both rewind it so it is on screen for the whole flight (A-15). Both
         spans stay 1500 and 3600 against durations 2900 and 3700, so no duration moved.
WHY NOT  Keeping the lane at 1 on `stable` and `restored` so the two halves of the picture stay
         joined. On both steps the fourth slot is EMPTY, so the lane ends in blank canvas inside the
         Node frame, which is the case A-14 calls a rendering fault rather than a dim relationship.
         The frames at 1600x1000 and 1100x800 read better without it: three v1 Pods and no dangling
         arrowhead, and the trunk arriving with the surge is a beat the card did not have.
NOT A DEFECT
         The lane IS at 1 for the 2700ms of `rollout` before web-d4 appears, pointing at an empty
         slot. It is carrying the create ball over that whole window, and A-15 outranks A-14 while a
         ball is in flight. `workloads-replicaset` step `converge` is the same trade, taken the same
         way: its rewind brings the bus tail and tap3 back for the flight that deletes the Pod.
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

WHY NOT a return lane. Mirroring SPINE at the card's lane delta means moving the shared endpoint on
web-d4's top face to make the pair L-12 allows, which retimes the `rollout` and `undo` routes as
well (A-11), and it would draw traffic the step says never leaves.
```

### before `'aria-label': 'Deployment rollback and revision history: a bad rollout stalls past progressDeadl`

```
The aria-label ends on RS-v2 going to zero rather than on RS-v1 coming back up, because RS-v1 is
never scaled below three on this card: its chip reads `3 / 3` on all six steps, chain row 5 says
`RS-v2 to 0, RS-v1 kept`, and two steps are spent establishing that maxUnavailable kept the old
Pods serving.

DO NOT write `scales the previous ReplicaSet back up` here. It describes a rollback this card
deliberately does not draw, and no tool compares an aria-label with the steps underneath it.
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
LANES    ONE trunk serving both frames, which the mirrored Pod centres are what allow: it leaves
         the API box's bottom midpoint (both node-band actions here are control-plane actions
         issued through the API), steps to WL.SPINE_X at y=140, drops to a bus at NODE_Y-15 and
         taps left and right. Both routes use NODE1_LANE / NODE2_LANE, the arrays the wires are
         built from.
NOTE     NODE_H is 134 rather than 140 to open the 15 unit corridor between the chip column's
         bottom at 460 and the frames.
DO NOT   Give a packet its own literal points array. The previous pair followed no drawn wire and
         one of them left the content band entirely at x=1198.
DO NOT   Run a lane down x=810: it goes through the pipeline ladder rows.
CONTENT  Read against the `k8sVersion` the entry carries.
NOT A DEFECT
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

NOTE `plus: FADE.in` rather than a literal. The beat is the end of the fade above it, not a number.
The step closes at 3142 against a duration of 3500.
```

### before `opacity: podPair(OPACITY.notready, 1),`

```
The risk step holds Pod A at OPACITY.notready, the vocabulary entry for alive but not serving and
not observed, and the RISE to it is the step: the previous step drew the object dropped from ETCD,
this one puts the process back on screen next to the replacement that now shares its identity.

This is the only card in the catalog where a Pod comes back UP the vocabulary. Deliberate, not a
missed fade.

DO NOT lower it to OPACITY.terminated, the shade for gone. Its own chips read 'maybe still running'
and 'identity live twice', and terminated draws the API server's belief instead of the card's
subject.
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
LANES    TOP2 (the API) midpoint -> WL.SPINE_X at y=140 -> the Pod's top midpoint. The return lane
         is its reverse.
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
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
NAMING   The fourth chip is named `kubectl shows`, not `pod status`. Its values are Running,
         Terminating and deleted, and the `delete` step says in words that deletionTimestamp is what
         makes KUBECTL report Terminating "while status.phase itself stays Running", so a chip named
         for the phase and carrying what kubectl prints contradicted its own step (`P-02`).
         storage-pvc-protection already carries a `kubectl shows` chip for the same split.
WHY NOT  A column beside the panel: the left band is 300..464 = 164 against a 202 chip column.
WHY NOT  Leaving from TOP1, kubectl. The termination order is what the API sets in motion once it
         has stamped deletionTimestamp, and on the last step the report climbs back to whichever
         box `lightBoxAt` lights.
WHY NOT  The ladder at 412 with NODE_H 116: the frame's top border then runs 5 units above the
         Pod's, which reads as a rendering slip rather than as a frame.
DO NOT   End the connector at x=320 inside the Node frame. It points at blank canvas 50 units
         left of the Pod.
NOT A DEFECT
         `sigChip` still carries the literal value `SIGTERM`, and the ladder rung still reads
         "SIGTERM · signal PID 1". Both stay. A chip VALUE is width-bound (`P-07`, measured against
         the box by `render/chipfit.test.mjs`) and a rung is bounded by its column, so neither can
         hold the qualifier. SIGTERM is the concrete case this card DRAWS, the narration beside it
         says it is the default rather than the rule, and that is the right division of labour.
NOT A DEFECT
         The `desc` says "SIGKILL is the last resort, used only if the container outlives that shared
         timer", and the doc adds "If the preStop hook is still running after the grace period
         expires, the kubelet requests a small, one-off grace period extension of 2 seconds". The
         desc was left alone. "Only if" states a NECESSARY condition, which the extension does not
         falsify: the container still has to outlive the timer. The extension is preStop-specific and
         this card's scenario has preStop completing at step 3, so the card never reaches it, and the
         desc has 27 characters of a hard 470 band to spend on a case it does not draw.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
OPEN     Layout C leaves the left band above the Node frame empty at wide viewports. Unavoidable
         while the narration panel is not clamped in CSS.
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
LANES    Spine from TOP2's bottom midpoint to WL.SPINE_X at y=140, ending on the Pod's top
         midpoint rather than on the frame edge.
         The ExecSync ack runs TOP2_X -> TOP1_X + TOP1_W at RESP_Y, which is the drawn return
         arrow.
MOTION   Ask, deliver, return, in that order, on all three CRI steps.
CONTENT  Two absolutes the card's own words cancel, both restored rather than deleted.
         On `created` the postStart chip reads `fires with ENTRYPOINT`, not `declared`: the hook
         fires the moment the container is created, concurrently and with no ordering guarantee,
         which the `declared` and `poststart` narrations and rung 3 all say, so leaving the hook
         `declared` while the ENTRYPOINT is `starting (PID 1)` put an order on the race.
         Rung 6 and the grace chip both carry `if alive`, because the escalation is conditional in
         the narration ("If the process is still alive when it reaches 0").
WHY NOT  Anything beside the panel: the left band is 399..464 = 65.
WHY NOT  Chips two per row: three rows, leaving the Node frame 64 units where the Pod alone is
         106. Three per row is 350.67 and the widest value needs 269.
WHY NOT  The spine leaving TOP1, Kubelet. Kubelet is a CRI CLIENT and never touches a container:
         the runtime execs the hook and delivers the signal, which all three riding steps say in
         their own wire label (`CRI ExecSync · postStart · Exit 0`, `CRI ExecSync · preStop ·
         Sync`, `CRI StopContainer · SIGTERM · ACK`). Cost 311ms per ball, all three have the
         headroom.
DO NOT   Ride the ack on `segmentPacket from [580,95] to [540,95]`. Both x values sit INSIDE the
         Kubelet box (420..640), so the ball slides across the box instead of down the arrow.
OPEN     Layout C leaves the left band empty at wide viewports; unavoidable while unclamped.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
The ExecSync ask hops to the runtime, then the exec order travels down the
spine to the Pod, which pulses as the hook starts running inside it. The ack
hops back to the kubelet last, one beat after that arrival.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
The StopContainer ask hops to the runtime, then the SIGTERM travels down the
spine to the Pod, which pulses and then dims out as the process exits. The ack
hops back to the kubelet last, one beat after that arrival.
```

### before `const ack = (after) => F.segment({ from: [TOP2_X, RESP_Y], to: [TOP1_X + TOP1_W, RESP_Y], after });`

```
The ack rides at the spine ball's arrival plus a beat, never before it. Span 3280 against
durations of 3800, 3800 and 4000, measured off `getAnimations()`. Ordering it this way makes the steps
SHORTER, not longer, because the Pod pulse moves earlier.

DO NOT put the ack second. It reports `ExecSync` complete before the hook has been exec-ed and
`StopContainer` complete before SIGTERM has reached the process: the answer arrives before the
thing it is answering.

DO NOT animate the top row alone on `poststart`. That draws Kubelet asking and the runtime
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
LANES    Spine stepping to WL.SPINE_X at y=140 (clearing the chip column) and landing on the
         Pod's own top midpoint.
WHY NOT  Layout A: the 200 ladder against a 275..464 band of 189. Eleven short.
NOTE     Three steps share one shape: the runtime reports an exit on the answer lane, the Kubelet
         calls StartContainer back, and the create lands on the node. `migrate-schema` lit
         `runtime` in the static `lit` list, at t=0, while `sidecar-start` and `main-start` light
         the same box on the arrival of the same hop, at 1500ms. It now lights on the arrival too,
         so the three read alike and the box is a receiver on all three (A-06).
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
WHY NOT  A chip column: 202 tall against a left band of 164. The widest value needs 258, so three
         per row at 350.67 clears it.
NOTE     POD_TOP_PAD is 24. At a smaller pad the frame's own NODE-1 label is drawn inside
         worker-1's shell.
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
WHY NOT  Keeping 6 and stepping the count through `complete` (2 -> 5 on the exit pulses, then a
         create for unit 6, then its exit). It is honest and the narration already described it,
         but it turns the shortest step on the card into a three-beat sequence: 2200 -> about 4500,
         and the MOTION note above prices `complete` at a span of 900.
WHY NOT  Moving the failure into wave 2 so the retry closes at 6. That rewrites `partial`, which is
         where the tombstone and the mixed exits are taught, to buy the same arithmetic.
NOTE     The poster's six cells are not a count of completions. It draws done-over-running, which
         is the sentence, and R-02 keeps a poster from being a small diagram.
```

### before `id: 'partial',`

```
Up-arrow step: the workers act and the controller receives, so the three exits pulse at 0 and the
report leaves at `BEAT.afterPulse`. Worker-3 and its lane settle to `OPACITY.terminated` on the
same `BEAT.afterPulse`, so the tombstone shade lands with the exit that earned it.

DO NOT call `fan` here. It is the CREATE helper: its `LANE(i)` is built trunk-first from the
controller box bottom down to the Pod, so a step whose wire label reads `watch Pod exits` would
draw three creates. Nothing is created here, so nothing rides down.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
Replacement create travels controller -> Api -> Node. worker-3 already runs
its retry here at full opacity (the dim belonged to the previous step), and each
of the three live Pods pulses as its OWN ball lands (parallelism=3): worker-2 at
800ms off the bare trunk, workers 1 and 3 at 1613ms.
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
LANES    From Kubelet's bottom midpoint down the corridor LEFT of the ladder, ending on the Pod at
         y 430 rather than on the Node frame edge above it.
WHY NOT  Chips four across: 258 wide, and "container state" runs into
         "Waiting · ContainerCreating".
NOTE     The Registry is the narrow box because the cloud path wraps it. The cloud is one
         hand-drawn path with its own centre at (685, 85), placed by transform at CLOUD_SCALE
         1.05 rather than redrawn. Straddling BOTH actor boxes reads as a rendering fault.
NOTE     The ladder starts at 176, not 150, because the scaled cloud reaches y 157.
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
WHY NOT  A pipeline at 420..1140 with status.phase as a full-width strip: the lane then runs
         straight down through six ladder rows AND through the chip.
WHY NOT  A Node bottom edge at 640: it falls on the viewBox edge and does not draw.
NOTE     status.phase in the left column is also what keeps CENTRE green. It is the only chip left
         of CX; without it the strip spans 660..1140 and centres on 900.
NOTE     Pod and container are shorter than the family default deliberately. There is no more
         room. A longer narration on any step invalidates that measurement: re-measure.
```

### before `const stage = (podGroup, placed = true) => ({`

```
NOTE     `admit` is the one step where the Pod is not placed, so the Node frame AROUND it is pinned
         to OPACITY.pending with it.
DO NOT   leave the frame or the lane at 1 there: that step's wire label reads `spec.nodeName not
         set`, so the drawing says the Pod is on Node-1 while the words say no Node has it.
NOTE     The frame is the only value `placed` still decides: the lane takes the Pod's own shade on
         every step, which is the next note.
LANES    The lane ENDS on the Pod, so it carries the Pod's shade rather than a shade of its own
         (A-13), and `stage()` states the pair once. Measured with `effectiveOpacity` at both ends:
         `schedule` 0.55, `crashloop` 0.40, `terminal` 0.12 and `admit` 0.55, each the shade of the
         Pod it lands on, against the 1 a lane holding its own shade would sit at. Kubelet, the
         source end, is 1 on all six steps, so min(source, sink) IS the Pod.
NOTE     The container sublabel on `admit` reads `no node yet · no container`, which is C-14's
         remedy: a block that does not exist yet dims AND says so. 26 characters at 6.03 units
         each is 157 of the 300 the container box is wide.
OPEN     The Pod is still drawn INSIDE the Node frame on `admit`, and that cannot be fixed by
         geometry on this card. The frame is 546..624 and rests on the floor (a bottom edge at 640
         does not draw), the status.phase chip takes 506..540, and step 5 at 1100x800 puts the
         panel bottom at 503.13, the deepest in the catalogue. That leaves 121 units between panel
         and floor, of which the chip (34) and the frame (78) already spend 112. There is no band
         to draw an unbound Pod in, so the fix is the shading and the sublabel above.
MOTION   The lane fades WITH the Pod, same delay, same duration, same easing, on all four steps that
         move the phase, which is what P-04 asked for and why this was not done one step at a time.
         `phaseFade` returns the pair. `fill: both` holds both at `from` through the 400 delay, so
         the lane is at 0.39 when the ball lands at 960 on `terminal` and at 0.40 when it lands on
         `crashloop`: visible for the whole flight (A-15), and never brighter than its own sink.
WHY NOT  Pinning the lane to the settled shade with no fade. The static block runs at t=0, so the
         lane would snap to 0.12 while the Pod is still at 1 and a ball is in the air, which inverts
         the mismatch instead of closing it.
WHY NOT  Leaving the lane at 1 and citing A-15. That was this card's own note until the lane learned
         to fade: A-15 asks the lane to be VISIBLE under its ball, not to be full strength, and 0.30
         at the arrival is visible in the rendered frame at 1600x1000 and at 1100x800.
```

### before `const phaseFade = (from, to, delay = PHASE_FADE_DELAY) => {`

```
NOTE     The easing is derived from the direction (`to > from` is a recovery, ease-out) rather than
         passed, because that reproduces exactly what the four hand-written fades said: ease-out on
         `running` and `recover`, ease-in on `crashloop` and `terminal`.
MOTION   The measured beats, unchanged by the pairing: route arrival 960 on every step, fade 400 to
         1100 on `running`, `recover` and `terminal`, 0 to 700 on `crashloop`, pulse at 960. Spans
         1520 / 1860 against durations 2300 to 2400, so the pair costs no duration (A-11, M-19).
```

### before `const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;`

```
Phase transitions cross-fade the Pod opacity between states (OPACITY.pending 0.55, running 1,
notready 0.4, terminated 0.12). Those four are the only shades this card draws: 0.35 and 0.7 are
in no token and are drawn nowhere.
This is a state machine, not a materialize/dissolve, so it keeps its own fade timing
rather than the FADE tokens. The delay starts the cross-fade a beat into the step.
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
LAYOUT   C (bottom strip). panel bottom 404.
           ladder 660..1140
           chips  two across at 548 and 590
           node   three Pods, row at NODE_Y + 34
LANES    Trunk down x = CX into the Node frame, bus at NODE_Y + 12 INSIDE the frame, one tap per
         Pod. One ball per tap, each Pod pulsing on ITS OWN ball landing rather than on a single
         shared arrival: the outer lanes are longer and the difference is the point.
NOTE     The bus inside the frame costs no vertical space (Pods start at NODE_Y + 34 instead of
         +22). Above the frame it costs 40 units this card does not have.
CONTENT  The uncapped Pods on `cgroups` are BOTH A AND B, so the sentence names both. Pod B is
         Burstable with requests only, which the classify step says in words ("requests only, no
         limits") and its own sublabel repeats (`req only · 500m / 256Mi`), so naming Pod A alone
         made a true sentence read as a property of BestEffort.
```

### before `P.box({ key: 'kubelet', x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet', sublabel: 'cgroups + eviction', role: 'cluster' })`

```
Kubelet is the node-facing actor (places Pods after binding, writes cgroups, evicts), so it
sits on the left where the connector to the node is anchored, matching the other controller
cards (left actor -> node, Api on the right). Every connector packet leaves Kubelet.
```

### before `const ALL_PENDING = { pod1: OPACITY.pending, pod2: OPACITY.pending, pod3: OPACITY.pending, ...wiring(OPACITY.pending) };`

```
NOTE     The three Pods rest at OPACITY.pending on `idle`, `spec` and `classify` and only reach 1 on
         `schedule`, each on the arrival of its OWN fan ball.
DO NOT   sit them at 1 from the poster on, three frames before the step that places them: `schedule`
         then fans three balls into an outcome already drawn. C-06 is the shade for declared and not
         working yet, which is exactly an object with no spec.nodeName.
NOTE     The wiring (trunk, bus, the three taps) is pinned WITH the Pod row, in `wiring`, because
         a tap is as faint as the Pod it points at (A-13). With the Pods dimmed and the taps left
         at 1 the three arrowheads were the brightest thing in the Node band, pointing into
         nothing that had arrived. Measured on the rendered frame at both viewports.
WHY NOT  Drawing the three Pods OUTSIDE the Node frame until they are bound. There is no band to
         draw them in: layout C puts the panel bottom at 404, the frame at 404..532 and the chip
         strip at 548..624, so the free height between panel and floor is 220 and the frame plus
         strip already spend 204 of it.
WHY NOT  Born at 0 and revealed on `schedule`. `classify` writes all three qosClass values onto the
         Pod inner boxes and pulses all three Pods, so hidden Pods leave that step drawing nothing
         at all. C-14 also forbids cutting an absent block, and these are not absent: they are in
         etcd, which is what ladder row 0 says.
NOTE     `classify` pulses with `dim: true`. A 900ms brightness pulse on a Pod sitting at 0.55 is
         not seen without the opacity lift `pulsePodDim` adds (M-07).
```

### before `const EVICTED = { ...ALL_LIVE, pod1: OPACITY.terminating, pod2: OPACITY.terminating };`

```
QoS eviction: BestEffort and Burstable (A, B) are evicted and dim together by the same
amount, Guaranteed (C) survives at full opacity. Pin the final state inline for cancel-safety.
The wiring stays at full here: both taps are still carrying their eviction balls (A-15).
```

### before `F.route({ points: LANE(0), name: 'evictA' }),`

```
This step does NOT reuse the shared fan: it sends A, then B a beat behind it, and sends nothing to
C. C gets no ball because it survives, and the narration says only the kernel OOMKiller reaches
it. The sequencing costs 627ms of duration (2600 -> 3400).

DO NOT release the three through the shared fan and leave the order to the labels. The fan
releases all three at once and the lanes are different lengths (684 units to slot 0 against 318 to
the middle), so Pod B, labelled evicted 2nd, lands a full 800ms BEFORE Pod A, labelled evicted
1st. A drawing that asserts the opposite of its own labels is worse than one that stays quiet.
```

### poster

```
Three Pods with a resources bar each: none, one bar, two matched bars, over a baseline whose weight
ramps dashed to 2px and a dot ramp below that. Two ramps saying the same thing from both ends, which
is what makes the ORDER unmistakable at 200px.
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
BUDGET   Panel x<=396.55 by y<=279.51 at 1100x800, on `apply` at 353 characters, against a frame top
         at 394, so 114.49 units stand clear. Measured range over the three viewports is
         142.56..279.51.
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
WHY NOT  A six-row ladder in the 660..1140 middle band, which is what LAYOUT.C puts there.
         Six narrated steps need six rows, 242 units at WL.ROW_H 32 and WL.ROW_GAP 10, and the band
         between the top row at 120 and the frame at 394 is 274, so it fits with 16 units at each
         end. It is declined because the verdict pair needs the same band and says something the
         narration cannot: that the Kubelet decision has three outcomes and only one of them
         continues down the spine.
WHY NOT  Four chips across the bottom strip at 258 units each. The longest value is
         `cpu NotRequired · memory RestartContainer`, 41 characters at the 6.89 units per character
         `.scheme-chip-text` rate, so 282.5 units of value alone against a 258 unit chip. Two across
         at 532 is LAYOUT.C.strip.two, and CHIPS_Y is the literal 548 that
         workloads-pod-qos-classes, workloads-restart-policy, workloads-pod-image-pull and
         workloads-pvc-stickiness all carry, so the second row ends on the 624 canvas floor.
WHY NOT  Drawing the desired and the actual as two Pod shells, one inside the API and one on the
         Node, the way cluster-static-pods draws its mirror. Two shells on one card read as two
         Pods, and the whole point here is that there is ONE Pod whose spec and status disagree for
         a moment. The disagreement is carried by the two chips instead, which sit side by side in
         the strip and can be read against each other in one glance.
DO NOT   Do not put `allocatedResources` on a chip. The page marks
         `status.containerStatuses[*].allocatedResources` Advanced and says to focus on
         `status.containerStatuses[*].resources` for monitoring and validation, and a fifth chip
         would need a third strip row, which ends at 666 on a 640 canvas.
DO NOT   Do not "fix" the `resources` field to read immutable because the Pod v1 reference says
         `Compute Resources required by this container. Cannot be updated.` That line is stale
         against the resize subresource, and the task page is the authority the card follows: the
         same reference documents `resizePolicy` and the two conditions on the same page.
DO NOT   Do not give the `spec` wire slot a longer string. It is anchored start at 612 and the
         `branch` caption starts at 840, so a `spec` label past about 37 characters closes the 68.5
         unit gap that keeps the two readable as separate labels on one row.
NOT A DEFECT
         The `admit` step shows PodResizePending while `apply` two steps later resizes the container
         successfully. That is a counterfactual on the canvas, and T-35 is why the `branch` slot
         carries `if the Kubelet cannot allocate it now` above the pair: the caption is what signs
         the alternative, and `apply` opens with `Once the Kubelet allocates it` so the two steps
         join rather than contradict.
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
LANES    Down the corridor between the two columns at WL.SPINE_X, ending on the Pod top midpoint
         at y 518, not on the Node frame edge. SPINE_UP is its reverse, so the report hop and the
         probe hop cannot drift apart.
WHY NOT  Ladder in the RIGHT column with the chips as a five-across bottom strip: at 205 wide three chip
         names overlap their values ("EndpointSlice" against "10.244.1.5 ready=false" by 60
         units), and the whole left band under the panel is left empty.
OPEN     The gap between the actor row and BAND_Y is visible at wide viewports, where the panel is
         shorter than its 1100 worst case. That is the unclamped-panel question deferred by the
         author, not a layout defect.
```

### before `F.pulse({ pod: 'podGroup', dim: true }),`

```
Startup passed but readiness has not, so the Pod is not Ready yet: it blinks
to its partial (not full) opacity and settles back to dim. Full opacity is
reserved for the ready step. Only after the blink does the packet leave.
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
LANES    Control: one trunk from TOP2_CX with a jog into the corridor at y=140, a bus SPLIT into a
         left and a right half so each can be hidden with its own tap, and one tap per Node
         landing on that Node's Pod.
         Storage: PV_LANE from the PV's right face to web-0 on Node-2, and PV_MOUNT_A mirroring it
         on the left as the mount web-0 already holds on Node-1. No ball rides PV_MOUNT_A, so it
         carries no arrowhead.
MOTION   `evict` 2700, `bind` 3200, sized for the trunk leaving TOP2.
WHY NOT  The PV in the top row: it overlaps the Api box outright (850..990 against 700..920).
         Between the frames it is also what the card is about, one disk moving between Nodes.
WHY NOT  The trunk leaving TOP1_CX. Both the eviction and the binding are API writes taking effect
         on a Node, and the StatefulSet only ever POSTs to the API on the top row.
WHY NOT  The storage lane as NODE2_LANE reversed: that is a control route wearing the storage
         colour.
DO NOT   Give a ball a literal points array. One of the previous pair ran out to x=1198, off the
         content band entirely, matching no wire on the card.
NOTE     The `lanes` helper pins each lane to 0 while the Pod it addresses is not on that Node,
         per the project rule that an absent block dims but its lanes disappear. Without it the
         CSI lane claims the volume is attached to Node-2 on the idle step, contradicting the
         narration.
```

### before `const lanes = (toA, toB, alive = false) => ({`

```
NOTE     `nodeA` is pinned here, not per step, because it CHANGES: Node-1 is at 1 on the idle frame
         and at OPACITY.notready from `evict` on. It has to appear in all five opacity maps: absent
         from them it never leaves full strength, while `pvChip` reads `on lost Node-1` on three
         steps and `reattach` calls that Node unreachable. The card's own POSTER draws the left Node
         at 0.5, dashed, with an X across its Pod, so a Node at full strength contradicts it.
NOTE     `alive` defaults to FALSE, which is the reading that keeps this file honest: the Node is
         lost on four of the five steps, so the exception is the idle frame and only it passes the
         flag. It is also what keeps `evict`s opacity line byte-identical to the anchor below it.
WHY NOT  OPACITY.terminating for Node-1. The Node object is not deleted on any step of this card,
         and `reattach` says the volume is force-detached BECAUSE the Node is unreachable, which is
         notready: alive but not serving and not observed (C-07).
```

### before `F.fade({ target: 'nodeA', from: 1, to: OPACITY.notready, dur: FADE.out, delay: 0, fill: 'both', easing: 'ease-in' }),`

```
The first sentence of `evict` is Node-1 going NotReady, so the frame dims at delay 0 and the
eviction ball follows it. No delay is needed to put the two in that order: the fade ends at 700 and
the ball is still 1858ms out, so the reader sees the Node go dark and only then the delete land.

WHY NOT delaying the route by FADE.out + BEAT.afterHop, which is how `replicaset` self-heal
sequences the same shape. The trunk here is 2558ms long, so the step would run to 4058 and need
its duration raised 2700 -> 4200 to buy an ordering the frame already reads correctly.
```

### before `F.route({ points: NODE1_LANE, fadeIn: true, name: 'del' }),`

```
The delete reaches Node-1 over the left connector. podA is pinned to OPACITY.terminating
above, the animation back-fills 1 during the delay, then sinks web-0 to that shade on
arrival: the chip says 'Terminating, then removed', so the Pod is marked on this step and
leaves its slot on the next one, not here. The PVC, PV and data chips stay lit (retained).
```

### before `F.route({ points: NODE2_LANE, fadeIn: true, name: 'bind' }),`

```
The binding is delivered to Node-2 over the right connector (the scheduler posts it
to the Api, no separate scheduler block is drawn). podB is pinned to 1 above,
the animation back-fills 0 during the delay so web-0 materializes and pulses on
arrival, keeping the same sticky identity.
```

### before `F.route({ points: PV_LANE, role: 'storage', fadeIn: true, name: 'mount' }),`

```
CSI reattaches the same PV to Node-2. The volume packet crosses from the PV into
web-0 on Node-2, and web-0 pulses once on arrival then settles back (mounted, data
preserved). No persist, so the pulse fades instead of pinning the outline bright.
```

### before `opacity: { podB: 0, ...lanes(true, false), podA: OPACITY.terminating },`

```
The evict step sinks web-0 to OPACITY.terminating, the state its chip names FIRST
('web-0 · Terminating, then removed'). The recreate step is where it leaves the slot: that is the
step whose narration has the object finally gone and a new one created under the same name.

DO NOT draw it out to 0 here. A chip naming two states over a drawing showing only the second is
the defect.
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

### before `const TAP_A = [[P_A_CX, BUS_Y], [P_A_CX, POD_Y]];`

```
`TAP_A` and `TAP_B` are both ridden, and a grep for the constant name will say otherwise:
`NODE1_LANE` and `NODE2_LANE` are `[...TRUNK, ...tap]`, so a ball on either covers its tap exactly.

DO NOT report them as lanes nobody rides. Same silhouette as the false finding on
cluster-architecture.
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
LANES    Trunk from the ReplicaSet box's bottom midpoint (420..780, centred on CX) down between
         the columns, a bus at NODE_Y + 12, and one tap per slot. Four slots means four different
         addressees across the story: self-heal targets web-b2, adopt / converge / orphan all
         target web-d4, and the ownership step addresses all three live Pods with one ball each.
NOTE     Pods are 78 high rather than the family 106. The six-row ladder and the chip column both
         have to clear the panel, and 78 is what is left.
```

### before `F.route({ points: LANE(3), after: 'patch', name: 'join' }),`

```
The RS claims the orphan (ownerReference PATCH on the top arrow), then a packet runs
down the connector and the adopted Pod RISES on arrival, showing the fourth replica joining the
managed set. The rise is out of OPACITY.notready, not out of nothing: see below.
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

NOTE The PATCH waits FADE.in + BEAT.afterHop, the same idiom `self-heal` uses to put a node-band
event before the control-plane reaction it causes. The RS cannot match a selector against a Pod
that is not on screen yet. That two-beat shape is what took the duration 3700 -> 4400: the orphan
appears at 600, the PATCH lands at 1400, the ball at 3322 and its pulse closes at 4222.

DO NOT wind the bus tail and tap3 back with the Pod. LANE(3) runs along both, so the ball would
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
WHY NOT  Chips four across: 258 wide, and five strings collide, including "Pod B · OnFailure"
         against "Waiting (backoff)".
WHY NOT  Api first. Kubelet is the node-facing actor and the line down to the Node has to leave a
         box midpoint inside the corridor. With the two swapped, `bounce()` would send its first
         hop OUT of the Api while its own comment has Kubelet watching the Api and the spec
         hopping back.
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
LANES    Trunk leaving the API at 990 and stepping into the corridor. No slot centre lands on CX,
         so EVERY tap is a jog and none collapses to a straight drop.
MOTION   A cycle is TWO events, a surge and a drain, which is what takes second-cycle to 6200 and
         third-cycle to 6800.
WHY NOT  Three slots. maxSurge=1 means the rollout is transiently one Pod ABOVE .spec.replicas,
         which the surge step says in words and counts in its chip as "4 Pods alive". Three slots
         make the drawing contradict the card's own subject.
NOTE     The fourth slot is where the surge lands; each drain then frees a slot the next v2 takes,
         and the row ends with its LEFTMOST slot empty because the surge capacity is given back.
NOTE     Pods are named web-a1..web-d4 rather than by ordinal. An ordinal implies an age order the
         drawing never establishes, while the narration says the controller picks the oldest.
DO NOT   Put the wire label below the actor row. At TOP_BOTTOM + 26 it overlaps the first ladder
         row.
```


### before `F.fade({ target: 'pod4', from: 0, to: 1, dur: FADE.in, at: 'create', fill: 'both', easing: 'ease-out' }),`

```
MOTION   `surge` drew the fourth Pod in the static block at t=0 and landed its create ball on it at
         3400: measured with the spec timeline, patch arrives 700, the route leaves at 800 and lands
         at 3400, so the create stood 3400ms ahead of its own motion. The Pod now winds back to 0 and
         rises over FADE.in on the arrival, pulse on the same beat. Span stays 4300 of 4500, so no
         duration moved (A-11, M-19).
NOTE     Two chips had to move with it, and only for the reason the sibling card records as NOT
         needed: `progressChip` reads `surged +1 · 4 Pods alive`, which is false while three Pods are
         drawn, and `v2Chip` goes `0 / 0` to `0 / 1`. They take DIFFERENT beats, because they are
         different facts: RS-v2 wants one replica when the scale PATCH lands (700, which is what the
         wire label of this step says), and four Pods are alive when the fourth is on screen (3400).
DO NOT   Bind one of them and leave the other. Both are named in `lit`, so binding one promotes its
         neighbour into FORM-E of the chip-beat rule (P-04) and `unit/chip-beat-e.test.mjs` goes red.
         That is the same trap the three counters of `probe-and-drain` were bound against.
NOTE     The `slots()` sublabel needed no beat. `pod4Box` reads `v2.0 · starting` from t=0, but it is
         INSIDE the Pod group, so it is invisible for exactly as long as the Pod is.
OPEN     `tap3` sits at 1 while slot 4 is empty on `idle` and `spec`, and `tap0` does the same over
         the emptied slot 1 on `converged`: an arrowhead into blank canvas, which is A-14. Measured
         with `effectiveOpacity`: tap3 1.000 against pod4 0.000 on both steps, tap0 1.000 against
         pod1 0.000 on `converged`. It predates this pass and is NOT closed by it, because the taps
         alone are not the fix: `bus` spans slot centres 201..999, so pinning tap3 out leaves the
         bus running 733..999 to a tap that is gone. The fix is the `workloads-replicaset` shape, the
         bus SPLIT at the slot boundaries with each segment pinned to the Pod it feeds, which adds
         three keys to all seven opacity maps (A-16) on a card whose three counters were bound to
         beats the same week. It costs no timing: the drawn bus and the LANE(i) the ball rides are
         separate arrays.
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

DO NOT bind one of the three and leave the others. `v2Chip` is named in `lit` on all three steps, so
binding its neighbours alone promotes it into FORM-E of the chip-beat rule (P-04), which
`unit/chip-beat-e.test.mjs` fails on. All three are bound, and the gate is green.
```

### before `reducedLit: ['pod2Box', 'pod3Box', 'pod4Box'],`

```
The three live v2 Pods sit in slots 2, 3 and 4, not 1, 2 and 3: the surge capacity is released
from the LEFTMOST slot, so `slots(null, V2, V2, V2)` empties slot 1 on this step. Both the
played pulse list and the reduced highlight list follow the slot map, and both must be revisited
if the slot count or the released slot ever changes.

DO NOT carry a pulse list across a slot-count change. A stale list fires one pulse on an invisible
Pod while `pod4`, a Ready v2 Pod, never acknowledges the narration that calls it Ready, and
`render/reduced.test.mjs` still passes, because the played and the reduced path are wrong IDENTICALLY.
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
LANES    Trunk, a bus at NODE_Y + 12, one tap per ordinal. `ordinals` pins each tap to the SAME
         opacity as the Pod it lands on and splits the bus at the centre slot (busL with ordinal
         0, busR with ordinal 2), so no lane points into a slot whose Pod does not exist yet: on
         idle all three ordinals are 0 and the Node frame is empty. A step turns its own tap on at
         entry, and the ball that rides it is what materializes that Pod.
WHY NOT  The Service in the actor row: at 840..1060 against an Api at 700..920 the two boxes
         overlap by 80 units, and so do their wire labels.
```
### before `const SVC_LANE = [[SVC_CX, WL.TOP_BOTTOM], [SVC_CX, SVC_Y]];`

```
A ball rides this wire, one beat after the Pod pulses Ready, because registration follows
readiness. The wire is a `pathArrow` off this array so the ball and the lane cannot drift apart.
The Service is a receiver, so it lights on arrival rather than at step entry. Durations 4800 /
4000 / 4800.

DO NOT draw it with an arrowhead and no ball. The card names the registration three times in
narration and labels this wire for it three times through the step field `wires: { svc: ... }`.
```

### poster

```
Three Pods each over its own disk, ramping 0.10 / 0.06 / 0.03 with the third dashed, and two
chevrons between them. Ordinal 0 is ready, 1 is coming up, 2 has not started: the ramp is the
ordering and the chevrons are what stop it reading as three states of one Pod.
The whole group is mirrored with a scale(-1,1) so the READY end sits on the right, against the
narration panel's corner rather than under it.
```
