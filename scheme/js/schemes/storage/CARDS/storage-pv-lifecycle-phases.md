## storage-pv-lifecycle-phases

### layout

```
WHAT     A PV's phase is a status field one controller writes: a row of four phases under the PV
         controller band, every transition a write down its lane, and a CSI delete leaving the row.
DEVIATES STO.L-01: a state row under its writer, because the subject is the phase field of one API
         object, not an ownership chain.
         NET.L-01: the phase cells are 150 by 72, sized by the 196 pitch that fits the row.
         L-13: the PV is a column of its own fields bottom left, the free width under the panel.
CONTENT  Sources: Lifecycle of a Volume and Claim, Phase, Reclaiming (v1.35), pv_controller.go,
         sig-storage-lib-external-provisioner. The row keeps four phases: Pending is only creation.
         Available reads `not bound`, never `no claimRef`: a pre-bound PV is still Available.
         For CSI the external-provisioner deletes, and a failed DeleteVolume stays Released.
         Failed is `reclamation failed, for instance when no plugin can delete it`, drawn on NFS.
         `short of the deprecated Recycle`, never `the only way back is by hand`, nor `any claim`.
OPEN     CENTRE and CENTRE-LOW: the row centres on 769. The band spans exactly the row, and centred
         on 600 it stands under the panel at 1100x800.
```
