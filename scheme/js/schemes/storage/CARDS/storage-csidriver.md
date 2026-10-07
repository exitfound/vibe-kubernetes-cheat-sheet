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
         va-2 lights as it is written on `missing`, the same write cue va-1 takes on `attach`.
         The right VolumeAttachment rests at the notready shade: only the counterfactual reveals it.
CONTENT  Sources: CSIDriver API reference (storage.k8s.io/v1), kubernetes-csi CSIDriver Object,
         Skip Attach, Pod Info on Mount, fsGroup Support (v1.35), pkg/volume/csi on release-1.35.
         Both consumers read attachRequired (CanAttach), so `The controller and Kubelet treat it`.
         `Pod info such as the Pod name, namespace and UID`: the API says the list might grow.
         `shared stays unmounted`, not `never mounted`: the attach is retried. `each driver here`.
         The disk driver is taken to lack VOLUME_MOUNT_GROUP, so Kubelet changes the group to 2000.
```
