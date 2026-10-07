## network-dns-coredns

### layout

```
WHAT     A name resolved through the CoreDNS plugin chain: which stage answers it, where that stage
         gets its answers, and the answer coming back out through cache.
DEVIATES NET.L-01: the resolv.conf chips are 320 wide, because `search` and its value fill a 232
         chip. They are a file, not an actor row.
         T-09: the three stage labels stay lowercase, the literal plugin names (`KNOWN_CASING`).
CONTENT  Sources: DNS for Services and Pods, CoreDNS chain order, kubernetes and cache plugins.
         The chain order is `plugin.cfg`, not the Corefile: cache, then kubernetes, then forward.
         cache is `the first stage that can answer`: prometheus, errors and loadbalance run ahead.
         The plugin answers from its own watch of Services and EndpointSlices, per `controller.go`.
         Each replica caches alone: `the next lookup of this name that lands on this Pod`.
         The Kubelet `configures` resolv.conf. The search chip reads `default.svc.cluster.local +2`.
OPEN     CENTRE-LOW: the API server that balances the card stands above the panel bottom, so the
         rule sees only the blocks on 70..852 (L-17).
```
