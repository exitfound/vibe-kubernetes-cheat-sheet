## network-packet-classification

### layout

```
WHAT     The fork every packet meets: a Pod sends to one address, the nat table rewrites what falls
         in the Service range, the route lookup sees only what it handed on, and three ranges come
         out as three verdicts.
DEVIATES L-23: the Node frame mirrors its floor off its top, 58 under the down leg, because its two
         exits are one mirrored pair on the right face.
         NET.L-01: the client Pod is 200 by 124 with a 160 by 52 app box, the card's own size.
CONTENT  Sources: Cluster Networking, Virtual IPs and Service Proxies, IP Masquerade Agent (v1.36).
         Fixed order: iptables mode, the 1.36 default, and nftables. ipvs puts VIPs on kube-ipvs0.
         Disjoint Pod, Service and Node ranges let a destination decide. `here` scopes the slices.
         `service` says `holds a rule for it`: falling in the range alone rewrites nothing.
         Egress masquerade is the CNI plugin or ip-masq-agent, not kube-proxy. The Pod range is
         among its non-masquerade ranges: `podcidr` keeps the source, `default` rewrites it.
         The prose says `nat table`, the one lowercase exception `terms.json` carries.
OPEN     The riding tags overhang the nat and route faces on the 44 unit trunk hops. Lifting them
         lands in the Client Pod, and a wider gap costs a station its 232 (`NET.T-01`).
```
