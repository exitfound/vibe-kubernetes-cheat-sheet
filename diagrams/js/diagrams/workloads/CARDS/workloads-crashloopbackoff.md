## workloads-crashloopbackoff

### layout

```
WHAT     The delay the Kubelet inserts before each restart, drawn as a bar that doubles until it
         flattens against the 300s ceiling, and the healthy run that puts the next crash back at
         10s.
DEVIATES WL.L-06: no LAYOUT preset. The subject is a quantity, so it is an instrument over a Node
         floor, with the chips 98..540 and the bars 580..1102.
         WL.L-02: the frame is 98..1102, sized off the instrument and centred on CX. Nine bars on a
         58 pitch end on 1102 with the axis, the ceiling and the frame edge.
         L-23: the frame top stays 22 under the axis captions at 418, so the Pod moves down inside
         it to take the 34 band rather than the frame moving up.
         WL.A-03: the Kubelet sits inside the frame and no lane crosses its edge. The backoff and
         its cap are per-node kubelet state.
         A-06: the restart lane stays empty on `backoff-named`, `doubling` and `cap`. Those steps
         are the Kubelet holding the restart off, so a ball would claim it happened.
CONTENT  Sources: Pod Lifecycle (container restarts), Feature Gates, kubelet.go, flowcontrol backoff
         (v1.36). The first restart is immediate. Each restart arms the next delay, so a crash never
         `doubles` it. restartCount is restarts done: 2 on `backoff-named`, 8 on `reset`. 300s is
         a per-node default and the upper bound: `a default 5 minute cap`, never a flat ceiling. A
         reset makes the next crash a first one, `restarted at once`, never `starts over at 10s`.
         The page calls KubeletCrashLoopBackOffMax alpha, the code has it Beta, on, since 1.35.
OPEN     L-13: CENTRE reads the chip strip 98..540 at 319. The bars are naked rects, and a strip
         straddling 600 under the panel is the collision shape WL.L-05 refuses.
```
