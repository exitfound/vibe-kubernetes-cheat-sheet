## network-dns-ndots

### layout

```
WHAT     What ndots:5 costs name by name: the Pod resolver walks the search list first, so a local
         name answers on the first candidate, a cross-namespace name on the second, and an external
         name only after three NXDOMAIN misses.
DEVIATES NET.L-01: the Pod is 340 by 104, sized by the resolver column over it, where a try row
         holds `default.svc.cluster.local` and its answer on one line.
CONTENT  Sources: DNS for Services and Pods, Pod DNS Config (v1.35), resolv.conf(5).
         Node search domains come after the cluster list, and the card draws a Node with none.
         `fewer than five dots and no trailing dot is relative`: a trailing dot makes it absolute.
         Each candidate is an A and an AAAA query, so the external lookup is eight.
         `keeps no cache` is about the libc stub resolver, not an application's own cache.
         203.0.113.10 is TEST-NET-3. The Service addresses sit in 10.96.0.0/12.
```
