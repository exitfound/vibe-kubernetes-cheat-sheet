# Scheme card design notes: storage

One record per card in `./CARDS/<id>.md`, in the form `scheme/CANON.md` gives under "The record
vocabulary": what the code and the rules cannot say. The index below is in grid order (`D-10`).
It carries no `## ` heading, since `unit/docs.test.mjs` reads every `## ` as a card id.

**Volume Foundations**

- [`storage-volume-model`](./CARDS/storage-volume-model.md)
- [`storage-where-volume-data-lives`](./CARDS/storage-where-volume-data-lives.md)
- [`storage-container-filesystem`](./CARDS/storage-container-filesystem.md)
- [`storage-emptydir`](./CARDS/storage-emptydir.md)
- [`storage-hostpath`](./CARDS/storage-hostpath.md)
- [`storage-configmap-secret-mount`](./CARDS/storage-configmap-secret-mount.md)
- [`storage-downward-api-volume`](./CARDS/storage-downward-api-volume.md)
- [`storage-projected-volume`](./CARDS/storage-projected-volume.md)
- [`storage-image-volume`](./CARDS/storage-image-volume.md)
- [`storage-subpath`](./CARDS/storage-subpath.md)
- [`storage-ephemeral-storage-eviction`](./CARDS/storage-ephemeral-storage-eviction.md)
- [`storage-recursive-readonly`](./CARDS/storage-recursive-readonly.md)

**Volumes & Claims**

- [`storage-pvc-binding`](./CARDS/storage-pvc-binding.md)
- [`storage-default-storageclass`](./CARDS/storage-default-storageclass.md)
- [`storage-dynamic-provisioning`](./CARDS/storage-dynamic-provisioning.md)
- [`storage-access-modes`](./CARDS/storage-access-modes.md)
- [`storage-filesystem-vs-block`](./CARDS/storage-filesystem-vs-block.md)
- [`storage-volume-binding-mode`](./CARDS/storage-volume-binding-mode.md)
- [`storage-csi-capacity-tracking`](./CARDS/storage-csi-capacity-tracking.md)
- [`storage-volume-expansion`](./CARDS/storage-volume-expansion.md)
- [`storage-pvc-protection`](./CARDS/storage-pvc-protection.md)
- [`storage-reclaim-policy`](./CARDS/storage-reclaim-policy.md)
- [`storage-pv-lifecycle-phases`](./CARDS/storage-pv-lifecycle-phases.md)
- [`storage-pv-reservation`](./CARDS/storage-pv-reservation.md)

**CSI & Mount Path**

- [`storage-csi-architecture`](./CARDS/storage-csi-architecture.md)
- [`storage-csidriver`](./CARDS/storage-csidriver.md)
- [`storage-attach-mount-chain`](./CARDS/storage-attach-mount-chain.md)
- [`storage-volumeattachment`](./CARDS/storage-volumeattachment.md)
- [`storage-mount-propagation`](./CARDS/storage-mount-propagation.md)
- [`storage-csi-ephemeral-volume`](./CARDS/storage-csi-ephemeral-volume.md)
- [`storage-fsgroup-ownership`](./CARDS/storage-fsgroup-ownership.md)
- [`storage-volume-attach-limits`](./CARDS/storage-volume-attach-limits.md)
- [`storage-multi-attach-error`](./CARDS/storage-multi-attach-error.md)
- [`storage-detach-on-node-failure`](./CARDS/storage-detach-on-node-failure.md)

**Stateful Data**

- [`storage-volumeclaimtemplates`](./CARDS/storage-volumeclaimtemplates.md)
- [`storage-pvc-retention-policy`](./CARDS/storage-pvc-retention-policy.md)
- [`storage-generic-ephemeral-volume`](./CARDS/storage-generic-ephemeral-volume.md)
- [`storage-volume-snapshot`](./CARDS/storage-volume-snapshot.md)
- [`storage-pvc-clone`](./CARDS/storage-pvc-clone.md)
