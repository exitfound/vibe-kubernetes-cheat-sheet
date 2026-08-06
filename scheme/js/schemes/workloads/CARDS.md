# Scheme card design notes: workloads

The per-card design record for `js/schemes/workloads/`. It answers what the code cannot: why a
number is what it is, which alternative was measured and failed, and what must not be "fixed".
The constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note below records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders, and `scheme/INTERNALS.md`
for the shared sources (catalog, lib, CSS). None of them ships (`S-41`).

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`check-notes` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `check-notes` verifies every anchor still occurs in its card, so **an anchor is DATA:
never reword one** (`S-38`).
``### note (anchor dropped: ...)`` is a note whose target line is not unique in the file.

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM ranges 90 to 504 over
the standard viewport set, and it moves NON-MONOTONICALLY (`L-02`, `L-04`, `L-05`). So a `PANEL_B`
in a card is a measurement, not a convention. Re-measure with
`VW=1100 VH=800 node overlay-measure.mjs <card>` after any prose change: several cards here carry a
hard character ceiling and the gate enforces none of them (`L-08`).

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
         .scheme-chip, so the strip check-geometry measures is chips + ladder = 60..1140.
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
DO NOT   End the spine on the Node frame's top edge. It sits 22 units above the Pod and reads as
         a lane pointing at a frame rather than at a container.
DO NOT   Centre the lower wire label on WL.SPINE_X. The lane strikes it through on every step
         that sets it. It hangs off the side, anchor start at SPINE_X + 14.
```

### before `},`

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
WHY NOT  Either column beside the panel: the left band is 350..464 = 114, against a 242 ladder
         and a 202 chip column.
WHY NOT  Chips two per row, which the WL brief prefers: 5 chips is then three rows (118 tall) and
         leaves the Node frame 64 units where the Pod alone is 106. Three per row is 350.67, the
         floor, and the widest value here needs 304.
WHY NOT  Ticks at x=830: they run straight through the pipeline ladder.
NOTE     POD_PAD is 80, not the family 24. With the frame at 404 a pad of 24 draws the first Job
         slot over the frame's own NODE-1 label. The row still centres on CX by construction.
```

### before `const ladderCaption = text({ class: 'scheme-label code dim', x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, 'text-anchor': 'middle' }, ['schedule ticks · every 5 min']);`

```
The caption is centred over the tick strip by derivation (TICK_X + TICK_SPAN / 2), never by a
literal, so it follows if the strip moves.
```

### before `function setTicks(s, lit) {`

```
Light the schedule ticks at which a Job actually fired (cumulative). Ticks skipped by
concurrencyPolicy or missed during downtime stay dark, so the gaps in the ladder are real.
Newly-lit ticks auto-pulse via the Timeline delta, drawing the eye to the fresh run.
```

### before `},`

```
No connector packet: nothing reaches the node because creation is skipped.
The tick is skipped in place, nothing travels: the policy consulted and the
recorded event show via the static highlight only (no chip pulse).
```

### before `},`

```
No connector packet: the missed tick produces no Job.
Nothing is created for the missed tick: the recorded miss shows via the
static highlight only (no chip pulse).
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
           chips  60..540, 4 x 34 = 160 tall
           ladder 660..1140, 5 rows = 200
           nodes  four frames on the canvas floor, 484..624
LANES    Trunk from TOP1's bottom midpoint, stepping to WL.SPINE_X at y=140, into a bus at
         NODE_Y-24 with ONE TAP PER POD. Each step routes its ball down the tap of the Pod that
         actually reacts; the create step fires three, one per matching Node. Wire and ball are
         the same LANE(i) array.
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

### before `let placed = 0;`

```
Both counters climb PER ARRIVAL, not at step entry. The narration is `creates one Pod on each` and
the card draws three separate creates, so the count going 0-1-2-3 alongside the three Pods
appearing IS the step. `3` stays pinned above the guard for the reduced contract.

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
```

---

### before `setPods(s, OPACITY.notready, 1);`

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
WHY NOT  A column beside the panel: the left band is 300..464 = 164 against a 202 chip column.
WHY NOT  Leaving from TOP1, kubectl. The termination order is what the API sets in motion once it
         has stamped deletionTimestamp, and on the last step the report climbs back to whichever
         box `lightBoxAt` lights.
WHY NOT  The ladder at 412 with NODE_H 116: the frame's top border then runs 5 units above the
         Pod's, which reads as a rendering slip rather than as a frame.
DO NOT   End the connector at x=320 inside the Node frame. It points at blank canvas 50 units
         left of the Pod.
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
WHY NOT  Anything beside the panel: the left band is 399..464 = 65.
WHY NOT  Chips two per row: three rows, leaving the Node frame 64 units where the Pod alone is
         106. Three per row is 350.67 and the widest value needs 269.
WHY NOT  The spine leaving TOP1, Kubelet. Kubelet is a CRI CLIENT and never touches a container:
         the runtime execs the hook and delivers the signal, which both riding steps say in their
         own wire label (`CRI ExecSync · preStop · Sync`, `CRI StopContainer · SIGTERM · ACK`).
         Cost 311ms per ball, both have the headroom.
DO NOT   Ride the ack on `segmentPacket from [580,95] to [540,95]`. Both x values sit INSIDE the
         Kubelet box (420..640), so the ball slides across the box instead of down the arrow.
OPEN     Layout C leaves the left band empty at wide viewports; unavoidable while unclamped.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
ExecSync hops to the runtime and acks back; once that ack lands at the
kubelet the exec order travels down to the Pod, which pulses as the hook
starts running inside it.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
StopContainer hops to the runtime and acks back; once that ack lands at
the kubelet the SIGTERM order travels down to the Pod, which pulses then
dims out as the process exits.
```

### before `const exec = routePacket(s, ctx, SPINE, { delay: req.arrivalMs + BEAT.afterHop, role: 'workloads`

```
The ack rides at the spine ball's arrival plus a beat, never before it. Span 3280 against
durations of 3800, 3800 and 4000, measured with anim-dump. Ordering it this way makes the steps
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
           chips  60..540, 4 x 34 = 160
           ladder 660..1140, 5 rows = 200
           node   on the floor, one 828-wide Pod centred in it
LANES    Spine stepping to WL.SPINE_X at y=140 (clearing the chip column) and landing on the
         Pod's own top midpoint.
WHY NOT  Layout A: the 200 ladder against a 275..464 band of 189. Eleven short.
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
         Each step fires one ball per lane through the card-local `fanOut`. The middle Pod centres
         exactly on WL.SPINE_X, so its lane skips the bus point rather than drawing a zero-length
         segment.
MOTION   3500 / 2700 / 3500 / 2700, sized to the routes. `partial` is the exception at 2600, span
         2060, because it carries no down-balls at all (see its own note).
WHY NOT  A chip column: 202 tall against a left band of 164. The widest value needs 258, so three
         per row at 350.67 clears it.
NOTE     POD_TOP_PAD is 24. At a smaller pad the frame's own NODE-1 label is drawn inside
         worker-1's shell.
```

### before `[s.refs.pod1, s.refs.pod2, s.refs.pod3].forEach(p => pulsePod(p, ctx, 0));`

```
Up-arrow step: the workers act and the controller receives, so the three exits pulse at 0 and the
report leaves at `BEAT.afterPulse`. Worker-3 and its lane settle to `OPACITY.terminated` on the
same `BEAT.afterPulse`, so the tombstone shade lands with the exit that earned it.

DO NOT call `fanOut` here. It is the CREATE helper: its `LANE(i)` is built trunk-first from the
controller box bottom down to the Pod, so a step whose wire label reads `watch Pod exits` would
draw three creates. Nothing is created here, so nothing rides down.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
Replacement create travels controller -> Api -> Node. worker-3 already runs
its retry here at full opacity (the dim belonged to the previous step), all three
live Pods pulse together on arrival (parallelism=3).
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
WHY NOT  A pipeline at 420..1140 with status.phase as a full-width strip: the lane then runs
         straight down through six ladder rows AND through the chip.
WHY NOT  A Node bottom edge at 640: it falls on the viewBox edge and does not draw.
NOTE     status.phase in the left column is also what keeps CENTRE green. It is the only chip left
         of CX; without it the strip spans 660..1140 and centres on 900.
NOTE     Pod and container are shorter than the family default deliberately. There is no more
         room. A longer narration on any step invalidates that measurement: re-measure.
```

### before `const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;`

```
Phase transitions cross-fade the Pod opacity between states (0.35 dim / 0.7 / 1).
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
```

### before `const kubelet   = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet',   sublabel: 'cgroups + eviction',            role: 'cluster' });`

```
Kubelet is the node-facing actor (places Pods after binding, writes cgroups, evicts), so it
sits on the left where the connector to the node is anchored, matching the other controller
cards (left actor -> node, Api on the right). Every connector packet leaves Kubelet.
```

### before `s.refs.pod1.style.opacity = String(OPACITY.terminating);`

```
QoS eviction: BestEffort and Burstable (A, B) are evicted and dim together by the same
amount, Guaranteed (C) survives at full opacity. Pin the final state inline for cancel-safety.
```

### before `const evictA = routePacket(s, ctx, LANE(0), { role: 'workloads' });`

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

## workloads-probes

### layout

```
WHAT     startupProbe, readinessProbe and livenessProbe against one container, and what each
         failure does to the EndpointSlice.
LAYOUT   A, and THE WORKLOADS EXEMPLAR. New workloads cards copy this shape.
         PANEL_B 255, both columns starting on one line at BAND_Y = PANEL_B + 21 = 276.
           ladder left  60..540 (WL.LADDER_X / LADDER_W)
           chips  right 660..1140 (WL.CHIP_X / CHIP_W), 5 x 34, gap 8
           node   full width, 496..624
LANES    Down the corridor between the two columns at WL.SPINE_X, ending on the Pod top midpoint
         at y 518, not on the Node frame edge. SPINE_UP is its reverse, so the report hop and the
         probe hop cannot drift apart.
WHY NOT  Ladder in WL.CHIP_X with the chips as a five-across bottom strip: at 205 wide three chip
         names overlap their values ("EndpointSlice" against "10.244.1.5 ready=false" by 60
         units), and the whole left band under the panel is left empty.
OPEN     The gap between the actor row and BAND_Y is visible at wide viewports, where the panel is
         shorter than its 1100 worst case. That is the unclamped-panel question deferred by the
         author, not a layout defect.
```

### before `pulsePodDim(s.refs.podGroup, ctx, 0);`

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
NOTE     setLanes pins each lane to 0 while the Pod it addresses is not on that Node, per the
         project rule that an absent block dims but its lanes disappear. Without it the CSI lane
         claims the volume is attached to Node-2 on the idle step, contradicting the narration.
```

### before `const del = connectorPacketA(s, ctx);`

```
The delete reaches Node-1 over the left connector. podA is pinned to OPACITY.terminating
above, the animation back-fills 1 during the delay, then sinks web-0 to that shade on
arrival: the chip says 'Terminating, then removed', so the Pod is marked on this step and
leaves its slot on the next one, not here. The PVC, PV and data chips stay lit (retained).
```

### before `const bind = connectorPacketB(s, ctx);`

```
The binding is delivered to Node-2 over the right connector (the scheduler posts it
to the Api, no separate scheduler block is drawn). podB is pinned to 1 above,
the animation back-fills 0 during the delay so web-0 materializes and pulses on
arrival, keeping the same sticky identity.
```

### before `const mount = pvPacket(s, ctx);`

```
CSI reattaches the same PV to Node-2. The volume packet crosses from the PV into
web-0 on Node-2, and web-0 pulses once on arrival then settles back (mounted, data
preserved). No persist, so the pulse fades instead of pinning the outline bright.
```

### before `s.refs.podA.style.opacity = String(OPACITY.terminating);`

```
The evict step sinks web-0 to OPACITY.terminating, the state its chip names FIRST
('web-0 · Terminating, then removed'). The recreate step is where it leaves the slot: that is the
step whose narration has the object finally gone and a new one created under the same name.

DO NOT draw it out to 0 here. A chip naming two states over a drawing showing only the second is
the defect.
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

### before `s.refs.pod4.style.opacity = '0';`

```
The RS claims the orphan (ownerReference PATCH on the top arrow), then a packet runs
down the connector and the adopted Pod materializes in the node block on arrival,
showing the fourth replica joining the managed set.
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
WHY NOT  Chips four across: 258 wide, and five strings collide, including "Pod B · OnFailure"
         against "Waiting (backoff)".
WHY NOT  Api first. Kubelet is the node-facing actor and the line down to the Node has to leave a
         box midpoint inside the corridor. With the two swapped, `bouncePacket` leaves the Api
         while its own comment says "request up to the apiserver".
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


### before `if (ctx.reduced) { ['pod2Box','pod3Box','pod4Box'].forEach(k => s.refs[k].classList.add('highlig`

```
The three live v2 Pods sit in slots 2, 3 and 4, not 1, 2 and 3: the surge capacity is released
from the LEFTMOST slot, so `setSlots(s, null, V2, V2, V2)` empties slot 1 on this step. Both the
played pulse list and the reduced highlight list follow the slot map, and both must be revisited
if the slot count or the released slot ever changes.

DO NOT carry a pulse list across a slot-count change. A stale list fires one pulse on an invisible
Pod while `pod4`, a Ready v2 Pod, never acknowledges the narration that calls it Ready, and
`check-reduced` still passes, because the played and the reduced path are wrong IDENTICALLY.
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
LANES    Trunk, a bus at NODE_Y + 12, one tap per ordinal. Taps are drawn on every step, but
         `setPods` pins each Pod to 0 until its ordinal is created, so on idle the reader sees
         three empty slots the ladder is about to fill and the ball that rides a tap is what
         materializes that Pod.
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
narration and labels this wire for it three times through `setWire(s, 'svc', ...)`.
```

### poster

```
Three Pods each over its own disk, ramping 0.10 / 0.06 / 0.03 with the third dashed, and two
chevrons between them. Ordinal 0 is ready, 1 is coming up, 2 has not started: the ramp is the
ordering and the chevrons are what stop it reading as three states of one Pod.
The whole group is mirrored with a scale(-1,1) so the READY end sits on the right, against the
narration panel's corner rather than under it.
```
