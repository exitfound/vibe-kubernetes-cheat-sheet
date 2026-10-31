## workloads-pod-scheduling-gates

### layout

```
WHAT     Two named entries in spec.schedulingGates standing between a Pod and the active queue,
         the one direction they can be edited in, and the emptied list as the only trigger that
         lets the Scheduler attempt the Pod at all.
DEVIATES S-08: the Pod is bare, with no inner box and no Node frame. Nothing about it has been
         placed or started, so a container box would draw a thing that does not exist.
         A-06: step 2 rides a ball on a step that names nothing travelling. It is the Pod reaching
         the gate and stopping, and the pair it makes with step 6 where the same ball goes through.
         P-03: on step 6 the metric turns at entry, before the ball lands. It is the answer the
         narration gives at entry, and winding it back would count the Pod as gated after it left.
CONTENT  Sources: Pod Scheduling Readiness, Pod v1, Scheduler metrics (v1.36), KEP 3521, upstream
         strategy.go, validation.go, scheduling_queue.go, printers.go (1.36). The last step keeps
         SchedulingGated on STATUS and as the PodScheduled reason (set at creation), never its value.
         `never enqueued` is ruled out: a gated Pod gets no attempt. Unschedulable is a failed
         attempt, not every Node tried. The Controller removes a gate, the API accepts it. remove-last
         "waits on nothing else": DRA PreEnqueue can still hold one. No JSON shape: pages disagree.
OPEN     The band between the writer and the floor holds only the two drops, empty right of 716.
         Its depth is the drops, the panel caps raising the floor, and no honest block stands there.
```
