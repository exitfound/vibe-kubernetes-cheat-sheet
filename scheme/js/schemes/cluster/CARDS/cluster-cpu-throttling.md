## cluster-cpu-throttling

### layout

```
WHAT     A container hitting its CPU limit: the CFS quota, the stall at the end of every period, and
         the Kubelet finding out from cpu.stat.
LAYOUT   The deliberate TWIN of cluster-oom-kill, memory limit against CPU limit. It copies that
         card's skeleton so the pair reads as a pair and changes exactly one thing: the sibling's
         five-row ladder in the right column becomes the TIME SCALE, which is why the card exists.
         The frame is the family 152 at 380..532 and opens 8 above the sibling's 388, because both
         cards put their chip strip on the same CHIPS_Y 548, and NODE_Y = 548 - NODE_H - 16 solves
         to 380 on 152 where it solves to 388 on the sibling's 144.
PANEL    x<=397, bottom 212 / 256 / 329, worst on `observe` at 457 characters.
BUDGET   About 530 characters, MEASURED rather than guessed. The panel deepens by 0.70 units per
         character at 1100x800 (279.5 at 386 characters, 329.2 at 457), and what it runs into is the
         Node frame label at y 387, so `observe` at 457 has 58 units of clearance and roughly 72
         characters left. Nothing else is drawn left of 414 above the frame. Re-measure after prose.
SIZES    The stack sits inside a SECOND frame, 660..1140 x 160..354, on the Node family's own
         padding (`CLU.L-01`): 34 under the corner label, 12 under the last row. The bars inset 24
         from each side wall, so they measure 684..1116 by 40 high on a 14 gap, at y 194 / 248 / 302,
         and the fill is 216. Three loose rows in the right column read as three unrelated bars, and
         the frame is what makes them one instrument, the reading the Node band below already gets.
NAMING   The frame's corner label is `CFS periods` and nothing stands beside it. A tag reading
         `one CFS period per bar` at (660, 166) sits in the corner node() prints its own label in
         (x+12, y+18), so the two together are one caption stated twice. `100ms` stays, right
         aligned on that label's baseline at 1128, because it names the WIDTH of a bar and not the
         frame. The label is uppercased by CSS, which is `T-12` and cannot be fixed in the string.
NOTE     THE TIME SCALE IS THREE BARS STACKED, NOT SIDE BY SIDE. Side by side inside the frame's 432
         units gives three 134 wide bars whose 50% fill is 67 units, and the caption naming the empty
         tail has nowhere to go. Stacked gives each period the full 432, a 216 unit fill and a
         right-aligned caption over the stall it names, and it reads as one clock running down the
         page rather than as three containers standing side by side.
NOTE     The bars are BARE rects, not box(), which is a geometry decision rather than a style one:
         432 wide blocks at y 248 and 302 land inside CENTRE-LOW's span (panel bottom 212.33 at
         1600x1000) and would drag the low content centre off 600 toward the 900 the stack is
         centred on, on a card centred on 600 by construction. The FRAME around them is free by a
         different route: `L-17` has CENTRE-LOW exclude node() frames outright.
         The cost is that `render/palette.test.mjs` never sees them either, so their colours are pinned in one
         frozen BAR block: the channel list 125, 134, 255 is the cluster --tint-base-rgb, copied
         rather than referenced because an SVG presentation attribute cannot resolve a token.
NOTE     The scale rests at OPACITY.pending rather than at 0, which is a fact rather than a flourish:
         with cpu.max at its default there is no bandwidth enforcement and nr_periods is genuinely 0.
WHY NOT  Resting at 0 and appearing on `quota`. The rendered frames killed it: with the right column
         blank and the left owned by the panel, the two opening frames were two boxes and a Node band
         with a 480 x 194 hole between them, and `idle` is the poster, the first thing anyone sees.
         Nothing in the gate says a word about it.
NOTE     The scale hangs off the KERNEL, not the Kubelet. cpu.max is what makes the kernel account in
         periods at all and the throttling decision is the kernel's alone: the Kubelet does not learn
         about it until it scrapes cpu.stat, which is the last step. Hanging it off the Kubelet would
         say the Kubelet runs the clock, the one thing the card exists to deny.
MOTION   The fill grows by ANIMATING THE rect WIDTH, a real WAAPI animation on an SVG geometry
         property. It is not a packet, so no packet canon applies and `render/opacity.test.mjs` never sees it.
         `render/duration.test.mjs` does: three fills at 700ms staggered 700 apart measure a span of 2101 on
         `throttle`, and the Pod pulse runs 0 to 900 INSIDE that span rather than after it, so the
         3400 is the span plus 1299 of reading time for the narration and not a sum of the two.
         Every enter() writes EVERY bar through setBars. A bar left alone keeps the previous step's
         fill and caption, which on a time scale does not read as a stale value, it reads as a period
         that behaved differently.
NOTE     cpu.stat deliberately does NOT move on `spend`. The kernel increments nr_periods and
         nr_throttled from the period TIMER, when an interval elapses, so half way through the first
         period both are still 0. An earlier draft read `nr_throttled 0 of 1` there, which claims a
         period has closed on the step whose whole subject is the middle of one.
CONTENT  Two blocks are drawn, `Kubelet` and `Linux kernel`, so no step may hand the work to "the
         container runtime": the `request` step says the Kubelet sends it DOWN THE CRI, which the
         Kubelet's own sublabel (`CRI resources + cAdvisor`) draws, and the `quota` step names no
         actor at all (`On cgroup v2 that is one line, cpu.max`). Both steps light the kernel, so a
         third actor in the words was the only thing on the card with nowhere to look.
CONTENT  The four cgroup readings come off the kernel interface rather than off a Kubernetes page,
         and the third `sources` entry is that page: `cpu.weight` default 100 in [1, 10000],
         `cpu.max` default `max 100000` in `$MAX $PERIOD` order, microseconds throughout, and
         `cpu.stat` always reporting `usage_usec`, `user_usec` and `system_usec` plus FIVE more
         while the controller is enabled: `nr_periods`, `nr_throttled`, `throttled_usec`,
         `nr_bursts` and `burst_usec`. The chip draws two of those five, which is the reading a
         right aligned line holds, and three field names do not read as one number.
         The 100ms is the kubelet default and the card says `the default 100ms period` because it
         IS overridable: `--cpu-cfs-quota-period` defaults to 100ms and a non-default value needs
         the CustomCPUCFSQuotaPeriod gate.
CONTENT  `35` is four links of chain, all four read at the source rather than recalled. The Kubelet
         computes 250 * 1024 / 1000 = 256 CFS shares, sends them over the CRI as `cpu_shares`
         ("CPU shares (relative weight vs. other containers)"), the runtime lands them in the OCI
         spec as `CPU.Shares`, and runc converts THERE, not in the Kubelet:
         `c.Resources.CpuWeight = cgroups.ConvertCPUSharesToCgroupV2Value(c.Resources.CpuShares)`
         in `libcontainer/specconv/spec_linux.go`. That is why the `request` narration has the
         weight LAND rather than be written, and the passive is load bearing.
CONTENT  `so on a quiet Node this container may use far more than its 250m` is rejected: the
         container box beside it draws `limits.cpu 500m`, so the ceiling a reader can see is twice
         the request and `far more` argues with it. The shipped tail names the ceiling instead,
         `and what caps it is the limit rather than the request`, which is also the handoff into
         the `quota` step.
CONTENT  `so four busy threads would empty it 12.5ms in` is rejected: 50 divided by 4 needs the
         four threads RUNNING at once, and the step before it spends its qualifier on exactly this
         (`One busy thread on one CPU`). The shipped sentence carries `on four CPUs`.
CONTENT  The `aria-label` absolute `the only record is cpu.stat` carries its counter-case in the
         same breath, `a kernel counter rather than a field on any Kubernetes object`, which is the
         `observe` payoff stated for a reader who cannot see the container state chip holding
         `Running · restartCount 0` through all five steps.
CONTENT  `and all the workload lost was latency` is rejected, and so is the desc absolute it echoed,
         `Nothing dies and nothing is recorded as an error`. The quota kills nothing, which is the
         card's whole thesis and stays, but a throttled container is not therefore safe: a liveness
         probe is a timed call, and the reference names this exact failure in as many words,
         `Incorrect implementation of liveness probes can lead to cascading failures. This results
         in restarting of container under high load`, with `for liveness and startup probes, the
         kubelet kills the container, and the container is subjected to its restart policy`. So the
         absolute would leave a reader believing throttling cannot end in a restart, when the
         commonest way it bites in production is exactly that. The shipped tail names the
         counter-case in the same breath and keeps the attribution on the Kubelet rather than the
         kernel: `The quota kills nothing, but the latency it costs can fail a liveness probe, and
         that restarts the container`. The mechanism itself belongs to `workloads-probes`, which
         owns the threshold this card does not state, `livenessProbe restarts the container after
         failureThreshold consecutive failures`. The desc takes the narrow subject instead of a
         qualifier it has no room for: `The quota kills nothing, the latency just grows`, which
         also buys 25 characters back inside the 400 to 470 band.
CONTENT  CFS BURST is deliberately absent. `cpu.max.burst` lets a cgroup spend unused quota from
         earlier periods and would break the flat `50ms of every 100ms` the three bars draw, but
         Kubernetes has no field that sets it, the kernel default is 0, and the request is still an
         open issue rather than a KEP (`kubernetes/kubernetes#104516`). The kernel reports it in the
         two cpu.stat fields the chip does not draw, `nr_bursts` and `burst_usec`, which is the one
         place a reader could notice the omission.
CONTENT  Re-read against the release in `k8sVersion` and unchanged: the CRI carries the request as
         `cpu_shares`, commented `CPU shares (relative weight vs. other containers)`, beside a
         `unified` map for cgroup v2 the Kubelet does not use for this; `--cpu-cfs-quota-period`
         defaults to 100ms and needs `CustomCPUCFSQuotaPeriod` for anything else; the Kubelet still
         serves `/metrics/cadvisor`, so `container_cpu_cfs_throttled_seconds_total` is still the
         name; and the Resource Management page states the enforcement the card draws, `cpu limits
         are enforced by CPU throttling` and `a cpu limit is a hard limit the kernel enforces`.
         cgroup v1 is gone on this release, which is why every cgroup reading here is a v2 file.
CONTENT  Two simplifications are DELIBERATE and are not to be "corrected". `the runnable cgroups on
         this Node divide the CPUs` flattens a hierarchy that is strictly sibling scoped at each
         level, and it matches how the CRI itself words the field. And `nr_throttled 3 of 3` prints
         two cpu.stat fields as one reading, `nr_throttled` out of `nr_periods`, because the chip
         value is right aligned into one line and three field names do not read as one number.
NOTE     The Pod PULSES on `spend` and on `throttle`, and does NOT fade anywhere on this card. Those
         are the two steps where nothing travels and the container itself is the actor, first
         emptying the budget and then sitting dequeued, so the pulse is the only thing that says
         WHEN, and `M-01` makes a Pod the one element allowed to carry it. It does not pulse on
         `observe`: the sibling dims its whole Pod group on the kill, here the container SURVIVING
         is the answer, and a Pod that flinches when a metric is scraped would be saying something
         happened to it. Both pulses were read off the rendered frame at 450ms, the peak: the shell
         and the container box brighten together, which is the whole-Pod pulse the catalog draws.
NOT A DEFECT
         `report/arrival.test.mjs` prints this card on R2-ENTRY and NOT on R2-STEP, and only the second
         is a queue. R2-ENTRY samples both steps frozen at t=0, where `rewind` has rolled cpu.weight
         back and the `F.set` has not landed, so the turnover shows up one step late, at `quota`.
         R2-STEP, settled against settled, is the reading the rule asks for and stands at 7 findings,
         7 carried, 0 left to work, with this card in none of them. DO NOT close the entry row by
         lighting cpu.weight on quota, which points the eye at the one chip that step does not touch.
NOT A DEFECT
         `report/chip-beat.test.mjs` FORM-B: on `observe` the cpu.stat chip reads 100 of 100 and is lit
         700ms before the ball lands. The value is TRUE before the scrape, which is the payoff the
         step exists for: cAdvisor reads a kernel counter that climbed while nobody was looking, so
         binding the chip to the arrival would say the reading created the number. 700ms is the
         mildest band the report has, shared with 199 of its 329 records.
NOTE     A period closing is TWO flow entries at one delay, the caption through `F.run` and the counter
         through `F.set`, and the pair is deliberate. One `F.run` writing both reads as a
         static path ending on `nr_throttled 3 of 3` against an animated path ending on
         `nr_throttled 1 of 1`, because every field reader in the tree models a step as `chips`, then
         `rewind`, then the `F.set` entries in flow order, and a function body is not one of those.
         Both paths do end on 3 of 3, off `tools/settled-dump.mjs` and off
         `__schemeCtl.gotoStep(4)`, so nothing on screen moves either way: what the split buys is
         that the end state is stated in a field. `report/chip-beat.test.mjs` section 4 stands at 2
         pairs on 1 card, and both of them are `workloads-daemonset`. The split costs NOTHING in
         the motion record: two entries at one delay share the one empty-keyframe `at(...)` track, so
         `tools/motion.mjs` prints the same 12 tracks on `throttle` it printed before.
DO NOT   merge the two back into one callback. The caption half has to stay an escape because no flow
         verb writes a standing tag's text, and folding the counter back into it puts the end of the
         animated path somewhere no field reader can follow.
```

### poster

```
Sentence: the budget runs out before the period does, every period, forever.

Three identical outlined blocks in a row (80 x 92 at x 20 / 120 / 220), each one a 100ms CFS period,
each carrying a currentColor rect at 0.9 filling exactly the LEFT HALF with the right half empty.

The accent is FLUSH: inset 2 on the left, top and bottom so it meets the block's own stroke, its
right edge exactly on the block midpoint. Inset 6 all round with rx=3 reads on a montage as a
smaller bright block floating inside a bigger one rather than as a block filled half way from the
left, which is the entire sentence. Both versions are legal SVG and only the tiled screenshot tells
them apart.

Three and not one: one filled block is a progress bar, three identical ones are a rhythm that does
not end. Emphasis is deliberately EQUAL across the three, the one place this poster departs from
the single-brightest rule, because brightening one period would say that period was special.
```

### before `const RUN_W = SCALE_W / 2;`

```
THE WORKED EXAMPLE every number on the card derives from.

  requests.cpu 250m, limits.cpu 500m, one busy thread, the default 100ms period.
  quota          500m x 100ms      = 50ms of run time per 100ms period
  cpu.max        50000 100000      (microseconds, quota first, period second)
  run portion    50ms of 100ms     = half the bar, RUN_W = SCALE_W / 2 = 216
  stall          100ms - 50ms      = 50ms per period
  three periods  3 x 50ms          = throttled_usec 150000, nr_throttled 3 of 3
  ten seconds    100 x 50ms        = throttled_usec 5000000, the 5 the metric reports

ONE THREAD IS THE POINT OF THE HALF FILL. The bar is WALL CLOCK, not CPU time, so with one runnable
thread on one CPU the two coincide and the fill lands exactly on the quota. Two threads fill a
quarter and four fill an eighth, and either makes the picture say something the arithmetic beside it
does not. The multi-thread case is the more interesting fact and it is kept in WORDS, inside the
`throttle` narration where nothing on the canvas argues with it.

THE cpu.weight CHIP PRINTS THE NUMBER AND SAYS WHAT SET IT: `unset · 100 is the raw cgroup default`
at rest, `35 · from requests.cpu 250m` once the request lands. Both halves earn their place. The
value is two conversions deep, so the chip that showed only the source would be asking the reader
to do them: the Kubelet turns the request into CFS shares (`MilliCPUToShares`, 250m -> 256) and
cgroup v2 maps shares to a weight through the QUADRATIC fit in the library Kubernetes vendors,
`ConvertCPUSharesToCgroupV2Value` in `vendor/github.com/opencontainers/cgroups/utils.go`:

  exponent = (log2(s) * log2(s) + 125 * log2(s)) / 612 - 7 / 34
  weight   = ceil(10 ** exponent)

   100m ->  102 shares ->  17      500m ->  512 shares ->  59
   250m ->  256 shares ->  35     1000m -> 1024 shares -> 100     2000m -> 2048 shares -> 174

Recomputed off that source, not copied. The 1000m row is the curve's OWN FIT POINT: the function is
fitted to min, max and default, so one whole CPU lands exactly on the cgroup default of 100. That is
what makes the unset reading of 100 the right thing to pair the chip against, and 35 reads as a
quarter of a CPU asking for rather less than the default. Re-derive both if the request ever changes,
because a stale number here reads exactly like a measured one.
https://github.com/opencontainers/cgroups/blob/main/utils.go

DO NOT restate the weight as 1 + ((shares - 2) * 9999) / 262142, and DO NOT gloss the result as "10
is TEN TIMES LESS than the 100 a fresh cgroup starts at". The linear form is live code and it does
give 10 for 256 shares, but it is a DIFFERENT CGROUP LEVEL: `getCPUWeight` in
`pkg/kubelet/cm/cgroup_manager_linux.go` is what the Kubelet writes on the QoS and Pod slices it
creates itself. The CONTAINER cgroup, the box this card draws, is the runtime's, and the Kubelet
hands it `cpu_shares` over the CRI, so the quadratic above is the conversion that lands on it. The
two disagree at every row of the table (10 against 35, 4 against 17, 39 against 100), so swapping
them puts a Pod-slice number on a container. The gloss is false either way: the mapping compresses
nothing, it is fitted so one CPU IS the default.
https://github.com/kubernetes/kubernetes/blob/master/pkg/kubelet/cm/cgroup_manager_linux.go
```

### before `const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, FRAME_Y]];`

```
OFFEDGE judges an endpoint against BLOCK faces, and neither a node() frame nor a bare rect is one, so
the (900, 160) end is invisible to it. Not licence to be sloppy: 900 is the stack midpoint by
construction (`SCALE_CX`) and 160 is the frame's own top wall, so the line lands on the middle of the
face of what it points at whether or not a rule can see it.
```

### before `function setBars(s, runs, caps) {`

```
The captions turn over on the beat that earns them, the `network-dns-ndots` shape: end state pinned
above the `ctx.reduced` guard, played path rolled back to what the step starts from, turnover on the
fill finishing through the shared `at(...)`. `spend` holds `quota spent at 50ms` back until the fill
reaches the middle of the bar, and `throttle` turns `cpu.stat` over once per period as each fill
closes, 1 of 1, 2 of 2, 3 of 3, because a counter reading 3 from step entry skips two thirds of what
the sentence describes. A seeked frame cannot show any of this, and `render/reduced.test.mjs`
passing is the proof it lands.
```

### before `F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, lights: ['kubelet'] })`

```
The same lane, direction and shape as the `observe` step of `cluster-oom-kill`, on purpose: on both
cards the last step is the Kubelet finding out about something the kernel already did. There the
carrier is PLEG relisting a dead container, here cAdvisor reading the cgroup files, and both land on
the Kubelet, which lights on arrival rather than at entry.
```
