## storage-mount-path-chain

### layout

```
WHAT     The L5 floor of the section. A mount is an entry in the mount table of one mount
         namespace, not a property of the disk: the CSI node plugin runs in a container, so its
         mounts reach the host table only because its Kubelet directories are Bidirectional binds of
         a shared host mount, one peer group, and the app sees the volume only as a bind the runtime
         copies into its own table when the container starts, private by default. It opens on the
         question a reader of a CSI DaemonSet manifest has already asked (how can a container mount
         something for the host) and goes down to the kernel to answer it.
LAYOUT   Three mount tables side by side in one Node-1 frame, centred on the canvas: Pod csi-node on
         the left, the host in the middle, Pod A on the right. The Pods are shells holding their own
         rows, so a table visibly belongs to its container, and the host table stands bare under a
         heading box, because the host namespace is the Node itself and not a container. The host is
         in the middle because every entry passes through it: the plugin and the app never talk.
         The rows share ONE pitch across all three tables, so an entry the kernel repeats in another
         table crosses one straight sideways corridor, 64 units row face to row face. The two peer
         links on the left are markerless relations and the three repeats are lanes, which is the
         asymmetry the card is about: plugin and host are peers (drawn mirrored, because a peer
         group is symmetric), host to app is a one-way copy.
         The host root row spans rows 0 and 1, since one host mount holds both Kubelet directories,
         so the two peer links meet its left face as a +-44 pair about its midpoint (L-12).
         Pod A has rows 0 and 3 and nothing between: its table never holds the staging mount, and
         the empty stretch says so.
         No cylinder, the lever 6 of 9 cards in the section carry: the disk never moves here, only
         table entries do, and every row that holds the volume names /dev/nvme1n1 in its sublabel.
         The whole card is one column on the canvas centre, 600, by an author ruling that holds even
         where the panel covers it: the frame 230..970 from y 28, the step 5 caption under it at
         516, and the chips, the mountinfo reading, two by two under that, 362..838, rows at 532 and
         578, foot 612, so 28 of air above and below. One row of four does not fit under a 740 frame
         (SIZES).
PANEL    The deepest reading is the `shared` step at 1100x800, bottom 304.36, right 396.55:
         `OVERLAY_IDS=storage-mount-path-chain node --test report/overlay.test.mjs` from
         `scheme/test/`. The frame starts at 230, so on the two smaller viewports the panel covers
         the top of the csi-node table: the frame label, the Pod label, the two Bidirectional rows
         and part of the staging row (OPEN). At 1600x1000, bottom 212.33 and right 290.77, every
         string reads.
SIZES    The Pods are 220 wide and 408 tall, sized BY their tables: four 180 wide rows at a 20 inset,
         a 52 unit head for the Pod label and a 28 unit foot for its sublabel. 220 is what three
         columns and two 44 corridors leave inside a 740 frame with 16 of padding.
         The rows are mount entries, not actors, and keep their 180 by 64. Measured at 1100x800 after
         fonts.ready: the widest label is `.../kubelet/plugins` 108.0, 36 either side, the widest
         sublabel `overlay, container root` about 141 at the 6.14 per character the 10px mono
         sublabels measure (`no namespace yet` 98.2 over 16), 19 either side. The Pod csi-node
         sublabel `CSI node plugin, privileged` is 165.6 in the 220 shell. The host heading box is
         180 by 40, `Host namespace` 95.7 and `Kubelet, runtime` 98.2.
         The chips are the family 232 by 34 at a 12 gap. Worst pair `peer group` 61.3 plus `plugin
         not in it` 98.2 plus 24 of inset, 183.5, so 48.5 of air, then `nvme1n1 on host` 92.0 plus
         `2 entries` 55.2 plus 24, 171. Four in one row under the 740 frame leave 176 each at the
         12 gap, under the 183.5 floor, hence two by two, 476 wide.
LANES    Every lane is one straight horizontal segment between two row faces at the row midpoint, and
         the same array draws the lane and carries the ball (A-02). A lane leaves a row INSIDE a Pod
         shell and crosses the shell wall: an endpoint inside a block is an arrival, not a crossing,
         so THROUGH stays clean.
         The step 5 ball rides W_STOP, the first 20 units of W_STAGE, from the row face to the Pod
         wall. It is the one ball on the card with no lane of its own, because the whole point is
         that it does not get as far as the next one.
         Every lane stays at full opacity on every step, the counterfactual included: what does not
         happen is said by the rows and the chips, never by a faded arrow. The two peer relations go
         to 0 on step 5, because under None the plugin mounts are not in the peer group at all.
MOTION   Steps 2 and 3 are up-arrow order: Pod csi-node blinks, its own entry fades from pending to
         full at BEAT.afterPulse, and the repeat leaves after that fade, so the mount is made in the
         plugin table before the kernel copies it. The host row lights and fades up on arrival, and
         the host chip turns over on the same arrival.
         Step 4 is down-arrow order: the host sends first (the heading and the host row are lit), and
         Pod A fades up and blinks when /data lands in it.
         Every ball rides a 64 unit corridor, so all of them run at the 700ms floor (M-13): the same
         length `storage-csi-attach-mount` and `cluster-pod-cgroup-hierarchy` run. The step 5 ball
         covers 20 units in those 700ms, the slowest ball in the catalog by pace.mjs, which is the
         reading wanted: it leaves the row and stops at the wall.
         Durations sit at 10.6 to 13.0 ms per character of narration (timing.mjs ranks them 322 to
         527 of 745), because the still time after a short motion is what the reading costs. The two
         motionless-heavy ends are held nearest the 11.0 median: `tables` is 3800, since its text is
         on screen for the poster dwell as well, and `without` is 5000, each still for 2900.
CONTENT  Read against the raw pages for 1.35. The volumes page, Mount propagation: None is equal
         to rprivate and is the default, but the CRI runtime may choose rslave, hence `rprivate by
         default` in step 4, and `private because mountPropagation None is rprivate by default` in
         the aria-label: `private because mountPropagation is None` is rejected as the unqualified
         form of the same claim (T-19). HostToContainer is rslave, Bidirectional is rshared and
         allowed only in privileged containers, with a typical use of a Pod with a CSI driver. The
         page cautions that propagation is recommended only with hostPath or memory-backed emptyDir,
         so HostToContainer is never offered as a CSI volume feature here, and step 5 says the
         plugin directories qualify because they are hostPath volumes in the driver manifest.
         The CSI deploying page: the mount point used by the driver must be Bidirectional to allow
         Kubelet on the host to see mounts created by the driver container, and its example sets
         /var/lib/kubelet/pods. The reference driver, csi-driver-host-path, sets both
         /var/lib/kubelet/pods and /var/lib/kubelet/plugins, which is why the card draws both.
         WHO MOUNTS. The plugin does not mount its Kubelet directories: its volumeMounts ask, and
         the runtime binds them (containerd internal/cri/opts/spec_linux_opts.go passes `rbind`
         plus `rshared` for Bidirectional). So step 2, the aria-label and the desc say the plugin
         volumeMounts give or set Bidirectional and the runtime binds, and step 2 says `the plugin
         itself` for the staging mount, which the plugin really makes. `The plugin mounts
         /var/lib/kubelet/plugins ... with mountPropagation` is rejected for crediting the plugin
         with the runtime's bind, and the step 5 opening and its caption follow it (`the plugin
         volumeMounts used None`, not `mounted those directories with None`).
         THE DEFAULT IS A CONTAINER DEFAULT. mount_namespaces(7): systemd remounts all mounts
         MS_SHARED at startup, so on most hosts a mount call propagates to its peers, and runc makes a
         container root rprivate, with a None volumeMount bound rprivate. So `tables` says `by default
         a mount call in a container changes only that list`. `a mount call changes only the list it
         runs in` is rejected: false on the host, which is the very table step 2 shows receiving one.
         mount_namespaces(7): a new namespace starts as a copy of its parent's mount list, a mount
         replicated into a new namespace or bind mounted from a shared mount joins its peer group,
         shown as shared:X in mountinfo, a child mount made under a shared mount is replicated
         under every peer, and systemd makes host mounts shared at startup, hence `shared on a
         systemd host`. Peer group IDs are assigned starting from 1, so shared:1 for the host root
         is plausible and still illustrative. containerd refuses Bidirectional unless the source
         mount is already shared (`ensureShared`), and on a host where it is not, Kubelet bind
         mounts its own root directory rshared at startup (hostutil DoMakeRShared), so there the
         peer group is /var/lib/kubelet and not /: the card scopes the host root to a systemd host
         and makes no claim for the other case.
         PATHS (kubernetes pkg/volume/csi): the staging path is the plugin dir plus
         <driver>/<sha>/globalmount, so under /var/lib/kubelet/plugins, and the NodePublish target
         is the Pod volume dir plus `mount`, so under /var/lib/kubelet/pods. Both therefore sit
         under a Bidirectional mount, which is why step 2 and step 3 each reach the host list.
         That NodePublish makes a bind is the ordinary path for a staged filesystem, not a CSI
         spec requirement, the same reading storage-csi-attach-mount states, so `bind` says
         `Publishing the volume to Pod A usually adds a bind mount`. The unqualified `adds a bind
         mount` is rejected (T-19): it states the ordinary path as the mechanism.
         THE APP BIND. containerd binds a None volumeMount with `rbind` plus `rprivate`, which is
         what `binds` in step 4 means and what storage-recursive-readonly relies on. `a new mount
         namespace for the container` in step 4 and `gives it its own mount namespace` in the
         aria-label: a mount namespace belongs to a container, not to the Pod, and `for Pod A` is
         rejected for implying one per Pod.
         THE COUNTERFACTUAL. Under None the plugin mounts stay in its namespace, so the host gets
         neither entry, which is what both host rows reading `no entry` say. `The host copy of the
         Pod directory stays empty` is rejected: the ball is the staging entry and both rows are
         empty, so it named one entry of two, and it mixed `stays` into a conditional. Kubelet
         could not see the mount is the deploying page's own wording. Pod A would get the empty
         host directory at /data, on the Node disk: Kubelet csi_mounter SetUpAt takes a successful
         NodePublishVolume at its word and runs no mount check on the target before the Pod
         starts (upstream source, the docs are silent), so the app writes land in a plain
         directory on the Node filesystem. The peer chip reads `plugin not in it`: `host root
         only` is rejected, true of the three drawn tables and false of a real host, where any
         Bidirectional container elsewhere is another peer of the host root.
BUDGET   A row is 180 wide, so a label holds about 23 characters of 12px sans and a sublabel about 27
         of 10px mono before it reaches the 10 unit pad. Paths are cut with `...` to fit, which is
         why no row carries a full /var/lib/kubelet path: the narration does.
NAMING   The plugin is `Pod csi-node` (T-11a) and its sublabel says it is the CSI node plugin, which
         is how the narration names it: the panel wraps `Pod csi-node` at its hyphen at 1100x800,
         so the narration says the plugin. The host column is `Host namespace`, not `Kubelet`, because
         both Kubelet and the runtime live in it and step 4 names the runtime.
         A row not yet in a table reads `no entry yet`, a table not yet created reads `no namespace
         yet`, and on the counterfactual step the host rows read `no entry`, since no later step
         fills them. There the peer chip reads `plugin not in it`, not `none` and not `host root
         only`: the host root row still reads shared:1 on that frame, only the plugin binds have
         left the group, and a real host root has other peers the card does not draw.
SCOPE    The four CSI calls, their order and why staging is once per Node belong to
         storage-csi-attach-mount: this card names NodeStage and NodePublish only as the events
         that create an entry. Two Pods sharing one staged device is drawn nowhere: attach-mount says
         it in prose and storage-access-modes owns the per-Node sharing. The driver halves and the
         registrar belong to storage-csi-architecture, overlayfs under / to
         storage-container-filesystem, subPath binds to storage-subpath, Block against Filesystem to
         storage-volume-mode, and the recursive read-only requirement row that names None to
         storage-recursive-readonly. The mountPropagation modes are explained HERE.
WHY NOT  Rows as a free-standing table under each Pod: the Pod then blinks alone and the table it
         owns stays still, and a Pod heading over a list reads as a label rather than a container.
         A mount stack with a cylinder under it, the grammar every other card in this section uses:
         it draws where bytes go, which storage-csi-attach-mount already draws, and it has no place
         for a namespace boundary.
DO NOT   Dim a lane to say a repeat did not happen. Every arrow is at full opacity on every step.
         Light a row the step does not create: plugR2 lights only on the counterfactual, where the
         entry it makes is the whole outcome.
OPEN     OCCLUDED, four blocks of the csi-node table, carried in `test/fixtures/carried.mjs`:
         `.../kubelet/plugins` and `.../kubelet/pods` 73 percent behind the panel at their worst,
         `.../globalmount` 19, the Pod shell 41. They follow from the ruling that the card centres
         on 600 however deep the panel reads, and the two covered rows are the binds step 2 names
         in full in its narration. Keeping the frame clear of the panel, 420..1160 on 790, is the
         rejected alternative.
```
