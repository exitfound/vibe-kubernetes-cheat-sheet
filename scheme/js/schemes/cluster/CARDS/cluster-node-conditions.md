## cluster-node-conditions

### layout

```
WHAT     The five conditions kubectl describe node prints, and the ONE of them that reaches a Pod
         that is already running: one control plane block writing two kinds of taint, one lane
         landing on the Node the taint is written onto and one turning aside into the Pod it keeps
         out.
LAYOUT   One actor in the top row and two lanes leaving it, on two different FACES. `Control plane`
         at 450..750, 40..120, standing in web-0's column so its NoExecute drop is a straight
         vertical on x 600. The refused Pod at 816..1116, 190..296, standing in web-1's column and
         OUTSIDE the frame it never enters. One full-width Node frame at 340..492 and six chips as
         a two across strip at 508..626.
         THE TWO LANES ARE THE WHOLE CARD, and the difference between them is a DESTINATION and a
         SHAPE. NoExecute leaves the bottom face at 600 and drops 220 units onto the Node frame's
         own top face, where the taint is actually written. NoSchedule leaves the RIGHT face at
         (750, 80), runs 216 right and drops 110 into web-2, so it turns aside before the Node.
PANEL    Measured with `extents.mjs`, all three viewports, over all six steps:
         1600x1000  right 290.77, bottom 160.00..194.94
         1280x860   right 377.76, bottom 192.67..235.20
         1100x800   right 396.55, bottom 229.80..279.51
         Deepest 279.51 at 1100x800, on `pressure`, whose 383 character narration is the longest on
         the card. The frame label `Node-1` sits at y 347.0..361.7 there and clears it by 67.5. The
         two steps that draw the `wNE` caption, `not-ready` and `unreachable`, both sit at the
         229.80 shallow end, which is what leaves that caption its 44.2.
         Zero drawn strings intersect the panel at any of the three viewports. The leftmost thing
         on the canvas above the chips is the `wNE` caption at x 342.6..588, y 274..288.7 at
         1100x800, which is 44.2 below the panel bottom those steps carry.
SIZES    THE FRAME IS THE CLU.L-01 FAMILY UNTOUCHED, 152/106/34, the first card in this
         subcategory since `node-drain` to take it whole: three Pod shells carrying a label pair
         each is exactly what the 106 band is for, which is why neither the `node-registration`
         nor the `node-eviction-rate` licence applies here.
         PODS ARE 300 WIDE on the `node-drain` spread, 84/450/816 with 66 between them, and the
         inner box is that card's 30/28 inset. THE REFUSED POD TAKES THE SAME 300 AND THE SAME
         106, off `POD_X(2)`, so a Pod outside the frame is the same object as a Pod inside it.
         The widest inner string is `DaemonSet · hostNetwork` at 138.7 against a 240 box.
         `Pending · not scheduled` is 141.1 at 1100x800 against the same 240, 49.4 either side.
         THE ACTOR IS 300 WIDE, off `POD_X(1)`, and THREE midpoints coincide on x 600: its own
         bottom face, the Node frame's top face and web-0's top face. That is why the NoExecute
         lane needs no jog and why moving it off the Pod cost no geometry. `creates taints by
         condition` measures 165.6 at 1100x800 against 300, 67 either side.
         CHIPS ARE 532, `LAYOUT.C.strip.two`, THREE ROWS RATHER THAN TWO, and the third row is
         what pushed the frame up to 340 from the 380 the family siblings use. Two across is
         forced: the widest pair is `NetworkUnavailable` ending at 196 against `True ·
         network-unavailable:NoSchedule` starting at 325, 255 wide, and 54 characters of name plus
         value does not fit the 350.67 a three across column gives.
         The four worst pairs at 1600x1000, all on the `unreachable` step: NetworkUnavailable 129
         apart, `effect on Pods` 142.8, MemoryPressure 184.1, PIDPressure 225.5.
LANES    TWO LANES, ONE SOURCE, TWO DESTINATIONS, and all four endpoints are exact face midpoints.
         `neLane` is one segment, [600,120] to [600,340]: the actor's BOTTOM face and the NODE
         FRAME's top face. It stops on the frame and enters nothing, which is what a taint is: a
         field on the Node object, never on a Pod. The Pods react on the arrival instead.
         `nsLane` is [750,80] to [966,80] to [966,190]: the actor's RIGHT face midpoint, one 216
         unit leg, and a 110 unit drop onto web-2's top face midpoint.
         `neLane` IS SHADED OFF THE FRAME IT LANDS ON (`A-13`), through one `stage()` factory that
         states the blocks and their lanes together (`A-16`), so it stands at 1 until the Node goes
         quiet on `unreachable` and then follows it to `OPACITY.notready`.
MOTION   Three balls, all self-initiated at `BEAT.lead` (`M-18`): nothing precedes a taint here.
         The NoSchedule lane is 326 units and runs at the canon 0.450 units per ms, the NoExecute
         lane is 220 and is floor-bound at 700ms, 0.314 (`M-13`). Two cards run that same 220,
         `network-conntrack-nat` and `storage-reclaim-policy`, so the floor is the house reading.
         `pressure` LANDS IN A DIM POD, so its blink is `pulsePodDim` (`M-07`): the ordinary pulse
         plus the opacity lift, or a 0.55 Pod does not visibly blink. Packet first, pulse on
         arrival, which is the down-arrow order (`M-16`).
         `not-ready` follows `M-16` and `M-08` together: the ball lands, both web Pods blink on its
         arrival, and the fade to `OPACITY.terminating` shares that same delay so the pulse is
         never behind it. `daemonset` closes with the one Pod that did not fade pulsing on its own.
         `unreachable` RUNS `neLane` DOWN FROM FULL WITH THE FRAME (`A-15`): the static block pins
         both at `OPACITY.notready` and the animated path fades them from 1 on the arrival, so the
         ball flies over a lit lane and the Node goes quiet behind it. `not-ready` fades NEITHER,
         because the frame the lane lands on is still fully present on that step.
WIRE LABELS
         TWO REGISTERS, ONE PER LANE, and they never show at the same time. THEY NAME DIFFERENT
         KINDS OF THING, and that asymmetry is the whole point (`T-22`): a label may only name what
         rides ITS lane. `wNE` runs to the Node, so it names the TAINT, which is the thing being
         written there. `wNS` runs to a Pod that no taint is ever written on, so it names the
         VERDICT that reaches web-2, `NoSchedule · no matching toleration`. The taint key behind
         that verdict is stated twice elsewhere, in the `MemoryPressure` chip value and in the
         `pressure` narration, so nothing is lost by keeping it off this lane.
         `wNE` is anchored END at 588, twelve LEFT of its own drop, and CENTRED in the band that is
         actually free rather than in the band the eye sees. 285 is the midpoint of the worst panel
         bottom, 229.80, and the frame top at 340: measured 342.6..588, y 274..288.7 at 1100x800,
         44.2 under the panel and 51.3 over the frame.
         230, the midpoint of the band between the actor at 120 and the frame at 340, IS THE ONE A
         READER WANTS AND IT DOES NOT FIT. At that height the panel column takes everything left of
         396.5 on the deep viewport, web-2 takes 816..1116 from y 190, and the NoExecute drop cuts
         x 600, so the free spans are 397..588 (191 units) and 612..816 (204). The longest string
         this label carries is 275.6 at 1600x1000, wider than either.
         `wNS` sits ABOVE its horizontal leg, anchored START at 762, at y 66. Measured 762..1003.2,
         y 54.8..69.4 at 1600x1000, the widest reading: 10.6 over the leg it names, 12 past the
         actor it leaves, and clear of its own drop, whose 80..190 run starts 10.6 below the glyph
         box. 762 IS THE ONLY x THAT WORKS: anchored END at 954 the string reaches back to 712.8
         and prints inside the actor, which spans 450..750 through the whole 40..120 band.
CONTENT  Read against the `k8sVersion` the entry carries, off the two cited pages.
         THE FIVE CONDITION MEANINGS ARE THE `node-status` TABLE, reworded because the upstream
         cells carry an em-dash `T-04` forbids: Ready is `True if the node is healthy and ready to
         accept pods, False if the node is not healthy and is not accepting pods, and Unknown if
         the node controller has not heard from the node in the last node-monitor-grace-period
         (default is 50 seconds)`, and the other four are `pressure exists on` the memory, the
         disk size, or the processes, and `the network for the node is not correctly configured`.
         THE ACTOR IS BOTH CITED PAGES` OWN SUBJECT. `node-status`: `When problems occur on nodes,
         the Kubernetes control plane automatically creates taints that match the conditions
         affecting the node.` The taint page opens `Taint Nodes by Condition` with `The control
         plane, using the node controller, automatically creates taints with a NoSchedule effect
         for node conditions`, which is where the block sublabel `creates taints by condition`
         comes from.
         THE NARROWER NAME IS DELIBERATELY NOT DRAWN, and NOT because the sources are silent: the
         taint page also says `The node controller automatically taints a Node when certain
         conditions are true`. It is that the narrower name is WRONG for half this card. The same
         page notes that `after 1.29, the taint-based eviction implementation has been moved out of
         node controller into a separate, and independent component called
         taint-eviction-controller`, so the component that acts on `not-ready` and `unreachable` is
         not the node controller. `Control Plane` is the one label true of every step here, and the
         two siblings that DO name components, `cluster-node-failure` and
         `cluster-taints-tolerations`, are where a reader gets them.
         WHO SETS THE FOUR CONDITIONS IS STILL DELIBERATELY ABSENT. Neither cited page says which
         component reports MemoryPressure, DiskPressure, PIDPressure or NetworkUnavailable, so no
         reporter is drawn and no narration names one. The actor writes TAINTS, not conditions,
         and every sentence about a condition going True stays intransitive.
         THE FIVE ARE NOT CLAIMED TO BE THE WHOLE TABLE. `node-status` introduces them with
         `Examples of conditions include`, so `has five rows that decide whether Pods may run here`
         is rejected as an absolute the source does not support. What ships is `prints these five
         rows, and they decide whether Pods may run here`, which keeps the claim on what the five
         DO and makes none about what else the table carries.
         THE THESIS OF THIS CARD IS ONE UPSTREAM SENTENCE. `node-status`: `These taints affect pending
         pods as the scheduler takes the Node's taints into consideration when assigning a pod to
         a Node. Existing pods scheduled to the node may be evicted due to the application of
         NoExecute taints.` The taint page states the same split as the two lanes: NoExecute
         `affects pods that are already running on the node`, NoSchedule is `No new Pods
         will be scheduled on the tainted node unless they have a matching toleration. Pods
         currently running on the node are not evicted.`
         THE REFUSED POD IS THAT SENTENCE DRAWN. `pending pods` is what NoSchedule affects, so the
         object the NoSchedule lane lands in is a Pod in Pending, sitting outside the frame with
         the sublabel `Pending · not scheduled`.
         NoExecute IS TIMED BY A TOLERATION EVERY POD ALREADY HAS, and saying otherwise was the
         worst claim on this card. `every Pod on the Node without a matching toleration is evicted`
         is rejected: the taint page says `Kubernetes automatically adds a toleration for
         node.kubernetes.io/not-ready and node.kubernetes.io/unreachable with tolerationSeconds=300,
         unless you, or a controller, set those tolerations explicitly`, so the set that sentence
         describes is empty in a default cluster and the real split is how long the toleration
         lasts. What ships names the 300 seconds and hands the clock to the sibling. Both siblings
         already carried it: `cluster-node-failure` has `Kubernetes had already given this Pod a
         300s toleration for it, which it does for any Pod that does not set one itself`, and
         `cluster-taints-tolerations` has `Any Pod that sets none of its own is given 300`.
         MEMORY-PRESSURE IS THE ONE OF THE FOUR THAT DOES NOT SIMPLY SHUT THE DOOR, and it is the
         one this card animates. The taint page: `The control plane also adds the
         node.kubernetes.io/memory-pressure toleration on pods that have a QoS class other than
         BestEffort`, and new BestEffort pods `are not scheduled onto the affected node`. So
         `NoSchedule holds web-2 in Pending` is rejected as written, and the Pod SUBLABEL is what
         makes the shipped sentence true, exactly as `DaemonSet · hostNetwork` does on `daemonset`:
         web-2 reads `Pending · BestEffort` and the narration ends `which memory-pressure does only
         to a BestEffort Pod like this one`. Without the sublabel the sentence is false for the
         ordinary Burstable Pod.
         THE TWO READY TAINTS ARE QUOTED KEYS. `node.kubernetes.io/not-ready: Node is not ready.
         This corresponds to the NodeCondition Ready being False` and `node.kubernetes.io/
         unreachable: Node is unreachable from the node controller. This corresponds to the
         NodeCondition Ready being Unknown`, plus `This effect is added by default for the
         node.kubernetes.io/not-ready and node.kubernetes.io/unreachable taints`.
         THE FOUR NoSchedule TAINTS ARE THE SAME LIST plus the Taint Nodes by Condition section,
         `automatically creates taints with a NoSchedule effect for node conditions`.
         THE DAEMONSET CLAIM IS TWO LISTS AND THE POD SUBLABEL EXISTS TO MAKE IT TRUE. DaemonSet
         Pods are `created with NoExecute tolerations for the following taints with no
         tolerationSeconds`, unreachable and not-ready, `This ensures that DaemonSet pods are
         never evicted due to these problems`. The NoSchedule half is a different list and one of
         its entries is conditional: memory-pressure, disk-pressure, pid-pressure, unschedulable
         and `node.kubernetes.io/network-unavailable (host network only)`. That parenthesis is why
         the DaemonSet Pod on this card is drawn with the sublabel `DaemonSet · hostNetwork` and
         why the narration ends `plus network-unavailable on a hostNetwork Pod like this one`.
         Without the sublabel the sentence would be false for the ordinary case.
         THE 50 SECONDS IS NAMED ONCE, as the definition of Unknown, and
         `--node-monitor-grace-period` is the flag the `node-status` table itself names.
BUDGET   Measured with `timing.mjs` and `deadair.mjs`, this card's own five steps:
         conditions   358 chars, 3000,  8.38 ms/char, still 2199 of 3000
         pressure     383 chars, 3300,  8.62 ms/char, still  876 of 3300
         not-ready    312 chars, 3400, 10.90 ms/char, still 1000 of 3400
         unreachable  304 chars, 3300, 10.86 ms/char, still 1100 of 3300
         daemonset    296 chars, 3000, 10.14 ms/char, still 1300 of 3000
         The two steps that carry a qualifier a fact pass added, `conditions` and `pressure`, are
         also the two fastest here, 8.38 and 8.62 against a catalogue median of 10.04: the holds
         they already had absorb the extra characters and no duration moved. The
         population, the median pace and the median still time are printed by
         `report/baselines.test.mjs` and by `deadair.mjs`, and are not copied here.
NOT A DEFECT
         `conditions` HOLDS STILL FOR 73 PERCENT OF ITS 3000, well over the median share. It is the same
         shape as `cluster-node-eviction-rate`'s `monitor` and it is deliberate for the same
         reason: the step reads a table that is already on screen, so nothing travels and no chip
         MOVES (`P-09a`), and its only beat is the five condition rows lighting at `BEAT.lead`. The
         other half of `M-19a` clears it on the numbers: at 8.38 ms per character it reads FASTER
         than the catalogue median, which means the hold is spent on reading rather than standing
         idle. 3000 is the duration `monitor` carries for a narration of the same length.
NOT A DEFECT
         THE FIVE CHIPS `conditions` LIGHTS HAVE NOT CHANGED. `P-05` cues a changed value and this
         is not that: it is the step's beat, on the five rows its sentence is about, and the sixth
         chip is left dark because `effect on Pods` is not a condition. The distinction the last
         clause of that narration draws, Ready reading True where the other four read False, is
         only visible if the eye is sent to the column.
NOT A DEFECT
         `nsLane` STANDS AT FULL WHILE ITS SINK RESTS AT 0.55. `A-13` reads a lane as
         `min(source, sink)` and this is the deviation: `A-15` says a lane carrying a ball must be
         visible for the WHOLE flight, and web-2's 0.55 is `OPACITY.pending`, a statement about
         that Pod's phase rather than about the lane. `M-24` is the same reading from the other
         side, a lane pointing AT an object that rests dim. Drawn at 0.55 the lane read as the
         secondary of the two and the ball crossed it at the same weight as the canvas.
NOT A DEFECT
         THE REFUSED POD IS ON SCREEN FROM THE POSTER, before any taint exists. `M-24` is why: a
         lane already points at it, and hiding it outright aims an arrowhead at blank canvas for
         the whole first flight. It rests at `OPACITY.pending`, which is the vocabulary entry for
         declared and not working yet (`C-06`, `C-14`), and its sublabel says what it is waiting
         for rather than why.
NOT A DEFECT
         `daemonset` CUES NO CHIP AND LIGHTS NOTHING. `effect on Pods` reads the same string it
         read on the two steps before, because the effect has not changed: what changed is WHICH
         Pod it reaches, and the Pod that never faded is what says it (`P-09a`). Its beat is that
         Pod's pulse, which `M-27` does not reach because the step is not pod-less.
DO NOT   Land the NoExecute lane INSIDE a Pod. It was drawn ending on web-0's top face at [600,374],
         34 units past the frame edge, and it is wrong twice over: a taint is a field on the Node
         and is never written on a Pod, and `NET.A-02` states the drawing rule the whole catalogue
         reads, that a ball stops on the Node frame edge and the Pod inside reacts. Nothing in the
         suite sees it, because `render/geometry.test.mjs` excludes `.scheme-node` from THROUGH by
         construction: 73 such crossings stand on 38 cards and a green gate says nothing here.
DO NOT   Land the NoSchedule lane on the Node frame TOO. Two arrowheads on one face would say the
         two effects are the same event, and the 66 unit gap between two Pods, which is where that
         lane used to stop, gives the eye nothing to land on: it read as a rendering fault. Its
         receiver has to be an object, and the only honest object is the Pod that is refused.
DO NOT   Let `wNE` draw on the `pressure` step. That step carries the longest narration on the card
         and its panel reaches 279.51 at 1100x800, while `wNE` sits at y 274..288.7: the two would
         overlap by 5.5. The caption clears the panel only because `pressure` never writes it.
DO NOT   Put the taint key back on `wNS`. It read `node.kubernetes.io/memory-pressure:NoSchedule`
         while the lane under it ends on a Pod, and a taint is never written on a Pod: the label
         named traffic that does not ride that lane, which is exactly what `T-22` forbids.
DO NOT   Move `P.packets()` up the parts list to sit under the Pods, which is where four sibling
         cards keep it. The NoSchedule ball lands at [966,190] on web-2's top face and its ripple
         opens there at scale 3, so both would run behind that Pod's fill and the one arrival this
         card draws onto an object would be the one arrival nobody sees.
DO NOT   Give the four pressure conditions a setter box. No page cited here says who reports them,
         and inventing one is the class of claim `card-facts` exists to catch. The `Control plane`
         block is not that box: it writes taints, which the cited page attributes to it by name.
DO NOT   Restore the two summary blocks `NoExecute taints` and `NoSchedule taints` to the top row.
         Between them and the chip values and the wire captions, each taint key was stated THREE
         times while the thing that makes a taint, a condition going True, was drawn nowhere.
NAMING   THE ACTOR IS `Control Plane` WITH BOTH WORDS CAPITALISED, which `T-10` would ordinarily
         not give it: Plane is not an API object, an acronym or an identifier. It is the spelling
         the category already uses for the same thing in its own subcategory label, and the three
         sibling cards that draw a `Control plane` NODE FRAME are not a counter-example, because
         `.scheme-node-label` is uppercased by CSS (`T-12`) and renders CONTROL PLANE whatever is
         typed. This card is the only one that draws the phrase as a `P.box` label, so it is the
         only place the casing is visible, and it matches the chip a reader saw on the way in.
NOTE     THE CHIP VALUES CARRY THE TAINT KEY WITHOUT ITS `node.kubernetes.io/` PREFIX, and the two
         wire captions and the narrations carry it in full. With the prefix the longest value is
         55 units past the 532 column, and the prefix is the same nineteen characters on all six.
NOTE     READY IS THE ODD ONE AND THE CHIP COLUMN SHOWS IT. Ready reads `True · no taint` while
         the other four read `False · no taint`, so the inversion a junior trips over is visible
         in the resting frame before any step plays, and the `conditions` narration says it out
         loud in its last clause.
SCOPE    This card is the SECOND card of the section and the on-ramp to it: everything it names is
         handed off, and nothing it names is opened.
         `cluster-node-registration` owns Ready going True at birth and the not-ready taint being
         taken off. Here Ready starts True and the card is about it failing.
         `cluster-node-failure` owns the whole timing of an eviction: the flip to Unknown, the
         grace period as a mechanism, the 300 second default toleration and the clocks. The 50
         seconds appears here ONCE, as the definition of Unknown, and the `not-ready` narration
         names that card rather than opening any of it.
         `cluster-node-pressure-eviction` owns what the Kubelet does under MemoryPressure: the
         threshold, the ranking and the kill. Here MemoryPressure becomes a NoSchedule taint and
         the card stops.
         `cluster-taints-tolerations` owns effect semantics: how a key, an operator and an effect
         match, and what tolerationSeconds is. This card USES NoSchedule against NoExecute as a
         two-way split and never opens how a toleration is matched.
         `cluster-scheduler-decision` owns what happens to the refused Pod NEXT. web-2 is drawn
         Pending and the card stops there: no scheduling cycle, no filter and no score.
         `cluster-node-drain` owns `node.kubernetes.io/unschedulable` and cordon, and THAT IS THE
         SHARPEST BOUNDARY THIS CARD HAS. unschedulable is the seventh built-in taint and it is
         deliberately absent: it comes from a command rather than from a condition. The
         `node-status` page draws the same line in a note of its own, that a cordoned Node prints
         `SchedulingDisabled` in the Conditions block while `SchedulingDisabled is not a Condition
         in the Kubernetes API`. Naming it here would put a non-condition in a table of five
         conditions.
         `storage-ephemeral-storage-eviction` already touches DiskPressure from the storage side.
         Here DiskPressure is one row of a table and one NoSchedule taint.
NOTE     `kubectl describe node` IS NAMED WITH NO kubectl BLOCK ON THE CANVAS, unlike
         `cluster-node-drain`, which draws one. It is the reader's own command and the frame the
         card is built around rather than an actor inside the mechanism, so `T-21` is not engaged:
         no step has it doing anything.
```

### poster

```
Sentence: the same table gives two different verdicts, and only one of them reaches a Pod already
running.

Branch, and no other card in this row uses the family. Left, the conditions as a
bare LIST rather than a framed table: four 76 x 10 bars at 0.3 on a 20 unit pitch from y 36, gathered
by four 8 unit stubs onto one vertical spine at x 108, and below them, separate, the Ready row alone
in an 88 x 26 slot at fill 0.10 with stroke 2. Two legs leave for two outcomes. The dashed one runs
from the spine midpoint to an 80 x 44 block at fill 0.02, opacity 0.6 and dashed 4 3, the new Pod that
never lands, its bar at the loser weight of 0.3. The solid one runs from the Ready slot to an 80 x 44
block at 0.10 carrying the single 56 x 8 accent at 0.9, the running Pod the taint reaches.

THE POSTER AND THE CARD NOW DRAW THE SAME TWO OBJECTS. The dashed block is web-2 and the solid one is
web-0, which is what the card's two lanes land in, so the tile is a compression of the diagram's
argument rather than a second argument about the same subject.

BOTH LEGS ARE FLAT AND BOTH LEAVE ON x 108, which cost the right column its own vertical rhythm and is
worth it. The first version turned each leg once, at x 158, to reach blocks placed for balance rather
than for the legs; the two jogs read as routing on a poster whose whole subject is that the two paths
differ in KIND and not in shape. So the blocks were moved onto their legs instead: the spine midpoint
is 71 and the dashed block is y 49..93 centred on it, the Ready slot centre is 131 and the solid block
is y 109..153 centred on that. Nothing on the canvas turns a corner any more, and the departure points
line up on one x while the arrivals sit 60 apart, which is the split said as geometry.

THERE IS NO FRAME AROUND THE LIST, and that is the sibling decision on this tile. The card to its
left, `cluster-node-registration`, ends on a rounded block full of horizontal rows, and it sits
directly across the gutter from this poster's left edge. A framed five row table here rhymed with it
at grid size, which the first draft of this concept did: the frame came off, the rows became a bare
list, and the only outlined thing on the left half is now the Ready slot, which is the row the
sentence is about.

THE FOUR ARE GROUPED AND READY IS SEPARATE, which is the whole argument. Ready in the middle of the
five with a leg of its own read as one row in five taking a different path, so a reader counted two
paths out of five rows and not four against one. The spine is what makes the four a GROUP, and the
gap plus the slot is what takes Ready out of it.

DELIBERATE: the losing Pod keeps its bar at 0.3 rather than fading with its block. Drawn at 0.18 it
disappeared on the 200px tile and the dashed block read as an empty box, which is a different sentence:
the Pod is a real Pod that is refused, not a Pod that does not exist.

REJECTED, and it is what this replaced: THE BOUNDARY RULE, one long horizontal as the Node surface
with five equal posts dropping onto it, four stopping on the line and the fifth running through into
a Pod below. Two versions of it shipped, the second with the posts turned into a row of five cells so
the conditions could be counted. Both were rejected by the author on sight. The concept is sound and
the picture is quiet: a fence of equal verticals gives the eye no subject until it has found the one
that crosses, and the crossing is a small event in the middle of a wide rule.

REJECTED WITHOUT DRAWING IT: two zones compared, the canvas split with the same skeleton on each
side, a dashed Pod stranded above the Node face on the left and a solid Pod below it on the right with
a dashed copy lifting off. It draws the desc opening question directly and it loses the FIVE.
Overlapping sets, four bars in the door-shut set and the accent in the overlap where Ready also
evicts, was rejected too: the right lobe stands empty because nothing evicts without also blocking,
and an empty lobe is a shape that has to be explained.

DO NOT give the dashed leg an arrowhead to say it is refused (`R-08`). The dash plus the block it
lands in says it, and the poster then has two things competing with the accent.
```

### before `const GHOST_X = POD_X(2), GHOST_Y = 190;`

190 puts the refused Pod 70 under the actor's bottom face and 44 over the frame, and both gaps are
spent. Above 190 the 110 unit drop the NoSchedule lane needs would fall under the 24 unit clamp
`routeDur` reads as a length; below 296 the Pod would touch the frame it is drawn OUTSIDE of, which
is the one thing its position has to say. The x comes off `POD_X(2)` and not from a literal, so the
refused Pod moves with the Pod row it stands over.
