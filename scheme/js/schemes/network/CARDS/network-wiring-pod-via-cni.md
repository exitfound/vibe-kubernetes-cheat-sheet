## network-wiring-pod-via-cni

### layout

```
WHAT     Who calls whom to wire a Pod: the Kubelet asks the CRI runtime for a sandbox, the runtime
         runs a list of CNI plugins in order, and one delegates addressing to an IPAM plugin.
DEVIATES NET.L-01: the sandbox Pod is 240 by 116 with a 196 by 60 pause box, the card's own size.
         The delegate is 212, sized by the plugin row it nests under.
         A-05: the plugin trunk is a `P.raw` path at full opacity with no arrowhead: the chain
         ball rides it. The two taps nothing rides stay a relation.
CONTENT  Sources: CNI Specification 1.1.0, Network Plugins (v1.35), CNI Plugins Reference.
         bridge with host-local nested and portmap second rest on the plugin pages, not the calico
         example. host-local's range is per Node by construction, `usePodCidr` is not the warrant.
         `CNI_IFNAME` is spec, `eth0` the runtime's pick. The desc says `every one after the first`.
         `The plugin chain that follows runs inside that one RunPodSandbox call`: DEL runs later.
         `DEL on delete` stands on `join`, the qualifier keeps the frame legal (T-35).
OPEN     `exec`, `delegate` and `chain` stand still most of their span. Every hop sits on the 700
         floor and `chain` already carries the shortest narration, so `M-19a` leaves no fix.
```
