## cluster-pod-sandbox-cri

### layout

```
WHAT     The Kubelet as a CRI CLIENT: containerd is what materialises the pause container, pulls,
         creates and starts, and CNI wires the sandbox namespace.
LAYOUT   404 IS A HARD STOP, not taste: the panel measures x<=397 at 1100 width at every height and
         the top row at y 40..120 sits inside that band, so seven units is the entire clearance. It
         is a viewport-WIDTH effect, not a text-length one, so a longer narration cannot eat it.
         The room for the arrows therefore does not come from moving left, it comes out of the
         BOXES. Widths are 180/210/180 against measured widest inner labels of 60.3, 90.4 and 66.3,
         which is the padding those labels need and no more, and the remainder buys TOP_GAP 83 for
         each call and return pair.
PANEL    x<=290.77, bottom 125.11..160.00 at 1600x1000. x<=377.76, bottom 150.17..192.67 at
         1280x860. x<=396.55, bottom 180.12..229.82 at 1100x800. FOUR of the six steps sit on that
         229.82 floor, the poster and `sandbox` and `create` and `start`, so the worst case is the
         ordinary case here rather than one outlier: only `cni` at 180.12 and `image` at 205.00 sit
         above it. Width and depth BOTH peak at 1100x800, so one viewport is the whole worst case.
         That right edge TIES the catalog worst case L-02 records.
SIZES    The Node frame is 158/116/22 and NOT the CLU.L-01 family of 152/106/34, and the reason is
         the Pod SUBLABEL. Frame 462..620, Pod 484..600, inner row 514..568, so the band under the
         inner boxes is 32 and the frame floor is 20. The family band is 26 (POD_H 106 over an
         inner of dy 28 plus h 52, `cluster-node-drain`), and this is the only cluster card whose
         Pod shell carries a sublabel that CHANGES on every step: ` `, `sandbox ready`, then
         `IP 10.244.1.5` held to the end. Measured at 1600x1000 that string occupies 581.7..594.6,
         which is 13.7 clear of the inner boxes and 5.4 clear of the shell floor. The frame keeps
         22 of label padding rather than 34 because the extra ten went to the Pod, and its floor
         sits at 620 rather than the 624 L-24 names.
LANES    The turn has to go ABOVE both columns, because 120..245 is the only horizontal
         band on this card free of them, and the long leg then falls through the 490..620 gutter.
DO NOT   Turn at BUS_Y = NODE_Y - 16 and end on the Pod sandbox top midpoint. containerd centres on
         x=772, INSIDE the chip column (620..1140, y 279..445), so the 326 unit vertical leg goes
         straight through all four value chips on every one of the four steps that ride it. Nothing
         catches it: THROUGH scores blocks, and a value chip is not a block. WHERE A
         LANE TURNS DECIDES WHAT IT CROSSES, and the only witness for the chip column is a rendered
         frame.
MOTION   On `cni` the CNI return and the `conf` route down to the sandbox BOTH leave at 800, and
         that is the sentence: the plugin does its work in the sandbox netns and reports back on
         one beat, so neither leg waits for the other. The order the reader has to see still holds
         on ARRIVAL, return at 1500 and the sandbox pulse at 1942.
         `image` holds 2600 for 291 characters, 8.93 ms per character. It is the one step with no
         Pod beat and its span is 1260, so the HOLD is the whole step and the duration is the only
         thing carrying the reading. The catalog median and this step's rank against it are NOT
         restated here: both move with every card added anywhere in the tree, and their executing
         home is `card-review/tools/timing.mjs`, which prints them on demand.
DO NOT   Chain `conf` after the CNI return to make the causality literal. `after: 'ret'` puts the
         route at 1600, its arrival at 2742 and the pulse tail at 3642, so `duration` has to go
         3100 -> 3700 (M-19) and the step reads at 15.5 ms per character, slower than any other
         step on the card, to buy a beat the arrival order already tells.
CONTENT  The card stands on 32 claims. 28 carry a quote from one of 14 fetched documents, 1 is
         UNVERIFIED and named below, 3 need no network because they are internal consistency. The
         claims were read against k8s 1.35, which is what `k8sVersion` states and what dates them.
         `sources` carries FOUR entries, which 5 cards in 110 do. The fourth is Network Plugins,
         and it is the only page that covers `cni`: `the Container Runtime must be configured to
         load the CNI plugins`. Container Runtimes stays because it is what backs the containerd
         block and its CRI gRPC sublabel, and it says nothing about either CNI or images.
         `image` says the skip belongs to the POLICY, not to the runtime: `under IfNotPresent
         Kubelet skips the call when the image is already there`. VERIFIED on the Images page,
         which says `This policy causes the kubelet to skip pulling an image if it already exists`
         and `The imagePullPolicy for a container and the tag of the image both affect when the
         kubelet attempts to pull (download) the specified image`. Attributing it to the runtime
         (`reuses a cached layer set if it is already local`) put three carriers of one fact on
         screen disagreeing, and it borrowed the wording the SAME page reserves for Always: `The
         kubelet itself does not check whether the image is cached locally, it always delegates to
         the container runtime`. Under Always the call is made every time, which is the case the
         runtime wording quietly generalised away. The sibling that owns the loop,
         `cluster-kubelet-reconcile-loop`, says `imagePullPolicy can skip when it is already on the
         Node`.
         Ladder row 3 followed it: `fetch image (skipped if cached)` became `fetch image (policy
         can skip)`. The old parenthesis named the CACHE as the reason, which is false under
         Always, where the kubelet issues PullImage on every container start and the cache is the
         runtime side of it. Row 3 and the `image` narration now name the same cause.
         `image` closes `No workload container exists yet`. WORKLOAD is load-bearing and not
         padding: the bare `No container exists yet` is contradicted by this card's own canvas,
         where the pause container stands inside the Pod shell from `sandbox` onward and IS a
         container. The word costs 9 characters, which the `image` duration in MOTION pays for.
         `sandbox` names BOTH `spec.shareProcessNamespace` and `spec.hostPID`. Naming only the
         first leaves a T-19 absolute, because `spec.hostPID` is the counter-case (PodSpec: `Use
         the host's pid namespace`, plus `HostPID and ShareProcessNamespace cannot both be set`).
         The default is
         from the CRI proto, `NamespaceOption.pid`: `The CRI default is POD, but the v1.PodSpec
         default is CONTAINER. The kubelet's runtime manager will set this to CONTAINER explicitly
         for v1 pods`.
         `sandbox` opens `with the Pod metadata`, not `with the Pod namespace`. The field is
         real (`PodSandboxMetadata.namespace`, `Same as the pod namespace in the Pod ObjectMeta`),
         but the very next clause says `the network, IPC, and UTS namespaces`, so the reader met
         the word twice in one breath meaning two different things. `metadata` is the CRI field
         that CONTAINS it, so the sentence got one character shorter and lost no truth.
         `start` makes the CONTAINERS the gate and the probe the qualifier. `the Pod reports Ready
         once its probes pass` is rejected: it states a gate that does not exist on a Pod with no
         readiness probe, where `If a container does not provide a particular probe, the kubelet
         always considers the result as Success`. `readinessGates` is a second gate and is
         deliberately left out: it is a Pod-level extension this card never draws, and the clause
         would cost more than the one it replaced.
         Held on purpose: `the network, IPC, and UTS namespaces every workload container will share
         by default` is exact, and UTS is not guessed. containerd `WithPodNamespaces` joins every
         container to the sandbox NET, IPC and UTS namespaces unconditionally and adds PID only
         when the mode is not CONTAINER. `by default` is what covers hostNetwork, hostIPC and
         hostPID, so no further clause is owed.
         `create` puts the CGROUP on the START beat, not on CreateContainer, and ladder row 4 reads
         `OCI spec, rootfs, mounts` for the same reason. The CRI comment settles nothing (`creates
         a new container in specified PodSandbox`), so the drawn runtime decides it: containerd is
         the block on this card, its `CreateContainer` builds the OCI spec, reserves the name and
         prepares the rootfs snapshot and every mount, and its `StartContainer` calls `NewTask`
         plus `task.Start`, which is where runc creates the container and its cgroup. `The runtime
         sets up cgroups` on step 4 is therefore rejected: it credits the right component on the
         wrong call, which is the one misreading a reader cannot recover from.
         UNVERIFIED and left standing: `forks the container ENTRYPOINT process`. The process is
         ENTRYPOINT plus CMD and `command` and `args` override both, so the strict string is
         longer than the panel allows. Step 5 measures 229.82 at 1100x800, the card worst case
         against a ladder at 245, so one more line collides. ENTRYPOINT is the house shorthand,
         the app box sublabel says the same word, and the card is consistent with itself.
         Verified and unchanged: `Pod IP 10.244.1.5` is the catalog-canonical Pod address (98 uses)
         and `nginx:1.27` its canonical image tag (9 uses). `The Pod IP is now set on the sandbox`
         is `PodSandboxStatus.network.ip`, `IP address of the PodSandbox`. `The container now
         exists in the sandbox but is not yet running` is `ContainerState.CONTAINER_CREATED = 0`.
         The step ORDER is the Pod lifecycle page: `After sandbox creation, network configuration,
         volume mounting ... the kubelet sets the PodReadyToStartContainers condition to True.
         Image pulling and container creation occur after this point`.
         `sources` gained `Images`. The two the card shipped with (CRI Spec, Container Runtimes)
         carry the calls and the runtime and neither says anything about imagePullPolicy, which
         after this pass is the most load-bearing claim on the card.
BUDGET   The panel is what sets LADDER_Y, and the two walls are balanced rather than maximised:
         245 leaves 15.18 under the 229.82 panel and 17 between the shared column floor at 445 and
         the Node frame at 462. Panel bottoms quantize on 24.85 at this viewport (180.12, 205.00,
         229.82), so ONE more line on any of the four deep steps lands on 254.67 and swallows the
         ladder by 9.67. There is no room to absorb it: re-measure at 1100x800 after any prose edit
         and move LADDER_Y, never the prose. The characters holding the deep steps are the
         `spec.hostPID` counter-case, the readiness-probe qualifier and the cgroup correction on
         `create`, and cutting any of the three is the T-20 trap.
NOTE     The two columns are ONE band: the chips run on the ladder gap of 10 rather than a wider
         gap of their own, and they are built UPWARDS off the shared floor COL_BOTTOM 445 rather
         than downwards off LADDER_Y, so the chip rhythm reads as the ladder rhythm and the two
         columns end on one line. Chips 279 / 323 / 367 / 411 against ladder rows 245 / 287 / 329 /
         371 / 413: the counts differ, 4 chips of 34 against 5 rows of 32, so the rows do NOT pair
         up and were never meant to. The floor is what pairs. The chip column top therefore floats
         with the chip COUNT and is not a panel clearance: at 279 it clears the deepest panel
         (229.82 at 1100x800) by 49.18, and only the ladder at 245 is on the 15.18 wall.
DO NOT   Re-align the chip column top back onto LADDER_Y. It reopens the 22 unit gap the four
         chips need to fill the same 200 units the five ladder rows do, and the two columns then
         run at visibly different rhythms and miss each other at the bottom by 2.
NOTE     Moving LADDER_Y is free of TIMING, which is not obvious and is why it is the lever. JOG_Y
         is `midX(TOP_BOTTOM, LADDER_Y)`, so the jog falls by half of whatever the ladder falls by
         and the connector trades the same length between its first and last vertical legs. At 235
         and at 245 the route measures 514 units either way, so `routeDur` and every span on the
         card are untouched (M-20, A-11).
NOT A DEFECT
         `status` changes SUBJECT across the card: sandbox on `sandbox` and `cni`, the image on
         `image`, the container on `create` and `start`. It reports the newest bring-up milestone
         and P-02 holds because nothing is lost when it moves on: the sandbox state stays legible
         on the Pod shell sublabel (`IP 10.244.1.5`) for every step after `cni`.
         `image` names the registry and the Node image store and neither is drawn (T-21). The card
         is the CRI boundary, Kubelet on one side and containerd on the other, and a registry block
         would be the only element on the canvas outside the Node. `cluster-kubelet-reconcile-loop` does
         not draw one either.
         `sandbox` writes `sandbox id pause-7f3a` with no ball on the drawn return lane, while
         `create` rides that lane for its container id. The split is A-06: `create` NAMES the
         return (`returns a container id`), `sandbox` does not, and P-06 puts a value chip outside
         the arrival rule so it owes no ball. Adding the clause to `sandbox` costs a panel line,
         and 229.82 is already the card worst case against a ladder at 245.
         `render/motion.test.mjs` reports PULSE-TOGETHER (`M-03`) twice here, on `create` and on
         `start`: the app container blinks and the Pod holding it does not. Both are deliberate and
         this is the only card in the catalogue that does it, which is why the check carries an
         explicit ceiling of 2 for this id rather than staying silent.
         The card draws TWO groups inside one shell. `sandboxGroup` is the Pod (shell plus the pause
         container) and it pulses on its own beats, `run` and `conf`. `appGroup` is a second inner
         box the `tune` hook adds INSIDE that shell so the workload container can fade and blink on a
         beat of its own, which is what those last two steps are about: CreateContainer materialises
         it at `pending`, StartContainer takes it to full. The sandbox does not change on either step.
DO NOT   "Fix" it by pulsing `sandboxGroup` on those two steps. The whole Pod would blink for an
         event that happens to ONE container inside it, at the exact moment the eye is meant to be on
         that container coming up out of nothing, and the card would then say the sandbox is
         re-created per container, which is the misreading the pause container exists to prevent.
```

### before `      key: 'sandboxGroup', id: 'sandboxGroup', shellKey: 'shellEl', innerKey: 'pauseBox',`

```
The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
and the workload container (created at CreateContainer, started at StartContainer).
Centred on CX, under the point where the zigzag enters the Node frame.
```

### before `    P.packets(),`

```
Z-order canon: packetLayer rides above the static wires but below the
blocks, so the ball reads on its connector and arrival is told by the pulse
(matches every other node card; the center connector travels in open space).
```

### poster

```
Sentence: the sandbox keeps one identity while the containers under it come and go.

Nested containment plus one break, redrawn 2026-08-28. The 276 x 136 frame on even 22 unit margins IS
the sandbox and it is now the heaviest thing on the canvas: stroke 2 and fill 0.05, against inner
blocks that never carry stroke weight. A header band holds the whole accent, a 66 x 8 bar at 0.9 over
a 0.25 rule across the frame at y 64, and that rule is what stops the bar reading as an inner block
bar with no block around it: it is the frame speaking for itself, the network identity the desc ends
on. Under it two 78 x 44 footprints on one baseline at y 86, the left dashed 4 3 at 0.02 and struck
with the house X (two crossing lines at 0.55, round caps, `cluster-node-pressure-eviction` vocabulary)
and the right solid at 0.10 carrying the loser bar at 0.3. So the eye lands on the frame bar, and the
sentence is read downwards: the identity holds, the container below it was replaced.

WHY the sentence moved. The previous poster said the workload container comes up inside a sandbox that
already exists, which is true and is also what the two neighbours already look like: a rounded frame
holding rectangles with bars, next to `cluster-kubelet-reconcile-loop` (five such blocks) and
`cluster-static-pods` (two). Three tiles of one vocabulary in a row is the R-05 failure, and the desc
ends on a sentence no poster in the category was saying, `one network identity that outlives any
container restarting inside it`. The break is what no neighbour has.

WHY NOT the pause container propping the frame open, a narrow full height post at the left carrying an
upright accent with the workload blocks beside it. It is the same first-half sentence the old poster
told, and the post is a shape the catalogue does not use for a container.

DO NOT drop the header rule and leave the accent bar floating in the top band. Rendered without it the
bar reads as the label of a block that is missing, and the top third of the frame reads as dead air,
which is the reading the first draft of this redraw actually produced.

WHY NOT a sandbox BAR under the two containers with a circle on it for the pause container. It
inverts the containment the card draws: the Pod part labels the shell Pod sandbox and puts pause and
app inside it at the same INNER_W and INNER_H, so pause is a PEER of the workload container and not
its substrate. Its bare r=8 ring was the only circle in the catalogue standing for a container,
against 32 rings across 14 posters that each stand for a host, a phase station or a netns, which is
the plain circle R-10 names. Its frame was a clone of network-pod-localhost (y 36, h 108, rx 12 at
0.03, two inner rects at 0.05, one bare r=8 ring), where the ring means the shared loopback, so one
shape carried two meanings across two categories.

WHY NOT a two stage chain, the same frame drawn twice, first holding pause alone and then holding
both. Two frames fit in about 130 units each, which drops the inner blocks under the 76 to 80 band
R-06 sets, and half the canvas goes to repeating a frame that does not change.

DO NOT move the accent into either inner block. The subject is the thing that survives, and an accent
on the live container says the poster is about that container rather than about what outlasts it.
```
