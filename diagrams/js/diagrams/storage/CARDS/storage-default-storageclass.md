## storage-default-storageclass

### layout

```
WHAT     Four claims in creation order, the two writers that put the default class into a claim
         that left it out, and the class catalog whose lit rows carry is-default-class.
DEVIATES STO.L-01: an object board in three bands, admission plugin above the claims and the PV
         binding controller below, because nothing is owned by a Pod and the subject is who writes.
         STO.L-03: no chip strip. The changing value is a field on a claim, its own sublabel.
CONTENT  Sources (v1.36): Storage Classes, Persistent Volumes (Class, Retroactive assignment), Admission
         Controllers, code v1.36.5 setdefault admission.go, pv_controller.go, GetDefaultClass, validation.go.
         DOC-VS-CODE: Retroactive assignment says PVCs with an empty storageClassName get updated, code
         skips any non-nil class (PersistentVolumeClaimHasClass). The card follows the code.
         Retro writes only on the 15s resync, into an unbound claim with no volumeName that matched no
         volume. `most recently created`, never `annotated last`. Once written, the class is immutable.
OPEN     CENTRE reads the class catalog chain as a chip strip on 920. Centring it lays it over the
         admission box, and moving it below the claims takes it away from its reader.
```
