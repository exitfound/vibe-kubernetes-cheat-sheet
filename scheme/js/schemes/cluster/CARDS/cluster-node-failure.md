## cluster-node-failure

### layout

```
WHAT     A Node going unreachable: the Lease going stale, the NotReady condition, the unreachable
         taint, and the eviction timer that finally moves the Pods.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 279.51 at 1100x800 step 5, shallowest 107.67 at
         1600x1000 step 2, a swing of 84.62 units. The heartbeat lane leaves the frame at y 380 and
         clears the deepest bottom by 100.49, and the Node frame itself at y 406 by 126.49.
WHY NOT  Five chips across. That leaves 204.8 each, (1080 - 4 x CHIP_GAP 14) / 5, and the taint chip
         needs 335: the value `node.kubernetes.io/unreachable:NoExecute` measures 275.6 at
         1600x1000, the name `Taint` 34.5, and the two paddings and the gap between them the rest.
         Three across gives 350.67 and the pair sits 16.5 apart, the tightest chip on the card.
SIZES    THE NODE FRAME IS 132/106/16, NOT the cluster family 152/106/34 (`CLU.L-01`), and the six
         chips are why. They wrap to TWO rows, `CHIPS_Y = NODE_BOTTOM + 14`, so the second row ends
         at `CHIPS_Y + 2 x CHIP_H + CHIP_VGAP`. At the family height the band would run 406..558,
         the chips would start at 572 and the second row would end at 644, off the 640 canvas.
         Shrinking the frame by 20 lands it on 624 with 16 of floor.
         The 20 comes off BOTH paddings, 34 to 16 above the Pod and 12 to 10 below it, and the top
         cut is legal for the reason `oom-kill` states: the frame LABEL clears the Pod horizontally
         rather than below it. `Node-1` measures 72..116.7 and `POD_A_X` is 131, so the label has
         14.3 of daylight and never needed a band of its own under the frame top.
WHY NOT  Two chip rows of three ABOVE the Node band instead, keeping the family height. Three across
         is 1080 wide, so the rows need a FULL-WIDTH band of 72, and the only full-width gaps left
         are 120..152 above the ladder and 394..406 below it, 32 and 12. Neither holds one row.
LANES    BOTH LANES ON NODE-1 END ON THE FRAME TOP FACE, at [293, 406] and [269, 406], a mirrored
         `LANE_DX` pair under L-12. The heartbeat leaves the frame because a Lease is renewed by the
         Kubelet and the Kubelet is the Node. `writeLane` carries the controller's writes DOWN to it
         and lands on the frame too, and WHICH Pod the DELETE names is carried by the pulse that
         fires on the same arrival, not by the arrowhead.
         ONE LANE, TWO PAYLOADS, and that is the house form rather than a shortcut: `taint-applied`
         rides it with the taint PATCH and `evict` with the eviction DELETE, both of them the
         controller writing to the Node-1 object, and each step names its own payload in the `ctrl`
         caption above the top row. The sibling that OWNS the mechanism does the same and more:
         `cluster-taints-tolerations` runs `patch`, `place` and `evict` over one `NODE_LANE`. The key
         is `writeLane` and not `evictLane`, because a key that
         names one of two things it carries is the staleness this record exists to prevent.
DO NOT   End the drop on the POD top at [269, 422] instead of the frame. The argument for it is that
         a DELETE is an API write on the object and that a frame endpoint credits a delivery to
         Node-1 the sentence denies, and what it draws is the finding: the last 16 units cross the
         Node-1 frame border, so the arrowhead sits INSIDE the frame, 16 below its top edge and 0
         above the Pod box, and reads as an arrow that missed the block it was aimed at. A rule can
         be satisfied and the picture ruined, and no check sees it: THROUGH exempts a frame crossing
         by construction and OFFEDGE reads the endpoint alone.
         The endpoint x stays on NODE_A_CX - LANE_DX = 269 rather than the face midpoint 281, which
         is what makes it the mirror of the heartbeat riser at 293. OFFEDGE is unbothered: 12 off a
         442 unit face is 2.7%, inside the 18% a lone endpoint is allowed, and L-12 pools the pair
         across steps anyway.
         A-11, measured: the drop loses 16 units (422 back to 406), the route 609 to 593, so the
         arrival moves 1353 to 1318 at PKT_SPEED 0.45 and the `evict` span 2253 to 2218 of 3800,
         arrival plus the 900 of PULSE_POD. That leaves 1582 clear of the 3800, so nothing in the
         BUDGET block moves.
MOTION   THE WHOLE NODE-1 SIDE HOLDS FULL STRENGTH UNTIL THE RESCHEDULE, and goes down there in a
         beat of its OWN. The frame and its two lanes read 1.00 on steps 0 to 5 and 0.40 on
         `reschedule`, where three `F.fade` tracks run them out over `HANDOVER_MS` 300 starting at
         delay 0, and the bind ball waits 500 before it moves. Measured off the rendered frames at
         1600x1000, mean pixel value of the frame label: Node-1 43.71 and Node-2 44.07 on every step
         through `taint-applied`, and 29.40 against 43.03 on `reschedule`. Both frames share one
         class, `.scheme-node-rect`, so at 1.00 they are identical by construction.
         A-13 IS SATISFIED BY CONSTRUCTION AND NOT BY EXCEPTION. Both Node-1 lanes end on that frame,
         so both are `laneOf(nodeA, OPACITY.running)`, which is the frame's own shade: 1.00 while it
         is 1.00, 0.40 when it drops. No lane on this card is ever brighter than what it ends on.
         DO NOT drop the frame to 0.40 on `kubelet-stops`, taking both lanes with it four steps
         early, and DO NOT carry the drop on to 0.25 on `evict`. Two defects follow and no rule
         reaches either. The heartbeat leg at 0.40
         over this background is not dim, it is GONE, so `not-ready` and `taint-applied` would carry
         no Node-1 traffic at all and `evict` would draw the lane its own DELETE rides as the
         faintest thing in the step. And the shade is named `notready` while the step that would
         first wear it says
         `Ready` reads `True (Stale Lease)` and `Pods on the Node keep running for now`: the picture
         announces a state the sentence beside it denies, one step before the chip flips to Unknown.
         WHY NOT move the drop to `not-ready` instead, where Ready DOES flip to Unknown. It closes
         the contradiction and leaves the other one open: Node-1 would still recede in the middle of
         its own story, and the last step would then have nothing left to hand over. Rejected on the
         author's call, with the alternative kept here so it is not re-proposed for free.
         WHAT THE MIDDLE STEPS CARRY INSTEAD, since the frame does not say it: the `Ready` chip
         (`True` to `True (Stale Lease)` to `Unknown · unreachable`), the `Lease age` chip, the taint
         and toleration pair, the eviction timer, and the ladder rung. Five registers against one.
         TWO BEATS, NOT ONE, and the 500 is arithmetic rather than taste. `packetAlong` fades a ball
         in over `fadeMs` 200 ENDING on the route delay, so a ball at delay 300 would already be
         materialising at its origin while the left side is still dimming. 300 of fade plus those
         200 puts the first visible pixel of the ball after the fade has landed. Read off
         `motion.mjs`: nodeA, hbLane and writeLane 1.00 to 0.40 over 0..300, the ball fading in over
         300..500, travelling 500..1500, the Pod pulse 1500..2400.
         WHY NOT `FADE.out` 700, which is what the catalog fade is and what this step used first. At
         700 the fade and the 1000ms flight overlap for their whole length, so the two beats read as
         one thing happening at once, which is the finding this closes. `M-12` allows the explicit
         duration with the justification at the call site, and it is there.
         BUDGET, measured: the span fills 2400 of the 2600 hold, so the still tail is 200ms,
         8% of the step, which is one of the least still steps `deadair.mjs` ranks, and the reading
         pace is 9.67 ms per character, a shade under the catalog median. The second beat costs
         the step nothing.
         A-15 is unaffected: the only lane carrying a ball on `reschedule` is `reschedLane`, pinned
         at 1.00 for the whole flight, and everything that fades there carries nothing.
         `kubelet-stops` and `not-ready` register NO animation at all, which `M-27` allows and a
         substantial population of narrated steps already does (`report/baselines.test.mjs` section
         5 counts it). Their beat is the chips they light.
         `not-ready` STAYS still on purpose and the number is why. `deadair.mjs`: it holds 2000ms and
         all 2000 are still, high in that ranking, but its reading pace is 8.73 ms per
         character, well under the catalog median, which is FAST. The hold is already spent on the text, so `M-19a` does
         not reach it: that rule wants a step still AND ordinary on pace, and this one is neither
         ordinary nor generous. Adding a third ball to `writeLane` on three steps running would also
         be the only change on this card that buys nothing.
         THE TAINT PATCH RIDES, and that is what keeps `M-19a` off this card. `taint-applied` rides
         `writeLane` with `delay: BEAT.lead`, so the spec span is 2118 of its 3100 hold and the
         still tail is 982ms, 32% of the step, under the catalogue's median still time and its
         median share of the step, both of which `deadair.mjs` prints.
DO NOT   Take the ride away and leave the hold. Animating NOTHING over 3100ms is 100% still, at the
         far end of that ranking, on a reading pace of 9.97 ms per character, which
         is the catalogue median to within a rounding step. Still
         AND ordinary on pace is exactly the shape `M-19a` names, and a hold like that buys neither
         reading nor motion. The pace does not move either way, so the ride is free.
         THE LEAD IS THE ASYMMETRY WITH `evict`, and it is deliberate. `BEAT.lead` is the token for a
         SELF-INITIATED packet, and the controller decides to taint on its own after observing, where
         the DELETE one step later fires off a toleration timer that has just hit zero and so leaves
         at delay 0. Same lane, two different triggers, two different openings.
         S-13, the rewind: the static block states the END, so `chips` carries the taint, the
         toleration and the 300s, and `rewind` winds those three back to `none` for the animated path
         alone. `F.set({ at: 'patch' })` turns them over on the arrival.
NOT A DEFECT
         The rewind costs TWO rows on `report/arrival.test.mjs` R2-ENTRY, `Taint` and `Toleration` on
         step 5, and they are the frozen-sampling artefact that axis announces in its own header,
         both samples frozen at t=0. Wound back, the value first APPEARS at a t=0 reading on `evict`,
         where those two chips are not in `lit`. In real playback it appears at 2118ms on
         `taint-applied`, where they ARE lit, and the axis that reads the SETTLED step says so:
         R2-STEP is 7 findings, 7 carried, 0 left to work, and this card is on neither list. The
         sibling `cluster-taints-tolerations` prints the identical pair on its own taint step for the
         identical construction. `evictChip` does not print, because `evict` lights it.
         DO NOT close those two rows by dropping the rewind. That trades a frozen-reading artefact
         for a real one: the three chips would then read their end value from the moment the step
         opens, and the ball would land on a taint the picture already showed.
         WHY NOT `lights: ['nodeA']` on the route, which is what the sibling writes on its own taint
         step. There is NO `.scheme-node.highlight` rule in `css/diagrams.css`, so the class lands on
         the frame and paints nothing: the sibling's `lights: ['nodeEl']` is a dead write and copying
         it would have added a second one. The arrival cue here is the three chips turning over, plus
         the ripple `M-14` gives every packet.
NOTE     The Pod PULSES on `evict`, and with the lane ending on the FRAME that pulse is the only
         thing that says which object the DELETE names. M-08 wants that order, pulse then fade, and
         both fire on the arrival. BOTH shapes were compared on the rendered frame: the pulse SHIPS. Census over
         the catalogue, off the specs: of the 22 beats where a Pod fades on a ball arrival, 19 carry
         the pulse and 3 do not, and one of the three (`cluster-cascading-deletion`) is a second fade on a
         Pod that already pulsed in the same card, so the sibling `workloads-pvc-stickiness` is one
         of two true exceptions and this card sits with the 19 that pulse. The frames settle it:
         with the pulse the deleted object is the brightest thing on the canvas at 1768, which is
         450 into the 900, at both viewports. Without it the only arrival cue is the ripple M-14
         gives every packet, a ring at [269, 406] sitting ON the Node-1 frame edge, so the beat is
         not UNMARKED without the pulse, it is marked on the point instead of on the object.
WHY NOT  match the sibling and drop it. The argument was that a Pod on a Node the narration calls
         unreachable cannot acknowledge anything, and what the pulse TARGETS answers it: M-03 pulses
         the whole Pod GROUP, which here draws the Pod OBJECT in the API, and the object is what
         changes, since this step says it gets a deletionTimestamp while the container on Node-1 is
         orphaned. Two numbers that carry no verdict: the pulse is what sets the span, 2218 with it
         against 2018 without, both inside the 3800, and neither path shows it statically, so
         `reducedLit` needs nothing and `render/reduced.test.mjs` cannot see the choice at all.
         `render/opacity.test.mjs` ORDER cannot either. It skips a fade with no pulse of its own
         (`if (!mine.length) continue`), so M-08 ORDERS a pulse and never requires one.
WIRE LABELS
         TWO REGISTERS, because one of the five strings has a lane of its own. `ctrl` sits at
         [785, 26], above the top row and centred on the controller-to-Lease relation, and carries
         what the CONTROLLER writes: the status PATCH, the taint PATCH, the DELETE, the recreate. The
         `heartbeat` string is the Kubelet's PUT, not the controller's, and the ball for it rides
         hbLane out of [293, 406], so under `T-22` that caption cannot sit over a relation that
         carries nothing on any step. It moved to `hb`, pinned on the leg it names, and `ctrl` is
         simply unwritten on that step, the way the poster step already leaves it.
         Measured at all three viewports: `hb` is anchored `start` on [303, 380] and not centred on
         the leg, because the string renders 251.5 wide at 1100x800, 258.1 at 1280x860 and 282.5 at
         1600x1000, so a box centred on the leg midpoint 466.5 reaches 607.7 at the widest and lands
         over the reschedule drop at x=600. Anchored it spans 303..585.5 worst case, box on
         368.5..383.4: 6.5 under the leg at 362, 22.6 over the frame top at 406, 34 clear of the
         eviction drop at 269, 14.5 clear of the reschedule drop at 600. The +18 under the lane is
         the catalog offset for a caption below a wire, and the panel is 279.51 deep at its worst,
         which is 1100x800 on the `evict` step and not the 194.89 of 1600x1000, so the
         caption clears it by 89 and nothing here is reachable by it.
WHY NOT  Re-centring `ctrl` on the controller spine at 600 so it reads as the controller's own
         caption, which the four remaining strings are. It moves a label on four steps to close a
         finding about a fifth, and the DELETE string measures 323.9, so centred on 600 it would
         hang 162 either side of the spine across both top-row blocks instead of between them.
WHY NOT  A caption on the controller-to-Lease relation for the `heartbeat` step. The relation is
         drawn because the flip is COMPUTED from an expired Lease, and no step puts anything on it,
         so a caption there would be a second string naming traffic that does not exist.
NOTE     THE PAIR IS NOT MIRRORED, and Node-2 is why. The frame runs 698..1140, so its TOP face
         midpoint is x=919 and the whole face sits under the ladder band at 660..1140, with the
         ladder bottom 12 units above it, so that face cannot be reached at all: the reschedule
         enters the LEFT face midpoint instead. To get there its vertical has to fall inside the
         corridor, whose centre 600 is also the controller's bottom face midpoint, so the reschedule
         takes the midpoint outright and the eviction steps aside by twice LANE_DX. OFFEDGE is
         unbothered: 24 off a 300 unit face is 8%, inside the 18% allowed for a lone endpoint.
         The reschedule also cannot mirror the eviction and jog along EV_JOG_Y, because that y is
         inside the ladder with the same 12 units of clearance.
WHY NOT  Carry the reschedule on to Pod B's LEFT face at [769, 475] instead of the Node-2 frame
         face. podB is at opacity 0 for the whole flight and materialises on the arrival, so a lane
         run to its face would end on nothing for all 1000ms of the run and then have something
         appear under its head. What the ball carries is the BIND, and `Scheduler picks the healthy
         Node-2 and Kubelet there starts it` puts the Node on the receiving end, which is the face it
         lands on. The Pod is credited by the pulse, on the same arrival, exactly as the eviction
         Pod is on Node-1: all three lanes on this card end on a FRAME and all three name their Pod
         with the pulse.
NOTE     The reschedule crosses the heartbeat's return leg at HB_JOG_Y, structural rather than
         sloppy: the heartbeat travels left-to-right along the band and the reschedule top-to-bottom
         through the same corridor. It costs nothing, because no step puts a ball on both.
DO NOT   Run the reschedule lane from Pod A's right edge to Pod B's left edge. That draws the dying
         Pod MIGRATING across to Node-2, on a card whose previous step has just left it Terminating
         with an orphaned container on an unreachable Node, which is the one thing a Node-failure
         card must not teach.
DO NOT   Draw Pod A at 0 on the evict and reschedule steps. `OPACITY.terminating` is a shade in this
         catalogue's own vocabulary and not an absence, and `Terminating` is a kubectl display rather
         than a Pod phase (CONTENT): an object with a deletionTimestamp nothing has finished deleting
         is exactly what this card is about, and drawing it as gone deletes the subject of its own
         sentence. It
         holds OPACITY.terminating, and it is the ONE thing on the Node-1 side that goes down before
         the reschedule: the frame and its two lanes hold 1.00 until then, so on
         `evict` the dying Pod is the only dim object in a lit frame, which is the point. The reschedule step brings only the REPLACEMENT to
         full, because a Pod carrying a deletionTimestamp no longer counts towards the replica total,
         which is what lets the controller create it while the old one is still on screen.
BUDGET   `taint-applied` holds 3100 and `evict` 3800. They are the two longest strings on the card,
         311 and 402 characters, and they read 9.97 and 9.45 ms per character, which sits either
         side of the catalogue median. That is the band `cluster-graceful-node-shutdown`, the other
         card in this subcategory, holds.
DO NOT   Cut either hold to 2100 or 2400 to shorten the card. The two then read 6.75 and 5.97 ms per
         character, deep in the hurried tail the timing probe ranks, and `evict` is the worse of the
         pair twice over: its span is 2218, so 182ms of a 2400 hold would stand after the motion for
         402 characters. Nor is the prose the place to buy the time: trimming a
         qualifier off either string is what turns a true sentence into a false absolute (`T-19`),
         and both of these carry one, the 300s that is added only to a Pod setting none of its own
         and the DELETE that bypasses PDBs only by contrast with kubectl drain.
         Nothing else on the card is re-paced. `heartbeat` at 11.21 and `kubelet-stops` at 12.90 are
         ABOVE the median and `not-ready` at 8.73 is under it, ordinary spread rather than a
         finding.
CONTENT  Read against the `k8sVersion` the entry carries.
         THE THREE VERBS ARE THREE DIFFERENT CALLS AND THE CARD DRAWS THEM APART. The status flip on
         `not-ready` is `PUT /api/v1/nodes/node-1/status`, because the node-lifecycle-controller
         writes it with `nc.kubeClient.CoreV1().Nodes().UpdateStatus(ctx, node, metav1.UpdateOptions{})`,
         which is an Update on the status subresource and not a patch. `PATCH` is rejected there.
         The taint on `taint-applied` IS a PATCH: `AddOrUpdateTaintOnNode` goes through
         `PatchNodeTaints`, which builds a two-way strategic merge patch and calls
         `c.CoreV1().Nodes().Patch(ctx, nodeName, types.StrategicMergePatchType, ...)`.
         The heartbeat caption is a PUT for the same reason as the first: the lease controller renews
         with `c.leaseClient.Update(ctx, leaseToUpdate, metav1.UpdateOptions{})` after setting
         `lease.Spec.RenewTime`, so `PUT lease renewTime` is the call and the field both.
         The KUBELET side of the Node status is the one PATCH the card states in prose rather than in
         a caption, `PATCHes Node.status every 5 min` on step 1, and it is correct where the
         controller's is not: the kubelet writes through `nodeutil.PatchNodeStatus`. Two different
         actors write the same subresource with two different verbs, which is why neither wording may
         be copied onto the other.
         The box sublabel is `node-lifecycle + taint-eviction`. Those are two independent components,
         split under `SeparateTaintEvictionController` and GA from 1.34, and step 5 has the
         taint-eviction-controller issue the DELETE, so a box saying only node-lifecycle-controller
         denies the actor its own next step names. Step 6 is a third controller again, the replicaset
         controller, named in words.
         The two heartbeats and their periods are the reference page's own numbers: `The kubelet
         creates and then updates its Lease object every 10 seconds (the default update interval)`
         and `The default interval for .status updates to Nodes is 5 minutes`. That page also carries
         the grace period, `NodeMonitorGracePeriod, which defaults to 50 seconds`, so the FIRST
         source is `reference/node/node-status/#heartbeats` and NOT
         `concepts/architecture/nodes/#node-status`, which is a four-bullet stub that links out and
         states none of the three.
         The 50s is the current default and the 40s a reader may remember is not: the default was
         raised in 1.32. A card on this `k8sVersion` stating 40 is stale, not wrong-by-a-decade.
         The plain DELETE on `evict` is the controller's real call, `c.CoreV1().Pods(ns).Delete(ctx,
         name, metav1.DeleteOptions{})` in `tainteviction`, which names no PodDisruptionBudget
         anywhere, and that is what earns the contrast the sentence draws with the PDB-aware Eviction
         API `kubectl drain` uses. `evicts the Pod` is rejected as the verb: this path does not go
         through the eviction subresource at all, and the whole point of the clause is that it does not.
         The toleration is added to any Pod that does not set one itself, NOT to "every Pod".
         DaemonSet Pods set theirs with no tolerationSeconds, so this path never evicts them, which
         is why the DaemonSet agents survive the eviction the card shows.
         The Lease age moves to `over 350s` on the EVICT step, not on the reschedule. The toleration
         expiring IS 300s after the 50s grace period, so a Lease still reading 52s while the eviction
         timer reads 0s would be two clocks disagreeing on one card. It is the one Lease age change
         after `not-ready`, so evict lights it and reschedule, where it does not move, does not.
         THE TERMINATING POD HAS THREE EXITS AND THE STEP NAMES ALL THREE. `the API can only finish
         the delete once the Kubelet confirms it` is REJECTED as a `T-19` absolute with a documented
         counter-case: `The only ways in which a Pod in such a state can be removed from the apiserver
         are as follows: The Node object is deleted (either by you, or by the Node Controller). The
         kubelet on the unresponsive Node starts responding, kills the Pod and removes the entry from
         the apiserver. Force deletion of the Pod by the user.` The step ships
         `the entry clears only when the Kubelet answers, the Node object is deleted, or someone
         forces it`, which is that list in the card's own words, and `Force Delete StatefulSet Pods`
         is in `sources` for it. The 25 characters it costs are paid out of the hold and not out of
         another clause: 402 characters at 3800 reads 9.45 ms per character, and the panel is 279.51
         deep at 1100x800 on this step, the same number it was at 377.
         `TERMINATING IS NOT A POD PHASE.` The reference is explicit: `Make sure not to confuse
         Status, a kubectl display field for user intuition, with the pod's phase.` The narration says
         `sits in Terminating`, which is the kubectl display and is correct. Where this record calls
         Terminating a phase it means the card's own OPACITY vocabulary, `OPACITY.terminating`, and
         nothing about the Pod API, whose phases are Pending, Running, Succeeded, Failed and Unknown.
         THE LADDER RUNG `3. NotReady` IS CORRECT ON A CARD ABOUT `Unknown`, and it is not a
         contradiction to fix. `kubectl get nodes` prints the Ready condition as `Ready` only when it
         is `True` and as `NotReady` for everything else, `Unknown` included:
         `if condition.Status == api.ConditionTrue { status = append(status, string(condition.Type)) }
         else { status = append(status, "Not"+string(condition.Type)) }` in `printers.go`. The rung
         names the display and the condition value in one line, which is why it carries both.
         THE FIRST SOURCE CONTRADICTS ITSELF AND THE CARD FOLLOWS THE RIGHT HALF. `#heartbeats` says
         `the 40 second default timeout for unreachable nodes`, and the Conditions section of the SAME
         page says `node-monitor-grace-period (default is 50 seconds)` and `NodeMonitorGracePeriod,
         which defaults to 50 seconds`. 50 is the current default and 40 is the stale sentence, so
         `50s` is not to be "corrected" to 40 by a reader who opens only the anchor.
         THE TAINT-EVICTION-CONTROLLER IS A SEPARATE COMPONENT ON THIS RELEASE. `SeparateTaintEvictionController`
         is GA from 1.34, and the taint-and-toleration page still carries the pre-split sentence `The
         node lifecycle controller also evicts pods`. The split one is the card's: the node lifecycle
         controller applies the taint and the taint-eviction-controller deletes, which is what the box
         sublabel `node-lifecycle + taint-eviction` draws.
         VERIFIED AND UNCHANGED, so nobody re-derives them: Lease renewal is `Update` and not a patch
         (`c.leaseClient.Update(ctx, leaseToUpdate, metav1.UpdateOptions{})` after setting
         `lease.Spec.RenewTime`), the kubelet writes its own Node status with `nodeutil.PatchNodeStatus`,
         the eviction is `c.CoreV1().Pods(ns).Delete(ctx, name, metav1.DeleteOptions{})` in
         `tainteviction` and `PodDisruptionBudget` appears nowhere in that file, the 10 second Lease
         interval and the 5 minute status interval are the reference page's own numbers, and
         `node.kubernetes.io/unreachable` corresponds to `Ready` being `Unknown`.
NOTE     AN API PATH CARRIES THE OBJECT NAME, SO IT IS LOWERCASE. The two `ctrl` captions read
         `PUT /api/v1/nodes/node-1/status` and `PATCH /api/v1/nodes/node-1 · spec.taints`, because
         RFC 1123 allows lowercase alphanumerics and dashes only and a reader who copies a path with
         a capital in it gets a name the API would reject. `cluster-taints-tolerations` was brought
         to the same spelling in the same pass, so the two cards that draw this call agree.
         THE FRAME LABEL STAYS `Node-1` and so does every prose mention of the Node. A label is a
         display name, `T-12` renders it uppercase anyway, and it is the catalogue convention on 50
         cards. The rule the pair now follows is that a name STATED AS AN OBJECT is lowercase and a
         name stated as a caption or a block title is not.
DO NOT   "fix" `Node-1` in the narration or on the frame to match the paths. Those are the two
         registers this card deliberately keeps apart, and making them uniform loses the display
         name the other 49 cards share.
SCOPE    The general mechanism belongs to cluster-taints-tolerations: the three effects and the line
         between a gate on the way in and an eviction that reaches a bound Pod, how a key, an
         operator and an effect decide whether a toleration matches, and what tolerationSeconds is.
         This card opens none of it. `taints it so that the Pods are eventually evicted` is one step
         here and `the default toleration` is one chip, and both stay unopened on purpose.
         What stays HERE is the CASE. `node.kubernetes.io/unreachable` and the not-ready taint
         beside it are the built-in taints this path applies, the 300 seconds is the toleration the
         admission controller adds for exactly those two keys to a Pod that sets none of its own,
         and those 300 sitting on top of the 50 second grace period is what makes recovery take
         minutes. That arithmetic is the answer to this card's own question.
         cluster-taints-tolerations states the 300 once, in one narration, and points back here by
         title rather than drawing either built-in taint.
NOTE     SIX chips, not five: the grid is three wide, so five left a hole. The one worth adding was
         the THRESHOLD, `grace period`, beside `Lease age`, which is what makes 30s of staleness
         harmless and 52s fatal. The rows are meaningful now: Ready / Lease age / grace period is
         "is the Node alive", Taint / Toleration / eviction timer is "what happens to its Pods".
```

### poster

```
Sentence: the pulse stops, and after that almost all of it is waiting.

Two beats, then a long flat line running straight into a two-segment wait. The accent is the long
segment, not the outcome,
because the card is about how long recovery takes by design.

Segmented bar read as TIME rather than as capacity, with a flatline lead-in. The pattern library
names no flatline family: nothing else in the catalog draws a pulse, which is most of why this
composition is legible at 200px next to its own subcategory.

The two track blocks TOUCH at x=170 instead of being spaced. One continuous wait split into two
stages is the sentence, and a gap would read as two separate objects.

The trace carries opacity 0.8 so the 0.9 accent bar wins the eye first (`R-03`). Full strength
spikes at plus or minus 48 out-shout the accent.

WHY NOT a ghost Node frame to a solid Node frame with a dashed leg between.
cluster-node-drain is that exact composition, in the same node-lifecycle row of
the contact sheet, down to the accent bar in the right-hand inner block. Neither tile could be told
from the other without its title, and node-drain keeps the shape because moving work off a Node
deliberately IS its sentence.

WHY NOT a Pod block after the track, closing the story with the reschedule. It is a fourth element
the sentence does not need (`R-02`), and the track already ends at 302 of 320.

WHY NOT dashed vertical legs dropping from the trace to a track below it. Trace, two legs and a
track read as one hollow rectangle with a squiggle beside it rather than as a timeline.
```
