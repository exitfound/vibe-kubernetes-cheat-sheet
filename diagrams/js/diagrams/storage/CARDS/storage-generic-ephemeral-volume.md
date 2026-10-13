## storage-generic-ephemeral-volume

### layout

```
WHAT     An inline volumeClaimTemplate gets a real PVC, class, provisioning and CSI mount, but the
         claim is owned by the Pod and is garbage-collected after the Pod is deleted.
CONTENT  Sources (v1.36): Ephemeral Volumes, and at v1.36.5 the ephemeral volume controller,
         ephemeral.go, volumebinding, pvcprotection. The controller, never the Pod, makes
         `<pod>-<volume>`, controller owner the Pod. A same-named claim it does not own is never
         used. WaitForFirstConsumer waits for a Node. `emptyDir cannot be large` is ruled out: fixed
         size. Snapshot, clone, resize only if the driver can. Collection follows the delete, Retain
         outlives the Pod. Under Delete the GC removes only the claim: the external-provisioner
         (v6.3.0) calls DeleteVolume on the Released PV and then removes it, so no ball runs PVC to
         PV. PVC quota applies. `ownerReferences` on the wire, `ownerReference` the concept.
```
