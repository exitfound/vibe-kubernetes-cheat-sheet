## network-ingress-routing

### layout

```
WHAT     An Ingress controller as an L7 proxy: it reads Ingress shop, picks a rule by Host and the
         longest path, looks the Pod IP up in the chosen Service's EndpointSlice and connects to the
         Pod directly, and answers a host no rule names itself.
DEVIATES NET.L-01: the controller and both backend Pods are 232 by 114, the card's own height.
         M-12: the tagged branch balls ride `LEG_DUR` 1500, registered in `PACING`, because the 302
         unit branch on `routeDur` is too fast to read the tag.
         P-03: on `match-api` and `no-match` the request chips turn on arrival, `servedChip` waits
         for its own beat.
CONTENT  Sources: Ingress, Ingress Controllers (v1.36), NGINX Ingress Controller 5.4 annotations.
         Class `nginx` is that maintained controller, never the retired kubernetes/ingress-nginx.
         It proxies to Pod IPs unless `use-cluster-ip`, so the desc keeps `commonly`. The desc
         closes on the API being GA and frozen, never on one controller's retirement.
         Longest path, then Exact over Prefix: `the Ingress spec gives precedence`. TLS ends at
         the controller. `No Ingress of this class names that host`, default backend answers 404.
```
