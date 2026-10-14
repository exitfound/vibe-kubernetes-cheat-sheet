## storage-reclaim-policy

### layout

```
WHAT     The reclaim policy is stamped on each PV from its class, can be patched on a live volume,
         and alone decides whether deleting the claim destroys the disk or leaves an orphan.
DEVIATES L-13: each column carries its own pair of chips under it, on the 640 stack centre, so the
         2x2 grid reads across for the policies and down for one stack.
CONTENT  Sources: Reclaiming, Retain, Delete, PersistentVolume deletion protection finalizer,
         Change the Reclaim Policy (v1.36), PV API reference, pv_controller.go v1.36.5,
         external-provisioner v6.3.0. The PV field is persistentVolumeReclaimPolicy, the band never
         says the class field `reclaimPolicy`. A hand-made PV that names none gets Retain. Under
         Delete DeleteVolume runs first, `only then is the PV object removed`, in either delete
         order (finalizer). A Released PV is `not yet` available, never `never offered`. Retain
         reuse is `given a new PV by hand`. `nothing left to recover` is ruled out.
OPEN     CENTRE-LOW: the blocks below the panel read 120..880 on 500, the stack starting at LEFT_X
         400 with the class as the one side block there. On the right it reopens the content CENTRE.
```
