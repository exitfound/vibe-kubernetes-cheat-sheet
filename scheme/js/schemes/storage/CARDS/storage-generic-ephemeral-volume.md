## storage-generic-ephemeral-volume

### layout

```
WHAT     An inline volumeClaimTemplate gets a real PVC, class, provisioning and CSI mount, but the
         claim is owned by the Pod and is garbage-collected after the Pod is deleted.
CONTENT  Sources: Ephemeral Volumes (v1.35).
         The ephemeral volume controller creates the PVC, never the Pod. The claim is named
         `<pod>-<volume>`. Snapshot, clone and resize hold only if the driver supports them.
         Collection runs after the delete, not with it, and a Retain class outlives the Pod.
         Anyone who can create a Pod can create a claim this way. The wire quotes the list field
         `ownerReferences`, and `ownerReference` stays the concept name.
```
