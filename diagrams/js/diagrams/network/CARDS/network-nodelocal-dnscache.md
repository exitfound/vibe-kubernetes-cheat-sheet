## network-nodelocal-dnscache

### layout

```
WHAT     One lookup to the kube-dns ClusterIP, first DNATed across to CoreDNS on another Node, then
         held on its own Node by the node-local-dns agent, which fetches cluster names from CoreDNS
         over TCP and every other name from the Node resolvers.
DEVIATES L-23: Node-1 floors 46 under the agent, where its two lane pairs mirror about the right
         face midpoint. Node-2 shares the Node-1 top, so CoreDNS stands 46 under it, floor 20.
         L-11: the unpaired Node-2 return lane lands 17.1 percent off its face midpoint, the most a
         floor of 20 allows.
         M-12: every ball rides 15% over its base pace, the tagged legs `LEG_DUR` 1109 and every
         other hop 517, all registered in `PACING`, because the 700 floor makes these hops crawl.
CONTENT  Sources, 1.36: NodeLocal DNSCache, DNS for Services and Pods, nodelocaldns.yaml at
         release-1.36 (node-cache 1.26.7). iptables drawn, IPVS one line. 169.254.20.10 is "here",
         any free link-local fits. The agent dials `kube-dns-upstream` over TCP, so CoreDNS shows
         its Pod IP. Held `between 5 and 30 seconds`, negative 5. Per lookup `is a UDP query`, one
         conntrack entry A and AAAA share: the race. For example.com "never touches CoreDNS" and
         "tries, which are cluster names" are ruled out: Node search domains go upstream.
```
