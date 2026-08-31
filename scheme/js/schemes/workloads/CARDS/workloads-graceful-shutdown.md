## workloads-graceful-shutdown

### layout

```
WHAT     The termination sequence from deletionTimestamp through preStop and SIGTERM to the
         grace period expiring.
LAYOUT   C (bottom strip). panel bottom 280.
           ladder 660..1140 at y=140, 6 rows
           chips  full-width strip, THREE per row at 350.67, two rows 548..624, short row centred
           node   394..528, Pod 20 below its top edge
         A column beside the panel does not fit: the left band is 300..464 = 164 against a 202 chip
         column.
         The ladder is not at 412 with NODE_H 116: the frame's top border then runs 5 units above
         the Pod's, which reads as a rendering slip rather than as a frame.
LANES    TOP2 (the API) midpoint -> WL.SPINE_X at y=140 -> the Pod's top midpoint. The return lane
         is its reverse.
         It leaves the API and not TOP1, kubectl: the termination order is what the API sets in
         motion once it has stamped deletionTimestamp, and on the last step the report climbs back
         to whichever box `lightBoxAt` lights.
         The connector does not end at x=320 inside the Node frame, where it points at blank canvas
         50 units left of the Pod.
MOTION   Leaving from the API rather than from kubectl costs 311ms per ball; both steps that ride
         it have the headroom.
CONTENT  SIGTERM and SIGKILL have DIFFERENT targets. `sigkill` must NOT read "the runtime sends
         SIGKILL, which the kernel delivers unconditionally to PID 1", which is the SIGTERM
         targeting rule applied to the wrong signal. The doc: "When the
         grace period expires, if there is still any container running in the Pod, the kubelet
         triggers forcible shutdown. The container runtime sends SIGKILL to any processes still
         running in any container in the Pod." SIGTERM goes to process 1 of each container, SIGKILL
         to every remaining process in every container, and the difference is practical: a process
         tree whose PID 1 already exited is still reaped. The step reads "to every process still
         running in any container of the Pod, not just to PID 1", which also makes rung 4 (SIGTERM,
         "signal PID 1") the deliberate contrast rather than a repetition.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  SIGTERM is the runtime DEFAULT, not a rule. `sigterm` must NOT read "asks the runtime to
         send SIGTERM to PID 1". The doc: "Many container runtimes respect the STOPSIGNAL value defined in the
         container image and, if different, send the container image configured STOPSIGNAL instead of
         TERM." and "If no stop signal is defined in the image, the default signal of the container
         runtime (SIGTERM for both containerd and CRI-O) would be used to kill the container." The
         step reads "the stop signal to PID 1, SIGTERM unless the image defines a different
         STOPSIGNAL". The ACTOR and the ordering are right as they stand.
         `sigChip` carries the literal value `SIGTERM` and the ladder rung reads "SIGTERM · signal
         PID 1", and both stay. A chip VALUE is width-bound (`P-07`, measured against the box by
         `render/chipfit.test.mjs`) and a rung is bounded by its column, so neither can hold the
         qualifier. SIGTERM is the concrete case this card DRAWS, the narration beside it says it
         is the default rather than the rule, and that is the right division of labour.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
CONTENT  The `desc` says "SIGKILL is the last resort, used only if the container outlives that
         shared timer", and the doc adds "If the preStop hook is still running after the grace
         period expires, the kubelet requests a small, one-off grace period extension of 2
         seconds". The desc stands. "Only if" states a NECESSARY condition, which the extension
         does not falsify: the container still has to outlive the timer. The extension is
         preStop-specific and this card's scenario has preStop completing at step 3, so the card
         never reaches it, and the desc has 27 characters of a hard 470 band to spend on a case it
         does not draw.
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/
NAMING   The fourth chip is named `kubectl shows`, not `pod status`. Its values are Running,
         Terminating and deleted, and the `delete` step says in words that deletionTimestamp is what
         makes KUBECTL report Terminating "while status.phase itself stays Running", so a chip named
         for the phase and carrying what kubectl prints contradicted its own step (`P-02`).
         storage-pvc-protection already carries a `kubectl shows` chip for the same split.
```

### poster

```
Three Pod frames left to right at 0.05, 0.04 at 0.72 and 0.02 dashed at 0.42, joined by two short
legs, the first solid and the second dashed. One sentence: shutdown is a fade, not a cut.
The two chevrons are the only arrowheads and they carry the passage of the grace period, which the
fill ramp alone would leave ambiguous about direction. The inner container box fades with its frame
so the pair reads as one thing going out.
```
