## network-hostnetwork-hostport

### layout

```
WHAT     The two Pod fields that take a Pod out of having its own namespace, IP and veth,
         hostNetwork and hostPort, on one Node seen from the LAN side.
DEVIATES NET.L-01: both Pods are 210 by 110 with a 170 by 48 app box, the card's own size.
CONTENT  Sources: Pod networking, PodSpec, hostPort practices, CNI portmap, user namespaces (v1.36).
         hostNetwork copies containerPorts to hostPort. An undeclared one fails to bind: so `runs`.
         `no namespace of its own` is ruled out, other namespaces stay. `status.podIP` = Node IP.
         portmap adds DNAT and masquerade rules, so `only adds a port mapping`, not one DNAT rule.
         The Pod sees the LAN client, so its socket `only ever sees its own address and port`.
         Userns page bars hostNetwork, code allows it behind alpha UserNamespacesHostNetworkSupport.
```
