# CLAUDE.md `schemes/network/` (Traffic flow)

What is true of Networking cards ALONE. Everything catalog-wide is in **`scheme/CANON.md`** (the
rulebook: layout, arrows, motion, colour, text, chips, metadata, posters, module structure) and
`scheme/CLAUDE.md` (the contract: folder, module, catalog, checklists). **If a rule here would also
be true of another category, it is in the wrong file.**

The rows below carry `NET.*` ids and are indexed from `scheme/CANON.md`. **The TEXT of a `NET.*`
rule lives here and only here**: the canon carries the id and a subject label, never a second copy
of the rule. Where an id could name two different rules, the FOLDER keeps it. No `NET.*` id is in
that position, and keeping the text in one place is how that stays true.

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

The shared list (`S-22`), the `P` / `F` / `defineCard` bindings every category kit makes, `POD_VIOLET`
and the six `lib/layout.js` formulas, plus `NETWORK_TINT` and its two pulses. **No networking-only
helper, and no geometry grammar.** Measured over the 37 cards: 17 name a content band and those carry
six different literal pairs, the other 20 hang off a `node()` frame or off nothing shareable, and
there is no `NET.L-*` rule for a grammar to serve. What the category really shares is the lane pair
and `CHIP_H` 34, and `lib/layout.js` already carries the formula half of that.

## The escape hooks this category still needs

All 37 cards are in the declarative form. **31 are fully declarative**; six carry a hook, and each
exists for something with no honest general verb. `step.motion` and `F.run` are used by NOBODY here.

| Card | Hook | What it wraps, and why no field expresses it |
|---|---|---|
| `network-model` | `P.raw` x5, `tune` x4 | The flat-network band is a hand-forged `g.scheme-box` carrying `data-role` and six ordered children, which `P.group` cannot express. The four Pod wires are bare `<line>` with BOTH `marker-start` and `marker-end`, where the lane kinds emit a `<path>` with `marker-end` only. The four `tune` hand the `.scheme-pod-sublabel` child up as a ref, because the IP fade needs a target no part kind keys |
| `network-kube-proxy-modes` | `P.raw`, `tune` x2 | The IPVS engine is a box plus a row of seven `.scheme-grid-cell` rects, and no part kind emits a bare `<rect>`. The two `tune` file a `P.wire` into the MAIN ref bucket as well, because `F.anim` and `rewind` read `s.refs[k]` while a wire lands only in `refs.wires[k]` |
| `network-namespaces` | `P.raw` x2, `tune` x1 | The `veth` cable is an ARROW a ball rides, so `A-06` forbids `P.relation`, and a two-ENDED cable takes no arrowhead: `pathArrow` writes `marker-end` unconditionally, so the tune strips it. The netns shell is a lone `podShell` sitting as a plain sibling, where `P.pod` would wrap it in its own `g`. The stack band is a bare `<rect>` |
| `network-pod-ip-and-veth` | `P.raw`, `enter`, `reset.extra` | Its Pod comes from `pod()` rather than `podShell()`, which writes an inline fill that lands in the serialised tree, and it carries two sibling containers against `buildPod`'s one `inner`. The `enter` and the `extra` write **`stroke-opacity`**, which no field writes: the `opacity` field goes to `style.opacity`, a different property |
| `network-dns-coredns`, `network-pod-localhost` | `tune` | The Pod holds three (CoreDNS) or four (localhost) peer container boxes against `buildPod`'s single `inner`, and they must sit INSIDE the shell group because `pulsePod` reaches only what the Pod contains. The `workloads-init-containers-and-sidecars` precedent |

**A `tune` or a `raw` factory must assign a LITERAL ref key** (`refs.podASub = ...`), never a computed
one (`refs[k] = ...`): `unit/spec-steps.test.mjs` reads escape bodies for `refs.x =`, and a computed
key is invisible to it, so every write through that ref is reported as naming nothing. That cost a
repair on `network-model`.

**A `raw` whose element deliberately imitates a kind is declared**, because the test cannot read
inside a `make()`: `RAW_SHAPED_AS` in `unit/spec-scene.test.mjs` carries `network-model.bus` as a box
and `network-pod-ip-and-veth.podShell` as a podShell. Growing that table is the coordinator's job.

`reducedLit` is declared on **33 of the 37 cards over 89 steps**, against 20 steps in workloads and 2
in the whole of cluster. The shape is always the same, and four cards show its limit case: they carry
no `lightBoxAt` at all, so `flowLights` returns `[]` on every step and the entire static path rests on
`reducedLit`. A wrong derivation lands on the HIGHLIGHT axis of `render/reduced.test.mjs`, which is
enforced, so `npm test` is what catches it: on these four it is the ONLY thing that would.

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
