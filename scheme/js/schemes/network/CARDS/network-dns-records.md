## network-dns-records

### layout

```
WHAT     One name, several kinds of answer: A, SRV, Pod and headless records off the same resolver.
LAYOUT   Read the card as an L: only the record ladder, which starts at PANEL_X 710, may sit beside
         the panel, and everything else hangs below it. The four ladder rows come off ROWS_Y with one
         pitch, so they stay evenly spaced when the first one moves.
PANEL    Deepest at 1100x800 on `pod-record`, one of the longest narrations in the category:
         `OVERLAY_IDS=network-dns-records node --test report/overlay.test.mjs` from `scheme/test/`.
         Bottom lo..hi per viewport: 142.56..229.77 at 1600x1000, 171.42..277.67 at 1280x860 and
         180.12..329.20 at 1100x800, right edge 290.77 / 377.76 / 396.55. The client is 130 tall and
         centred on FLOW_Y 400, so it opens at y=335 and leaves 5.8 units of clearance, the tightest
         reading on any DNS card. A longer narration on any of the six steps spends it.
SIZES    The first name segment is CD_W wide on CD_LEFT, so the segment that carries the Service
         name stands exactly under the CoreDNS block that answers it, edge for edge. The second
         segment absorbs the 7 units that frees, 184 where the even split would give it 177, and
         segments three and four do not move at all, so the band still ends on CONTENT_R and the
         content bbox stays on 600. Both widths are floored by the longest string the segment ever
         carries rather than by the split: `port and protocol` inks 104.3 at 1100x800 inside 230, and
         `namespace` 55.2 inside 184, so the tighter of the two still clears 62.9 a side.
LANES    Each record row is reached by its OWN dashed wire, and the four share a trunk out of the
         CoreDNS right edge before diverging at the bus (FAN_X 680). The answer ball rides ANS[i],
         the same array that drew wire i, so it tracks a visible line the whole way.
         The nameserver address RIDES the query ball as a tag, `to 10.96.0.10:53` (`NET.T-01`),
         on all four record steps, and never as a standing caption on the lane. The tag inks 98.2
         wide at 1100x800 against a 130 unit gap, so in the face band beside the ball it would print
         over the Pod frame at departure or over CoreDNS at arrival. It rides OVER both block tops
         instead, just above and right of the ball, `dx` 53 and `dy` -40, baseline 348, its left
         edge 2.6 to 4.8 units past the ball centre. Measured over the whole ride as an em box, it
         keeps 2.6 to 4.8 units off the Client Pod right edge, 0.9 to 1.5 off the CoreDNS top
         (about 4 to the ink, the string carrying no descender), and 9.0 under the panel at
         1100x800 on `pod-record`, the only step and viewport where the two share an x range.
         Neither offset can shrink further: the Pod edge bounds `dx` at departure and the CoreDNS
         top bounds `dy` at arrival, and above the Pod top the panel is in the way.
         Only the OUT leg carries it, which is a decision rather than half a job: the tag says where
         the QUESTION goes, and the answer comes home to an address the client block already prints
         as its own sublabel, so a second tag would repeat a label rather than add one.
MOTION   The four record steps obey `P-03`: the answer count WAITS for the answer, on the very beat
         the ladder row was already waiting on. Each states its count in `chips`, `rewind` winds it
         back to the count the step before left, and the single `F.set` inside `lookup` writes the
         row and the count together on the `ans` arrival, 2938ms for the A row and 2800ms for the
         other three, the difference being that row 0 is the longest climb off the bus. Measured in
         real time, 2750ms still reads the old count on all four steps and 3150ms reads the new one.
         The tagged query leg rides LEG_DUR 1200 from 800 to 2000, not the 700 floor its 130 units
         would clamp to, with the tag fading in from 650 so it is on as the ball leaves and retiring
         over 170ms from the arrival.
         `was` for srv-record is the same 1 record the a-record step left, so that step rewinds to
         the value it already shows. It is stated anyway, because `P-01` wants every step to say
         every value and a helper that skipped one would make the silent step look like the odd one
         out.
         The step budget is not flat. `a-record`, `srv-record` and `headless-record` hold 4900, which
         the tagged query leg forces (span 4638 on the first, 4500 on the other two, `M-19`), so all
         three read slow in the ranking `timing.mjs` prints (15.56 to 18.42 ms per character) on the
         price of the leg rather than of their prose. `pod-record` holds 5000, bought by its 503
         character narration at 9.94, and stands still for 500 after its reply pulse. `fqdn` holds 3400 at 9.47 and pays for its pace in
         stillness, 2500 of its 3400 with only the client pulse in it, which is what a step whose
         whole content is four segments being read costs. None of the five is in the hurried end.
CONTENT  The FQDN band is the LIVE QUERY NAME and it MUTATES per step, because the whole point is that
         a different record kind is a different name. SRV prefixes _port._proto, a Pod record swaps
         the service label for the dashed Pod address AND the subdomain from svc to pod, and headless
         asks the exact same name as A, which is the lesson. The third segment is `subdomain` and
         never `kind`, for the reason the constant block gives. Segments light statically and never
         flash.
         Neither readout repeats the band. QUESTION is the exact qname plus type on the wire on the
         four record steps, and on `fqdn`, where nothing is on the wire yet, the expansion itself.
         ANSWERS is how many records come back, which is the whole difference between a normal and
         a headless Service (1 against one per ready Pod). The ladder carries that difference too,
         by spelling three addresses out on its headless row, but only as a shape: the chip is
         where it is a NUMBER, stated on every step and comparable across them.
         The SRV row spells its TARGET beside its port, `-> :80 web.default.svc`, because a normal
         Service SRV answer carries the port number and the domain name and the narration names
         both. It inks 257.7 at 1100x800 inside a 410 wide row. The Pod row spells its answer the
         same way, `-> 10.244.2.7`, the address read straight back off the name, which is all a
         `pods insecure` answer is. It inks 263.8 at 1100x800.
         The a-record step reads the answered address against the address the question went to, and
         the query tag is what makes that contrast visible rather than a claim in prose: 10.96.0.10
         riding the question, 10.96.0.20 in the row the answer ball climbs to.
         The pod-record step frames its name as a form that PREDATES the DNS spec, because the
         reference introduces it as what `Kube-DNS versions, prior to the implementation of the DNS
         specification, had` and the CoreDNS plugin keeps the mode behind it for `backward
         compatibility with kube-dns`. Without that clause a reader takes `pod.cluster.local` for a
         first-class modern name, which is the one impression the step exists to deny. It is paid for
         inside the same sentence: `it answers from the name` is the short form of that fact, so the
         narration lands at 503 characters and the panel bottom holds at 329.20.
         The ladder TRUNCATES the cluster domain on every row, which is the card shorthand and not an
         answer name: the band states the full name segment by segment and the question chip always
         carries the exact qname, so spelling `cluster.local` a fourth time buys a reader nothing and
         costs the SRV row its width.
         The nameserver is 10.96.0.10 on port 53, where the kubeadm Service CIDR puts kube-dns and
         where `network-dns-coredns` already draws it in resolv.conf.
         `desc` says a Pod is REACHABLE at its record name rather than that it answers at one,
         because the Pod answers no DNS query and CoreDNS does. It says so only `With pods enabled in
         CoreDNS`: the bare `A Pod is reachable at` is rejected because the plugin default is
         `disabled: Default. Do not process pod requests, always returning NXDOMAIN`. The clause is
         paid for inside the band by folding the svc marker into the segment list and opening the
         third sentence on `It`, never by cutting the condition.
         The fqdn step opens on `Under the default ClusterFirst policy`, the wording
         `network-dns-ndots` and `network-headless-service` already use: the bare `A Pod resolv.conf
         carries search domains and ndots:5` is rejected because a hostNetwork Pod under ClusterFirst
         `will fallback to the behavior of the Default policy`, which carries neither.
         The pod-record step offers a StatefulSet Pod hostname as `A stable way` and never `The
         stable way`: any Pod with `spec.hostname` and `spec.subdomain` matching a headless Service
         gets the same kind of name, StatefulSet is only the common source of it.
         `kubeadm sets to insecure by default` reads against the kubeadm CoreDNS manifest
         (`cmd/kubeadm/app/phases/addons/dns/manifests.go`, `pods insecure` in its kubernetes block),
         the docs being silent on kubeadm, while the CoreDNS plugin default stays `disabled`.
         `one A record per ready Pod` rests on `the Pod needs to be ready in order to have a record
         unless publishNotReadyAddresses=True is set on the Service`, and `the client chooses an
         endpoint itself` on `Clients are expected to consume the set or else use standard
         round-robin selection from the set`.
         Every claim here reads against k8s 1.35 and the three cited pages: the record forms and the
         readiness condition from DNS for Services and Pods, the three `pods` modes from the CoreDNS
         kubernetes plugin, and the `pods insecure` line of the default Corefile from Customizing DNS
         Service.
SCOPE    The SHAPE of the answer, and nothing about the client that receives it. Who answers and the
         plugin chain that decides it are `network-dns-coredns`. Why a short name becomes this
         fully qualified one, and what the walk costs when it misses, is `network-dns-ndots`: the
         fqdn step states the search list and ndots as a fact and does not spend a step on them.
         The headless row here is the ANSWER SHAPE alone, one A record per ready Pod: what the client
         then does with that set, the direct connection with no DNAT and the stable per-replica name,
         is `network-headless-service`, which the pod-record narration hands it in its own last
         sentence. The CNAME an ExternalName Service answers with is `network-externalname`. The AAAA
         half of a record and the pair a dual-stack Service publishes are `network-dualstack`.
WHY NOT  The ladder below the panel with the band up top. The vertical budget below the panel fits the
         flow row, one 64 unit band and the chip strip, but not a 240 unit ladder as well. The BAND is
         then the only block that can reach the right margin, which is what puts the content bbox on
         600: CENTRE measures blocks, the ladder is chips, and CoreDNS has to stay in the middle for
         the fan to work. Same reason the band cannot move back to the top.
NOT A DEFECT
         `qChip` is deliberately NOT on a beat, and `report/chip-beat.test.mjs` reports the four
         record steps as FORM-E for it. The question is the step's PREMISE rather than something an
         arrival produces: `asking()` states the same name in the FQDN band above at entry, so
         binding the chip alone would leave the chip and the band contradicting each other for the
         800ms before the query even leaves the client, and binding the band too would blank the name
         while the narration is read, which is worse than the finding.
```
