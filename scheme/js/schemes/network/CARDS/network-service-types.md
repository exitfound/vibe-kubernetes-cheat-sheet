## network-service-types

### layout

```
WHAT     The proxy Service types as one path growing outward, LoadBalancer over NodePort over
         ClusterIP over a Node of two Pods, while ExternalName and headless stand aside and are
         answered by CoreDNS without entering the stack.
DEVIATES NET.L-01: the backend Pods are 210 by 104 so two fit the 500 Node frame with a 40 gap for
         the spine. The client Pod is 232 by 110, the card's own height.
         P-03: the chips stand lit from entry. Each is a spec or status field that exists before any
         packet, and the ball reads the rules they produced.
CONTENT  Sources: Service, Virtual IPs and Service Proxies, DNS for Services and Pods, ServiceSpec.
         Headless is `type ClusterIP` with `clusterIP None`, never a type, ExternalName `not set`.
         The NodePort to ClusterIP tag reads `same Service rules`: no packet is sent to the VIP.
         The balancer `typically` feeds the node port, `allocateLoadBalancerNodePorts` is the
         exception. No narration names kube-proxy (T-21). Never `through DNS alone`.
         A fifth source wraps the footer and drops the panel past CoreDNS.
OPEN     CENTRE: the chip column at 908..1140 reads the fields beside the layers they describe, and
         a bottom strip has no room under the Node frame.
         The headless tag crosses the Client Pod right face as it leaves: the run beside the Pod is
         28 units and the tag 61.
```
