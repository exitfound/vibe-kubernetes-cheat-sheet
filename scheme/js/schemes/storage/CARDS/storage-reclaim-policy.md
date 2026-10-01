## storage-reclaim-policy

### layout

```
WHAT     The reclaim policy is a field the provisioner stamps on each PV from its StorageClass, that
         can be patched on a live volume, and that alone decides whether deleting the claim destroys
         the disk: Delete destroys it, Retain leaves an orphan that no new claim is offered and that
         even deleting the PV does not remove.
LAYOUT   A side-by-side comparison, the storage stack drawn TWICE, a Delete column against a Retain
         column, with ONE full-width band between the volumes and the disks: the external-provisioner,
         because both columns are stamped and reclaimed by the same sidecar reading the same field.
         The two actors outside the stack flank it. The StorageClass stands LEFT of the band it
         feeds, below the panel (L-03), and the administrator stands right of the claims, the only
         room level with them. Each stands one COL_GAP off the stack, so left and right they
         balance: the pooled bbox reads 120..1080 on 600 where a class on the right read 400..1082
         on 741.
         The freed LEFT column is where the new claim lands. After the Delete branch its stack is
         gone, so data-c, PV new and vol-ccc are born in the same slots, and the step reads as a new
         empty disk standing one column away from the orphan full of data. That contrast is the
         card: Retain keeps the data and never gives it back.
         Three equal 40 unit gaps (`TIER_GAP`) between the four tiers, so no hop is a blink and no
         tier reads as belonging to its neighbour. The stack is pulled UP because five text rows
         queue under the disk shelf (cylinder name, spec line, verdict line, two rows of chips).
         The readout is a 2x2 GRID: each column gets its own pair of chips directly under it, one
         row per kind of object, so reading ACROSS compares the two policies and reading DOWN walks
         one stack.
PANEL    `OVERLAY_IDS=storage-reclaim-policy node --test report/overlay.test.mjs` from
         `scheme/test/`. Deepest at 1100x800 on the poster step, which previews the `stamp`
         narration, 204.97. The claim and volume tiers stand inside the panel band, so the columns
         start at 400 against a right edge of 396.55 at 1100x800. The StorageClass starts at 120
         and its top, 270, clears the deepest panel bottom by 65.
SIZES    Every block is 80 tall (NET.L-01). The StorageClass and the administrator are also 232
         wide. The two columns are 176 wide rather than 232, a departure the panel wall forces:
         centred on 600 from a left edge of 400 the stack is 400 wide, and two 232 columns would need
         464 before any gap. The band is sized BY that stack. Four 80-tall tiers at 40 apart end the
         shelf at 490.
         cylinder() puts its own name on the baseline h/2+5, and the spec line goes 14 BELOW that,
         the same fix and number as storage-access-modes.
LANES    Between each volume and the provisioner runs a PAIR 24 apart (LANE_DY 12): the left lane up,
         the policy WRITTEN onto a volume as it is made (`stamp`, and PV new on `new-claim`), the
         right lane down, the policy READ off a released volume. One array per lane feeds both the
         static lane and the ball.
         Below the band, one lane per column: DeleteVolume on the left, then CreateVolume for vol-ccc
         down the same lane. The Retain lane is drawn and never travelled, which is the whole point,
         and its gap carries the `no call` wire from `retain-branch` on (carried under A-05).
         The class lane is 48 long, class right face to band left face. The administrator lane runs
         down from its floor and left into the PV ret right face, used by the patch and the delete.
         The Bound links are `P.relation` dashed 5 5, a RELATION nothing travels, so the arrowhead is
         what tells them from the dashed ROUTES.
MOTION   There is no Pod anywhere, so nothing pulses: boxes, the band and the cylinders light.
         Every block that ACTS FIRST is lit from entry and sends after `BEAT.lead` (M-18a): the class
         on `stamp` and `new-claim`, the administrator on `patch` and `cleanup`, and the released PV
         whose policy is read on `delete-branch` and `retain-branch`.
         Every value a ball EARNS waits for it: the patched sublabel, the removed and deleted chips,
         the Bound claim, the new chips and every verdict wire are wound back in `rewind` and turned
         over by an `F.set` on the arrival. The frozen R2-ENTRY axis therefore attributes four chip
         turnovers to the step after, which fixtures/carried.mjs rules on.
         On `new-claim` the three left lanes lead to blocks that do not exist yet, so each fades in
         over `LANE_IN_MS` 300 and is whole `LANE_EARLY` 400 before the arrival its ball leaves
         after: the disk lane off the class arrival, the volume pair off the CreateVolume arrival.
         A lane fading in under a ball already riding it is the A-15 defect this timing avoids. The
         disk, its caption and the volume are revealed by their own balls.
         A lit stroke is a CLAIM about the object, and a block below full opacity never carries one:
         removeAt drops the class as the fade lands.
WIRE LABELS
         Every vertical hop crosses a 40 gap from a box floor to the next box top, so a tag riding
         above its ball is born inside the SENDER. Those tags fade in on an emerge of 400, once clear
         of the floor, and park in the gap above the receiver. The two administrator tags ride
         `ADMIN_TAG_DX` 51 right of the ball and emerge at 160, because centred they would park half
         over the PV right face. The two policy tags ride the DOWN lane of a pair and are 86 wide at
         1100x800, so centred they would lie across the up lane 24 to the left: they ride
         `POLICY_TAG_DX` 50 right of the ball, clear of both lanes and inside the gap between the
         columns. The class lane carries no tag: 48 units cannot hold one between two faces.
CONTENT  Read against the release in `k8sVersion`. A dynamically provisioned PV inherits the policy
         of its StorageClass, and a class created without `reclaimPolicy` defaults to Delete
         (Storage Classes, Reclaim policy). The external-provisioner is what copies it: it sets
         `pv.Spec.PersistentVolumeReclaimPolicy` from `StorageClass.ReclaimPolicy` when it builds
         the PV (kubernetes-csi/external-provisioner, pkg/controller/controller.go).
         The PV field is `persistentVolumeReclaimPolicy`, and step 2 names it because that is what
         `kubectl patch pv` writes, the documented way to keep precious data (Change the Reclaim
         Policy of a PersistentVolume). The band says `the reclaim policy` and not `reclaimPolicy`,
         which is the StorageClass field and not a PV field.
         Delete is carried out by the external-provisioner for a CSI volume, not by the in-tree PV
         controller. It acts only on a Released PV whose policy is Delete, calls DeleteVolume on the
         driver, and deletes the PV object after that call succeeds
         (sig-storage-lib-external-provisioner, controller/controller.go, shouldDelete and
         deleteVolumeOperation), so `only then is the PV object removed` is the order the code runs.
         A Released volume is `not yet available for another claim` (Persistent Volumes,
         Reclaiming), and a claim that matches no PV is provisioned from its class (Persistent
         Volumes, Provisioning, Dynamic), which is why data-c gets vol-ccc. `never offered` is
         rejected in the aria-label and the narration: the docs say `not yet`.
         Under Retain `the associated storage asset in external infrastructure still exists after
         the PV is deleted`, and reuse is `create a new PersistentVolume with the same storage asset
         definition` (Persistent Volumes, Retain), so step 7 says `given a new PV by hand`.
         `kept and handed to a claim again` is rejected because the deleted PV cannot be rebound.
         `still billed` holds for EBS, charged `by the amount of GB you provision per month until
         you release the storage` (Amazon EBS pricing).
BUDGET   The chip grid costs a hard 152 units of text per chip (176 minus 12 of padding each end), so
         values are kept to about 12 characters. The longest pair is `vol-bbb` plus `still billed`,
         19 characters. Shorten the VALUE, never the width.
SCOPE    The phase field and its transitions, Failed included, and the manual way back from Released
         to Available by clearing the claimRef, are storage-pv-lifecycle-phases. This card stops at
         what happens to the DISK. The pvc-protection finalizer that holds the claim in Terminating
         is storage-pvc-protection, and what a StatefulSet does with its claims is
         storage-pvc-retention-policy. Reusing a retained volume for one named claim, by pointing its
         claimRef at that claim, is storage-pv-reservation.
NOTE     Each chip names ONE object and reports only that object's state. The PV chips carry the
         PHASE, which is why the PV boxes keep their reclaim policy as the sublabel. The left column's
         chips are two pairs on the same slots, the deleted objects and the new ones, swapped by
         opacity on `new-claim`, so a chip never names an object that is not the one above it.
         The new claim, its volume and its disk are their OWN blocks, not the deleted ones turned
         back on. The spec lines are SIBLINGS of their cylinders, so each is faded by hand with its
         disk, or a bright `real disk, EBS` hangs under a deleted disk.
WHY NOT  The new claim in a third column right of the Retain one: the right margin holds the
         administrator, and a third 176 column there moves the band off 600.
         A StorageClass tier above the claims: five tiers of 80 at 40 apart end at 610 and leave no
         room for the chips inside a 640 canvas.
         A flat DISK_Y+66 for the spec line: 11 units between two 11 unit tall baselines, touching.
DO NOT   Light `retDisk` on `retain-branch`. lightBoxAt is the cue for a block that RECEIVED a ball,
         and firing it with no ball on the lane turns the step about the disk never being touched
         into the step where the disk lights up on arrival.
         Show the new claim waiting in Pending for PV ret. With a provisioning class the binder skips
         the Released volume and the provisioner makes a new one, and a claim that only waits would
         need `volumeName` pinned to PV ret, which is a different story.
OPEN     CENTRE-LOW is open here on purpose. The blocks below the panel read 120..800 on 460: the
         stack centres on 600 and the StorageClass is the one side block at that height. On the
         right it would read 741 and reopen CENTRE as well, while on the left it balances the
         administrator above it and CENTRE closes on 600. Carried in test/fixtures/carried.mjs on this
         argument.
```
