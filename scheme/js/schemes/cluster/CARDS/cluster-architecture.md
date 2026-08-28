## cluster-architecture

### layout

```
WHAT     The moving parts of a cluster and who talks to whom: control plane over a Node, with every
         controller watching the API and never ETCD.
NOTE     ETCD right-aligns on 1030, the Scheduler's right edge, rather than centring on the Scheduler
         axis at 920. The card is three columns whose outer walls are 170 and 1030, and a centred
         cylinder would sit at 855..985, breaking that wall to line up an axis nobody can see. It
         also costs the ETCD write label its home: that string measures 179.2 units and the gap to
         a cylinder starting at 855 is 145.
NOTE     A frame move under about 25 units is not a visible change: 10 viewBox units is about 12
         rendered pixels on a 1600 wide dialog.
PANEL    bottom 125.11 at 1600x1000 to 254.66 at 1100x800, deepest on the node-side step, measured
         against the current narration. The nearest thing under the panel corner is the tier-2 row
         at 328, so 73 units of clearance at the worst. The right edge 396.55 at 1100x800 is the
         CATALOG worst and the number `L-02` records, and it is geometry rather than prose: it does
         not move when a narration is rewritten.
MOTION   The durations are sized off READING LOAD, not off the motion: 2800 / 2300 / 2600 / 2600 /
         2400 / 2600 / 3400 against narrations of 314 / 246 / 281 / 291 / 294 / 300 / 366 characters
         as the panel renders them, a band of 8.2 to 9.4 ms per character, under the catalog median
         (`report/baselines.test.mjs` prints the population and the median). The api step carries NO
         motion at all, so its duration is the whole
         hold a reader gets. Only `span <= duration` has a machine (`M-19`), and it passes at 1700
         on three steps no reader can follow at that speed.
LANES    The two tier-2 levels are DERIVED from BAND_CY, D10 either side, so the pair re-centres
         whenever a row moves. The band is 108 units and a fixed +40 / +60 glues both levels to the
         API and leaves dead air under them.
NOTE     The two Node-bound lanes end ON their target box (Kubelet top midpoint 600, kube-proxy 920),
         not on the Node frame edge. That is the OPPOSITE call from the four cluster Node cards,
         where a lane stops on the frame because the Pod row changes step to step and the pulse
         carries which Pod reacts. Here there are no Pods and nothing pulses, so a lane stopping on
         the frame would point at three boxes at once.
NOTE     One lane crossing is accepted: API_TO_KPROXY turns down at x=760 from y=180 and crosses the
         ETCD read lane at (760, 190). Nothing scores a lane against a lane, and the alternative
         takes the kube-proxy lane off the API face midpoint, which OFFEDGE does score.
LANES    THE TWO GROUPS TAKE DIFFERENT TREATMENTS, and that asymmetry must not be "fixed" into
         symmetry. A control-plane lane out of play DIMS to OPACITY.notready (outside this path) and
         stays on screen, because the control plane is what the card is about and its shape should
         not flicker. A Node-bound lane out of play is NOT DRAWN at all: the card spends six steps
         inside the control plane, and a permanent pair crossing into the Node band reads as traffic
         that is not happening.
NOT A DEFECT
         Several lanes carry no ball on a given step, and a grep for a constant name will say they
         carry none at all. They do: the card shows one half at a time, so a lane idle on the step
         you are reading is ridden on another one.
WIRE LABELS
         Eight, and none can sit in the band under the API: the two Node-bound lanes run vertical
         corridors at x=440 and x=760 straight through it, and four of them had a dashed lane
         drawn through the string. `render/geometry.test.mjs` cannot see any of it, because THROUGH
         scores lanes against BLOCKS and a text is not a block. They live in the two bands the
         corridors do not reach: T2_BELOW, one under each tier-2 box (440 and 760 fall in the gaps
         between those three strings), and T3_BELOW under the Runtime, the Kubelet and kube-proxy,
         the tier-2 rhythm repeated inside the Node frame. A watch label belongs next to the
         component doing the watching, and the CRI label under the Runtime the Kubelet drives.
         The three tier-3 strings MEASURE 151.6, 227.4 and 213.6 units at 1600x1000, their widest,
         on centres 280, 600 and 920: they span 204.2..355.8, 486.3..713.7 and 813.2..1026.8, the
         tightest gap between two of them is 99.5, and the row ends 3.2 inside the 1030 column wall
         and 23.2 inside the frame wall on 1050. All three shrink on a narrower viewport.
         The tier-2 row is floored by the cloud label, 303.2 units at 1600x1000 on 448.4..751.6,
         which clears the x=440 and x=760 corridors by 8.4 a side. 46 characters is the ceiling
         there and a 47th crosses both corridors, against 44 today. That margin is INSURANCE and
         not a live clearance: the tier-2 labels and the Node corridors are never on screen
         together, because the Node lanes sit at opacity 0 for the six control-plane steps and the
         tier-2 labels are cleared by the prologue on the node-side step.
DO NOT   Put a label under the API at (CM_CX + 135, 186). That is inside the panel's column, and the
         panel is widest and DEEPEST on the SMALLEST viewport because a narrower panel wraps into
         more lines: one line is 25 viewBox units, five lines bottom 155, six 180. A six-line
         controllers step then renders `watch . reconcile loop` half behind the panel, and OCCLUDED
         reports the card clean either way.
OPEN     The CONTROL PLANE frame label keeps the LEFT top corner at (162, 108), where `node()`
         prints it and where the rest of the catalog draws a frame label, and the panel covers that
         corner on EVERY measured viewport (worst x<=397 y<=254.66, best x<=291 y<=125.11). So the
         string is the one thing on the card that is INVISIBLE rather than dimmed, by author
         decision, and OCCLUDED cannot report it because the rule excludes node frames.
         DO NOT move it to the right corner through the `tune` escape: the overlap is to be fixed at
         the panel and the scale, not by walking the label around the frame.
WHY NOT  Shortening the narrations to pull the panel off the left corner: even a ONE line panel
         reaches x<=291, which still covers x=162 onward. There is no prose that fixes it.
CONTENT  Every claim on this card is checked against the two pages it cites. Components carries the
         `(optional)` marks on cloud-controller-manager and on kube-proxy and the one-line job of
         each component. Architecture carries `kube-apiserver is designed to scale horizontally`,
         the three cloud-controller-manager controllers (Node, Route, Service), `If you use a
         network plugin that implements packet forwarding for Services by itself ... you do not
         need to run kube-proxy`, and `A scheduler watches for newly created Pods that have no Node
         assigned`. `spec.nodeName` is the API reference wording: empty means `a candidate for
         scheduling`, set means `the kubelet for this node becomes responsible`.
         cloud-controller-manager carries the sublabel `optional` and the narration says a cluster on
         your own hardware has none, which is what Components lists literally. kube-proxy is optional
         upstream too, but that is said in WORDS: a second `optional` sublabel in the same drawing
         reads as a pattern rather than as a fact.
         The API is "the only way in for clients and controllers", not "the only entry point":
         cluster-static-pods exists to show the path that skips it.
         The Scheduler's one write is "on the ordinary path", because preemption also deletes.
         The cloud lane is labelled `watch Nodes and Services . write status back`, which is what
         actually rides it. No provider is drawn, so a label naming a provider call was promising a
         call the card does not draw. BOTH watches are named because the right half writes Service
         status: naming the Nodes watch alone asks for a read the left half does not have.
         Architecture gives the cloud-controller-manager three controllers, Node, Route and
         Service, and the Service one watches Services to write the load balancer status back.
         The controller-manager runs `the built-in control loops, roughly one per resource kind`,
         not one loop per kind flat: the garbage collector works across every kind, and namespace
         and node-lifecycle are per mechanism rather than per kind.
         ETCD `holds the cluster state the API serves, and in a standard cluster the API is the
         only client it has`, not `the only durable store in the cluster`: an aggregated API server
         brings storage of its own, and events can be split onto a second instance (`T-19`).
         The `desc` in cards.js carries THAT SAME qualifier and has to keep it: unqualified, the
         grid tile states an absolute the step behind it does not. It ends `while in a standard
         cluster only the API talks to ETCD`, and the opening question is short by `to each other`
         to pay for the clause: 458 characters against the 470 hard ceiling and the 460 target top
         of `D-04`, so there is no room to spend twice. No machine reads this: `T-19` over
         descriptions only prints, and this card sits in its `only` row either way.
         The Kubelet also `PATCHes Pod status back`, said in WORDS on the node-side step. It is the
         observed half every loop above compares against, and with no lane drawn for it the card
         showed desired state travelling down and nothing coming back.
BUDGET   The two ETCD strings live in the 190 unit gap between the API on 710 and the cylinder on
         900, on the centre line 805. MEASURED at 1600x1000, their widest, `write . Raft quorum
         commit` is 179.2 wide at 715.4..894.6: 26 characters clear each wall by 5.4, 27 is the
         CEILING and a 28th touches both. MEASURE IT AFTER document.fonts.ready. The same string
         reads 173.6 in the fallback face, which is what a measurement taken before
         `document.fonts.ready` returns.
SCOPE    The Kubelet status PATCH is narrated here and DRAWN by cluster-kubelet-reconcile-loop. The CRI
         call is one ball and one label here, and the RunPodSandbox to StartContainer sequence
         behind it is cluster-pod-sandbox-cri.
         No CLIENT is drawn, and the first step names one (`the only way in for clients and
         controllers`). That is scope and not an omission: six of the seven steps stand inside the
         control plane, and the sister card on this exact grid, cluster-object-create-path, is the one that
         draws the client, in the 150 unit band right of the frame at 1060..1190 which this card
         leaves empty on purpose. Filling that slot here moves the subject of the card.
NOTE     KUBELET_TO_RUNTIME is a ROUTE, not a relationship, because the last step says the Kubelet
         CALLS the Runtime over CRI. Two things follow. It runs Kubelet to Runtime WITH the ball: a
         relationPath the other way carries no arrowhead to contradict it, and a ball on those points
         travels backwards against the sentence. And the Runtime lights on the CRI ball landing, not
         at the Kubelet's own arrival, or the picture says the API lit them both while the words say
         the Kubelet drove one. Nothing in the gate sees either.
```

### poster

```
Sentence: everything talks to one thing.

Hub and spokes: the API is the accented circle on centre with a filled dot at its core, four
component blocks around it on the four sides, and a dashed leg from each into the hub. The accent is
the hub (`R-03`), because the sentence is about what everything reaches rather than about any one
component, and no leg carries an arrowhead (`R-08`): every one of them runs both ways.
DO NOT redraw this as a stack of rows. `cluster-list-watch-informers` and `cluster-server-side-apply`
own that family in this grid, and a third tile in it could not be told from them at grid size.
```
