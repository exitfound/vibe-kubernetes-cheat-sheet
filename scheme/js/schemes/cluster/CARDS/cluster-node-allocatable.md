## cluster-node-allocatable

### layout

```
WHAT     An ARITHMETIC, not a sequence: Capacity carved by kubeReserved, systemReserved and
         evictionHard into Allocatable, and a request that does not fit what is left.
LAYOUT   The Node family idiom is a ladder plus a frame full of Pods, and this card breaks the second
         half on purpose: the frame holds ONE horizontal capacity bar carved segment by segment and
         the ladder carries the running subtraction. Nothing is a Pod, so nothing pulses: the beats
         are packets, block highlights and six reveals, the four bar segments plus the request strip
         on each of the two steps that draw it. A deliberate reading of "only Pods pulse".
         The frame is 140 tall: 34 of label padding, the 64 bar, 8, the 22 request strip and a 12
         floor. It is not one of the CLU.L-01 families because it holds no Pod.
LAYOUT   The three actors do not share one row. The Kubelet is centred on the Node at 500..700 so the
         residency line is a straight vertical, the API is flush with the Node right edge at
         940..1140, and the Scheduler drops out of the row to 940..1140 y 221..301, centred in the
         ladder band under the API. Both hops therefore run on an L: the report crosses at y 80 and
         the watch drops at x 1040. The ladder holds the left of the same band.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 354.05 at 1100x800 step 2, shallowest 160.00 at
         1600x1000 step 4: a swing of 124.28 units on step 2 alone, the widest in this category. The
         Node frame at y 394 clears the deepest bottom by 39.95.
SIZES    The ladder is trimmed to its longest row rather than to a kit column. Row 2, the reserved
         row, measures 379 units at 1600x1000, the widest of the three viewports, and with the 10
         unit text inset of chainList and 11 to spare on the right the box is 400 wide. It starts at
         410, 13.5 clear of the panel at its widest, x 0..396.5 on 1100x800. No LAYOUT column fits
         that, so this card states LADDER_X and LADDER_W itself and Layout C governs the chips alone.
SIZES    The vertical budget is exact and there is no slack in it. 40 of top margin, the 80 top row,
         20, the ladder, 12, the frame, 14, two chip rows at 34 with an 8 gap ending on 624, 16 of
         bottom margin. That leaves the ladder and the frame 382 units to share, and six rows at
         CLU.ROW_H 32 with CLU.ROW_GAP 10 take 242 of them.
WHY NOT  A taller frame. The ladder and the frame share 382 units, spent 242 on six rows at
         CLU.ROW_H 32 with CLU.ROW_GAP 10 and 140 on the frame, so every unit the frame takes comes
         off the ladder pitch. Every other laddered card in this folder runs rowH 32 and moves only
         the gap (6, 10, 12), so a rowH under 32 has no precedent here and its rows read visibly
         smaller than a sibling's beside them.
WHY NOT  GI 64: a 15Gi request lands on 1176, past the content margin at 1140. GI 60 lands exactly ON
         the Node frame edge. 56 puts it on 1104, 36 units inside the frame, and still overhangs the
         end of the bar by exactly one Gi, which IS the answer the card gives: the request is 1Gi
         short.
LANES    The Kubelet to Node line is RESIDENCY and not traffic, so it carries no arrowhead and no
         ball ever rides it. It is the same call cluster-scheduler-decision makes for API_TO_CHAIN.
         Without it the top row and the Node band read as two unrelated drawings.
LANES    It is one straight vertical on x 600, Kubelet bottom face midpoint to Node top face
         midpoint, and it passes BEHIND the ladder. L-11 is what forces the line to be there: both
         ends have to sit within 6 units of a face midpoint, and the Node top midpoint is 600.
WHY NOT  Dropping it down the free corridor the trimmed ladder leaves, x 875, between the ladder
         right edge at 810 and the Scheduler at 940. render/geometry.test.mjs fails that: the
         endpoint lands 275 off the Node top midpoint, 25 percent of a 1080 face.
WHY NOT  Going round the ladder instead: down 10, right to 875, down to 388, back left to 600 and
         into the frame. Both ends are midpoints so it passes, and it draws a dotted bracket around
         the ladder while its return leg runs 6 units above the Node frame edge, close enough that
         the two dashed lines read as one doubled border.
NOTE     The ladder rows are repainted solid through a `tune` on P.chain, `#1a1838`, which is the
         colour rgba(40, 32, 72, 0.65) already renders as over this canvas: sampled srgb(26, 24, 56)
         before the change and srgb(26, 24, 56) after, so nothing about the rows moved. At 65 percent
         the residency line showed through the glyphs of every row. Solid, it is out of sight under a
         row and visible in the five gaps, which is the reading intended: a line behind the list.
CONTENT  The card stands on 32 claims over 20 tokens. Every one carries a quote from one of 5
         fetched documents or from 2 files of upstream source, except three that are arithmetic, and
         none is UNVERIFIED. The pages behind them are Reserve Compute Resources, Node Status,
         Resource Management and Node-pressure Eviction, plus `fit.go` for the Scheduler comparison
         and `component-helpers/node/util/status.go` for the verb on both wire labels, which calls
         `c.Nodes().Patch(..., types.StrategicMergePatchType, patchBytes, ..., 'status')`. The claims were read against k8s 1.35, which is what `k8sVersion`
         states and what dates them. `sources` carries THREE entries and each one is load-bearing:
         Reserve Compute Resources backs the whole subtraction and the enforcement default, Node
         Status backs the two blocks and the wording of both, Resource Management backs the
         describe-node output the overcommit step quotes.
         THE Node Status HREF IS `reference/node/node-status/#capacity` AND NOT
         `concepts/architecture/nodes/#node-status`. The second is a stub of four bullets and a
         `kubectl describe node` line that links out, and it states neither block. The first carries
         the sentence this card is built on, `The fields in the capacity block indicate the total
         amount of resources that a Node has. The allocatable block indicates the amount of
         resources on a Node that is available to be consumed by normal Pods`, which is the wording
         `survive` narrates as `available to be consumed by ordinary Pods`.
CONTENT  The desc says the memory above Allocatable is spoken for by the Kubelet, the runtime and
         the OS OR by the eviction margin, never that all of it belongs to those three. 512Mi of the
         2Gi carved is a margin the Kubelet keeps free, which no daemon owns, and step 3 and ladder
         row 3 both say so.
CONTENT  The arithmetic is the Reserve Compute Resources example scenario in miniature. That page
         carves 32Gi by kubeReserved 2Gi, systemReserved 1Gi and evictionHard 500Mi to reach 28.5Gi,
         and ladder row 4 carves 16Gi by 1Gi, 512Mi and 512Mi to reach 14Gi. The shape is the doc's,
         so a reader who follows the citation finds the same subtraction.
CONTENT  `capacity` names the eviction default as `100Mi on a Linux Node`. An unqualified `100Mi` is
         rejected because the default is per OS: Node Pressure Eviction lists
         `memory.available<100Mi (Linux nodes)` against `memory.available<500Mi (Windows nodes)`.
         The clause is load-bearing twice over, because with no reservations at all Allocatable is
         still short of Capacity by that margin, which step 3 goes on to explain, and an unqualified
         `Pods can consume all of it` contradicts step 3.
CONTENT  `schedule` and ladder row 5 say the sum of Pod requests may not PASS Allocatable, never
         that it stays UNDER it. `under` is rejected because NodeResourcesFit compares with a
         STRICT greater-than, `deltaMemory > (Allocatable - Requested)` in `fit.go`, so a Pod whose
         request makes the sum EQUAL Allocatable is admitted and `under` makes a fitting Pod read as
         a rejected one.
CONTENT  `schedule` spells the verdict `Insufficient memory` with a capital I and the fitChip
         carries the same letters, because that is the reason string `fit.go` builds. The lowercase
         `insufficient cpu` Resource Management shows in one example output is page text rather than
         what the event carries.
CONTENT  `reserved` says systemReserved SHOULD cover kernel memory, never that it does. Reserve
         Compute Resources defines the budget as `meant to capture resource reservation for OS
         system daemons like sshd, udev, etc` and puts the kernel in a separate sentence,
         `systemReserved should reserve memory for the kernel too since kernel memory is not
         accounted to pods in Kubernetes at this time`. `covers the OS daemons like sshd and udev,
         plus the kernel itself` is rejected because it reads as automatic coverage, where the
         number is whatever the operator sets and the kernel is guidance on sizing it.
CONTENT  `reserved` says a reservation becomes a real cgroup cap only once you name it in
         enforceNodeAllocatable AND set its reserved cgroup, because the same page carries
         `Note that to enforce kubeReserved or systemReserved, kubeReservedCgroup or
         systemReservedCgroup needs to be specified respectively`. Naming it alone is rejected as a
         necessary condition written as a sufficient one, which sends a reader to set one field and
         expect a cap.
CONTENT  `overcommit` says the Kubelet enforces by EVICTING, which is the page's own mechanism:
         `kubelet enforce Allocatable across pods by default. Enforcement is performed by evicting
         pods whenever the overall usage across all pods exceeds Allocatable`. The `pods` default of
         enforceNodeAllocatable that the chip carries comes from the same section.
CONTENT  Both top-row wire labels read PATCH. The Kubelet writes Node status through
         `nodeutil.PatchNodeStatus` on the status subresource, so PUT and update are both wrong for
         that lane, and status.capacity and status.allocatable ride the same verb. Two PATCH balls
         on two steps is the ARITHMETIC being walked and not a claim of two round trips: the Kubelet
         patches status repeatedly and carries both fields each time.
NOTE     The three narrow segments carry no caption. At 56, 28 and 28 units wide none of them can
         hold one, and there is no tier under the bar to stagger them onto: the bar ends on 492, the
         request strip runs 500..522 and the frame floor is 534, so a caption below the bar either
         sits inside the strip, which is an unrelated object standing between a label and the thing
         it labels, or outside the frame in the 14 units before the chips. The
         ladder already names all three budgets with their numbers, rows 2 and 3, and each sliver
         lights on the same beat as the row that names it.
WHY NOT  Keeping the captions and giving the ladder what the remaining budget allows: 27/6, a pitch
         of 33 against the family 42. That closes nothing and leaves both findings open.
WHY NOT  One merged caption line plus BAR_H 64 to 48: 32/8, a pitch of 40. rowH lands on the family
         number and the gap does not, and it costs the bar a quarter of its height.
NOTE     The segments carry STROKES only, their rect fill overridden to transparent so the soft box
         fill does not double up over the bar. rx is 0 on the segments and 6 on the bar: four rounded
         rects side by side read as four separate blocks rather than as one bar divided. Each one is
         a bare P.box, which hands back the wrapping g, so a single key carries both the opacity the
         reveal writes and the highlight the step lights.
NOTE     The request strip starts where Allocatable starts, because Pod requests are only ever
         measured from there, and its width is set per step in whole Gi. On schedule it is 15Gi and
         overhangs the bar, on overcommit 12Gi and inside: the two frames side by side are the card's
         argument. Its label goes through the wires map rather than a box sublabel, because a
         sublabel is positioned at w / 2 and w changes between steps, so it would drift off centre.
NOTE     Both request-strip reveals start at OPACITY.pending, never at 0. Its caption is a P.wire
         written above the guard, so the string is fully drawn at step entry, and a strip fading up
         from 0 leaves that caption standing over blank canvas for the first half of REVEAL_MS.
NOTE     The idle frame draws the whole bar undivided and nothing else, because at the poster
         position nothing is carved yet. A progressive-carve card cannot both reveal and be full at
         rest.
DO NOT   Draw the 24Gi of limits the overcommit step talks about. Nothing on the bar measures limits,
         and a 24Gi strip runs 1344 units off a 1200 unit canvas. The ladder row and the narration
         carry it instead.
NOTE     The overcommit step lights the Scheduler AND the Kubelet, and it is the only step here that
         lights two top-row blocks with no ball between them. The step makes two claims with two
         actors: the Scheduler sums the requests, and the Kubelet enforces the ceiling by evicting
         once real usage passes it. The reserved step lights the Kubelet beside the same
         enforceNodeAllocatable chip, and lighting the Scheduler alone here credits it with a
         Kubelet sentence.
NOTE     Three of four chips turn over on a beat rather than at entry. status.capacity.memory and
         status.allocatable.memory hold what the API STORES, so they read `not reported` until the
         Kubelet report lands; NodeResourcesFit holds the Scheduler's verdict, so it waits for the
         number it judges against. enforceNodeAllocatable never changes, and that is what the field
         IS: a standing value answering "which of these three reservations is actually a cgroup cap".
MOTION   The first three steps were re-paced against the control-plane cards, which is the set this
         category reads best in. Over their 16 steps carrying 330 characters or more, the reference
         is a still time of 1415 ms, 55 percent of the step, at 9.56 ms per narration character.
         capacity, reserved and eviction-threshold stood at 2840, 3500 and 3500 ms still, 83, 78 and
         88 percent, while their reading pace was already ON that reference at 9.51, 9.98 and 10.03.
         That is the M-19a shape exactly: the hold was not buying reading. Two levers were pulled
         together. The durations went 4100 / 4500 / 4000 to 3700 / 4300 / 3500. And every reveal and
         the report hop now wait out BEAT.lead, which is what `cluster-etcd-raft` does with the same
         token, so the motion lands mid-sentence instead of in the first frame. They now read 1640,
         2500 and 2200 ms of TRAILING still, 59, 58 and 63 percent, at 8.58, 8.65 and 8.77 ms per
         character. reserved holds 4300 rather than 4000 because the fact pass grew it to 497
         characters and 4000 would have read it at 8.05.
NOTE     BEAT.lead moves stillness, it does not delete it. Counting both sides of the motion the
         three steps stand still for 2440, 3300 and 3000 of 3700, 4300 and 3500, so the honest gain
         is the duration cut plus a picture that is not frozen for one long stretch. Cutting further
         is a NARRATION question and not a duration one: these steps carry 431, 497 and 399
         characters against a control-plane subcategory that runs far shorter, and at 3700 ms
         capacity is already faster per character than the reference it was measured against.
OPEN     overcommit still holds 3250 ms of still time, 87 percent, at 10.05 ms per character, which
         is among the stillest steps `deadair.mjs` ranks. It reveals one 12Gi request strip and narrates a
         comparison the bar deliberately does not draw, the 24Gi of limits, so its hold has one beat
         to spend where step 4 has three. The same BEAT.lead plus a duration cut would close it and
         was left out of this pass because the request was the FIRST steps.
NOT A DEFECT
         `report/arrival.test.mjs` reports two R2s, both the documented blind spot: a chip written on arrival
         through at() looks like it changed on the NEXT step, unlit. Both changes are cued where they
         happen.
NOTE     CENTRE-LOW is clean, and the margin is thin enough to name. The rule counts the blocks
         BELOW the panel at 1600x1000 only. The Scheduler sits at y 221..301, the panel bottom on
         that viewport reaches 229.77 on step 2, so the block is not counted and the 8 blocks that
         are span symmetrically enough to pass. Step 2 carries 497 characters and that is what
         buys the 229.77. Cut it back near 450 and the panel lifts above 221, the Scheduler joins
         the count, and the finding returns as a span of 152..1140 centred on 646 against a wanted
         600. Anyone shortening that narration has to re-run `report/geometry-soft.test.mjs`.
```

### poster

```
Sentence: one bar, four segments, and only the last one is for you. A single outlined rect
spanning 20..300 stands for the whole Capacity, cut by three internal rules into kubeReserved,
systemReserved, the eviction threshold and Allocatable. The accent sits at 0.14 on the three reserved
slices and 0.9 on Allocatable, so the eye lands on the only region a Pod may be scheduled into.

0.14 rather than the 0.3 R-07 names for a loser bar, which is a deviation and not a slip: the three
losers here are 28, 20 and 20 wide against 148 for the winner, so at 0.3 four bars of one weight read
as a row of four rather than as one region with three offcuts. It is a reading the cluster file
already runs 11 times against 32 at 0.3.

The reserved segments are 44, 36 and 36 wide against 164 for Allocatable, WIDER than the card's own
proportion (56, 28, 28 against 784). At the ~200px the grid renders, a truthful 512Mi slice would be
5 units of accent, which is the speck the cluster-kubelet-reconcile-loop poster refuses. The
sentence is "three narrow, one wide", and it survives the widening.
```
