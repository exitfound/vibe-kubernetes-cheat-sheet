## workloads-pod-qos-classes

### layout

```
WHAT     Three Pods classified Guaranteed, Burstable and BestEffort, and which two the Kubelet
         evicts under Node pressure.
DEVIATES WL.A-03: the three taps stop on the frame top border from outside, one per Pod, and only
         the middle one on the midpoint. A single drop loses the per-Pod arrival order (TAP_END).
         WL.A-01: one answer lane on TOP_CY and no pair, because no step names anything going the
         other way.
         M-12: the `schedule` and `cgroups` fans fly all three lanes for one fanTiming duration, the
         outer lanes' routeDur, with one trunk corner, so the balls ride the trunk as one and land on
         one beat.
         A-13: the trunk and the bus stay at full weight while the Pods are pending. They end on
         the rail and not on a Pod, and dimming them switches the whole drawing off.
         L-08: the bus at 384 stands 5.1 under the deepest panel, tied on `cgroups` and `tiers`, so
         neither narration can gain a line unless the bus moves first.
CONTENT  Sources (1.36): Pod QoS Classes, Node-pressure Eviction, `helper/qos`, kubelet `policy.go`.
         Pod-level resources (beta, on) replace the containers. Rule: CPU and memory, `above zero`.
         Class set `at creation`, a resize that would change it is rejected. A and B `uncapped`.
         `The resource fit looks only at requests`. A before B is stated `at equal Priority`.
         Guaranteed is `evicted last`, never `survives`. -997 also node-critical. Clamp 3..999 per
         code (eviction page: 2). Strings name oom_score_adj, never oom_score, and no Scheduler.
```
