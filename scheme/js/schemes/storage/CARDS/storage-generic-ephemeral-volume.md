## storage-generic-ephemeral-volume

### layout

```
WHAT     An inline volumeClaimTemplate written directly on the Pod under ephemeral. It gets a real PVC,
         a real StorageClass, real dynamic provisioning and a real CSI mount, so unlike emptyDir it can
         be large, of a specific class, and even snapshotted. But its lifetime is the Pod: the PVC
         carries an ownerReference back to the Pod and is garbage-collected when the Pod dies, which
         is why the identity column is the Pod owning its PVC owning its PV and the last gesture is
         that whole column collapsing.
LAYOUT   The identity column runs straight down the canvas centre line, with the StorageClass and the
         provisioner flanking the claim row equidistant from it. The gap above the claim row equals
         the gap below it, so the ownership and the binding read as one rhythm rather than as two
         different distances.
PANEL    `OVERLAY_IDS=storage-generic-ephemeral-volume node --test report/overlay.test.mjs` from
         `scheme/test/`. Deepest at 1100x800 on `mint`, `provision`, `owner` and `gc`, 204.97, and
         `mount` a line shallower. The Pod stands in the panel's y band and clears it
         on x, 484 against a right edge of 396.55. The one block under the panel column is the
         StorageClass, whose top at y 212 clears the deepest reading by 7. One more line on any of
         those three (24.85 at 1100x800) puts the panel over it: cut prose rather than move the row.
SIZES    The Pod is the catalog 232 by 104 around a 192 by 44 app box 26 under its label, and the
         claim, the StorageClass and the provisioner are the catalog actor block, 232 by 80
         (NET.L-01). The widest string in any of them, measured after fonts.ready at 1100x800, is the
         Pod sublabel `ephemeral: volumeClaimTemplate` at 184, 24 a side, then
         `driver: ebs.csi.aws.com` at 141.1. The disk is a cylinder, not an actor block, and keeps
         200 by 110. PV_Y is DERIVED from the rhythm (row bottom plus the gap above the row), so the
         72 above the claims equals the 72 below them.
         Family CHIP_W 232: the worst pair is `backing` at 42.9 beside the 19 character value
         `real disk, fast-ssd` at 116.6, 159.5 of ink in the 232.
LANES    EVERY wire on this card carries an arrowhead and a ball on some step: there are no
         undirected lines. The four column lanes are an out and back pair 24 apart mirrored about CX
         (L-12): down at x 612 (mint, then the cascade), up at x 588 (the mount). Every lane stands
         at full on every step both its ends stand, pending shade included, and is 0 otherwise, so
         `stage()` derives the lanes from the three blocks: the column pair from `idle`, the lanes to
         the PV from `provision`, where the PV appears. On `gc` each lane goes out with the first of
         its ends to go: up-high with the Pod, down-high, up-low and the provisioner lane with the
         claim, down-low and CreateVolume with the disk. The lanes into and out of the Pod stop ON the
         Pod floor, y 140, never inside on the app box, and the lanes to the disk on its top face.
MOTION   The owner step carries no packet and no Pod pulse, and the canon would allow it the one
         sanctioned block blink so it does not read as frozen. It deliberately does not take it: that
         step states a fact rather than moves something, and a brightness blink on a block that is only
         being pointed at reads as traffic that never arrives.
         The ownership is a BALL, not a static undirected line hanging under the Pod: the claim is
         stamped with its ownerReference at the moment it is created, so the tag rides down and the
         claim comes up to full on its arrival. The Pod is the sender and is still Pending, so on
         `mint` it blinks from its dim shade (0.55 to 0.95) and the ball leaves at `BEAT.afterPulse`.
         The claim defaults to OPACITY.pending rather than to 0: it is the middle block of a
         three-block row, and cutting it out leaves a hole in that row rather than an absence.
         Every chip, the claim sublabel and the `owner` wire turn over on the arrival that earns them,
         with `rewind` holding the old value until then: the claim chip and `owned by Pod` on `own`
         (the placeholder reads `not created yet`, since no ownerReference exists before it), the
         backing on `create`, the claim Bound on `low`, the Pod Running on `high`, and on `gc` the Pod
         chip as its fade starts, `cascade delete` as the cascade leaves at `GC_SEND`, the claim on
         `gcHigh` and the disk and the lifetime on `gcLow`.
         The `backing` chip names what backs the volume on every step, so it reads
         `real disk, fast-ssd` from `create` until `gc` and never a mount path: the mount is carried
         by the Pod chip, the `/scratch` tag and the `attach and mount` caption.
         On `mount` the Pod pulses whole on the arrival of `high` and nothing inside it lights.
         THE DELETED POD BLINKS BEFORE IT GOES (`M-08`). On gc the pulse stands alone at 0 and the Pod
         fade waits `BEAT.afterPulse`, so the blink is over before the shade moves, and the cascade
         leaves at `GC_SEND` 1600, a `BEAT.afterHop` after the Pod has finished going rather than while
         it is still fading. Measured span 3800 against a duration of 4200, so the beat costs nothing.
         The cascade rides the down lanes only, and each lane's fade hangs off the same moment as the
         block that ends it, so the column collapses lane by lane behind the ball.
WIRE LABELS
         Every tag lives exactly as long as its ball (`M-30a`), and every ball rides `routeDur` with
         no explicit dur: the column hops sit on the 700 floor and `W_CREATE` takes 816. The three
         column tags ride outside the column on their own lane's side, 24 off its face and 14 above
         their ball, so none crosses the other lane: `ownerReference` and `ownerReference GC` right,
         `/scratch` left. Measured every animation frame at the three viewports, at rest the nearest
         ink is 8.2 (`ownerReference GC` landing, against `cascade delete`, which ends at x 732.5 at
         1600x1000 and is widest there) and 10.9 (above the provisioner top), and `/scratch` starts at
         x 411, 14.4 right of the panel edge at 1100x800. In flight no tag touches a block or a
         caption. `CreateVolume` rides
         16 under its ball and 45 right of it: 5.5 under the provisioner floor as it leaves and 7.2
         short of the PV face as it lands. `storageClassName: fast-ssd` rides 3 above the row, 2.9
         at the worst viewport.
CONTENT  Read against the Ephemeral Volumes concept page at the card's k8sVersion.
         CREATOR: `the ephemeral volume controller turns that inline template into a real PVC`.
         The page says "the ephemeral volume controller then creates an actual
         PersistentVolumeClaim object in the same namespace as the Pod". A bare `becomes a real
         PVC` beside a ball leaving a blinking Pod credits the Pod, and `the Pod that spawned it`
         is rejected for the same reason. The controller is narrated and not drawn.
         NAME: `app-0-scratch`, "a combination of the Pod name and volume name, with a hyphen".
         FEATURES: `snapshotted, cloned or resized if the driver allows`. The page qualifies them
         as "supported assuming that the driver supports them", so `on any driver` with no
         qualifier is rejected.
         BIND: `The claim binds to the new PV, then the volume is attached and mounted` on `mount`,
         because the claim turns Bound on that step's first arrival. A mount narration that never
         names the bind leaves that turnover unexplained.
         SECURITY: `because a controller creates it from the Pod, anyone who can create a Pod can
         create a claim, even without the right to create one directly`, after "allows users to
         create PVCs indirectly if they can create Pods, even if they do not have permission to
         create PVCs directly". `It also means` is rejected: it made the ownerReference the cause.
         `the way a container belongs to it` is rejected: the claim is a separate object that
         the garbage collector removes, not part of the Pod spec.
         GC: "When the Pod is deleted, the Kubernetes garbage collector deletes the PVC, which then
         usually triggers deletion of the volume because the default reclaim policy of storage
         classes is to delete volumes", and a class set to Retain leaves the storage outliving the
         Pod. The data lives `only as long as the Pod`. `exactly as long` and, in the aria-label,
         `the moment the Pod is deleted` are rejected: collection runs after the delete, not with it.
         FIELD: the wire quotes `ownerReferences: Pod app-0`, the plural list field
         metadata.ownerReferences. `ownerReference` stays the concept name in prose and on tags.
WHY NOT  Hanging the ownerReference, the Bound link and the class reference as static dashed strokes:
         that puts three arrow-shaped things on the card that never fire, and forces all the real
         traffic 12 units off the block centre lines to get around them. Each of those three facts is
         carried by something that moves or by text that stays:
           ownerReference  a ball down the column on the step where the claim is created, stamping it,
                           plus the claim sublabel (owned by Pod), the caption beside the column, and
                           the lifetime chip. The same lane carries the cascade on the way out.
           Bound           the claim sublabel flips to Bound and the chip says so.
           the class       the ball out to the provisioner carries storageClassName: fast-ssd, which is
                           the field itself, and the class block lights as it is read.
         One shared axis for the up and down lanes, hidden on the steps that do not ride them: every
         lane stands at full while both its ends stand, so both directions are drawn at once, and on
         one axis that stacks two arrowheads on one line.
         A column tag beside the lane: the hop is 72 long between two blocks 232 wide on the same
         axis, so no offset inside that width leaves a tag clear of both at rest. It starts inside
         the Pod over its sublabel or ends inside the claim, and a late fade in is not a tag from
         departure.
DO NOT   Give the owner step the sanctioned block blink (see MOTION).
NOT A DEFECT
         `deadair.mjs` ranks `owner` 733 of 767 for stillness, all 3000 still, at an ordinary 10.91
         ms per character: it is a reading step with no motion by design (see MOTION).
```
