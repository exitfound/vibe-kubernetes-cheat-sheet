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
CONTENT  Sources (v1.36): What Happens After A Node Restart, Nodes, Node Status, Static Pods, Node
         Taints, Taint-Based Evictions, Graceful Node Shutdown, node-lifecycle code at v1.36.0. The
         restart page says `not-ready` for a Node down too long, the code and Taint-Based Evictions
         say `unreachable`: the card follows the code. "untouched" is ruled out: graceful shutdown,
         when on, marks Pods Terminated. The DELETE never "evicts", the Pod is `marked for deletion`,
         never "gone". `usually` stays (T-20). Pod `web-7d4-x2k9p`, chip `Node condition` (T-13).
```
