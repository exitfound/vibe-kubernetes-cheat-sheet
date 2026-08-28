## cluster-node-eviction-rate

### layout

```
WHAT     The node controller throttling ITSELF: a per zone queue of NotReady Nodes tainted one at a
         time, at the normal rate, at the reduced secondary rate, and at no rate at all.
LAYOUT   Layout C, ladder right at 660..1140, chips as a two across bottom strip. The left column is
         the panel and nothing else, which is why this card carries no second top-row block: the one
         actor is centred on CX 600 so both zone drops leave its bottom face as a mirrored pair.
         TWO ZONE FRAMES SIDE BY SIDE, 530 each on the derived spread, 60..590 and 610..1140. Stacked
         full width was measured and fails: two 126 frames plus a 20 gap is 272, and with the ladder
         ending at 336 and the chip strip starting at 548 the band left is 212.
PANEL    Measured, all three viewports, over all six steps:
         1600x1000  right 290.77, bottom 160.00..194.89
         1280x860   right 377.76, bottom 192.67..235.17
         1100x800   right 396.55, bottom 229.82..279.51
         Deepest 279.51 at 1100x800 on `zone-unhealthy`, the longest narration on the card at 407
         characters. WHAT THE PANEL REACHES FIRST IS THE `branch` CAPTION, not the lane: its box top
         is 339, so the clearance is 59.5, where JOG_Y 366 has 86.5 and the frame tops at 406 have
         126.5. That 59.5 is the card's real budget and it is about three panel lines at this
         width, so `zone-unhealthy` is the step to re-measure after ANY prose edit.
         Zero drawn strings intersect the panel at any of the three viewports, measured with
         `extents.mjs` over every step.
SIZES    THE ZONE FRAME IS 126/80/34, NOT the cluster family 152/106/34 (`CLU.L-01`), and the reason
         is the one `node-registration` states: two of its slots are plain boxes rather than Pod
         shells, and a 106 shell around a label and a sublabel is 60 units of nothing. This card
         keeps the family's 34 of label padding and 12 of floor and pays the whole 26 out of the
         slot. `node()` prints its label at `NODE_Y + 6.8 .. NODE_Y + 21.4`, so a slot row starting
         at `NODE_Y + 34` clears it by 12.6 without needing the horizontal licence `oom-kill` uses.
         SLOTS ARE 235 WIDE, two per frame on the derived spread with 20 of inset and 20 of gap. The
         widest string they carry is `NoExecute taint applied`, 138.7 at 1600x1000, so the box holds
         it with 48 either side. Three slots per zone was measured and dropped: 156.7 each, and the
         same string at 141.1 leaves 7.5 of padding, under half what every other box on the card has.
         CHIPS ARE 532, `LAYOUT.C.strip.two`, in a two by two GRID READ AS A TABLE: row one is zone
         us-east-1a, row two is us-east-1b, state left and rate right. Worst measured pair at
         1600x1000 is `us-east-1a eviction rate` ending at 785.4 against
         `--secondary-node-eviction-rate 0.01/s` starting at 873, 87.6 apart. The state pair is
         easier, 129 apart.
LANES    TWO LANES, ONE PER ZONE, and they are a mirrored `LANE_DX` 24 pair on the controller bottom
         face (`L-12`): the face runs 420..780 with midpoint 600, so the two leave at 576 and 624 and
         each lands on the TOP FACE MIDPOINT of its own frame, 325 and 875, exactly. 24 off a 360
         unit face is 6.7 percent, inside the 18 percent a lone endpoint is allowed, and the pair is
         pooled anyway.
         Both legs turn at JOG_Y 366, which is below every measured panel bottom and 40 above the
         frames. Lane A then runs LEFT to x=325, which is inside the panel COLUMN: only the depth
         clears it, which is the L shape `L-01` describes and not a violation of it.
         WHICH SLOT THE TAINT LANDS ON IS CARRIED BY THE ARRIVAL LIGHT, not by the arrowhead, the
         same call `cluster-node-failure` makes for its eviction DELETE. A lane run to a slot face
         would have to pick one of two boxes on a card whose whole subject is that the controller
         takes them one at a time.
         LANE B CARRIES A BALL ON ONE STEP ONLY, `resumed`, and that is what earns it an arrowhead
         under `A-05`. Zone B has nothing to taint before that: it is healthy with no NotReady Nodes
         on steps 1 to 3, and stopped outright on step 4.
MOTION   THE BALL RUNS AT THE CANON SPEED, not on the clamp. 537 units at `PKT_SPEED` 0.45 is
         1193ms, measured 0.450 units per ms, where most of the catalogue's balls are floor-bound
         on the 700ms `PKT_DUR_MIN` and crawl (`M-13`), a share `pace.mjs` prints beside every card
         it ranks. No other card runs this length.
         EVERY BALL IS SELF-INITIATED, so every one waits `BEAT.lead` (`M-18`): the controller
         decides to taint off its own observation, with no preceding hop and no Pod to blink first.
         There is no Pod on this card at all, so nothing pulses and `M-01` never comes up.
         `resumed` RUNS BOTH ZONES AT ONCE, on purpose: two balls leaving the same face at the same
         delay is what per zone rating looks like, and the two captions under them are what say the
         rates differ. Node-41 comes back to full over `FADE.in` first, landing at 600, before either
         ball is visible: `packetAlong` fades a ball in over 200 ENDING on the route delay of 800.
         `monitor` LIGHTS ITS FOUR SLOTS AT `BEAT.lead` rather than at entry. The chips are the
         controller's own tally and land at entry (`P-06`), the slots are boxes and light on the beat
         the read reaches them (`P-05a`), and without that beat the step animated nothing at all.
WIRE LABELS
         THREE REGISTERS, all three ABOVE the frames rather than inside one. `wA` and `wB` sit
         BELOW the leg each names, the catalog offset, at y=384, and are CENTRED on that leg
         rather than anchored to one end of it. Measured at 1600x1000,
         the widest viewport: `wA` is 227.4 wide against a 251 unit leg, so centring leaves 11.8 at
         each end (336.8..564.2) where an end anchor left 6 at one of them, and `wB` is 220.5 against
         the same leg, 15.2 clear at each end (639.2..859.8). Both boxes are 372.8..387.4, which is
         6.8 under the leg and 18.6 above the frame tops.
         `branch` IS THE COUNTERFACTUAL SLOT (`T-35`) and it sits ABOVE THE ARROW ENTERING ZONE A,
         outside the frame, centred on that arrow at `ZONE_A_CX` 325 and `JOG_Y - 16` 350. The band
         it uses is the empty one between the panel bottom and the jog, which is 111 units deep at
         the worst viewport and holds nothing else at x under 660. Measured over all three:
         1600x1000  344.5 wide, 152.7..497.3, box 338.8..353.4
         1280x860   314.8 wide, 167.6..482.4, box 338.5..353.1
         1100x800   306.7 wide, 171.6..478.4, box 339.0..353.7
         Clearances at the case that binds, 1100x800: 59.5 below the panel bottom at 279.5, 12.3
         above the lane at `JOG_Y` 366, and 97.7 left of the lane A vertical at x 576. The panel
         number is the one that moves: it is a function of the `zone-unhealthy` narration length. It is the
         same L-shape licence `L-01` gives the lane it labels: the string starts at x 152.7, inside
         the panel COLUMN, and only the panel DEPTH clears it.
         IT IS NEVER DRAWN BESIDE `wA`. The two share this corridor 19.4 apart vertically, but
         `zone-unhealthy` is the only step that writes `branch` and it writes no lane caption at
         all, so the pair cannot collide on any frame.
CONTENT  Read against the `k8sVersion` the entry carries.
         WHAT IS RATE LIMITED IS THE TAINT, NOT THE POD DELETE, AND THE TWO UPSTREAM PAGES SAY
         DIFFERENT THINGS. `concepts/architecture/nodes/` describes the node controller as
         `triggering API-initiated eviction for all of the Pods on the unreachable node`, and
         `API-initiated eviction` is a link to the page whose own first line is
         `You can request eviction by calling the Eviction API directly, or programmatically using a
         client of the API server, like the kubectl drain command`, the PDB-aware path. The
         taint-and-toleration page says the opposite about the same work: `The control plane limits
         the rate of adding new taints to nodes. This rate limiting manages the number of evictions
         that are triggered when many nodes become unreachable at once`, and `after 1.29, the
         taint-based eviction implementation has been moved out of node controller into a separate,
         and independent component called taint-eviction-controller`.
         THE SIBLING IS RIGHT AND THIS CARD FOLLOWS IT. `cluster-node-failure` step 5 says the
         taint-eviction-controller deletes the Pod with a plain DELETE that bypasses
         PodDisruptionBudgets, and its own record verifies the call as
         `c.CoreV1().Pods(ns).Delete(ctx, name, metav1.DeleteOptions{})` in `tainteviction`, which
         names no budget anywhere. So `API-initiated eviction` on the nodes page is the loose phrase
         of the two: the node-lifecycle-controller does not call the eviction subresource, it applies
         the NoExecute taint, and the rate limit is on THAT. Every string here says `taint`: the two
         lane captions read `NoExecute taint · 1 Node per 10s`, the slot state line reads
         `NoExecute taint applied`, the ladder rung reads `nothing tainted`, and the narration says
         the taint `is what starts the eviction of the Pods on it`. Nothing on this card claims to
         delete a Pod, so it cannot disagree with the sibling on screen.
         THE FOUR FLAGS AND THEIR DEFAULTS ARE THE REFERENCE PAGE'S own, quoted rather than recalled.
         `--node-eviction-rate` (default 0.1): `Number of nodes per second on which pods are deleted
         in case of node failure when a zone is healthy`. `--secondary-node-eviction-rate` (default
         0.01): the same sentence for an unhealthy zone, plus `This value is implicitly overridden to
         0 if the cluster size is smaller than --large-cluster-size-threshold`.
         `--large-cluster-size-threshold` (default 50): `--secondary-node-eviction-rate is implicitly
         overridden to 0 for clusters this size or smaller. Notice: If nodes reside in multiple
         zones, this threshold will be considered as zone node size threshold for each zone`.
         `--unhealthy-zone-threshold` (default 0.55): `Fraction of Nodes in a zone which needs to be
         not Ready (minimum 3) for zone to be treated as unhealthy`.
         THE 50 IS PER ZONE ON THIS CARD BECAUSE THE CARD IS MULTI-ZONE, which is the flag's own
         `Notice` clause, and it is why the counterfactual reads `if instead the zone had 50 Nodes or
         fewer` and not `the cluster`. Both zones are drawn at 60 Nodes so the secondary rate is a
         real 0.01 here rather than an implicit 0, and the 0 case stays the branch caption.
         THE BOUNDARY IS `OR FEWER` AND THE TWO FLAG SENTENCES DISAGREE ABOUT IT.
         `--secondary-node-eviction-rate` says `implicitly overridden to 0 if the cluster size is
         SMALLER THAN --large-cluster-size-threshold`, which is 49, and
         `--large-cluster-size-threshold` says `for clusters THIS SIZE OR SMALLER`, which is 50.
         `concepts/architecture/nodes` breaks the tie for the inclusive reading, `has less than or
         equal to --large-cluster-size-threshold nodes - default 50`, and so does the code:
         `ReducedQPSFunc` returns the secondary rate only when `int32(nodeNum) > nc.largeClusterThreshold`,
         so exactly 50 gets 0. `50 Nodes or fewer` is the caption for that reason and not by rounding.
         THE MINIMUM OF 3 IS WHY THE FIRST SHARE IS 36 AND NOT 2. A fraction alone does not make a
         zone unhealthy: the test is a conjunction, and the card states the floor in the
         `zone-unhealthy` narration, so a reader cannot take 2 of 3 NotReady as 0.67 and unhealthy.
         THE ALL-ZONES CASE AND THE RECOVERY ARE ONE PARAGRAPH UPSTREAM AND TWO STEPS HERE: `The
         corner case is when all zones are completely unhealthy (none of the nodes in the cluster are
         healthy). In such a case, the node controller assumes that there is some problem with
         connectivity between the control plane and the nodes, and doesn't perform any evictions. (If
         there has been an outage and some nodes reappear, the node controller does evict pods from
         the remaining nodes that are unhealthy or unreachable).`
         THE STOP NEEDS EVERY ZONE AT FULL DISRUPTION, WHICH IS WHY BOTH ZONES READ 60 OF 60. The
         corner case is not a bigger fraction, it is `readyNodes == 0` in every zone at once. The
         page above defines it as `none of the nodes in the cluster are healthy` and
         `pkg/controller/nodelifecycle` agrees to the line: `case readyNodes == 0 && notReadyNodes >
         0: return notReadyNodes, stateFullDisruption`, with the cluster wide stop taken only when
         `allAreFullyDisrupted`. Any pair of shares under 1.00 is REJECTED for this step, 36 of 60
         beside 40 of 60 included: both zones are then `statePartialDisruption`, both go on tainting
         at 0.01, and the stop the step narrates never fires. The
         `120 dead machines` on that step is 60 plus 60 and it moves whenever either chip does.
         A ZONE THAT LOSES EVERY NODE GOES BACK TO THE NORMAL RATE, and `zone-unhealthy` states it
         because the ladder rung beside it cannot: `A key reason for spreading your nodes across
         availability zones is so that the workload can be shifted to healthy zones when one entire
         zone goes down. Therefore, if all nodes in a zone are unhealthy, then the node controller
         evicts at the normal rate of --node-eviction-rate`. `setLimiterInZone` routes
         `stateFullDisruption` to `HealthyQPSFunc`, the 0.1 limiter, and only
         `statePartialDisruption` to `ReducedQPSFunc`. Without that clause `share at or over 0.55,
         rate drops to 0.01` stands as the mechanism and is false at a share of 1.00.
         US-EAST-1A COMES BACK TO 36 OF 60 ON `resumed`, and leaving it at 60 of 60 is REJECTED for
         the same row: a zone still at full disruption would be rated by `HealthyQPSFunc` at 0.1,
         the same rate as the recovered zone, and the per zone contrast the step exists for would
         be two identical numbers.
         THE KEY IS `unreachable` AND NOT `not-ready` BECAUSE THE READY CONDITION IS `Unknown`.
         `labels-annotations-taints` splits them: `node.kubernetes.io/unreachable` is added
         `corresponding to the NodeCondition Ready being Unknown`, while
         `node.kubernetes.io/not-ready` tracks a Node that is simply not ready. Every Node here
         stopped ANSWERING, so `normal-rate` names the value out loud rather than leaving a reader
         to infer that a slot reading `NotReady` earns the unreachable key. `cluster-node-failure`
         carries the same split on its chip, `Unknown · unreachable`.
         COUNTING THEM AS `NotReady` IS THE FLAG'S OWN WORD, so the chips are not reworded to
         `unhealthy`: `--unhealthy-zone-threshold` reads `Fraction of Nodes in a zone which needs to
         be not Ready (minimum 3) for zone to be treated as unhealthy`, and the controller counts
         them in a variable of that name. The precision lives in the narration, the tally in the chip.
         `resumed` EVICTS PODS, NOT NODES. `The Pods on the Nodes that stayed unreachable are
         evicted after all` follows the page, which says the node controller `does evict pods from
         the remaining nodes that are unhealthy or unreachable`. `The Nodes ... are evicted` is
         REJECTED: nothing in Kubernetes evicts a Node, and this card's own `normal-rate` already
         says the taint starts `the eviction of the Pods on it`.
         THE ARIA-LABEL SAYS `reaches the threshold`, not `crosses` it. The test is `>=`
         (`notReadyNodes/(notReadyNodes+readyNodes) >= nc.unhealthyZoneThreshold`), so a share of
         exactly 0.55 is unhealthy, which is also what every chip on the card says with
         `at or over 0.55`.
         THE 3 NODE FLOOR IS A CONJUNCT, NOT A SECOND BRANCH: `notReadyNodes > 2 && share >=
         threshold`. `zone-unhealthy` therefore says `past its 3 Node floor`, hanging the floor on
         the threshold it belongs to.
         THE 5 SECONDS IS `--node-monitor-period`: `By default, the node controller checks the state
         of each node every 5 seconds. This period can be configured using the --node-monitor-period
         flag on the kube-controller-manager component.`
         THE BOX LABEL IS `controller-manager`, the string four other cluster cards already use for
         this block, with the sublabel naming the one controller inside it that this card is about.
         `node-lifecycle-controller` as the label would break that agreement for a card that never
         leaves the one component.
BUDGET   Measured with `timing.mjs` and `deadair.mjs`, which rank each of these rows against the
         catalogue and print the medians they are ranked against:
         monitor        349 chars, 3000, 8.60 ms/char, still 2199 of 3000
         normal-rate    385 chars, 3300, 8.57 ms/char, still  747 of 3300
         zone-unhealthy 407 chars, 3600, 8.85 ms/char, still 3600 of 3600
         all-zones      329 chars, 3100, 9.42 ms/char, still 1600 of 3100
         resumed        382 chars, 3300, 8.64 ms/char, still  747 of 3300
         Every pace here sits under the catalogue median, which is the reading the next block turns
         on.
NOT A DEFECT
         `zone-unhealthy` REGISTERS NO ANIMATION AT ALL AND STANDS STILL FOR ITS WHOLE 3600, which
         puts it at the far end of the still ranking. It is the shape `M-19a` names and it is
         deliberate here for a reason no other still step in the catalogue has: the step's own narration ends `The picture stands
         still because the next taint there is 100 seconds away`, so the stillness IS the rate the
         step is about. The other half of `M-19a` clears it on the numbers too, exactly as
         `cluster-node-failure` argues for its own still step: the rule wants a step still AND
         ORDINARY on pace, and 8.85 ms per character is well under the catalogue median,
         which is fast rather than ordinary. The hold is already spent on the text.
DO NOT   Close it by putting a ball on `zone-unhealthy`. At 0.01 per second the next taint is 100
         seconds out, so a ball there would draw the reduced rate as identical to the normal one,
         which is the single thing this card exists to tell apart. The two lanes look the same on
         `normal-rate` and `resumed` already, and the captions are all that separate them.
DO NOT   Draw the two zones as a roster of individual Nodes. A zone here is 60 Nodes and the picture
         holds four boxes: they are the HEAD OF THE QUEUE, which is what the slot state lines say
         (`next in queue`, `waiting`, `queued`) and what the state chip beside them counts. Drawing 6
         Nodes per zone would make the cluster 12, which is at or under
         `--large-cluster-size-threshold` 50, and the card would then have to say evictions STOP
         where its own chips say 0.01 per second: a contradiction with the flag reference, invisible
         to every check, created by a change that only looks like adding detail.
NOTE     THE LAST TWO STEPS WIND EVERYTHING THE BEAT PRODUCES BACK (`P-03`). The static
         block states the end, so without the rewind `all-zones` opens with `60 of 60 NotReady` and
         two `stopped` rates standing over two slots that still read `Ready` at full strength, for
         the whole 800 of `BEAT.lead`, and `resumed` stood 1993ms ahead of its own first ball, which
         is where `report/chip-beat.test.mjs` ranked it sixth of 332 on the FORM-B queue. The first
         was visible on the rendered entry frame and invisible to every check.
         WHICH BEAT EACH ONE TAKES IS THE POINT, not that they take one. On `all-zones` the chips
         land with the fade at `BEAT.lead`, because losing contact with zone B is what produces
         them. On `resumed` they land on the RECOVERY, `at: 'recover'` off the Node-41 fade at 600,
         and NOT on either ball at 1993: what re-decides the two rates is the zone answering again,
         and the taints that follow are the consequence. The card leaves the FORM-B queue entirely,
         332 records down to 329.
         `resumed` WINDS BACK ITS TWO LANE CAPTIONS AND NODE-41'S STATE LINE TOO, and the chips
         alone were not enough. With only the chips wound back, the entry frame drew
         `NoExecute taint · 1 Node per 100s` and `NoExecute taint · 1 Node per 10s` over two rate
         chips reading `stopped · every zone fully down`: two rates running and stopped at once, for
         the 600 until the recovery lands. Node-41 read `Ready` at the same time, at
         `OPACITY.notready` 0.40, which the shade block below defines as not serving. Both were
         visible on the rendered entry frame at all three viewports and invisible to the whole
         gate, the same class the paragraph above records for `all-zones`. The fix is one
         `rewind` and one `F.set`: the captions and the state line ride `at: 'recover'` with the
         chips, so nothing on the canvas contradicts a chip beside it.
NOTE     `monitor` CUES NO CHIP AND THAT IS `P-09a`. The two share chips carry the same values on the
         poster and on this step, because the poster is the state the controller is about to read
         and not a state before it: nothing MOVES, so nothing is cued, and the beat is the four
         slots lighting at `BEAT.lead`. Every other narrated step cues exactly the chips whose value
         changed, and none of the ones that did not.
NOTE     THE SLOT SHADES ARE THE PHASE VOCABULARY AND NOTHING ELSE. A Ready Node is 1.00, a NotReady
         one is `OPACITY.notready` 0.40, which is `alive but not serving, not observed` to the word.
         A TAINTED Node keeps 0.40: the taint starts the eviction of its Pods, it does not delete the
         Node, so nothing on this card ever reaches `terminating` or `terminated`. What marks the
         arrival is the state line turning over plus the light, not a change of shade.
NOTE     NO POD IS DRAWN, and that is the scope line rather than an omission. The Pods leaving a
         tainted Node are `cluster-node-failure`, one card left in the same subcategory.
SCOPE    Two siblings own what this card deliberately leaves alone, and none of it is reopened here.
         `cluster-node-failure` owns the 50 second grace period, the flip to Unknown, the 300 second
         default toleration and the DELETE that finally takes a Pod off ONE Node. This card starts
         after that decision and owns only the RATE at which the taint is applied across many Nodes.
         Nothing here goes through the eviction subresource either, which is exactly why no budget
         appears on the canvas.
         `cluster-node-pressure-eviction` owns the Kubelet killing Pods locally to reclaim a
         resource. Every actor on this card is control plane.
```

### poster

```
Sentence: the same controller works a sick zone at a tenth of the speed of a healthy one.

TWO ZONES COMPARED, redrawn 2026-08-28. Two 116 x 96 zone frames on one baseline at x 22 and x 182,
each holding five Node rows of 92 x 10 on a 16 unit pitch. A NotReady Node is a filled row at 0.3, a
healthy one is an outline at 0.22: the left zone carries ONE filled row and the right zone FOUR, which
is the 0.10 share against the 0.60 the card narrates, near enough to read and not a measurement. Under
each frame a rate track of the SAME 116 x 16, and that sameness is the whole argument: the left track
is filled 100 units at 0.3 and the right one 12 units at 0.9, a tenth of the same budget, and the small
bright nub is the poster's only accent. The right frame takes stroke 2 and fill 0.07 against 0.04 on
the left, which is the same accent said a second way rather than a second accent.

THE ACCENT IS THE SMALL FILL, NOT THE LONG ONE (`R-03`). The subject of this card is the REDUCED rate,
so the healthy zone's long fill carries the house loser weight (`R-07`) even though it is by far the
bigger shape. A reader who lands on the nub first has read the card correctly.

WHY the family changed. The poster this replaced was GAUGE COLUMNS: three identical 56 x 104 outlines
with levels of 72, 18 and nothing, the same valve at three settings. It said the ramp and it said
nothing else: three blank portrait outlines carry no zone, no share and no threshold, and the whole
argument sat in two fills a reader has to compare across 100 units of gap. The two-zone form pays for
the third setting with the two things the card is actually about, a SHARE that differs and a rate track
that is visibly the same track twice.

WHAT WAS LOST, and it was the deliberate trade: the third setting, the stop a zone of 50 Nodes or fewer
gets and the stop when every zone is unhealthy. The old poster drew it as a bare third column, absence
as a shape. Two zones cannot hold it without a third frame, and a third frame drops the zones under the
76 to 80 unit band (`R-06`) and turns the row into the three-block silhouette `cluster-node-restart`
already owns two tiles away. The stop is the last sentence of the desc and the last step of the card,
and `R-02` puts the poster on the question rather than on the ending.

DELIBERATE: the healthy rows sit at 0.22 rather than at a fill. At the 0.03 fill plus a full-weight
stroke they were first drawn with, the two frames read as two lists of five and the reader had to COUNT
to find the difference. The counts have to be legible before the tracks below them mean anything.

REJECTED, and both were offered against this one. The threshold crossed: one 248 unit segmented track
as the zone, the NotReady segments filled past a heavier upright mark at 0.55, the segments beyond it
accented. It draws the NUMBER the card is named for and it cannot say what the number costs, which is
the rate. The queue: five Node blocks held behind one upright gate with a single tainted block through
it, the rate drawn as a queue rather than as a level. It says one Node every 10 seconds cleanly and has
nowhere to put the second speed, which is the comparison this card exists for.

STILL REJECTED from the earlier pass, do not rebuild either to find out. Two queues and one tap, the
controller on a top row with a zone hanging off each side of its bottom face and the rate carried by the
leg weight: it says the mechanism rather than the subject. And the taint marks as pitch, six slots per
zone with one in six marked: at 200px six 18 unit slots per frame collapse into a texture, which is why
the five rows here are 92 wide and not a grid.
```

