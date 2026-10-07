## network-proxy-rule-resync

### layout

```
WHAT     A loop with a clock on it: every Service or EndpointSlice change kube-proxy sees stands
         above one time axis, every resync it writes to the kernel below, and the card is the gap.
DEVIATES L-11: the write lane leaves the instrument face midpoint at 372, 16 under the clock axis at
         388. The bracket stack over the comb sets the axis, and centring it collides two titles.
CONTENT  Sources: Optimizing iptables mode performance, kube-proxy Configuration v1alpha1 (v1.35).
         The desc keeps the doc's hedge as `unless you replaced it` (`network-ebpf-dataplane`).
         100 ticks in five bursts and five writes are the numbers of the upstream example.
         syncPeriod is no forced full reconciliation and is `not tied to any individual change`.
         At minSyncPeriod 0s a change writes at once, so the watch step leaves that to the floor.
         Scoped to iptables mode. The subsection has no feature-state banner, so no Stable claim.
```
