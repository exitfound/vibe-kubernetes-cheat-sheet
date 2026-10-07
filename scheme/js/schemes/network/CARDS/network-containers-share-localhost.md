## network-containers-share-localhost

### layout

```
WHAT     Containers in one Pod stand on one network stack: they reach each other over the shared
         loopback, bind ports in one shared space, and an outside call lands on the Pod's one eth0.
DEVIATES NET.L-01: the three columns are 200, sized by the 660 shell interior, and `lo` spans the
         container pair at 430. The shell is the 720 by 340 stage, the client Pod 232 by 116.
         NET.S-01: the shell holds four peer boxes through `tune`, which one inner box cannot hold.
         P-03: the readout chips turn at entry on `localhost` and `external`, the `P-06` reading.
CONTENT  Sources: Pod networking, Share Process Namespace (v1.35).
         eth0 is `the one interface in the Pod that faces the network`: `lo` is drawn beside it.
         A Pod has one address per family, so `one host with one address per family`.
         `no veth hop and nothing on the wire`: a route lookup is what puts the call on `lo`.
         `shareProcessNamespace` rides `recap` (T-19). A bind takes an (address, port) pair, and
         SO_REUSEPORT is left unnamed: it needs one effective UID across containers.
OPEN     `external` carries no Pod pulse on the shell arrival and nothing forbids one: whether the
         shell pulses there is a decision for the owner.
```
