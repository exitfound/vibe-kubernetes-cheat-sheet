## workloads-poststart-prestop-hooks

### layout

```
WHAT     A container's two hook slots are not mirror images: postStart runs beside the ENTRYPOINT,
         which never waits for it, and preStop is waited for and spends the stop's own grace window.
DEVIATES WL.L-06: no LAYOUT preset. The card is an instrument (a container-lifetime rail in a wall)
         and draws neither a ladder nor a chip column.
         L-23: the frame is the instrument wall, not a Node. It floors 12 under the tick word
         baseline, its lowest register, and the two half captions ride the label baseline.
         A-09: the corridor leaves the Runtime, so the Runtime takes WL.CX and the Kubelet WL.R.
         The Kubelet is a CRI client and never touches the container.
         P-09: a workloads card on chipsCued, not chips. A rewound chip drops its cue with its
         value and the F.set lights it again on the arrival.
         Bars carry no number and both hook slots are SLOT_W 170: the card states order, not
         duration. drainBar is filled at a lower weight, never dashed (dashed means not yet run).
         The start half is named but not boxed: a box is this card's word for a bounded budget.
CONTENT  Sources: Container Lifecycle Hooks, Pod Lifecycle, LifecycleHandler v1, kubelet handlers.go
         (v1.36). postStart is concurrent, Running only after it returns. A hook failure kills, no
         hook timeout. After SIGTERM: `Running (draining)`. sleep carries no stage (stable 1.34),
         stopSignal off (alpha). Kubelet is the `hook runner` and READS the exit code. httpGet goes
         to the Pod IP `by default`. preStop holds the signal `until it returns or the window ends`,
         never `run to completion`.
         Doc vs code: the hooks page says kubelet runs tcpSocket, handlers.go rejects it as invalid.
```
