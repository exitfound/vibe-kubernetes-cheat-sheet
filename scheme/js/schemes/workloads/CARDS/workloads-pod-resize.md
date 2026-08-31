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
         A six-row ladder in the 660..1140 middle band, which is what LAYOUT.C puts there, would
         fit: six narrated steps need six rows, 242 units at WL.ROW_H 32 and WL.ROW_GAP 10, against
         a band between the top row at 120 and the frame at 394 of 274, so 16 units stand at each
         end. It is declined because the verdict pair needs the same band and says something the
         narration cannot: that the Kubelet decision has three outcomes and only one of them
         continues down the spine.
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
         workloads-pod-qos-classes, workloads-restart-policy, workloads-image-pull-registry-auth and
         workloads-pvc-stickiness all carry, so the second row ends on the 624 canvas floor.
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
         The `spec` slot takes no longer string: past about 37 characters it closes that 68.5 unit
         gap and the two stop reading as separate labels on one row.
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
CONTENT  `allocatedResources` stays off the chips. The page marks
         `status.containerStatuses[*].allocatedResources` Advanced and says to focus on
         `status.containerStatuses[*].resources` for monitoring and validation, and a fifth chip
         would need a third strip row, which ends at 666 on a 640 canvas.
         The `resources` field is not "fixed" to read immutable on the strength of the Pod v1
         reference saying `Compute Resources required by this container. Cannot be updated.` That
         line is stale against the resize subresource, and the task page is the authority the card
         follows: the same reference documents `resizePolicy` and the two conditions on the same
         page.
BUDGET   The panel reaches y<=279.51 at 1100x800, on `apply` at 353 characters, against a frame top
         at 394, so 114.49 units stand clear. The extent per viewport is printed on demand by
         `OVERLAY_IDS=workloads-pod-resize node --test report/overlay.test.mjs`.
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
workloads-pod-lifecycle-phases, workloads-container-states, workloads-crashloopbackoff and
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
