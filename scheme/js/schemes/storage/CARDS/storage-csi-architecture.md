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
CONTENT  Sources: kubernetes-csi book (deploying, the four controller sidecar pages,
         node-driver-registrar), pluginwatcher README, CSI spec, Volumes, Persistent Volumes,
         DaemonSet (v1.35), kubelet csi_mounter.go, csi_block.go, csi_attacher.go.
         `the driver, not the sidecar, speaks to the cloud API`, never `the only part`. Sidecars
         issue `gRPC calls`, not one call. `sidecars as needed`, never a fixed four.
         Mount claims are scoped to a FILESYSTEM volume: Kubelet maps a Block volume itself.
         `NodePublishVolume, after NodeStageVolume if the driver stages`. `every eligible Node`.
OPEN     The `NodePublish` tag crosses Kubelet's top-right corner for its first 34 units: clearing
         it needs ASK_DY near 30, which lifts Kubelet off the row to 28 under the apiserver.
```
