## network-dns-records

### layout

```
WHAT     One name, several kinds of answer: A, SRV, Pod and headless records off the same resolver,
         with the query name changing segment by segment per record kind.
DEVIATES NET.L-01: the client Pod is 210 by 130 with a 170 by 50 resolver box, the card's own size.
         M-12: the tagged query leg rides `LEG_DUR` 1200, registered in `PACING`, not the 700 floor.
         P-03: the question chip stands at entry with the FQDN band, the premise of the step.
CONTENT  Sources: DNS for Services and Pods, CoreDNS kubernetes plugin, Customizing DNS Service.
         The band is the live query name, and headless asks the same name as A.
         The Pod record is framed as predating the DNS spec, kept for kube-dns compatibility.
         `With pods enabled in CoreDNS`: the plugin default is disabled, kubeadm sets insecure.
         `Under the default ClusterFirst policy`: hostNetwork falls back to Default.
         `one A record per ready Pod`, and a StatefulSet hostname is `A stable way`, not `The`.
```
