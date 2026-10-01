## workloads-pod-resize

### layout

```
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
         puts its pipeline, and the branch takes it instead: the decision with three outcomes is
         what this card is about, and a ladder would restate the six narrations a second time in the
         one place the picture has to argue something.
         WL.L-02 asks for an actor row centred on CX and this row is not: API 484..716 and kubectl
         908..1140 centre on 812. The reversal above is the reason and it is deliberate. The half of
         WL.L-02 that binds is the left edge, and 484 clears the 420 floor by 64. WL.L-07 holds
         exactly: the box the trunk leaves is the API, and it is centred on WL.SPINE_X.
         KUBECTL IS RIGHT-ALIGNED ON CONTENT_R AND NOT SET OFF THE API BY A GAP, `CONTENT_R - BOX_W`
         = 908..1140. Its right edge lands on the rail the verdict pair, the Node frame and the
         right chip column already stand on, instead of stopping 136 units short of it at 1004 and
         being flush with nothing. The old form was `API_R + TOP_GAP` with TOP_GAP 56, and that
         constant is gone with it rather than left unread.
         THE CONSTRUCTION IS NOT NEW HERE. `cluster-pod-priority-preemption`,
         `cluster-node-pressure-eviction`, `cluster-graceful-node-shutdown`, `cluster-oom-kill` and
         `cluster-node-drain` all write the same formula for the same 232 wide top-right box and all
         land on the same 908..1140, and their records carry the same 136 and the same argument. IT
         COSTS THE MATCH WITH cluster-static-pods, and that is the trade to know about, because the
         paragraph above cites that card twice as the model for the reversal. The reversal is still
         the model. The 56 unit gap is not: of the two cards holding a right-hand top box at
         772..1004, only cluster-static-pods still does. THE RAIL PAYS FOR ITSELF IN THE BALL, which
         is not why it is taken, and the cluster records call the same gain by the same name. At a
         56 unit top-row lane, under the PKT_DUR_MIN floor, `routeDur` clamps and the ball crawls at
         0.080 units per ms, near the slowest end of the ranking `pace.mjs` prints. At 192 units it
         runs 0.274, above the catalog median that tool reads out, and it is a length several
         sibling cards also run. No `dur` is written anywhere for it: `F.top` holds a fixed 700
         whatever the distance, which is why the step SPANS did not move and only the speed did.
         `pace.mjs` prints both readings.
         The `top` wire label follows the pair by construction, `midX(API_R, KUBECTL_X)` moving 744
         to 812, and the longest string on it, the full PATCH path, measures 639.7..984.3 above a
         row whose boxes start at 40, so it clears them in y and needs no slot of its own.
         A six-row ladder in the 660..1140 middle band, which is what LAYOUT.C puts there, would
         fit: six narrated steps need six rows, 242 units at WL.ROW_H 32 and WL.ROW_GAP 10, against
         a band between the top row at 120 and the frame at 394 of 274, so 16 units stand at each
         end. It is declined because the verdict pair needs the same band and says something the
         narration cannot: that the Kubelet decision has three outcomes and only one of them
         continues down the spine.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport: `OVERLAY_IDS=workloads-pod-resize node
         --test report/overlay.test.mjs`. Deepest on `apply` at 1100x800, against a frame top at
         394, so 114.49 units stand clear. Nothing is derived from the reading, and BUDGET carries
         the character ceiling it floors.
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
         workloads-pod-qos-classes, workloads-pod-restart-policy and
         workloads-image-pull-registry-auth all carry, so the second row ends on the 624 canvas
         floor.
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
         EVERY DURATION IS SET FROM THE CHARACTER COUNT, at the catalog median ms per character
         `timing.mjs` prints: 2800 / 2900 / 3700 / 3300 / 3700 / 3000 for 279 / 288 / 371 / 331 /
         371 / 299 characters, which lands the six between 9.97 and 10.07 and puts every one of them
         in the middle of the ranking that tool reads out. They are not tuned per step and there is
         nothing to preserve in any one of them except that ratio: a reworded narration moves the
         character count and the duration follows it.
         THE STILL TIME IS THE PRICE OF THAT PACE AND IS NOT A SECOND DIAL. `deadair.mjs` reads this
         card above the catalog median it prints, and the tool names the pair that is a finding: a
         step high on still AND hurried on ms per character. This card is high on one and median on
         the other, so the hold is buying reading time rather than holding an empty screen. `policy`
         is the extreme at 100 percent and sits at the stillest end of that ranking, which is what a
         step with no motion reads by construction: the fix `deadair.mjs` names for it is the
         NARRATION or the MOTION, and the motion is ruled on two paragraphs up.
WIRE LABELS
         Four slots. `top` sits at 744 above the row, because the spine owns everything under it.
         `spec` and `branch` share ONE row at y=173, anchored start at 612 and at 840. They are two
         labels rather than one only because the longest `spec` string ends short of 840: at 27
         characters `spec.containers[].resources` runs 612..798.1, so 41.9 units stand between them.
         THE SLOT TAKES 33 CHARACTERS AND NOT 37. The band is 228 units and wire text inks 6.89 per
         character, the same rate `SIZES` uses for `.scheme-chip-text`, so 228 / 6.89 is 33.1 and a
         string that reaches it TOUCHES rather than clears. A 37 character cap was read off 6.13
         units per character and is refuted by measurement: `watch · spec.containers[].resources` at
         35 characters runs 612..853.2 and overlaps the `branch` slot by 13.2 units.
         WHICH IS WHY THE SLOT CARRIES THE FIELD ALONE and not the `watch ·` prefix the exchange
         would otherwise take. The word is not lost, the `admit` narration opening on `The Kubelet
         reads the new spec off its watch`, and the label then reads as the exact chip the arriving
         ball moves. Restoring the prefix needs the `branch` slot moved right, which is geometry and
         belongs to a separate decision.
         THE `top` SLOT NAMES THE REQUEST AND THEN ITS ANSWER, in that order, because ONE label
         stands over TWO balls: the row draws an outbound ball and a return ball on every step that
         uses it. `resize refused at admission · the QoS class is fixed` is rejected for the `qos`
         step on that count alone. It named the RESPONSE only, so a reader stopped mid-step saw a
         refusal travelling from kubectl INTO the API, and the same slot two steps earlier named the
         REQUEST (`PATCH /api/v1/namespaces/default/pods/web-1/resize`), which made one slot mean
         opposite directions on two steps drawing the identical exchange. `PATCH .../resize ·
         refused at admission` reads in ball order. The path is elided because step `patch` already
         spells it in full and nothing else on the card addresses another one, and the dropped tail
         `the QoS class is fixed` is the narration first sentence restated.
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
         1.35 IS WHERE IT WENT STABLE AND NOT WHERE IT BECAME POSSIBLE. Alpha is v1.27, Beta v1.33
         and Stable v1.35, each announced under its own release blog, and the resize subresource is
         what the v1.32 kubectl floor below is about. A desc reading `Since 1.35 you can patch
         spec.containers[].resources through the resize subresource` is rejected on that: it was
         patchable through the beta, enabled by default, and it also disagreed with the `running`
         step of this same card, which says `In-place Pod resize is stable in 1.35`. The desc now
         opens that clause `In-place resize is stable in 1.35:` and the two agree.
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
         `UpdateContainerResources` is a real CRI rpc and is not invented for the wire label. It is
         declared in cri-api `pkg/apis/runtime/v1/api.proto` as
           // UpdateContainerResources updates ContainerConfig of the container synchronously.
           rpc UpdateContainerResources(UpdateContainerResourcesRequest) returns (...)
         and the Kubelet reaches it from `doPodResizeAction` through `updateContainerResources` in
         `pkg/kubelet/kuberuntime/kuberuntime_manager.go`, which is the in-place path and not the
         create path. The RUNTIME is what touches the cgroup, which is why the narration says the
         Kubelet drives it rather than that the Kubelet writes the file. The card plays a CPU-only
         resize, and that is a choice the picture forces. resizePolicy on this Pod is `cpu
         NotRequired · memory RestartContainer`, and the page says a change to both resources at
         once restarts the container, so a patch moving cpu AND memory would make the `apply` step
         narrate a restart while its own wire label claims the limit was rewritten on the live
         container. With cpu alone the two agree: cpu.max moves from 70000 100000 to 80000 100000,
         restartCount stays 0, and the memory half of the policy is stated in words on the `policy`
         step, which is where it belongs.
         The cpu.max arithmetic is the sibling card's, not restated here: a 800m limit against the
         default 100ms period is 80000 100000, the same spelling cluster-cpu-throttling uses.
         THE RESTART RULE IS ABOUT POLICIES THAT DIFFER, not about two resources moving. KEP 1287:
         `If more than one resource type with different policies are updated at the same time, then
         RestartContainer policy takes precedence over NotRequired policy.` So `Change both
         resources at once and the restart wins` is rejected, and this record asserting that the
         page says a change to both resources restarts the container is rejected with it: two
         resources both on NotRequired restart nothing. The step says `Change two resources whose
         policies differ and RestartContainer takes precedence`. The QoS clause is the pod-qos page
         verbatim: `The QoS class is determined when the Pod is created and remains unchanged for
         the lifetime of the Pod. If you later attempt an in-place resize that would result in a
         different QoS class, the resize is rejected by admission.` That is why the `qos` step
         refuses the patch AT THE API and not at the Kubelet, and it is a different refusal from
         Infeasible, which is a Kubelet verdict on a resize that was admitted. The step says so, or
         the card would draw two rejections that look like one. UNVERIFIED, and nothing on the card
         asserts it: the HTTP status and error shape an admission refusal of a QoS-changing resize
         returns. The pages say `rejected by admission` and stop, so the wire label says `resize
         refused at admission` and names no code. `allocatedResources` stays off the chips. The page
         marks `status.containerStatuses[*].allocatedResources` Advanced and says to focus on
         `status.containerStatuses[*].resources` for monitoring and validation, and a fifth chip
         would need a third strip row, which ends at 666 on a 640 canvas.
         The `resources` field is not "fixed" to read immutable on the strength of the Pod v1
         reference saying `Compute Resources required by this container. Cannot be updated.` That
         line is stale against the resize subresource, and the task page is the authority the card
         follows: the same reference documents `resizePolicy` and the two conditions on the same
         page.
BUDGET   The bottom is QUANTIZED by the line height, so it steps rather than slides: 353 characters
         reads 279.51 while 352 read 254.66, one whole line for one character. Budget in lines, not
         in characters, and re-measure after ANY prose edit. The ceiling is roughly 490 characters,
         which is four more lines, and it is a property of the FRAME at 394 rather than of the
         current text. The frame moved down 14 units with the category change and that buys no extra
         line, because a line is 24.85.
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
         That clause carries `under NotRequired` and cannot drop it. KEP 1287: `If the memory resize
         restart policy is NotRequired (or unspecified), the Kubelet will make a best-effort attempt
         to prevent oom-kills when decreasing memory limits`, and the check is `Before decreasing
         container memory limits, the Kubelet will read the container memory usage. If usage is
         greater than the desired limit, the resize will be skipped for that container.` This Pod
         carries `memory RestartContainer` on a chip two rows under that sentence, where the path is
         a restart and not a skip, so the unqualified wording described a policy the canvas denies.
         Capacity and Allocatable arithmetic is `cluster-node-allocatable`. Infeasible names the
         Node not fitting the request and stops there.
         The container restart machinery is `workloads-container-states` and
         `workloads-pod-restart-policy`. RestartContainer is named as a policy value and the card
         never plays a restart.
         The container RUNTIME is named by the `apply` step and drawn by neither that step nor any
         other, which breaks T-21 on purpose. A runtime block would need a fourth box in a middle
         tier already holding the Kubelet and both verdicts, and the CRI stack is
         `cluster-pod-sandbox-cri`, which draws it. The rpc name carries the fact instead. No
         autoscaler appears anywhere on this card. This catalogue covers upstream core and has no
         VPA, HPA, Cluster Autoscaler or KEDA card, so a resize here is something a human or a
         controller outside the picture asked for, and the card never says who.
NOTE     Eleven parts carry role: 'cluster': kubectl, the API, the Kubelet, both verdict boxes, the
         two top arrows, both spine legs and the two verdict relations. The kit binds role
         'workloads', so a card here writes a role ONLY to draw the control plane acting on a Pod,
         and all 19 siblings do it (3 to 10 sites each). Without them this was the only workloads
         card painting its actors in the category blue, which render/palette.test.mjs caught as a
         30th category+class+role+state combination: no workloads card had ever drawn a
         workloads-role arrow. The Pod, the Node frame and the chip strip stay workloads blue. The
         two VERDICT boxes are the one judgement call. They are Pod status conditions, which argues
         workloads, and they are the Kubelet's own output drawn in the Kubelet's band, which argues
         cluster. Taken as cluster, with the band winning over the field.
OPEN     CENTRE-LOW, `report/geometry-soft.test.mjs`: `5 blocks below the panel span 390..1140,
         centre 765`. THE NUMBER MOVES WITH THE RIGHT RAIL and the reading above is taken before
         kubectl was right-aligned on CONTENT_R, so re-read it from the report rather than from here
         after any move in the top row. `report/geometry-soft.test.mjs` run ALONE prints zero
         findings for every card, carried ones included: it needs the shared catalog walk that `npm
         run report` primes, so the full run is the only authority for this row. CARRIED, and the
         reason is the reversal `LAYOUT` already argues: the API sits on WL.SPINE_X so the whole
         write descends one straight spine, which puts kubectl to its RIGHT, and the band x 60..484
         between the panel and the frame therefore stands empty on every step. It is bare at
         1600x1000, where the panel stops at 177.44, and covered at 1100x800, where it reaches
         279.51.
         TWO ROUTES WERE COSTED AND BOTH MOVE THE HOLE. kubectl on the left at 196..428 centres the
         actor row on 456, which leans the row the other way and leaves the verdict pair at
         840..1140 alone on the right. The chip strip pulled up into the 424 x 114 band at 60..484 /
         280..394 fits on width, the longest row measuring 82.7 of name against 282.5 of value, and
         empties the 548..624 strip instead, against a CHIPS_Y 548 that four sibling cards carry as
         LAYOUT.C.strip.two.
         The rule can only be satisfied by making the picture worse, which is L-16. The reason ships
         in `test/fixtures/carried.mjs` so the row prints CARRIED rather than as a queue entry.
```
