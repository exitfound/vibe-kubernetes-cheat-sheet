## network-dns-egress-policy

### layout

```
WHAT     What a NetworkPolicy does to name resolution: a Pod selected for Egress may open only what
         its egress rules allow, the lookup to the cluster DNS Service is not one of those until a
         rule says so, and the rule that repairs it has to state port 53 for UDP as well as TCP.
LAYOUT   Nested containment, the one composition in DNS & Service Discovery that puts the Pod INSIDE
         something. Pod web stands mid-canvas inside its own egress boundary, a wall 100 units out
         from each face, with a DOOR in the wall facing each destination: the CoreDNS Pods left of
         it, Pod db-0 right of it. The wall is the only hand-forged shape on the card and the whole
         readout, so the card carries no value chip at all: what a rule allows is a hole in the wall,
         and what it refuses is a shut door with a ball dead inside it. The two policy objects are a
         MIRRORED PAIR about the Pod centre in the band above the boundary, at a 32 gap, and each
         drops into one corridor and runs onto the Pod top at that centre plus or minus 64. They are
         two policies of equal standing on one Pod, so a block nearer the centre than its partner
         reads as the nearer cause, and one straight leg against one bent leg says the same thing a
         second time.
         The levers no sibling in this section carries are the raw wall, the group that makes the
         whole boundary appear as one thing the moment a policy selects the Pod, and the absence of
         chips. `network-policy` draws the same refusal as a labelless bar standing ON a road, which
         is the general mechanism. Here the boundary encloses the Pod and each door is one rule.
PANEL    `OVERLAY_IDS=network-dns-egress-policy node --test report/overlay.test.mjs` from
         `scheme/test/`. Bottom lo..hi per viewport: 142.56..160.00 at 1600x1000, 171.42..192.67 at
         1280x860, 219.69..244.54 at 1100x800, deepest on the poster frame, which previews the
         `open` narration. Right edge 396.55 at 1100x800, which is the catalog ceiling reached to
         the unit. What the panel pins on this card is the POLICY BAND, not the wall. A mirrored
         pair of 232 blocks about the Pod centre reaches x=352 at the 32 gap it takes, and 368 even
         at a zero gap, so it cannot stand right of 396.55 at any gap and has to clear the panel
         VERTICALLY instead: the band opens at 252, 7.46 under the deepest reading, which is the
         FLOOR for this card. The band cannot rise, because the panel reads 246.43 deep on six of
         the seven steps and 222.21 on `fix` alone, so no step buys room. Everything else hangs off
         it: FLOW_Y 486, the wall top at RING_Y 374, 129.46 clear of the deepest reading, and the
         wall bottom at 598 with 42 to the 640 floor. The price is the empty band above y=252 right
         of x=400: it is the panel column plus the mirror, and reclaiming it costs one of the two.
SIZES    Every block is 232 by 80 and both Pods 232 by 104 with a 192 by 44 inner box (`NET.L-01`). A
         door is 24 by 56: 24 wide because that is a ball plus clearance either side, so a ball dying
         in it reads as stopped rather than as parked, and 56 tall because ONE door has to take the
         DNS lane pair at FLOW_Y plus and minus 12. The wall carries a gap of exactly DOOR_H in each
         side face, so a shut door closes the ring to the unit and an open one leaves a hole the
         width of the wall. A door carries no string: the road runs through the middle of it, and
         what names it is a caption outside the ring, in the 112 unit CORRIDOR between the wall and
         the block that door faces, centred on 328 on the left and 872 on the right. The corridor is
         what forces TWO lines per caption: `no rule for port 53` on one line runs 67.5 units past
         it and ends up under the wall, where it reads as a label of the boundary. Split, the widest
         line measures 67.5 at 1100x800 and leaves 22.3 either side. The lines sit at 546 and 568,
         20 under the block bottoms and 32 under the door, clear of both lanes. `behind Service
         kube-dns 10.96.0.10` shares the first of those lines directly under the CoreDNS block,
         51.7..260.3, and never reaches the caption at 294.3.
LANES    RING_PAD 100 is measured against MOTION rather than ink, and it is the `network-policy`
         run-up: a refused ball flush against the face it left travels 22 units and reads as a ball
         that never fired, where 100 units is floor-bound by `M-13` to PKT_DUR_MIN 700ms. The DNS
         pair leaves the web left face as an `L-12` mirrored pair at FLOW_Y plus and minus 12 through
         `laneY`, and the database lane leaves the right face midpoint, so the three roads are one
         axis. Every lane carries a WAYPOINT at the centre of the door it meets. The points are
         collinear so the drawn line does not move by a unit, and `L-10` then reads each road as
         terminating on its door instead of running past it: a door is what the traffic arrives at.
MOTION   Two of the six steps end with nothing reached, and that absence is the verdict: on `isolate`
         and on `tcp-default` the query dies inside the shut door 100 units out and no second ball
         leaves. `by-ip` runs both balls in one step and on the SAME beat, the dead query and the
         database connection that goes straight through, because the split is the whole diagnostic
         and a connection sent after the refusal would leave a Pod whose pulse is over (`M-18a`).
         An answer leaves 100ms after its query lands, so the two tags are over the same 212 units
         together: the answer tag rides UNDER its lane at dy 18, which puts 56 units between the two
         strings. On `truncated` the retry waits 300 past that gap, because the truncated tag holds
         160 and fades over 180 and a TCP tag leaving earlier stands across it. Still time runs 22
         to 39 percent of a step, which `deadair.mjs` prints beside the catalog it is ranked in.
CONTENT  Every claim is read against k8s 1.35 and the four pages the catalog entry cites. Egress
         isolation follows from selection, not from a deny rule: a Pod is isolated for egress if any
         NetworkPolicy selects it and carries Egress in policyTypes, and from then on only its
         egress lists allow anything. The page's own caution is the card's subject, that a default
         deny-all egress policy also blocks DNS and a separate policy allowing egress to the cluster
         DNS Service is what restores it. `tcp-default` turns on the API reference default: protocol
         defaults to TCP where a port entry omits it. The peer is one `to` entry carrying both a
         namespaceSelector on `kubernetes.io/metadata.name` and a podSelector on `k8s-app=kube-dns`,
         which selects those Pods in that namespace, and it is written that way because a policy
         cannot name a Service. The card states no ordering between address rewriting and policy
         processing, in either direction: the page calls that undefined and discusses it for ipBlock
         alone. Nothing here says how a refused query surfaces inside the app.
         `open` says Pod web is `non-isolated for egress`, which is the page's own term, rather than
         that every connection it opens is allowed: the page also rules that a connection needs the
         egress policy of the sender AND the ingress policy of the receiver, so the wider absolute
         is false about a destination this card does not draw. The egress absolute that IS carried,
         that only the egress lists allow anything, is the page's own sentence and is left unhedged,
         exactly as `network-policy` carries it. `truncated` says an over-long answer comes back
         `with the truncation flag set` and that `a resolver that retries over TCP` asks again: RFC
         7766 section 5 rules that a server truncates a response over the 512 byte limit and sets
         TC, and that the client `takes the TC flag as an indication that it should retry over TCP
         instead`. No version claim is made about any resolver library. db-0 stands behind a
         headless Service because a headless A record `resolves to the set of IPs of all of the Pods
         selected by the Service`, which is what lets one name answer with a Pod address. The Pod
         resolver address is the kube-dns Service, whose own ports are 53/UDP and 53/TCP, and whose
         Pods carry `k8s-app=kube-dns`, all three read off the DNS debugging page.
NAMING   The query is addressed to the kube-dns Service and the rule selects the Pods behind it, so
         the ball carries `UDP 53, db.shop` and no address at all. `by-ip` carries the address it
         really uses, the Pod address 10.244.2.7, which is why db-0 stands behind a headless Service:
         a name that answers with a Pod address is what makes the two steps agree.
SCOPE    The DNS consequence and the DNS rule. The mechanism itself, ingress against egress, the two
         boundaries a connection clears and the plugin that raises them, is `network-policy` and is
         redrawn nowhere here. Which plugin implements it appears in the desc and on no step. What a
         short name costs before any of this is `network-dns-ndots`, who answers the query is
         `network-dns-coredns`, the shapes the answer takes are `network-dns-records`, and a cache
         answering on the Node before the query leaves is `network-nodelocal-dnscache`.
WHY NOT  Drawing the wall dim on `open` instead of leaving it out, which is what `C-14` asks for a
         block that does not exist yet. A boundary is not a block with a hole where it stands: a Pod
         that no policy selects has no boundary at all, and a ghost wall around it says the opposite
         of the step. The `network-policy` precedent is the same, its two bars stand at opacity 0
         until a policy selects the Pod each belongs to.
DO NOT   Close RING_PAD to put the wall against the Pod it belongs to. It looks tidier and it costs
         the refusal its entire journey, which is the one thing `isolate` and `tcp-default` have to
         show. Do not remove a lane waypoint at a door centre either: the drawn line does not move
         and the render geometry check goes red with no exemption table to file it in.
NOT A DEFECT
         The right-hand door is drawn on no step at all. The database rule arrives with the policy
         that raises the wall, so that side is a permanent hole and a boundary with a hole in it is
         what one allow rule looks like. On `tcp-default` the left door is drawn SHUT while its
         caption reads `port 53, TCP only`: the caption states the rule and the door states what
         happens to the traffic the step is watching, which is a UDP query the rule does not cover.
OPEN     R3 fires three times, on `isolate`, `by-ip` and `tcp-default`, and all three are filed in
         `test/fixtures/carried.mjs` beside the two `network-policy` already carries. The shut door
         is lit from entry on every step it refuses a query on, and R3 sees only that a route ends
         at it: lighting it on arrival instead would credit the query with raising the boundary that
         stops it.
```
