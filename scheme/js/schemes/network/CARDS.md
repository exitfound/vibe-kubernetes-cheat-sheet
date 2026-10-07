# Scheme card design notes: network

One record per card in `./CARDS/<id>.md`, indexed below in grid order. A record holds only what
the code and `scheme/CANON.md` cannot say, in the shape of CANON's "The record vocabulary".

**Network Foundations**

- [`network-flat-pod-network`](./CARDS/network-flat-pod-network.md)
- [`network-ipam-pod-cidr`](./CARDS/network-ipam-pod-cidr.md)
- [`network-service-cidr`](./CARDS/network-service-cidr.md)
- [`network-dualstack`](./CARDS/network-dualstack.md)
- [`network-namespaces`](./CARDS/network-namespaces.md)
- [`network-kube-proxy-modes`](./CARDS/network-kube-proxy-modes.md)
- [`network-proxy-rule-resync`](./CARDS/network-proxy-rule-resync.md)
- [`network-conntrack-nat`](./CARDS/network-conntrack-nat.md)
- [`network-netfilter-path`](./CARDS/network-netfilter-path.md)
- [`network-ebpf-dataplane`](./CARDS/network-ebpf-dataplane.md)
- [`network-packet-classification`](./CARDS/network-packet-classification.md)
- [`network-policy`](./CARDS/network-policy.md)

**Pod Networking**

- [`network-containers-share-localhost`](./CARDS/network-containers-share-localhost.md)
- [`network-hostnetwork-hostport`](./CARDS/network-hostnetwork-hostport.md)
- [`network-wiring-pod-via-cni`](./CARDS/network-wiring-pod-via-cni.md)
- [`network-pod-ip-and-veth`](./CARDS/network-pod-ip-and-veth.md)
- [`network-pod-to-pod-same-node`](./CARDS/network-pod-to-pod-same-node.md)
- [`network-pod-to-pod-cross-node`](./CARDS/network-pod-to-pod-cross-node.md)
- [`network-mtu-overhead`](./CARDS/network-mtu-overhead.md)
- [`network-pod-egress-snat`](./CARDS/network-pod-egress-snat.md)

**Services & Endpoints**

- [`network-service-types`](./CARDS/network-service-types.md)
- [`network-service-clusterip`](./CARDS/network-service-clusterip.md)
- [`network-service-debugging`](./CARDS/network-service-debugging.md)
- [`network-service-and-endpointslice`](./CARDS/network-service-and-endpointslice.md)
- [`network-service-terminating-endpoints`](./CARDS/network-service-terminating-endpoints.md)
- [`network-traffic-distribution`](./CARDS/network-traffic-distribution.md)
- [`network-internal-traffic-policy`](./CARDS/network-internal-traffic-policy.md)
- [`network-externalname`](./CARDS/network-externalname.md)

**External Traffic**

- [`network-nodeport-loadbalancer`](./CARDS/network-nodeport-loadbalancer.md)
- [`network-external-traffic-policy`](./CARDS/network-external-traffic-policy.md)
- [`network-loadbalancer-without-cloud`](./CARDS/network-loadbalancer-without-cloud.md)
- [`network-loadbalancer-straight-to-pods`](./CARDS/network-loadbalancer-straight-to-pods.md)
- [`network-ingress-routing`](./CARDS/network-ingress-routing.md)
- [`network-gateway-api`](./CARDS/network-gateway-api.md)
- [`network-gateway-traffic-splitting`](./CARDS/network-gateway-traffic-splitting.md)
- [`network-client-ip-preservation`](./CARDS/network-client-ip-preservation.md)

**DNS & Service Discovery**

- [`network-dns-coredns`](./CARDS/network-dns-coredns.md)
- [`network-dns-records`](./CARDS/network-dns-records.md)
- [`network-dns-pod-policy`](./CARDS/network-dns-pod-policy.md)
- [`network-dns-ndots`](./CARDS/network-dns-ndots.md)
- [`network-dns-egress-policy`](./CARDS/network-dns-egress-policy.md)
- [`network-nodelocal-dnscache`](./CARDS/network-nodelocal-dnscache.md)
- [`network-dns-autoscaling`](./CARDS/network-dns-autoscaling.md)
- [`network-headless-service`](./CARDS/network-headless-service.md)
