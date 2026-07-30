# Scheme card design notes

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

## cluster-admission-webhooks

### layout

Written 2026-07-27, when a check found this card had no design record at all. The card was never
part of an R5 relayout because it already reported zero on all six geometry rules, which is exactly
why the record was missing: nothing forced anyone to write it down.

The shape is the L read correctly. The narration panel owns the top-left corner, so the API row
starts at `API_X = 420` and the request from `kubectl` cannot come in from the left at that height.
Instead `kubectl` sits in the freed BOTTOM-left at `60..300 x 300..380` and its request climbs a
riser at `RISER_X = 412` (15 units clear of the panel edge at 397) before turning into the API's left
face. That is the storage grammar borrowed into a cluster card, and it is what lets the content still
span `CONTENT_L..CONTENT_R` and centre on `CX = 600` without anything being stretched to make it.

| constant | value | derived from |
|---|---|---|
| `CONTENT_L` / `CONTENT_R` | 60 / 1140 | the shared content band, `M = 60` off each edge |
| `CX` | 600 | `(CONTENT_L + CONTENT_R) / 2`, not a chosen number |
| `API_X` | 420 | first multiple of 20 clear of the panel's measured right edge (397) |
| `RISER_X` | 412 | 15 clear of the panel, 8 left of the API face it feeds |
| `ETCD_X` | 1000 | `CONTENT_R - ETCD_W`, so the row ends flush with the band |
| `LADDER_X` / `LADDER_W` | 420 / 400 | the pipeline hangs under the API and inherits its width, so the six admission stages read as belonging to it |
| `CHIP_W` | 530 | `(CONTENT_R - CONTENT_L - CHIP_GAP) / 2`, two chips spanning the band, so the strip centres on CX by construction |

**The header comment understates the panel and is left as it stands.** It records
`x<=397, y<=195` measured over 1600/1440/1280/1100, and the code then reserves `PANEL_B = 215`. The
real worst case over the viewport set `check-geometry` actually judges against
(1600x1000, 1280x860, 1100x800) is **205**. The card is safe either way, because the 215 it reserves
is above the true 205 and every block clears it, but the two numbers in the file disagree with each
other and neither is the measured one. See the note in `scheme/CLAUDE.md` on measuring the panel per
card and never on one viewport: the widths-only sampling that produced 195 is the same failure that
put three storage cards' blocks under their own panels.

**Why the chips are two across and not four.** The longest value on this card is
`{cpu=100m, runAsNonRoot=true}` on the `Pod object` chip. At 530 it clears its name comfortably; at
the four-across width of 258 that the 2026-07-27 relayout used elsewhere it would overlap, which is
the defect `check-chipfit` was written for. Two across is the floor for this card, not a preference.

## cluster-api-structure

### layout (R5-a, 2026-07-27)

```
The two ETCD lanes used to drop at ETCD_CX +/- 12 from the top row, which ran both risers
straight down through all three state chips. They now leave the API on its right face, run down
the corridor between the Informer column and the chip column (RISER_OUT_X 764, RISER_BACK_X 740,
out to the RIGHT of back so the two never cross) and enter ETCD on its LEFT face at
ETCD_CY -/+ 12. The watch wire label moved to the left of the watch arrow (anchor end at x=580)
to clear that corridor. Chips stay at 840..1140: the chip strip pools with the GVR ladder at
60..360 and the event slots, and moving the column left is what breaks CENTRE.
```

The 5 findings check-chipfit reported here were all FALSE: `eventSlot` draws two STACKED texts
(type over sub-line), not a name/value pair. `check-chipfit.mjs` now skips chips whose two texts
sit on different baselines.

---

### before `const gvr = chainList({`

```
Left: the GVR catalogue the Api serves. Same 32px row height / 38px pitch as the chips on
the right, and its first THREE rows (the built-ins, always visible) are centred on the
Informer exactly like the 3 chips — rows at y=217/255/293, midpoint cy=271. The 4th row
(the CRD, hidden until the crd step) then falls below at y=331. Sits a symmetric 110px off
the Informer's left edge (mirror of the chips' 110px off its right edge).
```

### before `const streamLabel = text({ class: 'scheme-label dim code', x: CX, y: STREAM_LABEL_Y, 'text-anchor': 'middle' }, ['watch event stream (resourceVersion grows)']);`

```
Bottom: watch event stream timeline, centred under the spine. The label is centred on
cx=600 — the midpoint of the four slots (290..910) and the Indexer above them. It is
hidden until the ADDED slots appear and tracks their visibility from then on.
```

### before `const read    = routePacket(s, ctx, ETCD_TO_API, { role: 'cluster' });`

```
The LIST result takes the same downward journey the watch event does: ETCD -> Api (the
snapshot read), Api -> Informer (the full set), Informer -> Indexer (fills the cache). The
informer firing the LIST is implied by it lighting up as the recipient.
```

### before `s.refs.slots.slice(0, 3).forEach((slot, i) => {`

```
The three LIST items land on the timeline once the set has reached the Indexer. Staggered
durations are deliberate: the items appear one after another. fill:'both' back-fills opacity
0 through the flight so the slots stay hidden until then.
```

### before `ctx.register(fourth.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE.in, delay: toCache.arrivalMs, f`

```
The slot only lands once the ball has finished its whole journey into the Indexer.
fill:'both' back-fills opacity 0 through the flight so it stays hidden until then (no
flicker), inline 1 is the cancel/reduced final.
```

---

## cluster-apply-flow

### layout (R5-a, 2026-07-27)

```
The four top-row lanes were still drawn from the pre-relayout literals (400..490 and 710..900 at
y=110/130), so the kubectl lane sat inside the kubectl block and the ETCD lane inside the API
block, while the balls flew POST / POST_ACK / PERSIST / PERSIST_ACK (550..610, 830..950) over
blank canvas. All four are now drawn with pathArrow from those same arrays, and the Kubelet-to-Pod
arrow from START. The two long top wire labels moved above the row (WIRE_TOP_Y = TOP_Y - 20):
their gaps are 60 and 120 units wide and the strings are three times that.
```

---

### before `const client = box({ x: KCTL_X, y: TOP_Y, w: KCTL_W, h: TOP_H, label: 'kubectl',   role: 'cluster' });`

```
Top row: Kubectl (left) -> Api (centre, x-centre 600) <-> ETCD (top-right). Kubectl is the
narrow 130x80 box used in the Delete Flow card; its right edge stays at x=400 so the
Kubectl<->Api lanes and packets are unchanged. The flanking blocks are pulled in toward the
Api spine to keep the row compact and symmetric about the centre.
```

### before `root.appendChild(pathArrow({ points: POST,        dim: true, dashed: true, role: 'cluster' }));`

```
Scheduler -> Api return lane (the Binding POST). Nested inside-and-below the watch-pickup
arrow (exits left of its centre entry, lower lane y=220) so the two never cross, the same
out/back layout the Control Plane Architecture card uses.
```

### before `const wirePost          = text({ class: 'scheme-label code dim', x: (KCTL_R + API_X) / 2, y: WIRE_TOP_Y,  'text-anchor': 'middle' }, [' ']);`

```
POST is the one long label, so it rides above the top row (y=68, a small gap above the box
tops at y=80). Its midpoint sits on the Kubectl->Api arrows (gap centre x=445) so the line is
centred over the wire it describes.
```

### before `ctx.register(s.refs.kubeletPodArrow.animate(`

```
The arrow and the Pod fade in together in their resting outline; the pulse waits
for the start-container packet to land (the Pod lives inside Node-1, so it keeps
the pod pulse).
```

### before `pulsePod(s.refs.placedPod, ctx, start.arrivalMs);`

```
The whole Pod pulses once when the start-container packet lands: the shell AND the inner
box brighten together and both ease straight back to their normal outline, in sync, the
same way a workloads Pod pulses. Nothing is left pinned bright afterwards.
```

### poster

```
Apply = creation flow: a manifest (deploy.yaml) travels through the control plane and
materialises as a running Pod. Mirror of the Delete Flow poster: the fills rise left to
right (doc 0.04 -> box 0.05 -> Pod 0.06 / container 0.10) as the object comes alive.
```

---

## cluster-architecture

### before `root.appendChild(pathArrow({ points: TO_CM, dim: true, dashed: true, role: 'cluster' }));`

```
ControllerManager + Scheduler each get a parallel arrow PAIR (like the ETCD
write/read lanes): watch event in (Api -> block, upper lane) and the
reconcile / Binding write-back out (block -> Api, lower lane).
```

**Review stage 2.4 family B listed all four of these as lanes nobody rides. FALSE, snapped 2026-07-30.**
Every one of them carries a ball: the `controllers` and `scheduler` steps send two each. A grep for the
constant name could not see it, because the routes were written as literals at the call site and the
numbers were verified identical to these arrays, to the unit. What the finding did surface is a real
defect of a different family: seven inline literal routes duplicating named arrays, the same shape that
reopened on cluster-delete-flow. All seven now ride the arrays, and anim-dump gives byte-identical spans
before and after.

---

## cluster-delete-flow

### layout (R5-a, 2026-07-27)

```
Same defect as the sibling Apply Flow card: the four top-row lanes were drawn from stale literals
(260..390 and 610..750), so one pair floated under the narration panel pointing at nothing and the
other sat inside the API block, while DELETE / DELETE_ACK / PERSIST / PERSIST_ACK carried the
balls. All four are drawn from those arrays now, STOP_POD feeds the Kubelet-to-Pod arrow, and the
delete + persist wire labels moved above the row (WIRE_TOP_Y = TOP_Y - 20).
```

---

### before `const etcd = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });`

```
ETCD narrowed to w=130 (was 140) so the label is not lost in a squat-wide cylinder and the
two control-plane cards match. Top/height unchanged (y=50, h=100) so its centre stays level
with the Api row (y=100) and the top wire labels keep their clearance above the cap.
```

### before `root.appendChild(pathArrow({ points: DELETE,      dim: true, dashed: true, role: 'cluster' }));`

```
GarbageCollector DELETEs back up to the Api. Nested inside-and-below the event arrow (exits
GC top left of the centre entry, lower lane y=220) so the two never cross, the same out/back
layout the Control Plane Architecture card uses.
```

### poster

```
Delete = teardown flow, the mirror of the Apply Flow poster: the SAME running Pod that apply
builds (solid shell + container) starts on the left, is walked through the control plane, and
is erased, so the matching Pod shell on the right is dashed, empty and struck through (the
record leaving ETCD). Fills fall left to right (Pod 0.06 / 0.10 -> box 0.05 -> gone), the
exact inverse of Apply.
```

---

## cluster-etcd-raft

### layout

Written 2026-07-27 together with the vertical rebalance. The card was never part of an R5 pass
because it reported zero on all six geometry rules before and after, which is precisely why nobody
had looked at it: **`check-geometry` judges the horizontal centre and has no rule for vertical
balance at all.** The block band ran `y 258..558` in a 640 canvas, so its centre sat at 408 against
the canvas centre of 320: the drawing was 88 units low, the whole top-right quadrant was blank and
an 82-unit dead strip ran along the bottom.

The fix moves the band up and lets the replication arc, not the cylinders, carry its top edge.

| constant | value | derived from |
|---|---|---|
| `CYL_Y` | 230 | the API is level with the ETCD row and starts at `CONTENT_L`, so `API_Y = CYL_Y + CYL_H/2 - API_H/2` must clear `PANEL_B`. That gives `CYL_Y >= 215`; 230 leaves 15 units under the reserved corner and 25 under the measured panel bottom |
| `ARC_RISE` | 80 | new named constant replacing an inline `32`. It is what puts something in the previously blank top-right, so the arc reads as a route rather than a decorative notch |
| `ARC_Y` | 150 | `CYL_Y - ARC_RISE` |
| everything below | follows | `CYL_CY`, `CYL_BOTTOM`, `ROLE_Y`, `LOG_Y`, `API_Y` and the three state chips are all offsets from `CYL_Y` and moved with it |

Resulting band `150..498`, height 348, centre **324** against the canvas centre 320, margins 150 top
and 142 bottom.

**Alternatives measured and rejected.**

1. Pure slide-up keeping `ARC_RISE = 32`: band `198..498`, centre 348, still 28 low, and the top-right stays a 198-unit empty strip.
2. `CYL_Y = 215`, the mathematical minimum: the API's top edge lands exactly on `PANEL_B` with zero clearance. At 1100x800, where the panel is widest, that is one narration line away from an OCCLUDED finding.
3. Stretching the row gaps to fill the full 640: breaks the only thing tying a role chip and a log chip to their replica. This is one semantic band, so the fix is to centre the band, not to inflate it.
4. Moving the API into the free bottom-left with an L-lane up into ETCD-1: every cylinder's bottom face is already taken by its role-chip binding line, and the straight API-to-Leader lane is the literal "single point that orders all changes".

**Timing.** `REPLICATE` grew 584 to 680 units (the `32+520+32` legs become `80+520+80`), `routeDur`
1298 to 1511 ms, the `replicate` step span 1858 to **2071 ms**. That still fitted the 2100 budget,
but by 29 ms, so `duration` went to 2400 for a beat of headroom. Motion untouched. `API_TO_E1` is
unchanged at 140 units and stays on the 700 ms floor.

**Superseded 2026-07-30.** `replicate` is 3800 now, and the numbers above are the R5 relayout's, not
the card's current ones. Review stage 2.4 family D gave every exchange on this card the answer it was
missing (two Follower acks, the durable report, the whole of `apply`), so `replicate` runs to 3629 and
`quorum` and `apply` went 1900 -> 2500 each. The row became a lane PAIR to carry them: see the note
under `LANE_DY` in `docs/INTERNALS.md`.

**Left open, needs a go-ahead.** The wire label `write Pod · via Leader` renders about 150 units
wide with `text-anchor: middle` at `(API_R + CYL_XS[0]) / 2 = 350`, inside a 140-unit gap, so it
overhangs the API's right border by about 5 units and the ETCD-1 cylinder by about 5. Visible on
every viewport, worst at 1100. The cheapest correct fix is `CYL_XS = [440, 690, 940]` (inter-cylinder
gap 60 to 50, right edge still on `CONTENT_R`, content bbox still `60..1140`), which gives the label
a 160-unit gap. Not applied: it is horizontal geometry and was outside the rebalance.

**Header measurement corrected at the same time**: the card recorded `y <= 220`, the real worst case
over the viewport set `check-geometry` judges against is **230**.

## cluster-graceful-node-shutdown

### layout (R5-a, 2026-07-27)

```
Already Layout A (ladder 60..540, chips 620..1140, Node frame full width) and left that way. The one
change is the lane: a single spine stopped on the Node frame's top edge between Pods, while the step
that fires it makes two different Pods react. It now drops to a bus at BUS_Y = NODE_Y - 14 and taps
down into each of the three Pods; all three lanes are drawn, and SIG_LANE(i) feeds both pathArrow and
routePacket. terminate-normal sends one ball per non-critical Pod (lanes 0 and 1), terminate-critical
one on lane 2. The frame moved 468 -> 476 so the bus has 14 units of clearance either side.
terminate-normal 2700 -> 2900, terminate-critical 2600 -> 3000ms.
```

---

## cluster-kubelet-sync-loop

### layout (R5-a, 2026-07-27)

```
Untouched apart from the chip column, which was 380 wide against a 500 wide ladder. Widened to the
category's 480 (60..540). The card is Layout B by shape (API and chips in the left column, ladder
right) and has none of the three regressions: no chip collision, no lane into empty space, and the
left band is occupied.
```

---

## cluster-leader-election

### layout

Written 2026-07-27 together with the vertical rebalance, same story as `cluster-etcd-raft`: zero
geometry findings throughout, because no rule looks at vertical balance. The band ran `y 50..481`,
centre 265 against the canvas centre 320, so the drawing sat 55 units high with a 159-unit dead band
under the field chips and only 50 units above the replica row.

**The card had five independent absolutes** (`ROLE_Y 170`, `CORRIDOR_Y 252`, `LEASE_Y 300`,
`HOLDER_Y 400`, `FIELD_Y 447`). Each is now derived from `REP_Y` through the gap it already had, so
the whole stack moves as one and only a single number decides where it sits:

| constant | value | derived from |
|---|---|---|
| `CY` | 320 | `640 / 2`, the canvas centre |
| `BAND_H` | 431 | `FIELD_Y + ROW_H - REP_Y`, the card's own height, unchanged |
| `REP_Y` | 105 | `Math.round(CY - BAND_H / 2)`. Centred by construction, not by a number anyone liked |
| `ROLE_Y` | 225 | `REP_BOTTOM + 40` |
| `LANE_RUN` | 48 | new name for the corridor leg length the card already used twice |
| `CORRIDOR_Y` | 307 | `ROLE_BOTTOM + LANE_RUN` |
| `LEASE_Y` | 355 | `CORRIDOR_Y + LANE_RUN` |
| `HOLDER_Y` | 455 | `LEASE_Y + LEASE_H + 20` |
| `FIELD_Y` | 502 | `HOLDER_Y + ROW_H + 13` |

Every gap (40 / 48 / 48 / 20 / 13) is the card's existing gap. The only value that changed is
`REP_Y`, by +55. Band `105..536`, margins 105 top and 104 bottom.

**Alternatives measured and rejected.**

1. Keeping `REP_Y = 50` and stretching the gaps to reach the floor: the corridor legs grow past 48 and the L-shaped CAS pair stops reading as one tight request and response. It also lengthens every route for no compositional gain.
2. `REP_Y = 110`, a rounder +60: band `110..541`, 5.5 off centre, no advantage over deriving it from `CY` and `BAND_H`.
3. Moving the three Lease field chips into the free bottom-left as a column: destroys "fields grouped directly under their object", which is the entire bottom half of the card.

**A real defect was found by the rebalance and fixed.** The three CAS packets rode hardcoded centres
`470 / 700 / 930` while the drawn lanes sit at `REP_CXS = 530 / 780 / 1030`. `anim-dump` before the
fix put the balls at `t(460,204) t(690,204) t(920,204)` against wires at `520/540`, `770/790`,
`1020/1040`: **every ball flew 60 to 90 units beside its own dashed lane on three of the five
steps**, and a stale comment reading `Centres 470 / 700 / 930` said so out loud. The call site is now
`putPacket(s, ctx, REP_CXS[i])`, so the wire and the ball come from one array, which is the rule this
project has written down twice.

**Timing.** The vertical move is a pure translation and changes no route length, but the lane fix
does: mgr-3's corridor leg goes 330 to 430 units (total 426 to 526), `routeDur` 947 to 1169 ms, so
the `acquire` and `failover` spans went 2554 to **2998 ms**, over their 2700 budget. Both raised to
3200. Motion untouched.

**Header measurement corrected at the same time**: the card recorded `y <= 195`, the real worst case
over the viewport set `check-geometry` judges against is **205**.

**`check-arrival` baseline for this card is R2 3**, all three checked by hand and correct behaviour.

## cluster-node-drain

### layout (R5-a, 2026-07-27)

```
Layout C. Panel measures x<=397, y<=380 here, the tallest in the category: 5 ladder rows (200) plus
the Node frame (152) plus the chips do not fit under it, so the left column above the frame stays
empty and the ladder keeps the right column (660..1140). That emptiness is Layout C's known cost.
Chips went from four across (258, both names overlapped their values) to TWO per row at 532, two
rows, 548..624. The Node frame moved up to the panel bottom (380..532) to pay for the second row.
The request wire label moved above the top row (WIRE_Y = TOP_Y - 14): at y=146 it spanned 539..907
and the spine at x=580 struck through it.
The eviction lane no longer stops on the frame edge between Pods. EVICT_ROUTE(i) drops to a bus at
BUS_Y=398 inside the frame and taps down into web-1 or web-2; both lanes are drawn, and each step feeds
the SAME array to pathArrow and routePacket. evict-A: 3100 -> 3300ms.

**Two changes since, both 2026-07-30.** The lane leaves the API, not kubectl (review stage 2.4 family
C): kubectl POSTs to the eviction subresource and the API is what reads the PDB, grants the 200 OK and
DELETES the Pod, which both evict steps say in those words. `SPINE_X` could not simply be redefined
because `KUBECTL_X` is DERIVED from it, so the route got its own `API_CX` = 868 and a jog at y=145 that
clears the ladder; evict-A went 3300 -> 3900. And the 200 OK itself is now animated on the answer lane
(family D), which the card had drawn and used only for the 429 on the retry step.
```

---

### note (anchor dropped: `topPacket(s, ctx);` is not unique in the file)

```
Listing is a read against Api: only the kubectl <-> apiserver hop
moves. No packet reaches the node, so no Pod reacts (the bucketing is
shown by the chain advancing, not by blinking a Pod the GET never touches).
```

---

## cluster-node-failure

### layout (R5-a, 2026-07-27)

```
Layout C, and the card had to be re-budgeted vertically: six ladder rows (242) were laid out as
five, so the ladder ran from 190 to 432 and its last row was drawn over the two Node frames. The
top row dropped from 110 to the family's 80 to buy the space back, which puts the ladder at
152..394, the frames at 406..538 and the chips at 552..624. Chips went from five across (206, and
the unreachable taint value alone needs 335) to THREE per row at 350.67, two rows.
Lanes: the heartbeat used to rise at LEASE_CX straight through all six ladder rows. Both lanes now
share a two-lane corridor above the frames (EV_JOG_Y 340 outbound, HB_JOG_Y 362 return) and meet
the top row through GUTTER_X 620 and UNDER_TOP_Y 136, left of the ladder. They land on the Pod's
top face at POD_A_CX -/+ 12 (a mirrored pair) instead of on the frame edge, and the checked
enumeration of every segment pair shows no crossing. RESCHED now runs Pod face to Pod face.
The wire label moved above the row: the heartbeat riser used to strike it. heartbeat 2400 -> 2600,
evict 2200 -> 2400.
```

---

### before `const HEARTBEAT_CONNECTOR = [[POD_A_CX + LANE_DX, POD_Y], [POD_A_CX + LANE_DX, HB_JOG_Y], [GUTTER_X, HB_JOG_Y], [GUTTER_X, UNDER_TOP_Y], [LEASE_CX, UNDER_TOP_Y], [LEASE_CX, TOP_BOTTOM]];`

```
Shared connectors. Heartbeat: Node-1 top-centre up into the Lease bottom-centre,
the vertical riding the gap (x=790) between the chain and the chips column.
Evict: controller left margin down into Node-1. Reschedule: the workload relocates
from the failed Node-1 across to the healthy Node-2; the packet bridges the two
node blocks (right edge x=680 -> left edge x=740) and the replacement Pod only
materialises inside Node-2 once the packet lands on the node.
```

---

### before `s.refs.podA.style.opacity = String(OPACITY.terminating);`

```
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). Both the evict step and the
reschedule step after it used to draw Pod A at opacity 0, on both the Pod and its two Node-1
lanes, while the narration said the Pod sits in Terminating and the chip read '0s Terminating'.
Terminating is a phase in the vocabulary, not an absence: an object with a deletionTimestamp that
the API cannot finish deleting is exactly the thing this card is about, and drawing it as gone
deleted the subject of its own sentence. Pod and lanes now hold OPACITY.terminating.

The lanes take the Pod's shade rather than 0 for the reason recorded catalog-wide: a lane may not
outlive the Pod it ends on, and it may not vanish from under a Pod that is still drawn either.
The reschedule step keeps all three at that shade and brings only the replacement to full, because
a Pod carrying a deletionTimestamp no longer counts towards the replica total, which is what lets
the controller create the replacement while the old one is still on screen.
```

---

## cluster-node-pressure-eviction

### layout (R5-a, 2026-07-27)

```
Layout B: with a panel bottom of 280 the sum PANEL_B + 20 + chip column (160) + 20 + Node frame (140)
is 620, so the chips fit in the left column and only the ladder needs the right. Chips left the
four-across bottom strip (258, --eviction-hard overlapped its own value) for a 480 wide column at
60..540, and both columns now end together on COL_BOTTOM = 460 with the Node frame at 484..624.
The lane used to stop on the frame's top edge above the MIDDLE Pod while the Pod that is always
evicted is the BestEffort one on the left. It now turns at BUS_Y (472, midway between the columns
and the frame) and lands on POD_CXS[0]. evict: 2500 -> 2700ms.
```

---

## cluster-oom-kill

### layout (R5-a, 2026-07-27)

```
Layout C (panel y<=330, so no left column fits above the Node frame). Chips went from four across
(258) to TWO per row at 532, killing the memory.current / container state overlaps; the frame moved
to 388..532 to pay for the second row (548..624). The wire label moved above the top row: at y=146
it spanned 574..877 and the spine at x=580 cut it. NODE_CONNECTOR now ends on POD_Y, the Pod shell
that actually reacts, instead of on the Node frame edge 20 units above it.
```

---

### before `const create = routePacket(s, ctx, NODE_CONNECTOR, { role: 'cluster' });`

```
Kubelet creates the new container on the node (connector) and rewrites its cgroup
(top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
not chained). The container pulses and re-materialises on arrival.
```

### before `const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });`

```
Review stage 2.4 family D listed the `observe` step here as a return the narration promises and the
motion never delivers. DECLINED 2026-07-30. What the step animates IS the claimed return: PLEG spotting
the dead container travels kernel -> Kubelet on the lower lane, which is the answer lane of this pair
and the correct direction. The other movement the sentence names, Kubelet PATCHing the container status
to terminated, goes to an API this card does not draw, and the Kubelet sublabel already accounts for it
in words (`PLEG + status patch`). A return has to have somewhere on the canvas to go.
```

---

## cluster-pod-sandbox-cri

### layout (R5-a, 2026-07-27)

```
**The lane leaves containerd since 2026-07-30, not Kubelet** (review stage 2.4 family C). Kubelet is
the one block on this card that never touches the sandbox: the whole subject is that it is a CRI client
and containerd is what materialises the pause container, pulls, creates and starts. All four steps that
ride the lane say so, and one said it in a code comment two lines above its own call. `SPINE_X` is
`RT_X + RT_W / 2` = 790, and moving it right by 270 units added 244ms to every ball, which put all four
steps 131ms over their 2800 budget: they are 3100 now.

Already Layout A and left that way. Only the lane changed: it stopped on the Node frame's top edge,
30 units above and 80 units left of the Pod sandbox it addresses. It now turns at BUS_Y = NODE_Y-16
(in the gutter between the ladder and the chip column, so it still crosses nothing) and lands on the
sandbox's top midpoint. Longer route, so sandbox / cni / create / start went 2600 -> 2800ms.
```

---

### before `const podShell = pod({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0, role: 'workloads' });`

```
The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
and the workload container (created at CreateContainer, started at StartContainer).
Centred in the node (centre x=700) too.
```

### before `const packetLayer = g({ id: 'packetLayer' });`

```
Z-order canon: packetLayer rides above the static wires but below the
blocks, so the ball reads on its connector and arrival is told by the pulse
(matches every other node card; the center connector travels in open space).
```

---

## cluster-scheduler-decision

### layout (R5-a, 2026-07-27)

```
The Cluster exemplar, rebuilt on Layout A so the rest of the category has a shape to copy: actor row
40..140 clear of the panel, pipeline ladder in the LEFT column (60..540, was centred at 400..800),
state chips in the RIGHT column (660..1140 at 480 wide, were 240 wide at 900..1140 with the whole
left band under the panel empty), candidate Node row and its verdict chips full width at the bottom.
Chips share the ladder's row rhythm (ROW_H 32, ROW_GAP 12) so the two columns read as one grid.
API_TO_CHAIN turns at JOG_Y=200, below the measured panel bottom of 181, and lands on the ladder's
top midpoint.
CENTRE still passes because the chip strip pools EVERY .scheme-chip: the ladder rows (60..540) and
the verdict chips (60..1140) keep the strip centred on 600 with the value chips on the right.
Three packets were still on the coordinates of a much older top row (380..440 and 760..820) and flew
over blank canvas: they now use SCHED_R / API_X / API_R / ETCD_X, the same numbers as their arrows.
queue: 2200 -> 2800ms.
```

---

### poster

```
The scheduler decision: the Pod is scored against three candidate nodes, then BOUND to the
highest-scoring winner (a bright dashed link) while the passed-over nodes get the same dashed
links but dim, with shorter score bars. The winner reads through its bright box + score bar.
```

---

## network-client-ip-preservation

### before `const FLOW_Y = 410;                            // Client top lands at 372, clear of PANEL_B`

```
Preserving the client IP (viewBox 1200x640). The card answers one question: the backend Pod sees the
proxy address on its socket, so where did the client go, and how does it come back. The flow is a
straight left-to-right line, client -> edge proxy Pod -> backend Pod, with a header panel hanging
above the proxy holding the two headers the edge writes. What each hop actually CARRIES is the whole
point, so every ball wears a riding tag: the true source on the way in, the proxy source on the way
out, then the header, then the PROXY protocol preamble.

Standard contract: both Pods are shell + inner box; only Pods pulse; the client is infrastructure and
only lights; value chips never flash; packets stop at block edges.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed, so a block and
the ball that rides to it cannot drift apart.

Vertical: one spine, FLOW_Y, placed low so the client block (the only block on the left) clears the
narration overlay. The header panel is the only other thing that high, and it lives at x >= 415.

SUPERSEDED NUMBERS. This paragraph was first written against the blanket `x 0..399, y 0..300`, put
FLOW_Y at 372 and derived a client top of 334. The blanket was never a measurement and is wrong in
both directions, so those numbers are gone. The card now carries its own measurement instead, and it
is the only networking card that does:

```js
const PANEL_B = 355;    // measured worst case over 1600x1000 / 1280x860 / 1100x800
const FLOW_Y  = 410;    // client top lands at 372, clear of PANEL_B
```

Beware a name collision inside this card: `PANEL_B` is the narration panel bottom, while
`PANEL_BOTTOM = 190` is the bottom edge of the drawn header chip. They are unrelated.
See "The narration panel is measured per card" in `scheme/CLAUDE.md`.

Horizontal: the panel is centred ON THE PROXY, since those headers are what that Pod writes, and the
ownership line rises straight up from the proxy top centre. A 260-wide panel centred on PROXY_CX 545
spans 415..675, clear of the overlay with 16 to spare, exactly as in the Ingress card. The row then
spans CLIENT_X..POD_RIGHT = 40..1110 and the chip strip spans the same extent 1:1.
```

### before `const panelWire = relationPath({ points: [[PROXY_CX, PROXY_TOP], [PROXY_CX, PANEL_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: the proxy is what writes these headers. No packet ever
travels it, so it is a plain dashed line with NO arrowhead, to read as an association rather than
a wire missing its ball.
```

### before `const srcChip   = valChip({ x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'src at backend', value: 'none', role: 'network' });`

```
The four chips span the scheme 1:1, from the Client left edge to the backend Pod right edge, with
even 20px gaps. Widths are tuned to their content. What the backend sees is an OUTCOME of a
request, so those three read none until traffic actually flows. The edge mode is a property of the
setup, so it is true from the start.
```

### before `function clearHL(s) {`

```
The inner app boxes (proxyBox/podWBox) are listed so their .highlight is cleared every step:
clearPodHighlight only resets inline strokes, so without them a highlight set in a reduced-replay
block leaks into later steps, since reduced replay never runs the forward motion path.
```

### before `pulsePod(s.refs.proxy, ctx, 0);`

```
Up-arrow, the proxy is the sender: it pulses FIRST as it opens the new connection, and only then
does the proxied request leave, carrying the proxy address as its source. The backend pulses on
arrival.
```

### poster

```
Mirrors the diagram: client, edge proxy Pod, backend Pod on one line, with the two header bars the
edge writes docked above the proxy. No ball rides the legs: the poster states the composition, and
what each leg actually carries is what the steps go on to answer.
Geometry: everything is centred on the flow line y=118, the panel is centred on the proxy (cx 160)
and its link drops onto the proxy top edge, and every dash starts and ends on a shape edge.
```

---

## network-cni-invocation

### before `const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height`

```
CNI plugin invocation (viewBox 1200x640). This is a control-plane handoff, not Pod traffic:
kubelet -> CRI runtime -> CNI plugin chain, and the allocated IP is wired back into the sandbox
namespace as eth0. The narration overlay owns the top-left corner, so the actor row
sits just below it at y352.

The CNI plugin is one dashed node container holding a vertical dashed spine that taps each plugin
row (bridge, IPAM, result). The CNI block is aligned so its top tap sits at the runtime row and
its bottom tap sits at the sandbox row, which keeps the ADD and result arrows dead straight (no
mid-run jog). One ball walks the whole chain across the steps:
  CRI -> bridge -> IPAM -> result -> sandbox, touching every block and every dashed segment.

Standard contract (matches network-model / network-service-clusterip):
  - only the Pod sandbox pulses, boxes + ladder light via .highlight, never pulse.
  - the same point array feeds the static wire and the packet that rides it.
  - one clear motion per step, all routed through ctx.register via the kit wrappers.
```

### before `const SBX = [360, 442 - RAISE, 240, 116];   // x, y, w, h  -> top 378  right 600  centre y 436 = PAUSE_Y`

```
Pod sandbox: compact, dropped below the runtime. Its pause/eth0 row sets the result-tap height so
the result arrow runs straight back into it.
Height is tuned so the block centre lands exactly on PAUSE_Y, where the result and join arrows
enter, so those arrows read as centred on the block (without moving them and grazing the CNI box).
```

---

## network-conntrack-nat

### before `const POD_Y = 252, POD_H = 120;                    // both Pod shells stand on one baseline`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow
runs client -> netfilter (NAT + conntrack) -> server Pod and back, on TWO stacked lanes so the
ball always has a matching arrow: the request lane (REQ_Y, arrows point right) carries the
outbound packet, the reply lane (REP_Y, arrows point left) carries the return. The NAT rewrite
happens INSIDE the netfilter box, so the ball fades at one edge and re-emerges at the far edge,
never sliding over it. netfilter is infrastructure: it lights, it never pulses. Only Pods pulse.
The four state chips sit in one plane under the block each describes: orig dst under the client,
ct state + reply under netfilter, translated (the backend address) under the server. The row spans
70..1130 and so centres on x=600, which is also why the server Pod ends on 1130 rather than 1110.
```

### before `const CHIP_L = CLIENT_X, CHIP_Y = 530, CHIP_H = 34;`

```
Chips sit in one plane with the blocks above. The outer two are flush with the pod footprints:
orig dst left edge = client Pod left edge (CHIP_L, 70), translated right edge = server Pod right
edge (CHIP_R, 1130). ct state + reply stay centred under netfilter (NF_CX, 590), which is why the
middle pair is not on the same rhythm as the outer two: they belong to the box above them, not to
the strip. orig dst -> client, conntrack bookkeeping -> netfilter, translated -> server.
```

### poster

```
The scheme in miniature, vertically centred: client Pod -> netfilter (holding a 2x2 conntrack
table mapping the original tuple to the translated one) -> server Pod. Two lanes carry the flow
with explicit chevrons: the request runs left to right on the top lane, the reply runs right to
left on the bottom lane, each with its own packet.
```

---

## network-dns-coredns

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
DNS resolution via CoreDNS (viewBox 1200x640). Standard contract: the client is a shell + inner
eth0 box; CoreDNS is a shell wrapping its plugin boxes; value chips never flash; only Pods pulse.
Packets ride the dashed wires edge-to-edge.

The client and the CoreDNS Pod share one center line (FLOW_Y) so the query lane enters CoreDNS at
its exact middle. Forward (query) and return (answer) traffic ride SEPARATE lanes offset by
LANE_DY around that line, so a lookup reads as a loop rather than a retrace.

Layout, rebuilt 2026-07-27 against the MEASURED panel (right <= 397, bottom <= 305, one of the
deepest in the catalog). The client column used to sit at y 175, which put its whole app box and
three quarters of its shell under the panel on the narrow viewports. The row now hangs below that
bottom (FLOW_Y 400, client top 325) and the CoreDNS Pod holds the right edge of the canvas
(CONTENT_R 1130), so the two blocks centre the content bbox on x=600 without a frame to lean on.
The query lane is 510 units as a consequence, which is why the query step carries a 3000ms budget.
resolv.conf hangs under the client and the two readouts stack above CoreDNS, so the chip strip
spans CONTENT_L..CONTENT_R and centres on 600 as well.
```

### before `const corednsShell = pod({ x: DNS_LEFT, y: DNS_Y, w: DNS_W, h: DNS_H, label: 'CoreDNS Pod', sublabel: '10.24`

```
CoreDNS Pod centered on FLOW_Y (DNS_Y = FLOW_Y - DNS_H/2), so the query lane enters at its middle.
The shell is wrapped in a `g` (like podBlock) because pulsePod uses querySelectorAll, which only
matches descendants: pulsing the bare pod element would find its rect but never the .scheme-pod
itself, so the brightness half of the pulse would silently not fire.
```

### before `const pCache = box({ x: PLUGIN_X, y: PLUGIN_Y[0], w: PLUGIN_W, h: PLUGIN_H, label: 'Cache', sublabel: 'answ`

```
The three plugin boxes are spread wider apart and sit symmetric about FLOW_Y (kubernetes on the
line, cache above, forward below), leaving equal 37px margins to the pod label and sublabel. Their
offsets are held relative to the shell top (PLUGIN_Y), so moving the Pod cannot leave them behind.
Order is the CoreDNS plugin chain order (compiled into the binary, not the Corefile line order).
```

### before `clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBo`

```
clientBox is listed so its .highlight is cleared every step: reduced replay lights it in the
resolv / query / answer steps, and without clearing it here that highlight leaks into the
plugin-chain step (reduced replay never runs the forward path that would re-clear it).
```

### poster

```
A name goes in, an address comes out: the whole poster is one left-to-right transform on the flow
line y=90. A NAME is one unbroken bar (a single string), an ADDRESS is four short segments split by
dots (a quad), so the two ends read as different kinds of thing at a glance. Between them the
CoreDNS chain: three plugin bars, cache and forward dimmed to 0.45 and kubernetes brightened,
because that is the one that answers. Deliberately no Pod boxes: the siblings already open with a box-and-dashed-line row,
and the subject here is the transform, not the topology. The lanes carry no packet dots, so the
only circles left are the three tiny ones separating the address segments.
```

---

## network-dns-ndots

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
Search domains and ndots (viewBox 1200x640). Everything hangs off one flow line (FLOW_Y): the client
Pod on the left, CoreDNS opposite it on the right, and the candidate ladder in the free top-right band
above CoreDNS. The two BLOCKS span CONTENT_L..CONTENT_R, which is what centres the content bbox on 600.

The lane used to be deliberately SHORT (190 units, CoreDNS pulled in close), on the argument that the
card is about how MANY queries are sent rather than how far they travel. Relaying it for R5 traded that
for the centring: the ladder is chips, so the only things the CENTRE rule can see are the Pod and the
CoreDNS box, and centring them means putting them on opposite margins. The lane is 380 units now, which
costs the walk step ~1.2s (9200 -> 10400). The four round trips still read as four identical beats,
which is the part that carries the lesson.

Forward (query) and return (answer) traffic ride SEPARATE lanes around the line, because the whole
point of the card is the cost of a ROUND TRIP: a miss is not just a packet out, it is a packet out
and an NXDOMAIN back, four times over.

The resolv.conf is drawn as its own chips (search + options) under the Pod, exactly as in
network-dns-coredns, rather than as a box whose sublabel repeats a chip that sits next to it.
The panel was re-measured 2026-07-27 over the three viewports the OCCLUDED rule uses: right <= 397,
bottom <= 230. The earlier note here read y=143 off ONE viewport, and the Pod top at 225 was clearing
it by luck rather than by margin. FLOW_Y 400 puts the Pod top at 335, well below the measured bottom,
and the resolv.conf chips take the space under it. A longer narration invalidates the measurement.
```

### before `const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];`

```
The real search list for a Pod in namespace ns is `ns.svc.cluster.local svc.cluster.local
cluster.local`, so a short name is tried against each in turn and only then as it was written.
Four candidates, so four round trips per address family.
```

### before `const namesChip = valChip({ x: CNT_X1, y: CNT_Y, w: CNT_W, h: RC_H, name: 'names tried', value: '0', role:`

```
The live cost readout, under CoreDNS on the right so that the two chip groups (resolv.conf on the
left, the counters on the right) span the content edge to edge. It counts NAMES TRIED, not DNS messages: getaddrinfo asks for A and AAAA in
parallel, so each name costs two queries on the wire. Calling this chip `queries` and showing 1 for
a hit would contradict the walk step, which tells the reader the IPv4 plus IPv6 total doubles.
The answer is the real DNS rcode, so NOERROR and NXDOMAIN read as the pair they are.
```

### before `function roundTrip(s, ctx, { start, lead, name, result, row = -1, pulseOnSend = true }) {`

```
One query as a full ROUND TRIP: the Pod pulses, the question goes out on the forward lane, CoreDNS
lights on arrival, and the reply comes back on the return lane. Returns the ms at which the reply
lands, so the caller can chain the next attempt onto it. `lead` is the pause before the question
leaves: the canon BEAT.afterPulse for a fresh lookup, tighter for the retries of a search-list walk,
which the resolver fires back to back.
```

### before `if (pulseOnSend) pulsePod(s.refs.podGroup, ctx, start);`

```
Up-arrow: the Pod pulses BEFORE its question leaves. `pulseOnSend` is false only for the retries of
a search-list walk, where the Pod has just pulsed on the NXDOMAIN landing 300ms earlier and a second
pulse on top of it would smear into one long blink rather than read as two beats.
```

### before `duration: 10400,`

```
Four full round trips on the 380 unit lane run ~9.3s, and the last NXDOMAIN pulse rings on until
~10.2s. The step must outlast its own motion, or auto-advance clips the walk halfway and the card
silently under-counts the very cost it teaches. The budget was 9200 while the lane was 190 units:
routeDur is length-based, so the R5 relayout moved it.
```

### poster

```
The staircase of guesses. A short name is not asked once: the resolver walks the search list, and
each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
name is left. The rows are a descending staircase, the dashed rail on the left is the walk down it,
and the dot trailing each row is the query that attempt costs. The staircase IS the cost, which is
the whole point of ndots, so the poster spends everything on that one shape and draws no topology.
```

### before `setWire(s, 'q', 'api');`

```
roundTrip writes BOTH lane labels from inside the motion path, so on the static path (prev, reset,
reduced motion) the two lanes stood empty while the ladder and the counters carried the whole
story. Each query step now restates its own end-state labels inside the guard body. The walk step
ends on the LAST candidate and its NXDOMAIN, because that is the pair the fourth round trip leaves
on the wire, not the first.

The fqdn step restates the name WITH its trailing dot, which is why check-labels reports
api.ns.svc.cluster.local. against api.ns.svc.cluster.local as an ambiguous pair. The pair is the
subject of that step and is meant to stand: one name is absolute and the other is not.
```

---

## network-dns-records

### before `const CONTENT_L = 80, CONTENT_R = 1120;`

```
Layout, rebuilt 2026-07-27 against the MEASURED panel (right <= 397, bottom <= 330: this card
carries one of the longest narrations in the category). Read it as an L. Only the record ladder,
which starts at x=710, may sit beside the panel; everything else hangs below y=330.

  top right : the four-row record ladder (chips), ROWS_Y 56 down to 296
  middle    : client Pod -> CoreDNS on FLOW_Y 400, one straight hop with no jog
  bottom    : the FQDN band, then the question / answers chips

The vertical budget is what forces that order: below the panel there is room for the flow row, one
64 unit band and the chip strip, but not for a 240 unit ladder as well, so the ladder is the one
thing that goes up top. The BAND is then the only block that can reach the right margin, which is
why it is stretched to CONTENT_R: CENTRE measures blocks, the ladder is chips, and CoreDNS has to
stay in the middle for the fan to work. Content and chip strip both span 80..1120, centre 600.

Each record row is reached by its OWN dashed wire: a trunk out of the CoreDNS right edge, a vertical
bus at FAN_X, then a horizontal leg entering the row square-on at its left edge (the same fan idiom
as network-service-clusterip). The four wires share the trunk and diverge at the bus, climbing to
the ladder above. The answer ball rides ANS[i], the exact same array that drew wire i, so a ball is
never travelling over blank canvas.
Standard contract: only the client Pod pulses, boxes/ladder light via .highlight.
```

### before `const SEG_Y = 490, SEG_H = 64;`

```
The FQDN band is NOT decoration and NOT a one-step cameo: it is the live query name, and it MUTATES
per step, because the whole point of the card is that a different record kind is a different name.
SRV prefixes the name with _port._proto, a Pod record swaps the service label for the dashed Pod
address AND swaps the kind from svc to pod, while headless asks the exact same name as A (that is
the lesson: same name, three answers instead of one). Segments light statically and never flash.
Band spans CD_LEFT..CONTENT_R (420..1120), left-aligned with CoreDNS above it and flush with the
right margin. The four widths keep their old 156:116:76:100 ratio, each sized by its own text, and
are scaled x1.52 to fill that span. It sits at the BOTTOM now rather than the top: the ladder needed
the free top-right band, and the band is the only block able to reach the right margin, which is what
puts the content bbox on x=600.
```

### before `const qChip = valChip({ x: CONTENT_L, y: CHIP_Y, w: Q_CHIP_W, h: CHIP_H, name: 'question', value: '-', ro`

```
The two readouts are the DNS exchange itself, and neither repeats what the band or ladder says:
the QUESTION is the exact qname plus type the resolver puts on the wire, and ANSWERS is how many
records come back. That count is the whole difference between a normal and a headless Service
(1 record vs one per ready Pod), which nothing else on the diagram states.
```

### before `function resolve(s, ctx, rowIdx) {`

```
Resolve one record kind: pulse the client, run the query straight along the flow line into CoreDNS,
then send the answer out along the fan wire belonging to THIS record row. Shared by the four record
steps. The answer rides ANS[rowIdx], which is the array wire rowIdx was drawn from, so the ball
tracks a visible dashed line the whole way and enters the row square-on.
```

### poster

```
One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
dots of the name itself, and it forks into three identical record chips. The ONLY difference the
poster draws is the answer count: the middle chip carries three dots (headless: one record per
Pod), the others carry one. No resolver box and no record ladder: the card already draws those,
and the poster only has to say what the card is ABOUT.
```

---

## network-dualstack

### before `const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client`

```
Layout zones (viewBox 1200x640): the narration overlay is a fixed panel over the top-left
(about x<=250, y<=152, worst case over the viewports x<=397, y<=230). The dual-stack config band
sits below it (y=136) and spans only the Service..Pod half (480..1080), so it no longer reaches over
the client Pod on the left. The client / Service / Pod web row sits lower still (ROW_Y 286). The
config band drops into BOTH the Service (its ClusterIP) and the Pod (its address), as a MIRRORED
PAIR about the band centre (CONFIG_CX +/- TAP_DX) rather than one tap per target centre: two lanes
leaving one face at mirrored offsets read as a deliberate pair, and each still lands 15 units off
its target midpoint, which is invisible on a 240 and a 300 wide face. The bottom info chips span the
whole row instead of the band (CLIENT_X..ROW_RIGHT, 120..1080), so the strip centres on x=600 like
the blocks above it: the two ClusterIP chips on one row, ipFamilyPolicy stretched below them.
Dual-stack means two parallel address families: the Pod gains a second IP, the Service gains a
second ClusterIP, the client picks a family at connect time.
Standard contract: only Pods pulse, boxes light via .highlight; the config band feeds the Pod and
the Service with short packets dropping from it, packet endpoints match the static wires.
```

### before `const CONFIG_Y = 136, CONFIG_H = 80;`

```
Whole scheme raised ~10% of the 640 viewBox (64px) versus the earlier layout. The band lives at
x>=480, clear of the narration overlay (x<=250), so it can sit higher without touching it. The
content stays horizontally centred (client + Pod symmetric about x=600); only the vertical offset
changes.
```

### before `const wClient = arrow({ x1: HOP_CLIENT[0][0], y1: LANE_Y, x2: HOP_CLIENT[1][0], y2: LANE_Y, dashed: true,`

```
Dim dashed wires (uniform style): client -> Service -> Pod data lane (equal-length hops), plus
two drops from the config band into the Service (ClusterIP) and the Pod (CNI address). Each
drop shares its points with the per-step packet that rides it.
```

### before `s.refs.config.classList.add('highlight');`

```
Enabling the feature is a config change with no per-object traffic, so the band just lights
up steadily: no flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack
until a Service opts in, so that chip does not change yet.
```

### before `s.refs.config.classList.add('highlight');`

```
The Service opts into dual-stack here: ipFamilyPolicy becomes PreferDualStack and it is given
a second ClusterIP from the v6 service CIDR. The config band is the source of that ClusterIP
(the service CIDR lives there), so it stays lit too, matching the Pod step.
```

### before `s.refs.svc.classList.add('highlight');`

```
The client picks a family at connect time, the Service policy is unchanged (still
PreferDualStack). Show the client dialing the IPv6 ClusterIP and highlight that address,
rather than overloading the ipFamilyPolicy chip with a client-side choice. The Service is on
the path (kube-proxy DNATs here), so it lights steadily via .highlight, it does not pulse.
```

### before `const HOP1 = HOP_CLIENT, HOP2 = HOP_SVC;`

```
Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, the Pod
pulses on arrival. A riding label rides each hop to make the chosen family visible on the
wire and to show the kube-proxy DNAT: the client dials the IPv6 ClusterIP, then the
destination is rewritten to the Pod IPv6 on the way out.
```

---

## network-ebpf-dataplane

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
Layout zones (viewBox 1200x640): the narration overlay sits over the top-left, so the flow runs
left to right along y312 (client -> eBPF program -> backend Pod) with the BPF maps box ABOVE the
program, mirroring the ClusterIP reference card. This is the eBPF dataplane that replaces
kube-proxy: an eBPF program at the socket hook reads a BPF service map and rewrites the
connection to a backend at connect() time, so there is no per-packet iptables walk and no DNAT.
Standard contract: only Pods pulse, boxes light via .highlight only (no block flash anywhere),
packet routes are right-angle and shared by the static wires and the moving packets.

The composition spans CONTENT_L..CONTENT_R (70..1130): the client Pod holds the left margin and the
backend Pod column the right one, so the content bbox centres on x=600, and the three chips are one
even row across that same span. The backend column used to stop at 1030, which left the whole card
50 units left of centre. FAN_X is derived (midway between the program right edge and the Pod left
edge), so widening the card moved the fan turn with it rather than leaving it behind.
```

### before `const lDeliver = text({ class: 'scheme-label code dim', x: (HOOK_RIGHT + FAN_X) / 2, y: FLOW_Y + 20, 'text`

```
Destination label sits UNDER the first fan segment, just as the rewritten connection leaves the
program (the riding src tag rides ABOVE the ball at y312, this sits below it). Centring the fan
turn put the riser under the old slot, so the dst label moved here where it never collides.
```

---

## network-endpointslice-reconcile

### before `const CTLR_TOP = 350;                       // top edge of the controller box`

```
Service / EndpointSlice reconciliation (viewBox 1200x640). This is a control-plane pipeline, not
a traffic flow. Read it bottom to top and then right:
  Pods (the live source)  --watched by-->  EndpointSlice controller  --writes-->  EndpointSlice
  (the derived Ready-only address list)  --read by-->  kube-proxy.
The Service sits on top: it owns the selector and NAMES the slice, but stores no addresses.

Layout zones (top-left band kept clear for the narration overlay: the Service, the
slice rows and the controller are all centred at x600, well right of it). The slice is three
valChip rows stacked between the Service and the controller. The controller sits below them and
writes UP into the slice, kube-proxy sits to the RIGHT of the slice and reads it, the live Pods
sit along the BOTTOM and are watched from above.

Standard contract: Pods are shell + inner box and pulse as one; the controller / kube-proxy
boxes light but never pulse; value chips (the endpoints) never flash, they just light via
lightBoxAt on packet arrival. The endpoint rows are the durable state (setVal + .highlight),
they hold the addresses. What MOVES rides on the ball: the controller write hop carries the
endpoint address it is committing, the kube-proxy read hop carries a short read tag, each via
ridingLabel so there is no static inline wire text to collide with the boxes.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
The Ready Pods are observed (they pulse together), then the controller writes the slice: one
packet up from the controller carrying the endpoint address it commits, and the two Ready
endpoint rows light together as it lands.
```

### poster

```
The scheme abstracted to its essence: live Pods on the left (the source, the notReady one
dimmed) are reconciled into the EndpointSlice on the right (the derived list, one endpoint row
per Pod, notReady dimmed). Straight horizontal wires carry the one-row-per-Pod mapping.
```

### before `if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); s.refs.ep2`

```
Pod B going notReady is the whole of this step, so its shade is static end-state and belongs above
the guard, next to Pod C which was already pinned there. It sat below the guard until 2026-07-29,
so prev and reset drew Pod B at full brightness directly beneath its own sublabel reading
10.244.2.7 notReady, and beside a slice row reading dropped (notReady).

Pinning the shade exposed a second thing, fixed 2026-07-30: the Pod was pulsed with plain pulsePod
while sitting at 0.40, and that pulse ramps the STROKE from the resting tint, which on an already
dim Pod is close to invisible. It takes pulsePodDim with `from: OPACITY.notready` instead, which
adds the opacity flash the dim variant exists for. The signature in anim-dump is an `opacity` track
on the Pod group next to the `filter` one, and the peak sits between the sampled percentages because
a blink returns to where it started.
```

---

## network-externalname

### before `const CLIENT_X = 115, CLIENT_W = 160, CLIENT_H = 108;`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay, measured
2026-07-27 at right <= 397, bottom <= 230. Both rows hang BELOW that bottom (ROW_A 300, ROW_B 480,
Pod tops 246 and 426): row A used to sit at 254 and put a quarter of its Client Pod under the panel
on the narrow viewports. The top band is therefore empty by construction on wide viewports, which is
the price of two full-width rows on a card whose panel reaches a third of the way down. Two stacked
rows compare the two ways a Service can point at something that is not a selected Pod:
  - top row (ROW_A): type ExternalName, a pure DNS alias. The client looks the name up (the query
    rides to CoreDNS), CoreDNS answers a CNAME that rides on toward the external host. No ClusterIP
    and no kube-proxy.
  - bottom row (ROW_B): a ClusterIP Service with no selector. The client sends to the ClusterIP
    (dst rides to kube-proxy), kube-proxy DNATs to a hand-attached EndpointSlice (the rewritten
    dst rides on to the external IP).
Each row is one independent one-way flow (two straight hops, no round trip, no return lane). The
value each hop carries is NOT inline wire text: it rides ALONG on the ball (ridingLabel), so both
hops in both rows tag their ball and no static label is needed. Each row has its own client Pod
(pods pulse). CoreDNS, kube-proxy and the targets are infra (they light SYNCED to arrival, never
pulse).
```

### before `pulsePod(s.refs.clientA, ctx, 0);`

```
Up-arrow then forward hop: the client pulses first, the query rides at BEAT.afterPulse to
CoreDNS (lights on arrival), then the resolved CNAME rides on to the external host, which
lights when the name reaches it. No round trip, both hops are one-way.
```

### before `pulsePod(s.refs.clientB, ctx, 0);`

```
Up-arrow then forward hop: the client pulses, the packet carries dst 10.96.0.7 to kube-proxy
(lights on arrival), then the DNAT-ed dst rides on to the manual endpoint, which lights when
the packet reaches it.
```

### poster

```
Abstract, not the literal diagram: two balanced lanes share one client column (left) and one
external-target column (right), crossing one dashed cluster edge. The whole contrast is hollow
vs solid. Top lane (type ExternalName) is a pure DNS alias: hollow client ring to a hollow
resolver ring to a hollow external host, no ClusterIP and no proxy anywhere on the path. Bottom
lane (no-selector ClusterIP) is machinery: a lit cyan VIP straight into a kube-proxy box, on to a
hand-attached EndpointSlice (dashed chip), then a DNAT hop across the edge to a lit cyan endpoint.
```

---

## network-externaltrafficpolicy

### before `const MID_X = 600;`

```
externalTrafficPolicy Cluster vs Local (viewBox 1200x640). Client above the LB, the LB fans down
to two Nodes; Node-1 has a local backend, Node-2 has none. In Cluster mode the packet that lands
on Node-2 is SNAT-ed and forwarded across the underlay lane to the Pod on Node-1; in Local mode
the Node-1 path is straight. Standard contract: Pod is shell + inner box; only the Pod pulses;
value chips never flash; packets ride wires and the underlay, stopping at edges.

GEOMETRY. Every wire is derived from a block edge, never hand-typed, so a block and the packet that
rides to it cannot drift apart. The backend is a standard podBlock (POD_W x POD_H, the same shell as
every other card) and it is centred BOTH ways inside Node-1, on N1_CX and on the node rect centre, so
the fan drops straight down the Pod axis onto the Node edge above it.

Horizontal: the two Nodes are the widest row, mirrored about MID_X with NODE_GAP between them, so the
scheme spans SCHEME_LEFT..SCHEME_RIGHT = 180..1020 and centres on 600. The chip strip spans that same
extent 1:1. Vertical: the stack is client / LB / Nodes / underlay / chips with deliberate gaps, and
the totals leave an equal 40 margin above the client and below the chips, so it centres on the canvas.

CENTRE-LOW is OPEN here on purpose (2 blocks below the overlay span 255..465, centre 360). Those two
blocks are the backend Pod and its inner box, and everything else in that band is Node frames, which
the rule deliberately ignores. The Pod cannot move to the centre: it is inside Node-1 because Node-1
is the Node WITH a local backend, and Node-2 having none is the entire subject of the card. Drawing a
ghost Pod in Node-2 to balance the count would contradict its own label.
```

### before `const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> u`

```
Traffic is delivered TO A NODE, never drawn as entering the Pod: a packet stops at the Node boundary
it arrives on (the top edge coming down from the LB, the bottom edge coming up off the underlay) and
the Pod inside pulses to show it was served. So no wire and no ball ever crosses a Node border.
```

### poster

```
Mirrors the diagram: client above an LB that fans down to two Nodes, only Node-1 holding a backend,
plus the underlay lane that carries the Cluster-mode second hop from Node-2 back to Node-1. That
lane is the whole point of the card, so the poster shows it.
Geometry, same rules as the diagram: client and LB centred on x=160, the two Nodes mirrored about it,
the Pod centred BOTH ways inside Node-1 (cx 81, cy 124), the fan leaving the LB bottom edge and
landing on each Node top, and the underlay running Node edge to Node edge without ever crossing one.
```

### before `const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });`

```
Review stage 2.4 family J listed `fan2` and `crossWire` here as bright lanes pointing into a dimmed
block. DECLINED 2026-07-30, and the reason is not judgement: this card never changes an opacity at all,
on any of its five steps, so it has no dimmed end for a lane to point at. The premise is vacuous.

`C_WIRE` on this card belonged to family B, not J, and is a separate matter.
```

---

## network-gateway-api

### before `const FLOW_Y = 380;                          // Client + Gateway share this row: a request enters here`

```
Gateway API (viewBox 1200x640). The card is about OWNERSHIP: GatewayClass, Gateway and HTTPRoute
are three objects belonging to three roles, and the request only becomes a path once all three
exist. Standard contract: the Pod is a shell + inner box; only the Pod pulses; value chips never
flash; packets ride the wires and stop at block edges. NOTHING here flashes, not even the
packet-less gatewayclass step: a declarative object being installed has no motion to show.

GEOMETRY. Every wire and every packet below is derived from a block edge, never hand-typed, so a
block and the ball that rides to it cannot drift apart.

Vertical: the ownership stack is one column on STACK_CX. The Gateway sits on FLOW_Y, which is the
row a real request enters on, so the Client block can sit beside it on the left. FLOW_Y is pinned
below the narration overlay, and that measurement was corrected on 2026-07-27: the panel reaches
y <= 330 on this card, not 300, so FLOW_Y moved 339 -> 380 and the Client top edge is now
FLOW_Y - CLIENT_H/2 = 344 instead of 303, which had been 36 percent under the panel. The HTTPRoute
row and the chip strip moved down with it (ROUTE_Y 460, CHIP_Y 586) keeping their old gaps.
The GatewayClass is the only block above the panel bottom, and it lives at x >= 410, so it clears.

Horizontal: the Service and the backend Pod hang off the HTTPRoute row to the RIGHT rather than
continuing the column, because a fifth stacked block plus a bottom chip strip does not fit in 640
units. That also frees the right column for the three ownership captions, one per stack block.
The composition spans CLIENT_X..POD_RIGHT = 40..1160, so it centres in the 1200-wide viewBox, and
the chip strip spans exactly the same 40..1160.
```

### before `const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [STACK_X, FLOW_Y]];`

```
Each static wire and the packet that rides it share the same endpoints. Every wire carries an
arrowhead pointing the way its ball travels: CLASS_REF is a reference the Gateway resolves upward,
the other three are the request path running down and out to the Pod.
```

### before `const parentWire  = arrow({ x1: CONSULT[0][0], y1: CONSULT[0][1], x2: CONSULT[1][0], y2: CONSULT[1][1], dashed`

```
Gateway -> HTTPRoute. The attachment is declared the other way (the route names the Gateway in
parentRefs, which is why that field is the route sublabel), but the only ball that ever runs this
wire is a request being matched against the rules, so the arrowhead points down, with the ball.
```

### before `const roleA = text({ class: 'scheme-label code dim', x: ROLE_X, y: CLASS_Y + CLASS_H / 2 + 4, 'text-anchor': '`

```
The point of the card: one caption per stack block, each sitting on its own block row. The top
two go in the right column, which is free at those rows. The HTTPRoute row is not free there
(the backendRef wire and the Service occupy it), and a caption parked above the Service reads as
labelling the Service, so that one goes to the LEFT of the route instead, where it also fills
the quadrant the narration panel leaves empty. Sitting on ROUTE_CY (502) keeps it clear of the
panel, whose measured bottom on this card is 330.
```

### before `const listenerChip  = valChip({ x: CLIENT_X, y: CHIP_Y, w: 200, h: 34, name: 'listener', value: ':443 HTTPS', `

```
The strip spans the scheme 1:1, from the Client left edge to the backend Pod right edge, with
even 20px gaps. Each chip is one real API field, which is why hostnames and match are SEPARATE:
in an HTTPRoute the hostname lives in the top-level `hostnames` list, while the path lives in
`rules[].matches[].path`, whose default type is PathPrefix. Folding them into one "match" chip
would state the spec wrongly. The request chip reads none until a request actually arrives.
```

---

## network-headless-service

### before `const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it`

```
Headless Service (viewBox 1200x640). clusterIP None means there is no VIP hop: DNS hands back the
backing Pod IPs and the client connects to a Pod itself. The three backends are a StatefulSet
(web-0..web-2) so the stable per-Pod name lands.

Geometry, all of it symmetric about the canvas centre line CY=320:
  - The three Pods are a column on the right, centred on CY (web-1 sits ON it, web-0/web-2 mirror).
  - CoreDNS is centred on CY too, so its fan to the three Pods is symmetric: a trunk out of its right
    edge, a vertical bus at FAN_X, then a horizontal leg entering each Pod square-on at its left edge.
  - The client sits low-left. Its DNS lane leaves the TOP of the Pod, rises, and turns into CoreDNS
    at 90 degrees. Query and answer ride SEPARATE lanes (20px apart) so the answer never retraces the
    query arrow.
  - The data path leaves the MIDDLE of the client's right edge (CLIENT_CY), steps down at
    DATA_STEP_X to the trunk level, runs under everything at y=520, and rises on its own bus at
    DATA_X to enter a Pod square-on. The step exists because the trunk has to pass BELOW the Service
    box (430..500) while still leaving the Pod at its face midpoint: leaving at y=520 direct put a
    lone endpoint 35 units off that midpoint, which is what OFFEDGE reports. It is drawn to ALL THREE
    Pods, because a headless client may pick any of them, and every ball rides one of these wires.
Content spans x 80..1120 (centre 600) so it is centred on the canvas.

Narration safe-zone: this card's panel was measured at right <= 397, bottom <= 205. Every element
left of 397 sits well below that (the client at y>=420, the DNS lane turning at CY +/- 10 = 310/330),
so nothing can slide under the panel.
```

### before `const wSvc = relationPath({ points: [[CORE_CX, SVC_Y], [CORE_CX, CY + CORE_H / 2]], dash: '5 5' });`

```
Service <-> CoreDNS is a plain dashed line with NO arrowhead: it is not a packet route, it is the
static fact that this Service backs those records. An arrowhead here would read as traffic, and no
ball ever rides it. Drawn as a bare path because arrow() always attaches a marker.
```

### before `const vipChip = valChip({ x: CLIENT_X, y: CHIP_Y, w: CLIENT_W, h: CHIP_H, name: 'clusterIP', value: 'None`

```
Three readouts, each of which always means exactly what its name says. The old card showed
`connect 10.244.3.4 direct` under a chip labelled `DNS answer`, which is not a DNS answer.

Each chip sits directly UNDER the column it reports on and shares that column's exact x and width:
clusterIP under the client (80..290), the DNS answer under CoreDNS and the Service (430..680), the
connection under the Pods (880..1120). So the footer spans the diagram end to end and every chip
edge lines up vertically with the blocks above it.
```

### poster

```
Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
that rewrites the destination (there is none to rewrite: clusterIP None, so kube-proxy programs
nothing) but the DNS reply itself, a sheet of three A records. Each record leaves on its own leg to
its own Pod, so the record count and the Pod count are visibly the same number, which IS headless:
one record per ready Pod, and the client dials the Pod IP straight.
```

---

## network-hostnetwork-hostport

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;`

```
hostNetwork and hostPort (viewBox 1200x640). Every other Pod Networking card assumes the Pod has its
OWN namespace, its own IP and a veth into the bridge. This card is the two sanctioned ways out of that,
and the composition is one Node seen from the LAN side.

Standard contract: Pods are shell + inner box; only Pods pulse; the client, the NIC, the bridge and the
portmap rule are infrastructure and only light; value chips never flash; packets stop at block edges.
The two reflective steps carry no motion at all: they compare, they do not move traffic.

GEOMETRY. A strict three-column grid, so nothing sits at a random x. Every wire and every packet is
derived from a block edge, never hand-typed.

  COL1 (cx 240)          COL2 (cx 600)          COL3 (cx 960)
  portmap rule           Node eth0              (empty: the lane to the agent runs through it)
  Pod app                cni0 bridge            Pod node-agent

The NIC is the hub and it exits three ways, one per direction: LEFT along its own row into the portmap
rule, RIGHT along that same row into the hostNetwork Pod, and DOWN into the bridge. That last one drops
on BR_IN_ORD rather than dead on COL2_CX, because the portmap route comes down onto the same bridge
face: the two land as a mirrored pair either side of the bridge midpoint (COL2_CX +/- BR_IN_DX), which
is what a face shared by two lanes is supposed to look like. Each
block therefore sits under or beside the block it belongs to: the rule above the Pod it maps to, the
bridge under the NIC that routes into it, and the hostNetwork Pod alone in a column, because it hangs
off nothing.

Vertical: the narration overlay owns the top-left corner, and the Node spans the full width, so
its frame starts at 305, just under the panel, and runs to 570, which is as deep as the chip strip
allows. The client is the only block above the Node and it sits at x >= 450, clear of the panel, dead
centred on the NIC so the entry hop is one clean vertical with no dogleg.
```

### before `const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [BR_IN_PM, BUS_Y], [BR_IN_PM, BR_TOP]];`

```
The rewrite happens INSIDE the rule box, so the ball re-emerges at its bottom edge already carrying the
Pod address, and only then joins the ordinary path. It lands on the bridge left of the NIC route so the
two never overlap, and the two are mirrored about the bridge midpoint so neither reads as a slip.
```

### before `const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
The frame label sits at the Node top-left (x+12, y+18), which puts it above and left of the portmap
box at x=110, so Node-1 clears it. Do not lengthen it much further or it runs under that box. The
Node address stays on the eth0 block, which is where it belongs anyway.
```

### before `const nsChip   = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 260, h: CHIP_H, name: 'netns', value: 'own', role: 'ne`

```
The four chips span the Node 1:1, with even 20px gaps. They are the four things these two fields
actually change, and each is a property of the setup rather than of a request, so they all carry the
ordinary-Pod truth from the start and the steps flip them.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every dimmable block goes back to full opacity so the dim
one case puts on the other cannot leak into the next step.
```

### before `const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });`

```
Down-arrow chain: the request lands on the NIC, is matched by the portmap rule, and the rewrite
happens INSIDE that box, so the ball re-emerges at its bottom edge already carrying the Pod
address. From there it takes the ordinary path, bridge then veth, and the Pod pulses on arrival.
```

### poster

```
One Node seen from the LAN, in the same composition language as its siblings: a client bar on top, the
Node frame under it, the NIC as the hub inside, and the blocks hanging off the NIC in a three column
grid. Left column is the hostPort path, and it is the FULL ordinary wiring: the portmap rule that maps
the Node port onto the Pod, plus the cni0 bridge and the veth that actually deliver into it, so the Pod
there is a shell with its own container box, its own namespace, its own IP. Right column is the
hostNetwork Pod, wired to the NIC by ONE straight line and nothing else: no rule, no bridge, no veth,
because it has no namespace to be wired into. That missing wiring, next to the wiring drawn in full, is
the whole card.
Geometry: columns at cx 60 / 160 / 262, the NIC is the only block the client lands on, and every dash
starts and ends on a shape edge.
```

---

## network-ingress-routing

### before `const FLOW_Y = 343;                  // (RULE_BOTTOM + CHIP_Y) / 2, the spine of the left-to-right flow`

```
Ingress controller routing (viewBox 1200x640). External LB -> controller Pod -> matched Service
-> backend Pod, left to right. The card runs BOTH rules: the / request is proxied to Service web,
then a second /api request is proxied to Service api, so each branch carries real traffic.
Standard contract: controller and backends are shell + inner box; only Pods pulse; value chips
never flash; packets ride the wires and stop at block edges.

GEOMETRY. Every wire below is derived from a block edge, never hand-typed, so a block and the
packet that rides to it can never drift apart. The Ingress controller Pod is a standard podBlock
(POD_W x POD_H, the same shell used by the web and api backends) rather than an oversized box.

Vertical: everything hangs off FLOW_Y, the midpoint between the rules panel bottom (RULE_BOTTOM)
and the chip strip top (CHIP_Y). The web and api branches are exact mirrors at FLOW_Y -/+ ROW_DY,
so each fan leg, Service and backend Pod share one row.

Horizontal: the rules panel is centred ON THE CONTROLLER (RULE_CX == CTRL_CX), since the rules are
what that Pod watches, and the ownership wire rises straight up from the controller top centre.
The narration overlay really covers user-space x 0..399, y 0..190, and the panel lives at y<190,
so it must start past 399. Centring a panel on the controller therefore FORCES the controller
rightward: at CTRL_CX 485 the widest overlay-clearing centred panel is 150, and the rule chips
need 234. CTRL_CX 545 admits a 260-wide panel (415..675) with 16 to spare. The four columns then
span LB_X..POD_RIGHT = 40..1160, so the scheme still centres in the 1200-wide viewBox.
```

### before `const rulesWire = relationPath({ points: [[CTRL_CX, CTRL_TOP], [CTRL_CX, RULE_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: the controller watches these rules. No packet ever travels
it, so it is a plain dashed line with NO arrowhead, to read as an association rather than a wire
missing its ball. It rises from the controller top centre into the panel centre, so the two read
as one column.
```

### before `const entryLabel = text({ class: 'scheme-label code dim', x: (LB_RIGHT + CTRL_X) / 2, y: FLOW_Y - 12, 'text-an`

```
Three wire labels: the request line rides above the entry hop, and each branch carries the proxy
target the controller chose. The branch labels sit clear of the Service box they name (above the
web one, below the api one, mirrored) rather than in the FAN_X..SVC_X gap, which is only 40 wide
and would put the text straight through the Service border. Blank at build, filled per step.
```

### before `const hostChip = valChip({ x: LB_X, y: CHIP_Y, w: 310, h: 34, name: 'Host', value: 'none', role: 'network' });`

```
The three chips span the scheme 1:1, from the extLB left edge to the backend Pod right edge,
with even 20px gaps. Widths are tuned to their content (TLS carries the longest value).
Host and path are properties of the REQUEST being served, so they read none until one arrives.
```

### before `clearHighlights(s, ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'ctrlBox`

```
The inner app boxes (ctrlBox/podWebBox/podApiBox) are listed so their .highlight is cleared every
step: clearPodHighlight only resets inline strokes, so without them a highlight set in a
reduced-replay block leaks into later steps, since reduced replay never runs the forward motion
path that would otherwise re-clear them.
```

### before `setVal(s.refs.hostChip, 'shop.io');`

```
The request is now on the wire, so its Host and path are known. They are not highlighted yet:
the controller reads them in the next step, this one only terminates TLS. No rule has matched,
so both branches stay neutral.
```

### before `pulsePod(s.refs.ctrl, ctx, 0);`

```
Up-arrow, the controller is the sender: it pulses FIRST as it matches the rule, and only then
does the proxied request leave, at BEAT.afterPulse. The ball rides the right-angle fan to
Service web and hops on to the backend Pod, which pulses on arrival.
```

### poster

```
A routing junction, not another box-and-line row: one request enters a square decision node, which
splits it into two CURVED paths sweeping out to a pair of rounded backend pills. The Ingress rule
table (two bars, the shorter one the more specific rule) docks above the junction and feeds it.
Curves + pills keep this poster from reading like the rectangle rows of its siblings.
Geometry: the junction sits on the flow line y=100, the two pills mirror it at -/+34 (66 and 134),
and every path starts and ends exactly on a shape edge, as everywhere else in this project: the
entry dash meets the square left edge (96), both curves leave its right edge (128), and the rule
table drops onto its top edge (84).
```

---

## network-internal-traffic-policy

### before `const FLOW_Y = 405;`

```
internalTrafficPolicy Cluster vs Local (viewBox 1200x640). The east-west twin of the External Traffic
card: same two values, same Service, but the traffic starts INSIDE the cluster. So the sender is a
client Pod on Node-1, and the question is which endpoints the kube-proxy on THAT Node is allowed to
program: every ready endpoint in the cluster (Cluster), or only the ones sitting on Node-1 (Local).
The third step is the one that separates it from externalTrafficPolicy: Local has no fallback and no
health check, so with no local backend kube-proxy drops the packets instead of forwarding them.

Standard contract: Pods are shell + inner box; only Pods pulse; the Service and kube-proxy are
infrastructure and only light; value chips never flash; packets stop at block edges. A ball never
crosses a Node border: the cross-node leg starts on the Node-1 bottom edge (the packet has left the
Node by then) and ends on the Node-2 bottom edge, and the Pod inside pulses to show it was served.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: the Service sits alone on top, the Node row carries the whole flow on FLOW_Y, and the
underlay lane below the Nodes carries the cross-node hop. The narration overlay really covers
the top-left corner, so the Node row starts at 312 and the Service (the only block that high) lives at
x >= 450, clear of it.

Horizontal: Node-1 is wide because it holds the whole local path (client, dataplane, local backend),
Node-2 only holds the remote backend. The two span 40..1160, so the scheme centres in the viewBox and
the chip strip spans that same extent 1:1.
```

### before `const OWN = [[SVC_CX, SVC_BOTTOM], [SVC_CX, 240], [N1_CX, 240], [N1_CX, NODE_Y]];`

```
Ownership marker, NOT a traffic path: the Service and its EndpointSlices are what kube-proxy on
each Node is programmed from. No packet ever travels it (the ClusterIP never appears on a wire),
so it is a plain dashed polyline with NO arrowhead: an association, not a wire missing its ball
(pathArrow always carries a head, hence the raw path). It drops out of the Service, turns onto the
Node axis and STOPS on the Node top edge rather than reaching into kube-proxy: the Service is an
API object that lives outside any Node, and what it programs inside one is the Node business.
N1_CX and KP_CX happen to be the same 390, so the line still reads as landing on the dataplane.
```

### before `const policyChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 290, h: CHIP_H, name: 'internalTrafficPolicy', valu`

```
The four chips span the scheme 1:1, from the Node-1 left edge to the Node-2 right edge, with even
20px gaps. The policy is a property of the Service, so it is true from the start. The scope, the
hop and the result are outcomes of a call, so they read none until traffic actually flows.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every Node and Pod opacity goes back to full so a dim
set by one policy cannot leak into the next step.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Up-arrow: the client Pod is the sender, so it pulses FIRST and the packet leaves at
BEAT.afterPulse carrying the ClusterIP. kube-proxy lights as it catches it, the DNAT happens
inside the box, and the ball re-emerges below it on the Node edge already carrying the remote
Pod address. The remote backend pulses as the underlay leg lands on its Node.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Same opening as Cluster: the client pulses, the ball carries the ClusterIP to kube-proxy. This
time the DNAT resolves to the local Pod, so the ball leaves the far edge of kube-proxy and stays
inside the Node, and the local backend pulses on arrival.
```

### poster

```
A diptych: the same little scene twice, and the ONLY thing the policy changes is the Node border.
Left is Cluster, so the border is a faint dashed hint: the call reaches the backend inside the Node,
and it also climbs out over that border to the one outside. Right is Local, so the same border is
drawn solid, as a wall: the leg that would leave the Node is cut short and crossed out at the wall,
and the outside backend with its would-be path fade to a ghost, leaving only the short leg that stays
home. Same caller, same two backends, one boundary that either lets traffic through or does not. No
kube-proxy box, no endpoint list and no packets: the card draws those, the poster only has to say
what the switch DOES.
Geometry: two 128-wide Node frames mirrored about the centre divider (16..144 and 176..304), caller
and local backend on one row inside each, the remote backend directly above the local one and outside
the frame, and every leg starting and ending on a shape edge.
```

---

## network-ipam-pod-cidr

### before `const NODE_Y = 312, NODE_W = 300, NODE_H = 290;`

```
Layout zones (viewBox 1200x640):
  - top band (top-left) is reserved for the narration overlay, measured 2026-07-27 at
    right <= 397, bottom <= 255.
  - the controller column (cluster CIDR -> kcm) is centred at x460..740 so it clears the
    overlay; the three Nodes fill the y312..602 band and span 80..1120, centred on 600.
  - every x on the card is derived from NODE_X / NODE_CX, so the Node columns, their slice
    chips, their Pods and the allocation bus cannot drift apart.

CENTRE-LOW is OPEN here on purpose (4 blocks below the overlay span 130..700, centre 415). The
rule cannot see Node frames, so what it measures is the two Pods, which sit in Node-1 and Node-2
because the narration names those two Nodes ("A Pod scheduled to Node-2 gets 10.244.2.8"). Moving
either Pod to Node-3, reordering the Nodes, or inventing a third Pod would each make the card say
something different. The composition itself is centred: three equal Node frames spanning 80..1120
under a control-plane column on their common centre line.
Lessons carried over from network-pod-to-pod-same-node:
  - the Pod is the canonical shell + inner-box block (so the whole group pulses as one).
  - arrows are DIM dashed (no colour override) so the bright ball reads on a muted wire,
    and they sit ABOVE the blocks so they are not hidden under the node rects.
  - only the Pod pulses; boxes/chips get the static highlight + the packet arrival ripple.
  - packets ride exactly along the arrows (segmentPacket endpoints == arrow endpoints).
```

### before `const BRANCH_Y = 264;`

```
The two side allocation arrows turn at right angles: down from the controller to a shared
branch level, then horizontally out to the node, then down into its podCIDR chip. The static
pathArrow and the moving packet share the same point array. The centre arrow stays straight.
```

### before `const cfgArrow   = arrow({ x1: SPINE_X, y1: CFG_Y + CFG_H, x2: SPINE_X, y2: KCM_Y, dashed: true, dim: tru`

```
Dim dashed arrows: config (pool -> kcm), allocation (kcm -> each node slice), and the IPAM
hand-out from each node slice to its Pod. The Node-2 hand-out is revealed only on the final
step, so its arrow starts hidden. They are appended ABOVE the blocks.
```

### before `const dur = 1100;`

```
The kcm carves a slice into each node.spec.podCIDR in one reconcile pass: all three
packets leave together and share one travel time, so the short centre path and the long
side paths all reach their slice at the same moment. The centre simply moves slower.
```

### before `if (ctx.reduced) {`

```
Node-1 pod just keeps its settled IP with no highlight; the action is on Node-2. Reveal
the Node-2 pod and show its own IPAM hand-out: a second pod with a non-overlapping IP
out of its slice proves uniqueness.
```

### before `const IPAM1 = [[NODE_CX[0], SLICE_BOTTOM], [NODE_CX[0], POD_Y]];`

```
Review stage 2.4 family C listed the `ipam` step here as a ball leaving the wrong block. DECLINED
2026-07-30: the ball leaves the BOTTOM EDGE of the Node-1 slice chip, and after the family K rewrite
the sentence reads "its address is drawn by the CNI IPAM strictly out of that Node slice", so the drawn
source and the grammatical one now agree. The card has no CNI and no IPAM block anywhere, so there is
nothing else for it to leave: the slice the address comes out of is the only candidate on the canvas.
```

---

## network-kube-proxy-modes

### before `const CX = 600;                        // canvas centre: the chip strip is built on it`

```
Concept "two routes" (viewBox 1200x640): the same kind of connection to the ClusterIP is resolved
to a backend two ways. The TOP route is iptables, a chain (KUBE-SERVICES -> KUBE-SVC -> KUBE-SEP)
the packet WALKS box by box, stopping at each (O(n)). The BOTTOM route is IPVS, one in-kernel hash
hop (O(1)). Mirror-symmetric about the flow axis: the chain row and the equally wide hash box sit
at equal distance above and below, and each delivers to its own backend Pod through a centred turn,
the chain DOWN to the upper Pod and IPVS UP to the lower Pod (so neither arrow curves back).
Wires and packets ride only the GAPS and stop at box edges; only Pods pulse; boxes light via
.highlight; the inactive lane dims on each mode step.

GEOMETRY (R5, 2026-07-27). Horizontal: SCHEME_L 40 .. SCHEME_R 1160, mirrored about CX 600, and the
three chips are 350 wide with even gaps so the strip centres on 600 by construction. Vertical: the
narration panel measures bottom <= 280 on this card, so AXIS moved 322 -> 352 and the Client Pod
shell (AXIS +/- 64) now clears it. The chain row does NOT centre on 600: its boxes sit ABOVE the
panel bottom, so the row has to start right of the panel edge and ENGINE_L is pinned at 420. That
asymmetry is paid for by the client on the left and the backend column on the right, which is what
puts the CONTENT bbox on 600.
```

---

## network-loadbalancer-bare-metal

### before `const MID_X = 600;`

```
LoadBalancer on bare metal (viewBox 1200x640). The question the card answers is not how a packet is
balanced inside the cluster, it is how the external address becomes REACHABLE at all when no cloud
provisions anything. So the top of the scheme is the upstream router, and the three Nodes below it
are candidates for the address: in L2 mode exactly one of them answers ARP for it, in BGP mode all
three advertise it and the router hashes flows across them.

Standard contract: Pods are shell + inner box; only Pods pulse; the client and the router are
infrastructure and only light; value chips never flash; packets stop at block edges. Traffic is
delivered TO A NODE, never drawn as entering the Pod: a ball stops on the Node top edge and the Pod
inside pulses to show it was served, so no ball ever crosses a Node border.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: client, router, the fan bus, the Node row, the chip strip. The narration overlay really
covers the top-left corner, so the Node row starts at 310 and the client and router (the only blocks
above 300) sit at x >= 450, clear of it.

Horizontal: the three Nodes are the widest row, mirrored about MID_X, so the scheme spans
SCHEME_LEFT..SCHEME_RIGHT = 50..1150 and centres on 600. The chip strip spans that same extent 1:1.
```

### before `const statusChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 300, h: CHIP_H, name: 'status.loadBalancer', value:`

```
The four chips span the scheme 1:1, from the Node-1 left edge to the Node-3 right edge, with even
20px gaps. The pool is declared by the operator but means nothing until an implementation exists,
and the mode and the path are outcomes of announcing, so all three read none at the start.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so the .highlight a reduced replay puts on them is cleared too:
clearPodHighlight only resets inline strokes. Every Node and Pod opacity goes back to full so the dim
the failover step puts on Node-1 cannot leak into a later step.
```

### before `},`

```
An address is allocated by a write, not by a packet: nothing travels here, so nothing moves and
nothing flashes. The two chips it fills simply light. Same reading as a declarative object being
installed.
```

### before `FANS.forEach((fan, i) => {`

```
Three separate client flows, staggered so they read as three, each hashed by the router onto a
different Node. Every flow is literal traffic: it runs the client wire, the router lights as the
first one lands, and each flow then rides its own fan to the Node it hashed to, whose Pod pulses
on arrival. No riding tags here: all three carry the same destination, and three copies of it
sweeping over the router at once would be noise rather than information.
```

### poster

```
Mirrors the diagram: clients above an upstream router, which fans down to three Nodes that each
hold a backend Pod. All three Pods carry the same tint and no ball rides the fan: the poster states
the composition, and which Node actually owns the address is what the steps go on to answer.
Geometry, same rules as the diagram: client and router centred on x=160, the three Nodes mirrored
about it, each Pod centred inside its Node, and every fan leg leaving the router bottom edge and
landing on a Node top edge without ever crossing one.
```

---

## network-model

### before `const RAISE = 64;                        // band/Pods/chips: net +10% up (lowered 5% from the old 96)`

```
Layout zones (viewBox 1200x640):
  - the kubelet box sits centred above the flat-network band. After the RAISE the band reaches
    up near the narration overlay, but only its empty left edge does, no essential text.
  - the CNI badge is tucked under the RIGHT END of the band (its right edge on SCHEME_R 1080)
    rather than parked past it. R5 measured the alternative: with the badge outside the band the
    content bbox can never centre, because the badge always adds CNI_W/4 to the centre no matter
    how the band is sized. Its connector is therefore a straight drop from the badge bottom-centre
    onto the bus spine INSIDE the band, which is the line it was always aiming at, instead of a
    dogleg into the band's right face.
  - one wide band represents the flat Pod network (a single L3 address space). Four Pods hang
    below it on different Nodes, each wired up to the band. Packets ride up the wire, along a
    dashed rail INSIDE the band, and down to the destination: one flat space, no NAT.
Standard contract (matches network-ipam-pod-cidr):
  - Pods are the shell + inner eth0 box, grouped so pulsePod animates both.
  - the band is infrastructure: it lights and flashes, it never pulses. Only Pods pulse.
  - the static wires and the moving packet share the same point arrays.
  - the one place a line sits BELOW blocks not above: the dashed rail lives inside the band.
Band, Pods and chips are raised by RAISE. The kubelet keeps its own higher raise, so the gap
between it and the flat-network band is wider.
```

### before `const POD_W = 180;                       // Pod block width (matches podBlock)`

```
Pod centres along the band, left to right, centred under it: equal end-margins and inner gaps
so the four blocks sit symmetric about the band centre (600) with no overflow. The cross-Node
hop runs A -> C.
```

### before `const CNI_W = 180, CNI_H = 72;`

```
CNI plugin badge: revealed on the last step, pushed to the far top-right, wired from its
bottom-centre down and into the RIGHT SIDE of the band (centred on that edge), to show it is
what implements the flat space.
```

### before `const podLocalX = [AX, BX, CX, DX].map(x => x - BAND_X);`

```
Flat dashed bus inside the band: a horizontal spine with a short tooth turning down toward
each Pod, so the bus abuts every Pod drop-wire at the band edge. No arrowheads here, the
bidirectional arrows live on the Pod wires.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Pod-to-Pod: the sender pulses first, the packet leaves at BEAT.afterPulse and rides the
band to the far Pod, which pulses on arrival. A src-IP tag rides WITH the packet and
arrives unchanged, which is the no-NAT point made visible.
```

### before `s.refs.natChip.classList.add('highlight');`

```
The src tag belonged to the Pod-to-Pod steps. The agent path is not a Pod source, so
clear it rather than leaving a stale 10.244.1.5. The value changes here, so the chip
stays highlighted as a participant rather than going dim beside its lit neighbour.
```

---

## network-namespaces

### before `const POD_TOP = 160;      // Pod netns shell top`

```
Layout (viewBox 1200x640). The host stack and the Pod namespace line up so the veth reads as a
straight cross-namespace link landing dead on eth0, and the host block is vertically centered on
the Pod netns block.

  Host netns ╌╌veth╌╌> [ Pod netns ]   the dashed veth plugs into the Pod namespace boundary.

Inside the Pod netns shell every block plugs into ONE shared stack, drawn as a dashed rail (a bus)
that runs across the stack band. The two interfaces of that single stack hang off the rail: eth0
(the external door, in-Pod end of the veth) and lo (loopback). The two tenant containers (app,
sidecar) tap the same rail from above. So app, sidecar, eth0 and lo are all peers on one stack,
not wired one-to-one.

Connector convention (matches network-model / network-cni-invocation): every dashed line, the veth
and all five interior taps, is drawn ONCE in the same constant dim-dashed style and its opacity is
never changed per step. Progression is shown only by which blocks get .highlight and by the packets
that ride the connectors, never by fading wires in and out.

Choreography (motion follows the steps, blocks light via .highlight, only the Pod shell pulses):
  fresh  - only lo is live: lo lights and flashes, nothing flows yet.
  veth   - a packet crosses the veth, eth0 lights on arrival, the pod pulses.
  shared - app, sidecar and eth0 all light, a localhost packet rides app -> rail -> sidecar, lo lights.
  isolation - host, eth0 and lo stay lit (the live host link), the whole shared stack pulses as one
              private unit that lives and dies together.
```

### before `const band = rect({ class: 'netns-stack-band', x: BAND_CX - 204, y: 276, w: 408, h: 122, rx: 10,`

```
The shared network stack: a faint band, and inside it a dashed rail (the bus). app + sidecar tap
the rail from above, eth0 + lo from below, so all four are peers on ONE stack. The band, rail and
taps live in podGroup so they pulse as one unit with the pod.
```

### before `const hop = routePacket(s, ctx, LOCAL_PATH, { role: 'network' });`

```
One localhost packet rides app -> rail -> sidecar over the shared stack: it drops down the app
tap, crosses the rail and climbs the sidecar tap, so it traces both joins and the localhost
hop in a single motion. lo (the loopback that serves it) lights on arrival.
```

### poster

```
Host netns on the left, one centered dashed veth crossing into the Pod netns box. Inside, app +
sidecar on top and eth0 + lo below are all joined by one H-shaped shared-stack rail. Symmetric
about the Pod centre.
```

---

## network-netfilter-path

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;`

```
The netfilter path a packet takes (viewBox 1200x640). Every other Network Foundations card names an
OPERATION on a packet (kube-proxy DNATs, conntrack pins the flow, egress MASQUERADEs) without ever
saying WHERE in the kernel it runs. This card is that missing floor: the hooks, in order, with the
packet walking them. The order is the lesson, so the whole composition is one left-to-right chain and
the packet never doubles back on it: PREROUTING, the routing decision, FORWARD, POSTROUTING, the wire.

Standard contract: the Pod is a shell + inner box; only Pods pulse; the hooks, the conntrack table and
the NIC are infrastructure and light on packet arrival, never pulse; value chips never flash; packets
stop at block edges. The closing eBPF step carries no motion at all: it is a comparison, not traffic.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Horizontal: the five blocks of the chain span the Node 1:1, from the PREROUTING left edge (70) to the
eth0 right edge (1140), with even gaps, and the chip strip spans exactly that same extent. The
conntrack table sits under the four hooks it belongs to (70..950) and stops where the wire begins,
because a packet on the wire is past it.

Vertical: the narration overlay really covers the top-left corner, so the Node frame starts at 305 and
the client Pod, the only block above it, sits at x >= 450, clear of the panel. Its packet drops
straight down and only turns left once it is INSIDE the Node, below the panel. The reply rides its own
lane (RETURN, y 360) above the chain rather than retracing the forward wires backwards, the same rule
every round-trip card here follows.

The conntrack ownership marker (CT_LINK) is a BRACKET, not a stub: it leaves PREROUTING at its
bottom-edge midpoint, steps across in the gap between the two rows, and lands on the conntrack
table's own top-edge midpoint (510). A straight stub from PREROUTING landed 335 units off that
midpoint, which reads as a lane pointing at nothing in particular and is what OFFEDGE reports. Both
ends of the bracket now sit on a face midpoint. Same shape on network-north-south-path.
```

### before `const hookChip = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none', role: 'network' });`

```
The four chips span the SCHEME 1:1, edge to edge with the Node frame (40..1160), which is the widest
element on the canvas, so the strip and the frame share both verticals and the composition reads as
one column. hook is where the packet is right now, dst and src are what it carries there, and
conntrack is what the kernel remembers about it. All four are outcomes of a packet in flight, so
they read the values it starts with and the steps rewrite them exactly where the kernel does.
```

### before `function clearHL(s) {`

```
The inner app box is listed by key so the .highlight a reduced replay puts on it is cleared too:
clearPodHighlight only resets inline strokes. Every dimmable block goes back to full opacity so the dim
the eBPF step puts on the chain cannot leak into a replay of an earlier step.
```

### poster

```
Mirrors the diagram: a Pod above the Node, and inside it the netfilter chain as one left-to-right row
of hooks ending at the wire, with the conntrack table docked under the hooks it belongs to. The row IS
the card (the order of the hooks is the lesson), so the poster is that chain and nothing else. No ball
rides it: where the packet gets rewritten is what the steps answer.
Geometry, same rules as the diagram: every dash starts and ends on a shape edge, and the entry only
turns left once it is inside the Node.
Three shapes on the way in, one band on the way back, nothing else. The two NAT hooks are the boxes,
and each carries the same rewrite glyph, one address chip becoming another: the destination on the way
in, the source on the way out. Between them the routing decision is a diamond, the only shape that is
not a box because it is the only one that CHOOSES, and it sits AFTER the first rewrite, which is the
whole reason the order matters: routing only ever sees the already rewritten address. The reply walks
none of it: the conntrack band under the rail IS the way back, unattached to any hook because it skips
them all, the reply riding it right to left. Walk the chain one way, ride the memory back.
FORWARD, the filter hook and the Node frame are left out on purpose: the card draws the full chain, the
poster only has to say why its ORDER is the point.
Geometry: the rail on y=65 symmetric about the diamond at x=160, the band under it, every dash starting
and ending on a shape edge.
```

---

## network-nodelocal-dnscache

### before `const FLOW_Y = 300;`

```
NodeLocal DNSCache (viewBox 1200x640). A Node box holds the client Pod and the node-local-dns agent,
with the upstream CoreDNS outside it on the right. Everything is centred on one flow line (FLOW_Y).

There are TWO hops, and each has its OWN pair of lanes: query out on FWD_Y, answer back on RET_Y.
A single shared wire would force the returning ball to retrace the outbound arrow, which reads as the
query bouncing rather than as an answer coming home. Every ball rides the wire that was drawn for it.

Content spans x 70..1120 (centre 595) and y 200..484, so it sits centred on the canvas. It cannot go
higher: the Node box starts at x=70, under the narration overlay, whose longest step here reaches
y=163 (measured, not assumed). 200 leaves ~37px of clearance.
```

### before `function setChips(s, { path, cache, up, ct }, lit = []) {`

```
Every step repaints ALL four readouts. Setting only the chips a step talks about leaves the others
showing the previous step: that is how the miss step came to claim `conntrack: no entry` while it was
busy opening a DNAT-ed TCP connection to the kube-dns ClusterIP, which does create one.
```

### before `setChips(s, { path: 'agent -> CoreDNS', cache: 'miss -> fill', up: 'TCP keep-alive', ct: '1 long-lived' }, ['c`

```
conntrack is NOT `no entry` here: the upstream leg is a real connection to the kube-dns
ClusterIP, so kube-proxy DNATs it and it is tracked. The win is that it is ONE long-lived entry
reused by every miss, not one fresh UDP entry per lookup.
```

### note (anchor dropped: `const asked = ask(s, ctx, { start: 0, label: 'dst 169.254.20` is not unique in the file)

```
Four hops, because the narration promises all four: the Pod asks, the agent misses and forwards
upstream, CoreDNS answers back to the agent, and only then does the agent answer the Pod. The
old version stopped at the upstream query, so the answer it claimed to cache never arrived.
```

### poster

```
Near traffic and far traffic. Everything the Pods ask stays on one short rail inside the Node,
where the local agent answers it, and a single thin thread climbs OUT of the Node to the cluster
resolver: that is the miss, and it is the only lookup that pays for the trip. The meaning is in the
distances, not the topology, so the poster keeps the Node boundary (the line the thread has to
cross) and drops everything else the card already draws, packet dots included.
```

---

## network-nodeport-loadbalancer

### before `const CX = 600;                        // canvas centre: the client, the LB and the fan origin sit on it`

```
NodePort and LoadBalancer (viewBox 1200x640). External client sits above the LB (top-left is the
narration zone), the LB fans down to every Node through a right-angle bus, and the chosen Node
DNATs to a backing Pod. Standard contract: Pods are shell + inner box; only Pods pulse; value
chips never flash; a packet-less pod-less step gets one box flash. Packets stop at block edges.

GEOMETRY (R5, 2026-07-27). One Node grid drives everything: three frames of 300 spanning
SCHEME_L 80 .. SCHEME_R 1120, and NODE_CX centres the nodePort chip, the backend Pod and the bottom
info chip of each column. The two backend Pods sit on the OUTER Nodes (1 and 3), not on 1 and 2:
that is what puts the low-block bbox on 600, and it also puts the Pod-less Node in the middle,
where the nodePort step wants it ("even on Nodes that run no backend Pod"). The Node-3 Pod IP moved
from 10.244.2.7 to 10.244.3.9 with it, so the per-Node CIDR the card sets up by example still holds.
```

### before `const toLb = segmentPacket(s, ctx, { from: C_TO_LB[0], to: C_TO_LB[1], role: 'network' });`

```
client -> LB (down), then LB picks Node-1 along the right-angle fan; the nodePort lights.
The tag on the LB leg names the Node and its nodePort, since the balancer has already rewritten both: it emerges from the client into the first gap,
vanishes into the LB, then re-emerges out of the LB bottom and rides the fan to the Node. Each
leg only shows the text in the open gap between blocks, never sliding it over the LB itself.
```

### poster

```
Client to LB, fanning out to node ports across three nodes.
External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
fan down to three Nodes, backend Pods only under two of them (the third Node runs no Pod).
```

---

## network-north-south-path

### before `const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it`

```
North-south request path (viewBox 1200x640). NORTH-SOUTH is the name of the thing being drawn:
traffic crossing the cluster boundary, as opposed to east-west Pod to Pod traffic. Instead of a bare
full-height divider line, the composition is framed by two faint regions: an outside-the-cluster box
on the left holding the client and cloud LB, and the Node box on the right holding kube-proxy,
conntrack and the Pod. The empty GAP between the two regions IS the boundary, and the ball visibly
crosses it once on the way in (LB2KP) and once on the way out (KP2LB).

Standard contract: the Pod is a shell + inner box; only the Pod pulses; infrastructure (client, LB,
kube-proxy, conntrack) lights via lightBoxAt and never pulses; value chips never flash; packets ride
the wires and stop at block edges.

GEOMETRY. Every wire and every packet is derived from a block edge, never hand-typed.

Vertical: two lanes, FWD_Y above and RET_Y below the spine, because this card is a ROUND TRIP. A
single retraced lane would send the reply backwards along a right-pointing arrowhead. Every block on
the path is centred on FLOW_Y, so both lanes meet every block on its edge. The narration overlay
really covers the top-left corner, so the client and LB blocks sit at y >= 315 while the faint region
boxes frame up to REGION_TOP to fill the top of the canvas and pull the whole scheme up and centred.

Horizontal: client and cloud LB live in the outside region, kube-proxy, conntrack and the backend Pod
live inside the Node region. conntrack is a real block here rather than a word in the narration: it is
what pins the flow on the way in and what unwinds the DNAT on the way out, and it fills the Node
interior. The framed diagram and the info-chip strip both span the same width, from the outside region
left edge (22) to the Node region right edge (1176), so the scheme reads as one column.

The conntrack ownership marker (CT_LINK) is a BRACKET: it leaves kube-proxy at its bottom-edge
midpoint, steps across in the gap between the rows, and lands on the conntrack table's own top-edge
midpoint (860). A straight stub down from kube-proxy landed 175 units off that midpoint, which is
what OFFEDGE reports. Same shape as network-netfilter-path.

Addresses ride ALONG with the ball (ridingLabel) instead of sitting as static wire text. That is the
whole point of the card: the same packet carries dst 203.0.113.9:443, then dst 192.168.1.20:31000,
then dst 10.244.2.7:8080, and the reply unwinds those same three values as src. As inline wire text
the longest of them overflowed its 80-unit gap and printed straight through the Pod border.
```

### before `const REGION_TOP = 264, REGION_BOT = 488;`

```
Two faint framing regions replace the old full-height divider line. Both share the same top and
height so they read as a matched pair, and the empty gap between them (EXT right 492 .. Node left 540)
is the cluster boundary the north-south hops cross.
```

### before `const extRegion = node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' });`

```
The two faint framing regions. Both use the node() primitive so they read as one matched pair of
barely-visible dashed containers: left is everything outside Kubernetes, right is the Node. The
outside region carries its title at the BOTTOM-left instead of the top so the narration overlay
(which sits over the top-left) never hides it.
```

### poster

```
Client and cloud LB outside a full-height cluster edge, kube-proxy + conntrack + Pod inside the
Node. Two lanes (request above, reply below) make the round trip read as a loop, not a retrace.
North-south = crossing the cluster boundary and coming straight back. Two faint framed regions
(outside | Node) separated by a gap that IS the boundary: a request packet crosses it left to right
on the top lane, the reply crosses right to left on the bottom lane. Inside the outside region a
client square feeds a LB pill, inside the Node a kube-proxy pill hands off to the backend Pod while
a 2x2 conntrack/NAT table sits under it. Abstracted from the dialog so it reads as a boundary
crossing and a round trip, not a row of boxes.
```

---

## network-pod-egress-snat

### before `const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetr`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. A Node box
holds the client Pod and the MASQUERADE box; the Internet box sits OUTSIDE it in its own right-hand
column, its top level with the Node frame (NET_Y = NODE_Y), above the egress lanes. It used to be
lifted to y110, i.e. above the panel bottom (measured 181 here), which left the three blocks that
DO sit below the panel spanning 110..630 and centring on 370: CENTRE-LOW. Levelling it with the
Node frame is what puts that row on 600, and the forward leg still turns UP out of the Node into
it. Forward and return traffic ride SEPARATE parallel lanes so the round trip
reads as a loop: the request goes out along the upper lane (FWD_Y) and turns up into the Internet
box, the reply comes down and returns along the lower lane (RET_Y). Both lanes sit inside the box
heights so a ball never travels under a box. The Node left edge and the Internet right edge line up
with the leftmost (src) and rightmost (dst) chips below, so the top row and the info strip share
extremes. The SNAT and the reverse SNAT happen INSIDE the masquerade box, so the ball fades at one
edge and re-emerges at the far edge. masquerade/net are infrastructure: they light, they never
pulse. Only the Pod pulses. Source/destination IPs are not inline wire text: they ride ALONG with
the ball on each hop (ridingLabel), forward on send/masquerade and in reverse on reply/deliver.
```

### before `const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];`

```
Forward leg as one right-angle path: out from MASQ_RIGHT along FWD_Y, then up at FWD_UP_X into the
box bottom. Return leg mirrors it on the lower lane: down at RET_DOWN_X, then back along RET_Y to
MASQ_RIGHT. Each static wire and its moving ball share the exact array. Both ends sit at block
edges so the ball never travels under a box.
```

### before `const back = routePacket(s, ctx, RET_PATH, { role: 'network' });`

```
Return lane: the reply ball descends out of the Internet box and runs back along RET_Y into
the masquerade box (reverse SNAT inside), which lights on arrival. The dst it still carries
(node IP) rides along.
```

### poster

```
A Node wrapping a client Pod (outer shell + inner app) and a MASQUERADE box, with the Internet as
a small globe off to the right. Two dashed lanes cross the SNAT boundary as a round trip: the
request runs left to right on the top lane, the reply runs right to left on the bottom lane,
chevrons mark the direction. Pod, masq and internet share one centre row.
```

---

## network-pod-ip-and-veth

### before `const LINK_Y = 396; // shared y for the veth link, the loopback link and the packets on them`

```
Layout zones (viewBox 1200x640): top band reserved for the narration overlay, the Node and
everything inside it sit in the y228..528 band (lifted for balance, with a gap to the chip
strip at y560), so the CNI plugin stays inside the Node box and nothing touches the panel.
Every packet rides exactly along a dashed link (segmentPacket endpoints == link endpoints).

Horizontally the inner row is CENTRED IN ITS FRAME, and that is a derivation rather than a set of
typed x values: INNER_W = Pod shell + the veth run + the bridge column, and POD_X = NODE_X +
(NODE_W - INNER_W) / 2. Before R5 the row sat at 150..960 inside a frame spanning 80..1120, i.e. 70
of margin on the left against 160 on the right, which CENTRE-LOW reported as a bbox centred on 555.
```

### before `root.appendChild(nodeEl);`

```
Z-order (bottom -> top): Node background, then the boxes, then the wires + their
labels ON TOP of the boxes (so a connector that crosses a box stays visible and the
text is selectable), then the value-chip strip, and finally the packet layer so the
ball rides above everything.
```

### before `s.refs.appBox.classList.add('highlight');`

```
Sequence (no pulses, just persistent highlight borders like the workloads cards):
the app block lights first and stays lit, then the loopback ball travels, then the
pause block lights on arrival.
```

### poster

```
The scheme in miniature, workloads/cluster style (brightness hierarchy + one bright accent):
the Pod netns holds pause (bright, the netns owner) and app (dim), a single bright IP bar spans
both (one address, shared), and the hero is the veth pair: two lit end-nodes (eth0 in the Pod
and its host-side peer) joined by a dashed link out to the cni0 host bridge.
```

---

## network-pod-localhost

### before `const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;  // [620..1120] spans the bind + Pod IP chip`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The two blocks
positioned over the chip strip below: the client Pod is centred over the leftmost chip (path),
centre x205, and the Pod shell spans the two rightmost chips (bind + Pod IP), x620 to x1120.
They share one vertical centre (y334), so the external lane between them is a straight,
centred horizontal hop. Inside the shell a symmetric 2x2 grid holds the two containers up top
(app, sidecar) and the two shared interfaces down low (eth0, lo). Two lanes: the localhost lane
(app <-> sidecar, y262) never leaves the Pod and is served by lo, and the external lane carries
outside traffic across the gap to the shared eth0. The Pod is the unit that pulses, the containers
and interface boxes are infrastructure that light.
```

### before `const EXT_PATH = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];`

```
External lane: one straight, centred horizontal hop across the gap, at the shared vertical centre
of both Pods. The destination address rides ON the moving ball (ridingLabel), so there is no
static inline label to collide with anything.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Pod to Pod: the sending client pulses first, the packet leaves at BEAT.afterPulse and rides
one straight hop to the shared eth0, carrying its dst address as a riding label. On arrival
the receiving Pod pulses to acknowledge the packet, and the shared eth0 plus the answering
app light.
```

### poster

```
One Pod box with two containers linked over a short localhost lane.
Two containers side by side, both wired into one shared loopback node (lo, 127.0.0.1) in the
middle: they share localhost and one network stack. Sub-blocks centred inside the Pod.
```

---

## network-pod-to-pod-cross-node

### before `const VETH_Y = 338;       // veth links inside each node + the short packets on them`

```
Layout zones (viewBox 1200x640):
  - top band y<210 is reserved for the narration overlay; nothing essential lives there.
  - topology band y220..450 carries both Nodes, each with a Pod (shell + eth0 box) and the
    node cni0 dataplane box. Lifted ~50px from the first cut for vertical balance.
  - the physical underlay runs BELOW the nodes at UNDERLAY_Y; the cni0-to-cni0 link is ONE
    continuous turning path (cni1 bottom -> underlay -> cni2 bottom), not three arrows.
  - value-chip strip at y538 spans exactly Node-1's left edge to Node-2's right edge.
Each Pod is the canonical shell+inner-box block (matches the same-node / veth cards): a
translucent pod shell wraps an eth0 container box in one <g>, so pulsePod animates both
rects together and the whole Pod blinks as a unit. The pod and cni0 blocks are spaced so the
veth wire label fits in the gap without touching a block, while the cni0 stays inside the Node.
Every packet rides ONLY along the visible dashed wires in the gaps between blocks, never
over or under a block: a hop ends at a block edge (the ball fades out there) and the next
hop starts from the far edge of that block, so the ball appears to enter the block and
re-emerge on the other side. Short veth hops use segmentPacket (linear); the cross-underlay
leg uses routePacket over the SAME point array as the underlay pathArrow so wire and ball agree.
```

### before `const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]]`

```
The cross-underlay leg, cni1 bottom -> underlay -> cni2 bottom, as one turning polyline. It
starts and ends at the block bottom EDGES, so the ball never travels under a cni0 box. The
static underlay pathArrow and the moving packet share this exact array.
```

### before `root.appendChild(node1);`

```
Z-order (bottom -> top): Node backgrounds, then the cni0 boxes and Pods, then the wires +
labels ON TOP of the blocks (so dashed links and text stay crisp), then the chip strip, and
finally the packet layer so the ball rides above everything. The ball never overlaps a block
anyway (every hop lives in a gap and stops at a block edge), so no occlusion trick is needed.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Up-arrow: A pulses first, then the packet travels the full Pod A -> Pod B journey as three
wire-only hops. Each hop ends at a block edge and the next starts from the block's far edge,
so the ball visibly enters a cni0 and re-emerges on the other side, never sliding over it.
```

### poster

```
Two nodes joined by an underlay carrying an encapsulated packet.
The hero is encapsulation itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is
a packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod is
bright, dest dim, the wrapped packet crosses the inter-Node gap on a dashed flow. Nesting reads
as the Pod frame carried between Nodes inside an outer envelope (VXLAN, or bare when routed).
```

---

## network-pod-to-pod-same-node

### before `const POD_MID = 380;          // vertical centre of the pod / cni0 blocks`

```
Layout zones (viewBox 1200x640):
  - top band y<255 is reserved for the narration overlay; nothing essential lives there.
  - topology band y255..505 carries the Node, both Pods (shell + eth0 box) and the cni0 bridge.
  - value-chip strip sits at y540, below everything and clear of the overlay.
Each Pod is the canonical shell+inner-box block (matches the workloads/cluster cards):
a translucent pod shell holds an eth0 container box, so the whole group pulses as one.
The veth pair is drawn as TWO directional lanes, symmetric about the block centre:
  - top lane  (TOP_Y) carries the forward direction A -> B (ARP request + data frame)
  - bottom lane (BOT_Y) carries the return direction B -> A (the ARP reply)
Every packet rides exactly along its lane's arrow (segmentPacket endpoints == arrow
endpoints == block edges, no overshoot into a box).
```

### before `pulsePod(s.refs.podA, ctx, 0);                // A broadcasts the request (blink first)`

```
A pulses FIRST and fully; the request ball departs only once that blink has
landed (BEAT.afterPulse), per the up-arrow choreography. The ARP exchange is a
round trip: request floods A -> bridge -> B on the top lane, then B unicasts its
reply B -> bridge -> A on the bottom lane.
```

### poster

```
Two pods on the same node, bridged through cni0.
Same shape as the cross-node card but wholly inside ONE big Node block (both Pods share it): Pod
A (bright source) and Pod B (dim dest) flank the cni0 bridge, joined by clean dashed veths (no
packet dots). The hero is the bright frame sitting BARE inside the bridge, no outer wrapper,
which is the same-node point: switched at layer 2 with no NAT and no encapsulation.
```

---

## network-service-cidr

### before `const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600`

```
Layout zones (viewBox 1200x640):
  - the top-left band is reserved for the narration overlay, so the pool box
    sits at x>=440 and the bands start at y=320.
Sibling card: network-ipam-pod-cidr (the pod-CIDR allocation analog). This is the Service-side
twin: one configured Service CIDR splits into a static and a dynamic band, hand-picked IPs come
out of the static band, the allocator draws ClusterIPs from the dynamic band, and a second
ServiceCIDR can be added to grow the range. There are no Pods, so motion is packets + box
.highlight + an arrival ripple (only Pods pulse, and this card has none).

Alignment grammar (the common rule every wire follows, mirrors ipam-pod-cidr):
  - One horizontal distribution rail per fork. The pool forks on the y230 rail to each band
    centre, the bands fork on the y428 rail to their Services. Every drop lands on a box centre.
  - Services sit on an even 260 / 600 / 940 grid, edges flush with the band bar (120..1080).
  - The add-on CIDR is stacked directly over the web column (x940), so add-on -> dynamic band ->
    web read as one vertical line on the extend step instead of a stray top-right box.
  - The static pathArrow and the moving packet share the same point array so the ball rides
    exactly on the wire.
  - The IPAddress chip is a FULL-WIDTH bottom strip (SCHEME_L..SCHEME_R), not a 280-wide cell
    parked under the web column. Two findings closed at once: a lone 280-wide chip at 800..1080 is
    a chip strip centred on 940, and the value it carries (10.96.137.42 . default/web) did not fit
    beside its own name in 280, the one chipfit collision the catalog carried into R5. The binding
    to web is not lost, because the value names the Service.
```

### before `const aSplit1 = pathArrow({ points: SPLIT_STATIC, dashed: true, dim: true });`

```
Dim dashed wires: pool splits into both bands, static band feeds the two well-known
Services, dynamic band feeds web, and the add-on CIDR feeds the dynamic band (hidden until
the extend step). They sit ABOVE the blocks so the bright ball reads on a muted wire.
```

---

## network-service-clusterip

### before `const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The client sits
on the center line (FLOW_Y) facing kube-proxy, and the two backend Pods sit SYMMETRIC above and
below that line, podY the exact vertical mirror of podX. Each backend is wired to kube-proxy by a
forward fan (kube-proxy -> Pod) and a return fan (Pod -> kube-proxy) of the identical shape, so the
arrows travel the same on top and bottom and always meet a Pod at its left edge. The virtual
ClusterIP is lifted ABOVE kube-proxy (it owns no interface, the packet never reaches it, kube-proxy
intercepts). Forward and return traffic ride SEPARATE lanes so a round trip reads as a loop, never a
retrace. The DNAT and the reverse NAT happen INSIDE kube-proxy, so the ball fades at one edge and
re-emerges at the far edge. vip and kube-proxy are infrastructure: they light, they never pulse.
Only Pods pulse. Addresses ride ALONG with the ball on each hop (ridingLabel), not as inline wire
text: the ClusterIP dst on the way in, the Pod IP after DNAT, the Pod IP then the reversed ClusterIP
src on the way back. Flow 1 runs to podX (send/dnat/reply), flow 2 to podY (balance/balance-reply).

GEOMETRY (R5, 2026-07-27). This card is the Networking exemplar, so its extents are the ones other
networking cards copy: CX 600, SCHEME_L 60, SCHEME_R 1140, the same L/R/CX the Workloads canon (WL)
uses. Everything is derived from those three: the client on SCHEME_L, the ClusterIP and kube-proxy
column mirrored about CX (KP_LEFT/KP_RIGHT = CX -/+ KP_W/2), the backend column flush on SCHEME_R,
and the two fan buses offset from KP_RIGHT. Before R5 the whole drawing sat 50 units left of that,
so the middle column stood on 550 and the content bbox on 550 with margins 70 / 170.

The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225 / 215),
each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs the widest cell.
Four cells in one row cannot all reach the 350 floor a bottom strip normally wants, and this row
predates that floor; check-chipfit measures it clean, which is the test that matters.
```

### before `const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];`

```
Each static wire and its moving ball share the exact same array, and podY's fans are the vertical
mirror of podX's, so both backends are wired identically. Both ends sit at block edges so a ball
never travels under a box.
```

### before `const SLOWMO = 1.1;`

```
This card glides its packets 10% slower than the shared canon speed (routeDur). Only the ball
travel is slowed, via an explicit dur; every other beat (pulses, hops, step floors) stays on the
standard canon, so the overall process matches every other card. Riding src/dst-IP labels use the
same slowDur so they stay locked to the ball. Registered in tools/check-canon.mjs ALLOW_EXPLICIT_DUR.
```

### before `const cWireFwd = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });`

```
Client <-> kube-proxy lanes (upper forward, lower return). The vip->kproxy ownership link. Then
the four backend fans: forward and return for podX (top) and their vertical mirror for podY
(bottom), so both Pods are wired to kube-proxy identically.
```

### before `const ownLink  = relationPath({ points: [[CX, VIP_BOTTOM], [CX, KP_TOP]], role: 'network', dash: '5 5' });`

```
Ownership marker, NOT a traffic path: kube-proxy realizes this virtual IP. No packet ever
travels it (the ClusterIP never appears on a wire), so it is a plain dashed line with no
arrowhead, to read as an association rather than a wire missing its ball.
```

### before `const vipChip  = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20:80', role: 'network' });`

```
The four chips span the full block width of the scheme 1:1: the leftmost starts at the Client
Pod left edge (x=70) and the rightmost ends at the backend Pod right edge (POD_LEFT+POD_W=1030),
with even 20px gaps. Widths are tuned to their content (DNAT carries the longest value).
```

### before `clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'pod`

```
The inner app boxes (clientBox/podXBox/podYBox) are listed so their .highlight is cleared every
step: without them a highlight set in a reduced-replay block would leak into later steps, since
reduced replay never runs the forward motion path that would otherwise re-clear them. Both Pod
opacities reset to 1 so a dim set by an earlier flow does not persist into the next.
```

### before `},`

```
The endpoint IPs the rules point at are named in the DNAT chip. The backend Pods are NOT
highlighted yet: nothing has been DNAT-ed to them at this stage, they light only when a flow
actually lands on them (dnat / balance). Here only kube-proxy is the actor.
```

### before `const give = routePacket(s, ctx, FAN_FWD_X, { dur: slowDur(FAN_FWD_X), role: 'network' });`

```
Down-arrow: the DNAT-ed packet emerges from kube-proxy (the rewrite happened inside it) and
rides the forward fan to the chosen Pod, which pulses on arrival. The rewritten Pod IP rides
with the ball.
```

### before `pulsePod(s.refs.podX, ctx, 0);`

```
Up-arrow first: the chosen Pod pulses, then the reply leaves along the return fan carrying the
Pod source IP and reaches kube-proxy, which lights as it reverses the NAT inside the box. The
ball hides at the kube-proxy right edge and re-emerges at the left edge carrying the restored
ClusterIP source, then runs the return lane to the client, which pulses on arrival.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Second connection, mirror of the first flow but to podY: the client pulses, the packet runs the
forward lane to kube-proxy carrying the ClusterIP dst, then the DNAT-ed packet emerges and rides
podY forward fan (down) to the OTHER backend, which pulses on arrival. Flow 1 stays on podX.
```

### before `pulsePod(s.refs.podY, ctx, 0);`

```
Exact mirror of reply, but for podY on the lower fans: podY pulses, the reply rides podY return
fan (up) to kube-proxy, which lights as it reverses the NAT inside the box, then the ball hides
at the right edge, re-emerges at the left with the restored ClusterIP source and runs the return
lane to the client, which pulses on arrival.
```

### poster

```
Abstract, not the literal diagram: a client feeds a dashed virtual ClusterIP ring (it owns no
interface), which kube-proxy intercepts at a solid pivot and fans to two symmetric backends, one
chosen (lit) and one alternative (dim). The one-of-many DNAT, distilled to a hub and a fan.
```

---

## network-service-ports

### before `const FLOW_Y = 312;                 // shared vertical center of both Pods and the Service box`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. One straight
left-to-right flow along FLOW_Y, client Pod -> Service -> backend Pod, so every hop is a crisp
horizontal segmentPacket (linear). The port translation happens INSIDE the Service box: kube-proxy
DNATs port -> targetPort, so the ball fades in at the Service left edge on the dial hop, the map
step flashes the box where the rewrite lives, then the ball re-emerges from the Service right edge
on the deliver hop. The Service is infrastructure: it lights on packet arrival (lightBoxAt), it
never pulses. Only Pods pulse. This card is a one-way flow (no reply is shown), so there is no
return lane. The two values that travel do not sit as static wire text: they ride ON the ball
(ridingLabel). The client dials web:80 on the dial hop, and the named-port resolution http -> 8080
rides on the deliver hop. The chip strip below tracks the four port numbers as fixed facts.
```

### before `const give = segmentPacket(s, ctx, { from: DELIVER_PATH[0], to: DELIVER_PATH[1], role: 'network' });`

```
Down-arrow: the packet re-emerges from the Service right edge (DNAT done inside) and is
delivered to the backend Pod, which pulses on arrival. The resolved named port http -> 8080
rides with the ball.
```

### poster

```
Abstract, not the literal diagram: the client-facing port lives on one level and the container
targetPort on another. Traffic enters the Service high on the front-door plane and leaves low on
the container plane, and the vertical step through the box is the port -> targetPort remap. A ring
centred on each dashed hop marks the port on that plane: the front-door port and the container port.
```

---

## network-service-terminating-endpoints

### before `const FLOW_Y = 326;                     // center line: client and kube-proxy are centred on it`

```
Terminating endpoints and connection draining during a rollout (viewBox 1200x640). This is the
story of the few seconds while a backing Pod shuts down, and why a clean rollout drops nothing.
Layout: the Client sits left on the center line facing kube-proxy in the middle, and two backend
Pods sit on the right, web-a (stays Ready, top) and web-c (the one being retired, bottom). Two
right-angle fans run from kube-proxy to each Pod (entering the Pod at 90). The bottom chip strip is the endpoint state that
actually drives routing: web-c endpoint conditions (ready / serving / terminating), where new
connections are allowed to land, and the grace-period window.

Standard contract: Pods are shell + inner box and pulse as one, kube-proxy is infrastructure (it
lights, never pulses), value chips never flash (they light via lightBoxAt or carry .highlight as
durable state). What MOVES rides on the ball: each hop tags itself new conn or in-flight via
ridingLabel, so there is no inline wire text to collide with the boxes. web-c dims as it leaves
the serving set but keeps a serving flow during the drain window.
```

### before `const LANE  = [[CLIENT_EDGE, FLOW_Y], [KP_LEFT, FLOW_Y]];                                              // clie`

```
across every step so the fade never reads as a new state
Each static wire and its moving ball share the exact same array. The fans are right-angle routes:
out of kube-proxy horizontally, up or down the shared bus, then straight into the Pod left edge at 90.
```

### before `const drain = routePacket(s, ctx, FAN_C, { delay: 0, role: 'network' });`

```
Two flows at once. The in-flight connection keeps draining to web-c (a packet on the web-c fan,
web-c pulses through its dimmed state on arrival). As it lands, a fresh connection starts from
the client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
```

### poster

```
Client to kube-proxy, which fans at right angles to two symmetric backends: web-a (Ready, top,
solid, neutral endpoint bar) takes new connections, while web-c (Terminating, bottom, dashed) is
still serving one in-flight flow, shown by the cyan drain lane and its cyan serving bar. The solid
vs dashed pair is the whole idea: one healthy backend and one that is draining before it leaves.
```

---

## network-service-types

### before `const TYPE_X = 210, TYPE_W = 280;          // type column: left edge + width (right edge 490)`

```
Layout zones (viewBox 1200x640): this is a MAP card, not a traffic flow, so there is no round
trip, no return lane and no bottom chip strip. The whole composition is centred on the canvas:
the type column and the target column sit symmetric about x600 (210..990), with the narration
overlay floating over the empty top-left margin. The type column starts at x210, LEFT of the
panel's right edge, so the rows have to clear the panel by height instead: ROW0 moved 132 -> 186
in R5 because the panel measures bottom <= 181 here and the top ClusterIP row was 46% under it.
Moving the columns right instead was measured and rejected: it puts the content bbox on 740.
Five Service-type rows on the left point STRAIGHT ACROSS to their targets on the right, one row
each. ClusterIP, NodePort and LoadBalancer all proxy to the same shared backend node (they stack,
each builds on the one above), while ExternalName and Headless are the odd ones out (no proxy, no
selector) and point at their own boxes.
Standard contract (Jul motion canon + core-networking pod build, as a map card):
  - Only Pods pulse. Boxes and the backend node light via lightBoxAt, SYNCED to the packet
    arriving on that row, never instantly.
  - Pods are the core-networking build: a shell plus an inner app/eth0 box, grouped so pulsePod
    animates both (matches network-model / network-service-clusterip).
  - Every arrow is a straight horizontal hop at its row centre. Exits are centred on the type box
    right edge, entries are centred on the target left edge. The three proxy entries land on the
    backend node symmetric about its vertical centre (221 / 309 / 397 about 309), so the fan reads
    balanced with no angled lines.
  - Each hop carries a short ridingLabel tagging the MECHANISM the row uses (via kube-proxy for the
    three proxy types, CNAME for ExternalName, Pod IP direct for Headless).
  - The three proxy rows forward to a backend, so they read down-arrow: packet first, then the
    receiving Pod pulses on arrival. ExternalName and Headless target boxes, not Pods, so there is
    no pulse there, only the arrival ripple plus the target box lighting.
  - Each static arrow shares the exact endpoints of the packet route on that row.
```

### before `const aCI = arrow({ x1: TYPE_EDGE, y1: cy(Y_CI), x2: TGT_X, y2: cy(Y_CI), dashed: true, dim: true, role: 'network' });`

```
Straight horizontal arrows, each from a type box right edge to its target left edge at the row
centre. The three proxy entries sit symmetric about the node centre. Endpoints match the packet
routes exactly.
```

### poster

```
A stack of Service-type rows fanning into one shared backend block.
The scheme in miniature, centred: five service-type rows on the left point STRAIGHT ACROSS to
their targets. The three proxy types (top) share one dashed backend node holding two Pods, while
ExternalName and Headless each get their own box.
```

---

## network-tls-termination

### before `const FLOW_Y = 312;`

```
Layout zones (viewBox 1200x640): top-left band reserved for the narration overlay. The flow runs
left to right along y312, external client -> Ingress controller -> backend Pod, with the TLS
Secret sitting above the Ingress as the source of the certificate. TLS is decrypted INSIDE the
Ingress box. The client and Ingress are infrastructure (they light, never pulse); only the
backend Pod pulses.
```

### poster

```
Client -> Ingress (the termination point, fed by a TLS Secret) -> backend Pod. Abstraction: a
CLOSED padlock rides the inbound leg (encrypted https) and an OPEN padlock rides the outbound leg
(decrypted plain http), so the poster reads the encrypted-to-plaintext handoff at a glance.
```

---

## network-traffic-distribution

### before `const FLOW_Y = 320;                          // central flow line`

```
Layout zones (viewBox 1200x640): the narration overlay is a fixed panel over the top-left
(measured bottom <= 255 here), so the client sits on the left below it. The two setting chips used
to stack under the client, which put the chip strip at 120..440 and centred it on 280: the zone
frames own everything right of 740 from y340 down, so no arrangement in that left band can reach
x=600. They are a full-width BOTTOM strip now (two 530-wide cells spanning SCHEME_L 60 ..
SCHEME_R 1140), which is the grammar the rest of the networking category already uses, and the
client moved to SCHEME_L so the content bbox lands on 600 with it. The whole
flow is centred on y=320 (client -> kube-proxy -> zones) and on x=600. Each zone stacks its two
Pods VERTICALLY, so the fan from kube-proxy reaches every Pod at its own left edge over a shared
vertical rail at x=700, with no route crossing another Pod. The client and the two zones are
symmetric about y=320.
Standard contract: only Pods pulse, boxes light via .highlight, the fan routes are shared by the
static wires and the moving packets. A connection is client -> kube-proxy (the decision point)
-> the chosen backend, so the client pulse always leads into real traffic.
```

### before `const FAN_SLOW = 1.6;`

```
kube-proxy forwards to one backend: a packet rides the fan route, the Pod pulses on arrival. When
ipTag is given, the client source IP rides with the ball so the chosen backend is tagged. The fan
is deliberately slowed (routeDur * FAN_SLOW) so the tag stays readable, and the label rides the
SAME dur so it stays locked to the ball. Speed stays distance-normalized: one shared multiplier.
```

---

## storage-access-modes

### before `const LEFT_X = 400;                                      // leftmost the NODE ROW may go, all viewports`

```
Layout (viewBox 1200x640). Storage grammar: consumers on top, machinery in the middle, disks on a
shelf at the bottom. Here the top row is TWO worker nodes, each carrying Pods, because the whole
point of access modes is which node (and which Pod) may hold the volume at the same time. The CSI
driver sits as a full-width band under the nodes, since every attach is mediated by it and the
driver is what actually honours (or refuses) the requested mode. The disks are two PVs on the
bottom shelf: a block disk that can only do single-attach, and a shared filesystem that can do many.

Every mount is a DESCENT through the driver: Pod -> driver (attach request), then driver -> disk
(the attach). A ball that enters the driver at the Pod column and re-emerges at the disk column is
the rewrite-inside-a-box idiom: the driver is where the decision is made. A refused attach stops AT
the driver and never reaches a disk. Only Pods pulse. The driver and the disks light, never pulse.

---- Horizontal composition, derived rather than hand-placed ----
Every tier is derived rather than hand-placed, but they do NOT all share one center, and the split
is the point (R5, 2026-07-27). The node row sits inside the overlay's vertical band, so it starts at
LEFT_X 400 and its own center works out to 647. Everything BELOW the overlay floor has the full
width free, so the driver band, the disk shelf and the chip strip center on the CANVAS (600). The
band gets there without moving its right edge: it stays flush with the node row at 894 and takes the
width it gains on the left, 306..894, which is also what fills the empty lower-left corner. Before
that, every tier hung off 647 and the whole drawing sat in the right half with the bottom-left third
blank.

Because the band is no longer under the Pods that feed it, the three attach requests drop onto a bus
at y 260 (clear of the overlay floor at 230) and enter the band on its center line. Dropping each
Pod straight down would put three arrows across a 588 unit face, none of them near its midpoint,
which is the same defect the fan below the band avoids: the three PV-nfs attaches leave the band at
one point and fan out inside the disk column instead.

Do not "improve" this by measuring the overlay at your own window size and sliding LEFT_X leftward.
The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats.
Measured right edge / bottom edge by viewport, this card, worst step:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 230     900x650 -> 398 / 375
So the real worst case is x<=398 and y<=375, NOT the 380/342 an earlier pass wrote here from a
too-narrow sample. LEFT_X 400 therefore has about 2px of slack, not 20: it cannot move left at all,
and the driver band (bottom 375) is only just clear of the overlay at the smallest window too.
A left edge picked from a single wide-window measurement looks centered on the machine it was tuned
on and slides under the overlay on a laptop.
```

### before `const POD_Y = 82, POD_W = 128, POD_H = 126;`

```
Pod and node sizes drive everything else: the node row width is DERIVED from what it has to hold,
and the driver band and disk shelf follow that. Nothing here is a hand-typed x.

POD_W is what decides how far the NODE ROW sits off the canvas center, because that row's center is
LEFT_X + (3*POD_W + 102)/2 and LEFT_X is pinned by the overlay. At the old POD_W 156 it landed on
692, which read as a visible shift to the right, at 128 it lands on 647. POD_W is
in turn bound by the WIDEST TEXT INSIDE A POD: the container sublabel used to be 'reads and writes',
which renders 94 units wide and put a hard floor of ~146 under POD_W. Shortening it to 'read/write'
(59 units) is what buys the room, so do not lengthen that string back without re-deriving all this.
At POD_W 112 the Pods came out narrower than they are tall and read as squeezed, so they are 128
here: that is the widest the row can go while the whole diagram still reads as centered (every
extra unit of POD_W costs 1.5 units of rightward shift, since three Pods sit in the row).
```

### before `const SPEC_GAP = 14;`

```
cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that, the same
gap storage-pvc-binding uses. It used to be a flat PV_Y+66, which against a 100-tall cylinder left
only 11px between two baselines whose text is 11px tall: the two lines visually touched.
```

### before `const CHIP_W = 232;`

```
ONE width for all four chips, rather than four hand-picked widths. valChip anchors the name at 12
from the left and the value at 12 from the right, so the width a chip needs is name + value + 24
plus a readable gap between the two. Measured worst cases, in viewBox units:
  accessModes 76 + ReadWriteOncePod 110 = 186   <- the binding one, and neither string can shorten
  attached to 76 + 'node-1, node-2'    96 = 172
  sharing     48 + 'app-1, app-2, app-3' 131 = 179
  enforced by 76 + 'CSI driver'         69 = 145
So 232 clears the worst pair with ~22 units between name and value. That is also why the multi-value
chips read as comma lists: 'node-1 and node-2' and 'app-1, app-2 and app-3' were wide enough to force
a wider uniform chip, and the strip is already more than twice the width of the diagram it captions.
```

### opacity phases (was `const DIM = 0.75`, now OPACITY.*)

```
A Pod the access mode REFUSES. Dim means denied, not "has not mounted yet": a Pod that simply has
not been shown mounting is a perfectly healthy Pod and must look like one. Dimming those too made
the resting state of the card (the poster auto-plays step 1, so that is what you stare at on open)
show two of three Pods greyed out for no reason a viewer could name, and it conflated app-2, which
mounts fine one step later, with app-3, which is genuinely refused.
Who currently HOLDS the volume is carried by the ball, the lit disk and the sharing chip instead.
```

### before `const NFS_LANE = 16;`

```
The shared filesystem is reached on THREE lanes, one per mounting Pod, and all three are drawn.
There used to be a single wire down NFS_CX with balls flying at NFS_CX +/- 7, so no ball actually
rode the drawn line: they skimmed 7px either side of it. Three lanes rather than two because
ReadWriteMany excludes nobody: app-2 sits on the same node as app-1 and can mount it just as well,
and leaving it out made the step look like RWX still rations access somehow.
```

### before `[nodeA, nodeB, driver, pvBlock, pvNfs, podA1.group, podA2.group, podB1.group].forEach(el => root.appendChild(e`

```
Z-order (bottom -> top): node containers, then the driver band and disks, then the Pods so they
sit above their node, then the wires and their labels above the blocks, then the chip strip,
then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { mode, attach, share, enforcer = 'CSI driver' }) {`

```
enforcer is a real value, not a constant caption: every mode here is honoured by the driver EXCEPT
ReadWriteOncePod, which Kubernetes itself enforces. The chip used to be hardcoded to 'CSI driver',
which made it both dead weight and wrong on the one step where it mattered.
'sharing' answers exactly one question: which Pods hold the volume right now. It used to double as
a refusal report ('node-2 refused', 'block cannot span nodes'), which put a refusal in the chip on
the very step where a ball flies out of a refused Pod, so the chip read as a caption for that ball.
Refusal reasons belong on the driver wire label, which already carries them.
```

### before `function denyMount(s, ctx, { podEl, reqPts, tag, lead = 0 }) {`

```
A refused attach: the request reaches the gate and stops there. No disk lights.
The Pod blinks FIRST, exactly as in grantMount. It is the actor either way, and without the blink
the narration names a Pod that is never seen doing anything: the ball just materialised out of a
dim block. Refused Pods stay dim, so the blink has to be the dim variant with an opacity lift or it
is invisible against the 0.55 they sit at.
```

### before `s.refs.pvBlock.classList.add('highlight');`

```
The disk stays lit: it is still attached to node-1 and still in use by app-1 and app-2. It is
the REASON app-3 is refused, so leaving it unlit contradicted both the wire label and the
narration, which say in so many words that the disk is already attached.
```

### poster

```
Abstract, not the literal diagram, and built around the one thing the card is actually about:
the access mode is a GATE, and the gate answers per node rather than per Pod. So the poster is
three tiers, the same descent the diagram uses: two node enclosures on top, one full-width gate
band across the middle, one disk below. Three Pods ask, two lanes come out the bottom of the
band and converge into a single disk, the third stops dead ON the band under an X and never
re-emerges. The surprise is carried by the left node: BOTH of its Pods pass, because the gate
grants a node, not a Pod. The refused lane is dashed and its node is dim, but the X itself is
drawn at full strength, since a dim refusal reads as an unfinished drawing rather than a denial.
All three lanes ARRIVE at the band as arrows, landing on its top edge rather than crossing it:
every attach is a request made TO the gate, and a line drawn straight through would say the
gate is scenery the traffic ignores. The granted pair then re-emerges from the bottom edge, the
same enters-one-edge-leaves-another idiom the card itself uses for the driver.
Below the band ONE lane leaves, straight down the disk column, and it does not trace back to
either Pod: two requests go in and a single attachment comes out, which is exactly what "the
mode grants a node, not a Pod" means. Two lanes out would have said each Pod got its own.
Node widths stay close on purpose, so the difference reads as "which node holds it", never size.
```

---

## storage-configmap-secret-mount

### before `const POD_X = 330, POD_Y = 56, POD_W = 540, POD_H = 120;        // 330..870, center 600`

```
ConfigMap and Secret as Files. Storage grammar as a VERTICAL STACK, symmetric about x=600, in
family with volume-model and emptydir: the consumer Pod on top, the mounted /etc/config volume
in the middle, and the source row at the bottom, ConfigMap on the left feeding kubelet in the
center fed by Secret on the right. Reading the card bottom to top IS the mechanism: a source
object becomes files via kubelet, the files resolve through the ..data symlink, the app reads
the result.

The mechanism the card teaches is the ATOMIC SYMLINK SWAP. kubelet writes the keys into a
timestamped directory and points a ..data symlink at it. On update kubelet writes a brand new
timestamped dir, then flips the single ..data symlink in one step, so a reader never sees a
half-written config. Updates land on the kubelet sync period (up to about a minute) and the app
must re-read the file itself. A subPath mount pins one file and opts OUT of the swap, so it
never updates. A Secret uses the same machinery but on tmpfs.

GEOMETRY. Almost every traffic lane is ONE straight segment (no zigzags): the two source lanes
mirror each other on the bottom row, the two write lanes rise vertically into the dir slots at x=460
and x=740 (symmetric about the spine), and the read lane rides the spine itself (x=600, ..data up
to the Pod). The subPath lane is the exception (R5, 2026-07-27): it rises STRAIGHT out of the v1 dir
at x=460, bypassing ..data, which is exactly its meaning, and then steps across the Pod-to-volume
corridor at y=222 to enter the Pod at x=540, 60 left of the spine. Straight to the top it ended out
at the Pod's corner, 140 off the midpoint of a 540 wide face and alone there, which reads as a lane
that missed rather than as a second read path. The step is in the corridor, so it crosses nothing,
and it stays clear of the sync-period label that starts at x=618. The v2 dir slot and its write
lane stay empty until the update step creates them. Symlink pointers are dashed right-angle Ls
out of the sides of ..data, each dropping into the dir slot it points at (bare, no arrowheads),
so the slot columns read kubelet -> dir -> ..data top to bottom.

The narration overlay owns the top-left corner: the Pod starts at x=330, y=56, clear of the
overlay measured on the family cards ((300, 163) on a comfortable 1600px viewport). On narrow
windows the overlay may brush the Pod corner, the accepted family trade. A longer narration
invalidates this.

PULSE MODEL (canon): the Pod is one unit and blinks as one, the app box inside it included. The
pulse takes the whole Pod group. (Reversed 2026-07-29: this note said the shell pulses alone and
the app box takes a static highlight only.) HIGHLIGHTS ARE STEP-STATIC: every block a step
uses lights at step entry, above the reduced guard, never on packet arrival.
```

### before `const SYM_OLD = [[DATA_X, SYM_Y], [OLD_CX, SYM_Y], [OLD_CX, DIR_Y]];`

```
Symlink pointers: strict right-angle Ls into the directory they point at, drawn with relationPath
because a symlink is a relationship rather than traffic, so they carry no arrowhead and sit
recessed behind the live lanes. (Corrected 2026-07-29 twice over: the note used to say they carry
an arrowhead, and the two lines were hand-rolled as stripped pathArrows until the same day.) Each
exits the SIDE of ..data at its mid height, turns 90 degrees over its dir slot and drops into
the slot top, mirroring the write lane below the slot so the column reads kubelet -> dir -> ..data.
```

### before `function setStage(s, { symOld = 1, symNew = 0, dirNew = 0, writeNew = 0, subpath = 0, sec = OPACITY.notready } = {}) {`

```
Sets the visibility of every toggled element, so no step can leak another step's state. The v2
dir, its symlink pointer and its write lane exist only from the atomic step on, the subPath lane
only on its step, and the Secret sits dim until its step brightens it.
```

### poster

```
The card in miniature: the app reads down the spine through ..data, whose bare right-angle
pointer (no arrowheads, as on the card) has flipped off the dim v1 dir onto the fresh v2 dir.
The short lines inside each dir are the keys sitting as files.
```

---

## storage-container-filesystem

### before `const POD_X = 440, POD_Y = 48, POD_W = 320, POD_H = 140;`

```
Container Filesystem Layers. Storage grammar as a VERTICAL STACK centered on the canvas: the
Container (consumer) on top, its overlay layers stacked directly beneath it, and the real volume
disk on the shelf at the bottom, centered under the stack so the whole column is symmetric on 600.

The teaching contrast: the container root filesystem is read-only image layers (lowerdir) with
ONE thin writable layer (upperdir) on top, combined by overlayfs. A write copies up into the
writable layer, never into the image, and that writable layer is DISCARDED when the container is
removed. A mounted volume is a hole punched through the overlay straight to real storage,
bypassing the writable layer, so it survives. The bypass is drawn literally: the volume wire
leaves the Container SIDE and zigzags in right angles around the stack down to the disk.

The writable layer does not exist until its step, so its copy-up wire does not either: the layer
and the wire fade in together, are discarded together, and return together for the fresh
container. Only the Container (a Pod-like consumer) pulses. The layer boxes and the disk are
infrastructure: they light, they never pulse. The narration overlay owns the top-left corner, so
blocks start right of it.
```

### before `const W_COPYUP = [[POD_CX, POD_BOTTOM], [POD_CX, WR_Y]];`

```
Each static wire and its ball share one array. The copy-up write descends onto the writable
layer. The volume write leaves the Container SIDE and zigzags in right angles around the whole
stack down to the disk: the literal picture of bypassing every overlay layer.
```

### before `function podBlock({ x, y, w, h, label, sublabel }) {`

```
The pulse takes the whole Container group, so the Process box inside it blinks with the Container
it belongs to. shellWrap survives as a handle for code that wants the shell alone. (Reversed
2026-07-29: the pulse used to be aimed at shellWrap so it could not reach the Process box.)
```

### before `const volLbl = volume.querySelector('.scheme-cylinder-label');`

```
The primitive centers the label on the raw bbox, which reads high because the top cap
ellipse is not part of the visible front face. Re-center on the face (below the cap):
face spans 2*ry..h, so the baseline sits at its middle plus half the font x-height.
```

### before `const fsChip      = valChip({ x: 100, y: CHIPS_Y, w: 320, h: 34, name: 'root fs', value: 'read-only image laye`

```
The writable layer is not on screen yet at build time, so the chip starts honest: only the
read-only image layers exist until the writable step adds the RW top.
One uniform chip size, and the strip (3x320 + 2x20 = 1000) is centered on x=600, the axis of
the whole column above, so the bottom row is symmetric with the diagram.
```

### before `s.refs.writable.style.opacity = '1';`

```
A fresh container is running again, so a fresh EMPTY writable layer and its copy-up wire
fade back in together: the reappearing layer is the restart made visible, not the old
layer returning (its contents are gone, the sublabel still reads starts empty).
```

---

## storage-csi-architecture

### before `const M = 60;                                    // one margin, both sides`

```
CSI Architecture (viewBox 1200x640). Storage grammar, but the story is STRUCTURAL rather than a
single descent, so this card does not use the vertical mount-lane stack of storage-volume-model.
It has no Pod at all, on purpose: every element here is either Kubernetes core, a vendor process,
or the machine. The two things a reader could mistake for Pods, the controller plugin and the node
plugin, are labelled by their CONTROLLER (Deployment / DaemonSet), so drawing them as pod() shells
would have named the wrong object. Nothing pulses anywhere as a result, and that is correct: the
pulse is reserved for Pods, and infrastructure lights with .highlight.

The picture reads left to right as "core -> bridge -> vendor -> machine":
  left column   kube-apiserver (top row) and kubelet (bottom row): Kubernetes core, no vendor code
  upper frame   the CONTROLLER PLUGIN, a Deployment that runs off-node: four sidecars on a shared
                gRPC bus into one vendor driver
  right of it   the cloud storage API, the only thing the controller ever calls outward
  lower frame   the NODE PLUGIN, a DaemonSet on every node, and the node filesystem beside it

---- Narration safe-zone (MEASURED for this card, not assumed) ----
The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it eats.
Worst step per viewport, mapped into viewBox units:
  1920x1080 -> right 203 / bottom 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205                  900x650 -> 398 / 313
So this card's real worst case is x<=398 and y<=313, well under the blanket x<=380 & y<=300 rule
on the y axis but slightly OVER it on x. Everything left of x=420 therefore starts at y>=350,
which clears the measured bottom by 37 units: the apiserver row, the kubelet row, the chip strip
and the two left-hand wire captions. The controller frame's left border is the leftmost thing that
sits high on the canvas and it is at x=420, clearing the measured right edge by 22.
A LONGER NARRATION INVALIDATES BOTH NUMBERS. This is not theoretical: an earlier draft of this
pass added one sentence to the 'controller' step and the 900x650 bottom went 313 -> 344, which
swallowed the apiserver row. If you edit any narration here, re-measure before shipping.

---- Horizontal composition ----
The previous pass hand-typed margins and drifted: content ran x 60..1180, so a 60 unit left margin
against a 20 unit right one and a centre at 620, visibly shoved right. Now ONE pair of constants
fixes the band and every tier is hung off it, so the composition cannot drift again.
```

### before `const SIDE_W = 232;`

```
kube-apiserver, kubelet and the cloud API all share ONE width. The two of them that face each
other across the diagram, the apiserver and the cloud API, are the meaningful mirrored pair: they
are the two worlds the driver bridges, Kubernetes on the left and the vendor on the right, so they
are equidistant from CX by construction (60..292 and 908..1140). The floor under SIDE_W is the
widest string any of them carries, kubelet's sublabel 'asks node plugin to mount' at 150.7 units
measured in the browser (JetBrains Mono 11px runs 6.9 units per character). 232 leaves ~40 either
side of it. Do not shrink below ~200 or that sublabel starts touching the box edge.
```

### before `const FRAME_X = 420, FRAME_PAD = 12;`

```
Both frames start at the same x so they read as two halves of one driver. 420 is not chosen for
looks: it is the first tidy value clear of the measured overlay right edge of 398, and it also
happens to leave a 140 unit box-to-box gutter on the node row (kubelet 292 -> registrar 432),
which is the same length as the node driver -> node fs gutter on the far side, so the two
horizontal wires on that row are an exactly matched pair.
```

### before `const CF_Y = 48;`

```
---- Vertical composition ----
Top margin 48 (the frame border), bottom margin 16 (the chip strip). Unequal on purpose and this
matches the catalog: the top element is a dashed border whose caption is inset 22 below it, so the
top reads airier than the number suggests, while the chip strip is solid ink to its last pixel.
The previous pass put CHIPS_Y at 616, which with a 34 high chip ran to 650 and was CLIPPED by the
640 unit viewBox: the bottom 10 units of all four chips were silently cut off. 590 is the catalog
value (storage-volume-model uses it) and leaves a real 16 unit margin.
```

### before `const S_GAP = 14;`

```
Four sidecars on one row. The widths are solved, not picked: each box needs its widest string plus
air, and the leftovers are spread so every box ends up with the SAME air. Measured strings:
  external-provisioner 120.6 / watches PVC 66.3            -> needs 120.6
  external-attacher 103.4 / watches VolumeAttachment 144.7 -> needs 144.7
  external-resizer 92.2 / watches PVC resize 108.5         -> needs 108.5
  external-snapshotter 124.9 / watches VolumeSnapshot 132.7-> needs 132.7
Sum 506.5. The inner span is 696 and three 14 unit gaps eat 42, leaving 654 for the boxes, so
there are 147.5 units of air to share: ~37 per box, which is what the widths below deliver.
Shrink CF_W and the attacher sublabel is the first string to touch its box edge.
```

### before `const DRV_CX = (CF_INNER_L + CF_INNER_R) / 2;                // 780`

```
The driver is what all four sidecars call, so it is centred on the sidecar ROW rather than on the
frame: the row spans CF_INNER_L..CF_INNER_R, whose centre is 780. Its width echoes SIDE_W, which
puts the three "servers" in the picture (apiserver, driver, cloud API) at one size.
```

### before `const DRV_EXIT_X = DRV_CX;                                   // 780`

```
The run out to the cloud leaves the driver from the CENTRE of its bottom edge, the same anchor the
inbound gRPC wire uses on the top edge, so the driver reads as one block with traffic entering and
leaving on its spine rather than off to one side. The drop lands on MID_CY and then runs 128 units
right into the cloud box, which is a long enough horizontal leg to read as a run and not a stub.
```

### before `const CHIP_GAP = 16, CHIP_COUNT = 4;`

```
One chip width for all four, derived so the strip spans exactly the content band. That makes the
strip agree with the diagram above it instead of being a fifth hand-typed margin. Worst measured
name + value pair is 'node plugin' 75.8 + 'mounts the disk' 103.4 = 179.2, and valChip insets the
name 12 from the left and the value 12 from the right, so 258 leaves ~55 units of clear gap.
```

### before `const LANE = 14;`

```
Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint
is a real block edge, never a hand-typed coordinate.

The provisioner is the only block with traffic on both sides of it, and each direction gets its
OWN lane offset LANE around the box centre: the watch arrives on the left lane and the gRPC call
leaves on the right one. The previous pass ran both through S_CX, so 32 units of the two arrows
were drawn exactly on top of each other and the ball retraced its own inbound path.
```

### before `const W_BUS_TAIL   = [[DRV_CX, BUS_Y], [S_CX[3], BUS_Y]];`

```
The other three sidecars share the same bus into the same driver, which is the whole point of the
card, so the structure is DRAWN: a stub down from each sidecar onto the bus, and the length of bus
to the right of the driver drop. No ball ever rides these, so they carry NO arrowhead: an
arrowhead with no traffic behind it reads as a flow the card never shows.
```

### before `function frame(x, y, w, h, label) {`

```
A dim, arrowhead-free frame that groups one half of the driver. It carries no traffic, so no
marker. The caption baseline sits 22 below the border, and the row inside starts 34 below it, so
there are 12 units of air between the caption and the first box: shrink that and the caption
starts touching the box tops.
```

### before `r.style.stroke = 'var(--diag-node-stroke)';`

```
The border reads as the same kind of grouping element as a node frame, so it takes the same
token the catalog node rect takes (--diag-node-stroke, the jade --tint-deep inside a tinted
storage dialog, exactly what node-1 uses on storage-csi-attach-mount). Earlier this was a flat
white at 0.22, which sat outside the category tint and read as a different family of line.
The frame stays fill-less and keeps its sparser '3 6' dash, so it still reads as subordinate to
a real node: a frame here is a label for a set, not a thing traffic ever touches.
```

### before `const api  = box({ x: API_X, y: MID_Y, w: SIDE_W, h: MID_H, label: 'Kube-apiserver', sublabel: 'core, no vendo`

```
Block LABELS are sentence-capitalized. Hyphenated names take the capital on the first word only
(External-provisioner, Node-driver-registrar): they are one identifier, not a phrase, so
capitalizing every segment would read as three separate proper nouns. Sublabels stay lowercase
prose, and so do the literal object names quoted inside narration and riding tags.
```

### before `const watchLbl = text({ class: 'scheme-label code dim', x: (API_R + S_CX[0] - LANE) / 2, y: MID_CY + 20, 'text`

```
Three wire captions, all on horizontal runs, all pushed BELOW their wire. A riding tag renders
14 units ABOVE its ball, so a caption on the same side of a lane the ball uses gets sat on.

There is deliberately NO caption on the provisioner -> driver lane. That hop is the one this
card is named after, so the ball itself carries 'CreateVolume', and a caption on the same lane
would be run over by the tag as it travels the bus. For the same reason the apiserver hop
carries no tag: its ball and the CreateVolume ball both terminate on the provisioner's bottom
edge 28 units apart, so two tags there overlapped for ~390ms of the step. The Pending PVC is
named by this caption instead, which is where it is standing still and readable.
```

### before `[ctrlFrame, nodeFrame].forEach(el => root.appendChild(el));`

```
Z-order: frames first (behind), then blocks, then the relationship lines and routes above
them, then wire captions, then chips, then the packet layer on top so every ball rides above
everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
still holds the previous step's text at call time (clearHL clears the class, not the text) and
steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { core, ctrl, node, bridge }) {`

```
Every step writes EVERY chip, and every chip means exactly what its name says. The previous pass
let the 'bridge' chip report 'registered' and 'touches fs', neither of which is a bridge: those
are node-plugin facts and they belong in the 'node plugin' chip. A chip that reports somebody
else's state is how a card comes to contradict its own narration.
```

### before `duration: 3600,`

```
Three chained hops measure span=3122ms, so the duration keeps ~480ms of headroom. Anything
added to this step has to be re-checked against anim-dump: if span passes duration, the
auto-advance cuts the cloud call off mid-flight and the step under-shows what it narrates.
```

### before `ridingLabel(s, ctx, 'CreateVolume', W_PROV_DRV, { delay: watch.arrivalMs + BEAT.afterHop });`

```
The gRPC call is the thing this step is named after, so the ball carries it by name. The
previous pass hung 'CreateVolume' on the wire caption of the DRIVER to CLOUD line instead,
two hops further on, where it labelled a vendor API call as if it were the sidecar call.
```

### before `s.refs.api.classList.add('highlight');`

```
Static highlight only, and deliberately no motion at all. The usual argument for a flash on
a packet-less step (so it does not read as a frozen frame) does not apply to the LAST step,
which is supposed to come to rest: the previous pass flashed five boxes here, a beat after
the narration had already moved on to the summary. Lighting the whole chain at once IS the
summary, and it wants to be read, not blinked at.
```

---

## storage-csi-attach-mount

### before `const M = 60, GUTTER = 48;`

```
Attach and Mount Chain (viewBox 1200x640). THE LADDER CARD. The four gRPC calls that stand between
a bound claim and a writable /data are a numbered ladder down the LEFT (chainList, one rung lit per
step), and the RIGHT is the topology those calls act on: the cloud disk up top, outside any node,
then node-1 below holding the node plugin, the attached block device, the ONE
global staging mount, and the two Pods that share it. The CSI controller stands in the left column
above the ladder, opposite the node frame, because it is the one actor that is NOT on the node. The descent is literal: CreateVolume makes the
disk, ControllerPublishVolume moves it into the node as a device, NodeStageVolume mounts it once at
the global path, NodePublishVolume bind-mounts that one staged filesystem into each Pod. Stage is
once per node, publish is once per Pod, which is exactly how two Pods on one node share one disk.

---- Horizontal composition ----
Two columns of EQUAL width sharing one centre. The canvas centre is 600 and both margins are M=60,
with a gutter G=48 between the columns, so 2*M + 2*COL_W + G = 1200 solves to COL_W = 516. That is
not a chosen number: it is what makes the ladder (60..576) and the node column (624..1140) mirror
each other about 600. An earlier pass hand-typed LAD_W 508 / NF_W 560, which put the content bbox at
60..1178 with its centre at 619, visibly shoved right. Change M or G and COL_W has to be re-solved.

Every tier inside the node column is symmetric about NODE_CX = 882 (= NF_X + NF_W/2), never about a
hand-typed margin: the two Pods sit at 753 and 1011, whose midpoint is 882, and the staging band and
the node driver both hang off the same NODE_PAD. The chip strip is the one tier that spans the WHOLE
content width (60..1140) rather than one column, so it reads as a rail under both columns and its
own centre is 600, agreeing with the composition centre rather than fighting it.

The CSI controller lives in the LEFT column at 60..312, y 268..332 (R5, 2026-07-27). It used to sit
inside the node column, level with the cloud disk, which left EVERY block on the card in the right
half: the content bbox ran 624..1140 with its centre at 882 and the whole left half below the
overlay was blank apart from the ladder. Moving the one off-node actor to the off-node side puts a
block on each side, and the low content now spans 60..1124 (centre 592). CreateVolume pays for it
with two corners instead of none: it leaves the controller's right face, turns up at x=520 (right of
the overlay's 397 at every viewport) and runs to the cloud disk's left face in the free band above
the node frame. See the overlay note below for what pins y=268 and how little slack there is.

---- Narration overlay (MEASURED for this card, 2026-07-21) ----
The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it eats.
Measured right edge / bottom edge, worst step, by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 230     900x650 -> 398 / 375
So the real worst case is x<=398 AND y<=375, well inside the blanket x<=380 & y<=300 rule on x but
PAST it on y, because this card carries some of the longest narration in the catalog. The ladder is
what this pins: LAD_Y 388 clears the measured 375 by 13 units and cannot move up. Lengthening any
narration string invalidates these numbers and they have to be measured again.

TWO STANDARDS, AND THEY DISAGREE (2026-07-27). `check-geometry`'s OCCLUDED rule samples 1600x1000,
1280x860 and 1100x800 only, where this card's overlay bottoms out at 230, and `tools` measures the
same 230. The 900x650 row above is from a wider sample taken by hand in July and it is the stricter
number by 145 units. The CSI controller at y 268 clears 230 by 38 and is reported clean, but at
900x650 it would be behind the panel, and so would the top rung of the ladder. There is nowhere else
for it: below 375 the left column is the ladder, and the whole point of moving it was to get a block
out of the right half. If the panel is ever clamped in CSS (the open question in SCHEME-REVIEW), this
is one of the cards that gets its margin back.

---- Text widths (MEASURED, not estimated) ----
getBoundingClientRect in the browser, mapped back into viewBox units. Both the chip text and the
dim code labels are 11px JetBrains Mono, so one number sizes the chip strip and the band caption:
  .scheme-chip-text      6.89 u/char  ('attached to node-1' = 124.0 over 18 chars)
  .scheme-label code dim 6.89 u/char  ('one mount, two bind mounts' = 179.2 over 26 chars)
It is monospace, so that rate has zero variance and one sample is enough. Longer strings measure
slightly under (the ladder rows run 6.54 to 6.62) only because of the narrow separator glyph.

YOU MUST AWAIT document.fonts.ready BEFORE MEASURING. A first pass recorded 5.54 u/char here, from
which it derived a 42-character ceiling and 46 units of caption clearance. Both were wrong: that
pass sampled before the webfont finished loading and measured the fallback monospace, which is
~20 percent narrower than JetBrains Mono. Nothing overflowed, because the captions in use are
short, but a later edit trusting a 42-character ceiling would have run a caption onto a lane.
Do not eyeball these off a screenshot either.
```

### before `const LAD_X = M, LAD_W = COL_W, LAD_Y = 388, LAD_ROW = 40, LAD_GAP = 10;`

```
---- left column: the four-call ladder ----
The widest rung renders at 271.5 units plus the primitive's 10 unit text inset, so 282 of ink in a
516 wide rung. The extra width is deliberate: the rungs read as a stacked bar chart of the chain,
and shrinking them to the text would break the column mirror the whole layout is built on.
```

### before `const DISK_W = 150;`

```
The cloud disk sits ABOVE the node frame because it does not live on a node: the first two calls are
cluster-scope. It aligns with the node column so the descent reads as one vertical story, the cloud
disk over the device it becomes.

CDISK_FACE_CY is still the anchor for CreateVolume's last run: the lane arrives at the disk's LEFT
face on its mid height, horizontally, whatever the disk's height becomes. Before the R5 relayout the
controller sat level with that face and the whole call was one straight run, and its CTRL_Y was
derived from CDISK_FACE_CY for exactly that reason. It is now derived from the overlay floor
instead, because the controller moved to the other column, and the level-face trick moved with it to
the far end of the lane.
```

### before `const STG_X = IN_X, STG_Y = 350, STG_W = IN_W, STG_H = 58;`

```
The staging mount is a FULL-WIDTH band, not a centred box, for a reason the card is about: it is one
mount serving every Pod on the node, so it has to physically span all of them. It also gives the
device drop somewhere to land anywhere along its top edge.
```

### before `const POD_W = 226;`

```
2*POD_W + POD_GAP = IN_W = 484. POD_W 226 leaves POD_GAP 32. The widest string inside a Pod is the
sublabel 'private bind mount' at a measured 99.7 units, so the width is set by the tier maths, not by
the text, and there are ~63 units of air either side of the longest label.
```

### before `const CHIPS_Y = 596, CHIP_H = 32, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
---- bottom rail: four chips, one per call ----
Four calls, four facts, so each chip is the visible outcome of one rung of the ladder and a chip can
never mean something its name does not say. The strip spans the full content width, so
4*CHIP_W + 3*CHIP_GAP = 1080 with CHIP_GAP 16 solves CHIP_W to 258. Worst name+value pair at the
measured 6.89 u/char is 'bind mounts' (75.8) + '2 (Pod A + Pod B)' (117.1) + the primitive's 24
units of inset = 216.9, so 258 leaves 41 units of air between name and value at the tightest step.
```

### before `const STG_LBL_Y = 434;`

```
The band caption sits in the corridor between the staging band and the Pods, centred on NODE_CX. The
nearest obstacles are the two publish lanes at 753 and 1011, so the clear width is 258 units. Keeping
12 units off each arrowhead leaves 234, which at the measured 6.89 u/char is a hard ceiling of 33
characters. The longest caption in use is 26 characters (179.2 units, 27 units of clearance either
side). Overrun the ceiling and the first and last letters sit on a lane arrowhead.
```

### before `const STAGE_ELBOW_Y  = (DEV_BOTTOM + STG_TOP) / 2;        // 327, centred in the 46 unit device gap`

```
The one remaining elbowed lane turns at the MIDPOINT of the gap it crosses, so the corner is centred
in its own corridor and stays centred if either block moves. It was hand-typed as 327 until this
pass, which is exactly the drift the header warns about: it happened to be right, but nothing tied it
to the blocks it sits between, so changing DEV_H would have stranded the elbow mid-gap with no test
and no screenshot catching it.
```

### before `const W_CREATE  = [[CTRL_RIGHT, CTRL_CY], [CREATE_TURN_X, CTRL_CY], [CREATE_TURN_X, CDISK_FACE_CY], [DISK_X, CDISK_`

```
Every wire below is shared by the static pathArrow and the ball that rides it, so the drawn lane and
the packet cannot drift apart. All four calls in the chain get a lane and a ball, and no lane carries
return traffic, so no lane needs an offset twin: this card is one-way all the way down.
Each lane also leaves its source from the CENTRE of an edge, never off to one side.

CreateVolume is a single straight segment: controller right edge to disk left edge, both at y=96.
```

### before `const W_STAGE   = [[DISK_CX, DEV_BOTTOM], [DISK_CX, STAGE_ELBOW_Y], [STAGE_IN_X, STAGE_ELBOW_Y], [STAGE_IN_X, STG_TO`

```
The stage lane elbows in to NODE_CX before it drops, so the device visibly arrives at the MIDDLE of
the band rather than at the corner under itself: the staging mount belongs to the whole node, not to
the column the device happens to sit in. It also makes the run 217 units instead of a 46 unit stub.
```

### before `const W_OWNS = `M ${OWNS_X} ${ND_Y + ND_H} L ${OWNS_X} ${STG_TOP}`;`

```
Ownership, not traffic: the node plugin is what performs both node calls, so it owns the staging
mount below it. No ball ever rides this, so it deliberately has NO arrowhead (a bare dashed path
rather than a pathArrow), because an arrowhead with no ball reads as traffic that never runs.
```

### before `function podBlock({ x, label }) {`

```
PULSE MODEL: the Pod is ONE unit and blinks as one. The shell and the container box both live in
`group`, and `group` is what pulsePod gets, so the whole Pod lights for exactly as long as its ball
is in flight and nothing is left lit afterwards. The container box NEVER takes a .highlight: an
earlier pass called lightBoxAt on it at packet arrival, which left /data outlined for the rest of the
step after the blink had decayed, so the Pod read as permanently mid-event.
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `const shell = pod({ x, y: POD_Y, w: POD_W, h: POD_H, label, sublabel: 'private bind mount', containers: 0, role: 'storage' });`

```
The sublabel names what NodePublishVolume actually creates for this Pod, a per-Pod bind mount off
the shared staging path. It deliberately does not repeat '/data', which the container box below
already carries: two labels saying the same path made the Pod read as one fact printed twice.
```

### before `const ctrl  = box({ x: CTRL_X, y: CTRL_Y, w: CTRL_W, h: CTRL_H, label: 'CSI controller', sublabel: 'attacher +`

```
Block LABELS capitalize the FIRST word only (settled 2026-07-26, the catalog had been split 95 to
34 between this and Title Case). A later word takes a capital only when it is an API object, an
acronym or an identifier: 'CSI controller', 'Global staging mount', but 'ConfigMap app' and
'Pod A bind mount'. Two labels are
deliberately exempt because capitalizing them would make them WRONG rather than merely styled.
The device is a literal kernel path, and there is no /dev/Nvme1n1 on any machine. node-1 is a
hostname, and the node primitive uppercases its own label in CSS anyway, so editing that string
would be a no-op that only looked like a change. Identifiers inside a name (vol-1) keep their
real casing for the same reason. Sublabels stay lowercase prose.
```

### before `const nodeFrame = node({ x: NF_X, y: NF_Y, w: NF_W, h: NF_H, label: 'Node-1' });`

```
The node primitive carries its own label at a position RELATIVE to the frame group. Appending a
text with an ABSOLUTE x into a translated group is what hid this label off-canvas before: the
group already carries translate(624,192), so an x of 640 renders at 1264, past the 1200 viewBox,
and the outer svg clips it. Let the primitive place it.
```

### before `[dev, wAttach, wStage, podA.group, wPubA, podB.group, wPubB].forEach(el => { el.style.opacity = '0'; });`

```
A BLOCK AND ITS LANES ARE ONE CONSTRUCTION AND APPEAR TOGETHER.
Only the standing topology (controller, cloud disk, node driver, staging mount, and the ownership
spine between the last two) is drawn from the first frame. Everything that is BORN mid-story is
hidden here and revealed as a unit on the step that creates it:
  step 2  the device, with the lane that attaches it and the lane that stages off it
  step 4  Pod A, with its bind-mount lane
  step 5  Pod B, with its bind-mount lane
The previous pass hid only the blocks and left all four lanes drawn from frame one, so the card
opened on an arrowhead pointing into empty canvas above the device and two more pointing at Pods
that did not exist, then popped a cylinder in underneath the arrows already aimed at it. An
arrow to nothing reads as traffic that never runs, and it also gave away the punchline (that one
staged mount serves many Pods) three steps before the narration gets there.
```

### before `root.appendChild(nodeFrame);`

```
Z-order (bottom -> top): the node frame behind everything it contains, then the blocks, then the
lanes and the band caption above them, then the chip rail, then the packet layer so every ball
rides on top. The ladder goes last of all: it is the reader's index into the story and its lit
rung must stay crisp even when a ball is passing (nothing overlaps it, but the intent is stated).
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setBorn(s, { device = 0, podA = 0, podB = 0 } = {}) {`

```
Every step pins the visibility of EVERY born-mid-story element, exactly as setChips pins every chip,
so a step can never silently inherit a block or a lane from the step before it. A block and its lanes
share one flag on purpose: they are one construction and there is no legal state where a lane is
visible and the block on the end of it is not.
```

### before `function call(s, ctx, { points, tag, target, delay = BEAT.lead }) {`

```
One infra-to-infra call: the source block is already lit at step entry, so the ball leaves after
BEAT.lead to let that registration land, and the destination lights on arrival. Returns arrivalMs so
anything that follows chains off real geometry instead of a hard-coded delay.
```

### before `function publishInto(s, ctx, { podEl, lane, points, tag }) {`

```
Reveal a Pod together with its own bind-mount lane, then run NodePublishVolume into it. This is infra
reaching a Pod, so it takes the down-arrow ordering: the ball flies first and the Pod pulses on its
ARRIVAL, never before.

The Pod arrives at FULL strength and simply pulses when the mount lands. It used to fade in at 0.5
and ramp to 1 on arrival, on the theory that a Pod with no volume yet is a Pod that has not started.
In practice that read as a rendering fault rather than as a state: Pod A sat visibly greyed out for
the first three steps next to blocks at full strength, so it looked broken, not pending. A Pod that
is not there yet is now simply not drawn, which says the same thing without dimming anything.
```

### before `revealAt(s.refs.dev, ctx, 0);`

```
The device and BOTH of its lanes materialise as one construction, and finish materialising
before the call is sent (REVEAL_MS 500 against BEAT.lead 800), so the reader never sees an
arrowhead aimed at a block that is not there yet. This card used to carry its own revealAt with
a `to` and a `dur` parameter, and every one of its five calls passed the defaults, so the hoist
into scheme-kit on 2026-07-29 dropped both.
```

---

## storage-csi-capacity-tracking

### before `const CX = 600;`

```
CSI Storage Capacity. With local or topology-constrained storage the scheduler can pick a node whose
storage pool is already full. Provisioning of the volume then fails there, and because the Pod cannot
bind until its volume does, it never schedules and stays Pending forever. CSIStorageCapacity objects,
published by the driver per topology segment, let the scheduler SEE the free capacity and filter out
the nodes that cannot fit the claim before it commits.

---- Horizontal composition ----
Two nodes mirrored about the canvas centre: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX = 600,
derived from the node width and gap rather than typed. Each frame HOLDS its capacity object and its
pool, so the frames carry content instead of framing empty canvas. Content spans 195..1005, margins
195 a side. The earlier pass ran 400..1150, centre 775.

The scheduler and the pending Pod stack on the centre line above the nodes, because there is one
scheduler and one Pod and the whole question is which of the two symmetric nodes they pick.

---- Narration overlay ----
Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
  1920x900  right 102  bottom 183
  1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173
  1100x900  right 397  bottom 149
  1280x860  right 397  bottom 255   <- added 2026-07-27
  1100x800  right 397  bottom 255   <- added 2026-07-27
Worst case x <= 397 and y <= **255**, not the 183 recorded above: every row sampled originally was
900 or 1000 tall, and a SHORTER window shrinks the diagram while the panel, which is HTML at a fixed
size, keeps its pixels and so eats more viewBox units. The rule that judges occlusion samples
1600x1000, 1280x860 and 1100x800, so 255 is the number this layout is built against. The scheduler
(y 36) and the Pod (y 136) both sit inside that y band, so both start at x >= 400. Everything from
the node row down (y >= 300) still clears the overlay, now by 45 units rather than the 117 the old
number implied. A longer narration than the ones below would invalidate this measurement.

PULSE MODEL: only the Pod pulses, and it is a wrapping g. The scheduler, the node frames, the
capacity objects and the pools are infrastructure: they light via .highlight on packet arrival and
never pulse. On the failure step the Pod never went Ready, so it takes pulsePodDim with an opacity
lift or the blink is invisible against the dim it sits at.

WIRES: the card has ZERO wire crossings. Each capacity read leaves the node frame through its TOP
edge at the node centre, rises straight up and enters the scheduler through the side midpoint facing
it. The read and the bind lane never appear in the same step, so sharing the node-centre column is
fine, and the reads clear the Pod on the centre line, so the two are exact mirrors that cross nothing. The publish lane rises from the pool to the
object on the column axis (offset by LANE so it meets the object beside its Bound centre rather than
on it), while the provision lane drops down the inner margin at PROV_INSET, outboard of the capacity
object, and enters the pool through its side face, so the two never share a segment.
```

### before `const POOL_W = 168, POOL_H = 84, POOL_Y = 336;`

```
The pool and the capacity object both live INSIDE their node frame, the pool above and the object
below it. An earlier pass hung the pools outside and below the frames, which left each frame a
mostly empty 400 by 180 box with one small block floating at its bottom, and the emptiness read as
a missing element rather than as a boundary.

The pool sits ABOVE the object rather than below it so that BOTH lanes inside a node can run down
the column centre line: bind arrives at the node top, provisioning drops straight into the pool,
and the pool publishes straight down into the object. With the object on top, provisioning had to
detour around it and met the node frame 170 units off its edge midpoint, which reads as a lane
stopping at a random point on an edge rather than as an arrival.
```

### before `const wBind = (cx) => {`

```
The bind leaves the Pod through its SIDE (left edge for the left node, right edge for the right one),
runs out to the node centre line and drops into the node top. So the arrow exits the Pod on the side
facing its node rather than from underneath.
```

### before `function podBlock() {`

```
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'result' + 'scheduled and mounted'
at 27 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 27 * 6.89 + 24
of padding is 210 against the 232 available.
```

### before `[...nodes, sched, ...pools, ...caps, podB.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the node frames, then the scheduler and pools and capacity objects,
then the Pod, then the lanes and their captions, then the chip strip, then the packet layer so
every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `const DECIDE_DUR = 850, BIND_DUR = 1000, READ_DUR = 1000;`

```
The scheduler-decision walk (decide ball -> Pod pulse -> bind ball) is paced deliberately slower than
routeDur would pick, so the beat reads clearly: the ball glides in, the Pod takes its full pulse, and
only then does the bind ball leave (it departs BEAT.afterPulse later, after the 900ms blink lands).
These explicit durs are why this card sits on the check-canon ALLOW_EXPLICIT_DUR list. READ_DUR
likewise slows the capacity-read balls up from the node tops so the reported numbers read calmly.
```

### before `function setStage(s, { caps = [0, 0], nodes = [1, 1], pools = [1, 1], lanes = [] } = {}) {`

```
Pins the visibility of EVERY element born or dimmed mid-story, and of every lane, exactly as
setChips pins every chip. A lane into an object that does not exist points at nothing, so lanes are
pinned to 0 rather than left at whatever the previous step set.
```

### note (anchor dropped: `pulsePodDim(s.refs.podB, ctx, decide.arrivalMs, { from: POD_` is not unique in the file)

```
The scheduler's decision lands ON the Pod (down-arrow), so the Pod takes its full pulse on
arrival. It is only being scheduled, not Running, so it stays dim and needs the dim variant with
an opacity lift or the blink is invisible against the 0.55 it sits at.
```

### poster

```
The capacity record sitting between the pools that publish it and the scheduler that reads it: two
pools, one per topology segment, each advertise their free space up into their OWN value cell of a
single CSIStorageCapacity object, which the scheduler reads before it commits. The pair is mirrored
about the x=160 centre line, so the comparison (this pool against that one) is the shape of the
poster rather than a caption on it. Every link runs edge to edge, and each publish lane leaves its
cylinder at the midpoint of the side face it is drawn on, never inside the body, then turns up into
the exact x of the cell it fills.
```

---

## storage-dynamic-provisioning

### before `const LEFT_X = 400;                                   // leftmost the TOP ROW may go, all viewports`

```
Layout (viewBox 1200x640). Same storage grammar as storage-pvc-binding: the IDENTITY COLUMN is the
spine (PVC on top, the PV that ends up bound to it directly below, both the same width and x), and
the machinery sits in a column to the RIGHT. The difference from the binding card is that here the disk does not
exist yet: the cylinder is invisible until CreateVolume returns, and the Bound link is drawn only
once the PV object has been written. The descent is provisioner -> backend (CreateVolume) and the
ascent is the volume handle coming back, on SEPARATE lanes so the round trip reads as a loop.
Cylinders and boxes are infrastructure: they light, they never pulse. This card has no Pod at all,
so NOTHING in it pulses or blinks: the packet-less first step is fully static by design and its
read is carried by the .highlight outline alone.

---- Horizontal composition, derived rather than hand-placed ----
The two columns share ONE center, CONTENT_CX, instead of each carrying its own hand-typed margins.
That shared center is NOT the canvas center, and it cannot be: the narration overlay permanently
occupies the top left and the top row sits inside its band, which pins the left edge at LEFT_X 400.
The chip strip is the exception and centers on the CANVAS (600), because it sits below everything
and has the full width to work with.

CONTENT_CX is 630, not the 660 it was until R5 (2026-07-27). The whole drawing does not slide left
to reach 600: sliding it would drag the claim under the overlay, which is what LEFT_X exists to
prevent. What moved is the RIGHT edge, by narrowing the machinery column from 240 to 220 and the
elbow channel from 80 to 40, both of which had slack ('provisioner: ebs.csi.aws.com' is the widest
string in that column at about 150 units). At 660 the content bbox was 400..920 and the tool called
it off centre by 60; at 630 it is 400..860.

Do not "improve" this by measuring the overlay at your own window size and sliding LEFT_X leftward.
The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats.
Measured right edge by viewport: 185 at 1920 wide, 275 at 1600, 322 at 1400, 342 at 1280, 379 at
1100 and below. The blanket x<=380 rule is that worst case, not a pessimistic guess, so LEFT_X 400
keeps a real margin at every window size. A left edge picked from a single wide-window measurement
looks centered on the machine it was tuned on and slides under the overlay on a laptop.
```

### before `const SPINE_X = PV_CX;  // 440`

```
The identity spine and the PV write BOTH run down the center of the identity column. They can share
that x because they are never on screen together: the write arrow shows only while the PV is being
created, the spine only once it is bound. Any other arrangement puts one of them off center.
```

### before `const ELBOW_X = PVC_RIGHT + COL_GAP / 2;   // 620`

```
The ONE vertical channel in the gap between the PVC column and the provisioner column. Both the
claim descending into the provisioner and the PV write leaving it turn on this x, and their
vertical runs do not overlap in y (122..279 above, 311..396 below), so sharing the channel reads
as one clean lane. Those four y values are a pair of MIRRORED lane offsets, not free numbers: two
lanes meet the claim's right face at 110 +/- 12 and two meet the provisioner's left face at
295 +/- 16. A single lane sitting off a face midpoint on its own reads as a slip, which is what
the old 130 and 312 were. They used to sit at 686 and 690: a 4px offset, far too small to register as a
deliberate lane split (those use LANE_DY, 15) and so it just looked like a misalignment. Derived
from the gap so it stays centered in it if either column is ever resized.
```

### before `const cloud = box({ x: CLOUD_X, y: CLOUD_Y, w: CLOUD_W, h: CLOUD_H, label: 'Storage backend', sublabel: 'reached via the CSI driver', role: 'storage' });`

```
Sublabel names the CSI driver because the narration says CreateVolume is called ON the driver,
and the driver has no box of its own: the ball lands here, so this box has to admit it is the
driver plus the backend behind it, or the text names an actor the picture does not have.
```

### before `const scRef = relationPath({ points: W_SC_REF, role: 'storage', dash: '5 5' });`

```
The claim NAMES its class. Nothing travels this line, so it carries no arrowhead: arrow()
always attaches a marker, which would read as a wire missing its ball.
Both of these are driven FROM their points arrays, not from repeated literals. They used to be
built from hand-copied coordinates while W_SC_REF and W_BOUND sat unused, so editing either
constant moved nothing and the two could silently drift apart.
```

### before `const wProvToPv    = pathArrow({ points: W_PROV_TO_PV, dashed: true, dim: true, role: 'storage' });`

```
Hidden until the step that writes the PV. This wire points AT the cylinder, and the cylinder
does not exist until CreateVolume has returned, so drawing it from step 0 was an arrow aimed
at blank canvas. It appears at the ENTRY of the createpv step (the ball has to have a wire to
ride) while the cylinder itself still appears later, on that ball landing.
```

### before `const boundLbl = text({ class: 'scheme-label code dim', x: SPINE_X + 22, y: 296, 'text-anchor': 'start' }, [' `

```
Anchored to the RIGHT of the spine, growing away from the overlay. Left-anchored it reaches back
to x=286 at its current length, and the overlay drops to y=342 on a small window (measured at
900x650), which puts this label at y=296 squarely underneath it. It only looked safe on a wide
window, where the overlay stops at y=172.
```

### before `const chipX = CHIPS_X0;`

```
The strip is laid out from its own total width so it centers on CANVAS_CX, the same center the
blocks above use. Hand-placed x values had it spanning 90..1080, a center of 585, so the whole
bottom row sat 15px left of the diagram it belongs to.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the highlight class, not the text), and
steps are always entered in order (gotoStep rebuilds then replays 0..target), so the diff is
deterministic. Same helper as storage-pvc-binding, this is the catalog-wide chip pattern.
```

### before `narration: 'With static provisioning an administrator has to create the volume by hand before anyone can claim`

```
Deliberately motionless. A box flash would be canon-legal here (packet-less and Pod-less) but
was tried and rejected: the StorageClass is being READ in this step, not acting, and a blink
reads as the block doing something. The static .highlight outline carries it.
```

### poster

```
Abstract, not the literal diagram: a claim on the left, a class "gear" in the middle, and a disk
being drawn into existence on the right (dashed outline, not yet solid). Made to order, not picked
off a shelf, so the shelf is absent entirely.
```

---

## storage-emptydir

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550`

```
emptyDir Lifecycle. Storage grammar as a VERTICAL STACK, but the whole thing lives INSIDE one
node boundary, because that is the point of an emptyDir: it is born on the node, lives on the node
disk, and dies when the Pod leaves the node. The Pod (two containers) sits at the top of the node,
the emptyDir disk sits on the shelf below it, and the IDENTITY SPINE at x=600 (bare dashed, dim,
no arrowhead) marks that the directory is owned by this one Pod.

GEOMETRY. The whole composition (node, Pod, disk, chip strip) is centered on x=600 and lifted as
high as the narration overlay allows so it reads vertically centered: the overlay was measured at
every step and reaches (300, 163) on a comfortable 1600px viewport, so the node top sits at 170,
flush under the panel (on narrower windows the overlay grows to (399, 223) and may brush the
node's top-left corner, an accepted trade). A longer narration invalidates the measurement. The
node keeps extra background below the disk so the inner blocks do not crowd it, and the chip
strip spans exactly the node width (180..1020).

PULSE MODEL (canon, per the volume-model anchor card): the Pod is one unit and blinks as one, its
containers included, because they are part of the Pod rather than neighbours of it. The pulse takes
the whole Pod group. (Reversed 2026-07-29, author decision: the 2026-07-16 rule pulsed the shell
alone and left the containers on a static highlight.) No container takes a crash flicker. HIGHLIGHTS ARE STEP-STATIC: every block a step uses lights at step entry, above the
reduced guard, and the shell pulse fires at the same instant, one beat, no arrival delays.

FADES exist for exactly one meaning: an object CEASING TO EXIST. The dies step ghosts the Pod and
its directory in one simultaneous fade (Pod deleted, directory deleted with it). Nothing else
fades, the sizeLimit step included: it holds the directory at full opacity and carries its beat
with the shell pulse and the over-limit write instead. (Corrected 2026-07-29: this note used to
claim that step ghosts the Pod, and it never has.)

WIRES are the volume-model grammar: the dim center spine (ownership, no traffic) plus one
L-shaped directed lane per container, dropping from the container and entering the cylinder
through its SIDE. Traffic here is one-way per container (the app only writes, the worker only
reads), so each side carries a SINGLE lane with an arrowhead for its one direction: the app lane
points into the cylinder, the worker lane points into the container. The containers are pushed
toward the Pod edges so their centers land outside the cylinder span, symmetric about the spine.
```

### before `function setChip(chip, val) {`

```
Sets each chip and statically highlights the ones whose value CHANGES on this step (the standard
set by the volume-model anchor): a chip that changes glows for the step, a chip that stays the
same does not. Steps are always entered in order, so the diff is deterministic.
```

### before `setChips(s, { ed: 'empty', medium: 'node disk', limit: 'none' });`

```
The cylinder is visible from idle (deliberate), and the Pod is already on the node, so the
truthful idle state is an existing empty directory. The create step then narrates how it
came to be, flipping the chip to created empty.
```

### before `const GONE = [s.refs.pod, s.refs.ed, s.refs.spine, s.refs.wWrite, s.refs.wRead, s.refs.diskLbl];`

```
The Pod and its directory are gone. One simultaneous ghost fade for everything that
belonged to the Pod, so the delete reads as a single event. Ghost opacities are pinned
statically so reduced motion and a mid-step cancel land on the dimmed state.
```

### poster

```
The card in miniature: one node boundary holding the Pod (two containers) over a dashed,
ephemeral scratch cylinder. The signature side-entry L-lanes with chevrons tell the story in
one frame: the left container writes INTO the disk, the right container reads OUT of it.
```

---

## storage-ephemeral-storage-eviction

### decision: Kubelet is an accepted off-card actor in storage (2026-07-29)

Family K of review item 2.4 rewrites narration that makes an actor the grammatical subject where
the card draws no block for it. This card is deliberately exempt, and so is `storage-hostpath`.
The `sources`, `podLimit`, `diskPressure` and `rankEvict` steps all name the Kubelet as the
subject, and every one of those statements is true of work only the Kubelet does. The storage
category has almost no Kubelet box by design, so the alternatives were a prose sweep over two
whole cards into the passive voice, which throws the mechanism away and is exactly the shape of
edit this project has been burned by, or drawing a Kubelet block, which is geometry and outside
2.4. Accepted as an off-card actor for the whole category instead. Do not file these again.

### before `const NODE_X = 210, NODE_Y = 45, NODE_W = 780, NODE_H = 485; // 210..990, canvas-centered`

```
Ephemeral Storage Limits. The whole scene is one node, CANVAS-CENTERED (210..990, center 600).
Inside it the main column (the focus Pod, the three things that make up its ephemeral usage, the
nodefs disk) is a VERTICAL STACK symmetric about COL_CX = 620: the Pod centered over the contributor
row, the row centered over the disk. The other Pods, which matter only for the node-wide path,
are a right-hand column inside the node (they cannot leave it: DiskPressure on THIS node is what
evicts them), top-aligned with the focus Pod. The chip strip below spans exactly the node width.

COL_CX is 620 rather than the node's own 600, and that 20 unit offset is the whole R5 story on this
card (2026-07-27). This narration is the longest in the storage set, so the overlay reaches x<=397
all the way down to y=355, which covers BOTH the Pod tier and the contributor tier. At the old 480
the Writable box (250..390) was 100 percent behind the panel, the Pod 21 percent and its app box 16.
Shifting the stack right by 140 clears all three (the Writable box now starts at 390, seven units
inside the panel's right edge at its worst, five percent of its area), and 620 is as far left as it
can go while doing so. The disk moves with the row, so its three contributor lanes still drop on
+/-160 either side of its own midpoint and stay a mirrored pair.

The card must keep TWO eviction paths distinct. Path A is per-Pod: writable + emptyDir + logs going
over limits.ephemeral-storage evicts THIS Pod at once, regardless of node health. Path B is
node-wide: nodefs usage crossing the eviction threshold taints the node DiskPressure, and kubelet
then evicts Pods ranked by Pod Priority and by how far each is over its request, which can hit a
Pod that was within its own limit. (Corrected 2026-07-29: this note said QoS class, which is what
the card's own distinct step contradicts.) Only Pods pulse. The disk and contributor boxes light.

GEOMETRY. Every lane is ONE straight vertical segment: the disk is wide enough (440..800) that
all three contributor centers drop straight onto its top, no corners anywhere. Centering the node
puts its top-left corner (and the node tag on narrow viewports) under the narration overlay, the
accepted price of the centering: a node frame is a container, not content, and the rule that counts
occlusion skips it. Every content BLOCK stays clear of the measured overlay. The left third of the
frame is empty for the same reason, and on a wide viewport, where the panel is short, it reads as
empty rather than as reserved. Clamping the panel height in CSS is the open question that would let
this card put something there.
```

### poster

```
The node holds a low nodefs disk (clean outline, no fill) with its three ephemeral contributors
(writable + emptyDir + logs) raised just above it and tied down to the disk top by short lines,
linked by a dashed line to the Pod that draws on it. Everything sits inside the one node boundary.
```

---

## storage-ephemeral-vs-persistent

### before `const SPINE_X = 600;`

```
Ephemeral vs Persistent, the side-by-side card. One Pod on top mounts two volumes, and the whole
scheme is a SYMMETRIC STACK centred on the canvas spine (SPINE_X = 600, the viewBox centre): the
Pod straddles the spine, and each volume hangs an even distance left and right of it. LEFT is
ephemeral (an emptyDir owned by the node), RIGHT is persistent (a PVC bound to a PV whose disk is
a separate object, tied by a dim dashed identity link, Bound, no arrowhead).

Each column carries TWO straight vertical lanes so every direction has its own arrow: an OUTER
write lane (Pod down to the volume, the ball descends) and an INNER remount lane (volume up to the
Pod, the ball rises). The Pod writes to both, is deleted, and is rescheduled onto another node. The
emptyDir comes back empty (it was tied to the old node) while the PVC reattaches the very same disk
with the data intact. Only the Pod pulses. Disks and the claim box are infrastructure: they light.

Because the diagram is centred on the canvas, the Pod's left shell edge passes under the top-left
narration overlay. This card's panel bottoms out at y=181 (measured over 1600/1280/1100), and the
Pod is sized and placed against that: 560 wide at y=90 leaves about a tenth of its area behind the
panel at the worst viewport, against a sixth at the old 620 wide at y=66, which the OCCLUDED rule
counted as a lost block. It cannot clear the panel outright without landing on the volume tier
(the columns start at y=306 and the write lanes would shrink to stubs), so a tenth is the trade.
Nothing essential is hidden: the pod() label and the app box are centre-anchored at the spine, so
they stay clear, and every volume sits below y=306, well under the overlay. The divider between the
ephemeral and persistent halves starts under the Pod (POD_BOTTOM + 16) rather than at a typed 206,
so it can never poke into the Pod when the Pod moves. The three state chips are a single width on
one pitch, centred on the canvas.
```

### before `function setChip(chip, val) {`

```
Sets each chip and statically highlights the ones whose value CHANGES on this step (highlight,
never flash). clearHL wipes the highlight class but not the text, and steps replay in order, so
comparing against the chip's current text is a deterministic per-step diff. Mirrors the
volume-model card and the shared chip convention: a status chip that changes is lit for the step.
```

### before `s.refs.ed.classList.add('highlight');`

```
All three volumes are attached from the start of the step, so they light at entry. Then the
two mount balls ride up their INNER lanes (volume to Pod), and the Pod pulses on arrival. The
left mount carries nothing, the right mount carries the surviving row.
```

### poster

```
One Pod, two volumes, one split down the middle: after a reschedule the ephemeral emptyDir (left,
dashed and faded) comes back WIPED EMPTY, while the persistent PVC/PV (right, solid) reattaches
the very same disk with its data rows INTACT. The empty-vs-full contrast is the whole card.
```

---

## storage-fsgroup-ownership

### before `const CONTENT_CX = 600;`

```
fsGroup and Volume Ownership (viewBox 1200x640).

A volume mounts owned by root, so a container running as a non-root user cannot write to it.
securityContext.fsGroup tells kubelet to chown and setgid the whole volume tree to that GID
before the container starts. fsGroupChangePolicy then decides whether kubelet walks the entire
tree on every start (Always, the default) or checks only the top-level directory and skips the
walk when it already matches (OnRootMismatch), which is what keeps a volume of millions of files
from adding minutes to every Pod start.

---- Composition: one spine, nothing beside it ----
Everything on this card sits on a single vertical spine at CONTENT_CX, in storage stack grammar:

  Pod app-0   (App + securityContext as its two inner rows)
  kubelet
  volume tree (a real directory listing, three rows, each showing its owner)
  PV-app      (the disk the tree lives on)

The version this replaces put the disk and the tree SIDE BY SIDE on a shelf, and that one choice
caused most of what was wrong with it. A shelf pushes the tree centre 95 units right of the
spine, so the chown lane could not land on the middle of the thing it was chowning, the write
lane had to come down as a third off-centre line, and the disk was joined to the tree by a
horizontal stub that carried no traffic. Stacking them puts every arrow back on the block it
points at and makes the whole card symmetric about x=600.

securityContext is now an inner row of the Pod rather than a box under it, which is both truer
(it is a field OF the Pod, not a peer of it) and what buys back the vertical room the listing
needs.

---- The narration overlay, measured for THIS card ----
The overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units it
eats. Worst right edge / bottom edge across all 7 steps, by viewport, measured 2026-07-21 and
still valid because the narration strings below are unchanged:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 205     900x650 -> 398 / 375
So the reserved rectangle is x<=398 AND y<=375. The narrowest block on the spine is the Pod at
226 wide, whose left edge is 487, and the widest is the tree at 340, left edge 430. Both clear
398, so the x condition alone keeps every block out of the overlay at any height and the stack
is free to be centred vertically. A longer narration invalidates these and they must be
re-measured.
```

### before `const POD_W = 226, POD_H = 126;          // the storage-category Pod standard (storage-csi-attach-mount)`

```
---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
Tier heights and the gaps between them are declared once, summed, and the leftover space is
split evenly above and below. Nothing here is a hand-typed y.
```

### before `const IN_INSET = 16, IN_W = POD_W - IN_INSET * 2, IN_H = 42;   // 194 wide`

```
---- The Pod's two inner rows ----
The container and the securityContext share the Pod's inset, so their edges line up and read as
two fields of one object. The pod primitive puts its own label baseline at y+16, so the first
row starts at 26 to clear it, and the Pod carries no sublabel of its own: runAsUser belongs to
the container row, which is the thing actually running as that user.
```

### before `const ROW_COUNT = 3, ROW_H = 24, ROW_GAP = 10, ROW_PAD = 16;`

```
---- The volume tree, drawn as a directory listing ----
Three rows, each carrying a name on the left and its owner on the right. This is the load-bearing
change on the card: the version this replaces drew five blank rectangles and swept a ball across
them, so the one thing that actually happens during a chown, the ownership changing, was nowhere
on screen and the sweep read as decoration.

Row 0 is the TOP-LEVEL DIRECTORY, and that is not a cosmetic detail: OnRootMismatch is defined in
terms of exactly that directory, so having it as a labelled row is what lets the last step show
the rule instead of asserting it. Row 2 stands in for the rest of the tree, which is what makes
the 'minutes per start' claim on the Always step something the reader can see rather than take on
trust.

A row is built with valChip, the SAME primitive as the readouts in the strip along the bottom, and
for the same reason: a row is a name with a value against it. The first version hand-rolled them
out of a scheme-box-rect at 3% fill inside a group held at 0.75 opacity, and that combination read
as grey furniture sitting BEHIND the tree rather than as content on it. valChip brings the chip
fill, the category stroke and the bright chip text, so the listing now matches the strip below it
in weight and colour, and it brings .highlight, which is how a row shows it has been visited.

The gap between the name column and the owner column is where the walk lane runs, so it is sized
off the longest string on each side. valChip anchors the name 12 from the left and the value 12
from the right, and scheme-chip-text measures 6.88 viewBox units per character:
  name  '... 4.2M more'  13 ch = 89, from local 12  -> ends local 101
  owner 'root:2000 g+s'  13 ch = 89, to local 296   -> starts local 207
The lane sits at local 154, so it has 53 units of clear space either side of it.
```

### before `const W_SEC_KUBE = [[CONTENT_CX, POD_BOTTOM], [CONTENT_CX, KUBE_TOP]];`

```
---- Lanes ----
Two lanes reach the tree and they arrive on DIFFERENT EDGES on purpose, so neither has to share
an edge with the other and neither lands off centre. The chown comes down the spine into the TOP
edge, because that is kubelet acting on the volume. The write comes in from the RIGHT edge on its
own bypass, because the container writes to the volume directly and never through kubelet. That
bypass is the one structural fact this diagram can state that the narration cannot, which is why
it survives even though it is the only thing on the card that is not on the spine.
```

### before `const W_PERSIST = [[CONTENT_CX, TREE_BOTTOM], [CONTENT_CX, CYL_Y]];`

```
The chown does not stop at the listing: it lands on the volume, which is the whole reason it
survives a restart and therefore the whole reason OnRootMismatch is allowed to trust it. So the
disk is a real destination on this card, not a backdrop, and the same spine carries the change one
tier further down into it.
```

### before `const WALK_SPEED = 0.068, WALK_MIN_MS = 420;`

```
The walk deliberately leaves the PKT_SPEED canon, because a walk is WORK and not transit. Both
sweeps run at the SAME speed and differ only in how far they travel, which is the honest shape of
the thing: OnRootMismatch is not a faster walk, it is a walk that stops after one entry. At
WALK_SPEED the full listing takes about 1470ms and the single-directory check about 470ms, a
ratio the eye can compare directly. WALK_MIN_MS floors the short one so it stays longer than its
own fade in and out and reads as a check rather than as a glitch.
```

### before `const CHIP_W = 300, CHIP_GAP = 16, CHIP_COUNT = 3;`

```
---- Chip strip ----
ONE width for all three chips. valChip anchors the name 12 from the left and the value 12 from the
right, so a chip needs name + value + 24 plus a readable gap. Measured worst cases, in viewBox
units: owner 41 + 'root:2000 g+s' 90 = 131, write 35 + 'allowed' 48 = 107, fsGroupChangePolicy
131 + 'Always (default)' 110 = 265. So 300 clears the worst by 35.
```

### before `function podBlock({ x, y }) {`

```
PULSE MODEL: the Pod is ONE unit and blinks as one. The shell and both inner rows live in `group`,
and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its targets with
querySelectorAll, which matches descendants only and never the element itself, so pulsing a bare
pod() would catch its .scheme-pod-rect child but not the group, and the pulse would silently fire
at half strength (symptom in anim-dump: strokeOpacity rows, no filter row). Neither inner row is
ever given a .highlight, so nothing stays lit after the blink has decayed.
```

### before `const wires = [W_SEC_KUBE, W_CHOWN, W_WRITE, W_WALK, W_PERSIST]`

```
Each wire is built from the SAME points array as the ball that rides it, so the drawn lane and
the packet cannot drift apart. All five carry a ball on some step, which is what earns them an
arrowhead. W_PERSIST used to be a bare markerless line, on the reasoning that the disk backing
the tree is a relationship and not traffic. That was wrong, and it is what made the disk read
as scenery: a chown is not an abstraction over the volume, it rewrites inodes ON it, so there
IS traffic down that line and it earns its arrowhead like any other.
```

### before `[cyl, tree].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the disk and the tree, then the listing rows so they sit on the tree
face, then kubelet and the Pod, then the backing link and the lanes above every block, then
the disk caption, then the chip strip, then the packet layer so every ball rides above all.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
still holds the previous step's text at call time (clearHL clears the class, not the text) and
steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setRows(s, chowned) {`

```
Same rule for the listing: every step writes EVERY row, so no row can be left displaying an
ownership the current step has already moved past. `chowned` is the whole state, because on this
card the tree is only ever entirely before the chown or entirely after it.
```

### before `function walkRows(s, ctx, { delay = 0, only = ROW_COUNT, chown = false } = {}) {`

```
Sweep the scan down the listing, lighting each row as the ball crosses its centre and, when the
step is the chown itself, flipping that row's owner at the same instant. `only` is how many
entries kubelet actually inspects: the whole listing under Always, exactly one under
OnRootMismatch. The ball is LINEAR, so a row's moment is a pure ratio of distance and needs no
easing correction, which is the reason this is a segmentPacket and not a routePacket. Returns the
arrival time so the caller can chain the tree light off real geometry.

A row lights by taking .highlight as the ball crosses it and KEEPS it for the rest of the step, so
the listing fills in behind the scan and the finished frame shows exactly how far kubelet got.
That is what makes the last two steps comparable at a glance: three lit rows under Always, one lit
row and two untouched under OnRootMismatch. Rows are readouts, not actors, so this is a static
highlight and never a blink.
```

### before `if (chown) s.refs.rowOwners[i].textContent = OWNER_BEFORE;`

```
A zero-effect timer animation lands the visit exactly on the beat the ball crosses the row, the
same trick lightBoxAt uses. On the chown step the final owner values are already pinned above
the reduced guard, so this only has to stage the before-value and schedule the change.
```

### before `if (ctx.reduced) { s.refs.tree.classList.add('highlight'); return; }`

```
The tree lights only when the write actually gets there. Lighting it above the guard, as this
step used to, meant the destination was already lit while the ball was still in flight, which
reads as the tree reacting before anything reached it.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
Pod to infra, so up-arrow ordering: the Pod blinks first because it is the actor, and the
write leaves at BEAT.afterPulse down the bypass. The write attempt is literal traffic the
step narrates, not decoration: the process really does issue it and it really does reach the
tree. What differs from the 'writes' step is everything around it, the same lane and the
same shape of tag read as a refusal here and as success there. The disk stays dark, and that
is the point: a refused write never reaches the volume.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
The field being read out belongs to the Pod, and the ball leaves the Pod carrying it, so this
is up-arrow ordering like any other Pod-to-infra hop: the Pod blinks first as the source and
the ball departs at BEAT.afterPulse. It used to fire the ball with no pulse at all, which
left the one block the packet came out of as the only inert thing on the step.
```

### before `const r = routePacket(s, ctx, W_CHOWN, { role: 'storage' });`

```
Three chained hops that read as one continuous movement down the spine: kubelet issues the
chown, the scan carries straight on into the listing, and the change lands on the volume.
Every time comes off arrivalMs and BEAT, never a typed delay.
```

### before `pulsePod(s.refs.appPod, ctx, 0);`

```
The Pod blinks as the writer, then the write leaves at BEAT.afterPulse down the same lane it
was refused on. Unlike the 'denied' step the bytes get through, so the volume lights with the
tree: the two together are what 'the write landed' looks like.
```

### before `s.refs.cyl.classList.add('highlight');`

```
The volume is lit from entry rather than on a ball, because here it is the SOURCE: every
entry the scan re-checks is an inode read off this disk, which is precisely where the cost
being narrated comes from.
```

### before `s.refs.cyl.classList.add('highlight');`

```
Lit from entry, and this is the step where that matters most: the ownership OnRootMismatch
trusts is the ownership sitting on this disk from the last start. Without the volume lit here
the rule looks like kubelet guessing rather than kubelet reading persisted state.
```

### before `const walkEnd = walkRows(s, ctx, { delay: 0, only: 1 });`

```
Only the top-level directory is inspected, and the ball stops beside it. The full-length lane
stays drawn underneath on purpose, and the two rows below it stay resting: seeing the scan
NOT travel the listing is the whole point, and it is directly comparable with the step before
because both start from the same place at the same speed. No block flash to close on, this
is the last step and it should come to rest.
```

### poster

```
Ownership of a tree: a non-root Pod cannot touch a row of root-owned files until a sweep re-owns
them, entry by entry.
Kubelet reaches one directory listing and it is the TOP row that decides everything: under
OnRootMismatch that row alone is read, and if its ownership already matches, nothing below it is
touched. So the poster is the listing, and the owner cells step DOWN a gradient, 0.20 / 0.13 /
0.07, rather than being one bright cell over two identical dim ones. The ramp says the same
thing the flat pair did, that attention belongs at the top, but it reads as a deliberate scale
instead of as one odd cell out. Only the small cells carry the ramp: the three row rectangles
behind them stay identical, because the rows themselves are peers. Redrawn when
the card moved off its old side-by-side shelf: the previous version showed a kubelet box over
five blank glyphs swept left to right, which is a layout the card no longer has and a sentence
it never made, since nothing in it depicted ownership at all. Content sits 17..163 in a 180 tall
box, symmetric about x=160. No packet dot: a ball frozen on a wire reads as a paused animation.
```

### before `walkRows(s, ctx, { chown: true });`

```
walkRows carries its own ctx.reduced branch (light every row it would visit, no packet), but the
three steps that call it were calling it BELOW the guard, so that branch was unreachable and the
static path showed an unvisited listing on the one card whose subject is the walk. The guard body
now calls it too: the whole tree on chown and always, and the top directory alone on onmismatch,
which is exactly the picture that step argues for.
```

---

## storage-generic-ephemeral-volume

### before `const CX = 600;`

```
Generic Ephemeral Volumes. An inline volumeClaimTemplate written directly on the Pod under
ephemeral. It gets a real PVC, a real StorageClass, real dynamic provisioning and a real CSI mount,
so unlike emptyDir it can be large, of a specific class, and even snapshotted. But its lifetime is
the Pod: the PVC carries an ownerReference back to the Pod and is garbage-collected when the Pod
dies. This card is the bridge between the ephemeral world and the persistent machinery, so the
identity column is the Pod owning its PVC owning its PV, and the last gesture is that whole column
collapsing when the Pod goes away.

---- Horizontal composition ----
The identity column runs straight down the canvas centre line (Pod, PVC, PV, all on CX = 600) and
the two machinery blocks flank it symmetrically: the StorageClass the claim names on the left, the
provisioner that acts on it on the right, both on the claim row and equidistant from it. Content
spans 112..1088 with the chip strip, margins equal a side. The earlier pass ran 430..1090.

---- Vertical composition ----
The identity column is evenly spaced, so the ownership above the claim and the binding below it read
as one rhythm rather than as two different distances:
  36    canvas top margin
  36    Pod                110 tall, to 146
  66    gap, ownerReference link and the mount and GC lanes that flank it
  212   claim row          72 tall, to 284, with the class and the provisioner on the same line
  66    gap, the Bound link and the lower half of those same lanes
  350   the volume         110 tall, to 460
  500   mount caption
  570   chip strip         34 tall, to 604
  36    canvas bottom margin, equal to the top one

---- Narration overlay ----
Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
  1920x900  right 102  bottom 183
  1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173
  1100x900  right 397  bottom 149
  1280x860  right 397  bottom 205   <- added 2026-07-27
  1100x800  right 397  bottom 205   <- added 2026-07-27
Worst case x <= 397 and y <= **205**, not the 183 recorded above: the rows sampled originally were
all 900 or 1000 tall, and a shorter window shrinks the diagram while the HTML panel keeps its pixels.
Only the Pod sits inside that y band, and at 487..713 it clears the overlay on x while staying
centred on CX. The claim row at y 212 clears the real floor by **7 units**, so this row must not
move up. (Corrected 2026-07-29: the stack above and the two spans here were still the pre-resize
numbers, from before the Pod came down to the 226x110 family size.) A longer narration than the ones below would invalidate this
measurement.

PULSE MODEL: only the Pod pulses, and it is a wrapping g. The claim, the class, the provisioner and
the disk are infrastructure: they light via .highlight, on packet arrival where there is a packet
and at step entry where there is not, and they never pulse or blink. The owner step carries no
packet and no Pod pulse, and the canon would allow it the one sanctioned block blink so it does not
read as frozen: it deliberately does not take it. That step states a fact rather than moves
something, and a brightness blink on a block that is only being pointed at reads as traffic that
never arrives. Do not add it back.

WIRES: ONE axis, on CX itself, and EVERY wire on this card carries an arrowhead. There are no
undirected lines left: the ownerReference, the Bound link and the class reference used to hang there
as static dashed strokes, which put three arrow-shaped things on the card that never fired, and
forced all the real traffic 12 units off the block centre lines to get around them. Each of those
three facts is now carried by something that moves or by text that stays:
  ownerReference  a ball down the column on the step where the claim is created, stamping it, plus
                  the claim sublabel (owned by Pod), the caption beside the column, and the lifetime
                  chip. The same lane carries the cascade on the way out.
  Bound           the claim sublabel flips to Bound and the chip says so.
  the class       the ball out to the provisioner carries storageClassName: fast-ssd, which is the
                  field itself, and the class block lights as it is read.
Four column lanes share the one axis (two up, two down) because no step shows both directions, and
every one of them meets its block on the centre of the face it enters. Each lane also goes out
behind the cascade it carries on the closing step, so nothing is left pointing at a ghost.
```

### before `const W_CLAIM_PROV = [[CX + CLAIM_W / 2, ROW_MY], [PROV_CX - SIDE_W / 2, ROW_MY]];`

```
Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
a block edge MIDPOINT, and all four column lanes run on CX itself, so every arrowhead lands dead
centre on the face it enters. Up and down never appear in the same step, which is what lets them
share the one axis.
```

### before `function podBlock() {`

```
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'backing' + 'mounted at /scratch'
at 26 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 26 * 6.89 + 24
of padding is 203 against the 232 available.
```

### before `[podB.group, pvc, sc, prov, pv].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): blocks and the disk, then the relationship links and lanes and their
captions above them, then the chip strip, then the packet layer so every ball rides above
everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `const LANES = ['wClaimProv', 'wCreate', 'wDownHigh', 'wDownLow', 'wUpHigh', 'wUpLow'];`

```
Pins the visibility of EVERY element born or removed mid-story, and of every lane, exactly as
setChips pins every chip. A lane into an object that does not exist points at nothing, so lanes are
pinned to 0 rather than left at whatever the previous step happened to set.
The claim defaults to PLACEHOLDER rather than to 0: it is the middle block of a three-block row, and
cutting it out leaves a hole in that row rather than an absence.
```

### before `setStage(s, { lanes: ['wDownHigh'] });`

```
The ownership used to be a static undirected line hanging under the Pod. It is a ball now: the
claim is stamped with its ownerReference at the moment it is created, so the tag rides down and
the claim comes up to full on its arrival.
```

### poster

```
The owned column: a Pod, the claim it owns, and the volume behind that claim, hanging off one
dashed ownership spine and tapering as it goes down, so the two lower tiers read as derived from
the Pod rather than as neighbours of it.

The grammar is the card's own, and it is what the poster gained in the rebuild. SOLID stroke means
a real object: the whole point of a generic ephemeral volume is that the claim and the volume are
genuine API objects with genuine provisioning behind them, not a folder on the node, so drawing
them dashed (as this poster used to draw the disk) said the opposite of the card. DIMMED means a
borrowed lifetime: they exist fully, they just do not outlive the Pod above them. DASHED is kept
for the spine alone, because ownership is a relationship and not traffic, which is also why the
packet that used to sit on that spine is gone: nothing travels down an ownerReference.
The claim carries the brightest fill because it is the pivot the card turns on.
```

---

## storage-hostpath

### decision: Kubelet is an accepted off-card actor in storage (2026-07-29)

The `idle` and `mount` steps name the Kubelet as the subject although this card draws no Kubelet
block. Left as written, under the category-wide decision recorded on
`storage-ephemeral-storage-eviction`. Do not file these again.

### before `const NODE_X = 180, NODE_Y = 170, NODE_W = 840, NODE_H = 380;   // 180..1020, center 600, bottom 550`

```
hostPath. Storage grammar as a VERTICAL STACK inside one Node boundary, the same skeleton as the
emptyDir card (Node holding a Pod of two containers over a backing cylinder, side-entry L-lanes),
because hostPath is the other node-local volume and the two cards must read as a pair. The whole
card is the CONTRAST with emptyDir: an emptyDir is scratch the kubelet makes FOR the Pod, a
hostPath is a raw window onto a directory that ALREADY LIVES ON THE NODE and belongs to it.

TWO DELIBERATE FAMILY VARIATIONS, both carrying the lesson:
  1. NO OWNERSHIP SPINE. volume-model and emptyDir draw a dim spine from the Pod down to the disk
     because the volume belongs to the Pod. Here the directory belongs to the NODE, not the Pod,
     so that spine is intentionally absent: the Pod and the host directory read as two separate
     things joined only by the mount lanes. The empty gap at x=600 IS the message.
  2. THE reschedule STEP INVERTS emptyDir's dies STEP. emptyDir ghosts the Pod AND its directory
     together (both owned by the Pod). hostPath ghosts ONLY the Pod and its mount lanes while the
     host directory stays lit at full opacity, because the directory is the node's and outlives
     the Pod on that node. That single visual inversion is why hostPath is not persistence.

GEOMETRY is emptyDir's verbatim so the pair aligns: Node 180..1020, Pod 300..900 centered on 600,
the two containers pushed to the Pod edges (centers 425 and 775, outside the cylinder span), the
cylinder 470..730 centered on 600. The narration overlay reaches about (300, 163) here, and the
Node top at 170 sits flush under it. A longer narration invalidates that measurement.

PULSE MODEL (canon): the Pod is one unit and blinks as one, containers included, because the pulse
takes the whole Pod group. (Reversed 2026-07-29: this note recorded the 2026-07-16 rule, which
pulsed the shell alone.) Highlights are step-static, set above the reduced guard, and the shell pulse fires in the
same beat. The cylinder is infrastructure: it lights, never pulses.

WIRES: two directed L-lanes, exactly emptyDir's, each shared by its static pathArrow and its ball.
The app writes DOWN into the cylinder side, the agent reads UP out of the far side.
```

### before `function setChip(chip, val) {`

```
Sets each chip and statically highlights the ones whose value CHANGES on this step (the standard
set by the volume-model anchor): a chip that changes glows for the step, a chip that stays the
same does not. Steps are always entered in order, so the diff is deterministic.
```

### before `s.refs.hp.classList.add('highlight');`

```
kubelet bind-mounts the existing host directory INTO the containers, so the cylinder AND both
container boxes light as the mount lands, and the shell pulses in the same beat. All static
above the guard so reduced motion holds the same lit end-state.
```

### before `pulsePod(s.refs.pod, ctx, 0);`

```
The app WRITE leaves the Pod for the cylinder (up-arrow), so the shell pulses first and the
write ball descends at afterPulse. The agent READ returns the bytes INTO the Pod (down-arrow),
so the read ball leaves the far side first and the shell pulses AGAIN when it arrives back.
```

### poster

```
Pair to the emptyDir poster, same node + Pod + side-entry L-lanes, but the backing cylinder is
SOLID, not dashed: a hostPath is a raw window onto a real directory that already lives on the
node, not ephemeral scratch. The left container writes INTO it, the right reads OUT.
```

---

## storage-mount-path-chain

### before `const LEFT_X = 400;`

```
Where the Bytes Land (viewBox 1200x640). The literal mount chain on ONE node, drawn in the storage
vertical-stack grammar: the disk on the shelf at the bottom, the global staging mount above it, the
per-Pod bind mounts above that, the Pods on top. The single attached block device is mounted
exactly ONCE at a global staging path, and that one staged filesystem is then bind-mounted into
each Pod private directory, which surfaces as /data in the container. Two Pods share one staged
device through two SEPARATE bind mounts: that fan out is the whole point of the card. A mount
rises (device, staging, bind, Pod), then a write descends that same chain, along the same lines
turned around, because it is the same mounts being traversed the other way and not a second path.

---- Horizontal composition ----
Every tier (Pods, bind mounts, staging, disk, chip strip) is symmetric about ONE derived centre,
CONTENT_CX, instead of carrying hand-typed margins. The card this replaces had TWO centres and
neither was 600: the block stack was symmetric about 720 (shoved right to clear the narration
overlay) while the chip strip ran 60..1004 for a centre of 532. Combined bbox 60..1020, so 60
units of margin on the left against 180 on the right, with a dead band down the right edge.

LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
step, by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So the real worst case is x<=398 and y<=344. LEFT_X 400 has about 2 units of slack and cannot move
left at all. The y reading never has to be cleared on its own, because the x reading already does
the work: every block on this card starts at x=400 or further right, so nothing lands under the
overlay at any height. That is what lets the stack be centred vertically for free. A narration
longer than the ones below invalidates these numbers and they have to be measured again.

CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so the two-column width is the only
lever on where the diagram sits. It is solved for, not chosen: 2*COL_W + COL_GAP = 400 puts
CONTENT_CX exactly on 600, the canvas centre.

COL_W is in turn floored by the longest string any block carries, and on THIS card that is a
filesystem path, because showing the real paths is the point of the diagram. Measured in viewBox
units in the browser (never estimated), scheme-box-sublabel runs 5.9 units per character:
  '/pods/uid-a/volumes/vol-1'          147.5   -> the bind boxes, and the binding constraint
  '/plugins/.../csi/vol-1/globalmount' 200.6   -> the staging box, which is 400 wide, so free
  'mount point'                         64.9   -> the container box inside a Pod, 152 wide
COL_W 180 leaves 16 units of air either side of the bind path. That is also why this card has NO
enclosing node() frame even though everything on it lives on one node: a frame needs 16 units of
padding per side, which would drag COL_W down to 164 and force the bind path to be abbreviated.
The narration says "on the node" for free, the path string cannot be bought back.
```

### before `const CORRIDOR = 60;                                     // the gap between two tiers, uniform`

```
---- Vertical composition ----
Every corridor between two tiers is 60 units, so every hop is the same length and therefore the
same 700ms (routeDur floors short paths at HOP_MS), which keeps the chain reading as one steady
walk rather than a set of unequal jumps.

The stack is CHAINED off one origin rather than carrying five hand-typed tier positions, so the
whole thing can be centred by moving a single number. It was previously typed out tier by tier
starting at 44, which put the content at 44..622 in a 640 canvas: 44 units of air above it against
18 below, so the diagram sat visibly low and the chip strip nearly touched the bottom edge.
STACK_TOP is now solved for instead of chosen, and every tier below follows from it.
```

### before `const LBL_POD_Y = POD_BOTTOM + 36;                       // 183, corridor 147..207`

```
Corridor captions sit at the vertical middle of their corridor. The disk caption goes UNDER the
cylinder, in the 32 units between the disk and the chip strip, the same slot storage-volume-mode
uses for its disk labels.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
scheme-chip-text measures 6.88 units per character; worst cases, in viewBox units:
  bind mounts   75.7 + 'Pod A and Pod B' 103.2 = 178.9
  device        41.3 + '/dev/nvme1n1'     82.6 = 123.9
  disk mounted  82.6 + 'not yet'          48.2 = 130.8
  data copies   75.7 + 'none'             27.5 = 103.2
So 232 clears the worst pair with ~29 units between name and value.
```

### before `const lane = (cx, y1, y2) => [[cx, y1], [cx, y2]];`

```
---- Lanes ----
EVERY corridor runs dead on the centre line of the blocks it connects, and a corridor never shows
more than one arrow at a time. When the write descends, the mount arrow that was there is replaced
in place by an arrow pointing the other way, and the ball rides that. So across the whole card a
given corridor is one single line that happens to point up while the chain is being built and down
while the write is followed, which is both what the reader sees and what actually happens: there
is no second path down, it is the same mount being traversed in the other direction.

Getting here took two wrong turns worth recording. First version gave each direction its own lane,
mount at -12 and write at +12 either side of centre. That balances only on the final step, the one
step where a descent lane is visible at all: on the four mount steps before it every arrow on the
card sat 12 units left of its own block with nothing on the right, so the whole diagram read as
skewed. Second version centred only the corridors that never carry a descent, which was worse,
because Pod A and Pod B are drawn as mirror columns and that left one centred and the other not.

The up and down arrays below are therefore the SAME two points in reverse order, which is what
flips the arrowhead, and the pair is crossfaded by flipAt() so it reads as a rotation rather than
as one line being swapped for another. Each array is shared by the static pathArrow and the ball
that rides it, so the wire and the packet cannot drift apart.

Caption clearance: the innermost lanes are the two column centres, 490 and 710, so a corridor
caption centred on CONTENT_CX has 110 units of clear space either side. Holding 8 units off the
nearest lane gives a caption half-width of 102, and at 6.88 units per character (scheme-label
code) that is a ceiling of 29 characters. Overrun it and the first and last letters sit on a lane.
```

### before `[s.refs.wStgBUp, s.refs.wBPodUp, s.refs.bindB].forEach(el => revealAt(el, ctx, 1));`

```
Fades the element in while leaving the caller free to pin opacity 1 statically above the
ctx.reduced guard. Used for the Pod B column, which is a fact the card introduces partway through
rather than structure it starts with. A corridor changing direction uses flipAt instead. The helper
itself moved into scheme-kit on 2026-07-29, see INTERNALS.md.
```

### before `function podBlock({ x, label }) {`

```
PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the container box inside it
both live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for
exactly as long as its ball is in flight. What a Pod must NOT have is a lingering state: no
.highlight is ever put on the container box, here or at step entry, so nothing stays lit once the
pulse has decayed. The card this replaces lit podABox on arrival and again statically on the write
step, which left the /data box outlined long after the ball was gone and made the blink read as a
state change rather than an event.

The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength
(symptom in anim-dump: strokeOpacity rows but no filter row).
```

### before `{`

```
The primitive centres the label on the raw bbox, which reads high because the top cap ellipse
is not part of the visible front face. Re-centre on the face, as storage-volume-model does:
the default for h=88 is 49, and +5 lands it on the middle of the body.
```

### before `const mk = points => pathArrow({ points, dashed: true, dim: true, role: 'storage' });`

```
Column L and the spine carry the chain from the first step, because that chain IS the diagram
and the reader should see its shape immediately. Pod B is held back and faded in when the card
first claims it: that is a new fact, not standing structure. The three write arrows are built
here too but start hidden, because each one is the reversed twin of a mount arrow already on
the canvas and only ever replaces it, never joins it.
```

### before `[dev, stg, bindA, bindB, podA.group, podB.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the disk and the staging band, then the bind boxes, then the Pods,
then the lanes and their captions above the blocks, then the chip strip, then the packet layer
so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
still holds the previous step's text at call time (clearHL clears the class, not the text) and
steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { device, mounted, binds, copies }) {`

```
Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
card comes to report 'bind mounts: none' on the step that just made one. Two of the four never
change on purpose: the device is the fixed bottom of the chain, and 'data copies: none' holding
at none from the first step to the last is the claim the whole card is making.
```

### before `function setStage(s, { podB = 0, binds = 0, descent = 0, podA = 1 }) {`

```
Pin the per-step visibility of everything the card reveals over time. Called from every enter()
above the ctx.reduced guard so a prev/reset replay lands on the right skeleton, and so a mid-step
cancel cannot leave a lane stranded at the opacity some earlier animation was driving it toward.
```

### before `const mount = descent ? '0' : '1';`

```
The three reversible corridors hold ONE arrow at a time: while the chain is being built it points
up, and on the write step the same line points down instead. Mount and write are mutually
exclusive here rather than independently toggled, which is the whole point of the pairing.
```

### before `function flipAt(upEl, dnEl, ctx, delay = 0) {`

```
Turn one corridor around in place: its mount arrow fades out and its write arrow fades in over the
same 300ms on the same centre line, so the eye reads one arrow rotating rather than a swap. Called
just before the ball that uses the corridor sets off, so the line always points where the ball is
about to go. Under ctx.reduced it snaps, which keeps the static end-state honest.
```

### before `const p = routePacket(s, ctx, W_A_POD_UP, { role: 'storage' });`

```
Infrastructure reaching a Pod, so the down-arrow ordering: the ball flies first and Pod A
pulses on its arrival. Pod A is dim until the volume actually surfaces inside it, so it is
driven back to 0.5 and faded up on arrival, in step with the pulse.
```

### before `if (ctx.reduced) {`

```
The static end-state of this step is the whole chain lit, because by the time the write has
finished the ball has arrived at each of the three blocks in turn. Lighting only the device
here would make a prev/reset replay show a different ending than a forward play.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Pod A is the writer, so the up-arrow ordering applies at the top of the chain: the Pod blinks
first and the write leaves at BEAT.afterPulse. Each hop then chains off the previous hop's
real arrival time rather than a hard-coded delay, and each corridor turns around just before
its ball uses it, so the chain visibly reverses one link at a time ahead of the write rather
than flipping all three at once on step entry.
```

### poster

```
One staged device, two doorways: a single disk mounts once, then bind-mounts fan to two Pods.
Every link is a straight vertical drop, never a diagonal, and every one of the three is the same
26 units long: the staging band spans exactly the outer edges of the two bind mounts above it,
so each drop lands on a block centre and the whole thing is symmetric about x=160. The disk link
runs edge to edge, from the top of the cap at 127 to the bottom of the band at 101, rather than
disappearing into the cap the way the earlier version did. Content sits 15..165 in a 180 tall
box, so the margin above and below matches. No packet dot: a poster is a standing statement, and
a ball frozen on a wire reads as a paused animation.
```

---

## storage-multi-attach-error

### before `const LEFT_X = 400;`

```
The consequence card for storage-access-modes: its ReadWriteOnce step ends with a Pod on the wrong
node getting refused, and this card is the whole life of that refusal. An RWO volume may be
attached to ONE node at a time. The old Pod holds it on node-1 through a VolumeAttachment that
says attached true, a rolling update creates the replacement on node-2 before the old one is gone,
the attach and detach controller cannot write a second attachment for the same volume, and the new
Pod hangs in ContainerCreating with "Multi-Attach error for volume".

---- What this card deliberately does NOT cover ----
node-1 is HEALTHY on this card from the first frame to the last, and that is the whole boundary
between this card and storage-volume-detach-on-node-loss. Here nothing is uncertain and nothing is
broken: the volume is legitimately held by a Pod that is legitimately still running, and the only
reason the new Pod waits is that its own rollout strategy created it before deleting the old one.
It is an ORDERING problem with an ordering fix (Recreate). The unreachable-node case, the
unreachable-toleration and force-detach clocks, the roughly six minutes, and the argument about
two writers corrupting one filesystem all belong to the detach-on-node-loss card and are deliberately not
re-told here. An earlier pass told both stories on both cards, in nearly the same sentences, and
the pair read as one card shown twice. If a timeout shows up in this file again, it has drifted.

---- Composition (viewBox 1200x640) ----
Storage grammar is a vertical stack, and this card runs FOUR tiers because the story is a chain of
four objects and each one has to be visible as its own thing:
  1. two node frames, each holding one Pod            (the two claimants)
  2. the attach and detach controller, one 300 wide box on the spine      (the decider)
  3. the two VolumeAttachment objects, one per node, spread wide          (what it writes)
  4. the disk on the bottom shelf                                         (what is contended)
The card is a MIRRORED PAIR about CONTENT_CX: for every box on the left there is one of identical
size at the identical offset on the right, and the two attach lanes are mirror images. So the only
thing that ever differs between the left and the right half is state, never geometry. That is the
point of the card, and it is why the tiers narrow and widen symmetrically rather than in a
straight column: node row 400 wide, controller 300, the VolumeAttachment fork 592, the contended
disk 240. Widest in the middle of the stack, narrowest at the decider, which is the shape of the
sentence: one component, two records, one disk.

Every tier shares ONE derived center, CONTENT_CX, rather than carrying hand-typed margins.
LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
step, by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So the real worst case is x<=398 and y<=344, and it is an L: above y=344 nothing may sit left of
400, below it the full width is free. The two upper tiers (node row, controller) therefore start
at LEFT_X or inside it, while the VolumeAttachment row at y=359 hangs 96 units further left on
each side because it is clear of the overlay's bottom edge.

That headroom is BOUGHT, and it is the reason the row can spread at all. The overlay grows one
~31 unit line at a time at 900x650, and the narrations here used to run to 383 characters, which
put the bottom at 406 and buried the left VolumeAttachment. Everything below is held under ~290
characters. Measured per step, eight of the nine sit on the 313 line and only `idle` wraps one
line further, to 344, which is what sets the number above. So the clearance over the VA row is
16 units, not the 47 an earlier revision of this comment claimed: it is still positive, but it is
ONE line of narration, and trimming `idle` by a few words is what would buy the margin back.
Re-measure after editing narration, not just after moving geometry, and measure the poster step
too: it carries step one's text and is the step that binds here.

CONTENT_CX = LEFT_X + CONTENT_W/2 and LEFT_X cannot move, so CONTENT_W is the only lever on where
the diagram sits. It is solved for, not chosen: CONTENT_W 400 puts CONTENT_CX exactly on 600, the
canvas center. That exactness matters because of the chip strip, which at 976 units is far wider
than the diagram above it and is therefore the tier that sets the visual center of the card. On
600 it spans 112..1088, so the left and right margins agree at 112. Widen CONTENT_W and the strip
slides right while every other tier still looks internally symmetric, which is the failure mode
that shipped in the sibling cards.

The previous version of this card had the controller alone in the bottom LEFT corner at x=60 with
the nodes and the disk up and to the right, which left a large dead region through the middle and
put content under the narration overlay. It also drew the node captions by appending an
absolutely positioned text INTO a translated group, so the node-2 caption rendered at x=1614 and
was clipped away entirely. Both are gone: node() places its own caption in group-local
coordinates, and every tier is derived from CONTENT_CX.
```

### before `const NODE_H = 156, BAND_H = 76, VA_H = 76, DK_H = 86, CHIP_H = 34;`

```
---- Vertical stack, chained off one origin so the whole card centres by moving one number ----
The tiers used to be typed out one y at a time and sat 44..628, which left the top of the card
looser than the bottom and, worse, gave the node row only 30 units of air above the controller
while the three lower tiers were packed at 52. That reads as a flat, crowded bottom half under a
floating top one. Heights and gaps are declared once now, summed, and the leftover space is split
evenly, so the nodes sit higher, the controller drops, and every corridor below it opens up.
Block sizes follow storage-csi-architecture, which sets the storage family's box at 232 x 76 (its
SIDE_W is 232 and its sidecar row is 76 tall). Both the controller and the two VolumeAttachments
take that 76, and the VolumeAttachments take the 232 exactly. The controller is the one exception
on width and it is forced, not chosen: 'Attach/Detach controller' renders about 252 units, so a
232 box would clip its own label. It keeps 300, which leaves ~24 units of air.
```

### before `const POD_W = NODE_W - NODE_PAD * 2;                     // 148`

```
NODE_W is floored by the widest string inside a column, which is now the Pod sublabel
'Multi-Attach error' at about 113 units: NODE_W 180 leaves ~17 units of air either side of it.
It used to be floored by the VolumeAttachment strings instead, but those boxes no longer live in
a node's column, so they set their own width and stopped dictating this one.
```

### before `const APP_DY = 30, APP_H = 44;`

```
The App box inside a Pod, in Pod-local coordinates. pod() draws its own label on the baseline at
y=16 and its state sublabel on the baseline at y=h-8, so the free band inside a 102 tall Pod runs
20..84. APP_H 44 centered in it leaves 10 units under the Pod label and 13 above the sublabel.
This is not cosmetic: the App box used to be 40..86 against a sublabel whose glyphs start at 87,
so 'Running' and 'ContainerCreating' collided with the box edge on both Pods.
```

### before `const BAND_W = 300;`

```
The controller is 300 wide rather than spanning the node columns at 400. That is not a style
choice, it is what makes the fan below possible. Its two output lanes now leave its SIDE WALLS at
mid-height and step outward before dropping, so the narrower the controller, the more room those
lanes have to travel before they hit the hard left limit at x=398 (the narration overlay). At 400
wide the left lane would have had to start travelling left from x=400 itself and would have run
straight under the panel. At 300 it starts at 450 and has 30 units of clear step-out.
```

### before `const VA_W = 232;                                        // storage family box width, from csi-architecture`

```
The VolumeAttachment row is the widest tier in the diagram, and deliberately so: it is the only
place where the two claimants are separate objects rather than two halves of one band, so the eye
should read it as a fork. The pair used to stand 60 apart directly under their node columns, which
left the whole lower half looking vertically compressed. Now they sit 190 apart, hanging 65 units
outside the node columns on each side.

VA_CX 420 / 780 is a HARD FLOOR on the left, not a preference. Each lane drops vertically from
BAND_MID_Y 265 down to VA_TOP 359, and that whole descent happens above the narration overlay's
bottom edge (measured at 344 at 900x650), so the lane must stay right of the overlay's right edge
at 398. 420 keeps 22 units of clearance. Push the pair further apart and the left lane goes under
the panel, which is the one thing on this tier that cannot be fixed by moving anything else.

The BOXES themselves are free to hang much further out than their lanes, because at VA_TOP 359
they are already below the overlay: at 232 wide the left one spans 304..536, reaching 94 units
past the limit that binds its own lane. That asymmetry between where a lane may go and where a
box may go is the whole reason this tier can be the widest in the diagram.
```

### before `const DK_SIDE_Y = DK_Y + DK_H / 2;                       // 526`

```
Each attach lane drops STRAIGHT DOWN from its VolumeAttachment and makes one 90 degree turn into
the disk's SIDE WALL. The two Ls face each other across the disk, so the pair reads as two
claimants closing on one volume from opposite sides, and the middle of the corridor stays free for
the band caption. A funnel into the top face was tried instead and dropped: it made both lanes
share a final vertical segment and land one arrowhead on one point, which lost the mirrored pair
that is the whole shape of the card.

DK_SIDE_Y is the vertical CENTRE of the 86 tall body, so the two attach lanes enter each side wall
dead centre of the disk rather than up in its top third. The arrowheads land on the side walls at
x 480 and 720, while the centred 'PV-web RWO' label sits at x 600, so centring the entry height
does not collide with it. The cap ellipse (483..499) is well clear above.
```

### before `const BAND_LBL_Y = 337;`

```
The band caption sits in the corridor between the controller and the VA row (303..359), centered
on CONTENT_CX so it runs between the two descending lanes at 420 and 780. That leaves 360 units of
clear width, and the longest caption here, 'each side waits for the other', measures about 193, so
it keeps ~83 units clear of each lane. Overrun 360 and the caption sits on an arrowhead.
```

### before `const CHIP_W = 232;`

```
ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
Measured worst cases, in viewBox units:
  blocked by   63 + 'force-detach ~6 min'  119 = 206
  new Pod      44 + 'Multi-Attach error'   113 = 181
  accessModes  69 + 'ReadWriteOnce'         82 = 175
  attached to  69 + 'node-1'                38 = 131
So 232 clears the worst pair with ~26 units between name and value, and matches the width the rest
of the storage family settled on.
```

### before `const NODE_BAND_TURN_Y = (NODE_BOTTOM + BAND_TOP) / 2;             // 199`

```
Every array below feeds BOTH the static pathArrow and the ball that rides it, so a wire and its
packet cannot drift apart. There are five lanes and every one of them carries a ball in some step,
which is why every one of them is drawn with an arrowhead. Traffic is NOT mirrored even though the
boxes are: only the new Pod ever asks for anything, so only column B has a request lane. An arrow
drawn under the old Pod would be an arrowhead pointing at a request that is never made.

That request lane starts at the NODE frame, not at the Pod inside it. The attach and detach
controller acts on nodes: what it is being asked for is an attachment to node-2, and the Pod is
only the reason the ask exists. Starting the lane at the Pod drew the Pod talking to the
controller directly, which is not what happens and read as one box overlapping another.

The controller's two output lanes leave its SIDE WALLS at exactly mid-height (BAND_MID_Y), step
outward, and then drop into the TOP EDGE of their VolumeAttachment at exactly its centre. Every
endpoint on those two lanes is therefore a face midpoint rather than a hand-picked offset, so the
pair cannot drift out of symmetry when the controller or the row is resized. They used to drop
straight out of the controller's underside at x 420 and 780, which read as two lines threaded
through a slab instead of as two outputs of one component.

Below the row, each lane leaves its VolumeAttachment at the bottom face centre, drops straight
down, and turns once into the near side wall of the disk.
The request lane leaves node-2 at its own column centre (710) and steps IN to enter the controller
at the top face centre (600). It used to be a bare vertical at 710, which met the controller 40
units short of its centre and so read as a line stopping on a random point of an edge rather than
as an arrival. Turning on the midline of the corridor makes the endpoint a face midpoint, like
every other endpoint on this card.
```

### before `function podBlock({ x, label, sublabel }) {`

```
PULSE MODEL: a Pod is ONE unit and blinks as one. The shell and its container box both live in
`group`, and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its
targets with querySelectorAll, which matches descendants only and never the element itself, so
pulsing a bare pod() catches the .scheme-pod-rect child but not the group and the pulse silently
fires at half strength (symptom in anim-dump: strokeOpacity rows but no filter row). No .highlight
is ever put on the container box either, so a Pod never keeps a lit outline after its blink decays.
```

### before `const nodeA = node({ x: NODE_A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
node() places its caption in GROUP-LOCAL coordinates (x 12, y 18 inside its own translate).
The old hand-rolled frame in this card appended a caption with an ABSOLUTE x into the
translated group, so the caption was displaced by the translate a second time and node-2 landed
at x=1614, outside the 1200-wide viewBox and clipped away. Use the primitive.
```

### before `[nodeA, nodeB].forEach(n => {`

```
node() drops its caption at local y=18, which on a frame this tall reads as floating inside the
box rather than as titling it. 14 tucks it up against the top edge. Placement only: the
uppercase rendering is catalog-wide styling and is left alone.
```

### before `[nodeA, nodeB, ctrl, vaA, vaB, disk, podOld.group, podNew.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the node frames, then the band, the VA row and the disk, then the Pods
so they sit above their node frame, then the lanes and their captions above the blocks, then
the chip strip, then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { mode = 'ReadWriteOnce', attached, newPod, blocked }) {`

```
Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
card comes to report 'blocked by: force-detach' on the step where the volume is already mounted.
Each name means exactly one thing: 'attached to' is where the disk is right now, never where it is
wanted, and 'blocked by' is the reason the new Pod cannot start, never the Pod state itself.
```

### before `function setStage(s, {`

```
One place that pins every mutable opacity and every mutable sublabel, called from every step with
only the things that step changes. clearHighlights clears classes, not inline styles, so without
this a step entered out of order would inherit the previous step's opacities: the reduced-motion
replay path (prev / reset) walks 0..n and would leave the old Pod faded on step 1.

The new Pod no longer has a dim 'booting' state. It used to sit at 0.55 from the moment it was
scheduled until the very last step and pulse through pulsePodDim, which stacks an opacity swing on
top of the standard blink: the result read as a faster, busier pulse than the same beat elsewhere
in the catalog, even though the timing was the identical 900ms. A Pod that exists is drawn at full
strength and blinks with the ordinary pulsePod. The only opacity a Pod carries on this card now is
GONE, for the old one after it is deleted, which is the one fade the catalog does sanction.
```

### before `function unlightAt(el, ctx, delay = 0) {`

```
Drop a highlight at `delay`, used on blocks that fade out mid-step. A block that is on its way to
0.25 must not still be wearing a lit border when it gets there: the highlight says 'this is the
thing acting right now', and a deleted object is the opposite of that. Pairs with the fade so the
two land together.
```

### before `setChips(s, { attached: 'node-1', newPod: 'not scheduled', blocked: 'nothing' });`

```
node-2 is absent, not empty. An empty frame sitting there from the first frame says the second
node is already part of the picture and merely unused, which is the opposite of the setup: at
this point there is one node, one Pod, one attachment, and no contention at all.
```

### before `narration: 'Now the Pod moves. A rolling update stands the replacement up on Node-2 while the old one is still running, which is exactly what RollingUpdate is designed to do. Node-1 stays healthy throughout. A second Pod now exists on the other Node, and it wants the same volume.',`

```
The OLD Pod deliberately stays at full opacity here and through step 4: the entire problem is
that the old side is still very much alive and still holding the attachment. Fading it early
would say the opposite.
```

### before `setStage(s, { nodeBOp: 1, newOp: 1 });`

```
The request lane stays OFF here. On this step node-2 has only just been given a Pod and has
asked for nothing yet, so an arrow from it into the controller would draw a request one full
step before it is made. It arrives on the next step, together with the ball that rides it,
which is the catalog rule: a lane appears when it first carries traffic.
```

### before `narration: 'The attach and detach controller tries to attach the volume to Node-2, which means writing a second VolumeAttachment.`

```
THE REFUSAL, and the reason this card exists. The idiom (shared with storage-access-modes) is
a ball that travels to the deciding block and STOPS there. Nothing continues past the
controller, va-2 never lights, and no lane is drawn under va-2 at all: the object is wanted,
not wired up. A ball carrying on to va-2 would show the attach succeeding.

Reviewed 2026-07-29 and the picture was corrected to match. va-2 used to fade in AT FULL STRENGTH
as the refused request landed, which says the object was created and then blocked. It is not: the
attach and detach controller checks that a ReadWriteOnce volume is already attached elsewhere and
reports the Multi-Attach error BEFORE writing anything, so through the whole blocked stretch there
is no va-2 in the API at all. It now appears at OPACITY.pending and stays there until the attach
step really writes it, which is the catalog convention for a block that does not exist yet: a
ghost rather than a hole, since a block-sized gap in the column reads as a rendering fault. The
sublabel says `wanted, not written` for the same reason, and the narration no longer stops at
"a second cannot be satisfied", which was true but left the reader to assume an object had been
made.
```

### before `narration: 'What clears it is the old attachment going away, and nothing else will. The controller will not de`

```
Nothing moves on this step, and that is deliberate rather than an oversight: the subject is a
deadlock in which neither side does anything at all. The block flash that the canon allows on
a packet-less step was tried here on va-1 and removed, because a blinking attachment reads as
activity and this is the one step whose whole content is that there is none. The state is
carried by the lit va-1, its sublabel and the blocked-by chip.

This step used to spend its whole beat on the roughly six minute force-detach for an
unreachable node, which is the subject of the detach-on-node-loss card and was told there in
nearly the same words. What actually blocks a HEALTHY rollout is the circular wait below, and
that belongs to this card alone.
```

### before `setChips(s, { attached: 'node-1', newPod: 'Multi-Attach error', blocked: 'old Pod running' });`

```
'old Pod running' rather than 'old Pod still running': the chip strip budget is name + value
+ 24 inside CHIP_W 232, and the longer string measures about 131 units against a 69 unit
name, which leaves 8 units between the two halves and reads as one run-on field.
```

### before `s.refs.ctrl.classList.add('highlight');`

```
The controller self-initiates, with no preceding pulse or hop, so it is lit from step entry
and the first ball leaves after BEAT.lead: a ball must never depart from an unlit block, or
it reads as coming from nowhere. It keeps that highlight to the end of the step, because
unlike va-1 it does not go anywhere.
```

### before `if (ctx.reduced) { s.refs.disk.classList.add('highlight'); return; }`

```
The disk is a RECEIVER on this step, so it must not be lit here. Lighting it above the guard
put its border on from the first frame, and the detach ball then spent its whole flight
travelling towards a block that already looked like it had been reached. Only the reduced
path lights it statically, because that path has no ball to arrive: in the animated path
lightBoxAt below turns it on at det.arrivalMs. Same rule as storage-volumeattachment.
```

### before `s.refs.vaA.style.opacity = '1';`

```
va-1 lights when the delete reaches it, so it too is lit as the detach departs from it in
turn, and gives the highlight up once it has finished fading: a deleted object must not be
left wearing the border that means 'acting right now'.
```

### before `if (ctx.reduced) { s.refs.vaB.classList.add('highlight'); s.refs.disk.classList.add('highlight'); return; }`

```
va-2 and the disk are both RECEIVERS here, in that order, so neither may be lit at step
entry: the write has to reach va-2 before it lights, and the attach has to reach the disk
before it does. Statically lit only on the reduced path, which has no balls to wait for.
```

### before `pulsePod(s.refs.podNew, ctx, att.arrivalMs + BEAT.afterHop);`

```
The kubelet mount is not drawn as a hop: it is the subject of the CSI cards, and a lane from
the centered disk back up into the right-hand column would cut across the VA row and the
controller. What the reader needs here is the consequence, so the Pod blinks one beat after
the attach lands.
```

### before `narration: 'This is why a Deployment on ReadWriteOnce storage stalls whenever the replacement Pod lands on another Node. RollingUpdate creates the new Pod before deleting the old one, so both want one single-node volume and the new one is refused. Set it to Recreate, which deletes the old Pod before making the new one, the way a StatefulSet handles an ordinal.',`

```
The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash
either. The usual argument for flashing something on a packet-less step (so the frame does not
read as frozen) does not apply to the LAST step, which the reader is meant to sit and read.
```

### poster

```
The disk locked inside a closed circuit of waiting. The card's real subject after the rewrite is
not that a node died, it is that nothing is broken at all: the controller will not delete the
attachment while the old Pod runs, and the rollout will not delete that Pod until the new one is
ready, which it cannot be without the disk. That is a CYCLE, and a cycle is a shape, so the
poster draws it literally: a continuous dashed track with the volume sitting inside it, unable
to leave.

Two devices are deliberately REFUSED here. The obvious one, one solid claim against one dashed
one, was drawn first and thrown away: it is the same picture as half the catalog, it says only
'one is denied', and it puts the emphasis on a rejection when the interesting part is that both
claimants are legitimate and alive. So the two blocks on the ring are IDENTICAL, at equal
weight, because neither of them is the problem. The other refusal is a break in the track: an
opening would promise a way out, and the whole point is that there is not one until something
outside the loop (Recreate) cuts it.

The loop is drawn as two ARCS BETWEEN the blocks, not as one continuous track with the blocks
laid over it. That was the first attempt and it failed in a way only a render shows: a rounded
rect passing behind a translucent box still shows its dashes straight through the fill, so the
line read as crossing the block rather than as arriving at it, which looks like a mistake. Arcs
that START and END on the block edges make the two blocks stations ON the cycle, and the circuit
closes through them: block, arc, block, arc, back again. Nothing overlaps anything.

The two chevrons are what turn a pair of arcs into a circuit. Top points right, bottom points
left, which resolves to clockwise and gives the eye a direction to travel and never finish. They
sit at the arc apexes, the two points furthest from everything else on the canvas.

Both arcs RUN TO THE CENTER OF EACH BLOCK, (60, 90) and (260, 90), and the track is masked by the
two block rectangles so the part that lies inside a block is not drawn. That is the whole trick,
and it cannot be done with z-order: the blocks are filled in translucent white over the poster
background, so a dashed line painted underneath one still shows straight through the fill, which
is what read as the arc crossing the block. A mask removes those spans outright.

The visible arc therefore leaves each block through its TOP edge at x=64, four units off the
block center, and the bottom arc leaves through the bottom edge at the same x. So the line meets
the middle of the block and disappears under it, which is what makes the two blocks read as
stations ON the circuit rather than as boxes parked beside it. Geometry: one ellipse, rx 100,
ry 59, centered on (160, 90), so the two apexes land on 31 and 149 and the chevrons sit on them
without moving.

Brightness: the disk carries 0.04, the fill the rest of the storage posters give a cylinder body
(0.03 to 0.04). It sat at 0.14 and read as a different material from every sibling poster in the
grid. Content sits 25..155 in a 180 tall box, symmetric about x=160 and about y=90. No packet
dot: a ball frozen on a wire reads as a paused animation.
```

---

## storage-projected-volume

### before `const POD_X = 330, POD_Y = 56, POD_W = 640, POD_H = 120;  // 330..970, over the projected directory`

```
Projected Volumes. One directory assembled from several sources at once. The layout is TWO
ALIGNED COLUMNS: the four sources on the left, the projected directory with one file row per source
on the right, and EVERY source mid-height equals its file row mid-height, so all four fan-in lanes
are pure horizontal segments. The gesture is a FAN-IN: four parallel lanes converge on the one dir.
The Pod sits over the DIRECTORY column only. It used to be flush over both, which put the source
column under it as though the ConfigMap and the Secret lived inside the Pod, and dragged the whole
drawing into 330..970 (centre 650) with the lower left third of the canvas empty. The sources are
cluster objects, so R5 moved that column out from under the Pod to 230..450 (2026-07-27) and the
content now spans 230..970, centred on the canvas.

The card leads to the serviceAccountToken source, the one that matters. Unlike the old forever
valid Secret-based token, a projected token is short-lived and audience-bound, and kubelet ROTATES
it in place before it expires, rewriting the same file with a fresh token and no restart. The
rotation is the beat the card builds to.

GEOMETRY. The four source lanes run horizontally on shared mid-heights, zero corners. The two Pod
lanes each turn ONCE: the metadata drop leaves the Pod floor 100 left of its centre, steps out to
the source column in the corridor at y=232 and drops into downwardAPI (which sits FIRST in the
column exactly so that drop crosses nothing), and the app read leaves the dir top, steps in at
y=200 and rises into the Pod floor 100 right of its centre. The pair either side of the Pod centre
is the point: a 640 wide face with one lane out at 440 and another at 800 reads as two lanes that
missed, and both were reported as such. 100 is also inside the 18 percent of the face that the rule
treats as still on the midpoint, so the pair is legible as a pair rather than as a tolerance.

Only the Pod pulses (it is the source of downwardAPI metadata and the reader of the token). Sources
and file rows are infrastructure: they light. The narration overlay owns the top-left corner, and on
this card it bottoms out at y=181 (measured over 1600/1280/1100): the Pod at y=56 is the only tier
inside that band and starts at x=330, and the source column below it starts at y=264, well clear.
The metadata corridor at y=232 is what those 181 units pin: it cannot rise. A longer narration
invalidates this.
```

### note (R3 finding on the assemble step, REJECTED 2026-07-29)

```
`check-arrival --rules=r3` reports the projected directory block as lit at step entry while four
balls land inside it at 700ms, and that finding is correct about the facts and wrong about the
defect. The block is not the receiver: it is the CONTAINER the four file rows sit in, and each ROW
lights on its own ball arriving, which is the arrival the reader is meant to see. Dimming the
enclosing frame until the first ball lands would draw a directory that does not exist yet on the
step whose whole subject is four sources feeding one directory that does.

This is the same shape as the single survivor the R3 queue was closed on in 2026-07 (recorded in
scheme/CLAUDE.md under lightBoxAt) and it stays open in the tool on purpose: the rule cannot tell an
enclosure from a destination, and a card-level exception list would hide the real ones. Family E of
the 2.4 review closed at 66 findings fixed and this one rejected. The downward step on this same
card WAS a real finding and was fixed: there downwardAPI is a genuine mid-chain receiver.
```

### before `const W_DOWN = [[SRC_RIGHT, midOf(DOWN_Y)], [ROW_X, midOf(DOWN_Y)]];`

```
Each static wire and its ball share one array. The four source lanes fan into the file rows on
shared mid-heights as single straight segments, and the two Pod lanes turn once each: the Pod drops
its own metadata into downwardAPI, and the app reads a file back out of the dir.
```

### poster

```
The essence, not the layout: four scattered sources converge fan-wise on ONE mount point at
the folder edge, inside it the keys sit as even file lines, and the token thread (bottom
source, its lane, its file line) burns brighter than the rest.
```

---

## storage-pv-lifecycle-phases

### before `const PITCH = 224;`

```
Four phases, not five. k8s.io/api/core/v1 also defines VolumePending ("used for PersistentVolumes
that are not available"), so the API type has five constants, but the upstream Phase docs list only
Available, Bound, Released and Failed, and Pending is not something a PV is observed sitting in on
a modern cluster. The card teaches the documented four and the narration is worded to say the
lifecycle runs through them, never that the status field can hold only these. Do not "complete" the
row with a fifth box.

Reclaim policy defaults are per-origin and the narration says so explicitly: Delete is the default
for dynamically provisioned volumes, Retain for a PV created by hand. An earlier cut called Delete
"the default" flat out, which is only half true.

Layout (viewBox 1200x640). This card is the one genuine state machine in the storage family, so the
middle band is a ROW of the four phases a PV status field can hold, with exactly one lit at a time.
The row is the BOARD, not the object: the phases are places, and the volume is whichever place is
currently lit. That distinction is what lets the card show the Delete outcome honestly, because a
deleted PV does not move to some final phase, it leaves the board and every box goes dark.

Actors that DRIVE transitions sit above the row, and the one actor that drives the single backward
edge sits below it. Each transition is a real event, so it is drawn as a lane that CARRIES a ball
when it fires. There is no Pod anywhere in this card, so nothing pulses: boxes light, and the one
packet-less step is allowed a box flash.

Two rules govern that light:
  1. A box is lit at step entry ONLY if a ball departs from it. Every box a ball arrives at starts
     the step looking ordinary and earns its highlight at the moment of arrival (lightBoxAt at
     pkt.arrivalMs), with no pulse. Once lit, nothing goes dark again until the step boundary, so
     by the end of a transition both of its ends are lit. Pre-lighting a destination is the single
     easiest way to ruin one of these steps: it answers the question before the ball that carries
     the answer has arrived, and the arrival then registers as nothing at all.
  2. Chips light on the step their value CHANGES, which is how the reader sees the phase field flip
     rather than having to remember what it said one step ago.

Deliberately NOT drawn: the backing disk. Every other storage card puts a cylinder on a bottom
shelf, and this one does not, because its subject is the phase field of the API object rather than
the bytes behind it. What happens to the real storage asset under each reclaim policy is the whole
subject of storage-reclaim-policy, which draws the disks properly and in both branches. Adding a
cylinder here would either duplicate that card or, worse, need a spine that the backward edge below
the row would have to cross.

---- Horizontal composition ----
The row is centered on the CANVAS at 600, and every other x is derived from it rather than typed by
hand. One pitch governs the whole card: PITCH 224, which is the phase box width 164 plus the 60px
gap that each forward transition lane lives in. Four phases at that pitch put their centers at
264 / 488 / 712 / 936, so the row spans 182..1018 and its midpoint is exactly 600.

The two top actors reuse that same grid: the claim sits at 488, dead above Bound, which is the
phase it puts the volume into, and the PV controller sits at 712, dead above Released, which is the
only phase it ever acts on. So the controller lane is a straight vertical drop with no dog-leg at
all. Their band spans 400..800, which is centered on 600 as well, so the pair reads as concentric
with the wider row beneath it rather than as two boxes parked somewhere above it.
```

### before `const ACT_Y = 60, ACT_H = 68, ACT_BOTTOM = ACT_Y + ACT_H;      // 60 / 128`

```
---- Vertical rhythm ----
A centered four-phase row cannot dodge the narration overlay horizontally, because staying centered
on 600 is the whole point and its leftmost box lands at x=182, deep inside the overlay column. So
the ROW dodges it vertically, sitting below the overlay entirely.

That is the trade the previous cut of this card got backwards. It kept the row up at y=250 while
letting it stay inside the overlay band, and paid for that horizontally by shoving all four boxes
right to x>=420, which put the row center at 780 against a canvas center of 600 and left a 420px
left margin against a 60px right one. Dropping the row under the overlay buys back the full width
and costs only vertical room, which this card has to spare because it carries no disk shelf.

MEASURED, not assumed. The blanket rule (keep out of x<=380 and y<=300) is a catalog-wide worst
case, so the real overlay was measured for this card's own narrations across viewport widths 1920
down to 900. Its right edge peaks at 399 and its bottom peaks at 201, both at the narrow end. Two
things follow, and the layout below is built on them:

  - The right edge is driven by the VIEWPORT, not by the text: the overlay is HTML at a fixed pixel
    size laid over an SVG that scales, so the narrower the window the more viewBox units it eats.
    399 at 900px is therefore a property of every card in the catalog, not of this one, and it is
    already past the 380 the blanket rule quotes. The house value of x>=400 for top-band content
    really does clear it, but by a single pixel, so nothing here is placed left of 400 above y=201.
  - The bottom IS driven by the text, so the 201 is this card's own number. Lengthening any
    narration invalidates it and the stack has to be re-measured.

So the card splits the difference rather than obeying one rule everywhere. The actors live in the
top band and are held to x>=400 like their equivalents in every sibling card. Everything that has
to reach left of 400, which is the phase row itself (its leftmost box starts at x=182) and the
dog-leg that feeds it, is kept BELOW y=201 instead, where the overlay cannot reach at any width.
Both the bind dog-leg and the backward arc turn in ONE corridor between the actor band and the row,
at TRANSIT_Y. That y is the exact midpoint of the gap it crosses ((128 + 300) / 2 = 214), so the
horizontal run sits centered in its band rather than hugging the row beneath it. It also has to
clear the overlay bottom of 201, because both of those runs reach left to x=264, and 214 does that
by 13px. Those two constraints very nearly collide, which is what sets the height of everything
above: the actor band cannot go lower and the row cannot go higher without pushing the corridor
into the overlay.
```

### before `const W_RECOVER = [[RELEASED_CX, ROW_Y], [RELEASED_CX, TRANSIT_Y], [AVAIL_CX, TRANSIT_Y], [AVAIL_CX, ROW_Y]];`

```
The one backward edge, and it runs OVER the row rather than under it: out of the top center of
Released, back along the corridor, and down into the top center of Available. It used to loop
underneath, which put it in the same band as the admin lane, and the two then arrived at the
underside of the row pointing the same way, so the pair read as one broken fork instead of as two
unrelated events. Above the row it has the corridor to itself.

It leaves from exactly the same x as the controller lane arrives on (RELEASED_CX), which is only
safe because the two are never on stage together: the arc is pinned visible on the recover step
alone, and that step hides the controller. Same story for its descent into Available at x=264,
which the bind dog-leg also uses one step earlier.
```

### before `// Fades an object out of existence when the delete that removes it lands, and takes its lit stroke`

```
There is deliberately no unlightAt here. A box NEVER gives up its highlight part way through a
step. An earlier cut of this card had the source phase go dark the instant the destination lit, on
the theory that a state machine should show exactly one live state, and it read as a bug every
time: the eye is following the ball, so a box dimming behind it looks like something being switched
off rather than like a phase being left. Both ends of a transition therefore stay lit, and it is
the ball and the arrowhead that carry the direction of travel. A phase only goes dark at a step
boundary, when clearHL wipes the board.
```

### before `// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.`

```
No flashBox helper here, unlike its sibling cards. The sanctioned block blink exists so a step with
no packet and no Pod does not read frozen, and this card has no such step: idle is the static
poster, and all six narrated steps carry at least one ball.
```

### before `const lBind = lane(W_BIND);`

```
Everything else appears only on the step that uses it, so the card is never crossed by a lane
belonging to somebody who is not on stage. The backward arc is in this group rather than drawn
permanently because it shares the corridor above the row with the bind dog-leg and shares its
exit x with the controller lane.
```

### before `const verdictLbl = text({ class: 'scheme-label code dim', x: RELEASED_CX, y: WIRE_LBL_Y, 'text-anchor': 'middl`

```
The verdict reports an outcome that moves the volume nowhere, which is exactly the case the row
lanes cannot express: a successful Delete and a Retain that declines to act. No step ever fills
it at the same time as a neighbouring gap label.

It centers on Released, which it can do now that the backward arc runs over the row instead of
under it. While the arc was below, this label had to dodge the point where it dropped out of
the box, which cost it half its usable width.
```

### before `const recoverLbl = text({ class: 'scheme-label code dim', x: (AVAIL_CX + RELEASED_CX) / 2, y: RECOVER_LBL_Y, '`

```
The backward edge gets its own name, centered under its own horizontal run rather than borrowed
from a forward gap. Parking it in the Available-to-Bound gap, which is what the first cut did,
put the caption for a right-to-left event on the one lane that runs left to right.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step value at call time and steps are always entered in order, so the diff is
deterministic. Catalog-wide chip pattern.
```

### before `s.refs.stAvail.classList.remove('highlight');`

```
Only the claim is lit from the start, because only the claim sends a ball. The two phases are
both destinations here and each waits for its own arrival: Available for the claimRef write
landing on it, Bound for the phase flip that follows.
```

### before `setStage(s, { pvc: 0, ctrl: 0, admin: 0, bindLane: 0, reclaimLane: 0, adminLane: 0, recoverLane: 0 });`

```
The claim is deleted on this step, so it ends at zero rather than as a ghost. It used to settle
at a dim 0.45 and stay on the canvas for the rest of the card, where it read as an object
that was still somehow around and pulled the eye away from the row.
```

### before `s.refs.stReleased.classList.add('highlight');`

```
Released stays lit for the whole step: it is the phase the volume is in when the call runs,
and it is where the ball is heading. An earlier cut had it go dark on arrival to say "the
object left the machine", but a box dimming under an incoming ball reads as the ball breaking
something. The disappearance is carried by the three chips and the verdict line instead, all
of which say the object is gone, and none of which can be mistaken for a lighting bug.
```

### poster

```
Abstract, not the literal diagram: four phase cells in a row with one lit, an event dot arriving
at it, and a dashed back-arc for the manual return. A state machine distilled to a lit node.
Abstract, not the literal diagram: the machine drawn as a RING that does not close by itself.
Available, Bound and Released sit on the cycle. The two forward edges are solid because the
control plane walks them unasked, and the closing edge back up to Available is dashed because
that is the one hop nothing performs on its own.

Failed is deliberately NOT here, though it is a real phase and the card teaches it. It only ever
fitted as a faint satellite hung outside the ring, and that cost more than it paid: it was the
one thing keeping the composition off-centre, since a dim shape on one side pads the bounding box
without carrying any visual weight, so the geometry read as centred while the picture read as
shifted. Dropping it makes the ring symmetric about x=160 by construction, and lets it grow into
the freed space instead of floating in an empty canvas. The poster is a hook, not an index, and
the dialog covers Failed properly.

The point of the ring is that the eye completes it and the drawing does not, so the dashed
quarter reads as a gap in a circle rather than as one more arrow. The previous poster was the
diagram in miniature, four cells in a row with a back-arc, which said state machine but not what
is interesting about this one.

TWO dots, and the difference between them is the whole idea. The filled one rides the first solid
edge, a hop the control plane is making right now. The hollow one sits on the dashed edge, a hop
that is possible and is not happening, because nothing takes it without a person. Reading them as
a pair says more than either says alone, which is why the second one earns its place on a poster
this small. The dashed edge is drawn as TWO arc segments with a gap where that hollow dot sits:
run as one path it passes straight through the dot and renders it as a struck-out circle, and
sitting the dot in a break reads better anyway, since the break is the point.

The nodes are drawn as concentric cells rather than plain circles: at poster scale three empty
outlines went thin and washed out, and a core gives each one weight without adding a shape the
reader has to decode. Available carries the heavier stroke and the brighter fill because it is
where the volume is at rest.

Geometry: ring centered on (160, 99) with R=62 and r=18 nodes, and the three node angles at -90,
30 and 150 make it symmetric about x=160 by construction. The 99 is not a typo for 90: the top
node sticks a full node radius above the ring while the bottom of the ring is bare arc, so the
circle has to sit low for the drawn bounding box to land on the canvas center. It measures out at
87.3px of margin on both sides and a vertical center of 89.9 against 90.
```

---

## storage-pvc-binding

### before `const CX = 600;                                     // canvas + identity-spine center`

```
STORAGE card. Layout is a CENTERED vertical spine (viewBox 1200x640). The identity column
Pod -> PVC -> PV-x73a shares one line down the canvas center (CX=600), because binding is what
fuses those three into one chain. The spine is a SINGLE dead-center lane, the mount ascent, drawn
with arrowheads (the volume rising PV -> PVC -> Pod). It is the only vertical the tops of the Pod
and the center cylinder touch: the headless relationship lines were dropped so the center reads
as one clean arrowed axis rather than a crowded pair.

The disk shelf holds three PVs spread SYMMETRICALLY around the spine. The binding controller sits
at the right, its vertical center aligned with the PVC so the watch and the bind write are
STRAIGHT horizontal hops, no zigzag. Crucially the controller scans the shelf FROM BELOW: the
probe EXITS the controller from its right side (centered), wraps down its outer edge (clear of
PV-b22), runs a bus under the whole shelf, and rises into each cylinder BOTTOM with a generous gap
before the turn. That keeps every probe off the cylinder tops. The second claim of the exclusive
step sits above the controller, denied by a short straight hop up. Cylinders are the PVs: they
light, they never pulse. Only the Pod pulses. The narration overlay owns the top-left band
and every block clears it.
```

### before `const W_PVC_TO_CTRL = [[PVC_RIGHT, PVC_MID - LANE], [CTRL_LEFT, PVC_MID - LANE]];   // watch, straight`

```
Each static wire and its moving ball share the exact same array, so they cannot drift. Every
endpoint sits on a block edge, so a ball never travels underneath a box. The watch and the bind
write are single straight horizontal hops off the PVC. The scan EXITS the controller's right side
(centered), turns down its outer edge, turns left along the bus, then rises into each cylinder.
```

### before `function diskBlock(cx, w, label, spec) {`

```
A disk is a cylinder plus its spec line, wrapped in a g so dimming a rejected volume fades the
spec WITH it (the name already rides inside the cylinder). The cylinder is returned separately
because .highlight must sit on the .scheme-cylinder element itself, not on the wrapper.
```

### before `const pvA = diskBlock(SMALL_CX, 200, 'PV-a01', '2Gi, RWO, local-ssd');`

```
Each disk states all THREE things the claim is matched on (capacity, access mode, class), so a
viewer can verify the verdict the match step narrates instead of taking it on trust. Access
mode is identical on all three on purpose: the two rejections must turn on size and class only.
```

### before `[ctrl, pvc, pvcB, appPod.group, pvSmall, pvMatch, pvSlow].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the blocks, then the wires and their labels ABOVE them (so a
connector that crosses a block stays visible and the text stays legible), then the static
disk specs, then the chip strip, then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
Every enter() calls this, so no chip can ever keep a stale value from the previous step. A chip
whose value CHANGED this step also lights (static highlight, never a flash): valueText still holds
the previous step's text at call time (clearHL clears the highlight class, not the text), and steps
are always entered in order (gotoStep rebuilds then replays 0..target), so the diff is deterministic.
```

### before `function clearHL(s) {`

```
appBox is listed so its .highlight is cleared every step: without it a highlight set during a
reduced replay would leak forward, since replay never runs the motion path that would re-clear it.
The disk opacities and the two late-appearing elements are reset here for the same reason.
```

### before `narration: 'A PersistentVolumeClaim is a request, not storage. It states only what the workload needs: at leas`

```
Deliberately motionless, and it must STAY that way. The claim is a statement of need, nothing
acts in this step: the Pod does not pulse (it is the subject being blocked, not an actor) and
the PVC takes a static .highlight only. A block flash would be canon-legal here (packet-less
and pod-less) but was tried and rejected: it reads as the PVC doing something when it is not.
```

### before `const toSmall = routePacket(s, ctx, W_SCAN_SMALL, { role: 'storage' });`

```
All three probes leave the controller TOGETHER: the scan is one sweep of the shelf, not a
queue, and the simultaneous fan-out is the whole read of this step. They land at their own
pace (1222 / 1933 / 2600 ms for slow / match / small) because routeDur normalizes speed and
the routes are very different lengths. Do not stagger them to make the verdicts resolve in
narration order: that was tried and it turns one sweep into three separate errands.
```

### note (anchor dropped: `s.refs.appPod.style.opacity = '0.5';` is not unique in the file)

```
The Pod stays dim until the volume actually reaches it, so the motion path re-dims it and
the animation carries it back to the 1 pinned above. Without the re-dim the pod would sit
at full opacity and then snap BACK to 0.5 the instant the animation became active.
```

### poster

```
Abstract, not the literal diagram. The whole point of binding is that it is TWO-WAY and it is
EXCLUSIVE, so both are drawn: the claim document and the one disk that fits are joined by a pair
of opposed lanes (volumeName going down, claimRef coming back up), and a dashed capsule closes
around just those two, sealing them off as a pair. The two disks that lost sit outside the
capsule, dim and unconnected. The two rejected disks are deliberately IDENTICAL in size: making
them differ read as an accidental mismatch rather than as meaningful, and the eye should be
spending its attention on the pair inside the capsule. All three disks share one baseline
(y=146) and near-identical tops, so the center one stands out by width and fill, not by height.
```

---

## storage-pvc-clone

### before `const CX = 600;`

```
Cloning a PVC. A new PVC whose dataSource points at an EXISTING PVC, not a snapshot. The storage
system makes an exact duplicate server-side and there is no snapshot object in between, which is the
whole contrast with the snapshot card.

---- What the docs actually say (kubernetes.io, CSI Volume Cloning) ----
Three of these were wrong or missing on an earlier pass, and two of them were the opposite of what
the page says, so they are quoted here rather than paraphrased:
  "Cloning is supported with a different Storage Class. Destination volume can be the same or a
   different storage class as the source."     <- the card used to require the SAME StorageClass
  "The source PVC must be bound and available (not in use)."
                                               <- the card used to promise the source stays online
  "Cloning can only be performed between two volumes that use the same VolumeMode setting"
                                               <- was missing entirely
  "You can only clone a PVC when it exists in the same namespace as the destination PVC"
  "the value you specify must be the same or larger than the capacity of the source volume"
  "the back end device creates an exact duplicate of the specified Volume"
  "the source is not linked in any way to the newly created clone, it may also be modified or
   deleted without affecting the newly created clone"
CreateVolume is a call into the DRIVER that produces a volume, so its ball lands on the new disk in
the backend. It used to land on the clone CLAIM, which is neither where the call goes nor what it
creates.

---- Horizontal composition ----
The card is a mirror: source on the left, clone on the right, reflected about the canvas centre.
CLAIM_CX = [CX - SPREAD, CX + SPREAD] with CX = 600, and the disks hang on the same two centre
lines, so the reflection holds on every tier. The provisioner sits alone on the centre line above
them because it is the one thing that belongs to neither side, and the backend frame below holds
both disks because the copy never leaves the storage system: that frame IS the word server-side.

---- Vertical composition ----
Every horizontal run of every zigzag sits at the midpoint of what it crosses, and the backend frame
insets are equal, so the column is symmetric and nothing is pinned to a free gap. It is deliberately
the same rhythm as storage-volume-snapshot from the frame down, since the two cards sit in one row:
  36    canvas top margin
  36    External-provisioner   68 tall, to 104
  170   request corridor       66 below the provisioner, 66 above the claim row
  236   claim row              68 tall, to 304
  320   the constraint list    four lines, 20 apart, on the centre line, to 380
  396   storage backend frame  174 tall, to 570
  438   disks                  90 tall, to 528, frame insets 42 above and below
  552   disk captions          18 above the frame floor
  588   chip strip             34 tall, to 622
  18    canvas bottom margin

---- Narration overlay ----
Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
  1920x900  right 102  bottom 183
  1600x1000 right 291  bottom 160
  1280x900  right 378  bottom 173
  1100x900  right 397  bottom 173
  1280x860  right 397  bottom 230   <- added 2026-07-27
  1100x800  right 397  bottom 230   <- added 2026-07-27
The first four rows are all 900 or 1000 tall, and that is what made the old worst case (y <= 183)
too kind by 47 units: a SHORTER window gives the dialog less height, the diagram scales down with it
and the panel, which is HTML at a fixed size, eats more viewBox units. The rule that judges occlusion
samples 1600x1000, 1280x860 and 1100x800, so the number this layout is built against is 230.

At 196 the claim row was inside that band and the source claim (180..460) was 38 percent behind the
panel. The row now starts at 236, clear of 230 outright, and everything under it moved down by 40 to
follow: the constraint lines lost 2 units of leading (22 to 20) to pay for part of it, and the chip
strip took the rest out of the bottom margin. The provisioner still sits inside the band and still
clears it on x, at 420..780. The request corridor at y=170 is inside the band too, but it only ever
runs between x=600 and x=880, far right of any panel. A longer narration invalidates all of this.

PULSE MODEL: nothing pulses and nothing blinks. There is no Pod on this card, and every block is
infrastructure that lights via .highlight, on packet arrival where there is a packet and at step
entry where there is not. The constraints step and the contrast step carry no packet, and the canon
would allow them the one sanctioned block blink so they do not read as frozen: they deliberately do
not take it. Both state a fact rather than move something, and a brightness blink on a block that is
only being pointed at reads as traffic that never arrives. Do not add it back.

WIRES: the card has ZERO crossings, and every lane meets its blocks on a face midpoint: the request
leaves the clone claim through the middle of its top face and arrives dead centre under the
provisioner, and the call leaves the provisioner through the midpoint of its right face and enters
the new volume through the midpoint of its right side, on the same line the duplicate arrives on
from the left. The two meet the disk from opposite sides, which is what keeps them apart.

The call takes the long way round, out to x=1060 and down the outside, and that is not decoration.
The dataSource link runs straight across the gap between the two claims at their mid height, so ANY
descent from the provisioner through that gap crosses it, and the gap is the only opening in the
claim row. Hiding the link for one step would make it blink out and back. Going around the outside
is what keeps both a permanent dataSource line and a crossing-free card, and it reads correctly on
its own terms: every lane on this card lives in the right half, because the clone side is where all
the work happens and the source side is only ever read.

Both identity links are dashed and carry no arrowhead, because a solid line between two objects
reads as a route that never runs: each claim to its own volume, and the dataSource between the
claims. The clone identity link is held back until the claim actually binds.
```

### before `const DISK_W = 200, DISK_H = 90;`

```
The disks sit DEAD CENTRE in the backend frame: one inset used both above and below, so the frame is
sized from its contents. The top band carries the frame label (node() puts its label baseline 18
below the frame top) and the bottom band carries the disk captions, and the two come out equal.
```

### before `const REQ_CORRIDOR_Y = (PROV_BOTTOM + CLAIM_TOP) / 2;                   // 170`

```
The horizontal run of a zigzag belongs at the MIDPOINT OF WHAT IT CROSSES, not in whatever gap
happens to be free:
  REQ_CORRIDOR_Y   provisioner bottom 104 to claim row top 196, so the request rises 46 and 46.
The call has no corridor of its own: it drops the outer column straight to the disk mid height and
turns in through the SIDE face of the cap, so its only horizontal runs are the two short ones at the
faces it leaves and enters. It used to turn in over the cap and drop onto the top instead, which put
two arrowheads on one disk pointing from the same direction as the copy.
```

### opacity phases (was `const PLACEHOLDER = 0.4`, now OPACITY.pending)

```
PLACEHOLDER is the dim an object is drawn at while it does not exist yet. Hiding it outright leaves
a block-sized hole in a mirrored row and a half empty frame, which reads as a rendering fault rather
than as an absence, so both halves of the mirror are always drawn and the absent one is dim.
```

### before `const prov = box({ x: PROV_X, y: PROV_Y, w: PROV_W, h: PROV_H, label: 'External-provisioner', sublabel: 'drive`

```
External-provisioner, capitalised like every other CSI sidecar block in the family
(External-attacher, External-snapshotter, External-resizer): a hyphenated name capitalises its
first segment only. The narration keeps it lowercase mid-sentence, as those cards do.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'dataSource' + 'kind: PVC' at 19
characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 19 * 6.89 + 24 of
padding is 155 against the 232 available.
```

### before `[frame, prov, srcPvc, clonePvc, srcDisk, cloneDisk].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the backend frame, then the blocks and disks, then the relationship
links and lanes and their captions above them, then the chip strip, then the packet layer so
every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setStage(s, { clone = OPACITY.pending, cloneDisk = OPACITY.pending, bound = 0, ds = 0, lanes = [] } = {}) {`

```
Pins the visibility of EVERY element born mid-story, and of every lane, exactly as setChips pins
every chip. A lane into an object that does not exist points at nothing, so lanes are pinned to 0
rather than left at whatever the previous step happened to set. The clone claim and the clone disk
default to PLACEHOLDER, not to 0: they are one half of a mirrored pair each, and cutting one half
out leaves a hole rather than an absence.
```

### before `duration: 5900,`

```
Three chained hops: the claim picked up, the CreateVolume call out and down into the backend, and
the duplicate made on the shelf once the target exists. anim-dump puts the span at 5338 after the
call was rerouted around the outside. Routes are length-based, so re-measure after ANY geometry
change here rather than trusting this number.
```

### poster

```
Two claims, two equal volumes, and one duplicate made INSIDE the storage system: the dashed
enclosure around the pair is the word server-side, which is the whole claim of the card, and the
line between the volumes runs straight from one to the other because there is no object in the
middle. That is also what tells this poster apart from storage-volume-snapshot beside it in the
row: a snapshot is a thin slice lifted off ONE volume, drawn vertically, while a clone is a full
equal twin drawn beside its source. The clone carries the brightest fill because it is the thing
the card is about, and both claim links are dashed like the card, since a solid line between two
objects reads as a route that never runs.
Mirror-symmetric about x=160: content 24..296 and 20..160, so 24 of margin a side and 20 top and
bottom, with the volumes centred in the enclosure at 14 above and below.
```

---

## storage-pvc-protection

### before `const CX = 600;                                                // canvas + identity-spine center`

```
---- What this card has to get RIGHT, because the obvious version of it is wrong ----

1. The finalizer is put on the claim WHEN THE CLAIM IS CREATED, not when a Pod picks it up. The
   pvc-protection controller adds kubernetes.io/pvc-protection to every PVC whose deletionTimestamp
   is nil and that does not carry it yet, use or no use. What being in use changes is the REMOVAL:
   the controller refuses to take the finalizer off while a Pod still consumes the claim. An earlier
   cut of this card said the finalizer appeared "the moment a Pod started using it", which invents
   a trigger that does not exist and makes the protection sound reactive when it is standing.

2. status.phase NEVER becomes Terminating. A PVC phase is Pending, Bound or Lost, and there is no
   Terminating among them. What prints Terminating is kubectl: its printer swaps the phase out for
   the literal string Terminating whenever deletionTimestamp is non-nil. So the object under a
   stuck delete is still phase Bound, and the word the user is staring at in the STATUS column is a
   display convention rather than a field. That gap IS the card: the reason a stuck PVC is
   confusing is that its status looks like a state it is not actually in. The claim keeps the
   sublabel 'phase Bound' the whole way through and a chip reports what kubectl shows next to it.

3. What finally removes the object is the API SERVER, not the garbage collector. The GC is the
   thing that walks ownerReferences to delete dependents. A finalizer is settled in the API server
   itself: with a deletionTimestamp set and the finalizers list empty, the delete that was
   outstanding completes and the record leaves etcd.

---- Layout (viewBox 1200x640) ----
Storage grammar, the centered vertical stack: the consumer Pod on top, the claim under it, the
backing disk on the shelf below, all three on ONE axis at the canvas center CX=600, so the identity
chain reads as a single column rather than as three boxes that happen to be near each other. The
spine is drawn as the mount ASCENT (disk -> claim -> Pod, upward), the same single arrowed axis
storage-pvc-binding settled on, and balls really travel it, so the arrowheads are earned. Nothing
here is a headless relationship line.

The two actors that drive the delete sit ONE ON EACH SIDE of the spine, sharing a footprint, and
they are placed so that every lane they send is a straight run or a single right angle. There is no
dog-leg anywhere in this card and no lane turns twice.

The vertical rhythm is one pitch, TIER=162, and it does double duty:
  - the claim sits at 270 and the controller at 432, one tier below it.
  - kubectl is level with the claim it deletes (its own centre is 270), so kubectl -> PVC is a
    STRAIGHT horizontal into the claim's right face, and deleting the Pod climbs its own column
    first and turns once into the Pod's right face at the Pod centre, 108.
  - the two lanes that reach the claim, the delete coming in from kubectl on the right and the
    finalizer patch coming up from the controller on the left, land dead centre on opposite faces.
The two forces of the card, the request to delete and the release that finally allows it, arrive
from opposite sides. That is the composition saying what the narration says.

Both actors used to be stacked in ONE right-hand column, kubectl at the Pod tier and the controller
below the claim (R5 moved them, 2026-07-27). That put every block on the card in the band 480..1070,
centre 775, with the whole left half below the panel empty. kubectl cannot move left: it sits in the
overlay's y band. The controller can, because its tier (396..468) is well below the panel floor of
230, so it takes the left column at 130..350 and the content spans 130..1070, centre 600. Dropping
kubectl to the claim tier is what pays for it twice over: it also turns the delete-PVC lane into a
straight horizontal and leaves the Pod lane as the only turning one.

The verdict caption beside the claim moved with the controller lane. It is anchored end at x=464 and
runs back to about x=306 on its longest string, and it now sits BELOW the claim (y=324) rather than
level with it, because the controller's lane now occupies the claim's mid height on that side.

Its y is a MEASUREMENT, not the blanket rule. This card's overlay was measured across viewport
widths 1920 down to 900: its right edge peaks at 399 and its bottom at 230 on the 1100x800 sample
the occlusion rule uses (an earlier note here said 201, from a taller sample). The caption at 324
and the controller at 396 clear that by 94 and 166. LENGTHENING ANY NARRATION INVALIDATES THIS:
re-measure before doing it, or move the caption back to the right of the axis.
```

### before `const MOUNT_LBL_X = CX + 16, MOUNT_LBL_Y = 204;`

```
The two captions take one side of the axis each, so neither can be mistaken for the other's lane.
The mount caption names the lane it sits beside. The VERDICT caption reports the state of the
CLAIM, not of any lane, so it sits hard against the claim at its own midline instead: parked beside
the lower lane, as an earlier cut had it, it read as that lane's name, which it never was.
```

### before `const W_DEL_PVC = [[ACT_R_X, PVC_MID], [PVC_RIGHT, PVC_MID]];`

```
The pair into the claim, one from each side, and BOTH land dead center on their face, at PVC_MID
exactly, rather than on lanes offset either side of it. Splitting them by a lane gap is the usual
way to keep two routes from overlapping, and it is wrong here: the two are never on stage together
(kubectl appears only on the delete step, the controller only on the release step), so the gap
bought nothing and cost the thing that matters, which is that an arrow arriving off center reads as
aimed at a corner of the block instead of at the block. While both actors were in the right column
these were mirrors around the claim's midline on ONE face; now they are mirrors across the claim.
```

### before `// The tag that rides a ball on this card. Constants preserved from its hand-rolled copy.`

```
There is deliberately NO flashBox in this card. The sanctioned block blink exists so that a step
with no packet and no Pod does not read frozen, and no step here is in that position: every
narrated step carries a ball, a Pod pulse or a fade. An earlier cut brightened the claim on the
finalizer-holds step, which put a blink on infrastructure for no reason. That step now carries the
mount ball instead, which is both real traffic and the actual point being made: the claim is still
mounted, which is exactly why it cannot go.
```

### before `const kubectl = box({ x: ACT_R_X, y: KUBECTL_Y, w: ACT_W, h: ACT_H, label: 'kubectl delete', sublabel: 'issues t`

```
Block labels lead with the capitalized object TYPE, matching the sibling cards (PV controller,
PVC default/data in storage-pv-lifecycle-phases). The lowercase pvc-protection that appears in
the finalizers chip and in the narration is a different thing: that is the literal finalizer
string kubernetes.io/pvc-protection, so it stays exactly as the API spells it.
```

### before `kubectl.style.opacity = '0';`

```
Both actors appear only on the steps they act on, so the card is never crossed by a lane
belonging to somebody who is not on stage, and the six-block frame reads as the centered stack
plus one visitor rather than as a permanent crowd.
```

### before `const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start'`

```
Lane captions, blank at build and filled per step by setWire. The lower one is a VERDICT slot:
it reports whatever the claim currently is, which changes kind across the card (a binding, then
a block on removal, then a removal), so it is named for its job rather than for one lane.
```

### before `const CHIP_GAP = 24, CHIP_WS = [312, 232, 244, 220];`

```
A four-chip strip over the card's own width, derived rather than hand-placed, so the readout is
concentric with the stack above it. deletionTimestamp and the kubectl column sit next to each other
on purpose: the second is a display of the first, and seeing them light together is the lesson.

The four are NOT one width, and that is the fix for the last chip collision in the catalog. The
first carries both the longest name on the card and its longest value (deletionTimestamp against
'gone with object'); at the shared 252 those two strings met with one unit to spare, which is a
collision on any re-measure or font change. It takes 312 and the other three give it back.
```

### before `[pvc, kubectl, ctrl, disk].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the blocks and the disk, then every lane above them, then the lane
captions, then the Pod so it sits above the axis that ends on its edge, then the disk spec,
then the chip strip, then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step value at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `s.refs.app.classList.remove('highlight');`

```
The claim is the source here: the mount it still serves is what the step is about, so the
write rides up the same axis it did before the delete. No block flash is needed or wanted,
the traffic itself is the proof that nothing has changed.
```

### before `pulsePod(s.refs.web, ctx, del.arrivalMs);`

```
Down-arrow order, and the Pod is the one thing on stage allowed to pulse: the ball lands, the
Pod BLINKS to acknowledge the delete, and only once that blink has landed does it start to go.
Fading straight from arrival, as an earlier cut did, skipped the acknowledgement entirely and
the Pod just dimmed under an arriving ball, which reads as the ball erasing it rather than as
the Pod receiving a delete and then terminating.
```

### poster

```
Abstract, not the literal diagram: the claim is MARKED for deletion (dashed outline) and yet
still whole (its content rows are intact on both sides), because a closed padlock sits dead
center on it. The lock is the finalizer, and the live mount dropping in from the consumer above
is why it stays shut. Consumer on top, claim in the middle, disk below, so the poster carries the
same centered vertical stack as the card.

Two things it deliberately does NOT draw. No X across the object: an X reads as deleted, which is
the exact opposite of the card, where the delete is the thing that has NOT happened. And no
side clamps, an earlier cut of this, which read as two brackets parked near the object rather
than as anything holding it. The object is locked in place, not struck out and not squeezed.
Vertical rhythm: BOTH gaps are 18, and the disk's gap is measured from the top of its ELLIPSE
(cy - ry = 131), not from cy. Measuring to cy is what made the lower gap look bigger than the
upper one in an earlier cut: the numbers read 16 and 19 while the two connectors were drawn the
same length, because the ellipse bulges ry=6 up past the point the connector stopped at. The
stack therefore runs 15..164 (24 + 18 + 56 + 18 + 33), which is 149 tall and centered in the 180
canvas with 15 and 16 of margin. Move any tier and the two 18s have to be re-derived.
```

---

## storage-pvc-retention-policy

### before `const CX = 600;`

```
StatefulSet PVC Retention. persistentVolumeClaimRetentionPolicy has two independent knobs,
whenScaled and whenDeleted, each Retain or Delete. Retain leaves the claim and its disk in place,
which is safe but silently leaks storage. Delete reclaims both, at the cost of the data.

---- Layout: the SAME grammar as its sibling storage-volumeclaimtemplates ----
Three ordinal ROWS, one per replica, each a straight triad centred on the canvas spine x=CX

       Pod web-N   ->   PVC data-web-N   ->   pv-web-N
       (consumer)         (the claim)         (the disk)

with the Pod flanking the claim on the left and its disk on the right, mirrored about the spine.
Every connector is a dashed, arrow-headed lane exactly like the sibling, and every one carries a
ball on some step (a relationship with no ball would read as traffic that never runs). The sibling
flows CREATION down the spine and up into the Pods, this card flows the policy the other way:
  - policy step: the one policy reaches every claim, a governance ball cascades DOWN the spine and
    each claim lights as it lands (the spine is hidden except on this step, as in the sibling).
  - a Delete: a reclaim ball sweeps straight across the row Pod -> PVC -> PV, and the claim, then the
    disk, fade AS THE BALL REACHES THEM, taking the lanes in its wake. One clear ball-driven fade.
  - a Retain: only the Pod fades. The claim and disk stay, shown by opacity plus their labels.
Nothing is ever highlighted before a ball reaches it, and nothing fades without a ball or a Pod
removal behind it.

---- Narration overlay ----
The overlay covers only the top-left band (measured bottom ~173, right ~397 worst case). The policy
box spans x 430..770, clear of the x<=397 band, and the first Pod row starts at y=195, below the
overlay. A much longer narration than the ones below would invalidate this.

PULSE MODEL: only Pods pulse, and only as they are removed. A Pod about to be scaled or deleted
away pulses once, then fades. The claims and disks are infrastructure which lights via .highlight
on ball arrival and never pulses.
```

### before `function podBlock({ cy, label }) {`

```
A full Pod window like the rest of the storage cards: the ordinal name on top, a real container box
on the Pod centre line, and the mount path as the Pod sublabel at the bottom. The wrapping g keeps
the shape uniform with the family even though no Pod on this card ever pulses.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'disks' + '3 kept, 1 leaks' at 20
characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 20 * 6.89 + 24 of
padding is 162 against the 232 available.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setStage(s, { pods = [1, 1, 1], claims = [1, 1, 1], disks = [1, 1, 1], govern = false } = {}) {`

```
Pins the visibility of EVERY element that is removed mid-story, exactly as setChips pins every chip.
Lane opacities are DERIVED from the block they point AT (the ownership lane and the spine from the
claim, the reclaim lane from the disk), so a reclaimed claim or disk takes its own lanes with it and
no arrow is ever left pointing at a ghost. The spine only shows on the governance step.
```

### before `function reclaimRow(s, ctx, i, { delay = 0, tag = null } = {}) {`

```
One ordinal reclaimed: a ball sweeps straight across the row Pod -> PVC -> PV. Each block LIGHTS as
the ball lands on it, holds a beat, then fades (with its lane) as the ball moves on: the claim goes
first because the PVC is deleted first, the disk follows when the reclaim reaches it. Every light
and every fade is tied to the ball, nothing fades on its own. The spine is not touched here (it
only exists on the policy step, so animating it would wrongly flash a segment into view).
```

### poster

```
One policy, two knobs, forking to two fates. A dashed fork drops from the policy box (its two knob
cells one solid, one hollow) to two disks: left stands whole and bright (Retain kept it), right is
dashed and faded (Delete reclaimed it). Echoes the volumeClaimTemplates sibling's top-box + fork
grammar, but diverges to two outcomes instead of stamping three copies.
```

### before `const dark = () => el.classList.remove('highlight');`

```
The ball lights each claim and each disk as it lands (lightBoxAt), then vanishAt fades the block
away behind it. The class was never taken back, so a reclaimed block ended its step lit at the
terminated shade: the thing the step points at and the thing that no longer exists, at once. The
static path never reproduced it, because it pins the shade and lights nothing, which is how this
surfaced as eight reduced-motion findings rather than as a drawing complaint.

Dropping the class when the fade finishes settles both paths at once, and matches what
check-opacity LIT enforces everywhere the shade is pinned rather than animated.
```

---

## storage-reclaim-policy

### before `const PVC_Y = 30, PVC_H = 68, PVC_BOTTOM = PVC_Y + PVC_H;      // 98`

```
Layout (viewBox 1200x640). This card is a side-by-side comparison, so the storage stack is drawn
TWICE: a Delete column on the left and a Retain column on the right, each a claim on top, its bound
volume under it, and the real disk on the shelf at the bottom. Between the volumes and the disks
runs ONE full-width band, the PV controller and CSI driver, because both columns are reclaimed by
the same controller reading the same field: the band is where the two stories split. Every reclaim
is therefore a DESCENT through it, exactly as in storage-access-modes: PV -> controller (the policy
is read), then controller -> disk (the disk is wiped). Retain is the branch where the second hop
never happens, and that absence is the whole point, so the first hop is still drawn and still lands
on the band. There is no Pod anywhere in this card, so nothing pulses: boxes, the band and the
cylinders light, and the one packet-less step is allowed a box flash.

Two rules govern that light, and both exist because a lit stroke is a claim about the object:
  1. Only the SOURCE of a ball is lit at step entry. Every destination earns its light on arrival
     (lightBoxAt at pkt.arrivalMs), so the card never announces an outcome before the act.
  2. A block that is not at full opacity never carries one. Faded means gone or refused, and a
     dimmed block still glowing reads as deleted-but-somehow-live. removeAt enforces this for the
     mid-flight case by dropping the class as the fade lands.
The narration overlay owns the top-left corner, so every block starts at x>=400.

---- Vertical rhythm ----
Four tiers with three equal 54px gaps, so no hop is a blink and no tier reads as belonging to its
neighbour. The whole stack is pulled UP rather than centered vertically, because FIVE text rows
queue up under the disk shelf: the cylinder name, the spec line, the verdict line and two rows of
chips. Sitting the shelf lower crushes those five into each other, which is what the first cut of
this layout did. Everything above the shelf is spaced backwards from it.
```

### before `const LEFT_X = 400, STACK_W = 400;                             // 400..800, so the center is 600`

```
---- Horizontal composition ----
The stack is centered on the CANVAS, at 600, not merely placed somewhere to the right of the
narration overlay. That costs width and the cost is not negotiable: the overlay permanently owns
the top left, the top two tiers sit inside its vertical band, so the leftmost
the columns may start is 400. Centering on 600 with a left edge of 400 pins the stack to exactly
400 wide. Everything horizontal is derived from those two numbers, so the two columns split what
is left rather than each carrying a hand-typed x.

Do not "fix" the narrowness by sliding LEFT_X left after measuring the overlay on your own screen.
The overlay is HTML laid over the SVG, so the NARROWER the window, the MORE viewBox units it eats:
measured right edge is 185 at 1920 wide but 379 at 1100 and below. LEFT_X 400 is that worst case
plus a hair, not a pessimistic guess.
```

### before `const ADMIN_W = 160, ADMIN_H = 68, ADMIN_X = 850, ADMIN_Y = PVC_Y;`

```
The human sits in the right margin and is the one element that breaks the symmetry, which it has
to: the left margin is the narration overlay and nothing may be parked there, so an actor that is
not part of either stack has only one place to go. It is kept close to the Retain column rather
than pushed to the canvas edge, and it appears on exactly one step, so the composition reads as
centered on the six steps where it is absent and as centered-plus-a-visitor on the one where it is.
```

### before `const SPEC_GAP = 14;`

```
cylinder() puts its own name on the baseline h/2+5, and this spec line goes 14 BELOW that. It used
to be a flat DISK_Y+66, which left 11px between two baselines whose text is 11px tall: the two
lines visually touched. Same fix, same number, as storage-access-modes.
```

### before `const VERDICT_Y = DISK_Y + DISK_H + 28;                        // 518`

```
The verdict line clears the bottom of the cylinder by a full row rather than the 16px it used to,
and the chip strip clears the verdict by another one. Both are derived so raising the shelf again
carries them with it.
```

### before `const CHIP_W = COL_W;                        // each chip is exactly as wide as the column above it`

```
The readout is a 2x2 GRID, not a row of four: each column of the diagram gets its own pair of
chips stacked directly under it, at exactly the column x and exactly the column width. One row per
kind of object (the volumes, then their disks), so reading across compares the two policies and
reading down walks one stack. A single row of four could not do this: four chips wide enough to
hold their text come to 920px against a 400px stack, so the strip would be more than twice the
width of the thing it reports on, and no chip would line up with anything above it.

The cost is a hard 152px of room for text per chip (176 minus 12px of padding at each end), so
values are kept to about 12 characters: the longest pair here, 'vol-aaa' plus 'wiped, gone', comes
to roughly 46 + 73 px of 11px JetBrains Mono, which leaves a clear gap between the name and the
value. Anything longer collides in the middle of the chip, so shorten the VALUE, never the width.
```

### before `function removeAt(el, ctx, delay = 0, to = OPACITY.terminated) {`

```
Fades an object out of existence when the delete that removes it lands, and takes its lit stroke
with it. A block that has gone dark must not keep glowing: the highlight means "this is live and
in play", so a ghost at 0.12 still wearing it reads as a deleted object that is somehow still
working. This is the one place the class cannot simply be pinned per step, because the fade is
mid-flight, so the class comes off when the fade lands.
```

### before `function lane(points) {`

```
Two line vocabularies, and the difference is the whole point of reading the card:
  dashed + arrowhead = a ROUTE, something travels it. Every reclaim lane is one of these, including
    the Retain lane down to the disk, which is a real route that this policy simply never uses.
  solid, no arrowhead  = a RELATION, the Bound link. Nothing travels a relation, so it gets no head.
Routes are built with pathArrow so the head, the dash pattern and the storage tint all come from
one place, and from the SAME points array the ball is animated along.
```

### before `const retPvc2 = box({ x: RET_X, y: PVC_Y, w: COL_W, h: PVC_H, label: 'PVC data-c', sublabel: 'Pending', role: '`

```
The claim that arrives AFTER the first one is deleted is its own box, not the old one turned
back on. It used to be the same element wearing a new sublabel, so the step that narrates a
brand new claim showed the deleted claim rising from the dead under its original name.
```

### before `const delChip     = valChip({ x: DEL_X, y: CHIP_ROW_1, w: CHIP_W, h: CHIP_H, name: 'PV-del', value: 'Bound', role: 'storage' });`

```
Each chip names ONE object and reports only that object's state, so a value can never be read
as a caption for something else. The two PV chips carry the phase, which is why the PV boxes
keep their reclaim policy as a fixed sublabel instead of flipping between the two meanings.
```

### before `const delSpec = specText(DEL_CX, 'real disk, EBS');`

```
The spec line is a sibling of the cylinder, not a child of it, so it has to be faded BY HAND
when the disk it describes is deleted. It used to be left alone, which left a bright
"real disk, EBS" hanging under a disk the step had just wiped out of existence.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time and steps are always entered in order, so the diff is
deterministic. Catalog-wide chip pattern.
```

### before `s.refs.delPv.classList.add('highlight');`

```
The two volumes light because their phase flipped to Released. The two claims do NOT, even
though they are what you deleted: they end this step faded, and a faded block never keeps a
lit stroke. What marks them is the flash below plus their new Terminating sublabel.
```

### before `s.refs.delPv.classList.add('highlight');`

```
The PV is the block the ball leaves from, so it lights at once: it is the actor here, not a
bystander that happens to be above the lane. The disk lights when the wipe REACHES it and
only then starts dissolving, so the hit registers before the object stops existing.
```

### before `s.refs.band.classList.remove('highlight');`

```
Played forward, only the SOURCE of the ball is lit from the start. The band and the disk
have to earn their light: the band when the ball lands on it, the disk at the same instant,
because that is the moment the policy is read and the disk is spared. Lighting the disk at
step entry announced the outcome before the ball that decides it had left the volume.
```

### before `setStage(s, { delPvc: 1, delPv: 1, delDisk: 1, retPvc: 1, retPvc2: 0, admin: 0, delBound: 1, retBound: 1, retBindLane: 0, adminLane: 0 });`

```
A ball travels this segment on this step, so the segment is a ROUTE and is drawn dashed with
a head, not as the solid Bound relation. The solid line is reserved for the resting state,
where nothing moves along it. That the claim ended up bound is carried by its own sublabel,
the PV-ret chip and the verdict line, all three of which say Bound on this step.
```

### before `s.refs.retDisk.classList.remove('highlight');`

```
Only the claim, the ball's source, is lit from the start. The volume lights when the bind
reaches it, and the disk lights at the same moment, because the disk becoming reachable IS
that arrival. It used to light at step entry, which showed the payoff before the act.
```

### poster

```
Abstract, not the literal diagram, and built on the sentence the card opens with: you delete a
claim and the disk full of data disappears, or it does not. So the poster is ONE deleted claim
(dashed, because it is on its way out) dropping into ONE controller band, and two fates leaving
the other side of that band. The band is the whole point and is the reason this is not just a
fork: the two outcomes are not chance, they are one field being read by one controller.
Left, Delete: the disk is dashed and faint, mid-dissolve. Right, Retain: the disk is solid and
filled, and carries a padlock, because Retain does not hand the data back either. It survives
and stays locked behind a stale claimRef until a human clears it, and a poster that showed only
"kept" would promise a happy ending the card spends three steps taking away.
The two lanes are symmetric about the claim above them, so neither outcome reads as the default.
The padlock is centered on the cylinder FACE (the band between the bottom of the cap at 122 and
the bottom arc at 160, so 141), not on the shape's bounding box: the cap is drawn as a rim seen
edge-on, and a glyph centered on the box sits visibly high inside the body you actually see.
```

---

## storage-topology-aware-provisioning

### before `const CX = 600;`

```
WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on the
shelf below it. volumeBindingMode: Immediate provisions the disk the instant the claim exists, in
whatever zone the provisioner happens to pick. The scheduler then honors that already-bound disk,
but if the Pod only fits the other zone on capacity and affinity, no node satisfies both the Pod and
its zonal disk, so the Pod stays Pending forever with a volume node affinity conflict. It is never
scheduled and never reaches ContainerCreating. WaitForFirstConsumer inverts the order: the scheduler
picks the node first, and only then is the volume provisioned in that same topology.

---- Horizontal composition ----
The two zones are mirrored about the canvas centre, so the picture is symmetric and neither zone
reads as the important one: NODE_CX = [CX - SPREAD, CX + SPREAD] with CX = 600, derived from the
node width and the gap rather than typed. Content spans 140..1060, margins 140 a side. The earlier
pass ran the nodes at 400..720 and 820..1140, which put the pair centre at 770 and left 400 units
of dead canvas on the left against 60 on the right.

The StorageClass and the claim sit stacked on the centre line above the zones, both centred on CX,
because the whole card is about ONE claim and ONE class being resolved into ONE of two zones.

---- Narration overlay ----
Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
  1920x900  right 102  bottom 183
  1600x1000 right 291  bottom 143
  1280x900  right 378  bottom 173
  1100x900  right 397  bottom 149
  1280x860  right 397  bottom 230   <- added 2026-07-27
  1100x800  right 397  bottom 230   <- added 2026-07-27
Worst case x <= 397 and y <= **230**, not the 183 recorded above: the rows sampled originally were
all 900 or 1000 tall, and a shorter window shrinks the diagram while the HTML panel keeps its pixels.
The StorageClass (y 36) and the claim (y 136) both sit inside that y band, so both start at x >= 400.
The node row at y 236 clears the real floor by **6 units**, not the 53 the old number implied, so it
must not move up. A longer narration than the ones below would invalidate this measurement.

PULSE MODEL: only the Pod pulses, and it is a wrapping g. The zone frames, the class, the claim and
the disks are infrastructure: they light via .highlight and never pulse. On the failure step the Pod
never went Ready, so it stays dim and takes pulsePodDim with an opacity lift, or the blink is
invisible against the 0.55 it sits at.

WIRES: the provisioning route leaves the StorageClass from its RIGHT edge midpoint, wraps down the
outer margin clear of both zones, runs a bus UNDER the whole disk shelf and rises into the chosen
disk through its BOTTOM. That keeps it out of every block and lets one route shape serve either
zone. The doomed cross-zone reach uses its own corridor in the gap between the node frames and the
shelf, drawn as a bare dashed line the Pod aims at its stranded disk, entering it dead centre on the
top edge. It has no arrowhead because the attach never actually succeeds.
```

### before `const NODE_W = 430, NODE_GAP = 60, NODE_Y = 236, NODE_H = 140;`

```
NODE_H hugs the Pod rather than framing canvas. At 180 the frames stood 88 units taller than the
Pod they hold, and zone-a, which holds nothing at all in the WaitForFirstConsumer path, read as a
large empty box rather than as an empty zone.
```

### before `const W_PROV_B = [[SC_RIGHT, SC_MY], [PROV_WRAP_X, SC_MY], [PROV_WRAP_X, DISK_MY], [NODE_CX[1] + DISK_W / 2, D`

```
Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
a block edge midpoint. Both provisioning routes leave the StorageClass through its RIGHT edge
midpoint and wrap down the same outer margin (a left wrap would run the lane and its ball straight
through the narration overlay), then turn in along the shelf midline and enter their disk through
the near RIGHT SIDE with two right-angle turns. zone-a simply runs further left than zone-b along
that midline: it passes over where the zone-b disk sits, but that disk is invisible during the
zone-a provisioning step, so nothing is crossed on screen.
```

### before `const W_MOUNT_B = [[NODE_CX[1], DISK_TOP], [NODE_CX[1], NODE_BOTTOM]];`

```
The mount lane and the cross-zone reach both meet the node-2 frame at its bottom edge (the line
enters the NODE, not the Pod sitting inside it), and they are never drawn in the same step, so each
runs straight down the node centre line and enters its disk dead centre.
```

### before `function podBlock() {`

```
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `const zoneLbls = NODE_X.map((x, i) => text({ class: 'scheme-label code dim', x: x + NODE_W - 12, y: NODE_Y + 1`

```
node() carries no sublabel, so the zone is its own dim caption. It shares the frame HEADER line
with the node label, right-anchored: centred under it at NODE_Y + 24 it landed on the top edge of
the Pod the frame holds, since NODE_H now hugs the Pod.
```

### before `[wProvA, wProvB, wMountB, crossLink].forEach(w => { w.style.opacity = '0'; });`

```
Lanes are pinned per step by setStage. Left permanently visible, the zone-a provisioning lane
was still drawn during the zone-b provisioning step, pointing into a disk that does not exist
on that path.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'mode' + 'WaitForFirstConsumer' at
24 characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 24 * 6.89 + 24 of
padding is 189 against the 232 available.
```

### before `[...nodes, ...zoneLbls, sc, pvc, ...disks, podB.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the zone frames, then the class and claim and disks, then the Pod so it
sits above its node, then the lanes and their captions, then the chip strip, then the packet
layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `pulsePodDim(s.refs.podB, ctx, BEAT.lead, { from: OPACITY.pending, peak: 0.95 });`

```
The scheduler keeps re-queuing the Pending Pod and rejecting it, so the Pod blinks. It never
went Ready, so it stays dim and needs the dim variant with an opacity lift or the blink is
invisible against the 0.55 it sits at.
```

### before `duration: 5800,`

```
5800, not 4400: this step provisions, materialises the disk and then mounts it, and the pulse on
arrival adds PULSE_POD.ms on top, which anim-dump puts at a 5473ms span. At 4400 the auto-advance
cut the mount off before the Pod ever blinked, so the card under-showed exactly what it narrates.
```

### poster

```
The Pod's zone (bright, centred) among faint sibling zones: the scheduler placed the Pod first, so
its volume is provisioned into that same zone, the jade disk directly beneath it. The empty
flanking zones are the topologies the volume did NOT land in.
```

---

## storage-volume-attach-limits

### before `const LEFT_X = 400;`

```
Node Volume Attach Limits (viewBox 1200x640). The one CSI failure that happens BEFORE anything is
bound, attached or mounted: the Pod never gets a node at all. Every node has a hard ceiling on how
many volumes one CSI driver may have attached to it at once. The ceiling is not a Kubernetes
setting: the node plugin answers NodeGetInfo with max_volumes_per_node, KUBELET writes that number
into the node's CSINode object, and the scheduler's NodeVolumeLimits filter is the only thing that
ever reads it. Run out of slots and the Pod sits in Pending reporting "node(s) exceed max volume
count" while every node still has spare CPU and spare memory, which is what makes it so hard to
recognise the first time.

---- Three points of fact this card had wrong, checked against source ----
1. The node-driver-registrar does NOT write CSINode. It runs a registration socket that tells
   kubelet the driver's name and endpoint, and nothing more. Kubelet itself calls NodeGetInfo
   (pkg/volume/csi/csi_plugin.go, RegistrationHandler.RegisterPlugin) and hands maxVolumePerNode to
   the node info manager, which writes spec.drivers[].allocatable.count. The card said registrar.
2. NodeVolumeLimits does NOT run on every scheduling attempt. Its PreFilter returns Skip when the
   Pod has no PVC, no generic ephemeral volume and nothing inline-migratable, which suppresses the
   Filter phase for that Pod entirely. A storage-free workload costs one volume-list scan.
3. What the Filter counts changed in 1.32 (PR 127757, issue 126502). Before that it counted only
   the volumes of Pods assigned to the node, so deleting a Pod freed its slot instantly and the
   replacement was scheduled onto a node whose disks were still detaching, landing in
   ContainerCreating with FailedAttachVolume. Since 1.32 the count is the de-duplicated union of
   those Pod volumes AND every live VolumeAttachment for the node, so the slot is held until the
   VolumeAttachment is deleted, which is what "released by a detach, not by a Pod dying" means and
   why the Pod stays Pending rather than getting placed. A QueueingHint on VolumeAttachment delete
   requeues it the moment the slot really opens. This card targets 1.35, so it tells the 1.32+
   story, and the `filter` step names both terms of the sum because `detachlag` is their payoff.

This is the only card in the csi row whose subject is SCHEDULING. Its six siblings all begin with
a Pod that already has a node, so the whole vocabulary of the section (VolumeAttachment, stage,
publish, fsGroup, force-detach) is downstream of a decision this card is entirely about.

---- Composition ----
Storage grammar is a vertical stack, and this one reads top to bottom as three layers of
authority: the thing being placed, the thing that decides, and the two records the decision is
made from.
  1. Pod web-0, unplaced                                      (the claimant)
  2. the Scheduler and its NodeVolumeLimits filter            (the decider)
  3. CSINode, one per node, holding allocatable.count         (the ceiling, as an object)
  4. three node frames, each an 8-slot attachment strip       (the ceiling, as physical reality)
Tiers 3 and 4 are deliberately adjacent: the whole mechanism is that a number written in an API
object has to agree with how many disks are really hanging off a machine, and the card is asking
the reader to compare the two rows.

LEFT_X is pinned by the narration overlay, which is HTML laid over the SVG, so the NARROWER the
window the MORE viewBox units it eats. Measured right edge / bottom edge for THIS card, worst
step, by viewport:
  1920x1080 -> 203 / 130    1440x900 -> 319 / 163    1280x800 -> 358 / 189
  1100x800  -> 397 / 220     900x650 -> 398 / 375
So the real worst case is x<=398 and y<=375, and the bound is an L, not a box: above y=375 nothing
may sit left of 400, below it the full width is free.

That 375 is BOUGHT and it is what pays for the node row being wide. The narrations here used to be
the longest in the csi row at up to 470 characters, which put the bottom at 498 and left the node
tier no choice but to squeeze inside 400..800 at 120 units per node. Held under ~300 characters
they sit at 375, and the node row at y=418 clears the panel by 43, so it can spread to 584 units
and each node frame gets 176. Overrun ~300 on any step and the widest node goes back under the
panel. Re-measure after editing narration, not only after moving geometry.

The upper three tiers (Pod, Scheduler, CSINode) all still live inside 400..800 because they sit
ABOVE y=375 where the L is still closed. Only the node row and the chip strip cross to the left,
and both are below it. That is the whole reason the report lanes converge instead of running
straight up: the row underneath is wider than the object it reports into, and the object cannot
grow to meet it.

CONTENT_CX = LEFT_X + CONTENT_W/2, and LEFT_X cannot move, so CONTENT_W is the only lever on where
the card sits. It is solved for, not chosen: CONTENT_W 400 puts CONTENT_CX exactly on 600, the
canvas center. That exactness is forced by the chip strip, which at 976 units is far wider than
anything above it and is therefore the tier that sets the visual center. On 600 it spans 112..1088
and the two margins agree.
```

### before `const PVC_DY = 34, PVC_H = 46;`

```
The PVC box inside the Pod, in Pod-local coordinates. pod() puts its own label on the baseline at
y=16 and its state sublabel on the baseline at y=h-8, so on a 110 tall Pod the free band runs
20..93. PVC_H 46 centred in it leaves 14 above and 15 below. It used to sit at 40..86 against a
sublabel whose glyphs start at 95, so the box was pinned against the floor of the Pod with all the
slack piled on top of it, which read as the Pod being mis-drawn rather than as a gap.
```

### before `const CSI_W = 280;`

```
ONE CSINode box spanning the full node tier rather than three boxes stacked over three columns.
Three were drawn first and they were identical in every field that matters here, so the row read
as a repetition the card never uses: the number is the same on all three nodes, and the story is
about that number against the slots, not about the objects differing. Spanning the whole tier also
lets all three report lanes converge into one face, which is what the registrar actually does.

CSI_W 280 rather than the full 400 of the tiers above. It is narrowed so the two outer report
lanes have somewhere to travel: they must rise at x>=400 (see the lane block below) and then run
IN to a side wall, so every unit the box gives up on each flank is a unit of visible horizontal
run. At 280 the wall sits at 460 and each run is 60 units. At the old 400 the wall was at 400,
the run was zero, and the turn would have collapsed onto the rise. The label needs about 150 units
and the sublabel about 121, so 280 still leaves ~65 units of air on the wider of the two.
```

### before `const NODE_W = 220, NODE_GAP = 30;`

```
Three node frames, 176 wide with a 28 unit gap, spanning 584 and centred on CONTENT_CX, so the row
runs 308..892 and hangs 92 units outside the tiers above it. They were 120 wide packed inside
CONTENT_W, which made a whole machine the smallest object on a card whose entire subject is what a
machine can hold: the eye read them as three little widgets under the real diagram. 176 is what the
overlay allows once the narrations come under ~300 characters, and it is enough for the slot grid
to be drawn at a size that can actually be counted.
```

### before `const LANE_X = NODE_CX;                                  // 350 / 600 / 850`

```
Each report lane LEAVES its node dead centre of the node's top face, so the three lanes read as
rising straight out of the three machines rather than out of a point offset inboard. The outer two
therefore start at the node centres 350 and 850 (previously pulled in to 400 / 800 to keep the left
lane clear of the narration overlay, whose bottom edge is 375 at 900x650 and whose right edge is
x>=398: at that one narrow viewport the left lane's rise from y=406 to CSI_MID_Y 330 now clips the
panel between y=375 and y=330). The node row itself is free of all of this because it starts at
y=406, below the panel.
```

### before `const SLOT_N = 8, SLOT_COLS = 4, SLOT_W = 26, SLOT_HGT = 26, SLOT_GAP = 10;`

```
The attachment strip, in frame-local coordinates. Eight slots is the diagram's cap, not a real
driver's. Checked against the node-specific volume limits doc: the DEFAULTS are EBS 39, GCE PD 16,
Azure Disk 16, but with dynamic limits the real ceiling is per instance type, and the doc gives
EBS 25 on M5/C5/R5/T3/Z1D and 39 elsewhere, Azure up to 64, and GCE up to 127. An earlier pass
said 128 for GCE, which is the off-by-one everyone makes. Eight is what can be drawn as countable squares at this width, and the
mechanism is identical at any number. The grid grew with the frame, 18 to 22 with an 8 unit gap,
so the gauge still fills its frame instead of floating in the middle of a wider one.
Everything inside the frame is derived from NODE_W, so widening the node widens its contents
instead of leaving a bigger empty box around the same small gauge. At 220 the sockets go to 26
with a 10 unit gap (134 for the row, 43 of margin each side) and the counter to 172 x 30.
```

### before `const CHIP_W = 232, CHIP_GAP = 16, CHIP_COUNT = 4;`

```
ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
Measured worst cases, in viewBox units:
  allocatable.count  117 + '8 per node'         69 = 186
  Pod web-0           62 + 'Running on node-3' 117 = 179
  blocked by          69 + 'max volume count'  110 = 179
  attached            55 + '24 of 24'           55 = 110
So 232 clears the worst pair with ~22 units between name and value, and matches the width the rest
of the storage family settled on.
```

### before `const LANE_DX = 40;`

```
The Pod and the Scheduler talk BOTH ways, so each direction gets its own lane rather than a ball
bouncing back down the arrow it came up. LANE_DX 40 is not cosmetic: the return lane carries a
riding tag that comes to rest in the corridor between the two blocks, and at the 14 the first pass
used, that tag (about 96 units wide) printed straight over the outbound lane. At 40 the two lanes
stand 80 apart and the tag clears the other one with room.
```

### before `const W_SCHED_CSI = [[CONTENT_CX, SCHED_BOTTOM], [CONTENT_CX, CSI_TOP]];`

```
The filter read runs dead down the spine. It used to be pushed out to 480 to dodge a wire caption
that sat centred on 700 in the same corridor, so the corridor carried a lane left of centre and a
line of text right of it and read as neither aligned nor deliberate. The caption is gone (see
build) and the lane is back on CONTENT_CX, which is also where node-2 reports in from below, so
the CSINode box now has one vertical axis through it rather than two near-misses.

**This is why review stage 2.4 family D is DECLINED on this card (2026-07-30).** The finding is real
as far as it goes: the filter step narrates a read ("reads allocatable.count out of each CSINode and
compares it") and only the question was ever drawn. The fix D prescribes is a lane pair, and it was
built and then reverted, because a pair is by definition two axes and would put three verticals
through this box where the note above records the work of getting it down to one.

What answers the read instead is already on screen and is why the step lights what it lights: the
CSINode carries `allocatable.count: 8` in its own sublabel, and all three Node counters are lit for
the whole step precisely because they are the values being compared against. A ball would restate
what two blocks already say, at the cost of the axis. If a rule can only be satisfied by making the
picture worse, the finding stays open with the reason written down.
```

### before `const W_NODE_CSI = [`

```
Each node reports its own cap into the shared CSINode box. Three lanes, one shape each, and every
one of them is a single move or a single 90 degree turn:
  node-1  rise, then ONE turn right into the LEFT side wall at CSI_MID_Y
  node-2  straight up the spine into the BOTTOM face, dead centre
  node-3  rise, then ONE turn left into the RIGHT side wall at CSI_MID_Y
The outer pair used to take two turns, out of the frame, along a shared mid-corridor line and then
up into the bottom face. That is a zigzag: three segments to say one thing, and it made the
corridor between the tiers read as plumbing. Entering the side walls says the same thing with one
bend and leaves the corridor clean. Same points array feeds the static wire and the ball, so the
two cannot drift apart.
```

### before `const REPORT_DUR = Math.max(...W_NODE_CSI.map(routeDur));`

```
ONE duration for all three report balls, so they leave together and LAND together. Their paths are
not the same length (136 units on the flanks against 48 up the spine), and routeDur is
length-based, so left to itself the centre ball would arrive first and the object would light
before two thirds of the report had got there. As it happens both lengths currently fall under the
PKT_DUR_MIN floor of 700ms and would coincide anyway, which is precisely why this is pinned: that
is an accident of the present geometry, and the first time a tier moves far enough to push a flank
past 315 units the three would silently desync. Registered in check-canon's ALLOW_EXPLICIT_DUR.
```

### before `const SLOT_FILL = Object.freeze({`

```
Slot fills. `free` is the empty socket, `used` a volume already attached, `fresh` the one that
web-0 finally takes, drawn brighter so the last step has a static change and not only a sublabel
edit. There is deliberately no `detaching` fill: the detach that frees a slot is a transient, and
giving it a resting colour would invite the reader to look for it in the end state.
```

### before `function podBlock() {`

```
PULSE MODEL: a Pod is ONE unit and blinks as one. The shell and its container box both live in
`group`, and `group` is what gets pulsed. The wrapping g is not optional: pulsePod finds its
targets with querySelectorAll, which matches descendants only and never the element itself, so
pulsing a bare pod() catches the .scheme-pod-rect child but not the group and the pulse silently
fires at half strength (symptom in anim-dump: strokeOpacity rows but no filter row).
```

### before `function nodeBlock({ x, label }) {`

```
A node frame is its own little instrument: a caption, a strip of attachment sockets, and a counter
that reads them back as a number. The slots are plain rects rather than box() primitives on
purpose. They are not blocks that can act, so they must never be able to take .highlight, pulse,
or receive a packet: they are a gauge, and the only thing they ever do is change fill.
```

### before `const cap = frame.querySelector('.scheme-node-label');`

```
node() drops its caption at local y=18, which on a frame this short reads as floating inside the
box rather than as titling it. 14 tucks it up against the top edge. Placement only: the uppercase
rendering is catalog-wide styling and is left alone.
```

### before `const capChip   = valChip({ x: CHIP_X[0], y: CHIPS_Y, w: CHIP_W, h: CHIP_H, name: 'allocatable.count', value: `

```
No wire caption in the Scheduler-to-CSINode corridor. There used to be one, a dim line of text
re-worded on every step, and it was carrying nothing the narration and the chip strip did not
already say: it sat off to one side of a lane that was itself off-centre, so the one corridor
that should read as a single clean axis had two competing things in it. The corridor is now
empty apart from the lane on the spine. `wires` stays as an empty map so the family prologue
(clearWires) is still valid if a caption is ever wanted back.
```

### before `nodes.forEach(n => root.appendChild(n.frame));`

```
Z-order (bottom -> top): the node frames (which carry their own slot strips), then the counter
boxes so they sit above their frame, then the CSINode row and the Scheduler, then the Pod, then
every lane above the blocks, then the chip strip, then the packet layer so every ball rides
above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { cap = '8 per node', attached, pod: podVal, blocked }) {`

```
Every step writes EVERY chip. A chip left unset keeps the previous step's value, which is how a
card comes to report 'blocked by: max volume count' on the step where the Pod is already running.
Each name means exactly one thing: 'attached' is slots in use across the whole cluster, never one
node, and 'blocked by' is the reason web-0 cannot be placed, never the Pod state itself.
```

### before `function setSlots(s, counts) {`

```
The gauge. `counts` is one entry per node: a number, or a number plus a `fresh` flag marking the
last filled slot as the one web-0 just took. Every step calls this with all three, for the same
reason every step writes every chip: a node left unset keeps the previous step's reading, and a
counter that disagrees with its own slot strip is the one error on this card a reader cannot catch.
```

### before `function setStage(s, {`

```
One place that pins every mutable opacity and every mutable sublabel, called from every step with
only the things that step changes. clearHighlights clears classes, not inline styles, so without
this a step entered out of order would inherit the previous step's opacities: the reduced-motion
replay path (prev / reset) walks 0..n and would leave the Pod visible on step 1.

The lanes each track the thing they represent. A lane into or out of a Pod that does not exist yet
points at nothing, so it is pinned to 0 rather than dimmed: unlike a block it leaves no hole when
it goes. The three report lanes are the exception and stand at full from the first frame, because
what they carry (a node telling the cluster its own ceiling) is a standing relationship that was
true long before this card started.
```

### before `setChips(s, { attached: '4 of 24', pod: 'not created', blocked: 'nothing' });`

```
The Pod is absent, not dim. It has not been created yet, and a ghost Pod sitting at the top of
the card from the first frame would say the scheduling attempt is already under way, which is
the opposite of the setup: right now there is simply a cluster with room in it.
```

### before `narration: 'The ceiling is not a Kubernetes setting. It is reported by the CSI node plugin as max_volumes_`

```
Where the number comes from, which is the one CSI object the rest of the row never touches.
All three report lanes fire together rather than one after another: they are three copies of
one mechanism, and walking them in sequence would suggest an ordering that does not exist.
```

### before `W_NODE_CSI.forEach(pts => {`

```
No Pod acts here and no block emits: the node plugins do, and they are drawn as the frames
themselves. So the balls leave after BEAT.lead with no preceding pulse, and CSINode lights
when the first one lands rather than at step entry.

All three share REPORT_DUR so they land on the same frame, which is the point: three nodes
reporting one number each, not a staggered relay. The riding label is passed the SAME dur, or
it drifts off its own ball mid-flight and only rejoins it at the endpoints.
```

### before `const prev = [2, 1, 1];`

```
The newly taken slots fade in one after another, left to right and node by node, so the strip
reads as filling rather than as cutting to a full state. Pinned full above the guard first:
a cancel mid-fill must land on eight of eight, not on however far the stagger had got.
`seq` is a running counter across all three nodes, not a per-node index: the first pass
computed the delay from i and the node's own starting count, which double-counted node-1 and
pushed the last slot to 2620ms, past this step's 2600ms duration. Auto-advance would then
have cut the fill off with the final slot still fading in. 90ms per slot over the 20 slots
that actually change lands the last one at 1930ms, well inside the step.
```

### before `narration: 'So web-0 stays Pending, and its event reads zero of three Nodes are available, three Nodes exceed max volume count. Every one of those Nodes has spare CPU and spare memory, which is what makes this hard to recognise: the cluster looks half empty and the Pod will not schedule.',`

```
The sentence of the whole card. The answer comes back DOWN its own lane rather than up the
request lane, because a FailedScheduling event is a thing the scheduler produces, not the
request bouncing.
```

### before `const ans = routePacket(s, ctx, W_SCHED_POD, { delay: BEAT.lead, role: 'storage' });`

```
Down-arrow ordering: infra reaching a Pod, so the ball goes first and the Pod blinks on
arrival. The tag rides BELOW the ball (dy positive) because a lane ending at a Pod cannot
carry its tag above it: pod() puts the sublabel 8 units above the shell bottom, and a tag at
the default -14 would print on top of it for the last beat of the flight.
```

### before `setSlots(s, [8, 8, { used: 8, fresh: true }]);`

```
node-3 ends back at eight of eight, and the eighth slot is drawn `fresh` so the end state
shows WHICH slot web-0 took. The seven of eight in the narration is a transient the motion
below plays through, never a resting state: a slot that opens and is taken in the same
breath is exactly the race the step is about.
```

### before `const slot = s.refs.nodes[2].slots[SLOT_N - 1];`

```
The transient: the last slot empties, the counter reads seven of eight for a beat, then the
slot comes back bright as web-0 takes it and the counter goes back to eight. Everything here
only replays what is already pinned above, so a cancel mid-step still lands correctly.
Opacity only, never fill. The first pass drove the fill through onfinish handlers, which made
the step's END state depend on a callback firing: a seek or an early cancel left the slot
showing the transient instead of the pinned `fresh`. Now the fill is set once, statically,
above the guard, and the motion just takes the slot away and brings it back. The counter text
is the one thing that still rides onfinish, and that self-heals because the next step calls
setSlots and rewrites every counter from scratch.
```

### before `narration: 'Every lever here is about the ceiling and none is about CPU. Fewer volumes per Pod is the cheapest`

```
The closing step, so it deliberately comes to rest: no packet, no pulse, and no block flash
either. The usual argument for flashing something on a packet-less step does not apply to the
LAST step, which the reader is meant to sit and read.
```

### poster

```
A request that branches looking for somewhere to go, and a rack of sockets with nothing free at
the end of every branch. The shape is a scheduling decision, which is what makes this card
different from its six siblings: they all start with a Pod that already has a node.

The sockets are drawn DARK (0.03) rather than as bright cells. They are holes, not contents, and
a rack of dark recesses in a barely-lit frame reads as hardware at a glance, where the earlier
0.20 fill read as eight grey tiles and flattened the whole lower half into a keypad. Dropping
them also frees the brightest fill for the block that the sentence is actually about: the request
at the top, the one thing here that wants something and cannot have it.

The branch is the original part and it is doing real work: one request forks into two candidates,
and both wires run the full way down to the rack, meeting its top edge at x=112 and x=208, so the
decision layer above is fully wired to the hardware below. Everything above the rack is the
decision, everything below it is the machines, and the four dashed wires connect them at one
weight so the whole path from request to socket reads as continuous.

Content sits 13..167 in a 180 tall box, so the canvas margins agree at 13, and it is symmetric
about x=160: rack side margins agree at 15, socket rows and columns are both gapped at 6, and the
sockets clear the rack by 9 above and below. No packet dot: a ball frozen on a wire reads as a
paused animation.
```

---

## storage-volume-detach-on-node-loss

### before `const LEFT_X = 400;`

```
Detach on Node Failure (viewBox 1200x640). A node goes NotReady and its kubelet falls silent. The
old Pod cannot be confirmed dead, so Kubernetes deliberately WILL NOT detach the volume yet:
detaching while the old Pod might still be writing means two nodes writing one filesystem. The
stall is a chain of timeouts, walked one rung at a time on the ladder, and the out-of-service
taint is the operator escape hatch that asserts the node is dead and skips the whole chain.

---- What this card owns, against storage-multi-attach-error ----
Both cards end with one RWO disk moving from one node to another, so the boundary has to be held
deliberately or the pair reads as one card shown twice (it did, until this pass). The difference
is not the outcome, it is what is being waited on. There, node-1 is HEALTHY and the volume is
legitimately held by a Pod that is legitimately still running: an ordering problem, fixed by
ordering (Recreate). Here nothing is contending for the volume at all. The wait is on DOUBT,
because a silent kubelet cannot confirm its Pod stopped writing. So this card owns the
unreachable-toleration and force-detach clocks, the roughly six minutes, the argument that two writers
corrupt one filesystem, and the out-of-service taint. None of those appear on the other card.

---- Layout ----
Storage grammar is a vertical stack, and this card runs TWO of them side by side, because the
whole story is one disk moving between two nodes. node-1 and node-2 are equal columns, the shared
RWO disk sits on the shelf between and below them, and the timeout ladder plus the escape hatch
form one band across the bottom. The two columns are deliberately IDENTICAL in width: the only
thing that differs between them is which one is answering, so anything else that differed would
read as a difference the card is not about.

---- Horizontal composition ----
Every tier shares ONE center, CONTENT_CX, rather than hand-typed margins. LEFT_X is pinned by the
narration overlay, which is HTML laid over the SVG, so the NARROWER the window the MORE viewBox
units it eats. Measured right edge / bottom edge for THIS card, worst step (the escape step, which
carries the longest narration), by viewport:
  1920x1080 -> 203 / 161    1440x900 -> 319 / 203    1280x800 -> 358 / 236
  1100x800  -> 397 / 255     900x650 -> 398 / 436
So the real worst case is x<=398 and y<=436. LEFT_X 400 has about 2 units of slack and cannot move
left at all, and BAND_Y 448 clears the 436 bottom by 12. Do not re-derive either from a single
wide-window screenshot, and note that a narration longer than the ones below invalidates both.

CONTENT_CX = LEFT_X + (2*NODE_W + NODE_GAP)/2, and LEFT_X cannot move, so the node tier width is
the ONLY lever on where the diagram sits. It is solved for, not chosen: 2*188 + 24 = 400 puts
CONTENT_CX exactly on 600, the canvas center. NODE_W then sets POD_W (NODE_W - 2*NODE_PAD = 168),
and the floor under POD_W is the widest string inside a Pod: the sublabel 'marked for deletion',
which is a .scheme-pod-sublabel at 10px JetBrains Mono. That class measures 6.03 viewBox units per
character (measured with document.fonts.ready awaited, or you get the fallback monospace, which is
about 20 percent narrower and will flatter you), so the sublabel is 114.6 units and POD_W 152
keeps ~19 units of air either side. Note the rate is per class: 11px chip text and dim code
labels are 6.89, and 12px box labels are Space Grotesk and proportional, so they vary by string.

That exactness matters because of the bottom band. The node tier is 400 wide and is symmetric
about CONTENT_CX wherever it sits, so on its own it would look fine anywhere. The chip strip does
not: at 662 units it is more than half again the width of the node tier, so it is the tier that
actually sets the visual center of the card. The previous layout ran the nodes at 430..1140 and
the chips at 430..1142, which put the whole card 186 units right of the canvas center with a dead
left third. Pulling everything onto 600 makes the strip 269..931 and both readings agree.

The bottom band was re-cut in R5 (2026-07-27) and it no longer sits inside the chip strip's edges.
The reason is a rule the old cut could not see: the escape box is a BLOCK, and the only other block
below the overlay is the disk. Two blocks are what the low-content check measures, so an escape box
parked at 701..931 put the low half of the card at 505..931, centre 718, however well the chip strip
behaved. It now stands on the spine under the disk it acts on (485..715), which also turns its taint
lane into a straight climb into the disk floor instead of an elbow into the disk's right face.

The ladder and the chips then take one side each, ladder at the left margin (60..440) and chips at
the right (478..1140), so between them the .scheme-chip strip still spans the full 60..1140 and
still centres on 600. Both of those are pooled into one strip by the check, which is why the ladder
can be moved to balance the chips rather than having to sit under them.
```

### before `const NODE_Y = 48, NODE_H = 160;`

```
The node frames are as wide as the tier allows (192) with a tight 16 gap, so the pair reads as two
substantial machines rather than two thin columns, while 2*192 + 16 still sums to 400 and keeps
CONTENT_CX on the canvas centre. They are also shorter (160): the Pod inside was too tall against
the rest of the storage family, so it drops to the family two-column size (104 tall, App box 44)
and the frame shrinks to hug it, which also makes the frame read as wider. The disk below is 190
wide, wider than the 16 gap, so it still bridges both columns as one shared volume.
```

### before `const CHIP_W = 210, CHIP_GAP = 16, CHIP_COUNT = 3, CHIP_H = 32;`

```
Bottom band. CHIP_W is one width for all three chips rather than three hand-picked ones. valChip
anchors the name 12 from the left and the value 12 from the right, so a chip needs
name + value + 24 plus a readable gap. Rendered worst cases, measured in the browser rather than
estimated from a per-character rate (the rate under-reads on strings full of wide glyphs):
  node-1   41 + 'NotReady, tainted'  117 = 158
  volume   41 + 'attached to node-1' 124 = 165
  new Pod  48 + 'ContainerCreating'  117 = 165
So 210 clears the worst pair with 21 units between name and value, which is the floor for the two
halves still reading as separate fields.
```

### before `const LAD_X = M, LAD_Y = 448, LAD_W = 380, LAD_ROW = 38, LAD_GAP = 9;`

```
The ladder rows carry the longest strings on the card, and they are the one place a per-character
estimate is not good enough: the rungs are full of wide glyphs (the separator, the tilde, the
digits), so the longest rung renders 338 units where 6.0 units per character predicts 307. Measure
them. chainList insets its text 10 from the row edge, so LAD_W 380 leaves 32 units of margin on
the worst rung. At the old 350 that rung cleared the row border by 2 units and read as text
jammed against the frame.
```

### before `const ESC_W = 230, ESC_H = 72;`

```
ESC_W shrinks to 230 to buy the ladder that extra width back: the widest string inside the box is
the sublabel at 175 units, so 230 still leaves ~27 either side. The box is now centred on the spine
(485..715), so the gap it keeps is to the ladder's right edge (440), 45 units.
```

### opacity phases (was `const GONE = 0.35`, now OPACITY.*)

```
A Pod that EXISTS and is not yet marked is drawn at full strength and blinks with the ordinary
pulsePod, exactly as the rest of the storage family does (see storage-multi-attach-error): a dim
'unknown' state pulsed with pulsePodDim stacks an opacity swing on top of the blink and reads as a
faster, busier pulse than the same beat elsewhere in the catalog. The old Pod being UNCONFIRMED is
carried by its sublabel and its chip, not by a faded opacity: not knowing whether a Pod runs is not
a phase of its own.

Being MARKED is a phase, and the card walks the old Pod down the vocabulary in the two steps that
earn it. On evict it pulses at full and then sinks to OPACITY.terminating, because the sublabel
reading 'marked for deletion' IS the Terminating phase, and drawing that as full strength was the
catalog-wide family A defect (SCHEME-2.4-PLAN.md, stage 2.1). On forcedetach it goes the rest of the
way to OPACITY.terminated, and it starts that fade AT terminating rather than at 1: an animation
keyframed from full would brighten a marked Pod back up for one frame before killing it.
A Pod at either shade never pulses.
```

### before `const LANE = 22, CORRIDOR_Y = 260;`

```
Each attach lane leaves the disk top LANE either side of the spine and rises to the BOTTOM EDGE of
its node frame, at the frame's exact horizontal centre (A_CX / B_CX), so the two are exact mirrors
about CONTENT_CX and every endpoint is a face midpoint. The lanes stop at NODE_BOTTOM rather than
running on up into the Pod: the disk attaches to a NODE, and the Pod is what runs once the node has
the volume, not the thing the attachment terminates on. CORRIDOR_Y is the clear strip between the
node frames (bottom 238) and the disk (top 282). Every array below is shared by the static wire and
the ball that rides it, so the two cannot drift apart.
```

### before `const DK_RIGHT = DK_X + DK_W, DK_MID_Y = DK_Y + DK_H / 2;   // 695 / 334`

```
The taint lane rises out of the top of the escape box and turns LEFT into the right flank of the
disk, at the disk's vertical midpoint. It deliberately does not approach the disk from underneath:
that route has to cross y 410, where the disk caption sits centered on the spine, and a caption up
to 20 characters wide reaches x 663, so the lane would draw a dashed line straight through the
last word of its own label. Coming in side-on also keeps the whole lane clear of the ladder, which
ends at x 649, and of the node frames, which bottom out at y 238 and end at x 800, 16 units left
of the lane.
```

### before `function podBlock({ x, label, sublabel }) {`

```
PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the App box inside it both
live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together. The
wrapping g is not optional: pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
Nothing here ever puts .highlight on the App box either: a Pod must not be left holding a lit
rectangle once its pulse has decayed.
```

### before `const nodeA = node({ x: A_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
node() puts its own label at coordinates RELATIVE to the frame group. An earlier pass hand
rolled these frames out of box() and appended an absolutely positioned caption into the
translated group, so 'node-1' rendered at 874 (on top of the other column's App box) and
'node-2' at 1614, past the right edge of the viewBox and therefore invisible. Use the
primitive: it cannot be got wrong.
```

### before `const wAttachA = pathArrow({ points: W_ATTACH_A, dashed: true, dim: false, role: 'storage' });`

```
Both node-disk lanes are built identically, so the mirrored pair reads as the same relationship
on either side, differing only in which node currently holds the volume. Each is a real arrow in
the FULL storage colour (dim: false), not the muted dim variant, so the left lane to node-1 does
not read as a lesser arrow than the right one: they are one colour. wAttachA is shown from the
first frame (the volume starts on node-1) and only its OPACITY drops on force-detach as the
attachment is severed. wAttachB starts hidden and is drawn in when the volume moves to node-2.
```

### before `[nodeA, nodeB, disk, escape, oldPod.group, newPod.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the node frames, then the disk and the escape box, then the Pods so
they sit above their own frame, then the lanes and the disk caption, then the bottom band
(chips + ladder), then the packet layer so every ball rides above everything. The ladder and
the packet lanes do not overlap at all (the lanes live above y 478, the ladder below y 448),
so the ladder needs no exemption from the packet layer.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
still holds the previous step's text at call time (clearHL clears the class, not the text) and
steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { nodeA, volume, newPod }) {`

```
Every step writes EVERY chip. A chip left unset keeps the previous step's value, which on a card
built entirely out of state transitions is how the volume chip comes to read 'force-detached' on
the step that is explaining why nothing has been detached yet.
```

### before `function setPods(s, { oldSub, newSub }) {`

```
Both Pods carry a sublabel that tracks their state, and like the chips it is written on EVERY
step: a Pod still reading 'Running' three steps after its node went silent is a lie the reader
has no way to catch.
```

### before `s.refs.oldPod.style.opacity = '1';`

```
Through notready and refuse, both node FRAMES and both Pods stay at full strength. node-1 being
unreachable and its Pod being unconfirmed are carried by the chip and the Pod sublabels, not by a
faded opacity: a Pod that might still be running is a Pod that exists, and the family draws an
existing Pod at full. The old Pod leaves full only on evict, where it is marked, and the shades it
takes from there are in the opacity phases note above.

The replacement Pod is the other half of that rule and is not drawn at all until it exists. It
used to fade in on the notready step, which no controller could do: while the old web-0 is a live
object with no deletionTimestamp, nothing may create a second Pod under that name. It now appears
on the evict step, the step that writes the mark, and node-2 stays an empty frame until then.
```

### note (anchor dropped: `s.refs.oldPod.style.opacity = GONE;` is not unique in the file)

```
The old Pod is now assumed dead and the standing attachment to node-1 is severed, so both
drop to GONE. Pinned here, above the guard, so a cancel mid-fade still lands on the right
value: the animation below only eases into what is already set.
```

### before `},`

```
The disk does NOT flash here. It is a static receiver of the detach, shown by its highlight
above plus the sublabel and the volume chip flipping to force-detached. The severing is
carried by the two fades (old Pod and the node-1 attachment lane), which is event enough.
```

### before `s.refs.disk.classList.add('highlight');`

```
The disk is the SOURCE of the attach hop, so it is lit from step entry: a ball must never
leave an unlit block. node-2 is the destination and lights on ARRIVAL, carried by the Pod
blink below rather than a static highlight at entry.
```

### before `s.refs.wAttachB.style.opacity = '0';`

```
Infra reaching a Pod, so this takes the down-arrow ordering: the lane draws itself in, the
ball leaves after BEAT.lead so the new attachment registers before anything moves on it, and
the Pod blinks on ARRIVAL rather than at step entry. The Pod is already at full strength, so
the arrival is carried by the ordinary pulsePod alone: it is the disk showing up that starts
the container.
```

### before `const t = routePacket(s, ctx, W_TAINT, { delay: BEAT.lead, role: 'storage' });`

```
No Pod acts here: the operator does. So there is no pulse, the ball leaves after BEAT.lead so
the lit escape box registers as the source, and the disk lights on arrival rather than at
step entry. A block flash is not used on this, the closing step, which should come to rest.
```

### poster

```
A technical diagram, curated to one sentence: a live VolumeAttachment still binds the volume to a
DEAD node, and the move to the live node is gated by a timeout. Two machine frames stand left and
right: the left one is dim with a dark status LED (failed, kubelet silent), the right one is lit
with its Pod still dashed (pending, waiting on the disk). The volume sits between them with the
faint 0.04 body fill the rest of the poster cylinders use, so it reads by its jade rim, not as a
grey slab. Both wires LEAVE THE CYLINDER HORIZONTALLY and are identically dashed, then turn up into
the node above: only the badge versus the clock, and the dim versus the lit node, tell the two
sides apart. A small badge carrying an attached:true check rides the left wire to the dead node,
the attachment that has not been deleted, and a CLOCK sits on the right wire to the live node, the
roughly six minute force-detach wait that has to elapse first. The clock is the signature: the
whole card is that a healthy-looking cluster still waits out a timer. Both wires break cleanly
around the badge and the clock so nothing draws through them. Content spans y=28..158, centred.
```

---

## storage-volume-expansion

### before `const CX = 600;`

```
---- What this card has to get RIGHT ----

The allowVolumeExpansion gate is enforced by the API SERVER on the edit, not by the external-resizer
afterwards. Raising the request on a claim whose StorageClass does not allow expansion is refused at
admission with "only dynamically provisioned pvc can be resized and the storageclass that provisions
the pvc must support resize", so the resizer never sees such a request at all. An earlier cut of this
card had the resizer consult the class before acting, which puts the gate one component too far
downstream and makes a rejected edit look like a resize that quietly declined to run.

The second phase is for FILESYSTEM volumes only. A raw block volume has no filesystem to grow, so
NodeExpandVolume does not apply and the bigger device is visible as soon as phase one lands. The
node-expand narration says so rather than implying every volume needs both halves.

Shrinking: the API refuses a request below the size already provisioned. What newer clusters do
allow is walking a request back DOWN while an expansion is still pending, which cancels a grow that
has not happened yet. That is not shrinking a volume and the narration is worded not to promise it.

---- Layout (viewBox 1200x640) ----
Storage grammar, the centered vertical stack: Pod on top, its claim under it, the real disk on the
shelf below, all three on ONE axis at the canvas center CX=600. Tier heights and block footprints
are the same numbers as storage-pvc-protection, so the two cards in this subcategory read as one
family. The spine is the mount ascent (disk -> claim -> Pod, upward) and balls travel it, so its
arrowheads are earned. There are no headless relationship lines.

The vertical pitch is TIER=162 again: 108, 270, 432. What differs from the sibling card is that this
one has FOUR actors, and they are placed so that not one lane needs more than a single turn:

  - Slot A, top right at 108, is shared by Kubectl Patch and the StorageClass. They are never on
    stage together (Kubectl acts on the edit and the shrink steps, the class only on the gate step),
    so they occupy one slot and send their ball down ONE lane into the claim. Whoever is acting on
    the claim this step stands in slot A.
  - The external-resizer sits right at 432, dead level with the disk, so ControllerExpandVolume is a
    STRAIGHT horizontal into the disk's right edge.
  - Kubelet sits LEFT at 432, mirrored about the spine (its box is the exact reflection of the
    resizer's), so NodeExpandVolume is a straight horizontal into the disk's left edge.

The two phases therefore arrive at the disk from opposite sides at the same height, which is the
composition stating the thing the card is about: the control plane grows the device from one side,
the node grows the filesystem from the other, and the disk between them is the one object both
touch. The 234..306 band in the right column is deliberately left empty so the claim lane can drop
through it without crossing anybody.

Narration overlay: Kubelet sits at x=130, well inside the panel's horizontal reach, and clears it
only on the y axis, at y=396. This clearance was argued from the blanket `y<=300`, which is not a
measurement: the panel bottom is PER CARD and reaches 504 on the longest narration in the catalog.
Kubelet is therefore safe only while this card's own bottom stays under 396, so lengthening any
narration here can put the panel over it. Re-measure with
`node check-geometry.mjs --rules=occluded` after any narration edit.

The one element placed on a MEASUREMENT is the verdict caption left of the claim, anchored end at
x=464, y=274, reaching back to about x=273 on its longest string. This card's own overlay was
measured across viewport widths 1920 down to 900: right peaks at 399 and bottom peaks at 231, both
at the narrow end. The caption clears that bottom by 43 units. Note this card runs 30 units LOWER
than storage-pvc-protection, whose same caption measured 201, purely because the node-expand
narration is longer: the bottom is driven by the text, so it is a per-card number and copying a
sibling's is not safe. LENGTHENING ANY NARRATION HERE INVALIDATES THE 231: re-measure, or move the
caption back to the right of the axis. Nothing else in the card depends on the measurement.
```

### before `const mountLbl = text({ class: 'scheme-label code dim', x: MOUNT_LBL_X, y: MOUNT_LBL_Y, 'text-anchor': 'start'`

```
Lane captions, blank at build and filled per step by setWire. The verdict slot reports the state
of the CLAIM, which changes kind across the card, so it is named for its job rather than for a
lane, and it sits hard against the claim instead of beside a lane it does not describe.
```

### before `const CHIP_W = 252, CHIP_GAP = 24;`

```
A centered four-chip strip, derived rather than hand-placed. These four are the whole lesson:
they hold the same number at the start, then change ONE AT A TIME in order, so the staggered
highlight walking left to right IS the two phase story.
```

### before `[pvc, kubectl, klass, resizer, kubelet, disk].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the blocks and the disk, then every lane above them, then the lane
captions, then the Pod so it sits above the axis that ends on its edge, then the chip strip,
then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step value at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

---

## storage-volume-mode

### before `const LEFT_X = 400;`

```
The sibling of storage-access-modes: accessModes and volumeMode are the two spec fields that sit
side by side on both the PV and the PVC, and this card is the second half of that pair. Where
access modes answer WHO may hold the volume, volumeMode answers WHAT the workload is handed.

Layout (viewBox 1200x640). Storage grammar is a vertical stack, and this card runs TWO of them
side by side inside ONE node, because the fork this card is about happens on the node, in kubelet
and the CSI node service, and not in any control-plane controller. Two Pods on top, the node
service as a full-width band under them, and the two backing disks on the bottom shelf. The disks
are deliberately identical (same size, same class, same backend): the only thing that differs
between the columns is the one field, so anything else that differed would muddy the comparison.

Every hop is a straight vertical run inside a column, and each direction has its OWN lane offset
LANE around the column center, so a mount rising into a container never re-uses the arrow the
request came down. Only Pods pulse. The band and the disks light, never pulse.

---- Horizontal composition ----
Every tier (node, band, disk shelf, chip strip) shares ONE center, CONTENT_CX, rather than each
carrying hand-typed margins. LEFT_X is pinned by the narration overlay, which is HTML laid over
the SVG, so the NARROWER the window the MORE viewBox units it eats. Measured right edge / bottom
edge for THIS card, worst step, by viewport:
  1920x1080 -> 203 / 193    1440x900 -> 319 / 242    1280x800 -> 358 / 282
  1100x800  -> 397 / 304     900x650 -> 398 / 498
So the real worst case is x<=398 and y<=498. LEFT_X 400 therefore has about 2 units of slack and
cannot move left at all. The bottom of 498 is what pins the disk shelf too: the left cylinder
starts at x=410, which clears the overlay by only 12 units at 900x650, so PV_W cannot grow
leftward either. Do not re-derive any of this from a single wide-window screenshot. A narration
longer than the ones below invalidates these numbers and they have to be measured again.

CONTENT_CX works out to LEFT_X + NODE_W/2, and LEFT_X cannot move, so NODE_W is the ONLY lever on
where the whole diagram sits. It is solved for, not chosen: NODE_W 400 puts CONTENT_CX exactly on
600, the canvas center.

That exactness matters because of the chip strip. Every tier here is symmetric about CONTENT_CX,
so at any CONTENT_CX the diagram is internally symmetric and the narrow tiers (node, band, disks)
look fine wherever they sit. The chip strip does not: at 976 units it is more than twice the
width of the node above it, so it is the tier that actually sets the visual center of the card.
An earlier pass ran NODE_W 456 -> CONTENT_CX 628, which left the strip spanning 140..1116, so
140 units of margin on the left against 84 on the right. Symmetric about the diagram, visibly
shoved right on the canvas. Pulling CONTENT_CX to 600 makes the strip 112..1088 and the two
readings agree, so do not widen NODE_W back without re-checking the strip margins.

POD_W then falls out of NODE_W: 2*POD_W + POD_GAP = NODE_W - 2*NODE_PAD = 368. The floor under
POD_W is the widest string inside a Pod, the sublabel 'volumeMode: Filesystem', measured at 133
units, so POD_W 164 keeps ~15 units of air either side of it. POD_GAP takes the remainder.
```

### before `const BAND_LBL_Y = 408;`

```
The band caption sits between the band and the disk shelf, centered on CONTENT_CX, so it runs
through the corridor between the two columns. The nearest lanes are the inner ones at 510 and
690, which leaves 180 units of clear width, and JetBrains Mono at 11px measures 6.9 units per
character (measured, not guessed: 'raw, unformatted' renders 110.2 units over 16 characters).
So a band caption has a hard ceiling of 26 characters. Overrun it and the first and last letters
sit on a lane arrowhead, which is how two captions shipped before this was written down.
```

### before `const PV_Y = 442, PV_H = 96, PV_W = 176;`

```
The disks are centered under their own column, so every lane in a column is one straight vertical
run. Column separation is POD_W + POD_GAP = 204, so PV_W has to stay under that or the two disks
touch. PV_W 176 leaves a 28 unit gap (410..586 and 614..790), enough that they read as two
objects rather than one wide shelf, and it also keeps the left disk starting at 410, which is the
same clearance from the narration overlay the wider layout had.
```

### before `const CHIP_W = 232;`

```
ONE width for all four chips rather than four hand-picked ones. valChip anchors the name 12 from
the left and the value 12 from the right, so a chip needs name + value + 24 plus a readable gap.
Measured worst cases, in viewBox units:
  node does  62 + 'no mkfs, no mount'  117 = 179
  container  62 + 'device /dev/xvda'   110 = 172
  volumeMode 69 + 'Filesystem'          69 = 138
  fsGroup    48 + 'not applied'         76 = 124
So 232 clears the worst pair with ~29 units between name and value.
```

### before `const LANE = 12;`

```
Each direction of each hop gets its own lane, offset LANE around the column center, so a ball
never rides an arrow drawn for the opposite direction. Every array below is shared by the static
pathArrow and the ball that rides it, so the wire and the packet cannot drift apart.
```

### before `function podBlock({ x, label, sublabel, ctr, ctrSub }) {`

```
PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the container box inside it
both live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for
exactly as long as its ball is in flight. What a Pod must NOT have is a lingering state: no
.highlight is ever put on the container box, so nothing stays lit once the pulse has decayed.
(An earlier pass split the shell into its own wrapper to keep the pulse off the container. That
made the Pod blink around a dead rectangle, which reads as the container being excluded from
whatever the Pod is doing. The problem was never the pulse, it was the highlight left behind.)
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `[nodeBox, band, pvFs, pvBlk, podFs.group, podBlk.group].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the node container, then the band and the disks, then the Pods so
they sit above their node, then the lanes and their labels above the blocks, then the chip
strip, then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText
still holds the previous step's text at call time (clearHL clears the class, not the text) and
steps are always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function publishUp(s, ctx, { podEl, points, tag, lead = BEAT.lead }) {`

```
The node service hands the volume up into the container. Semantically this is infra reaching a
Pod, so it takes the down-arrow ordering: the packet flies first and the Pod shell pulses on its
arrival. The container box is never lit, here or at step entry: see podBlock.
```

### before `setChips(s, { mode: 'Block', nodeDoes: 'no mkfs, no mount', container: 'device /dev/xvda', fsgroup: 'not appli`

```
The chips still report the Block column, unchanged from the previous step. An earlier pass
put 'immutable' in the volumeMode chip, which made the chip contradict its own name: the
mode is Block, immutability is a property of the field, not a value it can hold. That fact
lives in the narration and the band caption instead.
```

### before `s.refs.pvFs.classList.add('highlight');`

```
The summary step compares the two columns, so BOTH disks light. Static highlight only, and
deliberately no motion at all: this is a closing step the reader is meant to sit and read,
and the two disks are the comparison, not an event. The usual argument for a flash on a
packet-less step (so it does not read as a frozen frame) does not apply to the LAST step,
which is supposed to come to rest. A flash here also blinked the disks a beat after the
narration had already moved on to fsGroup and subPath, which points at nothing.
```

### poster

```
Two columns, one difference. The whole poster is an ASYMMETRY between two otherwise identical
stacks: same container on top, same disk at the bottom, and the only thing that differs is what
happens on the way down. The left lane is interrupted by a gate (the mkfs the node service runs)
and its disk carries file lines, because there is a filesystem in it now. The right lane runs
straight through, dashed and unbroken because nothing acts on it, and its disk is left empty.
Not a fork out of one object: these are two separate claims, so drawing them as one splitting
would say the wrong thing (and would also collide with the reclaim-policy poster below, which
IS a fork). The empty right-hand disk is load-bearing: the point of Block is the absence.
File lines are inset inside the cylinder FACE (below the cap rim at 118, above the bottom arc
at 160), not centered on the bounding box, or they ride up over the rim.
Column centers are 88 and 232, not the 70 and 250 this first shipped at. At the wider spacing
the two stacks sat against the left and right edges with a dead 96 unit corridor between them,
so the poster read as two unrelated drawings rather than one comparison. Pulled in to a 60 unit
gap against 46 unit outer margins, which puts more air outside the pair than inside it and
makes them read as a pair. The asymmetry between the columns is the content, so the spacing
has to stay symmetric or it competes with it.
```

---

## storage-volume-model

### before `const SPINE_X = 600;`

```
THE ANCHOR CARD of the storage category. Storage grammar is a VERTICAL STACK centered on the
canvas: the consumer (a Pod holding two containers) on top, the backing volume as a disk on the
shelf below, and the recurring gesture is a MOUNT travelling the lane between a container and the
disk. The whole stack is centered on SPINE_X so the diagram sits in the middle of the player.

GEOMETRY. The Pod sits BELOW the narration overlay (measured at (335, 143) for this card, pod top
at 150 clears it), which frees the full canvas width: the Pod is stretched to 600 and the two
containers are pushed toward its edges, so each container center lands OUTSIDE the cylinder span.
That is deliberate: the mount lanes are L-shaped, dropping straight from a container and entering
the cylinder through its SIDE, symmetric left and right about the ownership spine.

The point of the card is OWNERSHIP. A volume is declared ONCE at spec.volumes (Pod level) and each
container mounts it at volumeMounts, possibly at a different path. The volume belongs to the POD,
not to any container, so it survives a container crash and is shared between containers, and it
dies only when the Pod dies.

PULSE MODEL: the Pod is one unit and blinks as one, both containers included, because the pulse
takes the whole Pod group. (Reversed 2026-07-29: this note recorded the 2026-07-16 rule, which
pulsed the shell alone.) HIGHLIGHTS ARE STEP-STATIC: every block a step uses
lights at step entry (above the reduced guard) and stays lit for the whole step, and the Pod pulse
fires at the same instant, so pulse and highlights land in one beat. The balls only illustrate the
traffic, they no longer drive highlight timing. The volume is infrastructure: it lights, never
pulses. Step 1 (declare) is the exception: the Pod is not acting, so only the volume lights.

WIRES: the center OWNERSHIP SPINE (x=SPINE_X, dim, no arrowhead) links the Pod to its volume,
because ownership is a relationship, not traffic. The two L-shaped MOUNT LANES are brighter bare
channels that carry a ball in whichever direction the step needs (mount out, write in, read out),
so the ball shows direction. Balls ride routePacket (eased, routeDur speed) and every riding
label shares the same points, duration and easing so it stays glued to its ball.
```

### before `const LANE_DX = 10, LANE_DY = 10;`

```
Balls travel BOTH directions, so each side carries a PAIR of one-way L-shaped lanes, offset
LANE_DX around the container center (the pair is centered on its block) and LANE_DY around the
cylinder midline so the horizontal runs do not overlap. Each lane has its own arrowhead showing
its one direction: the UP lane points into the container (mount, read), the DOWN lane points
into the cylinder side (write). Every array is shared by the static pathArrow and its ball.
```

### before `function setChip(chip, val) {`

```
Sets each chip and statically highlights the ones whose value CHANGES on this step: a status chip
that changes is lit for the step, a chip that stays the same is not. The chip still holds the
previous step's text at call time (clearHL clears the highlight class, not the text), and steps are
always entered in order (gotoStep rebuilds then replays 0..target), so this diff is deterministic.
Highlight, never flash: chips glow within the steps that touch them.
```

### before `s.refs.volume.classList.add('highlight');`

```
Only the app and the volume are involved (the log shipper is untouched), so those two light
for the whole step (static highlight only, no crash flicker: rejected as too blinky) and
the Pod pulses with them, one beat.
```

### before `setChips(s, { vol: 'gone with Pod', mounts: 'unmounted', data: 'lost' });`

```
The Pod and its volume are gone. The chips flip to gone / unmounted / lost and the whole
stack (Pod, volume, lanes, spine, ownership label) settles to a ghost so the picture
matches the words. Ghost opacities are pinned statically so reduced motion and a mid-step
cancel land on the dimmed state, the fade below only eases into it.
```

---

## storage-volume-snapshot

### before `const CX = 600;`

```
Volume Snapshots. The snapshot API mirrors the volume API exactly: VolumeSnapshot is the namespaced
request (like a PVC) and VolumeSnapshotContent is the cluster-scoped object it binds to (like a PV).
The snapshot data physically lands BESIDE the source volume, in the same storage system, which is
exactly why a snapshot is not a backup.

---- Who does what, and in which order ----
This is the part the card gets right and most diagrams get wrong. TWO components are involved and
they are not the same thing (kubernetes-csi docs, snapshot-controller and external-snapshotter):
  snapshot-controller   one per cluster, shipped independently of any CSI driver, "watching the
                        Kubernetes API server for VolumeSnapshot and VolumeSnapshotContent CRD
                        objects". In dynamic provisioning it is the component that CREATES the
                        VolumeSnapshotContent object and binds it one to one, and that creation is
                        what "triggers the CSI external-snapshotter sidecar".
  csi-snapshotter       the sidecar next to the driver. From v4.0.0 (beta and GA) it "only watches
                        the Kubernetes API server for VolumeSnapshotContent CRD objects", never the
                        VolumeSnapshot, and it is "responsible for calling the CSI RPCs
                        CreateSnapshot, DeleteSnapshot, and ListSnapshots".
So the object exists BEFORE the snapshot is taken, and the sidecar never reads the user request.
An earlier version of this card had the sidecar pick up the VolumeSnapshot itself and then write the
Content afterwards, carrying the handle, which inverts both the actor and the causality.

---- Horizontal composition ----
Three bands, every one of them centred on CX, and the widest of them (the chip strip at 112..1088)
sets the margins the rest answer to:
  top    the two objects the USER writes: VolumeSnapshot snap-1 centred on CX, and the restore claim
         beside it on the right, joined by the dataSource reference. The top-left is unusable (the
         narration overlay lives there), so the request box starts at x=420 and the pair leans right,
         which is what balances the panel rather than fighting it.
  middle the control plane, RIGHT TO LEFT in the order the story runs: the controller that creates
         and binds (940), the object it creates (600), the sidecar the object wakes (260). 232 wide,
         the storage family default. The direction is not a preference, see the overlay note below.
  bottom the storage backend, holding all three disks so the shared-fate point is made by the picture
         rather than by the caption: source, snapshot, restore, left to right in the order they exist.
The Content sits on CX so the two lanes it shares with the request run as one straight vertical on
the centre line of both blocks, and the snapshot disk sits on CX under it so the CreateSnapshot
zigzag lands on that same line.

---- Vertical composition ----
Every horizontal run of every zigzag sits at the MIDPOINT OF THE TWO BLOCKS IT JOINS, and both frame
insets are equal, so the whole column is symmetric and nothing is pinned to a free gap:
  36    canvas top margin
  36    VolumeSnapshot request and restore claim   68 tall, to 104
  157   request corridor                          53 below the request box, 125 above the mid row
  282   middle row                                68 tall, to 350
  378   CreateSnapshot corridor                   28 below the mid row, 18 above the frame
  396   storage backend frame                     174 tall, to 570
  438   disks                                     90 tall, to 528, frame insets 42 above and below
  552   disk captions                             18 above the frame floor
  588   chip strip                                34 tall, to 622
  18    canvas bottom margin

The middle row and everything under it dropped 72 units in R5 (2026-07-27), which is why the two
corridors are no longer the centred midpoints they were: the request corridor stayed at 157 (it is
pinned by the overlay, see below) and the CreateSnapshot corridor is now placed off the frame, 18
above it, rather than halfway. Halfway would put it at 373, five units from the frame edge.

---- Narration overlay ----
Measured (tools/overlay-measure.mjs), overlay bottom-right in viewBox units:
  1920x900  right 102  bottom 163
  1600x1000 right 291  bottom 143
  1440x1080 right 335  bottom  94
  1280x900  right 378  bottom 152
  1100x900  right 397  bottom 149
  1280x860  right 397  bottom 280   <- added 2026-07-27
  1100x800  right 397  bottom 280   <- added 2026-07-27
The last two rows are the ones that matter, and they are 117 units deeper than anything the earlier
sample saw, because a SHORTER window (860 and 800 tall against 900 and 1080) shrinks the diagram
while the panel, which is HTML at a fixed size, keeps its pixels and so eats more viewBox units.
Those are the viewports the occlusion rule samples. Worst case: x <= 397 and y <= 280.

Two things follow, and together they are the whole R5 relayout of this card:
  1. The middle row is three 232 wide boxes on one line, so its LEFT box lands at 144..376 whatever
     the spread. At y=210 that box was 100 percent behind the panel. The row therefore starts at
     282, below the floor, and the frame and disks move down with it.
  2. The request from the top row has to REACH that left box, and any lane that goes there from
     above crosses the panel band on its way. So the chain runs right to left: the controller, the
     one box the request addresses, sits at 940 where the lane can reach it in the clear, and the
     content and the sidecar follow leftward. The request corridor can then stay at 157, where only
     the viewports with a SHALLOW panel reach right of it.
The request box at y=36 sits inside the y band, so it starts at x=420, clear of the widest measured
panel by 23. A longer narration than the ones below would invalidate all of this: re-measure.

PULSE MODEL: nothing pulses and nothing blinks. There is no Pod on this card, and every block is
infrastructure that lights via .highlight, on packet arrival where there is a packet and at step
entry where there is not. The class step carries no packet, and the canon would allow it the one
sanctioned block blink so it does not read as frozen: it is deliberately NOT taking it. That step
states a fact rather than moves something, and a brightness blink on a block that is only being
pointed at reads as traffic that never arrives. Do not add it back.

WIRES: three of them are zigzags (down, across, down) and all three are drawn symmetric, with the
horizontal run exactly halfway between the block it leaves and the block it enters: the request into
the controller (53 and 53), CreateSnapshot down into the snapshot disk (60 and 60), and the answer
back up out of that disk (60 and 60). The answer lane is the create lane mirrored: same corridor,
same columns, opposite arrowhead, and it leaves through the TOP of the disk rather than a side face.
The two never appear in one step, which is what makes sharing the corridor safe, and the same is
true of the two lanes that meet the request box from below, which is why both run dead centre on it
rather than taking a side each. The ONE remaining link that carries no ball is the dataSource
reference across the top band, dashed and undirected because it is a reference and not a route. The
binding between the request and its content is stated by the request sublabel and the Content chip
instead of by a line: an undirected dashed line hanging under the request box, in the same column
two directed lanes use on the steps either side of it, read as a third route that never runs.
```

### before `const RST_X = 840, RST_W = 240;`

```
The restore claim is a user-authored object exactly like the snapshot request, so it belongs in the
same band rather than down among the controllers. Sitting beside snap-1 also turns its dataSource
into a 60 unit horizontal reference between two adjacent boxes, which is the shortest honest way to
draw "this claim names that snapshot".
```

### before `const CYL_W = 176, CYL_H = 90;`

```
The disks sit DEAD CENTRE in the backend frame: one inset, used both above and below, so the frame
is sized from its contents rather than typed. The top band carries the frame label (node() puts its
label baseline 18 below the frame top) and the bottom band carries the disk captions, and the two
bands come out the same height, which is what makes the frame read as a container rather than as a
box with its contents pushed up. FRAME_Y is then the one number that positions the whole backend,
and it is set so the CreateSnapshot corridor clears the frame edge (see CORRIDOR_Y).
```

### before `const CORRIDOR_Y = FRAME_Y - 18;                            // 378`

```
The horizontal run of a zigzag belongs at the MIDPOINT OF THE TWO BLOCKS IT JOINS, and until R5 both
of these were measured that way. The middle row then dropped 72 units to clear the panel and the two
gaps stopped being alike, so each corridor is now pinned to what it must not touch:
  CORRIDOR_Y     18 above the frame edge, so the lane and the frame do not read as one doubled dashed
                 line. That clearance is FRAME_INSET / 2. The midpoint of the mid row bottom (350)
                 and the disk top (438) is 394, which is INSIDE the frame, so the old rule cannot be
                 kept here: the gap it used to halve is now 28 units of it and 60 of frame inset.
  REQ_CORRIDOR_Y unchanged at 157, 53 below the request box and 125 above the mid row, so it is
                 pinned rather than centred too. It used to run LEFT to x=260 and had to answer to
                 the narration overlay for it (see the measured table above): the lane cleared every
                 measured panel floor but the tag riding it would not, which is why that hop still
                 rides its label BELOW the ball (dy 22). It now runs RIGHT to x=940 and the overlay
                 no longer reaches it at all. The label offset is kept because it also keeps the tag
                 off the request box floor, which the ball leaves from.
```

### before `const CAPTION_Y = CYL_Y + CYL_H + 24;             // 552`

```
The disk captions sit BELOW the disks, inside the frame. Above them they would collide with the tag
riding the CreateSnapshot hop, which lands on a disk top: the two strings print over each other into
one unreadable smear. 24 below the disk leaves 18 to the frame floor.
```

### before `const W_REQ_CTRL  = [[CX - REQ_LANE, REQ_BOTTOM], [CX - REQ_LANE, REQ_CORRIDOR_Y], [CTRL_CX, REQ_CORRIDOR_Y], [CTRL_CX, MID_Y]];`

```
The two lanes that touch the request box bottom face are a mirrored pair, 16 either side of its
centre. They ran dead centre on it until R5, which was right while the request went down the middle
of the card and the status came back up the same middle: they never shared a step, so neither needed
a lane of its own. Now the request turns right to reach the controller at 940 while the mirrored
status still climbs straight out of the Content at 600, so the two would sit on top of each other
for the whole run between the request floor and the corridor. 16 is small enough to read as one
column with two directions and, at 7 percent of a 232 wide face, still counts as centred on the
Content top face at the other end.
Each static wire and its ball share ONE points array, so they cannot drift apart. Every endpoint is
a block edge midpoint.
```

### opacity phases (was `const PLACEHOLDER = 0.4`, now OPACITY.pending)

```
PLACEHOLDER is the dim an object is drawn at while a lane already points AT it but it has not been
created yet. Hiding it outright leaves the arrowhead aimed at blank canvas for the whole flight,
which reads as a rendering fault rather than as an absence.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'snapshotHandle' + 'snap-0c41' at 23
characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 23 * 6.89 + 24 of
padding is 183 against the 232 available.
```

### before `[frame, req, restore, ctrl, vsc, snapper, src, snapData, restored].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the backend frame, then the blocks and disks, then the lanes and their
captions above them, then the chip strip, then the packet layer so every ball rides above
everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setStage(s, { vsc = OPACITY.pending, restore = 0, snapData = OPACITY.pending, restored = OPACITY.pending, ds = 0, lanes = [] } = {}) {`

```
Pins the visibility of EVERY element born mid-story, and of every lane, exactly as setChips pins
every chip. A lane into an object that does not exist points at nothing, so lanes are pinned to 0
rather than left at whatever the previous step happened to set.

The three objects that live INSIDE a structure default to PLACEHOLDER rather than to 0: the content
in the middle row and the two disks that do not exist yet in the backend frame. Hiding them outright
leaves a block-sized hole in a row and a frame three quarters empty around one floating disk, which
reads as a rendering fault rather than as an absence. The restore claim is the exception and stays
at 0, because the top band holds nothing else on that side, so its absence leaves no hole to explain.
```

### before `duration: 5200,`

```
Three chained hops: the content waking the sidecar, the CreateSnapshot call down into the
backend, and the copy taken on the shelf once the target has materialised. Routes are
length-based, so re-measure with anim-dump after ANY geometry change here.
```

### before `s.refs.snapData.classList.add('highlight');`

```
The snapshot data is where the answer departs from, so it is lit at entry. The controller is
lit for the whole step because the last hop, the status mirrored onto the snapshot, is its
work: the ball runs straight up the bound column rather than detouring through the block.
```

### poster

```
One volume with one instant lifted off it. The SAME cylinder is drawn twice on the x=160 axis:
whole and live below, a thin frozen slice of it above, joined by a dashed riser on the axis. Both
bodies are the same width because it is one volume seen twice, not two volumes, and the slice
carries the brightest fill on the poster because it is the thing the card is about. Four elements
and one line, which is the whole poster: no frame, no API objects, no restored disk.

Deliberately VERTICAL, because storage-pvc-clone is the horizontal pair (two disks side by side
with a copy running between them) and the two cards sit in the same subcategory row. A clone is a
second disk, a snapshot is a moment of the same disk, and the two posters have to say that apart
at 200px wide. Mirror-symmetric about x=160, bodies 132 wide with 94 of margin a side: sized to sit
level with the disks on the neighbouring posters rather than to fill the frame, because at 168 wide
it outweighed every card around it in the row.
```

---

## storage-volumeattachment

### decision: the backend is named but not drawn, on purpose (2026-07-29)

Reviewed under family K of item 2.4 and left alone. The `status` and `detach` steps say "when the
backend confirms the attach" and "only when the backend has detached", and this card draws no
storage-backend block. Both are subordinate time clauses rather than the visible action of the
step, so the reader is not being pointed at a missing box. Do not file these again.

### before `const M = 60;`

```
VolumeAttachment (viewBox 1200x640).

The point of the card is WHO owns the attach. Not the Pod, not kubelet: the attach and detach
controller inside kube-controller-manager writes a VolumeAttachment, the external-attacher watches
it and calls ControllerPublishVolume, and on success stamps status.attached true back onto the same
object. Kubelet is blocked on that one field the whole time. Deleting the object is what triggers
detach. So the composition puts the whole control-plane chain in ONE column and the node in the
other: every arrow that crosses between them is a read or a write of the object, which is exactly
the relationship the card is about.

---- Horizontal composition ----
The narration overlay is HTML laid over the SVG, so the NARROWER the window the MORE viewBox units
it eats. Measured right edge / bottom edge for THIS card, worst step, by viewport:
  1920x1080 -> 203 / 146    1440x900 -> 319 / 183    1280x800 -> 358 / 213
  1100x800  -> 397 / 205     900x650 -> 398 / 344
So the real worst case is x<=398 and y<=344: a rectangle over the TOP-LEFT quadrant only. A
narration longer than the ones below invalidates these numbers and they have to be measured again.

That is an L-shaped usable area, and the previous pass read it as a box instead: it pinned the
diagram to x>=400 AND kept it centred on the canvas, which forced BAND_W to 400 and left the two
columns 176 wide, squeezed into the middle third of a 1200 unit canvas under a 980 unit chip
strip. The card looked like it was rationing space it had plenty of. This pass uses the L:

  TOP BAND     y 24..420, x 400..1140. Everything the overlay forbids lives here, and it now runs
               flush to the right content edge instead of stopping at 800. That buys 340 units,
               which go into the blocks (176 -> 232 wide) and the corridor between the two columns
               (48 -> 208), so the card is roomier BOTH inside the boxes and between them.
  BOTTOM LEFT  x 60..400, y >344. Free, and empty in the previous pass. The disk moves into it.
  CHIP STRIP   the full content band 60..1140, so the widest tier is also the canvas-centred one.

Moving the disk out from under the columns is not only a space fix. The disk is REMOTE storage that
has to be attached to a node, and drawing it directly beneath node-1 quietly said it was already
local to it. Off in its own corner, with a long ControllerPublish call reaching across the whole
card to get to it, the picture says what the narration says.

---- Block size ----
BOX_W / BOX_H are storage-csi-architecture's block size, which is the size the catalog reads as a
"server" box: its Kube-apiserver, CSI controller driver and Cloud storage API are all SIDE_W 232,
and its rows run 68 to 76 tall. Matching it is what makes this card sit in the same family rather
than looking like a different diagram set, and it is a SIZE match only: the spacing between the
blocks is this card's own and is not touched by it.

It also clears the widest string inside a right-column box comfortably, the sublabel
'watches VolumeAttachment'. That is a .scheme-box-sublabel at 10px JetBrains Mono, which measures
6.03 viewBox units per character, so the sublabel is 144.7 units and BOX_W 232 leaves 43.6 units
of air either side of it, against 15.6 before this pass.

The rate is PER CLASS, and mixing them is how this comment was wrong on its first pass. There is
no single units-per-character for the card: 10px mono sublabels are 6.03, 11px mono chip text and
dim code labels are 6.89, and 12px Space Grotesk box labels are proportional (6.0 to 6.7 depending
on the letters). Measure the class you are actually sizing, and await document.fonts.ready first
or you will measure the fallback monospace, which is about 20 percent narrower than the webfont.
```

### before `const LEFT_X = 400;`

```
LEFT_X is the overlay wall: 398 measured, 400 taken, and it cannot move left. The node frame hangs
off it, and the control-plane column is right-ALIGNED to CONTENT_R rather than sized to fill, so
the top band and the chip strip share a right edge while the blocks stay at BOX_W.
```

### before `const NODE_Y = 24, NODE_H = 396;                         // 24..420`

```
---- The node column ----
node-1 is drawn as a real node() frame rather than left implicit, because "this disk is on THAT
node" is the whole claim the VolumeAttachment makes, and a card about it with no node on screen
makes the reader supply the most important half. Pod on top, kubelet at the bottom, and the gap
between them is where the mount lane runs.

The Pod is 226x110, the catalog Pod size (storage-csi-attach-mount uses it for both of its Pods),
up from 148x118. A Pod is a shell around an inner box, so it is the one block that does not take
BOX_H. Kubelet takes BOX_H, but its WIDTH follows the Pod rather than BOX_W: the two are stacked
on the same centre line, so at 232 against 226 their edges missed by 3 units a side, which reads
as a rendering slip rather than as two different sizes. Six units is invisible between columns and
glaring within one, so the node column aligns to itself and the control column keeps BOX_W.
```

### before `const ROWS = 3;`

```
---- The control-plane column ----
Read top to bottom it is the causal order: the controller decides, the object records, the attacher
acts. Every hop inside this column is therefore a straight vertical run and nothing crosses. Its
bottom edge is pinned to the node frame's, so the two columns are one band and the lane that
leaves the attacher for the disk clears BOTH of them at the same height.

All three are BOX_H, and the ROW GAP is solved rather than typed: three equal blocks are spread
across the node frame's exact vertical span, top edge on its top edge and bottom edge on its
bottom edge, which leaves 84 units between rows. Nothing here is hand-placed, so changing BOX_H
or the frame height re-solves the column instead of stranding one row.
```

### before `const DISK_W = 200, DISK_H = 114;`

```
---- The disk, bottom left ----
Sits in the quadrant the overlay leaves free (x<400 needs y>344). DISK_Y 400 clears that by 56, and
the caption above it at 386 clears it by 42. It is 200x114 rather than 152x96: it is now the only
object on its side of the card, so it carries that side on its own.
```

### before `const DISK_LBL_Y = DISK_TOP - 14;                        // 386`

```
The caption goes ABOVE the disk, not below it. Below is where the ControllerPublish lane runs, and
under that is the chip strip: there is no room for a text line between them that is not sitting on
one or the other. Above, the whole strip from the overlay floor to the disk cap is empty.
```

### before `const CHIPS_Y = 592, CHIP_H = 34;                        // 592..626, 14 clear of the viewBox`

```
ONE width for all four chips, and the strip spans the card's own margins, CONTENT_L..CONTENT_R.
It used to run from the DISK's left edge (130) to the control column's right edge (1140), on the
argument that both ends were then real block edges and the strip could not drift if a column moved.
That is true and it is still the wrong span: 130..1140 has its centre at 635, and the chip strip is
the one tier on any card that is free to sit on the canvas centre, since nothing above it constrains
it. R5 moved the left end to the margin (2026-07-27). The 70 units it gains on the left are exactly
the empty bottom-left corner it used to leave, and CHIP_W grows with them.

valChip anchors the name 12 from the left and the value 12 from the right, so a chip needs
name + value + 24 plus a readable gap. Measured worst cases, in viewBox units. Chip text is
.scheme-chip-text at 11px JetBrains Mono, which measures 6.89 per character (monospace, so the
rate has zero variance):
  status.attached  103.4 + 'no object' 62.0 + 24 inset = 189.4   <- the binding one
  VolumeAttachment 110.3 + 'deleted'   48.2 + 24 inset = 182.5
  disk on node-1    96.5 + 'yes'       20.7 + 24 inset = 141.2
  kubelet           48.2 + 'released'  55.1 + 24 inset = 127.3
The strip's width sets the chips', so this is the number to re-check whenever it moves: CHIP_W falls
out at 258 (240.5 while the strip started at the disk), which clears the binding pair with 69 units
between name and value. It is the floor that matters, not the exact value: below ~190 the longest
name and value would touch.
```

### before `const LANE = 40;`

```
Each direction of the VolumeAttachment conversation gets its OWN lane, offset LANE around the
column centre, so the status write never rides the arrow the watch came down. Every array below is
shared by the static pathArrow and the ball that rides it, so the wire and the packet cannot drift.
The wider column lets LANE grow 26 -> 40, which is what makes the watch and the status write read
as two lanes at a glance rather than as one thick one.
```

### before `const PUBLISH_JOG_Y = DISK_BOTTOM + 32;                  // 546`

```
The publish call runs the whole width of the card, which is the point: the attacher is talking to a
storage backend that is nowhere near the node. Its horizontal leg is hung BELOW the disk rather
than above it, because above it there is no room: the disk cap is at 400 and both columns end at
420, so a lane between them would be drawn through the node frame. A ridingLabel sits 14 above its
ball, so 'ControllerUnpublish' rides at 532 on this leg, 18 clear of the disk face and 60 clear of
the chip strip. Derived from DISK_BOTTOM, so the lane follows the disk if the disk moves.
```

### before `const W_GATE    = [[COL_R_X, VA_CY], [CORRIDOR_X, VA_CY], [CORRIDOR_X, KUBE_CY], [KUBE_RIGHT, KUBE_CY]];`

```
The only lane that crosses the corridor: the object gating the node. It leaves the VolumeAttachment
at its vertical middle, runs down the corridor at CORRIDOR_X, and enters kubelet from the right,
while W_ONNODE enters from below. Nothing else uses the corridor, so this route crosses no other
wire anywhere on the card, and neither does any other lane: the card has zero wire crossings.
```

### opacity phases (was `const DISK_DIM = 0.3`, now OPACITY.*)

```
The disk stays on canvas after the detach because it still exists in the backend, it is just no
longer on this node, so it dims rather than leaving. That is a STATE, not a placeholder, which is
why it is the one dim left on this card: the Pod used to sit at 0.5 for five of the seven steps as a
stand-in for "not started yet", and a block held at half strength next to full-strength neighbours
reads as a rendering fault rather than as a state. The Pod is now simply present, and it leaves the
canvas entirely on the step where the narration says it is gone.
```

### opacity phases (was `const VA_PLACEHOLDER = 0.45`, now OPACITY.pending)

```
The same dim, for the same reason, on the VolumeAttachment box: on the steps where the object does
not exist (before the controller writes it, and after it is deleted) the box stays drawn as a slot
rather than vanishing. At full strength it would contradict the narration, and at zero it left a
block-sized hole in the middle of the control column. Dim is the third answer: the reader sees
where the object goes, reads 'not created yet' under it, and watches it come up to full on write.
```

### before `function fadeTo(el, ctx, from, to, delay = 0, dur = LAND_MS) {`

```
The mirror of lightBoxAt for everything that arrives or leaves rather than lighting: a construction
materialising, the Pod going away, the disk coming off the node. Under ctx.reduced it snaps to `to`,
which is what keeps a prev/reset replay landing on the correct static state.
```

### before `function podBlock() {`

```
PULSE MODEL: the Pod is ONE unit and it blinks as one. The shell and the App box inside it both
live in `group`, and `group` is what gets pulsed, so the whole Pod lights up together for exactly
as long as its ball is in flight, and nothing is left lit afterwards: no .highlight is ever put on
the App box. The wrapping g is not optional. pulsePod finds its targets with querySelectorAll,
which matches descendants only and never the element itself, so pulsing a bare pod() would catch
its .scheme-pod-rect child but not the group, and the pulse would silently fire at half strength
(the anim-dump symptom is strokeOpacity rows with no filter row).
```

### before `const nodeBox = node({ x: COL_L_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
Block LABELS capitalize the FIRST word only, and a later word takes a capital only when it is an
API object, an acronym or an identifier. A HYPHENATED name likewise capitalizes only its first
segment, since it is one identifier rather than a
phrase (External-attacher is the name of one binary). Bare identifiers keep their real casing:
va-7f, web-0, vol-1, and node-1, which .scheme-node-label uppercases to NODE-1 in CSS. That
uppercase form is catalog-wide and every node frame in every card carries it, so it is left
alone here: a card-local override would make this the one node that is titled differently.
Sublabels and narration stay lowercase prose, so kubelet is Kubelet on the box and kubelet in
a sentence.
```

### before `const diskLabel = disk.querySelector('.scheme-cylinder-label');`

```
The primitive centres the label on the raw bbox, which reads high because the top cap ellipse is
not part of the visible front face. Re-centre on the face, as storage-volume-model does. Derived
from DISK_H rather than typed as a literal 58, so it follows the disk if the disk is resized.
```

### before `const wWrite = mkWire(W_WRITE), wWatch = mkWire(W_WATCH);`

```
The four lanes that BELONG TO the VolumeAttachment: written by the controller, read by the
attacher, written back by the attacher, and read by kubelet. They live and die with the object
(see setBorn), because a lane into an object that does not exist is a lane to nowhere.
```

### before `const wMount = mkWire(W_MOUNT);`

```
The mount lane is the exception: it is the lane INTO the Pod, so it belongs to the Pod and is
pinned by the same flag (see setBorn). When the Pod leaves on the detach step the arrow that
fed it has nothing left to point at, and an arrowhead aimed at empty canvas reads as traffic
to a block the reader has simply failed to spot.
```

### before `va.style.opacity = String(OPACITY.pending);`

```
BORN MID-STORY, but the SLOT is drawn the whole time. The VolumeAttachment does not exist until
the controller writes it on step 3, and the whole card turns on that, so the object cannot be at
full strength in the opening frame while the narration says "no such object exists". Removing it
outright is worse though: it leaves a block-sized hole in the middle of the control column, which
reads as a rendering fault rather than as an absence. So the box is drawn at VA_PLACEHOLDER, the
same dim the disk uses for "exists but not here", with the sublabel saying 'not created yet'.

Its four LANES are the part that genuinely goes away: an arrow into an object that does not
exist is an arrow to nowhere, and unlike the box it leaves no hole when it is gone. So the two
are pinned separately, and the write step brings them up together.
```

### before `const writeLbl = text({ class: 'scheme-label code dim', x: COL_R_CX + 12, y: (ADC_BOTTOM + VA_TOP) / 2 + 4, 't`

```
Only two static wire captions, and both sit where there is measured room for them. The write
caption is anchored 12 right of the W_WRITE lane, in the gap between the controller and the
object, so it has 1140 - 1002 = 138 units, 20 characters at 6.89. The disk caption is centred
on the disk in the empty strip above it: its longest string is 35 characters, 241 units, which
centred on DISK_CX spans 110..350 and so clears both the left margin and the node frame.
Everything else the traffic needs to say is carried by a ridingLabel instead: the inter-row gaps
in the control column cannot hold a static caption without it landing on a lane arrowhead.
```

### before `[nodeBox, adc, va, att, disk, appPod.group, kube].forEach(el => root.appendChild(el));`

```
Z-order (bottom -> top): the node frame, then the control-plane boxes and the disk, then the
Pod and kubelet so they sit above their node, then the lanes and their captions above the
blocks, then the chip strip, then the packet layer so every ball rides above everything.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### before `function setChips(s, { va, attached, disk, kubelet }) {`

```
Every step writes EVERY chip. A chip left unset keeps the previous step's value, which on a card
whose whole subject is one object changing state is the fastest way to tell the reader a lie: the
strip has to be readable as the object's current record on any step you pause on.
```

### before `function setBorn(s, { object = OPACITY.pending, lanes = 0, pod = 1 } = {}) {`

```
Every step pins the visibility of everything born mid-story, exactly as setChips pins every chip, so
a step can never silently inherit a block or a lane from the one before it. The object and its four
lanes share ONE flag because they are one construction, and the Pod carries its own because it is
present from the first frame and leaves on the last.
```

### before `narration: 'It is not Kubelet that decides a volume needs attaching. The attach and detach controller runs inside kube-controller-manager, sees a Pod bound to a Node with a volume that is not attached there, and takes ownership of making it happen.',`

```
NO pulse here, and that is deliberate. The Pod used to blink on this step, on the grounds that
it is the reason an attach is needed. But this is the step the poster auto-plays into, about a
second after the card opens, so the blink landed on a frame the reader had only just started
looking at and read as a flicker in the render rather than as a beat. The step is also not
ABOUT the Pod: the narration is about who owns the decision, and the owner is the controller.
So it is now a packet-less, pod-less step where the subject registers by lighting and staying
lit, exactly as storage-csi-architecture's 'core' and 'controller' steps do. No block flash
either, for the same reason that card gives: a set of boxes to be read, not a beat to notice.
```

### before `duration: 4800,`

```
Three chained hops, and the middle one now crosses the whole card: routeDur is length-based, so
the 952-unit publish call runs 2116ms on its own and anim-dump puts the step span at 4276 (the
last hop lands at 3716, and its ripple and fade-out run on past that). The duration went
3400 -> 4800 with the layout, not as a taste change: below 4276 the auto-advance cuts the call
off before it reaches the disk. 4800 keeps 524ms of headroom.
```

### before `const watch = routePacket(s, ctx, W_WATCH, { role: 'storage' });`

```
Three chained hops, each leaving BEAT.afterHop after the previous one lands: the attacher
reads the object, calls the driver, and the disk surfaces on node-1. No Pod is involved in
any of them, so nothing pulses, the blocks light on arrival.
```

### before `const mount = routePacket(s, ctx, W_MOUNT, { delay: gate.arrivalMs + BEAT.afterHop, role: 'storage' });`

```
Infra reaching a Pod, so it takes the down-arrow ordering: the ball flies first and the Pod
blinks on its arrival. The Pod is already at full strength, so the mount landing is signalled
by the pulse alone rather than by an opacity ramp out of a dim placeholder. The App box inside
is never given a .highlight, here or at step entry: the blink is the whole signal and it has
to end when the ball does.
```

### before `duration: 4600,`

```
Four beats (Pod leaves, attacher reads the deletion, object leaves with its lanes, disk comes
off), and the unpublish call is the same full-width route as the attach step, so anim-dump puts
the span at 4276 against 2860 before the layout change. 4600 keeps 324ms of headroom.
```

### note (anchor dropped: `setBorn(s, { object: VA_PLACEHOLDER, lanes: 0, pod: 0 });` is not unique in the file)

```
The end-state of the card is the mirror of its opening frame: no Pod, no object, no lanes into
the object, and the disk off the node. Pinned statically here so a reduced replay or a cancel
mid-step lands on the torn-down state rather than the lit one.
```

### before `setBorn(s, { object: 1, lanes: 1, pod: 1 });`

```
Played in the causal order the narration gives. The Pod goes first, which is what frees the
volume. Then the attacher reads the deletion, and the object leaves WITH its four lanes, the
same construction that arrived together on step 3. Then the unpublish call reaches the disk.
```

### before `gone.onfinish = () => s.refs.va.classList.remove('highlight');`

```
va-7f is the subject of the step and is lit from entry as the source of the watch, but it does not
KEEP that light once it is gone: the class comes off when the fade to the terminated shade finishes,
so the static path has nothing to mirror and does not light it at all.

This was settled on 2026-07-30 after a first pass went the other way and mirrored the highlight onto
the static path instead. Both readings end the step consistently, so the tie is broken by the rule
already in the gate: check-opacity LIT says nothing may hold .highlight at the terminated shade,
because a block that is gone cannot also be the thing the step points at. LIT reads inline style on
the played path only, so it sees neither version here, which is exactly why the answer has to be
written down rather than left to whichever card is edited next. The same shape lives in removeAt
(storage-reclaim-policy) and vanishAt (storage-pvc-retention-policy, storage-csi-capacity-tracking).
```

---

## storage-volumeclaimtemplates

### before `const CX = 600;`

```
StatefulSet volumeClaimTemplates, angled at the PVC OBJECT: how it is named, minted, bound, retained
and rebound. The layout is THREE HORIZONTAL ORDINAL ROWS, one per replica, each a straight triad

       Pod web-N  ->  PVC data-web-N  <-  pv-web-N
       (consumer)        (the claim)       (the disk)

The claim is the subject of the card, so it sits in the CENTRE of every row on the canvas spine
x=CX, with its consumer Pod flanking it on the left and its backing disk flanking it on the right,
mirrored about the spine. The three claims stack into one central column, and the StatefulSet mints
them straight DOWN that column. Every connector is a straight axis run (vertical mint, horizontal
mount and bind), so no ball ever travels a bent corridor, and the whole picture is symmetric by
construction: COL centres are POD_CX, CX, PV_CX = CX - FLANK, CX, CX + FLANK.

---- Why this shape ----
The earlier layout stacked one column PER ORDINAL and fanned the mints in through bent side
corridors, so three claims sat side by side and the mint routes entered each claim from the corner.
Turning each ordinal on its side makes the claim the centred hub of its own row, the mint a single
vertical spine, and the mount / bind pure horizontal runs. Identity (Pod, claim and disk are one
object under one name data-web-N) is now read ACROSS a row rather than DOWN a column, and it is
carried by the shared name in the three block labels plus the row alignment.

---- Narration overlay ----
Measured (tools/overlay-measure.mjs) the overlay covers only the top-left band: right edge ~291,
bottom ~143 in viewBox units for these narrations. The source box spans x 430..770 (all clear of
the x<=397 band) and the first Pod row starts at y=209, below the overlay. A much longer narration
than the ones below would invalidate this.

PULSE MODEL: only the Pods pulse, and each is a wrapping g so pulsePod reaches both the shell and
the inner box. The PVCs, the disks and the source box are infrastructure: they light via .highlight
on packet arrival (lightBoxAt) and never pulse.

OPACITY: the three replica Pods are declared from the start, so they sit at FULL opacity the whole
way through and never dim between steps. Mounting is shown by the pulse plus the container lighting,
not by fading a Pod up from a dim resting state (that up-and-down flicker on every step read as
noise). The ONLY Pods that fade are the ones genuinely removed: web-1 blinks out and back on the
rebind step, and web-2 fades to a ghost on scale-down. A fade here always means a Pod left.

WIRES: the central mint spine drops straight down x=CX, relaying the deterministic name into each
claim in turn (data-web-0, then -1, then -2). The two horizontal lanes per row point INWARD toward
the consumer: the bind lane carries the disk to the claim (pv -> PVC), the mount lane carries the
claim up into the Pod (PVC -> Pod). Every static wire and its ball share ONE points array so they
cannot drift, and every endpoint is a block edge midpoint.
```

### before `function podBlock({ cy, label }) {`

```
The wrapping g is not optional. pulsePod finds its targets with querySelectorAll, which matches
descendants only and never the element itself, so pulsing a bare pod() would catch its
.scheme-pod-rect child but not the group, and the pulse would silently fire at half strength.
```

### before `const shell = pod({ x: POD_X, y, w: POD_W, h: POD_H, label, sublabel: 'mounts /data', containers: 0, role: 'sto`

```
A full Pod window like the rest of the storage cards: the ordinal name on top, a real container
box (label plus what it does to the volume) in the middle, and the mount path as the Pod sublabel
at the bottom. The shell fill is knocked back so the inner container reads as nested inside it.
```

### before `const trunkW = ROW_CY.map((_, i) => lane(trunkSeg(i)));`

```
Straight connectors. The mint spine drops down the centre through the stacked claims. The bind
and mount lanes run level into each claim and Pod. Lanes are permanent dim structure, the mint
spine appears once the template stamps.
```

### before `const CHIP_W = 232, CHIP_GAP = 16;`

```
CHIP_W 232 is the storage family default. Worst case here is 'on delete' + 'kept, leaks' at 20
characters, and .scheme-chip-text runs 6.89 viewBox units per character, so 20 * 6.89 + 24 of
padding is 162 against the 232 available.
```

### before `function setChip(chip, val) {`

```
A chip whose value CHANGED this step also lights (static highlight, never a flash): valueText still
holds the previous step's text at call time (clearHL clears the class, not the text) and steps are
always entered in order, so the diff is deterministic. Catalog-wide chip pattern.
```

### opacity phases (was `const POD_PRESENT = 1`)

```
Pins the visibility of EVERY element that is born or removed mid-story, exactly as setChips pins
every chip, so a step can never silently inherit a claim or a Pod from the step before it. The
Pods rest at full opacity (see the OPACITY note in the header): only a genuine delete fades one.
```

### opacity phases (was `const CLAIM_PLACEHOLDER = 0.4`, now OPACITY.pending)

```
A claim that has not been minted yet is drawn at CLAIM_PLACEHOLDER rather than hidden: removing it
leaves a claim-sized hole in the row that reads as a rendering fault, and it leaves the mount
arrowhead aimed at nothing for the whole flight.
```

### before `function mountRow(s, ctx, i, { delay = 0, tag = null } = {}) {`

```
One row mounting its own disk: the ball crosses the bind lane from the disk into the claim, then the
mount lane from the claim up into the Pod, and the Pod pulses when the mount actually reaches it.
Down-arrow ordering, so the ball leads and the pulse lands on arrival, never at step entry.
```

### before `const GONE = OPACITY.terminated, OUT = 850, HOLD = 550, IN = 800;`

```
web-1 is deleted, then recreated. Deliberately slower than the FADE tokens, with a real HOLD
at the ghost, so the delete and the recreate read as two distinct beats and not one quick
blink: it fades out reading 'deleted', stays gone for a moment, then fades back reading
'recreated'. The claim and its disk stay at full opacity throughout: not being deleted is the
whole point of the step.
```

### poster

```
volumeClaimTemplates: one template stamps a DEDICATED disk per ordinal, and the point is that each
replica gets its OWN stable disk rather than sharing one the way a Deployment would. So the poster is
a template box up top and three IDENTICAL ordinal columns below it, each a Pod wired straight down to
its own cylinder. The fan-out is orthogonal, matching the card, which mints every claim straight down
an axis: one vertical drop out of the template into a horizontal bus, then one 90 degree drop into
each column, so the branch reads as deliberate wiring rather than a spray of diagonals. It is
symmetric about x=160 with columns on 60 / 160 / 260. The three solid vertical spines are the
signature (a spine per ordinal, never a shelf they fight over): the fan is dashed because the
template is minting instances, the spines are solid because each Pod OWNS its disk. The small dashed
rect inside the template box is the claim template itself. No packet dot: a ball frozen on a wire
reads as a paused animation. Content spans y=18..158, centred.
```

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

### before `const ladderCaption = text({ class: 'scheme-label code dim', x: TICK_X + TICK_SPAN / 2, y: TICK_Y - TICK_CAPTION_DY, 'text-anchor': 'middle', 'font-size': 10 }, ['schedule ticks · every 5 min']);`

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

**`partial` is 3100 since 2026-07-30**, not the 2700 above: review stage 2.4 family B gave that step
the watch event its own wire label names (`watch Pod exits`), which leaves on the LAST of the three
exit arrivals because the controller cannot count before every unit has reported.
```

### before `const recon = fanOut(s, ctx);`

```
Controller reconciles the observed exits down to the node state. On arrival the
three Pods react together: worker-1 and worker-2 settle as succeeded (stay lit),
worker-3 pulses then dims to show it failed.
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

## workloads-pod-priority-preemption

### decision: two off-card actors in `bind` are deliberate (2026-07-29)

Family K of item 2.4 rewrote one sentence of this step (Kubelet starting the new Pod became "Pod
NEW then starts on Node-1"). The two that remain are deliberate. "The controller that owns Pod A
(Deployment, StatefulSet) creates a replacement" and "the Kubelet evicts Pods that are over their
requests first" both describe events explicitly OFF this card: a replacement placed elsewhere, and
a mechanism the sentence itself marks as covered separately. Neither points the reader at a box
that should be on the diagram. Do not file these again.

### layout (R5-a, 2026-07-27)

```
Layout C. Panel x<=397, y<=404, so the pipeline keeps 660..1140 and the chips are a two-across
bottom strip 532 wide. Four across was 258 and six of the eight chip strings collided,
including "Pod NEW · pri" against "2e9 (system-cluster-critical)".

Scheduler is 420..780, centred on CX. Everything the Scheduler sends down addresses slot 0: it
**TWO lanes since 2026-07-30, not one** (review stage 2.4 family C): `SCAN_LANE` from the Scheduler,
which is the preemption scan evaluating the Pods already on the Node, and `NODE_LANE` from the API,
which is what the API sets in motion once a write has landed on it (the graceful delete of the victim,
the start of the bound Pod). The Scheduler never reaches a Node, it writes to the API and the Node acts
on what it reads, so picking one owner would have lied about the other. Both share the drop, so they
read as one wiring tree with two sources. `delete` and `bind` went 3400 -> 4200. The paragraph below is
the R5 reasoning for the single lane it replaced.

is the victim it preempts (Pod A) and the slot Pod NEW is bound into. So there is ONE lane, not
a bus, and it doglegs at BUS_Y = NODE_Y + 12 to land on that slot Pod top midpoint. The wire
and the ball are built from that one LANE array.
```

---

### before `s.refs.pod1.style.opacity   = String(OPACITY.terminating);`

```
Family A, closed 2026-07-29 (SCHEME-2.4-PLAN.md, stage 2.1). The delete step used to pin Pod A to
0 and animate it 1 -> 0 on the eviction packet arriving, while the victim chip on the same step
read 'Pod A · Terminating' and the narration spent two sentences on the grace period it is serving.
A Pod inside its terminationGracePeriodSeconds is the most present thing on the diagram, not an
absence, so it now holds OPACITY.terminating and keeps its slot. It leaves the slot on the bind
step, where the narration says it has exited and its capacity has returned to the Node.

OPACITY was not imported in this file at all before the fix, which is why the step had no shade to
reach for.
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
drawn on every step, including idle where no Pod exists yet: they read as the three slots the
ladder is about to fill, and the ball that rides one is what materializes that Pod.
```

