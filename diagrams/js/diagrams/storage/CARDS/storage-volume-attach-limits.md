## storage-volume-attach-limits

### layout

```
WHAT     A Pod never gets a Node: each Node caps how many volumes one CSI driver may attach, and
         running out leaves the Pod Pending on `exceed max volume count` while CPU and memory are
         spare. The cap stands twice, as CSINode allocatable.count and as three 8-slot Node strips.
DEVIATES STO.L-04: at 900x650 the left `cap 8` tag rounding its corner on `cap`, and on the
         ten-line steps that left report lane corner, lie under the panel. The upper tiers stay inside 400..800 and the Node row is
         too wide to move.
         NET.L-01: the slots and counters are a gauge, never actors. A slot is a plain rect that only
         changes fill. A counter lights as the reading a step is about, and never pulses or takes a
         packet.
         The Node row is wider than the tiers above on purpose: a machine is not the smallest object
         on a card about what a machine can hold. One CSINode spans the row, not three.
         The Pod is absent at rest, not dim. The report lanes stand full from the first frame.
CONTENT  Sources: Node-specific Volume Limits, CSINode, CSIDriver API (v1.36), CSI NodeGetInfo,
         nodevolumelimits/csi.go, nodeinfomanager.go, csi_node_updater.go at v1.36.5.
         Kubelet rewrites the count on nodeAllocatableUpdatePeriodSeconds (GA in 1.36), so never
         `written once`, and never `only` then: re-registration rewrites it. Zero: no ceiling.
         Skip is keyed on claims plus migrated in-tree volumes. Per driver, each volume once.
         Slot frees on detach for an attaching driver. Pod chip `unschedulable`, not the event.
```
