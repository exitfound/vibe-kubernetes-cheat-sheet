## network-dns-autoscaling

### layout

```
WHAT     The CoreDNS replica count as a quantity that follows another: a separate controller reads
         the cluster's nodes and cores, turns them into a count through one parameter set, and
         writes it to the Deployment, drawn as meters.
DEVIATES NET.L-01: a meter cell is 40 by 22 and the Deployment frame 450 by 60, both sized by the
         rows they hold, eight cells at a 48 pitch.
         M-12: all eight balls ride `BRISK_HOP_MS` 595, registered in `PACING`, because the 700
         floor makes these short hops crawl.
CONTENT  1.36 sources: Autoscale the DNS Service, DNS for Services, cluster-proportional-autoscaler
         v1.10.3 code. The page says it polls for nodes, the code lists and watches Nodes: card
         follows code. Cores are allocatable CPU, and unschedulable means cordoned or NotReady.
         `--default-params` only seeds an absent ConfigMap, so never `The manifest sets`. No min:
         the chip reads `1 by default`. preventSinglePointFailure lifts to 2 only past one Node.
         Ladder keys named, table the card's own. Opt-in: `When enabled` (T-23). No CPU use input.
```
