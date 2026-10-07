## network-hostnetwork-hostport

### layout

```
WHAT     The two Pod fields that take a Pod out of having its own namespace, IP and veth,
         hostNetwork and hostPort, on one Node seen from the LAN side.
DEVIATES NET.L-01: both Pods are 210 by 110 with a 170 by 48 app box, the card's own size.
CONTENT  Sources: Pod networking, Do not use hostPort or hostNetwork lightly, CNI portmap (v1.35).
         A hostNetwork Pod gets its containerPorts copied into hostPort: the scheduler checks both.
         A hostNetwork Pod declaring no port schedules and fails to bind: a second Pod cannot RUN.
         portmap adds DNAT and masquerade rules, so `only adds a port mapping`, not one DNAT rule.
         The Pod does see the LAN client, so its socket `only ever sees its own address and port`.
         `status.podIP` holds the Node address, so the chip reads `192.168.1.20 (Node)`.
```
