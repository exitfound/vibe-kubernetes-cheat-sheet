## storage-csi-architecture

### layout

```
WHAT     The CSI component map, left to right as core, bridge, vendor and machine, with the
         controller plugin and the node plugin (a DaemonSet) drawn as two frames.
DEVIATES STO.L-05: the four sidecars are 144 / 172 / 134 / 204 by 80, solved to one span inside the
         controller frame, since four at 232 need 928 against an inner span of 696.
         STO.L-03: CHIP_W 258 is derived so the strip spans the content band. Keep its own formula.
         M-01: no Pod on the card, nothing pulses. core, controller and bridge are mute on purpose.
CONTENT  Sources (v1.36): kubernetes-csi book (deploying, sidecar pages), Volumes, code v1.36.5
         pkg/volume/csi, pluginmanager, pv_controller.go. Sidecars on k8s.io 0.36: provisioner
         v6.3.0, attacher v4.12.0, resizer v2.2.1, snapshotter v8.6.0, registrar v2.17.0 (newer
         builds on 0.37). `typically` two halves. Sidecars `optional but recommended`, `as
         needed`, never a fixed four. Provisioner keys on the storage-provisioner annotation, never
         `sees a Pending PVC`. `The driver, not the sidecar` calls the cloud. Mount claims scoped
         to FILESYSTEM. Stage `if the driver stages`.
```
