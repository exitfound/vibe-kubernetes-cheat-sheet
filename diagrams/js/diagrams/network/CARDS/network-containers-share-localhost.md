## network-containers-share-localhost

### layout

```
WHAT     Containers in one Pod stand on one network stack: they reach each other over the shared
         loopback, bind ports in one shared space, and an outside call lands on the Pod's one eth0.
DEVIATES NET.L-01: the Pod is the 720 by 340 stage, and the client Pod is 232 by 116.
         NET.S-01: the shell holds four peer boxes through `tune`, which one inner box cannot hold.
         P-03: the readout chips turn at entry on `localhost` and `external`, the `P-06` reading.
CONTENT  Sources: Pod networking, Share Process Namespace (v1.36).
         eth0 is `the one interface in the Pod that faces the network`: `lo` is drawn beside it.
         `one address per address family`, the page's own phrase. `no veth hop and nothing on the
         wire`: a route lookup is what puts the call on `lo`. `own root filesystem`: volumes are shared, so `own
         filesystem` is ruled out, and `shareProcessNamespace` qualifies the process tree (T-19).
         A bind takes an (address, port) pair. SO_REUSEPORT is unnamed: it needs one effective UID.
```
