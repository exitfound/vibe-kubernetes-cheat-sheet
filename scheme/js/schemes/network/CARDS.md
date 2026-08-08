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

## network-client-ip-preservation

### layout

```
WHAT     Where the client IP goes when a proxy is in the path, and how X-Forwarded-For or the PROXY
         protocol brings it back.
LAYOUT   One flow line FLOW_Y 410, client -> edge proxy Pod -> backend Pod, placed low so the client
         block (the only block on the left) clears the panel.
         Narration panel bottom 355, measured over 1600x1000 / 1280x860 / 1100x800 and the deepest
         in networking. It is a header comment, not a constant: nothing in the layout reads it.
         The header panel is 260 wide centred on PROXY_CX 545, spanning 415..675, clear of the overlay
         with 16 to spare, and it is centred ON THE PROXY because those headers are what that Pod
         writes, with an ownership link and no arrowhead. Row and chip strip both span
         CLIENT_X..CONTENT_R = 65..1135.
NOTE     Four chips span the scheme 1:1, widths tuned to their content. What the backend SEES is an
         outcome of a request, so those three read none until traffic flows; the edge mode is a
         property of the setup, so it is true from the start.
DO NOT   Read `PANEL_BOTTOM = 190` as the narration panel. It is the bottom edge of the drawn
         header chip. The narration panel bottom is the measured 355 in the header comment.
MOTION   Every ball wears a riding tag, because what each hop CARRIES is the whole card: the true
         source in, the proxy source out, then the header, then the PROXY protocol preamble.
         Up-arrow on each proxied hop, the proxy is the sender: it pulses FIRST as it opens the new
         connection, and only then does the request leave carrying the proxy address as its source.
```

### before `const FLOW_Y = 410;`

```
The row sits low because the measured narration panel reaches 355 here, the deepest in networking.
FLOW_Y 410 puts the Client top at 372 and clears it, so a longer narration invalidates the row
placement rather than merely crowding it. The measurement is a header comment and not a constant,
because nothing in the layout reads it (CANON.md L-07).

NOT the same thing as PANEL_BOTTOM 190, which is the drawn header chip.
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
LAYOUT   The actor row sits at y352, just below the panel. The CNI plugin is one dashed node frame
         holding a vertical dashed spine tapping each plugin row (bridge, IPAM, result), aligned so
         its TOP tap is at the runtime row and its BOTTOM tap at the sandbox row, which keeps the ADD
         and result arrows dead straight with no mid-run jog.
         The sandbox height is tuned so its block centre lands exactly on PAUSE_Y, where the result and
         join arrows enter. That is what lets those arrows read as centred on the block without being
         moved and grazing the CNI box.
LANES    One ball walks the whole chain across the steps: CRI -> bridge -> IPAM -> result -> sandbox,
         touching every block and every dashed segment.
NOT A DEFECT
         CENTRE-LOW is OPEN here and stays open. The whole right half of the picture is a `node()`
         frame with `chainList` rows inside it, and the rule counts neither frames nor chips. The
         drawing is centred, the rule is not.
DO NOT   Shift the boxes the rule CAN see to make the number go green. That decentres the picture a
         reader actually looks at.
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
LAYOUT   client -> netfilter -> server Pod, both Pod shells on one baseline. The row spans 70..1130,
         which centres it on 600 and is why the server Pod ends on 1130 rather than 1110.
LANES    TWO stacked lanes so the ball always has a matching arrow: REQ_Y arrows point right, REP_Y
         arrows point left. The NAT rewrite happens INSIDE the netfilter box.
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
LAYOUT   Panel right <= 397, bottom <= 305, one of the deepest in the catalog. The row hangs below it:
         FLOW_Y 400, client top 325.
         The CoreDNS Pod holds the right edge (CONTENT_R 1130), so the two blocks centre the content
         bbox on 600 without a frame to lean on. resolv.conf hangs under the client and the two
         readouts stack above CoreDNS, so the chip strip spans CONTENT_L..CONTENT_R too.
LANES    Client and CoreDNS share one centre line (DNS_Y = FLOW_Y - DNS_H/2) so the query lane enters
         CoreDNS at its exact middle. Query and answer ride SEPARATE lanes offset by LANE_DY, so a
         lookup reads as a loop rather than a retrace.
WHY NOT  The client column at y 175: its whole app box and three quarters of its shell sit under the
         panel on the narrow viewports.
NOTE     Three plugin boxes symmetric about FLOW_Y (kubernetes on the line, cache above, forward
         below), leaving equal 37px margins to the pod label and sublabel. Offsets are held relative
         to the shell top (PLUGIN_Y), so moving the Pod cannot leave them behind. Order is the CoreDNS
         plugin CHAIN order (compiled into the binary), not the Corefile line order.
         clientBox is listed in resetStep by key, or the highlight a reduced replay sets in the
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
LAYOUT   Panel right <= 397, bottom <= 230 over the three OCCLUDED viewports. FLOW_Y 400 puts the Pod
         top at 335, well below it, and the resolv.conf chips take the space under it. Everything
         hangs off FLOW_Y: client Pod left, CoreDNS opposite on the right, candidate ladder in the
         free top-right band above CoreDNS. The two BLOCKS span CONTENT_L..CONTENT_R, which is what
         centres the content bbox on 600.
LANES    Query and answer on SEPARATE lanes, because the whole point is the cost of a ROUND TRIP: a
         miss is a packet out AND an NXDOMAIN back, four times over.
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
MOTION   One query is a full ROUND TRIP: the Pod pulses, the question goes out, CoreDNS lights on
         arrival, the reply comes back on the return lane, and the helper returns the ms the reply
         lands so the next attempt chains onto it. `lead` is the pause before the question leaves:
         BEAT.afterPulse for a fresh lookup, tighter for the retries of a search-list walk, which the
         resolver fires back to back.
         `pulseOnSend` is false only for those retries, where the Pod has just pulsed on the NXDOMAIN
         landing 300ms earlier and a second pulse on top smears into one long blink.
BUDGET   Four full round trips on the 380 unit lane run about 9.3s and the last NXDOMAIN pulse rings
         on to about 10.2s, so the step is 10400. DO NOT shorten it below its own motion: auto-advance
         would clip the walk halfway and the card would silently under-count the very cost it teaches.
         The budget was 9200 while the lane was 190 units, because routeDur is length-based.
DO NOT   Drop the lane-label restatements from inside the ctx.reduced guard. `roundTrip` writes both
         labels from the MOTION path, so without them the two lanes stand empty on the static path
         while the ladder and the counters carry the whole story. The walk step ends on the LAST
         candidate and its NXDOMAIN, the pair the fourth round trip leaves on the wire.
NOT A DEFECT
         The fqdn step restates the name WITH its trailing dot, so check-labels reports
         `api.ns.svc.cluster.local.` against `api.ns.svc.cluster.local` as an ambiguous pair. That
         pair IS the subject of the step: one name is absolute and the other is not.
```

### before `const CANDIDATES =`

```
Four candidates, so four round trips per address family, and the step budget of 10400 is sized off
exactly this list on a 380 unit lane. Adding a fifth candidate lengthens the walk past the budget
and the auto-advance clips it.
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
LAYOUT   Panel right <= 397, bottom <= 330, one of the longest narrations in the category. Read the
         card as an L: only the record ladder, which starts at x=710, may sit beside the panel;
         everything else hangs below y=330.
           top right : four-row record ladder (chips), ROWS_Y 56 down to 296
           middle    : client Pod -> CoreDNS on FLOW_Y 400, one straight hop, no jog
           bottom    : the FQDN band, then the question / answers chips
         Content and chip strip both span 80..1120, centre 600.
LANES    Each record row is reached by its OWN dashed wire: a trunk out of the CoreDNS right edge, a
         vertical bus at FAN_X, then a horizontal leg entering the row square-on at its left edge.
         The four wires share the trunk and diverge at the bus, and the answer ball rides ANS[i], the
         same array that drew wire i, so it tracks a visible line the whole way.
WHY NOT  The ladder below the panel with the band up top. The vertical budget below the panel fits the
         flow row, one 64 unit band and the chip strip, but not a 240 unit ladder as well. The BAND is
         then the only block that can reach the right margin, which is what puts the content bbox on
         600: CENTRE measures blocks, the ladder is chips, and CoreDNS has to stay in the middle for
         the fan to work. Same reason the band cannot move back to the top.
CONTENT  The FQDN band is the LIVE QUERY NAME and it MUTATES per step, because the whole point is that
         a different record kind is a different name. SRV prefixes _port._proto; a Pod record swaps
         the service label for the dashed Pod address AND the kind from svc to pod; headless asks the
         exact same name as A, which is the lesson. Segments light statically and never flash.
         The band spans CD_LEFT..CONTENT_R (420..1120), left-aligned with CoreDNS above it and flush
         with the right margin, its four widths in a 156:116:76:100 ratio sized by their own text and
         scaled x1.52 to fill the span.
         Neither readout repeats the band or the ladder. QUESTION is the exact qname plus type on the
         wire; ANSWERS is how many records come back, which is the whole difference between a normal
         and a headless Service (1 against one per ready Pod) and is stated nowhere else.
MOTION   One record kind per step: pulse the client, run the query along the flow line into CoreDNS,
         then send the answer out along THIS row's fan wire.
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
LAYOUT   Panel worst case x<=397, y<=230. The config band sits at y=136 and spans only the
         Service..Pod half (480..1080), so it clears the overlay and does not reach over the client
         Pod. The client / Service / Pod row sits lower at ROW_Y 286. Content stays horizontally
         centred (client and Pod symmetric about 600); only the vertical offset changes.
         The bottom info chips span the whole ROW (CLIENT_X..ROW_RIGHT, 120..1080), not the band, so
         the strip centres on 600 like the blocks above it.
LANES    Client -> Service -> Pod in equal-length hops. The config band drops into BOTH the Service
         (its ClusterIP) and the Pod (its address) as a MIRRORED PAIR about the band centre
         (CONFIG_CX +/- TAP_DX), not one tap per target centre: two lanes leaving one face at mirrored
         offsets read as a deliberate pair, and each still lands 15 units off its target midpoint,
         invisible on a 240 and a 300 wide face. Each drop shares its points with the packet that
         rides it.
MOTION   Enabling the feature is a config change with no per-object traffic, so the band just lights:
         no flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack until a
         Service opts in, so that chip does not move on the enable step.
         The Service opts in on its own step and is given a second ClusterIP from the v6 service CIDR.
         The band is the SOURCE of that ClusterIP, so it stays lit there too, matching the Pod step.
         On the connect step the client picks a family and the Service policy is unchanged: the card
         shows the client dialling the IPv6 ClusterIP and highlights that ADDRESS rather than
         overloading the ipFamilyPolicy chip with a client-side choice. The Service is on the path
         (kube-proxy DNATs here), so it lights via .highlight and does not pulse.
         Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, Pod
         pulses on arrival, and a riding label on each hop makes the chosen family visible and shows
         the DNAT, the destination rewritten from ClusterIP to Pod IPv6 on the way out.
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
LAYOUT   Flow left to right along y312 (client -> eBPF program -> backend Pod) with the BPF maps box
         ABOVE the program, mirroring the ClusterIP reference card.
         The composition spans CONTENT_L..CONTENT_R (70..1130): client Pod on the left margin, backend
         column on the right, so the content bbox centres on 600 and the three chips are one even row
         across that span.
NOTE     FAN_X is DERIVED (midway between the program right edge and the Pod left edge), so widening
         the card moves the fan turn with it rather than leaving it behind.
         The destination label sits UNDER the first fan segment, just as the rewritten connection
         leaves the program: the riding src tag rides ABOVE the ball at y312, and centring the fan turn
         put the riser under the old slot, so the dst label lives below where it never collides.
WHY NOT  The backend column stopping at 1030: that leaves the whole card 50 units left of centre.
NOT A DEFECT
         `TO_PODY` carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see the map
         lookup picked one of two, and the card says so in words. N destinations, N wires.
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
verticals and the crossbar make a table, which is the map), and two Service boxes on the right at
full and 0.45. The sentence is that the decision happens IN the kernel and the loser is still
drawn, dimmed, because a choice among one is not a choice.
Everything is dashed: on this card nothing is traffic, it is all attachment and lookup.
```


## network-endpointslice-reconcile

### layout

```
WHAT     A control-plane pipeline, not a traffic flow: Pods are watched, the controller derives the
         Ready-only address list, and kube-proxy reads it.
LAYOUT   Read it bottom to top and then right.
           Pods (the live source) --watched by--> EndpointSlice controller --writes--> EndpointSlice
           --read by--> kube-proxy
         The Service sits on top: it owns the selector and NAMES the slice, but stores no addresses.
         The slice is three valChip rows stacked between the Service and the controller; the
         controller sits below them and writes UP; kube-proxy sits to the RIGHT and reads. Service,
         slice rows and controller are all centred at x600, well right of the panel.
MOTION   The endpoint rows are the DURABLE state (setVal + .highlight) and hold the addresses. What
         MOVES rides the ball: the controller write hop carries the endpoint address it is committing,
         the kube-proxy read hop carries a short read tag. On the write step the Ready Pods are
         observed (they pulse together), then one packet goes up from the controller and the two Ready
         endpoint rows light together as it lands.
         Pod B going notReady is the whole of its step, so its shade is static end-state and belongs
         ABOVE the reduced guard, next to Pod C which is already pinned there. Below the guard, prev
         and reset draw Pod B at full brightness directly beneath its own sublabel reading notReady.
DO NOT   Pulse Pod B with plain `pulsePod` while it sits at 0.40. That pulse ramps the STROKE from the
         resting tint, which on an already dim Pod is close to invisible. It takes `pulsePodDim` with
         `from: OPACITY.notready`, which adds the opacity flash the dim variant exists for. The
         signature in anim-dump is an `opacity` track on the Pod group next to the `filter` one, with
         the peak BETWEEN the sampled percentages, because a blink returns to where it started.
```

### before `const CTLR_TOP = 350;`

```
The controller writes UP into the slice at SLICE_BOTTOM, and WRITE_PATH is built from both, so the
lane re-solves when either tier moves. Service, slice rows and controller are all centred at x600,
well right of the panel.
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
           top row (ROW_A): type ExternalName, a pure DNS alias. The client looks the name up, and
                            CoreDNS answers a CNAME that rides on toward the external host. No
                            ClusterIP and no kube-proxy.
           bottom row (ROW_B): a ClusterIP Service with NO selector. The client sends to the
                            ClusterIP, kube-proxy DNATs to a hand-attached EndpointSlice.
LAYOUT   Panel right <= 397, bottom <= 230. Both rows hang BELOW it: ROW_A 300, ROW_B 480, Pod tops
         246 and 426.
LANES    Each row is one independent ONE-WAY flow, two straight hops, no round trip and no return
         lane. Each row has its own client Pod. CoreDNS, kube-proxy and the targets are infra and
         light SYNCED to arrival.
WHY NOT  ROW_A at 254: a quarter of its Client Pod sits under the panel on the narrow viewports.
OPEN     The top band is empty by construction on wide viewports. That is the price of two full-width
         rows on a card whose panel reaches a third of the way down.
MOTION   Both rows open up-arrow: the client pulses first and the first hop leaves at BEAT.afterPulse,
         lighting the middle block on arrival, then the resolved value (a CNAME on row A, the DNAT-ed
         dst on row B) rides on to the target, which lights when it lands.
```

### before `const ROW_A = 300;`

```
Both rows hang BELOW the measured panel bottom of 230: ROW_A 300 puts its Pod top at 246. At 254 a
quarter of the row-A client sits under the overlay on the narrow viewports.
```

### poster

```
Abstract, not the literal diagram: two balanced lanes share one client column (left) and one
external-target column (right), crossing one dashed cluster edge. The whole contrast is hollow vs
solid. Top lane (type ExternalName) is a pure DNS alias: hollow client ring to a hollow resolver
ring to a hollow external host, no ClusterIP and no proxy anywhere on the path. Bottom lane
(no-selector ClusterIP) is machinery: a lit cyan VIP straight into a kube-proxy box, on to a
hand-attached EndpointSlice (dashed chip), then a DNAT hop across the edge to a lit cyan endpoint.
```

## network-externaltrafficpolicy

### layout

```
WHAT     externalTrafficPolicy Cluster against Local. Client above the LB, the LB fans to two Nodes,
         Node-1 has a local backend and Node-2 has none. In Cluster mode the packet landing on Node-2
         is SNAT-ed and forwarded across the underlay to the Pod on Node-1; in Local mode the Node-1
         path is straight.
LAYOUT   The two Nodes are the widest row, mirrored about MID_X with NODE_GAP between them, so the
         scheme spans 180..1020 and centres on 600. The chip strip spans that extent 1:1.
         Vertically: client / LB / Nodes / underlay / chips, with an equal 40 margin above the client
         and below the chips, so it centres on the canvas.
LANES    A packet stops at the Node boundary it arrives on (the top edge coming down from the LB, the
         bottom edge coming up off the underlay) and the Pod inside pulses to show it was served.
NOTE     The backend is a standard podBlock centred BOTH ways inside Node-1, on N1_CX and on the node
         rect centre, so the fan drops straight down the Pod axis onto the Node edge above it.
DO NOT   Draw a ghost Pod in Node-2 to balance the count. It would contradict its own label.
NOT A DEFECT
         CENTRE-LOW is OPEN here. The two blocks below the overlay span 255..465, centre 360, and they
         are the backend Pod and its inner box; everything else in that band is Node frames, which the
         rule ignores. The Pod cannot move to the centre: it is inside Node-1 BECAUSE Node-1 is the
         Node with a local backend, and Node-2 having none is the entire subject.
         `fan2` and `crossWire` are not bright lanes pointing into a dimmed block. This card never
         changes an opacity at all, on any of its five steps, so it has no dimmed end for a lane to
         point at. The premise is vacuous.
```

### before `const MID_X = 600;`

```
The two Nodes are mirrored about MID_X with NODE_GAP between them, so the scheme spans 180..1020 and
the chip strip takes that extent 1:1. The vertical margins above the client and below the chips are
equal, which is what centres it on the canvas.
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
LAYOUT   Panel bottom <= 330 on this card. The ownership stack is one column on STACK_CX, with the
         Gateway on FLOW_Y 380, the row a real request enters on, so the Client can sit beside it on
         the left with its top edge at 344. The GatewayClass is the only block above the panel bottom
         and lives at x >= 410.
         The Service and backend Pod hang off the HTTPRoute row to the RIGHT rather than continuing the
         column, because a fifth stacked block plus a bottom chip strip does not fit in 640 units. That
         also frees the right column for the ownership captions. Composition spans
         CLIENT_X..the Pod right edge = 40..1160, chip strip the same.
LANES    Every wire carries an arrowhead pointing the way its ball travels: CLASS_REF is a reference
         the Gateway resolves upward, the other three are the request path running down and out to the
         Pod. Gateway -> HTTPRoute is DECLARED the other way (the route names the Gateway in
         parentRefs, which is why that field is the route sublabel), but the only ball that ever runs
         that wire is a request being matched against the rules, so its head points down with the ball.
NOTE     One role caption per stack block, each on its own block row. The top two go in the right
         column, which is free at those rows. The HTTPRoute row is NOT free there (the backendRef wire
         and the Service occupy it), and a caption parked above the Service reads as labelling the
         Service, so that one goes to the LEFT of the route, where it also fills the quadrant the panel
         leaves empty. Sitting on ROUTE_CY 502 keeps it clear of the measured panel bottom of 330.
         Each chip is one real API field, which is why hostnames and match are SEPARATE: in an
         HTTPRoute the hostname lives in the top-level `hostnames` list while the path lives in
         `rules[].matches[].path`, whose default type is PathPrefix. Folding them into one match chip
         would state the spec wrongly. The request chip reads none until a request arrives.
MOTION   NOTHING flashes here, not even the packet-less gatewayclass step: a declarative object being
         installed has no motion to show.
```

### before `const FLOW_Y = 380;`

```
The Gateway sits on this row because it is the row a real request enters on, which is what lets the
Client sit beside it with its top edge at 344, clear of the measured panel bottom of 330. Raising it
puts the Client under the overlay.
```

### poster

```
Three stacked bars joined by two SOLID verticals, with a filled dot at the middle bar. The three
are GatewayClass, Gateway and HTTPRoute, and the two solid legs are what makes them one chain
rather than three objects: the dot marks the Gateway, the only one of the three that is a running
thing.
The controller hangs off the left and the backend pair off the right, both on dashed legs, because
they are outside the chain the poster is about. Their fills step 0.05 to 0.09 so the Service reads
as the destination.
```


## network-headless-service

### layout

```
WHAT     clusterIP None: no VIP hop, DNS hands back the backing Pod IPs and the client connects to a
         Pod itself. The three backends are a StatefulSet (web-0..web-2) so the stable per-Pod name
         lands.
LAYOUT   Everything symmetric about the canvas centre line CY 320. Three Pods in a column on the right
         centred on CY (web-1 ON it, web-0/web-2 mirroring); CoreDNS centred on CY too, so its fan to
         the three Pods is symmetric; the client low-left. Content spans 80..1120.
         Panel right <= 397, bottom <= 205. Everything left of 397 sits well below that (client at
         y>=420, the DNS lane turning at 310/330).
LANES    DNS: leaves the TOP of the client Pod, rises, turns into CoreDNS at 90 degrees. Query and
         answer on SEPARATE lanes 20px apart.
         Data: leaves the MIDDLE of the client's right edge, steps down at DATA_STEP_X to trunk level,
         runs under everything at y=520, and rises on its own bus at DATA_X to enter a Pod square-on.
         Drawn to ALL THREE Pods, because a headless client may pick any of them.
WHY NOT  The data trunk leaving at y=520 direct. It has to pass BELOW the Service box (430..500) while
         still leaving the Pod at its face midpoint; direct puts a lone endpoint 35 units off that
         midpoint, which is what OFFEDGE reports. Hence the step.
NOTE     The Service to CoreDNS link is the static fact that this Service backs those records, drawn
         as a bare path because `arrow()` always attaches a marker: an arrowhead here reads as
         traffic.
         The ENDPOINT fan carries no arrowhead and no packet in either direction: CoreDNS never calls
         a Pod, and the read that populates the answer comes from the EndpointSlice, which this card
         does not draw. Dropping the head also settles a direction it had wrong, CoreDNS -> Pod while
         the narration says CoreDNS READS the endpoints. The DATA fan beside it keeps its heads and
         its balls: two fans that looked alike and meant different things was the defect.
         Each chip sits directly UNDER the column it reports on and shares that column's exact x and
         width: clusterIP under the client (80..290), the DNS answer under CoreDNS and the Service
         (430..680), the connection under the Pods (880..1120). So the footer spans the diagram end to
         end and every chip edge lines up with the blocks above it.
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
nothing) but the DNS reply itself, a sheet of three A records. Each record leaves on its own leg to
its own Pod, so the record count and the Pod count are visibly the same number, which IS headless.
```

## network-hostnetwork-hostport

### layout

```
WHAT     The two sanctioned ways out of a Pod having its own namespace, IP and veth. One Node seen
         from the LAN side.
LAYOUT   A strict three-column grid, so nothing sits at a random x.
           COL1 (cx 240)      COL2 (cx 600)      COL3 (cx 960)
           portmap rule       Node eth0          (empty: the lane to the agent runs through it)
           Pod app            cni0 bridge        Pod node-agent
         Each block sits under or beside the block it belongs to: the rule above the Pod it maps to,
         the bridge under the NIC that routes into it, and the hostNetwork Pod alone in a column
         because it hangs off nothing.
         The Node spans the full width and its frame starts at 305, just under the panel, running to
         570, as deep as the chip strip allows. The client is the only block above the Node and sits
         at x >= 450, dead centred on the NIC so the entry hop is one clean vertical.
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
MOTION   The two reflective steps carry no motion at all: they compare, they do not move traffic.
         Down-arrow chain on the hostPort step: the request lands on the NIC and is matched by the
         portmap rule, and the rewrite happens INSIDE that box, so the ball re-emerges at its bottom
         edge already carrying the Pod address and only then joins the ordinary path, bridge then
         veth, with the Pod pulsing on arrival.
```

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;`

```
The Node frame is the outer extent and the three column centres are spaced inside it. NODE_Y 305 is
what puts the frame just under the panel, and the client above it sits at x >= 450 only because of
that. Raising the frame puts its top-left corner and the portmap box under the overlay.
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
LAYOUT   Everything hangs off FLOW_Y, the midpoint between the rules panel bottom and the chip strip
         top. The web and api branches are exact mirrors at FLOW_Y -/+ ROW_DY, so each fan leg,
         Service and backend Pod share one row.
         The rules panel is centred ON THE CONTROLLER (RULE_CX == CTRL_CX), since the rules are what
         that Pod watches, and the ownership wire rises straight up from the controller top centre
         into the panel centre, no arrowhead, so the two read as one column. Four columns span
         LB_X..the Pod right edge = 40..1160.
WHY NOT  CTRL_CX at 485. The panel really covers x 0..399, y 0..190, so a centred panel must start
         past 399: at CTRL_CX 485 the widest overlay-clearing centred panel is 150 and the rule chips
         need 234. CTRL_CX 545 admits a 260-wide panel (415..675) with 16 to spare. Centring the
         panel on the controller is what FORCES the controller rightward.
NOTE     The Ingress controller Pod is a standard podBlock, the same shell as the web and api
         backends, rather than an oversized box.
         Three chips span the scheme 1:1, widths tuned to their content (TLS carries the longest
         value). Host and path are properties of the REQUEST being served, so they read none until
         one arrives.
DO NOT   Put the branch wire labels in the FAN_X..SVC_X gap. It is 40 wide and the text prints
         straight through the Service border. They sit clear of the Service box they name, above the
         web one and below the api one, mirrored.
MOTION   On the tls step the Host and path are on the wire and so are known, but NOT highlighted: the
         controller reads them in the next step, this one only terminates TLS, and no rule has
         matched so both branches stay neutral.
         Up-arrow on the proxy step, the controller is the sender: it pulses FIRST as it matches the
         rule, and only then does the proxied request leave at BEAT.afterPulse, riding the
         right-angle fan to the Service and hopping on to the backend Pod, which pulses on arrival.
```

### before `const FLOW_Y = 343;`

```
Derived as (RULE_BOTTOM + CHIP_Y) / 2, so the whole flow re-centres when the rules panel or the chip
strip moves. The web and api branches are FLOW_Y -/+ ROW_DY, so both fans, both Services and both
backend Pods follow it.
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
LAYOUT   The Service sits alone on top, the Node row carries the whole flow on FLOW_Y 405, and the
         underlay lane below the Nodes carries the cross-node hop. The Node row starts at 312 and the
         Service, the only block that high, lives at x >= 450.
         Node-1 is wide because it holds the whole local path (client, dataplane, local backend);
         Node-2 only holds the remote backend. The two span 40..1160, chip strip the same 1:1.
LANES    The cross-node leg starts on the Node-1 BOTTOM edge (the packet has left the Node by then)
         and ends on the Node-2 bottom edge, and the Pod inside pulses to show it was served.
         The ownership marker from the Service is a RAW path, because `pathArrow` always carries a
         head, and it STOPS on the Node top edge rather than reaching into kube-proxy: the Service is
         an API object living outside any Node, and what it programs inside one is the Node's
         business. N1_CX and KP_CX happen to be the same 390, so it still reads as landing on the
         dataplane.
NOTE     Four chips span the scheme 1:1 with even 20px gaps. The policy is a property of the Service,
         so it is true from the start; the scope, the hop and the result are outcomes of a call, so
         they read none until traffic flows.
         resetStep lists the inner app boxes by key and returns every Node and Pod to full opacity,
         so a dim set by one policy cannot leak into the next step.
MOTION   Up-arrow on both flows: the client Pod is the sender, so it pulses FIRST and the packet
         leaves at BEAT.afterPulse carrying the ClusterIP, and kube-proxy lights as it catches it.
         The DNAT happens INSIDE that box. Under Cluster the ball re-emerges BELOW it on the Node edge
         carrying the remote Pod address, and the remote backend pulses as the underlay leg lands on
         its Node. Under Local the DNAT resolves to the local Pod, so the ball leaves the FAR edge of
         kube-proxy and never leaves the Node.
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
LAYOUT   Panel right <= 397, bottom <= 255. The controller column (cluster CIDR -> kcm) is centred at
         x460..740 so it clears the overlay; the three Nodes fill the y312..602 band and span 80..1120,
         centred on 600.
         Every x is derived from NODE_X / NODE_CX, so the Node columns, their slice chips, their Pods
         and the allocation bus cannot drift apart.
LANES    The two side allocation arrows turn at right angles: down from the controller to a shared
         branch level, then horizontally out to the node, then down into its podCIDR chip. The centre
         arrow stays straight. Every arrow is DIM dashed with no colour override so the bright ball
         reads on a muted wire, and they sit ABOVE the blocks so the node rects cannot hide them.
         The Node-2 IPAM hand-out is revealed only on the final step, so its arrow starts hidden.
MOTION   The kcm carves a slice into each node.spec.podCIDR in ONE reconcile pass, so all three packets
         leave together and share one travel time, registered in ALLOW_EXPLICIT_DUR: the short centre
         path and the long side paths reach their slice at the same moment, the centre simply moving
         slower.
         On the final step Node-1's Pod keeps its settled IP with no highlight and the action is on
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
ONE shared travel time for all three allocation packets, registered in ALLOW_EXPLICIT_DUR. The kcm
carves every slice in one reconcile pass, so they must LAND together: routeDur is length-based and
would land the short centre path first.
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
         Panel bottom <= 280, so AXIS is 352 and the Client Pod shell (AXIS +/- 64) clears it.
         SCHEME_L 40 .. SCHEME_R 1160 mirrored about CX 600, three chips 350 wide with even gaps so the
         strip centres on 600 by construction.
NOTE     The chain row does NOT centre on 600: its boxes sit ABOVE the panel bottom, so the row has to
         start right of the panel edge and ENGINE_L is pinned at 420. That asymmetry is paid for by the
         client on the left and the backend column on the right, which is what puts the CONTENT bbox
         on 600.
MOTION   The inactive lane dims on each mode step. Wires and packets ride only the GAPS and stop at box
         edges.
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
LAYOUT   Vertically: client, router, fan bus, Node row, chip strip. The Node row starts at 310 and the
         client and router, the only blocks above 300, sit at x >= 450.
         The three Nodes are the widest row, mirrored about MID_X, so the scheme spans 50..1150 and
         centres on 600. The chip strip spans that extent 1:1.
NOTE     Four chips with even 20px gaps. The pool is declared by the operator but means nothing until
         an implementation exists, and the mode and the path are outcomes of announcing, so all three
         read none at the start.
         resetStep lists the inner app boxes by key and returns every Node and Pod to full opacity, so
         the dim the failover step puts on Node-1 cannot leak into a later step.
MOTION   An address is allocated by a WRITE, not by a packet: the alloc step moves nothing and flashes
         nothing, its two chips simply light. Same reading as a declarative object being installed.
         The BGP step runs three separate client flows, staggered so they read as three, each hashed
         by the router onto a different Node whose Pod pulses on arrival.
DO NOT   Add riding tags to those three flows. All three carry the same destination, and three copies
         of it sweeping over the router at once is noise rather than information.
CONTENT  The l2 narration carries the premise the card cannot do without: no cloud-controller-manager,
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
LAYOUT   The kubelet box sits centred above the band and keeps its own higher raise, so the gap
         between it and the band is wider. Band, Pods and chips are raised by RAISE.
         Pod centres run left to right with equal end-margins and inner gaps, so the four blocks sit
         symmetric about the band centre 600 with no overflow. The cross-Node hop runs A -> C.
NOTE     The CNI badge is tucked under the RIGHT END of the band, its right edge on SCHEME_R 1080,
         and its connector is a straight drop from the badge bottom-centre onto the bus spine INSIDE
         the band, which is the line it was always aiming at rather than a dogleg into the face.
WHY NOT  The badge parked outside the band: the content bbox can then never centre, because the
         badge always adds CNI_W/4 to the centre no matter how the band is sized.
LANES    A flat dashed bus INSIDE the band: a horizontal spine with a short tooth turning down toward
         each Pod, so it abuts every Pod drop-wire at the band edge. No arrowheads on the bus; the
         bidirectional arrows live on the Pod wires. This is the one place a line sits BELOW blocks
         rather than above.
MOTION   Pod-to-Pod is up-arrow: the sender pulses first, the packet leaves at BEAT.afterPulse and
         rides the band to the far Pod, which pulses on arrival. A src-IP tag rides WITH the packet
         and arrives UNCHANGED, which is the no-NAT point made visible.
NOTE     The src tag belongs to the Pod-to-Pod steps only. The agent path is not a Pod source, so the
         chip is cleared rather than left holding a stale 10.244.1.5, and it stays highlighted
         because the value CHANGES there.
NOT A DEFECT
         CNI_CONNECTOR IS animated, with `marchWire` rather than a ball: this card's vocabulary for
         "this is what implements the model". No packet rides it because nothing DISCRETE travels,
         the plugin is not sending a message, it is the thing that makes the flat space exist.
```

### before `const RAISE = 64;`

```
Band, Pods and chips all move with RAISE, while the kubelet keeps its own higher KUBELET_RAISE, so
the gap between it and the band is deliberate rather than left over. Pod centres are spread with
equal end-margins inside SCHEME_L..SCHEME_R.
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
LAYOUT   The host stack and the Pod namespace line up so the veth reads as a straight
         cross-namespace link landing dead on eth0, and the host block is vertically centred on the
         Pod netns block.
           Host netns ..veth..> [ Pod netns ]
         Inside the shell every block plugs into ONE shared stack, drawn as a dashed rail across the
         stack band. eth0 (the in-Pod end of the veth) and lo hang off the rail from below; the two
         tenant containers tap it from above. The band, rail and taps live in podGroup, so they
         pulse as one unit with the Pod.
LANES    Every dashed line, the veth and all five interior taps, is drawn ONCE in the same constant
         dim-dashed style and its opacity is NEVER changed per step. Progression shows only through
         `.highlight` and the packets riding the connectors.
MOTION   fresh     only lo is live: lo lights and flashes, nothing flows yet
         veth      a packet crosses the veth, eth0 lights on arrival, the Pod pulses
         shared    app, sidecar and eth0 light, and one localhost packet rides app -> rail ->
                   sidecar, dropping down the app tap, crossing the rail and climbing the sidecar
                   tap, so it traces both joins and the localhost hop in a single motion. lo, the
                   loopback that serves it, lights on arrival
         isolation host, eth0 and lo stay lit, the whole shared stack pulses as ONE private unit
                   that lives and dies together
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
         never doubles back on it.
         The five chain blocks span the Node 1:1, from the PREROUTING left edge (70) to the eth0 right
         edge (1140) with even gaps, and the chip strip spans exactly that. The conntrack table sits
         under the four hooks it belongs to (70..950) and stops where the wire begins, because a packet
         on the wire is past it.
         The Node frame starts at 305 and the client Pod, the only block above it, sits at x >= 450.
         Its packet drops straight down and only turns left once it is INSIDE the Node.
LANES    The reply rides its own lane (RETURN, y 360) ABOVE the chain rather than retracing the forward
         wires backwards.
         CT_LINK is a BRACKET, not a stub: it leaves PREROUTING at its bottom-edge midpoint, steps
         across in the gap between the two rows, and lands on the conntrack table's own top-edge
         midpoint (510). Same shape on network-north-south-path.
WHY NOT  A straight stub from PREROUTING: it lands 335 units off that midpoint, which reads as a lane
         pointing at nothing in particular and is what OFFEDGE reports.
NOTE     Four chips span the SCHEME 1:1, edge to edge with the Node frame (40..1160), the widest element
         on the canvas, so the strip and the frame share both verticals and the composition reads as
         one column. hook is where the packet is right now, dst and src are what it carries there, and
         conntrack is what the kernel remembers about it. All four are outcomes of a packet in flight,
         so they read the values it starts with and the steps rewrite them exactly where the kernel does.
MOTION   The closing eBPF step carries no motion at all: it is a comparison, not traffic. resetStep
         returns every dimmable block to full opacity so the dim it puts on the chain cannot leak into
         a replay of an earlier step.
```

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;`

```
The five chain blocks span this frame 1:1 and the chip strip spans the frame itself, so the strip and
the frame share both verticals. Changing NODE_W re-solves the chain spacing and the strip together;
changing only one breaks the single-column reading.
```

### before `const CHIP_W = [270, 320, 260, 210];`

```
Four UNEQUAL widths, each sized for its own longest value, summing with the gaps to the frame span.
They are not a computed row: editing one value without re-measuring is what check-chipfit catches.
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
         it on the right, everything centred on FLOW_Y 300.
         Content spans x 70..1120 (centre 595) and y 200..484. It cannot go higher: the Node box
         starts at x=70, under the panel, whose longest step here reaches y=163 measured. 200 leaves
         about 37px of clearance.
LANES    TWO hops, each with its OWN pair of lanes: query out on FWD_Y, answer back on RET_Y.
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
LAYOUT   One Node grid drives everything: three frames of 300 spanning SCHEME_L 80 .. SCHEME_R 1120,
         and NODE_CX centres the nodePort chip, the backend Pod and the bottom info chip of each column.
NOTE     The two backend Pods sit on the OUTER Nodes (1 and 3), not on 1 and 2. That is what puts the
         low-block bbox on 600, and it also puts the Pod-less Node in the MIDDLE, where the nodePort
         step wants it (`even on Nodes that run no backend Pod`). The Node-3 Pod IP is 10.244.3.9 so
         the per-Node CIDR the card sets up by example still holds.
MOTION   A packet-less pod-less step gets one box flash.
         client -> LB (down), then the LB picks Node-1 along the right-angle fan and the nodePort
         lights. The tag on the LB leg names the Node and its nodePort, since the balancer has already
         rewritten both. Each leg only shows the text in the OPEN GAP between blocks: it emerges from
         the client into the first gap, vanishes into the LB, then re-emerges out of the LB bottom and
         rides the fan, never sliding the text over the LB itself.
NOT A DEFECT
         `TO_N2` and `TO_N3` carry no ball on a given step. A NodePort opens the SAME port on EVERY
         Node, which is the card's whole first claim, so all three lanes have to exist for the reader
         to see that any Node would have served the request. One step takes one of them, and which one
         is the arbitrary part. `network-headless-service`'s `TO_W2` is the precedent.
```

### before `const CX = 600;`

```
The client, the LB and the fan origin sit on CX, and the three Node frames are spread symmetrically
inside SCHEME_L..SCHEME_R. NODE_CX then centres the nodePort chip, the backend Pod and the bottom
info chip of each column, so one grid drives every tier.
```

### poster

```
External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
fan down to three Nodes, backend Pods only under two of them (the third Node runs no Pod).
```

## network-north-south-path

### layout

```
WHAT     NORTH-SOUTH is the name of the thing being drawn: traffic crossing the cluster boundary, as
         opposed to east-west Pod to Pod traffic.
LAYOUT   Instead of a bare full-height divider, the composition is framed by TWO faint regions: an
         outside-the-cluster box on the left holding the client and cloud LB, and the Node box on the
         right holding kube-proxy, conntrack and the Pod. The empty GAP between them IS the boundary
         (EXT right 492 .. Node left 540), and the ball visibly crosses it once in and once out. Both
         regions share one top and height so they read as a matched pair, and both use the `node()`
         primitive so they are barely-visible dashed containers; the outside one carries its title at
         the BOTTOM-left instead of the top, so the narration overlay never hides it.
         The client and LB sit at y >= 315 while the regions frame up to REGION_TOP, which fills the
         top of the canvas and pulls the whole scheme up and centred. Framed diagram and chip strip
         both span 22..1176, so the scheme reads as one column.
LANES    Two lanes, FWD_Y above and RET_Y below the spine, because this is a ROUND TRIP. Every block
         on the path is centred on FLOW_Y, so both lanes meet every block on its edge.
         CT_LINK is a BRACKET: kube-proxy bottom-edge midpoint, across the gap between the rows, onto
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
LAYOUT   A Node box holds the client Pod and the MASQUERADE box; the Internet box sits OUTSIDE it in
         its own right-hand column, its top LEVEL with the Node frame (NET_Y = NODE_Y), above the
         egress lanes.
         The Node left edge and the Internet right edge line up with the leftmost (src) and rightmost
         (dst) chips below, so the top row and the info strip share extremes.
LANES    Forward and return ride SEPARATE parallel lanes, both INSIDE the box heights so a ball never
         travels under a box. The SNAT and the reverse SNAT happen INSIDE the masquerade box.
         The forward leg is one right-angle path: out from MASQ_RIGHT along FWD_Y, then up at FWD_UP_X
         into the Internet box bottom. The return mirrors it on the lower lane, down at RET_DOWN_X then
         back along RET_Y into the masquerade box (reverse SNAT inside), which lights on arrival with
         the node IP the reply still carries riding along. Both ends sit at block edges.
WHY NOT  The Internet box lifted to y110, above the measured panel bottom of 181. The three blocks that
         DO sit below the panel then span 110..630 and centre on 370: CENTRE-LOW. Levelling it with the
         Node frame is what puts that row on 600, and the forward leg still turns UP out of the Node
         into it.
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
         The inner row is CENTRED IN ITS FRAME by DERIVATION, not typed x values: INNER_W = Pod shell
         + veth run + bridge column, and POD_X = NODE_X + (NODE_W - INNER_W) / 2.
WHY NOT  The row at 150..960 inside a frame spanning 80..1120: that is 70 of margin on the left
         against 160 on the right, which CENTRE-LOW reports as a bbox centred on 555.
NOTE     Z-order, bottom to top: Node background, the boxes, then the wires and their labels ON TOP of
         the boxes (so a connector crossing a box stays visible and the text is selectable), then the
         value-chip strip, and finally the packet layer so the ball rides above everything.
MOTION   No pulses on this sequence, just persistent highlight borders like the workloads cards: the
         app block lights first and stays lit, then the loopback ball travels, then the pause block
         lights on arrival.
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
LAYOUT   The two blocks are positioned over the chip strip below: the client Pod centred over the
         leftmost chip (path) at centre x205, and the Pod shell spanning the two rightmost chips (bind
         + Pod IP), x620 to x1120. They share one vertical centre y334, so the external lane between
         them is a straight centred horizontal hop.
         Inside the shell a symmetric 2x2 grid holds the two containers up top (app, sidecar) and the
         two shared interfaces down low (eth0, lo).
LANES    Two: the localhost lane (app <-> sidecar, y262) never leaves the Pod and is served by lo, and
         the external lane carries outside traffic across the gap to the shared eth0 in one straight
         centred hop. The destination address rides ON the ball, so there is no static inline label to
         collide with anything.
MOTION   Pod to Pod: the sending client pulses first, the packet leaves at BEAT.afterPulse and rides
         that hop carrying its dst address. On arrival the receiving Pod pulses, and the shared eth0
         plus the answering app light.
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
LAYOUT   Topology band y220..450 carries both Nodes, each with a Pod and the node cni0 dataplane box.
         The physical underlay runs BELOW the Nodes at UNDERLAY_Y. The chip strip at y538 spans
         exactly Node-1's left edge to Node-2's right edge.
         The Pod and cni0 blocks are spaced so the veth wire label fits in the gap without touching a
         block, while cni0 stays inside the Node.
LANES    The cni0-to-cni0 link is ONE continuous turning path (cni1 bottom -> underlay -> cni2 bottom),
         not three arrows, and both ends sit on block bottom EDGES so the ball never travels under a
         cni0 box. Short veth hops use `segmentPacket` (linear); the cross-underlay leg uses
         `routePacket` over the SAME array as the underlay `pathArrow`.
NOTE     Z-order, bottom to top: Node backgrounds, then the cni0 boxes and Pods, then the wires and
         labels ON TOP of the blocks, then the chip strip, and finally the packet layer. The ball never
         overlaps a block anyway (every hop lives in a gap and stops at a block edge), so no occlusion
         trick is needed.
MOTION   Up-arrow: A pulses first, then the packet travels the full Pod A -> Pod B journey as three
         wire-only hops. Each hop ends at a block edge and the next starts from the block's far edge,
         so the ball visibly enters a cni0 and re-emerges on the other side.
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
LAYOUT   Topology band y255..505 carries the Node, both Pods and the cni0 bridge; the chip strip sits
         at y540, below everything and clear of the overlay.
LANES    The veth pair is drawn as TWO directional lanes, symmetric about the block centre: the top lane
         (TOP_Y) carries A -> B (ARP request and data frame), the bottom lane (BOT_Y) carries B -> A
         (the ARP reply).
MOTION   A pulses FIRST and fully, and the request ball departs only once that blink has landed
         (BEAT.afterPulse), per the up-arrow choreography. The ARP exchange is a round trip: the request
         floods A -> bridge -> B on the top lane, then B unicasts its reply B -> bridge -> A on the
         bottom.
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
LANES    One horizontal DISTRIBUTION RAIL per fork, mirroring ipam-pod-cidr. The pool forks on the y230
         rail to each band centre; the bands fork on the y428 rail to their Services. Every drop lands
         on a box centre. Every wire is dim dashed and sits ABOVE the blocks so the bright ball reads
         on a muted line, and the add-on CIDR feed is hidden until the extend step.
         Services sit on an even 260 / 600 / 940 grid, edges flush with the band bar (120..1080). The
         add-on CIDR is stacked directly over the web column (x940), so add-on -> dynamic band -> web
         read as one vertical line on the extend step instead of a stray top-right box.
MOTION   There are no Pods on this card, so motion is packets plus box `.highlight` plus an arrival
         ripple. Nothing pulses.
NOTE     The IPAddress chip is a FULL-WIDTH bottom strip (SCHEME_L..SCHEME_R). A lone 280-wide chip at
         800..1080 is a chip strip centred on 940, and its value (10.96.137.42 . default/web) did not
         fit beside its own name in 280: the one chipfit collision the catalog carried. The binding to
         web is not lost, because the value names the Service.
```

### before `const SCHEME_L = 120, SCHEME_R = 1080;`

```
Services sit on an even 260 / 600 / 940 grid with their edges flush to this band, and SVC_GAP is
solved from it rather than typed. The IPAddress chip spans the same band, which is what stops it
from being a lone chip centred on 940.
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
         the same L/R/CX the Workloads canon uses. Everything derives from those three: the client
         on SCHEME_L, the ClusterIP and kube-proxy column mirrored about CX, the backend column
         flush on SCHEME_R, and the two fan buses offset from KP_RIGHT.
         The two backend Pods sit SYMMETRIC above and below FLOW_Y, podY the exact vertical mirror
         of podX. The virtual ClusterIP is lifted ABOVE kube-proxy: it owns no interface, the packet
         never reaches it, kube-proxy intercepts.
LANES    Each backend is wired by a forward fan (kube-proxy -> Pod) and a return fan of identical
         shape, so the arrows travel the same on top and bottom and always meet a Pod at its left
         edge, and podY's pair is the vertical mirror of podX's. Forward and return on separate
         lanes. The DNAT and the reverse NAT happen INSIDE kube-proxy. Flow 1 runs to podX
         (send/dnat/reply), flow 2 to podY (balance/balance-reply).
         The vip-to-kproxy link is an OWNERSHIP marker with no arrowhead: kube-proxy REALIZES this
         virtual IP, and the ClusterIP never appears on a wire.
NOTE     The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225
         / 215), each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs
         the widest cell. Four cells in one row cannot all reach the 350 floor a bottom strip
         normally wants, and this row predates that floor; check-chipfit measures it clean, which is
         the test that matters. The leftmost starts at the Client Pod left edge and the rightmost
         ends at the backend Pod right edge, so the strip spans the block width 1:1.
MOTION   This card glides its packets 10% slower than routeDur, through an explicit dur registered in
         ALLOW_EXPLICIT_DUR. Only the BALL TRAVEL is slowed: pulses, hops and step floors stay on the
         canon, so the overall process matches every other card, and riding labels take the same
         slowDur so they stay locked to the ball.
         Down-arrow on a DNAT: the rewritten packet EMERGES from kube-proxy, because the rewrite
         happened inside it, and rides the forward fan to the chosen Pod, which pulses on arrival,
         with the rewritten Pod IP riding along.
         Up-arrow on a reply: the Pod pulses, the reply carries the Pod source IP to kube-proxy,
         which lights as it reverses the NAT INSIDE the box. The ball hides at the right edge and
         re-emerges at the left carrying the restored ClusterIP source, then runs home to the client.
NOTE     On the dnat step the backend Pods are NOT highlighted: nothing has been DNAT-ed to them at
         that stage and they light only when a flow lands on them. Only kube-proxy is the actor, and
         the endpoint IPs its rules point at are named in the DNAT chip.
         clientBox, podXBox and podYBox are listed in resetStep by KEY so their .highlight is cleared
         every step, and both Pod opacities reset to 1 so a dim set by an earlier flow cannot persist.
```

### before `const CX = 600;`

```
The three extents the rest of the category copies. Every block on this card is derived from CX,
SCHEME_L and SCHEME_R, so moving one of them moves the client, the kube-proxy column, the backend
column and both fan buses together. The chip strip does NOT follow: its four widths are sized to
their own longest values, so re-run check-chipfit after any change here.
```

### before `const SLOWMO = 1.1;`

```
The 10% glide, and the only explicit dur on this card. Registered in ALLOW_EXPLICIT_DUR: dropping
the registration fails check-canon, and dropping the constant while leaving the riding labels on
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
LAYOUT   One straight left-to-right flow along FLOW_Y, client Pod -> Service -> backend Pod, so every
         hop is a crisp horizontal `segmentPacket` (linear).
LANES    ONE-WAY: no reply is shown, so there is no return lane.
MOTION   The translation happens INSIDE the Service box: the ball fades in at the Service left edge on
         the dial hop, the map step flashes the box where the rewrite lives, then the ball re-emerges
         from the right edge on the deliver hop, down-arrow, and the backend Pod pulses on arrival.
         The client dials web:80 on the dial hop, and the named-port resolution http -> 8080 rides the
         deliver hop. The chip strip tracks the four port numbers as fixed facts.
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
LAYOUT   The Client sits left on the centre line facing kube-proxy in the middle, with two backend Pods
         on the right: web-a (stays Ready, top) and web-c (being retired, bottom).
LANES    Two right-angle fans from kube-proxy to each Pod: out horizontally, up or down the shared bus,
         then straight into the Pod left edge at 90 degrees.
NOTE     The bottom chip strip is the endpoint state that actually drives routing: web-c's endpoint
         conditions (ready / serving / terminating), where new connections may land, and the
         grace-period window.
MOTION   Each hop tags itself `new conn` or `in-flight` via a riding label. web-c dims as it leaves the
         serving set and that dim is HELD across every later step, so the fade never reads as a new
         state, but it keeps a serving flow during the drain window.
         The drain step runs two flows at once: the in-flight connection keeps draining to web-c, which
         pulses through its dimmed state on arrival, and as it lands a fresh connection starts from the
         client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
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
WHAT     A MAP card, not a traffic flow: five Service types on the left pointing straight across to what
         each one targets. ClusterIP, NodePort and LoadBalancer all proxy to the same shared backend
         node (they stack, each building on the one above), while ExternalName and Headless are the odd
         ones out (no proxy, no selector) and point at their own boxes.
LAYOUT   No round trip, no return lane and no bottom chip strip. The type column and the target column
         sit symmetric about x600 (210..990).
         The type column starts at x210, LEFT of the panel's right edge, so the rows clear the panel by
         HEIGHT instead: ROW0 is 186 because the panel measures bottom <= 181 here.
WHY NOT  ROW0 at 132: the top ClusterIP row is then 46% under the panel. Moving the columns right
         instead of down: measured, and it puts the content bbox on 740.
LANES    Every arrow is a straight horizontal hop at its row centre. Exits are centred on the type box
         right edge, entries on the target left edge. The three proxy entries land on the backend node
         symmetric about its vertical centre (221 / 309 / 397 about 309), so the fan reads balanced
         with no angled lines.
MOTION   Each hop carries a short riding label tagging the MECHANISM the row uses (via kube-proxy for
         the three proxy types, CNAME for ExternalName, Pod IP direct for Headless).
         The three proxy rows forward to a backend, so they read down-arrow: packet first, then the
         receiving Pod pulses on arrival. ExternalName and Headless target BOXES, not Pods, so there is
         no pulse there, only the arrival ripple plus the target box lighting.
```

### before `const TYPE_X = 210, TYPE_W = 280;`

```
The type and target columns sit symmetric about x600 (210..990). TYPE_X is LEFT of the panel's right
edge on purpose: the rows clear the overlay by HEIGHT instead, which is what ROW0 186 pays for.
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
LAYOUT   The flow runs left to right along y312, external client -> Ingress controller -> backend Pod,
         with the TLS Secret sitting ABOVE the Ingress as the source of the certificate.
MOTION   Decryption happens INSIDE the Ingress box. The client and Ingress are infrastructure and only
         light; only the backend Pod pulses.
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
WHAT     trafficDistribution PreferClose: kube-proxy preferring a same-zone endpoint, and what happens
         when the zone has none.
LAYOUT   Panel bottom <= 255, so the client sits on the left below it, on SCHEME_L. The whole flow is
         centred on y=320 (client -> kube-proxy -> zones) and on x=600, with the client and the two
         zones symmetric about y=320.
         The two setting chips are a full-width BOTTOM strip, two 530-wide cells spanning SCHEME_L 60
         .. SCHEME_R 1140, which is the grammar the rest of the category uses.
WHY NOT  The setting chips stacked under the client. That puts the chip strip at 120..440 and centres
         it on 280, and no arrangement in that left band can reach x=600, because the zone frames own
         everything right of 740 from y340 down.
LANES    Each zone stacks its two Pods VERTICALLY, so the fan from kube-proxy reaches every Pod at its
         own left edge over a shared vertical rail at x=700, with no route crossing another Pod.
MOTION   The fan is deliberately slowed (`routeDur * FAN_SLOW`) so the riding source-IP tag stays
         readable, and the label rides the SAME dur so it stays locked to the ball. Speed stays
         distance-normalized: one shared multiplier, registered in ALLOW_EXPLICIT_DUR.
         The zone step runs TWO client hops, the second staggered by 540, because the narration says
         two connections from the same client can land in different zones. Duration 4600 for a 4412ms
         span.
DO NOT   Fire both fans at the identical delay off ONE client hop. That reads as a single connection
         being split across two backends, which is the one thing a connection cannot do.
         Add a second Pod pulse there. `PULSE_POD.ms` is 900 against a 540 stagger, so the second would
         composite over the first on the same element, and `session-affinity` already establishes one
         pulse per step with two rides.
NOT A DEFECT
         `FAN_A2` carries no ball on its step. It is the endpoint the traffic distribution did NOT
         pick, and the point of the card is that the choice was made among the drawn candidates rather
         than forced. Same basis as the nodeport fan.
```

### before `const SCHEME_L = 60, SCHEME_R = 1140;`

```
The two setting chips are a full-width bottom strip across this span, the grammar the rest of the
category uses. Narrow it and the strip centres on the client column instead of on 600.
```

### before `const FAN_SLOW = 1.6;`

```
One shared multiplier on the fan so the riding source-IP tag stays readable, and the label rides the
SAME dur or it unglues. Speed stays distance-normalized. Registered in ALLOW_EXPLICIT_DUR.
```

### poster

```
A client, kube-proxy, and two candidate Nodes each holding a Pod, with the dashed route splitting
into a fork that reaches BOTH. Neither branch is brightened and neither Node is dimmed: the
sentence is that the choice exists, not which way it went.
That is why the fork is drawn from a single point rather than as two separate lanes: one decision,
two outcomes.
```

