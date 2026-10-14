## network-service-and-endpointslice

### layout

```
WHAT     The EndpointSlice controller derives a list from live Pods, one endpoint per selected Pod
         with its address and ready condition, and kube-proxy builds rules from the ready endpoints.
DEVIATES NET.L-01: the three Pods are 250 by 120 with a 210 by 48 app box, the card's own size.
         A-08: the comb relation draws at full stroke-opacity through `tune`. At 0.45 it reads
         fainter than the dashed arrows it meets.
CONTENT  Sources: Service, EndpointSlices, Probes, Pod Lifecycle (v1.36), 1.36 endpointslice code.
         Row `address · condition`, the port is a slice field. Pod `Ready` and endpoint `ready` are
         two fields. `one endpoint per Pod with an IP`. The `idle` placeholder slice is real and is
         updated in place, so its name holds. `by default` on 100. `keeps failing` its probe.
         Terminating fallback rules out `ready only`. publishNotReadyAddresses keeps ready=true.
         Doc vs code: Pod Lifecycle says a failed probe removes the IP, the code keeps ready=false.
```
