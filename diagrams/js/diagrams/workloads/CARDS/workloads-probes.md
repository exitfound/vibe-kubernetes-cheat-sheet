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
         P-05: background chip changes on `ready` (livenessProbe to passing), `liveness-fails` and
         `fresh-container` stay unlit and unnarrated. `lit` names what the step is about, and
         lighting a probe the narration does not name points the reader at the wrong chip.
CONTENT  Sources (v1.36): Probes concept page, Configure Probes task, Pod Lifecycle, EndpointSlices,
         Pod v1, prober worker.go, endpointslice utils.go. Keep the readinessGates clause and name
         no controller, kube-proxy or Service (T-21). The docs say a failed readiness probe removes
         the Pod IP, the code keeps it flagged ready=false, and the card follows the code. Readiness
         may run ahead of its period until the CONTAINER is Ready. The Kubelet kills, restartPolicy
         decides. restartCount carries over, never `never resets`. Probes that did not fail: `reset`.
OPEN     L-13: CENTRE reads the chip strip 140..450 at 295. Centred it crosses the probe lanes
         (L-10), and a full-width strip is the collision WL.L-05 refuses. The card centres on 600.
```
