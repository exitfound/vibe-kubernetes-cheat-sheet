# Scheme card design notes: cluster

The per-card design record for `js/schemes/cluster/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note below records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders. Anything that is NOT
one card (the catalog barrels, `js/lib/`, the kits, the CSS) is recorded in a JSDoc note beside
the code it describes, not in a document. None of them ships (`S-41`).

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`unit/docs.test.mjs` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `unit/docs.test.mjs` verifies every anchor still occurs in its card, so **an anchor is DATA:
never reword one** (`S-38`).

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM ranges 90 to 504 over
the standard viewport set, and it moves NON-MONOTONICALLY (`L-02`, `L-04`, `L-05`). So a `PANEL_B`
in a card is a measurement, not a convention. Re-measure after any prose change with `npm run
report` from `scheme/test/`, which prints the real extent per card, per step, over the three
viewports: several cards here carry a hard character ceiling and nothing in `npm test` enforces one
(`L-08`).

---

## cluster-admission-webhooks

### layout

```
WHAT     A write running the admission gauntlet: authn/authz, mutating, schema, validating, then the
         persist to ETCD. Five stages hanging off the API as one pipeline.
LAYOUT   The L read correctly. The panel owns the top-left, so API_X is 420 (first multiple of 20
         clear of the measured right edge 397) and kubectl sits in the freed BOTTOM-left. Both of
         its risers stand on KCTL_CX +/- LANE_DY, x=205 and x=235, INSIDE the panel's own column,
         and each turns once into the API's left face. A 397..420 corridor route is rejected: it
         reads as a zigzag, and what the shipped shape costs is measured in the OPEN entry below.
PANEL    bottom 230, measured. The nearest thing under the panel corner is kubectl at KCTL_Y 300,
         so 70 units of clearance.
WHY NOT  Chips four across at 258. The longest value is `{cpu=100m, sa=default, runAsNonRoot=true}`
         on the `Pod object` chip, 251.5 units rendered at 1100x800, and `valChip` anchors a value
         12 from the right, so at 258 it starts left of the chip. Two across at 490 is the floor
         here: there the value starts at 326.5 against a name ending at 173.3.
WHY NOT  Jogging each lane right into the 404..416 corridor before rising, to keep every segment out
         from under the panel. It reads as a zigzag: the single right angle is the shape that ships,
         and its cost is the OPEN entry below.
WHY NOT  Moving kubectl so its centre clears x=397: it collides with the ladder column at 420..820,
         or below the ladder with the chip strip at y=520. Widening it breaks the left-edge
         alignment the inset band exists to give. There is no third option, which is why this is
         written down rather than left to be rediscovered.
NOTE     ETCD is pulled 4 units inside BAND_R while the chips sit flush on it. That is an OPTICAL
         correction: flush, the two right edges differ by one antialiased pixel, yet the cylinder
         reads as overhanging because its right wall is straight while the chip is a rounded rect
         whose rx=4 pulls its own edge in. The inset IS that rx.
OPEN     Both kubectl risers run behind the overlay from the bottom up to their turn. Each lane is
         measured against the panel of the step that CARRIES it, never against one panel for both:
         KCTL_TO_API rides on `authn-authz` and API_TO_KCTL on `persist`, and those two steps do
         not have the same panel depth. The lanes are 430 and 370 units long, the panel right edge
         and the two bottoms are what the overlay report prints:
           1100x800  out  riser 144.8 + crossing 191.6 = 78% hidden   back  161.6 + 65.1 = 61%
           1280x860  out  riser  86.4 + crossing 172.8 = 60% hidden   back  142.8 + 35.2 = 48%
           1600x1000 out  riser  57.6 + crossing  85.8 = 33% hidden   back   55.8 + 10.1 = 18%
         So it is not the out lane alone and not its left third: on the two steps that carry these
         balls the reader sees a stub leaving kubectl and an arrowhead arriving beside the API, with
         most of the flight behind the overlay. Nothing measures this: OCCLUDED scores BLOCKS, never
         lanes or packets. Only at 1600x1000 is the greater part of both lanes in view.
         WHY NOT a staircase into the free 404..416 corridor: it reads as a zigzag. There is no
         third option, because the API face it must reach sits at y=85/115 above the panel bottom,
         and every kubectl position whose centre clears x=397 collides with the ladder column at
         420..820 or the chip strip at y=520. Reopening this means moving the API row.
BUDGET   The panel bottom is a LINE count, not a character count, and the card proves it against
         itself: at 1100x800 the authn-authz, mutating and validating steps carry 290, 338 and 284
         characters and all three measure the SAME 229.8, because all three wrap to 8 lines. So a
         character figure cannot be a budget here and none is stated anywhere on this card.
         The line pitch is 24.85 units and the panel chrome is 53.9, measured off the schema step
         at 4 lines / 130.4 against validating at 8 lines / 229.8. kubectl sits at y=300, so the
         panel reaches it at 11 lines and **10 lines is the ceiling**. Measure, never count, from
         `scheme/test` with
         `OVERLAY_IDS=cluster-admission-webhooks node --test report/overlay.test.mjs`
         and read the 1100x800 row it prints.
CONTENT  LimitRanger is named in BOTH the mutating and the validating steps, which is what the
         reference types it ("Mutating and Validating") and what cluster-resource-quota spells out.
         The validating step opens `LimitRanger is back to check min and max` so the repeat reads as
         deliberate rather than as a duplication bug.
         Row 3, the schema row, is `required fields and values checked`. It names neither TYPES nor
         `validate against OpenAPI schema`, and both omissions are deliberate: for a built-in kind
         the API server runs its own Go validation, an OpenAPI structural schema is what a CUSTOM
         resource is checked against, and a type error never reaches this stage at all because
         decoding the request body rejected it earlier. The narration is the same claim in prose,
         `a missing required field or a value outside its allowed range fails here`.
         ValidatingAdmissionPolicy is in the default-enabled list, so the validating stage has THREE
         paths and row 4 says "policies".
         The mutating step is the ONLY place failurePolicy is explained, and it has to be explained
         somewhere: the chip is standing, it lights on mutating and on validating, and the card
         `desc` that would otherwise carry the point is grid text a reader inside the dialog never
         sees. The clause is `Their failurePolicy decides whether a timeout blocks the write`, on
         the step where the first webhook appears.
         The Pod object goes `{cpu=100m}` to `{cpu=100m, sa=default, runAsNonRoot=true}`, one field
         per HALF of the mutating step: `sa=default` is ServiceAccount, one of the three always-on
         plugins the narration names, and `runAsNonRoot=true` is the policy webhook. With only the
         webhook field drawn, three named built-in plugins rewrite the Pod and leave no trace.
         The persist step says `every watch that MATCHES the new Pod`, never `every open watch`: a
         watch is scoped by resource, namespace and selector, so a watch on Services gets nothing.
         The qualifier is the whole fix (T-20) and the sentence must not lose it again.
         The `aria-label` describes the WRITE PATH, not "the admission chain". Only rows 2 to 4 are
         admission: row 1 is authn/authz, which step 1 itself puts BEFORE admission ("Admission runs
         after authentication, so every caller has an identity"), and row 5 is the
         persist. The box sublabel `admission pipeline` stays, and is not the same defect: it names
         what the API is doing in THIS card, cluster-resource-quota carries the identical sublabel
         on the identical box, and a heading over a block is not a claim about all five rows.
         Validating webhooks `call out over HTTPS`, not "over HTTP". The reference calls webhooks
         "HTTP callbacks" in prose, which is what the earlier wording leaned on, but the same page
         is absolute about the transport, in its own words `The scheme must be "https"` and `the
         URL must begin with "https://"`. The clause carries the OUT-OF-PROCESS half of a contrast
         drawn against `ValidatingAdmissionPolicy runs in process` in the same sentence, and HTTPS
         makes that point at one character more.
         https://kubernetes.io/docs/reference/access-authn-authz/extensible-admission-controllers/
         The validating step lights `objChip`, for the reason the schema step does: both stages
         check the object, so the object under check is lit beside the stage checking it. Lighting
         it on schema and leaving it dark on validating was the picture disagreeing with a narration
         that has LimitRanger checking min and max and ResourceQuota counting, both against that
         object. `failurePolicy` stays lit beside it because this stage is where webhooks are called.
         MutatingAdmissionPolicy is deliberately ABSENT from the mutating step and from row 2 at the
         `k8sVersion` this card declares. The gate is off by default there, and only there:
           MutatingAdmissionPolicy  false  Alpha  1.30  1.33
           MutatingAdmissionPolicy  false  Beta   1.34  1.35
           MutatingAdmissionPolicy  true   GA     1.36  -
         At 1.36 it is GA and on, "a declarative, in-process alternative to mutating admission
         webhooks", the exact mirror of what row 4 already says with "policies". So a bump of
         `k8sVersion` to 1.36 is not a metadata edit for this card: row 2 becomes `plugins, policies
         and webhooks` and the mutating narration gains a MutatingAdmissionPolicy clause, which fits,
         because that narration measures 8 lines against the 10-line ceiling the BUDGET note sets.
         Do not add it while the card says 1.35, and do not read its absence as an oversight.
         https://kubernetes.io/docs/reference/command-line-tools-reference/feature-gates/
         https://kubernetes.io/docs/reference/access-authn-authz/mutating-admission-policy/
         The watches and informers of the persist step are NARRATED and not drawn, deliberately: the
         sentence is about who learns of the write, and the card has no watcher block because the
         write path is what it draws. Adding one would put a sixth actor on a card whose subject is
         the five rungs.
CHECKED  2026-08-19, full fact pass, 24 claims, 19 against a fetched reference and none unverified.
         Confirmed and NOT to be re-litigated: authorizers run in configured order and the first to
         allow or to deny ends it, with 403 when none allows ("If any authorizer approves or denies
         a request, that decision is immediately returned and no other authorizer is consulted",
         https://kubernetes.io/docs/reference/access-authn-authz/authorization/, now cited in
         `sources` because step 1 leaned on a page the card did not name). ServiceAccount,
         LimitRanger and DefaultTolerationSeconds are all in the default-enabled list and all
         mutating. Mutation precedes validation ("Mutating admission webhooks are invoked first...
         After all object modifications are complete, and after the incoming object is validated by
         the API server, validating admission webhooks are invoked"), which is what carries both
         `all before validation` on the mutating step and `before any validating webhook runs` on
         the schema step. failurePolicy governs timeouts. ADDED is the watch event for a create, and
         201 Created is the create response, spelled the same way on cluster-object-create-path,
         cluster-server-side-apply and cluster-leader-election.
         A trap worth naming: a summarising fetch of the admission-controllers page reported
         LimitRanger as "Type: Validating" and the feature gate as beta-default-true at 1.35. Both
         are wrong, and both were caught by reading the raw page. Type lines and gate tables are
         parsed off the HTML on this card, never off a summary.
WHY NOT  A caption or a heading on the LADDER, saying the five rungs are the write path rather than
         five admission stages. REJECTED, and the ROOM is not the reason: the ladder runs y
         220..428, the chip strip starts at 520, and the panel is 230 deep at worst with its right
         edge at x<=397 against a ladder column at 420..820, so a caption at y=450 or at y=180 fits
         at every viewport. Three other things kill it. The catalogue draws 37 chain ladders and NOT
         ONE carries a caption. There is no text class for one: all 187 `P.wire` labels in the
         catalogue are blank at build and filled per step out of `wires` (T-29), which is what makes
         a `scheme-label` the name of traffic on its own lane (T-22), and the four standing text
         nodes outside that class are each a block label inside a drawn frame. And the pattern is
         not this card's: cluster-resource-quota hangs five rungs under the byte-identical `API` /
         `admission pipeline` box and its rung 5 is `persist  ·  the Pod object is written to ETCD`,
         as far outside admission as row 5 is here, so captioning one and leaving the other is the
         drift, and captioning both is a two-card change to close a scope statement the cards
         already make. The scope IS stated, in three places: the `aria-label` above, the numbering
         plus `chain: [i]` which makes the ladder a STEP INDEX rather than a taxonomy of admission,
         and step 1 opening `Already done, and not admission at all`. A second heading 40 units under a sublabel
         that says something else reads as a contradiction rather than as a clarification.
DO NOT   Write that the request "arrives authenticated, so admission never sees an anonymous caller",
         which is what step 1 said and is false. An anonymous request PASSES authentication, as
         system:anonymous in group system:unauthenticated, and anonymous access is ON BY DEFAULT
         whenever the authorization mode is anything other than AlwaysAllow, so admission sees
         anonymous callers routinely. What is true is the weaker claim the same sentence already
         opened with, and that is what it says now: admission runs after authentication, so every
         caller has an identity, even system:anonymous. The reference sentence that settles it:
         "A request providing no bearer token would be treated as an anonymous request." and
         "Anonymous access is enabled by default if an authorization mode other than AlwaysAllow is
         used". https://kubernetes.io/docs/reference/access-authn-authz/authentication/
NAMING   Every step opens by sorting its stage into `Built-in.` or `Pluggable plus built-in.`, and
         step 1 carries NEITHER. It opens `Already done, and not admission at all`, because the
         sorting is a statement about the admission pipeline and row 1 is not in it. Reading it as
         a gap and filling in `Built-in.` states something false as well: authentication takes
         webhook token authentication, JWT/OIDC, an authenticating reverse proxy and client-go
         credential plugins, and authorization takes a Webhook mode, so authn/authz is the MOST
         pluggable stage on the card. The absent label is what says row 1 is outside the taxonomy.
         https://kubernetes.io/docs/reference/access-authn-authz/authentication/
DO NOT   Name DefaultStorageClass as the always-on mutating example. It acts on
         PersistentVolumeClaims, and this card follows a Pod. DefaultTolerationSeconds is the one
         that applies.
DO NOT   Leave the Api box dark on mutating, schema and validating. Those three carry no packet, so
         with the Api unlit the only thing on screen is one ladder row, and the block whose pipeline
         the card is about reads as idle for half its length.
MOTION   The mutating, schema and validating steps carry NO flow at all. Everything they change is
         a static highlight: the Api, the ladder row and the chips. Measured with the card-review
         frame tool at 1600x1000, comparing each step frozen at 0 against the same step at half its
         span, those three steps differ by 0 pixels and the two ball-carrying steps by 2150 and
         1763. Nothing on them moves, by construction.
DO NOT   Put `F.flash({ targets: ['api'] })` back on those three steps. `flashChips` is implemented
         as `filter: brightness(1) -> 1.55 -> 1` over 600ms on the box GROUP, so it brightens and
         dims the frame, the `API` label and the `admission pipeline` sublabel together: that is a
         block PULSE, which `M-01` forbids on infrastructure, and its peak of 1.55 is brighter than
         the 1.4 of the Pod pulse that `M-01` reserves as the only pulse on a card. `M-27` reads as
         permission for it, and the two rows disagree; on this card `M-01` wins and the beat is the
         `.highlight` that the same `M-27` names first.
         It also cannot be seen in a still. The flash is 600ms and those steps had a span of 600ms,
         so a frame at half span sits at peak brightness and a frame at 95 percent is still lit,
         and both read as an ordinary static highlight. Only a frame at 0 compared against one
         mid-span shows it, which is why the frame tool now takes 0 as well.
         Every `duration` here is sized off READING LOAD, which is the one thing on a card that has
         no machine at all. Measured with the card-review timing probe, the catalogue median is
         10.14 ms per narration character over 532 steps, and the five steps here sit at 9.66,
         10.06, 9.83, 9.51 and 14.47, ranks 217 to 471. Sizing the three flash steps off the flash
         instead puts two of them at 5.99 and 6.20, inside the most hurried 8 percent of the whole
         catalogue, which is what a reader pays for a duration chosen by the motion.
         DO NOT read `span <= duration` (`M-19`) as the constraint that fixes these numbers. It is
         a floor and only persist comes near it, at span 2982 against 3300. That margin of 318 is
         also what a geometry change spends first, because `routeDur` is length-based (`A-11`).
WIRE LABELS
         Four labels, one per drawn exchange, and every one of them names traffic that rides THAT
         lane (`T-22`). `req` sits above the Api because the request is what the Api received.
         `write` and `commit` stack in the 136-unit gutter between the Api right edge at 820 and
         the cylinder left edge at 956, `write` above the out lane at y=85 and `commit` below the
         back lane at y=115, measured 73.6 and 61.3 units wide at 1100x800 against that gutter.
         `resp` sits under kubectl. Three balls fly on the persist step and all three are named.
```

### poster

```
Sentence: the object that reaches storage is not the object that was sent, and the gates are what
rewrote it.

Chain of stages, but the rhythm is the CONTENT of a repeated block rather than a glyph per stage.
One 72 x 76 object block drawn three times on the baseline at x=8, 124 and 240, carrying one, two
and three accent bars stacked upward from y=110.5 at a 12-unit pitch. Two 22 x 92 dashed slots at
x=91 and x=207 stand between them, overhanging the blocks by 8 above and below so the object reads
as passing THROUGH rather than past. Fills ramp 0.04 / 0.05 / 0.08 and the last block alone takes
stroke-width 2. The accent is the newest bar, the one the last gate added, at 0.9 against 0.28 on
the five it inherited. No cylinder, no kubectl, no ladder, no API frame.

This replaced a four-element chain (request box, dashed mutating gate with a squiggle, dashed
validating gate with a tick, etcd cylinder) whose emphasis was FLAT, all four at 0.04 to 0.06. On
the category sheet that made it the dimmest poster of the 21 and the only one with no accent, and
its silhouette repeated cluster-object-create-path next door: small boxes on one axis joined by
dashes. The old note recorded the reason as an open question, whether a poster whose subject is a
PAIR can take the single-brightest treatment at all. The answer taken here is that it cannot, and
that the fix is a different SENTENCE rather than a brighter pair. The old poster answered "is it
allowed", which is the whole subject of cluster-resource-quota one card to the right, and the break
vocabulary it would need is already spent twice in this category on cluster-pod-priority-preemption
and cluster-node-pressure-eviction. The rewrite sentence is unheld by any sibling and it is the
second half of the card `desc` question, "and how it looks".

DO NOT drop the inherited bars to the 0.14 that cluster-object-create-path uses for its losers.
Counting them IS the sentence here, and below about 0.25 the growth stops reading at grid size while
the accent gains nothing. 0.28 was set against the 200px render, not the montage.

The nearest neighbour in silhouette is cluster-server-side-apply, also three blocks with one bright
bar. It is not adjacent, and the two separate on the ramp: that poster accents the CONTESTED middle
and its outer blocks are equal, this one accumulates left to right and accents the end.
```

---

## cluster-api-structure

### layout

```
WHAT     How a controller sees the cluster: discovery, an initial LIST served from the API's watch
         cache, then a watch stream filling an informer and its indexer.
PANEL    291/125, 319/143, 378/150, 397/180 over 1600 / 1440 / 1280 / 1100. 180 is the floor the
         left column starts under.
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
         The two ETCD lanes are the watch cache being filled, and they are labelled as such.
NOTE     The 410 step is a conditional aside (its sentence opens with If), so the coda puts the
         informer back into the steady state `event` left it in. Without that the coda runs under
         `410 Gone . re-listing`, the previous step leaking into a summary about CRDs.
NOT A DEFECT
         `render/chipfit.test.mjs` is silent on `eventSlot`, which draws two STACKED texts rather than a
         name/value pair. The tool skips chips whose two texts sit on different baselines.
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
```

### poster

```
Three stacked 160 x 22 rows on the left standing for the listed objects, three short dashed legs off
their right edges, and six dots trailing away to the right in two sizes and three opacities, the
stream of later changes arriving over the open watch.

OPEN, and known: at grid size this reads as rectangles joined by dashes, the same silhouette as
cluster-server-side-apply, and the 2 and 2.5 radius dots are near-invisible at the ~200px the grid
renders. A pipe version (API block, cache block, one long horizontal channel carrying four event
cells) is declined. Rework FROM the shape above rather than replacing it with the pipe.
```

## cluster-object-create-path

### layout

```
WHAT     A manifest becoming a running Pod. Every handoff AFTER the write is one component reacting
         to a change on its own watch rather than a call, UNTIL the Kubelet drives the Runtime over
         CRI, which is a call and is drawn as one. The clause is not optional: without it the
         sentence is an absolute the card's own last step contradicts, and the `CONTENT` line below
         keeps the Kubelet the caller of every CRI call.
PANEL    x 291 / 378 / 397, bottom 160 / 193 / 230 on the worst step, which is `post` at 1100x800,
         measured against the current narration. The first block under it is the controller-manager
         at 328, so 98.2 units of slack at the worst viewport. The narrowest viewport is the one
         that does NOT move when the `post` narration grows: it already wraps to the same line
         count, so a prose edit shows up on the two WIDER heights first. Re-measure on all three heights after
         any narration edit: the bottom swings with the line count and the line count swings with
         the viewport WIDTH.
MOTION   The durations are sized off READING LOAD, not off the motion: 3000 / 2200 / 3000 / 4400 /
         2900 / 2400 / 3300 against narrations of 304 / 202 / 195 / 270 / 265 / 183 / 251
         characters, a band of 9.9 to 16.3 ms per character. Only `span <= duration` has a machine
         (`M-19`) and it is not the constraint here: the longest chain, `controller`, ends 180 ms
         before its step does. `persist` sits at 2200 and reads at 10.9. DO NOT drop it back to
         1700, where it reads at 8.4 against the 16.3 of the step beside it, the widest spread the
         card can carry. NOT HARMONISED with cluster-architecture, which holds 8.2 to 9.4. The two
         sisters agree on rows and columns and not on pace. Re-timing all seven to the tighter band
         is available and costs nothing but the floor each step's span sets.
DO NOT   Swap which side of each face the client pair takes. The out lane runs on the upper level 50
         and the return on the lower 70, so an out vertical standing LEFT of where the return turns
         down cuts through the return horizontal. At the client the out lane takes the OUTER slot and
         the return the inner one; at the frame it is the mirror. Both pairs straddle their own face
         midpoint.
NOTE     The lanes are addressed to the CONTROL PLANE, not to the API, exactly as the Node lane is
         addressed to the Node. What receives the POST inside is still the API, which is why it
         lights on arrival: it is the door rather than a stop along the way.
NOTE     The Node lane is TWO points with no turn: [[CX, TOP_BOTTOM], [CX, NODE_Y]], leaving
         the API bottom face midpoint and landing on the Node frame TOP face midpoint, both 600 for
         free. Any jog reads as addressed to the KUBELET, where what it carries is a watch stream
         arriving at the NODE.
NOTE     `create-pod` is one of only TWO steps in the whole category that declare `reducedLit`. Its
         animated path pulses the placedPod WRAPPER and lights no inner block, so `flowLights` has
         nothing to derive from it and the static path would show the step with no cue at all:
         `placedPodBox` is what the reduced branch says instead of the pulse it cannot show.
         The census that makes this a deviation rather than a habit, measured over the 21 migrated
         cards on 2026-08-08: 137 steps, 100 of them carry a `flow`, and on 24 of those 100 the
         derived guard lights NOTHING. Only two of those steps need a stand-in, this one and `rank`
         on cluster-node-pressure-eviction. So a derived guard that lights nothing is the ordinary
         case and is not by itself a finding: the question is only whether the step carries a cue
         the reduced path has no other way to show.
WHY NOT  Giving the client the API's 220 width. The band outside the wall is 150 units and 130 is
         that band minus two 10 unit margins. Widening needs the frames moved, which carries the
         centring, or a wider viewBox: the viewBox width available is 1200 at 1280x860 and below, so
         there is slack only while the dialog is wider than about 1.88:1, 39 units at 1600x1000. +90
         shrinks the whole card by 7% at 1280x860, and R-viewbox holds all 108 cards on 0 0 1200 640.
OPEN     CENTRE reports content 150..1190 centred on 670, CENTRE-LOW 170..1190 centred on 680: the
         same complaint with the frame walls left out. Both are the client hanging off the right of
         a composition centred on the frames. DO NOT close them by re-centring: it drags the frames
         off 600, which is what keeps the Node lane one straight segment. CENTRE-LOW judges against
         the panel bottom of ONE viewport, 143 at 1600x1000, and the report says so itself: at the
         worst-of-three bottom, 230, the finding drops.
OPEN     The stack sits low because ETCD once held the LEFT slot, in the panel's column. ETCD is back
         on the right and nothing on either card sits in that column now, so the drop is unpaid for
         on BOTH cards. What it still buys is that the two cards agree in both axes. Raising the rows
         is available and is a TIMING change, because routeDur is length-based.
NOTE     The row INSIDE the Node frame is `NODE_Y + 41`, which gives architecture's two watch labels
         tier 2's 20 unit gap, and both cards hold it. Nothing here is timed off it: every hop in
         the Node band is horizontal, so no span moved. Restoring 47 on one card only is what breaks
         the pair.
CONTENT  Server-side Apply is `the same PATCH under its own content type`, not `a verb of its own`.
         Server-Side Apply names the operations in field-management scope as `Server-Side Apply
         (HTTP PATCH, with content type application/apply-patch+yaml)`, so there is no APPLY method
         at the protocol level, and `cluster-server-side-apply` opens on that exact wording: `a
         PATCH sent with the content type application/apply-patch+yaml`. The two cards sit two
         apart and have to tell one story.
         `checks RBAC` names the default authorizer where the mechanism is authorization. The
         counter-cases are real (Node, webhook, ABAC) and the wording is KEPT anyway: RBAC is on in
         every cluster a reader of this card has, and `cluster-admission-webhooks` owns the generic
         chain. DO NOT widen it to `checks authorization`, which says less than the card knows.
         The Pod is NAMED from `controller` on and DRAWN from `create-pod`. That is not a gap: the
         block is the Pod RUNNING on Node-1, and the API reference is explicit that a Pod with an
         empty `spec.nodeName` `is a candidate for scheduling`, so drawing it inside the Node frame
         before the Binding lands would state a placement that has not happened.
         The HTTP mechanics: POST to the collection path on a create, 201 Created back, a THREE-WAY
         MERGE PATCH on an object that already exists (which is client-side apply, and naming it
         that way is what keeps the pointer to Server-side Apply from reading as the same verb), the
         field selector spec.nodeName, the binding subresource, watch event type ADDED, and the name
         chain my-app -> my-app-7d4 -> my-app-7d4-abc.
         The controller step animates FOUR balls, not one out-and-back: watch the Deployment, create
         the ReplicaSet, watch the ReplicaSet, create the Pod. The narration names TWO handoffs by
         TWO controllers and the desc makes it the card's whole point.
         The create-pod step draws the Runtime as a block and takes TWO hops, CRI from the Kubelet
         then the container coming up into the Pod. One ball Kubelet-to-Pod reads as the Kubelet
         creating the container itself. The narration keeps the KUBELET the caller of every CRI
         call, which is what cluster-pod-sandbox-cri spells out call by call: a Runtime that pulls
         and starts on its own contradicts that card.
BUDGET   The tier-2 label slots are floored by the two COLUMN walls at 170 and 1030, so a label
         centred on 280 or on 920 may run 110 either way: 220 units, and at 6.89 per character that
         is a ceiling of 31, with a 32nd touching the wall. MEASURED at 1600x1000, their widest:
         `POST .../binding . node=Node-1` is 206.7 on 816.6..1023.4, 6.6 inside the right wall at
         30 characters. The controller-manager slot is over that ceiling: `watch ADDED Deployment
         my-app` is 199.8 on 180.1..379.9, but the string the `F.set` TURNS IT OVER TO,
         `watch ADDED ReplicaSet my-app-7d4`, is 227.4 on 166.3..393.7 at 33 characters, so it
         overhangs the column wall by 3.7 a side. No repair is called for: it is still 16.3 inside
         the FRAME wall at 150 and reads clean. The number is here because the slot is already over
         its ceiling, so the next string put in it starts from 33 and not from zero.
         **No frame shows that string.** `frames.mjs` seeks the animated path, which applies
         `rewind` and never fires the turnover (`M-35`), so every rendered frame of step 4 carries
         the SHORTER label while a reader watching the step sees the longer one for 2.5 of its 4.4
         seconds. Measure this slot on the REDUCED path (`gotoStep(4)`), where `wires` states the
         end value above the guard, and nowhere else.
NOTE     ETCD is drawn ONCE, as one round trip over the `persist` and `etcd-response` steps, and is
         dark for the four steps after it. Every later write lands there too, the ReplicaSet, the
         Pod and the Binding, so the `schedule` step says that in WORDS. Four more round trips to
         the right-hand cylinder is a picture about storage, and the card is about who reacts to
         whom.
NOTE     The two client labels share ONE register, `KCTL_LABEL_Y`, over the OUT lane, while the ETCD
         pair splits its own, the request above the out lane and the ack below the back one. That
         asymmetry is forced: under the client return lane there are 20 units to the frame top at
         90, so an ack register there would sit on the frame. The two never show on one step.
OPEN     The CONTROL PLANE frame label at (162, 108) is covered by the panel on every measured
         viewport, exactly as on cluster-architecture, and for the same reason: the panel is 291
         wide at its narrowest and the label starts at 162. Same author decision, same reason
         OCCLUDED cannot report it, and the same instruction not to fix it by cutting narrations.
DO NOT   Promise a status report back from the Node. The card draws no lane from the Node to the API,
         and adding one means splitting the straight API-to-Node spine into a mirrored pair.
NAMING   Titled `Object Create Path`. A CLI verb names one step of seven, and
         `Kubectl Apply` beside `Server-side Apply` two cards away invites the reader to guess which
         is which. `Watch` or `Reconcile` was rejected: the catalog already holds `List-Watch and
         Informers` and `Kubelet Reconcile Loop`. app.js searches title + desc, so the desc keeps
         "between kubectl apply and a running Pod".
         The id carries the title and not the CLI verb, for the reason above: the id is the name a
         reader meets in the file tree and in a deep link. `D-02` is why the category prefix stays.
         `control-plane-apply-flow` and `cluster-apply-flow` both resolve through `SCHEME_ALIASES`,
         which is two of the 30 the census in `unit/catalog.test.mjs` pins.
```

### poster

```
Sentence: two things come in, one Pod comes out.

SHIPPED, and this block describes what posters.js draws. Four 76 x 44 blocks: two on the left at
(14, 22) and (14, 114), one at (122, 68), one at (230, 68). Each left block sends a dashed leg out
of its right face at its own middle (44 and 136), turns at x=106 onto the centre line y=90 and
enters the middle block, so the two legs MERGE. A straight dashed leg then runs 198 to 230 into the
last block. Only that last block is lit (0.10 against 0.04) and only it carries its accent bar at
0.9, the other three at 0.14: the sentence is about what the chain PRODUCES.

Do not read the geometry of a poster out of this file without opening posters.js.

DO NOT go back to a row of boxes on one horizontal axis. That version was indistinguishable from
cluster-delete-flow on the grid, and the mirror-of-delete-flow idea behind it (fills rising against
fills falling) is invisible at grid size.
```

### before `    P.box({ key: 'client', x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl' }),`

```
The only block not in a frame, and both of its numbers are solved rather than chosen. KCTL_X is
FRAME_R + 10, KCTL_W is the band minus two such margins (130, also ETCD's width, so the two blocks
flanking the frame read at one scale), KCTL_Y is CP_CY - BOX_H / 2 so the block is centred on the
wall its lanes address. DO NOT hardcode either: a literal would survive the next frame move.
```

### before `const WIRE_REQ_Y = OUT_Y - 12, WIRE_ACK_Y = BACK_Y + 18;     // 158 / 208`

```
Two registers for the ETCD pair, both BETWEEN the blocks: the request above its out lane at 158, the
ack below its return lane at 208, both centred on ETCD_GAP_CX 805, the middle of the 190 unit gap.
MEASURED at 1600x1000 after document.fonts.ready, `write Deployment my-app` is 158.5 on 725.8..884.2
and `ack . rv=842` is 82.7 on 763.7..846.3, so the wider of the two clears the API on 710 and the
cylinder on 900 by 15.8 a side. Both are 6.89 per character to the decimal, which is the `L-20`
rate. MEASURE AFTER document.fonts.ready: a read taken in the fallback face comes back about 3.5
percent low and reproduces on no viewport.

The CLIENT pair cannot use this register: its lanes are 100 units above the row, in the band over the
frame. Its two labels share ONE register at y=34, centred at 862 on the level run they ride, and they
can share it because they never share a step (POST is step 1, the 201 is step 3). WHY NOT inside the
frame at the lane heights: they cross the two Scheduler lanes turning at 264 and 284. WHY NOT hugging
the client's own faces: the climbing verticals cross them. Both were wrong on the render, not in the
source.
```

### before `const { out: JOG_DOWN, back: JOG_UP } = laneY(BAND_CY, D10);   // 264 / 284`

```
Each tier-2 box carries a mirrored pair on its top face: watch out on the outer lane at JOG_DOWN,
write back on the inner lane at JOG_UP, so the two never cross.

BOTH LEVELS ARE DERIVED FROM THE BAND, not offset from the row above. BAND_CY is the exact middle of
the gap, so the pair re-centres whenever either row moves. The band is 108 units, half again the 80
architecture carries, and at that depth a fixed +40 / +60 glues both lanes to the API and leaves dead
air under them.

BOTH halves of the controller-manager pair are drawn. The `controller` step narrates two creates back
to the API, so a watch with no write would teach a different rule from the very next step, which
draws both halves of the identical shape for the Scheduler.
```

## cluster-architecture

### layout

```
WHAT     The moving parts of a cluster and who talks to whom: control plane over a Node, with every
         controller watching the API and never ETCD.
NOTE     ETCD right-aligns on 1030, the Scheduler's right edge, rather than centring on the Scheduler
         axis at 920. The card is three columns whose outer walls are 170 and 1030, and a centred
         cylinder would sit at 855..985, breaking that wall to line up an axis nobody can see. It
         also costs the ETCD write label its home: that string measures 179.2 units and the gap to
         a cylinder starting at 855 is 145.
NOTE     A frame move under about 25 units is not a visible change: 10 viewBox units is about 12
         rendered pixels on a 1600 wide dialog.
PANEL    bottom 125.11 at 1600x1000 to 254.66 at 1100x800, deepest on the node-side step, measured
         against the current narration. The nearest thing under the panel corner is the tier-2 row
         at 328, so 73 units of clearance at the worst. The right edge 396.55 at 1100x800 is the
         CATALOG worst and the number `L-02` records, and it is geometry rather than prose: it does
         not move when a narration is rewritten.
MOTION   The durations are sized off READING LOAD, not off the motion: 2800 / 2300 / 2600 / 2600 /
         2400 / 2600 / 3400 against narrations of 314 / 246 / 281 / 291 / 294 / 300 / 366 characters
         as the panel renders them, a band of 8.2 to 9.4 ms per character against a catalog median
         of 10.2 over 532 steps. The api step carries NO motion at all, so its duration is the whole
         hold a reader gets. Only `span <= duration` has a machine (`M-19`), and it passed at 1700
         on three steps that were unreadable at that speed.
LANES    The two tier-2 levels are DERIVED from BAND_CY, D10 either side, so the pair re-centres
         whenever a row moves. The band is 108 units and a fixed +40 / +60 glues both levels to the
         API and leaves dead air under them.
NOTE     The two Node-bound lanes end ON their target box (Kubelet top midpoint 600, kube-proxy 920),
         not on the Node frame edge. That is the OPPOSITE call from the four cluster Node cards,
         where a lane stops on the frame because the Pod row changes step to step and the pulse
         carries which Pod reacts. Here there are no Pods and nothing pulses, so a lane stopping on
         the frame would point at three boxes at once.
NOTE     One lane crossing is accepted: API_TO_KPROXY turns down at x=760 from y=180 and crosses the
         ETCD read lane at (760, 190). Nothing scores a lane against a lane, and the alternative
         takes the kube-proxy lane off the API face midpoint, which OFFEDGE does score.
LANES    THE TWO GROUPS TAKE DIFFERENT TREATMENTS, and that asymmetry must not be "fixed" into
         symmetry. A control-plane lane out of play DIMS to OPACITY.notready (outside this path) and
         stays on screen, because the control plane is what the card is about and its shape should
         not flicker. A Node-bound lane out of play is NOT DRAWN at all: the card spends six steps
         inside the control plane, and a permanent pair crossing into the Node band reads as traffic
         that is not happening.
NOT A DEFECT
         Several lanes carry no ball on a given step, and a grep for a constant name will say they
         carry none at all. They do: the card shows one half at a time, so a lane idle on the step
         you are reading is ridden on another one.
WIRE LABELS
         Eight, and none can sit in the band under the API: the two Node-bound lanes run vertical
         corridors at x=440 and x=760 straight through it, and four of them had a dashed lane
         drawn through the string. `render/geometry.test.mjs` cannot see any of it, because THROUGH
         scores lanes against BLOCKS and a text is not a block. They live in the two bands the
         corridors do not reach: T2_BELOW, one under each tier-2 box (440 and 760 fall in the gaps
         between those three strings), and T3_BELOW under the Runtime, the Kubelet and kube-proxy,
         the tier-2 rhythm repeated inside the Node frame. A watch label belongs next to the
         component doing the watching, and the CRI label under the Runtime the Kubelet drives.
         The three tier-3 strings MEASURE 151.6, 227.4 and 213.6 units at 1600x1000, their widest,
         on centres 280, 600 and 920: they span 204.2..355.8, 486.3..713.7 and 813.2..1026.8, the
         tightest gap between two of them is 99.5, and the row ends 3.2 inside the 1030 column wall
         and 23.2 inside the frame wall on 1050. All three shrink on a narrower viewport.
         The tier-2 row is floored by the cloud label, 303.2 units at 1600x1000 on 448.4..751.6,
         which clears the x=440 and x=760 corridors by 8.4 a side. 46 characters is the ceiling
         there and a 47th crosses both corridors, against 44 today. That margin is INSURANCE and
         not a live clearance: the tier-2 labels and the Node corridors are never on screen
         together, because the Node lanes sit at opacity 0 for the six control-plane steps and the
         tier-2 labels are cleared by the prologue on the node-side step.
DO NOT   Put a label under the API at (CM_CX + 135, 186). That is inside the panel's column, and the
         panel is widest and DEEPEST on the SMALLEST viewport because a narrower panel wraps into
         more lines: one line is 25 viewBox units, five lines bottom 155, six 180. A six-line
         controllers step then renders `watch . reconcile loop` half behind the panel, and OCCLUDED
         reports the card clean either way.
OPEN     The CONTROL PLANE frame label keeps the LEFT top corner at (162, 108), where `node()`
         prints it and where the rest of the catalog draws a frame label, and the panel covers that
         corner on EVERY measured viewport (worst x<=397 y<=254.66, best x<=291 y<=125.11). So the
         string is the one thing on the card that is INVISIBLE rather than dimmed, by author
         decision, and OCCLUDED cannot report it because the rule excludes node frames.
         DO NOT move it to the right corner through the `tune` escape: the overlap is to be fixed at
         the panel and the scale, not by walking the label around the frame.
WHY NOT  Shortening the narrations to pull the panel off the left corner: even a ONE line panel
         reaches x<=291, which still covers x=162 onward. There is no prose that fixes it.
CONTENT  Every claim on this card is checked against the two pages it cites. Components carries the
         `(optional)` marks on cloud-controller-manager and on kube-proxy and the one-line job of
         each component. Architecture carries `kube-apiserver is designed to scale horizontally`,
         the three cloud-controller-manager controllers (Node, Route, Service), `If you use a
         network plugin that implements packet forwarding for Services by itself ... you do not
         need to run kube-proxy`, and `A scheduler watches for newly created Pods that have no Node
         assigned`. `spec.nodeName` is the API reference wording: empty means `a candidate for
         scheduling`, set means `the kubelet for this node becomes responsible`.
         cloud-controller-manager carries the sublabel `optional` and the narration says a cluster on
         your own hardware has none, which is what Components lists literally. kube-proxy is optional
         upstream too, but that is said in WORDS: a second `optional` sublabel in the same drawing
         reads as a pattern rather than as a fact.
         The API is "the only way in for clients and controllers", not "the only entry point":
         cluster-static-pods exists to show the path that skips it.
         The Scheduler's one write is "on the ordinary path", because preemption also deletes.
         The cloud lane is labelled `watch Nodes and Services . write status back`, which is what
         actually rides it. No provider is drawn, so a label naming a provider call was promising a
         call the card does not draw. BOTH watches are named because the right half writes Service
         status: naming the Nodes watch alone asks for a read the left half does not have.
         Architecture gives the cloud-controller-manager three controllers, Node, Route and
         Service, and the Service one watches Services to write the load balancer status back.
         The controller-manager runs `the built-in control loops, roughly one per resource kind`,
         not one loop per kind flat: the garbage collector works across every kind, and namespace
         and node-lifecycle are per mechanism rather than per kind.
         ETCD `holds the cluster state the API serves, and in a standard cluster the API is the
         only client it has`, not `the only durable store in the cluster`: an aggregated API server
         brings storage of its own, and events can be split onto a second instance (`T-19`).
         The `desc` in cards.js carries THAT SAME qualifier and has to keep it: unqualified, the
         grid tile states an absolute the step behind it does not. It ends `while in a standard
         cluster only the API talks to ETCD`, and the opening question is short by `to each other`
         to pay for the clause: 458 characters against the 470 hard ceiling and the 460 target top
         of `D-04`, so there is no room to spend twice. No machine reads this: `T-19` over
         descriptions only prints, and this card sits in its `only` row either way.
         The Kubelet also `PATCHes Pod status back`, said in WORDS on the node-side step. It is the
         observed half every loop above compares against, and with no lane drawn for it the card
         showed desired state travelling down and nothing coming back.
BUDGET   The two ETCD strings live in the 190 unit gap between the API on 710 and the cylinder on
         900, on the centre line 805. MEASURED at 1600x1000, their widest, `write . Raft quorum
         commit` is 179.2 wide at 715.4..894.6: 26 characters clear each wall by 5.4, 27 is the
         CEILING and a 28th touches both. MEASURE IT AFTER document.fonts.ready. The same string
         reads 173.6 in the fallback face, which is what a measurement taken before
         `document.fonts.ready` returns.
SCOPE    The Kubelet status PATCH is narrated here and DRAWN by cluster-kubelet-sync-loop. The CRI
         call is one ball and one label here, and the RunPodSandbox to StartContainer sequence
         behind it is cluster-pod-sandbox-cri.
         No CLIENT is drawn, and the first step names one (`the only way in for clients and
         controllers`). That is scope and not an omission: six of the seven steps stand inside the
         control plane, and the sister card on this exact grid, cluster-object-create-path, is the one that
         draws the client, in the 150 unit band right of the frame at 1060..1190 which this card
         leaves empty on purpose. Filling that slot here moves the subject of the card.
NOTE     KUBELET_TO_RUNTIME is a ROUTE, not a relationship, because the last step says the Kubelet
         CALLS the Runtime over CRI. Two things follow. It runs Kubelet to Runtime WITH the ball: a
         relationPath the other way carries no arrowhead to contradict it, and a ball on those points
         travels backwards against the sentence. And the Runtime lights on the CRI ball landing, not
         at the Kubelet's own arrival, or the picture says the API lit them both while the words say
         the Kubelet drove one. Nothing in the gate sees either.
```

### poster

```
Reverted to the original by author preference. See cluster-api-structure and
cluster-server-side-apply for the stack-of-rows family this belongs to.
```

## cluster-delete-flow

### layout

```
WHAT     A cascading delete: deletionTimestamp and a finalizer instead of removal, the Garbage
         collector walking ownerReferences, and the finalizers clearing up the chain.
LAYOUT   The two bands are deliberately unequal (110 above tier 2, 60 below) and NOT a rhythm to even
         out: tier 2 cannot rise because the panel reaches 282, and band 1 holds a lane pair AND both
         tier-2 wire labels while band 2 holds one label and no lane turn at all.
PANEL    x<=397 on every step, bottom reaching 282 on gc-cascade, the deepest narration in the pair.
OPEN     TOP_Y 110 is as low as the row can go: below it sit band 1, tier 2, band 2 and the Node
         frame, and tier 2 cannot rise. So kubectl at 170..330 and the two labels in the left gap are
         inside the panel's column and are COVERED rather than clipped. Taken knowingly, the same
         trade as cluster-object-create-path. WHY NOT keeping the top row right of the panel (420..1080): it
         centres nothing, the row sits 150 units right of the centre the Node frame sets, and the
         whole drawing leans.
NOTE     WHICH LANE GETS WHICH SLOT on the API's bottom face (540 / 590 / 610 / 630 / 660) is FORCED,
         not chosen. Every lane except the Node pair turns and runs horizontally through band 1, so
         each has to leave the face OUTSIDE the pair or it cuts across one of the two verticals
         dropping to the frame. The Node pair therefore takes the two innermost slots, at
         API_CX +/- LANE_DY. Verified by a probe intersecting every horizontal segment against every
         vertical one: ZERO lane crossings.
WHY NOT  FROM_GC on the midpoint at 600 with the Node return at 630. The Garbage collector is on the
         RIGHT, so its return runs leftwards to reach 600 and crosses whatever descends at 630.
WHY NOT  Swapping them so the Node return takes the midpoint. That kills the crossing and pays with a
         30 unit jog on FROM_NODE, the only turn on the only straight run of the card, sitting in an
         otherwise empty band where nothing explains it.
NOTE     OFFEDGE stays quiet through all of this NOT because every endpoint is paired or centred, but
         because of the face-fraction exemption: 18% of a 220 wide API is 39 units, so 590 / 610 /
         630 are out of its reach and only the 540 / 660 pair needs its mirror.
NOTE     The Node pair addresses the Node frame's TOP face, not the Kubelet's. A watch stream arrives
         at a Node and a status report leaves one; what the Kubelet does about it is drawn INSIDE the
         frame on its own step, along STOP_POD. The API, the frame and the canvas share one centre,
         so a pair straddling it by LANE_DY is vertical at BOTH ends.
WIRE LABELS
         Both band-1 labels are centred on the midpoint of the horizontal run they name, and they are
         NOT on one register: wireController sits 8 above the OUT lane at 229, wireGc 14 below the
         BACK lane at 267.
         DO NOT put both on the out register to make them read as a matched pair. Every string wireGc
         holds names BACK traffic, and a label on a lane names the traffic on THAT lane: a reader who
         takes `DELETE replicasets . pods` off the TO_GC lane reads the API as issuing the DELETEs to
         the Garbage collector, which is backwards. wireGc stays centred on the FROM_GC run (630..890)
         rather than parked over the Garbage collector box.
         The top row splits its two registers by WIDTH: acks go between the blocks (`HTTP 202
         Accepted` is 115 against a 190 gap), requests cannot (287 and 213), so requests ride ABOVE
         the row.
NOTE     The Garbage collector carries the sublabel `in controller-manager`. Two same-size boxes on
         one tier with no frame assert that it is a PEER of the controller-manager; it is a controller
         inside it. The sublabel costs nothing where words would cost the drawing 18 units.
CONTENT  Step 2 says the Deployment is "marked for deletion", not "Terminating": Terminating is a Pod
         PHASE word and a Deployment carrying a deletionTimestamp has no such phase.
         Step 5 streams the event "down that watch to Node-1", so the sentence ends where the lane
         does.
         Step 6 starts the grace budget at the delete and puts SIGTERM inside it, because the Graceful
         Pod Shutdown card this step points at says the budget "starts counting at the delete and is
         spent in two parts". Both cannot be true.
NAMING   Titled `Cascading Deletion and Finalizers`; `cascading deletion` is the term kubernetes.io
         uses. The desc opens "You run kubectl delete and the prompt returns at once, so why is the
         object still there?" because app.js searches title + desc and the old title was the only
         place `kubectl delete` appeared.
```

### poster

```
Sentence: the owner goes first and the dependents follow one by one.

A cascade of fading. One 96 x 42 owner block on top, drawn dashed at fill 0.03 and opacity 0.12
because it is ALREADY GONE: the poster opens after the delete. Three 80 x 52 dependents below,
reached by three dashed legs in the catalog L form. The three accent bars fall 0.9 then 0.4 then
0.12 left to right, and the third block is dashed at 0.12 to match the owner, so the row reads as a
wave of deletion travelling along it and arriving.

That gradient of ghosts appears nowhere else in the catalog, and it is what separates this from
cluster-scheduler-decision, the same one-over-three composition: that poster is about CHOOSING, this
one about DISAPPEARING.

0.12 was checked on the grid at 100%, not on a montage. DO NOT raise it to look more like the
siblings, and do not lower it.
```

### before `    P.cylinder({ key: 'etcd', x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD' }),`

```
ETCD is w=130 so the label is not lost in a squat-wide cylinder and the two control-plane cards
match. Top and height (y=100, h=100) keep its centre on 150, level with the API row, and leave the
top wire labels their clearance above the cap.
```

### before `    P.lane({ points: DELETE,      dim: true, dashed: true }),`

```
Every lane is drawn here, each from the SAME points array its ball rides.

`unit/docs.test.mjs` verifies that an anchor points at code that still exists, NEVER that the sentence under
it is about that code. This anchor and its twin on cluster-object-create-path both carried a note about a
different lane for exactly that reason.
```

## cluster-resource-quota

### layout

```
WHAT     A namespace budget that ACCUMULATES, which separates it from cluster-node-allocatable next
         door: there a Node capacity is carved into pieces taken AWAY, here the bar IS spec.hard and
         the slots fill it left to right, so the refused request is drawn PAST the bar edge.
LAYOUT   There is no node() frame: a quota is a namespace fact and namespaces have no frame
         primitive, so the bar caption carries the namespace instead.
NOTE     Why hard is requests.cpu 1 and every Pod asks 500m: the numbers come off the LimitRange
         page's own worked example, so the injected default IS the arithmetic and step 2 is
         load-bearing. Two 500m Pods land exactly on the ceiling, which is why admit animates TWO
         beats. There is no set of equal requests that rejects on the second Pod without leaving the
         first short of the ceiling.
WHY NOT  Three actors at the family 232 in the top row: 3 x 232 + 2 x 56 is 808 against the 720 units
         right of the panel. The fix was not to shrink the family. LimitRange is an OBJECT, nothing
         travels to or from it on any step, so it left the row and the two that remain are at 232.
NOTE     The gap between the two actors is 172 rather than the family 56, a consequence rather than a
         choice, and it costs nothing: 172 units at PKT_SPEED 0.45 is 382ms, under the 700ms
         PKT_DUR_MIN floor the old 60 unit gap also sat on, so no span moved.
NOTE     The ladder is 400 wide rather than the family 480, twice measured: its longest row inks
         337.7 units, so 400 leaves 52 of trailing space where 480 would leave 132 and would push the
         LimitRange column down to 180 wide.
NOTE     The ladder is the admission ORDER, not the step order, which is why step 1 and steps 3 to 5
         all light row 4: one plugin at one position decides all three outcomes. Row 5 (persist) is
         never lit, and on reject that is the payload rendered as an absence.
LANES    WHERE IT POINTS is the whole reason the box left the actor row.
         The ladder end lands on no face at all, and OFFEDGE has nothing
         to say because chainList rows are chips. What makes it read is the pairing of box height
         with the two rows, not the endpoint.
DO NOT   Draw the ResourceQuota object as a second box. It IS the bar, captioned with its own name,
         because a quota is a budget and a budget is a length. A block plus a bar puts two
         representations of one object on the same card.
NOTE     The three request blocks carry STROKES only, fill overridden to transparent so the soft box
         fill does not double up over the bar. rx is 0 on the slots and 6 on the bar: two rounded
         rects side by side read as two separate blocks rather than as one bar filling.
NOTE     The refused block is the only dashed one, on both steps that use it, because on both it is a
         request that never became an object. It is the one element drawn in a slot it shares with a
         second identity: web-3 on reject (too big) and web-1 on no-request (uncountable). The
         position means "did not get into the budget" in both readings and the sublabel carries which
         reason, the same one-slot-two-identities shape cluster-pod-priority-preemption uses. It
         lands on OPACITY.pending, not 1, which is why it comes up through an `F.fade` from 0 to
         OPACITY.pending over REVEAL_MS rather than through `F.reveal`: `revealAt` always ends at 1
         by construction, and a thing never created must not.
NOTE     Three of four chips turn over on a beat. status.used and `last admission` hold what the API
         DID, so they wait for the request to reach admission; `ReplicaSet web` holds what the
         controller KNOWS, so it waits for the 403 to land back. The admit step turns three of them
         over TWICE, once per Pod, because a chip reading `admitted . web-1 and web-2` from entry
         skips the half of the sentence that is the point: the sum grows per admission, not per step.
         spec.hard never changes, and that is what the field is: the number everything is measured
         against.
WHY NOT  A namespace drawn with node(): the frame class is .scheme-node and .scheme-node-label is
         uppercase catalog-wide, so it renders NAMESPACE TEAM-A on a frame the geometry rules treat
         as a Node.
WHY NOT  A relationPath from the ladder down to the bar: the bar's top face midpoint is 660, exactly
         the seam between slot0 and slot1, so the lane would land on a join rather than on a face.
```

### before `const WIRE_IF_Y = midX(LR_Y + LR_H, CAP_Y);              // 301, ink centred in the 226..376 band`

```
T-35, the counterfactual sign. The no-request step draws state that never happened: both slots gone,
status.used back to 0, the whole listing at `no Pod object` and the LimitRange at OPACITY.terminated.
Nothing on the canvas said so, and no check can say so, because every check reads one step at a time.
The sign is the caption `if instead no LimitRange existed`, on `branch`, written by that step alone.
The reset prologue calls clearWires, so blank on the other five steps costs no field and cannot rot.

WHERE, and why there. The premise is the ghosted LimitRange and the consequence is the bar plus the
listing, so the caption governs both and sits in the one empty band between them, y 226..376. It
starts at BAR_X, the rail LR_X, BAR_X and the `ResourceQuota team-quota` tag all share, so it reads
as one register above that tag rather than as a floating note. Measured on the rendered frame, the
step and all three viewports: ink 289.8..304.4 at 1600x1000, 63.8 clear under the LimitRange box,
60.4 clear above the tag, 99.5 clear left of ladder row 4 (740..1140 x 278..312), and clear of the
panel everywhere (worst 1100x800: panel right 396.55 bottom 229.82 against a caption at x>=420,
y>=290).

WIDTH, which nothing measures (L-19). 220.5 units at 1600x1000, 201.5 at 1280x860, 196.3 at
1100x800: an 11px mono string is WIDEST at the largest viewport, because advances rasterise in
device pixels and map back through the uniform viewBox scale, so 1600x1000 is the case to clear.

WHY NOT the y=140 corridor above the LimitRange, which is where a caption over the whole branch
belongs geometrically. Rendered and rejected: that corridor sits under the ReplicaSet box, which
spans the same 420..652, so the line reads as a second sublabel on the ReplicaSet, and it collides
with the 403 the reject step writes on `ack`. WHY NOT the y=376 tag row at x=60, which is free: it
lands 6 units over list0 and reads as a column heading for the listing, leaving the bar unmarked.
WHY NOT y=340, one register higher: 22 units over the tag reads as a two-line caption block, and it
lines up with ladder row 5 and the command chip instead of with the bar.
```

### poster

```
One sentence: what fits is in, and what does not fit is left outside the line. One budget track
spanning 20..300 carries two filled slots up to a thin hard tick at x=180, and the request that would
have crossed it sits past the tick as a dashed block. The tick runs 36..144, taller than the 76 unit
track, so it reads as a ceiling rather than as another internal rule.

The accent is 0.3 on the two admitted slots and 0.9 on the block that did not fit, so the eye lands
on the refusal rather than on the budget. No arrowheads, no text, no actors, no ladder: direction is
not part of the sentence, the tick is.
```

## cluster-server-side-apply

### layout

```
WHAT     managedFields as a table nobody has ever seen, drawn: two managers, one object, and who owns
         which field.
LAYOUT   The row is BOX_W 200 with TOP_GAP 60 rather than the
         family 232, because three actors have to fit in the 720 units right of the panel:
         3 x 200 + 2 x 60 is exactly 720.
PANEL    x<=291 y<=177, x<=378 y<=214, x<=397 y<=255, worst on the ledger step.
BUDGET   500 characters per narration. The top row and the table start at 420 and are panel-proof at
         any length; what has to clear is the client-side column, whose glyph top is about 355, and
         500 characters lands the panel at roughly 336. Calibration was measured, not guessed:
         padding a narration from 410 to 610 measured 404 at 1100x800, so 200 characters cost 124
         units, about 40 characters per line.
WHY NOT  Two boxes and an arrow with the ownership stated only in prose. That is what this family
         reaches for by reflex, and the whole reason the card exists is that managedFields is a table
         nobody has seen.
WHY NOT  A six-row pipeline ladder in the band between the top row and the table: a ladder there sits
         between the API and the object, so the tie from one to the other crosses it, which is a
         THROUGH finding by construction.
NOTE     The API sits in the MIDDLE of the row, solved rather than chosen: the object table spans
         420..1140 so its centre is 780, and 780 is also the API centre because the row is
         420 + 200 + 60 + 100. The tie down to the object is then one straight vertical with both
         endpoints on a face midpoint. On either end it needs a jog through the band where both
         answer labels live, and a jog left runs under the panel.
LANES    The 409 on the conflict step is drawn
         coming home, because a return the narration promises and the motion never delivers is a
         named defect family here.
NOTE     The three inputs of the client-side three-way merge sit in the bottom-left corner the panel
         frees once its text ends, holding OPACITY.notready for five of six steps. Without them the
         card is a top row and a table both starting at x=420 with the entire left third empty.
DO NOT   Remove a field row when it leaves the object. A removed row leaves a row-sized hole in a
         table on screen for the whole card, which reads as a rendering fault. It dims to
         OPACITY.terminated, keeps its field path, and its value cell says Removed.
CONTENT  The `desc` opens on `Two field managers`, not `Two controllers`. The card draws kubectl and
         hpa-controller, and only one of the two is a controller: the first step says `You run
         kubectl apply --server-side` and the conflict step says `kubectl owns that field`. Field
         manager is also the term the rest of the desc and the whole card already use.
NOTE     The two right-hand cells are spelled with the primitive's own key names (`label:` and
         `sublabel:`) so `render/inline.test.mjs` reads them where they are written. A `val:` key hides nine
         drawn strings from the lint; a `value:` key makes the lint demand lowercase for a string
         that reaches the canvas as a block LABEL.
NOT A DEFECT
         `report/arrival.test.mjs` reports five R2s here, all its documented blind spot: it samples chips at t=0
         and compares against t=0 of the PREVIOUS step, so a chip rolled back below the guard and
         turned over through at() looks like an uncued change on the NEXT step. Every one IS cued, on
         the step where it happens. DO NOT fix them by lighting a chip on a step where nothing
         happens.
```

### poster

```
Sentence: two actors, one field, and only one of them owns it.

A tug of war. Two 88 x 104 manager blocks pinned to the left and right edges, one 68 x 80 field block
centred between them, and a short dashed leg reaching in from each manager to the field's near face.
The field takes the bright fill (0.10 against 0.04) and the one accent bar at 0.9; both managers
carry the same bar at 0.3. Nothing marks WHICH manager owns it, on purpose: the poster asserts only
that the field is what is being fought over.

DO NOT go back to a framed four-row ledger. It was accurate and it was a small diagram rather than
one sentence, and at grid size it read as a sibling of cards it has nothing to do with.
```

### before `const rowState = (spec) => ({`

```
THE WORKED EXAMPLE, and it has to add up because `render/inline.test.mjs` reads the numbers and a reader follows
the values. One Deployment called web, four fields, two managers:

  step 1 first-apply   replicas 3, minReadySeconds 10, labels.app web, image nginx:1.27
                       all four owned by kubectl        chip: 1 entry, kubectl owns 4 fields
  step 3 drop-a-field  minReadySeconds Removed          chip: 1 entry, kubectl owns 3 fields
  step 4 conflict      nothing changes                  chip: 1 entry, kubectl owns 3 fields
  step 5 force         replicas 5, owner hpa-controller chip: 2 entries, kubectl 2, hpa-controller 1

The last line is the one to check: after the force kubectl owns labels.app and the image, which is 2,
hpa-controller owns replicas, which is 1, and 2 + 1 is the 3 live rows on screen.

WHERE EACH CHIP TURNS OVER. `metadata.managedFields` holds what the API STORES, so it moves when the
request lands there. `last apply` holds what the CLIENT LEARNS, so it waits for the answer to come
home, a full 800ms later. `last conflict` moves with the API decision, on the request landing.
`apply request` never moves at all: PATCH with application/apply-patch+yaml is a standing fact about
the verb, not a per-step state, the same shape failurePolicy has on the webhook card.
```

## cluster-etcd-raft

### layout

```
WHAT     One write through Raft: proposal to the Leader, replication to the Followers, quorum, apply,
         and what happens when the majority is gone.
LAYOUT   One semantic band, centred rather than inflated.
           M         40, both sides, so the bbox is 40..1160 and still centred on 600. That is the
                     only way to buy the proposal label its gap without narrowing the API off the
                     220 standard width
           SCHIP_W   API_W (220): the API and the three state chips are ONE column, and at 320 they
                     end 100 units apart, which makes the left stack read as two
         Panel bottom measured 230, and CYL_Y is 230, so the panel is one unit off the artwork:
         the longest narration on this card IS the layout constraint, ceiling 334 characters.
WHY NOT  A pure slide-up keeping ARC_RISE 32: the band centre is still 28 low and the top-right stays
         a 198 unit empty strip.
WHY NOT  CYL_Y 215, the mathematical minimum: the API's top edge lands exactly on the panel
         bottom with zero clearance, one narration line from an OCCLUDED finding at 1100x800.
WHY NOT  Stretching the row gaps to fill the full 640: it breaks the only thing tying a role chip and
         a log chip to their replica. One semantic band gets CENTRED, not inflated.
WHY NOT  Moving the API into the free bottom-left with an L-lane up into ETCD-1: every cylinder's
         bottom face is already taken by its role-chip binding, and the straight API-to-Leader lane
         IS the "single point that orders all changes".
LANES    THE TWO ARCS ARE CONCENTRIC, NOT MIRRORED, and that asymmetry is the fix rather than a slip.
         Built by mirroring (outbound on CX - LANE_DY at both ends, ack on CX + LANE_DY at both) the
         pair crosses one dash above ETCD-3: the ack horizontal runs y=162 from 1072 to 552 and the
         outbound vertical comes down into E3 at x=1048 through y=162, which is inside that span.
         E3 now RECEIVES on its right stub and SENDS from its left, the opposite of E1: outer
         528 -> 150 -> 1072 -> down, inner 1048 -> 162 -> 552 -> down, nested on all three sides.
         Each cylinder top still carries a mirrored pair straddling its own midpoint, which is all
         OFFEDGE judges.
NOTE     The three cylinder-to-role-chip ties go through relationPath, one forEach rather than three
         near-identical statements. ROLE_Y is CYL_BOTTOM + 30, not +16: at 16 units a `5 5` dash
         renders a tick and a half, which reads as a rendering slip rather than as a relationship.
CONTENT  The acks chip COUNTS and does not judge: `0 of 2`, `1 (then 2)`, `2 of 2`. The verdict lives
         on the quorum chip, `2 of 3 ✓ at ack 1`. A tick on the SECOND ack teaches that the commit
         waits for both Followers, and it does not: in a group of three the Leader plus one Follower
         is already the majority, which is why a three-node cluster survives losing a Node.
         The chip is named `acks from Followers` rather than `acks (entry 9)`, so it states its own
         population: `2 of 2` above `quorum: 2 of 3` counts two Followers against three replicas, and
         together they read as a contradiction.
CONTENT  The sixth step is quorum loss, and every fact in it is from raw sources rather than a
         summary. etcd's raft Config.CheckQuorum makes the Leader step down when quorum is not active
         for an electionTimeout, and server/etcdserver/raft.go sets it true unconditionally, so
         ETCD-1 goes Leader -> Follower and the card ends with no Leader. Writes fail with
         ErrTimeout. READS SPLIT, and that split is the value of the step: linearizable reads must go
         through consensus, a serializable range request is served locally. So `reads keep working`
         is wrong and `nothing works` is wrong.
         The apply step reads `while quorum holds every read returns it consistently`: without the
         qualifier the step after it contradicts the step before, which is the internal-contradiction
         check finding a defect the ADDITION created.
DO NOT   Send a ball into a member that is not answering. It says the opposite of the step, and
         nothing comes back either, so there is no return to draw. The step carries its beat with the
         fade and with .highlight on the four chips that move.
NOTE     The silent pair holds OPACITY.notready (alive but not serving, not observed), not
         terminated, which would also put the card one .highlight away from a `render/opacity.test.mjs` LIT.
NOTE     THIS CARD IS THE WORKED EXAMPLE THAT `chips` IS NOT A STEP'S FINAL VALUE. `quorum-lost`
         declares `r1: Leader` in its static block, and an `F.set` at FADE.out + BEAT.lead, 1500ms,
         turns that ONE chip of the nine the step states into `Follower`. Nothing else on the step
         moves after entry. So reading a card for what a chip ENDS on means playing `chips`, then
         `enter`, then `rewind`, then every `F.set` in flow order, and a reader who stops at the
         `chips` literal here concludes the card ends with a Leader, which is the opposite of the
         step. The step comment beside it writes that beat as 1501ms, the arithmetic is 700 + 800.
```

### poster

```
Three cylinders on one row, the leftmost filled at 0.06 against 0.04 for the other two: the
LEADER is the one thing the poster is about, and it is said with fill alone. A dashed leg joins it
to the first follower and a dashed arc spans all three, which is the replication reaching every
member without drawing three separate legs.
Bottom ellipses at stroke-opacity 0.35 so the cylinders read as open volumes rather than as capsules.
No arrowhead: the arc is a relationship, and the direction is already in the brightness.
```

---

## cluster-graceful-node-shutdown

### layout

```
WHAT     systemd telling the Kubelet a shutdown is coming, and the Kubelet spending the grace budget
         in two buckets, regular Pods then critical ones.
LAYOUT   node() draws its
         label at NODE_Y + 18, so a Pod row at +22 prints NODE-1 four units above the first Pod and
         overlapping it.
WHY NOT  A bus at NODE_Y - 14 with one tap per Pod. Two lanes crossing the frame and splitting over
         the Pod row read as plumbing rather than as a shutdown. WHICH Pod reacts is carried by the
         pulse.
NOTE     terminate-normal sends ONE ball and both non-critical Pods react to it, which is a better
         reading of `in parallel` than two balls whose arrivals differed anyway, because the two taps
         were different lengths.
MOTION   Both terminate steps are down-arrow, so ball first and pulse on arrival: ball 0..782, pulses
         782..1682, fade 782..1982. Nothing fires simultaneously. The lane went 748 -> 352 units, so
         both spans dropped to 1982 and both durations were cut to 2400.
NOTE     All four chips wait for the packet that earns them. systemd is not free to proceed until the
         release actually arrives, so showing `released` at step entry is the lock being dropped a
         second before the ball that drops it.
DO NOT   Fade a shut-down Pod to 0. An absent block reads as a rendering fault rather than as an
         absence. Both the pins and the fade land on OPACITY.terminated, the shade for gone. Same
         conversion cluster-node-drain and cluster-node-pressure-eviction took.
NOTE     No stand-in highlight to take back here: neither terminate step has ever set one. If a
         stand-in is ever added, it has to be dropped on BOTH paths, because the Pod now ends dim
         rather than absent.
CONTENT  Step 2 is `condition`, not `cordon`. The doc's first fact after the intro is that the
         Kubelet sets a NotReady condition with reason `node is shutting down`, and the scheduler
         honours it. There is no spec.unschedulable anywhere in this feature, so cordon is the wrong
         word, and "flips its admission state" is the SECOND half of the mechanism, not the one that
         stops the Scheduler.
         The release step says the Node has carried NotReady since the Kubelet set it and the stale
         Lease additionally makes it unreachable. Saying the cluster marks it NotReady at the END
         contradicts the card's own first step.
         `node is shutting down` is an API reason string in lower case and lives in terms.json under
         exceptions.Node. It is the only occurrence in the catalog.
```

### poster

```
A clock with four tick dots on the left, a dashed leg into a dashed Node frame holding three Pods
at 0.08, 0.04 and 0.03: the sentence is that shutdown is a COUNTDOWN spending an ordered sequence,
not an event. The three fills are the order, not three different kinds of Pod.
The frame is dashed because the Node is on its way out. The clock is the only closed shape, so it
reads as the actor even though nothing points at it.
```

---

## cluster-kubelet-sync-loop

### layout

```
WHAT     The Kubelet's reconcile loop: watch, PLEG, SyncPod, CRI, status, running forever.
LAYOUT   The chip column is the
         category's 480 (60..540), not 380 against a 500 wide ladder.
BUDGET   Panel x<=397, bottom 177 / 214 / 255 over 1600x1000 / 1280x860 / 1100x800, and 269 at
         1024x768. Re-measured with
         `OVERLAY_IDS=cluster-kubelet-sync-loop node --test report/overlay.test.mjs` from
         `scheme/test`, which reads 254.66 on the `pleg` step at 1100x800, the card's longest
         narration at 357 characters: the card header's 255 is that same measurement. What the
         bottom has to clear is the API box at y=300, so 45 units of headroom at the rule worst
         case, and `pleg` alone swings 77 units across the three viewports, so a reading taken at
         1600x1000 is wrong by that much in the flattering direction. Grow a narration here and
         re-measure.
CONTENT  There is no `source dispatcher` in the Kubelet. The three spec sources (apiserver, file,
         http) are merged by PodConfig into ONE update channel, syncLoop reads it, and
         HandlePodAdditions puts the Pod into podManager. This card names real internals everywhere
         else, so one invented component was the odd sentence out.
         The CRI sequence is RunPodSandbox, PullImage, CreateContainer, StartContainer, and PullImage
         is in the path every time. It is in the narration, the wire label, ladder row 4 and,
         crucially, in the MOTION: the cri step animates FOUR packets and the chip names each call as
         its ball lands. That cost 800ms, span 2860 -> 3660, duration 3800.
         The `observed` chip reads `0 containers` -> `1 container running`, directly comparable with
         `desired` at a glance. `1 running` beside a desired reading `1 container` makes the reader
         translate units to see that the loop converged.
         EventedPLEG is ALPHA, not beta, and that is the fact to re-check if the sentence is ever
         edited: the gate WAS beta in 1.27 and went back to alpha. Read the raw feature-gates table.
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
NOT A DEFECT
         `report/arrival.test.mjs` R2 reports three findings here, all the tool artefact: it samples at t=0 and
         compares against t=0 of the previous step, so a mid-step turnover is attributed to the NEXT
         step, where the chip is not highlighted because that step is not about it.
```

### poster

```
Sentence: a closed cycle of five stages that never stops.

Five stage blocks (76 x 50, rx 8) wired head to tail into a closed ring: three across the top at
x = 20 / 120 / 220, two under the outer pair at y=110, five dashed legs joining them face midpoint to
face midpoint, the long bottom leg reading as the return. Clockwise from the top left: watch, PLEG,
SyncPod, CRI, status. SyncPod is the reconcile itself, which is the card title, so it takes the
winner treatment: 0.10 fill against 0.04 and the one bright bar at 0.9, twice the width of the four
dim bars at 0.3.

DO NOT draw it as one thin rounded track with five small marks and an arrowhead. That version failed
on STYLE, only visible next to the siblings: the marks were specks at the 200px the grid renders, the
dimmed track made the dominant shape faint, and 240 x 116 of canvas was empty air. It also broke the
vocabulary twice: NO poster in the catalog uses an arrowhead, and the house accent is not a bright
FILL on a shape, it is a rect with fill="currentColor" at 0.9. Direction is carried by the ring being
CLOSED.

If you redraw a poster here, put it side by side with two siblings at 260% before deciding. All three
faults were invisible on the file and obvious on a montage.
```

---

## cluster-leader-election

### layout

```
WHAT     Three replicas racing for one Lease, and the renewals and failover that follow.
LANES    One request lane and one answer lane per replica, on that replica's own axis. `PUT` and
         `ACK` are built ONCE, one array per replica, and the `P.lane` and the `F.route` both index
         them, so the drawn wire and the ball it carries are the same array (A-02 SHARED). All 16
         routes on this card read them and none is carried.
DO NOT   Turn them back into `f(cx)` factories that build the points at the call site. The lane and
         the route are then two equal copies, and the first geometry edit moves one of them: that is
         exactly the defect the DO NOT below names, one level further up.
WHY NOT  One shared horizontal corridor for all six CAS routes. Every PUT then lies on top of its own
         answer and it is unreadable which answer belongs to which replica.
WHY NOT  A replica row at 420..1140 while the Lease and its chips span 60..1140: the bottom then reads
         as a different object from the top, and the drawing centres on 780.
WHY NOT  Moving the three Lease field chips into the free bottom-left as a column: it destroys
         "fields grouped directly under their object", which is the entire bottom half of the card.
BUDGET   THE VERTICAL IS A TRADE WITH THE NARRATION, and the arithmetic is the point. With the column
         centred the row sits under the panel, so the band top is panel bottom + 15 and every
         narration line costs 25 units of viewBox at 1100x800. Moving the band up by one line moves
         its CENTRE up by only 12.5, because the top is pinned and the height is not:
           7 lines  panel 205  REP_Y 220  centre 414, 94 low
           6 lines  panel 180  REP_Y 195  centre 373, 53 low
           5 lines  panel 155  REP_Y 170  centre 348, 28 low   <- shipped
           4 lines  panel 130  REP_Y 145  centre 323, centred
         All four narrations are written to hold five lines (189 to 205 characters). Four lines would
         centre it exactly and is NOT taken: at about 160 characters the qualifying clauses start
         coming out, which is the failure this project has already paid for once.
DO NOT   Let a narration grow past five lines. It silently pushes the panel onto the replica row, and
         nothing in the gate checks it: OCCLUDED would report the overlap but is not in the gate
         profile.
DO NOT   Give a packet its own centre. Three CAS packets rode hardcoded 470 / 700 / 930 while the
         drawn lanes sat at 530 / 780 / 1030, so every ball flew 60 to 90 units beside its own dashed
         lane on three of five steps, with a stale comment saying so out loud. The call site is
         `putPacket(s, ctx, REP_CXS[i])`: wire and ball from one array.
CONTENT  The first acquisition is a CREATE, not a PUT. client-go Gets the lock and on NotFound
         CREATEs it, so the winner takes a 201 and the losers an AlreadyExists 409.
         Compare-and-swap on resourceVersion is the UPDATE path, which every renewal and the failover
         race use: `POST 201 Created` / `POST 409` on acquire against `PUT 200 OK` / `PUT 409` on
         failover.
         The standbys do NOT watch the Lease, they GET it: client-go calls Get on the lock every retry
         period (2s against a 15s lease), and there is no watch in that loop.
         failover lights BOTH survivors: mgr-3 races in that step too, sends a CAS-PUT, reports its
         409 and changes its role chip.
         renew answers as well. It sent a PUT and rode nothing home, so mgr-1's answer lane was the
         one drawn lane on the card idle while its twin carried a ball, against the card's own rule
         that a replica acts on the ANSWER rather than on the write.
NOTE     The Lease box is drawn at idle although the object does not exist yet, deliberately. Dimming
         it and its four field chips for one step a reader never sees on its own (the poster occupies
         that position) would cost the card its anchor: the Lease is what the drawing is about. The
         create is said in words instead.
NAMING   The lane helper is not called `casPut` or `leaseWrite`. WHICH call rides it varies by step:
         acquire is a create (201, or AlreadyExists 409 for the losers), renew and failover are
         compare-and-swap on resourceVersion (200, or Conflict 409), and the standby poll is a plain
         GET. Each of those names excludes at least one of the three.
```

### poster

```
Sentence: three want it, one has it.

Three 80 x 46 replica blocks across the top, the middle one lit (0.10 against 0.04) and carrying the
accent bar at 0.9 while the other two carry it at 0.3. Below them one 240 x 52 Lease block holding a
row of FIVE 34 x 24 slots of which exactly ONE is filled, sitting under the middle replica. The
middle replica's leg is the one SOLID line and it runs past the Lease boundary into that slot; the
two standbys drop dashed at 0.4 and stop on the Lease top edge without getting in.

Five slots rather than three on purpose: three would sit one under each replica and assert that every
replica has a slot of its own, which is the opposite of what a Lease is.

The bright block is the MIDDLE one while the card elects the leftmost replica. Deliberate: the poster
blocks carry no names, and handing the win to the left block would put the one bright element on the
edge and send the solid leg across two other legs to reach the slot.
```

---

## cluster-node-allocatable

### layout

```
WHAT     An ARITHMETIC, not a sequence: Capacity carved by kubeReserved, systemReserved and
         evictionHard into Allocatable, and a request that does not fit what is left.
LAYOUT   The Node family idiom is a ladder plus a frame full of Pods, and this card breaks the second
         half on purpose: the frame holds ONE horizontal capacity bar carved segment by segment and
         the ladder carries the running subtraction. Nothing is a Pod, so nothing pulses: the beats
         are packets, block highlights and the four segment reveals. A deliberate reading of "only
         Pods pulse".
         The frame is 196 tall rather than the family 152 because it stacks four
         things: 34 of label padding, the 64 bar, the 22 request strip, and three caption tiers.
WHY NOT  GI 64: a 15Gi request lands on 1176, past the content margin at 1140. GI 60 lands exactly ON
         the Node frame edge. 56 puts it on 1104, 36 units inside the frame, and still overhangs the
         end of the bar by exactly one Gi, which IS the answer the card gives: the request is 1Gi
         short.
NOTE     The three narrow segments cannot hold a label at 56, 28 and 28 units wide, so their captions
         stagger on three tiers below the strip. That spends 54 units on the left third and leaves
         the right third of the band empty. The alternative was widening the reserved segments out of
         proportion, which makes the picture lie about the one thing it exists to show.
NOTE     The idle frame is mostly empty for the same reason: at the poster position nothing is carved
         yet. A progressive-carve card cannot both reveal and be full at rest.
LANES    Same call cluster-scheduler-decision makes
         for API_TO_CHAIN. Without it the top row and
         the Node band read as two unrelated drawings.
NOTE     The segments carry STROKES only, their rect fill overridden to transparent so the soft box
         fill does not double up over the bar. rx is 0 on the segments and 6 on the bar: four rounded
         rects side by side read as four separate blocks rather than as one bar divided. Each segment
         is wrapped in a g with its caption so ONE opacity reveals both, with no chance of pinning
         the box and forgetting the caption.
NOTE     The request strip starts where Allocatable starts, because Pod requests are only ever
         measured from there, and its width is set per step in whole Gi. On schedule it is 15Gi and
         overhangs the bar, on overcommit 12Gi and inside: the two frames side by side are the card's
         argument. Its label goes through the wires map rather than a box sublabel, because a
         sublabel is positioned at w / 2 and w changes between steps, so it would drift off centre.
DO NOT   Draw the 24Gi of limits the overcommit step talks about. Nothing on the bar measures limits,
         and a 24Gi strip runs 1344 units off a 1200 unit canvas. The ladder row and the narration
         carry it instead.
NOTE     Three of four chips turn over on a beat rather than at entry. status.capacity.memory and
         status.allocatable.memory hold what the API STORES, so they read `not reported` until the
         Kubelet report lands; NodeResourcesFit holds the Scheduler's verdict, so it waits for the
         number it judges against. enforceNodeAllocatable never changes, and that is what the field
         IS: a standing value answering "which of these three reservations is actually a cgroup cap".
NOT A DEFECT
         `report/arrival.test.mjs` reports two R2s, both the documented blind spot: a chip written on arrival
         through at() looks like it changed on the NEXT step, unlit. Both changes are cued where they
         happen.
```

### poster

```
One sentence: one bar, four segments, and only the last one is for you. A single outlined rect
spanning 20..300 stands for the whole Capacity, cut by three internal rules into kubeReserved,
systemReserved, the eviction threshold and Allocatable. The accent sits at 0.3 on the three reserved
slices and 0.9 on Allocatable, so the eye lands on the only region a Pod may be scheduled into.

The reserved segments are 44, 36 and 36 wide against 164 for Allocatable, WIDER than the card's own
proportion (56, 28, 28 against 784). At the ~200px the grid renders, a truthful 512Mi slice would be
5 units of accent, which is the speck the kubelet-sync-loop poster was rebuilt to remove. The
sentence is "three narrow, one wide", and it survives the widening.
```

## cluster-node-drain

### layout

```
WHAT     kubectl drain: cordon, list-and-skip, then eviction through the API with a
         PodDisruptionBudget gating it, a 429 and a retry.
LAYOUT   Layout C, the tallest panel in the category.
PANEL    x<=397, y<=304 at 1100x800 on the cordon step. Frame top 380, so 76 units of clearance.
BUDGET   NO STEP MAY EXCEED 528 CHARACTERS, and that is a property of the FRAME, not of the current
         text: trims that buy clearance do not raise the ceiling, because 380 is a route length and
         therefore a packet timing. Growing three narrations for accuracy took the panel to 404 at
         1100x800 and 456 at 1024x768, over the frame edge and its NODE-1 label, and
         the OCCLUDED report in `report/geometry-soft.test.mjs` stayed CLEAN through all of it: it
         scores occluded AREA and a 25 unit strip off a 152 tall frame is under its bar. Pay for an
         edit inside the same step and do not trust the suite here.
WHY NOT  A bus inside the frame with a tap per Pod. Two lanes crossing the frame and splitting over
         the Pod row read as plumbing rather than as an eviction. WHICH Pod dies is carried by the
         pulse.
NOTE     The lane leaves the API, not kubectl: kubectl POSTs to the eviction subresource and the API
         is what reads the PDB, grants the 200 OK and DELETEs the Pod, which both evict steps say in
         those words. Same shape as workloads-force-deletion.
OPEN     `report/geometry-soft.test.mjs` reports OCCLUDED on kubectl at 86% and it STAYS OPEN. It
         is real and viewport-dependent in a way the rule cannot express. Panel right edge against
         kubectl at 196..428:
           2560x1440 154, 0% covered      1920x1080 203, 3%      1728x1080 272, 33%
           1600x1000 291, 41%             1440x900 319, 53%      1280x860 378, 78%
           1100x800  397, 87%
         The crossover is around 1920. The author looked at the real page and judged the centred API
         and the straight lane worth it.
         DO NOT slide the row right: with BOX_W 232 and the panel reaching 397, a box left of a
         centred API has 420..484 to live in, 64 units. The only layouts that close it are kubectl to
         the RIGHT of the API (reversing the top row's request direction) or a much narrower box
         family. Both were considered and declined.
NOTE     WIRE_X is CX, centred over the API, because the longest label runs 365 units against a 56
         unit gap: gap-centred it reaches back to x=273 and the panel eats it. Centred on the API it
         spans 417..783 and clears the panel outright. The label renders at 11px from
         `.scheme-label.code`, so do not size it off a `font-size` attribute.
MOTION   This card has turned a geometry change into a timing change three times, in both directions.
         The lane went 528 units to 260, which is under PKT_DUR_MIN, so the drop now runs at the
         700ms floor and its length no longer buys any time at all. evict-A spans 2700 (700 request,
         BEAT.afterHop, 700 drop, then POD_FADE 1200) and evict-B 4300, two hops more, so the
         durations are 2800 and 4400: 100ms of margin each, and both move if the fade does.
DO NOT   Fade an evicted Pod to 0: it leaves a block-sized hole in the frame's left third. Pins and
         fade land on OPACITY.terminated, and POD_FADE is 1200 rather than FADE.out 700, because at
         700 the Pod is gone 200ms before its own pulse ends and the eviction reads as a cut.
         Two traps come with it. The static path stands a .highlight on the Pod's inner box in for
         the pulse it cannot show, and a highlight at the terminated shade is `render/opacity.test.mjs`'s LIT on
         one path and `render/reduced.test.mjs`'s HIGHLIGHT on the other, so fadeOut takes the class back in the
         fade's onfinish (the removeAt shape). And `render/opacity.test.mjs`'s ORDER wants the pulse before the
         fade: both hang off evict.arrivalMs.
NOTE     ALL FOUR chips turn over on the beat that earns them, not one. `currentHealthy` is PDB
         status, so it moves when the eviction takes effect on the Pod (evict.arrivalMs).
         `last eviction` is what kubectl KNOWS, so it moves when the answer lands back on kubectl
         (granted.arrivalMs on evict-A, denied.arrivalMs on evict-B). Capturing the return hop is the
         only reason that packet stopped being a bare call.
         evict-B is the harder one, because both its pinned values are TRANSITIONS (`1 of 2 -> 2 of
         2`, `web-2 . 429 -> 200 OK`): showing them at entry announces the 429 and the retry that
         clears it before either is drawn. The played path starts from what evict-A left, puts
         `web-2 . 429` up when the denial reaches kubectl, bumps the count as the RETRY LEAVES (the
         narration has the replacement turning Ready before the retry is granted), and settles on the
         pinned strings at evict.arrivalMs.
         The `drained` step does not write `2 evicted . DS retained` into `last eviction`: that is a
         tally, not a last eviction, which is the chip-name rule. Ladder row 5 and the wire label
         already carry the summary.
CONTENT  The disruption controller computes status.disruptionsAllowed; the eviction admission path
         only READS and decrements it. Row 4 is `API reads disruptionsAllowed`.
         `the PDB returns 429` is wrong from the other side: the PDB is an object and the API answers.
         The desc had `DaemonSet Pods are skipped only when you pass --ignore-daemonsets`, which says
         that without the flag they would be evicted. The subcommand does not drain them at all; the
         flag exists so the drain does not abort.
         kubectl sleeps a fixed 5 seconds on a 429. There is no backoff curve.
         `The Scheduler stops placing new Pods on this Node` is false for anything tolerating
         node.kubernetes.io/unschedulable, which is exactly the DaemonSet Pod this card keeps.
NOTE     Left alone deliberately: the card says the granted eviction is 200 OK, which is what the doc
         lists, while the apiserver create handler answers 201. Following the doc is right for a
         teaching card, but do not "fix" it in either direction without deciding that first.
         `web-1` and `web-2` are named like StatefulSet members while their sublabel says Deployment.
         Legibility wins and the naming is consistent across every step, chip and wire label.
```

### poster

```
Two Node frames, the drained one left and the destination right, with three Pod slots left and two
right. Sentence: a drain empties a Node of everything except its DaemonSet Pod.

The two UPPER slots are the ghosts and the bottom slot, the DaemonSet Pod, carries the single
brightest fill at 0.16, because it is what the sentence is about.

DO NOT put two solid slots on the left and two on the right. That says one Pod left and two arrived,
on a card where two leave and one stays.
```

## cluster-node-failure

### layout

```
WHAT     A Node going unreachable: the Lease going stale, the NotReady condition, the unreachable
         taint, and the eviction timer that finally moves the Pods.
WHY NOT  Five chips across at 206: the unreachable taint value alone needs 335.
LANES    THE TWO LANES ON NODE-1 END ON DIFFERENT FACES, and that is the fact rather than an
         oversight. The heartbeat leaves the FRAME top at [293, 406], because a Lease is renewed by
         the Kubelet and the Kubelet is the Node. The eviction DELETE lands on the POD top at
         [269, 422], because a DELETE is an API write on the Pod object: nothing about it travels to
         Node-1 at all, which is exactly why the object then sits in Terminating with an orphaned
         container. Ending it on the frame top drew the delivery the step's own sentence denies, and
         the comment beside that flow already said "to the Pod on Node-1" while the geometry said
         the Node. Sibling form, read today: `workloads-pvc-stickiness` ends the same DELETE on
         [P_A_CX, POD_Y], its Pod top-face midpoint, and crosses its own Node frame to get there.
         The endpoint x stays on NODE_A_CX - LANE_DX = 269 and is NOT moved to the Pod midpoint 281,
         so the drop keeps 24 units of daylight from the heartbeat riser at 293 instead of running
         12 from it. OFFEDGE is unbothered either way: 12 off a 300 unit face is 4%, inside the 18%
         a lone endpoint is allowed. THROUGH is unbothered by the frame crossing, which is its own
         documented exception, a frame being a container lanes run inside to reach what it holds.
         A-11, measured: the drop grows 16 units (406 to 422), the route 593 to 609, so the arrival
         moves 1318 to 1353 at PKT_SPEED 0.45 and the `evict` span 2218 to 2253 of 2400, arrival
         plus the 900 of PULSE_POD. That leaves 147 clear of the 2400, so the longer drop is paid
         for out of slack rather than out of the duration.
         THE SHADE FOLLOWS THE ENDPOINT. `evictLane` is `laneOf(podA, nodeA)`, the dimmer of the Pod
         it ends on and the frame it crosses to reach it. DO NOT write it as `laneOf(nodeA,
         OPACITY.running)`, which never sees the Pod at all. Measured with the harness
         `effectiveOpacity` over all seven steps. Source end, the controller bottom face at [576,
         120]: composites 1.00 on every step. Sink end, podA top face at [269, 422]: 1.00 through
         `taint-applied`, then 0.25 from the `evict` arrival on, and the INK at that face is that
         0.25 times the 0.65 `stroke-opacity` the outline style gives `.scheme-pod-rect`, so 0.16. A
         lane at 0.40 with `stroke-opacity` 1.00 on those two steps carries 2.5 times the ink of the
         object it terminates on, so the lane's own series is 1.00 / 1.00 / 0.40 / 0.40 / 0.40 / 0.25
         / 0.25.
         The frame STAYS in the min, and that is what keeps the DO NOT below satisfied: three of the
         four legs are outside the frame, so dropping nodeA from the expression would have drawn a
         1.00 lane over a 0.40 frame for three steps.
         WHY NOT let 0.25 reach the flight. `F.fade` from DOWN to DYING at `at: 'del'` runs the lane
         down on the Pod's own beat over the same 700, and `fill: 'both'` holds keyframe one at 0.40
         through the whole 1353 of the delay window, so the ball rides a 0.40 lane end to end (A-15)
         and the span stays 2253 of 2400. Read at 1600x1000 and 1100x800, the side effect is a gain:
         the eviction drop at x=269 and the heartbeat riser at x=293 are 24 apart and now carry
         different shades, so the pair cannot read as one LANE_DX pair at either viewport.
NOTE     The Pod PULSES on `evict`, and the lane ending on the Pod is what makes that pulse mark the
         object the ball actually reaches. M-08 wants that order, pulse then fade, and both fire on
         the arrival. BOTH shapes were compared on the rendered frame: the pulse SHIPS. Census over
         the catalogue, off the specs: of the 22 beats where a Pod fades on a ball arrival, 19 carry
         the pulse and 3 do not, and one of the three (`cluster-delete-flow`) is a second fade on a
         Pod that already pulsed in the same card, so the sibling `workloads-pvc-stickiness` is one
         of two true exceptions and this card sits with the 19 that pulse. The frames settle it:
         with the pulse the deleted object is the brightest thing on the canvas at 1803, which is
         450 into the 900, at both viewports. Without it the only arrival cue is the ripple M-14
         gives every packet, a ring at [269, 422] sitting ON the Node-1 frame edge, so the beat is
         not UNMARKED without the pulse, it is marked on the point instead of on the object.
WHY NOT  match the sibling and drop it. The argument was that a Pod on a Node the narration calls
         unreachable cannot acknowledge anything, and what the pulse TARGETS answers it: M-03 pulses
         the whole Pod GROUP, which here draws the Pod OBJECT in the API, and the object is what
         changes, since this step says it gets a deletionTimestamp while the container on Node-1 is
         orphaned. Two numbers that carry no verdict: the pulse is what sets the span, 2253 with it
         against 2053 without, both inside the 2400, and neither path shows it statically, so
         `reducedLit` needs nothing and `render/reduced.test.mjs` cannot see the choice at all.
         `render/opacity.test.mjs` ORDER cannot either. It skips a fade with no pulse of its own
         (`if (!mine.length) continue`), so M-08 ORDERS a pulse and never requires one.
WIRE LABELS
         TWO REGISTERS, because one of the five strings has a lane of its own. `ctrl` sits at
         [785, 26], above the top row and centred on the controller-to-Lease relation, and carries
         what the CONTROLLER writes: the status PATCH, the taint PATCH, the DELETE, the recreate. The
         `heartbeat` string is the Kubelet's PUT, not the controller's, and the ball for it rides
         hbLane out of [293, 406], so under `T-22` that caption cannot sit over a relation that
         carries nothing on any step. It moved to `hb`, pinned on the leg it names, and `ctrl` is
         simply unwritten on that step, the way the poster step already leaves it.
         Measured at all three viewports: `hb` is anchored `start` on [303, 380] and not centred on
         the leg, because the string renders 251.5 wide at 1100x800, 258.1 at 1280x860 and 282.5 at
         1600x1000, so a box centred on the leg midpoint 466.5 reaches 607.7 at the widest and lands
         over the reschedule drop at x=600. Anchored it spans 303..585.5 worst case, box on
         368.5..383.4: 6.5 under the leg at 362, 22.6 over the frame top at 406, 34 clear of the
         eviction drop at 269, 14.5 clear of the reschedule drop at 600. The +18 under the lane is
         the catalog offset for a caption below a wire, and the panel is 180 deep at worst, so
         nothing here is reachable by it.
WHY NOT  Re-centring `ctrl` on the controller spine at 600 so it reads as the controller's own
         caption, which the four remaining strings are. It moves a label on four steps to close a
         finding about a fifth, and the DELETE string measures 323.9, so centred on 600 it would
         hang 162 either side of the spine across both top-row blocks instead of between them.
WHY NOT  A caption on the controller-to-Lease relation for the `heartbeat` step. The relation is
         drawn because the flip is COMPUTED from an expired Lease, and no step puts anything on it,
         so a caption there would be a second string naming traffic that does not exist.
NOTE     THE PAIR IS NOT MIRRORED, and Node-2 is why. The frame runs 698..1140, so its TOP face
         midpoint is x=919 and the whole face sits under the ladder band at 660..1140, with the
         ladder bottom 12 units above it, so that face cannot be reached at all: the reschedule
         enters the LEFT face midpoint instead. To get there its vertical has to fall inside the
         corridor, whose centre 600 is also the controller's bottom face midpoint, so the reschedule
         takes the midpoint outright and the eviction steps aside by twice LANE_DX. OFFEDGE is
         unbothered: 24 off a 300 unit face is 8%, inside the 18% allowed for a lone endpoint.
         The reschedule also cannot mirror the eviction and jog along EV_JOG_Y, because that y is
         inside the ladder with the same 12 units of clearance.
NOTE     The reschedule crosses the heartbeat's return leg at HB_JOG_Y, structural rather than
         sloppy: the heartbeat travels left-to-right along the band and the reschedule top-to-bottom
         through the same corridor. It costs nothing, because no step puts a ball on both.
DO NOT   Run the reschedule lane from Pod A's right edge to Pod B's left edge. That draws the dying
         Pod MIGRATING across to Node-2, on a card whose previous step has just left it Terminating
         with an orphaned container on an unreachable Node, which is the one thing a Node-failure
         card must not teach.
DO NOT   Draw Pod A at 0 on the evict and reschedule steps. Terminating is a phase in the vocabulary,
         not an absence: an object with a deletionTimestamp the API cannot finish deleting is exactly
         what this card is about, and drawing it as gone deletes the subject of its own sentence. It
         holds OPACITY.terminating, and every lane on the Node-1 side keeps the FRAME inside its
         laneOf() min, so none of them is ever brighter than what it crosses. Pinned to the Pod ALONE,
         the eviction lane would run at full strength over a 0.4 frame for three steps, which is the
         opposite error to the one the LANES note closes. The reschedule step brings only the REPLACEMENT to
         full, because a Pod carrying a deletionTimestamp no longer counts towards the replica total,
         which is what lets the controller create it while the old one is still on screen.
CONTENT  The box sublabel is `node-lifecycle + taint-eviction`. Since 1.29 those are two independent
         components, and step 5 has the taint-eviction-controller issue the DELETE, so a box saying
         only node-lifecycle-controller denies the actor its own next step names. Step 6 is a third
         controller again, the replicaset controller, named in words.
         The toleration is added to any Pod that does not set one itself, NOT to "every Pod".
         DaemonSet Pods set theirs with no tolerationSeconds, so this path never evicts them, which
         is why the DaemonSet agents survive the eviction the card shows.
         The Lease age moves to `over 350s` on the EVICT step, not on the reschedule. The toleration
         expiring IS 300s after the 50s grace period, so a Lease still reading 52s while the eviction
         timer reads 0s would be two clocks disagreeing on one card. It is the one Lease age change
         after `not-ready`, so evict lights it and reschedule, where it no longer moves, does not.
NOTE     SIX chips, not five: the grid is three wide, so five left a hole. The one worth adding was
         the THRESHOLD, `grace period`, beside `Lease age`, which is what makes 30s of staleness
         harmless and 52s fatal. The rows are meaningful now: Ready / Lease age / grace period is
         "is the Node alive", Taint / Toleration / eviction timer is "what happens to its Pods".
```

### poster

```
Two Node frames, the left one dashed and dimmed to 0.42 and its Pod dashed with it, the right one
solid with a filled Pod carrying the accent bar at 0.7. One dashed leg between them. The sentence
is a rescheduling: the workload is on the survivor and the lost Node is still drawn, dimmed rather
than cut out, so the reader sees where it came FROM.
That is the catalog rule about an absent block applied to a poster: cutting the left frame would
leave a hole and the leg would point at nothing.
```

## cluster-node-pressure-eviction

### layout

```
WHAT     The Kubelet evicting under memory pressure: the threshold, the ranking, the kill, and the
         condition clearing after the transition period.
WHY NOT  A bus at BUS_Y with a tap into the BestEffort Pod. A lane that crosses the frame and picks a
         Pod out of the row reads as plumbing rather than as a kill. Which Pod dies is carried by the
         pulse.
NOTE     The API block was added because THREE of the five steps say the Kubelet writes to the API and
         the card drew no API at all, so that traffic was narrated and never shown. Two of those steps
         animated NOTHING (span 0 and 900 with zero packets), which no check can see: `render/duration.test.mjs`
         only asks whether a step outlasts its own motion, and a step without motion passes trivially.
         API is 232 wide at CONTENT_R - API_W = 908..1140, right-aligned with the ladder AND the Node
         frame. The whole left half of the top row stays empty because that is the panel's corner:
         the L-shaped safe zone used rather than fought.
         ONE lane, one direction, at the shared face midpoint y=80. No step names anything coming back
         from the API, so a return pair would be decoration.
BUDGET   NO NARRATION MAY PASS 383 CHARACTERS. The panel bottom is 280 at 1100x800 and the chip column
         starts at 296, so 16 units of headroom, the tightest clearance on the card. That budget is
         why the evict rewrite landed at 380 rather than the 408 it wanted.
MOTION   `relieve` sends its packet at BEAT.afterPulse, not on the same beat as the pulse: two
         survivors pulsing while the PATCH leaves gives the eye two places to look at once, and the
         Kubelet flips the condition BECAUSE the memory freed up, so it is also the sentence order.
         `evict` sends the status report at kill.arrivalMs + BEAT.afterHop, because the phase cannot
         be reported Failed until the Pod is actually dead.
NOTE     VICTIM_FADE is 1200 against FADE.out 700, the one place this card leaves the catalog token.
         At 700 the Pod reaches its end shade 200ms BEFORE its own 900ms pulse finishes, so the tail
         of the pulse plays on something already dark. At 1200 it is still near full at 0.91 through
         the middle of the pulse.
DO NOT   Fade the victim to 0. It leaves a block-sized hole in the frame's left third on a card whose
         last step is about the OTHER two Pods still running. The pin and the fade land on
         OPACITY.terminated, which is exactly what an evicted Pod is: phase Failed with reason
         Evicted, and the object stays in the API.
CONTENT  THE ONE REAL GAP was the largest fact on the doc page: node-pressure eviction is NOT
         API-initiated eviction, and the kubelet does not respect PodDisruptionBudget or
         terminationGracePeriodSeconds. That is the whole difference from cluster-node-drain in the
         same subcategory, so a reader crossing between them would reasonably conclude a PDB protects
         against this. Both halves are in the evict narration and the short version is in the desc.
         The Pod does not merely get removed locally: the Kubelet sets phase Failed with reason
         Evicted, which is why evicted Pods sit in the API afterwards.
         Verified against the raw page: the three ranking keys in doc order, the "QoS class does not
         decide that order, it only estimates it" line, the 10s eviction manager period, the 5m
         transition period, and the toleration sentence. One caveat if you re-verify: asking a
         summariser for that Note returned a confident and completely invented answer. Fetch the raw
         page.
CONTENT  `rank` names the QoS card (`See the Pod QoS Classes card.`) because the classes themselves
         live there and a reader who wanted them had nowhere to go.
NOTE     The stand-in highlight is already in the right place, which is worth recording because it
         had to be repaired on cluster-node-drain. `rank` is the one step whose reduced branch lights
         pod1Box in place of the pulse, and rank leaves the Pod at full; by evict the class is gone
         because pod1Box is in resetStep's key list. So nothing holds .highlight at the terminated
         shade and the fade needs no onfinish. If a stand-in is ever added to evict, it has to be
         dropped on BOTH paths.
```

### poster

```
Three bands stacked at rising fill (0.03 dimmed, 0.04, 0.08) with a size-and-opacity ramp of dots
on the right, and the TOP band struck through with an X. One sentence: the Pods are RANKED and the
lowest-ranked one goes first. The X is the only event on the canvas.
Reading order is deliberately top-down against the brightness, so the eye lands on the crossed band
first and then discovers it is the faintest of the three.
```

---

## cluster-cpu-throttling

### layout

```
WHAT     A container hitting its CPU limit: the CFS quota, the stall at the end of every period, and
         the Kubelet finding out from cpu.stat.
LAYOUT   The deliberate TWIN of cluster-oom-kill, memory limit against CPU limit. It copies that
         card's skeleton so the pair reads as a pair and changes exactly one thing: the sibling's
         five-row ladder in the right column becomes the TIME SCALE, which is why the card exists.
         The frame is the family 152 at 380..532
         rather than the sibling's 388, because CHIPS_Y = NODE_Y + NODE_H + 16 solves to 380.
PANEL    x<=397, bottom 195 / 235 / 280, worst on `observe` at 386 characters.
BUDGET   Roughly 550 characters. The frame top is 380 and nothing is drawn left of 420 above it, so
         the clearance is 100 units. Re-measure rather than trusting that number.
NOTE     THE TIME SCALE IS THREE BARS STACKED, NOT SIDE BY SIDE. Side by side inside 480 units gives
         three 150 wide bars whose 50% fill is 75 units, and the caption naming the empty tail has
         nowhere to go. Stacked gives each period the full 480, a 240 unit fill and a right-aligned
         caption over the stall it names, and it reads as one clock running down the page rather
         than as three containers standing side by side.
NOTE     The bars are BARE rects, not box(), which is a geometry decision rather than a style one:
         three 480 wide blocks at y 236 and 296 land inside CENTRE-LOW's span and would put the
         low content centre on 750 against a want of 600, on a card centred on 600 by construction.
         The cost is that `render/palette.test.mjs` never sees them either, so their colours are pinned in one
         frozen BAR block: the channel list 125, 134, 255 is the cluster --tint-base-rgb, copied
         rather than referenced because an SVG presentation attribute cannot resolve a token.
NOTE     The scale rests at OPACITY.pending rather than at 0, which is a fact rather than a flourish:
         with cpu.max at its default there is no bandwidth enforcement and nr_periods is genuinely 0.
WHY NOT  Resting at 0 and appearing on `quota`. The rendered frames killed it: with the right column
         blank and the left owned by the panel, the two opening frames were two boxes and a Node band
         with a 480 x 164 hole between them, and `idle` is the poster, the first thing anyone sees.
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
NOTE     The Pod PULSES on `spend` and on `throttle`, and does NOT fade anywhere on this card. Those
         are the two steps where nothing travels and the container itself is the actor, first
         emptying the budget and then sitting dequeued, so the pulse is the only thing that says
         WHEN, and `M-01` makes a Pod the one element allowed to carry it. It does not pulse on
         `observe`: the sibling dims its whole Pod group on the kill, here the container SURVIVING
         is the answer, and a Pod that flinches when a metric is scraped would be saying something
         happened to it. Both pulses were read off the rendered frame at 450ms, the peak: the shell
         and the container box brighten together, which is the whole-Pod pulse the catalog draws.
NOT A DEFECT
         `report/arrival.test.mjs` reports one R2, its documented blind spot: cpu.weight turns over on `request`
         where the chip IS lit, and the tool sees it at `quota`. DO NOT close it by lighting
         cpu.weight on quota, which points the eye at the one chip that step does not touch.
```

### poster

```
One sentence: the budget runs out before the period does, every period, forever.

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
  run portion    50ms of 100ms     = half the bar, RUN_W = SCALE_W / 2 = 240
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
is TEN TIMES LESS than the 100 a fresh cgroup starts at". That linear conversion gives 10 for 256
shares, and both claims are false. The linear form is not even an approximation of the live one: it
disagrees at every row of the table above (4 against 17, 10 against 35, 39 against 100), and the
mapping compresses nothing, it is fitted so one CPU IS the default.
```

### before `const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, SCALE_Y]];`

```
OFFEDGE judges an endpoint against BLOCK faces and the bars are bare rects, so the (900, 176) end is
invisible to it. Not licence to be sloppy: 900 is the stack midpoint by construction (`SCALE_CX`), so
the line is centred on what it points at whether or not a rule can see it.
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

## cluster-oom-kill

### layout

```
WHAT     A container exceeding memory.max: the kernel's cgroup OOM killer, the SIGKILL, and the
         Kubelet learning about it through PLEG.
LAYOUT   The kernel right-aligns on CONTENT_R, so it runs 908..1140, level with the ladder, the
         right chip column and the Node frame. A fixed 56 units from the Kubelet instead puts it at
         716 + 56 = 772 and ends the block on 1004, 136 short of the content edge and flush with
         nothing.
NOTE     The kill dims the whole Pod GROUP, shell included. Fading only the inner container box on
         the argument that the sandbox survives reads as a half-finished render rather than as a
         statement. Opacity lives on podGroup and NEVER on containerBox, or the two multiply into a
         shade that is in no vocabulary. The cost is accepted: the picture no longer says the sandbox
         outlives the container, and that fact moved into the restart step in words.
NOTE     NO relationship line to the ladder, deliberately. The tie is only honest when ONE drawn block
         owns every row, and here `allocate` is the workload, `cgroup` and `OOMKill` are the kernel,
         `observe` and `restart` are the Kubelet: three owners in five rows. Hanging the ladder off
         the Kubelet would say it performs all five, which is what the card exists to deny.
BUDGET   Panel x<=397, y<=280 at 1100x800 on the oomkill step at 395 characters, against a frame top
         at 388. The ceiling is roughly 570: the longest narration that keeps the panel off a frame at
         388, which is a property of the FRAME and not of the current text.
NOT A DEFECT
         The `observe` step is not a return the motion never delivers. What it animates IS the claimed
         return: PLEG spotting the dead container travels kernel -> Kubelet on the answer lane of the
         pair, the correct direction. The other movement the sentence names, the Kubelet PATCHing
         status, goes to an API this card does not draw, and the Kubelet sublabel accounts for it in
         words. A return has to have somewhere on the canvas to go.
NOTE     `container state` reads `Running · not yet observed` on the kill step and turns over to
         `Terminated · OOMKilled · 137` on observe. containerStatuses[].state really IS still Running
         until PLEG relists and the Kubelet PATCHes, which is exactly what observe is about, so the
         value stays and now says why. `report/arrival.test.mjs` carries that as an R2-STEP finding
         (text changed, no highlight) and it stays carried: the FACT did not change, so a cue would
         announce a turnover a step before the one the card is built to deliver.
         `memory.current / max` reads `near 0 / 256Mi · processes killed` on observe, not `256Mi /
         256Mi · at limit` beside a container the same step calls terminated. It is `near 0` rather
         than `0` on purpose: a terminated container's cgroup outlives it until the Kubelet
         garbage-collects it and still holds residual charge, and a flat 0 would be one of the false
         absolutes this project keeps paying for.
MOTION   Two deferred turnovers, the network-dns-ndots shape. `observe` holds container state until
         the PLEG relist result lands (700ms). `restart` holds the container sublabel AND the three
         moving chips until create.arrivalMs: pinning at entry put a running container with
         restartCount 1 on screen while the box was still a 0.12 ghost. The sublabel is deferred WITH
         the chips deliberately, or `using 120Mi of 256Mi` sits on the box beside a chip reading
         `near 0`.
CONTENT  The oom_score_adj chip carries `900 Burstable 3 to 999, Guaranteed -997, BestEffort 1000`,
         which moved off the narration to buy nine lines back. The narration says the value is applied
         at container start FROM THE QoS CLASS, which is true of all three classes.
         DO NOT write `by memory request` there. Only Burstable scales with the request across 3 to
         999; Guaranteed is a flat -997 and BestEffort a flat 1000, and neither reads a request at
         all. Attached to a sentence about all containers it is a false absolute of exactly the shape
         a cut qualifier produces.
         The value is `applied` at container start, not `written`: the Kubelet passes it in the CRI
         create call and the RUNTIME touches /proc/PID/oom_score_adj.
CONTENT  The RUNTIME writes memory.oom.group, the Kubelet only asks for it. Verified against
         pkg/kubelet/kuberuntime/kuberuntime_container_linux.go:
           if isCgroup2UnifiedMode() && !ptr.Deref(m.singleProcessOOMKill, true) {
             resources.Unified = map[string]string{"memory.oom.group": "1"}
           }
         so the Kubelet puts it in the CRI LinuxContainerResources.Unified map and the runtime writes
         the cgroup file, which is what the restart step's wire label says. `Kubelet sets
         memory.oom.group` contradicted that comment one step later about the same file.
         The `ptr.Deref(..., true)` reads as though single-process were the default. It is not: the
         KubeletConfiguration doc on SingleProcessOOMKill says "On cgroup v2 linux, null / absent,
         true and false are allowed. The default value is false", so the nil fallback is defensive
         cover for non-Linux and cgroup v1 and on cgroup v2 the effective default is group kill.
         singleProcessOOMKill is a FIELD, not a feature gate, and an opt-OUT: a footnote rather than
         a condition, which is why it is not worth any of this card's narration budget.
```

### before `      F.route({ points: NODE_CONNECTOR, name: 'create' }),`

```
Kubelet creates the new container on the node (connector) and rewrites its cgroup
(top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
not chained). The container pulses and re-materialises on arrival.

The connector now stops on the Node frame rather than the Pod shell, so this route is 20 units
shorter than it was and every ball on it lands sooner. routeDur is length-based, so re-read the
span before assuming a timing here is unchanged.
```

### before `      F.top({ from: KERN_X, to: KUBE_R, y: DOWN_Y, name: 'relist', lights: ['kubelet'] }),`

```
NOT A DEFECT: the `observe` step is not a return the narration promises and the motion never
delivers. What it animates IS the claimed return: PLEG spotting
the dead container travels kernel -> Kubelet on the lower lane, which is the answer lane of this pair
and the correct direction. The other movement the sentence names, Kubelet PATCHing the container status
to terminated, goes to an API this card does not draw, and the Kubelet sublabel already accounts for it
in words (`PLEG + status patch`). A return has to have somewhere on the canvas to go.
```

### poster

```
A container box filled at 0.16 nearly filling its frame, and a lightning bolt drawn over it with
two short spurs. The fill is the memory used against the limit the frame draws, and the bolt is the
kernel doing the killing: the poster is about WHO kills, so the bolt gets the heavier stroke (2.1)
and the box gets no outline of its own.
No Pod, no Kubelet, no chips: everything that is not the cap and the strike is dropped.
```

---

## cluster-pod-sandbox-cri

### layout

```
WHAT     The Kubelet as a CRI CLIENT: containerd is what materialises the pause container, pulls,
         creates and starts, and CNI wires the sandbox namespace.
LANES    The turn has to go ABOVE both columns, because 120..235 is the only horizontal
         band on this card free of them, and the long leg then falls through the 490..620 gutter.
DO NOT   Turn at BUS_Y = NODE_Y - 16 and end on the Pod sandbox top midpoint. containerd centres on
         x=772, INSIDE the chip column (620..1140, y 235..437), so the 326 unit vertical leg goes
         straight through all four value chips on every one of the four steps that ride it. Nothing
         catches it: THROUGH scores blocks, and a value chip is not a block. WHERE A
         LANE TURNS DECIDES WHAT IT CROSSES, and the only witness for the chip column is a rendered
         frame.
LAYOUT   404 IS A HARD STOP, not taste: the panel measures x<=397 at 1100 width at every height and
         the top row at y 40..120 sits inside that band, so seven units is the entire clearance. It
         is a viewport-WIDTH effect, not a text-length one, so a longer narration cannot eat it.
         The room for the arrows therefore could not come from moving left and had to come out of the
         BOXES. They carried 70 to 95 units of dead padding per side against measured widest inner
         labels of 60, 90 and 66, so widths went 200/280/180 -> 180/210/180 and TOP_GAP went 30 -> 83.
         Each call and return pair now has better than twice its old run.
NOT A DEFECT
         `render/motion.test.mjs` reports PULSE-TOGETHER (`M-03`) twice here, on `create` and on
         `start`: the app container blinks and the Pod holding it does not. Both are deliberate and
         this is the only card in the catalogue that does it, which is why the check carries an
         explicit ceiling of 2 for this id rather than staying silent.
         The card draws TWO groups inside one shell. `sandboxGroup` is the Pod (shell plus the pause
         container) and it pulses on its own beats, `run` and `conf`. `appGroup` is a second inner
         box the `tune` hook adds INSIDE that shell so the workload container can fade and blink on a
         beat of its own, which is what those last two steps are about: CreateContainer materialises
         it at `pending`, StartContainer takes it to full. The sandbox does not change on either step.
DO NOT   "Fix" it by pulsing `sandboxGroup` on those two steps. The whole Pod would blink for an
         event that happens to ONE container inside it, at the exact moment the eye is meant to be on
         that container coming up out of nothing, and the card would then say the sandbox is
         re-created per container, which is the misreading the pause container exists to prevent.
```

### before `      key: 'sandboxGroup', id: 'sandboxGroup', shellKey: 'shellEl', innerKey: 'pauseBox',`

```
The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
and the workload container (created at CreateContainer, started at StartContainer).
Centred on CX, under the point where the zigzag enters the Node frame.
```

### before `    P.packets(),`

```
Z-order canon: packetLayer rides above the static wires but below the
blocks, so the ball reads on its connector and arrival is told by the pulse
(matches every other node card; the center connector travels in open space).
```

### poster

```
A Pod frame holding two container boxes, both dropping a short dashed line into ONE bar underneath
them, with a circle on that bar. The bar is the sandbox and the circle is the pause container: the
sentence is that the containers sit ON something shared rather than beside each other.
The bar is filled at 0.12 with no stroke, so it reads as a floor rather than as a third box. The two
dashed legs are the only thing connecting the tiers, because nothing travels between them.
```

---

## cluster-scheduler-decision

### layout

```
WHAT     THE CLUSTER EXEMPLAR. One scheduling cycle: watch, filter, score, bind, and the Kubelet on
         the chosen Node picking the Pod up.
NOTE     CENTRE passes because the chip strip pools EVERY .scheme-chip: the ladder rows (60..540) and
         the verdict chips (60..1140) keep the strip centred on 600 with the value chips on the right.
OPEN     The panel bottom at 1100x800 is exactly 180, so at the NARROWEST viewport the leftmost ~97
         units of that horizontal run and the corner turn pass behind the panel, and the line reads as
         emerging from under its bottom-left edge. At 1280 and wider the whole route is clear. The two
         constraints are mutually exclusive: the equidistant point IS the worst-case panel bottom.
         JOG_Y 190 would clear every viewport at 50/30 instead of the 40/40 it takes today (the band
         is TOP_BOTTOM 140 to LADDER_Y 220, 80 units, and JOG_Y is its midpoint), and is the fallback
         if the panel ever grows.
BUDGET   Narration length is LOAD-BEARING here. Panel bottom at 1100x800 goes 155 -> 180 -> 205 in
         one-line steps, and 205 swallows the turn entirely. `bind` was drafted at 275 characters,
         measured 205, and ships at 241. Measure at 1100x800 after ANY narration edit, not at the
         default 1600.
NOTE     The ETCD -> Api return lane wore an arrowhead no ball had ever ridden. It was NOT demoted to
         a relationPath: the four top-row lanes are two mirrored request/answer pairs, and sinking
         half of a pair leaves the survivor reading as the senior lane. The answer was DRAWN instead:
         bind runs three hops, POST -> persist -> commit ack, chained on arrivalMs + BEAT.afterHop.
         rv=903 on the persist wire was always etcd ANSWERING, so the ball carries a value the card
         already showed.
NOTE     `reset` on this card carries `keys` ALONE: there is no `pods` list, and its absence is the
         decision rather than an omission (no card in the catalogue writes an empty one, so the
         absence is how the decision is spelled). The card pulses `placedPod` and never takes that
         pulse back, and the `pods` argument of `clearHighlights` runs `clearPodHighlight`, which
         clears four inline properties
         per matched rect (stroke, stroke-opacity, stroke-width, transition) and no class at all. So
         inferring pods from the parts list, which is otherwise the obvious generalisation, would
         wipe the styles the placed Pod's final look depends on. Nothing in `npm test` reads inline
         stroke styles, so the only way to see that difference is to serialise the tree and diff it.
         The mirror of this defect is a `.highlight` on a Pod inner box that was NOT named in the
         keys list and therefore leaks (`S-19`), and the two are why neither argument is derived.
NOTE     `score` lights the Scheduler, as `filter` does. Both are equally the Scheduler's own internal
         work and neither moves a packet, and on a step with no motion the highlight is the ENTIRE
         beat, so an unlit Scheduler reads as going idle to do its scoring.
CONTENT  `reaches the Scheduler on its watch ... pops it off the active queue and runs one scheduling
         cycle`. `per-pod cycle` was invented vocabulary, and cluster-pod-priority-preemption already
         says `runs the scheduling cycle`, which is also the upstream name.
         `filter` names percentageOfNodesToScore: a large cluster stops filtering once enough Nodes
         fit, so `evaluate every Node` was a naked absolute only true at this card's four-Node scale.
         The desc says `filters out THE Nodes that cannot fit it`, not EVERY Node, caught by the
         internal-contradiction pass the moment the filter step grew its early-stop clause.
         `The Kubelet on Node-4 watches ...`, not `Node-4 sees the Pod`: a Node does not watch
         anything, its Kubelet does, and the Scheduler box one row up is the card's own example.
         The desc is what CONVICTED that one: it had said "the Kubelet on the chosen Node picks the
         Pod up on its own watch" since it was written. Two carriers of one fact, one of them wrong,
         and reading them side by side is the whole technique.
NOTE     Chain row 2 keeps `fail predicates`. It is legacy vocabulary next to Filter plugins, but
         cluster-pod-priority-preemption uses the same word and kubernetes.io still glosses Filter
         plugins as the successor to predicates, so changing it here alone buys cross-card drift.
NOTE     `score` names the preemption card (`See the Pod Priority and Preemption card.`), which sits
         one stage further on. It went on score rather than on filter, where PostFilter belongs by
         subject, purely for the character ceiling: filter is at 248 characters and score at 250
         WITH the pointer already in it, and both land on the same five-line panel bottom of 180,
         which is the card worst case. The pointer sentence is another 41 characters and filter has
         no room for it: one more line takes the panel from 180 to 205, which swallows the turn.
```

### poster

```
The Pod scored against three candidate nodes, then BOUND to the highest-scoring winner (a bright
dashed link) while the passed-over nodes get the same links dim, with shorter score bars.

The three links are a trunk and bus, not diagonals: both losing lanes leave the Pod bottom, turn 90
degrees at y=82 and drop into their own Node top face at its centre, and the winner runs straight
down. Unlike the leader-election poster the turn cannot land on a Node SIDE face, because a lane
reaching the left Node's right edge would cross the middle Node on the way. Every lane ends ON the
Node top edge at 104, not short of it.

Three Nodes with the MIDDLE one winning while the card binds to the rightmost. Deliberate, same
reasoning as the leader-election poster: the boxes are unnamed, and moving the win to an edge box
sends the straight lane to a loser and the turning lane to the winner.
```

---

## cluster-static-pods

### layout

```
WHAT     The asymmetry between a file on disk and its API shadow: the Kubelet runs the static Pod,
         the mirror Pod is only a record, and deleting the record changes nothing.
LAYOUT   THREE tiers, not the Node family's two, because the card draws the API band and the Node
         band at once.
PANEL    x<=291 y<=160 at 1600, x<=378 y<=193 at 1280, x<=397 y<=230 at 1100, worst on drain.
BUDGET   390 characters per narration. Nothing in tiers 1 and 2 starts left of 450, so what has to
         be cleared is the Node frame at 380, not the blocks.
NOTE     kubectl is on the RIGHT (772..1004). The API is centred on CX so the mirror Pod hangs
         straight below it and the Kubelet create lane is one vertical drop with both endpoints on
         face midpoints, which leaves only 64 units (420..484) for a 232 wide box on the left. The
         cost is a top row reading right to left, carried by an arrowhead per direction and a wire
         label over the gap at x=744.
DO NOT   Ride a ball down the API tie. The delete lands ON the API and what the reader sees next is
         the object under it going dark, which is what deleting a mirror Pod is. The container in
         the Node band does not move once.
NOTE     Three blocks are born on three different beats and their lanes with them, so all six are
         pinned in ONE pass. An absent block holds OPACITY.pending with a sublabel saying so, and
         each lane takes the shade of the FAINTER end. One exemption, on the delete step: the
         Kubelet create lane stays at full, because the recreate rides it a beat later.
NOTE     MIRROR_FADE is 1200, not FADE.out 700, the same value POD_FADE and VICTIM_FADE carry on the
         sibling Node cards: at 700 the block is gone 200ms before its own pulse finishes and the
         deletion reads as a cut. Step 4 is the longest on the card and its 4700 is not padding:
         request 700, answer home 1500, mirror pulses and dissolves from 1600, recreate leaves at
         2900 and lands at 3600. span 3700.
CONTENT  The mirror Pod is `static-web-Node-1`. Upstream suffixes with the node hostname and this
         catalog's Node is `Node-1`, so the suffix is visibly the Node name, which is the point of
         the sentence. `static-web-node-1` would put a bare lowercase `node` into narration prose,
         where `render/inline.test.mjs` is right to fail it.
CONTENT  The drain step gives the MECHANISM, not the reference's parenthesis. `cannot be deleted
         through the API server at all` contradicts step 4, which deletes one through the API
         server: the reference means the delete accomplishes nothing, not that it is refused, and
         the docs show the command reporting success. Two more absolutes went with it: `moving the
         file out of the directory stops it for good` is false (moving it back brings the Pod
         straight back), and the real documented limitation is that the spec cannot refer to other
         API objects such as a ServiceAccount, ConfigMap or Secret, which the narration now names.
NOT A DEFECT
         The Kubelet lane crosses the Node frame top edge. `render/geometry.test.mjs` excludes
         isFrame blocks from THROUGH by construction.
NOT A DEFECT
         `report/arrival.test.mjs` reports two R2s, both its documented blind spot. `static Pod` is written on
         arrival on `kubelet-starts` and on `edit-file`, the two steps that carry its highlight. DO
         NOT light the chip on `mirror` or `drain`, where nothing happens to the container.
         The same probe carries one R2-STEP on `edit-file`: `mirror Pod` reads `static-web-Node-1`
         again after `delete-mirror` walked it present, gone, back INSIDE that step. The name coming
         back is the steady state, not news, and the news of `edit-file` is the container restarting,
         which is the chip that IS lit.
```

### poster

```
The sentence: the file on disk is the real thing and the API object is its shadow. A dashed Node
band in the lower two thirds holds two solid blocks, the manifest file and the container it starts,
tied by a dashed leg. The file carries the accent at 0.9, the container at 0.3. Above the band, over
clear air and on one dashed leg, a single dim dashed block for the mirror Pod (fill 0.03, 0.45).

The API server is NOT drawn: it would need a fourth block for a poster whose whole claim is about
two, and the dim dashed block already reads as "somewhere else, and lesser".
```

## cluster-pod-priority-preemption

### layout

```
WHAT     PostFilter: when filtering leaves no feasible Node, the Scheduler preempts a lower-priority
         victim and binds the pending Pod into its slot.
LAYOUT   Four across was 258 and six of the eight chip strings
         collided, including `Pod NEW · pri` against `2e9 (system-cluster-critical)`.
LANES    The Scheduler never reaches a Node. It writes to the API and the Node acts on what it reads,
         so picking one owner would have lied about the other.
CONTENT  Rung 2 named a phase the step it lights excludes, and no longer does. It read `2. attempt ·
         Filter + Score · NoFit on every node` while the narration beside it says every Node fails
         Filter, and Score never runs when Filter empties the list, which is precisely why PostFilter
         is reached at all. It reads `2. attempt ·  filter · NoFit on every node` now, 8 characters
         shorter, so nothing about the column width moves. Score is not lost from the canvas: it stays
         on the Scheduler sublabel, which is the plugin ROSTER rather than a claim about this step.
NAMING   The plugin-phase names on the canvas are LOWERCASE, and the Scheduler sublabel was the one
         string out of line, `filter + Score + Preempt` capitalising two of the three words it wrote
         `filter` in. It is `filter + score + preempt`. T-09 is the rule, a block LABEL is a heading
         and takes a capital while everything else on the canvas is body text, and a sublabel is body
         text. The sibling that walks the same scheduling cycle confirms the case rather than the
         rule alone: cluster-scheduler-decision draws `2. filter` and `3. score` as rungs and
         `queue, filter, score, bind` in its aria-label. Neither word is in `terms.json`, so no
         dictionary entry rescues a capital.
         WHY NOT close the drift the other way and capitalise both sides. System A in
         `render/inline.test.mjs` judges the FIRST TOKEN only, so `Filter + Score + Preempt` puts
         `Filter` first, `isIdentifier` rejects it (it matches none of the six shapes, the
         initial-capital-then-capital one included) and the dictionary does not carry it, so the
         sublabel scores DOWN and the gate goes red. That same test is BLIND to the rung either way,
         because its first token is `2.` and a token holding a digit is an identifier: the rung was
         found by reading it against its own narration, not by a check. The narration keeps its
         capitals (`Filter plugins drop every Node`), which is prose, outside System A, and what the
         exemplar does too.
NOTE     Slot 0 is the victim it preempts (Pod A) and the slot Pod NEW is bound into, which is why
         everything sent down addresses it. Same one-slot-two-identities shape cluster-resource-quota
         uses for its refused block.
DO NOT   Draw Pod A at 0 on the delete step. A Pod inside its terminationGracePeriodSeconds is the
         most present thing on the diagram, not an absence, and the victim chip on that same step
         reads `Pod A · Terminating` while the narration spends two sentences on the grace period it
         is serving. It holds OPACITY.terminating and keeps its slot, and leaves it on the BIND step,
         where the narration says it has exited and its capacity has returned to the Node.
DO NOT   Say preemption runs NO PDB CHECK. It runs one, twice: once choosing the victim set and once
         ranking candidate nodes (`pkg/scheduler/framework/preemption/preemption.go` threads `pdbs`
         into `SelectVictimsOnNode` and scores with `minNumPDBViolatingScoreFunc`). The reference is
         explicit: "Kubernetes supports PDB when preempting Pods, but respecting PDB is best effort.
         The scheduler tries to find victims whose PDB are not violated by preemption, but if no such
         victims are found, preemption will still happen". The ladder rung, the focus chip and the
         `desc` all read `no PDB check` while the delete narration on this same card already said
         `victim choice prefers PDB-friendly sets`, and that internal contradiction is what found it.
         The distinction the card reaches for is real and stays: preemption is a plain DELETE and not
         the Eviction API, so the budget is honoured BEST EFFORT rather than enforced. Rung 4 and the
         focus chip both read `standard DELETE · PDB best effort` now, and the `desc` says `not an
         eviction, so a PodDisruptionBudget is honoured best effort, not enforced`. That desc is 462
         characters, so there are 8 left before D-04 fails.
         https://kubernetes.io/docs/concepts/scheduling-eviction/pod-priority-preemption/
DO NOT   Call it the PriorityClass admission plugin, and do not say a raw spec.priority is refused by
         VALIDATION. Both were on the spec step. The plugin is named `Priority`
         (`plugin/pkg/admission/priority/admission.go` sets `PluginName = "Priority"`, and the
         reference lists "Priority, Type: Mutating and Validating"); `PriorityClass` is the API object
         it reads. It is that plugin and not API validation that refuses the field, and only when the
         supplied value DIFFERS from the one it computed: `if pod.Spec.Priority != nil &&
         *pod.Spec.Priority != priority`. The conclusion the step draws is unaffected, so it stays
         word for word: PriorityClass is the only route.
         The WIRE deliberately still reads `PriorityClass admission`, and it is not the same defect:
         it names the admission stage by the field it acts on and never calls that the plugin name.
         DO NOT rewrite it to `Priority admission plugin`. It was, and T-09 in
         `render/inline.test.mjs` went red: a wire is a `scheme-label`, System A wants body text
         lowercase, and `Priority` alone is neither an identifier by its shape nor a dictionary name,
         so it scores DOWN. `PriorityClass` passes because `^[A-Z][a-z]+[A-Z]` reads it as an
         identifier. Lowercasing it to `priority admission plugin` would pass and would print the
         plugin name wrong, so the wire keeps the field.
         https://kubernetes.io/docs/reference/access-authn-authz/admission-controllers/
NOTE     THE CARD MOVED FROM WORKLOADS TO CLUSTER, because preemption is the PostFilter stage of the
         same scheduling cycle cluster-scheduler-decision walks. The old id still resolves through
         SCHEME_ALIASES. Three things changed with it: the kit import (so the pulse carries
         CLUSTER_TINT), the chips and packets took role 'cluster', and the four Pods kept role
         'workloads' but gained the family violet override every other Cluster card with a Pod
         carries, so the resting stroke matches the pulse base.
         WL is a Workloads-kit export and does not exist on cluster-kit, so the X grammar is read
         off cluster's own names at the same values: the magnitudes from `CLU` and the ladder band
         from `LAYOUT.C.ladder`, which is where LAD_X 660 and LAD_W 480 come from. Geometry, steps,
         narration, chips, motion and poster are unchanged.
NOT A DEFECT
         The two off-card actors in `bind` are deliberate. `The controller owning Pod A puts a
         replacement elsewhere or queues it` and `where Kubelet evicts over-request Pods first` both
         describe events explicitly OFF this card: a replacement placed elsewhere, and a mechanism
         the sentence itself marks as covered separately. Neither points the reader at a box that
         should be on the diagram. Do not file these again.
         Nor is `NoFit on all nodes`, the wire `filter all nodes`, the rung `NoFit on every node` or
         `scans the running Pods on each Node` a defect against the ONE drawn frame. The frame is
         labelled `Node-1`, a numbered member of a set the way cluster-node-failure draws Node-1 and
         Node-2, and preemption only starts once no Node fits, so a card that said `NoFit on Node-1`
         would state the smaller fact that does not produce the behaviour. The card follows the one
         Node the victim sits on, which is what the aria-label's `on a full Node` says.
```

### before `opacity: { ...STANDING, pod1: OPACITY.terminating },`

```
DO NOT pin Pod A to 0 and animate it 1 -> 0 on the eviction packet arriving. The victim chip on that
same step reads 'Pod A · Terminating' and the narration spends two sentences on the grace period it
is serving: a Pod inside its terminationGracePeriodSeconds is the most present thing on the diagram,
not an absence. It holds OPACITY.terminating and keeps its slot, and leaves the slot on the BIND
step, where the narration says it has exited and its capacity has returned to the Node.
```


### poster

```
A bright box at 0.16 with a heavier stroke above a Node frame holding three Pods, and the first of
the three is dimmed, dashed and struck through. The brightest fill is on the ARRIVING Pod and the X
is on the one that pays for it: the whole sentence is that one displaces the other.
The dashed leg down is admission, not traffic, so it carries no arrowhead. The two surviving Pods
step 0.07 and 0.13 to keep the row from reading as three equal things.
```