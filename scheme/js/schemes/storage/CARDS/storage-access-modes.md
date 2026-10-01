## storage-access-modes

### layout

```
WHAT     Which node, and which Pod, may hold the volume at the same time. A block disk that can only
         do single-attach against a shared filesystem that can do many.
LAYOUT   Every tier centres on the canvas, 600. The node row and the driver band share ONE span,
         306..894, so the row stands flush over the band it feeds, and the disks and the chip strip
         centre on the same line. The row sits in the panel's y band, so its left end goes behind
         the panel on the narrower viewports: see OPEN.
PANEL    Measured bottom lo..hi per viewport: 125.11..160.00 at 1600x1000, 150.17..192.67 at
         1280x860, 155.28..229.82 at 1100x800, the deepest reading on the `rwx-nfs` step:
         `OVERLAY_IDS=storage-access-modes node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The panel's right edge is 290.8 at 1600x1000, 377.76 at 1280x860 and 396.55 at 1100x800,
         so the node row, from x 306 at y 77..241, clears it only on the widest viewport.
         The card takes the stricter 900x650 hand row (`STO.L-04`): right 398.3, bottom 374.7, on
         `rwo-othernode` and `rwx-nfs`. The driver band spans 306..894 on x and 295..375 on y, so at that hand
         row its left 92 units sit behind the panel over the band's whole height, about 16 percent
         of its area. Over the three standard viewports it is clean, its top clearing the deepest
         reading, 229.82, by 65. That is the same disagreement between the hand row and the sampled
         set that storage-csi-attach-mount records, and the band has nowhere to go: the disks hold
         everything below 375.
SIZES    The three Pods are 104 tall (NET.L-01) around a 100 by 44 container box, and 128 wide rather
         than 232: three 232 Pods with their pads and the node gap overrun the 588 row. The row keeps
         its bottom at 208, and each frame hugs its Pods with a 27 header and a 33 foot.
         `NODE_PAD` and `POD_GAP` are ONE spacing, (588 - 30 - 3*128) / 5 = 34.8, so the three Pods
         sit evenly: node-1 is 360.4 wide, node-2 197.6. A wider Pod takes only from that spacing,
         which reaches zero at POD_W 186; the row centre stays on 600 whatever POD_W is.
         The driver band is the row span, 588 wide and 80 tall, its bottom kept at 375.
         POD_W is floored by the WIDEST TEXT INSIDE A POD. The container sublabel is `read/write` at 59
         units; `reads and writes` renders 94 and puts a hard floor of ~146 under POD_W.
         SPEC_GAP is 14 below the cylinder name, which `cylinder()` puts on the baseline h/2+5, the
         same gap storage-pvc-binding uses.
         CHIP_W 232 is one width for all four chips, measured worst cases in viewBox units:
           accessModes 76 + ReadWriteOncePod 110 = 186   <- the binding one, neither string can shorten
           used on     + `Node-1, Node-2`, shorter than the pair below
           sharing     48 + `app-1, app-2, app-3` 131 = 179
           enforced by 76 + `attach controller`         <- the tightest, 15 clear at 1100x800
         232 clears every pair: `render/chipfit.test.mjs` asks 4, the tightest is 15.
LANES    Every mount is a DESCENT through the driver, the rewrite-inside-a-box idiom, because the
         driver is where the decision is made. A refused attach stops AT it and never reaches a disk.
         The shared bus above the band and the fan below it meet the band at one point.
         Three NFS lanes rather than two, because ReadWriteMany excludes nobody: app-2 sits on the
         same node as app-1 and can mount it just as well, and leaving it out makes the step look
         like RWX still rations access.
MOTION   On a refusal the Pod still blinks FIRST exactly as `grantMount` has it: it is the actor either
         way, and without the blink the narration names a Pod that is never seen doing anything, the
         ball just materialising out of a dim block. Refused Pods stay dim, so that blink takes the
         dim variant with an opacity lift.
         On the refusal step the block disk stays LIT: it is still attached to node-1 and still in use,
         and it is the REASON app-3 is refused, so leaving it unlit contradicts both the wire label and
         the narration.
         Who HOLDS the volume is carried by the ball, the lit disk and the sharing chip, never by
         dimming a Pod that has not mounted yet.
         `used on`, `sharing` and the `attached:` / `mounted on both nodes` captions are what a
         grant EARNS, so on `rwo-first`, `rwo-samenode` and `rwx-nfs` `rewind` winds them back and a
         cued `F.set` turns each over on the attach arrival of its own ball (`P-03`). On `rwx-nfs`
         the sharing list grows one Pod per landing and Node-2 joins with app-3, the last one.
         `rwo-othernode` and `rwop` run 3100 rather than 2600: at 2600 their narrations read at
         9.06 and 8.15 ms per character, among the most hurried steps `timing.mjs` ranks.
         `MOUNT_LEAD` 520 is TAG spacing, not pacing: all three RWX mounts land within 32 units of the
         disk top, so each tag has to fade before the next one lands, and at 520 the ink gap is 23
         units on all four viewports. `DENY_LEAD` 450 spaces the two refusals of rwx-block on the one
         bus. The rwx-nfs duration follows to 4300 for a span of 3900 (`M-19`).
WIRE LABELS
         A refusal tag rides 12 UNDER the ball (`DENY_TAG`). Above it, it starts inside the Pod on the
         `mounts /data` sublabel for 200 to 280ms and then runs the whole bus on the node frame floor,
         which is 19 above the bus, for 360 to 640ms. Under it, it leaves from the frame foot, crosses
         the frame floor once in transit (40 to 80ms), rides the bus in the gap over the band and
         fades on a hold of -300 before the last drop reaches the band top. Measured every 40ms at the
         three viewports it reads for 560 to 1040ms and touches no block, sublabel or caption.
         A grant tag is born inside the band, whose floor its ball leaves, so it fades in on
         `GRANT_EMERGE` 340 (`emergeMode`), once it has cleared the floor, and still parks on the disk
         top. Before that it sat inside the band over its sublabel for 280ms.
CONTENT  `enforced by` is a real value, not a constant caption, and it names who REFUSES: the attach
         controller on the ReadWriteOnce steps, `Kubernetes` on ReadWriteOncePod, the `CSI driver`
         on both ReadWriteMany steps. `CSI driver` on the ReadWriteOnce steps is rejected: the
         second-Node attach is refused by the attach/detach controller in kube-controller-manager,
         keyed on the volume access mode, with the event `FailedAttachVolume` "Volume is already
         exclusively attached to one node and can't be attached to another" (release-1.35
         `pkg/controller/volume/attachdetach/reconciler/reconciler.go`). For the same reason the
         desc and the aria-label no longer say the mode is "mostly a request the driver honours",
         and `rwop` says "the only mode that limits access to one Pod", not "the one mode
         Kubernetes enforces itself". The Persistent Volumes page: access modes "do not enforce
         write protection once the storage has been mounted", but "In some cases, the volume access
         modes also constrain where the PersistentVolume can be mounted", and ReadWriteOncePod
         "is constrained and can be mounted on only a single Pod".
         `this block disk cannot attach to more than one Node` ships on `rwx-block`, `a raw block
         device simply cannot attach to more than one Node` is rejected: multi-attach block volumes
         exist (EBS io2 Multi-Attach), so only THIS disk is the claim.
         `cannot start while Node-1 holds the disk` ships, `never starts` is rejected: once Node-1
         releases the disk the attach can succeed.
         `Kubernetes lets it be used on both Nodes at once` ships on `rwx-nfs`, and the chip reads
         `used on`, not `attached to`, with the caption `mounted on both nodes`. `The driver attaches
         it to both Nodes` is rejected because the NFS CSI driver declares `attachRequired: false`,
         and `A shared filesystem needs no attach` is rejected because the CephFS one, which the
         same sentence names, declares `attachRequired: true` (the csidriver manifests of
         csi-driver-nfs and ceph-csi).
         The band is `Kubernetes and the CSI driver`, `grants or refuses each Pod`, and `CSI driver
         and attach controller`, `grants or refuses each attach` is rejected: the ReadWriteOncePod
         refusal on `rwop` lands on the band and is the Scheduler, which attaches nothing ("If a
         second Pod attempts to use a PersistentVolumeClaim that has the ReadWriteOncePod access
         mode, the scheduler will mark that Pod as unschedulable", the ReadWriteOncePod GA post on
         kubernetes.io). The chip names which part refuses on each step.
         `The disk is attached to one Node, Node-1, and ReadWriteOnce lets a Pod there read and
         write it` ships on `rwo-first`, and `ReadWriteOnce attaches the disk` is rejected, as is
         `ReadWriteOnce attaches a volume` in the aria-label: the mode attaches nothing, the attach
         controller does.
         Verified and unchanged, read against 1.35: ReadWriteOnce "still can allow multiple pods to
         access (read from or write to) that volume when the pods are running on the same node"
         (`rwo-samenode`), NFS and CephFS both carry ReadWriteMany in the Persistent Volumes plugin
         table (`rwx-nfs`), ReadWriteOncePod "can be mounted as read-write by a single Pod".
         `rwop` drops the use-case clause (two writers corrupting each other) to keep the step
         readable at 3100: the clause is advice, not a claim.
         `sharing` answers exactly one question: which Pods hold the volume right now. Refusal reasons
         belong on the driver wire label, which carries them.
NAMING   The multi-value chips read as comma lists because `Node-1 and Node-2` and `app-1, app-2 and
         app-3` would force a wider uniform chip, and the strip is already more than twice the width
         of the diagram it captions.
WHY NOT  Dropping each Pod straight down: that puts three arrows across a 588 unit face, none of them
         near its midpoint. The shared bus and the fan avoid that by meeting the band at one point.
         POD_W 112: the Pods come out narrower than they are tall and read as squeezed.
         The node row pinned at x=400, with the band mirroring its right edge out to 306: that
         clears the panel on every viewport, but the row centres on 647 and starts 94 right of the
         band under it.
         A flat PV_Y+66 for the spec line: against a 100 tall cylinder that leaves 11 units between
         two baselines whose text is 11 units tall, so the two lines touch.
         MOUNT_LEAD 200: the tags print on each other for 400ms at a baseline gap of 0.00. Separating
         them in SPACE instead does not exist here, because the three arrivals share one point.
DO NOT   Pull the node row back to x=400 on its own to clear the panel: the row and the driver band
         share one span on purpose, and moving one edge without the other re-opens the misalignment.
         Collapse the three NFS lanes to a single wire down NFS_CX with balls flying at NFS_CX +/- 7:
         then no ball rides the drawn line, they skim 7 units either side of it.
         Lengthen the container sublabel `read/write` without re-checking the 34.8 spacing.
         Hardcode `enforced by` to one value: it names who refuses, and that is the attach
         controller, Kubernetes or the CSI driver depending on the step.
         Let `sharing` double as a refusal report (`node-2 refused`, `block cannot span nodes`). That
         puts a refusal in the chip on the very step where a ball flies out of a refused Pod, so the
         chip reads as a caption for that ball.
         Dim the not-yet-mounted Pods. Dim means the access mode REFUSES this Pod, never `has not
         mounted yet`: the poster auto-plays step 1, so that is the frame you stare at on open, and
         dimming there shows two of three Pods greyed out for no reason a viewer can name. It also
         conflates app-2, which mounts fine one step later, with app-3, which is genuinely refused.
OPEN     The node row's left end sits behind the panel at 1280x860 and 1100x800. Pod app-1 spans
         340.8..468.8 and is 44 percent under the panel at 1100x800, its container 42 percent
         (`report/geometry-soft.test.mjs` OCCLUDED, carried in `test/fixtures/carried.mjs`), part
         of the `Pod app-1` label included, and the Node-1 frame label at x 318 is covered on both
         viewports. It is the price of the row standing flush over the driver band, the author
         ruling over the row at x=400. At 1600x1000 nothing is covered.
         The three `mount rwx` tags of rwx-nfs ride centred on the NFS fan, whose three lanes are 16
         apart, so each 55-wide tag crosses its two neighbour lanes for most of its 560ms. Any dx that
         clears one neighbour lands on the other, and the fan cannot widen without leaving the disk
         top.
```
