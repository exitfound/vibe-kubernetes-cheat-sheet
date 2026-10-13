## storage-ephemeral-storage-eviction

### layout

```
WHAT     An ephemeral-storage limit is a budget the Kubelet enforces after the bytes are written:
         it sums the writable layer, the log and the disk emptyDir of Pod web-a, finds the Pod over
         the 1Gi sum of its container limits while the container alone is inside it, and evicts
         the Pod on a Node that never ran short of disk. The gauge is to scale, widths are values.
DEVIATES STO.L-03: chips are 228 wide so the strip spans the gauge, 120..1080.
CONTENT  Sources: Local ephemeral storage, Node-pressure Eviction (v1.36), eviction manager v1.36.5.
         "Was not yet requested", not "was free". "The limit refuses no write": a full disk does.
         Node-1 is one filesystem: beside a dedicated image filesystem the container check drops the
         layer (DOC-VS-CODE: the page says layer and log). Quotas: gate, hostUsers false, prjquota.
         "A 1 second grace period", kuberuntime floors each container stop to 2s. No DisruptionTarget
         here. Checks run sizeLimit, Pod, container, stop at the first hit. Chip held on `replace`.
OPEN     CENTRE: the rule counts only the two top-row blocks, and the gauge that balances them is
         bare rects. Carried in fixtures/carried.mjs.
```
