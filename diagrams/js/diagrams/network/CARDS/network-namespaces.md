## network-namespaces

### layout

```
WHAT     A Pod gets its own copy of the network stack, drawn as four layers inside the namespace,
         and every container in the Pod joins that one copy instead of getting one each.
DEVIATES NET.L-01: the netns shell is 600 by 469, the stage padded off the 520 slab band.
         NET.S-01: the netns is a bare `podShell` holding three containers and a stack band, which
         `buildPod` with its single inner box cannot hold.
CONTENT  Sources: Pod networking, network_namespaces(7), CRI api.proto, CNI spec 1.1.0, loopback.c (v1.36).
         "pause opens the netns" is ruled out: the runtime creates it before CNI ADD (CNI spec).
         Pause holds it: containerd 2.2 and 2.3 join app containers via /proc/<pause pid>/ns/net.
         The four layers are a selection, nothing says only. `iptables`, not `Netfilter` (T-06).
         The hostNetwork exception rides `open` and desc `usually` (T-19). Runtime calls CNI DEL.
         Veth door on the usual plugins. "a second device" is ruled out: macvlan, ipvlan replace it.
```
