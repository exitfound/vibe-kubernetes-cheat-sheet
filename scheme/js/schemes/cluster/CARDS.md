# Scheme card design notes: cluster

The per-card design record for `js/schemes/cluster/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The rules are not here.** Catalog-wide rules are `scheme/CANON.md`, and this category's own rules
are `./CLAUDE.md`. A note below records only where a card DEVIATES from them, or a number that needs
explaining. Sister records: `CARDS.md` in the other three category folders, and `scheme/INTERNALS.md`
for the shared sources (catalog, lib, CSS). None of them ships (`S-41`).

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`check-notes` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. `### layout` describes the whole card in labelled blocks,
`### poster` describes the grid thumbnail, and each ``### before `<line>` `` holds the note for one
line of code. `check-notes` verifies every anchor still occurs in its card, so **an anchor is DATA:
never reword one** (`S-38`).

The label vocabulary a `### layout` block uses is ONE list for all four records, in
`scheme/CANON.md` under "The record vocabulary". Use the labels that apply, in that order, and add
none of your own.

Panel extent is per card: the right edge is `x<=397` catalog-wide, the BOTTOM ranges 90 to 504 over
the standard viewport set, and it moves NON-MONOTONICALLY (`L-02`, `L-04`, `L-05`). So a `PANEL_B`
in a card is a measurement, not a convention. Re-measure with
`VW=1100 VH=800 node overlay-measure.mjs <card>` after any prose change: several cards here carry a
hard character ceiling and the gate enforces none of them (`L-08`).

---

## cluster-admission-webhooks

### layout

```
WHAT     A write running the admission gauntlet: authn/authz, mutating, schema, validating, then the
         persist to ETCD. Six stages hanging off the API as one pipeline.
LAYOUT   The L read correctly. The panel owns the top-left, so API_X is 420 (first multiple of 20
         clear of the measured right edge 397) and kubectl sits in the freed BOTTOM-left, its
         request climbing a riser in the 397..420 corridor before turning into the API's left face.
           CONTENT_L/R  60 / 1140, M = 60 off each edge
           CX           600, derived as (CONTENT_L + CONTENT_R) / 2
           BAND_L/R     100 / 1100, the content band inset by 40
           ETCD_X       956, BAND_R - ETCD_OPTICAL - ETCD_W
           LADDER_X/W   420 / 400, hanging under the API and inheriting its width, so the six
                        stages read as belonging to it
           CHIP_W       490, (BAND_R - BAND_L - CHIP_GAP) / 2
         panel bottom 230, measured. The nearest thing under the panel corner is kubectl at KCTL_Y 300,
         so 70 units of clearance.
LANES    Both kubectl lanes leave its TOP face, straddling KCTL_CX by LANE_DY the same way they
         straddle the API face centre at the other end, each ONE right angle: up, then across. Out
         is left of back at both ends, which is what keeps them from crossing.
         The API-to-ladder connector is a relationPath: no arrowhead, no ball, landing ON the ladder
         edge at LADDER_Y. The six stages ARE the API, so nothing travels down to reach them.
WHY NOT  Chips four across at 258. The longest value is `{cpu=100m, runAsNonRoot=true}` on the
         `Pod object` chip, and at 258 it overlaps its own name. Two across at 490 is the floor here.
WHY NOT  Jogging each lane right into the 404..416 corridor before rising, to keep every segment out
         from under the panel. Rejected as a zigzag; the single right angle is the shape that ships,
         and its cost is the OPEN entry below.
WHY NOT  Moving kubectl so its centre clears x=397: it collides with the ladder column at 420..820,
         or below the ladder with the chip strip at y=520. Widening it breaks the left-edge
         alignment the inset band exists to give. There is no third option, which is why this is
         written down rather than left to be rediscovered.
NOTE     ETCD is pulled 4 units inside BAND_R while the chips sit flush on it. That is an OPTICAL
         correction: flush, the two right edges differ by one antialiased pixel, yet the cylinder
         reads as overhanging because its right wall is straight while the chip is a rounded rect
         whose rx=4 pulls its own edge in. The inset IS that rx.
OPEN     Both kubectl risers run behind the overlay from the bottom up to their turn. Measured
         against the panel worst case with the two lanes 430 and 370 units long:
           KCTL_TO_API  120 of the 215 riser + 192 of the 215 crossing at y=85   =  73% hidden
           API_TO_KCTL  162 of the 185 crossing at y=115 + 90 of the 185 riser   =  68% hidden
         So it is not the out lane alone and not its left third: on the two steps that carry these
         balls the reader sees a stub leaving kubectl and an arrowhead arriving beside the API, with
         most of the flight behind the overlay. Nothing measures this: OCCLUDED scores BLOCKS, never
         lanes or packets. At 1280 and wider most of it returns.
         WHY NOT a staircase into the free 404..416 corridor: built first, rejected as a zigzag.
         There is no third option, because the API face it must reach sits at y=85/115 above the
         panel bottom, and every kubectl position whose centre clears x=397 collides with the ladder
         column at 420..820 or the chip strip at y=520. Reopening this means moving the API row.
BUDGET   The panel bottom is a LINE count, not a character count: the validating step measured 205
         at 257 characters and 230 at 274. Do not count characters on this card, measure it with
         `VW=1100 VH=800 node overlay-measure.mjs cluster-admission-webhooks`.
CONTENT  LimitRanger is named in BOTH the mutating and the validating steps, which is what the
         reference types it ("Mutating and Validating") and what cluster-resource-quota spells out.
         The validating step opens `LimitRanger is back to check min and max` so the repeat reads as
         deliberate rather than as a duplication bug.
         Row 4 is `types and required fields checked`, not `validate against OpenAPI schema`: for a
         built-in kind the API server runs its own Go validation, an OpenAPI structural schema is
         what a CUSTOM resource is checked against, and type errors are caught earlier still when
         the body is decoded.
         ValidatingAdmissionPolicy is in the default-enabled list, so the validating stage has THREE
         paths and row 5 says "policies".
DO NOT   Name DefaultStorageClass as the always-on mutating example. It acts on
         PersistentVolumeClaims, and this card follows a Pod. DefaultTolerationSeconds is the one
         that applies.
DO NOT   Leave the Api box dark on mutating, schema and validating. Those three carry no motion, so
         with the Api unlit the only thing on screen is one ladder row, and the block whose pipeline
         the card is about reads as idle for half its length.
```

### poster

```
One sentence: a write passes a rewrite gate and a check gate before it reaches storage. Four
elements left to right chained by dashed links: the request as a small box with three text lines,
the mutating gate as a dashed box carrying a squiggle, the validating gate as a dashed box carrying
a tick, and the etcd cylinder. The two gates are DASHED while the request and the cylinder are
solid, which is the whole idea in one attribute: the ends of the chain are fixed, the middle is
pluggable. No ladder, no kubectl, no chips, no API frame.

Emphasis is FLAT on purpose, all four at 0.04 to 0.06, where the canon asks for one brightest
element.

DO NOT raise the two gates to 0.16 as a canon fix. It was tried and reverted on sight. The open
question, if flat emphasis is ever revisited, is whether a poster whose subject is a PAIR can take
the single-brightest treatment at all: brightening both is two focal points, and brightening one
means choosing between mutating and validating on a card about both.
```

---

## cluster-api-structure

### layout

```
WHAT     How a controller sees the cluster: discovery, an initial LIST served from the API's watch
         cache, then a watch stream filling an informer and its indexer.
LAYOUT   GVR ladder left 60..360, the API / Informer / Indexer spine on CX, chips right 840..1140,
         the watch event timeline along the bottom centred on 600. The ladder shares the chips' 32
         row height and 38 pitch and sits a symmetric 110 off the Informer's left edge.
PANEL    291/125, 319/143, 378/150, 397/180 over 1600 / 1440 / 1280 / 1100. 180 is the floor the
         left column starts under.
LANES    The two ETCD lanes leave the API on its RIGHT face, run down the corridor between the
         Informer column and the chip column (RISER_OUT_X 764, RISER_BACK_X 740, out to the RIGHT of
         back so they never cross) and enter ETCD on its LEFT face at ETCD_CY -/+ 12. The Client link
         is a SINGLE lane on the centre line: only the discovery request is ever animated, and a
         second arrowhead pointing back would read as traffic no step sends.
WHY NOT  Dropping the ETCD lanes at ETCD_CX +/- 12 from the top row: both risers then run straight
         down through all three state chips.
WHY NOT  Moving the chip column left. The chip strip pools value chips AND chainList rows AND the
         event slots, and it centres on 600 precisely BECAUSE the ladder holds 60 while the chips
         hold 1140. Nothing else can hold 60: the event slots start at 290 and widening them moves
         the timeline off the spine.
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
         check-chipfit is silent on `eventSlot`, which draws two STACKED texts rather than a
         name/value pair. The tool skips chips whose two texts sit on different baselines.
OPEN     THE PROCESS FRAME. Client, Informer and Indexer are ONE process drawn as three independent
         blocks with no boundary, so the Client reads as an actor talking to an informer it contains.
         One dashed frame around the three is the fix and it is NOT done, because every placement
         that passes check-geometry costs more than the finding does. All three were measured:
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
         A notched outline (a hexagon with a bite where the ladder sits) is geometrically free and was
         DECLINED: a Tetris-shaped process boundary asserts a shape the mechanism does not have. What
         a future attempt has to buy is not the frame but a home for the discovery catalogue that
         keeps a chip on x=60, keeps the spine straight on CX, and does not push the timeline off it.
         The general reason the three placements above all fail, re-derived 2026-08-06: the Informer
         (235..307) shares its horizontal band with the ladder rows (217..330), and the Client is at
         60..300 against a centre column at 510..690. So ANY frame holding the Informer and reaching
         left to the Client crosses the ladder, and any frame clearing the ladder loses the Informer.
         Restacking the Client into the column instead needs about 100 more units and the slot row
         starts at 548. The finding stays open until the catalogue moves.
```

### poster

```
Three stacked 160 x 22 rows on the left standing for the listed objects, three short dashed legs off
their right edges, and six dots trailing away to the right in two sizes and three opacities, the
stream of later changes arriving over the open watch.

OPEN, and known: at grid size this reads as rectangles joined by dashes, the same silhouette as
cluster-server-side-apply, and the 2 and 2.5 radius dots are near-invisible at the ~200px the grid
renders. A pipe version (API block, cache block, one long horizontal channel carrying four event
cells) was built and declined. Rework FROM the shape above rather than replacing it with the pipe.
```

## cluster-apply-flow

### layout

```
WHAT     A manifest becoming a running Pod. Every handoff AFTER the write is one component reacting
         to a change on its own watch rather than a call from the component before it.
LAYOUT   cluster-architecture's grid with the tier-2 centre column empty, one Node block instead of
         three, and a client standing OUTSIDE the frame. Measured off the rendered DOM at 1600x1000:
           Control plane frame  150..1050 x  90..440
           Node-1 frame         150..1050 x 475..628
           top row      140..220   API 490..710, ETCD 900..1030. The LEFT slot 170..390 is EMPTY,
                                   which is what keeps this card out of the panel's column
           kubectl      225..305   1060..1190, OUTSIDE the frame, centred on its right wall
           tier 2       328..408   controller-manager 170..390, Scheduler 810..1030, centre empty
           Node-1       475..628   Kubelet 170..390, Runtime 490..710, Pod 810..1030
         Everything horizontal derives from FRAME_X 150 and FRAME_W 900 through PAD 20: IN_L 170 and
         IN_R 1030 are the walls every block sits on, CX 600 is the frames' centre and the API's.
         FLANK_W 130 is architecture's ETCD width, used twice, for ETCD and for the client. Every row
         and column matches cluster-architecture to the unit, verified by measuring both cards.
PANEL    x 291 / 378 / 397, bottom 143 / 171 / 205 on the worst step. The first block under it is
         the controller-manager at 328, so 123 units of slack at the worst viewport.
LANES    Nine static lanes, every one built from the SAME points array its ball rides.
         Two to the client, the only lanes leaving the frame: up out of its TOP face, level across
         the band above the frame at 50 and 70, down into the frame's top face at 590 and 610.
           POST      (1135, 225) -> (1135, 50) -> (590, 50) -> (590, 90)
           POST_ACK  (610, 90) -> (610, 70) -> (1115, 70) -> (1115, 225)
         Two to ETCD, a mirrored pair on the row centre line at OUT_Y and BACK_Y.
         Four into tier 2: the watch goes out and lands on the OUTER side of its box, the write comes
         back from the INNER side, both levels DERIVED from BAND_CY rather than offset from the row.
         Then the Node lane, a single straight vertical down the spine.
DO NOT   Swap which side of each face the client pair takes. The out lane runs on the upper level 50
         and the return on the lower 70, so an out vertical standing LEFT of where the return turns
         down cuts through the return horizontal. At the client the out lane takes the OUTER slot and
         the return the inner one; at the frame it is the mirror. Both pairs straddle their own face
         midpoint.
NOTE     The lanes are addressed to the CONTROL PLANE, not to the API, exactly as the Node lane is
         addressed to the Node. What receives the POST inside is still the API, which is why it
         lights on arrival: it is the door rather than a stop along the way.
NOTE     The Node lane is TWO points with no turn: [[API_CX, TOP_BOTTOM], [API_CX, NODE_Y]], leaving
         the API bottom face midpoint and landing on the Node frame TOP face midpoint, both 600 for
         free. Any jog reads as addressed to the KUBELET, where what it carries is a watch stream
         arriving at the NODE.
WHY NOT  Giving the client the API's 220 width. The band outside the wall is 150 units and 130 is
         that band minus two 10 unit margins. Widening needs the frames moved, which carries the
         centring, or a wider viewBox: the viewBox width available is 1200 at 1280x860 and below, so
         there is slack only while the dialog is wider than about 1.88:1, 39 units at 1600x1000. +90
         shrinks the whole card by 7% at 1280x860, and R-viewbox holds all 108 cards on 0 0 1200 640.
OPEN     CENTRE reports content 150..1190 centred on 670 and CENTRE-LOW reports the same span. Both
         are the client hanging off the right of a composition centred on the frames. DO NOT close
         them by re-centring: it drags the frames off 600, which is what keeps the Node lane one
         straight segment.
OPEN     The stack sits low because ETCD once held the LEFT slot, in the panel's column. ETCD is back
         on the right and nothing on either card sits in that column now, so the drop is unpaid for
         on BOTH cards. What it still buys is that the two cards agree in both axes. Raising the rows
         is available and is a TIMING change, because routeDur is length-based.
CONTENT  The HTTP mechanics: POST to the collection path on a create, 201 Created back, PATCH on an
         object that already exists, the field selector spec.nodeName, the binding subresource, watch
         event type ADDED, and the name chain my-app -> my-app-7d4 -> my-app-7d4-abc.
         The controller step animates FOUR balls, not one out-and-back: watch the Deployment, create
         the ReplicaSet, watch the ReplicaSet, create the Pod. The narration names TWO handoffs by
         TWO controllers and the desc makes it the card's whole point.
         The create-pod step draws the Runtime as a block and takes TWO hops, CRI from the Kubelet
         then the container coming up into the Pod. One ball Kubelet-to-Pod reads as the Kubelet
         creating the container itself.
DO NOT   Promise a status report back from the Node. The card draws no lane from the Node to the API,
         and adding one means splitting the straight API-to-Node spine into a mirrored pair.
NAMING   Titled `From Manifest to Running Pod`. A CLI verb names one step of seven, and
         `Kubectl Apply` beside `Server-side Apply` two cards away invites the reader to guess which
         is which. `Watch` or `Reconcile` was rejected: the catalog already holds `List-Watch and
         Informers` and `Kubelet Reconcile Loop`. app.js searches title + desc, so the desc keeps
         "between kubectl apply and a running Pod".
```

### poster

```
Sentence: a manifest walks DOWN a chain and comes out the far end as a Pod.

A descending staircase of four 72 x 38 blocks, each 76 units right and 40 lower than the last:
manifest, API, controller, Pod. Three dashed legs leave a block's right face, run 40 right and turn
down into the next block's top face, so the risers read as the handoffs. Only the last block is lit
(0.10 against 0.04) and only it carries the accent bar at 0.9, the first three at 0.3: the sentence
is about what the chain PRODUCES. The 40 unit drop against a 38 unit block means consecutive steps
barely overlap in y, which is what makes the diagonal silhouette survive the ~200px the grid renders.

DO NOT go back to a row of boxes on one horizontal axis. That version was indistinguishable from
cluster-delete-flow on the grid, and the mirror-of-delete-flow idea behind it (fills rising against
fills falling) is invisible at grid size. Direction is carried by SHAPE here.
```

### before `const client = box({ x: KCTL_X, y: KCTL_Y, w: KCTL_W, h: BOX_H, label: 'kubectl', role: 'cluster' });`

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
`write Deployment my-app` measures 153 rendered and `ack . rv=842` measures 80, so both clear their
blocks with air either side.

The CLIENT pair cannot use this register: its lanes are 100 units above the row, in the band over the
frame. Its two labels share ONE register at y=34, centred at 862 on the level run they ride, and they
can share it because they never share a step (POST is step 1, the 201 is step 3). WHY NOT inside the
frame at the lane heights: they cross the two Scheduler lanes turning at 264 and 284. WHY NOT hugging
the client's own faces: the climbing verticals cross them. Both were wrong on the render, not in the
source.
```

### before `const D10 = 10, JOG_DOWN = BAND_CY - D10, JOG_UP = BAND_CY + D10;   // 264 / 284`

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
LAYOUT   Two dashed node() frames of the same width, one over the other:
           Control plane   150..1050 x  90..440
           Node-1          150..1050 x 475..628
           tier 1   API 490..710 x 140..220,  ETCD cylinder 900..1030 x 130..240
           tier 2   controller-manager 170..390, cloud-controller-manager 490..710,
                    Scheduler 810..1030, all y 328..408
           tier 3   Runtime 170..390, Kubelet 490..710, kube-proxy 810..1030, all y 522..602
         Every block is the standard 220 x 80 apart from the cylinder (130 x 110). Every VERTICAL is
         cluster-apply-flow's to the unit: that card took its COLUMNS from here and this one took its
         ROWS from there, so the two read as one family in both axes. Frames are symmetric about
         CX 600, which keeps the CENTRE content bbox on 600, with 20 units of padding on both walls.
NOTE     ETCD right-aligns on 1030, the Scheduler's right edge, rather than centring on the Scheduler
         axis at 920. The card is three columns whose outer walls are 170 and 1030, and a centred
         cylinder would sit at 855..985, breaking that wall to line up an axis nobody can see. It
         also costs the ETCD write label its home: that string needs 179 units and the gap to a
         cylinder starting at 855 is 145.
NOTE     A frame move under about 25 units is not a visible change: 10 viewBox units is about 12
         rendered pixels on a 1600 wide dialog.
LANES    Three solved numbers carry the two Node-bound lanes clear of every tier-2 block, which is
         what THROUGH scores:
           L_CORR 440  midpoint between controller-manager (ends 390) and ccm (starts 490)
           R_CORR 760  midpoint between ccm (ends 710) and Scheduler (starts 810)
           BAND_Y 457  the middle of the free band between the two frames (440..475)
         The API bottom face carries six endpoints mirrored in pairs about 600: 540/660, 560/640,
         590/610. Left and right faces carry one endpoint each, both exactly on the face midpoint
         y=180, which is what OFFEDGE requires of a lone endpoint.
         The two tier-2 levels are DERIVED from BAND_CY, D10 either side, so the pair re-centres
         whenever a row moves. The band is 108 units and a fixed +40 / +60 glues both levels to the
         API and leaves dead air under them.
         Each tier-2 block gets a parallel arrow PAIR: watch event in on the upper lane, reconcile or
         Binding write-back out on the lower. The flanking columns dogleg through JOG_DOWN 200 and
         JOG_UP 220; the centre column sits straight under the API, so its two are plain verticals.
NOTE     The two Node-bound lanes end ON their target box (Kubelet top midpoint 600, kube-proxy 920),
         not on the Node frame edge. That is the OPPOSITE call from the four cluster Node cards,
         where a lane stops on the frame because the Pod row changes step to step and the pulse
         carries which Pod reacts. Here there are no Pods and nothing pulses, so a lane stopping on
         the frame would point at three boxes at once.
NOTE     One lane crossing is accepted: API_TO_KPROXY turns down at x=760 from y=180 and crosses the
         ETCD read lane at (760, 190). Nothing scores a lane against a lane, and the alternative
         takes the kube-proxy lane off the API face midpoint, which OFFEDGE does score.
LANES    The ten lanes are TWO NAMED GROUPS, because the card shows one half of the diagram at a
         time and ten dashed lanes at once is more than a reader can follow. `setLanes` writes both
         groups on every step, above the ctx.reduced guard.
         THE TWO GROUPS TAKE DIFFERENT TREATMENTS, and that asymmetry must not be "fixed" into
         symmetry. A control-plane lane out of play DIMS to OPACITY.notready (outside this path) and
         stays on screen, because the control plane is what the card is about and its shape should
         not flicker. A Node-bound lane out of play is NOT DRAWN at all: the card spends six steps
         inside the control plane, and a permanent pair crossing into the Node band reads as traffic
         that is not happening. Slot 0 matches the control-plane steps rather than being a third
         state, so the poster shows the control plane whole and the Node band quiet.
NOT A DEFECT
         Several lanes carry no ball on a given step, and a grep for a constant name will say they
         carry none at all. They do: the card shows one half at a time, so a lane idle on the step
         you are reading is ridden on another one.
WIRE LABELS
         Seven, and none can sit in the band under the API: the two Node-bound lanes run vertical
         corridors at x=440 and x=760 straight through it, and FOUR of the seven had a dashed lane
         drawn through the string. check-geometry cannot see any of it, because it scores lanes
         against BLOCKS and a text is not a block. They live in the two bands the corridors do not
         reach: T2_BELOW, one under each tier-2 box (440 and 760 fall in the gaps between those three
         strings), and T3_BELOW under the Kubelet and kube-proxy, the tier-2 rhythm repeated inside
         the Node frame. A watch label belongs next to the component doing the watching.
DO NOT   Put a label under the API at (CM_CX + 135, 186). That is inside the panel's column, and the
         panel is widest and DEEPEST on the SMALLEST viewport because a narrower panel wraps into
         more lines: one line is 25 viewBox units, five lines bottom 155, six 180. A six-line
         controllers step then renders `watch . reconcile loop` half behind the panel, and OCCLUDED
         reports the card clean either way.
OPEN     The CONTROL PLANE frame label at (162, 108) is fully covered by the panel on EVERY measured
         viewport (worst x<=397 y<=230, best x<=291 y<=125). The one thing on the card that is
         knowingly INVISIBLE rather than dimmed, taken by author decision. OCCLUDED cannot report it
         because the rule excludes node frames by construction. DO NOT try to fix it by shortening
         narrations: even a ONE line panel reaches x<=291, which still covers x=162 onward.
CONTENT  cloud-controller-manager carries the sublabel `optional` and the narration says a cluster on
         your own hardware has none, which is what Components lists literally. kube-proxy is optional
         upstream too, but that is said in WORDS: a second `optional` sublabel in the same drawing
         reads as a pattern rather than as a fact.
         The API is "the only way in for clients and controllers", not "the only entry point":
         cluster-static-pods exists to show the path that skips it.
         The Scheduler's one write is "on the ordinary path", because preemption also deletes.
         The cloud lane is labelled `watch Nodes . write Node and Service status`, which is what
         actually rides it. No provider is drawn, so a label naming a provider call was promising a
         call the card does not draw.
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
LAYOUT   The API is pinned on CX with both flanks derived from one GAP, so the row is symmetric and
         the Node pair below is a straight vertical. Tier 2 carries the controller-manager and the
         Garbage collector, mirrored about CX. Inside the Node frame both blocks derive from ONE
         padding applied to the frame's own edges, so the insets are equal by construction, and the
         frame and its contents are cluster-apply-flow's to the unit.
         T2_D is SOLVED, not chosen: whatever puts the tier-2 outer edges NODE_PAD inside the Node
         frame. Four things then line up on each side by construction: kubectl left =
         controller-manager left = Kubelet left = 170, and ETCD right = Garbage collector right =
         Pod right = 1030.
         kubectl is the ONE block not derived from GAP: its LEFT edge is pinned at 170 and it grows
         RIGHT only, so it is 160 wide against ETCD's 130. 160 is near the ceiling, because its gap
         has to keep holding `HTTP 202 Accepted` at 113 units, leaving 23.5 a side.
         The two bands are deliberately unequal (110 above tier 2, 60 below) and NOT a rhythm to even
         out: tier 2 cannot rise because the panel reaches 282, and band 1 holds a lane pair AND both
         tier-2 wire labels while band 2 holds one label and no lane turn at all.
PANEL    x<=397 on every step, bottom reaching 282 on gc-cascade, the deepest narration in the pair.
OPEN     TOP_Y 110 is as low as the row can go: below it sit band 1, tier 2, band 2 and the Node
         frame, and tier 2 cannot rise. So kubectl at 170..330 and the two labels in the left gap are
         inside the panel's column and are COVERED rather than clipped. Taken knowingly, the same
         trade as cluster-apply-flow. WHY NOT keeping the top row right of the panel (420..1080): it
         centres nothing, the row sits 150 units right of the centre the Node frame sets, and the
         whole drawing leans.
LANES    Nine static lanes, each from the SAME points array its ball rides. Four on the top row as
         two mirrored pairs, request at OUT_Y and answer at BACK_Y. Three into tier 2: the MODIFIED
         event to the controller-manager, and an out-and-back on the Garbage collector where the
         event lands on the OUTER lane (GC_CX + D20) and the DELETEs leave on the INNER one, so the
         pair never crosses itself. Then the Node pair.
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

### before `const etcd = cylinder({ x: ETCD_X, y: TOP_Y - 10, w: ETCD_W, h: TOP_H + 20, label: 'ETCD', role: 'cluster' });`

```
ETCD is w=130 so the label is not lost in a squat-wide cylinder and the two control-plane cards
match. Top and height (y=50, h=100) keep its centre level with the API row and leave the top wire
labels their clearance above the cap.
```

### before `root.appendChild(pathArrow({ points: DELETE,      dim: true, dashed: true, role: 'cluster' }));`

```
Every lane is drawn here, each from the SAME points array its ball rides.

check-notes verifies that an anchor points at code that still exists, NEVER that the sentence under
it is about that code. This anchor and its twin on cluster-apply-flow both carried a note about a
different lane for exactly that reason.
```

## cluster-resource-quota

### layout

```
WHAT     A namespace budget that ACCUMULATES, which separates it from cluster-node-allocatable next
         door: there a Node capacity is carved into pieces taken AWAY, here the bar IS spec.hard and
         the slots fill it left to right, so the refused request is drawn PAST the bar edge.
LAYOUT   Exact to scale: 480 units per CPU, so a 500m request is 240 units on the admitted slots and
         on the refused block alike, and a reader can measure the picture and get the chips' answer.
           bar     420..900, refused block 900..1140, so the drawing right of the panel is exactly
                   three request widths wide
           ladder  740..1140, API centred on it at 824..1056, ReplicaSet on the 420 rail
           listing 60..400 in the freed bottom-left, which is what centres the content on 600
           chips   548..624, two per row at 532
         There is no node() frame: a quota is a namespace fact and namespaces have no frame
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
LANES    LR_TO_CHAIN is a relationship: the LimitRanger plugin reads the LimitRange out of the API
         server's own cache, so nothing travels it. WHERE IT POINTS is the whole reason the box left
         the actor row. It runs from the LimitRange right face to the ladder, level with the seam
         between row 1 (mutating, LimitRanger sets defaultRequest) and row 2 (validating, checks min
         and max), which is where that object is consumed. The box is exactly ROW_H * 2 + ROW_GAP
         tall, so it spans those two rows and no others and leaves on its own face midpoint, which is
         that seam by construction. The ladder end lands on no face at all, and OFFEDGE has nothing
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
         lands on OPACITY.pending, not 1, which is why ghostAt exists beside the shared revealAt:
         revealAt always ends at 1 by construction, and a thing never created must not.
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
LAYOUT   THE LEDGER IS THE CARD, so the object is a three column table (field, value, field manager)
         and everything is sized around it. The row is BOX_W 200 with TOP_GAP 60 rather than the
         family 232, because three actors have to fit in the 720 units right of the panel:
         3 x 200 + 2 x 60 is exactly 720. A 60 unit gap cannot hold a wire label BETWEEN two blocks,
         which is why requests take a register above the row (y=26) and answers one below it (146).
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
LANES    API_TO_OBJ is a relationPath: the API HOLDS this object, it never drives it, so no ball
         rides it and it takes no arrowhead. Every ball stays in the top row.
         Four lanes, one pair per manager, mirrored about the API faces on LANE_DY 12. Every one
         carries a ball on some step, so all four are arrows. The 409 on the conflict step is drawn
         coming home, because a return the narration promises and the motion never delivers is a
         named defect family here.
NOTE     The three inputs of the client-side three-way merge sit in the bottom-left corner the panel
         frees once its text ends, holding OPACITY.notready for five of six steps. Without them the
         card is a top row and a table both starting at x=420 with the entire left third empty.
DO NOT   Remove a field row when it leaves the object. A removed row leaves a row-sized hole in a
         table on screen for the whole card, which reads as a rendering fault. It dims to
         OPACITY.terminated, keeps its field path, and its value cell says Removed.
NOTE     The two right-hand cells are spelled with the primitive's own key names (`label:` and
         `sublabel:`) so check-inline reads them where they are written. A `val:` key hides nine
         drawn strings from the lint; a `value:` key makes the lint demand lowercase for a string
         that reaches the canvas as a block LABEL.
NOT A DEFECT
         check-arrival reports five R2s here, all its documented blind spot: it samples chips at t=0
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

### before `function setRows(s, spec) {`

```
THE WORKED EXAMPLE, and it has to add up because check-figures reads the numbers and a reader follows
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
           CYL_Y     230, set by the panel: the API is level with the ETCD row and starts at
                     CONTENT_L, so API_Y = CYL_Y + CYL_H/2 - API_H/2 must clear the panel bottom. That gives
                     CYL_Y >= 215, and 230 leaves 25 units under the measured panel bottom
           ARC_RISE  80, which is what puts something in the otherwise blank top-right so the arc
                     reads as a route rather than a decorative notch
           ARC_Y     150, CYL_Y - ARC_RISE
           M         40, both sides, so the bbox is 40..1160 and still centred on 600. That is the
                     only way to buy the proposal label its gap without narrowing the API off the
                     220 standard width
           CYL_XS    derived from CONTENT_R - ROW_W, right edge on CONTENT_R by construction
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
         pair crosses one dash above ETCD-3: the ack horizontal runs y=162 from 1052 to 532 and the
         outbound vertical comes down into E3 at x=1028 through y=162, which is inside that span.
         E3 now RECEIVES on its right stub and SENDS from its left, the opposite of E1: outer
         508 -> 150 -> 1052 -> down, inner 1028 -> 162 -> 532 -> down, nested on all three sides.
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
NOTE     A replica does not dim alone. setReplicas writes TWELVE elements from one list: both
         cylinders, both role chips, both log chips, both ties, and the four lanes joining them to
         the Leader, whose shade is laneOf() because a lane is only as present as the fainter of its
         ends. It is called by EVERY step including idle, because two independent assignments drift
         the moment a step is added.
DO NOT   Send a ball into a member that is not answering. It says the opposite of the step, and
         nothing comes back either, so there is no return to draw. The step carries its beat with the
         fade and with .highlight on the four chips that move.
NOTE     The silent pair holds OPACITY.notready (alive but not serving, not observed), not
         terminated, which would also put the card one .highlight away from a check-opacity LIT.
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
LAYOUT   Layout A: ladder 60..540, chips 620..1140, Node frame full width.
         The frame is the family value: POD_Y = NODE_Y + 34, POD_H 106, NODE_H 152 (34 of label
         padding, 106 of Pod, 12 of floor), bottom pinned on 624 so NODE_Y is 472. node() draws its
         label at NODE_Y + 18, so a Pod row at +22 prints NODE-1 four units above the first Pod and
         overlapping it.
LANES    ONE lane, two points: [[600, 120], [600, 472]], a straight drop from the Kubelet bottom face
         midpoint to the Node frame top face midpoint. SPINE_X had to move 580 -> CX for that,
         because the frame midpoint is 600 and a lane leaving a box off its own face midpoint is an
         OFFEDGE finding; KUBE_X derives from SPINE_X, so the whole top row shifted with it.
         The lane runs the 540..620 corridor between the ladder and the chip column and crosses
         nothing.
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
NOTE     No stand-in highlight to take back here: neither terminate step has ever set one, both
         reduced branches are a bare return, so fadeOut stays a two-line helper. If a stand-in is
         ever added, it has to be dropped on BOTH paths, because the Pod now ends dim rather than
         absent.
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
LAYOUT   Layout B by shape, API and chips in the left column, ladder right. The chip column is the
         category's 480 (60..540), not 380 against a 500 wide ladder.
BUDGET   Panel x<=397, bottom 160 / 183 / 193 / 230 over the four viewports and 269 at 1024x768. What
         the bottom has to clear is the API box at y=300, so 70 units of headroom at the rule worst
         case. Grow a narration here and re-measure.
NOTE     PANEL_R and PANEL_B were dead constants declaring numbers nothing read, and both disagreed
         with the measurement and with each other. The measurement lives in the header comment next
         to what it constrains.
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
         Verified by real-time sampling, not by frames: frame-strip seeks and never fires onfinish,
         so every at() turnover is invisible to it. check-reduced passing is the proof the end state
         still lands.
NOT A DEFECT
         check-arrival R2 reports three findings here, all the tool artefact: it samples at t=0 and
         compares against t=0 of the previous step, so a mid-step turnover is attributed to the NEXT
         step, where the chip is not highlighted because that step is not about it.
NOTE     setChainActive is imported rather than hand-rolled. Five copies of
         `chain.querySelectorAll('.scheme-chip')` plus `rows[i].classList.add('highlight')` were
         behaviourally identical and had no import of the helper every other card uses.
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
LAYOUT   Each replica reaches the Lease on its OWN axis, so there is no shared corridor:
           STACK_W    720, 3 * REP_W + 2 * REP_GAP
           STACK_L    240, CX - STACK_W / 2. Content spans 240..960, centre 600
           REP_XS     240 / 490 / 740, centres 350 / 600 / 850
           REP_Y      170, PANEL_B + 15. The row is pinned by the PANEL, not by the canvas centre:
                      centred horizontally, its left third is in the panel's column
           LANE_RUN   56, the straight drop from role chip to Lease
         Six independent endpoints on the Lease top face at 340/360, 590/610, 840/860, mirrored in
         pairs about its midpoint 600, so OFFEDGE stays quiet and a reader can follow one exchange
         without tracing a shared line.
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
         THE SCALE IS EXACT and that is the load-bearing decision: GI = 56 units per Gi, BAR_W =
         16 * GI = 896, so every segment width IS its number (kubeReserved 56, systemReserved 28,
         evictionHard 28, Allocatable 784). BAR_X = CX - BAR_W / 2 = 152, centred on 600 by
         construction. The frame is 196 tall rather than the family 152 because it stacks four
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
LANES    KUBELET_TO_NODE is a relationship, not a route: this Kubelet runs on this Node and computes
         its Allocatable, and no step names anything travelling that way (the Kubelet PATCHes the
         API, and the arithmetic is its own local work). Same call cluster-scheduler-decision makes
         for API_TO_CHAIN. It leaves the Kubelet bottom face midpoint (520) and lands on the frame
         top face midpoint (600), turning at JOG_Y 228, halfway between. Without it the top row and
         the Node band read as two unrelated drawings.
NOTE     The segments carry STROKES only, their rect fill overridden to transparent so the soft box
         fill does not double up over the bar. rx is 0 on the segments and 6 on the bar: four rounded
         rects side by side read as four separate blocks rather than as one bar divided. Each segment
         is wrapped in a g with its caption so ONE opacity reveals both, which is what keeps setSegs
         honest: five names, five assignments, no chance of pinning the box and forgetting the caption.
NOTE     The request strip starts where Allocatable starts, because Pod requests are only ever
         measured from there, and its width is set per step in whole Gi. On schedule it is 15Gi and
         overhangs the bar, on overcommit 12Gi and inside: the two frames side by side are the card's
         argument. Its label goes through the wires map rather than a box sublabel, because a
         sublabel is positioned at w / 2 and w changes between steps, so it would drift off centre.
DO NOT   Draw the 24Gi of limits the overcommit step talks about. Nothing on the bar measures limits,
         and a 24Gi strip runs 1344 units off a 1200 unit canvas. The ladder row and the narration
         carry it instead.
NOTE     Two of four chips turn over on a beat rather than at entry. status.capacity.memory and
         status.allocatable.memory hold what the API STORES, so they read `not reported` until the
         Kubelet report lands; NodeResourcesFit holds the Scheduler's verdict, so it waits for the
         number it judges against. enforceNodeAllocatable never changes, and that is what the field
         IS: a standing value answering "which of these three reservations is actually a cgroup cap".
NOT A DEFECT
         check-arrival reports two R2s, both the documented blind spot: a chip written on arrival
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
LAYOUT   Layout C, the tallest panel in the category. NODE_Y IS the panel bottom here, so the
         Node frame starts exactly where the panel ends.
           ladder  right column 660..1140, five rows
           chips   TWO per row at 532, two rows, 548..624
           API     centred on the Node frame, API_X = CX - BOX_W / 2 (484..716), kubectl 196..428
PANEL    x<=397, y<=304 at 1100x800 on the cordon step. Frame top 380, so 76 units of clearance.
BUDGET   NO STEP MAY EXCEED 528 CHARACTERS, and that is a property of the FRAME, not of the current
         text: trims that buy clearance do not raise the ceiling, because 380 is a route length and
         therefore a packet timing. Growing three narrations for accuracy took the panel to 404 at
         1100x800 and 456 at 1024x768, over the frame edge and its NODE-1 label, and
         `check-geometry --rules=occluded` stayed CLEAN through all of it: it scores occluded AREA
         and a 25 unit strip off a 152 tall frame is under its bar. Pay for an edit inside the same
         step and do not trust the gate here.
LANES    ONE lane, a single vertical drop [[600, 120], [600, 380]]: API bottom face midpoint straight
         down to the Node frame top face midpoint, no jog and no corridor.
WHY NOT  A bus inside the frame with a tap per Pod. Two lanes crossing the frame and splitting over
         the Pod row read as plumbing rather than as an eviction. WHICH Pod dies is carried by the
         pulse.
NOTE     The lane leaves the API, not kubectl: kubectl POSTs to the eviction subresource and the API
         is what reads the PDB, grants the 200 OK and DELETEs the Pod, which both evict steps say in
         those words. Same shape as workloads-force-deletion.
OPEN     check-geometry reports OCCLUDED on kubectl at 86% and it STAYS OPEN. It is real and
         viewport-dependent in a way the rule cannot express. Panel right edge against kubectl at
         196..428:
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
         The lane went 528 units to 260, below PKT_DUR_MIN, so evict-A went 2873 -> 2400 and evict-B
         4473 -> 4000, and the durations came down to 2550 and 4150 to keep the tight margin.
DO NOT   Fade an evicted Pod to 0: it leaves a block-sized hole in the frame's left third. Pins and
         fade land on OPACITY.terminated, and POD_FADE is 1200 rather than FADE.out 700, because at
         700 the Pod is gone 200ms before its own pulse ends and the eviction reads as a cut.
         Two traps come with it. The static path stands a .highlight on the Pod's inner box in for
         the pulse it cannot show, and a highlight at the terminated shade is check-opacity's LIT on
         one path and check-reduced's HIGHLIGHT on the other, so fadeOut takes the class back in the
         fade's onfinish (the removeAt shape). And check-opacity's ORDER wants the pulse before the
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
LAYOUT   Six ladder rows (152..394) with the top row dropped from 110 to the family 80 to buy the
         space back, two Node frames at 406..538, chips 552..624 at THREE per row (350.67, two rows).
         Each frame is anchored on its OUTER edge, Node-1 on CONTENT_L and Node-2 on CONTENT_R, and
         gives up width on the inner side only: 520 -> 442, inner edges on 502 and 698, still
         mirrored about CX. The corridor between them goes 40 -> 196, which gives the reschedule lane
         a real 98 unit run into Node-2 rather than a stub.
WHY NOT  Five chips across at 206: the unreachable taint value alone needs 335.
LANES    Every lane starts and ends on a NODE FRAME face; which Pod the step lands on is carried by
         the pulse. That is also what makes the heartbeat true: no Pod renews a Lease, the Kubelet on
         the Node does, which is what the narration says in its first six words.
         Heartbeat and evict share a two-lane corridor above the frames (EV_JOG_Y 340 outbound,
         HB_JOG_Y 362 return) and meet the top row through GUTTER_X 640 and UNDER_TOP_Y 136, left of
         the ladder. Both Node-band lanes leave the CONTROLLER, because the controller is the actor
         both steps name.
NOTE     THE PAIR IS NOT MIRRORED, and Node-2 is why. Its TOP face midpoint is x=880, directly under
         the ladder with 12 units of clearance, so that face cannot be reached at all: the reschedule
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
         holds OPACITY.terminating, and its lanes take laneOf() off the Node-1 FRAME, the dimmer of
         their two ends from kubelet-stops onward. Pinned to the Pod instead, a full-strength lane
         sits on a 0.4 frame for three steps. The reschedule step brings only the REPLACEMENT to
         full, because a Pod carrying a deletionTimestamp no longer counts towards the replica total,
         which is what lets the controller create it while the old one is still on screen.
CONTENT  The box sublabel is `node-lifecycle + taint-eviction`. Since 1.29 those are two independent
         components, and step 5 has the taint-eviction-controller issue the DELETE, so a box saying
         only node-lifecycle-controller denies the actor its own next step names. Step 6 is a third
         controller again, the replicaset controller, named in words.
         The toleration is added to any Pod that does not set one itself, NOT to "every Pod".
         DaemonSet Pods set theirs with no tolerationSeconds, so this path never evicts them, which
         is why the DaemonSet agents survive the eviction the card shows.
NOTE     SIX chips, not five: the grid is three wide, so five left a hole. The one worth adding was
         the THRESHOLD, `grace period`, beside `Lease age`, which is what makes 30s of staleness
         harmless and 52s fatal. The rows are meaningful now: Ready / Lease age / grace period is
         "is the Node alive", Taint / Toleration / eviction timer is "what happens to its Pods".
         All six go through one setChips and every step calls it. Five of seven wrote a subset and
         the reschedule step wrote none, so the last frame sat under `eviction timer: 0s .
         Terminating`, a countdown running on a Pod its own narration had already replaced.
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
LAYOUT   Layout B. Chips left 60..540 (480 wide, not the four-across bottom strip at 258 where
         --eviction-hard overlapped its own value), ladder right, both columns ending on COL_BOTTOM
         456 with the Node frame at 472..624.
         The frame is the family value, NODE_H 152 with POD_Y = NODE_Y + 34, grown from 140 to stop
         NODE-1 printing on the first Pod. The frame bottom stays on 624, so it grew UPWARD and the
         columns moved with it.
LANES    ONE lane, two points: [[SPINE_X, TOP_BOTTOM], [SPINE_X, NODE_Y]], a single drop on the spine
         from the Kubelet bottom face midpoint to the Node frame top face midpoint, both exactly
         x=600, so OFFEDGE stays quiet by construction. It passes between the chip column (ends 540)
         and the ladder (starts 660).
WHY NOT  A bus at BUS_Y with a tap into the BestEffort Pod. A lane that crosses the frame and picks a
         Pod out of the row reads as plumbing rather than as a kill. Which Pod dies is carried by the
         pulse.
NOTE     The API block was added because THREE of the five steps say the Kubelet writes to the API and
         the card drew no API at all, so that traffic was narrated and never shown. Two of those steps
         animated NOTHING (span 0 and 900 with zero packets), which no check can see: check-duration
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
         Same top row (Kubelet centred on the spine 484..716, Linux kernel flush to CONTENT_R
         908..1140, request lane on 68 and answer on 92), same full-width Node frame with one Pod,
         same two-per-row 532 chip strip ending on 624. The frame is the family 152 at 380..532
         rather than the sibling's 388, because CHIPS_Y = NODE_Y + NODE_H + 16 solves to 380.
PANEL    x<=397, bottom 195 / 235 / 280, worst on `observe` at 386 characters.
BUDGET   Roughly 550 characters. The frame top is 380 and nothing is drawn left of 420 above it, so
         the clearance is 100 units. Re-measure rather than trusting that number.
NOTE     THE TIME SCALE IS THREE BARS STACKED, NOT SIDE BY SIDE. Side by side inside 480 units gives
         three 150 wide bars whose 50% fill is 75 units, and the caption naming the empty tail has
         nowhere to go. Stacked gives each period the full 480, a 240 unit fill and a right-aligned
         caption over the stall it names, and it reads as one clock running down the page rather
         than as three containers standing side by side. BAR_H 44, BAR_GAP 16, tops on 176 / 236 /
         296, stack bottom 340.
NOTE     The bars are BARE rects, not box(), which is a check-geometry decision rather than a style
         one: three 480 wide blocks at y 236 and 296 land inside CENTRE-LOW's span and would put the
         low content centre on 750 against a want of 600, on a card centred on 600 by construction.
         The cost is that check-palette never sees them either, so their colours are pinned in one
         frozen BAR block: the channel list 125, 134, 255 is the cluster --tint-base-rgb, copied
         rather than referenced because an SVG presentation attribute cannot resolve a token.
NOTE     The scale rests at OPACITY.pending rather than at 0, which is a fact rather than a flourish:
         with cpu.max at its default there is no bandwidth enforcement and nr_periods is genuinely 0.
WHY NOT  Resting at 0 and appearing on `quota`. The rendered frames killed it: with the right column
         blank and the left owned by the panel, the two opening frames were two boxes and a Node band
         with a 480 x 164 hole between them, and `idle` is the poster, the first thing anyone sees.
         Nothing in the gate says a word about it.
LANES    TWO relationship lines, no arrowheads and no balls, because no step names anything
         travelling from the Kubelet into the Node frame or from the kernel into the scale. The
         Kubelet lane leaves (600, 120) and lands on (600, 380). The scale lane leaves the kernel
         bottom midpoint (1024, 120), jogs on JOG_Y 148 and lands on the bar stack top midpoint
         (900, 176). It lives INSIDE the scale group, so it cannot outlive what it points at.
NOTE     The scale hangs off the KERNEL, not the Kubelet. cpu.max is what makes the kernel account in
         periods at all and the throttling decision is the kernel's alone: the Kubelet does not learn
         about it until it scrapes cpu.stat, which is the last step. Hanging it off the Kubelet would
         say the Kubelet runs the clock, the one thing the card exists to deny.
MOTION   The fill grows by ANIMATING THE rect WIDTH, a real WAAPI animation on an SVG geometry
         property. It is not a packet, so no packet canon applies and check-opacity never sees it.
         check-duration does: three fills at 700ms staggered 700 apart put the throttle span at 2100
         plus the pulse, which is why that step is 3400.
         Every enter() writes EVERY bar through setBars. A bar left alone keeps the previous step's
         fill and caption, which on a time scale does not read as a stale value, it reads as a period
         that behaved differently.
NOTE     cpu.stat deliberately does NOT move on `spend`. The kernel increments nr_periods and
         nr_throttled from the period TIMER, when an interval elapses, so half way through the first
         period both are still 0. An earlier draft read `nr_throttled 0 of 1` there, which claims a
         period has closed on the step whose whole subject is the middle of one.
NOTE     The Pod does NOT pulse and does NOT fade anywhere on this card. The sibling dims its whole
         Pod group on the kill; here the container SURVIVING is the answer, and a Pod that flinches
         when a metric is scraped would be saying something happened to it.
NOT A DEFECT
         check-arrival reports one R2, its documented blind spot: cpu.weight turns over on `request`
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

NO NUMERIC cpu.weight ANYWHERE. The chip names the file and says what set it (`weighted by
requests.cpu 250m`) rather than printing a value, because the value is not one number: the Kubelet
computes CFS shares from the request (`MilliCPUToShares`, 250m -> 256) and the shares-to-weight
conversion belongs to the runtime, which has changed shape at least once. 256 shares is 35 under the
current formula and was 20 under the old one. The kernel default of 100 IS printed, because the
kernel documents it.
```

### before `const SCALE_RELATION = [[KERN_CX, TOP_BOTTOM], [KERN_CX, JOG_Y], [SCALE_CX, JOG_Y], [SCALE_CX, SCALE_Y]];`

```
OFFEDGE judges an endpoint against BLOCK faces and the bars are bare rects, so the (900, 176) end is
invisible to it. Not licence to be sloppy: 900 is the stack midpoint by construction (`SCALE_CX`), so
the line is centred on what it points at whether or not a rule can see it.
```

### before `const scaleG = g({ id: 'timeScale' });`

```
The captions turn over on the beat that earns them, the `network-dns-ndots` shape: end state pinned
above the `ctx.reduced` guard, played path rolled back to what the step starts from, turnover on the
fill finishing through the shared `at(...)`. `spend` holds `quota spent 50ms in` until the fill
reaches the middle of the bar, and `throttle` turns `cpu.stat` over once per period as each fill
closes, 1 of 1, 2 of 2, 3 of 3, because a counter reading 3 from step entry skips two thirds of what
the sentence describes. `frame-strip` cannot show any of this and `check-reduced` passing is the
proof it lands.
```

### before `const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });`

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
LAYOUT   Layout C, no left column fits above the Node frame. Chips TWO per row at 532 (four across at
         258 overlapped memory.current with container state), frame at 388..532, chips 548..624.
         The kernel block right-aligns on CONTENT_R (908..1140), so its right edge is level with the
         right chip column, the ladder and the Node frame. A fixed 56 units from the Kubelet ends
         it on 984, flush with nothing.
LANES    NODE_CONNECTOR ends on NODE_Y, the Node frame top face midpoint, and the spine is on CX so
         that drop is straight. Which container the kill lands on is carried by the pulse, not by an
         arrowhead reaching inside the frame. Same correction the four sibling Node cards took.
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
NOTE     One setChips writes all four chips and every step calls it, idle included. oom_score_adj is
         not a parameter because it is a standing value on this card.
         `container state` reads `Running · not yet observed` on the kill step and turns over to
         `Terminated · OOMKilled · 137` on observe. containerStatuses[].state really IS still Running
         until PLEG relists and the Kubelet PATCHes, which is exactly what observe is about, so the
         value stays and now says why.
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
NOTE     inline-dump finds chip values by matching setVal(s.refs.X, '...') in the source, so every
         value reaching a chip through setChips is invisible to it. Not new and not specific to this
         card. To read the chip story on a setChips card, walk the steps in a browser.
```

### before `const create = routePacket(s, ctx, NODE_CONNECTOR, { role: 'cluster' });`

```
Kubelet creates the new container on the node (connector) and rewrites its cgroup
(top arrow to the kernel, a beat after so the two signals read as near-simultaneous,
not chained). The container pulses and re-materialises on arrival.

The connector now stops on the Node frame rather than the Pod shell, so this route is 20 units
shorter than it was and every ball on it lands sooner. routeDur is length-based, so re-read the
span before assuming a timing here is unchanged.
```

### before `const pkt = topPacket(s, ctx, { from: KERN_X, to: KUBE_X + BOX_W, y: DOWN_Y, role: 'cluster' });`

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
LANES    THE LANE LEAVES containerd, not the Kubelet. The Kubelet is the one block on this card that
         never touches the sandbox, and all four steps that ride the lane say so. SPINE_X is
         RT_X + RT_W / 2.
         It is a centred zigzag into the NODE: off the containerd bottom midpoint, across on
         JOG_Y = (TOP_BOTTOM + LADDER_Y) / 2, then straight down x=600 onto the Node frame top
         midpoint. The turn has to go ABOVE both columns, because 120..235 is the only horizontal
         band on this card free of them, and the long leg then falls through the 490..620 gutter.
DO NOT   Turn at BUS_Y = NODE_Y - 16 and end on the Pod sandbox top midpoint. containerd centres on
         x=782, INSIDE the chip column (620..1140, y 235..437), so the 326 unit vertical leg goes
         straight through all four value chips on every one of the four steps that ride it. Nothing
         catches it: check-geometry THROUGH scores blocks, and a value chip is not a block. WHERE A
         LANE TURNS DECIDES WHAT IT CROSSES, and the only witness for the chip column is a rendered
         frame.
LAYOUT   The top row is derived RIGHT TO LEFT: CNI ends on CONTENT_R and the row builds leftwards.
         404 IS A HARD STOP, not taste: the panel measures x<=397 at 1100 width at every height and
         the top row at y 40..120 sits inside that band, so seven units is the entire clearance. It
         is a viewport-WIDTH effect, not a text-length one, so a longer narration cannot eat it.
         The room for the arrows therefore could not come from moving left and had to come out of the
         BOXES. They carried 70 to 95 units of dead padding per side against measured widest inner
         labels of 60, 90 and 66, so widths went 200/280/180 -> 180/210/180 and TOP_GAP went 30 -> 83.
         Each call and return pair now has better than twice its old run.
NOTE     Z-order canon: packetLayer rides above the static wires but below the blocks, so the ball
         reads on its connector and arrival is told by the pulse. The centre connector travels in
         open space.
```

### before `const shellEl = podShell({ x: POD_X, y: POD_Y, w: POD_W, h: POD_H, label: 'Pod sandbox', sublabel: ' ', containers: 0, role: 'workloads' });`

```
The Pod sandbox: shell holds the pause container (created at RunPodSandbox)
and the workload container (created at CreateContainer, started at StartContainer).
Centred on CX, under the point where the zigzag enters the Node frame.
```

### before `const packetLayer = g({ id: 'packetLayer' });`

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
LAYOUT   Layout A, rebuilt so the rest of the category has a shape to copy:
           actor row     40..140, clear of the panel
           ladder        LEFT column 60..540
           state chips   RIGHT column 660..1140 at 480 wide
           candidates    Node row and its verdict chips full width at the bottom
         Chips share the ladder's row rhythm (ROW_H 32, ROW_GAP 12) so the two columns read as one
         grid.
NOTE     CENTRE passes because the chip strip pools EVERY .scheme-chip: the ladder rows (60..540) and
         the verdict chips (60..1140) keep the strip centred on 600 with the value chips on the right.
LANES    API_TO_CHAIN is a relationPath: no arrowhead, no ball, stroke-opacity 0.45. The queue, filter
         and score stages are the Scheduler's OWN work and nothing travels from the API to reach
         them, and an arrowhead makes a legend for the scheduling cycle read as a traffic destination.
         It turns at JOG_Y 180, the exact midpoint of the API bottom face (140) and the ladder top
         face (220), and ends ON the ladder edge at 220, not 2 short of it: the 2 was arrowhead
         clearance.
OPEN     The panel bottom at 1100x800 is exactly 180, so at the NARROWEST viewport the leftmost ~97
         units of that horizontal run and the corner turn pass behind the panel, and the line reads as
         emerging from under its bottom-left edge. At 1280 and wider the whole route is clear. The two
         constraints are mutually exclusive: the equidistant point IS the worst-case panel bottom.
         JOG_Y 190 would clear every viewport at 50/30 instead of 50/50 and is the fallback if the
         panel ever grows.
BUDGET   Narration length is LOAD-BEARING here. Panel bottom at 1100x800 goes 155 -> 180 -> 205 in
         one-line steps, and 205 swallows the turn entirely. `bind` was drafted at 275 characters,
         measured 205, and was cut to 245. Measure at 1100x800 after ANY narration edit, not at the
         default 1600.
NOTE     The ETCD -> Api return lane wore an arrowhead no ball had ever ridden. It was NOT demoted to
         a relationPath: the four top-row lanes are two mirrored request/answer pairs, and sinking
         half of a pair leaves the survivor reading as the senior lane. The answer was DRAWN instead:
         bind runs three hops, POST -> persist -> commit ack, chained on arrivalMs + BEAT.afterHop.
         rv=903 on the persist wire was always etcd ANSWERING, so the ball carries a value the card
         already showed.
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
         subject, purely for the character ceiling: filter is already the card worst case at 248 and
         one more line takes the panel from 180 to 205, which swallows the turn.
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
         band at once. Tier 1 API plus kubectl, tier 2 the mirror Pod, tier 3 the Node frame on the
         family numbers (NODE_Y 380, NODE_H 152, POD_Y = NODE_Y + 34, POD_H 106), chip strip two
         per row at 548..624.
PANEL    x<=291 y<=160 at 1600, x<=378 y<=193 at 1280, x<=397 y<=230 at 1100, worst on drain.
BUDGET   390 characters per narration. Nothing in tiers 1 and 2 starts left of 450, so what has to
         be cleared is the Node frame at 380, not the blocks.
NOTE     kubectl is on the RIGHT (772..1004). The API is centred on CX so the mirror Pod hangs
         straight below it and the Kubelet create lane is one vertical drop with both endpoints on
         face midpoints, which leaves only 64 units (420..484) for a 232 wide box on the left. The
         cost is a top row reading right to left, carried by an arrowhead per direction and a wire
         label over the gap at x=744.
LANES    The asymmetry is built into the lanes rather than stated in prose. Four routes and one
         relationship, and NOT ONE of them points from the API down at the Node:
           Manifest file -> Kubelet   the spec off the disk. The Kubelet is the actor, but the SPEC
                                      travels, so the arrowhead is on the Kubelet
           Kubelet -> static Pod      the container starting, and restarting on the edit step
           Kubelet -> mirror Pod      the create, and the recreate after the delete. UP, out of the band
           kubectl <-> API            one lane per direction, mirrored on LANE_DY
           API .... mirror Pod        a relationPath: the API HOLDS the object, it never drives it
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
         where check-terms is right to fail it.
CONTENT  The drain step gives the MECHANISM, not the reference's parenthesis. `cannot be deleted
         through the API server at all` contradicts step 4, which deletes one through the API
         server: the reference means the delete accomplishes nothing, not that it is refused, and
         the docs show the command reporting success. Two more absolutes went with it: `moving the
         file out of the directory stops it for good` is false (moving it back brings the Pod
         straight back), and the real documented limitation is that the spec cannot refer to other
         API objects such as a ServiceAccount, ConfigMap or Secret, which the narration now names.
NOT A DEFECT
         The Kubelet lane crosses the Node frame top edge. `check-geometry` excludes isFrame blocks
         from THROUGH by construction.
NOT A DEFECT
         `check-arrival` reports two R2s, both its documented blind spot. `static Pod` is written on
         arrival on `kubelet-starts` and on `edit-file`, the two steps that carry its highlight. DO
         NOT light the chip on `mirror` or `drain`, where nothing happens to the container.
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
LAYOUT   Layout C. Panel x<=397, y<=404, so the pipeline keeps 660..1140 and the chips are a
         two-across bottom strip at 532. Four across was 258 and six of the eight chip strings
         collided, including `Pod NEW · pri` against `2e9 (system-cluster-critical)`.
         Scheduler 420..780, centred on CX.
LANES    TWO lanes, not one, and they share the drop so they read as one wiring tree with two sources:
           SCAN_LANE  from the SCHEDULER, the preemption scan evaluating the Pods already on the Node
           NODE_LANE  from the API, what the API sets in motion once a write has landed on it: the
                      graceful delete of the victim, and the start of the bound Pod
         The Scheduler never reaches a Node. It writes to the API and the Node acts on what it reads,
         so picking one owner would have lied about the other.
NOTE     Slot 0 is the victim it preempts (Pod A) and the slot Pod NEW is bound into, which is why
         everything sent down addresses it. Same one-slot-two-identities shape cluster-resource-quota
         uses for its refused block.
DO NOT   Draw Pod A at 0 on the delete step. A Pod inside its terminationGracePeriodSeconds is the
         most present thing on the diagram, not an absence, and the victim chip on that same step
         reads `Pod A · Terminating` while the narration spends two sentences on the grace period it
         is serving. It holds OPACITY.terminating and keeps its slot, and leaves it on the BIND step,
         where the narration says it has exited and its capacity has returned to the Node.
NOTE     THE CARD MOVED FROM WORKLOADS TO CLUSTER, because preemption is the PostFilter stage of the
         same scheduling cycle cluster-scheduler-decision walks. The old id still resolves through
         SCHEME_ALIASES. Three things changed with it: the kit import (so the pulse carries
         CLUSTER_TINT), the chips and packets took role 'cluster', and the four Pods kept role
         'workloads' but gained the family violet override every other Cluster card with a Pod
         carries, so the resting stroke matches the pulse base.
         WL is a Workloads-kit export and does not exist on cluster-kit, so the X grammar is restated
         as local constants with identical values, with the ladder band spelled out as LAD_X 660,
         LAD_W 480. Geometry, steps, narration, chips, motion and poster are unchanged.
NOT A DEFECT
         The two off-card actors in `bind` are deliberate. "The controller that owns Pod A creates a
         replacement" and "the Kubelet evicts Pods that are over their requests first" both describe
         events explicitly OFF this card: a replacement placed elsewhere, and a mechanism the sentence
         itself marks as covered separately. Neither points the reader at a box that should be on the
         diagram. Do not file these again.
```

### before `s.refs.pod1.style.opacity   = String(OPACITY.terminating);`

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