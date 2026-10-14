## workloads-pod-lifecycle-phases

### layout

```
WHAT     status.phase is a coarse summary field with two absorbing terminal states, so it says where
         a Pod is in its life and never whether the Pod is healthy.
DEVIATES WL.L-05: the chip strip is three UNEQUAL cells, 260 / 340 / 260 on 156..1044, because
         `container state` needs 317 and an equal strip clearing it would be 979 wide.
         S-42: Running is 150 tall against the 58 of the other states, because CrashLoopBackOff is
         drawn inside it. A `part.tune` moves the Running label to y 26, off the inner box.
         A-13: every lane, `fieldTag` and `backTag` stand at opacity 1 on every step. A lane draws a
         relation that stays true, and a per-step shade reads as an arrow flickering, never a phase.
         A-05: `edgeEnter` reads as the entry transition and carries no head. The entry belongs to
         `idle`, which draws nothing (S-09), so nothing rides it.
         L-11: `edgePendFail` leaves the Pending floor 30 right of its midpoint, which `edgeEnter`
         owns. It runs under Running because the panel covers the path over Pending.
CONTENT  Sources: Pod Lifecycle (phase, restart rules), PodStatus API, getPhase, KEP 5532 (v1.36).
         Pending holds while one is `still waiting for its first start`. Running needs `running`,
         not `started`. Terminal: all exited AND no restart owed. Aria: `a coarse state machine`.
         Pending to Failed is real. `no container-level override`, never `rule`: restartPolicy too.
         Never `whatever happens inside it`: a RestartAllContainers rule can send Running to
         Pending. `edgeBack`: a restartPolicyRules action, gate Beta and on in 1.36. `can`, not
         `does`.
         Doc vs code: the page still describes Unknown, the PodPhase type deprecates it since 1.22.
```
