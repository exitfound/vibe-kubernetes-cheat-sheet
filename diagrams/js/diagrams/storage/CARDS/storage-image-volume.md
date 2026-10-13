## storage-image-volume

### layout

```
WHAT     An image volume puts a second OCI image, model weights llm:v1, into the Pod as one
         read-only directory: Kubelet has the runtime resolve it by pullPolicy at Pod startup, it
         is pulled like a container image, and the app container waits for it. Two frames, the
         Registry and the Node, and the volume is a box, since an image is not a disk.
DEVIATES L-11: the pull lane runs frame face to frame face on the shared midline, touching no inner
         block. It is traffic between two places, and the lit llm:v1 and its tag say which image.
CONTENT  Sources (release-1.36, v1.36.5): Volumes (image), Image Volumes, Images, kubelet
         kuberuntime_manager.go, image_manager.go. ImageVolume GA, locked on. "asks the container
         runtime to resolve it": resolve and PullImage are two calls. It mounts in CreateContainer,
         always read-only, no noexec claimed. A failure holds only the containers mounting it, with
         backoff. IfNotPresent reuse keeps the KubeletEnsureSecretPulledImages credential exception.
         DOC-VS-CODE: the page says a failed pull sets the Pod Failed, v1.36.5 retries with backoff.
```
