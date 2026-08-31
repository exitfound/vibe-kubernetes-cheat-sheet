## workloads-init-containers-and-sidecars

### layout

```
WHAT     Init containers running to completion in order, then a native sidecar starting and
         staying up alongside the app.
LAYOUT   B (chips left, ladder right).
           actors 40..120, Kubelet 484..716 centred on CX, Runtime 908..1140
           chips  60..540 by 304..464, 4 x 34 + 3 x 8 = 160
           ladder 660..1140 by 160..360, 5 rows = 200
           node   60..1140 by 484..624, on the floor, one 828-wide Pod centred in it
         Layout A is out: the 200 ladder against a 275..464 band of 189. Eleven short.
         The chip column is BOTTOM-anchored on the Node frame and not top-anchored on the panel.
         Every chip names a container drawn inside that frame, so the two read as one caption on
         one object. The 49.3 the anchor leaves under the panel is the band L-03 frees and nothing
         can fill, not a gap this card chose.
PANEL    Deepest reading is step 3 at 1100x800, x<=396.55 by y<=254.66 (1280x860 213.92,
         1600x1000 177.44). The chip column starts at 304, so 49.34 stands clear of it. A prose
         edit on any step is re-measured rather than reasoned about, and what prints the extent
         per viewport is
         `OVERLAY_IDS=workloads-init-containers-and-sidecars node --test report/overlay.test.mjs`.
SIZES    Both actor boxes are 232, which is what workloads-pod-startup-conditions draws its pair
         at, and the arrangement is that card's too: left box centred on CX for the spine, right
         box right-aligned on WL.R. extents.mjs at 1100x800 reads `container orchestrator` at 135
         and `containerd · CRI` at 98.2, so the tighter of the two keeps 48.5 either side.
         That leaves 192 between the faces rather than 60. Nine cards run 192, and a ball on it
         reads 0.274 u/ms where 60 bought 0.086, the slow end of the catalog. Both lengths sit on
         the PKT_DUR_MIN floor at 700ms, so neither hop takes an explicit dur (M-12).
LANES    ONE straight drop on WL.SPINE_X from the Kubelet bottom midpoint to the NODE frame top
         midpoint at 484, with no jog and no corner. The endpoint on POD_Y that 14 workloads cards
         still carry is the retired form (WL.A-03): it pierces the frame and draws the Kubelet
         reaching THROUGH the Node rather than acting on it. The Kubelet box centred on CX is what
         buys the straight line, and the frame is full width so its top midpoint is CX already.
         Length 364, so a route costs 809ms where the jogged 451 cost 1002.
         Top row: REQ_Y carries the CRI call out to the Runtime, RESP_Y carries the exit report
         back (WL.A-01). Both ride on four of the five steps, so both are arrows, not relations.
MOTION   Three steps share one shape: the runtime reports an exit on the answer lane, the Kubelet
         calls StartContainer back, and the create lands on the node. All three light `runtime` on
         the ARRIVAL of that hop, at 1500ms, and not in the static `lit` list at t=0, so the three
         read alike and the box is a receiver on all three (A-06).
         Spans 1609 / 2409 / 2409 / 2409 / 900 against durations 2600 / 3400 / 3400 / 3400 / 3400.
         The last step holds 3400 over a 900 motion and stands still for 74% of itself, high on
         the deadair.mjs listing. That stillness is BOUGHT and is not a duration to trim back
         (M-19a): the step carries 364 characters over the shortest motion on the card, and at
         2000 it read at 5.49 ms per character, near the hurried end of the whole catalog. 3400
         puts it at 9.34, inside the 8.9 to 10.5 band the other four steps read in, so the hold is
         reading time and not dead air. Their populations and their medians live in
         `report/baselines.test.mjs` and `timing.mjs`, which is why none is copied here.
         Nothing pulses but the Pod, and only on the last step, where the Pod is what changed.
         The four container boxes take a `.highlight` on arrival and carry no brightness track.
CONTENT  Claims read against k8sVersion 1.35.
         The sidecar is beta in 1.29 and GA in 1.33 and step 3 states both. The feature-gates
         reference carries SidecarContainers Beta since 1.29 default true, and the Sidecar
         Containers page carries `This is a stable feature in Kubernetes, and has been since
         version v1.33`. `since 1.29` alone is rejected: it contradicts the desc, which says GA
         in 1.33, and reads as the whole history of the feature.
         Init:0/3 counts three init containers with the sidecar among them. `printPod` in
         `pkg/printers/internalversion/printers.go` formats `Init:%d/%d` over
         `len(pod.Spec.InitContainers)`, which a restartPolicy=Always entry is part of, so the
         denominator is 3 and not 2. That is also what `The sidecar still counts in the init list`
         in the desc is stating.
         A REGULAR init container is what has to exit 0, and step 1 says `regular` for that reason.
         `each one must exit with code 0 before the next can start` is rejected: step 3 of this
         same card starts the main container while init container 3 is still running, so the card
         contradicted itself in the one place a reader would notice.
         Started is `startupProbe succeeded, or a running process where no probe is set`.
         `immediately if no probe is set` is rejected: the page says that status `becomes true
         because there is a process running in the container and no startup probe defined`, so a
         process has to be up and immediately is earlier than the rule allows.
         What Started unblocks is THE NEXT ENTRY IN THE INIT LIST, which on this Pod happens to be
         the main container, and step 3 says both halves. The page says `the kubelet then starts
         the next init container from the ordered .spec.initContainers list`, so `unblocks the
         main container` alone states a Pod-specific outcome as the mechanism.
         The termination clause holds: `the kubelet postpones terminating sidecar containers until
         the main application container has fully stopped`.
         The phase clause holds against Running, `all of the containers have been created` plus at
         least one running or starting, which the main container start is what completes.
         workloads-pod-startup-conditions says the same in its own step 4.
         The lazy-pull clause holds against the Images page reading of Always, `every time the
         kubelet launches a container, the kubelet requests the container runtime to pull the
         image`, and workloads-image-pull-registry-auth owns that mechanism and agrees.
         The card draws three mechanisms and cites four pages for them. One source was not enough:
         the init ordering, the phase and the CRI calls are on none of the sidecar page.
NAMING   The Kubelet sublabel names the job it does HERE, `sequences the init list`, which is the
         shape all 31 other Kubelet sublabels in the catalog take. `container orchestrator` is
         rejected twice over: it names Kubernetes as a whole rather than the node agent, and it
         states no job this card draws.
         The Pod carries `sublabel: ' '` and not a real second line. It reserves the baseline
         pod() fixes at h - 8 so the four container boxes clear it, and
         workloads-effective-pod-requests carries the identical construction for the identical reason.
         Chain row 5 reads `until termination` and not `until term`: the ladder is 480 wide and
         the row measures 344 at 1100x800, so the full word costs nothing it has.
```

### poster

```
The main container cannot start until the sidecar reports Started. The wall: two blocks on one
baseline with a gap, and one upright bar standing in it carrying the whole accent at 0.9. The bar
overhangs both blocks by 14 units top and bottom so it belongs to neither, which is the family and
not a preference. Left is the heavier block, stroke 2 over a 0.06 ground, holding the init list as
three slots that RAMP DOWNWARD from spent to live on ONE vocabulary: three solid frames at group
opacities 0.36 / 0.68 / 1.0 over fills 0.02 / 0.055 / 0.09, even steps of 0.32 and 0.035. The
bottom slot is the sidecar and it is what holds the gate. Right is the app, smaller and lighter at
0.04 with a 1.4 stroke, and it cannot get past.
THE RAMP RUNS TOP TO BOTTOM AND BRIGHTENS, which is the direction the card forces: the bottom row is
the entry still running, so dimming downward would draw the live sidecar as the deadest thing in the
list.
DASHING THE TWO SPENT SLOTS WAS DRAWN AND REMOVED, and its defect is worth keeping written down
because it looks like the obvious way to mark them. A dash is a SECOND vocabulary, so the two dashed
rows read as a pair against one solid row rather than as three steps of one ramp: the eye sees the
break between row 2 and row 3 and never the step between rows 1 and 2, however the opacities are
set. Three even steps on one vocabulary is what makes a ramp, and the dimmest row already says
spent without help.
THE RAMP IS CARRIED BY THE FILLS AND BY A GROUP OPACITY PER ROW, never by the accent bars. All four
bars sit at 0.3 and the wall alone at 0.9, two tiers, because `poster-lint` reads R-07 as the number
of distinct opacities among the `fill="currentColor"` lines and three tiers is scored as a ramp
rather than an accent. Wrapping each row in its own `<g opacity>` dims the frame and its bar
together and leaves the literal attribute at 0.3, which is what keeps the contract honest rather
than merely green: the losers really are all on one low bar.
THE BAR IS 12 WIDE AND THAT NUMBER WAS TUNED ON THE ACTUAL-SIZE MONTAGE, not in the source. At 10
it measures 6px at 200px and reads as a rule someone drew rather than as a barrier, and at 16 it is
a slab that out-weighs both blocks it stands between. 12 is the width that stays a wall.
THE ACCENT IS NOT INSIDE A BLOCK, which is what R-07 asks for everywhere else. The wall family puts
it in the GAP by construction: laid inside either block the bar reads as that block's furniture and
the sentence goes.
The two sides carry DIFFERENT furniture on purpose, three framed slots against one bare bar. The
library's own failure mode for this family is two frames holding equal slabs, which is a silhouette
several other families already produce.
A STRIKE-THROUGH ON THE TWO SPENT ROWS WAS DRAWN AND REMOVED. It said the same thing the ramp says
and cost more: at the house 1.4 it measures under a pixel at 200px and vanished outright, so it had
to run at 2.4, and at that weight the two crossed-off rows shouted louder than the live one they
were meant to sit behind. The ramp says it by weight instead and needs no extra ink.
TWO TIMELINE DRAWINGS WERE REJECTED BEFORE THIS ONE, and they were the same poster twice. The first
laid four container LIFETIMES on a left-to-right axis with the sidecar and the app as open paths
running off the canvas at 320: the grid clips them on the card's own rounded corner, so the two
longest bars read as a rendering fault, and with no frame the four rows had no axis and scattered on
a diagonal. The second bounded them in a Pod frame and split it into two grounds seamed where the
init phase ends, which fixed the clipping and kept the defect: a seam with no tick and no scale
reads as a gridline, the staircase left a quarter of the canvas as pale dead ground, and the
sentence was still a duration. LENGTH IS NOT THE AXIS THIS CARD NEEDS.
Two non-timeline families were offered alongside the wall and not taken: overlapping sets, with the
sidecar in the intersection of the init list and what lives for the whole Pod, and branch, one init
entry with exit 0 ghosted against restartPolicy=Always accented. Both say a true thing about the
card. Neither is a rejection on the canvas, so either is a fair starting point if the wall is ever
reopened.
```
