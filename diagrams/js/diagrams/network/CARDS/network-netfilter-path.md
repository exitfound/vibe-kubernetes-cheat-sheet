## network-netfilter-path

### layout

```
WHAT     The netfilter stations in order with a packet walking them, and the routing decision drawn
         as a fork: INPUT on one leg, FORWARD, POSTROUTING and eth0 on the other.
DEVIATES NET.L-01: the client Pod is 232 by 110 with a 192 by 48 app box, and INPUT is 230 wide,
         both the card's own sizes.
         P-03: `dnat` and `fork` turn their chips at entry. Their ball leaves the place that already
         made the value, which `P-06` admits.
CONTENT  Sources: Virtual IPs and Service Proxies, Cluster Networking (v1.36), kube-proxy code at
         1.36, netfilter hooks, NAT HOWTO. The reply reversal lands at POSTROUTING, after routing.
         `KUBE-SERVICES` is named with its mode: iptables, the 1.36 default. nftables lacks it.
         `out` rests on two defaults: kube-proxy marks only off-cluster sources (`masqueradeAll`
         false), and the CNI or ip-masq-agent egress rules skip a Pod range destination.
         A hook is not a table, and the routing decision carries `not a hook`. A local Pod meets
         PREROUTING, not OUTPUT. A bare "hostNetwork backend" on `local` is ruled out: on this Node.
```
