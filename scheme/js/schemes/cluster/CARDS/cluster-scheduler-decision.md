## cluster-scheduler-decision

### layout

```
WHAT     One scheduling cycle: watch, filter, score, bind, and the Kubelet on the chosen Node
         picking the Pod up, the write reaching it over two lanes.
DEVIATES L-08a: the value-chip column is 270 wide, not the 480 of LAYOUT.A. The last 210 units are
         the only channel from the control-plane band down to the Kubelet and Node-4.
         L-03: JOG_Y is 190, not the 180 band midpoint. On 180 the left leg runs behind the panel,
         and the Kubelet leg already sits on 190.
         S-11: `reset` carries `keys` and no `pods` list. `clearPodHighlight` would wipe the inline
         strokes the placed Pod's final look depends on.
         The Kubelet to Node-4 drop carries a ball and no wire label: the Pod appearing is the
         sentence, and a caption in the 90 units between the blocks crowds the arrival.
CONTENT  Sources: Kube-scheduler, Scheduling Framework, `kube-scheduler/framework/interface.go`.
         Node-2 reads `mem unreserved 200Mi`, never `mem free`: Fit sums requests against
         Allocatable. `the weighted sum of all of them ranks the Nodes`: TotalScore has no 0 to 100
         ceiling. `filter` names percentageOfNodesToScore, so the desc says `the Nodes`, never
         `every Node`. The Kubelet on Node-4 watches, a Node does not. Row 2 keeps `fail
         predicates` as cluster-pod-priority-preemption does. The `aria-label` names the Kubelet.
```
