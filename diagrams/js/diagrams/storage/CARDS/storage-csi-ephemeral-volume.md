## storage-csi-ephemeral-volume

### layout

```
WHAT     A CSI volume written inline in the Pod spec skips the claim path: Kubelet checks the
         CSIDriver lists Ephemeral and calls NodePublishVolume, which creates the volume, and
         NodeUnpublishVolume deletes it. A ghost row draws the claim objects it never creates.
DEVIATES NET.L-01: the ghost row is 158 by 80, solved as 4w + 3g = 740. Ghosts are not actors.
         L-23: the Node frame is placed by its centre, NODE_CY 336, because its two face midpoints
         are the only doors anything outside uses. Its rows move with it.
         The ghost row never lights, pulses, dims by step or carries a ball. No chip strip: every
         state the narration names is on the canvas. The store is a box, not a cylinder (a disk
         reads as the PV the card denies).
CONTENT  Sources (1.36): Ephemeral Volumes, pkg/volume/csi v1.36.5, kubernetes-csi Ephemeral Local
         Volumes, Secrets Store driver v1.6.1 (concepts, nodeserver.go, csidriver.yaml podInfoOnMount).
         Ephemeral is checked at mount time, also with no CSIDriver. CanAttach is false inline.
         `as written` is ruled out: podInfoOnMount adds Pod info. readOnly true: the driver rejects false.
         The tmpfs mounts before the fetch (DOC-VS-CODE: concepts says fetch, then tmpfs). The provider
         fetches. Store `outside the Kubernetes API`, `lives and dies with the Pod`, no lowercase `secret`.
```
