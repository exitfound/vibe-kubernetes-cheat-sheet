## cluster-list-watch-informers

### layout

```
WHAT     How a controller sees the cluster: discovery, an initial LIST served from the API's watch
         cache, then a watch stream filling an informer and its indexer.
LAYOUT   The chip column does not move left. The chip strip pools value chips AND chainList rows AND
         the event slots, and it centres on 600 precisely BECAUSE the ladder holds 60 while the
         chips hold 1140. Nothing else can hold 60: the event slots start at 290 and widening them
         moves the timeline off the spine.
PANEL    x<=397 catalog-wide (`L-02`). Bottom per viewport, from `scheme/test`:
         `OVERLAY_IDS=cluster-list-watch-informers node --test report/overlay.test.mjs`.
         Deepest on step 2 at 1100x800, shallowest on step 0 at 1600x1000, a swing of 72.45 units.
         What the deepest bottom is a floor UNDER is the `gvr` register at `GVR_Y - 12`, so 205, and
         NOT the ladder at 217. Steps 1 and 6 are the two that write that register, and on them the
         real clearance is 24.88 rather than the 37 the ladder suggests. A narration sized against
         217 covers the label, which no check reports because OCCLUDED scores blocks and a wire
         label is a text.
SIZES    The Indexer is a BOX with an `in-memory cache` sublabel and never a cylinder. In this
         catalog that glyph means a DURABLE STORE and ETCD is a cylinder 400 units to its right on
         the same card, so a cylinder here makes the informer cache and the cluster datastore the
         same object in one frame, on a card whose list step exists to say the controller reconciles
         from local memory.
         ETCD is the only cylinder here. Height 80, not 110, so it shares its row with the Client
         and the low band reads as three peers of which one wears the store glyph. Nothing derives
         from IDX_H: FEED_LANE lands on IDX_Y, so no route length and no packet timing moved.
LANES    The ETCD lanes do not drop at ETCD_CX +/- 12 from the top row: both risers then run
         straight down through all three state chips.
         There is no second, upward Informer-to-API lane giving the LIST one of its own. WATCH_LANE
         is the single vertical on the spine at x=600 and the `watch` caption anchors `end` on 580
         beside it, so a pair has to split the spine into two risers, move that caption, and move
         the `F.segment` endpoints four steps share. A second lane also stands unridden on five of
         the seven steps even with the LIST and the re-LIST animated on it, where the register costs
         nothing.
MOTION   The list step draws FOUR balls in TWO INDEPENDENT chains. Answer chain: Api -> Informer
         (straight down the watch lane), then Informer -> Indexer. Gated on nothing, leaves at 0.
         Background chain: Api -> ETCD and back, the Api keeping its own watch cache current.
         DO NOT gate the answer on the ETCD return: it makes the reader watch a ball cross to ETCD
         and come back before the Informer is answered, under a panel saying no quorum read
         happened. The Api is lit at ENTRY because it is the SOURCE of both outbound balls rather
         than a relay, which is what the R3 sender-lit rule wants. Motion ends at 3460 against a
         duration of 5400, and that gap is deliberate: 5400 is reading time for the longest
         narration, not motion time. Slot 0 carries no real step. With `discovery` in it the poster
         position draws a request ball, lights Client and Api and sets two wire labels UNDER the
         panel text of the step AFTER it, and its routePacket never runs at all because the poster
         position enters reduced. The 410 step is a conditional aside (its sentence opens with If),
         so the coda puts the informer back into the steady state `event` left it in. Without that
         the coda runs under `410 Gone . re-listing`, the previous step leaking into a summary about
         CRDs.
         Three event slots standing under `cache size 4` for 2993 of the `event` step's 3800 ms. The
         `list` step teaches the reader a mapping it never promised, three ADDED slots beside a
         cache of 3, so the fourth slot arriving late reads as an arithmetic error. It is not one:
         the slots are captioned `watch event stream`, which is the wire and not the cache, and the
         fourth appears on `toCache`, the arrival that earns it. The repair would be binding
         cacheChip to that same arrival, and it is DECLINED twice over. `P-04` forbids doing it to
         one chip of a trio, so rvChip and watchChip would have to move with it, and all three
         lighting at entry is the catalogue's ordinary shape rather than this card's habit, which
         the FORM-A queue in `report/chip-beat.test.mjs` counts in the hundreds. Rebinding three
         chips here buys a deviation and closes nothing a rule can see.
WIRE LABELS
         Four registers carry a string, and the `watch` one has a HARD CEILING nothing checks. It
         anchors `end` on 580 and the Client riser is a vertical at x=412 running y=100..430, so the
         register has 168 units and at the 6.89 per character rate that is 24 characters, with the
         24th touching the line. MEASURED at 1600x1000 after document.fonts.ready:
         `chunked HTTP . streaming` was 165.4 on 414.6..580 over y 180.3..194.9, which is 2.6 from
         the riser and rendered as a stray tick glued to the c. It is now `chunked HTTP . stream`,
         144.7 on 435.3..580, 23.3 clear. THE WIDEST VIEWPORT IS THE WORST ONE here: the same string
         reads 447.8 at 1280x860 (35.8 clear) and 451.2 at 1100x800 (39.2 clear), so measuring at
         1100x800 alone hides the defect. Keep this register at or under 21 characters.
         The other three, measured at 1600x1000: `200 OK . rv=842` 99 on 481..580 (69 clear of the
         riser), `new Pod . rv=843` 110.3 on 814.9..925.1 over y 458.8..473.4 (74.9 clear of the
         ETCD left face at 1000), `GET /api . GET /apis` 137.8 on 422..559.8 anchored `start`, which
         puts it on the far side of the riser. `L-19` is why none of this has a machine.
         Both ETCD wire registers sit on the BOTTOM legs, not up on the row: the lanes turn down at
         764 and 740, so a label centred on 890 floats in blank canvas 120 units right of anything
         it could be labelling. The LIST label sits BESIDE the riser, not in the 112 unit gap under
         it, because the string is 140 wide: in that gap it overruns the Client on one side and the
         riser cuts it on the other.
         FEED_LANE, the Informer to Indexer feed, carries NO register. It takes a ball on the `list`
         and `event` steps and is the one ridden lane with no caption. A centred label on CX spans
         about 550..650 in the only band available, and `req` on the `list` step measures 422..580.3
         over y 337.3..351.1, so the two overlap by 30.3. What makes it affordable to leave silent
         is that both ends already say it: `Informer / shared list-watch` feeds `Indexer / in-memory
         cache`, and neither block needs a string to explain the other. The ETCD leg did need one,
         because a ball leaving a cylinder with no caption is the reader's only clue about what came
         out of the store.
         The `req` register names a LIST and a re-LIST on two steps that put no ball on the Client
         lane. `T-22` asks whether a caption names traffic that RIDES that lane, and it does: the
         lane through RISER_X is the process's one outbound HTTP channel to the API, and client-go's
         reflector issues both the LIST and the re-LIST over the same clientset the informer factory
         is built with, so all three strings the register carries are requests leaving on it. What
         those two steps lack is a BALL, and a ball per step is not the thing `T-22` measures:
         `list` animates the ANSWER only, on purpose, because gating it upstream draws the quorum
         read the panel denies, and the `CONTENT` block states that the register carries rv=0 out
         while rv=842 comes back. Measured on `list` at 1600x1000: the register spans 422..587.4 on
         337.3..351.9, which is 10 right of the riser at x=412 and vertically inside the 100..430
         run of it, so it is pinned to that lane and to no other thing on the card.
         What a reader can still get wrong is WHO issues it, since the panel credits the informer
         and the caption stands beside the Client. That is the missing process boundary rather than
         a second finding: with Client, Informer and Indexer drawn as three unrelated blocks, every
         string on the shared channel reads as the Client's.
CONTENT  The initial LIST is NOT read through to ETCD. A reflector lists at resourceVersion 0, which
         the reference says is "always served from watch cache", while unset is "served from etcd
         via a quorum read". Verified in apiserver/pkg/storage/cacher/delegator: ShouldDelegateList
         with an empty ResourceVersionMatch, no Continue token and ResourceVersion "0" returns
         `Result{ShouldDelegate: false}`. The req wire carries rv=0 and rv=842 is what comes BACK.
         api-concepts is the second reading: the list table gives resourceVersion="0" with
         resourceVersionMatch and limit unset the semantic `Any`, and `Any` is defined as `Always
         served from watch cache, improving performance and reducing etcd load`. The watch cache is
         defined on the same page as `an internal, in-memory store within the API server that caches
         and mirrors the state of data persisted into etcd`, which is what the two ETCD lanes draw.
         The contrast is WEAK and the wording is KEPT anyway: `Most recent` (resourceVersion unset)
         reads `For etcd v3.4.31+ and v3.5.13+, Kubernetes serves most recent reads from the watch
         cache`, so a plain list avoids the quorum read too. The card says `no quorum read` about
         the rv=0 path, which is the one case the table guarantees. THE INITIAL LIST IS NO LONGER
         THE DEFAULT FIRST MOVE ON THE VERSION THIS CARD CLAIMS. Measured on release-1.35, both
         gates ship on: client-go `WatchListClient` carries `{Version: 1.35, Default: true,
         PreRelease: Beta}` in `staging/src/k8s.io/client-go/features/known_features.go`, and the
         apiserver `WatchList` carries `{Version: 1.34, Default: true, PreRelease: Beta}` with no
         later entry. The reflector reads that gate straight into its branch, `r.useWatchList =
         clientfeatures.FeatureGates().Enabled(clientfeatures.WatchListClient)` then `fallbackToList
         := !r.useWatchList`, so a stock 1.35 informer opens
         `watch=1&sendInitialEvents=true&resourceVersionMatch=NotOlderThan` and reads the initial
         state off synthetic ADDED events plus a BOOKMARK.
         The STEPS still draw list-then-watch and that is deliberate: the watch-list KEP 3157 states
         `reflectors/informers will always fallback to a regular LIST operation regardless of the
         error that occurred`, so the drawn path is the guaranteed one rather than a legacy one.
         What the drawn path is NOT is the only path, and the coda says so. The desc carries the
         same qualifier for the grid, where no dialog reader ever goes.
         WHY THE CODA AND NOT THE LIST STEP. The sentence does not go on `list`.
         Measured at 1100x800, that narration at 370 characters drives the panel bottom from 180.12
         to 254.66 and buries the GVR ladder at 217. The binding number on the coda is NOT the
         ladder either: the `gvr` register sits at `GVR_Y - 12`, so 205, and step 6 is one of only
         two steps that write it. At 286 characters the panel reached 204.97 and covered that label,
         which `report/geometry-soft.test.mjs` cannot report because OCCLUDED scores BLOCKS and a
         wire label is a text. The panel quantises by LINE: 276 and up land on 204.97, while 251 and
         below land on 180.12, the floor the card already had, leaving 24.88 to the label. The coda
         is therefore capped at 251 characters, which is what the clause `same controller pattern`
         is dropped to buy, being the third of three parallel ones. Duration is 2800 to hold the
         pace at 11.16.
         `Every controller is built on that one list-watch pattern` was the desc close and is GONE
         as a `T-19` absolute the reference itself hedges: api-concepts says `Kubernetes client
         libraries TYPICALLY offer some form of standard tool for this list-then-watch logic`.
         VERIFIED AND UNCHANGED, same date. The rv ladder 840 / 841 / 842 / 843 under `watch event
         stream (resourceVersion grows)` is guaranteed only from the release this card declares:
         `Starting with Kubernetes 1.35, orderability of resource versions for all Kubernetes types
         is included in Certified Kubernetes requirements. Base API objects and custom resources
         MUST be orderable as a monotonically increasing integer for any 1.35+ APIServer
         implementation`. So `k8sVersion` is LOAD BEARING here and dropping it below 1.35 would
         falsify that caption. `200 OK` and `chunked HTTP` are the literal shape of the watch
         examples on that page, `200 OK` over `Transfer-Encoding: chunked`. Discovery over `GET
         /api` and `GET /apis` returning the whole catalogue is aggregated discovery, stable and on
         by default since 1.30: `publishing all resources supported by a cluster through two
         endpoints`. The 410 step matches `clients must handle the case by recognizing the status
         code 410 Gone, clearing their local cache, performing a new get or list operation, and
         starting the watch from the resourceVersion that was returned`, and the clearing half is
         what the `re-syncing` and `reset` chips carry. Both `sources` fetched live, 0 dead.
         The two ETCD lanes are the watch cache being filled, and they are labelled as such.
NAMING   The id carries the TITLE, `D-02` keeps the category prefix.
```
