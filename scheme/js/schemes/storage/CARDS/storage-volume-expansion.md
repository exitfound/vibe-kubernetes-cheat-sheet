## storage-volume-expansion

### layout

```
WHAT     Growing a bound volume in two phases: the API server admits the larger request, the
         external-resizer grows the device, Kubelet grows the filesystem, and a shrink is refused.
DEVIATES STO.L-04: at 900x650 the panel covers the top of Kubelet and the left end of the verdict
         caption. Kubelet is half of the mirrored phase pair, and the caption can only move down.
         STO.S-01: the two mount lanes stay out of the field. They are keyed, full on every step
         and moved by nothing, so nothing leaks.
         STO.L-03: chips 252 wide with a 24 gap, so the four span the 60..1140 strip.
CONTENT  Sources: Expanding Persistent Volumes Claims, Resizing an in-use PersistentVolumeClaim
         (v1.35), the CSI spec, kubernetes-csi volume-expansion, the resize admission plugin.
         The API server gates the edit at admission, so the gate ball runs from the claim into the
         class it reads. A block volume `may skip` node expansion, never `skips`.
         `because this filesystem grows online`, `one or two phases`. A walked-back request
         `retries a smaller grow`, never `cancels`. Shrinking has `no safe general way`.
```
