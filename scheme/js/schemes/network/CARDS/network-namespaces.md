## network-namespaces

### layout

```
WHAT     A Pod gets its own copy of the network stack, drawn as four layers inside the namespace,
         and every container in the Pod joins that one copy instead of getting one each.
DEVIATES NET.L-01: the netns shell is 600 by 469, the stage padded off the 520 slab band, and the
         three containers are 160 wide, sized by that band.
         NET.S-01: the netns is a bare `podShell` holding three containers and a stack band, which
         `buildPod` with its single inner box cannot hold.
CONTENT  Sources: Pod networking, network_namespaces(7), CRI Spec, CNI Specification (v1.35).
         The four layers are a selection, never a closed set: nothing on the card says only.
         `iptables` names the layer: `Netfilter` fails T-06 and T-09, and iptables is the default.
         The hostNetwork exception rides `open` and the desc (T-19).
         The teardown credits the runtime calling CNI DEL, not the namespace.
         The veth is `normally` the only door: macvlan, ipvlan and SR-IOV plugins add other devices.
```
