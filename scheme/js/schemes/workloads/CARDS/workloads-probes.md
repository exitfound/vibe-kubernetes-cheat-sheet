## workloads-probes

### layout

```
WHAT     Three probes ask three independent questions of one container on three independent
         periods, startupProbe holds the other two shut until it passes, and the two failures do
         different things: liveness restarts the container, readiness only flips the endpoint.
DEVIATES WL.L-06: no LAYOUT preset. Three parallel probe lanes at 528 / 600 / 672, the chips left,
         and the band between them deliberately clear so the lanes read as three.
         WL.L-02: the Node frame is 920 wide on 140..1060, centred on CX. The chip column and the
         EndpointSlice align on its edges, and 820 leaves too little frame around the Pod.
         A-04: the probes are drawn per step, not all at once. The spine carries every probe
         outside `gate-opens`, and a relation never stands beside an arrowhead.
         P-05: background chip changes on `readiness-fails`, `liveness-fails` and
         `fresh-container` stay unlit. `lit` names what the step is about.
         L-08: `startup-gating` is a character budget at the panel limit. A step past about 320
         characters pays inside that step, never by moving the band.
CONTENT  Sources: Pod Lifecycle, Liveness Readiness and Startup Probes, Configure Probes,
         EndpointSlices, Pod v1, prober worker.go (v1.35). The `ready` step keeps the readinessGates
         clause. No controller, kube-proxy or Service is named (T-21): new connections stop reaching
         the endpoint. A not-ready endpoint is flagged ready=false, never removed. The
         Kubelet kills and restartPolicy decides what follows. restartCount carries over, never
         `never resets`. The two probes that did not fail read `reset` on the kill.
OPEN     L-13: CENTRE reads the chip strip 140..450 at 295. Centred it crosses the probe lanes
         (L-10), and a full-width strip is the collision WL.L-05 refuses. The card centres on 600.
         `fresh-container` narrates readiness passing with no readiness ball, the chip carries it.
         A readiness hop is a new route and a new duration, a design change.
```
