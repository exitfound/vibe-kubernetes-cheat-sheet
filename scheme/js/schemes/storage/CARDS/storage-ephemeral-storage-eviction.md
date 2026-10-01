## storage-ephemeral-storage-eviction

### layout

```
WHAT     An ephemeral-storage limit is a budget the Kubelet enforces after the bytes are written:
         it sums the writable layer, the log and the disk emptyDir of Pod web-a, finds the Pod total
         of 1100Mi over the 1Gi sum of its container limits while the container alone (700Mi) is
         inside it, and evicts the whole Pod on a Node that never ran short of disk.
LAYOUT   A to-scale gauge, the one quantity drawn as a length in the section. Top row right of the
         panel: Pod web-a 484..716 and the Kubelet 884..1116, on one centre line (y 132). Below the
         panel, full width: the gauge, titled as Node-1 local storage used by the Pod, 120..1080 by
         300..468, with two stacked-bar rows on ONE linear scale, 0 to 1280Mi over 720 units from
         x 320. Row 1 is the container (writable layer + log), row 2 the Pod (+ emptyDir). The 1Gi
         limit is one full-jade dashed line through both rows at 896, the 512Mi request a solid
         tick 426..438 at 608, both derived through xOf(), never typed. The emptyDir segment exists
         in row 2 only and grows only there: that difference is the lesson, and it shows on `write`
         before `compare` names it. The bars are P.raw rects whose inline width IS the value, so
         `paint()` in `enter` writes every width on every step. Chips: a strip of four at 228, gap
         16, 120..1080, the gauge width exactly, so both edges line up.
PANEL    Measured bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 180.12..204.97 at 1100x800, the deepest reading on the `request` step (and the
         poster, which previews it), and equally on `compare`, `evict` and `replace` at 1100x800:
         `OVERLAY_IDS=storage-ephemeral-storage-eviction node --test report/overlay.test.mjs` from
         `scheme/test/`.
         The gauge starts at x 120 and y 300, 95 below the deepest reading, so its title (y 322) and
         row labels clear the panel at every viewport. The top row sits at 80..184 inside the panel
         height, so no block starts left of x 420.
SIZES    The Kubelet is 232 by 80, each Pod 232 by 104 with a 192 by 44 app box (NET.L-01). Chips
         228 wide, off STO.L-03 so the strip spans the gauge, the tightest pair `Pod web-a` plus
         `Failed, Evicted` at a 56.8 unit gap at 1100x800, the other three at 75: `Failed, not restarted` measured a 1 unit gap and is rejected. Segment labels
         sit only in row 2; row 1 carries the same shades unlabelled.
LANES    Four lanes, each array feeding its wire and its ball: W_WRITE Pod bottom to gauge top at
         600 (116 units), the mirrored scan pair W_SCAN / W_BACK on the Kubelet bottom and gauge top
         at 1000 +/- 12 (128 units), and W_EVICT Kubelet left face to Pod right face at y 132 (168
         units). The write and evict lanes belong to the Pod slot and go to 0 with web-a (A-14),
         returning with web-b. L-shaped lanes that meet one side face each, which let every tag
         clear every face in flight, are rejected: the straight layout reads better.
MOTION   Every ball rides routeDur, as on storage-emptydir, which puts the 116, 128 and 168 unit
         legs on the 700ms floor, and no explicit `dur`, so the card is not in the motion PACING
         list. Every tag shows from departure and dissolves with its ball on arrival (M-30a), riding
         outside its lane: write 40 right and 16 below, `read usage` 40 left and 16 below, the reply
         40 right and 16 below, evict 36 ahead and 26 above. A head-on lane leaves no side clear of
         both faces, so each tag is clear of every border at rest, by at least 6 units at all three
         viewports sampled every 25ms, and crosses the gauge frame or the Pod face in flight. The
         evict tag leads its ball and lands inside Pod web-a, between its label and the app box.
         The Pod blinks as one on `request`, `write`, `evict` and `replace`: no step lights the app
         box, which would stay lit after the blink decays (STO.C-02), and the pulse is what cues the
         Pod as the sender on `write`, whose first ball leaves at BEAT.afterPulse. Each landing
         grows its segments (a0+b0, a1+b1, then b2 alone) with an F.anim width 0 to value, fill
         both, and turns `usage` over through an F.set. `scan` leaves the lit Kubelet at BEAT.lead
         and the `1100Mi` reply lands the usage chip. `compare` reveals the two verdict captions,
         the Pod row last. `evict` turns the Pod chip at the evict arrival, blinks the Pod, then
         fades it to OPACITY.terminated with its two lanes. `replace` drains the bars, cross-fades
         the gauge title and row label from web-a to web-b (two tags each, no text write), and
         brings web-b and its lanes in at FADE.out. The Pod chip holds `Failed, Evicted` from
         `evict` and takes no cue there (P-09a). Spans against durations, live WAAPI reading:
         900/2600, 3660/4400, 2860/3600, 2001/3500, 3000/3800, 2200/3500, so `write`, `scan` and
         `evict` stand still 740 to 800ms after their motion, and `request`, `compare` and
         `replace` 1700, 1500 and 1300: reading time at 9.4, 11.6 and 13.0 ms per character,
         `request` already faster than 86 percent of the catalog.
CONTENT  Read against release 1.35: concepts/storage/ephemeral-storage.md, kubelet
         pkg/kubelet/eviction (eviction_manager.go, helpers.go), kubelet.go, pod_workers.go,
         kuberuntime_gc.go and controller_utils.go on release-1.35. Where the docs are silent the
         source is cited, and that is an implementation detail rather than a contract.
         `request`: "was not yet requested" ships, "512Mi ... was free" is rejected: the scheduler
         counts requests against allocatable, never disk use ("The scheduler ensures that the sum
         of the resource requests of the scheduled containers is less than the capacity").
         `write`: "The limit refuses no write" ships, "Nothing refuses a write" is rejected: a full
         filesystem does refuse one, and project quotas "monitor storage use; they do not enforce
         limits". "only the writable layer and the log count for the container" is the doc
         wording ("if a container's writable layer and log usage exceeds its storage limit"); the
         source adds the writable layer only when the Node has no dedicated imagefs
         (containerEphemeralStorageLimitEviction), which this single-filesystem Node-1 does not.
         `scan`: the loop period is evictionMonitoringPeriod, 10s, but usage is read from cached
         stats (volumeStatsAggPeriod "Default: 1m" for volumes), so it reads the usage "it last
         measured". Project quotas cover emptyDir only, sit behind the beta, off-by-default gate
         LocalStorageCapacityIsolationFSQuotaMonitoring and need "the pod must be in a user
         namespace": "where those are enabled" is rejected as too broad, and so is "where that beta
         gate and user namespaces are on", which drops the third condition the docs list ("the root
         filesystem ... has project quotas enabled"): the narration names all three. The loop READS
         cached usage, so the Kubelet ball is tagged `read usage` and the aria-label says it "reads
         the measured usage": a ball tagged `scan` and "measures" both put the scan in the loop.
         `compare`: localStorageEviction runs emptyDirLimitEviction, then
         podEphemeralStorageLimitEviction, then containerEphemeralStorageLimitEviction and stops at
         the first hit, so the narration names that order and the container check is never reached
         here. The Pod limit is PodLimits over the containers and exists only when some container
         sets one, which app does.
         `evict`: "kills web-a with a 1 second grace period, whatever its spec asks" ships, "stops
         web-a at once" is rejected: every limit eviction passes immediateEvictionGracePeriodSeconds
         = 1 as the override. The node-pressure page's "a `0s` grace period" is about hard
         thresholds, a different path, and the release-1.35 code passes the same 1 there too. The
         message is podEphemeralStorageMessageFmt verbatim, reason "Evicted", phase Failed.
         `replace`: IsPodActive excludes phase Failed, so the ReplicaSet counts web-a out and
         creates web-b. The narration claims only that web-b starts from zero: web-a's containers
         and log directory go at the next container GC (ContainerGCPeriod 1m, and
         ShouldPodContentBeRemoved is true for an evicted Pod) and its volumes at teardown, not at
         the eviction itself. The Pod
         chip stays `Failed, Evicted` on `replace`; `Failed, replaced` is rejected because it reads
         as an API phase. desc: "while its controller, if any, makes a new one" ships, because a
         bare Pod has none.
NAMING   web-a and web-b are the ReplicaSet form: a replacement is a new Pod under a new name, and
         it is drawn in the same slot because Node-1 still has room, which the narration states as
         a possibility, not a scheduling promise.
SCOPE    Node-pressure eviction (DiskPressure, eviction thresholds, which Pod goes first) belongs to
         cluster-node-pressure-eviction and gets ONE pointer clause on `replace`. The Node-1 chip
         says `no DiskPressure` on every step. A container killed at its memory limit belongs to
         cluster-oom-kill and gets one contrast clause. tmpfs emptyDir sizing is storage-emptydir,
         the overlay layers storage-container-filesystem, and how requests are summed for
         placement workloads-effective-pod-requests.
NOTE     The request caption is the one cue on `request` besides the chip: a P.tag takes no
         .highlight, so `paint()` sets its fill to the storage colour on that step alone.
NOT A DEFECT
         Kubelet is an accepted off-card actor, and this ruling covers the WHOLE CATEGORY. Storage
         has almost no Kubelet box by design, so a step whose statement is true of work only the
         Kubelet does may name it as the subject without drawing it: a prose sweep into the passive
         voice throws the mechanism away, and drawing the block is geometry. storage-hostpath cites
         this ruling. This card itself draws the Kubelet, because it is the actor of three steps.
         The CENTRE finding is carried in fixtures/carried.mjs: the rule counts only the two
         top-row blocks, and the gauge that balances them is bare rects.
         `replace` fades web-a from OPACITY.terminated to 0 with no pulse, ruled in
         report/pod-fade.test.mjs: it blinked on `evict`, where the evict ball reached it.
         The five R2-ENTRY rows are carried: each chip value is written by `chips`, wound back in
         `rewind` and turned over by the F.set on the beat that earns it, and R2-STEP reads 0.
```
