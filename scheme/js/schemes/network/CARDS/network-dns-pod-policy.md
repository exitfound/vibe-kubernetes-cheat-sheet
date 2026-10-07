## network-dns-pod-policy

### layout

```
WHAT     How the Kubelet builds a Pod's resolv.conf: dnsPolicy picks the cluster settings, the Node
         resolver file or nothing, and dnsConfig merges on top of whichever base it produced.
CONTENT  Sources: Pod DNS policy and Config, Kubelet Configuration, Debugging DNS (v1.35).
         An unset dnsPolicy defaults to ClusterFirst, which reads the Node file for search only.
         A hostNetwork Pod on ClusterFirst falls through to Default with no event: `quietly`.
         The Default copy is not `unchanged`: the nameserver cap and duplicate removal still apply.
         `resolvConf` `should` name the systemd file, the stub can cause a forwarding loop.
         dnsConfig merges without duplicates and by option name: `only lab.test is new`.
```
