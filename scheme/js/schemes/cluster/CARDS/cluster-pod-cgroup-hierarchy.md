## cluster-pod-cgroup-hierarchy

### layout

```
WHAT     The cgroup v2 tree one Node carries, from /sys/fs/cgroup down through kubepods.slice, the
         two QoS slices, one slice per Pod, and the container leaf where cpu.max and memory.max are
         written.
LAYOUT   A TREE, not a sequence. Five tiers hang off one spine at x 600 and every tier is centred on
         it by construction, so the drawing balances with no hand-placed x anywhere. The top row
         holds the ROOT of the tree at 484..716 and the one actor that owns the four tiers under it,
         the Kubelet at 908..1140. The container runtime is NOT in that row: it sits beside the leaf
         at 908..1140 y 488..556, the level it owns, and its hop into the leaf is the only horizontal
         one on the card.
LAYOUT   The three children of kubepods.slice are three boxes across on spread(count 3, w 340), so
         the middle one lands on 600 and the outer two sit symmetrically about it at 230 and 970.
         That row IS the QoS argument: besteffort and burstable are QoS slices, and a Guaranteed Pod
         slice is the third kind of child at the same depth rather than a level below one.
PANEL    Right edge 396.5 worst case. Bottom by viewport over all 7 steps: 142.6 to 177.4 at
         1600x1000, 171.4 to 213.9 at 1280x860, 194.8 to 244.5 at 1100x800, deepest on kubepods and
         qos. The first thing left of x 420 is the besteffort box at y 288, so the clearance at the
         worst viewport is 43.5 units. Tiers 1 and 2 need none of it: they start at 484 and 440.
         report/geometry-soft.test.mjs returns 0 CENTRE, 0 CENTRE-LOW and 0 OCCLUDED findings, and
         the content bbox is 60..1140 centred on 600 by construction.
SIZES    TIER_H 52 is the shortest box that clears a label and a sublabel, because box() puts the
         sublabel baseline at h / 2 + 12.78, which is 38.78 here. The leaf is 68, the one tier whose
         sublabel is a sentence rather than a name. Widest drawn label is the Pod slice at 209.8
         units inside a 420 box, widest sublabel the leaf at 245.4 inside a 440 box, both at
         1100x800.
SIZES    Chips three across on strip(gap 14), 350.67 wide, which is LAYOUT.C.strip.three to the unit.
         The tightest of the three is memory.max: on the last step its name ends at 498 and its value
         starts at 573.1, 75.1 units of gap at 1100x800.
LANES    Eight edges and they are not one kind. SIX are lanes carrying a ball on the step that
         creates the block they point at. TWO are relations with no arrowhead, root to kubepods and
         Pod slice to leaf, because nothing ever travels either: on both of those steps the ball
         comes from the actor beside the tree, so the parent link is parentage and nothing more.
LANES    The fork under kubepods puts three endpoints on ONE bottom face, at 540, 600 and 660. The
         600 is the face midpoint and the other two are the mirrored pair at +-60 that L-12 reads.
         Both elbows turn at y 256, exactly half way down the 64 unit band under that tier, which is
         why that band is 64 where the other three are 48.
MOTION   Every moving step reveals its tier first and sends the ball at BEAT.lead, so a block and its
         lane are fully present 300ms before anything is sent down them (M-22, REVEAL_MS 500 inside
         BEAT.lead 800). The three balls of the qos step leave TOGETHER rather than in a chain: they
         are one write of three children, and the two outer routes are 374 units against the middle
         64, so the fan arrives staggered on its own.
MOTION   Read against the catalog: 46 to 50 percent still on the four moving steps, a shade over the
         median share `deadair.mjs` prints, and 9.84 to 11.02 ms per narration character straddling
         the median pace. Nothing is an outlier on both readings at once, which is the M-19a test.
WIRE LABELS
         Three, and each one sits BESIDE the lane it names rather than on it. `creates
         kubepods.slice` is anchored end at 1010 and centred in the 120..172 band, 16.3 clear of the
         kubepods top edge. `created at Pod start` is anchored start at 614, 14 clear of the spine it
         labels and 63 clear of the Guaranteed box at 800. `creates the container leaf` sits ABOVE
         its own hop rather than on it, because the hop is 88 units and the string is 159.5.
CONTENT  The card stands on four fetched pages and `sources` carries all four. About cgroup v2 backs
         the unified hierarchy, `stat -fc %T` answering `cgroup2fs`, and the requirement that `The
         kubelet and the container runtime are configured to use the systemd cgroup driver`. Reserve
         Compute Resources backs both settings step 2 names: `you must enable the new cgroup
         hierarchy via the cgroupsPerQOS setting. This setting is enabled by default. When enabled,
         the kubelet will parent all end-user pods under a cgroup hierarchy managed by the kubelet`,
         and `kubelet enforce Allocatable across pods by default. Enforcement is performed by
         evicting pods whenever the overall usage across all pods exceeds Allocatable`. Pod QoS
         Classes backs the three tiers and names memory.max as the hard limit. The Memory QoS blog is
         the ONE page on kubernetes.io that prints the slice paths.
CONTENT  Step 2 says enforceNodeAllocatable makes Allocatable a ceiling ENFORCED BY EVICTING, never
         that it writes a cap onto kubepods.slice. Eviction is the page's own mechanism and
         cluster-node-allocatable narrates the same sentence, so the other wording would have put two
         cards in this folder at odds over one setting.
CONTENT  The slice NAMES are quoted from the Memory QoS blog, which prints
         `/sys/fs/cgroup/kubepods.slice/kubepods-pod<uid>.slice/memory.min` for a Guaranteed Pod and
         `/sys/fs/cgroup/kubepods.slice/kubepods-burstable.slice/kubepods-burstable-pod<uid>.slice/memory.low`
         for a Burstable one. Those two lines are what put a Guaranteed Pod slice directly under
         kubepods and a Burstable one two levels down, which is the shape of the whole drawing. The
         same page carries the ownership split step 5 rests on: `The kubelet manages pod-level and
         QoS-class cgroups directly using the runc libcontainer library, while container-level
         cgroups are managed by the container runtime`.
CONTENT  UNVERIFIED, one string: `kubepods-besteffort.slice`. No page on kubernetes.io prints it. It
         is the besteffort arm of a naming pattern the blog prints for the burstable arm, and it is
         drawn because the tier is real and the row would be lying by omission without it. Nothing
         else on the card rests on that string.
CONTENT  UNVERIFIED, one citation: the Memory QoS blog is a v1.36 announcement while `k8sVersion` is
         1.35. The paths it prints are not version scoped, but the citation is one release ahead of
         the card, which is the reason it is written down here rather than left to be noticed.
CONTENT  cpu.max, cpu.weight and memory.max are the kernel doc's files and the three DEFAULTS the
         leaf step winds back to are its defaults: cpu.max `The default is "max 100000"`, cpu.weight
         `The default is "100"`, memory.max `The default is "max"`. The leaf sentence `The
         no-internal-process rule keeps processes on the leaves` is that doc's own: only domain
         cgroups holding no processes may enable domain controllers, so `processes are always only on
         the leaves`.
CONTENT  The container spec on the chips is the SAME one cluster-cpu-throttling runs on, requests.cpu
         250m against limits.cpu 500m, so `35 · from requests.cpu 250m` is byte identical to that
         card's own chip value and the two cannot disagree about one weight. That spec also fixes the
         QoS class: requests do not equal limits, so the Pod is BURSTABLE, which is why the drilled
         path runs through kubepods-burstable.slice and the Guaranteed box stands as a sibling.
CONTENT  memory.max is drawn in BYTES, 268435456 for a 256Mi limit, because the file holds bytes: the
         blog prints `536870912` for a 512 MiB request on memory.min. cluster-oom-kill draws the same
         limit as `256Mi` on a chip named `memory.current / max`, which reports usage against a limit
         rather than the file itself, so the two readings do not collide.
BUDGET   Narration ceiling 320 characters, longest 313 on qos. The band is derived backwards from the
         geometry: at 1100x800 the panel bottom tracks narration length, and the besteffort box at
         y 288 with its left edge on the content margin is what has to stay clear of it. 313
         characters measure 244.5, so the margin is 43.5 and a 380 character step would spend it.
NAMING   Every tier is labelled with the cgroup DIRECTORY NAME rather than with what it holds,
         because a reader running ls on /sys/fs/cgroup/kubepods.slice has to find the same strings.
         The one exception is the leaf, which has no stable name to print: under the systemd driver
         its directory carries the container id, so it is labelled `Leaf cgroup` and its sublabel
         says what is inside it. The id carries the TITLE, `D-02` keeps the category prefix, and
         `cluster-pod-cgroup-tree` resolves through `SCHEME_ALIASES` (`D-11`).
SCOPE    This card puts a value on the leaf and stops. The CFS period, throttling and cpu.stat are
         cluster-cpu-throttling. The cgroup OOM killer, memory.oom.group, SIGKILL and exit 137 are
         cluster-oom-kill. The Capacity minus reserved arithmetic is cluster-node-allocatable, and
         enforceNodeAllocatable is ONE clause here whose only job is to say the number becomes a real
         ceiling over this subtree. Deriving a QoS class from requests and limits is
         workloads-pod-qos-classes: QoS is only the SHAPE of the tree here.
NOTE     A tier the Kubelet has not reached RESTS at OPACITY.pending, never at 0. C-14 is the reason
         and the poster position is the measurement: cut out, the idle frame carried three boxes and
         a chip strip with roughly 280 units of empty canvas between them, which reads as a card that
         failed to load rather than as a tree waiting to be built.
NOTE     Three chips, one beat. The leaf step pins the written values above the guard and winds them
         back to the KERNEL DEFAULTS, so the animated path shows a fresh cgroup carrying `max
         100000`, `max` and `100` until the runtime write lands. The highlight on all three is true
         on either path, because the value changed either way.
WHY NOT  Chaining the qos and pod-slice balls back to the Kubelet so every creation visibly leaves
         the actor. Three hops on one step reaches about 3100ms of span and re-narrates steps 2 and 3
         each time it runs. The shipped reading is that a tree edge carries the new child appearing
         under its parent, and the Kubelet is lit on all three of those steps as the actor that did
         it.
WHY NOT  A Node frame around the tree. The frame has to start below the panel or its own corner label
         is unreadable, which is y 250 at 1100x800, and tiers 1 and 2 sit at 172 and 288: it would
         enclose three tiers of five and cut the tree in half.
WHY NOT  A ladder. Every laddered card in this folder uses one to carry a sequence the picture cannot
         hold. Here the picture IS that list, and six rows reading `1. root`, `2. kubepods`,
         `3. qos` would restate the drawing beside itself.
DO NOT   Give the drawn Pod requests equal to its limits. The chips carry requests.cpu 250m against
         limits.cpu 500m, which is what makes the Pod Burstable, which is what puts its slice under
         kubepods-burstable.slice. Equalise them and the drawn path contradicts the QoS row above it.
NOT A DEFECT
         Two of the six steps register no animation, `unified` and `readers`, and both stand still
         for their whole duration. That is the M-27 population: neither step has traffic to draw, and
         their pace is 9.62 on both, under the catalog median, so the hold
         is buying reading rather than covering a missing beat.
NOT A DEFECT
         A seeked frame never shows the arrival highlights or the chip turnover, because onfinish
         does not fire on a seek (M-35). Both were read off a real-time playthrough with
         tools/settled-dump.mjs instead: kubepodsBox, the three children, podBox and leafBox all
         carry .highlight on their own steps, and the three chips settle on the written values.
```

### poster

```
Sentence: the value only exists at the deepest level of the tree.

Nested containment, five concentric rounded rects on one centre at 160 x 90, insets 24 horizontal
and 14 vertical per level: 280x152, 232x124, 184x96, 136x68, 88x40, corner radii ramping 12 / 10 /
8 / 6 / 5 so the inner corners stay in proportion. Fills ramp 0.03 / 0.04 / 0.06 / 0.08 / 0.10
outward to inward and they ACCUMULATE, one rect painted over the last, so the core is visibly the
brightest region on the canvas without any shape carrying a bright fill. The innermost frame alone
takes stroke-width 2, so depth is said twice, by containment and by weight.

The five frames ARE the five tiers of the card: /sys/fs/cgroup, kubepods.slice, the QoS slice, the
per-Pod slice, the container leaf. The single 56 x 8 accent at 0.9 sits inside the innermost frame
and is cpu.max and memory.max, the only place a real value is ever written. That block is 88 x 40
against cluster-pod-sandbox-cri's 78 x 40 and its bar 56 x 8 against that card's 52 x 7, which is
the house scale to within a unit.

DELIBERATE DEVIATION from R-07, and it is the point. The four frames around the leaf carry NO 0.3
loser bar. The house idiom would put a dim bar at every level, which says there are values
everywhere and some are dimmer. The sentence is the opposite: four levels hold nothing but
structure, and exactly one holds a number. The family makes the deviation free, because a frame has
no interior of its own to put a bar in.

Judged at 200px and at 3x against cluster-node-allocatable and cluster-cpu-throttling, its two grid
neighbours, plus cluster-pod-sandbox-cri two cards up. node-allocatable is ONE frame cut by vertical
rules with every bar on one baseline, cpu-throttling is three equal upright gauges repeating, and
neither has a centre. pod-sandbox-cri is the collision to answer for, because it is the catalog
exemplar of this same family: it is one frame holding a SIDE BY SIDE PAIR, solid against dashed,
with two bars on one horizontal line. Nothing here is beside anything, nothing is dashed, and there
is one bar. Five rings against one frame is a different rhythm rather than a different family, which
is the deliberate call: the sentence is depth, and depth is what nesting says.

REJECTED, do not rebuild either to find out. The INDENT RAMP this poster replaced, five bars on one
left staircase sharing a right edge at 300: it was correct on the sentence but its silhouette read
at true size as a Gantt or a diminishing quantity rather than as a hierarchy, and its accent, a
104 x 10 bar inside the last bar, read as a progress fill. And a trunk with three children plus one
child going deeper, which is a literal miniature of the card diagram and is what R-10 forbids.
```
