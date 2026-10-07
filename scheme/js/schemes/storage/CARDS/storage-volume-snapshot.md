## storage-volume-snapshot

### layout

```
WHAT     A snapshot freezes one moment of a live volume, a restore brings it back as a new volume,
         and all three share one storage pool, so on such a backend a snapshot is not a backup.
DEVIATES STO.L-01: an instrument panel, the volume as rows of block cells in one pool frame (live,
         snapshot, restore), because only blocks show which data a snapshot holds.
CONTENT  Sources: Volume Snapshots (v1.35), external-snapshotter, ceph-csi, Ceph docs.
         Copy on write and pool placement are backend facts: the card names Ceph RBD and says "on a
         backend like this one", never snapshots in general. CreateSnapshot goes to the driver, not
         the pool. A restore is a new crash-consistent volume, never an in-place rollback, and it
         takes its pool from its own class, so the desc says "Here". readyToUse stays true on
         `loss`: the sidecar stops checking a content once it is ready.
```
