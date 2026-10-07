## storage-volume-attach-limits

### layout

```
WHAT     A Pod never gets a Node: each Node caps how many volumes one CSI driver may attach, and
         running out leaves the Pod Pending on `exceed max volume count` while CPU and memory are
         spare. The cap stands twice, as CSINode allocatable.count and as three 8-slot Node strips.
DEVIATES STO.L-04: at 900x650 the `cap 8` tag on `cap` lies under the panel. The upper tiers stay
         inside 400..800 and the Node row is too wide to move.
         NET.L-01: the slots and counters are a gauge, plain rects, never actors. They never take
         .highlight, pulse or a packet, and only change fill.
         M-12: one REPORT_DUR for the three report balls, the max of their routeDurs, so they land
         together and the CSINode does not light before two of them arrive.
         The Node row is wider than the tiers above on purpose: a machine is not the smallest object
         on a card about what a machine can hold. One CSINode spans the row, not three.
         The Pod is absent at rest, not dim. The report lanes stand full from the first frame.
CONTENT  Sources: Node-specific Volume Limits (v1.35), scheduler nodevolumelimits/csi.go and
         pkg/volume/csi/csi_plugin.go at release-1.35.
         Kubelet writes CSINode from NodeGetInfo, not the node-driver-registrar.
         `a Pod that claims no volume is skipped`, keyed on the claim, not `asks for no volumes`.
         The count includes live VolumeAttachments, so the slot frees on detach, not on Pod death.
         Rejection is on the sum (`eight plus the one web-0 needs`). `placed`, never `Running`.
```
