## workloads-env-before-pid-1

### layout

```
WHAT     The three KINDS of place a container environment is assembled from, the moment the whole
         set crosses into the container, and why editing a source afterwards moves nothing.
DEVIATES WL.L-06: no LAYOUT preset. A funnel through a one-way line, four bands on one spine at
         600, every band ending on 254 and 946.
         L-03, WL.L-02: the source row starts at 254, not 420, so each leg drops straight onto a
         face midpoint and the spine stays on 600. Held to 420 the card leans 166 right of CX.
         WL.L-05: the env chips are 221.33, the merge box span over three, not a LAYOUT.C width.
         P-05: on step 4 the three env chips change with no per-chip cue. The strip lifts as one
         group on the single ball, because the set is handed over as one thing.
CONTENT  Sources (v1.36): ConfigMaps, Container Environment, Downward API, Service, CRI, kubelet
         code. The right wall caption carries the restart: a restart is a new CreateContainer.
         `writes variables ... among them` per Service with `a cluster IP`: "a pair" is ruled out.
         `cached ConfigMap`, `by default it watches`: "GET" is ruled out, the cache is configurable.
         Step 2 credits the sandbox for the Pod IP, which status.podIP may not hold yet at the first
         start, so step 1 says `names a field` and the Pod object box shows `fieldRef status.podIP`
         with no address. The aria-label says `once per container start`.
OPEN     The ConfigMap source box sits under the panel, 65 percent at worst, its label cut 61
         percent at 1280x860 and 75 at 1100x800. Closing it needs a catalog-wide clamp of the
         panel height.
```
