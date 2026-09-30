## storage-pvc-clone

### layout

```
WHAT     A clone is an ordinary PVC plus one field, dataSource naming an existing claim, and the
         storage system duplicates the volume only when the new claim fits its source row by row.
         Once made, the clone shares nothing with the source.
LAYOUT   Two spec listings level with each other across a fit test, the way a diff is read. The
         source claim heads the left column and the clone the right, mirrored about CX, each head
         over five field chips (namespace, phase, volumeMode, storage, storageClassName). Between them,
         on the axis, stands a column of five gate boxes, each level with the pair of fields it
         compares, and the External-provisioner above it, because it runs the test: its check drops
         straight down the axis into the first gate, between the two heads. Under the last gate the
         call drops into a full-width backend frame holding one disk under each column.
         The subject wanted this rather than the section defaults (4 of 5 siblings draw a wide chip
         strip, and a mirror of claims over disks reads as provisioning): the part of cloning
         a reader gets wrong is WHICH fields have to agree and which may differ, and only a
         row-aligned pair of listings shows that as geometry. It also keeps the card apart from
         storage-volume-snapshot beside it, which draws the volume as blocks in a pool over time.
         No chip strip: the field chips ARE the chips, two columns of five.
PANEL    `OVERLAY_IDS=storage-pvc-clone node --test report/overlay.test.mjs` from `scheme/test/`.
         Deepest at 1100x800, 205.0 on `request`, `check` and `copy` alike, all three narrations
         wrapping to the same depth there. The column heads start at HEAD_Y 220, 15 under it. The
         provisioner and the request lane sit right of the panel (x from 484), so only the head row
         is pinned by the panel. A narration one line longer on any of the three eats that 15.
SIZES    Every block is the catalog actor block, 232 by 80 (NET.L-01): the provisioner and both
         claim heads. The field chips and the gate boxes are the family chip height, STO.CHIP_H 34,
         232 wide, at a pitch of 40, each gate level with the pair of fields it compares and as wide
         as the provisioner so the test reads as its column. The widest gate label, `Class may
         differ, same driver`, inks 164.4 at 1100x800, 33.8 clear of each wall. Worst chip pair
         `storageClassName` + `rbd-retain`, 98.2 and 61.3 of ink in 232, 48.5 apart.
         The disks are cylinders 200 by 60 in an 86 tall frame, one 13 inset above and below.
LANES    Four lanes, zero crossings, every end a face midpoint. `wReq` leaves the clone head top,
         rises on x=880 and turns in to the provisioner right face at its mid height. `wCheck` drops
         on the axis from the provisioner floor to the first gate top, through the 328 gap between
         the two heads. `wCall` is the 38 unit hop from the last gate floor (506) to the backend
         frame top face (544): the frame is what it addresses, the storage system, as on
         storage-volume-snapshot. `wCopy` runs from the source disk right face to the clone disk
         left face at disk mid height, 43 under where `wCall` lands. Each points array feeds both
         its lane and its ball.
         The two identity links, each claim column down to the backend, are dashed relations with
         no marker, and like `wCall` they stop ON the frame top face at 544: the claim is bound to a
         volume inside that system, and a line crossing the frame into the disk reads as reaching
         past its contour. The clone link is held back until `bound`.
MOTION   Nothing pulses: there is no Pod. On `check` the ball lands on the first gate and the gates
         light one per SCAN_MS 450 down the column, the fit test read row by row, with no ball
         between them because a ball riding through the row text would print over it. On `copy`
         the provisioner is lit at entry with the five gates, since the narration names it as the
         caller and the call leaves the last gate of its own test. The call lands on the frame,
         the clone disk materialises over REVEAL_MS, and the copy leaves the source on that reveal.
         `bound` opens on BEAT.lead like the other steps, so the claim link draws after the
         narration has started, and holds 2800. Spans against durations: request 2060 of 3200,
         check 3301 of 4400, copy 3360 of 4600, bound 1401 of 2800, independent 1500 of 3400, read
         by `deadair.mjs`, which puts every step at or under 56 percent still. The gate lights and
         the phase turnover are `at()` callbacks, so a SEEKED frame shows none of them (M-35):
         open the card for real to see the scan.
         The clone column and disk default to OPACITY.pending, never 0, so the mirror has no hole
         on the idle step. A lane is full only when both its ends exist.
WIRE LABELS
         `dataSource: data-src` rides 90 right of and 12 above its ball, clear of the clone head at
         departure and of the provisioner right face on arrival. `fit test` leaves the provisioner
         floor, so it fades in once clear and stops above the first gate. `CreateVolume` is a
         standing wire beside `wCall`, centred in its 38 unit gap: the hop is shorter than any tag
         and its travel.
         `exact duplicate` stands 10 above the copy lane between the disks, where a riding tag would
         print into a disk wall at both ends of the hop. On `copy` it is wound back blank and written
         as the copy leaves, so it never names a duplicate over a lane that is not drawn yet, and the
         static path still ends on it (T-30).
CONTENT  Claims read against Kubernetes 1.35, the external-provisioner and ceph-csi sources.
         Quoted from kubernetes.io CSI Volume Cloning, the page `sources` cites:
           `You can only clone a PVC when it exists in the same namespace as the destination PVC`
           `Cloning can only be performed between two volumes that use the same VolumeMode setting`
           `the value you specify must be the same or larger than the capacity of the source volume`
           `The source PVC must be bound and available (not in use).`
           `Cloning is supported with a different Storage Class.`
           `the back end device creates an exact duplicate of the specified Volume`
           `the source is not linked in any way to the newly created clone, it may also be modified or
            deleted without affecting the newly created clone`
         `Class may differ, same driver` ships and a bare `may differ` is rejected: external-provisioner
         `getPVCSource` fails the claim with `claim in dataSource not bound or invalid` when
         `sourcePV.Spec.CSI.Driver != sc.Provisioner`. The gate, `check`, the desc and the aria-label
         all carry the driver condition. The kubernetes-csi external-provisioner page still says the
         source must be `in the same storage class`, which both kubernetes.io and the code contradict,
         so the card follows those two.
         `A size, mode or driver misfit leaves clone-1 Pending` ships, and `a claim that fails a row
         stays Pending` is rejected: `getPVCSource` checks the size, the volumeMode, the driver and the
         source Bound before it calls the driver, and `not in use` is a documented requirement it does
         not check. The desc keeps `made only when` over the not in use row because that is the
         page own framing of a requirement (`must be`), not a claim about what enforces it.
         `the dataSource carries no namespace` is the TypedLocalObjectReference shape: apiGroup, kind,
         name. The cross-namespace `dataSourceRef` is not drawn.
         `no VolumeSnapshot object in between` ships in the desc and the aria-label, and `no snapshot
         object` is rejected: ceph-csi clones a PVC through a TEMPORARY RBD snapshot on the backend
         (`checkCloneImage` in internal/rbd/clone.go), so only the Kubernetes object is absent.
         `on Ceph RBD none of the data travels through the cluster` ships on `copy`, and the bare form
         is rejected: CreateVolume leaves the copy to the driver, and a driver may move the bytes
         through a node. A size above the source (20Gi from 10Gi) relies on the driver expanding after
         the clone, which kubernetes-csi Volume Cloning makes the plugin responsibility, and ceph-csi
         resizes.
         The field chip is `storageClassName`, the real field, and `storageClass` is rejected as a
         name the API does not have. The driver is `rbd.csi.ceph.com`, which implements CLONE_VOLUME.
         The two classes differ by name only, `rbd` and `rbd-retain`, the realistic reason to clone
         into another class, and `rbd` reclaiming with Delete is the StorageClass default.
         CreateVolume is a call into the DRIVER that produces a volume, so its ball lands on the
         backend, never on the clone claim.
NAMING   External-provisioner, capitalised like every other CSI sidecar block in the family. The
         narration keeps it lowercase mid-sentence. The gate labels open on a capital, as every box
         label does (T-09), and carry no verb: each names the condition, not the action.
SCOPE    Snapshots, and restoring from them, are storage-volume-snapshot. The last step names the
         contrast in one sentence and draws no snapshot object. Dynamic provisioning without a
         source is storage-dynamic-provisioning.
DO NOT   Land the CreateVolume ball on the clone claim: that is neither where the call goes nor what
         it creates.
         Route `wCheck` across a line between the two heads: a dataSource relation drawn there is
         crossed by the check, which is why dataSource is the clone head sublabel instead.
         Light the field chips during the scan: a lit chip is the cue for a value that changed
         (P-05), and nothing changes on `check`.
NOT A DEFECT
         `report/arrival.test.mjs` R4 prints `Source volume` on `copy`, and R2-ENTRY prints the clone
         `phase` on `independent`, both CARRIED in `test/fixtures/carried.mjs` with the reason.
```
