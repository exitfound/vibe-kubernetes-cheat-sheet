## cluster-image-container-gc

### layout

```
WHAT     TWO STORES on one disk, not a sequence: the image filesystem drawn as a ruler with one
         carved segment per image, and the dead containers under it as a roster of six slots. The
         Kubelet deletes out of both, on two different rules, and nothing else on the card moves.
LAYOUT   The Node frame is the whole picture and it holds no Pod, so it is not a CLU.L-01 frame.
         Its 216 units are 34 of label padding, the caption and threshold row, the 56 image bar,
         the 56 container row and a 12 floor. Nothing is a Pod, so nothing pulses: the beats are
         four packets, four fades and the block highlights. The same deliberate reading of "only
         Pods pulse" cluster-node-allocatable makes.
LAYOUT   The two stores are what stores lights, one after the other, image side first, because
         "counts the two stores SEPARATELY" is the sentence and that is the order the rest of the
         card walks them in. Ten blocks light, and they read as TWO because the four image
         segments are one continuous bar and the six slots are one row. `lightBoxAt` hangs each on
         a 1ms timer, so a SEEK frame never fires it (M-35) and only a real playthrough shows it.
LAYOUT   Two actors and they do not share a row. The Kubelet is centred on the Node at 484..716 so
         its delete lane drops straight off the bottom face with no turn at all, and cAdvisor sits
         at 908..1140 y 160..240, flush with the content edge and clear of the top row by 40. The
         band between the top row and the frame, 120 to 316, carries the three lanes and nothing
         else, which is what the panel leaves free on the right of the L.
PANEL    Measured over the standard set: 1600x1000 x<=290.8 y<=177.4, 1280x860 x<=377.8 y<=213.9,
         1100x800 x<=396.5 y<=254.7. The frame top at 316 clears the worst of those by 61, and the
         header states a 360 character ceiling because that is the band those numbers were taken
         in. Nothing on this card is drawn left of 420 above y 316.
SIZES    The bar is a RULER: 1000 units from x 100 to 1100 at 10 units per percent, so the right
         edge of the last surviving segment IS the usage reading and the two threshold marks stand
         on the same scale. 31, 27, 20 and 11 percent carve 89, and the sweep that takes the 11
         lands the edge on 78, which is under the 80 mark by 20 units. Every width on the bar is a
         multiple of the percent, so the drawing and the arithmetic cannot disagree.
SIZES    The narrowest segment is 110 units. envoy:v1.31 measures 66.3 rendered and last used 41d
         measures 79.8, so the tightest caption clears its own segment by 15.1 a side. Nothing
         narrower than 11 percent can carry a name and an age, which is the floor under the
         scenario rather than a fact about images.
SIZES    Six container slots at 155 wide leave 14 between them across the same 1000 units. The two
         the sweep takes are the two ENDS, index 0 and index 5, so the four survivors span 269..931
         and stay centred on 600 to the unit.
SIZES    The caption row sits at NODE_Y + 38 rather than the + 34 the padding suggests. Measured at
         1100x800, the frame label glyph box ends on 337.7 and the caption starts at x 100, so the
         two rows overlap in x: at + 34 they stood 1.3 apart, at + 38 they stand 5.3, which is
         twice the gap a box label and its own sublabel keep.
LANES    Three, and every one of them carries a ball. Both lanes that touch the Node land on its
         top face at 588 and 612, mirrored about the midpoint by CLU.LANE_DY, which is the
         deliberate pair L-12 reads and not two stray endpoints: the stats leaving the disk at 612
         and the delete arriving on it at 588. LANE_DY rather than a number of this card's own,
         because cluster-cascading-deletion straddles the SAME Node top face with it at CX +- LANE_DY.
LANES    ONE TURN AT MOST, and every leg orthogonal. The delete is a straight 196 unit drop at
         x 570 from the Kubelet bottom face to the Node top face. The stats lane is an L, up at
         x 612 to y 200 then right into the cAdvisor LEFT face at 908, 412 units. The report lane
         is the mirror L, up at x 1024 out of the cAdvisor TOP face to y 80 then left into the
         Kubelet RIGHT face at 716, 388 units. Four faces, four different ones, so no box takes two
         lanes on one edge and no lane needs a second turn to reach the face it wants.
LANES    The two horizontal legs sit in the two free bands, y 200 between the top row and the
         frame and y 80 on the top row centre line, so no vertical leg is shared and no lane
         crosses another. Ball speeds: stats 412 over 916ms and report 388 over 862ms both run the
         PKT_SPEED 0.45 canon exactly, and the 196 unit delete is FLOOR-BOUND at PKT_DUR_MIN 700
         and therefore rides at 0.280 (M-13), which is where most of the catalog's balls already
         are, a share `pace.mjs` prints.
MOTION   Every send waits BEAT.lead, which is what cluster-etcd-raft and cluster-node-allocatable
         do with the same token, so the picture registers before the ball leaves. Measured with
         deadair.mjs: the four steps that send a ball run 21 to 35 percent still, under the median
         share, at 9.66 to 11.41 ms per character across the median pace.
MOTION   A block that DIES in a step is wound back to 1 in `rewind.opacity`, and that is not
         decoration. `writeStatics` pins the step-END opacity at entry, so the pin alone hides the
         segment the instant the step opens, and then the fade, which fills FORWARDS from `del`,
         starts at `from: 1` on arrival and pops the block back before taking it out a second time.
         Traced live on sweep: segEnvoy holds 1.000 for 1500ms while the ball rides, then falls
         once to 0 over 700ms. cluster-cascading-deletion carries the same wind-back for the same reason.
         segEnvoy is NOT wound back on max-age: it died on the step before and stays dead.
MOTION   ONE step registers no animation at all, handoff, and it holds 100 percent still. That is
         the M-27 case, bought back by a pace of 9.24 ms per character, under the median.
DO NOT   Let `stores` go still as well. Without its two staggered lights it holds 100 percent still at
         an ORDINARY 10.10 ms per character, which is the M-19a shape exactly: a hold buying neither
         motion nor reading. The lights put it on a beat the sentence actually names, and it
         measures 1301 of 3000, 57 percent still. The fix is the MOTION, never the
         duration.
MOTION   A deleted segment and a deleted slot both fade to 0, never to OPACITY.terminated. On the
         bar that is load bearing: the whole reading is where the SOLID edge falls against the two
         marks, and a 0.12 ghost still standing between 880 and 990 leaves the question of whether
         that disk is free. The container row takes the same treatment so one card does not carry
         two vocabularies for one event.
WIRE LABELS
         The stats label is written only on the step that sends a ball down that lane, and it is
         wound back blank and filled on the arrival (T-30), so it never announces 89 percent while
         the chip beside it still reads not measured. The delete label is rewritten per step
         because the REASON changes: the sweep, the age rule and the container cap are three
         different deletes down one lane.
WIRE LABELS
         The delete label is anchored END at 558, 12 LEFT of the drop, because the stats riser owns
         x 630 from y 200 down to the frame and a label anchored START would run straight through
         it. Measured at 1100x800, where the panel is deepest, the longest of the three strings
         runs 281.9..558 at y 274..288.7: 19.3 under the 254.66 panel floor and 27.3 over the frame
         top at 316. That 19.3 is the WHOLE budget, and panel bottoms quantize on about 24.8 at
         this viewport, so one more line on any of the three delete steps lands the panel on the
         label. The stats label rides its own leg, centred at 769 on y 190, measured 686.3..851.7
         at y 178.8..193.4 at 1600x1000, which is 58.8 under the Kubelet and 6.6 over the leg it
         names. It is written on arrival, so only a REAL playthrough shows it.
WIRE LABELS
         Measured after the pair narrowed to LANE_DY: the delete label runs 299.9..576 and ends 36
         clear of the stats riser at 612, and the stats label runs 677.3..842.7 and starts 65.3
         clear of it. Both moved the 18 the pair moved and neither crossed anything.
CONTENT  Every number on the card is quotable from one of the three sources, and the ones that are
         not are SCENARIO and are named as such below. From Garbage Collection: the image manager
         is part of the kubelet and works with cadvisor, disk usage above HighThresholdPercent
         triggers collection, images are deleted "in order based on the last time they were used,
         starting with the oldest first", the kubelet "deletes images until disk usage reaches the
         LowThresholdPercent value", imageMaximumGCAge is a maximum unused time "regardless of disk
         usage" whose tracked age resets on a kubelet restart, MinAge is "the minimum age at which
         the kubelet can garbage collect a container" and is disabled by 0, MaxPerPodContainer and
         MaxContainers are disabled by less than 0, and the kubelet collects unused images every
         five minutes and unused containers every minute.
CONTENT  From Kubelet Configuration, which is the only place the DEFAULTS are printed:
         imageGCHighThresholdPercent 85, imageGCLowThresholdPercent 80, imageMaximumGCAge "0s",
         which disables the field. The tick captions carry the concept page spelling
         (HighThresholdPercent, LowThresholdPercent) because that is what a reader arrives with,
         and each narration gives the KubeletConfiguration field name beside it once.
CONTENT  From Node-pressure Eviction, and it is what the last step stands on: "The kubelet attempts
         to reclaim node-level resources before it terminates end-user pods. For example, it
         removes unused container images when disk resources are starved." imagefs is the eviction
         signal named on the same page, which is why the store is captioned imagefs.
CONTENT  The three dials INTERACT, and step 5 says so: `MaxContainers caps the total and lowers the
         per Pod cap to fit`. Without that clause the step reads as three independent caps, which
         is the misreading the page exists to prevent: `MaxPerPodContainer and MaxContainers may
         potentially conflict with each other in situations where retaining the maximum number of
         containers per Pod (MaxPerPodContainer) would go outside the allowable total of global
         dead containers (MaxContainers). In this situation, the kubelet adjusts MaxPerPodContainer
         to address the conflict. A worst-case scenario would be to downgrade MaxPerPodContainer to
         1 and evict the oldest containers.`
         The clause is paid for by `rather than a percentage`, which the opener drops. The step
         measures 352 against the 360 ceiling this card's header states, and the ceiling is real:
         at 387 the panel goes 254.66 to 279.51 at 1100x800 and lands on the delete label at
         y 274..288.7, which has nowhere else to go because the stats riser owns everything right
         of 612. The contrast the dropped words carried is still on the canvas, a percent ruler
         above a row of counted slots, and steps 3 and 4 both name a threshold percentage.
CONTENT  `MaxContainers` is chipped `all Pods` where the page says `the maximum number of dead
         containers the cluster can have`. The page word is the loose one: this is a kubelet
         setting configured per node, which the imageMaximumGCAge section on the same page states
         outright (`This is a kubelet setting that you configure for each node`), and the whole
         card is inside one Node frame. `the cluster` on a Node card would be read as a control
         plane total, which no component enforces.
CONTENT  The `imagefs usage` chip holds 58 percent across the container step, and that is correct
         rather than an oversight. Node-pressure Eviction splits the layouts: `Container writable
         layers are on nodefs, and the container images (read-only layers) are stored on a separate
         imagefs`. Deleting dead containers frees the writable layers, so a chip named imagefs must
         not move on that beat.
CONTENT  UNVERIFIED, and left off the card on purpose: the DEFAULTS of MinAge, MaxPerPodContainer
         and MaxContainers. The concept page names all three and their disable sentinels and prints
         no number, and the KubeletConfiguration reference does not carry the three fields at all,
         because they are the kubelet flags minimum-container-ttl-duration,
         maximum-dead-containers-per-container and maximum-dead-containers. So the card names each
         one with its sentinel and no default, and the 2 on MaxPerPodContainer is stated as "2
         here" on the chip and as "a cap of two here" in the narration, never as a default.
CONTENT  Every claim on this card is read against the release `k8sVersion` names, and each one is
         confirmed on the page cited for it: the image manager is `part of the kubelet, with the
         cooperation of cadvisor`, `imageGCHighThresholdPercent` defaults to 85 and
         `imageGCLowThresholdPercent` to 80, `imageMaximumGCAge` defaults to `0s` and disables the
         rule, `imageMinimumGCAge` defaults to `2m` and is the reason the youngest image on the bar
         is 12m, the three container dials carry the sentinels the card chips state, and
         `imagefs.available` is a real eviction signal (`node.stats.runtime.imagefs.available`).
CONTENT  The card asserts NO feature stage. The Garbage Collection page prints no alpha, beta or
         GA banner for any of these settings, so there is nothing to quote. Node-pressure Eviction
         does carry a "Deprecated kubelet garbage collection features" table naming the three
         container flags as deprecated in favour of eviction, and that is deliberately not on the
         card: the deprecation is of the FLAGS while the fields still work, and step 5 would have
         to argue two things at once to say it honestly.
CONTENT  imageMinimumGCAge, default 2m, is deliberately not drawn. It would need a seventh chip and
         it changes nothing in the scenario, since the youngest image on the bar is 12m old.
CONTENT  SCENARIO, not doc values: the four image names and their last-used ages, the six dead
         containers and their ages, the 89 / 78 / 58 percent readings, the 168h imageMaximumGCAge
         and the per-Pod cap of 2. They are an arithmetic built to land on the doc rule, the same
         way cluster-node-allocatable rebuilds the Reserve Compute Resources example in miniature.
CONTENT  The sweep takes ONE image and stops, and that is the doc rule rather than a shortcut. The
         two defaults are five points apart, 85 and 80, so a single image of any size can carry a
         Node back under the low mark. fluentd:v1.17 at nine days SURVIVES the sweep it was next in
         line for, which is what "stops as soon as usage reaches LowThresholdPercent" looks like on
         a picture, and it is then taken by the age rule on the next step for a different reason.
SCOPE    This card is the NODE half of the garbage-collection page and nothing else.
         Node-pressure eviction belongs to cluster-node-pressure-eviction: GC reclaims disk BEFORE
         a signal crosses its threshold, eviction is what happens after it crosses, and that
         boundary is one line on the last step with no eviction drawn.
         Image PULL, imagePullPolicy, imagePullSecrets, digests and ImagePullBackOff belong to
         workloads-pod-image-pull. Here an image is a thing already on the Node taking up space.
         The CRI sequence, RunPodSandbox, PullImage, CreateContainer and StartContainer, belongs to
         cluster-pod-sandbox-cri, which is why no runtime box is drawn and no RPC is named.
         lastState, restartCount and CrashLoopBackOff belong to workloads-container-states and
         workloads-crashloopbackoff. Here a dead container is an object on disk with an age.
         Owner references, cascading deletion and finalizers, which are the OTHER half of the same
         upstream page, belong to cluster-cascading-deletion.
NAMING   The bar is ordered newest to oldest left to right, so the sweep eats from the RIGHT and
         the usage edge is the thing that moves. The alternative, oldest at the left, deletes out
         of the middle of the ruler and leaves a hole that does not read as a usage frontier.
NAMING   A slot is labelled Pod api-0 rather than dead container, because the row already carries
         one caption naming what they all are and six identical labels under it would say nothing.
         The Pod whose slot reads owner gone is the case the doc gives MinAge alone: "containers
         owned by pods that have been deleted are removed once they are older than MinAge". The id
         carries the TITLE, `D-02` keeps the category prefix, and `cluster-node-garbage-collection`
         resolves through `SCHEME_ALIASES` (`D-11`).
WHY NOT  A separate thin usage bar above the roster, so the ticks could cross a bar carrying no
         text. It costs 34 units, which puts the frame at 250 and the second chip row past 624.
         Standing the two marks ON the bar top edge instead costs nothing and crosses nothing.
WHY NOT  A chain ladder. Six rows at CLU.ROW_H 32 need 222 units and the band between the top row
         and the frame is 196, so the only ladder that fits is a five-row one against six narrated
         steps, and a step with no row of its own reads as a step the list forgot.
WHY NOT  Threshold captions carrying the KubeletConfiguration spelling.
         imageGCHighThresholdPercent 85 measures 207 units and starts 4 right of its own mark at
         950, so it ends on 1161, 21 past the content edge. The concept page spelling measures
         141.1 and ends on 1095.1.
DO NOT   Draw a container runtime box between the Kubelet and the disk. It would fill the one thin
         part of the picture and the CRI calls behind a delete are real, but cluster-pod-sandbox-cri
         owns every RPC on this folder and the Garbage Collection page says only that the kubelet
         deletes.
DO NOT   Put a jog back into any of the three lanes to buy a label a corridor or a lane a shorter
         leg. Two turns per lane is what this card shipped with and it read as three zigzags rather
         than as one Kubelet, one collector and one disk: the picture is orthogonal now and the
         cost of keeping it that way is paid in the label placement above, not in the geometry.
DO NOT   Bring back the pending shade on the two stores. imgStore and cntStore stood at
         OPACITY.pending on the poster and were revealed on stores, so every block inside the frame
         changed weight one beat into the card while the reader was still reading step 1. The disk
         is not pending: it is a thing the Node already has, and the step is the Kubelet counting
         it rather than the Kubelet creating it.
NOT A DEFECT
         The chip values in a SEEK frame lag the picture by one beat on sweep, max-age and watch: a
         value written on arrival through at() never fires under a frozen probe (M-35). Read them
         with tools/settled-dump.mjs, which plays the card and shows all seven settled frames
         agreeing with the bar.
NOT A DEFECT
         segNginx, segRedis and dead1 to dead4 are addressed through IMAGES.map and DEAD.map into
         ON_DISK and into reset.keys, which no text sweep follows. statics.mjs reported all six as
         UNREAD-KEY until it learned that a key minted outside a `P.<kind>` call is a factory key
         and lists them apart from its findings.
NOT A DEFECT
         The band x 400..588 y 120..316 is empty, and at 1600x1000, where the panel bottom is
         177.4, so is everything left of 420 down to the frame. It CANNOT be filled, and that is
         measured rather than asserted. Three walls bound the only free rectangle: the panel
         reaches x 396.55 y 254.66 at 1100x800, the longest delete label starts at x 299.9 and runs
         y 274..288.7, and the frame top is 316. What is left is x 60..287.9 by y 260..310, which
         is 227.9 wide. The one fact the card still leaves undrawn is the pair of collection
         clocks, and the shortest honest chip for it, `GC sweep` against `5m images · 1m
         containers`, measures 227.4 units of GLYPH before any chip padding or the gap between the
         name and the value. It is half a unit short of fitting with nothing to spare.
         The composition centres correctly regardless: the frame and the chip strip both span
         60..1140 and CENTRE reports nothing.
WHY NOT  Widen that chip to x 60..396 so the clocks fit. It runs straight through the delete label
         on three of the six steps, x 299.9..396 against y 274..288.7, and the label has nowhere
         else to go: the stats riser owns everything right of 612 down to the frame.
WHY NOT  A ladder. Six rows at CLU.ROW_H 32 need 222 units and the band is 196 tall, which the
         WHY NOT above already settles for the chain form.
```

### poster

```
Sentence: images go in the order they were last used, oldest first.

Row of peers on an age ramp, the oldest struck. Four equal 61 x 100 blocks on one baseline at y
40..140, x 20 / 93 / 166 / 239 on a 12 unit gap, so the row spans the full 20..300 content width and
covers 49 percent of the canvas. The four blocks are four images on one Node disk, ordered by time
since last use, newest at the left. The first three carry the house bar, 37 x 8 at the block centre
line, and the fourth carries the X where its bar would be.

The ramp is the ORDER, and it is said on two channels because one was not enough. Block fills go
0.03 / 0.06 / 0.10 and the bars inside them go 0.3 / 0.5 / 0.7, both rising left to right with age,
so the row builds into the struck block instead of merely ending at it. The proposed 0.3 to 0.6 bar
ramp alone was drawn first and read as three identical bars at 200px: it was widened to 0.3 to 0.7
and given the block-fill ramp beside it, which is what made the order legible at true size. Every
ramp value stays under the accent on purpose, so the eye lands on the X and not on the third block.

The accent is the X, not a bar. R-03 gets exactly one, and the subject of this poster is the image
that goes, not the one that survives longest. Its block is dashed at fill 0.02, which is the house
"leaving", and the X is the EXISTING idiom rather than a new one: two crossing lines, stroke-linecap
round, taken from cluster-resource-quota, the one poster where the X is itself the subject and so
carries stroke-width 2.4 at full opacity. The lighter form (opacity 0.55 at stroke-width 1.4) is on
cluster-pod-priority-preemption and cluster-node-pressure-eviction, where the accent lives elsewhere
on the canvas. Nothing was introduced.

Judged at 200px and at 3x against all four grid neighbours, and it is none of them.
cluster-kubelet-reconcile-loop is five landscape blocks closed into a ring by legs, where this row has no
leg at all and does not close. cluster-pod-sandbox-cri is nested containment, one outer frame
holding two blocks, where nothing here contains anything. cluster-node-allocatable is ONE wide bar
cut by vertical rules, a single capacity divided, where these are four separate blocks with real
gaps between them. cluster-pod-cgroup-hierarchy is five horizontal bars stepping down a column, a
vertical staircase, where this is one horizontal row of equal upright blocks.

REJECTED, do not rebuild either to find out. A split percentage gauge against a slot stack, which
needs two accents to state its two halves honestly and R-03 allows one. And a wide track with a
high-water mark, whose two rules are 50 units apart on the card scale and collapse into one mark at
200px, and whose grammar near-copies cluster-node-allocatable one card away in the same grid.
```
