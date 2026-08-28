## cluster-list-watch-informers

### layout

```
WHAT     How a controller sees the cluster: discovery, an initial LIST served from the API's watch
         cache, then a watch stream filling an informer and its indexer.
PANEL    291/125, 319/143, 378/150, 397/180 over 1600 / 1440 / 1280 / 1100. 180 is the floor, and
         what it is a floor UNDER is the `gvr` register at `GVR_Y - 12`, so 205, NOT the ladder at
         217. Steps 1 and 6 are the two that write that register, and on them the real clearance is
         24.88 rather than the 37 the ladder suggests. A narration sized against 217 covers the
         label, which no check reports because OCCLUDED scores blocks and a wire label is a text.
WHY NOT  Dropping the ETCD lanes at ETCD_CX +/- 12 from the top row: both risers then run straight
         down through all three state chips.
WHY NOT  Moving the chip column left. The chip strip pools value chips AND chainList rows AND the
         event slots, and it centres on 600 precisely BECAUSE the ladder holds 60 while the chips
         hold 1140. Nothing else can hold 60: the event slots start at 290 and widening them moves
         the timeline off the spine.
WHY NOT  A second, upward Informer-to-API lane so the LIST gets a lane of its own. WATCH_LANE is the
         single vertical on the spine at x=600 and the `watch` caption anchors `end` on 580 beside it,
         so a pair would have to split the spine into two risers, move that caption, and move the
         F.segment endpoints four steps share. It would also stand unridden on five of the seven steps
         even after the LIST and the re-LIST were animated on it, where the register costs nothing.
NOTE     Both ETCD wire registers sit on the BOTTOM legs, not up on the row: the lanes turn down at
         764 and 740, so a label centred on 890 floats in blank canvas 120 units right of anything it
         could be labelling. The LIST label sits BESIDE the riser, not in the 112 unit gap under it,
         because the string is 140 wide and overran the Client on one side and was cut by the riser
         on the other.
WIRE LABELS
         Four registers carry a string, and the `watch` one has a HARD CEILING nothing checks.
         It anchors `end` on 580 and the Client riser is a vertical at x=412 running y=100..430, so
         the register has 168 units and at the 6.89 per character rate that is 24 characters, with
         the 24th touching the line. MEASURED at 1600x1000 after document.fonts.ready:
         `chunked HTTP . streaming` was 165.4 on 414.6..580 over y 180.3..194.9, which is 2.6 from
         the riser and rendered as a stray tick glued to the c. It is now `chunked HTTP . stream`,
         144.7 on 435.3..580, 23.3 clear. THE WIDEST VIEWPORT IS THE WORST ONE here: the same string
         reads 447.8 at 1280x860 (35.8 clear) and 451.2 at 1100x800 (39.2 clear), so measuring at
         1100x800 alone hides the defect. Keep this register at or under 21 characters.
         The other three, measured at 1600x1000: `200 OK . rv=842` 99 on 481..580 (69 clear of the
         riser), `new Pod . rv=843` 110.3 on 814.9..925.1 over y 458.8..473.4 (74.9 clear of the
         ETCD left face at 1000), `GET /api . GET /apis` 137.8 on 422..559.8 anchored `start`, which
         puts it on the far side of the riser. `L-19` is why none of this has a machine.
WHY NOT  A register for FEED_LANE, the Informer to Indexer feed, which carries a ball on the `list`
         and `event` steps and is the one ridden lane with no caption. A centred label on CX would
         span about 550..650 in the only band available, and `req` on the `list` step measures
         422..580.3 over y 337.3..351.1, so the two overlap by 30.3. What makes it affordable to
         leave silent is that both ends already say it: `Informer / shared list-watch` feeds
         `Indexer / in-memory cache`, and neither block needs a string to explain the other. The
         ETCD leg did need one, because a ball leaving a cylinder with no caption is the reader's
         only clue about what came out of the store.
DO NOT   Draw the Indexer as a cylinder. In this catalog that glyph means a DURABLE STORE and ETCD is
         a cylinder 400 units to its right on the same card, so the informer cache and the cluster
         datastore would be the same object in one frame, on a card whose list step exists to say the
         controller reconciles from local memory. It is a box with an `in-memory cache` sublabel, and
         ETCD is the only cylinder here. Height 80, not 110, so it shares its row with the Client and
         the low band reads as three peers of which one wears the store glyph. Nothing derives from
         IDX_H: FEED_LANE lands on IDX_Y, so no route length and no packet timing moved.
DO NOT   Put a real step in slot 0. `discovery` sat there, so at the poster position the card drew a
         request ball, lit Client and Api and set two wire labels UNDER the panel text of the step
         AFTER it, and its routePacket never ran at all because the poster position enters reduced.
MOTION   The list step draws FOUR balls in TWO INDEPENDENT chains. Answer chain: Api -> Informer
         (straight down the watch lane), then Informer -> Indexer. Gated on nothing, leaves at 0.
         Background chain: Api -> ETCD and back, the Api keeping its own watch cache current.
         DO NOT gate the answer on the ETCD return: it makes the reader watch a ball cross to ETCD
         and come back before the Informer is answered, under a panel saying no quorum read happened.
         The Api is lit at ENTRY because it is the SOURCE of both outbound balls rather than a relay,
         which is what the R3 sender-lit rule wants. Motion ends at 3460 against a duration of 5400,
         and that gap is deliberate: 5400 is reading time for the longest narration, not motion time.
CONTENT  The initial LIST is NOT read through to ETCD. A reflector lists at resourceVersion 0, which
         the reference says is "always served from watch cache", while unset is "served from etcd via
         a quorum read". Verified in apiserver/pkg/storage/cacher/delegator: ShouldDelegateList with
         an empty ResourceVersionMatch, no Continue token and ResourceVersion "0" returns
         `Result{ShouldDelegate: false}`. The req wire carries rv=0 and rv=842 is what comes BACK.
         api-concepts is the second reading: the list table gives resourceVersion="0" with
         resourceVersionMatch and limit unset the semantic `Any`, and `Any` is defined as `Always
         served from watch cache, improving performance and reducing etcd load`. The watch cache is
         defined on the same page as `an internal, in-memory store within the API server that caches
         and mirrors the state of data persisted into etcd`, which is what the two ETCD lanes draw.
         The contrast is WEAKER than it was and the wording is KEPT anyway: `Most recent`
         (resourceVersion unset) now reads `For etcd v3.4.31+ and v3.5.13+, Kubernetes serves most
         recent reads from the watch cache`, so a plain list avoids the quorum read too. The card
         says `no quorum read` about the rv=0 path, which is the one case the table guarantees.
         THE INITIAL LIST IS NO LONGER THE DEFAULT FIRST MOVE ON THE VERSION THIS CARD CLAIMS.
         Measured on release-1.35, both gates ship on: client-go `WatchListClient` carries
         `{Version: 1.35, Default: true, PreRelease: Beta}` in
         `staging/src/k8s.io/client-go/features/known_features.go`, and the apiserver `WatchList`
         carries `{Version: 1.34, Default: true, PreRelease: Beta}` with no later entry. The
         reflector reads that gate straight into its branch, `r.useWatchList =
         clientfeatures.FeatureGates().Enabled(clientfeatures.WatchListClient)` then
         `fallbackToList := !r.useWatchList`, so a stock 1.35 informer opens
         `watch=1&sendInitialEvents=true&resourceVersionMatch=NotOlderThan` and reads the initial
         state off synthetic ADDED events plus a BOOKMARK.
         The STEPS still draw list-then-watch and that is deliberate: the watch-list KEP 3157 states
         `reflectors/informers will always fallback to a regular LIST operation regardless of the
         error that occurred`, so the drawn path is the guaranteed one rather than a legacy one.
         What was repaired is the claim that it is the ONLY path. The coda carries the correction
         and the desc carries it for the grid, where no dialog reader ever goes.
         WHY THE CODA AND NOT THE LIST STEP. The sentence does not go on `list`.
         Measured at 1100x800, that narration at 370 characters drives the panel bottom from 180.12
         to 254.66 and buries the GVR ladder at 217. The binding number on the coda is NOT the ladder
         either: the `gvr` register sits at `GVR_Y - 12`, so 205, and step 6 is one of only two
         steps that write it. At 286 characters the panel reached 204.97 and covered that label,
         which `report/geometry-soft.test.mjs` cannot report because OCCLUDED scores BLOCKS and a
         wire label is a text. The panel quantises by LINE: 276 and up land on 204.97, while 251 and
         below land on 180.12, the floor the card already had, leaving 24.88 to the label. The coda
         is therefore capped at 251 characters, and `same controller pattern` was the clause that
         gave way, being the third of three parallel ones. Duration went 1900 to 2800 to hold the
         pace at 11.16 against the 11.05 it read before.
         `Every controller is built on that one list-watch pattern` was the desc close and is GONE
         as a `T-19` absolute the reference itself hedges: api-concepts says `Kubernetes client
         libraries TYPICALLY offer some form of standard tool for this list-then-watch logic`.
         VERIFIED AND UNCHANGED, same date. The rv ladder 840 / 841 / 842 / 843 under
         `watch event stream (resourceVersion grows)` is guaranteed only from the release this card
         declares: `Starting with Kubernetes 1.35, orderability of resource versions for all
         Kubernetes types is included in Certified Kubernetes requirements. Base API objects and
         custom resources MUST be orderable as a monotonically increasing integer for any 1.35+
         APIServer implementation`. So `k8sVersion` is LOAD BEARING here and dropping it below 1.35
         would falsify that caption. `200 OK` and `chunked HTTP` are the literal shape of the watch
         examples on that page, `200 OK` over `Transfer-Encoding: chunked`. Discovery over `GET
         /api` and `GET /apis` returning the whole catalogue is aggregated discovery, stable and on
         by default since 1.30: `publishing all resources supported by a cluster through two
         endpoints`. The 410 step matches `clients must handle the case by recognizing the status
         code 410 Gone, clearing their local cache, performing a new get or list operation, and
         starting the watch from the resourceVersion that was returned`, and the clearing half is
         what the `re-syncing` and `reset` chips carry. Both `sources` fetched live, 0 dead.
         The two ETCD lanes are the watch cache being filled, and they are labelled as such.
NOTE     The 410 step is a conditional aside (its sentence opens with If), so the coda puts the
         informer back into the steady state `event` left it in. Without that the coda runs under
         `410 Gone . re-listing`, the previous step leaking into a summary about CRDs.
NOT A DEFECT
         `render/chipfit.test.mjs` is silent on `eventSlot`, which draws two STACKED texts rather than a
         name/value pair. The tool skips chips whose two texts sit on different baselines.
NOT A DEFECT
         Three event slots standing under `cache size 4` for 2993 of the `event` step's 3800 ms. The
         `list` step teaches the reader a mapping it never promised, three ADDED slots beside a cache
         of 3, so the fourth slot arriving late reads as an arithmetic error. It is not one: the slots
         are captioned `watch event stream`, which is the wire and not the cache, and the fourth
         appears on `toCache`, the arrival that earns it. The repair would be binding cacheChip to
         that same arrival, and it is DECLINED twice over. `P-04` forbids doing it to one chip of a
         trio, so rvChip and watchChip would have to move with it, and all three lighting at entry is
         the catalogue's ordinary shape rather than this card's habit, which the FORM-A queue in
         `report/chip-beat.test.mjs` counts in the hundreds. Rebinding three chips here buys a deviation and
         closes nothing a rule can see.
NOT A DEFECT
         The `req` register naming a LIST and a re-LIST on two steps that put no ball on the Client
         lane. `T-22` asks whether a caption names traffic that RIDES that lane, and it does: the lane
         through RISER_X is the process's one outbound HTTP channel to the API, and client-go's
         reflector issues both the LIST and the re-LIST over the same clientset the informer factory
         was built with, so all three strings the register carries are requests leaving on it. What
         those two steps lack is a BALL, and a ball per step is not the thing T-22 measures: `list`
         animates the ANSWER only, on purpose, because gating it upstream draws the quorum read the
         panel denies, and the CONTENT block above already states that the register carries rv=0 out
         while rv=842 comes back. Measured on `list` at 1600x1000: the register spans 422..587.4 on
         337.3..351.9, which is 10 right of the riser at x=412 and vertically inside the 100..430 run
         of it, so it is pinned to that lane and to no other thing on the card.
         What a reader can still get wrong is WHO issues it, since the panel credits the informer and
         the caption stands beside the Client. That is the missing process boundary, which is the OPEN
         finding below rather than a second finding: with Client, Informer and Indexer drawn as three
         unrelated blocks, every string on the shared channel reads as the Client's.
OPEN     THE PROCESS FRAME. Client, Informer and Indexer are ONE process drawn as three independent
         blocks with no boundary, so the Client reads as an actor talking to an informer it contains.
         One dashed frame around the three is the fix and it is NOT done, because every placement
         that passes `report/geometry-soft.test.mjs` costs more than the finding does. All three
         were measured:
           1. Ladder out of the left column (GVR_X 60 -> 840): CENTRE then reports the chip strip
              spanning 290..1140, centre 715 against a want of 600.
           2. Ladder above the frame: best case it runs 190..336, the frame top is 356, node() spends
              34 on its label, Informer 72 and Indexer 80, so the frame bottom lands at 584 or lower
              against a stream caption at 536 and a slot row at 548..592. It does not fit with every
              gap at zero.
           3. Ladder below the frame: the frame bottom cannot be above 482, so the ladder runs
              502..648 on a 640 canvas and crosses the slot row at 290..910. Narrowing it to clear
              the slots is unavailable: the longest row string measures 234.3 and chainList draws it
              at x=10.
         A notched outline (a hexagon with a bite where the ladder sits) is geometrically free and is
         DECLINED: a Tetris-shaped process boundary asserts a shape the mechanism does not have. What
         a future attempt has to buy is not the frame but a home for the discovery catalogue that
         keeps a chip on x=60, keeps the spine straight on CX, and does not push the timeline off it.
         The general reason the three placements above all fail: the Informer (235..307) shares its
         horizontal band with the ladder rows (217..330), and the Client is at 60..300 against a
         centre column at 510..690. So ANY frame holding the Informer and reaching left to the
         Client crosses the ladder, and any frame clearing the ladder loses the Informer. Restacking
         the Client into the column instead needs about 100 more units and the slot row starts at
         548. The finding stays open until the catalogue moves.
NOT A DEFECT
         `report/arrival.test.mjs` carries three R2-STEP findings here, all on the `crd` step:
         `resourceVersion`, `watch` and `cache size` change text and take no highlight. The 410 step
         is a conditional ASIDE, so the coda puts the three back to the steady state `event` left
         (843, open streaming, 4). A cue there would announce a change forward, and what happened is
         a return. DO NOT light them, and DO NOT drop the three writes either: without them the coda
         runs under `410 Gone . re-listing`, which is the state the card just left.
NAMING   The id carries the TITLE, `D-02` keeps the category prefix, and `control-api-structure` and
         `cluster-api-structure` resolve through `SCHEME_ALIASES` (`D-11`).
```

### poster

```
Sentence: the whole picture lives in the local copy, and only the changes come over the wire.

Stream into a cache. A 124 x 128 cache block on the left holding five stacked bars, four at 0.3 and
one at 0.9, the row a change has just updated. One dashed leg leaves THAT row for the right half,
where twelve slivers stand for the later changes still arriving. The mass is the sentence: a
controller that holds everything locally needs only slivers over the wire.

The stream is drawn as SLIVERS, not specks: rounded rects 6 high (half a cache row, which is 12)
and 11 to 21 long, against rows of 96. The glyph is the sentence twice over, a wire fragment of the
thing the cache holds whole, and it rhymes with the left block instead of standing beside it as
unrelated dots. They are graded in THREE bands by distance from the leg, 0.74 / 0.6 near, 0.55 /
0.46 mid, 0.36 / 0.3 far, and they fan wider going right, so the field has a direction: the changes
close to the cache are about to land, the far ones are still coming. Ten uniform circles at one
opacity of 0.6 and radius 3 to 4 is what this replaces, on the author's reading that the field read
pale and inert at the 200px the grid renders. A circle of radius 3 covers 28 square units against a
sliver's 90, which is why the same element count now carries weight.

The previous version is closed, not reworked away from: three hollow 160 x 22 rows and six dots at
radius 2 to 2.5. It carried NO accent at all, poster-lint read six elements at fill=currentColor and
called it no accent, the dots were near-invisible at the 200px the grid renders, and the drawing lay
in a horizontal strip with the left third, the top 48 and the bottom 46 units empty. The block now
spans x 24..148 and y 26..154, so all three dead bands are occupied. The other half of the old OPEN,
that the silhouette matched cluster-server-side-apply, went stale when that poster was redrawn as
two overlapping claim sets.

DEVIATION, deliberate: 19 primitives, well over the catalog median that `poster-lint.mjs` prints
beside every count. Twelve slivers is what it
costs to read as a population rather than as leftover marks, which is the defect the old six dots
had and the ten had again in weaker form. Cutting to the median means cutting the stream back to
five, which reads as leftover marks rather than as a population. This family is the one place the reference
licenses an element under 20 units, because the stream is a population rather than an object.

NOTE     NOTHING sits on the leg own line at y=90, and the band y 86..96 is empty for the whole
         field. Collinear and close, a mark there read as a ball parked at the end of the wire, the
         R-09 silhouette the old poster had, and a SLIVER there would read worse still, as the wire
         simply continuing. The nearest one is at 207,74, ten above the line and seventeen right of
         the leg end, so the leg opens into the field instead of terminating on anything.

DO NOT   Rebuild it as the pipe version: an API block, a cache block and one long horizontal channel
         carrying four event cells. It was declined before this rework and stays declined.
```
