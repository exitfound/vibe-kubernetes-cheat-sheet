## cluster-node-drain

### layout

```
WHAT     kubectl drain: cordon, list-and-skip, then eviction through the API with a
         PodDisruptionBudget gating it, a 429 and a retry.
DEVIATES L-03: the top row is mirrored, kubectl right of the API at 908..1140. Left of it, kubectl
         stands 86 percent behind the panel at 1100x800.
         M-21: POD_FADE is 1200, not FADE.out 700. At 700 the Pod is gone before its own pulse
         ends, and the eviction reads as a cut.
         The evict wires name the requests and no status code: the label stands for the whole
         step, and a `429` would still be up after web-2 leaves on a 201.
CONTENT  Sources (v1.36): Safely Drain a Node, Eviction API, PodDisruptionBudget, kubectl drain, and
         drain.go, filters.go, eviction.go, handlers/create.go at v1.36.0. The API reads
         disruptionsAllowed and answers 429, never "the PDB returns". kubectl POSTs all evictions
         in parallel, one goroutine per Pod, and sleeps a fixed 5 s after a 429, never "next". The
         decrement and the DisruptionTarget condition come before the answer. The retry budget is
         currentHealthy against desiredHealthy, which minAvailable sets. A direct bind lands on a
         cordoned Node. Running DaemonSet Pods stay AND stop the drain after the cordon without the
         flag, finished ones and orphans under --force are removed. emptyDir and bare Pods block
         only while running. The list is in filter order. Granted is 201 Created on the wire, the
         Eviction API page says 200 OK.
```
