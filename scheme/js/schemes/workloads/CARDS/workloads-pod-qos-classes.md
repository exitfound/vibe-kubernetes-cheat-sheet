## workloads-pod-qos-classes

### layout

```
WHAT     Three Pods classified Guaranteed, Burstable and BestEffort, and which two the Kubelet
         evicts under Node pressure.
DEVIATES WL.A-03: the three taps stop on the frame top border from outside, one per Pod, and only
         the middle one on the midpoint. A single drop loses the per-Pod arrival order (TAP_END).
         WL.A-01: one answer lane on TOP_CY and no pair, because no step names anything going the
         other way.
         A-13: the trunk and the bus stay at full weight while the Pods are pending. They end on
         the rail and not on a Pod, and dimming them switches the whole drawing off.
         L-08: the bus at 384 stands 5.1 under the deepest panel, tied on `cgroups` and `tiers`, so
         neither narration can gain a line unless the bus moves first.
CONTENT  Sources: Pod Quality of Service Classes, Node-pressure Eviction (v1.35), kubelet policy.go.
         `cgroups` names both A and B as uncapped. Guaranteed is `evicted last`, never `survives`.
         `The resource fit looks only at requests`, not scheduling. Node-critical Pods get -997.
         The Burstable clamp is 3..999. A resize that would change the class is rejected.
         Guaranteed needs `above zero`, BestEffort is scoped to CPU and memory. Strings name
         oom_score_adj, never oom_score, and none names the Scheduler, which has no box.
```
