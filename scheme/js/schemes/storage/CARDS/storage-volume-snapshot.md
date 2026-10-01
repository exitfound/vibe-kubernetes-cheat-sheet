## storage-volume-snapshot

### layout

```
WHAT     A snapshot freezes one moment of a live volume: the volume keeps changing after it, the
         snapshot does not, a restore brings that moment back as a new volume, and all three sit in
         one storage pool, which is why a snapshot on such a backend is not a backup.
LAYOUT   Instrument panel: the volume drawn as its BLOCKS, three rows of six cells in one pool frame,
         each row led by a header naming whose data it is. Live volume on top, snapshot under it,
         restore at the bottom. The subject wanted this rather than the disks the section leans on
         (4 of 5 siblings draw cylinders): a disk cannot show WHICH data a snapshot holds, and the
         difference from storage-pvc-clone, a whole second disk, is only visible at block level.
         The live row is on top because the Pod writes straight DOWN into block C, and the snapshot
         row under it makes the pointers and the copy on write drop read downward. The Pod sits on
         the C column, the two API objects stand as one column whose right edge is flush with the
         pool frame right edge (1090).
         Rows that do not exist yet are absent, not ghosted, so the pool frame shows free room on
         steps 1 to 2 and the rows land in it: the room IS the pool the snapshot and restore share.
         The row unit (header 144, gap 24, six cells) centres on CX, so the content below the panel
         centres on 600.
PANEL    `OVERLAY_IDS=storage-volume-snapshot node --test report/overlay.test.mjs` from
         `scheme/test/`. Deepest on the `request` step at 1100x800, the step with the longest
         narration. Nothing stands under the panel: the pool frame starts at FRAME_Y 268, 38 below
         that reading, and its label at (122, 286) clears it. A longer narration eats that margin.
SIZES    The Pod is the catalog 232 by 104 around a 192 by 44 app box, and both API objects are the
         catalog 232 by 80 (NET.L-01). The row headers (144 by 52) and the block cells (104 by 52)
         are not actors: they are sized by the row, header plus six cells plus gaps spanning 932 in a
         980 frame. The widest header string, `Restored volume`, inks 99.1.
         CHIP_W 232: worst case `stored` + `lost with pool` leaves a 70 unit gap.
LANES    Five lanes, every one from a face midpoint, zero crossings. Both lanes arriving from above
         stop ON the pool frame top face rather than on a block inside it: the frame is what they
         address, the volume in the pool. `wWrite` drops straight from the Pod floor to the frame
         face level with block C (L-11), and block C lights on that arrival and takes its new
         version. `wCall` leaves the content LEFT face, runs left 108 and drops 72 onto the frame
         face level with block D: the object column is flush with the frame right edge, so its
         centre (974) is level with no block, and a straight drop there is an OFFEDGE endpoint. D is
         the nearest block column clear of the Pod (502..734).
         The six pointers are `P.relation` links, dashed 3 3, undirected: a snapshot block that only
         points at a live block carries nothing. Block C loses its pointer on `diverge`, and `wKeep`
         runs on the same segment in its place.
MOTION   The Pod is the only thing that blinks, first, before its write leaves (M-15). A pointer
         block rests at OPACITY.pending inside the snapshot row, and turns full only when the
         snapshot holds its own copy of it, which is the one visual state change the card is about.
         `diverge` orders the copy on write the way the narration states it: the write reaches the
         pool face over C and lights C, the old C v2 drops into the snapshot row, and only on that
         arrival does live C read v3 and the shared count fall to 5 of 6. `loss` has no ball: the
         three rows fade to OPACITY.terminated from BEAT.lead while the two API objects keep a static
         highlight (M-27), and `stored` turns to `lost with pool` on that same beat, not at entry
         (P-03). A lane appearing mid-story fades in with the blocks on its ends over REVEAL_MS
         (`wBind` on `request`, `wSeed` on `restore`), so no arrowhead stands over empty canvas
         while its target is still at 0 (STO.S-02).
WIRE LABELS
         Only the three long hops carry a tag. `write C v2` and `write C v3` ride 58 right of the
         Pod lane and emerge once clear of the Pod. `bind 1:1` rides centred in the 124 gap between
         the Pod and the object column, because its hop is 40 long, shorter than a tag plus its
         travel, and the short string clears both blocks, where `bind one to one` would come within 12 of
         each. `CreateSnapshot` rides 60 ahead of and 14 above its ball, off the content on the side
         leg and off the lane on the drop. `wKeep` and `wSeed` cross a 36 unit gap between cell
         rows and carry no tag: any tag there prints into a cell at one end of the flight.
         `poolCap` is the counterfactual caption (T-35), in the frame label band above all rows.
CONTENT  Upstream frames VolumeSnapshot and VolumeSnapshotContent after PersistentVolumeClaim and
         PersistentVolume, and calls VolumeSnapshotContent a cluster resource. Copy on write, the
         shared block count, and where the snapshot is stored are BACKEND facts, not Kubernetes
         ones, so the card names a backend: Ceph RBD, whose snapshots live in the same pool as the
         image. The narration says `on a copy-on-write backend like this one` and `on a backend like
         this`, never snapshots in general: a driver such as ebs.csi.aws.com stores its snapshots
         elsewhere (AWS: `Snapshots are stored in Amazon S3`), and there `not a backup` would be
         false. The same rule holds the desc: its opening asks why a snapshot is `not always a
         backup`, and `still not a backup` is rejected because it states the backend fact of the
         last sentence as true of every VolumeSnapshot.
         Claims read against Kubernetes 1.35, the external-snapshotter and ceph-csi sources:
         `All three kinds are CRDs` ships, `Both kinds` is rejected because the step also names
         VolumeSnapshotClass and upstream lists all three: `VolumeSnapshot, VolumeSnapshotContent,
         and VolumeSnapshotClass are CRDs, not part of the core API`. `installed with the snapshot
         controller` rests on `Kubernetes distributors should bundle and deploy the controller and
         CRDs` (kubernetes-csi snapshot-controller page).
         `the content triggers CreateSnapshot, which the CSI driver runs against the pool` ships,
         `a CreateSnapshot call into the pool` is rejected: CreateSnapshot is a CSI RPC the
         csi-snapshotter sidecar sends to the DRIVER (`calling the CSI RPCs CreateSnapshot`), and
         the driver, not drawn, acts on the pool. `triggers` is the snapshot-controller page own
         verb for the content handing off to the sidecar.
         Ceph RBD, verified in ceph-csi source: the snapshot inherits the source volume pool
         (`rbdSnap.Pool = rbdVol.Pool` in genSnapFromOptions), and ceph-csi implements it as a
         layered clone of a temporary snapshot, which the card abstracts to a frozen map of the
         blocks. Copy on write at the pool: RADOS clones an object `before the write is applied`
         when a newer snapshot exists, which is the order `diverge` narrates. `can be ready in
         seconds` keeps `can`: ceph-csi reports ReadyToUse true on the ordinary path and false
         while a clone chain past its depth limit is flattened.
         The desc says `a restore gets a new, crash-consistent volume holding the older state`, and
         `a restore brings the older state back` is rejected because it reads as an in-place
         rollback of data-1, which dataSource never does: upstream `create a new PVC from a volume
         snapshot by using the dataSource field`.
         `It is only crash consistent` ships on `restore` and `crash-consistent` in the desc, because
         the Pod is a database and a restored block image is not a restored database: Ceph `snapshots
         are merely crash-consistent unless they are coordinated within the mounting (attaching)
         operating system`, and the group snapshot KEP gives `No application consistency guarantees
         beyond any guarantees provided by the storage system (e.g. crash consistency)`. A bare `the
         10:00 state` is rejected as the whole claim: it is true of the blocks and false of db-0.
         `restore-1 in the same StorageClass` ships, and `On a backend like Ceph RBD the volume,
         snapshot and restore share one pool` is rejected in the desc: ceph-csi takes the pool of a
         new volume from its own class (`rbdVol.Pool, ok = volOptions["pool"]` in
         genVolFromVolumeOptions, the path createVolumeFromSnapshot also takes), so a restore into
         another class can land in another pool. The desc now says `Here`, the drawn setup.
         `readyToUse: true` stays on the `loss` chip on purpose: the csi-snapshotter sidecar skips
         its status check once a content is ready (`Skip checkandUpdateContentStatus() if
         ReadyToUse is already true`), so the API goes on reporting a snapshot whose data is gone,
         which is what the narration says. `false` on `request` is what the snapshot controller
         writes when it binds a content that has no status yet.
SCOPE    The controller and sidecar plumbing (snapshot-controller creates and binds the content, the
         csi-snapshotter sidecar watches only VolumeSnapshotContent and calls CreateSnapshot) belongs
         to storage-csi-architecture. A full server-side copy with no snapshot object in between is
         storage-pvc-clone, and this card is the block-sharing contrast to it.
DO NOT   Draw the restore row as pointers into the snapshot row: whether a restored volume shares
         blocks is a backend detail the card makes no claim about, and a second set of links would
         say it does.
         Add a tag to `wKeep` or `wSeed` (see WIRE LABELS).
NOT A DEFECT
         `report/arrival.test.mjs` R2-ENTRY prints three chip rows (steps 4 and 5), CARRIED in
         `test/fixtures/carried.mjs`: each step winds the chips its ball earns back in `rewind` and
         turns them over with a cued F.set on the arrival, and R2-ENTRY compares two frames frozen
         at t=0. R2-STEP, the settled reading, reports none.
         R4 prints live block `C` on step 4, CARRIED there too: the write ball stops on the frame face
         over C, C is lit by that hop `lights`, and the keep ball leaves after it. R4 counts an
         earlier arrival only on the block the ball touches, and this ball touches the frame.
```
