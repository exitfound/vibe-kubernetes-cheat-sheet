## storage-pvc-protection

### layout

```
WHAT     Why a deleted PVC does not go away.
LAYOUT   The centred vertical stack, with the spine drawn as the mount ASCENT, the same single arrowed
         axis storage-pvc-binding uses: balls really travel it, so the arrowheads are earned and
         nothing here is a headless relationship.
         The two actors that drive the delete sit ONE ON EACH SIDE of the spine, placed so that every
         lane is a straight run or a single right angle: no dog-leg anywhere and no lane turns twice.
         The two forces of the card, the request to delete and the release that finally allows it,
         then reach the claim from opposite sides, which is the composition saying what the narration
         says. kubectl sits at the claim tier, which makes the delete-PVC lane a straight horizontal
         and leaves the Pod lane as the only turning one.
         The readout is a four-chip strip over the card's own width, derived rather than hand-placed,
         so it is concentric with the stack.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 180.12..254.66 at 1100x800, the deepest reading on `delete-request`, with
         `finalizer-removed` next at 229.82:
         `OVERLAY_IDS=storage-pvc-protection node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The verdict caption beside the claim is anchored end at x=468 and runs back to about 321 on
         its longest string, and it sits BELOW the claim (y=330) rather than level with it, because
         the controller's lane occupies the claim's mid height on that side. The caption at 330 and
         the controller at 392 clear the deepest reading, 254.66, by 75 and 137, and the caption INK
         (its top at about 319) by 64.3. LENGTHENING ANY
         NARRATION SPENDS THIS: re-measure, or move the caption back to the right of the axis.
SIZES    Every actor (the claim, kubectl delete, the protection controller) is 232 by 80 and the Pod
         232 by 104 around a 192 by 44 app box (NET.L-01). The tier midpoints stay on the 162 pitch,
         and the controller mirrors kubectl about the spine. `DEL_TAG_DY` and `RM_TAG_DY` are both
         the half box height plus 4, -44, the least that keeps a tag riding at PVC_MID off the box
         tops at either end of its lane.
         The four chips are NOT one width: the first carries both the longest name and the longest
         value (deletionTimestamp against `gone with object`), and at a shared 252 those two meet
         with one unit to spare, a collision on any re-measure or font change. It takes 312 and the
         other three give it back.
LANES    The pair into the claim BOTH land dead centre on their face, at PVC_MID exactly: the two are
         never on stage together (kubectl only on the delete step, the controller only on the release
         step), and an arrow arriving off centre reads as aimed at a corner of the block instead of at
         the block.
         Both actors appear only on the steps they act on, so the frame reads as the centred stack
         plus one visitor rather than a permanent crowd.
MOTION   There is deliberately NO block blink. The sanctioned one exists so a step with no packet and
         no Pod does not read frozen, and no step here is in that position. The finalizer-holds step
         carries the MOUNT ball instead, which is both real traffic and the actual point being made:
         the claim is still mounted, which is exactly why it cannot go.
         On the delete step the order is down-arrow and the Pod is the one thing allowed to pulse:
         the ball lands, the Pod BLINKS to acknowledge, and only once that blink has landed does it
         start to go.
         THE CONSUMER COUNT is bound to the Pod's fade COMPLETION (2127), not to the delete arrival
         (827) and not to step entry (`P-03`). Measured on the animated path: at 2047 the Pod still
         stands at 0.34 and the chip still reads 1 Pod, and both reach their end together. The claim
         loses its last consumer when the Pod has actually gone, so a chip reading 0 Pods over a Pod at
         full or half strength is the one frame this step must not have.
WIRE LABELS
         The two captions take one side of the axis each, so neither can be mistaken for the other's
         lane. The VERDICT caption reports the state of the CLAIM, not of any lane, and it changes
         kind across the card (a binding, then a block on removal, then a removal), so it is named for
         its JOB and sits hard against the claim.
         `MOUNT_TAG`: the mount ascent is 70 units from the claim top to the Pod floor, less than a
         12-tall tag needs to ride it without starting in one box or ending in the other. Centred at
         -14 the `/data` tag sits inside the Pod on the `volumes: data-claim` sublabel for 520ms. So
         both tagged ascents (`/data`, `writes continue`) TRAIL the ball, 20 under it and left of
         the lane, away from the mount caption on its right (dx -24 and -54), so each lands in the
         gap under the Pod floor and lives exactly as long as its ball (M-30a). Trailing, each would
         start inside the claim, so it emerges 600 into the leg, once clear of the claim top. Both
         balls ride `MOUNT_DUR` 1500 rather than the 700 floor so the tag is readable: measured every
         25ms at the three viewports, neither touches a block, a caption or a lane.
         `DEL_POD_TAG_DX` 57: centred on the Pod delete, `delete pod web-0` parks half over the Pod
         right face and the app box for 480ms. Beside the ball it rides right of kubectl's column and
         ends 8 short of the Pod.
         The three request tags (`deletionTimestamp set`, `delete pod web-0`, `finalizers: []`) ride
         the card-local `rideTag` at inMs = outMs = 200 and hold 0 (M-30a), not the kit default that
         held each 160ms past its ball. Sampled every 25ms at 1600x1000 and 1100x800, none touches a
         block, a caption or a lane, and the two claim-lane tags end 1.4 above the claim top.
CONTENT  1. The finalizer is put on the claim WHEN THE CLAIM IS CREATED, not when a Pod picks it up.
         The StorageObjectInUseProtection admission plugin, on by default, appends
         kubernetes.io/pvc-protection on Create (`admission.NewHandler(admission.Create)`), and the
         pvc-protection controller only backfills a claim that lacks it ("finalizer should be added by
         admission plugin, this is just to add the finalizer to old PVCs"). What being in use changes
         is the REMOVAL: the controller refuses to take the finalizer off while a Pod still uses the
         claim. "The controller adds it to every PVC" is rejected as the wrong owner.
         2. status.phase NEVER becomes Terminating. A PVC phase is Pending, Bound or Lost. What
         prints Terminating is the Table printer (pkg/printers/internalversion, `phase =
         "Terminating"`), which the API server itself serves through the PVC TableConvertor, and
         kubectl describe does the same swap client side, whenever deletionTimestamp is non-nil. So
         "only kubectl prints Terminating" is rejected as a false absolute on the wrong owner: the
         desc and the aria-label say Terminating is only a display. So the object under a stuck delete is still phase
         Bound, and the word the user is staring at in the STATUS column is a display convention
         rather than a field. That gap IS the card: the reason a stuck PVC is confusing is that its
         status looks like a state it is not in. The claim sublabel reads `phase Bound` and, from the
         delete on, `phase Bound, deleting`, and a chip reports what kubectl shows next to it.
         3. What finally removes the object is the API SERVER, not the garbage collector. The GC
         walks ownerReferences to delete dependents; a finalizer is settled in the API server itself,
         where a deletionTimestamp plus an empty finalizers list completes the outstanding delete.
         It completes it INSIDE the update that empties the list: `ShouldDeleteDuringUpdate` in the
         generic registry store sees no finalizers on an object that already has a
         deletionTimestamp and calls `deleteWithoutFinalizers` in the same request. So
         finalizer-removed and gone are ONE request split in two for teaching, and the settled frame
         of finalizer-removed (finalizers none, kubectl still showing Terminating) is never stored.
         The gone narration opens "The moment the finalizers list is empty" for that reason. "With
         a deletionTimestamp set and an empty finalizers list, the API server completes the delete"
         is rejected because it reads as a later, separate event. The controller writes the removal
         with an Update, not a patch, so the narration says it "removes" the finalizer.
         4. A CONSUMER is a Pod OBJECT, not a mount. `podUsesPVC` counts any Pod with spec.nodeName
         set whose volumes name the claim, whatever its phase, so a finished Pod whose object is kept
         pins the claim after the kubelet has unmounted it. The pod-gone narration therefore says "it
         finishes and its Pod object is removed", and the desc says "while a Pod using the claim still
         exists". "While a Pod still mounts the claim" and "finishes and is cleaned up" are rejected.
         5. A NEW Pod naming a deleting claim is blocked by the SCHEDULER, not refused by the API:
         the volumebinding plugin returns "persistentvolumeclaim %q is being deleted" as
         UnschedulableAndUnresolvable, so the Pod object exists and stays Pending. The why narration
         says "left unschedulable, stuck in Pending". "Is refused and will not start" is rejected.
         6. `kubectl delete` WAITS by default: `--wait` defaults to true, "If true, wait for resources
         to be gone before returning. This waits for finalizers" (the kubectl delete reference and
         delete_flags.go), and delete.go prints the `deleted` line BEFORE it runs the wait. So on a
         protected claim the terminal reports deleted and then hangs, which the delete-request
         narration says, and finalizer-removed says the hanging command is about to return. It is
         also what fills those two steps: both stood about three quarters still at 13.6 and 14.0 ms
         per character, and with the true detail they read at 9.5 and 10.1.
         7. What the finalizer guards is the Pod USING the claim, so the in-use narration says "The
         Pod using that mount is what the finalizer is guarding". "That live mount is the thing the
         finalizer is guarding" is rejected by point 4: a mount with no Pod object guards nothing.
         8. "Only the last consuming Pod leaving frees it" in the desc is kept as the card's lesson,
         with its counter-case named here: an administrator can patch the finalizer off by hand,
         which frees the claim under a running Pod and is exactly what the protection exists to
         stop. The desc has no room for that clause without losing one it needs, and the fix it
         teaches, finding the Pod, is the safe one.
         Read against 1.35: pvc_protection_controller.go, storageobjectinuseprotection/admission.go,
         volume_binding.go, registry/generic/registry/store.go, printers.go and the PVC storage.go.
NAMING   The lowercase pvc-protection in the finalizers chip and the narration is not a lapse from the
         capitalized block labels: it is the literal finalizer string kubernetes.io/pvc-protection,
         spelled as the API spells it.
NOTE     deletionTimestamp and the kubectl column sit next to each other in the chip strip on
         purpose: the second is a DISPLAY of the first, and seeing them light together is the lesson.
WHY NOT  Stacking both actors in ONE right-hand column, kubectl at the Pod tier and the controller
         below the claim: that puts every block in 480..1070, centre 775, with the whole left half
         below the panel empty. kubectl cannot move left, because it sits in the panel's y band. The
         controller can, because its tier (392..472) is well below the panel floor of 230, so it
         takes the left column and the content spans 118..1082, centre 600.
         Splitting the pair into the claim by a lane gap, the usual way to keep two routes from
         overlapping: the two are never on stage together, so the gap buys nothing and costs the
         dead-centre landing.
         Binding the consumer count to the delete arrival at 813, which is where the tag and the pulse
         already are: the Pod is alive for the whole 1300ms that follows, mount and all, and the
         mount lane only leaves at 2113 with it. The count would then contradict the picture beside
         it for longer than it agreed with it.
DO NOT   Say the finalizer appears "the moment a Pod started using it": that invents a trigger that
         does not exist and makes standing protection sound reactive.
         Light the app box on in-use, finalizer-holds or why. The Pod pulses on all three, and a lit
         container outlives the blink as a separate bright rectangle (STO.C-02): the pulse is the
         Pod's whole cue, the claim is the only receiver that lights.
         Park the verdict caption beside the lower lane: it then reads as that lane's name, which it
         never is.
         Brighten the claim on the finalizer-holds step: that puts a blink on infrastructure for no
         reason.
         Fade the Pod straight from the delete arrival: that skips the acknowledgement, and the Pod
         dimming under an arriving ball reads as the ball erasing it.
         Strip `unlight` from the card's `removeAt` on the grounds that nothing is lit at any of its
         four call sites. That is true (`web` and `lMountHigh` fade under `lit: ['kubectl']`, and the
         closing step lights nothing at all) and it is not the point: `unlight` is what DECLARES the
         `onfinish` handler on the fade, and a frozen probe never fires one, so the flag is the only
         way the handler is visible at all. Dropping it changes what a WAAPI dump records for the
         step, since `onfinish` is a per-animation flag, and silently removes the guard the day one
         of those blocks IS lit when it goes.
NOT A DEFECT
         `report/arrival.test.mjs` prints R2-ENTRY `NO CUE IN STEP` on step 6 for `consumers`, CARRIED in
         `test/fixtures/carried.mjs`. It is the frozen-sampling artefact: pod-gone winds the chip back to
         `1 Pod` in `rewind` and turns it to `0 Pods` with a cued F.set when the Pod fade finishes, so a
         t=0 frame first sees the turnover one step late. R2-STEP, settled against settled, lists nothing.
         On the animated path the chip is also DARK while it reads `1 Pod`: `unlightRewound` in
         lib/step-spec.js takes the static cue off any chip `rewind` winds back, so the highlight
         arrives with `0 Pods` on the `gone` F.set and not at step entry (P-09a).
```
