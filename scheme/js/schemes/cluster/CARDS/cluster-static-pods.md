## cluster-static-pods

### layout

```
WHAT     The asymmetry between a file on disk and its API shadow: the Kubelet runs the static Pod,
         the mirror Pod is only a record, and deleting the record changes nothing.
LAYOUT   THREE tiers, not the Node family's two, because the card draws the API band and the Node
         band at once.
PANEL    x<=291 y<=160 at 1600, x<=378 y<=193 at 1280, x<=397 y<=230 at 1100. The deepest bottom is a
         TIE rather than one step: kubelet-starts, edit-file and drain all reach it on all three
         viewports. Naming one of them is how a prose edit to another moves the number with nothing
         pointing at it, which is what L-08 is for.
LANES    FOUR lanes and one relation, and each of the four is fed by the SAME named points array the
         packet rides (A-02): FILE_TO_KUBE 100 units, KUBE_TO_POD 100, KUBE_TO_MIRROR 131, and the
         top PAIR over TOP_GAP 56 on REQ_Y 68 and RESP_Y 92, a mirrored LANE_DY 12 either side of
         TOP_CY (L-12). API_TO_MIRROR is the relation: no ball rides it on any step and it takes no
         arrowhead (A-05).
         Every ball is floor-bound on the 700ms PKT_DUR_MIN (M-13), so none of them reads at
         PKT_SPEED 0.45: 100 units run 0.143 u/ms, 131 run 0.187 and the 56 unit top hop 0.080.
         Five cards share that 100 and four share the 56, so all three readings are the house pace
         rather than this card, and moving any endpoint changes only the length, never the 700.
WIRE LABELS
         TWO slots. `top` is centred at x=744 over the API and kubectl gap and sits at y=26, ABOVE
         the row rather than between the two lanes, because 24 units of lane separation cannot hold
         a line of text. `mirror` is at x=612 y=365, anchored start so it runs right of the drop,
         inside the 84 unit band between the mirror Pod bottom at 296 and the Node frame top at 380:
         its string measures 612..860 at 1600x1000 and clears both edges.
         The fileLane and the podLane carry a ball on two steps each and take NO label. Each is 100
         units of gap, which holds about 14 mono characters at the measured 6.89 units apiece,
         against the 36 the mirror lane's own string needs. What rides is named by the two boxes the
         lane joins and by their sublabels, so the frame is not silent about it.
CONTENT  The kubeadm sentence names ETCD under a CONDITION, `and so does ETCD in the default stacked
         topology`, because the reference makes it a topology CHOICE rather than the mechanism.
         Stacked etcd is what kubeadm does by default (`This is the default topology in kubeadm. A
         local etcd member is created automatically on control plane nodes`), and the external-etcd
         topology documented beside it runs etcd off the cluster entirely (`etcd members run on
         separate hosts`). `the API server, the controller-manager, the Scheduler and ETCD all run
         as static Pods` is REJECTED: it states a default as the mechanism, which is the T-19 shape.
         The card cites that page so a reader can reach the other topology.
         https://kubernetes.io/docs/setup/production-environment/tools/kubeadm/ha-topology/
CONTENT  The mirror comes back on the Kubelet POD SYNC, not on a directory rescan, so the delete
         step reads `the Kubelet puts the mirror back on its next sync loop pass`. `its next scan
         recreates the mirror` is REJECTED: nothing about the FILE changed on that step, so a scan
         has nothing to notice, and the same word does real work on steps 1 and 5 where the file
         did change. `tryReconcileMirrorPods` is called from `syncPod` under the comment `Create
         Mirror Pod for Static Pod if it doesn't already exist`, and the sync loop reaches it off
         PLEG, the periodic resync and the probes, never off the manifest source. The reference is
         silent on the mechanism, and its own task page shows the difference rather than stating it:
         the file-move example needs `sleep 20` for a rescan, while the mirror delete comes back at
         `AGE 4s` with no wait at all. `cluster-kubelet-reconcile-loop` owns that loop and the wording
         borrows its term.
         https://kubernetes.io/docs/tasks/configure-pod-container/static-pod/
CONTENT  Step 3 says the Kubelet `creates` the mirror Pod where the reference says it `automatically
         tries to create` one. The hedge is deliberately NOT carried. What it guards is an RBAC
         failure (`Make sure the kubelet has permission to create the mirror Pod in the API server.
         If not, the creation request is rejected by the API server`), and this card draws the
         mirror arriving on that step, so a sentence saying it might not would contradict its own
         picture. DO NOT add `tries to` without also drawing the refusal.
CONTENT  Read against the k8sVersion the card claims, every remaining claim resolves to a cited page
         verbatim: `staticPodPath` in the kubelet configuration file and `the kubelet will ignore
         files starting with dots` (step 1), `the kubelet watches each static Pod and restarts it if
         it fails` (step 2), `The Pod names will be suffixed with the node hostname`, the
         `kubernetes.io/config.mirror` annotation and `The kubelet propagates labels from the static
         Pod to the mirror Pod` (step 3), `the kubelet does not remove the static Pod` (step 4),
         the `mv` example emptying `crictl ps` (step 5), and `drain evicts or deletes all pods
         except mirror pods` with the DaemonSet clause beside it (step 6).
CONTENT  The mirror Pod is `static-web-Node-1`. Upstream suffixes with the node hostname and this
         catalog's Node is `Node-1`, so the suffix is visibly the Node name, which is the point of
         the sentence. `static-web-node-1` would put a bare lowercase `node` into narration prose,
         where `render/inline.test.mjs` is right to fail it.
CONTENT  The drain step gives the MECHANISM, not the reference's parenthesis. `cannot be deleted
         through the API server at all` contradicts step 4, which deletes one through the API
         server: the reference means the delete accomplishes nothing, not that it is refused, and
         the docs show the command reporting success. Two more absolutes went with it: `moving the
         file out of the directory stops it for good` is false (moving it back brings the Pod
         straight back), and the real documented limitation is the reference RULE rather than its
         three examples: `The spec of a static Pod cannot refer to other API objects, such as
         ServiceAccount, ConfigMap, or Secret`. The narration carries `other API objects such as a
         ConfigMap, a Secret or a ServiceAccount`, so the three names stay illustrations. Naming
         the three alone is REJECTED: it reads as the whole set, and a reader concludes a
         PersistentVolumeClaim is allowed.
BUDGET   390 characters per narration. Nothing in tiers 1 and 2 starts left of 450, so what has to
         be cleared is the Node frame at 380, not the blocks.
         The longest narration is edit-file at 339 characters, whose panel bottoms at 229.82 at
         1100x800, 150 clear of that frame. kubelet-starts 338 and drain 322 land on the same
         bottom, so 51 characters of the budget are still unspent at that depth.
         The catalog desc is 466 characters against the D-04 hard ceiling of 470, so an accuracy
         edit there has 4 characters and has to buy the rest back inside the same sentence.
NOTE     kubectl is on the RIGHT (772..1004). The API is centred on CX so the mirror Pod hangs
         straight below it and the Kubelet create lane is one vertical drop with both endpoints on
         face midpoints, which leaves only 64 units (420..484) for a 232 wide box on the left. The
         cost is a top row reading right to left, carried by an arrowhead per direction and a wire
         label over the gap at x=744.
NOTE     Three blocks are born on three different beats and their lanes with them, so all six are
         pinned in ONE pass. An absent block holds OPACITY.pending with a sublabel saying so, and
         each lane takes the shade of the FAINTER end. One exemption, on the delete step: the
         Kubelet create lane stays at full, because the recreate rides it a beat later.
NOTE     MIRROR_FADE is 1200, not FADE.out 700, the same value POD_FADE and VICTIM_FADE carry on the
         sibling Node cards: at 700 the block is gone 200ms before its own pulse finishes and the
         deletion reads as a cut. Step 4 is the longest on the card and its 4700 is not padding: the
         DELETE lands on the API at 700, the answer comes home at 1500, the mirror pulses and
         dissolves from 800 (the DELETE arrival plus BEAT.afterHop), the recreate leaves at 2100 and
         lands at 2800, and the pulse behind it runs to 3700. span 3700.
DO NOT   Ride a ball down the API tie. The delete lands ON the API and what the reader sees next is
         the object under it going dark, which is what deleting a mirror Pod is. The container in
         the Node band does not move once.
DO NOT   Hang the dissolve off the ANSWER hop instead, which puts it at 1600 and the whole tail 800
         later. The object dies when the DELETE reaches the API at 700, not when the 200 reaches
         kubectl at 1500, and 4700 would still hold the longer version, so the duration is not what
         decides it.
NOT A DEFECT
         The Kubelet lane crosses the Node frame top edge. `render/geometry.test.mjs` excludes
         isFrame blocks from THROUGH by construction.
NOT A DEFECT
         `report/arrival.test.mjs` reports two R2s, both its documented blind spot. `static Pod` is written on
         arrival on `kubelet-starts` and on `edit-file`, the two steps that carry its highlight. DO
         NOT light the chip on `mirror` or `drain`, where nothing happens to the container.
         The same probe carries one R2-STEP on `edit-file`: `mirror Pod` reads `static-web-Node-1`
         again after `delete-mirror` walked it present, gone, back INSIDE that step. The name coming
         back is the steady state, not news, and the news of `edit-file` is the container restarting,
         which is the chip that IS lit.
```

### poster

```
Sentence: this Pod takes a route that skips the whole control plane.

Ghost zone to solid, redrawn 2026-08-28. Above a 0.3 rule at y 78 two 78 x 36 blocks stand dashed
4 3 at fill 0.02 and opacity 0.55, EMPTY and touched by no leg at all: the Scheduler and the
controller the desc says are not involved. Under the rule the live route, and it is the only thing on
the canvas that connects: the manifest file at stroke 2 and fill 0.06, folded corner, two thin rules
and the single 56 x 8 accent at 0.9 between them, joined by one SOLID leg at 0.55 on the bar midline
y 122 to the Pod at 80 x 52 and fill 0.10 carrying the same bar at 0.3. So the eye lands on the file,
which is the source of truth, and the emptiness above the line is the sentence.

The leg is solid where the house idiom would reach for a dash. The dash carries not real yet, leaving
or optional (R-06 vocabulary), and this leg is the one real causal link on the card: the Kubelet reads
the file and starts the container off it. The dashes are spent on the two blocks that do nothing, and
spending them twice would say the live route is provisional too.

WHY the sentence moved. The poster this replaced said what runs is the file on disk and what the API
holds is only its reflection, drawn as two zones split by an API line with a dashed mirror of the Pod
above it. It was true and it was quiet: the mirror is the SECOND half of the desc, and the reader who
has not opened the card yet cannot know that a dashed block on the same footprint means a reflection
rather than a Pod that is not there yet. The route that skips the control plane is the FIRST half,
the question the desc opens with, and R-02 puts the poster closer to the question.

WHY NOT the wall, one upright accent bar between the mirror Pod and the file, saying that nothing
done through the API reaches the container. It is the card's punchline and it survives as the next
candidate if this one is ever replaced. It lost on the row rather than on the idea: it is a held-off
sentence standing next to `cluster-pod-sandbox-cri`, which now carries a struck-out block, and two
tiles in a row about something being stopped read as one argument (R-05).

REJECTED, and it is what the reflection poster replaced: a dashed Node band holding both blocks with
a dim empty block above it. The band, the leg and the ghost were all dashed, which is the failure
mode nested containment names, and it made the card the palest tile in the category. The mirror block
was EMPTY, so nothing about it said mirror, and a dashed zone with rows in it plus one dashed leg is
the picture `cluster-node-drain` draws one tile away.

The API server is still NOT drawn as a block: the rule IS the API surface. The library row in the
skill reference points this card at Nested containment, which was already stale before this redraw
and is now stale twice over: the family is Ghost zone to solid.
```
