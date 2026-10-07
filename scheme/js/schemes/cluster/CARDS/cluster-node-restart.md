## cluster-node-restart

### layout

```
WHAT     What a Node reboot destroys and what comes back on its own, against the two restarts it is
         confused with: three Pods in one frame, and three different fates.
DEVIATES L-08a: five ladder rows for six narrated steps. Six rows push the second chip row to 646,
         so steps 5 and 6 share row 5, the row that states both fates.
         M-08: no fade-out on this card carries a pulse. A reboot signals nobody, and a DELETE
         landing on a machine that is off reaches nothing that answers.
         C-09: the reboot Pods rest at notready, never terminated. The objects stay bound, which is
         why the Kubelet has something to recreate.
         T-21: the network is named on step 3 and row 3 and not drawn. It is a readiness condition,
         not an actor.
         The Node frame never fades: the machine is there while it is off.
CONTENT  Sources: What Happens After A Node Restart, Nodes, Static Pods, the Node Taints reference.
         The runtime chip reads `containers usually stay up`, and step 1 and the `aria-label` keep
         the hedge (T-20, T-28). Heartbeats pause `until the Kubelet is back and has finished
         initializing`. The chip reads `heartbeats paused`, never `Unknown`. The taint carries
         `:NoExecute`. The toleration period has no number here. The sublabel names the direct
         owner, `ReplicaSet web-7d4`. The chip is `Node condition`, not `Ready` (T-13).
```
