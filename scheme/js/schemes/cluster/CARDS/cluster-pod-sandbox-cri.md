## cluster-pod-sandbox-cri

### layout

```
WHAT     The Kubelet as a CRI CLIENT: containerd is what materialises the pause container, pulls,
         creates and starts, and CNI wires the sandbox namespace.
LAYOUT   404 IS A HARD STOP, not taste: the panel measures x<=397 at 1100 width at every height and
         the top row at y 40..120 sits inside that band, so seven units is the entire clearance. It
         is a viewport-WIDTH effect, not a text-length one, so a longer narration cannot eat it. The
         room for the arrows therefore does not come from moving left, it comes out of the BOXES.
         Widths are 180/210/180 against measured widest inner labels of 60.3, 90.4 and 66.3, which
         is the padding those labels need and no more, and the remainder buys TOP_GAP 83 for each
         call and return pair.
         The two columns are ONE band: the chips run on the ladder gap of 10 rather than a wider gap
         of their own, and they are built UPWARDS off the shared floor COL_BOTTOM 445 rather than
         downwards off LADDER_Y, so the chip rhythm reads as the ladder rhythm and the two columns
         end on one line. Chips 279 / 323 / 367 / 411 against ladder rows 245 / 287 / 329 / 371 /
         413: the counts differ, 4 chips of 34 against 5 rows of 32, so the rows do NOT pair up and
         were never meant to. The floor is what pairs. The chip column top therefore floats with the
         chip COUNT and is not a panel clearance: at 279 it clears the deepest panel (229.82 at
         1100x800) by 49.18, and only the ladder at 245 is on the 15.18 wall.
         The chip column top is NOT re-aligned onto LADDER_Y. That reopens the 22 unit gap the four
         chips need to fill the same 200 units the five ladder rows do, and the two columns then run
         at visibly different rhythms and miss each other at the bottom by 2.
         Moving LADDER_Y is free of TIMING, which is not obvious and is why it is the lever. JOG_Y
         is `midX(TOP_BOTTOM, LADDER_Y)`, so the jog falls by half of whatever the ladder falls by
         and the connector trades the same length between its first and last vertical legs. At 235
         and at 245 the route measures 514 units either way, so `routeDur` and every span on the
         card are untouched (M-20, A-11).
PANEL    Right edge and bottom per viewport: `OVERLAY_IDS=cluster-pod-sandbox-cri node --test
         report/overlay.test.mjs`.
         FOUR of the six steps sit on the 1100x800 floor, the poster and `sandbox` and `create` and
         `start`, so the worst case is the ordinary case here rather than one outlier: only `cni`
         and `image` sit above it. Width and depth BOTH peak at 1100x800, so one viewport is the
         whole worst case. That right edge TIES the catalog worst case L-02 records.
SIZES    The Node frame is 158/116/22 and NOT the CLU.L-01 family of 152/106/34, and the reason is
         the Pod SUBLABEL. Frame 462..620, Pod 484..600, inner row 514..568, so the band under the
         inner boxes is 32 and the frame floor is 20. The family band is 26 (POD_H 106 over an inner
         of dy 28 plus h 52, `cluster-node-drain`), and this is the only cluster card whose Pod
         shell carries a sublabel that CHANGES on every step: ` `, `sandbox ready`, then `IP
         10.244.1.5` held to the end. Measured at 1600x1000 that string occupies 581.7..594.6, which
         is 13.7 clear of the inner boxes and 5.4 clear of the shell floor. The frame keeps 22 of
         label padding rather than 34 because the extra ten went to the Pod, and its floor sits at
         620 rather than the 624 L-24 names.
LANES    The turn has to go ABOVE both columns, because 120..245 is the only horizontal band on this
         card free of them, and the long leg then falls through the 490..620 gutter. The lane does
         NOT turn at BUS_Y = NODE_Y - 16 to end on the Pod sandbox top midpoint. containerd centres
         on x=772, INSIDE the chip column (620..1140, y 279..445), so the 326 unit vertical leg goes
         straight through all four value chips on every one of the four steps that ride it. Nothing
         catches it: THROUGH scores blocks, and a value chip is not a block. WHERE A LANE TURNS
         DECIDES WHAT IT CROSSES, and the only witness for the chip column is a rendered frame.
MOTION   On `cni` the CNI return and the `conf` route down to the sandbox BOTH leave at 800, and
         that is the sentence: the plugin does its work in the sandbox netns and reports back on one
         beat, so neither leg waits for the other. The order the reader has to see still holds on
         ARRIVAL, return at 1500 and the sandbox pulse at 1942.
         `image` holds 2600 for 291 characters, 8.93 ms per character. It is the one step with no
         Pod beat and its span is 1260, so the HOLD is the whole step and the duration is the only
         thing carrying the reading. The catalog median and this step's rank against it are NOT
         restated here: both move with every card added anywhere in the tree, and their executing
         home is `card-review/tools/timing.mjs`, which prints them on demand.
         `conf` is NOT chained after the CNI return to make the causality literal. `after: 'ret'`
         puts the route at 1600, its arrival at 2742 and the pulse tail at 3642, so `duration` has
         to go 3100 -> 3700 (M-19) and the step reads at 15.5 ms per character, slower than any
         other step on the card, to buy a beat the arrival order already tells.
         `status` changes SUBJECT across the card: sandbox on `sandbox` and `cni`, the image on
         `image`, the container on `create` and `start`. It reports the newest bring-up milestone
         and P-02 holds because nothing is lost when it moves on: the sandbox state stays legible on
         the Pod shell sublabel (`IP 10.244.1.5`) for every step after `cni`.
         `image` names the registry and the Node image store and neither is drawn (T-21). The card
         is the CRI boundary, Kubelet on one side and containerd on the other, and a registry block
         would be the only element on the canvas outside the Node. `cluster-kubelet-reconcile-loop`
         does not draw one either.
         `sandbox` writes `sandbox id pause-7f3a` with no ball on the drawn return lane, while
         `create` rides that lane for its container id. The split is A-06: `create` NAMES the return
         (`returns a container id`), `sandbox` does not, and P-06 puts a value chip outside the
         arrival rule so it owes no ball. Adding the clause to `sandbox` costs a panel line, and
         229.82 is already the card worst case against a ladder at 245.
         An inner box never blinks inside a Pod without the Pod itself, the outer frame: that is
         the user's ruling for this card and it is M-03. On `create` and `start` the pulse lands on
         `sandboxGroup`, so the shell, the pause container and the app container blink as one, on
         the arrival of the route down to the Node at 1942, the same anchor as the `run` and `conf`
         pulses. `appGroup` is a second inner box the `tune` hook adds INSIDE that shell so the
         workload container can FADE on a beat of its own, from the same arrival: CreateContainer
         materialises it at `pending`, StartContainer takes it to full. The fade tells which
         container came up, the blink belongs to the Pod. It is the plain pulse and not the dim one:
         the Pod stands at full shade on both steps, only the app box is pending, and `pulsePodDim`
         would flash the opacity of the whole sandbox. The app box is in no `lit` on either step, so
         nothing it shows outlives the blink.
CONTENT  Every claim here carries a quote from one of the cited documents except one, which is
         UNVERIFIED and named below, and three that need no network because they are internal
         consistency. They are read against the release `k8sVersion` states, which is what dates
         them.
         `sources` carries FOUR entries, which few cards do. The fourth is Network Plugins, and
         it is the only page that covers `cni`: `the Container Runtime must be configured to load
         the CNI plugins`. Container Runtimes stays because it is what backs the containerd block
         and its CRI gRPC sublabel, and it says nothing about either CNI or images.
         `image` says the skip belongs to the POLICY, not to the runtime: `under IfNotPresent
         Kubelet skips the call when the image is already there`. VERIFIED on the Images page, which
         says `This policy causes the kubelet to skip pulling an image if it already exists` and
         `The imagePullPolicy for a container and the tag of the image both affect when the kubelet
         attempts to pull (download) the specified image`. Attributing it to the runtime (`reuses a
         cached layer set if it is already local`) put three carriers of one fact on screen
         disagreeing, and it borrowed the wording the SAME page reserves for Always: `The kubelet
         itself does not check whether the image is cached locally, it always delegates to the
         container runtime`. Under Always the call is made every time, which is the case the runtime
         wording quietly generalised away. The sibling that owns the loop,
         `cluster-kubelet-reconcile-loop`, says `imagePullPolicy can skip when it is already on the
         Node`.
         Ladder row 3 carries the same cause: `fetch image (policy can skip)` and not `fetch image
         (skipped if cached)`. A parenthesis naming the CACHE as the reason is false under Always,
         where the kubelet issues PullImage on every container start and the cache is the runtime
         side of it.
         `image` closes `No workload container exists yet`. WORKLOAD is load-bearing and not
         padding: the bare `No container exists yet` is contradicted by this card's own canvas,
         where the pause container stands inside the Pod shell from `sandbox` onward and IS a
         container. The word costs 9 characters, which the `image` duration in MOTION pays for.
         `sandbox` names BOTH `spec.shareProcessNamespace` and `spec.hostPID`. Naming only the first
         leaves a T-19 absolute, because `spec.hostPID` is the counter-case (PodSpec: `Use the
         host's pid namespace`, plus `HostPID and ShareProcessNamespace cannot both be set`). The
         default is from the CRI proto, `NamespaceOption.pid`: `The CRI default is POD, but the
         v1.PodSpec default is CONTAINER. The kubelet's runtime manager will set this to CONTAINER
         explicitly for v1 pods`.
         `sandbox` opens `with the Pod metadata`, not `with the Pod namespace`. The field is real
         (`PodSandboxMetadata.namespace`, `Same as the pod namespace in the Pod ObjectMeta`), but
         the very next clause says `the network, IPC, and UTS namespaces`, so the reader met the
         word twice in one breath meaning two different things. `metadata` is the CRI field that
         CONTAINS it, so it costs one character less and loses no truth.
         `start` makes the CONTAINERS the gate and the probe the qualifier. `the Pod reports Ready
         once its probes pass` is rejected: it states a gate that does not exist on a Pod with no
         readiness probe, where `If a container does not provide a particular probe, the kubelet
         always considers the result as Success`. `readinessGates` is a second gate and is
         deliberately left out: it is a Pod-level extension this card never draws, and the clause
         would cost more than the one it replaced.
         Held on purpose: `the network, IPC, and UTS namespaces every workload container will share
         by default` is exact, and UTS is not guessed. containerd `WithPodNamespaces` joins every
         container to the sandbox NET, IPC and UTS namespaces unconditionally and adds PID only when
         the mode is not CONTAINER. `by default` is what covers hostNetwork, hostIPC and hostPID, so
         no further clause is owed.
         `create` puts the CGROUP on the START beat, not on CreateContainer, and ladder row 4 reads
         `OCI spec, rootfs, mounts` for the same reason. The CRI comment settles nothing (`creates a
         new container in specified PodSandbox`), so the drawn runtime decides it: containerd is the
         block on this card, its `CreateContainer` builds the OCI spec, reserves the name and
         prepares the rootfs snapshot and every mount, and its `StartContainer` calls `NewTask` plus
         `task.Start`, which is where runc creates the container and its cgroup. `The runtime sets
         up cgroups` on step 4 is therefore rejected: it credits the right component on the wrong
         call, which is the one misreading a reader cannot recover from.
         UNVERIFIED and left standing: `forks the container ENTRYPOINT process`. The process is
         ENTRYPOINT plus CMD and `command` and `args` override both, so the strict string is longer
         than the panel allows. Step 5 measures 229.82 at 1100x800, the card worst case against a
         ladder at 245, so one more line collides. ENTRYPOINT is the house shorthand, the app box
         sublabel says the same word, and the card is consistent with itself.
         Verified and unchanged: `Pod IP 10.244.1.5` is the catalog-canonical Pod address (98 uses)
         and `nginx:1.27` its canonical image tag (9 uses). `The Pod IP is now set on the sandbox`
         is `PodSandboxStatus.network.ip`, `IP address of the PodSandbox`. `The container now exists
         in the sandbox but is not yet running` is `ContainerState.CONTAINER_CREATED = 0`. The step
         ORDER is the Pod lifecycle page: `After sandbox creation, network configuration, volume
         mounting ... the kubelet sets the PodReadyToStartContainers condition to True. Image
         pulling and container creation occur after this point`. `sources` carries `Images` because
         the other two (CRI Spec, Container Runtimes) carry the calls and the runtime and neither
         says anything about imagePullPolicy, which is the most load-bearing claim on the card.
BUDGET   The panel is what sets LADDER_Y, and the two walls are balanced rather than maximised: 245
         leaves 15.18 under the 229.82 panel and 17 between the shared column floor at 445 and the
         Node frame at 462. Panel bottoms quantize on 24.85 at this viewport (180.12, 205.00,
         229.82), so ONE more line on any of the four deep steps lands on 254.67 and swallows the
         ladder by 9.67. There is no room to absorb it: re-measure at 1100x800 after any prose edit
         and move LADDER_Y, never the prose. The characters holding the deep steps are the
         `spec.hostPID` counter-case, the readiness-probe qualifier and the cgroup correction on
         `create`, and cutting any of the three is the T-20 trap.
```
