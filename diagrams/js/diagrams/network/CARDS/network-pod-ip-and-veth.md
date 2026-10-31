## network-pod-ip-and-veth

### layout

```
WHAT     A veth pair is one link with two ends in two network namespaces, and the address hangs on
         the Pod end because a namespace is what holds an address.
DEVIATES NET.L-01: the Pod shell is 310 by 298, a stage stacking three 232 boxes in the zone the
         chip column leaves.
         NET.S-01: the Pod holds pause, app and eth0 as peers through `tune`, and a `P.raw` draws
         the two veth end ticks.
         L-23: the Node frame keeps 78 above and below the Pod, room for the namespace boundary
         segments to read as one line the shell interrupts.
CONTENT  Sources: Pod networking (v1.36), CNI Specification, bridge, host-local (plugins v1.9), veth(4).
         `cni0` is the bridge default, 10.244.1.1 the host-local `.1` gateway `isGateway` puts on it.
         `veth` + 8 hex: `RandomVethName`. `@if2`: peer index, 2 as lo is 1. `in a Pod` bounds the desc.
         "pause opened this namespace" is ruled out: the runtime creates it before CNI ADD.
         "one IP per Pod" is ruled out: one per address family. `address` stays on the pair
         ends, `port` draws 10.244.1.1. `through` keeps `on the usual plugins` (T-19).
OPEN     CENTRE: the chip column at 60..360 is facts about one object, and a strip runs through the
         namespace boundary at x=760 (L-16).
         CENTRE-LOW: the rule sees only the six blocks at 450..1110, the column uncounted (L-17).
         M-19a on `pair` and `unit`, which stand still for their whole hold. A ball would be traffic
         no step narrates, and the narration already reads faster than the catalog median.
```
