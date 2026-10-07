## network-service-debugging

### layout

```
WHAT     A Service whose name resolves but whose call never reaches the app, and the three links
         that decide it: selector against labels, readiness against the serving set, targetPort
         against the listening port.
DEVIATES NET.L-01: both Pods are 210 by 120 with a 170 by 52 box, the card's own height.
         P-05: a chip going back to its healthy value stays unlit, so the lit row alone says which
         kind of failure the step is.
CONTENT  Sources: Debug Services, Service, EndpointSlices (v1.35), the kubernetes source.
         A numeric targetPort lands in the endpoint as is, a named one follows the declared port.
         On `wrong-port` the packet reaches the Pod on a port nothing listens on, so `the app`.
         publishNotReadyAddresses is named on `not-ready`, in the desc and in the aria-label.
         A Service selecting nothing keeps a placeholder slice. The slice name is generated.
         What the client sees is unstated: reject, drop or nothing depends on the proxy mode.
```
