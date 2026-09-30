## storage-csidriver

### layout

```
WHAT     One cluster scoped CSIDriver object per driver, named after it, decides how the attach and
         detach controller and Kubelet treat every volume of that driver. Two volumes of ONE Pod,
         from two drivers, are treated differently for that reason alone: the disk volume gets a
         VolumeAttachment and a group change to the fsGroup, the NFS volume gets neither but its
         NodePublishVolume call carries the Pod name, namespace and UID. The last step plays the
         NFS driver with no object at all.
LAYOUT   TWO ZONES COMPARED, mirrored about one spine on CX 600: the disk driver on the left
         (L_CX 240), the NFS driver on the right (R_CX 960), and the two consumers that read both
         objects standing ON the spine between them, the controller on row 1 and Kubelet on row 2.
         Every hop leaves a side face of a spine actor, so the geometry of the two halves is
         identical and only their state differs. That is the sentence: same Pod, same Node, same
         consumers, different objects.
         The head is the two objects side by side right of the panel wall, each a name box over its
         three fields as a column of chips. The fields are the chips, so there is no chip strip at
         the foot, and a field lights on the step whose consumer reads it.
         Row 1 is the control plane, outside Node-1. Node-1 holds row 2 and ONE Pod spanning both
         halves, whose volume boxes sit straight under the node plugin that mounts each, with the
         container between them. The attach decided off the Node and the mount made on it are the
         two moments the object is read, and the frame draws that split.
         The section never uses a spine of two stacked actors with mirrored outputs to two drivers:
         storage-multi-attach-error mirrors about one controller over two Nodes of one volume.
         `short` (4 steps) is the lever no sibling here carries, taken because the object is read at
         exactly two moments, attach and mount, plus what its absence costs. A step per field is
         the failure mode the spine refuses.
PANEL    `OVERLAY_IDS=storage-csidriver node --test report/overlay.test.mjs` from `scheme/test/`
         prints the reading. At 1100x800 the bottom is 204.97 on every step, the poster included,
         against the final narration (297, 293 and 285 characters). What stands left of the wall
         x 420 is row 1 from y 252 (VolumeAttachment va-1 at x 124), the Node-1 frame from 356 and
         its label, so the clearance is 47 at the deepest standard reading. ROW1_Y 252 is the
         constant that clearance pins: a narration edit that deepens the panel past about 240 puts
         the left VolumeAttachment under it, so re-run the command after any prose change (L-08).
         The head starts at x 420 and needs no clearance in y.
         The 900x650 hand row is NOT held: there the panel reaches 398.3 by 374.7 and covers the
         left VolumeAttachment and the Node-1 label. Holding it would move row 1 below 375 and leave
         no room for row 2 and the Pod above the 640 floor, so the card is held to the three
         standard viewports (L-06).
SIZES    Every actor is the catalog 232 by 80 (NET.L-01), the inner boxes the catalog 192 by 44 at
         26 under the Pod top. Two departures, each forced:
         The object boxes and their chips are 172 wide: the pair plus a 16 gap has to start at the
         panel wall x 420 and centre on 600, so 2 * 172 + 16 = 360 = 2 * (600 - 420). The worst
         field is `attachRequired` / `false`, and `podInfoOnMount` / `false` and every `unset` are
         the same 19 characters: measured at 1100x800, 85.9 plus 30.7 of ink inside 12 of inset
         each side, 140.6 of the 172, with 31.4 left between name and value.
         The Pod is 952 by 104: it spans both halves (2 * SIDE_D + 232), so each volume box lands
         under its own node plugin and the mount drop is a straight vertical.
LANES    Six lanes, each ridden on some step, each fed by one points array to both wire and ball.
         The four row hops are 128 long between faces. The two mount drops run 36 from a node plugin
         floor to the Pod roof straight above the volume box they mount: the arrowhead stops on the
         shell line and never enters the Pod.
         lVaN, the controller to the right VolumeAttachment, is ridden only on `missing`. It is
         drawn on every step so the controller is seen to have two outputs and use one (A-04).
MOTION   Every ball rides routeDur, which puts the 128 unit hops and the 36 unit drops on the
         700ms floor, the speed of storage-emptydir, so the card is off the explicit-dur registry
         in render/motion.test.mjs. Every tag shows from departure and lives exactly as long as its
         ball.
         attach: the controller and the two attachRequired fields light at entry, one ball leaves
         left, and va-1 is born and lit as it lands. The right half gets no ball: no attach is the
         point.
         mount: Kubelet and the four fields it reads light at entry, both NodePublish balls leave
         together, each plugin lights and drops its mount. The Pod turns Running and blinks as a
         whole when the last mount lands, and no inner box lights (M-03).
         missing: the NFS object fades to a ghost at entry and its three fields turn over to unset,
         cued as changed. The controller sends the one ball of the step right, and va-2 is born and
         lit as written. Nothing below it on the NFS half lights: no NodePublish, no mount, and the
         Pod is back at ContainerCreating.
WIRE LABELS
         The row tags ride 50 above their lane (242 on row 1, 378 on row 2), clear of the block roofs
         40 above it. The counterfactual caption sits 30 above row 1, at 222, so the create tag on
         `missing` passes under it rather than through it: at 1100x800 the caption ink ends at y
         225.7 and the tag starts at 232.2, 6.5 clear for the whole flight, and the caption starts
         at x 815.8, right of the NFS field column (780), so it clears the chips in x.
CONTENT  Read against k8sVersion 1.35: the raw API reference (csi-driver-v1), the kubernetes-csi
         CSIDriver Object, Skip Attach, Pod Info on Mount and fsGroup Support pages, and
         pkg/volume/csi (csi_plugin.go, csi_attacher.go, csi_mounter.go, csi_util.go) plus the
         kubelet reconciler on release-1.35. The last two pages are in `sources` for that reason.
         The object: cluster scoped (`CSIDriver objects are non-namespaced`), storage.k8s.io/v1,
         and metadata.name `MUST be the same name returned by the CSI GetPluginName() call`.
         attachRequired is immutable. fsGroupPolicy and podInfoOnMount were immutable before 1.29
         and are mutable now. No mutability claim is on the card.
         attachRequired: `If a CSIDriver object does not exist for a given CSI Driver, the default
         is true`, and an unset field is true as well. BOTH consumers read it: skipAttach() is
         called by CanAttach(), which the controller AND Kubelet reach through
         FindAttachablePluginBySpec, so Kubelet holds the mount until the controller lists the
         volume attached in the Node status. That is why `missing` says `The controller and
         Kubelet treat it as attachRequired true`, and `The controller treats it` alone is
         rejected: it leaves the waiting unowned. `mount` lights only the two fields Kubelet
         reads FOR the mount, and says `reads the same two objects`, which stays true.
         No external-attacher: the controller Attach times out (`timed out waiting for
         external-attacher of <driver> CSI driver to attach volume`) and retries, and the Pod stays
         ContainerCreating with FailedMount events. `shared stays unmounted` ships, and `shared is
         never mounted` is rejected as reading like a terminal state while the attach is retried.
         `unlike va-1` names what the card does not draw: the disk driver attacher sets va-1
         attached, and storage-volumeattachment owns that. Without it the `attached: false` of va-2
         beside the spec text of va-1 leaves the disk attach unexplained.
         podInfoOnMount: default false. true adds pod.name, pod.namespace, pod.uid,
         serviceAccount.name and ephemeral to NodePublishVolume volume_context (csi_util.go), and
         the API says `This list might grow`. So the card says `Pod info such as the Pod name,
         namespace and UID`, and the bare list is rejected as reading like the whole set.
         fsGroupPolicy: File changes ownership `regardless of fstype or access mode`, None mounts
         `with no modifications`, the default is ReadWriteOnceWithFSType (fsType set and RWO).
         Kubelet does the change under File, recursively, after NodePublishVolume, when the driver
         lacks VOLUME_MOUNT_GROUP and the mount is not read-only. A driver with that capability
         gets volume_mount_group and fsGroupPolicy is ignored. The example disk driver is taken to
         lack it, so `Kubelet changes the group of data to 2000` and `mounted, group 2000` stand.
         A missing object also means Persistent volumes only (supportsVolumeLifecycleMode). The card
         draws two persistent volumes and says nothing about the mode, which is correct.
         `each driver here has` in the desc, the aria-label and `attach` is deliberate. `each driver
         has` is rejected because the desc and `missing` both say a driver may have no object.
         `Suppose instead ... ships` keeps the counterfactual in one tense. `If instead ... shipped
         ..., none of its fields are set` is rejected for the mixed tense.
         va-1 and va-2 are illustrative. The attacher names a real VolumeAttachment `csi-<sha256>`.
         ContainerCreating is the kubectl STATUS column (a container waiting reason), not the
         phase, and it is used that way beside `Running` in the Pod sublabel.
         A chip is a literal field value or `unset`, never an effective default: on `missing` all
         three NFS fields read `unset`, and the narration carries the behaviour, `treat it as
         attachRequired true`. The effective fsGroupPolicy default is not named on the canvas.
         Every number the narration speaks is drawn: 2000 is on the Pod sublabel on every step and
         on the data volume once mounted.
         The driver names are the two example names only. Nothing here states what any real driver
         ships.
SCOPE    The two driver halves and the registrar belong to storage-csi-architecture. The four gRPC
         calls and their order to storage-csi-attach-mount, VolumeAttachment lifecycle to
         storage-volumeattachment, the fsGroup walk to storage-fsgroup-ownership, inline ephemeral
         volumes (volumeLifecycleModes) to storage-csi-ephemeral-volume, CSINode counts to
         storage-volume-attach-limits, CSIStorageCapacity to storage-csi-capacity-tracking. This
         card names each consequence as a switch the object flips and draws none of them.
DO NOT   Put an effective default in a chip on `missing` (`true`, `ReadWriteOnceWithFSType`): the
         object does not exist, so no field holds a value, and the behaviour is the narration's.
         Light a block on the NFS half below the head on `missing` beyond va-2 being written: the
         step is about a mount that never happens.
NOT A DEFECT
         va-2 lights as it is written on `missing`. That light is the write landing, the same cue
         va-1 takes on `attach`, and its sublabel reads `attached: false` from the same moment.
         storage-volumeattachment lights its object on `write` with status.attached false by the
         same reading. Nothing that would mean success on the right lights: no node plugin, no
         volume, no Pod.
         The band between the field chips (198) and row 1 (252) stands empty on three steps. It is
         the corridor of the row 1 tags (242) and the slot of the `missing` caption, and ROW1_Y is
         pinned by the panel clearance above, so row 1 cannot rise into it.
         The right VolumeAttachment rests at the notready shade, not pending, from `idle` on: the
         story never writes it, and only the counterfactual reveals it.
         On `missing` the Pod goes back to ContainerCreating while the left half keeps the
         end of `mount` (va-1, data mounted with group 2000): the counterfactual replays the
         NFS half only, and a Pod waits for every volume, so the shared Pod sublabel changes with it.
```
