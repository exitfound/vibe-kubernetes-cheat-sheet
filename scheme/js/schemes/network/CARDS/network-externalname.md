## network-externalname

### layout

```
WHAT     Two ways a selectorless Service points outside, from one client: ExternalName answers a
         CNAME and the client connects with the wrong SNI and Host, while a ClusterIP Service with a
         hand-written EndpointSlice is DNATed to an outside address.
DEVIATES NET.L-01: the slice frame is 320, held by `kubernetes.io/service-name: pg` and its endpoint
         chip. The client Pod is 232 by 110, the card's own height.
CONTENT  Sources: ExternalName Services, Services without selectors, ServiceSpec (v1.35).
         The DNS answer carries the CNAME and its target's address, so `connect` says `With that
         address`. `api.default.svc` matches on the third search entry: `after two misses`.
         HTTP `has the same problem`, TLS `rejects the handshake`.
         The slice links by the service-name label alone, and kube-proxy proxies it as written.
         A nil endpoint condition counts as ready, and 203.0.113.5 is a legal endpoint.
OPEN     CENTRE: the report reads the SNI and cert pair and the endpoint row as one strip. They are
         two placements bound to the host and to the slice, and centring breaks both.
```
