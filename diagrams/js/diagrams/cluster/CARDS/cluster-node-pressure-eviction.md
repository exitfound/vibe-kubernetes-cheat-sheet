## cluster-node-pressure-eviction

### layout

```
WHAT     The Kubelet evicting under memory pressure: the threshold, the ranking, the kill, and the
         condition clearing after the transition period.
DEVIATES A-03: one lane to the API and no return. No step names anything coming back.
         L-11: the ladder tie leaves the Kubelet bottom at 612, not 600. On one x it reads as a
         branch off the SIGKILL lane.
         M-21: VICTIM_FADE is 1200, not FADE.out 700. At 700 the last 200 ms of the pulse play on a
         Pod already dark.
         S-17: `rank` declares `reducedLit` for the victim's inner box. `relieve` pulses two
         survivors with none, which is the category's house reading.
         P-05: `detect` lights `thresholdChip` though it never moves. The step is the comparison.
CONTENT  Sources (v1.36): Node-pressure Eviction, Pod QoS Classes, Taints and Tolerations, v1.36.0
         `eviction_manager.go`, `kuberuntime_container.go`, `kubelet.go`, apiserver `plugins.go`.
         Code over docs: a hard threshold asks 1s grace, kuberuntime raises it to 2s (docs say 0s).
         Docs give non-BestEffort Pods a memory-pressure toleration, only PodTolerationRestriction (off) adds it.
         `every 10s` is the manager clock, never housekeeping-interval. `5m`, not `5min`. QoS only
         estimates the order. The taint actor is the control plane, never "node controller".
```
