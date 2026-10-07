# CLAUDE.md `js/schemes/network/` (Traffic flow)

How traffic moves in a cluster: the flat Pod network and the machinery under it, one packet's path
at Pod level, Services and what backs them, traffic from outside, and DNS. A networking card is
usually a PATH. Rules: `scheme/CANON.md`. Module contract and the test suite: `scheme/CLAUDE.md`.
Per-card notes: `./CARDS/<id>.md`.

## Sections

| key | label | what belongs here |
|---|---|---|
| `network-foundations` | Network Foundations | the flat address promise, namespaces, CIDRs, the proxy and dataplane implementations |
| `pod-networking` | Pod Networking | how a Pod interface comes to exist and how a frame gets from one Pod to another |
| `services-endpoints` | Services & Endpoints | VIP resolution, EndpointSlice reconciliation, port mapping, selection policies |
| `external-traffic` | External Traffic | NodePort, LoadBalancer, Ingress, Gateway, traffic splitting, the client source IP |
| `dns-service-discovery` | DNS & Service Discovery | CoreDNS, record shapes, resolver behaviour, caching, DNS scaling |

## Tint and kit

`NETWORK_TINT = { bright: 'rgb(158, 234, 247)' }`, cyan. Only the pulse peak is named (`M-05`).
The literal ball colour is `NET.C-01`.

Beyond the common set the kit exports `BRISK_HOP_MS`, 595, the one pace for a short untagged hop
the 700 floor would make crawl. Each card using it registers its balls in `PACING`
(`render/motion.test.mjs`). The kit carries no geometry grammar object.

## Geometry

- No shared band: a path card's extent is set by where its path runs, so each card declares its
  own extents. The exemplar's `CX`, `SCHEME_L` 60 and `SCHEME_R` 1140 are the usual start.
- Actor 232 by 80, Pod 232 by 104 as the default (`NET.L-01`). Chips are 34 tall, `CHIP_H` per card.
- A round trip is one lane pair, `laneY(FLOW_Y, LANE_DY)`, 24 apart (`A-23`).
- `node()` frames pad 34 over and 12 under what they hold (`L-23`). A frame in a row of peer Nodes
  keeps the row height. `network-wiring-pod-via-cni`, `network-gateway-traffic-splitting` and
  `network-traffic-distribution` use `node()` as a grouping frame, not a Node.
- A `tune` or `raw` assigns a LITERAL ref key (`refs.x = ...`): `unit/spec-steps.test.mjs` cannot
  read a computed one. A `raw` that imitates a part kind is declared in `RAW_SHAPED_AS`
  (`unit/spec-scene.test.mjs`).
- Most steps declare `reducedLit`, because a Pod pulse names nothing `flowLights` can derive. On
  `network-client-ip-preservation`, `network-flat-pod-network` and `network-policy` the whole
  static path rests on it.

## Rules of this category only

| ID | Rule |
|---|---|
| `NET.C-01` | `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` in `diagrams.css`, and the tinted dialog in `css/styles.css` the same: the tint stop washed the ball out. Never fold them into tokens (`C-21`) |
| `NET.L-01` | An actor block is 232 by 80 and a Pod starts at 232 by 104. An actor departs only for a string that does not fit, the panel wall, or a row it is sized by. A Pod may depart. Either way the record states size and reason as a `DEVIATES` line, and a Pod is never resized to 232 by 104 for consistency alone |
| `NET.S-01` | A Pod is `podShell` plus an inner box in one `g`, as `P.pod` builds it. Client, kube-proxy, CoreDNS, a bridge and a NIC are infrastructure and light rather than pulse |
| `NET.A-01` | Every endpoint sits on a block edge: a rewrite inside a box (DNAT, SNAT, port remap, conntrack) is a fade at one edge and a re-emergence at the far edge |
| `NET.A-02` | Traffic is delivered to a Node: a ball stops on the Node frame edge and the Pod inside pulses, and no wire or ball crosses a Node border. A grouping frame that is not a Node is exempt |
| `NET.A-03` | N destinations get N wires: a fan draws every candidate even when a step takes one. The unridden legs are not a defect and `test/fixtures/carried.mjs` carries them |
| `NET.A-04` | No line passes `role: ''` (`A-22`). Weight is `dim`, recession is `P.relation` at 0.45: a wire a ball rides is a route at full opacity, one nothing rides is a relation |
| `NET.T-01` | An address rides the ball as its tag (`M-30`), never as wire text: an address overflows an 80 unit gap and prints through a block border |
| `NET.S-02` | `SCENE.reset.keys` lists every Pod inner box by key: `clearPodHighlight` resets only inline strokes, so a highlight from a reduced replay would leak into later steps (`S-19`) |
| `NET.S-03` | The exemplar is `network-service-clusterip`. Copy its shape, not its Pod sizes |
| `NET.S-04` | A record states only what is true of that card and never restates a `NET.*` row. Unridden alternatives (`NET.A-03`) and edge-to-edge rewrites (`NET.A-01`) are the norm and take no line |
| `NET.D-01` | The sections and their order are the `SUBCATEGORIES` list in `cards.js`, an editorial order (`D-10`). A Service card that starts at an external client belongs in `external-traffic` |

## Exemplar

`network-service-clusterip`: three extents drive every block, the round trip is one `laneY` pair,
kube-proxy reaches the dataplane by a relation because it writes rules and forwards nothing
(`A-06`), both backend opacities are stated on every step, and `SCENE.parts` runs boxes, wires,
chips, then `P.packets()` last. Its Pods are sizes of its own.
