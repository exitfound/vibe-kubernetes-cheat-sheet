## storage-detach-on-node-failure

### layout

```
WHAT     A Node goes NotReady and its Kubelet falls silent, so the old Pod cannot be confirmed dead
         and the volume is not detached: a Pod that may still write could corrupt it. A ladder walks
         the waits: the Pod sticks in Terminating with no clock until kubectl force deletes it, and
         only then does the force-detach clock run. The out-of-service taint is the operator escape
         that declares the Node down.
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
CONTENT  Sources: Node Shutdowns, Taint-Based Evictions (v1.36), ADC reconciler and PodGC (v1.36.5).
         DOC-VS-CODE: the page times force detach from a deletion that "has not succeeded", the code
         from a volume no Pod object wants, so the 6 min clock starts once the Pod is force deleted.
         DOC-VS-CODE: the page allows the taint with NoSchedule, which deletes only terminating Pods.
         Deployment Pod names, since two Pods named web-0 cannot coexist. `evict` names the ReplicaSet.
         `if instead the taint lands first` marks the escape step as a counterfactual (T-35).
         `stuck` holds because IsPodTerminated stays false while container statuses read running.
         `forcedetach` draws the hand path, kubectl, and names PodGC after Node deletion in prose.
OPEN     CENTRE reads 400..1080 on 740, blind to the ladder and the strip (L-17), with which the card
         spans 60..1140. kubectl right of Node-2 is the one seat whose lane reaches the Node-1 top
         face over both frames crossing nothing, so the finding stays.
```
