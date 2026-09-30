## storage-pvc-binding

### layout

```
WHAT     A claim, three candidate volumes, and the controller that matches them. The identity column
         Pod -> PVC -> PV x73a shares one centred spine, because binding is what fuses those three
         into one chain.
PANEL    Measured bottom lo..hi per viewport: 107.67..160.00 at 1600x1000, 128.92..192.67 at
         1280x860, 155.28..254.66 at 1100x800, the deepest reading on the `exclusive` step:
         `OVERLAY_IDS=storage-pvc-binding node --test report/overlay.test.mjs` from `scheme/test/`.
         The panel owns the top-left band and every block clears it. The top band (the Pod at y 56,
         the claim at 230, the binding controller and the second claim) starts at x 484 or right of
         it, so none of it meets the panel at any depth. The first thing left of x 420 is the small
         PV cylinder on the shelf at PV_Y 384 (x 180..380), 129 below the deepest reading.
SIZES    Every actor is 232 by 80 (NET.L-01): the claim, the second claim and the binding controller.
         The Pod is 232 by 104 around a 192 by 44 app box. The three PV cylinders keep their own
         200 / 230 / 200, since a disk glyph is not an actor block.
         The second claim stands `DENY_LEN` 66 above the controller, so the deny tag at mid flight
         rides under the claim it denies rather than inside it.
LANES    The spine is a SINGLE dead-centre lane, the mount ascent (the volume rising PV -> PVC -> Pod),
         and the only vertical the tops of the Pod and the centre cylinder touch.
         The binding controller's vertical centre is aligned with the PVC, so the watch and the bind
         write are STRAIGHT horizontal hops, no zigzag.
         Crucially the controller scans the shelf FROM BELOW: the probe wraps down its outer edge
         (clear of PV b22), runs a bus under the whole shelf, and rises into each cylinder BOTTOM.
         That keeps every probe off the cylinder tops, so a ball never travels underneath a box.
MOTION   The opening step is deliberately motionless and must STAY that way. The claim is a statement
         of need, nothing acts: the Pod does not pulse (it is the subject being blocked, not an actor)
         and the PVC takes a static .highlight only. A block flash would be canon-legal there
         (packet-less and Pod-less) and is wrong, it reads as the PVC doing something when it is not.
         All three probes leave the controller TOGETHER: the scan is one sweep of the shelf, not a
         queue, and the simultaneous fan-out is the whole read of that step. They land at their own
         pace (1196 / 1907 / 2600 ms for slow / match / small) because routeDur normalizes speed and
         the routes are very different lengths.
         The Pod stays dim until the volume actually reaches it, so `rewind` re-dims it on the
         animated path and the fade carries it back to the 1 the step's own `opacity` pins. Without
         that the Pod sits at full and snaps BACK to 0.5 the instant the animation becomes active.
WIRE LABELS
         `WATCH_TAG_DY` -34: the watch lane runs between the claim and the controller at their shared
         mid height, so a centred tag is cut by one box face or the other for the whole 800ms
         flight. It is derived as the lane's 28 below the 80-tall box tops plus 6 of clearance, and
         clears both tops on all three viewports.
         `WRITE_TAG_DY` +41: the bind write runs one lane lower, and the same fix above it would need
         -58 and cross the watch lane. So `volumeName: x73a` rides UNDER both box floors instead, the
         lane's 28 above them plus 13, which leaves 4 of clearance and puts each tag on the far side
         of its own lane. Centred at -14 it sat on both box faces for 800ms.
         `claimRef: data-claim` leaves the controller right face and drops past its corner, so above
         the ball it is born over the controller and its label: it fades in on `REF_EMERGE` 420, and
         fades on a hold of -520, so it is gone by the corner where the ball turns up the 50 unit rise
         into the cylinder floor. At -380 it was still at 0.93 on that corner and rode the rise across
         its own lane. Sampled in real time at 1600x1000, it is at full from about 780ms to 1560ms.
         The mount ascent (70 units, claim top to Pod floor) and the deny hop (66, controller top to
         the second claim floor) are shorter than a tag needs to ride without starting in one box or
         ending in the other. Both ride `LEG_DUR` 1500, the catalog pace for a tagged ball, and each
         tag TRAILS its ball, under it and beside the lane, so it lands in the gap and lives exactly
         as long as its ball (M-30a). Trailing, it would start inside the box the ball leaves, so it
         emerges once clear of it: `/data` 24 left and 20 under the ball, left of the lane and away
         from the mount caption, emerging 600 in, measured every 25ms at the three viewports and
         touching no block, caption or lane. `event: ProvisioningFailed` rides 92 left and 14 under
         the deny ball, emerging 540 in: at the 68 its 19-character predecessor used, the longer
         string ran into its own lane. Checked on the mid-flight frames at the three viewports, not
         by the 25ms sweep.
CONTENT  The `binding` chip turns over on the probe arrival, not at t=0, on the one card whose whole
         subject is that the decision is made by scanning. So `rewind` rolls it back to `none` for
         the animated path and the turnover rides the arrival that lights the winning cylinder. This
         is the one card in the category mixing the two chip writers: `chips` (`setVal`) for the
         roll-back, `chipsCued` (`setChip`) for the turnover, so the highlight fires on the verdict
         rather than on the reset. The three wire verdicts turn over on their own probe arrivals.
         The `bind` step does the same on three chips, and each waits for a DIFFERENT ball
         (`P-04`), in the order the controller saves them (`bind` in pv_controller.go, "Volume is
         saved first"): the volume turns Bound on the claimRef arrival (`toVolume`, 1907ms), and the
         volumeName write leaves only after it, so the claim plus the `binding` pair turn over on
         that second arrival (`toClaim`, 2707ms), the moment the pairing exists on both objects.
         The deny ball on `exclusive` is an Event, not a write. A claim WITH a class and no matching
         volume takes the provisioning branch of `syncUnboundClaim`, and `kubernetes.io/no-provisioner`
         fails there as a Warning `ProvisioningFailed`. `FailedBinding` is the no-class branch and is
         wrong for this claim.
         The classes are `fast` and `slow`, never `local-*`: a local-volume class is recommended
         WaitForFirstConsumer, which moves binding after scheduling and contradicts this spine.
         Claims read against 1.35, sources: the cited Persistent Volumes page (Binding), the Storage
         Classes page (volume binding mode, local volumes), and upstream `pv_controller.go`,
         `pv_helpers.go` FindMatchingVolume and the scheduler `volume_binding.go` where the docs are
         silent.
         `once made it is exclusive` ships, `lasts as long as the claim does` is rejected: the Binding
         section says "Once bound, PersistentVolumeClaim binds are exclusive, regardless of how they
         were bound", and a deleted claim leaves its claimRef on a Released volume, which is what
         `storage-reclaim-policy` and `storage-pv-lifecycle-phases` draw. The desc says `exclusive`
         for the same reason, never `while the claim exists`.
         The desc keeps `with no dynamic provisioner behind the class` on the second claim: with a dynamic
         provisioner the class would build it a volume, so the bare `stays Pending` is false.
         `Under the default Immediate binding mode` on the claim step is kept: the scheduler blocks
         a Pod on "pod has unbound immediate PersistentVolumeClaims" only, and under
         WaitForFirstConsumer the Pod is placed FIRST. The Storage Classes page: "When unset,
         `Immediate` mode is used by default."
         `the three things this claim asks for` ships, `the three things it has to satisfy` is
         rejected: FindMatchingVolume also filters phase, volumeMode, selector, class and node
         affinity, and this claim sets only three of them.
         `no dynamic provisioner` ships, bare `no provisioner` is rejected: `provisioner` is a
         required StorageClass field, and a pre-created class names `kubernetes.io/no-provisioner`.
         Verified and unchanged: the controller watches every claim, `at least` 5Gi ("the user will
         always get at least what they asked for"), the one to one ClaimRef mapping, and "Claims will
         remain unbound indefinitely if a matching volume does not exist".
         `mounts it for the Pod, and the container starts with it at /data` ships on `mount`, and
         `mounts it at /data inside the container` is rejected: Kubelet mounts the volume for the
         Pod and the runtime bind-mounts it into the container, which is how
         `storage-csi-attach-mount` and `storage-hostpath` draw the same hop.
         The desc opens on `who hands it a real volume`, and `who turns it into a real disk` is
         rejected: this controller pairs a claim with a volume that already exists, and building a
         disk is `storage-dynamic-provisioning`. The desc says `no dynamic provisioner` for the same
         reason the narration does, and `a second claim like it` rather than `a second claim for that
         volume`, since the claim asks for capacity, mode and class, never for PV x73a by name. The
         aria-label says `asking for the same thing` on the same ruling.
NOTE     A disk is a cylinder plus its spec line, wrapped in a g so dimming a rejected volume fades the
         spec WITH it. The cylinder is returned separately because .highlight must sit on the
         .scheme-cylinder element itself, not on the wrapper.
         Each disk states all THREE things the claim is matched on (capacity, access mode, class), so
         a viewer can verify the verdict the match step narrates instead of taking it on trust. Access
         mode is identical on all three on purpose: the two rejections must turn on size and class
         only.
DO NOT   Add headless relationship lines beside the spine: the centre then reads as a crowded pair
         rather than as one clean arrowed axis.
         Leave appBox out of `reset.keys`. A highlight set during a reduced replay leaks forward,
         because replay never runs the motion path that would re-clear it. The disk OPACITIES and the
         two late-appearing elements are a different mechanism and must not be moved here: `reset`
         takes back CLASSES, not inline styles, so those SIX are pinned on EVERY step through the
         `opacity` field instead (`STO.S-01`). Two lane keys are pinned the same way: a branch whose
         far end is a ghost dims with it, or the arrowhead lands at full strength on nothing.
         Stagger the three probes to make the verdicts resolve in narration order: that turns one
         sweep into three separate errands.
         Set the `binding` chip at t=0: it then names `candidate PV x73a` from the first frame,
         between 1.2 and 2.6s before the sweep that decides it has run (the three arrivals, 1196 to
         2600). Nor set the three `bind` chips at t=0: that states them up to 2.7s before the write
         that earns them.
NOT A DEFECT
         `report/arrival.test.mjs` prints three R2-ENTRY `NO CUE IN STEP` rows on step 5 (`PVC`,
         `PV x73a`, `binding`), CARRIED in `test/fixtures/carried.mjs`. They are the frozen-sampling
         artefact: bind winds all three back in `rewind` and turns each over with a cued F.set on the write
         that earns it, so a t=0 frame first sees the turnover one step late. R2-STEP lists nothing.
```
