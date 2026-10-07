## storage-ephemeral-storage-eviction

### layout

```
WHAT     An ephemeral-storage limit is a budget the Kubelet enforces after the bytes are written:
         it sums the writable layer, the log and the disk emptyDir of Pod web-a, finds the Pod over
         the 1Gi sum of its container limits while the container alone is inside it, and evicts
         the Pod on a Node that never ran short of disk. The gauge is to scale, widths are values.
DEVIATES STO.L-03: chips are 228 wide so the strip spans the gauge, 120..1080.
CONTENT  Sources: Ephemeral Storage, Node-pressure Eviction (v1.35), kubelet eviction manager.
         "Was not yet requested", not "was free": the scheduler counts requests, never disk use.
         "The limit refuses no write", not "nothing refuses a write": a full filesystem does.
         Kubelet reads the usage "it last measured". Project quotas name all three conditions.
         "A 1 second grace period, whatever its spec asks", not "at once". The checks run in order
         and stop at the first hit. The Pod chip stays `Failed, Evicted` on `replace`.
OPEN     CENTRE: the rule counts only the two top-row blocks, and the gauge that balances them is
         bare rects. Carried in fixtures/carried.mjs.
```
