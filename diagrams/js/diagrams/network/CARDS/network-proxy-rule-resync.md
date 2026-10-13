## network-proxy-rule-resync

### layout

```
WHAT     A loop with a clock on it: every Service or EndpointSlice change kube-proxy sees stands
         above one time axis, every resync it writes to the kernel below, and the card is the gap.
DEVIATES L-11: the write lane leaves the instrument face midpoint at 372, 16 under the clock axis at
         388. The bracket stack over the comb sets the axis, and centring it collides two titles.
CONTENT  Sources (v1.36): Optimizing iptables mode performance, kube-proxy Configuration v1alpha1,
         release-1.36 pkg/proxy/iptables and runner. `unless you replaced it` is the doc hedge.
         100 ticks in five bursts and five writes are the upstream example. No banner, no Stable.
         At 0s a change writes at once, so watch leaves it to the floor, timed from a sync's end.
         syncPeriod is no forced full sync: it paces the ipt.Monitor interference check. `proxied`,
         not `all`: headless Services are not watched. iptables only, no ipvs or 1h full sync.
```
