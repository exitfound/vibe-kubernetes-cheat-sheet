## network-traffic-distribution

### layout

```
WHAT     Which ready endpoint a Service connection reaches, and the two fields that bend the pick:
         sessionAffinity ClientIP pins a client in the dataplane, trafficDistribution
         PreferSameZone keeps kube-proxy's rules in its own zone and falls back when it has none.
DEVIATES NET.L-01: the backends are 240 by 96 and the client 200 by 110, the card's own sizes.
         P-03: on `topology` and `fallback` the zone chip, the dim and the lit kube-proxy stand from
         entry. Zone choice happens at programming time, before the connection.
CONTENT  Sources: Traffic Distribution Control, Service Session Affinity (v1.35), the 1.35 proxiers.
         The window counts from the last new connection: `reconnects within the sticky window`.
         The pin is written as the first connection is DNATed: `the Pod it picked`, and it holds
         `while that Pod stays in the rules`. PreferSameZone is GA, `PreferClose` its alias.
         Only ready endpoints are hinted, and the fallback is to all ready endpoints, not zone-b.
         Never `topology-aware routing`, the older annotation the field is contrasted with.
```
