## storage-attach-mount-chain

### layout

```
WHAT     The up to four gRPC calls between a claim and a writable /data, as a numbered ladder on the
         left beside the topology they act on, which the last step takes down again bottom-up.
DEVIATES STO.L-04: at 900x650 the CSI controller stands behind the panel on every step. The ladder
         fills the left column below it, and moving it right puts every block in the right half.
         NET.L-01: the staging band is sized by the node's inner width (484 by 58), since one mount
         there serves every Pod on the node. The ladder rungs run the full column width on purpose.
         STO.L-03: CHIP_W 258 is solved from the content width. Keep its own formula.
         WL.A-03: the attach lane crosses the Node frame face to the device, since the disk becomes
         a device on the node.
         C-14: a Node-side block or Pod not there yet is not drawn rather than dimmed, and a Pod
         arrives at full: a dim Pod for three steps reads as broken, not pending.
         M-03: no container box lights on arrival, or /data stays outlined after the blink.
         The unwind step sends no ball: each rung lights with the fade it names, one per 1000ms.
         The ownership line from the node plugin to the staging band carries no ball and no head.
CONTENT  Sources: CSI spec, kubernetes-csi CSIDriver Object and external-attacher (v1.35), kubelet
         csi_attacher.go and csi_plugin.go.
         Every call but NodePublishVolume is conditional, so `up to four gRPC calls`, never `four`.
         `Here that is a cloud API call`: a CSI backend need not be a cloud. `if still blank`.
         The staging directory exists only from `stage` to `unwind`: Kubelet creates and deletes it.
         The publish bind is the usual path, not the spec, so `usually` bind-mounts.
```
