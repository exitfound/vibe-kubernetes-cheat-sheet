## storage-volumeattachment

### layout

```
WHAT     WHO owns the attach. Not the Pod, not kubelet: the attach and detach controller inside
         kube-controller-manager writes a VolumeAttachment, the external-attacher watches it and
         calls ControllerPublishVolume, and on success stamps status.attached true back onto the same
         object. Kubelet waits for the attach to be reported and checks that field before the mount,
         and DELETING the object is what triggers detach. So the composition puts the whole control-plane chain in ONE column and the
         node in the other: every arrow crossing between them is a read or a write of the object.
LAYOUT   The usable area is an L and this card uses the L: the top band (y 24..420) is held to
         x>=400, the bottom-left corner below the panel takes the disk, and the chip strip spans the full
         content band, so the widest tier is the canvas-centred one.
         Moving the disk out from under the columns is not only a space fix: the disk is REMOTE
         storage that has to be attached to a node, and drawing it directly beneath node-1 quietly
         says it is already local to it. Off in its own corner, with a long ControllerPublish call
         reaching across the whole card, the picture says what the narration says.
         node-1 is a real node() frame rather than left implicit, because `this disk is on THAT node`
         is the whole claim the VolumeAttachment makes.
         Read top to bottom, the control-plane column is the CAUSAL order: the controller decides, the
         object records, the attacher acts. Its bottom edge is pinned to the node frame's, so the two
         columns are one band, and the ROW GAP is SOLVED, not typed: three equal blocks spread across
         the frame's exact vertical span, so changing BOX_H re-solves the column rather than stranding
         a row.
PANEL    Measured bottom lo..hi per viewport: 142.56..177.44 at 1600x1000, 171.42..213.92 at
         1280x860, 204.97..254.66 at 1100x800, the deepest reading on the `detach` step:
         `OVERLAY_IDS=storage-volumeattachment node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The panel is a rectangle over the TOP-LEFT quadrant only. At the 900x650 hand row it
         reaches right 398.3 and bottom 405.5, on `detach` (374.7 on `decide` and `attach`, 343.9 on
         `write`, `status` and `mount`). `mount` is held to 343.9 there by its length: at 321
         characters it wrapped to the `detach` depth and covered the `attached to Node-1` caption. Over the standard viewports the disk at DISK_Y 400 clears the deepest reading by 145
         and its caption at 386 by 131. At 900x650 `detach` covers both: the disk top sits 5.5
         inside the panel and the disk caption ink (y 375.4..389) lies under it, reading
         `attached to Node-1, mounted at /data` (x 218.9..339.5) until the unpublish lands. A
         longer narration moves these numbers.
SIZES    Every actor block is 232 by 80 and the Pod 232 by 104 around a 192 by 44 app box 26 under
         the Pod label (NET.L-01). The widest string in a box, measured after fonts.ready at
         1100x800, is the label `Attach/Detach controller` at 148.5, 41.8 either side, then the
         sublabel `watches VolumeAttachment` at 147.2.
         LEFT_X is the panel wall: 398 measured, 400 taken, and it cannot move left.
         The Pod and Kubelet stack on one centre line at one width, 232, so their edges agree. Kubelet
         sits 20 above the node frame foot (KUBE_Y derived from it, 320..400), and the right column's
         three rows share the frame height, 78 apart.
         DISK 200x114 rather than 152x96: it is the only object on its side and carries that side on
         its own. DISK_Y 400 clears the deepest standard reading (254.66, `detach` at 1100x800) by 145
         and its caption at 386 by 131. At 900x650 `detach` reaches 405.5, so the disk top sits 5.5
         under the panel and the disk caption lies under it too (PANEL). That caption
         goes ABOVE the disk, because below is where the ControllerPublish lane runs and under that is
         the chip strip.
         ONE width for all four chips, the strip spanning CONTENT_L..CONTENT_R. Worst cases at 6.89
         per character with the 24 unit inset:
           status.attached 103.4 + `no object` 62.0 = 189.4   <- the binding one
           VolumeAttachment 110.3 + `deleted` 48.2 = 182.5
           disk on Node-1 96.5 + `yes` 20.7 = 141.2           Kubelet 48.2 + `unmounted` 62.0 = 134.2
         CHIP_W falls out at 258. The FLOOR is what matters: below ~190 the longest name and value
         touch.
LANES    Each direction of the VolumeAttachment conversation gets its OWN lane, so the status write
         never rides the arrow the watch came down. The wider column lets LANE be 40 rather than 26,
         which is what makes the two read as two lanes at a glance.
         The publish call runs the whole width of the card, which is the point: the attacher is
         talking to a backend nowhere near the node. Its horizontal leg hangs BELOW the disk, because
         above it there is no room (the disk cap is at 400, both columns end at 420, so a lane between
         them is drawn through the node frame). A ridingLabel sits 14 above its ball, so
         `ControllerUnpublish` rides at 532, 18 clear of the disk face and 60 clear of the chip strip,
         derived from DISK_BOTTOM so the lane follows the disk if the disk moves.
         W_GATE is the ONLY lane crossing the corridor: the object gating the node. Both lanes that
         reach Kubelet stop on the NODE FRAME rather than on its box: W_GATE on the right face at
         (700, 360), level with the Kubelet centre, and W_ONNODE on the floor at (550, 420), under it.
         The right-face endpoint is off that face's midpoint (222) and legal by the frame clause of
         `L-11`, which lets a frame endpoint sit level with the block inside it that the lane
         addresses. The card has ZERO wire crossings. The receiver cue stays on Kubelet.
         Only two static wire captions, both where there is measured room: the write caption anchored
         12 right of the W_WRITE lane with 138 units (20 characters at 6.89), which is why the tag
         riding that lane is offset (WIRE LABELS below), and the disk caption
         centred in the empty strip above it, longest string 241 units spanning 110..350. Everything
         else is carried by a ridingLabel, because the inter-row gaps in the control column cannot
         hold a static caption without it landing on a lane arrowhead.
MOTION   The VolumeAttachment is BORN MID-STORY but its SLOT is drawn the whole time, at
         OPACITY.pending with the sublabel `not created yet`: at full it would contradict the
         narration, at zero it leaves a block-sized hole in the middle of the control column. Its four
         lanes stand at full on every step, into the pending slot and into the terminated one alike,
         because a lane is never opacity-dimmed to match a dim end. The one lane that leaves is the
         MOUNT lane, which belongs to the POD: when the Pod goes to 0, an arrowhead aimed at empty
         canvas reads as traffic to a block the reader has failed to spot (`A-14`).
         The disk stays on canvas and at FULL after the detach, because it still exists in the backend
         and detached is the state the card OPENED on: `idle` draws it at full under `not attached to
         any node`, so a dimmed disk under `detached from Node-1` would draw one state two ways. The
         caption and the device chip carry the change, and the unpublish arrival lights it.
         The FIRST step has NO pulse, deliberately. The step is not ABOUT the Pod, it is about who
         owns the decision.
         The attach step is three chained hops and the middle one crosses the whole card: routeDur is
         length-based, so the 952 unit publish call runs 2116ms alone and the span is 4276. Duration
         4800 is not taste: below 4276 the auto-advance cuts the call off before it reaches the disk.
         The detach step is FIVE beats, span 5576 against a duration of 5900.
         The App box is never given a .highlight: the blink is the whole signal and must end with it.
         va-7f is lit from entry as the SOURCE of the watch but does not KEEP that light once it is
         gone: the class comes off when the fade to the terminated shade finishes, so the static path
         has nothing to mirror. `render/opacity.test.mjs` LIT reads inline style on the played path
         only, so it sees neither version, which is why the answer is written down. Same shape as
         removeAt (storage-reclaim-policy) and vanish (storage-pvc-retention-policy).
         EVERY VALUE A STEP CHANGES WAITS FOR THE ARRIVAL THAT EARNS IT (`P-03`, `P-04`), wound back
         in `rewind` and turned over by an F.set: on `write` the name, the field and the state line at
         the create arrival (1500), with the object coming up from the pending shade to full on the
         same arrival (`F.reveal`); on `attach` the device chip at `land`; on `status` the field and
         the state line at `status` (700); on `mount` the Kubelet chip and the disk caption at `mount`;
         on `detach` the Kubelet chip at `gone` (1300, the Pod fade ending) and the object, the field,
         the device chip, the state line and the disk caption at `call` (5016). A value standing at
         entry would print the outcome under a ball still carrying it.
         EVERY BALL LIGHTS THE BLOCK IT LANDS ON, the last hop of a step included. On `attach` the
         third hop lights Kubelet as the RECEIVER of the device at 3716 and turns the DEVICE chip over
         on the same arrival, while the Kubelet chip stays `blocked`: the chip says it may not mount,
         the light says the device reached it. On `detach` the unpublish lights the disk at 5016.
         THE DELETED POD BLINKS BEFORE IT GOES (`M-08`). On detach the pulse stands alone at 0 and the
         Pod fade waits `BEAT.afterPulse`, its mount lane on the same beat because a lane goes with the
         block on the end of it (`STO.S-02`). The fade is named `gone` and ends at 1300, and the
         delete leaves on it, because the narration says the controller deletes the object once the
         Pod is gone: at `BEAT.lead` the ball would be in flight while the Pod is still fading.
WIRE LABELS
         THE WRITE TAG RIDES 46 UNITS LEFT OF ITS LANE (`WRITE_TAG_DX`), and the number comes off the
         caption beside it. `vol-1 on Node-1` is 90.4 units wide and anchored middle on the lane at
         x=1024, so at dx 0 it spans 978.8..1069.2 and runs over the static `create` caption at
         1036..1077.3, y 134.8..149.4: about 200ms of glyph on glyph, from the moment the tag crosses
         y=121.9 (measured at 1600x1000 with `__toRoot`). At dx -46 it spans 932.8..1023.2 and clears
         the caption by 12.8. The rect is the SAME at 1100x800: a tag is viewBox geometry and does not
         move with the viewport, so the overlap is not viewport-specific. Only the `write` step needs
         the offset, because the caption is blank on `detach`, where the same lane carries `delete
         va-7f`.
         `DRIVER_TAG_DY` 22: the publish lane leaves the attacher floor at 420 and enters the disk at
         514, so a tag riding the family -14 is cut by both faces for 200ms and sits inside the
         attacher for 600ms more. Measured on the four viewports, the clear band below the ball is
         12..42, and 22 is taken rather than the minimum because at 12 the ink starts 4 units from the
         ball centre and the ball prints on the line.
         The four tags on the right column (`vol-1 on Node-1`, `delete va-7f`, `deletion mark` and
         `attached: true`) cannot be fixed by an offset at all, and are not fixed by one. Those lanes
         are 78 units between 80-tall boxes, so a 10 unit line riding any fixed distance off its ball
         is inside a block whenever the ball is within 23 of a face, which it is at both ends of every
         flight. Three of them start inside a block and are fixed by TIME: they fade in at delay +
         TAG_EMERGE (250), which covers the 252ms their ball needs to clear the face it left, so
         200ms of INSIDE and a 100ms edge cut each become nothing.
         `attached: true` on the status step is the one that ENDS inside, printing under the object's
         own `Node-1, attached: true` for 400ms and reading as a second sublabel. Timing cannot touch
         a tag that comes to rest, so it takes STATUS_TAG_DY as well and parks 14 below the object
         floor, in the same corridor the write tag parks in.
CONTENT  The claims are read against 1.35 (`k8sVersion`): the VolumeAttachment API reference, the
         kubernetes-csi book (external-attacher.html, skip-attach.html, csi-driver-object.html) and,
         where the docs are silent on who waits on what, the release-1.35 source:
         pkg/volume/csi/csi_attacher.go and csi_plugin.go, the attach/detach controller reconciler
         and util.go, the VolumeAttachment registry strategy, the kubelet operation_generator.go, and
         external-attacher pkg/controller.
         ONLY WHERE ATTACH IS REQUIRED. The controller adds a volume to its desired state only when
         FindAttachablePluginBySpec finds an attacher, and the CSI plugin CanAttach returns false
         when the CSIDriver sets attachRequired false (skipAttach), so such a driver gets no attach
         and no VolumeAttachment. The desc says `for a CSI driver that requires attach`, the
         aria-label `For a CSI volume that requires attach`, and `decide` closes on `With
         attachRequired false no VolumeAttachment is written`, the reading storage-csi-attach-mount
         states for ControllerPublishVolume. `decides a volume must be attached and writes a
         VolumeAttachment object` is rejected as the unqualified form. VolumeAttachment is a CSI
         object (`spec.attacher` is the driver name), so an in-tree plugin that still attaches,
         with no CSI migration, never writes one and the card does not need to say so.
         STATUS AT CREATION. csi_attacher.go Attach creates the object with spec only (attacher,
         nodeName, source.persistentVolumeName), and the registry strategy PrepareForCreate resets
         status to empty. `attached` is a bool with no omitempty, so it READS false. `write` says
         `its status.attached reads false because nothing has set it yet`, and the aria-label `its
         status.attached reading false`. `it starts with status.attached set to false` is rejected:
         nothing sets it. The API reference: attached "must only be set by the entity completing
         the attach operation, i.e. the external-attacher."
         WHAT KUBELET WAITS ON. Not a watch on the object. The controller Attach polls the object
         until status.attached is true, then lists the volume in node.status.volumesAttached, and
         Kubelet VerifyControllerAttachedVolume fails with "not yet in node's status" until it is
         there. Then csi_attacher.go WaitForAttach GETs the object and checks status.attached
         before the mount (its own comment: "there should be no waiting"). So `mount` says Kubelet
         `waits for vol-1 to be listed as attached in the Node status, which the controller writes
         only after status.attached turns true, then checks that same field on the object`, which
         is what W_GATE draws. `watching that one field` and `The moment status.attached reads true`
         are rejected: Kubelet watches neither, and nothing about it is instant.
         DETACH ORDER. The reconciler skips detach while the volume is MountedByNode, set from
         node.status.volumesInUse, and forces it after maxWaitForUnmountDuration only on an
         unhealthy Node or one with the out-of-service taint, which is
         storage-volume-detach-on-node-loss. On a healthy Node the controller waits for Kubelet, so
         `detach` says `Once the Pod is gone and Kubelet reports vol-1 unmounted, the controller
         deletes the VolumeAttachment`, and the Kubelet chip turns to `unmounted` on the Pod-gone
         beat before the delete leaves. `Once the Pod is gone the controller deletes` is rejected as
         the unqualified form, and `released` for a value the narration never names.
         THE FINALIZER. The external-attacher adds `external-attacher/<driver>` to the object,
         calls ControllerUnpublishVolume once it sees deletionTimestamp, and markAsDetached removes
         the finalizer, which is when the object goes. `detach` says `does it lift its finalizer and
         let the object go`. The tag `deletion mark` names deletionTimestamp in words and stays.
         THE ATTACH LIMIT. The NodeVolumeLimits filter counts every VolumeAttachment still on the
         Node beside the volumes of its Pods (nodevolumelimits/csi.go, "Count CSI volumes from
         VolumeAttachments"), so the desc says `it counts toward the Node attach limit until it is
         gone`. `a slot stays taken` is rejected: this card draws no slot and defines none, that is
         storage-volume-attach-limits.
         VALUES. The object is cluster-scoped ("VolumeAttachment objects are non-namespaced"). The
         controller names it `csi-` plus a sha256 hex digest of volume handle, driver and Node
         (getAttachmentName). `va-7f` is a short illustrative name, legal under RFC 1123 and the
         form storage-multi-attach-error draws as `va-1` and `va-2`. `status.attached` reads `no
         object` on both ends of the card, before the object exists and after it is gone, and `gone` is
         rejected as a second spelling of the same absence. The tags `ControllerPublish` and
         `ControllerUnpublish` are the external-attacher README's own short forms.
         `status` ends `The object did not move and nothing was recreated: its status changed in
         place`. `one field changed` is rejected, because markAsAttached also writes
         attachmentMetadata when the driver returns a publish context.
NAMING   External-attacher is the name of one binary, so it takes the capital on its first segment
         only (`T-11`). Bare identifiers keep their real casing: va-7f, web-0, vol-1, which
         `.scheme-node-label` uppercases to NODE-1 in CSS, and that form is catalog-wide (`T-12`).
NOTE     The first 14 units of the write tag's flight are inside the Attach/Detach controller box,
         and NO offset closes it: W_WRITE is 78 units long between two 80-tall boxes, so a constant
         dy that clears both ends would need the tag baseline at or below 104 at the start and at or
         above 182 at the end, which is not one number (clear of both boxes means baseline >= 113.8
         at the start and <= 178.9 at the end, and the ball travels exactly that span). Clearing the
         column outright takes dx -161, which reads as a tag that has come off its ball, and riding
         below the ball trades the source box for the DESTINATION box at the arrival, where the tag
         would sit 5.7 above the box label for 340ms while that label turns over. What closes it is
         not an offset: the tag is not DRAWN until it is out, which is what TAG_EMERGE is for.
WHY NOT  Read the L as a BOX, pinning the diagram to x>=400 AND keeping it centred: that forces
         BAND_W to 400 and leaves the two columns 176 wide, squeezed into the middle third of a 1200
         unit canvas under a 980 unit chip strip. Using the L buys 340 units, which go into the
         blocks (176 -> 232) and the corridor between the columns (48 -> 208).
         Run the chip strip from the DISK's left edge (130) to the control column's right edge (1140),
         so both ends are real block edges: that span centres on 635, and the chip strip is the one
         tier free to sit on the CANVAS centre. The 70 units it gains on the left are exactly the
         empty bottom-left corner the other span leaves behind.
         Run W_GATE straight to the right face midpoint at y=222, which `L-11` accepts without the
         frame clause: the arrowhead then lands between the Pod and Kubelet and points at neither.
DO NOT   Mix the per-class text rates when re-deriving the BOX_W clearance (`L-20`).
         Sit the Pod at 0.5 for five of seven steps as a stand-in for `not started yet`: a block held
         at half strength next to full-strength neighbours reads as a rendering fault. The Pod is
         simply present, and it leaves on the step that says so.
         Blink the Pod on the first step on the grounds that it is the reason an attach is needed:
         this is the step the poster auto-plays into about a second after the card opens, so the blink
         lands on a frame the reader has only just started looking at and reads as a flicker.
         Animate the create half of the delete step and drop the delete half. The clause this card
         exists to teach, that the CONTROLLER writes AND deletes the object, has to be animated on
         BOTH halves, or the step opens on the attacher's watch while W_WRITE sits drawn, aimed and at
         full opacity carrying nothing.
         Say that Kubelet itself mounts the disk. `storage-csi-architecture` says Kubelet never
         mounts a vendor filesystem itself, and the node plugin and the runtime that do are not on
         this card to be named (`T-21`), so the `mount` step and the desc say Kubelet HAS vol-1
         mounted. The same rule keeps `the driver` out of the `attach` narration.
NOT A DEFECT
         The `status` and `detach` steps say `when the backend confirms the attach` and `only when the
         backend has detached`, and this card draws no storage-backend block. Both are subordinate
         time clauses rather than the visible action of the step, so the reader is not being pointed
         at a missing box. Do not file these again.
         report/arrival.test.mjs prints five R2-ENTRY rows, `VolumeAttachment` and
         `status.attached` on step 3, `disk on Node-1` on step 4, `status.attached` on step 5 and
         `Kubelet` on step 6. Each value is wound back in `rewind` and turned over by the cued F.set
         on the arrival that earns it one step earlier (`write`, `land`, `status`, `mount`), so a
         frame frozen at t=0 first sees it a step late. R2-STEP reads 0. It also prints one R4 row,
         Kubelet on step 5: the gate ball stops on the frame face, and the `F.light` on that arrival
         is the cue R4 cannot see. All six are carried in test/fixtures/carried.mjs.
```
