## network-pod-egress-snat

### layout

```
WHAT     A Pod reaching the Internet: the POSTROUTING rules the Node walks on the way out, the
         MASQUERADE rewrite, and the conntrack entry that makes the reply findable.
DEVIATES L-23: the Node frame top stands 55 over the exempt leg, pinned by the peer Pod outside the
         frame, which shares that edge so the top band reads as one band.
         NET.A-02: the two masqueraded lanes cross the Node frame at x=700 on purpose, the crossing
         is the packet leaving the host.
         NET.L-01: the client Pod is 200 by 120 and the peer Pod 232 by 110, the card's own sizes.
         P-03: `packet src` and `rule matched` read the rewrite from entry: the packet stands in the
         rule box that makes it.
CONTENT  Sources: Preserving the client source IP, IP Masquerade Agent, Kubernetes network model.
         `No route on the internet leads back to a Pod IP`, not `routable only inside the cluster`.
         POSTROUTING is `the last netfilter hook on the way out`, not the last thing the Node does.
         The reply walks `no masquerade rule at all`, the chip reads `no nat rule walked` (T-19).
         The ip-masq-agent default exempts more than the pod CIDR: `anything inside the cluster`.
         MASQUERADE takes the egress interface address. 1.1.1.1 is the house destination.
```
