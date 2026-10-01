## storage-configmap-secret-mount

### layout

```
WHAT     A ConfigMap or Secret volume is a folder of symlinks, and an update is one pointer move:
         Kubelet writes the next version into its own timestamped directory, renames a ..data_tmp
         link over ..data in one atomic rename, and only then deletes the old directory, so a reader
         opens all of v1 or all of v2 and nothing restarts the app.
LAYOUT   The mounted directory drawn as its own name-sorted listing, the way ls -a prints it: the v1
         directory, the v2 directory, ..data, ..data_tmp, app.conf, one fixed slot each at y 64 /
         132 / 200 / 268 / 336 in a 504..736 column, so an entry that does not exist yet (v2 on
         idle and project, ..data_tmp outside the swap, v1 after it) leaves its slot EMPTY at 0 and
         never shuffles the others up. The ..data pointer is a bracket in the gutter left of the
         rows, and the swap is that bracket moving from one row to another. The listing title and
         the backing caption are keyed and pinned the way the rows are, 0 on idle and shown on
         project with the first directory and with the files it is about: standing text on every
         step puts a caption about files over an empty column. Kubelet over the API
         server in a column at 900..1132, joined by the watch lane, and Kubelet writes into the rows
         over a bus at x 792. The Pod stands left of the listing below the panel, level with the
         app.conf row, so the read is one straight run out of that row. Three chips along the
         floor, and one standing caption for the backing (Node storage here, tmpfs for a Secret).
         No frame around the rows: a frame edge is a block border every tag leaving a row would
         cross. The section lever no sibling carries is `short`: three narrated steps, because the
         mechanism is one rename and the story is build beside, move the pointer, re-read.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 180.12..229.82 at 1100x800, the deepest reading on the `project` step (and the
         poster, which previews it):
         `OVERLAY_IDS=storage-configmap-secret-mount node --test report/overlay.test.mjs` from
         `scheme/test/`.
         Everything above y 342 starts at x 454 or right of it (the gutter bracket), and the Pod
         starts at y 342, 112 under the deepest reading. A longer narration moves only that margin.
SIZES    Kubelet and the API server are 232 by 80 and the Pod 232 by 104 with a 192 by 44 app box
         (NET.L-01). The rows are 232 wide but 56 tall, a measured departure: they are entries of
         one listing rather than actors, and five slots at 80 with the 12 gap need 448 units, which
         would put app.conf at 462..542 and the Pod beside it at 450..554, into the chips at 530. The
         widest row string is the sublabel `app.conf v1, mode 0644` at 135.0 of 232. Chips are 300
         wide, the widest pair `..data target` plus `v2 dir` at 116.6.
LANES    Five one-way lanes and two relations. The watch lane climbs from the API server top to
         the Kubelet floor. The three writes share the bus: out of the Kubelet left face, along
         x 792, into the right face of their row (v1, v2, ..data_tmp). The read leaves the app.conf
         left face straight to the Pod right face at y 394. Each lane is pinned at 0 while the row
         on its end is absent and at 1 from the moment it exists, so a lane is never drawn into an
         empty slot (STO.S-02, A-14). The ..data pointers are markerless `P.relation`s through the
         gutter at x 454, and at most one of them is drawn at rest. `app.conf -> ..data/app.conf`
         is a sublabel, never a third bracket, so no pointer crosses another.
MOTION   Every ball rides its own LENGTH at one speed, 0.14 units per ms, not routeDur, registered
         in the motion PACING list at 7: 729ms on the 102 unit watch leg, 1086 on the 152 unit read,
         1329 on the 186 unit v2 write and 1814 on the 254 unit v1 write and ..data_tmp link.
         routeDur is rejected because its 700ms floor hands the 102 unit leg and the 266 unit leg
         the same duration, so the short one crawls at 0.146 against 0.363 and the two legs of one
         step read as two different motions. 0.14 is the fastest speed that keeps the shortest leg
         above that floor. Every tag lives exactly as long as its ball (M-30a), and sampled every 50ms on all
         three viewports none inks a block or a string. The two tightest pairs, both on the v1 write
         tag at 1100x800: it ends 11.1 above the listing title (tag 58.3..70.6, title 81.7..96.4)
         and leaves 4 under the Kubelet top, which is what `dy -50` buys. Moving the title up or the
         tag down trades one of those gaps for the other, so both stay where they are. The watch tag rides 60 right of its lane in
         the 102 unit gap between the two boxes and TRAILS 20 under the ball, emerging 550 into the
         flight once clear of the API server top, so it ends in the gap under Kubelet. The two
         version writes carry theirs 50 above and 40 right of the ball from departure (clear of the
         Kubelet top at departure and right of the row face on arrival). On the v2 write that tag
         crosses the v1 write bus at x 792 for about 300ms mid-flight: the bus spans the whole band
         the tag rides in. The ..data_tmp tag trails 40 right and 20 under its ball, emerging 500 in
         once clear of the Kubelet floor, so it ends right of its row face, under the lane. The read
         tag trails right and 34 above, over the app.conf top, from departure.
         A watch ball carries the OBJECT it delivers, `ConfigMap app` on project and `ConfigMap app
         v2` on stage, and a write ball the FILE it lands, `app.conf v1` and `app.conf v2`: one text
         on the two balls of one step read as the file travelling twice.
         The two rows the v1 write creates, ..data and app.conf, light together on its arrival, the
         way they appear together. Lighting only ..data left the entry the narration names dark on
         the step that makes it.
         Every ball leaves a lit sender: the API server on project and stage, Kubelet on swap, and
         the app.conf row, which no ball reaches, by an F.light a BEAT.lead or more before its read
         leaves: on the v2 write arrival on stage (800 ahead), on the rename beat on swap (1900
         ahead), the moment app.conf starts resolving to v2. Chips change when the ball that earns
         them lands, through `chips` plus an arrival F.set and F.light.
         On swap the rename and the delete are two separate beats, in atomic_writer.go order: the
         ..data_tmp write lands, 500 later the ..data_tmp row and lane fade and the bracket moves
         from v1 to v2 while the ..data sublabel and the `..data target` chip turn over, and 1200
         after that the v1 row and its lane go. The ..data_tmp row lights when the link ball
         lands on it, through an F.set `lit` and not a `lights` list, and the fade that removes the
         row carries `unlight` for it. `lights` is what `flowLights` derives the static path from,
         and a derived highlight on a row that is gone by the settle is what S-18 forbids (the
         reduced test reads it as a HIGHLIGHT mismatch). Live the row is lit from 2839 to 3647ms,
         sampled every 100ms in the browser. The static `opacity` of swap is the state
         after the rename, the delete and the re-read, and `rewind` puts the pre-swap listing back
         for the animated path alone. Spans against durations: 3993/5200, 5994/7000, 7000/7800.
CONTENT  Read against raw kubernetes/website configmap.md, secret.md, volumes.md and
         windows-security.md, and kubernetes release-1.35 atomic_writer.go, core/v1 types.go,
         kubelet config v1beta1 types.go, kubelet.go, pod_workers.go and the configmap and secret
         volume plugins, for k8sVersion 1.35.
         order: AtomicWriter writes the payload into a new timestamped directory, creates
         ..data_tmp pointing at it, renames ..data_tmp to ..data (`rename is atomic`), creates the
         user-visible symlinks (`<target-dir>/podName -> ..data/podName`), then removes the
         previous timestamped directory. So v1 is drawn deleted after the swap, never kept beside
         v2, on project ..data and app.conf appear together once the files have landed, and the
         swap lights app.conf at the rename because it resolves through ..data. The first
         projection also goes through ..data_tmp, which project folds into `points ..data at it`.
         same sync: steps 6 to 12 run in one Write call, so the v2-written, ..data-on-v1 state of
         stage lasts an instant. Swap opens `In the same sync` so the split into two steps does not
         read as a window a reader could observe.
         Linux: the rename is atomic only off Windows. On Windows atomic_writer.go removes ..data,
         creates it again and removes ..data_tmp, so `A rename is atomic` unqualified is rejected
         and the narration, aria-label and desc say `on Linux`. Secret on tmpfs is Linux too:
         volumes.md says `secret volumes are backed by tmpfs`, and windows-security.md says `On
         Windows, data from Secrets are written out in clear text onto the node's local storage
         (as compared to using tmpfs / in-memory filesystems on Linux)`. `always tmpfs` is rejected
         for that reason, in the caption, the project narration, the aria-label and the desc. A
         ConfigMap volume is a wrapped emptyDir with no medium, so `Node storage` holds: the two
         plugins differ in exactly that one field, configmap.go wrapping
         `EmptyDir: &v1.EmptyDirVolumeSource{}` and secret.go
         `EmptyDirVolumeSource{Medium: v1.StorageMediumMemory}`, which is what puts the one caption
         on both halves of the sentence.
         watch: `configMapAndSecretChangeDetectionStrategy` defaults to `Watch`, and Get and Cache
         are the other two, so the project narration opens `By default`. Initial mount before the
         container: syncPod calls volumeManager.WaitForAttachAndMount before it starts containers.
         That is a MECHANISM and not a default, so the two claims are two sentences: `By default
         Kubelet watches ConfigMap app on the API server. Before the container starts it writes`.
         Joining them with `, and` is rejected, because one `By default` then governs both clauses
         and the volume being written before the container starts reads as a setting.
         immutable: a ConfigMap or Secret marked immutable has no update path at all, `it is not
         possible to revert this change nor to mutate the contents of the data or the binaryData
         field`, so `Someone edits ConfigMap app` on stage already presupposes a mutable object and
         no qualifier is owed. The card states no absolute that immutability breaks.
         rewrite on sync: the volume is NOT rewritten every sync. atomic_writer.go step 4 compares
         the current timestamped directory to the projected data and step 5 creates a new one `if an
         update is required`, so stage narrating a write on the sync AFTER an edit is the whole of
         what happens, and `Kubelet rewrites the volume every sync` would be false.
         the Secret is NARRATED and never DRAWN: it rides one clause of project, one of the
         aria-label, one of the desc and the standing backing caption. The two plugins differ in one
         field, so a second drawn column would repeat the listing to say `Medium: Memory`.
         delay: the docs bound it as `the kubelet sync period + cache propagation delay`, and
         syncFrequency defaults to `1m`, but pod_workers.go requeues a Pod at
         `wait.Jitter(resyncInterval, 0.5)`, 60 to 90 seconds. `up to about a minute` is rejected
         as a bound the jitter breaks: stage says `by default a minute or so later`, and the desc
         `on the next Kubelet sync after the cache catches up`, never `within`.
         open fd: `the next time it opens app.conf, it reads v2` holds and is kept as worded: an fd
         the app already holds keeps the v1 inode after the delete, which is why the sentence names
         the next open. `an open sees all of v1` is rejected as reading like the whole version set:
         it is one file per open, and an app reading two files across the rename can mix them.
         items and defaultMode: `If you omit the items array entirely, every key in the ConfigMap
         becomes a file`, so the qualifier rides on all three prose surfaces rather than on the
         narration alone: project says `or only the keys the volume lists in items`, the aria-label
         `every key or only the ones the volume lists in items`, and the desc `the keys the volume
         asks for`. An unqualified `every key` or `each key` is rejected on any of the three,
         because items is what decides which keys become files. The drawn `mode 0644` is
         the ConfigMapVolumeSource and SecretVolumeSource defaultMode default (`Defaults to 0644`,
         `ConfigMapVolumeSourceDefaultMode int32 = 0644`). defaultMode is not narrated.
         OPEN: the two drawn directory names are seven minutes apart, `..2026_09_19_10_00` and
         `..2026_09_19_10_07`, while stage narrates the sync as `a minute or so later`. The two
         readings do not clash, because the minute the narration counts from is the EDIT and nothing
         on the canvas dates that, but the only two timestamps a reader has are seven minutes apart.
         Closing it means `..2026_09_19_10_01` here AND on storage-subpath, which draws the same
         pair on purpose, so it is a two-card edit and is left for one.
NAMING   The timestamped directories are drawn as a prefix of the real name cut at the minute,
         `..2026_09_19_10_00`. atomic_writer.go makes them with `os.MkdirTemp(targetDir,
         time.Now().UTC().Format("..2006_01_02_15_04_05."))`, so the real name is
         `..YYYY_MM_DD_HH_MM_SS.` in UTC plus MkdirTemp random digits, not nanoseconds. The full
         form measures 208.6 in a 232 row and cannot fit storage-subpath's 164 box, and both cards
         draw the same minute-cut prefix, `..2026_09_19_10_00` and `..2026_09_19_10_07`.
         `Node storage`, never `disk`, for where a ConfigMap volume lives. The chip is `version
         dirs`, a count of timestamped directories, 0 / 1 / 2 / 1.
SCOPE    subPath is not this card: storage-subpath owns why a subPath-mounted file misses the
         update until its container restarts. Several sources in one mount and token rotation are
         storage-projected-volume, the ConfigMap as an API object that Kubelet copies in is
         storage-volume-data-homes, and a ConfigMap read as environment variables is
         workloads-env-before-pid-1.
```
