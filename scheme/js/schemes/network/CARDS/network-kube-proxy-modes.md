## network-kube-proxy-modes

### layout

```
WHAT     One connection to a ClusterIP resolved two ways: iptables walks a chain box by box, O(n),
         and IPVS takes one in-kernel hash hop, O(1).
DEVIATES NET.L-01: the client is 196 by 128 and both backends 200 by 104, the card's own sizes.
         M-12: the two 24 unit chain gaps take an explicit `GAP_MS` 200. The 700 floor makes them
         the slowest balls in the catalog, and the card is on the `PACING` registry for it.
CONTENT  Sources: Virtual IPs and Service Proxies (v1.35), kube-proxy iptables proxier.
         The chain names and `statistic random` come from `proxier.go`, the docs carry none of them.
         `scale` names the IPVS timeline: deprecated v1.35, off by default v1.40, removed v1.43.
         `scheduler rr / lc` uses the doc's own abbreviations.
         The two modes never select the same way, and conntrack is neither drawn nor named.
         nftables is a narrated successor with no block.
```
