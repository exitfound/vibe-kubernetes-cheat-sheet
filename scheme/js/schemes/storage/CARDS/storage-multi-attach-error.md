## storage-multi-attach-error

### layout

```
WHAT     The consequence card for storage-access-modes. An RWO volume may be attached to ONE node at
         a time: the old Pod holds it on node-1 through a VolumeAttachment saying attached true, a
         rolling update stands the replacement up on node-2 before the old one is gone, the attach
         and detach controller cannot write a second attachment for the same volume, and the new Pod
         hangs in ContainerCreating with "Multi-Attach error for volume".
LAYOUT   FOUR tiers, one per object in the chain: the claimants, the decider, the two records it
         writes, the contended disk.
         A MIRRORED PAIR about CONTENT_CX, lanes included, so the only thing that differs between the
         halves is state, never geometry. The tiers narrow and widen symmetrically rather than running
         as a straight column: widest at the fork, narrowest at the decider, which is the shape of the
         sentence: one component, two records, one disk.
         Heights and gaps are declared once, summed, and the leftover split evenly, so the whole card
         centres by moving one number.
         CONTENT_W puts CONTENT_CX exactly on 600, and that exactness matters because the chip strip
         at 976 units is far wider than the diagram above it and is therefore the tier that sets the
         visual centre: on 600 it spans 112..1088, so the margins agree at 112.
         The controller is the catalog 232 rather than spanning the node columns at 400, and that is
         what makes the fan below possible: its two output lanes leave its SIDE WALLS at mid-height and
         step outward before dropping, so the narrower it is the more room they have before the hard
         left limit at 398. At 400 wide the left lane starts travelling left from 400 itself and runs
         under the panel; at 232 it starts at 484 with 64 units of clear step-out.
         VA_CX 420 / 780 is a HARD FLOOR on the left. Each lane drops from BAND_MID_Y 260 to VA_TOP
         356, below the deepest standard reading (229.82) and the 900x650 hand row, which reaches
         343.9 at most, but the lane passes x=398 above that bottom, so it must stay right of 398;
         420 keeps 22 units. The BOXES are free to hang much further out, because at
         VA_TOP 356 they are below the panel on every viewport, 900x650 included: at 232 wide the
         left one spans 304..536, reaching 94 units past the limit binding its own lane. That asymmetry between where a LANE may go and where a BOX may
         go is the whole reason this tier can be the widest in the diagram.
PANEL    The deepest step is `detach` (291 characters, the longest narration):
         `OVERLAY_IDS=storage-multi-attach-error node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading.
         The bound reads as an L: above the panel bottom nothing may sit left of 400, below it the
         full width is free. The two upper tiers start at LEFT_X or inside it, while the
         VolumeAttachment row at y=356 hangs 96 units further left on each side because it clears
         the deepest standard reading by 126. At the 900x650 hand row the panel reaches right 398.3
         and bottom 343.9 on the poster, `wantattach`, `detach` and `fix` (313.2 on `wait` and
         `attach`), so the row clears it by 12.1 on every step, the whole budget this card has.
SIZES    The controller and both VolumeAttachments are 232 by 80 (NET.L-01). Measured after
         fonts.ready at 1100x800, `Attach/Detach controller` inks 148.5, 41.8 either side, and the
         widest VolumeAttachment string, `VolumeAttachment va-2`, 139.9.
         The Pods are 104 tall around a 44 tall app box 26 under the Pod label, but NODE_W 180 wide
         rather than 232, a departure the panel wall forces: two 232 Pods in two padded frames from
         LEFT_X 400 would centre the card on 676, off the 600 the chip strip sets. They are 148 wide,
         the frame less its 16 pads, and the app box keeps the catalog 20 unit side pads, 108 wide.
         The widest string in a Pod is the sublabel `Multi-Attach error`, 110.4, 18.8 either side.
         The node frames are 150 tall, the Pod 28 under the frame top and 18 over its floor, and the
         stack is centred, 14 above and below.
         CHIP_W 232 clears the worst name+value pair with ~44 units between the halves. Each total is
         the name plus the value plus the 24 units of chip inset, against the 232:
           new Pod 44 + `scheduled on Node-2` 120 = 188        blocked by 63 + `old Pod running` 95 = 182
           accessModes 69 + `ReadWriteOnce` 82 = 175           attached to 69 + `Node-1` 38 = 131
LANES    Traffic is NOT mirrored even though the boxes are: only the new Pod ever asks for anything,
         so only column B has a request lane, and an arrow under the old Pod would point at a request
         that is never made.
         That request lane starts at the NODE frame, not the Pod inside it: the controller acts on
         nodes, and what it is asked for is an attachment to node-2. It steps IN to the controller's
         top face centre, because a bare vertical down the column (x=710) meets the controller 110
         units off its centre, 6 short of its corner, and reads as stopping on a random point of an
         edge.
         The controller's two outputs leave its SIDE WALLS at BAND_MID_Y.
         Each attach lane then makes one 90 degree turn into the disk's SIDE WALL, so the two Ls face
         each other and the pair reads as two claimants closing on one volume from opposite sides,
         with the middle of the corridor left free for the band caption.
MOTION   THE REFUSAL is the idiom shared with storage-access-modes: a ball travels to the deciding
         block and STOPS there. Through the BLOCKED STRETCH nothing continues past the controller,
         va-2 never lights, and no lane is drawn under it at all, because the object is wanted, not
         wired up. Both of those end on the `attach` step, which is where the write is finally
         allowed: va-2 lights on that arrival and its two lanes come up with it, and they stay up on
         the closing step. The controller reports the Multi-Attach error BEFORE writing anything, so
         through the whole blocked stretch there is no va-2 in the API, which is why it sits at
         OPACITY.pending and why its sublabel says `wanted, not written`.
         The deadlock step animates NOTHING, deliberately: its subject is that neither side does
         anything at all. The closing step also comes to rest, no packet, no pulse, no flash: the
         reader is meant to sit and read it.
         THE CHIP BEATS (`P-03`), measured with a real-time probe rather than a frozen one, because a
         deferred `F.set` rides an `onfinish` and a paused animation never fires one. On `detach` the
         two chips read what `wait` left (`Node-1` / `old Pod running`) until the detach ball reaches
         the disk at 2300, and va-1's own state line turns to `deleted` on the earlier delete arrival
         at 1500 reads `marked for deletion`, and turns to `deleted` with the two chips on the detach
         arrival at 2300: the attacher lifts its finalizer only once the backend has detached, which
         is when the object goes, as `storage-volumeattachment` narrates on its `detach` step.
         On `attach` there are three beats, 1500 / 2300 / 2400: the write creates va-2 (`Node-2,
         attached: false`), the attach makes the field true and the `attached to` chip read Node-2, and
         the Pod chip and the Pod state line both reach `Running` on the blink, together (`P-04`).
         `attached: false` is not an invented state: it is the same two-beat vocabulary
         `storage-volumeattachment` is built on, and without it the box reads `attached: true` for the
         800ms between the write landing and the attach landing.
         THE HAND FROM OUTSIDE LANDS ON THE POD FIRST, and two constraints below ride on that order.
         The old Pod blinks at 0, fades over `FADE.out` from `BEAT.afterPulse`, and its state line
         turns to `deleted` on that same beat, so the va-1 delete ball (`BEAT.lead`, the same 800)
         leaves as the deletion that causes it happens. Measured composite alpha on the animated path:
         1.0 at 800, 0.90 at 1000, 0.65 at 1200, 0.12 from 1500, va-1 and its two lanes following at
         2300..3000. THE BLINK COMES FIRST AND THE FADE FOLLOWS IT (`M-08`): a Pod that fades with NO
         pulse anywhere in the step is invisible to `render/opacity.test.mjs` ORDER, which skips a fade
         that carries no pulse. `deleted` must not stand from step entry over a Pod at full strength.
         What carries this is the ORDER and not the timing: the delete and detach arrivals are 1500 and
         2300 and the span is 3001 against a duration of 3400.
         The blink is the right cue here even though the deletion comes from outside the card: the Pod
         is what the hand acts ON, which is the same reading `cluster-node-drain` and
         `workloads-force-deletion` take for an evicted and a force-deleted Pod.
         va-1 gives its highlight up once it has finished fading: a deleted object must not wear the
         border that means "acting right now" (unlightAt).
         The new Pod has NO dim `booting` state. The OLD Pod stays at FULL through step 4: the entire
         problem is that it is still very much alive and still holding the attachment.
         node-2 is ABSENT at rest, not empty. An empty frame from the first frame says the second
         node is already part of the picture and merely unused, the opposite of the setup. The
         request lane is likewise OFF until the step that rides it: a lane appears when it first
         carries traffic.
         The kubelet mount is not drawn as a hop: it is the subject of the CSI cards, and a lane from
         the centred disk back up into the right column would cut across the VA row and the
         controller. The Pod blinks one beat after the attach lands instead.
WIRE LABELS
         `WRITE_TAG_DX` 32: the write leaves the controller right face, so a centred tag straddles
         that edge for 500ms. There is no clear dy in +-80 on three of the four viewports, so the fix
         is on x: +32 is the least that clears all four, where +30 clears 1600x1000 alone.
         `detach` and `attach` leave a VolumeAttachment floor and ride above the ball, so at
         departure each prints inside the box it leaves, under its state line, and reads as a third
         line of that box. Both take `emergeTag` with TAG_EMERGE 150, which is 32 units of the 700ms
         leg: the tag shows once the ball is clear of the floor.
         The band caption sits in the corridor 300..356, centred on CONTENT_CX, running between the
         two descending lanes at 420 and 780: 360 units of clear width. The longest, `each side waits
         for the other`, measures ~193. Overrun 360 and the caption sits on an arrowhead.
CONTENT  Read against https://kubernetes.io/docs/concepts/workloads/controllers/deployment/#strategy
         and the persistent-volumes access-modes section, for the 1.35 the card targets.
         1. THE DEADLOCK NEEDS ONE REPLICA. "maxUnavailable ... The absolute number is calculated from
            percentage by rounding down ... The default value is 25%", and maxSurge rounds up, so only
            at a small replica count does the rollout create before it deletes. `wait` says "with one
            replica the default maxUnavailable rounds down to zero", and the desc says "a one-replica
            rollout". "The rollout will not delete that Pod until the new one is ready", unqualified,
            is rejected: at four replicas maxUnavailable is 1 and an old Pod goes at once.
         2. DELETE IS A MARK, NOT A REMOVAL. The controller deletes va-1, the attacher detaches, and
            the object goes when its finalizer is lifted. `detach` says "the volume detaches, the
            object goes with it", and va-1 reads `marked for deletion` between the two arrivals.
            "The controller removes va-1, the volume detaches" is rejected: it orders the removal
            before the detach, against `storage-volumeattachment`, which owns that mechanism.
         3. `Node-1` and `Node-2` are capitalised in the prose and on the frames, the chips and the
            VolumeAttachment state lines, the T-06 house spelling of a node name. Checked TRUE and
            left: RWO is "mounted as read-write by a single node" and allows several Pods on that
            node, which is why the card needs a second Node at all; Recreate kills "all existing
            Pods ... before new ones are created"; the attach and detach controller refuses a second
            attach of a volume that is not multi-attachable before writing any VolumeAttachment.
         `old Pod running`, not `old Pod still running`: the longer string measures ~131 against a 69
         unit name, leaving 8 units between the halves, which reads as one run-on field.
BUDGET   About 291 characters per step, which is what keeps every step on the poster line count at
         900x650: 268 to 291 characters read 343.9 there and clear the VA row top at 356 by 12.1,
         while 320 took the bottom to 374.7 and 350 to 436.3, burying the left VolumeAttachment (label
         ink 380.6..395.8). One line more on any step reopens that overlap. Over the standard
         viewports the row clears the deepest reading (229.82) by 126.
         Re-measure after editing prose, not only after moving geometry, and measure the poster:
         `idle` carries no narration of its own, it shows step one's text, and that is the reading
         that binds here. The three standard viewports come back from
         `OVERLAY_IDS=storage-multi-attach-error node --test report/overlay.test.mjs` run in
         `scheme/test`; the 900x650 row is a hand sample and stays one.
SCOPE    node-1 is HEALTHY from the first frame to the last, and that is the whole boundary against
         storage-volume-detach-on-node-loss. Nothing is broken here: the volume is legitimately held
         by a Pod that is legitimately running, and the only reason the new Pod waits is that its own
         rollout strategy created it before deleting the old one. An ORDERING problem with an
         ordering fix (Recreate).
NOTE     `P.node` places its caption in GROUP-LOCAL coordinates. Use it: appending a caption with an
         ABSOLUTE x into the translated group displaces it a second time and puts node-2 at x=1614,
         outside the viewBox. Its local y is 14 rather than 18 so it titles the frame rather than
         floating inside it.
WHY NOT  Hand-typed tier y values: at 44..628 they leave the node row 30 units of air while the three
         lower tiers are packed at 52.
         A funnel of the two attach lanes into the disk's top face: both lanes then share a final
         vertical and land one arrowhead on one point, losing the mirrored pair that is the whole
         shape of the card.
         Turning `blocked by` over on the delete arrival (1500) instead of the detach (2300): the chip
         answers what blocks the NEW Pod, and what blocks it is the volume being held, not the object
         existing. Both chips therefore ride one arrival and stay on one beat.
         The controller alone in the bottom LEFT corner at x=60 with the nodes and disk up and right:
         a large dead region through the middle, and content under the panel.
DO NOT   Re-tell the unreachable-node case, the unreachable-toleration and force-detach clocks, the
         roughly six minutes, or the two-writers-corrupt-one-filesystem argument. Those belong to the
         detach-on-node-loss card, and told on both the pair reads as one card shown twice. A timeout
         in this record is drift.
         Widen CONTENT_W, or the strip slides right while every other tier still looks internally
         symmetric, which is the failure mode the sibling cards show.
         Run APP 40..86: the sublabel glyphs start at 87 and collide on both Pods.
         Drop the controller's two outputs straight out of its underside: that reads as two lines
         threaded through a slab rather than as two outputs of one component.
         Fade va-2 in AT FULL as the refused request lands: that says the object was created and then
         blocked.
         Use the sanctioned packet-less block flash on va-1 in the deadlock step, because a blinking
         attachment reads as activity.
         Sit the new Pod at 0.55 and pulse it through pulsePodDim, which stacks an opacity swing on
         the standard blink and reads as a faster, busier pulse at the identical 900ms.
NOT A DEFECT
         report/arrival.test.mjs prints three R2-ENTRY rows, `blocked by` on step 6 and `attached
         to` and `new Pod` on step 7. Each value is wound back in `rewind` and turned over by a cued
         F.set one step earlier: `blocked by` when the detach reaches the disk (`det`), `attached
         to` when the attach does (`att`), and `new Pod` one hop later with the new Pod blink. A
         frame frozen at t=0 first sees each a step late. R2-STEP reads 0. Carried in
         test/fixtures/carried.mjs.
```
