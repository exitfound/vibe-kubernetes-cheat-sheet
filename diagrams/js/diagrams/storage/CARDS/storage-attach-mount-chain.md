## storage-attach-mount-chain

### layout

```
WHAT     The up to four gRPC calls between a claim and a writable /data, as a numbered ladder on the
         left beside the topology they act on, which the last step takes down again bottom-up.
DEVIATES STO.L-03: CHIP_W 258 is solved from the content width. Keep its own formula.
         WL.A-03: the attach lane crosses the Node frame face to the device, since the disk becomes
         a device on the node.
         C-14: a Node-side block or Pod not there yet is not drawn rather than dimmed, and a Pod
         arrives at full: a dim Pod for three steps reads as broken, not pending.
CONTENT  Sources (1.36): CSI spec v1.13.0, volumes.md, external-attacher v4.12.0, v1.36.5
         csi_attacher.go, csi_mounter.go, attach and detach reconciler. `up to four gRPC calls`,
         never `four`: all but NodePublishVolume are conditional. `Here that is a cloud API call`,
         `if still blank`. NodeStage is `the first of two Node calls`: NodeGetCapabilities
         precedes it. Kubelet creates and deletes the staging dir. `usually` a bind mount. fsGroup
         only `may` change, the driver can own it. Detach waits for unmount only `On a healthy
         Node`: force detach and out-of-service skip it.
```
