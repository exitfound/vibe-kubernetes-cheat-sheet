## network-loadbalancer-without-cloud

### layout

```
WHAT     With no cloud balancer, MetalLB first allocates the address into the Service status and its
         speakers then announce it to the upstream router, by ARP in layer 2 mode and BGP in BGP
         mode, before any client traffic comes down.
DEVIATES NET.L-01: the Pods are 200 by 96. 96 is what the speaker chip stack leaves in the frame,
         200 is the card's own.
         M-12: every ball on an elbow leg takes `LEG_DUR` 1400, registered in `PACING`. At the 724
         to 831 of `routeDur` its tag retires before it is read.
         P-03: the `address pool` chip reads from `idle`, declared before anything is allocated.
CONTENT  Sources: Service type LoadBalancer (v1.36), MetalLB v0.16.1 concepts, layer 2, BGP, source.
         The controller allocates and the speakers announce: an allocated address is not reachable.
         `for Service web`: pool and mode are MetalLB objects. A BGP remap breaks `most`, not all.
         `l2` hashes Node and address over the candidates only. `gratuitous ARPs`: a timed burst.
         Failure is seen through memberlist: `unreachable`, not NotReady, `usually` a few seconds.
         `bgp`: `multipath on`, `typically hashes`. The speaker peers per the docs, FRR-K8s or not.
```
