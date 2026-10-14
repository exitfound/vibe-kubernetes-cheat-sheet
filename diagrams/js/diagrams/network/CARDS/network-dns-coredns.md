## network-dns-coredns

### layout

```
WHAT     A name resolved through the CoreDNS plugin chain: which stage answers it, where that stage
         gets its answers, and the answer coming back out through cache.
DEVIATES T-09: the three stage labels stay lowercase, the literal plugin names (`KNOWN_CASING`).
CONTENT  Sources, 1.36: DNS for Services and Pods, Customizing DNS Service, kubeadm Corefile, and
         CoreDNS v1.14.2 plugin.cfg, kubernetes, cache. Chain order: cache, kubernetes, forward.
         cache is `the first stage that can answer`: prometheus, errors, loadbalance run ahead.
         The plugin answers from its own Service and EndpointSlice watch. Kubelet `configures`.
         Search chip `default.svc.cluster.local +2`. Each replica caches: `that lands on this Pod`.
         Docs vs code: the docs Corefile caches cluster.local, kubeadm sets `disable success` on it.
         Over the cache readout: `kubeadm: cluster.local not cached`, success and denial both.
         The answer step closes on `Under kubeadm it goes to the kubernetes plugin every time`.
OPEN     CENTRE-LOW: the API server that balances the card stands above the panel bottom, so the
         rule sees only the blocks on 70..852 (L-17).
```
