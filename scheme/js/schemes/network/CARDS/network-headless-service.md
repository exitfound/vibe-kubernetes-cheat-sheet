## network-headless-service

### layout

```
WHAT     clusterIP None moves discovery into DNS: the Service name resolves to the ready Pods, the
         client picks and connects on its own, and each StatefulSet Pod keeps a name of its own
         while its address changes.
DEVIATES M-12: the eight lookup legs ride `BRISK_HOP_MS` 595, registered in `PACING`, because the
         700 floor makes the 152 unit legs crawl.
CONTENT  Sources: Headless Services, DNS for Services and Pods, StatefulSet network ID (v1.35).
         `no kube-proxy rules and no load balancing from the platform`: `loadbalance` only shuffles.
         A headless Service with no selector gets no EndpointSlice, so `with a selector`.
         `Under the default ClusterFirst DNS policy` the lookup still goes through kube-dns.
         `which lets a client reach one specific replica`, a record that exists only while ready.
         `30 seconds under kubeadm`: the CoreDNS plugin default TTL is 5.
OPEN     CENTRE: the answer column at 760..1160 is derived from the discovery column beside it, and
         at 600 it would stand on top of that column.
```
