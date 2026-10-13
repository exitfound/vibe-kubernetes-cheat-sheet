## storage-pv-lifecycle-phases

### layout

```
WHAT     A PV's phase is a status field one controller writes: a row of four phases under the PV
         controller band, every transition a write down its lane, and a CSI delete leaving the row.
DEVIATES STO.L-01: a state row under its writer, because the subject is the phase field of one API
         object, not an ownership chain.
         NET.L-01: the phase cells are 150 by 72, sized by the 196 pitch that fits the row.
         L-13: the PV is a column of its own fields bottom left, the free width under the panel.
         STO.L-03: the four fields stack as a column at an 8 gap, one object read top to bottom.
CONTENT  Sources: Lifecycle of a Volume and Claim, Phase, Reclaiming (v1.36), pv_controller.go
         v1.36.5, lib-external-provisioner v13.0.0. CSI: a failed DeleteVolume stays Released.
         Pending is only creation. Available reads `not bound`: a pre-bound PV is still Available.
         Bind names Immediate: under WaitForFirstConsumer kube-scheduler writes the claimRef.
         Failed reads `reclamation failed`, not `no way to reclaim` (it retries), drawn on NFS.
         `short of the deprecated Recycle`, never `the only way back is by hand`, nor `any claim`.
OPEN     CENTRE and CENTRE-LOW: the row centres on 769. The band spans exactly the row, and centred
         on 600 it stands under the panel at 1100x800.
```
