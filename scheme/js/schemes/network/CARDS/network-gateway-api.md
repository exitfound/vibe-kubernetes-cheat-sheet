## network-gateway-api

### layout

```
WHAT     A shared Gateway serves a route only when every owner agrees: the class names the
         implementation, the listener admits the route namespace, and a backendRef into a third
         namespace needs a ReferenceGrant, without which matching requests get HTTP 500.
DEVIATES M-12: both tagged legs ride `LEG_DUR` 1500, registered in `PACING`: at the 700 floor a
         tag reads for under half a second.
CONTENT  Sources: Gateway API, HTTPRoute, ReferenceGrant, HTTPBackendRef (v1.35), the apis/v1 types.
         Gateway API is an add-on of custom resources, and no install prevalence is claimed.
         `allowedRoutes` defaults to `from: Same`.
         The only backendRef unresolved and no filters: requests get 500, no backend is configured.
         `here` the implementation runs a proxy, reaching the backend by Service IP or endpoint.
         No persona is named (T-21). One parent, so one Accepted and one ResolvedRefs chip.
OPEN     CENTRE: the chip column at 424..900 stands on the grid the proxy and the grant use, and
         centring it puts its left edge behind the panel wall (L-16).
```
