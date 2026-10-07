## storage-multi-attach-error

### layout

```
WHAT     An RWO volume attaches to one Node at a time: a one-replica rollout starts the new Pod on
         Node-2 while the old one still holds the volume on Node-1, the attach and detach controller
         writes no second VolumeAttachment, and the new Pod hangs on `Multi-Attach error`.
DEVIATES NET.L-01: the Pods are 148 wide (104 tall), since two 232 Pods in padded frames from LEFT_X
         400 would centre the card on 676, off the 600 the chip strip sets.
         The VolumeAttachment row hangs left past LEFT_X: at its y it is below the panel, while the
         attach lanes stay right of 398 (VA_CX 420).
         The deadlock and closing steps animate nothing and take no block flash: neither side acts.
         The old Pod stays full until deleted. Node-2 and the request lane are absent at rest. va-2
         stays pending, unlit and laneless until the `attach` step writes it.
CONTENT  Sources: Deployments, strategy (v1.35), Persistent Volumes, access modes (v1.35).
         The deadlock needs one replica: default maxUnavailable rounds down to zero only there.
         Delete is a mark: va-1 reads `marked for deletion`, then goes with the detach.
         `attached: false` is the real two-beat VolumeAttachment state, not invented.
         `Node-1`, `Node-2` capitalised (T-06). `old Pod running`, not `still running`, fits.
         Node failure, force-detach and its clocks belong to storage-detach-on-node-failure.
```
