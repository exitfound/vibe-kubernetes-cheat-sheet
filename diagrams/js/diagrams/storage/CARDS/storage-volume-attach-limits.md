## storage-volume-attach-limits

### layout

```
WHAT     A Pod never gets a Node: each Node caps how many volumes one CSI driver may attach, and
         running out leaves the Pod Pending on `exceed max volume count` while CPU and memory are
         spare, a cap that stands twice, as CSINode allocatable.count and as three 8-slot Node
         strips.
DEVIATES C-14: the Pod is absent at rest, not dim.
CONTENT  Sources: Node-specific Volume Limits, CSINode, CSIDriver API (v1.36), CSI NodeGetInfo,
         nodevolumelimits/csi.go, nodeinfomanager.go, csi_node_updater.go at v1.36.5.
         Kubelet rewrites the count on nodeAllocatableUpdatePeriodSeconds (GA in 1.36), so never
         `written once`, and never `only` then: re-registration rewrites it. Zero: no ceiling.
         Skip is keyed on claims plus migrated in-tree volumes. Per driver, each volume once.
         Slot frees on detach for an attaching driver. Pod chip `unschedulable`, not the event.
```
