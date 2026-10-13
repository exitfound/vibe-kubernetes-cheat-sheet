## network-dns-pod-policy

### layout

```
WHAT     How the Kubelet builds a Pod's resolv.conf: dnsPolicy picks the cluster settings, the Node
         resolver file or nothing, and dnsConfig merges on top of whichever base it produced.
DEVIATES M-12: every ball is tagged and rides `LEG_DUR` 1100, registered in `PACING`. At the 700
         floor a tag retires before it is read.
CONTENT  Sources, 1.36: DNS for Services and Pods, Kubelet Configuration, Debugging DNS, dns.go.
         An unset dnsPolicy is defaulted to ClusterFirst, which reads the Node file for search only.
         hostNetwork on ClusterFirst falls to Default with no event: `quietly`. Default is not
         `unchanged`: three line kinds read, nameservers cut to 3. `resolvConf` `should` name the
         systemd file, the stub can loop. Searches dedup: `only lab.test is new`. Docs drop
         duplicate options, the code (followed) replaces one by name.
```
