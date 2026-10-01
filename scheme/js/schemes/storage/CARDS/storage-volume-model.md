## storage-volume-model

### layout

```
WHAT     THE ANCHOR CARD of the storage category and the gateway of volume-foundations. One Pod,
         one volume declared once under spec.volumes, three containers that each opt in through
         their own volumeMounts, and a lifetime row per object showing the volume living exactly
         as long as the Pod while every container comes, goes or restarts inside it.
LAYOUT   Nested containment over a time axis, three zones. Right of the panel the Pod 432..1168 by
         60..400: a container row seed | app | log-shipper at 104..184, and one wide disk
         480..1120 by 284..364 under the whole row, so every mount drops straight down into the
         same volume and each file (config.json, app.log) sits inside the disk under the lane that
         writes it. Left under the panel the Pod spec as a P.chain ladder 32..392 from y 278: the
         volumes entry and one volumeMounts entry per container, lit by the step that uses it, so
         the spec and the runtime picture read side by side. Across the floor a timeline, five
         rows (Pod, Volume cache, seed, app, log-shipper) by five phase columns, each cell a bar
         revealed by the step it belongs to: the cache row is the Pod row cell for cell, seed holds
         one cell, and the app restart cell appears last in its column. The subject is OWNERSHIP, and the
         timeline says it as length where containment says it as place. No chip strip: the file
         boxes, the Pod phase sublabel and the timeline carry what the strip used to.
PANEL    `OVERLAY_IDS=storage-volume-model node --test report/overlay.test.mjs` from `scheme/test/`.
         Deepest on the poster frame at 1100x800. Everything left of x 420 starts at the ladder
         caption, baseline 266, and the Pod starts right of 432, so the narration may deepen the
         panel by the gap between that caption and the deepest reading before anything is covered.
SIZES    The containers are 200 by 80, not the catalog 232: three peers with two 44 lane gaps and
         24 insets inside a shell that must start right of the panel wall at 420 and end 32 from the
         canvas edge, 24 + 3 x 200 + 2 x 44 + 24 = 736. At 232 the row wants 832 and the shell runs
         to 1264. The disk is 640 wide so it sits under all three mounts, 80 tall like the boxes.
         File boxes 120 by 28, timeline bars 188 by 16 with a 4 gap, the ladder rows 360 by 28.
LANES    Four one-way vertical mount lanes, every one ridden, each entering the disk at the top
         edge of its cap ellipse (capTop in the module). seed down at 556, the app pair LANE_DY 12
         either side of 800 (788 up is the read, 812 down the write), log-shipper up at 1044, since
         the shipper only reads. Each lane appears WITH its container and its mountPath caption
         (STO.S-02), and seed, its lane and its caption go to terminated together. The timeline
         rows stand on a relation 3 under the bars, so a row with no cell still reads as a row.
MOTION   Five tagged balls over four steps ride LEG_DUR 580, 20 percent faster than the 700ms floor
         routeDur puts the 100 unit lanes on, so the card is in the motion PACING list at 5 with
         5 CLAMP findings sanctioned (M-13). Every tag lives exactly as long as its ball (M-30a:
         inMs = outMs = 200, hold 0), below it and on the side of its lane away from the mountPath
         caption, down tags 24 below and up tags 28 below. The Pod pulses at entry and each ball
         leaves at SEND, afterPulse + 500, as on storage-emptydir, because the 900ms pulse masks a
         lit sender until it ends: seed (lit through rewind, animated path only), the volume, or
         app. A file box reveals when the write that makes it lands. The cells of a phase reveal at
         the start of its step, except the restart cell of the app row, which reveals 500 in, when
         the app sublabel turns to restarted. Every cell is the full 188, the restart one included.
         DO NOT add a crash flicker: too blinky. The restart is carried by the app sublabel and the
         late app cell, and the app box stays at full strength.
CONTENT  Read against the Kubernetes 1.35 docs (volumes.md, init-containers.md, pod-lifecycle.md).
         A volume is declared at Pod level (spec.volumes) and reached only through a container's
         own volumeMounts entry: "For each container defined within a Pod, you must independently
         specify where to mount each volume". The narration and the desc name the TYPE, emptyDir,
         because "created empty" and "until the Pod leaves its Node" are true of emptyDir only, and
         a volume sentence with no type reads as true of every volume (a PVC outlives the Pod).
         Creation ships as "when the Pod is assigned to a Node, before any container starts", the
         docs own verb ("the volume is created when the Pod is assigned to a node"); "lands on" is
         rejected as looser than the source. "Before any container starts" rests on pod-lifecycle:
         volumes are mounted after admission, and "Image pulling and container creation occur
         after this point" (kubelet SyncPod calls WaitForAttachAndMount before the runtime).
         The end of the volume ships as "lasts until the Pod leaves its Node". "Only deleting the
         Pod removes this volume" is rejected: "When a Pod is removed from a node for any reason,
         the data in the emptyDir is deleted permanently", which covers eviction and a lost Node,
         not deletion only. The timeline therefore starts both bars at the column `on a Node`.
         The restart ships as "starts clean outside the volume". "starts on a clean filesystem" is
         rejected: the docs say "kubelet restarts the container with a clean state", but a reader
         then sees app.log in that same filesystem, so the clean part is named as what lies
         outside the mount. "The data in an emptyDir volume is safe across container crashes".
         The init container: "They can, however, use shared volumes for data exchange", and it
         runs to completion before any app container starts. Its sublabel "init, Completed" is the
         Terminated state reason the runtime reports on exit 0 (containerd completeExitReason =
         "Completed").
         readOnly on the log-shipper mount is the VolumeMount field: "Mounted read-only if true,
         read-write otherwise (false or unspecified). Defaults to false". It is the plain field, not
         recursiveReadOnly, which is storage-recursive-readonly. The field belongs to the MOUNT, so
         the log-shipper sublabel ships as "running": "running, read-only" is rejected because it
         reads as a property of the container. The Pod sublabel reads status.phase Pending through
         init and Running once app and log-shipper start: Pending covers the time "one or more of
         the containers has not been set up and made ready to run", and Running is "bound to a
         node, and all of the containers have been created".
         The restart ships as "restartPolicy Always, the default, restarts it in the same Pod":
         "The default value is Always", and a bare "is restarted" states the default as the
         mechanism, since OnFailure and Never restart differently. The share step ships "That is
         the usual way two containers of one Pod share files" and the desc "the usual way
         containers of one Pod share files": "exactly like this" and "which is how" are rejected
         as absolutes (a shared process namespace is another path).
         The aria-label says every container bar is "shorter" than the cache bar, not "shorter or
         broken": every cell is the full width, the restart one included.
         Verified against the 1.35 pages without a change: "the volume is created when the Pod is
         assigned to a node", "When a Pod is removed from a node for any reason, the data in the
         emptyDir is deleted permanently", "The data in an emptyDir volume is safe across container
         crashes", "After a crash, kubelet restarts the container with a clean state", "Init
         containers always run to completion", "They can, however, use shared volumes for data
         exchange", "you must independently specify where to mount each volume".
SCOPE    Where the bytes physically live and how long each home lasts belongs to
         storage-volume-data-homes, the Pod-deleted and rescheduled fate, emptyDir medium and
         sizeLimit to storage-emptydir, what a container writes outside any mount to
         storage-container-filesystem, and read-only that reaches submounts to
         storage-recursive-readonly. The timeline ends at the restart column: what happens to the
         bars when the Pod leaves its Node is storage-emptydir.
NOT A DEFECT
         The volume drawn INSIDE the Pod is ownership, not location: storage-volume-data-homes draws
         the same emptyDir bytes on the Node disk, and both are true. The shell says whose lifetime
         the volume shares.
         seed at OPACITY.terminated from init onward is the finished shade (C-09), and its label
         reads faintly while later narration names it. The narration says seed no longer runs,
         and the ghost is that claim drawn: the container no longer runs, the file stays.
         The Pod pulse brightens every box inside the group, motion.mjs flags those as SUSPECT: a
         Pod pulses with everything inside it (M-03).
OPEN     report/geometry-soft.test.mjs prints CENTRE twice and CENTRE-LOW once. The ladder is a
         P.chain, which the rule reads as a chip strip centred on 212, and the row labels of the
         timeline at x 40 are tags it does not count, so the content reads 200..1168 on 684. The
         whole ink spans 32..1168 on centre 600. Carried in fixtures/carried.mjs with this reason.
```
