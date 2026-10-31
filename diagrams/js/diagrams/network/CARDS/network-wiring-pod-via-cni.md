## network-wiring-pod-via-cni

### layout

```
WHAT     Who calls whom to wire a Pod: the Kubelet asks the CRI runtime for a sandbox, the runtime
         runs a list of CNI plugins in order, and one delegates addressing to an IPAM plugin.
DEVIATES NET.L-01: the sandbox Pod is 240 by 116 with a 196 by 60 pause box, the card's own size.
         A-05: the plugin trunk is a `P.raw` path at full opacity with no arrowhead: the chain
         ball rides it. The two taps nothing rides stay a relation.
         C-14: pause rests dim until the chain returns, keeping its static sublabel with no
         `not started` line: step 1 narrates the order (netns, chain, then pause).
CONTENT  Sources: CNI Specification 1.1.0, Network Plugins (v1.36), CNI Plugins Reference (v1.9),
         containerd 2.2 and 2.3 sandbox_run.go: netns, then the chain, then pause. A pause
         that starts before the chain is ruled out. bridge with host-local nested and portmap
         second rest on the plugin pages. host-local's range is per Node by construction.
         `CNI_IFNAME` is spec, `eth0` the runtime's pick.
         The chain runs inside RunPodSandbox, DEL later: `DEL on delete` stands on `join` (T-35).
OPEN     `exec`, `delegate` and `chain` stand still most of their span. Every hop sits on the 700
         floor and `chain` already carries the shortest narration, so `M-19a` leaves no fix.
```
