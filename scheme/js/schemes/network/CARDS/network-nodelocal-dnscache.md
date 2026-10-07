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
         M-12: the tagged legs ride `LEG_DUR` 1275 and every other hop `BRISK_HOP_MS` 595, all
         registered in `PACING`, because the 700 floor makes these short hops crawl.
CONTENT  Sources: NodeLocal DNSCache, DNS for Services and Pods, nodelocaldns.yaml (v1.35).
         Drawn in iptables mode, where the agent binds the ClusterIP too. IPVS is one sentence.
         The agent forwards to `kube-dns-upstream` over TCP, so CoreDNS carries its Pod IP.
         A record is held `for its record TTL, held between 5 and 30 seconds`, a negative one for 5.
         One conntrack entry per lookup: A and AAAA share one socket, and that entry is the race.
         `each lookup from a ClusterFirst Pod is a UDP query`.
```
