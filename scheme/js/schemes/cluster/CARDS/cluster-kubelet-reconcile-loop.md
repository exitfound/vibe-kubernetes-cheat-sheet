## cluster-kubelet-reconcile-loop

### layout

```
WHAT     The Kubelet's reconcile loop: watch, PLEG, SyncPod, CRI, status, running forever.
LAYOUT   LAYOUT.B of the kit, both columns read off it rather than typed: chips left at 60..540, the
         five stage rows right at 660..1140. The widest row is row 2 at 323.9 units against the 480
         the column gives, so a longer stage caption has 156 units of slack and never needs a column
         of its own.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport, from `scheme/test`:
         `OVERLAY_IDS=cluster-kubelet-reconcile-loop node --test report/overlay.test.mjs`.
         Deepest on step 2 at 1100x800, shallowest on step 0 at 1600x1000, a swing of 77.22 units.
         The API box at y 300 clears the deepest bottom by 45.34, and that clearance is what the
         character ceiling in BUDGET is derived from.
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
         every at() turnover is invisible to one. `render/reduced.test.mjs` passing is the proof the
         end state still lands.
         Every ball on the Kubelet-to-runtime lane is F.top, on all three steps that ride it: the
         lane is the top row, so M-11 gives it topPacket. A hop drawn with F.segment on the same
         from/to/y runs linear against its neighbours eased and fades in 100ms against their 200,
         which is one wire animated two ways and no check anywhere sees it.
         Reading pace. `pleg` holds 3400ms for 357 characters and `syncpod` 2700ms for 280, which is
         9.52 and 9.64 ms per character, next to the card's own `watch` at 9.64 and under the
         catalog median. Nothing in the suite measures reading load, so a duration that merely
         outlasts the span is not the number to pick: at 2200 and 1900 these two would read 6.16 and
         6.79, inside the most hurried tenth the timing probe ranks, with every check green. The
         card's own `watch` is the rate to hold them to.
         `syncpod` lights `desired` and `observed` while neither value changes. It is a packet-less,
         pod-less step, so `.highlight` alone is its whole beat (M-27), and the two chips it lights
         are the two the sentence compares.
WIRE LABELS
         Two slots, one per exchange, and a step riding both lanes fills both: `status` sends the
         PLEG relist down the runtime lane and the PATCH down the riser, so it writes `rt` and `api`
         together. A ball on a lane whose slot stays blank leaves the frame silent about what rode,
         and nothing in the suite reads a wire label at all (L-19).
         The `api` slot is right-anchored at 404, 8 left of the out riser: its longest string
         measures 192.9 units at 1600x1000 against the 112 unit gap between the API box and that
         riser, so a centred label would run through both risers.
CONTENT  There is no `source dispatcher` in the Kubelet. The three spec sources (apiserver, file,
         http) are merged by PodConfig into ONE update channel, syncLoop reads it, and
         HandlePodAdditions puts the Pod into podManager. This card names real internals everywhere
         else, so an invented component is the one sentence out of place.
         The CRI sequence is RunPodSandbox, PullImage, CreateContainer, StartContainer, and
         PullImage is in the path every time. It is in the narration, the wire label, ladder row 4
         and, crucially, in the MOTION: the cri step animates FOUR packets and the chip names each
         call as its ball lands. Four packets are what put that step at span 3660 against duration
         3800. The `observed` chip reads `0 containers` -> `1 container running`, directly
         comparable with `desired` at a glance. `1 running` beside a desired reading `1 container`
         makes the reader translate units to see that the loop converged.
         EventedPLEG is ALPHA, not beta, and that is the fact to re-check if the sentence is ever
         edited: the gate WAS beta in 1.27 and went back to alpha. Read the raw feature-gates table,
         which states `EventedPLEG false Alpha 1.26`. The Evented PLEG KEP is the source behind the
         other two numbers in that sentence: the 1s relist is `the current hardcoded default value
         is 1s`, and `reduced rate` is its `Kubelet will still do relisting but with a reduced
         frequency`.
         PullImage is stated as `which imagePullPolicy can skip when it is already on the Node`, and
         `unless it is already on the Node` is REJECTED: that describes IfNotPresent as the
         mechanism, while `Always` is what the API sets automatically for a `:latest` tag and for an
         untagged image, and under it the Kubelet requests a pull every time it launches a
         container. The sibling `cluster-pod-sandbox-cri` already names the field, `respecting
         imagePullPolicy`, so the two cards agree on which field decides.
         The `status` step says SyncPod `finds nothing left to create or start`, and `issues no new
         CRI calls` is REJECTED: this step rides a ListContainers ball and turns the chip NAMED
         `last CRI op` over to it, so that wording tells a reader watching a CRI call travel that
         none was made. The sentence names what SyncPod skips instead of denying the interface.
         The sync loop `queues that work for the Pod worker goroutine`, and `with no separate action
         queue involved` is REJECTED: the reference page opens with `The Sync Loop queues work
         (aggregated from many sources) for the Pods assigned to its node` and calls the workers
         `pod workers`, so the denial collided with the source it was meant to be checked against.
         `Pod worker` takes the capital the dictionary decision forces (T-07), not the upstream
         lowercase, and `render/inline.test.mjs` T-06 CASE is what enforces it.
         All five CRI names drawn here are exact rpc names in
         `cri-api/pkg/apis/runtime/v1/api.proto`: RunPodSandbox, PullImage, CreateContainer,
         StartContainer, ListContainers. PLEG relist also issues ListPodSandbox, which this card
         leaves to `cluster-pod-sandbox-cri`. Sources: the reference page
         `docs/reference/node/kubelet-sync-loop` is this card's subject and leads the list. No
         vendor blog is cited anywhere in the catalog, and that is the reason a 2019 Red Hat article
         is not among these three: of the 172 unique hrefs, every non-kubernetes.io one is a spec, a
         KEP, an upstream project doc or the Raft paper, and the KEP backs each sentence the article
         was carrying.
BUDGET   Panel x<=397 over the standard set, and 269 at 1024x768, which that set does not reach.
         Re-measure with the command PANEL names: the deepest reading is at 1100x800, and TWO steps
         hold it, `pleg` at 357 characters, the card's longest narration, and `cri` at 349.
         What the bottom has to clear DEPENDS ON THE STEP. On `pleg` and `cri` the next thing down
         is the API box at y=300, so 45 units of headroom at the rule worst case. On `watch` and
         `status`, the two steps that draw the `api` wire label, the obstacle is that label instead:
         its box tops out at y=277, so their headroom is 122 and 97 rather than the 145 and 120 the
         box alone would promise. `pleg` swings 77 units across the three viewports, so a reading
         taken at 1600x1000 is wrong by that much in the flattering direction. Grow a narration here
         and re-measure.
NAMING   The id carries the TITLE, `D-02` keeps the category prefix.
```
