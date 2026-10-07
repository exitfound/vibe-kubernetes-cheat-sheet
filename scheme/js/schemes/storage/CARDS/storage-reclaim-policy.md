## storage-reclaim-policy

### layout

```
WHAT     The reclaim policy is stamped on each PV from its class, can be patched on a live volume,
         and alone decides whether deleting the claim destroys the disk or leaves an orphan.
DEVIATES L-13: each column carries its own pair of chips under it, on the 640 stack centre, so the
         2x2 grid reads across for the policies and down for one stack.
CONTENT  Sources: Reclaiming, Retain, Change the Reclaim Policy of a PersistentVolume (v1.35),
         external-provisioner controller.go, sig-storage-lib-external-provisioner.
         The PV field is persistentVolumeReclaimPolicy. The band says `the reclaim policy`, never
         the class field `reclaimPolicy`. Under Delete the provisioner calls DeleteVolume, `only
         then is the PV object removed`. A Released PV is `not yet` available, never `never
         offered`, so data-c gets a new disk. Retain reuse is `given a new PV by hand`.
OPEN     CENTRE-LOW: the blocks under the panel read 120..880 on 500, the stack starting at the wall
         with the class as the one side block there. On the right it reopens the content CENTRE.
```
