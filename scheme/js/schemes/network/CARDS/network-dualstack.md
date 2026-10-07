## network-dualstack

### layout

```
WHAT     One cast and two address families: the Pod holds one address per family on one eth0, the
         Service one ClusterIP per family in ipFamilies order, and a client reaches the same Pod
         over whichever family it dials.
DEVIATES NET.L-01: both Pods are 232 by 106 with a 52 inner box at dy 28, the Pod height the
         cluster and workloads grammars use, so a Pod here is the size of a Pod elsewhere.
CONTENT  Sources: IPv4/IPv6 Dual-Stack, DNS for Services and Pods, EndpointSlices (v1.35).
         The connect step forwards through the Service. kube-proxy has no block, so the rewrite is
         passive. The enable list names kube-controller-manager twice: it takes both CIDR flags.
         `unless a cloud provider picks them` stays: `--node-ip` is the one conditional item.
         `here IPv4 then IPv6` is a hedge, because `.spec.ipFamilies` orders the addresses.
         fd00::1:5 and fd00:96::a echo the house v4 pair, so no 2001:db8:: documentation range.
```
