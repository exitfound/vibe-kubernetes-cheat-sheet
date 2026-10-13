## network-pod-egress-snat

### layout

```
WHAT     A Pod reaching the Internet: the POSTROUTING rules the Node walks on the way out, the
         MASQUERADE rewrite, and the conntrack entry that makes the reply findable.
DEVIATES L-23: the Node frame top stands 55 over the exempt leg, pinned by the peer Pod outside the
         frame, which shares that edge so the top band reads as one band.
         NET.A-02: the out lane crosses the Node frame at x=700 on purpose, the crossing is the
         packet leaving the host. The reply stops on the frame, where it is reversed, and goes on
         from there to the Pod under the rule box, across the store lane: no nat rule runs for it.
         NET.L-01: the client Pod is 200 by 120 and the peer Pod 232 by 110, the card's own sizes.
         P-03: `packet src` and `rule matched` read the rewrite from entry: the packet stands in the
         rule box that makes it.
CONTENT  Sources at 1.36: IP Masquerade Agent, network model, iptables(8), Linux nf_nat_core.c.
         `No route on the internet leads back to a Pod IP`. POSTROUTING is the last hook out.
         `anything inside the cluster` is ruled out: ip-masq-agent exempts RFC 1918 and
         link-local by default, kube-proxy masquerades only Service traffic it marked.
         The chip reads `no nat rule walked` (T-19). The reversal runs as the reply enters the Node.
         MASQUERADE takes the egress interface address. 1.1.1.1 is the house destination.
```
