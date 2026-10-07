## network-pod-to-pod-cross-node

### layout

```
WHAT     A packet from a Pod on one Node to a Pod on another over the physical underlay, wrapped by
         an overlay or routed as is.
DEVIATES NET.L-01: Pods are 180 by 120 and the dataplanes 150 wide, sized by the 470 Node frame:
         232 + 92 + 232 is 556. The 120 Pod height is the card's own.
         NET.A-02: the underlay lane starts inside Node-1 and ends inside Node-2, crossing both
         floors, because the dataplanes are what wrap and unwrap. No report sees this crossing.
         P-03: the `encap`, `decap` and `routed` chips turn at entry. Each is a premise of its step,
         made inside a box before the ball leaves.
CONTENT  Sources: Kubernetes network model, CNI bridge plugin, flannel backends, Calico overlay.
         The boxes are `CNI dataplane`, not `cni0`: a bridge wraps nothing, routed Calico has none.
         The frame leaves because the destination is off-subnet, never for want of a bridge port.
         `decap` shares only `the same last hop a same-node frame takes`.
         `dport 8472 for flannel` names the plugin, IANA registers 4789. Calico advertises its own
         IPAM blocks, so `the Pod subnet of each Node` and not `spec.podCIDR`.
```
