## storage-pvc-retention-policy

### layout

```
WHAT     persistentVolumeClaimRetentionPolicy is two independent switches, whenScaled and
         whenDeleted, each Retain or Delete. Delete gives the claim an ownerReference, so the
         garbage collector deletes it after its owner. Retain adds none.
DEVIATES STO.L-01: a 2x2 policy matrix, one row per field, one column per position, because the
         answer is which claims survive in which cell. No chip, the matrix is the readout.
         NET.L-01: claims are 116 by 44 cell slots, three to a cell, where two cells, the owner
         column and two gaps span 60..1140.
CONTENT  Sources: StatefulSets, Garbage Collection, Persistent Volumes (v1.35), controller source.
         The controller writes the ownerReference after it creates the Pod, on new and existing
         claims, so "from the start" is ruled out. "Retain never touches a claim" is ruled out: the
         controller scrubs its own references. `set-delete` names the default background cascade.
         `scale-up` names WaitForFirstConsumer, since the disk appears after the Pod. `the PVs say
         Delete` is the ordinary case and `if the PVs say Retain` the counterfactual.
```
