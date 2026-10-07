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
CONTENT  Sources: Pod networking, CNI Specification, CNI bridge plugin (v1.35).
         `cni0` and gateway 10.244.1.1 are the bridge and host-local defaults for 10.244.1.0/24.
         `address` bounds its claim to the two ends of the pair: `port` draws 10.244.1.1 on cni0.
         `vethb3f8a2c7@if2`: eight hex digits as `RandomVethName` makes them, if2 because lo is 1.
         `on the usual plugins` bounds `through` (T-19), the wording `network-namespaces` uses.
         The desc says a Pod puts the ends in two namespaces, `veth(4)` allows a standalone pair.
OPEN     M-19a on `pair` and `unit`, which stand still for their whole hold. A ball would be traffic
         no step narrates, and the narration already reads faster than the catalog median.
```
