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
LANES    Five lanes, every one from a face midpoint. Both lanes arriving from above
         stop ON the pool frame top face rather than on a block inside it: the frame is what they
         address, the volume in the pool. `wWrite` drops straight from the Pod floor to the frame
         face level with block C (L-11), and block C lights on that arrival and takes its new
         version. `wCall` leaves the content LEFT face, runs left 258 and drops 72 onto the CENTRE
         of the frame top face (CX 600): the call is addressed to the whole pool, not to a block.
         Its side leg crosses the `wWrite` line at x 618, but the two are never drawn on the same
         step (`wCall` only on `cut`, `wWrite` only on `live` and `diverge`), so no frame shows the
         crossing. The longer lane moves the `cut` span from 2060 to 2093 of its 3200.
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
         (P-03). Every chip a ball earns turns over on the arrival of that ball, through a cued
         F.set: readyToUse `false` on `bind`, readyToUse `true`, `6 of 6` and `stored` `same pool`
         on `call`, `5 of 6` on `keep`. `stored` reads `none` until `cut`, like its two neighbours,
         because before the cut there is no snapshot stored anywhere. A lane appearing mid-story
         fades in with the blocks on its ends over REVEAL_MS (`wBind` on `request`, `wSeed` on
         `restore`), so no arrowhead stands over empty canvas while its target is still at 0
         (STO.S-02).
WIRE LABELS
         Only the three hops outside the cell rows carry a tag, and every one hugs its ball (the
         tag dy is the text baseline, so 4 centres it on the ball). `write C v2` and `write C v3`
         ride 46 right of the Pod lane, centred on the ball, and emerge 200 in, once clear of the
         Pod. `bind 1:1` rides 40 right of its 40 long hop, in the gap between the two objects, and
         emerges 250 in, once clear of the VolumeSnapshot floor. `CreateSnapshot` rides 56 ahead of
         its ball and just above it on both legs. `wKeep` and `wSeed` cross a 36
         unit gap between cell rows and carry no tag: any tag there prints into a cell at one end of
         the flight.
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
         blocks. Copy on write at the pool: when a snapshot is newer than the last clone of an
         object, `prior to performing the mutation, the OSD creates a new clone` (Ceph
         osd_internals/snaps), which is the order `diverge` narrates. `can be ready in seconds`
         keeps `can`: readiness is a driver property, not a Kubernetes one (CSI spec: a plugin that
         processes a snapshot after the cut returns `ready_to_use` false until done, and one that
         does not `SHOULD be true after the snapshot is cut`). ceph-csi is the second kind
         (`ReadyToUse: true` in its snapshot ToCSI), but its CreateSnapshot first runs
         PrepareVolumeForSnapshot, which flattens a source whose clone chain is past its depth
         limit, so even here a snapshot is not always seconds. A rationale that ceph-csi reports
         ReadyToUse false while flattening is rejected: ToCSI has no false branch.
         The desc says `a restore gets a new, crash-consistent volume holding the older state`, and
         `a restore brings the older state back` is rejected because it reads as an in-place
         rollback of data-1, which dataSource never does: upstream `You can provision a new volume,
         pre-populated with data from a snapshot, by using the dataSource field`.
         `It is only crash consistent` ships on `restore` and `crash-consistent` in the desc, because
         the Pod is a database and a restored block image is not a restored database: Ceph `snapshots
         are merely crash-consistent unless they are coordinated within the mounting (attaching)
         operating system`, and the group snapshot KEP (3476) makes application consistency the
         quiesced case: `we can quiesce the application first ... This way we will get application
         consistent snapshots`. Nothing on this card quiesces db-0. A bare `the
         10:00 state` is rejected as the whole claim: it is true of the blocks and false of db-0.
         `restore-1 in the same StorageClass` ships, and `On a backend like Ceph RBD the volume,
         snapshot and restore share one pool` is rejected in the desc: ceph-csi takes the pool of a
         new volume from its own class (`rbdVol.Pool, ok = volOptions["pool"]` in
         genVolFromVolumeOptions, the path createVolumeFromSnapshot also takes), so a restore into
         another class can land in another pool. The desc says `Here`, the drawn setup.
         `readyToUse: true` stays on the `loss` chip on purpose: the csi-snapshotter sidecar skips
         its status check once a content is ready (`Skip checkandUpdateContentStatus() if
         ReadyToUse is already true`), so the API goes on reporting a snapshot whose data is gone,
         which is what the narration says. `false` on `request` is what the snapshot controller
         writes when it binds a content that has no status yet: updateSnapshotStatus in the
         external-snapshotter common controller declares `var readyToUse bool` (false), copies the
         content value only when `content.Status != nil`, and on a VolumeSnapshot with no status
         writes `BoundVolumeSnapshotContentName` and `ReadyToUse: &readyToUse` together, right after
         createSnapshotContent on the dynamic path. That is why the chip turns on the `bind`
         arrival and not at step entry.
         The aria-label says `a new, crash-consistent volume holding that 10:00 state`, and the bare
         `a new volume holding that 10:00 state` is rejected on the same ground as on `restore`.
         Its last clause, `the snapshot was not a backup`, is not a T-19 absolute: it names snap-1,
         past tense, and its `so` hangs it on `All three live in one pool`, the drawn setup.
         The `stored` chip names where the snapshot data lives, the row headed `Snapshot data`
         right above it: `none` while no snapshot exists, `same pool` from the cut, `lost with
         pool` on `loss`. The `loss` narration states the pool fact the value relies on.
         Narrated and not drawn, on purpose (T-21 is read as the catalog reads it, a narrated actor
         with no block that the record names): the CSI driver on `cut`, folded into the `wCall`
         hop that ends on the pool, because the RPC goes to the driver and not to the pool. The
         VolumeSnapshotClass on `request`, a parameter object the user names rather than an actor.
         The snapshot controller on `request`, named only as what the CRDs ship with. Drawing any
         of them is storage-csi-architecture, per SCOPE.
         `To go back` on `restore` ships: the next sentence says the result is a new volume, so it
         reads as the user intent and not as an in-place rollback. `restored copy` on `loss` names
         what the volume holds, not how the backend stores it (see DO NOT).
SCOPE    The controller and sidecar plumbing (snapshot-controller creates and binds the content, the
         csi-snapshotter sidecar watches only VolumeSnapshotContent and calls CreateSnapshot) belongs
         to storage-csi-architecture. A full server-side copy with no snapshot object in between is
         storage-pvc-clone, and this card is the block-sharing contrast to it.
DO NOT   Draw the restore row as pointers into the snapshot row: whether a restored volume shares
         blocks is a backend detail the card makes no claim about, and a second set of links would
         say it does.
         Add a tag to `wKeep` or `wSeed` (see WIRE LABELS).
NOT A DEFECT
         `report/arrival.test.mjs` R2-ENTRY prints five chip rows (steps 3, 4 and 5), CARRIED in
         `test/fixtures/carried.mjs`: each step winds the chips its ball earns back in `rewind` and
         turns them over with a cued F.set on the arrival, and R2-ENTRY compares two frames frozen
         at t=0. R2-STEP, the settled reading, reports none.
         R4 prints live block `C` on step 4, CARRIED there too: the write ball stops on the frame
         face over C, C is lit by that hop `lights`, and the keep ball leaves after it. R4 counts an
         earlier arrival only on the block the ball touches, and this ball touches the frame.
```
