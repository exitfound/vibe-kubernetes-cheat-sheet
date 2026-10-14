## workloads-pod-resize

### layout

```
WHAT     CPU and memory changed on a Pod that stays up: the patch through the resize subresource,
         the Kubelet allocating it or raising PodResizePending, and the new limit landing on the
         container that never stopped running.
DEVIATES WL.A-02: the top wire label sits at `WIRE_TOP_Y = TOP_Y - 14`, 26, the cluster mode
         register `cluster-static-pods` carries, still above the row.
         WL.L-05: the right band 840..1140, where a C ladder would stand, holds the Deferred and
         Infeasible verdict pair, not a ladder. The three-outcome decision is the subject.
         L-19: the `spec` wire slot holds 33 characters before it runs into `branch`, so it carries
         the field without the `watch ·` prefix.
         C-01: the two verdict boxes are Pod conditions drawn in cluster indigo, because they are
         the Kubelet output in the Kubelet band.
         T-21: the `apply` step names the container runtime and nothing draws it. The rpc name
         carries the fact, and cluster-pod-sandbox-cri draws the CRI stack.
CONTENT  Sources: Resize CPU and Memory Resources, Pod QoS Classes, KEP 1287, cri-api, upstream
         apiserver and kubelet (v1.36). `stable in 1.35`, never `since 1.35 you can`. CPU-only
         resize: moving memory too restarts (RestartContainer wins). `resources` is never called
         immutable. An ask over Node allocatable is `refused by the API server`
         (PodResizeValidator), not Infeasible: the v1.36 task page still says Infeasible, the code
         wins. A QoS change is also refused by the API server, never `by admission`. The memory skip
         keeps `under NotRequired`.
OPEN     L-14: CENTRE-LOW reads the blocks below the panel at 390..1140, centre 765. kubectl
         right of the API leaves 60..484 empty, and both alternatives move the hole (L-16).
```
