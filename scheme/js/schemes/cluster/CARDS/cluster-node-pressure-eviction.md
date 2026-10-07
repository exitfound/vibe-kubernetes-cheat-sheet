## cluster-node-pressure-eviction

### layout

```
WHAT     The Kubelet evicting under memory pressure: the threshold, the ranking, the kill, and the
         condition clearing after the transition period.
DEVIATES A-03: one lane to the API and no return. No step names anything coming back.
         L-11: the ladder tie leaves the Kubelet bottom at 612, not 600. On one x it reads as a
         branch off the SIGKILL lane.
         M-21: VICTIM_FADE is 1200, not FADE.out 700. At 700 the last 200 ms of the pulse play on a
         Pod already dark.
         S-17: `rank` declares `reducedLit` for the victim's inner box. `relieve` pulses two
         survivors with none, which is the category's house reading.
         P-05: `detect` lights `thresholdChip` though it never moves. The step is the comparison.
CONTENT  Sources: Node-pressure Eviction, Pod QoS Classes, Taints and Tolerations, Pod v1, kubelet
         `eviction/helpers.go`, `eviction_manager.go` and `kubelet.go` at release-1.35.
         The Kubelet respects no PodDisruptionBudget and no terminationGracePeriodSeconds. Phase
         Failed with reason Evicted, the reason from the source. `Eviction manager polls these stats
         every 10s` is the manager's own clock: never name housekeeping-interval. `5m`, not `5min`.
         `waits the 30s default`. QoS does not decide the ranking order.
```
