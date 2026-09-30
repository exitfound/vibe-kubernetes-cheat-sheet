## storage-csi-ephemeral-volume

### layout

```
WHAT     A CSI volume written inline in the Pod spec goes straight to the node plugin of its
         driver: Kubelet checks the CSIDriver lists Ephemeral, calls NodePublishVolume, the driver
         creates the volume in that call and deletes it on NodeUnpublishVolume. The subject is an
         ABSENCE, so the card draws the claim path it never takes.
LAYOUT   A bypass in two regions, both spanning 420..1160 right of the panel. On top, the claim
         path as a GHOST ROW: StorageClass, PVC, PV, VolumeAttachment at OPACITY.notready, sublabel
         `not created` on every step (`not used` on the StorageClass), three markerless relations
         between them, one standing caption. Nothing lights, pulses or rides there on any step. Below it the Node-1 frame: Pod
         and inline volume on top, Kubelet and the node plugin on one lane row.
         THE FRAME IS PLACED BY ITS CENTRE, not by its rows, because its two face MIDPOINTS are the
         only doors anything outside uses. `NODE_Y` 176 is what that costs: it hangs the frame 56
         under the ghost row and leaves the column beside the left door 14 clear of the panel. The
         left door is at 336, and the two API objects that ARE read stand mirrored 52 each side of
         it (mids 284 and 388), their lanes turning onto it at one funnel x, 356, midway between
         the column and the frame. The external store is centred under the bottom door (674..906)
         rather than under the plugin. The Node frame ends at 496, 36 below its lane row, because
         the store round trip no longer needs a duct inside the frame. No
         sibling in the section carries a relation row or goes without chips: those are the two
         levers.
PANEL    Measured bottom lo..hi per viewport: 125.11..142.56 at 1600x1000, 150.17..171.42 at
         1280x860, 180.12..229.82 at 1100x800, the deepest reading on the `publish` step:
         `OVERLAY_IDS=storage-csi-ephemeral-volume node --test report/overlay.test.mjs` from
         `scheme/test/`.
         Everything above y 244 starts at x>=420, and the left column starts at y 244, 14.2 below
         the deepest reading. That margin is what the centring spends, and it is the tightest thing
         on the card: a longer narration on the `publish` step eats it directly.
SIZES    Every block is 232 wide, 80 tall, the Pod 104 with a 192 by 44 app box, the inline volume
         included (180..260, centred on the Pod mid). The ghosts are 80 tall too, 40..120, 56 above
         the frame. The ghost width is SOLVED, 4w + 3g = 740 with g 36, so w 158: `VolumeAttachment` measures 112.9 and leaves
         22 either side at 1100x800. The widest label, `CSIDriver secrets-store.csi.k8s.io`,
         measures 191.0 in 232 and the widest sublabel, `volumeLifecycleModes: Ephemeral`, 190.2,
         both about 20.5 either side.
LANES    Seven one-way lanes, each array feeding its wire and its ball. The two API lanes each run
         out of their block face, turn up or down at the funnel x 356, converge at the left door of
         Node-1 and end at its centre, 420,336. Each measures 180 units. Kubelet receives the
         arrival as an outline only: no lane crosses the Node boundary and continues to its roof.
         The store round trip enters the bottom face STRAIGHT: a mirrored pair (L-12), the get
         leaving at 778,496 and the answer arriving at 802,496, each one vertical and landing on
         the store roof at the same x. Both measure 48 units. The plugin receives no route from
         the Node edge. Kubelet to plugin is 212 on the row mid 420, plugin
         to volume climbs 76, volume to Pod runs 212 on the Pod mid 264. The relations in the ghost
         row carry no arrowhead and no ball ever runs near the row.
MOTION   Every ball carries a call or a file name and rides LEG_DUR 1500, not routeDur, because
         most legs sit on the 700ms floor and the tag retires unread. Registered in the motion
         PACING list at 9, where the comment states the 48 to 212 leg range. Every tag lives
         exactly as long as its ball (M-30a). The store pair is the slowest ball in the catalog,
         48 units in 1500 (0.032 per ms, `pace.mjs`), and that is the price of its tag: it has to
         emerge 650 in to clear the face it leaves, so at 1000 it would stand for 350.
         The three API tags (spec, gate, delete) ride just inside the Node corridor, 46 right and
         6 up from their balls. The publish tag rides 50 up with no dx at all, since `NodeUnpublishVolume` inks
         116.6 and the gap it crosses is 212, so no sideways offset can clear either roof and only height can. The
         other four TRAIL their ball on the side away from the block it heads for and emerge once
         clear of the face they leave: the store pair in the 48 gap under the frame (dx -50, 12
         above; dx 60, 14 below; both emerging 650 in), the write 42 right and 22 below (700 in),
         the read 45 behind and 14 above (650 in).
         Probed every 50ms at all three viewports, no tag box meets a block: the tightest is 3.5 at
         1280x860, the three API tags against the Pod floor, then the answer tag 4.1 against the
         store and the publish tag 6.9 against the plugin. One tag GRAZES a dim lane: the gate tag
         crosses the funnel segment the two API lanes share while its ball climbs to the door.
         Blocks are the hard floor here and lanes are not.
         Every ball leaves a lit sender: API server on declare and delete, CSIDriver on gate,
         Kubelet on publish (and on delete once the delete lands), the plugin on fetch and mount.
         The store lights as the request lands and the answer leaves it 100 later. On mount the
         volume reveals from pending and the Pod turns Running both on the write arrival, through a
         rewind plus F.set, and the Pod blinks on the read arrival, so the start precedes the read
         the way the narration orders them. On delete the Pod blinks, fades on afterPulse
         with its sublabel turning `Terminating`, and the unpublish leaves only once the Pod is
         faded, the volume ghosting and the Pod sublabel turning `deleted` on its arrival.
         Spans against durations, measured off `getAnimations()` and so including the 560ms arrival
         ring of the last ball: 2860/3600, 2860/3800, 2860/3600, 4460/5000, 4800/5600, 6100/6800.
CONTENT  Read against k8sVersion 1.35: the kubernetes.io Ephemeral Volumes page, the kubernetes-csi
         Ephemeral Local Volumes page, pkg/volume/csi in kubernetes/kubernetes where both are
         silent, and the Secrets Store CSI Driver concepts page for the example. Stable since
         v1.25 stays out of the desc: k8sVersion carries the release and the band is full.
         - `Kubelet refuses the mount` ships. SetUpAt in csi_mounter.go runs
           supportsVolumeLifecycleMode before NodePublishVolume and returns a transient failure
           when the CSIDriver is missing or does not list Ephemeral, so the refusal is Kubelet at
           mount time, not API validation.
         - `travel in the call as written` ships: the csi docs say the attributes are `passed in
           verbatim` into volume_context. It stays silent on what Kubelet ADDS: pod info
           (csi.storage.k8s.io/ephemeral among it) only when the CSIDriver sets podInfoOnMount,
           per getPodInfoAttrs, although the csi docs state that key as always present.
         - `a hash Kubelet makes of the Pod UID and the volume name` ships, from makeVolumeHandle
           (`csi-<sha256(podUID,volSourceSpecName)>`). `one Kubernetes generates, not the name of
           any PV` is rejected: true but vaguer than the source, and a PV hands a volumeHandle,
           not its name.
         - `no ControllerPublishVolume and no NodeStageVolume` ships as an absolute: CanAttach and
           CanDeviceMount return false for Ephemeral mode before attachRequired or any node
           capability is read, so no VolumeAttachment is made and no stage runs whatever the
           CSIDriver or the driver advertises.
         - The fetch names the SecretProviderClass and its provider plugin, because the driver
           does not reach the store itself: the concepts page says it `communicates with the
           provider using gRPC to retrieve the secret content from the external Secrets Store
           specified in the SecretProviderClass`. `fetches db-password from the external store its
           attributes point to` is rejected. The provider is narrated with no block: the plugin
           to store pair stands for the driver and its provider together.
         - The real driver name ships in the CSIDriver label and the plugin sublabel,
           `secrets-store.csi.k8s.io`, per the chart CSIDriver manifest. `CSIDriver secrets-store`
           is rejected: a name no object has.
         - The store sublabel is `outside the Kubernetes API`. `outside the cluster` is rejected:
           a provider such as Vault may run in the cluster.
         - Mount: `Only then does Kubelet start the container, so the Pod turns Running` ships.
           The pod-lifecycle page puts volume mounting before `Image pulling and container
           creation`, and `the app reads it ..., and the Pod starts Running` is rejected for
           putting the read before the start. The picture keeps the same order: Running turns
           over on the write arrival, before the read ball leaves the volume.
         - `no PVC, PV or VolumeAttachment is ever created, and no StorageClass is read` ships,
           and the StorageClass ghost reads `not used`. `no StorageClass ... is ever created` is
           rejected: a StorageClass is an admin object no claim creates, so the claim path would
           not create one either. The caption says the path is `never taken`, not `never created`.
         - Verified against release-1.35 source: `supportsVolumeLifecycleMode` in csi_mounter.go
           (`no CSIDriver object` fails an Ephemeral volume), `makeVolumeHandle`, and CanAttach and
           CanDeviceMount in csi_plugin.go. The Secrets Store chart CSIDriver lists Ephemeral and
           sets podInfoOnMount true.
         - Delete: containers stop, then NodeUnpublishVolume, and the Pod object goes last.
           Kubelet keeps the volumes until ShouldPodRuntimeBeRemoved (every container exited),
           and SyncTerminatedPod waits for the unmount before the status manager may delete the
           Pod, hence `Terminating` before the unpublish and `deleted` on it. The driver MAY
           delete the volume after the unpublish returns (csi docs), so the card says it deletes
           it and never says it is gone before the call returns.
         - `lives and dies with the Pod` ships, the Ephemeral Volumes page wording (`created and
           deleted along with the Pod`). `exactly as long as the Pod` is rejected: the volume is
           made after scheduling and removed before the Pod object is.
         - The desc says `Only a driver whose CSIDriver lists the Ephemeral mode may serve it`
           and, separately, that an admin can drop the mode because the attributes come from the
           Pod author. `may be used this way, since volumeAttributes come straight from the Pod
           author` is rejected: the kubernetes-csi page gives the mode check as a safeguard
           against `using a driver the wrong way`, and the Pod author reason as why an admin
           restricts it.
NAMING   The store is a box labelled `External store`, and no narration says `secret` in lower
         case: the dictionary check reads it as the Secret kind, and this card has no Secret.
SCOPE    The four-call chain and NodeStageVolume belong to storage-csi-attach-mount, the two driver
         halves to storage-csi-architecture, a PVC-backed Pod-lifetime volume to
         storage-generic-ephemeral-volume, ConfigMap and Secret files to
         storage-configmap-secret-mount, projected sources to storage-projected-volume. This card
         names the skipped calls and never draws them.
NOTE     The poster note lives in the comment above this card entry in posters.js, not in this record.
WHY NOT  A cylinder for the external store: a disk on this card reads as the PV it denies. A chip
         strip: `PVC none` beside a ghost PVC says the state twice, and every state the narration
         names is on the canvas (the volume appearing, the Pod Running, both ghosting).
DO NOT   Do not light, pulse or dim the ghost row by step, and do not run a ball near it. Its
         opacity is set once on the part and no step names it. Do not dim a lane as a state:
         every lane is pinned at 1 on every step.
```
