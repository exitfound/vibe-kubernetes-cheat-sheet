## storage-pvc-clone

### layout

```
WHAT     A clone is an ordinary PVC plus dataSource naming an existing claim, made only when the new
         claim fits its source row by row, and nothing links the two afterwards.
DEVIATES STO.L-01: two spec listings level across a column of gates, the fit test read row by row,
         because which fields must agree is the subject. The field chips are the chip strip.
         L-23: the backend frame keeps a 13 inset over and under its disks. The head row is pinned
         under the panel, and a padded frame leaves 28 for the call corridor, caption and margin.
CONTENT  Sources: CSI Volume Cloning, Storage Classes (v1.35), external-provisioner, ceph-csi.
         `Class may differ, same driver`: the provisioner rejects a source on another driver. A
         misfit names size, mode or driver only, since `not in use` is documented but not checked.
         "No VolumeSnapshot object in between", not "no snapshot": ceph-csi uses a backend one.
         CreateVolume is called on the driver and lands on the backend, never on the clone claim.
         The source `phase` chip keeps Bound on `independent`: Terminating is not a phase.
```
