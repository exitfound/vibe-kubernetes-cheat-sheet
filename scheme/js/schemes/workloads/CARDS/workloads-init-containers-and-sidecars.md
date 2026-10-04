## workloads-init-containers-and-sidecars

### layout

```
WHAT     Init containers running to completion in order, then a native sidecar starting and staying
         up alongside the app.
LAYOUT   B (chips left, ladder right).
           actors 40..120, Kubelet 484..716 centred on CX, Runtime 908..1140
           chips  60..540 by 304..464, 4 x 34 + 3 x 8 = 160
           ladder 660..1140 by 160..360, 5 rows = 200
           node   60..1140 by 484..624, on the floor, one 828-wide Pod centred in it
         Layout A is out: the 200 ladder against a 275..464 band of 189. Eleven short.
         The chip column is BOTTOM-anchored on the Node frame and not top-anchored on the panel.
         Every chip names a container drawn inside that frame, so the two read as one caption on one
         object. The 49.3 the anchor leaves under the panel is the band L-03 frees and nothing can
         fill, not a gap this card chose.
PANEL    Deepest reading is step 3 at 1100x800, x<=396.55 by y<=254.66 (1280x860 213.92, 1600x1000
         177.44). The chip column starts at 304, so 49.34 stands clear of it. A prose edit on any
         step is re-measured rather than reasoned about, and what prints the extent per viewport is
         `OVERLAY_IDS=workloads-init-containers-and-sidecars node --test report/overlay.test.mjs`.
SIZES    Both actor boxes are 232, which is what workloads-pod-startup-conditions draws its pair at,
         and the arrangement is that card's too: left box centred on CX for the spine, right box
         right-aligned on WL.R. extents.mjs at 1100x800 reads `container orchestrator` at 135 and
         `containerd · CRI` at 98.2, so the tighter of the two keeps 48.5 either side.
         That leaves 192 between the faces rather than 60. Nine cards run 192, and a ball on it
         reads 0.274 u/ms where 60 bought 0.086, the slow end of the catalog. Both lengths sit on
         the PKT_DUR_MIN floor at 700ms, so neither hop takes an explicit dur (M-12).
LANES    ONE straight drop on WL.SPINE_X from the Kubelet bottom midpoint to the NODE frame top
         midpoint at 484, with no jog and no corner. The endpoint on POD_Y that 14 workloads cards
         still carry is the retired form (WL.A-03): it pierces the frame and draws the Kubelet
         reaching THROUGH the Node rather than acting on it. The Kubelet box centred on CX is what
         buys the straight line, and the frame is full width so its top midpoint is CX already.
         Length 364, so a route costs 809ms where the jogged 451 cost 1002.
         Top row: REQ_Y carries the CRI call out to the Runtime, RESP_Y carries the exit report back
         (WL.A-01). Both ride on four of the five steps, so both are arrows, not relations.
MOTION   Three steps share one shape: the runtime reports an exit on the answer lane, the Kubelet
         calls StartContainer back, and the create lands on the node. On all three the runtime ACTS
         FIRST, so it is in the static `lit` list and its report waits BEAT.lead (M-18a): a ball
         leaving a dark box has no visible source. It sends before it receives, so R3 exempts it.
         Each container state chip turns over where the create lands on its box, through a
         `rewind` to Waiting and one F.set, and the chip of the container that has just exited
         stands at entry, because that exit is the premise the report carries.
         Spans 2169 / 3769 / 3769 / 3769 / 900 against durations 2600 / 3800 / 3800 / 3800 / 2700.
         The last step is the only one of the five whose duration is a CHOICE. The other four sit
         within 431ms of their own spans, three of them within 31, so M-19 sets them and nothing
         else can. `running` holds a 900ms pulse and everything past it is still air (M-19a).
         Its narration is 269 characters, the reverse termination order having gone to
         `workloads-termination-order` under one pointer clause, and it holds 2700 for them: 10.04 ms
         per character against a catalog median of 10.00, still standing still for 1800ms. At 3400 it
         reads 12.64 and stands still for 74% of itself.
         THE RHYTHM ARGUMENT IS REFUSED. The three steps above hold 3800 because their span is 3769
         and `M-19` forbids anything shorter, so matching them here buys an even tail with 2900ms in
         which nothing moves and nothing is left to read. main-start sits at 18.72 ms
         per character for the same reason and is NOT a precedent: its 3800 is a floor, not a
         choice. Populations and medians live in `report/baselines.test.mjs` and `timing.mjs`, which
         is why none is copied here.
         Nothing pulses but the Pod, and only on the last step, where the Pod is what changed. The
         four container boxes take a `.highlight` on arrival and carry no brightness track.
CONTENT  Claims read against k8sVersion 1.35. The sidecar is beta in 1.29 and GA in 1.33 and step 3
         states both. The feature-gates reference carries SidecarContainers Beta since 1.29 default
         true, and the Sidecar Containers page carries `This is a stable feature in Kubernetes, and
         has been since version v1.33`. `since 1.29` alone is rejected: it contradicts the desc,
         which says GA in 1.33, and reads as the whole history of the feature.
         Init:0/3 counts three init containers with the sidecar among them. `printPod` in
         `pkg/printers/internalversion/printers.go` formats `Init:%d/%d` over
         `len(pod.Spec.InitContainers)`, which a restartPolicy=Always entry is part of, so the
         denominator is 3 and not 2. That is also what `The sidecar still counts in the init list`
         in the desc is stating.
         A REGULAR init container is what has to exit 0, and step 1 says `regular` for that reason.
         `each one must exit with code 0 before the next can start` is rejected: step 3 of this same
         card starts the main container while init container 3 is still running, so the card
         contradicted itself in the one place a reader would notice.
         Started is `startupProbe succeeded, or a running process where no probe is set`.
         `immediately if no probe is set` is rejected: the page says that status `becomes true
         because there is a process running in the container and no startup probe defined`, so a
         process has to be up and immediately is earlier than the rule allows.
         What Started unblocks is THE NEXT ENTRY IN THE INIT LIST, which on this Pod happens to be
         the main container, and step 3 says both halves. The page says `the kubelet then starts the
         next init container from the ordered .spec.initContainers list`, so `unblocks the main
         container` alone states a Pod-specific outcome as the mechanism.
         The termination clause is a POINTER and not an account: workloads-termination-order owns
         that subject and draws the mechanism. The one sentence left here, that the order runs
         backwards, holds against `the kubelet postpones terminating sidecar containers until the
         main application container has fully stopped`.
         The phase clause holds against Running, `all of the containers have been created` plus at
         least one running or starting, which the main container start is what completes.
         workloads-pod-startup-conditions says the same in its own step 4.
         The lazy-pull clause holds against the Images page reading of Always, `every time the
         kubelet launches a container, the kubelet requests the container runtime to pull the
         image`, and workloads-image-pull-registry-auth owns that mechanism and agrees.
         The card draws three mechanisms and cites four pages for them, because the init ordering,
         the phase and the CRI calls are on none of the sidecar page.
NAMING   The Kubelet sublabel names the job it does HERE, `sequences the init list`, which is the
         shape all 31 other Kubelet sublabels in the catalog take. `container orchestrator` is
         rejected twice over: it names Kubernetes as a whole rather than the node agent, and it
         states no job this card draws.
         The Pod carries `sublabel: ' '` and not a real second line. It reserves the baseline pod()
         fixes at h - 8 so the four container boxes clear it, and workloads-effective-pod-requests
         carries the identical construction for the identical reason. Chain row 5 reads `until
         termination` and not `until term`: the ladder is 480 wide and the row measures 344 at
         1100x800, so the full word costs nothing it has.
```
