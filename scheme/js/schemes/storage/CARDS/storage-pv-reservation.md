## storage-pv-reservation

### layout

```
WHAT     A retained volume is handed to one named claim by pointing its claimRef at that claim with
         no UID. The reservation keeps every other claim out, and volumeName is the other half.
DEVIATES STO.L-01: an object board in two bands, writers above and the PV and its claim facing each
         other across the claimRef and volumeName lock, because nothing here is owned.
         L-13: the six chips are two columns under the two objects whose fields they are. Centred
         on 600 they lift off their objects.
CONTENT  Sources: Reserving a PersistentVolume, Retain, Lifecycle of a Volume and Claim (v1.35),
         pv_controller.go, pv_helpers.go, the DefaultStorageClass admission plugin, binder_test.go.
         The patch drops the UID: a set UID that differs refuses even a new claim of the old name.
         `the binder skips it`, never `every other claim skips it`. Docs and source differ on checks
         on the reserved bind, so the check is narrated only on the counterfactual. Class "" is a
         reason with no stated consequence. volumeName is never the key: `any claim that fits it`.
```
