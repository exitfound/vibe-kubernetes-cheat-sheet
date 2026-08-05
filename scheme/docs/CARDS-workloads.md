# Scheme card design notes: workloads

The per-card design record for `js/schemes/workloads/`. Anything longer than two comment lines
lives here rather than above the code; one and two line clarifications stay next to what they
explain. The sister files are `CARDS-<other-category>.md` for the other three categories and
`INTERNALS.md` for the shared sources (catalog, kits, CSS).

**Not deployed.** Three exclusions keep `scheme/docs` out of production and all three must hold:
`deploy.yml` runs `rm -rf _site/scheme/tools _site/scheme/docs`, `release.yml` lists
`"scheme/docs/*"` in the zip's `-x` list, and `.dockerignore` lists `scheme/docs`. The last is not
optional, because `Dockerfile` is a blanket `COPY . .`. Verify with
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/scheme/docs/CARDS-workloads.md`,
which must return 404.

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`check-notes` parses it that way. A second-level heading anywhere else in this file is reported as
an orphan section.)

Each note is anchored by the line of code it sat above, written as ``### before `<line>` ``, so it
can be put back beside its code. `check-notes` verifies every anchor still occurs in its card, and
a card file points here from one comment under its imports.

Two shapes carry no anchor on purpose: `### note (anchor dropped: ...)`, whose target line appears
more than once in the card so no anchor can name it, and `### poster`, `### layout`, which describe
the card rather than a line.

**A note records what was true when it was written. Nothing verifies its prose.** A stale anchor is
caught; stale reasoning is not. Two things to check before acting on one:

- **Panel extent is per card and must be re-measured, never assumed.** The panel's right edge is
  `x<=397` catalog-wide, but its BOTTOM ranges from 171 to 504 and moves with viewport width
  non-monotonically. A placement justified by a blanket `y<=300` proves nothing. Measure with
  `node check-geometry.mjs --rules=occluded` over 1600 / 1440 / 1280 / 1100 and record the worst
  case. Lengthening any narration invalidates the measurement for that card.
- **A geometry note is only as current as the last relayout.** Read the card's constants next to
  the note before deriving anything from it.

---

## workloads-container-states

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=230 over
1600/1440/1280/1100.
Layout A does not fit: the six-row ladder is 6*32+5*10 = 242 tall and the left band under the
panel is only 250..464 = 214. The four-chip column is 4*34+3*8 = 160 and does fit, so the chips
take the left band (60..540, w 480) and the ladder keeps the right one (660..1140).
The Node frame rests on the canvas floor (NODE_H 140, bottom 624) and the Pod is centred in it,
so the spine runs WL.SPINE_X straight into the Pod's top midpoint instead of stopping on the
frame edge above it.
The chip strip check-geometry measures is the union of the chip column and the ladder rows
(chainList rows carry .scheme-chip), so it spans 60..1140 and CENTRE passes without a full-width
bottom strip.
```

---

## workloads-crashloopbackoff

```
Layout B of the WL canon. Panel worst case x<=397, y<=205; the card reserves 225, deliberately
conservative.
Two constraints this card is easy to break: the spine must end on POD_Y, not on the Node frame's
top edge 22 units above it, and the lower wire label must hang off the side of the lane (anchor
start at SPINE_X + 14). Centred on WL.SPINE_X it is struck through by the lane on every step that
sets it.
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
in words, and the restart it is holding is exactly what would travel down. A ball there would
assert the restart happened on the step whose subject is that it has not. The crash goes UP and
is animated on `first-crash` and `reset`.

Do not add a down-ball to close an "arrowhead nobody rides" finding. The other lane in the
catalog whose emptiness is the lesson is `W_RET_WIPE` on storage-reclaim-policy.
```

---

## workloads-cronjob

### layout

```
Layout C of the WL canon. Panel worst case x<=397, y<=330 over 1600/1440/1280/1100.
Neither column fits: the left band under the panel is 350..464 and both the six-row ladder (242)
and the five-chip column (202) are taller, so the chips take a full-width bottom strip.
Chips go THREE per row, not two: 5 chips at two per row is three rows (118 tall) and that leaves
the Node frame only 64 units between the ladder and the strip, where the Pod alone is 106. Three
per row is 350.67 wide, exactly the 350 floor, and the widest value on this card needs 304. Two
rows -> 548..624, short row centred on CX.
POD_PAD is 80 rather than the family 24: with the frame pulled up to 404 the pod row sits 20
below the frame's top edge, and at 24 the first Job slot is drawn over the frame's own NODE-1
label. 80 clears it, and the row still centres on CX by construction.
The trunk drops from the CronJob box at TOP1_CX with no jog (there is no left column to clear)
into a bus at NODE_Y-8, tapping into the two Job slots that ever receive a create.
```

### before `const ladderCaption = text({ class: 'scheme-label code dim', x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, 'text-anchor': 'middle' }, ['schedule ticks · every 5 min']);`

```
Schedule clock: one chip per 5-minute tick, the current tick highlighted as time advances.
The caption is centred over the tick strip by derivation (TICK_X + TICK_SPAN / 2), never by a
literal, so the caption follows if the strip moves. The ticks belong in the left band under the
panel: at x=830 they run straight through the pipeline ladder.
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

---

## workloads-daemonset

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=230.
Layout A technically fits (the five-row ladder is 200 against a 214 band) but leaves only about
14 units between the ladder's bottom and the Node row for the lane bus, so the mirror wins: the
four-chip column is 160 tall and leaves 74.
Four Node frames rest on the canvas floor (484..624).

One lane per Pod, not one lane for the card. A single lane lands on Node-1's top edge on EVERY
step, including the step that adds a Pod to Node-4 and the step that deletes the Pod on Node-2.
The shape is a trunk into a bus at NODE_Y-24 with one tap per Pod, and each step routes its ball
down the tap of the Pod that actually reacts (the create step fires three, one per matching Node).
Wire and ball are the same LANE(i) array.
A lane into a Node that is not in the cluster is pinned to 0: lane 3 until Node-4 joins, lane 1
once Node-2 leaves.

The trunk leaves TOP1's bottom midpoint and steps to WL.SPINE_X at y=140, because a straight drop
at 530 cuts through the chip column (60..540). The top-row wire label belongs ABOVE the actor row
for the same reason: centred at WIRE_X on y=146 it sits on the lane.
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
Both counters climb per arrival rather than turning over once at the end, because the narration is
`creates one Pod on each` and the card draws three separate creates: the count going 0-1-2-3
alongside the three Pods appearing IS the step. `3` stays pinned above the guard for the reduced
contract.

Do not read either counter from step entry. The step says the controller sees three matching Nodes
and ZERO Pods, and the Pods do not fade in until their creates land about 2s later, so a counter
that reads `3` at entry contradicts the narration it accompanies. `numberReady` is the worse half.
```

---

## workloads-deployment-rollback

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=230.
The six-row ladder (242) does not fit the 250..464 band, the four-chip column (160) does.

Only the surging Pod ever receives a ball, so there is ONE lane: trunk from TOP1's bottom midpoint,
step to WL.SPINE_X at y=140 to clear the chip column, drop to a bus at NODE_Y-24 and tap down into
it. Taps into the other slots would put an arrowhead on a lane no ball rides, which the canon
forbids.

FOUR slots, and the fourth is load-bearing. Every step pins RS-v1 at 3 / 3 and the wedged step says
RS-v1 keeps ALL THREE v1.0 Pods serving, so the three v1 Pods have to be drawn at once. With three
slots the broken v2 stands in one of their places and the row shows two survivors against a chip
saying three. The fourth slot carries the whole v2 story alone: it appears on the rollout,
crash-loops, wedges, and is DELETED by the undo rather than converted back into a v1, which is what
the undo step narrates.
Row is 4 x 234 at 201 / 467 / 733 / 999, Pods named web-a1..d4. That Pod is web-d4 at centre 999
and the lane taps there, not into the leftmost slot.
Durations for steps 1, 2 and 4 are 3700 / 2900 / 3700, sized to the four-slot route.
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

Do not write `scales the previous ReplicaSet back up` here. It describes a rollback this card
deliberately does not draw, and no tool compares an aria-label with the steps underneath it.
```

---

## workloads-force-deletion

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=280.
Two Node frames (60..580 and 620..1140) rest near the floor at NODE_H 134, so their Pods centre
on 320 and 880, mirrored about CX. That is what lets ONE trunk serve both: it leaves the API box's
bottom midpoint (both node-band actions on this card are control-plane actions issued through the
API), steps to WL.SPINE_X at y=140, drops to a bus at NODE_Y-15 and taps left and right into the
two Pods. NODE_H is 134 rather than 140 to open that 15 unit corridor between the chip column's
bottom (460) and the frames.

Both node routes take NODE1_LANE / NODE2_LANE, the same arrays the wires are built from. Literal
packet arrays are the failure mode here: the previous pair followed no drawn wire and one of them
left the content band entirely at x=1198. A lane down x=810 runs through the pipeline ladder rows.
```

---

### before `setPods(s, OPACITY.notready, 1);`

```
The risk step holds Pod A at OPACITY.notready, the vocabulary entry for alive but not serving and
not observed, and the RISE to it is the step: the previous step drew the object dropped from ETCD,
this one puts the process back on screen next to the replacement that now shares its identity.

This is the only card in the catalog where a Pod comes back UP the vocabulary. It is deliberate,
not a missed fade.

Do not lower it to OPACITY.terminated, the shade for gone. Its own chips read 'maybe still running'
and 'identity live twice', and terminated draws the API server's belief instead of the card's
subject: force-delete dropped the object without any Kubelet acknowledgement, so on a merely
partitioned Node the container keeps running.
```

---

## workloads-graceful-shutdown

### layout

```
Layout C of the WL canon. Panel worst case x<=397, y<=280.
The six-row ladder plus five chips leaves no band deep enough for a column (the left band is
300..464 = 164, the chip column is 202), so the chips take a full-width bottom strip at THREE per
row (350.67, the floor; the widest value here needs 279). Two rows -> 548..624, short row centred.
The ladder sits at y=140 so the Node frame can be 394..528 with the Pod 20 below its top edge. At
412/116 the frame's top border runs 5 units above the Pod's, which reads as a rendering slip
rather than as a frame.

The lane leaves TOP2, the API, not TOP1, kubectl: the termination order is what the API sets in
motion once it has stamped deletionTimestamp, and on the last step the report climbs back to
whichever box `lightBoxAt` lights. It runs TOP2 midpoint -> WL.SPINE_X at y=140 -> straight into
the Pod's top midpoint, and the return lane is its reverse. Cost is 311ms per ball, which both
steps have headroom for.
A connector ending at x=320 inside the Node frame points at blank canvas 50 units left of the Pod.

Layout C leaves the left band above the Node frame empty at wide viewports. Unavoidable while the
narration panel is not clamped in CSS.
```

---

## workloads-hooks

### layout

```
Layout C of the WL canon, and the tightest card in the category: the panel reaches y<=379, the
deepest in Workloads after the pod-* cards. Nothing fits beside it (the left band is 399..464).
Chips take a full-width bottom strip at THREE per row (350.67; the widest value here needs 269).
Two per row is three rows and leaves the Node frame 64 units where the Pod alone is 106.
The ladder sits at y=140 so the frame can be 394..528 with the Pod 20 below its top edge.
The spine steps from TOP2's bottom midpoint to WL.SPINE_X at y=140 and ends on the Pod's top
midpoint rather than on the frame edge.

The spine leaves TOP2, the runtime, not TOP1, Kubelet. Kubelet is a CRI CLIENT and never touches a
container: the runtime execs the hook and delivers the signal, which both steps that ride this lane
say in their own wire label (`CRI ExecSync · preStop · Sync` and `CRI StopContainer · SIGTERM ·
ACK`). Cost is 311ms per ball, both steps have the headroom.
The ExecSync ack runs TOP2_X -> TOP1_X+TOP1_W at RESP_Y, which is the drawn return arrow. A
segment from [580,95] to [540,95] has both x values INSIDE the Kubelet box (420..640), so the ball
slides across the box instead of down the arrow.

Layout C leaves the left band empty at wide viewports; unavoidable while the panel is unclamped.
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
Ask, deliver, return, in that order, on all three CRI steps. The ack rides at the spine ball's
arrival plus a beat, never before it.

Ack-second is the defect to avoid: it reports `ExecSync` complete before the hook has been exec-ed
and `StopContainer` complete before SIGTERM has reached the process, so the answer arrives before
the thing it is answering.

The correct order is SHORTER, not longer, because the Pod pulse moves earlier: span 3280 against
durations of 3800, 3800 and 4000, measured with anim-dump. `poststart` rides the spine like the
other two; animating the top row alone draws Kubelet asking and the runtime answering while nothing
reaches the container the handler runs inside.
```

---

## workloads-init-containers-and-sidecars

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=255.
The five-row ladder is 200 tall against a 275..464 band of 189, eleven short, so the four-chip
column (160) takes the left band instead and the ladder keeps the right one.
The Node frame rests on the floor and the 828-wide Pod is centred in it, so the spine steps to
WL.SPINE_X at y=140 (clearing the chip column) and lands on the Pod's own top midpoint.
The top-row wire label belongs above the actor row: at WIRE_X on y=146 it sits across the spine's
step.
```

---

## workloads-job-parallelism

### layout

```
Layout C of the WL canon. Panel worst case x<=397, y<=280.
Five chips are 202 tall against a left band of 164, so they take a full-width bottom strip at
THREE per row (350.67; the widest value here needs 258). Two rows -> 548..624, short row centred.
All three workers react on every packet step, so the trunk (TOP1 midpoint -> WL.SPINE_X at y=140
-> bus at NODE_Y-12) taps into all three Pods and each step fires one ball per lane through the
card-local `fanOut` helper. The middle Pod centres exactly on WL.SPINE_X, so its lane skips the
bus point rather than drawing a zero-length segment.
POD_TOP_PAD is 24: the Pod row starts at x=84 and at a smaller pad the frame's own NODE-1 label is
drawn inside worker-1's shell.
Durations are 3500 / 2700 / 3500 / 2700, sized to the routes. `partial` is the exception at 2600,
span 2060, because it carries no down-balls at all (see its own note).
```

### before `[s.refs.pod1, s.refs.pod2, s.refs.pod3].forEach(p => pulsePod(p, ctx, 0));`

```
Up-arrow step: the workers act and the controller receives, so the three exits pulse at 0 and the
report leaves at `BEAT.afterPulse`. Worker-3 and its lane settle to `OPACITY.terminated` on the
same `BEAT.afterPulse`, so the tombstone shade lands with the exit that earned it.

Do not call `fanOut` here. It is the CREATE helper: its `LANE(i)` is built trunk-first from the
controller box bottom down to the Pod, so a step whose wire label reads `watch Pod exits` would
draw three creates. Nothing is created here, so nothing rides down.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
Replacement create travels controller -> Api -> Node. worker-3 already runs
its retry here at full opacity (the dim belonged to the previous step), all three
live Pods pulse together on arrival (parallelism=3).
```

---

## workloads-pod-image-pull

### layout

```
Layout C. Panel measured x<=397, y<=379 (worst of 1600/1440/1280/1100), which leaves no
column under it, so the pipeline keeps the right band 660..1140 (WL.CHIP_X / CHIP_W) and the
value chips form a two-across bottom strip, 532 wide, at y 548 and 590. Four across is 258 and
"container state" runs into "Waiting · ContainerCreating".

Kubelet is 420..780, centred on CX, so the lane leaves its bottom midpoint and drops down the
corridor left of the ladder, ending on the Pod at y 430 rather than on the Node frame edge
above it. The Registry is the narrower box (840..1100) because the cloud path has to wrap it:
the cloud is one hand-drawn path whose own centre is (685, 85) and it is placed by transform,
CLOUD_SCALE 1.05, instead of being redrawn. Straddling BOTH actor boxes reads as a rendering
fault.

The ladder starts at 176, not 150, because the scaled cloud reaches y 157.
```

---

## workloads-pod-phase-machine

### layout

```
Layout C and the tightest card in the catalog: the panel measures 397 x 504, more than three
quarters of the canvas height on the left, so the band below it is 136 units for everything
full width.

The pipeline is 660..1140 and status.phase is in the left column 60..540 at y 506. That is what
buys the corridor at x = SPINE_X (560): at 420..1140 with a full-width status strip, the lane runs
straight down through six ladder rows AND through the status.phase chip. It now drops clear of both
and ends on the Pod.

status.phase in the left column is also what keeps the CENTRE rule green: it is the only chip
left of CX, and without it the chip strip spans 660..1140 and centres on 900.

Node 546..624. A bottom edge at 640 falls on the viewBox edge and does not draw.
Pod 552..616, container 574..610: shorter than the family default and deliberately so, there
is no more room. A longer narration on any step invalidates PANEL_B: re-measure.
```

### before `const PHASE_FADE_MS = 700, PHASE_FADE_DELAY = 400;`

```
Phase transitions cross-fade the Pod opacity between states (0.35 dim / 0.7 / 1).
This is a state machine, not a materialize/dissolve, so it keeps its own fade timing
rather than the FADE tokens. The delay starts the cross-fade a beat into the step.
```

---

## workloads-pod-qos-classes

### layout

```
Layout C. Panel x<=397, y<=404. Pipeline 660..1140, chips two across at 548 and 590.

Every step that travels writes to all three Pods at once (classify, schedule, cgroups, evict),
so the lane is a trunk down x = CX into the Node frame, a bus at NODE_Y + 12 above the Pod row
and one tap per Pod. One ball per tap, each Pod pulsing on ITS OWN ball landing rather than on
a single shared arrival: the outer lanes are longer and the difference is the point.

The bus sits INSIDE the frame (NODE_Y + 12) rather than above it because that costs no vertical
space at all: the Pods simply start at NODE_Y + 34 instead of NODE_Y + 22. Above the frame it
costs 40 units this card does not have.
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
Kubelet's eviction travels down the connector to the node, the same Kubelet -> node delivery the
cgroups step uses, but this step does NOT reuse the shared fan: it sends A, then B a beat behind
it, and sends nothing at all to C. C gets no ball because it survives, and the narration says only
the kernel OOMKiller reaches it. The sequencing costs 627ms of duration (2600 -> 3400).

The order has to be carried by explicit delays, not left to the labels. The shared fan releases all
three at once and the three lanes are different lengths (684 units to slot 0 against 318 to the
middle), so Pod B, labelled evicted 2nd, lands a full 800ms BEFORE Pod A, labelled evicted 1st. A
drawing that asserts the opposite of its own labels is worse than one that stays quiet.
```

---

## workloads-probes

### layout

```
Layout A, and the Workloads exemplar, so this is the shape new workloads cards copy.

Panel x<=397, y<=255. Both columns start on one line at BAND_Y = PANEL_B + 21 = 276: the
pipeline in the LEFT column 60..540 (WL.LADDER_X / LADDER_W) and the five value chips stacked in
the RIGHT column 660..1140 (WL.CHIP_X / CHIP_W), 480 wide, 34 high, 8 apart. The Node frame
spans L..R at the bottom, 496..624.

The ladder does not go in WL.CHIP_X with the chips as a five-across bottom strip: at 205 wide the
whole left band under the panel is empty and three chip names overlap their values
("EndpointSlice" against "10.244.1.5 ready=false" by 60 units).

The lane runs down the corridor between the two columns at WL.SPINE_X and ends on the Pod top
midpoint at y 518, not on the Node frame edge. SPINE_UP is its reverse, so the report hop and
the probe hop cannot drift apart.

The gap between the actor row and BAND_Y is visible at wide viewports, where the panel is
shorter than its 1100 worst case. That is the unclamped-panel question, deferred by the author,
not a layout defect.
```

### before `pulsePodDim(s.refs.podGroup, ctx, 0);`

```
Startup passed but readiness has not, so the Pod is not Ready yet: it blinks
to its partial (not full) opacity and settles back to dim. Full opacity is
reserved for the ready step. Only after the blink does the packet leave.
```

---

## workloads-pvc-stickiness

### layout

```
Layout C, and the card with the worst chip damage in the catalog (11 collisions). Panel
x<=397, y<=330. Pipeline 660..1140, chips two across at 548 and 590.

The PV belongs in the GAP BETWEEN THE TWO NODE FRAMES, centred on CX at 530..670 x 412..512, and
the frames are narrowed to 440 each (60..500 and 700..1140) to make that gap. In the top row it
overlaps the Api box outright (850..990 against 700..920). Between the frames it is also what the
card is about: one disk, detached from Node-1 and attached to Node-2.

Lanes. One trunk, a bus split into a left and a right half so each half can be hidden with its own
tap, and one tap per Node landing on that Node's Pod. The trunk leaves TOP2_CX with a jog into the
corridor at y=140: both the eviction and the binding are API writes taking effect on a Node, and
the StatefulSet only ever POSTs to the API on the top row. Durations `evict` 2700 and `bind` 3200.
Balls must ride the drawn arrays; literal packet arrays that match no wire are the failure mode
here, and one of the previous pair ran out to x=1198, off the content band entirely.

The storage lane is PV_LANE, PV right face to web-0 on Node-2, and PV_MOUNT_A mirrors it on the
left as the mount web-0 already holds on Node-1. No ball rides PV_MOUNT_A, so it carries no
arrowhead. It must not be NODE2_LANE reversed: that is a control route wearing the storage colour.

setLanes pins each lane to 0 while the Pod it addresses is not on that Node, per the project rule
that an absent block dims but its lanes disappear. Without it the CSI lane claims the volume is
attached to Node-2 on the idle step, contradicting the narration.
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
The evict step sinks web-0 to OPACITY.terminating, which is the state its chip names first
('web-0 · Terminating, then removed'). The recreate step is where it leaves the slot: that is the
step whose narration has the object finally gone and a new one created under the same name.

Do not draw it out to 0 here. A chip naming two states over a drawing showing only the second is
the defect.
```

### before `const TAP_A = [[P_A_CX, BUS_Y], [P_A_CX, POD_Y]];`

```
`TAP_A` and `TAP_B` are both ridden, and a grep for the constant name will say otherwise.
`NODE1_LANE` and `NODE2_LANE` are `[...TRUNK, ...tap]`, so a ball on either covers its tap exactly.
Do not report them as lanes nobody rides. Same silhouette as the false finding on
cluster-architecture.
```

---

## workloads-replicaset

### layout

```
Layout B: the panel reaches y<=305, which leaves room under it for the four value chips but not
for the six-row pipeline, so the two columns SWAP. Chips left 60..540 from y 325, ladder right
660..1140 from y 150, Node frame full width 500..624.

The ReplicaSet box is 420..780, centred on CX, so the lane leaves its bottom midpoint and drops
between the columns. Four slots means four different addressees across the story (self-heal
targets web-b2, adopt / converge / orphan all target web-d4, and the ownership step addresses
all three live Pods), so the lane is a trunk plus a bus at NODE_Y + 12 plus one tap per slot,
and the ownership step sends one ball per Pod down its own tap.

Pods are 78 high here rather than the family 106: the six-row ladder and the chip column both
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
Layout C. Panel x<=397, y<=355. Pipeline 660..1140, chips two across at 548 and 590. Four across
is 258 and five strings collide, including "Pod B · OnFailure" against "Waiting (backoff)".

Kubelet is the first box, 420..780 centred on CX, and the Api is second. Kubelet is the node-facing
actor and the line down to the Node has to leave a box midpoint inside the corridor. With the two
swapped, `bouncePacket` leaves the Api while its own comment says "request up to the apiserver".

Nothing ever travels down to the Node on this card: restartPolicy is enforced in place and every
packet is a top-row hop. So the vertical line is a RELATIONSHIP, not a lane: it lands on the
Node frame top midpoint and carries no arrowhead, per the rule that a wire with no ball must not
wear one.
```


---

## workloads-rolling-update

### layout

```
Layout A. Panel x<=397, y<=205, the shallowest in the category, so both columns fit under it:
ladder left 60..540 from BAND_Y = 226, chips right 660..1140 from the same line, Node frame full
width 490..624.

The Deployment box is 420..780, centred on CX.

FOUR slots, and that is content rather than layout. maxSurge=1 means the rollout is transiently one
Pod ABOVE .spec.replicas, which the surge step says in words and counts in its chip as "4 Pods
alive". Three slots make the drawing contradict the card's own subject. The row is 4 x 234 wide at
201 / 467 / 733 / 999. The fourth slot is where the surge lands; each drain then frees a slot the
next v2 takes, and the row ends with its LEFTMOST slot empty because the surge capacity is given
back. Pods are named web-a1..web-d4 rather than by ordinal, because an ordinal implies an age order
the drawing never establishes while the narration says the controller picks the oldest.

No slot centre lands on CX, so every tap is a jog and none collapses to a straight drop. The trunk
does not start at CX either: it leaves the API at 990 and steps into the corridor. A cycle is TWO
events, a surge and a drain, which is what takes second-cycle to 6200 and third-cycle to 6800.

The wire label belongs above the actor row: at TOP_BOTTOM + 26 it overlaps the first ladder row.
```


### before `if (ctx.reduced) { ['pod2Box','pod3Box','pod4Box'].forEach(k => s.refs[k].classList.add('highlig`

```
The three live v2 Pods sit in slots 2, 3 and 4, not 1, 2 and 3: the surge capacity is released from
the LEFTMOST slot, so `setSlots(s, null, V2, V2, V2)` empties slot 1 on this step. Both the played
pulse list and the reduced highlight list follow the slot map, and both must be revisited if the
slot count or the released slot ever changes.

A stale pulse list is invisible to the gate. Carrying the three-slot list into four slots fires one
pulse on an invisible Pod while `pod4`, a Ready v2 Pod, never acknowledges the narration that calls
it Ready, and `check-reduced` still passes because the played and the reduced path are wrong
IDENTICALLY.
```

---

## workloads-statefulset-ordered-startup

### layout

```
Layout A. Panel x<=397, y<=255. Ladder left 60..540 from BAND_Y = 276, chips right 660..1140
from the same line, Node frame full width 496..624.

The headless Service hangs under the Api at 840..1140 x 152..232, joined by a vertical arrow
between the two face midpoints, and its wire label sits below it. In the actor row at 840..1060
against an Api at 700..920 the two boxes overlap by 80 units and so do their wire labels.

The StatefulSet box is 420..780, centred on CX. Three ordinals are created on three different
steps, so the lane is a trunk plus a bus at NODE_Y + 12 plus one tap per ordinal. The taps are
drawn on every step, but `setPods` pins each Pod itself to 0 until its ordinal is created, so on
idle the reader sees three empty slots the ladder is about to fill, and the ball that rides a tap
is what materializes that Pod.
```
### before `const SVC_LANE = [[SVC_CX, WL.TOP_BOTTOM], [SVC_CX, SVC_Y]];`

```
A ball rides this wire, one beat after the Pod pulses Ready, because registration follows
readiness. The wire is a `pathArrow` off this array so the ball and the lane cannot drift apart.
The Service is a receiver, so it lights on arrival rather than at step entry. Durations 4800 /
4000 / 4800.

The card names the headless-Service registration three times in narration, labels this wire for it
three times through `setWire(s, 'svc', ...)`, and draws it with an arrowhead. An arrowhead on a
wire no ball rides is the defect this closes.
```
