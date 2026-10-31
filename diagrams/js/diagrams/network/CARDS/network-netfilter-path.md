## network-netfilter-path

### layout

```
WHAT     The netfilter stations in order with a packet walking them, and the routing decision drawn
         as a fork: INPUT on one leg, FORWARD, POSTROUTING and eth0 on the other.
DEVIATES NET.L-01: the client Pod is 232 by 110 with a 192 by 48 app box, the card's own size.
         P-03: `dnat` and `fork` turn their chips at entry. Their ball leaves the place that already
         made the value, which `P-06` admits.
CONTENT  Sources: Virtual IPs and Service Proxies, Cluster Networking (v1.36), kube-proxy code,
         netfilter hooks, NAT HOWTO. `KUBE-SERVICES` (iptables, the 1.36 default) leads to the DNAT.
         `out` rests on two defaults: kube-proxy marks only off-cluster sources, egress masquerade
         rules skip a Pod range. The reply reversal lands at POSTROUTING, skips NAT rules, not filter.
         Not hooks: the routing decision (`not a hook`), eth0, a table. A local Pod meets
         PREROUTING, not OUTPUT. `local` keeps "on this Node" after the hostNetwork backend.
```
