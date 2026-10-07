## storage-volumeclaimtemplates

### layout

```
WHAT     StatefulSet volumeClaimTemplates seen from the claim: how each PVC is named, minted in
         ordinal order, bound, kept on scale-down and mounted again by a recreated Pod.
DEVIATES STO.L-01: three ordinal rows with the claim on the canvas spine and its Pod and disk
         mirrored either side, so identity reads across a row and the mint is one vertical spine.
CONTENT  Sources: StatefulSets, Persistent Volumes (v1.35), stateful_set_utils.go.
         The claim is `<template>-<set>-<ordinal>`. Only the claim name is fixed, not the PV.
         No StorageClass is named, the default class applies. A claim binds one PV, so "no two Pods
         share a disk" is ruled out. The recreated Pod mounts its still-Bound claim, never rebinds.
         The retention chip reads `on scale-down` and states only the default Retain. The wire
         beside PV web-2 never reads `retained`, which would name the PV reclaimPolicy.
```
