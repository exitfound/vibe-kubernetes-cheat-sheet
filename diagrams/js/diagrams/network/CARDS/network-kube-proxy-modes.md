## network-kube-proxy-modes

### layout

```
WHAT     One connection to a ClusterIP resolved two ways: iptables walks a chain box by box, O(n),
         and IPVS takes one in-kernel hash hop, O(1).
DEVIATES NET.L-01: the client is 196 by 128 and both backends 200 by 104, the card's own sizes.
         M-12: the two 24 unit chain gaps take an explicit `GAP_MS` 200. The 700 floor makes them
         the slowest balls in the catalog, and the card is on the `PACING` registry for it.
CONTENT  Sources: Virtual IPs and Service Proxies (v1.36), `proxier.go` iptables and ipvs at 1.36,
         the kube-proxy nftables blog. Chain names and `statistic random` come from `proxier.go`.
         O(n) is a KUBE-SERVICES rule per Service checked in order (blog), never the walk alone.
         A v1.40 or v1.43 IPVS date is ruled out: KEP 5495 set it after v1.36, whose kube-proxy
         says only deprecated, may be removed in a future release, use nftables. `rr / lc` are the
         doc abbreviations, `rr` the code default. Modes never select alike, nftables has no block.
```
