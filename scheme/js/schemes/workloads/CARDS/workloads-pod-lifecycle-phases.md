## workloads-pod-lifecycle-phases

### layout

```
WHAT     The Pod phase state machine, Pending through Running to Succeeded or Failed.
LAYOUT   C, and the tightest card in the whole catalog: the panel measures 397 x 504, more than
         three quarters of the canvas height on the left, leaving 136 units full width beneath it.
           ladder 660..1140
           chips  status.phase alone in the left column 60..540 at y 506
           node   546..624; Pod 552..616; container 574..610
         A pipeline at 420..1140 with status.phase as a full-width strip is out: the lane then runs
         straight down through six ladder rows AND through the chip.
         A Node bottom edge at 640 falls on the viewBox edge and does not draw.
         Pod and container are shorter than the family default deliberately. There is no more
         room. A longer narration on any step invalidates that measurement: re-measure.
LANES    Down x = SPINE_X (560), clear of both the ladder and the status chip, ending on the Pod.
CONTENT  Pending is what a WAITING container forces, and one container starting is not enough to
         leave it. `schedule` must NOT read "The status.phase field is still Pending until at least
         one container has started", a necessary condition stated as the whole rule. The doc gives
         Running as "The Pod has been bound to a node, and all of the containers have been created.
         At least one container is still running, or is in the process of starting or restarting",
         and `getPhase` in `pkg/kubelet/kubelet_pods.go` evaluates `case waiting > 0: return
         v1.PodPending` BEFORE `case running > 0 && unknown == 0: return v1.PodRunning`, so on a
         multi-container Pod one container running does not move the phase. The step reads "stays
         Pending while any container is still waiting", 7 characters SHORTER than the sentence it
         must not say, which is the direction the catalog's tightest panel wants. The `desc` and the
         `running` step carry the same reading.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-phase
CONTENT  `capped at 300s` on `crashloop` carries `by default`, for the reason recorded in full on
         workloads-crashloopbackoff: KubeletCrashLoopBackOffMax is beta and on by default at 1.35,
         which makes the ceiling a per-node default. 11 characters, on step 3. The two prose repairs
         on this card sit on steps 1 and 3, and step 5 (`terminal`) is untouched, which matters
         because step 5 at 1100x800 IS the catalog's deepest panel, 503.13 against the 90..504 band
         L-04 records. Do not spend step 5.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
```

### before `const stage = (podGroup, placed = true) => ({`

```
LANES    The lane ENDS on the Pod, so it carries the Pod's shade rather than a shade of its own
         (A-13), and `stage()` states the pair once. Measured with `effectiveOpacity` at both ends:
         `schedule` 0.55, `crashloop` 0.40, `terminal` 0.12 and `admit` 0.55, each the shade of the
         Pod it lands on, against the 1 a lane holding its own shade would sit at. Kubelet, the
         source end, is 1 on all six steps, so min(source, sink) IS the Pod. The lane takes that
         shade on every step, so the Node frame is the only value `placed` still decides.
         `admit` is the one step where the Pod is not placed, so the frame AROUND it is pinned to
         OPACITY.pending with it. Neither the frame nor the lane stands at 1 there: that step's
         wire label reads `spec.nodeName not set`, so a full-strength pair says the Pod is on
         Node-1 while the words say no Node has it.
         The container sublabel on `admit` reads `no node yet · no container`, which is C-14's
         remedy: a block that does not exist yet dims AND says so. 26 characters at 6.03 units
         each is 157 of the 300 the container box is wide.
MOTION   The lane fades WITH the Pod, same delay, same duration, same easing, on all four steps that
         move the phase, which is what P-04 asks for and why the pair is stated once rather than one
         step at a time. `phaseFade` returns the pair. `fill: both` holds both at `from` through the
         400 delay, so the lane is at 0.39 when the ball lands at 960 on `terminal` and at 0.40 when
         it lands on `crashloop`: visible for the whole flight (A-15), and never brighter than its
         own sink.
         Pinning the lane to the settled shade with no fade is out. The static block runs at t=0, so
         the lane would snap to 0.12 while the Pod is still at 1 and a ball is in the air, which
         inverts the mismatch instead of closing it. Leaving it at 1 and citing A-15 is out too:
         A-15 asks the lane to be VISIBLE under its ball, not to be full strength, and 0.30 at the
         arrival is visible in the rendered frame at 1600x1000 and at 1100x800.
```

### poster

```
A state row on top, Pending to Running to the Succeeded/Failed fork, with Running at 0.20, by far
the brightest thing on the canvas. Below it the Pod it describes, joined by one dashed drop. The
sentence is that a single FIELD tracks the Pod, so the row and the Pod are two views of one thing.
The fork carries a tick and a cross, the only two glyphs, and the failed branch is dashed at 0.55
so the pair reads as one taken outcome and one alternative rather than as two events.
```
