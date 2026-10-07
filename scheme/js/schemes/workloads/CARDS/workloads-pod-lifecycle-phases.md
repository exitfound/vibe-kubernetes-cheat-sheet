## workloads-pod-lifecycle-phases

### layout

```
WHAT     status.phase is a coarse summary field with two absorbing terminal states, so it says where
         a Pod is in its life and never whether the Pod is healthy.
DEVIATES WL.L-06: no LAYOUT preset, no node() frame and no chain. The phase is a field on the API
         object, a frame would make it read as a Node property, and the machine IS the sequence.
         WL.L-05: the chip strip is three UNEQUAL cells, 260 / 340 / 260 on 156..1044, because
         `container state` needs 317 and an equal strip clearing it would be 979 wide.
         S-42: Running is 150 tall against the 58 of the other states, because CrashLoopBackOff is
         drawn inside it. A `part.tune` moves the Running label to y 26, off the inner box.
         L-03: the machine sits inside the strip, so Pending starts at x 176 and clears the deepest
         panel only by ROW_CY 288. A tenth panel line on `crashloop` or `terminal` covers it.
         A-13: every lane and `fieldTag` stand at opacity 1 on every step. A lane draws a relation
         that stays true, and a per-step shade reads as an arrow flickering, never a phase.
         A-05: `edgeEnter` reads as the entry transition and carries no head. The entry belongs to
         `idle`, which draws nothing (S-09), so nothing rides it.
         L-11: `edgePendFail` leaves the Pending floor 30 right of its midpoint, which `edgeEnter`
         owns. It runs under Running because the panel covers the path over Pending.
CONTENT  Sources: Pod Lifecycle (Pod phase, Pod garbage collection), PodStatus API (v1.35), upstream
         getPhase, SyncPod. Pending holds `while any container is still waiting for its first
         start`: a crash-looping Waiting container counts as stopped. Running needs one `running`,
         never `started`. A terminal phase needs every container exited AND no restart owed. The
         aria-label says `drawn as a coarse state machine`, never that phase is one. The Pending to
         Failed edge is real. Never ends at Failed `with no container-level rule` (beta at 1.35).
```
