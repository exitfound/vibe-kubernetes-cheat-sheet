## network-service-and-endpointslice

### layout

```
WHAT     The EndpointSlice controller derives a list from live Pods, one endpoint per selected Pod
         with its address and ready condition, and kube-proxy builds rules from the ready endpoints.
DEVIATES NET.L-01: the three Pods are 250 by 120 with a 210 by 48 app box, the card's own size. The
         slice frame is sized by its rows.
         A-08: the comb relation draws at full stroke-opacity through `tune`. At 0.45 it reads
         fainter than the dashed arrows it meets.
CONTENT  Sources: Service, EndpointSlices (v1.35), the EndpointSlice API, the 1.35 source.
         The port is a field of the slice, so a row reads `address · condition`.
         The Pod's `Ready=True` and the endpoint's `ready=true` are two fields, both spelled out.
         `one endpoint per Pod with an IP`. The empty placeholder slice on `idle` is real.
         100 endpoints per slice is a default, so `by default`. Readiness flips on thresholds, so a
         Pod `keeps failing its readiness probe`. Terminating fallback rules out `ready only`.
```
