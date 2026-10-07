## cluster-graceful-node-shutdown

### layout

```
WHAT     systemd telling the Kubelet a shutdown is coming, and the Kubelet spending the grace budget
         in two buckets, regular Pods then critical ones.
DEVIATES L-08a: CHIP_X is 620, not LAYOUT.A.chips 660. The 540..620 corridor carries the drop to the
         Node and crosses nothing.
         The chip column hangs off LADDER_BOTTOM 450, not LADDER_Y. Four chips cannot fill 250..450
         on the house gap, and the bottom is the edge the Node frame answers to.
CONTENT  Sources: Graceful Node Shutdown, KEP 2000, systemd inhibitor locks, the kubelet
         nodeshutdown manager.
         The lock is held before the signal (`while already holding`). Triggers are poweroff, reboot
         and halt, never hibernate. Both windows are ceilings, `await up to`, cut from one budget,
         60 less 20. Step 2 is `condition`, never cordon, and rejects even Pods tolerating the
         not-ready taint. `at or above` 2e9 is exact.
```
