## cluster-pod-priority-preemption

### layout

```
WHAT     PostFilter: when filtering leaves no feasible Node, the Scheduler preempts a lower-priority
         victim and binds the pending Pod into its slot.
DEVIATES A-10: one drop from the API, not two lanes over a shared drop. The Scheduler never reaches
         a Node, and a second lane would read the DELETE as the Scheduler's write.
         M-10: `preempt` carries no ball and pulses Pod A alone. Victim selection reads the
         Scheduler's own cache, and Pods B and C are the ones the sentence keeps.
CONTENT  Sources (v1.36): Priority and Preemption, PriorityClass, Disruptions, Node-pressure
         Eviction, v1.36.0 `default_preemption.go`, `executor.go`, `schedule_one.go`, pod
         `storage.go`, priority admission. Filter says `0/1 nodes are available`, `Insufficient
         cpu`, never `NoFit`. Unschedulable and nominatedNodeName follow PostFilter,
         DisruptionTarget precedes the DELETE. Nominated Node skips Score. Set `minimal` on
         `candidate Nodes`, never "smallest" or "each Node", `reprieved first`, ties by earlier
         start. Permit or PreBind victims requeued: `the bound ones`. `reserved but not guaranteed`,
         PDB `best effort`, plugin `Priority` `enabled`, bind clears nominatedNodeName (gate on).
         SIGKILL is conditional, `if it outlives its grace period`: Pod A exits gracefully here.
OPEN     The poster, `spec` and `attempt` draw nothing that moves, about 10100 ms of still picture.
         Both steps happen inside a box, and M-10 forbids a ball to fill them.
```
