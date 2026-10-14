## network-pod-to-pod-cross-node

### layout

```
WHAT     A packet from a Pod on one Node to a Pod on another over the physical underlay, wrapped by
         an overlay or routed as is.
DEVIATES NET.L-01: Pods are 180 by 120. 180 is sized by the 470 Node frame, where a 232 Pod and a
         232 dataplane with the 92 between want 556, and 120 is the card's own.
         NET.A-02: the underlay lane starts inside Node-1 and ends inside Node-2, crossing both
         floors, because the dataplanes are what wrap and unwrap. No report sees this crossing.
         P-03: the `encap`, `decap` and `routed` chips turn at entry. Each is a premise of its step,
         made inside a box before the ball leaves.
CONTENT  Sources: network model (v1.36), CNI bridge plugin, flannel v0.28.4, Calico 3.32 overlay.
         The boxes are `CNI dataplane`, not `cni0`: a bridge wraps nothing, routed Calico has none.
         The frame leaves because the destination is off-subnet, never for want of a bridge port.
         `decap` shares only `the same last hop a same-node frame takes`, routed, not bridged.
         `dport 8472 for flannel` names the plugin, IANA registers 4789. Calico advertises IPAM
         blocks to BGP peers: `Pod subnet of each Node`, and the underlay is `aware of Pod IPs`.
```
