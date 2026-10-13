## storage-csi-architecture

### layout

```
WHAT     The CSI component map, left to right as core, bridge, vendor and machine, with the
         controller plugin and the node plugin (a DaemonSet) drawn as two frames.
DEVIATES NET.L-01: the four sidecars are 144 / 172 / 134 / 204 by 80, solved to one span inside the
         controller frame, since four at 232 need 928 against an inner span of 696.
         NET.L-01: the disk is 88 by 116, flush to the right margin beside the matched 140 gutters.
         STO.L-04: at 900x650 the apiserver top sits 7.9 inside the panel, its label clear by 16.7.
         STO.L-03: CHIP_W 258 is derived so the strip spans the content band. Keep its own formula.
         STO.S-01: no opacity field, no step changes an element's opacity.
         M-01: no Pod on the card, nothing pulses. core, controller and bridge are mute on purpose.
         The plugins are dashed frames labelled by their controller, never pod() shells.
         The bus the three sidecars share into the driver carries no ball and so no arrowhead.
CONTENT  Sources (v1.36): kubernetes-csi book (deploying, sidecar pages), Volumes, code v1.36.5
         pkg/volume/csi, pluginmanager, pv_controller.go. Sidecars on k8s.io 0.36: provisioner v6.3.0,
         attacher v4.12.0, resizer v2.2.1, snapshotter v8.6.0, registrar v2.17.0 (newer builds on 0.37).
         `typically` two halves. Sidecars `optional but recommended`, `as needed`, never a fixed four.
         Provisioner keys on the storage-provisioner annotation, never `sees a Pending PVC`. `The driver,
         not the sidecar` calls the cloud. Mount claims scoped to FILESYSTEM. Stage `if the driver stages`.
```
