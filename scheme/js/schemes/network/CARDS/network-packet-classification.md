## network-packet-classification

### layout

```
WHAT     The fork every packet meets: a Pod sends to one address, the nat table rewrites what falls
         in the Service range, the route lookup sees only what it handed on, and three ranges come
         out as three verdicts.
DEVIATES L-23: the Node frame mirrors its floor off its top, 58 under the down leg, because its two
         exits are one mirrored pair on the right face.
         NET.L-01: the client Pod is 200 by 124 with a 160 by 52 app box, the card's own size.
CONTENT  Sources: Cluster Networking, Virtual IPs and Service Proxies (v1.35), IP Masquerade Agent.
         Non-overlapping Pod, Service and Node ranges are why a destination alone can decide.
         A ClusterIP is in no routing table: the nat table runs first, routing sees its output.
         The masquerade default is why `podcidr` rewrites nothing and `default` rewrites the source.
         `podcidr` says `with no further rewrite`: `service` already rewrote the destination.
         The prose says `nat table`, the one lowercase exception `terms.json` carries.
OPEN     The riding tags overhang the nat and route faces on the 44 unit trunk hops. Lifting them
         lands in the Client Pod, and a wider gap costs a station its 232 (`NET.T-01`).
```
