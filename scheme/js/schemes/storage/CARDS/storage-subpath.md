## storage-subpath

### layout

```
WHAT     A subPath mount is resolved when the container starts, to one concrete file inside the
         volume, and bind-mounted there. It places one file into a directory the image already
         fills, and the ..data flip that updates the volume never reaches it until the container
         restarts.
LAYOUT   Two readers of ONE volume, compared, with the volume drawn INSIDE the Pod: spec.volumes is
         a Pod field, and every lane stays either inside one frame or between two blocks, never from
         inside a frame to outside it. The whole card mirrors about x 600. Kubelet sits centred over
         the Pod with ConfigMap level with it on the right, and ConfigMap points left into Kubelet,
         which drops the write straight down onto the Pod top face midpoint. The Pod runs the full
         width under them and holds the volume row across its top, `v1 <- ..data -> v2`, ..data on
         the axis and the directories mirrored over the two containers, with horizontal pointers and
         no frame of its own (a frame would put both reads through its floor again), captioned
         `volume config` on its left. The row is part of the Pod group, so it pulses with the Pod
         like the two containers. Proxy sits straight under the v1 file, web under the v2 directory
         and fed from ..data along the gap between the rows. The Pod name sits top left, because
         centred the write would land on it. Under the Pod a 2x2 ledger, one column per container,
         rows `mount` and `reads`. From the flip on, the v1 box is relabelled `app.conf v1` /
         `deleted, bind holds it`: the directory is gone and only the file the proxy bind mount pins
         is left. The subject is a SPLIT between two mounts of the same data, so each reader gets
         its own column and the split lands on steps dir-v2 and pinned both in the grid and in the
         container sublabels. No sibling in the section carries a chip grid, and every sibling
         stacks its Pod on top of a volume drawn outside it, where this one draws the volume as the
         Pod's own.
PANEL    Measured bottom lo..hi per viewport: 107.67..177.44 at 1600x1000, 128.92..213.92 at
         1280x860, 130.43..254.66 at 1100x800, the deepest reading on the `pinned` step:
         `OVERLAY_IDS=storage-subpath node --test report/overlay.test.mjs` from `scheme/test/`.
         Everything above y 282 starts at x>=420 (Kubelet at 484), and the Pod starts at y 282,
         27 below the deepest reading. A longer narration on `pinned` spends that margin first.

SIZES    The containers, ConfigMap and Kubelet are the catalog block, 232 by 80 (NET.L-01). The
         widest string in any of them, measured after fonts.ready at 1100x800, is the Kubelet
         sublabel `writes volume, binds subPath` at 171.8, 30 a side, then the proxy sublabel
         `mounts /etc/nginx/app.conf` at 159.5. The actor row is 140..220: Kubelet 484..716,
         ConfigMap 860..1092, 144 apart so the ConfigMap tag has room between them. The ..data box
         and the two version directories are entries of the volume, not actor blocks: one row 48
         high at 312..360, ..data 140 wide on x 600 and the directories 164 wide on 340 and 860
         (SIDE_DX 260), 108 from ..data on each side, each over its container. The Pod is 100..1100
         by 282..532 and carries no sublabel: at its floor it would collide with the proxy caption,
         and `volume config` plus the ledger say what it said. Ledger chips are 300 wide, the
         tightest pair `proxy reads` plus `still app.conf v1` leaving 83 units between name and
         value at 1100x800. The 2x2 ledger ends at 628, 16 under the Pod floor at 532, and above the
         dialog controls on every viewport.
LANES    Four one-way lanes and two relations, every lane pinned at 1 on every step. The two reads
         start on the volume row floor and end on a container top inside the Pod: v1 to proxy is a
         straight 56-unit drop, ..data to web turns along the gap between the rows at y 388, under
         the v2 directory. ConfigMap to Kubelet runs straight left at y 180, and the write runs 62
         units down the x 600 axis from the Kubelet floor to the Pod top face midpoint. The write
         lane is standing on every step: it ends on the Pod, which always exists, not on the v2
         directory. The ..data pointers are markerless relations and the flip is a fade between
         them, never a ball.
MOTION   Every tagged ball rides LEG_DUR 1500, not routeDur: the v1 bind and the write legs are 56
         and 62 units and sit on the 700ms floor, where the tag retires unread. Registered in the
         motion PACING list at 6. Every tag lives exactly as long as its ball (M-30a) and TRAILS it
         out of the block it leaves: the ..data read tag rides 44 ahead and 6 above, over the gap
         lane and under the v2 directory, emerging 300 in; the v1 tag rides 38 right of the short
         drop, emerging 550 in once clear of the v1 floor; the ConfigMap tag rides 42 behind and 10
         above its leftward ball, emerging 150 in once clear of the ConfigMap left face, and lands
         short of the Kubelet right face; the write tag rides 40 right and 6 above its drop,
         emerging 500 in, and lands over the Pod top. Every ball leaves a lit sender on BEAT.lead:
         ..data on dir and dir-v2, the v1 box on subpath and pinned, the ConfigMap on update. On
         update Kubelet lights as the change lands, the write leaves one hop later, the v2 directory
         fades in and lights and the Pod blinks as the write lands on the Pod top, and the pointer
         swap and the ..data light land one hop after that, so no pointer moves while a ball is in
         flight. The v1 relabel is an F.set 400 after that, so the old directory goes only once
         ..data points away from it. A box lit on the same arrival as a Pod blink stays lit through
         it: the kit pulse ramps from and back to whatever the rect shows. The two payoff steps hold
         800 past the blink so the split can be read off the ledger.
CONTENT  Read against kubernetes.io (volumes.md, configmap.md, projected-volumes.md) and, where the
         docs are silent, kubernetes/kubernetes source, for k8sVersion 1.35.
         resolve: `Kubelet resolves that path ... when the container starts` holds. makeMounts runs
         from GenerateRunContainerOptions on every container start, and subpath_linux.go
         doBindSubPath runs `filepath.EvalSymlinks` on the path, then bind-mounts the resolved file
         under volume-subpaths. `resolves it once` is rejected: it reads as once per Pod.
         restart: `Proxy sees v2 once its container restarts` holds. On a restart
         checkSubPathFileEqual finds the old bind on a different inode, unmounts it and binds the
         v2 file (PR 89629 fixed exactly this restart path). `once a new container resolves the
         path again` is rejected as vaguer than the source, and `never picks up an update` as an
         absolute the restart breaks.
         delete: atomic_writer.go step 12, `The previous timestamped directory is removed`, after
         the ..data rename. So the v1 directory is deleted on the update step and the v1 box is
         relabelled rather than kept as `..2026_09_19_10_00`, which would draw a directory that no
         longer exists. The running proxy still reads v1: its bind mount pins the v1 file, which is how
         the restart bug PR 89629 fixed arose (the bind source was gone).
         in place: `Kubelet does not edit the files in place` holds: AtomicWriter writes a new
         timestamped directory and renames ..data_tmp over ..data, never rewriting a published
         file.
         no-update: the docs state it per source: ConfigMap and Secret (`will not receive ...
         updates`), downward API (`does not receive updates`) and projected (`will not receive
         updates for those volume sources`), so all four are named on step 5 and in the desc.
         Kubelet: `writes volume, binds subPath` names both jobs the card lights it for.
         `writes the volume` is rejected: step 2 lights Kubelet as the subPath resolver.
         image: the nginx image ships /etc/nginx/nginx.conf and /etc/nginx/mime.types
         (nginx/pkg-oss debian/nginx.install), so the caption holds.
         No feature stage in the desc: the subPath section states none.
         inside the Pod: the volume row is drawn inside the Pod frame because the Pod owns it,
         volumes.md: `specify the volumes to provide for the Pod in .spec.volumes and declare
         where to mount those volumes into containers in .spec.containers[*].volumeMounts`. The
         files themselves sit in the Kubelet directory for that Pod on the node, which the card
         does not draw, so the Kubelet write lands on the Pod rather than on a node disk.
         sources: all three cited pages still carry the no-update sentence the card rests on,
         read against 1.35: configMap `will not receive updates when the ConfigMap changes`,
         downwardAPI `does not receive updates when field values change`, projected `will not
         receive updates for those volume sources`.
NAMING   The two directories are `..2026_09_19_10_00` and `..2026_09_19_10_07`, the minute-cut
         prefix of the real `..YYYY_MM_DD_HH_MM_SS.<random digits>` name that
         storage-configmap-secret-mount also draws. The full name measures 208.6 against the 164
         box.
SCOPE    The ..data symlink swap, its atomicity and the update delay belong to
         storage-configmap-secret-mount: this card shows the flip only as the event the two readers
         disagree about and never says when it happens. That sibling carries no subPath step and
         names this card as the owner of the subPath update gap in its SCOPE. volumeMounts
         basics belong to storage-volume-model, projected sources to storage-projected-volume.
         subPathExpr (a per-Pod directory from a downward API variable) and one volume shared by
         several containers under different subdirectories are NOT on this card: each is its own
         sentence.
NOTE     The poster note lives in the comment above this card entry in posters.js, not in this record.
DO NOT   Do not draw a frame around the volume row, and do not run a lane from inside the Pod to a
         block outside it: every lane stays inside one frame or between two blocks. Do not put a
         ball on the ..data pointers: they are relationships. Do not dim a lane as a state. Do not
         light the v2 directory before the write lands. Do not label the v1 box `..2026_09_19_10_00`
         after the flip: AtomicWriter has deleted that directory.
```
