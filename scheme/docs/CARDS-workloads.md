# Scheme card design notes: workloads

Per-card design record moved out of `scheme/js/schemes/*.js`, where it had grown into
walls of prose above the code. Every comment block of three lines or more now lives here;
one and two line clarifications stayed next to the code they explain.

This file is NOT deployed. Three separate exclusions keep the whole `scheme/docs` directory out
of production and all three must hold: `.github/workflows/deploy.yml` runs
`rm -rf _site/scheme/tools _site/scheme/docs`, `.github/workflows/release.yml` lists
`"scheme/docs/*"` in the release zip's `-x` list, and `.dockerignore` lists `scheme/docs`. The
last one is not optional: `Dockerfile` is a blanket `COPY . .`, and this directory did serve at
`http://localhost:8080/scheme/docs/CARDS.md` until it was added there.

Each entry is anchored by the line of code that followed the block, so a note can be put
back beside its code when needed. The card files link here from a single pointer comment
under their imports.

Generated 2026-07-25 from 86 cards, 3987 lines relocated.

A second pass added the `### poster` subsections: the `POSTERS` map in `js/posters.js` is keyed by
card id, so each poster note sits under the card it draws. That moved 59 blocks, 459 lines. The
non-card scheme sources (catalog, kits, CSS) are in the sister file `INTERNALS.md`.

**READ THIS BEFORE TRUSTING A NOTE BELOW.** (Deliberately not a `##` heading: every `## ` in this
file is a card id, and tools parse it that way.)

**A note is a record of what was true when someone wrote it, not a live description of the code.**
Nothing verifies these entries, so check two things before you act on one.

1. **The narration safe-zone `x<=380, y<=300` was never a measurement, and no note below states it
   as fact any more.** Measured over 1600 / 1440 / 1280 / 1100, the panel's right edge is `x<=397`
   catalog-wide, and its BOTTOM is per card, from 171 to 504, changing with viewport width
   NON-monotonically. A note that justifies a placement by "clears y=300" proves nothing. On
   2026-07-27 the blanket appeared in 17 notes: 13 derived a placement from it and were corrected,
   and 4 named it and then gave their own per-viewport measurement. **Those 4 are the pattern to
   copy** (`storage-csi-architecture`, `storage-csi-attach-mount`, `storage-dynamic-provisioning`,
   `storage-pv-lifecycle-phases`). Re-measure with `node check-geometry.mjs --rules=occluded`, and
   read "The narration panel is measured per card" in `scheme/CLAUDE.md`.

   One correction there is worth knowing about because it is not cosmetic: `storage-volume-expansion`
   argued that its Kubelet at x=130 was safe because y=396 cleared the blanket `y<=300`. Since the
   real bottom is per card and reaches 504, that block is only safe while THIS card's panel stays
   above 396, so lengthening its narration can occlude it. The note now says so.
2. **A stale anchor means a stale note, so anchors are kept live.** Each entry is anchored by the
   line of code that followed it, so a note can be put back beside its code. On 2026-07-27, 62 of
   557 anchors had gone stale, almost all in cards the R5 relayout touched, and all 62 were resolved:
   43 re-anchored, 8 turned into `### opacity phases` topics after R4 replaced their constant with
   `OPACITY.*`, 10 stripped of an anchor that matched several identical lines, 1 deleted outright
   because the behaviour it described was removed. **Every anchor in this file now matches a real
   line.** A dead anchor never meant a worthless note: most carried reasoning (why a lane has no
   arrowhead, why an absent object is dimmed rather than hidden) that outlived its coordinates.

Two shapes here deliberately carry no anchor, and both are honest about it: `### opacity phases`,
whose constant no longer exists, and `### note (anchor dropped: ...)`, whose target line appears
more than once in the card so no anchor can name it.

The reverse case has no detector at all: a note whose anchor still matches while its prose went
stale. Only reading catches those, and 17 of them are named in point 1.

---

## workloads-container-states

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=230 over
1600/1440/1280/1100; a longer narration invalidates that number.
Layout A does not fit: the six-row ladder is 6*32+5*10 = 242 tall and the left band under the
panel is only 250..464 = 214. The four-chip column is 4*34+3*8 = 160 and does fit, so the chips
take the left band (60..540, w 480) and the ladder keeps the right one (660..1140).
The Node frame rests on the canvas floor (NODE_H 140, bottom 624) and the Pod is centred in it,
so the spine can run WL.SPINE_X straight into the Pod's top midpoint instead of stopping on the
frame edge above it. The chip strip that check-geometry measures is the union of the chip column
and the ladder rows (chainList rows carry .scheme-chip), so it still spans 60..1140 and CENTRE
passes without a full-width bottom strip.
```

---

## workloads-crashloopbackoff

### layout

```
Layout B of the WL canon, unchanged by the R5-a pass except for two defects it carried:
the spine stopped on the Node frame's top edge 22 units above the Pod, and the lower wire label
sat centred on WL.SPINE_X, so every step that set it was struck through by the lane. The spine
now ends on POD_Y and the label hangs off the side of the lane (anchor start at SPINE_X + 14).
Panel worst case x<=397, y<=205; the card reserves 225, which is deliberately conservative.
```

### before `},`

```
Kubelet only waits between attempts, nothing travels and the Pod is untouched.
The climbing backoff shows via the ladder filling and the static chip highlight
(no chip pulse).
```

### before `const SPINE = [[WL.SPINE_X, WL.TOP_BOTTOM], [WL.SPINE_X, POD_Y]];`

```
Review stage 2.4 family B listed the DOWN lane as an arrowhead nobody rides, shown on four of the six
steps. DECLINED 2026-07-30: on this card the absence of traffic down it IS the content. The three steps
that show it (`backoff-named`, `doubling`, `cap`) are the ones where Kubelet is HOLDING THE RESTART OFF,
which each narration says in words, and the restart it is holding is exactly what would travel down.
The crash itself goes UP and is animated on `first-crash` and `reset`. Drawing a ball down would say
the restart happened on the step whose subject is that it has not.

Same shape as `W_RET_WIPE` on storage-reclaim-policy, the other lane in the catalog whose emptiness is
the lesson.
```

---

## workloads-cronjob

### layout

```
Layout C of the WL canon. Panel worst case x<=397, y<=330 over 1600/1440/1280/1100.
Neither column fits: the left band under the panel is 350..464 and both the six-row ladder (242)
and the five-chip column (202) are taller, so the chips take a full-width bottom strip.
Chips go THREE per row, not the two the R5-a brief specifies: 5 chips at two per row is three
rows (118 tall) and that leaves the Node frame only 64 units between the ladder and the strip,
where the Pod alone is 106. Three per row is 350.67 wide, exactly the 350 floor, and the widest
value on this card needs 304. Two rows -> 548..624, short row centred on CX.
POD_PAD is 80 rather than the family 24: with the frame pulled up to 404 the pod row sits 20
below the frame's top edge, and at 24 the first Job slot would be drawn over the frame's own
NODE-1 label. 80 clears it, and the row still centres on CX by construction.
The trunk drops from the CronJob box at TOP1_CX with no jog (there is no left column to clear)
into a bus at NODE_Y-8, tapping into the two Job slots that ever receive a create.
```

### before `const ladderCaption = text({ class: 'scheme-label code dim', x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, 'text-anchor': 'middle' }, ['schedule ticks · every 5 min']);`

```
Schedule clock: one chip per 5-minute tick. The current tick is highlighted as time advances.
The caption is centred over the tick strip by derivation (TICK_X + TICK_SPAN / 2), not by a
literal: the ticks moved from x=830, where they ran straight through the pipeline ladder, into
the left band under the panel, and the caption followed for free.
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
Layout A technically fits (the five-row ladder is 200 against a 214 band) but leaves only ~14
units between the ladder's bottom and the Node row for the lane bus, so the mirrored layout wins:
the four-chip column is 160 tall and leaves 74.
Four Node frames rest on the canvas floor (484..624). The old single lane landed on Node-1's top
edge on EVERY step, including the step that adds a Pod to Node-4 and the step that deletes the
Pod on Node-2. It is now a trunk into a bus at NODE_Y-24 with one tap per Pod, and each step
routes its ball down the tap of the Pod that actually reacts (the create step fires three, one
per matching Node). Wire and ball are the same LANE(i) array.
A lane into a Node that is not in the cluster is pinned to 0: lane 3 until Node-4 joins, lane 1
once Node-2 leaves.
The trunk leaves TOP1's bottom midpoint and steps to WL.SPINE_X at y=140, because a straight
drop at 530 would cut through the chip column (60..540). The top-row wire label moved above the
actor row for the same reason: centred at WIRE_X on y=146 it sat on the lane.
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
The step says the controller sees three matching Nodes and ZERO Pods, and the Pods do not fade in
until their creates land about 2s later. Both counters read `3` from step entry, `numberReady` being
the worse half: it reached three before a single Pod was drawn.

Counted per arrival rather than turned over once at the end, because the narration is `creates one
Pod on each` and the card draws three separate creates: the count climbing 0-1-2-3 alongside the
three Pods appearing IS the step. `3` stays pinned above the guard for the reduced contract.
```

---

## workloads-deployment-rollback

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=230.
The six-row ladder (242) does not fit the 250..464 band, the four-chip column (160) does.
Only the surging Pod ever receives a ball, so there is ONE lane: trunk from TOP1's bottom midpoint,
step to WL.SPINE_X at y=140 to clear the chip column, drop to a bus at NODE_Y-24 and tap down into it.
Drawing taps into the other slots as well would put an arrowhead on a lane no ball ever rides, which
the canon forbids.

**FOUR slots since 2026-07-30** (review stage 2.4 family G), so that Pod is web-d4 at centre 999 and
the lane taps there, not into the leftmost slot. Every step of this card pins RS-v1 at 3 / 3 and the
wedged step says RS-v1 keeps ALL THREE v1.0 Pods serving, so the three v1 Pods have to be drawn at
once. With three slots the broken v2 stood in one of their places and the row showed two survivors
against a chip saying three. The fourth slot now carries the whole v2 story on its own: it appears on
the rollout, crash-loops, wedges, and is DELETED by the undo rather than converted back into a v1,
which is what the undo step narrates. Row is 4 x 234 at 201 / 467 / 733 / 999, Pods named web-a1..d4.
Raising the geometry lengthened the route: steps 1, 2 and 4 went over budget and their durations
went 3100/2400/3100 -> 3700/2900/3700. Motion untouched.
```

### poster

```
Revision history with a rollback: rev 1 (good) and rev 3 (restored copy of rev 1) carry the
same version bar, rev 2 (bad) is dimmed and struck out, and a solid counter-clockwise undo
arc sweeps from the current revision back over the bad one to the good revision.
```

### before `'aria-label': 'Deployment rollback and revision history: a bad rollout stalls past progressDeadl`

```
The aria-label ends on RS-v2 going to zero rather than on RS-v1 coming back up, because on this card
RS-v1 is never scaled below three: its chip reads `3 / 3` on all six steps, chain row 5 says
`RS-v2 to 0, RS-v1 kept`, and two steps are spent establishing that maxUnavailable kept the old Pods
serving. The earlier wording, `scales the previous ReplicaSet back up`, described a rollback this card
deliberately does not draw, and it survived every check because no tool compares an aria-label with
the steps underneath it.
```

---

## workloads-force-deletion

### layout

```
Layout B of the WL canon (chips left, pipeline right). Panel worst case x<=397, y<=280.
Two Node frames (60..580 and 620..1140) rest near the floor at NODE_H 134, so their Pods centre
on 320 and 880, mirrored about CX. That is what lets ONE trunk serve both: it leaves the API
box's bottom midpoint (both node-band actions on this card are control-plane actions issued
through the API), steps to WL.SPINE_X at y=140, drops to a bus at NODE_Y-15 and taps left and
right into the two Pods. NODE_H is 134 rather than 140 to open that 15 unit corridor between the
chip column's bottom (460) and the frames.
Two stale packet routes were removed here. `recreationPacket` ran [700,120] -> [1198,185] ->
[975,480] and `node1Packet` ran [680,120] -> [280,185] -> [320,550]: both were left over from the
pre-relayout gutter, neither followed any drawn wire, and one of them left the content band
entirely at x=1198. Both now take NODE1_LANE / NODE2_LANE, the same arrays the wires are built
from.
The old NODE2_LANE also ran straight down x=810 through the pipeline ladder rows.
```

---

### before `setPods(s, OPACITY.notready, 1);`

```
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). The risk step used to leave Pod A at
OPACITY.terminated, the shade for gone, while its own chips read 'maybe still running' and
'identity live twice'. That drew the API server's belief instead of the card's subject, and the
subject of this card is that the API server is wrong: force-delete dropped the object without any
Kubelet acknowledgement, so on a merely partitioned Node the container keeps running.

It rises to OPACITY.notready here instead, which is the vocabulary entry for alive but not serving
and not observed, and the rise itself is the step: the previous step drew the object dropped from
ETCD, this one puts the process back on screen next to the replacement that now shares its
identity. This is the only card in the catalog where a Pod comes back UP the vocabulary, and it is
deliberate rather than a missed fade.
```

---

## workloads-graceful-shutdown

### layout

```
Layout C of the WL canon. Panel worst case x<=397, y<=280.
The six-row ladder plus five chips leaves no band deep enough for a column (the left band is
300..464 = 164, the chip column is 202), so the chips take a full-width bottom strip at THREE per
row (350.67, the floor; the widest value here needs 279). Two rows -> 548..624, short row centred.
The ladder moved up to y=140 so the Node frame can be 394..528 with the Pod 20 below its top
edge: at the previous 412/116 the frame's top border ran 5 units above the Pod's, which reads as
a rendering slip rather than as a frame.
The connector was [[690,120],[690,185],[280,185],[280,550],[320,550]], a leftover of the 320
gutter: it clipped the ladder's first row at y=185 and ended at x=320 inside the Node frame,
pointing at blank canvas 50 units left of the Pod. It is now TOP2 midpoint -> WL.SPINE_X at
y=140 -> straight into the Pod's top midpoint, and the return lane is its reverse.

**It left TOP1, kubectl, until 2026-07-30** (review stage 2.4 family C). The termination order is what
the API sets in motion once it has stamped deletionTimestamp, and on the last step the report climbed
back to a ball landing under kubectl while `lightBoxAt` lit the API. Moving it to the API cost 311ms
per ball, which both steps had headroom for.
Layout C leaves the left band above the Node frame empty at wide viewports. That is unavoidable
while the narration panel is not clamped in CSS.
```

---

## workloads-hooks

### layout

```
Layout C of the WL canon, and the tightest card in the category: the panel reaches y<=379, the
deepest in Workloads after the pod-* cards. Nothing fits beside it (the left band is 399..464).
Chips take a full-width bottom strip at THREE per row (350.67; the widest value here needs 269).
Two per row, as the R5-a brief specifies, would be three rows and would leave the Node frame 64
units where the Pod alone is 106.
The ladder moved up to y=140 so the frame can be 394..528 with the Pod 20 below its top edge.
The spine steps from TOP2's bottom midpoint to WL.SPINE_X at y=140 and ends on the Pod's top
midpoint rather than on the frame edge.

**It left TOP1, Kubelet, until 2026-07-30** (review stage 2.4 family C). Kubelet is a CRI CLIENT and
never touches a container: the runtime execs the hook and delivers the signal, which both steps that
ride this lane say in their own wire label (`CRI ExecSync · preStop · Sync` and
`CRI StopContainer · SIGTERM · ACK`). Cost 311ms per ball, both steps had the headroom.
The ExecSync ack rode `segmentPacket from [580,95] to [540,95]` on five steps: both x values sit
INSIDE the Kubelet box (420..640), so the ball slid across the box instead of down the drawn
return arrow. It now runs TOP2_X -> TOP1_X+TOP1_W at RESP_Y, which is that arrow.
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
arrival plus a beat, never before it. Until 2026-07-30 the ack was second, so the runtime reported
`ExecSync` complete before the hook had been exec-ed and reported `StopContainer` complete before
SIGTERM had reached the process: the answer arrived before the thing it was answering.

The reorder makes the steps SHORTER, not longer, because the Pod pulse moved earlier. Span 3280
against durations of 3800, 3800 and 4000, measured with anim-dump. `poststart` gained the spine ride
it never had at all (it animated the top row only, drawing Kubelet asking and the runtime answering
while nothing reached the container the handler runs inside) and rose 2100 to 3800 to match.
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
The top-row wire label moved above the actor row: at WIRE_X on y=146 it sat across the spine's
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
POD_TOP_PAD is 24: the Pod row starts at x=84 and at a smaller pad the frame's own NODE-1 label
would be drawn inside worker-1's shell.
Longer routes pushed all four motion steps over budget: 3100/2400/3100/2400 -> 3500/2700/3500/
2700. Motion untouched.

**`partial` is 2600 since the second-eyes pass of 2026-07-30**, not the 2700 above and not the 3100
that family B briefly set. Family B added the watch event the wire label names (`watch Pod exits`)
and left `fanOut` in place beneath it, so three balls still flew DOWN from the controller into the
workers on the step whose whole subject is those workers exiting. The down-balls are gone, the three
exits are pulses at 0, and the watch leaves at `BEAT.afterPulse`. Span 2060.
```

### before `[s.refs.pod1, s.refs.pod2, s.refs.pod3].forEach(p => pulsePod(p, ctx, 0));`

```
Up-arrow step: the workers act and the controller receives, so the three exits pulse at 0 and the
report leaves at `BEAT.afterPulse`. This used to call `fanOut`, which is the CREATE helper: its
`LANE(i)` is built trunk-first from the controller box bottom down to the Pod, so the step whose
wire label reads `watch Pod exits` was drawing three creates. Nothing is created here, so nothing
rides down. Worker-3 and its lane settle to `OPACITY.terminated` on the same `BEAT.afterPulse`, so
the tombstone shade lands with the exit that earned it rather than with a ball that no longer flies.
```

### note (anchor dropped: `const req = topPacket(s, ctx);` is not unique in the file)

```
Replacement create travels controller -> Api -> Node. worker-3 already runs
its retry here at full opacity (the dim belonged to the previous step), all three
live Pods pulse together on arrival (parallelism=3).
```

---

## workloads-pod-image-pull

### layout (R5-a, 2026-07-27)

```
Layout C. Panel measured x<=397, y<=379 (worst of 1600/1440/1280/1100), which leaves no
column under it, so the pipeline keeps the right band 660..1140 (WL.CHIP_X / CHIP_W) and the
value chips form a two-across bottom strip, 532 wide, at y 548 and 590. Four across was 258
and "container state" ran into "Waiting · ContainerCreating".

Kubelet is 420..780, centred on CX, so the lane leaves its bottom midpoint and drops down the
corridor left of the ladder, ending on the Pod at y 430 rather than on the Node frame edge
above it. The Registry is the narrower box (840..1100) because the cloud path has to wrap it:
the cloud is one hand-drawn path whose own centre is (685, 85) and it is placed by transform,
CLOUD_SCALE 1.05, instead of being redrawn. Before this it straddled BOTH actor boxes, which
read as a rendering fault.

The ladder starts at 176, not 150, because the scaled cloud reaches y 157.
```

---

## workloads-pod-phase-machine

### layout (R5-a, 2026-07-27)

```
Layout C and the tightest card in the catalog: the panel measures 397 x 504, more than three
quarters of the canvas height on the left, so the band below it is 136 units for everything
full width.

The pipeline moved from 420..1140 to 660..1140 and status.phase moved from a full-width strip
to the left column 60..540 at y 506. That is what buys the corridor at x = SPINE_X (560): the
lane used to run straight down through six ladder rows AND through the status.phase chip. It
now drops clear of both and ends on the Pod.

status.phase in the left column is also what keeps the CENTRE rule green: it is the only chip
left of CX, and without it the chip strip would span 660..1140 and centre on 900.

Node 546..624 (was 546..640, whose bottom edge fell on the viewBox edge and did not draw).
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

### layout (R5-a, 2026-07-27)

```
Layout C. Panel x<=397, y<=404. Pipeline 660..1140, chips two across at 548 and 590.

Every step that travels writes to all three Pods at once (classify, schedule, cgroups, evict),
so the lane is a trunk down x = CX into the Node frame, a bus at NODE_Y + 12 above the Pod row
and one tap per Pod. One ball per tap, each Pod pulsing on ITS OWN ball landing rather than on
a single shared arrival: the outer lanes are longer and the difference is the point.

The bus sits INSIDE the frame (NODE_Y + 12) rather than above it because that costs no vertical
space at all: the Pods simply start at NODE_Y + 34 instead of NODE_Y + 22. Above the frame it
would have cost 40 units this card does not have.
```

### before `const kubelet   = box({ x: TOP1_X, y: WL.TOP_Y, w: TOP1_W, h: WL.BOX_H, label: 'Kubelet',   sublabel: 'cgroups + eviction',            role: 'cluster' });`

```
Kubelet is the node-facing actor (places Pods after binding, writes cgroups, evicts), so it
sits on the left where the connector to the node is anchored, matching the other controller
cards (left actor → node, Api on the right). Every connector packet leaves Kubelet.
```

### before `s.refs.pod1.style.opacity = String(OPACITY.terminating);`

```
QoS eviction: BestEffort and Burstable (A, B) are evicted and dim together by the same
amount, Guaranteed (C) survives at full opacity. Pin the final state inline for cancel-safety.
```

### before `const evictA = routePacket(s, ctx, LANE(0), { role: 'workloads' });`

```
Kubelet's eviction travels down the connector to the node, the same Kubelet → node delivery the
cgroups step uses, but this step does NOT reuse the shared fan: it sends A, then B a beat behind it,
and sends nothing at all to C.

This supersedes the note that stood here until 2026-07-30, which said the 1st/2nd order was conveyed
by the sublabels and not by timing. The trouble was that the timing was not neutral: the shared fan
released all three at once and the three lanes are different lengths (684 units to slot 0 against 318
to the middle), so Pod B, labelled evicted 2nd, landed a full 800ms BEFORE Pod A, labelled evicted
1st. A drawing that asserts the opposite of its own labels is worse than one that stays quiet, so the
order is now carried by explicit delays as well, which is what review stage 2.4 family H asks for.

C gets no ball because it survives, and the narration says only the kernel OOMKiller reaches it. The
step cost 627ms of duration for the sequencing (2600 -> 3400).
```

---

## workloads-probes

### layout (R5-a, 2026-07-27)

```
Layout A, and the Workloads exemplar, so this is the shape new workloads cards copy.

Panel x<=397, y<=255. Both columns start on one line at BAND_Y = PANEL_B + 21 = 276: the
pipeline in the LEFT column 60..540 (WL.LADDER_X / LADDER_W) and the five value chips stacked in
the RIGHT column 660..1140 (WL.CHIP_X / CHIP_W), 480 wide, 34 high, 8 apart. The Node frame
spans L..R at the bottom, 496..624.

Before this the ladder was in WL.CHIP_X and the chips were a five-across bottom strip 205 wide,
which left the whole left band empty under the panel and overlapped three chip names with their
values ("EndpointSlice" against "10.244.1.5 ready=false" by 60 units).

The lane runs down the corridor between the two columns at WL.SPINE_X and ends on the Pod top
midpoint at y 518, not on the Node frame edge. SPINE_UP is its reverse, so the report hop and
the probe hop cannot drift apart.

The gap between the actor row and BAND_Y is visible at wide viewports, where the panel is
shorter than its 1100 worst case. That is the unclamped-panel question the customer deferred,
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

### layout (R5-a, 2026-07-27)

```
Layout C, and the card with the worst chip damage in the catalog (11 collisions). Panel
x<=397, y<=330. Pipeline 660..1140, chips two across at 548 and 590.

The PV moved from the top row into the GAP BETWEEN THE TWO NODE FRAMES, centred on CX at
530..670 x 412..512. In the top row it overlapped the Api box outright (850..990 against
700..920). Between the frames it is also what the card is about: one disk, detached from Node-1
and attached to Node-2. The frames narrowed to 440 each (60..500 and 700..1140) to make the gap.

Lanes, all of them rebuilt, because the packets and the wires had drifted apart:
  the control lanes were DRAWN from NODE1_LANE / NODE2_LANE but the BALLS flew literal arrays
  ([[800,80],[815,80],[815,460],[975,460],[975,480]] and a route out to x=1198, off the content
  band entirely) that matched no wire on the card. Now one trunk, a bus split into a left and a
  right half so each half can be hidden with its own tap, and one tap per Node landing on that Node
  Pod. The trunk left TOP1_CX until 2026-07-30 and now leaves TOP2_CX with a jog into the corridor at
  y=140 (review stage 2.4 family C): both the eviction and the binding are API writes taking effect on
  a Node, and the StatefulSet only ever POSTs to the API on the top row. Cost: `evict` 2300 -> 2700 and
  `bind` 2600 -> 3200.
  the storage lane called pvConnector was RETURN_LANE, which is NODE2_LANE reversed: a control
  route wearing the storage colour, and its comment described a route down the right margin that
  the code did not draw. It is now PV_LANE, PV right face to web-0 on Node-2, and PV_MOUNT_A
  mirrors it on the left as the mount web-0 already holds on Node-1 (no ball ever rides that
  one, so it carries no arrowhead).

setLanes pins each lane to 0 while the Pod it addresses is not on that Node, per the project
rule that an absent block dims but its lanes disappear. Without it the CSI lane claimed the
volume was attached to Node-2 on the idle step, contradicting the narration.
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
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). The evict step drew web-0 out to 0
under a chip reading 'web-0 · Terminating, then removed', which is a chip naming two states and a
drawing showing only the second. The Pod now sinks to OPACITY.terminating on this step, which is
the state the chip names first, and the recreate step is where it leaves the slot: that is the
step whose narration has the object finally gone and a new one created under the same name.
```

### before `const TAP_A = [[P_A_CX, BUS_Y], [P_A_CX, POD_Y]];`

```
Review stage 2.4 family B listed `TAP_A` and `TAP_B` as lanes nobody rides. FALSE, snapped 2026-07-30:
both taps ARE ridden. `NODE1_LANE` and `NODE2_LANE` are `[...TRUNK, ...tap]`, so a ball on either
covers its tap exactly, and only a grep for the constant name could miss it. Same silhouette as the
false finding on cluster-architecture.
```

---

## workloads-replicaset

### layout (R5-a, 2026-07-27)

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

### layout (R5-a, 2026-07-27)

```
Layout C. Panel x<=397, y<=355. Pipeline 660..1140, chips two across at 548 and 590 (four
across was 258 and five strings collided, including "Pod B · OnFailure" against
"Waiting (backoff)").

Kubelet and the Api SWAPPED places. Kubelet is now the first box, 420..780 centred on CX,
because it is the node-facing actor and the line down to the Node has to leave a box midpoint
inside the corridor. The swap also fixes bouncePacket, whose comment said "request up to the
apiserver" while the request was actually leaving it.

Nothing ever travels down to the Node on this card: restartPolicy is enforced in place and every
packet is a top-row hop. So the vertical line is a RELATIONSHIP, not a lane: it lands on the
Node frame top midpoint and carries no arrowhead, per the rule that a wire with no ball must not
wear one.
```


---

## workloads-rolling-update

### layout (R5-a, 2026-07-27)

```
Layout A. Panel x<=397, y<=205, the shallowest in the batch, so both columns fit under it:
ladder left 60..540 from BAND_Y = 226, chips right 660..1140 from the same line, Node frame full
width 490..624.

The Deployment box is 420..780, centred on CX.

**FOUR slots since 2026-07-30, and that is content rather than layout** (review stage 2.4 family G).
maxSurge=1 means the rollout is transiently one Pod ABOVE .spec.replicas, which the surge step says in
words and counts in its chip as "4 Pods alive". Three slots made the drawing contradict the card's own
subject, so the row is 4 x 234 wide at 201 / 467 / 733 / 999. The fourth slot is where the surge lands;
each drain then frees a slot the next v2 takes, and the row ends with its LEFTMOST slot empty because
the surge capacity is given back. Pods are named web-a1..web-d4 rather than by ordinal, because an
ordinal implies an age order the drawing never establishes while the narration says the controller
picks the oldest.

Two claims that stood here until then and are now false, kept as a warning: there were three slots, and
LANE(1) collapsed to a straight drop because slot 1 sat on CX. With four slots no centre lands on CX,
so every tap is a jog, and the trunk no longer starts at CX either (it leaves the API at 990 and steps
into the corridor, review stage 2.4 family C). A cycle is now TWO events, a surge and a drain, where
the three-slot version could only draw one, which is what took second-cycle to 6200 and third-cycle to
6800.

The wire label moved from below the actor row to above it: at TOP_BOTTOM + 26 it was overlapping
the first ladder row.
```


### before `if (ctx.reduced) { ['pod2Box','pod3Box','pod4Box'].forEach(k => s.refs[k].classList.add('highlig`

```
Second-eyes pass, 2026-07-30. The three live v2 Pods sit in slots 2, 3 and 4, not 1, 2 and 3: the
surge capacity is released from the LEFTMOST slot, so `setSlots(s, null, V2, V2, V2)` empties slot 1
on this step. The relayout from three slots to four kept the old pulse list, so one pulse fired on an
invisible Pod while `pod4`, a Ready v2 Pod, never acknowledged the narration that calls it Ready.
Both the played list and the reduced highlight list follow the slot map, and both must be revisited
if the slot count or the released slot ever changes.

This is the defect the relayout introduced and no check could see: the played and the reduced path
were wrong IDENTICALLY, which is exactly the condition under which `check-reduced` passes.
```

---

## workloads-statefulset-ordered-startup

### layout (R5-a, 2026-07-27)

```
Layout A. Panel x<=397, y<=255. Ladder left 60..540 from BAND_Y = 276, chips right 660..1140
from the same line, Node frame full width 496..624.

The headless Service moved OUT of the actor row and now hangs under the Api at 840..1140 x
152..232, joined by a vertical arrow between the two face midpoints. In the row it was at
840..1060 against an Api at 700..920: the two boxes overlapped by 80 units and their wire labels
overlapped too. Its wire label moved to below it for the same reason.

The StatefulSet box is 420..780, centred on CX. Three ordinals are created on three different
steps, so the lane is a trunk plus a bus at NODE_Y + 12 plus one tap per ordinal. The taps are
drawn on every step, but `setPods` pins each Pod itself to 0 until its ordinal is created, so on
idle the reader sees three empty slots the ladder is about to fill, and the ball that rides a tap
is what materializes that Pod.
```
### before `const SVC_LANE = [[SVC_CX, WL.TOP_BOTTOM], [SVC_CX, SVC_Y]];`

```
The card names the headless-Service registration three times in narration, labels this wire for it
three times through `setWire(s, 'svc', ...)`, and drew it with an arrowhead, and no ball had ever
ridden it on any of the five steps.

It rides now, one beat after the Pod pulses Ready, because registration follows readiness. The wire
became a `pathArrow` off this array so the ball and the lane cannot drift apart. The Service is a
receiver now, so it lights on arrival rather than at step entry. Durations rose to 4800 / 4000 / 4800.
```
