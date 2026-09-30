## storage-container-filesystem

### layout

```
WHAT     A container's root filesystem is one overlay mount. A read takes the highest layer holding
         the path, every change lands in the one per-container upperdir (a new file, a lower file
         copied up, a whiteout hiding a lower name) while the image layers never change, the upperdir dies with the
         container, and only a volume mounted over the merged tree skips all of it.
LAYOUT   A layer-precedence grid, the one grid in the section. Rows are the layers top to bottom
         (merged, upperdir, lowerdir app, lowerdir base), columns are four paths (/data,
         /etc/app.conf, /tmp/cache, /bin/tool), and a cell is drawn only where that layer holds that
         path, so which row answers a lookup is read straight off the column. The lever is `nopod`:
         overlayfs is a kernel mount inside one container and no Kubernetes object acts in any beat,
         so no container is drawn and the merged row IS the container on the canvas. Its row box
         says so (`what the container sees`), every narration that names the container points at
         that row, and remove empties the upperdir while the merged row stays as the replacement.
         The volume sits bottom-left under the panel floor on the 20 margin that mirrors the grid's
         right edge, so the content spans 20..1180 and centres on 600, and is fed by a shaft down
         the /data column, which holds no cell below the merged row: the bypass is an empty column.
PANEL    Measured bottom lo..hi per viewport: 107.67..160.00 at 1600x1000, 128.92..192.67 at
         1280x860, 155.28..229.82 at 1100x800, the deepest reading on the `remove` step:
         `OVERLAY_IDS=storage-container-filesystem node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The grid starts at x 420, so the only things left of x=420 are the volume at y>=484, 254
         below the deepest reading, and the chip strip.
SIZES    Every block keeps the catalog height 80 and gives up width, because the row box and four
         columns have to fit between x 420 (L-03, the panel reaches 396.55) and 1180: at 232 per
         cell the grid would need 1212 units. The row box is a row header sized by its widest
         string, `writable, this container only` 177.9 at 1100x800, so 208 leaves 15 either side,
         and the four cells take the rest on a 12 gap, 126 each. Widest cell string `from app
         layer`, 85.9 at 1100x800, 20 clear either side. Narrowing the header to its 202 floor
         would buy each cell 1.5. Chips are 280 centred on 600 against the worst pair, `upperdir`
         plus `cache, app.conf, whiteout`: a strip of three spanning only the grid, 242.7 each,
         collides by 9 (render/chipfit).
LANES    Five one-way lanes, every one on its own column centre, leaving and entering face
         midpoints. Read (base to merged) and copy-up (base to upperdir) share the /etc/app.conf
         column centre, legal because they never share a frame. Create and whiteout drop merged
         to upperdir across one 52 unit gap. The volume shaft runs down the /data column and turns
         left into the cylinder side at y 540, the centre of the face below the cap ellipse
         (VOL_H/2 + 8), level with the label. Every lane runs through empty
         slots only: read crosses the app-layer and upperdir slots of the app.conf column, copy-up
         the app-layer slot, and the shaft the three layer slots of /data.
MOTION   No Pod, so nothing pulses. Every sender is lit at entry and its ball leaves on BEAT.lead:
         the base cell on read, copyup and remove, the merged cell on create and whiteout, the merged
         row box and the /data cell on volume. Receivers light on arrival, and every chip and
         sublabel a ball earns turns over on that arrival through an F.set (`chips` plus `rewind`).
         Every ball runs 15 percent faster than its base pace (PACE 1.15): the grid legs ride
         LEG_DUR 1304 instead of 1500, the shaft SHAFT_DUR 1784 instead of its routeDur 2051 over
         923 units, all six registered in the motion PACING list. A block and its lane appear as one before the ball
         leaves (STO.S-02): on create the merged /tmp/cache cell, its lane and the upperdir cell (to
         pending) come in together over 500, whiteout brings its lane and upperdir cell in the same
         way, and each upperdir cell rests at pending while its ball flies and lands on full with
         it. copyup fades the read lane out over 350 and only then brings the copy-up lane
         and the pending upperdir copy in, and remove fades the upperdir contents and their lanes out
         over FADE.out before the read lane returns, so the read lane and the upperdir copy never
         share a frame (the THROUGH_EXEMPT entry in unit/spec-scene.test.mjs). The replacement read
         leaves 100 after the read lane is back.
         Every grid tag rides level with its ball (dy 4 centres the 11px text), beside its lane,
         shows from departure and lives exactly as long as the ball (M-30a, in and out 200, hold
         0): left of the lane at dx -37 on read, remove and whiteout, right at 28 on create and 34
         on copyup. The shaft tag rides 24 right, 17 below. Frames at 0, 50 and 95 percent of every
         step at all three viewports: no tag touches a cell or a lane.
CONTENT  Read against the kernel overlayfs documentation (cited as Overlay Filesystem), the
         containerd CRI source and kubernetes.io for 1.35.
         overlay: the desc and aria-label say `with the default overlayfs snapshotter`. A bare `the
         root filesystem is one overlayfs mount` is rejected because overlayfs is containerd's
         DEFAULT snapshotter (docs/snapshotters/README.md, `overlayfs (default)`), not the only one.
         The narrations keep `one overlay mount` inside that frame.
         read: `a read takes the highest layer holding the path`. `highest IMAGE layer` is rejected
         in the desc: once a file is copied up the upperdir answers, and the kernel doc says the
         lookup keeps `the upper if it exists, else the lower`.
         whiteout: only what the kernel doc states, a whiteout for the name is written into the
         upperdir (`record in the upper filesystem that files have been removed`) and the merged
         view no longer shows the file (`any matching name in the lower level is ignored`). Its
         on-disk form (a 0/0 character device or an xattr-marked file) is not drawn and not named.
         desc: `every change lands in the writable upperdir: a new file, a lower file copied up, or
         a whiteout hiding one`. `every create, edit and delete lands ... as a new file, a copy-up or
         a whiteout` is rejected as an absolute: a file already in the upper is used directly and
         not copied again, and unlinking an upper-only file removes it with no whiteout (the kernel
         doc on copy up and on whiteouts).
         copyup: `copies the whole file up` stays unqualified. metacopy copies metadata only for a
         chown or chmod, and the data still comes up `when file is opened for WRITE`, so an edit
         copies the file under either setting.
         create: `no image layer can be written` and `the one writable layer this container owns`
         hold: rm works `without changing the lower filesystem`, and containerd prepares one
         snapshot per container (WithNewSnapshot keyed by the container id).
         volume: `a separate mount placed over the merged tree` matches kubernetes.io volumes,
         `Volumes are mounted at specified paths within the container filesystem`. The merged row
         keeps `what the container sees` because its /data cell says `volume mount`.
         remove: `the container is replaced ... the old upperdir is deleted once the old container
         is removed`. `the container is removed and its upperdir goes with it` followed by the
         replacement is rejected as an ORDER: on a restart the kubelet starts the new container and
         keeps the dead one until container garbage collection (MinAge, MaxPerPodContainer), and
         containerd deletes the snapshot only on RemoveContainer (WithSnapshotCleanup). What the
         new container sees is empty because its upperdir is new, not because the old one is gone,
         which is also why /bin/tool shows again.
NAMING   Kernel vocabulary: `merged`, `upperdir`, `lowerdir`. The two lowerdir rows say which image
         layer they are, since a lookup order between them is the point of the grid.
SCOPE    Mounting an image as a read-only volume belongs to storage-image-volume. Where each volume
         keeps its bytes and how long they live belongs to storage-volume-data-homes. The ephemeral
         storage limit that the writable layer counts against belongs to
         storage-ephemeral-storage-eviction.
```
