## storage-csi-attach-mount

### layout

```
WHAT     THE LADDER CARD. The four gRPC calls between a bound claim and a writable /data are a
         numbered ladder down the LEFT, one rung lit per step, and the RIGHT is the topology those
         calls act on, descending from the cloud disk to the one Pod the staged mount is published
         into. The last step takes the same topology down again, bottom-up.
LAYOUT   Two columns of EQUAL width sharing one centre: 2*M + 2*COL_W + G = 1200 solves COL_W. Not a
         chosen number, it is what makes the ladder and the node column mirror each other about 600.
         Change M or G and COL_W has to be re-solved.
         The chip strip is the one tier spanning the WHOLE content width rather than one column, so
         it reads as a rail under both.
         The one Pod sits on NODE_CX, so the node plugin's ownership line (756) and the staged
         device's lane (1008) stay a mirrored pair about the lane that publishes into it.
         The CSI controller lives in the LEFT column, because it is the one actor NOT on the node.
         CreateVolume pays for it with two corners: it leaves the controller's right face, turns up
         at x=520 (right of the panel at every viewport) and runs to the cloud disk's left face in
         the free band above the frame.
         The cloud disk sits ABOVE the node frame because it does not live on a node: the first two
         calls are cluster-scope. It stays on the node column so the descent reads as one vertical
         story, the cloud disk over the device it becomes.
         The staging band is a FULL-WIDTH band, not a centred box, for the reason the card is about:
         one mount there serves every Pod on the node, so it has to physically span all of them. It
         is labelled `Global staging path` and is drawn only while that directory exists: Kubelet
         creates it just before NodeStageVolume and deletes it after NodeUnstageVolume (CONTENT),
         so it is born on `stage` and gone by the end of `unwind`.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 180.12..229.82 at 1100x800, the deepest reading on `attach`, `stage` and
         `unwind` at all three:
         `OVERLAY_IDS=storage-csi-attach-mount node --test report/overlay.test.mjs` from
         `scheme/test/`.
         At the 900x650 hand row (extents.mjs --viewport=900x650) the panel reaches right 398.3 and
         bottom 374.7 on `stage` and `unwind`, 343.9 on `idle`, `create` and `attach`, 313.2 on
         `publish`: well inside the blanket rule on x but PAST it on y, because this card carries
         some of the longest narration in the catalog. The ladder keeps the catalog row rhythm
         (ROW_H 32, ROW_GAP 10) with its foot level with the node frame, so LAD_Y is 420: it clears
         the standard reading by 190 and the 374.7 by 45.3. Two more
         lines on `stage` or `unwind` at 900x650 (30.8 each) put the top rung behind the panel (see OPEN).
SIZES    The widest ladder rungs are 3 and 4, 55 characters each (53 drawn, see BUDGET), and
         measure 325.2 units at 1100x800 and 365.2 at 1600x1000 after fonts.ready (extents.mjs),
         inked from x=70 after the primitive's 10 unit inset, so the ink ends at 395.2 and 435.2 in
         a rung running to 576. The extra width is DELIBERATE, so the rungs read as a stacked bar
         chart of the chain.
         The CSI controller and the CSI node driver are 232 by 80 and Pod A 232 by 104 around a 192
         by 44 app box 26 under the Pod label (NET.L-01). The widest string in a block is the
         controller sublabel `attacher + provisioner`, 135.0 at 1100x800, 48.5 either side, and in
         the Pod the sublabel `private bind mount`, 110.4, 60.8 either side. Both are 10px mono and
         read widest at 1280x860, 138.5 and 113.3, which leaves 46.7 and 59.3. The staging band is
         not an actor: it is sized BY the node's inner width (484) and keeps its 58.
         CHIP_W is solved from the content width (258). Worst pair `device on node` +
         `/dev/nvme1n1` on `attach`, `stage` and `publish`, 96.5 + 82.7 + 24 of inset = 203.2 at
         1600x1000, so 54.8 units of air at the tightest step (74.5 at 1100x800). `staging mount` +
         `mounted once` leaves 61.7, and `disk` + `detached, disk kept`, the longest value, 75.5.
         The band caption starts 14 right of the publish lane (STG_LBL_X 896, anchored start) and
         runs toward the node inner edge at 1124, so the clear width is 228; keeping 12 off that
         edge leaves 216, a HARD CEILING of 31 characters at 6.89, the 1600x1000 rate (the
         1100x800 rate alone would allow 35). The longest in use is 26, `unpublish, unstage,
         detach`, 179.2 at 1600x1000 and 159.5 at 1100x800, so 36.8 inside the 216.
LANES    No lane carries return traffic, so none needs an offset twin: this card is one-way all the
         way down.
         The stage lane elbows LEFT to STAGE_IN_X 1008 before it drops, so the device does not land in
         the corner directly under itself: 1008 is OWNS_X 756 mirrored about NODE_CX 882, so the two
         lanes touching the staging band's top face read as a pair either side of its midpoint rather
         than one lane out on its own, and the staging mount reads as belonging to the whole node.
         It also makes the run 87 units instead of a 46 unit straight stub. That elbow turns at the
         MIDPOINT of the gap it crosses (STAGE_ELBOW_Y 327 in the 46 unit device gap), so it stays
         centred if either block moves.
         W_OWNS is ownership, not traffic: the node plugin performs both node calls, so it owns the
         staging mount below it. No ball rides it, so it is a bare dashed path, not a pathArrow.
         W_ATTACH crosses the Node frame face on its way down to the device, because the disk
         becomes a device ON the node. `WL.A-03` reports it as INTO INSIDE, a per-card argument.
MOTION   A BLOCK AND ITS LANES ARE ONE CONSTRUCTION AND APPEAR TOGETHER (`STO.S-02`). Only the
         standing topology is drawn from the first frame, and that includes the cloud disk and the
         CreateVolume lane from the controller to it: the call the card opens on is visible before
         it runs, and the `disk` chip says `none` until it lands. The Node side is born mid-story:
         the device and its lane on `attach`, the staging band with its stage lane and the
         ownership line on `stage`, each finishing materialising BEFORE its call is sent (REVEAL_MS
         500 against BEAT.lead 800), so no frame draws a device or a directory that does not exist
         yet.
         A Pod arrives at FULL strength. A Pod or a Node-side block that is not there yet is simply
         not drawn, a departure from `C-14` argued under DO NOT.
         The unwind step sends NO ball. Going back up the descent would need a return lane beside
         every lane (`A-03`), and nothing new travels anywhere: the beat is the teardown itself, one
         construction per call at 1000ms apart, the Pod and its lane, then the staging band with its
         two lanes, then the device and its lane. The static end state is the `create` topology
         again, and `rewind` holds the three at full so the animated path can take them down. Each
         rung lights WITH the fade it names and stays lit (`F.set` chain [] at entry, then [3] at
         400, [2, 3] at 1400, [1, 2, 3] at 2400, the three fade delays), so the reader can tell
         which call takes which block down. The end state is the static `chain: [1, 2, 3]`, which
         is what prev and reset show. CreateVolume never lights, because nothing deletes the disk.
         A frozen frame cannot show the rungs, because a seek fires no `F.set` timer (`M-35`): read
         them from a real playthrough.
WIRE LABELS
         Every tag lives exactly as long as its ball (`M-30a`), through a card-local
         makeRidingLabel at 200 / 200 / hold 0: the kit default outlives the ball by 160ms.
         The NodePublish tag rides LEFT of its lane, level with the ball (PUB_TAG dx -48, dy -4).
         Centred 14 above the ball it printed over the band sublabel at departure and then ran into
         the band caption. Line boxes at 1100x800 after fonts.ready: 394.2..406.5 at departure,
         between the sublabel bottom (394.2) and the band face (408), and 440.2..452.5 at arrival,
         above the Pod top (454). Its right end, 867.7, stays 14.3 left of the lane, so it never
         reaches the caption at 896. At 1280x860 and 1600x1000 the departure box starts at 393.5
         and 393.7, 1.4 and 0.7 above the sublabel box bottom (394.9, 394.4): the line boxes touch
         and the ink stays clear. Arrival bottoms 453.1 and 452.6, right ends 868.6 and 867.2.
CONTENT  The claims are read against 1.35 (`k8sVersion`): the CSI spec, the kubernetes-csi book
         (csi-driver-object.md, external-attacher.md) and, where the docs are silent on who makes
         and removes the staging directory, the kubelet volume code (pkg/volume/csi/csi_attacher.go,
         csi_plugin.go).
         EVERY CALL BUT THE LAST IS CONDITIONAL, and the card says so rather than drawing a
         universal chain. The desc and the aria-label say `up to four gRPC calls`, never `four`.
         CreateVolume runs `for a dynamically provisioned claim`: a pre-provisioned PV skips it, and
         the spec ties it to the CREATE_DELETE_VOLUME capability. ControllerPublishVolume runs `if
         the driver requires attach` (narration), `on a driver that requires attach` (aria-label),
         `where attach is required` (desc): Kubelet skips attach when the CSIDriver sets
         attachRequired false (csi_plugin.go skipAttach), and the external-attacher serves drivers
         that "advertise the CSI PUBLISH_UNPUBLISH_VOLUME controller capability". NodeStageVolume
         runs `on a driver that stages`: the spec ties it to STAGE_UNSTAGE_VOLUME, and Kubelet logs
         "STAGE_UNSTAGE_VOLUME capability not set. Skipping MountDevice". `Four gRPC calls run in
         order` and `ControllerPublishVolume attaches it to the Node` are rejected as the
         unqualified form. The desc says `the other three undo in reverse`, since nothing undoes
         CreateVolume.
         `This is a cloud operation` on attach is rejected: a CSI backend need not be a cloud. It
         ships as `Here that is a cloud API call`, scoped to the drawn cloud disk. The create
         narration and `Cloud Disk vol-1` describe this example, not every driver, and stay.
         Formatting is `if still blank` in the desc, the aria-label and the stage narration, and
         `formatted if blank` on rung 3. `formatted, mounted once` is rejected as an absolute and
         `if needed` for saying less than the other two. The spec asks NodeStageVolume only that the
         CO "can use the staged volume as described", so formatting a blank filesystem volume is
         the node plugin at work, not a spec step.
         THE STAGING PATH IS A DIRECTORY KUBELET MAKES AND REMOVES. The spec: "The CO SHALL be
         responsible for creating the directory if it does not exist." csi_attacher.go MountDevice
         runs MkdirAllWithPathCheck on the deviceMountPath right before NodeStageVolume, and
         UnmountDevice runs removeMountDir after NodeUnstageVolume ("Delete the global directory +
         json file"). So the band is born on `stage`, `at a global staging path Kubelet has just
         created`, and fades on `unwind` with `NodeUnstageVolume unmounts the staging path and
         Kubelet deletes it`. A band drawn from the first frame and still standing after unstage is
         rejected: it draws a directory that does not exist. The path is
         plugins/kubernetes.io/csi/<driver>/<sha256 of the volume handle>/globalmount under the
         Kubelet root (makeDeviceMountPath), which the sublabel `.../globalmount` abbreviates.
         THE PUBLISH BIND IS THE USUAL PATH, NOT THE SPEC. The spec never names a bind mount for
         NodePublishVolume, so the narration says `It usually does not mount the disk again: it
         bind-mounts`, the desc `usually by bind` and the aria-label `usually as a bind mount`, the
         reading storage-mount-path-chain states. `It does not re-mount the disk. It bind-mounts` is
         rejected as the absolute. The drawn publish IS that usual path, so the wire `bind-mount, no
         remount`, the chip `bind mounts` and the Pod sublabel `private bind mount` describe this
         example and stay.
         WHERE IT LANDS. The NodePublishVolume target is the Pod volume directory on the host
         (pods/<uid>/volumes/.../mount), and the container runtime binds that into the container,
         the reading storage-csi-architecture states. Rung 4 is `mounted into the Pod directory`,
         the narration `into this Pod private directory, which the runtime binds into the container
         as /data`. `bind-mounted into the Pod` is rejected for naming no directory and asserting
         the bind, `surfaces as /data` for hiding the runtime bind.
         ORDER. NodeStageVolume "MUST be called and return success once per volume per node before
         any NodePublishVolume", every NodeUnpublishVolume comes before NodeUnstageVolume, and with
         both capabilities NodeUnstageVolume returns before ControllerUnpublishVolume (spec), which
         is `Only then does ControllerUnpublishVolume detach the disk`. The disk survives the unwind
         because DeleteVolume belongs to the reclaim policy.
         Pod A is drawn from `publish`, when its container can start. The Pod object is already
         scheduled when attach runs, which the attach narration says in words.
BUDGET   Text widths are MEASURED via getBoundingClientRect and mapped back into viewBox units. Chip
         text and dim code labels are both 11px JetBrains Mono, so one rate sizes the chip strip and
         the band caption, with zero variance between strings at one viewport. The rate is NOT the
         same across viewports, because the glyph advances are rounded at the rendered size: 6.89
         u/char at 1600x1000, 6.30 at 1280x860, 6.13 at 1100x800, 6.08 at 900x650. A width is
         quoted with its viewport, and a ceiling or a clearance is taken at 6.89, the widest.
         The ladder rows measure the same rate over two characters fewer than their source (6.54 to
         6.64 per source character at 1600x1000): SVG collapses the double spaces either side of
         the separator, so a 55-character rung draws 53.
NAMING   Two labels are deliberately EXEMPT from `T-10` because capitalizing them would make them
         WRONG rather than merely styled: the device is a literal kernel path and there is no
         /dev/Nvme1n1 on any machine, and node-1 in the chip values is a hostname. The frame label
         `Node-1` is uppercased by the primitive anyway.
         The Pod sublabel names what NodePublishVolume creates and deliberately does not repeat
         `/data`, which the container box carries: two labels saying the same path would make the
         Pod read as one fact printed twice.
SCOPE    Two Pods sharing one staged device is NOT drawn here, and no card draws it: the stage
         narration SAYS stage is once per node, since that is why stage and publish are two calls,
         and per-Node sharing belongs to storage-access-modes. The mount namespaces those calls land
         in, and how the node plugin mounts reach the host, belong to storage-mount-path-chain,
         which names the calls without re-telling them. Deleting the disk is storage-reclaim-policy,
         and what triggers the detach is storage-volumeattachment.
NOTE     `P.node` carries its own label RELATIVE to the frame group. Let it place it: appending a text
         with an ABSOLUTE x into a group already carrying translate(624,192) renders x=640 at 1264,
         past the viewBox.
         Z-order puts the LADDER last of all: it is the reader's index into the story and its lit
         rung must stay crisp even when a ball is passing.
WHY NOT  Hand-typed column widths 508 / 560: the content bbox lands at 60..1178, centre 619, visibly
         shoved right.
         Leave the CSI controller inside the node column level with the cloud disk: that puts EVERY
         block in the right half, content bbox 624..1140 centre 882, with the whole left half below
         the panel blank apart from the ladder. The one off-node actor on the off-node side puts a
         block on each side and takes the low content to centre 592.
DO NOT   Measure before `document.fonts.ready`. An early sample reads the fallback
         monospace, 6.59 u/char at 11px on all three harness viewports: 4 percent under the
         1600x1000 rate and 5 and 7 percent over the 1280x860 and 1100x800 ones, so its error
         changes sign with the viewport, and the caption ceiling derived from it, 32, is one
         character too loose. Do not eyeball off a screenshot.
         Measure the Pod string in that fallback (107.9 for `private bind mount`, against 108.5 to
         113.3 in the webfont).
         Shrink the ladder rungs to the text: that breaks the column mirror.
         Hand-type STAGE_ELBOW_Y, or changing DEV_H strands it mid-gap with no test catching it.
         Hide only the blocks and leave the four lanes drawn from frame one: the card then opens on
         an arrowhead pointing into empty canvas and one more pointing at a Pod that does not exist
         yet.
         Fade a Pod in at 0.5 and ramp to 1, on the theory that a Pod with no volume yet has not
         started: Pod A then sits visibly greyed out for three steps next to blocks at full and
         looks broken rather than pending. The device and the staging band follow the same rule
         rather than `C-14` dimming.
         Name the container box in a `lights` list at packet arrival: /data stays outlined for the
         rest of the step after the blink has decayed, so the Pod reads as permanently mid-event.
NOT A DEFECT
         The ControllerPublish and NodeStage tags ride centred 14 above their ball and cross the
         bottom rim of the cylinder they leave for the first ~25 units. The packet layer draws them
         over the rim, and the label above them stays clear, the reading storage-csi-architecture
         records for its NodePublish tag.
         Two band captions stand without the band for a moment. On `stage` the wire `mount once
         per node` is written as the step starts and the band materialises beside it within
         REVEAL_MS 500, and at the end of `unwind` the wire `unpublish, unstage, detach` stays in
         the emptied node as the record of what emptied it. A wire takes no opacity (storage
         CLAUDE.md), so hiding either would take an F.run for no gain in meaning.
OPEN     TWO STANDARDS, AND THEY DISAGREE. The harness samples 1600x1000, 1280x860 and 1100x800 only
         (`report/geometry-soft.test.mjs` OCCLUDED, `report/overlay.test.mjs`), where this card's
         panel bottoms out at 229.82. The 900x650 row above is a wider hand sample and is the
         stricter number, by 145 units on `stage` and `unwind` (374.7). The CSI controller at y=268
         clears 229.82 by 38 and is reported CLEAN, but at 900x650 it is behind the panel on every
         step, and the top rung of the ladder clears that panel by 45.3. There is nowhere else
         for it: from LAD_Y 420 down the left column is the ladder, and its left-column
         placement exists to get a block out of the right half. If the panel is ever clamped in CSS,
         this card gets margin back.
```
