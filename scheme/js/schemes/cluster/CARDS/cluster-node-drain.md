## cluster-node-drain

### layout

```
WHAT     kubectl drain: cordon, list-and-skip, then eviction through the API with a
         PodDisruptionBudget gating it, a 429 and a retry.
DEVIATES L-03: the top row is mirrored, kubectl right of the API at 908..1140. Left of it, kubectl
         stands 86 percent behind the panel at 1100x800.
         M-21: POD_FADE is 1200, not FADE.out 700. At 700 the Pod is gone before its own pulse
         ends, and the eviction reads as a cut.
         The two evict steps carry the same wire shape and no status code: the label stands for the
         whole step, and a `429` would still be up after web-2 leaves on a 200.
CONTENT  Sources: Safely Drain a Node, Eviction API, PodDisruptionBudget, kubectl drain, kubectl
         `pkg/drain`, the apiserver `eviction.go`.
         The API reads disruptionsAllowed and answers 429, never "the PDB returns". kubectl sleeps a
         fixed 5 s, a default. A direct bind lands on a cordoned Node. DaemonSet Pods are never
         evicted AND block the drain without the flag. The list order is kubectl's filter order. A
         granted eviction is 200 OK, never 201.
```
