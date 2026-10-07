## storage-detach-on-node-failure

### layout

```
WHAT     A Node goes NotReady and its Kubelet falls silent, so the old Pod cannot be confirmed dead
         and the volume is not detached: two Nodes would write one filesystem. A ladder walks the
         timeouts, and the out-of-service taint is the operator escape that declares the Node dead.
DEVIATES NET.L-01: the Pods are 168 wide (104 tall), since two 232 columns from LEFT_X 400 on the 16
         gap would centre on 640, off the 600 every tier holds.
         STO.L-02: the cylinder label sits at h/2 + 9.
         STO.L-03: CHIP_W 210, measured in the browser against wide-glyph values.
         STO.S-01: the field pins only the elements its steps move. It stays correct because the
         replay walks 0..n from a fresh build. Do not copy the shortcut, do not "fix" it either.
         L-13: the ladder takes one side of the floor and the chip strip the other, so the strip
         alone sits off 600. The escape box stands on the spine under the disk it acts on.
         A-05: the left attach lane carries no ball and stays a full-colour arrow like the right
         one, since a relation would make it the lesser half. Only opacity says which is live.
         The unconfirmed Pod gets no dim `unknown` state and the disk no flash on force-detach.
CONTENT  Sources: Node Shutdowns (v1.35).
         Replacement is a Deployment mechanism: `evict` names the Deployment, `escape` says a
         StatefulSet replacement cannot be created while the old Pod keeps the name.
         `Unless it is disabled in the controller manager` qualifies the 6 minute force detach.
         Rung 1 reads `old Pod marked`, not `deleted`: the deletion cannot be confirmed.
         `if instead the taint lands first` marks the escape step as a counterfactual (T-35).
```
