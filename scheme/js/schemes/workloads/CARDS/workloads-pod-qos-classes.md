## workloads-pod-qos-classes

### layout

```
WHAT     Three Pods classified Guaranteed, Burstable and BestEffort, and which two the Kubelet
         evicts under Node pressure.
LAYOUT   C (bottom strip).
           ladder 660..1140
           chips  two across at 548 and 590
           node   404..532, three Pods, row at NODE_Y + 34
PANEL    The swing between the three viewports is the second widest in the catalog, so a reading
         taken at 1600x1000 alone is worthless here: every clearance below is against the 1100x800
         number. All three are printed on demand by
         `OVERLAY_IDS=workloads-pod-qos-classes node --test report/overlay.test.mjs`.
SIZES    The bus at 384 is 5.1 clear of the deepest panel (378.90 at 1100x800) and 34
         clear of the ladder floor. THAT 5.1 IS THE PROSE BUDGET: one more wrapped line on the
         deepest step is 24.85 units and puts the panel through the bus, so a narration here can
         only grow if the bus moves first. That deepest reading is a TIE rather than one step:
         `cgroups` and `tiers` both reach 378.90 at 1100x800, so a prose edit to EITHER spends
         the 5.1, and naming one of them is how the other moves the wall with nothing pointing
         at it.
         Moving the bus costs nothing in time: LANE(i) splits the same vertical between trunk and
         tap, so lengths stay 650 / 284 / 650. The outer pair rides the 0.450 canon and the middle
         one is FLOOR-BOUND: 284 units finish in 631ms against the 700 of PKT_DUR_MIN, so it runs
         at 0.406 with M-13 holding it, the reading 578 balls in the catalog share.
         Both actor boxes are 232 wide, the width `workloads-pod-startup-conditions` draws its
         pair at, in that card's arrangement: Kubelet centred on CX because WL.L-07 needs the
         trunk to leave a face midpoint, API right-aligned on WL.R where the ladder and the chip
         strip also end. The API sublabel `admission · qosClass · binding` is what binds that
         width: 184 units at 1100x800 leaves 24 clear each side, against 60.8 for
         `cgroups + eviction` in the other box, so a longer API sublabel does not fit 232. The gap
         between the boxes is 192, which is the `bind` hop and still under the PKT_DUR_MIN floor,
         so that hop holds its 700ms.
LANES    Trunk down x = CX to a bus at NODE_Y - 20 = 384, ABOVE the frame, one tap per Pod down
         to the frame border. One ball per tap, each Pod pulsing on ITS OWN ball landing
         rather than on a single shared arrival: the outer lanes are longer and that is the point.
         The top row carries ONE lane and not the WL.A-01 pair, recorded at ANSWER_Y below.
         A tap ends at TAP_END = NODE_Y, so the head meets the frame top border FROM OUTSIDE and
         nothing is drawn inside the frame band: the tap is the 20 between the bus and the border,
         and the head is 9.8 of it (markerWidth 7 at stroke-width 1.4), so 10.2 of shaft stands
         between the bus and the point. At NODE_Y - 14 the head began at the bus and read as
         hung off it. That is
         the half of WL.A-03 this card can hold: the Kubelet acts ON the Node, and which Pod took
         the write is said by that Pod pulsing rather than by an arrow reaching into it.
         The other half, ONE endpoint on the frame face midpoint, stays unmet by construction: the
         card spends its whole design on three entries, one per Pod, each with its own length and
         its own arrival, and a single drop takes the per-Pod pulse order with it, which is the
         content of `schedule` and of `tiers`.
         The trunk and the bus are LANES and not relations. Both carry every fan ball, and
         `relationPath` is for a line no ball rides: its `scheme-arrow-relation` sinks the stroke
         to 0.45 opacity, which drew the first two thirds of each run at half the weight of the
         tap it ends on. They keep a tap's own `dim` dashed lane and drop the marker through
         `tune`, because one head per run belongs on the tap that reaches the Node (A-04).
         The bus stands ABOVE the frame. At NODE_Y + 12 = 416 it falls inside the node() label band
         L-23 measures at NODE_Y+6.8..NODE_Y+21.4: it clears the label horizontally by 117 units
         and still reads as a second frame border, same dash, same hue, 12 units under the real
         one. Standing above the frame costs the corridor between the ladder floor at 350 and the
         frame, 54 units of which the bus spends 34, and only a trimmed narration leaves that
         room: a panel reaching 403.74 against NODE_Y of 404 is a clearance of 0.26, and the
         49.69 units the two trimmed narrations are worth are what open it.
         Lowering the bus INSIDE the frame instead does not work. The band is NODE_Y..POD_Y, 34
         units, and an arrowhead is about 10 to 13 of them, so a bus clear of the label band at 430
         leaves an 8 unit tap that is all head and no shaft. Growing the Node frame to buy the room
         does not work either: the free band is 354.05..624 and the frame plus the chip strip
         already spend 204 of it, with 16 left to the canvas floor at 640.
CONTENT  Claims read against the k8sVersion in `cards.js`.
         The uncapped Pods on `cgroups` are BOTH A AND B, so the sentence names both. Pod B is
         Burstable with requests only, which the classify step says in words ("requests only, no
         limits") and its own sublabel repeats (`req only · 500m / 256Mi`), so naming Pod A alone
         made a true sentence read as a property of BestEffort.
         `tiers` says Pod C is "evicted last, ranked by Priority, if system daemons overrun what
         the Node reserved for them", and its sublabel reads `Guaranteed · evicted last`.
         "is reached only by the kernel OOMKiller" and the sublabel `Guaranteed · survives` are
         both rejected: node-pressure-eviction says "Guaranteed pods and Burstable pods where the
         usage is less than requests are evicted last, based on their Priority", and that where
         system processes overrun their reservation "the kubelet must choose to evict one of these
         pods to preserve node stability ... it will choose to evict pods of lowest Priority
         first". A Guaranteed Pod under its request IS reachable by the kubelet, last in line.
         The sublabels now read `evicted 1st` / `evicted 2nd` / `evicted last`, one scale.
         `schedule` says "The resource fit looks only at requests". "Scheduling looks only at
         requests" is rejected: scheduling also filters on nodeSelector, affinity, taints and
         topology spread, so the absolute is false of scheduling and true only of the resource
         fit, which is the half the step is about.
         `cgroups` carries "with node-critical Pods on -997 whatever their class". Without it
         "BestEffort gets 1000" is an absolute with a live counter-case: `pkg/kubelet/qos/policy.go`
         returns guaranteedOOMScoreAdj for a node-critical Pod before it ever reads the QoS class.
         The Burstable clamp is `3..999`, not `2..999`: the floor is the literal
         `1000 + guaranteedOOMScoreAdj` and guaranteedOOMScoreAdj is -997. Secondary write-ups
         stating a floor of 2 are rejected against that source.
         `classify` keeps "set once at creation and never changes for the rest of the Pod life".
         In-place Pod resize is GA at this release and does NOT weaken it: a resize that would
         land the Pod in a different QoS class is rejected by admission.
         `spec` carries the docs' "above zero" on the Guaranteed rule: requests equal to limits at
         zero is NOT Guaranteed, and a rule stated without it calls a class that the API would not
         assign. The 11 characters cost this step one wrapped line and nothing else, because the
         5.1 the bus leaves is measured against `cgroups` and `tiers` at 378.90 while `spec` sits
         at 229.82.
         `spec` scopes BestEffort to CPU and memory: "no container sets a CPU or memory request or
         limit". "No container has any requests or limits at all" is rejected, because the docs
         carve out the counter-case in the same breath, "(Containers can still request other
         resources and remain BestEffort)", so a Pod asking only for a GPU stays BestEffort while
         the absolute says it does not. The `desc` carries the same scope through "neither", which
         picks up the CPU and memory the clause before it names.
         `spec` still states neither the Pod-level resources variant, Beta at this release, nor
         the extended resources the carve-out names. Neither changes which class any of the three
         drawn Pods gets, and the step is 337 characters.
BUDGET   Every narrated step runs 7.0 to 7.5 ms per character, well under the catalog median that
         `timing.mjs` prints beside it, so the pace is this card's own band rather than one step's
         problem, and a step dropping under 7.0 here is out of band rather than merely brisk.
         `spec` and `classify` hold the same 2400ms over 337 and 322 characters, which is what
         puts them at the two ends of that band.
         `cgroups` and `tiers` are the two steps the reading pace binds, and both are sized from
         BOTH ends, characters out and duration up, which is what puts them at 4000 and 4200. The
         still time on the pair leaves a duration room here where a sentence has none, and SIZES
         above is the hard wall on the sentence. Reading pace per step, still time and the rank
         against the catalog are printed by `card-review/tools/timing.mjs` and `deadair.mjs`.
NAMING   Every drawn string names `oom_score_adj`, the field the Kubelet writes, and never the
         kernel's own computed `oom_score`. They are two different numbers and the three Pod
         sublabels on `cgroups` carry the value of the first.
         No drawn string names the Scheduler, because no box is the Scheduler. The chip and the
         ladder row said "scheduler" while the actor row holds Kubelet and API only, which sent
         the reader hunting for a third box. The narration keeps the impersonal "Scheduling looks
         only at requests", which names a process rather than pointing at a block.
         Drawing the Scheduler as a third actor box to earn the word back does not fit. Kubelet is
         centred on CX by WL.L-07 because the trunk leaves its face midpoint, and API is
         right-aligned on WL.R, which leaves the 192 between them: with the house 60 gap on each
         side a third box is 72 wide, against an API sublabel that needs 184 on its own.
```

### before `const ALL_PENDING = { pod1: OPACITY.pending, pod2: OPACITY.pending, pod3: OPACITY.pending, ...RAIL, ...taps(OPACITY.pending) };`

```
LANES    The three Pods rest at OPACITY.pending on `idle`, `spec` and `classify` and only reach 1
         on `schedule`, each on the arrival of its OWN fan ball. They do not sit at 1 from the
         poster on, three frames before the step that places them: `schedule` would then fan three
         balls into an outcome already drawn. C-06 is the shade for declared and not working yet,
         which is exactly an object with no spec.nodeName.
         The three TAPS are pinned with the Pod row, in `taps`, because a tap ends on a Pod and is
         as faint as the Pod it points at (A-13). With the Pods dimmed and the taps left at 1 the
         three arrowheads were the brightest thing in the Node band, pointing into nothing that
         had arrived. Measured on the rendered frame at both viewports.
         The trunk and the bus are NOT pinned with them, in `RAIL`: they end on the rail rather
         than on any Pod, so nothing they reach is pending, and dimming 636 units of the run for
         a state that belongs to the 20 unit stubs read as the whole drawing being switched off
         for the first three steps. It is also what `tiers` already did from the other side, where
         two Pods go and the rail stays.
         Drawing the three Pods OUTSIDE the Node frame until they are bound has no band to go in:
         layout C puts the deepest panel bottom at 354.05, the frame at 404..532 and the chip strip
         at 548..624, so the free height between panel and floor is 269.95, the frame plus strip
         spend 204 of it, and the 66 that are left are the bus corridor. Born at 0 and revealed on
         `schedule` fails on the other side: `classify` writes all three qosClass values onto the
         Pod inner boxes and pulses all three Pods, so hidden Pods leave that step drawing nothing
         at all. C-14 also forbids cutting an absent block, and these are not absent: they are in
         etcd, which is what ladder row 0 says.
MOTION   `schedule` winds the WHOLE object back, taps included, because a rewind naming the three
         Pods alone is the second entry A-16 forbids: it reopens the pending shade on the Pods and
         leaves the taps at 1, which is the arrowheads-over-nothing picture this note rejects,
         standing until the first ball lands at 1500 and the last at 2244.
         The taps rise at the binding arrival, so every lane is lit before its ball leaves
         (A-15).
         `classify` pulses with `dim: true`. A 900ms brightness pulse on a Pod sitting at 0.55 is
         not seen without the opacity lift `pulsePodDim` adds (M-07).
```

### before `const EVICTED = {`

```
LANES    QoS eviction: BestEffort and Burstable (A, B) are evicted and dim together by the same
         amount, Guaranteed (C) survives at full opacity. The final state is pinned inline for
         cancel-safety.
         tap1 and tap2 sink WITH their Pods, to OPACITY.terminating, because a lane is as faint as
         the Pod it points at (A-13). Each is pinned at 1 in the static block and only fades at
         its own ball arrival, so A-15 still holds and the lane is lit for the whole flight.
         The trunk and the bus stay at 1, as they do on every step: they still feed tap3, and C
         survives.
         Neither tap is held at 1 to the end of the step. The balls land at 1444 and 2244 and fade
         200ms later, so the last 1756ms of such a hold draws two full-strength arrowheads into two
         ghosts at 0.25, which is the same defect the ALL_PENDING note above records for the
         unplaced Pods.
MOTION   No chip carries a cue on this step. The three qosClass values are unchanged since
         `classify`, so lighting one would cue a change that did not happen (P-09a), and lighting
         Pod A alone while the narration evicts both A and B is worse than lighting neither (P-04).
         The order is carried by the sublabels and the focus chip.
```

### poster

```
Three Pods with a resources bar each: none, one bar, two matched bars, over a baseline whose weight
ramps dashed to 2px. The bars ARE the R-07 house accent, a currentColor rect inside the block it
belongs to, and the baseline carries the ranking, so the order is unmistakable at 200px.
A third ramp, a row of dots under the baseline, was cut: it said what the baseline already said,
and it pushed the poster to 6 currentColor fills against a lint ceiling of 3 measured over the
shipped set. With it gone the accent is an accent again and the primitive count drops 12 to 9.
The class names are not written. The whole idea is that the class is DERIVED from what the Pod asked
for, so drawing the request and letting the ranking follow is the poster stating the mechanism.
```
