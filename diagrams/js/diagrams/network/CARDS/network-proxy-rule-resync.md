## network-proxy-rule-resync

### layout

```
WHAT     A loop with a clock on it: every Service or EndpointSlice change kube-proxy sees stands
         above one time axis, every resync it writes to the kernel below, and the card is the gap.
CONTENT  Sources (v1.36): Optimizing iptables mode performance, kube-proxy Configuration v1alpha1,
         release-1.36 pkg/proxy/iptables and runner. 100 ticks in five bursts, five writes: the
         upstream example. No banner, no Stable. At 0s a change writes at once, so watch leaves it
         to the floor, timed from a sync's end. syncPeriod paces the ipt.Monitor check, no forced
         full sync. `proxied`, not `all`: headless skipped. iptables only, no ipvs or 1h full sync.
         In the API a deleted Pod's endpoint turns "not ready", never "removed" or "dropped", to exit.
```
