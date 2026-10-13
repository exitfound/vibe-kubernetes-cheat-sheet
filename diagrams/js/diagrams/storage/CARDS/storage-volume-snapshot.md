## storage-volume-snapshot

### layout

```
WHAT     A snapshot freezes one moment of a live volume, a restore brings it back as a new volume,
         and all three share one storage pool, so on such a backend a snapshot is not a backup.
DEVIATES STO.L-01: an instrument panel, the volume as rows of block cells in one pool frame (live,
         snapshot, restore), because only blocks show which data a snapshot holds.
CONTENT  Sources: Volume Snapshots, PV restore (v1.36), external-snapshotter v8.6.0, external-provisioner
         v6.3.0, ceph-csi. Copy on write and pool placement are backend facts, said "on a backend like this
         one". The snapshot controller binds, the csi-snapshotter sidecar sends CreateSnapshot. A restore is a
         new volume, never in place, in a class of the same driver, at least restoreSize, its pool from its
         class, so the desc says "Here". Crash consistent as nothing quiesced db-0. readyToUse stays true on
         `loss`, the sidecar skips ready content. DOC-VS-CODE: doc wants a validating webhook, v8.6.0 has none.
```
