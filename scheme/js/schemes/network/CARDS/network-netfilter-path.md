## network-netfilter-path

### layout

```
WHAT     The netfilter stations in order with a packet walking them, and the routing decision drawn
         as a fork: INPUT on one leg, FORWARD, POSTROUTING and eth0 on the other.
DEVIATES NET.L-01: the client Pod is 232 by 110 with a 192 by 48 app box, and INPUT is 230 wide,
         both the card's own sizes.
         P-03: `dnat` and `fork` turn their chips at entry. Their ball leaves the place that already
         made the value, which `P-06` admits.
CONTENT  Sources: Virtual IPs and Service Proxies, Cluster Networking (v1.35), netfilter hooks,
         netfilter NAT HOWTO. The reply reversal lands at POSTROUTING: SNAT is always post-routing.
         `KUBE-SERVICES` is named with its mode, iptables, since nftables is the coming default.
         The masquerade exclusion is a default: `masqueradeAll` is false out of the box.
         A hook is not a table, and the routing decision carries `not a hook`.
         A local Pod reaches PREROUTING, not OUTPUT: the veth is an ingress for the host.
```
