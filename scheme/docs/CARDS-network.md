# Scheme card design notes: network

The per-card design record for `js/schemes/network/`. It answers what the code cannot: why a number
is what it is, which alternative was measured and failed, and what must not be "fixed". The
constants themselves live in the card and are not repeated here.

**The category contract is NOT here.** Only Pods pulse, a ball rides a drawn wire built from the
same array, a round trip gets two lanes, an unridden wire carries no arrowhead, addresses ride the
ball, traffic stops on a Node edge: all of that is in `js/schemes/network/CLAUDE.md` and applies to
every card. A note below only records where a card DEVIATES from it or needs a number explained.

Sister files: `CARDS-<category>.md` for the other three categories, `INTERNALS.md` for the shared
sources (catalog, kits, CSS).

**Not deployed.** Three exclusions keep `scheme/docs` out of production and all three must hold:
`deploy.yml` runs `rm -rf _site/scheme/tools _site/scheme/docs`, `release.yml` lists
`"scheme/docs/*"` in the zip's `-x` list, and `.dockerignore` lists `scheme/docs`. The last is not
optional, because `Dockerfile` is a blanket `COPY . .`. Verify with
`curl -s -o /dev/null -w '%{http_code}' http://localhost:8080/scheme/docs/CARDS-network.md`,
which must return 404.

**HOW TO READ THIS FILE.** (Deliberately not a `##` heading: every `## ` here is a card id, and
`check-notes` parses it that way. A second-level heading anywhere else is reported as an orphan.)

One `## <card-id>` section per card. Each ``### before `<line>` `` holds the note for one line of
code, and `check-notes` verifies the anchor still occurs in the card, so an anchor is DATA: never
reword one. On most networking cards the whole-card description hangs off the FIRST anchor, which
is that card's layout constant. `### note (anchor dropped: ...)` is a note whose target line is not
unique in the file; `### poster` describes the grid thumbnail.

The labels, in this order, only the ones that apply:

| | |
|---|---|
| `WHAT` | what the card draws, in one sentence |
| `LAYOUT` | the measured panel and the geometry that follows from it |
| `LANES` | wire topology, and which array feeds both the wire and the ball |
| `MOTION` | pulse and packet order, durations where they were sized deliberately |
| `WHY NOT` | an alternative that was measured and fails, with the number that kills it |
| `DO NOT` | a constraint, with the defect it prevents |
| `NOT A DEFECT` | something a lint or a reader reports that is correct as drawn |
| `OPEN` | known and unresolved |

Panel extent is per card. The right edge is `x<=397` catalog-wide, but the BOTTOM ranges 171 to 504
and moves with viewport width non-monotonically, so a `PANEL_B` in a card is a measurement, not a
convention. Re-measure with `node check-geometry.mjs --rules=occluded` over 1600 / 1440 / 1280 /
1100 after any narration change.

---

## network-client-ip-preservation

### before `const FLOW_Y = 410;                            // Client top lands at 372, clear of PANEL_B`

```
WHAT     Where the client IP goes when a proxy is in the path, and how X-Forwarded-For or the
         PROXY protocol brings it back.
LAYOUT   One flow line FLOW_Y 410, client -> edge proxy Pod -> backend Pod, placed low so the
         client block (the only block on the left) clears the panel.
         PANEL_B 355, measured over 1600x1000 / 1280x860 / 1100x800. This is the only networking
         card that carries its own measured panel constant.
         The header panel is 260 wide centred on PROXY_CX 545, spanning 415..675, clear of the
         overlay with 16 to spare, and it is centred ON THE PROXY because those headers are what
         that Pod writes. Row and chip strip both span CLIENT_X..POD_RIGHT = 40..1110.
MOTION   Every ball wears a riding tag, because what each hop CARRIES is the whole card: the true
         source in, the proxy source out, then the header, then the PROXY protocol preamble.
DO NOT   Confuse the two PANEL constants in this card. `PANEL_B` is the narration panel bottom;
         `PANEL_BOTTOM = 190` is the bottom edge of the drawn header chip. Unrelated.
```

### before `const panelWire = relationPath({ points: [[PROXY_CX, PROXY_TOP], [PROXY_CX, PANEL_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker: the proxy is what writes these headers. No arrowhead.
```

### before `const srcChip   = valChip({ x: CHIP_X(0), y: CHIP_Y, w: CHIP_WS[0], h: CHIP_H, name: 'src at backend', value: 'none', role: 'network' });`

```
Four chips spanning the scheme 1:1, widths tuned to their content. What the backend SEES is an
outcome of a request, so those three read none until traffic flows. The edge mode is a property of
the setup, so it is true from the start.
```

### before `function clearHL(s) {`

```
proxyBox and podWBox are listed so their .highlight is cleared every step. See the clearHL rule in
the category contract.
```

### before `pulsePod(s.refs.proxy, ctx, 0);`

```
Up-arrow, the proxy is the sender: it pulses FIRST as it opens the new connection, and only then
does the proxied request leave carrying the proxy address as its source. The backend pulses on
arrival.
```

### poster

```
Mirrors the diagram: client, edge proxy Pod, backend Pod on one line, with the two header bars the
edge writes docked above the proxy. No ball rides the legs: the poster states the composition, and
what each leg carries is what the steps answer.
Geometry: everything centred on the flow line y=118, the panel centred on the proxy (cx 160) with
its link dropping onto the proxy top edge, every dash starting and ending on a shape edge.
```

---

## network-cni-invocation

### before `const RAISE = 64;                           // lift the whole diagram up ~10% of the viewBox height`

```
WHAT     A control-plane handoff, not Pod traffic: kubelet -> CRI runtime -> CNI plugin chain, and
         the allocated IP wired back into the sandbox namespace as eth0.
LAYOUT   The actor row sits at y352, just below the panel. The CNI plugin is one dashed node frame
         holding a vertical dashed spine tapping each plugin row (bridge, IPAM, result), aligned so
         its TOP tap is at the runtime row and its BOTTOM tap at the sandbox row, which keeps the
         ADD and result arrows dead straight with no mid-run jog.
LANES    One ball walks the whole chain across the steps: CRI -> bridge -> IPAM -> result ->
         sandbox, touching every block and every dashed segment.
```

### before `const SBX = [360, 442 - RAISE, 240, 116];   // x, y, w, h  -> top 378  right 600  centre y 436 = PAUSE_Y`

```
The sandbox height is tuned so its block centre lands exactly on PAUSE_Y, where the result and join
arrows enter. That is what lets those arrows read as centred on the block without being moved and
grazing the CNI box.
```

### before `const cniBox = node({ x: CNI[0], y: CNI[1], w: CNI[2], h: CNI[3], label: 'CNI plugin' });`

```
NOT A DEFECT: CENTRE-LOW is OPEN here and stays open. The whole right half of the picture is this
`node()` frame with `chainList` rows inside it, and the rule counts neither frames nor chips. The
drawing is centred, the rule is not.

DO NOT shift the boxes the rule CAN see to make the number go green. That decentres the picture a
reader actually looks at.
```

---

## network-conntrack-nat

### before `const POD_Y = 252, POD_H = 120;                    // both Pod shells stand on one baseline`

```
WHAT     A flow through netfilter: the NAT rewrite on the way in, and the conntrack entry that
         makes the reply cheap.
LAYOUT   client -> netfilter -> server Pod, both Pod shells on one baseline. The row spans
         70..1130, which centres it on 600 and is why the server Pod ends on 1130 rather than 1110.
LANES    TWO stacked lanes so the ball always has a matching arrow: REQ_Y arrows point right,
         REP_Y arrows point left. The NAT rewrite happens INSIDE the netfilter box.
NOTE     The four state chips sit in one plane UNDER the block each describes: orig dst under the
         client, ct state + reply under netfilter, translated under the server.
```

### before `const CHIP_L = CLIENT_X, CHIP_Y = 530, CHIP_H = 34;`

```
The outer two chips are flush with the Pod footprints (orig dst left edge = client Pod left edge at
70, translated right edge = server Pod right edge at 1130). The middle pair stays centred under
netfilter at NF_CX 590 and is therefore NOT on the same rhythm as the outer two: they belong to the
box above them, not to the strip.
```

### poster

```
The scheme in miniature, vertically centred: client Pod -> netfilter (holding a 2x2 conntrack table
mapping the original tuple to the translated one) -> server Pod. Two lanes carry the flow with
explicit chevrons: the request left to right on the top lane, the reply right to left on the
bottom, each with its own packet.
```

### before `setVal(s.refs.dirChip, 'reverse NAT, no walk');`

```
The chip is named `reply` and this step animates a REQUEST only, so its value has to stay true of
the REPLY rather than describe the ball on screen. What is true of the reply on an established flow
is that it takes the same entry and the same reverse translation and no longer costs a rule walk.

DO NOT set it to `fast path` here. That is the outbound path, it sits next to the previous step's
`reverse NAT`, and the reuse makes it read as an answer to a question nobody asked.
```

---

## network-dns-coredns

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
WHAT     A name resolved through the CoreDNS plugin chain, and which plugin actually answers.
LAYOUT   Panel measured right <= 397, bottom <= 305, one of the deepest in the catalog. The row
         hangs below it: FLOW_Y 400, client top 325.
         The CoreDNS Pod holds the right edge (CONTENT_R 1130), so the two blocks centre the
         content bbox on 600 without a frame to lean on. resolv.conf hangs under the client and the
         two readouts stack above CoreDNS, so the chip strip spans CONTENT_L..CONTENT_R too.
LANES    Client and CoreDNS share one centre line so the query lane enters CoreDNS at its exact
         middle. Query and answer ride SEPARATE lanes offset by LANE_DY, so a lookup reads as a
         loop rather than a retrace.
MOTION   The query lane is 510 units, which is why the query step carries a 3000ms budget.
WHY NOT  The client column at y 175: its whole app box and three quarters of its shell sit under
         the panel on the narrow viewports.
```

### before `const corednsShell = podShell({ x: DNS_LEFT, y: DNS_Y, w: DNS_W, h: DNS_H, label: 'CoreDNS Pod', sublabel: '10.24`

```
CoreDNS Pod centred on FLOW_Y (DNS_Y = FLOW_Y - DNS_H/2), so the query lane enters at its middle.

DO NOT pulse the bare pod element. `pulsePod` uses querySelectorAll, which matches DESCENDANTS
only: it would find the rect but never the `.scheme-pod` itself, so the brightness half of the
pulse silently would not fire. The shell is wrapped in a `g` for exactly this.
```

### before `const pCache = box({ x: PLUGIN_X, y: PLUGIN_Y[0], w: PLUGIN_W, h: PLUGIN_H, label: 'Cache', sublabel: 'answ`

```
Three plugin boxes symmetric about FLOW_Y (kubernetes on the line, cache above, forward below),
leaving equal 37px margins to the pod label and sublabel. Offsets are held relative to the shell
top (PLUGIN_Y), so moving the Pod cannot leave them behind. Order is the CoreDNS plugin CHAIN order
(compiled into the binary), not the Corefile line order.
```

### before `clearHighlights(s, ['pCache', 'pK8s', 'pFwd', 'rcNS', 'rcSearch', 'rcNdots', 'queryChip', 'ansChip', 'clientBo`

```
clientBox is listed so its .highlight is cleared every step. Without it the highlight reduced
replay sets in the resolv / query / answer steps leaks into the plugin-chain step.
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

---

## network-dns-ndots

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
WHAT     What a short name costs: the resolver walks the search list, so one lookup is four round
         trips per address family.
LAYOUT   Panel measured right <= 397, bottom <= 230 over the three OCCLUDED viewports. FLOW_Y 400
         puts the Pod top at 335, well below it, and the resolv.conf chips take the space under it.
         Everything hangs off FLOW_Y: client Pod left, CoreDNS opposite on the right, candidate
         ladder in the free top-right band above CoreDNS. The two BLOCKS span
         CONTENT_L..CONTENT_R, which is what centres the content bbox on 600.
LANES    Query and answer on SEPARATE lanes, because the whole point is the cost of a ROUND TRIP: a
         miss is a packet out AND an NXDOMAIN back, four times over.
MOTION   The lane is 380 units, which costs the walk step about 1.2s. `routeDur` is length-based.
WHY NOT  A deliberately SHORT lane (190 units, CoreDNS pulled in close), on the argument that the
         card is about how MANY queries are sent rather than how far they travel. The ladder is
         chips, so the only things CENTRE can see are the Pod and the CoreDNS box, and centring
         them means putting them on opposite margins. The four round trips still read as four
         identical beats, which is the part that carries the lesson.
NOTE     resolv.conf is drawn as its own chips (search + options) under the Pod, as in
         network-dns-coredns, rather than as a box whose sublabel repeats a chip beside it.
```

### before `const CANDIDATES = ['api.ns.svc.cluster.local', 'api.svc.cluster.local', 'api.cluster.local', 'api'];`

```
The real search list for a Pod in namespace ns is `ns.svc.cluster.local svc.cluster.local
cluster.local`, so a short name is tried against each in turn and only then as it was written.
Four candidates, so four round trips per address family.
```

### before `const namesChip = valChip({ x: CNT_X1, y: CNT_Y, w: CNT_W, h: RC_H, name: 'names tried', value: '0', role:`

```
The live cost readout, under CoreDNS on the right so the two chip groups (resolv.conf left,
counters right) span the content edge to edge.

It counts NAMES TRIED, not DNS messages: getaddrinfo asks for A and AAAA in parallel, so each name
costs two queries on the wire. Calling this chip `queries` and showing 1 for a hit would contradict
the walk step, which tells the reader the IPv4 plus IPv6 total doubles. The answer is the real DNS
rcode, so NOERROR and NXDOMAIN read as the pair they are.
```

### before `function roundTrip(s, ctx, { start, lead, name, result, row = -1, pulseOnSend = true }) {`

```
One query as a full ROUND TRIP: the Pod pulses, the question goes out on the forward lane, CoreDNS
lights on arrival, the reply comes back on the return lane. Returns the ms at which the reply
lands, so the caller can chain the next attempt onto it. `lead` is the pause before the question
leaves: BEAT.afterPulse for a fresh lookup, tighter for the retries of a search-list walk, which
the resolver fires back to back.
```

### before `if (pulseOnSend) pulsePod(s.refs.podGroup, ctx, start);`

```
Up-arrow: the Pod pulses BEFORE its question leaves. `pulseOnSend` is false only for the retries of
a search-list walk, where the Pod has just pulsed on the NXDOMAIN landing 300ms earlier and a
second pulse on top of it smears into one long blink rather than reading as two beats.
```

### before `duration: 10400,`

```
Four full round trips on the 380 unit lane run about 9.3s, and the last NXDOMAIN pulse rings on to
about 10.2s.

DO NOT shorten this below its own motion. Auto-advance would clip the walk halfway and the card
would silently under-count the very cost it teaches. The budget was 9200 while the lane was 190
units: `routeDur` is length-based, so a relayout moves it.
```

### poster

```
The staircase of guesses. A short name is not asked once: the resolver walks the search list, and
each attempt drops one suffix, so the candidate names get SHORTER row by row until only the bare
name is left. The rows are a descending staircase, the dashed rail on the left is the walk down it,
and the dot trailing each row is the query that attempt costs. The staircase IS the cost, which is
the whole point of ndots, so the poster spends everything on that one shape and draws no topology.
```

### before `setWire(s, 'q', 'api');`

```
Each query step restates its own end-state lane labels INSIDE the guard body, because `roundTrip`
writes both labels from the motion path: without the restatement the two lanes stand empty on the
static path (prev, reset, reduced motion) while the ladder and the counters carry the whole story.
The walk step ends on the LAST candidate and its NXDOMAIN, because that is the pair the fourth
round trip leaves on the wire.

NOT A DEFECT: the fqdn step restates the name WITH its trailing dot, so check-labels reports
`api.ns.svc.cluster.local.` against `api.ns.svc.cluster.local` as an ambiguous pair. That pair is
the subject of the step and is meant to stand: one name is absolute and the other is not.
```

---

## network-dns-records

### before `const CONTENT_L = 80, CONTENT_R = 1120;`

```
WHAT     One name, several kinds of answer: A, SRV, Pod and headless records off the same resolver.
LAYOUT   Panel measured right <= 397, bottom <= 330, one of the longest narrations in the category.
         Read the card as an L: only the record ladder, which starts at x=710, may sit beside the
         panel; everything else hangs below y=330.
           top right : four-row record ladder (chips), ROWS_Y 56 down to 296
           middle    : client Pod -> CoreDNS on FLOW_Y 400, one straight hop, no jog
           bottom    : the FQDN band, then the question / answers chips
         Content and chip strip both span 80..1120, centre 600.
LANES    Each record row is reached by its OWN dashed wire: a trunk out of the CoreDNS right edge,
         a vertical bus at FAN_X, then a horizontal leg entering the row square-on at its left
         edge. The four wires share the trunk and diverge at the bus. The answer ball rides ANS[i],
         the same array that drew wire i.
WHY NOT  The ladder below the panel with the band up top. The vertical budget below the panel fits
         the flow row, one 64 unit band and the chip strip, but not a 240 unit ladder as well.
         The BAND is then the only block that can reach the right margin, which is what puts the
         content bbox on 600: CENTRE measures blocks, the ladder is chips, and CoreDNS has to stay
         in the middle for the fan to work.
```

### before `const SEG_Y = 490, SEG_H = 64;`

```
The FQDN band is the LIVE QUERY NAME and it MUTATES per step, because the whole point of the card
is that a different record kind is a different name. SRV prefixes _port._proto; a Pod record swaps
the service label for the dashed Pod address AND swaps the kind from svc to pod; headless asks the
exact same name as A, which is the lesson (same name, three answers instead of one). Segments light
statically and never flash.

Band spans CD_LEFT..CONTENT_R (420..1120), left-aligned with CoreDNS above it and flush with the
right margin. The four widths keep a 156:116:76:100 ratio, each sized by its own text, scaled x1.52
to fill that span.

DO NOT move it back to the top. The ladder needs the free top-right band, and the band is the only
block able to reach the right margin, which is what puts the content bbox on 600.
```

### before `const qChip = valChip({ x: CONTENT_L, y: CHIP_Y, w: Q_CHIP_W, h: CHIP_H, name: 'question', value: '-', ro`

```
Neither readout repeats what the band or the ladder says. QUESTION is the exact qname plus type the
resolver puts on the wire; ANSWERS is how many records come back. That count is the whole
difference between a normal and a headless Service (1 record against one per ready Pod), which
nothing else on the diagram states.
```

### before `function resolve(s, ctx, rowIdx) {`

```
Resolve one record kind: pulse the client, run the query along the flow line into CoreDNS, then
send the answer out along the fan wire belonging to THIS record row. The answer rides ANS[rowIdx],
the array wire rowIdx was drawn from, so the ball tracks a visible dashed line the whole way and
enters the row square-on.
```

### poster

```
One name, several shapes of answer. The FQDN is a band of four identical segments joined by the
dots of the name itself, and it forks into three identical record chips. The ONLY difference the
poster draws is the answer count: the middle chip carries three dots (headless: one record per
Pod), the others carry one. No resolver box and no record ladder: the card already draws those, and
the poster only has to say what the card is ABOUT.
```

---

## network-dualstack

### before `const CONFIG_X = 480, CONFIG_W = 600;        // band spans Service..Pod only (480..1080), clear of the client`

```
WHAT     Two parallel address families: the Pod gains a second IP, the Service a second ClusterIP,
         and the client picks a family at connect time.
LAYOUT   Panel worst case x<=397, y<=230. The config band sits at y=136 and spans only the
         Service..Pod half (480..1080), so it does not reach over the client Pod. The client /
         Service / Pod row sits lower at ROW_Y 286.
         The bottom info chips span the whole ROW (CLIENT_X..ROW_RIGHT, 120..1080), not the band,
         so the strip centres on 600 like the blocks above it.
LANES    The config band drops into BOTH the Service (its ClusterIP) and the Pod (its address) as a
         MIRRORED PAIR about the band centre (CONFIG_CX +/- TAP_DX), not one tap per target centre.
         Two lanes leaving one face at mirrored offsets read as a deliberate pair, and each still
         lands 15 units off its target midpoint, invisible on a 240 and a 300 wide face.
```

### before `const CONFIG_Y = 136, CONFIG_H = 80;`

```
The band lives at x>=480, clear of the narration overlay, so it can sit high without touching it.
Content stays horizontally centred (client and Pod symmetric about 600); only the vertical offset
changes.
```

### before `const wClient = arrow({ x1: HOP_CLIENT[0][0], y1: LANE_Y, x2: HOP_CLIENT[1][0], y2: LANE_Y, dashed: true,`

```
Client -> Service -> Pod data lane in equal-length hops, plus two drops from the config band into
the Service (ClusterIP) and the Pod (CNI address). Each drop shares its points with the per-step
packet that rides it.
```

### before `s.refs.config.classList.add('highlight');`

```
Enabling the feature is a config change with no per-object traffic, so the band just lights: no
flash, no packet. ipFamilyPolicy is a per-Service field and stays SingleStack until a Service opts
in, so that chip does not change yet.
```

### before `s.refs.config.classList.add('highlight');`

```
The Service opts in here: ipFamilyPolicy becomes PreferDualStack and it is given a second ClusterIP
from the v6 service CIDR. The config band is the SOURCE of that ClusterIP (the service CIDR lives
there), so it stays lit too, matching the Pod step.
```

### before `s.refs.svc.classList.add('highlight');`

```
The client picks a family at connect time and the Service policy is unchanged. Show the client
dialling the IPv6 ClusterIP and highlight that address rather than overloading the ipFamilyPolicy
chip with a client-side choice. The Service is on the path (kube-proxy DNATs here), so it lights
via .highlight and does not pulse.
```

### before `const HOP1 = HOP_CLIENT, HOP2 = HOP_SVC;`

```
Up-arrow into the Service then on to the Pod: client pulses first, two linear hops, Pod pulses on
arrival. A riding label on each hop makes the chosen family visible on the wire and shows the
kube-proxy DNAT: the client dials the IPv6 ClusterIP, then the destination is rewritten to the Pod
IPv6 on the way out.
```

---

## network-ebpf-dataplane

### before `const CONTENT_L = 70, CONTENT_R = 1130;`

```
WHAT     The eBPF dataplane replacing kube-proxy: a program at the socket hook reads a BPF service
         map and rewrites the connection at connect() time, so there is no per-packet iptables walk
         and no DNAT.
LAYOUT   Flow left to right along y312 (client -> eBPF program -> backend Pod) with the BPF maps
         box ABOVE the program, mirroring the ClusterIP reference card.
         The composition spans CONTENT_L..CONTENT_R (70..1130): client Pod on the left margin,
         backend column on the right, so the content bbox centres on 600 and the three chips are
         one even row across that span.
NOTE     FAN_X is DERIVED (midway between the program right edge and the Pod left edge), so
         widening the card moves the fan turn with it rather than leaving it behind.
WHY NOT  The backend column stopping at 1030: that leaves the whole card 50 units left of centre.
```

### before `const lDeliver = text({ class: 'scheme-label code dim', x: (HOOK_RIGHT + FAN_X) / 2, y: FLOW_Y + 20, 'text`

```
Destination label UNDER the first fan segment, just as the rewritten connection leaves the program.
The riding src tag rides ABOVE the ball at y312, so this sits below it. Centring the fan turn put
the riser under the old slot, so the dst label lives here where it never collides.
```

### before `const TO_PODY = [[HOOK_RIGHT, FLOW_Y], [FAN_X, FLOW_Y], [FAN_X, PODY_Y], [POD_X, PODY_Y]];`

```
NOT A DEFECT: `TO_PODY` carries no ball. It is the ALTERNATIVE backend, drawn so the reader can see
the map lookup picked one of two, and the card says so in words. N destinations, N wires.
```

---

## network-endpointslice-reconcile

### before `const CTLR_TOP = 350;                       // top edge of the controller box`

```
WHAT     A control-plane pipeline, not a traffic flow: Pods are watched, the controller derives the
         Ready-only address list, and kube-proxy reads it.
LAYOUT   Read it bottom to top and then right.
           Pods (the live source) --watched by--> EndpointSlice controller --writes--> EndpointSlice
           --read by--> kube-proxy
         The Service sits on top: it owns the selector and NAMES the slice, but stores no
         addresses. The slice is three valChip rows stacked between the Service and the controller;
         the controller sits below them and writes UP; kube-proxy sits to the RIGHT and reads.
         Service, slice rows and controller are all centred at x600, well right of the panel.
MOTION   The endpoint rows are the DURABLE state (setVal + .highlight) and hold the addresses. What
         MOVES rides the ball: the controller write hop carries the endpoint address it is
         committing, the kube-proxy read hop carries a short read tag.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
The Ready Pods are observed (they pulse together), then the controller writes the slice: one packet
up from the controller carrying the endpoint address it commits, and the two Ready endpoint rows
light together as it lands.
```

### poster

```
The scheme abstracted: live Pods on the left (the source, the notReady one dimmed) reconciled into
the EndpointSlice on the right (the derived list, one endpoint row per Pod, notReady dimmed).
Straight horizontal wires carry the one-row-per-Pod mapping.
```

### before `if (ctx.reduced) { s.refs.podBBox.classList.add('highlight'); s.refs.ep2`

```
Pod B going notReady is the whole of this step, so its shade is static end-state and belongs ABOVE
the guard, next to Pod C which is already pinned there. Below the guard, prev and reset draw Pod B
at full brightness directly beneath its own sublabel reading 10.244.2.7 notReady, and beside a
slice row reading dropped (notReady).

DO NOT pulse it with plain `pulsePod` while it sits at 0.40. That pulse ramps the STROKE from the
resting tint, which on an already dim Pod is close to invisible. It takes `pulsePodDim` with
`from: OPACITY.notready`, which adds the opacity flash the dim variant exists for. The signature in
anim-dump is an `opacity` track on the Pod group next to the `filter` one, with the peak BETWEEN
the sampled percentages, because a blink returns to where it started.
```

---

## network-externalname

### before `const CLIENT_X = 115, CLIENT_W = 160, CLIENT_H = 108;`

```
WHAT     Two ways a Service can point at something that is not a selected Pod, compared row by row.
           top row (ROW_A): type ExternalName, a pure DNS alias. The client looks the name up, and
                            CoreDNS answers a CNAME that rides on toward the external host. No
                            ClusterIP and no kube-proxy.
           bottom row (ROW_B): a ClusterIP Service with NO selector. The client sends to the
                            ClusterIP, kube-proxy DNATs to a hand-attached EndpointSlice.
LAYOUT   Panel measured right <= 397, bottom <= 230. Both rows hang BELOW it: ROW_A 300, ROW_B 480,
         Pod tops 246 and 426.
LANES    Each row is one independent ONE-WAY flow, two straight hops, no round trip and no return
         lane. Each row has its own client Pod. CoreDNS, kube-proxy and the targets are infra and
         light SYNCED to arrival.
WHY NOT  ROW_A at 254: a quarter of its Client Pod sits under the panel on the narrow viewports.
OPEN     The top band is empty by construction on wide viewports. That is the price of two
         full-width rows on a card whose panel reaches a third of the way down.
```

### before `pulsePod(s.refs.clientA, ctx, 0);`

```
Up-arrow then forward hop: the client pulses first, the query rides at BEAT.afterPulse to CoreDNS
(lights on arrival), then the resolved CNAME rides on to the external host, which lights when the
name reaches it. No round trip, both hops one-way.
```

### before `pulsePod(s.refs.clientB, ctx, 0);`

```
Up-arrow then forward hop: the client pulses, the packet carries dst 10.96.0.7 to kube-proxy
(lights on arrival), then the DNAT-ed dst rides on to the manual endpoint, which lights when the
packet reaches it.
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

---

## network-externaltrafficpolicy

### before `const MID_X = 600;`

```
WHAT     externalTrafficPolicy Cluster against Local. Client above the LB, the LB fans to two
         Nodes, Node-1 has a local backend and Node-2 has none. In Cluster mode the packet landing
         on Node-2 is SNAT-ed and forwarded across the underlay to the Pod on Node-1; in Local mode
         the Node-1 path is straight.
LAYOUT   The two Nodes are the widest row, mirrored about MID_X with NODE_GAP between them, so the
         scheme spans 180..1020 and centres on 600. The chip strip spans that extent 1:1.
         Vertically: client / LB / Nodes / underlay / chips, with an equal 40 margin above the
         client and below the chips, so it centres on the canvas.
NOTE     The backend is a standard podBlock centred BOTH ways inside Node-1, on N1_CX and on the
         node rect centre, so the fan drops straight down the Pod axis onto the Node edge above it.
NOT A DEFECT
         CENTRE-LOW is OPEN here. The two blocks below the overlay span 255..465, centre 360, and
         they are the backend Pod and its inner box; everything else in that band is Node frames,
         which the rule ignores. The Pod cannot move to the centre: it is inside Node-1 BECAUSE
         Node-1 is the Node with a local backend, and Node-2 having none is the entire subject.
DO NOT   Draw a ghost Pod in Node-2 to balance the count. It would contradict its own label.
```

### before `const CROSS = [[N2_CX, NODE_BOTTOM], [N2_CX, UNDER_Y], [N1_CX, UNDER_Y], [N1_CX, NODE_BOTTOM]]; // Node-2 -> u`

```
A packet stops at the Node boundary it arrives on (the top edge coming down from the LB, the bottom
edge coming up off the underlay) and the Pod inside pulses to show it was served.
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

### before `const fan2 = pathArrow({ points: TO_N2, dashed: true, dim: true, role: 'network' });`

```
NOT A DEFECT: `fan2` and `crossWire` are not bright lanes pointing into a dimmed block. This card
never changes an opacity at all, on any of its five steps, so it has no dimmed end for a lane to
point at. The premise is vacuous.
```

---

## network-gateway-api

### before `const FLOW_Y = 380;                          // Client + Gateway share this row: a request enters here`

```
WHAT     OWNERSHIP: GatewayClass, Gateway and HTTPRoute are three objects belonging to three roles,
         and the request only becomes a path once all three exist.
LAYOUT   Panel measured bottom <= 330 on this card. The ownership stack is one column on STACK_CX,
         with the Gateway on FLOW_Y 380, the row a real request enters on, so the Client can sit
         beside it on the left with its top edge at 344.
         The GatewayClass is the only block above the panel bottom and lives at x >= 410.
         The Service and backend Pod hang off the HTTPRoute row to the RIGHT rather than continuing
         the column, because a fifth stacked block plus a bottom chip strip does not fit in 640
         units. That also frees the right column for the three ownership captions.
         Composition spans CLIENT_X..POD_RIGHT = 40..1160, chip strip the same.
MOTION   NOTHING flashes here, not even the packet-less gatewayclass step: a declarative object
         being installed has no motion to show.
```

### before `const ENTRY = [[CLIENT_RIGHT, FLOW_Y], [STACK_X, FLOW_Y]];`

```
Every wire carries an arrowhead pointing the way its ball travels: CLASS_REF is a reference the
Gateway resolves upward, the other three are the request path running down and out to the Pod.
```

### before `const parentWire  = arrow({ x1: CONSULT[0][0], y1: CONSULT[0][1], x2: CONSULT[1][0], y2: CONSULT[1][1], dashed`

```
Gateway -> HTTPRoute. The attachment is DECLARED the other way (the route names the Gateway in
parentRefs, which is why that field is the route sublabel), but the only ball that ever runs this
wire is a request being matched against the rules, so the arrowhead points down, with the ball.
```

### before `const roleA = text({ class: 'scheme-label code dim', x: ROLE_X, y: CLASS_Y + CLASS_H / 2 + 4, 'text-anchor': '`

```
One caption per stack block, each on its own block row. The top two go in the right column, which
is free at those rows. The HTTPRoute row is NOT free there (the backendRef wire and the Service
occupy it), and a caption parked above the Service reads as labelling the Service, so that one goes
to the LEFT of the route, where it also fills the quadrant the panel leaves empty. Sitting on
ROUTE_CY 502 keeps it clear of the measured panel bottom of 330.
```

### before `const listenerChip  = valChip({ x: CLIENT_X, y: CHIP_Y, w: 200, h: 34, name: 'listener', value: ':443 HTTPS', `

```
Each chip is one real API field, which is why hostnames and match are SEPARATE: in an HTTPRoute the
hostname lives in the top-level `hostnames` list while the path lives in `rules[].matches[].path`,
whose default type is PathPrefix. Folding them into one "match" chip would state the spec wrongly.
The request chip reads none until a request arrives.
```

---

## network-headless-service

### before `const CY = 320;                      // canvas centre line: Pods column + CoreDNS are centred on it`

```
WHAT     clusterIP None: no VIP hop, DNS hands back the backing Pod IPs and the client connects to
         a Pod itself. The three backends are a StatefulSet (web-0..web-2) so the stable per-Pod
         name lands.
LAYOUT   Everything symmetric about the canvas centre line CY 320. Three Pods in a column on the
         right centred on CY (web-1 ON it, web-0/web-2 mirroring); CoreDNS centred on CY too, so
         its fan to the three Pods is symmetric; the client low-left. Content spans 80..1120.
         Panel measured right <= 397, bottom <= 205. Everything left of 397 sits well below that
         (client at y>=420, the DNS lane turning at 310/330).
LANES    DNS: leaves the TOP of the client Pod, rises, turns into CoreDNS at 90 degrees. Query and
         answer on SEPARATE lanes 20px apart.
         Data: leaves the MIDDLE of the client's right edge, steps down at DATA_STEP_X to trunk
         level, runs under everything at y=520, and rises on its own bus at DATA_X to enter a Pod
         square-on. Drawn to ALL THREE Pods, because a headless client may pick any of them.
WHY NOT  The data trunk leaving at y=520 direct. It has to pass BELOW the Service box (430..500)
         while still leaving the Pod at its face midpoint; direct puts a lone endpoint 35 units off
         that midpoint, which is what OFFEDGE reports. Hence the step.
```

### before `const wSvc = relationPath({ points: [[CORE_CX, SVC_Y], [CORE_CX, CY + CORE_H / 2]], dash: '5 5' });`

```
Service to CoreDNS is the static fact that this Service backs those records. No arrowhead: an
arrowhead here reads as traffic. Drawn as a bare path because `arrow()` always attaches a marker.
```

### before `const vipChip = valChip({ x: CLIENT_X, y: CHIP_Y, w: CLIENT_W, h: CHIP_H, name: 'clusterIP', value: 'None`

```
Each chip sits directly UNDER the column it reports on and shares that column's exact x and width:
clusterIP under the client (80..290), the DNS answer under CoreDNS and the Service (430..680), the
connection under the Pods (880..1120). So the footer spans the diagram end to end and every chip
edge lines up vertically with the blocks above it.

DO NOT put a value under a chip name that does not describe it. `connect 10.244.3.4 direct` under a
chip labelled `DNS answer` is not a DNS answer.
```

### poster

```
Where a normal Service keeps a VIP, headless keeps an ANSWER. The middle of the path is not a box
that rewrites the destination (there is none to rewrite: clusterIP None, so kube-proxy programs
nothing) but the DNS reply itself, a sheet of three A records. Each record leaves on its own leg to
its own Pod, so the record count and the Pod count are visibly the same number, which IS headless.
```

### before `const fans = [W0, W1, W2].map(cy => relationPath({ points: fanTo(cy), role: 'network' }));`

```
The ENDPOINT fan is CoreDNS knowing which Pods back the Service. No packet belongs on it in either
direction: CoreDNS never calls a Pod, and the read that populates the answer comes from the
EndpointSlice, which this card does not draw. So no arrowhead. Dropping it also settles a direction
the arrow had wrong: it pointed CoreDNS -> Pod while the narration says CoreDNS READS the
endpoints.

The DATA fan beside it keeps its arrowheads and its balls. Two fans that look alike and mean
different things was the defect; the pair now differs at a glance.

NOT A DEFECT: `TO_W2` in the data fan rides nothing. N destinations get N wires so the reader can
see the client picked one of three.
```

---

## network-hostnetwork-hostport

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 265;`

```
WHAT     The two sanctioned ways out of a Pod having its own namespace, IP and veth. One Node seen
         from the LAN side.
LAYOUT   A strict three-column grid, so nothing sits at a random x.
           COL1 (cx 240)      COL2 (cx 600)      COL3 (cx 960)
           portmap rule       Node eth0          (empty: the lane to the agent runs through it)
           Pod app            cni0 bridge        Pod node-agent
         Each block sits under or beside the block it belongs to: the rule above the Pod it maps
         to, the bridge under the NIC that routes into it, and the hostNetwork Pod alone in a
         column because it hangs off nothing.
         The Node spans the full width and its frame starts at 305, just under the panel, running
         to 570, as deep as the chip strip allows. The client is the only block above the Node and
         sits at x >= 450, dead centred on the NIC so the entry hop is one clean vertical.
LANES    The NIC is the hub and exits three ways, one per direction: LEFT into the portmap rule,
         RIGHT into the hostNetwork Pod, DOWN into the bridge. The down leg lands on BR_IN_ORD
         rather than dead on COL2_CX, because the portmap route comes down onto the same bridge
         face: the two land as a mirrored pair either side of the bridge midpoint, which is what a
         face shared by two lanes should look like.
MOTION   The two reflective steps carry no motion at all: they compare, they do not move traffic.
```

### before `const PM_TO_BRIDGE = [[COL1_CX, R1_BOTTOM], [COL1_CX, BUS_Y], [BR_IN_PM, BUS_Y], [BR_IN_PM, BR_TOP]];`

```
The rewrite happens INSIDE the rule box, so the ball re-emerges at its bottom edge already carrying
the Pod address and only then joins the ordinary path. It lands on the bridge left of the NIC route
so the two never overlap, mirrored about the bridge midpoint so neither reads as a slip.
```

### before `const theNode = node({ x: NODE_X, y: NODE_Y, w: NODE_W, h: NODE_H, label: 'Node-1' });`

```
The frame label sits at the Node top-left (x+12, y+18), which puts it above and left of the portmap
box at x=110.

DO NOT lengthen it much further or it runs under that box. The Node address stays on the eth0
block, which is where it belongs anyway.
```

### before `const nsChip   = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 260, h: CHIP_H, name: 'netns', value: 'own', role: 'ne`

```
Four chips spanning the Node 1:1 with even 20px gaps. They are the four things these two fields
actually change, and each is a property of the SETUP rather than of a request, so they all carry
the ordinary-Pod truth from the start and the steps flip them.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key so a reduced replay's .highlight is cleared too, and every
dimmable block goes back to full opacity so the dim one case puts on cannot leak into the next.
```

### before `const inb = segmentPacket(s, ctx, { from: ENTRY[0], to: ENTRY[1], role: 'network' });`

```
Down-arrow chain: the request lands on the NIC, is matched by the portmap rule, and the rewrite
happens INSIDE that box, so the ball re-emerges at its bottom edge already carrying the Pod
address. From there it takes the ordinary path, bridge then veth, and the Pod pulses on arrival.
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

---

## network-ingress-routing

### before `const FLOW_Y = 343;                  // (RULE_BOTTOM + CHIP_Y) / 2, the spine of the left-to-right flow`

```
WHAT     External LB -> controller Pod -> matched Service -> backend Pod. The card runs BOTH rules:
         / is proxied to Service web, then a second /api request is proxied to Service api, so each
         branch carries real traffic.
LAYOUT   Everything hangs off FLOW_Y, the midpoint between the rules panel bottom and the chip
         strip top. The web and api branches are exact mirrors at FLOW_Y -/+ ROW_DY, so each fan
         leg, Service and backend Pod share one row.
         The rules panel is centred ON THE CONTROLLER (RULE_CX == CTRL_CX), since the rules are
         what that Pod watches, and the ownership wire rises straight up from the controller top
         centre. Four columns span LB_X..POD_RIGHT = 40..1160.
WHY NOT  CTRL_CX at 485. The panel really covers x 0..399, y 0..190, so a centred panel must start
         past 399: at CTRL_CX 485 the widest overlay-clearing centred panel is 150 and the rule
         chips need 234. CTRL_CX 545 admits a 260-wide panel (415..675) with 16 to spare. Centring
         the panel on the controller is what FORCES the controller rightward.
NOTE     The Ingress controller Pod is a standard podBlock, the same shell as the web and api
         backends, rather than an oversized box.
```

### before `const rulesWire = relationPath({ points: [[CTRL_CX, CTRL_TOP], [CTRL_CX, RULE_BOTTOM]], role: 'network', dash: '5 5' });`

```
Ownership marker: the controller WATCHES these rules. No arrowhead. It rises from the controller
top centre into the panel centre, so the two read as one column.
```

### before `const entryLabel = text({ class: 'scheme-label code dim', x: (LB_RIGHT + CTRL_X) / 2, y: FLOW_Y - 12, 'text-an`

```
Three wire labels: the request line above the entry hop, and each branch carrying the proxy target
the controller chose. Branch labels sit clear of the Service box they name (above the web one,
below the api one, mirrored).

DO NOT put them in the FAN_X..SVC_X gap. It is 40 wide and the text prints straight through the
Service border.
```

### before `const hostChip = valChip({ x: LB_X, y: CHIP_Y, w: 310, h: 34, name: 'Host', value: 'none', role: 'network' });`

```
Three chips spanning the scheme 1:1, widths tuned to their content (TLS carries the longest value).
Host and path are properties of the REQUEST being served, so they read none until one arrives.
```

### before `clearHighlights(s, ['extLB', 'ruleA', 'ruleB', 'svcWeb', 'svcApi', 'hostChip', 'pathChip', 'tlsChip', 'ctrlBox`

```
ctrlBox, podWebBox and podApiBox are listed so their .highlight is cleared every step. See the
clearHL rule in the category contract.
```

### before `setVal(s.refs.hostChip, 'shop.io');`

```
The request is on the wire, so its Host and path are known, but they are NOT highlighted yet: the
controller reads them in the next step, this one only terminates TLS. No rule has matched, so both
branches stay neutral.
```

### before `pulsePod(s.refs.ctrl, ctx, 0);`

```
Up-arrow, the controller is the sender: it pulses FIRST as it matches the rule, and only then does
the proxied request leave at BEAT.afterPulse. The ball rides the right-angle fan to Service web and
hops on to the backend Pod, which pulses on arrival.
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

---

## network-internal-traffic-policy

### before `const FLOW_Y = 405;`

```
WHAT     internalTrafficPolicy Cluster against Local, the east-west twin of the External Traffic
         card: same two values, same Service, but the traffic starts INSIDE the cluster. The sender
         is a client Pod on Node-1, and the question is which endpoints the kube-proxy on THAT Node
         may program. The third step is what separates it from externalTrafficPolicy: Local has no
         fallback and no health check, so with no local backend kube-proxy DROPS the packets.
LAYOUT   The Service sits alone on top, the Node row carries the whole flow on FLOW_Y 405, and the
         underlay lane below the Nodes carries the cross-node hop. The Node row starts at 312 and
         the Service, the only block that high, lives at x >= 450.
         Node-1 is wide because it holds the whole local path (client, dataplane, local backend);
         Node-2 only holds the remote backend. The two span 40..1160, chip strip the same 1:1.
LANES    The cross-node leg starts on the Node-1 BOTTOM edge (the packet has left the Node by then)
         and ends on the Node-2 bottom edge, and the Pod inside pulses to show it was served.
```

### before `const OWN = [[SVC_CX, SVC_BOTTOM], [SVC_CX, 240], [N1_CX, 240], [N1_CX, NODE_Y]];`

```
Ownership marker: the Service and its EndpointSlices are what kube-proxy on each Node is programmed
from. No arrowhead, and a raw path because `pathArrow` always carries a head.

It STOPS on the Node top edge rather than reaching into kube-proxy: the Service is an API object
that lives outside any Node, and what it programs inside one is the Node's business. N1_CX and
KP_CX happen to be the same 390, so the line still reads as landing on the dataplane.
```

### before `const policyChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 290, h: CHIP_H, name: 'internalTrafficPolicy', valu`

```
Four chips spanning the scheme 1:1 with even 20px gaps. The policy is a property of the Service, so
it is true from the start. The scope, the hop and the result are outcomes of a call, so they read
none until traffic flows.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key, and every Node and Pod opacity goes back to full so a dim set
by one policy cannot leak into the next step.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Up-arrow: the client Pod is the sender, so it pulses FIRST and the packet leaves at BEAT.afterPulse
carrying the ClusterIP. kube-proxy lights as it catches it, the DNAT happens inside the box, and the
ball re-emerges below it on the Node edge already carrying the remote Pod address. The remote
backend pulses as the underlay leg lands on its Node.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Same opening as Cluster: the client pulses, the ball carries the ClusterIP to kube-proxy. This time
the DNAT resolves to the LOCAL Pod, so the ball leaves the far edge of kube-proxy and stays inside
the Node, and the local backend pulses on arrival.
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

---

## network-ipam-pod-cidr

### before `const NODE_Y = 312, NODE_W = 300, NODE_H = 290;`

```
WHAT     The kube-controller-manager carving the cluster CIDR into a per-Node podCIDR slice, and
         the CNI IPAM handing addresses out of that slice.
LAYOUT   Panel measured right <= 397, bottom <= 255. The controller column (cluster CIDR -> kcm) is
         centred at x460..740 so it clears the overlay; the three Nodes fill the y312..602 band and
         span 80..1120, centred on 600.
         Every x is derived from NODE_X / NODE_CX, so the Node columns, their slice chips, their
         Pods and the allocation bus cannot drift apart.
NOT A DEFECT
         CENTRE-LOW is OPEN here. The four blocks below the overlay span 130..700, centre 415. The
         rule cannot see Node frames, so what it measures is the two Pods, and those sit in Node-1
         and Node-2 because the narration names those two Nodes. Moving either Pod to Node-3,
         reordering the Nodes, or inventing a third Pod would each make the card say something
         different. The composition itself is centred: three equal frames spanning 80..1120 under a
         control-plane column on their common centre line.
NOTE     Arrows are DIM dashed with no colour override so the bright ball reads on a muted wire,
         and they sit ABOVE the blocks so they are not hidden under the node rects.
```

### before `const BRANCH_Y = 264;`

```
The two side allocation arrows turn at right angles: down from the controller to a shared branch
level, then horizontally out to the node, then down into its podCIDR chip. The centre arrow stays
straight.
```

### before `const cfgArrow   = arrow({ x1: SPINE_X, y1: CFG_Y + CFG_H, x2: SPINE_X, y2: KCM_Y, dashed: true, dim: tru`

```
Dim dashed arrows: config (pool -> kcm), allocation (kcm -> each node slice), and the IPAM hand-out
from each node slice to its Pod. The Node-2 hand-out is revealed only on the final step, so its
arrow starts hidden.
```

### before `const dur = 1100;`

```
The kcm carves a slice into each node.spec.podCIDR in ONE reconcile pass, so all three packets
leave together and share one travel time: the short centre path and the long side paths reach their
slice at the same moment, the centre simply moving slower. Registered in ALLOW_EXPLICIT_DUR.
```

### before `if (ctx.reduced) {`

```
Node-1's Pod keeps its settled IP with no highlight; the action is on Node-2. Reveal the Node-2 Pod
and show its own IPAM hand-out: a second Pod with a non-overlapping IP out of its slice proves
uniqueness.
```

### before `const IPAM1 = [[NODE_CX[0], SLICE_BOTTOM], [NODE_CX[0], POD_Y]];`

```
NOT A DEFECT: the ball leaves the BOTTOM EDGE of the Node-1 slice chip, and the narration reads
"its address is drawn by the CNI IPAM strictly out of that Node slice", so the drawn source and the
grammatical one agree. The card has no CNI and no IPAM block anywhere, so the slice the address
comes out of is the only candidate on the canvas.
```

---

## network-kube-proxy-modes

### before `const CX = 600;                        // canvas centre: the chip strip is built on it`

```
WHAT     The same connection to a ClusterIP resolved two ways. The TOP route is iptables, a chain
         (KUBE-SERVICES -> KUBE-SVC -> KUBE-SEP) the packet WALKS box by box, stopping at each,
         O(n). The BOTTOM route is IPVS, one in-kernel hash hop, O(1).
LAYOUT   Mirror-symmetric about the flow axis: the chain row and the equally wide hash box sit at
         equal distance above and below, each delivering to its own backend Pod through a centred
         turn, the chain DOWN to the upper Pod and IPVS UP to the lower Pod, so neither arrow
         curves back.
         Panel measured bottom <= 280, so AXIS is 352 and the Client Pod shell (AXIS +/- 64) clears
         it. SCHEME_L 40 .. SCHEME_R 1160 mirrored about CX 600, three chips 350 wide with even
         gaps so the strip centres on 600 by construction.
NOTE     The chain row does NOT centre on 600: its boxes sit ABOVE the panel bottom, so the row has
         to start right of the panel edge and ENGINE_L is pinned at 420. That asymmetry is paid for
         by the client on the left and the backend column on the right, which is what puts the
         CONTENT bbox on 600.
MOTION   The inactive lane dims on each mode step. Wires and packets ride only the GAPS and stop at
         box edges.
```

---

## network-loadbalancer-bare-metal

### before `const MID_X = 600;`

```
WHAT     Not how a packet is balanced inside the cluster, but how the external address becomes
         REACHABLE at all when no cloud provisions anything. The upstream router is on top and the
         three Nodes below are candidates for the address: in L2 mode exactly one answers ARP for
         it, in BGP mode all three advertise it and the router hashes flows across them.
LAYOUT   Vertically: client, router, fan bus, Node row, chip strip. The Node row starts at 310 and
         the client and router, the only blocks above 300, sit at x >= 450.
         The three Nodes are the widest row, mirrored about MID_X, so the scheme spans 50..1150 and
         centres on 600. The chip strip spans that extent 1:1.
```

### before `const statusChip = valChip({ x: SCHEME_LEFT, y: CHIP_Y, w: 300, h: CHIP_H, name: 'status.loadBalancer', value:`

```
Four chips spanning the scheme 1:1 with even 20px gaps. The pool is declared by the operator but
means nothing until an implementation exists, and the mode and the path are outcomes of announcing,
so all three read none at the start.
```

### before `function clearHL(s) {`

```
The inner app boxes are listed by key, and every Node and Pod opacity goes back to full so the dim
the failover step puts on Node-1 cannot leak into a later step.
```

### before `},`

```
An address is allocated by a WRITE, not by a packet: nothing travels here, so nothing moves and
nothing flashes. The two chips it fills simply light. Same reading as a declarative object being
installed.
```

### before `FANS.forEach((fan, i) => {`

```
Three separate client flows, staggered so they read as three, each hashed by the router onto a
different Node. Every flow is literal traffic: it runs the client wire, the router lights as the
first one lands, and each flow rides its own fan to the Node it hashed to, whose Pod pulses on
arrival.

DO NOT add riding tags here. All three carry the same destination, and three copies of it sweeping
over the router at once is noise rather than information.
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

### before `narration: 'On bare metal there is no cloud-controller-manager, so nothing answers a Service of `

```
This narration carries the premise the card cannot do without: no cloud-controller-manager, so
nothing answers a Service of type LoadBalancer and it sits pending.

Step-0 narrations are deleted catalog-wide (the poster shows step 1's text, so step 0's is read by
nobody). Here that orphaned a pronoun: the first sentence a reader ever saw became `That gap is
filled in-cluster instead`, with no gap named anywhere on the card, and `status.loadBalancer:
pending` lost its only explanation. Kept under 471 characters, the length of this card's `bgp`
narration, so the measured panel worst case stays where it was.
```

---

## network-model

### before `const RAISE = 64;                        // band/Pods/chips: net +10% up (lowered 5% from the old 96)`

```
WHAT     The flat Pod network as one wide band: a single L3 address space, four Pods on different
         Nodes hanging off it, packets riding up, along a rail INSIDE the band, and down. One flat
         space, no NAT.
LAYOUT   The kubelet box sits centred above the band and keeps its own higher raise, so the gap
         between it and the band is wider. Band, Pods and chips are raised by RAISE.
NOTE     The CNI badge is tucked under the RIGHT END of the band, its right edge on SCHEME_R 1080,
         and its connector is a straight drop from the badge bottom-centre onto the bus spine
         INSIDE the band.
WHY NOT  The badge parked outside the band. The content bbox can then never centre, because the
         badge always adds CNI_W/4 to the centre no matter how the band is sized. The straight drop
         is also the line it was always aiming at, instead of a dogleg into the band's right face.
NOTE     This is the one place a line sits BELOW blocks rather than above: the dashed rail lives
         inside the band.
```

### before `const POD_W = 180;                       // Pod block width (matches podBlock)`

```
Pod centres along the band, left to right, with equal end-margins and inner gaps so the four blocks
sit symmetric about the band centre 600 with no overflow. The cross-Node hop runs A -> C.
```

### before `const CNI_W = 180, CNI_H = 72;`

```
CNI plugin badge: revealed on the last step, pushed to the far top-right, wired from its
bottom-centre down into the RIGHT SIDE of the band (centred on that edge), to show it is what
IMPLEMENTS the flat space.
```

### before `const podLocalX = [AX, BX, CX, DX].map(x => x - BAND_X);`

```
Flat dashed bus inside the band: a horizontal spine with a short tooth turning down toward each Pod,
so the bus abuts every Pod drop-wire at the band edge. No arrowheads here; the bidirectional arrows
live on the Pod wires.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Pod-to-Pod: the sender pulses first, the packet leaves at BEAT.afterPulse and rides the band to the
far Pod, which pulses on arrival. A src-IP tag rides WITH the packet and arrives unchanged, which is
the no-NAT point made visible.
```

### before `s.refs.natChip.classList.add('highlight');`

```
The src tag belonged to the Pod-to-Pod steps. The agent path is not a Pod source, so clear it rather
than leaving a stale 10.244.1.5. The value CHANGES here, so the chip stays highlighted as a
participant rather than going dim beside its lit neighbour.
```

### before `const CNI_CONNECTOR = [[CNI_X, CNI_BOTTOM], [CNI_X, BUS_Y]];`

```
NOT A DEFECT: this lane IS animated, with `marchWire` rather than a ball, which is this card's
vocabulary for "this is what implements the model" on the step that reveals the CNI plugin. No
packet rides it because nothing DISCRETE travels: the plugin is not sending a message, it is the
thing that makes the flat space exist.
```

---

## network-namespaces

### before `const POD_TOP = 160;      // Pod netns shell top`

```
WHAT     One network namespace as a shared stack: app, sidecar, eth0 and lo are all PEERS on one
         stack, not wired one-to-one, and the veth is the only link to the host.
LAYOUT   The host stack and the Pod namespace line up so the veth reads as a straight
         cross-namespace link landing dead on eth0, and the host block is vertically centred on the
         Pod netns block.
           Host netns ..veth..> [ Pod netns ]
         Inside the shell every block plugs into ONE shared stack, drawn as a dashed rail across
         the stack band. eth0 (the in-Pod end of the veth) and lo hang off the rail from below; the
         two tenant containers tap it from above.
LANES    Every dashed line, the veth and all five interior taps, is drawn ONCE in the same constant
         dim-dashed style and its opacity is NEVER changed per step. Progression shows only through
         `.highlight` and the packets riding the connectors.
MOTION   fresh     only lo is live: lo lights and flashes, nothing flows yet
         veth      a packet crosses the veth, eth0 lights on arrival, the Pod pulses
         shared    app, sidecar and eth0 light, a localhost packet rides app -> rail -> sidecar
         isolation host, eth0 and lo stay lit, the whole shared stack pulses as ONE private unit
                   that lives and dies together
```

### before `const band = rect({ class: 'netns-stack-band', x: BAND_CX - 204, y: 276, w: 408, h: 122, rx: 10,`

```
The band, rail and taps live in podGroup so they pulse as one unit with the Pod.
```

### before `const hop = routePacket(s, ctx, LOCAL_PATH, { role: 'network' });`

```
One localhost packet rides app -> rail -> sidecar over the shared stack: it drops down the app tap,
crosses the rail and climbs the sidecar tap, so it traces both joins and the localhost hop in a
single motion. lo, the loopback that serves it, lights on arrival.
```

### poster

```
Host netns on the left, one centred dashed veth crossing into the Pod netns box. Inside, app and
sidecar on top and eth0 and lo below are all joined by one H-shaped shared-stack rail. Symmetric
about the Pod centre.
```

---

## network-netfilter-path

### before `const NODE_X = 40, NODE_Y = 305, NODE_W = 1120, NODE_H = 251;`

```
WHAT     The missing floor under every other Network Foundations card. Those name an OPERATION on a
         packet (kube-proxy DNATs, conntrack pins the flow, egress MASQUERADEs) without saying
         WHERE in the kernel it runs. This is the hooks, in order, with the packet walking them:
         PREROUTING, the routing decision, FORWARD, POSTROUTING, the wire.
LAYOUT   The order is the lesson, so the whole composition is one left-to-right chain and the
         packet never doubles back on it.
         The five chain blocks span the Node 1:1, from the PREROUTING left edge (70) to the eth0
         right edge (1140) with even gaps, and the chip strip spans exactly that. The conntrack
         table sits under the four hooks it belongs to (70..950) and stops where the wire begins,
         because a packet on the wire is past it.
         The Node frame starts at 305 and the client Pod, the only block above it, sits at x >=
         450. Its packet drops straight down and only turns left once it is INSIDE the Node.
LANES    The reply rides its own lane (RETURN, y 360) ABOVE the chain rather than retracing the
         forward wires backwards.
         CT_LINK is a BRACKET, not a stub: it leaves PREROUTING at its bottom-edge midpoint, steps
         across in the gap between the two rows, and lands on the conntrack table's own top-edge
         midpoint (510). Same shape on network-north-south-path.
WHY NOT  A straight stub from PREROUTING: it lands 335 units off that midpoint, which reads as a
         lane pointing at nothing in particular and is what OFFEDGE reports.
MOTION   The closing eBPF step carries no motion at all: it is a comparison, not traffic.
```

### before `const hookChip = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'hook', value: 'none', role: 'network' });`

```
Four chips spanning the SCHEME 1:1, edge to edge with the Node frame (40..1160), which is the
widest element on the canvas, so the strip and the frame share both verticals and the composition
reads as one column. hook is where the packet is right now, dst and src are what it carries there,
and conntrack is what the kernel remembers about it. All four are outcomes of a packet in flight,
so they read the values it starts with and the steps rewrite them exactly where the kernel does.
```

### before `function clearHL(s) {`

```
The inner app box is listed by key, and every dimmable block goes back to full opacity so the dim
the eBPF step puts on the chain cannot leak into a replay of an earlier step.
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

---

## network-nodelocal-dnscache

### before `const FLOW_Y = 300;`

```
WHAT     A Node-local DNS agent answering most lookups inside the Node, so only a miss pays for the
         trip to the cluster resolver.
LAYOUT   A Node box holds the client Pod and the node-local-dns agent, with upstream CoreDNS
         outside it on the right, everything centred on FLOW_Y 300.
         Content spans x 70..1120 (centre 595) and y 200..484. It cannot go higher: the Node box
         starts at x=70, under the panel, whose longest step here reaches y=163 measured. 200
         leaves about 37px of clearance.
LANES    TWO hops, each with its OWN pair of lanes: query out on FWD_Y, answer back on RET_Y.
```

### before `function setChips(s, { path, cache, up, ct }, lit = []) {`

```
Every step repaints ALL four readouts.

DO NOT set only the chips a step talks about. The others then show the previous step, which is how
the miss step came to claim `conntrack: no entry` while it was busy opening a DNAT-ed TCP
connection to the kube-dns ClusterIP, which does create one.
```

### before `setChips(s, { path: 'agent -> CoreDNS', cache: 'miss -> fill', up: 'TCP keep-alive', ct: '1 long-lived' }, ['c`

```
conntrack is NOT `no entry` here: the upstream leg is a real connection to the kube-dns ClusterIP,
so kube-proxy DNATs it and it is tracked. The win is that it is ONE long-lived entry reused by every
miss, not one fresh UDP entry per lookup.
```

### note (anchor dropped: `const asked = ask(s, ctx, { start: 0, label: 'dst 169.254.20` is not unique in the file)

```
Four hops, because the narration promises all four: the Pod asks, the agent misses and forwards
upstream, CoreDNS answers back to the agent, and only then does the agent answer the Pod. Stopping
at the upstream query means the answer the card claims to cache never arrives.
```

### poster

```
Near traffic and far traffic. Everything the Pods ask stays on one short rail inside the Node, where
the local agent answers it, and a single thin thread climbs OUT of the Node to the cluster resolver:
that is the miss, and it is the only lookup that pays for the trip. The meaning is in the DISTANCES,
not the topology, so the poster keeps the Node boundary (the line the thread has to cross) and drops
everything else the card already draws, packet dots included.
```

---

## network-nodeport-loadbalancer

### before `const CX = 600;                        // canvas centre: the client, the LB and the fan origin sit on it`

```
WHAT     An external client above the LB, the LB fanning down to every Node through a right-angle
         bus, and the chosen Node DNATing to a backing Pod.
LAYOUT   One Node grid drives everything: three frames of 300 spanning SCHEME_L 80 .. SCHEME_R
         1120, and NODE_CX centres the nodePort chip, the backend Pod and the bottom info chip of
         each column.
NOTE     The two backend Pods sit on the OUTER Nodes (1 and 3), not on 1 and 2. That is what puts
         the low-block bbox on 600, and it also puts the Pod-less Node in the MIDDLE, where the
         nodePort step wants it ("even on Nodes that run no backend Pod"). The Node-3 Pod IP is
         10.244.3.9 so the per-Node CIDR the card sets up by example still holds.
MOTION   A packet-less pod-less step gets one box flash.
```

### before `const toLb = segmentPacket(s, ctx, { from: C_TO_LB[0], to: C_TO_LB[1], role: 'network' });`

```
client -> LB (down), then the LB picks Node-1 along the right-angle fan and the nodePort lights.
The tag on the LB leg names the Node and its nodePort, since the balancer has already rewritten
both. Each leg only shows the text in the OPEN GAP between blocks: it emerges from the client into
the first gap, vanishes into the LB, then re-emerges out of the LB bottom and rides the fan, never
sliding the text over the LB itself.
```

### poster

```
External client on top -> cloud LoadBalancer (ccm provisioning it from the right) -> a right-angle
fan down to three Nodes, backend Pods only under two of them (the third Node runs no Pod).
```

### before `const TO_N2 = [[CX, LB_BOTTOM], [CX, NODE_Y]];`

```
NOT A DEFECT: `TO_N2` and `TO_N3` carry no ball on a given step. A NodePort opens the SAME port on
EVERY Node, which is the card's whole first claim, so all three lanes have to exist for the reader
to see that any Node would have served the request. One step takes one of them, and which one is the
arbitrary part. `network-headless-service`'s `TO_W2` is the precedent.
```

---

## network-north-south-path

### before `const FLOW_Y = 356;                 // spine: client, cloud LB, kube-proxy and the Pod are centred on it`

```
WHAT     NORTH-SOUTH is the name of the thing being drawn: traffic crossing the cluster boundary,
         as opposed to east-west Pod to Pod traffic.
LAYOUT   Instead of a bare full-height divider, the composition is framed by TWO faint regions: an
         outside-the-cluster box on the left holding the client and cloud LB, and the Node box on
         the right holding kube-proxy, conntrack and the Pod. The empty GAP between them IS the
         boundary, and the ball visibly crosses it once in (LB2KP) and once out (KP2LB).
         The client and LB sit at y >= 315 while the region boxes frame up to REGION_TOP, which
         fills the top of the canvas and pulls the whole scheme up and centred.
         Framed diagram and chip strip both span the outside region left edge (22) to the Node
         region right edge (1176), so the scheme reads as one column.
LANES    Two lanes, FWD_Y above and RET_Y below the spine, because this is a ROUND TRIP. Every
         block on the path is centred on FLOW_Y, so both lanes meet every block on its edge.
         CT_LINK is a BRACKET: kube-proxy bottom-edge midpoint, across the gap between the rows,
         onto the conntrack table's own top-edge midpoint (860). Same shape as network-netfilter-path.
WHY NOT  A straight stub down from kube-proxy: it lands 175 units off that midpoint, which is what
         OFFEDGE reports.
NOTE     conntrack is a real BLOCK here rather than a word in the narration: it is what pins the
         flow on the way in and unwinds the DNAT on the way out, and it fills the Node interior.
DO NOT   Put the three addresses on the wires as static text. The same packet carries dst
         203.0.113.9:443, then dst 192.168.1.20:31000, then dst 10.244.2.7:8080, and the reply
         unwinds those same three as src. As inline text the longest overflows its 80-unit gap and
         prints straight through the Pod border. They ride the ball.
```

### before `const REGION_TOP = 264, REGION_BOT = 488;`

```
Both regions share the same top and height so they read as a matched pair, and the empty gap
between them (EXT right 492 .. Node left 540) is the cluster boundary the north-south hops cross.
```

### before `const extRegion = node({ x: EXT_X, y: REGION_TOP, w: EXT_W, h: REGION_H, label: '' });`

```
Both regions use the `node()` primitive so they read as one matched pair of barely-visible dashed
containers: left is everything outside Kubernetes, right is the Node. The outside region carries
its title at the BOTTOM-left instead of the top, so the narration overlay never hides it.
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

---

## network-pod-egress-snat

### before `const EGRESS_Y = 360;               // vertical center of the Pod and masquerade boxes: both lanes sit symmetr`

```
WHAT     A Pod reaching the Internet: the MASQUERADE rewrite on the way out and the reverse on the
         way back.
LAYOUT   A Node box holds the client Pod and the MASQUERADE box; the Internet box sits OUTSIDE it
         in its own right-hand column, its top LEVEL with the Node frame (NET_Y = NODE_Y), above
         the egress lanes.
         The Node left edge and the Internet right edge line up with the leftmost (src) and
         rightmost (dst) chips below, so the top row and the info strip share extremes.
LANES    Forward and return ride SEPARATE parallel lanes, both INSIDE the box heights so a ball
         never travels under a box. The SNAT and the reverse SNAT happen INSIDE the masquerade box.
WHY NOT  The Internet box lifted to y110, above the measured panel bottom of 181. The three blocks
         that DO sit below the panel then span 110..630 and centre on 370: CENTRE-LOW. Levelling it
         with the Node frame is what puts that row on 600, and the forward leg still turns UP out
         of the Node into it.
```

### before `const OUT_PATH = [[MASQ_RIGHT, FWD_Y], [FWD_UP_X, FWD_Y], [FWD_UP_X, NET_BOTTOM]];`

```
Forward leg as one right-angle path: out from MASQ_RIGHT along FWD_Y, then up at FWD_UP_X into the
box bottom. The return leg mirrors it on the lower lane: down at RET_DOWN_X, then back along RET_Y
to MASQ_RIGHT. Both ends sit at block edges.
```

### before `const back = routePacket(s, ctx, RET_PATH, { role: 'network' });`

```
Return lane: the reply ball descends out of the Internet box and runs back along RET_Y into the
masquerade box (reverse SNAT inside), which lights on arrival. The dst it still carries, the node
IP, rides along.
```

### poster

```
A Node wrapping a client Pod (outer shell + inner app) and a MASQUERADE box, with the Internet as a
small globe off to the right. Two dashed lanes cross the SNAT boundary as a round trip: the request
left to right on the top lane, the reply right to left on the bottom, chevrons marking direction.
Pod, masq and internet share one centre row.
```

---

## network-pod-ip-and-veth

### before `const LINK_Y = 396; // shared y for the veth link, the loopback link and the packets on them`

```
WHAT     Where a Pod IP comes from and what the veth pair actually is.
LAYOUT   The Node and everything inside it sit in the y228..528 band, with a gap to the chip strip
         at y560, so the CNI plugin stays inside the Node box and nothing touches the panel.
         The inner row is CENTRED IN ITS FRAME by DERIVATION, not typed x values: INNER_W = Pod
         shell + veth run + bridge column, and POD_X = NODE_X + (NODE_W - INNER_W) / 2.
WHY NOT  The row at 150..960 inside a frame spanning 80..1120: that is 70 of margin on the left
         against 160 on the right, which CENTRE-LOW reports as a bbox centred on 555.
```

### before `root.appendChild(nodeEl);`

```
Z-order, bottom to top: Node background, the boxes, then the wires and their labels ON TOP of the
boxes (so a connector crossing a box stays visible and the text is selectable), then the value-chip
strip, and finally the packet layer so the ball rides above everything.
```

### before `s.refs.appBox.classList.add('highlight');`

```
No pulses on this sequence, just persistent highlight borders like the workloads cards: the app
block lights first and stays lit, then the loopback ball travels, then the pause block lights on
arrival.
```

### poster

```
The scheme in miniature with a brightness hierarchy and one bright accent: the Pod netns holds
pause (bright, the netns owner) and app (dim), a single bright IP bar spans both (one address,
shared), and the hero is the veth pair: two lit end-nodes (eth0 in the Pod and its host-side peer)
joined by a dashed link out to the cni0 host bridge.
```

---

## network-pod-localhost

### before `const SHELL_X = 620, SHELL_Y = 174, SHELL_W = 500, SHELL_H = 320;  // [620..1120] spans the bind + Pod IP chip`

```
WHAT     Containers in one Pod sharing a network namespace: they reach each other over localhost,
         and outside traffic arrives on the shared eth0.
LAYOUT   The two blocks are positioned over the chip strip below: the client Pod centred over the
         leftmost chip (path) at centre x205, and the Pod shell spanning the two rightmost chips
         (bind + Pod IP), x620 to x1120. They share one vertical centre y334, so the external lane
         between them is a straight centred horizontal hop.
         Inside the shell a symmetric 2x2 grid holds the two containers up top (app, sidecar) and
         the two shared interfaces down low (eth0, lo).
LANES    Two: the localhost lane (app <-> sidecar, y262) never leaves the Pod and is served by lo,
         and the external lane carries outside traffic across the gap to the shared eth0.
```

### before `const EXT_PATH = [[CLIENT_EDGE, SHELL_CY], [SHELL_X, SHELL_CY]];`

```
External lane: one straight centred horizontal hop across the gap, at the shared vertical centre of
both Pods. The destination address rides ON the ball, so there is no static inline label to collide
with anything.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Pod to Pod: the sending client pulses first, the packet leaves at BEAT.afterPulse and rides one
straight hop to the shared eth0 carrying its dst address as a riding label. On arrival the
receiving Pod pulses, and the shared eth0 plus the answering app light.
```

### poster

```
Two containers side by side, both wired into one shared loopback node (lo, 127.0.0.1) in the middle:
they share localhost and one network stack. Sub-blocks centred inside the Pod.
```

---

## network-pod-to-pod-cross-node

### before `const VETH_Y = 338;       // veth links inside each node + the short packets on them`

```
WHAT     A packet from a Pod on one Node to a Pod on another, over the physical underlay.
LAYOUT   Topology band y220..450 carries both Nodes, each with a Pod and the node cni0 dataplane
         box. The physical underlay runs BELOW the Nodes at UNDERLAY_Y. The chip strip at y538
         spans exactly Node-1's left edge to Node-2's right edge.
         The Pod and cni0 blocks are spaced so the veth wire label fits in the gap without touching
         a block, while cni0 stays inside the Node.
LANES    The cni0-to-cni0 link is ONE continuous turning path (cni1 bottom -> underlay -> cni2
         bottom), not three arrows. Short veth hops use `segmentPacket` (linear); the cross-underlay
         leg uses `routePacket` over the SAME array as the underlay `pathArrow`.
```

### before `const UNDERLAY_PATH = [[CNI1_X, CNI_BOTTOM], [CNI1_X, UNDERLAY_Y], [CNI2_X, UNDERLAY_Y], [CNI2_X, CNI_BOTTOM]]`

```
One turning polyline starting and ending at the block bottom EDGES, so the ball never travels under
a cni0 box.
```

### before `root.appendChild(node1);`

```
Z-order, bottom to top: Node backgrounds, then the cni0 boxes and Pods, then the wires and labels ON
TOP of the blocks, then the chip strip, and finally the packet layer. The ball never overlaps a
block anyway (every hop lives in a gap and stops at a block edge), so no occlusion trick is needed.
```

### before `pulsePod(s.refs.podA, ctx, 0);`

```
Up-arrow: A pulses first, then the packet travels the full Pod A -> Pod B journey as three wire-only
hops. Each hop ends at a block edge and the next starts from the block's far edge, so the ball
visibly enters a cni0 and re-emerges on the other side.
```

### poster

```
The hero is ENCAPSULATION itself: Pod A on Node-1 to Pod B on Node-2, and mid-gap the packet is a
packet-in-packet, a bright inner Pod frame wrapped inside an outer Node header. Source Pod bright,
dest dim, the wrapped packet crossing the inter-Node gap on a dashed flow. The nesting reads as the
Pod frame carried between Nodes inside an outer envelope (VXLAN, or bare when routed).
```

---

## network-pod-to-pod-same-node

### before `const POD_MID = 380;          // vertical centre of the pod / cni0 blocks`

```
WHAT     Two Pods on one Node reaching each other through the cni0 bridge: switched at layer 2,
         no NAT and no encapsulation.
LAYOUT   Topology band y255..505 carries the Node, both Pods and the cni0 bridge; the chip strip
         sits at y540, below everything and clear of the overlay.
LANES    The veth pair is drawn as TWO directional lanes, symmetric about the block centre: the top
         lane (TOP_Y) carries A -> B (ARP request and data frame), the bottom lane (BOT_Y) carries
         B -> A (the ARP reply).
```

### before `pulsePod(s.refs.podA, ctx, 0);                // A broadcasts the request (blink first)`

```
A pulses FIRST and fully; the request ball departs only once that blink has landed
(BEAT.afterPulse), per the up-arrow choreography. The ARP exchange is a round trip: the request
floods A -> bridge -> B on the top lane, then B unicasts its reply B -> bridge -> A on the bottom.
```

### poster

```
Same shape as the cross-node card but wholly inside ONE big Node block (both Pods share it): Pod A
(bright source) and Pod B (dim dest) flank the cni0 bridge, joined by clean dashed veths with no
packet dots. The hero is the bright frame sitting BARE inside the bridge, no outer wrapper, which is
the same-node point.
```

---

## network-service-cidr

### before `const SCHEME_L = 120, SCHEME_R = 1080;   // content edges, mirrored about x=600`

```
WHAT     The Service-side twin of network-ipam-pod-cidr: one configured Service CIDR splits into a
         static and a dynamic band, hand-picked IPs come out of the static band, the allocator
         draws ClusterIPs from the dynamic band, and a second ServiceCIDR can grow the range.
LAYOUT   The pool box sits at x>=440 and the bands start at y=320, clear of the panel.
LANES    One horizontal DISTRIBUTION RAIL per fork, mirroring ipam-pod-cidr. The pool forks on the
         y230 rail to each band centre; the bands fork on the y428 rail to their Services. Every
         drop lands on a box centre.
         Services sit on an even 260 / 600 / 940 grid, edges flush with the band bar (120..1080).
         The add-on CIDR is stacked directly over the web column (x940), so add-on -> dynamic band
         -> web read as one vertical line on the extend step instead of a stray top-right box.
MOTION   There are no Pods on this card, so motion is packets plus box `.highlight` plus an arrival
         ripple. Nothing pulses.
NOTE     The IPAddress chip is a FULL-WIDTH bottom strip (SCHEME_L..SCHEME_R). A lone 280-wide chip
         at 800..1080 is a chip strip centred on 940, and its value (10.96.137.42 . default/web)
         did not fit beside its own name in 280: the one chipfit collision the catalog carried.
         The binding to web is not lost, because the value names the Service.
```

### before `const aSplit1 = pathArrow({ points: SPLIT_STATIC, dashed: true, dim: true });`

```
Dim dashed wires: the pool splitting into both bands, the static band feeding the two well-known
Services, the dynamic band feeding web, and the add-on CIDR feeding the dynamic band (hidden until
the extend step). They sit ABOVE the blocks so the bright ball reads on a muted wire.
```

---

## network-service-clusterip

### before `const FLOW_Y = 312;                 // center line: client, kube-proxy and the two fans are symmetric about it`

```
WHAT     THE NETWORKING EXEMPLAR. A ClusterIP round trip: the client dials a virtual IP, kube-proxy
         DNATs it to one of two backends, and the reply unwinds the NAT on the way home.
LAYOUT   Its extents are the ones other networking cards copy: CX 600, SCHEME_L 60, SCHEME_R 1140,
         the same L/R/CX the Workloads canon uses. Everything is derived from those three: the
         client on SCHEME_L, the ClusterIP and kube-proxy column mirrored about CX, the backend
         column flush on SCHEME_R, and the two fan buses offset from KP_RIGHT.
         The two backend Pods sit SYMMETRIC above and below FLOW_Y, podY the exact vertical mirror
         of podX. The virtual ClusterIP is lifted ABOVE kube-proxy: it owns no interface, the
         packet never reaches it, kube-proxy intercepts.
LANES    Each backend is wired by a forward fan (kube-proxy -> Pod) and a return fan of identical
         shape, so the arrows travel the same on top and bottom and always meet a Pod at its left
         edge. Forward and return on separate lanes. The DNAT and the reverse NAT happen INSIDE
         kube-proxy. Flow 1 runs to podX (send/dnat/reply), flow 2 to podY
         (balance/balance-reply).
NOTE     The chip strip spans SCHEME_L..SCHEME_R with even gaps but UNEQUAL widths (270 / 310 / 225
         / 215), each sized for its own longest value: DNAT carries `-> 10.244.2.7:8080` and needs
         the widest cell. Four cells in one row cannot all reach the 350 floor a bottom strip
         normally wants, and this row predates that floor; check-chipfit measures it clean, which
         is the test that matters.
```

### before `const LANE_FWD = [[CLIENT_EDGE, FWD_Y], [KP_LEFT, FWD_Y]];`

```
podY's fans are the vertical mirror of podX's, so both backends are wired identically. Both ends sit
at block edges.
```

### before `const SLOWMO = 1.1;`

```
This card glides its packets 10% slower than `routeDur`, via an explicit dur. Only the BALL TRAVEL
is slowed: every other beat (pulses, hops, step floors) stays on the canon, so the overall process
matches every other card. Riding labels use the same slowDur so they stay locked to the ball.
Registered in ALLOW_EXPLICIT_DUR.
```

### before `const cWireFwd = arrow({ x1: CLIENT_EDGE, y1: FWD_Y, x2: KP_LEFT, y2: FWD_Y, dashed: true, dim: true, role: 'network' });`

```
Client to kube-proxy lanes (upper forward, lower return), the vip to kproxy ownership link, then the
four backend fans: forward and return for podX and their vertical mirror for podY.
```

### before `const ownLink  = relationPath({ points: [[CX, VIP_BOTTOM], [CX, KP_TOP]], role: 'network', dash: '5 5' });`

```
Ownership marker: kube-proxy REALIZES this virtual IP. No arrowhead, because the ClusterIP never
appears on a wire.
```

### before `const vipChip  = valChip({ x: CHIP_X[0], y: CHIP_Y, w: CHIP_W[0], h: CHIP_H, name: 'clusterIP', value: '10.96.0.20:80', role: 'network' });`

```
Four chips spanning the full block width 1:1: the leftmost starts at the Client Pod left edge (70)
and the rightmost ends at the backend Pod right edge (1030), with even 20px gaps.
```

### before `clearHighlights(s, ['vip', 'kproxy', 'vipChip', 'dnatChip', 'ctChip', 'backChip', 'clientBox', 'podXBox', 'pod`

```
clientBox, podXBox and podYBox are listed so their .highlight is cleared every step. Both Pod
opacities reset to 1 so a dim set by an earlier flow does not persist into the next.
```

### before `},`

```
The endpoint IPs the rules point at are named in the DNAT chip. The backend Pods are NOT highlighted
yet: nothing has been DNAT-ed to them at this stage, and they light only when a flow actually lands
on them. Here only kube-proxy is the actor.
```

### before `const give = routePacket(s, ctx, FAN_FWD_X, { dur: slowDur(FAN_FWD_X), role: 'network' });`

```
Down-arrow: the DNAT-ed packet emerges from kube-proxy (the rewrite happened inside it) and rides
the forward fan to the chosen Pod, which pulses on arrival. The rewritten Pod IP rides with the ball.
```

### before `pulsePod(s.refs.podX, ctx, 0);`

```
Up-arrow first: the chosen Pod pulses, then the reply leaves along the return fan carrying the Pod
source IP and reaches kube-proxy, which lights as it reverses the NAT inside the box. The ball hides
at the kube-proxy right edge and re-emerges at the left carrying the restored ClusterIP source, then
runs the return lane to the client, which pulses on arrival.
```

### before `pulsePod(s.refs.client, ctx, 0);`

```
Second connection, mirror of the first but to podY: the client pulses, the packet runs the forward
lane to kube-proxy carrying the ClusterIP dst, then the DNAT-ed packet emerges and rides podY's
forward fan (down) to the OTHER backend, which pulses on arrival. Flow 1 stays on podX.
```

### before `pulsePod(s.refs.podY, ctx, 0);`

```
Exact mirror of reply for podY on the lower fans: podY pulses, the reply rides podY's return fan
(up) to kube-proxy, which lights as it reverses the NAT inside the box, then the ball hides at the
right edge, re-emerges at the left with the restored ClusterIP source and runs the return lane to
the client, which pulses on arrival.
```

### poster

```
Abstract, not the literal diagram: a client feeds a dashed virtual ClusterIP ring (it owns no
interface), which kube-proxy intercepts at a solid pivot and fans to two symmetric backends, one
chosen (lit) and one alternative (dim). The one-of-many DNAT, distilled to a hub and a fan.
```

---

## network-service-ports

### before `const FLOW_Y = 312;                 // shared vertical center of both Pods and the Service box`

```
WHAT     port, targetPort and a named port: what each number means and where the translation
         happens.
LAYOUT   One straight left-to-right flow along FLOW_Y, client Pod -> Service -> backend Pod, so
         every hop is a crisp horizontal `segmentPacket` (linear).
LANES    ONE-WAY: no reply is shown, so there is no return lane.
MOTION   The translation happens INSIDE the Service box: the ball fades in at the Service left edge
         on the dial hop, the map step flashes the box where the rewrite lives, then the ball
         re-emerges from the right edge on the deliver hop.
         The client dials web:80 on the dial hop, and the named-port resolution http -> 8080 rides
         the deliver hop. The chip strip tracks the four port numbers as fixed facts.
```

### before `const give = segmentPacket(s, ctx, { from: DELIVER_PATH[0], to: DELIVER_PATH[1], role: 'network' });`

```
Down-arrow: the packet re-emerges from the Service right edge (DNAT done inside) and is delivered to
the backend Pod, which pulses on arrival. The resolved named port http -> 8080 rides with the ball.
```

### poster

```
Abstract, not the literal diagram: the client-facing port lives on one level and the container
targetPort on another. Traffic enters the Service high on the front-door plane and leaves low on the
container plane, and the vertical step through the box is the port -> targetPort remap. A ring
centred on each dashed hop marks the port on that plane.
```

---

## network-service-terminating-endpoints

### before `const FLOW_Y = 326;                     // center line: client and kube-proxy are centred on it`

```
WHAT     The few seconds while a backing Pod shuts down, and why a clean rollout drops nothing.
LAYOUT   The Client sits left on the centre line facing kube-proxy in the middle, with two backend
         Pods on the right: web-a (stays Ready, top) and web-c (being retired, bottom).
LANES    Two right-angle fans from kube-proxy to each Pod, entering the Pod at 90 degrees.
MOTION   Each hop tags itself `new conn` or `in-flight` via a riding label. web-c dims as it leaves
         the serving set but keeps a serving flow during the drain window.
NOTE     The bottom chip strip is the endpoint state that actually drives routing: web-c's endpoint
         conditions (ready / serving / terminating), where new connections may land, and the
         grace-period window.
```

### before `const LANE  = [[CLIENT_EDGE, FLOW_Y], [KP_LEFT, FLOW_Y]];                                              // clie`

```
The fans are right-angle routes: out of kube-proxy horizontally, up or down the shared bus, then
straight into the Pod left edge at 90 degrees. web-c's dim is held across every step so the fade
never reads as a new state.
```

### before `const drain = routePacket(s, ctx, FAN_C, { delay: 0, role: 'network' });`

```
Two flows at once. The in-flight connection keeps draining to web-c (a packet on the web-c fan,
web-c pulsing through its dimmed state on arrival). As it lands, a fresh connection starts from the
client, runs the lane and the web-a fan, and web-a pulses. New and in-flight, side by side.
```

### poster

```
Client to kube-proxy, which fans at right angles to two symmetric backends: web-a (Ready, top,
solid, neutral endpoint bar) takes new connections, while web-c (Terminating, bottom, dashed) is
still serving one in-flight flow, shown by the cyan drain lane and its cyan serving bar. The solid
against dashed pair is the whole idea.
```

---

## network-service-types

### before `const TYPE_X = 210, TYPE_W = 280;          // type column: left edge + width (right edge 490)`

```
WHAT     A MAP card, not a traffic flow: five Service types on the left pointing straight across to
         what each one targets. ClusterIP, NodePort and LoadBalancer all proxy to the same shared
         backend node (they stack, each building on the one above), while ExternalName and Headless
         are the odd ones out (no proxy, no selector) and point at their own boxes.
LAYOUT   No round trip, no return lane and no bottom chip strip. The type column and the target
         column sit symmetric about x600 (210..990).
         The type column starts at x210, LEFT of the panel's right edge, so the rows clear the
         panel by HEIGHT instead: ROW0 is 186 because the panel measures bottom <= 181 here.
WHY NOT  ROW0 at 132: the top ClusterIP row is then 46% under the panel.
WHY NOT  Moving the columns right instead of down: measured, and it puts the content bbox on 740.
LANES    Every arrow is a straight horizontal hop at its row centre. Exits are centred on the type
         box right edge, entries on the target left edge. The three proxy entries land on the
         backend node symmetric about its vertical centre (221 / 309 / 397 about 309), so the fan
         reads balanced with no angled lines.
MOTION   Each hop carries a short riding label tagging the MECHANISM the row uses (via kube-proxy
         for the three proxy types, CNAME for ExternalName, Pod IP direct for Headless).
         The three proxy rows forward to a backend, so they read down-arrow: packet first, then the
         receiving Pod pulses on arrival. ExternalName and Headless target BOXES, not Pods, so
         there is no pulse there, only the arrival ripple plus the target box lighting.
```

### before `const aCI = arrow({ x1: TYPE_EDGE, y1: cy(Y_CI), x2: TGT_X, y2: cy(Y_CI), dashed: true, dim: true, role: 'network' });`

```
Straight horizontal arrows from a type box right edge to its target left edge at the row centre. The
three proxy entries sit symmetric about the node centre.
```

### poster

```
The scheme in miniature, centred: five service-type rows on the left point STRAIGHT ACROSS to their
targets. The three proxy types (top) share one dashed backend node holding two Pods, while
ExternalName and Headless each get their own box.
```

---

## network-tls-termination

### before `const FLOW_Y = 312;`

```
WHAT     Where TLS is decrypted: the Ingress terminates it and talks plain HTTP to the backend.
LAYOUT   The flow runs left to right along y312, external client -> Ingress controller -> backend
         Pod, with the TLS Secret sitting ABOVE the Ingress as the source of the certificate.
MOTION   Decryption happens INSIDE the Ingress box. The client and Ingress are infrastructure and
         only light; only the backend Pod pulses.
```

### poster

```
Client -> Ingress (the termination point, fed by a TLS Secret) -> backend Pod. A CLOSED padlock
rides the inbound leg (encrypted https) and an OPEN padlock rides the outbound leg (decrypted plain
http), so the poster reads the encrypted-to-plaintext handoff at a glance.
```

---

## network-traffic-distribution

### before `const FLOW_Y = 320;                          // central flow line`

```
WHAT     trafficDistribution PreferClose: kube-proxy preferring a same-zone endpoint, and what
         happens when the zone has none.
LAYOUT   Panel measured bottom <= 255, so the client sits on the left below it, on SCHEME_L.
         The whole flow is centred on y=320 (client -> kube-proxy -> zones) and on x=600, with the
         client and the two zones symmetric about y=320.
         The two setting chips are a full-width BOTTOM strip, two 530-wide cells spanning
         SCHEME_L 60 .. SCHEME_R 1140, which is the grammar the rest of the category uses.
WHY NOT  The setting chips stacked under the client. That puts the chip strip at 120..440 and
         centres it on 280, and no arrangement in that left band can reach x=600, because the zone
         frames own everything right of 740 from y340 down.
LANES    Each zone stacks its two Pods VERTICALLY, so the fan from kube-proxy reaches every Pod at
         its own left edge over a shared vertical rail at x=700, with no route crossing another
         Pod.
```

### before `const FAN_SLOW = 1.6;`

```
The fan is deliberately slowed (`routeDur * FAN_SLOW`) so the riding source-IP tag stays readable,
and the label rides the SAME dur so it stays locked to the ball. Speed stays distance-normalized:
one shared multiplier. Registered in ALLOW_EXPLICIT_DUR.
```

### before `const FAN_A2 = [KP, [RAIL_X, FLOW_Y], [RAIL_X, A2Y], [POD_L, A2Y]];`

```
NOT A DEFECT: `FAN_A2` carries no ball on this step. It is the endpoint the traffic distribution did
NOT pick, and the point of the card is that the choice was made among the drawn candidates rather
than forced. Same basis as the nodeport fan.
```

### before `const arr2 = clientHop(s, ctx, BEAT.afterPulse + 540);`

```
TWO client hops, the second staggered by 540, because the narration says two connections from the
same client can land in different zones. Duration 4600 for a 4412ms span.

DO NOT fire both fans at the identical delay off ONE client hop. That reads as a single connection
being split across two backends, which is the one thing a connection cannot do.

DO NOT add a second Pod pulse. `PULSE_POD.ms` is 900 against a 540 stagger, so the second would
composite over the first on the same element, and `session-affinity` already establishes one pulse
per step with two rides.
```

---
