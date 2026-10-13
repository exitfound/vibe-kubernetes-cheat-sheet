## network-dns-ndots

### layout

```
WHAT     What ndots:5 costs name by name: the Pod resolver walks the search list first, so a local
         name answers on the first candidate, a cross-namespace name on the second, and an external
         name only after three NXDOMAIN misses.
DEVIATES NET.L-01: the Pod is 340 by 104, sized by the resolver column over it, where a try row
         holds `default.svc.cluster.local` and its answer on one line.
CONTENT  Sources, 1.36: DNS for Services and Pods, Pod DNS Config, dns.go, kubeadm Corefile with
         CoreDNS v1.14.2, resolv.conf(5), glibc res_query.c, musl lookup_name.c.
         Node search domains follow the cluster list, the card draws none. Fewer than five dots
         and no trailing dot: glibc and musl search first, then as written. A and AAAA per
         candidate: eight. `keeps no cache` is the libc stub. Docs drop duplicate options, the
         code (followed) replaces ndots by name. 203.0.113.10 is TEST-NET-3, Services 10.96.0.0/12.
```
