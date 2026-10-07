## network-loadbalancer-without-cloud

### layout

```
WHAT     With no cloud balancer, MetalLB first allocates the address into the Service status and its
         speakers then announce it to the upstream router, by ARP in layer 2 mode and BGP in BGP
         mode, before any client traffic comes down.
DEVIATES NET.L-01: the Pods are 200 by 96. 96 is what the speaker chip stack leaves in the frame,
         200 is the card's own.
         M-12: the ARP reply takes `LEG_DUR` 1400, registered in `PACING`. At the 726 of `routeDur`
         its tag retires before it is read.
         P-03: the `address pool` chip reads from `idle`, declared before anything is allocated.
CONTENT  Sources: Service type LoadBalancer (v1.35), MetalLB concepts, layer 2 and BGP, the source.
         The controller allocates and the speakers announce: an allocated address is not reachable.
         The caption is `for Service web`: the pool and the mode are MetalLB objects.
         `l2` sorts the eligible Nodes by a hash of Node and address, over the candidates only.
         Failure is seen through memberlist: `unreachable`, not NotReady, `usually` a few seconds.
         `bgp` needs `a router with multipath on` that `typically hashes` each connection.
```
