## workloads-effective-pod-requests

### layout

```
WHAT     Init containers run one after another and the app and sidecar run together, so the cpu a
         Pod is charged is the tallest single instant of its life plus its overhead, and never the
         four requests added up.
DEVIATES WL.L-06: no LAYOUT preset. An instrument, cpu up against one Pod life across, with no
         ladder, no chip, no Node frame and no Pod.
         WL.L-07: the two readers stand right of the panel at 420..944, not on the spine. A pair
         centred on CX starts behind the panel, and pinning one reader to 600 leans the pair right.
         WL.A-01: no top-row pair. Both lanes run up from the reservation to the readers, because
         the chart produces the number and the control plane reads it.
CONTENT  Sources: Sidecar Containers, Init Containers, Pod Overhead, Assign Pod-level Resources
         (v1.36), KEP 753, component-helpers resource (1.36). `regular` init containers: the sidecar
         is weighed in the init maximum, and declared before init-a it lifts it to 1000m. The docs
         take the plain init maximum, the code adds earlier sidecars: the card follows the code.
         Pod-level spec.resources replaces only the container part, overhead adds on top, stageless.
         The cgroup clause says `Linux`. Overhead as on the sidecar page. The Scheduler reserves.
OPEN     The graduation mark hard copies the workloads channel list 91, 184, 255, so a retint misses
         it. A var() in its inline property fails silently and would delete the level.
```
