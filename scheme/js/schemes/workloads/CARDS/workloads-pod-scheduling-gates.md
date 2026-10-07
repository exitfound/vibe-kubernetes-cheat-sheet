## workloads-pod-scheduling-gates

### layout

```
WHAT     Two named entries in spec.schedulingGates standing between a Pod and the active queue,
         the one direction they can be edited in, and the emptied list as the only trigger that
         lets the Scheduler attempt the Pod at all.
DEVIATES WL.L-06: no LAYOUT preset. A threshold on one floor band with no ladder and no flanking
         chip column, so there is nothing for A / B / C to choose between.
         S-08: the Pod is bare, with no inner box and no Node frame. Nothing about it has been
         placed or started, so a container box would draw a thing that does not exist.
         A-06: step 2 rides a ball on a step that names nothing travelling. It is the Pod reaching
         the gate and stopping, and the pair it makes with step 6 where the same ball goes through.
         P-03: on step 6 the metric turns at entry, before the ball lands. It is the answer the
         narration gives at entry, and winding it back would count the Pod as gated after it left.
CONTENT  Sources: Pod Scheduling Readiness, Pod v1, Scheduler metrics (v1.35), KEP 3521, upstream
         strategy.go, scheduling_queue.go, printers.go.
         The last step keeps SchedulingGated on STATUS and PodScheduled: set once at creation.
         The Scheduler sees a gated Pod and makes no attempt. `never enqueued` is ruled out.
         Unschedulable is an attempt that failed, not every Node tried. The API stores gates and
         accepts their removal, the Controller removes them. No JSON shape: the two pages disagree.
OPEN     The band between the writer and the floor holds only the two drops, empty right of 716.
         Its depth is the drops, the panel caps raising the floor, and no honest block stands there.
```
