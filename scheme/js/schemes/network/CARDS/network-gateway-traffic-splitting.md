## network-gateway-traffic-splitting

### layout

```
WHAT     A weighted HTTPRoute rule gives each backend its weight over the sum of weights, whatever
         its Pod count, a header rule can take test traffic first, and an unresolved backend keeps
         its share as HTTP 500, drawn as a proportion bar inside the Gateway.
DEVIATES NET.L-01: the Pods are 128 by 104 so three fit a Service frame, 3 x 128 + 2 x 16 + 2 x 14.
         M-12: the two tagged balls ride `LEG_DUR` 1125, registered in `PACING`. At the 700 floor
         the tag is gone before it reads.
         P-05: `one-backend` lights the weights chip with no change, because the step introduces
         the weight the chip shows.
CONTENT  Sources: HTTP traffic splitting, HTTPRoute, HTTPBackendRef, Gateway API (v1.6.2 types).
         A weight is a share of the sum: `about a tenth of the requests this rule matches`.
         A lone backend takes every request only with a weight above 0.
         The header rule wins because both rules match prefix / and neither names a method.
         An invalid backend's share gets 500 and moves nowhere. The header rule's 500 needs its only
         backendRef and no filters. The chip names the method, `GET shop.io/`.
OPEN     CENTRE: the chip column stands in the gap between two unequal frames. At 600 it covers the
         web-v1 frame, and equal frames lose the 3 against 1 the split is argued against.
```
