## network-service-debugging

### layout

```
WHAT     A Service whose name resolves but whose call never reaches the app, and the three links
         that decide it: selector against labels, readiness against the serving set, targetPort
         against the listening port.
DEVIATES NET.L-01: both Pods are 210 by 120 with a 170 by 52 box, the card's own height.
         P-05: a chip going back to its healthy value stays unlit, so the lit row alone says which
         kind of failure the step is.
         A-13: the arrow into the Pod stays at full on `not-ready` while the Pod dims. An arrow is
         never opacity-dimmed, the Pod alone says the path is not served.
CONTENT  Sources: Debug Services, Service, EndpointSlices (v1.36), endpointslice, pkg/proxy (1.36).
         A numeric targetPort lands in the endpoint as is, a named one follows the declared port.
         On `wrong-port` the packet reaches the Pod on a port nothing listens on, so `the app`.
         publishNotReadyAddresses (`not-ready`, aria-label) sets ready, never serving.
         A Service selecting nothing keeps a placeholder slice. The slice name is generated.
         What the client sees is unstated: reject, drop or nothing depends on the proxy mode.
```
