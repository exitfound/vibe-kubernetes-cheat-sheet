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
CONTENT  Sources: Autoscale the DNS Service, cluster-proportional-autoscaler, DNS for Services.
         `--default-params` only seeds a ConfigMap that is absent, so never `The manifest sets`.
         `min` is not in the manifest, so the chip reads `1 by default`.
         preventSinglePointFailure lifts to 2 replicas only with more than one node.
         The ladder keys are named in the narration, and the ladder table is the card's own example.
         The autoscaler is opt-in: `When enabled` (T-23). CPU use is no input, unlike an HPA.
```
