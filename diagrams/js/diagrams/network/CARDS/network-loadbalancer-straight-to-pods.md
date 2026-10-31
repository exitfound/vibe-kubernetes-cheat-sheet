## network-loadbalancer-straight-to-pods

### layout

```
WHAT     A balancer targets Pods because its implementation reads the Service endpoints and
         registers each Pod IP as a target, so a connection crosses one Node with no SNAT, while
         allocateLoadBalancerNodePorts false only stops allocating the Node ports it never uses.
DEVIATES M-12: the balancer legs ride `LEG_DUR` 1800, registered in `PACING`, because at `routeDur`
         the reader cannot follow them.
CONTENT  Sources: Disabling load balancer NodePort allocation, EndpointSlices, ServiceSpec, Using Source IP (v1.36).
         The field frees no allocated port, and kube-proxy writes rules for any port that remains.
         `nodeports` SNATs `under the default externalTrafficPolicy Cluster`. No claim the client IP survives.
         How the balancer learns its endpoints and checks a target is the implementation's call:
         `here an EndpointSlice`, `here a probe`. No step says only ready endpoints get registered.
         The readout `path through Nodes` counts Nodes crossed. In `replace` the balancer probes, not the controller.
OPEN     CENTRE: the report pools the in-frame nodePort chips with the top-right readouts (L-17).
         Mirroring the readouts to the top left puts them under the narration panel.
```
