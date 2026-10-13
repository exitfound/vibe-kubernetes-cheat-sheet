## storage-volumeattachment

### layout

```
WHAT     The attach and detach controller writes a VolumeAttachment, the external-attacher attaches
         and stamps status.attached true on it, Kubelet checks that field before the mount, and
         deleting the object is what triggers the detach.
DEVIATES STO.L-03: CHIP_W 258 is derived so the strip spans the content band. Keep its own formula.
         The first step takes no Pod pulse: it is the poster auto-play frame, and a blink there
         reads as a flicker.
         The disk stays at full after the detach: detached is the state the card opens on, at full.
         csi-7f3a drops its light when its fade to the terminated shade ends, as on removeAt in
         storage-reclaim-policy.
CONTENT  Sources (1.36): VolumeAttachment API, external-attacher v4.12.0, Skip Attach, Node shutdown
         v1.36.5 csi_attacher.go, csi_plugin.go, ADC reconciler and populator, scheduler csi.go.
         Kubelet refuses to attach CSI, so `not Kubelet` is scoped to CSI. Name: csi plus sha256.
         Finalizer added before ControllerPublish. No publish capability: marked attached, no call.
         status.attached `reads false because nothing has set it yet`. Kubelet GETs, never watches.
         Detach waits for unmount on a healthy Node only: 6 min unhealthy or out-of-service forces.
```
