# CLAUDE.md `schemes/network/` (Traffic flow)

What is true of Networking cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `NET.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `NET.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Six ids across the four folders had drifted into meaning two different things. None of
them was a `NET.*` id, and keeping the text in one place is how that stays true.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 37 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 37 grid thumbnails, keyed by card id |
| `network-kit.js` | the tint and the two pulse wrappers; everything else is re-exported from `lib/scheme-kit.js` |
| `network-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./network-kit.js`, and never
reaches past the kit (`S-21`). Nothing else may live here (`S-20`).

## Tint

```js
NETWORK_TINT = { base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' }   // cyan
```

`base` is the Pod's resting stroke, measured under `reducedMotion` (`M-05`).

| ID | Rule |
|---|---|
| `NET.C-01` | Networking is the one category whose colour appears as a LITERAL in `diagrams.css`: `.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` on purpose, because the tint stop made the ball read washed out. Do not fold those into tokens (`C-21`) |

## Kit surface

The shared list (`S-22`), plus `NETWORK_TINT`, `pulsePod`, `pulsePodDim`. No networking-only helper.

## Subcategories (`NET.D-01`)

| key | label | cards | what belongs here |
|---|---|---|---|
| `network-foundations` | Network Foundations | 8 | the model and the machinery under every other card: the flat address promise, namespaces, CIDRs, the proxy and dataplane implementations |
| `pod-networking` | Pod Networking | 8 | one packet's path at Pod level: how an interface comes to exist and how a frame gets from one Pod to another |
| `services-endpoints` | Services & Endpoints | 8 | the Service abstraction and what backs it: VIP resolution, EndpointSlice reconciliation, port mapping, selection policies |
| `external-traffic` | External Traffic | 8 | traffic that starts outside the cluster: NodePort, LoadBalancer, Ingress, Gateway, TLS, and what happens to the source IP |
| `dns-service-discovery` | DNS & Service Discovery | 5 | name resolution: CoreDNS, record shapes, resolver behaviour, caching |

The line between `services-endpoints` and `external-traffic` is where the client is, not which
object appears: a Service card that starts at an external client belongs in `external-traffic`.

## Exemplar (`NET.S-03`)

`network-service-clusterip.js`. Copy its shape for a new networking card: parallel forward and
return flow lanes plus a right-angle fan.

## Rules of this category only (`NET.*`)

True of every card here unless its own note in `./CARDS.md` says otherwise.

| ID | Rule |
|---|---|
| `NET.S-01` | **A Pod is `podShell(...)` plus an inner `box(...)`** (app, eth0) in one `g`. The client, kube-proxy, CoreDNS, a bridge and a NIC are infrastructure and light rather than pulse |
| `NET.A-01` | **Every endpoint sits on a block EDGE**, so a ball never travels under or over a block: it fades at one edge and re-emerges at the far edge. That is how a rewrite INSIDE a box (DNAT, SNAT, port remap, conntrack) is drawn, because the box is where the decision happens |
| `NET.A-02` | **Traffic is delivered TO A NODE.** A ball stops on the Node frame edge and the Pod inside pulses to show it was served. No wire and no ball crosses a Node border |
| `NET.A-03` | **N destinations get N wires.** A fan to three candidate backends draws all three even though a step takes one, so the reader sees the choice was made among drawn alternatives. Those unridden legs are NOT a defect and several card records say so |
| `NET.T-01` | **Addresses ride the ball** (`ridingLabel`, `M-30`), never as inline wire text: a dst like `203.0.113.9:443` overflows an 80 unit gap and prints through a block border |
| `NET.S-02` | **`resetStep` must list the inner app boxes BY KEY.** `clearPodHighlight` only resets inline strokes, so a `.highlight` set inside a reduced-replay block leaks into later steps: reduced replay never runs the forward motion path that would re-clear it (`S-19`) |

Several cards leave a `CENTRE-LOW` finding OPEN because the rule counts neither `node()` frames nor
chips, so a card balanced by a frame full of chip rows still reports (`L-17`). Each says so in its
own note.
