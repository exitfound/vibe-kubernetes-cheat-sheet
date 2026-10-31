## workloads-poststart-prestop-hooks

### layout

```
WHAT     A container's two hook slots are not mirror images: postStart runs beside the ENTRYPOINT,
         which never waits for it, and preStop is waited for and spends the stop's own grace window.
DEVIATES L-23: the frame is the instrument wall, not a Node. It floors 12 under the tick word
         baseline, its lowest register, and the two half captions ride the label baseline.
CONTENT  Sources: Container Lifecycle Hooks, Pod Lifecycle, LifecycleHandler v1, kubelet handlers.go
         (v1.36). postStart is concurrent, Running only after it returns. A hook failure kills, no
         hook timeout. After SIGTERM: `Running (draining)`. sleep has no stage, stopSignal is off
         (alpha). Kubelet is the `hook runner`, READS the exit code, runs both hooks over ExecSync:
         the preStop chip is `running (exec)`, never `(sync)`. httpGet hits the Pod IP `by default`.
         preStop holds the signal `until it returns or the window ends`, never `run to completion`.
         Doc vs code: the hooks page says kubelet runs tcpSocket, handlers.go rejects it as invalid.
```
