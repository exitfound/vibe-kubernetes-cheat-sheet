## network-pod-to-pod-same-node

### layout

```
WHAT     Two Pods on one Node: same podCIDR so the destination is on-link, ARP through the cni0
         bridge, an entry in the forwarding table, then one switched layer 2 hop with no NAT.
DEVIATES NET.L-01: both Pods are 232 by 130 with a 192 by 56 app box, the card's own height.
CONTENT  Sources: Kubernetes network model, CNI bridge plugin, Pod networking (v1.35).
         The table MACs are examples: the bridge plugin does not form a `0a:58` MAC from the IP.
         Host ends take eight hex digits as `RandomVethName` makes them, spelled as on siblings.
         The ARP flood goes to `every port but that one`, true whatever the port count.
         `Traffic addressed to a Pod IP is never rewritten`: a ClusterIP on this Node is (T-19).
         The route lookup returns on-link. The bridge learns from both frames, so `2 entries`.
```
