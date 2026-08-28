## cluster-oom-kill

### layout

```
WHAT     A container exceeding memory.max: the kernel's cgroup OOM killer, the SIGKILL, and the
         Kubelet learning about it through PLEG.
LAYOUT   The kernel right-aligns on CONTENT_R, so it runs 908..1140, level with the ladder, the
         right chip column and the Node frame. A fixed 56 units from the Kubelet instead puts it at
         716 + 56 = 772 and ends the block on 1004, 136 short of the content edge and flush with
         nothing.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 279.51 at 1100x800 step 3, shallowest 125.11 at
         1600x1000 step 0, a swing of 84.62 units. The Node frame at y 388 clears the deepest bottom
         by 108.49.
SIZES    The Node frame is 144 / 110 / 20 (NODE_H / POD_H / POD_Y - NODE_Y), not the cluster family
         of 152 / 106 / 34 that CLU.L-01 names. It is a measurement of this card and not a second
         family: 20 of top padding, 110 of Pod, 14 of floor. The short top padding is legal because
         the Pod row clears the frame label HORIZONTALLY rather than below it. Measured at 1100x800,
         `Node-1` occupies x 72..112.1 and y 395..409.7 while the Pod runs x 360..840 from y 408, so
         the two overlap by 1.7 units in y and are 247.9 apart in x. The Pod is 4 units taller than
         the family because its inner container box carries a sublabel that changes on every step.
MOTION   Two deferred turnovers, the network-dns-ndots shape. `observe` holds container state until
         the PLEG relist result lands (700ms). `restart` holds the container sublabel AND the three
         moving chips until create.arrivalMs: pinning at entry put a running container with
         restartCount 1 on screen while the box was still a 0.12 ghost. The sublabel is deferred WITH
         the chips deliberately, or `using 120Mi of 256Mi` sits on the box beside a chip reading
         `near 0`.
WIRE LABELS
         ONE wire slot, at WIRE_X 812 and WIRE_Y 26, above the top row rather than between the two
         lanes, because the spine owns everything below the row. It is a ROW CAPTION and not a lane
         label on three of the five steps: `allocate`, `cgroup` and `oomkill` are in-place kernel
         events with no ball on either lane, so what the slot names there rides nothing. This breaks
         T-22 on purpose. The alternative is a slot that goes blank on the three steps the card is
         actually about, which leaves the top row silent through the whole kill.
CONTENT  The oom_score_adj chip carries `900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000`,
         which moved off the narration to buy nine lines back. The 900 is the worked example in
         pkg/kubelet/qos/policy.go, a container requesting 10 percent of Node memory. The narration
         says the value is applied at container start FROM THE QoS CLASS, which is true of all three
         classes.
         THE FLOOR IS 3 AND kubernetes.io SAYS 2. Node-pressure Eviction publishes the table as
         `min(max(2, 1000 - (1000 x memoryRequestBytes) / machineMemoryCapacityBytes), 999)`, and the
         kubelet returns `1000 + guaranteedOOMScoreAdj` = 3:
           if int(oomScoreAdjust) < (1000 + guaranteedOOMScoreAdj) {
             return (1000 + guaranteedOOMScoreAdj)
           }
         The chip follows the IMPLEMENTATION, which is what runs, and the doc table is stale on that
         one bound. DO NOT change it to 2 to match the page: the page is cited so a reader can find
         the table, not because it is the authority on the floor. The ceiling 999 agrees both ways,
         because a computed 1000 returns 999.
         The same page notes a second -997: `the kubelet also sets an oom_score_adj value of -997 for
         any containers in Pods that have system-node-critical Priority`. The chip legend does not
         carry it. It is a Priority exception rather than a QoS tier, and the chip is already the
         widest string on the card.
         DO NOT write `by memory request` there. Only Burstable scales with the request across 3 to
         999; Guaranteed is a flat -997 and BestEffort a flat 1000, and neither reads a request at
         all. Attached to a sentence about all containers it is a false absolute of exactly the shape
         a cut qualifier produces.
         The value is `applied` at container start, not `written`: the Kubelet passes it in the CRI
         create call and the RUNTIME touches /proc/PID/oom_score_adj.
CONTENT  The RUNTIME writes memory.oom.group, the Kubelet only asks for it, and it happens at
         container CREATE and never at the kill. Verified against
         pkg/kubelet/kuberuntime/kuberuntime_container_linux.go:
           if isCgroup2UnifiedMode() && !ptr.Deref(m.singleProcessOOMKill, true) {
             resources.Unified = map[string]string{"memory.oom.group": "1"}
           }
         which sits in `generateLinuxContainerResources`, reached only from
         `generateLinuxContainerConfig` (the CRI create call) and `generateContainerResources` (an
         in-place resize). The oomkill step therefore says the runtime SET the flag AT CONTAINER
         START, matching both the sibling clause about oom_score_adj in the same sentence and the
         restart step's wire label, `new container · memory.max + oom_score_adj applied`.
         DO NOT put that clause in the present tense: it places a cgroup write inside the kill that
         the card itself draws one step later.
         The `ptr.Deref(..., true)` reads as though single-process were the default. It is not: the
         KubeletConfiguration doc on SingleProcessOOMKill says "On cgroup v2 linux, null / absent,
         true and false are allowed. The default value is false", so the nil fallback is defensive
         cover for non-Linux and cgroup v1 and on cgroup v2 the effective default is group kill.
         singleProcessOOMKill is a FIELD, not a feature gate, and an opt-OUT: a footnote rather than
         a condition, which is why it is not worth any of this card's narration budget.
CONTENT  The group kill is CONDITIONAL and both the desc and the oomkill step carry the condition.
         Under cgroup v1, and under cgroup v2 with singleProcessOOMKill true, the kernel kills the
         single worst offender instead. A desc reading `SIGKILLs every process in that container at
         once` with no `under cgroup v2` beside it contradicts the step that draws the same event.
CONTENT  `lastState.terminated` is CEDED and this block is kept for whoever tries to bring it back.
         The clause `After the restart this record moves to lastState.terminated, which kubectl
         describe prints as Last State` stood on `observe` and was removed: it is the whole subject of
         `workloads-container-states`, and `cluster-image-container-gc`'s own SCOPE already
         states the rule (`lastState, restartCount and CrashLoopBackOff belong to
         workloads-container-states and workloads-crashloopbackoff`). What stays here is the record
         the KILL writes, `state.terminated` with reason OOMKilled and exit 137, which is what this
         card's desc promises. Where it moves afterwards is a pointer by title.
         The verification survives the cession, because it is what a re-add would get wrong:
         `lastState.terminated` reaches `kubectl describe` and NOT `kubectl get`. describe prints it
         under the heading `Last State`, off `status.LastTerminationState` (kubectl
         pkg/describe/describe.go, `describeStatus("Last State", status.LastTerminationState, w)`).
         The STATUS column of `kubectl get` is computed in printers.go from the CURRENT state only,
         `container.State.Waiting.Reason` then `container.State.Terminated.Reason`, so once the
         container is Running again that column reads Running. `LastTerminationState` is read there
         for one thing alone, the FinishedAt behind the RESTARTS `(x ago)` suffix. `which is what
         kubectl describe and get show` is therefore rejected: it promises a reader a record that
         `get` never prints.
CONTENT  Claims read against the k8sVersion this card carries, and each holds as drawn.
         `PLEG on its next relist` is the DEFAULT path: EventedPLEG is Alpha and off, and the gate
         doc adds that the kubelet falls back to generic PLEG anyway when the runtime announces no
         lifecycle events.
         `Kubelet PATCHes the container status` is a real PATCH on the status subresource,
         `Pods(ns).Patch(ctx, name, types.StrategicMergePatchType, patchBytes, ..., "status")` in the
         kubelet status manager, not a PUT.
         `swap is disabled on most Kubernetes Nodes` survives NodeSwap going GA, because GA moved the
         gate and not the default: the swap page states `NoSwap (default)` and `By default, the
         kubelet will not start on a Linux node that has swap enabled`.
         `restartPolicy is Always (the default)` is the pod-lifecycle page verbatim. The 10s to 300s
         backoff and the 10 minute reset are verified off the same page and are NOT on the
         card: see the CEDED block above for why, and note that the page carrying them is cited by
         `workloads-crashloopbackoff` and by NO source of this card, which is the second reason they
         do not belong here.
CONTENT  The `Resource Management` source carries the CARD, `memory limits are enforced by the kernel
         with out of memory (OOM) kills ... terminations only happen when the kernel detects memory
         pressure`, which is why steps 2 and 3 spend a beat on reclaim before the kill. `Pod QoS
         Classes` carries the CLASSES and contains no oom_score_adj string at all, so
         `Node-pressure Eviction` is cited beside it as the page that still publishes the table and
         the Node-level OOM ordering the oomkill step's last sentence describes.
BUDGET   Panel x<=397, y<=280 at 1100x800 on the oomkill step at 408 characters. Measured 396.55 by
         279.51, against a frame top at 388, so 108.5 units stand clear. The ceiling is roughly 570:
         the longest narration that keeps the panel off a frame at 388, which is a property of the
         FRAME and not of the current text.
SCOPE    The container RUNTIME is named by two steps and drawn by neither. It writes memory.oom.group
         and /proc/PID/oom_score_adj, and both facts are told in words. A runtime block would need a
         third box on a top row already at 908..1140, and the card is about WHO KILLS rather than
         about the CRI stack, which is cluster-pod-sandbox-cri. This breaks T-21 on purpose.
         THE POST-MORTEM RECORD is workloads-container-states: lastState, restartCount as a counter
         and `kubectl logs --previous`. Here the kill writes `state.terminated` with reason OOMKilled
         and exit 137, `restartCount` is one chip reading 0 then 1, and `observe` points at that card
         by title for what the record becomes after the restart.
         THE BACKOFF CURVE is workloads-crashloopbackoff: the 10s doubling, the 5 minute ceiling and
         the 10 minute reset. `restart` names CrashLoopBackOff as the thing repeated kills trip and
         opens none of it, which is the same shape the two clauses above take. Both cessions are the
         rule cluster-image-container-gc's SCOPE already states for this exact pair of siblings,
         and both clauses stood on this card until they were removed.
NOTE     The kill dims the whole Pod GROUP, shell included. Fading only the inner container box on
         the argument that the sandbox survives reads as a half-finished render rather than as a
         statement. Opacity lives on podGroup and NEVER on containerBox, or the two multiply into a
         shade that is in no vocabulary. The cost is accepted: the picture does not say the sandbox
         outlives the container, and that fact moved into the restart step in words.
NOTE     NO relationship line to the ladder, deliberately. The tie is only honest when ONE drawn block
         owns every row, and here `allocate` is the workload, `cgroup` and `OOMKill` are the kernel,
         `observe` and `restart` are the Kubelet: three owners in five rows. Hanging the ladder off
         the Kubelet would say it performs all five, which is what the card exists to deny.
NOTE     `container state` reads `Running · not yet observed` on the kill step and turns over to
         `Terminated · OOMKilled · 137` on observe. containerStatuses[].state really IS still Running
         until PLEG relists and the Kubelet PATCHes, which is exactly what observe is about, so the
         value stays and now says why. `report/arrival.test.mjs` carries that as an R2-STEP finding
         (text changed, no highlight) and it stays carried: the FACT did not change, so a cue would
         announce a turnover a step before the one the card is built to deliver.
         `memory.current / max` reads `near 0 / 256Mi · processes killed` on observe, not `256Mi /
         256Mi · at limit` beside a container the same step calls terminated. It is `near 0` rather
         than `0` on purpose: a terminated container's cgroup outlives it until the Kubelet
         garbage-collects it and still holds residual charge, and a flat 0 would be one of the false
         absolutes this project keeps paying for.
NOT A DEFECT
         The `observe` step is not a return the motion never delivers. What it animates IS the claimed
         return: PLEG spotting the dead container travels kernel -> Kubelet on the answer lane of the
         pair, the correct direction. The other movement the sentence names, the Kubelet PATCHing
         status, goes to an API this card does not draw, and the Kubelet sublabel accounts for it in
         words. A return has to have somewhere on the canvas to go.
NOT A DEFECT
         On the oomkill step the container box reads `OOMKilled · SIGKILL` from step entry while the
         `container state` chip beside it still reads `Running · not yet observed` and the Pod holds
         full opacity until the fade at 700ms. The two are not in contradiction, they are the whole
         distinction the card draws: the box is the container's real state and the chip is what the
         API has been told. Deferring the sublabel to the fade would collapse that gap into one beat
         and leave the box silent on the step it belongs to.
```

### before `      F.route({ points: NODE_CONNECTOR, name: 'create' }),`

```
Kubelet creates the new container on the node (connector) and rewrites its cgroup
(top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
not chained). The container pulses and re-materialises on arrival.

The connector runs Kubelet bottom face to Node frame top face, 268 units on the spine, and stops on
the FRAME rather than on the Pod shell. routeDur is length-based, so moving either end is a timing
change and the span of every step has to be re-read (A-11, M-20).
```

### before `      F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, name: 'relist', lights: ['kubelet'] }),`

```
The lower lane of the top pair, which is this card's answer direction: the relist result travels
kernel -> Kubelet. `lights: ['kubelet']` fires on its arrival rather than at step entry, and the
`F.set` next to it hangs the container-state turnover off the same arrival.

Why the step is not a return the motion fails to deliver is the NOT A DEFECT block above.
```

### poster

```
Sentence: the container fills its limit, and the kernel is what kills it.

A container box filled at 0.16 nearly filling its frame, and a lightning bolt drawn over it with
two short spurs. The fill is the memory used against the limit the frame draws, and the bolt is the
kernel doing the killing: the poster is about WHO kills, so the bolt gets the heavier stroke (2.1)
and the box gets no outline of its own.
No Pod, no Kubelet, no chips: everything that is not the cap and the strike is dropped.
```
