## storage-csidriver

### layout

```
WHAT     One CSIDriver object per driver decides how the attach and detach controller and Kubelet
         treat that driver's volumes: two volumes of one Pod get a VolumeAttachment and an fsGroup
         change, or neither plus Pod info on NodePublishVolume, and the last step has no object.
DEVIATES NET.L-01: the two CSIDriver objects and their field chips are 172 wide, so the pair plus a
         16 gap starts at the panel wall x 420 and centres on 600 (2 * 172 + 16 = 360).
         NET.L-01: the Pod is 952 by 104 and spans both halves, so each volume box lands straight
         under the node plugin that mounts it.
         STO.L-04: at 900x650 the panel covers the left VolumeAttachment and the Node-1 label.
         Clearing it moves row 1 below 375 and leaves no room for row 2 and the Pod above 640.
         STO.L-03: no chip strip. The chips are the fields of the two objects, in two columns.
         A chip is a literal field value or `unset`, never an effective default: on `missing` all
         three NFS fields read `unset` and the narration carries the behaviour.
         csi-c41d lights as it is written on `missing`, the same write cue csi-5e8b takes on `attach`.
         The right VolumeAttachment rests at the notready shade: only the counterfactual reveals it.
CONTENT  Sources (v1.36): CSIDriver API reference, kubernetes-csi CSIDriver Object, Skip Attach, Pod
         Info, fsGroup Support, external-attacher v4.12.0 main.go, code v1.36.5 pkg/volume/csi.
         Both read attachRequired (CanAttach). `Pod info such as`: list may grow. `stays unmounted`.
         `Neither driver applies fsGroup itself`: with VOLUME_MOUNT_GROUP fsGroupPolicy is ignored.
         No external-attacher is the premise (one would mark csi-c41d attached). VA name: csi-<sha256>.
         preventPodSchedulingIfMissing (alpha, VolumeLimitScaling off) not drawn: the driver is there.
```
