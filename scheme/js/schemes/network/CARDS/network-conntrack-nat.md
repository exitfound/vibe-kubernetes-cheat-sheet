## network-conntrack-nat

### layout

```
WHAT     The conntrack entry as the protagonist: what it holds, what the first packet pays to create
         it, and what it saves every packet after.
DEVIATES NET.L-01: both Pods are 232 by 110 with a 192 by 52 app box, the card's own height.
CONTENT  Sources: Virtual IPs and Service Proxies, kube-proxy (v1.35).
         Only a first packet walks the nat table: `Not one NAT rule is read on the way back`.
         ESTABLISHED means packets both ways, so `the reply is what flips it to ESTABLISHED` stays.
         `while the entry lives`: an expired or evicted entry sends a packet back through the walk.
         A full table drops the packet. The chip is `ct state` beside the drawn conntrack entry.
         kube-proxy sizes the table (`--conntrack-max-per-core`, `--conntrack-min`).
```
