## cluster-graceful-node-shutdown

### layout

```
WHAT     systemd telling the Kubelet a shutdown is coming, and the Kubelet spending the grace budget
         in two buckets, regular Pods then critical ones.
DEVIATES L-08a: CHIP_X is 620, not LAYOUT.A.chips 660. The 540..620 corridor carries the drop to the
         Node and crosses nothing.
CONTENT  Sources (v1.36): Graceful Node Shutdown, KEP 2000, systemd inhibitor locks, and kubelet
         nodeshutdown, nodestatus, kuberuntime, nodelifecycle at v1.36.0. Lock predates the signal.
         Triggers are poweroff, reboot, halt, never hibernate. Windows are ceilings, 60 less 20.
         `reason node is shutting down` is ruled out: the page says reason, the code writes reason
         KubeletNotReady with that text as message. Killing starts with the status write (`As it
         sets`), preStop runs inside the window, a group ends on kill plus unmount or its timer.
```
