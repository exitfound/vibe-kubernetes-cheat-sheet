## network-pod-to-pod-same-node

### layout

```
WHAT     Two Pods on one Node: same podCIDR so the destination is on-link, ARP through the cni0
         bridge, an entry in the forwarding table, then one switched layer 2 hop with no NAT.
DEVIATES NET.L-01: both Pods are 232 by 130 with a 192 by 56 app box, the card's own height.
CONTENT  Sources: network model, Pods (v1.36 docs), CNI bridge plugin, Calico FAQ. MACs are examples:
         the bridge plugin forms no `0a:58` MAC. Host ends are eight hex as siblings. The table
         counts learned rows (br_add_if keeps a permanent row per port). Flood: `every port but that one`.
         `With the bridge plugin` stays: under Calico each host is the gateway router, so not on-link.
         `Traffic to a Pod IP on this Node`: a ClusterIP is rewritten, a cross-node overlay encapsulates.
         On-link means `no router in between`: the bridge is a hop. Both frames teach it a row.
```
