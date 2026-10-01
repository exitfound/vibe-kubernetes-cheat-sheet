## network-dns-ndots

### layout

```
WHAT     What ndots:5 costs, name by name: the resolver in the Pod walks the search list before any
         name with fewer than five dots, so a same-namespace name answers on the first candidate, a
         cross-namespace name on the second, and an external name only after three NXDOMAIN misses.
LAYOUT   The RESOLVER side is one column on the right, x 790..1130: the /etc/resolv.conf file
         (nameserver and options side by side), the four try rows under it, then the client Pod
         under the rows. CoreDNS stands on the left below the panel with the two counters stacked
         under it, which is where every one of those queries lands. The column is the argument: the
         walk is done by the resolver inside the Pod, so everything it walks is drawn over the Pod
         that walks it, and CoreDNS is only the thing answering each round trip.
         The try rows are FIXED: three search domains and `as written`, the order a relative name
         is tried in. Only their VALUES change per step (`not tried`, `NXDOMAIN`, an A record,
         `skipped`), so the one strip reads four different lookups without being rebuilt, and no
         step shows one candidate answered two ways.
PANEL    Deepest at 1100x800 on `resolvconf` (and the poster previewing it) and `crossns`, both
         254.66: `OVERLAY_IDS=network-dns-ndots node --test report/overlay.test.mjs` from
         `scheme/test/`. Bottom lo..hi per viewport: 142.56..177.44 at 1600x1000, 171.42..213.92 at 1280x860 and 229.82..254.66 at 1100x800, right edge 290.77 /
         377.76 / 396.55. The only block left of x 420 is CoreDNS, top at 380, 125 below that
         reading. The resolv.conf tag at y 48 and the column start at x 790, 393 right of the widest
         panel edge in the set, 396.55.
SIZES    CoreDNS is 232 by 80 (NET.L-01). The Pod is 340 by 104 with a 300 by 44 resolver box: the
         height is the rule, the width is the column over it (NET.L-01, a block sized BY a column).
         The column is 340 because a try row carries `default.svc.cluster.local` and `A 10.96.0.42`
         on one line. `nameserver | 10.96.0.10` in its 180 chip keeps an 18.2 gap at 1600x1000, the
         tightest chip on the card, 30.1 at 1280x860 and 33.3 at 1100x800.
         The counters take the CoreDNS width, 232, stacked at y 480 and 520.
LANES    Query and answer on SEPARATE lanes, Pod left edge 790 to CoreDNS right edge 302, because a
         miss is a packet out AND an NXDOMAIN back. The lane is 488 units, and it cannot be much
         shorter: the longest query label, `api.example.com.default.svc.cluster.local`, measures
         282.53 at 1600x1000 (404.73..687.27), 258.13 at 1280x860 and 251.53 at 1100x800, clearing
         both block edges by 102.7 at the widest reading.
MOTION   One candidate is a full ROUND TRIP, and each retry chains off the arrival of the answer
         before it plus 460. The Pod pulses on the first send and on every answer, never on a retry
         send, because the answer pulse lands 460 earlier and a second pulse smears into one blink.
         The row lights as its question DEPARTS, so the candidate in flight is always readable. Its
         value, and both counters, wait for the answer (P-03): a name counts as tried once its reply
         is back, and each name adds two to the query counter.
         Measured spans on the 488 lane: one round trip 3968, two 6696, four 12152. Durations 4100,
         6850, 12300, 4100.
CONTENT  The default resolv.conf for `dnsPolicy: ClusterFirst` in namespace default is `nameserver
         10.96.0.10`, `search default.svc.cluster.local svc.cluster.local cluster.local`, `options
         ndots:5`. The Kubelet appends the search domains of the Node to that list, so on a cloud
         Node the walk is longer than drawn: the resolvconf step says so, and the card draws a Node
         with none rather than stating four as a universal count. That is why the step reads `Any
         search domains of the Node are appended after them`: the bare `are appended to the list as
         well` is rejected because it promises Node domains the rows then do not show. The order is
         the Kubelet cluster list first, the Node list after, as the DNS debugging task prints it
         (`search default.svc.cluster.local svc.cluster.local cluster.local google.internal ...`).
         The `desc` reads `fewer than five dots and no trailing dot is relative`: `any name with
         fewer than five dots is relative` is rejected because its own last sentence, and the fqdn
         step, make `api.example.com.` absolute with three dots.
         Read against 1.35 and holding: ClusterFirst is the default when `dnsPolicy` is unset
         ("Default is not the default DNS policy"), the Kubelet configures the file ("kubelet
         configures this file for each Pod"), a cross-namespace name answers as `<svc>.<ns>`
         (`data.prod`), and resolv.conf(5) states the threshold as the dots needed "before an
         initial absolute query will be made". `the resolver inside the Pod keeps no cache` is about
         the libc stub resolver the Pod box names (getaddrinfo), not about caches an application
         runtime keeps above it.
         Fewer dots than ndots: every search domain first, the name as written last. A trailing dot
         makes the name absolute and nothing is appended. glibc and musl both keep that order.
         `A+AAAA queries` counts messages on the wire: getaddrinfo with AF_UNSPEC asks for A and AAAA
         together for every candidate, so each name is two queries and the external lookup is eight.
         No step says a name goes on the wire once, since that would contradict the counter.
         The addresses: 10.96.0.42 and 10.96.7.19 sit in the default Service CIDR 10.96.0.0/12, and
         203.0.113.10 is TEST-NET-3 (RFC 5737), so the external answer is true by construction.
BUDGET   The walk is 12152 of motion and the step 12300. DO NOT shorten it below its own motion:
         auto-advance would clip the walk before the as-written answer, and the card would stop on
         three misses and never show the lookup succeed. routeDur is length-based, so moving either
         block is a timing edit on all four lookup steps.
SCOPE    The COST of a relative name, counted in names and queries. Who answers each round trip, and
         which plugin inside CoreDNS produces the answer, is `network-dns-coredns`. The shapes the
         answers take are `network-dns-records`. What a Node-local cache does to the price of a miss
         is `network-nodelocal-dnscache`. A Pod `dnsConfig` carrying its own ndots is named as the
         fix in the fqdn step and drawn on no card.
NOTE     The resolv.conf search line is not a chip of its own: it IS the first three try rows, under
         the tag `search domains, then as written`, so the file is not drawn twice.
         The Pod sublabel is `namespace default` on every step, because the namespace is what builds
         the first search domain and the lookup name already rides the query lane.
WHY NOT  A ladder of full candidate names (`api.default.svc.cluster.local` and so on). It binds the
         rows to ONE name, so a second lookup on the same card has to rebuild the list or ask a name
         the card already answered, which is how a same name answers NOERROR and then NXDOMAIN on
         two adjacent steps. Fixed suffix rows with per-step values carry four different names.
         A nonexistent short name as the walk. It shows the mechanism and hides its cost: the name
         that walks the whole list in real clusters is an EXTERNAL one with a few dots, which also
         ends in an answer rather than a failure.
DO NOT   Leave the two lane labels to `flow` alone. Every lookup step states the END state of both
         lanes in its `wires` field and winds them back with `rewind`, because the static path never
         runs the flow.
         Write `skipped` into the fqdn rewind. The resolver decides the skip when it reads the
         trailing dot, the beat the name leaves on, so the three search rows turn over on that
         departure at 800 with the cue, and `report/chip-beat.test.mjs` names a turnover at entry.
NOT A DEFECT
         The fqdn step query label keeps its trailing dot, so `render/inline.test.mjs` may pair
         `api.example.com.` with `api.example.com` as ambiguous. That pair IS the subject of the step.
```
