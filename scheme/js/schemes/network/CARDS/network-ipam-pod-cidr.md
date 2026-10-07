## network-ipam-pod-cidr

### layout

```
WHAT     The kube-controller-manager carving the cluster CIDR into one podCIDR slice per Node, and
         the CNI IPAM handing Pod addresses out of that slice.
DEVIATES L-23: Node-3 holds no Pod and keeps the row height, so it stays a peer of the other two
         Nodes, whose only difference is a Pod drawn later.
         NET.L-01: Pods are 200 by 130, the card's own size. A 232 Pod would still fit the frame.
         NET.A-02: the three allocation lanes cross the frame top and end on the slice chip. The
         controller writes `node.spec.podCIDR`, and that field is the chip.
         M-12: the three allocation balls share the longest path's 1053ms, registered in `PACING`,
         so one reconcile pass lands on one beat.
CONTENT  Sources: kube-controller-manager flags, Nodes, IPv4/IPv6 dual-stack (v1.35).
         /24 is the `--node-cidr-mask-size` default, so the step names the flag and its default.
         Node-1 owns 10.244.1.0/24 to hold the catalog Pod IP 10.244.1.5. The Node-2 Pod is
         10.244.2.8, because 10.244.2.7 is the catalog `Pod web` and this Pod is a bare `Pod`.
         A block is carved at registration: Node-3 holds a slice `with no Pod scheduled on it yet`.
         The routing claim stays unqualified: overlay and routed dataplanes both key on the block.
OPEN     CENTRE-LOW: the rule sees only the two Pods, and they sit in the Nodes the narration names
         (L-17).
         The IPAM ball lands on the Pod title and covers 3.3 units of `Pod`. Lifting it breaks A-19,
         and moving the label is a `buildPod` change on every card.
```
