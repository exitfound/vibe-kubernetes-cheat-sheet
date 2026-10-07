## cluster-pod-priority-preemption

### layout

```
WHAT     PostFilter: when filtering leaves no feasible Node, the Scheduler preempts a lower-priority
         victim and binds the pending Pod into its slot.
DEVIATES A-03: one top lane and no return half. No step names anything coming back from the API.
         A-10: one drop from the API, not two lanes over a shared drop. The Scheduler never reaches
         a Node, and a second lane would read the DELETE as the Scheduler's write.
         M-10: `preempt` carries no ball and pulses Pod A alone. Victim selection reads the
         Scheduler's own cache, and Pod C is the sentence's counter-example.
CONTENT  Sources: Priority and Preemption, PriorityClass (v1.35), Admission Controllers,
         Node-pressure Eviction, `default_preemption.go`, `preemption.go`.
         Rung 2 is `filter · NoFit on every node`: Score never runs on an empty list.
         nominatedNodeName is `reserved but not guaranteed`. Important victims are `reprieved
         first`. A PDB is honoured best effort, never "no PDB check". The plugin is `Priority`, the
         wire keeps `PriorityClass admission` (T-09).
OPEN     The poster, `spec` and `attempt` draw nothing that moves, about 6300 ms of still picture.
         Both steps happen inside a box, and M-10 forbids a ball to fill them.
```
