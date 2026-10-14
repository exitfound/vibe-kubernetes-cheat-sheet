## storage-volume-expansion

### layout

```
WHAT     Growing a bound volume in two phases: the API server admits the larger request, the
         external-resizer grows the device, Kubelet grows the filesystem, and a shrink is refused.
DEVIATES STO.S-01: the two mount lanes stay out of the field. They are keyed, full on every step
         and moved by nothing, so nothing leaks.
         STO.L-03: chips 252 wide with a 24 gap, so the four span the 60..1140 strip.
CONTENT  Sources (v1.36): Expanding Persistent Volumes Claims, Resizing an in-use
         PersistentVolumeClaim, Recovering from Failure when Expanding Volumes, PVC validation,
         resize admission, csi-resizer v2.2.1. The gate ball runs from the claim into the class its
         storageClassName names, at admission. A block volume `may skip` node expansion. The Node
         half runs `where a Pod uses the claim read-write`. `because this filesystem grows
         online`, `one or two phases`, shrinking has `no safe general way`. A walk-back `after an
         expansion failed` `retries a smaller grow` above status.capacity.
```
