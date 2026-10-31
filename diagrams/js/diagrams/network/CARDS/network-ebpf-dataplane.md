## network-ebpf-dataplane

### layout

```
WHAT     The eBPF dataplane replacing kube-proxy: a socket-hook program reads a BPF service map and
         connects the socket to a backend at connect() time, with no per-packet iptables walk.
DEVIATES NET.L-01: the client is 200 by 120 and both backends 210 by 114, the backend size of
         `network-service-clusterip`, all the card's own.
         M-12: the delivery leg rides `LEG_DUR` 1200, registered in `PACING`, so the riding src tag
         stays readable.
CONTENT  Sources: Virtual IPs, Architecture (v1.36), Cilium 1.19 (KPR, intro), Calico 3.33, eBPF.io.
         The src survives because the socket is connected first, not because nothing was NATed:
         iptables DNAT keeps the client IP too. No `main reason large clusters adopt this mode`.
         `the modern dataplane` is ruled out: the 1.36 page calls nftables an iptables replacement.
         Removing kube-proxy rests on the agent implementing Services, not on constant-time lookups.
         Calico replaces kube-proxy only in eBPF mode. Cilium keeps base iptables rules of its own.
OPEN     The `src` tag on `deliver` is cut by the Pod web faces as the fan turns down into the Pod.
         It clears only at dy -61, too far off for a tag to read as its own ball's address.
```
