## network-dualstack

### layout

```
WHAT     One cast and two address families: the Pod holds one address per family on one eth0, the
         Service one ClusterIP per family in ipFamilies order, and a client reaches the same Pod
         over whichever family it dials.
DEVIATES NET.L-01: both Pods are 232 by 106 with a 52 inner box at dy 28, the Pod height the
         cluster and workloads grammars use, so a Pod here is the size of a Pod elsewhere.
CONTENT  Sources: IPv4/IPv6 Dual-Stack, DNS for Services and Pods, EndpointSlices (v1.36 docs).
         The connect step forwards through the Service. kube-proxy has no block, so the rewrite is
         passive. `controller-manager` is named twice: it takes both CIDR flags. `unless a cloud
         provider picks them` stays: `--node-ip` is the one conditional item. `here IPv4 then IPv6`
         hedges, ipFamilies orders it. `fails the Service outright`: the page says creation fails.
         fd00::1:5, fd00:96::a echo the v4 pair (no 2001:db8::), valid under 1.36 strict IP checks.
```
