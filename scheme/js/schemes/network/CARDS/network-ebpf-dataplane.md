## network-ebpf-dataplane

### layout

```
WHAT     The eBPF dataplane replacing kube-proxy: a socket-hook program reads a BPF service map and
         connects the socket to a backend at connect() time, with no per-packet iptables walk.
DEVIATES NET.L-01: the client is 200 by 120 and both backends 210 by 114, the backend size of
         `network-service-clusterip`, all the card's own.
         M-12: the delivery leg rides `LEG_DUR` 1200, registered in `PACING`, so the riding src tag
         stays readable.
CONTENT  Sources: Virtual IPs and Service Proxies (v1.35), Kubernetes Without kube-proxy, eBPF.
         The src survives because the socket is connected first, not because nothing was NATed:
         iptables DNAT keeps the client IP too. The deliver step names destination and src both.
         No `main reason large clusters adopt this mode`: no source states that superlative.
         Cilium and Calico are named because the mechanism is a CNI implementation, not upstream.
         The upstream pages carry only the baseline, so the Cilium page is cited for the mechanism.
OPEN     The `src` tag on `deliver` is cut by the Pod web faces as the fan turns down into the Pod.
         It clears only at dy -61, too far off for a tag to read as its own ball's address.
```
