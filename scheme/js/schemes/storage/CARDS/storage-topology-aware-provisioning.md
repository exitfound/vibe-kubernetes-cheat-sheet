## storage-topology-aware-provisioning

### layout

```
WHAT     WaitForFirstConsumer. Two zones side by side, each a worker node with its own zonal disk on
         the shelf below it.
LAYOUT   The two zones are mirrored about the canvas centre, so neither reads as the important one,
         and the StorageClass and the claim stack on that same line because the whole card is about
         ONE claim and ONE class resolved into ONE of two zones. Content spans 140..1060.
         NODE_H hugs the Pod rather than framing canvas.
         `node()` carries no sublabel, so the zone is its own dim caption, sharing the frame HEADER
         line with the node label.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 180.12..229.82 at 1100x800, the deepest reading on the `imm-schedule` step:
         `OVERLAY_IDS=storage-topology-aware-provisioning node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The StorageClass (y=36) and the claim (y=144) both sit inside the panel's y band, so both
         start at x>=400. The node row at y=252 clears the deepest reading, 229.82, by 22 units, so
         it must not move up. A longer narration spends that margin.
SIZES    Every actor block is 232 by 80: the StorageClass, the claim and `Pods already here`. The Pod
         is 232 by 104 around a 192 by 44 app box (NET.L-01). The class sublabel carries the mode
         VALUE alone, `Immediate` or `WaitForFirstConsumer`: with the field name,
         `volumeBindingMode: WaitForFirstConsumer` inks 239.2, more than a 232 box holds, and the
         field is named in the narration and by the `mode` chip. The three tiers stand `TIER_GAP` 28
         apart, which puts the node row at 252.
         The node frames (430) and the disks (190) are frames and glyphs, not actor blocks.
         node-1 holds `Pods already here`, a 232 by 80 actor box centred in the frame the way the
         Pod is in node-2, so the room node-1 lacks is drawn rather than only narrated: an empty
         node-1 frame contradicts `Node-1 in zone-a has no room for the Pod`.
         Family CHIP_W 232: worst case is `mode` + `WaitForFirstConsumer` at 24 characters, so
         24 * 6.89 + 24 of padding is 189 against the 232 available.
LANES    Both provisioning routes wrap down the same outer margin clear of both zones and run a bus
         along the shelf midline, so one route shape serves either zone. zone-a simply runs further
         left along that midline, passing over where the zone-b disk sits, but that disk is invisible
         during the zone-a step so nothing is crossed on screen.
         The mount lane and the doomed cross-zone reach both meet the node-2 frame at its BOTTOM edge,
         entering the NODE rather than the Pod inside it, and are never drawn in the same step. The
         cross-zone reach is a bare dashed line with NO arrowhead, because the attach never succeeds.
MOTION   A value a ball earns turns over on that ball's arrival (`P-03`), wound back by `rewind` and
         set by `F.set`: on `imm-provision` the claim sublabel and chip go Bound, the zone chip reads
         `disk in zone-a` and the zone-a caption appears when CreateVolume reaches the disk. On
         `wffc-provision` Bound, `both zone-b` and the zone-b caption land on the same arrival, and
         the Pod chip reads Running only on the mount arrival. A seeked frame (`frames.mjs`) shows the
         wound-back values, because the turnover is an `onfinish` a paused animation never fires:
         `settled-dump.mjs` is the reading.
         On `wffc-schedule` the Pod fades in, then the claim sublabel turns to
         `selected-node: node-2` and the claim lights, one `BEAT.afterHop` after the fade: the
         narration says the choice is recorded on the claim, and that is the annotation the scheduler
         writes.
         On the failure step the scheduler keeps re-queuing the Pending Pod and rejecting it, so the
         Pod blinks, but it never went Ready: pulsePodDim with an opacity lift.
WIRE LABELS
         The two disk captions are right-anchored `CAPTION_DX` 12 left of the lane that meets each
         disk top: centred on the disk, `disk in zone-a` and `healthy but stranded` were cut by the
         cross-zone reach and `provisioned in topology` by the mount lane.
         `MOUNT_TAG_EMERGE` 300: CAPTION_Y is DISK_TOP-14, which is exactly where a tag riding
         W_MOUNT_B sits when its ball leaves the disk. No dx or dy separates the two, the corridor is
         68 units with the caption at 446 and the Pod sublabel at 366. The tag emerges 300ms into the
         flight instead, by which point it is 25 units clear when first readable and 40 clear at full
         alpha.
CONTENT  Claims read against Kubernetes 1.35, the release `k8sVersion` names, in the storage-classes
         page (Volume binding mode) and the scheduler VolumeBinding plugin.
         `provisioned the moment the claim appears` is `volume binding and dynamic provisioning
         occurs once the PersistentVolumeClaim is created`, and `just picks a zone` is `without
         knowledge of the Pod's scheduling requirements. This may result in unschedulable Pods`.
         The FailedScheduling reason is paraphrased as `one that did not match the PersistentVolume
         node affinity`, from `ErrReasonNodeConflict`, `node(s) didn't match PersistentVolume's node
         affinity` on release-1.35. `Node(s) had volume node affinity conflict` is rejected: it is
         the string up to release-1.30 and is gone by release-1.33. The strip caption reads
         `no match for PV node affinity` for the same reason.
         `It stays Pending until a zone-a Node has room` is the wording. `Pending forever` is
         rejected: the Pod schedules the moment a zone-a Node fits it, so forever is only true while
         nothing changes. The desc opens `sit in Pending` for the same reason.
         `a common multi-zone failure` and `common in multi-zone clusters` are the wording. `the
         single most common multi-zone storage bug` and `the commonest multi-zone bug` are rejected:
         the page says only `may result in unschedulable Pods`, and no source ranks it.
         `The Scheduler picks Node-2 ... records that choice on the claim, then holds the Pod until
         its volume is bound` is the wording, and `wffc-provision` binds the Pod to Node-2 only after
         the volume is bound. `The Pod is scheduled first and lands on Node-2` is rejected: PreBind
         sets `volume.kubernetes.io/selected-node` on the claim and `wait[s] until the PV controller
         has completely finished the binding operation` before the Pod is bound to the Node.
         `WaitForFirstConsumer inverts the order so the Scheduler chooses the Node first` is
         `delay the binding and provisioning of a PersistentVolume until a Pod using the
         PersistentVolumeClaim is created`, with the volume provisioned `conforming to the topology
         that is specified by the Pod's scheduling constraints`.
BUDGET   `imm-schedule` holds 3500 for its 320 characters, 10.9 ms each, and `imm-fail` 3600 for its
         318. At 3000 and 3200 they read at 9.38 and 9.7, among the most hurried steps here.
         The WaitForFirstConsumer step is 5800, not 4400: it provisions, materialises the disk and then
         mounts it, and the pulse on arrival adds PULSE_POD.ms on top, which measures out at a 5207ms
         span (mount lands at 4307, the blink runs the 900 past it). At 4400 the auto-advance cuts
         the mount off before the Pod ever blinks, so the card under-shows exactly what it narrates.
NOTE     BOTH FRAMES CARRY THE FILTERED-OUT SHADE on the two Immediate steps, because the narration
         rejects both nodes: `STRANDED` dims node-1 for room and node-2 for the zone, and the
         `Pods already here` box inside node-1 takes the same shade. Dimming node-1
         alone leaves node-2 at 1 while the sentence beside it says it is rejected, and the Pod at
         OPACITY.pending inside a full-strength frame. The shade is also the ONLY thing separating
         these steps from `wffc-schedule`: the Pod occupies 729..961 / 270..374 on all three, and on
         the WaitForFirstConsumer step it is genuinely placed there, with node-2 at 1 AND lit.
         Measured: 0.4 / 0.4 on `imm-schedule` and `imm-fail`, 1 / 1 with node-2 lit on
         `wffc-schedule`.
WHY NOT  NODE_H 180: the frames stand 80 units taller than the Pod they hold, and zone-a, which holds
         nothing at all in the WaitForFirstConsumer path, reads as a large empty box rather than as
         an empty zone.
         Centring the zone caption under the node label at NODE_Y + 24: it lands on the top edge of
         the Pod the frame holds, since NODE_H hugs the Pod.
         Running the nodes at 400..720 and 820..1140: the pair centre lands at 770 and leaves 400
         units of dead canvas on the left against 60 on the right.
         Moving the Pod OUT of the node-2 frame on the two failure steps so an unplaced Pod is not
         drawn inside a node: the Pod's x and y are scene geometry, so a per-step move needs a
         transform hook, and the only clear canvas at that tier is under the panel (which reaches
         x<=397, y<=230) or in the 60 unit gap between the frames. Both cost more than the shade buys,
         and the shade says the same thing: neither frame took it.
         A mount tag that shows from departure: it prints on the zone-b caption for 300ms, 96.5 x 9.0
         units of ink at a baseline gap of 0.00, the worst pair in the catalogue.
DO NOT   Wrap the provisioning routes left: the lane and its ball then run straight through the panel.
         Leave the lanes permanently visible. The step `opacity` field pins them, or the zone-a
         provisioning lane is still drawn during the zone-b step, pointing into a disk that does
         not exist there.
NOT A DEFECT
         The CreateVolume ball on `imm-provision` rides 1483 units in 2600ms, 0.57 units per ms
         against the 0.45 canon pace. That is routeDur's ceiling (`M-13`) acting on the longest
         route here, and holding it to 0.45 means a 3300ms explicit dur past the canon clamp, which
         is a catalog decision rather than this card's.
         The cross-zone reach stays at 1 while the frame it leaves is at 0.4. It is a RELATION, not a
         lane: no ball rides it and it has no arrowhead, and its real ends are the Pod (0.55) and the
         zone-a disk (1), not the frame edge it happens to touch. It is also the subject of the step,
         so the caption `no match for PV node affinity` names it.
OPEN     The provisioning ball leaves the StorageClass, which does not act: the external
         provisioner reads the class and calls CreateVolume (`A-09`). Drawing it is a new actor
         block, a composition change that belongs to card-new.
```
