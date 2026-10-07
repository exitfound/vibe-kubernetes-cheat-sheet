## network-nodeport-loadbalancer

### layout

```
WHAT     A NodePort opens one port on every Node, so even Node-2 with no Pod answers and passes the
         request on, and a LoadBalancer puts one address in front of those Nodes.
DEVIATES L-23: Node-2 holds no backend and keeps the row height, so it reads as a peer that opens
         the same port as the other two.
         NET.L-01: both Pods are 200 by 112 with a 160 by 46 app box, the card's own size.
         M-12: the Node-1 leg on `client-hit` takes `LEG_DUR` 1500, registered in `PACING`. At the
         911 of `routeDur` its tag retires before it is read.
         P-03: `lb-provision` turns `type` at entry, the request the controller answers.
CONTENT  Sources: Service, Virtual IPs and Service Proxies (v1.35), Using Source IP, the proxier.
         `every Node proxies that same port`. KUBE-NODEPORTS comes `In its default iptables mode`.
         Node-2 is said to have the rule, which holds under Local as well as Cluster.
         `direct` puts the Cluster policy before the DNAT and forward, and orders no SNAT.
         The balancer is `typically pointed at port 31000 on every Node`.
         ipMode VIP delivery is a conditional, `would deliver`, on `client-hit`.
```
