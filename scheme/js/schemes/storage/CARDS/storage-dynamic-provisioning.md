## storage-dynamic-provisioning

### layout

```
WHAT     A Pending claim whose class names a provisioner: CreateVolume builds the disk, the PV is
         written already carrying the claimRef, and the binding controller finishes the pair.
DEVIATES L-13: the chip strip centres on CANVAS_CX while the two columns centre on 652 (see OPEN).
CONTENT  Sources: Dynamic Provisioning, Storage Classes (v1.35), the external-provisioner library.
         The PV is `pvc-a7f2`, never bare `a7f2`: the provisioner names it `pvc-<claim UID>`.
         `bind` names the binding controller as the writer of volumeName. The provisioner only sets
         the claimRef. `whose class names it`, never `a class it owns`: nothing owns a class.
         The class ball carries `type: gp3`, a parameter: the provisioner name is a sublabel.
OPEN     CENTRE and CENTRE-LOW: the columns read 400..904 on 652. LEFT_X 400 is the panel wall, the
         columns are the catalog 232, and narrowing the 40 elbow channel crushes the elbows.
```
