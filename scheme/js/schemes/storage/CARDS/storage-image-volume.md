## storage-image-volume

### layout

```
WHAT     An image volume puts a second OCI image, model weights llm:v1, into the Pod as one
         read-only directory: Kubelet has the runtime resolve it by pullPolicy at Pod startup, it
         is pulled like a container image, and the app container waits for it. Two frames, the
         Registry and the Node, and the volume is a box, since an image is not a disk.
DEVIATES L-11: the pull lane runs frame face to frame face on the shared midline, touching no inner
         block. It is traffic between two places, and the lit llm:v1 and its tag say which image.
CONTENT  Sources: Volumes (image), Image Volumes, ImageVolume feature gate (v1.36), KEP 4639,
         kubelet kuberuntime_manager.go. The card is on 1.36, where the gate is stable and on.
         Kubelet "asks the container runtime to resolve it": resolve and PullImage are two calls.
         "As Kubelet creates the app container, the runtime mounts": it mounts in CreateContainer.
         "The app container, which mounts it, would not start", not "no container would start".
         Re-resolution carries the IfNotPresent qualifier. No noexec and no Failed phase claimed.
```
