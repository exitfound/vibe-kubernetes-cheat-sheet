## cluster-node-pressure-eviction

### layout

```
WHAT     The Kubelet evicting under memory pressure: the threshold, the ranking, the kill, and the
         condition clearing after the transition period.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 279.51 at 1100x800 step 2, shallowest 107.67 at
         1600x1000 step 0, a swing of 102.07 units on step 2 alone. The chip column starts at y 296
         and clears the deepest bottom by 16.49, which is the tightest clearance on the card and
         what floors the chip strip.
WHY NOT  A bus at BUS_Y with a tap into the BestEffort Pod. A lane that crosses the frame and picks a
         Pod out of the row reads as plumbing rather than as a kill. Which Pod dies is carried by the
         pulse.
NOTE     The API block was added because THREE of the five steps say the Kubelet writes to the API and
         the card drew no API at all, so that traffic was narrated and never shown. Two of those steps
         animated NOTHING (span 0 and 900 with zero packets), which no check can see: `render/duration.test.mjs`
         only asks whether a step outlasts its own motion, and a step without motion passes trivially.
         API is 232 wide at CONTENT_R - API_W = 908..1140, right-aligned with the ladder AND the Node
         frame. The whole left half of the top row stays empty because that is the panel's corner:
         the L-shaped safe zone used rather than fought.
         ONE lane, one direction, at the shared face midpoint y=80. No step names anything coming back
         from the API, so a return pair would be decoration.
LANES    The Kubelet bottom face carries TWO departures and they are offset as a pair. The kill
         lane keeps the face midpoint 600 and the ladder tie takes 600 + LANE_DY = 612, because on
         one x the tie's first 68 units (120 to the jog at 188) are drawn UNDER the lane and render
         at the lane's weight: the relation is `scheme-arrow-relation` at stroke-opacity 0.45 and
         the lane is a dim arrow, so the pair reads as ONE bright drop with a faint branch peeling
         off it, which says the ladder hangs off the SIGKILL rather than off the Kubelet. That
         inverts the whole point of drawing the tie as a relation. 12 off a 320 unit face is 3.8
         percent, well inside what OFFEDGE allows a lone endpoint.
BUDGET   NO NARRATION MAY PASS 383 CHARACTERS. The panel bottom is 280 at 1100x800 and the chip column
         starts at 296, so 16 units of headroom, the tightest clearance on the card. That budget is
         why the evict rewrite landed at 380 rather than the 408 it wanted.
MOTION   `relieve` sends its packet at BEAT.afterPulse, not on the same beat as the pulse: two
         survivors pulsing while the PATCH leaves gives the eye two places to look at once, and the
         Kubelet flips the condition BECAUSE the memory freed up, so it is also the sentence order.
         `evict` sends the status report at kill.arrivalMs + BEAT.afterHop, because the phase cannot
         be reported Failed until the Pod is actually dead.
         `rank` pulses at BEAT.lead, not at a typed number. It is a self-initiated beat with no hop
         before it, so the lit Kubelet has to register before the victim is marked, which is also
         the sentence order: the manager ranks, THEN the ranking lands on a Pod. A hard 400 put the
         pulse peak at half the span and read as the two happening together.
         TWO durations are set by READING rather than by motion. `condition` carries 383 characters
         and `rank` 371, and at 2000 and 2200 they would read 5.22 and 5.93 ms per character,
         among the thirty most hurried steps in the catalogue: the step advances before the
         sentence can be read, and `duration` is the
         auto-advance timer. They hold 3700 and 3600, 9.66 and 9.70. `detect` 10.75 and `evict`
         7.14 sit inside the ordinary cluster band and are left alone. The character CEILING above
         is a panel-depth constraint and says nothing about the hold, so raising it costs nothing.
NOTE     VICTIM_FADE is 1200 against FADE.out 700, the one place this card leaves the catalog token.
         At 700 the Pod reaches its end shade at 1482 against a 900ms pulse ending at 1682, so the
         last 200ms of the pulse play on something already dark. Sampled on a real playthrough, the
         fade runs delay 782, duration 1200, ease-in, and the victim reads 1.000 at 782, 0.909 at
         1100, 0.831 at 1232 (the pulse PEAK, 450 into the 900), 0.453 at 1682 and 0.120 at 1982.
         0.909 is a third of the way through the pulse and not its middle, so quote 0.83 for the
         peak.
NOT A DEFECT
         The wire `api` and the block `api` share one name on purpose. `scene-spec.js` puts a wire
         in `refs.wires` and everything else in `refs`, two buckets, so neither overwrites the
         other, and 10 cards in the catalogue name a wire after the block it captions. `statics.mjs`
         printed DUP-KEY and GHOST-WIRE on the pair until it learned to bucket the two kinds apart.
         The kill lane lands on the Node frame top at x=600, which is the frame's face midpoint and
         also the column the BURSTABLE Pod sits in, while the Pod that dies is the BestEffort one on
         the left. The arrowhead stops in the frame's 34 unit label band, 34 above the Pod row, so
         it points at the FRAME and touches no Pod, and the victim is named by the pulse. Same shape
         as `cluster-node-drain`, and the WHY NOT above is the argument for it.
         `relieve` pulses two survivors with no `reducedLit` stand-in while `rank` has one, and the
         asymmetry is the right way round. Counted off the imported specs: 37 cluster steps pulse a
         Pod and 34 of their pulse targets have NOTHING on the static path, so a bare pulse is the
         house reading here and `rank` is the exception, not `relieve`.
         `detect` lights `thresholdChip` although its value never moves. The step IS the comparison
         of memory.available against the threshold, so both sides of it are lit and only one of them
         changed.
DO NOT   Fade the victim to 0. It leaves a block-sized hole in the frame's left third on a card whose
         last step is about the OTHER two Pods still running. The pin and the fade land on
         OPACITY.terminated, which is exactly what an evicted Pod is: phase Failed with reason
         Evicted, and the object stays in the API.
CONTENT  THE ONE REAL GAP was the largest fact on the doc page: node-pressure eviction is NOT
         API-initiated eviction, and the kubelet does not respect PodDisruptionBudget or
         terminationGracePeriodSeconds. That is the whole difference from cluster-node-drain in the
         same subcategory, so a reader crossing between them would reasonably conclude a PDB protects
         against this. Both halves are in the evict narration and the short version is in the desc.
         The Pod does not merely get removed locally: the Kubelet sets phase Failed with reason
         Evicted, which is why evicted Pods sit in the API afterwards. The cited page says only
         "sets the phase for the selected pods to Failed" and is SILENT on the reason, so that half
         stands on the source: `pkg/kubelet/eviction/helpers.go` declares `Reason = "Evicted"` and
         `eviction_manager.go` writes `status.Phase = v1.PodFailed` and `status.Reason = Reason`
         together.
         THE DOC AND THE SOURCE DISAGREE ABOUT THE 10s, and the card takes no side.
         node-pressure-eviction says "The kubelet evaluates eviction thresholds based on its
         configured `housekeeping-interval`, which defaults to 10s", while `kubelet.go` declares
         `evictionMonitoringPeriod = time.Second * 10` and hands it to `evictionManager.Start` as
         the loop's own interval, so the eviction manager does NOT share the housekeeping timer.
         Both readings land on 10s. `in its own synchronize loop (separate from cAdvisor
         housekeeping)` is therefore rejected: it is true at the source and flatly contradicts the
         page this card cites, which is a liability the reader gains nothing from. The sentence
         keeps the number and drops the attribution. Do not re-add either half.
         `(default 5min)` is rejected on units. The flag takes a Go duration and the doc writes the
         default as `5m`, which is what a reader would type. `5min` does not parse.
         `normal termination gives 30s after SIGTERM` is rejected as a default stated as the
         mechanism. Pod v1 says terminationGracePeriodSeconds "Defaults to 30 seconds", so it reads
         `waits the 30s default`, and the 11 characters came out of `rather than` and `in the spec`
         in the same sentence: 378 of the 383 the panel allows.
         Read against `k8sVersion` 1.35 and verified against the raw pages: the three ranking keys
         in doc order ("Whether the pod's resource usage exceeds requests / Pod Priority / The
         pod's resource usage relative to requests"), the "The kubelet does not use the pod's QoS
         class to determine the eviction order" Note, the 0s grace period for hard thresholds, the
         5m transition period, `memory.available<1Gi` as the doc's own threshold example, and from
         taint-and-toleration the node controller creating a NoSchedule taint per node condition,
         the `node.kubernetes.io/memory-pressure` key, and "The control plane also adds the
         node.kubernetes.io/memory-pressure toleration on pods that have a QoS class other than
         BestEffort". One caveat if you re-verify: asking a summariser for that Note returned a
         confident and completely invented answer. Fetch the raw page.
CONTENT  `rank` names the QoS card (`See the Pod QoS Classes card.`) because the classes themselves
         live there and a reader who wanted them had nowhere to go.
SCOPE    Three siblings name this card in their own SCOPE and it named none of them back, which is
         why this block exists. What it cedes:
         THE EVICTION API and PodDisruptionBudget are drawn by no card in the catalogue. Here they
         are one clause on `evict`, and it is a NEGATIVE one: the Kubelet evicts itself, so no
         budget is read and no 429 can appear.
         DISK RECLAIM BEFORE the threshold is cluster-image-container-gc, whose own SCOPE draws
         the line (`GC reclaims disk BEFORE a signal crosses its threshold, eviction is what happens
         after it crosses`). Nothing here reclaims anything: the signal is already over.
         THE KERNEL OOM KILL is cluster-oom-kill, and the two are confused often enough to be worth
         the sentence: there a container exceeds ITS OWN memory.max and the kernel kills it while
         the Node is fine, here the NODE runs short and the Kubelet picks a victim that may be well
         inside its limits. Both cards cite the node-pressure-eviction page and neither teaches the
         other's mechanism.
         TAINT EFFECT SEMANTICS are cluster-taints-tolerations. `node.kubernetes.io/memory-pressure`
         is one taint that appears and clears here, and what NoSchedule means against NoExecute is
         never opened.
         DERIVING a QoS class from requests and limits is workloads-pod-qos-classes, which `rank`
         names by title. QoS appears here only to be told it does not decide the order.
         The line against cluster-node-drain is NOT repeated here: it is the CONTENT block above,
         which owns it because it is a claim about this card's own text rather than a handoff.
NOTE     The stand-in highlight is already in the right place, which is worth recording because it
         had to be repaired on cluster-node-drain. `rank` is the one step whose reduced branch lights
         pod1Box in place of the pulse, and rank leaves the Pod at full; by evict the class is gone
         because pod1Box is in resetStep's key list. So nothing holds .highlight at the terminated
         shade and the fade needs no onfinish. If a stand-in is ever added to evict, it has to be
         dropped on BOTH paths.
```

### poster

```
Sentence: the Pods are RANKED and the lowest-ranked one goes first.

Three bands stacked at rising fill (0.03 dimmed, 0.04, 0.08) with a size-and-opacity ramp of dots
on the right, and the TOP band struck through with an X. The X is the only event on the canvas.
Reading order is deliberately top-down against the brightness, so the eye lands on the crossed band
first and then discovers it is the faintest of the three.
```
