## storage-pvc-binding

### layout

```
WHAT     A claim, three candidate volumes and the binding controller that scans them, picks the
         one that fits and fuses Pod, claim and PV x73a into one chain on the centre spine.
DEVIATES M-17: the three probes leave the controller together, one sweep of the shelf, never a
         staggered queue of errands. They land at their own pace because the routes differ.
CONTENT  Sources (v1.36): Persistent Volumes (Binding, Class), Storage Classes, upstream v1.36.5
         pv_controller.go bind, pv_helpers.go FindMatchingVolume, scheduler volume_binding.go.
         Deny is `ProvisioningFailed` (a no-provisioner class), never `FailedBinding`. Say `no
         dynamic provisioner`. `smallest one that fits`, never `satisfies all three`: mode,
         selector, VAC filter too. `still unbound`, never `because it is Pending`. No step names
         the undrawn Scheduler. `fast`/`slow`, never `local-*`. `exclusive`, never `lasts as long
         as the claim`: Released keeps it.
```
