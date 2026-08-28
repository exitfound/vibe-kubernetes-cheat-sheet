## cluster-node-restart

### layout

```
WHAT     What a Node reboot destroys and what comes back on its own, against the two restarts it is
         constantly confused with: three Pods in one frame, and three different fates.
LAYOUT   Layout C on the L, the node-drain skeleton to the unit. Top row 40..120 right of the panel:
         the Kubelet on CX at 484..716 so the lane below it is one straight drop, the container
         runtime right-aligned on CONTENT_R at 908..1140. The ladder is LAYOUT.C.ladder, 660..1140
         over 148..348, so the 420..660 corridor between panel and ladder is where the drop runs and
         crosses nothing. The Node frame is 60..1140 over 380..532 on the CLU.L-01 family
         152/106/34, read out of CLU.NODE rather than typed, and the six chips are a bottom strip
         three across over 548..624.
PANEL    Measured over the standard set: 290.8 wide and 142.6..160.0 deep at 1600x1000, 377.8 and
         171.4..192.7 at 1280x860, 396.5 and 205.0..229.8 at 1100x800. The deepest reading belongs
         to `three-events` and `replaced`, the two 319 and 321 character steps, and it leaves 150.2
         units over the Node frame at 380, which is what the budget answers to. The two wire
         registers sit at y 368, centred in the 348..380 band between the ladder and the frame.
SIZES    Chips are LAYOUT.C.strip.three, 350.67. The widest pair is `runtime restart` with
         `containers usually stay up`, 41 characters at the 6.89 units of `.scheme-chip-text` plus
         the 24 of padding, so 306 against 350.67 and the pair never meets.
LANES    ONE lane, addressed to the Node FRAME and not to a Pod inside it, exactly as
         `cluster-graceful-node-shutdown` addresses its SIGTERM: which Pods the Kubelet brings back
         is carried by the three pulses, not by a fan of taps into the Pod row. It runs
         [600, 120] to [600, 380], 260 units, so `routeDur` sits on the 700ms floor (M-13).
         The Kubelet to runtime link is a `P.relation` and not an arrow. Nothing a step narrates
         travels between the two on any step: the CRI exchange behind `recreate` is inside the box
         that acts, so the line states a relationship and carries no arrowhead (A-05, A-06).
MOTION   ONE ball on the whole card, on `recreate`, and it is a down-arrow: the ball travels first
         and all three Pods blink at its arrival (M-16). They rise out of `notready` on that same
         beat, so the ordinary `pulsePod` reads and `pulsePodDim` is not needed, which is the
         construction `cluster-scheduler-decision` uses for its placed Pod.
         THE OTHER FIVE STEPS MOVE BY FADE. `reboot` runs the three Pods out first and the two
         software boxes 400 later, which is the order the reference states (`every container on the
         node stops first`). `back-up` brings the Kubelet up, then the runtime and the two lanes one
         FADE.in later, which is the order of the NotReady sentence it narrates.
         NO PULSE ON ANY FADE-OUT ON THIS CARD, and it is the correct unbeaten case M-08 names: a
         reboot signals nobody and a DELETE that lands while the machine is off reaches nothing that
         can answer it. A blink would claim an acknowledgement that never happened.
         BOTH BRANCH STEPS OPEN ON `BEAT.lead`, so the caption and the sentence are read before the
         Pod goes, and each names its own fade so the count chip turns over on that fade FINISHING
         rather than at step entry (P-03): the roster and the picture cannot disagree for the 1500ms
         the Pod takes to leave. There is no ball to hang the beat on, so the `at:` is the fade.
          Measured with `deadair.mjs`: the still tail is 53 and 50 percent of the step,
         a little over the median share, on a reading pace of 9.97 and 10.03, which is the median
         pace itself, so neither is an outlier on both readings at once (M-19a).
WIRE LABELS
         TWO registers on ONE line at y 368, one on each side of the drop: `act` anchored start at
         614 for the traffic the lane carries, `branch` anchored end at 586 for the counterfactual
         sign. Only one of the two is ever filled on a step, and putting them either side of x=600
         is what keeps a glyph off the lane. A single centred register would run straight over it:
         the branch string measures 306.7 at 1100x800 and a centred box would reach 447..753.
         368 is measured, not chosen: the glyph box is 14.6 tall, the ladder floor is 348 and the
         frame top is 380, so the band is 32 and the box sits 8.8 under one and 8.6 over the other.
         At the 152 the ladder started on the box cleared the last chain row by 2.8.
CONTENT  Claims read against the release in `k8sVersion`.
         The three events are the reason the card exists, and the reference states the difference
         outright: `where a standalone kubelet or runtime restart leaves the already-running
         containers in place, a reboot stops every container first`. It also calls the reboot `the
         most disruptive case`, which is what step 1 says rather than calling it the worst.
         `containers usually stay up` on the runtime chip, against `containers stay up` on the
         Kubelet one, and the extra word is the whole reason the two values differ. The reference
         does not promise the runtime case: `Kubernetes does not define the behavior of your
         container runtime if you restart it ... However, most container runtimes used with
         Kubernetes use a configuration that allows you to restart the runtime and leave containers
         executing.` Step 1 spends the clause too rather than cutting the condition to fit (T-20).
         Step 1 says `in the configuration most of them run with`. `in the configuration most
         runtimes ship with` is REJECTED: the reference says the configuration runtimes USE, and
         a shipped default is a stronger claim than the page makes.
         The `aria-label` carries the same hedge, `a container runtime restart usually doing the
         same`. Stating the runtime case flatly there is REJECTED even though it is shorter: the
         chip, the narration and the `desc` all hedge it, and the label is the only text a screen
         reader gets for the picture (T-28).
         Step 2 says the heartbeats pause `until the Kubelet is back and has finished
         initializing`. `for as long as the Kubelet is down` is REJECTED: the reference is
         `Node heartbeats pause while the kubelet is down and resume once it has restarted and
         finished initializing`, so the pause outlasts the downtime, and step 3 is where the
         Lease is renewed.
         The reboot `encompasses both a container runtime restart and a kubelet restart`, which is
         why step 1 says it is both of the others at once rather than a third kind of event.
         `heartbeats paused` on the condition chip is the reference wording, `Node heartbeats pause
         while the kubelet is down and resume once it has restarted`. `Unknown` is REJECTED as the
         value: that is what the control plane concludes from a stale Lease, it is
         `cluster-node-failure`'s subject, and this card draws none of its machinery.
         `NotReady` and the taint are one sentence in the reference: the Node `is reported as
         NotReady until the kubelet, container runtime, and network are ready` and `may be tainted
         with node.kubernetes.io/not-ready`. That sentence sits in the REBOOT section of the page
         and not in the kubelet-restart section, which says only `until the kubelet finishes
         initializing`: a summary of the page loses it, so the raw page is what the wording is
         read against (T-26).
         The taint chip carries the `:NoExecute` suffix, off the taint reference, whose entry for
         this key reads `Example: node.kubernetes.io/not-ready: "NoExecute"`. A bare
         `node.kubernetes.io/not-ready` is REJECTED: step 5 evicts on this taint and eviction is
         what the `NoExecute` effect does, so the bare key drops the one part the step turns on,
         and both siblings in this folder spell an effect (`cluster-node-failure`
         `unreachable:NoExecute`, `cluster-node-registration` `not-ready:NoSchedule`). The key
         also carries a `NoSchedule` taint, which is `cluster-node-registration`'s half and the
         reason the two cards show two different suffixes for one key.
         Measured 320.4 of the 350.67 column at 1600x1000, which makes it the widest name and value
         pair on the card, 30.3 of clearance, and the card comment states that number.
         The toleration period is named IN WORDS and carries no number, which is both the
         reference wording (`the configured toleration period`) and the scope line below: the
         default is `cluster-node-failure`'s to state, and it draws it as a chip.
         `only Pods managed by a controller (such as a Deployment, StatefulSet, or DaemonSet) get a
         replacement Pod. The replacement Pod might schedule onto a different node.` is step 5
         entire, and `Standalone Pods (without another object or controller managing them) are not
         recreated after deletion` is step 6.
         The static Pod clause is off the Static Pods page, not off the restart page, which never
         mentions them: `Static Pods are managed directly by the kubelet daemon on a specific node,
         without the API server observing them`, and `if you try to use kubectl to delete the mirror
         Pod from the API server, the kubelet does not remove the static Pod`. That is why
         `node-agent` survives an eviction the other two do not.
BUDGET   The Node frame at 380 is the ceiling, the same one `cluster-static-pods` measures for the
         same frame top and calls 390 characters. This card holds itself to 360 and the longest
         narration is 321, so there is a line of slack. Re-measure with `npm run report` before
         spending it, never extrapolate.
NAMING   The three Pods are named for their OWNERSHIP, because ownership is the whole of what
         decides their fate: `web-0` owned by a ReplicaSet, `node-agent` a static Pod, `debug-shell`
         standalone. The inner sublabel carries the owner and the inner label carries the name.
         The sublabel names the DIRECT owner, `owned by ReplicaSet web-7d4`, and step 5 says the
         same word. `owned by Deployment web` is REJECTED on two counts: it disagrees with the step
         that names the owner, and `workloads-replicaset` spends that exact string on a ReplicaSet
         BOX while giving its Pods `owner: rs`, so the same string would name two different objects
         one category apart. Measured 162.8 units at 1600x1000 in a 240 unit inner box, against the
         186.9 of `static Pod · run by the Kubelet` beside it.
         `Pod objects bound` rather than `Pods running`: through `reboot` and `back-up` the three
         Pod objects are still bound and none of them is running, so a count named for running would
         read 0 twice and then have nothing left to say when the eviction takes two of them.
         `Pods bound to Node-1` is REJECTED and the reason is a rule, not taste: System A judges a
         drawn string on its FIRST TOKEN, `terms.json` exempts `pod` and not the plural, and
         `render/inline.test.mjs` filed the capital P as a new DOWN finding. `Pod objects bound`
         opens on the exempt singular and says the same thing, with the frame directly above it
         naming the Node.
         The two branch values carry the count AND the name, `2 · web-0 deleted` and
         `1 · debug-shell deleted`, because the picture says WHICH Pod went through one shade step
         only and the chip is what makes it unmissable. Measured at 1600x1000, the wider pair puts
         the name at 117.1 and the value at 158.5 in a 350.67 column, so the two stand 51 apart.
         The chip is `Node condition`, not `Ready`. `cluster-node-failure` owns a chip named `Ready`
         whose value is the Ready condition itself, and two chips of one name reporting different
         things across two neighbouring cards is what T-13 reads as a defect.
SCOPE    This card deliberately re-teaches nothing that a named sibling owns.
         GRACEFUL SHUTDOWN is `cluster-graceful-node-shutdown`: the systemd inhibitor lock, the
         PrepareForShutdown signal, the two-part grace budget split by priority. A reboot here is an
         event that HAPPENS, never a procedure that is managed, and no step draws systemd.
         THE HEARTBEAT LOSS PATH is `cluster-node-failure`: the Lease going stale, Ready flipping to
         Unknown, the unreachable taint, the grace period, the 300s toleration and the eviction
         clocks. The toleration period is named in words on step 5 and none of its machinery is
         drawn, which is also why no control-plane block stands on this card and why the two
         deletions arrive as fades rather than as a ball down a lane.
         THE STATIC POD MECHANISM is `cluster-static-pods`: the manifest directory, `staticPodPath`,
         mirror Pods, the annotation. Here a static Pod is one Pod that comes back with the Kubelet,
         in one clause of step 4 and one of step 6.
         STUCK TERMINATING PODS and force deletion are `workloads-force-deletion`.
         THE KUBELET SYNC LOOP is `cluster-kubelet-reconcile-loop`. Here the Kubelet recreating the
         containers is an OUTCOME on one beat, not a loop.
         LOCAL STORAGE is left out entirely, though the reference carries it: the writable layer
         discarded on recreate, a memory-backed emptyDir always lost and a disk-backed one
         surviving. That is `storage-emptydir`'s subject and it needs a volume on the canvas.
NOTE     STEPS 5 AND 6 SHOW A LATE RETURN, not the outage itself, and the `branch` caption is what
         signs it (T-35, the same `P.wire` grammar the three cards that carry a counterfactual use).
         The machine is up on both, the chips read Ready and no taint, and what differs from step 4
         is the Pod roster: the eviction happened while the Node was away, so each narration puts
         the rule in the present and what the frame shows in the past.
         WHY NOT play the outage instead, which is what this card drew first: the whole Node side
         back to `notready` over a 300ms handover and `web-0` alone at `terminated`. Opened at
         1600x1000 the deleted Pod is then 0.12 against two neighbours at 0.40 inside an already
         dim picture, and the one thing the step is about is the least visible change in it. At
         full strength either side of it the same 0.12 reads at once, which is the contrast
         `cluster-node-failure` gets for free from the healthy Node beside the failing one.
NOTE     THE NODE FRAME NEVER FADES. It is the machine, and the machine is still there while it is
         off: what stops is the software above it and the containers inside it. Fading the frame as
         well takes the whole lower half of the picture to one shade and reads as the card dimming
         rather than as a state, since `cluster-node-failure`'s frame fade only reads because the
         second Node beside it stays at full.
NOTE     The first three chips never change value on any step. They are the card's thesis rather
         than state, and step 1 lights all three as the beat of a packet-less, Pod-less step (M-27).
         Reading that highlight as a cue for a changed value is the one misreading available here.
WHY NOT  A ball on step 5 or step 6. The DELETE comes from the control plane, and putting an API or
         a controller-manager block on this card to source it draws exactly the eviction path
         `cluster-node-failure` owns, one card earlier in the same subcategory.
WHY NOT  A second Node frame for the replacement to land on. `cluster-node-failure` already draws
         that picture, Node-1 to Node-2 with a reschedule lane, and step 5 says `may put it on a
         different Node` in words instead. Drawing it here would make the two cards one card.
WHY NOT  Six ladder rows, one per narrated step, which is what the three siblings in this
         subcategory carry. Six rows measure 242 and the column would run 148..390, leaving the
         frame at 404..556 and the second chip row ending on 646, off the 640 canvas. Five rows
         measure 200 and land the whole stack on the node-drain skeleton with 32 units of daylight
         above the frame, so steps 5 and 6 share row 5, the row that states both fates.
DO NOT   Fade a deleted Pod to 0. An absent block leaves a Pod-sized hole in the frame and reads as
         a rendering fault. Both deletions land on OPACITY.terminated, the shade for gone, which is
         the conversion the other four node-lifecycle cards already took.
DO NOT   Move the reboot Pods to OPACITY.terminated. They are `notready`, and the distinction is the
         card: on `reboot` the Pod OBJECTS are untouched and still bound, which is precisely why the
         Kubelet has something to recreate two steps later, and 0.12 would say they were gone from
         the API before anything had deleted them.
NOTE     THE LADDER ROWS ARE NOT PADDED, unlike the four sibling ladders in this subcategory, and
         that is measured rather than careless: SVG collapses a run of whitespace, so a row padded
         to the longest stage name renders exactly as one with single spaces. Row 1 measures 399.7
         at 1600x1000 for 58 visible characters and row 2 measures 351.4 for 51, both at 6.89 per
         character, with no trace of the six spaces the padded form would have carried.
NOT A DEFECT
         `statics.mjs` reports `podAgentBox` as addressed and undeclared, and files `podAgent`
         under the kinds it cannot address by key. Both are the same artefact: the three Pods are
         built from the `PODS` array, so the keys are `p.key` and a template literal and a source
         sweep can resolve neither. The real-time dump of the last step lists `podAgentBox` in its
         highlight set and every step lists `podAgent` among its opacities.
         THE NETWORK is named in step 3 and in ladder row 3 and stands nowhere on the canvas. It is
         a readiness condition the Kubelet reports, not an actor that acts (T-21), and the reference
         names all three in one clause. A block for it would put networking subject matter on a
         cluster card for a word that never moves.
         Step 1 registers no animation at all, which M-27 allows and 78 steps in the catalogue do.
         Its beat is the two actors and the three thesis chips lighting together. `deadair.mjs`
         ranks it 582 of 590 on still time and 305 on reading pace, which is the catalog median:
         high on one reading only, which is what M-19a calls not a finding.
OPEN     A node() frame cannot take a cue. Step 2 is the reboot of Node-1 and the frame is the one
         thing on screen that cannot react to it, the same finding
         `cluster-graceful-node-shutdown` carries for its own step 2: diagrams.css has no
         `.scheme-node.highlight` rule, and closing it means a catalog-wide rule reaching all 69
         frames on 53 cards.
```

### poster

```
Sentence: same Node, and one slot does not come back.

ONE CHASSIS, three bays, and the middle bay is bare. The Node frame runs 16..304 over 34..146 at
stroke 2, the heaviest line on the canvas, because the machine is the thing that survived: what
stops is what was inside it. Two full-height dividers at x 112 and x 208 cut it into three 96 wide
bays, and the dividers are the whole argument. A bay is still THERE when it is empty, so the row
does not shorten and the gap cannot read as a drawing that ran out. Bays 1 and 3 hold 64 x 76 blocks
at fill 0.10 inset 16 either side and 18 top and bottom. Bay 2 holds one 64 unit floor line at
opacity 0.5, on the same y 128 the two blocks stand on, and nothing else at all.

ABSENCE IS DRAWN AS AN EMPTY SHELF, not as a ghost. No dash, no faded block, no outline of what
used to be there. The floor line is what makes the reader see a bay rather than a hole, and 0.5 is
measured rather than chosen: at 0.35 it does not survive 200px and the bay reads as dead canvas.

The one accent (`R-03`) is the 0.9 bar in the block RIGHT of the gap, and the side is the reading
order rather than a preference: left to right the eye crosses a filled bay, then the empty one, then
lands on the accent, so the gap is passed THROUGH on the way to the subject. With the accent on the
left the eye takes the bright block first and has to travel back into the hole, which makes the
absence an afterthought. Bay 1 carries the same bar at 0.3 (`R-07`). No arrowhead: the gap is the
direction (`R-08`).
The composition is otherwise symmetric about x=160, so the accent side is the ONLY thing that
mirrors: frame, both dividers, both blocks and the floor line all map onto themselves or onto each
other. The cost is that the weight now agrees with `cluster-node-failure` on the right, which also
carries its accent there. Accepted: silhouette is what separates the three at 200px, not the side
the bar sits on.

DISTINCT FROM `cluster-graceful-node-shutdown`, which is the neighbour on the LEFT in the grid and
the collision that decided this composition. That poster is a DASHED outer frame holding three
free-floating rounded blocks whose third is a dashed ghost of the same footprint. Read at true size
beside it, three floating blocks with one ghosted is the same silhouette twice. This one is a solid
partitioned chassis: the heaviest stroke on the canvas, walls that touch both edges, and a gap with
literally nothing in it. Both differences survive at 200px, the partition and the emptiness.
`cluster-node-failure` on the right is a spiked flatline into two wide segments and shares no
silhouette with either.

WHY NOT the stepped rule this poster carried first: one rule crossing the full width with a 12 unit
jog through the 100..120 gap, three slots above it and three below, the middle one below dashed.
The offset was meant to BE the reboot, a rule that does not line up with itself. Measured at true
size it does not: 12 units on a 320 canvas is under 8px on the grid, so the jog reads as a plain
divider, which is the one thing the composition could not afford. It also spent six blocks saying
what three say.
WHY NOT the X over the lost slot. The X vocabulary is spent two cards away in the same grid on
`cluster-image-container-gc`, and at 200px the two would have rhymed.
WHY NOT a three-column gauge of how much each of the three events stops, which is the card's OTHER
half and is the one family this category has left unused. It says the thesis of step 1 rather than
the question the desc opens with, and the card is only allowed one sentence (`R-02`).
WHY NOT the missing bay at an END. A gap at the end reads as a shorter row, which is why the middle
keeps it, and the middle is also where the accent gains the canvas centre.
```
