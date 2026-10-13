## network-headless-service

### layout

```
WHAT     clusterIP None moves discovery into DNS: the Service name resolves to the ready Pods, the
         client picks and connects on its own, and each StatefulSet Pod keeps a name of its own
         while its address changes.
DEVIATES M-12: the eight lookup legs ride `BRISK_HOP_MS` 595, registered in `PACING`, because the
         700 floor makes the 152 unit legs crawl.
CONTENT  Sources, 1.36: Headless Services, DNS for Services and Pods, StatefulSet network ID,
         kube-proxy and endpointslice code, kubeadm Corefile, CoreDNS v1.14.2 kubernetes plugin.
         `no kube-proxy rules and no load balancing from the platform`: `loadbalance` only shuffles.
         `with a selector`: else no slice. `default ClusterFirst`. A Pod name is served while ready.
         `30 seconds under kubeadm`: the plugin default TTL is 5. Docs vs code: the StatefulSet page
         says CoreDNS caches 30s, kubeadm sets `disable success` on cluster.local, so clients cache.
OPEN     CENTRE: the answer column at 760..1160 is derived from the discovery column beside it, and
         at 600 it would stand on top of that column.
```
