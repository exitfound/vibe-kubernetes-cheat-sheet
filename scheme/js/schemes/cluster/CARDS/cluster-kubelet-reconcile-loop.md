## cluster-kubelet-reconcile-loop

### layout

```
WHAT     The Kubelet's reconcile loop: watch, PLEG, SyncPod, CRI, status, running forever.
LAYOUT   LAYOUT.B of the kit, both columns read off it rather than typed: chips left at 60..540,
         the five stage rows right at 660..1140. The widest row is row 2 at 323.9 units against the
         480 the column gives, so a longer stage caption has 156 units of slack and never needs a
         column of its own.
PANEL    x<=397 catalog-wide (`L-02`). Bottom 254.66 at 1100x800 step 2, shallowest 125.11 at
         1600x1000 step 0, a swing of 77.22 units. The API box at y 300 clears the deepest bottom by
         45.34, and that clearance is what the character ceiling in BUDGET is derived from.
CONTENT  There is no `source dispatcher` in the Kubelet. The three spec sources (apiserver, file,
         http) are merged by PodConfig into ONE update channel, syncLoop reads it, and
         HandlePodAdditions puts the Pod into podManager. This card names real internals everywhere
         else, so one invented component was the odd sentence out.
         The CRI sequence is RunPodSandbox, PullImage, CreateContainer, StartContainer, and PullImage
         is in the path every time. It is in the narration, the wire label, ladder row 4 and,
         crucially, in the MOTION: the cri step animates FOUR packets and the chip names each call as
         its ball lands. Four packets are what put that step at span 3660 against duration 3800.
         The `observed` chip reads `0 containers` -> `1 container running`, directly comparable with
         `desired` at a glance. `1 running` beside a desired reading `1 container` makes the reader
         translate units to see that the loop converged.
         EventedPLEG is ALPHA, not beta, and that is the fact to re-check if the sentence is ever
         edited: the gate WAS beta in 1.27 and went back to alpha. Read the raw feature-gates table,
         which states `EventedPLEG false Alpha 1.26`. The Evented PLEG KEP is the source behind the
         other two numbers in that sentence: the 1s relist is `the current hardcoded default value
         is 1s`, and `reduced rate` is its `Kubelet will still do relisting but with a reduced
         frequency`.
         PullImage is stated as `which imagePullPolicy can skip when it is already on the Node`, and
         `unless it is already on the Node` is REJECTED: that describes IfNotPresent as the
         mechanism, while `Always` is what the API sets automatically for a `:latest` tag and for an
         untagged image, and under it the Kubelet requests a pull every time it launches a container.
         The sibling `cluster-pod-sandbox-cri` already names the field, `respecting imagePullPolicy`,
         so the two cards agree on which field decides.
         The `status` step says SyncPod `finds nothing left to create or start`, and `issues no new
         CRI calls` is REJECTED: this step rides a ListContainers ball and turns the chip NAMED
         `last CRI op` over to it, so a reader watching a CRI call travel was told none was made.
         The sentence now names what SyncPod skips instead of denying the interface.
         The sync loop `queues that work for the Pod worker goroutine`, and `with no separate action
         queue involved` is REJECTED: the reference page opens with `The Sync Loop queues work
         (aggregated from many sources) for the Pods assigned to its node` and calls the workers
         `pod workers`, so the denial collided with the source it was meant to be checked against.
         `Pod worker` takes the capital the dictionary decision forces (T-07), not the upstream
         lowercase, and `render/inline.test.mjs` T-06 CASE is what enforces it.
         All five CRI names drawn here are exact rpc names in `cri-api/pkg/apis/runtime/v1/api.proto`:
         RunPodSandbox, PullImage, CreateContainer, StartContainer, ListContainers. PLEG relist also
         issues ListPodSandbox, which this card leaves to `cluster-pod-sandbox-cri`.
         Sources: the reference page `docs/reference/node/kubelet-sync-loop` is this card's subject
         and leads the list. No vendor blog is cited anywhere in the catalog, and that is the reason
         a 2019 Red Hat article is not among these three: of the 172 unique hrefs, every
         non-kubernetes.io one is a spec, a KEP, an upstream project doc or the Raft paper, and the
         KEP backs each sentence the article was carrying.
MOTION   Every chip waits for the packet that earns it, the end value pinned above the ctx.reduced
         guard and turned over through a local 1ms at():
           watch   Pod, desired    the spec ARRIVES (~1160ms). podManager cannot hold a spec the
                                   Node has not been handed
           pleg    last CRI op     the call REACHES the runtime
           pleg    observed        the ANSWER comes home. The Kubelet learns the container list from
                                   the reply, not from having asked
           cri     last CRI op     four turnovers, one per call as its ball lands
           status  observed        the answer comes home, and only then does the PATCH leave
         Verified by real-time sampling, not by frames: a SEEKED probe never fires onfinish, so
         every at() turnover is invisible to one. `render/reduced.test.mjs` passing is the proof
         the end state still lands.
         Every ball on the Kubelet-to-runtime lane is F.top, on all three steps that ride it: the
         lane is the top row, so M-11 gives it topPacket. A hop drawn with F.segment on the same
         from/to/y runs linear against its neighbours eased and fades in 100ms against their 200,
         which is one wire animated two ways and no check anywhere sees it.
WIRE LABELS
         Two slots, one per exchange, and a step riding both lanes fills both: `status` sends the
         PLEG relist down the runtime lane and the PATCH down the riser, so it writes `rt` and
         `api` together. A ball on a lane whose slot stays blank leaves the frame silent about what
         rode, and nothing in the suite reads a wire label at all (L-19).
         The `api` slot is right-anchored at 404, 8 left of the out riser: its longest string
         measures 192.9 units at 1600x1000 against the 112 unit gap between the API box and that
         riser, so a centred label would run through both risers.
BUDGET   Panel x<=397, bottom 177 / 214 / 255 over 1600x1000 / 1280x860 / 1100x800, and 269 at
         1024x768. Re-measured with
         `OVERLAY_IDS=cluster-kubelet-reconcile-loop node --test report/overlay.test.mjs` from
         `scheme/test`, which reads 254.66 on the `pleg` step at 1100x800, the card's longest
         narration at 357 characters: the card header's 255 is that same measurement.
         TWO steps hold that deepest reading, `pleg` at 357 characters and `cri` at 349, and both
         measure 254.66 at 1100x800.
         What the bottom has to clear DEPENDS ON THE STEP. On `pleg` and `cri` the next thing down
         is the API box at y=300, so 45 units of headroom at the rule worst case. On `watch` and
         `status`, the two steps that draw the `api` wire label, the obstacle is that label
         instead: its box tops out at y=277, so their headroom is 122 and 97 rather than the 145
         and 120 the box alone would promise. `pleg` swings 77 units across the three viewports, so
         a reading taken at 1600x1000 is wrong by that much in the flattering direction. Grow a
         narration here and re-measure.
NOTE     Reading pace. `pleg` holds 3400ms for 357 characters and `syncpod` 2700ms for 280, which
         is 9.52 and 9.64 ms per character, next to the card's own `watch` at 9.64 and under the
         catalog median. Nothing in the suite measures reading load, so a duration that
         merely outlasts the span is not the number to pick: at 2200 and 1900 these two would read
         6.16 and 6.79, inside the most hurried tenth the timing probe ranks,
         with every check green. The card's own `watch` is the rate to hold them to.
NOT A DEFECT
         `report/arrival.test.mjs` R2 reports three findings here, all the tool artefact: it samples at t=0 and
         compares against t=0 of the previous step, so a mid-step turnover is attributed to the NEXT
         step, where the chip is not highlighted because that step is not about it.
         `syncpod` lights `desired` and `observed` while neither value changes. It is a
         packet-less, pod-less step, so `.highlight` alone is its whole beat (M-27), and the two
         chips it lights are the two the sentence compares.
NAMING   The id carries the TITLE, `D-02` keeps the category prefix, and `control-kubelet-sync-loop`
         and `cluster-kubelet-sync-loop` resolve through `SCHEME_ALIASES` (`D-11`).
```

### poster

```
Sentence: a closed cycle of five stages that never stops.

Five stage blocks (76 x 50, rx 8) wired head to tail into a closed ring: three across the top at
x = 20 / 120 / 220, two under the outer pair at y=110, five legs joining them face midpoint to face
midpoint. Clockwise from the top left: watch, PLEG, SyncPod, CRI, status. SyncPod is the reconcile
itself, which is the card title, so it takes the winner treatment: 0.10 fill against 0.04 and the
one bright bar at 0.9, twice the width of the four dim bars at 0.3.

The long bottom leg is the return and it is the ONE SOLID leg against four dashed. It is the only
weight contrast on the drawing, so it is what says the ring is closed rather than that five blocks
happen to be wired: the sibling montage neighbour `cluster-leader-election` carries its whole
sentence the same way, one solid leg among dashed. Dashes are the house `4 3`, which 171 legs in the
catalogue use against 8 on the reversed `3 4`.

NOT A DEFECT: the middle of the bottom row is empty, 76 x 50 at x = 120..196, because the ring is
five stations and the grid holds six. Judged at true size with the solid return in place: the leg
spans the gap and the band reads as a pitch rather than as a block someone removed. Closing it needs
a different composition, 2 + 1 + 2 with the accent in the centre, which is a new concept line and
not a tweak.

DO NOT draw it as one thin rounded track with five small marks and an arrowhead. That version failed
on STYLE, only visible next to the siblings: the marks were specks at the 200px the grid renders, the
dimmed track made the dominant shape faint, and 240 x 116 of canvas was empty air. It also broke the
vocabulary twice: NO poster in the catalog uses an arrowhead, and the house accent is not a bright
FILL on a shape, it is a rect with fill="currentColor" at 0.9. Direction is carried by the ring being
CLOSED.

If you redraw a poster here, put it side by side with two siblings at 260% before deciding. Faults
of this family are invisible on the file and obvious on a montage.
```
