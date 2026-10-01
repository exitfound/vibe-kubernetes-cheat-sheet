## storage-volume-mode

### layout

```
WHAT     Two identical claims, one field apart, and what the Node puts between each disk and its
         container: under Filesystem the CSI node service adds two layers (mkfs, then a staging
         mount), under Block it adds none and the raw device reaches the container.
LAYOUT   Two horizontal ROWS, one per claim, each running left to right from its disk into the
         Node-1 frame and on to its Pod. Every lane from a disk STOPS on the frame's left face, and
         what happens next happens inside the Node: the Filesystem row goes on through the stations
         `Format` and `Mount`, the Block row goes on through NOTHING, one lane under the empty
         stretch where the stations stand one row up, captioned `no mkfs, no mount`. The missing
         layers are the subject, so the asymmetry between the rows IS the picture, and the rows are
         otherwise mirrored: same disk, same frame entry, same Pod size, same x for every end.
         The section is vertical stacks on 9 of its 10 cards, and `storage-access-modes`, the card
         beside this one, is Pods over a band over two disks. A stack cannot show a layer that is
         absent without drawing an empty tier, and a row can: the gap is horizontal distance the
         reader sees the ball cross.
         The disks and the frame's left end sit left of the panel wall, UNDER the panel (`L-03`).
         DISK_X 40 mirrors the frame right edge 1160 about 600, which centres the drawn extent.
         The four chips run in ONE ROW along the top of the frame, exactly as wide as it, 16 above
         it: they report on what happens inside the Node.
PANEL    `OVERLAY_IDS=storage-volume-mode node --test report/overlay.test.mjs` from `scheme/test/`.
         Deepest on the `publish-dir` step at 1100x800, 204.97. The highest thing left of x 397 is
         the first chip, top at 235, so 30 units of clearance, then the frame top at 285 and its
         label at 292..306, then the Filesystem disk at 316. The card takes no 900x650 row
         (`STO.L-04`).
SIZES    The Pods are the catalog 232 by 104 around a 192 by 44 app box 26 under the label
         (`NET.L-01`). The two stations are 160 by 80, not 232: from the frame's left face at 300 to
         the Pod they share 604 units with a 144 unit entry run and two 70 unit lane gaps, and 232
         stations leave the entry run under 20. Their widest string is `mkfs, only if blank` at
         114.6. Cylinders 150 by 96, label re-centred at `h/2 + 10` (`STO.L-02`). The caption under
         the Filesystem disk, `volumeMode: Filesystem`, inks 151.6 against the 150 disk, so the disk
         cannot narrow.
         The frame has a 27 header and a 27 foot so its left face midpoint, 439, sits exactly between
         the rows at 364 and 514: the two lanes ending on that face are a mirrored pair at +-75
         (`L-12`), and any other foot makes each an `OFFEDGE`.
         CHIP_W 203 is DERIVED, (860 - 3 x 16) / 4, so the row spans the frame. Worst pair
         `db-0 sees` 62.0 + `device /dev/xvda` 110.3 = 172.3, then `fsGroup, subPath` 110.3 +
         `no files` 55.1 = 165.4. The fourth chip's values are `no files` and `on web-0` because
         `web-0 only` at 68.9 runs the pair to 179.2, past the 178.8 a 203 chip holds inside its
         inset.
LANES    Six lanes, all horizontal, all ridden. Filesystem row: disk to the frame, then inside it the
         frame face to `Format`, `Format` to `Mount`, `Mount` to Pod web-0. Block row: disk to the
         frame, then the frame face to Pod db-0. No return lanes, because nothing travels back.
         The Block lanes are drawn from step 1, so the reader sees the bare route beside the station
         route before anything rides it (`A-04`).
MOTION   Every ball rides routeDur. The 110 unit disk-to-frame hops, the 144 entry run and the two
         70 station gaps sit on the 700ms floor, and the 604 unit Block lane inside the frame glides
         about 1340ms: the ball crossing the empty stretch under the stations is the moment the card
         is about, and at the floor pace it would read as a jump.
         Each disk hop lands on the frame with a ripple and the next hop leaves `after` it. The
         sender of every step is lit from entry (`M-18a`): the disk on `format` and
         `publish-device`, `Format` on `mount`, `Mount` on `publish-dir`. A Pod pulses on its ball's
         arrival (down-arrow order) and nothing inside it is lit (`STO.C-02`).
         On `publish-device` the caption `no mkfs, no mount` fades in on the arrival at the frame, the
         moment the Node takes the device and does nothing to it. It is a keyed `P.tag`, not a wire,
         because a wire takes no opacity, and every step pins it (`STO.S-01`): 0 up to
         `publish-dir`, 1 on `publish-device` and `trade`.
         A chip a ball earns does not run ahead of it (`P-03`): `mkfs ran on` turns over on the
         arrival at `Format`, `web-0 sees` and `fsGroup, subPath` on the arrival at Pod web-0,
         `db-0 sees` on the arrival at Pod db-0, each wound back by `rewind` and set by `F.set`.
         A seeked frame (`frames.mjs`) still shows the old value, because the turnover is an
         `onfinish` a paused animation never fires: `settled-dump.mjs` is the reading.
         `claims` and `trade` carry no motion. `claims` lights the two disks, `trade` lights the two
         stations, the two layers Block goes without.
WIRE LABELS
         The lanes carry static per-step captions, not riding tags. On a horizontal lane between
         blocks this tall a tag riding with its ball overlaps the sender at departure or the receiver
         at arrival whatever its dx, and `M-30a` forbids retiring it early. The corridor captions
         sit 14 over the lane between disk and frame, centred on 245 (`blank device` and
         `ext4 on disk` ink 204..286 in a 190..300 corridor), and the skip caption over the Block
         lane between the stations, centred on 639.
CONTENT  The Pod carries no volumeMode: the field lives on the claim and the volume. The Pods say how
         they consume the volume instead, `mountPath` under `volumeMounts` and `devicePath` under
         `volumeDevices`, and the mode is the caption under each disk: a static `P.tag`, drawn from
         the poster frame on, because it never changes and it is the one field the card is about.
         `Block skips both of those steps` names mkfs and the filesystem mount, not the CSI RPCs:
         kubelet still calls NodeStageVolume and NodePublishVolume for a block volume, which is why
         the stations are labelled by what they DO rather than by the RPC names. The kubelet map
         path (`GenerateMapVolumeFunc`) calls `SetUpDevice` and `MapPodDevice`, the block halves of
         stage and publish, and reads no fsGroup. The mount path is where fsGroup is passed.
         Claims read against Kubernetes 1.35, the release `k8sVersion` names:
         `Filesystem is the default mode used when volumeMode parameter is omitted` and `If the
         volume is backed by a block device and the device is empty, Kubernetes creates a
         filesystem on the device before mounting it for the first time` (persistent-volumes,
         Volume Mode) carry `claims`, `format` and the `mkfs, only if blank` sublabel. `presented
         into a Pod as a block device, without any filesystem on it` carries `publish-device`.
         `must match` is the binding matrix of Binding Block Volumes, and `fixed once the claim
         exists` is `spec is immutable after creation except resources.requests and
         volumeAttributesClassName` (PVC update validation). subPath lives on `VolumeMount` and
         `VolumeDevice` has only `name` and `devicePath`, which is why subPath has nothing to act on.
         `of the fsType set on the volume, often ext4` is the wording. `the fsType the StorageClass
         names` is rejected: the field is `spec.csi.fsType` on the volume (`Ex. "ext4", "xfs"`), and
         a StorageClass need not name one.
         `have something to act on` is the wording for files, permissions, subPath and fsGroup on
         the Filesystem Pod, in the narration and the aria-label. `all work here` is rejected: the
         API says `Some volume types allow the Kubelet to change the ownership`, and fsGroup does
         nothing unless it is set.
         The desc ends `must match on the claim and its volume`. `must match on both` is rejected:
         its first sentence is about two claims, so `both` reads as the two claims.
         The staging mount `once for the whole Node` is stated unqualified, as
         `storage-csi-attach-mount` states it, the card that owns staging.
SCOPE    The staging and bind mounts as CSI calls belong to `storage-csi-attach-mount`, the mount
         namespaces they land in to `storage-mount-path-chain`, the fsGroup walk to
         `storage-fsgroup-ownership`, subPath to `storage-subpath`, and who may hold the disk to
         `storage-access-modes`.
WHY NOT  A vertical pair of stacks with the Pods on top: that is `storage-access-modes` at the same
         size, and a stack can show an absent layer only as an empty tier, which reads as something
         not yet drawn rather than something skipped.
         Riding tags on the lanes: see WIRE LABELS, every placement meets an end block.
DO NOT   Put `volumeMode` on a Pod. The Pod spec has no such field.
         Give the Block row an empty station outline to show the gap: the lane would cross a block it
         does not terminate on (`L-10`), and the empty distance already says it.
OPEN     `CENTRE` reads the chip row 300..1160 as a strip centred on 730. It runs along the frame it
         reports on, and the drawn extent 40..1160 centres on 600. Centring the row puts its left end
         over the disk corridor and under the panel at 1100x800, and under the frame there are 47
         units of canvas. Carried in `test/fixtures/carried.mjs` with the same argument.
```
