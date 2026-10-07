## storage-default-storageclass

### layout

```
WHAT     Four claims in creation order, the two writers that put the default class into a claim
         that left it out, and the class catalog whose lit rows carry is-default-class.
DEVIATES STO.L-01: an object board in three bands, admission plugin above the claims and the PV
         binding controller below, because nothing is owned by a Pod and the subject is who writes.
         STO.L-03: no chip strip. The changing value is a field on a claim, its own sublabel.
CONTENT  Sources: Storage Classes (Default StorageClass), Persistent Volumes (Class, Retroactive
         default StorageClass assignment), Admission Controllers (v1.35), upstream admission.go,
         pv_controller.go, storageclass.go GetDefaultClass, validation.go.
         `An empty string is a value, so the plugin leaves it alone`: any non-nil class counts.
         `the most recently created of the two`, never `annotated last`: newest first.
         `a class, once written, does not follow the default` rests on update validation.
OPEN     CENTRE reads the class catalog chain as a chip strip on 920. Centring it lays it over the
         admission box, and moving it below the claims takes it away from its reader.
```
