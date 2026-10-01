## storage-emptydir

### layout

```
WHAT     One emptyDir followed across three lifetime boundaries: the Kubelet creates it empty when
         Pod web-a is assigned to Node-1, both containers share it, an app restart keeps it, the
         eviction deletes it, and the replacement Pod web-b on Node-2 gets a new, empty one because
         `emptyDir: {}` names no source to bring back. The last step is a captioned counterfactual:
         the same volume with `medium: Memory`.
LAYOUT   Multi-Node band. Node-1 (40..560) and Node-2 (640..1160) mirror about x=600, each holding
         one Pod over one emptyDir cylinder on the frame centre, so the move is read left to right:
         the directory is born, shared and deleted on the left, and a second one is born on the
         right. Both sites come out of ONE `site()` factory, so the Node-2 directory reads as the
         same kind of thing and only the ledger says it is new. The lever no sibling in the section
         carries is `chiprow`: one ledger of six chips (Pod, emptyDir, /cache, app restarts, medium,
         sizeLimit) under both frames, spanning them outer face to outer face, so which values
         survive a step is read off one row. The claim contrast is one narration clause on
         `replace` and nothing on the canvas.
PANEL    Measured bottom lo..hi per viewport: 107.67..142.56 at 1600x1000, 128.92..171.42 at
         1280x860, 155.28..180.12 at 1100x800, the deepest reading on the `create` step (and the
         poster, which previews it), and equally on `drain`, `replace` and `memory`, six lines each
         at 1100x800: `OVERLAY_IDS=storage-emptydir node --test report/overlay.test.mjs` from
         `scheme/test/`.
         Node-1 starts left of x=420, so its top (216) and its label baseline (234) sit below the
         deepest reading, 36 units clear of it. A seventh line is the limit: it takes the bottom to
         204.97, 11 units from the frame top. Re-measure before adding a word.
SIZES    Pods are 480 by 104, not the catalog 232: two 192 by 44 containers side by side
         (20 + 192 + 56 + 192 + 20). The height, the containers and the cylinder (176 by 96, label
         at h/2 + 10) are catalog sizes. The cylinder sits 16 above the frame floor (440..536), as
         low as it goes, so each lane runs 128 down from the Pod floor and 24 across into a side
         face, 152 in all. Chips are derived, not typed: six on a 16 gap filling 40..1160, the
         outer faces of the two frames, so each is 173.33 wide. Measured after fonts.ready at
         1600x1000, the tightest pair is `medium` | `node storage` at a 25.3 unit gap, then
         `emptyDir` | `on Node-1` at 32.2.
LANES    Two one-way lanes per site, mirrored about the Pod floor midpoint at 112 either side (L-12)
         and each entering a cylinder side face at its midpoint (L-11), fed by the one array its
         ball rides. A lane ends on the Pod, never on a container inside it, and the container
         that acts is the one lit: every request the Pod sends, a write or the `ls /cache`, goes
         down the left lane into the left face, and every read, by the app or the sidecar, leaves
         the right face and comes up the right lane. Once
         the ends are on the Pod the old sidecar read lane and app return lane are the same
         dir-to-Pod lane, which is why there are two and not three. The two do not nest, so each
         tag has a clear side: a nested pair, and a pair dropping straight onto the cap between
         the two blocks, both leave a tag nowhere to land clear of the receiving block (M-30a).
         All four are ridden: write1 and read1 on `share`, read1 on `restart`, write2 (`ls
         /cache`) and read2 (`no files`) on `replace`, write2 and read2 on `memory`. A lane is live
         only while both of its ends are: `stage()` puts every Node-1 lane to 0 when the Pod goes
         (A-14), and every Node-2 lane is born with its directory (STO.S-02). The `if medium:
         Memory` caption sits between the two lanes, 48 under the Pod floor.
MOTION   Every ball rides routeDur, which puts the 152 unit legs on the 700ms floor, and no
         explicit `dur`, so the card is not in the motion PACING list. Every tag lives exactly as
         long as its ball (M-30a): `makeRidingLabel({ inMs: 200, outMs: 200, hold: 0 })`, the
         ball's own 200ms fades, so it shows from departure and dissolves with the ball on arrival,
         as on network-dualstack. Each rides outside its lane and 16 below the ball: the write tag
         at dx -32 (`ls /cache` at -41), the read tag at dx 32 (`no files` at 38), 34 to 43 units
         from the ball. Sampled every 25ms through the final fade at all three viewports, no tag
         inks a block border, the cylinder or a lane. With the step motion at 700ms legs, `share`
         and `memory` run 4000 and `replace` 5200, each over its span with about 700 of still time.
         A sender is lit BEFORE its ball appears: the 900ms Pod pulse runs on the boxes inside the
         Pod group and masks the app highlight until it ends, so a ball leaving at afterPulse (800,
         fading in from 600) left an app that read as dark. Every app ball leaves at SEND,
         afterPulse + 500: on `share` and `memory` the app is in `lit`, shows lit from 900 and its
         ball fades in at 1100. Played in real time at 1600x1000 the app reads steadily lit 200 to
         300ms before its ball on `share`, `replace` and `memory`. The directory lights on the
         landing and hands on after one hop, and on `restart` the directory, outside the Pod
         group, is lit from entry. On `replace` the app lights by `F.light` on the beat its new
         directory lands, not from entry: lit at entry it would glow while web-b fades in and
         before the emptyDir exists, which the card says cannot happen, and its `ls /cache` leaves
         SEND after that beat. So the `no files` answer lands on a lit app and carries no cue of
         its own.
         `create` and `replace` birth their blocks with FADE.in, the Pod first, then its directory
         with the mounts. `drain` blinks the Pod at full, fades it at afterPulse, and the
         directory follows 250 later. Chips turn over on the beat that earns them (step `chips`
         plus an F.set with `lights`): the write landing, the fade that births a directory, the
         eviction beat. Only the unchanged values and the `memory` premise (medium, sizeLimit,
         `in RAM`) are `chipsCued`.
CONTENT  Read against the raw kubernetes/website markdown and the release-1.35 kubelet source.
         volumes.md: created "when the Pod is assigned to a node", "initially empty", shared by "All
         containers in the Pod", safe across crashes because "A container crashing does not remove a
         Pod from a node", and "When a Pod is removed from a node for any reason, the data in the
         emptyDir is deleted permanently". `before any container starts` is kubelet.go SyncPod,
         which waits in WaitForAttachAndMount before containerRuntime.SyncPod starts anything. The
         Memory claim is the volumes.md wording, "files you write count against the memory limit of
         the container that wrote them", and it holds beside manage-resources-containers.md, "The
         memory limit for the Pod or container can also apply to pages in memory backed volumes":
         `count against the Pod memory limit` as the charging rule is rejected, because the Pod
         limit bounds the volume SIZE, not whose limit a byte is charged to. The size is
         calculateEmptyDirMemorySize in pkg/volume/emptydir: node allocatable, lowered to the Pod
         memory limit, lowered again to sizeLimit only when that is smaller. So the narration says
         the tmpfs is "capped at the 256Mi sizeLimit, or at the Pod memory limit if lower", and `a
         256Mi sizeLimit sizes the tmpfs, so a write past it fails` is rejected: with a lower Pod
         limit the tmpfs is smaller than 256Mi. The default medium is "whatever medium that backs
         the node", so the narration says `Node-1 storage` and the chip `node storage`, never `the
         Node-1 disk`. The drain names `--delete-emptydir-data` because kubectl drain refuses a Pod
         with an emptyDir without it ("Pods with local storage (use --delete-emptydir-data to
         override)", kubectl pkg/drain/filters.go), and `cordoned so no new Pod lands there` is the
         kubectl reference, "marked unschedulable to prevent new pods from arriving". The controller
         makes the replacement under a new name: `web-b`, never a moved `web-a`. The replacement
         lands on Node-2 BECAUSE Node-1 is cordoned, nothing else. The claim clause says a
         claim-backed volume "would be found again through its claim", and never that its data
         follows to any Node: a PV with node affinity limits where it can go. The sharing claim
         is scoped to the containers that mount the volume, `every container that mounts it`, in
         the `share` narration and the desc: `every container in the Pod sees the same files` is
         rejected because a container with no volumeMount for it sees nothing, and volumes.md
         itself hedges it as "can read and write the same files, though that volume can be
         mounted at the same or different paths in each container". The Pod memory limit as the
         tmpfs ceiling holds against manage-resources-containers.md, "the maximum size of an
         emptyDir volume will be the pod's memory limit", and with no sizeLimit and no limit
         "memory-backed volumes are sized to node allocatable memory" (volumes.md). The
         `emptyDir.mode` field is behind the EmptyDirVolumeMode gate, alpha from 1.37, so the
         1.35 card draws no permission bits.
BUDGET   The deepest steps are `drain` at 250 characters, `replace` at 247 and `memory` at 245, with
         `create` at 226: all four wrap to six lines at 1100x800 and read 180.12. A seventh line
         reaches 204.97 and eats the frame margin, which a 257 character drain does.
NAMING   `Pod web-a` and `Pod web-b`, the ReplicaSet form where every replacement is named afresh
         (`web-0` is the StatefulSet form, where the name carries over). `part-1` and `part-2` are
         file names, so a tag is the literal traffic. The replace step lists the directory
         (`ls /cache`, answered `no files`) because a ball tagged `empty` would carry nothing.
SCOPE    Ownership inside the Pod belongs to storage-volume-model, where bytes live and how long each
         home lasts to storage-volume-data-homes, and the overlay a container writes outside any
         mount to storage-container-filesystem. PV and PVC mechanics belong to volumes-claims and
         attach and mount to csi-mount-path. A disk emptyDir over its sizeLimit and
         limits.ephemeral-storage belong to storage-ephemeral-storage-eviction, and node-pressure
         eviction to cluster-node-pressure-eviction: this card says tmpfs sizing only.
DO NOT   Do not give a container a crash flicker: the restart is the Pod blink and the count, and
         the app box stays at full. Do not draw the claim: one clause is the contrast, and a drawn
         claim is the card this one absorbed.
NOT A DEFECT
         motion.mjs lists every container box brightness as SUSPECT: it is the Pod pulse reaching
         the boxes inside the Pod group, which M-03 asks for.
```
