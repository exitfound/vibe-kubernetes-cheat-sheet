## storage-pvc-binding

### layout

```
WHAT     A claim, three candidate volumes and the binding controller that scans them, picks the
         one that fits and fuses Pod, claim and PV x73a into one chain on the centre spine.
DEVIATES M-17: the three probes leave the controller together, one sweep of the shelf, never a
         staggered queue of errands. They land at their own pace because the routes differ.
CONTENT  Sources: Persistent Volumes (Binding), Storage Classes (v1.35), upstream pv_controller.go,
         pv_helpers.go FindMatchingVolume and the scheduler volume_binding.go.
         The deny ball is the Event `ProvisioningFailed`, never `FailedBinding`: it has a class.
         Classes are `fast` and `slow`, never `local-*`, which implies WaitForFirstConsumer.
         `once made it is exclusive`, never `lasts as long as the claim`: a Released PV keeps it.
         `no dynamic provisioner`, never bare `no provisioner`. All disks share one access mode.
```
