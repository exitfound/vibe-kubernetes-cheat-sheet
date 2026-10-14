## storage-volumeclaimtemplates

### layout

```
WHAT     StatefulSet volumeClaimTemplates seen from the claim: how each PVC is named, minted in
         ordinal order, bound, kept on scale-down and mounted again by a recreated Pod.
DEVIATES STO.L-01: three ordinal rows with the claim on the canvas spine and its Pod and disk
         mirrored either side, so identity reads across a row and the mint is one vertical spine.
CONTENT  Sources: StatefulSets, Persistent Volumes (release-1.36), stateful_pod_control.go v1.36.5.
         Claim `<template>-<set>-<ordinal>`, created before its Pod, an existing one reused. Only
         the claim name is fixed, not the PV, and no StorageClass is named. "No two Pods share a
         disk" is ruled out, only replicas. An in-range Pod keeps its claim under any retention
         policy, and its replacement never rebinds. The PV web-2 wire never reads `retained` (the
         reclaimPolicy). DOC-VS-CODE: statefulset.md says enable StatefulSetAutoDeletePVC, v1.36.5
         has no such gate.
```
