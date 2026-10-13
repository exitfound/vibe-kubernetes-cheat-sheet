## storage-dynamic-provisioning

### layout

```
WHAT     A Pending claim whose class names a provisioner: CreateVolume builds the disk, the PV is
         written already carrying the claimRef, and the binding controller finishes the pair.
DEVIATES L-13: the chip strip centres on CANVAS_CX while the two columns centre on 652 (see OPEN).
CONTENT  Sources (v1.36): Dynamic Provisioning, Storage Classes, Well-Known Annotations, code v1.36.5
         pv_controller.go, FindMatchingVolume, external-provisioner v6.3.0 (lib v13.0.0) controller.go.
         The sidecar keys on the claim annotation volume.kubernetes.io/storage-provisioner, which the
         binding controller copies from the class, under Immediate: never `claims whose class names it`.
         The `nomatch` ball rides class to claim tagged `storage-provisioner: ebs.csi.aws.com`, the key
         without its volume.kubernetes.io/ prefix (`provision` spells it whole). No binding-controller
         box is drawn, so the ball leaves the class whose provisioner value it copies.
         PV `pvc-a7f2` (`pvc-<claim UID>`), the class ball carries the parameter `type: gp3`. In `bind`
         the match still runs and returns the pre-bound PV, PV Bound first: never `nothing to search`.
OPEN     CENTRE and CENTRE-LOW: the columns read 400..904 on 652. LEFT_X 400 is the panel wall, the
         columns are the catalog 232, and narrowing the 40 elbow channel crushes the elbows.
```
