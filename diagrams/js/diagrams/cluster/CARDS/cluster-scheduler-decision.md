## cluster-scheduler-decision

### layout

```
WHAT     One scheduling cycle: watch, filter, score, bind, and the Kubelet on the chosen Node
         picking the Pod up, the write reaching it over two lanes.
DEVIATES L-08a: the value-chip column is 270 wide, not the 480 of LAYOUT.A. The last 210 units are
         the only channel from the control-plane band down to the Kubelet and Node-4.
         S-11: `reset` carries `keys` and no `pods` list. `clearPodHighlight` would wipe the inline
         strokes the placed Pod's final look depends on.
CONTENT  Sources (v1.36): Kube-scheduler, Scheduling Framework, Scheduler Performance Tuning,
         `interface.go`, `schedule_one.go`, `cache.go`, pod `storage.go`, `cache_watcher.go`.
         Node sublabels speak requests, never `free`. Plugins score 0 to 100, TotalScore has no
         ceiling: `the weighted sum` ranks. No `every Node`: percentageOfNodesToScore. Row 2 keeps
         `fail predicates`. The Kubelet watches. Out: `sees Node-4 as taken` (Assume adds requests),
         `writes the binding` (the binding subresource sets the Pod spec.nodeName).
```
