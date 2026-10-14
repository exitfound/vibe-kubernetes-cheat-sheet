## storage-pvc-retention-policy

### layout

```
WHAT     persistentVolumeClaimRetentionPolicy is two independent switches, whenScaled and
         whenDeleted, each Retain or Delete, where Delete gives the claim an ownerReference so the
         garbage collector deletes it after its owner and Retain adds none.
DEVIATES STO.L-01: a 2x2 policy matrix, one row per field, one column per position, because the
         answer is which claims survive in which cell.
CONTENT  Sources (1.36): StatefulSets, Garbage Collection, Persistent Volumes, Storage Classes,
         controller/statefulset at v1.36.5, KEP 1847. Ref written after Pod create, only on claims
         of current Pods, so "every claim" is ruled out. Retain scrubs refs. `set-delete`: GC
         deletes claims with the Pods, PVC protection holds them. `scale-up` waits out a stale
         claim. DOC-VS-CODE: StatefulSets says enable gate StatefulSetAutoDeletePVC, code has no
         such gate (GA 1.32, removed). `if the PVs say Retain` is the counterfactual.
```
