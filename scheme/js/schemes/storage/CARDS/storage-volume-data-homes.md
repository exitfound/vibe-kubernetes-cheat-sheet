## storage-volume-data-homes

### layout

```
WHAT     The section's L1 map: one Pod mounts five volumes, and the card shows where each one's
         bytes live and when they vanish. The sentence is that where data lives decides how long it
         lives, so the picture carries two axes: WHERE as tiers, HOW LONG as a ledger.
LAYOUT   A depth map in three tiers, distance from the process read as lifetime: the Pod on top, the
         homes ON the Node inside the Node-1 frame (writable layer, Node RAM, Kubelet, Node disk),
         and the homes OFF the Node below the frame edge (Network storage, API server). The frame
         edge is the lifetime boundary, and node-lost is the step that makes it visible. No sibling
         in the section puts a block outside its frame, and none carries a chip column: the ledger
         is the `column` lever, four chips stacked in the free zone under the panel, named for the
         four lifetimes and listing the tenants as the tour finds them. A right-angle relation ties
         it to the Node it reads, up from the column centre at x 220 and right into the midpoint of
         the frame's left wall at y 228. Its caption, `lives as long as`, is the column heading and
         sits above the horizontal run, inked 212..226.7 at 1100x800 against a panel floor of 205
         on the deepest step. That clearance is why the frame is 424 tall (bottom 440, 44 over the
         tier below): at 408 the midpoint is 220 and the caption slides 1 unit under the panel.
         The writable layer is drawn as a home ON the Node rather than inside the Pod: its bytes sit
         on the Node disk under the runtime, and a box inside the Pod left its lane 40 units long.
PANEL    Measured bottom lo..hi per viewport: 125.11..142.56 at 1600x1000, 150.17..171.42 at
         1280x860, 180.12..204.97 at 1100x800, the deepest reading on the `node` step, and equally
         on `remote` and `node-lost`:
         `OVERLAY_IDS=storage-volume-data-homes node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The frame starts at x 410, so the only things left of x=420 are the ledger at y>=396, 191
         below the deepest reading, and nothing above the panel floor.
SIZES    Every block is 80 tall (NET.L-01), and the API server is the catalog 232 by 80. The four
         homes on the Node share one width, 120, narrower than 232 by construction, a departure the
         lane grid forces: each is centred on its lane (510 / 600 / 713 / 867 / 980 / 1070), so a
         232 home centred on 510 would reach 626 and swallow the data corridor at 600, and a 232
         Kubelet on 867 would overlap Node RAM and the disk both. 120 is the middle of the 110 to
         140 the homes used to span: RAM, Kubelet and the disk stand 34 and 38 apart, and the widest
         home string, `scratch deleted`, keeps 14 either side at 1100x800. The Pod is 720 by 120, not the catalog 232 by 104,
         because all six lanes leave its floor at up to 280 either side of its centre, and its app
         sublabel `mounts five volumes, writes /tmp/report` inks 239.3 on its own.
         Ledger chips are 320 wide against the worst pair, `API object` plus `ConfigMap, PVC data
         kept`, which leaves 87.5 units between name and value at 1100x800 (`Pod` plus `cache,
         scratch, config gone` leaves 112). Shorten a value before widening.
LANES    Six one-way lanes, all straight. Five leave the Pod floor and one (API server to Kubelet)
         feeds the sixth (Kubelet to Pod floor). The Pod-floor endpoints are three mirrored pairs
         about the Pod centre (L-12, and OFFEDGE fails without them): 280, 190 and 77 either side.
         Every lane enters the centre of the face it lands on: the disk is DERIVED from its pair, 45
         either side of its centre, and Kubelet and the API server stand on their own lane. The data
         corridor between the writable layer and Node RAM is 68, the lane 20 off the layer so its
         tag fits on the RAM side. The pair on the disk is why the homes sit 30 in from the left wall
         and 75 from the right: centring the row in the frame would move the Pod off its pairs.
MOTION   Every ball carries the name of its volume and rides routeDur, the pace of
         storage-emptydir: 700ms on the 110 to 130 unit legs, 711 on the 320 unit data lane, so the
         card holds no explicit dur and no entry in the motion PACING list. Every tag rides BESIDE
         its lane, 12 or more clear, and lives exactly as long as its ball (M-30a, in and out 200,
         hold 0). Six ride 14 above the ball, clear of the home a down ball lands on and of the
         Kubelet the config files leave. ConfigMap rides level, since the API box and Kubelet cap
         both ends of its lane. Left of the lane: /tmp/report, cache, node-logs, config files.
         Right: data, scratch, ConfigMap.
         Out of the Pod the Pod blinks first and the ball leaves on afterPulse. On api the API server
         is lit at entry and sends on BEAT.lead, Kubelet lights on arrival and sends one hop later,
         and the Pod blinks when the files land.
         restart ghosts the writable layer and brings a fresh one back at 1100, and the static end
         state is the new layer at full. pod-deleted pulses first and fades at afterPulse behind a
         rewind to full. node-lost fades the whole nodeG group, and the Pod and the writable layer
         sit OUTSIDE it so a second ghost does not erase them.
CONTENT  Read against the kubernetes.io docs for k8sVersion 1.35 (Volumes, Ephemeral Volumes,
         Persistent Volumes, ConfigMaps, Secrets, Resource Management for Pods and Containers).
         node: a Memory emptyDir counts against `the memory limit of the container that writes
         it`, the Volumes page wording (`files you write count against the memory limit of the
         container that wrote them`). `the container memory limit` is rejected as looser than the
         source, and `the Pod memory limit` as a different claim. An emptyDir sits on `whatever
         medium that backs the node`, so the narration says `on its storage, here its disk` and the
         aria-label `the storage backing the Node, its disk here`: `on the Node disk` alone is
         rejected as an absolute the Volumes page does not make, since that medium may be an SSD or
         network storage. The node step holds its measured PANEL readings at that length. The
         rootfs step says the writable layer `sits on the Node storage, here its disk` for the same
         reason, and a bare `sits on the Node disk` is rejected there too.
         api: the ConfigMap is `an API object the API server stores in ETCD`. `its bytes live in
         the API server` is rejected: the API server serves the object, ETCD holds it. `read-only
         file` holds unqualified because `A ConfigMap is always mounted as readOnly`. `Kubelet
         fetches it` holds: Kubelet reads it through its local cache, fed by a watch by default,
         and the cache is sync detail owned by storage-configmap-secret-mount. `each key` is the
         default with no `items` list, which this card does not draw. `into a tmpfs in RAM` for a
         Secret holds as written: `secret volumes are backed by tmpfs (a RAM-backed filesystem),
         so they are never written to non-volatile storage`.
         remote: the data lasts `at least as long as the claim that points at it`. `lives as long
         as the claim` is rejected because a Retain reclaim policy keeps the data past the PVC and
         the PV, and the policy itself stays on storage-reclaim-policy.
         restart: `After a crash, kubelet restarts the container with a clean state`, and `For any
         kind of volume in a given Pod, data is preserved across container restarts`. The clean
         state is a NEW container with a fresh writable layer: `The writable layer goes with the
         old container` is rejected, because the exited container and its layer stay on the Node
         until container garbage collection removes them, which is also why the ledger reads
         `fresh writable layer` there and not `layer discarded`.
         pod-deleted: configMap is an ephemeral volume type, and `When a Pod ceases to exist,
         Kubernetes destroys ephemeral volumes`, so the copied files go with the Pod.
         node-lost: `a hostPath lasts only as long as that one Node disk`, with the Node lost `disk
         and all`. `only as durable as its one Node` is rejected: a Node that is lost and comes
         back still has its hostPath data, and it is the disk that bounds the data.
NAMING   The four ledger names are lifetimes (`container`, `Pod`, `Node`, `API object`) under the
         caption `lives as long as`. `API object` is exact for the ConfigMap and a floor for the
         claim data, which lives at least as long as its PVC and past it under a Retain policy.
         Every value reads alone on every step: it names its tenants and, once they are gone, says
         so (`cache, scratch, config gone`, never `all three deleted`). Tenant lists are COMMA
         lists: SVG collapses a double space, so a spaced list reads as one phrase.
SCOPE    This card only MAPS. Overlay layers and copy-up belong to storage-container-filesystem,
         spec.volumes and volumeMounts to storage-volume-model, medium and sizeLimit to
         storage-emptydir, the ..data symlink swap and sync delay to storage-configmap-secret-mount,
         and the replacement Pod that finds a new empty emptyDir to storage-emptydir. node-lost never
         says the claim reattaches or how long anything takes: detach and timeouts belong to
         storage-volume-detach-on-node-loss.
DO NOT   Do not dim a lane as a state before the last step. Every lane is pinned at 1 on idle to
         pod-deleted, including the ones into the ghosted Pod: the ghost BLOCK says gone, a faint
         lane reads as a rendering fault. This overrides A-13 by the project rule on arrows. The one
         exception, asked for by the user, is node-lost: the whole scheme fades there, and every
         lane fades with the Node over 900 to OPACITY.terminated, since each ends on the ghosted
         Pod or the Node.
         Do not add a Secret block either. A Secret volume is narration only, on api, and the canvas
         draws no number or size anywhere.
OPEN     CENTRE twice and CENTRE-LOW once. The report counts neither frames nor chips as ink, so it
         reads content 410..1170, centre 790, and blocks below the panel 450..1085, centre 767.5. The
         actual ink at 1600x1000, ledger included, is 60..1170, centre 615, inside the 40 unit band.
         Closing that reading means moving the tiers left, which puts the Pod and the frame label
         under the panel at 1100x800 (x<=397 above y 205), and the ledger owns the left on purpose.
         The second CENTRE reads the ledger as a chip strip centred at 220: it is a column, the
         second axis, and centring it on 600 would put it under the Pod.
         All three rows are carried in test/fixtures/carried.mjs on this argument.
```
