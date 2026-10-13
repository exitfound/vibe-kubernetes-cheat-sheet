## workloads-statefulset-ordered-rollout

### layout

```
WHAT     Three ordinal columns, each a Pod over its own claim, filled left to right because ordinal
         N+1 waits on ordinal N being Running and Ready, and emptied right to left on scale down.
DEVIATES WL.L-06: no LAYOUT preset. Three vertical stacks on a 390 pitch span L..R, the centre one
         on CX under the trunk, and each 90 gap holds a gate.
         WL.L-05: a chip is 300, not the three-across 350.7. It is the foot of its column.
         WL.A-03: no Node frame. A frame around all three ordinals would say they share a Node,
         which a StatefulSet does not promise.
         A-13: no line is pinned to a sink's shade. With ordinals arriving one at a time the pin
         washed out most of the drawing. A gate says open or closed on its caption.
CONTENT  Sources: OrderedReady Pod Management, PVC Retention Policy (v1.36), controller code (1.36).
         `Running and Ready` whole, never `once its readinessProbe passes`. CreateStatefulPod
         REQUESTS the claim before the Pod. The claim is `the template name joined to the Pod name`.
         Retain is the API default. `restart` is ruled out for the disk: identity holds across
         rescheduling. `Parallel lifts the gate, but the field is immutable` (validation). No DNS
         claim, no Service. Code over docs: the PVC Retention page still asks for
         StatefulSetAutoDeletePVC, a removed gate.
```
