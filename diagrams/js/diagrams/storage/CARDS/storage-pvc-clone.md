## storage-pvc-clone

### layout

```
WHAT     A clone is an ordinary PVC plus dataSource naming an existing claim, made only when the new
         claim fits its source row by row, and nothing links the two afterwards.
DEVIATES STO.L-01: two spec listings level across a column of gates, the fit test read row by row,
         because which fields must agree is the subject. The field chips are the chip strip.
         L-23: the backend frame keeps a 13 inset over and under its disks. The head row is pinned
         under the panel, and a padded frame leaves 28 for the call corridor, caption and margin.
CONTENT  Sources: CSI Volume Cloning, Volume Populators and Data Sources (v1.36), CSI spec, ceph-csi,
         external-provisioner v6.3.0. DOC-VS-CODE: the page wants a source not in use, sized by its volume,
         v6.3.0 checks Bound, not deleting and the source claim request, never Pods: the card follows code.
         No CLONE_VOLUME, another driver or any misfit leaves clone-1 Pending. Cross-namespace is alpha.
         The clone finalizer holds data-src only while a clone is Pending. "No VolumeSnapshot object", not
         "no snapshot": ceph-csi uses one. CreateVolume lands on the backend. Source phase stays Bound.
```
