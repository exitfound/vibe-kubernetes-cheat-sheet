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
CONTENT  Sources: kube-controller-manager flags, Nodes, Node API, network plugins, dual-stack, 1.36.
         /24 is the mask default. Node-1 owns 10.244.1.0/24 for the catalog IP 10.244.1.5, Node-2
         Pod is 10.244.2.8 (10.244.2.7 is `Pod web`). Node-3 has a block at registration, no Pod.
         Routing stays unqualified: overlay and routed dataplanes both key on the block.
         The plugin owns Pod IPs: `a CNI IPAM that uses the Node podCIDR`, never `the CNI IPAM`.
         `configured once` is ruled out: the dual-stack page sets `--cluster-cidr` on kube-proxy.
         Uniqueness is scoped to IPs drawn from the blocks: a hostNetwork Pod takes the Node IP.
OPEN     CENTRE-LOW: the rule sees only the two Pods, and they sit in the Nodes the narration names
         (L-17).
         The IPAM ball lands on the Pod title and covers 3.3 units of `Pod`. Lifting it breaks A-19,
         and moving the label is a `buildPod` change on every card.
```
