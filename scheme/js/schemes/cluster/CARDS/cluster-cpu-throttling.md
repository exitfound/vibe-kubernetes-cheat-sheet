## cluster-cpu-throttling

### layout

```
WHAT     A container hitting its CPU limit: the CFS quota, the stall at the end of every period, and
         the Kubelet finding out from cpu.stat.
DEVIATES L-13: the period bars are bare rects, not P.box. Boxes at y 248 and 302 count in
         CENTRE-LOW and drag the low centre toward 900. Their colours sit in one frozen BAR block.
         P-03: on `observe` the cpu.stat chip is lit and true before the scrape lands. The kernel
         counter climbed while nobody read it, and the reading does not create the number.
         P-11: each period's caption is written by `F.run`, its counter by `F.set` at the same
         delay. No flow verb writes a standing tag's text, and the counter stays in a field.
CONTENT  Sources: Resource Management, cgroup v2, kernel cgroup v2 CPU files, CRI api.proto, runc,
         `opencontainers/cgroups/utils.go`.
         `35` is runc's quadratic `ConvertCPUSharesToCgroupV2Value` of 256 shares, never the
         Kubelet's linear `getCPUWeight` for Pod slices: re-derive it if the request changes. The
         runtime is never handed work. The quota kills nothing, but the latency can fail a liveness
         probe. cpu.stat holds on `spend`.
```
