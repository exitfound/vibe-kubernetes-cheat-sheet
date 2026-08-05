# CLAUDE.md `schemes/network/` (Traffic flow)

What is true of Networking cards only. Everything else is in `scheme/CLAUDE.md`: the module
contract, the card construction standard, the motion canon, the opacity vocabulary, the
reduced-motion contract, the writing rules and the gate. If a rule here would also be true of
another category, it is in the wrong file.

## The folder

| File | Owns |
|---|---|
| `cards.js` | the 37 `SCHEMES` entries and the `SUBCATEGORIES` list for this category |
| `posters.js` | the 37 grid thumbnails, keyed by card id |
| `network-kit.js` | the tint and the two pulse wrappers; everything else is re-exported from `lib/scheme-kit.js` |
| `network-*.js` | one module per card |

A card imports `../../lib/svg.js`, `../../lib/primitives.js` and `./network-kit.js`. Never reach
past the kit into `scheme-kit.js` directly. Nothing else may live here: `R-modulepath` reports any
other `.js` in this folder as unclaimed.

## Tint

```js
NETWORK_TINT = { base: 'rgb(79, 229, 255)', bright: 'rgb(158, 234, 247)' }   // cyan
```

`base` must equal the Pod's RESTING stroke, which is the CSS value before any pulse has run.
Measure it under `reducedMotion`, or a forwards-filled pulse hands you back its own end state.

Networking is the one category whose colour appears as a LITERAL in `diagrams.css`:
`.scheme-packet` and `.scheme-ripple` pin `#4fe5ff` on purpose, because the tint stop made the
ball read washed out. Do not fold those into tokens.

## Kit surface

The shared 30 names plus `NETWORK_TINT`, `pulsePod`, `pulsePodDim`. No networking-only helper.

## Subcategories

| key | label | cards | what belongs here |
|---|---|---|---|
| `network-foundations` | Network Foundations | 8 | the model and the machinery under every other card: the flat address promise, namespaces, CIDRs, the proxy and dataplane implementations |
| `pod-networking` | Pod Networking | 8 | one packet's path at Pod level: how an interface comes to exist and how a frame gets from one Pod to another |
| `services-endpoints` | Services & Endpoints | 8 | the Service abstraction and what backs it: VIP resolution, EndpointSlice reconciliation, port mapping, selection policies |
| `external-traffic` | External Traffic | 8 | traffic that starts outside the cluster: NodePort, LoadBalancer, Ingress, Gateway, TLS, and what happens to the source IP |
| `dns-service-discovery` | DNS & Service Discovery | 5 | name resolution: CoreDNS, record shapes, resolver behaviour, caching |

The line between `services-endpoints` and `external-traffic` is where the client is, not which
object appears: a Service card that starts at an external client belongs in `external-traffic`.

## Exemplar

`network-service-clusterip.js`. Copy its shape for a new networking card: parallel forward and
return flow lanes plus a right-angle fan.

## Riding labels

Networking and Storage both ride an address tag on the ball. That rule is shared and lives once,
in `scheme/CLAUDE.md` under "Riding labels and `lightBoxAt`". Read it before adding a tag: the
easing has to match the ball it rides, and a wrong one drifts off mid-flight in a way no static
screenshot shows.
