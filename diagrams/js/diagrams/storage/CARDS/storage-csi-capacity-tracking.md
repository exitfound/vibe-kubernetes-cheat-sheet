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
CONTENT  Sources (1.36): Storage Capacity, CSIStorageCapacity API, binder.go at v1.36.5, external-provisioner
         v6.3.0 README and controller.go, sig-storage-lib-external-provisioner v13.0.0 controller.go.
         The CSI book page still says Alpha. One object per StorageClass AND segment, WFFC classes by
         default. `publish` credits --enable-capacity, storageCapacity true only lets the Scheduler
         use it. The filter prefers maximumVolumeSize. The reset needs ResourceExhausted and a driver
         with topology. The `ResourceExhausted` ball ends on the CSI controller, never the Scheduler:
         the library inside the external-provisioner removes selected-node (rescheduleProvisioning),
         and the Pod leaves Node-1 on that arrival. `not on free storage`, never `CPU and memory
         alone`. `can land on Node-1 again`, never `does`. `success` keeps `can still force a retry`.
```
