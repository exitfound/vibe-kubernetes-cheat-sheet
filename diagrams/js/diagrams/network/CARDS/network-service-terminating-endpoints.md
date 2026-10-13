## network-service-terminating-endpoints

### layout

```
WHAT     A rolling update retires web-c without dropping a request: web-d is Ready first, the web-c
         endpoint stops taking new connections, its established flow finishes on conntrack, and it
         exits at 14s inside a 30s grace period drawn as a clock.
DEVIATES NET.L-01: the client is 190 by 110 and the backends 210 by 100, the column
         `network-service-clusterip` opens, all the card's own sizes.
CONTENT  Sources (v1.36): EndpointSlices, Termination of Pods, Virtual IPs, Max Unavailable, proxy.
         On `delete` the endpoint turns ready=false and terminating=true, serving follows readiness.
         The flip and the preStop sleep start at deletion, SIGTERM waits for the hook. web-d's
         endpoint turns ready=true, listed before Ready. web-c's leaves once the Pod is terminal.
         The long request rides TCP conntrack (pkg/proxy cleans UDP only), not the fallback.
         Virtual IPs gives the fallback to Local, code to Cluster too. `no request was dropped`.
OPEN     CENTRE: the condition chips are the rows of the slice frame and take its column (L-16).
         `delete` and `gone` stand still half their hold, and all they name is drawn (M-19a).
         The web-c leg tag inks across the dataplane and web-c faces: both span the leg's band.
```
