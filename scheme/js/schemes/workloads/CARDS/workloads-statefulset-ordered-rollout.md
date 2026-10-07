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
CONTENT  Sources: OrderedReady Pod Management, PVC Retention Policy (v1.35), controller source.
         `Running and Ready` whole on every step, never `once its readinessProbe passes`.
         The controller REQUESTS the claim before the Pod: CreateStatefulPod, no page behind it.
         The claim is `the template name joined to the Pod name`. Retain is the API default.
         `Parallel lifts the gate, but the field is immutable`. No hostname or DNS addressing claim,
         the headless Service is not drawn.
```
