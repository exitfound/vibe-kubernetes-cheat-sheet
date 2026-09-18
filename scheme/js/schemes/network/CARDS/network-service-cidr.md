## network-service-cidr

### layout

```
WHAT     The Service range read as a LEDGER: one ServiceCIDR object declares it, the allocator inside
         the API server takes a free address out of the high band, and the allocation exists only
         once an IPAddress object of that name is written, which is what stops two Services from
         taking one address.
LAYOUT   Two zones, split at x700. The RIGHT column holds everything that is a fact about the range,
         every part RANGE_W 440 wide on one left edge: the two ServiceCIDR objects across the top,
         the four-row address ladder under them, and the chip pair standing on the Service band. The
         LEFT and centre hold the allocation as a HUB WITH ONE JOB PER FACE, which is what keeps
         every lane straight. The API block is pinned to the dynamic row, API_CY = rowCY(DYN_ROW) =
         319, so the pick out of its right face is a single horizontal segment into the row it
         reads. Service web stands directly under it on the same centre line, so the claim and the
         answer are plain verticals, and the store hangs off the one face left over, out to x200 and
         down. The result is one reading AXIS at y319, store on the left of the allocator and range
         on its right, with the Service dialogue dropping off it.
         The two well-known addresses are LADDER ROWS and not boxes: they are entries in a range, not
         actors, and a box for each would put two blocks on the canvas that no step addresses.
         `chain`, `cylinder` and `column` are the three levers no other card in `network-foundations`
         carries, and `kin.mjs --id=network-service-cidr` prints `box4 pod0 node0 chip2 cyl1 chain1
         raw0`, a signature no sibling shares.
PANEL    `OVERLAY_IDS=network-service-cidr node --test report/overlay.test.mjs` from `scheme/test/`,
         and `extents.mjs --viewport=` for the per-step rectangle. The panel is deepest at 1100x800
         and on `range` and `extend` together, where it measures x<=396.5 and y<=229.8. Per step
         there it runs 229.8, 229.8, 180.1, 205.0, 229.8, against 192.7 / 171.4 at 1280x860
         (x<=377.8) and 160.0 / 142.6 at 1600x1000 (x<=290.8). Judge on 229.8, since the narrowest
         viewport wraps the same text into more lines.
         `range` IS THE CHARACTER BUDGET this card has, and the number is measured rather than
         guessed (`L-08`). Its narration is 330 characters and measures exactly 229.8 at 1100x800.
         At 377 characters the same step measures 279.5, and the API block top stands at y279: the
         panel bottom lands ON the block edge and the card takes an `L-03` finding that only a cut
         to the text can answer. So a clause added to `range` is paid for by a cut somewhere else in
         `range`, never by dropping the clause (`T-20`), and the ceiling to check against is 330.
         What the wall settles here is a lane rather than a block, and it settles API_CX. The range
         feed drops on the API top MIDPOINT, so its vertical stands at x420 for the whole run from
         y80 to the block top at y279, and 420 is exactly the `L-03` line: 23.45 clear of the
         deepest measured wall at 396.55, read on the rendered 1100x800 frame of all five steps
         rather than off the number. Moving the API further left, which is what the straight feed
         invites, walks that lane into the panel.
         Three blocks stand in the band the panel occupies horizontally and all three are settled by
         229.8 rather than by `OCCLUDED`, which scores AREA and reads clean on a box that has lost a
         strip. The API block spans 304..536, so 92.6 of it is behind the wall, and its top at y279
         clears the deepest reading by 49.2. Service web at 304..536 clears it by 280.2 and the ETCD
         cylinder at 130..270 by 270.2. Opened at 1100x800 on all five steps to look at the edges
         rather than to read the score.
SIZES    ACTOR_W 232 is the family width of `NET.L-01` and both actor blocks take it, measured rather
         than assumed: the API block holds `ClusterIP allocator` at 116.6 units, which leaves 57.7 a
         side at 1100x800, and Service web holds `clusterIP 10.96.137.42` at 135.0, the tighter of
         the two, which leaves 48.5. ACTOR_H is 80, the catalog block height that `CLU.BOX_W` boxes
         and `network-model` take, and it is shared so the two read as peers.
         ETCD is 140 x 100 with ETCD_Y at SVC_Y - 10, which is the store as `cluster-list-watch-
         informers` and `workloads-graceful-shutdown` draw it: the catalog size, with the cylinder
         overhanging its band by 10 a side. The label `ETCD` inks 29.4 in a 140 box.
         The range column does NOT take 232 and that is deliberate. A ladder rung and a chip are not
         actor blocks, and the two ServiceCIDR boxes are SIZED BY the column they stand in rather
         than placed in an actor row: CIDR_W solves as (RANGE_W - CIDR_GAP) / 2, so (440 - 16) / 2 =
         212. At the family width the pair would measure 2 x 232 + 16 = 480 against a RANGE_W of 440,
         so taking 232 there breaks the one left edge and one width the whole right column is built
         on. The two blocks OUTSIDE the column, the API block and Service web, take 232 apiece.
         RANGE_W 440 is SCHEME_R minus the split at x700 and is not floored by its own content: the
         widest part in it is the ladder row `static band · 10.96.0.1 to 10.96.1.0, 256 of the /16`
         at 319.0 units measured by `extents.mjs --viewport=1100x800`, 339.0 with the 10 of row
         padding a side, which leaves 101.0 of slack. The band row under it, `dynamic band ·
         10.96.1.1 to 10.96.255.254`, inks 251.5 on the same reading and floors nothing.
         What the numbers do settle is how far right the split could move: the widest
         chip pairing is `ranges in play` on `extend`, name 85.9 plus value 177.9 plus 24 of padding,
         287.8, so a 280 wide column could not hold it. The IPAddress chip is the looser of the two,
         55.2 plus 159.5 with the same padding, 238.7.
LANES    Six lanes, every one of them ridden on some step, so none is a relation and every arrowhead
         is earned. All six carry the category role (`NET.A-04`), so `dim` on the shared WIRE is
         the 1.4 stroke WEIGHT only.
         SIX LANES CARRY FOUR CORNERS BETWEEN THEM, and that is the number the composition is FOR.
         Two are straight: the pick runs API right face to the dynamic row at one y, and the claim
         and the answer are plain verticals in one corridor. The range feed and the write take one
         corner each, the add-on feed two. Every turn is a right angle onto a face MIDPOINT and no
         lane doubles back on itself.
         Two faces carry a MIRRORED PAIR about their midpoint at FACE_DX 20 (`L-12`) rather than two
         strays, the API server bottom and the Service top, and because the two blocks share one
         centre line the pair is the SAME two x values at both ends: the claim rises at 400 and the
         answer drops at 440. The other three API faces take one endpoint apiece, at the midpoint:
         the range in on the top, the pick out on the right, the write out on the left.
         The add-on feed leaves cidr2 SIDEWAYS at its right face, runs out to EXT_RAIL_X 1180, drops
         and turns back in. Both of its endpoints stand at SCHEME_R 1140, which is where cidr2 ends
         and where the ladder ends, so the bracket is 40 wide and sits outside a column that already
         fills 700..1140. It joins the ladder at the DYNAMIC row and not at the ladder centre: the
         centre falls in the 16 unit gap between the two well-known rows, where the arrowhead reads
         as pointing at kube-dns.
         THE WRITE CARRIES NO HOOK-BACK, and ETCD_CX 200 is what buys that: the lane leaves the API
         left face and reaches the store in ONE corner, 285 units, with no back leg. A store standing
         right of there instead, on a cap at 550 that sits 6 units left of the face the lane starts
         from, costs a spine out at 620, a drop, and then 70 units BACK LEFT, and the corner at
         620,444 reads as the END of the lane rather than as a turn. The direction is the price and
         it is stated rather than hidden: the write reads LEFTWARD, which is not the reading order of
         the other three lanes, and it is what buys the hub its fourth free face.
MOTION   There are no Pods on this card, so nothing pulses: motion is packets plus a box highlight
         plus the arrival ripple. No ball carries an explicit `dur`, so every speed is its own
         length: 0.450, 0.216, 0.234, 0.407, 0.216 and 0.450 units per ms over lengths of 479, 151,
         164, 285, 151 and 319. Three of the six sit under the catalog median, which is what a card
         of straight lanes on a canvas this size costs. It is the house reading rather than a
         finding: most of the catalogue's balls are floor-bound on most of its cards (`M-13`), and
         each of the two short lengths has a named sibling running it, 151 on
         `storage-multi-attach-error` and 164 on `network-dualstack`. A card whose lanes are straight
         cannot also have long lanes on a canvas this size, and the picture is what the reader is
         here for. The population, the median and the floor-bound share are `pace.mjs`, which is
         where they execute, so no number of theirs is copied into this record.
         `range` DRAWS THE PRECEDENCE ITS SENTENCE STATES, and that is what its hold is for. The two
         band rows do not stand lit from the top of the step: `rewind` winds the chain back to no
         row, the dynamic row lights on the allocator arrival at 1064ms and the static row 700ms
         after it, so the picture says the high band first and the low band as the fallback in the
         order the narration says it. Lit together at 0ms the step stands 65 percent still with one
         hop carrying the whole hold and says nothing about order. Staged it reads 41 percent, level
         with the catalog median. The END STATE is the same whichever order the two rows take, which
         is what makes the staging a matter of timing and not of state: `settled-dump.mjs` reads four
         highlights on `range` either way, and the reduced path takes `chain` from above the guard.
         None of the four durations is generous. `deadair.mjs` reads the still time at 41, 42, 46 and
         60 percent and `timing.mjs` the pace at 9.09, 9.96, 10.41 and 9.46 ms per character, three
         of the four under the catalog median, so cutting a duration to close the stillness would
         take reading time away, which is the wrong half. Both tools print the catalog figure beside
         the card figure, which is why neither is restated here.
         A clusterIP WAITS for the packet that carries it (`P-03`). `write` is the one step with two
         hops, and the two halves of the allocation land on the hop the narration gives each: the
         IPAddress chip takes its value and its opacity on the store arrival at 700ms, and the
         Service sublabel takes the address on the answer arrival at 1500ms. That is `P-04` answered
         rather than dropped. The two halves still name ONE address and neither moves without the
         other, and the composition draws the ORDER the narration states, that the object exists
         before the field is set. Both are wound back so the static path keeps the end state.
         A BLOCK IS CUED BY THE BALL AND A CHIP BY ITS OWN VALUE. `writeStatics` applies `lit` at the
         top of the step on the animated path too, so only SENDERS stand there, the allocator on
         `write` and the add-on on `extend`. ETCD is cued from `lights` on the store arrival at 700ms
         and appears in no `lit`, or it would be lit for the 700ms before the write reaches it
         (`R3`). The `ranges in play` chip takes its second value and its `F.light` together on the
         `grow` arrival at 1129ms, because it stands on screen from the top of `extend` carrying the
         OLD value. The IPAddress chip can sit in `lit` instead, since it is at opacity 0 until the
         arrival that reveals it.
         Read in real time with `tools/settled-dump.mjs`, not off a frame: an `F.set` or an `F.light`
         fired from an arrival is a deferred callback, so a seeked frame at 95 percent of `write`
         still shows clusterIP pending and an empty IPAddress chip, and one at 95 percent of `extend`
         shows the range chip uncued (`M-35`).
CONTENT  Read against `k8s 1.35`. All three kubernetes.io pages in `sources` still carry the
         statement the card cites them for, and the two claims no such page states are carried by the
         `Multiple ServiceCIDRs KEP`, which is in `sources` as a fourth entry for exactly those two.
         It is named as a KEP rather than by its number, both because a KEP is a design document
         rather than a contract and because that number written in the usual prefixed form reads as
         a canon rule id to `D1` and dangles the citation check.
         ONE PAIR OF BAND NAMES, AND THE PROSE USES THE NAMES THE PICTURE DRAWS. The ladder rows
         read `static band` and `dynamic band`, so a narration saying `high band` and `low band`
         makes the reader map two vocabularies with nothing on the canvas joining them, and it hides
         which row the ball just landed on. The card joins them in every sentence that names a band:
         `range` reads `the high dynamic band` and `the low static band`, `claim` reads `the high
         dynamic band`, and the `aria-label` reads `a low static band` and `a high dynamic
         band`, which is where the joined form comes from. `Automatic addresses are taken from the
         high band` is rejected as a THIRD word for one thing: the reference contrasts dynamic with
         static allocation, `This will allow users to use static allocations on the lower band with
         a low risk of collision`, so `automatic` beside a row labelled `dynamic band` is a
         vocabulary the source does not have. The `desc` takes the bare `dynamic band` and `static
         one`, because it is grid text that never stands beside the rows and the character band is
         12 wide at the top.
         The band order is a PREFERENCE and never a reservation, and the card states it twice, so
         both statements answer one quote. `Service ClusterIP allocation`: `Dynamic IP assignment
         uses the upper band by default, once this has been exhausted it will use the lower range`,
         and of the DNS address, `the IP address 10.96.0.10 has not been reserved. If other Services
         are created before or in parallel with dynamic allocation, there is a chance they can
         allocate this IP`. So the `desc` says kube-dns is not reserved, only unlikely to be taken.
         Any wording that RESERVES the low band for hand-picked addresses is rejected on that quote.
         THE FALLBACK IS SCOPED TO AUTOMATIC ALLOCATION AND THE SCOPE IS DRAWN IN THE SAME BREATH.
         `the low band is used only once the high one runs out` is rejected as a false absolute: the
         low band is what a hand-picked address uses at any time, which is the band's whole purpose
         on the reference's own quote above. `range` reads `Automatic allocation takes the high
         dynamic band first and the low static band only once that runs out`, which puts the
         absolute on AUTOMATIC allocation where it is true, and the sentence after it carries the
         counter-case rather than leaving it implied: `The low band is for addresses picked by
         hand`. Dropping that sentence to buy panel depth is the `T-20` defect the clause exists to
         answer, and `PANEL` above says what to cut instead.
         `the high band, which is where every automatic address comes from` is rejected twice over:
         the page's own fallback falsifies it, and it contradicts `range` one step earlier. `claim`
         reads `which is tried first for every automatic address`, which puts the absolute on the
         ORDER, where it is true, instead of on the source, where it is not.
         The static band EXTENT is the worked example for this card's own range and is not a prefix.
         `Service ClusterIP allocation` derives the size as `min(max(16, cidrSize / 16), 256)` and
         for 10.96.0.0/16 prints `Band Offset: min(max(16, 65536/16), 256) = min(4096, 256) = 256`,
         `Static band start: 10.96.0.1`, `Static band ends: 10.96.1.0`, `Range end: 10.96.255.254`.
         So the ladder reads 10.96.0.1 to 10.96.1.0 and the dynamic row opens at 10.96.1.1.
         `10.96.0.0/24` is rejected: it holds 10.96.0.0 and stops at 10.96.0.255, so it neither
         starts nor ends where the band does. A dynamic row opening at 10.96.1.0 is rejected on the
         same quote, that address being the LAST of the static band, and the count settles it:
         10.96.1.1 to 10.96.255.254 is 65278 addresses, which is the `Dynamic: 65278` the page prints.
         The allocator runs INSIDE kube-apiserver, which is why the block is `API` and the component
         is named by the sublabel. The KEP: `1 new allocator implementing current
         allocator.Interface, that runs in each apiserver`. `Extend Service IP Ranges` is the doc
         half, giving the range as `the value of the --service-cluster-ip-range command line argument
         to kube-apiserver`.
         The allocation is atomic on the object NAME and on nothing else, which is the card's one
         sentence. The KEP: `The uniqueness of an IPAddress is guaranteed by the apiserver, since
         trying to create an IP address that already exist will fail`, over `The name of the object
         is the IP address in canonical format`, and on the race, `the storage guarantees the
         consistency and the first will win, meanwhile the other will have to retry`. The ORDER the
         animation draws comes from the same page: `the allocator will just try to create the
         corresponding IPAddress objects, any error creating the IPAddress object will cause an error
         on the Service creation`, and `If the apiserver crashes during a Service create operation,
         the IPAddress is allocated but the Service is not created`. The object exists before the
         field is set, so the write into ETCD is drawn before the answer to the Service.
         The `IPAddress` chip value pairs the object name with what it points at. `Extend Service IP
         Ranges` prints `NAME 10.96.0.1` against `PARENTREF services/default/kubernetes`, so
         `10.96.137.42 · default/web` drops only the resource prefix the chip NAME already gives.
         Growing the range restarts nothing. `Extend Service IP Ranges`: `previously, increasing the
         Service range was a disruptive operation that could also cause data loss. With this new
         feature users only need to add a new ServiceCIDR to increase the number of available
         addresses`, and the feature is `Stable since Kubernetes v1.33`, so at 1.35 `extend` states
         it with no gate hedge.
         `the two addresses standing in it are unlikely to be taken rather than reserved` is correct
         of 10.96.0.1 as well as of 10.96.0.10, because nothing in the allocator reserves either and
         the first address is only CLAIMED at bootstrap, by the well-known Service that `calculates
         the first IP address from the default ServiceCIDR range`. Narrowing the sentence to kube-dns
         is rejected: it would repeat the `desc` and drop the ladder row above it.
         `clusterIP field left empty` on `claim` is the API reference wording and not a loose one.
         `Service` v1 gives the field as `Valid values are "None", empty string (""), or a valid IP
         address`, and of the empty case, `clusterIP is the IP address of the service and is usually
         assigned randomly`, so the empty string is what triggers allocation. `None` is the other
         non-address value and it allocates nothing, which is `network-headless-service` and not
         this card, and `left empty` is the phrase that excludes it without naming it.
         NAMING THE FIRST ServiceCIDR `kubernetes` IS REJECTED, though it is true. `Extend Service
         IP Ranges` states that a cluster `create[s] a ServiceCIDR object with the well-known name
         kubernetes` from the flag, and at 1.35 the feature cannot be disabled, so the default
         object always carries that name and it would fit the 212 box. It is left off because the
         ladder already carries `10.96.0.1 · Service kubernetes`: two different objects both named
         kubernetes, one a ServiceCIDR and one a Service, on one canvas, and the collision costs
         more than the name buys. What the box says instead is its range, which is the fact the
         card is about.
SCOPE    The SERVICE address space only: one cluster-wide range declared by a ServiceCIDR object, the
         band the allocator prefers and the ClusterIP that comes out of it. Nothing here is cut per
         Node, and the per-Node podCIDR slice with the Pod IP the CNI IPAM draws from it belongs to
         `network-ipam-pod-cidr`.
NOTE     The chip column carries only what the ladder cannot. A chain row and a value chip render as
         the same `.scheme-chip` rect, so a chip restating a ladder row turns the whole right column
         into one run of eight identical bars, which is what a band chip beside a band row
         makes. The two chips that stand there are the range SET, which no single row can hold, and
         the IPAddress object, which no row exists for until the write.
         `ranges in play` reading `10.96.0.0/16` on the first four steps repeats the `ServiceCIDR`
         sublabel word for word and is NOT a defect. The sublabel is the spec field of ONE object and
         the chip is the union of every ServiceCIDR the allocator holds, so the two coincide only
         while there is one object: on `extend` each box still names its own range while the chip
         names both together. A chip reading `1` until then would carry the change and lose the fact.
         The two strings also stand 424.8 viewBox units apart vertically, sublabel baseline band
         83..95.2 against chip value band 520..534.7, which is not a distance read as a repetition.
         The allocator block is labelled `API`, the word 31 other cards use, and NOT `kube-apiserver`.
         The binary name collides with the `Kube-apiserver` of `storage-csi-architecture` and `T-13`
         fails the gate on the pair, which is the same reason `workloads-pod-scheduling-gates` gives
         in its own record. What names the component here is the sublabel, `ClusterIP allocator`.
         The static band size is derived from the range size, so the ladder row states the size only
         as `256 of the /16` it is drawn from and no bare 256 appears anywhere. The row names the two
         ENDPOINTS rather than a prefix, because the band is not one: for a /16 it runs 10.96.0.1 to
         10.96.1.0, which no CIDR expresses.
DO NOT   Put an `F.ripple` at the end of a route. `packetAlong` rings on arrival with no opt-in, so a
         ripple naming the LAST POINT of a route at that route's own arrival opens two identical
         rings from one pixel on one millisecond, measured at the arrival instant as 2 rings on one
         point both at opacity 0.936 against 0.631 for a single ring. The verb is for a receiving BOX
         no ball reaches, where a Pod would get a pulse (`M-14`). The six arrivals on this card stand
         at 1064, 700, 1500, 700, 1500 and 1129ms and none of them carries one.
OPEN     CENTRE. The chip column spans 700..1140, centre 920, against a want of 600. It is a COLUMN
         by design and the lever no sibling here carries: centring it on 600 means either a strip
         across the width, which is the house reading this card exists to leave (8 of the 11 siblings
         in `network-foundations` stand their chips in one row across the content band, 2 of them
         through the `strip` helper), or moving the range stack into the middle and putting the
         ladder on top of the allocation flow. There is also no room to slide it: a 440 wide strip
         centred on 600 would run 380..820 at CHIP_Y0 510, and the band from y510 to y588 already
         holds Service web at 304..536 and the ETCD cylinder at 130..270. `L-16` is why it stays open.
         CENTRE-LOW. The three blocks the rule can see below the panel span 130..536, centre 333,
         and re-derived block by block that is the ETCD cylinder 130..270, the API block 304..536 and
         Service web 304..536. The trade is stated rather than hidden: the store stands left because
         that is the face the write can leave from without a corner budget, and the two actor blocks
         share one centre line because that is what makes the claim and the answer verticals.
         The rule counts neither the chain nor the chips, and the parts that balance those three are
         the ladder and the chip pair at 700..1140. The composition itself is close to centred: the
         bodies span 130..1140, centre 635, which is 35 off the want of about 600. `L-17` is why the
         rule cannot close.
```
