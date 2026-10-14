## storage-pv-reservation

### layout

```
WHAT     A retained volume is handed to one named claim by pointing its claimRef at that claim with
         no UID, a reservation that keeps every other claim out, with volumeName as the other half.
DEVIATES STO.L-01: an object board in two bands, writers above and the PV and its claim facing each
         other across the claimRef and volumeName lock, because nothing here is owned.
         L-13: the six chips are two columns under the two objects whose fields they are. Centred
         on 600 they lift off their objects.
CONTENT  Sources (1.36): Reserving a PersistentVolume, Retain, Lifecycle, pv_controller.go,
         pv_helpers.go, DefaultStorageClass admission at v1.36.5. The patch drops the UID: a set UID
         refuses even a new claim of the old name. `the binder skips it`, never `every other claim
         skips it`. DOC-VS-CODE: the page checks any volumeName bind, the code skips the checks once
         claimRef names the claim, so they are narrated only on the counterfactual, volume mode
         included. The rival sets class "": unset gets a default. volumeName is never the key.
```
