## storage-downward-api-volume

### layout

```
WHAT     A downwardAPI volume turns fields of the Pod object into files: metadata.labels becomes
         /etc/podinfo/labels, one key="value" line per label, and Kubelet rewrites it when a label
         changes on the running Pod, while the same zone handed in as an env var keeps the value it
         had when the container started.
LAYOUT   Two listings level with each other across one writer, mirrored about x 600. Left, the Pod
         api-0 OBJECT as a frame at 100..332 holding four field rows (cluster, rack, zone,
         spec.nodeName). Right, the labels FILE as a frame of the same size at 868..1100 holding
         three line rows, each level with the label it comes from, and an empty fourth slot level
         with spec.nodeName. Kubelet between them at 484..716 on the frames' shared middle, so the
         get and the write are one straight line through it. The running Pod stands over Kubelet on
         the centre line, fed from below by the env leg and from the right by the read out of the
         file frame top. The three copies of the zone stand as a chip column under Kubelet: object,
         file, env. The row-for-row alignment is the composition: the map becomes the file, and
         the slot the file does not fill is how an env-only field is drawn. No sibling in the
         section runs a straight line through its listing, and none draws the source object as a
         listing of its own: configmap-secret-mount and projected-volume feed their rows over a
         bus, subpath draws two readers inside one Pod. The env leg is ridden once, on start, and
         stands empty on relabel and rewrite while the file leg carries the update, which is the
         env-versus-volume split drawn rather than narrated.
PANEL    Read it with `OVERLAY_IDS=storage-downward-api-volume node --test report/overlay.test.mjs`
         from `scheme/test/`. The deepest reading is the poster frame, which previews `get`, at
         1100x800, and `split` reaches the same depth. The object frame is the only thing left of
         x 420, and its top at 262 is what the panel has to clear: 57 units under the deepest
         reading. Everything else starts at x 484 or right of it.
SIZES    Kubelet is 232 by 80 and the Pod 232 by 104 with a 192 by 44 app box (NET.L-01). The two
         frames are 232 by 256, sized by what they hold: a 32 header band, four 44 tall rows at 10
         apart and an 18 inset. The rows are 196 by 44, a measured departure from the 232 by 56
         listing rows of configmap-secret-mount: they sit INSIDE a frame, so they lose the two
         insets, and four at 56 grow each frame to 304, which drops the shared middle, Kubelet and
         the chip column 24 lower, to a chip floor at 604 on a 640 canvas. The inset is 18 and not
         12 because report/arrival.test.mjs judges a ball AT a block within 16 units (HIT_TOL): at
         12 the get and the write, which leave and reach the frame face on its middle, read as
         leaving and reaching the rack row. The widest row string is `spec.nodeName: Node-1` at
         141.1 of 196, and the app sublabel `ZONE=east NODE_NAME=Node-1` 159.5 of 192, both at
         1100x800. The chips are 232, the column width, at 34 high and 12 apart.
LANES    Four one-way lanes and no relation. The get runs 152 units from the object frame right
         face to the Kubelet left face and the write 152 from the Kubelet right face to the file
         frame left face, both on the frames' middle, y 390. The env leg climbs 186 units from the
         Kubelet top to the Pod floor on x 600. The read leaves the file frame top on x 984, climbs
         to the Pod middle and turns left into the Pod right face, 418 units. The write and the read
         are pinned at 0 until the file frame exists and born with it on `write` (STO.S-02, A-14).
MOTION   Every ball rides routeDur: the three short legs sit on the 700ms floor, the read runs
         929. Every tag lives exactly as long as its ball (M-30a). The get and write tags ride 50
         above their ball, the get tag 40 right of it and the write tag 40 left, so both hover over
         the Kubelet top rather than over a frame. The env tag rides 172 right of its lane, its left
         end 8 right of the column face at 716 with the tag at its widest, 94.4 at 1280x860: the leg
         runs between two 232 wide blocks on its own axis, so any nearer offset puts the tag inside
         the Kubelet at departure or the Pod at arrival, and a tag on the lane crosses its dashes.
         network-service-clusterip rides its watch tag the same way, 174 off the same face.
         Every ball leaves a lit sender: the object frame on `get` and `relabel` (with the changed
         zone row), Kubelet on `write`, `start` and `rewrite`, and the file frame, lit by the
         rewrite landing, for the read that follows it. The Pod pulses when the env and the read
         land. The app box is never lit (STO.C-02). The relabel itself is the step entry: the zone
         row, its label and the object chip turn over statically and lit, and the ball carries the
         new value to Kubelet. Chips turn over on the ball that earns them, through `chips` plus an
         arrival F.set and F.light, the writer of configmap-secret-mount. On `write` the file frame
         stands empty from its fade to the landing at 1500, because the lines are what the write
         earns: drawn earlier they would be credited to nothing (A-15), the order
         configmap-secret-mount keeps too. `split` moves no ball: the spec.nodeName row lights at
         entry and the empty-slot caption fades in lit BEAT.lead later, 800 to 1100 (M-27).
CONTENT  Read against the two cited pages, kubernetes.io volumes, and the kubernetes/kubernetes
         source on the release-1.35 branch, for k8s 1.35.
         fields: the concept page lists six fields as `available through environment variables but
         not as a downwardAPI volume fieldRef` (spec.serviceAccountName, spec.nodeName,
         status.hostIP, status.hostIPs, status.podIP, status.podIPs). The card names four, so
         `split`, the aria-label and the desc all say `fields such as`. `The fields spec.nodeName,
         status.podIP, status.hostIP and spec.serviceAccountName` is rejected because it reads as
         the whole list and leaves out the two dual-stack plurals. metadata.labels and
         metadata.annotations are the two `available through a downwardAPI volume fieldRef, but not
         as environment variables`, and metadata.labels['<KEY>'] and metadata.annotations['<KEY>']
         are in the list available `either as an environment variable or using a downwardAPI
         volume`, so `a single key goes either way` holds. metadata.name, namespace and uid also go
         either way and are not drawn.
         format: `one key="value" line per label` is the concept page's
         `label-key="escaped-label-value" with one label per line`. The lines are sorted by key:
         pkg/fieldpath/fieldpath.go
         FormatMap runs sort.Strings over the keys, so the name order the listing is drawn in is
         the order Kubelet writes.
         rewrite: `swaps it in through a ..data symlink, the way a ConfigMap volume is updated`.
         Both plugins write through volumeutil.NewAtomicWriter (pkg/volume/downwardapi/
         downwardapi.go:211, pkg/volume/configmap/configmap.go:240), and the task page says
         `updates are written to a new temporary directory, and the ..data symlink is updated
         atomically using rename(2)`. `swapped in through the same ..data symlink a ConfigMap
         volume uses` is rejected: each volume has its own ..data, only the writer is shared.
         `the next read of it returns zone="west"` is rejected because it can be read as the next
         read after the relabel, which is a timing claim no page makes: the file changes on a Pod
         sync of the volume manager (WaitForAttachAndMount calls ReprocessPod, and the plugin's
         RequiresRemount is true), and no document states that delay. `a read after the swap`
         claims only the order. The ConfigMap timing (`on every periodic sync`, through the
         kubelet cache) is not carried over, because a downwardAPI volume reads the Pod object
         and not a cached ConfigMap.
         relabel: `Kubelet watches the Pods bound to Node-1` is pkg/kubelet/config/apiserver.go:38,
         a ListWatch on pods with the field selector spec.nodeName. `A label change does not
         restart the container` holds: a spec change reaches a running container through its hash
         (kuberuntime_manager.go containerChanged, HashContainer over the v1.Container), and Pod
         labels are not part of that hash.
         write: `Before the container starts, Kubelet writes the volume` is kubelet.go:2125,
         WaitForAttachAndMount, ahead of containerRuntime.SyncPod at 2160.
         env: `resolved once as the container is created` and `nothing changes it short of a
         container restart` hold. makeEnvironmentVariables runs inside generateContainerConfig for
         each startContainer, reading the Pod object Kubelet holds at that moment, so a restarted
         container takes the current label. The concept page says env `will not be updated unless
         the container restarts`. workloads-env-before-pid-1 says the same: `a variable is a copy
         taken once, and only a restarted container reads it again`.
         subPath: a subPath mount of this volume gets no update (volumes page, task page). The Pod
         is drawn mounting the directory, `mounts /etc/podinfo`, so the drawn case is the one that
         updates, and the exception is storage-subpath.
         node name: `spec.nodeName: Node-1` and `NODE_NAME=Node-1` stay. A Node name is a DNS
         subdomain and the API holds `node-1`, but terms.json keeps Node-1 capitalised by
         decision, and the catalog draws a nodeName value as Node-1 on five cards
         (cluster-architecture, cluster-node-drain, cluster-object-create-path,
         cluster-scheduler-decision as Node-4, workloads-pod-startup-conditions) against one
         lowercase (cluster-node-registration). A lowercase value here beside `Kubelet on Node-1`
         would read as a second Node.
         resourceFieldRef and in-place resize are not drawn or narrated, and the Pod object on
         `get` carries no podIP row.
NAMING   The node is `Node-1`, the catalog decision the term table holds, even where it stands as
         the value of spec.nodeName, which the API writes in lower case. The labels keep their
         example values short (prod, r22, east) so every row string fits its 196 row. The keys are
         drawn in name order, so the listing reads the same whether or not the file is sorted.
SCOPE    The ..data swap a rewrite goes through, its atomicity and when an update lands belong to
         storage-configmap-secret-mount, cited in one clause of `rewrite`. Several sources in one
         mount and serviceAccountToken are storage-projected-volume. A subPath mount of this volume
         missing the update is storage-subpath. How env is assembled and handed over at
         CreateContainer is workloads-env-before-pid-1, and the in-place resize of CPU and memory,
         whose resourceFieldRef files follow the resize while env does not, is workloads-pod-resize.
         resourceFieldRef is not drawn or narrated here.
NOTE     The empty fourth slot of the file frame is empty on every step from `write` on, because
         the file never has a nodeName line. It draws no outline, so until `split` it reads as room
         left in a frame sized by the object rather than as a missing row. It is narrated and
         captioned only on `split`, where the `No nodeName line` caption fades in lit beside the lit
         spec.nodeName row. Object row i and file line i share one centre, 316, 370, 424 and 478,
         measured on both frames at 1100x800 and 1280x860.
WHY NOT  A resize clause on `split` (After an in-place resize of CPU and memory, a resourceFieldRef
         file follows too and the env does not) takes that step to 254.66 at 1100x800, which leaves
         7 units above the object frame top, against 57 without it.
DO NOT   Do not draw a status.podIP row or value: the Pod object Kubelet gets on `get` has no IP
         yet, so a podIP row from step 1 contradicts the step order. `split` names podIP in words
         only. Do not write that labels are unavailable as env: a single key is, and only the whole
         map is volume-only. Do not light the app box on a step that pulses the Pod.
NOT A DEFECT
         report/arrival.test.mjs prints three R2-ENTRY rows, `file zone` on step 3, `env ZONE` on
         step 4 and `file zone` on step 6. Each is the frozen-entry artefact: the value is wound back
         in `rewind` and turned over by the cued F.set on the arrival that earns it one step
         earlier (`write`, `env`, `write`), so a frame frozen at t=0 first sees it a step late.
         R2-STEP reads 0. report/chip-beat.test.mjs prints one FORM-B row, `objChip` on `relabel`:
         the object chip is the value the relabel writes at step entry, and the ball carries it
         away from the object rather than earning it. All four are carried in
         test/fixtures/carried.mjs. The two frame headers are the bare `scheme-label code` text,
         fill rgb(232, 228, 255) on every step whichever step it is entered from, measured over all
         49 from and to pairs at 1100x800 and 1280x860. A frame capture renders them tinted violet
         on some steps and grey on others: that is Chromium switching the text between subpixel and
         greyscale antialiasing, which the row labels and chips beside them do not show.
```
