# Scheme card design notes: network

The per-card design record for `js/schemes/network/`. It answers what the code cannot: why a number
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

## network-client-ip-preservation

### layout

```
WHAT     Where the client IP goes when a proxy is in the path, and how X-Forwarded-For or the PROXY
         protocol brings it back.
PANEL    bottom 355 over 1600x1000 / 1280x860 / 1100x800, the deepest in networking. It is a header
         comment and not a constant, because nothing in the layout reads it (`L-07`).
NOTE     The two header chips are centred ON THE PROXY, with an ownership link and no arrowhead,
         because those headers are what that Pod writes. Their left edge 440 clears the overlay
         right edge 397 by 43.
NOTE     Four chips span the scheme 1:1, widths tuned to their content. What the backend SEES is an
         outcome of a request, so those three start empty until traffic flows, `src at backend` and
         `app reads` at none and `client IP` at unknown; the edge mode is a property of the setup,
         so it is true from the start.
DO NOT   Read `PANEL_BOTTOM = 190` as the narration panel. It is the bottom edge of the drawn
         header chip. The narration panel bottom is the measured 355 in the header comment.
MOTION   Every ball wears a riding tag, because what each hop CARRIES is the whole card: the true
         source in, the proxy source out, then the header, then the PROXY protocol preamble. The
         proxy is the SENDER on each proxied hop, so it pulses as it opens the new connection and
         only then does the request leave carrying the proxy address as its source.
NOT A DEFECT
         `report/arrival.test.mjs` carries two R2-STEP findings on `passthrough`: `X-Forwarded-For`
         and `Forwarded` go back to `none` and take no highlight. Raw TCP has no headers to write
         into, so the pair empties because this mode HAS none, which is a property of the mode and
         not an event. The news of the step is the preamble, and `mode`, `app reads` and `client IP`
         all light. DO NOT cue the header pair here: it would read as the headers being cleared BY
         something on this step.
         The empty rectangle in the left middle, about 440 wide by 216 tall between the header-chip
         column at x 440 and the Client top at y 372, is the narration panel FOOTPRINT and not a void.
         At 1600x1000 the panel bottom runs 125.11..229.77 and leaves 142 to 247 of it bare; at
         1100x800 it runs 180.12..354.05, and on step 5 the panel reaches 354 and fills the rectangle
         down to the Client block. That is the L shape `L-01` describes, and `FLOW_Y` 410 exists to
         leave exactly this room. Filling it with a block would put that block under the panel on the
         viewport the card is measured against.
```

### before `F.set({ at: 'out', chips: { srcChip: 'proxy 10.244.0.9', readsChip: 'socket', ipChip: 'lost' } }),`

```
P-03 on `reproxy`. All three of these read the packet the BACKEND receives, so none of them can be
true before that packet gets there. `chips` still keeps the end state, which is what the static path
shows, `rewind` winds the trio back to what `arrive` actually left (none, none, seen at the edge),
and this F.set turns all three over on the `out` arrival at 1500ms: the proxy pulses at 0, the new
connection leaves at BEAT.afterPulse 800 and the 240 unit hop takes the 700ms routeDur floor.
All three move on ONE beat because they are one reading of one packet (P-04): the source the socket
carries, what the app can read out of it, and whether the client IP survived. Splitting them would
say the address is lost before the app has read anything.
Measured in real time, not by seeking: 300 and 1200ms read none / none / seen at the edge with the
ball still in flight under its `src 10.244.0.9 (proxy)` tag, 1750 and 2600ms read
proxy 10.244.0.9 / socket / lost. A seek-based probe shows the rewound value at EVERY timestamp,
because an F.set rides an onfinish and a paused animation never fires one.
DO NOT put the start value in `chips` and raise it with the F.set alone. The static path never runs
the flow, so it would end on none while the animated path ends on lost, and
report/chip-beat.test.mjs section 4 counts exactly that divergence.
```

### before `const FLOW_Y = 410;`

```
The row sits low because the measured narration panel reaches 355 here, the deepest in networking.
FLOW_Y 410 puts the Client top at 372 and clears it, so a longer narration invalidates the row
placement rather than merely crowding it.
```

### poster

```
Mirrors the diagram: client, edge proxy Pod, backend Pod on one line, with the two header bars the
edge writes docked above the proxy. No ball rides the legs: the poster states the composition, and
what each leg carries is what the steps answer.
Geometry: everything centred on the flow line y=118, the panel centred on the proxy (cx 160) with
its link dropping onto the proxy top edge, every dash starting and ending on a shape edge.
```

## network-cni-invocation

### layout

```
WHAT     A control-plane handoff, not Pod traffic: kubelet -> CRI runtime -> CNI plugin chain, and the
         allocated IP wired back into the sandbox namespace as eth0.
NOTE     The CNI plugin frame holds a vertical dashed spine tapping each plugin row, aligned so its
         TOP tap is at the runtime row and its BOTTOM tap at the sandbox row, which keeps the ADD
         and result arrows dead straight with no mid-run jog.
NOT A DEFECT
         CENTRE-LOW is OPEN here and stays open. The whole right half of the picture is a `node()`
         frame with `chainList` rows inside it, and the rule counts neither frames nor chips. The
         drawing is centred, the rule is not.
DO NOT   Shift the boxes the rule CAN see to make the number go green. That decentres the picture a
         reader actually looks at.
CONTENT  The result step and the eth0 step describe what the BALL does, and the ball runs down the
         spine and then into the sandbox. The CNI result is of course returned to the runtime
         upstream, but no motion here runs back to the `cri` box, so neither step says it is handed
         back or recorded there: the eth0 step closes on `CNI op: ADD ok`, which is drawn.
```

### before `const RAISE = 64;`

```
The whole diagram is lifted by RAISE, so every tier moves together rather than one at a time. The
sandbox height is then tuned so its block centre lands exactly on PAUSE_Y, which is what keeps the
result and join arrows straight.
```

### poster

```
Three tiers and one dashed spine: Kubelet and runtime on the top row, the sandbox with its fresh
namespace below them (the only box tinted with the network cyan at 0.06), and a stack of three
plugin bars on the right hung off one vertical. The sentence is that the wiring is DELEGATED: every
leg is dashed because nothing on this poster carries traffic, it is all calls.
The plugin stack is three identical bars on purpose. Distinguishing them would say which plugin
matters, and the point is that the runtime does not know or care.
```


## network-conntrack-nat

### layout

```
WHAT     A flow through netfilter: the NAT rewrite on the way in, and the conntrack entry that makes
         the reply cheap.
NOTE     The four state chips sit in one plane UNDER the block each describes: orig dst under the
         client, ct state + reply under netfilter, translated under the server. The outer two are
         flush with the Pod footprints (70 and 1130); the middle pair stays centred under netfilter at
         NF_CX 590 and is therefore NOT on the same rhythm as the outer two, because they belong to
         the box above them rather than to the strip.
CONTENT  The `reply` chip on the established step has to stay true of the REPLY, not describe the ball
         on screen, because that step animates a REQUEST only. What is true of the reply on an
         established flow is that it takes the same entry and the same reverse translation and no
         longer costs a rule walk.
DO NOT   Set it to `fast path` there. That is the outbound path, it sits next to the previous step's
         `reverse NAT`, and the reuse makes it read as an answer to a question nobody asked.
```

### before `const POD_Y = 252, POD_H = 120;`

```
Both Pod shells stand on one baseline, and the row spans 70..1130 to centre on 600, which is why the
server Pod ends on 1130 rather than 1110. The two lanes are stacked about that baseline so every ball
has a matching arrow.
```

### poster

```
The scheme in miniature, vertically centred: client Pod -> netfilter (holding a 2x2 conntrack table
mapping the original tuple to the translated one) -> server Pod. Two lanes carry the flow with
explicit chevrons: the request left to right on the top lane, the reply right to left on the
bottom, each with its own packet.
```

## network-dns-coredns

### layout

```
WHAT     A name resolved through the CoreDNS plugin chain, and which plugin actually answers.
PANEL    right <= 397, bottom <= 305, one of the deepest in the catalog. The row hangs below it at
         FLOW_Y 400, client top 325.
WHY NOT  The client column at y 175: its whole app box and three quarters of its shell sit under the
         panel on the narrow viewports.
NOTE     Three plugin boxes symmetric about FLOW_Y (kubernetes on the line, cache above, forward
         below), leaving equal 37px margins to the pod label and sublabel. Offsets are held relative
         to the shell top (PLUGIN_Y), so moving the Pod cannot leave them behind. Order is the CoreDNS
         plugin CHAIN order (compiled into the binary), not the Corefile line order.
         clientBox is listed by key in `SCENE.reset`, or the highlight a reduced replay sets in the
         resolv / query / answer steps leaks into the plugin-chain step.
DO NOT   Pulse the bare pod element. `pulsePod` uses querySelectorAll, which matches DESCENDANTS only:
         it would find the rect but never the `.scheme-pod` itself, so the brightness half of the
         pulse silently would not fire. The shell is wrapped in a `g` for exactly this.
MOTION   The query lane is 510 units, which is why the query step carries a 3000ms budget.
```

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
The CoreDNS Pod holds CONTENT_R, so the two blocks centre the content bbox on 600 with no frame to
lean on. Pull the Pod in and the card decentres, since the ladder and the chips are not blocks and
CENTRE cannot see them.
```

### before `lit: ['rcSearch', 'rcNdots', 'queryChip'],`

```
NOT A DEFECT on `queryChip`. It reads `web.default.svc.cluster.local` and is lit from step ENTRY while
the ball is still crossing to CoreDNS, which `report/chip-beat.test.mjs` lists as FORM-B with a 1933ms
lead, one of the longest in the category. It is not repaired, and two things on the same frame are why.
The value is made by the CLIENT, not by CoreDNS. Expanding the short name against the search list is
what the resolver does before it sends anything, and the two lines that rule reads, `search` and
`options ndots:5`, are lit on this step beside the chip. Binding the chip to the CoreDNS arrival would
say the query string only becomes true once the server has it.
The wire label already states it, statically. `q` reads `A? web.default.svc...` on the lane the ball is
riding, written in the static block on both paths, so a chip winding back to `-` would sit under a
bigger, brighter copy of the same fact. Read off the 1600x1000 frame at t=1400: the query panel filled
and lit, the lane caption naming the same question, the `answer A` panel below it still reading `-`,
which is the value that genuinely waits and does wait. P-04 moves what a component KNOWS on arrival,
and what it DID when the call lands; the expansion is what the client did before either.
```

### before `const RESOLV = { rcNS: '10.96.0.10',`

```
The chip-unwritten queue, ruled CONSTANTS OF THE DIAGRAM. The three chips are a FILE, and the resolv
step says so in words: the Kubelet wrote it at startup, before anything on this card happens, so no
step can produce one of its lines. Every step states all three, which puts them inside P-01, and the
values are the ones the scene was built with, so no step moves the settled frame.
The highlights stay: resolv points at the whole file it is narrating, query at the two lines the
expansion rule reads. Both cue a value the reader has to look at, not a value that just changed.
```

### poster

```
A name goes in, an address comes out: one left-to-right transform on the flow line y=90. A NAME is
one unbroken bar (a single string), an ADDRESS is four short segments split by dots (a quad), so
the two ends read as different KINDS of thing at a glance. Between them the CoreDNS chain: three
plugin bars, cache and forward dimmed to 0.45 and kubernetes brightened, because that is the one
that answers.
Deliberately no Pod boxes: the siblings already open with a box-and-dashed-line row, and the
subject here is the transform, not the topology. The lanes carry no packet dots, so the only
circles left are the three separating the address segments.
```

## network-dns-ndots

### layout

```
WHAT     What a short name costs: the resolver walks the search list, so one lookup is four round
         trips per address family.
PANEL    right <= 397, bottom <= 230 over the three OCCLUDED viewports. FLOW_Y 400 puts the Pod top
         at 335, well below it, and the resolv.conf chips take the space under it.
LANES    Query and answer on SEPARATE lanes, because the whole point is the cost of a ROUND TRIP: a
         miss is a packet out AND an NXDOMAIN back, four times over.
WIRE LABELS
         Three, not two: the query and answer labels on x 600, plus a `branch` caption centred on
         the ladder at x 935, y 48, written on the walk step alone and blank on the other four.
         It is the T-35 counterfactual sign, and the anchored note on that part holds the
         measurement that put it there.
WHY NOT  A deliberately SHORT lane (190 units, CoreDNS pulled in close), on the argument that the
         card is about how MANY queries are sent rather than how far they travel. The ladder is
         chips, so the only things CENTRE can see are the Pod and the CoreDNS box, and centring them
         means putting them on opposite margins. The four round trips still read as four identical
         beats, which is the part that carries the lesson.
NOTE     resolv.conf is drawn as its own chips (search + options) under the Pod, as in
         network-dns-coredns, rather than as a box whose sublabel repeats a chip beside it.
CONTENT  The real search list for a Pod in namespace ns is `ns.svc.cluster.local svc.cluster.local
         cluster.local`, so a short name is tried against each in turn and only then as it was
         written. Four candidates, so four round trips per address family.
         The counter chip counts NAMES TRIED, not DNS messages: getaddrinfo asks for A and AAAA in
         parallel, so each name costs two queries on the wire. Calling it `queries` and showing 1 for
         a hit would contradict the walk step, which tells the reader the IPv4 plus IPv6 total
         doubles. The answer chip carries the real DNS rcode, so NOERROR and NXDOMAIN read as the
         pair they are.
MOTION   One query is a full ROUND TRIP, and each attempt chains off the arrival of the one before.
         `depart` is when the question leaves: BEAT.afterPulse for a fresh lookup, `at` the previous
         answer plus 460 for the retries of a search-list walk, which the resolver fires back to
         back.
         `pulseOnSend` is false for those retries, where the Pod has just pulsed on the NXDOMAIN
         landing 300ms earlier and a second pulse on top smears into one long blink.
BUDGET   Four full round trips on the 380 unit lane run about 9.3s and the last NXDOMAIN pulse rings
         on to about 10.2s, so the step is 10400. DO NOT shorten it below its own motion: auto-advance
         would clip the walk halfway and the card would silently under-count the very cost it teaches.
         The budget was 9200 while the lane was 190 units, because routeDur is length-based.
DO NOT   Leave the two lane labels to `flow` alone. Every round-trip step states the END state of
         both lanes in its `wires` field and winds them back with `rewind`, because the static path
         never runs the flow: without the field the two lanes stand empty there while the ladder and
         the counters carry the whole story. The walk step ends on the LAST candidate and its
         NXDOMAIN, the pair the fourth round trip leaves on the wire.
NOT A DEFECT
         The fqdn step restates the name WITH its trailing dot, so `render/inline.test.mjs` reports
         `api.ns.svc.cluster.local.` against `api.ns.svc.cluster.local` as an ambiguous pair. That
         pair IS the subject of the step: one name is absolute and the other is not.
```

### before `F.set({ chips: { namesChip: '1', answerChip: 'NOERROR' }, at: 'a0' }),`

```
P-03. The two counters WAIT for the answer, so neither value is on screen before the packet that
earns it. `chips` keeps the state the step ENDS in, which is what the static path shows, `rewind`
winds it back to what the step before actually left (append to 0 / none, fqdn to the 4 and
NXDOMAIN x4 the walk settled on), and this F.set turns both over on the `a0` arrival at 2588ms. The
lane is 380 units, so the question lands at 1644 and the answer 100ms later plus its own 844 of
travel.
The append step winds the ladder row back on the same rewind, so row 0 lights when the question
DEPARTS at 800, which is what askOnce already says it does and what the walk step already did.
Measured in real time, not by seeking: 200ms reads 0 / none over an empty ladder, row 0 lights just
after 900, and 2700ms reads 1 / NOERROR. A seek-based probe cannot see any of it, because an F.set
rides an onfinish and a paused animation never fires one.
DO NOT put the START value in `chips` and raise it with the F.set alone. The static path never runs
the flow, so it would end on 0 / none while the animated path ends on 1 / NOERROR, and
report/chip-beat.test.mjs counts exactly that divergence.
```

### before `const CANDIDATES =`

```
Four candidates, so four round trips per address family, and the step budget of 10400 is sized off
exactly this list on a 380 unit lane. Adding a fifth candidate lengthens the walk past the budget
and the auto-advance clips it.
```

### before `P.wire({ key: 'branch', x: ROWS_X + ROWS_W / 2, y: ROWS_Y - 12 }),`

```
T-35, and the measurement that decided it against a refusal. The walk step IS a counterfactual, not
a second legitimate case of a search-list walk: its first round trip asks api.ns.svc.cluster.local,
the exact name the append step resolved a moment earlier, and answers NXDOMAIN for it. Played in
real time the contradictory pair stands on the canvas from the a0 arrival at 2588 until the second
question departs at 3048, and the frame at 2900 is the append frame with the answer flipped, same
query label, same single lit ladder row, names tried 1, rcode NXDOMAIN where append reads NOERROR.
The fqdn step then resolves that same name again, so the walk sits between two steps in which the
name exists, and nothing on the canvas said the middle one is a supposition. The narration naming
the branch (`if that first guess misses`) is what kept the review finding a DECISION rather than a
defect, and it is not enough by itself: a reader with the panel closed sees one name answered two
ways.
The caption is centred ON THE LADDER because the ladder is the branching group. Row 0 alone lights
on append and all four light here, so the ladder is the one object whose state differs between the
two worlds, and a caption 12 above its top row reads as its title, exactly as the /etc/resolv.conf
tag does over the resolv.conf chips.
Measured, `if instead that first guess misses` in the 11px mono of `scheme-label code dim`: 234.29
units wide at 1600x1000, 214.06 at 1280x860, 208.59 at 1100x800, spanning 817.85..1052.14 /
827.97..1042.03 / 830.71..1039.30. Inside the ladder span 740..1130 at every viewport, and 421 clear
of the deepest panel right edge in the set, 396.55. Its bbox bottom is 51.4 against the ladder top
60, the same 8.6 gap the resolv.conf tag keeps. A 12 percent width swing across the set with the
WIDEST reading at the LARGEST viewport: nothing in the suite measures a wire label (`L-19`), so a
longer caption has to be re-measured at 1600x1000, not at the narrowest.
WHY NOT centred over the lanes at x 600, above the flow row. At y 310 it would sit 66 above the
query label on the same axis, in the same class and the same size, so it would read as a second
lane label instead of as a condition.
DO NOT put `branch` in the walk step rewind. It states the premise of the whole step, so it is
written once in `wires` and left standing while q and a wind back to blank.
```

### before `const RESOLV = { rcSearch: 'ns.svc / svc / cluster.local',`

```
The chip-unwritten queue, the same ruling as on network-dns-coredns and for the same reason: the two
resolv.conf lines are the file the whole card reasons about, true before the first query and after
the last, so every step states them and none turns one over. The values are the ones the scene was
built with, so the settled frame is byte-identical.
The resolvconf step keeps its highlight on both lines. It is the step that reads them out, and the
NOTE above already records that they are drawn as chips rather than as a box sublabel.
```

### poster

```
The staircase of guesses. A short name is not asked once: the resolver walks the search list, and
each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
name is left. The rows are a descending staircase, the dashed rail on the left is the walk down it,
and the dot trailing each row is the query that attempt costs. The staircase IS the cost, which is
the whole point of ndots, so the poster spends everything on that one shape and draws no topology.
```

## network-dns-records

### layout

```
WHAT     One name, several kinds of answer: A, SRV, Pod and headless records off the same resolver.
PANEL    right <= 397, bottom <= 330, one of the longest narrations in the category. Read the card
         as an L: only the record ladder, which starts at x=710, may sit beside the panel, and
         everything else hangs below y=330.
LANES    Each record row is reached by its OWN dashed wire, and the four share a trunk out of the
         CoreDNS right edge before diverging at the bus. The answer ball rides ANS[i], the same array
         that drew wire i, so it tracks a visible line the whole way.
WHY NOT  The ladder below the panel with the band up top. The vertical budget below the panel fits the
         flow row, one 64 unit band and the chip strip, but not a 240 unit ladder as well. The BAND is
         then the only block that can reach the right margin, which is what puts the content bbox on
         600: CENTRE measures blocks, the ladder is chips, and CoreDNS has to stay in the middle for
         the fan to work. Same reason the band cannot move back to the top.
CONTENT  The FQDN band is the LIVE QUERY NAME and it MUTATES per step, because the whole point is that
         a different record kind is a different name. SRV prefixes _port._proto; a Pod record swaps
         the service label for the dashed Pod address AND the subdomain from svc to pod; headless
         asks the exact same name as A, which is the lesson. The third segment is `subdomain` and
         never `kind`, for the reason the constant block gives. Segments light statically and never
         flash.
         Neither readout repeats the band. QUESTION is the exact qname plus type on the wire;
         ANSWERS is how many records come back, which is the whole difference between a normal and
         a headless Service (1 against one per ready Pod). The ladder carries that difference too,
         by spelling three addresses out on its headless row, but only as a shape: the chip is
         where it is a NUMBER, stated on every step and comparable across them.
```

### before `const record = (rowIdx, ans, was) =>`

```
P-03. The answer count WAITS for the answer, on the very beat the ladder row was already waiting on.
Each record step states its count in `chips`, `rewind` winds it back to the count the step before
left, and the single F.set inside `lookup` writes the row and the count together on the `ans`
arrival: 2438ms for the A row and 2300ms for the other three, the difference being that row 0 is the
longest climb off the bus. Measured in real time, 2200ms still reads the old count on all four
steps and 2700ms reads the new one.
`was` for srv-record is the same 1 record the a-record step left, so that step rewinds to the value
it already shows. It is stated anyway, because P-01 wants every step to say every value and a helper
that skipped one would make the silent step look like the odd one out.
QCHIP IS DELIBERATELY NOT ON A BEAT, and report/chip-beat.test.mjs reports the four steps as FORM-E
for it. The question is the step's PREMISE rather than something an arrival produces: `asking()`
states the same name in the FQDN band above at entry, so binding the chip alone would leave the chip
and the band contradicting each other for the 800ms before the query even leaves the client. Binding
the band too would blank the name while the narration is read, which is worse than the finding.
```

### before `const CONTENT_L = 80, CONTENT_R = 1120;`

```
Content and chip strip both span this band, which is what centres the bbox on 600. The FQDN band is
the only block that reaches CONTENT_R, so narrowing the band moves the measured centre even though
every other tier stays put.
```

### poster

```
One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
dots of the name itself, and it forks into three identical record chips. The ONLY difference the
poster draws is the answer count: the middle chip carries three dots (headless: one record per
Pod), the others carry one. No resolver box and no record ladder: the card already draws those, and
the poster only has to say what the card is ABOUT.
```

## network-dualstack

### layout

```
WHAT     Two parallel address families: the Pod gains a second IP, the Service a second ClusterIP, and
         the client picks a family at connect time.
PANEL    worst case x<=397, y<=230. The config band sits at y=136 and the client / Service / Pod row
         lower at ROW_Y 286.
NOTE     The band drops into BOTH the Service (its ClusterIP) and the Pod (its address) as a MIRRORED
         PAIR about the band centre (CONFIG_CX +/- TAP_DX), not one tap per target centre: two lanes
         leaving one face at mirrored offsets read as a deliberate pair, and each still lands 15
         units off its target midpoint, invisible on a 240 and a 300 wide face.
MOTION   Enabling the feature is a config change with no per-object traffic, so the band just lights:
         no flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack until a
         Service opts in, so that chip does not move on the enable step.
         The band is the SOURCE of the second ClusterIP, so it stays lit on the Service step too,
         matching the Pod step.
         On the connect step the client picks a family and the Service policy is unchanged: the card
         shows the client dialling the IPv6 ClusterIP and highlights that ADDRESS rather than
         overloading the ipFamilyPolicy chip with a client-side choice. The Service is on the path
         and rewrites there, so it lights and does not pulse. A riding label on each hop makes
         the chosen family visible and shows the DNAT, the destination rewritten from ClusterIP to
         Pod IPv6 on the way out.
CONTENT  The connect step names the SERVICE as the forwarder, not kube-proxy. kube-proxy is what does
         it upstream and it has no block here: the four blocks are config, svc, client and pod, and
         the step lights and forwards through `Service web`. A sentence naming an actor the card does
         not draw sends the reader hunting for a box that is not there.
OPEN     Both tags on `client-chooses` are cut for their whole 900ms readable life, on all four
         viewports: `dst fd00:96::a` by the Service web left face and the Client Pod right face, and
         `dst fd00::1:5` by the Pod web left face and the Service web right face. The row is one
         straight line of three blocks and each hop ends on a face, so the address lands on the block
         it is addressed to. NOTHING within 44 of this card's resting -16 changes the number by a
         single sample: the first offset that clears either tag is -78, 62 from the rest height, which
         would park the address a whole block above its own ball. Both stay.
```

### before `const CONFIG_X = 480, CONFIG_W = 600;`

```
The band spans the Service..Pod half only, which is what keeps it clear of the narration overlay at
y=136 and off the client Pod. Widening it leftward is what the overlay forbids, not the geometry.
```

### poster

```
One Pod in the middle drawn TALLER than its two neighbours, with two parallel horizontal lines
inside it: one interface carrying two addresses. That doubling is the whole sentence, and it is why
the middle box is 76 high against 52.
The two dashed legs out to the flanking boxes are single, not doubled: the point is that the pair
of families lives on ONE eth0, not that every path is drawn twice.
```


## network-ebpf-dataplane

### layout

```
WHAT     The eBPF dataplane replacing kube-proxy: a program at the socket hook reads a BPF service map
         and rewrites the connection at connect() time, so there is no per-packet iptables walk and no
         DNAT.
MOTION   Three of the five working steps land no ball and carry NO motion at all: `attach`, `maps` and
         `no-kube-proxy` register zero animations and hold a still picture for their whole duration.
         That is `M-27`, and it is deliberate. The beat on each is the static `.highlight` its `lit`
         already names: `attach` lights `hook`, the box that IS the attached program, `maps` lights
         `bpfmap`, the box the lookup lives in, plus `svcChip` carrying the result, and
         `no-kube-proxy` lights both `hook` and `bpfmap`, the one two-actor step here, because its
         sentence is that programs plus maps together are the whole dataplane. The thing it removes,
         kube-proxy, has no block on this card at all and exists only as `kpChip`.
         Step 0 is the static poster, and `connect-time` and `deliver` already carry balls.
DO NOT   Put `F.flash` back on those three. It animates `filter: brightness(1) -> 1.55 -> 1` on the
         block GROUP, which `M-04` calls a pulse and `M-01` forbids on infrastructure, and its peak
         of 1.55 is above the 1.4 of the Pod pulse `M-01` reserves the mechanism for. It is also
         unreviewable: 600ms against a step span of 600ms puts every freeze point inside the pulse,
         so a still frame cannot tell it from the static highlight it replaced.
NOTE     FAN_X is DERIVED (midway between the program right edge and the Pod left edge), so widening
         the card moves the fan turn with it rather than leaving it behind.
         The destination label sits UNDER the first fan segment, just as the rewritten connection
         leaves the program: the riding src tag rides ABOVE the ball at y312, and centring the fan turn
         put the riser under the old slot, so the dst label lives below where it never collides.
NOT A DEFECT
         `TO_PODY` carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the map
         lookup picked one of two, and the card says so in words. N destinations, N wires.
CONTENT  The deliver step carries a `src` tag on a ball whose wire label reads `to .2.7`, so the
         narration has to name BOTH: the destination it goes to and the source it still carries. A
         tag stating something no sentence states reads as the wrong address on the wrong ball.
OPEN     `src 10.244.1.5` on `deliver` is cut for 700ms of its 1400ms readable life, the same on all
         four viewports, by the Pod web left face and the app box left and top faces: the fan turns
         down into the Pod, so the tag arrives with the ball at a face. It clears at -61, which is 46
         from this card's resting -15 and well past the ceiling that keeps a tag reading as its own
         ball's address. Measured directly, not inferred: at -46 the cut is still 600ms, and only -61
         takes it to zero. Everything inside the ceiling buys 100ms of the 700, so the tag stays.
```

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
The client Pod sits on the left margin and the backend column on the right, so the content bbox
centres on 600 and the three chips are one even row across the span. Stopping the backend at 1030
leaves the whole card 50 units left of centre.
```

### poster

```
A Pod on the left, the kernel box in the middle with a small program attached ABOVE it (the two
verticals and the crossbar make a table, which is the map), and the two backend Pods on the right
at full and 0.45. The sentence is that the decision happens IN the kernel and the loser is still
drawn, dimmed, because a choice among one is not a choice.
Every leg is dashed and no ball rides one: the poster states where the decision is MADE, and the
one leg that carries real traffic, the rewritten connection landing on the chosen backend, is what
the deliver step animates.
```


## network-endpointslice-reconcile

### layout

```
WHAT     A control-plane pipeline, not a traffic flow: Pods are watched, the controller derives the
         Ready-only address list, and kube-proxy reads it.
LAYOUT   Read it bottom to top and then right: the Pods are the live source, the controller watches
         them and writes UP into the slice, and kube-proxy reads it from the RIGHT. The Service on
         top owns the selector and NAMES the slice, but stores no addresses.
MOTION   The endpoint rows are the DURABLE state and hold the addresses. What MOVES rides the ball:
         the controller write hop carries what that write commits, the whole `ready endpoints` set
         on the commit step and the one flipped endpoint on the readiness step, and the kube-proxy
         read hop carries a short read tag.
         Pod B going notReady is the whole of its step, so its shade is an `opacity` field every
         later step restates (`B_DROPPED`) rather than something the flow does. Left to the flow, a
         prev or a reset would draw Pod B at full brightness directly beneath its own sublabel
         reading notReady.
CONTENT  Every endpoint row carries IP AND PORT, on the notReady rows as much as the Ready ones,
         because a real EndpointSlice endpoint has both whatever its conditions say. The three rows
         therefore read `ip:port · state` throughout, and `dropped (notReady)` is not a state a row
         may take: it costs the port the row exists to carry (`P-07`) and says removed where the row
         is still present.
DO NOT   Pulse Pod B with a plain pulse while it sits at 0.40. That pulse ramps the STROKE from the
         resting tint, which on an already dim Pod is close to invisible. It takes `F.pulse` with
         `dim: true` and `from: OPACITY.notready`, which adds the opacity flash the dim variant
         exists for. Its signature in `getAnimations()` is an `opacity` track on the Pod group next
         to the `filter` one, and sampling it mid-flight puts the peak BETWEEN two samples, because
         a blink returns to where it started.
```

### before `F.set({ at: 'write', chips: { ep1: EP1_READY, ep2: EP2_READY, ep3: EP3_NOTREADY } }),`

```
P-03 on `reconcile`. The slice is EMPTY until the controller writes it. `chips` keeps the three rows
the write produces, which is what the static path shows, `rewind` puts all three back to (empty),
and this F.set fills them on the `write` arrival at 1500ms: the two Ready candidates pulse at 0, the
write leaves at BEAT.afterPulse 800 and the 138 unit climb takes the 700ms routeDur floor.
ALL THREE ROWS, not the two Ready ones. One reconcile writes the whole slice, notReady row included,
which is what the narration says (the third Pod is recorded too, just flagged), and binding two of
three would leave the third as the FORM-E shape P-04 calls worse than doing neither.
`ep3` moved out of `lit` and into the F.light beside `ep1` and `ep2` for the same reason: a
highlighted row reading (empty) for 1500ms marks a value that is not there yet. flowLights derives
the reduced path off that same list, so the static end state and the settled frame are unchanged,
which `tools/settled-dump.mjs` confirms byte for byte.
Measured in real time, 300 and 1200ms read (empty) three times with the ball still climbing under
its `ready endpoints` tag, 1750 and 2500ms read all three rows.
```

### before `const CTLR_TOP = 350;`

```
The controller writes UP into the slice at SLICE_BOTTOM, and WRITE_PATH is built from both, so the
lane re-solves when either tier moves. Service, slice rows and controller are all centred at x600,
well right of the panel.
```

### before `const UPD_TAG_DY = 14;`

```
BOTH WRITE TAGS RIDE 14 BELOW THEIR BALL, the mirror of the default and the same value
`network-externalname` takes on its connect lane. WRITE_PATH ends on SLICE_BOTTOM 290, which is the
ep3 row's own bottom edge, so at -14 a tag parked at 276, INSIDE that row and on its baseline: the
readiness tag printed `10.244.2.7 · notReady` across `10.244.3.9:8080 · notReady`, ink 51.8 x 7.0
units, baseline gap 3.00, for 300ms.
The reconcile tag has the same collision and NO probe frame shows it. Its rows are written by an
`F.set` on arrival, and a seeked frame never runs a deferred callback, so every sampled frame of that
step reads (empty) and the pair never forms in the dump. The geometry is the same either way: the row
value is anchored END at x 778 and `ready endpoints` spans 550..650 on the identical baseline, so both
tags move together.
+14 puts them at 304, in the 60 units of clear canvas between the slice floor and CTLR_TOP.
Riding BELOW the ball costs the START of the ride, though: the ball leaves ON the controller's top
edge, so a tag 14 under it fades in inside that box with the border through its glyphs, measured at
100ms per step. `emergeMode` closes that, the mechanic five other cards here already use, and 200ms
of the 700ms write is enough: at the 0.9 readable threshold the ball has climbed to 316 and the tag
ink sits 19 clear of the edge, and even at half alpha it is 15 clear. Measured after on all four
viewports: the card is back to exactly the finding it had before this change, `reads slice` on
`consume` and nothing else, with the readiness pair gone.
OPEN: on `readiness` the lane ends on ep3's edge while the row that lights is ep2, and the route
cannot be brought to ep2. The row is right (the endpoint that flips is 10.244.2.7) and the geometry
shuts every approach: ep2's bottom edge is 242 with ep3 occupying 248..290, so a lane from the
controller crosses a whole 42 unit row (A-19); the corridor left of the slice is x<410, inside the
reserved narration zone (x<=380 plus the swing the panel takes with viewport height); the corridor
right of it is the READ_PATH lane at y 222. A side entry also parks the tag inside the stack, where
the rows are 6 units apart against 9 units of tag ink, so it would take dx -70 to clear the stack and
the tag would no longer read as its ball's. The ball stops on the bottom edge of the SLICE, which is
also what `reconcile` writes to, and the flipped row is named by the tag and by the row that lights.
```

### poster

```
The scheme abstracted: live Pods on the left (the source, the notReady one dimmed) reconciled into
the EndpointSlice on the right (the derived list, one endpoint row per Pod, notReady dimmed).
Straight horizontal wires carry the one-row-per-Pod mapping.
```

## network-externalname

### layout

```
WHAT     Two ways a Service can point at something that is not a selected Pod, compared row by row.
         ROW_A is type ExternalName, a pure DNS alias answered as a CNAME, with no ClusterIP and no
         kube-proxy anywhere on the path. ROW_B is a ClusterIP Service with NO selector, where
         kube-proxy DNATs to a hand-attached EndpointSlice.
PANEL    right <= 397, bottom <= 230. Both rows hang BELOW it: ROW_A 300, ROW_B 480, Pod tops 246
         and 426.
OPEN     The top band is empty by construction on wide viewports. That is the price of two full-width
         rows on a card whose panel reaches a third of the way down.
```

### before `const ROW_A = 300;`

```
Both rows hang BELOW the measured panel bottom of 230: ROW_A 300 puts its Pod top at 246. At 254 a
quarter of the row-A client sits under the overlay on the narrow viewports.
```

### before `const CONNECT_TAG_DY = 14;`

```
The connect lane leaves a Pod floor and lands on a box floor, so both of its ends are a block face and
the default -14 puts the tag INSIDE a block at each end: over the `svc lookup` sublabel for 200ms (ink
60.0 x 8.7) and over `external host` for 400ms (78.0 x 5.8). Riding 14 BELOW the ball is the mirror of
the default and clears both, with 3.7 units under the Pod floor and 3.7 under the host box floor.
Measured clear from +12 to +32 on all four viewports.
```

### before `const DNAT_TAG_DY = -40;`

```
Row B is 60 tall and its two hops are 160 units against a 118 unit address, so on the lane the proxy and
EndpointSlice faces cut the tag for 800ms. -40 parks it 7 above the row, clear on all four viewports.
THE CEILING IS A DELTA FROM THE DEFAULT -14, not an absolute dy: about 30, so about -44 to +16. -40 is
26 from the default and is inside it, which is why four tags took that value on this card, on
`network-netfilter-path` and on `network-hostnetwork-hostport`.
OPEN, same step: `dst 10.96.0.7` needs -58 to clear the Client Pod right face (the Pod is 108 tall, so
the tag has to climb past its whole height), which is 44 from the default and past the ceiling, so the
two hops of one flow sit at two heights for the roughly 200ms both are on screen. `db.default.svc`
(-46, 32 from the default) and `CNAME -> db.example.com` (-70, 56 from it) are the same case on row A,
and the second is cut for 1000ms by the Client Pod right face and the `curl` box beside it.
OPEN, and viewport-only: on row A the tag `CNAME -> db.example.com` prints over the `curl` sublabel
inside the Client Pod at 2300ms, ink 3.42 x 7.8 units at 1280x860 and 2.21 x 7.8 at 1100x800, 300ms
each. At 1600x1000 and 900x650 the glyphs do not touch: the tag is a fixed pixel font over a scaled
canvas, so its WIDTH in viewBox units moves with the viewport and this pair opens and closes with it.
It is the same tag the -70 above cannot move.
```

### poster

```
Abstract, not the literal diagram: two lanes of three boxes on dashed legs, one above the other,
sharing a client column on the left and a target column on the right. The lanes are drawn
IDENTICAL on purpose, because the two ways of pointing a Service at something outside differ in
exactly one place, and a second difference would leave the reader hunting for which one is the
subject.
That one place is the bar inside the middle box, the Service in each lane: outlined and neutral on
the top lane, where all it hands back is a name, and a solid cyan fill on the bottom lane, where
the no-selector Service owns a real ClusterIP for kube-proxy to program. No rings, no drawn cluster
edge and no separate proxy box: the card draws the machinery, the poster only has to say where the
two paths part.
```

## network-externaltrafficpolicy

### layout

```
WHAT     externalTrafficPolicy Cluster against Local. Client above the LB, the LB fans to two Nodes,
         Node-1 has a local backend and Node-2 has none. In Cluster mode the packet landing on Node-2
         is SNAT-ed and forwarded across the underlay to the Pod on Node-1; in Local mode the Node-1
         path is straight.
NOTE     The backend is centred BOTH ways inside Node-1, on N1_CX and on the node rect centre, so the
         fan drops straight down the Pod axis onto the Node edge above it.
MOTION   ONE MECHANISM PER STEP: `local` and `healthcheck` must not both run `duration: 3100` with
         the IDENTICAL four flow entries (entry, TO_N1, tag, pulse), which a deterministic capture
         finds matching pixel for pixel, the only deltas being the two health wire labels and a
         moved chip highlight. The second step then animates nothing new, and the first already
         draws the LB targeting Node-1 alone, which is the outcome the health check exists to
         produce.
         `local` draws what Local costs: the served connection to Node-1 (entry 0..700, fan
         800..1500, pulse to 2400), then a SECOND connection out at 1600 that lands on the Node-2 edge
         at 3100 and goes no further. Nothing leaves Node-2, which is how this category draws a drop
         (`network-internal-traffic-policy` no-local-backend is the precedent: `the absent second hop
         is the whole point of the step`). Duration 3800 for a 3660 span, the ripple on the dead
         ball being the last thing to end.
         `healthcheck` draws the PROBE: the balancer sends one to each Node, `PROBE_GAP` 500 apart
         (700 and 1200), each answer written where its probe lands, and only THEN the steered client
         connection to Node-1 alone, pulse ending at 3700. Duration 3900. The two probes share
         the first 36 units of the fan, which a ball clears in 80ms, so 500 is a read gap and not a
         collision gap.
         The narration of `local` closes on the drop. `healthcheck` opens on `But Local would
         silently drop traffic that lands on Node-2`, which is a callback to something the reader
         has just watched instead of a claim with no picture.
DO NOT   Draw a ghost Pod in Node-2 to balance the count. It would contradict its own label.
WHY NOT  Putting the drop on `healthcheck` beside the probe, which is where its narration mentions it.
         That step would then carry three mechanisms and five balls, and `local` would show only
         the Node-1 path, pre-empting it. One new mechanism per step is what splits them.
NOT A DEFECT
         CENTRE-LOW is OPEN here. The two blocks below the overlay span 255..465, centre 360, and they
         are the backend Pod and its inner box; everything else in that band is Node frames, which the
         rule ignores. The Pod cannot move to the centre: it is inside Node-1 BECAUSE Node-1 is the
         Node with a local backend, and Node-2 having none is the entire subject.
         No lane on this card is unridden: `local` rides the Node-2 fan leg to its drop and
         `cluster` rides the underlay. An unridden lane would not be a defect here in any case: no
         lane here carries a key, and this card changes no opacity on any of its five steps, so it
         has no dimmed end for a lane to point at.
```

### before `const MID_X = 600;`

```
The two Nodes are mirrored about MID_X with NODE_GAP between them, so the scheme spans 180..1020 and
the chip strip takes that extent 1:1. The vertical margins above the client and below the chips are
equal, which is what centres it on the canvas.
```

### before `F.set({ at: 'hop', chips: { srcChip: 'lost (SNAT)', hopChip: 'yes' } }),`

```
P-03 on `cluster`. Both chips are OUTCOMES of the request, which the scene comment beside them
already says, so neither can read before the request finishes. `chips` keeps the end state, `rewind`
holds the idle none on both, and this F.set writes them on the `hop` arrival at 2871ms, the moment
the SNAT-ed cross-node leg lands on the Pod: entry leg 0..700, the LB to Node-2 fan 800..1500, then
the underlay 1600..2871.
2871 and not 1600. The tag `src Node-2 (SNAT)` starts riding at 1600, so the SNAT is visible as it
happens, but `client src IP` is what the POD sees and the extra hop is only spent once the packet
has crossed. Writing them as the leg departs would put the answer on screen while the ball that
proves it is still over the underlay.
Measured in real time, 300 to 2700ms read none / none and 3200ms onward reads lost (SNAT) / yes.
```

### before `const CROSS_OFF = { crossWire: OPACITY.notready };`

```
The Node-2 to Node-1 underlay is the lane THE POLICY DECIDES ON, so its shade is a step field and not
a constant. On `cluster` it carries the SNAT-ed ball and stays at 1. On `local` and `healthcheck` it
goes to OPACITY.notready: those two steps say a Node serves only its own local Pods and NEVER forwards
to another Node, and a full-strength arrow entering Node-1 sits directly under that sentence and
denies it.
A-13 reads min(source, sink) and both Node frames are at 1 on those steps, so this is deliberately a
lane dimmer than either of its ends. It is the shape `network-kube-proxy-modes` already uses
(`ipvsLane` and `iptLane` shaded with the Pod they serve) and `network-loadbalancer-bare-metal`
(`triple`), and the reading is the same: on those steps the lane is a capability the policy has
switched off, not a wire between two blocks that went away. A-14 does not apply, since neither end is
gone and the lane still leaves a hole. Nothing is half-dimmed either (P-04): every other lane on those
two steps carries a ball.
```

### before `F.set({ at: 'p1', wires: { n1: 'health: 1 local pod' }, chips: { hcChip: 'used' } }),`

```
P-03 on `healthcheck`, and the wire labels take the same beat as the chip because they are the same
fact: a healthCheckNodePort answer is produced BY a probe, so neither answer may be on screen before
its probe lands. `wires` and `chips` keep the end state, `rewind` blanks both labels and holds the
`unused` the Local step left, and the two F.set write each answer on its own arrival, 700 for Node-1
and 1200 for Node-2.
The other three chips take no beat here and are not a FORM-E shape: `Local`, `preserved` and `no` are
all exactly what the previous step settled on, so no arrival on this step produces any of them.
`local` uses the same technique on its own two labels, at 1500 for the served Node and 3100 for the
Node whose connection died, so neither verdict pre-announces its ball.
```

### poster

```
Mirrors the diagram: client above an LB that fans down to two Nodes, only Node-1 holding a backend,
plus the underlay lane that carries the Cluster-mode second hop from Node-2 back to Node-1. That
lane is the whole point of the card, so the poster shows it.
Geometry: client and LB centred on x=160, the two Nodes mirrored about it, the Pod centred BOTH
ways inside Node-1 (cx 81, cy 124), the fan leaving the LB bottom edge and landing on each Node
top, and the underlay running Node edge to Node edge without ever crossing one.
```

## network-gateway-api

### layout

```
WHAT     OWNERSHIP: GatewayClass, Gateway and HTTPRoute are three objects belonging to three roles, and
         the request only becomes a path once all three exist.
PANEL    bottom <= 330. The Gateway sits on FLOW_Y 380, the row a real request enters on, so the
         Client clears the panel beside it with its top edge at 344, and the GatewayClass, the only
         block above that line, lives at x >= 410.
WHY NOT  Continuing the column downward with the Service and the backend Pod: a fifth stacked block
         plus a bottom chip strip does not fit in 640 units. Hanging them off the HTTPRoute row to
         the RIGHT also frees the right column for the ownership captions.
LANES    Gateway -> HTTPRoute is DECLARED the other way (the route names the Gateway in parentRefs,
         which is why that field is the route sublabel), but the only ball that ever runs that wire
         is a request being matched against the rules, so its head points down with the ball.
NOTE     One role caption per stack block, each on its own block row. The top two go in the right
         column, which is free at those rows. The HTTPRoute row is NOT free there (the backendRef wire
         and the Service occupy it), and a caption parked above the Service reads as labelling the
         Service, so that one goes to the LEFT of the route, where it also fills the quadrant the panel
         leaves empty. Sitting on ROUTE_CY 502 keeps it clear of the measured panel bottom of 330.
         SO THE THREE DO NOT FORM A COLUMN, and the number is why. `ROLE_X` is 700, and on the
         HTTPRoute row 700 is inside the backendRef lane, which runs STACK_RIGHT 670 to SVC_X 730:
         the caption would start on the wire and run into the Service box 30 units later, against
         its own width of about 195. It is mirrored instead, right-anchored at STACK_X - 24 = 386,
         which keeps it on its own block row and reading as one of a set with the other two.
         Each chip is one real API field, which is why hostnames and match are SEPARATE: in an
         HTTPRoute the hostname lives in the top-level `hostnames` list while the path lives in
         `rules[].matches[].path`, whose default type is PathPrefix. Folding them into one match chip
         would state the spec wrongly. The request chip reads none until a request arrives.
MOTION   NOTHING flashes here, not even the packet-less gatewayclass step: a declarative object being
         installed has no motion to show.
CONTENT  The request step names the GATEWAY as what matches the route, not the controller: the poster
         note above already says the card draws no controller at all, and the blocks are client,
         gwClass, gw, route, svc and podW. It also does not say the implementation skips the
         ClusterIP, for the reason recorded on `network-ingress-routing`: the ball enters the Service
         block on one edge and leaves on the other, which is a rewrite inside it (`NET.A-01`).
```

### before `const FLOW_Y = 380;`

```
The Gateway sits on this row because it is the row a real request enters on, which is what lets the
Client sit beside it with its top edge at 344, clear of the measured panel bottom of 330. Raising it
puts the Client under the overlay.
```

### before `const SPEC = { listenerChip: ':443 HTTPS',`

```
The chip-unwritten queue, ruled CONSTANTS OF THE DIAGRAM rather than repaired. Each of the four is
one real API field of an object the card draws from its first frame, and the MOTION note above is the
reason there is no moment to bind them to: a declarative object being installed has no motion to
show, so no arrival on this card produces a listener or a backendRef. The listener is also the
Gateway sublabel, so blanking that chip would leave it reading none beside a box spelling the same
field, which is the argument E_CARRIED already carries for network-dns-records qChip.
What changed is that every step now STATES all four, which is what puts them inside P-01 instead of
beside it. The values are the ones the scene was built with, so the settled frame is byte-identical.
The highlight on gateway and httproute stays: it points at the object that OWNS the field, and
whether such a cue is deserved is R2's question, not this one.
```

### poster

```
Three stacked bars joined by two SOLID verticals, with a filled dot at the middle bar. The three
are GatewayClass, Gateway and HTTPRoute, and the two solid legs are what makes them one chain
rather than three objects: the dot marks the Gateway, the only one of the three that is a running
thing.
The client hangs off the left, entering at the Gateway bar (the listener is where a request meets
the chain), and the backend pair off the right, both on dashed legs, because neither is one of the
three objects. The pair's fills step 0.05 to 0.09 along the way out, so the Pod at the far end
reads as the destination and the Service as the hop before it. The card draws no controller at all.
```


## network-headless-service

### layout

```
WHAT     clusterIP None: no VIP hop, DNS hands back the backing Pod IPs and the client connects to a
         Pod itself. The three backends are a StatefulSet (web-0..web-2) so the stable per-Pod name
         lands.
PANEL    right <= 397, bottom <= 205. Everything left of 397 sits well below that: the client at
         y>=420, the DNS lane turning at 310/330.
LANES    The data trunk is drawn to ALL THREE Pods, because a headless client may pick any of them.
WHY NOT  The data trunk leaving at y=520 direct. It has to pass BELOW the Service box (430..500) while
         still leaving the Pod at its face midpoint; direct puts a lone endpoint 35 units off that
         midpoint, which is what OFFEDGE reports. Hence the step down at DATA_STEP_X.
NOTE     The Service to CoreDNS link is the static fact that this Service backs those records, drawn
         as a bare path because `arrow()` always attaches a marker: an arrowhead here reads as
         traffic.
         The ENDPOINT fan carries no arrowhead and no packet in either direction: CoreDNS never calls
         a Pod, and the read that populates the answer comes from the EndpointSlice, which this card
         does not draw. Dropping the head also settles a direction it had wrong, CoreDNS -> Pod while
         the narration says CoreDNS READS the endpoints. The DATA fan beside it keeps its heads and
         its balls: two fans that looked alike and meant different things was the defect.
         Each chip sits directly UNDER the column it reports on and shares that column's exact x and
         width, so the footer spans the diagram end to end and every chip edge lines up with the
         blocks above it.
DO NOT   Put a value under a chip name that does not describe it. `connect 10.244.3.4 direct` under a
         chip labelled `DNS answer` is not a DNS answer.
NOT A DEFECT
         `TO_W2` in the data fan rides nothing. N destinations get N wires so the reader can see the
         client picked one of three.
```

### before `const CY = 320;`

```
Everything is symmetric about this line: web-1 sits ON it, web-0 and web-2 mirror about it, and
CoreDNS is centred on it so its fan to the three Pods is symmetric. Move CY and the fan stops being
a mirror.
```

### poster

```
Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
that rewrites the destination (there is none to rewrite: clusterIP None, so kube-proxy programs
nothing) but the DNS reply itself, a sheet of three A records. One leg leaves the sheet onto a
shared vertical bus, which then branches once per Pod, so the record count and the Pod count are
visibly the same number, which IS headless.
```

## network-hostnetwork-hostport

### layout

```
WHAT     The two sanctioned ways out of a Pod having its own namespace, IP and veth. One Node seen
         from the LAN side.
LAYOUT   A strict three-column grid, so nothing sits at a random x, and each block sits under or
         beside the block it belongs to: the portmap rule above the Pod it maps to, the cni0 bridge
         under the NIC that routes into it, and the hostNetwork Pod alone in a column because it
         hangs off nothing. The client is the only block above the Node frame and is dead centred on
         the NIC, so the entry hop is one clean vertical.
LANES    The NIC is the hub and exits three ways, one per direction: LEFT into the portmap rule,
         RIGHT into the hostNetwork Pod, DOWN into the bridge. The down leg lands on BR_IN_ORD rather
         than dead on COL2_CX, because the portmap route comes down onto the same bridge face: the
         two land as a mirrored pair either side of the bridge midpoint, which is what a face shared
         by two lanes should look like.
NOTE     Four chips span the Node 1:1 with even 20px gaps. They are the four things these two fields
         actually change, and each is a property of the SETUP rather than of a request, so they carry
         the ordinary-Pod truth from the start and the steps flip them.
DO NOT   Lengthen the Node frame label much further. It sits at the Node top-left (x+12, y+18), above
         and left of the portmap box at x=110, and runs under it if extended. The Node address stays
         on the eth0 block, which is where it belongs anyway.
CONTENT  Only hostPort is a scheduling resource upstream, so the hostNetwork cost step says a second
         Pod wanting that port cannot RUN here rather than that it cannot be scheduled: a
         hostNetwork Pod that declares no container port is scheduled and then fails to bind, and
         the scheduler sentence belongs to the tradeoff step, where hostPort is what it is about.
MOTION   The two reflective steps carry no motion at all: they compare, they do not move traffic.
         On the hostPort step the rewrite happens INSIDE the portmap box, so the ball re-emerges at
         its bottom edge already carrying the Pod address and only then joins the ordinary path,
         bridge then veth.
NOT A DEFECT
         The `hostport` tag `dst 10.244.1.5:80` is reported grazing the `Portmap rule` and `Node eth0`
         bottom edges for 400ms (four samples, t 1900 to 2200) on all four viewports. That is the EM
         band and not the glyphs: the em box overlaps the edge by 0.7 to 1.5 units depending on
         viewport, while the ink box sits at y 395..404 against an edge at 394.3, so the ink is
         entirely below the line and the probe reports ZERO ink cuts on all four. Confirmed by eye on
         a 250 percent crop of the 1600x1000 frame at t=2200: there is dark ground between the border
         stroke and the tallest glyph. Moving the tag to close a graze the reader cannot see would
         spend the only clear band this hop has.
```

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;`

```
The Node frame is the outer extent and the three column centres are spaced inside it. NODE_Y 305 is
what puts the frame just under the panel, and the client above it sits at x >= 450 only because of
that. Raising the frame puts its top-left corner and the portmap box under the overlay.
```

### before `const AGENT_TAG_DY = -40;`

```
The hostNetwork hop starts on the NIC right face, so the default -14 leaves the tag tail inside Node eth0
and its border strikes the first character for 100ms. -40 parks the tag in the band between the Node
frame top (305) and the NIC row (330), level with the frame caption: 6.7 under the frame, 5.4 over the
row, clear on all four viewports. The dx alternative was measured and rejected: the overlap is 4.4 units
at 1600x1000 but 8.4 at 900x650, so the clear dx set starts at +10 there and a horizontal offset large
enough to be safe stops reading as the ball's own address.
```

### poster

```
One Node seen from the LAN, in the same composition language as its siblings: a client bar on top,
the Node frame under it, the NIC as the hub inside, and the blocks hanging off the NIC in a three
column grid. Left column is the hostPort path and it is the FULL ordinary wiring: the portmap rule
that maps the Node port onto the Pod, plus the cni0 bridge and the veth that actually deliver into
it, so the Pod there is a shell with its own container box, its own namespace, its own IP. Right
column is the hostNetwork Pod, wired to the NIC by ONE straight line and nothing else: no rule, no
bridge, no veth, because it has no namespace to be wired into. That missing wiring, next to the
wiring drawn in full, is the whole card.
Geometry: columns at cx 60 / 160 / 262, the NIC the only block the client lands on, every dash
starting and ending on a shape edge.
```

## network-ingress-routing

### layout

```
WHAT     External LB -> controller Pod -> matched Service -> backend Pod. The card runs BOTH rules:
         / is proxied to Service web, then a second /api request is proxied to Service api, so each
         branch carries real traffic.
LAYOUT   The rules panel is centred ON THE CONTROLLER (RULE_CX == CTRL_CX), since the rules are what
         that Pod watches, and the ownership wire rises straight up from the controller top centre
         into the panel centre, no arrowhead, so the two read as one column.
WHY NOT  CTRL_CX at 485. The panel really covers x 0..399, y 0..190, so a centred panel must start
         past 399: at CTRL_CX 485 the widest overlay-clearing centred panel is 150 and the rule chips
         need 234. CTRL_CX 545 admits a 260-wide panel (415..675) with 16 to spare. Centring the
         panel on the controller is what FORCES the controller rightward.
NOTE     The Ingress controller is the same Pod shell as the web and api backends, rather than an
         oversized box.
         Three chips span the scheme 1:1, widths tuned to their content (TLS carries the longest
         value). Host and path are properties of the REQUEST being served, so they read none until
         one arrives.
DO NOT   Put the branch wire labels in the FAN_X..SVC_X gap. It is 40 wide and the text prints
         straight through the Service border. They sit clear of the Service box they name, above the
         web one and below the api one, mirrored.
CONTENT  The match step does NOT say the controller skips the ClusterIP. Most controllers do, but the
         ball here enters the Service block on one edge and leaves on the other, which `NET.A-01`
         defines as a rewrite happening INSIDE that box, so a sentence denying the hop would deny the
         motion under it. The endpoint half of the fact survives as `resolves it through the
         EndpointSlice to a Ready Pod IP`. Same sentence, same reason, on `network-gateway-api`.
MOTION   On the entry step the Host and path are on the wire, so both chips light with the TLS one:
         the request has arrived and terminated, but the controller only READS the rules in the
         next step, so neither branch is lit and both stay neutral.
         The controller is the SENDER on a proxy step, so it pulses as it matches the rule and only
         then does the proxied request leave.
```

### before `const FLOW_Y = 343;`

```
Derived as (RULE_BOTTOM + CHIP_Y) / 2, so the whole flow re-centres when the rules panel or the chip
strip moves. The web and api branches are FLOW_Y -/+ ROW_DY, so both fans, both Services and both
backend Pods follow it.
```

### before `const SPEC = { ruleA: '-> Service web:80',`

```
The chip-unwritten queue, ruled CONSTANTS OF THE DIAGRAM. ruleA and ruleB are the Ingress spec drawn
as a document under its own object caption and present in the first frame, and the TLS chip is a
standing property of this topology, which is why the NOTE above pairs Host and path against it: those
two are properties of the REQUEST and read none until one arrives, the TLS one never does.
Every step states all three at the value the panel is drawn with, so they are inside P-01 and no step
moves the settled frame. The rules step lights ruleA and ruleB as the object the controller
is reading, not as a change, and the entry and api-request steps light TLS as the thing that happened
to the request they just received.
```

### poster

```
A routing junction, not another box-and-line row: one request enters a square decision node, which
splits it into two CURVED paths sweeping out to a pair of rounded backend pills. The Ingress rule
table (two bars, the shorter one the more specific rule) docks above the junction and feeds it.
Curves and pills keep this poster from reading like the rectangle rows of its siblings.
Geometry: the junction on the flow line y=100, the two pills mirroring it at -/+34 (66 and 134),
every path starting and ending exactly on a shape edge: the entry dash meets the square left edge
(96), both curves leave its right edge (128), and the rule table drops onto its top edge (84).
```

## network-internal-traffic-policy

### layout

```
WHAT     internalTrafficPolicy Cluster against Local, the east-west twin of the External Traffic card:
         same two values, same Service, but the traffic starts INSIDE the cluster. The sender is a
         client Pod on Node-1, and the question is which endpoints the kube-proxy on THAT Node may
         program. The third step is what separates it from externalTrafficPolicy: Local has no
         fallback and no health check, so with no local backend kube-proxy DROPS the packets.
LAYOUT   Node-1 is wide because it holds the whole local path (client, dataplane, local backend);
         Node-2 only holds the remote backend.
LANES    The cross-node leg starts on the Node-1 BOTTOM edge, because the packet has left the Node by
         then, and ends on the Node-2 bottom edge.
         The ownership marker from the Service is `P.relation`, the headless part kind, because every
         lane kind carries an arrowhead. It STOPS on the Node top edge rather than reaching into
         kube-proxy: the Service is an API object living outside any Node, and what it programs
         inside one is the Node's business. N1_CX and KP_CX happen to be the same 390, so it still
         reads as landing on the dataplane.
NOTE     Four chips span the scheme 1:1 with even 20px gaps. The policy is a property of the Service,
         so it is true from the start; the scope, the hop and the result are outcomes of a call, so
         they read none until traffic flows.
         `SCENE.reset` lists the inner app boxes by key, and every step states the opacity of all
         seven dimmable keys (`ALL_UP`), so a dim set by one policy cannot leak into the next.
MOTION   The client Pod is the SENDER, so it pulses before the packet leaves carrying the ClusterIP,
         and the DNAT happens INSIDE kube-proxy. Under Cluster the ball re-emerges BELOW that box on
         the Node edge carrying the remote Pod address. Under Local the DNAT resolves to the local
         Pod, so the ball leaves the FAR edge of kube-proxy and never leaves the Node.
```

### before `F.set({ at: 'toKp', chips: { scopeChip: 'all ready (2)' } }),`

```
P-03 on all three working steps. The NOTE above already draws the line this repair follows: the
policy is a property of the Service and true from the start, while the scope, the hop and the result
are outcomes of a call. Those three now wait, and the policy does not.
Two beats per step, because the scope is read where kube-proxy is and the result is only known where
the packet stops. `cluster` writes the scope on `toKp` at 1500 and the hop plus the result on `out`
at 3067. `local` writes the scope at the same 1500 and the pair on `give` at 2300. `no-local-backend`
writes the empty scope AND the drop together on `toKp` at 1500, since the drop IS kube-proxy finding
nothing to DNAT to and no later ball exists to hang it on.
`rewind` is measured off the step before in every case, never guessed: `cluster` from the idle none,
`local` from what `cluster` settled on (all ready (2) / yes / served by Node-2), `no-local-backend`
from what `local` settled on. So the strip visibly carries the previous answer while the same call is
made again, and flips only where this call resolves.
POLICYCHIP IS DELIBERATELY NOT ON A BEAT, and report/chip-beat.test.mjs reports `local` as FORM-E for
it, carried in `test/fixtures/chip-beat.mjs` with that reason. internalTrafficPolicy is a field the
operator set before anything was dialed. The rest of the entry frame is written from the same
premise, the two endpoint notes already reading in scope and out of scope and the remote Pod already
dim, so binding the chip alone would leave it saying Cluster over a picture that is already Local.
The wire notes and the dim stay at entry for that same reason and are NOT part of this repair.
Measured in real time on `cluster`: 300 and 1400ms read none / none / none, 1800 and 3000ms read
all ready (2) with the hop and the result still none, 3400ms reads all three.
```

### before `const IN_NODE_TAG_DY = POD_Y - FLOW_Y - 4;`

```
The two hops inside Node-1 are 40 and 50 units long against an address 102 to 120 wide, so at the
default -14 the Client Pod, kube-proxy and Pod web faces all print through the glyphs. A dy of -78
(`NODE_Y + 18 - FLOW_Y - 3`) puts the tag ink at 319..328 against the NODE-1 caption baseline at
330: level with the frame heading, 77 units above its own ball, reading as a second caption of the
frame rather than as the address the packet carries. The constant is -56.
MEASURED with the ink box over 1600x1000, 1280x860, 1100x800 and 900x650, the clear band is
IDENTICAL on all four and it is dy -82 to -56 with nothing below it. The window is shut from both
sides: above -84 the em box crosses the Node frame top at 312, below -54 it crosses the Pod tops at
353. -56 is the LOWEST clear value, 22 units closer to the ball than -78, ink 341..350 with 3 to the
Pod tops and 20 below the caption, and it clears on the three tags that use it on all four viewports.
WHY NOT  -44, which would sit inside the usual 30 unit ceiling off the default. The em box then runs
to 361 and the probe reports it cut by the Client Pod and Pod web top faces on all four viewports.
The window itself is 26 units wide, so 42 off the default is the whole of what exists here.
```

### before `const FLOW_Y = 405;`

```
The Node row carries the whole flow on this line and the underlay lane hangs below it. The Service
above is the only block in the panel band, so it sits at x >= 450: raising FLOW_Y pulls the Node row
into that band and the client and kube-proxy go with it.
```

### poster

```
A diptych: the same little scene twice, and the ONLY thing the policy changes is the Node border.
Left is Cluster, so the border is a faint dashed hint: the call reaches the backend inside the Node,
and it also climbs out over that border to the one outside. Right is Local, so the same border is
drawn solid, as a wall: the leg that would leave the Node is cut short and crossed out at the wall,
and the outside backend with its would-be path fade to a ghost, leaving only the short leg that
stays home. Same caller, same two backends, one boundary that either lets traffic through or does
not.
Geometry: two 128-wide Node frames mirrored about the centre divider (16..144 and 176..304), caller
and local backend on one row inside each, the remote backend directly above the local one and
outside the frame, every leg starting and ending on a shape edge.
```

## network-ipam-pod-cidr

### layout

```
WHAT     The kube-controller-manager carving the cluster CIDR into a per-Node podCIDR slice, and the
         CNI IPAM handing addresses out of that slice.
PANEL    right <= 397, bottom <= 255. The controller column (cluster CIDR -> kcm) clears it at
         x460..740, and the three Nodes fill the y312..602 band.
LANES    Every allocation arrow is DIM dashed with no colour override so the bright ball reads on a
         muted wire, and they sit ABOVE the blocks so the node rects cannot hide them. The Node-2
         IPAM hand-out is revealed only on the final step, so its arrow starts hidden.
MOTION   On the final step Node-1's Pod keeps its settled IP with no highlight and the action is on
         Node-2: a second Pod with a non-overlapping IP out of its own slice is what proves uniqueness.
NOT A DEFECT
         CENTRE-LOW is OPEN here. The four blocks below the overlay span 130..700, centre 415. The rule
         cannot see Node frames, so what it measures is the two Pods, and those sit in Node-1 and
         Node-2 because the narration names those two Nodes. Moving either Pod to Node-3, reordering
         the Nodes, or inventing a third Pod would each make the card say something different. The
         composition itself is centred: three equal frames spanning 80..1120 under a control-plane
         column on their common centre line.
         The IPAM ball leaves the BOTTOM EDGE of the slice chip, and the narration reads `its address
         is drawn by the CNI IPAM strictly out of that Node slice`, so the drawn source and the
         grammatical one agree. The card has no CNI and no IPAM block anywhere, so the slice is the
         only candidate on the canvas.
```

### before `const NODE_Y = 312, NODE_W = 300, NODE_H = 290;`

```
Every x on this card is derived from NODE_X / NODE_CX, so the Node columns, their slice chips, their
Pods and the allocation bus cannot drift apart. NODE_Y 312 is what clears the panel bottom of 255.
```

### before `const dur = 1100;`

```
ONE shared travel time for all three allocation packets, and the card is registered for it in the
`PACING` map of `render/motion.test.mjs`. The kcm carves every slice in one reconcile pass, so they
must LAND together: routeDur is length-based and would land the short centre path first.
```

### poster

```
One block on top and three below it, joined by a dashed bracket that spans all three: a range being
SPLIT rather than a controller talking to nodes. The bracket is the whole idea, and it is drawn as
three segments of one line so no Node looks singled out.
The top block is the only one filled at 0.06 against 0.04: it is the pool everything else is carved
from. No arrowhead anywhere, because an allocation is a relationship and not a packet.
```


## network-kube-proxy-modes

### layout

```
WHAT     The same connection to a ClusterIP resolved two ways. The TOP route is iptables, a chain
         (KUBE-SERVICES -> KUBE-SVC -> KUBE-SEP) the packet WALKS box by box, stopping at each, O(n).
         The BOTTOM route is IPVS, one in-kernel hash hop, O(1).
LAYOUT   Mirror-symmetric about the flow axis: the chain row and the equally wide hash box sit at equal
         distance above and below, each delivering to its own backend Pod through a centred turn, the
         chain DOWN to the upper Pod and IPVS UP to the lower Pod, so neither arrow curves back.
PANEL    bottom <= 280, so AXIS is 352 and the Client Pod shell (AXIS +/- 64) clears it.
NOTE     The chain row does NOT centre on 600: its boxes sit ABOVE the panel bottom, so the row has to
         start right of the panel edge and ENGINE_L is pinned at 420. That asymmetry is paid for by the
         client on the left and the backend column on the right, which is what puts the CONTENT bbox
         on 600.
MOTION   The inactive lane dims on each mode step.
CONTENT  Two things this card may NOT say. It must not claim the two modes select the same way: the
         iptables step says `statistic random` and the IPVS step says round-robin and
         least-connection, so the scale step names the LOOKUP as what scale exposes and stops there.
         And nothing here draws conntrack, not as a block, a chip or a narration, so the `desc` in
         `cards.js` closes on the shared outcome (`Either mode turns the ClusterIP into one chosen
         backend`) instead of on a mechanism the reader cannot find on the card.
```

### before `const SCHEME_L = 40, SCHEME_R = 1160;  // content edges, mirrored about the canvas centre 600`

```
The content edges are mirrored about the canvas centre 600, and the three 350-wide chips with even
gaps centre the strip on it by construction, so nothing is stretched to make the composition centre.
The chain row is the one tier that does NOT centre here, because it has to start right of the panel
edge.
```

### poster

```
Two dataplanes, one above the other, and one destination. The top is a CHAIN, three linked boxes
read left to right; the bottom is a TABLE, one bar divided by four ticks. That contrast is the
sentence: a walk versus a lookup.
Both dashed legs converge on the same backend box, which is what says the two modes differ in HOW,
not in where the packet lands. Neither path is brightened: the poster states the choice, it does
not take a side.
```


## network-loadbalancer-bare-metal

### layout

```
WHAT     Not how a packet is balanced inside the cluster, but how the external address becomes
         REACHABLE at all when no cloud provisions anything. The upstream router is on top and the
         three Nodes below are candidates for the address: in L2 mode exactly one answers ARP for it,
         in BGP mode all three advertise it and the router hashes flows across them.
LAYOUT   Vertically: client, router, fan bus, Node row, chip strip. The Node row starts at 310, and
         the client and router, the only blocks above 300, sit at x >= 450.
NOTE     Four chips with even 20px gaps. The pool is declared by the operator but means nothing until
         an implementation exists, and the mode and the path are outcomes of announcing, so all three
         read none at the start.
         `SCENE.reset` lists the inner app boxes by key, and every step states the opacity of all
         nine Node / Pod / fan keys (`ALL_UP`), so the dim the failover step puts on Node-1 cannot
         leak into a later step.
MOTION   An address is allocated by a WRITE, not by a packet: the alloc step moves nothing and flashes
         nothing, its two chips simply light. Same reading as a declarative object being installed.
         The BGP step runs three separate client flows, staggered so they read as three, each hashed
         by the router onto a different Node whose Pod pulses on arrival.
DO NOT   Add riding tags to those three flows. All three carry the same destination, and three copies
         of it sweeping over the router at once is noise rather than information.
CONTENT  The pool narration carries the premise the card cannot do without: no cloud-controller-manager,
         so nothing answers a Service of type LoadBalancer and it sits pending. Step-0 narrations are
         deleted catalog-wide, and here that orphaned a pronoun, leaving `That gap is filled
         in-cluster instead` as the first sentence with no gap named anywhere. Kept under 471
         characters, the length of this card's bgp narration, so the measured panel worst case stays
         where it was.
```

### before `const MID_X = 600;`

```
The three Nodes are mirrored about MID_X and every tier above them is centred on it, so the scheme
spans 50..1150 by construction. The chip strip takes that same extent 1:1.
```

### poster

```
Mirrors the diagram: clients above an upstream router, which fans down to three Nodes that each
hold a backend Pod. All three Pods carry the same tint and no ball rides the fan: the poster states
the composition, and which Node actually owns the address is what the steps answer.
Geometry: client and router centred on x=160, the three Nodes mirrored about it, each Pod centred
inside its Node, every fan leg leaving the router bottom edge and landing on a Node top edge
without ever crossing one.
```

## network-model

### layout

```
WHAT     The flat Pod network as one wide band: a single L3 address space, four Pods on different
         Nodes hanging off it, packets riding up, along a rail INSIDE the band, and down. One flat
         space, no NAT.
NOTE     The CNI badge is tucked under the RIGHT END of the band, its right edge on SCHEME_R 1080,
         and its connector is a straight drop from the badge bottom-centre onto the bus spine INSIDE
         the band, which is the line it was always aiming at rather than a dogleg into the face.
WHY NOT  The badge parked outside the band: the content bbox can then never centre, because the
         badge always adds CNI_W/4 to the centre no matter how the band is sized.
LANES    A flat dashed bus INSIDE the band: a horizontal spine with a short tooth turning down toward
         each Pod, so it abuts every Pod drop-wire at the band edge. No arrowheads on the bus; the
         bidirectional arrows live on the Pod wires. This is the one place a line sits BELOW blocks
         rather than above.
MOTION   A src-IP tag rides WITH the packet across the band and arrives UNCHANGED, which is the
         no-NAT point made visible.
NOTE     The src tag belongs to the Pod-to-Pod steps only. The agent path is not a Pod source, so the
         chip is cleared rather than left holding a stale 10.244.1.5, and it stays highlighted
         because the value CHANGES there.
CONTENT  The closing CNI step returns `reachability` to `any to any`. That step says the plugin
         upholds ALL of these rules and the `aria-label` says any Pod reaches any other Pod, so the
         chip may not be left holding `agent to local Pod`, which belongs to rule three alone and is
         the narrowest of the three. The step also brings every Pod back to full opacity, so the
         picture is already back on the whole model when the chip reads it.
NOT A DEFECT
         CNI_CONNECTOR IS animated, with the repeating `MARCH` dash offset rather than a ball: this
         card's vocabulary for "this is what implements the model". No packet rides it because
         nothing DISCRETE travels, the plugin is not sending a message, it is the thing that makes
         the flat space exist.
```

### before `const RAISE = 64;`

```
Band, Pods and chips all move with RAISE, while the kubelet keeps its own higher KUBELET_RAISE, so
the gap between it and the band is deliberate rather than left over. Pod centres are spread with
equal end-margins inside SCHEME_L..SCHEME_R.
```

### before `const ridingLabel = makeRidingLabel({ role: 'network', dy: -46, inMs: 160, outMs: 200, hold: 260 });`

```
THE TAG RIDES 46 ABOVE ITS BALL, which is the only band that works on this card. The ball crosses the
flat-network band ON THE RAIL at BUS_Y 280, and the band's own label sits at 265: at the default -15
the tag baseline WAS 265, so `src 10.244.1.5` printed across `Flat Pod Network` with a baseline gap of
0.00 for 300ms, ink 74.2 x 9.0 units, which was the worst text pair in the catalogue.
The window is four units wide. The tag ink is 9.0 tall with an ascent of 8, the band is 238..318 and
the Pod tops are at 376, so a dy has to clear the band TOP on the crossing (dy <= -45) and the band
FLOOR at rest (dy >= -48). -46 takes the middle: ink 226..235 on the crossing, 3 under the band top,
and 322..331 at rest, 4 under the band floor. Measured on all four viewports, the label pair is gone
and no new pair opens.
WHY NOT  `emerge`, the fix `storage-topology-aware-provisioning` uses. It hides the tag until after
the ball has left the block it emerged from, and this collision is MID-FLIGHT: the label spans x
563..637 on a route that starts at 258, so the tag would have to stay invisible for the first 1000ms
of a 1440ms ride. `same-node` never reaches the label at all (it turns down at BX 486), so the two
steps the card deliberately draws with one mechanism would end up with two different tag treatments.
WHY NOT  -30, which keeps the tag INSIDE the band, above the label, with 6 units of ink clearance.
Opened as a frame: it reads as a second line of the band heading, sits 4 under the band's top border
and puts three rows of ink inside an 80 unit band.
OPEN: the tag now crosses the band FLOOR twice a step instead of once, 200ms against 100ms at -15,
and on the descent it still sweeps the band sublabel, 24.5 x 3.6 units of ink for 100ms. Both are
structural: a tag that clears the label on the rail has to be outside the band, and any dy at all
crosses the sublabel row somewhere on a 96 unit descent.
```

### poster

```
One wide bar across the top and three identical Pods hanging off it on dashed legs, with a dashed
line running the full width INSIDE the bar. The bar is the flat address space and the inner line is
what makes it read as one continuous range rather than as a header.
The three Pods are byte-identical, deliberately: the promise is that no Pod is special, so drawing
any of them brighter would contradict the card.
```


## network-namespaces

### layout

```
WHAT     One network namespace as a shared stack: app, sidecar, eth0 and lo are all PEERS on one
         stack, not wired one-to-one, and the veth is the only link to the host.
LAYOUT   The host block is vertically centred on the Pod netns block, so the veth reads as a straight
         cross-namespace link landing dead on eth0. Inside the shell every block plugs into ONE
         shared stack, drawn as a dashed rail across the stack band: eth0 (the in-Pod end of the
         veth) and lo hang off the rail from below, the two tenant containers tap it from above. The
         band, rail and taps live in podGroup, so they pulse as one unit with the Pod.
LANES    Every dashed line, the veth plus the rail and its four taps, is drawn ONCE in the same
         constant dim-dashed style. The rail and its four taps never change opacity on any step, and
         the veth is the ONE exception, on the ONE step where it does not exist yet. Progression
         otherwise shows only through `.highlight` and the packets riding the connectors.
         THE VETH CARRIES NO ARROWHEAD. It was a plain `P.arrow`, which always attaches a marker, so a
         permanent arrowhead pointed host to Pod on a line labelled `veth pair`: a two-ENDED cable
         drawn as one-way traffic, on the step whose own sentence is `all Pod traffic to the Node and
         beyond crosses it`, which is the other direction. It was carried to `P.relation`, which draws
         no marker, and is a `P.arrow` again today with `marker-end` removed by a `tune`: A-06 puts it
         on the ARROW side, since its step names traffic crossing it and a ball rides it, and no part
         kind draws a markerless arrow. `pathArrow` hardcodes the marker, and `P.relation` drops it
         only by adding `.scheme-arrow-relation`, whose CSS is written for lines nothing rides.
         MEASURED, composite stroke alpha (the computed `stroke` alpha times `stroke-opacity` times
         the `effectiveOpacity` chain), IDENTICAL on all five steps at 1600x1000 and at 1100x800:
           as `P.relation`      0.45   painted rgb(39,114,129)   contrast 3.39 against the ground
           as `P.arrow` + tune   1.0   painted rgb(79,229,255)   contrast 12.53
           rail and four taps   0.45   painted rgb(28,67,77)     contrast 1.75
         The interior five have an empty role, so their stroke is `--diag-arrow-dim`, which the tinted
         dialog resolves to the OPAQUE `--tint-deep`, and the relation shade then multiplies it twice
         as dark as the tinted cable at the same stroke-width 1.4. So the shade never made the cable
         the faintest line on the card: it outread the interior links by 1.9x contrast at both
         viewports, and the faintest stroke here is the stack band border at alpha 0.28. What it cost is
         HIERARCHY, the one wire a ball rides sitting below every box border it joins, and the
         isolation step already claimed in a comment that the cable reads bright, which was false
         until this change.
         Step 1 says the namespace is fully cut off from the host stack, and at full strength the cable
         was the loudest line on the card while that sentence was on screen. It sits at
         `OPACITY.notready` there now, and the residue is named in the note under the line that does it.
         The ball on `veth` still runs host to Pod. CNI plugging the peer end in is what that step
         narrates first, eth0 lights on its arrival, and the sentence about Pod egress is the
         consequence the unmarked cable no longer contradicts.
NOTE     The veth path is `M 410 312 L 600 312`, 190 units long under a `5 5` dash, which is 19 exact
         periods, so the run ENDS on a gap: the paint stops 5 units short of the Pod NETNS left edge
         while the Host NETNS end starts on a dash and is flush. Read out of the DOM, and identical on
         all four viewports because both numbers are viewBox units. Both endpoints sit on the face
         midpoints (`L-11`), so this is a dash PHASE and not a geometry error, and closing it needs
         either a length that is not a multiple of 10 or a dash array this card does not share with its
         other five dashed lines.
MOTION   The localhost hop is ONE ball that drops down the app tap, crosses the rail and climbs the
         sidecar tap, so a single motion traces both joins and the hop itself, and lo, the loopback
         that serves it, lights on arrival.
NOTE     `portChip` is DECLARED `shared`, the value four of the five steps write. It was declared
         `private`, a string no step ever wrote: `app.js` calls `gotoStep(0)` the moment the dialog
         opens, so step 0 statics overwrite the declared value before the first frame, and a settled
         dump is byte-identical either way. The isolation step already says the private half in words
         the reader can act on, `own space`, so the fix was the declaration and not a new step value.
WHY NOT  Drawing the veth as a lane PAIR, one arrow each way. It states two-way honestly and keeps
         full brightness, and it draws TWO cables where the object is one link with two ends, and the
         return leg would be a lane no ball ever rides on any step: a new `report/lane-traffic.test.mjs`
         finding created by a repair, on a card that has none today.
         Leaving the cable a `P.relation` and recording the shade. Zero cost, and it leaves the card
         subject reading as structure while a ball rides it, which A-06 and the relation CSS both call
         wrong, and it keeps the isolation step comment untrue.
         `P.raw` with a bare `line()`, the `storage-reclaim-policy` identity-spine idiom. The same one
         escape, and it hides the geometry from `report/lane-traffic.test.mjs`, which reads parts as
         DATA and not as DOM: the veth segment drops out of its COPIED tier into UNDRAWN, the sharpest
         finding that file has, on a card with none. A hand-spelled class list is also what A-07 warns
         about, and the idiom sets no `data-role`, so unless one is hand-written the cable drops out of
         the painted set `render/palette.test.mjs` holds to a baseline of 1897 elements.
         Raising `stroke-opacity` only on the steps a ball crosses, the `network-pod-ip-and-veth`
         loopback precedent (`reset.extra` plus a per-step write). The truest picture of the five, and
         it costs an `enter` on all five steps plus a `reset.extra` to write a property no field
         writes, six escapes for one line, and it breaks the constant-opacity rule this LANES block
         holds all six dashed lines to.
```

### before `opacity: { vethWire: OPACITY.notready },`

```
C-14 on `fresh`. The veth pair is created by CNI on the NEXT step, so on this one the cable does not
exist, and the narration says so in the strongest words the card uses: `fully cut off from the host
stack and from every other Pod`. Drawn at 1 it was the brightest line on the frame while that
sentence was on screen, an arrow between the two blocks the sentence separates.
`notready` 0.40 rather than 0, because C-14 wants an absent thing DIM and not cut out: a hole where a
cable joins two drawn blocks reads as a rendering fault. All five steps state `vethWire`, since the
field writes an inline `style.opacity` that would otherwise carry 0.40 forward into `veth`.
THE RESIDUE, and it is deliberate. `eth0` is the in-Pod END of the same pair and is still drawn at
full weight on `fresh`, unlit, with `interfaces` reading `lo only` in the strip below it. The step
sentence names the CABLE and not the interface, and the chips carry the interface half, so the line
is drawn where the narration draws it. Dimming the box as well makes the shared-stack row half ghost
on one step, which is a composition change and not this repair.
```

### before `const POD_TOP = 160;`

```
POD_CY is derived from POD_TOP and POD_H, and the host block centres on it, so the two columns stay
level when either moves. Re-typing the host y is what breaks the pairing.
```

### poster

```
Host netns on the left, one centred dashed veth crossing into the Pod netns box. Inside, app and
sidecar on top and eth0 and lo below are all joined by one H-shaped shared-stack rail. Symmetric
about the Pod centre.
```

## network-netfilter-path

### layout

```
WHAT     The missing floor under every other Network Foundations card. Those name an OPERATION on a
         packet (kube-proxy DNATs, conntrack pins the flow, egress MASQUERADEs) without saying WHERE
         in the kernel it runs. This is the hooks, in order, with the packet walking them:
         PREROUTING, the routing decision, FORWARD, POSTROUTING, the wire.
LAYOUT   The order is the lesson, so the whole composition is one left-to-right chain and the packet
         never doubles back on it. The conntrack table sits under the four hooks it belongs to and
         stops where the wire begins, because a packet on the wire is past it.
         The Node frame starts at 305 and the client Pod, the only block above it, sits at x >= 450.
         Its packet drops straight down and only turns left once it is INSIDE the Node.
LANES    The reply rides its own lane (RETURN, y 360) ABOVE the chain rather than retracing the forward
         wires backwards.
         CT_LINK is a BRACKET, not a stub: it leaves PREROUTING at its bottom-edge midpoint, steps
         across in the gap between the two rows, and lands on the conntrack table's own top-edge
         midpoint (510). Same shape on network-north-south-path.
WHY NOT  A straight stub from PREROUTING: it lands 335 units off that midpoint, which reads as a lane
         pointing at nothing in particular and is what OFFEDGE reports.
NOTE     hook is where the packet is right now, dst and src are what it carries there, and conntrack
         is what the kernel remembers about it. All four are outcomes of a packet in flight, so they
         read the values it starts with and the steps rewrite them exactly where the kernel does.
MOTION   The closing eBPF step carries no motion at all: it is a comparison, not traffic. Every step
         states the opacity of every dimmable block (`CHAIN_UP`), so the dim that step puts on the
         chain cannot leak into a replay of an earlier one.
CONTENT  The conntrack row is a FLOW, one grammar the whole way down: source then destination, the
         same pair the `src` and `dst` chips carry, with the DNAT visible as the destination half
         changing. Writing the post-DNAT row as the translation instead (`10.96.0.20:80 ->
         10.244.2.7:8080`) makes the arrow mean two different things on two adjacent steps, and the
         narration already says the translation was stored.
```

### before `F.set({ at: 'inb', chips: { hookChip: 'PREROUTING', ctChip: 'new flow' }, sublabels: { ct: '10.244.1.5 -> 10.96.0.20:80' } }),`

```
P-03 on `prerouting`. A packet is not AT a hook until it arrives there, and conntrack has no flow to
record until it does. `chips` keeps the end state, `rewind` holds the idle none on both chips and
`no flow yet` on the table, and this F.set writes all three on the `inb` arrival at 2189ms: the Pod
pulses at 0, the ball leaves at BEAT.afterPulse 800 and the 625 unit entry route takes 1389ms.
The table sublabel travels with the chips because the row IS the conntrack chip written long, and
P-04 wants one family on one beat.
Measured in real time, 300 to 2200ms read none / none / no flow yet, 2500 and 2900ms read
PREROUTING / new flow with the row filled. Note the beat is only 11ms past the 2200 mark, so a frame
taken there lands on either side of it: take the before frame at 1800.
```

### before `chips: { hookChip: 'PREROUTING (nat)', dstChip: '10.244.2.7:8080', srcChip: '10.244.1.5', ctChip: 'DNAT recorded' },`

```
NOT A DEFECT, and it is the one step of this card that deliberately does NOT take a P-03 repair. All
three changed values stand from step ENTRY, 700ms before the only ball lands, and
`report/chip-beat.test.mjs` lists them as FORM-B at 700ms, the bottom of its four lead bands, where
209 of its 341 catalog-wide records sit.
The direction of the motion is the reason. On `prerouting` and on `reply` a ball travels TO the place
that makes the value, so the value has to wait for the arrival, and both are bound. Here the nat table
runs INSIDE PREROUTING, where the packet already is at entry, and the drawn motion is the packet
LEAVING that hook with the rewrite already done: the ball wears `dst 10.244.2.7:8080` from the moment
it emerges, and the next arrival is the routing decision, which is a different fact.
Binding `dstChip` to that arrival would put the strip 700ms BEHIND the tag on its own ball, the chip
reading 10.96.0.20:80 while the ball crossing the gap above it reads 10.244.2.7:8080, and it would
disagree with the conntrack row, which writes the DNAT-ed flow at entry too. Read off the 1600x1000
frame at t=350: PREROUTING lit, ball just clear of its right face under the backend address, strip and
row both already rewritten, everything on the frame agreeing. P-06 puts a value chip turning over at
step entry inside the rules, and this is that case.
```

### before `F.set({ at: 'back', chips: { hookChip: 'PREROUTING', dstChip: '10.244.1.5', srcChip: '10.96.0.20:80 (restored)', ctChip: 'ESTABLISHED' } }),`

```
P-03 on `reply`. All four chips read what conntrack does when the reply REACHES PREROUTING, and the
`(restored)` in the source is the word for it. `chips` keeps the end state, `rewind` carries what
`postrouting` left, and this F.set turns all four over on the `back` arrival at 1989ms, the whole
lane being one route with no departure delay.
Four on one beat, because the reversal is one act: the hook the packet is at, the destination it
was rewritten to, the source that was put back and the state conntrack matched.
THE REWIND IS THE PREVIOUS STEP, NOT THE REPLY IN FLIGHT. The alternative was to rewind `src` to
10.244.2.7:8080, the value the ball's own riding tag carries for the full 1989ms, which would have
matched the tag exactly. It was dropped because that string is stated by no step, and the strip on
this card reads the last state a HOOK saw rather than what is on the wire: entry to 1989 it shows the
outbound packet leaving POSTROUTING, which is history rather than an answer that has not happened.
The chip and the tag therefore still differ during the flight, and that is a LAG and no longer a
claim about the future.
MEASURED, because the two DO share a string for most of the flight: the tag `src 10.244.2.7:8080` is
readable from 300 to 2000ms (1800ms of the 2549ms step, same on all four viewports) while `dst` reads
the same 10.244.2.7:8080 until the turnover at 1989. They are not in conflict, and the frame says why:
`hook` reads `FORWARD, POSTROUTING` beside them, which is a hook this reply has not reached, so the
strip is unmistakably the outbound packet. The request dst IS the reply src, which is what DNAT means,
and moving that string to `src` to match the tag puts a chip and a riding tag on the same word at the
same moment, which P-02 names as the thing chip naming exists to avoid.
Measured in real time, 300 to 2000ms read FORWARD, POSTROUTING / 10.244.2.7:8080 /
10.244.1.5 (no SNAT) / DNAT recorded, and 2350ms onward reads the restored four.
```

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;`

```
The chip strip spans this frame 1:1, so the strip and the frame share both verticals. The five chain
blocks sit INSIDE it, inset 30 on the left (PREROUTING at 70 against the frame at 40) and 20 on the
right (eth0 ending at 1140 against 1160), which is the margin that keeps them off the frame border
while the strip below still reaches it. Changing NODE_W re-solves the chain spacing and the strip
together; changing only one breaks the single-column reading.
```

### before `const CHIP_W = [270, 320, 260, 210];`

```
Four UNEQUAL widths, each sized for its own longest value, summing with the gaps to the frame span.
They are not a computed row: editing one value without re-measuring is what `render/chipfit.test.mjs`
catches.
```

### before `const HOOK_TAG_DY = -40;`

```
A hop between two hooks is a 40 unit gap against an address 100 to 108 wide, so at the default -14 both
hook faces cut every one of the three chain tags for 600ms each. -40 parks the tag in the band between
the return lane (360) and the row top (380): 4.7 under the lane, 2.4 over the row. Measured clear from
-38 to -94 on all four viewports, and -38 was rejected because it leaves 0.4 to the row.
OPEN: the `prerouting` tag `dst 10.96.0.20:80` prints over the Pod sublabel `10.244.1.5` for 100ms and
over the `Node kernel` caption for 100ms, and NO dy in +-80 is clear on any viewport. The window is shut
from both sides: the Node frame top forbids anything above -8, the PREROUTING top anything below -3, the
caption needs at least 13.4 of separation and the sublabel needs the tag 12 lower. dx +34 clears the
caption alone and is past the ceiling. The sublabel pair sits at alpha 0.84 during the fade-in, so an
`emerge` of 150 would close it without moving the tag.
```

### poster

```
Three shapes on the way in, one band on the way back, nothing else. The two NAT hooks are the
boxes, and each carries the same rewrite glyph, one address chip becoming another: the destination
on the way in, the source on the way out. Between them the routing decision is a DIAMOND, the only
shape that is not a box because it is the only one that CHOOSES, and it sits AFTER the first
rewrite, which is the whole reason the order matters: routing only ever sees the already rewritten
address. The reply walks none of it: the conntrack band under the rail IS the way back, unattached
to any hook because it skips them all, the reply riding it right to left. Walk the chain one way,
ride the memory back.
FORWARD, the filter hook and the Node frame are left out on purpose: the card draws the full chain,
the poster only has to say why its ORDER is the point.
Geometry: the rail on y=65 symmetric about the diamond at x=160, the band under it, every dash
starting and ending on a shape edge.
```

## network-nodelocal-dnscache

### layout

```
WHAT     A Node-local DNS agent answering most lookups inside the Node, so only a miss pays for the
         trip to the cluster resolver.
LAYOUT   A Node box holds the client Pod and the node-local-dns agent, with upstream CoreDNS outside
         it on the right. TWO hops, each with its OWN pair of lanes: query out on FWD_Y, answer back
         on RET_Y.
DO NOT   Set only the chips a step talks about. Every step repaints ALL four readouts, or the others
         show the previous step, which is how the miss step came to claim `conntrack: no entry` while
         it was busy opening a DNAT-ed TCP connection to the kube-dns ClusterIP, which does create one.
CONTENT  On the miss step conntrack is NOT `no entry`: the upstream leg is a real connection to the
         kube-dns ClusterIP, so kube-proxy DNATs it and it is tracked. The win is that it is ONE
         long-lived entry reused by every miss, not one fresh UDP entry per lookup.
MOTION   The miss step runs FOUR hops, because the narration promises all four: the Pod asks, the agent
         misses and forwards upstream, CoreDNS answers back to the agent, and only then does the agent
         answer the Pod. Stopping at the upstream query means the answer the card claims to cache never
         arrives.
```

### before `const FLOW_Y = 300;`

```
The client Pod, the node-local agent and upstream CoreDNS are all centred on this line, so both hops
are straight and each carries its own forward and return pair. Content cannot rise above y=200: the
Node box starts at x=70, under the panel, whose longest step here reaches 163.
```

### poster

```
Near traffic and far traffic. Everything the Pods ask stays on one short rail inside the Node, where
the local agent answers it, and a single thin thread climbs OUT of the Node to the cluster resolver:
that is the miss, and it is the only lookup that pays for the trip. The meaning is in the DISTANCES,
not the topology, so the poster keeps the Node boundary (the line the thread has to cross) and drops
everything else the card already draws, packet dots included.
```

## network-nodeport-loadbalancer

### layout

```
WHAT     An external client above the LB, the LB fanning down to every Node through a right-angle bus,
         and the chosen Node DNATing to a backing Pod.
NOTE     The two backend Pods sit on the OUTER Nodes (1 and 3), not on 1 and 2. That is what puts the
         low-block bbox on 600, and it also puts the Pod-less Node in the MIDDLE, where the nodePort
         step wants it (`even on Nodes that run no backend Pod`). The Node-3 Pod IP is 10.244.3.9 so
         the per-Node CIDR the card sets up by example still holds.
MOTION   The tag on the LB leg names the Node and its nodePort, since the balancer has already
         rewritten both. Each leg only shows the text in the OPEN GAP between blocks: it emerges from
         the client into the first gap, vanishes into the LB, then re-emerges out of the LB bottom and
         rides the fan, never sliding the text over the LB itself.
WIRE LABELS
         There are none, and the removed declaration is why the entry says so. A `P.wire({ key: 'c' })`
         sat at (660, 138) and the file carried no `wires:` field on any step, so it drew an empty
         `[scheme-label code dim]` on all five: the only such element on the card. It is deleted rather
         than written, because that spot is exactly where the `to 203.0.113.7` tag EMERGES from the
         client leg on `client-hit`, and a static caption there would print through a riding one. This
         card names its hops with tags only (NET.T-01).
NOT A DEFECT
         `TO_N2` and `TO_N3` carry no ball on a given step. A NodePort opens the SAME port on EVERY
         Node, which is the card's whole first claim, so all three lanes have to exist for the reader
         to see that any Node would have served the request. One step takes one of them, and which one
         is the arbitrary part. `network-headless-service`'s `TO_W2` is the precedent.
```

### before `F.set({ at: 'prov', chips: { vipChip: '203.0.113.7' } }),`

```
P-03 on `lb-provision`, the weakest instance of the class in this repair and fixed anyway. The chip
is `status.loadBalancer`, the field the narration says is written back WHEN the balancer is ready,
so it cannot carry an address while the provisioning call is still travelling. `chips` keeps the
address, `rewind` holds pending, and this F.set writes it on the `prov` arrival at 700ms, the
routeDur floor and the shortest lead anywhere in this class.
It is weak for a second reason worth writing down: the LoadBalancer block already carries
`VIP 203.0.113.7` as a static sublabel on every step, so the address is on screen regardless. That
sublabel is the balancer naming itself and the chip is the Service STATUS recording it, which are
two facts, and only the second is produced by this call. The sublabel is deliberately left alone.
Measured in real time, 200 and 500ms read pending with the ball mid-hop, 950 and 1800ms read
203.0.113.7.
```

### before `const CX = 600;`

```
The client, the LB and the fan origin sit on CX, and the three Node frames are spread symmetrically
inside SCHEME_L..SCHEME_R. NODE_CX then centres the nodePort chip, the backend Pod and the bottom
info chip of each column, so one grid drives every tier.
```

### before `const reserved = (open) => ({`

```
The chip-unwritten queue. np1, np2, np3 and chainChip carried :31000 and KUBE-NODEPORTS from the
build, no step ever wrote one, and the nodeport step LIT all four: a highlight cueing values that had
stood since the first frame. They are not constants of the diagram, they are the reservation that
step narrates, so they read none until it and turn over on it together.
The step carries no packet and no Pod, so entry is the only beat it has (P-06) and its highlight is
now the change M-27 asks such a step to carry. The build values were moved to none with them, so the
frame before step 0 agrees with the idle step.
rangeChip is the opposite reading and keeps its value: 30000-32767 is the API server
service-node-port-range, true before any Service exists, so every step states it and none points at
it. That is what took it out of the SILENT tier without giving it a highlight it has not earned.
```

### before `const VIP_TAG_DY = -4;`

```
C_TO_LB is a 50 unit drop from the client floor, so at the default -14 the tag is still inside the
External client block when it becomes readable and the block floor at 100 cuts it for 200ms. -4 is the
only offset in +-80 that clears every readable sample, and it does so on 1600x1000, 1280x860 and
1100x800. On 900x650 nothing in +-80 is clean: at -4 the glyphs are clear on all four, and one 100ms
sample keeps an em-box graze there. The ball ends up level with the string rather than under it, which
is what a 50 unit lane costs.
```

### poster

```
External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
fan down to three Nodes, backend Pods inside the OUTER two and the MIDDLE Node empty, which is the
arrangement the card draws and the one the NOTE above gives the reason for.
The empty slot is the MIDDLE Node, the one the card leaves without a backend: node rects at
x=20/124/228 with Pod rects at x=32/240, each the same 12 unit inset inside its own Node. DO NOT
fill it, and DO NOT put the Pod-less Node on the right (Pod rects at x=32/136): the poster then
disagrees with the card. Judged next to `network-loadbalancer-bare-metal`, whose three Nodes all
hold a Pod: the gap is the one fact that tells the two tiles apart.
```

## network-north-south-path

### layout

```
WHAT     NORTH-SOUTH is the name of the thing being drawn: traffic crossing the cluster boundary, as
         opposed to east-west Pod to Pod traffic.
LAYOUT   Instead of a bare full-height divider, the composition is framed by TWO faint regions, an
         outside-the-cluster box on the left and the Node box on the right. The empty GAP between
         them IS the boundary (EXT right 492 .. Node left 540), and the ball visibly crosses it once
         in and once out. Both regions share one top and height so they read as a matched pair. The
         outside one carries its title at the TOP-RIGHT corner instead of the top-left, so the
         narration overlay never hides it, and the client and LB inside it sit at y >= 315.
LANES    CT_LINK is a BRACKET: kube-proxy bottom-edge midpoint, across the gap between the rows, onto
         the conntrack table's own top-edge midpoint (860). Same shape as network-netfilter-path.
WHY NOT  A straight stub down from kube-proxy: it lands 175 units off that midpoint, which is what
         OFFEDGE reports.
NOTE     conntrack is a real BLOCK here rather than a word in the narration: it is what pins the flow
         on the way in and unwinds the DNAT on the way out, and it fills the Node interior.
DO NOT   Put the three addresses on the wires as static text. The same packet carries dst
         203.0.113.9:443, then dst 192.168.1.20:31000, then dst 10.244.2.7:8080, and the reply unwinds
         those same three as src. As inline text the longest overflows its 80-unit gap and prints
         straight through the Pod border. They ride the ball.
```

### before `const FLOW_Y = 356;`

```
Every block on the path is centred on this spine, which is what lets both lanes (FWD_Y above, RET_Y
below) meet every block on its edge. Move a single block off FLOW_Y and one of the two lanes stops
short of a face.
```

### before `const SVC_TYPE = 'type: LoadBalancer';`

```
The chip-unwritten queue, and the exemplar its report names of the sharp form: three steps light
svcChip and no step writes it. Ruled a CONSTANT OF THE DIAGRAM. The Service type is the
premise of the whole path, the aria-label opens on it, and no step on this card changes a Service
type, so there is no arrival to bind it to.
Every step states it beside stage, DNAT and backend, which puts it inside P-01, and the value is the
one the scene was built with, so no step moves the settled frame. The highlight on lb,
nodeport and dnat stays: it names the object that owns the path being drawn, and whether pointing at
an unchanging value is right on those steps is R2 and P-03, not this queue.
```

### before `const LAST_HOP_TAG_DY = 30;`

```
The three reply tags share dy 24, and on the last hop alone that is wrong: the Client and the Cloud LB
are 74 tall against the 80 and 100 of the blocks the other two hops join, so their floor at 393 lands
inside the tag band and the border runs through the glyph tops for the whole 1000ms flight. Measured on
the four viewports, dy 28 and up is clear, and 30 is taken so the em box clears the floor by 2.7 rather
than 0.7.
```

### before `tag({ text: 'src 192.168.1.20:31000', points: KP2LB, after: 'h1', dy: 24 }),`

```
OPEN, the same step: `src 192.168.1.20:31000` has no clear offset at all (81 candidates, 10 readable
samples, a free band of 12 against a line 12.8 tall), and `src 10.244.2.7:8080` clears only 7 samples of
10 at dy 32..38, because the kube-proxy floor wants 31 or more, the Pod floor 41 or more, and the
conntrack table top forbids past 39. Both are left where they are.
```

### poster

```
North-south = crossing the cluster boundary and coming straight back. Two faint framed regions
(outside | Node) separated by a gap that IS the boundary: a request packet crosses it left to right
on the top lane, the reply crosses right to left on the bottom lane. Inside the outside region a
client square feeds a LB pill; inside the Node a kube-proxy pill hands off to the backend Pod while
a 2x2 conntrack/NAT table sits under it. Abstracted from the dialog so it reads as a boundary
crossing and a round trip, not a row of boxes.
```

## network-pod-egress-snat

### layout

```
WHAT     A Pod reaching the Internet: the MASQUERADE rewrite on the way out and the reverse on the way
         back.
LAYOUT   A Node box holds the client Pod and the MASQUERADE box, and the Internet box sits OUTSIDE it
         in its own right-hand column, its top LEVEL with the Node frame (NET_Y = NODE_Y), above the
         egress lanes. The Node left edge and the Internet right edge line up with the leftmost (src)
         and rightmost (dst) chips below, so the top row and the info strip share extremes.
LANES    The SNAT and the reverse SNAT both happen INSIDE the masquerade box, which lights as the
         return leg arrives with the node IP the reply still carries riding along.
WHY NOT  The Internet box lifted to y110, above the measured panel bottom of 181. The three blocks that
         DO sit below the panel then span 110..630 and centre on 370: CENTRE-LOW. Levelling it with the
         Node frame is what puts that row on 600, and the forward leg still turns UP out of the Node
         into it.
OPEN     Four riding tags are cut for 2200ms in total, the same on all four viewports, and none of
         them can be moved. The worst is `src 10.244.1.5` on `send`, 800ms with the MASQUERADE box
         left and top faces plus the Client Pod across the glyphs: it clears at -54, which is 40 from
         the default -14 and past the ceiling, and the largest legal move (-44) still leaves 300ms.
         `dst 10.244.1.5` on `deliver` (600ms) needs -78. `src 192.168.1.20` on `masquerade` (300ms)
         and `dst 192.168.1.20` on `reply` (500ms) have NO clear offset within +-80 on either axis:
         both ride the egress lanes between the MASQUERADE box and the Node frame, and that band is
         narrower than the address they carry.
```

### before `F.set({ at: 'back', chips: { ctChip: 'reverse SNAT' } }),`

```
P-03 on `reply`. Conntrack reverses the mapping where the reply MEETS the MASQUERADE box, so the
chip cannot read reverse SNAT while that reply is still crossing from the Internet. `chips` keeps
the end state, `rewind` carries the `flow recorded` the masquerade step left, and this F.set writes
it on the return route's arrival at 1091ms, which is also where `lights: ['masq']` cues the box. The
route needed a `name` for the F.set to hang off and got one.
`src`, `SNAT` and `dst` are unchanged on this step and stay where they are: only the conntrack state
is news here, so there is no family to move with it. `dst` is not LIT here either. It holds
1.1.1.1:443, the destination of the outbound flow, while the ball on this step rides under a
`dst 192.168.1.20` tag, and lighting the chip puts two different destinations on screen at once.
Measured in real time, 300 and 900ms read flow recorded with the ball still under its
`dst 192.168.1.20` tag, 1350 and 2200ms read reverse SNAT.
```

### before `const EGRESS_Y = 360;`

```
Forward and return lanes sit symmetric about this line and BOTH stay inside the box heights, so a
ball never travels under a box. The Internet box is levelled with the Node frame rather than lifted,
which is what puts the low row on 600.
```

### poster

```
A Node wrapping a client Pod (outer shell + inner app) and a MASQUERADE box, with the Internet as a
small globe off to the right. Two dashed lanes cross the SNAT boundary as a round trip: the request
left to right on the top lane, the reply right to left on the bottom, chevrons marking direction.
Pod, masq and internet share one centre row.
```

## network-pod-ip-and-veth

### layout

```
WHAT     Where a Pod IP comes from and what the veth pair actually is.
LAYOUT   The Node and everything inside it sit in the y228..528 band, with a gap to the chip strip at
         y560, so the CNI plugin stays inside the Node box and nothing touches the panel.
WHY NOT  The row at 150..960 inside a frame spanning 80..1120: that is 70 of margin on the left
         against 160 on the right, which CENTRE-LOW reports as a bbox centred on 555.
MOTION   No pulses on this sequence, just persistent highlight borders like the workloads cards: the
         app block lights first and stays lit, then the loopback ball travels, then the pause block
         lights on arrival.
```

### before `rewind: { chips: { ipChip: 'none', vethChip: 'none' }, wires: { veth: '' }, podSublabels: { podShell: 'netns: open' } },`

```
P-03 on `cni-add`. One CNI ADD produces the address, the link, the wire label naming that link and
the Pod sublabel carrying the address, and all four are the SAME result (P-04). `chips` keeps the end
state, this rewind holds the empty form of all four, and the F.set below writes them together on the
`conf` arrival at 1500ms, which is also where the Pod pulses: the exec hop runs 0..700, the beat adds
100 and the veth leg lands at 1500.
The veth wire label goes with them rather than staying at entry, unlike the wire labels on the TLS
card. That label NAMES the veth pair, and the pair does not exist until this call creates it, so the
lane is deliberately bare while the config ball rides it. A label that describes a LANE would stay,
a label that is a RESULT travels.
Measured in real time, 300 and 1200ms read none / none over a bare lane with the Pod still saying
netns: open, 1750 and 2300ms read 10.244.1.5 / eth0 to veth, the lane labelled and the Pod carrying
its IP.
```

### before `const LINK_Y = 396;`

```
The veth link, the loopback link and the packets on both share this y. The inner row is centred in
its frame by DERIVATION (INNER_W, then POD_X from it), so re-typing an x here is what re-creates the
70-against-160 margin CENTRE-LOW reported.
```

### poster

```
The scheme in miniature with a brightness hierarchy and one bright accent: the Pod netns holds
pause (bright, the netns owner) and app (dim), a single bright IP bar spans both (one address,
shared), and the hero is the veth pair: two lit end-nodes (eth0 in the Pod and its host-side peer)
joined by a dashed link out to the cni0 host bridge.
```

## network-pod-localhost

### layout

```
WHAT     Containers in one Pod sharing a network namespace: they reach each other over localhost, and
         outside traffic arrives on the shared eth0.
LAYOUT   Both blocks are positioned over the chip strip below: the client Pod centred over the
         leftmost chip (path), the Pod shell spanning the two rightmost ones (bind + Pod IP). Inside
         the shell a symmetric 2x2 grid holds the two containers up top (app, sidecar) and the two
         shared interfaces down low (eth0, lo).
LANES    The localhost lane never leaves the Pod and is served by lo. The destination address on the
         external lane rides ON the ball, so there is no static inline label to collide with anything.
MOTION   The shared eth0 lights with the answering app on arrival, because the point of the card is
         that both containers are served by that one interface.
```

### before `const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;`

```
The shell spans the two rightmost chips (bind + Pod IP) exactly, and the client Pod is centred over
the leftmost one. Both share the vertical centre SHELL_CY, which is what makes the external lane one
straight centred hop.
```

### poster

```
Two containers side by side, both wired into one shared loopback node (lo, 127.0.0.1) in the middle:
they share localhost and one network stack. Sub-blocks centred inside the Pod.
```

## network-pod-to-pod-cross-node

### layout

```
WHAT     A packet from a Pod on one Node to a Pod on another, over the physical underlay.
LAYOUT   The Pod and cni0 blocks are spaced so the veth wire label fits in the gap without touching a
         block, while cni0 stays inside the Node.
LANES    The cni0-to-cni0 link is ONE continuous turning path (cni1 bottom -> underlay -> cni2 bottom),
         not three arrows, and both ends sit on block bottom EDGES so the ball never travels under a
         cni0 box. The short veth hops are linear `F.segment`s, while the cross-underlay leg is an
         `F.route` over the SAME UNDERLAY_PATH array that drew the lane.
         THIS LANE BREAKS `NET.A-02` ON PURPOSE, and it is the only place in the category that does.
         The rule says no wire and no ball crosses a Node border: a ball stops on the frame edge and
         the Pod inside pulses. UNDERLAY_PATH starts at the cni0 bottom edge INSIDE Node-1, drops
         through the Node-1 frame floor to y 495, crosses, and climbs back through the Node-2 floor
         into the remote cni0, so it cuts both borders. `network-internal-traffic-policy` draws the
         compliant version of the same journey, its cross-node leg leaving the Node-1 BOTTOM EDGE and
         landing on the Node-2 bottom edge, and that shape is wrong HERE: the subject of this card is
         which component wraps and unwraps the frame, so the two cni0 boxes have to be the endpoints.
         Stopping at the frame would leave the encap and decap steps pointing at a border.
MOTION   The journey is three wire-only hops, each ending at a block edge with the next starting from
         the far edge, so the ball visibly enters a cni0 and re-emerges on the other side.
CONTENT  The two boxes are `cni0`, the same block the same-node card draws as `cni0 / L2 bridge`, so
         no step may set the route AGAINST the bridge: the route step says the frame goes to the CNI
         dataplane instead of to a local Pod, which is what being off-subnet actually decides, and
         the decap step is then free to say the inner frame is bridged across the local cni0.
         The `outer` and `encap` chips TRACK the packet, so decap flips them to `stripped` and
         `none`: leaving the VXLAN pair standing on a step whose own wire reads `inner frame
         restored` states headers the packet no longer has.
```

### before `const VETH_Y = 338;`

```
The veth links and the short packets on them share this y, so both Nodes read as one row. The
underlay leg hangs at UNDERLAY_Y below the frames and starts and ends on the cni0 bottom EDGES, which
is what keeps the ball out from under a box.
```

### poster

```
The hero is ENCAPSULATION itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is a
packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod bright,
dest dim, the wrapped packet crossing the inter-Node gap on a dashed flow. The nesting reads as the
Pod frame carried between Nodes inside an outer envelope (VXLAN, or bare when routed).
```

## network-pod-to-pod-same-node

### layout

```
WHAT     Two Pods on one Node reaching each other through the cni0 bridge: switched at layer 2, no NAT
         and no encapsulation.
LANES    The veth pair is drawn as TWO directional lanes symmetric about the block centre, so A -> B
         (the ARP request and the data frame) and B -> A (the ARP reply) never share a wire.
MOTION   The ARP exchange is a full round trip: the request FLOODS A -> bridge -> B, then B UNICASTS
         its reply back along the other lane, which is the distinction the lane pair exists to show.
```

### before `const POD_MID = 380;`

```
The two veth lanes are POD_MID -/+ LANE, so the forward and reply directions are a symmetric pair
about the block centre. Both Pods and the bridge sit on POD_MID.
```

### poster

```
Same shape as the cross-node card but wholly inside ONE big Node block (both Pods share it): Pod A
(bright source) and Pod B (dim dest) flank the cni0 bridge, joined by clean dashed veths with no
packet dots. The hero is the bright frame sitting BARE inside the bridge, no outer wrapper, which is
the same-node point.
```

## network-service-cidr

### layout

```
WHAT     The Service-side twin of network-ipam-pod-cidr: one configured Service CIDR splits into a
         static and a dynamic band, hand-picked IPs come out of the static band, the allocator draws
         ClusterIPs from the dynamic band, and a second ServiceCIDR can grow the range.
LAYOUT   The pool box sits at x>=440 and the bands start at y=320, clear of the panel.
LANES    One horizontal DISTRIBUTION RAIL per fork, mirroring ipam-pod-cidr, with every drop landing
         on a box centre and every wire dim dashed and ABOVE the blocks so the bright ball reads on a
         muted line. The add-on CIDR feed is hidden until the extend step, and it is stacked directly
         over the web column so add-on -> dynamic band -> web reads as one vertical line there rather
         than as a stray top-right box.
MOTION   There are no Pods on this card, so nothing pulses: motion is packets plus a box highlight
         plus the arrival ripple.
NOTE     The IPAddress chip is a FULL-WIDTH bottom strip (SCHEME_L..SCHEME_R). A lone 280-wide chip at
         800..1080 is a chip strip centred on 940, and its value (10.96.137.42 . default/web) did not
         fit beside its own name in 280: the one chipfit collision the catalog carried. The binding to
         web is not lost, because the value names the Service.
```

### before `const assigned = (k8s, dns, web) => ({ sublabels: { svcK8s: k8s, svcDns: dns, svcWeb: web } });`

```
P-03. A clusterIP WAITS for the packet that carries it. The card already wound the IPAddress chip's
OPACITY back and raised it on arrival, and the three Service sublabels are the same kind of value
written as text, so they now travel the same way: `assigned()` keeps the end state for the static
path, `rewind` puts the Service back to clusterIP pending, and an F.set writes the address where its
own ball lands. well-known has two of them, 540ms for Service kubernetes (an explicit dur on a 46
unit drop) and 858ms for Service kube-dns off the rail, and dynamic has one at 700ms.
The dynamic step writes the IPAddress chip's VALUE on that same 700ms beat as well, not only its
opacity. The address and the object recording it are one fact, and P-04 says the two halves of a
fact move together or not at all.
Measured in real time: the entry frame of well-known reads pending on all three Services, and the
entry frame of dynamic keeps the two static-band addresses and leaves Service web pending with no
IPAddress strip at all.
```

### before `const SCHEME_L = 120, SCHEME_R = 1080;`

```
Services sit on an even 260 / 600 / 940 grid with their edges flush to this band, and SVC_GAP is
solved from it rather than typed. The IPAddress chip spans the same band, which is what stops it
from being a lone chip centred on 940.
```

### before `F.segment({ from: K8S_ROUTE[0], to: K8S_ROUTE[1], dur: 540, name: 'k8s', lights: ['svcK8s'] }),`

```
M-14 and the ripple-double queue. Four F.ripple entries stood beside these routes, one on well-known
for each reservation, one on dynamic and one on extend, and each named the LAST POINT of a route in
its own step at that route's own arrival. packetAlong rings there already with no opt-in, so two
identical rings opened from one pixel on one millisecond. Measured at the arrival instant before the
repair: 2 rings at matrix(0.390055, 0, 0, 0.390055, 260, 450), both at opacity 0.936, and the same
doubling at 940,450 and at 1080,362.
NOTHING WAS RETIMED. The four arrivals stand at 540, 858, 700 and 1518ms, no points array moved and
no duration changed, so this is not an A-11 edit and render/duration.test.mjs reads the same card.
DO NOT put an F.ripple at the end of a route. The verb is for a receiving BOX no ball reaches, where
a Pod would get a pulse, and these four were the only uses of it in the catalog.
```

### poster

```
One rounded range split by a single solid vertical, with the left band filled cyan at 0.12 and one
small block sitting alone in the right half at 0.24. The split is the static and dynamic bands, and
the bright block is one ClusterIP drawn FROM the dynamic side.
The two faint dotted leads at 0.4 are the only thing suggesting motion, and they stop short of the
block on both sides: the address was taken from the range, not delivered to it.
```


## network-service-clusterip

### layout

```
WHAT     THE NETWORKING EXEMPLAR. A ClusterIP round trip: the client dials a virtual IP, kube-proxy
         DNATs it to one of two backends, and the reply unwinds the NAT on the way home.
LAYOUT   Its extents are the ones other networking cards copy: CX 600, SCHEME_L 60, SCHEME_R 1140,
         the same L/R/CX the Workloads canon uses.
         The two backend Pods sit SYMMETRIC above and below FLOW_Y, podY the exact vertical mirror
         of podX. The virtual ClusterIP is lifted ABOVE kube-proxy, because it owns no interface:
         the packet never reaches it, kube-proxy intercepts.
LANES    Each backend is wired by a forward fan and a return fan of identical shape, so the arrows
         travel the same on top and bottom and always meet a Pod at its left edge, and podY's pair
         is the vertical mirror of podX's.
         The vip-to-kproxy link is an OWNERSHIP marker with no arrowhead: kube-proxy REALIZES this
         virtual IP, and the ClusterIP never appears on a wire.
NOTE     The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225
         / 215), each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs
         the widest cell. Four cells in one row cannot all reach the 350 floor a bottom strip
         normally wants, and this row predates that floor. `render/chipfit.test.mjs` measures it
         clean, which is the test that matters.
MOTION   This card glides its packets 10% slower than routeDur, through an explicit dur the `PACING`
         map of `render/motion.test.mjs` registers. Only the BALL TRAVEL is slowed: pulses, hops and
         step floors stay on the canon, so the overall process matches every other card, and riding
         labels take the same slowDur so they stay locked to the ball.
         The rewrite happens INSIDE kube-proxy in both directions, which is what the ball has to
         show: the DNAT-ed packet EMERGES from the box carrying the Pod IP, and on the reply the
         ball hides at its right edge and re-emerges at the left carrying the restored ClusterIP
         source.
NOTE     On the dnat step the backend Pods are NOT highlighted: nothing has been DNAT-ed to them at
         that stage and they light only when a flow lands on them. Only kube-proxy is the actor, and
         the endpoint IPs its rules point at are named in the DNAT chip.
         clientBox, podXBox and podYBox are listed by KEY in `SCENE.reset` so their highlight is
         cleared every step, and both Pod opacities are stated on EVERY step so a dim set by an
         earlier flow cannot persist.
OPEN     The second worst card in the category for riding-tag ink: EIGHT tags cut for 4700ms in total
         (5100 at 1280x860, where the glyph advances round up). Every lane on this card ends on a
         block FACE, which is what the round trip is made of, so each address is struck by the face it
         lands on for the 500 to 700ms the ball rests there. Nothing inside the offset ceiling helps.
         `dst 10.96.0.20:80` on `send` and on `balance` (600ms each at 1280x860, 500 elsewhere) needs
         -52, which is 38 from the default -14; the largest legal move, -44, still leaves 200ms of it.
         `dst 10.244.2.7:8080` on `dnat` (600ms) has no clear offset in +-80 at all, boxed between the
         Pod face and the kube-proxy face. The reply pair `src 10.96.0.20` (500 to 600ms each) needs
         -76. The card is the category exemplar for LANE geometry and this is what that geometry
         costs: the faces are where the rewrites happen (`NET.A-01`), so the tags cannot be moved off
         them without moving the story.
```

### before `const CX = 600;`

```
The three extents the rest of the category copies. Every block on this card is derived from CX,
SCHEME_L and SCHEME_R, so moving one of them moves the client, the kube-proxy column, the backend
column and both fan buses together. The chip strip does NOT follow: its four widths are sized to
their own longest values, so re-run `render/chipfit.test.mjs` after any change here.
```

### before `F.set({ at: 'send', chips: { dnatChip: '-> 10.244.3.9:8080', ctChip: 'two flows', backChip: '10.244.3.9' } }),`

```
P-03 on `balance`. The step comment says it in as many words: kube-proxy lights on the client packet
arriving and ONLY THEN picks the second backend. `chips` keeps the end state, `rewind` carries what
`reply` left (the first flow, still on 10.244.2.7), and this F.set writes all three on the `send`
arrival at 1570ms.
1570 and not the 2560 of the delivery. The pick, the second conntrack entry and the backend named by
it are one decision, taken inside kube-proxy the moment the packet reaches it, and the second leg
rides out carrying the address that decision produced. Hanging the backend chip on the delivery
instead would split one decision across two beats for no gain.
Steps 5 and 7 carry the same shape on `ctChip` and are NOT part of this repair, so the report still
lists them.
Measured in real time, 300 and 1400ms read the first flow, 1800ms onward reads
10.244.3.9:8080 / two flows / 10.244.3.9 while the second leg is still in the air.
```

### before `const SLOWMO = 1.1;`

```
The 10% glide, and the only explicit dur on this card. `render/motion.test.mjs` allows it because
the card is named in its `PACING` map, and dropping the constant while leaving the riding labels on
slowDur unglues every label from its ball.
```

### poster

```
Abstract, not the literal diagram: a client feeds a dashed virtual ClusterIP ring (it owns no
interface), which kube-proxy intercepts at a solid pivot and fans to two symmetric backends, one
chosen (lit) and one alternative (dim). The one-of-many DNAT, distilled to a hub and a fan.
```

## network-service-ports

### layout

```
WHAT     port, targetPort and a named port: what each number means and where the translation happens.
LANES    ONE-WAY: no reply is shown, so there is no return lane.
MOTION   The translation happens INSIDE the Service box: the ball fades in at its left edge on the
         dial hop, the map step LIGHTS the box where the rewrite lives, then the ball re-emerges
         from the right edge on the deliver hop. The client dials web:80 on the way in and the
         named-port resolution http -> 8080 rides the way out, so the rewrite is visible as a change
         in what the ball carries. The chip strip tracks the four port numbers as fixed facts.
PANEL    right <= 397, bottom <= 204.97 over 1600x1000 / 1280x860 / 1100x800. The Client Pod spans
         x 80..270, left of the 420 the panel reserves, so the flow row is pinned below that bottom.
OPEN     A 187 unit empty band across the full width, y 373..559, on every step, and IDENTICAL on all
         four viewports because both edges are viewBox constants. The card draws 342 units of content
         (252..594) in a 640 canvas, so 298 units are blank whatever is done with them and the only
         choice is WHERE they sit. Raising the chip strip closes the band and opens the same blank
         under it, and takes the strip off the 500..592 baseline the other networking cards share.
         Lowering the flow row puts the blank directly under the narration panel, where a full-width
         void beside drawn text reads as a hole rather than as air. The row cannot rise more than 47
         either, because the Client Pod is pinned under the 204.97. Growing the blocks to fill it is
         what `L-16` forbids and adding content is a redesign, so this is left open with the number.
```

### before `const FLOW_Y = 312;`

```
One straight left-to-right flow, which is what makes every hop a horizontal segmentPacket. The
Service is centred between the two Pods for equal 200px hops each side, so moving one Pod breaks the
symmetry the linear motion depends on.
```

### poster

```
Abstract, not the literal diagram: the client-facing port lives on one level and the container
targetPort on another. Traffic enters the Service high on the front-door plane and leaves low on the
container plane, and the vertical step through the box is the port -> targetPort remap. A ring
centred on each dashed hop marks the port on that plane.
```

## network-service-terminating-endpoints

### layout

```
WHAT     The few seconds while a backing Pod shuts down, and why a clean rollout drops nothing.
LAYOUT   Client left, kube-proxy in the middle, two backends on the right: web-a stays Ready on top,
         web-c is the one being retired below.
NOTE     The bottom chip strip is the endpoint state that actually drives routing: web-c's endpoint
         conditions, where new connections may land, and the grace-period window.
CONTENT  An endpoint carries THREE conditions and the chip has two slots, so slot two is always
         `serving` and slot one carries whichever of the other two just became true: `terminating`
         on the step that takes SIGTERM, then `notReady` from the condition step on. The third is
         drawn on the Pod sublabel of the step that sets it.
DO NOT   Write `ready · serving` on the terminate step. `ready` is a SHORTCUT for `serving and not
         terminating` (endpoint-slices reference), so it is already false the instant the Pod takes
         a deletionTimestamp, and the pair states a combination the API cannot produce. It was
         written that way once, to force a fixed [ready] [serving] grammar, and the technical-truth
         lens caught it the same day.
         Credit `terminating endpoints` or kube-proxy with keeping the in-flight flow alive. The
         drain narration did, and it was false: that rule fires ONLY when the traffic policy is
         `Local` AND every ready endpoint is terminating, neither of which holds in this scene, so
         kube-proxy would never select web-c. The proxy-terminating-endpoints KEP states the case
         this card actually draws:
         `when the traffic policy is Cluster and some endpoints are terminating, all traffic should
         be routed to the ready endpoints that are not terminating`. The established flow survives
         on its CONNTRACK entry, which already maps it to web-c so no fresh endpoint pick happens at
         all, and web-c keeps answering because a Pod shutting down `should start terminating and
         finish processing open connections`. The mechanism the card named was idle at the moment it
         described. The passive `aria-label` (`in-flight connections keep draining`) never carried
         the error and was left alone.
         https://github.com/kubernetes/enhancements/tree/master/keps/sig-network/1669-proxy-terminating-endpoints
         https://kubernetes.io/docs/reference/networking/virtual-ips/#traffic-to-terminating-endpoints
         https://kubernetes.io/docs/concepts/workloads/pods/pod-lifecycle/#pod-termination
         Say the replacement is Ready `elsewhere in the ReplicaSet`. The card frames the event as a
         rollout, and a rolling update puts the replacement in the NEW ReplicaSet while the old one
         is scaled down rather than refilled: `A new ReplicaSet is created, and the Deployment
         gradually scales it up while scaling down the old ReplicaSet`.
         https://kubernetes.io/docs/concepts/workloads/controllers/deployment/
MOTION   The `steady` step runs TWO client connections, one per backend, staggered by `CONN_GAP` 540:
         the first reaches web-a at 2409 and the second web-c at 2949. DO NOT fire BOTH fans off
         ONE client hop at the identical delay 1600: two balls then leave kube-proxy on the same
         millisecond and arrive at 2409 each, pulsing both backends together, which draws one
         connection splitting across two Pods, the one thing a connection cannot do.
         `network-traffic-distribution` records the same shape as a DO NOT and answers the same
         sentence with two client hops. Duration 4000 for a 3849 span.
         The second connection carries NO `new conn` tag of its own. The first tag holds at the lane
         end until 1660 and fades out by 1840, and the second ball is on that same 185 unit lane from
         1340, so a second copy of the text would be up while the first is still fading, on a lane
         too short to hold two.
         Each hop tags itself `new conn` or `in-flight` via a riding label. web-c dims to the
         terminating shade on the step where it takes SIGTERM, while it is still serving, and that
         shade is HELD on the two steps after it so the fade never reads as a new state. It drops
         once more, to the terminated shade, on the closing step, where the endpoint really is gone.
         The drain step runs two flows at once: the in-flight connection keeps draining to web-c, which
         pulses through its dimmed state on arrival, and as it lands a fresh connection starts from the
         client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
WHY NOT  Staggering the two FANS off one client hop and leaving the client hop alone. It separates the
         two Pod pulses, which was the visible symptom, and leaves the false claim untouched: one ball
         arriving at kube-proxy and two leaving it is still one connection becoming two. The stagger
         belongs on the thing there are two of, and there are two connections.
         A second client pulse for the second connection. One pulse per step is the shape the sibling
         card uses for the same sentence, and `PULSE_POD.ms` is 900 against the 540 gap, so a second
         blink of the client would run into the first.
OPEN     The third worst card in the category for riding-tag ink: SEVEN tags cut for 3300ms in total
         (3200 at 1600x1000). It is the price of the lane pair plus the fan, both of which end on a
         block face. `new conn` on `steady`, `condition`, `drain` and `gone` (400 / 400 / 500 / 400ms)
         is cut by the kube-proxy left face and the Client Pod right face and needs -60, which is 46
         from the default -14; inside the ceiling NOTHING helps, the first relief at all is -46 and it
         buys 300ms of the 400. `to web-a` on `condition` and `drain` (600ms each) needs -56, 42 from
         the default, and the largest legal move leaves 400ms. `in-flight` on `drain` (400ms) needs
         -58. Every one of them is past the ceiling that keeps a tag reading as its own ball's
         address, so all seven stay where they are.
```

### before `const FLOW_Y = 326;`

```
The client and kube-proxy are centred on this line and both backend fans leave it, so the two
right-angle routes are mirror images. The Pods are the only blocks off it.
```

### poster

```
Client to kube-proxy, which fans at right angles to two symmetric backends: web-a (Ready, top,
solid, neutral endpoint bar) takes new connections, while web-c (Terminating, bottom, dashed) is
still serving one in-flight flow, shown by the cyan drain lane and its cyan serving bar. The solid
against dashed pair is the whole idea.
```

## network-service-types

### layout

```
WHAT     A MAP card, not a traffic flow: four Service types plus the headless variant on the left,
         pointing straight across to what each one targets. ClusterIP, NodePort and LoadBalancer all
         proxy to the same shared backend node (they stack, each building on the one above), while
         ExternalName and headless are the odd ones out (no proxy, DNS alone) and point at their own
         boxes. `no selector` belongs to the ExternalName row only, which is where the card prints it.
CONTENT  FIVE ROWS, FOUR TYPES. Headless is a ClusterIP with `clusterIP: None`, so the count of rows
         is not a count of types: the `desc` says four Service types plus a headless variant and the
         `aria-label` calls it the headless variant for that reason. The row is drawn beside the four
         because the reader meets it as one of the shapes a Service can take, and only the WORD type
         is withheld from it.
LAYOUT   No round trip, no return lane and no bottom chip strip. The type column starts at x210, LEFT
         of the panel's right edge, so the rows clear the panel by HEIGHT instead.
WHY NOT  ROW0 at 132: the top ClusterIP row is then 46% under the panel. Moving the columns right
         instead of down: measured, and it puts the content bbox on 740.
LANES    The three proxy entries land on the backend node symmetric about its vertical centre (221 /
         309 / 397 about 309), so the fan reads balanced with no angled lines.
MOTION   Each hop carries a short riding label tagging the MECHANISM the row uses (via kube-proxy for
         the three proxy types, CNAME for ExternalName, Pod IP direct for Headless).
         ExternalName and Headless target BOXES, not Pods, so there is no pulse on those two rows,
         only the arrival ripple plus the target box lighting.
```

### before `const TYPE_X = 210, TYPE_W = 280;`

```
The type and target columns sit symmetric about x600 (210..990). TYPE_X is LEFT of the panel's right
edge on purpose: the rows clear the overlay by HEIGHT instead, which is what ROW0 186 pays for.
```

### before `const HOP = (y) => [[TYPE_EDGE, cy(y)], [TGT_X, cy(y)]];`

```
ALL FIVE ROWS KEEP THE DEFAULT TAG HEIGHT -14. Every row is one horizontal hop that ENDS on the target
face, so that face cuts the tag for the time the ball rests there: measured 400 / 400 / 400 / 400 /
300ms for clusterip / nodeport / loadbalancer / externalname / headless, the same on all four
viewports, 1900ms in total.
-40 lifts a tag into the 18 unit gap above its own row and clears it (clusterip, externalname and
headless clear from -38 on), but only three of the five rows HAVE that gap, so the card carried three
tags at -40 and two at -14: on a card whose whole subject is five identical parallel rows, the tag
height then alternates down the column. On clusterip -40 also parks the tag ABOVE the backend node
frame (row centre 221, frame top 186), where it reads as that frame's caption rather than as the
address of a ball on the row below. One grammar is worth the 1100ms.
OPEN: the 1900ms above stays. `nodeport` has no clear offset at all, because its lane is boxed between
the np row face on the left and the two Pods on the right, and the free band between the Pods is 22
units wide but only reachable from inside. `loadbalancer` clears only at +46, below the node frame,
which is 60 from the default and sits on the ExternalName row. The ceiling is a DELTA: about 30 from
the default -14, so about -44 to +16, past which the tag stops reading as its own ball's address.
```

### poster

```
The scheme in miniature, centred: five service-type rows on the left point STRAIGHT ACROSS to their
targets. The three proxy types (top) share one dashed backend node holding two Pods, while
ExternalName and Headless each get their own box.
```

## network-tls-termination

### layout

```
WHAT     Where TLS is decrypted: the Ingress terminates it and talks plain HTTP to the backend.
LAYOUT   The TLS Secret sits ABOVE the Ingress as the source of the certificate, and is the only
         block off the flow line.
CONTENT  The `wire` chip names a LEG, so it may only read what a drawn leg carries. The terminate
         step draws no leg at all (the plaintext one is labelled on the proxy step after it), so the
         chip holds `https`, the client leg that is still up, and is not lit: what changes there is
         the TLS state, and the plaintext request the controller now holds is inside the box rather
         than on any wire.
WIRE LABELS
         The two captions sit at DIFFERENT offsets because they label different things, and the pair
         is the reason. `p` labels a SINGLE lane on FLOW_Y (312) and sits 12 above it at 300. `c`
         labels the client leg, which is a PAIR at `laneY(312, 12)`, so 12 above FLOW_Y IS the out
         lane and the caption stood exactly on the traffic. Measured at 1600x1000 on `handshake`
         t=350: the caption bbox was y 288.8..303.4 while the ball sat at (370, 300) with r=5, glyphs
         and ball overlapping for the whole flight. It now hangs off `HS_OUT_Y - 12` (288), bbox
         y 276.8..291.4 against a ball spanning 295..305, so 3.6 units of clearance, which is the
         same clearance the nine `FWD_Y - 12` captions in this category carry.
WHY NOT  Lifting it further, to `HS_OUT_Y - 18`. It buys 6 units of air nothing needs and breaks the
         one offset the category shares, and the gap between the client and Ingress rows is empty
         down to the Secret at y206, so nothing was crowding it.
PANEL    right <= 397, bottom 142.56..229.82 over 1600x1000 / 1280x860 / 1100x800.
OPEN     166 units of bare canvas below the chip strip, which ends at 474 on a 640 canvas, on every
         step and identical on all four viewports. It is NOT a composition sitting too high: the
         content runs 150..474 and centres on 312 against the canvas centre 320, so the bare bottom is
         the mirror of an equal void above, and only one of the two looks bare because the narration
         panel covers the top LEFT. Dropping the chip strip to the 500..592 baseline the sibling cards
         use moves the content centre to 372, 52 off centre, and trades the bare bottom for a 187 unit
         band in the middle, which is the same finding one card over. Moving everything up is capped by
         the Client block at x 70..270, which must clear the panel bottom. 324 units of content in a
         640 canvas leaves 316 blank however they are arranged, so closing this needs content or taller
         blocks, and `L-16` forbids the second. Left open with the number.
```

### before `F.set({ at: 'hello', chips: { schemeChip: 'https', tlsChip: 'handshake' } }),`

```
P-03 on `handshake`. Three chips move here and they do NOT move together, because two different
balls earn them. `chips` keeps the end state, `rewind` holds the idle three, this F.set writes the
wire and the TLS state on the `hello` arrival at 700ms (the client hello reaching the Ingress), and
the second F.set writes the certificate on the `cert` arrival at 1500ms, when it comes down out of
the Secret. The finding was raised on `certChip` alone, and `schemeChip` and `tlsChip` are bound
because leaving them at entry beside a bound neighbour is the FORM-E shape P-04 calls worse than
doing neither.
THE WIRE LABEL STAYS AT ENTRY. `TLS handshake · https` names the LANE the hello rides, so it is
there to explain the ball in flight, and pulling it to 700ms would leave the leg unlabelled for
exactly the stretch a reader is watching it. A wire label that names a lane is not the same kind of
value as a chip that reports a result.
Measured in real time, 300 and 700ms read idle / none / in Secret, 1000 and 1450ms read
https / handshake with the certificate still in the Secret, 1800ms onward reads presented.
```

### before `const FLOW_Y = 312;`

```
Client, Ingress and backend Pod all sit on this line, with the TLS Secret the only block above it.
Decryption happens inside the Ingress box, so the flow must stay one straight run for the ball to
enter and re-emerge.
```

### poster

```
Client -> Ingress (the termination point, fed by a TLS Secret) -> backend Pod. A CLOSED padlock
rides the inbound leg (encrypted https) and an OPEN padlock rides the outbound leg (decrypted plain
http), so the poster reads the encrypted-to-plaintext handoff at a glance.
```

## network-traffic-distribution

### layout

```
WHAT     trafficDistribution PreferSameZone: kube-proxy preferring a same-zone endpoint, and what
         happens when the zone has none. The card spells the value PreferSameZone throughout and
         names PreferClose once, as the older spelling.
PANEL    bottom <= 255, so the client sits on the left below it, on SCHEME_L.
WHY NOT  The setting chips stacked under the client. That puts the chip strip at 120..440 and centres
         it on 280, and no arrangement in that left band can reach x=600, because the zone frames own
         everything right of 740 from y340 down.
LANES    Each zone stacks its two Pods VERTICALLY, so the fan from kube-proxy reaches every Pod at its
         own left edge over a shared vertical rail at x=700, with no route crossing another Pod.
MOTION   The fan runs at `routeDur * FAN_SLOW`, and the label rides the SAME dur so it stays locked to
         the ball. It does NOT buy a readable tag: measured,
         every tag on the fan is cut for its whole readable life whatever the speed, and a slower ball
         LENGTHENS that in proportion (the OPEN below carries the numbers). Speed stays
         distance-normalized: one shared multiplier, and the card is named for it in the `PACING` map
         of `render/motion.test.mjs`.
         The default step runs TWO client hops, the second staggered by 540, because its narration
         says two connections from the same client can land in different zones, which is exactly
         what having no zone preference looks like. Duration 4600 for a 4412ms span.
         TWO GAPS, and which one a step takes depends on whether the two rides END ON ONE POD. The
         default step sends to a1 and b2, two different elements, so 540 is only a read gap. The
         `session-affinity` step sends BOTH rides to a1, so it holds them `SAME_POD_GAP` 900 apart,
         one whole `PULSE_POD.ms`: arrivals 2973 and 3873, so the second blink starts on the
         millisecond the first ends. A delay of 540 blinks a1 twice inside one pulse length (gap 540
         against 900) and composites the two on the same element. Duration 4900 for a 4773 span.
DO NOT   Fire both fans at the identical delay off ONE client hop. That reads as a single connection
         being split across two backends, which is the one thing a connection cannot do.
         Land two rides on ONE Pod less than 900 apart. That is the defect above, and the reason the
         two steps carry two different gaps rather than one shared constant.
         Call `trafficDistribution` topology-aware routing. That is the proper name of a DIFFERENT and
         older feature, the `service.kubernetes.io/topology-mode: Auto` annotation, which the docs
         explicitly contrast with this field: `there is a key difference in their approaches`, the
         annotation spreading traffic proportionally by allocatable CPU while `trafficDistribution:
         PreferSameZone aims to be simpler and more predictable`. The annotation also takes PRECEDENCE
         over the field. The `aria-label` carried that name and the sources cited the annotation page
         end to end, while no narration on this card ever discussed the older feature: the label now
         reads `traffic distribution` and the source is the trafficDistribution section. Removing it
         left the catalog with no citation of the topology-aware-routing page, which is correct, since
         no card covers it.
         https://kubernetes.io/docs/reference/networking/virtual-ips/#traffic-distribution
NOT A DEFECT
         `FAN_A2` carries no ball on its step. It is the endpoint the traffic distribution did NOT
         pick, and the point of the card is that the choice was made among the drawn candidates rather
         than forced. Same basis as the nodeport fan.
         The step id `topology` stays. A step id reaches neither the DOM nor the hash, which routes on
         the step INDEX (`app.js` writes `&step=${idx + 1}`), so no reader ever sees it, and renaming
         it would move nothing on screen.
WHY NOT  Dropping the second Pod pulse on `session-affinity` instead of widening the gap. It is the
         cheaper edit, it holds the duration at 4600, and it leaves the second ball landing on a1 with
         nothing acknowledging it, which reads as a connection that was not served. The pin is the
         subject of the step, so the arrival that PROVES the pin is the one that must be seen.
OPEN     THE WORST CARD IN THE CATEGORY for riding-tag ink, and it stays open. Six `src 10.244.2.50`
         tags are cut for 9800ms in total (1700 default, 1600 default second ride, 1700 + 1700
         session-affinity, 1700 topology, 1400 fallback), identical on all four viewports, and NO
         offset within +-80 on EITHER axis clears a single one of them. It is by construction: a fan
         leg from kube-proxy has to enter a zone frame and then the Pod inside it, so the tag crosses
         two edges on every ride, and the free band between them is narrower than the address. The
         best partial move measured is dy -72, which takes 1300ms off ONE tag and is 58 past the
         default, far outside the offset ceiling that keeps a tag reading as its own ball's address.
```

### before `F.set({ at: 'fa1', chips: { pinChip: 'ClientIP . pin .2.7' } }),`

```
P-03 on `session-affinity`. The narration states the order outright: the opening connection still
picks a backend FREELY, and only then does kube-proxy pin that client source IP to the Pod it
chose. `chips` keeps the pinned value, `rewind` holds the None the default step left, and this F.set
writes the pin on the `fa1` arrival at 2973ms, where the first connection actually reaches
10.244.2.7. The second ride at 3873 changes nothing, which is the point of a pin.
The rewind is None and not an invented halfway value such as ClientIP with no pin yet. The chip
bundles the setting and its outcome, and inventing a third string to split them would put a value on
screen that no step states. Reading None until the pin exists matches the narration order and costs
nothing, since the sentence being read says the pin comes after.
`modeChip` is unchanged on this step and takes no beat.
Measured in real time, 300 to 2900ms read None while the first connection is still climbing under
its `src 10.244.2.50` tag, 3300 and 4200ms read ClientIP . pin .2.7.
```

### before `const SCHEME_L = 60, SCHEME_R = 1140;`

```
The two setting chips are a full-width bottom strip across this span, the grammar the rest of the
category uses. Narrow it and the strip centres on the client column instead of on 600.
```

### before `const FAN_SLOW = 1.6;`

```
One shared multiplier on the fan, and the label rides the SAME dur or it unglues (M-30). Speed stays
distance-normalized. Registered in ALLOW_EXPLICIT_DUR.
It is not the tag that the slow ride buys. The tag is cut by the zone frame and the Pod inside it for
every readable sample of every fan leg, so the multiplier lengthens the cut rather than relieving it:
1.6 times the routeDur is 1.6 times the time the reader spends with a struck-through address.
```

### poster

```
A client, kube-proxy, and two candidate Nodes each holding a Pod, with the dashed route splitting
into a fork that reaches BOTH. Neither branch is brightened and neither Node is dimmed: the
sentence is that the choice exists, not which way it went.
That is why the fork is drawn from a single point rather than as two separate lanes: one decision,
two outcomes.
```

