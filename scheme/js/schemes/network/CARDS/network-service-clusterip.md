## network-service-clusterip

### layout

```
WHAT     A ClusterIP round trip with the programmer drawn apart from the path: kube-proxy writes the
         rules, the dataplane DNATs the virtual IP to one of two backends, and conntrack unwinds it.
DEVIATES NET.L-01: the client is 190 by 120 and both backends 210 by 114, the card's own sizes.
         M-12: the traffic balls glide 10 percent slower than `routeDur` through an explicit `dur`,
         registered in `PACING`. The watch ball rides plain `routeDur`.
         P-03: on `dnat` the DNAT, conntrack and backend chips light with the dataplane, a decision
         taken before the rewritten packet leaves it.
CONTENT  Sources: Service, Virtual IPs and Service Proxies (v1.35), netfilter NAT HOWTO.
         kube-proxy configures forwarding rules in every listed mode and forwards nothing itself.
         `virtual` scopes the interface claim to iptables: IPVS binds Service IPs to kube-ipvs0.
         The kernel picks `as the Service rules direct`: IPVS hands the pick to a scheduler.
         `balance` keeps `with no session affinity`, the aria-label says `may land`.
         The rules match at PREROUTING, as the packet crosses from the client Pod into the Node.
OPEN     Dashed buses cross the fan tags where the fans leave the dataplane: the buses and attach
         legs share one corridor 12 units apart, and no offset clears a tag in it.
```
