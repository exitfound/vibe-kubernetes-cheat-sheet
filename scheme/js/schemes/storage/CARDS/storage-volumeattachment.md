## storage-volumeattachment

### layout

```
WHAT     The attach and detach controller writes a VolumeAttachment, the external-attacher attaches
         and stamps status.attached true on it, Kubelet checks that field before the mount, and
         deleting the object is what triggers the detach.
DEVIATES STO.L-04: at 900x650 on `detach` the disk top sits 5.5 inside the panel and its caption
         lies under it. LEFT_X is already the panel wall and the disk has no other corner.
         STO.L-03: CHIP_W 258 is derived so the strip spans the content band. Keep its own formula.
         The first step takes no Pod pulse: it is the poster auto-play frame, and a blink there
         reads as a flicker.
         The disk stays at full after the detach: detached is the state the card opens on, at full.
         va-7f drops its light when its fade to the terminated shade ends, as on removeAt in
         storage-reclaim-policy.
CONTENT  Sources: VolumeAttachment API reference, kubernetes-csi external-attacher, Skip Attach,
         CSIDriver Object (v1.35), and the release-1.35 csi_attacher.go, csi_plugin.go,
         attach/detach reconciler, VolumeAttachment registry strategy, operation_generator.go.
         Only a driver that requires attach gets a VolumeAttachment, so the desc says so.
         status.attached `reads false because nothing has set it yet`, never `set to false`.
         Kubelet waits for the Node status listing, then checks the field. It watches neither.
         The controller deletes once Kubelet reports vol-1 unmounted. A finalizer holds the object.
```
