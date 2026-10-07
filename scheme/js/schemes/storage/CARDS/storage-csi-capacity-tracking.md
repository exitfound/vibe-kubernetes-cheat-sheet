## storage-csi-capacity-tracking

### layout

```
WHAT     The CSI controller publishes one CSIStorageCapacity object per class and topology segment,
         and the Scheduler filters Nodes on that free space instead of finding out from a failure.
DEVIATES STO.L-01: writer, ledger and reader along a bottom row under the two Nodes, because the
         capacity objects live in the API server, not on a Node, and the writer is drawn.
         L-23: the two Nodes keep a 40 floor, because a tag riding 14 over a ball that lands on the
         frame floor has to stay inside the frame and off the pool.
         L-23: the API server frame mirrors its floor off its top about the row where the write and
         the read meet it, so it closes 15 under the `claim 20Gi` caption.
CONTENT  Sources: Storage Capacity, CSIStorageCapacity API, CSI capacity tracking (v1.35),
         the external-provisioner README.
         One object per StorageClass AND topology segment, never per segment alone.
         `publish` credits --enable-capacity. storageCapacity true on the CSIDriver only lets the
         Scheduler use it. `not on free storage`, never `CPU and memory alone`.
         `can land on Node-1 again`, never `does`. `success` keeps `can still force a retry`.
```
