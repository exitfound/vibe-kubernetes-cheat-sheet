## network-gateway-api

### layout

```
WHAT     A shared Gateway serves a route only when every owner agrees: the class names the
         implementation, the listener admits the route namespace, and a backendRef into a third
         namespace needs a ReferenceGrant, without which matching requests get HTTP 500.
DEVIATES M-12: every ball rides 10% over its base pace, registered in `PACING`. The tagged legs
         base on 1500, since at the 700 floor a tag reads for under half a second.
         M-13: the two requests ride 636, under the 700 floor, by the same 10%.
CONTENT  Sources: Gateway API (v1.36), and HTTPRoute, ReferenceGrant, HTTPBackendRef and the
         apis/v1 types of Gateway API v1.5.1, the release current with 1.36. An add-on of custom
         resources, no install prevalence claimed. `allowedRoutes` defaults to `from: Same`.
         The only backendRef unresolved and no filters: requests get 500, no backend is configured.
         `here` the implementation runs a proxy, reaching the backend by Service IP or endpoint.
         No persona is named (T-21). One parent, so one Accepted and one ResolvedRefs chip.
OPEN     CENTRE: the chip column at 424..900 stands on the grid the proxy and the grant use, and
         centring it starts it at 362, left of the L-03 line at 420 above the panel bottom (L-16).
```
