## network-dns-records

### layout

```
WHAT     One name, several kinds of answer: A, SRV, Pod and headless records off the same resolver,
         with the query name changing segment by segment per record kind.
DEVIATES NET.L-01: the client Pod is 210 by 130 with a 170 by 50 resolver box, the card's own size.
         M-12: every tagged leg, query, answer and reply, rides `LEG_DUR` 1091, 10% over a base
         1200, registered in `PACING`, not the 700 floor.
         P-03: the question chip stands at entry with the FQDN band, the premise of the step.
CONTENT  Sources, 1.36: DNS for Services and Pods, Customizing DNS Service, kubeadm Corefile,
         kubelet dns.go, CoreDNS v1.14.2 kubernetes plugin. Headless asks the same name as A.
         The Pod record predates the DNS spec, kept for kube-dns compatibility.
         `With pods enabled in CoreDNS`: the plugin default is disabled, kubeadm sets insecure.
         `Under the default ClusterFirst policy`: hostNetwork falls back to Default. kube-proxy
         writes rules and forwards nothing. `one A record per ready Pod`, `A stable way`.
         Aria `CoreDNS answers with`, not `answers it`: SRV and Pod records use other names.
```
