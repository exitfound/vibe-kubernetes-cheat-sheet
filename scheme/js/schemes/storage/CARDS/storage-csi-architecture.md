## storage-csi-architecture

### layout

```
WHAT     The CSI component map. STRUCTURAL rather than a single descent, so it does not use the
         vertical mount-lane stack of STO.L-01: it reads left to right as
         core -> bridge -> vendor -> machine, with the controller plugin (a Deployment running
         off-node) and the node plugin (a DaemonSet, one Pod per eligible node) as the two frames.
LAYOUT   ONE pair of constants fixes the content band and every tier hangs off it (WHY NOT below for
         hand-typed margins).
         Top margin 48 (the frame border), bottom 16 (the chip strip), unequal on purpose: the top
         element is a dashed border whose caption is inset 22, so it reads airier than the number
         suggests, while the chip strip is solid ink to its last pixel.
PANEL    `OVERLAY_IDS=storage-csi-architecture node --test report/overlay.test.mjs` from
         `scheme/test/` prints the reading. The deepest steps are `controller`, `translate`, `node`
         and `fstoucher`, 205 at 1100x800, where nothing stands under the panel.
         The 900x650 hand row is the stricter number (`STO.L-04`): right 398.3, bottom 343.9, on the
         poster, `core`, `controller`, `node` and `fstoucher`, and 313.2 on `translate` and `bridge`.
         Everything left of 420 starts at y>=336 (apiserver row, kubelet row, the ask lane's gutter
         run from y 424, chip strip, both left-hand wire captions), 131 below the standard reading
         but NOT below the hand row: at 900x650 the apiserver box top sits 7.9 inside the panel on
         those five steps, with its label ink (from 360.6) still clear by 16.7. The controller
         frame's left border is the leftmost thing sitting high on the canvas, at 420, clearing the
         right edge by 22 at 900x650 and by 23 at 1100x800.
SIZES    Every actor block is 232 by 80 (NET.L-01) except the four sidecars: Kube-apiserver, Kubelet,
         the cloud API, the controller driver, Node-driver-registrar and the CSI node driver all take
         SIDE_W 232 and BLOCK_H 80, and the tiers chain off BLOCK_H so the frames grow with it. The
         widest string in a 232 box is the sublabel pair `asks node driver to mount` / `sidecar,
         registers driver`, 153.4 at 1100x800, ~39 either side.
         The sidecars are 80 tall but cannot be 232 wide, a departure the frame forces: four at 232
         need 928 plus the gaps against an inner span of 696, which FRAME_X 420 (the panel wall) and
         the right margin fix.
         420 is the first tidy value clear of the panel right edge at 398, and it leaves a box-to-box
         gutter on the node row exactly as long as the node driver to node fs gutter on the far side,
         so the two horizontal wires on that row are a matched pair.
         The four sidecar widths are SOLVED, not picked: each box needs its widest string plus air and
         the leftovers are spread so every box ends with the SAME air. Measured after fonts.ready at
         1100x800, the needs are 120.2 / 147.2 / 110.4 / 177.9 = 555.7 against an inner span of 654
         after the gaps, so ~24.6 per box, 144 / 172 / 134 / 204 once rounded to even widths. The
         snapshotter needs 204 because its sublabel `watches VolumeSnapshotContent` inks 177.9: a
         character-count estimate reads it near 133, and a box sized off that clips it.
         The driver is centred on the frame's inner span, which is the sidecar row's extent, and its
         width is SIDE_W so every server on the card comes out at one size.
         The node row keeps the matched 140 gutters (Kubelet to registrar, node driver to disk) with a
         16 gap between its two 232 boxes, which leaves the disk 88 wide by 116 tall, flush to the right
         margin. A cylinder is not an actor block, and `NodeFS` sits in it with ~20 either side.
         Kubelet stands ASK_DY 18 above the row, box 456..536, its top level with the disk top, so its
         right face carries the two Node lanes as a mirrored pair: the registrar reply lands at +18, on
         the row centre 514, and the ask leaves at -18, y 478. 18 and not the card's LANE 14, because
         the reply's riding tag inks 12..24 above its ball, 490..502: at 14 the ask leg, at 486,
         clears that ink by only 4, at 18 it clears it by 12.
         CHIP width is derived so the strip spans exactly the content band rather than being a fifth
         hand-typed margin. Worst pair `control plane` 79.8 + `vendor-agnostic` 92 = 171.8, level
         with `controller` 61.3 + `sidecars as needed` 110.4 = 171.7, so 258 leaves ~62 units of
         clear gap.
LANES    The run out to the cloud leaves the driver from the CENTRE of its bottom edge, the same
         anchor the inbound gRPC wire uses on the top edge, so the driver reads as one block with
         traffic on its spine. It runs 128 units, long enough to read as a run and not a stub.
         The provisioner is the only block with traffic on BOTH sides, so each direction gets its own
         lane offset around the box centre.
         The bus the other three sidecars share into the driver is DRAWN rather than implied, because
         that sharing is the point of the card. No ball rides it, so it carries NO arrowhead.
         The Kubelet -> node driver ask runs OVER the node plugin rather than through it, 608 units:
         64 out of Kubelet at y 478, up the gutter midline x 356 to y 424, 440 across, then 50 down
         onto the node driver's top-face midpoint (796, 474). The run at 424 is 18 above the node
         frame's top border and 28 above its caption ink (452..468), and the drop at 796 is 104 right
         of where that caption ends (692) and 132 right of the registrar. It passes the registrar
         without touching it, which draws the chip `no sidecar in path`.
MOTION   NO Pod at all, on purpose, so nothing pulses anywhere and that is correct: every element here
         is Kubernetes core, a vendor process or the machine.
         core, controller and bridge are the three mute steps of this card, 7600ms in which nothing
         travels and nothing animates. There is no Pod anywhere here, so nothing may pulse, and M-27
         makes the static `.highlight` the whole of the beat: on this card a mute step is mute (M-01).
         core lights api. The sentence is about the control plane dealing only in objects, and the
         apiserver is the only control-plane block on the card. The chips reporting its state are
         values and are lit rather than flashed (M-26), so the cue is the box going bright and staying
         bright.
         controller lights all four sidecars as ONE set, which is what its `lit` already names. The
         narration names each of the four and gives it its job, so the actor is the set rather than
         any member of it.
         bridge lights seven blocks and adds nothing on top, with no motion at all. The usual argument
         for a flash on a packet-less step does not apply to the LAST step, which is supposed to come
         to rest: lighting the whole chain at once IS the summary, and it wants to be read, so a beat
         on the last step works against it. There is no honest single target either: every block the
         sentence names is already the actor on an earlier step.
         translate's three chained hops measure span 3876ms against 4400, so ~520ms of headroom.
         fstoucher lights kube, the sender, whose ball leaves BEAT.lead later (M-18), and nd and fs
         light as the two balls land. It chains two hops: the ask, 1351ms for 608 units at
         PKT_SPEED, then the mount after it, floor-bound at 700ms, landing at 2951 and rippling to a
         span of 3511ms against 3700. That is 189ms of headroom and 749ms of rest after the disk
         lands, at 12.80 ms/char over 289 characters, between the card's one-hop and mute steps
         (9.13 to 9.70) and translate (15.88), above the catalog median that
         `report/baselines.test.mjs` prints. Held to 12 ms/char the step would stop at 3468, under
         the span, so the motion sets the duration here.
         A route's flight time comes from its LENGTH, so moving a block here is silently a timing
         change: anything added has to be re-checked by `render/duration.test.mjs`.
WIRE LABELS
         Three captions, all on horizontal runs, all pushed BELOW their wire: a riding tag renders 14
         units ABOVE its ball, so a caption on the same side gets sat on.
         There is deliberately NO caption on the provisioner -> driver lane. That hop is what the card
         is named after, so the BALL carries `CreateVolume`, and a caption on the same lane would be
         run over by the tag. The Kubelet -> node driver lane carries none either: its ball carries
         `NodePublish`. For the same reason the apiserver hop carries no tag: its ball lands on the
         provisioner's bottom edge 28 units from where the CreateVolume ball leaves it, so two
         tags there would overlap for ~390ms. The Pending PVC is named by the caption instead,
         where it is standing still and readable.
CONTENT  Every chip means exactly what its name says. On the fstoucher step the bridge fact is that
         there is no sidecar in the mount path at all, so the value states that ABSENCE, `no sidecar
         in path`.
         The claims are read against 1.35 (`k8sVersion`): the kubernetes-csi book (deploying.html,
         the four controller sidecar pages, node-driver-registrar.html), the node-driver-registrar
         README, the kubelet pluginwatcher README, the CSI spec, the concepts/storage volumes and
         persistent-volumes pages, the DaemonSet concept page, and, where the docs are silent on who
         makes which mount, the kubelet volume code (pkg/volume/csi/csi_mounter.go, csi_block.go,
         csi_attacher.go, pkg/volume/util/util.go, pkg/kubelet/kubelet_pods.go).
         `The control plane deals only in objects` (core, the chip `control plane`, the apiserver
         sublabel `control plane, no driver`), and on bridge it `writes plain objects and runs no
         vendor driver`, the same claim the desc opens with. `knows nothing about the vendor` on
         bridge and `knows nothing about any storage vendor` in the aria-label are rejected: a PV
         names its driver in spec.csi.driver, so the control plane does hold the vendor name. The
         aria-label takes core's own clause, `has no idea how any disk is made or attached`.
         `Kubernetes core` is rejected there:
         Kubelet is core and makes the node gRPC calls itself ("Kubelet directly issues CSI
         NodeGetInfo, NodeStageVolume, and NodePublishVolume calls", node-driver-registrar.html),
         which fstoucher draws and the chip `no sidecar in path` concedes.
         The desc opens `Kubernetes core runs no storage vendor driver of its own`: rbd and cephfs
         are "not available starting v1.31" and the cloud types still accepted run with CSI
         migration on (persistent-volumes page). `has no code for any storage vendor` is rejected,
         because the in-tree portworxVolume type still exists, its operations "redirected to the
         pxd.portworx.com" CSI driver (volumes page).
         Sidecars turn an object into `gRPC calls`, never `one gRPC call` or `one call each`: the
         provisioner issues CreateVolume and DeleteVolume, the attacher
         Controller[Publish|Unpublish]Volume, the snapshotter CreateSnapshot, DeleteSnapshot and
         ListSnapshots. `watches one kind of object` and `has one task` stand: each sidecar page
         names one watched kind, and the chip says so, `one object kind each`. One provisioning of
         one PVC is still `a single gRPC call, CreateVolume` on translate.
         The controller plugin holds `the sidecars its driver needs`, chip `sidecars as needed`,
         never a fixed `four sidecars`: "Including a sidecar in the deployment may be optional"
         (deploying.html). The four drawn are the four that page names.
         `The driver, not the sidecar, is what speaks to the cloud API`. `the driver is the only
         part that speaks to the cloud API` is rejected: the evidence separates the sidecar from the
         driver, and `only` also rules on every other part of the design, which nothing here checks.
         Registration: Kubelet discovers the registration socket the registrar leaves under
         plugins_registry and calls GetInfo on it, which returns "plugin type, name, endpoint"
         (pluginwatcher README). So the ball runs registrar -> Kubelet as that REPLY, tagged
         `name + socket`, and the narration says the sidecar `answers Kubelet`. `driver ready` is
         rejected: it is not what travels, and the readiness signal, NotifyRegistrationStatus, runs
         the other way. The caption `plugin socket` is that registration socket.
         Mounts are scoped to a FILESYSTEM volume, once, at the head of fstoucher: `Kubelet never
         mounts a vendor filesystem itself`, `only the node plugin mounts it for a Pod` and `the
         runtime just binds that mount into the container`, which is storage-mount-path-chain in one
         clause. The desc says `Only the node plugin mounts a filesystem volume for a Pod`. The
         unscoped `Kubelet never mounts vendor storage itself` and `Only the node plugin mounts the
         volume for a Pod` are rejected because of volumeMode Block: Kubelet itself runs
         util.MapBlockVolume, which "map[s] devicePath to global node path as bind mount" under
         plugins/kubernetes.io/csi/volumeDevices/{specName}/dev/{podUID}, symlinks it into the Pod
         device map path and takes a loop-device lock on it ("MapBlockVolume and UnmapBlockVolume
         take care for lock, symlink, and bind mount", csi_block.go). The runtime binds nothing
         there either: a block volume reaches the container as a device (makeBlockVolumes hands it
         over as DeviceInfo, kubelet_pods.go). For a filesystem volume csi_mounter.go SetUpAt only
         creates the target's parent directory and calls NodePublishVolume. `never mounts a vendor
         filesystem` survives subPath: the bind Kubelet makes there is of a directory inside the
         already mounted volume, not a mount of the filesystem.
         `only the node plugin ever mounts the volume on the Node` and the sublabel `the only
         mounter` are rejected: the runtime makes the bind at /data, and a controller may mount
         for itself (csi-driver-nfs CreateVolume calls internalMount). The same counter-case sets
         `makes no mount a Pod uses` and the chip `no Pod mount` over `never sees a mount` and
         `never mounts`: the controller only "generally does not need direct access to the host"
         (deploying.html).
         `When bytes finally land on disk, it is the CSI node driver that put them there` is false
         and rejected: the app writes the bytes through the kernel, and the driver made the mount.
         It ships as `The app writes through it`, straight after `a mount a Pod uses`, which is its
         antecedent.
         Staging: `it calls NodePublishVolume, after NodeStageVolume if the driver stages`. The bare
         `it calls NodePublishVolume` is rejected as the whole node side: Kubelet calls
         NodeStageVolume first when the driver advertises STAGE_UNSTAGE_VOLUME, and skips it when
         not ("STAGE_UNSTAGE_VOLUME capability not set. Skipping MountDevice", csi_attacher.go). The
         ball draws only the publish, tagged `NodePublish`, the short form storage-csi-attach-mount
         also uses, with the full name in the narration of the same step. The aria-label names both
         calls in that order.
         Kubelet's sublabel is `asks node driver to mount`, naming the box the ask lands on.
         `asks node plugin to mount` is rejected: the plugin is the frame, and the registrar in it
         takes no part in the call.
         DaemonSet: `a copy runs on every eligible Node`, and the frame caption `DaemonSet, one per
         node`. A DaemonSet "ensures that all (or some) Nodes run a copy of a Pod", and with a
         nodeSelector or affinity the controller creates Pods only "on nodes which match"
         (DaemonSet concept page). `a copy runs on every Node` and `DaemonSet on every node` are
         rejected: deploying.html only says the node component "should be deployed on every node".
         The caption holds its width, 255.4 at 900x650, which `eligible` would break, so it says the
         one-per-node half of the same sentence.
         Privilege: on bridge `the node plugin does the privileged work, like the mount`. `the one
         privileged thing, the mount` is rejected: "CSI node plugins need to perform various
         privileged operations like scanning of disk devices and mounting of file systems"
         (volumes page).
         The node driver -> NodeFS lane carries the ACTION, `mount`, the way driver -> cloud carries
         `make a disk`, under the caption `/var/lib/kubelet`, where the staging and publish targets
         live. `NodePublish` is rejected on it: a call name rides the lane from its CALLER
         (`CreateVolume` on provisioner -> driver), so NodePublishVolume rides the Kubelet -> node
         driver lane on fstoucher, the hop before the mount. storage-csi-attach-mount keeps
         `NodePublish` on its staging -> Pod lane, where every rung names its call on the effect it has.
BUDGET   A LONGER NARRATION INVALIDATES BOTH PANEL NUMBERS, and the 900x650 row already shows the
         cost: `translate` and `bridge` stop at 313.2, while the poster, `core`, `controller`, `node`
         and `fstoucher` reach 343.9, where the apiserver box top sits 7.9 inside the panel and its
         label ink (from 360.6) is clear by 16.7. That 16.7 is the whole margin left.
         `fstoucher` sits on a line break: its 289 characters fill nine lines at 900x650, and
         reorderings of the same claims at 286 to 306 characters take a tenth, 374.7 at 900x650,
         with the apiserver label under the panel. The break falls on the long call names, so the
         count alone does not predict it: measure with `extents.mjs --viewport=900x650`.
         `node` sits on one at 1100x800: its 293 characters stop at 205 there, and versions of 298
         to 307 characters that qualify `every eligible Node` take 229.8.
NAMING   External-provisioner and Node-driver-registrar are one identifier each, not a phrase, so
         capitalizing every segment would read as three separate proper nouns (`T-11`).
NOTE     A frame is a label for a SET, not a thing traffic touches, so it stays fill-less with a
         sparser `3 6` dash and reads as subordinate to a real node. Its caption baseline leaves 12
         units of air above the row inside.
WHY NOT  Hand-typed margins: they drift. A content band of 60..1180 is a 60 unit left margin
         against a 20 unit right one, centre 620, visibly shoved right.
         Light the controller frame on the controller step: it is a label for a set, drawn as a
         keyless P.group, so no ref reaches it at all.
         Light the provisioner alone on the controller step: "follow one sidecar" is the NEXT step's
         opening line, and singling the provisioner out there spends that sentence a step early.
         Light drv on the controller step: nothing calls the driver until translate, and the
         controller step does not light it.
         The ask UNDER the registrar: the box bottoms (554) sit 20 above the node frame foot (574),
         so the lane ends in a ~10 unit arrowhead stub. The ask over the registrar INSIDE the frame:
         it crosses the caption (452..468). The ask out of Kubelet's TOP face: that midpoint sits
         under the apiserver, 40 below it, so the run turns near 436 and its riding tag, 12..24
         above the ball, inks 412..424, over the apiserver's bottom edge at 416.
DO NOT   Draw the controller plugin or the node plugin as pod() shells. They are the two things a
         reader could mistake for Pods, and they are labelled by their CONTROLLER (Deployment /
         DaemonSet), so a Pod shell would name the wrong object.
         Put CHIPS_Y at 616: a 34 high chip then runs to 650 and is CLIPPED by the 640 viewBox,
         silently cutting 10 units off all four.
         Shrink CF_W: the sidecar widths are solved from it, and every one is already down to ~12
         units of air a side.
         Run both provisioner directions through the box centre: the 28 units between the sidecar row
         and the bus (S_BOTTOM 162 to BUS_Y 190, the gap BUS_Y's own comment names) are then drawn
         twice, and the ball retraces its own inbound path.
         Shrink the frame caption's 12 units of air, or the caption touches the box tops.
         Give a frame border a flat white at 0.22, which sits outside the category tint: it takes the
         catalog node-rect token (--diag-node-stroke), being the same kind of grouping element.
         Hang `CreateVolume` on the wire caption of the DRIVER to CLOUD line two hops further on:
         that labels a vendor API call as if it were the sidecar call.
         Let `bridge` report `registered`, `touches fs` or `gRPC NodePublish`: none of the three is
         a bridge, all are node-plugin facts, and the last one is the call the Kubelet to node driver
         ball already carries as its tag on the same step.
         Write `Kubelet calls direct` on the fstoucher bridge chip, true though it is (the registrar
         docs say Kubelet issues NodeGetInfo, NodeStageVolume and NodePublishVolume against the
         driver itself). The sentence beside it says Kubelet never mounts a vendor filesystem itself, so a
         chip pairing Kubelet with `direct` is read as Kubelet doing the mount, which is the one thing
         the step denies. The name+value pair measures 165.3 against the 258 chip, so it is not a
         width question either.
         Put F.flash on core or controller. It animates filter brightness 1 to 1.55 to 1 on the block
         group, which M-04 calls a pulse and M-01 forbids on infrastructure, and no still frame can
         tell it from the static highlight, because its 600ms equals the whole span of the step.
NOT A DEFECT
         The `NodePublish` tag sits across Kubelet's top-right corner from its fade-in at 650ms
         until the ball is ~34 units out, near 1025ms: at departure it inks 258..326 by 454..466
         against the right face at 292 and the top at 456. A tag rides from departure and the packet
         layer draws it over the border, so it stays legible. The ask leaves 40 - ASK_DY under
         Kubelet's top, so clearing the corner takes ASK_DY near 30, which lifts Kubelet 12 more
         off the row and leaves it 28 under the apiserver.
         Kubelet's top sits 18 above the registrar's. Kubelet stands outside the node plugin frame,
         level with the disk top, so the row inside the frame keeps one line and the node tier
         starts at 456 at both ends.
         The node plugin chip turns to `mounts the disk` and lights at fstoucher entry, 2951ms
         before the mount lands. Chips light at entry here (P-06), as `registered` on node and
         `CreateVolume` on translate do, and the value is the role, not the arrival.
```
