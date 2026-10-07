## storage-csi-ephemeral-volume

### layout

```
WHAT     A CSI volume written inline in the Pod spec skips the claim path: Kubelet checks the
         CSIDriver lists Ephemeral and calls NodePublishVolume, which creates the volume, and
         NodeUnpublishVolume deletes it. A ghost row draws the claim objects it never creates.
DEVIATES NET.L-01: the ghost row is 158 by 80, solved as 4w + 3g = 740. Ghosts are not actors.
         L-23: the Node frame is placed by its centre, NODE_CY 336, because its two face midpoints
         are the only doors anything outside uses. Its rows move with it.
         M-12: every ball rides LEG_DUR 1500, not routeDur, since most legs sit on the 700 floor.
         The ghost row never lights, pulses, dims by step or carries a ball. No chip strip: every
         state the narration names is on the canvas. The store is a box, not a cylinder (a disk
         reads as the PV the card denies).
CONTENT  Sources: Ephemeral Volumes (v1.35), kubernetes-csi Ephemeral Local Volumes, Secrets Store
         CSI Driver concepts, pkg/volume/csi (csi_mounter.go, csi_plugin.go) for what docs omit.
         `Kubelet refuses the mount`: the Ephemeral check runs at mount time, not API validation.
         The fetch names the SecretProviderClass and its provider: the driver does not reach the
         store itself. The store is `outside the Kubernetes API`, not `outside the cluster`.
         `lives and dies with the Pod`, not `exactly as long`. No narration says lowercase `secret`.
```
